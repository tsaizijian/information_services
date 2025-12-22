<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
        <i class="pi pi-heart-fill text-red-500"></i>
        醫療照護紀錄
      </h1>
      <p class="text-gray-500 mt-2">記錄個案的情緒、排便、癲癇發作及生理期等重要健康指標</p>
    </div>

    <!-- 功能選擇卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 情緒異常紀錄 -->
      <Card
        class="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-blue-500"
        @click="navigateTo('/medical-care/emotion')"
      >
        <template #content>
          <div class="text-center py-4">
            <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-face-smile text-3xl text-blue-600"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">情緒異常紀錄</h3>
            <p class="text-sm text-gray-500 mb-4">追蹤情緒與行為異常事件</p>
            <div class="flex items-center justify-center gap-2 text-blue-600">
              <span class="text-sm font-medium">進入管理</span>
              <i class="pi pi-arrow-right"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 解便紀錄 -->
      <Card
        class="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-orange-500"
        @click="navigateTo('/medical-care/bowel')"
      >
        <template #content>
          <div class="text-center py-4">
            <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-clock text-3xl text-orange-600"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">解便紀錄</h3>
            <p class="text-sm text-gray-500 mb-4">追蹤排便狀況與腸胃健康</p>
            <div class="flex items-center justify-center gap-2 text-orange-600">
              <span class="text-sm font-medium">進入管理</span>
              <i class="pi pi-arrow-right"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 癲癇發作紀錄 -->
      <Card
        class="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-purple-500"
        @click="navigateTo('/medical-care/seizure')"
      >
        <template #content>
          <div class="text-center py-4">
            <div class="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-bolt text-3xl text-purple-600"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">癲癇發作紀錄</h3>
            <p class="text-sm text-gray-500 mb-4">記錄癲癇發作情況與處置</p>
            <div class="flex items-center justify-center gap-2 text-purple-600">
              <span class="text-sm font-medium">進入管理</span>
              <i class="pi pi-arrow-right"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- 生理期紀錄 -->
      <Card
        class="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-pink-500"
        @click="navigateTo('/medical-care/menstrual')"
      >
        <template #content>
          <div class="text-center py-4">
            <div class="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-heart text-3xl text-pink-600"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">生理期紀錄</h3>
            <p class="text-sm text-gray-500 mb-4">追蹤女性個案生理週期</p>
            <div class="flex items-center justify-center gap-2 text-pink-600">
              <span class="text-sm font-medium">進入管理</span>
              <i class="pi pi-arrow-right"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 最近紀錄摘要 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近情緒紀錄 -->
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-face-smile text-blue-600"></i>
              <span>最近情緒紀錄</span>
            </div>
            <Button
              label="查看全部"
              icon="pi pi-arrow-right"
              text
              size="small"
              @click="navigateTo('/medical-care/emotion')"
            />
          </div>
        </template>
        <template #content>
          <div v-if="loading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-gray-400"></i>
          </div>
          <div v-else-if="recentEmotionRecords.length > 0" class="space-y-3">
            <div
              v-for="record in recentEmotionRecords"
              :key="record.id"
              class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-800">{{ record.clientName }}</span>
                    <span class="text-xs text-gray-400">{{ formatDate(record.occurredDate) }}</span>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <Tag
                      v-for="symptom in (record.symptoms || []).slice(0, 3)"
                      :key="symptom"
                      :value="getSymptomLabel(symptom)"
                      severity="info"
                      class="text-xs"
                    />
                    <Tag
                      v-if="(record.symptoms || []).length > 3"
                      :value="'+' + ((record.symptoms || []).length - 3)"
                      severity="secondary"
                      class="text-xs"
                    />
                  </div>
                </div>
                <Tag
                  v-if="record.needEmergency"
                  value="急診"
                  severity="danger"
                  class="text-xs"
                />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <i class="pi pi-inbox text-3xl mb-2 block"></i>
            <p>目前沒有情緒紀錄</p>
          </div>
        </template>
      </Card>

      <!-- 統計摘要 -->
      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-bar text-green-600"></i>
            <span>本月統計</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-blue-600">{{ stats.emotionCount }}</p>
              <p class="text-sm text-gray-600">情緒事件</p>
            </div>
            <div class="bg-red-50 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-red-600">{{ stats.emergencyCount }}</p>
              <p class="text-sm text-gray-600">需急診處理</p>
            </div>
            <div class="bg-orange-50 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-orange-600">{{ stats.bowelCount }}</p>
              <p class="text-sm text-gray-600">解便紀錄</p>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 text-center">
              <p class="text-3xl font-bold text-purple-600">{{ stats.seizureCount }}</p>
              <p class="text-sm text-gray-600">癲癇發作</p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { useEmotionRecords } from '~/composables/useEmotionRecords';
import { useBowelRecords } from '~/composables/useBowelRecords';
import { useSeizureRecords } from '~/composables/useSeizureRecords';

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
});

const {
  getEmotionRecords,
  getSymptomLabel,
} = useEmotionRecords();

const { getBowelRecords } = useBowelRecords();
const { getSeizureRecords } = useSeizureRecords();

const loading = ref(false);
const recentEmotionRecords = ref<any[]>([]);
const stats = ref({
  emotionCount: 0,
  emergencyCount: 0,
  bowelCount: 0,
  seizureCount: 0,
});

const formatDate = (date: any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return dayjs(d).format('MM/DD HH:mm');
};

const loadData = async () => {
  loading.value = true;
  try {
    // 載入最近情緒紀錄
    const records = await getEmotionRecords({ limitCount: 5 });
    recentEmotionRecords.value = records;

    // 計算本月統計
    const monthStart = dayjs().startOf('month').toDate();

    const [monthEmotionRecords, monthBowelRecords, monthSeizureRecords] = await Promise.all([
      getEmotionRecords({ startDate: monthStart }),
      getBowelRecords({ startDate: monthStart }),
      getSeizureRecords({ startDate: monthStart }),
    ]);

    stats.value.emotionCount = monthEmotionRecords.length;
    stats.value.emergencyCount = monthEmotionRecords.filter(r => r.needEmergency).length;
    stats.value.bowelCount = monthBowelRecords.length;
    stats.value.seizureCount = monthSeizureRecords.length;
  } catch (error) {
    console.error('載入資料失敗:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
