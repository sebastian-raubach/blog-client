const axios = require('axios').default

export default {
  methods: {
    /**
     * Sends an axios REST request to the server with the given parameter configuration
     * @param {String} url The remote URL (relative) to send the request to
     * @param {Object} params (Optional) Request payload in the form of a Javascript object
     * @param {String} method (Optional) REST method (default: `'get'`)
     * @returns Promise
     */
    axios: function ({ url = null, params = null, method = 'get', dataType = 'json', contentType = 'application/json; charset=utf-8', success = null, error = null }) {
      let requestData = null
      let requestParams = null

      // Stringify the data object for non-GET requests
      if (params !== null || params !== undefined) {
        if (method === 'get') {
          requestParams = params
        } else {
          requestData = params
        }
      }

      const promise = axios({
        url: url,
        params: requestParams,
        data: requestData,
        method: method,
        crossDomain: true,
        responseType: dataType,
        headers: {
          'Content-Type': contentType,
          Authorization: 'Bearer ' + this.getToken()
        }
      })

      promise.then(result => {
        const t = this.$store.getters.storeToken

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          this.$store.dispatch('setToken', t)
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
              this.$store.dispatch('setToken', null)
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else {
            error(err.response)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            this.$bvToast.toast('Anfrage hat zu lange gedauert.', {
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
    },
    apiPostPostList: function (data, onSuccess, onError) {
      return this.axios({ url: 'post', method: 'post', params: data, success: onSuccess, error: onError })
    },
    apiPostHikeList: function (data, onSuccess, onError) {
      return this.axios({ url: 'hike', method: 'post', params: data, success: onSuccess, error: onError })
    },
    apiGetHike: function (hikeId, onSuccess, onError) {
      return this.axios({ url: `hike/${hikeId}`, success: onSuccess, error: onError })
    },
    apiPostToken: function (data, onSuccess, onError) {
      return this.axios({ url: 'token', method: 'post', params: data, success: onSuccess, error: onError })
    },
    apiPutPost: function (data, onSuccess, onError) {
      return this.axios({ url: 'post/import', method: 'put', params: data, success: onSuccess, error: onError })
    },
    apiPostPostMedia: function (postId, formData, onSuccess, onError) {
      return this.axios({ url: `post/media/${postId}`, method: 'post', contentType: 'multipart/form-data', params: formData, success: onSuccess, error: onError })
    },
    apiGetGpx: function (hikeId, onSuccess, onError) {
      return this.axios({ url: `hike/${hikeId}/gpx`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiGetTimeDistanceProfile: function (hikeId, onSuccess, onError) {
      return this.axios({ url: `hike/${hikeId}/time-distance`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiGetElevationProfile: function (hikeId, onSuccess, onError) {
      return this.axios({ url: `hike/${hikeId}/elevation`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiGetHikeYears: function (onSuccess, onError) {
      return this.axios({ url: 'hike/years', success: onSuccess, error: onError })
    },
    apiGetHillTypes: function (onSuccess, onError) {
      return this.axios({ url: 'hill/types', success: onSuccess, error: onError })
    },
    apiGetHikesForYear: function (year, onSuccess, onError) {
      return this.axios({ url: 'hike', params: { year: year }, success: onSuccess, error: onError })
    },
    apiGetHills: function (name, onSuccess, onError) {
      return this.axios({ url: 'hill', params: { name: name }, success: onSuccess, error: onError })
    },
    /**
     * Returns the current authentication token
     */
    getToken: function () {
      let t = this.$store.getters.storeToken

      // Check if the token is still valid
      if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
        t = null
        this.$store.dispatch('setToken', t)
      }

      return t ? t.token : null
    }
  }
}
