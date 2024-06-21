<template>
  <div>
    <div :id="`map-${id}`" class="site-map" />

    <div v-if="site" ref="popupContent">
      <SiteCard :site="site" />
    </div>
  </div>
</template>

<script>
import SiteCard from '@/components/SiteCard'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { uuidv4 } from '@/mixins/util'

// Set the leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: {
    sites: {
      type: Array,
      default: () => []
    }
  },
  components: {
    SiteCard
  },
  data: function () {
    const id = uuidv4()
    return {
      id: id,
      site: null
    }
  },
  watch: {
    sites: function () {
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

      if (this.sites) {
        const latLngBounds = L.latLngBounds()
        this.sites.forEach(m => {
          const latLng = [m.latitude, m.longitude]
          const marker = L.marker(latLng).bindPopup('')
          marker.on('click', e => {
            const popup = e.target.getPopup()
            this.site = m
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

    if (this.sites) {
      this.update()
    }
  }
}
</script>

<style scoped>
.site-map {
  height: 90vh;
}
</style>
<style>
.site-map .leaflet-popup-content-wrapper {
  background: transparent;
  padding: 0;
  border-radius: 0;
}
.site-map .leaflet-popup-content {
  margin: 0;
  width: min(50vw, 600px) !important;
}
.site-map .leaflet-popup-content .v-btn {
  border-radius: 0;
}

.site-map .leaflet-container .leaflet-marker-pane img.marker-image {
  width: inherit;
}
.site-map .leaflet-div-icon {
  background: transparent;
  border: 0;
}
</style>
