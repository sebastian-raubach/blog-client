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
              <v-icon :icon="mdiRvTruck" class="me-2" /> Campingplätze
            </h1>

            <p class="text-h6 text-sm-h5 text-grey-lighten-2 font-weight-light mb-8">
              Eine Liste und Karte mit allen Campingplätzen die wir bisher besucht haben.
            </p>
          </v-col>
        </v-row>
      </div>
    </v-img>

    <v-divider color="grey-lighten-2" />

    <SiteMap :sites="sites" height="50vh" :rounded="0" />

    <v-container class="py-16">

      <v-row>
        <v-col
          v-for="site in sites"
          :key="site.id"
          class="d-flex flex-column"
          cols="12"
          sm="6"
          lg="4"
          xl="3"
        >
          <v-card :title="site.name" class="flex-grow-1 d-flex flex-column" :prepend-icon="siteTypeConfigs[site.sitetype].icon">
            <v-card-text class="flex-grow-1 d-flex flex-column">
              <SiteDetails :site-id="site.id" compact />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>      
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
  import { apiGetSites } from '@/plugins/api/site'
  import { siteTypeConfigs } from '@/plugins/constants'
  import type { ViewSites } from '@/plugins/types/blog'
  import { mdiRvTruck } from '@mdi/js'

  const sites = ref<ViewSites[]>()

  onMounted(() => {
    apiGetSites(result => {
      sites.value = result
    })
  })
</script>
