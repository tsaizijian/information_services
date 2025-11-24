import { where, orderBy, limit, Timestamp } from "firebase/firestore";

// 班務交接類型定義
export interface HandoverNotifyUser {
  userId: string;
  userName: string;
  isRead: boolean;
  readAt?: any;
}

export interface HandoverTargetClient {
  clientId: string;
  clientName: string;
}

export interface Handover {
  id?: string;
  // 建立資訊
  createdBy: string;
  createdByName: string;
  shiftDate: any;
  shiftType: "morning" | "afternoon" | "evening" | "night";

  // 重要性
  priority: "urgent" | "high" | "normal" | "low";

  // 通知人員
  notifyUsers: HandoverNotifyUser[];

  // 服務對象
  targetClients: HandoverTargetClient[];

  // 交接事項
  content: string;

  // 確認狀態
  status: "pending" | "confirmed";
  confirmedBy?: string;
  confirmedByName?: string;
  confirmedAt?: any;

  createdAt?: any;
  updatedAt?: any;
}

// 班次選項
export const SHIFT_OPTIONS = [
  { label: "早班", value: "morning" },
  { label: "中班", value: "afternoon" },
  { label: "晚班", value: "evening" },
  { label: "夜班", value: "night" },
];

// 重要性選項
export const PRIORITY_OPTIONS = [
  { label: "緊急", value: "urgent", color: "red", icon: "pi-exclamation-circle" },
  { label: "高", value: "high", color: "orange", icon: "pi-exclamation-triangle" },
  { label: "一般", value: "normal", color: "green", icon: "pi-info-circle" },
  { label: "低", value: "low", color: "gray", icon: "pi-minus-circle" },
];

export const useHandover = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();
  const { userProfile } = useAuth();

  // 取得交接列表
  const getHandovers = async (filters?: {
    status?: "pending" | "confirmed";
    startDate?: Date;
    endDate?: Date;
    createdBy?: string;
    limitCount?: number;
  }) => {
    const constraints: any[] = [orderBy("shiftDate", "desc")];

    if (filters?.status) {
      constraints.unshift(where("status", "==", filters.status));
    }
    if (filters?.createdBy) {
      constraints.unshift(where("createdBy", "==", filters.createdBy));
    }
    if (filters?.startDate) {
      constraints.push(
        where("shiftDate", ">=", Timestamp.fromDate(filters.startDate))
      );
    }
    if (filters?.endDate) {
      constraints.push(
        where("shiftDate", "<=", Timestamp.fromDate(filters.endDate))
      );
    }
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    return (await queryDocuments("handovers", ...constraints)) as Handover[];
  };

  // 取得單一交接
  const getHandover = async (handoverId: string) => {
    return (await getDocument("handovers", handoverId)) as Handover | null;
  };

  // 取得我的待確認交接（我被通知的且尚未確認）
  const getMyPendingHandovers = async () => {
    const userId = userProfile.value?.id;
    if (!userId) return [];

    // 取得所有待確認的交接
    const handovers = await getHandovers({ status: "pending" });

    // 篩選出通知我的交接
    return handovers.filter((h) =>
      h.notifyUsers?.some((u) => u.userId === userId)
    );
  };

  // 取得我的未讀交接數量
  const getUnreadCount = async () => {
    const userId = userProfile.value?.id;
    if (!userId) return 0;

    const handovers = await getHandovers({ status: "pending" });

    return handovers.filter((h) =>
      h.notifyUsers?.some((u) => u.userId === userId && !u.isRead)
    ).length;
  };

  // 新增交接
  const createHandover = async (handoverData: Omit<Handover, "id" | "createdAt" | "updatedAt">) => {
    const data = {
      ...handoverData,
      createdBy: userProfile.value?.id || handoverData.createdBy,
      createdByName: userProfile.value?.displayName || handoverData.createdByName,
      shiftDate: handoverData.shiftDate instanceof Date
        ? Timestamp.fromDate(handoverData.shiftDate)
        : handoverData.shiftDate,
      status: "pending" as const,
    };
    return await addDocument("handovers", data);
  };

  // 更新交接
  const updateHandover = async (handoverId: string, handoverData: Partial<Handover>) => {
    return await updateDocument("handovers", handoverId, handoverData);
  };

  // 刪除交接
  const deleteHandover = async (handoverId: string) => {
    return await deleteDocument("handovers", handoverId);
  };

  // 確認交接
  const confirmHandover = async (handoverId: string) => {
    const userId = userProfile.value?.id;
    const userName = userProfile.value?.displayName;

    return await updateDocument("handovers", handoverId, {
      status: "confirmed",
      confirmedBy: userId,
      confirmedByName: userName,
      confirmedAt: Timestamp.now(),
    });
  };

  // 標記為已讀
  const markAsRead = async (handoverId: string) => {
    const userId = userProfile.value?.id;
    if (!userId) return;

    const handover = await getHandover(handoverId);
    if (!handover) return;

    const notifyUsers = handover.notifyUsers.map((u) => {
      if (u.userId === userId) {
        return { ...u, isRead: true, readAt: Timestamp.now() };
      }
      return u;
    });

    return await updateDocument("handovers", handoverId, { notifyUsers });
  };

  // 取得班次標籤
  const getShiftLabel = (shiftType: string) => {
    const option = SHIFT_OPTIONS.find((o) => o.value === shiftType);
    return option?.label || shiftType;
  };

  // 取得重要性標籤與顏色
  const getPriorityMeta = (priority: string) => {
    const option = PRIORITY_OPTIONS.find((o) => o.value === priority);
    return option || { label: priority, color: "gray", icon: "pi-circle" };
  };

  return {
    getHandovers,
    getHandover,
    getMyPendingHandovers,
    getUnreadCount,
    createHandover,
    updateHandover,
    deleteHandover,
    confirmHandover,
    markAsRead,
    getShiftLabel,
    getPriorityMeta,
    SHIFT_OPTIONS,
    PRIORITY_OPTIONS,
  };
};
