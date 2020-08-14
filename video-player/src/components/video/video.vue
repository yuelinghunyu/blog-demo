<template>
  <div
    class="custom-video_container"
    ref="custom-video_container"
    @mouseover="handleControls($event, 'start')"
    @mouseleave="handleControls($event, 'end')"
  >
    <video
      class="custom-video_video"
      ref="custom-video"
      :poster="videoOption.poster"
    >
      <source :src="videoOption.src" type="video/mp4">
      <p>设备不支持</p>
    </video>
    <span
      v-if="videoState.play"
      class="custom-video_play custom-video_play-pause iconfont icon-zanting"
      @click="pause('btn')"
    >
    </span>
    <span
      v-else
      class="custom-video_play custom-video_play-play iconfont icon-bofang"
      @click="play('btn')"
    >
    </span>
    <!-- 控制区域背景 -->
    <transition
      name="fade"
    >
      <div
        class="custom-video_control"
        v-show="!videoState.hideControl || !videoState.play"
      >
        <!-- 进度条 -->
        <div
          class="custom-video_control-bg"
          @mousedown="handleProgressDown"
          @mousemove="handleProgressMove"
          @mouseup="handleProgressUp"
        >
          <div 
            class="custom-video_control-bg-outside"
            ref="custom-video_control-bg-outside"
          >
            <span 
              class="custom-video_control-bg-inside"
              ref="custom-video_control-bg-inside"
            ></span>
            <span 
              class="custom-video_control-bg-inside-point"
              ref="custom-video_control-bg-inside-point"
            ></span>
          </div>
        </div>
        <!-- 倍速播放 -->
        <div
          class="custom-video_control-speed"
        >
          <span
              class="custom-video_control-speed-play"
          >
            <svg t="1597394471431" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1207" width="48" height="48"><path d="M931.84 476.16l-435.2-312.32C468.48 148.48 435.2 143.36 435.2 204.8v135.68L189.44 163.84C161.28 148.48 125.44 148.48 128 204.8v614.4c0 51.2 35.84 58.88 61.44 43.52l245.76-176.64V819.2c0 51.2 35.84 58.88 61.44 40.96l435.2-312.32c17.92-12.8 17.92-58.88 0-71.68zM486.4 798.72v-215.04L179.2 798.72V225.28l307.2 215.04V225.28L896 512 486.4 798.72z" p-id="1208" fill="#ffffff"></path></svg>
          </span>
          <div
            class="custom-video_control-speed-bg">
            <span
              :class="{'custom-video_control-speed-bg-act': item.val === videoOption.speed}"
              v-for="item in speedList"
              :key="item.index"
              @click="handleSpeedProgressDown(item.val)"
            >
              {{item.label}}
            </span>
          </div>
        </div>
        <!-- 声音 -->
        <div
          class="custom-video_control-voice"
        >
          <span
            class="custom-video_control-voice-play iconfont icon-shengyin"
          ></span>
          <div
            class="custom-video_control-voice-bg"
            ref="custom-video_control-voice-bg"
            @mousedown="handleVolProgressDown"
            @mousemove="handleVolProgressMove"
            @mouseup="handleVolProgressUp"
          >
            <div 
              class="custom-video_control-voice-bg-outside"
              ref="custom-video_control-voice-bg-outside"
            >
              <span 
                class="custom-video_control-voice-bg-inside"
                ref="custom-video_control-voice-bg-inside"
              ></span>
              <span 
                class="custom-video_control-voice-bg-point"
                ref="custom-video_control-voice-bg-point"
              ></span>
            </div>
          </div>
        </div>
        <!-- 时间 -->
        <div
          class="custom-video_control-time"
        >
          <span>{{currentTime ? currentTime : "00:00"}}</span>
           / 
          <span>{{duration ? duration : "00:00"}}</span>
        </div>
        <!-- 全屏缩放 -->
        <span
          class="custom-video_control-full iconfont icon-quanping"
          @click="handleScreen"
        ></span>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  data() {
    return {
      videoOption: {
        src: require("../../static/media/taru.mp4"), //视频
        poster: require("../../static/images/poster.jpg"), // 初始化占位图片
        volume: 20,
        speed: 1.0
      },
      videoState: {
        play: false, //播放状态
        hideControl: false, // 控制栏状态
        distance: 0, // 移动的距离
        downState: false, // 鼠标点击进度条
        playState: false,
        leftInit: 0, // 当前进度初始偏移量
        screenState: false
      },
      voiceState: { // 同上
        distance: 0,
        downState: false,
        topInit: 0
      },
      speedList: [ // 倍速播放
        {
          val: 0.5,
          label: '0.5x'
        },
        {
          val: 1.0,
          label: '1.0x'
        },
        {
          val: 1.25,
          label: '1.25x'
        },
        {
          val: 1.5,
          label: '1.5x'
        },
        {
          val: 2.0,
          label: '2.0x'
        }
      ],
      videoDom: null, // video
      videoProOut: null, // 视频总进度条
      videoPro: null, // 视频进度条
      videoPoi: null, // 视频进度点
      duration: 0, // 视频总时长
      currentTime: 0, // 视频当前播放时长
      processWidth: 0, // 视频进度条总长度
      voiceProOut: null, // 音频总进度条
      voicePro: null, // 音频进度条
      voicePoi: null, // 音频进度点
      volProcessHeight: 0,
      fullScreenType: false
    }
  },
  created () {
    // 解决全屏时按ESC退出全屏时的BUG
    const that = this
    document.addEventListener("fullscreenchange", () => {
      that.fullScreenType = !that.fullScreenType
      if (that.fullScreenType !== that.videoState.screenState) {
        that.handleScreen()
      }
    });
    // 按空格键播放/暂停
    document.onkeydown = function(){
      const key = window.event.keyCode;
      if(key === 32){
        if (that.videoState.playState) {
          that.pause('btn')
        } else {
          that.play('btn')
        }
      }
    }
  },
  mounted() {
    // 初始化相关元数据
    this.videoDom = this.$refs["custom-video"]
    this.videoProOut = this.$refs['custom-video_control-bg-outside']
    this.videoPro = this.$refs['custom-video_control-bg-inside']
    this.videoPoi = this.$refs['custom-video_control-bg-inside-point']

    this.voiceProOut = this.$refs['custom-video_control-voice-bg-outside']
    this.voicePro = this.$refs['custom-video_control-voice-bg-inside']
    this.voicePoi = this.$refs['custom-video_control-voice-bg-point']

    this.processWidth = this.videoProOut.clientWidth
    this.videoState.leftInit = this.getOffset(this.videoProOut).left
    this.videoDom.volume = this.videoOption.volume / 100 // 设置初始化声音
    this.initMedaData()
  },
  methods: {
    initMedaData() { // 初始化video相关事件
      this.videoDom.addEventListener('loadedmetadata', () => { // 获取视频总时长
        this.duration = this.timeTranslate(this.videoDom.duration)
      })
      this.videoDom.addEventListener("click", () => { // 点击视频区域可以进行播放或者暂停
        if(this.videoDom.paused || this.videoDom.ended) {
            if(this.videoDom.ended) {
              this.videoDom.currentTime = 0
            }
            this.play('btn')
        } else {
          this.pause('btn')
        }
      })
      this.videoDom.addEventListener("timeupdate", () => { // 监听视频播放过程中的时间
        const percentage = 100 * this.videoDom.currentTime / this.videoDom.duration
        this.videoPro.style.width = percentage + '%'
        this.videoPoi.style.left = percentage - 1 + '%'
        this.currentTime = this.timeTranslate(this.videoDom.currentTime)
      })
      this.videoDom.addEventListener("ended", () => { // 监听结束播放事件
        this.videoPro.style.width = 0
        this.videoPoi.style.left = 0
        this.currentTime = 0
        this.videoState.play = false
        this.videoState.hideControl = false
      })
      this.videoDom.addEventListener("volumechange", () => {
        const percentage =  this.videoDom.volume * 100
        this.voicePro.style.height = percentage + '%'
        this.voicePoi.style.bottom = percentage + '%'
      })
    },
    play(flag) { // 播放按钮事件
      if(flag) this.videoState.playState = true
      this.videoState.play = true
      this.videoDom.play()
    },
    pause(flag) { // 暂停按钮事件
      if(flag) this.videoState.playState = false
      this.videoDom.pause()
      this.videoState.play = false
    },
    handleProgressDown(ev) { // 监听点击进度条事件，方便获取初始点击的位置
      // 视频暂停
      this.videoState.downState = true //按下鼠标标志
      this.pause()
      this.videoState.distance = ev.clientX - this.videoState.leftInit
    },
    handleProgressMove(ev) { // 监听移动进度条事件，同步播放相关事件
      if(!this.videoState.downState) return
      let disX = ev.clientX - this.videoState.leftInit
      if(disX > this.processWidth) {
        disX = this.processWidth
      }
      if(disX < 0) {
        disX = 0
      }
      this.videoState.distance = disX
      this.videoDom.currentTime = this.videoState.distance / this.processWidth * this.videoDom.duration
    },
    handleProgressUp() { //松开鼠标，播放当前进度条视频
      this.videoState.downState = false
      // 视频播放
      this.videoDom.currentTime = this.videoState.distance / this.processWidth * this.videoDom.duration
      this.currentTime = this.timeTranslate(this.videoDom.currentTime)
      if(this.videoState.playState) {
        this.play()
      }
    },
    handleSpeedProgressDown(speed) { // 倍速播放
      this.videoOption.speed = speed
      this.videoDom.playbackRate = speed
    },
    handleVolProgressDown(ev) { // 监听声音点击事件
      this.voiceState.topInit = this.getOffset(this.voiceProOut).top
      this.volProcessHeight = this.voiceProOut.clientHeight
      this.voiceState.downState = true //按下鼠标标志
      this.voiceState.distance = ev.clientY - this.voiceState.topInit
    },
    handleVolProgressMove(ev) { // 监听声音进度条移动事件
      if(!this.voiceState.downState) return
      let disY = this.voiceState.topInit + this.volProcessHeight - ev.clientY
      if(disY > this.volProcessHeight - 2) {
        disY = this.volProcessHeight - 2
      }
      if(disY < 0) {
        disY = 0
      }
      this.voiceState.distance = disY
      this.videoDom.volume = this.voiceState.distance / this.volProcessHeight
      this.videoOption.volume = Math.round(this.videoDom.volume * 100)
    },
    handleVolProgressUp() { // 监听声音鼠标离开事件
      this.voiceState.downState = false //按下鼠标标志
      this.videoDom.volume = this.voiceState.distance / this.volProcessHeight
      this.videoOption.volume = Math.round(this.videoDom.volume * 100)
    },
    handleControls(ev, flag) { // 监听离开或者进入视频区域隐藏或者展示控制栏
      switch (flag) {
        case 'start':
          this.videoState.hideControl = false
          break;
        case 'end':
          this.videoState.hideControl = true
          break;
        default:
          break;
      }
    },
    handleScreen() { // 全屏操作
      this.videoState.screenState = !this.videoState.screenState
      if(this.videoState.screenState) {
        this.fullScreen()
      } else {
        this.exitFullscreen()
      }
    },
    timeTranslate(t) { // 时间转化
      let m = Math.floor(t / 60)
      m < 10 && (m = '0' + m)
      return m + ":" + (t % 60 / 100 ).toFixed(2).slice(-2)
    },
    getOffset(node, offset) { // 获取当前屏幕下进度条的左偏移量和又偏移量
      if(!offset) {
        offset = {}
        offset.left = 0
        offset.top = 0
      }
      if(node === document.body || node === null) {
        return offset
      }
      offset.top += node.offsetTop
      offset.left += node.offsetLeft
      return this.getOffset(node.offsetParent, offset)
    },
    fullScreen() {
      let ele = document.documentElement
      if (ele .requestFullscreen) {
        ele .requestFullscreen()
      } else if (ele .mozRequestFullScreen) {
        ele .mozRequestFullScreen()
      } else if (ele .webkitRequestFullScreen) {
        ele .webkitRequestFullScreen()
      }
      this.$refs['custom-video_container'].style.width = "100%"
      this.$refs['custom-video_container'].style.height = "100%"
    },
    exitFullscreen() {
      let de = document
      if (de.cancelFullScrren) {
        de.cancelFullScrren();
      } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
      } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
      }
      this.$refs['custom-video_container'].style.width = "500px"
      this.$refs['custom-video_container'].style.height = "300px"
    }
  }
}
</script>
<style scoped>
/* 总容器 */
.custom-video_container{
  width: 500px;
  height: 300px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
/* 视频标签 */
.custom-video_video{
  width: 100%;
  height: 100%;
  object-fit: fill;
}
/* 暂停 或者 播放 */
.custom-video_play{
  display: inline-block;
  position: absolute;
  right: 50px;
  bottom: 50px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 30px;
  color: cornflowerblue;
}
/* 暂停隐藏 */
.custom-video_play-pause{
  display: none;
}
/* hover 显示 */
.custom-video_container:hover > .custom-video_play-pause{
  display: inline-block;
}
/* hover 播放按钮动画 */
.custom-video_play:hover{
  box-shadow: 0 0 10px #5A4180;
  transition: all 0.4s;
}
/* 控制栏 */
.custom-video_control{
  position: absolute;
  width: 100%;
  height: 50px;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, .55);
  display: flex;
  flex-direction: row;
  align-items: center;
}
/* 控制栏进度条 */
.custom-video_control-bg{
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
}
/* 控制栏进度条 —— 总长度 */
.custom-video_control-bg-outside{
  width: 100%;
  height: 5px;
  border-radius: 2.5px;
  background-color: #aaa;
  position: relative;
  cursor: pointer;
}
/* 控制栏进度条 —— 播放长度 */
.custom-video_control-bg-inside{
  position: absolute;
  display: inline-block;
  width: 0;
  height: 100%;
  border-radius: 2.5px;
  left: 0;
  top: 0;
  background-color: #fff;
  transition: all 0.2s;
}
/* 控制栏进度条 —— 播放点 */
.custom-video_control-bg-inside-point{
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: -2.5px;
  left: -1%;
  transition: all 0.2s;
}
/* 控制栏 —— 声音、倍速播放、时间、全屏缩放 */
.custom-video_control-voice,
.custom-video_control-speed,
.custom-video_control-time,
.custom-video_control-full{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: #fff;
  position: relative;
}
.custom-video_control-voice:hover > .custom-video_control-voice-bg,
.custom-video_control-speed:hover > .custom-video_control-speed-bg{
  display: block;
}
.custom-video_control-voice-play, .custom-video_control-speed-play{
  z-index: 10;
}
.custom-video_control-voice, .custom-video_control-speed {
  height: 50px!important;
  cursor: pointer;
}
.custom-video_control-speed-play {
  line-height: 20px;
}
.custom-video_control-speed-play svg {
  width: 20px;
  height: 16px;
  vertical-align: text-bottom;
}
.custom-video_control-voice-bg{
  display: none;
  position: absolute;
  width: 30px;
  height: 100px;
  background-color: rgba(0, 0, 0, .55);
  left: 0;
  bottom: 50px;
  border-radius: 15px;
}
.custom-video_control-speed-bg {
  display: none;
  position: absolute;
  width: 50px;
  font-size: 14px;
  background-color: rgba(0, 0, 0, .55);
  left: 50%;
  bottom: 50px;
  border-radius: 5px;
  transform: translate(-50%, 0);
  overflow: hidden;
}
.custom-video_control-speed-bg span {
  width: 100%;
  text-align: center;
  padding: 5px 0;
  display: inline-block;
  cursor: pointer;
}
.custom-video_control-speed-bg span:hover {
  background-color: #4AB7BD;
}
.custom-video_control-speed-bg-act {
  background-color: #4AB7BD!important;
}
.custom-video_control-voice-bg-outside{
  width: 5px;
  height: 70px;
  border-radius: 2.5px;
  background-color: #aaa;
  position: absolute;
  left: 50%;
  transform: translate3d(-50%, 10%, 0);
  cursor: pointer;
}
.custom-video_control-voice-bg-inside{
  display: inline-block;
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  border-radius: 2.5px;
  background-color: #fff;
  height: 0;
}
.custom-video_control-voice-bg-point{
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  left: -2.5px;
  bottom: -1px;
}
.custom-video_control-time{
  font-size: 12px;
}
.custom-video_control-full{
  font-size: 14px;
}
.custom-video_control-voice,
.custom-video_control-full{
  width: 30px;
  height: 30px;
  cursor: pointer;
}
/* 控制栏隐藏动画 */
.fade-enter-active {
  transition: all .3s ease;
}
.fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.fade-enter, .fade-leave-to {
  transform: translateY(50px);
  opacity: 0;
}
</style>