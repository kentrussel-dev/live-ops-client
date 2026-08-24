<template>
  <aside
    :style="{ width: isCollapsed ? '52px' : `${sidebarWidth}px` }"
    class="relative bg-ops-surface border-r border-ops-border flex flex-col justify-between select-none shrink-0 h-[calc(100vh-2.75rem)] sticky top-11 transition-[width] duration-150 ease-out"
  >
    <!-- Top Navigation & Toggle Bar with Browser-like Back and Forward Controls -->
    <div class="px-2 py-1.5 h-9 border-b border-ops-border flex items-center justify-between bg-ops-subtle gap-1.5">
      <!-- Browser History Navigation Buttons (Back & Forward) -->
      <div v-if="!isCollapsed" class="flex items-center gap-1">
        <button
          @click="handleNavigateBack"
          class="w-6 h-6 rounded bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright hover:text-ops-blue-glow transition flex items-center justify-center text-xs font-mono font-bold shadow-xs active:scale-95"
          title="Go Back to Previous Page (Browser Undo / Back)"
        >
          ←
        </button>

        <button
          @click="handleNavigateForward"
          class="w-6 h-6 rounded bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright hover:text-ops-blue-glow transition flex items-center justify-center text-xs font-mono font-bold shadow-xs active:scale-95"
          title="Go Forward to Next Page (Browser Redo / Forward)"
        >
          →
        </button>

        <span class="text-3xs font-mono font-bold uppercase tracking-wider text-ops-text-dim px-1 truncate">
          Subsystems
        </span>
      </div>

      <button
        @click="toggleCollapse"
        class="p-1 hover:bg-ops-surface-hover rounded text-ops-text-dim hover:text-ops-text-bright font-mono text-xs transition flex items-center justify-center"
        :class="isCollapsed ? 'w-full' : 'ml-auto'"
        :title="isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'"
      >
        <span v-if="isCollapsed">⇥</span>
        <span v-else>⇤</span>
      </button>
    </div>

    <!-- Navigation Links -->
    <div class="p-1.5 space-y-3 overflow-y-auto flex-1 overflow-x-hidden">
      <!-- Section 1: Content Operations -->
      <div class="space-y-1">
        <div
          v-if="!isCollapsed"
          class="px-2 py-1 text-2xs font-mono font-semibold uppercase tracking-wider text-ops-text-dim truncate"
        >
          Content Operations
        </div>

        <NuxtLink
          v-for="item in contentNavItems"
          :key="item.path"
          :to="item.path"
          :title="`${item.code} - ${item.label}`"
          :class="[
            'flex items-center rounded text-xs font-mono transition group relative',
            isCollapsed
              ? 'justify-center p-2'
              : 'justify-between px-2.5 py-1.5',
            isActive(item.path)
              ? 'bg-ops-blue/15 text-ops-text-bright font-semibold border-l-2 border-ops-blue'
              : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright border-l-2 border-transparent'
          ]"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              :class="[
                'font-mono font-bold text-2xs transition',
                isActive(item.path) ? 'text-ops-blue-glow' : 'opacity-60 group-hover:opacity-100'
              ]"
            >
              {{ item.code }}
            </span>
            <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
          </div>

          <!-- Full View Badge -->
          <span
            v-if="!isCollapsed && item.badge !== undefined"
            :class="[
              'text-2xs px-1.5 py-0.2 rounded font-mono font-bold shrink-0',
              item.badgeAlert
                ? 'dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800 bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-ops-canvas text-ops-text-dim border border-ops-border'
            ]"
          >
            {{ item.badge }}
          </span>

          <!-- Collapsed View Badge Dot Indicator -->
          <span
            v-if="isCollapsed && item.badge !== undefined"
            :class="[
              'absolute top-1 right-1 w-2 h-2 rounded-full',
              item.badgeAlert ? 'bg-rose-500 animate-pulse' : 'bg-ops-blue'
            ]"
          />
        </NuxtLink>
      </div>

      <!-- Section 2: Technical Server Infrastructure & SRE -->
      <div class="space-y-1 pt-2 border-t border-ops-border">
        <div
          v-if="!isCollapsed"
          class="px-2 py-1 text-2xs font-mono font-semibold uppercase tracking-wider text-ops-text-dim flex items-center gap-1 truncate"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-ops-blue shrink-0" />
          <span class="truncate">Server Infrastructure</span>
        </div>

        <NuxtLink
          v-for="item in infraNavItems"
          :key="item.path"
          :to="item.path"
          :title="`${item.code} - ${item.label}`"
          :class="[
            'flex items-center rounded text-xs font-mono transition group relative',
            isCollapsed
              ? 'justify-center p-2'
              : 'justify-between px-2.5 py-1.5',
            isActive(item.path)
              ? 'bg-ops-blue/15 text-ops-text-bright font-semibold border-l-2 border-ops-blue'
              : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright border-l-2 border-transparent'
          ]"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              :class="[
                'font-mono font-bold text-2xs transition',
                isActive(item.path) ? 'text-ops-blue-glow' : 'opacity-60 group-hover:opacity-100'
              ]"
            >
              {{ item.code }}
            </span>
            <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
          </div>

          <!-- Full View Badge -->
          <span
            v-if="!isCollapsed && item.badge !== undefined"
            :class="[
              'text-2xs px-1.5 py-0.2 rounded font-mono font-bold shrink-0',
              'bg-ops-canvas text-ops-blue-glow border border-ops-border'
            ]"
          >
            {{ item.badge }}
          </span>

          <!-- Collapsed View Badge Dot Indicator -->
          <span
            v-if="isCollapsed && item.badge !== undefined"
            class="absolute top-1 right-1 w-2 h-2 rounded-full bg-ops-blue"
          />
        </NuxtLink>
      </div>

      <!-- Section 3: Communications & Operator Workspace -->
      <div class="space-y-1 pt-2 border-t border-ops-border">
        <div
          v-if="!isCollapsed"
          class="px-2 py-1 text-2xs font-mono font-semibold uppercase tracking-wider text-ops-text-dim flex items-center gap-1 truncate"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span class="truncate">Workspace & Chat</span>
        </div>

        <NuxtLink
          v-for="item in commsNavItems"
          :key="item.path"
          :to="item.path"
          :title="`${item.code} - ${item.label}`"
          :class="[
            'flex items-center rounded text-xs font-mono transition group relative',
            isCollapsed
              ? 'justify-center p-2'
              : 'justify-between px-2.5 py-1.5',
            isActive(item.path)
              ? 'bg-ops-blue/15 text-ops-text-bright font-semibold border-l-2 border-ops-blue'
              : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright border-l-2 border-transparent'
          ]"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              :class="[
                'font-mono font-bold text-2xs transition',
                isActive(item.path) ? 'text-ops-blue-glow' : 'opacity-60 group-hover:opacity-100'
              ]"
            >
              {{ item.code }}
            </span>
            <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
          </div>

          <!-- Full View Badge -->
          <span
            v-if="!isCollapsed && item.badge !== undefined"
            :class="[
              'text-2xs px-1.5 py-0.2 rounded font-mono font-bold shrink-0',
              item.isAdminBadge
                ? 'bg-ops-canvas text-ops-text-dim border border-ops-border'
                : 'bg-ops-canvas text-ops-blue-glow border border-ops-border'
            ]"
          >
            {{ item.badge }}
          </span>

          <!-- Collapsed View Badge Dot Indicator -->
          <span
            v-if="isCollapsed && item.badge !== undefined"
            :class="[
              'absolute top-1 right-1 w-2 h-2 rounded-full',
              item.isAdminBadge ? 'bg-ops-text-dim' : 'bg-ops-blue'
            ]"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Bottom System Health Block (Expanded only) -->
    <div
      v-if="!isCollapsed"
      class="p-3 border-t border-ops-border bg-ops-canvas text-2xs font-mono space-y-1.5 shrink-0"
    >
      <div class="flex items-center justify-between text-ops-text-dim">
        <span>GATEWAY:</span>
        <span
          :class="[
            'font-semibold flex items-center gap-1',
            gatewayStatus === 'ONLINE'
              ? 'text-emerald-600 dark:text-emerald-400'
              : gatewayStatus === 'CONNECTING'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-rose-600 dark:text-rose-400'
          ]"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              gatewayStatus === 'ONLINE'
                ? 'bg-emerald-500 animate-pulse'
                : gatewayStatus === 'CONNECTING'
                ? 'bg-amber-500 animate-ping'
                : 'bg-rose-500'
            ]"
          />
          {{ gatewayStatus }}
        </span>
      </div>
      <div class="flex items-center justify-between text-ops-text-dim">
        <span>CLIENT BUILD:</span>
        <span class="text-ops-text-bright">{{ latestBuildVersion }}</span>
      </div>
      <div class="flex items-center justify-between text-ops-text-dim">
        <span>ENVIRONMENT:</span>
        <span class="text-amber-600 dark:text-amber-400 font-medium uppercase">{{ runtimeEnvironment }}</span>
      </div>
    </div>

    <!-- Collapsed Bottom Indicator -->
    <div
      v-else
      class="p-2 border-t border-ops-border bg-ops-canvas flex justify-center items-center text-2xs font-mono"
      :title="`Gateway: ${gatewayStatus}`"
    >
      <span
        :class="[
          'w-2 h-2 rounded-full',
          gatewayStatus === 'ONLINE'
            ? 'bg-emerald-500 animate-pulse'
            : gatewayStatus === 'CONNECTING'
            ? 'bg-amber-500 animate-ping'
            : 'bg-rose-500'
        ]"
      />
    </div>

    <!-- Draggable Resize Handle on Right Border -->
    <div
      v-if="!isCollapsed"
      @mousedown.prevent="startResize"
      class="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-ops-blue/60 active:bg-ops-blue transition select-none z-20 group"
      title="Drag to resize sidebar width"
    >
      <div class="w-0.5 h-8 bg-ops-border-light group-hover:bg-ops-blue absolute top-1/2 -translate-y-1/2 right-0.5 rounded" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useEventsStore } from '~/stores/events';
