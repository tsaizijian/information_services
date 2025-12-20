<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button icon="pi pi-arrow-left" text rounded @click="navigateTo('/medical-care')" />
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i class="pi pi-heart-fill text-green-500"></i>
            生命徵象紀錄
          </h1>
        </div>
        <p class="text-gray-500 ml-12">記錄血壓、體溫、脈搏等數值</p>
      </div>
      <Button label="新增紀錄" icon="pi pi-plus" size="large" @click="openCreateDialog" class="shadow-md" />
      <Button label="匯出年度報表" icon="pi pi-file-pdf" severity="danger" outlined class="ml-2" @click="exportYearlyReport" />
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
          <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <i class="pi pi-list text-green-600"></i>
          </div>
          <span>紀錄列表（{{ filteredRecords.length }} 筆）</span>
        </div>
      </template>
      <template #content>
        <DataTable v-if="filteredRecords.length > 0" :value="filteredRecords" :loading="loading" stripedRows paginator :rows="10" sortField="measuredAt" :sortOrder="-1">
          <Column field="measuredAt" header="日期時間" sortable style="min-width: 140px">
            <template #body="{ data }">
              <div>
                <p class="font-medium">{{ formatDate(data.measuredAt) }}</p>
                <p class="text-xs text-gray-400">{{ formatTime(data.measuredAt) }}</p>
              </div>
            </template>
          </Column>
          <Column field="clientName" header="個案" style="min-width: 100px" />
          <Column header="血壓 (mmHg)" style="min-width: 120px">
            <template #body="{ data }">
              <span v-if="data.systolic || data.diastolic">{{ data.systolic || '-' }}/{{ data.diastolic || '-' }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </Column>
          <Column field="heartRate" header="心率 (bpm)" style="min-width: 100px">
            <template #body="{ data }">
              {{ data.heartRate || '-' }}
            </template>
          </Column>
          <Column field="temperature" header="體溫 (°C)" style="min-width: 100px">
            <template #body="{ data }">
              {{ data.temperature || '-' }}
            </template>
          </Column>
          <Column field="bloodOxygen" header="血氧 (%)" style="min-width: 100px">
            <template #body="{ data }">
              {{ data.bloodOxygen || '-' }}
            </template>
          </Column>
          <Column field="bloodSugar" header="血糖 (mg/dL)" style="min-width: 120px">
            <template #body="{ data }">
              {{ data.bloodSugar || '-' }}
            </template>
          </Column>
          <Column header="操作" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-eye" text rounded severity="info" @click="viewRecord(data)" />
                <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-center py-16">
          <i class="pi pi-heart text-5xl text-gray-400 mb-4 block"></i>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">目前沒有生命徵象紀錄</h3>
          <Button label="新增紀錄" icon="pi pi-plus" @click="openCreateDialog" />
        </div>
      </template>
    </Card>

    <!-- 新增對話框 -->
    <Dialog v-model:visible="showFormDialog" header="新增生命徵象紀錄" :modal="true" :style="{ width: '700px' }">
      <div class="space-y-5 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">個案 <span class="text-red-500">*</span></label>
            <Select v-model="form.clientId" :options="clientOptions" optionLabel="label" optionValue="value" placeholder="選擇個案" class="w-full" filter @change="onClientChange" :invalid="!!formErrors.clientId" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">測量時間 <span class="text-red-500">*</span></label>
            <DatePicker v-model="form.measuredAt" showTime hourFormat="24" class="w-full" :invalid="!!formErrors.measuredAt" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">收縮壓 (mmHg)</label>
            <InputNumber v-model="form.systolic" class="w-full" placeholder="例如 120" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">舒張壓 (mmHg)</label>
            <InputNumber v-model="form.diastolic" class="w-full" placeholder="例如 80" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">心率 (bpm)</label>
            <InputNumber v-model="form.heartRate" class="w-full" placeholder="例如 72" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">體溫 (°C)</label>
            <InputNumber v-model="form.temperature" class="w-full" :minFractionDigits="1" :maxFractionDigits="1" placeholder="例如 36.5" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">血氧 (%)</label>
            <InputNumber v-model="form.bloodOxygen" class="w-full" placeholder="例如 98" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">血糖 (mg/dL)</label>
            <InputNumber v-model="form.bloodSugar" class="w-full" placeholder="例如 100" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">備註</label>
          <Textarea v-model="form.notes" rows="3" placeholder="任何補充說明..." class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="showFormDialog = false" />
        <Button label="建立" @click="saveRecord" :loading="saving" />
      </template>
    </Dialog>

    <!-- 查看詳情 -->
    <Dialog v-model:visible="showViewDialog" header="生命徵象紀錄詳情" :modal="true" :style="{ width: '600px' }">
      <template v-if="viewingRecord">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 pb-4 border-b">
            <div><label class="text-sm text-gray-600">個案</label><p class="font-semibold">{{ viewingRecord.clientName }}</p></div>
            <div><label class="text-sm text-gray-600">測量時間</label><p class="font-semibold">{{ formatDate(viewingRecord.measuredAt) }} {{ formatTime(viewingRecord.measuredAt) }}</p></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm text-gray-600">血壓</label><p class="font-semibold">{{ viewingRecord.systolic || '-' }}/{{ viewingRecord.diastolic || '-' }} mmHg</p></div>
            <div><label class="text-sm text-gray-600">心率</label><p class="font-semibold">{{ viewingRecord.heartRate || '-' }} bpm</p></div>
            <div><label class="text-sm text-gray-600">體溫</label><p class="font-semibold">{{ viewingRecord.temperature || '-' }} °C</p></div>
            <div><label class="text-sm text-gray-600">血氧</label><p class="font-semibold">{{ viewingRecord.bloodOxygen || '-' }} %</p></div>
            <div><label class="text-sm text-gray-600">血糖</label><p class="font-semibold">{{ viewingRecord.bloodSugar || '-' }} mg/dL</p></div>
          </div>
          <div v-if="viewingRecord.notes" class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm text-gray-600">備註</label>
            <p class="mt-1 whitespace-pre-wrap">{{ viewingRecord.notes }}</p>
          </div>
          <div class="text-sm text-gray-500 text-right">
            紀錄者：{{ viewingRecord.recordedByName || '未標示' }}
          </div>
        </div>
      </template>
      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="showViewDialog = false" />
      </template>
    </Dialog>

    <!-- 刪除確認 -->
    <Dialog v-model:visible="showDeleteDialog" header="確認刪除" :modal="true" :style="{ width: '400px' }">
      <p class="text-gray-700">確定要刪除這筆生命徵象紀錄嗎？</p>
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

definePageMeta({ layout: 'default', middleware: ['auth'] });

const toast = useToast();
const { userProfile } = useAuth();
const { fetchClients, clients: allClients } = useClients();
const { getVitalSignRecords, createVitalSignRecord, removeVitalSignRecord } = useVitalSigns();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const recordsData = ref<any[]>([]);
const showFormDialog = ref(false);
const showViewDialog = ref(false);
const showDeleteDialog = ref(false);
const viewingRecord = ref<any | null>(null);
const deletingRecord = ref<any | null>(null);
const filterClientId = ref<string | null>(null);
const filterStartDate = ref<Date | null>(null);
const filterEndDate = ref<Date | null>(null);

const form = ref({
  clientId: '',
  clientName: '',
  measuredAt: new Date(),
  systolic: null as number | null,
  diastolic: null as number | null,
  heartRate: null as number | null,
  temperature: null as number | null,
  bloodOxygen: null as number | null,
  bloodSugar: null as number | null,
  notes: ''
});
const formErrors = ref<Record<string, string>>({});

const clientOptions = computed(() => allClients.value.map(c => ({ label: c.name, value: c.id })));
const filteredRecords = computed(() => {
  let result = recordsData.value;
  if (filterClientId.value) result = result.filter(r => r.clientId === filterClientId.value);
  return result;
});

const formatDate = (date: any) => date ? dayjs(date.toDate ? date.toDate() : new Date(date)).format('YYYY/MM/DD') : '-';
const formatTime = (date: any) => date ? dayjs(date.toDate ? date.toDate() : new Date(date)).format('HH:mm') : '-';

const resetForm = () => {
  form.value = {
    clientId: '',
    clientName: '',
    measuredAt: new Date(),
    systolic: null,
    diastolic: null,
    heartRate: null,
    temperature: null,
    bloodOxygen: null,
    bloodSugar: null,
    notes: ''
  };
  formErrors.value = {};
};

const openCreateDialog = () => { resetForm(); showFormDialog.value = true; };
const onClientChange = () => { const c = allClients.value.find(c => c.id === form.value.clientId); if (c) { form.value.clientName = c.name; } };
const viewRecord = (r: any) => { viewingRecord.value = r; showViewDialog.value = true; };
const confirmDelete = (r: any) => { deletingRecord.value = r; showDeleteDialog.value = true; };
const resetFilters = () => { filterClientId.value = null; filterStartDate.value = null; filterEndDate.value = null; };

const validateForm = () => {
  formErrors.value = {};
  if (!form.value.clientId) formErrors.value.clientId = '必填';
  if (!form.value.measuredAt) formErrors.value.measuredAt = '必填';
  return Object.keys(formErrors.value).length === 0;
};

const saveRecord = async () => {
  if (!validateForm()) return;
  saving.value = true;
  try {
    await createVitalSignRecord({
      clientId: form.value.clientId,
      clientName: form.value.clientName,
      measuredAt: form.value.measuredAt,
      systolic: form.value.systolic,
      diastolic: form.value.diastolic,
      heartRate: form.value.heartRate,
      temperature: form.value.temperature,
      bloodOxygen: form.value.bloodOxygen,
      bloodSugar: form.value.bloodSugar,
      notes: form.value.notes
    });
    toast.add({ severity: 'success', summary: '建立成功', life: 3000 });
    showFormDialog.value = false;
    await loadRecords();
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: '儲存失敗', life: 3000 });
  } finally {
    saving.value = false;
  }
};

