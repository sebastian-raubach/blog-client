<template>
  <div>
    <Header title="Neuen Beitrag erstellen" message="Hier werden neue Beiträge erstellt" image="page-post-editor.svg" :backgroundImage="require('@/assets/banner-post-editor.jpg')" />

    <b-container class="mt-5">
      <b-form @submit.prevent="onSubmit" :validated="formValidated">
        <div class="my-5">
          <h4>Beitragstyp</h4>
          <div class="d-flex justify-content-between">
            <b-button-group>
              <b-button v-for="type in postTypesOptions" :key="`post-type-${type.key}`" variant="outline-secondary" :pressed="type.key === newPost.type" @click="newPost.type = type.key">
                <i :class="type.icon" /> {{ type.name }}
              </b-button>
            </b-button-group>
            <b-button @click="$refs.jsonModal.show()">JSON laden</b-button>
          </div>
        </div>

        <hr />

        <div class="my-5">
          <h4>Allgemeines</h4>
          <b-row>
            <b-col cols="12" md="6">
              <b-form-group label-for="title" label="Titel">
                <b-input id="title" v-model="newPost.title" required  :state="formState.title" />
              </b-form-group>
            </b-col>
            <b-col cols="12" md="6">
              <b-form-group label-for="date" label="Datum">
                <b-input type="date" id="date" v-model="newPost.date" required  :state="formState.date" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-button-toolbar>
            <b-button-group>
              <b-button v-for="umlaut in umlauts" :key="`umlaut-${umlaut}`" @click="addCharacter(umlaut)">{{ umlaut }}</b-button>
            </b-button-group>
          </b-button-toolbar>
          <b-textarea rows="20" class="post-description" v-model="newPost.description" required  :state="formState.description"/>

          <div v-html="newPost.description" />
        </div>

        <hr />

        <div class="my-5">
          <h4>Bilder</h4>

          <b-media v-for="(image, index) in newPost.images" :key="`image-${index}`" class="image-media my-3">
            <template v-slot:aside>
              <img fluid :src="image.data"/>
            </template>

            <b-form-file v-model="newPost.images[index].file" @input="updateImage(index)" accept=".jpg, .jpeg, .png"  :state="formState.images" />

            <b-form-input class="my-3" v-model="newPost.images[index].description" placeholder="Beschreibung"  :state="formState.images" />

            <b-form-radio name="primaryPhoto" v-model="newPost.images[index].isPrimary" :value="true" @change="setPrimaryPhoto(index)" :state="formState.images" >Primär-Bild</b-form-radio>
          </b-media>

          <b-form-file v-model="tempImage" @input="addImage" accept=".jpg, .jpeg, .png" :state="formState.images"/>
        </div>

        <hr />

        <div class="my-5">
          <h4>Videos</h4>

          <b-input-group v-for="(video, index) in newPost.videos" :key="`video-${index}`" class="my-3">
            <b-form-input v-model="newPost.videos[index]" :state="formState.videos" />
            <b-input-group-addon><b-button variant="danger" @click="newPost.videos.push(tempUrl)"><i class="icofont-ui-delete" /></b-button></b-input-group-addon>
          </b-input-group>

          <b-input-group class="my-3">
            <b-form-input type="url" v-model="tempUrl" :state="formState.videos" />
            <b-input-group-addon><b-button variant="success" @click="newPost.videos.push(tempUrl)"><i class="icofont-plus" /></b-button></b-input-group-addon>
          </b-input-group>
        </div>

        <template v-if="newPost.type === 'hike'">
          <hr />
          <div class="my-5" id="hills">
            <h4>Berge</h4>

            <b-card no-body v-for="(hill, index) in newPost.hills" :key="`hill-${index}`" class="my-4" :border-variant="formState.hills === false ? 'danger' : null">
              <b-row no-gutters>
                <b-col cols="6" md="2" :class="`d-flex align-items-center justify-content-center ${formState.hills === false ? 'bg-danger' : 'bg-primary'}`">
                  <b-card-title class="d-flex justify-content-center align-items-end text-dark"><i :class="hillTypes[hill.type].icon" /></b-card-title>
                </b-col>
                <b-col cols="6" md="10">
                  <b-card-body>
                    <b-card-title>{{ hill.name }}</b-card-title>
                    <div class="my-2"><b-badge variant="primary"><i class="icofont-info-circle" /> {{ hillTypes[hill.type].name }}</b-badge><b-badge class="ml-2" v-if="hill.latitude && hill.longitude"><i class="icofont-google-map" /> {{ hill.latitude.toFixed(2) }}, {{ hill.longitude.toFixed(2) }}</b-badge><b-badge class="ml-2" v-if="hill.elevation"><i class="icofont-arrow-up" /> {{ hill.elevation.toFixed(2) }}</b-badge></div>

                    <b-button-group class="my-2">
                      <b-button variant="info" @click="selectLocation(index)"><i class="icofont-google-map" /></b-button>
                      <b-button variant="danger" @click="removeHill(index)"><i class="icofont-ui-delete" /></b-button>
                    </b-button-group>
                  </b-card-body>
                </b-col>
              </b-row>
            </b-card>

            <b-form-select :options="hillTypeOptions" v-model="tempHill.type" :state="formState.hills" />
            <b-form-input v-model="tempHill.name" placeholder="Name" :state="formState.hills" />
            <VueTypeaheadBootstrap v-model="tempHillName"
                                   :data="hills"
                                   :serializer="item => item.name"
                                   @hit="tempHill = $event"
                                   placeholder="Bergnamen eingeben zum Suchen"
                                   @input="lookupHill" />

            <b-button :disabled="!tempHill.name || !tempHill.type" variant="success" @click="addHill"><i class="icofont-plus" /></b-button>
          </div>

          <hr />
          <div class="my-5" id="hills">
            <h4>GPX und Höhenprofil</h4>

            <b-form-group label-for="gpx" label="GPX" :description="gpx.simplified ? `Vereinfacht von ${gpx.originalLength} auf ${gpx.simplified.length}` : null">
              <b-form-file id="gpx" v-model="newPost.gpxFile" accept=".gpx" @input="resetGpxStats" required :state="formState.gpx" />
            </b-form-group>

            <div class="text-center"><b-button @click="simplifyGpx" :disabled="gpx.simplified !== null"><i class="icofont-swoosh-down" /></b-button></div>

            <GpxMap :gpx="newPost.gpxContent" v-if="newPost.gpxContent" />

            <b-row>
              <b-col cols="12" md="6">
                <b-form-group label-for="elevation-profile" label="Höhenprofil">
                  <b-form-file id="elevation-profile" v-model="newPost.elevationProfile" accept=".txt, .tsv" :state="formState.elevationProfile" />
                </b-form-group>

                <ElevationProfile :sourceFile="newPost.elevationProfile" />
              </b-col>
              <b-col cols="12" md="6">
                <b-form-group label-for="distance-time-profile" label="Zeit / Distanz">
                  <b-form-file id="distance-time-profile" v-model="newPost.timeDistanceProfile" accept=".txt, .tsv" :state="formState.timeDistanceProfile" />
                </b-form-group>

                <TimeDistanceProfile :sourceFile="newPost.timeDistanceProfile" />
              </b-col>
            </b-row>
          </div>

          <hr />

          <div class="my-5">
            <h4>Bewertung</h4>
            <b-row>
              <b-col cols="12" md="4">
                <b-form-group label-for="weather" label="Wetter">
                  <b-form-rating variant="warning" v-model="newPost.rating.weather" required :state="formState.ratingWeather" />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="4">
                <b-form-group label-for="view" label="Aussicht">
                  <b-form-rating variant="warning" v-model="newPost.rating.view" required :state="formState.ratingView" />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="4">
                <b-form-group label-for="path" label="Pfad">
                  <b-form-rating variant="warning" v-model="newPost.rating.path" required :state="formState.ratingPath" />
                </b-form-group>
              </b-col>
            </b-row>
          </div>

          <hr />

          <div class="my-5">
            <h4>Statistiken</h4>
            <b-row>
              <b-col cols="12" md="4">
                <b-form-group label-for="distance" label="Distanz">
                  <b-form-input id="distance" type="number" step="0.01" variant="warning" v-model.number="newPost.stats.distance" required :state="formState.statsDistance" />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="4">
                <b-form-group label-for="ascent" label="Anstieg">
                  <b-form-input id="ascent" type="number" step="0.01" variant="warning" v-model.number="newPost.stats.ascent" required :state="formState.statsAscent" />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="4">
                <b-form-group label-for="duration" label="Dauer">
                  <b-form-input id="duration" type="number" variant="warning" v-model.number="newPost.stats.duration" required :state="formState.statsDuration" />
                </b-form-group>
              </b-col>
            </b-row>
          </div>
        </template>
        <b-button type="submit" variant="primary">Erstellen</b-button>
      </b-form>
    </b-container>
    <JsonModal @json-loaded="onJsonLoaded" ref="jsonModal" />
    <GpsSelectorModal @location-changed="updateHillLocation" ref="locationSelectorModal" :location="tempLocation" />
  </div>
