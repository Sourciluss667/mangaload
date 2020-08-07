<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
}
body {
  background: #FFE45E;
  font: 18px monospace;
  color: #ffffff;
}
#app {
  height: 100%;
}
</style>
