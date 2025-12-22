<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button icon="pi pi-arrow-left" text rounded @click="navigateTo('/medical-care')" />
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i class="pi pi-bolt text-purple-500"></i>
            癲癇發作紀錄
          </h1>
        </div>
        <p class="text-gray-500 ml-12">記錄癲癇發作情況與處置</p>
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
          <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <i class="pi pi-list text-purple-600"></i>
          </div>
          <span>紀錄列表（{{ filteredRecords.length }} 筆）</span>
        </div>
      </template>
      <template #content>
        <DataTable v-if="filteredRecords.length > 0" :value="filteredRecords" :loading="loading" stripedRows paginator :rows="10" sortField="occurredDate" :sortOrder="-1">
          <Column field="occurredDate" header="發作時間" sortable style="min-width: 140px">
            <template #body="{ data }">
              <div>
                <p class="font-medium">{{ formatDate(data.occurredDate) }}</p>
                <p class="text-xs text-gray-400">{{ data.occurredTime }}</p>
              </div>
            </template>
          </Column>
          <Column field="clientName" header="個案" style="min-width: 100px" />
          <Column field="durationSeconds" header="持續時間" style="min-width: 100px">
            <template #body="{ data }">{{ formatDuration(data.durationSeconds) }}</template>
          </Column>
          <Column field="consciousnessState" header="意識狀態" style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="getConsciousnessLabel(data.consciousnessState)" :severity="getConsciousnessSeverity(data.consciousnessState)" />
            </template>
          </Column>
          <Column field="needEmergency" header="送醫" style="min-width: 80px">
            <template #body="{ data }">
              <Tag v-if="data.needEmergency" value="是" severity="danger" />
              <span v-else class="text-gray-400">否</span>
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
          <i class="pi pi-bolt text-5xl text-gray-400 mb-4 block"></i>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">目前沒有癲癇紀錄</h3>
          <Button label="新增紀錄" icon="pi pi-plus" @click="openCreateDialog" />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯對話框 -->
    <Dialog v-model:visible="showFormDialog" :header="editingRecord ? '編輯癲癇紀錄' : '新增癲癇紀錄'" :modal="true" :style="{ width: '800px' }">
      <div class="space-y-5 py-4 max-h-[70vh] overflow-y-auto">
        <!-- 基本資料 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4">基本資料</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">個案 <span class="text-red-500">*</span></label>
              <Select v-model="form.clientId" :options="clientOptions" optionLabel="label" optionValue="value" placeholder="選擇個案" class="w-full" filter @change="onClientChange" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">發作日期 <span class="text-red-500">*</span></label>
              <DatePicker v-model="form.occurredDate" dateFormat="yy/mm/dd" class="w-full" showIcon />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">發作時間 <span class="text-red-500">*</span></label>
              <InputMask v-model="form.occurredTime" mask="99:99" placeholder="HH:mm" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">發作情境</label>
              <Select v-model="form.context" :options="SEIZURE_CONTEXT_OPTIONS" optionLabel="label" optionValue="value" placeholder="選擇" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">天氣/氣溫</label>
              <InputText v-model="form.weather" placeholder="如：悶熱" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">持續時間（秒）<span class="text-red-500">*</span></label>
              <InputNumber v-model="form.durationSeconds" class="w-full" :min="0" />
            </div>
          </div>
        </div>

        <!-- 發作症狀 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4">發作症狀</h4>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">意識狀態 <span class="text-red-500">*</span></label>
            <Select v-model="form.consciousnessState" :options="CONSCIOUSNESS_OPTIONS" optionLabel="label" optionValue="value" placeholder="選擇" class="w-full" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">肢體症狀</label>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="opt in LIMB_SYMPTOM_OPTIONS" :key="opt.value" class="flex items-center gap-2">
                <Checkbox v-model="form.limbSymptoms" :inputId="'limb-' + opt.value" :value="opt.value" />
                <label :for="'limb-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
              </div>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">口部症狀</label>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="opt in MOUTH_SYMPTOM_OPTIONS" :key="opt.value" class="flex items-center gap-2">
                <Checkbox v-model="form.mouthSymptoms" :inputId="'mouth-' + opt.value" :value="opt.value" />
                <label :for="'mouth-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">其他症狀</label>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="opt in OTHER_SYMPTOM_OPTIONS" :key="opt.value" class="flex items-center gap-2">
                <Checkbox v-model="form.otherSymptoms" :inputId="'other-' + opt.value" :value="opt.value" />
                <label :for="'other-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
              </div>
            </div>
          </div>
        </div>

        <!-- 處理過程 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4">處理過程</h4>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="opt in SEIZURE_TREATMENT_OPTIONS" :key="opt.value" class="flex items-center gap-2">
              <Checkbox v-model="form.treatments" :inputId="'treat-' + opt.value" :value="opt.value" />
              <label :for="'treat-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
            </div>
          </div>
        </div>

        <!-- 是否送醫 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4">是否送醫</h4>
          <div class="flex items-center gap-4 mb-4">
            <Checkbox v-model="form.needEmergency" inputId="needEmergency" binary />
            <label for="needEmergency" class="font-medium cursor-pointer">需要送醫</label>
          </div>
          <div v-if="form.needEmergency" class="grid grid-cols-2 gap-2">
            <div v-for="opt in EMERGENCY_REASON_OPTIONS" :key="opt.value" class="flex items-center gap-2">
              <Checkbox v-model="form.emergencyReasons" :inputId="'er-' + opt.value" :value="opt.value" />
              <label :for="'er-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
            </div>
          </div>
        </div>

        <!-- 發作後狀況 -->
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-4">發作後狀況</h4>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="opt in POST_SEIZURE_OPTIONS" :key="opt.value" class="flex items-center gap-2">
              <Checkbox v-model="form.postSeizureConditions" :inputId="'post-' + opt.value" :value="opt.value" />
              <label :for="'post-' + opt.value" class="text-sm cursor-pointer">{{ opt.label }}</label>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">備註</label>
          <Textarea v-model="form.notes" rows="3" placeholder="發作前兆、家屬通知情況等..." class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="showFormDialog = false" />
        <Button :label="editingRecord ? '儲存' : '建立'" @click="saveRecord" :loading="saving" />
      </template>
    </Dialog>

    <!-- 查看詳情 -->
    <Dialog v-model:visible="showViewDialog" header="癲癇紀錄詳情" :modal="true" :style="{ width: '700px' }">
      <template v-if="viewingRecord">
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-4 pb-4 border-b">
            <div><label class="text-sm text-gray-600">個案</label><p class="font-semibold">{{ viewingRecord.clientName }}</p></div>
            <div><label class="text-sm text-gray-600">發作時間</label><p class="font-semibold">{{ formatDate(viewingRecord.occurredDate) }} {{ viewingRecord.occurredTime }}</p></div>
            <div><label class="text-sm text-gray-600">持續時間</label><p class="font-semibold">{{ formatDuration(viewingRecord.durationSeconds) }}</p></div>
          </div>
          <div><label class="text-sm text-gray-600">意識狀態</label><Tag :value="getConsciousnessLabel(viewingRecord.consciousnessState)" :severity="getConsciousnessSeverity(viewingRecord.consciousnessState)" class="mt-1" /></div>
          <div v-if="viewingRecord.limbSymptoms?.length"><label class="text-sm text-gray-600">肢體症狀</label><div class="flex flex-wrap gap-2 mt-1"><Tag v-for="s in viewingRecord.limbSymptoms" :key="s" :value="getLimbSymptomLabel(s)" severity="warn" /></div></div>
          <div v-if="viewingRecord.mouthSymptoms?.length"><label class="text-sm text-gray-600">口部症狀</label><div class="flex flex-wrap gap-2 mt-1"><Tag v-for="s in viewingRecord.mouthSymptoms" :key="s" :value="getMouthSymptomLabel(s)" severity="danger" /></div></div>
          <div v-if="viewingRecord.treatments?.length"><label class="text-sm text-gray-600">處理過程</label><div class="flex flex-wrap gap-2 mt-1"><Tag v-for="t in viewingRecord.treatments" :key="t" :value="getTreatmentLabel(t)" severity="success" /></div></div>
          <div v-if="viewingRecord.needEmergency" class="bg-red-50 rounded-lg p-4">
            <p class="font-semibold text-red-600 mb-2">需要送醫</p>
            <div class="flex flex-wrap gap-2"><Tag v-for="r in viewingRecord.emergencyReasons" :key="r" :value="getEmergencyReasonLabel(r)" severity="danger" /></div>
          </div>
          <div v-if="viewingRecord.postSeizureConditions?.length"><label class="text-sm text-gray-600">發作後狀況</label><div class="flex flex-wrap gap-2 mt-1"><Tag v-for="c in viewingRecord.postSeizureConditions" :key="c" :value="getPostSeizureLabel(c)" severity="info" /></div></div>
          <div v-if="viewingRecord.notes" class="bg-gray-50 rounded-lg p-4"><label class="text-sm text-gray-600">備註</label><p class="mt-1 whitespace-pre-wrap">{{ viewingRecord.notes }}</p></div>
        </div>
      </template>
      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="showViewDialog = false" />
        <Button label="編輯" icon="pi pi-pencil" @click="editFromView" />
      </template>
    </Dialog>

    <!-- 刪除確認 -->
    <Dialog v-model:visible="showDeleteDialog" header="確認刪除" :modal="true" :style="{ width: '400px' }">
      <p class="text-gray-700">確定要刪除這筆癲癇紀錄嗎？</p>
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
import { useSeizureRecords, SEIZURE_CONTEXT_OPTIONS, CONSCIOUSNESS_OPTIONS, LIMB_SYMPTOM_OPTIONS, MOUTH_SYMPTOM_OPTIONS, OTHER_SYMPTOM_OPTIONS, SEIZURE_TREATMENT_OPTIONS, EMERGENCY_REASON_OPTIONS, POST_SEIZURE_OPTIONS, type SeizureRecord } from '~/composables/useSeizureRecords';

