<template>
  <div class="post-card" :title="post.title">
    <b-img :src="`${storeBaseUrl}image/${getPrimaryImage(post.images).imageId}/small`" v-if="post.images && post.images.length > 0" />
    <div class="overlay" />
    <div class="post-details">
      <div class="post-name text-primary">{{ post.title }}</div>
      <div class="post-date my-3"><i class="icofont-ui-calendar" /> {{ post.createdOn | toDate }}<span v-if="post.endDate"> - {{ post.endDate | toDate }}</span></div>
      <div class="post-hills my-3" v-if="post.hills && post.hills.length > 0"><i class="icofont-tag" /> <b-badge variant="secondary" class="mx-1" v-for="hill in post.hills" :key="`hill-badge-${hill.id}`">{{ hillTypes[hill.type].name }}</b-badge></div>
    </div>
    <div class="post-overview" v-if="post.type === 'hike' && post.stats">
      <div class="post-overview">
        <b-row class="text-center">
          <b-col cols="4">
            <h3><i class="icofont-clock-time" /></h3>
            <p>{{ post.stats.duration | minutesToTime }}<br/>&nbsp;</p>
          </b-col>
          <b-col cols="4">
            <h3><i class="icofont-chart-growth" /></h3>
            <p v-if="post.stats.ascent">{{ post.stats.ascent.toFixed(0) }}<br/>m</p>
          </b-col>
          <b-col cols="4">
            <h3><i class="icofont-ruler" /></h3>
            <p>{{ post.stats.distance }}<br/>km</p>
          </b-col>
        </b-row>
      </div>
    </div>
    <div v-if="showDragHandle" class="drag-handle">
      <i class="icofont-drag icofont-3x" />
    </div>
    <router-link class="no-link stretched-link" :to="{ name: `post-details`, params: { postId: post.id } }" v-else />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    post: {
      type: Object,
      default: () => null
    },
    showDragHandle: {
      type: Boolean,
      default: false
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
.post-card {
    background-color: #FFF;
    border-radius: 5px;
    box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
    margin: 10px auto;
}

.post-card .overlay {
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.post-card {
  height: 450px;
}

.post-card img {
  transition: all 0.15s linear;
  object-fit: cover;
  max-width: 100%;
  height: 100%;
}

.post-card .post-details {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 64%, rgba(255, 255, 0, 0) 50%);
  padding: 15px 20px;
  transition: all 0.15s linear;
}

.post-card .post-name {
    white-space: nowrap;
    font-size: 25px;
    font-weight: bold;
    color: #FFF;
    transition: all 0.15s linear;
    max-width: 80%;
    overflow-x: clip;
    text-overflow: ellipsis;
}

.post-card .post-date,
.post-card .post-hills {
    font-size: 17px;
    color: rgba(255, 255, 255, 1);
    transition: all 0.15s linear;
}

.post-card .post-overview {
    position: absolute;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 50%, rgba(255, 255, 0, 0));
    color: #FFF;
    padding: 50px 0px 20px 0px;
    transition: all 0.15s linear;
}

.post-card .post-overview h3 {
    font-weight: bold;
}

.post-card .post-overview p {
    color: rgba(255, 255, 255, 0.7);
}

.post-card:hover img {
    filter: brightness(80%);
}

.post-card:hover .post-details {
    margin-top: 5px;
}

.post-card:hover .post-overview {
    padding-bottom: 25px;
}

.post-card .drag-handle {
  position: absolute;
  top: 25%;
  right: 10px;
}
.post-card .drag-handle:hover {
  cursor: move;
}
</style>
