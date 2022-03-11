<template>
  <div>
    <Header title="Berichte" message="Alle Berichte die wir über die Jahre erstellt haben." :image="null" :backgroundImage="require(`@/assets/banner-news.jpg`)" />

    <b-container class="mt-5">
      <h1>Berichte ({{ totalNews }})</h1>

      <h2>In Jahr</h2>
      <b-form-select :options="postYearOptions" v-model="year" />

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

export default {
  components: {
    Header,
    PostCard
  },
  data: function () {
    return {
      postYears: null,
      posts: null,
      year: null,
      postYearOptions: null
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
    updatePosts: function () {
      this.apiGetPosts({ year: this.year, postType: 'news', orderBy: 'createdOn', ascending: 0 }, result => {
        this.posts = result
      })
    }
  },
  mounted: function () {
    const yearParam = this.$route.params.year

    if (yearParam) {
      this.year = yearParam
    }

    this.apiGetPostYears(result => {
      this.postYears = result

      this.postYearOptions = result.map(y => {
        return {
          value: y.year,
          text: `${y.year} - ${y.count} ${y.count > 1 ? 'Berichte' : 'Bericht'}`
        }
      })
      if (!this.year) {
        this.year = result[0].year
      }
    })
  }
}
</script>

<style>

</style>
