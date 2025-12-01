import { where, orderBy, limit, Timestamp } from "firebase/firestore";

// 癲癇發作紀錄類型定義
export interface SeizureRecord {
  id?: string;
  // 基本資料
  clientId: string;
  clientName: string;
  classId?: string;
  occurredDate: any;        // 發作日期
  occurredTime: string;     // 發作時間 (HH:mm)
  context: string;          // 發作情境
  weather?: string;         // 天氣氣溫
  durationSeconds: number;  // 發作持續時間（秒）

  // 發作症狀
  consciousnessState: string;     // 意識狀態
  limbSymptoms: string[];         // 肢體症狀（多選）
  mouthSymptoms: string[];        // 口部症狀（多選）
  otherSymptoms: string[];        // 其他症狀（多選）

  // 處理過程（多選）
  treatments: string[];

  // 是否送醫
  needEmergency: boolean;
  emergencyReasons: string[];

  // 發作後狀況（多選）
  postSeizureConditions: string[];

  // 備註
  notes?: string;

  // 記錄資訊
  recordedBy: string;
  recordedByName: string;

  // 釘選功能
  isPinned?: boolean;
  pinnedBy?: string[];

  createdAt?: any;
  updatedAt?: any;
}

// 發作情境選項
export const SEIZURE_CONTEXT_OPTIONS = [
  { label: "用餐中", value: "meal" },
  { label: "運動中", value: "exercise" },
  { label: "休息中", value: "rest" },
  { label: "課堂中", value: "class" },
  { label: "行走中", value: "walking" },
  { label: "睡眠中", value: "sleep" },
  { label: "洗澡中", value: "bath" },
  { label: "其他", value: "other" },
];

// 意識狀態選項
export const CONSCIOUSNESS_OPTIONS = [
  { label: "意識清楚", value: "clear", severity: "success" },
  { label: "意識模糊", value: "confused", severity: "warn" },
  { label: "喪失意識", value: "unconscious", severity: "danger" },
  { label: "眼神呆滯不回應", value: "unresponsive", severity: "danger" },
];

// 肢體症狀選項
export const LIMB_SYMPTOM_OPTIONS = [
  { label: "雙眼上吊", value: "eyes_rolled" },
  { label: "四肢僵直", value: "limb_stiff" },
  { label: "四肢抽搐", value: "limb_convulsion" },
  { label: "身體突然癱軟", value: "body_limp" },
  { label: "手腳無力", value: "limb_weakness" },
  { label: "顫抖、抽動", value: "tremor" },
  { label: "唇部顫動", value: "lip_tremor" },
];

// 口部症狀選項
export const MOUTH_SYMPTOM_OPTIONS = [
  { label: "口吐白沫", value: "foaming" },
  { label: "咬到舌頭", value: "tongue_bite" },
  { label: "嘴唇變紫", value: "cyanosis" },
];

// 其他症狀選項
export const OTHER_SYMPTOM_OPTIONS = [
  { label: "失禁（尿）", value: "urinary_incontinence" },
  { label: "失禁（便）", value: "fecal_incontinence" },
  { label: "大喊叫聲", value: "screaming" },
  { label: "無法站穩", value: "unstable" },
  { label: "發作後混亂", value: "post_confusion" },
  { label: "發作後想睡", value: "post_drowsy" },
];

// 處理過程選項
export const SEIZURE_TREATMENT_OPTIONS = [
  { label: "保護頭部", value: "protect_head" },
  { label: "移開危險物", value: "remove_danger" },
  { label: "協助側臥", value: "lateral_position" },
  { label: "解開衣領", value: "loosen_collar" },
  { label: "鬆開衣物", value: "loosen_clothes" },
  { label: "保持呼吸道暢通", value: "clear_airway" },
  { label: "觀察與計時", value: "observe_time" },
  { label: "發作後協助保暖", value: "keep_warm" },
  { label: "發作後休息", value: "post_rest" },
  { label: "檢查有無外傷", value: "check_injury" },
  { label: "外傷包紮", value: "wound_care" },
  { label: "通知家屬", value: "notify_family" },
];

// 送醫原因選項
export const EMERGENCY_REASON_OPTIONS = [
  { label: "超過 5-10 分鐘未停止", value: "prolonged", severity: "danger" },
  { label: "連續性發作", value: "continuous", severity: "danger" },
  { label: "呼吸困難、發紫", value: "breathing_difficulty", severity: "danger" },
  { label: "外傷嚴重", value: "severe_injury", severity: "danger" },
  { label: "意識未恢復", value: "no_recovery", severity: "danger" },
];

// 發作後狀況選項
export const POST_SEIZURE_OPTIONS = [
  { label: "嗜睡", value: "drowsy" },
  { label: "頭痛", value: "headache" },
  { label: "想吐", value: "nausea" },
  { label: "虛弱", value: "weakness" },
  { label: "情緒低落", value: "depressed" },
  { label: "能恢復上課/活動", value: "can_resume" },
  { label: "需持續休息", value: "need_rest" },
];

