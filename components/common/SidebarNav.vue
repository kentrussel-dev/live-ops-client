<template>
  <aside class="w-56 bg-ops-surface border-r border-ops-border flex flex-col justify-between select-none shrink-0 h-[calc(100vh-2.75rem)] sticky top-11">
    <!-- Navigation Links -->
    <div class="p-2 space-y-3 overflow-y-auto">
      <!-- Section 1: Content Operations -->
      <div class="space-y-1">
        <div class="px-2.5 py-1 text-2xs font-mono font-semibold uppercase tracking-wider text-ops-text-dark">
          Content Operations
        </div>

        <NuxtLink
          v-for="item in contentNavItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition group',
            isActive(item.path)
              ? 'bg-ops-blue/20 text-ops-text-bright font-semibold border-l-2 border-ops-blue-glow'
              : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright border-l-2 border-transparent'
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-2xs opacity-50">{{ item.code }}</span>
            <span class="truncate">{{ item.label }}</span>
          </div>

          <span
            v-if="item.badge !== undefined"
            :class="[
              'text-2xs px-1.5 py-0.2 rounded font-mono font-bold',
              item.badgeAlert
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-ops-border text-ops-text-dim'
            ]"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </div>

      <!-- Section 2: Technical Server Infrastructure & SRE -->
      <div class="space-y-1 pt-2 border-t border-ops-border/60">
        <div class="px-2.5 py-1 text-2xs font-mono font-semibold uppercase tracking-wider text-emerald-400/80 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Server Infrastructure</span>
        </div>

        <NuxtLink
          v-for="item in infraNavItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition group',
            isActive(item.path)
              ? 'bg-emerald-950/40 text-emerald-300 font-semibold border-l-2 border-emerald-400'
              : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright border-l-2 border-transparent'
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-2xs opacity-50">{{ item.code }}</span>
            <span class="truncate">{{ item.label }}</span>
          </div>

          <span
            v-if="item.badge !== undefined"
            :class="[
              'text-2xs px-1.5 py-0.2 rounded font-mono font-bold',
              item.isAdminBadge
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            ]"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Bottom System Health Block -->
    <div class="p-3 border-t border-ops-border bg-ops-obsidian/40 text-2xs font-mono space-y-1.5 shrink-0">
      <div class="flex items-center justify-between text-ops-text-dim">
        <span>GATEWAY:</span>
        <span class="text-emerald-400 font-semibold flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      </div>
      <div class="flex items-center justify-between text-ops-text-dim">
        <span>CLIENT BUILD:</span>
        <span class="text-ops-text-bright">240.108</span>
      </div>
      <div class="flex items-center justify-between text-ops-text-dim">
        <span>ENVIRONMENT:</span>
        <span class="text-amber-400 font-medium">PRODUCTION</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useEventsStore } from '~/stores/events';
import { useIssuesStore } from '~/stores/issues';
import { useShopStore } from '~/stores/shop';
import { useServersStore } from '~/stores/servers';

const route = useRoute();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const issuesStore = useIssuesStore();
const shopStore = useShopStore();
const serversStore = useServersStore();

function isActive(path: string) {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
}

const contentNavItems = computed(() => [
  { code: '01', label: 'Ops Matrix', path: '/' },
  { code: '02', label: 'Game Events', path: '/events', badge: eventsStore.events.filter((e) => e.status === 'active').length || undefined },
  { code: '03', label: 'Patch Notes', path: '/patches' },
  { code: '04', label: 'Shop Rotation', path: '/shop', badge: shopStore.items.filter((i) => i.rotationStatus === 'flash_sale').length || undefined },
  { code: '05', label: 'Known Issues', path: '/issues', badge: issuesStore.stats.criticalBlockers || undefined, badgeAlert: (issuesStore.stats.criticalBlockers || 0) > 0 },
  { code: '06', label: 'Audit Trail', path: '/audit' },
]);

const infraNavItems = computed(() => {
  const items = [
    {
      code: '07',
      label: 'Game Servers',
      path: '/servers',
      badge: `${serversStore.fleetSummary.onlineServers}/${serversStore.fleetSummary.totalServers}`,
    },
  ];

  if (authStore.isAdmin) {
    items.push({
      code: '08',
      label: 'Operator Accounts',
      path: '/admin/users',
      badge: 'ADMIN',
      isAdminBadge: true,
    } as any);
  }

  return items;
});
</script>
