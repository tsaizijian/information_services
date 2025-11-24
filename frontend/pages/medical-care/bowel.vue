<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button icon="pi pi-arrow-left" text rounded @click="navigateTo('/medical-care')" />
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i class="pi pi-clock text-orange-500"></i>
            解便紀錄
          </h1>
        </div>
        <p class="text-gray-500 ml-12">追蹤個案排便狀況與腸胃健康</p>
      </div>
      <Button label="新增紀錄" icon="pi pi-plus" size="large" @click="openCreateDialog" class="shadow-md" />
    </div>

    <!-- 篩選 -->
    <Card class="shadow-sm border-0">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">個案</label>
            <Select v-model="filterClientId" :options="clientOptions" optionLabel="label" optionValue="value" placeholder="全部個案" class="w-full" showClear filter />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">開始日期</label>
            <DatePicker v-model="filterStartDate" dateFormat="yy/mm/dd" class="w-full" showIcon />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">結束日期</label>
            <DatePicker v-model="filterEndDate" dateFormat="yy/mm/dd" class="w-full" showIcon />
          </div>
          <div class="flex items-end">
            <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" class="w-full" />
          </div>
        </div>
      </template>
    </Card>

    <!-- 列表 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <i class="pi pi-list text-orange-600"></i>
          </div>
          <span>紀錄列表（{{ filteredRecords.length }} 筆）</span>
        </div>
      </template>
      <template #content>
        <DataTable v-if="filteredRecords.length > 0" :value="filteredRecords" :loading="loading" stripedRows paginator :rows="10" sortField="occurredDate" :sortOrder="-1">
          <Column field="occurredDate" header="日期時間" sortable style="min-width: 140px">
            <template #body="{ data }">
              <div>
                <p class="font-medium">{{ formatDate(data.occurredDate) }}</p>
                <p class="text-xs text-gray-400">{{ data.occurredTime }}</p>
              </div>
            </template>
          </Column>
          <Column field="clientName" header="個案" style="min-width: 100px" />
          <Column field="amount" header="解便量" style="min-width: 80px">
            <template #body="{ data }">
              <Tag :value="getAmountLabel(data.amount)" severity="info" />
            </template>
          </Column>
          <Column field="color" header="顏色" style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="getColorLabel(data.color)" :severity="getColorSeverity(data.color)" />
            </template>
          </Column>
          <Column field="specialConditions" header="特殊狀況" style="min-width: 150px">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Tag v-for="c in (data.specialConditions || []).slice(0, 2)" :key="c" :value="getSpecialConditionLabel(c)" severity="warn" class="text-xs" />
                <Tag v-if="(data.specialConditions || []).length > 2" :value="'+' + ((data.specialConditions || []).length - 2)" severity="secondary" class="text-xs" />
              </div>
            </template>
          </Column>
          <Column header="操作" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-eye" text rounded severity="info" @click="viewRecord(data)" />
                <Button icon="pi pi-pencil" text rounded severity="warn" @click="editRecord(data)" />
                <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-center py-16">
          <i class="pi pi-clock text-5xl text-gray-400 mb-4 block"></i>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">目前沒有解便紀錄</h3>
          <Button label="新增紀錄" icon="pi pi-plus" @click="openCreateDialog" />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯對話框 -->
    <Dialog v-model:visible="showFormDialog" :header="editingRecord ? '編輯解便紀錄' : '新增解便紀錄'" :modal="true" :style="{ width: '700px' }">
      <div class="space-y-5 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">個案 <span class="text-red-500">*</span></label>
            <Select v-model="form.clientId" :options="clientOptions" optionLabel="label" optionValue="value" placeholder="選擇個案" class="w-full" filter @change="onClientChange" :invalid="!!formErrors.clientId" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">發生日期 <span class="text-red-500">*</span></label>
            <DatePicker v-model="form.occurredDate" dateFormat="yy/mm/dd" class="w-full" showIcon :invalid="!!formErrors.occurredDate" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">發生時間 <span class="text-red-500">*</span></label>
            <InputMask v-model="form.occurredTime" mask="99:99" placeholder="HH:mm" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">距上次解便（天）</label>
            <InputNumber v-model="form.daysSinceLastBowel" class="w-full" :min="0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">解便量 <span class="text-red-500">*</span></label>
            <Select v-model="form.amount" :options="AMOUNT_OPTIONS" optionLabel="label" optionValue="value" placeholder="選擇" class="w-full" :invalid="!!formErrors.amount" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">顏色 <span class="text-red-500">*</span></label>
            <Select v-model="form.color" :options="COLOR_OPTIONS" optionLabel="label" optionValue="value" placeholder="選擇" class="w-full" :invalid="!!formErrors.color" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">特殊狀況（可多選）</label>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="opt in SPECIAL_CONDITION_OPTIONS" :key="opt.value" class="flex items-center gap-2">
              <Checkbox v-model="form.specialConditions" :inputId="'sc-' + opt.value" :value="opt.value" />
              <label :for="'sc-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">伴隨症狀（可多選）</label>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="opt in ACCOMPANYING_SYMPTOM_OPTIONS" :key="opt.value" class="flex items-center gap-2">
              <Checkbox v-model="form.accompanyingSymptoms" :inputId="'as-' + opt.value" :value="opt.value" />
              <label :for="'as-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex items-center gap-2">
            <Checkbox v-model="form.usedLaxative" inputId="laxative" binary />
            <label for="laxative" class="cursor-pointer">使用軟便劑</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox v-model="form.usedEnema" inputId="enema" binary />
            <label for="enema" class="cursor-pointer">使用灌腸</label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">備註</label>
          <Textarea v-model="form.notes" rows="3" placeholder="當日飲食狀況、其他說明..." class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="showFormDialog = false" />
        <Button :label="editingRecord ? '儲存' : '建立'" @click="saveRecord" :loading="saving" />
      </template>
    </Dialog>

    <!-- 查看詳情 -->
    <Dialog v-model:visible="showViewDialog" header="解便紀錄詳情" :modal="true" :style="{ width: '600px' }">
      <template v-if="viewingRecord">
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-4 pb-4 border-b">
            <div><label class="text-sm text-gray-600">個案</label><p class="font-semibold">{{ viewingRecord.clientName }}</p></div>
            <div><label class="text-sm text-gray-600">日期時間</label><p class="font-semibold">{{ formatDate(viewingRecord.occurredDate) }} {{ viewingRecord.occurredTime }}</p></div>
            <div v-if="viewingRecord.daysSinceLastBowel"><label class="text-sm text-gray-600">距上次</label><p class="font-semibold">{{ viewingRecord.daysSinceLastBowel }} 天</p></div>
          </div>
          <div class="flex gap-4">
            <div><label class="text-sm text-gray-600">解便量</label><Tag :value="getAmountLabel(viewingRecord.amount)" severity="info" class="mt-1" /></div>
            <div><label class="text-sm text-gray-600">顏色</label><Tag :value="getColorLabel(viewingRecord.color)" :severity="getColorSeverity(viewingRecord.color)" class="mt-1" /></div>
          </div>
          <div v-if="viewingRecord.specialConditions?.length">
            <label class="text-sm text-gray-600">特殊狀況</label>
            <div class="flex flex-wrap gap-2 mt-1"><Tag v-for="c in viewingRecord.specialConditions" :key="c" :value="getSpecialConditionLabel(c)" severity="warn" /></div>
          </div>
          <div v-if="viewingRecord.accompanyingSymptoms?.length">
            <label class="text-sm text-gray-600">伴隨症狀</label>
            <div class="flex flex-wrap gap-2 mt-1"><Tag v-for="s in viewingRecord.accompanyingSymptoms" :key="s" :value="getAccompanyingSymptomLabel(s)" severity="danger" /></div>
          </div>
          <div class="flex gap-4">
            <Tag v-if="viewingRecord.usedLaxative" value="使用軟便劑" severity="info" />
            <Tag v-if="viewingRecord.usedEnema" value="使用灌腸" severity="warn" />
          </div>
          <div v-if="viewingRecord.notes" class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm text-gray-600">備註</label>
            <p class="mt-1 whitespace-pre-wrap">{{ viewingRecord.notes }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="showViewDialog = false" />
        <Button label="編輯" icon="pi pi-pencil" @click="editFromView" />
      </template>
    </Dialog>

    <!-- 刪除確認 -->
    <Dialog v-model:visible="showDeleteDialog" header="確認刪除" :modal="true" :style="{ width: '400px' }">
      <p class="text-gray-700">確定要刪除這筆解便紀錄嗎？</p>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="showDeleteDialog = false" />
        <Button label="刪除" severity="danger" @click="doDelete" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { useToast } from 'primevue/usetoast';
import { useBowelRecords, AMOUNT_OPTIONS, COLOR_OPTIONS, SPECIAL_CONDITION_OPTIONS, ACCOMPANYING_SYMPTOM_OPTIONS, type BowelRecord } from '~/composables/useBowelRecords';

definePageMeta({ layout: 'default', middleware: ['auth'] });

const toast = useToast();
const { userProfile } = useAuth();
const { fetchClients, clients: allClients } = useClients();
const { getBowelRecords, createBowelRecord, updateBowelRecord, deleteBowelRecord, getAmountLabel, getColorLabel, getColorSeverity, getSpecialConditionLabel, getAccompanyingSymptomLabel } = useBowelRecords();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const recordsData = ref<BowelRecord[]>([]);
const showFormDialog = ref(false);
const showViewDialog = ref(false);
const showDeleteDialog = ref(false);
const editingRecord = ref<BowelRecord | null>(null);
const viewingRecord = ref<BowelRecord | null>(null);
const deletingRecord = ref<BowelRecord | null>(null);
const filterClientId = ref<string | null>(null);
const filterStartDate = ref<Date | null>(null);
const filterEndDate = ref<Date | null>(null);

const form = ref({
  clientId: '', clientName: '', classId: '', occurredDate: new Date(), occurredTime: '',
  daysSinceLastBowel: null as number | null, amount: '', color: '',
  specialConditions: [] as string[], accompanyingSymptoms: [] as string[],
  usedLaxative: false, usedEnema: false, notes: ''
});
const formErrors = ref<Record<string, string>>({});

const clientOptions = computed(() => allClients.value.map(c => ({ label: c.name, value: c.id, classId: c.classId })));
const filteredRecords = computed(() => {
  let result = recordsData.value;
  if (filterClientId.value) result = result.filter(r => r.clientId === filterClientId.value);
  return result;
});

const formatDate = (date: any) => date ? dayjs(date.toDate ? date.toDate() : new Date(date)).format('YYYY/MM/DD') : '-';
const resetForm = () => {
  form.value = { clientId: '', clientName: '', classId: '', occurredDate: new Date(), occurredTime: dayjs().format('HH:mm'), daysSinceLastBowel: null, amount: '', color: '', specialConditions: [], accompanyingSymptoms: [], usedLaxative: false, usedEnema: false, notes: '' };
  formErrors.value = {};
};
const openCreateDialog = () => { editingRecord.value = null; resetForm(); showFormDialog.value = true; };
const onClientChange = () => { const c = allClients.value.find(c => c.id === form.value.clientId); if (c) { form.value.clientName = c.name; form.value.classId = c.classId || ''; } };
const viewRecord = (r: BowelRecord) => { viewingRecord.value = r; showViewDialog.value = true; };
const editRecord = (r: BowelRecord) => {
  editingRecord.value = r;
  form.value = { clientId: r.clientId, clientName: r.clientName, classId: r.classId || '', occurredDate: r.occurredDate?.toDate ? r.occurredDate.toDate() : new Date(r.occurredDate), occurredTime: r.occurredTime || '', daysSinceLastBowel: r.daysSinceLastBowel || null, amount: r.amount, color: r.color, specialConditions: r.specialConditions || [], accompanyingSymptoms: r.accompanyingSymptoms || [], usedLaxative: r.usedLaxative || false, usedEnema: r.usedEnema || false, notes: r.notes || '' };
  showFormDialog.value = true;
};
const editFromView = () => { if (viewingRecord.value) { showViewDialog.value = false; editRecord(viewingRecord.value); } };
const confirmDelete = (r: BowelRecord) => { deletingRecord.value = r; showDeleteDialog.value = true; };
const resetFilters = () => { filterClientId.value = null; filterStartDate.value = null; filterEndDate.value = null; };

const validateForm = () => {
  formErrors.value = {};
  if (!form.value.clientId) formErrors.value.clientId = '必填';
  if (!form.value.occurredDate) formErrors.value.occurredDate = '必填';
  if (!form.value.amount) formErrors.value.amount = '必填';
  if (!form.value.color) formErrors.value.color = '必填';
  return Object.keys(formErrors.value).length === 0;
};

const saveRecord = async () => {
  if (!validateForm()) return;
  saving.value = true;
  try {
    const data = { ...form.value, recordedBy: userProfile.value?.id || '', recordedByName: userProfile.value?.displayName || '' };
    if (editingRecord.value?.id) { await updateBowelRecord(editingRecord.value.id, data); toast.add({ severity: 'success', summary: '更新成功', life: 3000 }); }
    else { await createBowelRecord(data); toast.add({ severity: 'success', summary: '建立成功', life: 3000 }); }
    showFormDialog.value = false;
    await loadRecords();
  } catch (e) { toast.add({ severity: 'error', summary: '儲存失敗', life: 3000 }); }
  finally { saving.value = false; }
};

const doDelete = async () => {
  if (!deletingRecord.value?.id) return;
  deleting.value = true;
  try { await deleteBowelRecord(deletingRecord.value.id); toast.add({ severity: 'success', summary: '刪除成功', life: 3000 }); showDeleteDialog.value = false; await loadRecords(); }
  catch (e) { toast.add({ severity: 'error', summary: '刪除失敗', life: 3000 }); }
  finally { deleting.value = false; }
};

const loadRecords = async () => {
  loading.value = true;
  try {
    const filters: any = {};
    if (filterStartDate.value) filters.startDate = filterStartDate.value;
    if (filterEndDate.value) filters.endDate = filterEndDate.value;
    recordsData.value = await getBowelRecords(filters);
  } catch (e) { toast.add({ severity: 'error', summary: '載入失敗', life: 3000 }); }
  finally { loading.value = false; }
};

watch([filterStartDate, filterEndDate], () => loadRecords());
onMounted(async () => { await fetchClients(); await loadRecords(); });
</script>
