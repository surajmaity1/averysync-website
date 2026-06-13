import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    testTimeout: 30000,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
