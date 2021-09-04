<template>
  <div class="banner-section" :style="{ minHeight: `${height}px` }">
    <div class="banner-carousel" :style="{ minHeight: `${height}px` }">
      <div class="figure-holder-wrapper">
        <b-container>
          <b-row class="justify-content-end">
            <div class="figure-holder" :style="{ minHeight: `${height}px` }">
              <img v-if="image" class="figure-image img-fluid" :src="require(`@/assets/${image}`)" alt="image" />
            </div>
          </b-row>
        </b-container>
      </div>
      <div class="banner-inner">
        <div class="banner-background" v-if="backgroundImage" :style="{ backgroundPosition: `${backgroundPosition}`, backgroundImage: `url('${backgroundImage}')` }" />
        <div class="banner-item" :style="{ minHeight: `${height}px` }">
          <b-container class="item-content">
            <div class="item-content-inner">
              <h2 class="heading">{{ title }}</h2>
              <p class="intro" v-if="message">{{ message }}</p>
            </div>
            <slot name="content" />
          </b-container>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    },
    message: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    backgroundImage: {
      type: String,
      default: null
    },
    backgroundPosition: {
      type: String,
      default: 'center'
    },
    height: {
      type: Number,
      default: 560
    }
  }
}
</script>

<style>
.banner-section {
  background: #494d55;
  position: relative;
}

.banner-section .figure-holder-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  overflow: hidden;
}

.banner-section .figure-holder {
  position: relative;
  width: 100%;
}

.banner-section .figure-holder .figure-image {
  position: absolute;
  bottom: 0;
  right: 15px;
  z-index: 10;
}

.banner-carousel {
  position: relative;
  color: #fff;
}

.banner-inner {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.banner-carousel .banner-inner .banner-item {
  background-position: center center;
  z-index: 1;
  opacity: 1;
  display: block;
  position: relative;
  float: left;
  width: 100%;
  margin-right: -100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.banner-carousel .banner-inner .banner-background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  filter: brightness(75%);
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

.banner-carousel .banner-inner .heading {
  font-size: 30px;
  line-height: 1.4;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.banner-carousel .banner-inner .intro {
  font-size: 18px;
}

.banner-carousel .banner-inner .intro + .btn {
  margin-top: 15px;
}

@media (max-width: 767.98px) {
  .banner-carousel .banner-inner .heading {
    font-size: 26px;
  }
  .banner-carousel .banner-inner .item-content-inner {
    padding-top: 100px;
  }
  .banner-section .figure-holder .figure-image {
    width: inherit;
    bottom: 20px;
    top: inherit;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    text-align: center;
  }
  .banner-carousel {
    height: 660px;
  }
  .banner-section .banner-inner {
    height: 660px;
  }
  .banner-carousel .banner-inner .item {
    height: 660px;
  }
}

@media (min-width: 768px) {
  .banner-section .figure-holder .figure-image {
    width: 300px;
    bottom: inherit;
    top: 130px;
  }
  .banner-carousel .banner-inner .item-content-inner {
    max-width: 300px;
    padding-top: 120px;
  }
}

@media (min-width: 992px) {
  .banner-section .figure-holder .figure-image {
    width: 300px;
    bottom: inherit;
    top: 130px;
  }
  .banner-carousel .banner-inner .item-content-inner {
    max-width: 500px;
  }
}

@media (min-width: 1200px) {
  .banner-section .figure-holder .figure-image {
    width: 570px;
    bottom: 0;
    max-width: 300px;
    /* top: inherit; */
  }
}
</style>
