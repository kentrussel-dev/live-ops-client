<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTheme } from '~/composables/useTheme';

const theme = useTheme();

onMounted(() => {
  theme.initTheme();
});
</script>
