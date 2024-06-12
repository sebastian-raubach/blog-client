<template>
  <b-modal ref="modal" title="Standortbestimmung" size="xl" @ok.prevent="onSubmit" @hidden="reset" ok-title="Auswählen" :ok-disabled="!enabled" @shown="initialize">
    <div id="map-gps-selector" class="map" ref="map" />
    <b-form @submit.prevent="onSubmit">
      <b-form-group label-for="latitude" label="Geographische Breite">
        <b-form-input type="number" v-model.number="latitude" />
      </b-form-group>
      <b-form-group label-for="longitude" label="Geographische Länge">
        <b-form-input type="number" v-model.number="longitude" />
      </b-form-group>
      <b-form-group label-for="elevation" label="Höhe">
        <b-form-input type="number" v-model.number="elevation" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Set the leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: {
    location: {
      type: Object,
      default: () => null
    },
    elevationRequired: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      latitude: null,
      longitude: null,
      elevation: null
    }
  },
  computed: {
    enabled: function () {
      return this.latitude !== null && this.longitude !== null && (!this.elevationRequired || this.elevation !== null)
    }
  },
  methods: {
    initialize: function () {
      this.map = L.map('map-gps-selector').setView([56.467561, -2.989912], 10)

      L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=9335f6dc581e40438367362a59ee8ae8', {
        attribution: 'Maps &copy; <a href="http://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 18
      }).addTo(this.map)

      if (this.location && this.location.latitude && this.location.longitude) {
        this.latitude = this.location.latitude
        this.longitude = this.location.longitude
        this.elevation = this.location.elevation
      }

      if (this.latitude !== null && this.longitude !== null) {
        this.marker = L.marker([this.latitude, this.longitude])
        this.marker.addTo(this.map)
      }

      this.map.on('click', e => {
        this.latitude = e.latlng.lat
        this.longitude = e.latlng.lng

        if (this.marker) {
          this.map.removeLayer(this.marker)
        }

        this.marker = L.marker([this.latitude, this.longitude])
        this.marker.addTo(this.map)
      })
    },
    reset: function () {
      this.latitude = null
      this.longitude = null
      this.elevation = null
    },
    show: function () {
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    onSubmit: function () {
      this.$emit('location-changed', {
        longitude: this.longitude,
        latitude: this.latitude,
        elevation: this.elevation
      })

      this.$nextTick(() => this.hide())
    }
  }
}
</script>

<style scoped>
.map {
  height: 500px;
}
.map:hover {
  cursor: crosshair;
}
</style>
