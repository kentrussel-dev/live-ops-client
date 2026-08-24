<template>
  <div class="space-y-4">
    <!-- Header Command Area -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ops-border">
      <div>
        <div class="text-2xs font-mono uppercase text-purple-400">Subsystem 07 / Administrative Governance</div>
        <h1 class="text-lg font-bold text-ops-text-bright font-sans">Operator Account Directory</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="showCreateModal = true"
          class="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
        >
          <span>+</span>
          <span>Provision New Operator</span>
        </button>
      </div>
    </div>

    <!-- Operators Data Table -->
    <div class="bg-ops-surface rounded border border-ops-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-sans">
          <thead class="bg-ops-subtle border-b border-ops-border font-mono text-2xs text-ops-text-dim uppercase tracking-wider">
            <tr>
              <th class="p-3">Operator</th>
              <th class="p-3">Email Address</th>
              <th class="p-3">Department</th>
              <th class="p-3">Access Level</th>
              <th class="p-3">Last Login (UTC)</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ops-border/60">
            <tr
              v-for="op in authStore.operators"
              :key="op._id"
              class="hover:bg-ops-surface-hover transition"
            >
              <!-- Operator Name -->
              <td class="p-3 whitespace-nowrap">
                <div class="font-bold text-ops-text-bright font-mono text-xs">{{ op.username }}</div>
                <div v-if="op._id === authStore.user?._id" class="text-2xs text-emerald-400 font-mono">Current Session</div>
              </td>

              <!-- Email -->
              <td class="p-3 whitespace-nowrap text-ops-text-base font-mono text-xs">
                {{ op.email }}
              </td>

              <!-- Department -->
              <td class="p-3 whitespace-nowrap text-ops-text-bright text-xs">
                {{ op.department }}
              </td>

              <!-- Role -->
              <td class="p-3 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-2xs font-mono font-bold uppercase',
                    op.role === 'admin'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : op.role === 'liveops_editor'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  ]"
                >
                  {{ op.role === 'admin' ? 'Root Admin' : op.role === 'liveops_editor' ? 'Live-Ops Editor' : 'QA Auditor' }}
                </span>
              </td>

              <!-- Last Login -->
              <td class="p-3 whitespace-nowrap font-mono text-2xs text-ops-text-dim">
                {{ op.lastLoginAt ? formatUtc(op.lastLoginAt) : 'Never' }}
              </td>

              <!-- Actions -->
              <td class="p-3 whitespace-nowrap text-right">
                <button
                  v-if="op._id !== authStore.user?._id"
                  @click="handleDelete(op._id, op.username)"
                  class="px-2.5 py-1 text-2xs font-mono text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 border border-rose-900/60 rounded transition"
                >
                  Revoke
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Provision Operator Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-md bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs">
        <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
          <h3 class="font-mono font-bold text-sm text-ops-text-bright">Provision Operator Account</h3>
          <button @click="showCreateModal = false" class="text-ops-text-dim hover:text-ops-text-bright font-mono">✕</button>
        </div>

        <form @submit.prevent="handleCreateOperator" class="p-5 space-y-3.5">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Username</label>
            <input
              v-model="formUsername"
              type="text"
              required
              minlength="3"
              placeholder="e.g. jsmith_editor"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright font-mono focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Corporate Email</label>
            <input
              v-model="formEmail"
              type="email"
              required
              placeholder="jsmith@aetheria.gg"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright focus:border-purple-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Temporary Passcode (min 8 chars)</label>
            <input
              v-model="formPassword"
              type="password"
              required
              minlength="8"
              placeholder="••••••••••••"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright font-mono focus:border-purple-500 outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Department</label>
              <select
                v-model="formDepartment"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono focus:border-purple-500 outline-none"
              >
                <option value="Live Operations">Live Operations</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Game Economy">Game Economy</option>
                <option value="Studio Leadership">Studio Leadership</option>
              </select>
            </div>

            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Access Role</label>
              <select
                v-model="formRole"
                class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright font-mono focus:border-purple-500 outline-none"
              >
                <option value="liveops_editor">Editor (Write & Toggle)</option>
                <option value="readonly_viewer">QA Auditor (Read-Only)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-ops-border">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim rounded font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5"
            >
              <span v-if="authStore.isLoading">Provisioning...</span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useTimeFormat } from '~/composables/useTimeFormat';
import { useToast } from '~/composables/useToast';
import type { UserRole } from '../../../shared/types';

const authStore = useAuthStore();
const { formatUtc } = useTimeFormat();
const toast = useToast();

const showCreateModal = ref(false);

const formUsername = ref('');
const formEmail = ref('');
const formPassword = ref('');
const formDepartment = ref('Live Operations');
const formRole = ref<UserRole>('liveops_editor');

onMounted(async () => {
  if (!authStore.isAdmin) {
    navigateTo('/');
    return;
  }
  await authStore.fetchOperators();
});

async function handleCreateOperator() {
  const res = await authStore.createOperator({
    username: formUsername.value,
    email: formEmail.value,
    password: formPassword.value,
    department: formDepartment.value,
    role: formRole.value,
  });

  if (res.ok) {
    toast.success('Operator Provisioned', `Account created for ${formUsername.value}`);
    showCreateModal.value = false;
    formUsername.value = '';
    formEmail.value = '';
    formPassword.value = '';
  } else {
    toast.error('Failed to Create Operator', res.error || 'An error occurred.');
  }
}

async function handleDelete(id: string, username: string) {
  if (!confirm(`Are you sure you want to revoke access for operator "${username}"?`)) return;

  const res = await authStore.deleteOperator(id);
  if (res.ok) {
    toast.info('Access Revoked', `Operator ${username} removed.`);
  } else {
    toast.error('Failed to Revoke', res.error || 'Action failed.');
  }
}
</script>
