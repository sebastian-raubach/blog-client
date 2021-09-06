import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
  },
  {
    path: '/hike',
    name: 'hikes',
    component: () => import(/* webpackChunkName: "hikes" */ '@/views/Hikes.vue')
  },
  {
    path: '/hike/:year',
    name: 'hikes-year',
    component: () => import(/* webpackChunkName: "hikes-year" */ '@/views/Hikes.vue')
  },
  {
    path: '/hike/:hikeId',
    name: 'hike-details',
    component: () => import(/* webpackChunkName: "hike-details" */ '@/views/HikeDetails.vue')
  },
  {
    path: '/hills',
    name: 'hills',
    component: () => import(/* webpackChunkName: "hills" */ '@/views/Hills.vue')
  },
  {
    path: '/post-editor',
    name: 'post-editor',
    component: () => import(/* webpackChunkName: "post-editor" */ '@/views/PostEditor.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/pages/Page403.vue')
  }
]

function requireAuth (to, from, next) {
  const token = store.getters.storeToken

  if (!token) {
    next({ name: '403' })
  } else {
    next()
  }
}

const router = new VueRouter({
  mode: 'hash',
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: routes
})

export default router
