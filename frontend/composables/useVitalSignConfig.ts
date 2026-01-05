import { Timestamp } from "firebase/firestore";

// 生命徵象欄位定義
export interface VitalSignField {
  key: string;              // 欄位識別碼
  label: string;            // 顯示名稱
  enabled: boolean;         // 是否啟用
  unit: string;             // 單位
  order: number;            // 顯示順序
  icon: string;             // PrimeIcon 名稱
  color: string;            // 主題色
  required: boolean;        // 是否必填
  min: number | null;       // 最小值
  max: number | null;       // 最大值
  thresholdMin: number | null;  // 警戒最小值
  thresholdMax: number | null;  // 警戒最大值
  inputType: string;        // 輸入類型
  step: number | null;      // 步進值
  category: 'vital' | 'physical';  // 分類
}

// 生命徵象設定
export interface VitalSignConfig {
  vitalSignFields: VitalSignField[];
  updatedAt?: any;
  updatedBy?: string;
  updatedByName?: string;
  createdAt?: any;
  version: number;
}

// 預設設定
const DEFAULT_CONFIG: VitalSignConfig = {
  vitalSignFields: [
    {
      key: "weight",
      label: "體重",
      enabled: true,
      unit: "kg",
      order: 1,
      icon: "pi-chart-bar",
      color: "purple",
      required: false,
      min: 0,
      max: 300,
      thresholdMin: null,
      thresholdMax: null,
      inputType: "number",
      step: 0.1,
      category: "vital"
    },
    {
      key: "systolic",
      label: "收縮壓",
      enabled: true,
      unit: "mmHg",
      order: 2,
      icon: "pi-arrow-up",
      color: "blue",
      required: false,
      min: 50,
      max: 250,
      thresholdMin: 90,
      thresholdMax: 140,
      inputType: "number",
      step: 1,
      category: "vital"
    },
    {
      key: "diastolic",
      label: "舒張壓",
      enabled: true,
      unit: "mmHg",
      order: 3,
      icon: "pi-arrow-down",
      color: "blue",
      required: false,
      min: 30,
      max: 150,
      thresholdMin: 60,
      thresholdMax: 90,
      inputType: "number",
      step: 1,
      category: "vital"
    },
    {
      key: "pulse",
      label: "脈搏",
      enabled: true,
      unit: "次/分",
      order: 4,
      icon: "pi-heart",
      color: "red",
      required: false,
      min: 30,
      max: 200,
      thresholdMin: 60,
      thresholdMax: 100,
      inputType: "number",
      step: 1,
      category: "vital"
    },
    {
      key: "bloodOxygen",
      label: "血氧",
      enabled: true,
      unit: "%",
      order: 5,
      icon: "pi-percentage",
      color: "red",
      required: false,
      min: 0,
      max: 100,
      thresholdMin: 95,
      thresholdMax: 100,
      inputType: "number",
      step: 1,
      category: "vital"
    },
    {
      key: "temperature",
      label: "體溫",
      enabled: false,
      unit: "°C",
      order: 6,
      icon: "pi-sun",
      color: "orange",
      required: false,
      min: 30,
      max: 45,
      thresholdMin: 36,
      thresholdMax: 37.5,
      inputType: "number",
      step: 0.1,
      category: "vital"
    },
    {
      key: "bloodSugar",
      label: "血糖",
      enabled: false,
      unit: "mg/dL",
      order: 7,
      icon: "pi-bolt",
      color: "green",
      required: false,
      min: 0,
      max: 600,
      thresholdMin: 70,
      thresholdMax: 140,
      inputType: "number",
      step: 1,
      category: "vital"
    },
    {
      key: "height",
      label: "身高",
      enabled: true,
      unit: "cm",
      order: 8,
      icon: "pi-arrows-v",
      color: "indigo",
      required: false,
      min: 0,
      max: 250,
      thresholdMin: null,
      thresholdMax: null,
      inputType: "number",
      step: 0.1,
      category: "physical"
    }
  ],
  version: 1
};

