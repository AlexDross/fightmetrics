/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// FOUNDATION STAGE 0 -- GOLDEN CAPTURE HARNESS                       DEV ONLY
// ---------------------------------------------------------------------------
// Removed together with the App.js dev bridge in Stage 4.
//
// Does NOTHING on import except attach window.__fmGoldens. All capture is
// explicitly invoked from the console:
//
//   await window.__fmGoldens.verifyDeterminism()  // empirically find drift
//   window.__fmGoldens.capture()                  // build the fixture object
//   window.__fmGoldens.download()                 // write fixtures to disk
//
// DESIGN NOTE (FOUNDATION_PLAN risk-register items 1 and 2):
// Fighter inputs are date-derived. DAYS_SINCE_LAST is computed at module scope
// from Date.now() (App.js:822). Every downstream replay must therefore feed the
// FROZEN fixture objects emitted here, never a live FIGHTERS array. These
// fixtures are append-only and must never be regenerated to "fix" a failing
// test -- doing so silently rebaselines the entire safety net.
// ---------------------------------------------------------------------------

const SCHEMA_VERSION = 1;

// Fields on a FIGHTER object known to derive from Date.now(). Recorded
// separately from the stable-field hash. Verified empirically by
// verifyDeterminism() rather than trusted from code reading.
const DATE_DERIVED_FIELDS = ['DAYS_SINCE_LAST', 'LAYOFF_PENALTY'];

// buildRoiEntry fields that cannot be deterministic (Date.now / Math.random).
const VOLATILE_ENTRY_PATHS = [
  'id',
  'createdAt',
  '_provenance.predictionTimestamp',
  '_provenance.captureMode',
];

const VOLATILE = '<VOLATILE>';

// --- deterministic serialisation -------------------------------------------
// Sorted keys so hashes are insensitive to property insertion order, which is
// not a contract. Numbers are emitted at full precision.
function stableStringify(value) {
  if (value === undefined) return '@undefined';
  if (value === null) return 'null';
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '@NaN';
    if (value === Infinity) return '@Inf';
    if (value === -Infinity) return '@-Inf';
    if (Object.is(value, -0)) return '@-0';
    return String(value);
  }
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

// FNV-1a 32-bit, hex. Stable across engines, no crypto dependency.
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// --- lossless JSON encoding of special numeric values ----------------------
// EMPIRICAL FINDING (Stage 0): computeMatchupEdges emits NEGATIVE ZERO in
// output.v2Contributions.{wins,losses,ko_wins,sub_wins,title_bouts} -- the five
// RED features whose v2 coefficients were zeroed. `0 * negative === -0`.
// JSON.stringify(-0) yields "0", and Object.is(-0, 0) is false, so a fixture
// written naively would fail exact-equality replay on ~115 values per capture
// for no real reason. Encode specials as tagged strings so the fixture round-
// trips losslessly; Stage 4 decodes before comparing.
const SPECIALS = { '@-0': -0, '@NaN': NaN, '@Inf': Infinity, '@-Inf': -Infinity, '@undefined': undefined };

function encodeSpecials(v) {
  if (v === undefined) return '@undefined';
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return '@NaN';
    if (v === Infinity) return '@Inf';
    if (v === -Infinity) return '@-Inf';
    if (Object.is(v, -0)) return '@-0';
    return v;
  }
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(encodeSpecials);
  const o = {};
  for (const k of Object.keys(v)) o[k] = encodeSpecials(v[k]);
  return o;
}

function decodeSpecials(v) {
  if (typeof v === 'string' && v in SPECIALS) return SPECIALS[v];
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(decodeSpecials);
  const o = {};
  for (const k of Object.keys(v)) o[k] = decodeSpecials(v[k]);
  return o;
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, path, val) {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((o, k) => (o == null ? undefined : o[k]), obj);
  if (target && typeof target === 'object') target[last] = val;
}

