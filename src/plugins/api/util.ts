import type { Individuals, LoginDetails, Token } from '@/plugins/types/blog'
import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiGetIndividuals (onSuccess?: (args: Individuals[]) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'individual', method: 'GET', success: onSuccess, error: onError })
}

export function apiPostToken (data: LoginDetails, onSuccess?: (args: Token) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'token', method: 'post', data: data, success: onSuccess, error: onError })
}
