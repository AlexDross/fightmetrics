// The developer-facing bout-provenance export workflow is gone from the
// production UI.
//
// What was removed, from BOTH the Upcoming and the ROI page: the gated "Copy
// Updated upcomingData.js" / "Copy Updated roiData.js" buttons, the
// "record(s) ... need a verified source" warning, and the event-level
// provenance-repair form behind it (Source URL, Retrieved date, Authority,
// "Apply source to this event"). These were administrative tools for
// regenerating committed data files by hand -- not prediction-model inputs --
// and they had no business in a user-facing app. PR #30 had already taken the
// equivalent inputs out of the Simulator; this finishes the job.
//
// What was deliberately NOT removed: the src/domain/provenance module, its
// validation and export gate, applyEventProvenance, and every stored
// provenance record. Historical data and the Gate 5 seed path still depend on
// them. Section (6) pins that distinction down behaviourally -- the domain gate
// must still refuse an unsourced record even though no UI can now supply one.
//
// Change scope (which files this edit is allowed to touch) is deliberately NOT
// asserted here. A runtime `git diff` check reads the working tree, so it goes
// vacuous the moment the change is committed and cannot see untracked files at
// all; that belongs in pre-commit and review verification instead.
//
// TESTING NOTE. These are structural assertions against App.js source rather
// than rendered-DOM assertions, which is the established pattern in this repo
// for App.js UI (see simulatorProvenanceControlsRemoved.test.js and
// simulatorBoutContextGuard.test.js): isolation.test.js forbids any test from
// importing App.js, and no React renderer is a project dependency. To avoid the
// weakness of a bare whole-file text search -- which can pass while the UI is
// still reachable through some other component -- every check below is scoped
// to a named component's own source slice, AND the component definition and its
// JSX element name are asserted absent file-wide, so no surviving caller can
// reach it. Section (6) is fully behavioural.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildExportedCode,
  ProvenanceExportError,
  applyEventProvenance,
  offendingEvents,
} from '../domain/provenance/index.js';
import { normalizeBoutContext } from '../domain/boutContext/index.js';
import { buildRoiEntry } from '../domain/betting/index.js';
import { loadFixture } from './goldenSupport.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(HERE, '..');
const APP = fs.readFileSync(path.join(SRC_DIR, 'App.js'), 'utf8');

/**
 * Source of exactly one top-level component, from its `function Name(` to the
 * next top-level `function ` at column 0. Slicing means an assertion cannot be
 * satisfied by a coincidental match somewhere else in a 9k-line file.
 */
function componentSource(name) {
  const start = APP.indexOf(`function ${name}(`);
  expect(start, `component ${name} not found in App.js`).toBeGreaterThan(-1);
  const next = APP.slice(start + 1).search(/^function [A-Za-z]/m);
  expect(next, `no component follows ${name}`).toBeGreaterThan(-1);
  return APP.slice(start, start + 1 + next);
}

const UPCOMING = componentSource('UpcomingEventTab');
const ROI = componentSource('ROITab');
const SIMULATOR = componentSource('MatchupSimulator');

// The user-visible strings and accessible names of the removed workflow.
const REMOVED_PROVENANCE_UI = [
  'need a verified source',
  'Source URL',
  'Apply source to this event',
  'aria-label="Retrieved date"',
  'Retrieved on',
  'aria-label="Authority"',
];

describe('(1) Upcoming no longer renders or wires the provenance export workflow', () => {
  it('has no "Copy Updated upcomingData.js" control', () => {
    expect(UPCOMING).not.toContain('Copy Updated upcomingData.js');
    // Not anywhere else either -- including the delete-confirmation copy that
    // used to name it as the user's undo path.
    expect(APP).not.toContain('Copy Updated upcomingData.js');
  });

  it.each(REMOVED_PROVENANCE_UI)('does not render %s', (needle) => {
    expect(UPCOMING).not.toContain(needle);
  });

  it('does not render the export control or accept its callback', () => {
    expect(UPCOMING).not.toContain('ProvenanceExportControls');
    expect(UPCOMING).not.toContain('onApplyEventProvenance');
  });

  it('no longer wires an UPCOMING_ENTRIES export call', () => {
    expect(UPCOMING).not.toContain('varName="UPCOMING_ENTRIES"');
    expect(UPCOMING).not.toContain('UPCOMING_ENTRIES');
    expect(UPCOMING).not.toContain('buildExportedCode');
  });
});