// --- deep diff, exact numeric equality --------------------------------------
function deepDiff(a, b, path = '', out = []) {
  if (Object.is(a, b)) return out;
  const ta = a === null ? 'null' : typeof a;
  const tb = b === null ? 'null' : typeof b;
  if (ta !== tb) { out.push({ path, a, b, reason: 'type' }); return out; }
  if (ta !== 'object') { out.push({ path, a, b, reason: 'value' }); return out; }
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) deepDiff(a?.[k], b?.[k], path ? path + '.' + k : k, out);
  return out;
}

// --- roster manifest (FOUNDATION_PLAN correction 4) -------------------------
// Verifies the FULL roster retained ordering and identity behaviour. The
// matchup fixtures alone cannot do this -- they cover only ~30 fighters.
function buildRosterManifest(FIGHTERS, captureMs) {
  const identityKeys = FIGHTERS.map((f) => f.FIGHTER);

  // Duplicate-name resolution order. Object.fromEntries(...map) keeps the LAST
  // occurrence (App.js:9329). Recording every index makes a reorder detectable.
  const byName = new Map();
  identityKeys.forEach((name, i) => {
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(i);
  });
  const duplicateNames = {};
  for (const [name, idxs] of byName) {
    if (idxs.length > 1) {
      duplicateNames[name] = { indices: idxs, resolvesToIndex: idxs[idxs.length - 1] };
    }
  }

  // Per-fighter hash over stable fields only. FIGHT_HISTORY is summarised
  // rather than hashed in full, to keep the manifest small.
  const stableHashes = FIGHTERS.map((f) => {
    const stable = {};
    for (const k of Object.keys(f).sort()) {
      if (DATE_DERIVED_FIELDS.includes(k)) continue;
      if (k === 'FIGHT_HISTORY') {
        const fh = f.FIGHT_HISTORY || [];
        stable.FIGHT_HISTORY_SUMMARY = {
          length: fh.length,
          first: fh[0] ?? null,
          last: fh[fh.length - 1] ?? null,
        };
        continue;
      }
      stable[k] = f[k];
    }
    return hash(stableStringify(stable));
  });

  // FULL fight-history hash, per fighter. `stableHashes` above summarises
  // FIGHT_HISTORY as {length, first, last}, which cannot detect a change to a
  // middle bout. This hashes the entire history value while still not storing
  // it, so a middle-record edit changes the hash.
  //
  // ADDITIVE ONLY. `stableHashes` keeps its v1 semantics so the approved
  // Stage 0 reference (captured before this field existed) stays directly
  // comparable to later candidates. verifyFixtures reports this field as
  // "reference-absent" rather than failing. See also hashFightHistory.cjs,
  // which derives the same guarantee straight from src/fightHistory.js and is
  // therefore independent of any capture generation.
  const historyHashes = FIGHTERS.map((f) => hash(stableStringify(f.FIGHT_HISTORY || [])));

  const dateDerived = FIGHTERS.map((f) => {
    const o = {};
    for (const k of DATE_DERIVED_FIELDS) o[k] = f[k];
    return o;
  });

  return {
    manifestHashVersion: 2,
    length: FIGHTERS.length,
    historyHashes,
    rosterHistoryHash: hash(stableStringify(historyHashes)),
    captureMs,
    captureIso: new Date(captureMs).toISOString(),
    identityKeys,
    duplicateNames,
    duplicateNameCount: Object.keys(duplicateNames).length,
    stableHashes,
    rosterStableHash: hash(stableStringify(stableHashes)),
    dateDerivedFields: DATE_DERIVED_FIELDS,
    dateDerived,
  };
}

