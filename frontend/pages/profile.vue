<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <i class="pi pi-user text-primary"></i>
          個人設定
        </h1>
        <p class="text-gray-500 mt-1">管理您的個人資訊與帳號設定</p>
      </div>
    </div>

    <!-- 個人資訊卡片 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
          >
            <i class="pi pi-user text-blue-600"></i>
          </div>
          <div>
            <span class="text-xl font-semibold text-gray-800">個人資訊</span>
            <p class="text-sm text-gray-500">查看和編輯您的基本資料</p>
          </div>
        </div>
      </template>
      <template #content>
        <div class="space-y-6">
          <!-- 基本資料表單 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">
                顯示名稱 <span class="text-red-500">*</span>
              </label>
              <InputText
                v-model="profileForm.displayName"
                placeholder="請輸入顯示名稱"
                class="w-full"
                :invalid="!!formErrors.displayName"
              />
              <small v-if="formErrors.displayName" class="text-red-500">
                {{ formErrors.displayName }}
              </small>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">電話號碼</label>
              <InputText
                v-model="profileForm.phone"
                placeholder="請輸入電話號碼"
                class="w-full"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">電子郵件</label>
              <InputText :value="userProfile?.email" disabled class="w-full" />
              <small class="text-gray-500">
                <i class="pi pi-info-circle mr-1"></i>
                電子郵件無法修改
              </small>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600"
                >使用者角色</label
              >
              <InputText :value="roleLabel" disabled class="w-full" />
              <small class="text-gray-500">
                <i class="pi pi-info-circle mr-1"></i>
                角色由管理員設定
              </small>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <Button
              label="取消"
              severity="secondary"
              outlined
              @click="resetForm"
            />
            <Button
              label="儲存變更"
              icon="pi pi-check"
              :loading="saving"
              @click="saveProfile"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 修改密碼卡片 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"
          >
            <i class="pi pi-lock text-orange-600"></i>
          </div>
          <div>
            <span class="text-xl font-semibold text-gray-800">修改密碼</span>
            <p class="text-sm text-gray-500">更新您的登入密碼</p>
          </div>
        </div>
      </template>
      <template #content>
        <div class="space-y-6">
          <div
            class="bg-blue-50 border-l-4 border-blue-500 rounded-lg px-4 py-3"
          >
            <div class="flex items-start gap-3">
              <i class="pi pi-info-circle text-blue-600 text-lg mt-0.5"></i>
              <div class="text-sm text-blue-700">
                <p class="font-medium mb-1">密碼安全提示</p>
                <ul class="list-disc list-inside space-y-1 text-blue-600">
                  <li>密碼長度至少 6 個字元</li>
                  <li>建議使用英文字母、數字和符號的組合</li>
                  <li>不要使用容易被猜到的密碼</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 max-w-md">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">
                目前密碼 <span class="text-red-500">*</span>
              </label>
              <Password
                v-model="passwordForm.currentPassword"
                placeholder="請輸入目前密碼"
                :feedback="false"
                toggleMask
                class="w-full"
                :invalid="!!passwordErrors.currentPassword"
              />
              <small v-if="passwordErrors.currentPassword" class="text-red-500">
                {{ passwordErrors.currentPassword }}
              </small>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">
                新密碼 <span class="text-red-500">*</span>
              </label>
              <Password
                v-model="passwordForm.newPassword"
                placeholder="請輸入新密碼"
                toggleMask
                class="w-full"
                :invalid="!!passwordErrors.newPassword"
              />
              <small v-if="passwordErrors.newPassword" class="text-red-500">
                {{ passwordErrors.newPassword }}
              </small>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-600">
                確認新密碼 <span class="text-red-500">*</span>
              </label>
              <Password
                v-model="passwordForm.confirmPassword"
                placeholder="請再次輸入新密碼"
                :feedback="false"
                toggleMask
                class="w-full"
                :invalid="!!passwordErrors.confirmPassword"
              />
              <small v-if="passwordErrors.confirmPassword" class="text-red-500">
                {{ passwordErrors.confirmPassword }}
              </small>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <Button
              label="取消"
              severity="secondary"
              outlined
              @click="resetPasswordForm"
            />
            <Button
              label="更新密碼"
              icon="pi pi-lock"
              severity="warning"
              :loading="updatingPassword"
              @click="updatePassword"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 帳號資訊卡片 -->
    <Card class="shadow-sm border-0">
      <template #title>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <i class="pi pi-info-circle text-gray-600"></i>
          </div>
          <div>
            <span class="text-xl font-semibold text-gray-800">帳號資訊</span>
            <p class="text-sm text-gray-500">您的帳號註冊與使用資訊</p>
          </div>
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">帳號狀態</label>
            <div class="flex items-center gap-2">
              <Tag
                :value="userProfile?.isActive ? '啟用' : '停用'"
                :severity="userProfile?.isActive ? 'success' : 'danger'"
                rounded
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">使用者 ID</label>
            <div class="flex items-center gap-2">
              <code
                class="bg-gray-100 px-3 py-2 rounded text-sm text-gray-700 font-mono"
              >
                {{ userProfile?.id }}
              </code>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">註冊時間</label>
            <p class="text-gray-700">
              {{ formatDate(userProfile?.createdAt) }}
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">最後更新</label>
            <p class="text-gray-700">
              {{ formatDate(userProfile?.updatedAt) }}
            </p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";
