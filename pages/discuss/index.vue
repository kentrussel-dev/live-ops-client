<template>
  <div class="h-[calc(100vh-4.5rem)] flex bg-ops-surface border border-ops-border rounded-lg overflow-hidden font-sans">
    <!-- 1. Discuss Left Navigation Rail -->
    <div class="w-64 sm:w-72 bg-ops-obsidian border-r border-ops-border flex flex-col justify-between shrink-0 select-none">
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Top Discuss Quick Actions -->
        <div class="p-3 border-b border-ops-border space-y-2 bg-ops-subtle">
          <NuxtLink
            to="/inbox"
            class="w-full flex items-center justify-between px-3 py-2 rounded bg-ops-surface hover:bg-ops-surface-hover border border-ops-border text-xs font-mono text-ops-text-bright transition"
          >
            <div class="flex items-center gap-2">
              <span class="font-bold">Inbox</span>
            </div>
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="px-1.5 py-0.2 rounded-full text-2xs font-bold bg-ops-blue text-white"
            >
              {{ notificationsStore.unreadCount }}
            </span>
          </NuxtLink>

          <!-- Quick Search -->
          <div class="relative">
            <input
              v-model="chatStore.searchQuery"
              type="text"
              placeholder="Quick search..."
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 text-xs text-ops-text-bright placeholder:text-ops-text-dark outline-none focus:border-ops-blue"
            />
            <button
              v-if="chatStore.searchQuery"
              @click="chatStore.searchQuery = ''"
              class="absolute right-2 top-1 text-xs text-ops-text-dim hover:text-ops-text-bright"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Scrollable Channel & DM Lists -->
        <div class="flex-1 overflow-y-auto p-2 space-y-4">
          <!-- Section 1: Channels -->
          <div class="space-y-1">
            <div class="flex items-center justify-between px-2 py-1 text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">
              <div class="flex items-center gap-1">
                <span>▼</span>
                <span>Channels</span>
              </div>
              <button
                @click="showCreateChannelModal = true"
                class="hover:text-ops-text-bright text-xs px-1"
                title="Create Channel"
              >
                +
              </button>
            </div>

            <div class="space-y-0.5">
              <div
                v-for="ch in chatStore.filteredChannels"
                :key="ch._id"
                @click="handleSelectChannel(ch)"
                :class="[
                  'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition cursor-pointer group',
                  chatStore.activeChannel?._id === ch._id
                    ? 'bg-ops-surface text-ops-text-bright font-semibold border-l-2 border-ops-blue'
                    : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright'
                ]"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <!-- Channel Image / Icon Placeholder Badge -->
                  <div class="w-5 h-5 rounded bg-ops-surface border border-ops-border flex items-center justify-center text-3xs font-mono font-bold text-ops-blue-glow shrink-0 overflow-hidden">
                    <span>{{ getChannelInitials(ch.name) }}</span>
                  </div>
                  <span class="truncate">{{ ch.name }}</span>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <span
                    v-if="ch.unreadCount"
                    class="px-1.5 py-0.2 rounded-full text-2xs font-bold bg-ops-blue text-white"
                  >
                    {{ ch.unreadCount }}
                  </span>

                  <!-- Hover Close / Remove X Button -->
                  <button
                    @click.stop="handleRemoveChannel(ch._id)"
                    class="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded text-xs font-mono transition leading-none"
                    title="Leave or close channel"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Direct Messages (Only Active DMs, Sorted with latest on top) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between px-2 py-1 text-2xs font-mono font-bold uppercase tracking-wider text-ops-text-dim">
              <div class="flex items-center gap-1">
                <span>▼</span>
                <span>Direct Messages</span>
              </div>
              <button
                @click="showStartDmModal = true"
                class="hover:text-ops-text-bright text-xs px-1"
                title="Start Direct Message"
              >
                +
              </button>
            </div>

            <!-- Empty DMs State -->
            <div
              v-if="displayedDirectMessages.length === 0"
              class="px-3 py-2 text-3xs font-mono text-ops-text-dim italic"
            >
              No active DMs. Click + to start a chat.
            </div>

            <!-- Active DMs List -->
            <div v-else class="space-y-0.5">
              <div
                v-for="dm in displayedDirectMessages"
                :key="dm._id"
                @click="handleSelectChannel(dm)"
                :class="[
                  'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition cursor-pointer group',
                  chatStore.activeChannel?._id === dm._id
                    ? 'bg-ops-surface text-ops-text-bright font-semibold border-l-2 border-ops-blue'
                    : 'text-ops-text-dim hover:bg-ops-surface-hover hover:text-ops-text-bright'
                ]"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <div class="relative shrink-0">
                    <img
                      v-if="getDmUser(dm)?.avatarUrl"
                      :src="getDmUser(dm)?.avatarUrl"
                      :alt="getDmDisplayName(dm)"
                      class="w-5 h-5 rounded-full object-cover border border-ops-border"
                    />
                    <div
                      v-else
                      class="w-5 h-5 rounded-full bg-ops-surface border border-ops-border text-3xs font-mono flex items-center justify-center text-ops-text-bright font-bold"
                    >
                      {{ getChannelInitials(getDmDisplayName(dm)) }}
                    </div>
                    <!-- Online Presence Dot Indicator -->
                    <span
                      :class="[
                        'absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-ops-obsidian',
                        chatStore.isUserOnline(getDmUser(dm)?._id) ? 'bg-emerald-500' : 'bg-slate-500'
                      ]"
                    />
                  </div>
                  <span class="truncate">{{ getDmDisplayName(dm) }}</span>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <span
                    v-if="dm.unreadCount"
                    class="px-1.5 py-0.2 rounded-full text-2xs font-bold bg-ops-blue text-white"
                  >
                    {{ dm.unreadCount }}
                  </span>

                  <!-- Hover Close / Remove X Button -->
                  <button
                    @click.stop="handleRemoveDirectMessage(dm._id)"
                    class="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded text-xs font-mono transition leading-none"
                    title="Close direct message"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current User Mini Status Footer -->
      <div class="p-3 border-t border-ops-border bg-ops-subtle flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-6 h-6 rounded-full bg-ops-blue text-white text-2xs font-mono font-bold flex items-center justify-center">
            {{ (authStore.user?.username || 'OP').slice(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-ops-text-bright truncate">{{ authStore.user?.username }}</div>
            <div class="text-2xs font-mono text-ops-text-dim truncate">{{ authStore.user?.department || 'Operations' }}</div>
          </div>
        </div>
        <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
      </div>
    </div>

    <!-- 2. Main Chat Conversation Panel -->
    <div class="flex-1 flex flex-col min-w-0 bg-ops-canvas">
      <!-- Active Channel / DM Header -->
      <div class="h-14 px-4 border-b border-ops-border bg-ops-surface flex items-center justify-between shrink-0">
        <div class="min-w-0 flex items-center gap-3">
          <!-- Channel / DM Image Placeholder Badge in Header -->
          <div
            v-if="!chatStore.activeChannel?.isDirectMessage"
            class="w-9 h-9 rounded-lg bg-ops-obsidian border border-ops-border flex items-center justify-center text-xs font-mono font-bold text-ops-blue-glow shadow-xs shrink-0"
          >
            {{ getChannelInitials(chatStore.activeChannel?.name || 'CH') }}
          </div>
          <div
            v-else
            class="relative shrink-0"
          >
            <img
              v-if="getDmUser(chatStore.activeChannel)?.avatarUrl"
              :src="getDmUser(chatStore.activeChannel)?.avatarUrl"
              :alt="getDmDisplayName(chatStore.activeChannel)"
              class="w-9 h-9 rounded-full object-cover border border-ops-border shadow-xs"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-ops-obsidian border border-ops-border text-xs font-mono font-bold flex items-center justify-center text-ops-text-bright"
            >
              {{ getChannelInitials(getDmDisplayName(chatStore.activeChannel)) }}
            </div>
            <span
              :class="[
                'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ops-surface',
                chatStore.isUserOnline(getDmUser(chatStore.activeChannel)?._id) ? 'bg-emerald-500' : 'bg-slate-500'
              ]"
            />
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-ops-blue-glow font-bold text-sm">
                {{ chatStore.activeChannel?.isDirectMessage ? '@' : '#' }}
              </span>
              <h2 class="text-sm font-bold text-ops-text-bright font-sans truncate">
                {{ chatStore.activeChannel?.isDirectMessage ? getDmDisplayName(chatStore.activeChannel) : chatStore.activeChannel?.name }}
              </h2>
            </div>
            <p class="text-2xs text-ops-text-dim truncate mt-0.5">
              {{ chatStore.activeChannel?.description || 'Internal Live-Ops operational communications stream' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono text-ops-text-dim">
          <span class="px-2 py-0.5 bg-ops-obsidian rounded border border-ops-border text-2xs">
            {{ chatStore.activeChannel?.isDirectMessage ? 'Direct Message' : 'Public Channel' }}
          </span>
        </div>
      </div>

      <!-- Messages Stream Container -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="chatStore.messages.length === 0" class="h-full flex flex-col items-center justify-center text-center p-8 text-ops-text-dim space-y-2">
          <div class="text-2xl font-mono text-ops-blue-glow">#</div>
          <div class="text-sm font-bold text-ops-text-bright">
            Welcome to {{ chatStore.activeChannel?.isDirectMessage ? getDmDisplayName(chatStore.activeChannel) : chatStore.activeChannel?.name }}
          </div>
          <p class="text-xs max-w-sm">This is the beginning of your conversation history.</p>
        </div>

        <!-- Grouped Message Stream Matching Mockup Design -->
        <div
          v-for="group in groupedMessages"
          :key="group.key"
          class="flex items-start gap-3 group"
        >
          <!-- Sender Avatar with Presence Indicator -->
          <div class="relative shrink-0 pt-0.5">
            <img
              v-if="group.sender.avatarUrl"
              :src="group.sender.avatarUrl"
              :alt="group.sender.username"
              class="w-8 h-8 rounded-full object-cover border border-ops-border shadow-xs"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-ops-surface border border-ops-border text-xs font-mono font-bold flex items-center justify-center text-ops-text-bright shadow-xs"
            >
              {{ (group.sender.username || 'OP').slice(0, 2).toUpperCase() }}
            </div>
            <!-- Online status dot -->
            <span
              :class="[
                'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ops-canvas',
                chatStore.isUserOnline(group.sender._id) ? 'bg-emerald-500' : 'bg-slate-500'
              ]"
            />
          </div>

          <!-- Message Bubbles Container -->
          <div class="flex-1 min-w-0 space-y-1.5">
            <!-- Header: Sender Name + Timestamp + Delivery / Seen Status -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-xs text-ops-text-bright">{{ group.sender.username }}</span>
              <span class="text-2xs font-mono text-ops-text-dim">- {{ formatRelativeTime(group.createdAt) }}</span>

              <!-- Delivery (1 Check) & Seen (2 Checks) Receipts -->
              <span
                v-if="group.isSelf"
                class="flex items-center text-xs font-mono font-bold tracking-tighter"
                :title="group.isSeen ? 'Seen by team member' : 'Delivered'"
              >
                <span v-if="group.isSeen" class="text-purple-400 dark:text-purple-300 font-extrabold text-xs">✓✓</span>
                <span v-else class="text-ops-text-dim text-xs">✓</span>
              </span>
            </div>

            <!-- List of Message Bubbles in this Group -->
            <div class="space-y-1.5">
              <div
                v-for="msg in group.messages"
                :key="msg._id"
                class="flex flex-col items-start gap-1"
              >
                <!-- Styled Bubble Container -->
                <div
                  :class="[
                    'px-3.5 py-2 rounded-lg text-xs font-sans max-w-xl break-words leading-relaxed border transition shadow-xs',
                    group.isSelf
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-medium'
                      : 'bg-sky-500/10 dark:bg-sky-950/40 border-sky-500/30 text-sky-950 dark:text-sky-100 font-medium'
                  ]"
                >
                  {{ msg.content }}
                </div>

                <!-- Attachments -->
                <div v-if="msg.attachments && msg.attachments.length > 0" class="flex flex-wrap gap-2 pt-0.5">
                  <div
                    v-for="(att, aIdx) in msg.attachments"
                    :key="aIdx"
                    class="p-2 rounded bg-ops-obsidian border border-ops-border text-2xs font-mono flex items-center gap-2 max-w-xs truncate"
                  >
                    <span>📎</span>
                    <span class="truncate">{{ att.name }}</span>
                  </div>
                </div>

                <!-- Reaction Badges -->
                <div v-if="msg.reactions && msg.reactions.length > 0" class="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <button
                    v-for="(react, rIdx) in msg.reactions"
                    :key="rIdx"
                    @click="chatStore.toggleReaction(msg._id, react.reaction)"
                    class="px-2 py-0.5 rounded text-2xs font-mono bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-bright flex items-center gap-1 transition"
                  >
                    <span>{{ react.reaction }}</span>
                    <span>{{ react.users.length }}</span>
                  </button>

                  <button
                    @click="chatStore.toggleReaction(msg._id, '👍')"
                    class="opacity-0 group-hover:opacity-100 text-2xs px-1.5 py-0.5 rounded bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim transition"
                    title="React 👍"
                  >
                    👍
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div class="px-4 py-1 text-2xs font-mono text-ops-text-dim min-h-[20px]">
        <span v-if="currentTypingUsers.length > 0">
          {{ currentTypingUsers.join(', ') }} {{ currentTypingUsers.length > 1 ? 'are' : 'is' }} typing...
        </span>
      </div>

      <!-- Bottom Message Composer -->
      <div class="p-3 border-t border-ops-border bg-ops-surface">
        <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
          <div class="flex-1 relative">
            <textarea
              v-model="messageInput"
              @keydown.enter.exact.prevent="handleSendMessage"
              @input="handleInputTyping"
              :placeholder="`Message #${chatStore.activeChannel?.name || 'channel'}...`"
              rows="1"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 text-xs text-ops-text-bright placeholder:text-ops-text-dark outline-none focus:border-ops-blue resize-none font-sans"
            />
          </div>

          <button
            type="submit"
            :disabled="chatStore.isSending || !messageInput.trim()"
            class="px-4 py-2 bg-ops-blue hover:bg-ops-blue-glow disabled:opacity-50 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow shrink-0"
          >
            <span>SEND</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Modal 1: Create Channel Modal -->
    <div
      v-if="showCreateChannelModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-sm bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs">
        <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
          <h3 class="font-mono font-bold text-sm text-ops-text-bright">Create Communication Channel</h3>
          <button @click="showCreateChannelModal = false" class="text-ops-text-dim hover:text-ops-text-bright font-mono">✕</button>
        </div>

        <form @submit.prevent="handleCreateChannelSubmit" class="p-5 space-y-3.5">
          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Channel Name</label>
            <input
              v-model="newChannelName"
              type="text"
              required
              placeholder="e.g. Walk Online Team - Dev"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans"
            />
          </div>

          <div>
            <label class="block text-2xs font-mono uppercase text-ops-text-dim mb-1">Description / Purpose</label>
            <input
              v-model="newChannelDescription"
              type="text"
              placeholder="Channel topic or sprint goals"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-2 text-xs text-ops-text-bright outline-none focus:border-ops-blue font-sans"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-ops-border">
            <button
              type="button"
              @click="showCreateChannelModal = false"
              class="px-3 py-1.5 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim rounded font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-1.5 bg-ops-blue hover:bg-ops-blue-glow text-white font-mono font-bold text-xs rounded transition"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Start Direct Message Modal -->
    <div
      v-if="showStartDmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-sm bg-ops-surface border border-ops-border rounded-lg shadow-2xl overflow-hidden font-sans text-xs">
        <div class="p-4 border-b border-ops-border bg-ops-subtle flex items-center justify-between">
          <h3 class="font-mono font-bold text-sm text-ops-text-bright">Start Direct Message</h3>
          <button @click="showStartDmModal = false" class="text-ops-text-dim hover:text-ops-text-bright font-mono">✕</button>
        </div>

        <div class="p-4 space-y-2 max-h-80 overflow-y-auto">
          <div
            v-for="op in chatStore.operators.filter((u) => u._id !== authStore.user?._id && u.username !== authStore.user?.username)"
            :key="op._id"
            @click="handleSelectOperatorDM(op._id)"
            class="p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover rounded border border-ops-border flex items-center justify-between cursor-pointer transition"
          >
            <div class="flex items-center gap-2.5">
              <div class="relative shrink-0">
                <img
                  v-if="op.avatarUrl"
                  :src="op.avatarUrl"
                  :alt="op.username"
                  class="w-7 h-7 rounded-full object-cover border border-ops-border"
                />
                <div
                  v-else
                  class="w-7 h-7 rounded-full bg-ops-surface border border-ops-border flex items-center justify-center text-xs font-mono font-bold text-ops-text-bright"
                >
                  {{ op.username.slice(0, 2).toUpperCase() }}
                </div>
                <span
                  :class="[
                    'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-ops-obsidian',
                    chatStore.isUserOnline(op._id) ? 'bg-emerald-500' : 'bg-slate-500'
                  ]"
                />
              </div>
              <div>
                <div class="font-bold text-ops-text-bright">{{ op.username }}</div>
                <div class="text-2xs text-ops-text-dim">{{ op.department }}</div>
              </div>
            </div>
            <span class="text-2xs font-mono text-ops-blue-glow">Message →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useChatStore } from '~/stores/chat';
