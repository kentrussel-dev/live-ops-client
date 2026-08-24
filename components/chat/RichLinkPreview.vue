<template>
  <div v-if="preview" class="pt-1 max-w-sm">
    <a
      :href="preview.href"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-stretch rounded-lg border border-ops-border bg-ops-surface hover:border-ops-blue-glow hover:bg-ops-surface-hover transition-all shadow-xs overflow-hidden group/link no-underline text-left cursor-pointer"
      :title="`Open ${preview.href} in a new tab`"
    >
      <!-- Left Thumbnail / Service Icon -->
      <div
        :class="[
          'w-24 min-h-[76px] flex items-center justify-center p-3 shrink-0 border-r border-ops-border/60 transition',
          preview.type === 'meet' ? 'bg-amber-100/80 dark:bg-amber-950/40' :
          preview.type === 'zoom' ? 'bg-blue-100/80 dark:bg-blue-950/40' :
          preview.type === 'github' ? 'bg-slate-100 dark:bg-slate-900' :
          preview.type === 'figma' ? 'bg-purple-100/80 dark:bg-purple-950/40' :
          preview.type === 'youtube' ? 'bg-rose-100/80 dark:bg-rose-950/40' :
          'bg-ops-obsidian'
        ]"
      >
        <!-- Google Meet Icon (Matching Screenshot exactly) -->
        <div v-if="preview.type === 'meet'" class="relative flex items-center justify-center">
          <svg class="w-12 h-12 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
            <!-- Camera Body -->
            <rect x="6" y="14" width="34" height="36" rx="8" fill="#FBBF24" />
            <!-- Camera Lens Triangle -->
            <path d="M40 25.5L56 16.5V47.5L40 38.5V25.5Z" fill="#F59E0B" />
            <!-- Lens Flare / Circle -->
            <circle cx="16" cy="39" r="3.5" fill="#FFFFFF" />
          </svg>
        </div>

        <!-- Zoom Video Icon -->
        <div v-else-if="preview.type === 'zoom'" class="flex items-center justify-center">
          <svg class="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 5A2.5 2.5 0 002 7.5v9A2.5 2.5 0 004.5 19h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0013.5 5h-9zM17 9.5l5-3.5v12l-5-3.5v-5z"/>
          </svg>
        </div>

        <!-- GitHub Icon -->
        <div v-else-if="preview.type === 'github'" class="flex items-center justify-center text-ops-text-bright">
          <svg class="w-10 h-10 fill-current" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </div>

        <!-- Figma Icon -->
        <div v-else-if="preview.type === 'figma'" class="flex items-center justify-center">
          <svg class="w-10 h-10" viewBox="0 0 38 57" fill="none">
            <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
            <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
            <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
            <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
            <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
          </svg>
        </div>

        <!-- YouTube Icon -->
        <div v-else-if="preview.type === 'youtube'" class="flex items-center justify-center">
          <svg class="w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>

        <!-- General Web Link Icon -->
        <div v-else class="text-ops-blue-glow font-mono text-xl flex items-center justify-center">
          🌐
        </div>
      </div>

      <!-- Right Metadata Info Container -->
      <div class="p-3 flex-1 min-w-0 flex flex-col justify-center space-y-1 bg-ops-surface">
        <div class="text-xs font-semibold text-ops-blue-glow group-hover/link:underline truncate font-sans">
          {{ preview.title }}
        </div>
        <div class="text-3xs text-ops-text-dim line-clamp-2 leading-relaxed font-sans">
          {{ preview.description }}
        </div>
        <div class="text-3xs font-mono text-ops-text-dark truncate pt-0.5 flex items-center gap-1">
          <span>🔗</span>
          <span>{{ preview.hostname }}</span>
        </div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  url: string;
}>();

interface LinkMetadata {
  type: 'meet' | 'zoom' | 'github' | 'figma' | 'youtube' | 'docs' | 'generic';
  title: string;
  description: string;
  hostname: string;
  href: string;
}

const preview = computed<LinkMetadata | null>(() => {
  if (!props.url) return null;

  try {
    const rawUrl = props.url.trim();
    const href = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `https://${rawUrl}`;
    const parsed = new URL(href);
    const host = parsed.hostname.toLowerCase();

    // 1. Google Meet
    if (host.includes('meet.google.com')) {
      return {
        type: 'meet',
        title: 'Meet',
        description: 'Real-time meetings by Google. Using your browser, share your video, desktop, and presentations with teammates and customers.',
        hostname: 'meet.google.com',
        href,
      };
    }

    // 2. Zoom
    if (host.includes('zoom.us')) {
      return {
        type: 'zoom',
        title: 'Zoom Video Communications',
        description: 'Video Conferencing, Web Conferencing, Webinars, Screen Sharing, and Meeting Rooms.',
        hostname: 'zoom.us',
        href,
      };
    }

    // 3. GitHub
    if (host.includes('github.com')) {
      return {
        type: 'github',
        title: 'GitHub: Where the world builds software',
        description: 'GitHub is where over 100 million developers shape the future of software, together. Contribute to open source and manage Git repositories.',
        hostname: 'github.com',
        href,
      };
    }

    // 4. Figma
    if (host.includes('figma.com')) {
      return {
        type: 'figma',
        title: 'Figma Design Workspace',
        description: 'Figma is the leading collaborative design tool for building user interfaces, prototypes, and operational consoles.',
        hostname: 'figma.com',
        href,
      };
    }

    // 5. YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return {
        type: 'youtube',
        title: 'YouTube Video',
        description: 'Watch, stream, and collaborate on shared video recordings, release demos, and gameplay replays.',
        hostname: 'youtube.com',
        href,
      };
    }

    // 6. Google Docs
    if (host.includes('docs.google.com') || host.includes('drive.google.com')) {
      return {
        type: 'docs',
        title: 'Google Docs / Workspace',
        description: 'Create and collaborate on online documents in real-time and from any device with Google Workspace.',
        hostname: parsed.hostname,
        href,
      };
    }

    // 7. Generic URL fallback
    return {
      type: 'generic',
      title: parsed.hostname.replace('www.', ''),
      description: `External web resource (${parsed.pathname || '/'}). Click to open in a new browser tab.`,
      hostname: parsed.hostname,
      href,
    };
  } catch (err) {
    return null;
  }
});
</script>

