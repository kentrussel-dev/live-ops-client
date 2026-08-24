<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Subsystem 06 / Governance & Telemetry</div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Tamper-Evident System Audit Trail</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="systemStore.fetchAuditLogs()"
          class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright font-mono text-xs rounded transition flex items-center gap-1.5"
        >
          <span>↻</span>
          <span>Refresh Trail</span>
        </button>
      </div>
    </div>

    <!-- Audit Log Table -->
    <div class="bg-ops-surface rounded border border-ops-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-sans">
          <thead class="bg-ops-subtle border-b border-ops-border font-mono text-2xs text-ops-text-dim uppercase tracking-wider">
            <tr>
              <th class="p-3">Timestamp (UTC)</th>
              <th class="p-3">Action Type</th>
              <th class="p-3">Operator & Role</th>
              <th class="p-3">Operational Details</th>
              <th class="p-3">Entity Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ops-border/60">
            <tr
              v-for="log in systemStore.recentAuditLogs"
              :key="log._id"
              class="hover:bg-ops-surface-hover/80 transition"
            >
              <!-- Timestamp -->
              <td class="p-3 whitespace-nowrap font-mono text-2xs text-ops-text-dim">
                {{ formatUtc(log.createdAt) }}
              </td>

              <!-- Action Type -->
              <td class="p-3 whitespace-nowrap font-mono font-bold text-2xs text-ops-blue-glow">
                {{ log.action }}
              </td>

              <!-- Operator -->
              <td class="p-3 whitespace-nowrap text-xs">
                <span class="font-semibold text-ops-text-bright">{{ log.performedBy }}</span>
                <span class="text-2xs font-mono text-ops-text-dim block">{{ log.userRole }}</span>
              </td>

              <!-- Details -->
              <td class="p-3 text-xs text-ops-text-bright leading-relaxed max-w-md">
                {{ log.details }}
              </td>

              <!-- Entity Type -->
              <td class="p-3 whitespace-nowrap font-mono text-2xs text-ops-text-dim uppercase">
                {{ log.entityType }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSystemStore } from '~/stores/system';
import { useTimeFormat } from '~/composables/useTimeFormat';

const systemStore = useSystemStore();
const { formatUtc } = useTimeFormat();

onMounted(async () => {
  await systemStore.fetchOverview();
});
</script>
