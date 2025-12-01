import { where, orderBy, limit, Timestamp } from "firebase/firestore";

// 情緒異常紀錄類型定義
export interface EmotionRecord {
  id?: string;
  // 基本資料
  clientId: string;
  clientName: string;
  classId?: string;
  occurredDate: any;        // 發生日期
  occurredTime: string;     // 發生時間 (HH:mm)
  context: string;          // 發生時情境
  weather?: string;         // 天氣氣溫
  durationMinutes?: number; // 持續時間（分鐘）

  // 引起異常因素（多選）
  triggers: string[];

  // 異常行為症狀（多選）
  symptoms: string[];

  // 處理過程（多選）
  treatments: string[];

  // 是否急診／就醫
  emergencyActions: string[];
  needEmergency: boolean;

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

// 發生情境選項
export const CONTEXT_OPTIONS = [
  { label: "用餐時", value: "meal" },
  { label: "洗澡時", value: "bath" },
  { label: "自由活動", value: "free_time" },
  { label: "午休", value: "nap" },
  { label: "課堂中", value: "class" },
  { label: "戶外活動", value: "outdoor" },
  { label: "起床時", value: "wake_up" },
  { label: "就寢前", value: "bedtime" },
  { label: "其他", value: "other" },
];

// 引起異常因素選項
export const TRIGGER_OPTIONS = [
  { label: "周圍環境吵雜", value: "noisy_environment", description: "廚房聲音、同儕吵鬧、施工聲" },
  { label: "與學員發生口角", value: "peer_conflict", description: "互罵、被搶物品等" },
  { label: "想要某物未得到", value: "unmet_desire", description: "食物、玩具、手機等" },
  { label: "夜眠不好、睡眠不足", value: "poor_sleep", description: "當天明顯精神差" },
  { label: "不明原因", value: "unknown", description: "觀察不到明顯誘因" },
  { label: "不順其意", value: "not_as_wished", description: "拒絕被支配或被要求" },
  { label: "身體不適", value: "physical_discomfort", description: "頭痛、肚子痛等" },
  { label: "其他", value: "other", description: "自由填寫原因" },
];

// 異常行為症狀選項
export const SYMPTOM_OPTIONS = [
  { label: "尖叫", value: "screaming" },
  { label: "哭泣", value: "crying" },
  { label: "大笑", value: "laughing" },
  { label: "吐口水", value: "spitting" },
  { label: "自傷-撞頭", value: "self_harm_head" },
  { label: "自傷-打臉", value: "self_harm_face" },
  { label: "自傷-抓皮", value: "self_harm_scratch" },
  { label: "攻擊他人-打人", value: "attack_hit" },
  { label: "攻擊他人-踢人", value: "attack_kick" },
  { label: "攻擊他人-抓人", value: "attack_scratch" },
  { label: "攻擊他人-咬人", value: "attack_bite" },
  { label: "脫衣服", value: "undressing" },
  { label: "罵髒話", value: "cursing" },
  { label: "大吼大叫", value: "yelling" },
  { label: "跑走", value: "running_away" },
  { label: "翻桌", value: "flipping_table" },
  { label: "踢椅", value: "kicking_chair" },
  { label: "啃東西", value: "chewing_objects" },
  { label: "吃非食物", value: "eating_non_food" },
  { label: "失控搖晃", value: "shaking" },
  { label: "揮拳", value: "punching" },
  { label: "其他", value: "other" },
];

// 處理過程選項
export const TREATMENT_OPTIONS = [
  { label: "語氣柔和安撫", value: "verbal_soothing" },
  { label: "隔離到安全空間", value: "isolation" },
  { label: "適當約束", value: "restraint", description: "如手扶、阻擋撞擊（依 SOP）" },
  { label: "陪伴", value: "accompany" },
  { label: "注意力轉移", value: "distraction", description: "拿水、讓其坐下、轉移刺激" },
  { label: "維持環境安全", value: "environment_safety", description: "移開危險物品" },
  { label: "注意照護員安全", value: "caregiver_safety" },
  { label: "檢查有無外傷", value: "check_injury" },
  { label: "外傷處理包紮", value: "wound_treatment" },
  { label: "通知家屬", value: "notify_family" },
  { label: "其他", value: "other" },
];

// 急診/就醫情況選項
export const EMERGENCY_OPTIONS = [
  { label: "嚴重外傷出血", value: "severe_bleeding", description: "超過 2cm、明顯滲血" },
  { label: "攻擊行為難以控制", value: "uncontrollable", description: "持續 10-20 分鐘未改善" },
  { label: "出現藥物副作用", value: "drug_side_effect", description: "眼神呆滯、步態異常" },
  { label: "呼吸困難", value: "breathing_difficulty", description: "過度換氣、缺氧徵象" },
  { label: "心跳停止或昏迷", value: "cardiac_arrest", description: "緊急狀況" },
  { label: "其他", value: "other" },
];

export const useEmotionRecords = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();
  const { userProfile } = useAuth();

