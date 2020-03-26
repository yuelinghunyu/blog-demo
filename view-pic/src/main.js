import Vue from 'vue'
import App from './App.vue'
import router from "./router"
import "mso-flex/mso-flex.js"
// import FastClick from "fastclick"
import "./static/reset.css"

Vue.config.productionTip = false
// FastClick.attach(document.body)
new Vue({
  render: h => h(App),
  router
}).$mount('#app')
