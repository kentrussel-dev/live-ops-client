<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Top Back / Return Bar -->
    <div class="flex items-center justify-between pb-3 border-b border-ops-border">
      <div class="flex items-center gap-3">
        <button
          @click="router.back()"
          class="px-2.5 py-1.5 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border rounded text-xs font-mono text-ops-text-bright transition flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <span class="text-xs font-mono text-ops-text-dim">Operator Profile / {{ profile?.username || 'Loading...' }}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="profile && profile._id !== authStore.user?._id"
          @click="handleStartDM"
          class="px-3.5 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
        >
          <span>💬</span>
          <span>Direct Message</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 text-center text-ops-text-dim font-mono text-xs">
      Loading operator profile details...
    </div>

    <!-- Error / Not Found State -->
    <div v-else-if="!profile" class="p-12 bg-ops-surface rounded-xl border border-ops-border text-center space-y-3">
      <div class="text-3xl">👤</div>
      <h2 class="text-base font-bold text-ops-text-bright font-sans">Operator Profile Not Found</h2>
      <p class="text-xs text-ops-text-dim max-w-sm mx-auto font-sans">The requested operator account could not be found or has been revoked.</p>
      <button
        @click="router.push('/')"
        class="px-4 py-2 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright rounded font-mono text-xs"
      >
        Return to Mission Control
      </button>
    </div>

    <!-- Profile Viewport Card -->
    <div v-else class="bg-ops-surface border border-ops-border rounded-xl shadow-xl overflow-hidden font-sans space-y-6">
      <!-- Profile Header Hero -->
      <div class="bg-gradient-to-r from-ops-obsidian via-ops-subtle to-ops-obsidian p-6 border-b border-ops-border flex flex-wrap items-start justify-between gap-6">
        <div class="flex items-start gap-5">
          <!-- Display Picture with Zoom Trigger -->
          <div class="relative group cursor-pointer shrink-0" @click="showZoom = true">
            <img
              v-if="profile.avatarUrl"
              :src="profile.avatarUrl"
              :alt="profile.username"
              class="w-24 h-24 rounded-2xl object-cover border-2 border-ops-border shadow-xl group-hover:border-ops-blue transition"
            />
            <div
              v-else
              class="w-24 h-24 rounded-2xl bg-ops-obsidian border-2 border-ops-border flex items-center justify-center text-2xl font-mono font-bold text-ops-text-bright shadow-xl group-hover:border-ops-blue transition"
            >
              {{ profile.username.slice(0, 2).toUpperCase() }}
            </div>

            <!-- Closer Look Overlay -->
            <div class="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-3xs font-mono gap-1">
              <span>🔍</span>
              <span>Closer Look</span>
            </div>

            <!-- Presence Indicator -->
            <span
              :class="[
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-ops-surface',
                isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'
              ]"
              :title="isOnline ? 'Online in Studio' : 'Offline'"
            />
          </div>

          <!-- Identity Details -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold text-ops-text-bright font-sans">{{ profile.username }}</h1>
              <span
                :class="[
                  'px-2 py-0.5 rounded font-mono text-3xs font-bold uppercase tracking-wider',
                  profile.role === 'admin'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                    : profile.role === 'liveops_editor'
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                    : 'bg-slate-900 text-slate-300 border border-slate-700'
                ]"
              >
                {{ profile.role?.replace('_', ' ') }}
              </span>
            </div>

            <div class="text-sm font-semibold text-ops-blue-glow font-mono">
              {{ profile.position || 'Live-Ops Specialist' }}
            </div>

            <div class="text-xs font-mono text-ops-text-dim flex items-center gap-3 flex-wrap">
              <span>🏢 {{ profile.department || 'Operations' }}</span>
              <span>•</span>
              <span class="text-ops-text-dark">{{ profile.email }}</span>
            </div>

            <div v-if="profile.statusMessage" class="pt-1">
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-ops-obsidian border border-ops-border text-ops-text-dim font-mono italic inline-flex items-center gap-1.5">
                <span>💬</span>
                <span>{{ profile.statusMessage }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Metric KPI Badges -->
        <div class="flex items-center gap-2 font-mono text-center">
          <div class="p-3 bg-ops-obsidian rounded-lg border border-ops-border min-w-24">
            <div class="text-lg font-bold text-ops-blue-glow">{{ profile.metrics?.totalAssignedTickets || 0 }}</div>
            <div class="text-3xs text-ops-text-dim uppercase">Assigned</div>
          </div>
          <div class="p-3 bg-ops-obsidian rounded-lg border border-ops-border min-w-24">
            <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ profile.metrics?.resolvedTickets || 0 }}</div>
            <div class="text-3xs text-ops-text-dim uppercase">Resolved</div>
          </div>
        </div>
      </div>

      <!-- Main Profile Grid -->
      <div class="p-6 space-y-6">
        <!-- 1. Department Scope & Responsibilities -->
        <div class="p-4 bg-ops-obsidian rounded-xl border border-ops-border space-y-2">
          <div class="text-xs font-mono uppercase tracking-wider text-ops-text-dim font-bold flex items-center gap-2">
            <span>📋</span>
            <span>Department Scope & Responsibilities</span>
          </div>
          <p class="text-xs text-ops-text-bright leading-relaxed">
            {{ profile.departmentDescription || 'Responsible for live-service operations, infrastructure reliability, and incident triage.' }}
          </p>
        </div>

        <!-- 2. About / Bio -->
        <div class="space-y-2">
          <div class="text-xs font-mono uppercase tracking-wider text-ops-text-dim font-bold">
            About Operator
          </div>
          <p class="text-xs text-ops-text-dim leading-relaxed bg-ops-canvas p-4 rounded-xl border border-ops-border">
            {{ profile.bio || 'Studio live operations engineer coordinating across engineering, QA, and game design disciplines.' }}
          </p>
        </div>

        <!-- 3. Assigned Issues Stream -->
        <div v-if="profile.assignedTickets && profile.assignedTickets.length > 0" class="space-y-3">
          <div class="text-xs font-mono uppercase tracking-wider text-ops-text-dim font-bold flex items-center justify-between">
            <span>Assigned Tickets in Pipeline</span>
            <span class="text-2xs text-ops-text-dark">({{ profile.assignedTickets.length }})</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div
              v-for="ticket in profile.assignedTickets"
              :key="ticket._id"
              @click="router.push(`/issues/${ticket._id}`)"
              class="p-3 bg-ops-obsidian hover:bg-ops-surface-hover rounded-lg border border-ops-border cursor-pointer transition flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
                  <span class="text-3xs font-mono px-1.5 py-0.2 rounded border uppercase" :class="ticket.severity === 'critical_blocker' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-ops-surface text-ops-text-dim border-ops-border'">
                    {{ ticket.severity }}
                  </span>
                </div>
                <p class="text-xs font-semibold text-ops-text-bright truncate mt-1">{{ ticket.title }}</p>
              </div>
              <span class="text-2xs font-mono text-ops-text-dim shrink-0">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Closer Look / Photo Lightbox Modal -->
    <div
      v-if="showZoom && profile"
      @click.self="showZoom = false"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div class="relative max-w-xl max-h-[85vh] flex flex-col items-center">
        <button
          @click="showZoom = false"
          class="absolute -top-10 right-0 text-white font-mono text-sm hover:text-rose-400 p-1"
        >
          ✕ Close Full View
        </button>

        <img
          v-if="profile.avatarUrl"
          :src="profile.avatarUrl"
          :alt="profile.username"
          class="max-w-full max-h-[75vh] rounded-2xl object-cover border-4 border-ops-border shadow-2xl"
        />

        <div class="mt-3 text-center">
          <div class="text-sm font-bold text-white">{{ profile.username }}</div>
          <div class="text-xs font-mono text-ops-blue-glow">{{ profile.position }} • {{ profile.department }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useChatStore } from '~/stores/chat';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const profile = ref<any | null>(null);
const isLoading = ref(true);
const showZoom = ref(false);

const isOnline = computed(() => {
  if (!profile.value?._id) return false;
  return chatStore.isUserOnline(profile.value._id);
});

function handleStartDM() {
  if (!profile.value?._id) return;
  router.push(`/discuss?dm=${profile.value._id}`);
}

onMounted(async () => {
  chatStore.initSocket();
  const id = route.params.id as string;
  if (id) {
    profile.value = await authStore.fetchUserProfile(id);
  }
  isLoading.value = false;
});
</script>
