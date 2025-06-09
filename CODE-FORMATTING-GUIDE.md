# 🎨 程式碼格式化指南 (Code Formatting Guide)

本專案使用 **ESLint + Prettier** 來確保程式碼風格的一致性和品質。

## 📦 已安裝的套件 (Installed Packages)

- `prettier`: 程式碼格式化工具
- `eslint-config-prettier`: 關閉與 Prettier 衝突的 ESLint 規則
- `eslint-plugin-prettier`: 將 Prettier 規則作為 ESLint 規則運行

## 🛠️ 可用的指令 (Available Commands)

### 基本指令 (Basic Commands)

```bash
# 🔍 檢查 ESLint 規則
npm run lint

# 🔧 自動修復 ESLint 問題
npm run lint:fix

# 🎨 使用 Prettier 格式化所有文件
npm run prettier

# 👀 檢查格式化狀況（不修改文件）
npm run prettier:check

# 🚀 一鍵格式化（Prettier + ESLint 自動修復）
npm run format
```

### 推薦工作流程 (Recommended Workflow)

```bash
# 開發時：檢查程式碼格式
npm run prettier:check

# 提交前：完整格式化
npm run format

# 檢查 ESLint 問題
npm run lint
```

## ⚙️ 配置文件說明 (Configuration Files)

### `.prettierrc.js`

- 📋 Prettier 主要配置文件
- 定義格式化規則（縮排、引號、分號等）
- 包含 Vue.js、JavaScript、CSS、JSON、Markdown 的特殊設定

### `.prettierignore`

- 🚫 指定不需要格式化的文件和目錄
- 包含 node_modules、dist、圖片文件等

### `package.json` 中的 ESLint 配置

- 📏 整合 Prettier 與 ESLint
- 設定警告規則（console.log 為警告而非錯誤）
- 關閉 Vue 多詞組件名稱檢查

## 🎯 格式化規則重點 (Key Formatting Rules)

### JavaScript/Vue.js

- **縮排**: 2 個空格
- **引號**: 單引號 (`'`)
- **分號**: 總是使用分號
- **行長度**: 最大 100 字符
- **尾隨逗號**: ES5 相容的地方使用

### CSS

- **引號**: 雙引號 (`"`)
- **縮排**: 2 個空格

### JSON

- **縮排**: 2 個空格

### Markdown

- **行長度**: 最大 80 字符
- **自動換行**: 啟用

## 💻 VSCode 整合 (VSCode Integration)

已經設定好 VSCode 配置文件：

### `.vscode/settings.json`

- 💾 儲存時自動格式化
- 🔧 自動修復 ESLint 問題
- 📏 顯示 100 字符標尺
- 🎯 設定各檔案類型的預設格式化器

### `.vscode/extensions.json`

推薦安裝的 VSCode 擴展：

- `esbenp.prettier-vscode` - Prettier 格式化器
- `dbaeumer.vscode-eslint` - ESLint 支援
- `vue.volar` - Vue.js 語言支援

## 🔄 自動化流程 (Automation)

### 儲存時自動格式化

- 在 VSCode 中，儲存文件時會自動運行 Prettier
- ESLint 問題也會自動修復

### Git 提交前檢查

可以考慮設定 Git hooks：

```bash
# 未來可以添加的 pre-commit hook
npm run format
npm run lint
```

## ⚠️ 注意事項 (Important Notes)

### Console 語句警告

- `console.log` 會顯示為**警告**（不是錯誤）
- 開發時可以保留，但建議生產版本前清理

### 格式化衝突解決

如果遇到格式化衝突：

1. 先運行 `npm run prettier`
2. 再運行 `npm run lint:fix`
3. 或直接使用 `npm run format`

### 新增文件

- 新文件會自動遵循格式化規則
- 建議使用 VSCode 以獲得最佳體驗

## 🎉 使用效果 (Benefits)

- ✅ **一致的程式碼風格**：整個團隊程式碼風格統一
- ✅ **減少 Code Review 時間**：不需要討論格式問題
- ✅ **自動化**：儲存時自動格式化，減少手動工作
- ✅ **可讀性提升**：統一的格式提升程式碼可讀性
- ✅ **錯誤減少**：ESLint 幫助發現潛在問題

## 🔧 故障排除 (Troubleshooting)

### 格式化不生效

```bash
# 1. 確認 Prettier 配置
npm run prettier:check

# 2. 手動格式化
npm run prettier

# 3. 檢查 VSCode 擴展是否安裝
```

### ESLint 錯誤

```bash
# 查看詳細錯誤
npm run lint

# 自動修復可修復的問題
npm run lint:fix
```

---

**💡 提示**: 開始使用前，建議先運行 `npm run format` 來格式化所有現有文件。