const doDelete = async () => {
  if (!deletingRecord.value?.id) return;
  deleting.value = true;
  try {
    await removeVitalSignRecord(deletingRecord.value.id);
    toast.add({ severity: 'success', summary: '刪除成功', life: 3000 });
    showDeleteDialog.value = false;
    await loadRecords();
  } catch (e) {
    toast.add({ severity: 'error', summary: '刪除失敗', life: 3000 });
  } finally {
    deleting.value = false;
  }
};

const loadRecords = async () => {
  loading.value = true;
  try {
    const filters: any = {};
    if (filterClientId.value) filters.clientId = filterClientId.value;
    if (filterStartDate.value) filters.startDate = filterStartDate.value;
    if (filterEndDate.value) filters.endDate = filterEndDate.value;
    const data = await getVitalSignRecords(filters);
    // Normalize dates
    recordsData.value = data.map((r: any) => ({
      ...r,
      measuredAt: r.measuredAt?.toDate ? r.measuredAt.toDate() : new Date(r.measuredAt)
    }));
  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: '載入失敗', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const exportYearlyReport = async () => {
  if (!filterClientId.value) {
    toast.add({ severity: 'warn', summary: '請先選擇個案', detail: '匯出報表需要指定一位個案', life: 3000 });
    return;
  }

  const client = allClients.value.find(c => c.id === filterClientId.value);
  if (!client) return;

  const year = filterStartDate.value ? dayjs(filterStartDate.value).year() : dayjs().year();
  
  // Fetch all records for this client and year
  const startDate = dayjs(`${year}-01-01`).startOf('day').toDate();
  const endDate = dayjs(`${year}-12-31`).endOf('day').toDate();
  
  toast.add({ severity: 'info', summary: '準備匯出中', detail: '正在下載字型檔與產生報表，請稍候...', life: 3000 });

  try {
    const records = await getVitalSignRecords({
      clientId: filterClientId.value,
      startDate,
      endDate,
      order: 'asc'
    });

    const normalizedRecords = records.map((r: any) => ({
      ...r,
      measuredAt: r.measuredAt?.toDate ? r.measuredAt.toDate() : new Date(r.measuredAt)
    }));

    // Aggregate by month (take the latest record of each month)
    const monthlyData = Array(12).fill(null).map((_, index) => {
      const monthRecords = normalizedRecords.filter((r: any) => dayjs(r.measuredAt).month() === index);
      if (monthRecords.length === 0) return null;
      // Sort by date desc
      monthRecords.sort((a: any, b: any) => b.measuredAt.getTime() - a.measuredAt.getTime());
      return monthRecords[0];
    });

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    
    // Load Chinese Font
    let fontLoaded = false;
    const fontUrls = [
      'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf',
      'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf'
    ];

    for (const url of fontUrls) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const blob = await response.blob();
        
        await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                if (base64data) {
                    const base64Content = base64data.split(',')[1];
                    doc.addFileToVFS('NotoSansTC-Regular.ttf', base64Content);
                    doc.addFont('NotoSansTC-Regular.ttf', 'NotoSansTC', 'normal');
                    doc.setFont('NotoSansTC');
                    fontLoaded = true;
                }
                resolve(null);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        if (fontLoaded) break;
      } catch (e) {
        console.warn(`Failed to load font from ${url}`, e);
      }
    }

    if (!fontLoaded) {
      toast.add({ severity: 'warn', summary: '字型載入失敗', detail: 'PDF 中文可能無法正確顯示，請檢查網路連線', life: 5000 });
    }
    
    // Title
    doc.setFontSize(18);
    doc.text("生命徵象紀錄表", 105, 20, { align: "center" });
    
    // Header info
    doc.setFontSize(12);
    doc.text(`${year} 年`, 20, 35);
    doc.text(`姓名：${client.name}`, 80, 35);
    doc.text(`性別：${client.gender === 'male' ? '男' : '女'}`, 150, 35);

    // Table
    const tableBody = monthlyData.map((record, index) => {
      const month = `${index + 1} 月`;
      if (!record) {
        return [month, '', '/', '', '', ''];
      }
      const bp = (record.systolic && record.diastolic) ? `${record.systolic}/${record.diastolic}` : '/';
      return [
        month,
        record.weight ? `${record.weight} kg` : '',
        bp,
        record.heartRate ? `${record.heartRate} 分/次` : '',
        record.bloodOxygen ? `${record.bloodOxygen} %` : '',
        record.recordedByName || ''
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['月份', '體重', '血壓', '脈搏', '血氧', '紀錄者']],
      body: tableBody,
      theme: 'grid',
      styles: {
        font: 'NotoSansTC',
        fontSize: 10,
        cellPadding: 5,
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 20 },
        5: { cellWidth: 30 }
      },
      didDrawPage: (data) => {
        // Footer note
        doc.setFontSize(10);
        doc.text("※備註：正常血壓-收縮壓 90-140mmHg  舒張壓 50-90 mmHg", 105, doc.internal.pageSize.height - 20, { align: "center" });
      }
    });

    doc.save(`生命徵象紀錄表_${client.name}_${year}.pdf`);
    toast.add({ severity: 'success', summary: '匯出成功', life: 3000 });

  } catch (e) {
    console.error(e);
    toast.add({ severity: 'error', summary: '匯出失敗', detail: '無法產生報表', life: 3000 });
  }
};

watch([filterClientId, filterStartDate, filterEndDate], () => loadRecords());
onMounted(async () => { await fetchClients(); await loadRecords(); });
</script>
