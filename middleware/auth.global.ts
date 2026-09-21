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
    return navigateTo(authStore.isAdmin ? '/' : '/projects');
  }

  // If authenticated as non-admin trying to access hidden Content Ops / Server Infra routes
  const adminOnlyRoutes = ['/', '/events', '/patches', '/shop', '/audit', '/servers', '/admin/users'];
  if (authStore.isAuthenticated && !authStore.isAdmin && adminOnlyRoutes.includes(to.path)) {
    return navigateTo('/projects');
  }
});
