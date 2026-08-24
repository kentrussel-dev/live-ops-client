import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IGameServer, IFleetSummary, ServerNodeStatus, ServerRegion } from '../../shared/types';

export const useServersStore = defineStore('servers', () => {
  const servers = ref<IGameServer[]>([]);
  const fleetSummary = ref<IFleetSummary>({
    totalServers: 0,
    onlineServers: 0,
    totalCcu: 0,
    totalCapacity: 0,
    utilizationPct: 0,
    avgPingMs: 0,
    avgTickRateHz: 60.0,
  });
  const isLoading = ref(false);

  async function fetchServers(): Promise<void> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.get('/servers');
      if (res.success && res.data) {
        servers.value = res.data.servers || [];
        fleetSummary.value = res.data.fleetSummary || fleetSummary.value;
      }
    } catch (err) {
      console.error('[fetchServers Error]:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createServer(payload: {
    serverId: string;
    name: string;
    host: string;
    region: ServerRegion;
    maxPlayers: number;
    tickRateHz: number;
    pingMs: number;
  }): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.post('/servers', payload);
      if (res.success) {
        await fetchServers();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to provision game server' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Error provisioning server' };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateServer(id: string, payload: Partial<IGameServer>): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.put(`/servers/${id}`, payload);
      if (res.success && res.data?.server) {
        const idx = servers.value.findIndex((s) => s._id === id);
        if (idx !== -1) servers.value[idx] = res.data.server;
        await fetchServers();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to update game server' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Error updating server' };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateServerStatus(id: string, status: ServerNodeStatus): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.patch(`/servers/${id}/status`, { status });
      if (res.success && res.data?.server) {
        const idx = servers.value.findIndex((s) => s._id === id);
        if (idx !== -1) servers.value[idx] = res.data.server;
        await fetchServers();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to update server status' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Error updating status' };
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleServerDrain(id: string): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.patch(`/servers/${id}/drain`);
      if (res.success && res.data?.server) {
        const idx = servers.value.findIndex((s) => s._id === id);
        if (idx !== -1) servers.value[idx] = res.data.server;
        await fetchServers();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to toggle player drain' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Error toggling drain' };
    } finally {
      isLoading.value = false;
    }
  }

  async function rebootServer(id: string): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.post(`/servers/${id}/reboot`);
      if (res.success && res.data?.server) {
        const idx = servers.value.findIndex((s) => s._id === id);
        if (idx !== -1) servers.value[idx] = res.data.server;
        await fetchServers();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to reboot server' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Error rebooting server' };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteServer(id: string): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.delete(`/servers/${id}`);
      if (res.success) {
        servers.value = servers.value.filter((s) => s._id !== id);
        await fetchServers();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to decommission server' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Error deleting server' };
    } finally {
      isLoading.value = false;
    }
  }

  async function seedFleetPreset(): Promise<{ ok: boolean; error?: string }> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.post('/servers/preset');
      if (res.success) {
        await fetchServers();
        return { ok: true };
      }
      return { ok: false, error: res.error?.message || 'Failed to generate server fleet preset' };
    } catch (err: any) {
      return { ok: false, error: err?.data?.error?.message || err?.message || 'Error generating fleet preset' };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    servers,
    fleetSummary,
    isLoading,
    fetchServers,
    createServer,
    updateServer,
    updateServerStatus,
    toggleServerDrain,
    rebootServer,
    deleteServer,
    seedFleetPreset,
  };
});
