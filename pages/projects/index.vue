<template>
  <div class="space-y-4 select-none font-sans">
    <!-- Top Bar: Projects Header & Switcher -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div class="flex items-center gap-4">
        <div>
          <div class="text-2xs font-mono uppercase text-ops-text-dim">Subsystem 05 / Engineering & QA</div>
          <h1 class="text-lg font-bold text-ops-text-bright font-sans flex items-center gap-2">
            <span>Projects & Kanban</span>
            <span v-if="projectsStore.activeProject" class="text-xs px-2 py-0.5 rounded bg-ops-subtle border border-ops-border text-ops-blue-glow font-mono font-normal">
              [{{ projectsStore.activeProject.key }}]
            </span>
          </h1>
        </div>

        <!-- Project Selector Dropdown -->
        <div v-if="projectsStore.projects.length > 0" class="flex items-center gap-2 pl-4 border-l border-ops-border">
          <label class="text-2xs font-mono text-ops-text-dim uppercase">Active Project:</label>
          <select
            :value="projectsStore.activeProject?._id"
            @change="handleSelectProject(($event.target as HTMLSelectElement).value)"
            class="bg-ops-surface border border-ops-border rounded px-2.5 py-1 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none"
          >
            <option v-for="proj in projectsStore.projects" :key="proj._id" :value="proj._id">
              {{ proj.name }} ({{ proj.key }})
            </option>
          </select>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <!-- Add Column Button (Dev, QA, Admin only) -->
        <button
          v-if="projectsStore.activeProject && authStore.canManageKanban"
          @click="showAddColumnModal = true"
          class="px-2.5 py-1.5 bg-ops-surface hover:bg-ops-surface-hover border border-ops-border text-ops-text-bright font-mono text-xs rounded transition flex items-center gap-1 shadow-xs"
          title="Add a custom column to this Kanban board"
        >
          <span class="text-ops-blue-glow">+</span>
          <span>Add Column</span>
        </button>

        <!-- New Ticket Button -->
        <button
          v-if="projectsStore.activeProject"
          @click="showCreateTicketModal = true"
          class="px-3 py-1.5 bg-ops-blue hover:bg-ops-blue-dark text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
        >
          <span>+</span>
          <span>New Ticket</span>
        </button>

        <!-- New Project Button -->
        <button
          @click="showCreateProjectModal = true"
          class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
        >
          <span>+</span>
          <span>New Project</span>
        </button>
      </div>
    </div>

    <!-- Empty State: When No Projects Exist -->
    <div
      v-if="projectsStore.projects.length === 0 && !projectsStore.isLoading"
      class="p-12 text-center border-2 border-dashed border-ops-border rounded bg-ops-surface space-y-4 my-8"
    >
      <div class="w-12 h-12 rounded-full bg-ops-blue/10 border border-ops-blue/30 text-ops-blue-glow flex items-center justify-center mx-auto text-xl font-mono">
        ◫
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-ops-text-bright">No Projects Created Yet</h3>
        <p class="text-xs text-ops-text-dim max-w-md mx-auto font-sans">
          Create your first project to start tracking development tasks and QA issues with dedicated, customizable Kanban boards.
        </p>
      </div>
      <button
        @click="showCreateProjectModal = true"
        class="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded shadow transition inline-flex items-center gap-2"
      >
        <span>+ Create First Project</span>
      </button>
    </div>

    <!-- Active Kanban Board -->
    <div v-else-if="projectsStore.activeProject" class="space-y-4">
      <!-- Project Summary Banner -->
      <div class="flex items-center justify-between p-3 bg-ops-surface rounded border border-ops-border font-mono text-2xs">
        <div class="flex items-center gap-3">
          <span class="text-ops-text-dim">DESCRIPTION:</span>
          <span class="text-ops-text-bright">{{ projectsStore.activeProject.description || 'No description provided.' }}</span>
        </div>
        <div class="flex items-center gap-4 text-ops-text-dim">
          <span>COLUMNS: <strong class="text-ops-text-bright">{{ projectsStore.columns.length }}</strong></span>
          <span>TOTAL CARDS: <strong class="text-ops-text-bright">{{ projectsStore.activeProjectTickets.length }}</strong></span>
        </div>
      </div>

      <!-- Dynamic Columns Grid -->
      <div
        class="grid gap-3 items-start overflow-x-auto pb-4"
        :style="{ gridTemplateColumns: `repeat(${projectsStore.columns.length}, minmax(280px, 1fr))` }"
      >
        <div
          v-for="col in projectsStore.columns"
          :key="col.id"
          :class="[
            'bg-ops-surface rounded border transition-all duration-200 flex flex-col min-h-[550px] shadow-xs',
            activeDropZone === col.id
              ? 'border-ops-blue ring-2 ring-ops-blue/50 bg-ops-blue/5'
              : 'border-ops-border'
          ]"
          @dragover.prevent="handleDragOver($event, col.id)"
          @dragenter.prevent="handleDragEnter(col.id)"
          @dragleave="handleDragLeave($event, col.id)"
          @drop="handleDrop($event, col.id)"
        >
          <!-- Column Header -->
          <div class="p-2.5 border-b border-ops-border bg-ops-subtle flex items-center justify-between font-mono text-2xs">
            <div class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-ops-blue shrink-0" />
              <span class="font-bold text-ops-text-bright uppercase truncate">{{ col.name }}</span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="px-1.5 py-0.5 bg-ops-obsidian rounded text-ops-text-dim font-bold">
                {{ getTicketsForColumn(col.id).length }}
              </span>

              <!-- Delete Column Button (Dev, QA, Admin only, if >1 columns) -->
              <button
                v-if="authStore.canManageKanban && projectsStore.columns.length > 1"
                @click.stop="confirmRemoveColumn(col.id, col.name)"
                class="w-5 h-5 rounded hover:bg-rose-950/60 hover:text-rose-400 text-ops-text-dim transition flex items-center justify-center text-xs"
                :title="`Delete '${col.name}' column`"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Column Ticket List -->
          <div class="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            <!-- Drop Indicator -->
            <div
              v-if="activeDropZone === col.id && draggedTicket?.status !== col.id"
              class="p-3 border-2 border-dashed border-ops-blue/60 bg-ops-blue/10 rounded text-center text-2xs font-mono text-ops-blue-glow animate-pulse"
            >
              Move card to {{ col.name }}
            </div>

            <!-- Ticket Card -->
            <div
              v-for="ticket in getTicketsForColumn(col.id)"
              :key="ticket._id"
              draggable="true"
              @dragstart="handleDragStart($event, ticket)"
              @dragend="handleDragEnd"
              :class="[
                'p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover border rounded cursor-grab active:cursor-grabbing transition-all space-y-1.5 group',
                draggedTicket?._id === ticket._id
                  ? 'opacity-40 border-dashed border-ops-blue'
                  : 'border-ops-border hover:border-ops-blue/80'
              ]"
            >
              <div class="flex items-center justify-between gap-1.5">
                <span class="font-mono font-bold text-2xs text-ops-blue-glow">{{ ticket.ticketKey }}</span>
                <span :class="[
                  'text-3xs font-mono font-semibold px-1.5 py-0.5 rounded border',
                  ticket.severity === 'critical_blocker' ? 'bg-rose-950/80 text-rose-300 border-rose-800' :
                  ticket.severity === 'major' ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                  'bg-ops-surface text-ops-text-dim border-ops-border'
                ]">
                  {{ ticket.severity }}
                </span>
              </div>

              <h4 class="font-bold text-xs text-ops-text-bright leading-snug group-hover:text-ops-blue-glow transition">
                {{ ticket.title }}
              </h4>

              <div class="text-2xs font-mono text-ops-text-dim flex items-center justify-between pt-1 border-t border-ops-border/40">
                <span class="truncate">{{ ticket.category }}</span>
                <span v-if="ticket.assignedTo" class="text-ops-blue-glow truncate">
                  @{{ ticket.assignedTo }}
                </span>
                <span v-else class="text-ops-text-dim/60 italic">unassigned</span>
              </div>
            </div>

            <!-- Empty Column Placeholder -->
            <div
              v-if="getTicketsForColumn(col.id).length === 0 && activeDropZone !== col.id"
              class="p-6 text-center text-3xs font-mono text-ops-text-dim/50 border border-dashed border-ops-border/40 rounded"
            >
              No cards in {{ col.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create New Project -->
    <div
      v-if="showCreateProjectModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      @click.self="showCreateProjectModal = false"
    >
      <div class="bg-ops-surface border border-ops-border rounded-lg shadow-xl w-full max-w-md p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-ops-border pb-3">
          <h3 class="text-sm font-bold text-ops-text-bright font-mono uppercase">Create New Project</h3>
          <button @click="showCreateProjectModal = false" class="text-ops-text-dim hover:text-ops-text-bright">✕</button>
        </div>

        <form @submit.prevent="submitCreateProject" class="space-y-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Project Name</label>
            <input
              v-model="newProjectName"
              type="text"
              required
              placeholder="e.g. Season 4 Live Operations"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Project Key (Prefix for Tickets)</label>
            <input
              v-model="newProjectKey"
              type="text"
              required
              maxlength="10"
              placeholder="e.g. S4OPS"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright font-mono uppercase focus:border-ops-blue outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Description</label>
            <textarea
              v-model="newProjectDescription"
              rows="3"
              placeholder="Scope and purpose of this project..."
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
            />
          </div>

          <div class="p-2.5 bg-ops-subtle rounded border border-ops-border text-3xs font-mono text-ops-text-dim space-y-1">
            <span class="font-bold text-ops-text-bright block">Default Kanban Stages:</span>
            <span>Todo → Doing → Develop → Testing → Done</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-ops-border">
            <button
              type="button"
              @click="showCreateProjectModal = false"
              class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim rounded font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-mono font-bold text-xs rounded"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Add Column (Dev, QA, Admin only) -->
    <div
      v-if="showAddColumnModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      @click.self="showAddColumnModal = false"
    >
      <div class="bg-ops-surface border border-ops-border rounded-lg shadow-xl w-full max-w-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-ops-border pb-3">
          <h3 class="text-sm font-bold text-ops-text-bright font-mono uppercase">Add Kanban Column</h3>
          <button @click="showAddColumnModal = false" class="text-ops-text-dim hover:text-ops-text-bright">✕</button>
        </div>

        <form @submit.prevent="submitAddColumn" class="space-y-3">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Column Name</label>
            <input
              v-model="newColumnName"
              type="text"
              required
              placeholder="e.g. Code Review, Blocked, Staging..."
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-ops-border">
            <button
              type="button"
              @click="showAddColumnModal = false"
              class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim rounded font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-dark text-white font-mono font-bold text-xs rounded"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Create Ticket in Project -->
    <div
      v-if="showCreateTicketModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      @click.self="showCreateTicketModal = false"
    >
      <div class="bg-ops-surface border border-ops-border rounded-lg shadow-xl w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-ops-border pb-3">
          <div>
            <h3 class="text-sm font-bold text-ops-text-bright font-mono uppercase">Add Card to {{ projectsStore.activeProject?.name }}</h3>
            <span class="text-2xs font-mono text-ops-text-dim">Project Key: {{ projectsStore.activeProject?.key }}</span>
          </div>
          <button @click="showCreateTicketModal = false" class="text-ops-text-dim hover:text-ops-text-bright">✕</button>
        </div>

        <form @submit.prevent="submitCreateTicket" class="space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-1">
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Ticket Key</label>
              <input
                v-model="newTicketKey"
                type="text"
                required
                class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright font-mono uppercase focus:border-ops-blue outline-none"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Initial Column / Status</label>
              <select
                v-model="newTicketStatus"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none"
              >
                <option v-for="col in projectsStore.columns" :key="col.id" :value="col.id">
                  {{ col.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Title / Summary</label>
            <input
              v-model="newTicketTitle"
              type="text"
              required
              placeholder="e.g. Implement Loot Box Roll Rate Auditing"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Description & Acceptance Criteria</label>
            <textarea
              v-model="newTicketDesc"
              rows="3"
              required
              placeholder="Details of the task or bug report..."
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Category</label>
              <select
                v-model="newTicketCategory"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none"
              >
                <option value="quest">Quest</option>
                <option value="loot_table">Loot Table</option>
                <option value="combat_balance">Combat Balance</option>
                <option value="client_crash">Client Crash</option>
                <option value="shop_billing">Shop & Billing</option>
                <option value="server_lag">Server Lag</option>
                <option value="ui_glitch">UI Glitch</option>
              </select>
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Severity</label>
              <select
                v-model="newTicketSeverity"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none"
              >
                <option value="critical_blocker">Critical Blocker</option>
                <option value="major">Major</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-ops-border">
            <button
              type="button"
              @click="showCreateTicketModal = false"
              class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim rounded font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-dark text-white font-mono font-bold text-xs rounded"
            >
              Add Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useProjectsStore } from '~/stores/projects';
import { useAuthStore } from '~/stores/auth';
import type { IIssueTicket } from '../../shared/types';

const projectsStore = useProjectsStore();
const authStore = useAuthStore();

// Modals
const showCreateProjectModal = ref(false);
const showAddColumnModal = ref(false);
const showCreateTicketModal = ref(false);
const isSubmitting = ref(false);

// Form fields
const newProjectName = ref('');
const newProjectKey = ref('');
const newProjectDescription = ref('');

const newColumnName = ref('');

const newTicketKey = ref('');
const newTicketTitle = ref('');
const newTicketDesc = ref('');
const newTicketCategory = ref('quest');
const newTicketSeverity = ref('moderate');
const newTicketStatus = ref('todo');

// Drag and drop state
const draggedTicket = ref<IIssueTicket | null>(null);
const activeDropZone = ref<string | null>(null);

onMounted(async () => {
  await projectsStore.fetchProjects();
  initDefaultTicketKey();
});

watch(
  () => projectsStore.activeProject,
  () => {
    initDefaultTicketKey();
    if (projectsStore.columns.length > 0) {
      newTicketStatus.value = projectsStore.columns[0].id;
    }
  }
);

function initDefaultTicketKey() {
  if (projectsStore.activeProject) {
    const nextNum = (projectsStore.activeProjectTickets.length + 1).toString().padStart(3, '0');
    newTicketKey.value = `${projectsStore.activeProject.key}-${nextNum}`;
  }
}

function handleSelectProject(projectId: string) {
  projectsStore.selectProject(projectId);
}

function getTicketsForColumn(columnId: string) {
  return projectsStore.activeProjectTickets.filter((t) => t.status === columnId);
}

async function submitCreateProject() {
  if (!newProjectName.value || !newProjectKey.value) return;
  isSubmitting.value = true;
  const ok = await projectsStore.createProject({
    name: newProjectName.value,
    key: newProjectKey.value,
    description: newProjectDescription.value,
  });
  isSubmitting.value = false;
  if (ok) {
    showCreateProjectModal.value = false;
    newProjectName.value = '';
    newProjectKey.value = '';
    newProjectDescription.value = '';
  }
}

async function submitAddColumn() {
  if (!newColumnName.value.trim()) return;
  const ok = await projectsStore.addColumn(newColumnName.value.trim());
  if (ok) {
    showAddColumnModal.value = false;
    newColumnName.value = '';
  }
}

async function confirmRemoveColumn(columnId: string, columnName: string) {
  const count = getTicketsForColumn(columnId).length;
  const promptMsg = count > 0
    ? `Column "${columnName}" contains ${count} tickets. Are you sure you want to delete this column?`
    : `Delete column "${columnName}"?`;

  if (confirm(promptMsg)) {
    await projectsStore.removeColumn(columnId);
  }
}

async function submitCreateTicket() {
  if (!newTicketTitle.value.trim() || !newTicketDesc.value.trim()) return;
  const ok = await projectsStore.createTicket({
    ticketKey: newTicketKey.value.toUpperCase(),
    title: newTicketTitle.value.trim(),
    description: newTicketDesc.value.trim(),
    category: newTicketCategory.value as any,
    severity: newTicketSeverity.value as any,
    status: newTicketStatus.value,
    reproductionSteps: [],
  });

  if (ok) {
    showCreateTicketModal.value = false;
    newTicketTitle.value = '';
    newTicketDesc.value = '';
    initDefaultTicketKey();
  }
}

// Drag & Drop
function handleDragStart(event: DragEvent, ticket: IIssueTicket) {
  draggedTicket.value = ticket;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', ticket._id);
  }
}

function handleDragEnd() {
  draggedTicket.value = null;
  activeDropZone.value = null;
}

function handleDragOver(event: DragEvent, columnId: string) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleDragEnter(columnId: string) {
  activeDropZone.value = columnId;
}

function handleDragLeave(event: DragEvent, columnId: string) {
  const currentTarget = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (!currentTarget.contains(relatedTarget)) {
    if (activeDropZone.value === columnId) {
      activeDropZone.value = null;
    }
  }
}

async function handleDrop(event: DragEvent, targetColumnId: string) {
  event.preventDefault();
  activeDropZone.value = null;

  if (!draggedTicket.value) return;
  if (draggedTicket.value.status === targetColumnId) return;

  const ticketId = draggedTicket.value._id;
  draggedTicket.value = null;

  await projectsStore.transitionTicketStatus(ticketId, targetColumnId);
}
</script>
