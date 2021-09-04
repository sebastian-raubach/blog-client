<template>
  <div>
    <Header title="Wanderungen" message="Alle Wanderungen die wir über die Jahre bestritten haben." :image="null" :backgroundImage="require(`@/assets/banner-hiking.jpg`)" />

    <b-container class="mt-5">
      <h1>Wanderungen ({{ totalHikes }})</h1>

      <h2>Übersicht</h2>
      <b-row>
        <b-col cols="12" md="4" v-for="(hill, index) in hillTypeCounts" :key="`type-${index}`" class="mb-3">
          <b-card>
            <b-card-body>
              <div class="media d-flex">
                <div class="media-body text-left">
                  <h3 class="text-primary">{{ hill.count }}/{{ hillTypes[hill.type].count }}</h3>
                  <h5 class="text-muted">{{ hillTypes[hill.type].name }}</h5>
                </div>
                <div class="align-self-center">
                  <i class="icofont-5x icofont-hill float-right"></i>
                </div>
              </div>
              <b-progress variant="primary" class="mt-2 mb-0" :value="hill.count" :max="hillTypes[hill.type].count" />
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>

      <h2>In Jahr</h2>
      <b-form-select :options="hikeYearOptions" v-model="year" />

      <b-row>
        <b-col cols="12" md="6" lg="4" v-for="hike in hikes" :key="`hike-card-${hike.id}`">
          <router-link class="no-link" :to="{ name: 'hike-details', params: { hikeId: hike.id } }">
            <HikeCard :hike="hike" />
          </router-link>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Header from '@/components/Header'
import HikeCard from '@/components/HikeCard'

import api from '@/mixins/api.js'

export default {
  components: {
    Header,
    HikeCard
  },
  data: function () {
    return {
      hikeYears: null,
      hillTypeCounts: null,
      hikes: null,
      year: null,
      hikeYearOptions: null
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
    year: function () {
      this.updateHikes()
    }
  },
  mixins: [api],
  methods: {
    updateHikes: function () {
      this.apiGetHikesForYear(this.year, result => {
        this.hikes = result
      })
    }
  },
  mounted: function () {
    this.apiGetHikeYears(result => {
      this.hikeYears = result

      this.hikeYearOptions = result.map(y => {
        return {
          value: y.year,
          text: y.year
        }
      })
      this.year = result[0].year
    })

    this.apiGetHillTypes(result => {
      this.hillTypeCounts = result
    })
  }
}
</script>

<style>

</style>
