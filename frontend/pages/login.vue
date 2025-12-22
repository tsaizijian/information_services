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
        class="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 1s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl animate-pulse"
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
                class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 transform hover:scale-110 transition-transform duration-300"
              >
                <i class="pi pi-heart text-white text-4xl animate-pulse"></i>
                <div
                  class="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 hover:opacity-20 transition-opacity"
                ></div>
              </div>
            </div>

            <div>
              <h1
                class="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 leading-tight"
              >
                寶貝潛能發展中心
              </h1>
              <p class="text-lg text-gray-600 font-medium">照護紀錄管理系統</p>
            </div>
          </div>

          <!-- 特色標籤 -->
          <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
            <div
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-check-circle"></i>
              專業管理
            </div>
            <div
              class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-check-circle"></i>
              即時記錄
            </div>
            <div
              class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-check-circle"></i>
              數據分析
            </div>
          </div>

          <!-- 描述文字 -->
          <div class="space-y-4 max-w-md mx-auto lg:mx-0">
            <p class="text-gray-600 leading-relaxed">
              透過數位化管理系統，完整記錄每位寶貝的成長歷程，
              提供專業團隊即時追蹤與分析工具。
            </p>

            <div class="grid grid-cols-2 gap-4 pt-4">
              <div class="text-center lg:text-left">
                <div class="text-3xl font-bold text-blue-600 mb-1">20+</div>
                <div class="text-sm text-gray-600">服務年資</div>
              </div>
              <div class="text-center lg:text-left">
                <div class="text-3xl font-bold text-green-600 mb-1">100+</div>
                <div class="text-sm text-gray-600">服務個案</div>
              </div>
            </div>
          </div>

          <!-- 返回首頁連結 -->
          <div class="pt-4">
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors group"
            >
              <i
                class="pi pi-arrow-left group-hover:-translate-x-1 transition-transform"
              ></i>
              返回首頁
            </NuxtLink>
          </div>
        </div>

        <!-- 右側 - 登入表單 -->
        <div class="w-full max-w-md mx-auto lg:mx-0">
          <Card
            class="shadow-2xl border-0 backdrop-blur-sm bg-white/80 hover:shadow-blue-200/50 transition-all duration-300"
          >
            <template #content>
              <div class="p-2">
                <!-- 表單標題 -->
                <div class="text-center mb-8">
                  <div
                    class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-500/30"
                  >
                    <i class="pi pi-user text-white text-2xl"></i>
                  </div>
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">
                    歡迎回來
                  </h2>
                  <p class="text-gray-600">請登入您的帳號以繼續使用</p>
                </div>

                <!-- 登入表單 -->
                <form @submit.prevent="handleLogin" class="space-y-6">
                  <!-- 郵箱未驗證提示 -->
                  <div
                    v-if="unverifiedUser"
                    class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4"
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center flex-shrink-0"
                      >
                        <i class="pi pi-exclamation-triangle text-white"></i>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-sm font-bold text-yellow-900 mb-2">
                          郵箱尚未驗證
                        </h4>
                        <p class="text-xs text-yellow-800 mb-2">
                          您的帳號尚未完成郵箱驗證，請先驗證後再登入。
                        </p>
                        <p class="text-xs text-yellow-700 mb-3">
                          <strong>提醒：</strong>驗證郵件可能被歸類為垃圾郵件，請檢查您的垃圾郵件資料夾。
                        </p>
                        <Button
                          type="button"
                          label="重新發送驗證郵件"
                          icon="pi pi-envelope"
                          @click="resendVerificationEmail"
                          size="small"
                          class="bg-yellow-600 hover:bg-yellow-700 border-0"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 電子郵件 -->
                  <div class="space-y-2">
                    <label
                      for="email"
                      class="block text-sm font-semibold text-gray-700"
                    >
                      電子郵件
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                      >
                        <i class="pi pi-envelope"></i>
                      </div>
                      <InputText
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="your@email.com"
                        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <!-- 密碼 -->
                  <div class="space-y-2">
                    <label
                      for="password"
                      class="block text-sm font-semibold text-gray-700"
                    >
                      密碼
                    </label>
                    <div class="relative group">
                      <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10"
                      >
                        <i class="pi pi-lock"></i>
                      </div>
                      <Password
                        id="password"
                        v-model="password"
                        placeholder="請輸入密碼"
                        :feedback="false"
                        toggleMask
                        inputClass="w-full pl-12 pr-4 py-3 rounded-xl border-2"
                        class="w-full"
                        required
                      />
                    </div>
                  </div>

                  <!-- 記住我與忘記密碼 -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Checkbox
                        v-model="rememberMe"
                        inputId="remember"
                        binary
                      />
                      <label
                        for="remember"
                        class="text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                      >
                        記住我
                      </label>
                    </div>
                    <NuxtLink
                      to="/forgot-password"
                      class="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      忘記密碼？
                    </NuxtLink>
                  </div>

                  <!-- 登入按鈕 -->
                  <Button
                    type="submit"
                    label="登入系統"
                    icon="pi pi-sign-in"
                    iconPos="right"
                    class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                    size="large"
                    :loading="loading"
                  />

                  <!-- 分隔線 -->
                  <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                      <div class="w-full border-t border-gray-200"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                      <span class="px-4 bg-white text-gray-500">快速測試</span>
                    </div>
                  </div>
                </form>

                <!-- 底部資訊 -->
                <div
                  class="mt-6 pt-6 border-t border-gray-200 text-center space-y-3"
                >
                  <p class="text-sm text-gray-600">
                    還沒有帳號？
                    <NuxtLink
                      to="/register"
                      class="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      立即註冊
                    </NuxtLink>
                  </p>
                  <p class="text-xs text-gray-500">
                    或
                    <a
                      href="#"
                      class="text-gray-600 hover:text-gray-700 hover:underline"
                    >
                      聯絡管理員
                    </a>
                    協助您開通帳號
                  </p>
                </div>
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
import type { User } from "firebase/auth";

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);
const unverifiedUser = ref<User | null>(null);

const { login, sendVerificationEmail } = useAuth();
const toast = useToast();

const handleLogin = async () => {
  loading.value = true;
  unverifiedUser.value = null;

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
      // 檢查是否為郵箱未驗證錯誤
      if (result.code === "auth/email-not-verified" && result.user) {
        unverifiedUser.value = result.user;
        toast.add({
          severity: "warn",
          summary: "郵箱未驗證",
          detail:
            "請先驗證您的電子郵件後再登入。點擊下方按鈕重新發送驗證郵件。",
          life: 6000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: "登入失敗",
          detail: result.error || "請檢查您的帳號密碼",
          life: 4000,
        });
      }
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

// 重新發送驗證郵件
const resendVerificationEmail = async () => {
  if (!unverifiedUser.value) return;

  try {
    const result = await sendVerificationEmail(unverifiedUser.value);
    if (result.success) {
      toast.add({
        severity: "success",
        summary: "驗證郵件已發送",
        detail: "請檢查您的信箱（包括垃圾郵件資料夾）並點擊驗證連結",
        life: 5000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "發送失敗",
        detail: result.error || "無法發送驗證郵件",
        life: 4000,
      });
    }
  } catch (error: any) {
    console.error("發送驗證郵件失敗:", error);
    toast.add({
      severity: "error",
      summary: "發送失敗",
      detail: error.message || "請稍後再試",
      life: 4000,
    });
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
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-password input) {
  transition: all 0.3s ease;
}

:deep(.p-password input:focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
