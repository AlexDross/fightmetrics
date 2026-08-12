// The rankings boundaries, enforced by resolving the real import graph rather
// than trusting review. Three separate rules:
//
//   1. MODEL BOUNDARY. v1 is deprecated and frozen; it keeps its own legacy
//      ranking path (UFC_RANKINGS in domain/model) so its arithmetic stays
//      byte-exact until v1 is retired. The frozen 16-feature MODEL_V2 reads no
//      ranking at all. A regression would silently move live betting numbers.
//
//   2. BUNDLE BOUNDARY. The historical artifact (~190 kB of transitions and
//      tombstones) has no runtime consumer. If anything reachable from the app
//      entry imports it, every browser downloads it. scripts/verify-bundle.mjs
//      checks the emitted assets; this checks the source graph, so the failure
//      lands on the import that caused it.
//
//   3. NO BARREL. Runtime code uses ./current.js and research code uses
//      ./history.js. A module re-exporting both would defeat rule 2.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '../../..');

const walk = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(js|mjs|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
};

// Static AND dynamic imports, plus re-exports -- a re-export pulls the module
// into the graph just as an import does.
const importSpecifiers = (source) => {
  const specs = [];
  const patterns = [
    /^\s*import[\s\S]*?from\s*['"]([^'"]+)['"]/gm,
    /^\s*import\s*['"]([^'"]+)['"]/gm,
    /^\s*export[\s\S]*?from\s*['"]([^'"]+)['"]/gm,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    for (const [, spec] of source.matchAll(re)) specs.push(spec);
  }
  return specs;
};

// Vite resolves extensionless and directory imports; mirror that.
const resolveSpec = (fromFile, spec) => {
  if (!spec.startsWith('.')) return null; // bare specifier -> node_modules
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
};

/** Transitive closure of local modules reachable from `entries`. */
const reachableFrom = (entries) => {
  const seen = new Set();
  const edges = new Map(); // file -> importer
  const queue = [...entries];
  for (const e of entries) seen.add(e);
  while (queue.length) {
    const file = queue.pop();
    const source = fs.readFileSync(file, 'utf8');
    for (const spec of importSpecifiers(source)) {
      const resolved = resolveSpec(file, spec);
      if (!resolved || seen.has(resolved)) continue;
      seen.add(resolved);
      edges.set(resolved, file);
      queue.push(resolved);
    }
  }
  return { seen, edges };
};

const chainTo = (edges, target) => {
  const chain = [target];
  let cursor = target;
  while (edges.has(cursor)) {
    cursor = edges.get(cursor);
    chain.push(cursor);
  }
  return chain.reverse().map((f) => path.relative(SRC, f)).join('\n     -> ');
};

const HISTORY_MODULES = [
  path.join(SRC, 'rankingsHistoryData.js'),
  path.join(SRC, 'domain/rankings/history.js'),
];

const RUNTIME_ENTRIES = [
  path.join(SRC, 'index.js'),
  path.join(SRC, 'App.js'),
  path.join(SRC, 'domain/fighters/index.js'),
  path.join(SRC, 'domain/rankings/current.js'),
];

