<template>
  <div class="space-y-6">
    <!-- 頁面標題與操作 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <i class="pi pi-sync text-primary"></i>
          班務交接
        </h1>
        <p class="text-gray-500 mt-2">
          記錄並確認班次交接事項，確保照護工作無縫銜接
        </p>
      </div>
      <Button
        label="新增交接"
        icon="pi pi-plus"
        size="large"
        @click="openCreateDialog"
        class="shadow-md"
      />
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="shadow-sm border-0">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">待確認交接</p>
              <p class="text-3xl font-bold text-orange-600 mt-2">
                {{ pendingCount }}
              </p>
            </div>
            <div
              class="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center"
            >
              <i class="pi pi-clock text-2xl text-orange-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm border-0">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">今日交接</p>
              <p class="text-3xl font-bold text-blue-600 mt-2">
                {{ todayCount }}
              </p>
            </div>
            <div
              class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <i class="pi pi-calendar text-2xl text-blue-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm border-0">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">已確認交接</p>
              <p class="text-3xl font-bold text-green-600 mt-2">
                {{ confirmedCount }}
              </p>
            </div>
            <div
              class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center"
            >
              <i class="pi pi-check-circle text-2xl text-green-600"></i>
            </div>
          </div>
        </template>
      </Card>
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
            <label class="text-sm font-medium text-gray-600">狀態</label>
            <Select
              v-model="filterStatus"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="全部狀態"
              class="w-full"
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

    <!-- 交接列表 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center justify-between py-2">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"
            >
              <i class="pi pi-list text-indigo-600 text-lg"></i>
            </div>
            <div>
              <span class="text-xl font-bold text-gray-800">交接列表</span>
              <p class="text-sm text-gray-500 mt-1">
                共
                <span class="font-semibold text-indigo-600">{{
                  filteredHandovers.length
                }}</span>
                筆交接
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <DataTable
          v-if="filteredHandovers.length > 0"
          :value="filteredHandovers"
          :loading="loading"
          stripedRows
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          class="rounded-lg"
          sortField="shiftDate"
          :sortOrder="-1"
        >
          <Column
            field="shiftDate"
            header="日期"
            sortable
            style="min-width: 120px"
          >
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-blue-500 text-sm"></i>
                <span class="font-medium">{{
                  formatDate(data.shiftDate)
                }}</span>
              </div>
            </template>
          </Column>

          <Column field="shiftType" header="班次" style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="getShiftLabel(data.shiftType)"
                severity="info"
                rounded
              />
            </template>
          </Column>

          <Column field="priority" header="重要性" style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="getPriorityMeta(data.priority).label"
                :severity="getPrioritySeverity(data.priority)"
                rounded
              >
                <template #default>
                  <i
                    :class="'pi ' + getPriorityMeta(data.priority).icon"
                    class="mr-1"
                  ></i>
                  {{ getPriorityMeta(data.priority).label }}
                </template>
              </Tag>
            </template>
          </Column>

          <Column
            field="targetClients"
            header="服務對象"
            style="min-width: 150px"
          >
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="client in (data.targetClients || []).slice(0, 2)"
                  :key="client.clientId"
                  :value="client.clientName"
                  severity="secondary"
                  rounded
                  class="text-xs"
                />
                <Tag
                  v-if="(data.targetClients || []).length > 2"
                  :value="'+' + ((data.targetClients || []).length - 2)"
                  severity="contrast"
                  rounded
                  class="text-xs"
                />
              </div>
            </template>
          </Column>

          <Column
            field="content"
            header="交接事項"
            style="min-width: 250px; max-width: 400px"
          >
            <template #body="{ data }">
              <p
                class="text-gray-700 break-words"
                style="
                  white-space: pre-wrap !important;
                  word-break: break-all;
                  overflow-wrap: break-word;
                "
              >
                {{ data.content }}
              </p>
            </template>
          </Column>

          <Column
            field="createdByName"
            header="建立人員"
            style="min-width: 100px"
          >
            <template #body="{ data }">
              <span class="text-gray-600">{{ data.createdByName || "-" }}</span>
            </template>
          </Column>

          <Column field="status" header="狀態" style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="data.status === 'confirmed' ? '已確認' : '待確認'"
                :severity="data.status === 'confirmed' ? 'success' : 'warn'"
                rounded
              />
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
                  @click="viewHandover(data)"
                  v-tooltip.top="'查看詳情'"
                />
                <Button
                  v-if="
                    data.status === 'pending' &&
                    (isAdmin || data.createdBy === userProfile?.id)
                  "
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="warning"
                  @click="openEditDialog(data)"
                  v-tooltip.top="'編輯'"
                />
                <Button
                  v-if="data.status === 'pending'"
                  icon="pi pi-check"
                  text
                  rounded
                  severity="success"
                  @click="openConfirmDialog(data)"
                  v-tooltip.top="'確認交接'"
                />
                <Button
                  v-if="isAdmin || data.createdBy === userProfile?.id"
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
          <div
            class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4"
          >
            <i class="pi pi-sync text-5xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">
            目前沒有交接紀錄
          </h3>
          <p class="text-gray-500 mb-6">開始建立第一筆班務交接吧！</p>
          <Button
            label="新增交接"
            icon="pi pi-plus"
            @click="openCreateDialog"
          />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯交接對話框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingHandover ? '編輯班務交接' : '新增班務交接'"
      :modal="true"
      :style="{ width: '800px' }"
      :draggable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"
          >
            <i
              :class="editingHandover ? 'pi pi-pencil' : 'pi pi-plus'"
              class="text-indigo-600"
            ></i>
          </div>
          <div>
            <h3 class="text-lg font-bold">
              {{ editingHandover ? "編輯班務交接" : "新增班務交接" }}
            </h3>
            <p class="text-sm text-gray-500">填寫交接內容，通知相關人員</p>
          </div>
        </div>
      </template>

      <div class="space-y-5 py-4">
        <!-- 建立人員（唯讀） -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold"
            >
              {{ userProfile?.displayName?.charAt(0) || "?" }}
            </div>
            <div>
              <p class="font-semibold text-gray-800">
                {{ userProfile?.displayName }}
              </p>
              <p class="text-sm text-gray-500">建立人員</p>
            </div>
          </div>
        </div>

        <!-- 日期與班次 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              交接日期 <span class="text-red-500">*</span>
            </label>
            <DatePicker
              v-model="handoverForm.shiftDate"
              placeholder="選擇日期"
              dateFormat="yy/mm/dd"
              class="w-full"
              showIcon
              :invalid="!!formErrors.shiftDate"
            />
            <small v-if="formErrors.shiftDate" class="text-red-500 mt-1 block">
              {{ formErrors.shiftDate }}
            </small>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              班次 <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="handoverForm.shiftType"
              :options="SHIFT_OPTIONS"
              optionLabel="label"
              optionValue="value"
              placeholder="選擇班次"
              class="w-full"
              :invalid="!!formErrors.shiftType"
            />
            <small v-if="formErrors.shiftType" class="text-red-500 mt-1 block">
              {{ formErrors.shiftType }}
            </small>
          </div>
        </div>

        <!-- 重要性 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            重要性 <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-3">
            <div
              v-for="option in PRIORITY_OPTIONS"
              :key="option.value"
              @click="handoverForm.priority = option.value"
              class="flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="
                handoverForm.priority === option.value
                  ? getPriorityBorderClass(option.value)
                  : 'border-gray-200 hover:border-gray-300'
              "
            >
              <div class="text-center">
                <i
                  :class="
                    'pi ' +
                    option.icon +
                    ' text-2xl mb-1 ' +
                    getPriorityTextClass(option.value)
                  "
                ></i>
                <p class="font-medium text-gray-700">{{ option.label }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知人員 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            通知人員 <span class="text-red-500">*</span>
          </label>
          <MultiSelect
            v-model="handoverForm.notifyUserIds"
            :options="userOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="選擇要通知的人員"
            class="w-full"
            filter
            :maxSelectedLabels="3"
            :invalid="!!formErrors.notifyUsers"
          />
          <small v-if="formErrors.notifyUsers" class="text-red-500 mt-1 block">
            {{ formErrors.notifyUsers }}
          </small>
        </div>

        <!-- 服務對象 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            服務對象
          </label>
          <MultiSelect
            v-model="handoverForm.targetClientIds"
            :options="clientOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="選擇相關個案（可選）"
            class="w-full"
            filter
            :maxSelectedLabels="3"
          />
        </div>

        <!-- 交接事項 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            交接事項 <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model="handoverForm.content"
            rows="8"
            placeholder="請詳細描述需要交接的事項..."
            class="w-full text-lg"
            :invalid="!!formErrors.content"
            style="font-size: 1.125rem; line-height: 1.75rem"
          />
          <small v-if="formErrors.content" class="text-red-500 mt-1 block">
            {{ formErrors.content }}
          </small>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="showCreateDialog = false"
            icon="pi pi-times"
          />
          <Button
            :label="editingHandover ? '儲存變更' : '建立交接'"
            @click="saveHandover"
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
      header="交接詳情"
      :modal="true"
      :style="{ width: '700px' }"
      :draggable="false"
    >
      <template v-if="viewingHandover">
        <div class="space-y-4">
          <!-- 基本資訊 -->
          <div class="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label class="text-sm text-gray-600">交接日期</label>
              <p class="text-lg font-semibold text-gray-800 mt-1 break-words">
                {{ formatDate(viewingHandover.shiftDate) }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">班次</label>
              <div class="mt-1">
                <Tag
                  :value="getShiftLabel(viewingHandover.shiftType)"
                  severity="info"
                  rounded
                />
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-600">重要性</label>
              <div class="mt-1">
                <Tag
                  :value="getPriorityMeta(viewingHandover.priority).label"
                  :severity="getPrioritySeverity(viewingHandover.priority)"
                  rounded
                />
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-600">建立人員</label>
              <p class="text-lg font-semibold text-gray-800 mt-1 break-words">
                {{ viewingHandover.createdByName || "-" }}
              </p>
            </div>
          </div>

          <!-- 通知人員 -->
          <div>
            <label class="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <i class="pi pi-users text-primary"></i>
              通知人員
            </label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="user in viewingHandover.notifyUsers"
                :key="user.userId"
                :value="user.userName"
                :severity="user.isRead ? 'success' : 'warn'"
                rounded
              >
                <template #default>
                  <i
                    :class="user.isRead ? 'pi pi-check' : 'pi pi-clock'"
                    class="mr-1"
                  ></i>
                  {{ user.userName }}
                </template>
              </Tag>
            </div>
          </div>

          <!-- 服務對象 -->
          <div v-if="viewingHandover.targetClients?.length > 0">
            <label class="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <i class="pi pi-user text-primary"></i>
              服務對象
            </label>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="client in viewingHandover.targetClients"
                :key="client.clientId"
                :value="client.clientName"
                severity="secondary"
                rounded
              />
            </div>
          </div>

          <!-- 交接事項 -->
          <div>
            <label class="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <i class="pi pi-file-edit text-primary"></i>
              交接事項
            </label>
            <div class="bg-gray-50 rounded-lg p-4">
              <p
                class="text-gray-700 whitespace-pre-wrap break-words text-lg leading-relaxed"
              >
                {{ viewingHandover.content }}
              </p>
            </div>
          </div>

          <!-- 確認資訊 -->
          <div
            v-if="viewingHandover.status === 'confirmed'"
            class="bg-green-50 rounded-lg p-4"
          >
            <div class="flex items-center gap-2 text-green-700">
              <i class="pi pi-check-circle text-xl"></i>
              <div>
                <p class="font-semibold break-words">已確認交接</p>
                <p class="text-sm break-words">
                  {{ viewingHandover.confirmedByName }} 於
                  {{ formatDateTime(viewingHandover.confirmedAt) }} 確認
                </p>
              </div>
            </div>
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
            icon="pi pi-times"
          />
          <Button
            v-if="
              viewingHandover?.status === 'pending' &&
              (isAdmin || viewingHandover.createdBy === userProfile?.id)
            "
            label="編輯"
            icon="pi pi-pencil"
            severity="info"
            @click="editFromView"
          />
          <Button
            v-if="viewingHandover?.status === 'pending'"
            label="確認交接"
            icon="pi pi-check"
            severity="success"
            @click="openConfirmDialog(viewingHandover)"
          />
        </div>
      </template>
    </Dialog>

    <!-- 確認交接對話框 -->
    <Dialog
      v-model:visible="showConfirmDialog"
      header="確認交接"
      :modal="true"
      :style="{ width: '450px' }"
      :draggable="false"
    >
      <div class="py-4">
        <div class="text-center mb-4">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
          >
            <i class="pi pi-check text-3xl text-green-600"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-800">確認已完成交接？</h3>
          <p class="text-gray-500 mt-2">確認後將標記此交接為已完成</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="showConfirmDialog = false"
            icon="pi pi-times"
          />
          <Button
            label="確認交接"
            severity="success"
            @click="doConfirmHandover"
            :loading="confirming"
            icon="pi pi-check"
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
      <div class="py-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-gray-700">
            確定要刪除這筆交接紀錄嗎？此操作無法復原。
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
            @click="doDeleteHandover"
            :loading="deleting"
            icon="pi pi-trash"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useToast } from "primevue/usetoast";
import {
  useHandover,
  SHIFT_OPTIONS,
  PRIORITY_OPTIONS,
  type Handover,
} from "~/composables/useHandover";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const toast = useToast();
const { userProfile, isAdmin } = useAuth();
const { getCollection } = useFirestore();
const { fetchClients, clients: allClients } = useClients();
const {
  getHandovers,
  createHandover,
  updateHandover,
  deleteHandover,
  confirmHandover,
  markAsRead,
  getShiftLabel,
  getPriorityMeta,
} = useHandover();
const { formatDateTime } = useUtils();

// 狀態
const loading = ref(false);
const saving = ref(false);
const confirming = ref(false);
const deleting = ref(false);
const handoversData = ref<Handover[]>([]);
const allUsers = ref<any[]>([]);

// 對話框狀態
const showCreateDialog = ref(false);
const showViewDialog = ref(false);
const showConfirmDialog = ref(false);
const showDeleteDialog = ref(false);
const editingHandover = ref<Handover | null>(null);
const viewingHandover = ref<Handover | null>(null);
const confirmingHandover = ref<Handover | null>(null);
const deletingHandover = ref<Handover | null>(null);

// 篩選
const filterStatus = ref("all");
const filterStartDate = ref<Date | null>(null);
const filterEndDate = ref<Date | null>(null);

const statusOptions = [
  { label: "全部狀態", value: "all" },
  { label: "待確認", value: "pending" },
  { label: "已確認", value: "confirmed" },
];

// 表單
const handoverForm = ref({
  shiftDate: new Date(),
  shiftType: "" as string,
  priority: "normal" as string,
  notifyUserIds: [] as string[],
  targetClientIds: [] as string[],
  content: "",
});

const formErrors = ref<Record<string, string>>({});

// 計算屬性
const userOptions = computed(() => {
  return allUsers.value
    .filter((u) => u.isActive && u.id !== userProfile.value?.id)
    .map((u) => ({
      label: `${u.displayName} (${getRoleLabel(u.role)})`,
      value: u.id,
    }));
});

const clientOptions = computed(() => {
  return allClients.value.map((c) => ({
    label: c.name,
    value: c.id,
  }));
});

const filteredHandovers = computed(() => {
  let result = handoversData.value;

  if (filterStatus.value !== "all") {
    result = result.filter((h) => h.status === filterStatus.value);
  }

  if (filterStartDate.value) {
    result = result.filter((h) => {
      const date = toDate(h.shiftDate);
      return date && date >= filterStartDate.value!;
    });
  }

  if (filterEndDate.value) {
    result = result.filter((h) => {
      const date = toDate(h.shiftDate);
      return date && date <= filterEndDate.value!;
    });
  }

  return result;
});

const pendingCount = computed(
  () => handoversData.value.filter((h) => h.status === "pending").length
);
const confirmedCount = computed(
  () => handoversData.value.filter((h) => h.status === "confirmed").length
);
const todayCount = computed(() => {
  const today = dayjs().startOf("day");
  return handoversData.value.filter((h) => {
    const date = toDate(h.shiftDate);
    return date && dayjs(date).isSame(today, "day");
  }).length;
});

// 方法
const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
};

