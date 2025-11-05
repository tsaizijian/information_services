<template>
  <div class="space-y-6">
    <!-- 頁面標題與操作 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <i class="pi pi-users text-primary"></i>
          個案管理
        </h1>
        <p class="text-gray-500 mt-2">用心記錄，關懷每一位夥伴的成長與需求</p>
      </div>
      <Button
        label="新增個案"
        icon="pi pi-plus"
        size="large"
        @click="showNewClientDialog = true"
        class="shadow-md"
      />
    </div>

    <!-- 搜尋與篩選卡片 -->
    <Card class="shadow-sm border-0">
      <template #content>
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-search text-primary"></i>
          <span class="font-semibold text-gray-700">搜尋與篩選</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-search text-sm"></i>
              搜尋姓名或編號
            </label>
            <InputText
              v-model="searchQuery"
              placeholder="請輸入關鍵字..."
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-sitemap text-sm"></i>
              班級
            </label>
            <Select
              v-model="selectedClass"
              :options="classOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="全部班級"
              class="w-full"
              showClear
            />
          </div>
          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-users text-sm"></i>
              性別
            </label>
            <Select
              v-model="selectedGender"
              :options="genderOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="全部性別"
              class="w-full"
              showClear
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 個案列表卡片 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center justify-between py-2">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"
            >
              <i class="pi pi-list text-primary text-lg"></i>
            </div>
            <div>
              <span class="text-xl font-bold text-gray-800">個案列表</span>
              <p class="text-sm text-gray-500 mt-1">
                共
                <span class="font-semibold text-primary">{{
                  filteredClients.length
                }}</span>
                位夥伴
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <DataTable
          v-if="filteredClients.length > 0"
          :value="filteredClients"
          :loading="loading"
          stripedRows
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          class="rounded-lg"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        >
          <Column field="clientNumber" header="編號" style="min-width: 120px">
            <template #body="{ data }">
              <span
                class="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full"
              >
                {{ data.clientNumber || "-" }}
              </span>
            </template>
          </Column>
          <Column field="name" header="姓名" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"
                >
                  <i class="pi pi-user text-primary text-sm"></i>
                </div>
                <span class="font-medium">{{ data.name }}</span>
              </div>
            </template>
          </Column>
          <Column field="gender" header="性別" style="min-width: 80px">
            <template #body="{ data }">
              <Tag
                :value="data.gender === 'male' ? '男' : '女'"
                :severity="data.gender === 'male' ? 'info' : 'warn'"
                rounded
              />
            </template>
          </Column>
          <Column field="age" header="年齡" style="min-width: 80px">
            <template #body="{ data }">
              <span class="text-gray-600">{{ data.age || "-" }} 歲</span>
            </template>
          </Column>
          <Column field="className" header="班級" style="min-width: 120px">
            <template #body="{ data }">
              <Tag
                :value="data.className || '未分配'"
                severity="secondary"
                rounded
              />
            </template>
          </Column>
          <Column
            field="emergencyContact"
            header="緊急聯絡人"
            style="min-width: 150px"
          >
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i class="pi pi-phone text-primary text-sm"></i>
                <span>{{ data.basicInfo?.emergencyContact?.name || "-" }}</span>
              </div>
            </template>
          </Column>
          <Column header="操作" style="min-width: 180px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  severity="info"
                  @click="viewClient(data)"
                  v-tooltip.top="'查看詳情'"
                  class="hover:bg-blue-50"
                />
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="warn"
                  @click="editClient(data)"
                  v-tooltip.top="'編輯資料'"
                  class="hover:bg-orange-50"
                />
                <Button
                  v-if="isAdmin"
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'刪除個案'"
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
            <i class="pi pi-inbox text-5xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">
            目前沒有個案資料
          </h3>
          <p class="text-gray-500 mb-6">開始新增第一位夥伴的資料吧！</p>
          <Button
            label="新增個案"
            icon="pi pi-plus"
            @click="showNewClientDialog = true"
          />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯個案對話框 -->
    <Dialog
      v-model:visible="showClientDialog"
      :header="editingClient ? '編輯個案資料' : '新增個案資料'"
      :modal="true"
      :style="{ width: '650px' }"
      :draggable="false"
      class="rounded-lg"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"
          >
            <i
              :class="editingClient ? 'pi pi-pencil' : 'pi pi-user-plus'"
              class="text-primary"
            ></i>
          </div>
          <div>
            <h3 class="text-lg font-bold">
              {{ editingClient ? "編輯個案資料" : "新增個案資料" }}
            </h3>
            <p class="text-sm text-gray-500">請填寫完整資料，帶 * 為必填欄位</p>
          </div>
        </div>
      </template>

      <div class="space-y-5 py-4">
        <!-- 基本資料區塊 -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <i class="pi pi-user text-primary"></i>
            基本資料
          </h4>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                姓名 <span class="text-red-500">*</span>
              </label>
              <InputText
                v-model="clientForm.name"
                placeholder="請輸入姓名"
                class="w-full"
                :invalid="!!formErrors.name"
              />
              <small v-if="formErrors.name" class="text-red-500 mt-1 block">
                <i class="pi pi-exclamation-circle mr-1"></i
                >{{ formErrors.name }}
              </small>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  性別 <span class="text-red-500">*</span>
                </label>
                <Select
                  v-model="clientForm.gender"
                  :options="genderOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="請選擇性別"
                  class="w-full"
                  :invalid="!!formErrors.gender"
                />
                <small v-if="formErrors.gender" class="text-red-500 mt-1 block">
                  <i class="pi pi-exclamation-circle mr-1"></i
                  >{{ formErrors.gender }}
                </small>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  出生日期 <span class="text-red-500">*</span>
                </label>
                <DatePicker
                  v-model="clientForm.birthDate"
                  placeholder="選擇日期"
                  dateFormat="yy/mm/dd"
                  class="w-full"
                  :invalid="!!formErrors.birthDate"
                  showIcon
                />
                <small
                  v-if="formErrors.birthDate"
                  class="text-red-500 mt-1 block"
                >
                  <i class="pi pi-exclamation-circle mr-1"></i
                  >{{ formErrors.birthDate }}
                </small>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  班級 <span class="text-red-500">*</span>
                </label>
                <Select
                  v-model="clientForm.classId"
                  :options="classOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="請選擇班級"
                  class="w-full"
                  :invalid="!!formErrors.classId"
                />
                <small
                  v-if="formErrors.classId"
                  class="text-red-500 mt-1 block"
                >
                  <i class="pi pi-exclamation-circle mr-1"></i
                  >{{ formErrors.classId }}
                </small>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  個案編號
                </label>
                <InputText
                  v-model="clientForm.clientNumber"
                  placeholder="例如：C20240001"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 健康資料區塊 -->
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <i class="pi pi-heart text-green-600"></i>
            健康資料
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >血型</label
              >
              <Select
                v-model="clientForm.bloodType"
                :options="bloodTypeOptions"
                placeholder="請選擇血型"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >身分證字號</label
              >
              <InputText
                v-model="clientForm.idNumber"
                placeholder="請輸入身分證字號"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- 緊急聯絡人區塊 -->
        <div class="bg-orange-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <i class="pi pi-phone text-orange-600"></i>
            緊急聯絡人
          </h4>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >聯絡人姓名</label
              >
              <InputText
                v-model="clientForm.emergencyContactName"
                placeholder="請輸入姓名"
                class="w-full"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >關係</label
                >
                <InputText
                  v-model="clientForm.emergencyContactRelationship"
                  placeholder="例如：父親、母親"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >聯絡電話</label
                >
                <InputText
                  v-model="clientForm.emergencyContactPhone"
                  placeholder="請輸入電話號碼"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="showClientDialog = false"
            icon="pi pi-times"
          />
          <Button
            :label="editingClient ? '儲存變更' : '新增個案'"
            @click="saveClient"
            :loading="saving"
            icon="pi pi-check"
            class="shadow-md"
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
            <h3 class="text-lg font-bold text-gray-800">確認刪除個案</h3>
            <p class="text-sm text-gray-500">此操作無法復原，請謹慎確認</p>
          </div>
        </div>
      </template>

      <div class="py-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-gray-700">
            確定要刪除個案
            <span class="font-bold text-red-600"
              >「{{ deletingClient?.name }}」</span
            >
            的所有資料嗎？
          </p>
          <p class="text-sm text-gray-600 mt-2">
            <i class="pi pi-info-circle mr-1"></i>
            刪除後相關的照護紀錄將會被保留，但個案資料將無法復原
          </p>
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
            @click="deleteClient"
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

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

