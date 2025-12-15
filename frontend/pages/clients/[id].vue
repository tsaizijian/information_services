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
          label="匯出 Excel"
          icon="pi pi-file-excel"
          severity="success"
          outlined
          :disabled="!client"
          @click="exportToExcel"
        />
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

    <!-- 分頁標籤 -->
    <TabView class="custom-tabview">
      <TabPanel header="照護紀錄">
        <Card class="shadow-sm border-0">
          <template #content>
          <div
            v-if="recordsLoading"
            class="py-10 flex items-center justify-center text-gray-500"
          >
            <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
            讀取照護紀錄中...
          </div>
          <div v-else-if="recentRecords.length === 0" class="py-10 text-center">
            <div
              class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4"
            >
              <i class="pi pi-file-edit text-4xl text-gray-400"></i>
            </div>
            <p class="text-gray-600">目前尚無照護紀錄</p>
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
      </TabPanel>

      <TabPanel header="醫療照護">
        <div class="space-y-6">
          <!-- 排便紀錄 -->
          <Card class="shadow-sm border-0">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-clock text-orange-500 text-xl"></i>
                <span>排便紀錄</span>
              </div>
            </template>
            <template #content>
              <div v-if="medicalLoading" class="py-8 text-center text-gray-500">
                <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
                載入中...
              </div>
              <div v-else-if="bowelRecords.length === 0" class="py-8 text-center text-gray-500">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                尚無排便紀錄
              </div>
              <DataTable v-else :value="bowelRecords" paginator :rows="5" stripedRows class="p-datatable-sm">
                <Column field="recordDate" header="日期" sortable>
                  <template #body="slotProps">
                    {{ formatRecordDate(slotProps.data.recordDate) }}
                  </template>
                </Column>
                <Column field="time" header="時間"></Column>
                <Column field="consistency" header="性狀"></Column>
                <Column field="amount" header="量"></Column>
              </DataTable>
            </template>
          </Card>

          <!-- 情緒紀錄 -->
          <Card class="shadow-sm border-0">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-face-smile text-yellow-500 text-xl"></i>
                <span>情緒紀錄</span>
              </div>
            </template>
            <template #content>
              <div v-if="medicalLoading" class="py-8 text-center text-gray-500">
                <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
                載入中...
              </div>
              <div v-else-if="emotionRecords.length === 0" class="py-8 text-center text-gray-500">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                尚無情緒紀錄
              </div>
              <DataTable v-else :value="emotionRecords" paginator :rows="5" stripedRows class="p-datatable-sm">
                <Column field="recordDate" header="日期" sortable>
                  <template #body="slotProps">
                    {{ formatRecordDate(slotProps.data.recordDate) }}
                  </template>
                </Column>
                <Column field="emotionType" header="情緒類型"></Column>
                <Column field="triggerEvent" header="誘發事件"></Column>
                <Column field="response" header="處理方式"></Column>
              </DataTable>
            </template>
          </Card>

          <!-- 癲癇紀錄 -->
          <Card class="shadow-sm border-0">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-bolt text-red-500 text-xl"></i>
                <span>癲癇紀錄</span>
              </div>
            </template>
            <template #content>
              <div v-if="medicalLoading" class="py-8 text-center text-gray-500">
                <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
                載入中...
              </div>
              <div v-else-if="seizureRecords.length === 0" class="py-8 text-center text-gray-500">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                尚無癲癇紀錄
              </div>
              <DataTable v-else :value="seizureRecords" paginator :rows="5" stripedRows class="p-datatable-sm">
                <Column field="recordDate" header="日期" sortable>
                  <template #body="slotProps">
                    {{ formatRecordDate(slotProps.data.recordDate) }}
                  </template>
                </Column>
                <Column field="startTime" header="開始時間"></Column>
                <Column field="duration" header="持續時間"></Column>
                <Column field="seizureType" header="類型"></Column>
              </DataTable>
            </template>
          </Card>

          <!-- 生理期紀錄 -->
          <Card class="shadow-sm border-0" v-if="client?.gender === 'female'">
            <template #title>
              <div class="flex items-center gap-3">
                <i class="pi pi-calendar text-pink-500 text-xl"></i>
                <span>生理期紀錄</span>
              </div>
            </template>
            <template #content>
              <div v-if="medicalLoading" class="py-8 text-center text-gray-500">
                <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
                載入中...
              </div>
              <div v-else-if="menstrualRecords.length === 0" class="py-8 text-center text-gray-500">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                尚無生理期紀錄
              </div>
              <DataTable v-else :value="menstrualRecords" paginator :rows="5" stripedRows class="p-datatable-sm">
                <Column field="startDate" header="開始日期" sortable>
                  <template #body="slotProps">
                    {{ formatDate(slotProps.data.startDate) }}
                  </template>
                </Column>
                <Column field="endDate" header="結束日期">
                  <template #body="slotProps">
                    {{ formatDate(slotProps.data.endDate) }}
                  </template>
                </Column>
                <Column field="flow" header="經血量"></Column>
                <Column field="painLevel" header="疼痛程度"></Column>
              </DataTable>
            </template>
          </Card>
        </div>
      </TabPanel>

      <TabPanel header="家屬聯絡">
        <Card class="shadow-sm border-0">
          <template #content>
            <div v-if="contactsLoading" class="py-8 text-center text-gray-500">
              <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
              載入中...
            </div>
            <div v-else-if="familyContacts.length === 0" class="py-10 text-center text-gray-500">
              <i class="pi pi-phone text-4xl mb-2 block"></i>
              尚無家屬聯絡紀錄
            </div>
            <DataTable v-else :value="familyContacts" paginator :rows="10" stripedRows class="p-datatable-sm">
              <Column field="contactDate" header="日期" sortable>
                <template #body="slotProps">
                  {{ formatRecordDate(slotProps.data.contactDate) }}
                </template>
              </Column>
              <Column field="contactTarget" header="聯絡對象"></Column>
              <Column field="contactMethod" header="方式">
                <template #body="slotProps">
                  <Tag :value="slotProps.data.contactMethod" />
                </template>
              </Column>
              <Column field="content" header="內容摘要">
                <template #body="slotProps">
                  <div class="truncate max-w-md" :title="slotProps.data.content">
                    {{ slotProps.data.content }}
                  </div>
                </template>
              </Column>
              <Column field="recordedByName" header="記錄者"></Column>
            </DataTable>
          </template>
        </Card>
      </TabPanel>

      <TabPanel header="班務交接">
        <Card class="shadow-sm border-0">
          <template #content>
            <div v-if="handoversLoading" class="py-8 text-center text-gray-500">
              <i class="pi pi-spin pi-spinner text-lg mr-2"></i>
              載入中...
            </div>
            <div v-else-if="handovers.length === 0" class="py-10 text-center text-gray-500">
              <i class="pi pi-sync text-4xl mb-2 block"></i>
              尚無交接紀錄
            </div>
            <div v-else class="space-y-4">
              <div v-for="handover in handovers" :key="handover.id" class="border rounded-lg p-4">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <Tag :value="handover.shiftType" severity="info" class="mb-2" />
                    <p class="text-sm text-gray-500">{{ formatDate(handover.handoverDate) }}</p>
                  </div>
                  <Tag v-if="handover.isConfirmed" value="已確認" severity="success" />
                </div>
                <div class="space-y-2">
                  <div>
                    <span class="text-sm font-medium text-gray-600">交班內容：</span>
                    <p class="text-gray-800 mt-1">{{ handover.content }}</p>
                  </div>
                  <div class="flex gap-4 text-sm text-gray-500">
                    <span><i class="pi pi-user mr-1"></i>{{ handover.handoverByName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <TabPanel header="生命徵象">
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
      </TabPanel>
    </TabView>
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
import * as XLSX from "xlsx";
import dayjs from "dayjs";

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
const { getVitalSignsTrend } = useVitalSigns();
const { getBowelRecords } = useBowelRecords();
const { getEmotionRecords } = useEmotionRecords();
const { getSeizureRecords } = useSeizureRecords();
const { getMenstrualRecords } = useMenstrualRecords();
const { getContacts } = useFamilyContacts();
const { getHandovers } = useHandover();
const { calculateAge, formatDate } = useUtils();
const toast = useToast();

const pageLoading = ref(true);
const recordsLoading = ref(false);
const vitalsLoading = ref(false);
const medicalLoading = ref(false);
const contactsLoading = ref(false);
const handoversLoading = ref(false);
const client = ref<any | null>(null);
const recentRecords = ref<any[]>([]);
const bowelRecords = ref<any[]>([]);
const emotionRecords = ref<any[]>([]);
const seizureRecords = ref<any[]>([]);
const menstrualRecords = ref<any[]>([]);
const familyContacts = ref<any[]>([]);
const handovers = ref<any[]>([]);
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
  daily_care: { label: "日常照護", severity: "info" },
  health_observation: { label: "健康觀察", severity: "warn" },
  activity: { label: "活動參與", severity: "success" },
  meal: { label: "飲食紀錄", severity: "secondary" },
  behavior: { label: "行為記錄", severity: "contrast" },
  special_event: { label: "特殊事件", severity: "danger" },
  other: { label: "其他", severity: "secondary" },
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
    const records = await getRecords({ clientId: id, limitCount: 6 });
    recentRecords.value = records || [];
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
    const trend = await getVitalSignsTrend(id, 12);
    vitalTrend.value = trend;
  } catch (error) {
    console.error("Failed to load vital signs trend:", error);
    vitalTrend.value = { labels: [], weight: [], pulse: [], bloodOxygen: [] };
  } finally {
    vitalsLoading.value = false;
  }
};

