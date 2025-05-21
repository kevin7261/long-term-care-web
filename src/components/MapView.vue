<template>
  <div class="map-container">
    <div class="sidebar">
      <h2>控制面板</h2>
      <!-- 這裡可以放置控制面板的內容 -->
    </div>
    <div class="map-wrapper">
      <l-map
        ref="map"
        v-model:zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        />
      </l-map>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet"

const zoom = ref(13)
const center = ref([25.0330, 121.5654]) // 台北市中心座標
</script>

<style scoped>
.map-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 300px;
  background-color: #f5f5f5;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}
</style> 