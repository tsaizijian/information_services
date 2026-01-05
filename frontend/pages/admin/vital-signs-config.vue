<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          生命徵象欄位設定
        </h1>
        <p class="text-gray-600">管理生命徵象記錄的欄位設定，支援 JSON 匯入/匯出</p>
      </div>

      <!-- Action Buttons -->
      <Card class="mb-6 shadow-lg">
        <template #content>
          <div class="flex flex-wrap gap-4">
            <Button
              label="匯入 JSON 設定"
              icon="pi pi-upload"
              @click="fileUploadRef?.choose()"
              severity="info"
              outlined
            />
            <Button
              label="匯出 JSON 設定"
              icon="pi pi-download"
              @click="exportConfig"
              severity="success"
              outlined
            />
            <Button
              label="下載範本"
              icon="pi pi-file"
              @click="downloadTemplate"
              severity="secondary"
              outlined
            />
            <Button
              label="初始化設定"
              icon="pi pi-refresh"
              @click="initializeConfigData"
              severity="warning"
              outlined
              v-if="!config"
            />
            <Button
              label="重置為預設值"
              icon="pi pi-replay"
              @click="confirmReset"
              severity="danger"
              outlined
            />
          </div>

          <!-- Hidden File Upload -->
          <FileUpload
            ref="fileUploadRef"
            mode="basic"
            accept=".json"
            :maxFileSize="1000000"
            @select="importConfig"
            :auto="true"
            chooseLabel="選擇檔案"
            class="hidden"
          />
        </template>
      </Card>

      <!-- Info Message -->
      <Message severity="info" :closable="false" class="mb-6">
        <div class="flex flex-col gap-2">
          <p class="font-semibold">💡 使用提示：</p>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>推薦使用 JSON 檔案管理設定，方便備份和版本控制</li>
            <li>修改後記得匯出備份，避免設定遺失</li>
            <li>至少需要啟用一個生命徵象欄位</li>
            <li>停用欄位後，歷史資料仍會保留</li>
          </ul>
        </div>
      </Message>

      <!-- Config Table -->
      <Card class="shadow-lg" v-if="config">
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-cog text-blue-600"></i>
            <span>欄位設定</span>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="config.vitalSignFields"
            class="p-datatable-sm"
            :paginator="false"
            responsiveLayout="scroll"
            :rowClass="rowClass"
            editMode="row"
            v-model:editingRows="editingRows"
            @row-edit-save="onRowEditSave"
          >
            <Column field="order" header="順序" :sortable="true" style="width: 5%">
              <template #body="{ data }">
                <Tag :value="data.order" severity="info" />
              </template>
              <template #editor="{ data, field }">
                <InputNumber
                  v-model="data[field]"
                  :min="1"
                  :max="20"
                  :step="1"
                  class="w-full"
                />
              </template>
            </Column>

            <Column field="label" header="欄位名稱" style="width: 12%">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i :class="`pi ${data.icon} text-${data.color}-600`"></i>
                  <span class="font-semibold">{{ data.label }}</span>
                </div>
              </template>
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" class="w-full" />
              </template>
            </Column>

            <Column field="key" header="識別碼" style="width: 10%">
              <template #body="{ data }">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{
                  data.key
                }}</code>
              </template>
            </Column>

            <Column field="enabled" header="啟用" style="width: 6%">
              <template #body="{ data }">
                <Checkbox v-model="data.enabled" :binary="true" />
              </template>
            </Column>

            <Column field="unit" header="單位" style="width: 8%">
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" class="w-full" />
              </template>
            </Column>

            <Column field="required" header="必填" style="width: 6%">
              <template #body="{ data }">
                <Checkbox v-model="data.required" :binary="true" />
              </template>
            </Column>

            <Column header="數值範圍" style="width: 15%">
              <template #body="{ data }">
                <span class="text-sm">
                  {{ data.min ?? "-" }} ~ {{ data.max ?? "-" }}
                </span>
              </template>
              <template #editor="{ data }">
                <div class="flex gap-2">
                  <InputNumber
                    v-model="data.min"
                    placeholder="最小"
                    :min="0"
                    class="w-1/2"
                  />
                  <InputNumber
                    v-model="data.max"
                    placeholder="最大"
                    :min="0"
                    class="w-1/2"
                  />
                </div>
              </template>
            </Column>

            <Column header="警戒值" style="width: 15%">
              <template #body="{ data }">
                <span
                  class="text-sm"
                  :class="{
                    'text-orange-600': data.thresholdMin || data.thresholdMax,
                  }"
                >
                  {{ data.thresholdMin ?? "-" }} ~ {{ data.thresholdMax ?? "-" }}
                </span>
              </template>
              <template #editor="{ data }">
                <div class="flex gap-2">
                  <InputNumber
                    v-model="data.thresholdMin"
                    placeholder="最小"
                    :min="0"
                    class="w-1/2"
                  />
                  <InputNumber
                    v-model="data.thresholdMax"
                    placeholder="最大"
                    :min="0"
                    class="w-1/2"
                  />
                </div>
              </template>
            </Column>

            <Column field="category" header="分類" style="width: 8%">
              <template #body="{ data }">
                <Tag
                  :value="data.category === 'vital' ? '生命徵象' : '身體測量'"
                  :severity="data.category === 'vital' ? 'success' : 'info'"
                />
              </template>
            </Column>

            <Column
              :rowEditor="true"
              style="width: 10%; min-width: 8rem"
              bodyStyle="text-align:center"
            >
            </Column>
          </DataTable>

          <!-- Save Button -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              label="取消"
              icon="pi pi-times"
              @click="cancelChanges"
              severity="secondary"
              outlined
            />
            <Button
              label="儲存設定"
              icon="pi pi-check"
              @click="saveConfig"
              :loading="saving"
            />
          </div>
        </template>
      </Card>

      <!-- No Config Message -->
      <Card class="shadow-lg" v-else>
        <template #content>
          <div class="text-center py-12">
            <i class="pi pi-info-circle text-6xl text-gray-400 mb-4"></i>
            <p class="text-xl text-gray-600 mb-4">尚未初始化設定</p>
            <p class="text-gray-500 mb-6">請點擊「初始化設定」按鈕開始使用</p>
            <Button
              label="初始化設定"
              icon="pi pi-refresh"
              @click="initializeConfigData"
              size="large"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import type { VitalSignConfig } from "~/composables/useVitalSignConfig";

