// Stage 7 Gate 2 — RPC cluster 1: tracked-position edits, over real HTTP.
//
// fm_rpc_change_tracked_corner, fm_rpc_amend_tracked_price, fm_rpc_confirm_entry
// and the fm_member_undo_list read surface.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, scalar, catalogScalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

// A DEDICATED workspace with no wager and no other reader, so this file neither
// depends on nor disturbs any other. It passes in any file order.
const SLUG = 'api-rpc';
const POS  = '47700000-0000-4000-8000-000000000001';
const BOUT = '4bb00000-0000-4000-8000-000000000001';
const WS   = '11110000-0000-4000-8000-000000000004';
const ASSESSMENT = '4ff00000-0000-4000-8000-000000000001';
const MARKET = '4cc00000-0000-4000-8000-000000000001';

beforeAll(() => { applyFixture(); }, 120_000);

/**
 * Current revision from whichever member surface holds the row.
 *
 * Reading only fm_member_upcoming returned undefined once the position settled,
 * and an undefined argument is dropped by JSON.stringify — so PostgREST saw a
 * call with no p_expected_revision and 404'd on the missing overload rather than
 * failing the assertion under test.
 */
async function revisionOf() {
  for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
    const res = await rpc(fn, { p_slug: SLUG }, { as: USER_MEMBER });
    const row = (res.body ?? []).find((r) => r.tracked_position_id === POS);
    if (row) return row.revision;
  }
  throw new Error(`no member surface returned position ${POS}`);
}
const undoCount = () =>
  Number(catalogScalar(`SELECT count(*) FROM app_private.undo_log;`));

describe('authorization', () => {
  it('anon cannot execute any cluster-1 RPC', async () => {
    // EXACT argument set per function. Passing every parameter to every
    // function made PostgREST find no matching overload and return 404 before
    // permissions were ever consulted — the test proved nothing.
    const calls = [
      ['fm_rpc_change_tracked_corner',
       { p_slug: SLUG, p_position_id: POS, p_corner: 'B', p_expected_revision: '1' }],
      ['fm_rpc_amend_tracked_price',
       { p_slug: SLUG, p_position_id: POS, p_odds: -200, p_expected_revision: '1' }],
      ['fm_rpc_confirm_entry',
       { p_slug: SLUG, p_position_id: POS, p_expected_revision: '1' }],
    ];
    for (const [fn, args] of calls) {
      const res = await rpc(fn, args);
      expect(res.status, fn).toBe(401);
      expect(res.body.code, fn).toBe('42501');
      expect(res.body.message, fn).toMatch(/permission denied for function/);
    }
  });

  it('a signed-in non-member is refused with the stable role error', async () => {
    const rev = await revisionOf();
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B', p_expected_revision: rev },
      { as: USER_OUTSIDER });
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/insufficient workspace role/);
  });

  it('a VIEWER is refused — read access is not write access', async () => {
    const rev = await revisionOf();
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B', p_expected_revision: rev },
      { as: USER_VIEWER });
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/insufficient workspace role/);
  });

  it('an unknown slug is 42704, distinct from a permission failure', async () => {
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: 'no-such-ws', p_position_id: POS, p_corner: 'B',
        p_expected_revision: '1' }, { as: USER_MEMBER });
    expect(res.body.code).toBe('42704');
  });
});

describe('stale_write carries the CURRENT server revision', () => {
  it('a wrong expected revision is rejected with the marker and the real value', async () => {
    const current = await revisionOf();
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: '999' }, { as: USER_MEMBER });

    expect(res.body.code).toBe('P0001');
    // The repository maps P0001 to `conflict` ONLY with this marker AND a
    // parseable revision, so both must be present…
    expect(res.body.message).toMatch(/\bstale_write\b/);
    expect(res.body.message).toMatch(/revision=\d+/);
    // …and the revision must be the row's ACTUAL current value, never invented.
    expect(res.body.message).toMatch(new RegExp(`revision=${current}\\b`));
  });

  it('a malformed revision is a distinct error, not a conflict', async () => {
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: 'not-a-number' }, { as: USER_MEMBER });
    expect(res.body.code).toBe('22P02');
    expect(res.body.message).not.toMatch(/stale_write/);
  });

  it('a rejected write leaves NO undo record and NO mutation', async () => {
    const before = await revisionOf();
    const undoBefore = undoCount();
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: '999' }, { as: USER_MEMBER });
    expect(await revisionOf()).toBe(before);
    expect(undoCount()).toBe(undoBefore);
  });
});

