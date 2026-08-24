<template>
  <div
    v-if="shopStore.isBatchModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="shopStore.isBatchModalOpen = false"
  >
    <div class="w-full max-w-lg bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs flex flex-col">
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
        <div>
          <span class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">Batch Operational Promotion</span>
          <h3 class="text-sm font-bold text-ops-text-bright">
            Shift {{ shopStore.selectedItemIdsForBatch.length }} Selected Item(s)
          </h3>
        </div>
        <button @click="shopStore.isBatchModalOpen = false" class="text-ops-text-dim hover:text-ops-text-bright p-1">
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Target Rotation Status *</label>
          <select
            v-model="targetStatus"
            required
            class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
          >
            <option value="featured">Promote to Featured Banner</option>
            <option value="flash_sale">Activate Flash Sale (Discounted)</option>
            <option value="standard">Revert to Standard Catalog</option>
            <option value="retired">Vault / Retire from Shop</option>
          </select>
        </div>

        <div v-if="targetStatus === 'flash_sale'">
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Apply Discount Percentage (%)</label>
          <input
            v-model.number="discountPct"
            type="number"
            min="5"
            max="90"
            placeholder="e.g. 30"
            class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 font-mono text-xs text-ops-text-bright"
          />
        </div>

        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Reason / Operational Memo</label>
          <input
            v-model="reason"
            type="text"
            placeholder="e.g. Weekend Flash Sale promotion cycle"
            class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 text-xs text-ops-text-bright"
          />
        </div>

        <div class="pt-2 flex items-center justify-end gap-2 border-t border-ops-border">
          <button
            type="button"
            @click="shopStore.isBatchModalOpen = false"
            class="px-3.5 py-1.5 border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded font-mono text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold rounded text-xs transition"
          >
            Dispatch Batch Shift
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useShopStore } from '~/stores/shop';
import type { RotationStatus } from '../../../shared/types';

const shopStore = useShopStore();

const targetStatus = ref<RotationStatus>('flash_sale');
const discountPct = ref<number | undefined>(25);
const reason = ref('');

async function handleSubmit() {
  await shopStore.executeBatchRotate(
    targetStatus.value,
    targetStatus.value === 'flash_sale' ? discountPct.value : undefined,
    undefined,
    reason.value
  );
}
</script>
