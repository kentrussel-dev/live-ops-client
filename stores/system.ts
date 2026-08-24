import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IOperationalStats } from '../../shared/types';

export const useSystemStore = defineStore('system', () => {
  const stats = ref<IOperationalStats | null>(null);
  const recentAuditLogs = ref<any[]>([]);
  const serverTimeUtc = ref<string>(new Date().toISOString());
  const isLoading = ref(false);

  async function fetchOverview() {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.get('/system/overview');
      if (res.success && res.data) {
        stats.value = res.data.stats;
        recentAuditLogs.value = res.data.recentAuditLogs;
        serverTimeUtc.value = res.data.serverTimeUtc;
      }
    } catch (err) {
      console.error('[SystemStore] Failed to fetch system overview:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAuditLogs(entityType?: string) {
    try {
      const api = useApi();
      const query = entityType ? { entityType } : undefined;
      const res = await api.get('/system/audit-logs', query);
      if (res.success && res.data) {
        recentAuditLogs.value = res.data.logs;
      }
    } catch (err) {
      console.error('[SystemStore] Failed to fetch audit logs:', err);
    }
  }

  return {
    stats,
    recentAuditLogs,
    serverTimeUtc,
    isLoading,
    fetchOverview,
    fetchAuditLogs,
  };
});
