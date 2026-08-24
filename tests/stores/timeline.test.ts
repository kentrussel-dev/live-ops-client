import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTimelineStore } from '../../stores/timeline';

describe('Timeline Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with 7d default zoom', () => {
    const timeline = useTimelineStore();
    expect(timeline.zoomLevel).toBe('7d');
    expect(timeline.selectedCluster).toBe('Global');
    expect(timeline.selectedItem).toBeNull();
  });

  it('should select and deselect items for inspection drawer', () => {
    const timeline = useTimelineStore();
    const mockItem = {
      id: 'item-101',
      track: 'event' as const,
      title: 'Void Leviathan',
      category: 'world_boss',
      status: 'active',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
    };

    timeline.selectItem(mockItem);
    expect(timeline.selectedItem?.id).toBe('item-101');

    timeline.selectItem(null);
    expect(timeline.selectedItem).toBeNull();
  });

  it('should filter track items by search query', () => {
    const timeline = useTimelineStore();
    timeline.rawTracks.events = [
      {
        id: '1',
        track: 'event',
        title: 'Void Leviathan Raid',
        category: 'world_boss',
        status: 'active',
        startTime: '',
        endTime: '',
      },
      {
        id: '2',
        track: 'event',
        title: 'EXP Surge',
        category: 'exp_boost',
        status: 'scheduled',
        startTime: '',
        endTime: '',
      },
    ];

    timeline.searchQuery = 'Leviathan';
    expect(timeline.filteredTracks.events.length).toBe(1);
    expect(timeline.filteredTracks.events[0].title).toBe('Void Leviathan Raid');

    timeline.searchQuery = 'EXP';
    expect(timeline.filteredTracks.events.length).toBe(1);
    expect(timeline.filteredTracks.events[0].title).toBe('EXP Surge');
  });
});
