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
  observers: {
    'startX, startY, endX, endY': function (startX, startY, endX, endY) {
      let { angle, line } = this.getAngle(startX, startY, endX, endY)
      this.setData({
        angle: angle,
        line: line
      })
      // console.log("angle:" + this.data.angle)
      // console.log("line:" + this.data.line)
      if (this.data.ready) this.initStartPostion()
    }
  },
  data: {
    angle: 0,
    line: 0,
    ready: false
  },
  lifetimes: {
    ready: function () { // 初始节点完成初始调用
      this.setData({
        ready: true
      })
      this.initStartPostion()
    }
  },
  methods: {
    getAngle: function (startX, startY, endX, endY) {
      // console.log("startX:" + startX)
      // console.log("startY:" + startY)
      // console.log("endX:" + endX)
      // console.log("endY:" + endY)
      let angle = 0
      let line = 0
      let a = 0
      if (startX == endX) {
        if (startY > endY) {
          let tempY = startY;
          startY = endY;
          endY = tempY;
        }
        angle = 180
      }
      if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
        if (startX > endX) {
          let tempX = endX;
          endX = startX;
          startX = tempX;
        }
      } else {
        if (startY > endY) {
          let tempY = startY;
          startY = endY;
          endY = tempY;
        }
      }
      a = (startY - endY) / (startX - endX);
      angle = this.getTanDeg(a)
      line = Math.round(Math.sqrt(Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2)))
      return { angle, line }
    },
    getTanDeg: function (tan) {
      let result = Math.atan(tan) / (Math.PI / 180)
      return Math.round(result)
    },
    initStartPostion: function () {
      this.triggerEvent("calcPostionLine", { angle: this.data.angle, line: this.data.line })
    }
  },
})