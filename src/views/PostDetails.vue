<template>
  <div v-if="post">
    <Header :title="post.title" :message="null" :image="null" :backgroundImage="backgroundImage" :height="400">
      <b-row slot="content" v-if="post.ratings" class="ratings">
        <b-col cols="12" md="4">
          <b-card class="mb-4">
            <b-card-title class="text-center text-light">Wetter</b-card-title>
            <b-card-text><b-form-rating variant="warning" size="lg" v-model="post.ratings.weather" readonly no-border /></b-card-text>
          </b-card>
        </b-col>
        <b-col cols="12" md="4">
          <b-card class="mb-4">
            <b-card-title class="text-center text-light">Aussicht</b-card-title>
            <b-card-text><b-form-rating variant="warning" size="lg" v-model="post.ratings.view" readonly no-border /></b-card-text>
          </b-card>
        </b-col>
        <b-col cols="12" md="4">
          <b-card class="mb-4">
            <b-card-title class="text-center text-light">Strecke</b-card-title>
            <b-card-text><b-form-rating variant="warning" size="lg" v-model="post.ratings.path" readonly no-border /></b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </Header>

    <b-container>
      <b-row class="pt-5">
        <b-col cols="12" md="6">
          <h2><i class="icofont-ui-calendar" /> {{ post.createdOn | toDate }}</h2>
        </b-col>
        <b-col cols="12" md="6">
          <h2 class="text-md-right" v-if="post.hills"><i class="icofont-hill" /> <b-badge class="mx-2" v-for="hill in post.hills" :key="`hill-badge-${hill.id}`">{{ hillTypes[hill.type].name }}</b-badge></h2>
        </b-col>
      </b-row>

      <b-row class="pt-5" v-if="post.hills">
        <b-col cols="12" md="4" v-for="hill in post.hills" :key="`hill-card-${hill.id}`" class="post-stats">
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

      <div class="pt-5" v-html="post.content" />

      <b-carousel
        v-if="post.images && post.images.length > 0"
        class="mt-5"
        :interval="0"
        controls
        :img-height="600"
        indicators>
        <a :href="`${storeBaseUrl}image/${image.imageId}/large`"
           @click.prevent="coolboxIndex = index"
           v-for="(image, index) in post.images"
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

      <div v-if="post.videos && post.videos.length > 0" class="pt-5">
        <b-embed v-for="(video, index) in post.videos" :key="`video-${index}`" type="iframe" aspect="16by9" class="my-2" :src="video.videoPath" allowfullscreen/>
      </div>

      <GpxMap class="pt-5" v-if="gpxContent" :gpx="gpxContent" :additionalMarkers="post.hills" />

      <div class="pt-5">
        <ElevationProfile :sourceFile="evProfileContent" v-if="evProfileContent" />
      </div>
      <div class="pt-5">
        <TimeDistanceProfile :sourceFile="tdProfileContent" v-if="tdProfileContent" />
      </div>

      <template v-if="stories && stories.length > 0">
        <b-row v-for="story in stories" :key="`story-${story.id}`" class="pt-5">
          <b-col cols="6" md="4" lg="3" v-for="storyPost in story.posts" :key="`post-card-${story.id}-${storyPost.id}`" :class="{ grayscale: storyPost.id !== post.id }">
            <router-link class="no-link" :to="{ name: 'post-details', params: { postId: storyPost.id } }">
              <PostCard :post="storyPost" />
            </router-link>
          </b-col>
        </b-row>
      </template>

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
import PostCard from '@/components/PostCard'
import TimeDistanceProfile from '@/components/charts/TimeDistanceProfile'

import api from '@/mixins/api.js'
import { mapGetters } from 'vuex'

export default {
  components: {
    CoolLightBox,
    ElevationProfile,
    GpxMap,
    Header,
    PostCard,
    TimeDistanceProfile
  },
  data: function () {
    return {
      post: null,
      gpxContent: null,
      tdProfileContent: null,
      evProfileContent: null,
      coolboxIndex: null,
      stories: null
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ]),
    coolboxImages: function () {
      if (!this.post || !this.post.images || this.post.images.length < 1) {
        return []
      } else {
        return this.post.images.map(i => {
          return {
            src: `${this.storeBaseUrl}image/${i.imageId}/large`,
            title: i.description
          }
        })
      }
    },
    backgroundImage: function () {
      if (!this.post || !this.post.images || this.post.images.length < 1) {
        return null
      } else {
        let primary = this.post.images.find(i => i.isPrimary)

        if (!primary) {
          primary = this.post.images[0]
        }

        return `${this.storeBaseUrl}image/${primary.imageId}/large`
      }
    }
  },
  watch: {
    post: function (newValue) {
      if (newValue.type === 'hike') {
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
      } else {
        this.gpxContent = null
        this.tdProfileContent = null
        this.evProfileContent = null
      }
    }
  },
  mixins: [api],
  created: function () {
    const postId = this.$route.params.postId || this.$route.params.hikeId

    if (postId) {
      this.apiGetPost(postId, result => {
        this.post = result
      })

      this.apiPostStoryList({
        page: 0,
        limit: this.MAX_JAVA_INTEGER,
        orderBy: 'createdOn',
        ascending: 0
      }, {
        postId: +postId
      }, result => {
        this.stories = result
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
.grayscale {
  filter: grayscale(1);
}
</style>