import { useIssuesStore } from '~/stores/issues';
import { useShopStore } from '~/stores/shop';
import { useServersStore } from '~/stores/servers';
import { useNotificationsStore } from '~/stores/notifications';
import { usePatchesStore } from '~/stores/patches';
import { useChatStore } from '~/stores/chat';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const eventsStore = useEventsStore();
const issuesStore = useIssuesStore();
const shopStore = useShopStore();
const serversStore = useServersStore();
const notificationsStore = useNotificationsStore();
const patchesStore = usePatchesStore();
const chatStore = useChatStore();

function handleNavigateBack() {
  if (process.client) {
    router.back();
  }
}

function handleNavigateForward() {
  if (process.client) {
    router.forward();
  }
}

const gatewayStatus = computed(() => {
  if (chatStore.isConnected) return 'ONLINE';
  return 'ONLINE';
});

const latestBuildVersion = computed(() => {
  const published = patchesStore.patches.find((p) => p.status === 'published');
  if (published?.clientBuildNumber) return published.clientBuildNumber;
  if (published?.version) return published.version;
  if (patchesStore.patches[0]?.clientBuildNumber) return patchesStore.patches[0].clientBuildNumber;
  return '240.108';
});

const runtimeEnvironment = computed(() => {
  const config = useRuntimeConfig();
  const env = (config.public?.environment as string) || (process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'PRODUCTION');
  return env.toUpperCase();
});

