<template>
  <div class="space-y-6">
    <!-- Operational Dashboard Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ops-border">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">
            Unified Mission Control
          </span>
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <h1 class="text-xl font-bold tracking-tight text-ops-text-bright font-sans">
          Aetheria Live-Ops Command Center
        </h1>
        <p class="text-xs text-ops-text-dim mt-0.5 font-sans">
          Real-time operations schedule, server fleet telemetry, emergency event toggles, and incident triage.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/events"
          class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright rounded text-xs font-mono transition"
        >
          Event Toggles
        </NuxtLink>

        <NuxtLink
          to="/issues"
          class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright rounded text-xs font-mono transition"
        >
          Known Issues ({{ issuesStore.stats.reported + issuesStore.stats.investigating }})
        </NuxtLink>
      </div>
    </div>

    <!-- Cluster Telemetry KPI Tiles -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <!-- Tile 1: Active Events -->
      <div class="p-3 bg-ops-surface rounded border border-ops-border space-y-1">
        <div class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider">Active Live Events</div>
        <div class="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <span>{{ eventsStore.events.filter((e) => e.status === 'active').length }}</span>
          <span class="text-2xs px-1.5 py-0.2 rounded font-normal dark:bg-emerald-950 dark:text-emerald-300 bg-emerald-100 text-emerald-800 border border-emerald-300">
            {{ eventsStore.events.filter((e) => e.status === 'scheduled').length }} scheduled
          </span>
        </div>
        <div class="text-2xs text-ops-text-dim">
          {{ eventsStore.events.filter((e) => e.status === 'active').length > 0 ? 'Active event schedules running' : 'No active events currently' }}
        </div>
      </div>

      <!-- Tile 2: Flash Sales -->
      <div class="p-3 bg-ops-surface rounded border border-ops-border space-y-1">
        <div class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider">Flash Sales & Promos</div>
        <div class="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <span>{{ shopStore.items.filter((i) => i.rotationStatus === 'flash_sale').length }}</span>
          <span class="text-2xs px-1.5 py-0.2 rounded font-normal dark:bg-amber-950 dark:text-amber-300 bg-amber-100 text-amber-800 border border-amber-300">
            {{ shopStore.items.filter((i) => i.rotationStatus === 'featured').length }} featured
          </span>
        </div>
        <div class="text-2xs text-ops-text-dim">
          {{ shopStore.items.filter((i) => i.rotationStatus === 'flash_sale').length > 0 ? 'Flash discounts live in shop' : 'No active promotions' }}
        </div>
      </div>

      <!-- Tile 3: Critical Blockers -->
      <div class="p-3 bg-ops-surface rounded border border-ops-border space-y-1">
        <div class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider">Critical Blockers (P0)</div>
        <div class="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <span>{{ issuesStore.stats.criticalBlockers }}</span>
          <span class="text-2xs px-1.5 py-0.2 rounded font-normal dark:bg-rose-950 dark:text-rose-300 bg-rose-100 text-rose-800 border border-rose-300">
            {{ issuesStore.stats.reported + issuesStore.stats.investigating }} open total
          </span>
        </div>
        <div class="text-2xs text-ops-text-dim">
          {{ issuesStore.stats.criticalBlockers > 0 ? 'P0 blocker investigation active' : 'Zero critical incidents' }}
        </div>
      </div>

      <!-- Tile 4: Server Fleet -->
      <div class="p-3 bg-ops-surface rounded border border-ops-border space-y-1">
        <div class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider">Game Server Fleet</div>
        <div class="text-xl font-mono font-bold text-ops-text-bright flex items-center gap-2">
          <span>{{ serversStore.fleetSummary.onlineServers }}</span>
          <span class="text-2xs px-1.5 py-0.2 bg-ops-canvas text-ops-text-dim border border-ops-border rounded font-normal">
            / {{ serversStore.fleetSummary.totalServers }} Online
          </span>
        </div>
        <div class="text-2xs text-ops-text-dim">
          {{ serversStore.fleetSummary.totalServers > 0 ? `${serversStore.fleetSummary.avgPingMs}ms average fleet ping` : 'No server nodes provisioned' }}
        </div>
      </div>
    </div>

    <!-- Multi-Track Operations Timeline -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-mono font-bold uppercase tracking-wider text-ops-text-bright">
          Live Synchronized Schedule Matrix
        </h2>
        <span class="text-2xs font-mono text-ops-text-dim">Click any track block to inspect telemetry payload</span>
      </div>

      <!-- Timeline Component -->
      <TimelineMultiTrackTimeline />
    </div>

    <!-- Lower Split Pane: Active Events & Quick Triage -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Active Events Fast Status Toggles -->
      <div class="p-4 bg-ops-surface rounded border border-ops-border space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-ops-border">
          <h3 class="text-xs font-mono font-bold text-ops-text-bright uppercase">
            Live Events Control Strip
          </h3>
          <NuxtLink to="/events" class="text-2xs font-mono text-ops-blue-glow hover:underline">
            View All ({{ eventsStore.events.length }})
          </NuxtLink>
        </div>

        <div v-if="eventsStore.events.length === 0" class="p-6 text-center text-xs text-ops-text-dim font-mono">
          No game events scheduled. Visit Events tab to create your first event.
        </div>

        <div v-else class="space-y-2 max-h-72 overflow-y-auto">
          <div
            v-for="ev in eventsStore.events.slice(0, 4)"
            :key="ev._id"
            class="p-2.5 bg-ops-obsidian rounded border border-ops-border flex items-center justify-between gap-3 text-xs"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <CommonStatusPill :status="ev.status" />
                <span class="font-semibold text-ops-text-bright truncate">{{ ev.name }}</span>
              </div>
              <div class="text-2xs font-mono text-ops-text-dim mt-0.5">
                {{ ev.category.toUpperCase() }} • {{ ev.targeting.serverClusters.join(', ') }} • {{ formatShortDate(ev.schedule.startTime) }}
              </div>
            </div>

            <!-- Fast Toggle Button (Live-Ops Editor only) -->
            <div v-if="authStore.canEdit" class="flex items-center gap-1.5 shrink-0">
              <button
                v-if="ev.status === 'active'"
                @click="eventsStore.toggleStatus(ev._id, 'paused', 'Quick dashboard pause')"
                class="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-2xs font-mono rounded transition"
              >
                Pause
              </button>
              <button
                v-else-if="ev.status === 'paused' || ev.status === 'scheduled'"
                @click="eventsStore.toggleStatus(ev._id, 'active', 'Quick dashboard activate')"
                class="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-2xs font-mono rounded transition"
              >
                Go Live
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Urgent Known Issue Triage -->
      <div class="p-4 bg-ops-surface rounded border border-ops-border space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-ops-border">
          <h3 class="text-xs font-mono font-bold text-ops-text-bright uppercase">
            Active Blocker Triage Pipeline
          </h3>
          <NuxtLink to="/issues" class="text-2xs font-mono text-ops-blue-glow hover:underline">
            Open Pipeline Board
          </NuxtLink>
        </div>

        <div v-if="issuesStore.issues.filter((i) => i.status !== 'closed').length === 0" class="p-6 text-center text-xs text-ops-text-dim font-mono">
          No open blocker issues reported.
        </div>

        <div v-else class="space-y-2 max-h-72 overflow-y-auto">
          <div
            v-for="iss in issuesStore.issues.filter((i) => i.status !== 'closed').slice(0, 4)"
            :key="iss._id"
            @click="issuesStore.openDetail(iss)"
            class="p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover rounded border border-ops-border flex items-start justify-between gap-3 text-xs cursor-pointer transition"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ iss.ticketKey }}</span>
                <CommonStatusPill :status="iss.severity" />
                <CommonStatusPill :status="iss.status" />
              </div>
              <p class="font-semibold text-ops-text-bright text-xs mt-1 truncate">{{ iss.title }}</p>
              <div class="text-2xs font-mono text-ops-text-dim mt-0.5">
                Reported by {{ iss.reportedBy }} • {{ iss.affectedCluster || 'Global' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline Inspection Slide-Over Drawer -->
    <TimelineItemDrawer />

    <!-- Issue Detail Drawer -->
    <IssuesIssueDetailDrawer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEventsStore } from '~/stores/events';
import { useShopStore } from '~/stores/shop';
import { useIssuesStore } from '~/stores/issues';
import { useServersStore } from '~/stores/servers';
import { useAuthStore } from '~/stores/auth';
import { useTimeFormat } from '~/composables/useTimeFormat';

const eventsStore = useEventsStore();
const shopStore = useShopStore();
const issuesStore = useIssuesStore();
const serversStore = useServersStore();
const authStore = useAuthStore();
const { formatShortDate } = useTimeFormat();

onMounted(async () => {
  await Promise.all([
    eventsStore.fetchEvents(),
    shopStore.fetchShopItems(),
    issuesStore.fetchIssues(),
    serversStore.fetchServers(),
  ]);
});
</script>