export const useSeizureRecords = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();
  const { userProfile } = useAuth();

  // 取得癲癇紀錄列表
  const getSeizureRecords = async (filters?: {
    clientId?: string;
    classId?: string;
    startDate?: Date;
    endDate?: Date;
    limitCount?: number;
  }) => {
    const constraints: any[] = [orderBy("occurredDate", "desc")];

    if (filters?.clientId) {
      constraints.unshift(where("clientId", "==", filters.clientId));
    }
    if (filters?.classId) {
      constraints.unshift(where("classId", "==", filters.classId));
    }
    if (filters?.startDate) {
      constraints.push(where("occurredDate", ">=", Timestamp.fromDate(filters.startDate)));
    }
    if (filters?.endDate) {
      constraints.push(where("occurredDate", "<=", Timestamp.fromDate(filters.endDate)));
    }
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    return (await queryDocuments("seizureRecords", ...constraints)) as SeizureRecord[];
  };

  // 取得單一紀錄
  const getSeizureRecord = async (recordId: string) => {
    return (await getDocument("seizureRecords", recordId)) as SeizureRecord | null;
  };

  // 新增癲癇紀錄
  const createSeizureRecord = async (recordData: Omit<SeizureRecord, "id" | "createdAt" | "updatedAt">) => {
    const data = {
      ...recordData,
      occurredDate: recordData.occurredDate instanceof Date
        ? Timestamp.fromDate(recordData.occurredDate)
        : recordData.occurredDate,
      recordedBy: userProfile.value?.id || recordData.recordedBy,
      recordedByName: userProfile.value?.displayName || recordData.recordedByName,
      isPinned: false,
      pinnedBy: [],
    };
    return await addDocument("seizureRecords", data);
  };

  // 更新癲癇紀錄
  const updateSeizureRecord = async (recordId: string, recordData: Partial<SeizureRecord>) => {
    const data = { ...recordData };
    if (data.occurredDate instanceof Date) {
      data.occurredDate = Timestamp.fromDate(data.occurredDate);
    }
    return await updateDocument("seizureRecords", recordId, data);
  };

  // 刪除癲癇紀錄
  const deleteSeizureRecord = async (recordId: string) => {
    return await deleteDocument("seizureRecords", recordId);
  };

  // 取得選項標籤
  const getContextLabel = (value: string) => SEIZURE_CONTEXT_OPTIONS.find(o => o.value === value)?.label || value;
  const getConsciousnessLabel = (value: string) => CONSCIOUSNESS_OPTIONS.find(o => o.value === value)?.label || value;
  const getConsciousnessSeverity = (value: string) => CONSCIOUSNESS_OPTIONS.find(o => o.value === value)?.severity || "secondary";
  const getLimbSymptomLabel = (value: string) => LIMB_SYMPTOM_OPTIONS.find(o => o.value === value)?.label || value;
  const getMouthSymptomLabel = (value: string) => MOUTH_SYMPTOM_OPTIONS.find(o => o.value === value)?.label || value;
  const getOtherSymptomLabel = (value: string) => OTHER_SYMPTOM_OPTIONS.find(o => o.value === value)?.label || value;
  const getTreatmentLabel = (value: string) => SEIZURE_TREATMENT_OPTIONS.find(o => o.value === value)?.label || value;
  const getEmergencyReasonLabel = (value: string) => EMERGENCY_REASON_OPTIONS.find(o => o.value === value)?.label || value;
  const getPostSeizureLabel = (value: string) => POST_SEIZURE_OPTIONS.find(o => o.value === value)?.label || value;

  // 格式化持續時間
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} 秒`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins} 分 ${secs} 秒` : `${mins} 分鐘`;
  };

  // 釘選/取消釘選
  const togglePin = async (recordId: string, currentIsPinned: boolean) => {
    const record = await getSeizureRecord(recordId);
    if (!record) {
      throw new Error("找不到記錄");
    }
    const pinnedBy = record.pinnedBy || [];
    const userId = userProfile.value?.id;

    if (currentIsPinned && userId) {
      const index = pinnedBy.indexOf(userId);
      if (index > -1) pinnedBy.splice(index, 1);
    } else if (!currentIsPinned && userId && !pinnedBy.includes(userId)) {
      pinnedBy.push(userId);
    }

    return await updateDocument("seizureRecords", recordId, {
      isPinned: pinnedBy.length > 0,
      pinnedBy,
    });
  };

  return {
    getSeizureRecords,
    getSeizureRecord,
    createSeizureRecord,
    updateSeizureRecord,
    deleteSeizureRecord,
    togglePin,
    getContextLabel,
    getConsciousnessLabel,
    getConsciousnessSeverity,
    getLimbSymptomLabel,
    getMouthSymptomLabel,
    getOtherSymptomLabel,
    getTreatmentLabel,
    getEmergencyReasonLabel,
    getPostSeizureLabel,
    formatDuration,
    SEIZURE_CONTEXT_OPTIONS,
    CONSCIOUSNESS_OPTIONS,
    LIMB_SYMPTOM_OPTIONS,
    MOUTH_SYMPTOM_OPTIONS,
    OTHER_SYMPTOM_OPTIONS,
    SEIZURE_TREATMENT_OPTIONS,
    EMERGENCY_REASON_OPTIONS,
    POST_SEIZURE_OPTIONS,
  };
};
