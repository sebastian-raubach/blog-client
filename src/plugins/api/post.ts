import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { ImageDetails, PostImport, PostRequest, PostsitesGroundtype, ViewPosts, YearCount } from '@/plugins/types/blog'

export function apiGetPost (postId: number, onSuccess?: (args: ViewPosts) => void, onError?: ErrorHandler) {
  return authAxios({ url: `post/${postId}`, method: 'GET', success: onSuccess, error: onError })
}

export function apiPostRelatedPosts (postId: number, related: number[], onSuccess?: (args: void) => void, onError?: ErrorHandler) {
  return authAxios({ url: `post/${postId}/related`, method: 'POST', data: related, success: onSuccess, error: onError })
}

export function apiPostPosts (data: PostRequest, onSuccess?: (args: ViewPosts[]) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'post', method: 'POST', data, success: onSuccess, error: onError })
}

export function apiGetPostYears (params: any, onSuccess?: (args: YearCount[]) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'post/years', data: params, method: 'GET', success: onSuccess, error: onError })
}

export function apiPostPostImages (postId: number, formData: FormData, onSuccess?: (args: boolean) => void, onError?: ErrorHandler) {
  return authAxios({ url: `post/media/${postId}`, method: 'post', contentType: 'multipart/form-data', data: formData, success: onSuccess, error: onError })
}

export function apiPatchPostImages (postId: number, imageUpdate: ImageDetails[], onSuccess?: (args: boolean) => void, onError?: ErrorHandler) {
  return authAxios({ url: `post/media/${postId}`, method: 'patch', data: imageUpdate, success: onSuccess, error: onError })
}

export function apiPutImportPost (data: PostImport, onSuccess?: (args: number) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'import/post', data, method: 'PUT', success: onSuccess, error: onError })
}

export function apiPatchImportPost (postId: number, data: PostImport, onSuccess?: (args: number) => void, onError?: ErrorHandler) {
  return authAxios({ url: `import/post/${postId}`, data, method: 'PATCH', success: onSuccess, error: onError })
}

export function apiPostPostSite (postId: number, siteId: number, groundType: PostsitesGroundtype, onSuccess?: (args: boolean) => void, onError?: ErrorHandler) {
  return authAxios({ url: `post/${postId}/site/${siteId}`, data: groundType, method: 'POST', success: onSuccess, error: onError })
}
