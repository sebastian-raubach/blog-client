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
    gpxGetStats: function (points) {
      let distance = 0
      let ascent = 0
      const duration = (points[points.length - 1].time - points[0].time) / 1000 / 60

      for (let i = 1; i < points.length; i++) {
        const haversine = this.gpxHaversine(points[i - 1], points[i])
        distance += haversine
        ascent += Math.max(0, points[i - 1].ele - points[i].ele)
      }

      return {
        distance: Math.round(distance * 100) / 100,
        ascent: Math.round(ascent * 100) / 100,
        duration: Math.round(duration)
      }
    },
    gpxPointsToGpx: function (points) {
      const gpxPoints = points.map(p => {
        return new Point(p.lat, p.lon, {
          ele: p.ele,
          time: p.time
        })
      })

      const builder = new BaseBuilder()

      builder.setSegmentPoints(gpxPoints)

      return buildGPX(builder.toObject())
    },
    gpxHaversine: function (first, second) {
      var r = 6371
      var dLat = this.gpxToRadians(second.lat - first.lat)
      var dLng = this.gpxToRadians(second.lon - first.lon)
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.gpxToRadians(first.lat)) * Math.cos(this.gpxToRadians(second.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return r * c
    },
    gpxToRadians: function (value) {
      return value * Math.PI / 180
    },
    gpxLoadPoints: function (file) {
      const p = new GpxParser()
      p.parse(file)

      let points = []
      if (p.tracks && p.tracks.length > 0) {
        const track = p.tracks[0]
        if (track.points && track.points.length > 0) {
          points = [...track.points]
        }
      } else if (p.routes && p.routes.length > 0) {
        const route = p.routes[0]
        if (route.points && route.points.length > 0) {
          points = [...route.points]
        }
      }

      return points
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

      for (var i = 1, len = points.length; i < len; i++) {
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

      for (var i = first + 1; i < last; i++) {
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
