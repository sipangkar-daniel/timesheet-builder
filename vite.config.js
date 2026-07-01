import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      html2canvas: 'html2canvas-pro'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) {
              return 'vendor-react';
            }
            if (id.includes('jspdf-autotable') || id.includes('jspdf')) {
              return 'vendor-pdf';
            }
            if (id.includes('html2pdf.js')) {
              return 'vendor-html2pdf';
            }
            if (id.includes('html2canvas-pro') || id.includes('html2canvas')) {
              return 'vendor-canvas';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        }
      }
    }
  }
})
