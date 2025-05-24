<template>
  <div class="sidebar">
    <div class="p-3">
      <h2 class="mb-4">控制面板</h2>
      <div class="d-grid gap-3">
        <button class="btn btn-primary" @click="$emit('button-click')">
          <i class="bi bi-geo-alt"></i> 顯示位置
        </button>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="layerSwitch">
          <label class="form-check-label" for="layerSwitch">切換圖層</label>
        </div>
        <button class="btn btn-success" @click="$emit('load-csv')">
          <i class="bi bi-file-earmark-spreadsheet"></i> 讀取 CSV
        </button>
        <!-- 錯誤訊息顯示 -->
        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
        <!-- CSV 資料顯示區域 -->
        <div v-if="csvData.length > 0" class="csv-data-container">
          <h5 class="mt-3 mb-2">CSV 資料預覽</h5>
          <div class="table-responsive">
            <table class="table table-sm table-striped">
              <thead>
                <tr>
                  <th v-for="header in csvHeaders" :key="header">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in csvData.slice(0, 5)" :key="index">
                  <td v-for="header in csvHeaders" :key="header">{{ row[header] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <small class="text-muted">顯示前 5 筆資料，共 {{ csvData.length }} 筆</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ControlPanel',
  props: {
    errorMessage: {
      type: String,
      default: ''
    },
    csvData: {
      type: Array,
      default: () => []
    },
    csvHeaders: {
      type: Array,
      default: () => []
    }
  },
  emits: ['button-click', 'load-csv']
})
</script>

<style scoped>
.sidebar {
  background-color: #f8f9fa;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  transition: all 0.1s ease;
}

.sidebar .p-3 {
  width: 100%;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  width: 100%;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-success {
  width: 100%;
}

.csv-data-container {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  width: 100%;
  box-sizing: border-box;
}

.table {
  font-size: 0.875rem;
  width: 100%;
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  white-space: nowrap;
  padding: 0.5rem;
}

.table td {
  padding: 0.5rem;
  word-break: break-word;
}

.alert {
  margin-top: 1rem;
  width: 100%;
  box-sizing: border-box;
}

/* 確保表格容器不會產生橫向滾動 */
.table-responsive {
  width: 100%;
  margin: 0;
  padding: 0;
}

/* 確保所有內容都在容器內 */
.d-grid {
  width: 100%;
  margin: 0;
  padding: 0;
}

/* 確保表單開關不會超出容器 */
.form-check {
  margin: 0;
  padding: 0;
  width: 100%;
}

.form-check-label {
  width: 100%;
  display: block;
}
</style> 