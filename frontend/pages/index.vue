<template>
  <div class="min-h-screen bg-white">
    <!-- 導航欄 -->
    <nav class="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg"
            >
              <i class="pi pi-heart text-white text-2xl"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">寶貝潛能發展中心</h1>
              <p class="text-xs text-gray-500">照護紀錄系統</p>
            </div>
          </div>

          <!-- 導航連結 - 桌面版 -->
          <div class="hidden md:flex items-center gap-8">
            <a
              href="#about"
              class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              關於我們
            </a>
            <a
              href="#features"
              class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              系統特色
            </a>
            <a
              href="#contact"
              class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              聯絡我們
            </a>
            <NuxtLink to="/login">
              <Button label="登入系統" icon="pi pi-sign-in" class="shadow-md" />
            </NuxtLink>
          </div>

          <!-- 手機版選單按鈕 -->
          <Button
            icon="pi pi-bars"
            text
            rounded
            class="md:hidden"
            @click="showMobileMenu = !showMobileMenu"
          />
        </div>
      </div>

      <!-- 手機版選單 -->
      <div
        v-if="showMobileMenu"
        class="md:hidden bg-white border-t border-gray-100"
      >
        <div class="container mx-auto px-4 py-4 space-y-3">
          <a
            href="#about"
            class="block py-2 text-gray-600 hover:text-blue-600 font-medium"
            @click="showMobileMenu = false"
          >
            關於我們
          </a>
          <a
            href="#features"
            class="block py-2 text-gray-600 hover:text-blue-600 font-medium"
            @click="showMobileMenu = false"
          >
            系統特色
          </a>
          <a
            href="#contact"
            class="block py-2 text-gray-600 hover:text-blue-600 font-medium"
            @click="showMobileMenu = false"
          >
            聯絡我們
          </a>
          <NuxtLink to="/login" class="block">
            <Button label="登入系統" icon="pi pi-sign-in" class="w-full" />
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section
      class="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"
    >
      <!-- 裝飾元素 -->
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
      ></div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <i class="pi pi-sparkles"></i>
            專業照護記錄管理系統
          </div>

          <h1
            class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            用心記錄<br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              關懷每一位寶貝
            </span>
          </h1>

          <p
            class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            財團法人桃園市私立寶貝潛能發展中心致力於提供專業、溫馨的照護服務，
            透過數位化管理系統，讓每一份關懷都能被完整記錄。
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/login">
              <Button
                label="開始使用"
                icon="pi pi-arrow-right"
                size="large"
                class="shadow-lg"
              />
            </NuxtLink>
            <a href="#features">
              <Button
                label="了解更多"
                icon="pi pi-info-circle"
                severity="secondary"
                outlined
                size="large"
              />
            </a>
          </div>

          <!-- 統計數據 -->
          <div
            class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
          >
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-1">20+</div>
              <div class="text-sm text-gray-600">服務年資</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-1">100+</div>
              <div class="text-sm text-gray-600">服務個案</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-1">30+</div>
              <div class="text-sm text-gray-600">專業團隊</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-1">24/7</div>
              <div class="text-sm text-gray-600">全天候照護</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 關於我們 Section -->
    <section id="about" class="py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              關於寶貝潛能發展中心
            </h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              我們致力於為身心障礙者提供專業、溫馨的照護服務，
              以愛心和耐心陪伴每一位寶貝健康成長
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="space-y-6">
              <div class="flex gap-4">
                <div
                  class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"
                >
                  <i class="pi pi-heart text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">
                    專業照護服務
                  </h3>
                  <p class="text-gray-600">
                    提供日間照顧、職業訓練、生活自理等多元化服務，
                    協助身心障礙者融入社會，實現自我價值。
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0"
                >
                  <i class="pi pi-users text-green-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">
                    專業團隊支持
                  </h3>
                  <p class="text-gray-600">
                    擁有社工師、職能治療師、特教老師等專業團隊，
                    提供個別化的照護計畫與訓練課程。
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"
                >
                  <i class="pi pi-home text-purple-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">溫馨環境</h3>
                  <p class="text-gray-600">
                    打造舒適、安全的空間，讓每位寶貝都能感受到家的溫暖，
                    在愛的環境中快樂成長。
                  </p>
                </div>
              </div>
            </div>

            <div class="relative">
              <div
                class="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"
              >
                <div class="text-center p-8">
                  <i class="pi pi-heart text-8xl text-blue-600 mb-6"></i>
                  <h3 class="text-2xl font-bold text-gray-900 mb-2">
                    用愛陪伴成長
                  </h3>
                  <p class="text-gray-600">
                    每一個孩子都是獨特的寶貝
                    <br />
                    值得我們用心呵護
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 系統特色 Section -->
    <section id="features" class="py-20 bg-gray-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              照護紀錄系統特色
            </h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              運用現代化數位工具，讓照護工作更有效率，讓關懷更加細緻
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <!-- 特色卡片 1 -->
            <Card class="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <template #content>
                <div class="text-center p-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <i class="pi pi-users text-blue-600 text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">個案管理</h3>
                  <p class="text-gray-600 leading-relaxed">
                    完整記錄每位個案的基本資料、健康狀況、特殊需求，
                    建立專屬的照護檔案，隨時掌握每個孩子的成長軌跡。
                  </p>
                </div>
              </template>
            </Card>

            <!-- 特色卡片 2 -->
            <Card class="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <template #content>
                <div class="text-center p-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <i class="pi pi-file-edit text-green-600 text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">照護紀錄</h3>
                  <p class="text-gray-600 leading-relaxed">
                    即時記錄日常照護內容、活動參與、行為觀察等資訊，
                    提供完整的照護歷程追蹤與分析。
                  </p>
                </div>
              </template>
            </Card>

            <!-- 特色卡片 3 -->
            <Card class="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <template #content>
                <div class="text-center p-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <i class="pi pi-heart text-red-600 text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">生命徵象</h3>
                  <p class="text-gray-600 leading-relaxed">
                    追蹤血壓、心率、體溫等重要生命徵象，
                    透過圖表呈現健康趨勢，及時發現異常狀況。
                  </p>
                </div>
              </template>
            </Card>

            <!-- 特色卡片 4 -->
            <Card class="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <template #content>
                <div class="text-center p-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <i class="pi pi-chart-line text-purple-600 text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">數據分析</h3>
                  <p class="text-gray-600 leading-relaxed">
                    視覺化呈現照護數據，生成統計報表，
                    協助管理者進行決策分析與品質改善。
                  </p>
                </div>
              </template>
            </Card>

            <!-- 特色卡片 5 -->
            <Card class="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <template #content>
                <div class="text-center p-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <i class="pi pi-shield text-orange-600 text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">安全保護</h3>
                  <p class="text-gray-600 leading-relaxed">
                    採用業界標準的資料加密與存取控制，
                    確保個案資料的隱私與安全性。
                  </p>
                </div>
              </template>
            </Card>

            <!-- 特色卡片 6 -->
            <Card class="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <template #content>
                <div class="text-center p-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <i class="pi pi-mobile text-indigo-600 text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">
                    跨平台支援
                  </h3>
                  <p class="text-gray-600 leading-relaxed">
                    響應式設計，支援電腦、平板、手機等多種裝置，
                    讓照護工作更加靈活便利。
                  </p>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- 聯絡我們 Section -->
    <section id="contact" class="py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              聯絡我們
            </h2>
            <p class="text-lg text-gray-600">
              如有任何問題或需求，歡迎與我們聯繫
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- 聯絡資訊 -->
            <div class="space-y-6">
              <Card class="shadow-lg border-0">
                <template #content>
                  <div class="flex items-start gap-4 p-2">
                    <div
                      class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"
                    >
                      <i class="pi pi-map-marker text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">地址</h3>
                      <p class="text-gray-600">334 桃園市八德區茄苳路296號</p>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="shadow-lg border-0">
                <template #content>
                  <div class="flex items-start gap-4 p-2">
                    <div
                      class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0"
                    >
                      <i class="pi pi-phone text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">電話</h3>
                      <p class="text-gray-600">(03) 332-9319</p>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="shadow-lg border-0">
                <template #content>
                  <div class="flex items-start gap-4 p-2">
                    <div
                      class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"
                    >
                      <i class="pi pi-envelope text-purple-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">電子郵件</h3>
                      <p class="text-gray-600">babycenter0329@gmail.com</p>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="shadow-lg border-0">
                <template #content>
                  <div class="flex items-start gap-4 p-2">
                    <div
                      class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"
                    >
                      <i class="pi pi-globe text-orange-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">官方網站</h3>
                      <a
                        href="https://www.baby-center.tw/"
                        target="_blank"
                        class="text-blue-600 hover:text-blue-700"
                      >
                        www.baby-center.tw
                      </a>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <!-- CTA 卡片 -->
            <div class="flex items-center">
              <Card
                class="shadow-lg border-0 w-full bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <template #content>
                  <div class="text-center p-8">
                    <div
                      class="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6"
                    >
                      <i class="pi pi-heart text-white text-4xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">
                      開始使用系統
                    </h3>
                    <p class="text-gray-600 mb-6 leading-relaxed">
                      立即登入照護紀錄系統， 為寶貝們提供更優質的照護服務
                    </p>
                    <NuxtLink to="/login">
                      <Button
                        label="前往登入"
                        icon="pi pi-arrow-right"
                        size="large"
                        class="shadow-lg"
                      />
                    </NuxtLink>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-3 gap-8 mb-8">
            <!-- 關於 -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center"
                >
                  <i class="pi pi-heart text-xl"></i>
                </div>
                <div>
                  <h3 class="font-bold">寶貝潛能發展中心</h3>
                  <p class="text-xs text-gray-400">照護紀錄系統</p>
                </div>
              </div>
              <p class="text-gray-400 text-sm leading-relaxed">
                財團法人桃園市私立寶貝潛能發展中心致力於為身心障礙者提供專業、溫馨的照護服務。
              </p>
            </div>

            <!-- 快速連結 -->
            <div>
              <h4 class="font-bold mb-4">快速連結</h4>
              <ul class="space-y-2 text-sm">
                <li>
                  <a href="#about" class="text-gray-400 hover:text-white">
                    關於我們
                  </a>
                </li>
                <li>
                  <a href="#features" class="text-gray-400 hover:text-white">
                    系統特色
                  </a>
                </li>
                <li>
                  <a href="#contact" class="text-gray-400 hover:text-white">
                    聯絡我們
                  </a>
                </li>
                <li>
                  <NuxtLink to="/login" class="text-gray-400 hover:text-white">
                    登入系統
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- 聯絡資訊 -->
            <div>
              <h4 class="font-bold mb-4">聯絡資訊</h4>
              <ul class="space-y-2 text-sm text-gray-400">
                <li class="flex items-start gap-2">
                  <i class="pi pi-map-marker mt-1"></i>
                  <span>334 桃園市八德區茄苳路296號</span>
                </li>
                <li class="flex items-center gap-2">
                  <i class="pi pi-phone"></i>
                  <span>(03) 332-9319</span>
                </li>
                <li class="flex items-center gap-2">
                  <i class="pi pi-envelope"></i>
                  <span>babycenter0329@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- 版權聲明 -->
          <div
            class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400"
          >
            <p>
              © 2025 財團法人桃園市私立寶貝潛能發展中心 ·
              用心記錄，關懷每一位寶貝
            </p>
          </div>
        </div>
      </div>
    </footer>

    <Toast position="top-right" />
  </div>
</template>

<script setup lang="ts">
const showMobileMenu = ref(false);

definePageMeta({
  layout: "auth",
});
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
