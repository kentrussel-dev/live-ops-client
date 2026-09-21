import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IProject, IKanbanColumn, IIssueTicket } from '../../shared/types';
import { useToast } from '~/composables/useToast';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<IProject[]>([]);
  const activeProjectId = ref<string | null>(null);
  const activeProjectTickets = ref<IIssueTicket[]>([]);
  const isLoading = ref(false);
  const isCreateProjectModalOpen = ref(false);

  const activeProject = computed<IProject | null>(() => {
    if (!projects.value.length) return null;
    if (activeProjectId.value) {
      return projects.value.find((p) => p._id === activeProjectId.value) || projects.value[0];
    }
    return projects.value[0] || null;
  });

  const columns = computed<IKanbanColumn[]>(() => {
    return activeProject.value?.columns || [];
  });

  async function fetchProjects() {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.get('/projects');
      if (res.success && res.data) {
        projects.value = res.data.projects;
        if (!activeProjectId.value && projects.value.length > 0) {
          activeProjectId.value = projects.value[0]._id;
        }
        if (activeProjectId.value) {
          await fetchProjectTickets(activeProjectId.value);
        }
      }
    } catch (err: any) {
      const toast = useToast();
      toast.error('Failed to load projects', err.message);
    } finally {
      isLoading.value = false;
    }
  }

  async function selectProject(projectId: string) {
    activeProjectId.value = projectId;
    await fetchProjectTickets(projectId);
  }

  async function fetchProjectTickets(projectId: string) {
    try {
      const api = useApi();
      const res = await api.get(`/projects/${projectId}`);
      if (res.success && res.data) {
        activeProjectTickets.value = res.data.tickets || [];
        // Update project in list if columns changed
        const idx = projects.value.findIndex((p) => p._id === projectId);
        if (idx !== -1 && res.data.project) {
          projects.value[idx] = res.data.project;
        }
      }
    } catch (err: any) {
      const toast = useToast();
      toast.error('Failed to load project details', err.message);
    }
  }

  async function createProject(payload: { name: string; key: string; description?: string }): Promise<boolean> {
    const toast = useToast();
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.post('/projects', payload);
      if (res.success && res.data?.project) {
        projects.value.unshift(res.data.project);
        activeProjectId.value = res.data.project._id;
        activeProjectTickets.value = [];
        isCreateProjectModalOpen.value = false;
        toast.success('Project Created', `Project [${res.data.project.key}] created.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Project Creation Failed', err.message);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function addColumn(columnName: string): Promise<boolean> {
    if (!activeProject.value) return false;
    const toast = useToast();
    const id = columnName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (activeProject.value.columns.some((c) => c.id === id)) {
      toast.error('Column Exists', `A column with key "${id}" already exists.`);
      return false;
    }

    const newColumns: IKanbanColumn[] = [
      ...activeProject.value.columns,
      {
        id,
        name: columnName.trim(),
        order: activeProject.value.columns.length,
        color: 'text-indigo-400',
      },
    ];

    return updateColumns(newColumns);
  }

  async function removeColumn(columnId: string): Promise<boolean> {
    if (!activeProject.value) return false;
    const toast = useToast();

    if (activeProject.value.columns.length <= 1) {
      toast.error('Cannot Delete', 'A project must have at least one Kanban column.');
      return false;
    }

    const filtered = activeProject.value.columns
      .filter((c) => c.id !== columnId)
      .map((col, index) => ({ ...col, order: index }));

    return updateColumns(filtered);
  }

  async function updateColumns(newColumns: IKanbanColumn[]): Promise<boolean> {
    if (!activeProject.value) return false;
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.patch(`/projects/${activeProject.value._id}/columns`, {
        columns: newColumns,
      });

      if (res.success && res.data?.project) {
        const idx = projects.value.findIndex((p) => p._id === activeProject.value?._id);
        if (idx !== -1) {
          projects.value[idx] = res.data.project;
        }
        toast.success('Columns Updated', 'Kanban board columns updated.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Column Update Failed', err.message);
      return false;
    }
  }

  async function transitionTicketStatus(ticketId: string, targetStatus: string): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.patch(`/issues/${ticketId}/status`, {
        status: targetStatus,
      });

      if (res.success && res.data?.issue) {
        const idx = activeProjectTickets.value.findIndex((t) => t._id === ticketId);
        if (idx !== -1) {
          activeProjectTickets.value[idx] = res.data.issue;
        }
        toast.success('Ticket Moved', `Moved to ${targetStatus}`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to move ticket', err.message);
      return false;
    }
  }

  async function createTicket(payload: Partial<IIssueTicket>): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.post('/issues', {
        ...payload,
        projectId: activeProject.value?._id,
      });

      if (res.success && res.data?.issue) {
        activeProjectTickets.value.unshift(res.data.issue);
        toast.success('Ticket Added', `Card [${res.data.issue.ticketKey}] added to board.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to add ticket', err.message);
      return false;
    }
  }

  async function addCategory(categoryName: string): Promise<boolean> {
    if (!activeProject.value) return false;
    const toast = useToast();
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    try {
      const api = useApi();
      const res = await api.post(`/projects/${activeProject.value._id}/categories`, {
        category: trimmed,
      });

      if (res.success && res.data?.project) {
        const idx = projects.value.findIndex((p) => p._id === activeProject.value?._id);
        if (idx !== -1) {
          projects.value[idx] = res.data.project;
        }
        toast.success('Category Added', `Category "${trimmed}" added to project.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to add category', err.message);
      return false;
    }
  }

  async function updateTicket(ticketId: string, payload: Partial<IIssueTicket>): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.put(`/issues/${ticketId}`, payload);

      if (res.success && res.data?.issue) {
        const idx = activeProjectTickets.value.findIndex((t) => t._id === ticketId);
        if (idx !== -1) {
          activeProjectTickets.value[idx] = res.data.issue;
        }
        toast.success('Task Updated', `Changes saved for [${res.data.issue.ticketKey}].`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to update task', err.message);
      return false;
    }
  }

  async function addTicketNote(ticketId: string, noteText: string): Promise<boolean> {
    const toast = useToast();
    const trimmed = noteText.trim();
    if (!trimmed) return false;

    try {
      const api = useApi();
      const res = await api.post(`/issues/${ticketId}/notes`, { note: trimmed });

      if (res.success && res.data?.issue) {
        const idx = activeProjectTickets.value.findIndex((t) => t._id === ticketId);
        if (idx !== -1) {
          activeProjectTickets.value[idx] = res.data.issue;
        }
        toast.success('Note Logged', 'Log note recorded in task timeline.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to log note', err.message);
      return false;
    }
  }

  return {
    projects,
    activeProjectId,
    activeProject,
    activeProjectTickets,
    columns,
    isLoading,
    isCreateProjectModalOpen,
    fetchProjects,
    selectProject,
    fetchProjectTickets,
    createProject,
    addColumn,
    removeColumn,
    updateColumns,
    addCategory,
    updateTicket,
    addTicketNote,
    transitionTicketStatus,
    createTicket,
  };
});
