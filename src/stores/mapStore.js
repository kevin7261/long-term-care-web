// ============================================================================
// 地圖數據管理 Store (mapStore.js)
// ============================================================================

/**
 * 功能說明：
 * - 管理 CSV 數據的載入和解析
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

  // 服務範圍圓資訊
  const serviceCircleInfo = ref({
    isActive: false,            // 是否有活動的服務範圍圓
    center: null,               // 圓心座標 { lat, lng }
    radius: 5000,               // 半徑（公尺）
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

  // --------------------------------------------------------------------------
  // 服務範圍圓管理函數
  // --------------------------------------------------------------------------

  /**
   * 設置服務範圍圓資訊
   * @param {Object} latlng - 點擊位置座標 { lat, lng }
   * @param {Number} radius - 圓半徑（公尺），預設 5000
   * @description 更新服務範圍圓的狀態資訊
   */
  function setServiceCircle(latlng, radius = 5000) {
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
      radius: 5000,
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
      
      const response = await fetch('data/112年12月醫療院所分布圖_全國.csv')
      
      // 檢查 HTTP 回應狀態
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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
    
    // 方法函數
    loadCSV,             // 載入 CSV 檔案的方法
    setServiceCircle,    // 設置服務範圍圓資訊
    clearServiceCircle   // 清除服務範圍圓資訊
  }
}) 