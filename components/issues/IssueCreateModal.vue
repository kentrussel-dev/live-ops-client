<template>
  <div
    v-if="issuesStore.isCreateModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="issuesStore.isCreateModalOpen = false"
  >
    <div class="w-full max-w-2xl bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
        <div>
          <span class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">QA Telemetry & Bug Reporting</span>
          <h3 class="text-sm font-bold text-ops-text-bright">Report Live-Ops Issue Ticket</h3>
        </div>
        <button @click="issuesStore.isCreateModalOpen = false" class="text-ops-text-dim hover:text-ops-text-bright p-1">
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 overflow-y-auto space-y-4 flex-1">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Ticket Key *</label>
            <input
              v-model="form.ticketKey"
              type="text"
              required
              placeholder="e.g. ISSUE-1050"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
            />
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Severity Level *</label>
            <select
              v-model="form.severity"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
            >
              <option value="critical_blocker">Critical Blocker (P0)</option>
              <option value="major">Major (P1)</option>
              <option value="moderate">Moderate (P2)</option>
              <option value="minor">Minor (P3)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Ticket Title *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="e.g. Boss enrage timer fails to trigger on APAC-East"
            class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
          />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Category *</label>
            <select
              v-model="form.category"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright"
            >
              <option value="quest">Quest Progression</option>
              <option value="loot_table">Loot & Drop Table</option>
              <option value="combat_balance">Combat & Balance</option>
              <option value="client_crash">Client Crash</option>
              <option value="shop_billing">Shop & Billing</option>
              <option value="server_lag">Server Lag & Desync</option>
              <option value="ui_glitch">UI Glitch</option>
            </select>
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Affected Cluster</label>
            <select
              v-model="form.affectedCluster"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright"
            >
              <option value="Global">Global</option>
              <option value="NA-East">NA-East</option>
              <option value="EU-Central">EU-Central</option>
              <option value="APAC-East">APAC-East</option>
            </select>
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Affected Version</label>
            <input
              v-model="form.affectedVersion"
              type="text"
              placeholder="e.g. v2.4.0"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright"
            />
          </div>
        </div>

        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Bug Description & Symptoms *</label>
          <textarea
            v-model="form.description"
            required
            rows="3"
            placeholder="Detailed description of unexpected behavior..."
            class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
          ></textarea>
        </div>

        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Reproduction Steps (one per line)</label>
          <textarea
            v-model="reproStepsText"
            rows="3"
            placeholder="1. Log into character in Zone 4&#10;2. Engage Harvester enemy&#10;3. Observe drop counter..."
            class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
          ></textarea>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2 border-t border-ops-border">
          <button
            type="button"
            @click="issuesStore.isCreateModalOpen = false"
            class="px-3.5 py-1.5 border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded font-mono text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold rounded text-xs transition"
          >
            Submit Issue Ticket
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useIssuesStore } from '~/stores/issues';

const issuesStore = useIssuesStore();

const reproStepsText = ref('');

const form = ref<any>({
  ticketKey: `ISSUE-${Math.floor(1000 + Math.random() * 9000)}`,
  title: '',
  description: '',
  category: 'quest',
  severity: 'moderate',
  status: 'reported',
  affectedCluster: 'Global',
  affectedVersion: 'v2.4.0',
});

async function handleSubmit() {
  const steps = reproStepsText.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  await issuesStore.createIssue({
    ...form.value,
    reproductionSteps: steps,
  });
}
</script>
