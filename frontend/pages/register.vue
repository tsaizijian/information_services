<template>
  <div class="min-h-screen relative overflow-hidden bg-white">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0 -z-10">
      <!-- 網格背景 -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem]"
      ></div>

      <!-- 漸層光暈 -->
      <div
        class="absolute top-0 left-1/4 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 1s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 2s"
      ></div>
    </div>

    <!-- 主要內容 -->
    <div
      class="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div
        class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
      >
        <!-- 左側 - 品牌與資訊 -->
        <div class="space-y-8 text-center lg:text-left">
          <!-- Logo 與標題 -->
          <div class="space-y-4">
            <div
              class="inline-flex items-center justify-center lg:justify-start"
            >
              <div
                class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50 transform hover:scale-110 transition-transform duration-300"
              >
                <i
                  class="pi pi-user-plus text-white text-4xl animate-pulse"
                ></i>
                <div
                  class="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 opacity-0 hover:opacity-20 transition-opacity"
                ></div>
              </div>
            </div>

            <div>
              <h1
                class="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 leading-tight"
              >
                加入我們的團隊
              </h1>
              <p class="text-lg text-gray-600 font-medium">
                建立您的帳號，開始使用照護紀錄系統
              </p>
            </div>
          </div>

          <!-- 特色標籤 -->
          <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
            <div
              class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-shield"></i>
              安全加密
            </div>
            <div
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-check-circle"></i>
              即刻上手
            </div>
            <div
              class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-users"></i>
              團隊協作
            </div>
          </div>

          <!-- 描述文字 -->
          <div class="space-y-4 max-w-md mx-auto lg:mx-0">
            <p class="text-gray-600 leading-relaxed">註冊完成後，您將能夠：</p>

            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  <i class="pi pi-check text-green-600"></i>
                </div>
                <div class="text-left">
                  <p class="text-gray-700 font-medium">管理個案資料</p>
                  <p class="text-sm text-gray-600">
                    完整記錄每位寶貝的成長歷程
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  <i class="pi pi-check text-blue-600"></i>
                </div>
                <div class="text-left">
                  <p class="text-gray-700 font-medium">記錄照護內容</p>
                  <p class="text-sm text-gray-600">即時追蹤與更新照護進度</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  <i class="pi pi-check text-purple-600"></i>
                </div>
                <div class="text-left">
                  <p class="text-gray-700 font-medium">數據分析統計</p>
                  <p class="text-sm text-gray-600">視覺化呈現照護成果</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 返回登入連結 -->
          <div class="pt-4">
            <NuxtLink
              to="/login"
              class="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors group"
            >
              <i
                class="pi pi-arrow-left group-hover:-translate-x-1 transition-transform"
              ></i>
              已有帳號？返回登入
            </NuxtLink>
          </div>
        </div>

        <!-- 右側 - 註冊表單 -->
        <div class="w-full max-w-md mx-auto lg:mx-0">
          <Card
            class="shadow-2xl border-0 backdrop-blur-sm bg-white/80 hover:shadow-green-200/50 transition-all duration-300"
          >
            <template #content>
              <div class="p-2">
                <!-- 表單標題 -->
                <div class="text-center mb-8">
                  <div
                    class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg shadow-green-500/30"
                  >
                    <i class="pi pi-user-plus text-white text-2xl"></i>
                  </div>
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">
                    建立新帳號
                  </h2>
                  <p class="text-gray-600">請填寫以下資訊以完成註冊</p>
                </div>

                <!-- 註冊表單 -->
                <form @submit.prevent="handleRegister" class="space-y-5">
                  <!-- 姓名 -->
                  <div class="space-y-2">
                    <label
                      for="displayName"
                      class="block text-sm font-semibold text-gray-700"
                    >
                      姓名 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
                      >
                        <i class="pi pi-user"></i>
                      </div>
                      <InputText
                        id="displayName"
                        v-model="form.displayName"
                        placeholder="請輸入您的姓名"
                        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-all"
                        required
                      />
                    </div>
                    <small v-if="errors.displayName" class="text-red-500">{{
                      errors.displayName
                    }}</small>
                  </div>

                  <!-- 電子郵件 -->
                  <div class="space-y-2">
                    <label
                      for="email"
                      class="block text-sm font-semibold text-gray-700"
                    >
                      電子郵件 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
                      >
                        <i class="pi pi-envelope"></i>
                      </div>
                      <InputText
                        id="email"
                        v-model="form.email"
                        type="email"
                        placeholder="your@email.com"
                        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-all"
                        required
                      />
                    </div>
                    <small v-if="errors.email" class="text-red-500">{{
                      errors.email
                    }}</small>
                  </div>

                  <!-- 電話 -->
                  <div class="space-y-2">
                    <label
                      for="phone"
                      class="block text-sm font-semibold text-gray-700"
                    >
                      聯絡電話
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
                      >
                        <i class="pi pi-phone"></i>
                      </div>
                      <InputText
                        id="phone"
                        v-model="form.phone"
                        type="tel"
                        placeholder="0912-345-678"
                        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>

                  <!-- 角色說明 -->
                  <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0"
                      >
                        <i class="pi pi-info-circle text-white"></i>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-sm font-bold text-blue-900 mb-1">
                          關於帳號角色
                        </h4>
                        <p class="text-xs text-blue-800">
                          註冊後您的帳號角色將預設為「照顧者」，
                          如需管理員權限，請聯絡現有系統管理員進行設定。
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- 密碼 -->
                  <div class="space-y-2">
                    <label
                      for="password"
                      class="block text-sm font-semibold text-gray-700"
                    >
                      密碼 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"
                      >
                        <i class="pi pi-lock"></i>
                      </div>
                      <Password
                        id="password"
                        v-model="form.password"
                        placeholder="至少 6 個字元"
                        toggleMask
                        :feedback="true"
                        inputClass="w-full pl-12 pr-4 py-3 rounded-xl border-2"
                        class="w-full"
                        required
                      >
                        <template #header>
                          <h6 class="font-semibold mb-2">建議密碼規則</h6>
                        </template>
                        <template #footer>
                          <ul class="text-xs mt-2 space-y-1 text-gray-600">
                            <li>• 至少 6 個字元</li>
                            <li>• 建議包含大小寫字母</li>
                            <li>• 建議包含數字或符號</li>
                          </ul>
                        </template>
                      </Password>
                    </div>
                    <small v-if="errors.password" class="text-red-500">{{
                      errors.password
                    }}</small>
                  </div>

                  <!-- 確認密碼 -->
                  <div class="space-y-2">
                    <label
                      for="confirmPassword"
                      class="block text-sm font-semibold text-gray-700"
                    >
                      確認密碼 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors z-10"
                      >
                        <i class="pi pi-lock"></i>
                      </div>
                      <Password
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        placeholder="請再次輸入密碼"
                        toggleMask
                        :feedback="false"
                        inputClass="w-full pl-12 pr-4 py-3 rounded-xl border-2"
                        class="w-full"
                        required
                      />
                    </div>
                    <small v-if="errors.confirmPassword" class="text-red-500">{{
                      errors.confirmPassword
                    }}</small>
                  </div>

                  <!-- 服務條款 -->
                  <div class="flex items-start gap-3 py-2">
                    <Checkbox
                      v-model="form.agreeTerms"
                      inputId="agreeTerms"
                      binary
                      class="mt-1"
                    />
                    <label for="agreeTerms" class="text-sm text-gray-600">
                      我已閱讀並同意
                      <a href="#" class="text-green-600 hover:underline">
                        服務條款
                      </a>
                      和
                      <a href="#" class="text-green-600 hover:underline">
                        隱私政策
                      </a>
                    </label>
                  </div>
                  <small v-if="errors.agreeTerms" class="text-red-500 block">{{
                    errors.agreeTerms
                  }}</small>

                  <!-- 註冊按鈕 -->
                  <Button
                    type="submit"
                    label="建立帳號"
                    icon="pi pi-user-plus"
                    iconPos="right"
                    class="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                    size="large"
                    :loading="loading"
                  />

                  <!-- 分隔線 -->
                  <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                      <div class="w-full border-t border-gray-200"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                      <span class="px-4 bg-white text-gray-500">或</span>
                    </div>
                  </div>

                  <!-- 返回登入 -->
                  <div class="text-center">
                    <p class="text-sm text-gray-600">
                      已經有帳號了？
                      <NuxtLink
                        to="/login"
                        class="text-green-600 hover:text-green-700 font-semibold hover:underline"
                      >
                        立即登入
                      </NuxtLink>
                    </p>
                  </div>
                </form>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <Toast position="top-right" />
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";

