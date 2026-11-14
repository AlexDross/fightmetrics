#!/usr/bin/env python3
"""Source freely licensed fighter photos from Wikidata / Wikimedia Commons.

Stages (each reads the previous stage's output, so any can be re-run):

  match     roster -> Wikidata entities. Pass 1 matches every roster name
            against all entities whose occupation is "mixed martial arts
            fighter" (label + aliases, accent/punctuation-insensitive). Pass 2
            ("double check") searches Wikidata directly for each fighter pass 1
            missed and accepts a hit only if it is a human described as an MMA
            fighter. In both passes a date-of-birth disagreement rejects the
            match, and a same-name tie is broken only by an exact DOB match.
  license   Commons file metadata for every matched P18 image. Only free
            licenses are kept (public domain, CC0, CC BY, CC BY-SA); the
            artist, license and source page are recorded for the credits.
  commons   Double check for fighters still without a photo: searches Commons
            file titles for the exact full name, keeping only free files tied
            to combat sports by category/description (run after license).
  crop      Downloads a Commons-scaled copy, finds the face (OpenCV YuNet),
            and writes a 192x192 WebP head-and-shoulders crop. Images with no
            face, or more than one face of similar size, are held for review.
  manifest  Writes src/fighterPhotos.js from the kept, reviewed crops, minus
            anything listed in data/fighter_photos/overrides.json "reject".

Review: after crop, look over every crop (contact sheets work well) and list
wrong-person or unusable crops under "reject" in overrides.json, and
several-face crops where the fighter is clearly the subject under "approve".

Usage (deps: requirements-photos.txt; yunet.onnx is OpenCV Zoo's
face_detection_yunet_2023mar.onnx):
  node scripts/fighter_photos/dump_roster.mjs > roster.json
  python scripts/fighter_photos/source_photos.py match    --roster roster.json --work WORK
  python scripts/fighter_photos/source_photos.py license  --work WORK
  python scripts/fighter_photos/source_photos.py commons  --roster roster.json --work WORK
  python scripts/fighter_photos/source_photos.py crop     --work WORK --model yunet.onnx
  python scripts/fighter_photos/source_photos.py manifest --work WORK
"""

import argparse
import html
import json
import os
import re
import sys
import time
import unicodedata
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = ROOT / 'public' / 'fighters'
MANIFEST = ROOT / 'src' / 'fighterPhotos.js'
OVERRIDES = ROOT / 'data' / 'fighter_photos' / 'overrides.json'
AUDIT = ROOT / 'data' / 'fighter_photos' / 'sources.json'

UA = {'User-Agent': 'fighter-photo-sourcing/1.0 (one-off batch; contact via repository)'}
WDQS = 'https://query.wikidata.org/sparql'
WD_API = 'https://www.wikidata.org/w/api.php'
COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
MMA_FIGHTER = 'Q11607585'
HUMAN = 'Q5'
SIZE = 192

FREE_LICENSE = re.compile(r'^(public domain|pd\b|pd-|cc0|cc[ -]by(-sa)?[ -]\d)', re.I)


# ── helpers ─────────────────────────────────────────────────────────────────

