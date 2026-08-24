<template>
  <div
    v-if="eventsStore.isModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    @click.self="eventsStore.closeModal()"
  >
    <div class="w-full max-w-2xl bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
      <!-- Modal Header -->
      <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
        <div>
          <span class="text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">
            {{ eventsStore.isEditing ? 'Live-Ops Modification' : 'New Operational Schedule' }}
          </span>
          <h3 class="text-sm font-bold text-ops-text-bright">
            {{ eventsStore.isEditing ? `Edit Event: ${form.name}` : 'Schedule In-Game Event' }}
          </h3>
        </div>
        <button
          @click="eventsStore.closeModal()"
          class="text-ops-text-dim hover:text-ops-text-bright p-1"
        >
          ✕
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-4 overflow-y-auto space-y-4 flex-1">
        <!-- Name & Slug -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Event Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Void Leviathan Raid"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
              @input="onNameInput"
            />
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Slug Identifier *</label>
            <input
              v-model="form.slug"
              type="text"
              required
              placeholder="e.g. void-leviathan-raid"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 text-xs font-mono text-ops-text-bright focus:border-ops-blue"
            />
          </div>
        </div>

        <!-- Category & Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Category *</label>
            <select
              v-model="form.category"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 text-xs font-mono text-ops-text-bright focus:border-ops-blue"
            >
              <option value="world_boss">World Boss</option>
              <option value="raid">Raid Instance</option>
              <option value="exp_boost">EXP / Mastery Boost</option>
              <option value="login_reward">Login Rewards</option>
              <option value="pvp_season">PvP Season</option>
              <option value="maintenance">Maintenance Window</option>
              <option value="community">Community Festival</option>
            </select>
          </div>
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Initial Status *</label>
            <select
              v-model="form.status"
              required
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 text-xs font-mono text-ops-text-bright focus:border-ops-blue"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active (Immediate Live)</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Description *</label>
          <textarea
            v-model="form.description"
            required
            rows="2"
            placeholder="Operational summary of event mechanics, drop rate multipliers, and rewards..."
            class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue"
          ></textarea>
        </div>

        <!-- Schedule Start & End -->
        <div class="p-3 bg-ops-obsidian rounded border border-ops-border space-y-2.5">
          <div class="text-2xs font-mono font-semibold uppercase tracking-wider text-ops-text-bright">Schedule (UTC)</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">Start Time (UTC) *</label>
              <input
                v-model="startTimeString"
                type="datetime-local"
                required
                class="w-full bg-ops-surface border border-ops-border rounded px-3 py-1.5 text-xs font-mono text-ops-text-bright focus:border-ops-blue"
              />
            </div>
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">End Time (UTC) *</label>
              <input
                v-model="endTimeString"
                type="datetime-local"
                required
                class="w-full bg-ops-surface border border-ops-border rounded px-3 py-1.5 text-xs font-mono text-ops-text-bright focus:border-ops-blue"
              />
            </div>
          </div>
        </div>

        <!-- Targeting: Clusters & Segments -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Server Clusters</label>
            <div class="space-y-1 bg-ops-obsidian p-2 rounded border border-ops-border max-h-28 overflow-y-auto">
              <label v-for="c in ['Global', 'NA-East', 'EU-Central', 'APAC-East']" :key="c" class="flex items-center gap-2 text-2xs font-mono text-ops-text-base cursor-pointer">
                <input
                  type="checkbox"
                  :value="c"
                  v-model="form.targeting.serverClusters"
                  class="rounded bg-ops-surface border-ops-border text-ops-blue"
                />
                <span>{{ c }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Target Segments</label>
            <div class="space-y-1 bg-ops-obsidian p-2 rounded border border-ops-border max-h-28 overflow-y-auto">
              <label v-for="s in ['all', 'new_players', 'veterans_level_80_plus', 'vip_tier_3', 'guild_leaders']" :key="s" class="flex items-center gap-2 text-2xs font-mono text-ops-text-base cursor-pointer">
                <input
                  type="checkbox"
                  :value="s"
                  v-model="form.targeting.playerSegments"
                  class="rounded bg-ops-surface border-ops-border text-ops-blue"
                />
                <span>{{ s }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Multipliers -->
        <div class="p-3 bg-ops-obsidian rounded border border-ops-border space-y-2">
          <div class="text-2xs font-mono font-semibold uppercase tracking-wider text-ops-text-bright">Config Multipliers</div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">EXP Multiplier</label>
              <input
                v-model.number="form.config.expMultiplier"
                type="number"
                step="0.1"
                min="1"
                max="10"
                class="w-full bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs font-mono text-ops-text-bright"
              />
            </div>
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">Drop Bonus %</label>
              <input
                v-model.number="form.config.dropRateBonusPct"
                type="number"
                min="0"
                max="500"
                class="w-full bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs font-mono text-ops-text-bright"
              />
            </div>
            <div>
              <label class="block text-2xs font-mono text-ops-text-dim mb-1">Gold Bonus %</label>
              <input
                v-model.number="form.config.goldBonusPct"
                type="number"
                min="0"
                max="500"
                class="w-full bg-ops-surface border border-ops-border rounded px-2 py-1 text-xs font-mono text-ops-text-bright"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2 flex items-center justify-end gap-2.5 border-t border-ops-border">
          <button
            type="button"
            @click="eventsStore.closeModal()"
            class="px-3.5 py-1.5 border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded text-xs font-mono transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold rounded text-xs transition"
          >
            {{ eventsStore.isEditing ? 'Save Changes' : 'Publish Schedule' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEventsStore } from '~/stores/events';

const eventsStore = useEventsStore();

const form = ref<any>({
  name: '',
  slug: '',
  description: '',
  category: 'world_boss',
  status: 'draft',
  schedule: {
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    timezone: 'UTC',
    recurrence: 'none',
  },
  targeting: {
    serverClusters: ['Global'],
    playerSegments: ['all'],
  },
  config: {
    expMultiplier: 1.0,
    dropRateBonusPct: 0,
    goldBonusPct: 0,
  },
});

const startTimeString = ref('');
const endTimeString = ref('');

watch(
  () => eventsStore.isModalOpen,
  (open) => {
    if (open) {
      if (eventsStore.selectedEvent) {
        form.value = JSON.parse(JSON.stringify(eventsStore.selectedEvent));
      } else {
        const now = new Date();
        const future = new Date(Date.now() + 3 * 86400000);
        form.value = {
          name: '',
          slug: '',
          description: '',
          category: 'world_boss',
          status: 'draft',
          schedule: {
            startTime: now.toISOString(),
            endTime: future.toISOString(),
            timezone: 'UTC',
            recurrence: 'none',
          },
          targeting: {
            serverClusters: ['Global'],
            playerSegments: ['all'],
          },
          config: {
            expMultiplier: 1.0,
            dropRateBonusPct: 0,
            goldBonusPct: 0,
          },
        };
      }
      startTimeString.value = new Date(form.value.schedule.startTime).toISOString().slice(0, 16);
      endTimeString.value = new Date(form.value.schedule.endTime).toISOString().slice(0, 16);
    }
  },
  { immediate: true }
);

function onNameInput() {
  if (!eventsStore.isEditing) {
    form.value.slug = form.value.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

async function handleSubmit() {
  form.value.schedule.startTime = new Date(startTimeString.value).toISOString();
  form.value.schedule.endTime = new Date(endTimeString.value).toISOString();

  await eventsStore.saveEvent(form.value);
}
</script>
