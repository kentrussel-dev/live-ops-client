import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useServersStore } from '../../stores/servers';

describe('useServersStore (Technical Game Server Fleet)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with empty server array and zero summary', () => {
    const store = useServersStore();
    expect(store.servers).toEqual([]);
    expect(store.fleetSummary.totalServers).toBe(0);
    expect(store.fleetSummary.totalCcu).toBe(0);
  });

  it('manages technical server nodes correctly', () => {
    const store = useServersStore();
    store.servers = [
      {
        _id: '1',
        serverId: 'srv-useast-01',
        name: 'US-East Dedicated 01',
        host: '198.51.100.24:7777',
        region: 'US-East',
        status: 'online',
        currentPlayers: 4500,
        maxPlayers: 5000,
        pingMs: 18,
        tickRateHz: 60.0,
        cpuUsagePct: 62.0,
        memoryUsagePct: 55.0,
        bandwidthMbps: 450,
        lockedForLogins: false,
        uptimeSeconds: 86400,
        lastHeartbeat: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    expect(store.servers.length).toBe(1);
    expect(store.servers[0].host).toBe('198.51.100.24:7777');
    expect(store.servers[0].pingMs).toBe(18);
  });
});
