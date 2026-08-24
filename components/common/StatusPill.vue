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

  // Active / Live / Nominal / Fixed / Verified
  if (['active', 'live', 'nominal', 'fixed', 'verified', 'published'].includes(s)) {
    return 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60';
  }

  // Scheduled / In Review / Flash Sale / Investigating
  if (['scheduled', 'in_review', 'flash_sale', 'investigating', 'warning', 'featured'].includes(s)) {
    return 'bg-amber-950/60 text-amber-300 border border-amber-800/60';
  }

  // Critical / Paused / Cancelled / Degraded / Incident / Blocker
  if (['paused', 'cancelled', 'critical_blocker', 'major', 'incident_active', 'degraded', 'offline', 'error'].includes(s)) {
    return 'bg-rose-950/60 text-rose-300 border border-rose-800/60';
  }

  // Draft / Standard / Closed / Archived / Retired
  if (['draft', 'standard', 'closed', 'archived', 'retired', 'vaulted'].includes(s)) {
    return 'bg-slate-900 text-slate-400 border border-slate-700/60';
  }

  // Mythic / Purple
  if (['mythic', 'legendary'].includes(s)) {
    return 'bg-purple-950/60 text-purple-300 border border-purple-800/60';
  }

  return 'bg-ops-surface text-ops-text-dim border border-ops-border';
});

const dotClasses = computed(() => {
  const s = props.status?.toLowerCase() || '';
  if (['active', 'live', 'nominal', 'fixed', 'verified', 'published'].includes(s)) {
    return 'bg-emerald-400 animate-pulse';
  }
  if (['scheduled', 'in_review', 'flash_sale', 'investigating', 'warning', 'featured'].includes(s)) {
    return 'bg-amber-400';
  }
  if (['paused', 'cancelled', 'critical_blocker', 'major', 'incident_active', 'degraded', 'offline', 'error'].includes(s)) {
    return 'bg-rose-500 animate-ping';
  }
  if (['mythic', 'legendary'].includes(s)) {
    return 'bg-purple-400';
  }
  return 'bg-slate-500';
});
</script>
