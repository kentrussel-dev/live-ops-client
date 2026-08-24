<template>
  <header class="h-11 bg-ops-surface border-b border-ops-border px-3.5 flex items-center justify-between select-none z-30 sticky top-0">
    <!-- Left: Brand / System Status & Live UTC Clock -->
    <div class="flex items-center gap-4 min-w-0">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-sm bg-ops-blue shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
        <span class="font-mono font-bold text-xs tracking-wider text-ops-text-bright uppercase">Aetheria Ops</span>
        <span class="text-xs px-1.5 py-0.2 font-mono bg-ops-canvas text-ops-text-dim border border-ops-border rounded text-2xs uppercase">{{ runtimeEnvShort }}</span>
      </div>

      <div class="h-3.5 w-px bg-ops-border hidden sm:block" />

      <!-- Live UTC Clock -->
      <div class="hidden md:flex items-center gap-1.5 text-xs font-mono text-ops-text-dim tabular-nums">
        <span class="text-ops-text-dim">UTC:</span>
        <span class="text-ops-text-bright font-semibold">{{ currentUtcTime }}</span>
      </div>

      <!-- Live Fleet Health (Only if real servers are provisioned) -->
      <template v-if="authStore.isAuthenticated && serversStore.fleetSummary.totalServers > 0">
        <div class="h-3.5 w-px bg-ops-border hidden lg:block" />
        <div class="hidden lg:flex items-center gap-2 text-2xs font-mono text-ops-text-dim">
          <span>FLEET:</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ serversStore.fleetSummary.onlineServers }}/{{ serversStore.fleetSummary.totalServers }} Online</span>
          <span class="text-ops-text-dim">({{ serversStore.fleetSummary.avgPingMs }}ms)</span>
        </div>
      </template>
    </div>

    <!-- Right: Critical Incident Beacon, Notification/Discuss Dropdown, & User Account Dropdown -->
    <div class="flex items-center gap-2.5">
      <!-- Critical Blocker Ticker (Only when authenticated) -->
      <NuxtLink
        v-if="authStore.isAuthenticated && criticalCount > 0"
        to="/issues"
        class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-2xs font-mono animate-pulse hover:bg-rose-900 transition"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <span>{{ criticalCount }} CRITICAL BLOCKER{{ criticalCount > 1 ? 'S' : '' }}</span>
      </NuxtLink>

      <!-- Discuss & Notifications Dropdown Trigger (Matching Image 3) -->
      <div v-if="authStore.isAuthenticated" class="relative" ref="notifRef">
        <button
          @click="toggleNotifMenu"
          class="flex items-center gap-1.5 px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded text-xs transition"
          title="Notifications & Discuss"
        >
          <span class="font-mono text-ops-blue-glow font-bold text-xs">💬</span>
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="px-1.5 py-0.2 rounded-full text-3xs font-mono font-bold bg-ops-blue text-white shadow-sm"
          >
            {{ notificationsStore.unreadCount }}
          </span>
        </button>

        <!-- Notification Popover Dropdown (Image 3) -->
        <div
          v-if="showNotifMenu"
          class="absolute right-0 mt-1 w-80 sm:w-96 bg-ops-surface border border-ops-border rounded-lg shadow-2xl z-50 text-xs font-sans overflow-hidden flex flex-col max-h-[480px]"
        >
          <!-- Popover Top Header & Tabs (All / Chat / Channels) -->
          <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
            <div class="flex items-center gap-1">
              <button
                v-for="tab in (['All', 'Chat', 'Channels'] as const)"
                :key="tab"
                @click="notifTab = tab"
                :class="[
                  'px-2.5 py-1 rounded text-2xs font-mono font-bold transition',
                  notifTab === tab
                    ? 'bg-ops-blue text-white'
                    : 'text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface'
                ]"
              >
                {{ tab }}
              </button>
            </div>

            <button
              v-if="notificationsStore.unreadCount > 0"
              @click="notificationsStore.markAllAsRead"
              class="text-3xs font-mono text-ops-text-dim hover:text-ops-text-bright hover:underline"
            >
              Mark all read
            </button>
          </div>

          <!-- Notification Items Scrollable Body -->
          <div class="overflow-y-auto divide-y divide-ops-border flex-1">
            <div
              v-if="filteredPopoverNotifications.length === 0"
              class="p-6 text-center text-ops-text-dim text-xs"
            >
              No unread notifications in {{ notifTab }}
            </div>

            <div
              v-for="item in filteredPopoverNotifications"
              :key="item._id"
              @click="handleNotificationClick(item)"
              :class="[
                'p-3 hover:bg-ops-surface-hover cursor-pointer transition flex items-start justify-between gap-2.5',
                !item.isRead ? 'bg-ops-surface/80 font-medium' : 'opacity-75'
              ]"
            >
              <div class="flex items-start gap-2.5 min-w-0">
                <div class="w-6 h-6 rounded bg-ops-obsidian border border-ops-border text-3xs font-mono font-bold flex items-center justify-center text-ops-blue-glow shrink-0 mt-0.5">
                  {{ item.type === 'ticket_assigned' ? 'TASK' : item.type === 'direct_message' ? 'DM' : 'SYS' }}
                </div>
                <div class="min-w-0 space-y-0.5">
                  <div class="text-xs font-bold text-ops-text-bright truncate">{{ item.title }}</div>
                  <div class="text-2xs text-ops-text-dim line-clamp-2 leading-tight">{{ item.message }}</div>
                  <div class="text-3xs font-mono text-ops-text-dark">{{ formatRelative(item.createdAt) }}</div>
                </div>
              </div>

              <!-- Checkmark Mark As Read -->
              <button
                v-if="!item.isRead"
                @click.stop="notificationsStore.markAsRead(item._id)"
                class="p-1 rounded hover:bg-ops-canvas text-ops-text-dim hover:text-ops-text-bright text-xs shrink-0 font-mono"
                title="Mark as read"
              >
                ✓
              </button>
            </div>
          </div>

          <!-- Popover Footer Action Links -->
          <div class="p-2 border-t border-ops-border bg-ops-subtle flex items-center justify-between text-2xs font-mono">
            <NuxtLink
              to="/inbox"
              @click="showNotifMenu = false"
              class="text-ops-blue-glow hover:underline"
            >
              Open Full Inbox ({{ notificationsStore.notifications.length }}) →
            </NuxtLink>

            <NuxtLink
              to="/discuss"
              @click="showNotifMenu = false"
              class="text-ops-text-dim hover:text-ops-text-bright hover:underline"
            >
              Open Discuss Hub →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Authenticated User Profile Menu -->
      <div v-if="authStore.user" class="relative" ref="menuRef">
        <!-- Trigger Button: RO Avatar + Username + Arrow -->
        <button
          @click="toggleUserMenu"
          class="flex items-center gap-2 p-1 pl-2 pr-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded text-xs transition"
        >
          <div class="w-5 h-5 rounded bg-ops-subtle border border-ops-border flex items-center justify-center font-mono font-bold text-2xs text-ops-blue-glow overflow-hidden shrink-0">
            <img v-if="authStore.user.avatarUrl" :src="authStore.user.avatarUrl" :alt="authStore.user.username" class="w-full h-full object-cover" />
            <span v-else>{{ authStore.user.username.slice(0, 2).toUpperCase() }}</span>
          </div>

          <span class="text-xs font-semibold text-ops-text-bright font-mono block leading-tight">{{ authStore.user.username }}</span>

          <span class="text-3xs text-ops-text-dim">▼</span>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-1 w-60 bg-ops-surface border border-ops-border rounded-lg shadow-2xl p-2 z-50 text-xs font-sans space-y-1"
        >
          <!-- User Info Header -->
          <div class="p-2 border-b border-ops-border mb-1">
            <div class="flex items-center justify-between gap-1">
              <span class="font-bold text-ops-text-bright text-xs font-mono">{{ authStore.user.username }}</span>
              <span class="px-1.5 py-0.2 rounded text-3xs font-mono font-semibold uppercase bg-ops-canvas text-ops-text-dim border border-ops-border">
                {{ authStore.role === 'liveops_editor' ? 'Editor' : authStore.role === 'readonly_viewer' ? 'QA Viewer' : 'Admin' }}
              </span>
            </div>
            <div class="text-2xs text-ops-text-dim truncate">{{ authStore.user.email }}</div>
            <div class="text-2xs font-mono text-ops-text-dim mt-1 flex items-center gap-1">
              <span>Dept:</span>
              <span class="text-ops-text-bright">{{ authStore.user.department }}</span>
            </div>
          </div>

          <!-- Menu Items List -->
          <div class="space-y-0.5">
            <!-- Theme Menu Item with Flyout Side-Panel Dropdown & Hover Delay -->
            <div
              class="relative"
              @mouseenter="handleThemeMouseEnter"
              @mouseleave="handleThemeMouseLeave"
            >
              <button
                type="button"
                @click.stop="toggleThemePanel"
                class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded flex items-center justify-between transition"
              >
                <span>Theme</span>
                <span class="font-mono text-2xs text-ops-text-dim">◂</span>
              </button>

              <!-- Secondary Flyout Panel (Dropdown within Dropdown with bridge hit-area) -->
              <div
                v-if="showThemePanel"
                @mouseenter="handleThemeMouseEnter"
                @mouseleave="handleThemeMouseLeave"
                class="absolute right-full top-0 -mr-1 pr-2 w-48 z-50 pointer-events-auto"
              >
                <div class="bg-ops-surface border border-ops-border rounded-lg shadow-2xl p-2 text-xs font-sans space-y-2">
                  <!-- Dark / Light Segmented Switcher -->
                  <div class="grid grid-cols-2 gap-1 bg-ops-obsidian p-0.5 rounded border border-ops-border">
                    <button
                      type="button"
                      @click.stop="theme.setMode('dark')"
                      :class="[
                        'py-1 text-3xs font-bold font-mono rounded transition text-center',
                        theme.currentMode.value === 'dark'
                          ? 'bg-ops-surface text-ops-text-bright border border-ops-border shadow'
                          : 'text-ops-text-dim hover:text-ops-text-bright'
                      ]"
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      @click.stop="theme.setMode('light')"
                      :class="[
                        'py-1 text-3xs font-bold font-mono rounded transition text-center',
                        theme.currentMode.value === 'light'
                          ? 'bg-ops-surface text-ops-text-bright border border-ops-border shadow'
                          : 'text-ops-text-dim hover:text-ops-text-bright'
                      ]"
                    >
                      Light
                    </button>
                  </div>

                  <!-- 4 Color Palettes -->
                  <div class="space-y-1">
                    <div class="text-3xs font-mono text-ops-text-dim uppercase tracking-wider px-1">Palette</div>
                    <button
                      v-for="t in themeList"
                      :key="t.id"
                      type="button"
                      @click.stop="theme.setTheme(t.id)"
                      :class="[
                        'w-full text-left px-2 py-1 text-2xs rounded flex items-center justify-between transition',
                        theme.currentTheme.value === t.id
                          ? 'bg-ops-blue/20 text-ops-text-bright font-bold border border-ops-blue/40'
                          : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright'
                      ]"
                    >
                      <span>{{ t.name }}</span>
                      <span v-if="theme.currentTheme.value === t.id" class="text-ops-blue-glow font-mono">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Discuss Hub Direct Link -->
            <NuxtLink
              to="/discuss"
              @click="showUserMenu = false"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded flex items-center justify-between transition"
            >
              <span>Discuss Hub</span>
              <span class="text-3xs font-mono text-ops-text-dim">💬</span>
            </NuxtLink>

            <!-- Operator Inbox Direct Link -->
            <NuxtLink
              to="/inbox"
              @click="showUserMenu = false"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded flex items-center justify-between transition"
            >
              <span>Operator Inbox</span>
              <span v-if="notificationsStore.unreadCount > 0" class="px-1.5 py-0.2 rounded-full text-3xs font-mono font-bold bg-ops-blue text-white">
                {{ notificationsStore.unreadCount }}
              </span>
            </NuxtLink>

            <!-- User Admin Link (Only for admin) -->
            <NuxtLink
              v-if="authStore.isAdmin"
              to="/admin/users"
              @click="showUserMenu = false"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded flex items-center justify-between transition"
            >
              <span>Operator Management</span>
            </NuxtLink>

            <div class="h-px bg-ops-border my-1" />

            <button
              type="button"
              @click="handleLogout"
              class="w-full text-left px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded flex items-center justify-between transition"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Guest State (Theme picker + Login) -->
      <div v-else class="flex items-center gap-2">
        <div class="relative" ref="loggedOutThemeRef">
          <button
            type="button"
            @click="showLoggedOutTheme = !showLoggedOutTheme"
            class="p-1 px-2 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded text-xs text-ops-text-dim hover:text-ops-text-bright font-mono transition flex items-center gap-1.5"
          >
            <span>Theme</span>
            <span class="text-3xs">▼</span>
          </button>

          <div
            v-if="showLoggedOutTheme"
            class="absolute right-0 mt-1 w-48 bg-ops-surface border border-ops-border rounded-lg shadow-2xl p-2 z-50 text-xs font-sans space-y-2"
          >
            <div class="grid grid-cols-2 gap-1 bg-ops-obsidian p-0.5 rounded border border-ops-border">
              <button
                type="button"
                @click="theme.setMode('dark')"
                :class="[
                  'py-1 text-3xs font-bold font-mono rounded transition text-center',
                  theme.currentMode.value === 'dark'
                    ? 'bg-ops-surface text-ops-text-bright border border-ops-border shadow'
                    : 'text-ops-text-dim hover:text-ops-text-bright'
                ]"
              >
                Dark
              </button>
              <button
                type="button"
                @click="theme.setMode('light')"
                :class="[
                  'py-1 text-3xs font-bold font-mono rounded transition text-center',
                  theme.currentMode.value === 'light'
                    ? 'bg-ops-surface text-ops-text-bright border border-ops-border shadow'
                    : 'text-ops-text-dim hover:text-ops-text-bright'
                ]"
              >
                Light
              </button>
            </div>

            <div class="space-y-1">
              <div class="text-3xs font-mono text-ops-text-dim uppercase tracking-wider px-1">Palette</div>
              <button
                v-for="t in themeList"
                :key="t.id"
                type="button"
                @click="theme.setTheme(t.id)"
                :class="[
                  'w-full text-left px-2 py-1 text-2xs rounded flex items-center justify-between transition',
                  theme.currentTheme.value === t.id
                    ? 'bg-ops-blue/20 text-ops-text-bright font-bold border border-ops-blue/40'
                    : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright'
                ]"
              >
                <span>{{ t.name }}</span>
                <span v-if="theme.currentTheme.value === t.id" class="text-ops-blue-glow font-mono">✓</span>
              </button>
            </div>
          </div>
        </div>

        <NuxtLink
          to="/login"
          class="px-3 py-1 bg-ops-blue hover:bg-ops-blue-glow text-white text-xs font-mono font-bold rounded transition"
        >
          Sign In
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useIssuesStore } from '~/stores/issues';
import { useServersStore } from '~/stores/servers';
import { useNotificationsStore } from '~/stores/notifications';
import { useTheme, type ThemeFamily } from '~/composables/useTheme';
import { useToast } from '~/composables/useToast';
import { formatDistanceToNow } from 'date-fns';

