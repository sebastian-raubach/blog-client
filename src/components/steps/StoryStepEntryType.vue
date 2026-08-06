<script setup lang="ts">
import { mdiCalendarStart } from '@mdi/js'
import { useDate } from 'vuetify'

const start = defineModel<string>('start', {
  default: () => new Date().toISOString(),
})

const date = useDate()
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-locale-provider locale="en-GB">
      <v-row>
        <v-col cols="12" md="6">
          <v-date-input
            :model-value="start ? date.toJsDate(start) : undefined"
            @update:model-value="v => { start = date.toISO(v) }"
            prepend-icon=""
            hide-details
            label="Start-Datum"
            :prepend-inner-icon="mdiCalendarStart"
          />
        </v-col>
      </v-row>
    </v-locale-provider>
  </div>
</template>
