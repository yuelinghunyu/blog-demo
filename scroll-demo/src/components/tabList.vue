<template>
  <div class="tab-container">
    <div
      class="scroll-container"
      v-iscroll="{
        option: iscrollConf,
        instance: getIscroll
      }"
      ref="scrollContainer"
    >
      <ul
        class="tab-li-container"
        ref="tabLiContainer"
      >
        <li
          class="tab-li-item"
          v-for="(item, index) in list"
          :key="item.id"
          :id="item.id"
          ref="tabItem"
          @click="tabEvent(item, index)"
        >
          <div
            class="item"
            :class="{
              'item-active': currentId == item.id
            }"
          >{{item.num}}</div>
        </li>
      </ul>
    </div>
    <div
      class="tab-left"
      @click="tabBtnEvent('left')"
    >&lt;</div>
    <div
      class="tab-right"
      @click="tabBtnEvent('right')"
    >&gt;</div>
  </div>
</template>
<script>
export default {
  props: ['list'],
  data () {
    return {
      iscrollConf: {
        bounce: true,
        mouseWheel: true,
        click: true,
        scrollX: true,
        scrollY: false
      },
      currentId: null,
      currentIndex: 0,
      myScroll: null
    }
  },
  mounted () {
    this.$refs.tabLiContainer.style.width = this.$refs.tabItem[0].offsetWidth * this.list.length + 'px'
    this.$nextTick(() => {
      this.myScroll.refresh()
    })
  },
  methods: {
    tabEvent (item, currentIndex) {
      this.currentId = item.id
      this.currentIndex = currentIndex
      // 获取滚动容器的长度的一半，即中间点
      const scrollContainerHalfWidth = this.$refs.scrollContainer.offsetWidth / 2
      // 获取单个item的一半长度
      const tabItemHalfWidth = this.$refs.tabItem[currentIndex].offsetWidth / 2
      // 求取插值，就是开始到中间开始位置的距离
      const halfDistance = scrollContainerHalfWidth - tabItemHalfWidth
      // 求取当前item的相对总长度的偏移量
      const currentItemOffsetLeft = this.$refs.tabItem[currentIndex].offsetLeft
      // scroll 移动到中间的值
      const x = halfDistance - currentItemOffsetLeft
      this.myScroll.scrollTo(x, 0)
      this.$emit("switchTab", this.currentId, this.currentIndex)
    },
    tabBtnEvent (direction) {
      const max = this.$refs.tabItem.length
      if (direction === 'left' && this.currentIndex > 0) {
        this.currentIndex--
      }
      if (direction === 'right' && this.currentIndex < max - 1) {
        this.currentIndex++
      }
      this.tabEvent(this.$refs.tabItem[this.currentIndex], this.currentIndex)
    },
    getIscroll (iscroll) {
      this.myScroll = iscroll
    }
  },
  watch: {
    list: {
      handler (l) {
        this.currentId = l[0].id
      },
      immediate: true,
      deep: true
    }
  }
}
</script>
<style scoped>
.tab-container {
  width: 100%;
  height: 40px;
  border-bottom: 1px solid#333;
  position: relative;
}
.scroll-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.tab-li-container {
  height: 100%;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
}
.tab-li-item {
  display: block;
  width: 80px;
  height: 100%;
  border-left: 1px solid #333;
  border-right: 1px solid #333;
}
.item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 100%;
}
.item-active {
  background-color: cornflowerblue;
  color: beige;
}
.tab-left,
.tab-right {
  width: 40px;
  height: 40px;
  background-color: cornsilk;
  position: absolute;
  top: 0;
  font-size: 24px;
  color: blue;
  display: flex;
  justify-content: center;
  align-items: center;
}
.tab-right {
  right: 0;
}
</style>