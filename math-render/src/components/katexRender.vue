<template>
  <div>
    {{materail}}
  </div>
</template>
<script>
export default {
  created () {
    const jsonData = require("../mock/data.json")
    this.materail = jsonData.material
    console.log(this.materail)
  },
  data () {
    return {
      materail: ""
    }
  },
}
</script>
<style scoped>
</style>