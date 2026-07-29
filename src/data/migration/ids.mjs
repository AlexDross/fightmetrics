// Stage 6 — deterministic ID derivation. BROWSER-SAFE: no Node builtins.
//
// This file previously imported createHash/randomBytes from 'node:crypto',
// which made a Vite browser build fail outright:
//   "createHash is not exported by __vite-browser-external"
// Nothing caught it because App.js does not import the data layer yet — it
// would have broken the moment Stage 7 wired IndexedDB up. The Vite lib build
// in vite.browser-probe.config.mjs now exercises this file for real.
//
// SHA-1 is implemented here rather than pulled from a package. The `uuid`
// library was evaluated first and rejected: it validates namespace arguments,
// and NS.EVENT below is not a well-formed RFC UUID (its version nibble is `d`).
// Adopting the library would have forced changing that constant, which changes
// every derived Event and Bout ID — breaking the byte-identical requirement.
// See the note on NS.EVENT.
//
// Randomness comes from the Web Crypto API (globalThis.crypto.getRandomValues),
// available in browsers and in Node 19+.

/**
 * Fixed namespaces. Changing ANY of these changes every migrated ID.
 *
 * NOTE: NS.EVENT is the widely-copied Microsoft-style GUID whose version nibble
 * is `d`, so it is not a valid RFC 4122 v1-v8 UUID. It is retained verbatim
 * because the derived Event and Bout IDs must stay byte-identical to those
 * produced at e6b8bde. It is only ever an input to SHA-1, so its version bits
 * are never interpreted — but a stricter implementation would reject it, and
 * replacing it is a deliberate decision that must happen before any data is
 * persisted, not after. Recorded in docs/DOMAIN_SCHEMA.md.
 */
export const NS = Object.freeze({
  EVENT: '6f9619ff-8b86-d011-b42d-00c04fc964ff',
  BOUT: '7b2c1e44-3a55-4a7e-9c1d-2f8e6b0a1d33',
  SNAPSHOT: '1c8a5d92-6e70-4b83-8a41-9d2c7f5b0e64',
  MARKET: '2d9b6ea3-7f81-4c94-9b52-ae3d806c1f75',
  ASSESSMENT: '3eac7fb4-8092-4da5-ac63-bf4e917d2086',
  TRACKED: '4fbd80c5-91a3-4eb6-bd74-c05fa28e3197',
});

const rotl = (n, s) => ((n << s) | (n >>> (32 - s))) >>> 0;

/** SHA-1 over bytes. Pure JS; byte-identical to node:crypto's sha1, which is
 *  asserted exhaustively against every derived ID in the migration tests. */
function sha1(bytes) {
  const len = bytes.length;
  const padded = new Uint8Array(((((len + 8) >> 6) + 1) << 6));
  padded.set(bytes);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  const bitLen = len * 8;
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Uint32Array(80);

  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 80; i++) w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);

    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      let f, k;
      if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const t = (rotl(a, 5) + f + e + k + w[i]) >>> 0;
      e = d; d = c; c = rotl(b, 30); b = a; a = t;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }

  const out = new Uint8Array(20);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, h0, false); odv.setUint32(4, h1, false); odv.setUint32(8, h2, false);
  odv.setUint32(12, h3, false); odv.setUint32(16, h4, false);
  return out;
}

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

const utf8 = (s) => new TextEncoder().encode(s);

/** RFC 4122 v5 (SHA-1, name-based). Deterministic. */
export function uuidv5(namespace, name) {
  const ns = hexToBytes(namespace);
  const nm = utf8(name);
  const input = new Uint8Array(ns.length + nm.length);
  input.set(ns, 0);
  input.set(nm, ns.length);
  const b = sha1(input).subarray(0, 16);
  const out = new Uint8Array(b);
  out[6] = (out[6] & 0x0f) | 0x50; // version 5
  out[8] = (out[8] & 0x3f) | 0x80; // RFC 4122 variant
  return bytesToUuid(out);
}

const webRandom = (n) => {
  const c = globalThis.crypto;
  if (!c || typeof c.getRandomValues !== 'function') {
    throw new Error('Web Crypto getRandomValues is unavailable; inject a random source');
  }
  return c.getRandomValues(new Uint8Array(n));
};

/** RFC 9562 v7 (time-ordered): 48-bit ms timestamp + 74 random bits.
 *  Non-deterministic by design, so migrations receive it injected rather than
 *  calling it directly. */
export function uuidv7(nowMs = Date.now(), rand = webRandom) {
  const b = new Uint8Array(16);
  const ts = BigInt(nowMs);
  for (let i = 0; i < 6; i++) b[i] = Number((ts >> BigInt(8 * (5 - i))) & 0xffn);
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
