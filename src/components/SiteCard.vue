<template>
  <b-card no-body class="hill h-100" v-if="site">
    <b-row no-gutters class="h-100">
      <b-col cols="12" md="4" lg="3" class="d-flex align-items-center justify-content-center bg-dark site-icon">
        <CampsiteIcon class="camp-icon p-3 w-100 h-100 text-info" v-if="site.sitetype === 'campsite'" />
        <WildcampIcon class="camp-icon p-3 w-100 h-100 text-success" v-if="site.sitetype === 'wildcamp'" />
      </b-col>
      <b-col cols="12" md="8" lg="9">
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
                <template v-if="showGroundType">
                  <b-card-sub-title>Untergrund</b-card-sub-title>
                  <b-card-text class="mx-2">{{ groundTypes[site.groundtype] }}</b-card-text>
                </template>
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
                  <SvgIcon size="32" :path="mdiShowerHead" type="mdi" :class="`pr-2 ${site.facilities.showers ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Duschen'" />
                  <SvgIcon size="32" :path="mdiPaperRoll" type="mdi" :class="`pr-2 ${site.facilities.toilets ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Toiletten'" />
                  <SvgIcon size="32" :path="mdiPowerPlug" type="mdi" :class="`pr-2 ${site.facilities.electricHookup ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Strom'" />
                  <SvgIcon size="32" :path="mdiStore" type="mdi" :class="`pr-2 ${site.facilities.shop ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Shop'" />
                  <SvgIcon size="32" :path="mdiSilverwareForkKnife" type="mdi" :class="`pr-2 ${site.facilities.restaurant ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Restaurant'" />
                  <SvgIcon size="32" :path="mdiCoffee" type="mdi" :class="`pr-2 ${site.facilities.cafe ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Café'" />
                  <SvgIcon size="32" :path="mdiDogSide" type="mdi" :class="`pr-2 ${site.facilities.localDogWalk ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Hundespaziergang'" />
                  <SvgIcon size="32" :path="mdiWifi" type="mdi" :class="`pr-2 ${site.facilities.wifi ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Internet'" />
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
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiCoffee, mdiDogSide, mdiPaperRoll, mdiPowerPlug, mdiShowerHead, mdiSilverwareForkKnife, mdiStore, mdiWifi } from '@mdi/js'

export default {
  props: {
    site: {
      type: Object,
      default: () => null
    },
    showGroundType: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      mdiWifi,
      mdiDogSide,
      mdiCoffee,
      mdiSilverwareForkKnife,
      mdiStore,
      mdiPaperRoll,
      mdiShowerHead,
      mdiPowerPlug
    }
  },
  components: {
    SvgIcon,
    CampsiteIcon,
    WildcampIcon
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

<style scoped>
.site-icon svg {
  max-height: 200px;
}
</style>
