import { describe, it, expect } from 'vitest';
import { settlePropPick, finishesOfMethod } from '../propSettlement.js';

const A = 'Loopy Godinez';
const B = 'Ketlen Souza';
const pick = (side, method) => ({ side, method, fighterA: A, fighterB: B });
const fight = (actualWinner, actualFinish) => ({ actualWinner, actualFinish });

describe('finishesOfMethod', () => {
  it('maps singles and doubles to finish codes', () => {
    expect([...finishesOfMethod('Decision')]).toEqual(['DEC']);
    expect([...finishesOfMethod('KO/TKO or Submission')]).toEqual(['KO/TKO', 'SUB']);
  });
  it('rejects an unknown method rather than guessing', () => {
    expect(finishesOfMethod('Points')).toBeNull();
    expect(finishesOfMethod('KO/TKO or Points')).toBeNull();
    expect(finishesOfMethod(undefined)).toBeNull();
  });
});

describe('settlePropPick: fight-level props (side null)', () => {
  it('Fight Goes to Decision wins on a decision and loses on a finish', () => {
    expect(settlePropPick(pick(null, 'Decision'), fight(A, 'DEC'))).toBe('WON');
    expect(settlePropPick(pick(null, 'Decision'), fight(B, 'SUB'))).toBe('LOST');
  });
  it('a draw is a decision, so Fight Goes to Decision wins', () => {
    expect(settlePropPick(pick(null, 'Decision'), fight('DRAW', 'DEC'))).toBe('WON');
  });
  it('inside-the-distance fight prop', () => {
    expect(settlePropPick(pick(null, 'KO/TKO or Submission'), fight(A, 'KO/TKO'))).toBe('WON');
    expect(settlePropPick(pick(null, 'KO/TKO or Submission'), fight('DRAW', 'DEC'))).toBe('LOST');
  });
});

describe('settlePropPick: fighter-level props', () => {
  it('wins only when the backed fighter wins by a listed method', () => {
    expect(settlePropPick(pick('A', 'Decision'), fight(A, 'DEC'))).toBe('WON');
    expect(settlePropPick(pick('A', 'KO/TKO'), fight(A, 'DEC'))).toBe('LOST');
    expect(settlePropPick(pick('B', 'KO/TKO or Submission'), fight(B, 'SUB'))).toBe('WON');
  });
  it('loses when the other fighter wins, whatever the finish', () => {
    expect(settlePropPick(pick('A', 'Decision'), fight(B, 'DEC'))).toBe('LOST');
    expect(settlePropPick(pick('A', 'Decision'), fight(B, ''))).toBe('LOST');
  });
  it('a draw voids a fighter-level prop', () => {
    expect(settlePropPick(pick('A', 'Decision'), fight('DRAW', 'DEC'))).toBe('PUSH');
  });
});

describe('settlePropPick: void and unsettleable', () => {
  it('NC voids every prop', () => {
    expect(settlePropPick(pick(null, 'Decision'), fight('NC', ''))).toBe('PUSH');
    expect(settlePropPick(pick('A', 'KO/TKO'), fight('NC', ''))).toBe('PUSH');
  });
  it('returns null instead of guessing', () => {
    expect(settlePropPick(pick(null, 'Decision'), fight('', ''))).toBeNull(); // ungraded
    expect(settlePropPick(pick(null, 'Decision'), fight(A, ''))).toBeNull(); // finish unknown
    expect(settlePropPick(pick('A', 'Decision'), fight(A, ''))).toBeNull();
    expect(settlePropPick(pick('A', 'Decision'), fight('Someone Else', 'DEC'))).toBeNull();
    expect(settlePropPick(pick(null, 'Points'), fight(A, 'DEC'))).toBeNull();
  });
});
