<template>
  <div class="space-y-6">
    <!-- 頁面標題與操作 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <i class="pi pi-file-edit text-primary"></i>
          照護紀錄
        </h1>
        <p class="text-gray-500 mt-2">記錄每一次的用心照顧與陪伴時光</p>
      </div>
      <Button
        label="新增紀錄"
        icon="pi pi-plus"
        size="large"
        @click="openCreateRecord"
        class="shadow-md"
      />
    </div>

    <!-- 搜尋與篩選卡片 -->
    <Card class="shadow-sm border-0">
      <template #content>
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-filter text-primary"></i>
          <span class="font-semibold text-gray-700">篩選條件</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-user text-sm"></i>
              個案
            </label>
            <Select
              v-model="selectedClient"
              :options="clientOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="全部個案"
              class="w-full"
              showClear
              filter
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-tag text-sm"></i>
              類型
            </label>
            <Select
              v-model="selectedType"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="全部類型"
              class="w-full"
              showClear
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-calendar text-sm"></i>
              開始日期
            </label>
            <DatePicker
              v-model="startDate"
              placeholder="選擇日期"
              dateFormat="yy/mm/dd"
              class="w-full"
              showIcon
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-calendar text-sm"></i>
              結束日期
            </label>
            <DatePicker
              v-model="endDate"
              placeholder="選擇日期"
              dateFormat="yy/mm/dd"
              class="w-full"
              showIcon
            />
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <Checkbox v-model="showPinnedOnly" inputId="pinnedOnly" binary />
          <label
            for="pinnedOnly"
            class="text-sm text-gray-600 cursor-pointer flex items-center gap-1"
          >
            <i class="pi pi-thumbtack text-orange-500"></i>
            只顯示釘選紀錄
          </label>
        </div>
      </template>
    </Card>

    <!-- 照護紀錄列表 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center justify-between py-2">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
            >
              <i class="pi pi-list text-green-600 text-lg"></i>
            </div>
            <div>
              <span class="text-xl font-bold text-gray-800">紀錄列表</span>
              <p class="text-sm text-gray-500 mt-1">
                共
                <span class="font-semibold text-green-600">{{
                  filteredRecords.length
                }}</span>
                筆紀錄
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <DataTable
          v-if="filteredRecords.length > 0"
          :value="filteredRecords"
          :loading="loading"
          stripedRows
          paginator
          :rows="15"
          :rowsPerPageOptions="[15, 30, 50]"
          class="rounded-lg"
          sortField="recordDate"
          :sortOrder="-1"
        >
          <Column style="width: 50px">
            <template #body="{ data }">
              <Button
                :icon="data.isPinned ? 'pi pi-thumbtack' : 'pi pi-thumbtack'"
                :class="data.isPinned ? 'text-orange-500' : 'text-gray-300'"
                text
                rounded
                @click="togglePin(data)"
                v-tooltip.top="data.isPinned ? '取消釘選' : '釘選紀錄'"
              />
            </template>
          </Column>
          <Column
            field="recordDate"
            header="日期"
            sortable
            style="min-width: 120px"
          >
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-blue-500 text-sm"></i>
                <span class="font-medium">{{
                  formatDate(data.recordDate)
                }}</span>
              </div>
            </template>
          </Column>
          <Column field="clientName" header="個案" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                >
                  <i class="pi pi-user text-blue-600 text-sm"></i>
                </div>
                <span class="font-medium">{{ data.clientName }}</span>
              </div>
            </template>
          </Column>
          <Column field="recordType" header="類型" style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="getTypeLabel(data.recordType)"
                :severity="getTypeSeverity(data.recordType)"
                rounded
              />
            </template>
          </Column>
          <Column field="content" header="內容" style="min-width: 300px">
            <template #body="{ data }">
              <div class="max-w-md">
                <p class="text-gray-700 line-clamp-2">{{ data.content }}</p>
              </div>
            </template>
          </Column>
          <Column field="recordedByName" header="記錄者" style="min-width: 100px">
            <template #body="{ data }">
              <span class="text-gray-600">{{ data.recordedByName || "-" }}</span>
            </template>
          </Column>
          <Column header="操作" style="min-width: 150px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  severity="info"
                  @click="viewRecord(data)"
                  v-tooltip.top="'查看詳情'"
                  class="hover:bg-blue-50"
                />
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="warn"
                  @click="editRecord(data)"
                  v-tooltip.top="'編輯紀錄'"
                  class="hover:bg-orange-50"
                />
                <Button
                  v-if="isAdmin"
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'刪除紀錄'"
                  class="hover:bg-red-50"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- 空狀態 -->
        <div v-else class="text-center py-16">
          <div
            class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4"
          >
            <i class="pi pi-file-edit text-5xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">
            目前沒有照護紀錄
          </h3>
          <p class="text-gray-500 mb-6">開始記錄第一筆照護內容吧！</p>
          <Button
            label="新增紀錄"
            icon="pi pi-plus"
            @click="openCreateRecord"
          />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯紀錄對話框 -->
    <Dialog
      v-model:visible="showRecordDialog"
      :header="editingRecord ? '編輯照護紀錄' : '新增照護紀錄'"
      :modal="true"
      :style="{ width: '700px' }"
      :draggable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
          >
            <i
              :class="editingRecord ? 'pi pi-pencil' : 'pi pi-plus'"
              class="text-green-600"
            ></i>
          </div>
          <div>
            <h3 class="text-lg font-bold">
              {{ editingRecord ? "編輯照護紀錄" : "新增照護紀錄" }}
            </h3>
            <p class="text-sm text-gray-500">記錄照護過程與觀察事項</p>
          </div>
        </div>
      </template>

      <div class="space-y-5 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              個案 <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="recordForm.clientId"
              :options="clientOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="請選擇個案"
              class="w-full"
              filter
              :invalid="!!formErrors.clientId"
            />
            <small v-if="formErrors.clientId" class="text-red-500 mt-1 block">
              <i class="pi pi-exclamation-circle mr-1"></i
              >{{ formErrors.clientId }}
            </small>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              紀錄日期 <span class="text-red-500">*</span>
            </label>
            <DatePicker
              v-model="recordForm.recordDate"
              placeholder="選擇日期"
              dateFormat="yy/mm/dd"
              class="w-full"
              showIcon
              :invalid="!!formErrors.recordDate"
            />
            <small v-if="formErrors.recordDate" class="text-red-500 mt-1 block">
              <i class="pi pi-exclamation-circle mr-1"></i
              >{{ formErrors.recordDate }}
            </small>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            紀錄類型 <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="recordForm.recordType"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="請選擇類型"
            class="w-full"
            :invalid="!!formErrors.recordType"
          />
          <small v-if="formErrors.recordType" class="text-red-500 mt-1 block">
            <i class="pi pi-exclamation-circle mr-1"></i
            >{{ formErrors.recordType }}
          </small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            照護內容 <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model="recordForm.content"
            rows="5"
            placeholder="請詳細記錄照護內容、觀察事項或特殊狀況..."
            class="w-full"
            :invalid="!!formErrors.content"
          />
          <small v-if="formErrors.content" class="text-red-500 mt-1 block">
            <i class="pi pi-exclamation-circle mr-1"></i
            >{{ formErrors.content }}
          </small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >備註</label
          >
          <Textarea
            v-model="recordForm.notes"
            rows="3"
            placeholder="其他需要記錄的事項..."
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="showRecordDialog = false"
            icon="pi pi-times"
          />
          <Button
            :label="editingRecord ? '儲存變更' : '新增紀錄'"
            @click="saveRecord"
            :loading="saving"
            icon="pi pi-check"
            class="shadow-md"
          />
        </div>
      </template>
    </Dialog>

    <!-- 查看詳情對話框 -->
    <Dialog
      v-model:visible="showViewDialog"
      header="照護紀錄詳情"
      :modal="true"
      :style="{ width: '700px' }"
      :draggable="false"
    >
      <template v-if="viewingRecord">
        <div class="space-y-4">
          <!-- 基本資訊 -->
          <div class="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label class="text-sm text-gray-600">個案姓名</label>
              <p class="text-lg font-semibold text-gray-800 mt-1">
                {{ viewingRecord.clientName }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">記錄日期</label>
              <p class="text-lg font-semibold text-gray-800 mt-1">
                {{ formatDate(viewingRecord.recordDate) }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">記錄類型</label>
              <div class="mt-1">
                <Tag
                  :value="getTypeLabel(viewingRecord.recordType)"
                  :severity="getTypeSeverity(viewingRecord.recordType)"
                  rounded
                />
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-600">記錄者</label>
              <p class="text-lg font-semibold text-gray-800 mt-1">
                {{ viewingRecord.recordedByName || "-" }}
              </p>
            </div>
          </div>

          <!-- 記錄內容 -->
          <div>
            <label class="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <i class="pi pi-file-edit text-primary"></i>
              照護內容
            </label>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700 whitespace-pre-wrap">
                {{ viewingRecord.content }}
              </p>
            </div>
          </div>

          <!-- 備註 -->
          <div v-if="viewingRecord.notes">
            <label class="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <i class="pi pi-comment text-primary"></i>
              備註說明
            </label>
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="text-gray-700 whitespace-pre-wrap">
                {{ viewingRecord.notes }}
              </p>
            </div>
          </div>

          <!-- 狀態標籤 -->
          <div class="flex items-center gap-3 pt-4 border-t">
            <Tag
              v-if="viewingRecord.isPinned"
              value="已釘選"
              severity="warning"
              icon="pi pi-thumbtack"
            />
            <Tag
              v-if="viewingRecord.handoverConfirmed"
              value="已確認交接"
              severity="success"
              icon="pi pi-check"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-between items-center">
          <Button
            label="查看個案"
            icon="pi pi-user"
            text
            @click="goToClient(viewingRecord)"
          />
          <div class="flex gap-3">
            <Button
              label="關閉"
              severity="secondary"
              outlined
              @click="showViewDialog = false"
              icon="pi pi-times"
            />
            <Button
              label="編輯"
              icon="pi pi-pencil"
              @click="editFromView(viewingRecord)"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- 刪除確認對話框 -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="確認刪除"
      :modal="true"
      :style="{ width: '450px' }"
      :draggable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"
          >
            <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">確認刪除紀錄</h3>
            <p class="text-sm text-gray-500">此操作無法復原</p>
          </div>
        </div>
      </template>

      <div class="py-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-gray-700">確定要刪除這筆照護紀錄嗎？</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="showDeleteDialog = false"
            icon="pi pi-times"
          />
          <Button
            label="確認刪除"
            severity="danger"
            @click="deleteRecord"
            :loading="deleting"
            icon="pi pi-trash"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import * as v from "valibot";
import dayjs from "dayjs";
import { useToast } from "primevue/usetoast";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const { toDate, formatDate: formatDateUtil } = useUtils();

// Valibot Schema
const RecordFormSchema = v.object({
  clientId: v.pipe(v.string(), v.minLength(1, "請選擇個案")),
  recordDate: v.date("請選擇日期"),
  recordType: v.pipe(v.string(), v.minLength(1, "請選擇類型")),
  content: v.pipe(v.string(), v.minLength(10, "內容至少需要10個字")),
  notes: v.optional(v.string()),
});

type RecordFormData = v.InferOutput<typeof RecordFormSchema>;

const { userProfile } = useAuth();
const {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord: removeRecord,
  togglePin: toggleRecordPin,
} = useRecords();
const { fetchClients, clients: allClients } = useClients();
const toast = useToast();

// 狀態
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showRecordDialog = ref(false);
const showDeleteDialog = ref(false);
const showViewDialog = ref(false);
const editingRecord = ref<any>(null);
const deletingRecord = ref<any>(null);
const viewingRecord = ref<any>(null);
const recordsData = ref<any[]>([]);

// 篩選
const selectedClient = ref(null);
const selectedType = ref(null);
const startDate = ref(null);
const endDate = ref(null);
const showPinnedOnly = ref(false);

// 表單
const recordForm = ref<RecordFormData>({
  clientId: "",
  recordDate: new Date(),
  recordType: "",
  content: "",
  notes: "",
});

const formErrors = ref<Partial<Record<keyof RecordFormData, string>>>({});

// 選項
const typeOptions = [
  { label: "日常照護", value: "daily_care" },
  { label: "健康觀察", value: "health_observation" },
  { label: "活動參與", value: "activity" },
  { label: "飲食紀錄", value: "meal" },
  { label: "行為記錄", value: "behavior" },
  { label: "特殊事件", value: "special_event" },
  { label: "其他", value: "other" },
];

const clientOptions = computed(() => {
  return allClients.value.map((client) => ({
    label: client.name,
    value: client.id,
  }));
});

// 計算屬性
const isAdmin = computed(() => userProfile.value?.role === "admin");

const filteredRecords = computed(() => {
  let result = recordsData.value || [];

  if (showPinnedOnly.value) {
    result = result.filter((r: any) => r.isPinned);
  }

  if (selectedClient.value) {
    result = result.filter((r: any) => r.clientId === selectedClient.value);
  }

  if (selectedType.value) {
    result = result.filter((r: any) => r.recordType === selectedType.value);
  }

  if (startDate.value) {
    result = result.filter(
      (r: any) => new Date(r.recordDate) >= new Date(startDate.value as any)
    );
  }

  if (endDate.value) {
    result = result.filter(
      (r: any) => new Date(r.recordDate) <= new Date(endDate.value as any)
    );
  }

  return result;
});

// 方法
const formatDate = (date: any) => {
  return formatDateUtil(date);
};

const getTypeLabel = (type: string) => {
  const option = typeOptions.find((o) => o.value === type);
  return option?.label || type;
};

const getTypeSeverity = (type: string) => {
  const severityMap: Record<string, string> = {
    daily_care: "info",
    health_observation: "warn",
    activity: "success",
    meal: "secondary",
    behavior: "contrast",
    special_event: "danger",
    other: "secondary",
  };
  return severityMap[type] || "secondary";
};

const togglePin = async (record: any) => {
  try {
    const currentIsPinned = record.isPinned;
    await toggleRecordPin(record.id, currentIsPinned);

    // 重新載入記錄以確保狀態同步
    await loadRecords();

    toast.add({
      severity: "success",
      summary: currentIsPinned ? "已取消釘選" : "已釘選",
      detail: "紀錄狀態已更新",
      life: 2000,
    });
  } catch (error) {
    console.error("釘選操作失敗:", error);
    toast.add({
      severity: "error",
      summary: "操作失敗",
      detail: "請稍後再試",
      life: 3000,
    });
  }
};

const viewRecord = (record: any) => {
  viewingRecord.value = record;
  showViewDialog.value = true;
};

const goToClient = (record: any) => {
  if (record?.clientId) {
    navigateTo(`/clients/${record.clientId}`);
  }
};

const editFromView = (record: any) => {
  showViewDialog.value = false;
  editRecord(record);
};

const editRecord = (record: any) => {
  editingRecord.value = record;
  recordForm.value = {
    clientId: record.clientId,
    recordDate: toDate(record.recordDate) || new Date(),
    recordType: record.recordType,
    content: record.content,
    notes: record.notes || "",
  };
  showRecordDialog.value = true;
};

const confirmDelete = (record: any) => {
  deletingRecord.value = record;
  showDeleteDialog.value = true;
};

const resetForm = () => {
  recordForm.value = {
    clientId: "",
    recordDate: new Date(),
    recordType: "",
    content: "",
    notes: "",
  };
  formErrors.value = {};
};

const saveRecord = async () => {
  saving.value = true;
  formErrors.value = {};

  try {
    const validatedData = v.parse(RecordFormSchema, recordForm.value);

    // 找到選中個案的資訊
    const selectedClientData = allClients.value.find(
      (c) => c.id === validatedData.clientId
    );

    const recordData = {
      clientId: validatedData.clientId,
      clientName: selectedClientData?.name || "",
      classId: selectedClientData?.classId || "",
      recordDate: validatedData.recordDate,
      recordType: validatedData.recordType,
      content: validatedData.content,
      notes: validatedData.notes || "",
      category: validatedData.recordType, // 保持相容性
    };

    if (editingRecord.value) {
      await updateRecord(editingRecord.value.id, recordData);
    } else {
      await createRecord(recordData);
    }

    await loadRecords();

    toast.add({
      severity: "success",
      summary: editingRecord.value ? "更新成功" : "新增成功",
      detail: "照護紀錄已儲存",
      life: 3000,
    });

    showRecordDialog.value = false;
    resetForm();
    editingRecord.value = null;
  } catch (error) {
    if (error instanceof v.ValiError) {
      error.issues.forEach((issue) => {
        const path = issue.path?.[0]?.key as keyof RecordFormData;
        if (path) {
          formErrors.value[path] = issue.message;
        }
      });
    } else {
      toast.add({
        severity: "error",
        summary: "儲存失敗",
        detail: "請稍後再試",
        life: 3000,
      });
    }
  } finally {
    saving.value = false;
  }
};

const deleteRecord = async () => {
  deleting.value = true;
  try {
    await removeRecord(deletingRecord.value.id);
    await loadRecords();

    toast.add({
      severity: "success",
      summary: "刪除成功",
      detail: "照護紀錄已刪除",
      life: 3000,
    });

    showDeleteDialog.value = false;
    deletingRecord.value = null;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "刪除失敗",
      detail: "請稍後再試",
      life: 3000,
    });
  } finally {
    deleting.value = false;
  }
};