describe('(2) ROI no longer renders or wires the provenance export workflow', () => {
  it('has no "Copy Updated roiData.js" control', () => {
    expect(ROI).not.toContain('Copy Updated roiData.js');
    expect(APP).not.toContain('Copy Updated roiData.js');
  });

  it.each(REMOVED_PROVENANCE_UI)('does not render %s', (needle) => {
    expect(ROI).not.toContain(needle);
  });

  it('does not render the export control or accept its callback', () => {
    expect(ROI).not.toContain('ProvenanceExportControls');
    expect(ROI).not.toContain('onApplyEventProvenance');
  });

  it('no longer wires an ROI_ENTRIES export call', () => {
    // The identifier survives in a comment noting that the props exporter
    // stays isolated from ROI_ENTRIES; what must be gone is the export call.
    expect(ROI).not.toContain('varName="ROI_ENTRIES"');
    expect(ROI).not.toContain('buildExportedCode');
  });
});

describe('(2b) the component and its plumbing are gone file-wide, not just unrendered', () => {
  // The point of these: a scoped absence above could still be defeated by
  // another component mounting the workflow. Nothing can -- the definition,
  // the element name, the App-level handlers and the imports are all absent.
  it('defines no ProvenanceExportControls component', () => {
    expect(APP).not.toContain('function ProvenanceExportControls');
    expect(APP).not.toContain('ProvenanceExportControls');
    expect(APP).not.toContain('<ProvenanceExportControls');
  });

  it('leaves no dead handler, prop or state behind', () => {
    [
      'onApplyEventProvenance',
      'handleApplyUpcomingProvenance',
      'handleApplyRoiProvenance',
      'offendingEvents',
      'normalizeExportProvenance',
      'ProvenanceExportError',
      'InvalidProvenanceInputError',
      'PROVENANCE_REQUIRED_FIELDS',
      'PROVENANCE_AUTHORITIES',
    ].forEach((sym) => {
      expect(APP, `${sym} is still referenced in App.js`).not.toContain(sym);
    });
  });

  it('imports nothing from the provenance domain any more', () => {
    expect(APP).not.toMatch(/from\s*'\.\/domain\/provenance'/);
    expect(APP).not.toContain('applyEventProvenance');
    expect(APP).not.toContain('buildExportedCode');
  });

  it('drops no other export button on the way out', () => {
    // Props and parlays have their own ungated exporters; they never depended
    // on the provenance component and must survive.
    expect(APP).toContain('buildPropsExportedCode');
    expect(APP).toContain('buildParlayExportedCode');
    expect(UPCOMING).toContain('Copy Updated propPicksData.js');
    expect(UPCOMING).toContain('Copy Updated parlayData.js');
    expect(ROI).toContain('Copy Updated propPicksData.js');
    expect(ROI).toContain('Copy Updated parlayData.js');
  });
});

describe('(3) the Simulator still does not expose the PR #30 inputs', () => {
  it.each(['Bout-context source URL', 'Retrieved on', 'Authority'])(
    'no %s control',
    (label) => {
      expect(SIMULATOR).not.toContain(label);
    }
  );

  it.each(['simulator-prov-url', 'simulator-prov-date', 'simulator-prov-authority'])(
    'no #%s id anywhere',
    (id) => {
      expect(APP).not.toContain(id);
    }
  );

  it('still collects and saves division / title / rounds', () => {
    [
      ['Bout Division', 'simulator-bout-division'],
      ['Title Bout', 'simulator-title-status'],
      ['Scheduled Rounds', 'simulator-rounds'],
    ].forEach(([label, id]) => {
      expect(SIMULATOR, `${label} missing`).toContain(label);
      expect(SIMULATOR, `#${id} missing`).toContain(id);
    });
  });
});

