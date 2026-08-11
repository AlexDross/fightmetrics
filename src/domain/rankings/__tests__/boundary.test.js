// The rankings/model boundary, enforced by reading source rather than trusting
// review. Rankings are approved for data + current UI metadata ONLY:
//
//   * v1 is deprecated and frozen. It keeps its own legacy ranking path
//     (UFC_RANKINGS in domain/model) so its arithmetic stays byte-exact until
//     v1 is retired -- the rankings domain must not leak into it.
//   * The frozen 16-feature MODEL_V2 reads no ranking of any kind.
//   * DIVISION_RANK_HISTORY is a research artifact with no runtime consumer.
//
// A regression here would silently move live betting probabilities, which is
// exactly what this change set was scoped to avoid.
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
    else if (/\.(js|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
};

const importSpecifiers = (source) => {
  const specs = [];
  for (const [, spec] of source.matchAll(/^import[\s\S]*?from\s*['"]([^'"]+)['"];/gm)) {
    specs.push(spec);
  }
  for (const [, spec] of source.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specs.push(spec);
  }
  return specs;
};

const RANKING_MODULES = /(^|\/)(rankingsData(\.js)?|rankings(\/index\.js)?)$/;

describe('rankings <-> model boundary', () => {
  const protectedDirs = ['domain/model', 'domain/betting'];

  it('no model or betting source imports the rankings domain or artifact', () => {
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

  it('the historical artifact has no runtime consumer outside the rankings domain', () => {
    const offenders = [];
    for (const file of walk(SRC)) {
      const relative = path.relative(SRC, file);
      // The rankings domain owns it, and rankingsData.js DECLARES it.
      if (relative.startsWith('domain/rankings')) continue;
      if (relative === 'rankingsData.js') continue;
      if (relative.includes('__tests__')) continue;
      const source = fs.readFileSync(file, 'utf8');
      if (/\bDIVISION_RANK_HISTORY\b|\bgetHistoricalRank\b/.test(source)) {
        offenders.push(relative);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
