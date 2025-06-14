<template>
  <div id="map-container" class="h-100 w-100 position-relative">
    <!-- 🗺️ 地圖容器 -->
    <div id="leaflet-map" ref="mapContainer" class="h-100 w-100"></div>

    <!-- ✨ 新的底部中央地圖控制項 ✨ -->
    <div class="map-bottom-controls">
      <div class="basemap-select-group">
        <label for="basemap-select" class="form-label mb-0 small fw-medium me-2">底圖:</label>
        <select 
          id="basemap-select"
          class="form-select form-select-sm" 
          v-model="selectedBasemap" 
          @change="changeBasemap"
          style="width: auto; min-width: 120px;">
          <option value="osm">OpenStreetMap</option>
          <option value="esri_street">Esri Street</option>
          <option value="esri_topo">Esri Topo</option>
          <option value="esri_imagery">Esri World Imagery</option>
          <option value="google_road">Google Maps 街道</option>
          <option value="google_satellite">Google Maps 衛星</option>
          <option value="nlsc_emap">國土規劃中心電子地圖</option>
          <option value="nlsc_photo">國土規劃中心正射影像</option>
          <option value="terrain">地形圖</option>
          <option value="aerial">空照圖 (Esri)</option>
          <option value="blank">空白無地圖</option>
        </select>
      </div>
      <button 
        class="btn btn-outline-primary btn-sm"
        @click="showAllFeatures"
        :disabled="!tainanGeoJSONData || !showTainanLayer"
        title="顯示全部資料範圍">
        顯示全部
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getColorByCount } from '../utils/dataProcessor.js'

// 修復 Leaflet 默認圖標問題
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
})

