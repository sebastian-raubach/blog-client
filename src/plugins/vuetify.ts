/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify, type IconAliases } from 'vuetify'

import { aliases as defaultAliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { VAvatarGroup } from 'vuetify/labs/VAvatarGroup'

// Styles
import 'vuetify/styles'

const aliases: IconAliases = {
  ...defaultAliases,
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VAvatarGroup,
  },
  theme: {
    defaultTheme: 'system',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#0079ed',
          background: '#192531',
          surface: '#2c3e50',
          info: '#2980b9',
          success: '#27ae60',
          error: '#c0392b',
          warning: '#f39c12',
        }
      },
      light: {
        dark: false,
        colors: {
          primary: '#0079ed',
          background: '#192531',
          surface: '#2c3e50',
          info: '#2980b9',
          success: '#27ae60',
          error: '#c0392b',
          warning: '#f39c12',
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
