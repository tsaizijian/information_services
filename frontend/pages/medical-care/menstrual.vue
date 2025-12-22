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
            <i class="pi pi-heart text-pink-500"></i>
            生理期紀錄
          </h1>
        </div>
        <p class="text-gray-500 ml-12">追蹤女性個案生理期狀況，建立週期紀錄</p>
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
            <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <i class="pi pi-list text-pink-600 text-lg"></i>
            </div>
            <div>
              <span class="text-xl font-bold text-gray-800">紀錄列表</span>
              <p class="text-sm text-gray-500 mt-1">
                共 <span class="font-semibold text-pink-600">{{ filteredRecords.length }}</span> 筆紀錄
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
          sortField="startDate"
          :sortOrder="-1"
        >
          <Column field="startDate" header="開始日期" sortable style="min-width: 120px">
            <template #body="{ data }">
              <div>
                <p class="font-medium">{{ formatDate(data.startDate) }}</p>
                <p v-if="data.endDate" class="text-xs text-gray-400">
                  ~ {{ formatDate(data.endDate) }}
                </p>
              </div>
            </template>
          </Column>

          <Column field="clientName" header="個案" style="min-width: 100px">
            <template #body="{ data }">
              <span class="font-medium">{{ data.clientName }}</span>
            </template>
          </Column>

          <Column field="cycleDays" header="週期天數" style="min-width: 100px">
            <template #body="{ data }">
              <span v-if="data.cycleDays" class="font-medium">{{ data.cycleDays }} 天</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </Column>

          <Column field="flowAmount" header="經血量" style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="getFlowAmountLabel(data.flowAmount)" severity="info" />
            </template>
          </Column>

          <Column field="painLevel" header="腹痛程度" style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="getPainLevelLabel(data.painLevel)"
                :severity="getPainLevelSeverity(data.painLevel)"
              />
            </template>
          </Column>

          <Column field="accompanyingSymptoms" header="伴隨症狀" style="min-width: 180px">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="symptom in (data.accompanyingSymptoms || []).slice(0, 2)"
                  :key="symptom"
                  :value="getSymptomLabel(symptom)"
                  severity="secondary"
                  class="text-xs"
                />
                <Tag
                  v-if="(data.accompanyingSymptoms || []).length > 2"
                  :value="'+' + ((data.accompanyingSymptoms || []).length - 2)"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
            </template>
          </Column>

          <Column field="specialConditions" header="特別狀況" style="min-width: 120px">
            <template #body="{ data }">
              <div v-if="(data.specialConditions || []).length > 0" class="flex flex-wrap gap-1">
                <Tag
                  v-for="cond in (data.specialConditions || []).slice(0, 2)"
                  :key="cond"
                  :value="getSpecialConditionLabel(cond)"
                  severity="warn"
                  class="text-xs"
                />
                <Tag
                  v-if="(data.specialConditions || []).length > 2"
                  :value="'+' + ((data.specialConditions || []).length - 2)"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
              <span v-else class="text-gray-400">-</span>
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
            <i class="pi pi-heart text-5xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">目前沒有生理期紀錄</h3>
          <p class="text-gray-500 mb-6">開始記錄第一筆生理期紀錄吧！</p>
          <Button label="新增紀錄" icon="pi pi-plus" @click="openCreateDialog" />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯對話框 -->
    <Dialog
      v-model:visible="showFormDialog"
      :header="editingRecord ? '編輯生理期紀錄' : '新增生理期紀錄'"
      :modal="true"
      :style="{ width: '800px' }"
      :draggable="false"
      class="menstrual-dialog"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
            <i :class="editingRecord ? 'pi pi-pencil' : 'pi pi-plus'" class="text-pink-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold">{{ editingRecord ? '編輯生理期紀錄' : '新增生理期紀錄' }}</h3>
            <p class="text-sm text-gray-500">記錄生理期相關資訊</p>
          </div>
        </div>
      </template>

      <div class="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
        <!-- A. 基本資料區 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-user text-pink-500"></i>
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
                開始日期 <span class="text-red-500">*</span>
              </label>
              <DatePicker
                v-model="form.startDate"
                placeholder="選擇日期"
                dateFormat="yy/mm/dd"
                class="w-full"
                showIcon
                :invalid="!!formErrors.startDate"
              />
              <small v-if="formErrors.startDate" class="text-red-500">{{ formErrors.startDate }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                結束日期
              </label>
              <DatePicker
                v-model="form.endDate"
                placeholder="可補填"
                dateFormat="yy/mm/dd"
                class="w-full"
                showIcon
              />
              <small class="text-gray-400">結束後可回來補填</small>
            </div>
          </div>
        </div>

        <!-- B. 經期狀況 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-chart-bar text-pink-500"></i>
            經期狀況
          </h4>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                經血量 <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="form.flowAmount"
                :options="FLOW_AMOUNT_OPTIONS"
                optionLabel="label"
                optionValue="value"
                placeholder="選擇經血量"
                class="w-full"
                :invalid="!!formErrors.flowAmount"
              >
                <template #option="{ option }">
                  <div>
                    <span class="font-medium">{{ option.label }}</span>
                    <span v-if="option.description" class="text-xs text-gray-400 ml-2">
                      {{ option.description }}
                    </span>
                  </div>
                </template>
              </Select>
              <small v-if="formErrors.flowAmount" class="text-red-500">{{ formErrors.flowAmount }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                腹痛程度 <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="form.painLevel"
                :options="PAIN_LEVEL_OPTIONS"
                optionLabel="label"
                optionValue="value"
                placeholder="選擇腹痛程度"
                class="w-full"
                :invalid="!!formErrors.painLevel"
              >
                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <Tag :value="option.label" :severity="option.severity" class="text-xs" />
                    <span v-if="option.description" class="text-xs text-gray-400">
                      {{ option.description }}
                    </span>
                  </div>
                </template>
              </Select>
              <small v-if="formErrors.painLevel" class="text-red-500">{{ formErrors.painLevel }}</small>
            </div>
          </div>
        </div>

        <!-- C. 伴隨症狀 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-orange-500"></i>
            伴隨症狀（可多選）
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="option in MENSTRUAL_SYMPTOM_OPTIONS"
              :key="option.value"
              class="flex items-center gap-2"
            >
              <Checkbox
                v-model="form.accompanyingSymptoms"
                :inputId="'symptom-' + option.value"
                :value="option.value"
              />
              <label :for="'symptom-' + option.value" class="text-sm cursor-pointer">
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- D. 特別狀況 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            特別狀況（可多選）
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="option in SPECIAL_CONDITION_OPTIONS"
              :key="option.value"
              class="flex items-start gap-2"
            >
              <Checkbox
                v-model="form.specialConditions"
                :inputId="'special-' + option.value"
                :value="option.value"
              />
              <label :for="'special-' + option.value" class="cursor-pointer">
                <span class="text-sm font-medium">{{ option.label }}</span>
                <p v-if="option.description" class="text-xs text-gray-400">{{ option.description }}</p>
              </label>
            </div>
          </div>
        </div>

        <!-- E. 其他資訊 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="pi pi-info-circle text-blue-500"></i>
            其他資訊
          </h4>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="flex items-center gap-3">
              <Checkbox v-model="form.usedPainkiller" inputId="usedPainkiller" binary />
              <label for="usedPainkiller" class="cursor-pointer">
                <span class="font-medium">有服用止痛藥</span>
              </label>
            </div>
            <div class="flex items-center gap-3">
              <Checkbox v-model="form.affectedActivities" inputId="affectedActivities" binary />
              <label for="affectedActivities" class="cursor-pointer">
                <span class="font-medium">影響日常活動</span>
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
      header="生理期紀錄詳情"
      :modal="true"
      :style="{ width: '600px' }"
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
              <label class="text-sm text-gray-600">開始日期</label>
              <p class="font-semibold text-gray-800">{{ formatDate(viewingRecord.startDate) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">結束日期</label>
              <p class="font-semibold text-gray-800">
                {{ viewingRecord.endDate ? formatDate(viewingRecord.endDate) : '尚未結束' }}
              </p>
            </div>
            <div v-if="viewingRecord.cycleDays">
              <label class="text-sm text-gray-600">週期天數</label>
              <p class="font-semibold text-gray-800">{{ viewingRecord.cycleDays }} 天</p>
            </div>
          </div>

          <!-- 經期狀況 -->
          <div class="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label class="text-sm text-gray-600">經血量</label>
              <p class="font-semibold text-gray-800">{{ getFlowAmountLabel(viewingRecord.flowAmount) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">腹痛程度</label>
              <Tag
                :value="getPainLevelLabel(viewingRecord.painLevel)"
                :severity="getPainLevelSeverity(viewingRecord.painLevel)"
              />
            </div>
          </div>

          <!-- 伴隨症狀 -->
          <div v-if="viewingRecord.accompanyingSymptoms?.length">
            <label class="text-sm text-gray-600 mb-2 block">伴隨症狀</label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="s in viewingRecord.accompanyingSymptoms"
                :key="s"
                :value="getSymptomLabel(s)"
                severity="secondary"
              />
            </div>
          </div>

          <!-- 特別狀況 -->
          <div v-if="viewingRecord.specialConditions?.length" class="bg-yellow-50 rounded-lg p-4">
            <label class="text-sm text-yellow-700 font-semibold mb-2 block">
              <i class="pi pi-exclamation-triangle mr-1"></i>
              特別狀況
            </label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="c in viewingRecord.specialConditions"
                :key="c"
                :value="getSpecialConditionLabel(c)"
                severity="warn"
              />
            </div>
          </div>

          <!-- 其他資訊 -->
          <div class="grid grid-cols-2 gap-4 pb-4 border-b">
            <div class="flex items-center gap-2">
              <i :class="viewingRecord.usedPainkiller ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-gray-400'"></i>
              <span>{{ viewingRecord.usedPainkiller ? '有服用止痛藥' : '未服用止痛藥' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i :class="viewingRecord.affectedActivities ? 'pi pi-exclamation-circle text-orange-500' : 'pi pi-check-circle text-green-500'"></i>
              <span>{{ viewingRecord.affectedActivities ? '有影響日常活動' : '未影響日常活動' }}</span>
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
          <p class="text-gray-700">確定要刪除這筆生理期紀錄嗎？此操作無法復原。</p>
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
  useMenstrualRecords,
  FLOW_AMOUNT_OPTIONS,
  PAIN_LEVEL_OPTIONS,
  MENSTRUAL_SYMPTOM_OPTIONS,
  SPECIAL_CONDITION_OPTIONS,
  type MenstrualRecord,
} from '~/composables/useMenstrualRecords';

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
});

const toast = useToast();
const { userProfile } = useAuth();
const { fetchClients, clients: allClients } = useClients();
const {
  getMenstrualRecords,
  createMenstrualRecord,
  updateMenstrualRecord,
  deleteMenstrualRecord,
  getFlowAmountLabel,
  getPainLevelLabel,
  getPainLevelSeverity,
  getSymptomLabel,
  getSpecialConditionLabel,
} = useMenstrualRecords();

// 狀態
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const recordsData = ref<MenstrualRecord[]>([]);

// 對話框狀態
const showFormDialog = ref(false);
const showViewDialog = ref(false);
const showDeleteDialog = ref(false);
const editingRecord = ref<MenstrualRecord | null>(null);
const viewingRecord = ref<MenstrualRecord | null>(null);
const deletingRecord = ref<MenstrualRecord | null>(null);

// 篩選
const filterClientId = ref<string | null>(null);
const filterStartDate = ref<Date | null>(null);
const filterEndDate = ref<Date | null>(null);

// 表單
const form = ref({
  clientId: '',
  clientName: '',
  classId: '',
  startDate: new Date() as Date | null,
  endDate: null as Date | null,
  flowAmount: '',
  painLevel: '',
  accompanyingSymptoms: [] as string[],
  specialConditions: [] as string[],
  usedPainkiller: false,
  affectedActivities: false,
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
    startDate: new Date(),
    endDate: null,
    flowAmount: '',
    painLevel: '',
    accompanyingSymptoms: [],
    specialConditions: [],
    usedPainkiller: false,
    affectedActivities: false,
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

const viewRecord = (record: MenstrualRecord) => {
  viewingRecord.value = record;
  showViewDialog.value = true;
};

const editRecord = (record: MenstrualRecord) => {
  editingRecord.value = record;
  form.value = {
    clientId: record.clientId,
    clientName: record.clientName,
    classId: record.classId || '',
    startDate: record.startDate?.toDate ? record.startDate.toDate() : new Date(record.startDate),
    endDate: record.endDate ? (record.endDate.toDate ? record.endDate.toDate() : new Date(record.endDate)) : null,
    flowAmount: record.flowAmount || '',
    painLevel: record.painLevel || '',
    accompanyingSymptoms: record.accompanyingSymptoms || [],
    specialConditions: record.specialConditions || [],
    usedPainkiller: record.usedPainkiller || false,
    affectedActivities: record.affectedActivities || false,
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

const confirmDelete = (record: MenstrualRecord) => {
  deletingRecord.value = record;
  showDeleteDialog.value = true;
};

const validateForm = () => {
  formErrors.value = {};

  if (!form.value.clientId) {
    formErrors.value.clientId = '請選擇個案';
  }
  if (!form.value.startDate) {
    formErrors.value.startDate = '請選擇開始日期';
  }
  if (!form.value.flowAmount) {
    formErrors.value.flowAmount = '請選擇經血量';
  }
  if (!form.value.painLevel) {
    formErrors.value.painLevel = '請選擇腹痛程度';
  }

  return Object.keys(formErrors.value).length === 0;
};

const saveRecord = async () => {
  if (!validateForm()) return;

  saving.value = true;
  try {
    // 僅包含業務欄位，不包含 isPinned 和 pinnedBy，以保留釘選狀態
    const data = {
      clientId: form.value.clientId,
      clientName: form.value.clientName,
      classId: form.value.classId,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      flowAmount: form.value.flowAmount,
      painLevel: form.value.painLevel,
      accompanyingSymptoms: form.value.accompanyingSymptoms,
      specialConditions: form.value.specialConditions,
      usedPainkiller: form.value.usedPainkiller,
      affectedActivities: form.value.affectedActivities,
      notes: form.value.notes,
      recordedBy: userProfile.value?.id || '',
      recordedByName: userProfile.value?.displayName || '',
    };

    if (editingRecord.value?.id) {
      await updateMenstrualRecord(editingRecord.value.id, data);
      toast.add({ severity: 'success', summary: '更新成功', detail: '生理期紀錄已更新', life: 3000 });
    } else {
      await createMenstrualRecord(data);
      toast.add({ severity: 'success', summary: '建立成功', detail: '生理期紀錄已建立', life: 3000 });
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
    await deleteMenstrualRecord(deletingRecord.value.id);
    toast.add({ severity: 'success', summary: '刪除成功', detail: '生理期紀錄已刪除', life: 3000 });
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

    const records = await getMenstrualRecords(filters);
    recordsData.value = records;
  } catch (error) {
    console.error('載入失敗:', error);
    toast.add({ severity: 'error', summary: '載入失敗', detail: '無法取得生理期紀錄', life: 3000 });
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

  // 檢查是否有編輯查詢參數
  const route = useRoute();
  const editId = route.query.edit as string;
  if (editId) {
    // 等待記錄載入完成後,找到對應的記錄並打開編輯對話框
    nextTick(() => {
      const record = recordsData.value.find(r => r.id === editId);
      if (record) {
        editRecord(record);
      }
    });
  }
});
</script>

<style scoped>
.menstrual-dialog :deep(.p-dialog-content) {
  padding: 0 1.5rem;
}
</style>
