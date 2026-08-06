<template>
  <div class="gpx-map mx-auto" :style="{ height: mapHeight, borderRadius: `${rounded}px`, maxWidth: maxWidth }">
    <div ref="mapEl" class="gpx-map__canvas" />

    <div v-if="label" class="gpx-map__label">
      <span class="gpx-map__label-text">{{ label }}</span>
    </div>

    <div v-if="showStats && trackStats.length" class="gpx-map__stats">
      <div
        v-for="(t, i) in trackStats"
        :key="i"
        class="gpx-map__stats-row"
      >
        <span class="gpx-map__stats-dot" :style="{ background: t.color }" />
        <span v-if="t.showName" class="gpx-map__stats-name">{{ t.name }}</span>
        <v-chip :text="t.distance" :prepend-icon="mdiMapMarkerDistance" color="primary" variant="tonal" size="small" label />
        <v-chip :text="t.gain" :prepend-icon="mdiElevationRise" color="primary" variant="tonal" size="small" label />
      </div>
    </div>

    <div v-if="loading" class="gpx-map__status">Loading track…</div>
    <div v-else-if="error" class="gpx-map__status gpx-map__status--error">{{ error }}</div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import L, { type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mdiElevationRise, mdiMapMarkerDistance } from '@mdi/js'
import type { PostHill } from '@/plugins/types/blog'
import { hillConfigs } from '@/plugins/constants'

interface TrackPoint {
  lat: number
  lng: number
  ele: number | null
}

interface ParsedTrack {
  name: string
  hasName: boolean
  segments: TrackPoint[][]
}

interface Props {
  /** Raw GPX file contents as a string */
  gpx?: string
  /** URL to fetch a GPX file from (used if `gpx` isn't provided) */
  src?: string
  /** Optional caption chip, e.g. an overall trip name */
  label?: string
  /** CSS height of the component */
  height?: string
  /** Corner radius in px */
  rounded?: number
  /** Show the per-track distance / elevation-gain stats panel */
  showStats?: boolean
  /** Disable pan/zoom for a static, decorative look */
  interactive?: boolean
  /** Distance/elevation units */
  units?: 'metric' | 'imperial'
  /** Force every track to this color instead of the auto palette */
  trackColor?: string
  /** Show distance markers along each track */
  showDistanceMarkers?: boolean
  /** Spacing between distance markers, in km (metric) or miles (imperial) */
  markerInterval?: number
  /** Maximum width of the map element */
  maxWidth?: string
  /** Named points of interest to highlight along the track, e.g. summits */
  peaks?: PostHill[]
  /** Show peak names as permanent labels rather than only on hover */
  showPeakLabels?: boolean
  /** Click handler */
  clickHandler?: (lat: number, lng: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  gpx: undefined,
  src: undefined,
  label: undefined,
  height: '220px',
  rounded: 16,
  showStats: true,
  interactive: true,
  units: 'metric',
  trackColor: undefined,
  showDistanceMarkers: true,
  markerInterval: 1,
  peaks: () => [],
  showPeakLabels: true,
})

const emit = defineEmits<{
  loaded: [
    stats: { name: string; distanceKm: number; elevationGainM: number; elevationLossM: number }[]
  ]
  error: [message: string]
}>()

const PALETTE = ['#52777A', '#542437', '#C02942', '#D95B43', '#ECD078']

const mapEl = ref<HTMLDivElement | null>(null)
const mapHeight = props.height
const loading = ref(false)
const error = ref<string | null>(null)

const rawTrackStats = ref<
  { name: string; hasName: boolean; color: string; distanceKm: number; elevationGainM: number }[]
>([])

let map: L.Map | null = null
let layerGroup: L.LayerGroup | null = null
let peakMarkers: L.Marker[] = []
let firstPoint: TrackPoint | null = null

function trackColorAt(index: number): string {
  if (props.trackColor) return props.trackColor
  return PALETTE[index % PALETTE.length]
}

