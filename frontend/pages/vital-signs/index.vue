<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <i class="pi pi-heart text-primary"></i>
          生命徵象管理
        </h1>
        <p class="text-gray-500 mt-1">
          追蹤並分析個案的血壓、心率、體溫與血氧，及時掌握健康趨勢。
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button
          label="警示閾值"
          icon="pi pi-sliders-h"
          severity="secondary"
          outlined
          @click="openThresholdDialog"
        />
        <Button
          label="匯出 PDF"
          icon="pi pi-file-pdf"
          severity="danger"
          outlined
          @click="exportPdf"
          :disabled="records.length === 0"
        />
        <Button
          label="匯出 Excel"
          icon="pi pi-file-excel"
          severity="success"
          outlined
          @click="exportExcel"
          :disabled="records.length === 0"
        />
        <Button
          label="新增測量"
          icon="pi pi-plus"
          class="shadow-md"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Filters & Summary -->
    <Card class="shadow-sm border-0">
      <template #content>
        <div class="grid gap-6 lg:grid-cols-5">
          <div class="lg:col-span-2 flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-user"></i>
              個案
            </label>
            <Select
              v-model="selectedClientId"
              :options="clientOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="選擇個案"
              class="w-full"
              filter
              showClear
            />
          </div>

          <div class="flex flex-col gap-2">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-calendar"></i>
              時間範圍
            </label>
            <Select
              v-model="selectedRange"
              :options="rangeOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2" v-if="selectedRange === 'custom'">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-calendar-plus"></i>
              開始日期
            </label>
            <DatePicker v-model="customStartDate" class="w-full" showIcon />
          </div>

          <div class="flex flex-col gap-2" v-if="selectedRange === 'custom'">
            <label
              class="text-sm font-medium text-gray-600 flex items-center gap-2"
            >
              <i class="pi pi-calendar-minus"></i>
              結束日期
            </label>
            <DatePicker v-model="customEndDate" class="w-full" showIcon />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-4 mt-8">
          <div
            class="rounded-xl border border-primary-100 bg-primary-50 px-4 py-5"
          >
            <p class="text-sm text-primary-600 font-medium">資料筆數</p>
            <p class="text-2xl font-bold text-primary-700 mt-2">
              {{ records.length }}
            </p>
          </div>
          <div class="rounded-xl border border-green-100 bg-green-50 px-4 py-5">
            <p class="text-sm text-green-600 font-medium">最近測量</p>
            <p class="text-base text-green-700 mt-2">
              {{ latestMeasurementText }}
            </p>
          </div>
          <div
            class="rounded-xl border border-orange-100 bg-orange-50 px-4 py-5"
          >
            <p class="text-sm text-orange-600 font-medium">異常提醒</p>
            <p class="text-2xl font-bold text-orange-700 mt-2">
              {{ abnormalCount }}
            </p>
          </div>
          <div class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-5">
            <p class="text-sm text-gray-600 font-medium">量測範圍</p>
            <p class="text-base text-gray-700 mt-2">
              {{ rangeSummary }}
            </p>
          </div>
        </div>
      </template>
    </Card>

    <!-- Trend Chart -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600"
            >
              <i class="pi pi-chart-line"></i>
            </div>
            <div>
              <span class="text-xl font-semibold text-gray-800"
                >生命徵象趨勢</span
              >
              <p class="text-sm text-gray-500">顯示所選範圍內的體徵變化</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <Tag value="收縮壓" severity="info" icon="pi pi-dot-fill" />
            <Tag value="舒張壓" severity="secondary" icon="pi pi-dot-fill" />
            <Tag value="心率" severity="success" icon="pi pi-dot-fill" />
            <Tag value="血氧" severity="warning" icon="pi pi-dot-fill" />
            <Tag value="體溫" severity="danger" icon="pi pi-dot-fill" />
          </div>
        </div>
      </template>
      <template #content>
        <div
          v-if="loadingRecords"
          class="py-16 flex items-center justify-center text-gray-500 gap-2"
        >
          <i class="pi pi-spin pi-spinner"></i>
          正在載入生命徵象資料...
        </div>
        <div
          v-else-if="records.length === 0"
          class="py-16 text-center text-gray-500"
        >
          <div
            class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4"
          >
            <i class="pi pi-heart text-4xl text-gray-400"></i>
          </div>
          <p>尚無資料可供顯示，請新增測量或調整範圍。</p>
        </div>
        <div v-else class="h-96">
          <ClientOnly>
            <Line :data="chartData" :options="chartOptions" />
          </ClientOnly>
        </div>
      </template>
    </Card>

    <!-- Records Table -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"
          >
            <i class="pi pi-table"></i>
          </div>
          <div>
            <span class="text-xl font-semibold text-gray-800"
              >測量紀錄列表</span
            >
            <p class="text-sm text-gray-500">
              依照測量時間排序，提供異常提醒。
            </p>
          </div>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="records"
          :loading="loadingRecords"
          :rows="15"
          paginator
          :rowsPerPageOptions="[15, 30, 50]"
          responsiveLayout="scroll"
          class="rounded-lg"
          sortField="measuredAt"
          :sortOrder="-1"
        >
          <Column
            field="measuredAt"
            header="日期"
            sortable
            style="min-width: 140px"
          >
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-blue-500 text-sm"></i>
                <span class="font-medium">
                  {{ dayjs(data.measuredAt).format("YYYY/MM/DD HH:mm") }}
                </span>
              </div>
            </template>
          </Column>
          <Column
            field="bloodPressure"
            header="血壓 (mmHg)"
            style="min-width: 140px"
          >
            <template #body="{ data }">
              <div :class="getCellClass(data, 'bloodPressure')">
                {{ formatBloodPressure(data) }}
              </div>
            </template>
          </Column>
          <Column
            field="heartRate"
            header="心率 (bpm)"
            style="min-width: 110px"
          >
            <template #body="{ data }">
              <div :class="getCellClass(data, 'heartRate')">
                {{ formatValue(data.heartRate, " bpm") }}
              </div>
            </template>
          </Column>
          <Column
            field="temperature"
            header="體溫 (°C)"
            style="min-width: 110px"
          >
            <template #body="{ data }">
              <div :class="getCellClass(data, 'temperature')">
                {{ formatValue(data.temperature, " °C", 1) }}
              </div>
            </template>
          </Column>
          <Column
            field="bloodOxygen"
            header="血氧 (%)"
            style="min-width: 110px"
          >
            <template #body="{ data }">
              <div :class="getCellClass(data, 'bloodOxygen')">
                {{ formatValue(data.bloodOxygen, " %") }}
              </div>
            </template>
          </Column>
          <Column
            field="bloodSugar"
            header="血糖 (mg/dL)"
            style="min-width: 140px"
          >
            <template #body="{ data }">
              <div :class="getCellClass(data, 'bloodSugar')">
                {{ formatValue(data.bloodSugar, " mg/dL") }}
              </div>
            </template>
          </Column>
          <Column header="紀錄者" style="min-width: 150px">
            <template #body="{ data }">
              <div class="flex items-center gap-2 text-gray-600">
                <i class="pi pi-user-edit text-sm"></i>
                <span>{{ data.recordedByName || "未標示" }}</span>
              </div>
            </template>
          </Column>
          <Column header="備註" style="min-width: 240px">
            <template #body="{ data }">
              <div class="text-sm text-gray-600 whitespace-pre-line">
                {{ data.notes || "—" }}
              </div>
            </template>
          </Column>
          <Column header="提醒" style="min-width: 160px">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-2">
                <Tag
                  v-for="metric in abnormalMetrics(data)"
                  :key="metric"
                  value="異常"
                  severity="danger"
                  icon="pi pi-exclamation-triangle"
                  rounded
                >
                  <span class="ml-1">{{ metricLabels[metric] || metric }}</span>
                </Tag>
                <Tag
                  v-if="abnormalMetrics(data).length === 0"
                  value="正常"
                  severity="success"
                  icon="pi pi-check"
                  rounded
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create Dialog -->
    <Dialog
      v-model:visible="showDialog"
      header="新增生命徵象紀錄"
      :modal="true"
      :style="{ width: '600px' }"
      :draggable="false"
    >
      <div class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">
              個案 <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="form.clientId"
              :options="clientOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="選擇個案"
              class="w-full"
              filter
              :invalid="!!formErrors.clientId"
            />
            <small v-if="formErrors.clientId" class="text-red-500">
              {{ formErrors.clientId }}
            </small>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-600">
              測量時間 <span class="text-red-500">*</span>
            </label>
            <DatePicker
              v-model="form.measuredAt"
              showTime
              hourFormat="24"
              class="w-full"
              :invalid="!!formErrors.measuredAt"
            />
            <small v-if="formErrors.measuredAt" class="text-red-500">
              {{ formErrors.measuredAt }}
            </small>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600"
              >收縮壓 (mmHg)</label
            >
            <InputText
              v-model="form.systolic"
              type="number"
              placeholder="例如 120"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600"
              >舒張壓 (mmHg)</label
            >
            <InputText
              v-model="form.diastolic"
              type="number"
              placeholder="例如 80"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">心率 (bpm)</label>
            <InputText
              v-model="form.heartRate"
              type="number"
              placeholder="例如 72"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">體溫 (°C)</label>
            <InputText
              v-model="form.temperature"
              type="number"
              step="0.1"
              placeholder="例如 36.6"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">血氧 (%)</label>
            <InputText
              v-model="form.bloodOxygen"
              type="number"
              placeholder="例如 98"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600"
              >血糖 (mg/dL)</label
            >
            <InputText
              v-model="form.bloodSugar"
              type="number"
              placeholder="可留空"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">備註</label>
            <Textarea
              v-model="form.notes"
              rows="3"
              placeholder="任何補充說明..."
            />
          </div>
        </div>

        <small v-if="formErrors.measurement" class="text-red-500 block -mt-2">
          {{ formErrors.measurement }}
        </small>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="closeDialog"
          />
          <Button
            label="儲存"
            icon="pi pi-check"
            class="shadow-md"
            :loading="saving"
            @click="submitForm"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showThresholdDialog"
      header="警示閾值設定"
      :modal="true"
      :style="{ width: '560px' }"
      :draggable="false"
    >
      <div class="space-y-6">
        <div
          class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700"
        >
          提醒：設定的區間會用於異常提醒，不會影響歷史資料，請依照醫囑進行調整。
        </div>

        <div class="space-y-4">
          <div>
            <p
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <i class="pi pi-arrow-right-arrow-left text-primary"></i>
              血壓 (mmHg)
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-gray-500">收縮壓最小值</label>
                <InputText
                  v-model="thresholdForm.systolicMin"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.systolicMin"
                />
                <small
                  v-if="thresholdErrors.systolicMin"
                  class="text-red-500"
                  >{{ thresholdErrors.systolicMin }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">收縮壓最大值</label>
                <InputText
                  v-model="thresholdForm.systolicMax"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.systolicMax"
                />
                <small
                  v-if="thresholdErrors.systolicMax"
                  class="text-red-500"
                  >{{ thresholdErrors.systolicMax }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">舒張壓最小值</label>
                <InputText
                  v-model="thresholdForm.diastolicMin"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.diastolicMin"
                />
                <small
                  v-if="thresholdErrors.diastolicMin"
                  class="text-red-500"
                  >{{ thresholdErrors.diastolicMin }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">舒張壓最大值</label>
                <InputText
                  v-model="thresholdForm.diastolicMax"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.diastolicMax"
                />
                <small
                  v-if="thresholdErrors.diastolicMax"
                  class="text-red-500"
                  >{{ thresholdErrors.diastolicMax }}</small
                >
              </div>
            </div>
          </div>

          <div>
            <p
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <i class="pi pi-heart text-red-500"></i>
              心率 / 體溫
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-gray-500">心率最小值</label>
                <InputText
                  v-model="thresholdForm.heartRateMin"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.heartRateMin"
                />
                <small
                  v-if="thresholdErrors.heartRateMin"
                  class="text-red-500"
                  >{{ thresholdErrors.heartRateMin }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">心率最大值</label>
                <InputText
                  v-model="thresholdForm.heartRateMax"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.heartRateMax"
                />
                <small
                  v-if="thresholdErrors.heartRateMax"
                  class="text-red-500"
                  >{{ thresholdErrors.heartRateMax }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">體溫最小值</label>
                <InputText
                  v-model="thresholdForm.temperatureMin"
                  type="number"
                  step="0.1"
                  class="w-full"
                  :invalid="!!thresholdErrors.temperatureMin"
                />
                <small
                  v-if="thresholdErrors.temperatureMin"
                  class="text-red-500"
                  >{{ thresholdErrors.temperatureMin }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">體溫最大值</label>
                <InputText
                  v-model="thresholdForm.temperatureMax"
                  type="number"
                  step="0.1"
                  class="w-full"
                  :invalid="!!thresholdErrors.temperatureMax"
                />
                <small
                  v-if="thresholdErrors.temperatureMax"
                  class="text-red-500"
                  >{{ thresholdErrors.temperatureMax }}</small
                >
              </div>
            </div>
          </div>

          <div>
            <p
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <i class="pi pi-percentage text-orange-500"></i>
              血氧 / 血糖
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-gray-500">血氧最小值</label>
                <InputText
                  v-model="thresholdForm.bloodOxygenMin"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.bloodOxygenMin"
                />
                <small
                  v-if="thresholdErrors.bloodOxygenMin"
                  class="text-red-500"
                  >{{ thresholdErrors.bloodOxygenMin }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">血氧最大值</label>
                <InputText
                  v-model="thresholdForm.bloodOxygenMax"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.bloodOxygenMax"
                />
                <small
                  v-if="thresholdErrors.bloodOxygenMax"
                  class="text-red-500"
                  >{{ thresholdErrors.bloodOxygenMax }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">血糖最小值</label>
                <InputText
                  v-model="thresholdForm.bloodSugarMin"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.bloodSugarMin"
                />
                <small
                  v-if="thresholdErrors.bloodSugarMin"
                  class="text-red-500"
                  >{{ thresholdErrors.bloodSugarMin }}</small
                >
              </div>
              <div>
                <label class="text-xs text-gray-500">血糖最大值</label>
                <InputText
                  v-model="thresholdForm.bloodSugarMax"
                  type="number"
                  class="w-full"
                  :invalid="!!thresholdErrors.bloodSugarMax"
                />
                <small
                  v-if="thresholdErrors.bloodSugarMax"
                  class="text-red-500"
                  >{{ thresholdErrors.bloodSugarMax }}</small
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="showThresholdDialog = false"
          />
          <Button
            label="儲存設定"
            icon="pi pi-check"
            class="shadow-md"
            @click="saveThresholds"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed, onMounted, reactive, ref, watch } from "vue";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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

const { toDate: toDateUtil } = useUtils();
const toast = useToast();
const { fetchClients, clients } = useClients();
const { getVitalSignRecords, createVitalSignRecord } = useVitalSigns();

const selectedClientId = ref<string | null>(null);
const selectedRange = ref("30");
const customStartDate = ref<Date | null>(null);
const customEndDate = ref<Date | null>(null);

const records = ref<any[]>([]);
const loadingRecords = ref(false);

const showDialog = ref(false);
const saving = ref(false);
const form = reactive({
  clientId: "",
  measuredAt: new Date(),
  systolic: null as string | null,
  diastolic: null as string | null,
  heartRate: null as string | null,
  temperature: null as string | null,
  bloodOxygen: null as string | null,
  bloodSugar: null as string | null,
  notes: "",
});
const formErrors = reactive<Record<string, string>>({});

const thresholds = reactive({
  systolic: { min: 90, max: 140 },
  diastolic: { min: 60, max: 90 },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 36, max: 37.5 },
  bloodOxygen: { min: 95, max: 100 },
  bloodSugar: { min: 70, max: 140 },
});

const thresholdForm = reactive({
  systolicMin: String(thresholds.systolic.min),
  systolicMax: String(thresholds.systolic.max),
  diastolicMin: String(thresholds.diastolic.min),
  diastolicMax: String(thresholds.diastolic.max),
  heartRateMin: String(thresholds.heartRate.min),
  heartRateMax: String(thresholds.heartRate.max),
  temperatureMin: String(thresholds.temperature.min),
  temperatureMax: String(thresholds.temperature.max),
  bloodOxygenMin: String(thresholds.bloodOxygen.min),
  bloodOxygenMax: String(thresholds.bloodOxygen.max),
  bloodSugarMin: String(thresholds.bloodSugar.min),
  bloodSugarMax: String(thresholds.bloodSugar.max),
});
const thresholdErrors = reactive<Record<string, string>>({});
const showThresholdDialog = ref(false);

const metricLabels: Record<string, string> = {
  bloodPressure: "血壓",
  heartRate: "心率",
  temperature: "體溫",
  bloodOxygen: "血氧",
  bloodSugar: "血糖",
};

const rangeOptions = [
  { label: "最近 7 天", value: "7" },
  { label: "最近 30 天", value: "30" },
  { label: "最近 90 天", value: "90" },
  { label: "今年至今", value: "year" },
  { label: "全部", value: "all" },
  { label: "自訂期間", value: "custom" },
];

const clientOptions = computed(() =>
  clients.value.map((client: any) => ({
    label: client.name,
    value: client.id,
  }))
);

const filters = computed(() => {
  const data: any = {
    order: "desc" as const,
  };

  if (selectedClientId.value) {
    data.clientId = selectedClientId.value;
  }

  const today = dayjs().endOf("day");

  if (selectedRange.value === "7") {
    data.startDate = today.subtract(6, "day").startOf("day").toDate();
  } else if (selectedRange.value === "30") {
    data.startDate = today.subtract(29, "day").startOf("day").toDate();
  } else if (selectedRange.value === "90") {
    data.startDate = today.subtract(89, "day").startOf("day").toDate();
  } else if (selectedRange.value === "year") {
    data.startDate = today.startOf("year").toDate();
  } else if (selectedRange.value === "custom") {
    if (customStartDate.value) {
      data.startDate = dayjs(customStartDate.value).startOf("day").toDate();
    }
    if (customEndDate.value) {
      data.endDate = dayjs(customEndDate.value).endOf("day").toDate();
    }
  }

  return data;
});

const sortedRecordsAsc = computed(() => {
  return [...records.value].sort(
    (a, b) => dayjs(a.measuredAt).valueOf() - dayjs(b.measuredAt).valueOf()
  );
});

const chartData = computed(() => {
  const labels = sortedRecordsAsc.value.map((record) =>
    dayjs(record.measuredAt).format("MM/DD HH:mm")
  );

  return {
    labels,
    datasets: [
      {
        label: "收縮壓 (mmHg)",
        data: sortedRecordsAsc.value.map((record) => record.systolic ?? null),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
        tension: 0.4,
        fill: true,
        spanGaps: true,
      },
      {
        label: "舒張壓 (mmHg)",
        data: sortedRecordsAsc.value.map((record) => record.diastolic ?? null),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        spanGaps: true,
      },
      {
        label: "心率 (bpm)",
        data: sortedRecordsAsc.value.map((record) => record.heartRate ?? null),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        fill: true,
        spanGaps: true,
      },
      {
        label: "血氧 (%)",
        data: sortedRecordsAsc.value.map(
          (record) => record.bloodOxygen ?? null
        ),
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
        fill: true,
        spanGaps: true,
      },
      {
        label: "體溫 (°C)",
        data: sortedRecordsAsc.value.map(
          (record) => record.temperature ?? null
        ),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
        spanGaps: true,
      },
    ],
  };
});

const chartOptions = {
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

const latestRecord = computed(() => {
  if (records.value.length === 0) return null;
  return records.value.reduce((latest, current) =>
    dayjs(latest.measuredAt).isAfter(current.measuredAt) ? latest : current
  );
});

const rangeSummary = computed(() => {
  if (records.value.length === 0) return "—";
  const first = sortedRecordsAsc.value[0];
  const last = sortedRecordsAsc.value[sortedRecordsAsc.value.length - 1];
  const start = dayjs(first.measuredAt).format("YYYY/MM/DD");
  const end = dayjs(last.measuredAt).format("YYYY/MM/DD");
  return `${start} - ${end}`;
});

const latestMeasurementText = computed(() => {
  if (!latestRecord.value) return "—";
  const date = dayjs(latestRecord.value.measuredAt).format("MM/DD HH:mm");
  const heartRate = formatValue(latestRecord.value.heartRate, " bpm");
  const temperature = formatValue(latestRecord.value.temperature, " °C", 1);
  const oxygen = formatValue(latestRecord.value.bloodOxygen, "%");
  return `${date} · 心率 ${heartRate} · 體溫 ${temperature} · 血氧 ${oxygen}`;
});

const abnormalCount = computed(
  () =>
    records.value.filter((record) => abnormalMetrics(record).length > 0).length
);

const formatValue = (
  value: number | null | undefined,
  suffix = "",
  decimals = 0
) => {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(decimals)}${suffix}`;
};

const formatBloodPressure = (record: any) => {
  if (!record.systolic || !record.diastolic) return "—";
  return `${record.systolic}/${record.diastolic}`;
};

const getCellClass = (record: any, field: string) => {
  return abnormalMetrics(record).includes(field)
    ? "text-red-600 font-semibold"
    : "text-gray-700";
};

const abnormalMetrics = (record: any) => {
  const result: string[] = [];

  if (
    record.systolic !== null &&
    record.systolic !== undefined &&
    (record.systolic < thresholds.systolic.min ||
      record.systolic > thresholds.systolic.max)
  ) {
    result.push("bloodPressure");
  }

  if (
    record.diastolic !== null &&
    record.diastolic !== undefined &&
    (record.diastolic < thresholds.diastolic.min ||
      record.diastolic > thresholds.diastolic.max)
  ) {
    if (!result.includes("bloodPressure")) {
      result.push("bloodPressure");
    }
  }

  if (
    record.heartRate !== null &&
    record.heartRate !== undefined &&
    (record.heartRate < thresholds.heartRate.min ||
      record.heartRate > thresholds.heartRate.max)
  ) {
    result.push("heartRate");
  }

  if (
    record.temperature !== null &&
    record.temperature !== undefined &&
    (record.temperature < thresholds.temperature.min ||
      record.temperature > thresholds.temperature.max)
  ) {
    result.push("temperature");
  }

  if (
    record.bloodOxygen !== null &&
    record.bloodOxygen !== undefined &&
    (record.bloodOxygen < thresholds.bloodOxygen.min ||
      record.bloodOxygen > thresholds.bloodOxygen.max)
  ) {
    result.push("bloodOxygen");
  }

  if (
    record.bloodSugar !== null &&
    record.bloodSugar !== undefined &&
    (record.bloodSugar < thresholds.bloodSugar.min ||
      record.bloodSugar > thresholds.bloodSugar.max)
  ) {
    result.push("bloodSugar");
  }

  return result;
};

const toDate = (value: any) => {
  return toDateUtil(value);
};

const normalizeRecord = (record: any) => ({
  ...record,
  measuredAt: toDate(record.measuredAt),
});

const loadRecords = async () => {
  loadingRecords.value = true;
  try {
    const data = await getVitalSignRecords(filters.value);
    records.value = (data || []).map(normalizeRecord);
  } catch (error) {
    console.error("Failed to load vital signs:", error);
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法取得生命徵象資料，請稍後再試。",
      life: 3000,
    });
  } finally {
    loadingRecords.value = false;
  }
};

const openCreateDialog = () => {
  Object.assign(form, {
    clientId: selectedClientId.value || "",
    measuredAt: new Date(),
    systolic: null,
    diastolic: null,
    heartRate: null,
    temperature: null,
    bloodOxygen: null,
    bloodSugar: null,
    notes: "",
  });
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ""));
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const openThresholdDialog = () => {
  Object.assign(thresholdForm, {
    systolicMin: thresholds.systolic.min,
    systolicMax: thresholds.systolic.max,
    diastolicMin: thresholds.diastolic.min,
    diastolicMax: thresholds.diastolic.max,
    heartRateMin: thresholds.heartRate.min,
    heartRateMax: thresholds.heartRate.max,
    temperatureMin: thresholds.temperature.min,
    temperatureMax: thresholds.temperature.max,
    bloodOxygenMin: thresholds.bloodOxygen.min,
    bloodOxygenMax: thresholds.bloodOxygen.max,
    bloodSugarMin: thresholds.bloodSugar.min,
    bloodSugarMax: thresholds.bloodSugar.max,
  });
  Object.keys(thresholdErrors).forEach((key) => (thresholdErrors[key] = ""));
  showThresholdDialog.value = true;
};

const saveThresholds = () => {
  Object.keys(thresholdErrors).forEach((key) => (thresholdErrors[key] = ""));

  const toNumeric = (value: any) => {
    const num = Number(value);
    return !Number.isNaN(num) ? num : NaN;
  };

  const pairs: Array<[string, number, number]> = [
    [
      "systolic",
      toNumeric(thresholdForm.systolicMin),
      toNumeric(thresholdForm.systolicMax),
    ],
    [
      "diastolic",
      toNumeric(thresholdForm.diastolicMin),
      toNumeric(thresholdForm.diastolicMax),
    ],
    [
      "heartRate",
      toNumeric(thresholdForm.heartRateMin),
      toNumeric(thresholdForm.heartRateMax),
    ],
    [
      "temperature",
      toNumeric(thresholdForm.temperatureMin),
      toNumeric(thresholdForm.temperatureMax),
    ],
    [
      "bloodOxygen",
      toNumeric(thresholdForm.bloodOxygenMin),
      toNumeric(thresholdForm.bloodOxygenMax),
    ],
    [
      "bloodSugar",
      toNumeric(thresholdForm.bloodSugarMin),
      toNumeric(thresholdForm.bloodSugarMax),
    ],
  ];

  let isValid = true;
  pairs.forEach(([key, min, max]) => {
    const minField = `${key}Min`;
    const maxField = `${key}Max`;
    if (Number.isNaN(min) || Number.isNaN(max)) {
      thresholdErrors[minField] = "請輸入數值";
      thresholdErrors[maxField] = "請輸入數值";
      isValid = false;
    } else if (min >= max) {
      thresholdErrors[minField] = "最小值需小於最大值";
      thresholdErrors[maxField] = "最大值需大於最小值";
      isValid = false;
    }
  });

  if (!isValid) return;

  pairs.forEach(([key, min, max]) => {
    (thresholds as any)[key].min = min;
    (thresholds as any)[key].max = max;
  });

  toast.add({
    severity: "success",
    summary: "設定完成",
    detail: "警示閾值已更新",
    life: 2500,
  });

  showThresholdDialog.value = false;
};

const validateForm = () => {
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ""));
  if (!form.clientId) {
    formErrors.clientId = "請選擇個案";
  }

  if (!form.measuredAt) {
    formErrors.measuredAt = "請選擇測量時間";
  }

  const hasMeasurement =
    form.systolic ||
    form.diastolic ||
    form.heartRate ||
    form.temperature ||
    form.bloodOxygen ||
    form.bloodSugar;

  if (!hasMeasurement) {
    formErrors.measurement = "至少填寫一項測量數據";
  }

  return Object.values(formErrors).every((error) => !error);
};

const submitForm = async () => {
  if (!validateForm()) return;

  saving.value = true;
  try {
    const client = clients.value.find((item: any) => item.id === form.clientId);

    await createVitalSignRecord({
      clientId: form.clientId,
      clientName: client?.name || "",
      measuredAt: form.measuredAt,
      systolic: form.systolic ? Number(form.systolic) : null,
      diastolic: form.diastolic ? Number(form.diastolic) : null,
      heartRate: form.heartRate ? Number(form.heartRate) : null,
      temperature: form.temperature ? Number(form.temperature) : null,
      bloodOxygen: form.bloodOxygen ? Number(form.bloodOxygen) : null,
      bloodSugar: form.bloodSugar ? Number(form.bloodSugar) : null,
      notes: form.notes,
    });

    toast.add({
      severity: "success",
      summary: "新增成功",
      detail: "生命徵象紀錄已新增",
      life: 2500,
    });

    showDialog.value = false;
    await loadRecords();
  } catch (error) {
    console.error("Failed to create vital sign record:", error);
    toast.add({
      severity: "error",
      summary: "新增失敗",
      detail: "無法新增生命徵象紀錄，請稍後再試。",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};

const exportExcel = () => {
  if (records.value.length === 0) return;
  const data = records.value.map((record) => ({
    日期: dayjs(record.measuredAt).format("YYYY/MM/DD"),
    時間: dayjs(record.measuredAt).format("HH:mm"),
    "血壓 (mmHg)": formatBloodPressure(record),
    "心率 (bpm)": record.heartRate ?? "",
    "體溫 (°C)": record.temperature ?? "",
    "血氧 (%)": record.bloodOxygen ?? "",
    "血糖 (mg/dL)": record.bloodSugar ?? "",
    備註: record.notes || "",
    紀錄者: record.recordedByName || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "生命徵象紀錄");

  const fileName = `生命徵象_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

const exportPdf = () => {
  if (records.value.length === 0) return;

  const doc = new jsPDF();
  const title = "生命徵象紀錄";
  doc.setFontSize(16);
  doc.text(title, 14, 18);

  autoTable(doc, {
    startY: 24,
    head: [
      [
        "日期",
        "時間",
        "血壓 (mmHg)",
        "心率 (bpm)",
        "體溫 (°C)",
        "血氧 (%)",
        "血糖 (mg/dL)",
        "備註",
      ],
    ],
    body: records.value.map((record) => [
      dayjs(record.measuredAt).format("YYYY/MM/DD"),
      dayjs(record.measuredAt).format("HH:mm"),
      formatBloodPressure(record),
      record.heartRate ?? "",
      record.temperature ?? "",
      record.bloodOxygen ?? "",
      record.bloodSugar ?? "",
      record.notes || "",
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
    },
  });

  doc.save(`生命徵象_${dayjs().format("YYYYMMDD_HHmm")}.pdf`);
};

watch(
  filters,
  () => {
    loadRecords();
  },
  { deep: true, immediate: true }
);

watch(selectedRange, (value) => {
  if (value !== "custom") {
    customStartDate.value = null;
    customEndDate.value = null;
  }
});

onMounted(async () => {
  await fetchClients();
  if (!selectedClientId.value && clients.value.length > 0) {
    selectedClientId.value = clients.value[0].id;
  }
});
</script>
