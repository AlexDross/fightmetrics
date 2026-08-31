import { describe, it, expect } from 'vitest';
import {
  PROVENANCE_REQUIRED_FIELDS,
  isCompleteProvenance,
  missingProvenanceFields,
  normalizeExportProvenance,
  findProvenanceOffenders,
  offendingEvents,
  buildExportedCode,
  applyEventProvenance,
  ProvenanceExportError,
  InvalidProvenanceInputError,
} from '../index.js';
import { normalizeBoutContext } from '../../boutContext/index.js';

const OFFICIAL = { sourceUrl: 'https://www.ufc.com/event/ufc-fight-night-x', retrievedAt: '2026-09-12', authority: 'official' };
// A record shaped like buildRoiEntry output: top-level boutContext + capture-time copy.
const rec = (over = {}) => ({
  id: over.id ?? 'id-1',
  eventName: over.eventName ?? 'UFC Test',
  eventDate: over.eventDate ?? '2026-09-12',
  fighterA: over.fighterA ?? 'A Fighter',
  fighterB: over.fighterB ?? 'B Fighter',
  oddsA: '-150', oddsB: '+130', trackedSide: 'A Fighter',
  boutContext: over.boutContext !== undefined ? over.boutContext
    : { division: 'Lightweight', isTitleBout: false, scheduledRounds: 3, provenance: over.provenance ?? null },
  _provenance: { captureMode: 'live', boutContext: { division: 'Lightweight', isTitleBout: false, scheduledRounds: 3, provenance: over.capProv ?? null } },
  ...over.extra,
});

describe('provenance completeness (mirrors gradingHandoffIntegrity #4)', () => {
  it('required fields are exactly sourceUrl, retrievedAt, authority', () => {
    expect([...PROVENANCE_REQUIRED_FIELDS].sort()).toEqual(['authority', 'retrievedAt', 'sourceUrl']);
  });

  it('accepts a complete official/secondary citation', () => {
    expect(isCompleteProvenance(OFFICIAL)).toBe(true);
    expect(isCompleteProvenance({ ...OFFICIAL, authority: 'secondary' })).toBe(true);
  });

  it('rejects null, partial, bad date, and bad authority', () => {
    expect(isCompleteProvenance(null)).toBe(false);
    expect(isCompleteProvenance({ sourceUrl: 'x' })).toBe(false);
    expect(isCompleteProvenance({ ...OFFICIAL, retrievedAt: '2026-9-1' })).toBe(false);
    expect(isCompleteProvenance({ ...OFFICIAL, authority: 'blog' })).toBe(false);
    expect(missingProvenanceFields({ sourceUrl: 'x' })).toEqual(['retrievedAt', 'authority']);
  });
});

describe('(1) valid source-backed provenance survives normalization', () => {
  it('normalizeBoutContext keeps a complete provenance intact', () => {
    const ctx = normalizeBoutContext({ division: 'Lightweight', isTitleBout: false, scheduledRounds: 3, provenance: OFFICIAL });
    expect(ctx.provenance).toEqual(OFFICIAL);
    expect(isCompleteProvenance(ctx.provenance)).toBe(true);
  });

  it('normalizeExportProvenance never fabricates: incomplete input is rejected', () => {
    expect(normalizeExportProvenance({ sourceUrl: 'x', retrievedAt: '2026-09-12' })).toMatchObject({ ok: false, missing: ['authority'] });
    expect(normalizeExportProvenance(OFFICIAL)).toEqual({ ok: true, provenance: OFFICIAL });
    // extra keys dropped; no current-date/url invented
    expect(normalizeExportProvenance({ ...OFFICIAL, junk: 1 }).provenance).toEqual(OFFICIAL);
  });
});

