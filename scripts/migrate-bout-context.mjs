#!/usr/bin/env node
// Corrections 3 and 4 — deterministic bout-context migration for src/upcomingData.js.
//
// This script ENRICHES the ten tracked UFC 330 entries with verified scheduled
// bout context. It deliberately does NOT recompute any prediction.
//
// Recomputation would be wrong here. The roster has refreshed since these
// entries were saved on 2026-08-12, so re-running buildRoiEntry today moves
// seven of the ten stored probabilities (up to -2.86 pp on v1). Those stored
// values are point-in-time predictions and are the whole point of the ROI
// ledger; a metadata backfill must not silently regrade them. So this script
// only ever ADDS a `boutContext` key and, for exactly one entry, corrects a
// `division` display string that was derived from stale roster data.
//
// _provenance is deliberately left untouched. The stored probabilities were
// computed before bout context existed, so stamping this context into their
// provenance would misrepresent what actually fed them. New predictions saved
// from the Simulator do carry boutContext in provenance -- see buildRoiEntry.
//
// The script is idempotent: running it twice produces the same bytes. Run with
// --check to verify without writing (used by the test suite and CI).
//
// Source for every value below, retrieved 2026-08-14:
//   https://www.ufc.com/news/official-weigh-results-ufc-330-makhachev-vs-machado-garry
// That page lists each bout's division label, both fighters' weigh-in weights,
// the two championship designations, and states:
//   "Main event and co-main event scheduled for five rounds each.
//    All other bouts scheduled for three rounds."

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const FILE = new URL('../src/upcomingData.js', import.meta.url);
const PREFIX = 'export const UPCOMING_ENTRIES = ';

const SOURCE_URL =
  'https://www.ufc.com/news/official-weigh-results-ufc-330-makhachev-vs-machado-garry';
const RETRIEVED_AT = '2026-08-14';

// Keyed by "fighterA|fighterB" exactly as stored.
const VERIFIED = {
  'Islam Makhachev|Ian Machado Garry': {
    division: 'Welterweight',
    isTitleBout: true,
    scheduledRounds: 5,
  },
  'Mackenzie Dern|Gillian Robertson': {
    division: "Women's Strawweight",
    isTitleBout: true,
    scheduledRounds: 5,
  },
  'Mansur Abdul-Malik|Dustin Stoltzfus': {
    division: 'Middleweight',
    isTitleBout: false,
    scheduledRounds: 3,
  },
  'Edson Barboza|Esteban Ribovics': {
    division: 'Lightweight',
    isTitleBout: false,
    scheduledRounds: 3,
  },
  'Chidi Njokuani|Joel Alvarez': {
    division: 'Welterweight',
    isTitleBout: false,
    scheduledRounds: 3,
  },
  'Jalin Turner|Kaue Fernandes': {
    division: 'Lightweight',
    isTitleBout: false,
    scheduledRounds: 3,
  },
  'Donte Johnson|Eric McConico': {
    division: 'Middleweight',
    isTitleBout: false,
    scheduledRounds: 3,
  },
  // The only entry whose stored `division` changes. "Welterweight / Middleweight"
  // was derived from the two fighters' roster classes, and it disagreed only
  // because fightersData.js still lists Luque at welterweight. He had already
  // moved to middleweight and fought Kelvin Gastelum there at UFC 327. The bout
  // is, and always was, a straightforward middleweight fight.
  //
  // Repairing the stale roster/history records themselves is CORRECTION 6 and is
  // NOT done here -- see the PR description.
  'Vicente Luque|Tresean Gore': {
    division: 'Middleweight',
    isTitleBout: false,
    scheduledRounds: 3,
    correctsDivisionFrom: 'Welterweight / Middleweight',
  },
  'Neil Magny|Ramiz Brahimaj': {
    division: 'Welterweight',
    isTitleBout: false,
    scheduledRounds: 3,
  },
  'Jeremiah Wells|Myktybek Orolbai': {
    division: 'Welterweight',
    isTitleBout: false,
    scheduledRounds: 3,
  },
};

// Fields that must survive the migration untouched on every entry. Verified
// value-by-value below rather than trusted.
const FROZEN_FIELDS = [
  'id', 'createdAt', 'eventName', 'eventDate', 'fighterA', 'fighterB',
  'fighterAIsProspect', 'fighterBIsProspect', 'includesProspect',
  'fighterAProb', 'fighterBProb', 'predictedWinner', 'predictedProb',
  'modelUsed', 'trackedSide', 'trackedProb', 'unitsWagered', 'betAction',
  'bestBet', 'betRecommendedFighter', 'betRecommendedOdds', 'marketOdds',
  'edge', 'edgeA', 'edgeB', 'ev', 'evA', 'evB', 'kelly', 'kellyA', 'kellyB',
  'fairLine', 'fairLineA', 'fairLineB', 'oddsA', 'oddsB', 'v2pA', 'v2pB',
  'projectedKO', 'projectedSUB', 'projectedDEC', 'projectedFinish',
  'actualWinner', 'actualFinish', 'notes', '_provenance',
];

