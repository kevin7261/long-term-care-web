<template>
  <!-- 地圖容器 -->
  <div class="map-wrapper">
    <!-- Leaflet 地圖組件 -->
    <l-map
      ref="mapRef"
      :zoom="zoom"
      @update:zoom="$emit('update:zoom', $event)"
      :center="center"
      :bounds="bounds"
      :use-global-leaflet="false"
    >
      <!-- 地圖底圖圖層：OpenStreetMap -->
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />

      <!-- 地圖標記點：遍歷所有位置點 -->
      <l-marker
        v-for="(point, index) in mapPoints"
        :key="index"
        :lat-lng="point.position"
      >
        <!-- 標記點彈出框：顯示位置詳細資訊 -->
        <l-popup>
          <div>
            <strong>{{ point.name }}</strong>
            <small>{{ point.address }}</small>
            <small>電話：{{ point.phone }}</small>
            <small>區域：{{ point.district }}</small>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet"
import '@/assets/styles/base.css'
import '@/assets/styles/map.css'

export default defineComponent({
  name: 'MapComponent',

  // 註冊 Leaflet 組件
  components: {
    LMap,      // 地圖容器
    LTileLayer, // 地圖圖層
    LMarker,   // 地圖標記
    LPopup     // 彈出框
  },

  // 組件屬性定義
  props: {
    // 地圖縮放等級
    zoom: {
      type: Number,
      required: true
    },
    // 地圖中心點座標
    center: {
      type: Array,
      required: true
    },
    // 地圖邊界
    bounds: {
      type: Object,
      default: null
    },
    // 地圖標記點資料
    mapPoints: {
      type: Array,
      default: () => []
    }
  },

  // 組件事件定義
  emits: ['update:zoom'],

  // 暴露給父組件的方法
  expose: ['leafletObject']
})
</script>

<style scoped>
.map-wrapper {
  flex: 1;
  position: relative;
  height: 100%;
  min-height: 0;
}

:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  z-index: 1;
}

:deep(.leaflet-control-container) {
  z-index: 2;
}
</style> 