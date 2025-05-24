<template>
  <div class="app-container">
    <MapView />
  </div>
</template>

<script setup>
import MapView from './components/MapView.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Noto Sans TC', sans-serif;
  font-stretch: expanded;
  letter-spacing: 0.8px;
}

body {
  overflow: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
