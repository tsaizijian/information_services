import { where, orderBy, limit, Timestamp } from "firebase/firestore";

// 解便紀錄類型定義
export interface BowelRecord {
  id?: string;
  // 基本資料
  clientId: string;
  clientName: string;
  classId?: string;
  occurredDate: any;        // 發生日期
  occurredTime: string;     // 發生時間 (HH:mm)
  daysSinceLastBowel?: number; // 距離上次解便天數

  // 解便情況
  amount: string;           // 解便量
  color: string;            // 顏色
  specialConditions: string[]; // 特殊狀況（多選）
  accompanyingSymptoms: string[]; // 伴隨症狀（多選）

  // 備註
  notes?: string;
  usedLaxative?: boolean;   // 是否使用軟便劑
  usedEnema?: boolean;      // 是否灌腸

  // 記錄資訊
  recordedBy: string;
  recordedByName: string;

  // 釘選功能
  isPinned?: boolean;
  pinnedBy?: string[];

  createdAt?: any;
  updatedAt?: any;
}

// 解便量選項
export const AMOUNT_OPTIONS = [
  { label: "少量", value: "small", description: "一些、量少" },
  { label: "中等", value: "medium", description: "一般量" },
  { label: "大量", value: "large", description: "明顯多於一般" },
];

// 顏色選項
export const COLOR_OPTIONS = [
  { label: "正常黃褐色", value: "normal", severity: "success" },
  { label: "深色/黑色", value: "dark", severity: "danger", description: "消化道出血可能" },
  { label: "淺色/灰白", value: "pale", severity: "warn", description: "膽道問題警訊" },
  { label: "綠色", value: "green", severity: "info", description: "腸道蠕動快" },
  { label: "帶血", value: "bloody", severity: "danger", description: "紅色條紋或血點" },
];

// 特殊狀況選項
export const SPECIAL_CONDITION_OPTIONS = [
  { label: "水便（腹瀉）", value: "diarrhea", description: "稀水狀" },
  { label: "硬塊", value: "hard", description: "嚴重便秘" },
  { label: "黏液", value: "mucus", description: "白色、透明" },
  { label: "惡臭明顯", value: "foul_smell", description: "有異常臭味" },
  { label: "排便困難", value: "difficult", description: "用力、時間長" },
  { label: "其他", value: "other" },
];

// 伴隨症狀選項
export const ACCOMPANYING_SYMPTOM_OPTIONS = [
  { label: "腹痛", value: "abdominal_pain" },
  { label: "嘔吐", value: "vomiting" },
  { label: "發燒", value: "fever" },
  { label: "食慾差", value: "poor_appetite" },
  { label: "嗜睡", value: "drowsiness" },
  { label: "腹脹", value: "bloating" },
];

export const useBowelRecords = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();
  const { userProfile } = useAuth();

  // 取得解便紀錄列表
  const getBowelRecords = async (filters?: {
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

    return (await queryDocuments("bowelRecords", ...constraints)) as BowelRecord[];
  };

  // 取得單一紀錄
  const getBowelRecord = async (recordId: string) => {
    return (await getDocument("bowelRecords", recordId)) as BowelRecord | null;
  };

  // 新增解便紀錄
  const createBowelRecord = async (recordData: Omit<BowelRecord, "id" | "createdAt" | "updatedAt">) => {
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
    return await addDocument("bowelRecords", data);
  };

  // 更新解便紀錄
  const updateBowelRecord = async (recordId: string, recordData: Partial<BowelRecord>) => {
    const data = { ...recordData };
    if (data.occurredDate instanceof Date) {
      data.occurredDate = Timestamp.fromDate(data.occurredDate);
    }
    return await updateDocument("bowelRecords", recordId, data);
  };

  // 刪除解便紀錄
  const deleteBowelRecord = async (recordId: string) => {
    return await deleteDocument("bowelRecords", recordId);
  };

  // 取得選項標籤
  const getAmountLabel = (value: string) => AMOUNT_OPTIONS.find(o => o.value === value)?.label || value;
  const getColorLabel = (value: string) => COLOR_OPTIONS.find(o => o.value === value)?.label || value;
  const getColorSeverity = (value: string) => COLOR_OPTIONS.find(o => o.value === value)?.severity || "secondary";
  const getSpecialConditionLabel = (value: string) => SPECIAL_CONDITION_OPTIONS.find(o => o.value === value)?.label || value;
  const getAccompanyingSymptomLabel = (value: string) => ACCOMPANYING_SYMPTOM_OPTIONS.find(o => o.value === value)?.label || value;

  // 釘選/取消釘選
  const togglePin = async (recordId: string, currentIsPinned: boolean) => {
    const record = await getBowelRecord(recordId);
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

    return await updateDocument("bowelRecords", recordId, {
      isPinned: pinnedBy.length > 0,
      pinnedBy,
    });
  };

  return {
    getBowelRecords,
    getBowelRecord,
    createBowelRecord,
    updateBowelRecord,
    deleteBowelRecord,
    togglePin,
    getAmountLabel,
    getColorLabel,
    getColorSeverity,
    getSpecialConditionLabel,
    getAccompanyingSymptomLabel,
    AMOUNT_OPTIONS,
    COLOR_OPTIONS,
    SPECIAL_CONDITION_OPTIONS,
    ACCOMPANYING_SYMPTOM_OPTIONS,
  };
};
