import { where, orderBy, limit, Timestamp } from "firebase/firestore";

// 生理期紀錄類型定義
export interface MenstrualRecord {
  id?: string;
  // 基本資料
  clientId: string;
  clientName: string;
  classId?: string;
  startDate: any;           // 生理期開始日期
  endDate?: any;            // 結束日期（可補填）
  cycleDays?: number;       // 週期天數（自動計算）

  // 經期狀況
  flowAmount: string;       // 經血量
  painLevel: string;        // 腹痛程度
  accompanyingSymptoms: string[]; // 伴隨症狀（多選）
  specialConditions: string[];    // 特別狀況（多選）

  // 備註
  notes?: string;
  usedPainkiller?: boolean;     // 是否服用止痛藥
  affectedActivities?: boolean; // 是否影響活動

  // 記錄資訊
  recordedBy: string;
  recordedByName: string;

  createdAt?: any;
  updatedAt?: any;
}

// 經血量選項
export const FLOW_AMOUNT_OPTIONS = [
  { label: "少量", value: "light", description: "一天 1-2 片" },
  { label: "中等", value: "medium", description: "一天 2-4 片" },
  { label: "多量", value: "heavy", description: "一天 4 片以上、需夜用" },
];

// 腹痛程度選項
export const PAIN_LEVEL_OPTIONS = [
  { label: "無", value: "none", severity: "success" },
  { label: "輕微", value: "mild", severity: "info", description: "不影響活動" },
  { label: "中度", value: "moderate", severity: "warn", description: "需休息" },
  { label: "重度", value: "severe", severity: "danger", description: "需止痛藥" },
];

// 伴隨症狀選項
export const MENSTRUAL_SYMPTOM_OPTIONS = [
  { label: "頭痛", value: "headache" },
  { label: "想吐", value: "nausea" },
  { label: "腰痛", value: "back_pain" },
  { label: "情緒波動", value: "mood_swing" },
  { label: "臉色蒼白", value: "pale" },
  { label: "倦怠嗜睡", value: "fatigue" },
  { label: "乳房脹痛", value: "breast_pain" },
  { label: "腹瀉", value: "diarrhea" },
];

// 特別狀況選項
export const SPECIAL_CONDITION_OPTIONS = [
  { label: "經期不規則", value: "irregular", description: "週期異常" },
  { label: "經血過多", value: "heavy_flow", description: "< 2 小時就濕透" },
  { label: "出血超過 7-10 天", value: "prolonged", description: "經期過長" },
  { label: "中途停又再來", value: "intermittent", description: "不連續出血" },
  { label: "血塊過多", value: "clots", description: "大量血塊" },
  { label: "非經期出血", value: "spotting", description: "異常出血" },
];

export const useMenstrualRecords = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();
  const { userProfile } = useAuth();

  // 取得生理期紀錄列表
  const getMenstrualRecords = async (filters?: {
    clientId?: string;
    classId?: string;
    startDate?: Date;
    endDate?: Date;
    limitCount?: number;
  }) => {
    const constraints: any[] = [orderBy("startDate", "desc")];

    if (filters?.clientId) {
      constraints.unshift(where("clientId", "==", filters.clientId));
    }
    if (filters?.classId) {
      constraints.unshift(where("classId", "==", filters.classId));
    }
    if (filters?.startDate) {
      constraints.push(where("startDate", ">=", Timestamp.fromDate(filters.startDate)));
    }
    if (filters?.endDate) {
      constraints.push(where("startDate", "<=", Timestamp.fromDate(filters.endDate)));
    }
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    return (await queryDocuments("menstrualRecords", ...constraints)) as MenstrualRecord[];
  };

  // 取得單一紀錄
  const getMenstrualRecord = async (recordId: string) => {
    return (await getDocument("menstrualRecords", recordId)) as MenstrualRecord | null;
  };

  // 計算週期天數
  const calculateCycleDays = async (clientId: string, currentStartDate: Date) => {
    const records = await getMenstrualRecords({ clientId, limitCount: 2 });
    if (records.length < 2) return null;

    const prevRecord = records.find(r => {
      const d = r.startDate?.toDate ? r.startDate.toDate() : new Date(r.startDate);
      return d < currentStartDate;
    });

    if (!prevRecord) return null;

    const prevDate = prevRecord.startDate?.toDate ? prevRecord.startDate.toDate() : new Date(prevRecord.startDate);
    const diffTime = currentStartDate.getTime() - prevDate.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // 新增生理期紀錄
  const createMenstrualRecord = async (recordData: Omit<MenstrualRecord, "id" | "createdAt" | "updatedAt">) => {
    const startDate = recordData.startDate instanceof Date
      ? recordData.startDate
      : (recordData.startDate?.toDate ? recordData.startDate.toDate() : new Date(recordData.startDate));

    // 自動計算週期天數
    const cycleDays = await calculateCycleDays(recordData.clientId, startDate);

    const data = {
      ...recordData,
      startDate: Timestamp.fromDate(startDate),
      endDate: recordData.endDate instanceof Date
        ? Timestamp.fromDate(recordData.endDate)
        : recordData.endDate,
      cycleDays,
      recordedBy: userProfile.value?.id || recordData.recordedBy,
      recordedByName: userProfile.value?.displayName || recordData.recordedByName,
    };
    return await addDocument("menstrualRecords", data);
  };

  // 更新生理期紀錄
  const updateMenstrualRecord = async (recordId: string, recordData: Partial<MenstrualRecord>) => {
    const data = { ...recordData };
    if (data.startDate instanceof Date) {
      data.startDate = Timestamp.fromDate(data.startDate);
    }
    if (data.endDate instanceof Date) {
      data.endDate = Timestamp.fromDate(data.endDate);
    }
    return await updateDocument("menstrualRecords", recordId, data);
  };

  // 刪除生理期紀錄
  const deleteMenstrualRecord = async (recordId: string) => {
    return await deleteDocument("menstrualRecords", recordId);
  };

  // 取得選項標籤
  const getFlowAmountLabel = (value: string) => FLOW_AMOUNT_OPTIONS.find(o => o.value === value)?.label || value;
  const getPainLevelLabel = (value: string) => PAIN_LEVEL_OPTIONS.find(o => o.value === value)?.label || value;
  const getPainLevelSeverity = (value: string) => PAIN_LEVEL_OPTIONS.find(o => o.value === value)?.severity || "secondary";
  const getSymptomLabel = (value: string) => MENSTRUAL_SYMPTOM_OPTIONS.find(o => o.value === value)?.label || value;
  const getSpecialConditionLabel = (value: string) => SPECIAL_CONDITION_OPTIONS.find(o => o.value === value)?.label || value;

  return {
    getMenstrualRecords,
    getMenstrualRecord,
    calculateCycleDays,
    createMenstrualRecord,
    updateMenstrualRecord,
    deleteMenstrualRecord,
    getFlowAmountLabel,
    getPainLevelLabel,
    getPainLevelSeverity,
    getSymptomLabel,
    getSpecialConditionLabel,
    FLOW_AMOUNT_OPTIONS,
    PAIN_LEVEL_OPTIONS,
    MENSTRUAL_SYMPTOM_OPTIONS,
    SPECIAL_CONDITION_OPTIONS,
  };
};
