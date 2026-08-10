import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../../roiData.js';
import { UPCOMING_ENTRIES } from '../../../upcomingData.js';
import { PROP_PICKS } from '../../../propPicksData.js';
import { PARLAY_ENTRIES } from '../../../parlayData.js';
import { migrateV0ToV1 } from '../migrateV0ToV1.mjs';
import {
  migrateToCurrent, migrateAndValidate, versionOf, CURRENT_VERSION,
  UnknownFutureVersionError,
} from '../dispatcher.mjs';
import { StoreSchema } from '../../schemas/entities.mjs';
import { checkInvariants } from '../../schemas/invariants.mjs';
import { eventNameKey, fighterKey } from '../ids.mjs';

const LEGACY = {
  roiEntries: ROI_ENTRIES,
  upcomingEntries: UPCOMING_ENTRIES,
  propPicks: PROP_PICKS,
  parlayEntries: PARLAY_ENTRIES,
};
const ALL_ENTRIES = [...ROI_ENTRIES, ...UPCOMING_ENTRIES];
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const blank = (v) => v === undefined || v === null || v === '';
const countBy = (items, keyOf) => Object.fromEntries(
  items.reduce((counts, item) => {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map())
);
const sourceEventCount = () => new Set(
  ALL_ENTRIES.map((e) => `${e.eventDate}\u0000${eventNameKey(e.eventName)}`)
).size;
const sourceBoutCount = () => new Set(
  ALL_ENTRIES.map((e) =>
    `${e.eventDate}\u0000${eventNameKey(e.eventName)}\u0000` +
    [fighterKey(e.fighterA), fighterKey(e.fighterB)].sort().join('\u0000')
  )
).size;
const sourceMarketSnapshotCount = () => ALL_ENTRIES.reduce((total, entry) => {
  const oddsA = blank(entry.oddsA) ? null : Number(entry.oddsA);
  const oddsB = blank(entry.oddsB) ? null : Number(entry.oddsB);
  const assessmentCount = oddsA !== null || oddsB !== null ? 1 : 0;
  if (!has(entry, 'marketOdds')) return total + assessmentCount;

  const trackedIsA = entry.trackedSide === entry.fighterA;
  const assessmentSelected = trackedIsA ? oddsA : oddsB;
  const explicitlyBlank = entry.marketOdds === '' || entry.marketOdds === null;
  const trackedOdds = explicitlyBlank ? null : Number(entry.marketOdds);
  if (!explicitlyBlank && trackedOdds === assessmentSelected) return total + assessmentCount;

  const trackedA = trackedIsA ? trackedOdds : oddsA;
  const trackedB = trackedIsA ? oddsB : trackedOdds;
  const overrideCount = trackedA !== null || trackedB !== null ? 1 : 0;
  return total + assessmentCount + overrideCount;
}, 0);
const sourceSettlementStatus = (entry) => blank(entry.actualWinner) ? 'open' : 'settled';
const sourceOutcome = (entry) => {
  if (entry.actualWinner === 'NC') return 'void';
  if (entry.actualWinner === 'DRAW') return 'push';
  return entry.actualWinner === entry.trackedSide ? 'won' : 'lost';
};
const sourceTrackedOdds = (entry) => {
  if (has(entry, 'marketOdds')) return blank(entry.marketOdds) ? null : Number(entry.marketOdds);
  return entry.trackedSide === entry.fighterA
    ? (blank(entry.oddsA) ? null : Number(entry.oddsA))
    : (blank(entry.oddsB) ? null : Number(entry.oddsB));
};

// Injected clock and ID provider: the migration must be pure, so nothing here
// reads Date.now() or Math.random(). Repeated runs are byte-identical.
const makeDeps = () => {
  let n = 0;
  return {
    migratedAt: '2026-07-28T00:00:00.000Z',
    newId: () => `00000000-0000-7000-8000-${String(n++).padStart(12, '0')}`,
  };
};

const run = () => migrateV0ToV1(LEGACY, makeDeps());
const { store, manifest, errors } = run();

describe('migration runs clean', () => {
  it('reports no errors', () => {
    expect(errors).toEqual([]);
  });

  it('produces a store that passes strict validation', () => {
    const r = StoreSchema.safeParse(store);
    expect(r.success, r.success ? '' : JSON.stringify(r.error.issues.slice(0, 3), null, 2)).toBe(true);
  });

  it('satisfies every cross-entity invariant', () => {
    expect(checkInvariants(store)).toEqual([]);
  });

  it('preserves the complete committed source without fixed weekly counts', () => {
    const entryCount = ALL_ENTRIES.length;
    const v2Count = ALL_ENTRIES.filter((e) => has(e, 'v2pA')).length;
    expect(manifest.counts).toEqual({
      events: sourceEventCount(),
      bouts: sourceBoutCount(),
      predictionRuns: entryCount,
      // One v1 per row plus one v2 wherever the legacy row stores v2 output.
      predictionSnapshots: entryCount + v2Count,
      marketSnapshots: sourceMarketSnapshotCount(),
      bettingAssessments: entryCount,
      trackedPositions: entryCount,
      wagers: 0,
      props: PROP_PICKS.length,
      // Pending parlays are live data, so this count changes as the user adds
      // and grades events. Migration must preserve every current entry.
      parlays: PARLAY_ENTRIES.length,
    });
  });

  it('creates ZERO wagers — legacy data cannot prove cash placement', () => {
    expect(store.wagers).toEqual([]);
  });

  it('preserves every current parlay and every leg', () => {
    expect(store.parlays).toHaveLength(PARLAY_ENTRIES.length);
    expect(store.parlays.reduce((n, p) => n + p.legs.length, 0))
      .toBe(PARLAY_ENTRIES.reduce((n, p) => n + p.legs.length, 0));
  });

  it('requires ROI and Upcoming ids to be unique and disjoint', () => {
    const seen = new Map();
    const duplicates = [];
    for (const [source, entries] of [['roi', ROI_ENTRIES], ['upcoming', UPCOMING_ENTRIES]]) {
      for (const entry of entries) {
        const id = String(entry.id);
        if (seen.has(id)) duplicates.push(`${id} (${seen.get(id)} and ${source})`);
        else seen.set(id, source);
      }
    }
    expect(
      duplicates,
      'A grading handoff must update roiData.js and upcomingData.js in the same commit.'
    ).toEqual([]);
  });

  it('aborts with a clear error when a legacy id appears in both sources', () => {
    const duplicate = ROI_ENTRIES[0];
    const broken = { ...LEGACY, upcomingEntries: [duplicate, ...UPCOMING_ENTRIES] };
    const out = migrateV0ToV1(broken, makeDeps());
    expect(out.errors).toContain(
      `legacy entry id ${JSON.stringify(String(duplicate.id))} appears more than once ` +
      '(roi and upcoming); ROI and Upcoming updates must be committed together'
    );
    expect(() => migrateAndValidate(broken, makeDeps())).toThrow(/ROI and Upcoming updates must be committed together/);
  });
});

describe('the complete track record is preserved', () => {
  it('every legacy row becomes a tracked position, including NO BET and no-tier rows', () => {
    expect(store.trackedPositions).toHaveLength(ROI_ENTRIES.length + UPCOMING_ENTRIES.length);
    const tiers = new Map();
    for (const a of store.bettingAssessments) {
      const k = a.tier === null ? '<none>' : a.tier;
      tiers.set(k, (tiers.get(k) ?? 0) + 1);
    }
    // Compare to the committed source rather than a stale weekly total. Dropping
    // NO BET rows would still change this distribution and fail.
    const expected = countBy(ALL_ENTRIES, (entry) =>
      has(entry, 'betAction') ? entry.betAction : entry._provenance?.frozenTier ?? '<none>'
    );
    expect(Object.fromEntries(tiers)).toEqual(expected);
    const noTier = store.bettingAssessments.filter((a) => a.tier === null);
    expect(noTier.every((a) => a.tierProvenance === 'absent')).toBe(true);
    for (const a of noTier) {
      expect(store.trackedPositions.some((t) => t.assessmentId === a.id)).toBe(true);
    }
  });

  it('preserves the source settlement-status population', () => {
    const settled = store.trackedPositions.filter((t) => t.settlement.status === 'settled');
    const open = store.trackedPositions.filter((t) => t.settlement.status === 'open');
    const expected = countBy(ALL_ENTRIES, sourceSettlementStatus);
    expect(settled).toHaveLength(expected.settled ?? 0);
    expect(open).toHaveLength(expected.open ?? 0);
    const resolvedSource = ALL_ENTRIES.filter((entry) => sourceSettlementStatus(entry) === 'settled');
    expect(countBy(settled, (t) => t.settlement.outcome)).toEqual(
      countBy(resolvedSource, sourceOutcome)
    );
    expect(countBy(settled, (t) => t.settlement.financialResult.status)).toEqual(
      countBy(resolvedSource, (entry) => {
        const outcome = sourceOutcome(entry);
        return ['push', 'void'].includes(outcome) || sourceTrackedOdds(entry) !== null
          ? 'computed'
          : 'uncomputable';
      })
    );
  });

  it('records null settledAt only for legacy-migrated settlements', () => {
    const settled = store.trackedPositions.filter((t) => t.settlement.status === 'settled');
    // The real settlement time is unknown; substituting migratedAt would turn
    // the moment of data conversion into a false historical event.
    expect(settled.every((t) => t.settlement.settledAt === null)).toBe(true);
    expect(settled.every((t) => t.origin === 'legacyMigration')).toBe(true);
    expect(manifest.migratedAt).toBe('2026-07-28T00:00:00.000Z');
  });

  it('keeps bestBet null distinct from historical absence', () => {
    const byProv = new Map();
    for (const a of store.bettingAssessments) {
      byProv.set(a.recommendedCornerProvenance, (byProv.get(a.recommendedCornerProvenance) ?? 0) + 1);
    }
    expect(Object.fromEntries(byProv)).toEqual(countBy(
      ALL_ENTRIES,
      (entry) => has(entry, 'bestBet') ? 'stored' : 'absentInLegacy'
    ));
    const stored = store.bettingAssessments.filter((a) => a.recommendedCornerProvenance === 'stored');
    const sourceStored = ALL_ENTRIES.filter((entry) => has(entry, 'bestBet'));
    expect(stored.filter((a) => a.recommendedCorner === null)).toHaveLength(
      sourceStored.filter((entry) => entry.bestBet === null).length
    );
    expect(stored.filter((a) => a.recommendedCorner !== null)).toHaveLength(
      sourceStored.filter((entry) => entry.bestBet !== null).length
    );
  });
});

describe('v1 / v2 are both preserved', () => {
  it('splits snapshots by basis without overwriting either', () => {
    const byBasis = new Map();
    for (const s of store.predictionSnapshots) byBasis.set(s.basis, (byBasis.get(s.basis) ?? 0) + 1);
    expect(Object.fromEntries(byBasis)).toEqual({
      'legacy-v1-unversioned': ALL_ENTRIES.length,
      v2: ALL_ENTRIES.filter((entry) => has(entry, 'v2pA')).length,
    });
  });

  it('records the decision basis through decisionSnapshotId only', () => {
    const byId = new Map(store.predictionSnapshots.map((s) => [s.id, s]));
    const counts = new Map();
    for (const r of store.predictionRuns) {
      const basis = byId.get(r.decisionSnapshotId).basis;
      counts.set(basis, (counts.get(basis) ?? 0) + 1);
    }
    expect(Object.fromEntries(counts)).toEqual(countBy(
      ALL_ENTRIES,
      (entry) => has(entry, 'modelUsed') ? 'v2' : 'legacy-v1-unversioned'
    ));
    // No duplicated basis flags exist to disagree with this.
    for (const r of store.predictionRuns) expect('decisionBasis' in r).toBe(false);
    for (const s of store.predictionSnapshots) expect('isDecisionBasis' in s).toBe(false);
  });

  it('reproduces every legacy probability on the right snapshot', () => {
    const bouts = new Map(store.bouts.map((b) => [b.id, b]));
    const byRun = new Map();
    for (const s of store.predictionSnapshots) {
      if (!byRun.has(s.runId)) byRun.set(s.runId, {});
      byRun.get(s.runId)[s.basis] = s;
    }
    for (const entry of [...ROI_ENTRIES, ...UPCOMING_ENTRIES]) {
      const run = store.predictionRuns.find((r) => r.legacyEntryId === entry.id);
      const bout = bouts.get(run.boutId);
      const flipped = bout.cornerA.displayName !== entry.fighterA;
      const v1 = byRun.get(run.id)['legacy-v1-unversioned'];
      const [expA, expB] = flipped
        ? [entry.fighterBProb, entry.fighterAProb]
        : [entry.fighterAProb, entry.fighterBProb];
      expect(v1.probA).toBe(expA);
      expect(v1.probB).toBe(expB);
      if ('v2pA' in entry) {
        const v2 = byRun.get(run.id).v2;
        const [e2A, e2B] = flipped ? [entry.v2pB, entry.v2pA] : [entry.v2pA, entry.v2pB];
        expect(v2.probA).toBe(e2A);
        expect(v2.probB).toBe(e2B);
      }
    }
  });

  it('attaches shared source provenance to BOTH snapshots of a full live record', () => {
    // sourceManifest and fightHistoryCutoff describe the DATA the live
    // calculation read, not one model's coefficients — several manifest modules
    // are explicitly feedsV2:true. Attaching them only to v1 made the v2
    // snapshot look like it had no provenance when the legacy record supplied it.
    const full = ALL_ENTRIES.filter((e) => e._provenance?.sourceManifest);
    expect(full.length).toBeGreaterThan(0);

    const byRun = new Map();
    for (const s of store.predictionSnapshots) {
      if (!byRun.has(s.runId)) byRun.set(s.runId, {});
      byRun.get(s.runId)[s.basis] = s;
    }

    let pairs = 0;
    for (const entry of full) {
      const run = store.predictionRuns.find((r) => r.legacyEntryId === entry.id);
      const { 'legacy-v1-unversioned': v1, v2 } = byRun.get(run.id);
      expect(v1.sourceManifest, `${entry.id} v1 manifest`).not.toBe(null);
      expect(v1.fightHistoryCutoff, `${entry.id} v1 cutoff`).not.toBe(null);
      expect(v2, `${entry.id} should have a v2 snapshot`).toBeTruthy();
      // Byte-equivalent, not merely present.
      expect(JSON.stringify(v2.sourceManifest)).toBe(JSON.stringify(v1.sourceManifest));
      expect(JSON.stringify(v2.fightHistoryCutoff)).toBe(JSON.stringify(v1.fightHistoryCutoff));
      // featureVector stays SPLIT by basis — those are genuinely per-model.
      expect(JSON.stringify(v1.featureVector)).not.toBe(JSON.stringify(v2.featureVector));
      // At least one manifest module declares it feeds v2, which is why the
      // duplication is correct rather than contradictory.
      expect(Object.values(v1.sourceManifest).some((m) => m.feedsV2 === true)).toBe(true);
      pairs++;
    }
    expect(pairs).toBe(full.length);

    const v1WithManifest = store.predictionSnapshots.filter(
      (s) => s.basis === 'legacy-v1-unversioned' && s.sourceManifest !== null
    );
    const v2WithManifest = store.predictionSnapshots.filter(
      (s) => s.basis === 'v2' && s.sourceManifest !== null
    );
    expect(v1WithManifest).toHaveLength(full.length);
    expect(v2WithManifest).toHaveLength(full.length);
    expect(store.predictionSnapshots.filter((s) => s.fightHistoryCutoff !== null)).toHaveLength(full.length * 2);
  });

  it('does not invent provenance for reconstructed records', () => {
    const reconstructed = store.predictionSnapshots.filter((s) => s.captureMode === 'reconstructed');
    expect(reconstructed).toHaveLength(
      ALL_ENTRIES.filter((entry) => entry._provenance?.captureMode === 'reconstructed').length
    );
    expect(reconstructed.length).toBeGreaterThan(0);
    for (const s of reconstructed) {
      expect(s.sourceManifest, 'reconstructed snapshots must not gain a manifest').toBe(null);
      expect(s.fightHistoryCutoff, 'reconstructed snapshots must not gain a cutoff').toBe(null);
    }
    // Their v1 partners are equally bare: the legacy rows supplied neither.
    const reconRuns = new Set(reconstructed.map((s) => s.runId));
    for (const s of store.predictionSnapshots.filter((x) => reconRuns.has(x.runId))) {
      expect(s.sourceManifest).toBe(null);
      expect(s.fightHistoryCutoff).toBe(null);
    }
  });

  it('keeps corner cutoffs orientation-correct on both snapshots', () => {
    const bouts = new Map(store.bouts.map((b) => [b.id, b]));
    let checked = 0;
    for (const entry of ALL_ENTRIES) {
      const cutoff = entry._provenance?.fightHistoryCutoff;
      if (!cutoff) continue;
      const run = store.predictionRuns.find((r) => r.legacyEntryId === entry.id);
      const bout = bouts.get(run.boutId);
      const flipped = bout.cornerA.displayName !== entry.fighterA;
      const expected = flipped
        ? { cornerA: cutoff.fighterB, cornerB: cutoff.fighterA }
        : { cornerA: cutoff.fighterA, cornerB: cutoff.fighterB };
      for (const s of store.predictionSnapshots.filter((x) => x.runId === run.id)) {
        expect(s.fightHistoryCutoff).toEqual(expected);
      }
      checked++;
    }
    expect(checked).toBe(ALL_ENTRIES.filter((e) => e._provenance?.fightHistoryCutoff).length);
  });

  it('never marks a provenance-less row as reconstructed', () => {
    const modes = new Map();
    for (const s of store.predictionSnapshots) modes.set(s.captureMode, (modes.get(s.captureMode) ?? 0) + 1);
    const expectedModes = countBy([
      ...ALL_ENTRIES.map(() => ({ mode: 'unknown' })),
      ...ALL_ENTRIES
        .filter((entry) => has(entry, 'v2pA'))
        .map((entry) => ({ mode: entry._provenance?.captureMode ?? 'unknown' })),
    ], (item) => item.mode);
    expect(Object.fromEntries(modes)).toEqual(expectedModes);
    const noProv = ALL_ENTRIES.filter((e) => !('_provenance' in e));
    expect(noProv.length).toBeGreaterThan(0);
    for (const e of noProv) {
      const run = store.predictionRuns.find((r) => r.legacyEntryId === e.id);
      expect(run.provenanceCompleteness).toBe('none');
      const snaps = store.predictionSnapshots.filter((s) => s.runId === run.id);
      expect(snaps.every((s) => s.captureMode === 'unknown')).toBe(true);
      expect(snaps.every((s) => s.reconstruction === null)).toBe(true);
    }
  });
});

describe('results and settlement', () => {
  const resolved = () => store.bouts.filter((b) => b.result.status === 'resolved');

  it('preserves DRAW with its resolved method, settling as push', () => {
    const draw = resolved().filter((b) => b.result.outcome === 'draw');
    expect(draw).toHaveLength(ALL_ENTRIES.filter((entry) => entry.actualWinner === 'DRAW').length);
    expect(draw.length).toBeGreaterThan(0);
    // The real record: a DRAW that still went to decision.
    expect(draw[0].result.method).toBe('DEC');
    const t = store.trackedPositions.find((x) => x.boutId === draw[0].id);
    expect(t.settlement.outcome).toBe('push');
    expect(t.settlement.financialResult).toEqual({ status: 'computed', profitUnits: 0 });
  });

  it('maps no-contest to void with a computed zero', () => {
    const nc = resolved().filter((b) => b.result.outcome === 'noContest');
    expect(nc).toHaveLength(ALL_ENTRIES.filter((entry) => entry.actualWinner === 'NC').length);
    expect(nc.length).toBeGreaterThan(0);
    expect(nc.every((b) => b.result.method === null)).toBe(true);
    for (const b of nc) {
      const t = store.trackedPositions.find((x) => x.boutId === b.id);
      expect(t.settlement.outcome).toBe('void');
      expect(t.settlement.financialResult).toEqual({ status: 'computed', profitUnits: 0 });
    }
  });

  it('preserves every currently unpriced row without inventing market values', () => {
    const noMarket = store.bettingAssessments.filter((a) => a.marketSnapshotId === null);
    const sourceNoMarket = ALL_ENTRIES.filter((entry) => blank(entry.oddsA) && blank(entry.oddsB));
    expect(noMarket).toHaveLength(sourceNoMarket.length);
    expect(noMarket.length).toBeGreaterThan(0);
    for (const a of noMarket) {
      for (const k of ['fairLineA', 'fairLineB', 'edgeA', 'edgeB', 'evA', 'evB', 'kellyA', 'kellyB']) {
        expect(a[k], `${k} must be null without a market`).toBe(null);
      }
    }
    const positions = noMarket.map((a) => store.trackedPositions.find((t) => t.assessmentId === a.id));
    for (const t of positions) {
      if (t.settlement.status === 'open') continue;
      if (t.settlement.outcome === 'push' || t.settlement.outcome === 'void') {
        expect(t.settlement.financialResult).toEqual({ status: 'computed', profitUnits: 0 });
      } else {
        expect(t.settlement.financialResult).toEqual({
          status: 'uncomputable', reason: 'missingSelectedCornerOdds',
        });
      }
    }
  });

  it('keeps a synthetic pending row open when both market corners are blank', () => {
    const source = UPCOMING_ENTRIES[0];
    const entry = { ...source, id: '1790000000010-noodds', oddsA: '', oddsB: '', marketOdds: '' };
    const out = migrateV0ToV1({
      roiEntries: [], upcomingEntries: [entry], propPicks: [], parlayEntries: [],
    }, makeDeps());
    expect(out.errors).toEqual([]);
    expect(out.store.marketSnapshots).toEqual([]);
    expect(out.store.bettingAssessments[0].marketSnapshotId).toBe(null);
    expect(out.store.trackedPositions[0].marketSnapshotId).toBe(null);
    expect(out.store.trackedPositions[0].settlement).toEqual({ status: 'open' });
    expect(checkInvariants(out.store)).toEqual([]);
  });

  it('computability follows the selected corner, not snapshot existence', () => {
    const markets = new Map(store.marketSnapshots.map((m) => [m.id, m]));
    const assessments = new Map(store.bettingAssessments.map((a) => [a.id, a]));
    for (const t of store.trackedPositions) {
      if (t.settlement.status !== 'settled') continue;
      if (t.settlement.outcome === 'push' || t.settlement.outcome === 'void') continue;
      const a = assessments.get(t.assessmentId);
      const m = a.marketSnapshotId ? markets.get(a.marketSnapshotId) : null;
      const selected = m ? (t.corner === 'A' ? m.oddsA : m.oddsB) : null;
      expect(t.settlement.financialResult.status).toBe(selected === null ? 'uncomputable' : 'computed');
    }
  });

  it('rejects a synthetic partial market where the selected corner is unpriced', () => {
    // A market may price one corner and not the other; the invariant must key
    // off the selected corner rather than merely "a snapshot exists".
    const clone = structuredClone(store);
    const t = clone.trackedPositions.find((x) => x.settlement.status === 'settled'
      && x.settlement.financialResult.status === 'computed'
      && x.settlement.outcome !== 'push' && x.settlement.outcome !== 'void');
    const a = clone.bettingAssessments.find((x) => x.id === t.assessmentId);
    const m = clone.marketSnapshots.find((x) => x.id === a.marketSnapshotId);
    if (t.corner === 'A') m.oddsA = null; else m.oddsB = null;
    const violations = checkInvariants(clone);
    expect(violations.some((v) => v.code === 'FINANCIAL_SHOULD_BE_UNCOMPUTABLE')).toBe(true);
  });
});

describe('promotion and events', () => {
  it('derives UFC and leaves the unknown promotion null', () => {
    expect(store.events).toHaveLength(sourceEventCount());
    const freedom = store.events.find((e) => e.name === 'Freedom 250');
    // The saved name proves only that it lacks a UFC prefix — not who ran it.
    expect(freedom.promotion).toBe(null);
    expect(store.events.filter((e) => e.promotion === 'UFC')).toHaveLength(
      store.events.filter((e) => /^UFC\b/.test(e.name)).length
    );
    expect(store.events.filter((e) => e.promotion === null)).toHaveLength(
      store.events.filter((e) => !/^UFC\b/.test(e.name)).length
    );
    const entry = manifest.unresolved.find((u) => u.entity === 'Event' && u.field === 'promotion');
    expect(entry).toBeTruthy();
    expect(entry.id).toBe(freedom.id);
  });

  it('dates Events from the earliest related legacy row and never invents updatedAt', () => {
    for (const ev of store.events) {
      const bouts = store.bouts.filter((b) => b.eventId === ev.id).map((b) => b.id);
      const runs = store.predictionRuns.filter((r) => bouts.includes(r.boutId));
      const earliest = runs.map((r) => r.createdAt).sort()[0];
      expect(ev.createdAt).toBe(earliest);
      expect(ev.updatedAt).toBe(null);
    }
    expect(store.bouts.every((b) => b.updatedAt === null)).toBe(true);
  });
});

describe('props', () => {
  it('resolves every current prop, including null upcomingId references', () => {
    expect(store.props).toHaveLength(PROP_PICKS.length);
    expect(store.props.every((p) => p.target.kind === 'bout')).toBe(true);
    expect(store.props.every((p) => typeof p.target.boutId === 'string')).toBe(true);
    const legacyNull = PROP_PICKS.filter((p) => p.upcomingId === null);
    expect(legacyNull.length).toBeGreaterThan(0);
    for (const lp of legacyNull) {
      const migrated = store.props.find((p) => p.id === lp.id);
      const bout = store.bouts.find((b) => b.id === migrated.target.boutId);
      const names = [bout.cornerA.displayName, bout.cornerB.displayName].sort();
      expect(names).toEqual([lp.fighterA, lp.fighterB].sort());
    }
  });

  it('aborts rather than persisting an unresolvable fight-specific prop', () => {
    const orphan = {
      ...PROP_PICKS[0], id: '1780000000000-orphan', upcomingId: null,
      fighterA: 'Nobody Here', fighterB: 'Nor Here',
    };
    const out = migrateV0ToV1({ ...LEGACY, propPicks: [...PROP_PICKS, orphan] }, makeDeps());
    expect(out.errors.some((e) => e.includes('1780000000000-orphan'))).toBe(true);
    expect(out.store.props.some((p) => p.id === '1780000000000-orphan')).toBe(false);
    expect(() => migrateAndValidate({ ...LEGACY, propPicks: [orphan] }, makeDeps())).toThrow(/could not be resolved/);
  });
});

describe('determinism, orientation and idempotence', () => {
  it('produces byte-identical output on repeated runs', () => {
    const a = run();
    const b = run();
    expect(JSON.stringify(a.store)).toBe(JSON.stringify(b.store));
  });

  it('is independent of legacy input ordering', () => {
    const shuffled = {
      ...LEGACY,
      roiEntries: [...ROI_ENTRIES].reverse(),
      upcomingEntries: [...UPCOMING_ENTRIES].reverse(),
    };
    const out = migrateV0ToV1(shuffled, makeDeps());
    const norm = (s) => ({
      events: [...s.events].sort((x, y) => x.id.localeCompare(y.id)),
      bouts: [...s.bouts].sort((x, y) => x.id.localeCompare(y.id)),
      runs: [...s.predictionRuns].sort((x, y) => x.id.localeCompare(y.id)),
      snapshots: [...s.predictionSnapshots].sort((x, y) => x.id.localeCompare(y.id)),
    });
    // Bout corner orientation is fixed by the first deterministic occurrence in
    // a stable sort, never by array or Map iteration accidents.
    expect(JSON.stringify(norm(out.store))).toBe(JSON.stringify(norm(store)));
  });

  it('assigns each bout a stable corner orientation used by every child record', () => {
    const bouts = new Map(store.bouts.map((b) => [b.id, b]));
    const runByAssessment = new Map(store.bettingAssessments.map((a) => [a.id, a.runId]));
    const entryById = new Map([...ROI_ENTRIES, ...UPCOMING_ENTRIES].map((e) => [e.id, e]));
    const runById = new Map(store.predictionRuns.map((r) => [r.id, r]));

    let checked = 0;
    for (const t of store.trackedPositions) {
      const run = runById.get(runByAssessment.get(t.assessmentId));
      const entry = entryById.get(run.legacyEntryId);
      const bout = bouts.get(t.boutId);

      // The bout's corners must be exactly the legacy pair, in some order.
      expect([bout.cornerA.displayName, bout.cornerB.displayName].sort())
        .toEqual([entry.fighterA, entry.fighterB].sort());

      expect(t.corner).toBe(bout.cornerA.displayName === entry.trackedSide ? 'A' : 'B');
      checked++;
    }
    // Guards against a vacuous pass: every position was examined.
    expect(checked).toBe(store.trackedPositions.length);
    expect(checked).toBe(ALL_ENTRIES.length);
  });

  it('remaps a second row for the same bout into the established orientation', () => {
    // Same event, same pair, corners swapped: it must collapse to ONE bout and
    // the later row's probabilities/tracked side must be remapped, not stored raw.
    const base = ROI_ENTRIES[0];
    const swapped = {
      ...base,
      id: '1790000000001-swapd',
      createdAt: '2026-12-02T00:00:00.000Z',
      fighterA: base.fighterB,
      fighterB: base.fighterA,
      fighterAProb: base.fighterBProb,
      fighterBProb: base.fighterAProb,
      oddsA: base.oddsB,
      oddsB: base.oddsA,
      trackedSide: base.trackedSide,
    };
    delete swapped.v2pA;
    delete swapped.v2pB;
    const out = migrateV0ToV1({ ...LEGACY, roiEntries: [...ROI_ENTRIES, swapped] }, makeDeps());
    expect(out.errors).toEqual([]);

    const runs = out.store.predictionRuns;
    const firstRun = runs.find((r) => r.legacyEntryId === base.id);
    const swapRun = runs.find((r) => r.legacyEntryId === swapped.id);
    expect(swapRun.boutId).toBe(firstRun.boutId);
    expect(out.store.bouts).toHaveLength(store.bouts.length);

    const bout = out.store.bouts.find((b) => b.id === firstRun.boutId);
    expect(bout.cornerA.displayName).toBe(base.fighterA);

    const v1 = out.store.predictionSnapshots.find(
      (s) => s.runId === swapRun.id && s.basis === 'legacy-v1-unversioned'
    );
    // Remapped back into the bout's canonical orientation.
    expect(v1.probA).toBe(base.fighterAProb);
    expect(v1.probB).toBe(base.fighterBProb);

    const tracked = out.store.trackedPositions.find((t) => t.assessmentId ===
      out.store.bettingAssessments.find((a) => a.runId === swapRun.id).id);
    expect(tracked.corner).toBe(base.trackedSide === base.fighterA ? 'A' : 'B');
    expect(checkInvariants(out.store)).toEqual([]);
  });

  it('derives identical IDs across runs from the same inputs', () => {
    const a = run().store;
    const ids = (s) => [
      ...s.events.map((x) => x.id), ...s.bouts.map((x) => x.id),
      ...s.predictionSnapshots.map((x) => x.id), ...s.bettingAssessments.map((x) => x.id),
      ...s.trackedPositions.map((x) => x.id), ...s.marketSnapshots.map((x) => x.id),
    ];
    expect(ids(a)).toEqual(ids(store));
    // All derived IDs are UUIDs; runs/props keep their legacy id shape.
    expect(ids(a).every((id) => /^[0-9a-f-]{36}$/.test(id))).toBe(true);
  });

  it('gives cross-event rematches different bout IDs', () => {
    const first = ROI_ENTRIES[0];
    const rematch = {
      ...first, id: '1790000000000-remtch',
      eventName: 'UFC 999', eventDate: '2026-12-12',
      createdAt: '2026-12-01T00:00:00.000Z',
    };
    const out = migrateV0ToV1({ ...LEGACY, roiEntries: [...ROI_ENTRIES, rematch] }, makeDeps());
    const runs = out.store.predictionRuns;
    const a = runs.find((r) => r.legacyEntryId === first.id).boutId;
    const b = runs.find((r) => r.legacyEntryId === rematch.id).boutId;
    expect(a).not.toBe(b);
    expect(out.store.bouts).toHaveLength(store.bouts.length + 1);
  });

  it('round-trips through JSON with deep Object.is equality', () => {
    const rt = JSON.parse(JSON.stringify(store));
    const deepIs = (x, y) => {
      if (x === null || typeof x !== 'object') return Object.is(x, y);
      if (Array.isArray(x)) {
        return Array.isArray(y) && x.length === y.length && x.every((v, i) => deepIs(v, y[i]));
      }
      const kx = Object.keys(x).sort();
      const ky = Object.keys(y).sort();
      return kx.join() === ky.join() && kx.every((k) => deepIs(x[k], y[k]));
    };
    expect(deepIs(store, rt)).toBe(true);
  });
});

describe('dispatcher', () => {
  it('treats an unversioned payload as version 0', () => {
    expect(versionOf(LEGACY)).toBe(0);
    expect(versionOf({ meta: { schemaVersion: 1 } })).toBe(1);
  });

  it('applies v0 -> v1 and reports the path', () => {
    const out = migrateToCurrent(LEGACY, makeDeps());
    expect(out.applied).toEqual(['0->1']);
    expect(out.alreadyCurrent).toBe(false);
    expect(out.store.meta.schemaVersion).toBe(CURRENT_VERSION);
  });

  it('is a no-op on already-current data', () => {
    const once = migrateToCurrent(LEGACY, makeDeps());
    const twice = migrateToCurrent(once.store, makeDeps());
    expect(twice.alreadyCurrent).toBe(true);
    expect(twice.applied).toEqual([]);
    // Idempotence lives in the DISPATCHER; the v0->v1 function itself never has
    // to accept its own output.
    expect(JSON.stringify(twice.store)).toBe(JSON.stringify(once.store));
  });

  it('blocks an unknown future version with a read-only recovery path', () => {
    const future = { meta: { schemaVersion: CURRENT_VERSION + 1 }, events: [] };
    expect(() => migrateToCurrent(future, makeDeps())).toThrow(UnknownFutureVersionError);
    try {
      migrateToCurrent(future, makeDeps());
    } catch (e) {
      expect(e.readOnly).toBe(true);
      expect(e.found).toBe(CURRENT_VERSION + 1);
      expect(e.supported).toBe(CURRENT_VERSION);
    }
  });

  it('requires injected clock and id providers, so it cannot go impure', () => {
    expect(() => migrateV0ToV1(LEGACY, undefined)).toThrow(/must stay pure/);
    expect(() => migrateV0ToV1(LEGACY, { migratedAt: '2026-01-01T00:00:00.000Z' })).toThrow(/must stay pure/);
  });

  it('validates and returns a clean store', () => {
    const out = migrateAndValidate(LEGACY, makeDeps());
    expect(out.errors).toEqual([]);
    expect(out.store.meta.schemaVersion).toBe(1);
  });
});