const formatDate = (date: any) => {
  const d = toDate(date);
  return d ? dayjs(d).format("YYYY/MM/DD") : "-";
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: "管理員",
    caregiver: "照顧者",
    family: "家屬",
  };
  return labels[role] || role;
};

const getPrioritySeverity = (priority: string) => {
  const map: Record<string, string> = {
    urgent: "danger",
    high: "warn",
    normal: "success",
    low: "secondary",
  };
  return map[priority] || "secondary";
};

const getPriorityBorderClass = (priority: string) => {
  const map: Record<string, string> = {
    urgent: "border-red-500 bg-red-50",
    high: "border-orange-500 bg-orange-50",
    normal: "border-green-500 bg-green-50",
    low: "border-gray-400 bg-gray-50",
  };
  return map[priority] || "border-gray-200";
};

const getPriorityTextClass = (priority: string) => {
  const map: Record<string, string> = {
    urgent: "text-red-500",
    high: "text-orange-500",
    normal: "text-green-500",
    low: "text-gray-400",
  };
  return map[priority] || "text-gray-400";
};

const resetForm = () => {
  handoverForm.value = {
    shiftDate: new Date(),
    shiftType: "",
    priority: "normal",
    notifyUserIds: [],
    targetClientIds: [],
    content: "",
  };
  formErrors.value = {};
};

