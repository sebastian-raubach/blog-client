<template>
  <v-app>
    <v-app-bar
      class="px-3"
      density="compact"
      flat
      :absolute="xs"
    >
      <template #prepend v-if="canGoBack">
        <v-btn :icon="mdiArrowLeft" @click="goBack()" />
      </template>
      <v-avatar
        size="32"
      >
        <v-img src="@/assets/img/logo.svg" alt="Logo" style="cursor: pointer" @click="router.push('/')" />
      </v-avatar>

      <v-spacer></v-spacer>

      <v-tabs
        align-tabs="center"
        :model-value="route.path"
        v-if="smAndUp"
      >
        <v-tab
          v-for="tab in tabs"
          :to="tab.to"
          :key="tab.to"
          :text="tab.label"
          :prepend-icon="tab.icon"
        ></v-tab>
      </v-tabs>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main class="d-flex flex-column min-vh-100">
      <router-view />

      <ConfirmModal />

      <v-footer class="d-flex justify-space-between mt-auto flex-grow-0"">
        <span>&copy; {{ new Date().getFullYear() }}</span>
        <span>
          <a href="#" @click.prevent="store.setToken(undefined)" v-if="store.storeToken">Logout</a>
          <router-link :to="`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`" v-else>Login</router-link>
        </span>
      </v-footer>
    </v-main>

    <!-- Show bottom navigation on mobile only (XS) -->
    <v-bottom-navigation
      :model-value="route.path"
      active
      app
      color="primary"
      class="d-flex d-sm-none"
      v-if="xs"
    >
      <v-btn
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        :value="tab.to"
      >
        <v-icon>{{ tab.icon }}</v-icon>
        <span>{{ tab.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script lang="ts">
  import { coreStore } from '@/stores/app'
  import { mdiArrowLeft, mdiBookOpenPageVariant, mdiHome, mdiImageFilterHdr, mdiNotebookMultiple, mdiRvTruck } from '@mdi/js'
  import { useDisplay } from 'vuetify'
  import { useAppNavigation } from '@/plugins/composables/useAppNavigation'

  interface Tab {
    to: string
    label: string
    icon: string
  }

  export default {
    setup () {
      const store = coreStore()
      const route = useRoute()
      const router = useRouter()
      const { xs, smAndUp } = useDisplay()
      const { canGoBack, goBack } = useAppNavigation(router)

      const tabs = computed(() => {
        return [{
          to: '/',
          label: 'Home',
          icon: mdiHome,
        }, {
          to: '/post',
          label: 'Berichte',
          icon: mdiNotebookMultiple,
        }, {
          to: '/hill',
          label: 'Gipfel',
          icon: mdiImageFilterHdr,
        }, {
          to: '/site',
          label: 'Camping',
          icon: mdiRvTruck,
        }, {
          to: '/story',
          label: 'Stories',
          icon: mdiBookOpenPageVariant,
        }]
      })

      // Set base URL based on environment
      let baseUrl = './api/'
      if (import.meta.env.VITE_BASE_URL) {
        baseUrl = import.meta.env.VITE_BASE_URL
      }

      store.setBaseUrl(baseUrl)
      store.setBannerIndex(store.storeBannerIndex + 1)

      return {
        store,
        tabs,
        route,
        router,
        xs,
        smAndUp,
        canGoBack,
        goBack,
        mdiArrowLeft,
      }
    }
  }
</script>

<style>
p a, p a:visited,
table a:not(.v-btn, .v-chip), table a:not(.v-btn, .v-chip):visited,
footer a, footer a:visited,
.v-card-text a:not(.v-btn, .v-chip), .v-card-text a:not(.v-btn, .v-chip):visited,
.v-messages a, .v-messages a:visited,
.v-list-item a, .v-list-item a:visited,
a.table-icon-link, a.table-icon-link:visited,
.v-card-text ul a, .v-card-text ul a:visited,
form a, form a:visited {
  color: rgb(var(--v-theme-primary));
}

/* v-parallax has no built-in scrim like v-img's `gradient` prop, so a thin
   overlay is added here to keep the hero text readable over any image. */
.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.05));
}
.line-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  white-space: unset;
}
.line-clamp-1 {
  line-clamp: 1;
  -webkit-line-clamp: 1;
}
.line-clamp-2 {
  line-clamp: 2;
  -webkit-line-clamp: 2;
}
.line-clamp-3 {
  line-clamp: 3;
  -webkit-line-clamp: 3;
}
</style>
