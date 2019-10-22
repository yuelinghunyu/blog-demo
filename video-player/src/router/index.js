import Vue from "vue"
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const Video = () => import("../components/video/video")

const routes = [
  {
    path: "/", redirect: "/video"
  },
  {
    path: "/video", component: Video
  }
]

const router = new VueRouter({ routes })

export default router