describe('rankings bundle boundary', () => {
  it('every runtime entry point exists', () => {
    for (const entry of RUNTIME_ENTRIES) {
      expect(fs.existsSync(entry), `missing runtime entry ${entry}`).toBe(true);
    }
    for (const mod of HISTORY_MODULES) {
      expect(fs.existsSync(mod), `missing history module ${mod}`).toBe(true);
    }
  });

  it('no historical module is reachable from the production graph', () => {
    const { seen, edges } = reachableFrom(RUNTIME_ENTRIES);
    const offenders = HISTORY_MODULES
      .filter((mod) => seen.has(mod))
      .map((mod) => `${path.relative(SRC, mod)} is reachable:\n     -> ${chainTo(edges, mod)}`);
    expect(offenders, offenders.join('\n\n')).toEqual([]);
  });

  it('the runtime graph does not name the historical export at all', () => {
    const { seen } = reachableFrom(RUNTIME_ENTRIES);
    const offenders = [];
    for (const file of seen) {
      if (file.includes('__tests__')) continue;
      const source = codeOnly(fs.readFileSync(file, 'utf8'));
      if (/\bDIVISION_RANK_HISTORY\b|\bgetHistoricalRank\b/.test(source)) {
        offenders.push(path.relative(SRC, file));
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('the history entrypoint really does reach the historical artifact', () => {
    // Guards against the split being "achieved" by quietly breaking history.
    const { seen } = reachableFrom([path.join(SRC, 'domain/rankings/history.js')]);
    expect(seen.has(path.join(SRC, 'rankingsHistoryData.js'))).toBe(true);
  });

  it('no barrel module re-exports both current and historical rankings', () => {
    const offenders = [];
    for (const file of walk(path.join(SRC, 'domain/rankings'))) {
      if (file.includes('__tests__')) continue;
      const specs = importSpecifiers(fs.readFileSync(file, 'utf8'));
      const touchesCurrent = specs.some((s) => /rankingsData|\.\/current/.test(s));
      const touchesHistory = specs.some((s) => /rankingsHistoryData|\.\/history/.test(s));
      // history.js legitimately reads RANKING_ALIASES from the current artifact;
      // what must not exist is a module the UI can reach that also pulls history.
      if (touchesCurrent && touchesHistory && !file.endsWith('history.js')) {
        offenders.push(path.relative(SRC, file));
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
    expect(
      fs.existsSync(path.join(SRC, 'domain/rankings/index.js')),
      'domain/rankings/index.js must not exist -- it would be exactly that barrel'
    ).toBe(false);
  });
});

// Strip comments and string literals so a doc comment or a generated
// provenance note that merely NAMES a symbol is not mistaken for a consumer.
function codeOnly(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

const RANKING_MODULES = /(^|\/)(rankingsData(\.js)?|rankingsHistoryData(\.js)?|rankings\/(current|history|index)\.js)$/;

describe('rankings <-> model boundary', () => {
  const protectedDirs = ['domain/model', 'domain/betting'];

  it('no model or betting source imports the rankings domain or artifacts', () => {
    const offenders = [];
    for (const dir of protectedDirs) {
      const root = path.join(SRC, dir);
      if (!fs.existsSync(root)) continue;
      for (const file of walk(root)) {
        for (const spec of importSpecifiers(fs.readFileSync(file, 'utf8'))) {
          if (RANKING_MODULES.test(spec) || spec.includes('domain/rankings')) {
            offenders.push(`${path.relative(SRC, file)} imports ${spec}`);
          }
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('the rankings domain never imports model or betting code', () => {
    const offenders = [];
    for (const file of walk(path.join(SRC, 'domain/rankings'))) {
      for (const spec of importSpecifiers(fs.readFileSync(file, 'utf8'))) {
        if (/domain\/(model|betting)/.test(spec) || /\.\.\/\.\.\/model/.test(spec)) {
          offenders.push(`${path.relative(SRC, file)} imports ${spec}`);
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('v1 keeps its own legacy ranking source, untouched by this change', () => {
    const model = fs.readFileSync(path.join(SRC, 'domain/model/index.js'), 'utf8');
    // Deliberate technical debt: removing it would move v1 arithmetic. It goes
    // when v1 is retired, not here.
    expect(model).toMatch(/const UFC_RANKINGS = \{/);
    expect(model).toMatch(/from '\.\.\/\.\.\/rankHistory'/);
  });

  it('no ranking feeds the frozen MODEL_V2 feature vector', () => {
    const model = fs.readFileSync(path.join(SRC, 'domain/model/index.js'), 'utf8');
    const featureBlock = model.slice(
      model.indexOf('const MODEL_V2 = {'),
      model.indexOf('const computeLogisticProb')
    );
    expect(featureBlock).not.toMatch(/rank/i);

    const features = JSON.parse(
      featureBlock.match(/features:\s*(\[[^\]]*\])/)[1].replace(/'/g, '"')
    );
    expect(features).toHaveLength(16);
    expect(features.some((f) => /rank/i.test(f))).toBe(false);
  });
});
