// ─── DOMAIN / STATISTICS ────────────────────────────────────────────────
// Foundation Stage 3. Extracted VERBATIM from src/App.js.
//
// Every line below is byte-identical to its original. Exports are declared in a
// single block at the end so no moved line had to change.
//
// Original locations in App.js (pre-extraction line numbers):
//    1016-1017  isPushResult
//    1018-1022  isResolvedWinner
//    1023-1051  calcTrackedProfit
//    1052-1055  ROI_ANALYTICS_LOW_N
//    1056-1065  ROI_MARKET_BANDS
//    1066-1073  ROI_V2_PROB_BUCKETS
//    1074-1083  bandOf
//    1084-1115  computeRoiByMarketBand
//    1116-1139  roiV2GradedPopulation
//    1140-1191  computeModelVsMarketByBand
//    1192-1230  computeCalibrationReliability
//    1231-1246  filterRoiEntriesForStats
//    1247-1267  ROI_BET_TIERS
//    1268-1310  computeBetTierBreakdown
//    1311-1323  filterStakedGraded
//    1324-1352  computeCumulativePnl
//    1353-1403  computeMonthlyPerformance
//    1404-1436  computeV2FrozenRows
//    1437-1451  computeV2WindowComposition
//    1452-1482  computeV2Summary
//    1483-1508  computeRoiByMarketBandV2
//    1509-1537  computeCumulativePnlV2
//    1538-1567  computeMonthlyPerformanceV2
//    2227-2235  isDoubleChance
//    2236-2253  buildPropLabel
//    2254-2265  propTypeOf
//    2266-2296  computePropSummary
//    2297-2326  computePropTypeBreakdown
//    2327-2358  propPickProfit
//    2359-2396  computeParlayResult
//    2397-2432  computeParlaySummary
//    3172-3207  computeROISummary

import { parseAmericanOdds, stripVig, americanToDecimal } from '../betting';

const isPushResult = (value) => value === 'NC' || value === 'DRAW';


const isResolvedWinner = (value, entry) =>
  value === entry?.fighterA ||
  value === entry?.fighterB ||
  isPushResult(value);


const calcTrackedProfit = (entry) => {
  if (
    !entry ||
    !entry.marketOdds ||
    !isResolvedWinner(entry.actualWinner, entry)
  )
    return null;

  if (isPushResult(entry.actualWinner)) return 0;

  const dec = americanToDecimal(entry.marketOdds);
  if (!dec) return null;

  // Stake defaults to 1u when unitsWagered is absent -- true for every entry
  // saved before this field existed (Alex confirmed all prior entries were
  // flat 1u). This keeps every historical entry's computed profit identical.
  const stake = entry.unitsWagered != null ? entry.unitsWagered : 1;
  return entry.actualWinner === entry.trackedSide ? stake * (dec - 1) : -stake;
};

// ─── ROI TAB ANALYTICS (read-only aggregation over graded ROI_ENTRIES) ─────────
// Three chart datasets below reuse the existing pure helpers above
// (isResolvedWinner, americanToDecimal, calcTrackedProfit, parseAmericanOdds,
// stripVig) exactly as-is. They only READ entry fields already computed and
// stored by buildRoiEntry()/the save-prediction flow -- no prediction,
// probability, or betAction value is computed or altered here.
//
// Low-sample threshold: n < 8, matching the ⚠ convention already established in
// research/v2_calibration_audit.md and research/v2_recalibration_test.md.

const ROI_ANALYTICS_LOW_N = 8;

// Market-probability bands -- identical boundaries to the "By market band" table
// in research/v2_calibration_audit.md (raw-implied prob of the relevant side).

const ROI_MARKET_BANDS = [
  { name: '<55%', lo: 0, hi: 0.55 },
  { name: '55-60%', lo: 0.55, hi: 0.60 },
  { name: '60-65%', lo: 0.60, hi: 0.65 },
  { name: '65-70%', lo: 0.65, hi: 0.70 },
  { name: '70-80%', lo: 0.70, hi: 0.80 },
  { name: '80%+', lo: 0.80, hi: 1.01 },
];

// V2 self-confidence buckets for the calibration reliability chart.

const ROI_V2_PROB_BUCKETS = [
  { name: '50-60%', lo: 0.50, hi: 0.60 },
  { name: '60-70%', lo: 0.60, hi: 0.70 },
  { name: '70-80%', lo: 0.70, hi: 0.80 },
  { name: '80-90%', lo: 0.80, hi: 0.90 },
  { name: '90%+', lo: 0.90, hi: 1.01 },
];


const bandOf = (bands, p) => {
  if (p == null) return null;
  const hit = bands.find((b) => p >= b.lo && p < b.hi);
  return hit ? hit.name : null;
};

// Chart 1 — ROI by market band, on the entry's actual staked (tracked) side.
// Model-agnostic: uses whatever price/side was actually recorded, same
// population logic (marketOdds present, resolved winner, not user-rejected)
// as computeROISummary's `betEntries`.

