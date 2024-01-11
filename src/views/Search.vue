<template>
  <div>
    <Header title="Suchen" message="Hier kann nach jeglichen Stichwörtern gesucht werden." :image="null" :backgroundImage="require(`@/assets/banner-search.jpg`)" />

    <b-container class="mt-5">
      <b-form @submit.prevent="runSearch">
        <b-form-group label="Suchbegriff" label-for="search">
          <b-input-group>
            <b-input id="search" type="search" v-model="search" placeholder="Suchbegriff eingeben..." autofocus ref="search" />
            <b-input-group-append>
              <b-button variant="success" type="submit"><i class="icofont-search-document" /></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-form>

      <template v-if="stories || posts">
        <template v-if="posts">
          <h2>Berichte</h2>
          <b-row v-if="posts.length > 0">
            <b-col cols="12" md="6" lg="4" v-for="post in posts" :key="`post-card-${post.id}`">
              <router-link class="no-link" :to="{ name: 'post-details', params: { postId: post.id } }">
                <PostCard :post="post" />
              </router-link>
            </b-col>
          </b-row>
          <h5 v-else>Keine Berichte gefunden.</h5>
        </template>

        <template v-if="stories">
          <h2>Stories</h2>
          <div v-if="stories.length > 0">
            <StoryCard v-for="story in stories" :key="`story-${story.id}`" :story="story" />
          </div>
          <h5 v-else>Keine Stories gefunden.</h5>
        </template>
      </template>
    </b-container>
  </div>
</template>

<script>
import Header from '@/components/Header'
import StoryCard from '@/components/StoryCard'
import PostCard from '@/components/PostCard'

import { apiGetStories, apiGetPosts } from '@/mixins/api'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    Header,
    PostCard,
    StoryCard
  },
  data: function () {
    return {
      search: null,
      stories: null,
      posts: null
    }
  },
  methods: {
    runSearch: function () {
      emitter.emit('set-loading', true)

      apiGetStories({
        orderBy: 'createdOn',
        ascending: 0,
        searchQuery: this.search
      }, result => {
        this.stories = result
        emitter.emit('set-loading', false)
      })
      apiGetPosts({
        orderBy: 'createdOn',
        ascending: 0,
        searchQuery: this.search
      }, result => {
        this.posts = result
        emitter.emit('set-loading', false)
      })

      // Change window URL to reflect new search term
      window.history.replaceState({}, null, this.$router.resolve({ name: 'search-query', params: { searchTerm: this.search } }).href)
    }
  },
  mounted: function () {
    this.search = this.$route.params.searchTerm

    if (this.search) {
      this.runSearch()
    }

    this.$nextTick(() => this.$refs.search.focus())
  }
}
</script>

<style>

</style>
