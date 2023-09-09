<template>
  <div v-if="story">
    <Header :title="story.title" :image="null" :backgroundImage="backgroundImage" />

    <b-container class="mt-5">
      <h2><i class="icofont-ui-calendar" /> {{ minDate | toDate }} - {{ maxDate | toDate }}</h2>

      <div class="pt-5" v-html="story.content" v-if="story.content" />
      <VueMarkdown class="pt-5" :source="story.contentMarkdown" v-else-if="story.contentMarkdown" />

      <b-row>
        <b-col cols="12" md="6" lg="4" v-for="post in story.posts" :key="`post-card-${post.id}`">
          <router-link class="no-link" :to="{ name: 'post-details', params: { postId: post.id } }">
            <PostCard :post="post" />
          </router-link>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import VueMarkdown from '@adapttive/vue-markdown'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'

import api from '@/mixins/api.js'

import { mapGetters } from 'vuex'

export default {
  components: {
    Header,
    PostCard,
    VueMarkdown
  },
  data: function () {
    return {
      story: null
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ]),
    backgroundImage: function () {
      if (!this.story || !this.story.posts || this.story.posts.length < 1) {
        return null
      } else {
        const primary = this.story.posts.map(p => {
          if (!p.images || p.images.length < 1) {
            return null
          } else {
            return p.images.find(i => i.isPrimary)
          }
        })[0]

        return `${this.storeBaseUrl}image/${primary.imageId}/large/${primary.imagePath}`
      }
    },
    minDate: function () {
      if (this.story.posts && this.story.posts.length > 0) {
        try {
          return Math.min(...this.story.posts.map(p => new Date(p.createdOn)))
        } catch (err) {
          return new Date(this.story.createdOn)
        }
      } else {
        return new Date(this.story.createdOn)
      }
    },
    maxDate: function () {
      if (this.story.posts && this.story.posts.length > 0) {
        try {
          return Math.max(...this.story.posts.map(p => {
            const start = new Date(p.createdOn)
            const end = p.endDate ? new Date(p.endDate) : null

            return end > start ? end : start
          }))
        } catch (err) {
          return new Date(this.story.createdOn)
        }
      } else {
        return new Date(this.story.createdOn)
      }
    }
  },
  mixins: [api],
  mounted: function () {
    const storyId = this.$route.params.storyId

    if (storyId) {
      this.apiGetStory(storyId, result => {
        this.story = result
      })
    }
  }
}
</script>

<style>

</style>
