import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxies frontend calls to /api/* straight to the Express backend
    // during local dev, so the frontend never needs to hardcode a host.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