export const useVitalSignConfig = () => {
  const { getDocument, setDocument, updateDocument, addDocument } = useFirestore();
  const { userProfile } = useAuth();

  // 快取設定
  const config = useState<VitalSignConfig | null>('vitalSignConfig', () => null);
  const loading = useState('vitalSignConfigLoading', () => false);

  // 取得設定
  const fetchConfig = async (): Promise<VitalSignConfig> => {
    loading.value = true;
    try {
      const doc = await getDocument('systemSettings', 'vitalSignsConfig');
      config.value = doc as VitalSignConfig || DEFAULT_CONFIG;
      return config.value;
    } catch (error) {
      console.warn('設定不存在，使用預設值');
      config.value = DEFAULT_CONFIG;
      return config.value;
    } finally {
      loading.value = false;
    }
  };

  // 更新設定（僅管理員）
  const updateConfig = async (newConfig: VitalSignConfig): Promise<void> => {
    const configData = {
      ...newConfig,
      updatedAt: Timestamp.now(),
      updatedBy: userProfile.value?.id,
      updatedByName: userProfile.value?.displayName || userProfile.value?.email
    };

    try {
      await setDocument('systemSettings', 'vitalSignsConfig', configData);
      config.value = configData;
    } catch (error) {
      console.error('更新設定失敗:', error);
      throw error;
    }
  };

  // 初始化設定（首次使用時）
  const initializeConfig = async (): Promise<void> => {
    try {
      const existingConfig = await getDocument('systemSettings', 'vitalSignsConfig');
      if (!existingConfig) {
        const initialConfig = {
          ...DEFAULT_CONFIG,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          updatedBy: userProfile.value?.id,
          updatedByName: userProfile.value?.displayName || userProfile.value?.email
        };
        await setDocument('systemSettings', 'vitalSignsConfig', initialConfig);
        config.value = initialConfig;
        console.log('✅ 設定初始化完成');
      }
    } catch (error) {
      console.error('初始化設定失敗:', error);
      throw error;
    }
  };

  // 檢查欄位是否啟用
  const isFieldEnabled = (fieldKey: string): boolean => {
    const field = config.value?.vitalSignFields.find(f => f.key === fieldKey);
    return field?.enabled ?? false;
  };

  // 取得欄位設定
  const getFieldConfig = (fieldKey: string): VitalSignField | undefined => {
    return config.value?.vitalSignFields.find(f => f.key === fieldKey);
  };

  // 已啟用的欄位（依 order 排序）
  const enabledFields = computed(() => {
    return config.value?.vitalSignFields
      .filter(f => f.enabled)
      .sort((a, b) => a.order - b.order) ?? [];
  });

  // 已啟用的生命徵象欄位
  const enabledVitalSignFields = computed(() => {
    return enabledFields.value.filter(f => f.category === 'vital');
  });

  // 已啟用的身體測量欄位
  const enabledPhysicalFields = computed(() => {
    return enabledFields.value.filter(f => f.category === 'physical');
  });

  // 取得欄位驗證規則
  const getFieldValidation = (fieldKey: string) => {
    const field = getFieldConfig(fieldKey);
    if (!field) return null;

    return {
      required: field.required,
      min: field.min,
      max: field.max,
      step: field.step
    };
  };

  // 檢查數值是否異常（超出警戒值）
  const isValueAbnormal = (fieldKey: string, value: number | null | undefined): boolean => {
    const field = getFieldConfig(fieldKey);
    if (!field || !value) return false;

    const numValue = Number(value);
    if (isNaN(numValue)) return false;

    if (field.thresholdMin !== null && numValue < field.thresholdMin) return true;
    if (field.thresholdMax !== null && numValue > field.thresholdMax) return true;
    return false;
  };

  // 取得預設設定（用於匯出範本）
  const getDefaultConfig = (): VitalSignConfig => {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  };

  // 初始化（首次載入時呼叫）
  if (!config.value && !loading.value) {
    fetchConfig();
  }

  return {
    config,
    loading,
    fetchConfig,
    updateConfig,
    initializeConfig,
    isFieldEnabled,
    getFieldConfig,
    enabledFields,
    enabledVitalSignFields,
    enabledPhysicalFields,
    getFieldValidation,
    isValueAbnormal,
    getDefaultConfig
  };
};
