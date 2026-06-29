'use strict';
const fs   = require('fs');
const path = require('path');

// ── Exact formula from App.js computeFinishProbs ─────────────────────────────
// Inputs match the derived fields in the FIGHTERS array:
//   FINISH_RATE, KO_WIN_PCT, KD_PER_MIN, SUB_WIN_PCT, SUB_THREAT_RATE
function computeFinishProbs(fA, fB) {
  const avgFinish    = ((fA.FINISH_RATE    ?? 0) + (fB.FINISH_RATE    ?? 0)) / 2;
  const avgKdRate    = ((fA.KD_PER_MIN     ?? 0) + (fB.KD_PER_MIN     ?? 0)) / 2;
  const avgKoWinPct  = ((fA.KO_WIN_PCT     ?? 0) + (fB.KO_WIN_PCT     ?? 0)) / 2;
  const avgSubWinPct = ((fA.SUB_WIN_PCT    ?? 0) + (fB.SUB_WIN_PCT    ?? 0)) / 2;
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
  if (ko  === max) leaders.push('KO/TKO');
  if (sub === max) leaders.push('SUB');
  if (dec === max) leaders.push('DEC');
  return leaders.join(' / ');
}

// ── Load fightersData.js (ES module export → CommonJS temp file) ──────────────
const fightersDataPath = path.join(__dirname, '../src/fightersData.js');
const roiDataPath      = path.join(__dirname, '../src/roiData.js');

function loadESModuleAsCommonJS(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Replace first `export const <name> =` with `module.exports =`
  const cjs = raw.replace(/^export\s+const\s+\w+\s*=/, 'module.exports =');
  const tempPath = filePath + '.__tmp__.js';
  fs.writeFileSync(tempPath, cjs);
  try {
    // Clear require cache in case we call this twice
    delete require.cache[require.resolve(tempPath)];
    const result = require(tempPath);
    return result;
  } finally {
    fs.unlinkSync(tempPath);
  }
}

// ── Build fighter lookup: name → computed stats ───────────────────────────────
const rawFighters = loadESModuleAsCommonJS(fightersDataPath);

// fightersData.js exports _D2 array. Each entry uses compact field names.
// Map to the derived fields that computeFinishProbs expects (same logic as App.js).
const fighterMap = {};
rawFighters.forEach((d) => {
  const wi  = d.wi  ?? 0;
  const kow = d.kow ?? 0;
  const sbw = d.sbw ?? 0;
  const tr  = d.tr  ?? 0;
  const totalMin = tr * 5;

  const FINISH_RATE    = wi > 0 ? Math.round(((kow + sbw) / wi) * 100) : 0;
  const KO_WIN_PCT     = wi > 0 ? parseFloat(((kow / wi) * 100).toFixed(1)) : 0;
  const SUB_WIN_PCT    = wi > 0 ? parseFloat(((sbw / wi) * 100).toFixed(1)) : 0;
  const KD_PER_MIN     = totalMin > 0 ? parseFloat((kow / totalMin).toFixed(4)) : 0;
  const SUB_THREAT_RATE = d.asa ?? 0;

  fighterMap[d.n] = { FINISH_RATE, KO_WIN_PCT, SUB_WIN_PCT, KD_PER_MIN, SUB_THREAT_RATE };
});

// ── Load roiData.js ───────────────────────────────────────────────────────────
const roiRaw  = fs.readFileSync(roiDataPath, 'utf8');
const entries = loadESModuleAsCommonJS(roiDataPath);

let migrated = 0;
let skipped  = 0;
let notFound = 0;
const notFoundList = [];

const updated = entries.map((entry) => {
  if (entry.projectedFinish !== undefined) {
    skipped++;
    return entry;
  }
  const fA = fighterMap[entry.fighterA];
  const fB = fighterMap[entry.fighterB];
  if (!fA || !fB) {
    const missing = [!fA && entry.fighterA, !fB && entry.fighterB].filter(Boolean);
    notFoundList.push(...missing);
    console.warn(`  SKIP (fighter not found): ${entry.fighterA} vs ${entry.fighterB}`);
    notFound++;
    return {
      ...entry,
      projectedKO:     null,
      projectedSUB:    null,
      projectedDEC:    null,
      projectedFinish: null,
      actualFinish:    entry.actualFinish ?? '',
    };
  }
  const probs = computeFinishProbs(fA, fB);
  migrated++;
  return {
    ...entry,
    projectedKO:     probs.ko,
    projectedSUB:    probs.sub,
    projectedDEC:    probs.dec,
    projectedFinish: getProjectedFinishLabel(probs),
    actualFinish:    entry.actualFinish ?? '',
  };
});

console.log(`\nMigration complete: ${migrated} updated, ${skipped} already had fields, ${notFound} fighters not found`);
if (notFoundList.length > 0) {
  console.log('Fighters not found:', [...new Set(notFoundList)].join(', '));
}

// ── Write back preserving export name ────────────────────────────────────────
const exportName = roiRaw.match(/export\s+const\s+(\w+)\s*=/)?.[1] ?? 'ROI_ENTRIES';
const output = `export const ${exportName} = ${JSON.stringify(updated, null, 2)};\n`;
fs.writeFileSync(roiDataPath, output);
console.log('roiData.js written successfully.');

// ── Spot-check 3 entries ──────────────────────────────────────────────────────
console.log('\nSpot-check (first 3 migrated entries):');
updated
  .filter((e) => e.projectedFinish !== null && e.projectedFinish !== undefined)
  .slice(0, 3)
  .forEach((e) => {
    console.log(`  ${e.fighterA} vs ${e.fighterB} → ${e.projectedFinish} (KO:${e.projectedKO}% SUB:${e.projectedSUB}% DEC:${e.projectedDEC}%)`);
  });
