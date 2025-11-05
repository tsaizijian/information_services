export default defineNuxtRouteMiddleware(async (to, from) => {
  // 只在客戶端執行
  if (process.server) {
    return;
  }

  const { user, loading, initAuth } = useAuth();

  // 第一次載入時，等待認證狀態初始化
  if (loading.value) {
    await initAuth();
  }

  // 如果未登入且不是前往首頁（登入頁），重導向到首頁
  if (!user.value && to.path !== "/") {
    return navigateTo("/");
  }

  // 如果已登入且前往首頁，重導向到儀表板
  if (user.value && to.path === "/") {
    return navigateTo("/dashboard");
  }
});
