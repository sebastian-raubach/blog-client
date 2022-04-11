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
    component: {
      render (c) { return c('router-view') }
    },
    children: [
      {
        path: '',
        name: 'hikes',
        component: () => import(/* webpackChunkName: "hikes" */ '@/views/Hikes.vue')
      },
      {
        path: 'hills',
        name: 'hills',
        component: () => import(/* webpackChunkName: "hills" */ '@/views/Hills.vue')
      },
      {
        path: ':year',
        name: 'hikes-year',
        component: () => import(/* webpackChunkName: "hikes-year" */ '@/views/Hikes.vue')
      }
    ]
  },
  {
    path: '/search',
    name: 'search',
    component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue')
  },
  {
    path: '/search/:searchTerm',
    name: 'search-query',
    component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue')
  },
  {
    path: '/post',
    name: 'posts',
    component: () => import(/* webpackChunkName: "posts" */ '@/views/Posts.vue')
  },
  {
    path: '/post/:year',
    name: 'posts-year',
    component: () => import(/* webpackChunkName: "posts-year" */ '@/views/Posts.vue')
  },
  {
    path: '/story',
    name: 'stories',
    component: () => import(/* webpackChunkName: "stories" */ '@/views/Stories.vue')
  },
  {
    path: '/story-details/:storyId',
    name: 'story-details',
    component: () => import(/* webpackChunkName: "story-details" */ '@/views/StoryDetails.vue')
  },
  {
    path: '/post-details/:postId',
    name: 'post-details',
    component: () => import(/* webpackChunkName: "post-details" */ '@/views/PostDetails.vue')
  },
  {
    path: '/post-editor',
    name: 'post-editor',
    component: () => import(/* webpackChunkName: "post-editor" */ '@/views/PostEditor.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/story-editor',
    name: 'story-editor',
    component: () => import(/* webpackChunkName: "story-editor" */ '@/views/StoryEditor.vue'),
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
