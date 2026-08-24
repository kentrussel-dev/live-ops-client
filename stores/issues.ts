import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IIssueTicket, IssueStatus, IssueSeverity, IssueCategory } from '../../shared/types';
import { useToast } from '~/composables/useToast';

export const useIssuesStore = defineStore('issues', () => {
  const issues = ref<IIssueTicket[]>([]);
  const stats = ref<{
    reported: number;
    investigating: number;
    fixed: number;
    verified: number;
    closed: number;
    criticalBlockers: number;
  }>({
    reported: 0,
    investigating: 0,
    fixed: 0,
    verified: 0,
    closed: 0,
    criticalBlockers: 0,
  });

  const isLoading = ref(false);
  const selectedIssue = ref<IIssueTicket | null>(null);
  const isDrawerOpen = ref(false);
  const isCreateModalOpen = ref(false);

  const filterSeverity = ref<IssueSeverity | 'all'>('all');
  const filterCategory = ref<IssueCategory | 'all'>('all');
  const searchQuery = ref('');

  async function fetchIssues() {
    isLoading.value = true;
    try {
      const api = useApi();
      const query: Record<string, any> = {};
      if (filterSeverity.value !== 'all') query.severity = filterSeverity.value;
      if (filterCategory.value !== 'all') query.category = filterCategory.value;
      if (searchQuery.value) query.search = searchQuery.value;

      const res = await api.get('/issues', query);
      if (res.success && res.data) {
        issues.value = res.data.issues;
        stats.value = res.data.stats;
      }
    } catch (err: any) {
      const toast = useToast();
      toast.error('Failed to load issue tickets', err.message);
    } finally {
      isLoading.value = false;
    }
  }

  const columns = computed(() => {
    return {
      reported: issues.value.filter((i) => i.status === 'reported'),
      investigating: issues.value.filter((i) => i.status === 'investigating'),
      fixed: issues.value.filter((i) => i.status === 'fixed'),
      verified: issues.value.filter((i) => i.status === 'verified'),
      closed: issues.value.filter((i) => i.status === 'closed'),
    };
  });

  async function transitionStatus(issueId: string, targetStatus: IssueStatus, note?: string, resolutionNotes?: string): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.patch(`/issues/${issueId}/status`, {
        status: targetStatus,
        note,
        resolutionNotes,
      });

      if (res.success && res.data) {
        const index = issues.value.findIndex((i) => i._id === issueId);
        if (index !== -1) {
          issues.value[index] = res.data.issue;
        }
        if (selectedIssue.value?._id === issueId) {
          selectedIssue.value = res.data.issue;
        }
        toast.success('Pipeline Stage Updated', res.data.message);
        await fetchIssues(); // Refresh stats
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Status Transition Failed', err.message);
      return false;
    }
  }

  async function addNote(issueId: string, noteText: string): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.post(`/issues/${issueId}/notes`, { note: noteText });
      if (res.success && res.data) {
        const issue = issues.value.find((i) => i._id === issueId);
        if (issue) issue.internalNotes = res.data.notes;
        if (selectedIssue.value?._id === issueId) {
          selectedIssue.value.internalNotes = res.data.notes;
        }
        toast.success('Internal Note Added', 'Telemetry log updated.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to add note', err.message);
      return false;
    }
  }

  async function createIssue(payload: Partial<IIssueTicket>): Promise<boolean> {
    const toast = useToast();
    try {
      const api = useApi();
      const res = await api.post('/issues', payload);
      if (res.success && res.data) {
        issues.value.unshift(res.data.issue);
        toast.success('Issue Filed', `Ticket [${res.data.issue.ticketKey}] created.`);
        isCreateModalOpen.value = false;
        await fetchIssues();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Failed to report issue', err.message);
      return false;
    }
  }

  function openDetail(issue: IIssueTicket) {
    selectedIssue.value = issue;
    isDrawerOpen.value = true;
  }

  function closeDetail() {
    isDrawerOpen.value = false;
    selectedIssue.value = null;
  }

  return {
    issues,
    stats,
    isLoading,
    selectedIssue,
    isDrawerOpen,
    isCreateModalOpen,
    filterSeverity,
    filterCategory,
    searchQuery,
    columns,
    fetchIssues,
    transitionStatus,
    addNote,
    createIssue,
    openDetail,
    closeDetail,
  };
});
