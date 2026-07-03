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
    // Proxy /api/* requests to the local Express server so the browser never sees a
    // cross-origin request — eliminates CORS issues on any localhost port.
    // Regex (leading '^') so it only matches "/api/..." and NOT "/api-config.js",
    // which must be served as a static file from public/ instead.
    proxy: {
      '^/api/': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
