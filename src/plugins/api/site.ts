import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { ViewSites } from '@/plugins/types/blog'

export function apiGetSites (onSuccess?: (args: ViewSites[]) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'site', method: 'GET', success: onSuccess, error: onError })
}

export function apiGetSiteById (siteId: number, onSuccess?: (args: ViewSites) => void, onError?: ErrorHandler) {
  return authAxios({ url: `site/${siteId}`, method: 'GET', success: onSuccess, error: onError })
}

export function apiPostSite (site: ViewSites, onSuccess?: (args: number) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'site', method: 'POST', data: site, success: onSuccess, error: onError })
}
