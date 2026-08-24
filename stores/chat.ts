import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io, Socket } from 'socket.io-client';
import type { IChatChannel, IChatMessage, IUser } from '../../shared/types';
import { useAuthStore } from './auth';
import { useNotificationsStore } from './notifications';

export const useChatStore = defineStore('chat', () => {
  const channels = ref<IChatChannel[]>([]);
  const activeChannel = ref<IChatChannel | null>(null);
  const messages = ref<IChatMessage[]>([]);
  const operators = ref<IUser[]>([]);
  const onlineUserIds = ref<string[]>([]);
  const typingUsers = ref<{ username: string; channelId: string }[]>([]);
  const isLoading = ref(false);
  const isSending = ref(false);
  const searchQuery = ref('');
  const isConnected = ref(false);
  let socket: Socket | null = null;

  const standardChannels = computed(() =>
    channels.value.filter((c) => !c.isDirectMessage)
  );

  const directMessages = computed(() => {
    const dms = channels.value.filter((c) => c.isDirectMessage);
    return [...dms].sort((a, b) => {
      const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  });

  const filteredChannels = computed(() => {
    if (!searchQuery.value.trim()) return standardChannels.value;
    const q = searchQuery.value.toLowerCase();
    return standardChannels.value.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );
  });

  const filteredDirectMessages = computed(() => {
    if (!searchQuery.value.trim()) return directMessages.value;
    const q = searchQuery.value.toLowerCase();
    return directMessages.value.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dmTargetUser?.username.toLowerCase().includes(q)
    );
  });

  function initSocket(): void {
    const authStore = useAuthStore();
    if (!authStore.token || socket?.connected) return;

    const runtimeConfig = useRuntimeConfig();
    const serverUrl = runtimeConfig.public?.apiBase?.replace('/api/v1', '') || 'http://localhost:4000';

    socket = io(serverUrl, {
      auth: { token: authStore.token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      isConnected.value = true;
      console.log('[Socket] Connected to Discuss real-time gateway.');
      if (activeChannel.value) {
        socket?.emit('channel:join', activeChannel.value._id);
      }
    });

    socket.on('connect_error', () => {
      isConnected.value = false;
    });

    socket.on('presence:update', (userIds: string[]) => {
      onlineUserIds.value = userIds;
    });

    socket.on('chat:new_message', (message: IChatMessage) => {
      if (activeChannel.value && activeChannel.value._id === message.channelId) {
        // Prevent duplicate messages if already inserted optimistically
        if (!messages.value.some((m) => m._id === message._id)) {
          messages.value.push(message);
        }
      }

      // Update last message in channel list
      const ch = channels.value.find((c) => c._id === message.channelId);
      if (ch) {
        ch.lastMessage = {
          content: message.content,
          senderName: message.sender.username,
          createdAt: message.createdAt,
        };
        ch.updatedAt = message.createdAt;
      }
    });

    socket.on('chat:reaction_updated', ({ messageId, reactions }) => {
      const msg = messages.value.find((m) => m._id === messageId);
      if (msg) {
        msg.reactions = reactions;
      }
    });

    socket.on('chat:user_typing', ({ channelId, username, isTyping }) => {
      if (isTyping) {
        if (!typingUsers.value.some((t) => t.channelId === channelId && t.username === username)) {
          typingUsers.value.push({ channelId, username });
        }
      } else {
        typingUsers.value = typingUsers.value.filter(
          (t) => !(t.channelId === channelId && t.username === username)
        );
      }
    });

    socket.on('chat:messages_seen', ({ channelId, seenByUserId, seenByUsername, seenAt }) => {
      if (activeChannel.value && activeChannel.value._id === channelId) {
        messages.value.forEach((m) => {
          if (m.sender._id !== seenByUserId) {
            m.status = 'seen';
            if (!m.seenBy) m.seenBy = [];
            if (!m.seenBy.some((s) => s.userId === seenByUserId)) {
              m.seenBy.push({ userId: seenByUserId, username: seenByUsername, seenAt });
            }
          }
        });
      }
    });

    socket.on('notification:new', (notif) => {
      const notifStore = useNotificationsStore();
      notifStore.handleIncomingNotification(notif);
    });

    socket.on('disconnect', () => {
      isConnected.value = false;
      console.log('[Socket] Disconnected from Discuss real-time gateway.');
    });
  }

  function disconnectSocket(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  async function fetchChannels(): Promise<void> {
    isLoading.value = true;
    try {
      const api = useApi();
      const res = await api.get('/chat/channels');
      if (res.success && res.data) {
        channels.value = res.data.channels || [];
        if (!activeChannel.value && standardChannels.value.length > 0) {
          await selectChannel(standardChannels.value[0]);
        }
      }
    } catch (err) {
      console.error('[fetchChannels Error]:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOperators(): Promise<void> {
    try {
      const api = useApi();
      const res = await api.get('/auth/users');
      if (res.success && res.data) {
        operators.value = res.data.users || [];
      }
    } catch (err) {
      console.error('[fetchOperators Error]:', err);
    }
  }

  async function selectChannel(channel: IChatChannel): Promise<void> {
    if (activeChannel.value && socket) {
      socket.emit('channel:leave', activeChannel.value._id);
    }

    activeChannel.value = channel;
    if (channel.isDirectMessage) {
      channel.updatedAt = new Date().toISOString();
    }

    if (socket) {
      socket.emit('channel:join', channel._id);
    }

    await fetchMessages(channel._id);
  }

  async function fetchMessages(channelId: string): Promise<void> {
    try {
      const api = useApi();
      const res = await api.get(`/chat/channels/${channelId}/messages`);
      if (res.success && res.data?.messages) {
        messages.value = res.data.messages;
      }
    } catch (err) {
      console.error('[fetchMessages Error]:', err);
    }
  }

  async function sendMessage(
    content: string,
    recipientId?: string,
    attachments?: any[]
  ): Promise<boolean> {
    if (!activeChannel.value) return false;
    isSending.value = true;

    try {
      if (activeChannel.value.isDirectMessage) {
        activeChannel.value.updatedAt = new Date().toISOString();
      }

      if (socket && socket.connected) {
        socket.emit('chat:send_message', {
          channelId: activeChannel.value._id,
          content,
          recipientId,
          attachments,
        });
        isSending.value = false;
        return true;
      }

      // REST fallback
      const api = useApi();
      const res = await api.post(`/chat/channels/${activeChannel.value._id}/messages`, {
        content,
        recipientId,
        attachments,
      });

      if (res.success && res.data?.message) {
        messages.value.push(res.data.message);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[sendMessage Error]:', err);
      return false;
    } finally {
      isSending.value = false;
    }
  }

  function emitTyping(isTyping: boolean): void {
    if (!socket || !activeChannel.value) return;
    socket.emit('chat:typing', {
      channelId: activeChannel.value._id,
      isTyping,
    });
  }

  async function startDirectMessage(targetUserId: string): Promise<IChatChannel | null> {
    try {
      const api = useApi();
      const res = await api.get(`/chat/dm/${targetUserId}`);
      if (res.success && res.data?.channel) {
        const channel = res.data.channel;
        channel.updatedAt = new Date().toISOString();

        const existingIdx = channels.value.findIndex((c) => c._id === channel._id);
        if (existingIdx !== -1) {
          channels.value.splice(existingIdx, 1);
        }
        channels.value.unshift(channel);

        await selectChannel(channel);
        return channel;
      }
      return null;
    } catch (err) {
      console.error('[startDirectMessage Error]:', err);
      return null;
    }
  }

  async function removeDirectMessage(channelId: string): Promise<void> {
    const idx = channels.value.findIndex((c) => c._id === channelId);
    if (idx !== -1) {
      channels.value.splice(idx, 1);
    }
    if (activeChannel.value?._id === channelId) {
      const nextChannel = standardChannels.value[0] || channels.value[0] || null;
      if (nextChannel) {
        await selectChannel(nextChannel);
      } else {
        activeChannel.value = null;
        messages.value = [];
      }
    }
  }

  async function removeChannel(channelId: string): Promise<void> {
    const idx = channels.value.findIndex((c) => c._id === channelId);
    if (idx !== -1) {
      channels.value.splice(idx, 1);
    }
    if (activeChannel.value?._id === channelId) {
      const nextChannel = standardChannels.value[0] || channels.value[0] || null;
      if (nextChannel) {
        await selectChannel(nextChannel);
      } else {
        activeChannel.value = null;
        messages.value = [];
      }
    }
  }

  async function createChannel(name: string, description: string): Promise<boolean> {
    try {
      const api = useApi();
      const res = await api.post('/chat/channels', { name, description });
      if (res.success && res.data?.channel) {
        channels.value.push(res.data.channel);
        await selectChannel(res.data.channel);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[createChannel Error]:', err);
      return false;
    }
  }

  async function toggleReaction(messageId: string, reaction: string): Promise<void> {
    try {
      const api = useApi();
      const res = await api.post(`/chat/messages/${messageId}/react`, { reaction });
      if (res.success && res.data?.message) {
        const idx = messages.value.findIndex((m) => m._id === messageId);
        if (idx !== -1) {
          messages.value[idx].reactions = res.data.message.reactions;
        }
      }
    } catch (err) {
      console.error('[toggleReaction Error]:', err);
    }
  }

  function isUserOnline(userId: string): boolean {
    return onlineUserIds.value.includes(userId);
  }

  return {
    channels,
    activeChannel,
    messages,
    operators,
    onlineUserIds,
    typingUsers,
    isConnected,
    isLoading,
    isSending,
    searchQuery,
    standardChannels,
    directMessages,
    filteredChannels,
    filteredDirectMessages,
    initSocket,
    disconnectSocket,
    fetchChannels,
    fetchOperators,
    selectChannel,
    fetchMessages,
    sendMessage,
    emitTyping,
    startDirectMessage,
    removeDirectMessage,
    removeChannel,
    createChannel,
    toggleReaction,
    isUserOnline,
  };
});
