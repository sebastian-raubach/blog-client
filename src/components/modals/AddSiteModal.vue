<template>
  <b-modal ref="modal" size="xl" title="Standort hinzufügen" ok-title="Hinzufügen" cancel-title="Abbrechen" @ok.prevent="onSubmit">
    <b-form @submit.prevent="onSubmit" :validated="formValidated" v-if="post">
      <div class="my-5">
        <h4>Details</h4>
        <b-row>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="name" label="Name">
              <b-form-input required id="name" v-model="newSite.name" :state="formState.name" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="description" label="Beschreibung">
              <b-form-textarea required id="description" v-model="newSite.description" :state="formState.description" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="sitetype" label="Typ">
              <b-form-select :options="siteTypeOptions" required id="sitetype" v-model="newSite.sitetype" :state="formState.sitetype" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="groundtype" label="Untergrund">
              <b-form-select :options="groundTypeOptions" required id="groundtype" v-model="newSite.groundtype" :state="formState.groundtype" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-button @click="$refs.locationSelectorModal.show()">Standort angeben</b-button>

        <h4>Bewertung</h4>
        <b-row>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="location" label="Standort">
              <b-form-rating id="location" variant="warning" v-model="newSite.rating.location" required :state="formState.rating.location" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="scenery" label="Aussicht">
              <b-form-rating id="scenery" variant="warning" v-model="newSite.rating.scenery" required :state="formState.rating.scenery" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="facilities" label="Ausstattung">
              <b-form-rating id="facilities" variant="warning" v-model="newSite.rating.facilities" required :state="formState.rating.facilities" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3">
            <b-form-group label-for="price" label="Preis">
              <b-form-rating id="price" variant="warning" v-model="newSite.rating.price" required :state="formState.rating.price" />
            </b-form-group>
          </b-col>
        </b-row>

        <h4>Annehmlichkeiten</h4>
        <b-row>
          <b-col cols="12" md="6" lg="3" xl="2">
            <b-form-group label-for="showers" label="Duschen">
              <b-form-checkbox switch id="showers" v-model="newSite.facilities.showers" :state="formState.facilities.showers" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3" xl="2">
            <b-form-group label-for="toilets" label="Toiletten">
              <b-form-checkbox switch id="toilets" v-model="newSite.facilities.toilets" :state="formState.facilities.toilets" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3" xl="2">
            <b-form-group label-for="shop" label="Shop">
              <b-form-checkbox switch id="shop" v-model="newSite.facilities.shop" :state="formState.facilities.shop" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3" xl="2">
            <b-form-group label-for="restaurant" label="Restaurant">
              <b-form-checkbox switch id="restaurant" v-model="newSite.facilities.restaurant" :state="formState.facilities.restaurant" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3" xl="2">
            <b-form-group label-for="electricHookup" label="Strom">
              <b-form-checkbox switch id="electricHookup" v-model="newSite.facilities.electricHookup" :state="formState.facilities.electricHookup" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3" xl="2">
            <b-form-group label-for="cafe" label="Café">
              <b-form-checkbox switch id="cafe" v-model="newSite.facilities.cafe" :state="formState.facilities.cafe" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6" lg="3" xl="2">
            <b-form-group label-for="localDogWalk" label="Hundespaziergang">
              <b-form-checkbox switch id="localDogWalk" v-model="newSite.facilities.localDogWalk" :state="formState.facilities.localDogWalk" />
            </b-form-group>
          </b-col>
        </b-row>
      </div>
    </b-form>

    <GpsSelectorModal @location-changed="updateSiteLocation" :elevationRequired="false" ref="locationSelectorModal" />
  </b-modal>
</template>

<script>
import GpsSelectorModal from '@/components/modals/GpsSelectorModal'
import { apiPostSite } from '@/mixins/api'
const emitter = require('tiny-emitter/instance')

