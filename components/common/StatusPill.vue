<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium tracking-wide uppercase',
      styleClasses
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', dotClasses]" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    status: string;
    label?: string;
  }>(),
  {
    label: '',
  }
);

const styleClasses = computed(() => {
  const s = props.status?.toLowerCase() || '';

  // Most Important / Critical Blocker / Incident (Crimson/Purple alert)
  if (['most_important', 'critical_blocker', 'incident_active', 'degraded', 'offline', 'error'].includes(s)) {
    return 'dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-600 bg-purple-100 text-purple-900 border border-purple-400 font-bold';
  }

  // Very High / Major / Paused / Cancelled (Rose/Red)
  if (['very_high', 'major', 'paused', 'cancelled', 'draining', 'maintenance'].includes(s)) {
    return 'dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 bg-rose-100 text-rose-800 border border-rose-300 font-bold';
  }

  // High / Warning / Investigating / Flash Sale (Amber/Orange)
  if (['high', 'scheduled', 'in_review', 'flash_sale', 'investigating', 'warning', 'featured', 'high_load'].includes(s)) {
    return 'dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 bg-amber-100 text-amber-800 border border-amber-300 font-medium';
  }

  // Active / Live / Nominal / Fixed / Verified
  if (['active', 'live', 'nominal', 'fixed', 'verified', 'published', 'online'].includes(s)) {
    return 'dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 bg-emerald-100 text-emerald-800 border border-emerald-300';
  }

  // Draft / Standard / Closed / Archived / Retired
  if (['draft', 'standard', 'closed', 'archived', 'retired', 'vaulted', 'moderate', 'minor'].includes(s)) {
    return 'dark:bg-ops-surface dark:text-ops-text-dim dark:border-ops-border bg-slate-100 text-slate-700 border border-slate-300';
  }

  // Mythic / Purple
  if (['mythic', 'legendary'].includes(s)) {
    return 'dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800 bg-purple-100 text-purple-800 border border-purple-300';
  }

  return 'bg-ops-surface text-ops-text-dim border border-ops-border';
});

const dotClasses = computed(() => {
  const s = props.status?.toLowerCase() || '';
  if (['most_important', 'critical_blocker', 'incident_active', 'degraded'].includes(s)) {
    return 'bg-purple-400 dark:bg-purple-300 animate-ping';
  }
  if (['very_high', 'major', 'offline', 'error'].includes(s)) {
    return 'bg-rose-500 animate-pulse';
  }
  if (['high', 'scheduled', 'in_review', 'flash_sale', 'investigating', 'warning', 'featured', 'high_load'].includes(s)) {
    return 'bg-amber-500 dark:bg-amber-400';
  }
  if (['active', 'live', 'nominal', 'fixed', 'verified', 'published', 'online'].includes(s)) {
    return 'bg-emerald-500 dark:bg-emerald-400 animate-pulse';
  }
  if (['mythic', 'legendary'].includes(s)) {
    return 'bg-purple-500 dark:bg-purple-400';
  }
  return 'bg-slate-400';
});
</script>
