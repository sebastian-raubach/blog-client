<template>
  <div class="site-map mx-auto" :style="{ height: mapHeight, borderRadius: `${rounded}px`, maxWidth: maxWidth }">
    <div ref="mapEl" class="site-map__canvas" />

    <div v-if="label" class="site-map__label">
      <span class="site-map__label-text">{{ label }}</span>
    </div>
    <v-bottom-sheet
      v-model="bottomSheet"
      :inset="lgAndUp"
      max-height="50vh"
      width="auto"
      v-if="selectedSite"
    >
      <v-card class="pb-10">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="me-3" :icon="siteTypeConfigs[selectedSite.sitetype].icon" />
            <div>{{ selectedSite.name }}</div>
          </div>
          <v-btn :icon="mdiClose" variant="text" @click="bottomSheet = false" />
        </v-card-title>
        
        <v-card-text>
          <SiteDetails :site-id="selectedSite.id" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
/**
 * GpxMap
 * A minimal Leaflet map for displaying one or more GPX tracks (typically a
 * hike, or a multi-day trek split into several <trk> elements). Visually
 * paired with LocationMap: same chip/label language, same quiet chrome,
 * same light/dark CartoDB basemaps.
 *
 * Usage:
 *   <GpxMap :gpx="gpxFileContents" label="Tour du Mont Blanc" />
 *   <GpxMap src="/tracks/ridge-walk.gpx" dark units="imperial" />
 */
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { ViewSites } from '@/plugins/types/blog'
import { siteTypeConfigs } from '@/plugins/constants'
import { useDisplay } from 'vuetify'
import { mdiClose } from '@mdi/js'

interface Props {
  /** Optional caption chip, e.g. an overall trip name */
  label?: string
  /** CSS height of the component */
  height?: string
  /** Corner radius in px */
  rounded?: number
  /** Disable pan/zoom for a static, decorative look */
  interactive?: boolean
  /** Maximum width of the map element */
  maxWidth?: string
  /** Named points of interest to highlight along the track, e.g. summits */
  sites?: ViewSites[]
  /** Show site names as permanent labels rather than only on hover */
  showSiteLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  height: '220px',
  rounded: 16,
  interactive: true,
  sites: () => [],
  showSiteLabels: true,
})

const emit = defineEmits<{
  loaded: [
    stats: { name: string; distanceKm: number; elevationGainM: number; elevationLossM: number }[]
  ]
  error: [message: string]
}>()

const { lgAndUp } = useDisplay()
const bottomSheet = ref(false)
const selectedSite = ref<ViewSites>()

const mapEl = ref<HTMLDivElement | null>(null)
const mapHeight = props.height

let map: L.Map | null = null
let layerGroup: L.LayerGroup | null = null

/** Small triangular "summit" glyph, anchored at its base so the tip sits above the exact point. */
function buildSiteIcon(color: string) {
  return L.divIcon({
    className: 'site-map__site',
    html: `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="10" fill="${color}" stroke="#ffffff" stroke-width="2" />
      <path d="M11 5.5L17 16H5Z" fill="#ffffff" />
      <path d="M11 10.2L13.6 16H8.4Z" fill="${color}" />
    </svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function render() {
  if (!map) return
  layerGroup?.clearLayers()
  layerGroup = L.layerGroup().addTo(map)

  const bounds: L.LatLngExpression[] = []

  if (props.sites?.length) {
    props.sites.forEach((site) => {
      if (site.latitude !== undefined && site.longitude !== undefined) {
        bounds.push([site.latitude, site.longitude] as L.LatLngExpression)
        const siteMarker = L.marker([site.latitude, site.longitude], {
          icon: buildSiteIcon(siteTypeConfigs[site.sitetype].color),
          zIndexOffset: 400,
        }).addTo(layerGroup!)
        siteMarker.on('click', () => {
          selectedSite.value = site

          nextTick(() => {
            bottomSheet.value = true
          })
        })
  
        const labelText = `${site.name} · ${siteTypeConfigs[site.sitetype].title}`
        siteMarker.bindTooltip(labelText, {
          // permanent: props.showsiteLabels,
          direction: 'top',
          offset: [0, -10],
          className: 'site-map__site-tooltip',
          opacity: 1,
        })
      }
    })
  }

  if (bounds.length) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [24, 24] })
  }
}

function addTileLayer() {
  if (!map) return
  L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=9335f6dc581e40438367362a59ee8ae8', {
    attribution: 'Maps &copy; <a href="http://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    maxZoom: 19,
  }).addTo(map)
}

function initMap() {
  if (!mapEl.value) return
  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: false,
    dragging: props.interactive,
    // scrollWheelZoom: props.interactive,
    scrollWheelZoom: false,
    doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
    boxZoom: false,
    keyboard: false,
  })
  map.setView([56.458415, -2.974876], 10)

  addTileLayer()

  if (props.interactive) {
    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }
  L.control
    .attribution({ position: 'bottomleft', prefix: false })
    .addTo(map)
}

watch(() => props.sites, render)

onMounted(() => {
  initMap()
})
onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.site-map {
  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.08);
  background: #eef1f4;
}

.site-map__canvas {
  width: 100%;
  height: 100%;
}

/* Site markers */
:global(.site-map__site) {
  filter: drop-shadow(0 1px 1px rgba(15, 23, 42, 0.25));
}
:global(.site-map__site-tooltip) {
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(4px);
  border: none !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.14) !important;
  border-radius: 999px !important;
  padding: 3px 9px !important;
  font-size: 11px !important;
  font-weight: 500;
  color: #1e2733;
}
:global(.site-map__site-tooltip::before) {
  display: none !important;
}

/* Label chip (overall trip name) */
.site-map__label {
  position: absolute;
  left: 10px;
  top: 10px;
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  z-index: 500;
  max-width: calc(100% - 56px);
}
.site-map__label-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: #1e2733;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>