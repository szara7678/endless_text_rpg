import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  // GitHub Pages 배포를 위한 base path 설정
  base: process.env.NODE_ENV === 'production' ? '/endless_text_rpg/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 소스맵 생성하지 않아 배포 크기 줄이기
    sourcemap: false,
    // 청크 크기 제한 경고 비활성화
    chunkSizeWarningLimit: 1600,
  }
}) 