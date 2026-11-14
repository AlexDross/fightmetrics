import { describe, expect, it } from 'vitest';
import { initialsOf } from '../FighterAvatar.jsx';

describe('initialsOf', () => {
  it('uses the first and last name', () => {
    expect(initialsOf('Islam Makhachev')).toBe('IM');
    expect(initialsOf('Waldo Cortes Acosta')).toBe('WA');
  });

  it('ignores generational suffixes', () => {
    expect(initialsOf('Khalil Rountree Jr.')).toBe('KR');
    expect(initialsOf('Raul Rosas Jr')).toBe('RR');
  });

  it('handles single names, extra spaces and empty input', () => {
    expect(initialsOf('Alatengheili')).toBe('AL');
    expect(initialsOf('  Bia   Mesquita ')).toBe('BM');
    expect(initialsOf('')).toBe('?');
    expect(initialsOf(null)).toBe('?');
  });
});
