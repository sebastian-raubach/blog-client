<template>
  <div>
    <Header title="Berichte" message="Alle Berichte die wir über die Jahre erstellt haben." :image="null" :backgroundImage="require(`@/assets/banner-news.jpg`)" />

    <b-container class="mt-5">
      <h1>Berichte ({{ totalNews }})</h1>

      <h2>In Jahr</h2>
      <b-row>
        <b-col cols=6 md=4 lg=3 xl=2 v-for="theYear in postYears" :key="`post-year-${theYear.year}`" class="mb-3">
          <b-card :title="`${theYear.year}`" :sub-title="`${theYear.count} ${theYear.count === 1 ? 'Bericht' : 'Berichte'}`" :border-variant="year === theYear.year ? 'primary' : null" class="post-card" :style="{ backgroundColor: theYear.color }">
            <a href="#" class="stretched-link" @click.prevent="updateYear(theYear.year)" />
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12" md="6" lg="4" v-for="post in posts" :key="`post-card-${post.id}`">
          <router-link class="no-link" :to="{ name: 'post-details', params: { postId: post.id } }">
            <PostCard :post="post" />
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
      postYears: null,
      posts: null,
      year: null
    }
  },
  computed: {
    totalNews: function () {
      if (this.postYears) {
        return this.postYears.map(y => y.count).reduce((a, b) => a + b, 0)
      } else {
        return 0
      }
    }
  },
  watch: {
    year: function (newValue) {
      this.updatePosts()

      if (this.$router.currentRoute.name !== 'posts-year' || !this.$router.currentRoute.params || this.$router.currentRoute.params.year !== newValue) {
        this.$router.replace({ name: 'posts-year', params: { year: newValue } })
      }
    }
  },
  mixins: [api],
  methods: {
    updateYear: function (newValue) {
      this.year = newValue
    },
    updatePosts: function () {
      this.apiGetPosts({ year: this.year, postType: 'news', orderBy: 'createdOn', ascending: 0 }, result => {
        this.posts = result
      })
    }
  },
  mounted: function () {
    const yearParam = this.$route.params.year

    if (yearParam) {
      this.year = +yearParam
    }

    this.apiGetPostYears(result => {
      const maxCount = Math.max(...result.map(y => y.count))
      result.forEach(y => {
        y.color = gradient.getColorAt(0, maxCount, y.count)
      })

      this.postYears = result

      if (!this.year) {
        this.year = result[0].year
      }
    })
  }
}
</script>

<style scoped>
.post-card {
  transition: filter 0.15s ease-in-out;
}
.post-card:hover {
  filter: brightness(85%);
}
</style>