const isCollapsed = ref(false);
const sidebarWidth = ref(224);
const minWidth = 180;
const maxWidth = 380;

onMounted(() => {
  if (patchesStore.patches.length === 0) {
    patchesStore.fetchPatches();
  }
  if (process.client) {
    const savedCollapsed = localStorage.getItem('aetheria_sidebar_collapsed');
    if (savedCollapsed !== null) {
      isCollapsed.value = savedCollapsed === 'true';
    }
    const savedWidth = localStorage.getItem('aetheria_sidebar_width');
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        sidebarWidth.value = parsed;
      }
    }
  }
});

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  if (process.client) {
    localStorage.setItem('aetheria_sidebar_collapsed', String(isCollapsed.value));
  }
}

function startResize(e: MouseEvent) {
  if (isCollapsed.value) return;

  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  function onMouseMove(moveEvent: MouseEvent) {
    const newWidth = startWidth + (moveEvent.clientX - startX);
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth;
    }
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (process.client) {
      localStorage.setItem('aetheria_sidebar_width', String(sidebarWidth.value));
    }
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

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

const infraNavItems = computed(() => [
  {
    code: '07',
    label: 'Game Servers',
    path: '/servers',
    badge: `${serversStore.fleetSummary.onlineServers}/${serversStore.fleetSummary.totalServers}`,
  },
]);

const commsNavItems = computed(() => {
  const items = [
    {
      code: '08',
      label: 'Discuss Hub',
      path: '/discuss',
    },
    {
      code: '09',
      label: 'Operator Inbox',
      path: '/inbox',
      badge: notificationsStore.unreadCount || undefined,
    },
  ];

  if (authStore.isAdmin) {
    items.push({
      code: '10',
      label: 'Operator Accounts',
      path: '/admin/users',
      badge: 'ADMIN',
      isAdminBadge: true,
    } as any);
  }

  return items;
});
</script>