const loadMedicalRecords = async (id: string) => {
  if (!id) return;
  medicalLoading.value = true;
  try {
    const [bowel, emotion, seizure, menstrual] = await Promise.all([
      getBowelRecords({ clientId: id, limitCount: 10 }),
      getEmotionRecords({ clientId: id, limitCount: 10 }),
      getSeizureRecords({ clientId: id, limitCount: 10 }),
      getMenstrualRecords({ clientId: id, limitCount: 10 }),
    ]);
    bowelRecords.value = bowel || [];
    emotionRecords.value = emotion || [];
    seizureRecords.value = seizure || [];
    menstrualRecords.value = menstrual || [];
  } catch (error) {
    console.error("Failed to load medical records:", error);
  } finally {
    medicalLoading.value = false;
  }
};

const loadFamilyContacts = async (id: string) => {
  if (!id) return;
  contactsLoading.value = true;
  try {
    const contacts = await getContacts({ clientId: id });
    familyContacts.value = contacts || [];
  } catch (error) {
    console.error("Failed to load family contacts:", error);
    familyContacts.value = [];
  } finally {
    contactsLoading.value = false;
  }
};

const loadHandovers = async (id: string) => {
  if (!id) return;
  handoversLoading.value = true;
  try {
    const data = await getHandovers({ clientId: id, limitCount: 10 });
    handovers.value = data || [];
  } catch (error) {
    console.error("Failed to load handovers:", error);
    handovers.value = [];
  } finally {
    handoversLoading.value = false;
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
    await Promise.all([
      loadRecentRecords(value),
      loadVitalTrend(value),
      loadMedicalRecords(value),
      loadFamilyContacts(value),
      loadHandovers(value),
    ]);
  },
  { immediate: true }
);

