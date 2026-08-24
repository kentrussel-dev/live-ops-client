import { ref, computed } from 'vue';

export type ThemeFamily = 'tech-slate' | 'emerald' | 'cyberpunk' | 'amethyst';
export type ColorMode = 'dark' | 'light';

export interface IThemeOption {
  id: ThemeFamily;
  name: string;
  darkAccentHex: string;
  lightAccentHex: string;
}

export const THEME_FAMILIES: IThemeOption[] = [
  {
    id: 'tech-slate',
    name: 'Tech Slate (Original)',
    darkAccentHex: '#38bdf8',
    lightAccentHex: '#2563eb',
  },
  {
    id: 'emerald',
    name: 'Charcoal & Emerald',
    darkAccentHex: '#34d399',
    lightAccentHex: '#059669',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk & Rose',
    darkAccentHex: '#f43f5e',
    lightAccentHex: '#d946ef',
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    darkAccentHex: '#c084fc',
    lightAccentHex: '#7e22ce',
  },
];

const currentTheme = ref<ThemeFamily>('tech-slate');
const currentMode = ref<ColorMode>('dark');
const isThemeInitialized = ref(false);

export function useTheme() {
  const activeClass = computed(() => `theme-${currentTheme.value}-${currentMode.value}`);

  function initTheme() {
    if (process.client && !isThemeInitialized.value) {
      const savedTheme = localStorage.getItem('aetheria_theme_family') as ThemeFamily | null;
      const savedMode = localStorage.getItem('aetheria_color_mode') as ColorMode | null;

      if (savedTheme && THEME_FAMILIES.some((t) => t.id === savedTheme)) {
        currentTheme.value = savedTheme;
      }
      if (savedMode === 'dark' || savedMode === 'light') {
        currentMode.value = savedMode;
      }

      applyThemeToDom();
      isThemeInitialized.value = true;
    }
  }

  function applyThemeToDom() {
    if (!process.client) return;

    // Remove all previous theme classes
    THEME_FAMILIES.forEach((tf) => {
      document.documentElement.classList.remove(`theme-${tf.id}-dark`);
      document.documentElement.classList.remove(`theme-${tf.id}-light`);
    });

    // Add current theme class
    const newClass = `theme-${currentTheme.value}-${currentMode.value}`;
    document.documentElement.classList.add(newClass);

    // Toggle Tailwind dark mode class
    if (currentMode.value === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }

  function setTheme(family: ThemeFamily) {
    currentTheme.value = family;
    if (process.client) {
      localStorage.setItem('aetheria_theme_family', family);
    }
    applyThemeToDom();
  }

  function setMode(mode: ColorMode) {
    currentMode.value = mode;
    if (process.client) {
      localStorage.setItem('aetheria_color_mode', mode);
    }
    applyThemeToDom();
  }

  function toggleMode() {
    setMode(currentMode.value === 'dark' ? 'light' : 'dark');
  }

  function setPreset(family: ThemeFamily, mode: ColorMode) {
    currentTheme.value = family;
    currentMode.value = mode;
    if (process.client) {
      localStorage.setItem('aetheria_theme_family', family);
      localStorage.setItem('aetheria_color_mode', mode);
    }
    applyThemeToDom();
  }

  return {
    currentTheme,
    currentMode,
    activeClass,
    themeFamilies: THEME_FAMILIES,
    initTheme,
    setTheme,
    setMode,
    toggleMode,
    setPreset,
  };
}
