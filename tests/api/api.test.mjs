// Stage 7 Gate 2 — local API suite.
//
// REAL HTTP against local PostgREST, with anon and authenticated JWT contexts.
// Requires the local stack: `npm run db:start`. No hosted project, no
// production credentials.
import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSchema } from '../../src/data/schemas/entities.mjs';
import {
  rpc, applyFixture, resetClaimWorkspace, scalar, catalogScalar, WS_PUBLIC,
  PUBLIC_PROB_A, PUBLIC_PROB_B,
  USER_MEMBER, USER_OUTSIDER, CLAIMANT_A, CLAIMANT_B,
} from './helpers.mjs';

// WS_PUBLIC's probability is CENTRALLY OWNED in helpers (PUBLIC_PROB_A/B): no
// test file supplies it, so none — in any order — can create or overwrite it.
// This test reads that same deliberately non-trivial pair back over HTTP and
// proves the float8 complement survives the transport. pB is `1 - pA`, which is
// what the domain means by complementary; the point is that the PAIR is
// serialized together and must come back unchanged, summing to exactly 1.
const probA = PUBLIC_PROB_A;
const probB = PUBLIC_PROB_B;

beforeAll(() => { applyFixture(); }, 120_000);

describe('1. the export parses as a real Stage 6 Store', () => {
  it('fm_member_export_store validates against the actual StoreSchema', async () => {
    const res = await rpc('fm_member_export_store', { p_slug: 'api-public' },
                          { as: USER_MEMBER });
    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();

    const parsed = StoreSchema.safeParse(res.body);
    if (!parsed.success) {
      // Report EVERY mismatch by JSON path. The schema is never weakened to
      // make this pass — a failure here means the SQL projection is wrong.
      const report = parsed.error.issues
        .map((i) => `  ${i.path.join('.') || '<root>'}: ${i.code} — ${i.message}`)
        .join('\n');
      throw new Error(
        `fm_member_export_store failed StoreSchema with ${parsed.error.issues.length} issue(s):\n${report}`
      );
    }
    expect(parsed.success).toBe(true);
  });

  it('carries a row in every entity section', async () => {
    const { body } = await rpc('fm_member_export_store', { p_slug: 'api-public' },
                               { as: USER_MEMBER });
    for (const k of ['events', 'bouts', 'predictionRuns', 'predictionSnapshots',
                     'marketSnapshots', 'bettingAssessments', 'trackedPositions',
                     'wagers', 'props', 'parlays']) {
      expect(body[k].length, `${k} is empty`).toBeGreaterThan(0);
    }
    expect(body.parlays[0].legs.length).toBe(1);
  });
});

describe('2. probability complementarity over the transport path', () => {
  it('pA and pB survive float8 and JSON as exact complements', async () => {
    const { status, body } = await rpc('fm_read_statistics_input',
                                       { p_slug: 'api-public' });
    expect(status).toBe(200);
    const row = body[0];

    // Back in JavaScript as real numbers, not strings.
    expect(typeof row.fighter_a_prob).toBe('number');
    expect(typeof row.fighter_b_prob).toBe('number');

    // The values that went in come back bit-identical…
    expect(Object.is(row.fighter_a_prob, probA)).toBe(true);
    expect(Object.is(row.fighter_b_prob, probB)).toBe(true);
    // …and still sum to exactly 1 after the whole round trip.
    expect(row.fighter_a_prob + row.fighter_b_prob).toBe(1);
  });

  it('negative control: a perturbed pair is rejected by the database', () => {
    // One ULP off. The CHECK must refuse it, which is what makes the assertion
    // above meaningful rather than a coincidence of these particular values.
    // This is an EXPECTED REJECTION, deliberately outside normal fixture
    // application — a fixture that aborts is not a test.
    const perturbed = probB + Number.EPSILON;
    expect(probA + perturbed).not.toBe(1);
    let threw = false;
    try {
      scalar(`INSERT INTO app_private.prediction_snapshots (workspace_id, id,
        run_id, bout_id, basis, prob_a, prob_b, winner_corner, captured_at,
        capture_mode)
        VALUES ('${WS_PUBLIC}', '2dd00000-0000-4000-8000-0000000000ff',
                '1700000000002-aaaaaa', '2bb00000-0000-4000-8000-000000000001',
                'v2', ${probA}, ${perturbed}, 'A', now(), 'live');`);
    } catch (e) {
      threw = true;
      expect(String(e.stderr ?? e.message)).toMatch(/prob_complementary|23514/);
    }
    expect(threw, 'the perturbed pair was accepted').toBe(true);
  });
});

