import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use browser environment for real browser APIs
    browser: {
      enabled: true,
      provider: 'preview',
      instances: [
        {
          browser: 'chromium',
          headless: false,
        },
      ],
    },

    // Global test setup
    globals: true,

    // Test file patterns
    include: ['tests-vitest/**/*.test.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'tests-vitest/', 'build/', 'reference/', 'releases/'],
    },

    // Timeout for tests (music rendering can be slow)
    testTimeout: 10000,

    // Setup files to run before tests
    setupFiles: ['./tests-vitest/setup.ts'],

    // Open UI automatically in default browser
    open: true,
  },

  // Preview server settings for browser mode
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
