<template>
  <div class="hike-card">
    <b-img :src="`${storeBaseUrl}image/${getPrimaryImage(hike.images).imageId}/small`" v-if="hike.images && hike.images.length > 0" />
    <div class="overlay" />
    <div class="hike-details">
      <div class="hike-name text-primary">{{ hike.title }}</div>
      <div class="hike-date my-3"><i class="icofont-ui-calendar" /> {{ hike.createdOn | toDate }}</div>
      <div class="hike-hills my-3"><i class="icofont-tag" /> <b-badge variant="secondary" class="mx-1" v-for="hill in hike.hills" :key="`hill-badge-${hill.id}`">{{ hillTypes[hill.type].name }}</b-badge></div>
    </div>
    <div class="hike-overview">
      <div class="hike-overview">
        <b-row class="text-center">
          <b-col cols="4">
            <h3><i class="icofont-clock-time" /></h3>
            <p>{{ hike.stats.duration | minutesToTime }}<br/>&nbsp;</p>
          </b-col>
          <b-col cols="4">
            <h3><i class="icofont-chart-growth" /></h3>
            <p>{{ hike.stats.ascent }}<br/>m</p>
          </b-col>
          <b-col cols="4">
            <h3><i class="icofont-ruler" /></h3>
            <p>{{ hike.stats.distance }}<br/>km</p>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    hike: {
      type: Object,
      default: () => null
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
.hike-card {
    background-color: #FFF;
    border-radius: 5px;
    box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
    margin: 10px auto;
}

.hike-card .overlay {
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.hike-card {
  height: 450px;
}

.hike-card img {
  transition: all 0.15s linear;
  object-fit: cover;
  max-width: 100%;
  height: 100%;
}

.hike-card .hike-details {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 64%, rgba(255, 255, 0, 0) 50%);
  padding: 15px 20px;
  transition: all 0.15s linear;
}

.hike-card .hike-name {
    white-space: nowrap;
    font-size: 25px;
    font-weight: bold;
    color: #FFF;
    transition: all 0.15s linear;
    max-width: 80%;
    overflow-x: clip;
    text-overflow: ellipsis;
}

.hike-card .hike-date,
.hike-card .hike-hills {
    font-size: 17px;
    color: rgba(255, 255, 255, 1);
    transition: all 0.15s linear;
}

.hike-card .hike-overview {
    position: absolute;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 50%, rgba(255, 255, 0, 0));
    color: #FFF;
    padding: 50px 0px 20px 0px;
    transition: all 0.15s linear;
}

.hike-card .hike-overview h3 {
    font-weight: bold;
}

.hike-card .hike-overview p {
    color: rgba(255, 255, 255, 0.7);
}

.hike-card:hover img {
    filter: brightness(80%);
}

.hike-card:hover .hike-details {
    margin-top: 5px;
}

.hike-card:hover .hike-overview {
    padding-bottom: 25px;
}
</style>