// --- deterministic golden fighter selection ---------------------------------
// Selected by RULE, not hardcoded names, so selection is reproducible and
// self-documenting. Records why each fighter was chosen.
function selectGoldenFighters(FIGHTERS) {
  const byName = [...FIGHTERS].sort((a, b) =>
    a.FIGHTER < b.FIGHTER ? -1 : a.FIGHTER > b.FIGHTER ? 1 : 0);
  const picked = new Map();
  const add = (f, reason) => {
    if (!f) return;
    if (picked.has(f.FIGHTER)) picked.get(f.FIGHTER).reasons.push(reason);
    else picked.set(f.FIGHTER, { fighter: f, reasons: [reason] });
  };
  const take = (pred, n, reason) =>
    byName.filter(pred).slice(0, n).forEach((f) => add(f, reason));

  take((f) => (f.TOTAL_MIN ?? 0) > 0 && (f.TOTAL_MIN ?? 0) < 75, 6, 'low_sample_lt75min');
  take((f) => (f.UFC_FIGHT_COUNT ?? 0) === 0, 4, 'seed_elo_zero_ufc_fights');
  take((f) => f.IS_PROSPECT === true, 3, 'prospect'); // roster currently holds 1
  take((f) => f.DIV_RANK != null && (f.TOTAL_MIN ?? 0) > 200, 8, 'ranked_deep_sample');
  take((f) => f.P4P_RANK != null, 6, 'p4p_ranked');
  take((f) => (f.DAYS_SINCE_LAST ?? 0) > 700, 4, 'long_layoff_gt700d');

  // Deepest-sample fighters (highest career minutes) -- the opposite extreme
  // from the low-sample blend path.
  [...FIGHTERS].sort((a, b) => (b.TOTAL_MIN ?? 0) - (a.TOTAL_MIN ?? 0))
    .slice(0, 4).forEach((f) => add(f, 'deepest_sample'));

  // One representative per weight class, so cross-division pairing has real
  // coverage rather than whatever the other buckets happened to include.
  const seenWc = new Set();
  for (const f of byName) {
    if (!f.WEIGHT_CLASS || seenWc.has(f.WEIGHT_CLASS)) continue;
    if ((f.TOTAL_MIN ?? 0) < 100) continue;
    seenWc.add(f.WEIGHT_CLASS);
    add(f, 'division_representative_' + f.WEIGHT_CLASS.replace(/\s+/g, ''));
  }

  // Ambiguous / duplicate names. EMPIRICAL FINDING (Stage 0 capture): the live
  // FIGHTERS array currently contains ZERO duplicate FIGHTER keys across 2,273
  // entries, so this rule is a no-op today. The "17 ambiguous name cases" in
  // the project notes are a fightersData.js <-> fighters.json (Python roster)
  // reconciliation issue, NOT an in-app collision. The rule is retained so a
  // future regression that introduces a collision is caught by selection.
  const counts = {};
  FIGHTERS.forEach((f) => { counts[f.FIGHTER] = (counts[f.FIGHTER] || 0) + 1; });
  byName.filter((f) => counts[f.FIGHTER] > 1).slice(0, 4).forEach((f) => add(f, 'duplicate_name'));

  return [...picked.values()];
}

