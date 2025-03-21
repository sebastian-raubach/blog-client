import { Segment, Track } from 'gpx-builder/dist/builder/BaseBuilder/models'

const GpxParser = require('gpxparser')
const { buildGPX, BaseBuilder } = require('gpx-builder')

const { Point } = BaseBuilder.MODELS

export default {
  methods: {
    gpxToGeoJSON: function (gpx) {
      const p = new GpxParser()
      p.parse(gpx)
      return p.toGeoJSON()
    },
    gpxGetStats: function (tracks) {
      let distance = 0
      let ascent = 0
      let duration = 0

      tracks.forEach(t => {
        duration += (t[t.length - 1].time - t[0].time) / 1000 / 60

        for (let i = 1; i < t.length; i++) {
          const haversine = this.gpxHaversine(t[i - 1], t[i])
          distance += haversine
          ascent += Math.max(0, t[i - 1].ele - t[i].ele)
        }
      })

      return {
        distance: Math.round(distance * 100) / 100,
        ascent: Math.round(ascent * 100) / 100,
        duration: Math.round(duration)
      }
    },
    gpxPointsToGpx: function (tracks) {
      const builder = new BaseBuilder()

      const ts = []
      tracks.forEach(t => {
        const track = new Track()
        const segment = new Segment()
        const gpxPoints = t.map(p => {
          return new Point(p.lat, p.lon, {
            ele: p.ele,
            time: p.time
          })
        })
        segment.setPoints(gpxPoints)
        track.setSegments([segment])
        ts.push(track)
      })

      builder.setTracks(ts)

      return buildGPX(builder.toObject())
    },
    gpxHaversine: function (first, second) {
      const r = 6371
      const dLat = this.gpxToRadians(second.lat - first.lat)
      const dLng = this.gpxToRadians(second.lon - first.lon)
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.gpxToRadians(first.lat)) * Math.cos(this.gpxToRadians(second.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return r * c
    },
    gpxToRadians: function (value) {
      return value * Math.PI / 180
    },
    gpxLoadPoints: function (file) {
      const p = new GpxParser()
      p.parse(file)

      const tracks = []
      if (p.tracks && p.tracks.length > 0) {
        p.tracks.forEach(t => {
          if (t.points && t.points.length > 0) {
            tracks.push(t.points)
          }
        })
      } else if (p.routes && p.routes.length > 0) {
        p.routes.forEach(r => {
          if (r.points && r.points.length > 0) {
            tracks.push(r.points)
          }
        })
      }

      return tracks
    },
    gpxGetSqDist: function (p1, p2) {
      const dx = p1.lat - p2.lat
      const dy = p1.lon - p2.lon

      return dx * dx + dy * dy
    },
    gpxGetSqSegDist: function (p, p1, p2) {
      let lat = p1.lat
      let lon = p1.lon
      let dlat = p2.lat - lat
      let dlon = p2.lon - lon

      if (dlat !== 0 || dlon !== 0) {
        const t = ((p.lat - lat) * dlat + (p.lon - lon) * dlon) / (dlat * dlat + dlon * dlon)

        if (t > 1) {
          lat = p2.lat
          lon = p2.lon
        } else if (t > 0) {
          lat += dlat * t
          lon += dlon * t
        }
      }

      dlat = p.lat - lat
      dlon = p.lon - lon

      return dlat * dlat + dlon * dlon
    },
    gpxSimplifyRadialDist: function (points, sqTolerance) {
      let prevPoint = points[0]
      const newPoints = [prevPoint]
      let point

      for (let i = 1, len = points.length; i < len; i++) {
        point = points[i]

        if (this.gpxGetSqDist(point, prevPoint) > sqTolerance) {
          newPoints.push(point)
          prevPoint = point
        }
      }

      if (prevPoint !== point) {
        newPoints.push(point)
      }

      return newPoints
    },
    gpxSimplifyDPStep: function (points, first, last, sqTolerance, simplified) {
      let maxSqDist = sqTolerance
      let index

      for (let i = first + 1; i < last; i++) {
        const sqDist = this.gpxGetSqSegDist(points[i], points[first], points[last])

        if (sqDist > maxSqDist) {
          index = i
          maxSqDist = sqDist
        }
      }

      if (maxSqDist > sqTolerance) {
        if (index - first > 1) {
          this.gpxSimplifyDPStep(points, first, index, sqTolerance, simplified)
        }
        simplified.push(points[index])
        if (last - index > 1) {
          this.gpxSimplifyDPStep(points, index, last, sqTolerance, simplified)
        }
      }
    },
    gpxSimplifyDouglasPeucker: function (points, sqTolerance) {
      const last = points.length - 1

      const simplified = [points[0]]
      this.gpxSimplifyDPStep(points, 0, last, sqTolerance, simplified)
      simplified.push(points[last])

      return simplified
    },
    gpxSimplify: function (points, tolerance, highestQuality) {
      if (points.length <= 2) {
        return points
      }

      const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1

      points = highestQuality ? points : this.gpxSimplifyRadialDist(points, sqTolerance)
      points = this.gpxSimplifyDouglasPeucker(points, sqTolerance)

      return points
    }
  }
}
