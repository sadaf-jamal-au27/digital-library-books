import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/setup.js'],
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
