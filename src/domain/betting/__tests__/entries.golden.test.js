import { describe, it, expect } from 'vitest';
// buildRoiEntry is reached through frozenRoiEntry so the entry goldens use the
// same frozen division averages as the model goldens they embed.
import { buildProvenance } from '../index.js';
import { SOURCE_MANIFEST } from '../../../sourceManifest.js';
import { loadFixture, expectExact, frozenRoiEntry } from '../../../__tests__/goldenSupport.js';

const { fighterFixtures } = loadFixture('fighters.golden.json');
const { entryGoldens, volatileEntryPaths } = loadFixture('entries.golden.json');

// buildRoiEntry stamps four values that cannot be deterministic:
//   id                                  Date.now() + Math.random()
//   createdAt                           new Date()
//   _provenance.predictionTimestamp     new Date()
//   _provenance.captureMode             derived from today vs eventDate
// The capture replaced each with the literal "<VOLATILE>". Tests canonicalise
// the same four paths and compare everything else exactly.
//
// No production API change was needed for this. The optional now/generateId
// injection sketched in the plan is NOT required -- see the Stage 4 report.
const get = (o, p) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
const set = (o, p, v) => {
  const parts = p.split('.');
  const last = parts.pop();
  const t = parts.reduce((x, k) => (x == null ? undefined : x[k]), o);
  if (t && typeof t === 'object') t[last] = v;
};

// _provenance.sourceManifest is a PROVENANCE STAMP of the data that produced the
// entry: content hashes, generation dates and observed-event dates. It changes on
// every data refresh BY DESIGN — that is what the Update Fighters workflow exists
// to do — so a Stage 0 capture can never permanently equal it. Pinning it made the
// golden fail on every refresh (regen_elo.py alone moved elo.contentHash), which
// is a false alarm about entry/model behaviour.
//
// It is therefore replaced by one sentinel on BOTH sides here, and its real value
// is asserted separately below against the live SOURCE_MANIFEST. That splits the
// two responsibilities cleanly:
//   * this golden protects entry/model behaviour, exactly, field by field;
//   * the direct test protects correct stamping of the CURRENT manifest.
// Nothing else is loosened: every other field stays an exact comparison.
const LIVE_SOURCE_MANIFEST = '<LIVE_SOURCE_MANIFEST>';

function canonicalise(entry) {
  const clone = structuredClone(entry);
  for (const p of volatileEntryPaths) set(clone, p, '<VOLATILE>');
  set(clone, '_provenance.sourceManifest', LIVE_SOURCE_MANIFEST);
  return clone;
}

const pairFighters = (pair) => {
  // fixture pair labels are "A vs B"; names may themselves contain spaces
  for (const name of Object.keys(fighterFixtures)) {
    if (pair.startsWith(`${name} vs `)) {
      const other = pair.slice(name.length + 4);
      if (fighterFixtures[other]) return [fighterFixtures[name], fighterFixtures[other]];
    }
  }
  return [null, null];
};