  // 取得情緒紀錄列表
  const getEmotionRecords = async (filters?: {
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
      constraints.push(
        where("occurredDate", ">=", Timestamp.fromDate(filters.startDate))
      );
    }
    if (filters?.endDate) {
      constraints.push(
        where("occurredDate", "<=", Timestamp.fromDate(filters.endDate))
      );
    }
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    return (await queryDocuments("emotionRecords", ...constraints)) as EmotionRecord[];
  };

  // 取得單一紀錄
  const getEmotionRecord = async (recordId: string) => {
    return (await getDocument("emotionRecords", recordId)) as EmotionRecord | null;
  };

  // 取得個案的情緒統計
  const getClientEmotionStats = async (clientId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await getEmotionRecords({
      clientId,
      startDate,
    });

    // 統計各類症狀出現次數
    const symptomCounts: Record<string, number> = {};
    const triggerCounts: Record<string, number> = {};

    records.forEach((record) => {
      record.symptoms?.forEach((s) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
      record.triggers?.forEach((t) => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });

    return {
      totalCount: records.length,
      symptomCounts,
      triggerCounts,
      emergencyCount: records.filter((r) => r.needEmergency).length,
    };
  };

  // 新增情緒紀錄
  const createEmotionRecord = async (recordData: Omit<EmotionRecord, "id" | "createdAt" | "updatedAt">) => {
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
    return await addDocument("emotionRecords", data);
  };

  // 更新情緒紀錄
  const updateEmotionRecord = async (recordId: string, recordData: Partial<EmotionRecord>) => {
    const data = { ...recordData };
    if (data.occurredDate instanceof Date) {
      data.occurredDate = Timestamp.fromDate(data.occurredDate);
    }
    return await updateDocument("emotionRecords", recordId, data);
  };

  // 刪除情緒紀錄
  const deleteEmotionRecord = async (recordId: string) => {
    return await deleteDocument("emotionRecords", recordId);
  };

  // 取得選項標籤
  const getContextLabel = (value: string) => {
    return CONTEXT_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const getTriggerLabel = (value: string) => {
    return TRIGGER_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const getSymptomLabel = (value: string) => {
    return SYMPTOM_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const getTreatmentLabel = (value: string) => {
    return TREATMENT_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const getEmergencyLabel = (value: string) => {
    return EMERGENCY_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  // 釘選/取消釘選
  const togglePin = async (recordId: string, currentIsPinned: boolean) => {
    const record = await getEmotionRecord(recordId);
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

    return await updateDocument("emotionRecords", recordId, {
      isPinned: pinnedBy.length > 0,
      pinnedBy,
    });
  };

  return {
    getEmotionRecords,
    getEmotionRecord,
    getClientEmotionStats,
    createEmotionRecord,
    updateEmotionRecord,
    deleteEmotionRecord,
    togglePin,
    getContextLabel,
    getTriggerLabel,
    getSymptomLabel,
    getTreatmentLabel,
    getEmergencyLabel,
    CONTEXT_OPTIONS,
    TRIGGER_OPTIONS,
    SYMPTOM_OPTIONS,
    TREATMENT_OPTIONS,
    EMERGENCY_OPTIONS,
  };
};
