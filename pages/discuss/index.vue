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
      <div
        @click="handleViewProfile(authStore.user)"
        class="p-3 border-t border-ops-border bg-ops-subtle flex items-center justify-between cursor-pointer hover:bg-ops-surface transition group"
        title="Click to view your operator profile"
      >
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-6 h-6 rounded-full bg-ops-blue text-white text-2xs font-mono font-bold flex items-center justify-center shrink-0">
            {{ (authStore.user?.username || 'OP').slice(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-ops-text-bright truncate group-hover:text-ops-blue-glow">{{ authStore.user?.username }}</div>
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
            @click="handleViewProfile(getDmUser(chatStore.activeChannel))"
            class="relative shrink-0 cursor-pointer group"
            title="Click to view operator profile"
          >
            <img
              v-if="getDmUser(chatStore.activeChannel)?.avatarUrl"
              :src="getDmUser(chatStore.activeChannel)?.avatarUrl"
              :alt="getDmDisplayName(chatStore.activeChannel)"
              class="w-9 h-9 rounded-full object-cover border border-ops-border shadow-xs group-hover:border-ops-blue transition"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-ops-obsidian border border-ops-border text-xs font-mono font-bold flex items-center justify-center text-ops-text-bright group-hover:border-ops-blue transition"
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
              <h2
                :class="[
                  'text-sm font-bold text-ops-text-bright font-sans truncate',
                  chatStore.activeChannel?.isDirectMessage ? 'hover:text-ops-blue-glow hover:underline cursor-pointer transition' : ''
                ]"
                @click="chatStore.activeChannel?.isDirectMessage ? handleViewProfile(getDmUser(chatStore.activeChannel)) : null"
                :title="chatStore.activeChannel?.isDirectMessage ? 'Click to view operator profile' : ''"
              >
                {{ chatStore.activeChannel?.isDirectMessage ? getDmDisplayName(chatStore.activeChannel) : chatStore.activeChannel?.name }}
              </h2>
            </div>
            <p class="text-2xs text-ops-text-dim truncate mt-0.5">
              {{ chatStore.activeChannel?.description || 'Internal Live-Ops operational communications stream' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono text-ops-text-dim">
          <button
            v-if="chatStore.activeChannel?.isDirectMessage"
            @click="handleViewProfile(getDmUser(chatStore.activeChannel))"
            class="px-2.5 py-1 bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-blue-glow rounded text-2xs transition flex items-center gap-1"
            title="View Profile Details"
          >
            <span>👤</span>
            <span>View Profile</span>
          </button>
          <span v-else class="px-2 py-0.5 bg-ops-obsidian rounded border border-ops-border text-2xs">
            Public Channel
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
          <div
            @click="handleViewProfile(group.sender)"
            class="relative shrink-0 pt-0.5 cursor-pointer group/avatar"
            title="Click to view operator profile"
          >
            <img
              v-if="group.sender.avatarUrl"
              :src="group.sender.avatarUrl"
              :alt="group.sender.username"
              class="w-8 h-8 rounded-full object-cover border border-ops-border shadow-xs group-hover/avatar:border-ops-blue transition"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-ops-surface border border-ops-border text-xs font-mono font-bold flex items-center justify-center text-ops-text-bright shadow-xs group-hover/avatar:border-ops-blue transition"
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
              <span
                @click="handleViewProfile(group.sender)"
                class="font-bold text-xs text-ops-text-bright hover:text-ops-blue-glow hover:underline cursor-pointer transition"
                title="Click to view operator profile"
              >
                {{ group.sender.username }}
              </span>
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
                :id="'msg-' + msg._id"
                :key="msg._id"
                class="relative group/bubble flex flex-col items-start gap-0.5 transition-all duration-300 rounded-lg p-0.5"
              >
                <!-- Quoted Reply Line (Above Message Bubble - Matching Image) -->
                <div
                  v-if="msg.replyTo"
                  @click="scrollToMessage(msg.replyTo.messageId)"
                  class="flex items-center gap-1.5 text-2xs text-ops-text-dim hover:text-ops-text-bright transition pb-0.5 cursor-pointer group/reply select-none pl-1"
                  :title="`Jump to original message: &quot;${msg.replyTo.content}&quot;`"
                >
                  <!-- Curved connector branch -->
                  <svg class="w-3.5 h-3.5 text-ops-border group-hover/reply:text-ops-blue shrink-0 -scale-y-100" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M3 14V7a4 4 0 014-4h7m-3-3l3 3-3 3"/>
                  </svg>

                  <!-- Quoted Avatar -->
                  <img
                    v-if="msg.replyTo.senderAvatarUrl"
                    :src="msg.replyTo.senderAvatarUrl"
                    :alt="msg.replyTo.senderName"
                    class="w-3.5 h-3.5 rounded-full object-cover border border-ops-border shrink-0"
                  />
                  <div
                    v-else
                    class="w-3.5 h-3.5 rounded-full bg-ops-surface border border-ops-border flex items-center justify-center text-3xs font-mono font-bold text-ops-text-bright shrink-0"
                  >
                    {{ msg.replyTo.senderName.slice(0, 1).toUpperCase() }}
                  </div>

                  <!-- Quoted user mention -->
                  <span class="font-bold text-ops-blue-glow">@{{ msg.replyTo.senderName }}</span>
                  <!-- Quoted snippet -->
                  <span class="truncate max-w-xs sm:max-w-md text-ops-text-dark group-hover/reply:text-ops-text-dim">{{ msg.replyTo.content }}</span>
                </div>

                <!-- Styled Bubble Container -->
                <div
                  :class="[
                    'px-3.5 py-2 rounded-lg text-xs font-sans max-w-xl break-words leading-relaxed border transition shadow-xs relative min-w-[200px] sm:min-w-[240px]',
                    group.isSelf
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-medium'
                      : 'bg-sky-500/10 dark:bg-sky-950/40 border-sky-500/30 text-sky-950 dark:text-sky-100 font-medium'
                  ]"
                >
                  <span v-html="renderMessageHtml(msg.content)" />

                  <!-- Floating Action Bar: 6 Mandatory Emotes + (+) More Picker Button + (↩) Reply Button -->
                  <div
                    class="absolute -top-3.5 right-0 sm:right-1 opacity-0 group-hover/bubble:opacity-100 transition-all duration-150 bg-ops-surface/95 backdrop-blur-md border border-ops-border rounded-full shadow-xl px-2 py-0.5 flex items-center gap-1.5 z-30 pointer-events-none group-hover/bubble:pointer-events-auto whitespace-nowrap"
                  >
                    <!-- 1. Thumbs up (👍) -->
                    <button
                      type="button"
                      @click.stop="handleQuickReact(msg._id, '👍')"
                      class="hover:scale-125 active:scale-95 transition text-xs select-none"
                      title="1. Thumbs up (👍)"
                    >
                      👍
                    </button>

                    <!-- 2. Heart react (❤️) -->
                    <button
                      type="button"
                      @click.stop="handleQuickReact(msg._id, '❤️')"
                      class="hover:scale-125 active:scale-95 transition text-xs select-none"
                      title="2. Heart react (❤️)"
                    >
                      ❤️
                    </button>

                    <!-- 3. Thumbs down (👎) -->
                    <button
                      type="button"
                      @click.stop="handleQuickReact(msg._id, '👎')"
                      class="hover:scale-125 active:scale-95 transition text-xs select-none"
                      title="3. Thumbs down (👎)"
                    >
                      👎
                    </button>

                    <!-- 4. Laugh (😂) -->
                    <button
                      type="button"
                      @click.stop="handleQuickReact(msg._id, '😂')"
                      class="hover:scale-125 active:scale-95 transition text-xs select-none"
                      title="4. Laugh (😂)"
                    >
                      😂
                    </button>

                    <!-- 5. Sad (😢) -->
                    <button
                      type="button"
                      @click.stop="handleQuickReact(msg._id, '😢')"
                      class="hover:scale-125 active:scale-95 transition text-xs select-none"
                      title="5. Sad (😢)"
                    >
                      😢
                    </button>

                    <!-- 6. Sad cry (😭) -->
                    <button
                      type="button"
                      @click.stop="handleQuickReact(msg._id, '😭')"
                      class="hover:scale-125 active:scale-95 transition text-xs select-none"
                      title="6. Sad cry (😭)"
                    >
                      😭
                    </button>

                    <div class="w-px h-3 bg-ops-border mx-0.5" />

                    <!-- 7. (+) Access All Emotes Button -->
                    <div class="relative">
                      <button
                        type="button"
                        @click.stop="toggleEmojiPicker(msg._id)"
                        class="w-5 h-5 rounded-full bg-ops-obsidian hover:bg-ops-blue hover:text-white border border-ops-border text-ops-text-dim text-2xs font-mono font-bold flex items-center justify-center transition"
                        title="7. Open All Emotes Picker (+)"
                      >
                        +
                      </button>

                      <!-- Full Emoji Picker Popover for this Message -->
                      <ChatEmojiPickerPopover
                        v-if="activeEmojiPickerMessageId === msg._id"
                        :is-open="true"
                        @select="(emoji) => handleEmojiPickerSelect(msg._id, emoji)"
                        @close="activeEmojiPickerMessageId = null"
                      />
                    </div>

                    <div class="w-px h-3 bg-ops-border mx-0.5" />

                    <!-- Reply Action Button (↩) -->
                    <button
                      type="button"
                      @click.stop="handleInitiateReply(msg, group.sender)"
                      class="hover:scale-125 active:scale-95 transition text-xs select-none px-1 text-ops-text-dim hover:text-ops-blue-glow font-bold flex items-center gap-1"
                      title="Reply to message (↩)"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 17 4 12 9 7" />
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Rich Link Preview Embeds (e.g. Google Meet, Zoom, GitHub, Figma, YouTube, etc.) -->
                <template v-if="extractUrls(msg.content).length > 0">
                  <ChatRichLinkPreview
                    v-for="url in extractUrls(msg.content)"
                    :key="url"
                    :url="url"
                  />
                </template>

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

                <!-- Active Reaction Badges -->
                <div v-if="msg.reactions && msg.reactions.length > 0" class="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <button
                    v-for="(react, rIdx) in msg.reactions"
                    :key="rIdx"
                    @click="handleQuickReact(msg._id, react.reaction)"
                    :class="[
                      'px-2 py-0.5 rounded-full text-2xs font-mono border flex items-center gap-1 transition shadow-2xs select-none',
                      hasUserReacted(react)
                        ? 'bg-ops-blue/20 border-ops-blue text-ops-text-bright font-bold'
                        : 'bg-ops-obsidian hover:bg-ops-surface border-ops-border text-ops-text-dim hover:text-ops-text-bright'
                    ]"
                    :title="react.users.join(', ')"
                  >
                    <span>{{ react.reaction }}</span>
                    <span>{{ react.users.length }}</span>
                  </button>

                  <!-- Small '+' Button to Add Reaction -->
                  <div class="relative">
                    <button
                      type="button"
                      @click.stop="toggleEmojiPicker(msg._id)"
                      class="w-5 h-5 rounded-full bg-ops-obsidian hover:bg-ops-surface border border-ops-border text-ops-text-dim hover:text-ops-text-bright text-3xs font-mono font-bold flex items-center justify-center transition"
                      title="Add reaction (+)"
                    >
                      +
                    </button>

                    <!-- Popover if opened via '+' on badge row -->
                    <ChatEmojiPickerPopover
                      v-if="activeEmojiPickerMessageId === msg._id"
                      :is-open="true"
                      @select="(emoji) => handleEmojiPickerSelect(msg._id, emoji)"
                      @close="activeEmojiPickerMessageId = null"
                    />
                  </div>
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

      <!-- Replying Banner (Active Reply Preview) -->
      <div
        v-if="activeReplyTarget"
        class="px-4 py-2 bg-ops-subtle border-t border-ops-border flex items-center justify-between text-xs animate-fade-in"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-ops-blue-glow font-bold font-mono text-2xs flex items-center gap-1 shrink-0">
            <span>↩</span>
            <span>Replying to @{{ activeReplyTarget.senderName }}</span>
          </span>
          <span class="text-ops-text-dim truncate text-2xs italic font-sans max-w-sm sm:max-w-md">
            "{{ activeReplyTarget.content }}"
          </span>
        </div>
        <button
          type="button"
          @click="activeReplyTarget = null"
          class="text-ops-text-dim hover:text-ops-text-bright text-xs font-mono px-1.5 py-0.5 hover:bg-ops-surface rounded transition shrink-0"
          title="Cancel reply (Esc)"
        >
          ✕
        </button>
      </div>

      <!-- Bottom Message Composer -->
      <div class="p-3 border-t border-ops-border bg-ops-surface">
        <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
          <div class="flex-1 relative flex items-center">
            <textarea
              ref="messageInputRef"
              v-model="messageInput"
              @keydown.enter.exact.prevent="handleSendMessage"
              @keydown.esc.exact="activeReplyTarget = null"
              @input="handleInputTyping"
              :placeholder="activeReplyTarget ? `Reply to @${activeReplyTarget.senderName}...` : `Message #${chatStore.activeChannel?.name || 'channel'}...`"
              rows="1"
              class="w-full bg-ops-obsidian border border-ops-border rounded px-3 py-2 pr-10 text-xs text-ops-text-bright placeholder:text-ops-text-dark outline-none focus:border-ops-blue resize-none font-sans"
            />

            <!-- Composer Emoji Insert Button -->
            <div class="absolute right-2 top-1.5">
              <button
                type="button"
                @click.stop="showComposerEmojiPicker = !showComposerEmojiPicker"
                class="p-1 text-base hover:scale-125 transition text-ops-text-dim hover:text-ops-text-bright select-none"
                title="Insert Emoji"
              >
                😊
              </button>

              <!-- Composer Emoji Picker Popover -->
              <ChatEmojiPickerPopover
                v-if="showComposerEmojiPicker"
                :is-open="true"
                @select="handleComposerEmojiSelect"
                @close="showComposerEmojiPicker = false"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="chatStore.isSending || !messageInput.trim()"
            class="px-4 py-2 bg-ops-blue hover:bg-ops-blue-glow disabled:opacity-50 text-white font-mono font-bold text-xs rounded transition flex items-center gap-1.5 shadow shrink-0"
          >
            <span>{{ activeReplyTarget ? 'REPLY' : 'SEND' }}</span>
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

        <!-- Search Input Filter -->
        <div class="p-3 border-b border-ops-border bg-ops-obsidian">
          <input
            v-model="operatorSearchQuery"
            type="text"
            placeholder="Search colleagues by name or department..."
            class="w-full bg-ops-surface border border-ops-border rounded px-3 py-1.5 text-xs text-ops-text-bright placeholder-ops-text-dark font-sans outline-none focus:border-ops-blue"
          />
        </div>

        <div class="p-3 space-y-2 max-h-80 overflow-y-auto">
          <div v-if="availableDmOperators.length === 0" class="p-6 text-center text-ops-text-dim font-mono text-xs">
            No matching operators found
          </div>

          <div
            v-for="op in availableDmOperators"
            :key="op._id"
            @click="handleSelectOperatorDM(op._id)"
            class="p-2.5 bg-ops-obsidian hover:bg-ops-surface-hover rounded border border-ops-border flex items-center justify-between cursor-pointer transition group"
          >
            <div class="flex items-center gap-2.5 min-w-0">
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
              <div class="min-w-0">
                <div class="font-bold text-ops-text-bright truncate group-hover:text-ops-blue-glow">{{ op.username }}</div>
                <div class="text-2xs text-ops-text-dim truncate">{{ op.position || op.department }}</div>
              </div>
            </div>
            <span class="text-2xs font-mono text-ops-blue-glow shrink-0">Message →</span>
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
const messageInputRef = ref<HTMLTextAreaElement | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const showCreateChannelModal = ref(false);
const showStartDmModal = ref(false);
const operatorSearchQuery = ref('');
const newChannelName = ref('');
const newChannelDescription = ref('');
const activeEmojiPickerMessageId = ref<string | null>(null);
const showComposerEmojiPicker = ref(false);
const activeReplyTarget = ref<{
  messageId: string;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
} | null>(null);
let typingTimeout: any = null;

const availableDmOperators = computed(() => {
  const list = (chatStore.operators.length > 0 ? chatStore.operators : authStore.operators) || [];
  const currentId = authStore.user?._id?.toString();
  const currentUsername = authStore.user?.username?.toLowerCase();

  return list.filter((u) => {
    if (!u) return false;
    const uId = (u._id || '').toString();
    const uName = (u.username || '').toLowerCase();
    if (uId && currentId && uId === currentId) return false;
    if (uName && currentUsername && uName === currentUsername) return false;
    if (operatorSearchQuery.value.trim()) {
      const q = operatorSearchQuery.value.toLowerCase();
      return (
        uName.includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.position && u.position.toLowerCase().includes(q))
      );
    }
    return true;
  });
});

watch(showStartDmModal, (open) => {
  if (open) {
    operatorSearchQuery.value = '';
    chatStore.fetchOperators();
  }
});

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
  const replyTarget = activeReplyTarget.value ? { ...activeReplyTarget.value } : undefined;

  messageInput.value = '';
  activeReplyTarget.value = null;
  chatStore.emitTyping(false);

  await chatStore.sendMessage(content, undefined, undefined, replyTarget);
  scrollToBottom();
}

