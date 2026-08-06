<template>
  <div
    ref="containerRef"
    class="position-relative cursor-pointer"
    style="width: 100%; height: 260px;"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <canvas
      ref="canvasRef"
      style="width: 100%; height: 100%; display: block;"
    ></canvas>

    <!-- Floating Tooltip Card -->
    <v-card
      v-if="hoverIndex !== null && hoverPoint"
      class="position-absolute pa-2 elevation-3 text-caption rounded"
      :style="{
        top: '8px',
        left: `${hoverTooltipX}px`,
        pointerEvents: 'none',
        zIndex: 10,
      }"
    >
      <div><strong>{{ xLabel }}:</strong> {{ hoverPoint.x.toFixed(2) }} {{ xUnit }}</div>
      <div><strong>{{ yLabel }}:</strong> {{ hoverPoint.y.toFixed(1) }} {{ yUnit }}</div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export interface Point {
  x: number,
  y: number,
}

interface MappedPoint extends Point {
  px: number,
  py: number,
}

interface Props {
  points: Point[],
  xLabel: string,
  yLabel: string,
  xUnit?: string,
  yUnit?: string,
  color?: string,
  fillColor?: string,
}

const props = withDefaults(defineProps<Props>(), {
  xUnit: 'km',
  yUnit: 'm',
  color: '#2196F3',
  fillColor: 'rgba(33, 150, 243, 0.12)',
})

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hoverIndex = ref<number | null>(null)

let rafId: number | null = null
let mappedPoints: MappedPoint[] = []

// Padding with expanded left margin to fit units like "1200 m" or "120 min"
const padding = { top: 15, right: 20, bottom: 35, left: 60 }

const bounds = computed(() => {
  if (props.points.length === 0) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 }
  }
  const xVals = props.points.map((p) => p.x)
  const yVals = props.points.map((p) => p.y)

  return {
    minX: Math.min(...xVals),
    maxX: Math.max(...xVals),
    minY: Math.min(...yVals),
    maxY: Math.max(...yVals),
  }
})

const hoverPoint = computed(() => {
  if (hoverIndex.value === null || !mappedPoints[hoverIndex.value]) {
    return null
  }
  return mappedPoints[hoverIndex.value]
})

const hoverTooltipX = computed(() => {
  if (!hoverPoint.value || !containerRef.value) {
    return 0
  }
  const width = containerRef.value.clientWidth
  return Math.min(Math.max(hoverPoint.value.px - 50, 10), width - 130)
})

function updateCanvasSize() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) {
    return
  }

  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  drawChart()
}

function processMappedPoints(width: number, height: number) {
  if (props.points.length === 0) {
    mappedPoints = []
    return
  }

  const { minX, maxX, minY, maxY } = bounds.value
  const drawWidth = width - padding.left - padding.right
  const drawHeight = height - padding.top - padding.bottom

  const xRange = maxX - minX || 1
  const yRange = maxY - minY || 1

  mappedPoints = props.points.map((p) => ({
    ...p,
    px: padding.left + ((p.x - minX) / xRange) * drawWidth,
    py: height - padding.bottom - ((p.y - minY) / yRange) * drawHeight,
  }))
}

function drawChart() {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const dpr = window.devicePixelRatio || 1
  const width = canvas.width / dpr
  const height = canvas.height / dpr

  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  processMappedPoints(width, height)

  if (mappedPoints.length === 0) {
    ctx.restore()
    return
  }

  const { minX, maxX, minY, maxY } = bounds.value
  const bottomY = height - padding.bottom

  // Axis lines
  ctx.strokeStyle = '#bdbdbd'
  ctx.lineWidth = 1
  ctx.beginPath()

  // Left Y-axis line
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, bottomY)

  // Bottom X-axis line
  ctx.lineTo(width - padding.right, bottomY)
  ctx.stroke()

  // Font setup
  ctx.font = '11px system-ui, -apple-system, Roboto, sans-serif'
  ctx.fillStyle = '#757575'

  // Draw Y-Axis Ticks & Values with Y-Unit
  const ySteps = 3
  for (let i = 0; i <= ySteps; i++) {
    const ratio = i / ySteps
    const yVal = minY + (maxY - minY) * ratio
    const py = bottomY - ratio * (height - padding.top - padding.bottom)

    // Tick line
    ctx.beginPath()
    ctx.moveTo(padding.left - 4, py)
    ctx.lineTo(padding.left, py)
    ctx.stroke()

    // Value text with unit suffix
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.round(yVal)} ${props.yUnit}`, padding.left - 7, py)
  }

  // Draw X-Axis Ticks & Values with X-Unit
  const xSteps = 4
  for (let i = 0; i <= xSteps; i++) {
    const ratio = i / xSteps
    const xVal = minX + (maxX - minX) * ratio
    const px = padding.left + ratio * (width - padding.left - padding.right)

    // Tick line
    ctx.beginPath()
    ctx.moveTo(px, bottomY)
    ctx.lineTo(px, bottomY + 4)
    ctx.stroke()

    // Value text
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`${xVal.toFixed(1)} ${props.xUnit}`, px, bottomY + 7)
  }

  // Draw Fill Area
  const first = mappedPoints[0]
  const last = mappedPoints[mappedPoints.length - 1]

  ctx.fillStyle = props.fillColor
  ctx.beginPath()
  ctx.moveTo(first.px, bottomY)
  for (const p of mappedPoints) {
    ctx.lineTo(p.px, p.py)
  }
  ctx.lineTo(last.px, bottomY)
  ctx.closePath()
  ctx.fill()

  // Draw Main Line
  ctx.strokeStyle = props.color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(first.px, first.py)
  for (let i = 1; i < mappedPoints.length; i++) {
    ctx.lineTo(mappedPoints[i].px, mappedPoints[i].py)
  }
  ctx.stroke()

  // Draw Hover Marker & Crosshair
  if (hoverIndex.value !== null && mappedPoints[hoverIndex.value]) {
    const active = mappedPoints[hoverIndex.value]

    ctx.strokeStyle = '#9e9e9e'
    ctx.setLineDash([2, 2])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(active.px, padding.top)
    ctx.lineTo(active.px, bottomY)
    ctx.stroke()

    ctx.setLineDash([])
    ctx.fillStyle = props.color
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(active.px, active.py, 4.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  ctx.restore()
}

function binarySearchClosest(targetPx: number): number {
  let low = 0
  let high = mappedPoints.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (mappedPoints[mid].px < targetPx) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  if (low >= mappedPoints.length) {
    return mappedPoints.length - 1
  }
  if (high < 0) {
    return 0
  }

  const distLow = Math.abs(mappedPoints[low].px - targetPx)
  const distHigh = Math.abs(mappedPoints[high].px - targetPx)

  return distLow < distHigh ? low : high
}

function onMouseMove(event: MouseEvent) {
  if (rafId !== null) {
    return
  }

  const clientX = event.clientX

  rafId = requestAnimationFrame(() => {
    rafId = null

    if (!containerRef.value || mappedPoints.length === 0) {
      return
    }

    const rect = containerRef.value.getBoundingClientRect()
    const targetPx = clientX - rect.left

    const newIndex = binarySearchClosest(targetPx)
    if (hoverIndex.value !== newIndex) {
      hoverIndex.value = newIndex
      drawChart()
    }
  })
}

function onMouseLeave() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  hoverIndex.value = null
  drawChart()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateCanvasSize()

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => props.points, () => {
  drawChart()
}, { deep: true })
</script>