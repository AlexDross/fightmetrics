// Stage 7 Gate 2 — RPC cluster 2: bout lifecycle, over real HTTP.
//
// fm_rpc_grade_bout, fm_rpc_return_bout_to_pending, and the deferred
// fm_member_wagers_by_bout read needed to assemble the revision vector.
//
// Its own workspace and aggregate, so it neither depends on nor disturbs any
// other file and passes in any order.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, scalar, catalogScalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

const SLUG = 'api-bout';
const WS   = '11110000-0000-4000-8000-000000000005';
const BOUT = '5bb00000-0000-4000-8000-000000000001';
const POS  = '57700000-0000-4000-8000-000000000001';
const WAG  = '59900000-0000-4000-8000-000000000001';

const probA = 0.5432109876543210;
beforeAll(() => { applyFixture({ probA, probB: 1 - probA }); }, 120_000);

/** The complete dependency set, assembled the way the UI must: bout + every
 *  tracked position + every wager, each read from a member surface. */
async function vector() {
  const bout = (await rpc('fm_member_bouts', { p_slug: SLUG }, { as: USER_MEMBER }))
    .body.find((b) => b.id === BOUT);
  const positions = [];
  for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
    const res = await rpc(fn, { p_slug: SLUG }, { as: USER_MEMBER });
    for (const r of res.body ?? []) {
      if (r.bout_id === BOUT) positions.push({ id: r.tracked_position_id, revision: r.revision });
    }
  }
  const wagers = (await rpc('fm_member_wagers_by_bout',
    { p_slug: SLUG, p_bout_id: BOUT }, { as: USER_MEMBER })).body
    .map((w) => ({ id: w.id, revision: w.revision }));
  return [{ id: bout.id, revision: bout.revision }, ...positions, ...wagers];
}

const grade = (v, outcome = 'A', method = 'DEC') =>
  rpc('fm_rpc_grade_bout', { p_slug: SLUG, p_bout_id: BOUT, p_outcome: outcome,
                             p_method: method, p_revisions: v }, { as: USER_MEMBER });
const unGrade = (v) =>
  rpc('fm_rpc_return_bout_to_pending', { p_slug: SLUG, p_bout_id: BOUT,
                                         p_revisions: v }, { as: USER_MEMBER });

const state = () => ({
  bout: catalogScalar(`SELECT result_status FROM app_private.bouts WHERE id='${BOUT}';`),
  pos: catalogScalar(
    `SELECT coalesce(settlement_status,'-')||'/'||coalesce(settlement_outcome,'-')
       ||'/'||coalesce(profit_units::text,'-')
       FROM app_private.tracked_positions WHERE id='${POS}';`),
  wager: catalogScalar(
    `SELECT coalesce(settlement_status,'-')||'/'||coalesce(settlement_outcome,'-')
       ||'/'||coalesce(profit_units::text,'-')
       FROM app_private.wagers WHERE id='${WAG}';`),
});
const undoCount = () =>
  Number(catalogScalar(`SELECT count(*) FROM app_private.undo_log;`));

describe('the deferred wagerRepository.listByBout read', () => {
  it('returns the bout\'s wagers WITH revisions', async () => {
    const res = await rpc('fm_member_wagers_by_bout',
      { p_slug: SLUG, p_bout_id: BOUT }, { as: USER_MEMBER });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(WAG);
    // Without a revision the caller cannot assemble the vector grade demands.
    expect(res.body[0].revision).toBeTruthy();
    expect(typeof res.body[0].stake_units).toBe('string');
  });

  it('a signed-in non-member gets nothing; anon is refused', async () => {
    const outsider = await rpc('fm_member_wagers_by_bout',
      { p_slug: SLUG, p_bout_id: BOUT }, { as: USER_OUTSIDER });
    expect(outsider.body.length).toBe(0);
    const anon = await rpc('fm_member_wagers_by_bout',
      { p_slug: SLUG, p_bout_id: BOUT });
    expect(anon.status).toBe(401);
    expect(anon.body.code).toBe('42501');
  });
});

