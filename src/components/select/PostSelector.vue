<template>
  <v-autocomplete
    v-model="selectedPosts"
    v-model:search="search"
    :items="items"
    :loading="loading"
    item-value="postId"
    item-title="postTitle"
    label="Nach Bericht suchen"
    autocomplete="off"
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
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostPosts } from '@/plugins/api/post'
  import { postTypeConfigs } from '@/plugins/constants'
  import type { ViewPosts } from '@/plugins/types/blog'
  import { refDebounced } from '@vueuse/core'

  const props = defineProps<{
    postsToIgnore?: number[],
  }>()

  // 1. Where your selected value is stored
  const selectedPosts = defineModel<ViewPosts[]>()

  // 2. Where you populate the fetched items
  const items = ref<ViewPosts[]>([])

  // 3. Tracks what the user types into the input
  const search = ref('')

  // 4. Loading indicator state for the autocomplete component
  const loading = ref(false)

  const debouncedSearchTerm = refDebounced(search, 500)

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

      if (props.postsToIgnore) {
        const existing = new Set(props.postsToIgnore)
        items.value = result.data.filter(post => !existing.has(post.postId))
      } else {
        items.value = result.data
      }
    } finally {
      loading.value = false
    }
  }

  // Watch the search ref to trigger fetching (ideally debounced in production)
  watch(debouncedSearchTerm, newSearch => {
    handleSearch(newSearch)
  })
</script>