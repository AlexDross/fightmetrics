// Source-backed snapshot dates for scripts/verify-rankings.mjs.
//
// scripts/update_rankings.py extends the pre-cutoff Kaggle history with EVERY
// committed official media snapshot, not just the newest one. The verifier must
// therefore accept every date that a committed media snapshot file backs. It
// used to trust only the latest one, so the first weekly refresh after a second
// snapshot landed rejected the earlier snapshot's rows and the job failed every
// week afterwards.
import fs from 'node:fs';
import path from 'node:path';

const MEDIA_FILE = /^(\d{4}-\d{2}-\d{2})-media\.json$/;

export const ymd = (isoDate) => Number(isoDate.replaceAll('-', ''));

// Validate parsed media snapshots against their filenames and return their
// publication dates as sorted YYYYMMDD integers. `files` is [{ name, snapshot }].
export function mediaSnapshotDates(files) {
  const dates = [];
  for (const { name, snapshot } of files) {
    const match = MEDIA_FILE.exec(name);
    if (!match) throw new Error(`Not a media snapshot filename: ${name}`);
    if (snapshot.schemaVersion !== 1) {
      throw new Error(`${name}: unsupported snapshot schema ${snapshot.schemaVersion}`);
    }
    if (snapshot.sourceSystem !== 'media') {
      throw new Error(`${name}: sourceSystem is ${snapshot.sourceSystem}, expected media`);
    }
    if (snapshot.sourceUpdatedAt !== match[1]) {
      throw new Error(
        `${name}: sourceUpdatedAt ${snapshot.sourceUpdatedAt} does not match its filename`
      );
    }
    dates.push(ymd(match[1]));
  }
  if (new Set(dates).size !== dates.length) throw new Error('Duplicate media snapshot dates');
  return dates.sort((a, b) => a - b);
}

export function loadMediaSnapshotDates(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('-media.json'))
    .map((name) => ({
      name,
      snapshot: JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')),
    }));
  if (files.length === 0) throw new Error(`No media snapshots in ${dir}`);
  return mediaSnapshotDates(files);
}

// History rows dated after the reviewed Kaggle cutoff that no committed media
// snapshot backs. Returns [] when the history is clean.
export function unbackedPostCutoffDates(history, cutoff, mediaDates) {
  const backed = new Set(mediaDates);
  const offenders = [];
  for (const [key, entries] of Object.entries(history)) {
    for (const [date] of entries) {
      if (date > cutoff && !backed.has(date)) offenders.push({ key, date });
    }
  }
  return offenders;
}