describe('buildRoiEntry — exact golden replay', () => {
  it('reproduces all 32 captured entries exactly, both model toggles', () => {
    expect(entryGoldens.length).toBe(32);
    for (const g of entryGoldens) {
      expect(g.error, `${g.pair} ${g.modelToggle} captured an error`).toBeUndefined();
      const [fA, fB] = pairFighters(g.pair);
      expect(fA, `missing fixture for ${g.pair}`).toBeTruthy();
      const built = frozenRoiEntry({
        fA, fB, oddsA: '-150', oddsB: '+130',
        eventName: 'GOLDEN FIXTURE EVENT', eventDate: '2026-08-01',
        modelToggle: g.modelToggle, unitsWagered: 1,
      });
      // canonicalise BOTH sides: the stored golden already carries <VOLATILE> in
      // the four volatile paths (re-setting them is a no-op), and this replaces
      // the captured manifest with the same sentinel as the freshly built entry.
      expectExact(canonicalise(built), canonicalise(g.canonical), `${g.pair} [${g.modelToggle}]`);
    }
  });

  it('stamps the CURRENT live source manifest on every entry', () => {
    // The half the golden deliberately no longer pins. Exact equality against the
    // live manifest, so a wrong, stale or partially-populated stamp still fails.
    for (const g of entryGoldens) {
      const [fA, fB] = pairFighters(g.pair);
      const built = frozenRoiEntry({
        fA, fB, oddsA: '-150', oddsB: '+130',
        eventName: 'GOLDEN FIXTURE EVENT', eventDate: '2026-08-01',
        modelToggle: g.modelToggle, unitsWagered: 1,
      });
      expect(built._provenance.sourceManifest).toEqual(SOURCE_MANIFEST.modules);
    }
  });

  it('negative control: an unrelated entry-field mutation still fails', () => {
    // Proves the sentinel did not blunt the golden — everything outside the
    // manifest is still compared exactly.
    const g = entryGoldens[0];
    const [fA, fB] = pairFighters(g.pair);
    const built = frozenRoiEntry({
      fA, fB, oddsA: '-150', oddsB: '+130',
      eventName: 'GOLDEN FIXTURE EVENT', eventDate: '2026-08-01',
      modelToggle: g.modelToggle, unitsWagered: 1,
    });
    const mutated = canonicalise(built);
    mutated.edgeA += 1e-9;                       // one perturbed model number
    expect(() => expectExact(mutated, canonicalise(g.canonical), 'mutated'))
      .toThrow(/edgeA/);

    const renamed = canonicalise(built);
    renamed.predictedWinner = `${renamed.predictedWinner} (mutated)`;
    expect(() => expectExact(renamed, canonicalise(g.canonical), 'mutated'))
      .toThrow(/predictedWinner/);
  });

  it('covers both v1 and v2 toggles', () => {
    expect(entryGoldens.filter((g) => g.modelToggle === 'v1').length).toBe(16);
    expect(entryGoldens.filter((g) => g.modelToggle === 'v2').length).toBe(16);
  });

  it('freezes modelUsed to the toggle it was built with', () => {
    for (const g of entryGoldens) expect(g.canonical.modelUsed).toBe(g.modelToggle);
  });

  it('only the four declared paths are volatile — a repeat build is otherwise identical', () => {
    const g = entryGoldens[0];
    const [fA, fB] = pairFighters(g.pair);
    const args = {
      fA, fB, oddsA: '-150', oddsB: '+130',
      eventName: 'GOLDEN FIXTURE EVENT', eventDate: '2026-08-01',
      modelToggle: g.modelToggle, unitsWagered: 1,
    };
    const a = frozenRoiEntry(args);
    const b = frozenRoiEntry(args);
    expectExact(canonicalise(a), canonicalise(b), 'repeat build after canonicalisation');
    expect(a.id).not.toBe(b.id);   // genuinely volatile
  });
});

describe('buildProvenance — the freeze-at-save write path', () => {
  it('accepts explicit predictionTimestamp and captureMode overrides', () => {
    const fA = fighterFixtures[Object.keys(fighterFixtures)[0]];
    const fB = fighterFixtures[Object.keys(fighterFixtures)[1]];
    const p = buildProvenance({
      eventDate: '2026-08-01',
      result: { pA: 0.6, pB: 0.4 },
      fA, fB,
      predictionTimestamp: '2020-01-01T00:00:00.000Z',
      captureMode: 'reconstructed',
    });
    expect(p.predictionTimestamp).toBe('2020-01-01T00:00:00.000Z');
    expect(p.captureMode).toBe('reconstructed');
  });

  it('derives captureMode from eventDate when not supplied', () => {
    const fA = fighterFixtures[Object.keys(fighterFixtures)[0]];
    const fB = fighterFixtures[Object.keys(fighterFixtures)[1]];
    const base = { result: { pA: 0.6, pB: 0.4 }, fA, fB };
    expect(buildProvenance({ ...base, eventDate: '' }).captureMode).toBe('unknown');
    expect(buildProvenance({ ...base, eventDate: '2099-01-01' }).captureMode).toBe('live');
    expect(buildProvenance({ ...base, eventDate: '2000-01-01' }).captureMode).toBe('reconstructed');
  });

  it('records frozenTier when the caller supplies one, and omits it otherwise', () => {
    const fA = fighterFixtures[Object.keys(fighterFixtures)[0]];
    const fB = fighterFixtures[Object.keys(fighterFixtures)[1]];
    const base = { eventDate: '2026-08-01', result: { pA: 0.6, pB: 0.4 }, fA, fB };
    expect(buildProvenance({ ...base, frozenTier: 'LEAN' }).frozenTier).toBe('LEAN');
    expect(buildProvenance(base).frozenTier).toBeUndefined();
  });
});
