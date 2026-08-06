<template>
  <div class="hill-card" v-if="hill">
    <v-row>
      <v-col v-if="!compact">
        <v-list slim :min-width="compact ? '150px' : '250px'">
          <v-list-item title="Standort" :prepend-icon="mdiMap" />
          <MiniLocationMap v-model:lat="hill.hillLatitude" v-model:lng="hill.hillLongitude" :label="hill.hillName" :rounded="4" :zoom="7" height="25vh" />
        </v-list>
      </v-col>

      <v-col>
        <v-list slim :min-width="compact ? '150px' : '250px'">
          <v-list-item title="Typ" :subtitle="hillConfigs[hill.hillType].title" :prepend-icon="hillConfigs[hill.hillType].icon" />
          <v-list-item title="Höhe" :subtitle="`${hill.hillElevation.toFixed(0)} m`" :prepend-icon="mdiElevationRise" />
        </v-list>
      </v-col>
    </v-row>

    <template v-if="posts && posts.length">
      <v-btn class="mt-5" :to="`/hill/${hill.hillId}`" text="Aufstiege auf diesen Berg" color="primary" :prepend-icon="mdiRvTruck">
        <template #append><v-chip size="x-small" :text="posts.length" /></template>
      </v-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { apiGetHillById } from '@/plugins/api/hill'
  import { hillConfigs } from '@/plugins/constants'
  import type { ViewHills } from '@/plugins/types/blog'
  import { mdiElevationRise, mdiMap, mdiRvTruck } from '@mdi/js'

  const posts = computed(() => {
    return hill.value?.posts || []
  })

  const compProps = withDefaults(defineProps<{
    hillId: number
    compact?: boolean
  }>(), {
    compact: false
  })

  const hill = ref<ViewHills>()

  onMounted(() => {
    apiGetHillById(compProps.hillId, result => {
      hill.value = result
    })
  })
</script>

<style scoped>
.hill-card :global(.v-list) {
  overflow-x: hidden;
}
</style>