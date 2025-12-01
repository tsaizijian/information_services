<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex items-start gap-4">
        <div
          class="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 text-2xl"
        >
          <i class="pi pi-user"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500">個案詳情</p>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ client?.name || "載入中..." }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            深入了解夥伴的照護歷程與健康資訊
          </p>
        </div>
      </div>
      <div class="flex gap-3">
        <Button
          label="返回列表"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="goBack"
        />
        <Button
          label="編輯個案"
          icon="pi pi-pencil"
          :disabled="!client"
          @click="goEdit"
        />
      </div>
    </div>

    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center gap-3 py-2">
          <div
            class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600"
          >
            <i class="pi pi-id-card"></i>
          </div>
          <div>
            <span class="text-xl font-semibold text-gray-800">基本資訊</span>
            <p class="text-sm text-gray-500">
              個案基本資料與緊急聯絡資訊
            </p>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="pageLoading" class="py-12 flex items-center justify-center text-gray-500">
          <i class="pi pi-spin pi-spinner text-xl mr-2"></i>
          資料載入中...
        </div>
        <div v-else-if="errorMessage" class="py-12 text-center text-gray-500">
          <div
            class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4"
          >
            <i class="pi pi-info-circle text-4xl text-gray-400"></i>
          </div>
          <p class="text-lg font-semibold text-gray-700">{{ errorMessage }}</p>
          <p class="text-sm text-gray-500 mt-2">請返回列表確認個案狀態</p>
          <div class="mt-6">
            <Button
              label="返回個案列表"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              @click="goBack"
            />
          </div>
        </div>
        <div v-else-if="client" class="grid gap-8 md:grid-cols-2">
          <div class="space-y-6">
            <div class="space-y-2">
              <p class="text-sm text-gray-500">姓名</p>
              <p class="text-lg font-semibold text-gray-800">{{ client.name }}</p>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-gray-500">性別 / 年齡</p>
              <p class="text-lg font-semibold text-gray-800">
                {{ genderText }}<span v-if="ageText"> · {{ ageText }}</span>
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-gray-500">班級</p>
              <p class="text-lg font-semibold text-gray-800">
                {{ client.className || "未分配" }}
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-gray-500">入住日期</p>
              <p class="text-lg font-semibold text-gray-800">
                {{ admissionDateText }}
              </p>
            </div>
          </div>
          <div class="space-y-6">
            <div class="space-y-2">
              <p class="text-sm text-gray-500">個案編號</p>
              <p class="text-lg font-semibold text-gray-800">
                {{ client.clientNumber || "未設定" }}
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-gray-500">血型</p>
              <p class="text-lg font-semibold text-gray-800">
                {{ client.basicInfo?.bloodType || "未填寫" }}
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-gray-500">緊急聯絡人</p>
              <div class="space-y-1 text-gray-800">
                <p class="font-semibold">
                  {{ emergencyContact?.name || "未提供" }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ emergencyContact?.relationship || "—" }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ emergencyContact?.phone || "—" }}
                </p>
              </div>
            </div>
            <div class="space-y-2" v-if="client.latestPhysical">
              <p class="text-sm text-gray-500">最近身體測量</p>
              <p class="text-lg font-semibold text-gray-800">
                {{ latestPhysicalText }}
              </p>
              <p class="text-sm text-gray-500">
                {{ latestPhysicalMeasuredAt }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card class="shadow-sm border-0">
        <template #title>
          <div class="flex items-center gap-3 py-2">
            <div
              class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"
            >
              <i class="pi pi-history"></i>
            </div>
            <div>
              <span class="text-xl font-semibold text-gray-800">近期個案記錄</span>
              <p class="text-sm text-gray-500">最近 6 筆相關記錄（含照護、醫療、交接等）</p>
            </div>
          </div>
        </template>
        <template #content>
          <div
            v-if="recordsLoading"
            class="py-10 flex items-center justify-center text-gray-500"
          >
            <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
            讀取個案記錄中...
          </div>
          <div v-else-if="recentRecords.length === 0" class="py-10 text-center">
            <div
              class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4"
            >
              <i class="pi pi-file-edit text-4xl text-gray-400"></i>
            </div>
            <p class="text-gray-600">目前尚無相關記錄</p>
          </div>
          <div v-else class="space-y-5">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="relative rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 text-lg flex-shrink-0"
                >
                  <i class="pi pi-book"></i>
                </div>
                <div class="flex-1 space-y-2">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <Tag
                        :value="getRecordTypeLabel(record.recordType)"
                        :severity="getRecordTypeSeverity(record.recordType)"
                        rounded
                      />
                      <span class="text-sm text-gray-500">
                        {{ record.clientName || client?.name }}
                      </span>
                    </div>
                    <span class="text-sm text-gray-500">
                      {{ formatRecordDate(record.recordDate) }}
                    </span>
                  </div>
                  <p class="text-gray-700 whitespace-pre-line">
                    {{ record.content || "—" }}
                  </p>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>
                      <i class="pi pi-user-edit mr-1"></i>
                      {{ record.recordedByName || "未標示" }}
                    </span>
                    <span v-if="record.notes">
                      <i class="pi pi-comment mr-1"></i>
                      {{ record.notes }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm border-0">
        <template #title>
          <div class="flex items-center gap-3 py-2">
            <div
              class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600"
            >
              <i class="pi pi-chart-line"></i>
            </div>
            <div>
              <span class="text-xl font-semibold text-gray-800">生命徵象趨勢</span>
              <p class="text-sm text-gray-500">最近年度的月度紀錄</p>
            </div>
          </div>
        </template>
        <template #content>
          <div
            v-if="vitalsLoading"
            class="py-10 flex items-center justify-center text-gray-500"
          >
            <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
            取得生命徵象資料中...
          </div>
          <div v-else-if="!hasVitalData" class="py-10 text-center text-gray-600">
            <div
              class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4"
            >
              <i class="pi pi-heart text-4xl text-gray-400"></i>
            </div>
            <p>尚無生命徵象紀錄</p>
            <p class="text-sm text-gray-500 mt-1">請完成測量後再回到此處查看</p>
          </div>
          <div v-else>
            <div class="h-72">
              <ClientOnly>
                <Line :data="vitalChartData" :options="vitalChartOptions" />
              </ClientOnly>
            </div>
            <p class="mt-4 text-xs text-gray-400">
              * 資料來源：每月生命徵象紀錄
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { useToast } from "primevue/usetoast";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const route = useRoute();
const clientId = computed(() => route.params.id as string);

const { getClient } = useClients();
const { getRecords } = useRecords();
const { getEmotionRecords } = useEmotionRecords();
const { getBowelRecords } = useBowelRecords();
const { getSeizureRecords } = useSeizureRecords();
const { getMenstrualRecords } = useMenstrualRecords();
const { getHandovers } = useHandover();
const { getContacts } = useFamilyContacts();
const { getVitalSignsTrend } = useVitalSigns();
const { calculateAge, formatDate } = useUtils();
const toast = useToast();

const pageLoading = ref(true);
const recordsLoading = ref(false);
const vitalsLoading = ref(false);
const client = ref<any | null>(null);
const recentRecords = ref<any[]>([]);
const vitalTrend = ref<{
  labels: string[];
  weight: Array<number | null>;
  pulse: Array<number | null>;
  bloodOxygen: Array<number | null>;
}>({
  labels: [],
  weight: [],
  pulse: [],
  bloodOxygen: [],
});
const errorMessage = ref("");

const GENDER_MAP: Record<string, string> = {
  male: "男",
  female: "女",
};

const RECORD_TYPE_META: Record<
  string,
  { label: string; severity: "success" | "info" | "warn" | "danger" | "secondary" | "contrast" }
> = {
  // 照護紀錄類型
  daily_care: { label: "日常照護", severity: "info" },
  health_observation: { label: "健康觀察", severity: "warn" },
  activity: { label: "活動參與", severity: "success" },
  meal: { label: "飲食紀錄", severity: "secondary" },
  behavior: { label: "行為記錄", severity: "contrast" },
  special_event: { label: "特殊事件", severity: "danger" },
  other: { label: "其他", severity: "secondary" },
  // 醫療照護類型
  emotion: { label: "情緒紀錄", severity: "warn" },
  bowel: { label: "解便紀錄", severity: "info" },
  seizure: { label: "癲癇紀錄", severity: "danger" },
  menstrual: { label: "生理期紀錄", severity: "secondary" },
  // 其他類型
  handover: { label: "班務交接", severity: "contrast" },
  familyContact: { label: "家屬聯絡", severity: "success" },
};

const goBack = () => navigateTo("/clients");

const goEdit = () => {
  if (!client.value) return;
  navigateTo({
    path: "/clients",
    query: { edit: client.value.id },
  });
};

const emergencyContact = computed(() => client.value?.basicInfo?.emergencyContact || null);

const genderText = computed(() => {
  if (!client.value?.gender) return "未填寫";
  return GENDER_MAP[client.value.gender] || client.value.gender;
});

const ageText = computed(() => {
  const age = calculateAge(client.value?.birthDate);
  return age ? `${age} 歲` : "";
});

const admissionDateText = computed(() => {
  const admissionDate =
    client.value?.admissionDate ||
    client.value?.basicInfo?.admissionDate;
  return formatDate(admissionDate) === "-" ? "未填寫" : formatDate(admissionDate);
});

const latestPhysicalText = computed(() => {
  const info = client.value?.latestPhysical;
  if (!info) return "";
  const height = info.height ? `${info.height} cm` : "—";
  const weight = info.weight ? `${info.weight} kg` : "—";
  const bmi = info.bmi ? `BMI ${info.bmi}` : "";
  return [height, weight, bmi].filter(Boolean).join(" / ");
});

const latestPhysicalMeasuredAt = computed(() => {
  const info = client.value?.latestPhysical;
  const date = info?.measuredDate;
  const formatted = formatDate(date);
  return formatted !== "-" ? `測量日期：${formatted}` : "";
});

const formatRecordDate = (value: any) => {
  const { formatDateTime } = useUtils();
  const formatted = formatDateTime(value);
  return formatted !== "-" ? formatted : "--";
};

const getRecordTypeLabel = (type: string) => {
  return RECORD_TYPE_META[type]?.label || type || "其他";
};

const getRecordTypeSeverity = (type: string) => {
  return RECORD_TYPE_META[type]?.severity || "secondary";
};

const hasVitalData = computed(() => {
  const datasets = [
    vitalTrend.value.weight,
    vitalTrend.value.pulse,
    vitalTrend.value.bloodOxygen,
  ];
  return datasets.some((set) => set.some((value) => value !== null && value !== undefined));
});

const vitalChartData = computed(() => ({
  labels: vitalTrend.value.labels,
  datasets: [
    {
      label: "體重 (kg)",
      data: vitalTrend.value.weight,
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.15)",
      tension: 0.4,
      fill: true,
      spanGaps: true,
    },
    {
      label: "心率 (bpm)",
      data: vitalTrend.value.pulse,
      borderColor: "#16a34a",
      backgroundColor: "rgba(22, 163, 74, 0.1)",
      tension: 0.4,
      fill: true,
      spanGaps: true,
    },
    {
      label: "血氧 (%)",
      data: vitalTrend.value.bloodOxygen,
      borderColor: "#f97316",
      backgroundColor: "rgba(249, 115, 22, 0.1)",
      tension: 0.4,
      fill: true,
      spanGaps: true,
    },
  ],
}));

const vitalChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: {
        color: "#6b7280",
        precision: 0,
      },
      grid: {
        color: "rgba(107, 114, 128, 0.1)",
      },
    },
    x: {
      ticks: {
        color: "#9ca3af",
      },
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: "#374151",
        usePointStyle: true,
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  interaction: {
    intersect: false,
    mode: "nearest" as const,
  },
};