import {
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

const { userProfile, user } = useAuth();
const toast = useToast();
const nuxtApp = useNuxtApp();

// 表單狀態
const saving = ref(false);
const updatingPassword = ref(false);

const profileForm = reactive({
  displayName: "",
  phone: "",
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const formErrors = reactive<Record<string, string>>({});
const passwordErrors = reactive<Record<string, string>>({});

// 計算屬性
const ROLE_LABELS: Record<string, string> = {
  admin: "管理員",
  caregiver: "照顧者",
  family: "家屬",
};

const roleLabel = computed(() => {
  const role = userProfile.value?.role;
  return (role && ROLE_LABELS[role]) || "家屬";
});

const roleSeverity = computed(() => {
  const severities: Record<string, string> = {
    admin: "danger",
    caregiver: "success",
    family: "info",
  };
  return severities[userProfile.value?.role || ""] || "secondary";
});

const roleIcon = computed(() => {
  const icons: Record<string, string> = {
    admin: "pi pi-shield",
    caregiver: "pi pi-users",
    family: "pi pi-heart",
  };
  return icons[userProfile.value?.role || ""] || "pi pi-user";
});

// 初始化表單
const initForm = () => {
  profileForm.displayName = userProfile.value?.displayName || "";
  profileForm.phone = userProfile.value?.phone || "";
};

// 重置表單
const resetForm = () => {
  initForm();
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ""));
};

const resetPasswordForm = () => {
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  Object.keys(passwordErrors).forEach((key) => (passwordErrors[key] = ""));
};

// 驗證個人資訊表單
const validateProfile = (): boolean => {
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ""));
  let isValid = true;

  if (!profileForm.displayName.trim()) {
    formErrors.displayName = "請輸入顯示名稱";
    isValid = false;
  }

  return isValid;
};

// 驗證密碼表單
const validatePassword = (): boolean => {
  Object.keys(passwordErrors).forEach((key) => (passwordErrors[key] = ""));
  let isValid = true;

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = "請輸入目前密碼";
    isValid = false;
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = "請輸入新密碼";
    isValid = false;
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = "密碼長度至少需要 6 個字元";
    isValid = false;
  }

  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = "請確認新密碼";
    isValid = false;
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = "密碼確認不一致";
    isValid = false;
  }

  return isValid;
};

// 儲存個人資訊
const saveProfile = async () => {
  if (!validateProfile()) return;

  saving.value = true;
  try {
    const currentUser = user.value;
    if (!currentUser) {
      throw new Error("未登入");
    }

    // 更新 Firebase Auth displayName
    await updateProfile(currentUser, {
      displayName: profileForm.displayName,
    });

    // 更新 Firestore 使用者資料
    const firestore = nuxtApp.$firestore;
    const userDocRef = doc(firestore, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      displayName: profileForm.displayName,
      phone: profileForm.phone,
      updatedAt: serverTimestamp(),
    });

    // 更新本地狀態
    if (userProfile.value) {
      userProfile.value.displayName = profileForm.displayName;
      userProfile.value.phone = profileForm.phone;
    }

    toast.add({
      severity: "success",
      summary: "更新成功",
      detail: "個人資訊已更新",
      life: 3000,
    });
  } catch (error: any) {
    console.error("更新個人資訊失敗:", error);
    toast.add({
      severity: "error",
      summary: "更新失敗",
      detail: error.message || "無法更新個人資訊",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};

// 更新密碼
const updatePassword = async () => {
  if (!validatePassword()) return;

  updatingPassword.value = true;
  try {
    const currentUser = user.value;
    if (!currentUser || !currentUser.email) {
      throw new Error("未登入或缺少郵箱資訊");
    }

    // 重新驗證使用者
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      passwordForm.currentPassword
    );

    await reauthenticateWithCredential(currentUser, credential);

    // 更新密碼
    await firebaseUpdatePassword(currentUser, passwordForm.newPassword);

    toast.add({
      severity: "success",
      summary: "更新成功",
      detail: "密碼已更新，請使用新密碼登入",
      life: 3000,
    });

    resetPasswordForm();
  } catch (error: any) {
    console.error("更新密碼失敗:", error);

    let errorMessage = "無法更新密碼";
    if (error.code === "auth/wrong-password") {
      errorMessage = "目前密碼不正確";
      passwordErrors.currentPassword = errorMessage;
    } else if (error.code === "auth/weak-password") {
      errorMessage = "新密碼強度不足";
      passwordErrors.newPassword = errorMessage;
    }

    toast.add({
      severity: "error",
      summary: "更新失敗",
      detail: errorMessage,
      life: 3000,
    });
  } finally {
    updatingPassword.value = false;
  }
};

// 格式化日期
const formatDate = (date: any) => {
  if (!date) return "—";
  const d = date.toDate ? date.toDate() : new Date(date);
  return dayjs(d).format("YYYY/MM/DD HH:mm");
};

// 初始化
onMounted(() => {
  initForm();
});
</script>