function computeRoiByMarketBand(entries) {
  const staked = entries.filter(
    (e) =>
      isResolvedWinner(e.actualWinner, e) &&
      e.confirmedByUser !== false &&
      americanToDecimal(e.marketOdds)
  );
  const buckets = ROI_MARKET_BANDS.map((b) => ({ ...b, profits: [] }));
  staked.forEach((e) => {
    const raw = parseAmericanOdds(e.marketOdds);
    const name = bandOf(ROI_MARKET_BANDS, raw);
    if (!name) return;
    const bucket = buckets.find((b) => b.name === name);
    const profit = calcTrackedProfit(e);
    if (profit != null) bucket.profits.push(profit);
  });
  return buckets.map((b) => {
    const n = b.profits.length;
    return {
      band: b.name,
      n,
      roi: n ? (b.profits.reduce((s, p) => s + p, 0) / n) * 100 : null,
      lowN: n > 0 && n < ROI_ANALYTICS_LOW_N,
    };
  });
}

// Shared population for charts 2 & 3: entries carrying the FROZEN v2pA/v2pB
// fields (not live-recomputed), decisive graded outcome only. This mirrors
// research/v2_calibration_audit.md's basis exactly (same frozen fields, same
// decisive-only filter) so the live chart is a direct, growing extension of
// that report's 54-fight window, not a different methodology.

function roiV2GradedPopulation(entries) {
  return entries.filter(
    (e) =>
      e.v2pA != null &&
      e.v2pB != null &&
      (e.actualWinner === e.fighterA || e.actualWinner === e.fighterB)
  );
}

// Chart 2 — V2's picked-side actual win rate vs. de-vigged market-implied
// probability, grouped by market band. Band membership uses RAW implied prob
// (matches Codex/v2_calibration_audit.md bucket convention); the plotted
// market-probability value is DE-VIGGED (matches that report's "Market
// columns scored with de-vig probability" choice).
//
// basis='v1' reads the frozen fighterAProb/fighterBProb pair instead of
// v2pA/v2pB, on the exact same population (buildRoiEntry stores both pairs
// unconditionally in the same save, so there's no population mismatch).
// Default ('v2') is byte-identical to this function's original behavior.
// v2's basis is restricted to _provenance.captureMode === 'live', same
// reasoning and same population as computeCalibrationReliability below --
// this chart shares roiV2GradedPopulation with that one and reads the same
// frozen v2pA/v2pB fields, so it has identical exposure to the 2026-07-12
// reconstruction (see BASELINE_NOTES.md). v1's basis is untouched.

function computeModelVsMarketByBand(entries, basis = 'v2') {
  const pop =
    basis === 'v2'
      ? roiV2GradedPopulation(entries).filter((e) => e._provenance?.captureMode === 'live')
      : roiV2GradedPopulation(entries);
  const buckets = ROI_MARKET_BANDS.map((b) => ({ ...b, rows: [] }));
  pop.forEach((e) => {
    const rawA = parseAmericanOdds(e.oddsA);
    const rawB = parseAmericanOdds(e.oddsB);
    if (rawA == null || rawB == null) return;
    const pA = basis === 'v1' ? e.fighterAProb : e.v2pA;
    const pB = basis === 'v1' ? e.fighterBProb : e.v2pB;
    const pickA = pA >= pB;
    const pickName = pickA ? e.fighterA : e.fighterB;
    const { noVigA, noVigB } = stripVig(rawA, rawB);
    const rawPick = pickA ? rawA : rawB;
    const noVigPick = pickA ? noVigA : noVigB;
    const name = bandOf(ROI_MARKET_BANDS, rawPick);
    if (!name) return;
    buckets
      .find((b) => b.name === name)
      .rows.push({ won: e.actualWinner === pickName ? 1 : 0, mktProb: noVigPick });
  });
  return buckets.map((b) => {
    const n = b.rows.length;
    return {
      band: b.name,
      n,
      actualWinRate: n
        ? (b.rows.reduce((s, r) => s + r.won, 0) / n) * 100
        : null,
      marketImplied: n
        ? (b.rows.reduce((s, r) => s + r.mktProb, 0) / n) * 100
        : null,
      lowN: n > 0 && n < ROI_ANALYTICS_LOW_N,
    };
  });
}

// Chart 3 — calibration reliability: V2's own predicted probability (on its
// picked side) bucketed, vs. actual win rate in that bucket. `predictedMean`
// (mean of V2's actual predictions within the bucket, not the bucket's
// nominal midpoint) doubles as the "perfect calibration" reference series --
// connecting it across buckets is the bucketed equivalent of a y=x diagonal.
// basis='v1' reads frozen fighterAProb/fighterBProb instead of v2pA/v2pB, same
// population and shape as the v2 default. Default is byte-identical to before.
// v2's basis is restricted to _provenance.captureMode === 'live' -- a
// reliability curve is a claim about forecasting before the outcome was
// known, and a meaningful fraction of stored v2pA values were computed
// after the fact (see BASELINE_NOTES.md, "2026-07-12 reconstruction").
// v1's fighterAProb history has no equivalent contamination and is left
// unfiltered, unchanged from this function's original behavior.

