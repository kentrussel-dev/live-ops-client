import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { INotification } from '../../shared/types';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<INotification[]>([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);

  async function fetchNotifications(filter?: { unreadOnly?: boolean; type?: string }): Promise<void> {
    isLoading.value = true;
    try {
      const api = useApi();
      const params = new URLSearchParams();
      if (filter?.unreadOnly) params.append('unreadOnly', 'true');
      if (filter?.type) params.append('type', filter.type);

      const res = await api.get(`/notifications?${params.toString()}`);
      if (res.success && res.data) {
        notifications.value = res.data.notifications || [];
        unreadCount.value = res.data.unreadCount || 0;
      }
    } catch (err) {
      console.error('[fetchNotifications Error]:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUnreadCount(): Promise<void> {
    try {
      const api = useApi();
      const res = await api.get('/notifications/unread-count');
      if (res.success && res.data) {
        unreadCount.value = res.data.unreadCount || 0;
      }
    } catch (err) {
      console.error('[fetchUnreadCount Error]:', err);
    }
  }

  async function markAsRead(id: string): Promise<void> {
    try {
      const api = useApi();
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.success) {
        const notif = notifications.value.find((n) => n._id === id);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (err) {
      console.error('[markAsRead Error]:', err);
    }
  }

  async function markAllAsRead(): Promise<void> {
    try {
      const api = useApi();
      const res = await api.post('/notifications/mark-all-read');
      if (res.success) {
        notifications.value.forEach((n) => {
          n.isRead = true;
        });
        unreadCount.value = 0;
      }
    } catch (err) {
      console.error('[markAllAsRead Error]:', err);
    }
  }

  function handleIncomingNotification(notif: INotification): void {
    notifications.value.unshift(notif);
    unreadCount.value += 1;
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    handleIncomingNotification,
  };
});
