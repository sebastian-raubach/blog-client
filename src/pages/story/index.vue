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
              <v-icon :icon="mdiBookOpenVariant" class="me-2" /> Stories
            </h1>

            <p class="text-h6 text-sm-h5 text-grey-lighten-2 font-weight-light mb-8">
              Zusammenfassungen mehrerer Berichte und Wanderungen für Dinge wie Urlaube.
            </p>
          </v-col>
        </v-row>
      </div>
    </v-img>

    <v-divider color="grey-lighten-2" />

    <v-container class="py-16">
      <v-btn v-if="store.storeToken" :prepend-icon="mdiBookPlus" to="/story/create" text="Neue Story erstellen" class="mb-5" color="primary" />

      <v-row>
        <v-col
          v-for="story in stories"
          :key="story.storyId"
          cols="12"
          md="4"
        >
          <StoryCard :story="story" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
import { apiPostStories } from '@/plugins/api/story'
import { type ViewStories } from '@/plugins/types/blog'
import { coreStore } from '@/stores/app'
import { mdiBookOpenVariant, mdiBookPlus } from '@mdi/js'

const store = coreStore()

const stories = ref<ViewStories[]>([])

onMounted (() => {
  apiPostStories({
    page: 0,
    limit: MAX_JAVA_INTEGER,
    orderBy: 'storyStartDate',
    ascending: 0,
  }, result => {
    stories.value = result
  })
})
</script>
