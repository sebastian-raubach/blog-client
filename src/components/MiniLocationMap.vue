<template>
  <div class="location-map" :style="{ height: mapHeight, borderRadius: `${rounded}px` }">
    <div ref="mapEl" :class="`location-map__canvas ${isEditable ? 'edit-map' : ''}`" />

    <div v-if="label" class="location-map__label">
      <span class="location-map__dot" />
      <span class="location-map__label-text">{{ label }}</span>
    </div>

    <button
      v-if="showExpand"
      class="location-map__expand"
      type="button"
      aria-label="Open in Google Maps"
      @click="openExternal"
    >
      <v-icon :icon="mdiFullscreen" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * LocationMap
 * A minimal, single-purpose Leaflet map for highlighting one point in a
 * small space (cards, sidebars, list rows). Not a general-purpose map —
 * no drawing tools, no multi-marker support, no routing.
 *
 * Usage:
 *   <LocationMap :lat="51.5074" :lng="-0.1278" label="London Office" />
 */
import { mdiFullscreen } from '@mdi/js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  /** Optional caption shown as a floating chip, e.g. a place name */
  label?: string
  /** Zoom level — higher is closer. 14–16 suits a single building/address */
  zoom?: number
  /** CSS height of the component, e.g. '160px', '100%' */
  height?: string
  /** Corner radius in px */
  rounded?: number
  /** Show/hide the tiny "open externally" button */
  showExpand?: boolean
  /** Disable pan/zoom entirely for a purely decorative, static look */
  interactive?: boolean
  /** Whether clicking sets the lat/lng values */
  isEditable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  zoom: 15,
  height: '180px',
  rounded: 16,
  showExpand: true,
  interactive: true,
  isEditable: false,
})

const lat = defineModel<number>('lat')
const lng = defineModel<number>('lng')

const mapEl = ref<HTMLDivElement | null>(null)
const mapHeight = props.height

let map: L.Map | null = null
let marker: L.Marker | null = null
let pulseIcon: L.DivIcon

function buildIcon() {
  return L.divIcon({
    className: 'location-map__marker',
    html: `<span class="location-map__marker-pulse"></span><span class="location-map__marker-core"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function initMap() {
  if (!mapEl.value) return

  pulseIcon = buildIcon()

  map = L.map(mapEl.value, {
    center: (lat.value !== undefined && lng.value !== undefined) ? [lat.value, lng.value] : [56.458415, -2.974876],
    zoom: props.zoom,
    zoomControl: false,
    attributionControl: false,
    dragging: props.interactive,
    scrollWheelZoom: props.isEditable,
    doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
    boxZoom: false,
    keyboard: false,
  })

  // CartoDB Positron: light, low-noise basemap that stays legible at small sizes
  if (props.isEditable) {
    L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=9335f6dc581e40438367362a59ee8ae8', {
      attribution: 'Maps &copy; <a href="http://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19,
    }).addTo(map)
  } else {
    L.tileLayer(
      '//services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community',
      }
    ).addTo(map)
  }

  if (props.interactive) {
    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }
  L.control.attribution({ position: 'bottomleft', prefix: false })
    .addTo(map)

  if (props.isEditable) {
    map.on('click', e => {
      lat.value = e.latlng.lat
      lng.value = e.latlng.lng
    })
  }

  if (lat.value !== undefined && lng.value !== undefined) {
    marker = L.marker([lat.value, lng.value], { icon: pulseIcon, interactive: false }).addTo(map)
  }
}

function openExternal() {
  window.open(
    `https://geohack.toolforge.org/geohack.php?params=${lat.value};${lng.value}`,
    '_blank',
    'noopener'
  )
}

watch(
  () => [lat.value, lng.value],
  ([newLat, newLng]) => {
    if (!map || newLat === undefined || newLng === undefined) return

    if (!marker) {
      marker = L.marker([newLat, newLng], { icon: pulseIcon, interactive: false }).addTo(map)
    } else {
      marker.setLatLng([newLat, newLng])
    }

    map.setView([newLat, newLng], props.zoom)
  }
)

watch(() => props.isEditable, async newValue => {
  map?.off('click')
  map?.on('click', e => {
    lat.value = e.latlng.lat
    lng.value = e.latlng.lng
  })
})

onMounted(initMap)
onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.location-map {
  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.08);
  background: #eef1f4;
}

.location-map .edit-map:hover {
  cursor: crosshair;
}

.location-map__canvas {
  width: 100%;
  height: 100%;
}

/* Marker: soft pulsing dot rather than the default Leaflet pin */
:global(.location-map__marker) {
  position: relative;
}
:global(.location-map__marker-core) {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f6fed;
  box-shadow: 0 0 0 2px #ffffff;
}
:global(.location-map__marker-pulse) {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(47, 111, 237, 0.35);
  animation: location-map-pulse 2.2s ease-out infinite;
}
@keyframes location-map-pulse {
  0% {
    transform: scale(0.4);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  :global(.location-map__marker-pulse) {
    animation: none;
    opacity: 0.4;
  }
}

/* Floating label chip */
.location-map__label {
  position: absolute;
  left: 10px;
  top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  z-index: 500;
  max-width: calc(100% - 56px);
}
.location-map__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2f6fed;
  flex-shrink: 0;
}
.location-map__label-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: #1e2733;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Roboto', system-ui, sans-serif;
}

/* Expand / open-externally affordance */
.location-map__expand {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #45505c;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  transition: background 0.15s ease, color 0.15s ease;
}
.location-map__expand:hover {
  background: #ffffff;
  color: #2f6fed;
}
.location-map__expand:focus-visible {
  outline: 2px solid #2f6fed;
  outline-offset: 2px;
}

/* Quiet down Leaflet's default chrome to match the minimal look */
:global(.leaflet-control-zoom) {
  border: none !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12) !important;
  border-radius: 8px !important;
  overflow: hidden;
}
:global(.leaflet-control-zoom a) {
  color: #45505c !important;
  background: rgba(255, 255, 255, 0.92) !important;
}
:global(.leaflet-control-attribution) {
  background: transparent !important;
  font-size: 9px !important;
  color: #94a3b8 !important;
}
:global(.leaflet-bar) {
  border: none !important;
}
</style>