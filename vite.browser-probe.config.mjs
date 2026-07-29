// Stage 6 — browser-compatibility probe for the durable data layer.
//
// src/data must be reachable from the browser: Stage 7 will run the migration
// and repositories against IndexedDB. A Node builtin anywhere in that tree
// breaks the browser bundle, and nothing else in this repo would notice,
// because App.js does not import the data layer yet.
//
// This is a REAL Rollup/Vite browser build of the data-layer entry points, not
// a source-text check. A `node:crypto` import fails it outright with
// "createHash is not exported by __vite-browser-external", which is exactly how
// the original implementation was caught.
//
//   npm run probe:browser
//
// Bound as a test in src/data/schemas/__tests__/browserSafety.test.mjs.
import { defineConfig } from 'vite';

export default defineConfig({
  logLevel: 'error',
  // No public assets: this probe builds modules, not an app.
  publicDir: false,
  build: {
    outDir: 'build-browser-probe',
    emptyOutDir: true,
    minify: false,
    write: true,
    lib: {
      entry: {
        ids: 'src/data/migration/ids.mjs',
        migrate: 'src/data/migration/migrateV0ToV1.mjs',
        dispatcher: 'src/data/migration/dispatcher.mjs',
        schemas: 'src/data/schemas/entities.mjs',
        invariants: 'src/data/schemas/invariants.mjs',
        // Stage 7 Gate 1: the repository layer runs in the browser from Gate 6,
        // so it is probed from the moment it exists rather than when it is wired.
        repoTypes: 'src/data/repositories/types.mjs',
        repoInterfaces: 'src/data/repositories/interfaces.mjs',
        repoInMemory: 'src/data/repositories/inMemory.mjs',
      },
      formats: ['es'],
    },
    rollupOptions: {
      // zod is a real dependency and may stay external; NOTHING else should be.
      // In particular no node: builtin may appear in the externalised set.
      external: ['zod'],
    },
  },
});