// 中介軟體：僅管理員可訪問
definePageMeta({
  middleware: "role",
  role: "admin",
});

const toast = useToast();
const confirm = useConfirm();
const {
  config,
  loading,
  fetchConfig,
  updateConfig,
  initializeConfig,
  getDefaultConfig,
} = useVitalSignConfig();

const fileUploadRef = ref();
const saving = ref(false);
const editingRows = ref([]);
const originalConfig = ref<VitalSignConfig | null>(null);

// 載入設定
onMounted(async () => {
  await fetchConfig();
  if (config.value) {
    originalConfig.value = JSON.parse(JSON.stringify(config.value));
  }
});

// 匯出設定
const exportConfig = () => {
  if (!config.value) {
    toast.add({
      severity: "warn",
      summary: "無法匯出",
      detail: "尚未載入設定",
      life: 3000,
    });
    return;
  }

  const jsonStr = JSON.stringify(config.value, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vital-signs-config-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);

  toast.add({
    severity: "success",
    summary: "匯出成功",
    detail: "設定檔已下載",
    life: 3000,
  });
};

// 下載範本
const downloadTemplate = () => {
  const defaultConfig = getDefaultConfig();
  const jsonStr = JSON.stringify(defaultConfig, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vital-signs-template.json";
  link.click();
  URL.revokeObjectURL(url);

  toast.add({
    severity: "success",
    summary: "下載成功",
    detail: "範本檔案已下載",
    life: 3000,
  });
};

// 匯入設定
const importConfig = async (event: any) => {
  const file = event.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedConfig = JSON.parse(text);

    // 驗證 JSON 結構
    if (!validateConfigStructure(importedConfig)) {
      toast.add({
        severity: "error",
        summary: "格式錯誤",
        detail: "JSON 格式不正確，請檢查必要欄位",
        life: 5000,
      });
      return;
    }

    // 確認對話框
    confirm.require({
      message: "確定要匯入此設定？這將覆蓋當前設定。",
      header: "確認匯入",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "確定",
      rejectLabel: "取消",
      accept: async () => {
        try {
          await updateConfig(importedConfig);
          originalConfig.value = JSON.parse(JSON.stringify(importedConfig));
          toast.add({
            severity: "success",
            summary: "匯入成功",
            detail: "設定已更新",
            life: 3000,
          });
        } catch (error: any) {
          toast.add({
            severity: "error",
            summary: "匯入失敗",
            detail: error.message || "更新設定時發生錯誤",
            life: 5000,
          });
        }
      },
    });
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "解析失敗",
      detail: "無法解析 JSON 檔案：" + error.message,
      life: 5000,
    });
  }
};

