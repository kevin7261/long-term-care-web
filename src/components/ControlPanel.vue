<template>
  <!-- 控制面板主容器 -->
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- 標題區域 -->
      <h3 class="title mb-3">台北市長照資源地圖</h3>

      <!-- 控制按鈕區域 -->
      <div class="sidebar-buttons">
        <!-- 位置按鈕：點擊時觸發 button-click 事件 -->
        <button 
          class="btn btn-primary w-100" 
          @click="$emit('button-click')"
        >
          <i class="bi bi-geo-alt"></i> 顯示位置
        </button>

        <!-- 圖層開關：用於切換地圖圖層顯示 -->
        <div class="form-check form-switch">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="layerSwitch"
          >
          <label 
            class="form-check-label" 
            for="layerSwitch"
          >
            切換圖層
          </label>
        </div>

        <!-- CSV 載入按鈕：點擊時觸發 load-csv 事件 -->
        <button 
          class="btn btn-success w-100" 
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
  emits: ['button-click', 'load-csv'],

  // 組件邏輯
  setup(props) {
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

    return {
      displayHeaders,
      previewData,
      previewLimit
    }
  }
})
</script>

<style scoped>
.title {
  font-size: 1.25rem;
  font-weight: 500;
}
</style> 