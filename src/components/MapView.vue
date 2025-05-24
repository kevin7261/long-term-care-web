<template>
  <!-- 
    主地圖視圖組件 (MapView)
    
    功能：
    - 響應式佈局：桌面版左右分欄，手機版上下分欄
    - 可拖拽調整面板大小
    - 整合地圖組件和控制面板
    - 管理地圖縮放和中心點
    - 顯示十字準心標記
  -->
  <div class="map-container" :class="{ 'vertical-layout': isVerticalLayout }">
    
    <!-- 垂直佈局：手機版 (寬度 < 1200px) -->
    <template v-if="isVerticalLayout">
      <!-- 地圖組件 (上方) -->
      <MapComponent
        v-model:zoom="zoom"
        :center="center"
        ref="mapRef"
      />
      
      <!-- 垂直拖拽條 -->
      <div 
        class="resizer vertical-resizer"
        @mousedown="handleDragStart(true)"
        title="拖拽調整面板高度"
      ></div>
      
      <!-- 控制面板 (下方) -->
      <ControlPanel
        :error-message="errorMessage"
        :csv-data="csvData"
        :csv-headers="csvHeaders"
        :map-click-enabled="mapClickEnabled"
        :style="{ height: sidebarHeight + 'px' }"
        @load-csv="loadCSV"
        @clear-service-circle="handleClearServiceCircle"
        @toggle-map-click="toggleMapClick"
      />
    </template>
    
    <!-- 水平佈局：桌面版 (寬度 >= 1200px) -->
    <template v-else>
      <!-- 控制面板 (左側) -->
      <ControlPanel
        :error-message="errorMessage"
        :csv-data="csvData"
        :csv-headers="csvHeaders"
        :map-click-enabled="mapClickEnabled"
        :style="{ width: sidebarWidth + 'px' }"
        @load-csv="loadCSV"
        @clear-service-circle="handleClearServiceCircle"
        @toggle-map-click="toggleMapClick"
      />
      
      <!-- 水平拖拽條 -->
      <div 
        class="resizer"
        @mousedown="handleDragStart(false)"
        title="拖拽調整面板寬度"
      ></div>
      
      <!-- 地圖組件 (右側) -->
      <MapComponent
        v-model:zoom="zoom"
        :center="center"
        ref="mapRef"
      />
    </template>
  </div>
</template>

<script setup>
// ============================================================================
// 導入依賴模組
// ============================================================================

// Vue 3 Composition API
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Leaflet 相關
import "leaflet/dist/leaflet.css"
import L from 'leaflet'

// Store 和組件
import { useMapStore } from '../stores/mapStore'
import MapComponent from './MapComponent.vue'
import ControlPanel from './ControlPanel.vue'

// ============================================================================
// 狀態管理
// ============================================================================

// Pinia Store 實例
const mapStore = useMapStore()

// ============================================================================
// 響應式佈局狀態
// ============================================================================

/**
 * 佈局相關的響應式數據
 * - isVerticalLayout: 是否為垂直佈局 (手機版)
 * - sidebarWidth: 側邊欄寬度 (桌面版)
 * - sidebarHeight: 側邊欄高度 (手機版)
 * - isDragging: 是否正在拖拽
 * - windowWidth: 視窗寬度
 */
const isVerticalLayout = ref(window.innerWidth < 1200)  // 斷點：1200px
const sidebarWidth = ref(300)     // 預設寬度：300px
const sidebarHeight = ref(300)    // 預設高度：300px
const isDragging = ref(false)     // 拖拽狀態
const windowWidth = ref(window.innerWidth)  // 視窗寬度

// ============================================================================
// 地圖狀態
// ============================================================================

/**
 * 地圖相關的響應式數據
 * - zoom: 縮放等級
 * - center: 地圖中心點 (台北市中心)
 * - mapRef: 地圖組件引用
 * - crosshairMarker: 十字準心標記
 * - mapClickEnabled: 地圖點擊功能是否啟用
 */
const zoom = ref(13)  // 初始縮放等級
const center = ref([25.0330, 121.5654])  // 台北市中心座標
const mapRef = ref(null)           // 地圖組件引用
const crosshairMarker = ref(null)  // 十字準心標記引用
const mapClickEnabled = ref(false) // 地圖點擊功能是否啟用

// ============================================================================
// 計算屬性 - 從 Store 獲取數據
// ============================================================================

/**
 * 從 mapStore 獲取響應式數據
 * 這些計算屬性會自動響應 store 中數據的變化
 */
const csvData = computed(() => mapStore.filteredData)      // 篩選後的 CSV 數據
const csvHeaders = computed(() => mapStore.csvHeaders)     // CSV 表頭
const errorMessage = computed(() => mapStore.errorMessage) // 錯誤訊息

// ============================================================================
// 十字準心圖標設置
// ============================================================================

/**
 * 創建十字準心圖標
 * 使用 Leaflet 的 divIcon 創建自定義圖標
 * 樣式在 map.css 中定義
 */
const crosshairIcon = L.divIcon({
  className: 'crosshair-icon',     // CSS 類名
  html: '<div class="crosshair"></div>',  // HTML 內容
  iconSize: [20, 20],              // 圖標大小
  iconAnchor: [10, 10]             // 錨點位置 (中心)
})

// ============================================================================
// 事件處理函數
// ============================================================================

/**
 * 切換地圖點擊功能
 * @description 啟用或停用地圖點擊創建服務範圍圓的功能
 */
