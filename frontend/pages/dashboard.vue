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
                {{ stats.totalClients }}
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
                {{ stats.todayRecords }}
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
              <p class="text-surface-500 text-sm">釘選紀錄</p>
              <p class="text-3xl font-bold text-orange-600 mt-2">
                {{ stats.pinnedRecords }}
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center"
            >
              <i class="pi pi-bookmark text-3xl text-orange-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-surface-500 text-sm">班級數量</p>
              <p class="text-3xl font-bold text-purple-600 mt-2">
                {{ stats.totalClasses }}
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center"
            >
              <i class="pi pi-sitemap text-3xl text-purple-600"></i>
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
            @click="navigateTo('/records/new')"
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

    <!-- 最近紀錄 -->
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
        <DataTable
          :value="recentRecords"
          :loading="loading"
          stripedRows
          v-if="recentRecords.length > 0"
        >
          <Column field="recordDate" header="日期" style="width: 120px">
            <template #body="{ data }">
              {{ formatDate(data.recordDate) }}
            </template>
          </Column>
          <Column field="clientName" header="個案" style="width: 120px" />
          <Column field="category" header="類別" style="width: 120px">
            <template #body="{ data }">
              <Tag
                :value="data.category"
                :severity="getCategorySeverity(data.category)"
              />
            </template>
          </Column>
          <Column field="content" header="內容">
            <template #body="{ data }">
              <div class="line-clamp-2">{{ data.content }}</div>
            </template>
          </Column>
          <Column header="操作" style="width: 100px">
            <template #body="{ data }">
              <Button
                icon="pi pi-eye"
                text
                rounded
                severity="info"
                @click="viewRecord(data)"
              />
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-center py-8 text-surface-500">
          <i class="pi pi-inbox text-4xl mb-3 block"></i>
          <p>目前沒有照護紀錄</p>
        </div>
      </template>
    </Card>
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
const loading = ref(false);
const stats = ref({
  totalClients: 0,
  todayRecords: 0,
  pinnedRecords: 0,
  totalClasses: 0,
});
const recentRecords = ref<any[]>([]);

// 當前日期時間
const currentDate = ref("");
const currentTime = ref("");

const updateDateTime = () => {
  currentDate.value = dayjs().format("YYYY年MM月DD日 dddd");
  currentTime.value = dayjs().format("HH:mm:ss");
};

// 初始化並每秒更新時間
onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  loadDashboardData();
});

// 載入儀表板資料
const loadDashboardData = async () => {
  loading.value = true;
  try {
    // TODO: 從 Firestore 載入實際資料
    // 這裡先用假資料示範
    stats.value = {
      totalClients: 0,
      todayRecords: 0,
      pinnedRecords: 0,
      totalClasses: 0,
    };
    recentRecords.value = [];
  } catch (error) {
    console.error("載入資料失敗:", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: any) => {
  return dayjs(date).format("YYYY/MM/DD");
};

const getCategorySeverity = (category: string) => {
  const severityMap: Record<string, string> = {
    用餐: "success",
    如廁: "info",
    行為: "warning",
    健康: "danger",
    其他: "secondary",
  };
  return severityMap[category] || "secondary";
};

const viewRecord = (record: any) => {
  navigateTo(`/records/${record.id}`);
};

const handleExport = () => {
  // TODO: 實作匯出功能
  console.log("匯出報表");
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
