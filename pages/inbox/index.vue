<template>
  <div class="space-y-4 font-sans">
    <!-- Subsystem Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-blue-glow flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-ops-blue-glow" />
          <span>Operator Workspace / Centralized Activity Stream</span>
        </div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Operator Inbox & Assigned Tasks</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="notificationsStore.markAllAsRead"
          :disabled="notificationsStore.unreadCount === 0"
          class="px-3 py-1.5 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border text-ops-text-bright font-mono text-xs rounded transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>Mark All Read</span>
        </button>

        <NuxtLink
          to="/discuss"
          class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
        >
          <span>Open Discuss Hub →</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Filter Tabs Bar -->
    <div class="flex items-center justify-between bg-ops-surface border border-ops-border rounded p-2 text-xs font-mono">
      <div class="flex items-center gap-1">
        <button
          v-for="tab in (['all', 'ticket_assigned', 'mention', 'status_change', 'system_alert'] as const)"
          :key="tab"
          @click="activeFilter = tab"
          :class="[
            'px-3 py-1 rounded transition uppercase font-semibold text-2xs',
            activeFilter === tab
              ? 'bg-ops-blue text-white'
              : 'text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface-hover'
          ]"
        >
          {{ formatTabLabel(tab) }}
        </button>
      </div>

      <div class="text-2xs text-ops-text-dim">
        <span class="text-ops-text-bright font-bold">{{ filteredNotifications.length }}</span> items
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredNotifications.length === 0 && !notificationsStore.isLoading"
      class="bg-ops-surface border border-ops-border rounded-lg p-10 text-center space-y-2 text-ops-text-dim"
    >
      <div class="text-2xl font-mono text-ops-blue-glow">✓</div>
      <div class="text-sm font-bold text-ops-text-bright">Your Inbox is Clear</div>
      <p class="text-xs">No pending tickets, task assignments, or mentions matching this filter.</p>
    </div>

    <!-- Inbox Notifications Stream -->
    <div v-else class="space-y-3">
      <div
        v-for="notif in filteredNotifications"
        :key="notif._id"
        @click="handleNavigate(notif)"
        :class="[
          'bg-ops-surface border rounded-lg p-4 space-y-2 transition flex items-start justify-between gap-4 cursor-pointer hover:border-ops-blue/80',
          notif.isRead
            ? 'border-ops-border opacity-85'
            : 'border-ops-blue/50 bg-ops-surface/90 shadow-sm'
        ]"
      >
        <div class="flex items-start gap-3.5 min-w-0 flex-1">
          <!-- Notification Icon Badge -->
          <div class="shrink-0 pt-0.5">
            <div
              :class="[
                'w-8 h-8 rounded border flex items-center justify-center',
                notif.type === 'ticket_assigned' ? 'bg-amber-950/60 border-amber-800' :
                notif.type === 'mention' ? 'bg-indigo-950/60 border-indigo-800' :
                notif.type === 'status_change' ? 'bg-emerald-950/60 border-emerald-800' :
                notif.type === 'direct_message' ? 'bg-blue-950/60 border-blue-800' :
                'bg-ops-obsidian border-ops-border'
              ]"
            >
              <!-- ticket_assigned: clipboard/task icon -->
              <svg v-if="notif.type === 'ticket_assigned'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <!-- direct_message: chat bubble icon -->
              <svg v-else-if="notif.type === 'direct_message'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <!-- mention: @ icon -->
              <svg v-else-if="notif.type === 'mention'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
              </svg>
              <!-- status_change: check-circle icon -->
              <svg v-else-if="notif.type === 'status_change'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="m9 11 3 3L22 4"/>
              </svg>
              <!-- system_alert / fallback: bell icon -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-ops-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
          </div>

          <!-- Notification Content Body -->
          <div class="space-y-1 min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-ops-text-bright">{{ notif.title }}</span>
              <span class="text-2xs font-mono text-ops-text-dim">{{ formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) }}</span>
              <span
                v-if="!notif.isRead"
                class="px-1.5 py-0.2 text-2xs font-mono font-bold bg-ops-blue text-white rounded-full"
              >
                NEW
              </span>
            </div>

            <!-- Subject / Message Text Box -->
            <div class="text-xs text-ops-text-base bg-ops-obsidian/70 border border-ops-border rounded p-2.5 font-sans whitespace-pre-wrap leading-relaxed">
              {{ notif.message }}
            </div>

            <!-- Deep Link Action -->
            <div class="pt-1 flex items-center gap-2">
              <span
                v-if="notif.entityType === 'issue' || notif.type === 'ticket_assigned'"
                class="text-2xs font-mono text-ops-blue-glow hover:underline flex items-center gap-1"
              >
                <span>View Issue in Pipeline Board →</span>
              </span>
              <span
                v-else-if="notif.type === 'direct_message'"
                class="text-2xs font-mono text-ops-blue-glow hover:underline flex items-center gap-1"
              >
                <span>Open Direct Message in Discuss Hub →</span>
              </span>
              <span
                v-else-if="notif.entityType === 'channel'"
                class="text-2xs font-mono text-ops-blue-glow hover:underline flex items-center gap-1"
              >
                <span>Open in Discuss Channel →</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Mark As Read Individual Checkmark -->
        <button
          v-if="!notif.isRead"
          @click.stop="notificationsStore.markAsRead(notif._id)"
          class="px-2 py-1 rounded bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim hover:text-ops-text-bright font-mono text-xs transition shrink-0"
          title="Mark as read"
        >
          ✓
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationsStore } from '~/stores/notifications';
import { formatDistanceToNow } from 'date-fns';

const notificationsStore = useNotificationsStore();
const activeFilter = ref<'all' | 'ticket_assigned' | 'mention' | 'status_change' | 'system_alert'>('all');

onMounted(async () => {
  await notificationsStore.fetchNotifications();
});

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notificationsStore.notifications;
  return notificationsStore.notifications.filter((n) => n.type === activeFilter.value);
});

function handleNavigate(notif: any) {
  notificationsStore.markAsRead(notif._id);

  if (notif.entityType === 'issue' || notif.type === 'ticket_assigned') {
    if (notif.entityId) {
      navigateTo(`/issues/${notif.entityId}`);
    } else {
      navigateTo('/issues');
    }
  } else if (notif.type === 'direct_message') {
    if (notif.sender?._id) {
      navigateTo(`/discuss?dm=${notif.sender._id}`);
    } else if (notif.entityId) {
      navigateTo(`/discuss?channel=${notif.entityId}`);
    } else {
      navigateTo('/discuss');
    }
  } else if (notif.entityType === 'channel') {
    if (notif.entityId) {
      navigateTo(`/discuss?channel=${notif.entityId}`);
    } else {
      navigateTo('/discuss');
    }
  }
}

function formatTabLabel(tab: string) {
  if (tab === 'all') return 'All Inbox';
  if (tab === 'ticket_assigned') return 'Assigned Tickets';
  if (tab === 'mention') return 'Mentions';
  if (tab === 'status_change') return 'Status Approvals';
  if (tab === 'system_alert') return 'System Alerts';
  return tab;
}

function getNotificationTypeBadge(type: string) {
  if (type === 'ticket_assigned') return 'TASK';
  if (type === 'mention') return 'PING';
  if (type === 'status_change') return 'AUTH';
  if (type === 'direct_message') return 'DM';
  return 'SYS';
}
</script>
