<template>
  <v-card
    hover
    :to="`/story/${story.storyId}`"
    class="fill-height d-flex flex-column rounded-lg border border-opacity-25"
    elevation="2"
  >
    <v-card-item class="pt-4">
      <v-card-title class="text-h6 font-weight-bold lh-snug">
        {{ story.storyTitle }}
      </v-card-title>
    </v-card-item>

    <v-card-text class="flex-grow-1 text-body-2 text-medium-emphasis">
      <p class="line-clamp line-clamp-3">
        <Markdown class="mx-4 pt-8" :source="story.storyMarkdown" v-if="story.storyMarkdown" />
        <div v-html="story.storyContent" v-else />
      </p>

      <v-avatar-group
        hoverable
        gap="-30"
        :limit="5"
        size="64"
        :items="story.posts.map(p => {
          return {
            image: `${store.storeBaseUrl}image/${p.primaryImageId}/small`,
          }
        })"
      />
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-btn
        color="primary"
        variant="tonal"
        block
        rounded="md"
        :append-icon="mdiArrowRight"
        :to="`/story/${story.storyId}`"
      >
        Story lesen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import { type ViewStories } from '@/plugins/types/blog'
  import { coreStore } from '@/stores/app'
  import { mdiArrowRight } from '@mdi/js'

  const store = coreStore()

  const compProps = defineProps<{
    story: ViewStories
  }>()
</script>
