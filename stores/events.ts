import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IGameEvent, EventCategory, EventStatus } from '../../shared/types';
import { useToast } from '~/composables/useToast';

export const useEventsStore = defineStore('events', () => {
  const events = ref<IGameEvent[]>([]);
  const isLoading = ref(false);
  const selectedEvent = ref<IGameEvent | null>(null);
  const isModalOpen = ref(false);
  const isEditing = ref(false);

  const filterStatus = ref<EventStatus | 'all'>('all');
  const filterCategory = ref<EventCategory | 'all'>('all');
  const searchQuery = ref('');

  async function fetchEvents() {
    isLoading.value = true;
    try {
      const api = useApi();
      const query: Record<string, any> = {};
      if (filterStatus.value !== 'all') query.status = filterStatus.value;
      if (filterCategory.value !== 'all') query.category = filterCategory.value;
      if (searchQuery.value) query.search = searchQuery.value;

      const res = await api.get('/events', query);
      if (res.success && res.data) {
        events.value = res.data.events;
      }
    } catch (err: any) {
      const toast = useToast();
      toast.error('Failed to load events', err.message);
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleStatus(eventId: string, targetStatus: EventStatus, reason?: string) {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.patch(`/events/${eventId}/toggle`, { status: targetStatus, reason });
      if (res.success && res.data) {
        const index = events.value.findIndex((e) => e._id === eventId);
        if (index !== -1) {
          events.value[index] = res.data.event;
        }
        toast.success(`Event Status Updated`, `Changed status to '${targetStatus}'.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Status Toggle Failed', err.message);
      return false;
    }
  }

  async function saveEvent(payload: Partial<IGameEvent>): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      if (isEditing.value && selectedEvent.value?._id) {
        const res = await api.put(`/events/${selectedEvent.value._id}`, payload);
        if (res.success && res.data) {
          const index = events.value.findIndex((e) => e._id === selectedEvent.value?._id);
          if (index !== -1) events.value[index] = res.data.event;
          toast.success('Event Updated', `Successfully updated "${res.data.event.name}"`);
          isModalOpen.value = false;
          return true;
        }
      } else {
        const res = await api.post('/events', payload);
        if (res.success && res.data) {
          events.value.unshift(res.data.event);
          toast.success('Event Created', `Successfully scheduled "${res.data.event.name}"`);
          isModalOpen.value = false;
          return true;
        }
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to save event', err.message);
      return false;
    }
  }

  function openCreateModal() {
    selectedEvent.value = null;
    isEditing.value = false;
    isModalOpen.value = true;
  }

  function openEditModal(event: IGameEvent) {
    selectedEvent.value = { ...event };
    isEditing.value = true;
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
    selectedEvent.value = null;
  }

  return {
    events,
    isLoading,
    selectedEvent,
    isModalOpen,
    isEditing,
    filterStatus,
    filterCategory,
    searchQuery,
    fetchEvents,
    toggleStatus,
    saveEvent,
    openCreateModal,
    openEditModal,
    closeModal,
  };
});
