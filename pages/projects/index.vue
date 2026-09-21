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
          @click="openNewTicketModal"
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
          <span>CATEGORIES: <strong class="text-ops-text-bright">{{ currentProjectCategories.length }}</strong></span>
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

            <!-- Ticket Card (Click to open Odoo-style Edit Modal) -->
            <div
              v-for="ticket in getTicketsForColumn(col.id)"
              :key="ticket._id"
              draggable="true"
              @dragstart="handleDragStart($event, ticket)"
              @dragend="handleDragEnd"
              @click="openTaskDetailModal(ticket)"
              :class="[
                'p-3 bg-ops-obsidian hover:bg-ops-surface-hover border rounded cursor-pointer transition-all space-y-2 group shadow-xs',
                draggedTicket?._id === ticket._id
                  ? 'opacity-40 border-dashed border-ops-blue'
                  : 'border-ops-border hover:border-ops-blue/80'
              ]"
            >
              <div class="flex items-center justify-between gap-1.5">
                <span class="font-mono font-bold text-2xs text-ops-blue-glow group-hover:underline">
                  {{ ticket.ticketKey }}
                </span>
                <CommonStatusPill :status="ticket.severity" :label="formatPriorityLabel(ticket.severity)" />
              </div>

              <h4 class="font-bold text-xs text-ops-text-bright leading-snug group-hover:text-ops-blue-glow transition line-clamp-2">
                {{ ticket.title }}
              </h4>

              <div class="text-2xs font-mono text-ops-text-dim flex items-center justify-between pt-1.5 border-t border-ops-border/40">
                <span class="px-1.5 py-0.5 rounded bg-ops-subtle border border-ops-border text-ops-text-base truncate max-w-[130px]">
                  {{ ticket.category || 'Task' }}
                </span>
                <span v-if="ticket.assignedTo" class="text-ops-blue-glow truncate font-medium">
                  @{{ ticket.assignedTo }}
                </span>
                <span v-else class="text-ops-text-dim/50 italic">unassigned</span>
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

    <!-- ======================================================== -->
    <!-- MODAL 1: Odoo-Style Task Detail & Full Edit Modal -->
    <!-- ======================================================== -->
    <div
      v-if="showTaskDetailModal && selectedTask"
      class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto"
      @click.self="closeTaskDetailModal"
    >
      <div class="bg-ops-surface border border-ops-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-ops-text-bright animate-in fade-in zoom-in-95 duration-150">
        <!-- Top Stage Progression & Breadcrumb Bar -->
        <div class="px-5 py-3 border-b border-ops-border bg-ops-subtle flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 font-mono text-2xs text-ops-text-dim truncate">
            <span>Project</span>
            <span>/</span>
            <span class="text-ops-text-bright font-bold">{{ projectsStore.activeProject?.name }}</span>
            <span>/</span>
            <span class="text-ops-blue-glow font-bold">[{{ selectedTask.ticketKey }}]</span>
          </div>

          <!-- Clickable Stage Pipeline (Odoo style) -->
          <div class="flex items-center rounded-lg border border-ops-border bg-ops-obsidian overflow-hidden p-0.5">
            <button
              v-for="col in projectsStore.columns"
              :key="col.id"
              @click="changeTaskStage(col.id)"
              :class="[
                'px-3 py-1 text-2xs font-mono font-semibold transition uppercase tracking-wider',
                editForm.status === col.id
                  ? 'bg-ops-blue text-white shadow-xs font-bold'
                  : 'text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface'
              ]"
            >
              {{ col.name }}
            </button>
          </div>

          <!-- Close Button -->
          <button @click="closeTaskDetailModal" class="text-ops-text-dim hover:text-ops-text-bright text-sm p-1">
            ✕
          </button>
        </div>

        <!-- Action Ribbon (Send message / Log note / Save) -->
        <div class="px-5 py-2.5 border-b border-ops-border bg-ops-surface flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button
              @click="isLoggingNote = !isLoggingNote"
              class="px-3 py-1 bg-ops-subtle hover:bg-ops-surface-hover border border-ops-border rounded font-mono text-xs text-ops-text-bright flex items-center gap-1.5 transition"
            >
              <span>📝</span>
              <span>Log Note</span>
            </button>
            <button
              @click="saveTaskEdits"
              :disabled="isSavingTask"
              class="px-3.5 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
            >
              <span>✓</span>
              <span>{{ isSavingTask ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>

          <div class="flex items-center gap-2 font-mono text-2xs text-ops-text-dim">
            <span>Created by: <strong class="text-ops-text-bright">{{ selectedTask.reportedBy }}</strong></span>
            <span>•</span>
            <span>Updated: {{ formatDate(selectedTask.updatedAt) }}</span>
          </div>
        </div>

        <!-- Main Modal Content: Split Pane -->
        <div class="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-ops-border">
          <!-- Left Pane (7 cols): Task Details & Description -->
          <div class="lg:col-span-7 p-6 space-y-5">
            <!-- Title Input -->
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Task Summary / Title</label>
              <input
                v-model="editForm.title"
                type="text"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-sm font-bold text-ops-text-bright focus:border-ops-blue outline-none"
                placeholder="Task title..."
              />
            </div>

            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-4 p-4 rounded-lg bg-ops-obsidian/50 border border-ops-border font-mono text-xs">
              <!-- Assignee Field -->
              <div>
                <label class="block text-2xs uppercase text-ops-text-dim mb-1">Assignee</label>
                <select
                  v-model="editForm.assignedTo"
                  class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
                >
                  <option value="">Unassigned</option>
                  <option v-for="op in authStore.operators" :key="op._id" :value="op.username">
                    {{ op.username }} ({{ op.role }})
                  </option>
                </select>
              </div>

              <!-- Priority Field (3 levels only) -->
              <div>
                <label class="block text-2xs uppercase text-ops-text-dim mb-1">Priority</label>
                <select
                  v-model="editForm.severity"
                  class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue outline-none font-bold"
                >
                  <option value="high" class="text-amber-400">High</option>
                  <option value="very_high" class="text-rose-400">Very High</option>
                  <option value="most_important" class="text-purple-400">Most Important</option>
                </select>
              </div>

              <!-- Category Field with Dynamic + Button -->
              <div class="col-span-2">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-2xs uppercase text-ops-text-dim">Category</label>
                  <button
                    type="button"
                    @click="isAddingCategoryInModal = !isAddingCategoryInModal"
                    class="text-3xs font-mono text-ops-blue-glow hover:underline flex items-center gap-1"
                  >
                    <span>+ New Category</span>
                  </button>
                </div>

                <!-- Category Selector -->
                <div v-if="!isAddingCategoryInModal" class="flex gap-2">
                  <select
                    v-model="editForm.category"
                    class="flex-1 bg-ops-obsidian border border-ops-border rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
                  >
                    <option v-for="cat in currentProjectCategories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>

                <!-- Inline Category Creator -->
                <div v-else class="flex gap-2 items-center">
                  <input
                    v-model="newCategoryInput"
                    type="text"
                    placeholder="Enter category name..."
                    @keyup.enter="handleCreateCategoryInline"
                    class="flex-1 bg-ops-obsidian border border-ops-blue rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:outline-none"
                  />
                  <button
                    type="button"
                    @click="handleCreateCategoryInline"
                    class="px-2.5 py-1.5 bg-ops-blue hover:bg-ops-blue-dark text-white rounded text-2xs font-bold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    @click="isAddingCategoryInModal = false"
                    class="px-2 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border rounded text-2xs text-ops-text-dim"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Description & Acceptance Criteria Tab -->
            <div class="space-y-2">
              <div class="flex items-center border-b border-ops-border gap-4 pb-2">
                <button class="font-mono text-xs font-bold text-ops-blue-glow border-b-2 border-ops-blue pb-1">
                  Description & Flow
                </button>
              </div>

              <textarea
                v-model="editForm.description"
                rows="8"
                class="w-full bg-ops-obsidian border border-ops-border rounded-lg p-3 text-xs text-ops-text-bright leading-relaxed focus:border-ops-blue outline-none font-sans"
                placeholder="Detailed description, requirements, expected behavior, and acceptance criteria..."
              />
            </div>
          </div>

          <!-- Right Pane (5 cols): Activity Timeline & Log Notes (Odoo style) -->
          <div class="lg:col-span-5 p-6 bg-ops-subtle/40 flex flex-col h-full space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-ops-border">
              <h4 class="font-mono font-bold text-xs uppercase text-ops-text-bright flex items-center gap-1.5">
                <span>History & Log Notes</span>
                <span class="text-3xs px-1.5 py-0.2 rounded bg-ops-obsidian text-ops-text-dim">
                  {{ selectedTask.internalNotes?.length || 0 }}
                </span>
              </h4>
            </div>

            <!-- Inline Log Note Composer (shows when toggled or always ready) -->
            <div class="p-3 bg-ops-surface rounded-lg border border-ops-border space-y-2">
              <label class="block text-2xs font-mono uppercase text-ops-text-dim">Add a Log Note</label>
              <textarea
                v-model="newLogNoteText"
                rows="3"
                placeholder="Log internal work, investigation details, or transition notes..."
                class="w-full bg-ops-obsidian border border-ops-border rounded p-2.5 text-xs text-ops-text-bright focus:border-ops-blue outline-none font-sans"
              />
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="submitLogNote"
                  :disabled="!newLogNoteText.trim() || isSubmittingNote"
                  class="px-3 py-1 bg-ops-blue hover:bg-ops-blue-dark disabled:opacity-40 text-white font-mono font-bold text-xs rounded transition"
                >
                  {{ isSubmittingNote ? 'Recording...' : 'Log Note' }}
                </button>
              </div>
            </div>

            <!-- Notes & History Feed -->
            <div class="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
              <div
                v-for="(note, idx) in sortedNotes"
                :key="idx"
                class="p-3 bg-ops-obsidian border border-ops-border rounded-lg space-y-1.5 text-xs font-sans"
              >
                <div class="flex items-center justify-between font-mono text-2xs">
                  <div class="flex items-center gap-1.5 font-bold text-ops-text-bright">
                    <span class="w-2 h-2 rounded-full bg-ops-blue" />
                    <span>{{ note.author }}</span>
                    <span class="text-ops-text-dim text-3xs font-normal">({{ note.authorRole }})</span>
                  </div>
                  <span class="text-ops-text-dim text-3xs">{{ formatRelativeTime(note.timestamp) }}</span>
                </div>
                <p class="text-xs text-ops-text-base whitespace-pre-wrap leading-relaxed">
                  {{ note.note }}
                </p>
              </div>

              <div
                v-if="!selectedTask.internalNotes || selectedTask.internalNotes.length === 0"
                class="text-center py-8 text-2xs font-mono text-ops-text-dim/60 italic"
              >
                No history notes logged yet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 2: Create New Project -->
    <!-- ======================================================== -->
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

    <!-- ======================================================== -->
    <!-- MODAL 3: Add Kanban Column (Dev, QA, Admin only) -->
    <!-- ======================================================== -->
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
              placeholder="e.g. Pull Request, Test SIT, Staging..."
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

    <!-- ======================================================== -->
    <!-- MODAL 4: Create Ticket in Project -->
    <!-- ======================================================== -->
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
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Initial Column / Stage</label>
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
              placeholder="e.g. [Quest] Add Archive Tab in Quest Manager"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Description & Flow</label>
            <textarea
              v-model="newTicketDesc"
              rows="3"
              required
              placeholder="Details of the task or expected behavior..."
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-ops-blue outline-none"
            />
          </div>

          <!-- Assignee & Priority -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Assignee</label>
              <select
                v-model="newTicketAssignee"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none"
              >
                <option value="">Unassigned</option>
                <option v-for="op in authStore.operators" :key="op._id" :value="op.username">
                  {{ op.username }} ({{ op.role }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Priority</label>
              <select
                v-model="newTicketSeverity"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none font-bold"
              >
                <option value="high">High</option>
                <option value="very_high">Very High</option>
                <option value="most_important">Most Important</option>
              </select>
            </div>
          </div>

          <!-- Category with + New Category option -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-2xs font-mono uppercase text-ops-text-dim">Category</label>
              <button
                type="button"
                @click="isAddingCategoryInCreate = !isAddingCategoryInCreate"
                class="text-3xs font-mono text-ops-blue-glow hover:underline"
              >
                + Add New Category
              </button>
            </div>

            <div v-if="!isAddingCategoryInCreate">
              <select
                v-model="newTicketCategory"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono focus:border-ops-blue outline-none"
              >
                <option v-for="cat in currentProjectCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div v-else class="flex gap-2 items-center">
              <input
                v-model="newCategoryInput"
                type="text"
                placeholder="Enter new category..."
                class="flex-1 bg-ops-obsidian border border-ops-blue rounded px-2.5 py-1.5 text-xs text-ops-text-bright focus:outline-none"
              />
              <button
                type="button"
                @click="handleCreateCategoryInCreate"
                class="px-2.5 py-1.5 bg-ops-blue hover:bg-ops-blue-dark text-white rounded text-2xs font-bold"
              >
                Add
              </button>
              <button
                type="button"
                @click="isAddingCategoryInCreate = false"
                class="px-2 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border rounded text-2xs text-ops-text-dim"
              >
                Cancel
              </button>
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useProjectsStore } from '~/stores/projects';
import { useAuthStore } from '~/stores/auth';
import type { IIssueTicket, IssueSeverity } from '../../shared/types';

const projectsStore = useProjectsStore();
const authStore = useAuthStore();

// Modals
const showCreateProjectModal = ref(false);
const showAddColumnModal = ref(false);
const showCreateTicketModal = ref(false);
const showTaskDetailModal = ref(false);
const isSubmitting = ref(false);
const isSavingTask = ref(false);
const isLoggingNote = ref(false);
const isSubmittingNote = ref(false);

// Category creation state
const isAddingCategoryInModal = ref(false);
const isAddingCategoryInCreate = ref(false);
const newCategoryInput = ref('');

// Project creation form
const newProjectName = ref('');
const newProjectKey = ref('');
const newProjectDescription = ref('');

// Column creation form
const newColumnName = ref('');

// Ticket creation form
const newTicketKey = ref('');
const newTicketTitle = ref('');
const newTicketDesc = ref('');
const newTicketCategory = ref('Task');
const newTicketSeverity = ref<IssueSeverity>('high');
const newTicketStatus = ref('todo');
const newTicketAssignee = ref('');

// Selected task for editing
const selectedTask = ref<IIssueTicket | null>(null);
const newLogNoteText = ref('');
const editForm = reactive({
  title: '',
  description: '',
  category: 'Task',
  severity: 'high' as IssueSeverity,
  status: 'todo',
  assignedTo: '',
});

// Drag and drop state
const draggedTicket = ref<IIssueTicket | null>(null);
const activeDropZone = ref<string | null>(null);

// Categories for currently active project
const currentProjectCategories = computed(() => {
  if (projectsStore.activeProject?.categories && projectsStore.activeProject.categories.length > 0) {
    return projectsStore.activeProject.categories;
  }
  return ['Feature', 'Bug', 'Task', 'Quest', 'Improvement'];
});

// Notes sorted newest first
const sortedNotes = computed(() => {
  if (!selectedTask.value?.internalNotes) return [];
  return [...selectedTask.value.internalNotes].reverse();
});

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchProjects(),
    authStore.fetchOperators(),
  ]);
  initDefaultTicketKey();
});

