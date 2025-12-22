import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { where } from "firebase/firestore";
import { Document, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, Packer, VerticalAlign, ImageRun, TextRun } from "docx";

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
        (client as any).name,
        year,
        (client as any).gender,
        (client as any).normalBloodPressure
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

  // 匯出生命徵象紀錄表（Word）- 按照機構格式
  const exportVitalSignsToWord = async (
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
    // 讀取機構名稱圖片
    let logoNameImage: any = null;
    try {
      const response = await fetch('/logo_name.png');
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      logoNameImage = new Uint8Array(arrayBuffer);
      console.log('機構名稱圖片載入成功');
    } catch (error) {
      console.warn('無法載入機構名稱圖片:', error);
    }

    // 取得該年度的所有生命徵象記錄
    const { getVitalSignRecords } = useVitalSigns();
    const startDate = new Date(year, 0, 1); // 1月1日
    const endDate = new Date(year, 11, 31, 23, 59, 59); // 12月31日
    
    const allRecords = await getVitalSignRecords({
      clientId,
      startDate,
      endDate,
    });

    // 按月份分組並計算平均值/最新值
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      // 篩選該月份的記錄
      const monthRecords = allRecords.filter((record: any) => {
        const recordDate = record.measuredAt instanceof Date 
          ? record.measuredAt 
          : record.measuredAt.toDate?.() || new Date(record.measuredAt);
        return recordDate.getMonth() + 1 === month;
      });

      let weight = null;
      let bloodPressure = "/";
      let pulse = null;
      let bloodOxygen = null;
      let measuredBy = "";

      if (monthRecords.length > 0) {
        // 計算體重平均值
        const weights = monthRecords
          .map((r: any) => r.weight)
          .filter((w: any) => w !== null && w !== undefined);
        if (weights.length > 0) {
          weight = Math.round((weights.reduce((a: number, b: number) => a + b, 0) / weights.length) * 10) / 10;
        }

        // 計算血壓平均值
        const systolics = monthRecords
          .map((r: any) => r.systolic)
          .filter((s: any) => s !== null && s !== undefined);
        const diastolics = monthRecords
          .map((r: any) => r.diastolic)
          .filter((d: any) => d !== null && d !== undefined);
        
        if (systolics.length > 0 && diastolics.length > 0) {
          const avgSystolic = Math.round(systolics.reduce((a: number, b: number) => a + b, 0) / systolics.length);
          const avgDiastolic = Math.round(diastolics.reduce((a: number, b: number) => a + b, 0) / diastolics.length);
          bloodPressure = `${avgSystolic}/${avgDiastolic}`;
        }

        // 計算心率平均值 (脈搏)
        const heartRates = monthRecords
          .map((r: any) => r.heartRate)
          .filter((h: any) => h !== null && h !== undefined);
        if (heartRates.length > 0) {
          pulse = Math.round(heartRates.reduce((a: number, b: number) => a + b, 0) / heartRates.length);
        }

        // 計算血氧平均值
        const oxygens = monthRecords
          .map((r: any) => r.bloodOxygen)
          .filter((o: any) => o !== null && o !== undefined);
        if (oxygens.length > 0) {
          bloodOxygen = Math.round(oxygens.reduce((a: number, b: number) => a + b, 0) / oxygens.length);
        }

        // 取最後一筆記錄的紀錄者
        const lastRecord = monthRecords[monthRecords.length - 1];
        measuredBy = lastRecord?.recordedByName || "";
      }

      monthlyData.push({
        month,
        weight,
        bloodPressure,
        pulse,
        bloodOxygen,
        measuredBy,
      });
    }

    // 月份名稱
    const monthNames = [
      "1月", "2月", "3月", "4月", "5月", "6月",
      "7月", "8月", "9月", "10月", "11月", "12月"
    ];

    // 建立表格行
    const tableRows = [
      // 標題行
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: "月份", alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "體重", alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "血壓", alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "脈搏", alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 18, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "血氧", alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 18, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: "紀錄者", alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 19, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ];

    // 12個月的資料行
    monthlyData.forEach((data: any, index: number) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: monthNames[index], alignment: AlignmentType.CENTER })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: data.weight ? `${data.weight} kg` : "kg",
                alignment: AlignmentType.CENTER 
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: data.bloodPressure || "/",
                alignment: AlignmentType.CENTER 
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: data.pulse ? `${data.pulse} 分/次` : "分/次",
                alignment: AlignmentType.CENTER 
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: data.bloodOxygen ? `${data.bloodOxygen} %` : "%",
                alignment: AlignmentType.CENTER 
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: data.measuredBy || "",
                alignment: AlignmentType.CENTER 
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        })
      );
    });

    // 建立詳細測量記錄表格
    const detailTableRows = [
      // 標題行
      new TableRow({
        height: { value: 600, rule: "atLeast" },
        children: [
          new TableCell({
            children: [new Paragraph({ 
              text: "月份", 
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 12, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: "體重(kg)", 
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 16, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: "血壓(mmHg)", 
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: "脈搏(次/分)", 
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 18, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: "血氧(%)", 
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 16, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: "紀錄者", 
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 18, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ];

    // 按月份分組記錄（只顯示12個月）
    const monthlyRecords = new Map();
    allRecords.forEach((record: any) => {
      const recordDate = record.measuredAt instanceof Date 
        ? record.measuredAt 
        : record.measuredAt.toDate?.() || new Date(record.measuredAt);
      const month = recordDate.getMonth() + 1; // 1-12
      
      // 如果該月份還沒有記錄，或者這筆記錄更新，則更新
      if (!monthlyRecords.has(month)) {
        monthlyRecords.set(month, record);
      } else {
        const existing = monthlyRecords.get(month);
        const existingDate = existing.measuredAt instanceof Date 
          ? existing.measuredAt 
          : existing.measuredAt.toDate?.() || new Date(existing.measuredAt);
        if (recordDate > existingDate) {
          monthlyRecords.set(month, record);
        }
      }
    });

    // 按月份順序添加記錄
    for (let month = 1; month <= 12; month++) {
      const record = monthlyRecords.get(month);
      
      detailTableRows.push(
        new TableRow({
          height: { value: 550, rule: "atLeast" },
          children: [
            new TableCell({
              children: [new Paragraph({ 
                text: `${month}月`,
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: record?.weight ? `${record.weight}` : "—",
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: (record?.systolic && record?.diastolic) ? `${record.systolic}/${record.diastolic}` : "—",
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: record?.pulse ? `${record.pulse}` : "—",
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: record?.bloodOxygen ? `${record.bloodOxygen}` : "—",
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: record?.recordedByName || "",
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
              })],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        })
      );
    }

    const detailTable = new Table({
      rows: detailTableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
    });

    // 取得當前時間
    const currentDateTime = dayjs().format("YYYY年MM月DD日 HH:mm");

    // 建立文件
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            // 機構名稱 - 使用圖片或文字
            ...(logoNameImage ? [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: 'png',
                    data: logoNameImage,
                    transformation: {
                      width: 300,
                      height: 80
                    }
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 }
              })
            ] : [
              new Paragraph({
                text: "財團法人桃園市私立",
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
              }),
              new Paragraph({
                text: "寶貝潛能發展中心",
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 }
              })
            ]),
            // 輸出時間、姓名和性別
            new Paragraph({
              text: `輸出時間：${currentDateTime}　　姓名：${clientName}　　性別：${gender === "male" ? "男" : "女"}`,
              alignment: AlignmentType.LEFT,
              spacing: {
                after: 400,
              },
              run: {
                size: 24, // 12pt 字體
              },
            }),
            // 詳細記錄表格
            detailTable,
            // 血壓標準提示
            new Paragraph({
              text: "※備註：正常收縮壓 90-140 mmHg　正常舒張壓 60-90 mmHg　正常脈搏 60-100 次/分　正常血氧 95-100%",
              alignment: AlignmentType.LEFT,
              spacing: {
                before: 300,
              },
              run: {
                size: 20, // 10pt 字體
              },
            }),
          ],
        },
      ],
    });

    // 產生並下載檔案
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `生命徵象紀錄表_${clientName}_${year}年.docx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    exportVitalSignsToExcel,
    exportVitalSignsToWord,
    exportClassVitalSigns,
    exportRecordsToExcel,
    getCategoryLabel,
  };
};
