/**
 * Compact encoding for FIGHT_HISTORY.
 *
 * src/fightHistory.js is written by the fighter-update pipeline as one
 * pretty-printed object literal (~4.4 MB), and every bout repeats its nine key
 * names plus long, heavily repeated strings (event names, methods, divisions,
 * opponents). The Vite plugin in vite.config.mjs runs `encodeFightHistory` on
 * it at build (and test) time and ships the result with `decodeFightHistory`,
 * which rebuilds objects that are deep-equal to the originals, keys in the
 * same order. The generated file itself is never rewritten, so its content
 * hash in sourceManifest.js and every Node script that imports it directly
 * are unaffected.
 *
 * Format:
 *   { v: 1, keys, strings, fighters: { name: [bout, ...] } }
 * where a bout is either
 *   - an array of values in `keys` order, with string-table fields
 *     (DICT_FIELDS) replaced by their index into `strings`, or
 *   - the original object, for any bout whose keys differ from `keys` or
 *     whose dictionary fields are not strings. Nothing is ever dropped.
 */

export const FIGHT_HISTORY_KEYS = ['dt', 'op', 're', 'me', 'rn', 'ti', 'wc', 'tb', 'ev'];
const DICT_FIELDS = new Set(['op', 'me', 'wc', 'ev']);

const sameKeys = (bout, keys) => {
  const own = Object.keys(bout);
  return own.length === keys.length && own.every((k, i) => k === keys[i]);
};

export function encodeFightHistory(history, keys = FIGHT_HISTORY_KEYS) {
  const strings = [];
  const index = new Map();
  const intern = (s) => {
    if (!index.has(s)) {
      index.set(s, strings.length);
      strings.push(s);
    }
    return index.get(s);
  };
  const fighters = {};
  for (const [name, bouts] of Object.entries(history)) {
    fighters[name] = bouts.map((bout) => {
      const packable =
        bout && typeof bout === 'object' && !Array.isArray(bout) &&
        sameKeys(bout, keys) &&
        keys.every((k) => !DICT_FIELDS.has(k) || typeof bout[k] === 'string');
      if (!packable) return bout;
      return keys.map((k) => (DICT_FIELDS.has(k) ? intern(bout[k]) : bout[k]));
    });
  }
  return { v: 1, keys, strings, fighters };
}

export function decodeFightHistory(packed) {
  if (packed?.v !== 1) throw new Error(`Unknown fight history encoding: ${packed?.v}`);
  const { keys, strings, fighters } = packed;
  const dict = keys.map((k) => DICT_FIELDS.has(k));
  const out = {};
  for (const name of Object.keys(fighters)) {
    out[name] = fighters[name].map((row) => {
      if (!Array.isArray(row)) return row;
      const bout = {};
      for (let i = 0; i < keys.length; i += 1) bout[keys[i]] = dict[i] ? strings[row[i]] : row[i];
      return bout;
    });
  }
  return out;
}
