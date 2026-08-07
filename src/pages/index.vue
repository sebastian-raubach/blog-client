<template>
  <v-container fluid class="pa-0">
    <!-- Hero Banner Section -->
    <v-parallax
      :src="bannerImage"
      height="85vh"
      cover
      class="align-center text-white"
    >
      <div class="hero-scrim" />
      <!-- Dark Gradient Overlay for Typography Contrast -->
      <div class="fill-height d-flex align-center justify-center bg-gradient-to-t bg-black-opacity-50 px-4" style="position: relative; z-index: 1;">
        <v-row justify="center" align="center" class="text-center">
          <v-col cols="12" md="9" lg="7">
            <!-- Medium-Sized Logo Placeholder -->
            <div class="d-flex justify-center mb-10">
              <v-avatar size="220">
                <img src="@/assets/img/logo.svg" alt="Logo" class="w-100 h-100 object-cover" />
              </v-avatar>
            </div>

            <h1 class="text-h2 text-sm-h1 font-weight-black text-white mb-4 text-uppercase">
              Miri &amp; Baz in Schottland
            </h1>

            <p class="text-h6 text-sm-h5 text-grey-lighten-2 font-weight-light mb-8">
              Updates von Wanderberichten und sonstigen Neuigkeiten.
            </p>

            <v-btn
              color="primary"
              size="x-large"
              variant="elevated"
              rounded="pill"
              elevation="6"
              :to="{ hash: '#latest-adventures' }"
              :prepend-icon="mdiHiking"
            >
              Neueste Berichte
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-parallax>

    <!-- Introductory / About Section -->
    <v-container class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <v-icon :icon="mdiNotebookMultiple" size="48" color="primary" class="mb-4" />
          <h2 class="text-h4 font-weight-bold mb-4">
            Berichte
          </h2>
          <v-divider class="my-4 mx-auto border-opacity-50" color="primary" width="80" thickness="3" />
          <p class="text-body-1 text-medium-emphasis leading-relaxed">
            Sowohl für uns selber als auch für alle die es sonst interessiert dokumentieren wir gerne unsere Wanderberichte und sonstigen Ereignisse auf dieser Seite. Updates erscheinen immer dann, wenn etwas interessantes passiert ist und wir Zeit hatten darüber zu schreiben - manchmal häufiger, manchmal nur alle paar Monate.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <v-divider color="grey-lighten-2" />

    <!-- Latest Adventures Grid Section -->
    <v-container id="latest-adventures" class="py-16">
      <div class="d-flex justify-space-between mb-8 flex-wrap align-center">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h2 class="text-h4 font-weight-bold mb-1 pt-0 mt-0">
              Neueste Berichte
            </h2>
            <span class="text-subtitle-1 text-medium-emphasis">
              Unsere neusten Berichte - alles was in letzter Zeit passiert ist.
            </span>
          </div>
        </div>
        <v-btn to="/post" text="Alle Berichte anzeigen" class="my-2" :prepend-icon="mdiNotebookMultiple" color="primary" />
      </div>

      <v-row>
        <v-col
          v-for="post in latestPosts"
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
import { apiPostPosts } from '@/plugins/api/post'
import type { ViewPosts } from '@/plugins/types/blog'
import { mdiHiking, mdiNotebookMultiple } from '@mdi/js'

import one from '@/assets/img/banner-1.jpg'
import two from '@/assets/img/banner-2.jpg'
import three from '@/assets/img/banner-3.jpg'
import { coreStore } from '@/stores/app'

const images = [one, two, three]

const store = coreStore()
const latestPosts = ref<ViewPosts[]>([])

const bannerImage = computed(() => images[store.storeBannerIndex])

onMounted(() => {
  apiPostPosts({
    page: 0,
    limit: 12,
    orderBy: 'postStartDate',
    ascending: 0
  }, result => {
    latestPosts.value = result
  })
})
</script>
