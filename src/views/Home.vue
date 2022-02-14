<template>
  <div>
    <Header :title="title" :message="message" :image="image" :backgroundImage="require(`@/assets/${backgroundImage}`)" />

    <div id="about" class="about-section">
      <b-container class="text-center">
        <h2 class="section-title">Wozu eine Webseite?</h2>
        <p class="intro">Diese Webseite gibt es aus zwei Gründen: Zum einen möchten wir Leute auf dem Laufenden halten die noch Interesse daran haben was bei uns so los ist und zum anderen ist diese Seite auch eine schöne Ansammlung an Erinnerungen für uns selber.</p>

        <b-row class="items-wrapper">
          <b-col cols="12" md="6" class="item">
            <div class="item-inner">
              <div class="figure-holder">
                <img class="figure-image" src="@/assets/category-news.svg" alt="image">
              </div>
              <h3 class="item-title">Neuigkeiten</h3>
              <div class="item-desc mb-3">
                Hier findet man alle Neuigkeiten. Von Kleinigkeiten bis zu größeren Veränderungen ist hier alles zu entdecken.</div>
              <b-button variant="primary" :to="{ name: 'posts' }">Los geht's</b-button>
            </div>
          </b-col>
          <b-col cols="12" md="6" class="item">
            <div class="item-inner">
              <div class="figure-holder">
                <img class="figure-image" src="@/assets/category-hiking.svg" alt="image">
              </div>
              <h3 class="item-title">Wanderberichte</h3>
              <div class="item-desc mb-3">
                Alle unsere Wanderberichte über die letzten Jahre. Jeder Bericht kommt mit einer Streckenangabe, Bildern von der Wanderung und einer Bewertung.
              </div>
              <b-button variant="primary" :to="{ name: 'hikes' }">Los geht's</b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>

      <b-row no-gutters>
        <b-col cols=12 xl=6>
          <LatestPosts type="post" :posts="posts" class="h-100" />
        </b-col>
        <b-col cols=12 xl=6>
          <LatestPosts type="hike" :posts="hikes" class="h-100" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import LatestPosts from '@/components/LatestPosts'

import api from '@/mixins/api.js'

export default {
  components: {
    Header,
    LatestPosts
  },
  data: function () {
    return {
      title: 'Willkommen auf der Homepage von Miri & Baz',
      message: 'Wir laden hier (halbwegs) regelmäßig Updates von uns hoch.',
      image: 'logo.svg', // 'banner.jpg',
      backgroundImage: 'banner.jpg',
      hikes: null,
      posts: null
    }
  },
  mixins: [api],
  created: function () {
    this.apiPostHikeList({
      page: 0,
      limit: 5,
      orderBy: 'createdOn',
      ascending: 0
    }, result => {
      this.hikes = result
    })
    this.apiPostPostList({
      page: 0,
      limit: 5,
      orderBy: 'createdOn',
      ascending: 0
    }, result => {
      this.posts = result
    })
  }
}
</script>

<style>
.about-section {
  padding-top: 90px;
  background-color: #ecf0f1;
  color: #474b4f;
}

.about-section .section-title {
  margin: 0;
  margin-bottom: 15px;
  font-size: 36px;
  font-weight: 300;
}

.about-section .intro {
  color: #6b6e70;
  font-size: 16px;
  max-width: 760px;
  margin: 0 auto;
  margin-bottom: 60px;
}

.about-section .items-wrapper {
  padding-bottom: 60px;
}

.about-section .items-wrapper .figure-holder {
  margin-bottom: 15px;
  vertical-align: bottom;
}

.about-section .items-wrapper .figure-image {
  height: 220px;
  max-width: 100%;
}

.about-section .items-wrapper .item-inner {
  padding: 30px;
}

.about-section .items-wrapper .item-title {
  color: #0079ed;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 15px;
}

.about-section .items-wrapper .item-desc {
  color: #6b6e70;
}
</style>
