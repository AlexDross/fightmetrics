// The Simulator no longer collects a bout-context citation.
//
// Three controls were removed from "Save to Upcoming": the bout-context source
// URL, the retrieved-on date, and the authority select. They asked the user to
// vouch for a source at the moment of prediction, which is the wrong moment:
// the citation is a property of the event, not of one matchup, and entering it
// per-bout invited both busywork and half-filled citations. The retrospective
// <ProvenanceExportControls> workflow that replaced it has since been removed
// from the production UI as well (see provenanceExportUiRemoved.test.js); bout
// provenance is no longer collected anywhere in the app. The DOMAIN gate is
// untouched, which is why (3) below still holds.
//
// What must remain true after that removal, and is asserted below:
//   1. the three controls are gone from the Simulator,
//   2. the Simulator still collects and still SAVES division/title/rounds,
//   3. a Simulator save fabricates no provenance: it is an honest null, and the
//      export gate still refuses to copy it until a source is supplied.
//
// (1) and (2)'s wiring are STRUCTURAL assertions for the same reason
// simulatorBoutContextGuard.test.js is: isolation.test.js forbids importing
// App.js, so the component cannot be rendered here. (3) is behavioural, through
// the real writer.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoiEntry } from '../domain/betting/index.js';
import { normalizeBoutContext } from '../domain/boutContext/index.js';
import { buildExportedCode, ProvenanceExportError } from '../domain/provenance/index.js';
import { loadFixture } from './goldenSupport.js';

const APP = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'App.js'),
  'utf8'
);

/** Source of the MatchupSimulator component only. */
const SIMULATOR = (() => {
  const start = APP.indexOf('function MatchupSimulator(');
  expect(start, 'MatchupSimulator not found').toBeGreaterThan(-1);
  const end = APP.indexOf('function ScoutProfile(', start);
  expect(end, 'component after MatchupSimulator not found').toBeGreaterThan(start);
  return APP.slice(start, end);
})();

describe('(1) the three bout-provenance controls no longer render in the Simulator', () => {
  // The visible labels a user would have read.
  it.each(['Bout-context source URL', 'Retrieved on', 'Authority'])(
    'no %s label',
    (label) => {
      expect(SIMULATOR).not.toContain(label);
    }
  );

  // The control ids, which are what a DOM query would have found.
  it.each(['simulator-prov-url', 'simulator-prov-date', 'simulator-prov-authority'])(
    'no #%s control',
    (id) => {
      expect(APP).not.toContain(id);
    }
  );

  it('leaves no dead state, handler or event-binding behind', () => {
    [
      'boutSourceUrl',
      'boutRetrievedAt',
      'boutAuthority',
      'provEnteredFor',
      'bindProvenanceToCurrentEvent',
      'handleBoutSourceUrl',
      'handleBoutRetrievedAt',
      'handleBoutAuthority',
      // Only the Simulator ever scoped a source to the selected event.
      'provenanceForCurrentEvent',
    ].forEach((sym) => {
      expect(APP, `${sym} is still referenced`).not.toContain(sym);
    });
  });

  it('does not assemble provenance into the Simulator boutContext', () => {
    expect(SIMULATOR).not.toContain('normalizeExportProvenance');
    expect(SIMULATOR).not.toContain('provenance:');
  });

  // Superseded: this used to assert that ProvenanceExportControls SURVIVED,
  // because PR #30's removal was scoped to the Simulator. The component has
  // since been removed from the production UI entirely, so the Simulator is no
  // longer the only place without these inputs -- nowhere has them. The
  // UI-wide absence is asserted in provenanceExportUiRemoved.test.js; what
  // remains this file's job is that the Simulator itself stays clean.
  it('no longer routes the user to a retrospective sourcing control', () => {
    expect(APP).not.toContain('ProvenanceExportControls');
    expect(APP).not.toContain('onApplyEventProvenance');
  });
});

describe('(2) the Simulator still collects and saves division / title / rounds', () => {
  it('keeps all three controls', () => {
    [
      ['Bout Division', 'simulator-bout-division'],
      ['Title Bout', 'simulator-title-status'],
      ['Scheduled Rounds', 'simulator-rounds'],
    ].forEach(([label, id]) => {
      expect(SIMULATOR, `${label} label missing`).toContain(label);
      expect(SIMULATOR, `#${id} missing`).toContain(id);
    });
  });

  it('builds boutContext from exactly those three inputs, and nothing else', () => {
    const memo = SIMULATOR.slice(
      SIMULATOR.indexOf('const boutContext = useMemo('),
      SIMULATOR.indexOf('const boutContextIssues')
    );
    expect(memo).toContain('division: boutDivision || null');
    expect(memo).toContain("boutTitleStatus === '' ? null : boutTitleStatus === 'title'");
    expect(memo).toContain("scheduledRounds: boutRounds === '' ? null : Number(boutRounds)");
    // Dependencies match the inputs — no stale event-scoped provenance deps.
    expect(memo).toContain('[boutDivision, boutTitleStatus, boutRounds]');
  });

  it('still hands that boutContext to both save paths', () => {
    ['onSaveToUpcoming?.(entry)', 'onSaveToUpcomingAndOpen?.(entry)'].forEach((h) => {
      const at = SIMULATOR.indexOf(h);
      expect(at, `save handler missing: ${h}`).toBeGreaterThan(-1);
      const button = SIMULATOR.slice(SIMULATOR.lastIndexOf('<button', at), at);
      expect(button, `${h} no longer passes boutContext`).toMatch(/boutContext,/);
    });
  });
});

describe('(3) a new Simulator entry carries real context and no fabricated provenance', () => {
  const { fighterFixtures } = loadFixture('fighters.golden.json');
  const names = Object.keys(fighterFixtures);
  const fA = fighterFixtures[names[0]];
  const fB = fighterFixtures[names[1]];

  // Built exactly the way the Simulator now builds it: the three verified
  // fields, no provenance key at all.
  const simulatorBoutContext = normalizeBoutContext({
    division: 'Lightweight',
    isTitleBout: false,
    scheduledRounds: 3,
  });

  const entry = buildRoiEntry({
    fA,
    fB,
    oddsA: '-150',
    oddsB: '+130',
    eventName: 'SIMULATOR SAVE',
    eventDate: '2026-09-12',
    modelToggle: 'v2',
    unitsWagered: 1,
    boutContext: simulatorBoutContext,
  });

  it('preserves division, title status and scheduled rounds', () => {
    expect(entry.boutContext).toMatchObject({
      division: 'Lightweight',
      isTitleBout: false,
      scheduledRounds: 3,
    });
    // And in the capture-time copy, so a later audit sees the same context.
    expect(entry._provenance.boutContext).toMatchObject({
      division: 'Lightweight',
      isTitleBout: false,
      scheduledRounds: 3,
    });
  });

  it('records provenance as an honest null rather than inventing one', () => {
    expect(entry.boutContext.provenance).toBeNull();
    expect(entry._provenance.boutContext.provenance).toBeNull();
    // Nothing resembling a fabricated citation anywhere in the entry.
    const serialized = JSON.stringify(entry);
    expect(serialized).not.toContain('"authority":"official"');
    expect(serialized).not.toContain('"authority":"secondary"');
    expect(serialized).not.toContain('"sourceUrl"');
    expect(serialized).not.toContain('"retrievedAt"');
  });

  it('is still refused by the export gate until a source is supplied', () => {
    expect(() => buildExportedCode('UPCOMING_ENTRIES', [entry])).toThrow(
      ProvenanceExportError
    );
  });
});
