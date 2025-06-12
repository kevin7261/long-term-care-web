/**
 * 🛠️ 通用工具函數庫 (Common Utilities)
 *
 * 提供全系統使用的工具函數和常數定義
 * 包含 FontAwesome 圖標映射、顏色生成器等功能
 */

// =================================================================================
// 🎨 FontAwesome 圖標定義 (FontAwesome Icon Definitions)
// =================================================================================

/**
 * 圖標映射表 - 支援中文/英文/FontAwesome 類名
 * 用於統一管理系統中使用的所有圖標
 */
export const ICONS = {
  // 📂 圖層和資料相關 (Layer & Data Icons)
  layer: { zh: '圖層', en: 'Layer', icon: 'fas fa-layer-group' },
  visible: { zh: '可見', en: 'Visible', icon: 'fas fa-eye' },
  hidden: { zh: '隱藏', en: 'Hidden', icon: 'fas fa-eye-slash' },
  loading: { zh: '載入中', en: 'Loading', icon: 'fas fa-spinner fa-spin' },
  data: { zh: '資料', en: 'Data', icon: 'fas fa-database' },
  table: { zh: '表格', en: 'Table', icon: 'fas fa-table' },

  // 🗺️ 地圖相關 (Map Icons)
  map: { zh: '地圖', en: 'Map', icon: 'fas fa-map' },
  location: { zh: '位置', en: 'Location', icon: 'fas fa-map-marker-alt' },
  zoom_in: { zh: '放大', en: 'Zoom In', icon: 'fas fa-search-plus' },
  zoom_out: { zh: '縮小', en: 'Zoom Out', icon: 'fas fa-search-minus' },
  center: { zh: '居中', en: 'Center', icon: 'fas fa-crosshairs' },

  // 📊 分析和統計 (Analysis & Statistics Icons)
  chart: { zh: '圖表', en: 'Chart', icon: 'fas fa-chart-bar' },
  statistics: { zh: '統計', en: 'Statistics', icon: 'fas fa-chart-line' },
  dashboard: { zh: '儀表板', en: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  analysis: { zh: '分析', en: 'Analysis', icon: 'fas fa-analytics' },

  // 🏥 醫療相關 (Medical Icons)
  hospital: { zh: '醫院', en: 'Hospital', icon: 'fas fa-hospital' },
  clinic: { zh: '診所', en: 'Clinic', icon: 'fas fa-clinic-medical' },
  pharmacy: { zh: '藥局', en: 'Pharmacy', icon: 'fas fa-pills' },
  elderly_care: { zh: '長照', en: 'Elderly Care', icon: 'fas fa-hands-helping' },
  medical: { zh: '醫療', en: 'Medical', icon: 'fas fa-user-md' },

  // 👥 人口和社會 (Population & Social Icons)
  population: { zh: '人口', en: 'Population', icon: 'fas fa-users' },
  demographics: { zh: '人口統計', en: 'Demographics', icon: 'fas fa-user-friends' },
  community: { zh: '社區', en: 'Community', icon: 'fas fa-home' },

  // 💰 經濟相關 (Economic Icons)
  income: { zh: '收入', en: 'Income', icon: 'fas fa-dollar-sign' },
  tax: { zh: '稅收', en: 'Tax', icon: 'fas fa-file-invoice-dollar' },

  // 🎛️ 操作和控制 (Control & Action Icons)
  drag: { zh: '拖拉', en: 'Drag', icon: 'fa-solid fa-grip-lines-vertical' },
  move_up: { zh: '上移', en: 'Move Up', icon: 'fas fa-arrow-up' },
  move_down: { zh: '下移', en: 'Move Down', icon: 'fas fa-arrow-down' },
  delete: { zh: '刪除', en: 'Delete', icon: 'fas fa-trash' },
  edit: { zh: '編輯', en: 'Edit', icon: 'fas fa-edit' },
  save: { zh: '保存', en: 'Save', icon: 'fas fa-save' },
  cancel: { zh: '取消', en: 'Cancel', icon: 'fas fa-times' },
  confirm: { zh: '確認', en: 'Confirm', icon: 'fas fa-check' },

  // ⚙️ 設定和配置 (Settings & Configuration Icons)
  settings: { zh: '設定', en: 'Settings', icon: 'fas fa-cog' },
  filter: { zh: '篩選', en: 'Filter', icon: 'fas fa-filter' },
  search: { zh: '搜尋', en: 'Search', icon: 'fas fa-search' },
  sort: { zh: '排序', en: 'Sort', icon: 'fas fa-sort' },
  sort_up: { zh: '升序', en: 'Sort Ascending', icon: 'fas fa-sort-up' },
  sort_down: { zh: '降序', en: 'Sort Descending', icon: 'fas fa-sort-down' },

  // 📁 檔案和資料夾 (File & Folder Icons)
  folder: { zh: '資料夾', en: 'Folder', icon: 'fas fa-folder' },
  folder_open: { zh: '開啟資料夾', en: 'Open Folder', icon: 'fas fa-folder-open' },
  file: { zh: '檔案', en: 'File', icon: 'fas fa-file' },
  download: { zh: '下載', en: 'Download', icon: 'fas fa-download' },
  upload: { zh: '上傳', en: 'Upload', icon: 'fas fa-upload' },

  // ℹ️ 資訊和狀態 (Information & Status Icons)
  info: { zh: '資訊', en: 'Information', icon: 'fas fa-info-circle' },
  warning: { zh: '警告', en: 'Warning', icon: 'fas fa-exclamation-triangle' },
  error: { zh: '錯誤', en: 'Error', icon: 'fas fa-times-circle' },
  success: { zh: '成功', en: 'Success', icon: 'fas fa-check-circle' },

  // 🔄 狀態轉換 (State Transition Icons)
  refresh: { zh: '重新整理', en: 'Refresh', icon: 'fas fa-sync-alt' },
  reset: { zh: '重設', en: 'Reset', icon: 'fas fa-undo' },

  // 📱 介面元素 (UI Element Icons)
  menu: { zh: '選單', en: 'Menu', icon: 'fas fa-bars' },
  close: { zh: '關閉', en: 'Close', icon: 'fas fa-times' },
  expand: { zh: '展開', en: 'Expand', icon: 'fas fa-expand' },
  collapse: { zh: '收縮', en: 'Collapse', icon: 'fas fa-compress' },
};

// =================================================================================
// 🏥 圖層類型圖標映射 (Layer Type Icon Mapping)
// =================================================================================

/**
 * 圖層類型與圖標的映射表
 * 根據圖層名稱或類型自動分配對應的 FontAwesome 圖標
 */
export const LAYER_TYPE_ICONS = {
  // 醫療機構類型
  hospital: { icon: 'fas fa-hospital', zh: '醫院', en: 'Hospital' },
  clinic: { icon: 'fas fa-clinic-medical', zh: '診所', en: 'Clinic' },
  pharmacy: { icon: 'fas fa-pills', zh: '藥局', en: 'Pharmacy' },
  elderly_care: { icon: 'fas fa-hands-helping', zh: '長照機構', en: 'Elderly Care' },
  nursing_home: { icon: 'fas fa-home', zh: '護理之家', en: 'Nursing Home' },

  // 人口統計類型
  population: { icon: 'fas fa-users', zh: '人口', en: 'Population' },
  demographics: { icon: 'fas fa-user-friends', zh: '人口統計', en: 'Demographics' },
  elderly: { icon: 'fas fa-user-clock', zh: '老年人口', en: 'Elderly Population' },

  // 地理區域類型
  district: { icon: 'fas fa-map-marked-alt', zh: '行政區', en: 'District' },
  village: { icon: 'fas fa-home', zh: '村里', en: 'Village' },
  boundary: { icon: 'fas fa-border-style', zh: '邊界', en: 'Boundary' },

  // 交通設施類型
  transport: { icon: 'fas fa-bus', zh: '交通', en: 'Transport' },
  parking: { icon: 'fas fa-parking', zh: '停車場', en: 'Parking' },

  // 公共設施類型
  school: { icon: 'fas fa-school', zh: '學校', en: 'School' },
  park: { icon: 'fas fa-tree', zh: '公園', en: 'Park' },
  government: { icon: 'fas fa-landmark', zh: '政府機關', en: 'Government' },

  // 預設類型
  default: { icon: 'fas fa-map-marker-alt', zh: '地點', en: 'Location' },
};

/**
 * 根據圖層名稱自動判斷圖標類型
 *
 * @param {string} layerName - 圖層名稱
 * @returns {object} 包含圖標資訊的物件
 */
export function getLayerIcon(layerName) {
  if (!layerName) {
    return LAYER_TYPE_ICONS.default;
  }

  const name = layerName.toLowerCase();

  // 醫療相關關鍵字
  if (name.includes('醫院') || name.includes('hospital')) {
    return LAYER_TYPE_ICONS.hospital;
  }
  if (name.includes('診所') || name.includes('clinic')) {
    return LAYER_TYPE_ICONS.clinic;
  }
  if (name.includes('藥局') || name.includes('pharmacy') || name.includes('藥房')) {
    return LAYER_TYPE_ICONS.pharmacy;
  }
  if (
    name.includes('長照') ||
    name.includes('老人') ||
    name.includes('elderly') ||
    name.includes('福利')
  ) {
    return LAYER_TYPE_ICONS.elderly_care;
  }
  if (name.includes('護理') || name.includes('nursing')) {
    return LAYER_TYPE_ICONS.nursing_home;
  }

  // 人口相關關鍵字
  if (name.includes('人口') || name.includes('population')) {
    return LAYER_TYPE_ICONS.population;
  }
  if (name.includes('統計') || name.includes('demographics')) {
    return LAYER_TYPE_ICONS.demographics;
  }

  // 地理相關關鍵字
  if (name.includes('區') || name.includes('district') || name.includes('行政')) {
    return LAYER_TYPE_ICONS.district;
  }
  if (name.includes('村') || name.includes('里') || name.includes('village')) {
    return LAYER_TYPE_ICONS.village;
  }
  if (name.includes('邊界') || name.includes('boundary')) {
    return LAYER_TYPE_ICONS.boundary;
  }

  // 交通相關關鍵字
  if (
    name.includes('交通') ||
    name.includes('transport') ||
    name.includes('公車') ||
    name.includes('捷運')
  ) {
    return LAYER_TYPE_ICONS.transport;
  }
  if (name.includes('停車') || name.includes('parking')) {
    return LAYER_TYPE_ICONS.parking;
  }

  // 公共設施關鍵字
  if (name.includes('學校') || name.includes('school') || name.includes('教育')) {
    return LAYER_TYPE_ICONS.school;
  }
  if (name.includes('公園') || name.includes('park') || name.includes('綠地')) {
    return LAYER_TYPE_ICONS.park;
  }
  if (name.includes('政府') || name.includes('government') || name.includes('公所')) {
    return LAYER_TYPE_ICONS.government;
  }

  // 預設返回位置圖標
  return LAYER_TYPE_ICONS.default;
}

// =================================================================================
// 🎨 顏色生成器 (Color Generator)
// =================================================================================

/**
 * 預定義的視覺化顏色調色盤
 * 確保顏色之間有足夠的對比度和視覺區分
 */
const VISUALIZATION_COLORS = [
  '#2196F3', // 藍色
  '#4CAF50', // 綠色
  '#FF9800', // 橙色
  '#F44336', // 紅色
  '#9C27B0', // 紫色
  '#00BCD4', // 青色
  '#FF5722', // 深橙色
  '#795548', // 棕色
  '#607D8B', // 藍灰色
  '#E91E63', // 粉紅色
  '#8BC34A', // 淺綠色
  '#FFC107', // 琥珀色
  '#3F51B5', // 靛青色
  '#009688', // 藍綠色
  '#CDDC39', // 檸檬綠
  '#FF6F00', // 深橙色變體
];

/**
 * 智能顏色分配器
 * 根據圖層數量預先生成顏色，避免顏色相似
 *
 * @param {number} totalLayers - 總圖層數量
 * @returns {string[]} 顏色陣列
 */
export function generateLayerColors(totalLayers) {
  if (totalLayers <= VISUALIZATION_COLORS.length) {
    // 如果圖層數量少於預定義顏色，直接返回對應數量的顏色
    return VISUALIZATION_COLORS.slice(0, totalLayers);
  }

  // 如果圖層數量超過預定義顏色，使用 HSL 色彩空間生成更多顏色
  const colors = [...VISUALIZATION_COLORS];
  const additionalColors = totalLayers - VISUALIZATION_COLORS.length;

  for (let i = 0; i < additionalColors; i++) {
    // 使用黃金角度 (137.5°) 來生成均勻分布的色相
    const hue = (i * 137.5) % 360;
    const saturation = 60 + (i % 3) * 15; // 60%, 75%, 90% 飽和度循環
    const lightness = 45 + (i % 2) * 10; // 45%, 55% 亮度循環

    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

/**
 * 為單個圖層生成隨機顏色（保持向後兼容）
 * 注意：建議使用 generateLayerColors 來獲得更好的顏色分布
 *
 * @returns {string} RGB 顏色字串
 */
export function generateRandomColor() {
  const r = Math.floor(Math.random() * 156 + 100); // 100-255 確保顏色不會太暗
  const g = Math.floor(Math.random() * 156 + 100);
  const b = Math.floor(Math.random() * 156 + 100);
  return `rgb(${r}, ${g}, ${b})`;
}

// =================================================================================
// 🛠️ 輔助函數 (Helper Functions)
// =================================================================================

/**
 * 根據鍵名獲取圖標資訊
 *
 * @param {string} iconKey - 圖標鍵名
 * @param {string} lang - 語言 ('zh' | 'en')
 * @returns {object} 包含文字和圖標類名的物件
 */
export function getIcon(iconKey, lang = 'zh') {
  const iconInfo = ICONS[iconKey];
  if (!iconInfo) {
    console.warn(`找不到圖標定義: ${iconKey}`);
    return {
      text: iconKey,
      icon: 'fas fa-question-circle',
    };
  }

  return {
    text: iconInfo[lang] || iconInfo.zh,
    icon: iconInfo.icon,
  };
}

/**
 * 獲取所有可用的圖標鍵名
 *
 * @returns {string[]} 圖標鍵名陣列
 */
export function getAvailableIcons() {
  return Object.keys(ICONS);
}

/**
 * 檢查顏色是否為深色（用於決定文字顏色）
 *
 * @param {string} color - 顏色值（支援 hex, rgb, hsl）
 * @returns {boolean} 是否為深色
 */
export function isDarkColor(color) {
  // 簡化的亮度檢測，可根據需要增強
  let r, g, b;

  if (color.startsWith('#')) {
    // Hex 格式
    const hex = color.substring(1);
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    // RGB 格式
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  } else {
    // 預設返回 false
    return false;
  }

  // 計算相對亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// =================================================================================
// 🔧 防抖和節流函數 (Debounce & Throttle)
// =================================================================================

/**
 * 防抖函數 - 延遲執行，在指定時間內重複調用會重新計時
 *
 * @param {Function} func - 要執行的函數
 * @param {number} wait - 等待時間（毫秒）
 * @param {boolean} immediate - 是否立即執行
 * @returns {Function} 防抖後的函數
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * 節流函數 - 限制函數執行頻率
 *
 * @param {Function} func - 要執行的函數
 * @param {number} limit - 限制間隔（毫秒）
 * @returns {Function} 節流後的函數
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// =================================================================================
// 📏 格式化函數 (Formatting Functions)
// =================================================================================

/**
 * 格式化數字（加入千分位逗號）
 *
 * @param {number} num - 要格式化的數字
 * @returns {string} 格式化後的字串
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('zh-TW').format(num);
}

/**
 * 格式化座標
 *
 * @param {number} coordinate - 座標值
 * @param {number} precision - 精確度（小數位數）
 * @returns {string} 格式化後的座標字串
 */
export function formatCoordinate(coordinate, precision = 4) {
  return parseFloat(coordinate).toFixed(precision);
}

/**
 * 格式化檔案大小
 *
 * @param {number} bytes - 位元組數
 * @returns {string} 格式化後的檔案大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
