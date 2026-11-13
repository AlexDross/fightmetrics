import { describe, expect, it } from 'vitest';
import { eventDateLabel, frozenPick, pickNextEvent } from '../NextCard.jsx';

const fight = (over) => ({
  id: Math.random().toString(36).slice(2),
  eventName: 'UFC 334',
  eventDate: '2026-11-14',
  fighterA: 'A',
  fighterB: 'B',
  actualWinner: '',
  ...over,
});

describe('pickNextEvent', () => {
  it('features the earliest pending event dated today or later, fights in stored order', () => {
    const entries = [
      fight({ eventName: 'UFC 335', eventDate: '2026-11-21', fighterA: 'X' }),
      fight({ fighterA: 'Main' }),
      fight({ fighterA: 'Opener' }),
      fight({ eventName: 'Old Card', eventDate: '2026-11-07' }),
    ];
    const ev = pickNextEvent(entries, '2026-11-13');
    expect(ev.name).toBe('UFC 334');
    expect(ev.fights.map((f) => f.fighterA)).toEqual(['Main', 'Opener']);
  });

  it('ignores graded fights and falls back to the earliest pending event when all are in the past', () => {
    const entries = [
      fight({ actualWinner: 'A' }),
      fight({ eventName: 'Past Card', eventDate: '2026-11-07' }),
    ];
    expect(pickNextEvent(entries, '2026-11-20').name).toBe('Past Card');
  });

  it('returns null when nothing is pending', () => {
    expect(pickNextEvent([fight({ actualWinner: 'B' })], '2026-11-13')).toBeNull();
    expect(pickNextEvent([], '2026-11-13')).toBeNull();
    expect(pickNextEvent(undefined, '2026-11-13')).toBeNull();
  });
});

describe('eventDateLabel', () => {
  it('says Today / Tomorrow, otherwise a short date', () => {
    expect(eventDateLabel('2026-11-13', '2026-11-13')).toBe('Today · Fri, Nov 13');
    expect(eventDateLabel('2026-11-14', '2026-11-13')).toBe('Tomorrow · Sat, Nov 14');
    expect(eventDateLabel('2026-11-21', '2026-11-13')).toBe('Sat, Nov 21');
    expect(eventDateLabel(null, '2026-11-13')).toBeNull();
  });
});

describe('frozenPick', () => {
  it('uses the frozen C6 decision for a C6-driven entry', () => {
    const e = fight({ decisionProbabilitySource: 'c6', trackedSide: 'B', trackedProb: 0.531, v2pA: 0.6, v2pB: 0.4 });
    expect(frozenPick(e)).toEqual({ name: 'B', prob: 0.531, source: 'C6' });
  });

  it('falls back to the stored v2 argmax otherwise', () => {
    expect(frozenPick(fight({ v2pA: 0.42, v2pB: 0.58 }))).toEqual({ name: 'B', prob: 0.58, source: 'v2' });
  });

  it('returns null when nothing was frozen', () => {
    expect(frozenPick(fight({}))).toBeNull();
  });
});
