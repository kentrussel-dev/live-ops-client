<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Subsystem 05 / Incident Management</div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Known Issues & Bug Pipeline</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="issuesStore.isCreateModalOpen = true"
          class="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Report Issue Ticket</span>
        </button>
      </div>
    </div>

    <!-- Pipeline KPI Metrics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
      <div class="p-2.5 bg-ops-surface rounded border border-ops-border font-mono text-2xs">
        <span class="text-ops-text-dim block">1. REPORTED</span>
        <span class="text-base font-bold text-amber-400">{{ issuesStore.stats.reported }}</span>
      </div>
      <div class="p-2.5 bg-ops-surface rounded border border-ops-border font-mono text-2xs">
        <span class="text-ops-text-dim block">2. INVESTIGATING</span>
        <span class="text-base font-bold text-blue-400">{{ issuesStore.stats.investigating }}</span>
      </div>
      <div class="p-2.5 bg-ops-surface rounded border border-ops-border font-mono text-2xs">
        <span class="text-ops-text-dim block">3. FIXED (STAGING)</span>
        <span class="text-base font-bold text-purple-400">{{ issuesStore.stats.fixed }}</span>
      </div>
      <div class="p-2.5 bg-ops-surface rounded border border-ops-border font-mono text-2xs">
        <span class="text-ops-text-dim block">4. VERIFIED (QA)</span>
        <span class="text-base font-bold text-emerald-400">{{ issuesStore.stats.verified }}</span>
      </div>
      <div class="p-2.5 bg-ops-surface rounded border border-ops-border font-mono text-2xs">
        <span class="text-ops-text-dim block">CRITICAL BLOCKERS</span>
        <span class="text-base font-bold text-rose-500">{{ issuesStore.stats.criticalBlockers }}</span>
      </div>
    </div>

    <!-- 4-Stage Kanban Pipeline Board -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <!-- Stage 1: Reported -->
      <div class="bg-ops-surface rounded border border-ops-border flex flex-col min-h-[480px]">
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400" />
            <span class="font-bold text-ops-text-bright">REPORTED</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.reported.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <div
            v-for="ticket in issuesStore.columns.reported"
            :key="ticket._id"
            @click="issuesStore.openDetail(ticket)"
            class="p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded cursor-pointer transition space-y-1.5"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <CommonStatusPill :status="ticket.severity" />
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-ops-text-dim flex items-center justify-between pt-1 border-t border-ops-border/40">
              <span>{{ ticket.category }}</span>
              <span>{{ ticket.affectedCluster || 'Global' }}</span>
            </div>
          </div>
          <div v-if="issuesStore.columns.reported.length === 0" class="p-6 text-center text-2xs font-mono text-ops-text-dark">
            No reported tickets
          </div>
        </div>
      </div>

      <!-- Stage 2: Investigating -->
      <div class="bg-ops-surface rounded border border-ops-border flex flex-col min-h-[480px]">
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-400" />
            <span class="font-bold text-ops-text-bright">INVESTIGATING</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.investigating.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <div
            v-for="ticket in issuesStore.columns.investigating"
            :key="ticket._id"
            @click="issuesStore.openDetail(ticket)"
            class="p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded cursor-pointer transition space-y-1.5"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <CommonStatusPill :status="ticket.severity" />
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-ops-text-dim flex items-center justify-between pt-1 border-t border-ops-border/40">
              <span class="text-blue-300">In Triage</span>
              <span>{{ ticket.internalNotes.length }} note(s)</span>
            </div>
          </div>
          <div v-if="issuesStore.columns.investigating.length === 0" class="p-6 text-center text-2xs font-mono text-ops-text-dark">
            No active investigations
          </div>
        </div>
      </div>

      <!-- Stage 3: Fixed (Staging) -->
      <div class="bg-ops-surface rounded border border-ops-border flex flex-col min-h-[480px]">
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-purple-400" />
            <span class="font-bold text-ops-text-bright">FIXED (STAGING)</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.fixed.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <div
            v-for="ticket in issuesStore.columns.fixed"
            :key="ticket._id"
            @click="issuesStore.openDetail(ticket)"
            class="p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded cursor-pointer transition space-y-1.5"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <CommonStatusPill :status="ticket.severity" />
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-purple-300 pt-1 border-t border-ops-border/40">
              Ready for QA Verification
            </div>
          </div>
          <div v-if="issuesStore.columns.fixed.length === 0" class="p-6 text-center text-2xs font-mono text-ops-text-dark">
            No tickets waiting verification
          </div>
        </div>
      </div>

      <!-- Stage 4: Verified / Resolved -->
      <div class="bg-ops-surface rounded border border-ops-border flex flex-col min-h-[480px]">
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400" />
            <span class="font-bold text-ops-text-bright">VERIFIED (QA)</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.verified.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <div
            v-for="ticket in issuesStore.columns.verified"
            :key="ticket._id"
            @click="issuesStore.openDetail(ticket)"
            class="p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded cursor-pointer transition space-y-1.5"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <CommonStatusPill :status="ticket.severity" />
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-emerald-400 pt-1 border-t border-ops-border/40 flex items-center gap-1">
              <span>✓ Signed off for release</span>
            </div>
          </div>
          <div v-if="issuesStore.columns.verified.length === 0" class="p-6 text-center text-2xs font-mono text-ops-text-dark">
            No verified tickets
          </div>
        </div>
      </div>
    </div>

    <!-- Modals & Drawers -->
    <IssuesIssueDetailDrawer />
    <IssuesIssueCreateModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useIssuesStore } from '~/stores/issues';

const issuesStore = useIssuesStore();

onMounted(async () => {
  await issuesStore.fetchIssues();
});
</script>