describe('(3,4) missing/malformed provenance cannot produce paste-ready data', () => {
  it('buildExportedCode throws and names every offender', () => {
    const entries = [rec({ id: 'a', provenance: null }), rec({ id: 'b', fighterA: 'C', provenance: { sourceUrl: 'x' } })];
    let err;
    try { buildExportedCode('UPCOMING_ENTRIES', entries); } catch (e) { err = e; }
    expect(err).toBeInstanceOf(ProvenanceExportError);
    expect(err.offenders.map((o) => o.id)).toEqual(['a', 'b']);
    expect(err.offenders[0].missing).toEqual(['sourceUrl', 'retrievedAt', 'authority']);
    expect(err.offenders[1].missing).toEqual(['retrievedAt', 'authority']);
    expect(err.message).toContain('UFC Test 2026-09-12');
    expect(err.message).toContain('(a)');
  });

  it('a fully-provenanced card exports byte-identically to plain JSON.stringify', () => {
    const entries = [rec({ provenance: OFFICIAL })];
    const out = buildExportedCode('UPCOMING_ENTRIES', entries);
    expect(out).toBe(`export const UPCOMING_ENTRIES = ${JSON.stringify(entries, null, 2)};\n`);
  });

  it('offendingEvents groups offenders by event', () => {
    const entries = [rec({ id: 'a' }), rec({ id: 'b', fighterA: 'C' }), rec({ id: 'c', eventName: 'UFC Other', eventDate: '2026-10-01' })];
    const evs = offendingEvents(entries);
    expect(evs).toEqual(expect.arrayContaining([
      { eventName: 'UFC Test', eventDate: '2026-09-12', count: 2 },
      { eventName: 'UFC Other', eventDate: '2026-10-01', count: 1 },
    ]));
  });
});

describe('(5,6) event-level retrospective repair — top-level only, event-scoped', () => {
  it('sets top-level provenance ONLY on the selected event, capture-time untouched', () => {
    const entries = [
      rec({ id: 'a', eventName: 'UFC Test', eventDate: '2026-09-12' }),
      rec({ id: 'b', eventName: 'UFC Other', eventDate: '2026-10-01' }),
    ];
    const out = applyEventProvenance(entries, { eventName: 'UFC Test', eventDate: '2026-09-12' }, OFFICIAL);
    expect(out[0].boutContext.provenance).toEqual(OFFICIAL);       // repaired
    expect(out[0]._provenance.boutContext.provenance).toBeNull();  // capture-time UNCHANGED
    expect(out[1].boutContext.provenance).toBeNull();              // other event untouched
    expect(out[1]).toBe(entries[1]);                                // untouched record keeps identity
  });

  it('preserves every other field byte-for-byte', () => {
    const entries = [rec({ id: 'a', extra: { oddsA: '-200', notes: 'keep me', unitsWagered: 2 } })];
    const out = applyEventProvenance(entries, { eventName: 'UFC Test', eventDate: '2026-09-12' }, OFFICIAL);
    const { boutContext: b1, ...restBefore } = entries[0];
    const { boutContext: b2, ...restAfter } = out[0];
    expect(restAfter).toEqual(restBefore);
    expect({ ...b2, provenance: null }).toEqual({ ...b1, provenance: null });
  });

  it('never fabricates: incomplete provenance throws InvalidProvenanceInputError', () => {
    expect(() => applyEventProvenance([rec()], { eventName: 'UFC Test', eventDate: '2026-09-12' }, { sourceUrl: 'x' }))
      .toThrow(InvalidProvenanceInputError);
  });
});

describe('(8,9) legacy and historical records remain supported', () => {
  it('a record with NO boutContext is not an offender and exports fine', () => {
    const legacy = { id: 'legacy', eventName: 'UFC Old', eventDate: '2025-01-01', fighterA: 'X', fighterB: 'Y', oddsA: '-110', oddsB: '-110' };
    expect(findProvenanceOffenders([legacy])).toEqual([]);
    expect(() => buildExportedCode('ROI_ENTRIES', [legacy])).not.toThrow();
  });

  it('a repaired record with top-level provenance + null capture-time exports fine', () => {
    // This is exactly the committed Shanghai/Paris shape: authoritative top-level
    // citation, capture-time null (retrospective repair). Must be exportable.
    const repaired = rec({ provenance: OFFICIAL, capProv: null });
    expect(findProvenanceOffenders([repaired])).toEqual([]);
    expect(() => buildExportedCode('ROI_ENTRIES', [repaired])).not.toThrow();
  });

  it('applyEventProvenance leaves no-boutContext records untouched even in the selected event', () => {
    const legacy = { id: 'legacy', eventName: 'UFC Test', eventDate: '2026-09-12', fighterA: 'X', fighterB: 'Y' };
    const out = applyEventProvenance([legacy], { eventName: 'UFC Test', eventDate: '2026-09-12' }, OFFICIAL);
    expect(out[0]).toBe(legacy);
  });
});
