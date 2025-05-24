<template>
  <!-- 控制面板主容器 -->
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- 標題區域 -->
      <h3 class="title mb-3">長照資源地圖</h3>

      <!-- 控制按鈕區域 -->
      <div class="sidebar-buttons">
        <!-- 啟用地圖點擊按鈕：控制是否可以點擊地圖創建服務範圍圓 -->
        <button 
          class="btn w-100 mb-3" 
          :class="mapClickEnabled ? 'btn-danger' : 'btn-primary'"
          @click="$emit('toggle-map-click')"
        >
          <i :class="mapClickEnabled ? 'bi bi-hand-index' : 'bi bi-hand-index-thumb'"></i>
          {{ mapClickEnabled ? '停用地圖點擊' : '啟用地圖點擊' }}
        </button>

        <!-- 操作狀態提示 -->
        <div 
          v-if="mapClickEnabled" 
          class="alert alert-success mb-3"
        >
          <i class="bi bi-check-circle"></i>
          <strong>地圖點擊已啟用</strong><br>
          <small>點擊地圖任意位置創建 5km 服務範圍圓</small>
        </div>

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

        <!-- 操作提示：當沒有服務範圍圓時顯示 -->
        <div 
          v-else-if="!mapClickEnabled" 
          class="service-hint mt-3 p-3 border rounded bg-info bg-opacity-10"
        >
          <h6 class="mb-2">
            <i class="bi bi-info-circle text-info"></i> 
            操作提示
          </h6>
          <p class="mb-0 small">
            點擊上方的<strong>「啟用地圖點擊」</strong>按鈕，即可開始在地圖上點擊創建服務範圍圓。
          </p>
        </div>

        <!-- CSV 載入按鈕：點擊時觸發 load-csv 事件 -->
        <button 
          class="btn btn-success w-100 mt-3" 
          @click="$emit('load-csv')"
        >
          <i class="bi bi-file-earmark-spreadsheet"></i> 讀取 CSV
        </button>

        <!-- 錯誤訊息顯示區域：當有錯誤時顯示 -->
        <div 
          v-if="errorMessage" 
          class="alert alert-danger mt-3 mb-0"
        >
          {{ errorMessage }}
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
    },
    // 是否啟用地圖點擊
    mapClickEnabled: {
      type: Boolean,
      default: false
    }
  },

  // 組件事件定義
  emits: ['load-csv', 'clear-service-circle', 'toggle-map-click'],

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

    return {
      displayHeaders,
      previewData,
      previewLimit,
      serviceCircleInfo,
      serviceAreaKm2
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