export default {
  name: 'MapView',
  props: {
    showTainanLayer: { type: Boolean, default: false },
    selectedFilter: { type: String, default: '' },
    selectedColorScheme: { type: String, default: 'viridis' },
    selectedBorderColor: { type: String, default: '#666666' },
    selectedBorderWeight: { type: Number, default: 1 },
    zoomLevel: { type: Number, default: 10 },
    tainanGeoJSONData: { type: Object, default: null },
    maxCount: { type: Number, default: 0 }
  },
  emits: ['update:zoomLevel', 'update:currentCoords', 'update:activeMarkers'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const mapStatus = ref('初始化中...')
    const selectedBasemap = ref('osm')
    
    let map = null
    let tainanLayer = null
    let currentTileLayer = null
    
    // 底圖配置
    const basemaps = {
      osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      esri_street: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
      },
      esri_topo: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
      },
      esri_imagery: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      },
      google_road: {
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        attribution: '© Google',
        note: 'Google Maps 僅供學術/測試用途，正式產品請用官方 API。'
      },
      google_satellite: {
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        attribution: '© Google',
        note: 'Google Maps 僅供學術/測試用途，正式產品請用官方 API。'
      },
      nlsc_emap: {
        url: 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}',
        attribution: '© 國土測繪中心(NLSC) 電子地圖'
      },
      nlsc_photo: {
        url: 'https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}',
        attribution: '© 國土測繪中心(NLSC) 正射影像'
      },
      terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      },
      aerial: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      },
      blank: {
        url: '',
        attribution: ''
      }
    }
    
    // 初始化地圖
    const initMap = () => {
      if (map) {
        console.log('地圖已存在，跳過初始化')
        return
      }
      
      try {
        console.log('開始初始化地圖...')
        mapStatus.value = '創建地圖實例...'
        
        // 創建地圖
        map = L.map(mapContainer.value, {
          center: [25.0330, 121.5654], // 台北市中心
          zoom: props.zoomLevel,
          zoomControl: false, // 先禁用默認的縮放控件
          attributionControl: false // 禁用版權資訊
        })
        
        // 手動添加縮放控件到右下角
        L.control.zoom({ position: 'bottomright' }).addTo(map)
        
        mapStatus.value = '載入底圖...'
        
        // 載入初始底圖
        loadBasemap()
        
        // 地圖事件
        map.on('zoomend', () => {
          emit('update:zoomLevel', map.getZoom())
        })
        
        map.on('moveend', () => {
          const center = map.getCenter()
          emit('update:currentCoords', { lat: center.lat, lng: center.lng })
        })
        
        mapStatus.value = '地圖已就緒'
        console.log('地圖初始化完成')
        
      } catch (error) {
        console.error('地圖初始化錯誤:', error)
        mapStatus.value = '初始化失敗: ' + error.message
      }
    }
    
    // 載入底圖
    const loadBasemap = () => {
      if (currentTileLayer) {
        map.removeLayer(currentTileLayer)
        currentTileLayer = null
      }
      
      const basemapConfig = basemaps[selectedBasemap.value]
      
      if (selectedBasemap.value === 'blank' || !basemapConfig || !basemapConfig.url) {
        console.log('底圖已切換至: 空白無地圖')
        if (map.attributionControl) {
          map.attributionControl.setPrefix('');
        }
        return;
      }
      
      currentTileLayer = L.tileLayer(basemapConfig.url, {
        attribution: basemapConfig.attribution,
        subdomains: basemapConfig.subdomains || 'abc',
        maxZoom: 18
      })
      
      currentTileLayer.addTo(map)
      console.log(`底圖已切換至: ${selectedBasemap.value}`)
      if (basemapConfig.note) {
        console.warn(basemapConfig.note);
      }
    }
    
    // 切換底圖
    const changeBasemap = () => {
      if (map) {
        loadBasemap()
      }
    }
    
    // 創建台南圖層
    const createTainanLayer = () => {
      console.log('開始創建圖層...', { 
        hasData: !!props.tainanGeoJSONData,
        showLayer: props.showTainanLayer
      })

      if (tainanLayer) {
        console.log('移除現有圖層')
        map.removeLayer(tainanLayer)
        tainanLayer = null
      }

      if (props.tainanGeoJSONData && props.showTainanLayer) {
        try {
          tainanLayer = L.geoJSON(props.tainanGeoJSONData, {
            style: (feature) => {
              const count = feature.properties.中位數 || 0
              return {
                fillColor: getColorByCount(count, props.maxCount, props.selectedColorScheme),
                weight: props.selectedBorderWeight,
                opacity: 1,
                color: props.selectedBorderColor,
                fillOpacity: 0.7
              }
            },
            onEachFeature: (feature, layer) => {
              const name = feature.properties.PTVNAME || '未知區域'
              const count = feature.properties.中位數 || 0
              
              // 綁定彈出視窗
              const popupContent = `
                <div class="map-popup">
                  <h6 class="text-primary mb-2">${name}</h6>
                  <p class="mb-1">中位數: ${count.toLocaleString()}</p>
                </div>
              `
              layer.bindPopup(popupContent)
              
              // 綁定工具提示
              layer.bindTooltip(`${name}: ${count}`, {
                permanent: false,
                direction: 'center',
                className: 'custom-tooltip'
              })
              
              // 滑鼠事件處理
              layer.on({
                mouseover: function(e) {
                  const layer = e.target
                  layer.setStyle({
                    weight: 3,
                    color: '#333',
                    fillOpacity: 0.8
                  })
                  layer.bringToFront()
                },
                mouseout: function(e) {
                  tainanLayer.resetStyle(e.target)
                },
                click: function(e) {
                  const layer = e.target
                  const name = layer.feature.properties.PTVNAME
                  const center = layer.getBounds().getCenter()
                  
                  // 移動到畫面中間
                  map.panTo(center, {
                    animate: true,
                    duration: 0.5
                  })
                  
                  emit('update:currentCoords', { lat: center.lat, lng: center.lng })
                  
                  console.log(`點擊區域: ${name}`)
                }
              })
            }
          })
          
          tainanLayer.addTo(map)
          
          const featureCount = props.tainanGeoJSONData.features ? props.tainanGeoJSONData.features.length : 0
          emit('update:activeMarkers', featureCount)
          
          console.log(`圖層創建完成，包含 ${featureCount} 個區域`)
          
        } catch (error) {
          console.error('創建圖層錯誤:', error)
        }
      } else {
        emit('update:activeMarkers', 0)
      }
    }
    
    // 顯示所有要素
    const showAllFeatures = () => {
      if (map && tainanLayer) {
        try {
          const bounds = tainanLayer.getBounds()
          if (bounds.isValid()) {
            // 只移動到中心點，不縮放
            map.panTo(bounds.getCenter())
          }
        } catch (error) {
          console.error('顯示全部功能錯誤:', error)
        }
      }
    }
    
    // 高亮功能
    const highlightFeature = (name) => {
      console.log('開始高亮顯示:', { name, tainanLayer: !!tainanLayer })
      
      if (!tainanLayer) {
        console.warn('無法高亮顯示：tainanLayer 未定義')
        return
      }
      
      if (!name) {
        console.warn('無法高亮顯示：名稱為空')
        return
      }

      // 重置所有圖層樣式
      tainanLayer.eachLayer((layer) => {
        tainanLayer.resetStyle(layer)
      })

      // 查找並高亮指定區域
      let found = false
      tainanLayer.eachLayer((layer) => {
        const feature = layer.feature
        console.log('檢查區域:', { 
          featureName: feature?.properties?.PTVNAME,
          targetName: name,
          match: feature?.properties?.PTVNAME === name
        })
        
        if (feature?.properties?.PTVNAME === name) {
          found = true
          
          // 設置高亮樣式
          layer.setStyle({
            weight: 4,
            color: '#ff0000',
            dashArray: '5,5',
            fillOpacity: 0.9
          })
          
          // 移動到該區域
          const bounds = layer.getBounds()
          map.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1.0
          })
          
          // 顯示彈出視窗
          layer.openPopup()
        }
      })

      if (!found) {
        console.warn(`未找到區域：${name}`)
      }
    }
    
    // 重置視圖
    const resetView = () => {
      if (map) {
        map.setView([22.9908, 120.2133], 10)
        console.log('地圖視圖已重置')
      }
    }
    
    // 適應台南邊界
    const fitToTainanBounds = () => {
      if (map && tainanLayer) {
        map.fitBounds(tainanLayer.getBounds())
        console.log('地圖已適應台南邊界')
      }
    }
    
    // 刷新地圖大小
    const invalidateSize = () => {
      if (map) {
        nextTick(() => {
          map.invalidateSize()
          console.log('地圖大小已刷新')
        })
      }
    }
    
    // 監聽屬性變化
    watch(() => props.showTainanLayer, () => {
      console.log('台南圖層顯示狀態變更:', props.showTainanLayer)
      createTainanLayer()
    })
    
    watch(() => props.tainanGeoJSONData, () => {
      console.log('台南GeoJSON數據變更')
      createTainanLayer()
    })
    
    watch(() => props.selectedColorScheme, () => {
      console.log('色票方案變更:', props.selectedColorScheme)
      createTainanLayer()
    })
    
    watch(() => props.maxCount, () => {
      console.log('最大計數值變更:', props.maxCount)
      createTainanLayer()
    })
    
    watch(() => props.selectedBorderColor, () => {
      console.log('框線顏色變更:', props.selectedBorderColor);
      createTainanLayer();
    });

    watch(() => props.selectedBorderWeight, () => {
      console.log('框線粗細變更:', props.selectedBorderWeight);
      createTainanLayer();
    });
    
    watch(() => props.zoomLevel, (newZoom) => {
      if (map && map.getZoom() !== newZoom) {
        map.setZoom(newZoom)
      }
    })
    
    // 組件掛載
    onMounted(() => {
      console.log('MapView 組件已掛載')
      nextTick(() => {
        initMap()
        createTainanLayer()
      })
    })
    
    // 組件卸載
    onUnmounted(() => {
      if (map) {
        map.remove()
        map = null
        console.log('地圖已清理')
      }
    })
    
    return {
      mapContainer,
      mapStatus,
      selectedBasemap,
      changeBasemap,
      highlightFeature,
      resetView,
      fitToTainanBounds,
      invalidateSize,
      showAllFeatures
    }
  }
}
</script>

