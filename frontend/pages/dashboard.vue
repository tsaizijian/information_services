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
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            label="新增照護紀錄"
            icon="pi pi-plus"
            severity="primary"
            @click="navigateTo('/records?action=new')"
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
            @click="viewRecord(record)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Tag
                    :value="getRecordTypeLabel(record.recordType)"
                    :severity="getRecordTypeSeverity(record.recordType)"
                    rounded
                  />
                  <span class="text-sm text-gray-600">
                    {{ record.clientName }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ formatDate(record.recordDate) }}
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

    <!-- 最近紀錄與班級統計 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近照護紀錄 -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <i class="pi pi-clock mr-2 text-primary"></i>
              最近照護紀錄
            </div>
            <Button
              label="查看全部"
              icon="pi pi-arrow-right"
              text
              @click="navigateTo('/records')"
            />
          </div>
        </template>
        <template #content>
          <div v-if="recordsLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-3xl text-gray-400"></i>
          </div>
          <div v-else-if="recentRecords.length > 0" class="space-y-3">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              @click="viewRecord(record)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Tag
                      :value="getRecordTypeLabel(record.recordType)"
                      :severity="getRecordTypeSeverity(record.recordType)"
                      rounded
                    />
                    <span class="text-sm text-gray-600">
                      {{ record.clientName }}
                    </span>
                  </div>
                  <p class="text-gray-700 line-clamp-2">{{ record.content }}</p>
                  <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>
                      <i class="pi pi-user mr-1"></i>
                      {{ record.recordedByName }}
                    </span>
                    <span>
                      <i class="pi pi-calendar mr-1"></i>
                      {{ formatDate(record.recordDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-surface-500">
            <i class="pi pi-inbox text-4xl mb-3 block"></i>
            <p>目前沒有照護紀錄</p>
          </div>
        </template>
      </Card>

      <!-- 班級統計圖表 -->
      <Card>
        <template #title>
          <div class="flex items-center">
            <i class="pi pi-chart-bar mr-2 text-primary"></i>
            班級個案統計
          </div>
        </template>
        <template #content>
          <div v-if="classStatsLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-3xl text-gray-400"></i>
          </div>
          <div v-else-if="hasClassStats" class="h-64">
            <ClientOnly>
              <Bar :data="classChartData" :options="classChartOptions" />
            </ClientOnly>
          </div>
          <div v-else class="text-center py-8 text-surface-500">
            <i class="pi pi-chart-bar text-4xl mb-3 block"></i>
            <p>暫無班級統計資料</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

dayjs.locale("zh-tw");

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const { userProfile } = useAuth();
const { toDate, formatDateTime } = useUtils();
const { getClients } = useClients();
const { getRecords, getPinnedRecords } = useRecords();
const { getClasses } = useClasses();

// 載入狀態
const statsLoading = ref(true);
const recordsLoading = ref(true);
const classStatsLoading = ref(true);

// 資料狀態
const stats = ref({
  totalClients: 0,
  todayRecords: 0,
  weeklyNewClients: 0,
  pinnedRecords: 0,
});
const recentRecords = ref<any[]>([]);
const pinnedRecords = ref<any[]>([]);
const classStats = ref<{ className: string; clientCount: number }[]>([]);

// 當前日期時間
const currentDate = ref("");
const currentTime = ref("");

const updateDateTime = () => {
  currentDate.value = dayjs().format("YYYY年MM月DD日 dddd");
  currentTime.value = dayjs().format("HH:mm:ss");
};

// 紀錄類型映射
const RECORD_TYPE_META: Record<
  string,
  { label: string; severity: "success" | "info" | "warn" | "danger" | "secondary" | "contrast" }
> = {
  daily_care: { label: "日常照護", severity: "info" },
  health_observation: { label: "健康觀察", severity: "warn" },
  activity: { label: "活動參與", severity: "success" },
  meal: { label: "飲食紀錄", severity: "secondary" },
  behavior: { label: "行為記錄", severity: "contrast" },
  special_event: { label: "特殊事件", severity: "danger" },
  other: { label: "其他", severity: "secondary" },
};

// 計算屬性
const hasClassStats = computed(() => classStats.value.length > 0);

const classChartData = computed(() => ({
  labels: classStats.value.map((c) => c.className),
  datasets: [
    {
      label: "個案數量",
      data: classStats.value.map((c) => c.clientCount),
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        "rgba(139, 92, 246, 0.8)",
        "rgba(236, 72, 153, 0.8)",
      ],
      borderColor: [
        "rgb(59, 130, 246)",
        "rgb(16, 185, 129)",
        "rgb(245, 158, 11)",
        "rgb(239, 68, 68)",
        "rgb(139, 92, 246)",
        "rgb(236, 72, 153)",
      ],
      borderWidth: 2,
    },
  ],
}));

const classChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `個案數: ${context.parsed.y} 位`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: "#6b7280",
      },
      grid: {
        color: "rgba(107, 114, 128, 0.1)",
      },
    },
    x: {
      ticks: {
        color: "#374151",
      },
      grid: {
        display: false,
      },
    },
  },
};

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

    // 載入釘選紀錄數量
    const pinned = await getPinnedRecords(100);
    stats.value.pinnedRecords = pinned.length;
  } catch (error) {
    console.error("載入統計資料失敗:", error);
  } finally {
    statsLoading.value = false;
  }
};

// 載入最近紀錄
const loadRecentRecords = async () => {
  recordsLoading.value = true;
  try {
    const records = await getRecords({ limitCount: 10 });
    recentRecords.value = records;

    // 載入釘選紀錄
    const pinned = await getPinnedRecords(5);
    pinnedRecords.value = pinned;
  } catch (error) {
    console.error("載入紀錄失敗:", error);
  } finally {
    recordsLoading.value = false;
  }
};

// 載入班級統計
const loadClassStats = async () => {
  classStatsLoading.value = true;
  try {
    const [clients, classes] = await Promise.all([
      getClients(),
      getClasses(),
    ]);

    // 計算每個班級的個案數量
    const classCountMap = new Map<string, { className: string; count: number }>();

    classes.forEach((cls: any) => {
      classCountMap.set(cls.id, {
        className: cls.className || "未命名班級",
        count: 0,
      });
    });

    clients.forEach((client: any) => {
      if (client.classId && classCountMap.has(client.classId)) {
        const classData = classCountMap.get(client.classId)!;
        classData.count++;
      }
    });

    classStats.value = Array.from(classCountMap.values())
      .map((data) => ({
        className: data.className,
        clientCount: data.count,
      }))
      .filter((data) => data.clientCount > 0)
      .sort((a, b) => b.clientCount - a.clientCount);
  } catch (error) {
    console.error("載入班級統計失敗:", error);
  } finally {
    classStatsLoading.value = false;
  }
};

// 載入所有儀表板資料
const loadDashboardData = async () => {
  await Promise.all([loadStats(), loadRecentRecords(), loadClassStats()]);
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

// 查看紀錄
const viewRecord = (record: any) => {
  navigateTo(`/clients/${record.clientId}`);
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
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
