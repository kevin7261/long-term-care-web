import { defineStore } from 'pinia'
import { ref } from 'vue'
import Papa from 'papaparse'

export const useMapStore = defineStore('mapStore', () => {
  const csvRaw = ref([])
  const csvHeaders = ref([])
  const filteredData = ref([])
  const mapPoints = ref([])
  const errorMessage = ref('')

  // 解析 WKT Point 字串
  function parseWKT(wktString) {
    try {
      // 移除引號並解析 WKT 字串
      const cleanWKT = wktString.replace(/^"|"$/g, '')
      console.log('解析 WKT：', {
        原始字串: wktString,
        清理後: cleanWKT
      })

      // 檢查 WKT 格式
      if (!cleanWKT.startsWith('POINT (')) {
        console.error('無效的 WKT 格式：', cleanWKT)
        return null
      }

      // 提取座標
      const coordsStr = cleanWKT.replace('POINT (', '').replace(')', '')
      const [lng, lat] = coordsStr.split(' ').map(Number)
      
      // 檢查座標是否有效
      if (isNaN(lat) || isNaN(lng)) {
        console.error('無效的座標值：', { lat, lng })
        return null
      }

      // 檢查座標範圍
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

  async function loadCSV() {
    errorMessage.value = ''
    try {
      const response = await fetch('data/112年12月醫療院所分布圖_全國.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const csvText = await response.text()
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            errorMessage.value = 'CSV 解析錯誤：' + results.errors[0].message
            return
          }
          
          // 只保留臺北市萬華區的資料
          const filtered = results.data.filter(row => 
            row.縣市 === '臺北市' && row.鄉鎮市區 === '萬華區'
          )
          
          // 解析並添加地圖點位
          const points = filtered
            .filter(row => row.WKT) // 確保有 WKT 資料
            .map(row => {
              const position = parseWKT(row.WKT)
              if (!position) {
                console.log('無法解析點位：', row)
                return null
              }
              
              return {
                position,
                name: row.醫療院所 || '未命名',
                address: row.地址 || '無地址',
                phone: row.電話 || '無電話',
                district: row.鄉鎮市區 || '無區域'
              }
            })
            .filter(Boolean)

          console.log('解析後的點位：', points.map(p => ({
            name: p.name,
            position: p.position
          })))

          // 更新 store 中的數據
          csvRaw.value = results.data
          csvHeaders.value = results.meta.fields
          filteredData.value = filtered
          mapPoints.value = points

          // 顯示結果
          if (points.length > 0) {
            console.log('點位設置完成：', {
              總資料筆數: results.data.length,
              符合條件筆數: filtered.length,
              有效點位數量: points.length,
              點位列表: points.map(p => ({
                名稱: p.name,
                座標: p.position
              }))
            })
            alert(`成功載入 ${points.length} 個點位`)
          } else {
            alert('未找到有效的點位資料')
          }
        },
        error: (error) => {
          console.error('CSV 解析錯誤：', error)
          errorMessage.value = 'CSV 檔案解析失敗：' + error.message
        }
      })
    } catch (error) {
      console.error('載入 CSV 時出錯：', error)
      errorMessage.value = '載入 CSV 時出錯：' + error.message
    }
  }

  return {
    csvRaw,
    csvHeaders,
    filteredData,
    mapPoints,
    errorMessage,
    loadCSV
  }
}) 