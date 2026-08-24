import type { Config } from 'tailwindcss';

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ops: {
          obsidian: 'var(--ops-obsidian)',
          canvas: 'var(--ops-canvas)',
          surface: 'var(--ops-surface)',
          'surface-hover': 'var(--ops-surface-hover)',
          subtle: 'var(--ops-subtle)',
          border: 'var(--ops-border)',
          'border-light': 'var(--ops-border-light)',
          'text-bright': 'var(--ops-text-bright)',
          'text-base': 'var(--ops-text-base)',
          'text-dim': 'var(--ops-text-dim)',
          'text-dark': 'var(--ops-text-dark)',
          blue: 'var(--ops-blue)',
          'blue-glow': 'var(--ops-blue-glow)',
        },
        state: {
          emerald: '#10b981',
          'emerald-bg': '#064e3b',
          'emerald-border': '#047857',
          amber: '#f59e0b',
          'amber-bg': '#451a03',
          'amber-border': '#b45309',
          crimson: '#ef4444',
          'crimson-bg': '#450a0a',
          'crimson-border': '#b91c1c',
          slate: '#64748b',
          'slate-bg': '#1e293b',
          'slate-border': '#334155',
          purple: '#a855f7',
          'purple-bg': '#3b0764',
          cyan: '#06b6d4',
          'cyan-bg': '#083344',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.65rem',
        '3xs': '0.55rem',
      },
    },
  },
  plugins: [],
};
