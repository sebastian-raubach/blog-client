<template>
  <div>
    <Header title="Wanderungen" message="Alle Wanderungen die wir über die Jahre bestritten haben." :image="null" :backgroundImage="require(`@/assets/banner-hiking.jpg`)" />

    <b-container class="mt-5">
      <h1>Wanderungen ({{ totalHikes }})</h1>

      <p>Auf einer <router-link :to="{ name: 'hills' }">separaten Seite</router-link> haben wir eine Karte von allen Bergen die wir bisher bestiegen haben.</p>

      <h2>Übersicht</h2>
      <b-row>
        <b-col cols="12" md="4" v-for="(hill, index) in hillTypeCounts" :key="`type-${index}`" class="mb-4">
          <b-card class="h-100" no-body>
            <b-card-body>
              <div class="media d-flex">
                <div class="media-body text-left">
                  <h3 class="text-primary">{{ hillTypes[hill.type].name }}</h3>
                  <h5 class="text-muted">{{ hill.count }}<template v-if="hillTypes[hill.type].count">/{{ hillTypes[hill.type].count }}</template></h5>
                </div>
                <div class="align-self-center">
                  <i class="icofont-5x icofont-hill float-right"></i>
                </div>
              </div>
              <!-- <b-progress variant="primary" class="mt-2 mb-0" :value="0" :max="0" v-else /> -->
            </b-card-body>
            <b-progress variant="primary" height="0.35rem" striped animated class="m-0 bg-transparent" :value="hill.count" :max="hillTypes[hill.type].count" v-if="hillTypes[hill.type].count" />
          </b-card>
        </b-col>
      </b-row>

      <h2>In Jahr</h2>
      <b-row>
        <b-col cols=6 md=4 lg=3 xl=2 v-for="theYear in hikeYears" :key="`hike-year-${theYear.year}`" class="mb-3">
          <b-card :title="`${theYear.year}`" :sub-title="`${theYear.count} ${theYear.count === 1 ? 'Wanderung' : 'Wanderungen'}`" :border-variant="year === theYear.year ? 'primary' : null" class="year-card" :style="{ backgroundColor: theYear.color }">
            <a href="#" class="stretched-link" @click.prevent="updateYear(theYear.year)" />
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12" md="6" lg="4" v-for="hike in hikes" :key="`hike-card-${hike.id}`">
          <router-link class="no-link" :to="{ name: 'post-details', params: { postId: hike.id } }">
            <PostCard :post="hike" />
          </router-link>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'

import api from '@/mixins/api.js'

import ColorGradient from '@/util/ColorGradient'
const style = getComputedStyle(document.body)
const gradient = new ColorGradient([style.getPropertyValue('--dark').trim(), style.getPropertyValue('--primary').trim()], 100)

export default {
  components: {
    Header,
    PostCard
  },
  data: function () {
    return {
      hikeYears: null,
      hillTypeCounts: null,
      hikes: null,
      year: null
    }
  },
  computed: {
    totalHikes: function () {
      if (this.hikeYears) {
        return this.hikeYears.map(y => y.count).reduce((a, b) => a + b, 0)
      } else {
        return 0
      }
    }
  },
  watch: {
    year: function (newValue) {
      this.updateHikes()

      if (this.$router.currentRoute.name !== 'hikes-year' || !this.$router.currentRoute.params || this.$router.currentRoute.params.year !== newValue) {
        this.$router.replace({ name: 'hikes-year', params: { year: newValue } })
      }
    }
  },
  mixins: [api],
  methods: {
    updateYear: function (newValue) {
      this.year = newValue
    },
    updateHikes: function () {
      this.apiGetPosts({ year: this.year, postType: 'hike', orderBy: 'createdOn', ascending: 0 }, result => {
        this.hikes = result
      })
    }
  },
  mounted: function () {
    const yearParam = this.$route.params.year

    if (yearParam) {
      this.year = +yearParam
    }

    this.apiGetHikeYears(result => {
      const maxCount = Math.max(...result.map(y => y.count))
      result.forEach(y => {
        y.color = gradient.getColorAt(0, maxCount, y.count)
      })

      this.hikeYears = result

      if (!this.year) {
        this.year = result[0].year
      }
    })

    this.apiGetHillTypes(result => {
      this.hillTypeCounts = result
    })
  }
}
</script>

<style scoped>
.year-card {
  transition: filter 0.15s ease-in-out;
}
.year-card:hover {
  filter: brightness(85%);
}
</style>
