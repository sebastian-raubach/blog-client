import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

let name = process.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'blog-' + window.location.pathname
}

export default new Vuex.Store({
  state: {
    token: null,
    baseUrl: null
  },
  getters: {
    storeToken: (state) => state.token,
    storeBaseUrl: (state) => state.baseUrl
  },
  mutations: {
    ON_TOKEN_CHANGED: function (state, newToken) {
      if (newToken === null) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }

      state.token = newToken
    },
    ON_BASE_URL_CHANGED: function (state, newBaseUrl) {
      state.baseUrl = newBaseUrl
    }
  },
  actions: {
    setToken: function ({ commit }, token) {
      commit('ON_TOKEN_CHANGED', token)
    },
    setBaseUrl: function ({ commit }, baseUrl) {
      commit('ON_BASE_URL_CHANGED', baseUrl)
    }
  },
  plugins: [createPersistedState({ key: name })]
})
