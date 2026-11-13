import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { FIGHT_HISTORY } from '../../../fightHistory';
import { decodeFightHistory, encodeFightHistory, FIGHT_HISTORY_KEYS } from '../fightHistoryCodec.js';

// The generated file exactly as the pipeline wrote it, parsed without Vite.
const raw = (() => {
  const text = readFileSync(new URL('../../../fightHistory.js', import.meta.url), 'utf8').trim();
  return JSON.parse(text.slice('export const FIGHT_HISTORY ='.length).replace(/;\s*$/, ''));
})();

describe('compact fight history', () => {
  it('the module the app imports is deep-equal to the generated file, key order included', () => {
    // FIGHT_HISTORY here went through the fm-compact-fight-history plugin.
    expect(Object.keys(FIGHT_HISTORY)).toEqual(Object.keys(raw));
    expect(FIGHT_HISTORY).toEqual(raw);
    for (const name of Object.keys(raw)) {
      FIGHT_HISTORY[name].forEach((bout, i) => {
        expect(Object.keys(bout), `${name} bout ${i}`).toEqual(Object.keys(raw[name][i]));
      });
    }
  });

  it('round-trips bouts that do not match the standard shape unchanged', () => {
    const odd = {
      A: [
        { dt: '2026-01-01', op: 'B', re: 'W', me: 'KO/TKO', rn: 1, ti: '1:00', wc: 'Lightweight', tb: false, ev: 'E' },
        { dt: '2026-02-01', op: 'C', re: 'L', rn: 2 }, // missing keys
        { ev: 'E', dt: '2026-03-01', op: 'D', re: 'W', me: 'Sub', rn: 1, ti: '2:00', wc: 'Lightweight', tb: true }, // reordered
        { dt: '2026-04-01', op: null, re: 'NC', me: 'Overturned', rn: 3, ti: '5:00', wc: 'Lightweight', tb: false, ev: 'E' }, // null opponent
      ],
      Empty: [],
    };
    const decoded = decodeFightHistory(JSON.parse(JSON.stringify(encodeFightHistory(odd))));
    expect(decoded).toEqual(odd);
    expect(Object.keys(decoded.A[2])).toEqual(Object.keys(odd.A[2]));
  });

  it('packs nearly every real bout and shrinks the payload', () => {
    const packed = encodeFightHistory(raw);
    const rows = Object.values(packed.fighters).flat();
    expect(rows.filter(Array.isArray).length / rows.length).toBeGreaterThan(0.99);
    expect(packed.keys).toEqual(FIGHT_HISTORY_KEYS);
    expect(JSON.stringify(packed).length).toBeLessThan(JSON.stringify(raw).length * 0.5);
  });

  it('rejects an unknown encoding version', () => {
    expect(() => decodeFightHistory({ v: 2 })).toThrow(/Unknown fight history encoding/);
  });
});
