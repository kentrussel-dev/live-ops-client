<template>
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="text-xs font-mono text-ops-text-dim flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-ops-blue animate-ping" />
      <span>Redirecting to Projects & Kanban...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
navigateTo('/projects', { replace: true });
</script>
