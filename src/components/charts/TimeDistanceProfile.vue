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
            r.time = parseFloat(r.time)
          })

          const x = rows.map(r => r.distance)
          const y = rows.map(r => r.time)

          const data = [{
            x: x,
            y: y,
            mode: 'lines',
            type: 'scatter',
            fill: 'tozeroy',
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
              tickfont: { color: 'white' },
              title: { text: 'Distanz [km]', font: { color: 'white' } },
              showgrid: false,
              hoverformat: '.2f',
              fixedrange: true,
              automargin: true
            },
            yaxis: {
              gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
              tickfont: { color: 'white' },
              title: { text: 'Dauer [min]', font: { color: 'white' } },
              showgrid: false,
              showline: true,
              hoverformat: '.2f',
              fixedrange: true,
              automargin: true
            },
            legend: { orientation: 'h', x: 1, y: 1, xanchor: 'right', font: { color: 'white' } },
            hovermode: 'x',
            autosize: true,
            height: 400,
            dragmode: false,
            scrollZoom: false
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
