<script setup lang="ts">
import type { StoryEntryFormState } from '@/plugins/types/blog'

defineProps<{ form: StoryEntryFormState }>()
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <div>
      <div class="text-caption text-medium-emphasis mb-1">Title</div>
      <div class="text-h6">{{ form.title || '(untitled)' }}</div>
    </div>

    <div>
      <div class="text-caption text-medium-emphasis mb-1">Content preview</div>
      <v-card variant="outlined" class="pa-4">
        <Markdown :source="form.markdown" />
      </v-card>
    </div>

    <div v-if="form.posts.length">
      <div class="text-caption text-medium-emphasis mb-1">Posts <v-chip size="small" :text="form.posts.length" /></div>
      <v-chip-group column>
        <v-chip v-for="p in form.posts" :key="p.id" size="small">
          {{ p.title || 'Kein Titel' }}
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>
