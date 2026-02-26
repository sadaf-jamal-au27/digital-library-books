import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/setup.js'],
    testTimeout: 15000,
    hookTimeout: 15000,
    // Run all tests in one process so they share the same MongoMemoryServer (avoids 0 tests / connection issues in CI)
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
