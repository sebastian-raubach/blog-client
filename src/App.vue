<template>
  <div id="app">
    <b-navbar toggleable="md" sticky type="dark" id="header" :class="`header ${isScrolled ? 'header-scrolled' : null}`">
      <b-container>
        <h1 class="logo">
          <router-link class="scrollto" :to="{ name: 'home' }">
            <span class="logo-icon-wrapper"><img class="logo-icon" src="@/assets/logo-small.svg" alt="icon"></span>
            <span class="text"><span class="highlight">MIRI</span>&amp;<span class="highlight">BAZ</span></span>
          </router-link>
        </h1>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            <b-nav-item :to="{ name: 'home' }">Home</b-nav-item>
            <b-nav-item :to="{ name: 'posts' }">Neuigkeiten</b-nav-item>
            <b-nav-item :to="{ name: 'stories' }">Stories</b-nav-item>
            <b-nav-item :to="{ name: 'hikes' }">Wandern</b-nav-item>
            <b-nav-item :to="{ name: 'search' }">Suche</b-nav-item>
            <b-nav-item-dropdown right variant="dark" text="Admin" v-if="storeToken">
              <b-dropdown-item variant="dark" :to="{ name: 'post-editor' }">Neuer Beitrag</b-dropdown-item>
              <b-dropdown-item variant="dark" :to="{ name: 'story-editor' }">Neue Story</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-container>
    </b-navbar>

    <router-view :key="$route.fullPath"/>

    <footer class="footer text-center">
      <div class="container">
        <div><small class="copyright">Inhalt und Bilder von Miriam Schreiber und Sebastian Raubach</small></div>
        <!--/* This template is free as long as you keep the footer attribution link. If you'd like to use the template without the attribution link, you can buy the commercial license via our website: themes.3rdwavemedia.com Thank you for your support. :) */-->
        <div><small class="copyright">Template designed with <i class="icofont-heart footer-icon" /> by <a href="https://themes.3rdwavemedia.com/" target="_blank">Xiaoying Riley</a> for developers</small></div>
        <hr />
        <div>
          <small class="copyright">
            <a href="#" @click.prevent="logout" v-if="storeToken">Logout</a>
            <a href="#" @click.prevent="$refs.loginModal.show()" v-else>Login</a>
          </small>
        </div>
      </div>
    </footer>

    <LoginModal ref="loginModal" />

    <b-modal v-model="loading" title="Lade" hide-footer no-close-on-backdrop no-close-on-esc hide-header-close>
      <div class="text-center">
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import LoginModal from '@/components/modals/LoginModal'
import { mapGetters } from 'vuex'
import { setOptions, bootstrap } from 'vue-gtag'

import api from '@/mixins/api.js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    LoginModal
  },
  data: function () {
    return {
      headerClass: '',
      loading: false,
      scrollY: 0
    }
  },
  computed: {
    /** Mapgetters exposing the store configuration */
    ...mapGetters([
      'storeToken'
    ]),
    isScrolled: function () {
      return this.scrollY > 0
    }
  },
  mixins: [api],
  methods: {
    logout: function () {
      this.$store.dispatch('setToken', null)
      this.$router.push({ name: 'home' })
    },
    onScrollResize: function () {
      this.scrollY = window.scrollY
    },
    setLoading: function (visible) {
      this.loading = visible
    }
  },
  mounted: function () {
    document.addEventListener('scroll', this.onScrollResize)
    document.addEventListener('resize', this.onScrollResize)

    emitter.on('set-loading', this.setLoading)

    this.apiGetSettings(settings => {
      if (settings && settings.googleAnalyticsKey) {
        setOptions({
          config: { id: settings.googleAnalyticsKey },
          enabled: true
        })

        bootstrap()
      }
    })
  },
  beforeDestroy: function () {
    document.removeEventListener('scroll', this.onScrollResize)
    document.removeEventListener('resize', this.onScrollResize)

    emitter.off('set-loading', this.setLoading)
  }
}
</script>

