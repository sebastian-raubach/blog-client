<template>
  <v-container fluid class="pa-0">
    <!-- Hero Banner Section -->
    <v-img
      src="@/assets/img/banner-hiking.jpg"
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
              <v-icon :icon="mdiImageFilterHdr" class="me-2" /> Gipfel
            </h1>

            <p class="text-h6 text-sm-h5 text-grey-lighten-2 font-weight-light mb-8">
              Alle Gipfel die wir über die Jahre erklommen haben.
            </p>
          </v-col>
        </v-row>
      </div>
    </v-img>

    <v-divider color="grey-lighten-2" />

    <PeakMap :peaks="hills" height="50vh" :rounded="0" />

    <v-container class="py-16">
      <HillProgress :hill-counts="hillTypeCounts" v-if="hillTypeCounts" class="mb-10" />
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostHills, apiGetHillTypes } from '@/plugins/api/hill'
  import type { HillTypeCount, ViewHills } from '@/plugins/types/blog'
  import { mdiImageFilterHdr } from '@mdi/js'

  const hillTypeCounts = ref<HillTypeCount[]>()
  const hills = ref<ViewHills[]>()

  onMounted(() => {
    apiGetHillTypes(result => {
      hillTypeCounts.value = result
    })
    apiPostHills({
      page: 0,
      limit: MAX_JAVA_INTEGER,
    }, result => {
      hills.value = result
    })
  })
</script>
