export default {
  data: function () {
    return {
      MAX_JAVA_INTEGER: 2147483647,
      hillTypes: {
        munro: {
          name: 'Munro',
          icon: 'icofont-hill icofont-5x',
          count: 282,
          iconSize: [60, 66]
        },
        corbett: {
          name: 'Corbett',
          icon: 'icofont-hill icofont-4x',
          count: 222,
          iconSize: [48, 52]
        },
        graham: {
          name: 'Graham',
          icon: 'icofont-hill icofont-3x',
          count: 219,
          iconSize: [36, 40]
        },
        donald: {
          name: 'Donald',
          icon: 'icofont-hill icofont-2x',
          count: 89,
          iconSize: [24, 26]
        },
        sub2000: {
          name: 'Sub-2000',
          icon: 'icofont-hill icofont-1x',
          count: 573,
          iconSize: [12, 14]
        },
        other: {
          name: 'None',
          icon: 'icofont-ban icofont-1x',
          count: null,
          iconSize: [12, 14]
        }
      }
    }
  },
  methods: {
    /**
     * Generates a v4 UUID
     */
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}