const authStore = useAuthStore();
const issuesStore = useIssuesStore();
const serversStore = useServersStore();
const notificationsStore = useNotificationsStore();
const theme = useTheme();
const toast = useToast();

const showUserMenu = ref(false);
const showThemePanel = ref(false);
const showNotifMenu = ref(false);
const showLoggedOutTheme = ref(false);
const notifTab = ref<'All' | 'Chat' | 'Channels'>('All');

const menuRef = ref<HTMLElement | null>(null);
const notifRef = ref<HTMLElement | null>(null);
const loggedOutThemeRef = ref<HTMLElement | null>(null);

let themeCloseTimer: any = null;

const currentUtcTime = ref('');
let timer: any = null;

const themeList = [
  { id: 'tech-slate' as ThemeFamily, name: 'Slate' },
  { id: 'emerald' as ThemeFamily, name: 'Emerald' },
  { id: 'cyberpunk' as ThemeFamily, name: 'Rose' },
  { id: 'amethyst' as ThemeFamily, name: 'Amethyst' },
];

const criticalCount = computed(() => issuesStore.stats.criticalBlockers || 0);

const runtimeEnvShort = computed(() => {
  const config = useRuntimeConfig();
  const env = (config.public?.environment as string) || (process.env.NODE_ENV === 'production' ? 'PROD' : 'PROD');
  return env.slice(0, 4).toUpperCase();
});

