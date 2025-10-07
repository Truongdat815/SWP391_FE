import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@api', replacement: path.resolve(__dirname, 'src/api') },
      { find: '@store', replacement: path.resolve(__dirname, 'src/store') },
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://103.188.243.122:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});