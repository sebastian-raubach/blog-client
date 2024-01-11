<template>
  <b-modal ref="modal" title="Login" @ok.prevent="onSubmit" @hidden="reset" ok-title="Login" :ok-disabled="!enabled">
    <b-form @submit.prevent="onSubmit">
      <b-form-group label-for="username" label="Benutzername">
        <b-form-input id="username" v-model="username" required />
      </b-form-group>
      <b-form-group label-for="password" label="Passwort">
        <b-form-input id="password" v-model="password" type="password" required />
      </b-form-group>
    </b-form>

    <p class="text-danger" v-if="feedback">{{ feedback }}</p>
  </b-modal>
</template>

<script>
import { apiPostToken } from '@/mixins/api'

export default {
  data: function () {
    return {
      username: null,
      password: null,
      enabled: true,
      feedback: null
    }
  },
  methods: {
    reset: function () {
      this.username = null
      this.password = null
      this.enabled = true
      this.feedback = null
    },
    show: function () {
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    onSubmit: function () {
      this.enabled = false
      this.feedback = null
      apiPostToken({
        username: this.username,
        password: this.password
      }, result => {
        this.enabled = true

        this.$store.dispatch('setToken', result)
        this.$router.push({ name: 'home' })

        this.hide()
      }, error => {
        this.enabled = true

        if (error.status === 404) {
          this.feedback = 'Ungültiger Benutzername'
        } else if (error.status === 500) {
          this.feedback = 'Fehler auf dem Server'
        } else if (error.status === 403) {
          this.feedback = 'Falsches Passwort'
        }
      })
    }
  }
}
</script>

<style>

</style>