const loadClientData = async (id: string) => {
  if (!id) return;
  pageLoading.value = true;
  errorMessage.value = "";

  try {
    const data = await getClient(id);
    if (!data) {
      errorMessage.value = "找不到對應的個案資料";
      client.value = null;
      return;
    }
    client.value = { ...data, id };
  } catch (error) {
    console.error("Failed to load client:", error);
    errorMessage.value = "載入個案資料時發生錯誤";
    client.value = null;
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法取得個案資料，請稍後再試",
      life: 4000,
    });
    return;
  } finally {
    pageLoading.value = false;
  }
};

const loadRecentRecords = async (id: string) => {
  if (!id) return;
  recordsLoading.value = true;
  try {
    // 並行獲取所有類型的記錄
    const [
      careRecords,
      emotionRecords,
      bowelRecords,
      seizureRecords,
      menstrualRecords,
      handoverRecords,
      familyContactRecords,
    ] = await Promise.all([
      getRecords({ clientId: id, limitCount: 50 }),
      getEmotionRecords({ clientId: id, limitCount: 50 }),
      getBowelRecords({ clientId: id, limitCount: 50 }),
      getSeizureRecords({ clientId: id, limitCount: 50 }),
      getMenstrualRecords({ clientId: id, limitCount: 50 }),
      getHandovers({ limitCount: 50 }), // handover 沒有 clientId 過濾，稍後在前端過濾
      getContacts({ clientId: id, limitCount: 50 }),
    ]);

    // 轉換並合併所有記錄
    const allRecords: any[] = [];

    // 照護紀錄
    if (careRecords) {
      careRecords.forEach((record: any) => {
        allRecords.push({
          id: record.id,
          type: "care",
          recordType: record.recordType,
          clientId: record.clientId,
          clientName: record.clientName,
          content: record.content,
          notes: record.notes,
          recordDate: record.recordDate,
          recordedByName: record.recordedByName,
          isPinned: record.isPinned,
        });
      });
    }

    // 情緒紀錄
    if (emotionRecords) {
      emotionRecords.forEach((record: any) => {
        const contentParts: string[] = [];
        if (record.emotionType) contentParts.push(`情緒：${record.emotionType}`);
        if (record.trigger) contentParts.push(`觸發因素：${record.trigger}`);
        if (record.durationMinutes) contentParts.push(`持續時間：${record.durationMinutes} 分鐘`);

        allRecords.push({
          id: record.id,
          type: "emotion",
          recordType: "emotion",
          clientId: record.clientId,
          clientName: record.clientName,
          content: contentParts.length > 0 ? contentParts.join("\n") : "無記錄內容",
          notes: record.notes,
          recordDate: record.occurredDate,
          recordedByName: record.recordedByName,
          isPinned: record.isPinned,
        });
      });
    }

    // 解便紀錄
    if (bowelRecords) {
      bowelRecords.forEach((record: any) => {
        const contentParts: string[] = [];
        if (record.bowelType) contentParts.push(`類型：${record.bowelType}`);
        if (record.shape) contentParts.push(`形狀：${record.shape}`);
        if (record.color) contentParts.push(`顏色：${record.color}`);

        allRecords.push({
          id: record.id,
          type: "bowel",
          recordType: "bowel",
          clientId: record.clientId,
          clientName: record.clientName,
          content: contentParts.length > 0 ? contentParts.join("\n") : "無記錄內容",
          notes: record.notes,
          recordDate: record.occurredDate,
          recordedByName: record.recordedByName,
          isPinned: record.isPinned,
        });
      });
    }

    // 癲癇紀錄
    if (seizureRecords) {
      seizureRecords.forEach((record: any) => {
        const contentParts: string[] = [];
        if (record.seizureType) contentParts.push(`發作類型：${record.seizureType}`);
        if (record.durationMinutes) contentParts.push(`持續時間：${record.durationMinutes} 分鐘`);
        if (record.severity) contentParts.push(`嚴重程度：${record.severity}`);

        allRecords.push({
          id: record.id,
          type: "seizure",
          recordType: "seizure",
          clientId: record.clientId,
          clientName: record.clientName,
          content: contentParts.length > 0 ? contentParts.join("\n") : "無記錄內容",
          notes: record.notes,
          recordDate: record.occurredDate,
          recordedByName: record.recordedByName,
          isPinned: record.isPinned,
        });
      });
    }

    // 生理期紀錄
    if (menstrualRecords) {
      menstrualRecords.forEach((record: any) => {
        const contentParts: string[] = [];
        if (record.startDate) contentParts.push(`開始日期：${formatDate(record.startDate)}`);
        if (record.endDate) {
          contentParts.push(`結束日期：${formatDate(record.endDate)}`);
        } else {
          contentParts.push(`狀態：進行中`);
        }
        if (record.flow) contentParts.push(`流量：${record.flow}`);

        allRecords.push({
          id: record.id,
          type: "menstrual",
          recordType: "menstrual",
          clientId: record.clientId,
          clientName: record.clientName,
          content: contentParts.length > 0 ? contentParts.join("\n") : "無記錄內容",
          notes: record.notes,
          recordDate: record.startDate,
          recordedByName: record.recordedByName,
          isPinned: record.isPinned,
        });
      });
    }

    // 班務交接 - 過濾包含此服務對象的記錄
    if (handoverRecords) {
      handoverRecords.forEach((record: any) => {
        // 檢查此交接記錄的服務對象是否包含當前個案
        const isRelatedToClient = record.targetClients?.some(
          (target: any) => target.clientId === id
        );

        if (isRelatedToClient) {
          allRecords.push({
            id: record.id,
            type: "handover",
            recordType: "handover",
            clientId: id,
            clientName: client.value?.name,
            content: record.content || "",
            notes: `班次：${record.shiftType || "未記錄"}`,
            recordDate: record.shiftDate,
            recordedByName: record.createdByName,
            isPinned: record.isPinned,
          });
        }
      });
    }

    // 家屬聯絡
    if (familyContactRecords) {
      familyContactRecords.forEach((record: any) => {
        const contentParts: string[] = [];
        if (record.contactTarget) contentParts.push(`聯絡對象：${record.contactTarget}`);
        if (record.contactMethod) contentParts.push(`聯絡方式：${record.contactMethod}`);
        if (record.content) contentParts.push(`內容：${record.content}`);

        allRecords.push({
          id: record.id,
          type: "familyContact",
          recordType: "familyContact",
          clientId: record.clientId,
          clientName: record.clientName,
          content: contentParts.length > 0 ? contentParts.join("\n") : "無記錄內容",
          notes: record.notes,
          recordDate: record.contactDate,
          recordedByName: record.recordedByName,
          isPinned: record.isPinned,
        });
      });
    }

    // 按日期降序排序並取前 6 筆
    allRecords.sort((a, b) => {
      const dateA = a.recordDate?.toDate?.() || new Date(a.recordDate || 0);
      const dateB = b.recordDate?.toDate?.() || new Date(b.recordDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    recentRecords.value = allRecords.slice(0, 6);
  } catch (error) {
    console.error("Failed to load client records:", error);
    recentRecords.value = [];
  } finally {
    recordsLoading.value = false;
  }
};

const loadVitalTrend = async (id: string) => {
  if (!id) return;
  vitalsLoading.value = true;
  try {
    const trend = await getVitalSignsTrend(id);
    vitalTrend.value = trend;
  } catch (error) {
    console.error("Failed to load vital signs trend:", error);
    vitalTrend.value = { labels: [], weight: [], pulse: [], bloodOxygen: [] };
  } finally {
    vitalsLoading.value = false;
  }
};

watch(
  clientId,
  async (value) => {
    if (!value) return;
    await loadClientData(value);
    if (!client.value) {
      recentRecords.value = [];
      vitalTrend.value = { labels: [], weight: [], pulse: [], bloodOxygen: [] };
      recordsLoading.value = false;
      vitalsLoading.value = false;
      return;
    }
    await Promise.all([loadRecentRecords(value), loadVitalTrend(value)]);
  },
  { immediate: true }
);
</script>
