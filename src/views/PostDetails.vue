<template>
  <div v-if="post">
    <Header :title="post.title" :message="null" :image="null" :backgroundImage="backgroundImage">
      <div slot="content" class="d-flex flex-row justify-content-between align-items-start">
        <div>
          <b-avatar-group size="60px" class="mt-3" v-if="individuals && individuals.length > 0">
            <template v-for="individual in individuals" >
              <b-avatar variant="primary" v-b-tooltip="individual.name" :key="`individual-photo-${individual.id}`" :src="`${storeBaseUrl}individual/${individual.id}/img`" class="align-baseline" />
            </template>
          </b-avatar-group>
        </div>
        <div v-if="post.ratings" class="ratings d-flex flex-column justify-content-center align-items-end mb-5">
          <div class="my-1 d-flex align-items-center" v-b-tooltip.left="'Wetter'"><h1 class="mr-3"><BIconCloudSun variant="warning" /></h1> <b-form-rating variant="light" size="lg" v-model="post.ratings.weather" readonly inline no-border /></div>
          <div class="my-1 d-flex align-items-center" v-b-tooltip.left="'Aussicht'"><h1 class="mr-3"><BIconBinoculars variant="info" /></h1> <b-form-rating variant="light" size="lg" v-model="post.ratings.view" readonly inline no-border /></div>
          <div class="my-1 d-flex align-items-center" v-b-tooltip.left="'Strecke'"><h1 class="mr-3"><BIconSignpost variant="success" /></h1> <b-form-rating variant="light" size="lg" v-model="post.ratings.path" readonly inline no-border /></div>
        </div>
      </div>
    </Header>

    <b-container>
      <b-row class="pt-5">
        <b-col cols="12" md="6">
          <h2><i class="icofont-ui-calendar" /> {{ post.createdOn | toDate }}<span v-if="post.endDate"> - {{ post.endDate | toDate }}</span></h2>
        </b-col>
        <b-col cols="12" md="6">
          <h2 class="text-md-right" v-if="post.hills && post.hills.length > 0"><i class="icofont-hill" /> <b-badge class="mx-2" v-for="hill in post.hills" :key="`hill-badge-${hill.id}`">{{ hillTypes[hill.type].name }}</b-badge></h2>
        </b-col>
      </b-row>

      <b-button @click="$refs.editPostModal.show()" v-if="storeToken"><BIconPencil /> Bearbeiten</b-button>

      <div class="pt-5" v-if="post.hills && post.hills.length > 0">
        <h4>Berge</h4>
        <b-row>
          <b-col cols="12" md="4" v-for="hill in post.hills" :key="`hill-card-${hill.id}`" class="post-stats">
            <b-card no-body class="hill mb-4">
              <b-row no-gutters>
                <b-col cols=12 md="3" class="d-flex align-items-center justify-content-center bg-dark">
                  <span :class="`${hillTypes[hill.type].icon} p-3`" :style="{ color: hillTypes[hill.type].color }" />
                </b-col>
                <b-col cols=12 md="9">
                  <b-card-body>
                    <b-card-title>{{ hill.name }}</b-card-title>
                    <b-row>
                      <b-col cols=12 xl=6>
                        <b-card-text><i class="icofont-arrow-up text-primary" /> {{ hill.elevation }}</b-card-text>
                      </b-col>
                      <b-col cols=12 xl=6>
                        <b-card-text><i class="icofont-label text-primary" /> {{ hillTypes[hill.type].name }}</b-card-text>
                      </b-col>
                      <b-col cols=12 xl=6>
                        <b-card-text><i class="icofont-map text-primary" /> <span v-if="hill.region">{{ hill.region }}</span><span v-else>--</span></b-card-text>
                      </b-col>
                      <b-col cols=12 xl=6>
                        <b-card-text><i class="icofont-external-link text-primary" /> <a :href="hill.url" v-if="hill.url">Link</a><span v-else>--</span></b-card-text>
                      </b-col>
                    </b-row>
                  </b-card-body>
                </b-col>
              </b-row>
            </b-card>
          </b-col>
        </b-row>
      </div>

      <div class="pt-5" v-if="(post.sites && post.sites.length > 0) || storeToken">
        <h4>Standorte</h4>

        <b-button @click="$refs.addSiteModal.show()" v-if="storeToken"><BIconPencil /> Hinzufügen</b-button>

        <b-row>
          <b-col cols="12" md="6" v-for="site in post.sites" :key="`site-card-${site.id}`" class="post-stats mb-4">
            <b-card no-body class="hill h-100">
              <b-row no-gutters class="h-100">
                <b-col cols=12 md="3" class="d-flex align-items-center justify-content-center bg-dark">
                  <CampsiteIcon class="camp-icon p-5 w-100 h-100 text-info" v-if="site.sitetype === 'campsite'" />
                  <WildcampIcon class="camp-icon p-5 w-100 h-100 text-success" v-if="site.sitetype === 'wildcamp'" />
                </b-col>
                <b-col cols=12 md="9">
                  <b-card-body class="d-flex flex-column justify-content-between h-100">
                    <div>
                      <b-card-title>{{ site.name }}</b-card-title>
                      <b-card-text class="text-nowrap text-truncate mb-3" :title="site.description" v-if="site.description">{{ site.description }}</b-card-text>
                    </div>
                    <div>
                      <b-row>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Typ</b-card-sub-title>
                          <b-card-text class="mx-2">{{ siteTypes[site.sitetype] }}</b-card-text>
                        </b-col>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Untergrund</b-card-sub-title>
                          <b-card-text class="mx-2">{{ groundTypes[site.groundtype] }}</b-card-text>
                        </b-col>
                      </b-row>
                      <hr class="mt-0" />
                      <b-row>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Standort</b-card-sub-title>
                          <b-card-text><b-form-rating variant="light" size="sm" v-model="site.rating.location" readonly inline no-border /></b-card-text>
                        </b-col>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Aussicht</b-card-sub-title>
                          <b-card-text><b-form-rating variant="light" size="sm" v-model="site.rating.scenery" readonly inline no-border /></b-card-text>
                        </b-col>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Ausstattung</b-card-sub-title>
                          <b-card-text><b-form-rating variant="light" size="sm" v-model="site.rating.facilities" readonly inline no-border /></b-card-text>
                        </b-col>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Preis</b-card-sub-title>
                          <b-card-text><b-form-rating variant="light" size="sm" v-model="site.rating.price" readonly inline no-border /></b-card-text>
                        </b-col>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Annehmlichkeiten</b-card-sub-title>
                          <b-card-text class="mx-2">
                            <ShowerIcon :class="`pr-2 ${site.facilities.showers ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Duschen'" />
                            <ToiletIcon :class="`pr-2 ${site.facilities.toilets ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Toiletten'" />
                            <ElectricHookupIcon :class="`pr-2 ${site.facilities.electricHookup ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Strom'" />
                            <ShopIcon :class="`pr-2 ${site.facilities.shop ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Shop'" />
                            <RestaurantIcon :class="`pr-2 ${site.facilities.restaurant ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Restaurant'" />
                            <CafeIcon :class="`pr-2 ${site.facilities.cafe ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Café'" />
                            <DogWalkIcon :class="`pr-2 ${site.facilities.localDogWalk ? 'text-success' : 'text-dark'}`" v-b-tooltip="'Hundespaziergang'" />
                          </b-card-text>
                        </b-col>
                        <b-col cols=12 xl=6 class="mb-2">
                          <b-card-sub-title>Lage</b-card-sub-title>
                          <b-card-text class="mx-2">
                            <i class="icofont icofont-google-map" /> <a :href="`https://geohack.toolforge.org/geohack.php?params=${site.latitude};${site.longitude}`">{{ site.latitude.toFixed(4) }}; {{ site.longitude.toFixed(4) }}</a>
                          </b-card-text>
                        </b-col>
                      </b-row>
                    </div>
                  </b-card-body>
                </b-col>
              </b-row>
            </b-card>
          </b-col>
        </b-row>
      </div>

      <div class="pt-5" v-html="post.content" v-if="post.content" />
      <VueMarkdown class="pt-5" :source="post.contentMarkdown" v-else-if="post.contentMarkdown" />

      <b-carousel
        v-if="post.images && post.images.length > 0"
        class="mt-5"
        :interval="0"
        controls
        :img-height="600"
        indicators>
        <a :href="`${storeBaseUrl}image/${image.imageId}/large/${image.imagePath}`"
           @click.prevent="coolboxIndex = index"
           v-for="(image, index) in post.images"
           :key="`carousel-slide-${image.imageId}`"
           :data-caption="image.description">
          <b-carousel-slide
            :caption-html="image.description"
            :img-src="`${storeBaseUrl}image/${image.imageId}/large/${image.imagePath}`">
            <template v-slot:img>
              <b-img-lazy class="rounded w-100" :src="`${storeBaseUrl}image/${image.imageId}/large/${image.imagePath}`" :alt="image.description" />
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
        <h2 class="pt-5">Stories</h2>
        <p>Dieser Beitrag ist teil von den folgenden Stories.</p>
        <div v-for="story in stories" :key="`story-${story.id}`" class="pb-5">
          <h3>{{ story.title }}</h3>
          <b-row>
            <b-col cols="12" md="6" lg="4" v-for="storyPost in story.posts" :key="`post-card-${story.id}-${storyPost.id}`" :class="{ grayscale: storyPost.id !== post.id }">
              <router-link class="no-link" :to="{ name: 'post-details', params: { postId: storyPost.id } }">
                <PostCard :post="storyPost" />
              </router-link>
            </b-col>
          </b-row>
        </div>
      </template>

      <template v-if="relatedPosts || storeToken">
        <h2 class="mt-5">Ähnliche Berichte</h2>
        <p>Dieser Beitrag ist verbunden mit den folgenden anderen Berichten.</p>

        <b-row>
          <b-col cols="12" md="6" lg="4" v-for="relPost in relatedPosts" :key="`post-card-${relPost.id}`">
            <router-link class="no-link" :to="{ name: 'post-details', params: { postId: relPost.id } }">
              <PostCard :post="relPost" />
            </router-link>
          </b-col>
        </b-row>

        <b-button v-if="storeToken" @click="$refs.relatedPostModal.show()"><i class="icofont-plus-square"/> Hinzufügen</b-button>
      </template>

    </b-container>

    <CoolLightBox
      :items="coolboxImages"
      :index="coolboxIndex"
      @close="coolboxIndex = null" />

    <RelatedPostModal v-if="storeToken" ref="relatedPostModal" @related-posts-selected="addRelatedPosts" />

    <EditPostModal :post="post" ref="editPostModal" @changed="update(post.id)" v-if="storeToken" />
    <AddSiteModal :post="post" ref="addSiteModal" @changed="update(post.id)" v-if="storeToken" />
  </div>