// Valibot Schema
const ClientFormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "請輸入姓名")),
  gender: v.pipe(v.string(), v.minLength(1, "請選擇性別")),
  birthDate: v.nullable(v.date("請選擇出生日期")),
  classId: v.pipe(v.string(), v.minLength(1, "請選擇班級")),
  clientNumber: v.optional(v.string()),
  bloodType: v.optional(v.string()),
  idNumber: v.optional(v.string()),
  emergencyContactName: v.optional(v.string()),
  emergencyContactRelationship: v.optional(v.string()),
  emergencyContactPhone: v.optional(v.string()),
});

type ClientFormData = v.InferOutput<typeof ClientFormSchema>;

const { userProfile } = useAuth();
const {
  clients,
  loading: clientsLoading,
  fetchClients,
  createClient,
  updateClient: updateClientData,
} = useClients();

// 狀態
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showClientDialog = ref(false);
const showNewClientDialog = ref(false);
const showDeleteDialog = ref(false);
const editingClient = ref<any>(null);
const deletingClient = ref<any>(null);

// 搜尋與篩選
const searchQuery = ref("");
const selectedClass = ref(null);
const selectedGender = ref(null);

// 表單
const clientForm = ref<ClientFormData>({
  name: "",
  gender: "",
  birthDate: null,
  classId: "",
  clientNumber: "",
  bloodType: "",
  idNumber: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
});

