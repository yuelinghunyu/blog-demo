<template>
  <div id="app">
    <img
      alt="Vue logo"
      :src="logo"
    >
    <h3>前端请求后端服务器数据</h3>
    <p>
      <img
        v-if="isLoading"
        :src="loading"
      >
      <span v-else>{{text}}</span>
    </p>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'App',
  data () {
    return {
      logo: require("@/assets/cache-img.png"),
      loading: require("@/assets/loading.gif"),
      isLoading: true,
      text: ''
    }
  },
  created () {
    this.isLoading = true
    this.getServerContent(() => {
      this.isLoading = false
    })
  },
  methods: {
    async getServerContent (fn) {
      const url = "/cache/debug"
      const result = await axios.get(url)
      const data = result.data
      this.text = data.content
      fn()
    }
  },
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
h3 {
  margin-top: 50px;
  font-size: 30px;
}
p {
  margin-top: 50px;
}
span {
  font-size: 30px;
  color: #368fff;
}
</style>