export default {
  components: {
    GpsSelectorModal
  },
  props: {
    post: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      siteTypeOptions: ['campsite', 'wildcamp'],
      groundTypeOptions: ['grass', 'gravel', 'paved', 'sand'],
      formValidated: false,
      formState: {
        name: null,
        description: null,
        sitetype: 'campsite',
        groundtype: 'grass',
        latitude: null,
        longitude: null,
        elevation: null,
        rating: {
          location: null,
          scenery: null,
          facilities: null,
          price: null
        },
        facilities: {
          cafe: null,
          shop: null,
          showers: null,
          toilets: null,
          restaurant: null,
          electricHookup: null,
          localDogWalk: null
        }
      },
      newSite: {
        name: null,
        description: null,
        sitetype: null,
        groundtype: null,
        latitude: null,
        longitude: null,
        elevation: null,
        rating: {
          location: null,
          scenery: null,
          facilities: null,
          price: null
        },
        facilities: {
          cafe: false,
          shop: false,
          showers: false,
          toilets: false,
          restaurant: false,
          electricHookup: false,
          localDogWalk: false
        }
      }
    }
  },
  methods: {
    updateSiteLocation: function (location) {
      this.newSite.latitude = location.latitude
      this.newSite.longitude = location.longitude
      this.newSite.elevation = location.elevation
    },
    isSet: function (variable) {
      return variable !== undefined && variable !== null && (((typeof variable) === 'string') ? variable.length > 0 : true)
    },
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        name: this.isSet(this.newSite.name),
        description: this.isSet(this.newSite.description),
        latitude: this.newSite.latitude !== undefined && this.newSite.latitude !== null,
        longitude: this.newSite.longitude !== undefined && this.newSite.longitude !== null,
        rating: {
          facilities: this.newSite.price !== undefined && this.newSite.price !== null,
          location: this.newSite.location !== undefined && this.newSite.location !== null,
          scenery: this.newSite.scenery !== undefined && this.newSite.scenery !== null,
          price: this.newSite.price !== undefined && this.newSite.price !== null
        },
        facilities: {
          cafe: this.newSite.facilities.cafe !== undefined && this.newSite.facilities.cafe !== null,
          shop: this.newSite.facilities.shop !== undefined && this.newSite.facilities.shop !== null,
          showers: this.newSite.facilities.showers !== undefined && this.newSite.facilities.showers !== null,
          toilets: this.newSite.facilities.toilets !== undefined && this.newSite.facilities.toilets !== null,
          restaurant: this.newSite.facilities.restaurant !== undefined && this.newSite.facilities.restaurant !== null,
          electricHookup: this.newSite.facilities.electricHookup !== undefined && this.newSite.facilities.electricHookup !== null,
          localDogWalk: this.newSite.facilities.localDogWalk !== undefined && this.newSite.facilities.localDogWalk !== null
        }
      }

      const result = Object.keys(this.formState).map(k => this.formState[k]).reduce((a, b) => a && b, true)

      if (!result) {
        console.log('something is wrong')
        return
      } else {
        console.log('all fine')
      }

      emitter.emit('set-loading', true)

      apiPostSite(this.post.id, this.newSite, result => {
        emitter.emit('set-loading', false)
        this.$emit('changed')
        this.hide()
      }, error => {
        emitter.emit('set-loading', false)
        console.error(error)
      })
    },
    show: function () {
      if (this.post) {
        this.newSite = {
          name: null,
          description: null,
          sitetype: 'campsite',
          groundtype: 'grass',
          latitude: null,
          longitude: null,
          elevation: null,
          rating: {
            location: null,
            scenery: null,
            facilities: null,
            price: null
          },
          facilities: {
            cafe: false,
            shop: false,
            showers: false,
            toilets: false,
            restaurant: false,
            electricHookup: false,
            localDogWalk: false
          }
        }
      }

      this.formValidated = null
      this.formState = {
        name: null,
        description: null,
        sitetype: null,
        groundtype: null,
        latitude: null,
        longitude: null,
        elevation: null,
        rating: {
          location: null,
          scenery: null,
          facilities: null,
          price: null
        },
        facilities: {
          cafe: null,
          shop: null,
          showers: null,
          toilets: null,
          restaurant: null,
          electricHookup: null,
          localDogWalk: null
        }
      }

      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    }
  }
}
</script>

<style>

</style>
