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
})
