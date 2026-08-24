<template>
  <header class="h-11 bg-ops-surface border-b border-ops-border px-3.5 flex items-center justify-between select-none z-30 sticky top-0">
    <!-- Left: Brand / System Status & Live UTC Clock -->
    <div class="flex items-center gap-4 min-w-0">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-sm bg-ops-blue shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
        <span class="font-mono font-bold text-xs tracking-wider text-ops-text-bright uppercase">Aetheria Ops</span>
        <span class="text-xs px-1.5 py-0.2 font-mono bg-ops-border text-ops-text-dim rounded text-2xs">PROD</span>
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
          <span class="text-emerald-400 font-semibold">{{ serversStore.fleetSummary.onlineServers }}/{{ serversStore.fleetSummary.totalServers }} Online</span>
          <span class="text-ops-text-dim">({{ serversStore.fleetSummary.avgPingMs }}ms)</span>
        </div>
      </template>
    </div>

    <!-- Right: Critical Incident Beacon, Theme Palette Selector & User Account Dropdown -->
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

      <!-- Theme & 8-Color Palette Selector -->
      <CommonThemeSelector />

      <!-- Authenticated User Profile Menu -->
      <div v-if="authStore.user" class="relative">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 p-1 pl-2 pr-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded text-xs transition"
        >
          <div class="w-5 h-5 rounded bg-ops-subtle border border-ops-border flex items-center justify-center font-mono font-bold text-2xs text-ops-blue-glow overflow-hidden">
            <img v-if="authStore.user.avatarUrl" :src="authStore.user.avatarUrl" :alt="authStore.user.username" class="w-full h-full object-cover" />
            <span v-else>{{ authStore.user.username.slice(0, 2).toUpperCase() }}</span>
          </div>

          <div class="text-left font-mono">
            <span class="text-xs font-semibold text-ops-text-bright block leading-tight">{{ authStore.user.username }}</span>
          </div>

          <span
            :class="[
              'px-1.5 py-0.5 rounded text-2xs font-mono font-semibold uppercase',
              authStore.role === 'admin' ? 'bg-purple-950/80 text-purple-300 border border-purple-800' :
              authStore.role === 'liveops_editor' ? 'bg-blue-950/80 text-blue-300 border border-blue-800' :
              'bg-slate-800 text-slate-300 border border-slate-700'
            ]"
          >
            {{ authStore.role === 'liveops_editor' ? 'Editor' : authStore.role === 'readonly_viewer' ? 'QA Viewer' : 'Admin' }}
          </span>

          <span class="text-2xs text-ops-text-dim">▼</span>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-1 w-64 bg-ops-surface border border-ops-border rounded shadow-2xl p-2 z-50 text-xs font-sans"
        >
          <div class="p-2 border-b border-ops-border/60 mb-2">
            <div class="font-bold text-ops-text-bright text-xs font-mono">{{ authStore.user.username }}</div>
            <div class="text-2xs text-ops-text-dim truncate">{{ authStore.user.email }}</div>
            <div class="text-2xs font-mono text-ops-blue-glow mt-1 flex items-center gap-1">
              <span>Dept:</span>
              <span class="text-ops-text-base">{{ authStore.user.department }}</span>
            </div>
          </div>

          <div class="space-y-1">
            <NuxtLink
              v-if="authStore.isAdmin"
              to="/admin/users"
              @click="showUserMenu = false"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded flex items-center justify-between transition"
            >
              <span>Manage Operator Accounts</span>
              <span class="font-mono text-2xs text-purple-400">ADMIN</span>
            </NuxtLink>

            <NuxtLink
              to="/servers"
              @click="showUserMenu = false"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded flex items-center justify-between transition"
            >
              <span>Game Server Infrastructure</span>
              <span class="font-mono text-2xs text-emerald-400">SRE</span>
            </NuxtLink>

            <NuxtLink
              to="/audit"
              @click="showUserMenu = false"
              class="w-full text-left px-2.5 py-1.5 text-xs text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover rounded flex items-center justify-between transition"
            >
              <span>Operator Activity Trail</span>
              <span class="font-mono text-2xs text-ops-text-dim">→</span>
            </NuxtLink>

            <button
              @click="handleLogout"
              class="w-full text-left px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded flex items-center justify-between transition"
            >
              <span>Sign Out Session</span>
              <span class="font-mono text-2xs">⎋</span>
            </button>
          </div>
        </div>
      </div>

      <!-- If Logged Out -->
      <NuxtLink
        v-else
        to="/login"
        class="px-3 py-1 bg-ops-blue hover:bg-ops-blue-glow text-white text-xs font-mono font-bold rounded transition"
      >
        Sign In
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useIssuesStore } from '~/stores/issues';
import { useServersStore } from '~/stores/servers';
import { useToast } from '~/composables/useToast';

const authStore = useAuthStore();
const issuesStore = useIssuesStore();
const serversStore = useServersStore();
const toast = useToast();

const showUserMenu = ref(false);
const currentUtcTime = ref('');
let timer: any = null;

const criticalCount = computed(() => issuesStore.stats.criticalBlockers || 0);

function updateClock() {
  const d = new Date();
  const iso = d.toISOString().replace('T', ' ').slice(0, 19);
  currentUtcTime.value = iso;
}

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function handleLogout() {
  showUserMenu.value = false;
  authStore.logout();
  toast.info('Session Terminated', 'You have been signed out.');
  navigateTo('/login');
}
</script>
