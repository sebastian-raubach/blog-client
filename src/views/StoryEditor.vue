<template>
  <div>
    <Header title="Neue Story erstellen" message="Hier werden neue Stories erstellt" :image="null" :backgroundImage="require('@/assets/banner-story-editor.jpg')" />

    <b-container class="mt-5">
      <b-form @submit.prevent="createStory">
        <b-row>
          <b-col cols=12 sm=6>
            <b-form-group label="Titel" label-for="title">
              <b-form-input id="title" v-model="title" required />
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6>
            <b-form-group label-for="date" label="Datum">
              <b-input type="date" id="date" v-model="date" required />
            </b-form-group>
          </b-col>
          <b-col cols=12>
            <b-form-group label="Beschreibung" label-for="content">
              <b-button-toolbar>
                <b-button-group>
                  <b-button v-for="umlaut in umlauts" :key="`umlaut-${umlaut}`" @click="addCharacter(umlaut)">{{ umlaut }}</b-button>
                </b-button-group>
              </b-button-toolbar>
              <b-textarea rows="5" class="story-description" id="content" v-model="content" required />

              <VueMarkdown :source="content" />
            </b-form-group>
          </b-col>
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
            <b-button variant="primary" @click="addToStory" :disabled="!tempNews && !tempHike"><i class="icofont-arrow-down" /></b-button>
          </b-col>
        </b-row>

        <draggable tag="b-row" :list="posts" handle=".drag-handle">
          <b-col v-for="(post, index) in posts" :key="`post-${post.id}`" cols=12 md=4>
            <PostCard :post="post" :showDragHandle="true"/>
            <b-button variant="danger" @click="removeFromStory(index)"><i class="icofont-ui-delete" /></b-button>
          </b-col>
        </draggable>

        <hr />
        <b-button type="submit" variant="primary" :disabled="formDisabled" class="my-3">Erstellen</b-button>
      </b-form>
    </b-container>
  </div>
</template>

<script>
import VueMarkdown from '@adapttive/vue-markdown'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'

import { debounce } from 'lodash'
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'

import Draggable from 'vuedraggable'

import api from '@/mixins/api.js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    Draggable,
    Header,
    PostCard,
    VueMarkdown,
    VueTypeaheadBootstrap
  },
  data: function () {
    return {
      umlauts: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
      title: '',
      content: '',
      date: null,
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
    formDisabled: function () {
      return !this.title || !this.content || !this.date || !this.posts || this.posts.length < 1
    }
  },
  mixins: [api],
  methods: {
    addCharacter: function (umlaut) {
      this.content = this.content + umlaut
    },
    createStory: function () {
      emitter.emit('set-loading', true)

      this.apiPutStory({
        title: this.title,
        content: this.content,
        createdOn: new Date(this.date).toISOString()
      }, storyId => {
        this.apiPutStoryPosts(storyId, this.posts.map(p => p.id), result => {
          this.$router.push({ name: 'story-details', params: { storyId: storyId } })

          emitter.emit('set-loading', true)
        })
      })
    },
    removeFromStory: function (index) {
      this.posts.splice(index, 1)
    },
    addToStory: function () {
      if (this.tempHike) {
        this.posts.push(this.tempHike)
      }
      if (this.tempNews) {
        this.posts.push(this.tempNews)
      }
      this.reset()
    },
    reset: function () {
      this.tempHikeName = null
      this.tempHike = null
      this.hikes = []
      this.tempNewsName = null
      this.tempNews = null
      this.news = []
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
    })
  }
}
</script>

<style scoped>
.story-description {
  font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;
}
</style>
