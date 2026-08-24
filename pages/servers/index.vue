<template>
  <div class="space-y-5">
    <!-- Subsystem Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-ops-blue-glow flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-ops-blue-glow" />
          <span>Subsystem 07 / Game Server Fleet Infrastructure</span>
        </div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Game Servers & Fleet Telemetry</h1>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Preset Management Utilities (Admin Only) -->
        <div v-if="authStore.isAdmin" class="flex items-center gap-1 bg-ops-surface border border-ops-border rounded p-1">
          <button
            @click="handleGenerateFleetPreset"
            :disabled="serversStore.isLoading"
            class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-surface-hover text-ops-text-bright font-mono text-2xs rounded transition"
            title="Populate complete regional server fleet telemetry data (8 servers)"
          >
            Generate Fleet Preset
          </button>
          <button
            @click="handleClearFleet"
            :disabled="serversStore.isLoading"
            class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover text-ops-text-dim hover:text-ops-text-bright font-mono text-2xs rounded transition"
            title="Delete all server nodes from the fleet"
          >
            Clear Fleet
          </button>
          <div class="w-px h-3.5 bg-ops-border mx-0.5" />
          <button
            @click="handleGenerateContentPreset"
            :disabled="serversStore.isLoading"
            class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-surface-hover text-ops-text-bright font-mono text-2xs rounded transition"
            title="Populate complete Content Operations data (Events, Patches, Shop, and Issues)"
          >
            Generate Content Preset
          </button>
          <button
            @click="handleClearContentPreset"
            :disabled="serversStore.isLoading"
            class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover text-ops-text-dim hover:text-ops-text-bright font-mono text-2xs rounded transition"
            title="Clear all Events, Patches, Shop Items, and Issues"
          >
            Clear Content
          </button>
        </div>

        <button
          v-if="authStore.isAdmin"
          @click="showCreateModal = true"
          class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
        >
          <span>+</span>
          <span>Provision Server</span>
        </button>

        <button
          @click="serversStore.fetchServers"
          class="px-3 py-1.5 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border text-ops-text-dim hover:text-ops-text-bright font-mono text-xs rounded transition flex items-center gap-1.5"
        >
          <span>↻</span>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- 1. Fleet Executive Telemetry Gauges -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <!-- Metric 1: Total Fleet CCU -->
      <div class="bg-ops-surface border border-ops-border rounded p-3 space-y-1">
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Fleet Concurrent Players (CCU)</div>
        <div class="text-xl font-bold font-mono text-ops-text-bright">
          {{ formatNumber(serversStore.fleetSummary.totalCcu) }}
          <span class="text-xs text-ops-text-dim font-normal">/ {{ formatNumber(serversStore.fleetSummary.totalCapacity) }}</span>
        </div>
        <div class="w-full bg-ops-obsidian rounded-full h-1.5 overflow-hidden mt-2">
          <div
            class="bg-ops-blue h-full transition-all duration-500"
            :style="{ width: `${serversStore.fleetSummary.utilizationPct}%` }"
          />
        </div>
        <div class="text-2xs font-mono text-ops-text-dim flex justify-between pt-0.5">
          <span>Fleet Capacity Load</span>
          <span class="text-ops-text-bright font-bold">{{ serversStore.fleetSummary.utilizationPct }}%</span>
        </div>
      </div>

      <!-- Metric 2: Server Node Health -->
      <div class="bg-ops-surface border border-ops-border rounded p-3 space-y-1">
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Active Server Nodes</div>
        <div class="text-xl font-bold font-mono text-ops-text-bright">
          {{ serversStore.fleetSummary.onlineServers }}
          <span class="text-xs text-ops-text-dim font-normal">/ {{ serversStore.fleetSummary.totalServers }} Online</span>
        </div>
        <div class="text-2xs font-mono text-ops-text-dim pt-1.5">
          <span>{{ serversStore.fleetSummary.onlineServers > 0 ? 'Server Fleet Operational' : 'No Active Servers' }}</span>
        </div>
      </div>

      <!-- Metric 3: Average Latency / Ping -->
      <div class="bg-ops-surface border border-ops-border rounded p-3 space-y-1">
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Average Network Ping</div>
        <div class="text-xl font-bold font-mono text-ops-text-bright">
          {{ serversStore.fleetSummary.avgPingMs }}
          <span class="text-xs text-ops-text-dim font-normal">ms RTT</span>
        </div>
        <div class="text-2xs font-mono text-ops-text-dim pt-1.5">
          <span>Edge Routing Telemetry</span>
        </div>
      </div>

      <!-- Metric 4: Average Tick Rate -->
      <div class="bg-ops-surface border border-ops-border rounded p-3 space-y-1">
        <div class="text-2xs font-mono uppercase text-ops-text-dim">Simulation Tick Rate</div>
        <div class="text-xl font-bold font-mono text-ops-text-bright">
          {{ serversStore.fleetSummary.avgTickRateHz }}
          <span class="text-xs text-ops-text-dim font-normal">Hz</span>
        </div>
        <div class="text-2xs font-mono text-ops-text-dim pt-1.5">
          <span>Physics Loop Target: 60 Hz</span>
        </div>
      </div>
    </div>

    <!-- 2. Empty State (When 0 Servers Exist) -->
    <div
      v-if="!serversStore.isLoading && serversStore.servers.length === 0"
      class="bg-ops-surface border border-ops-border rounded-lg p-10 text-center space-y-3 font-sans"
    >
      <div class="w-12 h-12 rounded-full bg-ops-obsidian border border-ops-border flex items-center justify-center mx-auto text-xs font-mono font-bold text-ops-text-dim">
        SRE
      </div>
      <h3 class="text-sm font-bold font-mono text-ops-text-bright">No Game Server Nodes Provisioned</h3>
      <p class="text-xs text-ops-text-dim max-w-md mx-auto">
        The server fleet is completely clean and uninitialized. You can generate a production fleet preset with simulated regional nodes, generate content operations preset data, or provision custom servers manually.
      </p>
      <div v-if="authStore.isAdmin" class="pt-3 flex flex-wrap items-center justify-center gap-2.5">
        <button
          @click="handleGenerateFleetPreset"
          class="px-3.5 py-1.5 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border text-ops-text-bright font-mono text-xs rounded transition"
        >
          Generate Fleet Preset
        </button>
        <button
          @click="handleGenerateContentPreset"
          class="px-3.5 py-1.5 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border text-ops-text-bright font-mono text-xs rounded transition"
        >
          Generate Content Preset
        </button>
        <button
          @click="showCreateModal = true"
          class="px-3.5 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition shadow"
        >
          + Provision Server
        </button>
      </div>
    </div>

    <!-- 3. Server Fleet Grid (When Servers Exist) -->
    <div v-else class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="text-2xs font-mono uppercase tracking-wider text-ops-text-dim">
          Dedicated Server Nodes ({{ serversStore.servers.length }} Instances)
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="server in serversStore.servers"
          :key="server._id"
          class="bg-ops-surface border border-ops-border hover:border-ops-border-bright rounded-lg p-4 space-y-3.5 font-sans transition flex flex-col justify-between"
        >
          <!-- Server Header -->
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-bold text-xs text-ops-text-bright leading-tight">{{ server.name }}</h3>
                <div class="text-2xs font-mono text-ops-text-dim flex items-center gap-1.5 mt-0.5">
                  <span class="text-ops-blue-glow">{{ server.serverId }}</span>
                  <span>•</span>
                  <span class="text-ops-text-base">{{ server.host }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <span class="px-1.5 py-0.5 rounded text-2xs font-mono font-bold bg-ops-obsidian border border-ops-border text-ops-text-bright">
                  {{ server.region }}
                </span>
                <span
                  :class="[
                    'px-1.5 py-0.5 rounded text-2xs font-mono font-bold uppercase',
                    server.status === 'online' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                    server.status === 'high_load' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                    server.status === 'draining' ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800 animate-pulse' :
                    server.status === 'maintenance' ? 'bg-rose-950/80 text-rose-300 border border-rose-800' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  ]"
                >
                  {{ server.status.replace('_', ' ') }}
                </span>
              </div>
            </div>

            <!-- Connected Players CCU Bar -->
            <div class="space-y-1 pt-1">
              <div class="flex justify-between text-2xs font-mono">
                <span class="text-ops-text-dim">Connected Players:</span>
                <span class="text-ops-text-bright font-bold">
                  {{ formatNumber(server.currentPlayers) }} / {{ formatNumber(server.maxPlayers) }}
                </span>
              </div>
              <div class="w-full bg-ops-obsidian rounded-full h-1.5 overflow-hidden">
                <div
                  :class="[
                    'h-full transition-all duration-300',
                    (server.currentPlayers / server.maxPlayers) > 0.85 ? 'bg-amber-400' : 'bg-ops-blue'
                  ]"
                  :style="{ width: `${Math.min(100, Math.round((server.currentPlayers / server.maxPlayers) * 100))}%` }"
                />
              </div>
            </div>

            <!-- Performance Metrics Grid -->
            <div class="grid grid-cols-2 gap-2 text-2xs font-mono bg-ops-obsidian/70 p-2.5 rounded border border-ops-border text-ops-text-dim">
              <div>
                <span>Ping: </span>
                <span class="text-ops-text-bright font-bold">{{ server.pingMs }} ms</span>
              </div>
              <div>
                <span>Tick: </span>
                <span :class="server.tickRateHz >= 59.5 ? 'text-emerald-400' : 'text-amber-400'" class="font-bold">
                  {{ server.tickRateHz }} Hz
                </span>
              </div>
              <div>
                <span>CPU: </span>
                <span :class="server.cpuUsagePct > 80 ? 'text-rose-400' : 'text-ops-text-base'">
                  {{ server.cpuUsagePct }}%
                </span>
              </div>
              <div>
                <span>Memory: </span>
                <span class="text-ops-text-base">{{ server.memoryUsagePct }}%</span>
              </div>
              <div class="col-span-2">
                <span>Bandwidth: </span>
                <span class="text-ops-text-bright font-bold">{{ server.bandwidthMbps }} Mbps</span>
              </div>
            </div>

            <!-- Login Lock Badge -->
            <div v-if="server.lockedForLogins" class="text-2xs font-mono text-amber-400 flex items-center gap-1 pt-1">
              <span>Player Logins Locked (Draining Traffic)</span>
            </div>
          </div>

          <!-- Root Admin SRE Controls -->
          <div v-if="authStore.isAdmin" class="pt-3 border-t border-ops-border flex items-center justify-between gap-1.5 text-2xs font-mono">
            <div class="flex items-center gap-1.5 flex-wrap">
              <!-- Edit Manually Button -->
              <button
                @click="openEditModal(server)"
                class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border text-ops-text-bright rounded transition"
                title="Manually edit all telemetry and config for this server"
              >
                Edit
              </button>

              <button
                v-if="server.status !== 'online'"
                @click="handleSetStatus(server._id, 'online')"
                class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border text-ops-text-bright rounded transition"
              >
                Online
              </button>

              <button
                @click="handleToggleDrain(server._id)"
                class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded transition"
              >
                {{ server.status === 'draining' ? 'Cancel Drain' : 'Drain' }}
              </button>

              <button
                v-if="server.status !== 'maintenance'"
                @click="handleSetStatus(server._id, 'maintenance')"
                class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded transition"
              >
                Maint
              </button>

              <button
                @click="handleReboot(server._id, server.name)"
                class="px-2 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded transition"
              >
                Reboot
              </button>
            </div>

            <button
              @click="handleDeleteServer(server._id, server.name)"
              class="px-1.5 py-1 text-ops-text-dark hover:text-rose-400 transition"
              title="Decommission Server"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 1: Provision New Server Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-md bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs">
        <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
          <h3 class="font-mono font-bold text-sm text-ops-text-bright">Provision Game Server Node</h3>
          <button @click="showCreateModal = false" class="text-ops-text-dim hover:text-ops-text-bright font-mono">✕</button>
        </div>

        <form @submit.prevent="handleCreateServer" class="p-5 space-y-3.5">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Server Name</label>
            <input
              v-model="serverForm.name"
              type="text"
              required
              placeholder="e.g. US-East Dedicated Server 03"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Server ID (Unique Identifier)</label>
            <input
              v-model="serverForm.serverId"
              type="text"
              required
              placeholder="e.g. srv-useast-03"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Host & Port</label>
              <input
                v-model="serverForm.host"
                type="text"
                required
                placeholder="198.51.100.26:7777"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Region</label>
              <select
                v-model="serverForm.region"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              >
                <option value="US-East">US-East</option>
                <option value="US-West">US-West</option>
                <option value="EU-Central">EU-Central</option>
                <option value="EU-West">EU-West</option>
                <option value="AP-East">AP-East</option>
                <option value="AP-South">AP-South</option>
                <option value="SA-East">SA-East</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Max Players</label>
              <input
                v-model.number="serverForm.maxPlayers"
                type="number"
                min="100"
                max="10000"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Tick Rate (Hz)</label>
              <input
                v-model.number="serverForm.tickRateHz"
                type="number"
                min="10"
                max="128"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Ping (ms)</label>
              <input
                v-model.number="serverForm.pingMs"
                type="number"
                min="1"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-ops-border">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim rounded font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="serversStore.isLoading"
              class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition"
            >
              Provision Node
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Edit Server Telemetry & Configuration Modal -->
    <div
      v-if="showEditModal && editingServer"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-lg bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs">
        <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
          <div>
            <h3 class="font-mono font-bold text-sm text-ops-text-bright">Edit Server Configuration & Telemetry</h3>
            <p class="text-2xs text-ops-text-dim font-mono mt-0.5">Instance: {{ editingServer.name }}</p>
          </div>
          <button @click="showEditModal = false" class="text-ops-text-dim hover:text-ops-text-bright font-mono">✕</button>
        </div>

        <form @submit.prevent="handleSaveEdit" class="p-5 space-y-3.5">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Server Name</label>
              <input
                v-model="editForm.name"
                type="text"
                required
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Server ID</label>
              <input
                v-model="editForm.serverId"
                type="text"
                required
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Host & Port</label>
              <input
                v-model="editForm.host"
                type="text"
                required
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Region</label>
              <select
                v-model="editForm.region"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              >
                <option value="US-East">US-East</option>
                <option value="US-West">US-West</option>
                <option value="EU-Central">EU-Central</option>
                <option value="EU-West">EU-West</option>
                <option value="AP-East">AP-East</option>
                <option value="AP-South">AP-South</option>
                <option value="SA-East">SA-East</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Operational State</label>
              <select
                v-model="editForm.status"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              >
                <option value="online">Online</option>
                <option value="high_load">High Load</option>
                <option value="draining">Draining</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Current Players</label>
              <input
                v-model.number="editForm.currentPlayers"
                type="number"
                min="0"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Max Capacity</label>
              <input
                v-model.number="editForm.maxPlayers"
                type="number"
                min="100"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Ping (ms)</label>
              <input
                v-model.number="editForm.pingMs"
                type="number"
                min="0"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Tick Rate (Hz)</label>
              <input
                v-model.number="editForm.tickRateHz"
                type="number"
                min="0"
                max="128"
                step="0.1"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Bandwidth (Mbps)</label>
              <input
                v-model.number="editForm.bandwidthMbps"
                type="number"
                min="0"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">CPU Usage (%)</label>
              <input
                v-model.number="editForm.cpuUsagePct"
                type="number"
                min="0"
                max="100"
                step="0.5"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Memory Usage (%)</label>
              <input
                v-model.number="editForm.memoryUsagePct"
                type="number"
                min="0"
                max="100"
                step="0.5"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono outline-none focus:border-ops-blue"
              />
            </div>
          </div>

          <div class="pt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="editForm.lockedForLogins"
                type="checkbox"
                class="rounded bg-ops-obsidian border-ops-border text-ops-blue focus:ring-0"
              />
              <span class="text-xs text-ops-text-bright font-mono">Lock Logins (Traffic Draining)</span>
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-ops-border">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim rounded font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="serversStore.isLoading"
              class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useServersStore } from '~/stores/servers';
