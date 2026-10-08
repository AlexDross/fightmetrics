#!/usr/bin/env node
// Enter a whole upcoming card into the Upcoming tab, from the command line.
//
// The app enters fights one at a time: Simulator -> pick both fighters -> type
// odds -> set event/date/bout context -> "Save to Upcoming". That button calls
// buildRoiEntry() and hands the result to addPendingEntry(). This script calls
// THE SAME TWO FUNCTIONS, once per fight, and saves the new entries to the
// document store -- Supabase when .env.local configures it (signed in via
// `node scripts/fm-store.mjs login`), else src/upcomingData.js (or force the
// files with --files) -- so a card entered here is identical to the same card
// entered by hand.
//
//   node scripts/enter_upcoming.mjs resolve <card.json>
//   node scripts/enter_upcoming.mjs add <card.json> [--dry-run] [--no-c6]
//   node scripts/enter_upcoming.mjs remove --event "UFC 331" [--dry-run]
//   node scripts/enter_upcoming.mjs list
//   (any command) --files   use src/*Data.js even when Supabase is configured
//
// C6 IS ON BY DEFAULT, because production is. The deployed bundle is built with
// VITE_C6_USER_FACING_ENABLED:"true", and every ROI entry since 2026-08-20
// carries decisionProbabilitySource 'c6'. C6 is NOT a modelToggle option --
// modelToggle stays 'v2' and C6 is gated separately on that env flag, which
// src/domain/shadow/config.js reads through import.meta.env. Plain Node has no
// import.meta.env, so without the shim below the flag reads as unset and C6
// fails closed -- silently writing v2 entries into a C6 corpus. That is exactly
// what happened to the first UFC 331 entry. --no-c6 forces it off deliberately.
//
// card.json:
//   {
//     "eventName": "UFC 331",
//     "eventDate": "2026-09-20",
//     "fights": [
//       {
//         "fighterA": "Exact Name From The Roster",
//         "fighterB": "Exact Name From The Roster",
//         "probA": 0.62, "probB": 0.39,      // prediction-market prices, OR
//         "oddsA": "-155", "oddsB": "+130",  // American odds (wins if both given)
//         "division": "Middleweight",        // canonical division, or null
//         "isTitleBout": false,              // null = unverified, never guessed
//         "scheduledRounds": 3,              // 3 | 5 | null
//         "unitsWagered": 1                  // optional, defaults to 1 like the UI
//       }
//     ],
//     "provenance": {                      // REQUIRED whenever bout context is set
//       "sourceUrl": "https://www.ufc.com/news/official-weigh-results-...",
//       "retrievedAt": "2026-09-18",
//       "authority": "official"            // "official" (UFC/commission) | "secondary"
//     }
//   }