describe('authorization', () => {
  it('anon cannot execute either RPC', async () => {
    for (const [fn, args] of [
      ['fm_rpc_grade_bout', { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A',
                              p_method: 'DEC', p_revisions: [] }],
      ['fm_rpc_return_bout_to_pending', { p_slug: SLUG, p_bout_id: BOUT,
                                          p_revisions: [] }],
    ]) {
      const res = await rpc(fn, args);
      expect(res.status, fn).toBe(401);
      expect(res.body.code, fn).toBe('42501');
    }
  });

  it('a viewer and a non-member are both refused', async () => {
    const v = await vector();
    for (const who of [USER_VIEWER, USER_OUTSIDER]) {
      const res = await rpc('fm_rpc_grade_bout',
        { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A', p_method: 'DEC',
          p_revisions: v }, { as: who });
      expect(res.body.code).toBe('42501');
      expect(res.body.message).toMatch(/insufficient workspace role/);
    }
  });

  it('an unknown bout is 42704', async () => {
    const res = await rpc('fm_rpc_grade_bout',
      { p_slug: SLUG, p_bout_id: '00000000-0000-4000-8000-0000000000ff',
        p_outcome: 'A', p_method: 'DEC', p_revisions: [] }, { as: USER_MEMBER });
    expect(res.body.code).toBe('42704');
  });
});

describe('the revision vector must cover every dependent', () => {
  const cases = [
    ['a bare bout revision (missing dependents)', (v) => [v[0]], 'missingRevisionEntry'],
    ['a duplicate entry', (v) => [...v, v[0]], 'duplicateRevisionEntry'],
    ['an unknown id', (v) => [...v, { id: '00000000-0000-4000-8000-00000000beef',
                                      revision: '1' }], 'unknownRevisionEntry'],
    ['a non-array', () => 'nope', 'revisionVectorRequired'],
    ['an entry without a revision', (v) => [{ id: v[0].id }], 'malformedRevisionEntry'],
  ];
  for (const [label, mangle, code] of cases) {
    it(`rejects ${label} and mutates nothing`, async () => {
      const v = await vector();
      const before = state();
      const undoBefore = undoCount();
      const res = await grade(mangle(v));
      expect(res.body.code, label).toBe('23514');
      expect(res.body.message, label).toMatch(new RegExp(code));
      expect(state(), label).toEqual(before);
      expect(undoCount(), label).toBe(undoBefore);
    });
  }

  it('rejects a malformed and an out-of-range revision with 22P02', async () => {
    const v = await vector();
    for (const bad of ['twelve', null, '9223372036854775808', '9999999999999999999']) {
      const res = await grade(v.map((e, i) => (i === 0 ? { ...e, revision: bad } : e)));
      expect(res.body.code, String(bad)).toBe('22P02');
      expect(res.body.message, String(bad)).not.toMatch(/stale_write/);
    }
  });

  it('ordering is irrelevant — the reversed vector is accepted', async () => {
    const v = await vector();
    const res = await grade([...v].reverse());
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    await unGrade(await vector());
  });
});

describe('stale entries', () => {
  it('a stale DEPENDENT aborts with stale_write and the real server revision', async () => {
    const v = await vector();
    const dependent = v.find((e) => e.id !== BOUT);
    const before = state();
    const undoBefore = undoCount();

    const res = await grade(v.map((e) =>
      (e.id === dependent.id ? { ...e, revision: '999' } : e)));

    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/\bstale_write\b/);
    // the REAL current revision of the stale row, never an invented one
    expect(res.body.message).toMatch(new RegExp(`revision=${dependent.revision}\\b`));
    expect(state()).toEqual(before);
    expect(undoCount()).toBe(undoBefore);
  });

  it('a stale BOUT revision aborts the same way', async () => {
    const v = await vector();
    const bout = v.find((e) => e.id === BOUT);
    const res = await grade(v.map((e) =>
      (e.id === BOUT ? { ...e, revision: '999' } : e)));
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(new RegExp(`revision=${bout.revision}\\b`));
  });
});

