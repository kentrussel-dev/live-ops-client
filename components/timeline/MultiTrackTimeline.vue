<template>
  <div class="bg-ops-surface border border-ops-border rounded flex flex-col overflow-hidden">
    <!-- Controls Header -->
    <div class="p-3 border-b border-ops-border bg-ops-subtle flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold tracking-wider text-ops-text-bright uppercase">Multi-Track Operations Matrix</span>
          <span class="text-2xs font-mono px-1.5 py-0.2 bg-ops-border text-ops-text-dim rounded">LIVE TELEMETRY</span>
        </div>

        <div class="h-3.5 w-px bg-ops-border hidden sm:block" />

        <!-- Zoom Presets -->
        <div class="flex items-center bg-ops-obsidian rounded border border-ops-border p-0.5 text-2xs font-mono">
          <button
            v-for="zoom in (['24h', '7d', '30d'] as const)"
            :key="zoom"
            @click="timelineStore.updateZoom(zoom)"
            :class="[
              'px-2 py-1 rounded transition uppercase',
              timelineStore.zoomLevel === zoom
                ? 'bg-ops-blue text-white font-bold'
                : 'text-ops-text-dim hover:text-ops-text-bright'
            ]"
          >
            {{ zoom }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Cluster Filter -->
        <select
          v-model="timelineStore.selectedCluster"
          @change="timelineStore.fetchTimeline()"
          class="bg-ops-obsidian border border-ops-border rounded px-2 py-1 text-xs font-mono text-ops-text-bright focus:outline-none focus:border-ops-blue"
        >
          <option value="Global">Cluster: All (Global)</option>
          <option value="NA-East">NA-East</option>
          <option value="EU-Central">EU-Central</option>
          <option value="APAC-East">APAC-East</option>
        </select>

        <!-- Search input -->
        <div class="relative">
          <input
            v-model="timelineStore.searchQuery"
            type="text"
            placeholder="Filter matrix items..."
            class="w-44 bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 text-xs font-sans text-ops-text-bright placeholder:text-ops-text-dark focus:outline-none focus:border-ops-blue"
          />
          <button
            v-if="timelineStore.searchQuery"
            @click="timelineStore.searchQuery = ''"
            class="absolute right-2 top-1 text-xs text-ops-text-dim hover:text-ops-text-bright"
          >
            ✕
          </button>
        </div>

        <!-- Jump to NOW button -->
        <button
          @click="scrollToNow"
          class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border text-ops-text-bright text-xs font-mono rounded flex items-center gap-1.5 transition"
          title="Scroll viewport to current timestamp"
        >
          <span>Jump to NOW</span>
        </button>
      </div>
    </div>

    <!-- Timeline Scroll Container -->
    <div ref="scrollContainer" class="overflow-x-auto relative min-h-[380px] bg-ops-canvas">
      <div class="min-w-[960px] pb-4 select-none relative">
        <!-- Time Ruler Header -->
        <div class="h-9 border-b border-ops-border bg-ops-surface sticky top-0 z-20 flex items-center">
          <div class="w-40 shrink-0 px-3 text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim border-r border-ops-border">
            TRACK / SYSTEM
          </div>
          <div class="flex-1 relative h-full">
            <div
              v-for="(tick, idx) in timeTicks"
              :key="idx"
              :style="{ left: `${tick.percent}%` }"
              class="absolute top-0 bottom-0 border-l border-ops-border-subtle flex items-center pl-1.5 pointer-events-none"
            >
              <span class="text-2xs font-mono text-ops-text-dim tabular-nums">
                {{ tick.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Real-Time "NOW" Indicator Line -->
        <div
          v-if="nowPercent >= 0 && nowPercent <= 100"
          :style="{ left: `calc(10rem + (100% - 10rem) * ${nowPercent / 100})` }"
          class="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
        >
          <div class="bg-ops-blue text-white font-mono font-bold text-2xs px-1.5 py-0.5 rounded shadow">
            NOW
          </div>
          <div class="w-px flex-1 bg-ops-blue-glow shadow-[0_0_8px_var(--ops-blue)]" />
        </div>

        <!-- Track 1: Server Maintenance & Patches -->
        <div class="border-b border-ops-border flex items-stretch min-h-[64px] hover:bg-ops-surface/40 transition">
          <div class="w-40 shrink-0 p-2.5 border-r border-ops-border bg-ops-surface flex items-center">
            <div class="text-xs font-mono font-semibold text-ops-text-bright">
              Patches & Maint
            </div>
          </div>
          <div class="flex-1 relative p-1.5">
            <!-- Background Grid Lines -->
            <div class="absolute inset-0 grid grid-cols-12 pointer-events-none">
              <div v-for="i in 12" :key="i" class="border-r border-ops-border-subtle h-full" />
            </div>

            <!-- Items -->
            <div
              v-for="item in timelineStore.filteredTracks.patches"
              :key="item.id"
              @click="timelineStore.selectItem(item)"
              :style="getItemStyle(item)"
              :class="[
                'absolute h-9 rounded px-2.5 flex items-center gap-1.5 cursor-pointer shadow-sm text-xs font-mono transition border',
                'dark:bg-blue-950/80 dark:hover:bg-blue-900 dark:border-blue-600/70 dark:text-blue-200 bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-900'
              ]"
              :title="`${item.title} (${item.subtitle})`"
            >
              <span class="truncate font-semibold">{{ item.title }}</span>
            </div>
            <div v-if="timelineStore.filteredTracks.patches.length === 0" class="h-9 flex items-center pl-4 text-2xs text-ops-text-dim font-mono">
              No patch windows in this range
            </div>
          </div>
        </div>

        <!-- Track 2: Major In-Game Events & World Bosses -->
        <div class="border-b border-ops-border flex items-stretch min-h-[76px] hover:bg-ops-surface/40 transition">
          <div class="w-40 shrink-0 p-2.5 border-r border-ops-border bg-ops-surface flex items-center">
            <div class="text-xs font-mono font-semibold text-ops-text-bright">
              Game Events
            </div>
          </div>
          <div class="flex-1 relative p-1.5">
            <div class="absolute inset-0 grid grid-cols-12 pointer-events-none">
              <div v-for="i in 12" :key="i" class="border-r border-ops-border-subtle h-full" />
            </div>

            <!-- Staggered Events -->
            <div
              v-for="(item, idx) in timelineStore.filteredTracks.events"
              :key="item.id"
              @click="timelineStore.selectItem(item)"
              :style="{
                ...getItemStyle(item),
                top: `${(idx % 2) * 36 + 6}px`,
                height: '32px'
              }"
              :class="[
                'absolute rounded px-2.5 flex items-center gap-2 cursor-pointer shadow-md text-xs font-mono transition border',
                getEventTrackClass(item)
              ]"
            >
              <span class="truncate font-semibold">{{ item.title }}</span>
              <span v-if="item.metadata?.expMultiplier" class="text-2xs dark:bg-black/40 bg-emerald-200/80 px-1 py-0.2 rounded dark:text-emerald-300 text-emerald-900 font-bold">
                {{ item.metadata.expMultiplier }}x EXP
              </span>
            </div>
          </div>
        </div>

        <!-- Track 3: Shop & Equipment Rotations -->
        <div class="border-b border-ops-border flex items-stretch min-h-[68px] hover:bg-ops-surface/40 transition">
          <div class="w-40 shrink-0 p-2.5 border-r border-ops-border bg-ops-surface flex items-center">
            <div class="text-xs font-mono font-semibold text-ops-text-bright">
              Shop Rotations
            </div>
          </div>
          <div class="flex-1 relative p-1.5">
            <div class="absolute inset-0 grid grid-cols-12 pointer-events-none">
              <div v-for="i in 12" :key="i" class="border-r border-ops-border-subtle h-full" />
            </div>

            <div
              v-for="(item, idx) in timelineStore.filteredTracks.shop"
              :key="item.id"
              @click="timelineStore.selectItem(item)"
              :style="{
                ...getItemStyle(item),
                top: `${(idx % 2) * 32 + 6}px`,
                height: '28px'
              }"
              :class="[
                'absolute rounded px-2 flex items-center gap-1.5 cursor-pointer shadow-md text-2xs font-mono transition border',
                getShopTrackClass(item)
              ]"
            >
              <span class="truncate font-semibold">{{ item.title }}</span>
            </div>
          </div>
        </div>

        <!-- Track 4: Critical Incidents & Blocker Lifecycles -->
        <div class="flex items-stretch min-h-[64px] hover:bg-ops-surface/40 transition">
          <div class="w-40 shrink-0 p-2.5 border-r border-ops-border bg-ops-surface flex items-center">
            <div class="text-xs font-mono font-semibold text-rose-600 dark:text-rose-300">
              Critical Incidents
            </div>
          </div>
          <div class="flex-1 relative p-1.5">
            <div class="absolute inset-0 grid grid-cols-12 pointer-events-none">
              <div v-for="i in 12" :key="i" class="border-r border-ops-border-subtle h-full" />
            </div>

            <div
              v-for="item in timelineStore.filteredTracks.incidents"
              :key="item.id"
              @click="timelineStore.selectItem(item)"
              :style="getItemStyle(item)"
              class="absolute h-9 rounded px-2.5 flex items-center gap-2 cursor-pointer shadow-md text-xs font-mono transition border dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:border-rose-600/70 dark:text-rose-200 bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-900"
            >
              <span class="truncate font-semibold">{{ item.title }}</span>
              <span class="text-2xs dark:bg-black/50 bg-rose-200 px-1 py-0.2 rounded dark:text-rose-300 text-rose-900 uppercase">
                {{ item.status }}
              </span>
            </div>

            <div v-if="timelineStore.filteredTracks.incidents.length === 0" class="h-9 flex items-center pl-4 text-2xs text-ops-blue-glow font-mono">
              No active blocker incidents in this window
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTimelineStore } from '~/stores/timeline';
import type { ITimelineTrackItem } from '../../../shared/types';
import { format, differenceInMilliseconds } from 'date-fns';

