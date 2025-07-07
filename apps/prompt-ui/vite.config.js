import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@promptverse/prompt-engine': path.resolve(__dirname, '../../packages/prompt-engine/src'),
      '@promptverse/types': path.resolve(__dirname, '../../types'),
      '@promptverse/templates': path.resolve(__dirname, '../../templates')
    }
  },
  server: {
    port: 8001,
    open: true
  }
})
