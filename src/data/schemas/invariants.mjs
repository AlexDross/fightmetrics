// Stage 6 — cross-entity invariants Zod cannot express.
//
// Zod validates one record at a time. These rules span records: foreign keys,
// denormalised-index consistency, and the orientation contract. Run over a
// whole store; returns a list of violations (empty === valid).

const push = (out, code, message, context) => out.push({ code, message, context });

/**
 * DENORMALISED INDEXES — explicitly redundant, kept for IndexedDB/SQL index
 * locality, and therefore requiring consistency checks:
 *
 *   PredictionSnapshot.boutId    duplicates run.boutId
 *   BettingAssessment.boutId     duplicates run.boutId
 *   BettingAssessment.runId      duplicates deref(predictionSnapshotId).runId
 *   MarketSnapshot.boutId        (primary lookup key; no parent chain)
 *   TrackedPosition.boutId       duplicates deref(assessmentId).boutId
 *   Wager.boutId                 duplicates deref(assessmentId).boutId
 */
export const DENORMALISED_INDEX_FIELDS = Object.freeze([
  'predictionSnapshots.boutId',
  'bettingAssessments.boutId',
  'bettingAssessments.runId',
  'trackedPositions.boutId',
  'wagers.boutId',
]);

export function checkInvariants(store) {
  const out = [];
  const byId = (rows) => new Map(rows.map((r) => [r.id, r]));

  const events = byId(store.events);
  const bouts = byId(store.bouts);
  const runs = byId(store.predictionRuns);
  const snapshots = byId(store.predictionSnapshots);
  const markets = byId(store.marketSnapshots);
  const assessments = byId(store.bettingAssessments);

  // ── uniqueness ───────────────────────────────────────────────────────────
  for (const [name, rows] of Object.entries(store)) {
    if (name === 'meta' || !Array.isArray(rows)) continue;
    const seen = new Set();
    for (const r of rows) {
      if (seen.has(r.id)) push(out, 'DUPLICATE_ID', `duplicate id in ${name}`, r.id);
      seen.add(r.id);
    }
  }

  // ── Bout -> Event ────────────────────────────────────────────────────────
  for (const b of store.bouts) {
    if (!events.has(b.eventId)) push(out, 'FK_MISSING', 'bout.eventId does not resolve', b.id);
    if (b.cornerA.displayName === b.cornerB.displayName) {
      push(out, 'BOUT_SAME_CORNERS', 'both corners name the same fighter', b.id);
    }
  }

  // ── PredictionRun ────────────────────────────────────────────────────────
  for (const run of store.predictionRuns) {
    if (!bouts.has(run.boutId)) push(out, 'FK_MISSING', 'run.boutId does not resolve', run.id);
    const decision = snapshots.get(run.decisionSnapshotId);
    if (!decision) {
      push(out, 'FK_MISSING', 'run.decisionSnapshotId does not resolve', run.id);
    } else {
      // The whole point of replacing the duplicated decisionBasis/isDecisionBasis
      // flags: the pointer must belong to its own run AND its own bout.
      if (decision.runId !== run.id) {
        push(out, 'DECISION_SNAPSHOT_FOREIGN', 'decisionSnapshotId belongs to another run', run.id);
      }
      if (decision.boutId !== run.boutId) {
        push(out, 'DECISION_SNAPSHOT_FOREIGN_BOUT', 'decisionSnapshotId belongs to another bout', run.id);
      }
    }

    // Derived flag consistency. When BOTH corner flags are known the derived
    // value is fully determined, so null is just as wrong as the wrong boolean:
    // gating on `includesProspectAtCapture !== null` left
    // (true, false, null) passing, which is not an unknown at all.
    //
    // When either corner flag is null the derived value genuinely cannot be
    // verified, so it is left alone.
    if (run.cornerAIsProspectAtCapture !== null && run.cornerBIsProspectAtCapture !== null) {
      const expected = run.cornerAIsProspectAtCapture || run.cornerBIsProspectAtCapture;
      if (run.includesProspectAtCapture !== expected) {
        push(
          out, 'PROSPECT_FLAG_MISMATCH',
          run.includesProspectAtCapture === null
            ? 'includesProspectAtCapture is null although both corner flags are known'
            : 'includesProspectAtCapture is not the OR of the corner flags',
          run.id
        );
      }
    }
  }

  // ── PredictionSnapshot ───────────────────────────────────────────────────
  const basisSeen = new Set();
  for (const s of store.predictionSnapshots) {
    const run = runs.get(s.runId);
    if (!run) {
      push(out, 'FK_MISSING', 'snapshot.runId does not resolve', s.id);
    } else if (s.boutId !== run.boutId) {
      push(out, 'DENORM_MISMATCH', 'snapshot.boutId disagrees with its run', s.id);
    }
    const key = `${s.runId}|${s.basis}`;
    if (basisSeen.has(key)) push(out, 'DUPLICATE_BASIS', 'two snapshots share a run and basis', s.id);
    basisSeen.add(key);

    const winner = s.probA >= s.probB ? 'A' : 'B';
    if (s.winnerCorner !== winner) {
      push(out, 'WINNER_MISMATCH', 'winnerCorner disagrees with probabilities', s.id);
    }
    if (s.captureMode !== 'reconstructed' && s.reconstruction !== null) {
      push(out, 'RECONSTRUCTION_UNEXPECTED', 'reconstruction present on a non-reconstructed snapshot', s.id);
    }
    // Both directions. Claiming reconstruction without recording what was
    // reconstructed is an unfalsifiable provenance claim.
    if (s.captureMode === 'reconstructed' && s.reconstruction === null) {
      push(out, 'RECONSTRUCTION_MISSING', 'a reconstructed snapshot must record its reconstruction details', s.id);
    }
  }

  // ── MarketSnapshot ───────────────────────────────────────────────────────
  for (const m of store.marketSnapshots) {
    if (!bouts.has(m.boutId)) push(out, 'FK_MISSING', 'marketSnapshot.boutId does not resolve', m.id);
    if (m.oddsA === null && m.oddsB === null) {
      // A snapshot with no odds at all carries no market fact; it should not
      // have been created. Partial (one corner only) IS allowed.
      push(out, 'EMPTY_MARKET_SNAPSHOT', 'market snapshot has no odds for either corner', m.id);
    }
  }

  // ── BettingAssessment ────────────────────────────────────────────────────
  for (const a of store.bettingAssessments) {
    const run = runs.get(a.runId);
    const snap = snapshots.get(a.predictionSnapshotId);
    if (!run) push(out, 'FK_MISSING', 'assessment.runId does not resolve', a.id);
    if (!snap) push(out, 'FK_MISSING', 'assessment.predictionSnapshotId does not resolve', a.id);
    if (snap && snap.runId !== a.runId) {
      push(out, 'DENORM_MISMATCH', 'assessment.runId disagrees with its snapshot', a.id);
    }
    if (run && a.boutId !== run.boutId) {
      push(out, 'DENORM_MISMATCH', 'assessment.boutId disagrees with its run', a.id);
    }
    if (a.marketSnapshotId !== null) {
      const m = markets.get(a.marketSnapshotId);
      if (!m) {
        push(out, 'FK_MISSING', 'assessment.marketSnapshotId does not resolve', a.id);
      } else if (m.boutId !== a.boutId) {
        // Pricing one fight against another fight's line is meaningless.
        push(out, 'ASSESSMENT_MARKET_FOREIGN', 'assessment market snapshot belongs to another bout', a.id);
      }
    }
    // ONE-WAY rule. No market => no market-derived values. The converse is NOT
    // asserted: a market may exist while a particular derived value is null.
    if (a.marketSnapshotId === null) {
      const derived = ['fairLineA', 'fairLineB', 'edgeA', 'edgeB', 'evA', 'evB', 'kellyA', 'kellyB'];
      for (const k of derived) {
        if (a[k] !== null) {
          push(out, 'DERIVED_WITHOUT_MARKET', `${k} is set but there is no market snapshot`, a.id);
        }
      }
    }
  }

  // ── TrackedPosition ──────────────────────────────────────────────────────
  for (const t of store.trackedPositions) {
    const a = assessments.get(t.assessmentId);
    if (!a) {
      push(out, 'FK_MISSING', 'trackedPosition.assessmentId does not resolve', t.id);
      continue;
    }
    if (t.boutId !== a.boutId) {
      push(out, 'DENORM_MISMATCH', 'trackedPosition.boutId disagrees with its assessment', t.id);
    }
    if (t.marketSnapshotId !== null) {
      const m = markets.get(t.marketSnapshotId);
      if (!m) {
        push(out, 'FK_MISSING', 'trackedPosition.marketSnapshotId does not resolve', t.id);
      } else if (m.boutId !== t.boutId) {
        // Scoring one fight's position against another fight's line.
        push(out, 'TRACKED_MARKET_FOREIGN', 'tracked market snapshot belongs to another bout', t.id);
      }
    }
    // A tracked position is scored against ITS OWN market, not the
    // assessment's. Amending an ROI price repoints only this field and leaves
    // the frozen assessment alone, so reading the assessment market here would
    // score the position at a price it is no longer tracked at.
    checkFinancialComputability(out, t, t.marketSnapshotId, markets, bouts);
  }

  // ── Wager ────────────────────────────────────────────────────────────────
  // Deliberately NOT required to agree with TrackedPosition.corner: a real bet
  // may intentionally differ from the model-tracked side.
  for (const w of store.wagers) {
    const a = assessments.get(w.assessmentId);
    if (!a) {
      push(out, 'FK_MISSING', 'wager.assessmentId does not resolve', w.id);
      continue;
    }
    if (w.boutId !== a.boutId) {
      push(out, 'DENORM_MISMATCH', 'wager.boutId disagrees with its assessment', w.id);
    }
    if (w.marketSnapshotId !== null) {
      const m = markets.get(w.marketSnapshotId);
      if (!m) push(out, 'FK_MISSING', 'wager.marketSnapshotId does not resolve', w.id);
      else if (m.boutId !== a.boutId) {
        push(out, 'WAGER_MARKET_FOREIGN', 'wager market snapshot belongs to another bout', w.id);
      }
    }
    if (w.settlement.status === 'settled' && w.settlement.settledAt === null) {
      push(out, 'WAGER_SETTLED_AT_NULL', 'a wager settlement must record when it settled', w.id);
    }
    // A wager is scored against ITS OWN market, not the assessment's. A real
    // bet may deliberately be taken at a later or different line, so reading
    // the assessment market here would validate the wrong price entirely —
    // an assessment with a priced corner would excuse a wager whose own market
    // never priced that corner.
    checkFinancialComputability(out, w, w.marketSnapshotId, markets, bouts);
  }

  // ── Prop / Parlay ────────────────────────────────────────────────────────
  for (const p of store.props) {
    if (!events.has(p.eventId)) push(out, 'FK_MISSING', 'prop.eventId does not resolve', p.id);
    if (p.target.kind === 'bout') {
      const bout = bouts.get(p.target.boutId);
      if (!bout) {
        push(out, 'FK_MISSING', 'prop.target.boutId does not resolve', p.id);
      } else if (bout.eventId !== p.eventId) {
        // Otherwise a prop could claim to belong to one card while pointing at
        // a fight on another.
        push(out, 'PROP_EVENT_MISMATCH', 'prop.eventId disagrees with its target bout\'s event', p.id);
      }
    }
    if (p.target.kind === 'event') {
      if (!events.has(p.target.eventId)) {
        push(out, 'FK_MISSING', 'prop.target.eventId does not resolve', p.id);
      } else if (p.target.eventId !== p.eventId) {
        push(out, 'PROP_EVENT_MISMATCH', 'event-level prop targets a different event than it belongs to', p.id);
      }
    }
  }

  for (const p of store.parlays) {
    if (p.eventId !== null && !events.has(p.eventId)) {
      push(out, 'FK_MISSING', 'parlay.eventId does not resolve', p.id);
    }
    const legBouts = new Set();
    for (const leg of p.legs) {
      if (!bouts.has(leg.boutId)) push(out, 'FK_MISSING', 'parlay leg boutId does not resolve', p.id);
      if (legBouts.has(leg.boutId)) push(out, 'PARLAY_DUPLICATE_LEG', 'two legs reference the same bout', p.id);
      legBouts.add(leg.boutId);
    }
  }

  return out;
}