describe('fm_rpc_change_tracked_corner', () => {
  it('flips the corner, bumps the revision and records undo', async () => {
    const before = await revisionOf();
    const undoBefore = undoCount();

    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: before }, { as: USER_MEMBER });
    expect(res.status).toBe(200);
    // BigInt, never Number: a revision is a decimal string precisely because
    // it can exceed 2^53.
    expect(res.body[0].revision).toBe(String(BigInt(before) + 1n));

    const after = await rpc('fm_member_upcoming', { p_slug: SLUG }, { as: USER_MEMBER });
    const row = after.body.find((r) => r.tracked_position_id === POS);
    expect(row.tracked_corner).toBe('B');
    expect(row.revision).toBe(res.body[0].revision);

    expect(undoCount()).toBe(undoBefore + 1);
    const undo = await rpc('fm_member_undo_list', { p_slug: SLUG }, { as: USER_MEMBER });
    expect(undo.body[0].op).toBe('change_tracked_corner');
    // The vector carries the POST-operation revision of the row touched.
    expect(undo.body[0].revision_vector[POS]).toBe(res.body[0].revision);
  });

  it('rejects a corner outside A/B and writes nothing', async () => {
    const before = await revisionOf();
    const undoBefore = undoCount();
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'C',
        p_expected_revision: before }, { as: USER_MEMBER });
    expect(res.body.code).toBe('23514');
    expect(await revisionOf()).toBe(before);
    expect(undoCount()).toBe(undoBefore);
  });
});

describe('fm_rpc_amend_tracked_price', () => {
  it('APPENDS a market and repoints only the position', async () => {
    const before = await revisionOf();
    const frozen = catalogScalar(
      `SELECT market_snapshot_id FROM app_private.betting_assessments
        WHERE id = '${ASSESSMENT}';`);
    const marketsBefore = Number(catalogScalar(
      `SELECT count(*) FROM app_private.market_snapshots;`));

    const res = await rpc('fm_rpc_amend_tracked_price',
      { p_slug: SLUG, p_position_id: POS, p_odds: -220,
        p_expected_revision: before }, { as: USER_MEMBER });
    expect(res.status).toBe(200);

    // A NEW snapshot exists…
    expect(Number(catalogScalar(`SELECT count(*) FROM app_private.market_snapshots;`)))
      .toBe(marketsBefore + 1);
    // …the assessment's frozen market is UNCHANGED…
    expect(catalogScalar(
      `SELECT market_snapshot_id FROM app_private.betting_assessments
        WHERE id = '${ASSESSMENT}';`)).toBe(frozen);
    // …and only the position moved.
    expect(res.body[0].market_snapshot_id).not.toBe(frozen);

    const undo = await rpc('fm_member_undo_list', { p_slug: SLUG }, { as: USER_MEMBER });
    expect(undo.body[0].op).toBe('amend_tracked_price');
    // The appended snapshot is what an undo would have to remove.
    // CREATED, not absent: undo must REMOVE the appended snapshot.
    expect(undo.body[0].created_ids[0].id).toBe(res.body[0].market_snapshot_id);
    expect(undo.body[0].absent_ids).toEqual([]);
  });

  it('rejects |odds| < 100 and appends nothing', async () => {
    const before = await revisionOf();
    const marketsBefore = Number(catalogScalar(
      `SELECT count(*) FROM app_private.market_snapshots;`));
    const res = await rpc('fm_rpc_amend_tracked_price',
      { p_slug: SLUG, p_position_id: POS, p_odds: 50,
        p_expected_revision: before }, { as: USER_MEMBER });
    expect(res.body.code).toBe('23514');
    expect(Number(catalogScalar(`SELECT count(*) FROM app_private.market_snapshots;`)))
      .toBe(marketsBefore);
  });
});