const exportToExcel = () => {
  if (!client.value) return;

  // 準備照護紀錄資料
  const careRecordsData = recentRecords.value.map(record => ({
    "日期": formatRecordDate(record.recordDate),
    "服務對象": client.value.name,
    "記錄類型": getRecordTypeLabel(record.recordType),
    "內容": record.content || "-",
    "紀錄者": record.recordedByName || "未標示",
    "備註": record.notes || "-"
  }));

  // 準備家屬聯絡資料
  const contactsData = familyContacts.value.map(contact => ({
    "日期": formatRecordDate(contact.contactDate),
    "服務對象": client.value.name,
    "聯絡對象": contact.contactTarget,
    "聯絡方式": contact.contactMethod,
    "內容": contact.content,
    "紀錄者": contact.recordedByName || "未標示"
  }));

  // 準備班務交接資料
  const handoversData = handovers.value.map(handover => ({
    "日期": formatDate(handover.handoverDate),
    "服務對象": client.value.name,
    "班別": handover.shiftType,
    "內容": handover.content,
    "紀錄者": handover.handoverByName,
    "確認狀態": handover.isConfirmed ? "已確認" : "未確認"
  }));

  // 準備醫療照護資料
  const bowelData = bowelRecords.value.map(record => ({
    "日期": formatRecordDate(record.recordDate),
    "服務對象": client.value.name,
    "類型": "排便紀錄",
    "時間": record.time,
    "性狀": record.consistency,
    "量": record.amount,
    "紀錄者": record.recordedByName || "未標示"
  }));

  const emotionData = emotionRecords.value.map(record => ({
    "日期": formatRecordDate(record.recordDate),
    "服務對象": client.value.name,
    "類型": "情緒紀錄",
    "情緒類型": record.emotionType,
    "誘發事件": record.triggerEvent,
    "處理方式": record.response,
    "紀錄者": record.recordedByName || "未標示"
  }));

  const seizureData = seizureRecords.value.map(record => ({
    "日期": formatRecordDate(record.recordDate),
    "服務對象": client.value.name,
    "類型": "癲癇紀錄",
    "開始時間": record.startTime,
    "持續時間": record.duration,
    "癲癇類型": record.seizureType,
    "紀錄者": record.recordedByName || "未標示"
  }));

  const menstrualData = menstrualRecords.value.map(record => ({
    "開始日期": formatDate(record.startDate),
    "結束日期": formatDate(record.endDate),
    "服務對象": client.value.name,
    "類型": "生理期紀錄",
    "經血量": record.flow,
    "疼痛程度": record.painLevel,
    "紀錄者": record.recordedByName || "未標示"
  }));

  // 建立工作簿
  const wb = XLSX.utils.book_new();

  // 添加各個工作表
  if (careRecordsData.length > 0) {
    const ws1 = XLSX.utils.json_to_sheet(careRecordsData);
    XLSX.utils.book_append_sheet(wb, ws1, "照護紀錄");
  }

  if (contactsData.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(contactsData);
    XLSX.utils.book_append_sheet(wb, ws2, "家屬聯絡");
  }

  if (handoversData.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(handoversData);
    XLSX.utils.book_append_sheet(wb, ws3, "班務交接");
  }

  if (bowelData.length > 0) {
    const ws4 = XLSX.utils.json_to_sheet(bowelData);
    XLSX.utils.book_append_sheet(wb, ws4, "排便紀錄");
  }

  if (emotionData.length > 0) {
    const ws5 = XLSX.utils.json_to_sheet(emotionData);
    XLSX.utils.book_append_sheet(wb, ws5, "情緒紀錄");
  }

  if (seizureData.length > 0) {
    const ws6 = XLSX.utils.json_to_sheet(seizureData);
    XLSX.utils.book_append_sheet(wb, ws6, "癲癇紀錄");
  }

  if (menstrualData.length > 0) {
    const ws7 = XLSX.utils.json_to_sheet(menstrualData);
    XLSX.utils.book_append_sheet(wb, ws7, "生理期紀錄");
  }

  // 匯出檔案
  const fileName = `${client.value.name}_個案資料_${dayjs().format("YYYYMMDD")}.xlsx`;
  XLSX.writeFile(wb, fileName);

  toast.add({
    severity: "success",
    summary: "匯出成功",
    detail: `已匯出 ${client.value.name} 的完整資料`,
    life: 3000,
  });
};
</script>
