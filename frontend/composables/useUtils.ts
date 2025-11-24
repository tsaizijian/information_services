import dayjs from "dayjs";

/**
 * 通用工具函數
 */
export const useUtils = () => {
  /**
   * 轉換 Firestore Timestamp 為 JavaScript Date
   * 支援多種日期格式：
   * - Firestore Timestamp 物件
   * - ISO 字串
   * - JavaScript Date
   * - null/undefined
   */
  const toDate = (value: any): Date | null => {
    if (!value) return null;

    // Firestore Timestamp (有 toDate 方法)
    if (value?.toDate && typeof value.toDate === "function") {
      return value.toDate();
    }

    // Firestore Timestamp JSON 格式 {seconds, nanoseconds}
    if (value?.seconds !== undefined) {
      return new Date(value.seconds * 1000);
    }

    // ISO 字串或其他可轉換的格式
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  /**
   * 計算年齡（歲）
   */
  const calculateAge = (birthDate: any): number | null => {
    const date = toDate(birthDate);
    if (!date) return null;

    const birth = dayjs(date);
    if (!birth.isValid()) return null;

    return dayjs().diff(birth, "year");
  };

  /**
   * 格式化日期
   * @param date 日期
   * @param format 格式字串（dayjs 格式）
   */
  const formatDate = (date: any, format: string = "YYYY/MM/DD"): string => {
    const d = toDate(date);
    if (!d) return "-";

    const parsed = dayjs(d);
    return parsed.isValid() ? parsed.format(format) : "-";
  };

  /**
   * 格式化日期時間
   */
  const formatDateTime = (date: any): string => {
    return formatDate(date, "YYYY/MM/DD HH:mm");
  };

  return {
    toDate,
    calculateAge,
    formatDate,
    formatDateTime,
  };
};
