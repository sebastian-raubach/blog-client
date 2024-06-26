<template>
  <div>
    <div :id="`map-${id}`" class="hill-map" />

    <div v-if="hill" ref="popupContent" class="p-3">
      <h4>{{ hill.name }}</h4>
      <h5><b-badge :style="`color: white; background-color: ${hillTypes[hill.type].color}`"><i class="icofont-google-map"/> {{ hill.type }}</b-badge></h5>

      <b-card class="my-2" v-for="post in hill.posts" :key="`hill-${hill.id}-post-${post.id}`">
        <h5>{{ post.title }}</h5>
        <h6 class="my-2"><b-badge>{{ new Date(post.createdOn).toLocaleDateString() }}</b-badge></h6>
        <router-link class="d-block text-white" :to="{ name: 'post-details', params: { postId: post.id } }">Bericht lesen</router-link>
      </b-card>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { uuidv4, hillTypes } from '@/mixins/util'

// Set the leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: {
    hills: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    const id = uuidv4()
    return {
      hillTypes,
      id: id,
      hill: null
    }
  },
  computed: {
    hillIcons: function () {
      const result = {}

      Object.keys(this.hillTypes).forEach(k => {
        const hill = this.hillTypes[k]

        result[k] = L.divIcon({
          html: `<i class="icofont-google-map icofont-3x" style="color: ${hill.color}"/>`,
          iconSize: [36, 40],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36]
        })
      })

      return result
    }
  },
  watch: {
    hills: function () {
      this.update()
    }
  },
  methods: {
    update: function () {
      if (this.markers) {
        this.markers.forEach(m => this.map.removeLayer(m))
      }
      this.markers = []

      this.markers.forEach(m => this.map.removeLayer(m))

      if (this.hills) {
        const latLngBounds = L.latLngBounds()
        this.hills.forEach(m => {
          const latLng = [m.latitude, m.longitude]
          const marker = L.marker(latLng, { icon: this.hillIcons[m.type] }).bindPopup('')
          marker.on('click', e => {
            const popup = e.target.getPopup()
            this.hill = m
            this.$nextTick(() => popup.setContent(this.$refs.popupContent))
          })
          latLngBounds.extend(latLng)
          marker.addTo(this.map)
          this.markers.push(marker)
        })
        if (latLngBounds.isValid()) {
          this.map.fitBounds(latLngBounds.pad(0.1))
        }
      }
    }
  },
  mounted: function () {
    this.map = L.map(`map-${this.id}`).setView([51.505, -0.09], 13)

    // Disable zoom until focus gained, disable when blur
    this.map.scrollWheelZoom.disable()
    this.map.on('focus', () => this.map.scrollWheelZoom.enable())
    this.map.on('blur', () => this.map.scrollWheelZoom.disable())

    const hikeMap = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=9335f6dc581e40438367362a59ee8ae8', {
      attribution: 'Maps &copy; <a href="http://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 18
    })
    const satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      id: 'Esri WorldImagery',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })

    hikeMap.addTo(this.map)

    const baseMaps = {
      'Hike Map': hikeMap,
      'Esri WorldImagery': satellite
    }

    L.control.layers(baseMaps).addTo(this.map)

    if (this.hills) {
      this.update()
    }
  }
}
</script>

<style scoped>
.hill-map {
  height: 90vh;
}
</style>
<style>
.hill-map .leaflet-popup-content-wrapper {
  padding: 0;
  border-radius: 0;
}
.hill-map .leaflet-popup-content {
  margin: 0;
  width: min(50vw, 300px) !important;
}
.hill-map .leaflet-popup-content .v-btn {
  border-radius: 0;
}

.hill-map .leaflet-container .leaflet-marker-pane img.marker-image {
  width: inherit;
}
.hill-map .leaflet-div-icon {
  background: transparent;
  border: 0;
}
</style>
