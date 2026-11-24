// ── Model-input freshness guard ─────────────────────────────────────────────
// A card is priced from the fighter data in THIS checkout, and every saved
// probability is frozen at save time -- nothing recomputes it later. The
// scheduled workflows (update-fighters.yml, update-rankings.yml) commit fresh
// data to origin/main, so a checkout that is behind main, or sitting on a
// branch cut before the last update, prices the card from stale stats: a
// fighter's most recent fight, ELO move and averages are simply missing, with
// no trace in the saved entry. This check compares the model's data inputs in
// the working tree against origin/main and refuses on any difference.
//
// Pure apart from the injected `git` runner, so it is unit-testable.

import { execFileSync } from 'node:child_process';

// Every src/ data module the prediction engine reads, plus the source manifest
// whose contents are frozen into each entry's _provenance.
export const MODEL_DATA_FILES = Object.freeze([
  'src/fightersData.js',
  'src/fightHistory.js',
  'src/eloModule.js',
  'src/cardioModule.js',
  'src/fighterBirthdates.js',
  'src/rankingsData.js',
  'src/rankHistory.js',
  'src/prospectsData.js',
  'src/sourceManifest.js',
]);

export const STALE_DATA_OVERRIDE = '--allow-stale-data';

// Runs git and returns { ok, status, stdout, stderr } instead of throwing, so
// the caller decides what a failure means.
export function runGit(args, { cwd } = {}) {
  try {
    const stdout = execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
    });
    return { ok: true, status: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      ok: false,
      status: typeof err.status === 'number' ? err.status : null,
      stdout: String(err.stdout ?? ''),
      stderr: String(err.stderr ?? err.message ?? ''),
    };
  }
}

/**
 * Compare the model's data files in the working tree with origin/main.
 *
 * @returns {{ fresh: boolean, problems: string[], staleFiles: string[] }}
 *   fresh=false whenever freshness could not be PROVEN -- including when
 *   origin is unreachable. Failing closed is deliberate: an unverified price
 *   is frozen forever, so "could not check" must not pass silently.
 */
export function checkModelDataFreshness({
  git = runGit,
  remote = 'origin',
  branch = 'main',
  files = MODEL_DATA_FILES,
} = {}) {
  const ref = `${remote}/${branch}`;
  const fetched = git(['fetch', '--quiet', remote, branch]);
  if (!fetched.ok) {
    return {
      fresh: false,
      staleFiles: [],
      problems: [
        `could not fetch ${ref} to confirm fighter data is current ` +
          `(${fetched.stderr.trim().split('\n')[0] || 'git fetch failed'}).`,
      ],
    };
  }
  // Working tree vs origin/main: catches a checkout that is behind main AND
  // uncommitted local edits to the data, both of which would price the card
  // from something other than the published data.
  const diff = git(['diff', '--name-only', ref, '--', ...files]);
  if (!diff.ok) {
    return {
      fresh: false,
      staleFiles: [],
      problems: [`could not compare model data with ${ref} (${diff.stderr.trim().split('\n')[0]}).`],
    };
  }
  const staleFiles = diff.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  if (!staleFiles.length) return { fresh: true, staleFiles, problems: [] };
  return {
    fresh: false,
    staleFiles,
    problems: [
      `model data differs from ${ref}: ${staleFiles.join(', ')}. ` +
        `Prices would be computed from stale or unpublished fighter data. ` +
        `Check out an up-to-date main (git switch main && git pull --ff-only) and re-run.`,
    ],
  };
}

/** The problems to add to a command's error list, honouring the override. */
export function freshnessErrors({ allowStaleData, check = checkModelDataFreshness } = {}) {
  if (allowStaleData) return [];
  const { fresh, problems } = check();
  if (fresh) return [];
  return problems.map((p) => `${p} Pass ${STALE_DATA_OVERRIDE} only if pricing from this data is deliberate.`);
}
