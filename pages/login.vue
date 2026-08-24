<template>
  <div class="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs">
      <!-- Header -->
      <div class="p-6 border-b border-ops-border bg-ops-subtle text-center space-y-1">
        <div class="flex items-center justify-center gap-2 mb-1">
          <span class="w-2.5 h-2.5 rounded-sm bg-ops-blue shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
          <span class="font-mono font-bold text-sm text-ops-text-bright tracking-wider uppercase">Aetheria Ops Console</span>
        </div>
        <p class="text-xs text-ops-text-dim">
          {{ isMasterMode ? 'Root Administrator Bootstrap' : 'Operator Authentication' }}
        </p>
      </div>

      <div class="p-6 space-y-4">
        <!-- Error Alert Banner -->
        <div
          v-if="errorMessage"
          class="p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-mono flex items-start gap-2"
        >
          <span class="text-rose-400 font-bold">⚠</span>
          <div class="flex-1">{{ errorMessage }}</div>
        </div>

        <!-- 1. STANDARD SIGN IN -->
        <form v-if="!isMasterMode" @submit.prevent="handleLogin" class="space-y-3.5">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Email</label>
            <input
              v-model="loginEmail"
              type="email"
              required
              autocomplete="email"
              placeholder="operator@aetheria.gg"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright placeholder-ops-text-dim/40 focus:border-ops-blue outline-none"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-2xs font-mono uppercase text-ops-text-dim">Password</label>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-2xs font-mono text-ops-text-dim hover:text-ops-text-bright"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <input
              v-model="loginPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••••••"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright placeholder-ops-text-dim/40 focus:border-ops-blue outline-none font-mono"
            />
          </div>

          <!-- Remember Me Checkbox -->
          <div class="pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="rounded bg-ops-obsidian border-ops-border text-ops-blue focus:ring-0 w-3.5 h-3.5"
              />
              <span class="text-2xs text-ops-text-bright font-mono">Keep me signed in (30-day session)</span>
            </label>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-2 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-1"
          >
            <span v-if="authStore.isLoading" class="animate-spin text-sm">↻</span>
            <span>{{ authStore.isLoading ? 'Authenticating...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- 2. MASTER ROOT KEY BOOTSTRAP -->
        <form v-else @submit.prevent="handleMasterBootstrap" class="space-y-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-purple-400 mb-1">Root Master Secret</label>
            <input
              v-model="masterKey"
              type="password"
              required
              placeholder="Enter ROOT_ADMIN_KEY"
              class="w-full bg-ops-obsidian border border-purple-900 focus:border-purple-500 rounded px-3 py-2 text-xs text-ops-text-bright font-mono outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Root Admin Username</label>
            <input
              v-model="masterUsername"
              type="text"
              required
              placeholder="admin"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright font-mono outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Root Admin Email</label>
            <input
              v-model="masterEmail"
              type="email"
              required
              placeholder="admin@aetheria.gg"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Set Admin Password</label>
            <input
              v-model="masterPassword"
              type="password"
              required
              minlength="8"
              placeholder="••••••••••••"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright font-mono outline-none"
            />
          </div>

          <!-- Remember Me Checkbox for Master Bootstrap -->
          <div class="pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="rounded bg-ops-obsidian border-ops-border text-purple-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span class="text-2xs text-ops-text-bright font-mono">Keep root session active (30-day persistence)</span>
            </label>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white font-mono font-bold text-xs rounded transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-1"
          >
            <span v-if="authStore.isLoading" class="animate-spin text-sm">↻</span>
            <span>{{ authStore.isLoading ? 'Verifying...' : 'Initialize Root Admin' }}</span>
          </button>
        </form>

        <!-- Footer / Mode Switcher -->
        <div class="pt-2 border-t border-ops-border/60 flex items-center justify-between text-2xs font-mono">
          <button
            type="button"
            @click="isMasterMode = !isMasterMode; errorMessage = ''"
            class="text-ops-text-dim hover:text-ops-text-bright transition"
          >
            {{ isMasterMode ? '← Back to Sign In' : 'Master Key Access' }}
          </button>
          <span class="text-ops-text-dark">v1.0.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';

definePageMeta({
  layout: 'default',
});

const authStore = useAuthStore();
const toast = useToast();

const isMasterMode = ref(false);
const showPassword = ref(false);
const rememberMe = ref(true); // Default to persistent session
const errorMessage = ref('');

// Standard Login
const loginEmail = ref('');
const loginPassword = ref('');

// Master Key Bootstrap
const masterKey = ref('');
const masterUsername = ref('root_admin');
const masterEmail = ref('admin@aetheria.gg');
const masterPassword = ref('');

async function handleLogin() {
  errorMessage.value = '';
  const res = await authStore.login(loginEmail.value, loginPassword.value, rememberMe.value);

  if (res.ok) {
    toast.success('Session Authenticated', `Welcome back, ${authStore.user?.username}!`);
    navigateTo('/');
  } else {
    errorMessage.value = res.error || 'Invalid email or password.';
  }
}

async function handleMasterBootstrap() {
  errorMessage.value = '';
  const res = await authStore.bootstrapWithMasterKey({
    masterKey: masterKey.value,
    username: masterUsername.value,
    email: masterEmail.value,
    password: masterPassword.value,
    rememberMe: rememberMe.value,
  });

  if (res.ok) {
    toast.success('Root Admin Established', `Session active as ${authStore.user?.username}`);
    navigateTo('/');
  } else {
    errorMessage.value = res.error || 'Invalid Master Root Key.';
  }
}
</script>
