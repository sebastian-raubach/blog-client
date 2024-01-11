<template>
  <div>
    <Header title="Stories" message="Zusammenfassungen mehrerer Berichte und Wanderungen für Dinge wie Urlaube." :image="null" :backgroundImage="require(`@/assets/banner-stories.jpg`)" />

    <b-container class="mt-5">
      <StoryCard v-for="story in stories" :key="`story-${story.id}`" :story="story" />
    </b-container>
  </div>
</template>

<script>
import Header from '@/components/Header'
import StoryCard from '@/components/StoryCard'

import { apiPostStoryList } from '@/mixins/api'
import { MAX_JAVA_INTEGER } from '@/mixins/util'

export default {
  components: {
    Header,
    StoryCard
  },
  data: function () {
    return {
      stories: []
    }
  },
  mounted: function () {
    apiPostStoryList({
      page: 0,
      limit: MAX_JAVA_INTEGER,
      orderBy: 'createdOn',
      ascending: 0
    }, null, result => {
      this.stories = result
    })
  }
}
</script>

<style scoped>

</style>