// Build pairs covering same-division, cross-division and rematch cases.
function buildGoldenPairs(selected, FIGHTERS) {
  const fs = selected.map((s) => s.fighter);
  const pairs = [];
  const seen = new Set();
  const push = (a, b, reason) => {
    if (!a || !b || a.FIGHTER === b.FIGHTER) return;
    const key = a.FIGHTER + '|||' + b.FIGHTER;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ a: a.FIGHTER, b: b.FIGHTER, reason });
  };

  const MAX_PAIRS = 36; // -> >=72 model goldens (both slot orders)

  // Strides 1, 2 and 3 over the deterministically ordered selection. Gives wide
  // coverage without the O(n^2) blowup of all-pairs.
  for (const stride of [1, 2, 3]) {
    for (let i = 0; i + stride < fs.length && pairs.length < MAX_PAIRS; i++) {
      const a = fs[i], b = fs[i + stride];
      push(a, b, a.WEIGHT_CLASS === b.WEIGHT_CLASS ? 'same_division' : 'cross_division');
    }
  }
  // Guarantee explicit cross-division coverage even if the strides missed it.
  for (let i = 0; i < fs.length && pairs.length < MAX_PAIRS; i++) {
    const a = fs[i];
    const b = fs.find((x) => x.WEIGHT_CLASS && a.WEIGHT_CLASS && x.WEIGHT_CLASS !== a.WEIGHT_CLASS);
    push(a, b, 'cross_division_explicit');
  }
  // A real rematch from fight history, if one exists in the roster.
  let done = false;
  for (const a of fs) {
    if (done) break;
    const opps = {};
    (a.FIGHT_HISTORY || []).forEach((h) => { opps[h.op] = (opps[h.op] || 0) + 1; });
    for (const [op, n] of Object.entries(opps)) {
      if (n > 1) {
        const b = FIGHTERS.find((f) => f.FIGHTER === op);
        if (b) { push(a, b, 'historical_rematch'); done = true; break; }
      }
    }
  }
  return pairs;
}

