<template>
  <v-container fluid class="pa-0">
    <!-- Hero Banner Section -->
    <v-img
      src="@/assets/img/banner-news.jpg"
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
              <v-icon :icon="mdiNotebookMultiple" class="me-2" /> Berichte
            </h1>

            <p class="text-h6 text-sm-h5 text-grey-lighten-2 font-weight-light mb-8">
              Alle Berichte die wir über die Jahre erstellt haben.
            </p>
          </v-col>
        </v-row>
      </div>
    </v-img>

    <v-divider color="grey-lighten-2" />

    <v-container class="py-16">
      <v-btn v-if="store.storeToken" :prepend-icon="mdiNotebookPlus" to="/post/create" text="Neuen Bericht erstellen" class="mb-5" color="primary" />

      <v-row>
        <v-col>
          <v-select
            v-model="year"
            :items="years"
            label="Jahr"
            min-width="200px"
            hide-details
            :disabled="isSearching === true"
            :prepend-inner-icon="mdiCalendar"
            item-value="year"
            item-title="year"
          >
            <template #item="{ props, internalItem: item }">
              <v-list-item v-bind="props" :title="item.title">
                <template #append>
                  <v-chip class="ms-2" size="small" :text="`${item.raw.count}`" />
                </template>
              </v-list-item>
            </template>
          </v-select>    
        </v-col>
        <v-col>
          <v-text-field
            label="Suche"
            v-model="searchTerm"
            hide-details
            clearable
            min-width="200px"
            :prepend-inner-icon="mdiMagnify"
          />
        </v-col>
        <v-col>
          <v-btn-toggle
            v-model="postType"
            class="d-flex"
            :disabled="isSearching === true"
          >
            <v-btn class="flex-grow-1" :value="PostsType.hike" :text="postTypeConfigs[PostsType.hike].title" :prepend-icon="postTypeConfigs[PostsType.hike].icon" />
            <v-btn class="flex-grow-1" :value="PostsType.news" :text="postTypeConfigs[PostsType.news].title" :prepend-icon="postTypeConfigs[PostsType.news].icon" />
          </v-btn-toggle>
        </v-col>
      </v-row>

      <div class="d-flex align-center justify-space-between mb-8">
        <div>
          <h2 class="text-h4 font-weight-bold mb-1">
            Berichte <v-chip :text="filteredPosts.length" />
          </h2>
          <span class="text-subtitle-1 text-medium-emphasis">
            Alle Berichte die dem Filter entsprechen.
          </span>
        </div>
      </div>

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
import { apiGetPostYears, apiPostPosts } from '@/plugins/api/post'
import { postTypeConfigs } from '@/plugins/constants'
import { type YearCount, PostsType, type ViewPosts } from '@/plugins/types/blog'
import { coreStore } from '@/stores/app'
import { mdiCalendar, mdiMagnify, mdiNotebookMultiple, mdiNotebookPlus } from '@mdi/js'
import { refDebounced } from '@vueuse/core'

const store = coreStore()
const route = useRoute()
const router = useRouter()

const filteredPosts = ref<ViewPosts[]>([])
const years = ref<YearCount[]>([])

const year = ref<number | undefined>(new Date().getFullYear())
const searchTerm = ref<string>()
const postType = ref<PostsType>()

const isSearching = computed(() => Boolean(searchTerm.value && searchTerm.value.trim().length > 0))
const debouncedSearchTerm = refDebounced(searchTerm, 500)

interface QueryParams {
  year?: string
  search?: string
  type?: string
}

function fetchPosts() {
  apiPostPosts({
    page: 0,
    limit: MAX_JAVA_INTEGER,
    orderBy: 'postStartDate',
    ascending: 0,
    year: year.value,
    searchTerm: debouncedSearchTerm.value,
    postType: postType.value,
  }, result => {
    filteredPosts.value = result
  })
}

function fetchYears() {
  apiGetPostYears({
    postType: postType.value,
  }, result => {
    years.value = result

    if (result.length > 0) {
      if (!year.value || !result.some(r => r.year === year.value)) {
        year.value = result[0].year
      }
    }
  })
}

// 1. Handle state resets and post fetching together on debounced changes or filter updates
watch([debouncedSearchTerm, year, postType], ([newSearchTerm], [oldSearchTerm]) => {
  const hasSearchTerm = Boolean(newSearchTerm && newSearchTerm.trim().length > 0)

  // Only reset filters when the debounced search term actually toggles active/inactive
  if (hasSearchTerm && newSearchTerm !== oldSearchTerm) {
    year.value = undefined
    postType.value = undefined
  } else if (!hasSearchTerm && !year.value) {
    year.value = new Date().getFullYear()
  }

  // Update URL parameters
  const query = Object.assign({}, route.query) as QueryParams

  if (year.value) {
    query.year = `${year.value}`
  } else {
    delete query.year
  }
  if (hasSearchTerm) {
    query.search = newSearchTerm?.trim()
  } else {
    delete query.search
  }
  if (postType.value) {
    query.type = postType.value
  } else {
    delete query.type
  }

  // @ts-expect-error
  router.replace({ query })

  fetchPosts()
}, { immediate: true })

// 2. Fetch available years only when postType changes
watch(postType, () => {
  fetchYears()
}, { immediate: true })

onMounted(() => {
  if (route.query) {
    const params = route.query as QueryParams

    if (params.year) {
      year.value = +params.year
    }
    if (params.search) {
      searchTerm.value = params.search
    }
    if (params.type) {
      searchTerm.value = params.type
    }
  }
})
</script>
