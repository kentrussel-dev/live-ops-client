<template>
  <div
    v-if="patchesStore.isDiffModalOpen && patchesStore.diffData"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="patchesStore.isDiffModalOpen = false"
  >
    <div class="w-full max-w-4xl bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
        <div>
          <span class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">Patch Version Comparator</span>
          <h3 class="text-sm font-bold text-ops-text-bright flex items-center gap-2">
            <span>{{ patchesStore.diffData.currentVersion.version }}</span>
            <span class="text-ops-text-dim font-normal">vs</span>
            <span class="text-ops-text-dim">{{ patchesStore.diffData.previousVersion.version }}</span>
          </h3>
        </div>
        <button
          @click="patchesStore.isDiffModalOpen = false"
          class="text-ops-text-dim hover:text-ops-text-bright p-1"
        >
          ✕
        </button>
      </div>

      <!-- Diff Comparison Body -->
      <div class="p-4 overflow-y-auto flex-1 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- Current Version Column -->
          <div class="bg-ops-obsidian rounded border border-ops-border p-3 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-ops-border/60">
              <span class="font-mono font-bold text-emerald-400 text-xs">{{ patchesStore.diffData.currentVersion.version }} (Target)</span>
              <CommonStatusPill :status="patchesStore.diffData.currentVersion.status" />
            </div>

            <div v-for="sec in patchesStore.diffData.currentVersion.sections" :key="sec.id" class="space-y-1">
              <div class="text-2xs font-mono font-semibold text-ops-text-dim uppercase tracking-wider">{{ sec.title }}</div>
              <ul class="space-y-1 pl-2">
                <li v-for="(item, idx) in sec.items" :key="idx" class="text-xs text-ops-text-bright flex items-start gap-1.5">
                  <span class="text-emerald-400 font-mono">+</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Previous Version Column -->
          <div class="bg-ops-obsidian rounded border border-ops-border p-3 space-y-3 opacity-80">
            <div class="flex items-center justify-between pb-2 border-b border-ops-border/60">
              <span class="font-mono font-bold text-ops-text-dim text-xs">{{ patchesStore.diffData.previousVersion.version }} (Baseline)</span>
              <CommonStatusPill :status="patchesStore.diffData.previousVersion.status" />
            </div>

            <div v-for="sec in patchesStore.diffData.previousVersion.sections" :key="sec.id" class="space-y-1">
              <div class="text-2xs font-mono font-semibold text-ops-text-dim uppercase tracking-wider">{{ sec.title }}</div>
              <ul class="space-y-1 pl-2">
                <li v-for="(item, idx) in sec.items" :key="idx" class="text-xs text-ops-text-dim flex items-start gap-1.5">
                  <span class="text-ops-text-dark font-mono">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-ops-border bg-ops-subtle flex justify-end">
        <button
          @click="patchesStore.isDiffModalOpen = false"
          class="px-4 py-1.5 bg-ops-border hover:bg-ops-surface-hover text-ops-text-bright rounded font-mono text-xs transition"
        >
          Close Diff View
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePatchesStore } from '~/stores/patches';

const patchesStore = usePatchesStore();
</script>
