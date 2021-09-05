<template>
  <div v-if="hike">
    <Header :title="hike.title" :message="null" :image="null" :backgroundImage="backgroundImage" :height="400">
      <b-row slot="content" v-if="hike.ratings" class="ratings">
        <b-col cols="12" md="4">
          <b-card class="mb-4">
            <b-card-title class="text-center text-light">Wetter</b-card-title>
            <b-card-text><b-form-rating variant="warning" size="lg" v-model="hike.ratings.weather" readonly no-border /></b-card-text>
          </b-card>
        </b-col>
        <b-col cols="12" md="4">
          <b-card class="mb-4">
            <b-card-title class="text-center text-light">Aussicht</b-card-title>
            <b-card-text><b-form-rating variant="warning" size="lg" v-model="hike.ratings.view" readonly no-border /></b-card-text>
          </b-card>
        </b-col>
        <b-col cols="12" md="4">
          <b-card class="mb-4">
            <b-card-title class="text-center text-light">Strecke</b-card-title>
            <b-card-text><b-form-rating variant="warning" size="lg" v-model="hike.ratings.path" readonly no-border /></b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </Header>

    <b-container>
      <b-row class="pt-5">
        <b-col cols="12" md="6">
          <h2><i class="icofont-ui-calendar" /> {{ hike.createdOn | toDate }}</h2>
        </b-col>
        <b-col cols="12" md="6">
          <h2 class="text-md-right" v-if="hike.hills"><i class="icofont-hill" /> <b-badge class="mx-2" v-for="hill in hike.hills" :key="`hill-badge-${hill.id}`">{{ hillTypes[hill.type].name }}</b-badge></h2>
        </b-col>
      </b-row>

      <b-row class="pt-5" v-if="hike.hills">
        <b-col cols="12" md="4" v-for="hill in hike.hills" :key="`hill-card-${hill.id}`" class="hike-stats">
          <b-card no-body class="hill mb-4">
            <b-card-body>
              <b-card-title class="text-light">{{ hill.name }}</b-card-title>
            </b-card-body>
            <b-row no-gutters>
              <b-col cols="3" class="bg-dark">
                <div class="p-3 d-flex flex-column text-center">
                  <h4 class="d-inline"><i class="icofont-arrow-up text-primary" /></h4>
                  <div>{{ hill.elevation }}</div>
                </div>
              </b-col>
              <b-col cols="3" class="bg-dark">
                <div class="p-3 d-flex flex-column text-center">
                  <h4 class="d-inline"><i class="icofont-label text-primary" /></h4>
                  <div>{{ hillTypes[hill.type].name }}</div>
                </div>
              </b-col>
              <b-col cols="3" class="bg-dark">
                <div class="p-3 d-flex flex-column text-center">
                  <h4 class="d-inline"><i class="icofont-map text-primary" /></h4>
                  <div><span v-if="hill.region">{{ hill.region }}</span><span v-else>--</span></div>
                </div>
              </b-col>
              <b-col cols="3" class="bg-dark">
                <div class="p-3 d-flex flex-column text-center">
                  <h4 class="d-inline"><i class="icofont-external-link text-primary" /></h4>
                  <div><a :href="hill.url" v-if="hill.url">Link</a><span v-else>--</span></div>
                </div>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>

      <div class="pt-5" v-html="hike.content" />

      <b-carousel
        v-if="hike.images"
        class="mt-5"
        :interval="0"
        controls
        :img-height="600"
        indicators>
        <a :href="`${storeBaseUrl}image/${image.imageId}/large`"
           @click.prevent="coolboxIndex = index"
           v-for="(image, index) in hike.images"
           :key="`carousel-slide-${image.imageId}`"
           :data-caption="image.description">
          <b-carousel-slide
            :caption-html="image.description"
            :img-src="`${storeBaseUrl}image/${image.imageId}/large`">
            <template v-slot:img>
              <b-img  class="rounded w-100" :src="`${storeBaseUrl}image/${image.imageId}/large`" :alt="image.description" />
            </template>
          </b-carousel-slide>
        </a>
      </b-carousel>

      <div v-if="hike.videos && hike.videos.length > 0" class="pt-5">
        <b-embed v-for="(video, index) in hike.videos" :key="`video-${index}`" type="iframe" aspect="16by9" class="my-2" :src="video.videoPath" allowfullscreen/>
      </div>

      <GpxMap class="pt-5" v-if="gpxContent" :gpx="gpxContent" :additionalMarkers="hike.hills" />

      <div class="pt-5">
        <ElevationProfile :sourceFile="evProfileContent" v-if="evProfileContent" />
      </div>
      <div class="pt-5">
        <TimeDistanceProfile :sourceFile="tdProfileContent" v-if="tdProfileContent" />
      </div>

    </b-container>

    <CoolLightBox
      :items="coolboxImages"
      :index="coolboxIndex"
      @close="coolboxIndex = null" />
  </div>
</template>

<script>
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'

import ElevationProfile from '@/components/charts/ElevationProfile'
import GpxMap from '@/components/GpxMap'
import Header from '@/components/Header'
import TimeDistanceProfile from '@/components/charts/TimeDistanceProfile'

import api from '@/mixins/api.js'
import { mapGetters } from 'vuex'

export default {
  components: {
    CoolLightBox,
    ElevationProfile,
    GpxMap,
    Header,
    TimeDistanceProfile
  },
  data: function () {
    return {
      hike: null,
      gpxContent: null,
      tdProfileContent: null,
      evProfileContent: null,
      coolboxIndex: null
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ]),
    coolboxImages: function () {
      if (!this.hike || !this.hike.images || this.hike.images.length < 1) {
        return []
      } else {
        return this.hike.images.map(i => {
          return {
            src: `${this.storeBaseUrl}image/${i.imageId}/large`,
            title: i.description
          }
        })
      }
    },
    backgroundImage: function () {
      if (!this.hike || !this.hike.images || this.hike.images.length < 1) {
        return null
      } else {
        let primary = this.hike.images.find(i => i.isPrimary)

        if (!primary) {
          primary = this.hike.imafges[0]
        }

        return `${this.storeBaseUrl}image/${primary.imageId}/large`
      }
    }
  },
  watch: {
    hike: function (newValue) {
      this.apiGetGpx(newValue.id, result => {
        const reader = new FileReader()
        reader.readAsText(result)
        reader.onload = () => {
          this.gpxContent = reader.result
        }
      })

      this.apiGetTimeDistanceProfile(newValue.id, result => {
        this.tdProfileContent = result
      })
      this.apiGetElevationProfile(newValue.id, result => {
        this.evProfileContent = result
      })
    }
  },
  mixins: [api],
  created: function () {
    const hikeId = this.$route.params.hikeId

    if (hikeId) {
      this.apiGetHike(hikeId, result => {
        this.hike = result
      })
    }
  }
}
</script>

<style>
.hike-stats .card-title {
  margin-bottom: 0;
}
.hill .card-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: clip;
}
.ratings .card {
  background-color: #494d5580;
}
.ratings .card .b-rating {
  background-color: transparent;
}
</style>
