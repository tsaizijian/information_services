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

  // 公開路由（不需要登入）
  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(to.path);

  // 如果未登入且不是前往公開路由，重導向到登入頁
  if (!user.value && !isPublicRoute) {
    return navigateTo("/login");
  }

  // 如果已登入且前往登入頁，重導向到儀表板
  if (user.value && to.path === "/login") {
    return navigateTo("/dashboard");
  }
});
