import router from '@/router'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import vuetify from '@/plugins/vuetify'
import MarkdownModule from 'vue3-markdown-it'
import { useAppNavigation } from '@/plugins/composables/useAppNavigation'

// Initialize history tracking
const { initHistoryTracker } = useAppNavigation(router)
initHistoryTracker()

// Check if it's wrapped in a Module object and unwrap .default
const Markdown = MarkdownModule.default || MarkdownModule

export function registerPlugins (app: App) {
const pinia = createPinia()
 pinia.use(piniaPluginPersistedstate)

 app.use(vuetify)
 app.use(pinia)
 app.component('Markdown', Markdown)
 app.use(router)
}