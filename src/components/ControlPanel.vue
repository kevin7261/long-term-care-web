<template>
  <!-- 控制面板主容器 -->
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- 標題區域 -->
      <h3 class="title mb-3">台北市長照資源地圖</h3>

      <!-- 控制按鈕區域 -->
      <div class="sidebar-buttons">
        <!-- 服務範圍圓資訊顯示區域 -->
        <div 
          v-if="serviceCircleInfo.isActive" 
          class="service-circle-info mt-3 p-3 border rounded bg-light"
        >
          <h6 class="mb-2">
            <i class="bi bi-geo-alt-fill text-danger"></i> 
            服務範圍資訊
          </h6>
          
          <!-- 點擊位置 -->
          <div class="info-item mb-2">
            <strong>點擊位置：</strong><br>
            <small class="text-muted">
              緯度：{{ serviceCircleInfo.center.lat.toFixed(6) }}<br>
              經度：{{ serviceCircleInfo.center.lng.toFixed(6) }}
            </small>
          </div>
          
          <!-- 服務半徑 -->
          <div class="info-item mb-2">
            <strong>服務半徑：</strong>
            <span class="text-primary">{{ (serviceCircleInfo.radius / 1000).toFixed(1) }} 公里</span>
          </div>
          
          <!-- 服務範圍面積 -->
          <div class="info-item mb-2">
            <strong>覆蓋面積：</strong>
            <span class="text-success">{{ serviceAreaKm2 }} 平方公里</span>
          </div>
          
          <!-- 建立時間 -->
          <div class="info-item mb-3">
            <strong>建立時間：</strong><br>
            <small class="text-muted">{{ serviceCircleInfo.clickTime }}</small>
          </div>
          
          <!-- 清除按鈕 -->
          <button 
            class="btn btn-outline-danger btn-sm w-100" 
            @click="$emit('clear-service-circle')"
          >
            <i class="bi bi-trash"></i> 清除範圍圓
          </button>
        </div>

        <!-- 操作提示：使用右鍵選單 -->
        <div 
          v-else 
          class="service-hint mt-3 p-3 border rounded bg-info bg-opacity-10"
        >
          <h6 class="mb-2">
            <i class="bi bi-info-circle text-info"></i> 
            操作提示
          </h6>
          <p class="mb-0 small">
            在地圖上<strong>按右鍵</strong>，選擇「加入服務範圍」即可創建 2km 服務範圍圓。
          </p>
        </div>

        <!-- CSV 載入按鈕：點擊時觸發 load-csv 事件 -->
        <button 
          class="btn btn-success w-100 mt-3" 
          @click="$emit('load-csv')"
        >
          <i class="bi bi-file-earmark-spreadsheet"></i> 讀取 CSV
        </button>

        <!-- GeoJSON 載入按鈕：點擊時觸發 load-geojson 事件 -->
        <button 
          class="btn btn-primary w-100 mt-2" 
          @click="$emit('load-geojson')"
        >
          <i class="bi bi-map"></i> 讀取村里所得資料
        </button>

        <!-- 錯誤訊息顯示區域：當有錯誤時顯示 -->
        <div 
          v-if="errorMessage" 
          class="alert alert-danger mt-3 mb-0"
        >
          {{ errorMessage }}
        </div>

        <!-- GeoJSON 統計資訊顯示 -->
        <div 
          v-if="geoJsonStats && geoJsonStats.min !== geoJsonStats.max" 
          class="geojson-stats mt-3 p-3 border rounded bg-light"
        >
          <h6 class="mb-2">
            <i class="bi bi-bar-chart text-primary"></i> 
            所得統計資訊
          </h6>
          <div class="stats-grid">
            <div class="stat-item">
              <small class="text-muted">最低</small>
              <div class="stat-value text-success">
                NT$ {{ formatNumber(geoJsonStats.min) }}
              </div>
            </div>
            <div class="stat-item">
              <small class="text-muted">平均</small>
              <div class="stat-value text-info">
                NT$ {{ formatNumber(Math.round(geoJsonStats.mean)) }}
              </div>
            </div>
            <div class="stat-item">
              <small class="text-muted">最高</small>
              <div class="stat-value text-warning">
                NT$ {{ formatNumber(geoJsonStats.max) }}
              </div>
            </div>
          </div>
          
          <!-- 色票說明 -->
          <div class="color-legend mt-3">
            <small class="text-muted d-block mb-2">Viridis 色票：</small>
            <div class="color-bar"></div>
            <div class="color-labels">
              <small>低</small>
              <small>高</small>
            </div>
          </div>
        </div>

        <!-- CSV 資料預覽區域：當有資料時顯示 -->
        <div 
          v-if="csvData.length > 0" 
          class="sidebar-table-container"
        >
          <div class="p-2">
            <h5 class="mb-2">CSV 資料預覽</h5>
            <!-- 響應式表格容器 -->
            <div class="table-responsive">
              <table class="table table-sm table-striped sidebar-table">
                <!-- 表格標題行 -->
                <thead>
                  <tr>
                    <th 
                      v-for="header in displayHeaders" 
                      :key="header" 
                      class="text-nowrap"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <!-- 表格內容行 -->
                <tbody>
                  <tr 
                    v-for="(row, index) in previewData" 
                    :key="index"
                  >
                    <td 
                      v-for="header in displayHeaders" 
                      :key="header" 
                      class="text-break"
                    >
                      {{ row[header] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- 資料筆數提示 -->
            <small class="text-muted">
              顯示前 {{ previewLimit }} 筆資料，共 {{ csvData.length }} 筆
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import '@/assets/styles/base.css'
import '@/assets/styles/control-panel.css'

export default defineComponent({
  name: 'ControlPanel',

  // 組件屬性定義
  props: {
    // 錯誤訊息
    errorMessage: {
      type: String,
      default: ''
    },
    // CSV 資料陣列
    csvData: {
      type: Array,
      default: () => []
    },
    // CSV 標題陣列
    csvHeaders: {
      type: Array,
      default: () => []
    }
  },

  // 組件事件定義
  emits: ['load-csv', 'clear-service-circle', 'load-geojson'],

  // 組件邏輯
  setup(props) {
    // 使用 mapStore
    const mapStore = useMapStore()

    // 過濾掉 WKT 欄位，只顯示其他欄位
    const displayHeaders = computed(() => {
      return props.csvHeaders.filter(header => header !== 'WKT')
    })

    // 預覽資料的筆數限制
    const previewLimit = 5

    // 預覽資料：只顯示前 N 筆
    const previewData = computed(() => {
      return props.csvData.slice(0, previewLimit)
    })

    // 服務範圍圓資訊（從 store 取得）
    const serviceCircleInfo = computed(() => mapStore.serviceCircleInfo)

    // 計算服務範圍面積（平方公里）
    const serviceAreaKm2 = computed(() => {
      if (!serviceCircleInfo.value.isActive) return 0
      
      const radiusKm = serviceCircleInfo.value.radius / 1000
      const area = Math.PI * radiusKm * radiusKm
      return area.toFixed(2)
    })

    // 獲取 GeoJSON 統計資訊
    const geoJsonStats = computed(() => mapStore.geoJsonStats)

    // 格式化數字
    const formatNumber = (value) => {
      return value.toLocaleString()
    }

    return {
      displayHeaders,
      previewData,
      previewLimit,
      serviceCircleInfo,
      serviceAreaKm2,
      geoJsonStats,
      formatNumber
    }
  }
})
</script>

<style scoped>
.title {
  font-size: 1.25rem;
  font-weight: 500;
}

/* 服務範圍圓資訊樣式 */
.service-circle-info {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.05) !important;
}

.service-circle-info h6 {
  color: #dc3545;
  font-weight: 600;
}

.info-item {
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 操作提示樣式 */
.service-hint {
  border-color: #0dcaf0;
}

.service-hint h6 {
  color: #0dcaf0;
  font-weight: 600;
}
</style> 