import type { PaginatedRequest, ViewStories } from '@/plugins/types/blog'
import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiPostStories (data: PaginatedRequest, onSuccess?: (args: ViewStories[]) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'story', method: 'POST', data, success: onSuccess, error: onError })
}

export function apiGetStoryById (storyId: number, onSuccess?: (args: ViewStories) => void, onError?: ErrorHandler) {
  return authAxios({ url: `story/${storyId}`, method: 'GET', success: onSuccess, error: onError })
}

export function apiPutStory (data: ViewStories, onSuccess?: (args: number) => void, onError?: ErrorHandler) {
  return authAxios({ url: 'import/story', data, method: 'PUT', success: onSuccess, error: onError })
}

export function apiPatchStory (storyId: number, data: ViewStories, onSuccess?: (args: number) => void, onError?: ErrorHandler) {
  return authAxios({ url: `import/story/${storyId}`, data, method: 'PATCH', success: onSuccess, error: onError })
}
