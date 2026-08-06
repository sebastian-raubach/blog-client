import type { Point } from '@/components/HikeStatsChart.vue'
import type { ImageDetails, PostImage } from '@/plugins/types/blog'

interface Color {
  r: number
  g: number
  b: number
}

export function getPrimaryColor (): string {
  const rgb = getComputedStyle(document.documentElement).getPropertyValue('--v-theme-primary').split(',').map(s => +s.trim())
  return rgbToHex({ r: rgb[0] || 0, g: rgb[1] || 0, b: rgb[2] || 0 })
}

export function rgbToHex (c: Color) {
  return `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`
}

export function getPrimaryImage (images: PostImage[]) {
  if (images && images.length > 0) {
    const result = images.find(i => i.imageIsPrimary)

    if (result) {
      return result
    } else {
      return images[0]
    }
  } else {
    return undefined
  }
}

export function formatMinutesToDHM(totalMinutes: number) {
  const roundedMinutes = Math.round(totalMinutes)
  const days = Math.floor(roundedMinutes / 1440)
  const hours = Math.floor((roundedMinutes % 1440) / 60)
  const minutes = roundedMinutes % 60

  return {
    d: days,
    h: hours,
    m: minutes,
  }
}

export function pad (num: number): string {
  return String(num).padStart(2, '0')
}

export async function parseTsvContentToPoint(tsvBlob: Blob, swapColumns = false): Promise<Point[]> {
  const text = await tsvBlob.text()
  const lines = text.trim().split(/\r?\n/)
  const points: Point[] = []

  for (const line of lines) {
    const columns = line.split('\t').map((col) => col.trim())
    if (columns.length < 2) {
      continue
    }

    let xVal = parseFloat(columns[0])
    let yVal = parseFloat(columns[1])

    if (swapColumns) {
      [xVal, yVal] = [yVal, xVal]
    }

    if (!isNaN(xVal) && !isNaN(yVal)) {
      points.push({
        x: xVal,
        y: yVal,
      })
    }
  }

  return points
}
