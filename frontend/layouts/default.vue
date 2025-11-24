<template>
  <div class="min-h-screen bg-surface-50">
    <!-- 頂部導航欄 -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-4">
          <!-- Logo & 標題 -->
          <NuxtLink to="/dashboard" class="flex items-center space-x-3">
            <i class="pi pi-heart text-3xl text-primary"></i>
            <div>
              <h1 class="text-xl font-bold text-surface-900">照護紀錄系統</h1>
              <p class="text-xs text-surface-500">Care Record System</p>
            </div>
          </NuxtLink>
        </div>

        <!-- 右側使用者選單 -->
        <div class="flex items-center space-x-4">
          <!-- 通知 -->
          <Button icon="pi pi-bell" severity="secondary" text rounded />

          <!-- 使用者選單 -->
          <div class="flex items-center space-x-3">
            <div class="text-right">
              <p class="text-sm font-medium">
                {{ userProfile?.displayName || "使用者" }}
              </p>
              <p class="text-xs text-surface-500">{{ roleText }}</p>
            </div>
            <Menu ref="menu" :model="userMenuItems" popup>
              <template #item="{ item }">
                <a
                  @click="item.command?.({ originalEvent: $event, item })"
                  class="flex items-center px-4 py-2 cursor-pointer hover:bg-surface-100"
                >
                  <i :class="item.icon" class="mr-2"></i>
                  <span>{{ item.label }}</span>
                </a>
              </template>
            </Menu>
            <Button
              icon="pi pi-user"
              severity="secondary"
              rounded
              @click="toggleUserMenu"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- 主要內容區 -->
    <div class="flex">
      <!-- 側邊欄 -->
      <aside
        class="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]"
      >
        <nav class="p-4">
          <Menu :model="menuItems" class="w-full border-none">
            <template #item="{ item }">
              <NuxtLink
                :to="item.to"
                class="flex items-center px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                active-class="bg-primary-100 text-primary-700 font-medium"
              >
                <i :class="item.icon" class="mr-3 text-lg"></i>
                <span>{{ item.label }}</span>
              </NuxtLink>
            </template>
          </Menu>
        </nav>
      </aside>

      <!-- 主要內容 -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
    <Toast position="top-right" />
  </div>
</template>

<script setup lang="ts">
const { userProfile, logout } = useAuth();
const menu = ref();

const ROLE_LABELS: Record<string, string> = {
  admin: "管理員",
  caregiver: "照顧者",
  family: "家屬",
};

const roleText = computed(() => {
  const role = userProfile.value?.role;
  return (role && ROLE_LABELS[role]) || "家屬";
});

const baseMenuItems = [
  {
    label: "儀表板",
    icon: "pi pi-home",
    to: "/dashboard",
  },
  {
    label: "個案管理",
    icon: "pi pi-users",
    to: "/clients",
  },
  {
    label: "照護紀錄",
    icon: "pi pi-file-edit",
    to: "/records",
  },
  {
    label: "生命徵象",
    icon: "pi pi-heart",
    to: "/vital-signs",
  },
  {
    label: "醫療照護",
    icon: "pi pi-heart-fill",
    to: "/medical-care",
  },
  {
    label: "班務交接",
    icon: "pi pi-sync",
    to: "/handover",
  },
];

const adminMenuItems = [
  {
    label: "班級管理",
    icon: "pi pi-sitemap",
    to: "/classes",
  },
  {
    label: "使用者管理",
    icon: "pi pi-user-edit",
    to: "/users",
  },
];

const menuItems = computed(() => {
  const items = [...baseMenuItems];

  if (userProfile.value?.role === "admin") {
    items.push(...adminMenuItems);
  }

  return items;
});

const userMenuItems = [
  {
    label: "個人設定",
    icon: "pi pi-cog",
    command: () => navigateTo("/profile"),
  },
  {
    separator: true,
  },
  {
    label: "登出",
    icon: "pi pi-sign-out",
    command: async () => {
      await logout();
    },
  },
];

const toggleUserMenu = (event: Event) => {
  menu.value.toggle(event);
};
</script>
