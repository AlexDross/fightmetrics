import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../../roiData.js';
import { UPCOMING_ENTRIES } from '../../../upcomingData.js';
import { PROP_PICKS } from '../../../propPicksData.js';
import { migrateV0ToV1 } from '../../migration/migrateV0ToV1.mjs';
import { createInMemoryRepositories } from '../inMemory.mjs';
import { REPOSITORY_CONTRACT, conformsToContract } from '../interfaces.mjs';
import { isRevision, isStakeTransport, semanticEquals } from '../types.mjs';
import { computeROISummary } from '../../../domain/statistics/index.js';

// The contract suite runs against a REAL migrated Stage 6 store, not fixtures,
// so the in-memory backing is exercised on the same 160 positions Postgres will
// hold. Gate 6 must satisfy this identical suite.
const deps = { migratedAt: '2026-07-28T00:00:00.000Z', newId: () => '0'.repeat(8) + '-0000-7000-8000-' + '0'.repeat(12) };
const { store } = migrateV0ToV1(
  { roiEntries: ROI_ENTRIES, upcomingEntries: UPCOMING_ENTRIES, propPicks: PROP_PICKS, parlayEntries: [] },
  deps
);
const make = (opts) => createInMemoryRepositories(store, { now: () => '2026-08-01T00:00:00.000Z', ...opts });

describe('contract conformance', () => {
  it('the in-memory backing implements the contract exactly', () => {
    expect(conformsToContract(make())).toEqual([]);
  });

  it('the checker is not vacuous', () => {
    const impl = make();
    delete impl.propRepository.settle;
    expect(conformsToContract(impl)).toContain('propRepository.settle is not a function');

    const impl2 = make();
    impl2.propRepository.somethingExtra = () => {};
    expect(conformsToContract(impl2)).toContain('propRepository.somethingExtra is not in the contract');

    const impl3 = make();
    impl3.parlayRepository.list = (a, b) => [a, b];   // contract allows 0
    expect(conformsToContract(impl3))
      .toContain('parlayRepository.list declares 2 params, contract allows at most 0');

    const impl4 = make();
    delete impl4.undoRepository;
    expect(conformsToContract(impl4)).toContain('missing repository: undoRepository');
  });

  it('declares every repository the plan requires', () => {
    expect(Object.keys(REPOSITORY_CONTRACT).sort()).toEqual([
      'authRepository', 'boutRepository', 'eventRepository', 'parlayRepository',
      'predictionRepository', 'propRepository', 'statisticsRepository',
      'undoRepository', 'wagerRepository', 'workspaceRepository',
    ]);
  });
});

describe('reads', () => {
  const r = make();

  it('returns the migrated corpus', () => {
    expect(r.eventRepository.list().data).toHaveLength(16);
    expect(r.predictionRepository.listGraded({}).data).toHaveLength(153);
    expect(r.predictionRepository.listPending().data).toHaveLength(7);
    expect(r.propRepository.list().data).toHaveLength(4);
    expect(r.parlayRepository.list().data).toHaveLength(0);
  });

  it('emits revisions as opaque strings and stakes as decimal strings', () => {
    for (const row of r.predictionRepository.listGraded({}).data) {
      expect(isRevision(row.revision), `revision ${row.revision}`).toBe(true);
      expect(isStakeTransport(row.stakeUnits), `stake ${row.stakeUnits}`).toBe(true);
      expect(typeof row.stakeUnits).toBe('string');
    }
  });

  it('never leaks provenance internals into a row projection', () => {
    const row = r.predictionRepository.listGraded({}).data[0];
    for (const banned of ['featureVector', 'sourceManifest', 'reconstruction',
                          'fightHistoryCutoff', 'modelCoefHash', 'legacyEntryId',
                          'notes', 'origin', 'stakeSource', 'fighterKey']) {
      expect(banned in row, `${banned} leaked`).toBe(false);
    }
  });

  it('filters graded rows by event date', () => {
    const all = r.predictionRepository.listGraded({}).data.length;
    const since = r.predictionRepository.listGraded({ since: '2026-05-23' }).data.length;
    expect(since).toBeGreaterThan(0);
    expect(since).toBeLessThan(all);
  });

  it('counts bouts per event without duplicating event data', () => {
    const rows = r.eventRepository.listWithBoutCounts().data;
    expect(rows).toHaveLength(16);
    expect(rows.reduce((n, x) => n + x.boutCount, 0)).toBe(160);
  });
});

