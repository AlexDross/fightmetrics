import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../../roiData.js';
import { UPCOMING_ENTRIES } from '../../../upcomingData.js';
import { PROP_PICKS } from '../../../propPicksData.js';
import { PARLAY_ENTRIES } from '../../../parlayData.js';
import { LEGACY_FIELD_MAP, GENERATED_FIELD_SOURCES, READER_ONLY_PHANTOMS } from '../legacyFieldMap.mjs';
import { migrateV0ToV1 } from '../migrateV0ToV1.mjs';

// Walks the REAL legacy data recursively and collects every field path, so the
// map is checked against the data rather than against itself. A field cannot
// silently disappear: it is either mapped, explicitly derived, or explicitly
// dropped with a reason.
function collectPaths(objects) {
  const paths = new Set();
  const walk = (o, prefix) => {
    if (o === null || typeof o !== 'object') return;
    for (const k of Object.keys(o)) {
      const p = prefix ? `${prefix}.${k}` : k;
      paths.add(p);
      const v = o[k];
      if (Array.isArray(v)) {
        for (const item of v) walk(item, `${prefix ? `${prefix}.` : ''}${k}[]`);
      } else if (v && typeof v === 'object') {
        walk(v, p);
      }
    }
  };
  objects.forEach((o) => walk(o, ''));
  return paths;
}

/** A path is covered by an exact key, or by a `*` pattern on its parent. */
function isCovered(map, path) {
  if (Object.prototype.hasOwnProperty.call(map, path)) return true;
  const parts = path.split('.');
  for (let i = parts.length - 1; i > 0; i--) {
    const candidate = `${parts.slice(0, i).join('.')}.*`;
    if (map[candidate]?.pattern) return true;
  }
  return false;
}

const describeEntry = (e) => e.to ?? e.derived ?? e.dropped;

describe('legacy field map is exhaustive', () => {
  it('covers every field path in roiData.js and upcomingData.js', () => {
    const paths = collectPaths([...ROI_ENTRIES, ...UPCOMING_ENTRIES]);
    const uncovered = [...paths].filter((p) => !isCovered(LEGACY_FIELD_MAP.roiEntry, p));
    expect(uncovered, `unmapped legacy paths:\n${uncovered.join('\n')}`).toEqual([]);
    // Non-vacuous: the real data is deep and wide.
    expect(paths.size).toBeGreaterThan(100);
  });

  it('covers every field path in propPicksData.js', () => {
    const paths = collectPaths(PROP_PICKS);
    const uncovered = [...paths].filter((p) => !isCovered(LEGACY_FIELD_MAP.propPick, p));
    expect(uncovered).toEqual([]);
    expect(paths.size).toBe(15);
  });

  it('covers the parlay runtime shape even though parlayData.js is empty', () => {
    expect(PARLAY_ENTRIES).toEqual([]);
    // Shape taken from BuildParlayModal.handleConfirm and the Parlays readers.
    const runtimeParlay = {
      id: 'x', createdAt: 'x', pickSource: 'human', eventName: 'x', eventDate: 'x',
      combinedOdds: '+300', unitsWagered: 1, status: 'PENDING', result: null,
      legs: [{
        fightId: 'x', fighterA: 'x', fighterB: 'x', eventName: 'x', eventDate: 'x',
        pickedFighter: 'x', v2DefaultFighter: 'x', v2ProbAtBuild: 0.5, overridden: false,
      }],
    };
    const paths = collectPaths([runtimeParlay]);
    const uncovered = [...paths].filter((p) => !isCovered(LEGACY_FIELD_MAP.parlay, p));
    expect(uncovered).toEqual([]);
  });

  it('gives every mapping a destination or a documented reason', () => {
    for (const [group, fields] of Object.entries(LEGACY_FIELD_MAP)) {
      for (const [field, entry] of Object.entries(fields)) {
        const desc = describeEntry(entry);
        expect(typeof desc, `${group}.${field} has no to/derived/dropped`).toBe('string');
        expect(desc.length, `${group}.${field} description is too short to be a reason`).toBeGreaterThan(8);
      }
    }
  });

  it('has no stale entries describing fields that no longer exist', () => {
    const real = collectPaths([...ROI_ENTRIES, ...UPCOMING_ENTRIES]);
    const stale = Object.keys(LEGACY_FIELD_MAP.roiEntry)
      .filter((k) => !k.endsWith('.*'))
      .filter((k) => !real.has(k));
    expect(stale, `map describes paths absent from the data: ${stale.join(', ')}`).toEqual([]);
  });

  it('records confirmedByUser as a reader-only phantom rather than inventing it', () => {
    const all = [...ROI_ENTRIES, ...UPCOMING_ENTRIES];
    expect(all.some((e) => 'confirmedByUser' in e)).toBe(false);
    expect(READER_ONLY_PHANTOMS.confirmedByUser.dropped).toMatch(/written 0\/160/);
  });
});