const toast = useToast();
const { register } = useAuth();
const loading = ref(false);

const form = reactive({
  displayName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
});

const errors = reactive({
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeTerms: "",
});

// 表單驗證
const validateForm = () => {
  // 重置錯誤
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = "";
  });

  let isValid = true;

  if (!form.displayName.trim()) {
    errors.displayName = "請輸入姓名";
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = "請輸入電子郵件";
    isValid = false;
  }

  if (form.password.length < 6) {
    errors.password = "密碼至少需要 6 個字元";
    isValid = false;
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "密碼不一致";
    isValid = false;
  }

  if (!form.agreeTerms) {
    errors.agreeTerms = "請閱讀並同意服務條款";
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) {
    toast.add({
      severity: "warn",
      summary: "表單驗證失敗",
      detail: "請檢查所有必填欄位",
      life: 3000,
    });
    return;
  }

  loading.value = true;

  try {
    const result = await register({
      email: form.email,
      password: form.password,
      displayName: form.displayName,
      phone: form.phone,
    });

    if (result.success) {
      toast.add({
        severity: "success",
        summary: "註冊成功",
        detail: "驗證郵件已發送至您的信箱（請檢查垃圾郵件資料夾），請先完成郵箱驗證後再登入。",
        life: 6000,
      });

      // 等待 Toast 顯示後跳轉到登入頁面
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await navigateTo("/login");
    } else {
      toast.add({
        severity: "error",
        summary: "註冊失敗",
        detail: result.error || "請檢查您的資料",
        life: 4000,
      });
    }
  } catch (error: any) {
    console.error("註冊失敗:", error);
    toast.add({
      severity: "error",
      summary: "註冊失敗",
      detail: error.message || "請稍後再試",
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
};

definePageMeta({
  layout: "auth",
});
</script>

<style scoped>
/* 自訂樣式 */
:deep(.p-inputtext) {
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus) {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

:deep(.p-password input) {
  transition: all 0.3s ease;
}

:deep(.p-password input:focus) {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

:deep(.p-select:focus) {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* 動畫效果 */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