def norm(name):
    s = unicodedata.normalize('NFKD', name or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace('’', "'").replace('‘', "'")
    s = re.sub(r"[.'`\-]", ' ', s)
    s = re.sub(r'\b(jr|sr|ii|iii|iv)\b', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', norm(name)).strip('-')


def get(url, params, tries=6):
    for i in range(tries):
        r = requests.get(url, params=params, headers=UA, timeout=90)
        if r.status_code == 429 or r.status_code >= 500:
            wait = r.headers.get('Retry-After')
            print(f'  {r.status_code} from {url[:60]}; retry-after={wait}', file=sys.stderr)
            time.sleep(int(wait) + 1 if wait and wait.isdigit() else 20 * (i + 1))
            continue
        r.raise_for_status()
        return r
    r.raise_for_status()


def sparql(query):
    return get(WDQS, {'query': query, 'format': 'json'}).json()['results']['bindings']


def dob_of(time_value):
    # Wikidata time: "+1991-10-27T00:00:00Z"; day/month precision unknown here,
    # so only a full date with non-zero month/day is treated as a DOB.
    m = re.match(r'^[+]?(\d{4})-(\d{2})-(\d{2})', time_value or '')
    if not m or m.group(2) == '00' or m.group(3) == '00':
        return None
    return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'


def load(path):
    return json.loads(Path(path).read_text())


def save(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, indent=1, ensure_ascii=False))


# ── stage: match ────────────────────────────────────────────────────────────

# The pool is every entity that is an MMA fighter by occupation OR carries a
# Sherdog fighter ID (P2818) or UFC athlete ID (P9722): many fighters have the
# IDs but no occupation statement. One bulk query instead of per-name lookups.
POOL_QUERY = f"""
SELECT ?item ?label ?alias ?dob ?image WHERE {{
  {{ ?item wdt:P106 wd:{MMA_FIGHTER} }} UNION {{ ?item wdt:P2818 [] }} UNION {{ ?item wdt:P9722 [] }}
  OPTIONAL {{ ?item rdfs:label ?label FILTER(LANG(?label) = "en") }}
  OPTIONAL {{ ?item skos:altLabel ?alias FILTER(LANG(?alias) = "en") }}
  OPTIONAL {{ ?item wdt:P569 ?dob }}
  OPTIONAL {{ ?item wdt:P18 ?image }}
}}"""


def load_pool():
    pool = {}
    for b in sparql(POOL_QUERY):
        qid = b['item']['value'].rsplit('/', 1)[-1]
        e = pool.setdefault(qid, {'qid': qid, 'names': set(), 'dobs': set(), 'images': set()})
        for k in ('label', 'alias'):
            if k in b:
                e['names'].add(b[k]['value'])
        if 'dob' in b and dob_of(b['dob']['value']):
            e['dobs'].add(dob_of(b['dob']['value']))
        if 'image' in b:
            e['images'].add(b['image']['value'].rsplit('/', 1)[-1])
    return pool


def decide(fighter, candidates, how):
    """Pick one candidate or explain why none. DOB disagreement always rejects."""
    dob = fighter.get('dob')
    if dob:
        agree = [c for c in candidates if dob in c['dobs']]
        if len(agree) == 1:
            return agree[0], 'HIGH', f'{how}; DOB {dob} matches'
        if len(agree) > 1:
            return None, None, f'{how}; {len(agree)} entities share name and DOB'
        compatible = [c for c in candidates if not c['dobs']]
        if len(candidates) == 1 and compatible:
            return compatible[0], 'MEDIUM', f'{how}; entity has no DOB to compare'
        return None, None, f'{how}; DOB {dob} disagrees with every candidate'
    if len(candidates) == 1:
        return candidates[0], 'MEDIUM', f'{how}; roster has no DOB to compare'
    return None, None, f'{how}; {len(candidates)} same-name entities and no DOB'


def search_entities(name):
    r = get(WD_API, {'action': 'wbsearchentities', 'search': name, 'language': 'en',
                     'type': 'item', 'limit': 7, 'format': 'json'}).json()
    return [h['id'] for h in r.get('search', [])]


def fetch_entities(qids):
    out = {}
    for i in range(0, len(qids), 50):
        r = get(WD_API, {'action': 'wbgetentities', 'ids': '|'.join(qids[i:i + 50]),
                         'props': 'labels|aliases|claims|descriptions', 'languages': 'en',
                         'format': 'json'}).json()
        out.update(r.get('entities', {}))
        time.sleep(0.2)
    return out


def claim_ids(ent, prop):
    return [c['mainsnak'].get('datavalue', {}).get('value', {}).get('id')
            for c in ent.get('claims', {}).get(prop, []) if c['mainsnak'].get('snaktype') == 'value']


def claim_values(ent, prop):
    return [c['mainsnak'].get('datavalue', {}).get('value')
            for c in ent.get('claims', {}).get(prop, []) if c['mainsnak'].get('snaktype') == 'value']


def as_candidate(ent):
    names = {ent.get('labels', {}).get('en', {}).get('value', '')}
    names |= {a['value'] for a in ent.get('aliases', {}).get('en', [])}
    dobs = {dob_of(v.get('time')) for v in claim_values(ent, 'P569') if isinstance(v, dict)} - {None}
    images = {v for v in claim_values(ent, 'P18') if isinstance(v, str)}
    return {'qid': ent['id'], 'names': names, 'dobs': dobs, 'images': images}


def stage_match(args):
    roster = load(args.roster)
    pool = load_pool()
    print(f'pool: {len(pool)} MMA-fighter entities', file=sys.stderr)
    by_name = {}
    for e in pool.values():
        for n in e['names']:
            by_name.setdefault(norm(n), []).append(e)

    results, unmatched = {}, []
    for f in roster:
        cands = list({c['qid']: c for c in by_name.get(norm(f['name']), [])}.values())
        if not cands:
            unmatched.append(f)
            continue
        c, conf, why = decide(f, cands, 'pass 1: occupation pool, exact name')
        results[f['name']] = {'fighter': f, 'qid': c and c['qid'], 'confidence': conf, 'why': why,
                              'images': sorted(c['images']) if c else []}
        if not c:
            unmatched.append(f)

    save(Path(args.work) / 'match.pass1.json', results)

    # Pass 2 -- double check, by direct search, everyone pass 1 missed who has
    # fought since 2015 (older fighters almost never have a free photo). Each
    # lookup is cached on disk, so an interrupted run resumes where it stopped.
    cache_dir = Path(args.work) / 'cache'
    cache_dir.mkdir(parents=True, exist_ok=True)
    second = [f for f in unmatched if (f.get('lastFight') or '') >= '2015-01-01']
    for f in unmatched:
        if f not in second and f['name'] not in results:
            results[f['name']] = {'fighter': f, 'qid': None, 'confidence': None,
                                  'why': 'no MMA-fighter entity with this name (no pass 2: last fight before 2015)', 'images': []}
    print(f'pass 1 matched {sum(1 for r in results.values() if r["qid"])}; '
          f'pass 2 searching {len(second)}', file=sys.stderr)
    for i, f in enumerate(second):
        cached = cache_dir / (slug(f['name']) + '.json')
        try:
            if cached.exists():
                ents = load(cached)
            else:
                qids = search_entities(f['name'])
                time.sleep(0.6)
                ents = fetch_entities(qids) if qids else {}
                time.sleep(0.6)
                save(cached, ents)
        except requests.RequestException as e:
            results.setdefault(f['name'], {'fighter': f, 'qid': None, 'confidence': None, 'images': []})
            results[f['name']]['why'] = f'pass 2 lookup failed: {e}'
            continue
        cands = []
        for ent in ents.values():
            if HUMAN not in claim_ids(ent, 'P31'):
                continue
            desc = ent.get('descriptions', {}).get('en', {}).get('value', '').lower()
            if MMA_FIGHTER not in claim_ids(ent, 'P106') and 'mixed martial' not in desc and ' mma ' not in f' {desc} ':
                continue
            c = as_candidate(ent)
            if norm(f['name']) in {norm(n) for n in c['names']}:
                cands.append(c)
        prev = results.get(f['name'], {}).get('why')
        if cands:
            c, conf, why = decide(f, cands, 'pass 2: direct search, MMA fighter')
            results[f['name']] = {'fighter': f, 'qid': c and c['qid'], 'confidence': conf,
                                  'why': why if c or not prev else f'{prev} | {why}',
                                  'images': sorted(c['images']) if c else []}
        elif f['name'] not in results:
            results[f['name']] = {'fighter': f, 'qid': None, 'confidence': None,
                                  'why': 'no MMA-fighter entity with this name', 'images': []}
        if (i + 1) % 100 == 0:
            print(f'  pass 2: {i + 1}/{len(unmatched)}', file=sys.stderr)

    save(Path(args.work) / 'match.json', results)
    m = [r for r in results.values() if r['qid']]
    print(f'matched {len(m)} / {len(roster)}; with image {sum(1 for r in m if r["images"])}', file=sys.stderr)


# ── stage: license ──────────────────────────────────────────────────────────

def strip_html(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()


def commons_meta(titles, extra_props=''):
    """File title (no "File:" prefix) -> license/author/url metadata from Commons."""
    meta = {}
    for i in range(0, len(titles), 40):
        params = {'action': 'query', 'format': 'json', 'prop': 'imageinfo' + extra_props,
                  'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 800,
                  'titles': '|'.join('File:' + t for t in titles[i:i + 40])}
        if extra_props:
            params['cllimit'] = 'max'
        r = get(COMMONS_API, params).json()
        norm_map = {n['to']: n['from'] for n in r['query'].get('normalized', [])}
        for page in r['query']['pages'].values():
            title = page['title']
            ii = (page.get('imageinfo') or [{}])[0]
            em = ii.get('extmetadata', {})
            val = lambda k: strip_html(em.get(k, {}).get('value'))
            meta[norm_map.get(title, title)[5:]] = {
                'file': title[5:], 'pageUrl': ii.get('descriptionurl'), 'thumbUrl': ii.get('thumburl'),
                'license': val('LicenseShortName'), 'licenseUrl': val('LicenseUrl') or None,
                'artist': val('Artist') or val('Credit') or None,
                'attributionRequired': val('AttributionRequired') == 'true',
                'nonFree': val('NonFree') == 'true', 'restrictions': val('Restrictions') or None,
                'mime': ii.get('mime'),
                'description': val('ImageDescription')[:400],
                'categories': [c['title'][9:] for c in page.get('categories', [])],
            }
        time.sleep(0.3)
    return meta


def license_ok(m):
    free = bool(FREE_LICENSE.search(m['license'] or '')) and not m['nonFree']
    if free and m['attributionRequired'] and not m['artist']:
        return False, 'attribution required but no author recorded'
    return free, 'free license' if free else f'not a free license: {m["license"]!r}'


def stage_license(args):
    matches = load(Path(args.work) / 'match.json')
    wanted = {}
    for name, r in matches.items():
        if r['qid'] and r['images']:
            wanted[name] = requests.utils.unquote(r['images'][0])  # first P18 = preferred
    meta = commons_meta(sorted(set(wanted.values())))

    out = {}
    for name, t in wanted.items():
        m = meta.get(t) or meta.get(t.replace('_', ' '))
        if not m:
            out[name] = {'keep': False, 'why': f'no Commons metadata for {t}'}
            continue
        free, why = license_ok(m)
        out[name] = {'keep': free, 'why': why, **m}
    save(Path(args.work) / 'license.json', out)
    kept = sum(1 for v in out.values() if v['keep'])
    print(f'images checked {len(out)}; free {kept}; rejected {len(out) - kept}', file=sys.stderr)


# ── stage: crop ─────────────────────────────────────────────────────────────

def thumb_candidates(url):
    """Commons serves small originals from upload.wikimedia.org, which throttles
    bulk clients hard; the thumbnail host does not. Try standard thumbnail widths
    first (a width wider than the original just fails), then the original."""
    base = url.split('?')[0]
    m = re.match(r'https://upload\.wikimedia\.org/wikipedia/commons/(\w)/(\w\w)/([^/]+)$', base)
    if not m:
        return [base]
    a, ab, file = m.groups()
    thumbs = [f'https://thumb.wikimedia.org/wikipedia/commons/thumb/{a}/{ab}/{file}/{w}px-{file}' for w in (500, 330, 250)]
    return thumbs + [base]


def fetch_image(url):
    """One quick attempt per candidate, no long Retry-After sleeps; a later re-run
    picks up anything that failed because raw downloads are cached."""
    why = 'no candidate'
    for cand in thumb_candidates(url):
        try:
            r = requests.get(cand, headers=UA, timeout=60)
        except requests.RequestException as e:
            why = str(e)
            continue
        if r.ok and r.headers.get('content-type', '').startswith('image/'):
            return r.content, None
        why = f'{r.status_code} from {cand[:70]}'
    return None, why


def stage_crop(args):
    import cv2
    import numpy as np
    from PIL import Image

    lic = load(Path(args.work) / 'license.json')
    raw_dir = Path(args.work) / 'raw'
    out_dir = Path(args.work) / 'crops'
    raw_dir.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)
    det = cv2.FaceDetectorYN.create(args.model, '', (320, 320), 0.8, 0.3, 5000)
    report = {}
    for name, m in sorted(lic.items()):
        if not m.get('keep') or not m.get('thumbUrl'):
            continue
        raw = raw_dir / (slug(name) + '.img')
        if len(report) % 50 == 0:
            print(f'  cropped {len(report)}', file=sys.stderr)
        if not raw.exists():
            data, why = fetch_image(m['thumbUrl'])
            if data is None:
                report[name] = {'status': 'download-failed', 'why': why}
                continue
            raw.write_bytes(data)
            time.sleep(0.3)
        try:
            img = Image.open(raw).convert('RGB')
        except Exception as e:  # noqa: BLE001 -- any decode failure just skips the photo
            report[name] = {'status': 'decode-failed', 'why': str(e)}
            continue
        arr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        h, w = arr.shape[:2]
        det.setInputSize((w, h))
        _, faces = det.detect(arr)
        faces = [] if faces is None else sorted(faces.tolist(), key=lambda f: -f[2] * f[3])
        if not faces:
            report[name] = {'status': 'no-face'}
            continue
        fx, fy, fw, fh = faces[0][:4]
        crowded = len(faces) > 1 and faces[1][2] * faces[1][3] > 0.45 * fw * fh
        side = min(max(fw, fh) * 2.4, w, h)
        cx, cy = fx + fw / 2, fy + fh / 2 + fh * 0.18
        left = int(min(max(cx - side / 2, 0), w - side))
        top = int(min(max(cy - side / 2, 0), h - side))
        crop = img.crop((left, top, left + int(side), top + int(side))).resize((SIZE, SIZE), Image.LANCZOS)
        crop.save(out_dir / (slug(name) + '.webp'), 'WEBP', quality=80, method=6)
        report[name] = {'status': 'review' if crowded else 'ok', 'faces': len(faces),
                        'faceSize': round(max(fw, fh)), 'source': [w, h]}
    save(Path(args.work) / 'crop.json', report)
    from collections import Counter
    print(dict(Counter(v['status'] for v in report.values())), file=sys.stderr)


# ── stage: manifest ─────────────────────────────────────────────────────────

def stage_manifest(args):
    work = Path(args.work)
    matches, lic, crops = load(work / 'match.json'), load(work / 'license.json'), load(work / 'crop.json')
    overrides = load(OVERRIDES) if OVERRIDES.exists() else {'reject': {}}
    reject = overrides.get('reject', {})
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for old in PUBLIC_DIR.glob('*.webp'):
        old.unlink()
    photos, audit = {}, {}
    for name in sorted(crops):
        c, m, r = crops[name], lic[name], matches[name]
        if c['status'] not in ('ok', 'review'):
            continue
        if name in reject:
            audit[name] = {'kept': False, 'why': f'rejected in review: {reject[name]}'}
            continue
        if c['status'] == 'review' and name not in overrides.get('approve', {}):
            audit[name] = {'kept': False, 'why': 'several faces; not approved in review'}
            continue
        file = slug(name) + '.webp'
        (PUBLIC_DIR / file).write_bytes((work / 'crops' / file).read_bytes())
        photos[name] = {'src': f'/fighters/{file}', 'artist': m['artist'], 'license': m['license'],
                        'licenseUrl': m['licenseUrl'], 'source': m['pageUrl']}
        audit[name] = {'kept': True, 'qid': r['qid'], 'confidence': r['confidence'], 'match': r['why'],
                       'file': m['file'], 'license': m['license']}
    save(AUDIT, audit)
    body = '{\n' + ',\n'.join(f' {json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)}'
                              for k, v in photos.items()) + '\n}'
    MANIFEST.write_text(
        '// Generated by scripts/fighter_photos/source_photos.py -- do not hand-edit.\n'
        '// Freely licensed fighter photos from Wikimedia Commons, matched to the\n'
        '// roster through Wikidata (name + date of birth) or an exact-name Commons\n'
        '// title search, cropped to 192px and reviewed by eye.\n'
        '// Every entry carries the credit its license requires; the Info tab shows\n'
        '// them all. Fighters without an entry get an initials avatar.\n'
        f'export const FIGHTER_PHOTOS = Object.freeze({body});\n')
    print(f'manifest: {len(photos)} photos', file=sys.stderr)


# ── stage: commons (double check) ───────────────────────────────────────────

COMBAT = re.compile(r'mixed martial|\bmma\b|\bufc\b|bellator|\bpfl\b|\bksw\b|one championship|rizin|'
                    r'pride fc|strikeforce|cage|fighter|kickbox|wrestl|jiu|judo|grappl|sambo|muay|boxer', re.I)
GROUP = re.compile(r'\bvs?\b\.?|\bversus\b|\band\b|&|\bwith\b|\bteam\b|\bfans?\b', re.I)


def stage_commons(args):
    """Fighters still without a photo: search Commons file titles for their full
    name. A file is a candidate only if its title has the exact (normalised) full
    name, does not look like a group/fight shot, and its categories or description
    tie it to combat sports. The best candidate is added to match.json/license.json
    (confidence COMMONS) and then goes through crop + eyeball review like the rest."""
    work = Path(args.work)
    roster = json.load(open(args.roster))
    matches, lic = load(work / 'match.json'), load(work / 'license.json')
    have = {n for n, v in lic.items() if v.get('keep')}
    todo = [f for f in roster if f['name'] not in have and (f.get('lastFight') or '') >= args.since]
    todo.sort(key=lambda f: f.get('lastFight') or '', reverse=True)  # most recently active first
    cache = work / 'commons-cache'
    cache.mkdir(exist_ok=True)
    print(f'commons search for {len(todo)} fighters', file=sys.stderr)
    found = 0
    for i, f in enumerate(todo):
        name = f['name']
        if i % 100 == 0:
            print(f'  {i}/{len(todo)}; found {found}', file=sys.stderr)
            save(work / 'license.json', lic)
            save(work / 'match.json', matches)
        cf = cache / (slug(name) + '.json')
        if cf.exists():
            hits = json.loads(cf.read_text())
        else:
            try:
                r = get(COMMONS_API, {'action': 'query', 'format': 'json', 'list': 'search', 'srnamespace': 6,
                                      'srsearch': f'intitle:"{name}"', 'srlimit': 15}).json()
            except (requests.RequestException, ValueError) as e:
                print(f'  {name}: {e}', file=sys.stderr)
                continue
            hits = [h['title'][5:] for h in r.get('query', {}).get('search', [])]
            cf.write_text(json.dumps(hits))
            time.sleep(0.4)
        want = f' {norm(name)} '
        cands = []
        for t in hits:
            stem = re.sub(r'\.[a-z]+$', '', t, flags=re.I)
            if not re.search(r'\.(jpe?g|png|webp)$', t, re.I):
                continue
            if want not in f' {norm(re.sub(r"[_(),]", " ", stem))} ' or GROUP.search(stem.replace('_', ' ')):
                continue
            cands.append(t)
        if not cands:
            continue
        try:
            meta = commons_meta(cands, extra_props='|categories')
        except requests.RequestException as e:
            print(f'  {name}: {e}', file=sys.stderr)
            continue
        for t in cands:
            m = meta.get(t) or meta.get(t.replace('_', ' '))
            if not m or not m.get('thumbUrl'):
                continue
            ok, why = license_ok(m)
            context = ' '.join(m['categories']) + ' ' + (m['description'] or '') + ' ' + t
            if not ok or not COMBAT.search(context):
                continue
            m = {k: v for k, v in m.items() if k not in ('description', 'categories')}
            lic[name] = {'keep': True, 'why': why, **m}
            matches[name] = {'fighter': f, 'qid': (matches.get(name) or {}).get('qid'), 'confidence': 'COMMONS',
                             'why': f'commons title search: exact name in "{t}", combat-sports category/description',
                             'images': [t]}
            found += 1
            break
    save(work / 'license.json', lic)
    save(work / 'match.json', matches)
    print(f'commons: found {found} more photos', file=sys.stderr)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('stage', choices=['match', 'license', 'commons', 'crop', 'manifest'])
    p.add_argument('--roster')
    p.add_argument('--work', required=True)
    p.add_argument('--model')
    p.add_argument('--since', default='2012-01-01', help='commons: only fighters active since')
    args = p.parse_args()
    {'match': stage_match, 'license': stage_license, 'commons': stage_commons, 'crop': stage_crop, 'manifest': stage_manifest}[args.stage](args)


if __name__ == '__main__':
    main()
