import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IPatchNote } from '../../shared/types';
import { useToast } from '~/composables/useToast';

export const usePatchesStore = defineStore('patches', () => {
  const patches = ref<IPatchNote[]>([]);
  const selectedPatch = ref<IPatchNote | null>(null);
  const isLoading = ref(false);
  const isModalOpen = ref(false);
  const isDiffModalOpen = ref(false);
  const diffData = ref<{ currentVersion: any; previousVersion: any } | null>(null);

  async function fetchPatches() {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.get('/patches');
      if (res.success && res.data) {
        patches.value = res.data.patches;
      }
    } catch (err: any) {
      const toast = useToast();
      toast.error('Failed to load patches', err.message);
    } finally {
      isLoading.value = false;
    }
  }

  async function savePatch(payload: Partial<IPatchNote>): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      if (selectedPatch.value?._id) {
        const res = await api.put(`/patches/${selectedPatch.value._id}`, payload);
        if (res.success && res.data) {
          const index = patches.value.findIndex((p) => p._id === selectedPatch.value?._id);
          if (index !== -1) patches.value[index] = res.data.patch;
          toast.success('Patch Note Updated', `Saved changes for ${res.data.patch.version}`);
          isModalOpen.value = false;
          return true;
        }
      } else {
        const res = await api.post('/patches', payload);
        if (res.success && res.data) {
          patches.value.unshift(res.data.patch);
          toast.success('Patch Created', `Draft initialized for ${res.data.patch.version}`);
          isModalOpen.value = false;
          return true;
        }
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to save patch', err.message);
      return false;
    }
  }

  async function publish(patchId: string): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.post(`/patches/${patchId}/publish`);
      if (res.success && res.data) {
        const index = patches.value.findIndex((p) => p._id === patchId);
        if (index !== -1) patches.value[index] = res.data.patch;
        toast.success('Patch Published to Live Network', res.data.message);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Publication Failed', err.message);
      return false;
    }
  }

  async function loadDiff(currentId: string, previousId: string) {
    try {
      const api = useApi();
      const res = await api.get(`/patches/${currentId}/diff/${previousId}`);
      if (res.success && res.data) {
        diffData.value = res.data;
        isDiffModalOpen.value = true;
      }
    } catch (err: any) {
      const toast = useToast();
      toast.error('Diff Comparison Failed', err.message);
    }
  }

  function openCreateModal() {
    selectedPatch.value = null;
    isModalOpen.value = true;
  }

  function openEditModal(patch: IPatchNote) {
    selectedPatch.value = JSON.parse(JSON.stringify(patch));
    isModalOpen.value = true;
  }

  return {
    patches,
    selectedPatch,
    isLoading,
    isModalOpen,
    isDiffModalOpen,
    diffData,
    fetchPatches,
    savePatch,
    publish,
    loadDiff,
    openCreateModal,
    openEditModal,
  };
});