function computeCalibrationReliability(entries, basis = 'v2') {
  const pop =
    basis === 'v2'
      ? roiV2GradedPopulation(entries).filter((e) => e._provenance?.captureMode === 'live')
      : roiV2GradedPopulation(entries);
  const buckets = ROI_V2_PROB_BUCKETS.map((b) => ({ ...b, rows: [] }));
  pop.forEach((e) => {
    const pA = basis === 'v1' ? e.fighterAProb : e.v2pA;
    const pB = basis === 'v1' ? e.fighterBProb : e.v2pB;
    const pickA = pA >= pB;
    const pickName = pickA ? e.fighterA : e.fighterB;
    const pickProb = Math.max(pA, pB);
    const name = bandOf(ROI_V2_PROB_BUCKETS, pickProb);
    if (!name) return;
    buckets
      .find((b) => b.name === name)
      .rows.push({ won: e.actualWinner === pickName ? 1 : 0, pred: pickProb });
  });
  return buckets.map((b) => {
    const n = b.rows.length;
    return {
      bucket: b.name,
      n,
      predictedMean: n
        ? (b.rows.reduce((s, r) => s + r.pred, 0) / n) * 100
        : null,
      actualWinRate: n
        ? (b.rows.reduce((s, r) => s + r.won, 0) / n) * 100
        : null,
      lowN: n > 0 && n < ROI_ANALYTICS_LOW_N,
    };
  });
}

// Shared population filter for the Statistics tab charts -- mirrors ROITab's
// own `displayedEntries` filter (prospect exclusion + Since-date cutoff)
// without the extra display-only fields ROITab's list rendering needs. Feeds
// the same three compute* functions above with the same inputs as before;
// this is the "minimal wiring" the charts' relocation out of ROITab needs.

function filterRoiEntriesForStats(entries, prospectNameSet, filterSince) {
  return entries.filter((e) => {
    const includesProspect =
      e.includesProspect != null
        ? e.includesProspect
        : e.fighterAIsProspect != null
        ? e.fighterAIsProspect
        : e.fighterBIsProspect != null
        ? e.fighterBIsProspect
        : prospectNameSet.has(e.fighterA) || prospectNameSet.has(e.fighterB);
    if (includesProspect) return false;
    if (filterSince && (e.eventDate || '') < filterSince) return false;
    return true;
  });
}


const ROI_BET_TIERS = ['STRONG BET', 'BET', 'LEAN', 'NO BET'];

// Chart 4 — ROI and win rate by bet-action tier (STRONG BET / BET / LEAN /
// NO BET), including the declined (NO BET) pool.
//
// FROZEN: reads each entry's own STORED `betAction` -- the tier is never
// re-derived from current fighter data (no computeMatchupEdges call, no
// fighterMap). This makes the chart invariant to how far fighter data has
// drifted past the fight, at the cost of tier-provenance being mixed:
// - Live-captured entries (`_provenance.captureMode === 'live'`): `betAction`
//   was set by the gate at save time, for whichever model (v1/v2) was active
//   then -- a genuine prediction-time tier.
// - Reconstructed entries: verified directly against the data (not assumed)
//   that `betAction`/`trackedSide`/`edge` on these rows equal the ORIGINAL
//   v1-basis capture (predictedWinner/predictedProb), untouched by the
//   2026-07-12 v2pA/v2pB backfill -- i.e. this is a v1-era tier, not a
//   v2-specific gate decision, despite the entry now also carrying v2 fields.
// See BetTierWinRateChart/BetTierRoiChart captions for the user-facing
// version of this caveat. Per-entry profit still uses v2's own pick (v2pA/
// v2pB, frozen, read directly -- not recomputed) at that pick's own price,
// stake-weighted by unitsWagered, matching every other frozen v2 chart below.

function computeBetTierBreakdown(entries) {
  const rows = [];
  entries.forEach((entry) => {
    if (!isResolvedWinner(entry.actualWinner, entry)) return;
    if (isPushResult(entry.actualWinner)) return;
    if (entry.confirmedByUser === false) return;
    if (entry.v2pA == null || entry.v2pB == null) return;
    const tier = entry.betAction;
    if (!tier) return;

    const v2pick = entry.v2pA >= entry.v2pB ? entry.fighterA : entry.fighterB;
    const v2odds = v2pick === entry.fighterA
      ? (entry.oddsA || entry.marketOdds)
      : (entry.oddsB || entry.marketOdds);
    const dec = americanToDecimal(v2odds);
    if (!dec) return;
    const won = entry.actualWinner === v2pick;
    const stake = entry.unitsWagered != null ? entry.unitsWagered : 1;
    const profit = (won ? dec - 1 : -1) * stake;

    rows.push({ tier, won: won ? 1 : 0, profit, stake });
  });

  return ROI_BET_TIERS.map((tier) => {
    const tierRows = rows.filter((r) => r.tier === tier);
    const n = tierRows.length;
    // ROI must be scaled by units actually risked, not row count -- `n`
    // stays the displayed tier count, only the roi denominator uses staked
    // units.
    const totalStaked = tierRows.reduce((s, r) => s + r.stake, 0);
    return {
      tier,
      n,
      winRate: n ? (tierRows.reduce((s, r) => s + r.won, 0) / n) * 100 : null,
      roi: totalStaked ? (tierRows.reduce((s, r) => s + r.profit, 0) / totalStaked) * 100 : null,
      lowN: n > 0 && n < ROI_ANALYTICS_LOW_N,
    };
  });
}

