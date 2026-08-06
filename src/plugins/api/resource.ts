import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiGetElevationProfile (postId: number, onSuccess?: (args: Blob) => void, onError?: ErrorHandler) {
  return authAxios({ url: `post/${postId}/elevation`, dataType: 'blob', method: 'GET', success: onSuccess, error: onError })
}

export function apiGetTimeDistanceProfile (postId: number, onSuccess?: (args: Blob) => void, onError?: ErrorHandler) {
  return authAxios({ url: `post/${postId}/time-distance`, dataType: 'blob', method: 'GET', success: onSuccess, error: onError })
}