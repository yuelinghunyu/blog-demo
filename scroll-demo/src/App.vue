<template>
  <div id="app">
    <TabList
      :list="list"
      @switchTab="switchTab"
    ></TabList>
    <!-- v-iscroll="defalutOption" -->
    <div
      v-iscroll="{
        option: defalutOption,
        instance: getIscroll
      }"
      class="tab-content-container"
      ref="detailItemContainer"
    >
      <ul class="tab-list-container">
        <li
          v-for="item in list"
          :key="item.id"
          class="list-item"
          ref="detailItem"
        >
          <div>{{item.value}}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import TabList from './components/tabList.vue'

export default {
  name: 'App',
  components: {
    TabList,
  },
  data () {
    return {
      list: [
        { id: 1, value: '这是第1题', num: 1 },
        { id: 2, value: '这是第2题', num: 2 },
        { id: 3, value: '这是第3题', num: 3 },
        { id: 4, value: '这是第4题', num: 4 },
        { id: 5, value: '这是第5题', num: 5 },
        { id: 6, value: '这是第6题', num: 6 },
        { id: 7, value: '这是第7题', num: 7 },
        { id: 8, value: '这是第8题', num: 8 },
        { id: 9, value: '这是第9题', num: 9 },
        { id: 10, value: '这是第10题', num: 10 },
        { id: 11, value: '这是第11题', num: 11 },
        { id: 12, value: '这是第12题', num: 12 },
        { id: 13, value: '这是第13题', num: 13 },
        { id: 14, value: '这是第14题', num: 14 },
        { id: 15, value: '这是第15题', num: 15 },
        { id: 16, value: '这是第16题', num: 16 }
      ],
      defalutOption: {
        bounce: true,
        mouseWheel: true,
        click: true,
        scrollX: false,
        scrollY: true
      },
      myScroll: null
    }
  },
  methods: {
    switchTab (currentId, currentIndex) {
      const offsetTop = this.$refs.detailItem[currentIndex].offsetTop
      const y = offsetTop >= Math.abs(this.myScroll.maxScrollY) ? this.myScroll.maxScrollY : -offsetTop
      this.myScroll.scrollTo(0, y)
    },
    getIscroll (iscroll) {
      this.myScroll = iscroll
    }
  }
}
</script>
<style scoped>
#app {
  width: 375px;
  height: 600px;
  border: 1px solid #333;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
}
.tab-content-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}
.list-item {
  display: flex;
  width: 100%;
  height: 100px;
}
.list-item:nth-child(even) {
  background-color: bisque;
}
.list-item:nth-child(odd) {
  background-color: cadetblue;
}
.list-item > div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
