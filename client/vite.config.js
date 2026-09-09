import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { cpSync, existsSync } from 'fs'

// Petit script intégré pour copier les wasm d'onnxruntime-web s'ils existent
if (existsSync('node_modules/onnxruntime-web/dist')) {
  try {
    cpSync('node_modules/onnxruntime-web/dist', 'public', { recursive: true, filter: (src) => src.endsWith('.wasm') || !src.includes('.') })
  } catch (e) {
    console.warn('Could not copy wasm files automatically:', e)
  }
}

export default defineConfig({
  plugins: [
    react()
  ],

  assetsInclude: [
    '**/*.onnx',
    '**/*.data'
  ],

  server: {
    fs: {
      allow: ['.']
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})