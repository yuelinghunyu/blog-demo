import Vue from 'vue'
import App from './App.vue'
import "./assets/reset.css"
// 加载scroll指令
import VIscroll from './directive/vIscroll'
Vue.use(VIscroll)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
