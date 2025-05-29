<template>
  <!-- 
    地圖組件 (MapComponent)
    
    功能：
    - 顯示互動式地圖
    - 使用 OpenStreetMap 作為底圖
    - 顯示醫療院所標記點
    - 支援點擊標記顯示詳細資訊
    - 支援縮放和拖拽操作
    - 點擊地圖生成5km服務範圍圓
  -->
  <div class="map-wrapper">
    <!-- 
      Leaflet 地圖主容器
      - zoom: 地圖縮放等級 (由父組件傳入)
      - center: 地圖中心點座標 (由父組件傳入)
      - use-global-leaflet: 不使用全域 Leaflet 實例
      - class: 根據點擊功能狀態動態添加游標樣式
    -->
    <l-map
      ref="mapRef"
      :zoom="zoom"
      @update:zoom="$emit('update:zoom', $event)"
      :center="center"
      :use-global-leaflet="false"
      class="leaflet-map"
      @contextmenu="handleMapRightClick"
    >
      <!-- 
        地圖底圖圖層：OpenStreetMap
        - 免費開源的地圖服務
        - 支援多語言標籤
        - 適合台灣地區使用
      -->
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />

      <!-- 服務範圍圓形 -->
      <l-circle
        v-if="serviceCircleData.visible"
        :lat-lng="serviceCircleData.center"
        :radius="serviceCircleData.radius"
        :color="serviceCircleData.color"
        :fill-color="serviceCircleData.fillColor"
        :fill-opacity="serviceCircleData.fillOpacity"
        :weight="serviceCircleData.weight"
        :opacity="serviceCircleData.opacity"
        @contextmenu="handleCircleRightClick"
      >
        <l-popup :opened="serviceCircleData.showPopup">
          <div style="text-align: center; min-width: 150px;">
            <h6 :style="`color: ${serviceCircleData.color}; margin: 0 0 10px 0;`">
              🎯 服務範圍圓
            </h6>
            <div style="font-size: 13px;">
              <strong>中心座標：</strong><br>
              <span style="color: #666;">
                {{ serviceCircleData.center[0]?.toFixed(6) }}, {{ serviceCircleData.center[1]?.toFixed(6) }}
              </span><br><br>
              <strong>服務半徑：</strong> 
              <span style="color: #007bff;">2.0 公里</span><br>
              <strong>覆蓋面積：</strong> 
              <span style="color: #28a745;">{{ serviceCircleData.area }} 平方公里</span>
            </div>
          </div>
        </l-popup>
      </l-circle>

      <!-- CSV 點位（用 Vue-Leaflet l-marker 呈現） -->
      <l-marker
        v-for="(point, idx) in mapPoints"
        :key="'marker-' + idx"
        :lat-lng="[point.position.lat, point.position.lng]"
        :z-index-offset="1000"
      >
        <l-popup>
          <strong>{{ point.name }}</strong><br>
          <small>{{ point.address }}</small><br>
          <small>電話：{{ point.phone }}</small><br>
          <small>區域：{{ point.district }}</small>
        </l-popup>
      </l-marker>

      <!-- GeoJSON 圖層 -->
      <template v-if="geoJsonLayers && geoJsonLayers.length > 0">
        <l-geo-json
          v-for="(layer, index) in geoJsonLayers"
          :key="`geojson-${index}`"
          :geojson="layer.feature"
          :options="geoJsonOptions"
          :options-style="layer.style"
          @click="handleGeoJsonClick"
        >
          <l-popup>
            <div v-html="layer.popupContent"></div>
          </l-popup>
        </l-geo-json>
      </template>
    </l-map>

    <!-- 右鍵選單 -->
    <div 
      v-if="contextMenu.visible" 
      class="context-menu"
      :style="{
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
      @click.stop
    >
      <!-- 在地圖上右鍵：顯示加入服務範圍 -->
      <div 
        v-if="contextMenu.type === 'map'" 
        class="context-menu-item" 
        @click="addServiceCircle"
      >
        <i class="bi bi-plus-circle"></i>
        加入服務範圍
      </div>
      
      <!-- 在服務範圍圓上右鍵：顯示刪除服務範圍 -->
      <div 
        v-if="contextMenu.type === 'circle'" 
        class="context-menu-item context-menu-item-danger" 
        @click="deleteServiceCircle"
      >
        <i class="bi bi-trash3"></i>
        刪除服務範圍
      </div>
    </div>

    <!-- 右鍵選單背景遮罩（點擊隱藏選單） -->
    <div 
      v-if="contextMenu.visible" 
      class="context-menu-overlay"
      @click="hideContextMenu"
    ></div>
  </div>
</template>

<script>
// ============================================================================
// 導入依賴模組
// ============================================================================

// Vue 3 Composition API
import { defineComponent, ref, computed, nextTick } from 'vue'

// Vue-Leaflet 組件 (用於地圖容器和圖層)
import { LMap, LTileLayer, LCircle, LPopup, LGeoJson, LMarker } from "@vue-leaflet/vue-leaflet"

