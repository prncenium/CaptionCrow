import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Proxy /api/* requests to the Render backend so the browser never sees a
    // cross-origin request — eliminates CORS issues on any localhost port.
    proxy: {
      '/api': {
        target: 'https://captioncrow-1.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
