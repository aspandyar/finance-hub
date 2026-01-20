import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages (set to repository name if using project pages)
  // Leave empty or set to '/' for root deployment
  base: process.env.GITHUB_PAGES
    ? '/finance-hub/'
    : '/',
  server: {
    port: Number(process.env.VITE_DEV_PORT) || 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})