/**
 * Financial computability depends on the SELECTED corner's odds in the
 * RELEVANT market, not merely on whether some market snapshot exists — a
 * partial market can price one corner and not the other.
 *
 * The relevant market differs per record type, so it is passed in rather than
 * read from the assessment. All three are independent:
 *   BettingAssessment.marketSnapshotId -> the prediction-time price that
 *                                          produced the frozen tier/edge/EV
 *   TrackedPosition.marketSnapshotId   -> the price the result is SCORED at
 *   Wager.marketSnapshotId             -> the price actually TAKEN
 *
 *   open                       -> no financial result at all
 *   settled draw  -> push,  computed 0
 *   settled NC    -> void,  computed 0
 *   decisive, selected corner priced      -> computed profit
 *   decisive, selected corner not priced  -> uncomputable
 */
function checkFinancialComputability(out, position, marketSnapshotId, markets, bouts) {
  const s = position.settlement;
  if (s.status !== 'settled') return;

  const bout = bouts.get(position.boutId);
  const market = marketSnapshotId ? markets.get(marketSnapshotId) : null;
  const selectedOdds = market ? (position.corner === 'A' ? market.oddsA : market.oddsB) : null;

  if (bout && bout.result.status === 'resolved') {
    if (bout.result.outcome === 'draw' && s.outcome !== 'push') {
      push(out, 'SETTLEMENT_OUTCOME_MISMATCH', 'a draw must settle as push', position.id);
    }
    if (bout.result.outcome === 'noContest' && s.outcome !== 'void') {
      push(out, 'SETTLEMENT_OUTCOME_MISMATCH', 'a no-contest must settle as void', position.id);
    }
  }

  // push/void are always computable and always zero, priced or not.
  if (s.outcome === 'push' || s.outcome === 'void') {
    if (s.financialResult.status !== 'computed' || s.financialResult.profitUnits !== 0) {
      push(out, 'SETTLEMENT_PROFIT_MISMATCH', 'push/void must be a computed profit of 0', position.id);
    }
    return;
  }

  if (selectedOdds === null || selectedOdds === undefined) {
    if (s.financialResult.status !== 'uncomputable') {
      push(
        out, 'FINANCIAL_SHOULD_BE_UNCOMPUTABLE',
        'no odds for the selected corner, so profit cannot be computed', position.id
      );
    }
  } else if (s.financialResult.status !== 'computed') {
    push(
      out, 'FINANCIAL_SHOULD_BE_COMPUTED',
      'the selected corner is priced, so profit must be computed', position.id
    );
  }
}
