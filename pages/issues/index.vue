<template>
  <div class="space-y-4 select-none">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Subsystem 05 / Incident Management</div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Known Issues & Bug Pipeline</h1>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-2xs font-mono text-ops-text-dim hidden sm:inline-block">
          Drag cards to advance stages • Click card to edit full screen
        </span>
        <button
          @click="issuesStore.isCreateModalOpen = true"
          class="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
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

    <!-- 4-Stage Draggable Kanban Pipeline Board -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <!-- Stage 1: Reported -->
      <div
        :class="[
          'bg-ops-surface rounded border transition-all duration-200 flex flex-col min-h-[500px]',
          activeDropZone === 'reported'
            ? 'border-ops-blue ring-2 ring-ops-blue/50 bg-ops-blue/5'
            : 'border-ops-border'
        ]"
        @dragover.prevent="handleDragOver($event, 'reported')"
        @dragenter.prevent="handleDragEnter('reported')"
        @dragleave="handleDragLeave($event, 'reported')"
        @drop="handleDrop($event, 'reported')"
      >
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400" />
            <span class="font-bold text-ops-text-bright">REPORTED</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.reported.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <!-- Drop Indicator when hovering over empty zone -->
          <div
            v-if="activeDropZone === 'reported' && draggedTicket?.status !== 'reported'"
            class="p-3 border-2 border-dashed border-ops-blue/60 bg-ops-blue/10 rounded text-center text-2xs font-mono text-ops-blue-glow animate-pulse"
          >
            Move ticket to Reported
          </div>

          <div
            v-for="ticket in issuesStore.columns.reported"
            :key="ticket._id"
            draggable="true"
            @dragstart="handleDragStart($event, ticket)"
            @dragend="handleDragEnd"
            @click="navigateTo(`/issues/${ticket._id}`)"
            :class="[
              'p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border rounded cursor-pointer active:cursor-grabbing transition-all space-y-1.5 group',
              draggedTicket?._id === ticket._id
                ? 'opacity-40 border-dashed border-ops-blue'
                : 'border-ops-border hover:border-ops-blue/80'
            ]"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <div class="flex items-center gap-1">
                <CommonStatusPill :status="ticket.severity" />
                <span class="text-3xs font-mono text-ops-text-dim group-hover:text-ops-blue-glow transition">↗</span>
              </div>
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug group-hover:text-ops-blue-glow transition">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-ops-text-dim flex items-center justify-between pt-1 border-t border-ops-border/40">
              <span>{{ ticket.category }}</span>
              <span>{{ ticket.affectedCluster || 'Global' }}</span>
            </div>
          </div>

          <div v-if="issuesStore.columns.reported.length === 0 && activeDropZone !== 'reported'" class="p-8 text-center text-2xs font-mono text-ops-text-dark">
            No reported tickets
          </div>
        </div>
      </div>

      <!-- Stage 2: Investigating -->
      <div
        :class="[
          'bg-ops-surface rounded border transition-all duration-200 flex flex-col min-h-[500px]',
          activeDropZone === 'investigating'
            ? 'border-ops-blue ring-2 ring-ops-blue/50 bg-ops-blue/5'
            : 'border-ops-border'
        ]"
        @dragover.prevent="handleDragOver($event, 'investigating')"
        @dragenter.prevent="handleDragEnter('investigating')"
        @dragleave="handleDragLeave($event, 'investigating')"
        @drop="handleDrop($event, 'investigating')"
      >
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-400" />
            <span class="font-bold text-ops-text-bright">INVESTIGATING</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.investigating.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <!-- Drop Indicator -->
          <div
            v-if="activeDropZone === 'investigating' && draggedTicket?.status !== 'investigating'"
            class="p-3 border-2 border-dashed border-ops-blue/60 bg-ops-blue/10 rounded text-center text-2xs font-mono text-ops-blue-glow animate-pulse"
          >
            Move ticket to Investigating
          </div>

          <div
            v-for="ticket in issuesStore.columns.investigating"
            :key="ticket._id"
            draggable="true"
            @dragstart="handleDragStart($event, ticket)"
            @dragend="handleDragEnd"
            @click="navigateTo(`/issues/${ticket._id}`)"
            :class="[
              'p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border rounded cursor-pointer active:cursor-grabbing transition-all space-y-1.5 group',
              draggedTicket?._id === ticket._id
                ? 'opacity-40 border-dashed border-ops-blue'
                : 'border-ops-border hover:border-ops-blue/80'
            ]"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <div class="flex items-center gap-1">
                <CommonStatusPill :status="ticket.severity" />
                <span class="text-3xs font-mono text-ops-text-dim group-hover:text-ops-blue-glow transition">↗</span>
              </div>
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug group-hover:text-ops-blue-glow transition">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-ops-text-dim flex items-center justify-between pt-1 border-t border-ops-border/40">
              <span class="text-blue-300">In Triage</span>
              <span>{{ ticket.internalNotes?.length || 0 }} note(s)</span>
            </div>
          </div>

          <div v-if="issuesStore.columns.investigating.length === 0 && activeDropZone !== 'investigating'" class="p-8 text-center text-2xs font-mono text-ops-text-dark">
            No active investigations
          </div>
        </div>
      </div>

      <!-- Stage 3: Fixed (Staging) -->
      <div
        :class="[
          'bg-ops-surface rounded border transition-all duration-200 flex flex-col min-h-[500px]',
          activeDropZone === 'fixed'
            ? 'border-ops-blue ring-2 ring-ops-blue/50 bg-ops-blue/5'
            : 'border-ops-border'
        ]"
        @dragover.prevent="handleDragOver($event, 'fixed')"
        @dragenter.prevent="handleDragEnter('fixed')"
        @dragleave="handleDragLeave($event, 'fixed')"
        @drop="handleDrop($event, 'fixed')"
      >
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-purple-400" />
            <span class="font-bold text-ops-text-bright">FIXED (STAGING)</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.fixed.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <!-- Drop Indicator -->
          <div
            v-if="activeDropZone === 'fixed' && draggedTicket?.status !== 'fixed'"
            class="p-3 border-2 border-dashed border-ops-blue/60 bg-ops-blue/10 rounded text-center text-2xs font-mono text-ops-blue-glow animate-pulse"
          >
            Move ticket to Fixed (Staging)
          </div>

          <div
            v-for="ticket in issuesStore.columns.fixed"
            :key="ticket._id"
            draggable="true"
            @dragstart="handleDragStart($event, ticket)"
            @dragend="handleDragEnd"
            @click="navigateTo(`/issues/${ticket._id}`)"
            :class="[
              'p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border rounded cursor-pointer active:cursor-grabbing transition-all space-y-1.5 group',
              draggedTicket?._id === ticket._id
                ? 'opacity-40 border-dashed border-ops-blue'
                : 'border-ops-border hover:border-ops-blue/80'
            ]"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <div class="flex items-center gap-1">
                <CommonStatusPill :status="ticket.severity" />
                <span class="text-3xs font-mono text-ops-text-dim group-hover:text-ops-blue-glow transition">↗</span>
              </div>
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug group-hover:text-ops-blue-glow transition">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-purple-300 pt-1 border-t border-ops-border/40">
              Ready for QA Verification
            </div>
          </div>

          <div v-if="issuesStore.columns.fixed.length === 0 && activeDropZone !== 'fixed'" class="p-8 text-center text-2xs font-mono text-ops-text-dark">
            No tickets waiting verification
          </div>
        </div>
      </div>

      <!-- Stage 4: Verified / Resolved -->
      <div
        :class="[
          'bg-ops-surface rounded border transition-all duration-200 flex flex-col min-h-[500px]',
          activeDropZone === 'verified'
            ? 'border-ops-blue ring-2 ring-ops-blue/50 bg-ops-blue/5'
            : 'border-ops-border'
        ]"
        @dragover.prevent="handleDragOver($event, 'verified')"
        @dragenter.prevent="handleDragEnter('verified')"
        @dragleave="handleDragLeave($event, 'verified')"
        @drop="handleDrop($event, 'verified')"
      >
        <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400" />
            <span class="font-bold text-ops-text-bright">VERIFIED (QA)</span>
          </div>
          <span class="px-1.5 py-0.2 bg-ops-obsidian rounded text-ops-text-dim font-bold">{{ issuesStore.columns.verified.length }}</span>
        </div>

        <div class="p-2 space-y-2 flex-1 overflow-y-auto">
          <!-- Drop Indicator -->
          <div
            v-if="activeDropZone === 'verified' && draggedTicket?.status !== 'verified'"
            class="p-3 border-2 border-dashed border-ops-blue/60 bg-ops-blue/10 rounded text-center text-2xs font-mono text-ops-blue-glow animate-pulse"
          >
            Move ticket to Verified (QA)
          </div>

          <div
            v-for="ticket in issuesStore.columns.verified"
            :key="ticket._id"
            draggable="true"
            @dragstart="handleDragStart($event, ticket)"
            @dragend="handleDragEnd"
            @click="navigateTo(`/issues/${ticket._id}`)"
            :class="[
              'p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border rounded cursor-pointer active:cursor-grabbing transition-all space-y-1.5 group',
              draggedTicket?._id === ticket._id
                ? 'opacity-40 border-dashed border-ops-blue'
                : 'border-ops-border hover:border-ops-blue/80'
            ]"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
              <div class="flex items-center gap-1">
                <CommonStatusPill :status="ticket.severity" />
                <span class="text-3xs font-mono text-ops-text-dim group-hover:text-ops-blue-glow transition">↗</span>
              </div>
            </div>
            <h4 class="font-bold text-xs text-ops-text-bright leading-snug group-hover:text-ops-blue-glow transition">{{ ticket.title }}</h4>
            <div class="text-2xs font-mono text-emerald-400 pt-1 border-t border-ops-border/40 flex items-center gap-1">
              <span>✓ Signed off for release</span>
            </div>
          </div>

          <div v-if="issuesStore.columns.verified.length === 0 && activeDropZone !== 'verified'" class="p-8 text-center text-2xs font-mono text-ops-text-dark">
            No verified tickets
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <IssuesIssueCreateModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIssuesStore } from '~/stores/issues';
import type { IIssueTicket, IssueStatus } from '../../../shared/types';

