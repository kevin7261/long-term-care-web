// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })

// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ✅ 若你的 GitHub repo 是 my-vue-project，請填 '/my-vue-project/'
// ✅ 若你的 repo 是 username.github.io（部署到主頁），請填 '/'。
export default defineConfig({
  base: '/long-term-care-web/',
  plugins: [vue()]
})``
