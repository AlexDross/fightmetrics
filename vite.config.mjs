import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Foundation Stage 1a -- replaces react-scripts (CRA 5.0.1, unmaintained since
// 2022). No application code changes in this stage beyond the dev-guard swap.
//
// Named .mjs deliberately: package.json has no "type": "module", so a
// vite.config.js using ESM syntax would be ambiguous, while tailwind.config.js
// and postcss.config.js must stay CommonJS.
export default defineConfig({
  plugins: [
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

  build: {
    // Kept as `build` (not Vite's default `dist`) so the existing Vercel
    // project settings and .gitignore keep working. vercel.json pins it
    // explicitly regardless.
    outDir: 'build',
    // Baseline (CRA) emitted source maps; keep them on so the Stage 0 bundle
    // size comparison in baseline/metrics.md is like for like.
    sourcemap: true,
  },
});
