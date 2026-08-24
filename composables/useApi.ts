import { useAuthStore } from '~/stores/auth';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const apiBase = config.public.apiBase;

  async function request<T = any>(endpoint: string, options: any = {}): Promise<T> {
    const url = `${apiBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    try {
      const response = await $fetch<any>(url, {
        ...options,
        headers,
      });
      return response;
    } catch (err: any) {
      if (err?.response?.status === 401 && authStore.token) {
        console.warn('[API] Auth token expired or unauthorized. Logging out.');
        authStore.logout();
        navigateTo('/login');
      }
      const errorMessage = err?.data?.error?.message || err?.message || 'An error occurred during request';
      throw new Error(errorMessage);
    }
  }

  return {
    get: <T = any>(endpoint: string, query?: Record<string, any>) =>
      request<T>(endpoint, { method: 'GET', query }),
    post: <T = any>(endpoint: string, body?: any) =>
      request<T>(endpoint, { method: 'POST', body }),
    put: <T = any>(endpoint: string, body?: any) =>
      request<T>(endpoint, { method: 'PUT', body }),
    patch: <T = any>(endpoint: string, body?: any) =>
      request<T>(endpoint, { method: 'PATCH', body }),
    delete: <T = any>(endpoint: string) =>
      request<T>(endpoint, { method: 'DELETE' }),
  };
}
