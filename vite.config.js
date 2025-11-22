import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true, // Bắt buộc dùng port 5173, không tự động chuyển port
    open: true,
    proxy: {
      '/api': {
        target: 'https://tiembanhvuive.io.vn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Giữ nguyên path /api
      },
    },
  },
});