<style lang="scss">
$primary: #0079ed;
$body-bg: #222629;
$body-color: #ecf0f1;
$modal-content-color:  #ecf0f1;
$modal-content-bg: #222629;
$modal-content-border-color: rgba(#ecf0f1, .2);
$border-color: #495057;
$close-color: #ecf0f1;

$border-radius: 0;
$border-radius-sm: 0;
$border-radius-lg: 0;
$border-radius-pill: 0;

$input-bg: #494d55;
$input-color: #8099a0;

$card-color: #ffffff;
$card-bg: #494d55;
$text-muted: #ced4da;

@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';

body {
  font-family: 'Open Sans', arial, sans-serif;
  color: #ecf0f1;
  background-color: #222629;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height:  100vh;
}

p {
  margin-bottom: 15px;
  line-height: 1.5;
}

a {
  color: #3aa7aa;
  -webkit-transition: all 0.4s ease-in-out;
  -moz-transition: all 0.4s ease-in-out;
  -ms-transition: all 0.4s ease-in-out;
  -o-transition: all 0.4s ease-in-out;
}

a:hover {
  text-decoration: underline;
  color: #339597;
}

a:active {
  text-decoration: none;
}

a:focus {
  text-decoration: none;
}

.btn, a.btn {
  -webkit-transition: all 0.4s ease-in-out;
  -moz-transition: all 0.4s ease-in-out;
  -ms-transition: all 0.4s ease-in-out;
  -o-transition: all 0.4s ease-in-out;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
}

.btn .fa, a.btn .fa {
  margin-right: 5px;
}

.btn:focus, a.btn:focus {
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
}

.btn-cta, a.btn-cta {
  font-weight: bold;
  font-size: 16px;
  padding: 10px 30px;
}

.btn-primary:hover, .btn-primary:focus, .btn-primary:active, .btn-primary.active, .btn-primary.hover {
  background: #3aa7aa;
  color: #fff;
  border: 1px solid #3aa7aa;
}

.btn-inverse {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid transparent;
  color: #fff;
}

.btn-inverse:hover, .btn-inverse:focus, .btn-inverse:active, .btn-inverse.active, .btn-inverse.hover {
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid transparent;
}

.header {
  background-color: transparent;
  height: 60px;
  position: fixed;
  width: 100%;
  transition: background-color .15s linear;
}

.header.header-scrolled {
  background-color: #222629;
  -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.header.header-scrolled a {
  color: #eee;
}

.header.header-scrolled .logo {
  color: #0079ed;
  padding-top: 6px;
}

.header.header-scrolled .logo .logo-icon-wrapper {
  background: #0079ed;
  width: 40px;
  height: 40px;
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  -ms-border-radius: 50%;
  -o-border-radius: 50%;
  border-radius: 50%;
  -moz-background-clip: padding;
  -webkit-background-clip: padding-box;
  background-clip: padding-box;
  text-align: center;
}

.header.header-scrolled .logo .logo-icon {
  width: 20px;
  height: 20px;
  margin-right: 0;
}

.header.header-scrolled .main-nav .nav .nav-link {
  color: #a2a6af;
}

.header.header-scrolled .main-nav .nav .nav-link:hover {
  color: #6b6e70;
}

.header.header-scrolled .main-nav .nav .nav-link.active {
  color: #eee;
  border-bottom: 4px solid #0079ed;
}

.header a {
  color: #fff;
  -webkit-transition: none;
  -moz-transition: none;
  -ms-transition: none;
  -o-transition: none;
}

.header a:hover {
  text-decoration: none;
}

.header .logo {
  margin: 0;
  display: inline-block;
  float: left;
  font-size: 28px;
}

.header .logo .logo-icon-wrapper {
  margin-right: 3px;
  position: relative;
  display: inline-block;
  top: -3px;
}

.header .logo .logo-icon {
  width: 30px;
  height: 30px;
}

.header .logo .highlight {
  font-weight: 800;
}

.main-nav {
  margin-top: 6px;
}

.main-nav .navbar-toggler {
  margin-right: 0;
  margin-top: 0;
  background: none;
  position: absolute;
  padding: 8px 10px;
  right: 10px;
  top: 10px;
  background: rgba(0, 0, 0, 0.6);
}

.main-nav .navbar-toggler:focus {
  outline: none;
}

.main-nav .navbar-toggler .icon-bar {
  display: block;
  background-color: #fff;
  height: 3px;
  width: 22px;
  -webkit-border-radius: 1px;
  -moz-border-radius: 1px;
  -ms-border-radius: 1px;
  -o-border-radius: 1px;
  border-radius: 1px;
  -moz-background-clip: padding;
  -webkit-background-clip: padding-box;
  background-clip: padding-box;
}

.main-nav .navbar-toggler .icon-bar + .icon-bar {
  margin-top: 4px;
}

.main-nav .navbar-toggler:hover .icon-bar {
  background-color: #fff;
}

.main-nav .nav .nav-item {
  font-weight: normal;
  font-size: 14px;
  margin-right: 10px;
}

.main-nav .nav .nav-item .nav-link {
  color: rgba(255, 255, 255, 0.65);
  font-weight: 700;
}

.main-nav .nav .nav-item .nav-link.active {
  position: relative;
  background: none;
  color: #fff;
}

.main-nav .nav .nav-item .nav-link:hover {
  color: #fff;
  background: none;
}

.main-nav .nav .nav-item .nav-link:focus {
  outline: none;
  background: none;
}

.main-nav .nav .nav-item .nav-link:active {
  outline: none;
  background: none;
}

.main-nav .nav .nav-item:last-child {
  margin-right: 0;
}

.nav > li > a {
  padding-left: 5px;
  padding-right: 5px;
}

.nav-link {
  padding: 15px;
}

.footer {
  background: #26282c;
  color: rgba(255, 255, 255, 0.6);
  padding: 15px 0;
}

hr {
  border-top: 1px solid white;
}

.footer .footer-icon {
  color: #EA5395;
}

@media (max-width: 767.98px) {
  .navbar-collapse {
    background: rgba(49, 52, 58, 0.9);
  }
  .header.header-scrolled .main-nav .nav .nav-link.active {
    color: #0079ed;
    border: none;
  }
  .navbar-collapse .nav-item {
    margin-right: 0;
  }
  .navbar-collapse .nav-item a {
    text-align: center;
  }
}

@media (min-width: 768px) {
}

@media (min-width: 992px) {
  .nav .nav-item {
    margin-right: 25px;
  }
}

@media (min-width: 1200px) {
}

// Bootstrap fixes
.custom-file-label::after {
  background-color: inherit;
}
</style>
