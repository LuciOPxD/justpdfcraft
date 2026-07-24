import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: './', // Ensures relative asset paths for GitHub Pages root deployment
  server: {
    port: 3000,
    open: true
  },
  build: {
    // html2canvas is ~1.3MB minified — it's loaded lazily on PDF export, not at page load
    chunkSizeWarningLimit: 1400,
  }
});

