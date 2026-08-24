<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Subsystem 04 / Economy & Rotations</div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Shop & Equipment Rotation Matrix</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="authStore.canEdit"
          @click="shopStore.openCreateModal()"
          class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Add Shop Item</span>
        </button>
      </div>
    </div>

    <!-- Filter & Batch Action Toolbar -->
    <div class="p-3 bg-ops-surface rounded border border-ops-border space-y-3 text-xs">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Status Filter -->
          <select
            v-model="shopStore.filterStatus"
            @change="shopStore.fetchShopItems()"
            class="bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 font-mono text-xs text-ops-text-bright"
          >
            <option value="all">Status: All Rotations</option>
            <option value="featured">Featured Banners</option>
            <option value="flash_sale">Flash Sales</option>
            <option value="standard">Standard Catalog</option>
            <option value="retired">Retired / Vaulted</option>
          </select>

          <!-- Rarity Filter -->
          <select
            v-model="shopStore.filterRarity"
            @change="shopStore.fetchShopItems()"
            class="bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 font-mono text-xs text-ops-text-bright"
          >
            <option value="all">Rarity: All Tiers</option>
            <option value="mythic">Mythic</option>
            <option value="legendary">Legendary</option>
            <option value="epic">Epic</option>
            <option value="rare">Rare</option>
          </select>

          <!-- Category Filter -->
          <select
            v-model="shopStore.filterCategory"
            @change="shopStore.fetchShopItems()"
            class="bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 font-mono text-xs text-ops-text-bright"
          >
            <option value="all">Category: All Categories</option>
            <option value="weapon">Weapons</option>
            <option value="armor">Armor</option>
            <option value="mount">Mounts</option>
            <option value="bundle">Bundles</option>
            <option value="cosmetic">Cosmetics</option>
          </select>
        </div>

        <div class="relative">
          <input
            v-model="shopStore.searchQuery"
            @input="shopStore.fetchShopItems()"
            type="text"
            placeholder="Search items by name or SKU..."
            class="w-56 bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 text-xs text-ops-text-bright placeholder:text-ops-text-dark focus:border-ops-blue"
          />
          <button
            v-if="shopStore.searchQuery"
            @click="shopStore.searchQuery = ''; shopStore.fetchShopItems()"
            class="absolute right-2 top-1 text-xs text-ops-text-dim"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Batch Selection Bar (Active when items are selected) -->
      <div
        v-if="shopStore.selectedItemIdsForBatch.length > 0"
        class="p-2 bg-ops-blue/15 border border-ops-blue/40 rounded flex items-center justify-between text-xs font-mono"
      >
        <div class="flex items-center gap-2">
          <span class="font-bold text-ops-text-bright">{{ shopStore.selectedItemIdsForBatch.length }} item(s) selected</span>
          <button @click="shopStore.clearSelection()" class="text-2xs text-ops-text-dim hover:underline">Clear</button>
        </div>

        <button
          v-if="authStore.canEdit"
          @click="shopStore.isBatchModalOpen = true"
          class="px-3 py-1 bg-ops-blue hover:bg-ops-blue-glow text-white font-bold rounded text-2xs transition"
        >
          Batch Shift Status / Discount →
        </button>
      </div>
    </div>

    <!-- Shop Items Table -->
    <div class="bg-ops-surface rounded border border-ops-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-sans">
          <thead class="bg-ops-subtle border-b border-ops-border font-mono text-2xs text-ops-text-dim uppercase tracking-wider">
            <tr>
              <th class="p-3 w-8">
                <input
                  type="checkbox"
                  :checked="shopStore.selectedItemIdsForBatch.length === shopStore.items.length && shopStore.items.length > 0"
                  @change="toggleSelectAll"
                  class="rounded bg-ops-obsidian border-ops-border text-ops-blue"
                />
              </th>
              <th class="p-3">Status</th>
              <th class="p-3">Item Details & SKU</th>
              <th class="p-3">Rarity & Category</th>
              <th class="p-3">Pricing & Discount</th>
              <th class="p-3">Active Schedule Window</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ops-border/60">
            <tr
              v-for="item in shopStore.items"
              :key="item._id"
              :class="[
                'hover:bg-ops-surface-hover/80 transition',
                shopStore.selectedItemIdsForBatch.includes(item.itemId) ? 'bg-ops-blue/5' : ''
              ]"
            >
              <td class="p-3">
                <input
                  type="checkbox"
                  :checked="shopStore.selectedItemIdsForBatch.includes(item.itemId)"
                  @change="shopStore.toggleItemSelection(item.itemId)"
                  class="rounded bg-ops-obsidian border-ops-border text-ops-blue"
                />
              </td>

              <!-- Status -->
              <td class="p-3 whitespace-nowrap">
                <CommonStatusPill :status="item.rotationStatus" />
              </td>

              <!-- Item Details -->
              <td class="p-3 min-w-[200px]">
                <div class="font-bold text-ops-text-bright text-xs flex items-center gap-1.5">
                  <span v-if="item.previewAssets?.hasParticleEffect" title="Particle Effect" class="text-amber-400">✨</span>
                  <span>{{ item.name }}</span>
                </div>
                <div class="font-mono text-2xs text-ops-text-dim mt-0.5">{{ item.itemId }}</div>
              </td>

              <!-- Rarity & Category -->
              <td class="p-3 whitespace-nowrap font-mono text-2xs">
                <CommonStatusPill :status="item.rarity" :label="item.rarity" />
                <span class="text-ops-text-dim block mt-0.5 uppercase">{{ item.category }}</span>
              </td>

              <!-- Pricing -->
              <td class="p-3 whitespace-nowrap font-mono text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-emerald-400">{{ item.pricing.salePrice.toLocaleString() }} {{ item.pricing.currency }}</span>
                  <span
                    v-if="item.pricing.discountPct > 0"
                    class="text-2xs px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold"
                  >
                    -{{ item.pricing.discountPct }}%
                  </span>
                </div>
                <div v-if="item.pricing.discountPct > 0" class="text-2xs text-ops-text-dim line-through">
                  Base: {{ item.pricing.basePrice.toLocaleString() }}
                </div>
              </td>

              <!-- Schedule Window -->
              <td class="p-3 whitespace-nowrap font-mono text-2xs">
                <div class="text-ops-text-bright">{{ formatUtc(item.schedule.activeFrom, 'MMM dd, HH:mm') }}</div>
                <div class="text-ops-text-dim">until {{ formatUtc(item.schedule.activeUntil, 'MMM dd, HH:mm') }}</div>
              </td>

              <!-- Actions -->
              <td class="p-3 text-right whitespace-nowrap font-mono text-2xs">
                <button
                  v-if="authStore.canEdit"
                  @click="shopStore.openEditModal(item)"
                  class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-border border border-ops-border text-ops-text-bright rounded transition"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <ShopShopItemModal />
    <ShopBatchRotateModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useShopStore } from '~/stores/shop';
import { useAuthStore } from '~/stores/auth';
import { useTimeFormat } from '~/composables/useTimeFormat';

const shopStore = useShopStore();
const authStore = useAuthStore();
const { formatUtc } = useTimeFormat();

onMounted(async () => {
  await shopStore.fetchShopItems();
});

function toggleSelectAll() {
  if (shopStore.selectedItemIdsForBatch.length === shopStore.items.length) {
    shopStore.clearSelection();
  } else {
    shopStore.selectAll();
  }
}
</script>