import { useToast } from '~/composables/useToast';
import type { IGameServer, ServerNodeStatus, ServerRegion } from '../../../shared/types';

const authStore = useAuthStore();
const serversStore = useServersStore();
const toast = useToast();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingServer = ref<IGameServer | null>(null);

const serverForm = reactive({
  name: '',
  serverId: '',
  host: '198.51.100.24:7777',
  region: 'US-East' as ServerRegion,
  maxPlayers: 5000,
  tickRateHz: 60,
  pingMs: 20,
});

const editForm = reactive({
  _id: '',
  name: '',
  serverId: '',
  host: '',
  region: 'US-East' as ServerRegion,
  status: 'online' as ServerNodeStatus,
  currentPlayers: 0,
  maxPlayers: 5000,
  pingMs: 20,
  tickRateHz: 60.0,
  cpuUsagePct: 45.0,
  memoryUsagePct: 50.0,
  bandwidthMbps: 250,
  lockedForLogins: false,
});

onMounted(async () => {
  await serversStore.fetchServers();
});

function formatNumber(num: number) {
  return (num || 0).toLocaleString();
}

async function handleGenerateFleetPreset() {
  if (!confirm('Populate a realistic regional Game Server Fleet preset? (Replaces Game Server fleet data)')) return;
  const res = await serversStore.seedFleetPreset();
  if (res.ok) {
    toast.success('Fleet Preset Generated', 'Loaded 8 dedicated server nodes across US, EU, AP, and SA datacenters.');
  } else {
    toast.error('Generation Failed', res.error || 'Could not generate fleet preset.');
  }
}

