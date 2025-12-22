import type { Ref } from 'vue';

/**
 * 處理從查詢參數打開編輯對話框的邏輯
 * @param records 記錄列表的 ref
 * @param editCallback 編輯記錄的回調函數
 * @returns 檢查查詢參數的函數
 */
export const useEditFromQuery = (
  records: Ref<any[]>,
  editCallback: (record: any) => void
) => {
  const route = useRoute();

  /**
   * 檢查 URL 查詢參數,如果有 edit 參數則自動打開編輯對話框
   */
  const checkEditQuery = () => {
    const editId = route.query.edit as string;
    if (editId) {
      // 使用 nextTick 確保 DOM 更新完成
      nextTick(() => {
        const record = records.value.find((r: any) => r.id === editId);
        if (record) {
          editCallback(record);
        } else {
          console.warn(`找不到 ID 為 ${editId} 的記錄`);
        }
      });
    }
  };

  return {
    checkEditQuery,
  };
};
