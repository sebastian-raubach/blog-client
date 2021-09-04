export default {
  data: function () {
    return {
      hillTypes: {
        munro: {
          name: 'Munro',
          icon: 'icofont-hill icofont-5x',
          count: 282
        },
        corbett: {
          name: 'Corbett',
          icon: 'icofont-hill icofont-4x',
          count: 222
        },
        graham: {
          name: 'Graham',
          icon: 'icofont-hill icofont-3x',
          count: 219
        },
        donald: {
          name: 'Donald',
          icon: 'icofont-hill icofont-2x',
          count: 89
        },
        sub2000: {
          name: 'Sub-2000',
          icon: 'icofont-hill icofont-1x',
          count: 573
        },
        other: {
          name: 'None',
          icon: 'icofont-ban icofont-1x',
          count: null
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
