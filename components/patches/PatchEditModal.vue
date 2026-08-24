<template>
  <div
    v-if="patchesStore.isModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="patchesStore.isModalOpen = false"
  >
    <div class="w-full max-w-3xl bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
        <div>
          <span class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">
            Release Engineering & Version Control
          </span>
          <h3 class="text-sm font-bold text-ops-text-bright">
            {{ form._id ? `Edit Patch Notes: ${form.version}` : 'Draft New Patch Release Notes' }}
          </h3>
        </div>
        <button @click="patchesStore.isModalOpen = false" class="text-ops-text-dim hover:text-ops-text-bright p-1">
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-4 overflow-y-auto space-y-4 flex-1">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Version (SemVer) *</label>
            <input
              v-model="form.version"
              type="text"
              required
              placeholder="e.g. v2.4.1"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
            />
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Client Build Number *</label>
            <input
              v-model="form.clientBuildNumber"
              type="text"
              required
              placeholder="e.g. 241.14"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
            />
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Server Build Number *</label>
            <input
              v-model="form.serverBuildNumber"
              type="text"
              required
              placeholder="e.g. 241.11"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Patch Headline Title *</label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="e.g. Urgent Collision & Memory Leak Hotfix"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
            />
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Status Lifecycle *</label>
            <select
              v-model="form.status"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
            >
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved for Deployment</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Executive Summary *</label>
          <textarea
            v-model="form.summary"
            required
            rows="2"
            placeholder="High-level overview of player-facing impact and critical resolutions..."
            class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
          ></textarea>
        </div>

        <!-- Maintenance Settings -->
        <div class="p-3 bg-ops-obsidian rounded border border-ops-border flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer font-mono text-xs text-ops-text-bright">
            <input
              type="checkbox"
              v-model="form.requiresMaintenance"
              class="rounded bg-ops-surface border-ops-border text-ops-blue"
            />
            <span>Requires Server Maintenance Window</span>
          </label>

          <div v-if="form.requiresMaintenance" class="flex items-center gap-2 font-mono text-xs">
            <span class="text-ops-text-dim">Estimated Downtime:</span>
            <input
              v-model.number="form.maintenanceDurationMinutes"
              type="number"
              min="0"
              class="w-20 bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs text-ops-text-bright"
            />
            <span class="text-ops-text-dim">mins</span>
          </div>
        </div>

        <!-- Structured Changelog Sections -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-bright">Changelog Sections</div>
            <button
              type="button"
              @click="addSection"
              class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-blue-glow font-mono text-2xs rounded"
            >
              + Add Section
            </button>
          </div>

          <div v-for="(sec, sIdx) in form.sections" :key="sec.id" class="p-3 bg-ops-obsidian rounded border border-ops-border space-y-2">
            <div class="flex items-center justify-between gap-2">
              <input
                v-model="sec.title"
                type="text"
                placeholder="Section Title (e.g. Bug Fixes)"
                class="flex-1 bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs font-semibold text-ops-text-bright"
              />
              <select
                v-model="sec.category"
                class="bg-ops-surface border border-ops-border rounded px-2 py-1 font-mono text-2xs text-ops-text-bright"
              >
                <option value="features">Features</option>
                <option value="balance">Balance</option>
                <option value="bug_fixes">Bug Fixes</option>
                <option value="known_issues">Known Issues</option>
              </select>
              <button
                type="button"
                @click="removeSection(sIdx)"
                class="text-rose-400 hover:text-rose-300 p-1"
                title="Remove Section"
              >
                ✕
              </button>
            </div>

            <!-- Bullet Items -->
            <div class="space-y-1 pl-2">
              <div v-for="(item, iIdx) in sec.items" :key="iIdx" class="flex items-center gap-2">
                <span class="text-ops-text-dim font-mono">•</span>
                <input
                  v-model="sec.items[iIdx]"
                  type="text"
                  placeholder="Detail changelog item description..."
                  class="flex-1 bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs text-ops-text-bright"
                />
                <button
                  type="button"
                  @click="sec.items.splice(iIdx, 1)"
                  class="text-ops-text-dim hover:text-rose-400 p-0.5 text-2xs"
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                @click="sec.items.push('')"
                class="text-2xs font-mono text-ops-blue-glow hover:underline pt-1 block"
              >
                + Add bullet point
              </button>
            </div>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2 border-t border-ops-border">
          <button
            type="button"
            @click="patchesStore.isModalOpen = false"
            class="px-3.5 py-1.5 border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded font-mono text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold rounded text-xs transition"
          >
            Save Release Package
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePatchesStore } from '~/stores/patches';

const patchesStore = usePatchesStore();

const form = ref<any>({
  version: '',
  clientBuildNumber: '',
  serverBuildNumber: '',
  title: '',
  summary: '',
  status: 'draft',
  targetPublishTime: new Date().toISOString(),
  requiresMaintenance: false,
  maintenanceDurationMinutes: 0,
  sections: [],
});

watch(
  () => patchesStore.isModalOpen,
  (open) => {
    if (open) {
      if (patchesStore.selectedPatch) {
        form.value = JSON.parse(JSON.stringify(patchesStore.selectedPatch));
      } else {
        form.value = {
          version: '',
          clientBuildNumber: '241.01',
          serverBuildNumber: '241.01',
          title: '',
          summary: '',
          status: 'draft',
          targetPublishTime: new Date(Date.now() + 86400000).toISOString(),
          requiresMaintenance: false,
          maintenanceDurationMinutes: 0,
          sections: [
            { id: 'sec-1', title: 'New Features', category: 'features', items: [''] },
            { id: 'sec-2', title: 'Bug Fixes & Stabilizations', category: 'bug_fixes', items: [''] },
          ],
        };
      }
    }
  },
  { immediate: true }
);

function addSection() {
  form.value.sections.push({
    id: `sec-${Date.now()}`,
    title: 'Balance Adjustments',
    category: 'balance',
    items: [''],
  });
}

function removeSection(idx: number) {
  form.value.sections.splice(idx, 1);
}

async function handleSubmit() {
  await patchesStore.savePatch(form.value);
}
</script>