async function handleClearFleet() {
  if (!confirm('Are you sure you want to delete ALL game server nodes from the fleet?')) return;
  const res = await serversStore.clearFleetPreset();
  if (res.ok) {
    toast.info('Fleet Cleared', res.message || 'All game server nodes removed.');
  } else {
    toast.error('Clear Failed', res.error || 'Could not clear fleet.');
  }
}

async function handleGenerateContentPreset() {
  if (!confirm('Populate complete Content Operations demo data (Events, Patches, Shop Items, and Issues)?')) return;
  const res = await serversStore.seedContentPreset();
  if (res.ok) {
    toast.success('Content Preset Generated', 'Loaded live events, patch releases, shop catalog items, and known issues.');
  } else {
    toast.error('Generation Failed', res.error || 'Could not generate content preset.');
  }
}

async function handleClearContentPreset() {
  if (!confirm('Are you sure you want to clear ALL Content Operations records (Events, Patches, Shop Items, and Issues)?')) return;
  const res = await serversStore.clearContentPreset();
  if (res.ok) {
    toast.info('Content Cleared', res.message || 'All content operations records removed.');
  } else {
    toast.error('Clear Failed', res.error || 'Could not clear content operations.');
  }
}

async function handleCreateServer() {
  const res = await serversStore.createServer(serverForm);
  if (res.ok) {
    toast.success('Server Provisioned', `Added ${serverForm.name} to active fleet.`);
    showCreateModal.value = false;
    serverForm.name = '';
    serverForm.serverId = '';
  } else {
    toast.error('Provisioning Failed', res.error || 'Could not provision server node.');
  }
}

