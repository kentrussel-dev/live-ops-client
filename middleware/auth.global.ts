export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  authStore.init();

  const isLoginPage = to.path === '/login';

  // If unauthenticated and trying to access protected console pages
  if (!authStore.isAuthenticated && !isLoginPage) {
    return navigateTo('/login');
  }

  // If already authenticated and trying to access login page
  if (authStore.isAuthenticated && isLoginPage) {
    return navigateTo('/');
  }
});
