<template>
  <div class="space-y-4 max-w-6xl mx-auto font-sans">
    <!-- Breadcrumb & Top Command Action Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ops-border">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/issues"
          class="px-2.5 py-1.5 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border text-ops-text-dim hover:text-ops-text-bright text-xs font-mono rounded transition flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Pipeline Board</span>
        </NuxtLink>

        <div class="h-4 w-px bg-ops-border" />

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-ops-blue-glow">{{ form.ticketKey || 'TICKET' }}</span>
          <CommonStatusPill v-if="form.severity" :status="form.severity" />
          <CommonStatusPill v-if="form.status" :status="form.status" />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="authStore.canEdit"
          @click="handleSave"
          :disabled="isSaving"
          class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow disabled:opacity-50"
        >
          <span v-if="isSaving" class="animate-spin text-sm">↻</span>
          <span>{{ isSaving ? 'Saving Changes...' : 'Save Ticket' }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 text-center text-xs font-mono text-ops-text-dim">
      <span class="animate-spin inline-block text-base mr-2">↻</span>
      <span>Loading ticket telemetry from pipeline database...</span>
    </div>

    <!-- Main Full-Screen Split View -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <!-- Left Column: Primary Specification & Steps (8 cols) -->
      <div class="lg:col-span-8 space-y-4">
        <!-- Title Input -->
        <div class="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Issue Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              :disabled="!authStore.canEdit"
              placeholder="Descriptive summary of the defect or incident"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-sm font-bold text-ops-text-bright focus:border-ops-blue outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Detailed Description & Symptoms</label>
            <textarea
              v-model="form.description"
              rows="4"
              required
              :disabled="!authStore.canEdit"
              placeholder="Describe player impact, observed behavior, and crash stack or loot mismatch symptoms..."
              class="w-full bg-ops-obsidian border border-ops-border rounded p-3 text-xs text-ops-text-bright focus:border-ops-blue outline-none disabled:opacity-60 resize-y"
            />
          </div>
        </div>

        <!-- Reproduction Steps Builder -->
        <div class="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-ops-border/60">
            <h3 class="text-xs font-mono font-bold uppercase text-ops-text-bright flex items-center gap-1.5">
              <span>Reproduction Steps</span>
              <span class="text-2xs text-ops-text-dim">({{ form.reproductionSteps.length }} steps)</span>
            </h3>
            <button
              v-if="authStore.canEdit"
              type="button"
              @click="addReproductionStep"
              class="px-2 py-1 bg-ops-obsidian hover:bg-ops-subtle border border-ops-border text-ops-text-bright text-2xs font-mono rounded transition flex items-center gap-1"
            >
              <span>+</span>
              <span>Add Step</span>
            </button>
          </div>

          <div v-if="form.reproductionSteps.length === 0" class="p-4 text-center text-2xs font-mono text-ops-text-dark">
            No reproduction steps recorded for this ticket.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(step, index) in form.reproductionSteps"
              :key="index"
              class="flex items-center gap-2"
            >
              <span class="w-6 text-2xs font-mono text-ops-text-dim text-right shrink-0">{{ index + 1 }}.</span>
              <input
                v-model="form.reproductionSteps[index]"
                type="text"
                :disabled="!authStore.canEdit"
                placeholder="Step description..."
                class="flex-1 bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 text-xs text-ops-text-bright outline-none focus:border-ops-blue disabled:opacity-60"
              />
              <button
                v-if="authStore.canEdit"
                type="button"
                @click="removeReproductionStep(index)"
                class="p-1.5 text-ops-text-dim hover:text-rose-400 font-mono text-xs rounded hover:bg-rose-950/40 transition shrink-0"
                title="Remove step"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Resolution Notes (Engineering / Release Sign-Off) -->
        <div class="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-2">
          <h3 class="text-xs font-mono font-bold uppercase text-ops-text-bright">Engineering Resolution Notes</h3>
          <p class="text-2xs text-ops-text-dim">Document root cause analysis, deployed commit hashes, or hotfix build tags.</p>
          <textarea
            v-model="form.resolutionNotes"
            rows="3"
            :disabled="!authStore.canEdit"
            placeholder="e.g. Resolved via server patch v2.4.1. Corrected drop multiplier table calculation in Zone 4."
            class="w-full bg-ops-obsidian border border-ops-border rounded p-3 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none disabled:opacity-60 resize-y"
          />
        </div>
      </div>

      <!-- Right Column: Pipeline Stage & Telemetry Controls (4 cols) -->
      <div class="lg:col-span-4 space-y-4">
        <!-- Stage Transition Quick Actions -->
        <div class="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
          <div class="text-2xs font-mono uppercase text-ops-text-dim">Pipeline Stage</div>

          <div class="grid grid-cols-2 gap-2 text-2xs font-mono">
            <button
              v-for="st in availableStages"
              :key="st.key"
              type="button"
              :disabled="!authStore.canEdit"
              @click="handleQuickStage(st.key)"
              :class="[
                'p-2 rounded border text-left transition flex flex-col justify-between gap-1',
                form.status === st.key
                  ? `${st.activeClass} font-bold shadow`
                  : 'bg-ops-obsidian hover:bg-ops-subtle border-ops-border text-ops-text-dim'
              ]"
            >
              <span>{{ st.label }}</span>
              <span class="text-3xs opacity-60">{{ form.status === st.key ? 'Current' : 'Advance →' }}</span>
            </button>
          </div>
        </div>

        <!-- Classification & Assignee Parameters -->
        <div class="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3 text-xs">
          <div class="text-2xs font-mono uppercase text-ops-text-dim pb-1 border-b border-ops-border/60">
            Ticket Classification & Assignment
          </div>

          <!-- Assignee Selector Dropdown -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-2xs font-mono uppercase text-ops-text-dim">Assigned Operator</label>
              <button
                v-if="authStore.canEdit && authStore.user"
                type="button"
                @click="form.assignedTo = authStore.user.username"
                class="text-3xs font-mono text-ops-blue-glow hover:underline"
              >
                Assign to Me
              </button>
            </div>
            <select
              v-model="form.assignedTo"
              :disabled="!authStore.canEdit"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue disabled:opacity-60"
            >
              <option value="">Unassigned</option>
              <option
                v-for="op in operatorsList"
                :key="op._id"
                :value="op.username"
              >
                @{{ op.username }} ({{ op.department }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Severity Level</label>
            <select
              v-model="form.severity"
              :disabled="!authStore.canEdit"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue disabled:opacity-60"
            >
              <option value="critical_blocker">Critical Blocker (P0)</option>
              <option value="major">Major (P1)</option>
              <option value="moderate">Moderate (P2)</option>
              <option value="minor">Minor (P3)</option>
            </select>
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Category</label>
            <select
              v-model="form.category"
              :disabled="!authStore.canEdit"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue disabled:opacity-60"
            >
              <option value="quest">Quest & Progression</option>
              <option value="loot_table">Loot Table & Drops</option>
              <option value="combat_balance">Combat & Balance</option>
              <option value="client_crash">Client Crash / GPU</option>
              <option value="shop_billing">Shop & Billing</option>
              <option value="server_lag">Server Lag & Tick Rate</option>
              <option value="ui_glitch">UI Glitch & Rendering</option>
            </select>
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Affected Server Cluster</label>
            <select
              v-model="form.affectedCluster"
              :disabled="!authStore.canEdit"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue disabled:opacity-60"
            >
              <option value="Global">Global (All Clusters)</option>
              <option value="NA-East">NA-East</option>
              <option value="EU-Central">EU-Central</option>
              <option value="APAC-East">APAC-East</option>
              <option value="Staging-Internal">Staging-Internal</option>
            </select>
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Build Version</label>
            <input
              v-model="form.affectedVersion"
              type="text"
              :disabled="!authStore.canEdit"
              placeholder="v2.4.0"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue disabled:opacity-60"
            />
          </div>
        </div>

        <!-- Internal Notes Log Stream -->
        <div class="bg-ops-surface border border-ops-border rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between pb-1 border-b border-ops-border/60">
            <span class="text-2xs font-mono uppercase text-ops-text-dim">Investigation Notes ({{ form.internalNotes.length }})</span>
          </div>

          <!-- Add Note Box -->
          <div class="space-y-1.5">
            <textarea
              v-model="newNoteText"
              rows="2"
              placeholder="Add internal engineering or QA observation..."
              class="w-full bg-ops-obsidian border border-ops-border rounded p-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans resize-none"
            />
            <button
              type="button"
              @click="handleAddNote"
              :disabled="!newNoteText.trim()"
              class="w-full py-1 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright text-xs font-mono rounded transition disabled:opacity-50"
            >
              Append Note
            </button>
          </div>

          <!-- Notes Stream Timeline -->
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="(n, idx) in reversedNotes"
              :key="idx"
              class="p-2.5 bg-ops-obsidian rounded border border-ops-border text-2xs space-y-1 font-mono"
            >
              <div class="flex items-center justify-between text-ops-text-dim">
                <span class="font-bold text-ops-blue-glow">@{{ n.author }} ({{ n.authorRole }})</span>
                <span class="text-3xs">{{ formatTime(n.timestamp) }}</span>
              </div>
              <p class="text-ops-text-bright whitespace-pre-wrap font-sans text-xs">{{ n.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useIssuesStore } from '~/stores/issues';
import { useAuthStore } from '~/stores/auth';
import { useToast } from '~/composables/useToast';
import { format } from 'date-fns';
import type { IssueStatus, IssueSeverity, IssueCategory, ServerCluster, IIssueInternalNote } from '../../../shared/types';

const route = useRoute();
const router = useRouter();
const issuesStore = useIssuesStore();
const authStore = useAuthStore();
const toast = useToast();

const issueId = route.params.id as string;
const isLoading = ref(true);
const isSaving = ref(false);
const newNoteText = ref('');
const operatorsList = ref<any[]>([]);

const form = reactive({
  _id: '',
  ticketKey: '',
  title: '',
  description: '',
  category: 'quest' as IssueCategory,
  severity: 'moderate' as IssueSeverity,
  status: 'reported' as IssueStatus,
  affectedCluster: 'Global' as ServerCluster,
  affectedVersion: '',
  assignedTo: '',
  reproductionSteps: [] as string[],
  resolutionNotes: '',
  reportedBy: '',
  internalNotes: [] as IIssueInternalNote[],
});

const reversedNotes = computed(() => [...form.internalNotes].reverse());

const availableStages = [
  { key: 'reported' as IssueStatus, label: 'Reported', activeClass: 'bg-amber-950/80 text-amber-300 border-amber-700' },
  { key: 'investigating' as IssueStatus, label: 'Investigating', activeClass: 'bg-blue-950/80 text-blue-300 border-blue-700' },
  { key: 'fixed' as IssueStatus, label: 'Fixed (Staging)', activeClass: 'bg-purple-950/80 text-purple-300 border-purple-700' },
  { key: 'verified' as IssueStatus, label: 'Verified (QA)', activeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700' },
];

onMounted(async () => {
  try {
    const api = useApi();
    const res = await api.get('/auth/users');
    if (res.success && res.data) {
      operatorsList.value = res.data.users || [];
    }
  } catch (_) {}

  const issue = await issuesStore.fetchIssueById(issueId);
  if (issue) {
    form._id = issue._id;
    form.ticketKey = issue.ticketKey;
    form.title = issue.title;
    form.description = issue.description;
    form.category = issue.category;
    form.severity = issue.severity;
    form.status = issue.status;
    form.affectedCluster = (issue.affectedCluster || 'Global') as ServerCluster;
    form.affectedVersion = issue.affectedVersion || '';
    form.assignedTo = (typeof issue.assignedTo === 'object' && issue.assignedTo ? (issue.assignedTo as any).username : issue.assignedTo) || '';
    form.reproductionSteps = [...(issue.reproductionSteps || [])];
    form.resolutionNotes = issue.resolutionNotes || '';
    form.reportedBy = issue.reportedBy || '';
    form.internalNotes = issue.internalNotes ? [...issue.internalNotes] : [];
  } else {
    toast.error('Ticket Not Found', `No issue ticket matches ID: ${issueId}`);
    router.push('/issues');
  }
  isLoading.value = false;
});

function addReproductionStep() {
  form.reproductionSteps.push('');
}

function removeReproductionStep(index: number) {
  form.reproductionSteps.splice(index, 1);
}

function handleQuickStage(newStatus: IssueStatus) {
  form.status = newStatus;
}

function formatTime(ts: string) {
  try {
    return format(new Date(ts), 'yyyy-MM-dd HH:mm');
  } catch (_) {
    return ts;
  }
}

async function handleSave() {
  isSaving.value = true;
  const success = await issuesStore.updateIssue(issueId, {
    title: form.title,
    description: form.description,
    category: form.category,
    severity: form.severity,
    status: form.status,
    affectedCluster: form.affectedCluster,
    affectedVersion: form.affectedVersion,
    assignedTo: form.assignedTo,
    reproductionSteps: form.reproductionSteps.filter((s) => s.trim() !== ''),
    resolutionNotes: form.resolutionNotes,
  });

  if (success) {
    toast.success('Ticket Saved', `Updated details for [${form.ticketKey}].`);
  }
  isSaving.value = false;
}

async function handleAddNote() {
  if (!newNoteText.value.trim()) return;
  const ok = await issuesStore.addNote(issueId, newNoteText.value.trim());
  if (ok) {
    form.internalNotes.push({
      author: authStore.user?.username || 'operator',
      authorRole: authStore.role,
      note: newNoteText.value.trim(),
      timestamp: new Date().toISOString(),
    });
    newNoteText.value = '';
  }
}
</script>
