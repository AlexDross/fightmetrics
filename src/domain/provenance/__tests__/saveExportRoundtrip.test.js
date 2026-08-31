// Save -> grade -> export round-trip through the REAL writer, proving the
// provenance workflow end to end without any synthetic entry shape.
import { describe, it, expect } from 'vitest';
import { buildRoiEntry } from '../../betting/index.js';
import { normalizeBoutContext } from '../../boutContext/index.js';
import { createGradedEntry } from '../../workflow/index.js';
import { buildExportedCode, findProvenanceOffenders, ProvenanceExportError } from '../index.js';
import { loadFixture } from '../../../__tests__/goldenSupport.js';

const { fighterFixtures } = loadFixture('fighters.golden.json');
const names = Object.keys(fighterFixtures);
const fA = fighterFixtures[names[0]];
const fB = fighterFixtures[names[1]];
const OFFICIAL = { sourceUrl: 'https://www.ufc.com/event/ufc-fight-night-example', retrievedAt: '2026-09-12', authority: 'official' };

const save = (boutContext) => buildRoiEntry({
  fA, fB, oddsA: '-150', oddsB: '+130',
  eventName: 'ROUNDTRIP EVENT', eventDate: '2026-09-12',
  modelToggle: 'v2', unitsWagered: 1, boutContext,
});

describe('(2) a newly saved prediction WITH provenance carries both copies', () => {
  it('writes the same citation to top-level boutContext AND capture-time _provenance.boutContext', () => {
    const ctx = normalizeBoutContext({ division: 'Lightweight', isTitleBout: false, scheduledRounds: 3, provenance: OFFICIAL });
    const entry = save(ctx);
    expect(entry.boutContext.provenance).toEqual(OFFICIAL);
    expect(entry._provenance.boutContext.provenance).toEqual(OFFICIAL);
    // and it is immediately exportable — no CI-style offender.
    expect(findProvenanceOffenders([entry])).toEqual([]);
    expect(() => buildExportedCode('UPCOMING_ENTRIES', [entry])).not.toThrow();
  });

  it('a save WITHOUT provenance is blocked at export (the recurring defect, now caught)', () => {
    const ctx = normalizeBoutContext({ division: 'Lightweight', isTitleBout: false, scheduledRounds: 3 });
    const entry = save(ctx);
    expect(entry.boutContext.provenance).toBeNull();
    expect(() => buildExportedCode('UPCOMING_ENTRIES', [entry])).toThrow(ProvenanceExportError);
  });
});

describe('(7) grading preserves id and valid provenance', () => {
  it('createGradedEntry keeps the id and the top-level + capture-time provenance', () => {
    const ctx = normalizeBoutContext({ division: 'Lightweight', isTitleBout: false, scheduledRounds: 3, provenance: OFFICIAL });
    const saved = save(ctx);
    const graded = createGradedEntry(saved, saved.fighterA);
    expect(graded.id).toBe(saved.id);
    expect(graded.actualWinner).toBe(saved.fighterA);
    expect(graded.boutContext.provenance).toEqual(OFFICIAL);
    expect(graded._provenance.boutContext.provenance).toEqual(OFFICIAL);
    expect(findProvenanceOffenders([graded])).toEqual([]);
  });
});
