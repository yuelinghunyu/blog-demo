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