function handleInitiateReply(msg: any, sender: any) {
  if (!msg) return;
  activeReplyTarget.value = {
    messageId: msg._id,
    senderName: sender?.username || msg.sender?.username || 'Operator',
    senderAvatarUrl: sender?.avatarUrl || msg.sender?.avatarUrl || '',
    content: msg.content,
  };
  nextTick(() => {
    messageInputRef.value?.focus();
  });
}

function scrollToMessage(messageId: string) {
  if (!messageId) return;
  const el = document.getElementById(`msg-${messageId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-ops-blue', 'bg-ops-blue/20');
    setTimeout(() => {
      el.classList.remove('ring-2', 'ring-ops-blue', 'bg-ops-blue/20');
    }, 2000);
  }
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

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<]+[^\s<.,:;"')\]]|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|gg|app|dev|co|us|tv|ai|ph|gov|edu|me)(?:\/[^\s<]*[^\s<.,:;"')\]])?/gi;

function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function renderMessageHtml(content: string): string {
  if (!content) return '';
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(URL_REGEX, (matchedUrl) => {
    const fullHref = normalizeUrl(matchedUrl);
    return `<a href="${fullHref}" target="_blank" rel="noopener noreferrer" class="text-ops-blue hover:text-ops-blue-glow underline font-mono break-all font-semibold cursor-pointer" onclick="event.stopPropagation()">${matchedUrl}</a>`;
  });
}

function extractUrls(content: string): string[] {
  if (!content) return [];
  const matches = content.match(URL_REGEX);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => normalizeUrl(m))));
}

function handleViewProfile(userOrSender: any) {
  if (!userOrSender) return;
  authStore.openProfile(userOrSender);
}

function hasUserReacted(react: { reaction: string; users: string[] }): boolean {
  if (!react || !authStore.user?.username) return false;
  return react.users.includes(authStore.user.username);
}

function handleQuickReact(messageId: string, emoji: string) {
  chatStore.toggleReaction(messageId, emoji);
}

function toggleEmojiPicker(messageId: string) {
  if (activeEmojiPickerMessageId.value === messageId) {
    activeEmojiPickerMessageId.value = null;
  } else {
    activeEmojiPickerMessageId.value = messageId;
  }
}

function handleEmojiPickerSelect(messageId: string, emoji: string) {
  chatStore.toggleReaction(messageId, emoji);
  activeEmojiPickerMessageId.value = null;
}

function handleComposerEmojiSelect(emoji: string) {
  messageInput.value += emoji;
  showComposerEmojiPicker.value = false;
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