const openCreateDialog = () => {
  editingHandover.value = null;
  resetForm();
  showCreateDialog.value = true;
};

const openEditDialog = (handover: Handover) => {
  editingHandover.value = handover;

  // 填入表單資料 - 需要轉換日期格式
  handoverForm.value = {
    shiftDate: toDate(handover.shiftDate) || new Date(),
    shiftType: handover.shiftType,
    priority: handover.priority,
    content: handover.content,
    targetClientIds: handover.targetClients?.map((c) => c.clientId) || [],
    notifyUserIds: handover.notifyUsers?.map((u) => u.userId) || [],
  };

  showCreateDialog.value = true;
};

const viewHandover = async (handover: Handover) => {
  viewingHandover.value = handover;
  showViewDialog.value = true;

  // 標記為已讀
  if (handover.id) {
    await markAsRead(handover.id);
  }
};

const editFromView = () => {
  if (viewingHandover.value) {
    showViewDialog.value = false;
    openEditDialog(viewingHandover.value);
  }
};

const openConfirmDialog = (handover: Handover) => {
  confirmingHandover.value = handover;
  showViewDialog.value = false;
  showConfirmDialog.value = true;
};

const confirmDelete = (handover: Handover) => {
  deletingHandover.value = handover;
  showDeleteDialog.value = true;
};

