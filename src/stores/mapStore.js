import { defineStore } from 'pinia'
import { ref } from 'vue'
import Papa from 'papaparse'
import L from 'leaflet'

export const useMapStore = defineStore('mapStore', () => {
  const csvRaw = ref([])
  const csvHeaders = ref([])
  const filteredData = ref([])
  const mapPoints = ref([])
  const errorMessage = ref('')
  const mapBounds = ref(null)

  // 解析 WKT Point 字串
  function parseWKT(wktString) {
    try {
      // 移除引號並解析 WKT 字串
      const cleanWKT = wktString.replace(/^"|"$/g, '')
      const coordsStr = cleanWKT.replace('POINT (', '').replace(')', '')
      const [lng, lat] = coordsStr.split(' ').map(Number)
      // 確保座標是有效的數字
      if (isNaN(lat) || isNaN(lng)) {
        console.error('無效的座標值：', { lat, lng })
        return null
      }
      return { lat, lng }
    } catch (error) {
      console.error('WKT 解析錯誤：', error)
      return null
    }
  }

  async function loadCSV() {
    errorMessage.value = ''
    try {
      const response = await fetch('./data/112年12月醫療院所分布圖_全國.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('text/csv')) {
        throw new Error('檔案格式不正確，請確保是 CSV 檔案')
      }
      const csvText = await response.text()
      if (csvText.includes('<!DOCTYPE html>')) {
        throw new Error('檔案路徑錯誤，請確認 CSV 檔案位置')
      }
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            errorMessage.value = 'CSV 解析錯誤：' + results.errors[0].message
            return
          }
          csvRaw.value = results.data
          csvHeaders.value = results.meta.fields
          
          // 只保留台北市萬華區的資料
          const filtered = results.data.filter(row => 
            row.縣市 === '臺北市' && row.鄉鎮市區 === '萬華區'
          )
          filteredData.value = filtered
          
          // 解析並添加地圖點位
          mapPoints.value = filtered
            .filter(row => row.WKT)
            .map(row => {
              const position = parseWKT(row.WKT)
              return {
                position,
                name: row.醫療院所 || '未命名',
                address: row.地址 || '無地址',
                phone: row.電話 || '無電話',
                district: row.鄉鎮市區 || '無區域'
              }
            })
            .filter(point => point.position)
          
          // 設定地圖邊界
          if (mapPoints.value.length > 0) {
            const validPoints = mapPoints.value.filter(p => 
              !isNaN(p.position.lat) && !isNaN(p.position.lng)
            )
            if (validPoints.length > 0) {
              const bounds = L.latLngBounds(validPoints.map(p => [p.position.lat, p.position.lng]))
              mapBounds.value = bounds
            }
          }
        },
        error: (error) => {
          errorMessage.value = 'CSV 檔案解析失敗：' + error.message
        }
      })
    } catch (error) {
      errorMessage.value = 'CSV 檔案讀取失敗：' + error.message
    }
  }

  return {
    csvRaw,
    csvHeaders,
    filteredData,
    mapPoints,
    errorMessage,
    mapBounds,
    loadCSV
  }
}) 