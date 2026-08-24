<template>
  <div
    v-if="isOpen"
    ref="pickerRef"
    :class="[
      'absolute z-50 pointer-events-auto bg-ops-surface border border-ops-border rounded-xl shadow-2xl overflow-hidden font-sans text-xs w-80 sm:w-88 flex flex-col animate-fade-in',
      resolvedPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
      resolvedAlign === 'right' ? 'right-0' : 'left-0'
    ]"
    @click.stop
  >
    <!-- Header with Search -->
    <div class="p-3 border-b border-ops-border bg-ops-subtle space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="font-mono font-bold text-2xs uppercase tracking-wider text-ops-text-dim flex items-center gap-1.5">
          <span>✨</span>
          <span>Emoji Reactions</span>
        </span>
        <button
          type="button"
          @click="$emit('close')"
          class="text-ops-text-dim hover:text-ops-text-bright font-mono text-xs p-1 hover:bg-ops-surface rounded transition"
          title="Close emoji picker"
        >
          ✕
        </button>
      </div>

      <!-- Quick Search Bar -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search emojis (e.g. fire, laugh, heart, gg)..."
          class="w-full bg-ops-obsidian border border-ops-border rounded-lg px-3 py-1.5 text-xs text-ops-text-bright placeholder:text-ops-text-dark outline-none focus:border-ops-blue font-sans"
        />
        <span v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2.5 top-2 text-xs text-ops-text-dim hover:text-ops-text-bright cursor-pointer">✕</span>
      </div>
    </div>

    <!-- Category Tabs (Larger, Comfortable & Clean) -->
    <div v-if="!searchQuery" class="px-2.5 py-2 border-b border-ops-border bg-ops-obsidian flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="activeCategory = cat.id"
        :class="[
          'px-2.5 py-1 rounded-md text-xs font-semibold font-sans transition shrink-0 flex items-center gap-1.5 select-none',
          activeCategory === cat.id
            ? 'bg-ops-blue text-white shadow-xs'
            : 'text-ops-text-dim hover:text-ops-text-bright hover:bg-ops-surface'
        ]"
      >
        <span class="text-sm">{{ cat.icon }}</span>
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- Scrollable Emoji Grid -->
    <div class="p-3 overflow-y-auto flex-1 max-h-56 grid grid-cols-8 gap-1.5 text-xl">
      <button
        v-for="emoji in displayedEmojis"
        :key="emoji"
        type="button"
        @click="handleSelect(emoji)"
        class="w-8 h-8 rounded-lg hover:bg-ops-surface-hover hover:scale-125 active:scale-95 transition flex items-center justify-center cursor-pointer select-none"
        :title="emoji"
      >
        {{ emoji }}
      </button>

      <div v-if="displayedEmojis.length === 0" class="col-span-full p-6 text-center text-ops-text-dim font-mono text-xs">
        No emojis found for "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    placement?: 'auto' | 'bottom' | 'top';
    align?: 'auto' | 'left' | 'right';
  }>(),
  {
    placement: 'auto',
    align: 'auto',
  }
);

const emit = defineEmits<{
  (e: 'select', emoji: string): void;
  (e: 'close'): void;
}>();

const pickerRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const activeCategory = ref<'all' | 'smileys' | 'gestures' | 'symbols' | 'gaming'>('all');

const dynamicPlacement = ref<'top' | 'bottom'>('bottom');
const dynamicAlign = ref<'left' | 'right'>('right');

const resolvedPlacement = computed(() => {
  if (props.placement !== 'auto') return props.placement;
  return dynamicPlacement.value;
});

const resolvedAlign = computed(() => {
  if (props.align !== 'auto') return props.align;
  return dynamicAlign.value;
});

function calculatePosition() {
  if (!pickerRef.value) return;
  const parent = pickerRef.value.parentElement;
  if (!parent) return;

  const rect = parent.getBoundingClientRect();
  const popoverHeight = 330;
  const popoverWidth = 340;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Vertical: If space below is less than popover height AND space above is sufficient, flip TOP
  if (viewportHeight - rect.bottom < popoverHeight && rect.top > popoverHeight) {
    dynamicPlacement.value = 'top';
  } else {
    dynamicPlacement.value = 'bottom';
  }

  // Horizontal: If space to the right is less than popover width, align RIGHT (opens leftward)
  if (viewportWidth - rect.left < popoverWidth) {
    dynamicAlign.value = 'right';
  } else {
    dynamicAlign.value = 'left';
  }
}

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
  { id: 'gaming' as const, name: 'LiveOps', icon: '🎮' },
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

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      nextTick(() => {
        calculatePosition();
      });
    }
  }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  nextTick(() => {
    calculatePosition();
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
