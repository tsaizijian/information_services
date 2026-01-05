import { where, Timestamp, orderBy, limit } from "firebase/firestore";

// 生命徵象記錄類型定義
interface MonthlyVitalSign {
  id?: string;
  clientId: string;
  clientName: string;
  year: number;
  month: number;
  weight?: number | null;
  bloodPressure?: string | null;
  pulse?: number | null;
  bloodOxygen?: number | null;
  measuredBy?: string;
  measuredByName?: string;
  measuredDate?: any;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

// 生命徵象詳細記錄類型定義
interface VitalSignRecord {
  id?: string;
  clientId: string;
  clientName?: string;
  weight?: number | null;
  bloodPressure?: string | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  pulse?: number | null;
  temperature?: number | null;
  bloodOxygen?: number | null;
  bloodSugar?: number | null;
  height?: number | null;
  measuredAt?: any;
  measuredBy?: string;
  recordedByName?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

// 身體測量記錄類型定義
interface PhysicalRecord {
  id?: string;
  clientId: string;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
  measuredDate?: any;
  measuredBy?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const useVitalSigns = () => {
  const {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
  } =
    useFirestore();
  const { userProfile } = useAuth();

  // 取得某個案某年度的12個月生命徵象
  const getYearlyVitalSigns = async (clientId: string, year: number) => {
    const records = await queryDocuments(
      "monthlyVitalSigns",
      where("clientId", "==", clientId),
      where("year", "==", year)
    ) as MonthlyVitalSign[];

    // 建立完整的12個月資料（補空白月份）
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const record = records.find((r: any) => r.month === month);
      monthlyData.push({
        id: record?.id || null,
        month,
        monthName: `${month}月`,
        weight: record?.weight || null,
        bloodPressure: record?.bloodPressure || "/",
        pulse: record?.pulse || null,
        bloodOxygen: record?.bloodOxygen || null,
        measuredBy: record?.measuredByName || "",
        measuredDate: record?.measuredDate || null,
        notes: record?.notes || "",
      });
    }

    return monthlyData;
  };

  // 新增或更新月份紀錄
  const saveMonthlyVitalSign = async (data: {
    clientId: string;
    clientName: string;
    year: number;
    month: number;
    weight?: number;
    bloodPressure?: string;
    pulse?: number;
    bloodOxygen?: number;
    measuredBy?: string;
    measuredByName?: string;
    notes?: string;
  }) => {
    // 檢查是否已存在
    const existing = await queryDocuments(
      "monthlyVitalSigns",
      where("clientId", "==", data.clientId),
      where("year", "==", data.year),
      where("month", "==", data.month)
    ) as MonthlyVitalSign[];

    const recordData = {
      clientId: data.clientId,
      clientName: data.clientName,
      year: data.year,
      month: data.month,
      weight: data.weight || null,
      bloodPressure: data.bloodPressure || "/",
      pulse: data.pulse || null,
      bloodOxygen: data.bloodOxygen || null,
      measuredBy: data.measuredBy || userProfile.value?.id,
      measuredByName: data.measuredByName || userProfile.value?.displayName,
      measuredDate: Timestamp.now(),
      notes: data.notes || "",
    };

    if (existing.length === 0) {
      // 新增
      return await addDocument("monthlyVitalSigns", recordData);
    } else {
      // 更新
      const existingId = existing[0]?.id;
      if (!existingId) {
        throw new Error("找不到記錄 ID");
      }
      return await updateDocument(
        "monthlyVitalSigns",
        existingId,
        recordData
      );
    }
  };

  // 取得個案的生命徵象趨勢資料（用於圖表）
  const getVitalSignsTrend = async (clientId: string) => {
    const currentYear = new Date().getFullYear();
    const data = await getYearlyVitalSigns(clientId, currentYear);

    return {
      labels: data.map((d) => d.monthName),
      weight: data.map((d) => d.weight),
      pulse: data.map((d) => d.pulse),
      bloodOxygen: data.map((d) => d.bloodOxygen),
    };
  };

  // 儲存身高體重紀錄
  const savePhysicalRecord = async (data: {
    clientId: string;
    height: number;
    weight: number;
    bmi?: number;
    measuredDate?: Date;
    notes?: string;
  }) => {
    const bmi = data.bmi || data.weight / Math.pow(data.height / 100, 2);

    const recordData = {
      clientId: data.clientId,
      height: data.height,
      weight: data.weight,
      bmi: parseFloat(bmi.toFixed(2)),
      measuredDate: data.measuredDate
        ? Timestamp.fromDate(data.measuredDate)
        : Timestamp.now(),
      measuredBy: userProfile.value?.id,
      notes: data.notes || "",
    };

    return await addDocument("physicalRecords", recordData);
  };