import { useNotificationsStore } from '~/stores/notifications';
import { formatDistanceToNow } from 'date-fns';

const route = useRoute();
const authStore = useAuthStore();
const chatStore = useChatStore();
const notificationsStore = useNotificationsStore();

const messageInput = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const showCreateChannelModal = ref(false);
const showStartDmModal = ref(false);
const newChannelName = ref('');
const newChannelDescription = ref('');
let typingTimeout: any = null;

function isSelfDm(dm: any): boolean {
  if (!dm || !dm.isDirectMessage) return false;
  if (dm.members && dm.members.length > 0) {
    const ids = dm.members.map((m: any) => (typeof m === 'object' ? (m._id || m) : m)?.toString());
    const uniqueIds = new Set(ids);
    if (uniqueIds.size <= 1) return true;
  }
  const cleanName = (dm.name || '').replace(/^DM:\s*/i, '');
  if (cleanName.includes('&')) {
    const parts = cleanName.split('&').map((s: string) => s.trim());
    if (parts.length >= 2 && parts[0] === parts[1]) return true;
  }
  return false;
}

function getDmDisplayName(dm: any): string {
  if (!dm) return '';
  if (isSelfDm(dm)) return '';

  if (dm.dmTargetUser?.username && dm.dmTargetUser.username !== authStore.user?.username) {
    return dm.dmTargetUser.username;
  }
  const cleanName = (dm.name || '').replace(/^DM:\s*/i, '');
  if (cleanName.includes('&')) {
    const parts = cleanName.split('&').map((s: string) => s.trim());
    const otherPart = parts.find((p: string) => p !== authStore.user?.username);
    if (otherPart) return otherPart;
  }
  if (cleanName === authStore.user?.username) return '';
  return cleanName;
}

