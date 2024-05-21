<template>
  <b-modal ref="modal" size="md" title="Individuen hinzufügen" @ok.prevent="onSubmit" @hidden="reset" ok-title="Hinzufügen" :ok-disabled="!enabled">
    <b-list-group>
      <b-list-group-item href="#" @click.prevent="individual.selected = !individual.selected" :variant="individual.selected ? 'primary' : 'dark'" v-for="individual in individuals" :key="`individual-${individual.id}`" class="d-flex justify-content-between align-items-center">
        <div>
          <b-avatar variant="primary" :text="getInitials(individual)" :src="`${storeBaseUrl}individual/${individual.id}/img`" /> <span>{{ individual.name }}</span>
        </div>
        <b-form-checkbox :checked="individual.selected" />
      </b-list-group-item>
    </b-list-group>

    <b-button v-b-toggle.collapse-individual><BIconPersonPlus /> Neues Individuum</b-button>

    <b-collapse id="collapse-individual" v-model="showNew">
      <b-card>
        <b-form @submit.prevent="addNewIndividual">
          <!-- Preview the image -->
          <b-img fluid-grow rounded :src="imageData" class="image" v-if="imageData" />
          <b-form-group label="Bild" label-for="image">
            <!-- Input for selecting (or taking) the image -->
            <b-form-file v-model="imageFile" accept="image/png, image/jpeg" class="file-selector" id="image" ref="imageInput" />
          </b-form-group>

          <b-form-group label="Name" label-for="name">
            <b-form-input id="name" v-model="name" required />
          </b-form-group>

          <b-button @click="upload" :disabled="!name">Erstellen</b-button>
        </b-form>
      </b-card>
    </b-collapse>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { apiGetIndividuals, apiPostIndividual } from '@/mixins/api'
import { BIconPersonPlus } from 'bootstrap-vue'

export default {
  components: {
    BIconPersonPlus
  },
  data: function () {
    return {
      individuals: [],
      name: null,
      showNew: false,
      imageData: null,
      imageFile: null
    }
  },
  watch: {
    imageFile: async function (newValue) {
      if (newValue) {
        // Convert to base64 for displaying
        this.imageData = await this.toBase64(newValue)
      } else {
        this.imageData = null
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ]),
    enabled: function () {
      if (this.individuals) {
        return this.individuals.filter(i => i.selected).length > 0
      } else {
        return false
      }
    }
  },
  methods: {
    upload: function () {
      const formData = new FormData()
      if (this.imageFile) {
        formData.append('image', this.imageFile)
      }
      formData.append('name', this.name)

      apiPostIndividual(formData, () => this.update())
    },
    /**
     * Converts the participant selected file into base64
     * @param file The image file
     */
    toBase64: function (file) {
      // Return a promise as we can't wait for this
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    getInitials: function (individual) {
      return individual.name ? (individual.name || '').split(' ').slice(0, 2).map(p => p.substring(0, 1)).join('') : null
    },
    reset: function () {
      this.individuals = []
      this.name = null
      this.showNew = false
      this.imageData = null
      this.imageFile = null
    },
    update: function () {
      this.name = null
      this.showNew = false
      this.imageData = null
      this.imageFile = null

      apiGetIndividuals(result => {
        if (result) {
          result.forEach(i => { i.selected = false })
        }
        this.individuals = result
      })
    },
    show: function () {
      this.reset()
      this.update()
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    onSubmit: function () {
      this.$emit('individuals-selected', this.individuals.filter(i => i.selected))

      this.$nextTick(() => this.hide())
    }
  }
}
</script>

<style>

</style>
