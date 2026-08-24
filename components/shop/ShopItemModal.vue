<template>
  <div
    v-if="shopStore.isModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="shopStore.isModalOpen = false"
  >
    <div class="w-full max-w-2xl bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
        <div>
          <span class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">In-Game Monetization & Economy</span>
          <h3 class="text-sm font-bold text-ops-text-bright">
            {{ form._id ? `Edit Item: ${form.name}` : 'Add New Item / Equipment Rotation' }}
          </h3>
        </div>
        <button @click="shopStore.isModalOpen = false" class="text-ops-text-dim hover:text-ops-text-bright p-1">
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 overflow-y-auto space-y-4 flex-1">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Item SKU / ID *</label>
            <input
              v-model="form.itemId"
              type="text"
              required
              placeholder="e.g. WEAPON_VOIDBANE_02"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright focus:border-ops-blue"
            />
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Item Display Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Voidbane Greatsword"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Category *</label>
            <select
              v-model="form.category"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright"
            >
              <option value="weapon">Weapon</option>
              <option value="armor">Armor</option>
              <option value="mount">Mount</option>
              <option value="cosmetic">Cosmetic</option>
              <option value="bundle">Bundle</option>
              <option value="consumable">Consumable</option>
            </select>
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Rarity Tier *</label>
            <select
              v-model="form.rarity"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright"
            >
              <option value="mythic">Mythic</option>
              <option value="legendary">Legendary</option>
              <option value="epic">Epic</option>
              <option value="rare">Rare</option>
              <option value="uncommon">Uncommon</option>
              <option value="common">Common</option>
            </select>
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Rotation Status *</label>
            <select
              v-model="form.rotationStatus"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 font-mono text-xs text-ops-text-bright"
            >
              <option value="featured">Featured Banner</option>
              <option value="flash_sale">Flash Sale (Discounted)</option>
              <option value="standard">Standard Catalog</option>
              <option value="retired">Retired / Vaulted</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Item Lore & Tooltip Description *</label>
          <textarea
            v-model="form.description"
            required
            rows="2"
            class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
          ></textarea>
        </div>

        <!-- Pricing Block -->
        <div class="p-3 bg-ops-obsidian rounded border border-ops-border space-y-2">
          <div class="text-2xs font-mono font-semibold uppercase tracking-wider text-ops-text-bright">Pricing & Discount</div>
          <div class="grid grid-cols-4 gap-3">
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">Base Price *</label>
              <input
                v-model.number="form.pricing.basePrice"
                type="number"
                min="0"
                required
                @input="calculateSalePrice"
                class="w-full bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs font-mono text-ops-text-bright"
              />
            </div>
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">Currency *</label>
              <select
                v-model="form.pricing.currency"
                class="w-full bg-ops-surface border border-ops-border rounded px-2 py-1 font-mono text-xs text-ops-text-bright"
              >
                <option value="gems">Gems</option>
                <option value="gold">Gold</option>
                <option value="valor_tokens">Valor Tokens</option>
                <option value="rift_shards">Rift Shards</option>
              </select>
            </div>
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">Discount %</label>
              <input
                v-model.number="form.pricing.discountPct"
                type="number"
                min="0"
                max="100"
                @input="calculateSalePrice"
                class="w-full bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs font-mono text-ops-text-bright"
              />
            </div>
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">Sale Price</label>
              <input
                v-model.number="form.pricing.salePrice"
                type="number"
                readonly
                class="w-full bg-ops-border/40 border border-ops-border rounded px-2 py-1 text-xs font-mono font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2 border-t border-ops-border">
          <button
            type="button"
            @click="shopStore.isModalOpen = false"
            class="px-3.5 py-1.5 border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded font-mono text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold rounded text-xs transition"
          >
            Save Item Record
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useShopStore } from '~/stores/shop';

const shopStore = useShopStore();

const form = ref<any>({
  itemId: '',
  name: '',
  description: '',
  category: 'weapon',
  rarity: 'epic',
  pricing: {
    basePrice: 1000,
    currency: 'gems',
    discountPct: 0,
    salePrice: 1000,
  },
  rotationStatus: 'standard',
  schedule: {
    activeFrom: new Date().toISOString(),
    activeUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
    stockLimitPerUser: 1,
  },
  previewAssets: {
    iconTag: 'icon_item_default',
  },
  tags: [],
});

watch(
  () => shopStore.isModalOpen,
  (open) => {
    if (open) {
      if (shopStore.selectedItem) {
        form.value = JSON.parse(JSON.stringify(shopStore.selectedItem));
      } else {
        form.value = {
          itemId: `ITEM_${Date.now().toString().slice(-6)}`,
          name: '',
          description: '',
          category: 'weapon',
          rarity: 'epic',
          pricing: {
            basePrice: 1200,
            currency: 'gems',
            discountPct: 20,
            salePrice: 960,
          },
          rotationStatus: 'standard',
          schedule: {
            activeFrom: new Date().toISOString(),
            activeUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
            stockLimitPerUser: 1,
          },
          previewAssets: {
            iconTag: 'icon_item_custom',
          },
          tags: ['rotation'],
        };
      }
    }
  },
  { immediate: true }
);

function calculateSalePrice() {
  const base = form.value.pricing.basePrice || 0;
  const disc = form.value.pricing.discountPct || 0;
  form.value.pricing.salePrice = Math.round(base * (1 - disc / 100));
}

async function handleSubmit() {
  calculateSalePrice();
  await shopStore.saveItem(form.value);
}
</script>
