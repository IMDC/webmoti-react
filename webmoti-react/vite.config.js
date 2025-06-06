import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  build: {
    outDir: 'build',
  },
  server: {
    open: false,
    port: 3000,
    proxy: {
      '/token': 'http://localhost:8081',
      '/recordingrules': 'http://localhost:8081',
    },
  },
});
