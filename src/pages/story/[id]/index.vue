<template>
  <v-container fluid class="pa-0">
    <!-- Hero Banner Section -->
    <v-img
      src="@/assets/img/banner-stories.jpg"
      height="35vh"
      cover
      class="align-center text-white"
    >
      <div class="hero-scrim" />
      <!-- Dark Gradient Overlay for Typography Contrast -->
      <div class="fill-height d-flex align-center justify-center bg-gradient-to-t bg-black-opacity-50 px-4" style="position: relative; z-index: 1;">
        <v-row justify="center" align="center" class="text-center">
          <v-col cols="12" md="9" lg="7">
            <h1 class="text-h2 text-sm-h1 font-weight-black text-white mb-4 text-uppercase">
              <v-icon :icon="mdiBookOpenPageVariant" class="me-2" /> Berichte zur Story
            </h1>

            <v-chip :text="story?.storyTitle" v-if="story" color="primary" variant="elevated" size="large" />
          </v-col>
        </v-row>
      </div>
    </v-img>

    <v-divider color="grey-lighten-2" />

    <v-container class="py-16">
      <v-row>
        <v-col
          v-for="post in filteredPosts"
          :key="post.postId"
          cols="12"
          md="4"
        >
          <PostCard :post="post" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostPosts } from '@/plugins/api/post'
  import { apiGetStoryById } from '@/plugins/api/story'
  import type { ViewPosts, ViewStories } from '@/plugins/types/blog'
  import { mdiBookOpenPageVariant } from '@mdi/js'

  const route = useRoute('/story/[id]/')

  const filteredPosts = ref<ViewPosts[]>([])
  const story = ref<ViewStories>()

  function fetchPost () {
    if (story.value) {
      apiPostPosts({
        page: 0,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'postStartDate',
        ascending: 0,
        storyId: story.value.storyId,
      }, result => {
        filteredPosts.value = result
      })
    }
  }

  onMounted(() => {
    apiGetStoryById(+route.params.id, result => {
      story.value = result

      fetchPost()
    })
  })
</script>
