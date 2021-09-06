<template>
  <div>
    <Header title="Berge" message="Eine Karte mit allen Bergen die wir bisher bestiegen haben." :image="null" :backgroundImage="require(`@/assets/banner-hills.jpg`)" />

    <HillMap :hills="hills" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import HillMap from '@/components/HillMap'

import api from '@/mixins/api.js'

export default {
  components: {
    Header,
    HillMap
  },
  data: function () {
    return {
      hills: []
    }
  },
  mixins: [api],
  mounted: function () {
    this.apiGetHills(null, result => {
      this.hills = result
    })
  }
}
</script>

<style>

</style>
