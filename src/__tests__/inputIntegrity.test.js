import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Kept SEPARATE from fixtureIntegrity.test.js on purpose: that file asserts the
// fixtures directory holds EXACTLY the seven approved golden files, so the
// statistics input must not live there.
//
// This input is a Stage 4 artifact, not part of the Stage 0 approved capture.
// It is still pinned by hash, because the statistics tests are only meaningful
// if their input cannot drift.
export const INPUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'inputs');
const INPUT_FILE = path.join(INPUT_DIR, 'statistics.input.json');
const CONTEXT_FILE = path.join(INPUT_DIR, 'model-context.input.json');

const RAW_SHA256 = 'abc4f2b6d3e6f366bcf0e91670fd2a66d11a664bfb710305c78201451018208c';
const CANONICAL_ENTRIES_SHA256 = '7a95e185983c88334ac6bf52fba663b659233e55f96c21481a38b15db625cb00';

const CONTEXT_RAW_SHA256 = '8afda57cc3a7074282e6f189af1de011b130a8c9290cb790806ffacc25ce5acb';
const CONTEXT_CANONICAL_SHA256 = 'a4be41895c57e1fe6c486d99659188a14e0f617774c3d285e0f0efb2047cd8d9';

const EXPECTED_INPUT_FILES = ['model-context.input.json', 'statistics.input.json'];

describe('frozen statistics input integrity', () => {
  it('raw bytes match the recorded hash', () => {
    const bytes = fs.readFileSync(INPUT_FILE);
    expect(crypto.createHash('sha256').update(bytes).digest('hex')).toBe(RAW_SHA256);
  });

  it('the entries array matches its recorded canonical hash', () => {
    const input = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    const canonical = JSON.stringify(input.entries);
    expect(crypto.createHash('sha256').update(canonical, 'utf8').digest('hex'))
      .toBe(CANONICAL_ENTRIES_SHA256);
    expect(input.canonicalEntriesSha256).toBe(CANONICAL_ENTRIES_SHA256);
  });

  it('carries the shape and provenance the statistics tests rely on', () => {
    const input = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    expect(input.entryCount).toBe(153);
    expect(input.entries.length).toBe(153);
    expect(input.sinceEntryCount).toBe(70);
    expect(input.since).toBe('2026-05-23');
    expect(input.prospectNames).toEqual(['Darya Zheleznyakova']);
    expect(input.provenance.sourceCommit).toBe('42e0c97');
    expect(input.provenance.roiDataBlob).toBe('6a6bb3f53ab1');
    expect(input.provenance.resultsReproducedExactly).toBe(18);
    expect(Array.isArray(input.derivation)).toBe(true);
  });

  it('the since-window filter reproduces the recorded count', () => {
    const input = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    const since = input.entries.filter((e) => (e.eventDate || '') >= input.since);
    expect(since.length).toBe(input.sinceEntryCount);
  });
});

// The frozen model normalisation context. Production does NOT read this file --
// computeMatchupEdges defaults to DIVISION_UFC_AVERAGES derived from the live
// _D2 roster, so the app keeps adapting to fighter-data refreshes. These
// averages exist only so the characterisation tests hold normalisation fixed.
describe('frozen model-context input integrity', () => {
  it('raw bytes match the recorded hash', () => {
    const bytes = fs.readFileSync(CONTEXT_FILE);
    expect(crypto.createHash('sha256').update(bytes).digest('hex')).toBe(CONTEXT_RAW_SHA256);
  });

  it('the division averages match their recorded canonical hash', () => {
    const ctx = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf8'));
    const canonical = JSON.stringify(ctx.divisionAverages);
    expect(crypto.createHash('sha256').update(canonical, 'utf8').digest('hex'))
      .toBe(CONTEXT_CANONICAL_SHA256);
    expect(ctx.canonicalContextSha256).toBe(CONTEXT_CANONICAL_SHA256);
  });

  it('round-trips through JSON without losing float precision', () => {
    // The canonical hash above is taken over the PARSED values re-serialised,
    // so it only holds if every double survives the write/read cycle exactly.
    // Asserting it explicitly because a silent precision loss here would shift
    // every golden while every hash still matched its own reserialisation.
    const ctx = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf8'));
    const reparsed = JSON.parse(JSON.stringify(ctx.divisionAverages));
    for (const [division, avgs] of Object.entries(ctx.divisionAverages)) {
      for (const [k, v] of Object.entries(avgs)) {
        expect(Object.is(reparsed[division][k], v), `${division}.${k} lost precision`).toBe(true);
      }
    }
  });

  it('carries the shape and provenance the model tests rely on', () => {
    const ctx = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf8'));
    expect(ctx.divisionCount).toBe(13);
    expect(ctx.divisions.length).toBe(13);
    expect(Object.keys(ctx.divisionAverages).length).toBe(13);
    expect(ctx.provenance.sourceCommit).toBe('9f98a53');
    expect(ctx.provenance.rosterFighterCount).toBe(2272);
    expect(ctx.provenance.derivedFrom).toContain('DIVISION_UFC_AVERAGES');
    expect(Array.isArray(ctx._readme)).toBe(true);

    // Every division carries the full set of averaged stats the model reads.
    for (const d of ctx.divisions) {
      expect(Object.keys(ctx.divisionAverages[d]).sort())
        .toEqual(['asa', 'asl', 'asp', 'atl', 'atp', 'crd', 'elo']);
    }
  });
});

describe('the inputs directory', () => {
  it('contains exactly the expected input files', () => {
    // Mirrors fixtureIntegrity's exactly-seven assertion: an unpinned input
    // file appearing here would be an unhashed dependency of the frozen tests.
    expect(fs.readdirSync(INPUT_DIR).sort()).toEqual(EXPECTED_INPUT_FILES);
  });
});
