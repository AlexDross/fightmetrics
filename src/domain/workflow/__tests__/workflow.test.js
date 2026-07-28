import { describe, it, expect } from 'vitest';
import {
  isUpcomingVisible, filterVisibleUpcoming, pendingMatchupKey,
  addPendingEntry, createGradedEntry, removePendingEntry,
} from '../index.js';
import { isNoReadProbability } from '../../betting/index.js';

const entry = (over = {}) => ({
  id: 'id-1', fighterA: 'Alpha', fighterB: 'Bravo',
  eventName: 'UFC 300', eventDate: '2026-08-01', ...over,
});

// A 2026-08-01 event is a Saturday. +7 days is 2026-08-08 (Saturday); the first
// Tuesday on or after that is 2026-08-11. Visible through the 11th inclusive.
const CUTOFF = '2026-08-11';

describe('isUpcomingVisible', () => {
  it('fails open on a missing or malformed date — current behaviour', () => {
    for (const bad of [undefined, null, '', 'not-a-date', '2026-8-1', '20260801', '2026-08-01T00:00:00Z']) {
      expect(isUpcomingVisible(bad, '2099-01-01'), String(bad)).toBe(true);
    }
  });

  it('CHARACTERISATION: a well-formed but out-of-range date NORMALISES, it does not fail open', () => {
    // The regex accepts '2026-13-45', and new Date(2026, 12, 45) does not
    // produce NaN -- JavaScript rolls it forward to Sun 14 Feb 2027. So the
    // isNaN fail-open branch never fires for this input and the entry is
    // treated as a real (rolled-forward) event. Recorded as current behaviour,
    // not endorsed.
    expect(new Date(2026, 12, 45).toDateString()).toBe('Sun Feb 14 2027');
    expect(isUpcomingVisible('2026-13-45', '2027-01-01')).toBe(true);   // before the rolled cutoff
    expect(isUpcomingVisible('2026-13-45', '2099-01-01')).toBe(false);  // after it
  });

  it('is visible before the cutoff', () => {
    expect(isUpcomingVisible('2026-08-01', '2026-07-20')).toBe(true);  // before the event
    expect(isUpcomingVisible('2026-08-01', '2026-08-01')).toBe(true);  // event day
    expect(isUpcomingVisible('2026-08-01', '2026-08-10')).toBe(true);  // day before cutoff
  });

  it('is visible ON the cutoff Tuesday — inclusive', () => {
    expect(isUpcomingVisible('2026-08-01', CUTOFF)).toBe(true);
    expect(new Date(2026, 7, 11).getDay()).toBe(2);   // really a Tuesday
  });

  it('is hidden the day after the cutoff', () => {
    expect(isUpcomingVisible('2026-08-01', '2026-08-12')).toBe(false);
    expect(isUpcomingVisible('2026-08-01', '2027-01-01')).toBe(false);
  });

  it('gives at least 7 days of runway whatever weekday the event lands on', () => {
    for (let d = 1; d <= 7; d++) {
      const day = `2026-08-0${d}`;
      const plus7 = new Date(2026, 7, d + 7);
      const str = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
      expect(isUpcomingVisible(day, str(plus7)), `${day} + 7 days`).toBe(true);
    }
  });
});

describe('filterVisibleUpcoming', () => {
  it('excludes graded IDs even while the event is still visible', () => {
    const pending = [entry({ id: 'a' }), entry({ id: 'b', fighterA: 'Cee', fighterB: 'Dee' })];
    const roi = [{ id: 'a' }];
    const out = filterVisibleUpcoming(pending, roi, '2026-08-02');
    expect(out.map((e) => e.id)).toEqual(['b']);
  });

  it('excludes expired entries even when ungraded', () => {
    const pending = [entry({ id: 'old', eventDate: '2020-01-01' }), entry({ id: 'new' })];
    const out = filterVisibleUpcoming(pending, [], '2026-08-02');
    expect(out.map((e) => e.id)).toEqual(['new']);
  });

  it('both conditions must hold — graded AND expired are each sufficient to drop', () => {
    const pending = [
      entry({ id: 'gradedVisible' }),
      entry({ id: 'ungradedExpired', eventDate: '2020-01-01' }),
      entry({ id: 'keep' }),
    ];
    const out = filterVisibleUpcoming(pending, [{ id: 'gradedVisible' }], '2026-08-02');
    expect(out.map((e) => e.id)).toEqual(['keep']);
  });

  it('tolerates empty and missing inputs', () => {
    expect(filterVisibleUpcoming([], [], '2026-08-02')).toEqual([]);
    expect(filterVisibleUpcoming(undefined, undefined, '2026-08-02')).toEqual([]);
  });

  it('preserves order and object identity of survivors', () => {
    const a = entry({ id: 'a' });
    const b = entry({ id: 'b', fighterA: 'Cee', fighterB: 'Dee' });
    const out = filterVisibleUpcoming([a, b], [], '2026-08-02');
    expect(out[0]).toBe(a);
    expect(out[1]).toBe(b);
  });
});