// Staked/graded population shared by the cumulative P&L chart and monthly
// table below -- same filter as computeRoiByMarketBand's `staked` (chart 1),
// duplicated rather than extracted so that function stays untouched.

function filterStakedGraded(entries) {
  return entries.filter(
    (e) =>
      isResolvedWinner(e.actualWinner, e) &&
      e.confirmedByUser !== false &&
      americanToDecimal(e.marketOdds)
  );
}

// Cumulative P&L, grouped per-event (not per-month): at current data volume
// (~6-7 events per Since window) per-event gives a clean multi-point line;
// per-month would collapse to 2-3 points, too coarse to show a trend.
// Events are ordered by eventDate; ties (same date) keep ledger order.

function computeCumulativePnl(entries) {
  const staked = filterStakedGraded(entries);
  const byEvent = new Map();
  staked.forEach((e) => {
    const key = `${e.eventDate || ''}__${e.eventName || 'Unknown Event'}`;
    if (!byEvent.has(key)) {
      byEvent.set(key, { eventDate: e.eventDate || '', eventName: e.eventName || 'Unknown Event', profits: [] });
    }
    const profit = calcTrackedProfit(e);
    if (profit != null) byEvent.get(key).profits.push(profit);
  });
  const events = Array.from(byEvent.values()).sort((a, b) =>
    a.eventDate < b.eventDate ? -1 : a.eventDate > b.eventDate ? 1 : 0
  );
  let cumulative = 0;
  return events.map((ev) => {
    const eventProfit = ev.profits.reduce((s, p) => s + p, 0);
    cumulative += eventProfit;
    return {
      eventName: ev.eventName,
      eventDate: ev.eventDate,
      n: ev.profits.length,
      eventProfit,
      cumulative,
    };
  });
}

// Monthly performance table, grouped by event month (YYYY-MM from eventDate).

function computeMonthlyPerformance(entries) {
  const staked = filterStakedGraded(entries);
  const byMonth = new Map();
  staked.forEach((e) => {
    const month = (e.eventDate || '').slice(0, 7) || 'Unknown';
    if (!byMonth.has(month)) byMonth.set(month, []);
    const profit = calcTrackedProfit(e);
    const stake = e.unitsWagered != null ? e.unitsWagered : 1;
    if (profit != null) byMonth.get(month).push({ profit, won: e.actualWinner === e.trackedSide ? 1 : 0, stake });
  });
  const months = Array.from(byMonth.keys()).sort();
  return months.map((month) => {
    const rows = byMonth.get(month);
    const n = rows.length;
    const netUnits = rows.reduce((s, r) => s + r.profit, 0);
    // ROI must be scaled by units actually risked, not bet count -- `n`
    // stays the row count (winRate denom, Bets column); `staked` and the
    // roi denominator use the summed stake. netUnits was already
    // stake-aware via calcTrackedProfit; only the denominator here was
    // still a row count.
    const totalStaked = rows.reduce((s, r) => s + r.stake, 0);
    return {
      month,
      n,
      winRate: n ? (rows.reduce((s, r) => s + r.won, 0) / n) * 100 : null,
      staked: totalStaked,
      netUnits,
      roi: totalStaked ? (netUnits / totalStaked) * 100 : null,
    };
  });
}

// ─── V2-BASIS VARIANTS (for the Statistics tab's v1/v2 toggle) ────────────
// FROZEN: every function below reads each entry's own STORED v2pA/v2pB and
// odds fields. ZERO calls to computeMatchupEdges, ZERO reads of fighterMap/
// FIGHT_HISTORY/eloModule anywhere in this block. This is a deliberate
// invariance property, not an optimization: these functions used to LIVE-
// RECOMPUTE every pick against current fighter data, which was leakage-clean
// while Greco's scraper lagged every window fight (through 2026-05-16) and
// silently became contaminated once it caught up (through 2026-07-18) --
// each fight's own outcome ends up in the ELO/form/record inputs used to
// "predict" it. See research/source_integrity_audit.md's retired-verdict
// addendum. Frozen scoring can't drift the same way: the probability used to
// grade a pick is fixed at whatever was stored for it, never re-derived from
// whatever fighter data happens to exist at render time.
//
// Population note: these functions operate on whatever `entries` they're
// given -- callers decide whether that's the full window (mixed live +
// reconstructed, NOT a track record) or the live-only subset (the genuine
// prospective track record). See StatisticsTab's `summaryV2Live` vs
// `summaryV2All` split.

