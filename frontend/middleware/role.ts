export default defineNuxtRouteMiddleware((to, from) => {
  const { userProfile, hasRole } = useAuth();

  // 檢查頁面是否需要管理員權限
  if (to.meta.requiresAdmin) {
    if (!hasRole("admin")) {
      return navigateTo("/");
    }
  }

  // 檢查頁面是否需要照顧者權限
  if (to.meta.requiresCaregiver) {
    if (!hasRole(["caregiver", "admin"])) {
      return navigateTo("/");
    }
  }
});
