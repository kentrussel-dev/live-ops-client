<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Subsystem 03 / Versioning & Releases</div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Patch Notes & Version Diff Station</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="authStore.canEdit"
          @click="patchesStore.openCreateModal()"
          class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Draft New Patch Note</span>
        </button>
      </div>
    </div>

    <!-- Patch Notes Grid / Split Viewer -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Left Column: Version Catalog List -->
      <div class="space-y-2">
        <div class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim px-1">
          Release Packages ({{ patchesStore.patches.length }})
        </div>

        <div class="space-y-2">
          <div
            v-for="p in patchesStore.patches"
            :key="p._id"
            @click="selectedPatchId = p._id"
            :class="[
              'p-3 rounded border transition cursor-pointer',
              selectedPatchId === p._id
                ? 'bg-ops-surface border-ops-blue/80 shadow-md'
                : 'bg-ops-surface/60 border-ops-border hover:bg-ops-surface hover:border-ops-border-light'
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-sm text-ops-text-bright">{{ p.version }}</span>
                <span class="text-2xs font-mono text-ops-text-dim">Build {{ p.clientBuildNumber }}</span>
              </div>
              <CommonStatusPill :status="p.status" />
            </div>

            <p class="font-semibold text-xs text-ops-text-bright mt-1.5 truncate">{{ p.title }}</p>
            <p class="text-2xs text-ops-text-dim line-clamp-2 mt-0.5">{{ p.summary }}</p>

            <div class="mt-2 pt-2 border-t border-ops-border/60 flex items-center justify-between text-2xs font-mono text-ops-text-dim">
              <span>Target: {{ formatShortDate(p.targetPublishTime) }}</span>
              <span v-if="p.requiresMaintenance" class="text-amber-400 font-semibold">⚠ Downtime: {{ p.maintenanceDurationMinutes }}m</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Active Patch Note Inspector & Diff Controls -->
      <div class="lg:col-span-2 space-y-3">
        <div v-if="activePatch" class="bg-ops-surface rounded border border-ops-border p-4 space-y-4">
          <!-- Active Patch Header -->
          <div class="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-ops-border">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-mono font-bold text-ops-text-bright">{{ activePatch.version }}</span>
                <span class="text-xs font-mono text-ops-text-dim">Client {{ activePatch.clientBuildNumber }} / Server {{ activePatch.serverBuildNumber }}</span>
                <CommonStatusPill :status="activePatch.status" />
              </div>
              <h2 class="text-sm font-bold text-ops-text-bright mt-1">{{ activePatch.title }}</h2>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 font-mono text-xs">
              <!-- Diff Button (compares with previous version if available) -->
              <button
                v-if="previousPatch"
                @click="patchesStore.loadDiff(activePatch._id, previousPatch._id)"
                class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-border border border-ops-border text-ops-text-bright rounded flex items-center gap-1 transition"
                title="Compare diff against previous version"
              >
                <span>🔍 Compare Diff vs {{ previousPatch.version }}</span>
              </button>

              <template v-if="authStore.canEdit">
                <button
                  @click="patchesStore.openEditModal(activePatch)"
                  class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-border border border-ops-border text-ops-text-bright rounded transition"
                >
                  Edit Release Notes
                </button>

                <button
                  v-if="activePatch.status !== 'published'"
                  @click="patchesStore.publish(activePatch._id)"
                  class="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded transition"
                >
                  Publish to Live Network
                </button>
              </template>
            </div>
          </div>

          <!-- Summary Callout -->
          <div class="p-3 bg-ops-obsidian rounded border border-ops-border text-xs text-ops-text-bright leading-relaxed">
            <span class="text-2xs font-mono uppercase text-ops-text-dim block mb-1 font-semibold">Executive Overview</span>
            {{ activePatch.summary }}
          </div>

          <!-- Structured Changelog Sections -->
          <div class="space-y-4">
            <div
              v-for="sec in activePatch.sections"
              :key="sec.id"
              class="p-3 bg-ops-obsidian rounded border border-ops-border space-y-2"
            >
              <div class="flex items-center justify-between pb-1.5 border-b border-ops-border/60">
                <span class="text-xs font-mono font-bold text-ops-text-bright uppercase tracking-wider">
                  {{ sec.title }}
                </span>
                <span class="text-2xs font-mono px-1.5 py-0.2 bg-ops-surface rounded text-ops-text-dim uppercase">
                  {{ sec.category }}
                </span>
              </div>

              <ul class="space-y-1.5 pl-2">
                <li
                  v-for="(item, idx) in sec.items"
                  :key="idx"
                  class="text-xs text-ops-text-base flex items-start gap-2"
                >
                  <span class="text-ops-blue-glow font-mono font-bold">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-else class="p-12 text-center text-ops-text-dim font-mono bg-ops-surface rounded border border-ops-border">
          Select a patch release package from the catalog list to inspect changelog details.
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PatchesPatchDiffViewer />
    <PatchesPatchEditModal />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePatchesStore } from '~/stores/patches';
import { useAuthStore } from '~/stores/auth';
import { useTimeFormat } from '~/composables/useTimeFormat';

const patchesStore = usePatchesStore();
const authStore = useAuthStore();
const { formatShortDate } = useTimeFormat();

const selectedPatchId = ref<string>('');

onMounted(async () => {
  await patchesStore.fetchPatches();
  if (patchesStore.patches.length > 0) {
    selectedPatchId.value = patchesStore.patches[0]._id;
  }
});

const activePatch = computed(() => {
  return patchesStore.patches.find((p) => p._id === selectedPatchId.value) || patchesStore.patches[0];
});

const previousPatch = computed(() => {
  if (!activePatch.value) return null;
  const idx = patchesStore.patches.findIndex((p) => p._id === activePatch.value._id);
  if (idx !== -1 && idx + 1 < patchesStore.patches.length) {
    return patchesStore.patches[idx + 1];
  }
  return null;
});
</script>