// --- capture ----------------------------------------------------------------
function capture() {
  const I = window.__FM_GOLDEN_INTERNALS__;
  if (!I) throw new Error('__FM_GOLDEN_INTERNALS__ missing -- dev bridge not loaded');

  const captureMs = Date.now();
  const { FIGHTERS, ROI_ENTRIES, computeMatchupEdges, buildRoiEntry } = I;

  // last-wins, mirrors App.js:9329
  const fighterByName = new Map();
  FIGHTERS.forEach((f) => fighterByName.set(f.FIGHTER, f));

  const selected = selectGoldenFighters(FIGHTERS);
  const pairs = buildGoldenPairs(selected, FIGHTERS);

  // Frozen fighter fixtures -- full objects, exactly as the model consumes them.
  const fighterFixtures = {};
  selected.forEach((s) => { fighterFixtures[s.fighter.FIGHTER] = s.fighter; });
  pairs.forEach((p) => {
    [p.a, p.b].forEach((n) => {
      if (!fighterFixtures[n] && fighterByName.has(n)) fighterFixtures[n] = fighterByName.get(n);
    });
  });

  // Model goldens -- BOTH slot orders for every pair.
  const modelGoldens = [];
  for (const p of pairs) {
    const fA = fighterByName.get(p.a);
    const fB = fighterByName.get(p.b);
    if (!fA || !fB) continue;
    for (const [x, y, order] of [[fA, fB, 'AB'], [fB, fA, 'BA']]) {
      try {
        modelGoldens.push({
          pair: p.a + ' vs ' + p.b, order, reason: p.reason,
          slotA: x.FIGHTER, slotB: y.FIGHTER,
          output: computeMatchupEdges(x, y),
        });
      } catch (e) {
        modelGoldens.push({ pair: p.a + ' vs ' + p.b, order, error: String(e) });
      }
    }
  }

  // Symmetry characterisation (FOUNDATION_PLAN correction 5).
  // App.js:4377 already asserts |v2.pA + v2flip.pA - 1| < 0.001 in source, so
  // v2 symmetry is TOLERANCE-bounded by design. v1 is orientation-symmetric by
  // construction (App.js:4322). Measure both; assume neither.
  const symmetry = [];
  for (const p of pairs) {
    const fA = fighterByName.get(p.a);
    const fB = fighterByName.get(p.b);
    if (!fA || !fB) continue;
    try {
      const ab = computeMatchupEdges(fA, fB);
      const ba = computeMatchupEdges(fB, fA);
      symmetry.push({
        pair: p.a + ' vs ' + p.b,
        // Two DISTINCT properties, empirically shown to differ:
        //   (1) flip-sum  : AB.pA + BA.pA === 1
        //   (2) cross-slot: AB.pA === BA.pB
        // (2) also requires pA + pB === 1 exactly WITHIN a single call, which
        // is a separate float property. Stage 4 must assert them separately.
        v1: {
          exact_flipSum_eq_1: Object.is(ab.pA + ba.pA, 1),
          exact_crossSlot_ABpA_eq_BApB: Object.is(ab.pA, ba.pB),
          exact_withinCall_AB_pA_plus_pB_eq_1: Object.is(ab.pA + ab.pB, 1),
          delta_sum: ab.pA + ba.pA - 1,
          abs_delta_sum: Math.abs(ab.pA + ba.pA - 1),
          abs_delta_crossSlot: Math.abs(ab.pA - ba.pB),
        },
        v2: {
          exact_flipSum_eq_1: Object.is(ab.v2pA + ba.v2pA, 1),
          exact_crossSlot_ABpA_eq_BApB: Object.is(ab.v2pA, ba.v2pB),
          exact_withinCall_AB_pA_plus_pB_eq_1: Object.is(ab.v2pA + ab.v2pB, 1),
          delta_sum: ab.v2pA + ba.v2pA - 1,
          abs_delta_sum: Math.abs(ab.v2pA + ba.v2pA - 1),
          abs_delta_crossSlot: Math.abs(ab.v2pA - ba.v2pB),
        },
      });
    } catch (e) { symmetry.push({ pair: p.a + ' vs ' + p.b, error: String(e) }); }
  }

  // buildRoiEntry goldens, canonicalised.
  const entryGoldens = [];
  for (const p of pairs.slice(0, 16)) {
    const fA = fighterByName.get(p.a);
    const fB = fighterByName.get(p.b);
    if (!fA || !fB) continue;
    for (const toggle of ['v1', 'v2']) {
      try {
        const raw = buildRoiEntry({
          fA, fB, oddsA: '-150', oddsB: '+130',
          eventName: 'GOLDEN FIXTURE EVENT', eventDate: '2026-08-01',
          modelToggle: toggle, unitsWagered: 1,
        });
        const observedVolatile = {};
        VOLATILE_ENTRY_PATHS.forEach((path) => { observedVolatile[path] = getPath(raw, path); });
        // encodeSpecials, not JSON round-trip: the latter silently loses -0.
        const canonical = encodeSpecials(raw);
        VOLATILE_ENTRY_PATHS.forEach((path) => setPath(canonical, path, VOLATILE));
        entryGoldens.push({
          pair: p.a + ' vs ' + p.b, modelToggle: toggle, canonical, observedVolatile,
        });
      } catch (e) {
        entryGoldens.push({ pair: p.a + ' vs ' + p.b, modelToggle: toggle, error: String(e) });
      }
    }
  }

  // Statistics goldens.
  // NOTE: entries are passed directly rather than through the app's
  // filterRoiEntriesForStats, which is not exposed by the Stage 0 bridge.
  // These are regression fixtures, not UI-fidelity fixtures. Stage 4 covers
  // filterRoiEntriesForStats once it is extracted.
  const prospectNameSet = new Set(FIGHTERS.filter((f) => f.IS_PROSPECT).map((f) => f.FIGHTER));
  const since = '2026-05-23';
  const sinceEntries = ROI_ENTRIES.filter((e) => (e.eventDate || '') >= since);
  const run = (label, fn) => {
    try { return { label, ok: true, value: fn() }; }
    catch (e) { return { label, ok: false, error: String(e) }; }
  };

  const statistics = {};
  for (const [setLabel, entries] of [['all', ROI_ENTRIES], ['since_' + since, sinceEntries]]) {
    statistics[setLabel] = {
      entryCount: entries.length,
      results: [
        run('computeROISummary', () => I.computeROISummary(entries, prospectNameSet)),
        run('computeROISummary_emptyProspectSet', () => I.computeROISummary(entries, new Set())),
        run('computeV2Summary', () => I.computeV2Summary(entries)),
        run('computeCalibrationReliability_v1', () => I.computeCalibrationReliability(entries, 'v1')),
        run('computeCalibrationReliability_v2', () => I.computeCalibrationReliability(entries, 'v2')),
        run('computeRoiByMarketBand', () => I.computeRoiByMarketBand(entries)),
        run('computeBetTierBreakdown', () => I.computeBetTierBreakdown(entries)),
        run('computeCumulativePnl', () => I.computeCumulativePnl(entries)),
        run('computeMonthlyPerformance', () => I.computeMonthlyPerformance(entries)),
      ],
    };
  }

  // Current-behaviour characterisation (FOUNDATION_PLAN correction 8).
  // LABEL: CURRENT BEHAVIOUR, NOT A DESIRED INVARIANT.
  // App.js:9418-9420 keys Upcoming dedup on the unordered fighter pair with NO
  // event component, so a rematch at a different event collides. Contrast
  // App.js:1060, where the backtest dedup DOES include fight.ev.
  const dedupKey = (a, b) => [a, b].sort().join('|');
  const rematchCharacterisation = {
    label: 'CURRENT_BEHAVIOUR_CHARACTERISATION',
    isDesiredInvariant: false,
    note: 'Upcoming dedup ignores event, so a rematch at a different event is treated as a duplicate. Event-aware identity belongs to the Stage 6 schema and Stage 11 migration. Do NOT change during the refactor.',
    sourceRef: 'App.js:9418-9420',
    contrastRef: 'App.js:1060 (backtest dedup includes fight.ev)',
    keyFormula: '[fighterA, fighterB].sort().join("|")',
    keyExample: dedupKey('Fighter A', 'Fighter B'),
    orderInsensitive: dedupKey('Fighter A', 'Fighter B') === dedupKey('Fighter B', 'Fighter A'),
    eventInsensitive: true,
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    captureMs,
    captureIso: new Date(captureMs).toISOString(),
    captureBase: 'foundation/stage-0 (origin/main fa3e54e + rebased ROI event-summary 9dd3a60)',
    volatileEntryPaths: VOLATILE_ENTRY_PATHS,
    dateDerivedFields: DATE_DERIVED_FIELDS,
    selection: selected.map((s) => ({ fighter: s.fighter.FIGHTER, reasons: s.reasons })),
    pairs,
    roster: buildRosterManifest(FIGHTERS, captureMs),
    fighterFixtures,
    modelGoldens,
    symmetry,
    entryGoldens,
    statistics,
    rematchCharacterisation,
  };
}

