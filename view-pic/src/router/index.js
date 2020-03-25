import Vue from "vue"
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const View = () => import("../page/view")

const routes = [
  {
    path: "/",
    redirect: "/view"
  },
  {
    path: "/view",
    component: View
  }
]
const router = new VueRouter({ routes })

export default router