function computeV2FrozenRows(entries) {
  const rows = [];
  entries.forEach((entry) => {
    if (!isResolvedWinner(entry.actualWinner, entry)) return;
    if (isPushResult(entry.actualWinner)) return;
    if (!americanToDecimal(entry.marketOdds)) return;
    if (entry.confirmedByUser === false) return;
    const v2pA = entry.v2pA;
    const v2pB = entry.v2pB;
    if (v2pA == null || v2pB == null) return;
    const v2pick = v2pA >= v2pB ? entry.fighterA : entry.fighterB;
    const v2odds = v2pick === entry.fighterA
      ? (entry.oddsA || entry.marketOdds)
      : (entry.oddsB || entry.marketOdds);
    const dec = americanToDecimal(v2odds);
    if (!dec) return;
    const won = entry.actualWinner === v2pick;
    const stake = entry.unitsWagered != null ? entry.unitsWagered : 1;
    const profit = (won ? dec - 1 : -1) * stake;
    const rawPick = parseAmericanOdds(v2odds);
    rows.push({
      entry, v2pick, won, profit, rawPick, stake,
      eventName: entry.eventName,
      eventDate: entry.eventDate,
    });
  });
  return rows;
}

// Window composition of the v2-scored population -- same rows as
// computeV2FrozenRows, split by capture provenance. Feeds chart captions so
// they state the real live/reconstructed makeup of whatever SINCE window is
// active instead of a number baked in at write time.

function computeV2WindowComposition(entries) {
  const rows = computeV2FrozenRows(entries);
  const liveN = rows.filter((r) => r.entry._provenance?.captureMode === 'live').length;
  return { n: rows.length, liveN, reconN: rows.length - liveN };
}

// v2-basis accuracy + ROI summary. FROZEN: pick = argmax(stored v2pA, v2pB),
// never entry.trackedSide (trackedSide is v1's tracked pick -- for 9 of the
// 42 reconstructed entries in the default window, v1 and v2 disagree on the
// pick, so scoring trackedSide would silently grade v1's call on those rows;
// verified directly against committed data, not assumed). Accuracy is gated
// to v2-scored entries only (v2pA/v2pB both present) -- the SAME gate
// computeV2FrozenRows applies for ROI's `bets` population below -- so the two
// hero numbers share one population and move together under the Since filter
// instead of accuracy silently grading v1's pick on pre-v2-backfill fights.

function computeV2Summary(entries) {
  let gradedCount = 0;
  let v2Correct = 0;
  entries.forEach((entry) => {
    const decisive = entry.actualWinner === entry.fighterA || entry.actualWinner === entry.fighterB;
    if (!decisive) return;
    if (entry.v2pA == null || entry.v2pB == null) return;
    gradedCount++;
    const winner = entry.v2pA >= entry.v2pB ? entry.fighterA : entry.fighterB;
    if (winner === entry.actualWinner) v2Correct++;
  });
  const rows = computeV2FrozenRows(entries);
  const bets = rows.length;
  const profit = rows.reduce((s, r) => s + r.profit, 0);
  // ROI must be scaled by units actually risked, not bet count -- those are
  // only the same number when every bet is flat 1u. `bets` stays a row count
  // (displayed as "on N bets"); only the roi denominator uses totalStaked.
  const totalStaked = rows.reduce((s, r) => s + r.stake, 0);
  return {
    graded: gradedCount,
    correct: v2Correct,
    accuracy: gradedCount > 0 ? (v2Correct / gradedCount) * 100 : 0,
    bets,
    profit,
    roi: totalStaked > 0 ? (profit / totalStaked) * 100 : 0,
  };
}

// v2-basis variant of Chart 1 (ROI by Market Band): same band scheme, same
// output shape, but banded by V2's FROZEN pick + its own stored price instead
// of the tracked/staked side.

function computeRoiByMarketBandV2(entries) {
  const rows = computeV2FrozenRows(entries);
  const buckets = ROI_MARKET_BANDS.map((b) => ({ ...b, profits: [], stakes: [] }));
  rows.forEach((r) => {
    const name = bandOf(ROI_MARKET_BANDS, r.rawPick);
    if (!name) return;
    const bucket = buckets.find((b) => b.name === name);
    bucket.profits.push(r.profit);
    bucket.stakes.push(r.stake);
  });
  return buckets.map((b) => {
    const n = b.profits.length;
    // ROI must be scaled by units actually risked, not row count -- `n` stays
    // the displayed band count, only the roi denominator uses staked units.
    const totalStaked = b.stakes.reduce((s, st) => s + st, 0);
    return {
      band: b.name,
      n,
      roi: totalStaked ? (b.profits.reduce((s, p) => s + p, 0) / totalStaked) * 100 : null,
      lowN: n > 0 && n < ROI_ANALYTICS_LOW_N,
    };
  });
}