function openEditModal(server: IGameServer) {
  editingServer.value = server;
  editForm._id = server._id;
  editForm.name = server.name;
  editForm.serverId = server.serverId;
  editForm.host = server.host;
  editForm.region = server.region;
  editForm.status = server.status;
  editForm.currentPlayers = server.currentPlayers;
  editForm.maxPlayers = server.maxPlayers;
  editForm.pingMs = server.pingMs;
  editForm.tickRateHz = server.tickRateHz;
  editForm.cpuUsagePct = server.cpuUsagePct;
  editForm.memoryUsagePct = server.memoryUsagePct;
  editForm.bandwidthMbps = server.bandwidthMbps;
  editForm.lockedForLogins = server.lockedForLogins;
  showEditModal.value = true;
}

async function handleSaveEdit() {
  if (!editingServer.value) return;
  const res = await serversStore.updateServer(editForm._id, {
    name: editForm.name,
    serverId: editForm.serverId,
    host: editForm.host,
    region: editForm.region,
    status: editForm.status,
    currentPlayers: editForm.currentPlayers,
    maxPlayers: editForm.maxPlayers,
    pingMs: editForm.pingMs,
    tickRateHz: editForm.tickRateHz,
    cpuUsagePct: editForm.cpuUsagePct,
    memoryUsagePct: editForm.memoryUsagePct,
    bandwidthMbps: editForm.bandwidthMbps,
    lockedForLogins: editForm.lockedForLogins,
  });

  if (res.ok) {
    toast.success('Server Updated', `Updated configuration & telemetry for ${editForm.name}.`);
    showEditModal.value = false;
    editingServer.value = null;
  } else {
    toast.error('Update Failed', res.error || 'Could not save server changes.');
  }
}