// Pinia 狀態管理 (地圖數據)
import { useMapStore } from '../stores/mapStore'

// Leaflet 核心庫 (用於標記操作)
import L from 'leaflet'

// 樣式文件
import 'leaflet/dist/leaflet.css'          // Leaflet 預設樣式
import '@/assets/styles/base.css'          // 基礎全域樣式
import '@/assets/styles/map.css'           // 地圖專用樣式

// ============================================================================
// Leaflet 圖標修復設置
// ============================================================================

/**
 * 修復 Leaflet 在 Webpack 環境中的圖標路徑問題
 * 
 * 問題原因：
 * - Webpack 打包時會改變圖標文件的路徑
 * - Leaflet 預設的圖標 URL 解析方法會失效
 * 
 * 解決方案：
 * - 刪除預設的 URL 解析方法
 * - 手動設置正確的圖標文件路徑
 */
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'), // 高解析度圖標
  iconUrl: require('leaflet/dist/images/marker-icon.png'),          // 標準圖標
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),      // 圖標陰影
})

// ============================================================================
// 組件定義
// ============================================================================

export default defineComponent({
  name: 'MapComponent',

  // 註冊子組件
  components: {
    LMap,      // Leaflet 地圖容器
    LTileLayer, // Leaflet 圖層 (底圖)
    LCircle,   // Leaflet 圓形組件
    LPopup,    // Leaflet 彈出框組件
    LGeoJson,  // Leaflet GeoJSON 組件
    LMarker    // Leaflet 標記組件
  },

  // ============================================================================
  // 組件屬性 (Props)
  // ============================================================================
  props: {
    /**
     * 地圖縮放等級
     * @type {Number}
     * @required
     * @description 控制地圖的縮放程度，數值越大越詳細
     */
    zoom: {
      type: Number,
      required: true
    },

    /**
     * 地圖中心點座標
     * @type {Array}
     * @required
     * @description 格式為 [緯度, 經度]，決定地圖的顯示中心
     */
    center: {
      type: Array,
      required: true
    }
  },

  // ============================================================================
  // 組件事件 (Emits)
  // ============================================================================
  emits: [
    'update:zoom' // 當地圖縮放等級改變時觸發，支援 v-model 雙向綁定
  ],

  // ============================================================================
  // 組件邏輯 (Setup)
  // ============================================================================
  setup() {
    // ------------------------------------------------------------------------
    // 響應式數據
    // ------------------------------------------------------------------------
    
    const mapRef = ref(null)      // 地圖組件的引用
    const mapStore = useMapStore() // Pinia 狀態管理實例

    // 右鍵選單狀態
    const contextMenu = ref({
      visible: false,
      x: 0,
      y: 0,
      clickLatLng: null,  // 儲存右鍵點擊的座標
      type: null  // 區分點擊類型：'map' 或 'circle'
    })

    // 服務範圍圓形狀態
    const serviceCircleData = ref({
      visible: false,
      center: [0, 0],
      radius: 2000,  // 2km半徑
      color: '#ff6b6b',
      fillColor: '#ff6b6b',
      fillOpacity: 0.2,
      weight: 3,
      opacity: 1,
      area: 0,
      showPopup: false  // 控制彈窗是否自動打開
    })

    // ------------------------------------------------------------------------
    // 計算屬性
    // ------------------------------------------------------------------------
    
    /**
     * 地圖點位數據
     * @description 從 store 中獲取醫療院所的點位資訊
     */
    const mapPoints = computed(() => mapStore.mapPoints)
    const geoJsonLayers = computed(() => mapStore.geoJsonLayers)

    // ------------------------------------------------------------------------
    // 右鍵選單處理
    // ------------------------------------------------------------------------

    /**
     * 處理右鍵點擊事件
     * @param {MouseEvent} e - 滑鼠事件
     * @description 顯示右鍵選單
     */
    const handleMapRightClick = (e) => {
      console.log('地圖右鍵點擊：', e.latlng)
      
      // 隱藏現有選單
      contextMenu.value.visible = false
      
      // 計算選單位置
      const containerPoint = e.containerPoint
      contextMenu.value.x = containerPoint.x
      contextMenu.value.y = containerPoint.y
      contextMenu.value.latlng = e.latlng
      contextMenu.value.type = 'map'  // 設定為地圖點擊類型
      
      // 顯示選單
      nextTick(() => {
        contextMenu.value.visible = true
      })
    }

    /**
     * 處理圓形右鍵點擊事件
     * @param {MouseEvent} e - 滑鼠事件
     * @description 顯示刪除服務範圍選單
     */
    const handleCircleRightClick = (e) => {
      console.log('🖱️ 右鍵點擊服務範圍圓')
      
      // 手動阻止默認的右鍵選單行為
      if (e.originalEvent && e.originalEvent.preventDefault) {
        e.originalEvent.preventDefault()
      }
      
      // 阻止事件冒泡到地圖
      if (e.originalEvent && e.originalEvent.stopPropagation) {
        e.originalEvent.stopPropagation()
      }
      
      // 隱藏現有選單
      hideContextMenu()
      
      console.log('顯示刪除服務範圍選單')
      
      // 顯示右鍵選單
      contextMenu.value = {
        visible: true,
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        clickLatLng: null,  // 圓形點擊不需要座標
        type: 'circle'
      }
    }

    /**
     * 加入服務範圍圓
     * @description 在右鍵點擊位置創建服務範圍圓
     */
    const addServiceCircle = () => {
      console.log('🎯 加入服務範圍圓')
      
      if (!contextMenu.value.latlng) {
        console.error('無法取得點擊座標')
        return
      }
      
      // 計算圓形面積 (平方公里)
      const radiusKm = serviceCircleData.value.radius / 1000
      const area = Math.PI * radiusKm * radiusKm
      
      // 更新服務範圍圓數據
      serviceCircleData.value = {
        visible: true,
        center: [contextMenu.value.latlng.lat, contextMenu.value.latlng.lng],
        radius: 2000,  // 2km
        color: '#ff6b6b',
        fillColor: '#ff6b6b',
        fillOpacity: 0.2,
        weight: 3,
        opacity: 1,
        area: area.toFixed(2),
        showPopup: false
      }
      
      // 更新 store 中的服務範圍圓資訊
      mapStore.setServiceCircle(contextMenu.value.latlng, 2000)
      
      // 隱藏右鍵選單
      hideContextMenu()
      
      console.log('✅ 服務範圍圓已從右鍵選單創建')
    }

    /**
     * 刪除服務範圍圓
     * @description 從地圖上移除當前的服務範圍圓形
     */
    const deleteServiceCircle = () => {
      console.log('🗑️ 從右鍵選單刪除服務範圍圓')
      
      // 隱藏選單
      hideContextMenu()
      
      // 使用響應式數據隱藏圓形
      serviceCircleData.value.visible = false
      
      // 清除 store 中的狀態
      mapStore.clearServiceCircle()
      
      console.log('✅ 服務範圍圓已刪除')
    }

    /**
     * 隱藏右鍵選單
     * @description 隱藏右鍵選單並清除相關狀態
     */
    const hideContextMenu = () => {
      contextMenu.value = {
        visible: false,
        x: 0,
        y: 0,
        clickLatLng: null,
        type: null
      }
    }

    // ------------------------------------------------------------------------
    // GeoJSON 處理
    // ------------------------------------------------------------------------

    /**
     * GeoJSON 圖層選項
     */
    const geoJsonOptions = {
      onEachFeature: (feature, layer) => {
        // 可以在這裡添加額外的互動功能
        layer.on('mouseover', (e) => {
          e.target.setStyle({
            weight: 3,
            opacity: 1.0
          })
        })
        
        layer.on('mouseout', (e) => {
          e.target.setStyle({
            weight: 1,
            opacity: 0.8
          })
        })
      }
    }

    /**
     * 處理 GeoJSON 圖層點擊事件
     * @param {Object} e - 點擊事件
     */
    const handleGeoJsonClick = (e) => {
      console.log('GeoJSON 圖層點擊：', e.layer.feature.properties)
      // 可以在這裡添加額外的點擊處理邏輯
    }

    // ------------------------------------------------------------------------
    // 返回組件的公開介面
    // ------------------------------------------------------------------------
    
    return {
      // 響應式數據
      mapRef,
      mapPoints,             // 地圖點位數據
      geoJsonLayers,         // GeoJSON 圖層數據
      serviceCircleData,     // 服務範圍圓數據
      contextMenu,           // 右鍵選單數據
      
      // 方法函數
      handleMapRightClick,   // 處理地圖右鍵點擊事件
      addServiceCircle,      // 加入服務範圍圓的方法
      hideContextMenu,       // 隱藏右鍵選單
      deleteServiceCircle,   // 刪除服務範圍圓的方法
      handleCircleRightClick, // 處理圓形右鍵點擊事件
      geoJsonOptions,        // GeoJSON 圖層選項
      handleGeoJsonClick     // 處理 GeoJSON 圖層點擊事件
    }
  }
})
</script>

<style scoped>
/* ============================================================================
   地圖容器樣式
   ============================================================================ */

.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  cursor: default; /* 預設游標 */
  transition: cursor 0.2s ease; /* 平滑過渡效果 */
}

/* ============================================================================
   右鍵選單樣式
   ============================================================================ */

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.context-menu-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background-color: #f8f9fa;
}

.context-menu-item:last-child {
  border-bottom: none;
}

.context-menu-item i {
  color: #007bff;
  font-size: 16px;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

.context-menu-item-danger {
  color: #dc3545;
}

.context-menu-item-danger:hover {
  background-color: #f8f9fa;
  color: #c82333;
}

.context-menu-item-danger i {
  color: #dc3545;
}
</style> 