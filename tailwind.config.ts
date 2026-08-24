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
          obsidian: '#0a0e14',
          canvas: '#0e131b',
          surface: '#121820',
          'surface-hover': '#1a232f',
          subtle: '#151d27',
          border: '#222f3e',
          'border-light': '#2c3e53',
          'text-bright': '#f0f6fc',
          'text-base': '#c9d1d9',
          'text-dim': '#7d8c9e',
          'text-dark': '#485563',
          blue: '#2563eb',
          'blue-glow': '#3b82f6',
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
      },
    },
  },
  plugins: [],
};
