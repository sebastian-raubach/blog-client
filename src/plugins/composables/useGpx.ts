import type { GpxPayload, GpxStats } from '@/plugins/types/blog'

export interface TrackPoint {
  lat: number
  lng: number
  ele?: number
  time?: string
}

/** Meters. Points closer to the simplified line than this get dropped. Tune to taste. */
const DEFAULT_TOLERANCE_METERS = 5

interface TrackSegment {
  points: TrackPoint[]
}

interface Track {
  name?: string
  segments: TrackSegment[]
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Great-circle distance between two points, in meters. */
function haversineDistance(a: TrackPoint, b: TrackPoint): number {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Approximate perpendicular distance (in meters) from `point` to the line (lineStart, lineEnd).
 * Longitude is scaled by cos(latitude) so the planar approximation stays reasonable at hike scale.
 */
function perpendicularDistanceMeters(point: TrackPoint, lineStart: TrackPoint, lineEnd: TrackPoint): number {
  const latRef = (lineStart.lat + lineEnd.lat) / 2
  const cosLat = Math.cos(toRad(latRef))
  const metersPerDegree = 111320

  const x = point.lng * cosLat
  const y = point.lat
  const x1 = lineStart.lng * cosLat
  const y1 = lineStart.lat
  const x2 = lineEnd.lng * cosLat
  const y2 = lineEnd.lat

  const dx = x2 - x1
  const dy = y2 - y1

  if (dx === 0 && dy === 0) {
    return Math.hypot(x - x1, y - y1) * metersPerDegree
  }

  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
  const clampedT = Math.max(0, Math.min(1, t))
  const projX = x1 + clampedT * dx
  const projY = y1 + clampedT * dy
  return Math.hypot(x - projX, y - projY) * metersPerDegree
}

/** Ramer-Douglas-Peucker line simplification. Never called across a segment boundary. */
function douglasPeucker(points: TrackPoint[], toleranceMeters: number): TrackPoint[] {
  if (points.length < 3) return points

  let maxDist = 0
  let splitIndex = 0
  const lastIndex = points.length - 1

  for (let i = 1; i < lastIndex; i++) {
    const dist = perpendicularDistanceMeters(points[i], points[0], points[lastIndex])
    if (dist > maxDist) {
      maxDist = dist
      splitIndex = i
    }
  }

  if (maxDist > toleranceMeters) {
    const left = douglasPeucker(points.slice(0, splitIndex + 1), toleranceMeters)
    const right = douglasPeucker(points.slice(splitIndex), toleranceMeters)
    return [...left.slice(0, -1), ...right]
  }

  return [points[0], points[lastIndex]]
}

function countPoints(tracks: Track[]): number {
  return tracks.reduce((sum, t) => sum + t.segments.reduce((s, seg) => s + seg.points.length, 0), 0)
}

/**
 * Distance and elevation gain are summed per-segment and never carried across a segment/track
 * boundary — otherwise a GPS gap (new day, paused recording, separate <trk>) would register as
 * a big jump in distance. Duration uses the earliest and latest timestamps found anywhere in
 * the file, which assumes segments are in chronological order (true for the vast majority of
 * real-world GPX exports).
 */
function calculateTrackMetrics(tracks: Track[]): Omit<GpxStats, 'originalPointCount' | 'minifiedPointCount'> {
  let distanceMeters = 0
  let elevationGainMeters = 0
  let durationMinutes = 0
  
  for (const track of tracks) {
    let trackDurationMinutes = 0
    let firstTime: string | undefined
    let lastTime: string | undefined
    for (const segment of track.segments) {
      for (let i = 0; i < segment.points.length; i++) {
        const point = segment.points[i]
        if (point.time) {
          if (!firstTime) firstTime = point.time
          lastTime = point.time
        }
        if (i === 0) continue
        distanceMeters += haversineDistance(segment.points[i - 1], point)
        const eleDiff = (point.ele ?? 0) - (segment.points[i - 1].ele ?? 0)
        if (eleDiff > 0) elevationGainMeters += eleDiff
      }
    }
    if (firstTime && lastTime) {
      const diffMs = new Date(lastTime).getTime() - new Date(firstTime).getTime()
      if (Number.isFinite(diffMs) && diffMs > 0) {
        trackDurationMinutes = diffMs / 60000
      }

      durationMinutes += trackDurationMinutes
    }
  }

  return {
    distanceKm: Math.round((distanceMeters / 1000) * 100) / 100,
    elevationGainM: Math.round(elevationGainMeters),
    durationMinutes: Math.round(durationMinutes),
  }
}

function simplifyTracks(tracks: Track[], toleranceMeters: number): Track[] {
  return tracks.map((track) => ({
    name: track.name,
    segments: track.segments.map((segment) => ({
      points: douglasPeucker(segment.points, toleranceMeters),
    })),
  }))
}

function parseTrkpt(pt: Element): TrackPoint {
  const lat = parseFloat(pt.getAttribute('lat') ?? '')
  const lng = parseFloat(pt.getAttribute('lon') ?? '')
  const eleEl = pt.getElementsByTagName('ele')[0]
  const timeEl = pt.getElementsByTagName('time')[0]
  return {
    lat,
    lng,
    ele: eleEl?.textContent ? parseFloat(eleEl.textContent) : undefined,
    time: timeEl?.textContent ?? undefined,
  }
}

/** Parses every <trk>, preserving its <trkseg> boundaries (falls back to direct <trkpt> children if untagged). */
async function parseGpxTracks(file: File): Promise<Track[]> {
  const text = await file.text()
  const doc = new DOMParser().parseFromString(text, 'application/xml')

  if (doc.querySelector('parsererror')) {
    throw new Error('That file could not be parsed as GPX/XML.')
  }

  const trkElements = Array.from(doc.getElementsByTagName('trk'))
  if (trkElements.length === 0) {
    throw new Error('No <trk> elements found in this GPX file.')
  }

  const tracks: Track[] = trkElements.map((trkEl) => {
    const nameEl = trkEl.getElementsByTagName('name')[0]
    const segEls = Array.from(trkEl.getElementsByTagName('trkseg'))

    let segments: TrackSegment[]
    if (segEls.length > 0) {
      segments = segEls.map((segEl) => ({
        points: Array.from(segEl.getElementsByTagName('trkpt')).map(parseTrkpt),
      }))
    } else {
      // Non-conformant but sometimes-seen GPX with trkpt directly under trk, no trkseg wrapper.
      const directPoints = Array.from(trkEl.getElementsByTagName('trkpt')).map(parseTrkpt)
      segments = directPoints.length ? [{ points: directPoints }] : []
    }

    return { name: nameEl?.textContent ?? undefined, segments }
  })

  const totalPoints = countPoints(tracks)
  if (totalPoints === 0) {
    throw new Error('No track points (<trkpt>) found in this GPX file.')
  }

  return tracks
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Rebuilds a minimal, valid GPX 1.1 document from (possibly simplified) tracks. */
export function buildGpxXml(tracks: Track[]): string {
  const trkXml = tracks
    .map((track) => {
      const nameXml = track.name ? `<name>${escapeXml(track.name)}</name>` : ''
      const segXml = track.segments
        .map((segment) => {
          const ptsXml = segment.points
            .map((p) => {
              const eleXml = p.ele !== undefined ? `<ele>${p.ele}</ele>` : ''
              const timeXml = p.time ? `<time>${escapeXml(p.time)}</time>` : ''
              return `<trkpt lat="${p.lat}" lon="${p.lng}">${eleXml}${timeXml}</trkpt>`
            })
            .join('')
          return `<trkseg>${ptsXml}</trkseg>`
        })
        .join('')
      return `<trk>${nameXml}${segXml}</trk>`
    })
    .join('')

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<gpx version="1.1" creator="blog-entry-wizard" xmlns="http://www.topografix.com/GPX/1/1">${trkXml}</gpx>`
  )
}

function buildMinifiedGpxFile(tracks: Track[], originalFileName: string): File {
  const xml = buildGpxXml(tracks)
  const baseName = originalFileName.replace(/\.gpx$/i, '')
  return new File([xml], `${baseName}.min.gpx`, { type: 'application/gpx+xml' })
}

export function useGpx(toleranceMeters = DEFAULT_TOLERANCE_METERS) {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  async function processFile(file: File): Promise<GpxPayload | null> {
    isProcessing.value = true
    error.value = null
    try {
      const tracks = await parseGpxTracks(file)

      // Stats always come from the original, full-resolution tracks.
      const metrics = calculateTrackMetrics(tracks)
      const originalPointCount = countPoints(tracks)

      const simplifiedTracks = simplifyTracks(tracks, toleranceMeters)
      const minifiedPointCount = countPoints(simplifiedTracks)
      const minifiedFile = buildMinifiedGpxFile(simplifiedTracks, file.name)

      return {
        file,
        minifiedFile,
        fileAsString: buildGpxXml(simplifiedTracks),
        stats: {
          ...metrics,
          originalPointCount,
          minifiedPointCount,
        },
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to process GPX file.'
      return null
    } finally {
      isProcessing.value = false
    }
  }

  return { isProcessing, error, processFile }
}

