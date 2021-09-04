import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import mixin from '@/mixins/mixin'

import {
  FormPlugin,
  FormInputPlugin,
  FormGroupPlugin,
  ButtonPlugin,
  ButtonGroupPlugin,
  ImagePlugin,
  LayoutPlugin,
  NavbarPlugin,
  ModalPlugin,
  FormRatingPlugin,
  InputGroupPlugin,
  MediaPlugin,
  FormFilePlugin,
  FormRadioPlugin,
  FormTextareaPlugin,
  CardPlugin,
  ButtonToolbarPlugin,
  CollapsePlugin,
  BadgePlugin,
  FormSelectPlugin,
  CarouselPlugin,
  EmbedPlugin,
  SpinnerPlugin,
  ProgressPlugin
} from 'bootstrap-vue'

const axiosDefaults = require('axios/lib/defaults')

Vue.use(LayoutPlugin)
Vue.use(NavbarPlugin)
Vue.use(ImagePlugin)
Vue.use(FormPlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormInputPlugin)
Vue.use(ModalPlugin)
Vue.use(ButtonPlugin)
Vue.use(ButtonGroupPlugin)
Vue.use(FormRatingPlugin)
Vue.use(FormFilePlugin)
Vue.use(FormRadioPlugin)
Vue.use(FormSelectPlugin)
Vue.use(InputGroupPlugin)
Vue.use(MediaPlugin)
Vue.use(FormTextareaPlugin)
Vue.use(CardPlugin)
Vue.use(ButtonToolbarPlugin)
Vue.use(CollapsePlugin)
Vue.use(BadgePlugin)
Vue.use(CarouselPlugin)
Vue.use(EmbedPlugin)
Vue.use(SpinnerPlugin)
Vue.use(ProgressPlugin)
Vue.use(NavbarPlugin)

Vue.config.productionTip = false

// Set base URL based on environment
let baseUrl = './'

if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}

axiosDefaults.baseURL = baseUrl

store.commit('ON_BASE_URL_CHANGED', baseUrl)

Vue.mixin(mixin)

const moment = require('moment')
// Date formatting
Vue.filter('toDate', value => {
  if (value === null || value === undefined) {
    return null
  }
  let result
  if (value.indexOf('-') !== -1) {
    result = moment(value)
  } else {
    result = moment(value, 'MMM D, YYYY')
  }
  return result.format('DD/MM/YYYY')
})
Vue.filter('minutesToTime', value => {
  const s = value * 60
  let hours = Math.floor(s / 3600)
  let minutes = Math.floor((s - (hours * 3600)) / 60)
  let seconds = s - (hours * 3600) - (minutes * 60)

  if (hours < 10) { hours = '0' + hours }
  if (minutes < 10) { minutes = '0' + minutes }
  if (seconds < 10) { seconds = '0' + seconds }
  return hours + ':' + minutes + ':' + seconds
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