import { readFileSync } from 'node:fs';
import { resolve as resolvePath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

// src/ uses Vite's extensionless import style, which plain Node ESM does not
// resolve. Same retry hook scripts/regen_simulator_bar_anchors.mjs registers --
// try '.js' then '/index.js', exactly what Vite does. Must run before the
// dynamic imports below so it covers the whole dependency graph.
//
// The `load` hook additionally rewrites `import.meta.env` to `process.env` in
// src/domain/shadow/config.js. That module is the ONE gate on user-facing C6,
// and under plain Node `import.meta.env` is undefined, so `readEnv()` returns
// {} and C6 is silently OFF -- which would quietly save v2 entries into a
// corpus whose last 38 records are C6. Vite injects that env in the browser;
// this does the same thing for the CLI, so `VITE_C6_USER_FACING_ENABLED=true`
// means here exactly what it means in the deployed app.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(spec, ctx, next) {
        try { return await next(spec, ctx); }
        catch (err) {
          for (const ext of ['.js', '/index.js']) {
            try { return await next(spec + ext, ctx); } catch {}
          }
          throw err;
        }
      }
      export async function load(url, ctx, next) {
        const res = await next(url, ctx);
        if (url.includes('/domain/shadow/config.js') && res.source) {
          return {
            ...res,
            source: res.source.toString().replaceAll('import.meta.env', 'process.env'),
          };
        }
        return res;
      }
    `),
  import.meta.url
);

// Set BEFORE the dynamic imports below: config.js reads the flag at call time,
// but keeping this above the imports means there is no window in which any
// module could observe a different value.
if (process.argv.includes('--no-c6')) {
  delete process.env.VITE_C6_USER_FACING_ENABLED;
} else if (process.env.VITE_C6_USER_FACING_ENABLED == null) {
  process.env.VITE_C6_USER_FACING_ENABLED = 'true';
}

const { FIGHTERS } = await import('../src/domain/fighters/index.js');
const { buildRoiEntry, americanOdds } = await import('../src/domain/betting/index.js');
const { addPendingEntry, pendingMatchupKey } = await import('../src/domain/workflow/index.js');
const { validateBoutContext, fightersOutsideRosterDivision } = await import('../src/domain/boutContext/index.js');
const { resolveFighterAge } = await import('../src/domain/age/index.js');
const { isC6UserFacingActive } = await import('../src/domain/shadow/config.js');
const { openStore } = await import('./lib/documentStore.mjs');

// One read of the store up front; every command works from this snapshot and
// writes back with the revisions it read, so a concurrent change is refused
// rather than overwritten.
const store = await openStore();
const COLLECTIONS = await store.load().catch((e) => { console.error(e.message); process.exit(1); });
const loadUpcoming = () => COLLECTIONS.upcoming;
const loadRoi = () => COLLECTIONS.roi;

async function saveOps(ops) {
  await store.apply(ops).catch((e) => { console.error(`\n${e.message}`); process.exit(1); });
  console.log(`\nSaved to ${store.describeTarget}`);
}

// ── Fighter lookup ──────────────────────────────────────────────────────────
// Exact roster spelling wins outright. Everything below it is a SUGGESTION the
// caller has to confirm -- this never silently picks a fighter, because
// entering the wrong Silva is worse than failing loudly.
const fold = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const byExact = new Map(FIGHTERS.map((f) => [f.FIGHTER, f]));
const byFolded = new Map();
for (const f of FIGHTERS) {
  const k = fold(f.FIGHTER);
  if (!byFolded.has(k)) byFolded.set(k, []);
  byFolded.get(k).push(f);
}

function lookupFighter(name) {
  if (byExact.has(name)) return { fighter: byExact.get(name), how: 'exact' };
  const folded = byFolded.get(fold(name));
  if (folded?.length === 1) return { fighter: folded[0], how: 'normalized' };
  if (folded?.length > 1) {
    return { fighter: null, how: 'ambiguous', candidates: folded.map((f) => f.FIGHTER) };
  }
  // Suggestions only -- reported for a human to confirm, never auto-selected.
  // Three cheap shapes cover what the markets actually get wrong: a dropped
  // generational suffix ("Michael Aswell" for the roster's "Michael Aswell
  // Jr."), an added one, and a differently-spelled first name.
  const q = fold(name);
  const last = q.split(' ').pop();
  const candidates = FIGHTERS.filter((f) => {
    const r = fold(f.FIGHTER);
    return r.startsWith(`${q} `) || q.startsWith(`${r} `) || r.split(' ').pop() === last;
  })
    .map((f) => f.FIGHTER)
    .slice(0, 8);
  return { fighter: null, how: 'missing', candidates };
}

// ── Profile completeness ────────────────────────────────────────────────────
// Warnings, never errors: a thin profile is still enterable, but the model
// quietly substitutes placeholders for what is missing, and the person entering
// the card should see that before it ships. Each check mirrors what v2 does:
//   - age: resolveFighterAge at the event date (DOB first, stored AGE second);
//     if EITHER corner is unknown the `younger` feature is zeroed for the bout.
//   - height/reach: null becomes 69" / 70" (src/domain/model/index.js featsV2).
//   - career minutes: sampleBlend weights a fighter's own rates by min/75 and
//     the division mean by the rest. Below 30 min (<40% own) the stats are
//     mostly the division mean, so only that is flagged -- 30-75 min is just a
//     newer fighter and would fire on half of every card.
// Roster vs bout division does not move v2/C6 (normalization follows the bout
// division) but it is the profile's division everywhere else, so it is flagged.
const SAMPLE_FULL_TRUST_MIN = 75;
const THIN_SAMPLE_WARN_MIN = 30;

function profileWarnings(fighter, eventDate) {
  const gaps = [];
  if (resolveFighterAge(fighter, eventDate) == null) gaps.push('age unknown (younger feature zeroed for this bout)');
  if (fighter.HEIGHT_IN == null) gaps.push('height missing (model uses 69")');
  if (fighter.REACH_IN == null) gaps.push('reach missing (model uses 70")');
  const mins = fighter.TOTAL_MIN ?? 0;
  if (mins < THIN_SAMPLE_WARN_MIN) {
    const trust = Math.round((mins / SAMPLE_FULL_TRUST_MIN) * 100);
    gaps.push(`${mins.toFixed(1)} career min (stats ${trust}% own, ${100 - trust}% division mean)`);
  }
  return gaps;
}

// ── Odds ────────────────────────────────────────────────────────────────────
// Prediction-market prices (Polymarket/Kalshi/Novig) are probabilities; the
// entry stores American odds. Convert with the app's OWN americanOdds() so a
// converted line is the same string the app would have produced. American odds
// supplied directly are passed through untouched and win over prices.
function resolveOdds(fight) {
  const hasAmerican = fight.oddsA != null && fight.oddsA !== '' && fight.oddsB != null && fight.oddsB !== '';
  if (hasAmerican) {
    // A bare JSON number (117) loses its sign under String(); write "+117".
    const signed = (o) => {
      const s = String(o).trim();
      return /^\d/.test(s) ? `+${s}` : s;
    };
    return { oddsA: signed(fight.oddsA), oddsB: signed(fight.oddsB), from: 'american' };
  }
  const { probA, probB } = fight;
  const ok = (p) => typeof p === 'number' && p > 0 && p < 1;
  if (ok(probA) && ok(probB)) {
    return { oddsA: americanOdds(probA), oddsB: americanOdds(probB), from: 'prices' };
  }
  if (ok(probA) !== ok(probB)) {
    return { error: 'one side has a price and the other does not' };
  }
  return { oddsA: '', oddsB: '', from: 'none' };
}

// ── Build ───────────────────────────────────────────────────────────────────
function buildCard(cardPath) {
  const card = JSON.parse(readFileSync(resolvePath(process.cwd(), cardPath), 'utf8'));
  const { eventName, eventDate, fights } = card;
  const errors = [];
  const warnings = [];

  if (!eventName || typeof eventName !== 'string') errors.push('card: eventName is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate ?? '')) errors.push('card: eventDate must be YYYY-MM-DD');
  if (!Array.isArray(fights) || fights.length === 0) errors.push('card: fights must be a non-empty array');
  if (errors.length) return { errors, warnings, rows: [] };

  if (eventDate < new Date().toISOString().slice(0, 10)) {
    warnings.push(`eventDate ${eventDate} is in the past -- these will show as pending-to-grade immediately`);
  }

  const existingUpcoming = loadUpcoming();
  const roiKeys = new Set(loadRoi().map(pendingMatchupKey));
  const seen = new Set(existingUpcoming.map(pendingMatchupKey));
  const rows = [];

  fights.forEach((fight, i) => {
    const at = `fight ${i + 1} (${fight.fighterA ?? '?'} vs ${fight.fighterB ?? '?'})`;
    const a = lookupFighter(fight.fighterA);
    const b = lookupFighter(fight.fighterB);
    for (const [side, r, name] of [['A', a, fight.fighterA], ['B', b, fight.fighterB]]) {
      if (r.fighter) {
        if (r.how === 'normalized') {
          warnings.push(`${at}: fighter${side} "${name}" matched roster spelling "${r.fighter.FIGHTER}"`);
        }
        continue;
      }
      const hint = r.candidates?.length ? ` -- did you mean: ${r.candidates.join(', ')}` : '';
      errors.push(
        `${at}: fighter${side} "${name}" is ${r.how === 'ambiguous' ? 'ambiguous' : 'not in the roster'}${hint}`
      );
    }
    if (!a.fighter || !b.fighter) return;

    const odds = resolveOdds(fight);
    if (odds.error) { errors.push(`${at}: ${odds.error}`); return; }
    if (odds.from === 'none') {
      warnings.push(`${at}: no odds -- saved without a market (no bet signal, no EV/Kelly)`);
    }

    const boutContext = {
      division: fight.division ?? null,
      isTitleBout: fight.isTitleBout ?? null,
      scheduledRounds: fight.scheduledRounds ?? null,
      provenance: fight.provenance ?? card.provenance ?? null,
    };
    const v = validateBoutContext(boutContext);
    if (!v.valid) { errors.push(`${at}: ${v.errors.join('; ')}`); return; }
    for (const w of v.warnings) warnings.push(`${at}: ${w}`);

    // Committed-corpus invariant, enforced by
    // src/data/__tests__/gradingHandoffIntegrity.test.mjs ("no record loses its
    // official bout-context provenance"): an entry that carries a boutContext
    // must carry the citation it came from. The Simulator cannot satisfy this
    // -- it collects no citation, so it saves context without provenance -- but
    // this path researched the card from a real source and must record it, or
    // the whole suite fails on the next run.
    const hasContext =
      boutContext.division != null ||
      boutContext.isTitleBout != null ||
      boutContext.scheduledRounds != null;
    const p = boutContext.provenance;
    if (hasContext && (!p?.sourceUrl || !p?.retrievedAt || !p?.authority)) {
      errors.push(
        `${at}: bout context is set but provenance is incomplete -- ` +
          'every entry with a division/title/rounds needs { sourceUrl, retrievedAt, authority }'
      );
      return;
    }
    if (p && !['official', 'secondary'].includes(p.authority)) {
      errors.push(`${at}: provenance.authority must be "official" or "secondary", got ${JSON.stringify(p.authority)}`);
      return;
    }
    if (p && !/^\d{4}-\d{2}-\d{2}$/.test(p.retrievedAt ?? '')) {
      errors.push(`${at}: provenance.retrievedAt must be YYYY-MM-DD, got ${JSON.stringify(p.retrievedAt)}`);
      return;
    }

    const key = pendingMatchupKey({ fighterA: a.fighter.FIGHTER, fighterB: b.fighter.FIGHTER });
    if (seen.has(key)) { warnings.push(`${at}: already pending in Upcoming -- skipped`); return; }
    if (roiKeys.has(key)) { warnings.push(`${at}: this matchup is already graded in ROI -- skipped`); return; }
    seen.add(key);

    for (const f of [a.fighter, b.fighter]) {
      const gaps = profileWarnings(f, eventDate);
      if (gaps.length) warnings.push(`${at}: ${f.FIGHTER} thin profile -- ${gaps.join('; ')}`);
    }
    for (const f of fightersOutsideRosterDivision(boutContext, a.fighter, b.fighter)) {
      warnings.push(`${at}: ${f.FIGHTER} roster division is ${f.WEIGHT_CLASS}, bout is ${boutContext.division}`);
    }

    // The Simulator's exact save call. modelToggle 'v2' is the UI default.
    const entry = buildRoiEntry({
      fA: a.fighter,
      fB: b.fighter,
      oddsA: odds.oddsA,
      oddsB: odds.oddsB,
      eventName: eventName.trim(),
      eventDate,
      modelToggle: 'v2',
      unitsWagered: fight.unitsWagered != null ? Number(fight.unitsWagered) : 1,
      boutContext,
    });
    rows.push({ entry, oddsFrom: odds.from });
  });

  return { errors, warnings, rows, existingUpcoming };
}

function report(rows) {
  for (const { entry, oddsFrom } of rows) {
    const ctx = [
      entry.division,
      entry.boutContext?.scheduledRounds ? `${entry.boutContext.scheduledRounds}R` : null,
      entry.boutContext?.isTitleBout ? 'TITLE' : null,
    ].filter(Boolean).join(' ');
    const line = `${entry.oddsA || '--'}/${entry.oddsB || '--'}`;
    const bet =
      entry.betAction === 'NO BET' || !entry.betRecommendedFighter
        ? entry.betAction
        : `${entry.betAction} ${entry.betRecommendedFighter} ${entry.betRecommendedOdds}`;
    console.log(
      `${entry.fighterA} vs ${entry.fighterB}  [${ctx}]\n` +
        `    pick ${entry.trackedSide} ${(entry.trackedProb * 100).toFixed(1)}%  ` +
        `market ${line} (${oddsFrom})  ${bet}  ` +
        `finish ${entry.projectedFinish}`
    );
  }
}

// ── Decision-regime guard ───────────────────────────────────────────────────
// The decision source is set by an env flag that lives OUTSIDE the repo, so a
// run can silently produce entries computed under a different regime than the
// corpus they are joining -- which is not visible in any diff and quietly
// corrupts the track-record comparison. Compare what we are about to write
// against what the corpus most recently used, and refuse on a mismatch.
function checkRegime(rows) {
  if (!rows.length) return [];
  const writing = new Set(rows.map(({ entry }) => entry.decisionProbabilitySource ?? 'legacy'));
  const recent = loadRoi()
    .filter((e) => e.createdAt)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 20)
    .map((e) => e.decisionProbabilitySource ?? 'legacy');
  if (!recent.length) return [];
  const corpus = new Set(recent);
  // Only a UNIFORM recent corpus is a clear precedent. A corpus already mixed
  // says nothing about what this card should be, so do not invent a rule.
  if (corpus.size !== 1) return [];
  const [expected] = corpus;
  if (writing.size === 1 && writing.has(expected)) return [];
  return [
    `decision-regime mismatch: writing ${[...writing].join('/')} but the last ` +
      `${recent.length} ROI entries are all "${expected}". ` +
      (expected === 'c6'
        ? 'C6 is on by default -- something turned it off (--no-c6, or VITE_C6_USER_FACING_ENABLED set to a falsy value). '
        : '') +
      'Re-run without the override, or pass --allow-regime-change if the switch is deliberate.',
  ];
}

// ── Commands ────────────────────────────────────────────────────────────────
function cmdResolve(cardPath, { allowRegimeChange }) {
  const { errors, warnings, rows } = buildCard(cardPath);
  if (!allowRegimeChange) errors.push(...checkRegime(rows));
  for (const w of warnings) console.log(`warn: ${w}`);
  if (errors.length) {
    console.error(`\n${errors.length} problem(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  report(rows);
  console.log(
    `\n${rows.length} fight(s) resolve cleanly (C6 ${isC6UserFacingActive() ? 'ON' : 'OFF'}, ` +
      `decision source ${[...new Set(rows.map(({ entry }) => entry.decisionProbabilitySource))].join('/')}). Nothing written.`
  );
}

