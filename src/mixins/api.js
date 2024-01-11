import store from '@/store'

const axios = require('axios').default
const emitter = require('tiny-emitter/instance')

/**
     * Sends an axios REST request to the server with the given parameter configuration
     * @param {String} url The remote URL (relative) to send the request to
     * @param {Object} params (Optional) Request payload in the form of a Javascript object
     * @param {String} method (Optional) REST method (default: `'get'`)
     * @returns Promise
     */
const axiosCall = ({ url = null, params = null, data = null, method = 'get', dataType = 'json', contentType = 'application/json; charset=utf-8', useAuth = true, success = null, error = null }) => {
  let requestData = null
  let requestParams = null

  // Stringify the data object for non-GET requests
  if (params !== undefined && params !== null) {
    requestParams = params
  }
  if (data !== undefined && data !== null) {
    requestData = data
  }

  const headers = {
    'Content-Type': contentType,
    Authorization: 'Bearer ' + getToken()
  }

  if (!useAuth) {
    delete headers.Authorization
  }

  const promise = axios({
    url: url,
    params: requestParams,
    data: requestData,
    method: method,
    crossDomain: true,
    responseType: dataType,
    headers: headers
  })

  promise.then(result => {
    const t = store.getters.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = new Date().getTime()
      store.dispatch('setToken', t)
    }

    if (success) {
      if (dataType === 'blob' && result.headers && result.headers['content-disposition']) {
        const filename = result.headers['content-disposition']
          .split(';')
          .map(p => p.trim())
          .filter(p => p.indexOf('filename') === 0)
          .map(p => p.replace('filename=', ''))

        if (filename && filename.length > 0) {
          result.data.filename = filename[0]
        }
      }

      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 403 || err.response.status === 401) {
          store.dispatch('setToken', null)
          emitter.emit('set-loading', false)
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else {
        error(err.response)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Anfrage hat zu lange gedauert.',
          title: 'Fehler',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true
        })
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }
  })
}

const apiPostPostList = (data, onSuccess, onError) => {
  return axiosCall({ url: 'post', method: 'post', params: { postType: 'news' }, data: data, success: onSuccess, error: onError })
}
const apiPostHikeList = (data, onSuccess, onError) => {
  return axiosCall({ url: 'post', method: 'post', params: { postType: 'hike' }, data: data, success: onSuccess, error: onError })
}
const apiPostList = (data, onSuccess, onError) => {
  return axiosCall({ url: 'post', method: 'post', data: data, success: onSuccess, error: onError })
}
const apiGetPost = (postId, onSuccess, onError) => {
  return axiosCall({ url: `post/${postId}`, success: onSuccess, error: onError })
}
const apiGetStory = (storyId, onSuccess, onError) => {
  return axiosCall({ url: `story/${storyId}`, success: onSuccess, error: onError })
}
const apiPostToken = (data, onSuccess, onError) => {
  return axiosCall({ url: 'token', method: 'post', data: data, success: onSuccess, error: onError })
}
const apiPutPost = (data, onSuccess, onError) => {
  return axiosCall({ url: 'import/post', method: 'put', data: data, success: onSuccess, error: onError })
}
const apiPatchPost = (postId, data, onSuccess, onError) => {
  return axiosCall({ url: `post/${postId}`, method: 'patch', data: data, success: onSuccess, error: onError })
}
const apiPostPostMedia = (postId, formData, onSuccess, onError) => {
  return axiosCall({ url: `post/media/${postId}`, method: 'post', contentType: 'multipart/form-data', data: formData, success: onSuccess, error: onError })
}
const apiGetGpx = (postId, onSuccess, onError) => {
  return axiosCall({ url: `post/${postId}/gpx`, dataType: 'blob', success: onSuccess, error: onError })
}
const apiGetTimeDistanceProfile = (postId, onSuccess, onError) => {
  return axiosCall({ url: `post/${postId}/time-distance`, dataType: 'blob', success: onSuccess, error: onError })
}
const apiGetElevationProfile = (postId, onSuccess, onError) => {
  return axiosCall({ url: `post/${postId}/elevation`, dataType: 'blob', success: onSuccess, error: onError })
}
const apiGetHikeYears = (onSuccess, onError) => {
  return axiosCall({ url: 'post/years', params: { postType: 'hike' }, success: onSuccess, error: onError })
}
const apiGetPostYears = (onSuccess, onError) => {
  return axiosCall({ url: 'post/years', params: { postType: 'news' }, success: onSuccess, error: onError })
}
const apiGetHillTypes = (onSuccess, onError) => {
  return axiosCall({ url: 'hill/types', success: onSuccess, error: onError })
}
const apiGetPosts = (params, onSuccess, onError) => {
  return axiosCall({ url: 'post', params: params, success: onSuccess, error: onError })
}
const apiGetStories = (params, onSuccess, onError) => {
  return axiosCall({ url: 'story', params: params, success: onSuccess, error: onError })
}
const apiGetHills = (name, onSuccess, onError) => {
  return axiosCall({ url: 'hill', params: { name: name }, success: onSuccess, error: onError })
}
const apiPutStory = (data, onSuccess, onError) => {
  return axiosCall({ url: 'import/story', method: 'put', data: data, success: onSuccess, error: onError })
}
const apiPutStoryPosts = (storyId, data, onSuccess, onError) => {
  return axiosCall({ url: `import/story/${storyId}/post`, method: 'put', data: data, success: onSuccess, error: onError })
}
const apiGetPostRelated = (postId, onSuccess, onError) => {
  return axiosCall({ url: `post/${postId}/related`, success: onSuccess, error: onError })
}
const apiPostRelatedPostIds = (postId, postIds, onSuccess, onError) => {
  return axiosCall({ url: `post/${postId}/related`, method: 'post', data: postIds, success: onSuccess, error: onError })
}
const apiPostStoryList = (data, params, onSuccess, onError) => {
  return axiosCall({ url: 'story', method: 'post', data: data, params: params, success: onSuccess, error: onError })
}
const apiGetSettings = (onSuccess, onError) => {
  return axiosCall({ url: 'settings', success: onSuccess, error: onError })
}
/**
 * Returns the current authentication token
 */
const getToken = () => {
  let t = store.getters.storeToken

  // Check if the token is still valid
  if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
    t = null
    store.dispatch('setToken', t)
  }

  return t ? t.token : null
}

export {
  axiosCall,
  apiPostPostList,
  apiPostHikeList,
  apiPostList,
  apiGetPost,
  apiGetStory,
  apiPostToken,
  apiPutPost,
  apiPatchPost,
  apiPostPostMedia,
  apiGetGpx,
  apiGetTimeDistanceProfile,
  apiGetElevationProfile,
  apiGetHikeYears,
  apiGetPostYears,
  apiGetHillTypes,
  apiGetPosts,
  apiGetStories,
  apiGetHills,
  apiPutStory,
  apiPutStoryPosts,
  apiGetPostRelated,
  apiPostRelatedPostIds,
  apiPostStoryList,
  apiGetSettings,
  getToken
}