// --- empirical determinism check --------------------------------------------
// Captures twice with a delay and reports which paths ACTUALLY drifted, rather
// than trusting DATE_DERIVED_FIELDS from code reading.
async function verifyDeterminism(delayMs = 3000) {
  const a = capture();
  await new Promise((r) => setTimeout(r, delayMs));
  const b = capture();

  const strip = (o) => {
    const c = JSON.parse(JSON.stringify(o));
    delete c.captureMs; delete c.captureIso;
    delete c.roster.captureMs; delete c.roster.captureIso;
    (c.entryGoldens || []).forEach((e) => { delete e.observedVolatile; });
    return c;
  };

  const diffs = deepDiff(strip(a), strip(b));
  const byLeaf = {};
  diffs.forEach((d) => {
    const leaf = d.path.split('.').pop();
    byLeaf[leaf] = (byLeaf[leaf] || 0) + 1;
  });

  const result = {
    delayMs,
    totalDiffs: diffs.length,
    deterministic: diffs.length === 0,
    driftedLeafFields: byLeaf,
    sample: diffs.slice(0, 20),
    declaredDateDerived: DATE_DERIVED_FIELDS,
  };
  console.log('[goldens] determinism:', result);
  return result;
}

// --- output -----------------------------------------------------------------
function saveFile(name, obj) {
  // encodeSpecials FIRST -- raw JSON.stringify loses -0 (see encodeSpecials).
  const blob = new Blob([JSON.stringify(encodeSpecials(obj), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function download() {
  const g = capture();
  const head = { schemaVersion: g.schemaVersion, captureMs: g.captureMs, captureIso: g.captureIso, captureBase: g.captureBase };
  saveFile('roster.manifest.json', { ...head, ...g.roster });
  saveFile('fighters.golden.json', { ...head, selection: g.selection, pairs: g.pairs, fighterFixtures: g.fighterFixtures });
  saveFile('model.golden.json', { ...head, modelGoldens: g.modelGoldens, symmetry: g.symmetry });
  saveFile('entries.golden.json', { ...head, volatileEntryPaths: g.volatileEntryPaths, entryGoldens: g.entryGoldens });
  saveFile('statistics.golden.json', { ...head, statistics: g.statistics });
  saveFile('characterisation.json', { ...head, rematch: g.rematchCharacterisation });
  console.log('[goldens] 6 fixture files written to your downloads folder');
  return g;
}

// Fire-and-forget POST of every fixture to the local receiver
// (src/__dev__/fixtureReceiver.cjs). Returns immediately; watch the receiver's
// stdout for progress. Avoids holding large capture objects across separate
// devtools evaluations, which thrashes the renderer.
// EMPIRICAL FINDING (Stage 0): computeMatchupEdges contains a per-call
// console.log (App.js:4357) and console.assert (App.js:4377). A capture makes
// ~180 model calls. With devtools/CDP attached every console record is
// serialised over the protocol, which wedges the renderer for minutes. Silence
// console for the duration of the capture only. This is harness-local; it does
// not modify App.js or any model behaviour. Both lines are deleted in Stage 3.
function withSilencedConsole(fn) {
  const saved = { log: console.log, assert: console.assert, warn: console.warn };
  console.log = () => {};
  console.assert = () => {};
  console.warn = () => {};
  try { return fn(); } finally { Object.assign(console, saved); }
}

function postAll(base = 'http://localhost:4599') {
  const status = { started: new Date().toISOString(), written: [], errors: [], finished: false };
  window.__fmPostStatus = status;
  (async () => {
    try {
      const g = withSilencedConsole(() => capture());
      const head = {
        schemaVersion: g.schemaVersion, captureMs: g.captureMs,
        captureIso: g.captureIso, captureBase: g.captureBase,
      };
      const jobs = [
        ['characterisation.json', { ...head, rematch: g.rematchCharacterisation, dateDerivedFields: g.dateDerivedFields }],
        ['statistics.golden.json', { ...head, statistics: g.statistics }],
        ['roster.manifest.json', { ...head, ...g.roster }],
        ['fighters.golden.json', { ...head, selection: g.selection, pairs: g.pairs, fighterFixtures: g.fighterFixtures }],
        ['entries.golden.json', { ...head, volatileEntryPaths: g.volatileEntryPaths, entryGoldens: g.entryGoldens }],
        ['model.golden.json', { ...head, modelGoldens: g.modelGoldens, symmetry: g.symmetry }],
      ];
      for (const [name, obj] of jobs) {
        const body = JSON.stringify(encodeSpecials(obj));
        const r = await fetch(base + '/' + name, { method: 'POST', body });
        status.written.push({ name, bytes: body.length, status: r.status });
        await new Promise((res) => setTimeout(res, 250)); // yield to the event loop
      }
    } catch (e) {
      status.errors.push(String(e));
    }
    status.finished = true;
  })();
  return 'postAll started -- poll window.__fmPostStatus';
}

window.__fmGoldens = {
  capture, verifyDeterminism, download, postAll,
  stableStringify, hash, deepDiff, encodeSpecials, decodeSpecials,
};
console.log('[goldens] Stage 0 harness ready -- window.__fmGoldens');

export {};
