import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Foundation Stage 1a -- replaces react-scripts (CRA 5.0.1, unmaintained since
// 2022). No application code changes in this stage beyond the dev-guard swap.
//
// Named .mjs deliberately: package.json has no "type": "module", so a
// vite.config.js using ESM syntax would be ambiguous.
//
// Stage 1b: Tailwind v4 via its own Vite plugin. tailwind.config.js and
// postcss.config.js are gone -- v4 detects sources automatically and needs no
// PostCSS pipeline (autoprefixing is handled internally by Lightning CSS).
// The official @tailwindcss/upgrade tool migrated to the PostCSS path; switched
// here to the Vite plugin, which is the recommended and faster route for Vite.
export default defineConfig({
  plugins: [
    tailwindcss(),
    // src/App.js and src/index.js contain JSX in .js files (1,068 className
    // sites). esbuild only treats .jsx as JSX by default, so widen it here
    // rather than renaming the files -- the baseline records, risk register and
    // commit history all reference App.js line numbers.
    react({ include: /\.(jsx?|tsx?)$/ }),
  ],

  // The react plugin's `include` covers module transforms, but the HTML entry
  // (vite:build-html) hands src/index.js straight to esbuild, which defaults to
  // the .js loader and rejects JSX. Widen esbuild itself for src/**.
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },

  // Same widening for the dependency pre-bundler.
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },

  server: { port: 3001 },
  preview: { port: 4173 },

  // Foundation Stage 4. The domain modules are pure ES modules with no DOM
  // dependency, so the suite runs in plain Node -- no jsdom, no browser, no
  // dev server. Deliberately NOT a DOM environment: adding one would invite
  // tests that render components, which belongs to a later stage.
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.js'],
    // fixtures/ holds data, not tests
    exclude: ['**/node_modules/**', 'src/__tests__/fixtures/**'],
    // Determinism, accurately described:
    //   retry: 0            a flaky test fails rather than being masked
    //   shuffle: false      fixed ordering WITHIN a file
    // File-level parallelism is left at Vitest's default and is deliberately
    // NOT disabled: every test here is a pure function of frozen fixtures, so
    // there is no shared state to serialise. (An earlier comment implied
    // serial execution, which shuffle: false does not provide.)
    retry: 0,
    sequence: { shuffle: false },
    testTimeout: 20000,
    hookTimeout: 20000,
  },

  build: {
    // Kept as `build` (not Vite's default `dist`) so the existing Vercel
    // project settings and .gitignore keep working. vercel.json pins it
    // explicitly regardless.
    outDir: 'build',

    // Source maps are OFF by default.
    //
    // CRA emitted them, and so did Stage 1a's first build. The emitted
    // index-*.js.map was 12.9 MB and carried `sourcesContent` for 445 modules
    // -- including the COMPLETE 471,657-character src/App.js, i.e. the MODEL
    // object, the v2 logistic coefficients, every betting/statistics function
    // and the dev bridge. Verified by reading the map, not assumed.
    //
    // The bridge is genuinely absent from executable JavaScript (grep = 0, and
    // window.__FM_GOLDEN_INTERNALS__ is undefined at runtime), but "absent from
    // the production build" was too strong a claim while the map shipped the
    // source alongside it.
    //
    // Opt in deliberately for a debugging build:
    //   FM_SOURCEMAP=true npm run build
    // Deliberately NOT named VITE_* -- that prefix would embed the value in the
    // client bundle.
    sourcemap: process.env.FM_SOURCEMAP === 'true',
  },
});
