工作中用到video标签做视频播放器，一开始用 video.js 插件代替，如果只用这个插件进行简单的播放视频，是不是有点浪费，而且这个插件用 webpack 打包后 vendor.js 会很大，所以本文实现一个基于HTML5标签video的自定义视频播放器。其中实现了播放暂停、进度拖拽、音量控制及全屏等功能
### 一、效果预览  

![](https://user-gold-cdn.xitu.io/2019/10/23/16df636daef1377d?w=628&h=375&f=gif&s=4106556)

### 二、逻辑简介  
1. dom元素和css样式编写；
2. 简单的播放和暂停；
3. 时间进度显示；
4. 控制栏视频进度条拖拽；
5. 声音进度条控制；
6. 全屏和退出全屏基础实现。
7. video自带属性和方法

    | 属性或者方法 | 解释 |
    | :------| :------ |
    | currentTime | 当前视频播放的时间，单位是s |
    | duration | 当前视频播放总时长，单位是s |
    | volume | 声音，最大值为1 |
    | paused | 暂停状态 |
    | ended | 结束状态 |
    | play() | 播放视频 |
    | pause() | 暂停视频播放 |
    | loadedmetadata() | 视频加载获取数据，这里获取duration |
    | timeupdate() | 视频变化事件，这里获取实时的currentTime |
    | ended() | 视频播放结束事件 |
    | volumechange() | 视频声音事件 |

### 三、步骤实现  
#### 1、静态页面编写  
本实例采用vue脚手架，具体dom元素实现如下，并添加相关注释：  
```
<div class="custom-video_container">
    <!--video-->
    <video 
        class="custom-video_video"
        ref="custom-video"
    >
      <source type="video/mp4">
      <p>设备不支持</p>
    </video>
    <!--播放或者暂停按钮-->
    <span class="custom-video_play custom-video_play-pause iconfont icon-zanting"></span>
    <!-- 控制区域背景 -->
    <div class="custom-video_control">
        <!-- 视频进度条 -->
        <div class="custom-video_control-bg">
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
        <!-- 声音 -->
        <div class="custom-video_control-voice">
          <span class="custom-video_control-voice-play iconfont icon-shengyin"></span>
          <div class="custom-video_control-voice-bg">
            <div class="custom-video_control-voice-bg-outside">
              <span class="custom-video_control-voice-bg-inside"></span>
              <span class="custom-video_control-voice-bg-point"></span>
            </div>
          </div>
        </div>
        <!-- 时间 -->
        <div class="custom-video_control-time">
          <span>"00:00"</span>/<span>"00:00"</span>
        </div>
        <!-- 全屏缩放 -->
        <span class="custom-video_control-full iconfont icon-quanping"></span>
    </div>
  </div>
```  
与之对应css和完整的代码会附加在文章的结尾。后面相关逻辑会依据上面的dom结构进行事件绑定和拓展。  
#### 2、播放和暂停
播放或者暂停有两种场景，第一种通过点击“播放”或者“暂停”按钮控制播放或者暂停；第二种是点击视频区域控制播放或者暂停。  
第一种实现通过点击“播放”按钮，此按钮的样式变成“暂停”，所以修改上面注释区域**播放或者暂停按钮**元素  
```
     <!--播放或者暂停按钮-->
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
```
并且对应的js如下：
```
data() {
    return {
      videoState: {
        play: false, //播放状态
        playState: false, // 记录播放状态
      },
      videoDom: null, // video
    }
},
mounted() {
    // 初始化相关元数据
    this.videoDom = this.$refs["custom-video"]
},
methods: {
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
}
```
点击“播放”按钮调用play()方法，videoState.play值变化引起按钮样式变成“暂停”，并调用video标签自带的播放方法，反之就是“暂停”。  
第二种点击屏幕播放或者暂停是通过监听video click事件，代码如下：
```
mounted() {
    // 初始化相关元数据
    this.videoDom = this.$refs["custom-video"]
    this.initMedaData()
},
methods: {
    initMedaData() { // 初始化video相关事件
      this.videoDom.addEventListener("click", () => { // 点击视频区域可以进行播放或者暂停
        if(this.videoDom.paused || this.videoDom.ended) {
            if(this.videoDom.ended) {
              this.videoDom.currentTime = 0
            }
            this.play('btn') //调用下面play的方法
        } else {
          this.pause('btn') //调用下面pause的方法
        }
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
}
```  
#### 3、时间显示
时间就是图片右下角<b>“00:00 / 00:29”</b>，它是当前的播放时间比上视频总时长，video自带属性currentTime和duration，这两个字段获取的值单位都是s，所以要进行格式转换，先修改对应的dom结构：
```
<!-- 时间 -->
<div class="custom-video_control-time">
  <span>{{currentTime ? currentTime : "00:00"}}</span>
   / 
  <span>{{duration ? duration : "00:00"}}</span>
</div>
```
相关js代码如下：
```
data() {
    return {
      duration: 0, // 视频总时长
      currentTime: 0, // 视频当前播放时长
    }
},
mounted() {
    // 初始化相关元数据
    this.videoDom = this.$refs["custom-video"]
    this.initMedaData()
},
methods: {
    initMedaData() { // 初始化video相关事件
      this.videoDom.addEventListener('loadedmetadata', () => { // 获取视频总时长
        this.duration = this.timeTranslate(this.videoDom.duration)
      })
    },
    this.videoDom.addEventListener("timeupdate", () => { // 监听视频播放过程中的时间
        this.currentTime = this.timeTranslate(this.videoDom.currentTime)
    }),
    timeTranslate(t) { // 时间转化
      let m = Math.floor(t / 60)
      m < 10 && (m = '0' + m)
      return m + ":" + (t % 60 / 100 ).toFixed(2).slice(-2)
    },
}
```  
#### 4、播放进度显示
1. 播放进度随着播放慢慢边长，播放进度条由三部分组成： 

![](https://user-gold-cdn.xitu.io/2019/10/23/16df67a4a82bf27f?w=673&h=120&f=png&s=59696)
video自带的timeupdate的方法会实时的监听播放状态，通过实时的获取currentTime和duration的比值，这个比例值就是图中inside占整个outside的比重。代码如下：
```
data() {
    return {
      videoDom: null, // video
      videoProOut: null, // 视频总进度条
      videoPro: null, // 视频进度条
      videoPoi: null, // 视频进度点
    }
},
mounted() {
    // 初始化相关元数据
    this.videoDom = this.$refs["custom-video"]
    this.videoProOut = this.$refs['custom-video_control-bg-outside']
    this.videoPro = this.$refs['custom-video_control-bg-inside']
    this.videoPoi = this.$refs['custom-video_control-bg-inside-point']
    this.initMedaData()
},
methods: {
    initMedaData() { // 初始化video相关事件
      this.videoDom.addEventListener('loadedmetadata', () => { // 获取视频总时长
        this.duration = this.timeTranslate(this.videoDom.duration)
      })
    },
    this.videoDom.addEventListener("timeupdate", () => { // 监听视频播放过程中的时间
        const percentage = 100 * this.videoDom.currentTime / this.videoDom.duration
        this.videoPro.style.width = percentage + '%'
        this.videoPoi.style.left = percentage - 1 + '%'
    })
}
```  
2. 播放进度可以点击、拖动，这两步操作会用到mousedown、mousemove、mouseup事件，对应三个方法handlePrograssDown、handlePrograssMove、handlePrograssUp，这三个方法挂载到dom节点如下：
```
<!-- 进度条 -->
<div
  class="custom-video_control-bg"
  @mousedown="handlePrograssDown"
  @mousemove="handlePrograssMove"
  @mouseup="handlePrograssUp"
>
  <!--此处省略视频进度条dom结构-->
</div>
``` 
拖拽或者点击进度条首先计算进度条的起点水平距离，所以需要计算该点的偏移量，封装偏移量getOffset方法如下（ps：貌似是zepto源码片段），
```
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
```
点击逻辑如下：
```
handlePrograssDown(ev) { // 监听点击进度条事件，方便获取初始点击的位置
  // 视频暂停
  this.videoState.downState = true //按下鼠标标志
  this.pause() // 视频暂时停止
  this.videoState.distance = ev.clientX - this.videoState.leftInit //记录点击的离起点的距离
  这里的leftInit就是通过getOffset方法获取的进度条起点偏移量
},
```
松开鼠标，通过记录的距离算出当前的currentTime，然后从此点进行视频播放或者暂停，逻辑如下：
```
handlePrograssUp() { //松开鼠标，播放当前进度条视频
  this.videoState.downState = false
  // 计算点击此处的currentTime
  this.videoDom.currentTime = this.videoState.distance / this.processWidth * this.videoDom.duration
  // 页面回显的currentTime数据
  this.currentTime = this.timeTranslate(this.videoDom.currentTime)
  // 这个是判断当前视频是在播放状态进行点击还是在暂停状态进行点击的
  if(this.videoState.playState) {
    this.play()
  }
},
```
上面的this.videoState.playState这个状态是通过按钮或者视频区域点击进行判定的，具体在上面play(flag)和pause(flag)方法中。

3. 拖拽方法如下：
```
handlePrograssMove(ev) { // 监听移动进度条事件，同步播放相关事件
  if(!this.videoState.downState) return //如果没有通过鼠标点击起点，则直接不进行下面计算
  let disX = ev.clientX - this.videoState.leftInit
  // 进行边界判断
  if(disX > this.processWidth) {
    disX = this.processWidth
  }
  if(disX < 0) {
    disX = 0
  }
  this.videoState.distance = disX
  // 计算当前的currentTime
  this.videoDom.currentTime = this.videoState.distance / this.processWidth * this.videoDom.duration
},
```
播放的进度条重点是通过点击或者拖动的位置计算当前的视频的时间点，将此值赋予video标签，这里就是
>this.videoDom.currentTime = 表达式  

这样timeupdate方法会被触发：
```
this.videoDom.addEventListener("timeupdate", () => { // 监听视频播放过程中的时间
const percentage = 100 * this.videoDom.currentTime / this.videoDom.duration
<!--inside进度条长度-->
this.videoPro.style.width = percentage + '%'
<!--point移动变化-->
this.videoPoi.style.left = percentage - 1 + '%'
this.currentTime = this.timeTranslate(this.videoDom.currentTime)
})
```
#### 5、声音控制
声音与视频的进度条是类似的，只不过声音的进度条是计算竖直方向的，声音相关属性volume，值的范围 0 ~ 1，监听声音的方法是volumechange。声音的样式图片样式如下：

![](https://user-gold-cdn.xitu.io/2019/10/23/16df6a0750f3ab13?w=104&h=193&f=png&s=18415)
相关方法如下：
```
// 监听声音的方法，通过此方法进行进度条渲染
this.videoDom.addEventListener("volumechange", () => {
    const percentage =  this.videoDom.volume * 100
    this.voicePro.style.height = percentage + '%'
    this.voicePoi.style.bottom = percentage + '%'
})

// 声音控制的三个方法
handleVolPrograssDown(ev) { // 监听声音点击事件
  this.voiceState.topInit = this.getOffset(this.voiceProOut).top
  this.volProcessHeight = this.voiceProOut.clientHeight
  this.voiceState.downState = true //按下鼠标标志
  this.voiceState.distance = ev.clientY - this.voiceState.topInit
},
handleVolPrograssMove(ev) { // 监听声音进度条移动事件
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
handleVolPrograssUp() { // 监听声音鼠标离开事件
  this.voiceState.downState = false //按下鼠标标志
  this.videoDom.volume = this.voiceState.distance / this.volProcessHeight
  this.videoOption.volume = Math.round(this.videoDom.volume * 100)
},
```
#### 6、全屏和退出全屏控制  
全屏方法，这里面进行了兼容处理:
```
fullScreen() {
  let ele = document.documentElement
  if (ele .requestFullscreen) {
    ele .requestFullscreen()
  } else if (ele .mozRequestFullScreen) {
    ele .mozRequestFullScreen()
  } else if (ele .webkitRequestFullScreen) {
    ele .webkitRequestFullScreen()
  }
  // 对应的video标签大小100%
  this.$refs['custom-video_container'].style.width = "100%"
  this.$refs['custom-video_container'].style.height = "100%"
},
```
退出全屏方法：
```
exitFullscreen() {
  let de = document
  if (de.exitFullscreen) {
    de.exitFullscreen();
  } else if (de.mozCancelFullScreen) {
    de.mozCancelFullScreen();
  } else if (de.webkitCancelFullScreen) {
    de.webkitCancelFullScreen();
  }
  // 返回初始化值
  this.$refs['custom-video_container'].style.width = "500px"
  this.$refs['custom-video_container'].style.height = "300px"
}
```
<b>注意：这里进度条和退出全屏事件都没有对键盘对应健进行处理，只是单纯的鼠标点击事件</b>  
#### 7、控制栏隐藏和展示   
控制栏在暂停的时候显示，在播放的时候，只要鼠标在视频播放器中，也会显示，离开后几秒后消失，这里用到vue过渡动画：
```
 <transition>
    name="fade"
 >
    <div
        class="custom-video_control"
        v-show="!videoState.hideControl || !videoState.play"
    >
    <!--控制栏dom元素-->
    </div>
 </transition>
```
对应的css文件
```
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
```
控制栏的消失或者展示是通过绑定最外层dom元素的mouseover、mouseleave事件进行逻辑控制，
这里用mouseleave，而不是用mouseout，如果使用mouseout事件，在经过控制栏时会出现闪烁。具体事件源码如下：
```
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
```
通过控制this.videoState.hideControl状态显示隐藏活隐藏控制栏。
### 四、源码
源码地址：[vue-player](https://github.com/yuelinghunyu/blog-demo/tree/master/video-player)
