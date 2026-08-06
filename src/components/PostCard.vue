<template>
  <v-card
    hover
    :to="`/post/${post.postId}`"
    :class="`fill-height d-flex flex-column rounded-lg border border-opacity-25 ${inactive ? 'grayscale-card' : ''}`"
    elevation="2"
  >
    <v-img
      :src="`${store.storeBaseUrl}image/${getPrimaryImage(post.images || [])?.imageId}/small`"
      height="220"
      max-height="220"
      cover
      class="align-top"
      v-if="!minimal"
    >
      <div class="pa-4 d-flex justify-end">
        <v-chip
          :color="postTypeConfigs[post.postType].color"
          variant="flat"
          size="small"
          label
          :prepend-icon="postTypeConfigs[post.postType].icon"
        >
          {{ postTypeConfigs[post.postType].title }}
        </v-chip>
      </div>
    </v-img>

    <v-card-item class="pt-4">
      <!-- <div class="text-caption text-medium-emphasis mb-1">
        <v-icon :icon="mdiMapMarkerOutline" size="small" class="me-1" />
        {{ post.location }}
      </div> -->
      <template #prepend v-if="minimal">
        <v-avatar size="48" :image="`${store.storeBaseUrl}image/${getPrimaryImage(post.images || [])?.imageId}/small`" />
      </template>
      <v-card-title class="text-h6 font-weight-bold lh-snug">
        {{ post.postTitle }}
      </v-card-title>
    </v-card-item>

    <v-card-text class="flex-grow-1 text-body-2 text-medium-emphasis">
      <p :class="`mt-0 line-clamp ${minimal ? 'line-clamp-1' : 'line-clamp-3'}`">
        <Markdown :source="post.postMarkdown" v-if="post.postMarkdown" />
        <div v-html="post.postContent" v-else />
      </p>

      <div class="d-flex flex-wrap ga-4 mt-2 pt-2 border-t text-caption font-weight-medium">
        <template v-if="post.postType === PostsType.hike">
          <div v-if="duration">
            <v-icon :icon="mdiClockOutline" size="small" class="me-1" />
            {{ duration }}
          </div>
          <div>
            <v-icon :icon="mdiImageFilterHdr" size="small" class="me-1" />
            {{ post.hikestats.ascent.toFixed(0) }} m
          </div>
          <div>
            <v-icon :icon="mdiMapMarkerDistance" size="small" class="me-1" />
            {{ post.hikestats.distance.toFixed(0) }} km
          </div>
        </template>
        <div v-else-if="dateSpan">
          <v-icon :icon="mdiCalendarExpandHorizontalOutline" size="small" class="me-1" />
          {{ dateSpan }}
        </div>
        <div class="ms-auto text-grey">
          {{ date }}
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-btn
        color="primary"
        variant="tonal"
        block
        rounded="md"
        :append-icon="mdiArrowRight"
        :to="`/post/${post.postId}`"
      >
        Bericht lesen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import { postTypeConfigs } from '@/plugins/constants'
  import { PostsType, type ViewPosts } from '@/plugins/types/blog'
  import { formatMinutesToDHM, getPrimaryImage, pad } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiArrowRight, mdiCalendarExpandHorizontalOutline, mdiClockOutline, mdiImageFilterHdr, mdiMapMarker, mdiMapMarkerDistance } from '@mdi/js'

  const store = coreStore()

  const compProps = withDefaults(defineProps<{
    post: ViewPosts
    inactive?: boolean
    minimal?: boolean
  }>(), {
    inactive: false,
    minimal: false,
  })

  const duration = computed(() => {
    const minutes = compProps.post.hikestats?.duration || 0

    if (minutes < 1) {
      return undefined
    }

    const { d, h, m } = formatMinutesToDHM(minutes)

    return `${h}:${pad(m)} Stunden`
  })

  const dateSpan = computed(() => {
    if (compProps.post.postStartDate && compProps.post.postEndDate) {
      const count = Math.round((new Date(compProps.post.postEndDate).getTime() - new Date(compProps.post.postStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      return count === 1 ? '1 Tag' : `${count} Tage`
    } else {
      return '1 Tag'
    }
  })

  const date = computed(() => {
    return new Date(compProps.post.postStartDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  })
</script>

<style scoped>
.grayscale-card {
  filter: grayscale(100%);
}
</style>