// 驗證 JSON 結構
const validateConfigStructure = (config: any): boolean => {
  if (!config.vitalSignFields || !Array.isArray(config.vitalSignFields)) {
    return false;
  }

  // 檢查每個欄位是否有必要屬性
  const isValid = config.vitalSignFields.every(
    (field: any) =>
      field.key &&
      field.label &&
      typeof field.enabled === "boolean" &&
      field.category
  );

  if (!isValid) return false;

  // 檢查是否至少有一個啟用的欄位
  const hasEnabledField = config.vitalSignFields.some(
    (field: any) => field.enabled
  );

  return hasEnabledField;
};

// 初始化設定
const initializeConfigData = async () => {
  confirm.require({
    message: "確定要初始化設定？這將建立預設的欄位設定。",
    header: "確認初始化",
    icon: "pi pi-question-circle",
    acceptLabel: "確定",
    rejectLabel: "取消",
    accept: async () => {
      try {
        await initializeConfig();
        await fetchConfig();
        if (config.value) {
          originalConfig.value = JSON.parse(JSON.stringify(config.value));
        }
        toast.add({
          severity: "success",
          summary: "初始化成功",
          detail: "設定已建立",
          life: 3000,
        });
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "初始化失敗",
          detail: error.message || "建立設定時發生錯誤",
          life: 5000,
        });
      }
    },
  });
};

// 重置為預設值
const confirmReset = () => {
  confirm.require({
    message: "確定要重置為預設值？這將覆蓋所有自訂設定。",
    header: "確認重置",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "確定",
    rejectLabel: "取消",
    acceptClass: "p-button-danger",
    accept: async () => {
      const defaultConfig = getDefaultConfig();
      config.value = defaultConfig;
      toast.add({
        severity: "info",
        summary: "已重置",
        detail: "設定已重置為預設值，請記得儲存",
        life: 3000,
      });
    },
  });
};

// 儲存設定
const saveConfig = async () => {
  if (!config.value) return;

  // 驗證至少有一個啟用的欄位
  const hasEnabledField = config.value.vitalSignFields.some((f) => f.enabled);
  if (!hasEnabledField) {
    toast.add({
      severity: "warn",
      summary: "驗證失敗",
      detail: "至少需要啟用一個欄位",
      life: 3000,
    });
    return;
  }

  saving.value = true;
  try {
    await updateConfig(config.value);
    originalConfig.value = JSON.parse(JSON.stringify(config.value));
    toast.add({
      severity: "success",
      summary: "儲存成功",
      detail: "設定已更新",
      life: 3000,
    });
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "儲存失敗",
      detail: error.message || "更新設定時發生錯誤",
      life: 5000,
    });
  } finally {
    saving.value = false;
  }
};

// 取消變更
const cancelChanges = () => {
  if (originalConfig.value) {
    config.value = JSON.parse(JSON.stringify(originalConfig.value));
    toast.add({
      severity: "info",
      summary: "已取消",
      detail: "變更已還原",
      life: 3000,
    });
  }
};

// 行編輯儲存
const onRowEditSave = (event: any) => {
  const { newData, index } = event;
  if (config.value) {
    config.value.vitalSignFields[index] = newData;
  }
};

// 行樣式
const rowClass = (data: any) => {
  return data.enabled ? "" : "opacity-50";
};
</script>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > tr.opacity-50) {
  background-color: #f3f4f6;
}
</style>
