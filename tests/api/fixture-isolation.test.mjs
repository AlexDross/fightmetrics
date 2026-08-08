// Stage 7 Gate 2 — fixture isolation / order-independence.
//
// Clusters 5 and 6 each accidentally seeded the SHARED WS_PUBLIC through their
// dedicated fixtures, so whichever file ran first set WS_PUBLIC's probability and
// api.test.mjs's complementarity assertion depended on file order. The root fix:
// WS_PUBLIC's probability is centrally owned in helpers (PUBLIC_PROB_A/B) and is
// NOT a parameter of applyFixture, so no file can create or overwrite it.
//
// This file proves the decoupling two ways, and does so WITHOUT relying on any
// other API file having run first:
//   1. WS_PUBLIC always carries the centrally-owned pair, whoever seeded it.
//   2. A test can still verify complementarity for a probability of its OWN
//      explicit choosing, in its own isolated workspace, on a clean database.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, seedComplement, PUBLIC_PROB_A, PUBLIC_PROB_B,
} from './helpers.mjs';

// An explicit probability of THIS file's choosing — deliberately different from
// the centrally-owned WS_PUBLIC value, to show selection still works in isolation.
const compA = 0.6172839506172839;
const compB = 1 - compA;

beforeAll(() => {
  applyFixture();
  seedComplement({ probA: compA, probB: compB });
}, 120_000);

describe('WS_PUBLIC is caller-independent', () => {
  it('reads back the centrally-owned complementary pair over HTTP', async () => {
    const { status, body } = await rpc('fm_read_statistics_input',
                                       { p_slug: 'api-public' });
    expect(status).toBe(200);
    const row = body[0];
    // Whoever's applyFixture ran first, WS_PUBLIC carries PUBLIC_PROB_A/B exactly.
    expect(Object.is(row.fighter_a_prob, PUBLIC_PROB_A)).toBe(true);
    expect(Object.is(row.fighter_b_prob, PUBLIC_PROB_B)).toBe(true);
    expect(row.fighter_a_prob + row.fighter_b_prob).toBe(1);
  });
});

describe('an isolated workspace can select its own explicit probability', () => {
  it('a self-seeded workspace round-trips a DIFFERENT complementary pair', async () => {
    // Sanity: this pair is a genuine float8 complement and is not the shared one.
    expect(compA + compB).toBe(1);
    expect(compA).not.toBe(PUBLIC_PROB_A);

    const { status, body } = await rpc('fm_read_statistics_input',
                                       { p_slug: 'api-complement' });
    expect(status).toBe(200);
    const row = body[0];
    expect(Object.is(row.fighter_a_prob, compA)).toBe(true);
    expect(Object.is(row.fighter_b_prob, compB)).toBe(true);
    expect(row.fighter_a_prob + row.fighter_b_prob).toBe(1);
  });

  it('did not disturb WS_PUBLIC', async () => {
    const { body } = await rpc('fm_read_statistics_input', { p_slug: 'api-public' });
    expect(Object.is(body[0].fighter_a_prob, PUBLIC_PROB_A)).toBe(true);
  });
});