describe('statistics stay in JavaScript', () => {
  it('the repository returns an input projection the domain readers accept', () => {
    const rows = make().statisticsRepository.statisticsInput({}).data;
    expect(rows).toHaveLength(160);
    // The existing, tested domain function does the computing — not SQL, not
    // the repository.
    const summary = computeROISummary(rows, new Set());
    expect(summary).toBeTruthy();
    expect(typeof summary.total).toBe('number');
    expect(summary.total).toBeGreaterThan(0);
  });

  it('projects the legacy entry shape the readers require', () => {
    const row = make().statisticsRepository.statisticsInput({}).data[0];
    for (const field of ['id', 'fighterA', 'fighterB', 'eventName', 'eventDate',
                         'actualWinner', 'marketOdds', 'trackedSide', 'unitsWagered',
                         'predictedWinner', 'fighterAProb', 'fighterBProb',
                         'betAction', 'confirmedByUser', '_provenance']) {
      expect(field in row, `missing ${field}`).toBe(true);
    }
    expect(typeof row.unitsWagered).toBe('number');   // domain shape, not transport
  });

  it('excludes only the pending review state', () => {
    const rows = make().statisticsRepository.statisticsInput({}).data;
    expect(rows.every((x) => x.confirmedByUser === true)).toBe(true);  // all notRequired today
  });
});

describe('authorization', () => {
  it('rejects writes with no session', () => {
    const r = make({ role: null });
    expect(r.predictionRepository.savePrediction({ run: { id: 'x' } }).error.kind).toBe('unauthenticated');
    expect(r.propRepository.create({ id: 'x' }).error.kind).toBe('unauthenticated');
  });

  it('rejects writes from a viewer but allows reads', () => {
    const r = make({ role: 'viewer' });
    expect(r.propRepository.create({ id: 'x' }).error.kind).toBe('forbidden');
    expect(r.predictionRepository.listGraded({}).ok).toBe(true);
  });

  it('restricts owner-only operations from an editor', () => {
    const r = make({ role: 'editor' });
    expect(r.predictionRepository.clearGraded([]).error.kind).toBe('forbidden');
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).error.kind).toBe('forbidden');
    expect(r.propRepository.settle(store.props[0].id, 'LOST', '1').ok).toBe(true);
  });

  it('routes by resolved membership, not session presence', () => {
    // A signed-in non-member is `role: null` here and must not be treated as a
    // member merely because a session exists.
    expect(make({ role: null }).authRepository.whoami().data.role).toBe(null);
    expect(make({ role: 'viewer' }).authRepository.whoami().data.role).toBe('viewer');
  });
});

describe('conflict detection', () => {
  it('rejects a stale expected revision and reports the server value', () => {
    const r = make();
    const id = store.props[0].id;
    expect(r.propRepository.settle(id, 'LOST', '1').ok).toBe(true);   // revision -> 2
    const stale = r.propRepository.settle(id, 'WON', '1');
    expect(stale.ok).toBe(false);
    expect(stale.error.kind).toBe('conflict');
    expect(stale.error.serverRevision).toBe('2');
    expect(isRevision(stale.error.serverRevision)).toBe(true);
  });

  it('accepts the fresh revision returned by the previous write', () => {
    const r = make();
    const id = store.props[0].id;
    const first = r.propRepository.settle(id, 'LOST', '1');
    expect(r.propRepository.settle(id, 'WON', first.revision).ok).toBe(true);
  });

  it('rejects a malformed revision outright', () => {
    expect(() => make().propRepository.settle(store.props[0].id, 'WON', 1)).toThrow(TypeError);
  });
});