describe('addPendingEntry', () => {
  it('prepends a new entry', () => {
    const existing = entry({ id: 'old', fighterA: 'Cee', fighterB: 'Dee' });
    const fresh = entry({ id: 'new' });
    const out = addPendingEntry([existing], fresh);
    expect(out.map((e) => e.id)).toEqual(['new', 'old']);
  });

  it('returns the ORIGINAL array reference on a duplicate', () => {
    const list = [entry({ id: 'a' })];
    const out = addPendingEntry(list, entry({ id: 'b' }));   // same fighters
    expect(out).toBe(list);                                   // referential identity
    expect(out.length).toBe(1);
  });

  it('ignores fighter ordering when detecting a duplicate', () => {
    const list = [entry({ id: 'a', fighterA: 'Alpha', fighterB: 'Bravo' })];
    const flipped = entry({ id: 'b', fighterA: 'Bravo', fighterB: 'Alpha' });
    expect(addPendingEntry(list, flipped)).toBe(list);
    expect(pendingMatchupKey(list[0])).toBe(pendingMatchupKey(flipped));
  });

  it('CURRENT DEFECTIVE BEHAVIOUR: a different event with the same fighters still collides', () => {
    // NOT a desired invariant. The key is the sorted fighter pair with no event
    // component, so a genuine rematch at a later card is silently rejected while
    // the first bout is still pending. Recorded in characterisation.json and
    // research/code_health_audit.md; event-aware identity belongs to Stage 6.
    // Pinned here so the defect cannot change accidentally in either direction.
    const list = [entry({ id: 'a', eventName: 'UFC 300', eventDate: '2026-08-01' })];
    const rematch = entry({ id: 'b', eventName: 'UFC 320', eventDate: '2026-12-05' });
    expect(addPendingEntry(list, rematch)).toBe(list);
    expect(list.map((e) => e.id)).toEqual(['a']);
  });

  it('allows a genuinely different matchup', () => {
    const list = [entry({ id: 'a' })];
    const other = entry({ id: 'b', fighterA: 'Alpha', fighterB: 'Charlie' });
    expect(addPendingEntry(list, other).map((e) => e.id)).toEqual(['b', 'a']);
  });
});

describe('createGradedEntry', () => {
  const stored = entry({
    id: 'keep-me',
    fighterAProb: 0.6443853655192241, v2pA: 0.5362376899288649,
    predictedWinner: 'Alpha', modelUsed: 'v2', betAction: 'LEAN',
    unitsWagered: 1, oddsA: '-150', oddsB: '+130',
    _provenance: { captureMode: 'live', modelCoefHash: '256f866e' },
  });

  it('preserves the id and every stored field exactly', () => {
    const graded = createGradedEntry(stored, 'Alpha');
    for (const k of Object.keys(stored)) {
      expect(graded[k], `field ${k}`).toEqual(stored[k]);
    }
    expect(graded.id).toBe('keep-me');
    expect(graded._provenance).toEqual(stored._provenance);
  });

  it('adds or replaces only actualWinner', () => {
    // On a real saved entry actualWinner already exists as '' (buildRoiEntry
    // stamps it), so grading replaces rather than adds. On a synthetic entry
    // without the field it is added. Both cases: exactly one field differs.
    const graded = createGradedEntry(stored, 'Alpha');
    const added = Object.keys(graded).filter((k) => !Object.hasOwn(stored, k));
    expect(added).toEqual(['actualWinner']);
    expect(graded.actualWinner).toBe('Alpha');

    const withField = { ...stored, actualWinner: '' };
    const regraded = createGradedEntry(withField, 'Alpha');
    expect(Object.keys(regraded).filter((k) => !Object.hasOwn(withField, k))).toEqual([]);
    const changed = Object.keys(regraded).filter((k) => regraded[k] !== withField[k]);
    expect(changed).toEqual(['actualWinner']);
  });

  it('replaces an existing actualWinner rather than duplicating it', () => {
    const regraded = createGradedEntry({ ...stored, actualWinner: 'Bravo' }, 'Alpha');
    expect(regraded.actualWinner).toBe('Alpha');
  });

  it('does not mutate the source entry', () => {
    const before = JSON.stringify(stored);
    createGradedEntry(stored, 'Alpha');
    expect(JSON.stringify(stored)).toBe(before);
    expect(Object.hasOwn(stored, 'actualWinner')).toBe(false);
  });
});

describe('removePendingEntry', () => {
  it('removes the matching id', () => {
    const list = [entry({ id: 'a' }), entry({ id: 'b' }), entry({ id: 'c' })];
    expect(removePendingEntry(list, 'b').map((e) => e.id)).toEqual(['a', 'c']);
  });

  it('leaves unrelated entries in order and with identity intact', () => {
    const a = entry({ id: 'a' });
    const c = entry({ id: 'c' });
    const out = removePendingEntry([a, entry({ id: 'b' }), c], 'b');
    expect(out[0]).toBe(a);
    expect(out[1]).toBe(c);
  });

  it('is a no-op for an unknown id', () => {
    const list = [entry({ id: 'a' })];
    expect(removePendingEntry(list, 'zzz').map((e) => e.id)).toEqual(['a']);
  });
});

describe('isNoReadProbability', () => {
  // Adjacent representable doubles, not decimals.
  const buf = new ArrayBuffer(8);
  const f = new Float64Array(buf);
  const i = new BigInt64Array(buf);
  const up = (x) => { f[0] = x; i[0] += 1n; return f[0]; };
  const down = (x) => { f[0] = x; i[0] -= 1n; return f[0]; };

  it('immediately below 0.53 is a NO READ', () => {
    expect(isNoReadProbability(down(0.53))).toBe(true);
  });

  it('exactly 0.53 is NOT a NO READ — the rule is strictly less than', () => {
    expect(isNoReadProbability(0.53)).toBe(false);
  });

  it('immediately above 0.53 is not a NO READ', () => {
    expect(isNoReadProbability(up(0.53))).toBe(false);
  });

  it('behaves sensibly across the wider range', () => {
    expect(isNoReadProbability(0.5)).toBe(true);
    expect(isNoReadProbability(0.52999)).toBe(true);
    expect(isNoReadProbability(0.6)).toBe(false);
    expect(isNoReadProbability(1)).toBe(false);
  });
});
