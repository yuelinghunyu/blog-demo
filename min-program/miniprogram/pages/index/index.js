//index.js
const app = getApp()

Page({
  data: {
    leftList: [
      {
        id: '3b85d9fc-c96e-4e49-855d-24d9d5473de1',
        text: "床前明月光",
        x: 0,
        y: 0
      },
      {
        id: "8979f945-e53d-49b1-89d3-d28f1709c481",
        text: "终南阴岭秀",
        x: 0,
        y: 0
      },
      {
        id: "f633fb45-7ae3-47d2-a7c8-3df931d999eb",
        text: "千山鸟飞绝",
        x: 0,
        y: 0
      },
      {
        id: "d530bcc2-3f95-4f09-8957-8d03337bc6a7",
        text: "君看一叶舟",
        x: 0,
        y: 0
      },
      {
        id: "687d9c14-9594-4238-b0d4-eb013992b62d",
        text: "空山不见人",
        x: 0,
        y: 0
      },
    ],
    rightList: [
      {
        id: '3b85d9fc-c96e-4e49-855d-24d9d5473de1',
        text: "疑是地上霜",
        x: 0,
        y: 0
      },
      {
        id: "8979f945-e53d-49b1-89d3-d28f1709c481",
        text: "积雪浮云端",
        x: 0,
        y: 0
      },
      {
        id: "f633fb45-7ae3-47d2-a7c8-3df931d999eb",
        text: "万径人踪灭",
        x: 0,
        y: 0
      },
      {
        id: "d530bcc2-3f95-4f09-8957-8d03337bc6a7",
        text: "出没风波里",
        x: 0,
        y: 0
      },
      {
        id: "687d9c14-9594-4238-b0d4-eb013992b62d",
        text: "但闻人语响",
        x: 0,
        y: 0
      },
    ],
    positionList: [],
    parentTop: 0,
    parentLeft: 0,
    startFlag: false,
    currentId: ""
  },
  onReady: function () {
    const query = wx.createSelectorQuery()
    const that = this
    query.select("#content").boundingClientRect(function (res) {
      that.setData({
        parentTop: res.top,
        parentLeft: res.left
      })
    })
    query.selectAll(".left-item-icon").boundingClientRect(function (nodeList) {
      nodeList.forEach(function (node, index) {
        const itemX = "leftList[" + index + "].x"
        const itemY = "leftList[" + index + "].y"
        that.setData({
          [itemX]: node.left - that.data.parentLeft,
          [itemY]: node.top - that.data.parentTop
        })
      })
    })
    query.selectAll(".right-item-icon").boundingClientRect(function (nodeList) {
      nodeList.forEach(function (node, index) {
        const itemX = "rightList[" + index + "].x"
        const itemY = "rightList[" + index + "].y"
        that.setData({
          [itemX]: node.left,
          [itemY]: node.top - that.data.parentTop
        })
      })
    })
    query.exec()
  },
  sortList: function () {
    this.data.leftList.sort(this.randomSort)
    this.data.rightList.sort(this.randomSort)
    this.setData({
      leftList: this.data.leftList,
      rightList: this.data.rightList
    })
  },
  randomSort: function () {
    return Math.random() > 0.5 ? -1 : 1
  },
  onCalcPostionLine: function (e) {
    let { angle, line } = e.detail
    const id = this.data.currentId
    const updateItemIndex = this.data.positionList.findIndex(function (leftItem) {
      return leftItem.id === id
    })
    if (updateItemIndex !== -1) {
      console.log(updateItemIndex)
      const upWidth = "positionList[" + updateItemIndex + "].width"
      const upRotate = "positionList[" + updateItemIndex + "].rotate"
      this.setData({
        [upWidth]: line,
        [upRotate]: angle,
      })
    } else {
      console.log("流程不对")
    }
  },
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
    let originList = this.data.positionList
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
      if (updateItemIndex !== -1) {
        console.log(updateItemIndex)
        const updateEndX = "positionList[" + updateItemIndex + "].endX"
        const updateEndY = "positionList[" + updateItemIndex + "].endY"
        this.setData({
          [updateEndX]: moveX,
          [updateEndY]: moveY,
        })
      } else {
        console.log("流程不对")
      }
    }
  },
  lineEnd: function (e) {
    this.setData({
      startFlag: false
    })
    console.log(this.data.positionList)
    console.log("连线结束")
  }
})
