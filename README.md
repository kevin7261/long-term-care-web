# 台北市長照資源地圖 (Long-term Care Web)

一個基於 Vue 3 和 Leaflet 的互動式地圖應用，用於顯示台北市萬華區的醫療院所分布。

## 🌟 功能特色

### 📍 地圖功能
- **互動式地圖**：使用 OpenStreetMap 提供詳細的地圖顯示
- **醫療院所標記**：顯示萬華區所有醫療院所位置
- **詳細資訊彈窗**：點擊標記查看院所名稱、地址、電話等資訊
- **十字準心**：地圖中心顯示紅色十字準心標記

### 🎛️ 操作介面
- **響應式佈局**：桌面版左右分欄，手機版上下分欄
- **可拖拽調整**：可以拖拽調整控制面板的大小
- **CSV 資料載入**：支援載入和解析醫療院所 CSV 資料

### 📱 響應式設計
- **斷點：1200px**
  - 寬度 >= 1200px：水平佈局（控制面板在左，地圖在右）
  - 寬度 < 1200px：垂直佈局（地圖在上，控制面板在下）

## 🏗️ 技術架構

### 前端框架
- **Vue 3** - 使用 Composition API
- **Pinia** - 狀態管理
- **Vue Router** - 路由管理

### 地圖技術
- **Leaflet** - 開源地圖庫
- **Vue-Leaflet** - Vue 3 的 Leaflet 組件封裝
- **OpenStreetMap** - 免費開源地圖服務

### 樣式框架
- **Bootstrap 5** - CSS 框架
- **自定義 CSS** - 地圖和拖拽功能樣式

### 資料處理
- **Papa Parse** - CSV 解析庫
- **WKT** - Well-Known Text 地理座標格式支援

## 📁 項目結構

```
src/
├── components/           # Vue 組件
│   ├── MapComponent.vue     # 地圖組件（核心地圖功能）
│   ├── MapView.vue          # 主視圖（佈局和拖拽）
│   └── ControlPanel.vue     # 控制面板
│
├── stores/              # Pinia 狀態管理
│   └── mapStore.js         # 地圖數據 Store
│
├── assets/styles/       # 樣式文件
│   ├── base.css           # 全域基礎樣式
│   ├── map.css            # 地圖專用樣式
│   └── control-panel.css  # 控制面板樣式
│
├── router/              # 路由配置
│   └── index.js
│
└── main.js             # 應用入口
```

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run serve
```

### 生產建置
```bash
npm run build
```

### 部署到 GitHub Pages
```bash
npm run deploy
```

## 📊 資料格式

### CSV 資料結構
項目使用的 CSV 檔案應包含以下欄位：

| 欄位名稱 | 說明 | 範例 |
|---------|------|------|
| 縣市 | 縣市名稱 | 臺北市 |
| 鄉鎮市區 | 行政區域 | 萬華區 |
| 醫療院所 | 院所名稱 | 萬華醫院 |
| 地址 | 詳細地址 | 台北市萬華區... |
| 電話 | 聯絡電話 | 02-1234-5678 |
| WKT | 座標資訊 | POINT (121.5654 25.0330) |

### WKT 格式說明
- **格式**：`POINT (經度 緯度)`
- **注意**：經度在前，緯度在後
- **範例**：`POINT (121.5654 25.0330)` 表示台北市中心

## 🎨 組件詳解

### MapComponent.vue
**核心地圖組件**
- 負責地圖的初始化和標記管理
- 使用原生 Leaflet API 確保穩定性
- 自動處理圖標路徑問題
- 支援響應式的點位數據更新

### MapView.vue
**主佈局組件**
- 管理響應式佈局切換
- 處理拖拽功能邏輯
- 整合地圖組件和控制面板
- 管理十字準心標記

### ControlPanel.vue
**控制面板組件**
- 提供資料載入介面
- 顯示錯誤訊息
- 展示載入的資料清單

### mapStore.js
**資料管理 Store**
- CSV 檔案載入和解析
- WKT 座標格式轉換
- 資料篩選和處理
- 錯誤處理和狀態管理

## 🔧 核心功能實現

### 地圖標記管理
```javascript
// 使用原生 Leaflet API 創建標記
const marker = L.marker([lat, lng])
  .bindPopup(popupContent)
  .addTo(map)
```

### 拖拽功能
```javascript
// 監聽滑鼠事件實現拖拽
const handleDragStart = (isVertical) => {
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', handleDragEnd)
}
```

### WKT 座標解析
```javascript
// 解析 "POINT (121.5654 25.0330)" 格式
const [lng, lat] = coordsStr.split(' ').map(Number)
return { lat, lng }
```

## 🎯 設計特點

### 響應式設計
- 使用 CSS Flexbox 實現彈性佈局
- 斷點式設計適應不同螢幕尺寸
- 觸控友好的拖拽功能

### 使用者體驗
- 平滑的動畫過渡效果
- 視覺化的拖拽提示
- 清晰的資料載入回饋

### 代碼品質
- 詳細的註解和文檔
- 模組化的組件設計
- 一致的程式碼風格

## 🔍 除錯和維護

### 常見問題
1. **地圖標記不顯示**
   - 檢查 Leaflet 圖標路徑設置
   - 確認 CSV 資料中的 WKT 格式正確

2. **拖拽功能無效**
   - 檢查 CSS 中的 `.resizer` 樣式
   - 確認事件監聽器正確綁定

3. **資料載入失敗**
   - 檢查 CSV 檔案路徑
   - 確認資料格式符合預期

### 性能優化
- 使用計算屬性避免不必要的重新渲染
- 適當的事件監聽器清理
- 響應式資料的合理使用

## 📝 開發筆記

### 關鍵設計決策
1. **使用原生 Leaflet API 而非 Vue 組件**
   - 更好的穩定性和控制能力
   - 避免 Vue 組件層的潛在問題

2. **Pinia 狀態管理**
   - 清晰的資料流管理
   - 更好的開發者體驗

3. **模組化 CSS 設計**
   - 分離關注點
   - 便於維護和擴展

## 🛠️ 環境需求

- Node.js >= 14
- npm >= 6
- 現代瀏覽器支援 ES6+

## 📄 授權

MIT License

---

**開發團隊**: 長照資源分析專案組  
**最後更新**: 2024年12月
