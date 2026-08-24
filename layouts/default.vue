<template>
  <div class="min-h-screen bg-ops-obsidian text-ops-text-bright flex flex-col font-sans">
    <!-- Top Command Strip -->
    <CommonHeaderCommandStrip />

    <!-- Split Pane Workspace -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Subsystem Nav (Rendered only when operator is authenticated) -->
      <CommonSidebarNav v-if="authStore.isAuthenticated" />

      <!-- Main Operational Viewport -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-ops-canvas">
        <slot />
      </main>
    </div>

    <!-- Global Toast Container -->
    <CommonToastContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useIssuesStore } from '~/stores/issues';
import { useEventsStore } from '~/stores/events';
import { useShopStore } from '~/stores/shop';
import { useServersStore } from '~/stores/servers';

const authStore = useAuthStore();
const issuesStore = useIssuesStore();
const eventsStore = useEventsStore();
const shopStore = useShopStore();
const serversStore = useServersStore();

onMounted(async () => {
  authStore.init();

  if (authStore.isAuthenticated) {
    // Validate session in background
    authStore.fetchCurrentUser();

    // Preload operational data across Domain 1 & Domain 2
    await Promise.all([
      issuesStore.fetchIssues(),
      eventsStore.fetchEvents(),
      shopStore.fetchShopItems(),
      serversStore.fetchServers(),
    ]);
  }
});
</script>
