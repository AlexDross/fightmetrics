'use strict';
const fs   = require('fs');
const path = require('path');

// ── Exact formula from App.js computeFinishProbs ─────────────────────────────
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

// ── Load ES module as CommonJS via temp file ──────────────────────────────────
function loadESModuleAsCommonJS(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cjs = raw.replace(/^export\s+const\s+\w+\s*=/, 'module.exports =');
  const tempPath = filePath + '.__tmp__.js';
  fs.writeFileSync(tempPath, cjs);
  try {
    delete require.cache[require.resolve(tempPath)];
    return require(tempPath);
  } finally {
    fs.unlinkSync(tempPath);
  }
}

// ── Build fighter lookup ──────────────────────────────────────────────────────
const fightersDataPath = path.join(__dirname, '../src/fightersData.js');
const roiDataPath      = path.join(__dirname, '../src/roiData.js');

const rawFighters = loadESModuleAsCommonJS(fightersDataPath);
const fighterMap  = {};
rawFighters.forEach((d) => {
  const wi       = d.wi  ?? 0;
  const kow      = d.kow ?? 0;
  const sbw      = d.sbw ?? 0;
  const totalMin = (d.tr ?? 0) * 5;

  fighterMap[d.n] = {
    FINISH_RATE:     wi > 0       ? Math.round(((kow + sbw) / wi) * 100)          : 0,
    KO_WIN_PCT:      wi > 0       ? parseFloat(((kow / wi) * 100).toFixed(1))      : 0,
    SUB_WIN_PCT:     wi > 0       ? parseFloat(((sbw / wi) * 100).toFixed(1))      : 0,
    KD_PER_MIN:      totalMin > 0 ? parseFloat((kow / totalMin).toFixed(4))        : 0,
    SUB_THREAT_RATE: d.asa ?? 0,
  };
});

// ── Load and update all ROI entries ──────────────────────────────────────────
const roiRaw  = fs.readFileSync(roiDataPath, 'utf8');
const entries = loadESModuleAsCommonJS(roiDataPath);

let rerun    = 0;
let notFound = 0;
const notFoundList = [];

const updated = entries.map((entry) => {
  const fA = fighterMap[entry.fighterA];
  const fB = fighterMap[entry.fighterB];
  if (!fA || !fB) {
    const missing = [!fA && entry.fighterA, !fB && entry.fighterB].filter(Boolean);
    notFoundList.push(...missing);
    console.warn(`  SKIP (fighter not found): ${entry.fighterA} vs ${entry.fighterB}`);
    notFound++;
    return entry;
  }
  const probs = computeFinishProbs(fA, fB);
  rerun++;
  return {
    ...entry,
    projectedKO:     probs.ko,
    projectedSUB:    probs.sub,
    projectedDEC:    probs.dec,
    projectedFinish: getProjectedFinishLabel(probs),
  };
});

console.log(`\nRerun complete: ${rerun} recomputed, ${notFound} fighters not found`);
if (notFoundList.length > 0) {
  console.log('Fighters not found:', [...new Set(notFoundList)].join(', '));
}

const exportName = roiRaw.match(/export\s+const\s+(\w+)\s*=/)?.[1] ?? 'ROI_ENTRIES';
fs.writeFileSync(roiDataPath, `export const ${exportName} = ${JSON.stringify(updated, null, 2)};\n`);
console.log('roiData.js written successfully.');

console.log('\nSpot-check (3 entries from before 2026-05-23):');
updated
  .filter((e) => (e.eventDate ?? '') < '2026-05-23' && e.projectedFinish != null)
  .slice(0, 3)
  .forEach((e) => {
    console.log(`  ${e.fighterA} vs ${e.fighterB} [${e.eventDate}] → ${e.projectedFinish} (KO:${e.projectedKO}% SUB:${e.projectedSUB}% DEC:${e.projectedDEC}%)`);
  });