// v2-basis variant of the cumulative P&L chart: same per-event grouping,
// same output shape, banded on V2's frozen pick's own profit per entry.

function computeCumulativePnlV2(entries) {
  const rows = computeV2FrozenRows(entries);
  const byEvent = new Map();
  rows.forEach((r) => {
    const key = `${r.eventDate || ''}__${r.eventName || 'Unknown Event'}`;
    if (!byEvent.has(key)) {
      byEvent.set(key, { eventDate: r.eventDate || '', eventName: r.eventName || 'Unknown Event', profits: [] });
    }
    byEvent.get(key).profits.push(r.profit);
  });
  const events = Array.from(byEvent.values()).sort((a, b) =>
    a.eventDate < b.eventDate ? -1 : a.eventDate > b.eventDate ? 1 : 0
  );
  let cumulative = 0;
  return events.map((ev) => {
    const eventProfit = ev.profits.reduce((s, p) => s + p, 0);
    cumulative += eventProfit;
    return {
      eventName: ev.eventName,
      eventDate: ev.eventDate,
      n: ev.profits.length,
      eventProfit,
      cumulative,
    };
  });
}

// v2-basis variant of the monthly performance table: same per-month
// grouping, same output shape, using V2's frozen pick's own outcome/profit.

function computeMonthlyPerformanceV2(entries) {
  const rows = computeV2FrozenRows(entries);
  const byMonth = new Map();
  rows.forEach((r) => {
    const month = (r.eventDate || '').slice(0, 7) || 'Unknown';
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push({ profit: r.profit, won: r.won ? 1 : 0, stake: r.stake });
  });
  const months = Array.from(byMonth.keys()).sort();
  return months.map((month) => {
    const monthRows = byMonth.get(month);
    const n = monthRows.length;
    const netUnits = monthRows.reduce((s, r) => s + r.profit, 0);
    // ROI must be scaled by units actually risked, not bet count -- `n` stays
    // the row count (winRate denom, Bets column); `staked` and the roi
    // denominator use the summed stake.
    const totalStaked = monthRows.reduce((s, r) => s + r.stake, 0);
    return {
      month,
      n,
      winRate: n ? (monthRows.reduce((s, r) => s + r.won, 0) / n) * 100 : null,
      staked: totalStaked,
      netUnits,
      roi: totalStaked ? (netUnits / totalStaked) * 100 : null,
    };
  });
}

// Shared XAxis tick renderer: draws the band/bucket label plus its n= count,
// with a low-n asterisk + amber color when the chart's own data marks lowN.

const isDoubleChance = (method) => (method || '').includes(' or ');

// Human-readable prop label from side + method (round dropped per design).
// side: 'A' | 'B' | null (null = fight-level). Enumerated combinations:
//   fighter + single method   -> "{Fighter} wins by {method}"
//   fighter + double chance    -> "{Fighter} wins by {A} or {B}"
//     (special: KO/TKO or Submission -> "{Fighter} wins inside the distance")
//   fight-level + single       -> "Fight Goes to Decision" / "Fight Ends by KO/TKO" / "…by Submission"
//   fight-level + double chance -> "Fight Ends Inside Distance" / "Fight Ends by {A} or {B}"

function buildPropLabel({ side, method, fighterA, fighterB }) {
  const fighterName = side === 'A' ? fighterA : side === 'B' ? fighterB : '';
  if (fighterName) {
    if (method === 'KO/TKO or Submission') return `${fighterName} wins inside the distance`;
    return `${fighterName} wins by ${method}`;
  }
  if (method === 'Decision') return 'Fight Goes to Decision';
  if (method === 'KO/TKO') return 'Fight Ends by KO/TKO';
  if (method === 'Submission') return 'Fight Ends by Submission';
  if (method === 'KO/TKO or Submission') return 'Fight Ends Inside Distance';
  return `Fight Ends by ${method}`;
}

// Breakdown bucket for the Statistics by-type table. Covers every side×method
// combination cleanly, with no combination landing somewhere misleading:
//   fighter + single -> "Method of Victory"
//   fighter + double -> "Double Chance"
//   fight-level      -> "Fight Outcome"

function propTypeOf({ side, method }) {
  const fighterLevel = side === 'A' || side === 'B';
  if (fighterLevel) return isDoubleChance(method) ? 'Double Chance' : 'Method of Victory';
  return 'Fight Outcome';
}

// Mirrors isResolvedWinner's role for model stats: PENDING props are
// excluded from every prop statistic (count, win rate, staked, ROI), not
// just win rate/ROI's denominators. Unlike roiEntries (which reach the ROI
// array only by being graded), propPicks now routinely holds long-lived
// PENDING rows while they sit in the Upcoming tab, so "total" must be
// graded-only here rather than "everything in the array".