const validateForm = () => {
  formErrors.value = {};

  if (!handoverForm.value.shiftDate) {
    formErrors.value.shiftDate = "請選擇交接日期";
  }
  if (!handoverForm.value.shiftType) {
    formErrors.value.shiftType = "請選擇班次";
  }
  if (handoverForm.value.notifyUserIds.length === 0) {
    formErrors.value.notifyUsers = "請選擇至少一位通知人員";
  }
  if (
    !handoverForm.value.content ||
    handoverForm.value.content.trim().length === 0
  ) {
    formErrors.value.content = "請輸入交接事項";
  }

  return Object.keys(formErrors.value).length === 0;
};

const saveHandover = async () => {
  if (!validateForm()) return;

  saving.value = true;
  try {
    // 建構通知人員資料
    const notifyUsers = handoverForm.value.notifyUserIds.map((userId) => {
      const user = allUsers.value.find((u) => u.id === userId);
      return {
        userId,
        userName: user?.displayName || "",
        isRead: false,
      };
    });

    // 建構服務對象資料
    const targetClients = handoverForm.value.targetClientIds.map((clientId) => {
      const client = allClients.value.find((c) => c.id === clientId);
      return {
        clientId,
        clientName: client?.name || "",
      };
    });

    const data = {
      shiftDate: handoverForm.value.shiftDate,
      shiftType: handoverForm.value.shiftType as any,
      priority: handoverForm.value.priority as any,
      notifyUsers,
      targetClients,
      content: handoverForm.value.content,
      createdBy: userProfile.value?.id || "",
      createdByName: userProfile.value?.displayName || "",
      status: "pending" as const,
    };

    if (editingHandover.value?.id) {
      await updateHandover(editingHandover.value.id, data);
      toast.add({
        severity: "success",
        summary: "更新成功",
        detail: "交接紀錄已更新",
        life: 3000,
      });
    } else {
      await createHandover(data);
      toast.add({
        severity: "success",
        summary: "建立成功",
        detail: "班務交接已建立",
        life: 3000,
      });
    }

    showCreateDialog.value = false;
    await loadHandovers();
  } catch (error) {
    console.error("儲存交接失敗:", error);
    toast.add({
      severity: "error",
      summary: "儲存失敗",
      detail: "請稍後再試",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};

const doConfirmHandover = async () => {
  if (!confirmingHandover.value?.id) return;

  confirming.value = true;
  try {
    await confirmHandover(confirmingHandover.value.id);

    toast.add({
      severity: "success",
      summary: "確認成功",
      detail: "交接已確認完成",
      life: 3000,
    });

    showConfirmDialog.value = false;
    await loadHandovers();
  } catch (error) {
    console.error("確認交接失敗:", error);
    toast.add({
      severity: "error",
      summary: "確認失敗",
      detail: "請稍後再試",
      life: 3000,
    });
  } finally {
    confirming.value = false;
  }
};

const doDeleteHandover = async () => {
  if (!deletingHandover.value?.id) return;

  deleting.value = true;
  try {
    await deleteHandover(deletingHandover.value.id);

    toast.add({
      severity: "success",
      summary: "刪除成功",
      detail: "交接紀錄已刪除",
      life: 3000,
    });

    showDeleteDialog.value = false;
    await loadHandovers();
  } catch (error) {
    console.error("刪除交接失敗:", error);
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

const resetFilters = () => {
  filterStatus.value = "all";
  filterStartDate.value = null;
  filterEndDate.value = null;
};

// 載入資料
const loadHandovers = async () => {
  loading.value = true;
  try {
    const data = await getHandovers();
    handoversData.value = data;
  } catch (error) {
    console.error("載入交接失敗:", error);
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法取得交接紀錄",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const loadUsers = async () => {
  try {
    const data = await getCollection("users");
    allUsers.value = data;
  } catch (error) {
    console.error("載入使用者失敗:", error);
  }
};

// 從查詢參數編輯
const { checkEditQuery } = useEditFromQuery(handoversData, openEditDialog);

// 初始化
onMounted(async () => {
  await Promise.all([loadHandovers(), loadUsers(), fetchClients()]);
  checkEditQuery();
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
