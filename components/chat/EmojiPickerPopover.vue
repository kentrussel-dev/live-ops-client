<template>
  <div
    v-if="isOpen"
    ref="pickerRef"
    class="absolute z-50 bottom-full mb-2 right-0 bg-ops-surface border border-ops-border rounded-xl shadow-2xl overflow-hidden font-sans text-xs w-72 sm:w-80 flex flex-col max-h-80 animate-fade-in"
    @click.stop
  >
    <!-- Header with Search -->
    <div class="p-2.5 border-b border-ops-border bg-ops-subtle space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-mono font-bold text-2xs uppercase tracking-wider text-ops-text-dim flex items-center gap-1.5">
          <span>✨</span>
          <span>Emoji Reactions</span>
        </span>
        <button
          @click="$emit('close')"
          class="text-ops-text-dim hover:text-ops-text-bright font-mono text-xs p-1"
        >
          ✕
        </button>
      </div>

      <!-- Quick Search Bar -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search emojis (e.g. fire, happy, heart, gg)..."
          class="w-full bg-ops-obsidian border border-ops-border rounded px-2.5 py-1 text-2xs text-ops-text-bright placeholder:text-ops-text-dark outline-none focus:border-ops-blue font-sans"
        />
        <span v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2 top-1 text-3xs text-ops-text-dim cursor-pointer">✕</span>
      </div>
    </div>

    <!-- Category Tabs -->
    <div v-if="!searchQuery" class="px-2 py-1 border-b border-ops-border bg-ops-obsidian flex items-center gap-1 overflow-x-auto">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.id"
        :class="[
          'px-2 py-0.5 rounded text-3xs font-mono transition shrink-0',
          activeCategory === cat.id
            ? 'bg-ops-blue text-white font-bold shadow-xs'
            : 'text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface'
        ]"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- Scrollable Emoji Grid -->
    <div class="p-2.5 overflow-y-auto flex-1 max-h-56 grid grid-cols-7 sm:grid-cols-8 gap-1 text-base">
      <button
        v-for="emoji in displayedEmojis"
        :key="emoji"
        @click="handleSelect(emoji)"
        class="w-8 h-8 rounded hover:bg-ops-surface-hover hover:scale-125 active:scale-95 transition flex items-center justify-center cursor-pointer select-none"
        :title="emoji"
      >
        {{ emoji }}
      </button>

      <div v-if="displayedEmojis.length === 0" class="col-span-full p-6 text-center text-ops-text-dim font-mono text-2xs">
        No emojis found for "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', emoji: string): void;
  (e: 'close'): void;
}>();

const pickerRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const activeCategory = ref<'all' | 'smileys' | 'gestures' | 'symbols' | 'gaming'>('all');

const emojiGroups = {
  mandatory: ['👍', '❤️', '👎', '😂', '😢', '😭'],
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒',
    '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
    '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰',
    '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄',
    '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴',
    '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺',
    '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃'
  ],
  gestures: [
    '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
    '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
    '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👋', '🤚', '🖐️', '✋',
    '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️'
  ],
  symbols: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '✨', '⭐', '🌟',
    '💫', '💥', '🔥', '⚡', '🎉', '🎊', '💯', '✅', '❌', '⚠️', '🚀', '🛡️',
    '🎯', '🏆', '🎮', '👾', '🕹️', '💻', '📱', '📡', '💡', '🔧', '⚙️', '🔒', '🔑'
  ],
  gaming: [
    '⚔️', '🛡️', '🏹', '🗡️', '🔮', '💎', '👑', '🪙', '💰', '🧪', '📦', '🚩',
    '🗺️', '🏰', '🐉', '👾', '🤖', '💀', '⚡', '🔥', '❄️', '🌪️', '🛑', '🚨',
    '🔔', '📢', '💬', '🏆', '🥇', '🥈', '🥉', '🎯', '🎲', '🎰', '🃏', '🕹️'
  ],
};

const categories = [
  { id: 'all' as const, name: 'All', icon: '🌟' },
  { id: 'smileys' as const, name: 'Faces', icon: '😀' },
  { id: 'gestures' as const, name: 'Hands', icon: '👋' },
  { id: 'symbols' as const, name: 'Hearts', icon: '❤️' },
  { id: 'gaming' as const, name: 'Live-Ops', icon: '🎮' },
];

const allUniqueEmojis = computed(() => {
  const combined = [
    ...emojiGroups.mandatory,
    ...emojiGroups.smileys,
    ...emojiGroups.gestures,
    ...emojiGroups.symbols,
    ...emojiGroups.gaming,
  ];
  return Array.from(new Set(combined));
});

const displayedEmojis = computed(() => {
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    return allUniqueEmojis.value.filter((e) => {
      // Basic keyword checks for search
      if (q.includes('thumb') || q.includes('like')) return e === '👍' || e === '👎';
      if (q.includes('heart') || q.includes('love')) return e.includes('❤️') || emojiGroups.symbols.includes(e);
      if (q.includes('laugh') || q.includes('lol') || q.includes('haha')) return e === '😂' || e === '😆' || e === '🤣';
      if (q.includes('cry') || q.includes('sad') || q.includes('tear')) return e === '😢' || e === '😭' || e === '🥺' || e === '🙁';
      if (q.includes('fire')) return e === '🔥';
      if (q.includes('star')) return e === '⭐' || e === '🌟';
      if (q.includes('game') || q.includes('sword')) return emojiGroups.gaming.includes(e);
      return true;
    });
  }

  if (activeCategory.value === 'all') return allUniqueEmojis.value;
  return emojiGroups[activeCategory.value] || allUniqueEmojis.value;
});

function handleSelect(emoji: string) {
  emit('select', emoji);
  emit('close');
}

function handleClickOutside(e: MouseEvent) {
  if (props.isOpen && pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