async function cmdAdd(cardPath, { dryRun, allowRegimeChange }) {
  const { errors, warnings, rows, existingUpcoming } = buildCard(cardPath);
  if (!allowRegimeChange) errors.push(...checkRegime(rows));
  for (const w of warnings) console.log(`warn: ${w}`);
  if (errors.length) {
    console.error(`\nRefusing to write -- ${errors.length} problem(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  if (!rows.length) { console.log('\nNothing to add.'); return; }

  report(rows);
  // addPendingEntry prepends newest-first and drops duplicate matchups, exactly
  // as handleSaveToUpcoming does; feeding the fights through it in order gives
  // the same array the UI would hold after saving them one by one.
  let next = existingUpcoming;
  const ops = [];
  for (const { entry } of rows) {
    const after = addPendingEntry(next, entry);
    // Same top-insert, same duplicate rule: the store ends up holding exactly
    // the array the UI would after saving these one by one.
    if (after !== next) ops.push({ op: 'put', collection: 'upcoming', payload: entry });
    next = after;
  }

  console.log(
    `\n${rows.length} entered (C6 ${isC6UserFacingActive() ? 'ON' : 'OFF'}, ` +
      `decision source ${[...new Set(rows.map(({ entry }) => entry.decisionProbabilitySource))].join('/')}) ` +
      `| upcoming ${existingUpcoming.length} -> ${next.length}`
  );
  if (dryRun) { console.log('\n--dry-run: nothing written'); return; }
  await saveOps(ops);
}

function cmdList() {
  const entries = loadUpcoming();
  console.log(JSON.stringify(
    entries.map((e) => ({
      id: e.id, eventName: e.eventName, eventDate: e.eventDate,
      fighterA: e.fighterA, fighterB: e.fighterB,
      trackedSide: e.trackedSide, betAction: e.betAction, actualWinner: e.actualWinner ?? '',
    })), null, 2));
}

// Drop a whole event back out of Upcoming. Needed to re-enter a card that was
// entered under the wrong decision regime: entries are immutable once saved
// (every field is frozen at save time and nothing downstream recomputes them),
// so a correction is a delete plus a fresh add, never an in-place edit.
async function cmdRemove(eventName, { dryRun }) {
  const entries = loadUpcoming();
  const hit = entries.filter((e) => e.eventName === eventName);
  if (!hit.length) {
    console.error(`no pending entries for event ${JSON.stringify(eventName)}`);
    const names = [...new Set(entries.map((e) => e.eventName))];
    if (names.length) console.error(`pending events: ${names.join(', ')}`);
    process.exit(1);
  }
  for (const e of hit) {
    if (e.actualWinner) {
      console.error(`refusing: ${e.fighterA} vs ${e.fighterB} is already graded (${e.actualWinner})`);
      process.exit(1);
    }
    console.log(`remove  ${e.fighterA} vs ${e.fighterB}  [${e.decisionProbabilitySource ?? 'legacy'}] ${e.trackedSide} ${e.betAction}`);
  }
  const next = entries.filter((e) => e.eventName !== eventName);
  console.log(`\n${hit.length} removed | upcoming ${entries.length} -> ${next.length}`);
  if (dryRun) { console.log('\n--dry-run: nothing written'); return; }
  await saveOps(hit.map((e) => ({ op: 'delete', collection: 'upcoming', id: e.id })));
}

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith('--')));
const args = rest.filter((a) => !a.startsWith('--'));

const usage =
  'usage: enter_upcoming.mjs resolve <card.json> [--no-c6] | add <card.json> [--dry-run] [--no-c6] ' +
  '[--allow-regime-change] | remove --event "<name>" [--dry-run] | list   (add --files to use src/*Data.js)';
const opts = {
  dryRun: flags.has('--dry-run'),
  allowRegimeChange: flags.has('--allow-regime-change'),
};
if (cmd === 'list') cmdList();
else if (cmd === 'remove') {
  const i = rest.indexOf('--event');
  const eventName = i >= 0 ? rest[i + 1] : args[0];
  if (!eventName || eventName.startsWith('--')) { console.error(usage); process.exit(1); }
  await cmdRemove(eventName, opts);
} else if (cmd === 'resolve' || cmd === 'add') {
  if (!args[0]) { console.error(usage); process.exit(1); }
  if (cmd === 'resolve') cmdResolve(args[0], opts);
  else await cmdAdd(args[0], opts);
} else { console.error(usage); process.exit(1); }
