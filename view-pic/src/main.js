import Vue from 'vue'
import App from './App.vue'
import router from "./router"
import "mso-flex/mso-flex.js"
import VueTouch from "vue-touch"
import Layer from './custom/layer'
import "./static/reset.css"

Vue.config.productionTip = false
Vue.use(VueTouch, { name: 'v-touch' })
Vue.use(Layer)
new Vue({
  render: h => h(App),
  router
}).$mount('#app')
