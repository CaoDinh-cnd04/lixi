import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: dùng base '/tên-repo/' (vd: /web-lixi/). User site (username.github.io) để base: '/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    host: true
  }
});
