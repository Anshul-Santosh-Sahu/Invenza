import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // <-- 1. ADD THIS IMPORT

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { // <-- 2. ADD THIS ENTIRE 'resolve' BLOCK
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})