watch(
  () => projectsStore.activeProject,
  () => {
    initDefaultTicketKey();
    if (projectsStore.columns.length > 0) {
      newTicketStatus.value = projectsStore.columns[0].id;
    }
    if (currentProjectCategories.value.length > 0) {
      newTicketCategory.value = currentProjectCategories.value[0];
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

function formatPriorityLabel(severity: string) {
  if (severity === 'most_important') return 'Most Important';
  if (severity === 'very_high') return 'Very High';
  if (severity === 'high') return 'High';
  return severity;
}

function formatDate(isoDate?: string) {
  if (!isoDate) return 'Just now';
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeTime(isoDate: string) {
  try {
    const d = new Date(isoDate);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

// Open Odoo-style Task Detail Modal
function openTaskDetailModal(ticket: IIssueTicket) {
  selectedTask.value = ticket;
  editForm.title = ticket.title;
  editForm.description = ticket.description;
  editForm.category = ticket.category || 'Task';
  editForm.severity = (ticket.severity as IssueSeverity) || 'high';
  editForm.status = ticket.status;
  editForm.assignedTo = typeof ticket.assignedTo === 'string' ? ticket.assignedTo : ticket.assignedTo?.username || '';
  newLogNoteText.value = '';
  isAddingCategoryInModal.value = false;
  showTaskDetailModal.value = true;
}

function closeTaskDetailModal() {
  showTaskDetailModal.value = false;
  selectedTask.value = null;
}

// Stage change via Odoo stage bar
async function changeTaskStage(newStageId: string) {
  editForm.status = newStageId;
  if (!selectedTask.value) return;
  await projectsStore.transitionTicketStatus(selectedTask.value._id, newStageId);
  selectedTask.value.status = newStageId;
}

// Save all task edits
async function saveTaskEdits() {
  if (!selectedTask.value) return;
  isSavingTask.value = true;

  const ok = await projectsStore.updateTicket(selectedTask.value._id, {
    title: editForm.title.trim(),
    description: editForm.description.trim(),
    category: editForm.category,
    severity: editForm.severity,
    assignedTo: editForm.assignedTo || undefined,
    status: editForm.status,
  });

  isSavingTask.value = false;
  if (ok && selectedTask.value) {
    selectedTask.value.title = editForm.title;
    selectedTask.value.description = editForm.description;
    selectedTask.value.category = editForm.category;
    selectedTask.value.severity = editForm.severity;
    selectedTask.value.assignedTo = editForm.assignedTo;
  }
}

// Submit a log note
async function submitLogNote() {
  if (!selectedTask.value || !newLogNoteText.value.trim()) return;
  isSubmittingNote.value = true;

  const ok = await projectsStore.addTicketNote(selectedTask.value._id, newLogNoteText.value.trim());
  isSubmittingNote.value = false;

  if (ok) {
    // Append to local view
    const newNote = {
      author: authStore.user?.username || 'You',
      authorRole: authStore.role || 'operator',
      note: newLogNoteText.value.trim(),
      timestamp: new Date().toISOString(),
    };
    if (!selectedTask.value.internalNotes) {
      selectedTask.value.internalNotes = [];
    }
    selectedTask.value.internalNotes.push(newNote);
    newLogNoteText.value = '';
  }
}

// Add category on the fly from detail modal
async function handleCreateCategoryInline() {
  const cat = newCategoryInput.value.trim();
  if (!cat) return;
  const ok = await projectsStore.addCategory(cat);
  if (ok) {
    editForm.category = cat;
    newCategoryInput.value = '';
    isAddingCategoryInModal.value = false;
  }
}

// Add category on the fly from creation modal
async function handleCreateCategoryInCreate() {
  const cat = newCategoryInput.value.trim();
  if (!cat) return;
  const ok = await projectsStore.addCategory(cat);
  if (ok) {
    newTicketCategory.value = cat;
    newCategoryInput.value = '';
    isAddingCategoryInCreate.value = false;
  }
}

function openNewTicketModal() {
  initDefaultTicketKey();
  if (currentProjectCategories.value.length > 0) {
    newTicketCategory.value = currentProjectCategories.value[0];
  }
  showCreateTicketModal.value = true;
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
    category: newTicketCategory.value,
    severity: newTicketSeverity.value,
    status: newTicketStatus.value,
    assignedTo: newTicketAssignee.value || undefined,
    reproductionSteps: [],
  });

  if (ok) {
    showCreateTicketModal.value = false;
    newTicketTitle.value = '';
    newTicketDesc.value = '';
    newTicketAssignee.value = '';
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