describe('grading settles every dependent', () => {
  it('returns the COMPLETE touched vector and settles bout, position and wager', async () => {
    const v = await vector();
    const res = await grade(v, 'A', 'DEC');
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const touched = res.body[0].touched;
    expect(touched.map((t) => t.id).sort()).toEqual(v.map((e) => e.id).sort());
    for (const t of touched) {
      const before = v.find((e) => e.id === t.id);
      expect(BigInt(t.revision), t.id).toBe(BigInt(before.revision) + 1n);
    }
    expect(res.body[0].revision)
      .toBe(touched.find((t) => t.table === 'bouts').revision);

    const s = state();
    expect(s.bout).toBe('resolved');
    // corner A at -150, 1u: Node 1*((1+100/150)-1) = 0.6666666666666665
    expect(s.pos).toBe('settled/won/0.6666666666666665');
    // the wager is corner A too, 2u: 1.333333333333333
    expect(s.wager).toBe('settled/won/1.333333333333333');
  });

  it('recorded undo carries the prior state and the post-op revisions', async () => {
    const undo = await rpc('fm_member_undo_list', { p_slug: SLUG }, { as: USER_MEMBER });
    const entry = undo.body.find((u) => u.op === 'grade_bout');
    expect(entry).toBeTruthy();
    // prior_state is deliberately NOT on the read surface: it is server-side
    // restore data, and fm_rpc_undo applies it without the client ever seeing
    // it. Asserted from the catalog so the surface stays minimal.
    expect(catalogScalar(
      `SELECT prior_state #>> '{bout,resultStatus}' FROM app_private.undo_log
        WHERE op = 'grade_bout' ORDER BY created_at DESC LIMIT 1;`)).toBe('pending');
    expect(catalogScalar(
      `SELECT prior_state #>> '{trackedPositions,0,settlementStatus}'
         FROM app_private.undo_log WHERE op = 'grade_bout'
        ORDER BY created_at DESC LIMIT 1;`)).toBe('open');
    expect(catalogScalar(
      `SELECT prior_state #>> '{wagers,0,settlementStatus}'
         FROM app_private.undo_log WHERE op = 'grade_bout'
        ORDER BY created_at DESC LIMIT 1;`)).toBe('open');
    expect(entry.revision_vector[BOUT]).toBeTruthy();
    expect(entry.revision_vector[POS]).toBeTruthy();
    expect(entry.revision_vector[WAG]).toBeTruthy();
  });

  it('MIXED outcome: corner B makes the A-side position lose', async () => {
    await unGrade(await vector());
    const res = await grade(await vector(), 'B', 'SUB');
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const s = state();
    expect(s.pos).toBe('settled/lost/-1');
    expect(s.wager).toBe('settled/lost/-2');
    await unGrade(await vector());
  });

  it('DRAW settles as push with profit exactly 0', async () => {
    const res = await grade(await vector(), 'draw', null);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(state().pos).toBe('settled/push/0');
    expect(state().wager).toBe('settled/push/0');
    await unGrade(await vector());
  });

  it('noContest settles as void with profit exactly 0', async () => {
    const res = await grade(await vector(), 'noContest', null);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(state().pos).toBe('settled/void/0');
    await unGrade(await vector());
  });

  it('rejects an invalid outcome and an invalid method', async () => {
    const v = await vector();
    const bad = await grade(v, 'MAYBE', 'DEC');
    expect(bad.body.code).toBe('23514');
    const badMethod = await rpc('fm_rpc_grade_bout',
      { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A', p_method: 'TKO?',
        p_revisions: v }, { as: USER_MEMBER });
    expect(badMethod.body.code).toBe('23514');
    expect(state().bout).toBe('pending');
  });

  it('stale beats validation, matching the in-memory precedence', async () => {
    const v = await vector();
    const res = await grade(v.map((e) => ({ ...e, revision: '999' })), 'MAYBE');
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/stale_write/);
  });
});

