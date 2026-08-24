<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
    <TransitionGroup
      enter-active-class="transform ease-out duration-200 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-start gap-3 p-3.5 rounded border shadow-xl bg-ops-surface/95 backdrop-blur font-sans text-xs',
          getBorderClass(toast.type)
        ]"
      >
        <div class="mt-0.5 shrink-0">
          <span v-if="toast.type === 'success'" class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span v-else-if="toast.type === 'error'" class="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span v-else-if="toast.type === 'warning'" class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span v-else class="inline-block w-2.5 h-2.5 rounded-full bg-blue-400" />
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-ops-text-bright tracking-tight">{{ toast.title }}</h4>
          <p v-if="toast.message" class="mt-0.5 text-ops-text-dim text-xs leading-relaxed break-words">
            {{ toast.message }}
          </p>
        </div>

        <button
          @click="remove(toast.id)"
          class="shrink-0 text-ops-text-dim hover:text-ops-text-bright p-1"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const { toasts, remove } = useToast();

function getBorderClass(type: string) {
  switch (type) {
    case 'success':
      return 'border-emerald-500/40 text-emerald-300';
    case 'error':
      return 'border-rose-500/50 text-rose-300';
    case 'warning':
      return 'border-amber-500/40 text-amber-300';
    default:
      return 'border-blue-500/40 text-blue-300';
  }
}
</script>
