<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Subsystem 02 / Event Operations</div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">In-Game Event Scheduler & Live Toggles</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="authStore.canEdit"
          @click="eventsStore.openCreateModal()"
          class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Schedule New Event</span>
        </button>
        <div v-else class="text-2xs font-mono text-ops-text-dim px-2 py-1 bg-ops-obsidian rounded border border-ops-border">
          Read-only QA Mode
        </div>
      </div>
    </div>

    <!-- Filter Strip -->
    <div class="p-3 bg-ops-surface rounded border border-ops-border flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Status Filter -->
        <select
          v-model="eventsStore.filterStatus"
          @change="eventsStore.fetchEvents()"
          class="bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 text-xs font-mono text-ops-text-bright"
        >
          <option value="all">Status: All Statuses</option>
          <option value="active">Active (Live)</option>
          <option value="scheduled">Scheduled</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>

        <!-- Category Filter -->
        <select
          v-model="eventsStore.filterCategory"
          @change="eventsStore.fetchEvents()"
          class="bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 text-xs font-mono text-ops-text-bright"
        >
          <option value="all">Category: All Categories</option>
          <option value="world_boss">World Boss</option>
          <option value="raid">Raid Instance</option>
          <option value="exp_boost">EXP Boost</option>
          <option value="login_reward">Login Rewards</option>
          <option value="pvp_season">PvP Season</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <!-- Search Filter -->
      <div class="relative">
        <input
          v-model="eventsStore.searchQuery"
          @input="eventsStore.fetchEvents()"
          type="text"
          placeholder="Search by event name or slug..."
          class="w-60 bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 text-xs text-ops-text-bright placeholder:text-ops-text-dark focus:border-ops-blue"
        />
        <button
          v-if="eventsStore.searchQuery"
          @click="eventsStore.searchQuery = ''; eventsStore.fetchEvents()"
          class="absolute right-2 top-1 text-xs text-ops-text-dim"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-ops-surface rounded border border-ops-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-sans">
          <thead class="bg-ops-subtle border-b border-ops-border font-mono text-2xs text-ops-text-dim uppercase tracking-wider">
            <tr>
              <th class="p-3">Status</th>
              <th class="p-3">Event Name & Slug</th>
              <th class="p-3">Category</th>
              <th class="p-3">Schedule Window (UTC)</th>
              <th class="p-3">Targeting & Multipliers</th>
              <th class="p-3 text-right">Operational Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ops-border/60">
            <tr
              v-for="ev in eventsStore.events"
              :key="ev._id"
              class="hover:bg-ops-surface-hover/80 transition"
            >
              <!-- Status Pill -->
              <td class="p-3 whitespace-nowrap">
                <CommonStatusPill :status="ev.status" />
              </td>

              <!-- Name & Slug -->
              <td class="p-3 min-w-[220px]">
                <div class="font-bold text-ops-text-bright text-xs">{{ ev.name }}</div>
                <div class="font-mono text-2xs text-ops-blue-glow mt-0.5">{{ ev.slug }}</div>
              </td>

              <!-- Category -->
              <td class="p-3 whitespace-nowrap font-mono text-2xs text-ops-text-dim uppercase">
                {{ ev.category.replace('_', ' ') }}
              </td>

              <!-- Schedule Window -->
              <td class="p-3 whitespace-nowrap font-mono text-2xs">
                <div class="text-ops-text-bright">{{ formatUtc(ev.schedule.startTime, 'yyyy-MM-dd HH:mm') }}</div>
                <div class="text-ops-text-dim">to {{ formatUtc(ev.schedule.endTime, 'yyyy-MM-dd HH:mm') }}</div>
              </td>

              <!-- Targeting & Multipliers -->
              <td class="p-3 text-2xs font-mono space-y-1">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="cl in ev.targeting.serverClusters"
                    :key="cl"
                    class="px-1.5 py-0.2 bg-ops-obsidian rounded border border-ops-border text-ops-text-dim"
                  >
                    {{ cl }}
                  </span>
                </div>
                <div v-if="ev.config?.expMultiplier" class="text-emerald-400 font-semibold">
                  {{ ev.config.expMultiplier }}x EXP Boost
                </div>
              </td>

              <!-- Operational Actions -->
              <td class="p-3 text-right whitespace-nowrap font-mono text-2xs space-x-1.5">
                <template v-if="authStore.canEdit">
                  <button
                    v-if="ev.status === 'active'"
                    @click="eventsStore.toggleStatus(ev._id, 'paused', 'Ops table pause')"
                    class="px-2 py-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded font-semibold transition"
                  >
                    Pause
                  </button>
                  <button
                    v-else-if="ev.status === 'paused' || ev.status === 'scheduled'"
                    @click="eventsStore.toggleStatus(ev._id, 'active', 'Ops table activate')"
                    class="px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded font-semibold transition"
                  >
                    Go Live
                  </button>

                  <button
                    @click="eventsStore.openEditModal(ev)"
                    class="px-2 py-1 bg-ops-obsidian hover:bg-ops-border border border-ops-border text-ops-text-bright rounded transition"
                  >
                    Edit
                  </button>
                </template>
                <span v-else class="text-ops-text-dark">Read-only</span>
              </td>
            </tr>

            <tr v-if="eventsStore.events.length === 0">
              <td colspan="6" class="p-8 text-center text-ops-text-dim font-mono">
                No events found matching current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Event Creation/Edit Modal -->
    <EventsEventModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEventsStore } from '~/stores/events';
import { useAuthStore } from '~/stores/auth';
import { useTimeFormat } from '~/composables/useTimeFormat';

const eventsStore = useEventsStore();
const authStore = useAuthStore();
const { formatUtc } = useTimeFormat();

onMounted(async () => {
  await eventsStore.fetchEvents();
});
</script>
