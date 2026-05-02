/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(process.env.PORT || '3000'),
    proxy: {
      '/api/sauto': {
        target: 'https://www.sauto.cz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sauto/, ''),
      },
    },
  },
  build: {
    // Code-splitting kvůli velkým static datům (manufacturers, codebooks)
    // i node_modules — zlepší TTI a cache hit-rate při deploy
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/ },
            { name: 'vendor-supabase', test: /[\\/]node_modules[\\/]@supabase[\\/]/ },
            { name: 'vendor-query', test: /[\\/]node_modules[\\/]@tanstack[\\/]/ },
            { name: 'vendor-icons', test: /[\\/]node_modules[\\/]lucide-react[\\/]/ },
            { name: 'data-manufacturers', test: /[\\/]src[\\/]lib[\\/]manufacturers\.ts$/ },
            { name: 'data-codebooks', test: /[\\/]src[\\/]lib[\\/]codebooks\.ts$/ },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