const displayedDirectMessages = computed(() => {
  return chatStore.filteredDirectMessages.filter((dm) => {
    if (isSelfDm(dm)) return false;
    const displayName = getDmDisplayName(dm);
    return displayName && displayName !== authStore.user?.username && !displayName.includes('&');
  });
});

const groupedMessages = computed(() => {
  const groups: Array<{
    key: string;
    sender: any;
    isSelf: boolean;
    isSeen: boolean;
    createdAt: string;
    messages: any[];
  }> = [];

  chatStore.messages.forEach((msg) => {
    const isSelf = msg.sender.username === authStore.user?.username || msg.sender._id === authStore.user?._id;
    const isSeen = msg.status === 'seen' || (msg.seenBy && msg.seenBy.length > 0);
    const prevGroup = groups[groups.length - 1];

    if (
      prevGroup &&
      prevGroup.sender.username === msg.sender.username &&
      Math.abs(new Date(msg.createdAt).getTime() - new Date(prevGroup.createdAt).getTime()) < 5 * 60 * 1000
    ) {
      prevGroup.messages.push(msg);
      if (isSeen) prevGroup.isSeen = true;
    } else {
      groups.push({
        key: msg._id,
        sender: msg.sender,
        isSelf,
        isSeen,
        createdAt: msg.createdAt,
        messages: [msg],
      });
    }
  });

  return groups;
});