  // 取得身高體重歷史
  const getPhysicalRecords = async (clientId: string) => {
    return await queryDocuments(
      "physicalRecords",
      where("clientId", "==", clientId)
    ) as PhysicalRecord[];
  };

  // 取得生命徵象記錄列表
  const getVitalSignRecords = async (filters?: {
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
    limitCount?: number;
    order?: "asc" | "desc";
  }) => {
    const constraints: any[] = [];

    if (filters?.clientId) {
      constraints.push(where("clientId", "==", filters.clientId));
    }

    if (filters?.startDate) {
      constraints.push(
        where("measuredAt", ">=", Timestamp.fromDate(filters.startDate))
      );
    }

    if (filters?.endDate) {
      constraints.push(
        where("measuredAt", "<=", Timestamp.fromDate(filters.endDate))
      );
    }

    const sortOrder = filters?.order === "asc" ? "asc" : "desc";
    constraints.push(orderBy("measuredAt", sortOrder));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    return await queryDocuments("vitalSignRecords", ...constraints) as VitalSignRecord[];
  };

  // 新增生命徵象記錄
  const createVitalSignRecord = async (
    record: {
      clientId: string;
      clientName: string;
      measuredAt: Date;
      weight?: number | null;
      systolic?: number | null;
      diastolic?: number | null;
      pulse?: number | null;
      heartRate?: number | null;
      temperature?: number | null;
      bloodOxygen?: number | null;
      bloodSugar?: number | null;
      height?: number | null;
      notes?: string;
    },
    recordedBy?: { id?: string; name?: string }
  ) => {
    const data = {
      clientId: record.clientId,
      clientName: record.clientName,
      measuredAt: Timestamp.fromDate(record.measuredAt),
      weight: record.weight ?? null,
      systolic: record.systolic ?? null,
      diastolic: record.diastolic ?? null,
      pulse: record.pulse ?? record.heartRate ?? null,
      temperature: record.temperature ?? null,
      bloodOxygen: record.bloodOxygen ?? null,
      bloodSugar: record.bloodSugar ?? null,
      height: record.height ?? null,
      notes: record.notes ?? null,
      recordedBy: recordedBy?.id || userProfile.value?.id || null,
      recordedByName:
        recordedBy?.name || userProfile.value?.displayName || "未命名",
    };

    return await addDocument("vitalSignRecords", data);
  };

  // 刪除生命徵象記錄
  const removeVitalSignRecord = async (recordId: string) => {
    return await deleteDocument("vitalSignRecords", recordId);
  };

  // 更新生命徵象記錄
  const updateVitalSignRecord = async (
    recordId: string,
    record: {
      measuredAt?: Date;
      weight?: number | null;
      systolic?: number | null;
      diastolic?: number | null;
      pulse?: number | null;
      heartRate?: number | null;
      temperature?: number | null;
      bloodOxygen?: number | null;
      bloodSugar?: number | null;
      height?: number | null;
      notes?: string;
    }
  ) => {
    const data: any = {};

    if (record.measuredAt) {
      data.measuredAt = Timestamp.fromDate(record.measuredAt);
    }
    if (record.weight !== undefined) {
      data.weight = record.weight;
    }
    if (record.systolic !== undefined) {
      data.systolic = record.systolic;
    }
    if (record.diastolic !== undefined) {
      data.diastolic = record.diastolic;
    }
    if (record.pulse !== undefined || record.heartRate !== undefined) {
      data.pulse = record.pulse ?? record.heartRate;
    }
    if (record.temperature !== undefined) {
      data.temperature = record.temperature;
    }
    if (record.bloodOxygen !== undefined) {
      data.bloodOxygen = record.bloodOxygen;
    }
    if (record.bloodSugar !== undefined) {
      data.bloodSugar = record.bloodSugar;
    }
    if (record.height !== undefined) {
      data.height = record.height;
    }
    if (record.notes !== undefined) {
      data.notes = record.notes;
    }

    return await updateDocument("vitalSignRecords", recordId, data);
  };

  return {
    getYearlyVitalSigns,
    saveMonthlyVitalSign,
    getVitalSignsTrend,
    savePhysicalRecord,
    getPhysicalRecords,
    getVitalSignRecords,
    createVitalSignRecord,
    removeVitalSignRecord,
    updateVitalSignRecord,
  };
};
