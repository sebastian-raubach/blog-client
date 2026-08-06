import { coreStore } from '@/stores/app'
import router from '@/router'
import axios, { AxiosError, type AxiosResponse, type ResponseType } from 'axios'

import emitter from 'tiny-emitter/instance'

const MAX_JAVA_INTEGER = 2_147_483_647

/**
 * Returns the current authentication token
 */
export function getToken () {
  const store = coreStore()
  let t = store.storeToken

  // Check if the token is still valid
  if (t && ((Date.now() - new Date(t.createdOn).getTime()) > t.lifetime)) {
    t = undefined
    store.setToken(t)
  }

  return t ? t.token : null
}

export function handleError (error: AxiosResponse) {
  const store = coreStore()
  emitter.emit('show-loading', false)
  const variant = 'error'
  const title = 'genericError'
  let message = error.statusText

  switch (error.status) {
    case 400:
      message = 'httpErrorFourOO'
      break
    case 401:
      message = 'httpErrorFourOOne'
      store.setToken(undefined)
      router.push({ path: '/login', query: { redirect: router.currentRoute?.value?.fullPath || '/' } })
      break
    case 403: {
      message = 'httpErrorFourOThree'
      store.setToken(undefined)
      router.push({ path: '/login', query: { redirect: router.currentRoute?.value?.fullPath || '/' } })
      break
    }
    case 404:
      message = 'httpErrorFourOFour'
      break
    case 405:
      message = 'httpErrorFourOFour'
      break
    case 408:
      message = 'httpErrorFourOEight'
      break
    case 409:
      message = 'httpErrorFourONine'
      break
    case 410:
      message = 'httpErrorFourTen'
      break
    case 500:
      message = 'httpErrorFiveOO'
      break
    case 501:
      message = 'httpErrorFiveOOne'
      break
    case 503:
      message = 'httpErrorFiveOThree'
      break
  }

  emitter.emit('show-snackbar', {
    text: message,
    title,
    color: variant,
    timeout: 5000,
  })

  return message
}

export interface ErrorHandler {
  codes: number[]
  callback: (error: AxiosResponse) => void
}

/**
 * Sends a FORM to the given URL using authentication
 * @param {Object} param0 `{ url: String, formData: Object, method: String, success: Callback, error: { codes: [], callback: Callback } }`
 */
export function authForm<T> ({ url = undefined, formData, method = 'post', success = undefined, error = { codes: [], callback: handleError } }: { url?: string, formData?: any | undefined, method?: string, success?: (args: T) => void, error?: ErrorHandler }) {
  const store = coreStore()
  const promise = axios<T>({
    baseURL: store.storeBaseUrl,
    url,
    method: method || 'post',
    data: formData,
    // crossDomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
  })

  promise.then(result => {
    const t = store.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((Date.now() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = Date.now()
      store.setToken(t)
    }

    if (success) {
      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 403) {
          store.setToken(undefined)
          router.push({ path: '/login', query: { redirect: router.currentRoute?.value?.fullPath || '/' } })
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          error.callback(err.response)
        } else {
          handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true,
        })
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }
  })

  return promise
}

/**
 * Sends an Axios request to the server using authentication
 * @param {Object} param0 `{ url: String, method: String, data: Object, formData: Object, dataType: String, contentType: String, success: Callback, error: { codes: [], callback: Callback } }`
 */
export function authAxios<T> ({ url = undefined, method = 'GET', data = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = undefined, error = { codes: [], callback: handleError } }: { url?: string, data?: any, dataType?: ResponseType, contentType?: string, method?: string, success?: (args: T) => void, error?: ErrorHandler }) {
  const store = coreStore()

  let requestData = null
  let requestParams = null

  // Stringify the data object for non-GET requests
  if (data !== null || data !== undefined) {
    if (method === 'GET') {
      requestParams = data
    } else {
      requestData = data
    }
  }

  const promise = axios<T>({
    baseURL: store.storeBaseUrl,
    url,
    method,
    data: requestData,
    params: requestParams,
    // crossDomain: true,
    responseType: dataType,
    withCredentials: true,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${getToken()}`,
    },
  })

  promise.then(result => {
    const t = store.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((Date.now() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = Date.now()
      store.setToken(t)
    }

    if (success) {
      if (dataType === 'blob' && result.headers && result.headers['content-disposition']) {
        const filename = result.headers['content-disposition']
          .split(';')
          .map((p: string) => p.trim())
          .filter((p: string) => p.indexOf('filename') === 0)
          .map((p: string) => p.replace('filename=', ''))

        if (filename && filename.length > 0) {
          // @ts-expect-error
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
        if (err.response.status === 403) {
          store.setToken(undefined)
          router.push({ path: '/login', query: { redirect: router.currentRoute?.value?.fullPath || '/' } })
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          return error.callback(err.response)
        } else {
          return handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.statusText === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true,
        })
      } else if (error.codes.length === 0) {
        return error.callback(err)
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }

    throw err
  })

  return promise
}

export {
  MAX_JAVA_INTEGER,
}
