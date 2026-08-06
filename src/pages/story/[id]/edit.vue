<template>
  <v-container>
    <StoryEntryWizard :existing-entry="story" v-if="story" />
  </v-container>
</template>

<script setup lang="ts">
  import { apiGetStoryById } from '@/plugins/api/story'
  import type { ViewStories } from '@/plugins/types/blog'

  const route = useRoute('/story/[id]/edit')

  const story = ref<ViewStories>()

  onMounted(() => {
    if (route.params.id) {
      apiGetStoryById(+route.params.id, result => {
        story.value = result
      })
    }
  })
</script>