const issuesStore = useIssuesStore();

const draggedTicket = ref<IIssueTicket | null>(null);
const activeDropZone = ref<IssueStatus | null>(null);

onMounted(async () => {
  await issuesStore.fetchIssues();
});

function handleDragStart(event: DragEvent, ticket: IIssueTicket) {
  draggedTicket.value = ticket;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', ticket._id);
  }
}

function handleDragEnd() {
  draggedTicket.value = null;
  activeDropZone.value = null;
}

function handleDragOver(event: DragEvent, stage: IssueStatus) {
  if (draggedTicket.value && draggedTicket.value.status !== stage) {
    activeDropZone.value = stage;
  }
}

function handleDragEnter(stage: IssueStatus) {
  if (draggedTicket.value && draggedTicket.value.status !== stage) {
    activeDropZone.value = stage;
  }
}

function handleDragLeave(event: DragEvent, stage: IssueStatus) {
  const related = event.relatedTarget as HTMLElement | null;
  const current = event.currentTarget as HTMLElement | null;
  if (!current || !related || !current.contains(related)) {
    if (activeDropZone.value === stage) {
      activeDropZone.value = null;
    }
  }
}

async function handleDrop(event: DragEvent, targetStage: IssueStatus) {
  activeDropZone.value = null;
  const ticket = draggedTicket.value;
  draggedTicket.value = null;

  if (!ticket || ticket.status === targetStage) return;

  await issuesStore.transitionStatus(
    ticket._id,
    targetStage,
    `Stage moved from ${ticket.status.toUpperCase()} to ${targetStage.toUpperCase()} via Kanban board drag & drop`
  );
}
</script>
