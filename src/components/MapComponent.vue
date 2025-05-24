<template>
  <!-- 地圖容器 -->
  <div class="map-wrapper">
    <!-- Leaflet 地圖組件 -->
    <l-map
      ref="mapRef"
      :zoom="zoom"
      @update:zoom="$emit('update:zoom', $event)"
      :center="center"
      :use-global-leaflet="false"
    >
      <!-- 地圖底圖圖層：OpenStreetMap -->
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />
    </l-map>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, computed, watch } from 'vue'
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet"
import { useMapStore } from '../stores/mapStore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/assets/styles/base.css'
import '@/assets/styles/map.css'

// 修復 Leaflet 圖標問題
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export default defineComponent({
  name: 'MapComponent',

  // 註冊 Leaflet 組件
  components: {
    LMap,      // 地圖容器
    LTileLayer // 地圖圖層
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
    }
  },

  // 組件事件定義
  emits: ['update:zoom'],

  setup() {
    const mapRef = ref(null)
    const mapStore = useMapStore()
    const markers = ref([])

    // 計算屬性：獲取地圖點位
    const mapPoints = computed(() => mapStore.mapPoints)

    // 清除所有標記
    const clearMarkers = () => {
      markers.value.forEach(marker => {
        if (marker && mapRef.value?.leafletObject) {
          mapRef.value.leafletObject.removeLayer(marker)
        }
      })
      markers.value = []
    }

    // 添加標記
    const addMarkers = () => {
      if (!mapRef.value?.leafletObject || !mapPoints.value.length) {
        return
      }

      console.log('添加標記:', mapPoints.value.length, '個點位')

      mapPoints.value.forEach((point, index) => {
        // 使用原生 Leaflet API 創建標記
        const marker = L.marker([point.position.lat, point.position.lng])
          .bindPopup(`
            <div>
              <strong>${point.name}</strong><br>
              <small>${point.address}</small><br>
              <small>電話：${point.phone}</small><br>
              <small>區域：${point.district}</small>
            </div>
          `)
          .addTo(mapRef.value.leafletObject)

        markers.value.push(marker)
        console.log(`標記 ${index + 1} 已添加:`, point.name, [point.position.lat, point.position.lng])
      })
    }

    // 監聽點位變化
    watch(mapPoints, () => {
      console.log('點位數據變化，重新添加標記')
      clearMarkers()
      addMarkers()
    })

    onMounted(() => {
      console.log('地圖組件已掛載')
      
      // 等待地圖初始化完成
      setTimeout(() => {
        if (mapRef.value?.leafletObject) {
          console.log('地圖實例準備就緒')
          addMarkers()
        }
      }, 500)
    })

    return {
      mapRef,
      mapPoints
    }
  }
})
</script> 