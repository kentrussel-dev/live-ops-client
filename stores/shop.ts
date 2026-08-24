import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IShopItemRotation, RotationStatus, ItemRarity, ItemCategory } from '../../shared/types';
import { useToast } from '~/composables/useToast';

export const useShopStore = defineStore('shop', () => {
  const items = ref<IShopItemRotation[]>([]);
  const isLoading = ref(false);
  const selectedItem = ref<IShopItemRotation | null>(null);
  const isModalOpen = ref(false);
  const isBatchModalOpen = ref(false);
  const selectedItemIdsForBatch = ref<string[]>([]);

  const filterStatus = ref<RotationStatus | 'all'>('all');
  const filterRarity = ref<ItemRarity | 'all'>('all');
  const filterCategory = ref<ItemCategory | 'all'>('all');
  const searchQuery = ref('');

  async function fetchShopItems() {
    isLoading.value = true;
    try {
      const api = useApi();
      const query: Record<string, any> = {};
      if (filterStatus.value !== 'all') query.status = filterStatus.value;
      if (filterRarity.value !== 'all') query.rarity = filterRarity.value;
      if (filterCategory.value !== 'all') query.category = filterCategory.value;
      if (searchQuery.value) query.search = searchQuery.value;

      const res = await api.get('/shop-rotations', query);
      if (res.success && res.data) {
        items.value = res.data.items;
      }
    } catch (err: any) {
      const toast = useToast();
      toast.error('Failed to load shop rotations', err.message);
    } finally {
      isLoading.value = false;
    }
  }

  async function saveItem(payload: Partial<IShopItemRotation>): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      if (selectedItem.value?._id) {
        const res = await api.put(`/shop-rotations/${selectedItem.value._id}`, payload);
        if (res.success && res.data) {
          const index = items.value.findIndex((i) => i._id === selectedItem.value?._id);
          if (index !== -1) items.value[index] = res.data.item;
          toast.success('Catalog Item Updated', `Updated "${res.data.item.name}"`);
          isModalOpen.value = false;
          return true;
        }
      } else {
        const res = await api.post('/shop-rotations', payload);
        if (res.success && res.data) {
          items.value.unshift(res.data.item);
          toast.success('Item Added to Catalog', `Added "${res.data.item.name}"`);
          isModalOpen.value = false;
          return true;
        }
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to save item', err.message);
      return false;
    }
  }

  async function executeBatchRotate(newStatus: RotationStatus, discountPct?: number, activeUntil?: string, reason?: string): Promise<boolean> {
    const toast = useToast();
    if (selectedItemIdsForBatch.value.length === 0) {
      toast.warning('No Items Selected', 'Please select at least one item to perform batch rotation.');
      return false;
    }

    try {
      const api = useApi();
      const res = await api.post('/shop-rotations/batch-rotate', {
        itemIds: selectedItemIdsForBatch.value,
        newStatus,
        discountPct,
        activeUntil,
        reason,
      });

      if (res.success) {
        toast.success('Batch Rotation Dispatched', res.data.message);
        selectedItemIdsForBatch.value = [];
        isBatchModalOpen.value = false;
        await fetchShopItems();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Batch Rotation Failed', err.message);
      return false;
    }
  }

  function toggleItemSelection(itemId: string) {
    if (selectedItemIdsForBatch.value.includes(itemId)) {
      selectedItemIdsForBatch.value = selectedItemIdsForBatch.value.filter((id) => id !== itemId);
    } else {
      selectedItemIdsForBatch.value.push(itemId);
    }
  }

  function selectAll() {
    selectedItemIdsForBatch.value = items.value.map((i) => i.itemId);
  }

  function clearSelection() {
    selectedItemIdsForBatch.value = [];
  }

  function openCreateModal() {
    selectedItem.value = null;
    isModalOpen.value = true;
  }

  function openEditModal(item: IShopItemRotation) {
    selectedItem.value = JSON.parse(JSON.stringify(item));
    isModalOpen.value = true;
  }

  return {
    items,
    isLoading,
    selectedItem,
    isModalOpen,
    isBatchModalOpen,
    selectedItemIdsForBatch,
    filterStatus,
    filterRarity,
    filterCategory,
    searchQuery,
    fetchShopItems,
    saveItem,
    executeBatchRotate,
    toggleItemSelection,
    selectAll,
    clearSelection,
    openCreateModal,
    openEditModal,
  };
});
