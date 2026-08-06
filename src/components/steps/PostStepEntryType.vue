<script setup lang="ts">
import { type Individuals, PostsType } from '@/plugins/types/blog'
import { postTypeConfigs } from '@/plugins/constants'
import { mdiCalendarEnd, mdiCalendarStart } from '@mdi/js'
import { useDate } from 'vuetify'
import { apiGetIndividuals } from '@/plugins/api/util'
import { coreStore } from '@/stores/app'

const type = defineModel<PostsType>('type', {
  default: PostsType.hike,
})
const start = defineModel<string>('start', {
  default: () => new Date().toISOString(),
})
const end = defineModel<string>('end')
const individuals = defineModel<number[]>('individuals', {
  default: () => [],
})

const store = coreStore()
const date = useDate()
const allIndividuals = ref<Individuals[]>([])

const allSelected = computed(() => {
  return individuals.value.length === allIndividuals.value.length
})
const someSelected = computed(() => {
  return individuals.value.length > 0
})
function toggle () {
  if (allSelected.value) {
    individuals.value = []
  } else {
    individuals.value = allIndividuals.value.slice().map(i => i.id)
  }
}

watch (type, async newValue => {
  if (newValue === PostsType.news) {
    individuals.value = []
  }
})

onMounted(() => {
  apiGetIndividuals(result => {
    allIndividuals.value = result
  })
})
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <p class="text-body-1">Was für ein Bericht soll erstellt werden?</p>

    <v-btn-toggle v-model="type" mandatory color="primary" class="d-flex" divided>
      <v-btn value="hike" class="flex-grow-1" size="large">
        <v-icon start :icon="postTypeConfigs.hike.icon" />
        {{ postTypeConfigs.hike.title }}
      </v-btn>
      <v-btn value="news" class="flex-grow-1" size="large">
        <v-icon start :icon="postTypeConfigs.news.icon" />
        {{ postTypeConfigs.news.title }}
      </v-btn>
    </v-btn-toggle>

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
        <v-col cols="12" md="6">
          <v-date-input
            :model-value="end ? date.toJsDate(end) : undefined"
            @update:model-value="v => { end = date.toISO(v) }"
            prepend-icon=""
            hide-details
            label="End-Datum"
            :prepend-inner-icon="mdiCalendarEnd"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            multiple
            v-model="individuals"
            :items="allIndividuals"
            item-value="id"
            item-title="name"
            :disabled="type === PostsType.news"
          >
            <template v-slot:prepend-item>
              <v-list-item
                title="Alle auswählen"
                @click="toggle"
              >
                <template v-slot:prepend>
                  <v-checkbox-btn
                    :color="someSelected ? 'primary' : undefined"
                    :indeterminate="someSelected && !allSelected"
                    :model-value="allSelected"
                  />
                </template>
              </v-list-item>

              <v-divider class="mt-2"></v-divider>
            </template>
            <template v-slot:item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :prepend-avatar="`${store.storeBaseUrl}individual/${item.id}/img`" />
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip :text="item.name" :prepend-avatar="`${store.storeBaseUrl}individual/${item.id}/img`" />
            </template>
          </v-select>
        </v-col>
      </v-row>
    </v-locale-provider>
  </div>
</template>
