#!/usr/bin/env python3
"""Replay the pinned Greco feed through a baseline and a candidate checkout.

    python scripts/integrity/replay_pinned_feed.py \\
        --feed-dir /path/to/scrape_ufc_stats   # checked out at the pinned revision
        --baseline a2e83a8 [--candidate HEAD] [--today 2026-10-08] \\
        [--out research/integrity_step1/replay_evidence.json]

For each side it creates a detached `git worktree` at the ref, copies in the
five feed CSVs, and runs the scheduled workflow's generators in order:
update_fighters.py, regen_elo.py, scripts/generate-fighter-birthdates.mjs,
generate_source_manifest.py. Then it compares:

1. Prediction-relevant artifacts (fightersData, fightHistory, fighter_profiles,
   eloModule, fighterBirthdates): must be byte-identical between the sides.
2. src/sourceManifest.js: every module field must match except the
   intentional provenance changes listed in EXPECTED_MANIFEST_CHANGES.
3. Candidate-only provenance files (source_ledger.json,
   artifact_generation.json): listed, and must match the committed copies.
4. Repeat-run stability: the candidate pipeline is run a second time in the
   same worktree and every output, provenance included, must be unchanged.
5. Predictions: scripts/integrity/replay_predictions.mjs (from the candidate
   tree) rebuilds every pending Upcoming entry and a fixed same-division panel
   through buildRoiEntry on each side; every field must match except
   _provenance.sourceManifest, which embeds the manifest modules.

The clock is pinned on both sides. The candidate reads FM_TODAY. The baseline
predates FM_TODAY, so the harness rewrites exactly the clock reads listed in
CLOCK_PINS in the baseline worktree (each must match exactly once), and the
same regen_elo / manifest clock reads on both sides. Nothing else in either
checkout is modified, and the worktrees are removed afterwards.

Exit 0 when every comparison holds, 1 otherwise. Needs pandas, node and git.
"""

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
FEED_FILES = ('ufc_fight_results.csv', 'ufc_event_details.csv', 'ufc_fight_details.csv',
              'ufc_fight_stats.csv', 'ufc_fighter_tott.csv')
PREDICTION_RELEVANT = ('src/fightersData.js', 'src/fightHistory.js', 'fighter_profiles.json',
                       'src/eloModule.js', 'src/fighterBirthdates.js')
CANDIDATE_PROVENANCE = ('source_ledger.json', 'artifact_generation.json')
MANIFEST = 'src/sourceManifest.js'
# Fields of a manifest module that this change is meant to alter, and why.
EXPECTED_MANIFEST_CHANGES = {
    'sourceSnapshot': 'new: the pinned upstream revision and input hashes',
    'generatorVersion': 'names the commit of the generating code, which differs by definition',
}


def clock_pins(today):
    year, month, day = (int(x) for x in today.split('-'))
    stamp = f'{today}T12:00:00Z'
    return {
        'baseline': [
            ('update_fighters.py', 'TODAY = date.today()', f'TODAY = date({year}, {month}, {day})'),
        ],
        'both': [
            ('regen_elo.py', "today = datetime.utcnow().strftime('%b %Y')",
             f"today = datetime({year}, {month}, {day}).strftime('%b %Y')"),
            ('generate_source_manifest.py',
             "now_iso = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')",
             f"now_iso = {stamp!r}"),
        ],
    }


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest() if Path(path).is_file() else None


def run(cmd, cwd, env=None, capture=True):
    result = subprocess.run(cmd, cwd=cwd, env=env, capture_output=capture, text=True)
    if result.returncode != 0:
        raise SystemExit(f'FAILED in {cwd}: {" ".join(cmd)}\n{result.stdout[-3000:]}\n{result.stderr[-3000:]}')
    return result.stdout


def pin(tree, pins):
    applied = []
    for rel, old, new in pins:
        path = tree / rel
        text = path.read_text(encoding='utf-8')
        if text.count(old) != 1:
            raise SystemExit(f'clock pin for {rel} expected exactly one {old!r}, found {text.count(old)}')
        path.write_text(text.replace(old, new), encoding='utf-8')
        applied.append({'file': rel, 'from': old, 'to': new})
    return applied


