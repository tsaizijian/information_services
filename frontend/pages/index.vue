<template>
  <div
    class="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
  >
    <!-- 左側 - 品牌區域 -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden"
    >
      <!-- 裝飾圖案 -->
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"
      ></div>

      <div class="relative z-10">
        <div class="flex items-center gap-3 text-white mb-8">
          <div
            class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <i class="pi pi-heart text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold">照護紀錄系統</h2>
            <p class="text-white/80 text-sm">Care Record System</p>
          </div>
        </div>

        <div class="space-y-6 text-white">
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-1"
            >
              <i class="pi pi-users text-lg"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-1">專業個案管理</h3>
              <p class="text-white/80">完整記錄每位夥伴的成長歷程與照護需求</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-1"
            >
              <i class="pi pi-file-edit text-lg"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-1">即時照護紀錄</h3>
              <p class="text-white/80">快速記錄日常照護內容，隨時追蹤進度</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-1"
            >
              <i class="pi pi-chart-line text-lg"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-1">數據分析統計</h3>
              <p class="text-white/80">視覺化呈現照護成果，輔助決策判斷</p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-white/60 text-sm">
        <p>© 2025 照護紀錄系統 · 用心記錄，關懷每一位夥伴</p>
      </div>
    </div>

    <!-- 右側 - 登入表單 -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-md">
        <!-- 手機版 Logo -->
        <div class="lg:hidden text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-4"
          >
            <i class="pi pi-heart text-3xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">照護紀錄系統</h1>
          <p class="text-gray-600 text-sm mt-1">Care Record System</p>
        </div>

        <!-- 登入卡片 -->
        <Card class="shadow-2xl border-0">
          <template #title>
            <div class="text-center pb-4">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">歡迎回來</h2>
              <p class="text-gray-500 text-sm">請登入您的帳號以繼續</p>
            </div>
          </template>

          <template #content>
            <form @submit.prevent="handleLogin" class="space-y-6">
              <!-- 電子郵件 -->
              <div class="space-y-2">
                <label
                  for="email"
                  class="block text-sm font-semibold text-gray-700"
                >
                  電子郵件
                </label>

                <div class="flex">
                  <span
                    class="text-gray-400 mr-3 justify-center flex items-center"
                  >
                    <i class="pi pi-envelope"></i>
                  </span>
                  <InputText
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="your@email.com"
                    class="w-full pl-10"
                    size="large"
                    required
                  />
                </div>
              </div>

              <!-- 密碼 -->
              <div>
                <label
                  for="password"
                  class="block text-sm font-semibold text-gray-700"
                >
                  密碼
                </label>
                <div class="flex">
                  <span class="text-gray-400 flex items-center mr-3">
                    <i class="pi pi-lock"></i>
                  </span>
                  <Password
                    id="password"
                    v-model="password"
                    placeholder="請輸入密碼"
                    :feedback="false"
                    required
                  />
                </div>
              </div>

              <!-- 記住我 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Checkbox v-model="rememberMe" inputId="remember" binary />
                  <label
                    for="remember"
                    class="text-sm text-gray-600 cursor-pointer"
                  >
                    記住我
                  </label>
                </div>
                <a
                  href="#"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  忘記密碼？
                </a>
              </div>

              <!-- 登入按鈕 -->
              <Button
                type="submit"
                label="登入"
                icon="pi pi-sign-in"
                class="w-full"
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

              <!-- 測試帳號提示 -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <i class="pi pi-info-circle text-blue-600 mt-0.5"></i>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-blue-900 mb-1">
                      測試帳號
                    </h4>
                    <p class="text-xs text-blue-700">
                      管理員：b30430624@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </template>
        </Card>

        <!-- 額外資訊 -->
        <div class="mt-6 text-center text-sm text-gray-500">
          <p>
            還沒有帳號？
            <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">
              聯絡管理員
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <Toast position="top-right" />
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);

const { login } = useAuth();
const toast = useToast();

const handleLogin = async () => {
  loading.value = true;

  try {
    const result = await login(email.value, password.value);
    if (result.success) {
      toast.add({
        severity: "success",
        summary: "登入成功",
        detail: "歡迎回來！正在為您跳轉...",
        life: 2000,
      });

      // 等待 Toast 顯示後再跳轉
      await new Promise((resolve) => setTimeout(resolve, 500));
      await navigateTo("/dashboard");
    } else {
      toast.add({
        severity: "error",
        summary: "登入失敗",
        detail: result.error || "請檢查您的帳號密碼",
        life: 4000,
      });
    }
  } catch (error: any) {
    console.error("登入失敗:", error);

    let errorDetail = "請稍後再試";
    if (error.code === "auth/invalid-credential") {
      errorDetail = "電子郵件或密碼錯誤";
    } else if (error.code === "auth/user-not-found") {
      errorDetail = "找不到此使用者";
    } else if (error.code === "auth/wrong-password") {
      errorDetail = "密碼錯誤";
    } else if (error.code === "auth/too-many-requests") {
      errorDetail = "嘗試次數過多，請稍後再試";
    } else if (error.message) {
      errorDetail = error.message;
    }

    toast.add({
      severity: "error",
      summary: "登入失敗",
      detail: errorDetail,
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
/* 修復 Password 組件的圖示位置 */
:deep(.password-with-icon .p-password-input) {
  padding-left: 2.5rem;
}
</style>
