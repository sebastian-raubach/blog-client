export default class ColorGradient {
  constructor (colors, steps) {
    this.$colors = colors
    this.$steps = steps

    this.createColorGradient(this.$steps)
  }

  getColor (index) {
    index = Math.max(0, index)
    index = Math.min(index, this.$gradient.length - 1)

    return this.$gradient[index]
  }

  length () {
    return this.$steps
  }

  getColorAt (min, max, value) {
    if (max === min) {
      return 'white'
    } else {
      const range = max - min
      const norm = (value - min) / range
      const index = Math.floor(norm * (this.$gradient.length - 1))

      return this.getColor(index)
    }
  }

  createColorGradient (steps) {
    if (this.$colors.length === 2) {
      this.$gradient = this._createColorGradient(this.$colors[0], this.$colors[1], steps)
    } else {
      this.$gradient = this._createMultiColorGradient(this.$colors, this.$steps)
    }
  }

  _createMultiColorGradient (colors, steps) {
    if (!colors || colors.length < 2) {
      return ['black', 'white']
    } else {
      // Assume a linear gradient with equal spacing between colors
      const numSections = colors.length - 1
      let gradientIndex = 0

      let gradient = []
      let temp = []

      for (let section = 0; section < numSections; section++) {
        // Divide the gradient into n-1 sections and calculate a regular gradient between any two colors
        temp = this._createColorGradient(colors[section], colors[section + 1], Math.floor(steps / numSections))
        gradient = gradient.concat(temp)
        gradientIndex += temp.length
      }

      // The rounding didn't quite work out equally, so fill the remaining bit with the final color.
      if (gradientIndex < steps) {
        for (/* nothing to initialize */; gradientIndex < steps; gradientIndex++) {
          gradient.push(colors[colors.length - 1])
        }
      }

      return gradient
    }
  }

  /**
   * Creates a linear gradient between the two given colors with the given number of steps
   * @param {String} one The first color in HEX
   * @param {String} two The second color in HEX
   * @param {Number} steps The number of steps between the two colors
   */
  _createColorGradient (one, two, steps) {
    const oneRgb = this.hexToRgb(one)
    const twoRgb = this.hexToRgb(two)

    const result = []
    for (let i = 0; i < steps; i++) {
      const iNorm = i / (steps - 1)
      result.push(this.rgbToHex(
        Math.floor(oneRgb.r + iNorm * (twoRgb.r - oneRgb.r)),
        Math.floor(oneRgb.g + iNorm * (twoRgb.g - oneRgb.g)),
        Math.floor(oneRgb.b + iNorm * (twoRgb.b - oneRgb.b))
      ))
    }
    return result
  }

  /**
   * Converts a HEX value into an RGB object
   * @param {String} hex The hex color
   */
  hexToRgb (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null
  }

  /**
   * Converts the given R, G, B values into a HEX color
   * @param {Number} r The red color component
   * @param {Number} g The green color component
   * @param {Number} b The blue color component
   */
  rgbToHex (r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }
}
