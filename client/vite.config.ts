import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const buildTimestamp = Date.now();

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${buildTimestamp}.js`,
        chunkFileNames: `assets/[name]-${buildTimestamp}.js`,
        assetFileNames: `assets/[name]-${buildTimestamp}.[ext]`
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
