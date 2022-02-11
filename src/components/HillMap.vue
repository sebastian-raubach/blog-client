<template>
  <div>
    <div :id="`map-${id}`" class="map" />
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
require('leaflet.markercluster')

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
    const id = this.uuidv4()
    return {
      id: id
    }
  },
  computed: {
    hillIcons: function () {
      const result = {}

      Object.keys(this.hillTypes).forEach(k => {
        const hill = this.hillTypes[k]

        result[k] = L.divIcon({
          html: `<i class="text-primary ${hill.icon}"/>`,
          iconSize: hill.iconSize,
          iconAnchor: [hill.iconSize[0] / 2, hill.iconSize[1] / 2],
          popupAnchor: [0, -hill.iconSize[1] / 2]
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

      if (this.markerClusterer) {
        // If it exists, clear all layers
        this.markerClusterer.clearLayers()
      }

      if (this.hills) {
        const latLngBounds = L.latLngBounds()
        this.hills.forEach(m => {
          const latLng = [m.latitude, m.longitude]
          const marker = L.marker(latLng, { icon: this.hillIcons[m.type] })
          latLngBounds.extend(latLng)
          // marker.addTo(this.map)
          this.markerClusterer.addLayers(marker)
          marker.bindPopup(m.name)
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

    this.markerClusterer = L.markerClusterGroup({
      chunkedLoading: true
    })
    this.map.addLayer(this.markerClusterer)

    if (this.hills) {
      this.update()
    }
  }
}
</script>

<style scoped>
.map {
  height: 90vh;
}
</style>
<style>
.leaflet-div-icon {
  background: transparent;
  border: 0;
}
</style>
