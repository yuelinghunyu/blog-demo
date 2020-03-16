<template>
  <div id="app">
    <katexRender></katexRender>
  </div>
</template>

<script>
import katexRender from './components/katexRender.vue'

export default {
  name: 'App',
  components: {
    katexRender
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