<style scoped>
/* 地圖容器樣式 */
#map-container {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #f0f0f0; /* Fallback background */
}

#leaflet-map {
  height: 100% !important; /* Ensure Leaflet map takes full dimensions */
  width: 100% !important;
  z-index: 1; /* Base z-index for the map */
}

/* ✨ 新的底部中央地圖控制項樣式 ✨ */
.map-bottom-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000; /* Above map tiles */
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.basemap-select-group {
  display: flex;
  align-items: center;
}

/* 自定義工具提示樣式 */
:global(.custom-tooltip) {
  background-color: rgba(0, 0, 0, 0.8) !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  color: white !important;
  font-size: 12px !important;
  padding: 4px 8px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
}

/* 地圖彈出視窗樣式 */
:global(.map-popup) {
  font-family: 'Noto Sans TC', sans-serif;
  min-width: 200px;
}

:global(.map-popup h6) {
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

:global(.map-popup .badge) {
  font-size: 11px;
}

/* Leaflet 控制項樣式覆蓋 */
:global(.leaflet-control-zoom a) {
  background-color: white !important;
  border-color: #ccc !important;
  color: #333 !important;
}

:global(.leaflet-control-zoom a:hover) {
  background-color: #f4f4f4 !important;
}

:global(.leaflet-control-attribution) {
  background-color: rgba(255, 255, 255, 0.8) !important;
  color: #333 !important;
  font-size: 11px !important;
}
</style> 