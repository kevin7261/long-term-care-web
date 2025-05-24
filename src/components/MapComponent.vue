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
    -->
    <l-map
      ref="mapRef"
      :zoom="zoom"
      @update:zoom="$emit('update:zoom', $event)"
      :center="center"
      :use-global-leaflet="false"
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
    </l-map>
  </div>
</template>

<script>
// ============================================================================
// 導入依賴模組
// ============================================================================

// Vue 3 Composition API
import { defineComponent, onMounted, ref, computed, watch, defineExpose } from 'vue'

// Vue-Leaflet 組件 (用於地圖容器和圖層)
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet"

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
    LTileLayer // Leaflet 圖層 (底圖)
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
    const serviceCircle = ref(null) // 存儲服務範圍圓形
    const mapClickEnabled = ref(false) // 地圖點擊功能是否啟用

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
      console.log('開始創建服務範圍圓：', latlng)

      // 檢查地圖實例是否準備就緒
      if (!mapRef.value?.leafletObject) {
        console.warn('地圖實例未準備就緒，無法創建服務範圍圓')
        return
      }

      // 檢查座標是否有效
      if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') {
        console.warn('無效的座標數據：', latlng)
        return
      }

      const map = mapRef.value.leafletObject

      try {
        // 移除舊的圓形（如果存在）
        if (serviceCircle.value) {
          console.log('移除舊的服務範圍圓')
          map.removeLayer(serviceCircle.value)
          serviceCircle.value = null
        }

        // 確保地圖有有效的視圖和縮放級別
        if (!map.getZoom() || map.getZoom() < 1) {
          console.warn('地圖縮放級別無效，設置默認縮放')
          map.setView(latlng, 13)
        }

        // 等待地圖完全準備好
        setTimeout(() => {
          try {
            console.log('創建新的服務範圍圓')
            
            // 創建圓形選項
            const circleOptions = {
              radius: 5000,              // 半徑5公里（單位：公尺）
              color: '#ff6b6b',          // 邊框顏色：紅色
              fillColor: '#ff6b6b',      // 填充顏色：紅色
              fillOpacity: 0.2,          // 填充透明度：20%
              weight: 2,                 // 邊框寬度：2px
              opacity: 0.8,              // 邊框透明度：80%
              interactive: true          // 可互動
            }

            // 創建圓形
            serviceCircle.value = L.circle([latlng.lat, latlng.lng], circleOptions)
            
            // 檢查圓形是否創建成功
            if (serviceCircle.value) {
              // 添加到地圖
              serviceCircle.value.addTo(map)
              
              // 綁定彈出框
              const popupContent = `
                <div style="text-align: center;">
                  <strong>🎯 服務範圍</strong><br>
                  <small>📍 中心座標：${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}</small><br>
                  <small>📏 服務半徑：5 公里</small><br>
                  <small>📐 覆蓋面積：約 ${(Math.PI * 5 * 5).toFixed(1)} 平方公里</small>
                </div>
              `
              
              serviceCircle.value.bindPopup(popupContent)

              console.log('✅ 服務範圍圓創建成功：', {
                中心座標: [latlng.lat, latlng.lng],
                半徑: '5公里',
                面積: (Math.PI * 5 * 5).toFixed(1) + '平方公里'
              })

              // 可選：讓地圖移動到圓形位置
              // map.setView(latlng, map.getZoom())

            } else {
              console.error('圓形創建失敗：serviceCircle 為 null')
            }

          } catch (innerError) {
            console.error('內部圓形創建錯誤：', innerError)
            
            // 嘗試清理
            if (serviceCircle.value) {
              try {
                map.removeLayer(serviceCircle.value)
              } catch (removeError) {
                console.error('清理圓形時出錯：', removeError)
              }
              serviceCircle.value = null
            }
          }
        }, 200) // 延遲200ms確保地圖準備好

      } catch (error) {
        console.error('創建服務範圍圓時發生錯誤：', error)
        // 清理可能的殘留狀態
        if (serviceCircle.value) {
          serviceCircle.value = null
        }
      }
    }

    /**
     * 處理地圖點擊事件
     * @param {L.LeafletMouseEvent} e - Leaflet 滑鼠事件
     * @description 當用戶點擊地圖時，在該位置創建服務範圍圓
     */
    const handleMapClick = (e) => {
      console.log('🔥 地圖點擊事件觸發')
      console.log('地圖點擊狀態：', mapClickEnabled.value)
      
      // 檢查地圖點擊功能是否已啟用
      if (!mapClickEnabled.value) {
        console.log('⚠️ 地圖點擊功能未啟用，忽略點擊事件')
        return
      }

      const { latlng } = e
      console.log('✅ 地圖被點擊，座標：', [latlng.lat, latlng.lng])
      
      // 在點擊位置創建服務範圍圓
      createServiceCircle(latlng)
      
      // 更新 store 中的服務範圍圓資訊
      mapStore.setServiceCircle(latlng, 5000)
      
      console.log('📍 服務範圍圓資訊已更新到 store')
    }

    /**
     * 初始化地圖點擊監聽器
     * @description 為地圖添加點擊事件監聽器
     */
    const initMapClickListener = () => {
      if (!mapRef.value?.leafletObject) {
        console.warn('地圖實例未準備就緒，無法初始化點擊監聽器')
        return
      }

      const map = mapRef.value.leafletObject
      
      // 確保地圖完全準備好後再綁定事件
      map.whenReady(() => {
        console.log('🎯 初始化地圖點擊監聽器')
        
        // 移除可能已存在的點擊事件監聽器
        map.off('click', handleMapClick)
        
        // 綁定地圖點擊事件
        map.on('click', handleMapClick)
        
        console.log('✅ 地圖點擊功能監聽器已綁定 - 等待用戶啟用功能')
      })
    }

    /**
     * 清除服務範圍圓
     * @description 從地圖上移除當前的服務範圍圓形
     */
    const clearServiceCircle = () => {
      if (serviceCircle.value && mapRef.value?.leafletObject) {
        console.log('清除服務範圍圓')
        
        // 從地圖中移除圓形
        mapRef.value.leafletObject.removeLayer(serviceCircle.value)
        
        // 清空引用
        serviceCircle.value = null
        
        // 清除 store 中的狀態
        mapStore.clearServiceCircle()
        
        console.log('✅ 服務範圍圓已清除')
      }
    }

    /**
     * 設置地圖點擊功能狀態
     * @param {boolean} enabled - 是否啟用地圖點擊功能
     * @description 控制是否可以點擊地圖創建服務範圍圓
     */
    const setMapClickEnabled = (enabled) => {
      mapClickEnabled.value = enabled
      console.log('🎛️ 地圖點擊功能已', enabled ? '✅ 啟用' : '❌ 停用')
      
      if (enabled) {
        console.log('💡 提示：現在可以點擊地圖任意位置創建5km服務範圍圓')
      } else {
        console.log('💡 提示：地圖點擊功能已關閉')
      }
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
     * @description 等待地圖初始化後添加標記和點擊監聽器
     */
    onMounted(() => {
      console.log('地圖組件已掛載')
      
      /**
       * 等待地圖完全初始化的函數
       * @description 遞歸檢查地圖是否準備就緒
       */
      const waitForMapReady = () => {
        if (mapRef.value?.leafletObject) {
          const map = mapRef.value.leafletObject
          
          // 檢查地圖是否已經有有效的尺寸
          if (map.getContainer() && map.getSize() && map.getSize().x > 0) {
            console.log('地圖實例準備就緒')
            
            // 使用 whenReady 確保地圖完全準備好
            map.whenReady(() => {
              // 添加醫療院所標記
              addMarkers()
              
              // 初始化地圖點擊監聽器
              initMapClickListener()
              
              console.log('✅ 地圖初始化完成')
            })
          } else {
            // 地圖尺寸還沒有準備好，繼續等待
            setTimeout(waitForMapReady, 100)
          }
        } else {
          // 地圖實例還沒有創建，繼續等待
          setTimeout(waitForMapReady, 100)
        }
      }
      
      // 開始等待地圖準備
      waitForMapReady()
    })

    // ------------------------------------------------------------------------
    // 暴露給父組件的方法
    // ------------------------------------------------------------------------
    
    /**
     * 暴露組件方法給父組件使用
     * @description 使用 defineExpose 將內部方法暴露，讓父組件可以直接調用
     */
    defineExpose({
      clearServiceCircle,  // 清除服務範圍圓的方法
      setMapClickEnabled   // 設置地圖點擊功能狀態的方法
    })

    // ------------------------------------------------------------------------
    // 返回給模板使用的數據和方法
    // ------------------------------------------------------------------------
    return {
      mapRef,               // 地圖組件引用
      mapPoints,            // 點位數據 (用於模板調試)
      clearServiceCircle,   // 清除服務範圍圓的方法
      setMapClickEnabled    // 設置地圖點擊功能狀態的方法
    }
  }
})
</script> 