function formatDistance(km: number): string {
  return props.units === 'imperial' ? `${(km * 0.621371).toFixed(1)} mi` : `${km.toFixed(1)} km`
}

function formatGain(m: number): string {
  return props.units === 'imperial' ? `${Math.round(m * 3.28084)} ft` : `${Math.round(m)} m`
}

const trackStats = computed(() =>
  rawTrackStats.value.map((t) => ({
    color: t.color,
    name: t.name,
    showName: rawTrackStats.value.length > 1 || t.hasName,
    distance: formatDistance(t.distanceKm),
    gain: formatGain(t.elevationGainM),
  }))
)

function haversine(a: TrackPoint, b: TrackPoint): number {
  const R = 6371 // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function parseGpx(xmlText: string): ParsedTrack[] {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) throw new Error('Could not read this GPX file.')

  const trkEls = Array.from(doc.getElementsByTagName('trk'))
  const rteEls = Array.from(doc.getElementsByTagName('rte'))

  const tracks: ParsedTrack[] = []

  const readPoints = (container: Element, ptTag: string): TrackPoint[] =>
    Array.from(container.getElementsByTagName(ptTag))
      .map((pt) => {
        const lat = parseFloat(pt.getAttribute('lat') ?? '')
        const lng = parseFloat(pt.getAttribute('lon') ?? '')
        const eleEl = pt.getElementsByTagName('ele')[0]
        const ele = eleEl ? parseFloat(eleEl.textContent ?? '') : null
        return { lat, lng, ele: Number.isFinite(ele) ? ele : null }
      })
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))

  if (trkEls.length) {
    trkEls.forEach((trk, i) => {
      const nameEl = trk.getElementsByTagName('name')[0]
      const name = nameEl?.textContent?.trim() || `Track ${i + 1}`
      const segs = Array.from(trk.getElementsByTagName('trkseg'))
      const segments = (segs.length ? segs : [trk]) // some GPX files skip <trkseg> entirely
        .map((seg) => readPoints(seg, 'trkpt'))
        .filter((pts) => pts.length > 1)
      if (segments.length) {
        tracks.push({ name, hasName: !!nameEl?.textContent?.trim(), segments })
      }
    })
  } else if (rteEls.length) {
    rteEls.forEach((rte, i) => {
      const nameEl = rte.getElementsByTagName('name')[0]
      const name = nameEl?.textContent?.trim() || `Route ${i + 1}`
      const points = readPoints(rte, 'rtept')
      if (points.length > 1) {
        tracks.push({ name, hasName: !!nameEl?.textContent?.trim(), segments: [points] })
      }
    })
  }

  if (!tracks.length) throw new Error('No track points found in this GPX file.')
  return tracks
}

function computeTrackStats(track: ParsedTrack) {
  let distanceKm = 0
  let elevationGainM = 0
  let elevationLossM = 0

  for (const segment of track.segments) {
    for (let i = 1; i < segment.length; i++) {
      distanceKm += haversine(segment[i - 1], segment[i])
      const a = segment[i - 1].ele
      const b = segment[i].ele
      if (a !== null && b !== null) {
        const diff = b - a
        if (diff > 0) elevationGainM += diff
        else elevationLossM += Math.abs(diff)
      }
    }
  }
  return { distanceKm, elevationGainM, elevationLossM }
}

/** Small triangular "summit" glyph, anchored at its base so the tip sits above the exact point. */
function buildPeakIcon(color: string) {
  return L.divIcon({
    className: 'gpx-map__peak',
    html: `<svg width="14" height="13" viewBox="0 0 14 13" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 0.5L13.2 12H0.8Z" fill="${color}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" />
    </svg>`,
    iconSize: [14, 13],
    iconAnchor: [7, 12],
  })
}