describe('mutations preserve the frozen record', () => {
  it('amending the tracked price appends a market and leaves the assessment alone', () => {
    const r = make();
    const pos = r.predictionRepository.listGraded({}).data.find((x) => x.trackedOddsA !== null);
    const before = r.predictionRepository.getAggregate(
      store.bettingAssessments.find((a) => a.id ===
        store.trackedPositions.find((t) => t.id === pos.trackedPositionId).assessmentId).runId
    ).data;
    const res = r.predictionRepository.amendTrackedPrice(pos.trackedPositionId, -120, pos.revision);
    expect(res.ok).toBe(true);
    const after = r.predictionRepository.getAggregate(before.run.id).data;
    // The frozen assessment is untouched: same market pointer, same derived values.
    expect(after.assessment.marketSnapshotId).toBe(before.assessment.marketSnapshotId);
    expect(after.assessment.tier).toBe(before.assessment.tier);
    expect(after.assessment.edgeA).toBe(before.assessment.edgeA);
    expect(after.assessment.kellyA).toBe(before.assessment.kellyA);
    // Only the tracked position moved.
    expect(after.trackedPosition.marketSnapshotId).not.toBe(before.trackedPosition.marketSnapshotId);
  });

  it('changing the tracked corner does not repoint the market', () => {
    const r = make();
    const pos = r.predictionRepository.listGraded({}).data[0];
    const runId = store.bettingAssessments.find((a) => a.id ===
      store.trackedPositions.find((t) => t.id === pos.trackedPositionId).assessmentId).runId;
    const before = r.predictionRepository.getAggregate(runId).data.trackedPosition;
    const next = before.corner === 'A' ? 'B' : 'A';
    expect(r.predictionRepository.changeTrackedCorner(pos.trackedPositionId, next, pos.revision).ok).toBe(true);
    const after = r.predictionRepository.getAggregate(runId).data.trackedPosition;
    expect(after.corner).toBe(next);
    expect(after.marketSnapshotId).toBe(before.marketSnapshotId);
  });

  it('grading settles every dependent position and bumps each revision', () => {
    const r = make();
    const pending = r.predictionRepository.listPending().data[0];
    const res = r.predictionRepository.grade(pending.boutId, pending.trackedCorner, 'DEC', '1');
    expect(res.ok, JSON.stringify(res.error ?? {})).toBe(true);
    expect(res.data.touched.length).toBeGreaterThan(0);
    for (const t of res.data.touched) expect(isRevision(t.revision)).toBe(true);
    const stillPending = r.predictionRepository.listPending().data
      .some((x) => x.boutId === pending.boutId);
    expect(stillPending).toBe(false);
  });

  it('deleting a run prunes its chain but never the bout or event', () => {
    const r = make();
    const before = { events: r.eventRepository.list().data.length,
                     bouts: r.boutRepository.listByEvent(
                       r.eventRepository.list().data[0].id).data.length };
    const row = r.predictionRepository.listGraded({}).data[0];
    const runId = store.bettingAssessments.find((a) => a.id ===
      store.trackedPositions.find((t) => t.id === row.trackedPositionId).assessmentId).runId;
    expect(r.predictionRepository.remove(runId, row.revision).ok).toBe(true);
    expect(r.eventRepository.list().data).toHaveLength(before.events);
    expect(r.boutRepository.listByEvent(r.eventRepository.list().data[0].id).data)
      .toHaveLength(before.bouts);
  });
});

describe('export and import safety', () => {
  it('exports a store that semantically round-trips through JSON', () => {
    const exported = make().workspaceRepository.exportStore().data;
    const rt = JSON.parse(JSON.stringify(exported));
    expect(semanticEquals(exported, rt)).toBe(true);
  });

  it('refuses a destructive import without confirmed backup', () => {
    const r = make();
    expect(r.workspaceRepository.importStore({ meta: { schemaVersion: 1 } }, {}).error.kind)
      .toBe('validation');
    expect(r.workspaceRepository.reset({}).error.kind).toBe('validation');
  });

  it('rejects an unknown future schema version', () => {
    const r = make();
    const res = r.workspaceRepository.importStore(
      { meta: { schemaVersion: 99 } }, { backupConfirmed: true });
    expect(res.ok).toBe(false);
    expect(res.error.issues[0].code).toBe('unknownFutureVersion');
  });

  it('reset clears entities and the seed version', () => {
    const r = make();
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).ok).toBe(true);
    expect(r.predictionRepository.listGraded({}).data).toHaveLength(0);
    expect(r.workspaceRepository.seedVersion().data).toBe(null);
  });
});

describe('isolation', () => {
  it('each instance owns its data; mutations never touch the source store', () => {
    const a = make();
    const b = make();
    a.workspaceRepository.reset({ backupConfirmed: true });
    expect(b.predictionRepository.listGraded({}).data).toHaveLength(153);
    expect(store.trackedPositions).toHaveLength(160);
  });
});
