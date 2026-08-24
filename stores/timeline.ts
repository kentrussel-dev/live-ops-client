import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ITimelineTrackItem, ServerCluster } from '../../shared/types';

export type TimelineZoomLevel = '24h' | '7d' | '30d';

export const useTimelineStore = defineStore('timeline', () => {
  const zoomLevel = ref<TimelineZoomLevel>('7d');
  const selectedCluster = ref<ServerCluster | 'Global'>('Global');
  const searchQuery = ref('');
  const isLoading = ref(false);
  const selectedItem = ref<ITimelineTrackItem | null>(null);

  const rawTracks = ref<{
    events: ITimelineTrackItem[];
    patches: ITimelineTrackItem[];
    shop: ITimelineTrackItem[];
    incidents: ITimelineTrackItem[];
  }>({
    events: [],
    patches: [],
    shop: [],
    incidents: [],
  });

  const timeWindow = ref<{ from: string; to: string }>({
    from: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Calculate window according to zoom
  function updateZoom(zoom: TimelineZoomLevel) {
    zoomLevel.value = zoom;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    if (zoom === '24h') {
      timeWindow.value = {
        from: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        to: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
      };
    } else if (zoom === '7d') {
      timeWindow.value = {
        from: new Date(now - 2 * dayMs).toISOString(),
        to: new Date(now + 5 * dayMs).toISOString(),
      };
    } else if (zoom === '30d') {
      timeWindow.value = {
        from: new Date(now - 7 * dayMs).toISOString(),
        to: new Date(now + 23 * dayMs).toISOString(),
      };
    }

    fetchTimeline();
  }

  async function fetchTimeline() {
    isLoading.value = true;
    try {
      const api = useApi();
      const query: Record<string, any> = {
        from: timeWindow.value.from,
        to: timeWindow.value.to,
      };
      if (selectedCluster.value !== 'Global') {
        query.serverCluster = selectedCluster.value;
      }

      const res = await api.get('/timeline/matrix', query);
      if (res.success && res.data) {
        rawTracks.value = res.data.tracks;
      }
    } catch (err) {
      console.error('[TimelineStore] Failed to fetch timeline matrix:', err);
    } finally {
      isLoading.value = false;
    }
  }

  const filteredTracks = computed(() => {
    if (!searchQuery.value.trim()) {
      return rawTracks.value;
    }
    const q = searchQuery.value.toLowerCase();
    const filterFn = (item: ITimelineTrackItem) =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q));

    return {
      events: rawTracks.value.events.filter(filterFn),
      patches: rawTracks.value.patches.filter(filterFn),
      shop: rawTracks.value.shop.filter(filterFn),
      incidents: rawTracks.value.incidents.filter(filterFn),
    };
  });

  function selectItem(item: ITimelineTrackItem | null) {
    selectedItem.value = item;
  }

  return {
    zoomLevel,
    selectedCluster,
    searchQuery,
    isLoading,
    selectedItem,
    timeWindow,
    rawTracks,
    filteredTracks,
    updateZoom,
    fetchTimeline,
    selectItem,
  };
});
