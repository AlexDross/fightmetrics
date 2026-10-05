// A REAL process kill in the middle of a file-mode grade (the audit's SIGKILL
// reproduction): the next ordinary command must recover on its own -- no
// manual lock removal -- and the pick must end up in ROI, in exactly one file.
// Runs against a scratch copy of the data files via FM_DATA_ROOT.
import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');
const FILES = ['upcomingData.js', 'roiData.js', 'propPicksData.js', 'parlayData.js'];
let scratch;

function runStore(code, env = {}) {
  return spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: ROOT,
    env: { ...process.env, FM_STORE: 'files', FM_DATA_ROOT: scratch, ...env },
    encoding: 'utf8',
  });
}
const lib = JSON.stringify(join(ROOT, 'scripts/lib/documentStore.mjs'));

afterEach(() => { if (scratch) rmSync(scratch, { recursive: true, force: true }); });

describe('file-mode crash recovery', () => {
  it('recovers automatically after SIGKILL between the two renames of a grade', () => {
    scratch = mkdtempSync(join(tmpdir(), 'fm-crash-'));
    for (const f of FILES) cpSync(join(ROOT, 'src', f), join(scratch, 'src', f), { recursive: true });
    const has = (file, id) => readFileSync(join(scratch, 'src', file), 'utf8').includes(`"id": "${id}"`);

    // Seed our own pending entry (a copy of a graded one) so the test does not
    // depend on the real card: between events the bundled Upcoming is empty.
    // Then grade it, dying after the first rename.
    const id = 'fm-crash-test-pending';
    const seed = runStore(`
      import { openStore } from ${lib};
      const s = await openStore(); const c = await s.load();
      await s.apply([{ op: 'put', collection: 'upcoming', payload: { ...c.roi[0], id: ${JSON.stringify(id)}, actualWinner: '', actualFinish: '' } }]);
    `);
    expect(seed.status, seed.stderr).toBe(0);
    expect(has('upcomingData.js', id)).toBe(true);
    const crash = runStore(`
      import { openStore } from ${lib};
      const s = await openStore(); const c = await s.load(); const e = c.upcoming.find((x) => x.id === ${JSON.stringify(id)});
      await s.apply([{ op: 'delete', collection: 'upcoming', id: e.id }, { op: 'put', collection: 'roi', payload: { ...e, actualWinner: e.fighterA } }]);
    `, { FM_TEST_KILL_AFTER_FIRST_RENAME: '1' });
    expect(crash.signal).toBe('SIGKILL');
    // The crash state the audit observed: journal AND an abandoned lock left
    // behind, and the pick visible in neither file.
    expect(existsSync(join(scratch, '.fm-store.lock'))).toBe(true);
    expect(existsSync(join(scratch, '.fm-store-journal.json'))).toBe(true);
    expect(has('upcomingData.js', id)).toBe(false);
    expect(has('roiData.js', id)).toBe(false);

    // An ordinary read now recovers by itself.
    const after = runStore(`import { openStore } from ${lib}; const s = await openStore(); const c = await s.load(); console.log(JSON.stringify({ up: c.upcoming.some((x) => x.id === ${JSON.stringify(id)}), roi: c.roi.some((x) => x.id === ${JSON.stringify(id)}) }));`);
    expect(after.status).toBe(0);
    expect(after.stderr).toMatch(/abandoned file-mode lock/);
    expect(after.stderr).toMatch(/recovered an interrupted file-mode write/);
    expect(JSON.parse(after.stdout.trim().split('\n').pop())).toEqual({ up: false, roi: true });
    expect(existsSync(join(scratch, '.fm-store.lock'))).toBe(false);
    expect(existsSync(join(scratch, '.fm-store-journal.json'))).toBe(false);
  });

  it('a live holder is respected, not cleared', () => {
    scratch = mkdtempSync(join(tmpdir(), 'fm-lock-'));
    for (const f of FILES) cpSync(join(ROOT, 'src', f), join(scratch, 'src', f), { recursive: true });
    // This test process is alive: a lock naming it must block.
    writeFileSync(join(scratch, '.fm-store.lock'), String(process.pid));
    const r = runStore(`import { openStore } from ${lib}; const s = await openStore(); await s.load();`);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/another file-mode write is in progress/);
  });
});
