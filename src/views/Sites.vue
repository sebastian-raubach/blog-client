<template>
  <div>
    <Header title="Campingplätze" message="Eine Karte mit allen Campingplätzen die wir bisher besucht haben." :image="null" :backgroundImage="require(`@/assets/banner-sites.jpg`)" />

    <SiteMap :sites="sites" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import SiteMap from '@/components/SiteMap'

import { apiGetSites } from '@/mixins/api'

export default {
  components: {
    Header,
    SiteMap
  },
  data: function () {
    return {
      sites: []
    }
  },
  mounted: function () {
    apiGetSites(null, result => {
      this.sites = result
    })
  }
}
</script>

<style>

</style>
