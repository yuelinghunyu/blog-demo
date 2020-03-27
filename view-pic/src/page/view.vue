<template>
  <div class="pic-list-container">
    <div
      class="pic-list-scroll-container"
      v-if="picList.length"
    >
      <div
        class="file-container"
        v-for="(file, index) in picList"
        :key="file.id"
        @click="handleClick(index)"
      >
        <img
          :src="file.file_path"
          alt=""
        >
        <span class="spot-num">{{index + 1}}</span>
      </div>
    </div>
  </div>
</template>
<script>
import picListSevice from "@/api/picListSevice"
export default {
  created () {
    this.getPicList()
  },
  data () {
    return {
      picList: [],
      total: 0
    }
  },
  methods: {
    async getPicList () {
      const picList = await picListSevice.getPicList({ page: 1, limit: 10 })
      const data = picList.data
      const code = data.code
      const result = data.content
      if (code === 200) {
        this.picList = result.list
        this.total = result.total
      } else {
        console.log("接口报错")
      }
    },
    handleClick (index) {
      this.$layer.show({
        currentIndex: index,
        list: this.picList
      })
    }
  },
}
</script>
<style scoped>
.pic-list-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
}
.pic-list-scroll-container {
  width: 100%;
  padding: 0.2rem 0;
  overflow: hidden;
  overflow-y: auto;
}
.file-container {
  width: 94%;
  margin: 0.1rem auto;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.file-container > img {
  display: block;
  height: auto;
  width: 100%;
  border: 3px solid rgba(136, 142, 152, 0.25);
  box-sizing: border-box;
}
.spot-num {
  position: absolute;
  width: 0.32rem;
  height: 0.32rem;
  color: #fff;
  font-size: 0.14rem;
  background: rgba(0, 0, 0, 1);
  opacity: 0.5;
  border-radius: 4px 0px 0px 0px;
  bottom: 3px;
  right: 3px;
  text-align: center;
  line-height: 0.32rem;
}
</style>
