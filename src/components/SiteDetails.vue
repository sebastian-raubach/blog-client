<template>
  <div class="site-card flex-grow-1 d-flex flex-column" v-if="modelValue">
    <template v-if="isEdit">
      <v-text-field v-model="modelValue.name" label="Name" />
      <v-textarea v-model="modelValue.description" label="Beschreibung" :rows="2" />
    </template>
    <p class="line-clamp line-clamp-3" v-tooltip:top="modelValue.description" v-else>{{ modelValue.description }}</p>
    <v-row>
      <v-col v-if="modelValue.rating">
        <v-list slim :min-width="compact ? '150px' : '250px'">
          <v-list-item title="Standort" :prepend-icon="mdiMapMarker">
            <template #subtitle v-if="compact">
              <v-rating v-model="modelValue.rating.location" density="compact" size="x-small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
            <template #append v-else>
              <v-rating v-model="modelValue.rating.location" density="compact" size="small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
          </v-list-item>
          <v-list-item title="Aussicht" :prepend-icon="mdiBinoculars">
            <template #subtitle v-if="compact">
              <v-rating v-model="modelValue.rating.scenery" density="compact" size="x-small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
            <template #append v-else>
              <v-rating v-model="modelValue.rating.scenery" density="compact" size="small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
          </v-list-item>
          <v-list-item title="Ausstattung" :prepend-icon="mdiGreenhouse">
            <template #subtitle v-if="compact">
              <v-rating v-model="modelValue.rating.facilities" density="compact" size="x-small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
            <template #append v-else>
              <v-rating v-model="modelValue.rating.facilities" density="compact" size="small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
          </v-list-item>
          <v-list-item title="Preis" :prepend-icon="mdiCashMultiple">
            <template #subtitle v-if="compact">
              <v-rating v-model="modelValue.rating.price" density="compact" size="x-small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
            <template #append v-else>
              <v-rating v-model="modelValue.rating.price" density="compact" size="small" :readonly="!isEdit" :hover="isEdit" /> 
            </template>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col>
        <template v-if="isEdit">
          <v-select v-model="modelValue.sitetype" :items="Object.values(siteTypeConfigs)" label="Typ" :prepend-inner-icon="siteTypeConfigs[modelValue.sitetype].icon" />
          <v-select v-model="modelValue.groundtypes[0]" :items="Object.values(groundTypeConfigs)" label="Untergrund" :prepend-inner-icon="groundTypeConfigs[modelValue.groundtypes[0]].icon" />
        </template>
        <v-list slim :min-width="compact ? '150px' : '250px'" v-else>
          <v-list-item title="Typ" :subtitle="siteTypeConfigs[modelValue.sitetype].title" :prepend-icon="siteTypeConfigs[modelValue.sitetype].icon" />
          <v-list-item title="Untergrund" :subtitle="groundTypes" :prepend-icon="groundTypeConfigs[modelValue.groundtypes[0]].icon" v-if="modelValue.groundtypes" />
        </v-list>
      </v-col>
      <v-col v-if="modelValue.facilities">
        <div v-if="compact" class="d-flex flex-wrap ga-1" :style="{ minWidth: compact ? '150px' : '250px' }">
          <v-icon v-tooltip:top="'Duschen'" :icon="mdiShowerHead" :color="modelValue.facilities.showers ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.showers = !modelValue.facilities.showers) : undefined" />
          <v-icon v-tooltip:top="'Toiletten'" :icon="mdiPaperRoll" :color="modelValue.facilities.toilets ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.toilets = !modelValue.facilities.toilets) : undefined" />
          <v-icon v-tooltip:top="'Strom'" :icon="mdiPowerPlug" :color="modelValue.facilities.electricHookup ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.electricHookup = !modelValue.facilities.electricHookup) : undefined" />
          <v-icon v-tooltip:top="'Shop'" :icon="mdiStore" :color="modelValue.facilities.shop ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.shop = !modelValue.facilities.shop) : undefined" />
          <v-icon v-tooltip:top="'Restaurant'" :icon="mdiSilverwareForkKnife" :color="modelValue.facilities.restaurant ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.restaurant = !modelValue.facilities.restaurant) : undefined" />
          <v-icon v-tooltip:top="'Café'" :icon="mdiCoffee" :color="modelValue.facilities.cafe ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.cafe = !modelValue.facilities.cafe) : undefined" />
          <v-icon v-tooltip:top="'Hundespaziergang'" :icon="mdiDogSide" :color="modelValue.facilities.localDogWalk ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.localDogWalk = !modelValue.facilities.localDogWalk) : undefined" />
          <v-icon v-tooltip:top="'Internet'" :icon="mdiWifi" :color="modelValue.facilities.wifi ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.wifi = !modelValue.facilities.wifi) : undefined" />
        </div>
        <v-list slim :min-width="compact ? '150px' : '250px'" v-else>
          <v-list-item title="Duschen" :prepend-icon="mdiShowerHead" :append-icon="modelValue.facilities.showers ? mdiCheck : mdiClose" :base-color="modelValue.facilities.showers ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.showers = !modelValue.facilities.showers) : undefined" />
          <v-list-item title="Toiletten" :prepend-icon="mdiPaperRoll" :append-icon="modelValue.facilities.toilets ? mdiCheck : mdiClose" :base-color="modelValue.facilities.toilets ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.toilets = !modelValue.facilities.toilets) : undefined" />
          <v-list-item title="Strom" :prepend-icon="mdiPowerPlug" :append-icon="modelValue.facilities.electricHookup ? mdiCheck : mdiClose" :base-color="modelValue.facilities.electricHookup ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.electricHookup = !modelValue.facilities.electricHookup) : undefined" />
          <v-list-item title="Shop" :prepend-icon="mdiStore" :append-icon="modelValue.facilities.shop ? mdiCheck : mdiClose" :base-color="modelValue.facilities.shop ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.shop = !modelValue.facilities.shop) : undefined" />
          <v-list-item title="Restaurant" :prepend-icon="mdiSilverwareForkKnife" :append-icon="modelValue.facilities.restaurant ? mdiCheck : mdiClose" :base-color="modelValue.facilities.restaurant ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.restaurant = !modelValue.facilities.restaurant) : undefined" />
          <v-list-item title="Café" :prepend-icon="mdiCoffee" :append-icon="modelValue.facilities.cafe ? mdiCheck : mdiClose" :base-color="modelValue.facilities.cafe ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.cafe = !modelValue.facilities.cafe) : undefined" />
          <v-list-item title="Hundespaziergang" :prepend-icon="mdiDogSide" :append-icon="modelValue.facilities.localDogWalk ? mdiCheck : mdiClose" :base-color="modelValue.facilities.localDogWalk ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.localDogWalk = !modelValue.facilities.localDogWalk) : undefined" />
          <v-list-item title="Internet" :prepend-icon="mdiWifi" :append-icon="modelValue.facilities.wifi ? mdiCheck : mdiClose" :base-color="modelValue.facilities.wifi ? 'success' : 'error'" @click="isEdit ? (modelValue.facilities.wifi = !modelValue.facilities.wifi) : undefined" />
        </v-list>
      </v-col>
      <v-col v-if="!compact || isEdit">
        <v-list slim :min-width="compact ? '150px' : '250px'">
          <v-list-item title="Standort" :prepend-icon="mdiMap" />
          <MiniLocationMap v-model:lat="modelValue.latitude" v-model:lng="modelValue.longitude" :label="modelValue.name" :rounded="4" :zoom="7" :height="isEdit ? '50vh' : '25vh'" :is-editable="isEdit" />
        </v-list>
      </v-col>
    </v-row>

    <template v-if="modelValue.postIds && modelValue.postIds.length">
      <v-btn class="mt-5" :to="`/site/${modelValue.id}`" text="Besuche zu diesem Campingplatz" color="primary" :prepend-icon="mdiRvTruck">
        <template #append><v-chip size="x-small" :text="modelValue.postIds.length" /></template>
      </v-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { apiGetSiteById } from '@/plugins/api/site'
  import { groundTypeConfigs, siteTypeConfigs } from '@/plugins/constants'
  import { PostsitesGroundtype, SitesSitetype, type ViewSites } from '@/plugins/types/blog'
  import { mdiBinoculars, mdiCashMultiple, mdiCheck, mdiClose, mdiCoffee, mdiDogSide, mdiGreenhouse, mdiMap, mdiMapMarker, mdiPaperRoll, mdiPowerPlug, mdiRvTruck, mdiShowerHead, mdiSilverwareForkKnife, mdiStore, mdiWifi } from '@mdi/js'

  const groundTypes = computed(() => {
    if (modelValue.value?.groundtypes) {
      const set = new Set<string>()

      modelValue.value.groundtypes.forEach(gt => set.add(groundTypeConfigs[gt].title))

      return [...set].join(', ')
    } else {
      return 'N/A'
    }
  })

  const compProps = withDefaults(defineProps<{
    siteId?: number
    compact?: boolean
  }>(), {
    compact: false
  })

  const isEdit = computed(() => compProps.siteId === undefined)

  const modelValue = defineModel<ViewSites>()

  onMounted(() => {
    if (compProps.siteId) {
      apiGetSiteById(compProps.siteId, result => {
        modelValue.value = result
      })
    } else {
      modelValue.value = {
        name: '',
        description: '',
        sitetype: SitesSitetype.campsite,
        groundtypes: [PostsitesGroundtype.gravel],
        facilities: {
          cafe: false,
          electricHookup: false,
          localDogWalk: false,
          restaurant: false,
          shop: false,
          showers: false,
          toilets: false,
          wifi: false,
        },
        rating: {
          facilities: 3,
          location: 3,
          price: 3,
          scenery: 3,
        },
        createdOn: new Date().toISOString(),
      }
    }
  })
</script>

<style scoped>
.site-card :global(.v-list) {
  overflow-x: hidden;
}
</style>