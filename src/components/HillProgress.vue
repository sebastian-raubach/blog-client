<template>
  <div>
    <v-card
      class="mb-6"
    >
      <template #text>
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="7">
            <div class="d-flex align-center mb-2">
              <v-icon :icon="mdiMapCheck" size="52" color="primary" class="me-3" />
              <div>
                <h2 class="text-h5 mt-2 font-weight-bold">Wanderfortschritt pro Gipfeltyp</h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Fortschrittsverfolgung von offiziellen Gipfelklassifikationen
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5" class="d-flex align-center justify-md-end justify-center">
            <div class="d-flex align-center ga-4">
              <v-progress-circular
                :model-value="overallStats.overallPercentage"
                :size="70"
                :width="7"
                color="primary"
              >
                <span class="text-caption font-weight-bold">
                  {{ overallStats.overallPercentage }}%
                </span>
              </v-progress-circular>

              <div class="d-flex align-center flex-column">
                <div class="text-h6 font-weight-bold">
                  {{ overallStats.totalCompleted }}
                  <span class="text-body-2 text-medium-emphasis">
                    / {{ overallStats.totalPossible }} Total
                  </span>
                </div>
                <v-chip size="small" color="primary" variant="tonal">
                  Gesamtfortschritt
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </template>
    </v-card>

    <!-- Hill Grid Cards -->
    <v-row>
      <v-col
        v-for="hill in formattedHillData"
        :key="hill.type"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="d-flex"
      >
        <v-card h-100 class="d-flex flex-column flex-grow-1">
          <v-card-item>
            <template #prepend>
              <v-avatar :color="hill.color" size="40" variant="tonal">
                <v-icon :icon="hill.icon" />
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">
              {{ hill.title }}
            </v-card-title>
            <v-card-subtitle class="text-caption line-clamp line-clamp-3">
              {{ hill.description }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-2 flex-grow-1 d-flex flex-column justify-end">
            <div class="d-flex justify-space-between align-end mb-2">
              <div>
                <span class="text-h5 font-weight-bold">{{ hill.completed }}</span>
                <span v-if="hill.totalCount !== undefined" class="text-caption text-medium-emphasis ml-1">
                  / {{ hill.totalCount || '?' }}
                </span>
              </div>
              <v-chip
                v-if="hill.totalCount !== undefined"
                :color="hill.percentage === 100 ? 'success' : hill.color"
                size="small"
                variant="flat"
                class="font-weight-medium"
              >
                {{ hill.percentage }}%
              </v-chip>
              <v-chip v-else color="grey" size="small" variant="tonal">
                Unbekannt
              </v-chip>
            </div>

            <v-progress-linear
              v-if="hill.totalCount !== undefined"
              :model-value="hill.percentage"
              :color="hill.color"
              striped
              height="8"
              rounded
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { hillConfigs } from '@/plugins/constants';
  import { HillsType, type HillTypeCount } from '@/plugins/types/blog'
  import { mdiMapCheck } from '@mdi/js'

  const props = defineProps<{
    hillCounts: HillTypeCount[]
  }>()

  function calculatePercentage(completed: number, total: number | null): number {
    if (!total || total === 0) return 0
    return Math.min(Math.round((completed / total) * 100), 100)
  }

  const formattedHillData = computed(function () {
    const countMap = new Map<HillsType, number>(
      props.hillCounts.map(item => [item.type, item.count]),
    )

    // Iterating over Object.keys of HILL_METADATA avoids referencing HillsType directly in Object.values()
    const hillTypes = Object.keys(hillConfigs) as HillsType[]

    return hillTypes.map(function (type) {
      const meta = hillConfigs[type]
      const completed = countMap.get(type) ?? 0
      const percentage = calculatePercentage(completed, meta.totalCount || 0)

      return {
        type,
        ...meta,
        completed,
        percentage,
      }
    })
  })

  const overallStats = computed(function () {
    let totalCompleted = 0
    let totalPossible = 0

    formattedHillData.value.forEach(function (hill) {
      totalCompleted += hill.completed
      if (hill.totalCount !== null) {
        totalPossible += hill.totalCount || 0
      }
    })

    const overallPercentage = calculatePercentage(totalCompleted, totalPossible)

    return {
      totalCompleted,
      totalPossible,
      overallPercentage,
    }
  })
</script>