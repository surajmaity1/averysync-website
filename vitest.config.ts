import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

// Scoped to unit tests only so it never picks up the Playwright e2e specs
// under tests/playwright (which use `.spec.ts`).
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
