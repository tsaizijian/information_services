<template>
  <div class="space-y-6">
    <!-- 頁面標題與操作 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button
            icon="pi pi-arrow-left"
            text
            rounded
            @click="navigateTo('/medical-care')"
          />
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i class="pi pi-face-smile text-blue-500"></i>
            情緒異常紀錄
          </h1>
        </div>
        <p class="text-gray-500 ml-12">追蹤個案情緒與行為異常事件，建立系統化紀錄</p>
      </div>
      <Button
        label="新增紀錄"
        icon="pi pi-plus"
        size="large"
        @click="openCreateDialog"
        class="shadow-md"
      />
    </div>

    <!-- 篩選卡片 -->
    <Card class="shadow-sm border-0">
      <template #content>
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-filter text-primary"></i>
          <span class="font-semibold text-gray-700">篩選條件</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">個案</label>
            <Select
              v-model="filterClientId"
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
            <label class="text-sm font-medium text-gray-600">開始日期</label>
            <DatePicker
              v-model="filterStartDate"
              placeholder="選擇日期"
              dateFormat="yy/mm/dd"
              class="w-full"
              showIcon
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">結束日期</label>
            <DatePicker
              v-model="filterEndDate"
              placeholder="選擇日期"
              dateFormat="yy/mm/dd"
              class="w-full"
              showIcon
            />
          </div>
          <div class="flex items-end">
            <Button
              label="重置篩選"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              @click="resetFilters"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 紀錄列表 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center justify-between py-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="pi pi-list text-blue-600 text-lg"></i>
            </div>
            <div>
              <span class="text-xl font-bold text-gray-800">紀錄列表</span>
              <p class="text-sm text-gray-500 mt-1">
                共 <span class="font-semibold text-blue-600">{{ filteredRecords.length }}</span> 筆紀錄
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
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          class="rounded-lg"
          sortField="occurredDate"
          :sortOrder="-1"
        >
          <Column field="occurredDate" header="發生時間" sortable style="min-width: 140px">
            <template #body="{ data }">
              <div>
                <p class="font-medium">{{ formatDate(data.occurredDate) }}</p>
                <p class="text-xs text-gray-400">{{ data.occurredTime }}</p>
              </div>
            </template>
          </Column>

          <Column field="clientName" header="個案" style="min-width: 100px">
            <template #body="{ data }">
              <span class="font-medium">{{ data.clientName }}</span>
            </template>
          </Column>

          <Column field="context" header="情境" style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="getContextLabel(data.context)" severity="info" />
            </template>
          </Column>

          <Column field="symptoms" header="異常症狀" style="min-width: 200px">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="symptom in (data.symptoms || []).slice(0, 3)"
                  :key="symptom"
                  :value="getSymptomLabel(symptom)"
                  severity="warn"
                  class="text-xs"
                />
                <Tag
                  v-if="(data.symptoms || []).length > 3"
                  :value="'+' + ((data.symptoms || []).length - 3)"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
            </template>
          </Column>

          <Column field="durationMinutes" header="持續時間" style="min-width: 100px">
            <template #body="{ data }">
              <span v-if="data.durationMinutes">{{ data.durationMinutes }} 分鐘</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </Column>

          <Column field="needEmergency" header="急診" style="min-width: 80px">
            <template #body="{ data }">
              <Tag
                v-if="data.needEmergency"
                value="是"
                severity="danger"
              />
              <span v-else class="text-gray-400">否</span>
            </template>
          </Column>

          <Column header="操作" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  severity="info"
                  @click="viewRecord(data)"
                  v-tooltip.top="'查看詳情'"
                />
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="warn"
                  @click="editRecord(data)"
                  v-tooltip.top="'編輯'"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'刪除'"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- 空狀態 -->
        <div v-else class="text-center py-16">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
            <i class="pi pi-face-smile text-5xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">目前沒有情緒紀錄</h3>
          <p class="text-gray-500 mb-6">開始記錄第一筆情緒異常事件吧！</p>
          <Button label="新增紀錄" icon="pi pi-plus" @click="openCreateDialog" />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯對話框 -->
    <Dialog
      v-model:visible="showFormDialog"
      :header="editingRecord ? '編輯情緒紀錄' : '新增情緒紀錄'"
      :modal="true"
      :style="{ width: '900px' }"
      :draggable="false"
      class="emotion-dialog"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <i :class="editingRecord ? 'pi pi-pencil' : 'pi pi-plus'" class="text-blue-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold">{{ editingRecord ? '編輯情緒紀錄' : '新增情緒紀錄' }}</h3>
            <p class="text-sm text-gray-500">記錄情緒異常事件的詳細資訊</p>
          </div>
        </div>
      </template>

      <div class="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
        <!-- A. 基本資料區 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-user text-blue-500"></i>
            基本資料
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                個案 <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="form.clientId"
                :options="clientOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="選擇個案"
                class="w-full"
                filter
                :invalid="!!formErrors.clientId"
                @change="onClientChange"
              />
              <small v-if="formErrors.clientId" class="text-red-500">{{ formErrors.clientId }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                發生日期 <span class="text-red-500">*</span>
              </label>
              <DatePicker
                v-model="form.occurredDate"
                placeholder="選擇日期"
                dateFormat="yy/mm/dd"
                class="w-full"
                showIcon
                :invalid="!!formErrors.occurredDate"
              />
              <small v-if="formErrors.occurredDate" class="text-red-500">{{ formErrors.occurredDate }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                發生時間 <span class="text-red-500">*</span>
              </label>
              <InputMask
                v-model="form.occurredTime"
                mask="99:99"
                placeholder="HH:mm"
                class="w-full"
                :invalid="!!formErrors.occurredTime"
              />
              <small v-if="formErrors.occurredTime" class="text-red-500">{{ formErrors.occurredTime }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                發生情境 <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="form.context"
                :options="CONTEXT_OPTIONS"
                optionLabel="label"
                optionValue="value"
                placeholder="選擇情境"
                class="w-full"
                :invalid="!!formErrors.context"
              />
              <small v-if="formErrors.context" class="text-red-500">{{ formErrors.context }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">天氣/氣溫</label>
              <InputText v-model="form.weather" placeholder="如：悶熱 32度" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">持續時間（分鐘）</label>
              <InputNumber v-model="form.durationMinutes" placeholder="分鐘" class="w-full" :min="0" />
            </div>
          </div>
        </div>

        <!-- B. 引起異常因素 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-orange-500"></i>
            引起異常因素（可多選）
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="option in TRIGGER_OPTIONS"
              :key="option.value"
              class="flex items-start gap-2"
            >
              <Checkbox
                v-model="form.triggers"
                :inputId="'trigger-' + option.value"
                :value="option.value"
              />
              <label :for="'trigger-' + option.value" class="cursor-pointer">
                <span class="text-sm font-medium">{{ option.label }}</span>
                <p v-if="option.description" class="text-xs text-gray-400">{{ option.description }}</p>
              </label>
            </div>
          </div>
        </div>

        <!-- C. 異常行為症狀 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-bolt text-red-500"></i>
            異常行為症狀（可多選）<span class="text-red-500">*</span>
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="option in SYMPTOM_OPTIONS"
              :key="option.value"
              class="flex items-center gap-2"
            >
              <Checkbox
                v-model="form.symptoms"
                :inputId="'symptom-' + option.value"
                :value="option.value"
              />
              <label :for="'symptom-' + option.value" class="text-sm cursor-pointer">
                {{ option.label }}
              </label>
            </div>
          </div>
          <small v-if="formErrors.symptoms" class="text-red-500 mt-2 block">{{ formErrors.symptoms }}</small>
        </div>

        <!-- D. 處理過程 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-shield text-green-500"></i>
            處理過程（可多選）
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="option in TREATMENT_OPTIONS"
              :key="option.value"
              class="flex items-start gap-2"
            >
              <Checkbox
                v-model="form.treatments"
                :inputId="'treatment-' + option.value"
                :value="option.value"
              />
              <label :for="'treatment-' + option.value" class="cursor-pointer">
                <span class="text-sm font-medium">{{ option.label }}</span>
                <p v-if="option.description" class="text-xs text-gray-400">{{ option.description }}</p>
              </label>
            </div>
          </div>
        </div>

        <!-- E. 是否急診/就醫 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-heart text-red-500"></i>
            是否需要急診/就醫
          </h4>
          <div class="flex items-center gap-4 mb-4">
            <div class="flex items-center gap-2">
              <Checkbox v-model="form.needEmergency" inputId="needEmergency" binary />
              <label for="needEmergency" class="font-medium cursor-pointer">需要急診/就醫</label>
            </div>
          </div>
          <div v-if="form.needEmergency" class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t">
            <div
              v-for="option in EMERGENCY_OPTIONS"
              :key="option.value"
              class="flex items-start gap-2"
            >
              <Checkbox
                v-model="form.emergencyActions"
                :inputId="'emergency-' + option.value"
                :value="option.value"
              />
              <label :for="'emergency-' + option.value" class="cursor-pointer">
                <span class="text-sm font-medium">{{ option.label }}</span>
                <p v-if="option.description" class="text-xs text-gray-400">{{ option.description }}</p>
              </label>
            </div>
          </div>
        </div>

        <!-- F. 備註 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-comment text-gray-500"></i>
            備註說明
          </h4>
          <Textarea
            v-model="form.notes"
            rows="4"
            placeholder="描述事件經過、前因後果等（建議 100-200 字）"
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
            @click="showFormDialog = false"
            icon="pi pi-times"
          />
          <Button
            :label="editingRecord ? '儲存變更' : '建立紀錄'"
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
      header="情緒紀錄詳情"
      :modal="true"
      :style="{ width: '700px' }"
      :draggable="false"
    >
      <template v-if="viewingRecord">
        <div class="space-y-4">
          <!-- 基本資訊 -->
          <div class="grid grid-cols-3 gap-4 pb-4 border-b">
            <div>
              <label class="text-sm text-gray-600">個案姓名</label>
              <p class="font-semibold text-gray-800">{{ viewingRecord.clientName }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">發生時間</label>
              <p class="font-semibold text-gray-800">
                {{ formatDate(viewingRecord.occurredDate) }} {{ viewingRecord.occurredTime }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">發生情境</label>
              <p class="font-semibold text-gray-800">{{ getContextLabel(viewingRecord.context) }}</p>
            </div>
            <div v-if="viewingRecord.weather">
              <label class="text-sm text-gray-600">天氣/氣溫</label>
              <p class="font-semibold text-gray-800">{{ viewingRecord.weather }}</p>
            </div>
            <div v-if="viewingRecord.durationMinutes">
              <label class="text-sm text-gray-600">持續時間</label>
              <p class="font-semibold text-gray-800">{{ viewingRecord.durationMinutes }} 分鐘</p>
            </div>
          </div>

          <!-- 引起因素 -->
          <div v-if="viewingRecord.triggers?.length">
            <label class="text-sm text-gray-600 mb-2 block">引起異常因素</label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="t in viewingRecord.triggers"
                :key="t"
                :value="getTriggerLabel(t)"
                severity="warn"
              />
            </div>
          </div>

          <!-- 異常症狀 -->
          <div v-if="viewingRecord.symptoms?.length">
            <label class="text-sm text-gray-600 mb-2 block">異常行為症狀</label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="s in viewingRecord.symptoms"
                :key="s"
                :value="getSymptomLabel(s)"
                severity="danger"
              />
            </div>
          </div>

          <!-- 處理過程 -->
          <div v-if="viewingRecord.treatments?.length">
            <label class="text-sm text-gray-600 mb-2 block">處理過程</label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="t in viewingRecord.treatments"
                :key="t"
                :value="getTreatmentLabel(t)"
                severity="success"
              />
            </div>
          </div>

          <!-- 急診情況 -->
          <div v-if="viewingRecord.needEmergency" class="bg-red-50 rounded-lg p-4">
            <label class="text-sm text-red-600 font-semibold mb-2 block">
              <i class="pi pi-exclamation-triangle mr-1"></i>
              需要急診/就醫
            </label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="e in viewingRecord.emergencyActions"
                :key="e"
                :value="getEmergencyLabel(e)"
                severity="danger"
              />
            </div>
          </div>

          <!-- 備註 -->
          <div v-if="viewingRecord.notes">
            <label class="text-sm text-gray-600 mb-2 block">備註說明</label>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700 whitespace-pre-wrap">{{ viewingRecord.notes }}</p>
            </div>
          </div>

          <!-- 記錄資訊 -->
          <div class="pt-4 border-t text-sm text-gray-500">
            <p>記錄者：{{ viewingRecord.recordedByName }}</p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="關閉"
            severity="secondary"
            outlined
            @click="showViewDialog = false"
          />
          <Button
            label="編輯"
            icon="pi pi-pencil"
            @click="editFromView"
          />
        </div>
      </template>
    </Dialog>

    <!-- 刪除確認對話框 -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="確認刪除"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="py-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-gray-700">確定要刪除這筆情緒紀錄嗎？此操作無法復原。</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button label="取消" severity="secondary" outlined @click="showDeleteDialog = false" />
          <Button label="確認刪除" severity="danger" @click="doDelete" :loading="deleting" icon="pi pi-trash" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { useToast } from 'primevue/usetoast';
import {
  useEmotionRecords,
  CONTEXT_OPTIONS,
  TRIGGER_OPTIONS,
  SYMPTOM_OPTIONS,
  TREATMENT_OPTIONS,
  EMERGENCY_OPTIONS,
  type EmotionRecord,
} from '~/composables/useEmotionRecords';

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
});

const toast = useToast();
const { userProfile } = useAuth();
const { fetchClients, clients: allClients } = useClients();
const {
  getEmotionRecords,
  createEmotionRecord,
  updateEmotionRecord,
  deleteEmotionRecord,
  getContextLabel,
  getTriggerLabel,
  getSymptomLabel,
  getTreatmentLabel,
  getEmergencyLabel,
} = useEmotionRecords();

// 狀態
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const recordsData = ref<EmotionRecord[]>([]);

// 對話框狀態
const showFormDialog = ref(false);
const showViewDialog = ref(false);
const showDeleteDialog = ref(false);
const editingRecord = ref<EmotionRecord | null>(null);
const viewingRecord = ref<EmotionRecord | null>(null);
const deletingRecord = ref<EmotionRecord | null>(null);

// 篩選
const filterClientId = ref<string | null>(null);
const filterStartDate = ref<Date | null>(null);
const filterEndDate = ref<Date | null>(null);

// 表單
const form = ref({
  clientId: '',
  clientName: '',
  classId: '',
  occurredDate: new Date(),
  occurredTime: '',
  context: '',
  weather: '',
  durationMinutes: null as number | null,
  triggers: [] as string[],
  symptoms: [] as string[],
  treatments: [] as string[],
  emergencyActions: [] as string[],
  needEmergency: false,
  notes: '',
});

const formErrors = ref<Record<string, string>>({});

// 計算屬性
const clientOptions = computed(() => {
  return allClients.value.map(c => ({
    label: c.name,
    value: c.id,
    classId: c.classId,
  }));
});

const filteredRecords = computed(() => {
  let result = recordsData.value;

  if (filterClientId.value) {
    result = result.filter(r => r.clientId === filterClientId.value);
  }

  return result;
});

// 方法
const formatDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return dayjs(d).format('YYYY/MM/DD');
};

const resetForm = () => {
  form.value = {
    clientId: '',
    clientName: '',
    classId: '',
    occurredDate: new Date(),
    occurredTime: dayjs().format('HH:mm'),
    context: '',
    weather: '',
    durationMinutes: null,
    triggers: [],
    symptoms: [],
    treatments: [],
    emergencyActions: [],
    needEmergency: false,
    notes: '',
  };
  formErrors.value = {};
};

const openCreateDialog = () => {
  editingRecord.value = null;
  resetForm();
  showFormDialog.value = true;
};

const onClientChange = () => {
  const client = allClients.value.find(c => c.id === form.value.clientId);
  if (client) {
    form.value.clientName = client.name;
    form.value.classId = client.classId || '';
  }
};

const viewRecord = (record: EmotionRecord) => {
  viewingRecord.value = record;
  showViewDialog.value = true;
};

const editRecord = (record: EmotionRecord) => {
  editingRecord.value = record;
  form.value = {
    clientId: record.clientId,
    clientName: record.clientName,
    classId: record.classId || '',
    occurredDate: record.occurredDate?.toDate ? record.occurredDate.toDate() : new Date(record.occurredDate),
    occurredTime: record.occurredTime || '',
    context: record.context || '',
    weather: record.weather || '',
    durationMinutes: record.durationMinutes || null,
    triggers: record.triggers || [],
    symptoms: record.symptoms || [],
    treatments: record.treatments || [],
    emergencyActions: record.emergencyActions || [],
    needEmergency: record.needEmergency || false,
    notes: record.notes || '',
  };
  formErrors.value = {};
  showFormDialog.value = true;
};

const editFromView = () => {
  if (viewingRecord.value) {
    showViewDialog.value = false;
    editRecord(viewingRecord.value);
  }
};

const confirmDelete = (record: EmotionRecord) => {
  deletingRecord.value = record;
  showDeleteDialog.value = true;
};

const validateForm = () => {
  formErrors.value = {};

  if (!form.value.clientId) {
    formErrors.value.clientId = '請選擇個案';
  }
  if (!form.value.occurredDate) {
    formErrors.value.occurredDate = '請選擇發生日期';
  }
  if (!form.value.occurredTime) {
    formErrors.value.occurredTime = '請輸入發生時間';
  }
  if (!form.value.context) {
    formErrors.value.context = '請選擇發生情境';
  }
  if (form.value.symptoms.length === 0) {
    formErrors.value.symptoms = '請至少選擇一個異常症狀';
  }

  return Object.keys(formErrors.value).length === 0;
};

const saveRecord = async () => {
  if (!validateForm()) return;

  saving.value = true;
  try {
    const data = {
      clientId: form.value.clientId,
      clientName: form.value.clientName,
      classId: form.value.classId,
      occurredDate: form.value.occurredDate,
      occurredTime: form.value.occurredTime,
      context: form.value.context,
      weather: form.value.weather,
      durationMinutes: form.value.durationMinutes,
      triggers: form.value.triggers,
      symptoms: form.value.symptoms,
      treatments: form.value.treatments,
      emergencyActions: form.value.needEmergency ? form.value.emergencyActions : [],
      needEmergency: form.value.needEmergency,
      notes: form.value.notes,
      recordedBy: userProfile.value?.id || '',
      recordedByName: userProfile.value?.displayName || '',
    };

    if (editingRecord.value?.id) {
      await updateEmotionRecord(editingRecord.value.id, data);
      toast.add({ severity: 'success', summary: '更新成功', detail: '情緒紀錄已更新', life: 3000 });
    } else {
      await createEmotionRecord(data);
      toast.add({ severity: 'success', summary: '建立成功', detail: '情緒紀錄已建立', life: 3000 });
    }

    showFormDialog.value = false;
    await loadRecords();
  } catch (error) {
    console.error('儲存失敗:', error);
    toast.add({ severity: 'error', summary: '儲存失敗', detail: '請稍後再試', life: 3000 });
  } finally {
    saving.value = false;
  }
};

const doDelete = async () => {
  if (!deletingRecord.value?.id) return;

  deleting.value = true;
  try {
    await deleteEmotionRecord(deletingRecord.value.id);
    toast.add({ severity: 'success', summary: '刪除成功', detail: '情緒紀錄已刪除', life: 3000 });
    showDeleteDialog.value = false;
    await loadRecords();
  } catch (error) {
    console.error('刪除失敗:', error);
    toast.add({ severity: 'error', summary: '刪除失敗', detail: '請稍後再試', life: 3000 });
  } finally {
    deleting.value = false;
  }
};

const resetFilters = () => {
  filterClientId.value = null;
  filterStartDate.value = null;
  filterEndDate.value = null;
};

const loadRecords = async () => {
  loading.value = true;
  try {
    const filters: any = {};
    if (filterStartDate.value) filters.startDate = filterStartDate.value;
    if (filterEndDate.value) filters.endDate = filterEndDate.value;

    const records = await getEmotionRecords(filters);
    recordsData.value = records;
  } catch (error) {
    console.error('載入失敗:', error);
    toast.add({ severity: 'error', summary: '載入失敗', detail: '無法取得情緒紀錄', life: 3000 });
  } finally {
    loading.value = false;
  }
};

// 監聽篩選變化
watch([filterStartDate, filterEndDate], () => {
  loadRecords();
});

// 初始化
onMounted(async () => {
  await fetchClients();
  await loadRecords();
});
</script>

<style scoped>
.emotion-dialog :deep(.p-dialog-content) {
  padding: 0 1.5rem;
}
</style>
