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
        class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 1s"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl animate-pulse"
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
                class="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 transform hover:scale-110 transition-transform duration-300"
              >
                <i class="pi pi-key text-white text-4xl animate-pulse"></i>
                <div
                  class="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 to-pink-500 opacity-0 hover:opacity-20 transition-opacity"
                ></div>
              </div>
            </div>

            <div>
              <h1
                class="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 leading-tight"
              >
                重設您的密碼
              </h1>
              <p class="text-lg text-gray-600 font-medium">
                我們會發送重設連結到您的信箱
              </p>
            </div>
          </div>

          <!-- 特色標籤 -->
          <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
            <div
              class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-shield"></i>
              安全可靠
            </div>
            <div
              class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-envelope"></i>
              郵件驗證
            </div>
            <div
              class="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium inline-flex items-center gap-2"
            >
              <i class="pi pi-clock"></i>
              快速處理
            </div>
          </div>

          <!-- 描述文字 -->
          <div class="space-y-4 max-w-md mx-auto lg:mx-0">
            <p class="text-gray-600 leading-relaxed">
              請輸入您註冊時使用的電子郵件地址，我們將發送密碼重設連結到您的信箱。
            </p>

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0"
                >
                  <i class="pi pi-info-circle text-white"></i>
                </div>
                <div class="flex-1 text-left">
                  <h4 class="text-sm font-bold text-blue-900 mb-1">注意事項</h4>
                  <ul class="text-xs text-blue-800 space-y-1">
                    <li>• 重設連結將在 1 小時後失效</li>
                    <li>• 請檢查垃圾郵件資料夾</li>
                    <li>• 如未收到郵件，請稍後再試</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 返回登入連結 -->
          <div class="pt-4">
            <NuxtLink
              to="/login"
              class="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors group"
            >
              <i
                class="pi pi-arrow-left group-hover:-translate-x-1 transition-transform"
              ></i>
              返回登入頁面
            </NuxtLink>
          </div>
        </div>

        <!-- 右側 - 重設密碼表單 -->
        <div class="w-full max-w-md mx-auto lg:mx-0">
          <Card
            class="shadow-2xl border-0 backdrop-blur-sm bg-white/80 hover:shadow-indigo-200/50 transition-all duration-300"
          >
            <template #content>
              <div class="p-2">
                <!-- 表單標題 -->
                <div class="text-center mb-8">
                  <div
                    class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30"
                  >
                    <i class="pi pi-lock-open text-white text-2xl"></i>
                  </div>
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">
                    忘記密碼
                  </h2>
                  <p class="text-gray-600">輸入您的電子郵件以重設密碼</p>
                </div>

                <!-- 成功訊息 -->
                <div v-if="emailSent" class="mb-6 space-y-3">
                  <!-- 成功提示 -->
                  <div
                    class="bg-green-50 border-2 border-green-200 rounded-xl p-4"
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0"
                      >
                        <i class="pi pi-check-circle text-white"></i>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-sm font-bold text-green-900 mb-1">
                          郵件已發送
                        </h4>
                        <p class="text-xs text-green-800">
                          我們已將密碼重設連結發送至
                          <strong>{{ email }}</strong>
                          ，請檢查您的信箱並點擊連結以重設密碼。
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- 垃圾郵件提醒 -->
                  <div
                    class="bg-orange-50 border-2 border-orange-200 rounded-xl p-4"
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0"
                      >
                        <i class="pi pi-exclamation-circle text-white"></i>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-sm font-bold text-orange-900 mb-2">
                          重要提醒
                        </h4>
                        <ul class="text-xs text-orange-800 space-y-1.5">
                          <li class="flex items-start gap-2">
                            <i class="pi pi-angle-right mt-0.5"></i>
                            <span
                              ><strong>請檢查垃圾郵件資料夾</strong>，Firebase
                              的郵件可能被歸類為垃圾郵件</span
                            >
                          </li>
                          <li class="flex items-start gap-2">
                            <i class="pi pi-angle-right mt-0.5"></i>
                            <span
                              >如果在垃圾郵件中找到，請標記為「非垃圾郵件」</span
                            >
                          </li>
                          <li class="flex items-start gap-2">
                            <i class="pi pi-angle-right mt-0.5"></i>
                            <span>重設連結將在 1 小時後失效</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 重設密碼表單 -->
                <form
                  v-if="!emailSent"
                  @submit.prevent="handleResetPassword"
                  class="space-y-6"
                >
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
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors"
                      >
                        <i class="pi pi-envelope"></i>
                      </div>
                      <InputText
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="your@email.com"
                        class="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <!-- 提交按鈕 -->
                  <Button
                    type="submit"
                    label="發送重設連結"
                    icon="pi pi-send"
                    iconPos="right"
                    class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
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

                  <!-- 其他選項 -->
                  <div class="space-y-3 text-center">
                    <p class="text-sm text-gray-600">
                      記起密碼了？
                      <NuxtLink
                        to="/login"
                        class="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                      >
                        立即登入
                      </NuxtLink>
                    </p>
                    <p class="text-sm text-gray-600">
                      還沒有帳號？
                      <NuxtLink
                        to="/register"
                        class="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                      >
                        立即註冊
                      </NuxtLink>
                    </p>
                  </div>
                </form>

                <!-- 郵件已發送後的操作 -->
                <div v-else class="space-y-4">
                  <Button
                    @click="resetForm"
                    label="使用其他郵件地址"
                    icon="pi pi-replay"
                    class="w-full py-3 rounded-xl"
                    severity="secondary"
                    outlined
                  />

                  <NuxtLink to="/login">
                    <Button
                      label="返回登入"
                      icon="pi pi-sign-in"
                      iconPos="right"
                      class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      size="large"
                    />
                  </NuxtLink>
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

const email = ref("");
const loading = ref(false);
const emailSent = ref(false);

const { resetPassword } = useAuth();
const toast = useToast();

const handleResetPassword = async () => {
  if (!email.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "請輸入郵件地址",
      detail: "請輸入您的電子郵件地址",
      life: 3000,
    });
    return;
  }

  loading.value = true;

  try {
    console.log("開始發送密碼重設郵件至:", email.value);
    const result = await resetPassword(email.value);
    console.log("重設密碼結果:", result);

    if (result.success) {
      emailSent.value = true;
      toast.add({
        severity: "success",
        summary: "郵件已發送",
        detail: result.message || "密碼重設郵件已發送，請檢查您的信箱",
        life: 5000,
      });
    } else {
      console.error("發送失敗:", result.error);
      toast.add({
        severity: "error",
        summary: "發送失敗",
        detail: result.error || "無法發送重設郵件",
        life: 4000,
      });
    }
  } catch (error: any) {
    console.error("重設密碼異常:", error);
    console.error("錯誤詳情:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    toast.add({
      severity: "error",
      summary: "發送失敗",
      detail: error.message || "請稍後再試",
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  email.value = "";
  emailSent.value = false;
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
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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
