import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { encodeFightHistory } from './src/domain/fighters/fightHistoryCodec.js';

// Ships src/fightHistory.js in a compact table form instead of the generated
// pretty-printed literal: ~2.9 MB -> ~1.0 MB of JavaScript to parse at
// startup. The decoder rebuilds deep-equal objects (key order included), so
// every model input is unchanged. The plugin runs under Vitest too, and
// src/domain/fighters/__tests__/fightHistoryCodec.test.mjs asserts that the
// module the app imports is deep-equal to the generated file. The file on disk
// is never touched. See src/domain/fighters/fightHistoryCodec.js.
const FIGHT_HISTORY_PREFIX = 'export const FIGHT_HISTORY =';
function compactFightHistory() {
  return {
    name: 'fm-compact-fight-history',
    enforce: 'pre',
    transform(code, id) {
      if (!/[\\/]src[\\/]fightHistory\.js$/.test(id.split('?')[0])) return null;
      const body = code.trim();
      if (!body.startsWith(FIGHT_HISTORY_PREFIX)) {
        throw new Error('fightHistory.js no longer starts with `export const FIGHT_HISTORY =`; update fm-compact-fight-history');
      }
      // The pipeline writes strict JSON after the prefix (json.dumps); a parse
      // failure here fails the build rather than shipping something different.
      const history = JSON.parse(body.slice(FIGHT_HISTORY_PREFIX.length).replace(/;\s*$/, ''));
      const packed = JSON.stringify(JSON.stringify(encodeFightHistory(history)));
      return {
        code:
          "import { decodeFightHistory } from './domain/fighters/fightHistoryCodec.js';\n" +
          `export const FIGHT_HISTORY = decodeFightHistory(JSON.parse(${packed}));\n`,
        map: null,
      };
    },
  };
}

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
    compactFightHistory(),
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
  // dev server. The DEFAULT stays `node` for exactly that reason.
  //
  // Stage 7 Gate 4 is the "later stage" the original note pointed at: the auth
  // provider and the Info-footer sign-in UI are React components whose contract
  // is behavioural -- listener cleanup, sign-out actually clearing state, an
  // expired-link notice being dismissible -- and none of that is observable
  // without a DOM. Those two files opt in PER FILE with a
  // `// @vitest-environment jsdom` docblock, so every other test in the suite
  // still runs in plain Node and pays nothing for it.
  test: {
    environment: 'node',
    // Two entries rather than a {js,mjs} brace group: brace groups have already
    // caused one build failure in this project (Tailwind's @source), so they
    // are avoided in glob strings on principle.
    //
    // .test.mjs exists for src/data: Tailwind's @source globs match .js/.jsx
    // under src/ whether or not a file is imported, so a TEST that merely
    // mentions a utility-like string ("static") changes the production CSS.
    // Keeping the schema tree — tests included — on .mjs puts it out of reach.
    include: ['src/**/__tests__/**/*.test.js', 'src/**/__tests__/**/*.test.mjs'],
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

    // Cache-friendly chunks. Bots regenerate the data modules several times a
    // week; in a single bundle each refresh made every visitor re-download the
    // whole ~1 MB (gzip), app code and libraries included. Split, a fighter
    // refresh only invalidates `fighter-data`/`fight-history`, a snapshot only
    // `ledger`, and an app change only the small entry chunk. All of these are
    // still loaded up front (no behaviour change); they are just cached apart.
    rollupOptions: {
      output: {
        manualChunks(id) {
          const file = id.split('?')[0];
          if (/[\\/]src[\\/]fightHistory\.js$/.test(file)) return 'fight-history';
          if (/[\\/]src[\\/](roiData|upcomingData|propPicksData|parlayData)\.js$/.test(file)) return 'ledger';
          if (/[\\/]src[\\/](fightersData|eloModule|cardioModule|rankHistory|rankingsData|fighterBirthdates|prospectsData|sourceManifest|fighterPhotos)\.js$/.test(file)) return 'fighter-data';
          if (!file.includes('node_modules')) return undefined;
          if (/node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|decimal\.js-light|react-smooth|recharts-scale)[\\/]/.test(file)) return 'charts';
          if (/node_modules[\\/]@supabase[\\/]/.test(file)) return 'supabase';
          return 'vendor';
        },
      },
    },
  },
});
