<template>
  <div ref="chart" />
</template>

<script>
import { tsvParse } from 'd3-dsv'
const plotly = require('@/plugins/custom-plotly')

export default {
  props: {
    sourceFile: {
      type: Blob,
      default: null
    }
  },
  watch: {
    sourceFile: function () {
      this.update()
    }
  },
  methods: {
    update: function () {
      if (this.sourceFile) {
        plotly.purge(this.$refs.chart)

        const reader = new FileReader()
        reader.onload = () => {
          const rows = tsvParse(reader.result)

          rows.forEach(r => {
            r.elevation = parseFloat(r.elevation)
          })

          const x = rows.map(r => r.distance)
          const y = rows.map(r => r.elevation)

          let totalAscent = 0
          let min = y[0]
          let max = y[0]

          for (let i = 1; i < y.length; i++) {
            totalAscent += Math.max(0, y[i] - y[i - 1])
            min = Math.min(min, y[i])
            max = Math.max(max, y[i])
          }

          const data = [{
            x: x,
            y: y,
            fill: 'tozeroy',
            mode: 'lines',
            type: 'scatter',
            marker: {
              color: '#005eb8'
            }
          }]

          const layout = {
            margin: { l: 50, r: 10, t: 10, b: 50, autoexpand: true },
            paper_bgcolor: '#4e5d6c',
            plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            xaxis: {
              gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
              showgrid: false,
              tickfont: { color: 'white' },
              title: { text: 'Distanz [km]', font: { color: 'white' } }
            },
            yaxis: {
              gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
              showgrid: false,
              tickfont: { color: 'white' },
              title: { text: 'Höhe [m]', font: { color: 'white' } }
            },
            legend: { orientation: 'h', x: 1, y: 1, xanchor: 'right', font: { color: 'white' } },
            hovermode: 'x',
            autosize: true,
            height: 400,
            dragmode: false,
            scrollZoom: false,
            annotations: [{
              y: max,
              x: x[x.length - 1] * 0.02,
              text: `Gesamtanstieg: ${totalAscent.toFixed(2)}`,
              showarrow: false,
              xanchor: 'left',
              font: {
                color: 'white'
              }
            }, {
              y: max - (max - min) / 2,
              x: x[x.length - 1] * 1.010,
              text: `${(max - min).toFixed(2)}m`,
              showarrow: false,
              xanchor: 'left',
              textangle: -90,
              font: {
                color: 'white'
              }
            }],
            shapes: [{
              type: 'line',
              x0: x[x.length - 1] * 1.010,
              x1: x[x.length - 1] * 1.010,
              y0: min,
              y1: max,
              line: {
                width: 1,
                color: 'white'
              }
            }, {
              type: 'line',
              x0: x[x.length - 1] * 1.005,
              x1: x[x.length - 1] * 1.010,
              y0: max,
              y1: max,
              line: {
                width: 1,
                color: 'white'
              }
            }, {
              type: 'line',
              x0: x[x.length - 1] * 1.005,
              x1: x[x.length - 1] * 1.010,
              y0: min,
              y1: min,
              line: {
                width: 1,
                color: 'white'
              }
            }]
          }

          const config = {
            responsive: true,
            displaylogo: false,
            displayModeBar: false
          }

          plotly.newPlot(this.$refs.chart, data, layout, config)
        }

        reader.readAsText(this.sourceFile)
      }
    }
  },
  mounted: function () {
    if (this.sourceFile) {
      this.update()
    }
  }
}
</script>

<style>

</style>