describe('generated and defaulted v1 fields are all sourced', () => {
  const deps = { migratedAt: '2026-07-28T00:00:00.000Z', newId: () => '00000000-0000-7000-8000-000000000000' };
  const { store } = migrateV0ToV1(
    { roiEntries: ROI_ENTRIES, upcomingEntries: UPCOMING_ENTRIES, propPicks: PROP_PICKS, parlayEntries: PARLAY_ENTRIES },
    deps
  );

  it('documents a source for every field with no direct legacy origin', () => {
    const required = [
      'Event.promotion', 'Event.externalIds', 'Event.updatedAt', 'Event.createdAt',
      'Bout.externalIds', 'Bout.updatedAt', 'Bout.createdAt', 'Bout.boardOrder', 'Bout.scheduledRounds',
      'Bout.cornerA.fighterKey', 'Bout.cornerB.fighterKey', 'Bout.cornerA.fighterId', 'Bout.cornerB.fighterId',
      'PredictionRun.provenanceCompleteness', 'PredictionSnapshot.captureMode', 'PredictionSnapshot.basis',
      'MarketSnapshot.source', 'MarketSnapshot.capturedAt',
      'BettingAssessment.tierProvenance', 'BettingAssessment.recommendedCornerProvenance',
      'TrackedPosition.origin', 'TrackedPosition.stakeSource',
      'TrackedPosition.settlement.settledAt', 'TrackedPosition.settlement.financialResult',
      'meta.schemaVersion', 'meta.migratedAt',
    ];
    for (const key of required) {
      expect(GENERATED_FIELD_SOURCES[key], `${key} has no documented source`).toBeTruthy();
    }
  });

  it('every documented default matches what the migration actually produced', () => {
    expect(store.events.every((e) => JSON.stringify(e.externalIds) === '{}')).toBe(true);
    expect(store.events.every((e) => e.updatedAt === null)).toBe(true);
    expect(store.bouts.every((b) => b.updatedAt === null)).toBe(true);
    expect(store.bouts.every((b) => b.boardOrder === null && b.scheduledRounds === null)).toBe(true);
    expect(store.bouts.every((b) => b.cornerA.fighterId === null && b.cornerB.fighterId === null)).toBe(true);
    expect(store.marketSnapshots.every((m) => m.source === 'manual')).toBe(true);
    expect(store.trackedPositions.every((t) => t.origin === 'legacyMigration')).toBe(true);
    expect(store.meta.schemaVersion).toBe(1);
    expect(store.meta.migratedAt).toBe(deps.migratedAt);
  });

  it('fighterKey is derived and never promoted to an identity', () => {
    for (const b of store.bouts) {
      expect(b.cornerA.fighterKey).toBe(b.cornerA.displayName.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase());
      expect(b.cornerB.fighterKey).toBe(b.cornerB.displayName.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase());
      expect(b.cornerA.fighterId).toBe(null);
    }
  });
});
