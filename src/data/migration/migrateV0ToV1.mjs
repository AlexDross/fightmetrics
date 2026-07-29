// Stage 6 — pure v0 -> v1 migration.
//
// PURE: no Date.now(), no Math.random(), no I/O. Everything non-deterministic
// arrives through `deps` ({ migratedAt, newId }), so migrating the same input
// twice produces byte-identical output — asserted by the idempotence test.
//
// Every legacy row becomes exactly one PredictionRun, one BettingAssessment and
// one TrackedPosition. That includes all 114 NO BET rows and the 10 with no
// betAction at all: computeROISummary already counts them, so anything less
// would silently rewrite the historical track record.
//
// Migration creates ZERO Wagers. Legacy data cannot prove cash was placed.
import {
  boutIdFor, eventIdFor, fighterKey, marketIdFor, assessmentIdFor,
  snapshotIdFor, trackedPositionIdFor,
} from './ids.mjs';
import { SCHEMA_VERSION } from '../schemas/entities.mjs';

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const blank = (v) => v === undefined || v === null || v === '';

/** Legacy odds are presentation strings ("+145", "-360", ""). Durable storage
 *  is integers. Blank => null; anything non-integral is a hard failure rather
 *  than a silent null, because a malformed price is a data defect. */
function parseOdds(raw, where, errors) {
  if (blank(raw)) return null;
  const s = String(raw).trim();
  if (!/^[+-]?\d+$/.test(s)) {
    errors.push(`${where}: unparseable american odds ${JSON.stringify(raw)}`);
    return null;
  }
  const n = Number(s);
  if (n === 0 || Math.abs(n) < 100) {
    errors.push(`${where}: american odds out of range ${JSON.stringify(raw)}`);
    return null;
  }
  return n;
}

/** promotion is DERIVED, never assumed. A UFC-prefixed name is strong enough
 *  evidence; anything else is genuinely unknown and becomes null + a manifest
 *  entry. "Freedom 250" proves only that it lacks a UFC prefix — not which
 *  promotion ran it. */
function derivePromotion(eventName) {
  return /^UFC\b/.test(eventName) ? 'UFC' : null;
}

const FINISH_ORDER = ['KO/TKO', 'SUB', 'DEC'];

function buildFinishProjection(entry) {
  if (!has(entry, 'projectedKO') || !has(entry, 'projectedSUB') || !has(entry, 'projectedDEC')) {
    return { status: 'absent' };
  }
  const byMethod = { 'KO/TKO': entry.projectedKO, SUB: entry.projectedSUB, DEC: entry.projectedDEC };
  const max = Math.max(...Object.values(byMethod));
  return {
    status: 'computed',
    koPct: entry.projectedKO,
    subPct: entry.projectedSUB,
    decPct: entry.projectedDEC,
    leaders: FINISH_ORDER.filter((m) => byMethod[m] === max),
  };
}

/** Legacy actualFinish vocabulary -> FinishMethod. "" means not recorded. */
function mapFinishMethod(raw) {
  if (blank(raw)) return null;
  return raw === 'Submission' ? 'SUB' : raw;
}

function buildBoutResult(entry, orientation) {
  const w = entry.actualWinner;
  if (blank(w)) return { status: 'pending' };
  if (w === 'NC') return { status: 'resolved', outcome: 'noContest', method: mapFinishMethod(entry.actualFinish) };
  if (w === 'DRAW') return { status: 'resolved', outcome: 'draw', method: mapFinishMethod(entry.actualFinish) };
  const corner = orientation.cornerOf(w);
  return { status: 'resolved', outcome: corner, method: mapFinishMethod(entry.actualFinish) };
}

/**
 * CANONICAL BOUT ORIENTATION.
 *
 * Bout IDs use an UNORDERED fighter pair, but probabilities, results, props and
 * assessments are all expressed as corner A/B. The first deterministic legacy
 * occurrence fixes the orientation; every later row for the same bout is
 * remapped into it before anything is stored.
 *
 * "First deterministic" means first in a stable sort of the legacy rows, never
 * Map/object iteration order — so the output cannot depend on insertion
 * accidents.
 */
