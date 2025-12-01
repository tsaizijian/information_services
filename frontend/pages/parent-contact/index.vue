<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button icon="pi pi-arrow-left" text rounded @click="navigateTo('/')" />
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i class="pi pi-phone text-blue-500"></i>
            家屬聯絡紀錄
          </h1>
        </div>
        <p class="text-gray-500 ml-12">記錄與家屬的通話對象及內容</p>
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
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="pi pi-list text-blue-600"></i>
          </div>
          <span>紀錄列表（{{ filteredRecords.length }} 筆）</span>
        </div>
      </template>
      <template #content>
        <DataTable :value="filteredRecords" paginator :rows="10" :loading="loading" stripedRows class="p-datatable-sm">
          <Column field="contactDate" header="日期" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.contactDate) }}
            </template>
          </Column>
          <Column field="clientName" header="個案姓名" sortable></Column>
          <Column field="contactTarget" header="通話對象"></Column>
          <Column field="contactMethod" header="聯絡方式">
            <template #body="slotProps">
              <Tag :value="slotProps.data.contactMethod" :severity="getMethodSeverity(slotProps.data.contactMethod)" />
            </template>
          </Column>
          <Column field="content" header="內容摘要">
            <template #body="slotProps">
              <div class="truncate max-w-xs cursor-pointer hover:text-blue-600" title="點擊查看完整內容" @click="openViewDialog(slotProps.data)">
                {{ slotProps.data.content }}
              </div>
            </template>
          </Column>
          <Column field="recordedByName" header="記錄者"></Column>
          <Column header="操作" style="width: 150px">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button icon="pi pi-eye" text rounded severity="secondary" @click="openViewDialog(slotProps.data)" title="查看詳情" />
                <Button icon="pi pi-pencil" text rounded severity="info" @click="openEditDialog(slotProps.data)" />
                <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(slotProps.data)" />
              </div>
            </template>
          </Column>
          <template #empty>
            <div class="text-center py-8 text-gray-500">
              <i class="pi pi-inbox text-4xl mb-3 block"></i>
              尚無聯絡紀錄
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- 新增/編輯對話框 -->
    <Dialog v-model:visible="dialogVisible" :header="isEditing ? '編輯紀錄' : '新增紀錄'" modal class="w-full max-w-lg">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-2">
          <label class="required">個案</label>
          <Select v-model="form.clientId" :options="clientOptions" optionLabel="label" optionValue="value" placeholder="選擇個案" class="w-full" filter :disabled="isEditing" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="required">聯絡日期</label>
          <DatePicker v-model="form.contactDate" showTime hourFormat="24" dateFormat="yy/mm/dd" class="w-full" showIcon />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="required">通話對象</label>
            <InputText v-model="form.contactTarget" placeholder="例如：王爸爸" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="required">聯絡方式</label>
            <Select v-model="form.contactMethod" :options="methodOptions" placeholder="選擇方式" class="w-full" editable />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="required">內容摘要</label>
          <Textarea v-model="form.content" rows="5" placeholder="請輸入通話內容..." class="w-full" />
        </div>
      </div>

      <template #footer>
        <Button label="取消" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="儲存" icon="pi pi-check" @click="saveRecord" :loading="saving" />
      </template>
    </Dialog>

    <!-- 查看詳情對話框 -->
    <Dialog v-model:visible="viewDialogVisible" header="聯絡紀錄詳情" modal class="w-full max-w-2xl">
      <div v-if="viewingRecord" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">個案姓名</label>
            <p class="mt-1 text-lg">{{ viewingRecord.clientName }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">聯絡日期</label>
            <p class="mt-1 text-lg">{{ formatDate(viewingRecord.contactDate) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">通話對象</label>
            <p class="mt-1 text-lg">{{ viewingRecord.contactTarget }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">聯絡方式</label>
            <p class="mt-1">
              <Tag :value="viewingRecord.contactMethod" :severity="getMethodSeverity(viewingRecord.contactMethod)" />
            </p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600">完整內容</label>
          <div class="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap">
            {{ viewingRecord.content }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label class="text-sm font-medium text-gray-600">記錄者</label>
            <p class="mt-1">{{ viewingRecord.recordedByName }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">建立時間</label>
            <p class="mt-1 text-sm text-gray-500">{{ formatDate(viewingRecord.createdAt) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="關閉" icon="pi pi-times" @click="viewDialogVisible = false" />
        <Button label="編輯" icon="pi pi-pencil" severity="info" @click="editFromView" />
      </template>
    </Dialog>

    <!-- 刪除確認 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";

// Composables
const { getContacts, addContact, updateContact, deleteContact } = useFamilyContacts();
const { getClients } = useClients();
const confirm = useConfirm();
const toast = useToast();

// State
const loading = ref(false);
const saving = ref(false);
const records = ref<any[]>([]);
const clients = ref<any[]>([]);
const dialogVisible = ref(false);
const viewDialogVisible = ref(false);
const isEditing = ref(false);
const viewingRecord = ref<any>(null);

// Filters
const filterClientId = ref();
const filterStartDate = ref();
const filterEndDate = ref();

// Form
const form = ref({
  id: "",
  clientId: "",
  contactDate: new Date(),
  contactTarget: "",
  contactMethod: "電話",
  content: "",
});

// Options
const methodOptions = ["電話", "Line", "面談", "簡訊", "Email"];

const clientOptions = computed(() => {
  return clients.value.map((c) => ({
    label: c.name,
    value: c.id,
  }));
});

const filteredRecords = computed(() => {
  // Client-side filtering for immediate feedback if needed, 
  // but main filtering is done via fetchRecords
  return records.value;
});

// Methods
const fetchClients = async () => {
  try {
    clients.value = await getClients();
  } catch (error) {
    console.error("Error fetching clients:", error);
  }
};

const fetchRecords = async () => {
  loading.value = true;
  try {
    records.value = await getContacts({
      clientId: filterClientId.value,
      startDate: filterStartDate.value,
      endDate: filterEndDate.value,
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    toast.add({ severity: "error", summary: "錯誤", detail: "無法載入紀錄", life: 3000 });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filterClientId.value = null;
  filterStartDate.value = null;
  filterEndDate.value = null;
  fetchRecords();
};

const openCreateDialog = () => {
  isEditing.value = false;
  form.value = {
    id: "",
    clientId: "",
    contactDate: new Date(),
    contactTarget: "",
    contactMethod: "電話",
    content: "",
  };
  dialogVisible.value = true;
};

const openViewDialog = (record: any) => {
  viewingRecord.value = record;
  viewDialogVisible.value = true;
};

const editFromView = () => {
  viewDialogVisible.value = false;
  openEditDialog(viewingRecord.value);
};

const openEditDialog = (record: any) => {
  isEditing.value = true;
  form.value = {
    id: record.id,
    clientId: record.clientId,
    contactDate: record.contactDate.toDate ? record.contactDate.toDate() : new Date(record.contactDate),
    contactTarget: record.contactTarget,
    contactMethod: record.contactMethod,
    content: record.content,
  };
  dialogVisible.value = true;
};

const saveRecord = async () => {
  if (!form.value.clientId || !form.value.contactTarget || !form.value.content) {
    toast.add({ severity: "warn", summary: "提醒", detail: "請填寫完整資料", life: 3000 });
    return;
  }

  saving.value = true;
  try {
    const client = clients.value.find((c) => c.id === form.value.clientId);
    const recordData = {
      clientId: form.value.clientId,
      clientName: client?.name || "未知個案",
      contactDate: form.value.contactDate,
      contactTarget: form.value.contactTarget,
      contactMethod: form.value.contactMethod,
      content: form.value.content,
    };

    if (isEditing.value && form.value.id) {
      await updateContact(form.value.id, recordData);
      toast.add({ severity: "success", summary: "成功", detail: "紀錄已更新", life: 3000 });
    } else {
      await addContact(recordData);
      toast.add({ severity: "success", summary: "成功", detail: "紀錄已新增", life: 3000 });
    }
    dialogVisible.value = false;
    fetchRecords();
  } catch (error) {
    console.error("Error saving record:", error);
    toast.add({ severity: "error", summary: "錯誤", detail: "儲存失敗", life: 3000 });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (record: any) => {
  confirm.require({
    message: `確定要刪除 ${record.clientName} 的這筆聯絡紀錄嗎？`,
    header: "刪除確認",
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await deleteContact(record.id);
        toast.add({ severity: "success", summary: "成功", detail: "紀錄已刪除", life: 3000 });
        fetchRecords();
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.add({ severity: "error", summary: "錯誤", detail: "刪除失敗", life: 3000 });
      }
    },
  });
};

const formatDate = (date: any) => {
  if (!date) return "-";
  const d = date.toDate ? date.toDate() : new Date(date);
  return dayjs(d).format("YYYY/MM/DD HH:mm");
};

const getMethodSeverity = (method: string) => {
  switch (method) {
    case "電話":
      return "info";
    case "面談":
      return "success";
    case "Line":
      return "success";
    case "簡訊":
      return "warning";
    case "Email":
      return "secondary";
    default:
      return "info";
  }
};

// Watchers
watch([filterClientId, filterStartDate, filterEndDate], () => {
  fetchRecords();
});

// Lifecycle
onMounted(() => {
  fetchClients();
  fetchRecords();
});
</script>

<style scoped>
.required:after {
  content: " *";
  color: red;
}
</style>