</template>

<script>
import Vue from 'vue'

import ElevationProfile from '@/components/charts/ElevationProfile'
import GpsSelectorModal from '@/components/modals/GpsSelectorModal'
import GpxMap from '@/components/GpxMap'
import Header from '@/components/Header'
import JsonModal from '@/components/modals/JsonModal'
import TimeDistanceProfile from '@/components/charts/TimeDistanceProfile'

import api from '@/mixins/api.js'
import gpx from '@/mixins/gpx.js'

import { debounce } from 'lodash'
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    ElevationProfile,
    GpsSelectorModal,
    GpxMap,
    Header,
    JsonModal,
    TimeDistanceProfile,
    VueTypeaheadBootstrap
  },
  data: function () {
    return {
      formValidated: false,
      formState: {
        hills: null
      },
      umlauts: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
      tempHill: {
        name: null,
        type: 'munro',
        elevation: null
      },
      tempLocation: {
        latitude: null,
        longitude: null,
        elevation: null
      },
      tempUrl: null,
      tempImage: null,
      tempHillName: null,
      hills: [],
      gpx: {
        simplified: null,
        originalLength: 0
      },
      postTypesOptions: [{
        key: 'hike',
        name: 'Wanderbericht',
        icon: 'icofont-hill-side'
      }, {
        key: 'news',
        name: 'Neuigkeiten',
        icon: 'icofont-newspaper'
      }],
      newPost: {
        type: 'hike',
        date: null,
        title: null,
        description: '',
        hills: [],
        rating: {
          weather: null,
          path: null,
          view: null
        },
        stats: {
          distance: 0,
          ascent: 0,
          duration: 0
        },
        images: [{
          file: null,
          data: null,
          description: null,
          isPrimary: true
        }],
        videos: [],
        gpxFile: null,
        gpxContent: null,
        elevationProfile: null,
        timeDistanceProfile: null
      }
    }
  },
  computed: {
    hillTypeOptions: function () {
      return Object.keys(this.hillTypes).map(h => {
        return {
          value: h,
          text: this.hillTypes[h].name
        }
      })
    }
  },
  watch: {
    'newPost.gpxFile': function (newValue) {
      const reader = new FileReader()
      reader.readAsText(newValue)
      reader.onload = () => {
        this.newPost.gpxContent = reader.result
      }
    },
    'gpx.simplified': function (newValue) {
      this.newPost.stats = this.gpxGetStats(newValue)
    }
  },
  mixins: [api, gpx],
  methods: {
    lookupHill: debounce(function () {
      this.apiGetHills(this.tempHillName, result => {
        this.hills = result
      })
    }),
    updateHillLocation: function (location) {
      if (this.tempLocation && this.tempLocation.index !== null) {
        Vue.set(this.newPost.hills[this.tempLocation.index], 'latitude', location.latitude)
        Vue.set(this.newPost.hills[this.tempLocation.index], 'longitude', location.longitude)
        Vue.set(this.newPost.hills[this.tempLocation.index], 'elevation', location.elevation)
      }
    },
    selectLocation: function (index) {
      const hill = this.newPost.hills[index]
      this.tempLocation = {
        latitude: hill.latitude,
        longitude: hill.longitude,
        elevation: hill.elevation,
        index: index
      }

      this.$refs.locationSelectorModal.show()
    },
    resetGpxStats: function () {
      this.gpx = {
        simplified: null,
        originalLength: 0
      }
    },
    simplifyGpx: function () {
      const points = this.gpxLoadPoints(this.newPost.gpxContent)
      this.gpx.originalLength = points.length
      this.gpx.simplified = this.gpxSimplify(points, 0.00005)
      const simplifiedContent = this.gpxPointsToGpx(this.gpx.simplified)
      this.newPost.gpxFile = new File([simplifiedContent], 'simplified-gpx.gpx', { type: 'application/gpx+xml' })
    },
    addHill: function () {
      this.newPost.hills.push(JSON.parse(JSON.stringify(this.tempHill)))
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
        images: this.newPost.images.filter(i => i.file).map(i => this.isSet(i.description) && this.isSet(i.file)).reduce((a, b) => a && b, true),
        videos: this.newPost.videos.map(v => this.isSet(v)).reduce((a, b) => a && b, true),
        hills: this.newPost.type === 'news' || (this.newPost.hills.map(h => this.isSet(h.type) && this.isSet(h.latitude) && this.isSet(h.longitude) && this.isSet(h.elevation) && this.isSet(h.name)).reduce((a, b) => a && b, true)),
        gpx: this.newPost.type === 'news' || this.isSet(this.newPost.gpxFile),
        elevationProfile: true,
        timeDistanceProfile: true,
        ratingWeather: this.newPost.type === 'news' || this.isSet(this.newPost.rating.weather),
        ratingPath: this.newPost.type === 'news' || this.isSet(this.newPost.rating.path),
        ratingView: this.newPost.type === 'news' || this.isSet(this.newPost.rating.view),
        statsDistance: this.newPost.type === 'news' || this.isSet(this.newPost.stats.distance),
        statsAscent: this.newPost.type === 'news' || this.isSet(this.newPost.stats.ascent),
        statsDuration: true
      }

      const result = Object.keys(this.formState).map(k => this.formState[k]).reduce((a, b) => a && b, true)

      if (!result) {
        console.log('something is wrong')
        return
      } else {
        console.log('all fine')
      }

      emitter.emit('set-loading', true)

      this.apiPutPost({
        type: this.newPost.type,
        title: this.newPost.title,
        content: this.newPost.description,
        createdOn: new Date(this.newPost.date).toISOString(),
        rating: this.newPost.rating,
        stats: this.newPost.stats,
        hills: this.newPost.hills,
        videos: this.newPost.videos
      }, result => {
        this.uploadFiles(result)
      }, error => {
        emitter.emit('set-loading', false)
        console.error(error)
      })
    },
    uploadFiles: function (postId) {
      const formData = new FormData()

      this.newPost.images.forEach(i => {
        if (i.file && i.description) {
          formData.append('image', i.file)
          formData.append('image-description', i.description)
          formData.append('image-is-primary', i.isPrimary)
        }
      })

      if (this.newPost.gpxFile) {
        formData.append('gpx', this.newPost.gpxFile)
      }
      if (this.newPost.elevationProfile) {
        formData.append('elevation-profile', this.newPost.elevationProfile)
      }
      if (this.newPost.timeDistanceProfile) {
        formData.append('time-distance-profile', this.newPost.timeDistanceProfile)
      }

      this.apiPostPostMedia(postId, formData, result => {
        this.$router.push({ name: 'post-details', params: { postId: postId } })
        emitter.emit('set-loading', false)
      }, error => {
        emitter.emit('set-loading', false)
        console.error(error)
      })
    },
    setPrimaryPhoto: function (index) {
      this.newPost.images = this.newPost.images.map((image, i) => {
        image.isPrimary = index === i
        return image
      })
    },
    addImage: async function () {
      const newImage = {
        data: await this.toBase64(this.tempImage),
        file: this.tempImage,
        description: null,
        isPrimary: false
      }

      this.newPost.images.push(newImage)
    },
    updateImage: async function (index) {
      this.newPost.images[index].data = await this.toBase64(this.newPost.images[index].file)
    },
    /**
     * Converts the user selected file into base64
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
    addCharacter: function (umlaut) {
      this.newPost.description = this.newPost.description + umlaut
    },
    removeHill: function (index) {
      this.newPost.hills.splice(index, 1)
    },
    onJsonLoaded: function (json) {
      this.setFromJson(this.newPost, 'title', json, 'title')
      this.setFromJson(this.newPost, 'description', json, 'text')
      this.setFromJson(this.newPost, 'date', json, 'date')
      this.setFromJson(this.newPost.rating, 'weather', json.rating, 'weather')
      this.setFromJson(this.newPost.rating, 'path', json.rating, 'track')
      this.setFromJson(this.newPost.rating, 'view', json.rating, 'view')
      this.setFromJson(this.newPost.stats, 'distance', json.stats, 'length')
      this.setFromJson(this.newPost.stats, 'ascent', json.stats, 'height')
      this.setFromJson(this.newPost.stats, 'duration', json.stats, 'time')

      if (json.hills) {
        this.newPost.type = 'hike'
      } else {
        this.newPost.type = 'news'
      }

      if (json.hills) {
        this.newPost.hills = json.hills.map(h => {
          let type = Object.keys(this.hillTypes).find(t => this.hillTypes[t].name === h.type)

          if (!type) {
            type = 'other'
          }

          return {
            name: h.name,
            type: type
          }
        })
      }

      if (json.videos) {
        this.newPost.videos = json.videos
      }

      if (json.images) {
        this.newPost.images = json.images.map(i => {
          return {
            file: null,
            data: null,
            description: i.title,
            isPrimary: i.small === json.feature || i.medium === json.feature
          }
        })
      }
    },
    setFromJson: function (container, field, json, jsonField) {
      if (json && json[jsonField]) {
        container[field] = json[jsonField]
      }
    }
  }
}
</script>

<style scoped>
.image-media img {
  width: 200px;
  height: 200px;
  max-width: 50vw;
  object-fit: cover;
}
.post-description {
  font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;
}
</style>

<style>
</style>
