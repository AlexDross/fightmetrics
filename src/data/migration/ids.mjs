// Stage 6 — deterministic ID derivation. BROWSER-SAFE: no Node builtins.
//
// This file previously imported createHash/randomBytes from 'node:crypto',
// which made a Vite browser build fail outright:
//   "createHash is not exported by __vite-browser-external"
// Nothing caught it because App.js does not import the data layer yet — it
// would have broken the moment Stage 7 wired IndexedDB up. The Vite lib build
// in vite.browser-probe.config.mjs now exercises this file for real.
//
// SHA-1 is implemented here rather than pulled from a package, keeping the
// module dependency-free and browser-safe. Correctness is pinned against the
// published RFC reference vectors, not just against our own output.
//
// Randomness comes from the Web Crypto API (globalThis.crypto.getRandomValues),
// available in browsers and in Node 19+.

/** RFC 4122 / 9562: versions 1-8, variant 10xx. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const isValidUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

/**
 * The standard DNS namespace from RFC 4122 Appendix C. Used once, to derive the
 * FightMetrics root below.
 */
export const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/**
 * Fixed namespaces. Changing ANY of these changes every migrated ID.
 *
 * EVENT is derived transparently and reproducibly:
 *
 *   root  = uuidv5(DNS_NAMESPACE, 'fightmetrics.app')
 *         = 1c187bfd-7f44-55ea-a824-7a3e3a544118
 *   EVENT = uuidv5(root, 'Event')
 *         = 833b2f12-8057-5c87-8e90-ac9d216371b0
 *
 * It is written as a literal rather than computed at module load so the
 * constant is greppable and cannot drift with a refactor; namespaceDerivation
 * below records the inputs, and a test recomputes the chain.
 *
 * This replaced the widely-copied Microsoft-style GUID
 * 6f9619ff-8b86-d011-b42d-00c04fc964ff, whose version nibble is `d` and which
 * is therefore not a valid RFC UUID at all. Correcting it changed Event IDs and
 * the Bout IDs derived from them; that was deliberate and cost nothing, because
 * no Stage 6 ID had been persisted, pushed or read by the application.
 *
 * The remaining five were already well-formed v4 UUIDs and are unchanged.
 */
export const NS = Object.freeze({
  EVENT: '833b2f12-8057-5c87-8e90-ac9d216371b0',
  BOUT: '7b2c1e44-3a55-4a7e-9c1d-2f8e6b0a1d33',
  SNAPSHOT: '1c8a5d92-6e70-4b83-8a41-9d2c7f5b0e64',
  MARKET: '2d9b6ea3-7f81-4c94-9b52-ae3d806c1f75',
  ASSESSMENT: '3eac7fb4-8092-4da5-ac63-bf4e917d2086',
  TRACKED: '4fbd80c5-91a3-4eb6-bd74-c05fa28e3197',
});

/** Inputs to the EVENT namespace derivation, so a test can recompute it. */
export const namespaceDerivation = Object.freeze({
  dns: DNS_NAMESPACE,
  rootName: 'fightmetrics.app',
  root: '1c187bfd-7f44-55ea-a824-7a3e3a544118',
  eventName: 'Event',
  event: '833b2f12-8057-5c87-8e90-ac9d216371b0',
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

/**
 * RFC 4122 v5 (SHA-1, name-based). Deterministic.
 *
 * The namespace is VALIDATED rather than accepted as arbitrary bytes. Without
 * this, a malformed or non-UUID namespace silently produces plausible-looking
 * IDs forever — which is exactly how the invalid Microsoft GUID survived here
 * unnoticed. `name` must be a string: passing a number or object would coerce
 * and hash something unintended.
 */
export function uuidv5(namespace, name) {
  if (!isValidUuid(namespace)) {
    throw new TypeError(
      `uuidv5: namespace must be a lowercase RFC 4122/9562 UUID (version 1-8, variant 10xx), got ${JSON.stringify(namespace)}`
    );
  }
  if (typeof name !== 'string') {
    throw new TypeError(`uuidv5: name must be a string, got ${typeof name}`);
  }
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

/** A second, distinct market for a legacy row whose `marketOdds` had been
 *  edited away from its original oddsA/oddsB. Deterministic and separate from
 *  the assessment market so both survive. */
export const trackedMarketIdFor = ({ runId }) => uuidv5(NS.MARKET, `${runId}|tracked-market`);
export const assessmentIdFor = ({ runId }) => uuidv5(NS.ASSESSMENT, `${runId}|assessment`);
export const trackedPositionIdFor = ({ runId }) => uuidv5(NS.TRACKED, `${runId}|tracked-position`);