definePageMeta({ layout: 'default', middleware: ['auth'] });

const toast = useToast();
const { userProfile } = useAuth();
const { fetchClients, clients: allClients } = useClients();
const { getSeizureRecords, createSeizureRecord, updateSeizureRecord, deleteSeizureRecord, getConsciousnessLabel, getConsciousnessSeverity, getLimbSymptomLabel, getMouthSymptomLabel, getTreatmentLabel, getEmergencyReasonLabel, getPostSeizureLabel, formatDuration } = useSeizureRecords();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const recordsData = ref<SeizureRecord[]>([]);
const showFormDialog = ref(false);
const showViewDialog = ref(false);
const showDeleteDialog = ref(false);
const editingRecord = ref<SeizureRecord | null>(null);
const viewingRecord = ref<SeizureRecord | null>(null);
const deletingRecord = ref<SeizureRecord | null>(null);
const filterClientId = ref<string | null>(null);
const filterStartDate = ref<Date | null>(null);
const filterEndDate = ref<Date | null>(null);

const form = ref({
  clientId: '', clientName: '', classId: '', occurredDate: new Date(), occurredTime: '',
  context: '', weather: '', durationSeconds: 0, consciousnessState: '',
  limbSymptoms: [] as string[], mouthSymptoms: [] as string[], otherSymptoms: [] as string[],
  treatments: [] as string[], needEmergency: false, emergencyReasons: [] as string[],
  postSeizureConditions: [] as string[], notes: ''
});

