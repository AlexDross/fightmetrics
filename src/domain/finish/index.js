// ─── DOMAIN / FINISH ──────────────────────────────────────────────────────
// Foundation Stage 3. Extracted VERBATIM from src/App.js.
//
// Every line below is byte-identical to its original. Exports are declared in a
// single block at the end so no moved line had to change.
//
// Original locations in App.js (pre-extraction line numbers):
//    5499-5515  computeFinishProbs
//    5516-5531  getProjectedFinishLabel

function computeFinishProbs(fA, fB) {
  const avgFinish    = ((fA.FINISH_RATE ?? 0) + (fB.FINISH_RATE ?? 0)) / 2;
  const avgKdRate    = ((fA.KD_PER_MIN ?? 0) + (fB.KD_PER_MIN ?? 0)) / 2;
  const avgKoWinPct  = ((fA.KO_WIN_PCT ?? 0) + (fB.KO_WIN_PCT ?? 0)) / 2;
  const avgSubWinPct = ((fA.SUB_WIN_PCT ?? 0) + (fB.SUB_WIN_PCT ?? 0)) / 2;
  const avgSubThreat = ((fA.SUB_THREAT_RATE ?? 0) + (fB.SUB_THREAT_RATE ?? 0)) / 2;
  const rawKO  = Math.min(avgKoWinPct * 0.55 + avgKdRate * 200 + avgFinish * 0.18, 60);
  const rawSub = Math.min(avgSubWinPct * 0.40 + avgSubThreat * 4 + avgFinish * 0.12, 60);
  const rawDec = Math.max(100 - rawKO - rawSub, 18);
  const total  = rawKO + rawSub + rawDec;
  return {
    ko:  Math.round((rawKO  / total) * 100),
    sub: Math.round((rawSub / total) * 100),
    dec: Math.round((rawDec / total) * 100),
  };
}


function getProjectedFinishLabel(probs) {
  const { ko, sub, dec } = probs;
  const max = Math.max(ko, sub, dec);
  const leaders = [];
  if (ko === max) leaders.push('KO/TKO');
  if (sub === max) leaders.push('SUB');
  if (dec === max) leaders.push('DEC');
  return leaders.join(' / ');
}

// ─── MATCHUP SIMULATOR ────────────────────────────────────────────────────────
// Display-only decode of v2's modern_form (App.js:369-388) into plain
// language -- last-8 W-L record plus the two penalty flags, sorted most
// recent first exactly as computeModernForm does. Does not compute or
// alter modern_form's actual score; reads the same FIGHT_HISTORY/
// DAYS_SINCE_LAST inputs purely to describe it.

export {
  computeFinishProbs,
  getProjectedFinishLabel,
};