export function parseEntries(source) {
  if (!source.startsWith(PREFIX)) {
    throw new Error('upcomingData.js does not have the expected export prefix');
  }
  return JSON.parse(source.slice(PREFIX.length).replace(/;\s*$/, ''));
}

export function serializeEntries(entries) {
  return `${PREFIX}${JSON.stringify(entries, null, 2)};\n`;
}

// Rebuild each entry with boutContext inserted immediately after `division`, so
// the emitted diff is a contiguous block rather than a tail append. Key order is
// otherwise preserved exactly as read.
export function migrateEntries(entries) {
  return entries.map((entry) => {
    const key = `${entry.fighterA}|${entry.fighterB}`;
    const verified = VERIFIED[key];
    if (!verified) return entry;

    const boutContext = {
      division: verified.division,
      isTitleBout: verified.isTitleBout,
      scheduledRounds: verified.scheduledRounds,
      provenance: {
        sourceUrl: SOURCE_URL,
        retrievedAt: RETRIEVED_AT,
        authority: 'official',
      },
    };

    const out = {};
    for (const [k, v] of Object.entries(entry)) {
      if (k === 'boutContext') continue; // re-inserted positionally below
      out[k] = k === 'division' ? verified.division : v;
      if (k === 'division') out.boutContext = boutContext;
    }
    if (!('boutContext' in out)) out.boutContext = boutContext;
    return out;
  });
}

// Independent verification that nothing except the two allowed changes moved.
export function diffReport(before, after) {
  const problems = [];
  if (before.length !== after.length) {
    problems.push(`entry count changed: ${before.length} -> ${after.length}`);
    return problems;
  }
  before.forEach((b, i) => {
    const a = after[i];
    const label = `${b.fighterA} vs ${b.fighterB}`;
    for (const f of FROZEN_FIELDS) {
      const bv = JSON.stringify(b[f]);
      const av = JSON.stringify(a[f]);
      if (bv !== av) problems.push(`${label}: frozen field ${f} changed ${bv} -> ${av}`);
    }
    const expected = VERIFIED[`${b.fighterA}|${b.fighterB}`];
    if (!expected) return;
    if (a.division !== expected.division) {
      problems.push(`${label}: division is ${a.division}, expected ${expected.division}`);
    }
    if (b.division !== a.division && !expected.correctsDivisionFrom) {
      problems.push(`${label}: division changed but no correction was declared`);
    }
    // Idempotency: on a re-run the input already holds the corrected value, so
    // accept either the original pre-correction string or the corrected one.
    // Anything else means the file drifted and the migration should refuse.
    if (
      expected.correctsDivisionFrom &&
      b.division !== expected.correctsDivisionFrom &&
      b.division !== expected.division
    ) {
      problems.push(
        `${label}: expected to correct from "${expected.correctsDivisionFrom}" or find "${expected.division}", but found "${b.division}"`
      );
    }
  });
  return problems;
}

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

function main() {
  const checkOnly = process.argv.includes('--check');
  const source = readFileSync(FILE, 'utf8');
  const before = parseEntries(source);
  const after = migrateEntries(before);
  const output = serializeEntries(after);

  const problems = diffReport(before, after);
  if (problems.length) {
    console.error('MIGRATION REFUSED — unexpected changes:');
    problems.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }

  const titleBouts = after.filter((e) => e.boutContext?.isTitleBout === true);
  const fiveRounders = after.filter((e) => e.boutContext?.scheduledRounds === 5);
  const threeRounders = after.filter((e) => e.boutContext?.scheduledRounds === 3);

  console.log(`entries:        ${after.length}`);
  console.log(`title bouts:    ${titleBouts.length} (${titleBouts.map((e) => e.fighterA).join(', ')})`);
  console.log(`5-round bouts:  ${fiveRounders.length}`);
  console.log(`3-round bouts:  ${threeRounders.length}`);
  console.log(`sha256 before:  ${sha256(source)}`);
  console.log(`sha256 after:   ${sha256(output)}`);
  console.log(`unchanged:      ${source === output}`);

  if (checkOnly) {
    if (source !== output) {
      console.error('\n--check: file is NOT up to date with the verified context');
      process.exit(1);
    }
    console.log('\n--check: up to date');
    return;
  }
  writeFileSync(FILE, output);
  console.log('\nwritten');
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export { VERIFIED, FROZEN_FIELDS, SOURCE_URL, RETRIEVED_AT };
