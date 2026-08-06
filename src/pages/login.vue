<template>
  <v-container fluid class="pa-0">
    <!-- Hero Banner Section -->
    <v-img
      src="@/assets/img/banner-login.jpg"
      height="35vh"
      cover
      class="align-center text-white"
    >
      <div class="hero-scrim" />
      <!-- Dark Gradient Overlay for Typography Contrast -->
      <div class="fill-height d-flex align-center justify-center bg-gradient-to-t bg-black-opacity-50 px-4" style="position: relative; z-index: 1;">
        <v-row justify="center" align="center" class="text-center">
          <v-col cols="12" md="9" lg="7">
            <h1 class="text-h2 text-sm-h1 font-weight-black text-white mb-4 text-uppercase">
              <v-icon :icon="mdiLogin" class="me-2" /> Anmelden
            </h1>
          </v-col>
        </v-row>
      </div>
    </v-img>

    <v-divider color="grey-lighten-2" />

    <v-card max-width="400px" class="mx-auto mt-10" title="Benuterdaten" :loading="loading">
      <template #text>
        <v-text-field
          v-model="username"
          hide-details
          :prepend-inner-icon="mdiAccount"
          label="Benutzername"
          class="mb-3"
        />
        <v-text-field
          v-model="password"
          hide-details
          :prepend-inner-icon="mdiFormTextboxPassword"
          type="password"
          label="Passwort"
          class="mb-3"
        />

        <v-btn
          @click="submit"
          color="primary"
          class="w-100"
          :disabled="!username || !username.trim().length || !password || !password.trim().length"
          :prepend-icon="mdiLogin"
          text="Anmelden"
        />
      </template>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostToken } from '@/plugins/api/util'
  import { coreStore } from '@/stores/app'
  import { mdiAccount, mdiFormTextboxPassword, mdiLogin } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  const router = useRouter()
  const route = useRoute('/login')
  const store = coreStore()

  const loading = ref(false)
  const username = ref<string>()
  const password = ref<string>()
  const feedback = ref<string>()

  function submit () {
    if (!username.value || !username.value.trim().length || !password.value || !password.value.trim().length) {
      return
    }

    loading.value = true

    apiPostToken({ username: username.value, password: password.value }, result => {

      store.setToken(result)
      if (route.query?.redirect) {
        const decoded = decodeURIComponent(`${route.query.redirect}`)
        const exists = router.resolve({ path: decoded })

        if (exists) {
          router.push(decoded)
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    }, {
      codes: [403, 404, 500],
      callback: (error: AxiosResponse) => {
        if (error.status === 404) {
          feedback.value = 'Ungültiger Benutzername'
        } else if (error.status === 500) {
          feedback.value = 'Fehler auf dem Server'
        } else if (error.status === 403) {
          feedback.value = 'Falsches Passwort'
        }
      }
    }).finally(() => {
      loading.value = false
    })
  }

</script>