describe('grade and return-to-pending are true inverses', () => {
  it('round-trips bout, position and wager back to their exact prior state', async () => {
    const before = state();
    expect(before.bout).toBe('pending');

    const graded = await grade(await vector(), 'A', 'DEC');
    expect(graded.status).toBe(200);
    expect(state()).not.toEqual(before);

    const returned = await unGrade(await vector());
    expect(returned.status, JSON.stringify(returned.body)).toBe(200);
    expect(state()).toEqual(before);
  });

  it('return-to-pending demands the same complete vector', async () => {
    await grade(await vector(), 'A', 'DEC');
    const v = await vector();
    const bare = await unGrade([v.find((e) => e.id === BOUT)]);
    expect(bare.body.code).toBe('23514');
    expect(bare.body.message).toMatch(/missingRevisionEntry/);
    expect(state().bout).toBe('resolved');
    await unGrade(await vector());
  });

  it('non-vacuity: the round-trip really moved the rows', async () => {
    // If grading were a no-op the inverse test above would pass trivially.
    const before = state();
    await grade(await vector(), 'A', 'DEC');
    const mid = state();
    expect(mid.pos).not.toBe(before.pos);
    expect(mid.wager).not.toBe(before.wager);
    expect(mid.bout).not.toBe(before.bout);
    await unGrade(await vector());
  });
});

describe('concurrent grading is serialized by the bout lock', () => {
  it('two clients with the SAME vector: exactly one wins', async () => {
    await unGrade(await vector()).catch(() => {});
    const v = await vector();
    const undoBefore = undoCount();

    // Both requests carry the identical, fully valid vector and are in flight
    // before either resolves. Without the lock both would validate against the
    // same revisions and the second would overwrite rows it never re-checked.
    const [a, b] = await Promise.all([grade(v, 'A', 'DEC'), grade(v, 'B', 'SUB')]);

    const winners = [a, b].filter((r) => r.status === 200);
    const losers = [a, b].filter((r) => r.status !== 200);
    expect(winners.length, `statuses ${a.status}/${b.status}`).toBe(1);
    expect(losers.length).toBe(1);

    // The loser is told to re-read, with a REAL revision — not a generic error.
    expect(losers[0].body.code).toBe('P0001');
    expect(losers[0].body.message).toMatch(/\bstale_write\b/);
    const reported = losers[0].body.message.match(/revision=(\d+)/)[1];
    expect(BigInt(reported)).toBeGreaterThan(0n);

    // Exactly ONE undo row, and every affected revision advanced exactly once.
    expect(undoCount()).toBe(undoBefore + 1);
    for (const entry of v) {
      const now = catalogScalar(
        `SELECT revision FROM (
           SELECT id::text, revision FROM app_private.bouts
           UNION ALL SELECT id::text, revision FROM app_private.tracked_positions
           UNION ALL SELECT id::text, revision FROM app_private.wagers) x
          WHERE x.id = '${entry.id}';`);
      expect(BigInt(now), entry.id).toBe(BigInt(entry.revision) + 1n);
    }
    // The reported revision is the bout's real current value.
    expect(reported).toBe(catalogScalar(
      `SELECT revision FROM app_private.bouts WHERE id='${BOUT}';`));

    await unGrade(await vector());
  });

  it('a cluster-1 dependent edit racing a grade cannot be lost', async () => {
    const v = await vector();
    const pos = v.find((e) => e.id === POS);

    // A corner change and a grade, both in flight, both against the same
    // pre-read revisions. Either order is acceptable — what is NOT acceptable is
    // both succeeding, because the grade would then have settled a corner it
    // never validated.
    const [edit, graded] = await Promise.all([
      rpc('fm_rpc_change_tracked_corner',
        { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
          p_expected_revision: pos.revision }, { as: USER_MEMBER }),
      grade(v, 'A', 'DEC'),
    ]);

    const ok = [edit, graded].filter((r) => r.status === 200);
    expect(ok.length, `edit ${edit.status} / grade ${graded.status}`).toBe(1);
    const loser = [edit, graded].find((r) => r.status !== 200);
    expect(loser.body.code).toBe('P0001');
    expect(loser.body.message).toMatch(/\bstale_write\b/);

    // Whatever won, the settlement matches the corner actually stored.
    const corner = catalogScalar(
      `SELECT corner FROM app_private.tracked_positions WHERE id='${POS}';`);
    const outcome = catalogScalar(
      `SELECT coalesce(settlement_outcome,'-') FROM app_private.tracked_positions
        WHERE id='${POS}';`);
    if (outcome !== '-') expect(outcome).toBe(corner === 'A' ? 'won' : 'lost');

    await unGrade(await vector()).catch(() => {});
    scalar(`UPDATE app_private.tracked_positions SET corner='A' WHERE id='${POS}';`);
  });
});