describe('3. two-client ownership-claim concurrency', () => {
  it('exactly one of two simultaneous claimants wins', async () => {
    resetClaimWorkspace();

    // Both requests are in flight before either resolves — this is the part a
    // sequential test cannot show. The FOR UPDATE row lock inside
    // app_private.claim_workspace_ownership is what serialises them.
    const [a, b] = await Promise.all([
      rpc('fm_rpc_claim_workspace_ownership', { p_slug: 'api-claim' }, { as: CLAIMANT_A }),
      rpc('fm_rpc_claim_workspace_ownership', { p_slug: 'api-claim' }, { as: CLAIMANT_B }),
    ]);

    const winners = [a, b].filter((r) => r.status === 200);
    const losers = [a, b].filter((r) => r.status !== 200);
    expect(winners.length, `statuses were ${a.status}/${b.status}`).toBe(1);
    expect(losers.length).toBe(1);

    // The loser gets the DOCUMENTED stable error, not a generic failure.
    expect(losers[0].status).toBe(403);
    expect(losers[0].body.code).toBe('42501');
    expect(losers[0].body.message).toMatch(/already claimed/);

    // Exactly one owner row survives.
    expect(scalar(`SELECT count(*) FROM app_private.workspace_members
                    WHERE workspace_id = '11110000-0000-4000-8000-000000000003'
                      AND role = 'owner';`)).toBe('1');

    // And the winner is the one who now resolves as owner.
    const winnerId = winners[0].body[0].workspace_id;
    expect(winnerId).toBe('11110000-0000-4000-8000-000000000003');
  });

  it('a later claim on a now-owned workspace is refused the same way', async () => {
    const res = await rpc('fm_rpc_claim_workspace_ownership',
                          { p_slug: 'api-claim' }, { as: USER_OUTSIDER });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('42501');
  });

  it('an unknown slug stays distinguishable from a claimed one', async () => {
    const res = await rpc('fm_rpc_claim_workspace_ownership',
                          { p_slug: 'no-such-workspace' }, { as: CLAIMANT_A });
    expect(res.body.code).toBe('42704');
    expect(res.status).not.toBe(403);
  });

  it('anon cannot execute the claim RPC at all', async () => {
    // MEASURED: PostgREST returns 401 with the Postgres SQLSTATE, not 404.
    const res = await rpc('fm_rpc_claim_workspace_ownership', { p_slug: 'api-claim' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/permission denied for function/);
  });
});

describe('4. public and member routing over HTTP', () => {
  it('anon reads a public workspace', async () => {
    const res = await rpc('fm_read_events', { p_slug: 'api-public' });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('API Card 2');
  });

  it('a signed-in NON-member reads through the public fallback', async () => {
    const pub = await rpc('fm_read_events', { p_slug: 'api-public' },
                          { as: USER_OUTSIDER });
    expect(pub.status).toBe(200);
    expect(pub.body.length).toBe(1);

    const whoami = await rpc('fm_member_whoami', { p_slug: 'api-public' },
                             { as: USER_OUTSIDER });
    expect(whoami.body[0].role).toBe(null);

    const member = await rpc('fm_member_events', { p_slug: 'api-public' },
                             { as: USER_OUTSIDER });
    expect(member.status).toBe(200);
    expect(member.body.length).toBe(0);
  });

  it('a member reads a PRIVATE workspace the public surface cannot see', async () => {
    const pub = await rpc('fm_read_events', { p_slug: 'api-private' },
                          { as: USER_MEMBER });
    expect(pub.status).toBe(200);
    expect(pub.body.length).toBe(0);

    const whoami = await rpc('fm_member_whoami', { p_slug: 'api-private' },
                             { as: USER_MEMBER });
    expect(whoami.body[0].role).toBe('owner');

    for (const fn of ['fm_member_events', 'fm_member_bouts', 'fm_member_upcoming',
                      'fm_member_props', 'fm_member_parlays',
                      'fm_member_statistics_input']) {
      const res = await rpc(fn, { p_slug: 'api-private' }, { as: USER_MEMBER });
      expect(res.status, `${fn} status`).toBe(200);
      expect(res.body.length, `${fn} returned no rows`).toBeGreaterThan(0);
    }
  });

  it('anon is denied every member function', async () => {
    for (const fn of ['fm_member_events', 'fm_member_roi', 'fm_member_props',
                      'fm_member_parlays', 'fm_member_upcoming',
                      'fm_member_statistics_input', 'fm_member_export_store',
                      'fm_member_whoami']) {
      const res = await rpc(fn, { p_slug: 'api-public' });
      // Status AND the stable SQLSTATE, so a change in either is caught.
      expect(res.status, `${fn} was reachable by anon`).toBe(401);
      expect(res.body.code, `${fn} error code`).toBe('42501');
      expect(res.body.message, `${fn} message`).toMatch(/permission denied for function/);
    }
  });

  it('anon cannot reach app_private tables through PostgREST', async () => {
    const { REST_URL, ANON_KEY } = await import('./helpers.mjs').then((m) => m.status());
    const res = await fetch(`${REST_URL}/workspaces`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    expect(res.status).not.toBe(200);
  });
});

describe('5. the fixture leaves the privilege contract intact', () => {
  it('no membership survives the fixture transaction', () => {
    // catalogScalar, NOT scalar: scalar() grants fm_table_owner itself and would
    // measure its own contamination.
    expect(catalogScalar(`SELECT count(*) FROM pg_auth_members am
                     JOIN pg_roles r ON r.oid = am.roleid
                    WHERE r.rolname LIKE 'fm\\_%'
                      AND (am.set_option OR am.inherit_option);`)).toBe('0');
  });
});