function getDmUser(dm: any) {
  if (!dm) return null;
  if (dm.dmTargetUser && dm.dmTargetUser.username !== authStore.user?.username) {
    return dm.dmTargetUser;
  }
  if (dm.members && dm.members.length > 0) {
    const currentId = authStore.user?._id?.toString();
    const otherMember = dm.members.find((m: any) => {
      const id = (typeof m === 'object' ? (m._id || m) : m)?.toString();
      return id && id !== currentId;
    });
    if (otherMember) {
      const idStr = (typeof otherMember === 'object' ? (otherMember._id || otherMember) : otherMember)?.toString();
      const op = chatStore.operators.find((u) => u._id?.toString() === idStr);
      if (op) return op;
    }
  }
  const name = getDmDisplayName(dm);
  const opByName = chatStore.operators.find((u) => u.username === name);
  if (opByName) return opByName;

  return { username: name, _id: '' };
}

function getChannelInitials(name: string): string {
  if (!name) return 'CH';
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

async function handleRouteParams() {
  const channelIdOrSlug = route.query.channel as string;
  const dmUserId = route.query.dm as string;

  if (dmUserId) {
    await chatStore.startDirectMessage(dmUserId);
    scrollToBottom();
  } else if (channelIdOrSlug) {
    const ch = chatStore.channels.find(
      (c) => c._id === channelIdOrSlug || c.slug === channelIdOrSlug
    );
    if (ch) {
      await chatStore.selectChannel(ch);
      scrollToBottom();
    }
  }
}

onMounted(async () => {
  chatStore.initSocket();
  await Promise.all([
    chatStore.fetchChannels(),
    chatStore.fetchOperators(),
    notificationsStore.fetchUnreadCount(),
  ]);
  await handleRouteParams();
  scrollToBottom();
});

watch(
  () => route.query,
  async () => {
    await handleRouteParams();
  }
);

onUnmounted(() => {
  chatStore.disconnectSocket();
});

const currentTypingUsers = computed(() => {
  if (!chatStore.activeChannel) return [];
  return chatStore.typingUsers
    .filter((t) => t.channelId === chatStore.activeChannel?._id && t.username !== authStore.user?.username)
    .map((t) => t.username);
});

function formatRelativeTime(ts: string) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch (_) {
    return ts;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function handleInputTyping() {
  chatStore.emitTyping(true);
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    chatStore.emitTyping(false);
  }, 2000);
}

async function handleSendMessage() {
  if (!messageInput.value.trim()) return;
  const content = messageInput.value;
  messageInput.value = '';
  chatStore.emitTyping(false);

  await chatStore.sendMessage(content);
  scrollToBottom();
}

async function handleSelectChannel(ch: any) {
  await chatStore.selectChannel(ch);
  scrollToBottom();
}

async function handleRemoveChannel(channelId: string) {
  await chatStore.removeChannel(channelId);
}

async function handleRemoveDirectMessage(channelId: string) {
  await chatStore.removeDirectMessage(channelId);
}

async function handleSelectOperatorDM(userId: string) {
  showStartDmModal.value = false;
  await chatStore.startDirectMessage(userId);
  scrollToBottom();
}

async function handleCreateChannelSubmit() {
  if (!newChannelName.value.trim()) return;
  const ok = await chatStore.createChannel(newChannelName.value, newChannelDescription.value);
  if (ok) {
    showCreateChannelModal.value = false;
    newChannelName.value = '';
    newChannelDescription.value = '';
    scrollToBottom();
  }
}
</script>
