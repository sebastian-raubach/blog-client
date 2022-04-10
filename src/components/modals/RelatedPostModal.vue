<template>
  <b-modal ref="modal" size="xl" title="Beziehung hinzufügen" @ok.prevent="onSubmit" @hidden="reset" ok-title="Hinzufügen" :ok-disabled="!enabled">
    <b-row>
      <b-col cols=12 sm=6>
        <b-form-group label-for="hike" label="Wanderung">
          <VueTypeaheadBootstrap v-model="tempHikeName"
                                id="hike"
                                :data="hikes"
                                :serializer="item => item.title"
                                @hit="tempHike = $event"
                                placeholder="Wanderungsnamen oder Bergnamen eingeben zum Suchen"
                                @input="lookupHike">
            <template slot="suggestion" slot-scope="{ data, htmlText }">
              <div class="d-flex justify-content-between">
                <span v-html="htmlText" />
                <span>{{ data.createdOn | toDate }}</span>
              </div>
            </template>
          </VueTypeaheadBootstrap>
        </b-form-group>
      </b-col>
      <b-col cols=12 sm=6>
        <b-form-group label-for="news" label="Neuigkeiten">
          <VueTypeaheadBootstrap v-model="tempNewsName"
                                id="news"
                                :data="news"
                                :serializer="item => item.title"
                                @hit="tempNews = $event"
                                placeholder="Neuigkeitennamen eingeben zum Suchen"
                                @input="lookupNews">
            <template slot="suggestion" slot-scope="{ data, htmlText }">
              <div class="d-flex justify-content-between">
                <span v-html="htmlText" />
                <span>{{ data.createdOn | toDate }}</span>
              </div>
            </template>
          </VueTypeaheadBootstrap>
        </b-form-group>
      </b-col>
      <b-col cols=12 class="text-center my-3">
        <b-button variant="primary" @click="addToRelated" :disabled="!tempNews && !tempHike"><i class="icofont-arrow-down" /></b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-for="(post, index) in posts" :key="`post-${post.id}`" cols=12 md=4>
        <PostCard :post="post"/>
        <b-button variant="danger" @click="removeFromRelated(index)"><i class="icofont-ui-delete" /></b-button>
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
import api from '@/mixins/api.js'
import { debounce } from 'lodash'
import PostCard from '@/components/PostCard'
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'

export default {
  components: {
    PostCard,
    VueTypeaheadBootstrap
  },
  data: function () {
    return {
      tempHikeName: null,
      tempHike: null,
      hikes: [],
      tempNewsName: null,
      tempNews: null,
      news: [],
      posts: []
    }
  },
  computed: {
    enabled: function () {
      return this.posts.length > 0
    }
  },
  mixins: [api],
  methods: {
    reset: function () {
      this.tempHikeName = null
      this.tempHike = null
      this.hikes = []
      this.tempNewsName = null
      this.tempNews = null
      this.news = []
    },
    show: function () {
      this.reset()
      this.posts = []
      this.$refs.modal.show()
    },
    hide: function () {
      this.$refs.modal.hide()
    },
    removeFromRelated: function (index) {
      this.posts.splice(index, 1)
    },
    addToRelated: function () {
      if (this.tempHike) {
        this.posts.push(this.tempHike)
      }
      if (this.tempNews) {
        this.posts.push(this.tempNews)
      }
      this.reset()
    },
    lookupHike: debounce(function () {
      this.apiPostHikeList({
        searchTerm: this.tempHikeName,
        page: 0,
        limit: this.MAX_JAVA_INTEGER,
        orderBy: 'title',
        ascending: 1
      }, result => {
        this.hikes = result
      })
    }),
    lookupNews: debounce(function () {
      this.apiPostPostList({
        searchTerm: this.tempNewsName,
        page: 0,
        limit: this.MAX_JAVA_INTEGER,
        orderBy: 'title',
        ascending: 1
      }, result => {
        this.news = result
      })
    }),
    onSubmit: function () {
      this.$emit('related-posts-selected', this.posts.map(p => p.id))

      this.$nextTick(() => this.hide())
    }
  }
}
</script>

<style>

</style>
