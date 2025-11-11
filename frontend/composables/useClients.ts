import { where, orderBy } from "firebase/firestore";

// 個案類型定義
interface Client {
  id?: string;
  name: string;
  gender: "male" | "female";
  birthDate?: any;
  classId: string;
  className?: string;
  clientNumber?: string;
  isActive: boolean;
  basicInfo?: {
    idNumber?: string;
    bloodType?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      phone2?: string;
    };
    admissionDate?: any;
  };
  latestPhysical?: {
    height: number | null;
    weight: number | null;
    bmi: number | null;
    measuredDate: any;
  };
  createdAt?: any;
  updatedAt?: any;
}

export const useClients = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  } = useFirestore();

  // 響應式狀態
  const clients = ref<any[]>([]);
  const loading = ref(false);

  // 取得所有個案
  const fetchClients = async (classId?: string) => {
    loading.value = true;
    try {
      const constraints = [where("isActive", "==", true), orderBy("name")];

      if (classId) {
        constraints.unshift(where("classId", "==", classId));
      }

      const result = await queryDocuments("clients", ...constraints) as Client[];
      clients.value = result;
      return result;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 取得所有個案（保留原方法名稱以保持兼容性）
  const getClients = async (classId?: string) => {
    const constraints = [where("isActive", "==", true), orderBy("name")];

    if (classId) {
      constraints.unshift(where("classId", "==", classId));
    }

    return await queryDocuments("clients", ...constraints) as Client[];
  };

  // 取得單一個案
  const getClient = async (clientId: string) => {
    return await getDocument("clients", clientId) as Client | null;
  };

  // 新增個案
  const createClient = async (clientData: any) => {
    const data = {
      ...clientData,
      isActive: true,
      latestPhysical: clientData.latestPhysical || {
        height: null,
        weight: null,
        bmi: null,
        measuredDate: null,
      },
    };
    return await addDocument("clients", data);
  };

  // 更新個案
  const updateClient = async (clientId: string, clientData: any) => {
    return await updateDocument("clients", clientId, clientData);
  };

  // 刪除個案（軟刪除）
  const deleteClient = async (clientId: string) => {
    return await updateDocument("clients", clientId, { isActive: false });
  };

  // 更新個案最新身高體重
  const updateClientPhysical = async (
    clientId: string,
    physical: {
      height: number;
      weight: number;
      bmi: number;
      measuredDate: Date;
    }
  ) => {
    return await updateDocument("clients", clientId, {
      latestPhysical: physical,
    });
  };

  return {
    clients,
    loading,
    fetchClients,
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    updateClientPhysical,
  };
};