function makeOrientation(boutRecord, entry) {
  const flipped = boutRecord.cornerA.displayName !== entry.fighterA;
  return {
    flipped,
    /** legacy A/B -> canonical corner */
    corner: (legacyCorner) => (flipped ? (legacyCorner === 'A' ? 'B' : 'A') : legacyCorner),
    /** fighter display name -> canonical corner */
    cornerOf: (name) => (boutRecord.cornerA.displayName === name ? 'A' : 'B'),
    /** pick the value belonging to canonical corner X out of a legacy (A,B) pair */
    pick: (aVal, bVal) => (flipped ? [bVal, aVal] : [aVal, bVal]),
  };
}

/**
 * @param {object} legacy  { roiEntries, upcomingEntries, propPicks, parlayEntries }
 * @param {object} deps    { migratedAt: ISO string, newId: () => uuid }
 */
export function migrateV0ToV1(legacy, deps) {
  if (!deps || typeof deps.migratedAt !== 'string' || typeof deps.newId !== 'function') {
    throw new Error('migrateV0ToV1 requires { migratedAt, newId } — it must stay pure');
  }
  const errors = [];
  const manifest = {
    migratedAt: deps.migratedAt,
    unresolved: [],
    defaulted: [],
    generated: [],
    droppedFields: [],
    counts: {},
  };

  const roi = legacy.roiEntries ?? [];
  const upcoming = legacy.upcomingEntries ?? [];
  const propPicks = legacy.propPicks ?? [];
  const parlayEntries = legacy.parlayEntries ?? [];

  // Stable ordering drives Bout orientation, so it must not depend on array
  // identity or object iteration. createdAt then id is total over the real data
  // (all 160 ids are unique).
  const allEntries = [...roi, ...upcoming]
    .map((entry, i) => ({ entry, source: i < roi.length ? 'roi' : 'upcoming' }))
    .sort((x, y) =>
      x.entry.createdAt === y.entry.createdAt
        ? String(x.entry.id).localeCompare(String(y.entry.id))
        : String(x.entry.createdAt).localeCompare(String(y.entry.createdAt))
    );

  const events = new Map();
  const bouts = new Map();
  const predictionRuns = [];
  const predictionSnapshots = [];
  const marketSnapshots = [];
  const bettingAssessments = [];
  const trackedPositions = [];

  const ensureEvent = (name, date, createdAt) => {
    const promotion = derivePromotion(name);
    const id = eventIdFor({ promotion, date, name });
    if (!events.has(id)) {
      if (promotion === null) {
        manifest.unresolved.push({
          entity: 'Event', id, field: 'promotion', value: null,
          reason: `event name ${JSON.stringify(name)} has no UFC prefix; the operating promotion is not recorded in legacy data`,
        });
      }
      manifest.generated.push({ entity: 'Event', id, fields: ['externalIds', 'updatedAt'] });
      events.set(id, {
        id, promotion, name, date,
        externalIds: {},
        createdAt,
        updatedAt: null,
      });
    } else {
      const ev = events.get(id);
      if (createdAt < ev.createdAt) ev.createdAt = createdAt;
    }
    return id;
  };

  const ensureBout = (eventId, entry) => {
    const keys = [fighterKey(entry.fighterA), fighterKey(entry.fighterB)];
    const id = boutIdFor({ eventId, fighterKeys: keys });
    if (!bouts.has(id)) {
      if (keys[0] === keys[1]) {
        errors.push(`bout ${id}: both corners normalise to the same fighterKey ${JSON.stringify(keys[0])}`);
      }
      manifest.generated.push({
        entity: 'Bout', id,
        fields: ['boardOrder', 'scheduledRounds', 'externalIds', 'updatedAt', 'cornerA.fighterId', 'cornerB.fighterId'],
      });
      bouts.set(id, {
        id,
        eventId,
        // Orientation is fixed HERE, by the first deterministic occurrence.
        cornerA: { displayName: entry.fighterA, fighterKey: keys[0] === fighterKey(entry.fighterA) ? fighterKey(entry.fighterA) : keys[0], fighterId: null },
        cornerB: { displayName: entry.fighterB, fighterKey: fighterKey(entry.fighterB), fighterId: null },
        division: entry.division,
        boardOrder: null,
        scheduledRounds: null,
        result: { status: 'pending' },
        externalIds: {},
        createdAt: entry.createdAt,
        updatedAt: null,
      });
    } else {
      const b = bouts.get(id);
      if (entry.createdAt < b.createdAt) b.createdAt = entry.createdAt;
    }
    return id;
  };

  for (const { entry } of allEntries) {
    const eventId = ensureEvent(entry.eventName, entry.eventDate, entry.createdAt);
    const boutId = ensureBout(eventId, entry);
    const bout = bouts.get(boutId);
    const o = makeOrientation(bout, entry);

    const runId = String(entry.id);
    const prov = entry._provenance ?? null;
    const hasV2 = has(entry, 'v2pA') && has(entry, 'v2pB');
    const decisionIsV2 = has(entry, 'modelUsed');

    // ── snapshots: one per model basis ───────────────────────────────────
    //
    // sourceManifest and fightHistoryCutoff describe the DATA the live
    // calculation read, not one model's coefficients — several manifest modules
    // are explicitly feedsV2:true. They are therefore attached to BOTH
    // snapshots of a full live record, which is deliberate immutable provenance
    // duplication rather than contradictory state. featureVector stays split by
    // basis, because those really are per-model inputs.
    //
    // Reconstructed records supply neither field and must not gain invented
    // provenance, so both stay null there.
    const sharedCutoff = prov?.fightHistoryCutoff
      ? {
          cornerA: o.pick(prov.fightHistoryCutoff.fighterA, prov.fightHistoryCutoff.fighterB)[0] ?? null,
          cornerB: o.pick(prov.fightHistoryCutoff.fighterA, prov.fightHistoryCutoff.fighterB)[1] ?? null,
        }
      : null;
    const sharedManifest = prov?.sourceManifest ? normaliseManifest(prov.sourceManifest) : null;

    const [pA1, pB1] = o.pick(entry.fighterAProb, entry.fighterBProb);
    const v1Id = snapshotIdFor({ runId, basis: 'legacy-v1-unversioned' });
    predictionSnapshots.push({
      id: v1Id,
      runId,
      boutId,
      basis: 'legacy-v1-unversioned',
      modelVersion: null,
      modelCoefHash: null,
      probA: pA1,
      probB: pB1,
      winnerCorner: pA1 >= pB1 ? 'A' : 'B',
      // No separate v1 timestamp exists in any legacy generation.
      capturedAt: entry.createdAt,
      captureMode: 'unknown',
      reconstruction: null,
      featureVector: prov?.featureVector?.v1 ? { ...prov.featureVector.v1 } : null,
      fightHistoryCutoff: sharedCutoff,
      sourceManifest: sharedManifest,
    });

    let v2Id = null;
    if (hasV2) {
      const [pA2, pB2] = o.pick(entry.v2pA, entry.v2pB);
      v2Id = snapshotIdFor({ runId, basis: 'v2' });
      const reconstructed = prov?.captureMode === 'reconstructed';
      predictionSnapshots.push({
        id: v2Id,
        runId,
        boutId,
        basis: 'v2',
        modelVersion: prov?.modelVersion ?? null,
        modelCoefHash: prov?.modelCoefHash ?? null,
        probA: pA2,
        probB: pB2,
        winnerCorner: pA2 >= pB2 ? 'A' : 'B',
        capturedAt: prov?.predictionTimestamp ?? entry.createdAt,
        captureMode: prov?.captureMode ?? 'unknown',
        reconstruction: reconstructed
          ? {
              type: prov.reconstructionType,
              sourceCommit: prov.sourceCommit,
              priorV2: prov.priorV2
                ? {
                    v2pA: o.pick(prov.priorV2.v2pA, prov.priorV2.v2pB)[0],
                    v2pB: o.pick(prov.priorV2.v2pA, prov.priorV2.v2pB)[1],
                  }
                : null,
            }
          : null,
        featureVector: prov?.featureVector?.v2 ? { ...prov.featureVector.v2 } : null,
        // Same live calculation, same source data — see the note above.
        fightHistoryCutoff: sharedCutoff,
        sourceManifest: sharedManifest,
      });
    }

    const decisionSnapshotId = decisionIsV2 && v2Id ? v2Id : v1Id;

    // ── run ──────────────────────────────────────────────────────────────
    const provenanceCompleteness = !prov ? 'none' : prov.featureVector ? 'full' : 'partial';
    if (!prov) {
      manifest.defaulted.push({
        entity: 'PredictionSnapshot', id: v1Id, field: 'captureMode', value: 'unknown',
        reason: 'legacy row carries no _provenance; capture mode is genuinely unknown and must not be assumed reconstructed',
      });
    }
    if (!has(entry, 'projectedKO')) {
      manifest.defaulted.push({ entity: 'PredictionRun', id: runId, field: 'finishProjection', value: 'absent' });
    }

    predictionRuns.push({
      id: runId,
      boutId,
      legacyEntryId: String(entry.id),
      createdAt: entry.createdAt,
      decisionSnapshotId,
      // All 160 rows carry an eventDate, and targetEventDate equals it wherever
      // both exist, so this is lossless.
      targetEventDateAtCapture: prov?.targetEventDate ?? entry.eventDate,
      finishProjection: buildFinishProjection(entry),
      cornerAIsProspectAtCapture: pickProspect(entry, o, 'A'),
      cornerBIsProspectAtCapture: pickProspect(entry, o, 'B'),
      includesProspectAtCapture: has(entry, 'includesProspect') ? entry.includesProspect : null,
      provenanceCompleteness,
    });

    // ── bout result (grading lives on the bout, never on a snapshot) ──────
    const result = buildBoutResult(entry, o);
    if (result.status === 'resolved') bout.result = result;

    // ── market ───────────────────────────────────────────────────────────
    const [oddsA, oddsB] = o.pick(
      parseOdds(entry.oddsA, `${runId}.oddsA`, errors),
      parseOdds(entry.oddsB, `${runId}.oddsB`, errors)
    );
    let marketSnapshotId = null;
    if (oddsA !== null || oddsB !== null) {
      marketSnapshotId = marketIdFor({ runId });
      marketSnapshots.push({
        id: marketSnapshotId,
        boutId,
        // The odds belong to the original save, not to a later v2 reconstruction.
        capturedAt: entry.createdAt,
        source: 'manual',
        oddsA,
        oddsB,
      });
    }

    // ── assessment ───────────────────────────────────────────────────────
    const [fairA, fairB] = o.pick(
      parseOdds(entry.fairLineA, `${runId}.fairLineA`, errors),
      parseOdds(entry.fairLineB, `${runId}.fairLineB`, errors)
    );
    const [edgeA, edgeB] = o.pick(entry.edgeA ?? null, entry.edgeB ?? null);
    const [evA, evB] = o.pick(entry.evA ?? null, entry.evB ?? null);
    const [kellyA, kellyB] = o.pick(entry.kellyA ?? null, entry.kellyB ?? null);

    const tier = has(entry, 'betAction') ? entry.betAction : prov?.frozenTier ?? null;
    const tierProvenance = has(entry, 'betAction')
      ? 'stored'
      : prov && has(prov, 'frozenTier')
      ? 'frozenTier'
      : 'absent';
    if (tierProvenance === 'absent') {
      manifest.defaulted.push({
        entity: 'BettingAssessment', id: assessmentIdFor({ runId }), field: 'tier', value: null,
        reason: 'legacy row predates the betting layer and records no tier',
      });
    }

    const recommendedCorner = has(entry, 'bestBet')
      ? entry.bestBet === null
        ? null
        : o.corner(entry.bestBet)
      : null;

    const assessmentId = assessmentIdFor({ runId });
    bettingAssessments.push({
      id: assessmentId,
      boutId,
      runId,
      predictionSnapshotId: decisionSnapshotId,
      marketSnapshotId,
      frozenAt: entry.createdAt,
      fairLineA: marketSnapshotId ? fairA : null,
      fairLineB: marketSnapshotId ? fairB : null,
      edgeA: marketSnapshotId ? edgeA : null,
      edgeB: marketSnapshotId ? edgeB : null,
      evA: marketSnapshotId ? evA : null,
      evB: marketSnapshotId ? evB : null,
      kellyA: marketSnapshotId ? kellyA : null,
      kellyB: marketSnapshotId ? kellyB : null,
      tier,
      recommendedCorner,
      tierProvenance,
      recommendedCornerProvenance: has(entry, 'bestBet') ? 'stored' : 'absentInLegacy',
    });

    // ── tracked position ─────────────────────────────────────────────────
    const corner = o.cornerOf(entry.trackedSide);
    const selectedOdds = corner === 'A' ? oddsA : oddsB;
    const stakeExplicit = has(entry, 'unitsWagered');
    if (!stakeExplicit) {
      manifest.defaulted.push({
        entity: 'TrackedPosition', id: trackedPositionIdFor({ runId }), field: 'stakeUnits', value: 1,
        reason: 'legacy row has no unitsWagered; readers already default to 1 unit',
      });
    }

    trackedPositions.push({
      id: trackedPositionIdFor({ runId }),
      boutId,
      assessmentId,
      origin: 'legacyMigration',
      corner,
      stakeUnits: stakeExplicit ? entry.unitsWagered : 1,
      stakeSource: stakeExplicit ? 'explicit' : 'defaultedFlat1u',
      openedAt: entry.createdAt,
      settlement: buildSettlement(result, corner, selectedOdds, entry, manifest, runId),
      notes: blank(entry.notes) ? null : entry.notes,
    });
  }

  // ── props ──────────────────────────────────────────────────────────────
  const props = [];
  const boutByLegacyEntryId = new Map(predictionRuns.map((r) => [r.legacyEntryId, r.boutId]));
  const runByLegacyEntryId = new Map(predictionRuns.map((r) => [r.legacyEntryId, r]));

  for (const p of propPicks) {
    let boutId = p.upcomingId ? boutByLegacyEntryId.get(p.upcomingId) ?? null : null;
    if (!boutId) {
      // Resolve fight-specific props by (event, date, unordered fighter pair).
      const eventId = eventIdFor({
        promotion: derivePromotion(p.eventName), date: p.eventDate, name: p.eventName,
      });
      const candidate = boutIdFor({
        eventId, fighterKeys: [fighterKey(p.fighterA), fighterKey(p.fighterB)],
      });
      if (bouts.has(candidate)) boutId = candidate;
    }
    if (!boutId) {
      // A fight-specific prop that cannot be resolved ABORTS. There is no
      // "unresolved" durable variant: persisting a knowingly broken link is
      // worse than refusing to migrate.
      errors.push(
        `prop ${p.id}: fight-specific prop could not be resolved to a bout ` +
        `(${p.fighterA} vs ${p.fighterB} @ ${p.eventName} ${p.eventDate})`
      );
      continue;
    }
    const bout = bouts.get(boutId);
    const oriented = bout.cornerA.displayName === p.fighterA ? (c) => c : (c) => (c === 'A' ? 'B' : 'A');
    const eventId = bout.eventId;
    props.push({
      id: String(p.id),
      eventId,
      target: { kind: 'bout', boutId, corner: p.side === null ? null : oriented(p.side) },
      method: p.method,
      propType: p.propType,
      label: p.label,
      odds: parseOdds(p.odds, `prop ${p.id}.odds`, errors),
      stakeUnits: p.stake ?? 1,
      result: p.result,
      pickSource: p.pickSource,
      createdAt: p.createdAt,
    });
  }

  // ── parlays ────────────────────────────────────────────────────────────
  const parlays = parlayEntries.map((pl) => ({
    id: String(pl.id),
    eventId: blank(pl.eventName)
      ? null
      : eventIdFor({ promotion: derivePromotion(pl.eventName), date: pl.eventDate, name: pl.eventName }),
    combinedOdds: parseOdds(pl.combinedOdds, `parlay ${pl.id}.combinedOdds`, errors),
    stakeUnits: pl.unitsWagered ?? 1,
    pickSource: pl.pickSource,
    createdAt: pl.createdAt,
    legs: (pl.legs ?? []).map((leg) => {
      const boutId = boutByLegacyEntryId.get(leg.fightId) ?? null;
      if (!boutId) errors.push(`parlay ${pl.id}: leg fightId ${leg.fightId} does not resolve to a bout`);
      const bout = boutId ? bouts.get(boutId) : null;
      const flip = bout && bout.cornerA.displayName !== leg.fighterA;
      const toCorner = (name) => (bout && bout.cornerA.displayName === name ? 'A' : 'B');
      return {
        boutId,
        pickedCorner: toCorner(leg.pickedFighter),
        modelDefaultCorner: leg.v2DefaultFighter ? toCorner(leg.v2DefaultFighter) : null,
        modelProbAtBuild: leg.v2ProbAtBuild ?? null,
        overridden: Boolean(leg.overridden),
      };
    }),
  }));

  // Parlay status/result are intentionally NOT migrated — derived at read time.
  if (parlayEntries.length) {
    manifest.droppedFields.push({
      entity: 'Parlay', fields: ['status', 'result'],
      reason: 'non-authoritative; re-derived by computeParlayResult at read time',
    });
  }

  const store = {
    meta: { schemaVersion: SCHEMA_VERSION, migratedAt: deps.migratedAt },
    events: [...events.values()],
    bouts: [...bouts.values()],
    predictionRuns,
    predictionSnapshots,
    marketSnapshots,
    bettingAssessments,
    trackedPositions,
    wagers: [], // legacy data cannot prove placement
    props,
    parlays,
  };

  manifest.counts = Object.fromEntries(
    Object.entries(store).filter(([k]) => k !== 'meta').map(([k, v]) => [k, v.length])
  );

  return { store, manifest, errors };
}

