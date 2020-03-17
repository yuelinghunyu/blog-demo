//index.js
const app = getApp()

Page({
  data: {
    leftList: [],
    rightList: [],
    positionList: [],
    parentTop: 0,
    parentLeft: 0,
    startFlag: false,
    currentId: ""
  },
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
    })
  },
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
