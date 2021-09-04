<template>
  <b-modal ref="modal" title="JSON" @ok.prevent="onSubmit" @hidden="reset" ok-title="Laden" :ok-disabled="!enabled">
    <b-form @submit.prevent="onSubmit">
      <b-form-textarea v-model="json" />
    </b-form>
    <p class="text-danger" v-if="feedback">{{ feedback }}</p>
  </b-modal>
</template>

<script>
import RJSON from 'relaxed-json'

export default {
  data: function () {
    return {
      json: null,
      feedback: null
    }
  },
  computed: {
    enabled: function () {
      return this.json !== null && this.json.length > 0
    }
  },
  methods: {
    reset: function () {
      this.json = null
      this.feedback = null
    },
    show: function () {
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    onSubmit: function () {
      this.feedback = null
      try {
        const j = RJSON.parse(this.json)

        this.$emit('json-loaded', j)

        this.$nextTick(() => this.hide())
      } catch (err) {
        this.feedback = err
      }
    }
  }
}
</script>

<style>

</style>
