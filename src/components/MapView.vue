<template>
  <div class="map-container">
    <div class="sidebar">
      <div class="p-3">
        <h2 class="mb-4">控制面板</h2>
        <div class="d-grid gap-3">
          <button class="btn btn-primary" @click="handleButtonClick">
            <i class="bi bi-geo-alt"></i> 顯示位置
          </button>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="layerSwitch">
            <label class="form-check-label" for="layerSwitch">切換圖層</label>
          </div>
        </div>
      </div>
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

const handleButtonClick = () => {
  alert('按鈕被點擊了！')
}
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
  background-color: #f8f9fa;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}
</style> 