<template>
  <div
    v-if="timelineStore.selectedItem"
    class="fixed inset-0 z-40 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
    @click.self="timelineStore.selectItem(null)"
  >
    <div class="w-full max-w-lg bg-ops-surface border-l border-ops-border h-full flex flex-col shadow-2xl p-0 font-sans text-xs">
      <!-- Drawer Header -->
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xs font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-ops-border text-ops-text-dim">
              Track: {{ timelineStore.selectedItem.track.toUpperCase() }}
            </span>
            <CommonStatusPill :status="timelineStore.selectedItem.status" />
          </div>
          <h3 class="mt-1.5 text-sm font-bold text-ops-text-bright tracking-tight">
            {{ timelineStore.selectedItem.title }}
          </h3>
        </div>

        <button
          @click="timelineStore.selectItem(null)"
          class="p-1.5 text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-border rounded transition"
          aria-label="Close drawer"
        >
          ✕
        </button>
      </div>

      <!-- Drawer Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Schedule Window Block -->
        <div class="bg-ops-obsidian p-3 rounded border border-ops-border space-y-2 font-mono text-2xs">
          <div class="text-ops-text-dim uppercase tracking-wider font-semibold">Operational Window (UTC)</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-ops-text-dim block text-2xs">START:</span>
              <span class="text-ops-text-bright font-semibold">{{ formatUtc(timelineStore.selectedItem.startTime) }}</span>
            </div>
            <div>
              <span class="text-ops-text-dim block text-2xs">END:</span>
              <span class="text-ops-text-bright font-semibold">{{ formatUtc(timelineStore.selectedItem.endTime) }}</span>
            </div>
          </div>
          <div class="pt-1 border-t border-ops-border/60 flex items-center justify-between text-ops-text-dim">
            <span>DURATION:</span>
            <span class="text-ops-text-bright">{{ getDurationHours(timelineStore.selectedItem.startTime, timelineStore.selectedItem.endTime) }}</span>
          </div>
        </div>

        <!-- Metadata Breakdown -->
        <div v-if="timelineStore.selectedItem.subtitle" class="space-y-1">
          <label class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider">Classification & Context</label>
          <div class="p-2.5 bg-ops-obsidian rounded border border-ops-border font-mono text-xs text-ops-text-bright">
            {{ timelineStore.selectedItem.subtitle }}
          </div>
        </div>

        <!-- Extra Details Payload -->
        <div v-if="timelineStore.selectedItem.metadata" class="space-y-1">
          <label class="text-2xs font-mono text-ops-text-dim uppercase tracking-wider">Telemetry Payload</label>
          <pre class="p-3 bg-ops-obsidian rounded border border-ops-border font-mono text-2xs text-emerald-300 overflow-x-auto">{{ JSON.stringify(timelineStore.selectedItem.metadata, null, 2) }}</pre>
        </div>
      </div>

      <!-- Drawer Footer Actions -->
      <div class="p-3.5 border-t border-ops-border bg-ops-subtle flex items-center justify-between gap-3">
        <button
          @click="timelineStore.selectItem(null)"
          class="px-3 py-1.5 border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded text-xs font-mono transition"
        >
          Dismiss
        </button>

        <div class="flex items-center gap-2">
          <!-- Deep link to corresponding page -->
          <NuxtLink
            v-if="timelineStore.selectedItem.track === 'event'"
            to="/events"
            class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-semibold rounded text-xs transition"
          >
            Open Event Manager →
          </NuxtLink>

          <NuxtLink
            v-else-if="timelineStore.selectedItem.track === 'patch'"
            to="/patches"
            class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-semibold rounded text-xs transition"
          >
            Open Patch Station →
          </NuxtLink>

          <NuxtLink
            v-else-if="timelineStore.selectedItem.track === 'shop'"
            to="/shop"
            class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-semibold rounded text-xs transition"
          >
            Open Shop Matrix →
          </NuxtLink>

          <NuxtLink
            v-else-if="timelineStore.selectedItem.track === 'incident'"
            to="/issues"
            class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-semibold rounded text-xs transition"
          >
            Open Incident Triage →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTimelineStore } from '~/stores/timeline';
import { useTimeFormat } from '~/composables/useTimeFormat';

const timelineStore = useTimelineStore();
const { formatUtc, getDurationHours } = useTimeFormat();
</script>
