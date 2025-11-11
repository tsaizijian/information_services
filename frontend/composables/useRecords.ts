import { where, orderBy, limit, Timestamp } from "firebase/firestore";

// 照護紀錄類型定義
interface CareRecord {
  id?: string;
  clientId: string;
  clientName: string;
  classId?: string;
  recordDate: any;
  recordType: string;
  category?: string;
  content: string;
  notes?: string;
  recordedBy: string;
  recordedByName: string;
  isPinned: boolean;
  pinnedBy: string[];
  handoverConfirmed: boolean;
  handoverConfirmedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export const useRecords = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();
  const { userProfile } = useAuth();

  // 取得照護紀錄
  const getRecords = async (filters?: {
    clientId?: string;
    classId?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    recordedBy?: string;
    isPinned?: boolean;
    limitCount?: number;
  }) => {
    const constraints: any[] = [orderBy("recordDate", "desc")];

    if (filters?.clientId) {
      constraints.unshift(where("clientId", "==", filters.clientId));
    }
    if (filters?.classId) {
      constraints.unshift(where("classId", "==", filters.classId));
    }
    if (filters?.category) {
      constraints.unshift(where("category", "==", filters.category));
    }
    if (filters?.recordedBy) {
      constraints.unshift(where("recordedBy", "==", filters.recordedBy));
    }
    if (filters?.isPinned !== undefined) {
      constraints.unshift(where("isPinned", "==", filters.isPinned));
    }
    if (filters?.startDate) {
      constraints.push(
        where("recordDate", ">=", Timestamp.fromDate(filters.startDate))
      );
    }
    if (filters?.endDate) {
      constraints.push(
        where("recordDate", "<=", Timestamp.fromDate(filters.endDate))
      );
    }
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    return await queryDocuments("records", ...constraints) as CareRecord[];
  };

  // 取得單一紀錄
  const getRecord = async (recordId: string) => {
    return await getDocument("records", recordId) as CareRecord | null;
  };

  // 新增紀錄
  const createRecord = async (recordData: any) => {
    const data = {
      ...recordData,
      recordedBy: userProfile.value?.id || recordData.recordedBy,
      recordedByName:
        userProfile.value?.displayName || recordData.recordedByName,
      recordDate: recordData.recordDate || Timestamp.now(),
      isPinned: false,
      pinnedBy: [],
      handoverConfirmed: false,
    };
    return await addDocument("records", data);
  };

  // 更新紀錄
  const updateRecord = async (recordId: string, recordData: any) => {
    return await updateDocument("records", recordId, recordData);
  };

  // 刪除紀錄
  const deleteRecord = async (recordId: string) => {
    return await deleteDocument("records", recordId);
  };

  // 釘選/取消釘選
  const togglePin = async (recordId: string, currentIsPinned: boolean) => {
    const record = await getRecord(recordId);
    if (!record) {
      throw new Error("找不到記錄");
    }
    const pinnedBy = record.pinnedBy || [];
    const userId = userProfile.value?.id;

    // 如果目前是釘選狀態，則取消釘選（移除用戶）
    if (currentIsPinned && userId) {
      const index = pinnedBy.indexOf(userId);
      if (index > -1) pinnedBy.splice(index, 1);
    }
    // 如果目前未釘選，則釘選（添加用戶）
    else if (!currentIsPinned && userId && !pinnedBy.includes(userId)) {
      pinnedBy.push(userId);
    }

    return await updateDocument("records", recordId, {
      isPinned: pinnedBy.length > 0,
      pinnedBy,
    });
  };

  // 確認交接
  const confirmHandover = async (recordId: string) => {
    return await updateDocument("records", recordId, {
      handoverConfirmed: true,
      handoverConfirmedAt: Timestamp.now(),
    });
  };

  // 取得釘選的紀錄
  const getPinnedRecords = async (limitCount: number = 10) => {
    return await getRecords({ isPinned: true, limitCount });
  };

  return {
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    togglePin,
    confirmHandover,
    getPinnedRecords,
  };
};
