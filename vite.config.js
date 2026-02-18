import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        // Оптимизация кеширования - отдельные чанки для изображений
        manualChunks: {
          'pixel-streaming': ['@epicgames-ps/lib-pixelstreamingfrontend-ue5.4'],
        },
        // Оптимизация имен файлов для лучшего кеширования
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.jpg') || assetInfo.name.endsWith('.png')) {
            return 'images/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        },
      },
    },
    // Увеличиваем лимит для предупреждений о размере чанков
    chunkSizeWarningLimit: 1000,
  },
  // Оптимизация для production
  optimizeDeps: {
    include: ['@epicgames-ps/lib-pixelstreamingfrontend-ue5.4'],
  },
})
