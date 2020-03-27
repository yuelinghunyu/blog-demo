<template>
  <div class="swiper-pic-container">
    <span
      class="close-btn"
      @click="handleClose"
    >×</span>
    <swiper
      ref="mySwiper"
      class="swiper-pic-swrapper"
      :options="swiperOptions"
      @slideChangeTransitionStart="slideChange"
      v-if="list.length"
    >
      <v-touch
        v-for="(file, index) in list"
        class="swiper-slide swiper-container_slide"
        :class="{
          'swiper-no-swiping': swiperDisable
        }"
        :key="file.id"
        v-bind:pan-options="{threshold: 0}"
        v-on:panstart="panstart"
        v-on:panmove="panmove"
        v-on:panend="panend"
        v-on:pinchstart="pinchstart"
        v-on:pinchmove="pinchmove"
        v-on:pinchend="pinchend"
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
        initialSlide: 0,
      },
      touchDomList: [],
      center: this.point2D(0, 0), // 初始中心点
      poscenter: this.point2D(0, 0),
      lastcenter: this.point2D(0, 0),
      tMatrix: [1, 0, 0, 1, 0, 0], // 初始化缩放
      lastTranslate: this.point2D(0, 0), // 记录上次的偏移的值
      calcBorder: {}, // 记录移动超出边界
      duration: "",
      scaleSize: 1,
      swiperDisable: true
    }
  },
  computed: {
    swiper () {
      return this.$refs.mySwiper.$swiper
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
      const container = document.querySelector(".swiper-pic-container")
      const slideWidth = container && container.offsetWidth
      const slideHeight = container && container.offsetHeight
      // 初始化中心点
      this.center = this.point2D(slideWidth / 2, slideHeight / 2)
    })
  },
  methods: {
    slideChange () {
      console.log("切换")
      this.reset()
      // this.moveEnd()
      if (this.swiper) {
        this.currentIndex = this.swiper.activeIndex
      } else {
        this.currentIndex = this.initialSlide
      }
    },
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
      // console.log(this.tMatrix)
      // console.log("calcWidth:" + this.calcBorder.calcWidth)
      // console.log("calcHeight:" + this.calcBorder.calcHeight)
      this.calcBorder = this.getBorderSize()
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
      this.setScaleTouchContainer()
    },
    panend () {
      this.moveEnd()
    },
    pinchstart (ev) {
      this.scaleSize = this.tMatrix[0]
      this.lastTranslate = this.point2D(this.tMatrix[4], this.tMatrix[5])
      this.lastcenter = this.point2D(this.center.x + this.lastTranslate.x, this.center.y + this.lastTranslate.y)
      this.poscenter = this.point2D(ev.center.x - this.lastcenter.x, ev.center.y - this.lastcenter.y)
    },
    pinchmove (ev) {
      this.tMatrix[0] = this.tMatrix[3] = this.scaleSize * ev.scale
      this.tMatrix[4] = (1 - ev.scale) * this.poscenter.x + this.lastTranslate.x
      this.tMatrix[5] = (1 - ev.scale) * this.poscenter.y + this.lastTranslate.y
      this.duration = ""
      // 计算边界，优化移动范围
      this.calcBorder = this.getBorderSize()
      this.setScaleTouchContainer()
    },
    pinchend () {
      this.moveEnd()
    },
    point2D (x, y) {
      return { x: x, y: y }
    },
    setScaleTouchContainer () {
      if (this.touchDomList.length === 0) return
      this.touchDomList[this.currentIndex].style.transition = this.duration
      this.touchDomList[this.currentIndex].style.transform = `matrix(${this.tMatrix.join(",")})`
    },
    moveEnd () {
      this.duration = ".3s ease all"
      if (this.tMatrix[0] <= 1) { //重置
        this.tMatrix = [1, 0, 0, 1, 0, 0]
        this.calcBorder = this.getBorderSize()
        this.setScaleTouchContainer()
      } else {
        this.tMatrix[0] = this.tMatrix[3] = this.tMatrix[0] <= 3 ? this.tMatrix[0] : 3
        this.calcBorder = this.getBorderSize()
        if (Math.abs(this.tMatrix[4]) > this.calcBorder.calcWidth) {
          this.tMatrix[4] = this.tMatrix[4] > 0 ? this.calcBorder.calcWidth : -this.calcBorder.calcWidth
        }
        if (Math.abs(this.tMatrix[5]) > this.calcBorder.calcHeight) {
          this.tMatrix[5] = this.tMatrix[5] > 0 ? this.calcBorder.calcHeight : -this.calcBorder.calcHeight
        }
        console.log(this.tMatrix)
        console.log("calcWidth:" + this.calcBorder.calcWidth)
        this.setScaleTouchContainer()
      }
    },
    reset () {
      this.scaleSize = 1
      this.tMatrix = [1, 0, 0, 1, 0, 0] // 初始化缩放
      this.center = this.point2D(0, 0) // 初始中心点
      this.lastTranslate = this.point2D(0, 0) // 记录上次的偏移的值
      this.poscenter = this.point2D(0, 0) // 手指中心点
      this.calcBorder = {} // 记录移动超出边界
      this.duration = ""
      this.swiperDisable = false
    },
    getBorderSize () {
      const scaleWidth = this.touchDomList[this.currentIndex].offsetWidth * this.tMatrix[0] / 2
      const scaleHeight = this.touchDomList[this.currentIndex].offsetHeight * this.tMatrix[0] / 2
      // console.log("scaleSize:" + this.scaleSize)
      // console.log("scaleWidth:" + scaleWidth)
      // console.log("center:" + this.center.x)
      const calcWidth = scaleWidth - this.center.x > 0 ? scaleWidth - this.center.x : 0
      const calcHeight = scaleHeight - this.center.y > 0 ? scaleHeight - this.center.y : 0
      // console.log("calcWidth:" + calcWidth)
      return { calcWidth, calcHeight }
    },
    handleClose () {
      this.$layer.hide()
    }
  },
  watch: {
    list: {
      handler () {
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
.close-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1rem;
  height: 1rem;
  color: #fff;
  font-size: 0.8rem;
  position: absolute;
  z-index: 2000;
  right: 0;
  top: 0;
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