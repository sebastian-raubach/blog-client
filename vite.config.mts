import VueRouter from 'vue-router/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { VueRouterAutoImports } from 'vue-router/unplugin'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [VueRouter({ dts: 'src/typed-router.d.ts' }),
  Components({
    dts: 'src/components.d.ts',
  }),
  Vue({
    template: { transformAssetUrls },
  }), // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
  Vuetify({
    autoImport: true,
    styles: {
      configFile: 'src/styles/settings.scss',
    },
  }),
  AutoImport({
    imports: [
      'vue',
      VueRouterAutoImports,
      {
        pinia: ['defineStore', 'storeToRefs'],
      },
    ],
    dts: 'src/auto-imports.d.ts',
    eslintrc: {
      enabled: true,
    },
    vueTemplate: true,
  }),
  Fonts({
    fontsource: {
      families: [
        {
          name: 'Roboto',
          weights: [100, 300, 400, 500, 700, 900],
          styles: ['normal', 'italic'],
        },
      ],
    },
  })],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})