def pipeline(tree, today):
    env = dict(os.environ, FM_TODAY=today)
    run([sys.executable, 'update_fighters.py'], tree, env)
    run([sys.executable, 'regen_elo.py'], tree, env)
    run(['node', 'scripts/generate-fighter-birthdates.mjs'], tree, env)
    run([sys.executable, 'generate_source_manifest.py'], tree, env)


def outputs(tree):
    rels = PREDICTION_RELEVANT + CANDIDATE_PROVENANCE + (MANIFEST, 'source_snapshot.json')
    return {rel: sha(tree / rel) for rel in rels}


def manifest_modules(tree):
    text = (tree / MANIFEST).read_text(encoding='utf-8')
    start = text.index('export const SOURCE_MANIFEST = ') + len('export const SOURCE_MANIFEST = ')
    return json.loads(text[start:text.rindex(';')])


def compare_manifests(base, cand):
    expected, unexpected = [], []
    keys = sorted(set(base) | set(cand))
    for key in keys:
        if key == 'modules':
            continue
        if base.get(key) != cand.get(key):
            unexpected.append({'field': key, 'baseline': base.get(key), 'candidate': cand.get(key)})
    bm, cm = base.get('modules', {}), cand.get('modules', {})
    for name in sorted(set(bm) | set(cm)):
        b, c = bm.get(name), cm.get(name)
        if b is None or c is None:
            unexpected.append({'module': name, 'present': {'baseline': b is not None, 'candidate': c is not None}})
            continue
        for field in sorted(set(b) | set(c)):
            if b.get(field) == c.get(field):
                continue
            row = {'module': name, 'field': field, 'baseline': b.get(field), 'candidate': c.get(field)}
            if field in EXPECTED_MANIFEST_CHANGES:
                row['why'] = EXPECTED_MANIFEST_CHANGES[field]
                expected.append(row)
            else:
                unexpected.append(row)
    return expected, unexpected


def diff_paths(a, b, path=''):
    if isinstance(a, dict) and isinstance(b, dict):
        out = []
        for k in sorted(set(a) | set(b)):
            out += diff_paths(a.get(k), b.get(k), f'{path}.{k}' if path else k)
        return out
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        out = []
        for i, (x, y) in enumerate(zip(a, b)):
            out += diff_paths(x, y, f'{path}[{i}]')
        return out
    return [] if a == b else [path]


