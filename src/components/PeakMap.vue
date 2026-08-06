<template>
  <div class="peak-map mx-auto" :style="{ height: mapHeight, borderRadius: `${rounded}px`, maxWidth: maxWidth }">
    <div ref="mapEl" class="peak-map__canvas" />

    <div v-if="label" class="peak-map__label">
      <span class="peak-map__label-text">{{ label }}</span>
    </div>
    <v-bottom-sheet
      v-model="bottomSheet"
      :inset="lgAndUp"
      max-height="50vh"
      width="auto"
      v-if="selectedHill"
    >
      <v-card class="pb-10">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="me-3" :icon="hillConfigs[selectedHill.hillType].icon" />
            <div>{{ selectedHill.hillType }}</div>
          </div>
          <v-btn :icon="mdiClose" variant="text" @click="bottomSheet = false" />
        </v-card-title>
        
        <v-card-text>
          <HillDetails :hill-id="selectedHill.hillId || -1" />
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
import type { ViewHills } from '@/plugins/types/blog'
import { hillConfigs } from '@/plugins/constants'
import { mdiClose } from '@mdi/js'
import { useDisplay } from 'vuetify'

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
  peaks?: ViewHills[]
  /** Show peak names as permanent labels rather than only on hover */
  showPeakLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  height: '220px',
  rounded: 16,
  interactive: true,
  peaks: () => [],
  showPeakLabels: true,
})

const emit = defineEmits<{
  loaded: [
    stats: { name: string; distanceKm: number; elevationGainM: number; elevationLossM: number }[]
  ]
  error: [message: string]
}>()

const mapEl = ref<HTMLDivElement | null>(null)
const mapHeight = props.height

const { lgAndUp } = useDisplay()
const bottomSheet = ref(false)
const selectedHill = ref<ViewHills>()

let map: L.Map | null = null
let layerGroup: L.LayerGroup | null = null

/** Small triangular "summit" glyph, anchored at its base so the tip sits above the exact point. */
function buildPeakIcon(color: string) {
  return L.divIcon({
    className: 'peak-map__peak',
    html: `<svg width="14" height="13" viewBox="0 0 14 13" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 0.5L13.2 12H0.8Z" fill="${color}" stroke="#2c3e50" stroke-width="1.2" stroke-linejoin="round" />
    </svg>`,
    iconSize: [14, 13],
    iconAnchor: [7, 12],
  })
}

function render() {
  if (!map) return
  layerGroup?.clearLayers()
  layerGroup = L.layerGroup().addTo(map)

  const bounds: L.LatLngExpression[] = []

  if (props.peaks.length) {
    props.peaks.forEach((peak) => {
      bounds.push([peak.hillLatitude, peak.hillLongitude] as L.LatLngExpression)
      const peakMarker = L.marker([peak.hillLatitude, peak.hillLongitude], {
        icon: buildPeakIcon(hillConfigs[peak.hillType].color),
        zIndexOffset: 400,
      }).addTo(layerGroup!)
      peakMarker.on('click', () => {
        selectedHill.value = peak

        nextTick(() => {
          bottomSheet.value = true
        })
      })
 
      const labelText = peak.hillElevation
        ? `${peak.hillName} · ${hillConfigs[peak.hillType].title} · ${Math.round(peak.hillElevation)} m`
        : peak.hillName
      peakMarker.bindTooltip(labelText, {
        // permanent: props.showPeakLabels,
        direction: 'top',
        offset: [0, -10],
        className: 'peak-map__peak-tooltip',
        opacity: 1,
      })
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

watch(() => props.peaks, render)

onMounted(() => {
  initMap()
})
onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.peak-map {
  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.08);
  background: #eef1f4;
}

.peak-map__canvas {
  width: 100%;
  height: 100%;
}

/* Peak / summit markers */
:global(.peak-map__peak) {
  filter: drop-shadow(0 1px 1px rgba(15, 23, 42, 0.25));
}
:global(.peak-map__peak-tooltip) {
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
:global(.peak-map__peak-tooltip::before) {
  display: none !important;
}

/* Label chip (overall trip name) */
.peak-map__label {
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
.peak-map__label-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: #1e2733;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>