function pickProspect(entry, o, corner) {
  if (!has(entry, 'fighterAIsProspect') || !has(entry, 'fighterBIsProspect')) return null;
  const [a, b] = o.pick(entry.fighterAIsProspect, entry.fighterBIsProspect);
  return corner === 'A' ? a : b;
}

function normaliseManifest(sm) {
  const out = {};
  for (const [k, v] of Object.entries(sm)) {
    out[k] = {
      contentHash: v.contentHash,
      feedsV2: v.feedsV2,
      file: v.file,
      generatedAt: v.generatedAt,
      generatorVersion: v.generatorVersion,
      maxObservedEventDate: v.maxObservedEventDate ?? null,
      note: v.note ?? null,
      verificationMethod: v.verificationMethod,
    };
  }
  return out;
}

/**
 * Settlement.
 *
 * Financial computability follows the SELECTED corner's odds, not merely
 * whether a market snapshot exists — a partial market can price one corner and
 * not the other.
 *
 * settledAt is null for every migrated settled position: legacy data never
 * recorded one, and substituting the migration clock would turn the moment of
 * data conversion into a false historical event.
 */
function buildSettlement(result, corner, selectedOdds, entry, manifest, runId) {
  if (result.status !== 'resolved') return { status: 'open' };

  manifest.defaulted.push({
    entity: 'TrackedPosition', id: trackedPositionIdFor({ runId }), field: 'settlement.settledAt', value: null,
    reason: 'legacy data records no settlement time; the real time is unknown',
  });

  if (result.outcome === 'draw') {
    return {
      status: 'settled', outcome: 'push',
      financialResult: { status: 'computed', profitUnits: 0 },
      settledAt: null,
    };
  }
  if (result.outcome === 'noContest') {
    return {
      status: 'settled', outcome: 'void',
      financialResult: { status: 'computed', profitUnits: 0 },
      settledAt: null,
    };
  }

  const won = result.outcome === corner;
  if (selectedOdds === null) {
    return {
      status: 'settled',
      outcome: won ? 'won' : 'lost',
      financialResult: { status: 'uncomputable', reason: 'missingSelectedCornerOdds' },
      settledAt: null,
    };
  }
  const stake = has(entry, 'unitsWagered') ? entry.unitsWagered : 1;
  const dec = selectedOdds > 0 ? 1 + selectedOdds / 100 : 1 + 100 / Math.abs(selectedOdds);
  const profit = won ? stake * (dec - 1) : -stake;
  return {
    status: 'settled',
    outcome: won ? 'won' : 'lost',
    financialResult: { status: 'computed', profitUnits: profit },
    settledAt: null,
  };
}