</template>

<script>
import VueMarkdown from '@adapttive/vue-markdown'
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'

import CampsiteIcon from '@/components/icons/CampsiteIcon'
import WildcampIcon from '@/components/icons/WildcampIcon'
import ShowerIcon from '@/components/icons/ShowerIcon'
import ToiletIcon from '@/components/icons/ToiletIcon'
import ShopIcon from '@/components/icons/ShopIcon'
import RestaurantIcon from '@/components/icons/RestaurantIcon'
import ElectricHookupIcon from '@/components/icons/ElectricHookupIcon'
import CafeIcon from '@/components/icons/CafeIcon'
import DogWalkIcon from '@/components/icons/DogWalkIcon'
import ElevationProfile from '@/components/charts/ElevationProfile'
import GpxMap from '@/components/GpxMap'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import TimeDistanceProfile from '@/components/charts/TimeDistanceProfile'
import RelatedPostModal from '@/components/modals/RelatedPostModal'
import EditPostModal from '@/components/modals/EditPostModal'
import AddSiteModal from '@/components/modals/AddSiteModal'

import { apiGetGpx, apiGetTimeDistanceProfile, apiGetElevationProfile, apiPostRelatedPostIds, apiGetPostRelated, apiGetPost, apiPostStoryList } from '@/mixins/api'
import { mapGetters } from 'vuex'