function computePropSummary(picks) {
  const graded = picks.filter((p) => p.result === 'WON' || p.result === 'LOST' || p.result === 'PUSH');
  const decisive = graded.filter((p) => p.result === 'WON' || p.result === 'LOST');
  const wins = decisive.filter((p) => p.result === 'WON').length;
  let staked = 0;
  let netUnits = 0;
  graded.forEach((p) => {
    const stake = Number(p.stake) || 1;
    if (p.result === 'PUSH') {
      staked += stake;
      return;
    }
    const dec = americanToDecimal(p.odds);
    if (!dec) return;
    staked += stake;
    netUnits += p.result === 'WON' ? stake * (dec - 1) : -stake;
  });
  return {
    total: graded.length,
    graded: graded.length,
    wins,
    winRate: decisive.length ? (wins / decisive.length) * 100 : 0,
    staked,
    netUnits,
    roi: staked > 0 ? (netUnits / staked) * 100 : 0,
  };
}

// Per-type breakdown for the Statistics prop section: count / win rate /
// staked / net units per prop type. PENDING props excluded entirely (same
// reasoning as computePropSummary above) -- count reflects graded picks only.

function computePropTypeBreakdown(picks) {
  const byType = new Map();
  const ensure = (type) => {
    if (!byType.has(type)) byType.set(type, { type, count: 0, decisive: 0, wins: 0, staked: 0, netUnits: 0 });
    return byType.get(type);
  };
  picks
    .filter((p) => p.result === 'WON' || p.result === 'LOST' || p.result === 'PUSH')
    .forEach((p) => {
      const b = ensure(p.propType || propTypeOf(p));
      b.count += 1;
      const stake = Number(p.stake) || 1;
      b.staked += stake;
      if (p.result === 'PUSH') return;
      b.decisive += 1;
      if (p.result === 'WON') {
        b.wins += 1;
        const dec = americanToDecimal(p.odds);
        if (dec) b.netUnits += stake * (dec - 1);
      } else {
        b.netUnits -= stake;
      }
    });
  return [...byType.values()]
    .map((b) => ({ ...b, winRate: b.decisive ? (b.wins / b.decisive) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

// A single prop-pick payout in units. Positive on a win, negative on a loss,
// 0 for push/pending. Same americanToDecimal math as computePropSummary.

function propPickProfit(pick) {
  if (pick.result !== 'WON' && pick.result !== 'LOST') return 0;
  const stake = Number(pick.stake) || 1;
  if (pick.result === 'LOST') return -stake;
  const dec = americanToDecimal(pick.odds);
  return dec ? stake * (dec - 1) : 0;
}

// ─── PARLAYS -- Alex's manual, multi-fight bet grading ────────────────────
// Derived, read-only grading: computeParlayResult never mutates parlayEntries
// or roiEntries. It reads roiEntries ONLY to resolve each leg's actual winner
// (the one-directional read the isolation design allows -- see the
// parlayData.js header comment) and returns a plain result object; nothing
// here writes back into roiEntries, and no model/Statistics function
// (computeV2Summary, computeV2FrozenRows, filterRoiEntriesForStats,
// computeROISummary) is ever called with parlay data.
//
// Mirrors props' "grading is a filtered view" design: a parlay's current
// grading state is recomputed fresh every time it's needed (the Parlays
// sub-tab, added in a later commit), the same way PROP_PICKS's "pending"
// list is just `picks.filter(p => p.result === 'PENDING')` rather than a
// migrated array -- no useEffect writes the derived result back onto
// parlayEntries. The parlay object's OWN `status`/`result` fields (set to
// 'PENDING'/null at build time in the Build Parlay modal) exist for the
// exported parlayData.js file -- what "Copy Updated parlayData.js" snapshots
// so a re-imported file still displays something sane without roiEntries to
// derive against between sessions. At runtime this function's return value
// is authoritative and the stored fields are never overwritten by it; a
// future commit could push a fresh status/result onto the entry right before
// export (mirroring how ROI/Upcoming entries get real fields written on
// grade), but that's an explicit, user-triggered write, never a render-time
// side effect.

function computeParlayResult(parlay, roiEntries) {
  const roiById = new Map(roiEntries.map((e) => [e.id, e]));
  const legResults = parlay.legs.map((leg) => {
    const roiEntry = roiById.get(leg.fightId);
    if (!roiEntry || !isResolvedWinner(roiEntry.actualWinner, roiEntry)) {
      return { fightId: leg.fightId, resolved: false, pushed: false, correct: null };
    }
    const pushed = isPushResult(roiEntry.actualWinner);
    const correct = pushed ? null : roiEntry.actualWinner === leg.pickedFighter;
    return { fightId: leg.fightId, resolved: true, pushed, correct };
  });

  const totalLegs = legResults.length;
  const resolvedLegs = legResults.filter((l) => l.resolved).length;
  if (resolvedLegs !== totalLegs) {
    return { status: 'PENDING', result: null, resolvedLegs, totalLegs, legResults };
  }

  if (legResults.some((l) => l.pushed)) {
    return { status: 'GRADED', result: 'NEEDS_REVIEW', resolvedLegs, totalLegs, legResults };
  }

  const allCorrect = legResults.every((l) => l.correct === true);
  return {
    status: 'GRADED',
    result: allCorrect ? 'WIN' : 'LOSS',
    resolvedLegs,
    totalLegs,
    legResults,
  };
}

// Parlay aggregate for the Parlays sub-tab. Mirrors computePropSummary's
// shape/rounding, but the population is GRADED (WIN/LOSS) parlays only --
// PENDING (via computeParlayResult) and NEEDS_REVIEW are both excluded from
// every stat here, same as PENDING props are excluded from computePropSummary.
// NEEDS_REVIEW must never fall into the LOSS bucket by omission -- the
// `!= 'WIN' && != 'LOSS'` skip below is what keeps it out.

function computeParlaySummary(parlayEntries, roiEntries) {
  let graded = 0;
  let wins = 0;
  let staked = 0;
  let netUnits = 0;
  parlayEntries.forEach((parlay) => {
    const derived = computeParlayResult(parlay, roiEntries);
    if (derived.result !== 'WIN' && derived.result !== 'LOSS') return;
    graded += 1;
    const stake = Number(parlay.unitsWagered) || 1;
    staked += stake;
    if (derived.result === 'WIN') {
      wins += 1;
      const dec = americanToDecimal(parlay.combinedOdds);
      if (dec) netUnits += stake * (dec - 1);
    } else {
      netUnits -= stake;
    }
  });
  return {
    graded,
    wins,
    winRate: graded ? (wins / graded) * 100 : 0,
    staked,
    netUnits,
    roi: staked > 0 ? (netUnits / staked) * 100 : 0,
  };
}

// Export-string builders -- one definition each, called from both
// UpcomingEventTab and ROITab so every sub-tab that displays a data type also
// has a "Copy Updated ...File.js" button, without duplicating the
// serialization logic in two places. Status/result on each parlay stays
// as-stored (not frozen at export time) -- re-derived live via
// computeParlayResult whenever the pasted-over file is reloaded, per the
// locked no-freeze decision.

function computeROISummary(entries, prospectNameSet) {
  const resolveProspect = (e) =>
    e.includesProspect != null
      ? e.includesProspect
      : e.fighterAIsProspect != null
      ? e.fighterAIsProspect
      : e.fighterBIsProspect != null
      ? e.fighterBIsProspect
      : prospectNameSet.has(e.fighterA) || prospectNameSet.has(e.fighterB);
  const graded = entries.filter((e) => isResolvedWinner(e.actualWinner, e));
  const gradedStats = graded.filter((e) => !resolveProspect(e) && e.confirmedByUser !== false);
  const decisive = gradedStats.filter(
    (e) => e.actualWinner === e.fighterA || e.actualWinner === e.fighterB
  );
  const correct = decisive.filter((e) => e.predictedWinner === e.actualWinner).length;
  const betEntries = gradedStats.filter((e) => Boolean(americanToDecimal(e.marketOdds)));
  const profit = betEntries.reduce((sum, e) => sum + (calcTrackedProfit(e) ?? 0), 0);
  // ROI must be scaled by units actually risked, not bet count -- those are
  // only the same number when every bet is flat 1u. unitsWagered defaults to
  // 1 for every entry that predates this field, so totalStaked === bets.length
  // for all historical data (identical ROI% to before this change).
  const totalStaked = betEntries.reduce(
    (sum, e) => sum + (e.unitsWagered != null ? e.unitsWagered : 1),
    0
  );
  return {
    total: entries.filter((e) => !resolveProspect(e) && e.confirmedByUser !== false).length,
    graded: gradedStats.length,
    correct,
    accuracy: decisive.length ? (correct / decisive.length) * 100 : 0,
    bets: betEntries.length,
    profit,
    roi: totalStaked > 0 ? (profit / totalStaked) * 100 : 0,
  };
}


export {
  isPushResult,
  isResolvedWinner,
  calcTrackedProfit,
  ROI_ANALYTICS_LOW_N,
  ROI_MARKET_BANDS,
  ROI_V2_PROB_BUCKETS,
  bandOf,
  computeRoiByMarketBand,
  roiV2GradedPopulation,
  computeModelVsMarketByBand,
  computeCalibrationReliability,
  filterRoiEntriesForStats,
  ROI_BET_TIERS,
  computeBetTierBreakdown,
  filterStakedGraded,
  computeCumulativePnl,
  computeMonthlyPerformance,
  computeV2FrozenRows,
  computeV2WindowComposition,
  computeV2Summary,
  computeRoiByMarketBandV2,
  computeCumulativePnlV2,
  computeMonthlyPerformanceV2,
  isDoubleChance,
  buildPropLabel,
  propTypeOf,
  computePropSummary,
  computePropTypeBreakdown,
  propPickProfit,
  computeParlayResult,
  computeParlaySummary,
  computeROISummary,
};