const timelineStore = useTimelineStore();
const scrollContainer = ref<HTMLElement | null>(null);
const currentTimestamp = ref(Date.now());
let ticker: any = null;

onMounted(async () => {
  await timelineStore.fetchTimeline();
  ticker = setInterval(() => {
    currentTimestamp.value = Date.now();
  }, 10000);
});

onUnmounted(() => {
  if (ticker) clearInterval(ticker);
});

const windowStart = computed(() => new Date(timelineStore.timeWindow.from).getTime());
const windowEnd = computed(() => new Date(timelineStore.timeWindow.to).getTime());
const windowTotalMs = computed(() => Math.max(1, windowEnd.value - windowStart.value));

const nowPercent = computed(() => {
  const diff = currentTimestamp.value - windowStart.value;
  return Math.min(100, Math.max(0, (diff / windowTotalMs.value) * 100));
});

// Generate time ruler tick intervals based on zoom
const timeTicks = computed(() => {
  const ticks = [];
  const count = timelineStore.zoomLevel === '24h' ? 8 : 10;
  const stepMs = windowTotalMs.value / count;

  for (let i = 0; i <= count; i++) {
    const time = windowStart.value + i * stepMs;
    const date = new Date(time);
    let label = '';
    if (timelineStore.zoomLevel === '24h') {
      label = format(date, 'HH:mm');
    } else if (timelineStore.zoomLevel === '7d') {
      label = format(date, 'EEE MM/dd HH:mm');
    } else {
      label = format(date, 'MMM dd');
    }

    ticks.push({
      percent: (i / count) * 100,
      label,
    });
  }
  return ticks;
});

