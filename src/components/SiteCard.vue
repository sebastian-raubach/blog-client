<template>
  <b-card no-body class="hill h-100" v-if="site">
    <b-row no-gutters class="h-100">
      <b-col cols=12 md="3" class="d-flex align-items-center justify-content-center bg-dark">
        <CampsiteIcon class="camp-icon p-5 w-100 h-100 text-info" v-if="site.sitetype === 'campsite'" />
        <WildcampIcon class="camp-icon p-5 w-100 h-100 text-success" v-if="site.sitetype === 'wildcamp'" />
      </b-col>
      <b-col cols=12 md="9">
        <b-card-body class="d-flex flex-column justify-content-between h-100">
          <div>
            <b-card-title>{{ site.name }}</b-card-title>
            <b-card-text class="text-nowrap text-truncate mb-3" :title="site.description" v-if="site.description">{{ site.description }}</b-card-text>
          </div>
          <div>
            <b-row>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Typ</b-card-sub-title>
                <b-card-text class="mx-2">{{ siteTypes[site.sitetype] }}</b-card-text>
              </b-col>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Untergrund</b-card-sub-title>
                <b-card-text class="mx-2">{{ groundTypes[site.groundtype] }}</b-card-text>
              </b-col>
            </b-row>
            <hr class="mt-0" />
            <b-row>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Standort</b-card-sub-title>
                <b-card-text><b-form-rating variant="light" size="sm" :value="site.rating.location" readonly inline no-border /></b-card-text>
              </b-col>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Aussicht</b-card-sub-title>
                <b-card-text><b-form-rating variant="light" size="sm" :value="site.rating.scenery" readonly inline no-border /></b-card-text>
              </b-col>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Ausstattung</b-card-sub-title>
                <b-card-text><b-form-rating variant="light" size="sm" :value="site.rating.facilities" readonly inline no-border /></b-card-text>
              </b-col>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Preis</b-card-sub-title>
                <b-card-text><b-form-rating variant="light" size="sm" :value="site.rating.price" readonly inline no-border /></b-card-text>
              </b-col>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Annehmlichkeiten</b-card-sub-title>
                <b-card-text class="mx-2">
                  <ShowerIcon :class="`pr-2 ${site.facilities.showers ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Duschen'" />
                  <ToiletIcon :class="`pr-2 ${site.facilities.toilets ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Toiletten'" />
                  <ElectricHookupIcon :class="`pr-2 ${site.facilities.electricHookup ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Strom'" />
                  <ShopIcon :class="`pr-2 ${site.facilities.shop ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Shop'" />
                  <RestaurantIcon :class="`pr-2 ${site.facilities.restaurant ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Restaurant'" />
                  <CafeIcon :class="`pr-2 ${site.facilities.cafe ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Café'" />
                  <DogWalkIcon :class="`pr-2 ${site.facilities.localDogWalk ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Hundespaziergang'" />
                </b-card-text>
              </b-col>
              <b-col cols=12 xl=6 class="mb-2">
                <b-card-sub-title>Lage</b-card-sub-title>
                <b-card-text class="mx-2">
                  <i class="icofont icofont-google-map" /> <a :href="`https://geohack.toolforge.org/geohack.php?params=${site.latitude};${site.longitude}`">{{ site.latitude.toFixed(4) }}; {{ site.longitude.toFixed(4) }}</a>
                </b-card-text>
              </b-col>
            </b-row>
          </div>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import CampsiteIcon from '@/components/icons/CampsiteIcon'
import WildcampIcon from '@/components/icons/WildcampIcon'
import ShowerIcon from '@/components/icons/ShowerIcon'
import ToiletIcon from '@/components/icons/ToiletIcon'
import ShopIcon from '@/components/icons/ShopIcon'
import RestaurantIcon from '@/components/icons/RestaurantIcon'
import ElectricHookupIcon from '@/components/icons/ElectricHookupIcon'
import CafeIcon from '@/components/icons/CafeIcon'
import DogWalkIcon from '@/components/icons/DogWalkIcon'

export default {
  props: {
    site: {
      type: Object,
      default: () => null
    }
  },
  components: {
    CampsiteIcon,
    WildcampIcon,
    ShowerIcon,
    ToiletIcon,
    ShopIcon,
    RestaurantIcon,
    ElectricHookupIcon,
    CafeIcon,
    DogWalkIcon
  },
  computed: {
    groundTypes: function () {
      return {
        gravel: 'Kies',
        grass: 'Gras',
        paved: 'Befestigt',
        sand: 'Sand'
      }
    },
    siteTypes: function () {
      return {
        campsite: 'Campingplatz',
        wildcamp: 'Wild-Zelten'
      }
    }
  }
}
</script>
