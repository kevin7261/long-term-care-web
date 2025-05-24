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
      @contextmenu="handleRightClick"
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
      <div class="context-menu-item" @click="addServiceCircle">
        <i class="bi bi-plus-circle"></i>
        加入服務範圍
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
import { defineComponent, onMounted, ref, computed, watch, defineExpose } from 'vue'

// Vue-Leaflet 組件 (用於地圖容器和圖層)
import { LMap, LTileLayer, LCircle, LPopup } from "@vue-leaflet/vue-leaflet"

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
    LPopup      // Leaflet 彈出框組件
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
    const markers = ref([])       // 存儲所有地圖標記的陣列
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

    // 右鍵選單狀態
    const contextMenu = ref({
      visible: false,
      x: 0,
      y: 0,
      clickLatLng: null  // 儲存右鍵點擊的座標
    })

    // ------------------------------------------------------------------------
    // 計算屬性
    // ------------------------------------------------------------------------
    
    /**
     * 地圖點位數據
     * @description 從 store 中獲取醫療院所的點位資訊
     */
    const mapPoints = computed(() => mapStore.mapPoints)

    // ------------------------------------------------------------------------
    // 標記管理方法
    // ------------------------------------------------------------------------
    
    /**
     * 清除所有地圖標記
     * @description 移除地圖上的所有標記點，避免重複顯示
     */
    const clearMarkers = () => {
      markers.value.forEach(marker => {
        // 檢查標記和地圖實例是否存在
        if (marker && mapRef.value?.leafletObject) {
          // 從地圖中移除標記
          mapRef.value.leafletObject.removeLayer(marker)
        }
      })
      // 清空標記陣列
      markers.value = []
    }

    /**
     * 添加地圖標記
     * @description 根據點位數據在地圖上創建標記點
     */
    const addMarkers = () => {
      // 檢查地圖實例和數據是否準備就緒
      if (!mapRef.value?.leafletObject || !mapPoints.value.length) {
        return
      }

      console.log('添加標記:', mapPoints.value.length, '個點位')

      // 遍歷所有點位數據，創建標記
      mapPoints.value.forEach((point, index) => {
        /**
         * 使用原生 Leaflet API 創建標記
         * 優點：
         * - 更穩定可靠
         * - 完全支援 Leaflet 的所有功能
         * - 避免 Vue 組件層的潛在問題
         */
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

        // 將標記加入管理陣列
        markers.value.push(marker)
        
        console.log(`標記 ${index + 1} 已添加:`, point.name, [point.position.lat, point.position.lng])
      })
    }

    // ------------------------------------------------------------------------
    // 服務範圍圓形管理
    // ------------------------------------------------------------------------

    /**
     * 創建服務範圍圓形
     * @param {L.LatLng} latlng - 點擊位置的座標
     * @description 在點擊位置創建半徑5公里的服務範圍圓
     */
    const createServiceCircle = (latlng) => {
      console.log('🎯 創建服務範圍圓')
      console.log('座標：', latlng.lat, latlng.lng)

      // 使用響應式數據控制圓形顯示
      serviceCircleData.value = {
        visible: true,
        center: [latlng.lat, latlng.lng],
        radius: 2000,  // 2km半徑
        color: '#ff6b6b',
        fillColor: '#ff6b6b',
        fillOpacity: 0.2,
        weight: 3,
        opacity: 1,
        area: (Math.PI * 2 * 2).toFixed(2),  // 2km半徑的面積
        showPopup: true  // 立即顯示彈窗
      }

      console.log('✅ 圓形已通過響應式數據創建，彈窗已打開')

      // 移動地圖到圓形位置以確保可見性
      const map = mapRef.value?.leafletObject
      if (map) {
        setTimeout(() => {
          map.setView([latlng.lat, latlng.lng], Math.max(map.getZoom(), 12))
        }, 100)
      }
    }

    /**
     * 清除服務範圍圓
     * @description 從地圖上移除當前的服務範圍圓形
     */
    const clearServiceCircle = () => {
      console.log('🗑️ 清除服務範圍圓')
      
      // 使用響應式數據隱藏圓形
      serviceCircleData.value.visible = false
      
      // 清除 store 中的狀態
      mapStore.clearServiceCircle()
      
      console.log('✅ 服務範圍圓已清除')
    }

    // ------------------------------------------------------------------------
    // 數據監聽
    // ------------------------------------------------------------------------
    
    /**
     * 監聽點位數據變化
     * @description 當 store 中的點位數據更新時，重新渲染標記
     */
    watch(mapPoints, () => {
      console.log('點位數據變化，重新添加標記')
      clearMarkers() // 先清除舊標記
      addMarkers()   // 再添加新標記
    })

    // ------------------------------------------------------------------------
    // 生命週期鉤子
    // ------------------------------------------------------------------------
    
    /**
     * 組件掛載完成
     * @description 等待地圖初始化後添加標記
     */
    onMounted(() => {
      console.log('🚀 地圖組件已掛載，等待地圖初始化...')
      
      // 使用更可靠的方式等待地圖準備
      const waitForMap = () => {
        if (mapRef.value?.leafletObject) {
          console.log('✅ 地圖實例已準備，開始初始化功能...')
          
          const map = mapRef.value.leafletObject
          
          // 確保地圖容器有效
          map.whenReady(() => {
            console.log('🗺️ 地圖完全準備就緒')
            
            // 添加醫療院所標記
            addMarkers()
            
            console.log('🎉 地圖初始化完成！')
          })
        } else {
          console.log('⏳ 等待地圖實例準備...')
          setTimeout(waitForMap, 200)
        }
      }
      
      // 開始等待地圖準備
      waitForMap()
    })

    // ------------------------------------------------------------------------
    // 右鍵選單處理
    // ------------------------------------------------------------------------

    /**
     * 處理右鍵點擊事件
     * @param {MouseEvent} e - 滑鼠事件
     * @description 顯示右鍵選單
     */
    const handleRightClick = (e) => {
      console.log('🖱️ 右鍵點擊地圖')
      
      // 手動阻止默認的右鍵選單行為
      if (e.originalEvent && e.originalEvent.preventDefault) {
        e.originalEvent.preventDefault()
      }
      
      // 隱藏現有選單
      hideContextMenu()
      
      // 獲取地圖實例
      const map = mapRef.value?.leafletObject
      if (!map) return
      
      // 獲取滑鼠位置相對於地圖容器的座標
      const containerPoint = map.mouseEventToContainerPoint(e.originalEvent)
      
      // 獲取地理座標
      const latlng = map.containerPointToLatLng(containerPoint)
      
      console.log('右鍵點擊座標：', latlng)
      
      // 顯示右鍵選單
      contextMenu.value = {
        visible: true,
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        clickLatLng: latlng
      }
    }

    /**
     * 加入服務範圍圓
     * @description 在右鍵點擊位置創建服務範圍圓
     */
    const addServiceCircle = () => {
      console.log('🎯 從右鍵選單創建服務範圍圓')
      
      const latlng = contextMenu.value.clickLatLng
      if (!latlng) {
        console.error('❌ 無法獲取右鍵點擊座標')
        return
      }
      
      // 隱藏選單
      hideContextMenu()
      
      // 在點擊位置創建服務範圍圓
      createServiceCircle(latlng)
      
      // 更新 store 中的服務範圍圓資訊
      mapStore.setServiceCircle(latlng, 2000)  // 2km半徑
      
      console.log('✅ 服務範圍圓已從右鍵選單創建')
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
        clickLatLng: null
      }
    }

    // ------------------------------------------------------------------------
    // 暴露給父組件的方法
    // ------------------------------------------------------------------------
    
    /**
     * 暴露組件方法給父組件使用
     * @description 使用 defineExpose 將內部方法暴露，讓父組件可以直接調用
     */
    defineExpose({
      clearServiceCircle   // 清除服務範圍圓的方法
    })

    // ------------------------------------------------------------------------
    // 返回給模板使用的數據和方法
    // ------------------------------------------------------------------------
    return {
      mapRef,               // 地圖組件引用
      mapPoints,            // 點位數據 (用於模板調試)
      clearServiceCircle,   // 清除服務範圍圓的方法
      serviceCircleData,
      contextMenu,
      handleRightClick,     // 右鍵點擊處理
      addServiceCircle,     // 加入服務範圍圓
      hideContextMenu       // 隱藏右鍵選單
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
</style> 