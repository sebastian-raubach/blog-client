<template>
  <div>
    <div :id="`map-${id}`" class="map" />
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/plugins/leaflet-distance-marker/index.js'
import '@/plugins/leaflet-distance-marker/style.css'
require('leaflet-gpx')
require('leaflet-geometryutil')

// Set the leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: {
    gpx: {
      type: String,
      default: null
    },
    additionalMarkers: {
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
  watch: {
    gpx: function (newValue) {
      this.update()
    },
    additionalMarkers: function (newValue) {
      this.update()
    }
  },
  methods: {
    update: function () {
      if (this.gpxLayer) {
        this.map.removeLayer(this.gpxLayer)
        this.gpxLayer = null
      }

      if (this.markers) {
        this.markers.forEach(m => this.map.removeLayer(m))
      }
      this.markers = []

      this.gpxLayer = new L.GPX(this.gpx, {
        async: true,
        polyline_options: {
          color: '#E74C3C',
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          smoothFactor: 1.0,
          distanceMarkers: { cssClass: 'dist-marker', iconSize: [14, 14] }
        },
        marker_options: {
          startIconUrl: './img/pin-icon-start.png',
          endIconUrl: './img/pin-icon-end.png',
          shadowUrl: './img/pin-shadow.png'
        }
      }).on('loaded', e => {
        this.map.fitBounds(L.latLngBounds(e.target.getBounds()))
      }).addTo(this.map)

      if (this.additionalMarkers) {
        this.additionalMarkers.forEach(m => {
          const marker = L.marker([m.latitude, m.longitude])
          marker.addTo(this.map)
          // TODO: Add more information to popup
          marker.bindPopup(m.name)
          this.markers.push(marker)
        })
      }
    }
  },
  mounted: function () {
    this.map = L.map(`map-${this.id}`).setView([51.505, -0.09], 13)

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

    if (this.gpx) {
      this.update()
    }
  }
}
</script>

<style scoped>
.map {
  height: 500px;
}
</style>
