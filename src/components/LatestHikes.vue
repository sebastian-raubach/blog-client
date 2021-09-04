<template>
  <div class="hikes">
    <div class="overlay">
      <b-container class="hikes-wrapper">
        <h2 class="section-title text-center">Neueste Wanderungen</h2>

        <div class="item mx-auto" v-for="hike in hikes" :key="`hike-${hike.id}`">
          <div class="image-holder" v-if="hike.images && hike.images.length > 0">
            <img class="image rounded-circle" :src="`${storeBaseUrl}image/${getPrimaryImage(hike.images).imageId}/small`" />
          </div>
          <div class="content-holder">
            <router-link class="no-link" :to="{ name: 'hike-details', params: { hikeId: hike.id } }">
              <div class="content">
                <b-row>
                  <b-col>
                    <h5 class="text-primary">{{ hike.title }}</h5>
                  </b-col>
                  <b-col>
                    <h6 class="text-muted text-right">{{ hike.createdOn | toDate }}</h6>
                  </b-col>
                </b-row>
                <div v-if="hike.hills"><b-badge class="mr-2 my-2" v-for="hill in hike.hills" variant="light" :key="`hill${hike.id}-${hill.id}`">{{ hillTypes[hill.type].name }}</b-badge></div>
                <div class="description" v-html="hike.content" />
              </div>
            </router-link>
          </div>
        </div>
      </b-container>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    hikes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ])
  },
  methods: {
    getPrimaryImage: function (images) {
      if (images && images.length > 0) {
        const result = images.find(i => i.isPrimary)

        if (result) {
          return result
        } else {
          return images[0]
        }
      } else {
        return null
      }
    }
  }
}
</script>

<style scoped>
.hikes {
  background: #0079ed url("~@/assets/parallax-skye.jpg") no-repeat center center;
  background-attachment: fixed;
  background-size: cover;
  background-position: 50% 90%;
}
.overlay {
  background: rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
}
.hikes-wrapper {
  padding-top: 90px;
  padding-bottom: 90px;
}

.hikes .section-title {
  margin: 0;
  margin-bottom: 30px;
  font-size: 36px;
  font-weight: 300;
  color: #fff;
}

.hikes .item {
  position: relative;
  max-width: 800px;
  padding: 30px;
}
.image-holder {
  position: absolute;
  left: 30px;
  text-align: center;
}
.image {
  display: inline-block;
  margin: 0 auto;
  width: 60px;
  height: 60px;
  object-fit: cover;
}
.no-link:hover {
  text-decoration: none;
}
.content {
  background-color: rgba(0, 0, 0, 0.4);
  color: #fff;
  margin-left: 100px;
  border-left: none;
  margin-bottom: 0;
  font-size: 14px;
  min-height: 120px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  -o-border-radius: 4px;
  border-radius: 4px;
  -moz-background-clip: padding;
  -webkit-background-clip: padding-box;
  background-clip: padding-box;
  position: relative;
  padding: 15px;
}
.content:hover {
  background-color: #004c94aa;
  transition: background-color 0.15s linear;
}
.content:before {
  position: absolute;
  left: -10px;
  top: 30px;
  content: "";
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid rgba(0, 0, 0, 0.4);
}
.content:hover:before {
  border-right: 10px solid #406310aa;
  transition: border-right 0.15s linear;
}
.description {
  display: block;/* or inline-block */
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow: hidden;
  max-height: 4.5em;
  line-height: 1.5em;
}
@media (min-width: 576px) {
  .image {
    width: 120px;
    height: 120px;
  }
  .content {
    margin-left: 160px;
  }
}
</style>