const toggleMapClick = () => {
  mapClickEnabled.value = !mapClickEnabled.value
  
  console.log('地圖點擊功能：', mapClickEnabled.value ? '已啟用' : '已停用')
  
  // 通知地圖組件更新點擊監聽器狀態
  if (mapRef.value) {
    mapRef.value.setMapClickEnabled(mapClickEnabled.value)
  }
}

/**
 * 載入 CSV 數據
 * @description 調用 store 中的 loadCSV 方法
 */
const loadCSV = () => {
  console.log('開始載入 CSV 數據...')
  mapStore.loadCSV()
}

/**
 * 清除服務範圍圓
 * @description 調用 store 中的 clearServiceCircle 方法並清除地圖上的圓形
 */
const handleClearServiceCircle = () => {
  console.log('清除服務範圍圓...')
  
  // 清除 store 中的狀態
  mapStore.clearServiceCircle()
  
  // 如果地圖組件可用，通知它清除圓形
  if (mapRef.value) {
    mapRef.value.clearServiceCircle()
  }
}

// ============================================================================
// 響應式佈局處理
// ============================================================================

/**
 * 處理視窗大小變化
 * @description 當視窗大小改變時，調整佈局和面板尺寸
 */
const handleResize = () => {
  // 更新視窗寬度
  windowWidth.value = window.innerWidth
  
  // 根據視窗寬度決定佈局方式
  isVerticalLayout.value = windowWidth.value < 1200
  
  if (isVerticalLayout.value) {
    // 垂直佈局：調整高度限制
    const minHeight = window.innerHeight * 0.1  // 最小高度：10%
    const maxHeight = window.innerHeight * 0.9  // 最大高度：90%
    
    // 確保面板高度在合理範圍內
    if (sidebarHeight.value < minHeight) {
      sidebarHeight.value = minHeight
    } else if (sidebarHeight.value > maxHeight) {
      sidebarHeight.value = maxHeight
    }
  } else {
    // 水平佈局：調整寬度限制
    const minWidth = windowWidth.value * 0.1   // 最小寬度：10%
    const maxWidth = windowWidth.value * 0.9   // 最大寬度：90%
    
    // 確保面板寬度在合理範圍內
    if (sidebarWidth.value < minWidth) {
      sidebarWidth.value = minWidth
    } else if (sidebarWidth.value > maxWidth) {
      sidebarWidth.value = maxWidth
    }
  }
}

// ============================================================================
// 拖拽功能處理
// ============================================================================

/**
 * 開始拖拽
 * @param {boolean} isVertical - 是否為垂直拖拽 (調整高度)
 * @description 初始化拖拽狀態，綁定滑鼠事件
 */
const handleDragStart = (isVertical = false) => {
  isDragging.value = true
  
  // 綁定滑鼠移動和釋放事件
  document.addEventListener('mousemove', (e) => handleDrag(e, isVertical))
  document.addEventListener('mouseup', handleDragEnd)
  
  console.log('開始拖拽:', isVertical ? '垂直' : '水平')
}

/**
 * 處理拖拽過程
 * @param {MouseEvent} e - 滑鼠事件
 * @param {boolean} isVertical - 是否為垂直拖拽
 * @description 根據滑鼠位置實時調整面板尺寸
 */
const handleDrag = (e, isVertical) => {
  if (!isDragging.value) return
  
  if (isVertical) {
    // 垂直拖拽：調整面板高度
    const minHeight = window.innerHeight * 0.1
    const maxHeight = window.innerHeight * 0.9
    
    // 計算新高度 (從底部往上計算)
    const newHeight = window.innerHeight - e.clientY
    
    // 限制在合理範圍內
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      sidebarHeight.value = newHeight
    }
  } else {
    // 水平拖拽：調整面板寬度
    const minWidth = windowWidth.value * 0.1
    const maxWidth = windowWidth.value * 0.9
    
    // 計算新寬度 (從左邊計算)
    const newWidth = e.clientX
    
    // 限制在合理範圍內
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth
    }
  }
}

/**
 * 結束拖拽
 * @description 清理拖拽狀態，移除事件監聽器
 */
const handleDragEnd = () => {
  isDragging.value = false
  
  // 移除事件監聽器
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', handleDragEnd)
  
  console.log('拖拽結束')
}

// ============================================================================
// 十字準心標記管理
// ============================================================================

/**
 * 監聽地圖組件變化，管理十字準心標記
 * @description 當地圖組件準備就緒時，添加十字準心標記
 */
watch(mapRef, (newMap) => {
  if (newMap && newMap.leafletObject) {
    console.log('地圖實例可用，添加十字準心標記')
    
    // 移除舊的十字準心標記
    if (crosshairMarker.value) {
      crosshairMarker.value.remove()
    }
    
    // 創建新的十字準心標記
    crosshairMarker.value = L.marker(center.value, {
      icon: crosshairIcon,       // 使用自定義圖標
      interactive: false,        // 不可互動 (不會觸發點擊事件)
      zIndexOffset: 1000         // 高層級，確保在其他標記之上
    }).addTo(newMap.leafletObject)
    
    console.log('十字準心標記已添加')
  }
})

// ============================================================================
// 生命週期鉤子
// ============================================================================

/**
 * 組件掛載完成
 * @description 初始化視窗大小監聽和佈局設置
 */
onMounted(() => {
  console.log('MapView 組件已掛載')
  
  // 綁定視窗大小變化事件
  window.addEventListener('resize', handleResize)
  
  // 執行初始化佈局計算
  handleResize()
})

/**
 * 組件卸載前清理
 * @description 移除事件監聽器，避免記憶體洩漏
 */
onUnmounted(() => {
  console.log('MapView 組件即將卸載')
  
  // 移除視窗大小變化監聽器
  window.removeEventListener('resize', handleResize)
})
</script> 