function getItemStyle(item: ITimelineTrackItem) {
  const itemStart = new Date(item.startTime).getTime();
  const itemEnd = new Date(item.endTime).getTime();

  const clampedStart = Math.max(windowStart.value, itemStart);
  const clampedEnd = Math.min(windowEnd.value, itemEnd);

  const left = ((clampedStart - windowStart.value) / windowTotalMs.value) * 100;
  const width = Math.max(1.5, ((clampedEnd - clampedStart) / windowTotalMs.value) * 100);

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
}

function getEventTrackClass(item: ITimelineTrackItem) {
  if (item.status === 'active') {
    return 'dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:border-emerald-600/70 dark:text-emerald-200 bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-900';
  }
  if (item.status === 'scheduled') {
    return 'dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:border-amber-600/70 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900';
  }
  if (item.status === 'paused') {
    return 'dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:border-rose-600/70 dark:text-rose-200 bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-900';
  }
  return 'dark:bg-ops-surface dark:border-ops-border dark:text-ops-text-bright bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900';
}

function getShopTrackClass(item: ITimelineTrackItem) {
  if (item.status === 'flash_sale') {
    return 'dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:border-amber-500/80 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900';
  }
  if (item.urgencyOrRarity === 'mythic') {
    return 'dark:bg-purple-950/80 dark:hover:bg-purple-900 dark:border-purple-500/80 dark:text-purple-200 bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900';
  }
  return 'dark:bg-cyan-950/80 dark:hover:bg-cyan-900 dark:border-cyan-600/60 dark:text-cyan-200 bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-900';
}

function scrollToNow() {
  if (scrollContainer.value) {
    const scrollWidth = scrollContainer.value.scrollWidth;
    const clientWidth = scrollContainer.value.clientWidth;
    const targetScroll = (nowPercent.value / 100) * scrollWidth - clientWidth / 2;
    scrollContainer.value.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }
}
</script>
