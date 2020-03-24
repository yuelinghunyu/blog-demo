//index.js
const app = getApp()

Page({
  data: {
    leftList: [],
    rightList: [],
    leftBorder: {},
    rightBorder: {},
    stardHeight: 0,
    positionList: [],
    parentTop: 0,
    parentLeft: 0,
    startFlag: false,
    currentId: "",
    currentX: 0,
    currentY: 0,
    rightLeft: 0
  },
  // 页面生命周期初始化
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    // 页面创建时执行
    const db = wx.cloud.database({
      env: 'difficult-ojjvv'
    })
    db.collection('line').get().then(res => {
      wx.hideLoading()
      const listArray = res.data[0]
      const leftList = listArray.left_list
      const rightList = listArray.right_list
      this.setData({
        leftList: leftList,
        rightList: rightList
      })
      this.initPosition()
      this.initBorders()
    })
  },
  // 获取题面黑点的中心点坐标
  initPosition: function () {
    const that = this
    const query = wx.createSelectorQuery()
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
          [itemX]: node.left - that.data.parentLeft + node.width / 2,
          [itemY]: node.top - that.data.parentTop + node.height / 2
        })
      })
    })
    query.selectAll(".right-item-icon").boundingClientRect(function (nodeList) {
      nodeList.forEach(function (node, index) {
        const itemX = "rightList[" + index + "].x"
        const itemY = "rightList[" + index + "].y"
        that.setData({
          [itemX]: node.left + node.width / 2,
          [itemY]: node.top - that.data.parentTop + node.height / 2
        })
      })
    })
    query.select(".right-item-icon").boundingClientRect(function (res) {
      that.setData({
        rightLeft: res.left
      })
    })
    query.exec()
  },
  // 获取坐标允许的经过的边界
  initBorders: function () {
    const that = this
    const query = wx.createSelectorQuery()
    query.select(".left").boundingClientRect(function (res) {
      console.log(res)
      that.setData({
        leftBorder: {
          startX: res.left,
          startY: 0,
          endX: res.right,
          endY: res.height
        }
      })
    })
    query.select(".right").boundingClientRect(function (res) {
      console.log(res)
      that.setData({
        rightBorder: {
          startX: that.data.rightLeft,
          startY: 0,
          endX: res.right,
          endY: res.height
        }
      })
    })
    query.select(".left-item").boundingClientRect(function (res) {
      console.log(res)
      that.setData({
        stardHeight: res.height
      })
    })
    query.exec()
  },
  sortList: function () {
    wx.showLoading({
      title: '排序中',
    })
    this.data.leftList.sort(this.randomSort)
    this.data.rightList.sort(this.randomSort)
    this.setData({
      leftList: this.data.leftList,
      rightList: this.data.rightList
    })
    wx.hideLoading()
    this.initPosition()
    this.initBorders()
    this.resetData()
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
    const existPositionIndex = this.data.positionList.findIndex(function (postion) {
      return postion.id === id
    })
    let originList = this.data.positionList
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
    const currentIndex = this.testBorder(this.data.currentX, this.data.currentY, 'right')
    const id = this.data.currentId
    const currentPositionList = this.data.positionList
    const updateItemIndex = currentPositionList.findIndex(function (leftItem) {
      return leftItem.id === id
    })
    if (currentIndex !== -1) {
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
  resetData: function () {
    this.setData({
      positionList: []
    })
  }
})
