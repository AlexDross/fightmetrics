import { describe, it, expect } from 'vitest';
import {
  checkModelDataFreshness,
  freshnessErrors,
  MODEL_DATA_FILES,
  STALE_DATA_OVERRIDE,
} from '../../../../scripts/lib/dataFreshness.mjs';

// A scripted git: maps the subcommand to a canned result and records calls.
const fakeGit = (results) => {
  const calls = [];
  const git = (args) => {
    calls.push(args);
    return results[args[0]] ?? { ok: true, status: 0, stdout: '', stderr: '' };
  };
  return { git, calls };
};

describe('checkModelDataFreshness', () => {
  it('passes when the model data matches origin/main', () => {
    const { git, calls } = fakeGit({});
    expect(checkModelDataFreshness({ git })).toEqual({ fresh: true, staleFiles: [], problems: [] });
    expect(calls[0]).toEqual(['fetch', '--quiet', 'origin', 'main']);
    expect(calls[1]).toEqual(['diff', '--name-only', 'origin/main', '--', ...MODEL_DATA_FILES]);
  });

  it('refuses and names the files when the checkout differs from main', () => {
    const { git } = fakeGit({
      diff: { ok: true, status: 0, stdout: 'src/fightersData.js\nsrc/eloModule.js\n', stderr: '' },
    });
    const r = checkModelDataFreshness({ git });
    expect(r.fresh).toBe(false);
    expect(r.staleFiles).toEqual(['src/fightersData.js', 'src/eloModule.js']);
    expect(r.problems[0]).toMatch(/src\/fightersData\.js, src\/eloModule\.js/);
  });

  it('fails closed when origin cannot be reached', () => {
    const { git, calls } = fakeGit({
      fetch: { ok: false, status: 128, stdout: '', stderr: 'fatal: unable to access\n' },
    });
    const r = checkModelDataFreshness({ git });
    expect(r.fresh).toBe(false);
    expect(r.problems[0]).toMatch(/could not fetch origin\/main.*unable to access/);
    expect(calls).toHaveLength(1);
  });

  it('fails closed when the diff itself errors', () => {
    const { git } = fakeGit({ diff: { ok: false, status: 128, stdout: '', stderr: 'bad revision' } });
    expect(checkModelDataFreshness({ git }).fresh).toBe(false);
  });

  it('covers every file the scheduled fighter update commits', () => {
    for (const f of ['src/fightersData.js', 'src/fightHistory.js', 'src/eloModule.js',
      'src/cardioModule.js', 'src/fighterBirthdates.js', 'src/rankingsData.js']) {
      expect(MODEL_DATA_FILES).toContain(f);
    }
  });
});

describe('freshnessErrors', () => {
  const stale = () => ({ fresh: false, staleFiles: ['src/fightersData.js'], problems: ['stale'] });

  it('returns the problems with the override hint', () => {
    const errs = freshnessErrors({ check: stale });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain(STALE_DATA_OVERRIDE);
  });

  it('is silent with the override, without even running the check', () => {
    let ran = false;
    expect(freshnessErrors({ allowStaleData: true, check: () => { ran = true; return stale(); } })).toEqual([]);
    expect(ran).toBe(false);
  });

  it('is silent when fresh', () => {
    expect(freshnessErrors({ check: () => ({ fresh: true, staleFiles: [], problems: [] }) })).toEqual([]);
  });
});