// 表單錯誤
const formErrors = ref<Partial<Record<keyof ClientFormData, string>>>({});

// 選項
const genderOptions = [
  { label: "男", value: "male" },
  { label: "女", value: "female" },
];

const bloodTypeOptions = ["A", "B", "O", "AB"];

const classOptions = ref([
  { label: "甲班", value: "class1" },
  { label: "乙班", value: "class2" },
]);

// 計算屬性
const isAdmin = computed(() => userProfile.value?.role === "admin");

const filteredClients = computed(() => {
  let result = clients.value || [];

  if (searchQuery.value) {
    result = result.filter(
      (client: any) =>
        client.name?.includes(searchQuery.value) ||
        client.clientNumber?.includes(searchQuery.value)
    );
  }

  if (selectedClass.value) {
    result = result.filter(
      (client: any) => client.classId === selectedClass.value
    );
  }

  if (selectedGender.value) {
    result = result.filter(
      (client: any) => client.gender === selectedGender.value
    );
  }

  return result;
});

// 監聽新增對話框
watch(showNewClientDialog, (value) => {
  if (value) {
    editingClient.value = null;
    resetForm();
    showClientDialog.value = true;
    showNewClientDialog.value = false;
  }
});

// 方法
const resetForm = () => {
  clientForm.value = {
    name: "",
    gender: "",
    birthDate: null,
    classId: "",
    clientNumber: "",
    bloodType: "",
    idNumber: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
  };
  formErrors.value = {};
};

const viewClient = (client: any) => {
  navigateTo(`/clients/${client.id}`);
};

const editClient = (client: any) => {
  editingClient.value = client;
  clientForm.value = {
    name: client.name,
    gender: client.gender,
    birthDate: client.birthDate ? new Date(client.birthDate) : null,
    classId: client.classId,
    clientNumber: client.clientNumber || "",
    bloodType: client.basicInfo?.bloodType || "",
    idNumber: client.basicInfo?.idNumber || "",
    emergencyContactName: client.basicInfo?.emergencyContact?.name || "",
    emergencyContactRelationship:
      client.basicInfo?.emergencyContact?.relationship || "",
    emergencyContactPhone: client.basicInfo?.emergencyContact?.phone || "",
  };
  showClientDialog.value = true;
};

const confirmDelete = (client: any) => {
  deletingClient.value = client;
  showDeleteDialog.value = true;
};

const saveClient = async () => {
  saving.value = true;
  formErrors.value = {};

  try {
    // 使用 Valibot 驗證表單
    const validatedData = v.parse(ClientFormSchema, clientForm.value);

    // 準備要儲存的資料
    const clientData = {
      name: validatedData.name,
      gender: validatedData.gender,
      birthDate: validatedData.birthDate?.toISOString() || null,
      classId: validatedData.classId,
      clientNumber: validatedData.clientNumber || null,
      basicInfo: {
        bloodType: validatedData.bloodType || null,
        idNumber: validatedData.idNumber || null,
        emergencyContact: {
          name: validatedData.emergencyContactName || null,
          relationship: validatedData.emergencyContactRelationship || null,
          phone: validatedData.emergencyContactPhone || null,
        },
      },
    };

    if (editingClient.value) {
      // 更新個案
      await updateClientData(editingClient.value.id, clientData);
    } else {
      // 新增個案
      await createClient(clientData);
    }

    // 重新載入個案列表
    await fetchClients();

    showClientDialog.value = false;
    resetForm();
    editingClient.value = null;
  } catch (error) {
    if (error instanceof v.ValiError) {
      // 處理驗證錯誤
      error.issues.forEach((issue) => {
        const path = issue.path?.[0]?.key as keyof ClientFormData;
        if (path) {
          formErrors.value[path] = issue.message;
        }
      });
    } else {
      console.error("儲存失敗:", error);
    }
  } finally {
    saving.value = false;
  }
};

const deleteClient = async () => {
  if (!deletingClient.value) return;

  deleting.value = true;
  try {
    const { deleteClient: removeClient } = useClients();
    await removeClient(deletingClient.value.id);

    // 重新載入個案列表
    await fetchClients();

    showDeleteDialog.value = false;
    deletingClient.value = null;
  } catch (error) {
    console.error("刪除失敗:", error);
  } finally {
    deleting.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchClients();
});
</script>
