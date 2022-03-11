<template>
  <div>
    <Header title="Stories" message="Zusammenfassungen mehrerer Berichte und Wanderungen für Dinge wie Urlaube." :image="null" :backgroundImage="require(`@/assets/banner-stories.jpg`)" />

    <b-container class="mt-5">
      <b-card no-body class="overflow-hidden position-relative story-card mb-4" v-for="(story, index) in stories" :key="`story-${story.id}`">
        <b-row no-gutters class="stories">
          <b-col md="8" class="position-static">
            <b-card-body>
              <div class="d-flex justify-content-between align-items-center">
                <b-card-title>{{ story.title }}</b-card-title>
                <b-card-sub-title class="text-right">
                  <i class="icofont-ui-calendar" /> {{ minDates[index] | toDate }} - {{ maxDates[index] | toDate }}
                </b-card-sub-title>
              </div>
              <div class="story-content-wrapper">
                <b-card-text class="story-description">
                  <div v-html="story.content" />
                </b-card-text>
              </div>
              <div class="d-flex justify-content-between align-items-end">
                <b-button variant="primary" class="stretched-link" :to="{ name: 'story-details', params: { storyId: story.id } }">Story lesen</b-button>
                <div class="avatars">
                  <span class="avatar" v-for="image in postImages[index]" :key="`image-${story.id}-${image.imageId}`">
                    <img :src="`${storeBaseUrl}image/${image.imageId}/small`" width="75" height="75"/>
                  </span>
                </div>
              </div>
            </b-card-body>
          </b-col>
          <b-col md="4">
            <div class="story-image" :style="{ backgroundImage: `url('${storeBaseUrl}image/${postImages[index][0].imageId}/small')` }" />
          </b-col>
        </b-row>
      </b-card>
    </b-container>
  </div>
</template>

<script>
import Header from '@/components/Header'

import { mapGetters } from 'vuex'

import api from '@/mixins/api.js'

export default {
  components: {
    Header
  },
  data: function () {
    return {
      stories: []
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ]),
    minDates: function () {
      if (!this.stories || this.stories.length < 1) {
        return []
      } else {
        return this.stories.map(s => {
          if (s.posts && s.posts.length > 0) {
            try {
              return Math.min(...s.posts.map(p => new Date(p.createdOn)))
            } catch (err) {
              return new Date(s.createdOn)
            }
          } else {
            return new Date(s.createdOn)
          }
        })
      }
    },
    maxDates: function () {
      if (!this.stories || this.stories.length < 1) {
        return []
      } else {
        return this.stories.map(s => {
          if (s.posts && s.posts.length > 0) {
            try {
              return Math.max(...s.posts.map(p => {
                const start = new Date(p.createdOn)
                const end = p.endDate ? new Date(p.endDate) : null

                return end > start ? end : start
              }))
            } catch (err) {
              return new Date(s.createdOn)
            }
          } else {
            return new Date(s.createdOn)
          }
        })
      }
    },
    postImages: function () {
      if (!this.stories || this.stories.length < 1) {
        return []
      } else {
        return this.stories.map(s => {
          if (s.posts && s.posts.length > 0) {
            return s.posts.slice(0, 10).map(p => {
              if (p.images && p.images.length > 0) {
                return p.images.find(i => i.isPrimary)
              } else {
                return null
              }
            }).filter(s => s !== null)
          } else {
            return []
          }
        })
      }
    }
  },
  mixins: [api],
  mounted: function () {
    this.apiPostStoryList({
      page: 0,
      limit: this.MAX_JAVA_INTEGER,
      orderBy: 'createdOn',
      ascending: 0
    }, null, result => {
      this.stories = result
    })
  }
}
</script>

<style scoped>
.story-image {
  height: 100%;
  min-height: 200px;
  position: relative;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: cover;
}
.story-description {
  display: block;/* or inline-block */
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow: hidden;
  max-height: 7.5em;
  line-height: 1.5em;
  text-align: justify;
}

.story-content-wrapper:after {
  content: "...";
}
.avatar img {
  border-radius: 50%;
  position: relative;
  left: -5px;
  margin-left: -40px;
  z-index: 1;
  border: 3px solid #494d55;
  box-sizing: content-box;
  object-fit: cover;
}
.avatars {
  text-align: right;
  padding-left: 60px;
}
@media (min-width: 768px) {
  .story-image:after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 82%;
    height: 150%;
    width: 100%;
    background: #494d55;
    -webkit-transform: rotate(15deg);
    -moz-transform: rotate(15deg);
    transform: rotate(15deg);
    box-shadow: 6px 6px 12px rgb(0 0 0 / 50%);
  }
  .stories .story-image:after {
    transition: right 0.15s linear;
  }
  .stories:hover .story-image:after {
    right: 80%;
  }
}
</style>
