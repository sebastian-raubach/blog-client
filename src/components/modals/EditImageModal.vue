<template>
  <b-modal ref="modal" size="xl" title="Bearbeiten" ok-title="Speichern" cancel-title="Abbrechen" @ok.prevent="onSubmit">
    <h4>Bilder</h4>

    <template v-if="post && post.images && post.images.length > 0">
      <b-media v-for="(image, index) in post.images" :key="`image-${index}`" class="image-media my-3">
        <template v-slot:aside>
          <img fluid :src="`${storeBaseUrl}image/${image.imageId}/small/${image.imagePath}`"/>
        </template>

        <b-form-input class="my-3" v-model="image.description" placeholder="Beschreibung" />

        <b-form-radio name="primaryPhoto" v-model="image.isPrimary" :value="true" @change="setPrimaryPhoto(index)">Primär-Bild</b-form-radio>
      </b-media>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { apiPatchPostImages } from '@/mixins/api'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    post: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeToken'
    ])
  },
  methods: {
    show: function () {
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    onSubmit: function () {
      emitter.emit('set-loading', true)

      apiPatchPostImages(this.post.id, this.post.images, result => {
        emitter.emit('set-loading', false)
        this.$emit('changed')
        this.hide()
      }, error => {
        emitter.emit('set-loading', false)
        console.error(error)
      })
    }
  }
}
</script>
