<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-surface-900">儀表板</h1>
        <p class="text-surface-600 mt-1">
          歡迎回來，{{ userProfile?.displayName }}！
        </p>
      </div>
      <div class="text-right text-sm text-surface-500">
        <p>{{ currentDate }}</p>
        <p>{{ currentTime }}</p>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-surface-500 text-sm">個案總數</p>
              <p class="text-3xl font-bold text-primary mt-2">
                <i v-if="statsLoading" class="pi pi-spinner pi-spin text-2xl"></i>
                <span v-else>{{ stats.totalClients }}</span>
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <i class="pi pi-users text-3xl text-blue-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-surface-500 text-sm">今日紀錄</p>
              <p class="text-3xl font-bold text-green-600 mt-2">
                <i v-if="statsLoading" class="pi pi-spinner pi-spin text-2xl"></i>
                <span v-else>{{ stats.todayRecords }}</span>
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
            >
              <i class="pi pi-file-edit text-3xl text-green-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-surface-500 text-sm">本週新增個案</p>
              <p class="text-3xl font-bold text-orange-600 mt-2">
                <i v-if="statsLoading" class="pi pi-spinner pi-spin text-2xl"></i>
                <span v-else>{{ stats.weeklyNewClients }}</span>
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center"
            >
              <i class="pi pi-user-plus text-3xl text-orange-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-surface-500 text-sm">釘選紀錄</p>
              <p class="text-3xl font-bold text-purple-600 mt-2">
                <i v-if="statsLoading" class="pi pi-spinner pi-spin text-2xl"></i>
                <span v-else>{{ stats.pinnedRecords }}</span>
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center"
            >
              <i class="pi pi-bookmark text-3xl text-purple-600"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 快速操作 -->
    <Card>
      <template #title>
        <div class="flex items-center">
          <i class="pi pi-bolt mr-2 text-primary"></i>
          快速操作
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Button
            label="新增照護紀錄"
            icon="pi pi-plus"
            severity="primary"
            @click="navigateTo('/records?action=new')"
            class="w-full"
          />
          <Button
            label="班務交接"
            icon="pi pi-sync"
            severity="warn"
            @click="navigateTo('/handover')"
            class="w-full"
          />
          <Button
            label="查看個案"
            icon="pi pi-users"
            severity="info"
            outlined
            @click="navigateTo('/clients')"
            class="w-full"
          />
          <Button
            label="生命徵象"
            icon="pi pi-heart"
            severity="danger"
            outlined
            @click="navigateTo('/vital-signs')"
            class="w-full"
          />
          <Button
            label="匯出報表"
            icon="pi pi-download"
            severity="success"
            outlined
            @click="handleExport"
            class="w-full"
          />
        </div>
      </template>
    </Card>

    <!-- 待確認交接 -->
    <Card v-if="pendingHandovers.length > 0" class="border-l-4 border-orange-500">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="pi pi-sync text-orange-600 mr-2"></i>
            待確認交接
            <Tag :value="pendingHandovers.length + ' 筆'" severity="warn" class="ml-2" rounded />
          </div>
          <Button
            label="查看全部"
            icon="pi pi-arrow-right"
            text
            @click="navigateTo('/handover')"
          />
        </div>
      </template>
      <template #content>
        <div v-if="handoversLoading" class="text-center py-4">
          <i class="pi pi-spinner pi-spin text-2xl text-gray-400"></i>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="handover in pendingHandovers"
            :key="handover.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-orange-50 cursor-pointer transition-colors"
            @click="navigateTo('/handover')"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Tag
                    :value="getPriorityMeta(handover.priority).label"
                    :severity="getPrioritySeverity(handover.priority)"
                    rounded
                  />
                  <Tag :value="getShiftLabel(handover.shiftType)" severity="info" rounded />
                  <span class="text-sm text-gray-600">
                    {{ formatHandoverDate(handover.shiftDate) }}
                  </span>
                </div>
                <p class="text-gray-700 line-clamp-2">{{ handover.content }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  建立者：{{ handover.createdByName }}
                </p>
              </div>
              <i class="pi pi-clock text-orange-500"></i>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 釘選紀錄 -->
    <Card v-if="pinnedRecords.length > 0">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="pi pi-bookmark text-orange-600 mr-2"></i>
            釘選紀錄
          </div>
          <Button
            label="查看全部"
            icon="pi pi-arrow-right"
            text
            @click="navigateTo('/records?pinned=true')"
          />
        </div>
      </template>
      <template #content>
        <div class="space-y-3">
          <div
            v-for="record in pinnedRecords"
            :key="record.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="viewRecordDetail(record)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Tag
                    :value="getRecordTypeLabel(record.type)"
                    :severity="getRecordTypeSeverity(record.type)"
                    rounded
                  />
                  <span class="text-sm text-gray-600">
                    {{ record.clientName }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ formatDate(record.date) }}
                  </span>
                </div>
                <p class="text-gray-700 line-clamp-2">{{ record.content }}</p>
              </div>
              <i class="pi pi-bookmark-fill text-orange-500"></i>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 所有個案記錄 -->
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="pi pi-file-edit mr-2 text-primary"></i>
            所有個案記錄
          </div>
        </div>
      </template>
      <template #content>
        <!-- 搜尋和篩選區 -->
        <div class="mb-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                placeholder="搜尋個案名稱或內容..."
                class="w-full"
              />
            </IconField>
            <Select
              v-model="selectedRecordType"
              :options="recordTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="所有記錄類型"
              class="w-full"
              showClear
            />
            <Calendar
              v-model="searchStartDate"
              placeholder="開始日期"
              dateFormat="yy/mm/dd"
              showIcon
              class="w-full"
            />
            <Calendar
              v-model="searchEndDate"
              placeholder="結束日期"
              dateFormat="yy/mm/dd"
              showIcon
              class="w-full"
            />
          </div>
          <div class="flex items-center gap-2">
            <Checkbox v-model="showPinnedOnly" inputId="pinnedOnly" :binary="true" />
            <label for="pinnedOnly" class="cursor-pointer">僅顯示釘選記錄</label>
          </div>
        </div>

        <!-- 記錄列表 -->
        <div v-if="allRecordsLoading" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-3xl text-gray-400"></i>
        </div>
        <div v-else-if="filteredRecords.length > 0" class="space-y-3">
          <div
            v-for="record in filteredRecords"
            :key="record.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Tag
                    :value="getRecordTypeLabel(record.type)"
                    :severity="getRecordTypeSeverity(record.type)"
                    rounded
                  />
                  <span class="text-sm text-gray-600">
                    {{ record.clientName }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ formatDate(record.date) }}
                  </span>
                </div>
                <p class="text-gray-700 line-clamp-2">{{ record.summary }}</p>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>
                    <i class="pi pi-user mr-1"></i>
                    {{ record.recordedByName }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Button
                  :icon="record.isPinned ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
                  :severity="record.isPinned ? 'warn' : 'secondary'"
                  text
                  rounded
                  @click="handleTogglePin(record)"
                  v-tooltip.left="record.isPinned ? '取消釘選' : '釘選'"
                />
                <Button
                  icon="pi pi-eye"
                  severity="info"
                  text
                  rounded
                  @click="viewRecordDetail(record)"
                  v-tooltip.left="'查看內容'"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-surface-500">
          <i class="pi pi-inbox text-4xl mb-3 block"></i>
          <p>目前沒有符合條件的記錄</p>
        </div>

        <!-- 分頁 -->
        <div v-if="filteredRecords.length > 0" class="mt-6 flex justify-center">
          <Paginator
            :rows="recordsPerPage"
            :totalRecords="totalFilteredRecords"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>

    <!-- 記錄詳情 Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="`記錄詳情 - ${selectedRecord?.clientName || ''}`"
      :style="{ width: '50rem' }"
      modal
      :closable="true"
    >
      <div v-if="selectedRecord" class="space-y-4">
        <!-- 基本資訊 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">記錄類型</p>
            <Tag
              :value="getRecordTypeLabel(selectedRecord.type)"
              :severity="getRecordTypeSeverity(selectedRecord.type)"
              rounded
            />
          </div>
          <div>
            <p class="text-sm text-gray-500">個案姓名</p>
            <p class="font-semibold">{{ selectedRecord.clientName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">記錄日期</p>
            <p class="font-semibold">{{ formatDate(selectedRecord.date) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">記錄者</p>
            <p class="font-semibold">{{ selectedRecord.recordedByName }}</p>
          </div>
        </div>

        <Divider />

        <!-- 護理紀錄詳情 -->
        <div v-if="selectedRecord.type === 'care'" class="space-y-3">
          <div>
            <p class="text-sm text-gray-500">護理內容</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.content || selectedRecord.rawData.notes || '無' }}</p>
          </div>
          <div v-if="selectedRecord.rawData.vitalSigns">
            <p class="text-sm text-gray-500 mb-2">生理徵象</p>
            <div class="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded">
              <div v-if="selectedRecord.rawData.vitalSigns.temperature">
                <span class="text-xs text-gray-500">體溫:</span>
                <span class="ml-2">{{ selectedRecord.rawData.vitalSigns.temperature }}°C</span>
              </div>
              <div v-if="selectedRecord.rawData.vitalSigns.heartRate">
                <span class="text-xs text-gray-500">心跳:</span>
                <span class="ml-2">{{ selectedRecord.rawData.vitalSigns.heartRate }} bpm</span>
              </div>
              <div v-if="selectedRecord.rawData.vitalSigns.bloodPressure">
                <span class="text-xs text-gray-500">血壓:</span>
                <span class="ml-2">{{ selectedRecord.rawData.vitalSigns.bloodPressure }}</span>
              </div>
              <div v-if="selectedRecord.rawData.vitalSigns.respiratoryRate">
                <span class="text-xs text-gray-500">呼吸:</span>
                <span class="ml-2">{{ selectedRecord.rawData.vitalSigns.respiratoryRate }} /min</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 情緒紀錄詳情 -->
        <div v-if="selectedRecord.type === 'emotion'" class="space-y-3">
          <div>
            <p class="text-sm text-gray-500">情境</p>
            <p>{{ selectedRecord.rawData.context || '無' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">症狀</p>
            <div class="flex flex-wrap gap-2">
              <Tag v-for="symptom in selectedRecord.rawData.symptoms" :key="symptom" :value="symptom" />
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500">處置方式</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.intervention || '無' }}</p>
          </div>
        </div>

        <!-- 解便紀錄詳情 -->
        <div v-if="selectedRecord.type === 'bowel'" class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">解便量</p>
              <p>{{ selectedRecord.rawData.amount || '無' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">顏色</p>
              <p>{{ selectedRecord.rawData.color || '無' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">性質</p>
              <p>{{ selectedRecord.rawData.consistency || '無' }}</p>
            </div>
          </div>
          <div v-if="selectedRecord.rawData.notes">
            <p class="text-sm text-gray-500">備註</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.notes }}</p>
          </div>
        </div>

        <!-- 癲癇紀錄詳情 -->
        <div v-if="selectedRecord.type === 'seizure'" class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">發作時長</p>
              <p>{{ selectedRecord.rawData.durationSeconds }} 秒</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">意識狀態</p>
              <p>{{ selectedRecord.rawData.consciousnessState || '無' }}</p>
            </div>
          </div>
          <div v-if="selectedRecord.rawData.description">
            <p class="text-sm text-gray-500">發作描述</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.description }}</p>
          </div>
          <div v-if="selectedRecord.rawData.intervention">
            <p class="text-sm text-gray-500">處置方式</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.intervention }}</p>
          </div>
        </div>

        <!-- 生理期紀錄詳情 -->
        <div v-if="selectedRecord.type === 'menstrual'" class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">經血量</p>
              <p>{{ selectedRecord.rawData.flowAmount || '無' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">疼痛程度</p>
              <p>{{ selectedRecord.rawData.painLevel || '無' }}</p>
            </div>
          </div>
          <div v-if="selectedRecord.rawData.notes">
            <p class="text-sm text-gray-500">備註</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.notes }}</p>
          </div>
        </div>

        <!-- 班務交接詳情 -->
        <div v-if="selectedRecord.type === 'handover'" class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">班別</p>
              <p>{{ getShiftLabel(selectedRecord.rawData.shiftType) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">優先級</p>
              <Tag
                :value="getPriorityMeta(selectedRecord.rawData.priority).label"
                :severity="getPrioritySeverity(selectedRecord.rawData.priority)"
                rounded
              />
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500">交接內容</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.content }}</p>
          </div>
          <div v-if="selectedRecord.rawData.targetClients && selectedRecord.rawData.targetClients.length > 0">
            <p class="text-sm text-gray-500">相關個案</p>
            <div class="flex flex-wrap gap-2">
              <Tag v-for="client in selectedRecord.rawData.targetClients" :key="client.clientId" :value="client.clientName" />
            </div>
          </div>
        </div>

        <!-- 家屬聯絡詳情 -->
        <div v-if="selectedRecord.type === 'familyContact'" class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">聯絡對象</p>
              <p>{{ selectedRecord.rawData.contactTarget || '無' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">聯絡方式</p>
              <p>{{ selectedRecord.rawData.contactMethod || '無' }}</p>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500">聯絡內容</p>
            <p class="whitespace-pre-wrap break-words">{{ selectedRecord.rawData.content }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="關閉" icon="pi pi-times" @click="showDetailDialog = false" text />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";

dayjs.locale("zh-tw");

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const { userProfile } = useAuth();
const { toDate, formatDateTime } = useUtils();
const { getClients } = useClients();
const { getRecords, togglePin: toggleCarePin } = useRecords();
const { getEmotionRecords, togglePin: toggleEmotionPin } = useEmotionRecords();
const { getBowelRecords, togglePin: toggleBowelPin } = useBowelRecords();
const { getSeizureRecords, togglePin: toggleSeizurePin } = useSeizureRecords();
const { getMenstrualRecords, togglePin: toggleMenstrualPin } = useMenstrualRecords();
const { getHandovers, getMyPendingHandovers, getShiftLabel, getPriorityMeta, togglePin: toggleHandoverPin } = useHandover();
const { getContacts, togglePin: toggleFamilyContactPin } = useFamilyContacts();

// 載入狀態
const statsLoading = ref(true);
const allRecordsLoading = ref(true);
const handoversLoading = ref(true);

// 資料狀態
const stats = ref({
  totalClients: 0,
  todayRecords: 0,
  weeklyNewClients: 0,
  pinnedRecords: 0,
});
const allRecords = ref<any[]>([]);
const pinnedRecords = ref<any[]>([]);
const pendingHandovers = ref<any[]>([]);

// 詳情 Dialog 狀態
const showDetailDialog = ref(false);
const selectedRecord = ref<any>(null);

// 搜尋和篩選狀態
const searchQuery = ref("");
const selectedRecordType = ref<string | null>(null);
const searchStartDate = ref<Date | null>(null);
const searchEndDate = ref<Date | null>(null);
const showPinnedOnly = ref(false);
const currentPage = ref(0);
const recordsPerPage = ref(10);

// 當前日期時間
const currentDate = ref("");
const currentTime = ref("");

const updateDateTime = () => {
  currentDate.value = dayjs().format("YYYY年MM月DD日 dddd");
  currentTime.value = dayjs().format("HH:mm:ss");
};

// 記錄類型選項
const recordTypeOptions = ref([
  { label: "照護紀錄", value: "care" },
  { label: "情緒紀錄", value: "emotion" },
  { label: "解便紀錄", value: "bowel" },
  { label: "癲癇紀錄", value: "seizure" },
  { label: "生理期紀錄", value: "menstrual" },
  { label: "班務交接", value: "handover" },
  { label: "家屬聯絡", value: "familyContact" },
]);

// 紀錄類型映射
const RECORD_TYPE_META: Record<
  string,
  { label: string; severity: "success" | "info" | "warn" | "danger" | "secondary" | "contrast" }
> = {
  care: { label: "照護紀錄", severity: "info" },
  emotion: { label: "情緒紀錄", severity: "warn" },
  bowel: { label: "解便紀錄", severity: "secondary" },
  seizure: { label: "癲癇紀錄", severity: "danger" },
  menstrual: { label: "生理期紀錄", severity: "contrast" },
  handover: { label: "班務交接", severity: "warn" },
  familyContact: { label: "家屬聯絡", severity: "success" },
  daily_care: { label: "日常照護", severity: "info" },
  health_observation: { label: "健康觀察", severity: "warn" },
  activity: { label: "活動參與", severity: "success" },
  meal: { label: "飲食紀錄", severity: "secondary" },
  behavior: { label: "行為記錄", severity: "contrast" },
  special_event: { label: "特殊事件", severity: "danger" },
  other: { label: "其他", severity: "secondary" },
};

// 計算屬性 - 篩選後的記錄
const filteredRecords = computed(() => {
  let filtered = [...allRecords.value];

  // 搜尋關鍵字
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.clientName?.toLowerCase().includes(query) ||
        r.summary?.toLowerCase().includes(query)
    );
  }

  // 記錄類型篩選
  if (selectedRecordType.value) {
    filtered = filtered.filter((r) => r.type === selectedRecordType.value);
  }

  // 日期範圍篩選
  if (searchStartDate.value) {
    filtered = filtered.filter((r) => {
      const recordDate = toDate(r.date);
      return recordDate && dayjs(recordDate).isAfter(dayjs(searchStartDate.value).startOf('day'));
    });
  }
  if (searchEndDate.value) {
    filtered = filtered.filter((r) => {
      const recordDate = toDate(r.date);
      return recordDate && dayjs(recordDate).isBefore(dayjs(searchEndDate.value).endOf('day'));
    });
  }

  // 僅顯示釘選
  if (showPinnedOnly.value) {
    filtered = filtered.filter((r) => r.isPinned);
  }

  // 分頁
  const start = currentPage.value * recordsPerPage.value;
  const end = start + recordsPerPage.value;
  return filtered.slice(start, end);
});

const totalFilteredRecords = computed(() => {
  let filtered = [...allRecords.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.clientName?.toLowerCase().includes(query) ||
        r.summary?.toLowerCase().includes(query)
    );
  }

  if (selectedRecordType.value) {
    filtered = filtered.filter((r) => r.type === selectedRecordType.value);
  }

  if (searchStartDate.value) {
    filtered = filtered.filter((r) => {
      const recordDate = toDate(r.date);
      return recordDate && dayjs(recordDate).isAfter(dayjs(searchStartDate.value).startOf('day'));
    });
  }
  if (searchEndDate.value) {
    filtered = filtered.filter((r) => {
      const recordDate = toDate(r.date);
      return recordDate && dayjs(recordDate).isBefore(dayjs(searchEndDate.value).endOf('day'));
    });
  }

  if (showPinnedOnly.value) {
    filtered = filtered.filter((r) => r.isPinned);
  }

  return filtered.length;
});

// 載入統計資料
const loadStats = async () => {
  statsLoading.value = true;
  try {
    // 載入所有個案
    const clients = await getClients();
    stats.value.totalClients = clients.length;

    // 計算本週新增個案
    const weekStart = dayjs().startOf("week").toDate();
    const weeklyClients = clients.filter((client: any) => {
      const createdAt = toDate(client.createdAt);
      return createdAt ? dayjs(createdAt).isAfter(weekStart) : false;
    });
    stats.value.weeklyNewClients = weeklyClients.length;

    // 載入今日紀錄
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();
    const todayRecords = await getRecords({
      startDate: todayStart,
      endDate: todayEnd,
    });
    stats.value.todayRecords = todayRecords.length;

    // 載入釘選紀錄數量 - 這會在 loadAllRecords 後計算
    // 暫時設為 0，等載入所有記錄後再更新
    stats.value.pinnedRecords = 0;
  } catch (error) {
    console.error("載入統計資料失敗:", error);
  } finally {
    statsLoading.value = false;
  }
};

// 載入所有記錄
const loadAllRecords = async () => {
  allRecordsLoading.value = true;
  try {
    const userId = userProfile.value?.id;

    // 並行載入所有類型的記錄
    const [careRecords, emotionRecords, bowelRecords, seizureRecords, menstrualRecords, handoverRecords, familyContactRecords] =
      await Promise.all([
        getRecords({ limitCount: 100 }),
        getEmotionRecords({ limitCount: 100 }),
        getBowelRecords({ limitCount: 100 }),
        getSeizureRecords({ limitCount: 100 }),
        getMenstrualRecords({ limitCount: 100 }),
        getHandovers({ limitCount: 100 }),
        getContacts({ limitCount: 100 }),
      ]);

    // 將所有記錄轉換為統一格式
    const records: any[] = [];

    // 照護紀錄
    careRecords.forEach((record: any) => {
      records.push({
        id: record.id,
        type: "care",
        collectionName: "records",
        clientId: record.clientId,
        clientName: record.clientName,
        date: record.recordDate,
        summary: record.content || record.notes || "",
        recordedByName: record.recordedByName,
        isPinned: record.isPinned && record.pinnedBy?.includes(userId),
        pinnedBy: record.pinnedBy || [],
        rawData: record,
      });
    });

    // 情緒紀錄
    emotionRecords.forEach((record: any) => {
      const symptomsText = record.symptoms?.slice(0, 2).join(", ") || "";
      records.push({
        id: record.id,
        type: "emotion",
        collectionName: "emotionRecords",
        clientId: record.clientId,
        clientName: record.clientName,
        date: record.occurredDate,
        summary: `情境: ${record.context}, 症狀: ${symptomsText}...`,
        recordedByName: record.recordedByName,
        isPinned: record.isPinned && record.pinnedBy?.includes(userId),
        pinnedBy: record.pinnedBy || [],
        rawData: record,
      });
    });

    // 解便紀錄
    bowelRecords.forEach((record: any) => {
      records.push({
        id: record.id,
        type: "bowel",
        collectionName: "bowelRecords",
        clientId: record.clientId,
        clientName: record.clientName,
        date: record.occurredDate,
        summary: `解便量: ${record.amount}, 顏色: ${record.color}`,
        recordedByName: record.recordedByName,
        isPinned: record.isPinned && record.pinnedBy?.includes(userId),
        pinnedBy: record.pinnedBy || [],
        rawData: record,
      });
    });

    // 癲癇紀錄
    seizureRecords.forEach((record: any) => {
      records.push({
        id: record.id,
        type: "seizure",
        collectionName: "seizureRecords",
        clientId: record.clientId,
        clientName: record.clientName,
        date: record.occurredDate,
        summary: `發作時長: ${record.durationSeconds}秒, 意識: ${record.consciousnessState}`,
        recordedByName: record.recordedByName,
        isPinned: record.isPinned && record.pinnedBy?.includes(userId),
        pinnedBy: record.pinnedBy || [],
        rawData: record,
      });
    });

    // 生理期紀錄
    menstrualRecords.forEach((record: any) => {
      records.push({
        id: record.id,
        type: "menstrual",
        collectionName: "menstrualRecords",
        clientId: record.clientId,
        clientName: record.clientName,
        date: record.startDate,
        summary: `經血量: ${record.flowAmount}, 疼痛: ${record.painLevel}`,
        recordedByName: record.recordedByName,
        isPinned: record.isPinned && record.pinnedBy?.includes(userId),
        pinnedBy: record.pinnedBy || [],
        rawData: record,
      });
    });

    // 班務交接
    handoverRecords.forEach((record: any) => {
      const clientNames = record.targetClients?.map((c: any) => c.clientName).join(", ") || "無特定對象";
      records.push({
        id: record.id,
        type: "handover",
        collectionName: "handovers",
        clientId: record.targetClients?.[0]?.clientId || "",
        clientName: clientNames,
        date: record.shiftDate,
        summary: `${getShiftLabel(record.shiftType)} - ${record.content}`,
        recordedByName: record.createdByName,
        isPinned: record.isPinned && record.pinnedBy?.includes(userId),
        pinnedBy: record.pinnedBy || [],
        rawData: record,
      });
    });

    // 家屬聯絡
    familyContactRecords.forEach((record: any) => {
      records.push({
        id: record.id,
        type: "familyContact",
        collectionName: "familyContacts",
        clientId: record.clientId,
        clientName: record.clientName,
        date: record.contactDate,
        summary: `聯絡對象: ${record.contactTarget}, 方式: ${record.contactMethod} - ${record.content}`,
        recordedByName: record.recordedByName,
        isPinned: record.isPinned && record.pinnedBy?.includes(userId),
        pinnedBy: record.pinnedBy || [],
        rawData: record,
      });
    });

    // 按日期排序
    allRecords.value = records.sort((a, b) => {
      const dateA = toDate(a.date);
      const dateB = toDate(b.date);
      if (!dateA || !dateB) return 0;
      return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
    });

    // 更新釘選紀錄
    pinnedRecords.value = records.filter((r) => r.isPinned).slice(0, 5);

    // 更新釘選數量統計
    stats.value.pinnedRecords = records.filter((r) => r.isPinned).length;
  } catch (error) {
    console.error("載入記錄失敗:", error);
  } finally {
    allRecordsLoading.value = false;
  }
};

// 載入待確認交接
const loadPendingHandovers = async () => {
  handoversLoading.value = true;
  try {
    const handovers = await getMyPendingHandovers();
    pendingHandovers.value = handovers.slice(0, 5); // 只顯示最新 5 筆
  } catch (error) {
    console.error("載入待確認交接失敗:", error);
  } finally {
    handoversLoading.value = false;
  }
};

// 取得交接重要性樣式
const getPrioritySeverity = (priority: string) => {
  const map: Record<string, string> = {
    urgent: 'danger',
    high: 'warn',
    normal: 'success',
    low: 'secondary',
  };
  return map[priority] || 'secondary';
};

// 格式化交接日期
const formatHandoverDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return dayjs(d).format('MM/DD');
};

// 載入所有儀表板資料
const loadDashboardData = async () => {
  await Promise.all([loadStats(), loadAllRecords(), loadPendingHandovers()]);
};

// 格式化日期
const formatDate = (date: any) => {
  return formatDateTime(date);
};

// 取得紀錄類型標籤
const getRecordTypeLabel = (type: string) => {
  return RECORD_TYPE_META[type]?.label || type || "其他";
};

// 取得紀錄類型嚴重性
const getRecordTypeSeverity = (type: string) => {
  return RECORD_TYPE_META[type]?.severity || "secondary";
};

// 查看紀錄詳情
const viewRecordDetail = (record: any) => {
  selectedRecord.value = record;
  showDetailDialog.value = true;
};

// 切換釘選狀態
const handleTogglePin = async (record: any) => {
  try {
    // 根據記錄類型調用相應的 togglePin 函數
    switch (record.type) {
      case "care":
        await toggleCarePin(record.id, record.isPinned);
        break;
      case "emotion":
        await toggleEmotionPin(record.id, record.isPinned);
        break;
      case "bowel":
        await toggleBowelPin(record.id, record.isPinned);
        break;
      case "seizure":
        await toggleSeizurePin(record.id, record.isPinned);
        break;
      case "menstrual":
        await toggleMenstrualPin(record.id, record.isPinned);
        break;
      case "handover":
        await toggleHandoverPin(record.id, record.isPinned);
        break;
      case "familyContact":
        await toggleFamilyContactPin(record.id, record.isPinned);
        break;
      default:
        throw new Error("不支援的記錄類型");
    }

    // 重新載入記錄
    await loadAllRecords();
  } catch (error) {
    console.error("釘選失敗:", error);
    alert("釘選操作失敗");
  }
};

// 分頁切換
const onPageChange = (event: any) => {
  currentPage.value = event.page;
};

// 匯出報表
const handleExport = () => {
  navigateTo("/records");
};

// 初始化並每秒更新時間
onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  loadDashboardData();
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
