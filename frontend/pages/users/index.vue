<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">使用者管理</h1>
        <p class="text-gray-600">管理系統使用者及其角色權限</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">管理員</p>
              <p class="text-3xl font-bold text-gray-800">{{ stats.admin }}</p>
            </div>
            <div class="bg-blue-100 p-4 rounded-full">
              <i class="pi pi-shield text-blue-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">照顧者</p>
              <p class="text-3xl font-bold text-gray-800">
                {{ stats.caregiver }}
              </p>
            </div>
            <div class="bg-green-100 p-4 rounded-full">
              <i class="pi pi-users text-green-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm mb-1">家屬</p>
              <p class="text-3xl font-bold text-gray-800">{{ stats.family }}</p>
            </div>
            <div class="bg-purple-100 p-4 rounded-full">
              <i class="pi pi-heart text-purple-600 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <Card class="mb-6 shadow-lg">
        <template #content>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <span class="p-input-icon-left w-full">
                <i class="pi pi-search" />
                <InputText
                  v-model="searchQuery"
                  placeholder="搜尋使用者名稱或 Email..."
                  class="w-full"
                />
              </span>
            </div>
            <div class="w-full md:w-48">
              <Select
                v-model="filterRole"
                :options="roleFilterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="篩選角色"
                class="w-full"
              />
            </div>
            <div class="w-full md:w-48">
              <Select
                v-model="filterStatus"
                :options="statusFilterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="篩選狀態"
                class="w-full"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Users Table -->
      <Card class="shadow-lg">
        <template #content>
          <DataTable
            :value="filteredUsers"
            :loading="loading"
            stripedRows
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="顯示 {first} 到 {last} 筆，共 {totalRecords} 筆"
            class="text-sm"
          >
            <template #empty>
              <div class="text-center py-8 text-gray-500">
                <i class="pi pi-users text-4xl mb-3 block"></i>
                <p>目前沒有使用者資料</p>
              </div>
            </template>

            <Column field="displayName" header="姓名" sortable>
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    :class="getRoleColor(data.role)"
                  >
                    {{ data.displayName?.charAt(0) || "?" }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">
                      {{ data.displayName || "未設定" }}
                    </p>
                    <p class="text-xs text-gray-500">{{ data.email }}</p>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="phone" header="電話" sortable>
              <template #body="{ data }">
                <span class="text-gray-700">{{ data.phone || "-" }}</span>
              </template>
            </Column>

            <Column field="role" header="角色" sortable>
              <template #body="{ data }">
                <Tag
                  :severity="getRoleSeverity(data.role)"
                  :value="getRoleLabel(data.role)"
                >
                  <template #default>
                    <i :class="getRoleIcon(data.role)" class="mr-1"></i>
                    {{ getRoleLabel(data.role) }}
                  </template>
                </Tag>
              </template>
            </Column>

            <Column field="isActive" header="狀態" sortable>
              <template #body="{ data }">
                <Tag :severity="data.isActive ? 'success' : 'danger'">
                  {{ data.isActive ? "啟用" : "停用" }}
                </Tag>
              </template>
            </Column>

            <Column field="createdAt" header="註冊時間" sortable>
              <template #body="{ data }">
                <span class="text-gray-600 text-xs">
                  {{ formatDate(data.createdAt) }}
                </span>
              </template>
            </Column>

            <Column header="操作" :exportable="false">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="info"
                    @click="openEditDialog(data)"
                    v-tooltip.top="'編輯角色'"
                  />
                  <Button
                    :icon="data.isActive ? 'pi pi-times' : 'pi pi-check'"
                    text
                    rounded
                    :severity="data.isActive ? 'danger' : 'success'"
                    @click="toggleUserStatus(data)"
                    v-tooltip.top="data.isActive ? '停用帳號' : '啟用帳號'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Edit Role Dialog -->
    <Dialog
      v-model:visible="editDialog"
      modal
      header="編輯使用者角色"
      :style="{ width: '500px' }"
      :closable="true"
    >
      <div v-if="selectedUser" class="space-y-4">
        <!-- User Info -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
              :class="getRoleColor(selectedUser.role)"
            >
              {{ selectedUser.displayName?.charAt(0) || "?" }}
            </div>
            <div>
              <p class="font-semibold text-gray-800">
                {{ selectedUser.displayName }}
              </p>
              <p class="text-sm text-gray-500">{{ selectedUser.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-600">目前角色：</span>
            <Tag :severity="getRoleSeverity(selectedUser.role)">
              {{ getRoleLabel(selectedUser.role) }}
            </Tag>
          </div>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            選擇新角色 <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="editForm.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="選擇角色"
            class="w-full"
          >
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <i :class="option.icon"></i>
                <div>
                  <p class="font-semibold">{{ option.label }}</p>
                  <p class="text-xs text-gray-500">{{ option.description }}</p>
                </div>
              </div>
            </template>
          </Select>
        </div>

        <!-- Warning Message -->
        <Message
          severity="warn"
          :closable="false"
          v-if="editForm.role !== selectedUser.role"
        >
          <template #default>
            <div class="text-sm">
              <p class="font-semibold mb-1">⚠️ 角色變更警告</p>
              <p>變更使用者角色將立即生效，使用者的系統權限會隨之改變。</p>
            </div>
          </template>
        </Message>

        <!-- Role Permissions Info -->
        <div
          v-if="editForm.role"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <p class="font-semibold text-blue-900 mb-2 text-sm">
            <i class="pi pi-info-circle mr-1"></i>
            {{ getRoleLabel(editForm.role) }}權限說明
          </p>
          <ul class="text-xs text-blue-800 space-y-1">
            <li
              v-for="(perm, index) in getRolePermissions(editForm.role)"
              :key="index"
            >
              <i class="pi pi-check mr-1"></i>{{ perm }}
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="取消" severity="secondary" @click="closeEditDialog" />
          <Button
            label="確認變更"
            severity="primary"
            @click="updateUserRole"
            :loading="updating"
            :disabled="!editForm.role || editForm.role === selectedUser?.role"
          />
        </div>
      </template>
    </Dialog>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useFirestore } from "~/composables/useFirestore";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";

dayjs.locale("zh-tw");

definePageMeta({
  middleware: ["auth", "role"],
  allowedRoles: ["admin"],
});

interface User {
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
  role: "admin" | "caregiver" | "family";
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

const { user } = useAuth();
const { getCollection, updateDocument } = useFirestore();
const toast = useToast();

const users = ref<User[]>([]);
const loading = ref(false);
const searchQuery = ref("");
const filterRole = ref("all");
const filterStatus = ref("all");

const editDialog = ref(false);
const selectedUser = ref<User | null>(null);
const editForm = ref({
  role: "",
});
const updating = ref(false);

const roleFilterOptions = [
  { label: "全部角色", value: "all" },
  { label: "管理員", value: "admin" },
  { label: "照顧者", value: "caregiver" },
  { label: "家屬", value: "family" },
];

const statusFilterOptions = [
  { label: "全部狀態", value: "all" },
  { label: "啟用", value: "active" },
  { label: "停用", value: "inactive" },
];

const roleOptions = [
  {
    label: "管理員",
    value: "admin",
    icon: "pi pi-shield",
    description: "擁有系統所有權限",
  },
  {
    label: "照顧者",
    value: "caregiver",
    icon: "pi pi-users",
    description: "可管理個案與紀錄",
  },
  {
    label: "家屬",
    value: "family",
    icon: "pi pi-heart",
    description: "僅可查看相關個案",
  },
];

// Computed
const stats = computed(() => {
  return {
    admin: users.value.filter((u) => u.role === "admin" && u.isActive).length,
    caregiver: users.value.filter((u) => u.role === "caregiver" && u.isActive)
      .length,
    family: users.value.filter((u) => u.role === "family" && u.isActive).length,
  };
});

const filteredUsers = computed(() => {
  let result = users.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
    );
  }

  // Role filter
  if (filterRole.value !== "all") {
    result = result.filter((u) => u.role === filterRole.value);
  }

  // Status filter
  if (filterStatus.value !== "all") {
    const isActive = filterStatus.value === "active";
    result = result.filter((u) => u.isActive === isActive);
  }

  return result;
});

// Methods
const fetchUsers = async () => {
  loading.value = true;
  try {
    const data = await getCollection("users");
    users.value = data.map((user) => ({
      ...user,
      userId: user.id,
    })) as unknown as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法載入使用者資料",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const openEditDialog = (user: User) => {
  selectedUser.value = user;
  editForm.value.role = user.role;
  editDialog.value = true;
};

const closeEditDialog = () => {
  editDialog.value = false;
  selectedUser.value = null;
  editForm.value.role = "";
};

const updateUserRole = async () => {
  if (!selectedUser.value || !editForm.value.role) return;

  updating.value = true;
  try {
    await updateDocument("users", selectedUser.value.userId, {
      role: editForm.value.role,
      updatedAt: new Date().toISOString(),
    });

    // Update local data
    const index = users.value.findIndex(
      (u) => u.userId === selectedUser.value!.userId
    );
    if (index !== -1) {
      users.value[index]!.role = editForm.value.role as any;
      users.value[index]!.updatedAt = new Date().toISOString();
    }

    toast.add({
      severity: "success",
      summary: "更新成功",
      detail: `已將 ${
        selectedUser.value.displayName
      } 的角色更新為 ${getRoleLabel(editForm.value.role)}`,
      life: 3000,
    });

    closeEditDialog();
  } catch (error) {
    console.error("Error updating role:", error);
    toast.add({
      severity: "error",
      summary: "更新失敗",
      detail: "無法更新使用者角色",
      life: 3000,
    });
  } finally {
    updating.value = false;
  }
};

const toggleUserStatus = async (user: User) => {
  const newStatus = !user.isActive;
  const action = newStatus ? "啟用" : "停用";

  try {
    await updateDocument("users", user.userId, {
      isActive: newStatus,
      updatedAt: new Date().toISOString(),
    });

    // Update local data
    const index = users.value.findIndex((u) => u.userId === user.userId);
    if (index !== -1) {
      users.value[index]!.isActive = newStatus;
      users.value[index]!.updatedAt = new Date().toISOString();
    }

    toast.add({
      severity: "success",
      summary: `${action}成功`,
      detail: `已${action} ${user.displayName} 的帳號`,
      life: 3000,
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    toast.add({
      severity: "error",
      summary: `${action}失敗`,
      detail: `無法${action}使用者帳號`,
      life: 3000,
    });
  }
};

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    admin: "管理員",
    caregiver: "照顧者",
    family: "家屬",
  };
  return labels[role] || role;
};

const getRoleSeverity = (role: string): string => {
  const severities: Record<string, string> = {
    admin: "danger",
    caregiver: "success",
    family: "info",
  };
  return severities[role] || "secondary";
};

const getRoleIcon = (role: string): string => {
  const icons: Record<string, string> = {
    admin: "pi pi-shield",
    caregiver: "pi pi-users",
    family: "pi pi-heart",
  };
  return icons[role] || "pi pi-user";
};

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    admin: "bg-red-500",
    caregiver: "bg-green-500",
    family: "bg-purple-500",
  };
  return colors[role] || "bg-gray-500";
};

const getRolePermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    admin: [
      "管理所有使用者帳號",
      "管理所有班級與個案",
      "新增、編輯、刪除所有照護紀錄",
      "查看所有統計數據與報表",
      "系統設定與配置",
    ],
    caregiver: [
      "管理班級與個案資料",
      "新增、編輯照護紀錄",
      "查看班級統計數據",
      "匯出個案報表",
    ],
    family: [
      "查看相關個案資料",
      "查看個案照護紀錄",
      "查看生命徵象紀錄",
      "接收通知訊息",
    ],
  };
  return permissions[role] || [];
};

const formatDate = (date: any): string => {
  if (!date) return "-";
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  color: #334155;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f1f5f9;
}

:deep(.p-tag) {
  font-weight: 500;
}
</style>