const filteredPopoverNotifications = computed(() => {
  if (notifTab.value === 'All') return notificationsStore.notifications.slice(0, 10);
  if (notifTab.value === 'Chat') {
    return notificationsStore.notifications
      .filter((n) => n.type === 'direct_message' || n.type === 'mention')
      .slice(0, 10);
  }
  return notificationsStore.notifications
    .filter((n) => n.type === 'ticket_assigned' || n.type === 'status_change')
    .slice(0, 10);
});

function updateClock() {
  const d = new Date();
  const iso = d.toISOString().replace('T', ' ').slice(0, 19);
  currentUtcTime.value = iso;
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) {
    showNotifMenu.value = false;
  }
  if (!showUserMenu.value) {
    showThemePanel.value = false;
    if (themeCloseTimer) {
      clearTimeout(themeCloseTimer);
      themeCloseTimer = null;
    }
  }
}

function toggleNotifMenu() {
  showNotifMenu.value = !showNotifMenu.value;
  if (showNotifMenu.value) {
    showUserMenu.value = false;
    notificationsStore.fetchNotifications();
  }
}

function handleNotificationClick(item: any) {
  notificationsStore.markAsRead(item._id);
  showNotifMenu.value = false;

  if (item.entityType === 'issue' || item.type === 'ticket_assigned') {
    if (item.entityId) {
      navigateTo(`/issues/${item.entityId}`);
    } else {
      navigateTo('/issues');
    }
  } else if (item.type === 'direct_message') {
    if (item.sender?._id) {
      navigateTo(`/discuss?dm=${item.sender._id}`);
    } else if (item.entityId) {
      navigateTo(`/discuss?channel=${item.entityId}`);
    } else {
      navigateTo('/discuss');
    }
  } else if (item.entityType === 'channel') {
    if (item.entityId) {
      navigateTo(`/discuss?channel=${item.entityId}`);
    } else {
      navigateTo('/discuss');
    }
  } else {
    navigateTo('/inbox');
  }
}

