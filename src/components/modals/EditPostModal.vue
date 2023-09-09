<template>
  <b-modal ref="modal" size="xl" title="Bearbeiten" ok-title="Speichern" cancel-title="Abbrechen" @ok.prevent="onSubmit">
    <b-form @submit.prevent="onSubmit" :validated="formValidated" v-if="post">
      <div class="my-5">
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group label-for="title" label="Titel">
              <b-input id="title" v-model="newPost.title" required  :state="formState.title" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group label-for="date-start" label="Start-Datum">
              <b-form-datepicker id="date-start" reset-button :reset-value="null" v-model="newPost.date" required :state="formState.date" />
            </b-form-group>
            <b-form-group label-for="date-end" label="End-Datum">
              <b-form-datepicker id="date-end" reset-button :reset-value="null" v-model="newPost.endDate" :state="formState.endDate" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-button-toolbar>
          <b-button-group>
            <b-button v-for="umlaut in umlauts" :key="`umlaut-${umlaut}`" @click="addCharacter(umlaut)">{{ umlaut }}</b-button>
          </b-button-group>
        </b-button-toolbar>
        <b-textarea rows="20" class="post-description" v-model="newPost.description" required ref="postDescription" :state="formState.description"/>

        <VueMarkdown :source="newPost.description" />
      </div>
    </b-form>
  </b-modal>
</template>

<script>
import VueMarkdown from '@adapttive/vue-markdown'
import api from '@/mixins/api.js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    VueMarkdown
  },
  props: {
    post: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      formValidated: false,
      formState: {
        title: null,
        content: null,
        date: null,
        endDate: null
      },
      umlauts: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
      newPost: {
        date: null,
        endDate: null,
        title: null,
        description: ''
      }
    }
  },
  watch: {
    post: function (newValue) {
      if (newValue) {
        this.newPost = {
          title: newValue.title,
          description: newValue.contentMarkdown,
          date: newValue.createdOn,
          endDate: newValue.endDate
        }
      }
    }
  },
  mixins: [api],
  methods: {
    addCharacter: function (umlaut) {
      const start = this.$refs.postDescription.selectionStart
      const end = this.$refs.postDescription.selectionEnd

      const temp = this.newPost.description

      this.newPost.description = temp.substring(0, start) + umlaut + temp.substring(end, temp.length)

      this.$nextTick(() => {
        this.$refs.postDescription.focus()
        this.$refs.postDescription.selectionStart = start + 1
        this.$refs.postDescription.selectionEnd = start + 1
      })
    },
    isSet: function (variable) {
      return variable !== undefined && variable !== null && (((typeof variable) === 'string') ? variable.length > 0 : true)
    },
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        title: this.isSet(this.newPost.title),
        description: this.isSet(this.newPost.description),
        date: this.isSet(this.newPost.date),
        endDate: true
      }

      const result = Object.keys(this.formState).map(k => this.formState[k]).reduce((a, b) => a && b, true)

      if (!result) {
        console.log('something is wrong')
        return
      } else {
        console.log('all fine')
      }

      emitter.emit('set-loading', true)

      this.apiPatchPost(this.post.id, {
        id: this.post.id,
        title: this.newPost.title,
        contentMarkdown: this.newPost.description,
        createdOn: this.newPost.date !== '' ? new Date(this.newPost.date).toISOString() : null,
        endDate: this.newPost.endDate !== '' ? (this.newPost.endDate ? new Date(this.newPost.endDate).toISOString() : null) : null
      }, result => {
        emitter.emit('set-loading', false)
        this.$emit('changed')
        this.hide()
      }, error => {
        emitter.emit('set-loading', false)
        console.error(error)
      })
    },
    show: function () {
      if (this.post) {
        this.newPost = {
          title: this.post.title,
          description: this.post.contentMarkdown,
          date: this.post.createdOn,
          endDate: this.post.endDate
        }
      }

      this.formValidated = null
      this.formState = {
        title: null,
        content: null,
        date: null,
        endDate: null
      }

      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    }
  }
}
</script>

<style>

</style>