import { hillTypes, MAX_JAVA_INTEGER } from '@/mixins/util'

import { BIconCloudSun, BIconBinoculars, BIconSignpost, BIconPencil } from 'bootstrap-vue'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconCloudSun,
    BIconBinoculars,
    BIconPencil,
    BIconSignpost,
    WildcampIcon,
    CampsiteIcon,
    ShowerIcon,
    ToiletIcon,
    ShopIcon,
    DogWalkIcon,
    RestaurantIcon,
    ElectricHookupIcon,
    CafeIcon,
    EditPostModal,
    AddSiteModal,
    CoolLightBox,
    ElevationProfile,
    GpxMap,
    Header,
    PostCard,
    RelatedPostModal,
    TimeDistanceProfile,
    VueMarkdown
  },
  data: function () {
    return {
      hillTypes,
      amenitiesVisible: false,
      post: null,
      gpxContent: null,
      tdProfileContent: null,
      evProfileContent: null,
      coolboxIndex: null,
      stories: null,
      relatedPosts: null
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeToken'
    ]),
    siteTypes: function () {
      return {
        campsite: 'Campingplatz',
        wildcamp: 'Wild-Zelten'
      }
    },
    groundTypes: function () {
      return {
        gravel: 'Kies',
        grass: 'Gras',
        paved: 'Befestigt',
        sand: 'Sand'
      }
    },
    individuals: function () {
      if (this.post && this.post.hills) {
        const result = {}

        this.post.hills.forEach(h => {
          if (h.hillIndividuals) {
            h.hillIndividuals.forEach(hi => {
              result[hi.individual.id] = hi.individual
            })
          }
        })

        return Object.values(result)
      } else {
        return []
      }
    },
    coolboxImages: function () {
      if (!this.post || !this.post.images || this.post.images.length < 1) {
        return []
      } else {
        return this.post.images.map(i => {
          return {
            src: `${this.storeBaseUrl}image/${i.imageId}/large/${i.imagePath}`,
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

        return `${this.storeBaseUrl}image/${primary.imageId}/large/${primary.imagePath}`
      }
    }
  },
  watch: {
    post: function (newValue) {
      if (newValue.stats && newValue.stats.gpxPath) {
        apiGetGpx(newValue.id, result => {
          const reader = new FileReader()
          reader.readAsText(result)
          reader.onload = () => {
            this.gpxContent = reader.result
          }
        })
      }

      if (newValue.type === 'hike') {
        apiGetTimeDistanceProfile(newValue.id, result => {
          this.tdProfileContent = result
        })
        apiGetElevationProfile(newValue.id, result => {
          this.evProfileContent = result
        })
      } else {
        this.tdProfileContent = null
        this.evProfileContent = null
      }
    }
  },
  methods: {
    addRelatedPosts: function (postIds) {
      apiPostRelatedPostIds(this.post.id, postIds, () => {
        this.getRelatedPosts()
      })
    },
    getRelatedPosts: function () {
      apiGetPostRelated(this.post.id, result => {
        this.relatedPosts = result
      })
    },
    update: function (postId) {
      emitter.emit('set-loading', true)
      apiGetPost(postId, result => {
        this.post = result
        emitter.emit('set-loading', false)

        this.getRelatedPosts()
      })

      apiPostStoryList({
        page: 0,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'createdOn',
        ascending: 0
      }, {
        postId: +postId
      }, result => {
        this.stories = result
      })
    }
  },
  created: function () {
    const postId = this.$route.params.postId || this.$route.params.hikeId

    if (postId) {
      this.update(postId)
    }
  }
}
</script>

<style scoped>
.camp-icon {
  max-width: 200px;
}
</style>

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