const openCreateRecord = () => {
  editingRecord.value = null;
  resetForm();
  showRecordDialog.value = true;
};

const activeFilters = computed(() => {
  const filters: Record<string, any> = {};

  if (selectedClient.value) {
    filters.clientId = selectedClient.value;
  }
  if (selectedType.value) {
    filters.category = selectedType.value;
  }
  if (startDate.value) {
    filters.startDate = startDate.value;
  }
  if (endDate.value) {
    filters.endDate = endDate.value;
  }
  if (showPinnedOnly.value) {
    filters.isPinned = true;
  }

  return filters;
});

// 載入資料
const loadRecords = async (filters: Record<string, any> = activeFilters.value) => {
  loading.value = true;
  try {
    const data = await getRecords(filters);
    recordsData.value = data;
  } catch (error) {
    console.error("載入紀錄失敗:", error);
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法取得照護紀錄",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// 監聽篩選變化
watch(
  activeFilters,
  (filters) => {
    loadRecords(filters);
  },
  { deep: true }
);

// 初始化
onMounted(async () => {
  await fetchClients();
  await loadRecords();

  // 檢查 URL 查詢參數，如果有 action=new 則自動打開新增對話框
  const route = useRoute();
  if (route.query.action === 'new') {
    openCreateRecord();
    // 清除查詢參數，避免刷新時重複打開
    const router = useRouter();
    router.replace({ query: {} });
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
