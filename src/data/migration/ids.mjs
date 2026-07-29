// Stage 6 — deterministic ID derivation.
//
// Migrated IDs are UUIDv5: same input => same output, on every run, forever.
// New IDs are UUIDv7, supplied through an INJECTED provider so migrations stay
// pure and tests stay byte-reproducible.
//
// Implemented locally rather than pulled from a uuid package: v5 is
// SHA-1(namespace || name) with two nibbles overwritten, and node:crypto
// already ships SHA-1. One less dependency on the persistence path.
import { createHash, randomBytes } from 'node:crypto';

/** Fixed namespaces. Changing any of these changes every migrated ID. */
export const NS = Object.freeze({
  EVENT: '6f9619ff-8b86-d011-b42d-00c04fc964ff',
  BOUT: '7b2c1e44-3a55-4a7e-9c1d-2f8e6b0a1d33',
  SNAPSHOT: '1c8a5d92-6e70-4b83-8a41-9d2c7f5b0e64',
  MARKET: '2d9b6ea3-7f81-4c94-9b52-ae3d806c1f75',
  ASSESSMENT: '3eac7fb4-8092-4da5-ac63-bf4e917d2086',
  TRACKED: '4fbd80c5-91a3-4eb6-bd74-c05fa28e3197',
});

const hexToBytes = (hex) => {
  const clean = hex.replace(/-/g, '');
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
};

const bytesToUuid = (b) => {
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

/** RFC 4122 v5 (SHA-1, name-based). Deterministic. */
export function uuidv5(namespace, name) {
  const hash = createHash('sha1')
    .update(Buffer.from(hexToBytes(namespace)))
    .update(Buffer.from(name, 'utf8'))
    .digest();
  const b = new Uint8Array(hash.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  return bytesToUuid(b);
}

/** RFC 9562 v7 (time-ordered): 48-bit ms timestamp + 74 random bits.
 *  Non-deterministic by design, so it is injected rather than called directly
 *  by any migration. */
export function uuidv7(nowMs = Date.now(), rand = randomBytes) {
  const b = new Uint8Array(16);
  const ts = BigInt(nowMs);
  for (let i = 0; i < 6; i++) {
    b[i] = Number((ts >> BigInt(8 * (5 - i))) & 0xffn);
  }
  const r = rand(10);
  for (let i = 0; i < 10; i++) b[6 + i] = r[i];
  b[6] = (b[6] & 0x0f) | 0x70; // version 7
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  return bytesToUuid(b);
}

/**
 * Normalises a display name into a join hint. NON-AUTHORITATIVE: names collide,
 * and this is used only for migration matching, never as a durable key.
 */
export const fighterKey = (name) =>
  String(name).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();

/** Event name normalisation for deterministic legacy Event IDs. */
export const eventNameKey = (name) =>
  String(name).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();

// ── derivations ────────────────────────────────────────────────────────────
export const eventIdFor = ({ promotion, date, name }) =>
  uuidv5(NS.EVENT, `${promotion ?? 'UNKNOWN'}|${date}|${eventNameKey(name)}`);

/** Unordered pair, so both legacy orientations of the same bout collapse to one
 *  Bout. eventId is in the key, so a rematch at a later card is a DIFFERENT
 *  bout — the structural fix for the known cross-event collision. */
export const boutIdFor = ({ eventId, fighterKeys }) =>
  uuidv5(NS.BOUT, `${eventId}|${[...fighterKeys].sort().join('|')}`);

export const snapshotIdFor = ({ runId, basis }) => uuidv5(NS.SNAPSHOT, `${runId}|${basis}`);
export const marketIdFor = ({ runId }) => uuidv5(NS.MARKET, `${runId}|market`);
export const assessmentIdFor = ({ runId }) => uuidv5(NS.ASSESSMENT, `${runId}|assessment`);
export const trackedPositionIdFor = ({ runId }) => uuidv5(NS.TRACKED, `${runId}|tracked-position`);
