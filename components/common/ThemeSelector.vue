<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-2.5 py-1 bg-ops-obsidian hover:bg-ops-surface-hover border border-ops-border rounded text-2xs font-mono text-ops-text-dim hover:text-ops-text-bright transition"
      :title="`Theme: ${activeThemeName} (${theme.currentMode.value === 'dark' ? 'Dark' : 'Light'})`"
    >
      <span
        class="w-2.5 h-2.5 rounded-full border border-ops-border shrink-0"
        :style="{ backgroundColor: currentAccentColor }"
      />
      <span class="hidden xl:inline font-semibold">{{ activeThemeName }}</span>
      <span class="px-1 py-0.2 bg-ops-surface rounded text-3xs font-bold uppercase tracking-wider text-ops-text-bright">
        {{ theme.currentMode.value }}
      </span>
      <span class="text-3xs text-ops-text-dim">▼</span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-1.5 w-80 bg-ops-surface border border-ops-border rounded-lg shadow-2xl p-3 z-50 text-xs font-sans space-y-3"
    >
      <!-- Dropdown Header -->
      <div class="flex items-center justify-between pb-2 border-b border-ops-border/60">
        <div>
          <div class="text-2xs font-mono font-bold uppercase text-ops-text-bright tracking-wider">Console Color Palette</div>
          <div class="text-3xs font-mono text-ops-text-dim">60-30-10 Minimalist Structure</div>
        </div>
        <button
          @click="isOpen = false"
          class="text-ops-text-dim hover:text-ops-text-bright font-mono text-xs p-1"
        >
          ✕
        </button>
      </div>

      <!-- Mode Toggle: Dark vs Light -->
      <div>
        <div class="text-3xs font-mono uppercase text-ops-text-dim mb-1.5 font-bold">Display Mode</div>
        <div class="grid grid-cols-2 gap-1.5 bg-ops-obsidian p-1 rounded border border-ops-border">
          <button
            type="button"
            @click="theme.setMode('dark')"
            :class="[
              'py-1 text-2xs font-mono font-bold rounded transition text-center',
              theme.currentMode.value === 'dark'
                ? 'bg-ops-surface text-ops-text-bright shadow border border-ops-border'
                : 'text-ops-text-dim hover:text-ops-text-bright'
            ]"
          >
            Dark Mode
          </button>
          <button
            type="button"
            @click="theme.setMode('light')"
            :class="[
              'py-1 text-2xs font-mono font-bold rounded transition text-center',
              theme.currentMode.value === 'light'
                ? 'bg-ops-surface text-ops-text-bright shadow border border-ops-border'
                : 'text-ops-text-dim hover:text-ops-text-bright'
            ]"
          >
            Light Mode
          </button>
        </div>
      </div>

      <!-- Theme Families List (4 Themes) -->
      <div>
        <div class="text-3xs font-mono uppercase text-ops-text-dim mb-1.5 font-bold">Palette Theme (4 Presets)</div>
        <div class="space-y-1.5">
          <button
            v-for="tf in themeOptions"
            :key="tf.id"
            type="button"
            @click="theme.setTheme(tf.id)"
            :class="[
              'w-full p-2 rounded border text-left transition flex items-center justify-between gap-2',
              theme.currentTheme.value === tf.id
                ? 'bg-ops-obsidian border-ops-blue ring-1 ring-ops-blue/50 text-ops-text-bright'
                : 'bg-ops-obsidian/60 hover:bg-ops-obsidian border-ops-border text-ops-text-dim hover:text-ops-text-bright'
            ]"
          >
            <div class="space-y-0.5 min-w-0">
              <div class="text-xs font-bold font-mono truncate flex items-center gap-1.5">
                <span :class="theme.currentTheme.value === tf.id ? 'text-ops-blue-glow' : ''">
                  {{ theme.currentTheme.value === tf.id ? '●' : '○' }}
                </span>
                <span>{{ tf.name }}</span>
              </div>
              <div class="text-3xs font-mono text-ops-text-dim pl-3 truncate">
                {{ tf.description }}
              </div>
            </div>

            <!-- 3-Color Swatch Preview (60% BG, 30% Surface, 10% Accent) -->
            <div class="flex items-center gap-1 shrink-0 p-1 bg-ops-surface rounded border border-ops-border/60">
              <!-- 60% Dominant Background -->
              <span
                class="w-3.5 h-3.5 rounded-sm border border-ops-border"
                :style="{ backgroundColor: theme.currentMode.value === 'dark' ? tf.darkBg : tf.lightBg }"
                title="60% Background"
              />
              <!-- 30% Secondary Surface -->
              <span
                class="w-3.5 h-3.5 rounded-sm border border-ops-border"
                :style="{ backgroundColor: theme.currentMode.value === 'dark' ? tf.darkSurface : tf.lightSurface }"
                title="30% Surface / Text"
              />
              <!-- 10% Accent Action -->
              <span
                class="w-3.5 h-3.5 rounded-sm shadow-sm"
                :style="{ backgroundColor: theme.currentMode.value === 'dark' ? tf.darkAccent : tf.lightAccent }"
                title="10% Accent Action"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Quick Preset Quick Pickers -->
      <div class="pt-2 border-t border-ops-border/60 flex items-center justify-between text-3xs font-mono text-ops-text-dim">
        <span>Structure: 60% BG • 30% Surface • 10% Accent</span>
        <button
          type="button"
          @click="theme.setPreset('tech-slate', 'dark')"
          class="hover:text-ops-blue-glow underline"
        >
          Reset Default
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTheme, type ThemeFamily } from '~/composables/useTheme';

const theme = useTheme();
const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const themeOptions = [
  {
    id: 'tech-slate' as ThemeFamily,
    name: 'Tech Slate',
    description: 'Electric Blue on Obsidian / Slate',
    darkBg: '#0a0e14',
    darkSurface: '#121820',
    darkAccent: '#38bdf8',
    lightBg: '#f8fafc',
    lightSurface: '#ffffff',
    lightAccent: '#2563eb',
  },
  {
    id: 'emerald' as ThemeFamily,
    name: 'Deep Emerald',
    description: 'Mint Green on Charcoal / Frost',
    darkBg: '#0d0d0d',
    darkSurface: '#191919',
    darkAccent: '#34d399',
    lightBg: '#f9fafb',
    lightSurface: '#ffffff',
    lightAccent: '#059669',
  },
  {
    id: 'cyberpunk' as ThemeFamily,
    name: 'Cyberpunk Rose',
    description: 'Neon Rose on Zinc / Stone White',
    darkBg: '#121215',
    darkSurface: '#202024',
    darkAccent: '#f43f5e',
    lightBg: '#fafaf9',
    lightSurface: '#ffffff',
    lightAccent: '#d946ef',
  },
  {
    id: 'amethyst' as ThemeFamily,
    name: 'Royal Amethyst',
    description: 'Amethyst Purple on Midnight Violet',
    darkBg: '#0d0b17',
    darkSurface: '#19152b',
    darkAccent: '#c084fc',
    lightBg: '#faf8ff',
    lightSurface: '#ffffff',
    lightAccent: '#7e22ce',
  },
];

const activeThemeName = computed(() => {
  const t = themeOptions.find((o) => o.id === theme.currentTheme.value);
  return t ? t.name : 'Tech Slate';
});

const currentAccentColor = computed(() => {
  const t = themeOptions.find((o) => o.id === theme.currentTheme.value);
  if (!t) return '#2563eb';
  return theme.currentMode.value === 'dark' ? t.darkAccent : t.lightAccent;
});

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  theme.initTheme();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
