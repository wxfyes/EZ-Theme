import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/assets/admin-new/',
  plugins: [vue()],
  build: {
    outDir: 'E:/GitHub/v2board/public/assets/admin-new',
    emptyOutDir: true
  }
})
