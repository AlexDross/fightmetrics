import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { FIXTURE_DIR } from './goldenSupport.js';

// The approved Stage 0 fixture bytes, as moved verbatim from baseline/fixtures
// in 5777f68 (git mv; all seven landed as pure renames).
//
// These hashes previously lived only in a commit message, which meant that once
// verifyFixtures.cjs is removed in commit 2 an accidental edit -- a reformat, a
// stray pretty-print, an editor rewriting a line ending -- would silently
// become the new expectation. This turns the already-approved byte identity
// into an enforced contract.
//
// This is NOT regeneration. If one of these fails, the fixture changed; restore
// it from git rather than updating the hash.
const APPROVED = {
  'characterisation.json':    '388ca4f3b74e499342caa7dd05a8bb90da3c03c4a600085c9ac13f2f65fe3921',
  'entries.golden.json':      '827c1ffd67b9d5ea1eee5a54947b317f57350031d74779fb87db58d79567fbca',
  'fightHistory.hashes.json': '7115625d8e979b5f394a303501e3bfb708bf3115d324306c507369a13dac7514',
  'fighters.golden.json':     '9de29d14dafee0694bc747bbd003a106120c27756c4688858c5ec69882816c2c',
  'model.golden.json':        '1a007e2e91305d297088f6153c209f50a45ad816ab196763c6db3041da14894a',
  'roster.manifest.json':     'ba9aeb0a184aa976a966bcc3b03ab5ee2c446d17999ed64136766304bd2d7519',
  'statistics.golden.json':   '04cb4256e1effa624d13dce2681c959d327f12d79554e47c68c181e28d265100',
};

const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

describe('approved fixture byte integrity', () => {
  for (const [name, expected] of Object.entries(APPROVED)) {
    it(`${name} is byte-identical to the approved capture`, () => {
      const file = path.join(FIXTURE_DIR, name);
      expect(fs.existsSync(file), `missing fixture ${name}`).toBe(true);
      expect(sha256(file), `${name} has been modified — restore it from git`).toBe(expected);
    });
  }

  it('the fixture directory contains exactly the seven approved files', () => {
    const present = fs.readdirSync(FIXTURE_DIR).filter((f) => f.endsWith('.json')).sort();
    expect(present).toEqual(Object.keys(APPROVED).sort());
  });
});
