import { where, orderBy, limit, Timestamp } from "firebase/firestore";

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

    return await queryDocuments("records", ...constraints);
  };

  // 取得單一紀錄
  const getRecord = async (recordId: string) => {
    return await getDocument("records", recordId);
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
  const togglePin = async (recordId: string, isPinned: boolean) => {
    const record = await getRecord(recordId);
    const pinnedBy = record.pinnedBy || [];
    const userId = userProfile.value?.id;

    if (isPinned && userId && !pinnedBy.includes(userId)) {
      pinnedBy.push(userId);
    } else if (!isPinned && userId) {
      const index = pinnedBy.indexOf(userId);
      if (index > -1) pinnedBy.splice(index, 1);
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
