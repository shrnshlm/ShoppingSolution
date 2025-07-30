import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Skip type checking during build for faster deployment
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    }
  },
  // Disable type checking in build
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})