import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import Checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    react(),
    Checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  }
})
