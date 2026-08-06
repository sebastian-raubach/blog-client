<script setup lang="ts">
import { useGpx } from '@/plugins/composables/useGpx'
import type { GpxPayload } from '@/plugins/types/blog'
import { mdiMapMarkerPath } from '@mdi/js'

const model = defineModel<GpxPayload>()

const { processFile, isProcessing, error } = useGpx()

async function onFileSelected(file: File[] | File | null) {
  const selected = Array.isArray(file) ? file[0] : file
  if (!selected) {
    model.value = undefined
    return
  }
  const result = await processFile(selected)
  if (result) {
    model.value = result
  }
}

function clear() {
  model.value = undefined
}
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-file-input
      label="GPX-Datei"
      :prepend-inner-icon="mdiMapMarkerPath"
      prepend-icon=""
      accept=".gpx"
      :loading="isProcessing"
      @update:model-value="onFileSelected"
    />

    <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>

    <v-card v-if="modelValue" variant="outlined" class="pa-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <span class="text-subtitle-1">{{ modelValue.file.name }}</span>
        <v-btn size="small" variant="text" color="error" @click="clear">Entfernen</v-btn>
      </div>

      <v-row>
        <v-col cols="4">
          <div class="text-caption text-medium-emphasis">Distanz</div>
          <div class="text-h6">{{ modelValue.stats.distanceKm }} km</div>
        </v-col>
        <v-col cols="4">
          <div class="text-caption text-medium-emphasis">Anstieg</div>
          <div class="text-h6">{{ modelValue.stats.elevationGainM }} m</div>
        </v-col>
        <v-col cols="4">
          <div class="text-caption text-medium-emphasis">Dauer</div>
          <div class="text-h6">{{ modelValue.stats.durationMinutes }} min</div>
        </v-col>
      </v-row>

      <div class="text-caption text-medium-emphasis mt-3">
        Vereinfacht von {{ modelValue.stats.originalPointCount }} auf
        {{ modelValue.stats.minifiedPointCount }} Punkte
      </div>
    </v-card>

    <GpxMap :gpx="model.fileAsString" v-if="model?.fileAsString" :rounded="4" height="50vh" />
  </div>
</template>
