import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IUser, UserRole } from '../../shared/types';

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = typeof useCookie === 'function'
    ? useCookie<string | null>('aetheria_ops_token', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
    : ref<string | null>(null);

  const userCookie = typeof useCookie === 'function'
    ? useCookie<IUser | null>('aetheria_ops_user', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
    : ref<IUser | null>(null);

  const token = ref<string | null>(tokenCookie.value || null);
  const user = ref<IUser | null>(userCookie.value || null);
  const operators = ref<IUser[]>([]);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const role = computed<UserRole>(() => user.value?.role || 'readonly_viewer');
  const canEdit = computed(() => role.value === 'liveops_editor' || role.value === 'admin');
  const isAdmin = computed(() => role.value === 'admin');
  const isViewerOnly = computed(() => role.value === 'readonly_viewer');

  function init() {
    if (tokenCookie.value && userCookie.value) {
      token.value = tokenCookie.value;
      user.value = userCookie.value;
    }
  }

  function setAuth(newToken: string, newUser: IUser, rememberMe: boolean = true) {
    token.value = newToken;
    user.value = newUser;
    if (typeof useCookie === 'function') {
      const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days vs 1 day
      const tCookie = useCookie<string | null>('aetheria_ops_token', { maxAge, sameSite: 'lax' });
      const uCookie = useCookie<IUser | null>('aetheria_ops_user', { maxAge, sameSite: 'lax' });
      tCookie.value = newToken;
      uCookie.value = newUser;
    } else {
      tokenCookie.value = newToken;
      userCookie.value = newUser;
    }
  }

  async function login(email: string, password: string, rememberMe: boolean = true): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        setAuth(res.data.token, res.data.user, rememberMe);
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Authentication failed' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Invalid email or password' };
    } finally {
      isLoading.value = false;
    }
  }

  async function bootstrapWithMasterKey(payload: {
    masterKey: string;
    username: string;
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.post('/auth/master-bootstrap', {
        masterKey: payload.masterKey,
        username: payload.username,
        email: payload.email,
        password: payload.password,
      });
      if (res.success && res.data) {
        setAuth(res.data.token, res.data.user, payload.rememberMe !== false);
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Master Key validation failed' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Invalid Master Key' };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCurrentUser(): Promise<boolean> {
    if (!token.value) return false;
    try {
      const api = useApi();
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        user.value = res.data.user;
        userCookie.value = res.data.user;
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  }

  async function fetchOperators(): Promise<void> {
    try {
      const api = useApi();
      const res = await api.get('/auth/users');
      if (res.success && res.data?.users) {
        operators.value = res.data.users;
      }
    } catch (err) {
      console.error('[fetchOperators Error]:', err);
    }
  }

  async function createOperator(payload: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    department: string;
  }): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.post('/auth/users', payload);
      if (res.success) {
        await fetchOperators();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to create operator' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Failed to create operator' };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteOperator(id: string): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.delete(`/auth/users/${id}`);
      if (res.success) {
        operators.value = operators.value.filter((o) => o._id !== id);
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to delete operator' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Failed to delete operator' };
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    operators.value = [];
    tokenCookie.value = null;
    userCookie.value = null;
  }

  return {
    token,
    user,
    role,
    operators,
    isLoading,
    isAuthenticated,
    canEdit,
    isAdmin,
    isViewerOnly,
    init,
    setAuth,
    login,
    bootstrapWithMasterKey,
    fetchCurrentUser,
    fetchOperators,
    createOperator,
    deleteOperator,
    logout,
  };
});