describe('(4) the user-facing Upcoming workflow is intact', () => {
  it('still renders pending fight cards and the sub-tab nav', () => {
    expect(UPCOMING).toContain("{ id: 'fights', label: 'Upcoming Fights' }");
    expect(UPCOMING).toContain("{ id: 'props', label: 'Props' }");
    expect(UPCOMING).toContain("{ id: 'parlays', label: 'Parlays' }");
    expect(UPCOMING).toContain('Save matchups from the Simulator to track pending picks.');
  });

  it('still wires grading and delete controls', () => {
    ['onGrade', 'onDelete', 'onUpdateEntry'].forEach((prop) => {
      expect(UPCOMING, `${prop} no longer wired`).toContain(prop);
    });
    expect(UPCOMING).toContain('Delete this pick?');
  });

  it('still offers units staked', () => {
    expect(UPCOMING).toContain('UnitsStakedInput');
    expect(APP).toContain('function UnitsStakedInput(');
  });

  it('still shows division / title / round metadata', () => {
    // Rendered via the module-level helper, which is the real wiring to assert.
    expect(UPCOMING).toContain('entryContextSuffix(entry)');
    expect(APP).toContain(
      'const entryContextSuffix = (entry) => describeBoutContextSuffix(entry?.boutContext ?? null);'
    );
    expect(APP).toMatch(/describeTitleStatus/);
    expect(APP).toMatch(/describeScheduledRounds/);
  });

  it('still wires props and parlays', () => {
    [
      'onAddPropPick',
      'onGradePropPick',
      'onDeletePropPick',
      'onAddParlay',
      'onDeleteParlay',
      'parlayEntries',
      'propPicks',
    ].forEach((prop) => {
      expect(UPCOMING, `${prop} no longer wired`).toContain(prop);
    });
  });
});

describe('(5) ROI keeps its grading / history / statistical functionality', () => {
  it('still wires grading, update, delete and clear', () => {
    ['onUpdateEntry', 'onDeleteEntry', 'onClearEntries', 'confirmedByUser'].forEach((prop) => {
      expect(ROI, `${prop} no longer wired`).toContain(prop);
    });
    expect(ROI).toContain('Confirm All');
    expect(ROI).toContain('Clear All');
    expect(ROI).toContain('Delete this graded pick?');
  });

  it('still filters history by date', () => {
    expect(ROI).toContain('filterSince');
    expect(ROI).toContain('setFilterSince');
    expect(ROI).toContain('roi-since');
  });

  it('still computes its statistics', () => {
    expect(ROI).toMatch(/evaluatedEntries|summary/);
  });

  it('warns that a clear is unrecoverable, without naming a removed button', () => {
    expect(ROI).toContain('This is NOT recoverable.');
    expect(ROI).not.toContain("you've already run");
  });
});

describe('(6) the provenance DOMAIN survived the UI removal', () => {
  // The whole risk of this change is deleting domain behaviour to make the UI
  // removal tidy. It is asserted behaviourally, through the real module.
  const { fighterFixtures } = loadFixture('fighters.golden.json');
  const names = Object.keys(fighterFixtures);

  const unsourced = buildRoiEntry({
    fA: fighterFixtures[names[0]],
    fB: fighterFixtures[names[1]],
    oddsA: '-150',
    oddsB: '+130',
    eventName: 'DOMAIN GATE CHECK',
    eventDate: '2026-09-12',
    modelToggle: 'v2',
    unitsWagered: 1,
    boutContext: normalizeBoutContext({
      division: 'Lightweight',
      isTitleBout: false,
      scheduledRounds: 3,
    }),
  });

  it('still refuses to export a record with no verified source', () => {
    expect(() => buildExportedCode('UPCOMING_ENTRIES', [unsourced])).toThrow(
      ProvenanceExportError
    );
    expect(() => buildExportedCode('ROI_ENTRIES', [unsourced])).toThrow(
      ProvenanceExportError
    );
  });

  it('still reports offending events', () => {
    const offenders = offendingEvents([unsourced]);
    expect(offenders).toHaveLength(1);
    expect(offenders[0]).toMatchObject({ eventName: 'DOMAIN GATE CHECK', count: 1 });
  });

  it('still applies event provenance and then exports cleanly', () => {
    const repaired = applyEventProvenance(
      [unsourced],
      { eventName: 'DOMAIN GATE CHECK', eventDate: '2026-09-12' },
      {
        sourceUrl: 'https://www.ufc.com/event/ufc-999',
        retrievedAt: '2026-09-01',
        authority: 'official',
      }
    );
    expect(repaired[0].boutContext.provenance).toMatchObject({ authority: 'official' });
    // Capture-time audit copy is still left alone.
    expect(repaired[0]._provenance.boutContext.provenance).toBeNull();
    expect(() => buildExportedCode('UPCOMING_ENTRIES', repaired)).not.toThrow();
  });
});
