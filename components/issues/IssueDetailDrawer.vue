<template>
  <div
    v-if="issuesStore.isDrawerOpen && issuesStore.selectedIssue"
    class="fixed inset-0 z-40 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
    @click.self="issuesStore.closeDetail()"
  >
    <div class="w-full max-w-xl bg-ops-surface border-l border-ops-border h-full flex flex-col shadow-2xl p-0 font-sans text-xs">
      <!-- Header -->
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-xs text-ops-blue-glow px-1.5 py-0.5 bg-ops-border rounded">
              {{ issuesStore.selectedIssue.ticketKey }}
            </span>
            <CommonStatusPill :status="issuesStore.selectedIssue.severity" />
            <CommonStatusPill :status="issuesStore.selectedIssue.status" />
          </div>
          <h3 class="mt-2 text-sm font-bold text-ops-text-bright">
            {{ issuesStore.selectedIssue.title }}
          </h3>
        </div>
        <button @click="issuesStore.closeDetail()" class="text-ops-text-dim hover:text-ops-text-bright p-1">
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Status Progression Action Bar (Live-Ops Editor only) -->
        <div v-if="authStore.canEdit" class="p-3 bg-ops-obsidian rounded border border-ops-border space-y-2">
          <div class="text-2xs font-mono font-semibold uppercase text-ops-text-dim">Advance Pipeline Stage</div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="st in availableTransitions"
              :key="st"
              @click="advanceStatus(st)"
              class="px-2.5 py-1 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border hover:border-ops-blue text-ops-text-bright font-mono text-2xs rounded capitalize transition"
            >
              Mark as → <span class="font-bold text-ops-blue-glow">{{ st }}</span>
            </button>
          </div>
        </div>

        <div v-else class="p-2.5 bg-ops-obsidian rounded border border-ops-border/70 text-2xs font-mono text-ops-text-dim flex items-center gap-2">
          <span class="text-amber-400">🔒</span>
          <span>Read-only role. Status progression actions restricted to Live-Ops Editor.</span>
        </div>

        <!-- Description -->
        <div>
          <label class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider block mb-1">Issue Description</label>
          <div class="p-3 bg-ops-obsidian rounded border border-ops-border text-xs text-ops-text-bright leading-relaxed">
            {{ issuesStore.selectedIssue.description }}
          </div>
        </div>

        <!-- Context Badges -->
        <div class="grid grid-cols-3 gap-2 font-mono text-2xs">
          <div class="p-2 bg-ops-obsidian rounded border border-ops-border">
            <span class="text-ops-text-dim block">CATEGORY:</span>
            <span class="text-ops-text-bright font-semibold uppercase">{{ issuesStore.selectedIssue.category }}</span>
          </div>
          <div class="p-2 bg-ops-obsidian rounded border border-ops-border">
            <span class="text-ops-text-dim block">CLUSTER:</span>
            <span class="text-ops-text-bright font-semibold">{{ issuesStore.selectedIssue.affectedCluster || 'Global' }}</span>
          </div>
          <div class="p-2 bg-ops-obsidian rounded border border-ops-border">
            <span class="text-ops-text-dim block">VERSION:</span>
            <span class="text-ops-text-bright font-semibold">{{ issuesStore.selectedIssue.affectedVersion || 'v2.4.0' }}</span>
          </div>
        </div>

        <!-- Reproduction Steps -->
        <div v-if="issuesStore.selectedIssue.reproductionSteps?.length">
          <label class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider block mb-1">Reproduction Pipeline</label>
          <div class="p-3 bg-ops-obsidian rounded border border-ops-border space-y-1.5">
            <div
              v-for="(step, idx) in issuesStore.selectedIssue.reproductionSteps"
              :key="idx"
              class="text-xs text-ops-text-base flex items-start gap-2 font-mono"
            >
              <span class="text-ops-text-dim">{{ idx + 1 }}.</span>
              <span>{{ step.replace(/^[0-9]+\.\s*/, '') }}</span>
            </div>
          </div>
        </div>

        <!-- Resolution Notes (if present) -->
        <div v-if="issuesStore.selectedIssue.resolutionNotes">
          <label class="text-2xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">Resolution Summary</label>
          <div class="p-3 bg-emerald-950/40 rounded border border-emerald-800/60 text-xs text-emerald-200">
            {{ issuesStore.selectedIssue.resolutionNotes }}
          </div>
        </div>

        <!-- Internal Notes / Investigation Timeline -->
        <div class="space-y-2">
          <label class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider block">Telemetry Notes Timeline</label>
          
          <div class="space-y-2">
            <div
              v-for="(n, idx) in issuesStore.selectedIssue.internalNotes"
              :key="idx"
              class="p-2.5 bg-ops-obsidian rounded border border-ops-border space-y-1"
            >
              <div class="flex items-center justify-between text-2xs font-mono text-ops-text-dim">
                <span class="font-bold text-ops-text-bright">{{ n.author }} ({{ n.authorRole }})</span>
                <span>{{ timeAgo(n.timestamp) }}</span>
              </div>
              <p class="text-xs text-ops-text-base">{{ n.note }}</p>
            </div>
          </div>

          <!-- Add Note Form -->
          <div class="pt-2 flex gap-2">
            <input
              v-model="newNoteText"
              type="text"
              placeholder="Append QA telemetry note..."
              @keyup.enter="appendNote"
              class="flex-1 bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
            />
            <button
              @click="appendNote"
              class="px-3 py-1.5 bg-ops-border hover:bg-ops-surface-hover text-ops-text-bright font-mono text-xs rounded transition"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIssuesStore } from '~/stores/issues';
import { useAuthStore } from '~/stores/auth';
import { useTimeFormat } from '~/composables/useTimeFormat';
import type { IssueStatus } from '../../../shared/types';

const issuesStore = useIssuesStore();
const authStore = useAuthStore();
const { timeAgo } = useTimeFormat();

const newNoteText = ref('');

const allStatuses: IssueStatus[] = ['reported', 'investigating', 'fixed', 'verified', 'closed'];

const availableTransitions = computed(() => {
  if (!issuesStore.selectedIssue) return [];
  const current = issuesStore.selectedIssue.status;
  return allStatuses.filter((s) => s !== current);
});

async function advanceStatus(target: IssueStatus) {
  if (!issuesStore.selectedIssue) return;
  const resolution = target === 'fixed' || target === 'verified'
    ? `Resolved by ${authStore.user?.username || 'Live-Ops Team'}`
    : undefined;

  await issuesStore.transitionStatus(
    issuesStore.selectedIssue._id,
    target,
    `Status transitioned to '${target}' via triage drawer`,
    resolution
  );
}

async function appendNote() {
  if (!newNoteText.value.trim() || !issuesStore.selectedIssue) return;
  const text = newNoteText.value.trim();
  newNoteText.value = '';
  await issuesStore.addNote(issuesStore.selectedIssue._id, text);
}
</script>
