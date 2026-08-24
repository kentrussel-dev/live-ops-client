<template>
  <Teleport to="body">
    <!-- Main Profile Modal Backdrop -->
    <div
      v-if="authStore.isProfileModalOpen && authStore.viewedProfile"
      @click.self="authStore.closeProfile()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div class="w-full max-w-lg bg-ops-surface border border-ops-border rounded-xl shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        <!-- Top Cover Header -->
        <div class="relative bg-gradient-to-r from-ops-obsidian via-ops-subtle to-ops-obsidian p-6 border-b border-ops-border shrink-0">
          <button
            @click="authStore.closeProfile()"
            class="absolute top-3 right-3 p-1.5 rounded-lg bg-ops-obsidian/80 hover:bg-ops-surface border border-ops-border text-ops-text-dim hover:text-ops-text-bright transition font-mono"
            title="Close Profile (Esc)"
          >
            ✕
          </button>

          <div class="flex items-start gap-4">
            <!-- Clickable Display Picture for Closer Look / Zoom -->
            <div class="relative group cursor-pointer shrink-0" @click="authStore.isPhotoZoomOpen = true">
              <img
                v-if="authStore.viewedProfile.avatarUrl"
                :src="authStore.viewedProfile.avatarUrl"
                :alt="authStore.viewedProfile.username"
                class="w-20 h-20 rounded-xl object-cover border-2 border-ops-border shadow-lg group-hover:border-ops-blue transition"
              />
              <div
                v-else
                class="w-20 h-20 rounded-xl bg-ops-obsidian border-2 border-ops-border flex items-center justify-center text-xl font-mono font-bold text-ops-text-bright shadow-lg group-hover:border-ops-blue transition"
              >
                {{ (authStore.viewedProfile.username || 'OP').slice(0, 2).toUpperCase() }}
              </div>

              <!-- Zoom Hover Overlay Icon -->
              <div class="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-mono">
                🔍 Zoom
              </div>

              <!-- Online Presence Dot -->
              <span
                :class="[
                  'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-ops-surface',
                  isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'
                ]"
                :title="isOnline ? 'Online in Studio' : 'Offline'"
              />
            </div>

            <!-- Profile Identity Header Info -->
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-ops-text-bright truncate font-sans">
                  {{ authStore.viewedProfile.username }}
                </h2>
                <span
                  :class="[
                    'px-2 py-0.5 rounded font-mono text-3xs font-bold uppercase tracking-wider',
                    authStore.viewedProfile.role === 'admin'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : authStore.viewedProfile.role === 'liveops_editor'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                      : 'bg-slate-900 text-slate-300 border border-slate-700'
                  ]"
                >
                  {{ authStore.viewedProfile.role?.replace('_', ' ') }}
                </span>
              </div>

              <!-- Position / Title -->
              <div class="text-xs font-semibold text-ops-blue-glow font-mono">
                {{ authStore.viewedProfile.position || 'Live-Ops Specialist' }}
              </div>

              <!-- Department & Email -->
              <div class="text-2xs font-mono text-ops-text-dim flex items-center gap-2 flex-wrap">
                <span>🏢 {{ authStore.viewedProfile.department || 'Operations' }}</span>
                <span>•</span>
                <span class="text-ops-text-dark">{{ authStore.viewedProfile.email }}</span>
              </div>

              <!-- Live Status Message -->
              <div v-if="authStore.viewedProfile.statusMessage" class="pt-1">
                <span class="text-3xs px-2 py-0.5 rounded-full bg-ops-obsidian border border-ops-border text-ops-text-dim font-mono italic inline-flex items-center gap-1">
                  <span>💬</span>
                  <span>{{ authStore.viewedProfile.statusMessage }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scrollable Profile Content Body -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-ops-surface">
          <!-- Department Description / Responsibilities -->
          <div class="p-3.5 bg-ops-obsidian rounded-lg border border-ops-border space-y-1.5">
            <div class="text-2xs font-mono uppercase tracking-wider text-ops-text-dim font-bold flex items-center gap-1.5">
              <span>📋</span>
              <span>Department Scope & Responsibilities</span>
            </div>
            <p class="text-xs text-ops-text-bright leading-relaxed">
              {{ authStore.viewedProfile.departmentDescription || 'Responsible for live-service operations, server reliability, and deployment pipeline synchronization.' }}
            </p>
          </div>

          <!-- Operator Bio -->
          <div class="space-y-1">
            <div class="text-2xs font-mono uppercase tracking-wider text-ops-text-dim font-bold">
              About Operator
            </div>
            <p class="text-xs text-ops-text-dim leading-relaxed bg-ops-canvas p-3 rounded-lg border border-ops-border">
              {{ authStore.viewedProfile.bio || 'Studio live operations engineer coordinating with engineering, design, and QA teams.' }}
            </p>
          </div>

          <!-- Operational Activity Metrics Grid -->
          <div class="space-y-1.5">
            <div class="text-2xs font-mono uppercase tracking-wider text-ops-text-dim font-bold">
              Operational Statistics
            </div>
            <div class="grid grid-cols-3 gap-2 font-mono text-center">
              <div class="p-2.5 bg-ops-obsidian rounded border border-ops-border space-y-0.5">
                <div class="text-base font-bold text-ops-blue-glow">
                  {{ authStore.viewedProfile.metrics?.totalAssignedTickets ?? (authStore.viewedProfile.assignedTickets?.length || 0) }}
                </div>
                <div class="text-3xs text-ops-text-dim uppercase">Assigned Issues</div>
              </div>
              <div class="p-2.5 bg-ops-obsidian rounded border border-ops-border space-y-0.5">
                <div class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {{ authStore.viewedProfile.metrics?.resolvedTickets ?? 0 }}
                </div>
                <div class="text-3xs text-ops-text-dim uppercase">Resolved</div>
              </div>
              <div class="p-2.5 bg-ops-obsidian rounded border border-ops-border space-y-0.5">
                <div class="text-base font-bold text-amber-600 dark:text-amber-400">
                  {{ isOnline ? 'Online' : 'Offline' }}
                </div>
                <div class="text-3xs text-ops-text-dim uppercase">Presence</div>
              </div>
            </div>
          </div>

          <!-- Recent Assigned Tickets Section -->
          <div v-if="authStore.viewedProfile.assignedTickets && authStore.viewedProfile.assignedTickets.length > 0" class="space-y-2">
            <div class="text-2xs font-mono uppercase tracking-wider text-ops-text-dim font-bold flex items-center justify-between">
              <span>Assigned Active Tickets</span>
              <span class="text-3xs text-ops-text-dark">({{ authStore.viewedProfile.assignedTickets.length }})</span>
            </div>
            <div class="space-y-1.5 max-h-36 overflow-y-auto">
              <div
                v-for="ticket in authStore.viewedProfile.assignedTickets"
                :key="ticket._id"
                @click="navigateToTicket(ticket._id)"
                class="p-2 bg-ops-obsidian hover:bg-ops-surface-hover rounded border border-ops-border flex items-center justify-between gap-2 cursor-pointer transition"
              >
                <div class="min-w-0 flex items-center gap-2">
                  <span class="font-mono font-bold text-3xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
                  <span class="text-xs text-ops-text-bright truncate">{{ ticket.title }}</span>
                </div>
                <span class="text-3xs font-mono px-1.5 py-0.2 bg-ops-surface rounded border border-ops-border text-ops-text-dim uppercase">
                  {{ ticket.severity }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions Toolbar -->
        <div class="p-3.5 border-t border-ops-border bg-ops-subtle flex items-center justify-between shrink-0">
          <button
            @click="authStore.closeProfile()"
            class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded font-mono text-xs transition"
          >
            Close
          </button>

          <div class="flex items-center gap-2">
            <!-- Send Direct Message Button (if not self) -->
            <button
              v-if="authStore.viewedProfile._id !== authStore.user?._id && authStore.viewedProfile.username !== authStore.user?.username"
              @click="handleStartDM(authStore.viewedProfile._id)"
              class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
            >
              <span>💬</span>
              <span>Send Direct Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Closer Look / Photo Zoom Lightbox Modal -->
    <div
      v-if="authStore.isPhotoZoomOpen && authStore.viewedProfile"
      @click.self="authStore.isPhotoZoomOpen = false"
      class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div class="relative max-w-xl max-h-[85vh] flex flex-col items-center">
        <button
          @click="authStore.isPhotoZoomOpen = false"
          class="absolute -top-10 right-0 text-white font-mono text-sm hover:text-rose-400 p-1"
        >
          ✕ Close Full View
        </button>

        <img
          v-if="authStore.viewedProfile.avatarUrl"
          :src="authStore.viewedProfile.avatarUrl"
          :alt="authStore.viewedProfile.username"
          class="max-w-full max-h-[75vh] rounded-2xl object-cover border-4 border-ops-border shadow-2xl"
        />

        <div class="mt-3 text-center">
          <div class="text-sm font-bold text-white">{{ authStore.viewedProfile.username }}</div>
          <div class="text-xs font-mono text-ops-blue-glow">{{ authStore.viewedProfile.position }} • {{ authStore.viewedProfile.department }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useChatStore } from '~/stores/chat';

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const isOnline = computed(() => {
  if (!authStore.viewedProfile) return false;
  return chatStore.isUserOnline(authStore.viewedProfile._id);
});

function handleStartDM(userId: string) {
  authStore.closeProfile();
  router.push(`/discuss?dm=${userId}`);
}

function navigateToTicket(ticketId: string) {
  authStore.closeProfile();
  router.push(`/issues/${ticketId}`);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (authStore.isPhotoZoomOpen) {
      authStore.isPhotoZoomOpen = false;
    } else if (authStore.isProfileModalOpen) {
      authStore.closeProfile();
    }
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeydown);
  }
});
</script>
