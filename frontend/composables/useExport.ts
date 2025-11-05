import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { where } from "firebase/firestore";

export const useExport = () => {
  const { queryDocuments } = useFirestore();
  const { getYearlyVitalSigns } = useVitalSigns();

  // 匯出生命徵象紀錄表（Excel）
  const exportVitalSignsToExcel = async (
    clientId: string,
    clientName: string,
    year: number,
    gender: string,
    normalBP?: {
      systolicMin: number;
      systolicMax: number;
      diastolicMin: number;
      diastolicMax: number;
    }
  ) => {
    const monthlyData = await getYearlyVitalSigns(clientId, year);

    // 建立工作簿
    const wb = XLSX.utils.book_new();

    // 準備表格資料
    const tableData = [
      ["財團法人桃園市私立寶貝潛能發展中心"],
      [],
      ["生命徵象紀錄表"],
      [],
      [
        `${year}年    姓名：${clientName}    性別：${
          gender === "male" ? "男" : "女"
        }`,
      ],
      [],
      ["月份", "體重", "血壓", "脈搏", "血氧", "紀錄者"],
    ];

    // 填入12個月資料
    const monthNames = [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ];
    monthlyData.forEach((data: any, index: number) => {
      tableData.push([
        monthNames[index],
        data.weight ? `${data.weight} kg` : "",
        data.bloodPressure || "/",
        data.pulse ? `${data.pulse} 分/次` : "分/次",
        data.bloodOxygen ? `${data.bloodOxygen} %` : "%",
        data.measuredBy || "",
      ]);
    });

    // 備註
    const bpNote = normalBP
      ? `※備註: 正常血壓 ${normalBP.systolicMin}-${normalBP.systolicMax}mmHg  舒張壓 ${normalBP.diastolicMin}-${normalBP.diastolicMax} mmHg`
      : "※備註: 正常血壓 90-140mmHg  舒張壓 50-90 mmHg";

    tableData.push([]);
    tableData.push([bpNote]);

    // 轉換為工作表
    const ws = XLSX.utils.aoa_to_sheet(tableData);

    // 設定欄寬
    ws["!cols"] = [
      { wch: 8 }, // 月份
      { wch: 12 }, // 體重
      { wch: 12 }, // 血壓
      { wch: 12 }, // 脈搏
      { wch: 10 }, // 血氧
      { wch: 15 }, // 紀錄者
    ];

    // 合併儲存格
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // 標題
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // 生命徵象紀錄表
      { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } }, // 年份姓名性別
    ];

    // 加入工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "生命徵象紀錄表");

    // 下載
    XLSX.writeFile(wb, `生命徵象紀錄表_${clientName}_${year}年.xlsx`);
  };

  // 批次匯出整個班級
  const exportClassVitalSigns = async (classId: string, year: number) => {
    // 取得班級所有個案
    const clients = await queryDocuments(
      "clients",
      where("classId", "==", classId),
      where("isActive", "==", true)
    );

    // 為每個個案匯出
    for (const client of clients) {
      await exportVitalSignsToExcel(
        client.id,
        client.name,
        year,
        client.gender,
        client.normalBloodPressure
      );
    }
  };

  // 匯出照護紀錄（Excel）
  const exportRecordsToExcel = async (filters?: any) => {
    const { getRecords } = useRecords();
    const records = await getRecords(filters);

    const data = records.map((record: any) => ({
      日期: dayjs(record.recordDate.toDate()).format("YYYY-MM-DD"),
      時間: dayjs(record.recordDate.toDate()).format("HH:mm"),
      個案: record.clientName,
      分類: getCategoryLabel(record.category),
      紀錄者: record.recordedByName,
      交接給: record.handoverToName || "",
      內容: record.content,
      備註: record.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "照護紀錄");

    const filename = `照護紀錄_${dayjs().format("YYYY-MM-DD")}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // 分類標籤轉換
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sleep: "睡眠",
      water: "喝水",
      medical: "回診/醫療",
      physical: "身高體重",
      physiological: "生理紀錄",
      family_contact: "家屬聯絡",
      care: "照護內容",
      other: "其他",
    };
    return labels[category] || category;
  };

  return {
    exportVitalSignsToExcel,
    exportClassVitalSigns,
    exportRecordsToExcel,
    getCategoryLabel,
  };
};
