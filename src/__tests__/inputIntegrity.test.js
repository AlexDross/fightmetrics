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

const RAW_SHA256 = 'abc4f2b6d3e6f366bcf0e91670fd2a66d11a664bfb710305c78201451018208c';
const CANONICAL_ENTRIES_SHA256 = '7a95e185983c88334ac6bf52fba663b659233e55f96c21481a38b15db625cb00';

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
