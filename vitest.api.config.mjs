// Stage 7 Gate 2 — API suite config.
//
// SEPARATE from vite.config.mjs on purpose. The offline suite includes only
// `src/**/__tests__/**`, so these tests never run during `npm test` and the
// offline/CI-fast job stays independent of Docker.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/api/**/*.test.mjs'],
    // The fixture shells out to psql and the concurrency test opens two
    // in-flight HTTP requests; the default 5s is too tight for a cold stack.
    testTimeout: 30_000,
    hookTimeout: 120_000,
    // Fixtures are shared mutable state in one database — no parallel files.
    fileParallelism: false,
  },
});