def compare_predictions(base, cand):
    allowed = '_provenance.sourceManifest'
    report = {'pending': 0, 'panel': 0, 'fighters': 0, 'allowedDifferences': set(), 'unexpected': []}
    for section in ('pending', 'panel'):
        b = {row['key']: row for row in base[section]}
        c = {row['key']: row for row in cand[section]}
        if set(b) != set(c):
            report['unexpected'].append({section: 'different keys'})
        for key in sorted(set(b) & set(c)):
            report[section] += 1
            for path in diff_paths(b[key].get('entry'), c[key].get('entry')):
                if path == allowed or path.startswith(allowed + '.'):
                    report['allowedDifferences'].add(allowed)
                else:
                    report['unexpected'].append({'section': section, 'key': key, 'path': path})
    for name in sorted(set(base['fighters']) | set(cand['fighters'])):
        report['fighters'] += 1
        for path in diff_paths(base['fighters'].get(name), cand['fighters'].get(name)):
            report['unexpected'].append({'section': 'fighters', 'key': name, 'path': path})
    report['allowedDifferences'] = sorted(report['allowedDifferences'])
    report['sample'] = [
        {k: row['entry'].get(k) for k in ('fighterA', 'fighterB', 'v2pA', 'c6ProbA', 'betAction', 'trackedSide')}
        for row in cand['pending'][:3] if row.get('entry')]
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--feed-dir', required=True)
    parser.add_argument('--baseline', required=True)
    parser.add_argument('--candidate', default='HEAD')
    parser.add_argument('--today', default='2026-10-08')
    parser.add_argument('--out')
    args = parser.parse_args(argv)

    feed = Path(args.feed_dir).resolve()
    revision = run(['git', 'rev-parse', 'HEAD'], feed).strip()
    refs = {side: run(['git', 'rev-parse', ref], REPO).strip()
            for side, ref in (('baseline', args.baseline), ('candidate', args.candidate))}
    pins = clock_pins(args.today)
    evidence = {'feedRevision': revision, 'today': args.today, 'refs': refs, 'clockPins': {}}
    problems = []

    work = Path(tempfile.mkdtemp(prefix='fm-replay-'))
    trees = {}
    try:
        for side, sha_ in refs.items():
            tree = work / side
            run(['git', 'worktree', 'add', '--detach', '--quiet', str(tree), sha_], REPO)
            trees[side] = tree
            (tree / 'node_modules').symlink_to(REPO / 'node_modules')
            for name in FEED_FILES:
                shutil.copy2(feed / name, tree / name)
            committed = {rel: sha(tree / rel) for rel in PREDICTION_RELEVANT + CANDIDATE_PROVENANCE}
            evidence.setdefault('committed', {})[side] = committed
            evidence['clockPins'][side] = pin(tree, pins['both'] + (pins['baseline'] if side == 'baseline' else []))
            pipeline(tree, args.today)
            evidence.setdefault('outputs', {})[side] = outputs(tree)

        base, cand = evidence['outputs']['baseline'], evidence['outputs']['candidate']
        evidence['predictionRelevant'] = {
            rel: {'identical': base[rel] == cand[rel], 'sha256': cand[rel],
                  'matchesBaselineCommitted': cand[rel] == evidence['committed']['baseline'][rel]}
            for rel in PREDICTION_RELEVANT}
        for rel, row in evidence['predictionRelevant'].items():
            if not row['identical']:
                problems.append(f'{rel} differs between baseline and candidate')

        expected, unexpected = compare_manifests(manifest_modules(trees['baseline']),
                                                 manifest_modules(trees['candidate']))
        evidence['manifest'] = {'expectedChanges': expected, 'unexpectedChanges': unexpected}
        problems += [f'unexpected manifest change: {row}' for row in unexpected]

        evidence['candidateProvenance'] = {
            rel: {'sha256': cand[rel], 'matchesCommitted': cand[rel] == evidence['committed']['candidate'][rel]}
            for rel in CANDIDATE_PROVENANCE}
        for rel, row in evidence['candidateProvenance'].items():
            if not row['matchesCommitted']:
                problems.append(f'{rel} replayed differently from the committed copy')

        first = outputs(trees['candidate'])
        pipeline(trees['candidate'], args.today)
        second = outputs(trees['candidate'])
        evidence['repeatRun'] = {rel: first[rel] == second[rel] for rel in first}
        problems += [f'{rel} changed on a repeat run' for rel, same in evidence['repeatRun'].items() if not same]

        script = trees['candidate'] / 'scripts' / 'integrity' / 'replay_predictions.mjs'
        predictions = {side: json.loads(run(['node', str(script), str(tree), args.today], tree))
                       for side, tree in trees.items()}
        evidence['predictions'] = compare_predictions(predictions['baseline'], predictions['candidate'])
        problems += [f'prediction difference: {row}' for row in evidence['predictions']['unexpected'][:20]]
    finally:
        for tree in trees.values():
            subprocess.run(['git', 'worktree', 'remove', '--force', str(tree)], cwd=REPO,
                           capture_output=True)
        shutil.rmtree(work, ignore_errors=True)

    evidence['problems'] = problems
    evidence['verdict'] = 'PASS' if not problems else 'FAIL'
    text = json.dumps(evidence, indent=2, sort_keys=True) + '\n'
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(text, encoding='utf-8')
    print(text if not args.out else f'{evidence["verdict"]}: evidence written to {args.out}')
    for problem in problems:
        print(f'  {problem}', file=sys.stderr)
    return 0 if not problems else 1


if __name__ == '__main__':
    raise SystemExit(main())
