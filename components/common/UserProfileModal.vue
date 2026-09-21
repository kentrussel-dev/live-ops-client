<template>
  <Teleport to="body">
    <!-- Main Profile Modal Backdrop -->
    <div
      v-if="authStore.isProfileModalOpen && authStore.viewedProfile"
      @click.self="authStore.closeProfile()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div class="w-full max-w-lg bg-ops-surface border border-ops-border rounded-xl shadow-2xl overflow-hidden font-sans text-xs flex flex-col max-h-[90vh]">
        <!-- Top Cover Header -->
        <div class="relative bg-gradient-to-r from-ops-obsidian via-ops-subtle to-ops-obsidian p-6 border-b border-ops-border shrink-0">
          <button
            @click="authStore.closeProfile()"
            class="absolute top-3 right-3 p-1.5 rounded-lg bg-ops-obsidian/80 hover:bg-ops-surface border border-ops-border text-ops-text-dim hover:text-ops-text-bright transition font-mono"
            title="Close Profile (Esc)"
          >
            ✕
          </button>

          <div class="flex items-start gap-4">
            <!-- Clickable Display Picture for Closer Look / Zoom -->
            <div class="relative group cursor-pointer shrink-0" @click="authStore.isPhotoZoomOpen = true">
              <img
                v-if="authStore.viewedProfile.avatarUrl"
                :src="authStore.viewedProfile.avatarUrl"
                :alt="authStore.viewedProfile.username"
                class="w-20 h-20 rounded-xl object-cover border-2 border-ops-border shadow-lg group-hover:border-ops-blue transition"
              />
              <div
                v-else
                class="w-20 h-20 rounded-xl border-2 border-ops-border flex items-center justify-center text-xl font-mono font-bold text-white shadow-lg group-hover:border-ops-blue transition"
                :style="{ backgroundColor: authStore.viewedProfile.avatarColor || '#4F46E5' }"
              >
                {{ (authStore.viewedProfile.username || 'OP').slice(0, 2).toUpperCase() }}
              </div>

              <!-- Zoom Hover Overlay Icon -->
              <div class="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-mono">
                Zoom
              </div>

              <!-- Online Presence Dot -->
              <span
                :class="[
                  'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-ops-surface',
                  isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'
                ]"
                :title="isOnline ? 'Online in Studio' : 'Offline'"
              />
            </div>

            <!-- Profile Identity Header Info -->
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-ops-text-bright truncate font-sans">
                  {{ authStore.viewedProfile.username }}
                </h2>
                <span
                  :class="[
                    'px-2 py-0.5 rounded font-mono text-3xs font-bold uppercase tracking-wider',
                    authStore.viewedProfile.role === 'admin'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : authStore.viewedProfile.role === 'liveops_editor'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                      : 'bg-slate-900 text-slate-300 border border-slate-700'
                  ]"
                >
                  {{ authStore.viewedProfile.role?.replace('_', ' ') }}
                </span>
              </div>

              <!-- Department & Email -->
              <div class="text-2xs font-mono text-ops-text-dim flex items-center gap-2 flex-wrap pt-1">
                <span>{{ authStore.viewedProfile.department || 'Operations' }}</span>
                <span>•</span>
                <span class="text-ops-text-dark">{{ authStore.viewedProfile.email }}</span>
              </div>

              <!-- Live Status Message -->
              <div v-if="authStore.viewedProfile.statusMessage" class="pt-1">
                <span class="text-3xs px-2 py-0.5 rounded-full bg-ops-obsidian border border-ops-border text-ops-text-dim font-mono italic inline-flex items-center gap-1">
                  <span>{{ authStore.viewedProfile.statusMessage }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Bar (only if own profile) -->
        <div v-if="isOwnProfile" class="flex border-b border-ops-border px-4 gap-4 bg-ops-subtle shrink-0">
          <button
            @click="setTab('profile')"
            :class="['py-2 transition', activeTab === 'profile' ? 'text-ops-blue-glow border-b-2 border-ops-blue font-semibold' : 'text-ops-text-dim hover:text-ops-text-bright']"
          >
            Profile
          </button>
          <button
            @click="setTab('edit')"
            :class="['py-2 transition', activeTab === 'edit' ? 'text-ops-blue-glow border-b-2 border-ops-blue font-semibold' : 'text-ops-text-dim hover:text-ops-text-bright']"
          >
            Edit
          </button>
          <button
            @click="setTab('password')"
            :class="['py-2 transition', activeTab === 'password' ? 'text-ops-blue-glow border-b-2 border-ops-blue font-semibold' : 'text-ops-text-dim hover:text-ops-text-bright']"
          >
            Password
          </button>
        </div>

        <!-- Scrollable Profile Content Body -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-ops-surface">
          <!-- Profile View -->
          <div v-if="activeTab === 'profile'" class="space-y-3">
            <div class="p-3 bg-ops-obsidian rounded-lg border border-ops-border space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-ops-text-dim font-mono uppercase text-2xs">Department</span>
                <span class="text-ops-text-bright font-medium">{{ authStore.viewedProfile.department || 'Operations' }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-ops-text-dim font-mono uppercase text-2xs">Email</span>
                <span class="text-ops-text-bright font-mono">{{ authStore.viewedProfile.email }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-ops-text-dim font-mono uppercase text-2xs">Role</span>
                <span class="text-ops-text-bright font-mono uppercase text-2xs">{{ authStore.viewedProfile.role?.replace('_', ' ') }}</span>
              </div>
              <div v-if="authStore.viewedProfile.statusMessage" class="flex justify-between items-center text-xs pt-1 border-t border-ops-border/50">
                <span class="text-ops-text-dim font-mono uppercase text-2xs">Status</span>
                <span class="text-ops-text-bright italic">{{ authStore.viewedProfile.statusMessage }}</span>
              </div>
            </div>
          </div>

          <!-- Edit Profile Form -->
          <div v-else-if="activeTab === 'edit'" class="space-y-4">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Username</label>
              <input v-model="editForm.username" type="text" class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans" />
            </div>
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Email</label>
              <input v-model="editForm.email" type="email" class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans" />
            </div>
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Department</label>
              <input v-model="editForm.department" type="text" class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans" />
            </div>
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Status Message</label>
              <input v-model="editForm.statusMessage" type="text" class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans" />
            </div>
            <div v-if="authStore.user?.role !== 'admin'">
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Position</label>
              <select v-model="editForm.position" class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans">
                <option value="Developer">Developer</option>
                <option value="QA">QA</option>
                <option value="Artist">Artist</option>
              </select>
            </div>
            
            <div class="flex items-center gap-4 pt-2">
              <button @click="saveProfile" class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition" :disabled="isSavingProfile">
                Save
              </button>
              <span v-if="profileMsg" :class="profileMsgClass">{{ profileMsg }}</span>
            </div>
          </div>

          <!-- Password Change Form -->
          <div v-else-if="activeTab === 'password'" class="space-y-4">
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Old Password</label>
              <input v-model="pwdForm.oldPassword" type="password" class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans" />
            </div>
            <div>
              <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">New Password</label>
              <input v-model="pwdForm.newPassword" type="password" class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans" />
            </div>
            <div class="flex items-center gap-4 pt-2">
              <button @click="savePassword" class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition" :disabled="isSavingPassword">
                Save
              </button>
              <span v-if="pwdMsg" :class="pwdMsgClass">{{ pwdMsg }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions Toolbar -->
        <div class="p-3.5 border-t border-ops-border bg-ops-subtle flex items-center justify-between shrink-0">
          <button
            @click="authStore.closeProfile()"
            class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim hover:text-ops-text-bright rounded font-mono text-xs transition"
          >
            Close
          </button>

          <div class="flex items-center gap-2">
            <!-- Send Direct Message Button (if not self) -->
            <button
              v-if="authStore.viewedProfile._id !== authStore.user?._id && authStore.viewedProfile.username !== authStore.user?.username"
              @click="handleStartDM(authStore.viewedProfile._id)"
              class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow"
            >
              <span>Send Direct Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Closer Look / Photo Zoom Lightbox Modal -->
    <div
      v-if="authStore.isPhotoZoomOpen && authStore.viewedProfile"
      @click.self="authStore.isPhotoZoomOpen = false"
      class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div class="relative max-w-xl max-h-[85vh] flex flex-col items-center">
        <button
          @click="authStore.isPhotoZoomOpen = false"
          class="absolute -top-10 right-0 text-white font-mono text-sm hover:text-rose-400 p-1"
        >
          ✕ Close Full View
        </button>

        <img
          v-if="authStore.viewedProfile.avatarUrl"
          :src="authStore.viewedProfile.avatarUrl"
          :alt="authStore.viewedProfile.username"
          class="max-w-full max-h-[75vh] rounded-2xl object-cover border-4 border-ops-border shadow-2xl"
        />

        <div class="mt-3 text-center">
          <div class="text-sm font-bold text-white">{{ authStore.viewedProfile.username }}</div>
          <div class="text-xs font-mono text-ops-blue-glow">{{ authStore.viewedProfile.department }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useChatStore } from '~/stores/chat';

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const isOnline = computed(() => {
  if (!authStore.viewedProfile) return false;
  return chatStore.isUserOnline(authStore.viewedProfile._id);
});

const isOwnProfile = computed(() => {
  return authStore.viewedProfile && authStore.user && authStore.viewedProfile._id === authStore.user._id;
});

const activeTab = ref<'profile'|'edit'|'password'>('profile');

const editForm = ref({
  username: '',
  email: '',
  department: '',
  statusMessage: '',
  position: 'Developer',
});

const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
});

const isSavingProfile = ref(false);
const profileMsg = ref('');
const profileMsgClass = ref('');

const isSavingPassword = ref(false);
const pwdMsg = ref('');
const pwdMsgClass = ref('');

watch(() => authStore.isProfileModalOpen, (isOpen) => {
  if (isOpen) {
    activeTab.value = 'profile';
    profileMsg.value = '';
    pwdMsg.value = '';
    if (authStore.viewedProfile) {
      editForm.value = {
        username: authStore.viewedProfile.username || '',
        email: authStore.viewedProfile.email || '',
        department: authStore.viewedProfile.department || '',
        statusMessage: authStore.viewedProfile.statusMessage || '',
        position: authStore.viewedProfile.position || 'Developer',
      };
    }
  }
});

function setTab(tab: 'profile'|'edit'|'password') {
  activeTab.value = tab;
  profileMsg.value = '';
  pwdMsg.value = '';
}

async function saveProfile() {
  isSavingProfile.value = true;
  profileMsg.value = '';
  const res = await (authStore as any).updateProfile(editForm.value);
  isSavingProfile.value = false;
  if (res.ok) {
    profileMsg.value = 'Profile updated successfully.';
    profileMsgClass.value = 'text-emerald-400 text-xs';
  } else {
    profileMsg.value = res.error || 'Failed to update profile.';
    profileMsgClass.value = 'text-rose-400 text-xs';
  }
}

async function savePassword() {
  isSavingPassword.value = true;
  pwdMsg.value = '';
  const res = await (authStore as any).changePassword(pwdForm.value);
  isSavingPassword.value = false;
  if (res.ok) {
    pwdMsg.value = 'Password changed successfully.';
    pwdMsgClass.value = 'text-emerald-400 text-xs';
    pwdForm.value.oldPassword = '';
    pwdForm.value.newPassword = '';
  } else {
    pwdMsg.value = res.error || 'Failed to change password.';
    pwdMsgClass.value = 'text-rose-400 text-xs';
  }
}

function handleStartDM(userId: string) {
  authStore.closeProfile();
  router.push(`/discuss?dm=${userId}`);
}

function navigateToTicket(ticketId: string) {
  authStore.closeProfile();
  router.push(`/issues/${ticketId}`);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (authStore.isPhotoZoomOpen) {
      authStore.isPhotoZoomOpen = false;
    } else if (authStore.isProfileModalOpen) {
      authStore.closeProfile();
    }
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeydown);
  }
});
</script>
