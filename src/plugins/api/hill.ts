import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { HillRequest, HillTypeCount, ViewHills } from '@/plugins/types/blog'

export function apiGetHillTypes (onSuccess?: (args: HillTypeCount[]) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'hill/types', method: 'GET', success: onSuccess, error: onError })
}

export function apiPostHills (data: HillRequest, onSuccess?: (args: ViewHills[]) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'hill', method: 'POST', data, success: onSuccess, error: onError })
}

export function apiGetHillById (hillId: number, onSuccess?: (args: ViewHills) => void, onError?: ErrorHandler) {
  return authAxios({ url: `hill/${hillId}`, method: 'GET', success: onSuccess, error: onError })
}