describe('fm_rpc_confirm_entry', () => {
  it('confirms a pending review and stamps a time', async () => {
    const before = await revisionOf();
    const res = await rpc('fm_rpc_confirm_entry',
      { p_slug: SLUG, p_position_id: POS, p_expected_revision: before },
      { as: USER_MEMBER });
    expect(res.status).toBe(200);
    expect(catalogScalar(
      `SELECT review_status FROM app_private.tracked_positions WHERE id = '${POS}';`))
      .toBe('confirmed');
    expect(catalogScalar(
      `SELECT confirmed_at IS NOT NULL FROM app_private.tracked_positions
        WHERE id = '${POS}';`)).toBe('t');
  });

  it('refuses to confirm twice — performing BOTH calls itself', async () => {
    // Order-independent: this test creates the pending state it needs rather
    // than inheriting it from whichever test ran before.
    scalar(`UPDATE app_private.tracked_positions
               SET review_status = 'pending', review_reason = 'autoGenerated',
                   confirmed_at = NULL
             WHERE id = '${POS}';`);
    const first = await rpc('fm_rpc_confirm_entry',
      { p_slug: SLUG, p_position_id: POS, p_expected_revision: await revisionOf() },
      { as: USER_MEMBER });
    expect(first.status).toBe(200);

    const second = await rpc('fm_rpc_confirm_entry',
      { p_slug: SLUG, p_position_id: POS, p_expected_revision: await revisionOf() },
      { as: USER_MEMBER });
    expect(second.body.code).toBe('23514');
    expect(second.body.message).toMatch(/not pending/);
  });
});

describe('undo records are creator-only and scoped', () => {
  it('another member does not see the first member\'s undo entries', async () => {
    // Creates the undo record it asserts on, rather than depending on a prior test.
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'A',
        p_expected_revision: await revisionOf() }, { as: USER_MEMBER });
    const mine = await rpc('fm_member_undo_list', { p_slug: SLUG }, { as: USER_MEMBER });
    expect(mine.body.length).toBeGreaterThan(0);
    const theirs = await rpc('fm_member_undo_list', { p_slug: SLUG }, { as: USER_VIEWER });
    // a viewer is not owner/editor, so the surface yields nothing at all
    expect(theirs.body.length).toBe(0);
  });

  it('anon cannot read the undo log', async () => {
    const res = await rpc('fm_member_undo_list', { p_slug: SLUG });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('42501');
  });

  it('non-vacuity control: the undo surface DOES return rows when it should', async () => {
    const before = undoCount();
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await revisionOf() }, { as: USER_MEMBER });
    expect(undoCount()).toBe(before + 1);
    const mine = await rpc('fm_member_undo_list', { p_slug: SLUG }, { as: USER_MEMBER });
    expect(mine.body.length).toBeGreaterThan(0);
  });
});

describe('revision parsing has no bypass', () => {
  const cases = [
    ['null', null],
    ['max + 1', '9223372036854775808'],
    ['19 nines', '9999999999999999999'],
    ['malformed', 'twelve'],
  ];
  for (const [label, value] of cases) {
    it(`rejects a ${label} revision with 22P02 and writes nothing`, async () => {
      const before = await revisionOf();
      const undoBefore = undoCount();
      const res = await rpc('fm_rpc_change_tracked_corner',
        { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
          p_expected_revision: value }, { as: USER_MEMBER });
      expect(res.body.code, label).toBe('22P02');
      expect(res.body.message, label).not.toMatch(/stale_write/);
      expect(await revisionOf(), label).toBe(before);
      expect(undoCount(), label).toBe(undoBefore);
    });
  }

  it('stale beats validation, matching the in-memory contract', async () => {
    // Both wrong: a stale revision AND an invalid corner. The caller is told to
    // re-read, not that its input is bad — the same precedence guardWrite uses.
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'Z',
        p_expected_revision: '999' }, { as: USER_MEMBER });
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/stale_write/);
  });
});

