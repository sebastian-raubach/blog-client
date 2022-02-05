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
    axios: function ({ url = null, params = null, data = null, method = 'get', dataType = 'json', contentType = 'application/json; charset=utf-8', useAuth = true, success = null, error = null }) {
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
        Authorization: 'Bearer ' + this.getToken()
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
      return this.axios({ url: 'post', method: 'post', params: { postType: 'news' }, data: data, success: onSuccess, error: onError })
    },
    apiPostHikeList: function (data, onSuccess, onError) {
      return this.axios({ url: 'post', method: 'post', params: { postType: 'hike' }, data: data, success: onSuccess, error: onError })
    },
    apiGetPost: function (postId, onSuccess, onError) {
      return this.axios({ url: `post/${postId}`, success: onSuccess, error: onError })
    },
    apiGetStory: function (storyId, onSuccess, onError) {
      return this.axios({ url: `story/${storyId}`, success: onSuccess, error: onError })
    },
    apiPostToken: function (data, onSuccess, onError) {
      return this.axios({ url: 'token', method: 'post', data: data, success: onSuccess, error: onError })
    },
    apiPutPost: function (data, onSuccess, onError) {
      return this.axios({ url: 'import/post', method: 'put', data: data, success: onSuccess, error: onError })
    },
    apiPostPostMedia: function (postId, formData, onSuccess, onError) {
      return this.axios({ url: `post/media/${postId}`, method: 'post', contentType: 'multipart/form-data', data: formData, success: onSuccess, error: onError })
    },
    apiGetGpx: function (postId, onSuccess, onError) {
      return this.axios({ url: `post/${postId}/gpx`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiGetTimeDistanceProfile: function (postId, onSuccess, onError) {
      return this.axios({ url: `post/${postId}/time-distance`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiGetElevationProfile: function (postId, onSuccess, onError) {
      return this.axios({ url: `post/${postId}/elevation`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiGetHikeYears: function (onSuccess, onError) {
      return this.axios({ url: 'post/years', params: { postType: 'hike' }, success: onSuccess, error: onError })
    },
    apiGetPostYears: function (onSuccess, onError) {
      return this.axios({ url: 'post/years', params: { postType: 'news' }, success: onSuccess, error: onError })
    },
    apiGetHillTypes: function (onSuccess, onError) {
      return this.axios({ url: 'hill/types', success: onSuccess, error: onError })
    },
    apiGetHikesForYear: function (year, onSuccess, onError) {
      return this.axios({ url: 'post', params: { year: year, postType: 'hike' }, success: onSuccess, error: onError })
    },
    apiGetPostsForYear: function (year, onSuccess, onError) {
      return this.axios({ url: 'post', params: { year: year, postType: 'news' }, success: onSuccess, error: onError })
    },
    apiGetHills: function (name, onSuccess, onError) {
      return this.axios({ url: 'hill', params: { name: name }, success: onSuccess, error: onError })
    },
    apiPutStory: function (data, onSuccess, onError) {
      return this.axios({ url: 'import/story', method: 'put', data: data, success: onSuccess, error: onError })
    },
    apiPutStoryPosts: function (storyId, data, onSuccess, onError) {
      return this.axios({ url: `import/story/${storyId}/post`, method: 'put', data: data, success: onSuccess, error: onError })
    },
    apiPostStoryList: function (data, params, onSuccess, onError) {
      return this.axios({ url: 'story', method: 'post', data: data, params: params, success: onSuccess, error: onError })
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
