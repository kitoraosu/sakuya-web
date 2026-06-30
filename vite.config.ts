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
    port: 11001,
    strictPort: true,
    allowedHosts: ['sakuya.qzz.io'],
    // /api и /uploads проксируются на Express (server/index.ts)
    proxy: {
      '/api': 'http://localhost:11002',
      '/uploads': 'http://localhost:11002',
    },
  },
})
