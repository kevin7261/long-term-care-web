// ============================================================================
// 地圖數據管理 Store (mapStore.js)
// ============================================================================

/**
 * 功能說明：
 * - 管理 CSV 數據的載入和解析
 * - 管理 GeoJSON 數據的載入和顏色繪製
 * - 處理 WKT 地理座標格式轉換
 * - 篩選和管理醫療院所點位數據
 * - 提供響應式的地圖數據給組件使用
 * - 管理服務範圍圓的資訊
 */

// ============================================================================
// 導入依賴模組
// ============================================================================

import { defineStore } from 'pinia'        // Pinia 狀態管理
import { ref } from 'vue'                  // Vue 3 響應式 API
import Papa from 'papaparse'               // CSV 解析庫

// ============================================================================
// Store 定義
// ============================================================================

export const useMapStore = defineStore('mapStore', () => {
  
  // --------------------------------------------------------------------------
  // 響應式狀態數據
  // --------------------------------------------------------------------------
  
  const csvRaw = ref([])        // 原始 CSV 數據 (未處理)
  const csvHeaders = ref([])    // CSV 表頭欄位名稱
  const filteredData = ref([])  // 篩選後的數據 (符合條件的醫療院所)
  const mapPoints = ref([])     // 處理後的地圖點位數據
  const errorMessage = ref('')  // 錯誤訊息

  // GeoJSON 相關狀態
  const geoJsonData = ref(null)     // GeoJSON 數據
  const geoJsonLayers = ref([])     // GeoJSON 圖層數據
  const colorField = ref('中位數')   // 用於顏色繪製的欄位
  const colorStats = ref({          // 顏色統計資訊
    min: 0,
    max: 0,
    mean: 0
  })

  // 服務範圍圓資訊
  const serviceCircleInfo = ref({
    isActive: false,            // 是否有活動的服務範圍圓
    center: null,               // 圓心座標 { lat, lng }
    radius: 2000,               // 半徑（公尺）- 改為2km
    clickTime: null             // 點擊時間
  })

  // --------------------------------------------------------------------------
  // 工具函數
  // --------------------------------------------------------------------------
  
  /**
   * 解析 WKT (Well-Known Text) Point 字串為座標
   * 
   * @param {string} wktString - WKT 格式的座標字串，例如: "POINT (121.5654 25.0330)"
   * @returns {Object|null} - 座標物件 {lat, lng} 或 null (解析失敗)
   * 
   * WKT 格式說明：
   * - 是地理資訊系統 (GIS) 中常用的座標表示格式
   * - 格式：POINT (經度 緯度)
   * - 注意：經度在前，緯度在後 (與一般習慣相反)
   */
  function parseWKT(wktString) {
    try {
      // 步驟 1：清理字串，移除前後的引號
      const cleanWKT = wktString.replace(/^"|"$/g, '')
      
      console.log('解析 WKT：', {
        原始字串: wktString,
        清理後: cleanWKT
      })

      // 步驟 2：驗證 WKT 格式
      if (!cleanWKT.startsWith('POINT (')) {
        console.error('無效的 WKT 格式：', cleanWKT)
        return null
      }

      // 步驟 3：提取座標字串
      const coordsStr = cleanWKT.replace('POINT (', '').replace(')', '')
      
      // 步驟 4：分割並轉換為數字 (注意：WKT 中是 經度 緯度 的順序)
      const [lng, lat] = coordsStr.split(' ').map(Number)
      
      // 步驟 5：驗證座標數值
      if (isNaN(lat) || isNaN(lng)) {
        console.error('無效的座標值：', { lat, lng })
        return null
      }

      // 步驟 6：檢查座標範圍是否合理
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('座標超出有效範圍：', { lat, lng })
        return null
      }

      console.log('成功解析座標：', { lat, lng })
      return { lat, lng }
      
    } catch (error) {
      console.error('WKT 解析錯誤：', error)
      return null
    }
  }

  /**
   * Viridis 色票函數
   * @param {number} t - 0到1之間的數值
   * @returns {string} - RGB 顏色字串
   */
  function viridis(t) {
    // Viridis 色票的 RGB 值 (簡化版本)
    const colors = [
      [68, 1, 84],      // 深紫色 (0.0)
      [59, 82, 139],    // 深藍色 (0.2)
      [33, 144, 140],   // 青綠色 (0.4)
      [93, 201, 99],    // 綠色 (0.6)
      [253, 231, 37]    // 黃色 (1.0)
    ];
    
    // 確保 t 在 0-1 範圍內
    t = Math.max(0, Math.min(1, t));
    
    // 計算在色票中的位置
    const index = t * (colors.length - 1);
    const i = Math.floor(index);
    const f = index - i;
    
    // 如果在最後一個顏色
    if (i >= colors.length - 1) {
      const color = colors[colors.length - 1];
      return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
    
    // 線性插值計算顏色
    const c1 = colors[i];
    const c2 = colors[i + 1];
    
    const r = Math.round(c1[0] + f * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + f * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + f * (c2[2] - c1[2]));
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * 根據數值計算顏色
   * @param {number} value - 數值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {string} - 顏色字串
   */
  function getColorForValue(value, min, max) {
    if (max === min) return viridis(0.5); // 避免除以零
    
    const normalized = (value - min) / (max - min);
    return viridis(normalized);
  }

  // --------------------------------------------------------------------------
  // 服務範圍圓管理函數
  // --------------------------------------------------------------------------

  /**
   * 設置服務範圍圓資訊
   * @param {Object} latlng - 點擊位置座標 { lat, lng }
   * @param {Number} radius - 圓半徑（公尺），預設 2000
   * @description 更新服務範圍圓的狀態資訊
   */
  function setServiceCircle(latlng, radius = 2000) {
    serviceCircleInfo.value = {
      isActive: true,
      center: {
        lat: latlng.lat,
        lng: latlng.lng
      },
      radius: radius,
      clickTime: new Date().toLocaleString('zh-TW')
    }
    
    console.log('服務範圍圓資訊已更新：', serviceCircleInfo.value)
  }

  /**
   * 清除服務範圍圓資訊
   * @description 重置服務範圍圓的狀態
   */
  function clearServiceCircle() {
    serviceCircleInfo.value = {
      isActive: false,
      center: null,
      radius: 2000,  // 改為2km
      clickTime: null
    }
    
    console.log('服務範圍圓資訊已清除')
  }

  // --------------------------------------------------------------------------
  // 主要功能函數
  // --------------------------------------------------------------------------
  
  /**
   * 載入和解析 CSV 檔案
   * 
   * 處理流程：
   * 1. 從 public/data 目錄載入 CSV 檔案
   * 2. 使用 Papa Parse 解析 CSV 內容
   * 3. 篩選出台北市萬華區的醫療院所
   * 4. 解析 WKT 座標格式
   * 5. 建立地圖點位數據結構
   * 6. 更新 store 中的各項數據
   */
  async function loadCSV() {
    // 重置錯誤訊息
    errorMessage.value = ''
    
    try {
      // ------------------------------------------------------------------------
      // 步驟 1：載入 CSV 檔案
      // ------------------------------------------------------------------------
      
      console.log('開始載入 CSV 檔案...')
      
      // 修復路徑問題：使用 process.env.BASE_URL 來處理 publicPath
      // 在開發環境中 BASE_URL 是 '/'，在生產環境中是 '/long-term-care-web/'
      const baseUrl = process.env.BASE_URL || '/'
      const csvPath = `${baseUrl}data/112年12月醫療院所分布圖_全國.csv`
      console.log('BASE_URL：', baseUrl)
      console.log('CSV 檔案路徑：', csvPath)
      
      const response = await fetch(csvPath)
      
      // 檢查 HTTP 回應狀態
      if (!response.ok) {
        console.error('載入 CSV 失敗：', {
          url: csvPath,
          status: response.status,
          statusText: response.statusText
        })
        throw new Error(`HTTP error! status: ${response.status} - 無法載入 CSV 檔案`)
      }
      
      const csvText = await response.text()
      console.log('CSV 檔案載入成功，檔案大小：', csvText.length, '字元')
      
      // ------------------------------------------------------------------------
      // 步驟 2：解析 CSV 內容
      // ------------------------------------------------------------------------
      
      Papa.parse(csvText, {
        header: true,          // 第一行作為表頭
        skipEmptyLines: true,  // 跳過空行
        
        /**
         * 解析完成回調函數
         * @param {Object} results - Papa Parse 解析結果
         */
        complete: (results) => {
          console.log('CSV 解析完成：')
          console.log('- 總記錄數：', results.data.length)
          console.log('- 表頭欄位：', results.meta.fields)
          console.log('- 解析錯誤：', results.errors.length)
          
          // 檢查解析錯誤
          if (results.errors.length > 0) {
            console.error('CSV 解析錯誤：', results.errors)
            errorMessage.value = 'CSV 解析錯誤：' + results.errors[0].message
            return
          }
          
          // ------------------------------------------------------------------------
          // 步驟 3：資料篩選 - 只保留台北市萬華區的醫療院所
          // ------------------------------------------------------------------------
          
          const filtered = results.data.filter(row => 
            row.縣市 === '臺北市' && row.鄉鎮市區 === '萬華區'
          )
          
          console.log('資料篩選結果：')
          console.log('- 原始資料：', results.data.length, '筆')
          console.log('- 篩選後：', filtered.length, '筆')
          
          // ------------------------------------------------------------------------
          // 步驟 4：處理地圖點位資料
          // ------------------------------------------------------------------------
          
          const points = filtered
            // 4.1：確保有 WKT 座標資料
            .filter(row => row.WKT) 
            
            // 4.2：轉換資料格式
            .map(row => {
              // 解析 WKT 座標
              const position = parseWKT(row.WKT)
              
              // 如果座標解析失敗，跳過這筆資料
              if (!position) {
                console.warn('無法解析點位：', {
                  醫療院所: row.醫療院所,
                  WKT: row.WKT
                })
                return null
              }
              
              // 建立標準化的點位資料結構
              return {
                position: position,                        // 座標 {lat, lng}
                name: row.醫療院所 || '未命名',             // 醫療院所名稱
                address: row.地址 || '無地址',              // 地址
                phone: row.電話 || '無電話',                // 電話
                district: row.鄉鎮市區 || '無區域'          // 行政區域
              }
            })
            
            // 4.3：移除無效的點位 (座標解析失敗的)
            .filter(Boolean)

          // ------------------------------------------------------------------------
          // 步驟 5：記錄處理結果
          // ------------------------------------------------------------------------
          
          console.log('點位資料處理完成：')
          console.log('- 有效點位：', points.length, '個')
          console.log('- 點位列表：', points.map(p => ({
            名稱: p.name,
            座標: `${p.position.lat}, ${p.position.lng}`
          })))

          // ------------------------------------------------------------------------
          // 步驟 6：更新 Store 狀態
          // ------------------------------------------------------------------------
          
          csvRaw.value = results.data      // 原始資料
          csvHeaders.value = results.meta.fields  // 表頭欄位
          filteredData.value = filtered    // 篩選後資料
          mapPoints.value = points         // 地圖點位資料

          // ------------------------------------------------------------------------
          // 步驟 7：顯示結果給使用者
          // ------------------------------------------------------------------------
          
          if (points.length > 0) {
            const message = `成功載入 ${points.length} 個醫療院所點位`
            console.log('✅ ' + message)
            alert(message)
          } else {
            const message = '未找到符合條件的醫療院所資料'
            console.warn('⚠️ ' + message)
            alert(message)
          }
        },
        
        /**
         * 解析錯誤回調函數
         * @param {Error} error - 解析錯誤物件
         */
        error: (error) => {
          console.error('CSV 解析錯誤：', error)
          errorMessage.value = 'CSV 檔案解析失敗：' + error.message
        }
      })
      
    } catch (error) {
      // 處理檔案載入或其他錯誤
      console.error('載入 CSV 時出錯：', error)
      errorMessage.value = '載入 CSV 時出錯：' + error.message
    }
  }

  /**
   * 載入和處理 GeoJSON 檔案
   * 
   * 處理流程：
   * 1. 從 public/data 目錄載入 GeoJSON 檔案
   * 2. 解析 GeoJSON 內容
   * 3. 計算指定欄位的統計資訊
   * 4. 為每個 feature 計算顏色
   * 5. 更新 store 中的 GeoJSON 數據
   */
  async function loadGeoJSON(filename = '臺北市_村里_綜稅綜合所得總額.geojson') {
    // 重置錯誤訊息
    errorMessage.value = ''
    
    try {
      console.log('開始載入 GeoJSON 檔案：', filename)
      
      // 構建檔案路徑
      const baseUrl = process.env.BASE_URL || '/'
      const geoJsonPath = `${baseUrl}data/${filename}`
      console.log('GeoJSON 檔案路徑：', geoJsonPath)
      
      // 載入檔案
      const response = await fetch(geoJsonPath)
      
      if (!response.ok) {
        console.error('載入 GeoJSON 失敗：', {
          url: geoJsonPath,
          status: response.status,
          statusText: response.statusText
        })
        throw new Error(`HTTP error! status: ${response.status} - 無法載入 GeoJSON 檔案`)
      }
      
      const geoJsonText = await response.text()
      const geoJson = JSON.parse(geoJsonText)
      
      console.log('GeoJSON 檔案載入成功：')
      console.log('- Feature 數量：', geoJson.features?.length || 0)
      
      // 驗證 GeoJSON 格式
      if (!geoJson.type || geoJson.type !== 'FeatureCollection') {
        throw new Error('無效的 GeoJSON 格式：必須是 FeatureCollection')
      }
      
      if (!geoJson.features || !Array.isArray(geoJson.features)) {
        throw new Error('無效的 GeoJSON 格式：缺少 features 陣列')
      }
      
      // 計算指定欄位的統計資訊
      const values = geoJson.features
        .map(feature => feature.properties?.[colorField.value])
        .filter(value => typeof value === 'number' && !isNaN(value))
      
      if (values.length === 0) {
        throw new Error(`找不到有效的 "${colorField.value}" 欄位數據`)
      }
      
      const min = Math.min(...values)
      const max = Math.max(...values)
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      
      // 更新統計資訊
      colorStats.value = { min, max, mean }
      
      console.log('顏色統計資訊：', {
        欄位: colorField.value,
        最小值: min.toLocaleString(),
        最大值: max.toLocaleString(),
        平均值: Math.round(mean).toLocaleString(),
        有效數據: values.length
      })
      
      // 為每個 feature 計算顏色和樣式
      const processedLayers = geoJson.features.map(feature => {
        const value = feature.properties?.[colorField.value]
        const color = typeof value === 'number' && !isNaN(value) 
          ? getColorForValue(value, min, max)
          : '#cccccc' // 預設灰色
        
        return {
          feature: feature,
          style: {
            fillColor: color,
            fillOpacity: 0.6,
            color: '#ffffff',
            weight: 1,
            opacity: 0.8
          },
          popupContent: createPopupContent(feature.properties, value)
        }
      })
      
      // 更新 store 狀態
      geoJsonData.value = geoJson
      geoJsonLayers.value = processedLayers
      
      console.log('✅ GeoJSON 處理完成，共', processedLayers.length, '個圖層')
      
      const message = `成功載入 ${processedLayers.length} 個村里的所得資料`
      alert(message)
      
    } catch (error) {
      console.error('載入 GeoJSON 時出錯：', error)
      errorMessage.value = '載入 GeoJSON 時出錯：' + error.message
    }
  }

  /**
   * 創建彈出視窗內容
   * @param {Object} properties - Feature 的屬性
   * @param {number} colorValue - 用於顏色的數值
   * @returns {string} - HTML 內容
   */
  function createPopupContent(properties, colorValue) {
    const formatNumber = (num) => {
      return typeof num === 'number' ? num.toLocaleString() : '無資料'
    }
    
    return `
      <div style="min-width: 200px; font-family: 'Microsoft JhengHei', sans-serif;">
        <h6 style="margin: 0 0 10px 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
          📍 ${properties.村里名稱 || '未知村里'}
        </h6>
        <div style="font-size: 13px; line-height: 1.6;">
          <div style="margin-bottom: 8px;">
            <strong>行政區：</strong> ${properties.區域 || '未知'}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>所得中位數：</strong> 
            <span style="color: #e74c3c; font-weight: bold;">
              NT$ ${formatNumber(colorValue)}
            </span>
          </div>
          ${properties.平均數 ? `
            <div style="margin-bottom: 8px;">
              <strong>所得平均數：</strong> NT$ ${formatNumber(properties.平均數)}
            </div>
          ` : ''}
          ${properties.申報戶數 ? `
            <div style="margin-bottom: 8px;">
              <strong>申報戶數：</strong> ${formatNumber(properties.申報戶數)} 戶
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  // --------------------------------------------------------------------------
  // 返回 Store 的公開介面
  // --------------------------------------------------------------------------
  
  return {
    // 狀態數據
    csvRaw,              // 原始 CSV 資料
    csvHeaders,          // CSV 表頭
    filteredData,        // 篩選後的資料
    mapPoints,           // 地圖點位資料
    errorMessage,        // 錯誤訊息
    serviceCircleInfo,   // 服務範圍圓資訊
    
    // GeoJSON 相關數據
    geoJsonData,         // GeoJSON 數據
    geoJsonLayers,       // GeoJSON 圖層數據
    colorField,          // 用於顏色繪製的欄位
    geoJsonStats: colorStats,  // GeoJSON 統計資訊 (重新命名以符合組件使用)
    
    // 方法函數
    loadCSV,             // 載入 CSV 檔案的方法
    setServiceCircle,    // 設置服務範圍圓資訊
    clearServiceCircle,  // 清除服務範圍圓資訊
    loadGeoJSON          // 載入 GeoJSON 檔案的方法
  }
}) 