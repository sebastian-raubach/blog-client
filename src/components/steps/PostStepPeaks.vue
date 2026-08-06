<template>
  <div class="d-flex flex-column ga-4">
    <v-row>
      <v-col cols="12" md="4">
        <h4>Aussicht</h4>
        <v-rating
          v-model="ratingsModel.view"
          :length="5"
          hover
          :item-labels="['Schlecht', '', '', '', 'Gut']"
          item-label-position="bottom"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="4">
        <h4>Pfad</h4>
        <v-rating
          v-model="ratingsModel.path"
          :length="5"
          hover
          :item-labels="['Schlecht', '', '', '', 'Gut']"
          item-label-position="bottom"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="4">
        <h4>Wetter</h4>
        <v-rating
          v-model="ratingsModel.weather"
          :length="5"
          hover
          :item-labels="['Schlecht', '', '', '', 'Gut']"
          item-label-position="bottom"
          hide-details
        />
      </v-col>
    </v-row>

    <p class="text-body-2 text-medium-emphasis">
      Klicke auf die Karte um einen neuen Gipfel hinzuzufügen.
    </p>

    <v-autocomplete
      :items="existingHills"
      :item-title="peak => `${peak.hillName} | ${peak.hillElevation.toFixed(0)} m`"
      @update:model-value="addPeak"
      return-object
      autocomplete="off"
    />

    <GpxMap
      :rounded="4"
      height="60vh"
      interactive
      :peaks="hillsModel"
      :click-handler="handleClick"
      ref="gpxMap"
    />

    <v-list v-if="hillsModel.length" density="compact" lines="one" slim>
      <v-list-item v-for="peak in hillsModel" :key="peak.hillId" :title="peak.hillName" :prepend-icon="hillConfigs[peak.hillType].icon">
        <template #subtitle>
          <span class="d-flex flex-row align-center ga-5">
            <div class="line-clamp line-clamp-3">
              <div>{{ hillConfigs[peak.hillType].title }}</div>
              <div>{{ `${peak.hillElevation} m` }}</div>
            </div>
            <v-switch v-model="peak.hillSuccessful" :true-value="1" :false-value="0" hide-details label="Erfolgreich?" color="primary" />
          </span>
        </template>
        <template #append>
          <v-btn :icon="mdiDelete" size="small" variant="text" color="error" @click="removePeak(peak.hillId || -1)" />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialogOpen" max-width="400">
      <v-card>
        <v-card-title>Neuer Gipfel</v-card-title>
        <v-card-text class="d-flex flex-column ga-4">
          <v-text-field v-model="peakName" hide-details label="Gipfelname" autofocus />
          <v-number-input v-model="peakElevation" hide-details label="Höhe (m)" />
          <v-select
            v-model="peakType"
            :items="Object.keys(hillConfigs)"
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!peakName.trim() || peakElevation === undefined" @click="confirmPeak">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup lang="ts">
import { type Hikeratings, HillsType, type ViewHills, type PostHill } from '@/plugins/types/blog'
import { mdiDelete } from '@mdi/js'
import { hillConfigs } from '@/plugins/constants'
import { apiPostHills } from '@/plugins/api/hill'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

const hillsModel = defineModel<PostHill[]>('hills', {
  default: () => [],
})
const ratingsModel = defineModel<Hikeratings>('ratings', {
  default: () => {
    return {
      view: 3,
      path: 3,
      weather: 3,
    }
  }
})

const gpxMap = useTemplateRef('gpxMap')

const existingHills = ref<ViewHills[]>([])

const dialogOpen = ref(false)
const pendingLatLng = ref<{ lat: number; lng: number } | null>()
const peakName = ref('')
const peakElevation = ref<number>()
const peakType = ref<HillsType>(HillsType.munro)
let peakCounter = 1

onMounted(() => {
  apiPostHills({
    page: 0,
    limit: MAX_JAVA_INTEGER,
  }, result => {
    existingHills.value = result.sort((a, b) => a.hillName.localeCompare(b.hillName))
  })
})

function confirmPeak() {
  if (!pendingLatLng.value || !peakName.value.trim()) return
  const newPeak: PostHill = {
    hillId: -(peakCounter++),
    hillName: peakName.value.trim(),
    hillType: peakType.value,
    hillElevation: peakElevation.value ?? 0,
    hillLatitude: pendingLatLng.value.lat,
    hillLongitude: pendingLatLng.value.lng,
    hillSuccessful: 1,
  }
  hillsModel.value.push(newPeak)
  dialogOpen.value = false
}

function removePeak(id: number) {
  hillsModel.value = hillsModel.value.filter((p) => p.hillId !== id)
}

function addPeak (peak: ViewHills | null) {
  if (peak) {
    hillsModel.value.push({
      hillId: peak.hillId,
      hillName: peak.hillName,
      hillType: peak.hillType,
      hillElevation: peak.hillElevation,
      hillLatitude: peak.hillLatitude,
      hillLongitude: peak.hillLongitude,
      hillSuccessful: 1,
    })
  }
}

function handleClick (lat: number, lng: number) {
  pendingLatLng.value = { lat, lng }
  peakName.value = ''
  peakElevation.value = undefined
  peakType.value = HillsType.munro
  dialogOpen.value = true
}

function invalidateMap () {
  gpxMap.value?.invalidateMap()
}

defineExpose({
  invalidateMap,
})
</script>