describe('settled positions recompute atomically', () => {
  // No redundant "set the position open" UPDATE. That queued a deferred event
  // carrying NEW.status = 'open', which later evaluated against the now-resolved
  // bout and correctly failed — an artefact of the fixture, not of the trigger.
  // The bout is resolved and every dependent row recomputed in one statement.
  const grade = (outcome) => scalar(`
    UPDATE app_private.bouts
       SET result_status='resolved', result_outcome='${outcome}', result_method='DEC'
     WHERE id='${BOUT}';
    SELECT app_private.recompute_position_settlement('${WS}', '${POS}');`);

  // Full restoration: bout pending, position open and repointed at its ORIGINAL
  // market, review state consistent. Every dependent row is returned to open
  // before the bout becomes pending. This aggregate has no wager by design.
  const reopen = () => scalar(`
    UPDATE app_private.bouts SET result_status='pending', result_outcome=NULL,
           result_method=NULL
     WHERE id='${BOUT}';
    UPDATE app_private.market_snapshots SET odds_a = -150, odds_b = 130
     WHERE id='${MARKET}';
    UPDATE app_private.tracked_positions
       SET corner='A', market_snapshot_id='${MARKET}',
           settlement_status='open', settlement_outcome=NULL, financial_status=NULL,
           financial_reason=NULL, profit_units=NULL, settled_at=NULL,
           review_status='notRequired', review_reason=NULL, confirmed_at=NULL
     WHERE id='${POS}';`);

  // COALESCE to a sentinel: a bare NULL prints as an empty line, which the
  // scalar helper filters away and returns undefined for.
  const profit = () => catalogScalar(
    `SELECT coalesce(profit_units::text, 'NULL')
       FROM app_private.tracked_positions WHERE id='${POS}';`);
  const corner = () => catalogScalar(
    `SELECT corner FROM app_private.tracked_positions WHERE id='${POS}';`);

  it('OPEN: an edit leaves the position open with no financial result', async () => {
    reopen();
    const res = await rpc('fm_rpc_amend_tracked_price',
      { p_slug: SLUG, p_position_id: POS, p_odds: -120,
        p_expected_revision: await revisionOf() }, { as: USER_MEMBER });
    expect(res.status).toBe(200);
    expect(catalogScalar(
      `SELECT settlement_status FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('open');
    expect(profit()).toBe('NULL');
  });

  it('SETTLED WIN: amending the price recomputes profit at the new odds', async () => {
    reopen();
    grade('A');
    // -150 -> -120. Node: 1 * ((1 + 100/120) - 1) = 0.8333333333333335
    const res = await rpc('fm_rpc_amend_tracked_price',
      { p_slug: SLUG, p_position_id: POS, p_odds: -120,
        p_expected_revision: await revisionOf() }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(catalogScalar(
      `SELECT settlement_outcome FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('won');
    expect(catalogScalar(
      `SELECT encode(pg_catalog.float8send(profit_units),'hex')
         FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('3feaaaaaaaaaaaac');   // 0.8333333333333335, dumped from Node
  });

  it('SETTLED LOSS: flipping the corner flips outcome and profit', async () => {
    reopen();
    grade('A');
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await revisionOf() }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(corner()).toBe('B');
    expect(catalogScalar(
      `SELECT settlement_outcome FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('lost');
    expect(profit()).toBe('-1');
  });

  it('UNPRICED: the selected corner without odds becomes uncomputable', async () => {
    reopen();
    scalar(`UPDATE app_private.market_snapshots SET odds_b = NULL
             WHERE id = (SELECT market_snapshot_id FROM app_private.tracked_positions
                          WHERE id='${POS}');`);
    grade('A');
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await revisionOf() }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(catalogScalar(
      `SELECT financial_status FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('uncomputable');
    expect(catalogScalar(
      `SELECT financial_reason FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('missingSelectedCornerOdds');
    reopen();
  });

  it('the assessment stays FROZEN through every recompute', () => {
    expect(catalogScalar(
      `SELECT market_snapshot_id FROM app_private.betting_assessments
        WHERE id='${ASSESSMENT}';`))
      .toBe(MARKET);
  });
});
