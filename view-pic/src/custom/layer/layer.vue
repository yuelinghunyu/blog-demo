<template>
  <div class="swiper-pic-container">
    <swiper
      ref="mySwiper"
      class="swiper-pic-swrapper"
      :options="swiperOptions"
      v-if="list.length"
    >
      <v-touch
        v-for="(file, index) in list"
        class="swiper-slide swiper-container_slide swiper-no-swiping"
        :key="file.id"
        v-bind:pan-options="{threshold: 0}"
        v-on:panstart="panstart"
        v-on:panmove="panmove"
        v-on:panend="panend"
      >
        <div
          class="touch-container"
          ref="touchContainer"
          ondragstart="return false"
        >
          <img
            v-if="file.file_path"
            class="file-item"
            :src="file.file_path"
            :id="file.id"
            alt="图片"
            @load="imgLoad($event, index)"
          >
        </div>
      </v-touch>
      <div
        class="swiper-pagination"
        slot="pagination"
      ></div>
    </swiper>
  </div>
</template>
<script>
import { Swiper, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
export default {
  data () {
    return {
      list: [],
      currentIndex: 0,
      initIndex: -1,
      swiperOptions: {
        pagination: {
          el: '.swiper-pagination'
        },
        initialSlide: 0
      },
      touchDomList: [],
      center: this.point2D(0, 0), // 初始中心点
      tMatrix: [1, 0, 0, 1, 0, 0], // 初始化缩放
      lastTranslate: this.point2D(0, 0), // 记录上次的偏移的值
      calcBorder: {}, // 记录移动超出边界
      duration: ""
    }
  },
  computed: {
    swiper () {
      return this.$refs.mySwiper.swiper
    }
  },
  components: {
    Swiper,
  },
  directives: {
    swiper: directive
  },
  mounted () {
    this.$nextTick(() => {
      const slideWidth = document.querySelector(".swiper-pic-container").offsetWidth
      const slideHeight = document.querySelector(".swiper-pic-container").offsetHeight
      // 初始化中心点
      this.center = this.point2D(slideWidth / 2, slideHeight / 2)
    })
  },
  methods: {
    imgLoad (ev, index) {
      const target = ev.target
      const targetWidth = target.offsetWidth
      const targetHeight = target.offsetHeight
      if (this.initIndex !== index) {
        this.$refs.touchContainer[index].style.width = targetWidth + 'px'
        this.$refs.touchContainer[index].style.height = targetHeight + 'px'
        this.initIndex = index
      }
      // 存储每页的touch-container
      if (!this.touchDomList || !this.touchDomList.length) {
        this.touchDomList = this.$refs.touchContainer
      }
    },
    panstart () {
      this.duration = ""
      this.lastTranslate = this.point2D(this.tMatrix[4], this.tMatrix[5]) //缓存上一次的偏移值
    },
    panmove (ev) {
      const deltaX = this.lastTranslate.x + ev.deltaX
      const deltaY = this.lastTranslate.y + ev.deltaY
      if (this.calcBorder.calcWidth > Math.abs(deltaX)) {
        this.tMatrix[4] = this.lastTranslate.x + ev.deltaX
      } else {
        this.tMatrix[4] = this.lastTranslate.x + ev.deltaX * 0.3
      }
      if (this.calcBorder.calcHeight > Math.abs(deltaY)) {
        this.tMatrix[5] = this.lastTranslate.y + ev.deltaY
      } else {
        this.tMatrix[5] = this.lastTranslate.y + ev.deltaY * 0.3
      }
      console.log(this.tMatrix)
      this.setScaleTouchContainer()
    },
    panend () {
      this.operateEnd()
    },
    point2D (x, y) {
      return { x: x, y: y }
    },
    setScaleTouchContainer () {
      if (this.touchDomList.length === 0) return
      this.touchDomList[this.currentIndex].style.transition = this.duration
      this.touchDomList[this.currentIndex].style.transform = `matrix(${this.tMatrix.join(",")})`
    },
    operateEnd () {
      this.duration = ".3s ease all"
      if (this.tMatrix[0] === 1) { //重置
        this.tMatrix = [1, 0, 0, 1, 0, 0]
        this.setScaleTouchContainer()
      } else {
        if (Math.abs(this.tMatrix[4]) > this.calcBorder.calcWidth) {
          this.tMatrix[4] = this.tMatrix[4] > 0 ? this.calcBorder.calcWidth : -this.calcBorder.calcWidth
        }
        if (Math.abs(this.tMatrix[5]) > this.calcBorder.calcHeight) {
          this.tMatrix[5] = this.tMatrix[5] > 0 ? this.calcBorder.calcHeight : -this.calcBorder.calcHeight
        }
        this.setScaleTouchContainer()
      }
    },
    reset () {
      this.scaleSize = 1// 最大2，每次+0.5
      this.tMatrix = [1, 0, 0, 1, 0, 0] // 初始化缩放
      this.lastTranslate = this.point2D(0, 0) // 记录上次的偏移的值
      this.calcBorder = {} // 记录移动超出边界
      this.duration = ""
    }
  },
  watch: {
    list: {
      handler () {
        console.log(this.currentIndex)
        this.swiperOptions.initialSlide = this.currentIndex || 0
      },
      deep: true,
    }
  }
}
</script>
<style scoped>
.swiper-pic-container {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  position: fixed;
  z-index: 1000;
  top: 0rem;
}
.swiper-pic-swrapper {
  width: 100%;
  height: 100%;
}
.swiper-slide {
  position: relative;
}
.swiper-pagination /deep/ .swiper-pagination-bullet {
  background: #fff;
}
.touch-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  border: 3px solid rgba(136, 142, 152, 0.25);
  box-sizing: border-box;
}
.touch-container > img {
  max-width: 100%;
  max-height: 100%;
}
</style>