function formatRelative(ts: string) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch (_) {
    return ts;
  }
}

function handleThemeMouseEnter() {
  if (themeCloseTimer) {
    clearTimeout(themeCloseTimer);
    themeCloseTimer = null;
  }
  showThemePanel.value = true;
}

function handleThemeMouseLeave() {
  if (themeCloseTimer) clearTimeout(themeCloseTimer);
  themeCloseTimer = setTimeout(() => {
    showThemePanel.value = false;
  }, 1000);
}

function toggleThemePanel() {
  if (themeCloseTimer) {
    clearTimeout(themeCloseTimer);
    themeCloseTimer = null;
  }
  showThemePanel.value = !showThemePanel.value;
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    showUserMenu.value = false;
    showThemePanel.value = false;
    if (themeCloseTimer) {
      clearTimeout(themeCloseTimer);
      themeCloseTimer = null;
    }
  }
  if (notifRef.value && !notifRef.value.contains(e.target as Node)) {
    showNotifMenu.value = false;
  }
  if (loggedOutThemeRef.value && !loggedOutThemeRef.value.contains(e.target as Node)) {
    showLoggedOutTheme.value = false;
  }
}

onMounted(() => {
  theme.initTheme();
  updateClock();
  timer = setInterval(updateClock, 1000);
  document.addEventListener('click', handleClickOutside);
  if (authStore.isAuthenticated) {
    notificationsStore.fetchUnreadCount();
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (themeCloseTimer) clearTimeout(themeCloseTimer);
  document.removeEventListener('click', handleClickOutside);
});

function handleLogout() {
  showUserMenu.value = false;
  showThemePanel.value = false;
  showNotifMenu.value = false;
  if (themeCloseTimer) {
    clearTimeout(themeCloseTimer);
    themeCloseTimer = null;
  }
  authStore.logout();
  toast.info('Session Terminated', 'You have been signed out.');
  navigateTo('/login');
}
</script>
