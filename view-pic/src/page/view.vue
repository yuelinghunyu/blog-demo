<template>
  <div>
    怎么不行啊
  </div>
</template>
<script>
import picListSevice from "@/api/picListSevice"
export default {
  created () {
    this.getPicList()
  },
  methods: {
    async getPicList () {
      const picList = await picListSevice.getPicList({ page: 1, limit: 10 })
      console.log(picList)
    }
  },
}
</script>

<style>
</style>
