import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use browser environment for real browser APIs
    browser: {
      // ui: false,
      enabled: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
          headless: true,
          launch: {
            args: ['--high-dpi-support=1', '--force-device-scale-factor=2'],
          },
        },
      ],
    },

    // Global test setup
    globals: true,

    // Test file patterns
    include: ['tests-vitest/**/*.test.ts'],

    // Environment variables
    env: {
      VEXFLOW_VISUAL_REGRESSION: process.env.VEXFLOW_VISUAL_REGRESSION || '0',
    },

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

    // Don't open UI automatically in CI
    open: false,
  },

  // Preview server settings for browser mode
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
