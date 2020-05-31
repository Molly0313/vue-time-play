import Vue from 'vue'
import App from './App.vue'
import vueTimePlay from './lib/index.js'
Vue.use(vueTimePlay)
// import vueTimePlay from 'vue-time-play1'
// Vue.use(vueTimePlay);
new Vue({
  el: '#app',
  render: h => h(App)
})
