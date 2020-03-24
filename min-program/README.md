### 前言
---  
前段时间一直查阅关于前端划一条直线的实现方案，网上给的答案大概归于两种：  
* 根据区域中两个坐标点，在其之间由点的集合形成直线
* 第二种由svg代替点的集合    

前端还有许多插件可以实现连线，比如 [jsplumb 中文教程](https://wdd.js.org/jsplumb-chinese-tutorial/#/) ；今天还是手动实现下类似于上面两种方案的连线，实现的场景微信小程序。  

### 规划  
---  
首先你会小程序，回想一下这几年一直都在叠加业务代码，不免有种后背发凉的感觉：“**<font color='#8468bd'>小程序不会！！！</font>**”，所以巴拉巴拉的看了下小程序官方文档，把能用到的地方都重点看了下，下面开干。  

#### 1、设计场景

根据本人从事教育行业遇到的试题操作 —— **<font color='#8468bd'>连线题</font>**，如图所示场景实现的效果图，在本文的结尾会有小程序二维码奉上  

![](https://user-gold-cdn.xitu.io/2020/3/20/170f5ea267617a58?w=1481&h=749&f=gif&s=234637)
**<center><font color='#8468bd' size="2">古诗词连线示例图</font></center>** 

#### 2、方案设计
根据图例在小程序中实现左边诗句和右边诗句的连线，具体实现方案如下：  
1. 整个实例分成首页和线条组件两部分，线条的信息通过数组保存起来
2. 线条组件本质是一个div标签在实时的变化长度和角度
3. 线条组件接收起始点坐标，利用三角函数算出角度和div的长度，实时改变其位置

### 实现
---  
下面开始一步步实现前端代码，这里面为了方便小伙伴们节省精力，以下的代码都是主要架构业务逻辑，具体实现结尾会附上源码。  

首先**主页**和**线条组件**关系如图所示：

![](https://user-gold-cdn.xitu.io/2020/3/23/171075f94d68b537?w=500&h=250&f=png&s=22761)
**<center><font color='#8468bd' size="2">古诗词连线组件图</font></center>** 

#### 1、线条组件  
线条组件代码量不多，下面粘贴的代码都附加注释，方便阅读
```
Component({
  properties: {
    // 这里定义了line组件属性，属性值可以在组件使用时指定
    startX: {
      type: Number,
      value: 0,
    },
    startY: {
      type: Number,
      value: 0,
    },
    endX: {
      type: Number,
      value: 0,
    },
    endY: {
      type: Number,
      value: 0,
    }
  },
  // 实时监听从主页传来的坐标，相当于vue中watch
  observers: {
    'startX, startY, endX, endY': function (startX, startY, endX, endY) {
      // 计算线条角度和长度
      let { angle, line } = this.getAngle(startX, startY, endX, endY)
      this.setData({
        angle: angle,
        line: line
      })
      // 这里必须在组件都加载成功后调用此方法，不然主页绑定不了子组件的事件
      if (this.data.ready) this.initStartPostion()
    }
  },
  data: {
    angle: 0,
    line: 0,
    ready: false
  },
  lifetimes: {
    // 这是小程序的生命周期
    ready: function () { // 初始节点完成初始调用
      this.setData({
        ready: true
      })
      // 这里是小程序的主动发射事件，相当于vue emit发射事件，初始化调用一次，然后在observers变化时调用
      this.initStartPostion()
    }
  },
  methods: {
    // 算角度
    getAngle: function (startX, startY, endX, endY) {
      let angle = 0
      let line = 0
      angle = this.getTanDeg(startX, endX, startY, endY)
      console.log("angle:" + angle)
      line = Math.round(Math.sqrt(Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2)))
      return { angle, line }
    },
    // 三角函数算角度
    getTanDeg: function (startX, endX, startY, endY) {
      let disY = endY - startY
      let disX = endX - startX
      let result = Math.atan2(disY, disX) * (180 / Math.PI)
      return Math.round(result)
    },
    // 向主页发射方法，用于主页实时渲染
    initStartPostion: function () {
      this.triggerEvent("calcPostionLine", { angle: this.data.angle, line: this.data.line })
    }
  },
})
```  
上面的 triggerEvent 绑定的事件calcPostionLine 用于主页接收事件：
```
<!-- index.wxml -->
<view class="container">
  ......
    <custom-line 
    wx:if="{{positionList.length}}" 
    wx:for="{{positionList}}" 
    wx:key="index" 
    class="custom-line" 
    startX="{{item.startX}}" 
    startY="{{item.startY}}" 
    endX="{{item.endX}}" 
    endY="{{item.endY}}" 
    style="left:{{item.startX + 'px'}}; 
    top:{{item.startY + 'px'}}; 
    width:{{ item.width+ 'px'}}; 
    transform: {{'rotate('+ item.rotate +'deg)'}};"
    bind:calcPostionLine="onCalcPostionLine">
    </custom-line>
    ......
</view>
```
#### 2、主页
主页主要是初始化渲染左右诗词，获取诗词的起点和终点，然后绑定touchstart、touchmove、touchend事件，根据这些事件更新子组件line的props值，经此循环，实现动态的划线

* ##### 获取诗词的起始坐标  
  ```
  // 页面生命周期初始化
  onLoad: function () {
    ......
    this.initPosition()
    this.initBorders()
    ......
  },
  // 获取题面左右黑点的中心点坐标
  initPosition: function () {
    const query = wx.createSelectorQuery()
    query.select("#content").boundingClientRect(function (res) {
      .......
    })
    query.selectAll(".left-item-icon").boundingClientRect(function (nodeList) {
      nodeList.forEach(function (node, index) {
        ......
      })
    })
    query.selectAll(".right-item-icon").boundingClientRect(function (nodeList) {
      nodeList.forEach(function (node, index) {
        ......
      })
    })
    query.select(".right-item-icon").boundingClientRect(function (res) {
      ......
    })
    query.exec()
  },
  // 获取坐标允许的经过的边界
  initBorders: function () {
    const query = wx.createSelectorQuery()
    query.select(".left").boundingClientRect(function (res) {
      ......
    })
    query.select(".right").boundingClientRect(function (res) {
      ......
    })
    query.select(".left-item").boundingClientRect(function (res) {
      ......
    })
    query.exec()
  },
  ```  
  上面是小程序获取页面节点的方式，小程序没有dom的概念，这些方法可以获取相应节点的偏移值、尺寸等属性值
* ##### 根据手势获取拖动坐标  
页面的线条是通过维护数组positionList字段，下面的手势就是更新数组对应的线条的起始点坐标
```
lineStart: function (e) {
    console.log("连线开始", e)
    this.setData({
      startFlag: true
    })
    const id = e.currentTarget.dataset.id
    console.log(this.data.leftList)
    const currentItem = this.data.leftList.find(function (leftItem) {
      return leftItem.id === id
    })
    const existPositionIndex = this.data.positionList.findIndex(function (postion) {
      return postion.id === id
    })
    let originList = this.data.positionList
    <!--初始化线条的起点坐标-->
    if (existPositionIndex !== -1) originList.splice(existPositionIndex, 1)
    const newPosition = {
      id: id,
      startX: currentItem.x,
      startY: currentItem.y,
      endX: currentItem.x,
      endY: currentItem.y,
      width: 0,
      rotate: 0
    }
    originList.push(newPosition)
    this.setData({
      positionList: originList,
      currentId: id
    })
  },
  lineMove: function (e) {
    const moveX = e.touches[0].pageX - this.data.parentLeft
    const moveY = e.touches[0].pageY - this.data.parentTop
    if (this.data.startFlag) {
      const id = this.data.currentId
      const updateItemIndex = this.data.positionList.findIndex(function (leftItem) {
        return leftItem.id === id
      })
      <!--实时更新终点坐标-->
      if (updateItemIndex !== -1) {
        const updateEndX = "positionList[" + updateItemIndex + "].endX"
        const updateEndY = "positionList[" + updateItemIndex + "].endY"
        this.setData({
          [updateEndX]: moveX,
          [updateEndY]: moveY,
        })
        this.setData({
          currentX: moveX,
          currentY: moveY
        })
      } else {
        console.log("流程不对")
      }
    }
  },
  lineEnd: function () {
    this.setData({
      startFlag: false
    })
    <!--边界判断-->
    const currentIndex = this.testBorder(this.data.currentX, this.data.currentY, 'right')
    const id = this.data.currentId
    const currentPositionList = this.data.positionList
    const updateItemIndex = currentPositionList.findIndex(function (leftItem) {
      return leftItem.id === id
    })
    if (currentIndex !== -1) {
    <!--这里结束直接判断边界，只要在右侧诗词区域内就找到右侧对应的黑点坐标，使其成为终点坐标-->
      const currentItem = this.data.rightList[currentIndex] // 坐标
      if (updateItemIndex !== -1) {
        const updateEndX = "positionList[" + updateItemIndex + "].endX"
        const updateEndY = "positionList[" + updateItemIndex + "].endY"
        this.setData({
          [updateEndX]: currentItem.x,
          [updateEndY]: currentItem.y,
        })
        this.setData({
          currentX: 0,
          currentY: 0
        })
      } else {
        console.log("流程不对")
      }
    } else {
      currentPositionList.splice(updateItemIndex, 1)
      this.setData({
        positionList: currentPositionList
      })
    }
    console.log(this.data.positionList)
    console.log("连线结束")
  },
```  
这里面更新数据的方式有点特别：
```
const updateEndX = "positionList[" + updateItemIndex + "].endX"
const updateEndY = "positionList[" + updateItemIndex + "].endY"
this.setData({
  [updateEndX]: moveX,
  [updateEndY]: moveY,
})
```
有没有发现有点像symbol对象更新对象的方式  
* ##### 边界判断  
边界判断是将终点坐标在右侧诗词区域内都视为连线成功区域,此方法返回终点坐标在右侧诗词区域第几个下标
```
testBorder: function (x, y, direction) {
    if (direction === "left") { // 左边区域
      if (x >= this.data.leftBorder.startX && x <= this.data.leftBorder.endX && y >= this.data.leftBorder.startY && y <= this.data.leftBorder.endY) { // 边界中
        const index = Math.floor(y / this.data.stardHeight)
        return index
      } else {
        return -1
      }
    }
    if (direction === "right") { // 右边区域
      if (x >= this.data.rightBorder.startX && x <= this.data.rightBorder.endX && y >= this.data.rightBorder.startY && y <= this.data.rightBorder.endY) { // 边界中
        const index = Math.floor(y / this.data.stardHeight)
        return index
      } else {
        return -1
      }
    }
  },
```

### 结语  
___
* 上面代码量也不多，感兴趣可以在微信开发工具查看效果，重点是实现连线的思想是否可取，这种方式如果改变线条的样式怎么办？我也试着改了下代码（可能看不清，锯齿状的线条）：

![](https://user-gold-cdn.xitu.io/2020/3/24/1710c4ec668c113d?w=1481&h=749&f=gif&s=183572)
**<center><font color='#8468bd' size="2">锯齿线条</font></center>** 
* 可以继续在此拓展左右都可以连线，长按删除连线等
### 源码  
___  
源码地址：[小程序实践 —— 精简版前端连线题](https://github.com/yuelinghunyu/blog-demo/tree/master/min-program)  
在线预览：
![](https://user-gold-cdn.xitu.io/2020/3/24/1710c579ecf2aa86?w=258&h=294&f=jpeg&s=18714)