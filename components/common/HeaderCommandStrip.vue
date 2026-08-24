<template>
  <header class="h-11 bg-ops-surface border-b border-ops-border px-3.5 flex items-center justify-between select-none z-30 sticky top-0">
    <!-- Left: Brand / System Status & Live UTC Clock -->
    <div class="flex items-center gap-4 min-w-0">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-sm bg-ops-blue shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
        <span class="font-mono font-bold text-xs tracking-wider text-ops-text-bright uppercase">Aetheria Ops</span>
        <span class="text-xs px-1.5 py-0.2 font-mono bg-ops-canvas text-ops-text-dim border border-ops-border rounded text-2xs">PROD</span>
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

    <!-- Right: Critical Incident Beacon & User Account Dropdown -->
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

                  <!-- 4 Simple Theme Words (No color dots, pure clean names) -->
                  <div class="space-y-0.5">
                    <button
                      v-for="t in themeList"
                      :key="t.id"
                      type="button"
                      @click.stop="theme.setTheme(t.id)"
                      :class="[
                        'w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition flex items-center justify-between',
                        theme.currentTheme.value === t.id
                          ? 'bg-ops-obsidian text-ops-blue-glow font-bold border border-ops-border'
                          : 'text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover'
                      ]"
                    >
                      <span>{{ t.name }}</span>
                      <span v-if="theme.currentTheme.value === t.id" class="text-xs">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Standard Clean Navigation Links -->
            <NuxtLink
              v-if="authStore.isAdmin"
              to="/admin/users"
              @click="showUserMenu = false; showThemePanel = false;"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded block transition"
            >
              Manage Operator Accounts
            </NuxtLink>

            <NuxtLink
              to="/servers"
              @click="showUserMenu = false; showThemePanel = false;"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded block transition"
            >
              Game Server Infrastructure
            </NuxtLink>

            <NuxtLink
              to="/audit"
              @click="showUserMenu = false; showThemePanel = false;"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded block transition"
            >
              Operator Activity Trail
            </NuxtLink>

            <button
              @click="handleLogout"
              class="w-full text-left px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded block transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <!-- If Logged Out: Minimal Theme & Sign In -->
      <div v-else class="flex items-center gap-2">
        <div class="relative" ref="loggedOutThemeRef">
          <button
            @click="showLoggedOutTheme = !showLoggedOutTheme"
            class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded text-2xs font-mono text-ops-text-dim hover:text-ops-text-bright transition flex items-center gap-1.5"
          >
            <span>Theme</span>
            <span class="text-3xs">▼</span>
          </button>

          <!-- Logged Out Dropdown Panel -->
          <div
            v-if="showLoggedOutTheme"
            class="absolute right-0 mt-1 w-44 bg-ops-surface border border-ops-border rounded-lg shadow-2xl p-2 z-50 text-xs font-sans space-y-2"
          >
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

            <div class="space-y-0.5">
              <button
                v-for="t in themeList"
                :key="t.id"
                type="button"
                @click.stop="theme.setTheme(t.id)"
                :class="[
                  'w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition flex items-center justify-between',
                  theme.currentTheme.value === t.id
                    ? 'bg-ops-obsidian text-ops-blue-glow font-bold border border-ops-border'
                    : 'text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover'
                ]"
              >
                <span>{{ t.name }}</span>
                <span v-if="theme.currentTheme.value === t.id" class="text-xs">✓</span>
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
import { useTheme, type ThemeFamily } from '~/composables/useTheme';
import { useToast } from '~/composables/useToast';

const authStore = useAuthStore();
const issuesStore = useIssuesStore();
const serversStore = useServersStore();
const theme = useTheme();
const toast = useToast();

const showUserMenu = ref(false);
const showThemePanel = ref(false);
const showLoggedOutTheme = ref(false);
const menuRef = ref<HTMLElement | null>(null);
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

function updateClock() {
  const d = new Date();
  const iso = d.toISOString().replace('T', ' ').slice(0, 19);
  currentUtcTime.value = iso;
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
  if (!showUserMenu.value) {
    showThemePanel.value = false;
    if (themeCloseTimer) {
      clearTimeout(themeCloseTimer);
      themeCloseTimer = null;
    }
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
  // 1-second delay before disappearing
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
  if (loggedOutThemeRef.value && !loggedOutThemeRef.value.contains(e.target as Node)) {
    showLoggedOutTheme.value = false;
  }
}

onMounted(() => {
  theme.initTheme();
  updateClock();
  timer = setInterval(updateClock, 1000);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (themeCloseTimer) clearTimeout(themeCloseTimer);
  document.removeEventListener('click', handleClickOutside);
});

function handleLogout() {
  showUserMenu.value = false;
  showThemePanel.value = false;
  if (themeCloseTimer) {
    clearTimeout(themeCloseTimer);
    themeCloseTimer = null;
  }
  authStore.logout();
  toast.info('Session Terminated', 'You have been signed out.');
  navigateTo('/login');
}
</script>