function buildEndpointIcon(kind: 'start' | 'end') {
  const color = kind === 'start' ? '#16a34a' : '#dc2626'
  return L.divIcon({
    className: 'gpx-map__endpoint',
    html: `<span class="gpx-map__endpoint-pulse" style="background:${color}33"></span><span class="gpx-map__endpoint-core" style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 13],
  })
}

function buildDistanceMarkerIcon(value: number, color: string) {
  return L.divIcon({
    className: 'gpx-map__km-marker-wrap',
    html: `<span class="gpx-map__km-marker" style="border-color:${color}">${value}</span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

/** Places a marker every `unitKm` kilometers of cumulative distance along a track's segments. */
function buildDistanceMarkers(track: ParsedTrack, color: string): L.Marker[] {
  const unitKm = props.units === 'imperial' ? 1.60934 * props.markerInterval : props.markerInterval
  if (!(unitKm > 0)) return []

  const markers: L.Marker[] = []
  let cumulative = 0
  let nextMark = unitKm

  for (const segment of track.segments) {
    for (let i = 1; i < segment.length; i++) {
      const a = segment[i - 1]
      const b = segment[i]
      const d = haversine(a, b)
      while (d > 0 && cumulative + d >= nextMark - 1e-9) {
        const frac = (nextMark - cumulative) / d
        const lat = a.lat + (b.lat - a.lat) * frac
        const lng = a.lng + (b.lng - a.lng) * frac
        const label = Math.round(nextMark / unitKm)
        markers.push(
          L.marker([lat, lng], { icon: buildDistanceMarkerIcon(label, color), interactive: false })
        )
        nextMark += unitKm
      }
      cumulative += d
    }
  }
  return markers
}

function render(tracks: ParsedTrack[]) {
  if (!map) return
  layerGroup?.clearLayers()
  layerGroup = L.layerGroup().addTo(map)

  const bounds: L.LatLngExpression[] = []
  const statsAcc: typeof rawTrackStats.value = []

  tracks.forEach((track, i) => {
    const color = trackColorAt(i)

    track.segments.forEach((segment) => {
      const latlngs = segment.map((p) => [p.lat, p.lng] as L.LatLngExpression)
      bounds.push(...latlngs)
      L.polyline(latlngs, {
        color,
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup!)
    })

    if (props.showDistanceMarkers) {
      buildDistanceMarkers(track, color).forEach((m) => m.addTo(layerGroup!))
    }

    const { distanceKm, elevationGainM, elevationLossM } = computeTrackStats(track)
    statsAcc.push({ name: track.name, hasName: track.hasName, color, distanceKm, elevationGainM })
    void elevationLossM

    const trackStart = track.segments[0][0]
    const lastSeg = track.segments[track.segments.length - 1]
    const trackEnd = lastSeg[lastSeg.length - 1]

    L.marker([trackStart.lat, trackStart.lng], {
      icon: buildEndpointIcon('start'),
      interactive: false,
    }).addTo(layerGroup!)
    L.marker([trackEnd.lat, trackEnd.lng], {
      icon: buildEndpointIcon('end'),
      interactive: false,
    }).addTo(layerGroup!)

    if (i === 0) firstPoint = trackStart
  })

  rawTrackStats.value = statsAcc

  addPeaks(bounds)

  if (bounds.length) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [24, 24] })
  }

  emit(
    'loaded',
    statsAcc.map(({ name, distanceKm, elevationGainM }) => ({
      name,
      distanceKm,
      elevationGainM,
      elevationLossM: 0,
    }))
  )
}

function addPeaks (bounds?: LatLngExpression[]) {
  if (peakMarkers.length) {
    peakMarkers.forEach(m => m.remove())
  }

  if (props.peaks.length) {
    props.peaks.forEach((peak) => {
      bounds?.push([peak.hillLatitude, peak.hillLongitude] as L.LatLngExpression)
      const peakMarker = L.marker([peak.hillLatitude, peak.hillLongitude], {
        icon: buildPeakIcon(hillConfigs[peak.hillType].color),
        zIndexOffset: 400,
      }).addTo(map!)

      peakMarkers.push(peakMarker)
 
      const labelText = peak.hillElevation
        ? `${peak.hillName} · ${hillConfigs[peak.hillType].title} · ${Math.round(peak.hillElevation)} m`
        : peak.hillName
      peakMarker.bindTooltip(labelText, {
        permanent: props.showPeakLabels,
        direction: 'top',
        offset: [0, -10],
        className: 'gpx-map__peak-tooltip',
        opacity: 1,
      })
    })
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
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
    boxZoom: false,
    keyboard: false,
  })
  map.setView([56.458415, -2.974876], 10)

  const ch = props.clickHandler
  if (ch) {
    map.on('click', (event: L.LeafletMouseEvent) => {
      ch(event.latlng.lat, event.latlng.lng)
    })
  }

  addTileLayer()

  if (props.interactive) {
    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }
  L.control
    .attribution({ position: 'bottomleft', prefix: false })
    .addTo(map)
}