const clientOptions = computed(() => allClients.value.map(c => ({ label: c.name, value: c.id, classId: c.classId })));
const filteredRecords = computed(() => {
  let result = recordsData.value;
  if (filterClientId.value) result = result.filter(r => r.clientId === filterClientId.value);
  return result;
});

const formatDate = (date: any) => date ? dayjs(date.toDate ? date.toDate() : new Date(date)).format('YYYY/MM/DD') : '-';
const resetForm = () => {
  form.value = { clientId: '', clientName: '', classId: '', occurredDate: new Date(), occurredTime: dayjs().format('HH:mm'), context: '', weather: '', durationSeconds: 0, consciousnessState: '', limbSymptoms: [], mouthSymptoms: [], otherSymptoms: [], treatments: [], needEmergency: false, emergencyReasons: [], postSeizureConditions: [], notes: '' };
};
const openCreateDialog = () => { editingRecord.value = null; resetForm(); showFormDialog.value = true; };
const onClientChange = () => { const c = allClients.value.find(c => c.id === form.value.clientId); if (c) { form.value.clientName = c.name; form.value.classId = c.classId || ''; } };
const viewRecord = (r: SeizureRecord) => { viewingRecord.value = r; showViewDialog.value = true; };
const editRecord = (r: SeizureRecord) => {
  editingRecord.value = r;
  form.value = { clientId: r.clientId, clientName: r.clientName, classId: r.classId || '', occurredDate: r.occurredDate?.toDate ? r.occurredDate.toDate() : new Date(r.occurredDate), occurredTime: r.occurredTime || '', context: r.context || '', weather: r.weather || '', durationSeconds: r.durationSeconds || 0, consciousnessState: r.consciousnessState || '', limbSymptoms: r.limbSymptoms || [], mouthSymptoms: r.mouthSymptoms || [], otherSymptoms: r.otherSymptoms || [], treatments: r.treatments || [], needEmergency: r.needEmergency || false, emergencyReasons: r.emergencyReasons || [], postSeizureConditions: r.postSeizureConditions || [], notes: r.notes || '' };
  showFormDialog.value = true;
};
const editFromView = () => { if (viewingRecord.value) { showViewDialog.value = false; editRecord(viewingRecord.value); } };
const confirmDelete = (r: SeizureRecord) => { deletingRecord.value = r; showDeleteDialog.value = true; };
const resetFilters = () => { filterClientId.value = null; filterStartDate.value = null; filterEndDate.value = null; };

