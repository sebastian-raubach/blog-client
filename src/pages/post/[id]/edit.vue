<template>
  <v-container>
    <BlogEntryWizard :existing-entry="post" v-if="post" />
  </v-container>
</template>

<script setup lang="ts">
  import { apiGetPost } from '@/plugins/api/post'
  import type { ViewPosts } from '@/plugins/types/blog'

  const route = useRoute('/post/[id]/edit')

  const post = ref<ViewPosts>()

  onMounted(() => {
    if (route.params.id) {
      apiGetPost(+route.params.id, result => {
        post.value = result
      })
    }
  })
</script>