async function handleSetStatus(id: string, status: ServerNodeStatus) {
  const res = await serversStore.updateServerStatus(id, status);
  if (res.ok) {
    toast.info('Server State Mutated', `Server status set to ${status.toUpperCase()}`);
  } else {
    toast.error('Mutation Failed', res.error || 'Action failed.');
  }
}

async function handleToggleDrain(id: string) {
  const res = await serversStore.toggleServerDrain(id);
  if (res.ok) {
    toast.warning('Traffic Drain Toggled', 'Server traffic routing & login locks updated.');
  } else {
    toast.error('Action Failed', res.error || 'Action failed.');
  }
}

async function handleReboot(id: string, name: string) {
  if (!confirm(`Initiate reboot sequence on "${name}"?`)) return;
  const res = await serversStore.rebootServer(id);
  if (res.ok) {
    toast.success('Server Rebooted', `${name} restarted and verified operational.`);
  } else {
    toast.error('Reboot Failed', res.error || 'Action failed.');
  }
}

async function handleDeleteServer(id: string, name: string) {
  if (!confirm(`Decommission and remove "${name}" from fleet?`)) return;
  const res = await serversStore.deleteServer(id);
  if (res.ok) {
    toast.info('Server Decommissioned', `${name} removed from fleet.`);
  } else {
    toast.error('Decommission Failed', res.error || 'Action failed.');
  }
}
</script>
