// Backward-compatibility regression check for variable unit staking
// (unitsWagered on ROI entries, added to buildRoiEntry/calcTrackedProfit/
// computeROISummary/ROITab's effectiveProfit).
//
// Every entry saved before this field existed has no unitsWagered (Alex
// confirmed all prior entries were flat 1u), so OLD (hardcoded 1u) and NEW
// (unitsWagered-aware, defaulting to 1 when absent) logic must produce
// IDENTICAL profit/ROI for every existing entry. This script proves that
// across the full roiData.js ledger, not a sample.
//
// Run from repo root: node scripts/unit_sizing_regression_check.mjs
import { readFileSync } from 'node:fs';

const raw = readFileSync('src/roiData.js', 'utf-8');
const arr = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1);
const entries = JSON.parse(arr);
console.log('total entries:', entries.length);

// ── Reused pure helpers, unmodified by this task ──────────────────────────
const isPushResult = (value) => value === 'NC' || value === 'DRAW';
const isResolvedWinner = (value, entry) =>
  value === entry?.fighterA || value === entry?.fighterB || isPushResult(value);
const americanToDecimal = (str) => {
  const n = parseInt(str, 10);
  if (isNaN(n) || n === 0) return null;
  if (n > 0) return n / 100 + 1;
  return 100 / Math.abs(n) + 1;
};

// ── OLD calcTrackedProfit (pre-task, hardcoded 1u) ─────────────────────────
function calcTrackedProfitOLD(entry) {
  if (!entry || !entry.marketOdds || !isResolvedWinner(entry.actualWinner, entry)) return null;
  if (isPushResult(entry.actualWinner)) return 0;
  const dec = americanToDecimal(entry.marketOdds);
  if (!dec) return null;
  return entry.actualWinner === entry.trackedSide ? dec - 1 : -1;
}

// ── NEW calcTrackedProfit (unitsWagered-aware) ─────────────────────────────
function calcTrackedProfitNEW(entry) {
  if (!entry || !entry.marketOdds || !isResolvedWinner(entry.actualWinner, entry)) return null;
  if (isPushResult(entry.actualWinner)) return 0;
  const dec = americanToDecimal(entry.marketOdds);
  if (!dec) return null;
  const stake = entry.unitsWagered != null ? entry.unitsWagered : 1;
  return entry.actualWinner === entry.trackedSide ? stake * (dec - 1) : -stake;
}

// ── OLD computeROISummary (pre-task; stake denominator = bet count) ───────
function computeROISummaryOLD(entries, prospectNameSet) {
  const resolveProspect = (e) =>
    e.includesProspect != null ? e.includesProspect
    : e.fighterAIsProspect != null ? e.fighterAIsProspect
    : e.fighterBIsProspect != null ? e.fighterBIsProspect
    : prospectNameSet.has(e.fighterA) || prospectNameSet.has(e.fighterB);
  const graded = entries.filter((e) => isResolvedWinner(e.actualWinner, e));
  const gradedStats = graded.filter((e) => !resolveProspect(e) && e.confirmedByUser !== false);
  const decisive = gradedStats.filter((e) => e.actualWinner === e.fighterA || e.actualWinner === e.fighterB);
  const correct = decisive.filter((e) => e.predictedWinner === e.actualWinner).length;
  const betEntries = gradedStats.filter((e) => Boolean(americanToDecimal(e.marketOdds)));
  const profit = betEntries.reduce((sum, e) => sum + (calcTrackedProfitOLD(e) ?? 0), 0);
  const stake = betEntries.length;
  return {
    total: entries.filter((e) => !resolveProspect(e) && e.confirmedByUser !== false).length,
    graded: gradedStats.length, correct,
    accuracy: decisive.length ? (correct / decisive.length) * 100 : 0,
    bets: stake, profit, roi: stake > 0 ? (profit / stake) * 100 : 0,
  };
}

// ── NEW computeROISummary (stake denominator = total units risked) ────────
function computeROISummaryNEW(entries, prospectNameSet) {
  const resolveProspect = (e) =>
    e.includesProspect != null ? e.includesProspect
    : e.fighterAIsProspect != null ? e.fighterAIsProspect
    : e.fighterBIsProspect != null ? e.fighterBIsProspect
    : prospectNameSet.has(e.fighterA) || prospectNameSet.has(e.fighterB);
  const graded = entries.filter((e) => isResolvedWinner(e.actualWinner, e));
  const gradedStats = graded.filter((e) => !resolveProspect(e) && e.confirmedByUser !== false);
  const decisive = gradedStats.filter((e) => e.actualWinner === e.fighterA || e.actualWinner === e.fighterB);
  const correct = decisive.filter((e) => e.predictedWinner === e.actualWinner).length;
  const betEntries = gradedStats.filter((e) => Boolean(americanToDecimal(e.marketOdds)));
  const profit = betEntries.reduce((sum, e) => sum + (calcTrackedProfitNEW(e) ?? 0), 0);
  const totalStaked = betEntries.reduce((sum, e) => sum + (e.unitsWagered != null ? e.unitsWagered : 1), 0);
  return {
    total: entries.filter((e) => !resolveProspect(e) && e.confirmedByUser !== false).length,
    graded: gradedStats.length, correct,
    accuracy: decisive.length ? (correct / decisive.length) * 100 : 0,
    bets: betEntries.length, profit, roi: totalStaked > 0 ? (profit / totalStaked) * 100 : 0,
  };
}

// ── 1. Per-entry regression check across ALL entries ────────────────────────
let mismatches = 0;
entries.forEach((e, i) => {
  const oldP = calcTrackedProfitOLD(e);
  const newP = calcTrackedProfitNEW(e);
  const same = (oldP === null && newP === null) || Math.abs((oldP ?? 0) - (newP ?? 0)) < 1e-12;
  if (!same) {
    mismatches++;
    console.log(`MISMATCH at index ${i} (id=${e.id}): old=${oldP} new=${newP} unitsWagered=${e.unitsWagered}`);
  }
});
console.log(`\nPer-entry check: ${entries.length} entries, ${mismatches} mismatches`);

// ── 2. Aggregate computeROISummary regression check (no prospect exclusion set) ──
const oldSummary = computeROISummaryOLD(entries, new Set());
const newSummary = computeROISummaryNEW(entries, new Set());
console.log('\nOLD computeROISummary:', oldSummary);
console.log('NEW computeROISummary:', newSummary);
const summaryFieldsMatch = ['total', 'graded', 'correct', 'accuracy', 'bets', 'profit', 'roi'].every(
  (k) => Math.abs(oldSummary[k] - newSummary[k]) < 1e-9
);
console.log('\nAggregate summary IDENTICAL:', summaryFieldsMatch);

// ── 3. Confirm zero entries currently carry unitsWagered (sanity on the premise) ──
const withUnits = entries.filter((e) => e.unitsWagered != null);
console.log('\nEntries currently carrying unitsWagered field:', withUnits.length, '(expected: 0)');

if (mismatches > 0 || !summaryFieldsMatch) {
  console.error('\nREGRESSION DETECTED. Do not merge.');
  process.exit(1);
}
console.log('\nAll checks passed.');
