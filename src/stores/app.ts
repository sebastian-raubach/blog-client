// Utilities
import type { Token } from '@/plugins/types/blog'
import { defineStore } from 'pinia'

import emitter from 'tiny-emitter/instance'

let name = import.meta.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'blog-' + window.location.pathname
}

export const coreStore = defineStore('blog', {
  state: () => ({
    bannerIndex: 0,
    token: undefined as Token | undefined,
    baseUrl: undefined as string | undefined,
  }),
  getters: {
    storeBannerIndex: (state): number => state.bannerIndex ?? 0,
    storeToken: (state): Token | undefined => state.token,
    storeBaseUrl: (state): string | undefined => state.baseUrl,
  },
  actions: {
    setToken (newToken: Token | undefined) {
      if (!newToken) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      } else {
        emitter.emit('logged-in')
      }

      this.token = newToken
    },
    setBaseUrl (newBaseUrl: string) {
      this.baseUrl = newBaseUrl
    },
    setBannerIndex (newBannerIndex: number) {
      this.bannerIndex = Math.abs(newBannerIndex ?? 0) % 3
    }
  },
  persist: {
    key: name,
  },
})
