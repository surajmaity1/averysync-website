import { cloudflare } from "@cloudflare/vite-plugin";
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), cloudflare({ viteEnvironment: { name: 'ssr' } })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  }
})