function invalidateMap () {
  map?.invalidateSize()
}

async function loadTrack() {
  if (!props.src && !props.gpx) {
    return
  }

  error.value = null
  rawTrackStats.value = []
  let xml = props.gpx

  if (!xml && props.src) {
    loading.value = true
    try {
      const res = await fetch(props.src)
      if (!res.ok) throw new Error(`Could not fetch GPX file (${res.status}).`)
      xml = await res.text()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not load GPX file.'
      emit('error', error.value)
      loading.value = false
      return
    }
  }

  if (!xml) {
    error.value = 'No GPX data provided.'
    emit('error', error.value)
    return
  }

  try {
    const tracks = parseGpx(xml)
    render(tracks)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not read this GPX file.'
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}

watch(() => [props.gpx, props.src], loadTrack)
watch(() => props.peaks, () => addPeaks(), { deep: true })

onMounted(() => {
  initMap()
  loadTrack()
})
onBeforeUnmount(() => {
  map?.remove()
  map = null
})

defineExpose({
  invalidateMap,
})
</script>

<style scoped>
.gpx-map {
  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.08);
  background: #eef1f4;
}

.gpx-map__canvas {
  width: 100%;
  height: 100%;
}

/* Peak / summit markers */
:global(.gpx-map__peak) {
  filter: drop-shadow(0 1px 1px rgba(15, 23, 42, 0.25));
}
:global(.gpx-map__peak-tooltip) {
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
:global(.gpx-map__peak-tooltip::before) {
  display: none !important;
}

/* Endpoint markers: green pulsing start, solid red end */
:global(.gpx-map__endpoint) {
  position: relative;
}
:global(.gpx-map__endpoint-core) {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #ffffff;
}
:global(.gpx-map__endpoint-pulse) {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  animation: gpx-map-pulse 2.2s ease-out infinite;
}
@keyframes gpx-map-pulse {
  0% { transform: scale(0.4); opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  :global(.gpx-map__endpoint-pulse) { animation: none; opacity: 0.35; }
}

/* Distance markers along the track */
:global(.gpx-map__km-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid;
  font-size: 9px;
  font-weight: 700;
  color: #1e2733;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.18);
}

/* Label chip (overall trip name) */
.gpx-map__label {
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
.gpx-map__label-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: #1e2733;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Stats panel: one row per <trk> */
.gpx-map__stats {
  position: absolute;
  left: 10px;
  bottom: 10px;
  /* right: 10px; */
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  z-index: 500;
  max-height: 40%;
  overflow-y: auto;
}
.gpx-map__stats-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
}
.gpx-map__stats-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.gpx-map__stats-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e2733;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
  min-width: 0;
}
.gpx-map__stats-figure {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #45505c;
  white-space: nowrap;
  flex-shrink: 0;
}
.gpx-map__stats-icon {
  color: #94a3b8;
}

/* Status overlay (loading / error) */
.gpx-map__status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.6);
  z-index: 600;
  pointer-events: none;
  text-align: center;
  padding: 0 16px;
}
.gpx-map__status--error {
  color: #b91c1c;
}
</style>