// scripts/verify-rankings.mjs used to allow post-cutoff history rows only from
// the NEWEST media snapshot, while scripts/update_rankings.py builds history
// from ALL of them. Once a second snapshot was committed the weekly rankings
// job failed every run. These tests pin the verifier to the generator.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  loadMediaSnapshotDates,
  mediaSnapshotDates,
  unbackedPostCutoffDates,
} from '../../../../scripts/lib/rankingsSnapshots.mjs';

const CUTOFF = 20260618;
const media = (date) => ({ schemaVersion: 1, sourceSystem: 'media', sourceUpdatedAt: date });

const withSnapshotDir = (files, fn) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-rank-snapshots-'));
  try {
    for (const [name, body] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, name), JSON.stringify(body));
    }
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

describe('source-backed media snapshot dates', () => {
  it('accepts history rows from every committed post-cutoff media snapshot', () => {
    const history = {
      'Bantamweight\u001fa': [[20260601, 3], [20260804, 2], [20260929, 1]],
      'Bantamweight\u001fb': [[20260601, 4], [20260929, null]],
    };
    withSnapshotDir(
      {
        '2026-08-04-media.json': media('2026-08-04'),
        '2026-09-29-media.json': media('2026-09-29'),
        // Meta snapshots never back history.
        '2026-09-30-meta.json': { schemaVersion: 1, sourceSystem: 'meta', sourceUpdatedAt: '2026-09-30' },
      },
      (dir) => {
        const dates = loadMediaSnapshotDates(dir);
        expect(dates).toEqual([20260804, 20260929]);
        expect(unbackedPostCutoffDates(history, CUTOFF, dates)).toEqual([]);
        // The old rule (newest snapshot only) is exactly what broke the job.
        expect(unbackedPostCutoffDates(history, CUTOFF, [dates.at(-1)])).toEqual([
          { key: 'Bantamweight\u001fa', date: 20260804 },
        ]);
      }
    );
  });

  it('flags post-cutoff rows that no media snapshot backs', () => {
    const history = { 'Lightweight\u001fx': [[20260601, 5], [20260701, 4], [20260804, 3]] };
    expect(unbackedPostCutoffDates(history, CUTOFF, [20260804])).toEqual([
      { key: 'Lightweight\u001fx', date: 20260701 },
    ]);
  });

  it('allows any pre-cutoff date without a snapshot', () => {
    const history = { 'Lightweight\u001fx': [[20190101, 5], [CUTOFF, 4]] };
    expect(unbackedPostCutoffDates(history, CUTOFF, [])).toEqual([]);
  });

  it('rejects a snapshot whose content date disagrees with its filename', () => {
    expect(() =>
      mediaSnapshotDates([{ name: '2026-08-11-media.json', snapshot: media('2026-08-04') }])
    ).toThrow(/does not match its filename/);
  });

  it('rejects a non-media file posing as a media snapshot', () => {
    expect(() =>
      mediaSnapshotDates([
        { name: '2026-08-04-media.json', snapshot: { ...media('2026-08-04'), sourceSystem: 'meta' } },
      ])
    ).toThrow(/expected media/);
  });

  it('refuses an empty snapshot directory', () => {
    withSnapshotDir({}, (dir) => {
      expect(() => loadMediaSnapshotDates(dir)).toThrow(/No media snapshots/);
    });
  });
});
