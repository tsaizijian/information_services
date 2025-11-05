<template>
  <div class="space-y-6">
    <!-- 頁面標題與操作 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <i class="pi pi-sitemap text-primary"></i>
          班級管理
        </h1>
        <p class="text-gray-500 mt-2">管理照護單位的班級組織與成員</p>
      </div>
      <Button
        label="新增班級"
        icon="pi pi-plus"
        size="large"
        @click="showNewClassDialog = true"
        class="shadow-md"
      />
    </div>

    <!-- 班級統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">班級總數</p>
              <p class="text-3xl font-bold text-blue-600 mt-2">
                {{ classes.length }}
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <i class="pi pi-sitemap text-3xl text-blue-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">個案總數</p>
              <p class="text-3xl font-bold text-green-600 mt-2">
                {{ totalClients }}
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
            >
              <i class="pi pi-users text-3xl text-green-600"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">平均每班人數</p>
              <p class="text-3xl font-bold text-orange-600 mt-2">
                {{ averageClientsPerClass }}
              </p>
            </div>
            <div
              class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center"
            >
              <i class="pi pi-chart-bar text-3xl text-orange-600"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 班級列表卡片 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center gap-3 py-2">
          <div
            class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"
          >
            <i class="pi pi-list text-primary text-lg"></i>
          </div>
          <div>
            <span class="text-xl font-bold text-gray-800">班級列表</span>
            <p class="text-sm text-gray-500 mt-1">
              共
              <span class="font-semibold text-primary">{{
                classes.length
              }}</span>
              個班級
            </p>
          </div>
        </div>
      </template>
      <template #content>
        <!-- 載入中 -->
        <div v-if="loading" class="text-center py-12">
          <i class="pi pi-spinner pi-spin text-4xl text-gray-400"></i>
          <p class="text-gray-500 mt-4">載入中...</p>
        </div>

        <!-- 班級列表 -->
        <div
          v-else-if="classes.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Card
            v-for="classItem in classes"
            :key="classItem.id"
            class="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <template #header>
              <div
                class="bg-gradient-to-br from-primary-500 to-primary-700 p-6"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-2xl font-bold">
                      {{ classItem.className }}
                    </h3>
                    <p class="text-primary-100 mt-1 text-sm">
                      {{ classItem.description || "暫無描述" }}
                    </p>
                  </div>
                  <div class="flex gap-1">
                    <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      severity="secondary"
                      @click="editClass(classItem)"
                      class="text-white hover:bg-white/20"
                    />
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      @click="confirmDelete(classItem)"
                      class="text-white hover:bg-white/20"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template #content>
              <div class="space-y-4">
                <!-- 統計資訊 -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-blue-50 rounded-lg p-3">
                    <p class="text-xs text-gray-600">個案人數</p>
                    <p class="text-2xl font-bold text-blue-600">
                      {{ getClassClientCount(classItem.id) }}
                    </p>
                  </div>
                  <div class="bg-green-50 rounded-lg p-3">
                    <p class="text-xs text-gray-600">照顧者</p>
                    <p class="text-2xl font-bold text-green-600">
                      {{ classItem.caregiverCount || 0 }}
                    </p>
                  </div>
                </div>

                <!-- 班級資訊 -->
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2 text-gray-600">
                    <i class="pi pi-map-marker"></i>
                    <span>{{ classItem.location || "未設定位置" }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <i class="pi pi-phone"></i>
                    <span>{{ classItem.contactPhone || "未設定電話" }}</span>
                  </div>
                </div>

                <!-- 查看成員按鈕 -->
                <Button
                  label="查看成員"
                  icon="pi pi-users"
                  outlined
                  class="w-full"
                  @click="viewClassMembers(classItem)"
                />
              </div>
            </template>
          </Card>
        </div>

        <!-- 空狀態 -->
        <div v-else class="text-center py-16">
          <div
            class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4"
          >
            <i class="pi pi-inbox text-5xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">目前沒有班級</h3>
          <p class="text-gray-500 mb-6">開始新增第一個班級吧！</p>
          <Button
            label="新增班級"
            icon="pi pi-plus"
            @click="showNewClassDialog = true"
          />
        </div>
      </template>
    </Card>

    <!-- 新增/編輯班級對話框 -->
    <Dialog
      v-model:visible="showClassDialog"
      :header="editingClass ? '編輯班級資料' : '新增班級'"
      :modal="true"
      :style="{ width: '600px' }"
      :draggable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"
          >
            <i
              :class="editingClass ? 'pi pi-pencil' : 'pi pi-plus'"
              class="text-primary"
            ></i>
          </div>
          <div>
            <h3 class="text-lg font-bold">
              {{ editingClass ? "編輯班級資料" : "新增班級" }}
            </h3>
            <p class="text-sm text-gray-500">請填寫班級資訊，帶 * 為必填欄位</p>
          </div>
        </div>
      </template>

      <div class="space-y-4 py-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            班級名稱 <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="classForm.className"
            placeholder="例如：甲班、乙班"
            class="w-full"
            :invalid="!!formErrors.className"
          />
          <small v-if="formErrors.className" class="text-red-500 mt-1 block">
            <i class="pi pi-exclamation-circle mr-1"></i
            >{{ formErrors.className }}
          </small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            班級描述
          </label>
          <Textarea
            v-model="classForm.description"
            placeholder="簡短描述班級特色或服務對象"
            rows="3"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              位置/樓層
            </label>
            <InputText
              v-model="classForm.location"
              placeholder="例如：二樓東側"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              聯絡電話
            </label>
            <InputText
              v-model="classForm.contactPhone"
              placeholder="例如：02-12345678"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            備註
          </label>
          <Textarea
            v-model="classForm.notes"
            placeholder="其他需要記錄的資訊"
            rows="2"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            severity="secondary"
            outlined
            @click="showClassDialog = false"
            icon="pi pi-times"
          />
          <Button
            :label="editingClass ? '儲存變更' : '新增班級'"
            @click="saveClass"
            :loading="saving"
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
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"
          >
            <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">確認刪除班級</h3>
            <p class="text-sm text-gray-500">此操作無法復原，請謹慎確認</p>
          </div>
        </div>
      </template>

      <div class="py-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p class="text-gray-700">
            確定要刪除班級
            <span class="font-bold text-red-600"
              >「{{ deletingClass?.className }}」</span
            >
            嗎？
          </p>
          <p class="text-sm text-gray-600 mt-2">
            <i class="pi pi-info-circle mr-1"></i>
            此班級目前有
            <span class="font-semibold">{{
              getClassClientCount(deletingClass?.id)
            }}</span>
            位個案
          </p>
          <p class="text-sm text-gray-600 mt-1">
            刪除後，這些個案將變成未分配狀態
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
            @click="deleteClass"
            :loading="deleting"
            icon="pi pi-trash"
          />
        </div>
      </template>
    </Dialog>

    <!-- 查看班級成員對話框 -->
    <Dialog
      v-model:visible="showMembersDialog"
      :header="`${viewingClass?.className} - 成員列表`"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
          >
            <i class="pi pi-users text-blue-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold">
              {{ viewingClass?.className }} - 成員列表
            </h3>
            <p class="text-sm text-gray-500">
              共 {{ classMembers.length }} 位個案
            </p>
          </div>
        </div>
      </template>

      <div class="py-4">
        <div v-if="loadingMembers" class="text-center py-8">
          <i class="pi pi-spinner pi-spin text-3xl text-gray-400"></i>
        </div>
        <div v-else-if="classMembers.length > 0" class="space-y-3">
          <div
            v-for="member in classMembers"
            :key="member.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"
                >
                  <i class="pi pi-user text-primary"></i>
                </div>
                <div>
                  <p class="font-semibold text-gray-800">{{ member.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ member.gender === "male" ? "男" : "女" }} ·
                    {{ member.age || "-" }} 歲
                  </p>
                </div>
              </div>
              <Button
                label="查看詳情"
                icon="pi pi-eye"
                text
                @click="navigateTo(`/clients/${member.id}`)"
              />
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <i class="pi pi-inbox text-4xl mb-3 block"></i>
          <p>此班級目前沒有個案</p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import * as v from "valibot";

definePageMeta({
  layout: "default",
  middleware: ["auth", "role"],
});

// Valibot Schema
const ClassFormSchema = v.object({
  className: v.pipe(v.string(), v.minLength(1, "請輸入班級名稱")),
  description: v.optional(v.string()),
  location: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  notes: v.optional(v.string()),
});

type ClassFormData = v.InferOutput<typeof ClassFormSchema>;

const {
  getClasses,
  createClass,
  updateClass: updateClassData,
  deleteClass: removeClass,
} = useClasses();
const { getClients } = useClients();

// 狀態
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const loadingMembers = ref(false);
const showClassDialog = ref(false);
const showNewClassDialog = ref(false);
const showDeleteDialog = ref(false);
const showMembersDialog = ref(false);
const editingClass = ref<any>(null);
const deletingClass = ref<any>(null);
const viewingClass = ref<any>(null);
const classes = ref<any[]>([]);
const allClients = ref<any[]>([]);
const classMembers = ref<any[]>([]);

// 表單
const classForm = ref<ClassFormData>({
  className: "",
  description: "",
  location: "",
  contactPhone: "",
  notes: "",
});

const formErrors = ref<Partial<Record<keyof ClassFormData, string>>>({});

// 計算屬性
const totalClients = computed(() => allClients.value.length);

const averageClientsPerClass = computed(() => {
  if (classes.value.length === 0) return 0;
  return Math.round(totalClients.value / classes.value.length);
});

// 取得班級的個案數量
const getClassClientCount = (classId: string) => {
  if (!classId) return 0;
  return allClients.value.filter((client) => client.classId === classId).length;
};

// 監聽新增對話框
watch(showNewClassDialog, (value) => {
  if (value) {
    editingClass.value = null;
    resetForm();
    showClassDialog.value = true;
    showNewClassDialog.value = false;
  }
});

// 方法
const resetForm = () => {
  classForm.value = {
    className: "",
    description: "",
    location: "",
    contactPhone: "",
    notes: "",
  };
  formErrors.value = {};
};

const editClass = (classItem: any) => {
  editingClass.value = classItem;
  classForm.value = {
    className: classItem.className,
    description: classItem.description || "",
    location: classItem.location || "",
    contactPhone: classItem.contactPhone || "",
    notes: classItem.notes || "",
  };
  showClassDialog.value = true;
};

const confirmDelete = (classItem: any) => {
  deletingClass.value = classItem;
  showDeleteDialog.value = true;
};

const saveClass = async () => {
  saving.value = true;
  formErrors.value = {};

  try {
    const validatedData = v.parse(ClassFormSchema, classForm.value);

    const classData = {
      className: validatedData.className,
      description: validatedData.description || null,
      location: validatedData.location || null,
      contactPhone: validatedData.contactPhone || null,
      notes: validatedData.notes || null,
      caregiverCount: 0,
    };

    if (editingClass.value) {
      await updateClassData(editingClass.value.id, classData);
    } else {
      await createClass(classData);
    }

    await loadClasses();
    showClassDialog.value = false;
    resetForm();
    editingClass.value = null;
  } catch (error) {
    if (error instanceof v.ValiError) {
      error.issues.forEach((issue) => {
        const path = issue.path?.[0]?.key as keyof ClassFormData;
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

const deleteClass = async () => {
  if (!deletingClass.value) return;

  deleting.value = true;
  try {
    await removeClass(deletingClass.value.id);
    await loadClasses();
    showDeleteDialog.value = false;
    deletingClass.value = null;
  } catch (error) {
    console.error("刪除失敗:", error);
  } finally {
    deleting.value = false;
  }
};

const viewClassMembers = async (classItem: any) => {
  viewingClass.value = classItem;
  showMembersDialog.value = true;
  loadingMembers.value = true;

  try {
    classMembers.value = allClients.value.filter(
      (client) => client.classId === classItem.id
    );
  } catch (error) {
    console.error("載入成員失敗:", error);
  } finally {
    loadingMembers.value = false;
  }
};

const loadClasses = async () => {
  loading.value = true;
  try {
    const [classesData, clientsData] = await Promise.all([
      getClasses(),
      getClients(),
    ]);
    classes.value = classesData;
    allClients.value = clientsData;
  } catch (error) {
    console.error("載入班級失敗:", error);
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadClasses();
});
</script>
