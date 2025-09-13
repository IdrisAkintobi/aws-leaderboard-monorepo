import fs from 'fs';
import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/localhost.pem')),
    },
    // Make sure the server is accessible over the local network
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
