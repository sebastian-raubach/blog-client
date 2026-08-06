<template>
  <v-container fluid class="pa-0">
    <!-- Hero Banner Section -->
    <v-img
      src="@/assets/img/banner-sites.jpg"
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
              <v-icon :icon="mdiRvTruck" class="me-2" /> Berichte mit Campingplatz
            </h1>

            <v-chip :text="site.name" v-if="site" :color="siteTypeConfigs[site.sitetype].color" variant="elevated" :prepend-icon="siteTypeConfigs[site.sitetype].icon" size="large" />
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
  import { apiGetSiteById } from '@/plugins/api/site'
  import { siteTypeConfigs } from '@/plugins/constants'
  import type { ViewPosts, ViewSites } from '@/plugins/types/blog'
  import { mdiRvTruck } from '@mdi/js'

  const route = useRoute('/site/[id]')

  const filteredPosts = ref<ViewPosts[]>([])
  const site = ref<ViewSites>()

  watchEffect(() => {
    if (site.value) {
      apiPostPosts({
        page: 0,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'postStartDate',
        ascending: 0,
        siteId: site.value.id,
      }, result => {
        filteredPosts.value = result
      })
    }
  })

  onMounted(() => {
    apiGetSiteById(+route.params.id, result => {
      site.value = result
    })
  })
</script>