const saveRecord = async () => {
  saving.value = true;
  try {
    // 準備要儲存的資料，排除不該傳遞的欄位
    const { isPinned, pinnedBy, ...formData } = form.value as any;
    const data = {
      ...formData,
      recordedBy: userProfile.value?.id || '',
      recordedByName: userProfile.value?.displayName || ''
    };

    if (editingRecord.value?.id) {
      await updateSeizureRecord(editingRecord.value.id, data);
      toast.add({ severity: 'success', summary: '更新成功', life: 3000 });
    } else {
      await createSeizureRecord(data);
      toast.add({ severity: 'success', summary: '建立成功', life: 3000 });
    }

    showFormDialog.value = false;
    await loadRecords();
  } catch (e) {
    toast.add({ severity: 'error', summary: '儲存失敗', life: 3000 });
  } finally {
    saving.value = false;
  }
};

const doDelete = async () => {
  if (!deletingRecord.value?.id) return;
  deleting.value = true;
  try { await deleteSeizureRecord(deletingRecord.value.id); toast.add({ severity: 'success', summary: '刪除成功', life: 3000 }); showDeleteDialog.value = false; await loadRecords(); }
  catch (e) { toast.add({ severity: 'error', summary: '刪除失敗', life: 3000 }); }
  finally { deleting.value = false; }
};

const loadRecords = async () => {
  loading.value = true;
  try {
    const filters: any = {};
    if (filterStartDate.value) filters.startDate = filterStartDate.value;
    if (filterEndDate.value) filters.endDate = filterEndDate.value;
    recordsData.value = await getSeizureRecords(filters);
  } catch (e) { toast.add({ severity: 'error', summary: '載入失敗', life: 3000 }); }
  finally { loading.value = false; }
};

watch([filterStartDate, filterEndDate], () => loadRecords());

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
