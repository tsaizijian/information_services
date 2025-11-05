import { where, Timestamp } from "firebase/firestore";

export const useVitalSigns = () => {
  const { queryDocuments, addDocument, updateDocument, getDocument } =
    useFirestore();
  const { userProfile } = useAuth();

  // 取得某個案某年度的12個月生命徵象
  const getYearlyVitalSigns = async (clientId: string, year: number) => {
    const records = await queryDocuments(
      "monthlyVitalSigns",
      where("clientId", "==", clientId),
      where("year", "==", year)
    );

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
    );

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
      return await updateDocument(
        "monthlyVitalSigns",
        existing[0].id,
        recordData
      );
    }
  };

  // 取得個案的生命徵象趨勢資料（用於圖表）
  const getVitalSignsTrend = async (clientId: string, months: number = 12) => {
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
  const getPhysicalRecords = async (
    clientId: string,
    limitCount: number = 10
  ) => {
    return await queryDocuments(
      "physicalRecords",
      where("clientId", "==", clientId)
    );
  };

  return {
    getYearlyVitalSigns,
    saveMonthlyVitalSign,
    getVitalSignsTrend,
    savePhysicalRecord,
    getPhysicalRecords,
  };
};
