<template>
  <v-container fluid class="pa-0" v-if="post">
    <!-- Hero Banner Header -->
     <v-img
      :src="`${store.storeBaseUrl}image/${bannerImage?.imageId}/large`"
      height="50vh"
      cover
      class="align-end text-white"
    >
      <div class="hero-scrim" />
      <div class="fill-height d-flex align-end pa-6 pa-md-12 w-100">
        <v-container>
          <v-row>
            <v-col cols="12" md="10">
              <v-chip
                :color="postTypeConfigs[post.postType].color"
                variant="flat"
                size="small"
                label
                :prepend-icon="postTypeConfigs[post.postType].icon"
              >
                {{ postTypeConfigs[post.postType].title }}
              </v-chip>
              <h1 class="text-h3 text-md-h2 font-weight-black mb-2 position-relative my-3">
                {{ post.postTitle }} 
              </h1>
              <div class="d-flex flex-wrap ga-2 mb-3">
                <v-chip color="white" variant="tonal" size="small">
                  <v-icon :icon="mdiCalendar" start />
                  {{ date }}
                </v-chip>
                <v-chip color="white" variant="tonal" size="small" v-if="dateSpan">
                  <v-icon :icon="mdiCalendarExpandHorizontalOutline" size="small" class="me-1" />
                  {{ dateSpan }}
                </v-chip>

                <template v-if="post.postType === PostsType.hike">
                  <v-chip variant="tonal" size="small">
                    <v-icon :icon="mdiClockOutline" size="small" class="me-1" />
                    {{ duration }}
                  </v-chip>
                  <v-chip variant="tonal" size="small">
                    <v-icon :icon="mdiImageFilterHdr" size="small" class="me-1" />
                    {{ post.hikestats.ascent.toFixed(0) }} m
                  </v-chip>
                  <v-chip variant="tonal" size="small">
                    <v-icon :icon="mdiMapMarkerDistance" size="small" class="me-1" />
                    {{ post.hikestats.distance.toFixed(0) }} km
                  </v-chip>
                </template>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-img>

    <v-container class="py-10">
      <!-- Quick Stats Metrics -->
      <v-row class="mb-8">
        <v-col cols="12" sm="6" md="3" class="d-flex flex-column" v-if="post.postType === PostsType.hike && post.hikerating">
          <v-card variant="tonal" class="flex-grow-1">
            <template #text>
              <v-list-item slim title="Strecke" :prepend-icon="mdiMapMarkerPath">
                <template #append>
                  <v-rating :model-value="post.hikerating.path" density="compact" size="small" half-increments readonly /> 
                </template>
              </v-list-item>
              <v-list-item slim title="Aussicht" :prepend-icon="mdiBinoculars">
                <template #append>
                  <v-rating :model-value="post.hikerating.view" density="compact" size="small" half-increments readonly /> 
                </template>
              </v-list-item>
              <v-list-item slim title="Wetter" :prepend-icon="mdiWeatherPartlyCloudy">
                <template #append>
                  <v-rating :model-value="post.hikerating.weather" density="compact" size="small" half-increments readonly /> 
                </template>
              </v-list-item>
            </template>
          </v-card>
        </v-col>

        <!-- Hills -->
        <v-col cols="12" sm="6" md="3" class="d-flex flex-column" v-if="post.postType === PostsType.hike && post.hills">
          <v-card variant="tonal" class="flex-grow-1">
            <template #text>
              <v-list-item
                v-for="hill in post.hills"
                :key="`hill-${hill.hillId}`"
                slim
                :title="hill.hillName"
                :subtitle="`${hill.hillElevation} m`"
                @click="selectHill(hill)"
              >
                <template #prepend>
                  <v-icon :icon="mdiImageFilterHdr" size="32px" />
                </template>
                <template #append>
                  <v-chip label variant="flat" size="small" :text="hillConfigs[hill.hillType].title" :color="hillConfigs[hill.hillType].color" />
                </template>
              </v-list-item>
            </template>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex flex-column" v-if="store.storeToken || (post.sites && post.sites.length > 0)">
          <v-card variant="tonal" class="flex-grow-1">
            <template #text>
              <v-list-item
                v-for="site in post.sites"
                :key="`site-${site.siteId}`"
                :title="site.siteName"
                @click="selectSite(site)"
              >
                <template #subtitle>
                  <span class="line-clamp line-clamp-2">{{ site.siteDescription }}</span>
                </template>
                <template #prepend>
                  <v-icon :icon="siteTypeConfigs[site.siteType].icon" size="32px" />
                </template>
                <template #append>
                  <v-rating :model-value="(site.siteRating.facilities + site.siteRating.location + site.siteRating.price + site.siteRating.scenery) / 4" density="compact" size="small" half-increments readonly /> 
                </template>
              </v-list-item>
              <v-list-item
                title="Standort hinzufügen"
                :prepend-icon="mdiMapMarkerPlus"
                @click="addSite"
                v-if="store.storeToken"
              />
            </template>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex flex-column" v-if="post.people && post.people.length > 0">
          <v-card variant="tonal" class="flex-grow-1">
            <v-card-text class="flex-grow-1 d-flex flex-column h-100 align-center justify-center">
              <v-avatar-group hoverable>
                <v-avatar
                  v-for="individual in post.people"
                  :key="`person-${individual.personId}`"
                  size="64"
                  :image="`${store.storeBaseUrl}individual/${individual.personId}/img`"
                  v-tooltip:top="individual.personName"
                />
              </v-avatar-group>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Narrative Text Section -->
      <v-row class="mb-12">
        <v-col cols="12" md="8" class="mx-auto">
          <h2 class="text-h4 font-weight-bold mb-6">
            Bericht
          </h2>
          <div class="text-body-1 text-medium-emphasis leading-relaxed mb-6">
            <Markdown class="mx-4 pt-8" :source="post.postMarkdown" v-if="post.postMarkdown" />
            <p v-html="post.postContent" v-else />
          </div>
        </v-col>
      </v-row>

      <template v-if="post.hikestats && post.hikestats.gpx">
        <v-divider class="mb-12" />

        <!-- GPX Section -->
        <h2 class="text-h4 font-weight-bold mb-10">
          Strecke
        </h2>

        <v-row class="mb-10">
          <v-col cols="12" xxl="8" class="mx-auto">
            <GpxMap
              v-if="post.hikestats && post.hikestats.gpx"
              :src="`${store.storeBaseUrl}post/${post.postId}/gpx`"
              :rounded="4"
              height="60vh"
              interactive
              :peaks="post.hills"
            />
          </v-col>
        </v-row>

        <v-row class="mb-12">
          <v-col cols="12" xxl="8" class="mx-auto">
            <v-row>
              <v-col cols="12" sm="6" v-if="timeDistanceProfile">
                <v-card title="Geschwindigkeitsprofil" subtitle="Steiler = langsamer" :prepend-icon="mdiWalk">
                  <template #text>
                    <HikeStatsChart
                      :points="timeDistanceProfile"
                      x-label="Distanz"
                      x-unit="km"
                      y-label="Zeit"
                      y-unit="min"
                      :color="getPrimaryColor()"
                    />
                  </template>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" v-if="elevationProfile">
                <v-card title="Höhenprofil" subtitle="Steiler = steiler" :prepend-icon="mdiElevationRise">
                  <template #text>
                    <HikeStatsChart
                      :points="elevationProfile"
                      x-label="Distanz"
                      x-unit="km"
                      y-label="Höhe"
                      y-unit="m"
                      title=""
                      :color="getPrimaryColor()"
                    />
                  </template>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </template>

      <template v-if="post && post.hikestats && post.hikestats.individualStats">
        <HikeMovementBreakdown
          :hike-stats="post.hikestats"
          :photos="individualImageMap"
        />
      </template>

      <template v-if="post.videos && post.videos.length > 0">
        <v-divider class="mb-12" />

        <!-- Video Section -->
        <h2 class="text-h4 font-weight-bold mb-10">
          Videos
        </h2>

        <v-row class="mb-10">
          <v-col cols="12" xxl="8" class="mx-auto">
            <YoutubeVideo
              v-for="video in post.videos"
              :key="`video-${video}`"
              class="mb-10"
              :video="video"
            />
          </v-col>
        </v-row>
      </template>

      <v-divider class="mb-12" />

      <!-- Photo Gallery Section -->
      <v-row>
        <v-col cols="12" class="mb-4">
          <h2 class="text-h4 font-weight-bold mb-1">
            Photo Gallery
          </h2>
          <p class="text-subtitle-1 text-medium-emphasis">
            Captures from the ridge and trail
          </p>
        </v-col>
      </v-row>

      <v-row density="compact">
        <v-col
          v-for="(photo, index) in post.images"
          :key="photo.imageId"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            hover
            class="rounded-md overflow-hidden fill-height d-flex flex-column"
            @click="openPhoto(index)"
          >
            <v-img
              :src="`${store.storeBaseUrl}image/${photo.imageId}/small/${photo.imagePath}`"
              height="240"
              cover
              class="align-end"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </template>
            </v-img>

            <v-card-item class="bg-surface">
              <v-card-title class="text-subtitle-1 font-weight-bold">
                <!-- {{ photo.title }} -->
              </v-card-title>
              <v-card-subtitle class="text-body-2 text-wrap mt-1">
                {{ photo.imageDescription }}
              </v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <template v-if="story && storyPosts.length">
        <h2 class="text-h4 font-weight-bold mb-1">
          Story: {{ story.storyTitle }}
        </h2>
        <p class="text-subtitle-1 text-medium-emphasis">
          Dieser Bericht ist Teil dieser Story
        </p>
        <v-row>
          <v-col
            v-for="p in storyPosts"
            :key="`story-post-${p.postId}`"
            cols="12"
            md="4"
          >
            <PostCard :post="p" :inactive="p.postId !== post.postId" minimal />
          </v-col>
        </v-row>
      </template>

      <template v-if="relatedPosts.length || store.storeToken">
        <h2 class="text-h4 font-weight-bold mb-1">
          Ähnliche Berichte
        </h2>
        <p class="text-subtitle-1 text-medium-emphasis">
          Dieser Beitrag ist verbunden mit den folgenden anderen Berichten.
        </p>
        <v-btn v-if="store.storeToken" :prepend-icon="mdiLinkPlus" @click="addRelatedPosts" text="Ähnliche Berichte hinzufügen" class="mb-5" color="primary" />
        <v-row>
          <v-col
            v-for="p in relatedPosts"
            :key="`related-${p.postId}`"
            cols="12"
            md="4"
          >
            <PostCard :post="p" />
          </v-col>
        </v-row>
      </template>
    </v-container>

    <!-- Lightbox dialog with its own carousel for next/previous navigation -->
    <v-dialog v-model="dialog" fullscreen>
      <v-card>
        <v-toolbar density="comfortable">
          <v-spacer />
          <v-btn :icon="mdiClose" variant="text" @click="dialog = false" />
        </v-toolbar>
 
        <v-carousel
          v-model="lightboxIndex"
          hide-delimiter-background
          show-arrows="hover"
          height="100%"
          color="primary"
        >
          <v-carousel-item
            v-for="(photo, index) in post.images"
            :key="index"
            :src="`${store.storeBaseUrl}image/${photo.imageId}/large/${photo.imagePath}`"
            height="100%"
          >
            <v-overlay
              :scrim="false"
              content-class="w-100 h-100 d-flex flex-column align-center justify-space-between pointer-pass-through pa-3"
              style="z-index: 1000;"
              contained
              model-value
              no-click-animation
              persistent
              v-if="post.images[lightboxIndex]"
            >
              <v-scroll-x-transition mode="out-in" appear>
                <v-sheet
                  :key="lightboxIndex"
                  rounded
                  border
                >
                  <v-list-item
                    class="pa-2 px-6 text-wrap"
                  >
                    <v-list-item-subtitle class="text-wrap" v-text="post.images[lightboxIndex].imageDescription" />
                  </v-list-item>
                </v-sheet>
              </v-scroll-x-transition>
            </v-overlay>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </v-dialog>

    <v-bottom-sheet
      v-model="bottomSheet"
      :inset="lgAndUp"
      max-height="50vh"
      width="auto"
      v-if="selectedHill || selectedSite || newSite || newRelatedPosts"
    >
      <v-card class="pb-10" v-if="newRelatedPosts">
        <template #title>
          <div class="d-flex justify-space-between">
            <span>Neuer ähnliche Berichte</span>
            <v-btn text="Speichern" variant="flat" color="primary" :prepend-icon="mdiLinkPlus" :disabled="addRelatedPostsDisabled" @click="postRelatedPosts" />
          </div>
        </template>
        <template #text>
          <PostSelector v-model="newRelatedPosts" />
        </template>
      </v-card>
      <v-card class="pb-10" v-if="newSite">
        <template #title>
          <div class="d-flex justify-space-between">
            <span>Neuer Standort</span>
            <v-btn text="Speichern" variant="flat" color="primary" :prepend-icon="mdiMapMarkerPlus" :disabled="addSiteDisabled" @click="addNewSite" />
          </div>
        </template>
        <template #text>
          <v-btn-toggle v-model="newSiteType" class="mb-5">
            <v-btn value="existing" text="Existierend" :prepend-icon="mdiMapMarkerCheck" />
            <v-btn value="new" text="Neu" :prepend-icon="mdiMapMarkerPlus" />
          </v-btn-toggle>
          <SiteDetails v-model="newSite" v-if="newSiteType === 'new'" />
          <template v-else>
            <v-autocomplete
              v-model="newSite"
              :items="allSites"
              return-object
              item-value="id"
              item-title="name"
              autocomplete="off"
              label="Suche nach Standortnamen"
              hide-details
            />
            <v-select v-model="newSite.groundtypes[0]" :items="Object.values(groundTypeConfigs)" label="Untergrund" :prepend-inner-icon="groundTypeConfigs[newSite.groundtypes[0]].icon" />
          </template>
        </template>
      </v-card>
      <v-card class="pb-10" v-if="selectedHill">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="me-3" :icon="hillConfigs[selectedHill.hillType].icon" />
            <div>{{ selectedHill.hillName }}</div>
          </div>
          <v-btn :icon="mdiClose" variant="text" @click="bottomSheet = false" />
        </v-card-title>
        
        <v-card-text>
          <HillDetails :hill-id="selectedHill.hillId || -1" />
        </v-card-text>
      </v-card>
      <v-card class="pb-10" v-if="selectedSite">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="me-3" :icon="siteTypeConfigs[selectedSite.siteType].icon" />
            <div>{{ selectedSite.siteName }}</div>
          </div>
          <v-btn :icon="mdiClose" variant="text" @click="bottomSheet = false" />
        </v-card-title>
        
        <v-card-text>
          <SiteDetails :site-id="selectedSite.siteId" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script setup lang="ts">
  import GpxMap from '@/components/GpxMap.vue'
  import type { Point } from '@/components/HikeStatsChart.vue'
  import SiteDetails from '@/components/SiteDetails.vue'
  import YoutubeVideo from '@/components/YoutubeVideo.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiGetPost, apiPostPosts, apiPostPostSite, apiPostRelatedPosts } from '@/plugins/api/post'
  import { apiGetElevationProfile, apiGetTimeDistanceProfile } from '@/plugins/api/resource'
  import { apiGetSites, apiPostSite } from '@/plugins/api/site'
  import { apiGetStoryById } from '@/plugins/api/story'
  import { groundTypeConfigs, hillConfigs, postTypeConfigs, siteTypeConfigs } from '@/plugins/constants'
  import { type PostHill, type ViewPosts, PostsType, type PostImage, type PostSite, type ViewStories, type ViewSites, SitesSitetype, PostsitesGroundtype } from '@/plugins/types/blog'
  import { formatMinutesToDHM, getPrimaryColor, getPrimaryImage, pad, parseTsvContentToPoint } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiBinoculars, mdiCalendar,mdiCalendarExpandHorizontalOutline,mdiClockOutline, mdiClose, mdiElevationRise, mdiImageFilterHdr, mdiLinkPlus, mdiMapMarkerCheck, mdiMapMarkerDistance, mdiMapMarkerPath, mdiMapMarkerPlus, mdiWalk, mdiWeatherPartlyCloudy } from '@mdi/js'
  import { useDisplay } from 'vuetify'

  const route = useRoute('/post/[id]/')
  const store = coreStore()
  const lightboxIndex = ref(0)

  const { lgAndUp } = useDisplay()

  const post = ref<ViewPosts>()
  const story = ref<ViewStories>()
  const storyPosts = ref<ViewPosts[]>([])
  const relatedPosts = ref<ViewPosts[]>([])

  const individualImageMap = ref<Record<number, string>>()
  
  const selectedSite = ref<PostSite | undefined>(undefined)
  const selectedHill = ref<PostHill | undefined>(undefined)
  const selectedPhoto = ref<PostImage | undefined>(undefined)
  const dialog = ref(false)
  const bottomSheet = ref(false)

  const elevationProfile = ref<Point[]>()
  const timeDistanceProfile = ref<Point[]>()

  // Things for adding related posts
  const newRelatedPosts = ref<ViewPosts[]>()
  const addRelatedPostsDisabled = computed(() => !newRelatedPosts.value || newRelatedPosts.value.length === 0)
  function addRelatedPosts () {
    newRelatedPosts.value = []

    nextTick(() => {
      bottomSheet.value = true
    })
  }
  async function postRelatedPosts () {
    if (!post.value || !newRelatedPosts.value || newRelatedPosts.value.length === 0) {
      return
    }

    await apiPostRelatedPosts(post.value.postId, newRelatedPosts.value.map(nrp => nrp.postId))

    update(post.value.postId)

    bottomSheet.value = false
  }

  // Things for adding a new site
  const newSite = ref<ViewSites>()
  const allSites = ref<ViewSites[]>([])
  const newSiteType = ref<'new' | 'existing'>('existing')
  const addSiteDisabled = computed(() => {
    const ns = newSite.value
    if (!ns) {
      return true
    }
    if (newSiteType.value === 'existing') {
      return ns.id === undefined
    } else {
      return ns.name === undefined || ns.name.trim().length === 0 || ns.latitude === undefined || ns.longitude === undefined || ns.groundtypes.length === 0 || !ns.groundtypes[0] || !ns.sitetype
    }
  })
  async function addNewSite () {
    if (!newSite.value || !post.value) {
      return
    }

    let siteId = newSite.value.id

    if (siteId == undefined) {
      const response = await apiPostSite(newSite.value)
      siteId = response.data
    }

    await apiPostPostSite(post.value.postId, siteId, newSite.value.groundtypes[0])

    update(post.value.postId)

    bottomSheet.value = false
  }

  const duration = computed(() => {
    const { d, h, m } = formatMinutesToDHM(post.value?.hikestats?.duration || 0)

    return `${h}:${pad(m)} Stunden`
  })

  const dateSpan = computed(() => {
    if (post.value?.postStartDate && post.value?.postEndDate) {
      const count = Math.round((new Date(post.value?.postEndDate).getTime() - new Date(post.value?.postStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      return count === 1 ? '1 Tag' : `${count} Tage`
    } else {
      return '1 Tag'
    }
  })

  const date = computed(() => {
    return new Date(post.value?.postStartDate || 0).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  })

  function selectSite (site: PostSite) {
    selectedSite.value = site
    selectedHill.value = undefined

    nextTick(() => {
      bottomSheet.value = true
    })
  }
  function selectHill (hill: PostHill) {
    selectedSite.value = undefined
    selectedHill.value = hill

    nextTick(() => {
      bottomSheet.value = true
    })
  }

  function openPhoto (index: number) {
    selectedPhoto.value = post.value?.images[index]
    lightboxIndex.value = index
    dialog.value = true
  }

  function addSite () {
    newSite.value = {
      name: '',
      description: '',
      sitetype: SitesSitetype.campsite,
      groundtypes: [PostsitesGroundtype.gravel],
      facilities: {
        cafe: false,
        electricHookup: false,
        localDogWalk: false,
        restaurant: false,
        shop: false,
        showers: false,
        toilets: false,
        wifi: false,
      },
      rating: {
        facilities: 3,
        location: 3,
        price: 3,
        scenery: 3,
      },
      createdOn: new Date().toISOString(),
    }
    newSiteType.value = 'existing'

    if (!allSites.value || allSites.value.length === 0) {
      apiGetSites(result => {
        allSites.value = result.sort((a, b) => a.name?.localeCompare(b.name || '') || 0)
      })
    }

    nextTick(() => {
      bottomSheet.value = true
    })
  }

  const bannerImage = computed(() => getPrimaryImage(post.value?.images || []))

  function update (id: number) {
    apiGetPost(id, result => {
      post.value = result

      individualImageMap.value = {}
      result.people.forEach(p => {
        // @ts-expect-error
        individualImageMap.value[p.personId] = `${store.storeBaseUrl}individual/${p.personId}/img`
      })
    })
  }

  // Watch for param changes and update data
  watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        update(+newId)
      }
    },
    { immediate: true },
  )

  watch(bottomSheet, async newValue => {
    if (newValue === false) {
      newSite.value = undefined
      selectedHill.value = undefined
      selectedSite.value = undefined
      newRelatedPosts.value = undefined
    }
  })

  watch(post, async newValue => {
    if (newValue) {
      if (newValue.postType === PostsType.hike) {
        apiGetElevationProfile(newValue.postId, result => {
          parseTsvContentToPoint(result)
            .then(points => {
              elevationProfile.value = points
            })
        })
        apiGetTimeDistanceProfile(newValue.postId, result => {
          parseTsvContentToPoint(result, true)
            .then(points => {
              timeDistanceProfile.value = points
            })
        })
      }

      apiPostPosts({
        page: 0,
        limit: MAX_JAVA_INTEGER,
        relatedPostId: newValue.postId,
      }, result => {
        relatedPosts.value = result
      })

      if (newValue.storyIds?.length) {
        apiGetStoryById(newValue.storyIds[0], result => {
          story.value = result
        })

        apiPostPosts({
          page: 0,
          limit: MAX_JAVA_INTEGER,
          orderBy: 'postStartDate',
          ascending: 0,
          storyId: newValue.storyIds[0],
        }, result => {
          storyPosts.value = result
        })
      }
    }
  }, { immediate: true })
</script>
