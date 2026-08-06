<template>
  <div class="d-flex flex-column ga-4">
    <PostSelector v-model="selectedPosts" :posts-to-ignore="currentPostIds" />

    <v-btn class="align-self-start" color="primary" @click="addPosts" :prepend-icon="mdiNotebookPlus" :disabled="!selectedPosts || selectedPosts.length === 0" text="Berichte hinzufügen" />

    <v-row v-if="posts.length">
      <v-col v-for="(post, index) in posts" :key="post.id" cols="12" sm="6" md="4">
        <v-card variant="tonal">
          <v-img :src="previewUrl(post)" height="160" cover />
          <v-card-text class="d-flex flex-column ga-2">
            {{ post.title }}
            <v-chip v-if="post.isNew" size="small" color="primary" variant="tonal" class="align-self-start" :prepend-icon="mdiNewBox">Neu</v-chip>
          </v-card-text>
          <v-card-actions v-if="post.isNew">
            <v-spacer />
            <v-btn variant="text" color="error" @click="removePost(post.id)">Entfernen</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-else type="info" variant="tonal" density="compact">Keine Berichte hinzufügt.</v-alert>

  </div>
</template>

<script setup lang="ts">
  import type { ViewPosts } from '@/plugins/types/blog'
  import type { LocalMiniPost } from '@/plugins/types/client'
  import { coreStore } from '@/stores/app'
  import { mdiNewBox, mdiNotebookPlus } from '@mdi/js'

  const posts = defineModel<LocalMiniPost[]>('posts', {
    default: () => [],
  })

  const store = coreStore()

  // 1. Where your selected value is stored
  const selectedPosts = ref<ViewPosts[]>([])

  const currentPostIds = computed(() => posts.value.map(p => p.id))

  function previewUrl(post: LocalMiniPost): string {
    if (post.primaryImageId) {
      return `${store.storeBaseUrl}image/${post.primaryImageId}/large/${post.primaryImagePath}`
    } else {
      return  ''
    }
  }

  function addPosts() {
    if (!selectedPosts.value || selectedPosts.value.length === 0) {
      return
    }
    const newPosts: LocalMiniPost[] = selectedPosts.value.map(p => {
      const images = p.images || []
      const primary = images.find(p => p.imageIsPrimary)
      return {
        id: p.postId,
        title: p.postTitle,
        primaryImageId: primary?.imageId,
        primaryImagePath: primary?.imagePath,
        type: p.postType,
        isNew: true,
      }
    })
    posts.value = [...posts.value, ...newPosts]
  }

  function removePost (id: number) {
    posts.value = posts.value.filter((p) => p.id !== id)
  }

  
</script>
