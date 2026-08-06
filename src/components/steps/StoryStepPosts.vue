<template>
  <div class="d-flex flex-column ga-4">
    <v-autocomplete
      v-model="selectedPosts"
      v-model:search="search"
      :items="items"
      :loading="loading"
      item-value="postId"
      item-title="postTitle"
      label="Nach Bericht suchen"
      hide-details
      no-filter
      multiple
      return-object
      clearable
    >
      <template #selection="{ internalItem: item, index }">
        <v-chip size="small" v-if="index < 4" :text="item.title" />

        <span v-if="index === 4" class="text-grey text-body-small align-self-center">(+{{ (selectedPosts || []).length - 4 }} others)</span>
      </template>

      <template #item="{ internalItem: item, props: itemProps }">
        <v-list-item v-bind="itemProps">
          <template #prepend="{ isActive }">
            <v-list-item-action start>
              <v-checkbox-btn :model-value="isActive" />
            </v-list-item-action>
          </template>
          <template #title>
            <v-chip label size="small" :text="postTypeConfigs[item.raw.postType]?.title || ''" :prepend-icon="postTypeConfigs[item.raw.postType]?.icon || ''" :color="postTypeConfigs[item.raw.postType]?.color" /> {{ item.raw.postTitle }}
          </template>
          <template #append>
            {{ new Date(item.raw.postStartDate).toLocaleDateString() }}
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>

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
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostPosts } from '@/plugins/api/post'
  import { postTypeConfigs } from '@/plugins/constants'
  import type { ViewPosts } from '@/plugins/types/blog'
  import type { LocalMiniPost } from '@/plugins/types/client'
  import { coreStore } from '@/stores/app'
  import { mdiNewBox, mdiNotebookPlus } from '@mdi/js'
  import { refDebounced } from '@vueuse/core'

  const posts = defineModel<LocalMiniPost[]>('posts', {
    default: () => [],
  })

  const store = coreStore()

  // 1. Where your selected value is stored
  const selectedPosts = ref<ViewPosts[]>([])

  // 2. Where you populate the fetched items
  const items = ref<ViewPosts[]>([])

  // 3. Tracks what the user types into the input
  const search = ref('')

  // 4. Loading indicator state for the autocomplete component
  const loading = ref(false)

  const debouncedSearchTerm = refDebounced(search, 500)

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

  // Top-level function for fetching items
  async function handleSearch(query: string) {
    if (!query) {
      items.value = []
      return
    }

    loading.value = true

    try {
      const result = await apiPostPosts({
        page: 0,
        limit: MAX_JAVA_INTEGER,
        searchTerm: query,
        orderBy: 'postStartDate',
        ascending: 0,
      })

      const existing = new Set(posts.value.map(p => p.id))
      items.value = result.data.filter(post => !existing.has(post.postId))
      // .map(p => {
      //   const images = p.images || []
      //   const primaryImage = images.find(p => p.imageIsPrimary)

      //   return {
      //     id: p.postId,
      //     title: p.postTitle,
      //     primaryImageId: primaryImage?.imageId,
      //     primaryImagePath: primaryImage?.imagePath,
      //   }
      // })
    } finally {
      loading.value = false
    }
  }

  // Watch the search ref to trigger fetching (ideally debounced in production)
  watch(debouncedSearchTerm, newSearch => {
    handleSearch(newSearch)
  })
</script>
