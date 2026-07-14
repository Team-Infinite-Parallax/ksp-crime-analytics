import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    proxy: {
      '/predictions': 'http://localhost:3001',
      '/alerts': 'http://localhost:3001',
      '/clustering': 'http://localhost:3001',
      '/risk': 'http://localhost:3001',
      '/dashboard': 'http://localhost:3001',
      '/hotspots': 'http://localhost:3001',
      '/voice_ai': 'http://localhost:3001',
      '/network': 'http://localhost:3001',
      '/crimelist': 'http://localhost:3001',
      '/ai-agent': 'http://localhost:3001',
      '/server': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
