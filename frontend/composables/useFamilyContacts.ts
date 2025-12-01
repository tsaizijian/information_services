import { where, orderBy, limit, Timestamp } from "firebase/firestore";

export interface FamilyContact {
    id?: string;
    clientId: string;
    clientName: string;
    contactDate: any;
    contactTarget: string; // 通話對象
    contactMethod: string; // 聯絡方式
    content: string; // 內容
    recordedBy: string;
    recordedByName: string;
    createdAt?: any;
    updatedAt?: any;
}

export const useFamilyContacts = () => {
    const {
        queryDocuments,
        addDocument,
        updateDocument,
        deleteDocument,
    } = useFirestore();
    const { userProfile } = useAuth();

    const collectionName = "familyContacts";

    // 取得聯絡紀錄
    const getContacts = async (filters?: {
        clientId?: string;
        startDate?: Date;
        endDate?: Date;
        limitCount?: number;
    }) => {
        const constraints: any[] = [orderBy("contactDate", "desc")];

        if (filters?.clientId) {
            constraints.unshift(where("clientId", "==", filters.clientId));
        }

        if (filters?.startDate) {
            constraints.push(where("contactDate", ">=", Timestamp.fromDate(filters.startDate)));
        }

        if (filters?.endDate) {
            // End date should be end of day
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            constraints.push(where("contactDate", "<=", Timestamp.fromDate(end)));
        }

        if (filters?.limitCount) {
            constraints.push(limit(filters.limitCount));
        }

        return await queryDocuments(collectionName, ...constraints) as FamilyContact[];
    };

    // 新增聯絡紀錄
    const addContact = async (data: Omit<FamilyContact, "id" | "createdAt" | "updatedAt" | "recordedBy" | "recordedByName">) => {
        if (!userProfile.value) throw new Error("尚未登入");

        return await addDocument(collectionName, {
            ...data,
            recordedBy: userProfile.value.id || "",
            recordedByName: userProfile.value.displayName || "未知使用者",
        });
    };

    // 更新聯絡紀錄
    const updateContact = async (id: string, data: Partial<FamilyContact>) => {
        return await updateDocument(collectionName, id, data);
    };

    // 刪除聯絡紀錄
    const deleteContact = async (id: string) => {
        return await deleteDocument(collectionName, id);
    };

    return {
        getContacts,
        addContact,
        updateContact,
        deleteContact,
    };
};
