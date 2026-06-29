#!/usr/bin/env python3
"""
generate_upcoming_card.py
Two-source verification pipeline for upcoming UFC card generation.

Pipeline:
  A. Canonical card scrape — Wikipedia -> Tapology fallback
  B. Roster matching via fuzzy match against fighters.json
  C. Debut detection (no roster match OR fights_in_db == 0)
  D. Odds join from TheRundown (matched against canonical fights)
  E. Write src/upcomingCard.js

Usage:
  THERUNDOWN_API_KEY=xxxx python generate_upcoming_card.py
"""

import os
import sys
import json
import difflib
import re
import time
from datetime import datetime, timedelta, timezone

import requests
from bs4 import BeautifulSoup

THERUNDOWN_BASE = "https://therundown.io/api/v2/sports/7/events"
FIGHTERS_JSON = "fighters.json"
OUTPUT_JS = "src/upcomingCard.js"
MATCH_CUTOFF = 0.75
PREFERRED_AFFILIATE = 19  # DraftKings

EXCLUDED_FIGHTERS = {
    "Ismail Naurdiev",
    "Marvin Vettori",
    "Andreas Gustafsson",
}

WIKIPEDIA_UFC_INDEX = "https://en.wikipedia.org/wiki/UFC"
WIKIPEDIA_BASE = "https://en.wikipedia.org"

# ---------------------------------------------------------------------------
# Roster helpers
# ---------------------------------------------------------------------------

def load_roster(path=FIGHTERS_JSON):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return data  # full objects


def build_roster_names(roster):
    return [entry["name"] for entry in roster if entry.get("name")]


def name_variants(raw_name):
    words = raw_name.split()
    variants = [raw_name]
    if len(words) > 1:
        variants.append(" ".join(reversed(words)))
    if len(words) > 2:
        variants.append(f"{words[0]} {words[-1]}")
    seen, unique = set(), []
    for v in variants:
        if v not in seen:
            seen.add(v)
            unique.append(v)
    return unique


def match_name(raw_name, roster_names):
    best_match, best_score = None, 0.0
    for variant in name_variants(raw_name):
        candidates = difflib.get_close_matches(
            variant, roster_names, n=1, cutoff=MATCH_CUTOFF
        )
        if not candidates:
            continue
        score = difflib.SequenceMatcher(None, variant, candidates[0]).ratio()
        if score > best_score:
            best_score = score
            best_match = candidates[0]
    if best_match is not None:
        return best_match, True
    return raw_name, False


def is_debut(roster_name, matched, roster_by_name):
    if not matched:
        return True
    entry = roster_by_name.get(roster_name)
    if entry is None:
        return True
    return entry.get("fights_in_db", 1) == 0


# ---------------------------------------------------------------------------
# Part A — Wikipedia scrape
# ---------------------------------------------------------------------------

WIKIPEDIA_EVENTS_LIST = "https://en.wikipedia.org/wiki/List_of_UFC_events"
WIKIPEDIA_FALLBACK_EVENT = "https://en.wikipedia.org/wiki/UFC_329"  # temporary fallback


def find_next_ufc_event_url():
    """
    Scrape https://en.wikipedia.org/wiki/List_of_UFC_events to find the next
    upcoming event: the first table row in the 'Upcoming events' section whose
    date is >= today.
    Falls back to WIKIPEDIA_FALLBACK_EVENT if the list page fails.
    """
    headers = {"User-Agent": "Mozilla/5.0 (compatible; fightmetrics-bot/1.0)"}
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    try:
        resp = requests.get(WIKIPEDIA_EVENTS_LIST, headers=headers, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as exc:
        print(f"[WIKI] Failed to fetch events list: {exc}")
        print(f"[WIKI] Falling back to {WIKIPEDIA_FALLBACK_EVENT}")
        return WIKIPEDIA_FALLBACK_EVENT

    soup = BeautifulSoup(resp.text, "html.parser")

    # Find the "Upcoming events" section by its heading anchor
    upcoming_anchor = (
        soup.find(id="Upcoming_events")
        or soup.find(id="Upcoming")
        or soup.find("span", id=re.compile(r"upcoming", re.I))
    )
    if upcoming_anchor is None:
        # Try finding by heading text
        for heading in soup.find_all(["h2", "h3"]):
            if re.search(r"upcoming", heading.get_text(), re.I):
                upcoming_anchor = heading
                break

    if upcoming_anchor is None:
        print("[WIKI] Could not find 'Upcoming events' section on events list page.")
        print(f"[WIKI] Falling back to {WIKIPEDIA_FALLBACK_EVENT}")
        return WIKIPEDIA_FALLBACK_EVENT

    # Walk forward from the heading to find the first table
    section_start = upcoming_anchor.find_parent() or upcoming_anchor
    upcoming_table = None
    for sibling in section_start.find_next_siblings():
        tag = sibling.name
        if tag in ("h2", "h3") and sibling != section_start:
            break  # left the upcoming section
        if tag == "table":
            upcoming_table = sibling
            break

    if upcoming_table is None:
        print("[WIKI] No table found in 'Upcoming events' section.")
        print(f"[WIKI] Falling back to {WIKIPEDIA_FALLBACK_EVENT}")
        return WIKIPEDIA_FALLBACK_EVENT

    # Scan table rows for the first row whose date >= today
    for row in upcoming_table.find_all("tr"):
        cells = row.find_all(["td", "th"])
        if not cells:
            continue
        row_text = " ".join(c.get_text(separator=" ", strip=True) for c in cells)

        # Look for a date pattern YYYY-MM-DD or "Month DD, YYYY"
        date_match = re.search(r"(\d{4}-\d{2}-\d{2})", row_text)
        if not date_match:
            # Try "July 12, 2026" etc.
            m2 = re.search(
                r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,?\s+\d{4}",
                row_text,
            )
            if m2:
                try:
                    date_match_str = re.sub(r",", "", m2.group(0))
                    parsed = datetime.strptime(date_match_str, "%B %d %Y")
                    row_date = parsed.strftime("%Y-%m-%d")
                except ValueError:
                    continue
            else:
                continue
        else:
            row_date = date_match.group(1)

        if row_date < today_str:
            continue  # past event

        # Found a future event — grab the first UFC event link in this row
        link = row.find("a", href=re.compile(r"/wiki/UFC"))
        if link:
            url = WIKIPEDIA_BASE + link["href"]
            print(f"[WIKI] Next event row: date={row_date}, url={url}")
            return url

    print("[WIKI] No future event rows found in upcoming table.")
    print(f"[WIKI] Falling back to {WIKIPEDIA_FALLBACK_EVENT}")
    return WIKIPEDIA_FALLBACK_EVENT


def parse_wikipedia_event(url):
    """Fetch a Wikipedia UFC event page and extract event name, date, and fight card."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; fightmetrics-bot/1.0)"}
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as exc:
        print(f"[WIKI] Failed to fetch event page {url}: {exc}")
        return None, None, []

    soup = BeautifulSoup(resp.text, "html.parser")

    # --- Event name from page title or h1 ---
    h1 = soup.find("h1", id="firstHeading")
    event_name = h1.get_text(strip=True) if h1 else url.split("/wiki/")[-1].replace("_", " ")

    # --- Event date from infobox ---
    event_date = None
    infobox = soup.find("table", class_=re.compile(r"infobox"))
    if infobox:
        for row in infobox.find_all("tr"):
            header_td = row.find("th")
            if header_td and re.search(r"date", header_td.get_text(), re.I):
                val_td = row.find("td")
                if val_td:
                    date_text = val_td.get_text(separator=" ", strip=True)
                    # Try to parse various date formats
                    for fmt in ("%B %d, %Y", "%d %B %Y", "%Y-%m-%d"):
                        try:
                            # Strip parenthetical timezone info
                            clean = re.sub(r"\(.*?\)", "", date_text).strip()
                            # Remove ordinal suffixes
                            clean = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", clean)
                            event_date = datetime.strptime(clean, fmt).strftime("%Y-%m-%d")
                            break
                        except ValueError:
                            continue

    # --- Fight card from tables ---
    fights = []
    seen_pairs = set()

    # Wikipedia fight card tables have headers like "Results", "Card", "Bout"
    for table in soup.find_all("table"):
        headers_text = " ".join(
            th.get_text(strip=True) for th in table.find_all("th")
        ).lower()
        if not any(kw in headers_text for kw in ("weight class", "bout", "result", "method")):
            continue

        for row in table.find_all("tr"):
            cells = row.find_all(["td", "th"])
            if len(cells) < 2:
                continue

            # Try to extract two fighter names from the row
            # Common pattern: cell containing "X vs. Y" or two separate cells
            row_text = " ".join(c.get_text(separator=" ", strip=True) for c in cells)

            vs_match = re.search(
                r"([A-Z][a-zA-Z'\-\.]+(?:\s+[A-Z][a-zA-Z'\-\.]+)+)\s+(?:vs\.?|v\.)\s+"
                r"([A-Z][a-zA-Z'\-\.]+(?:\s+[A-Z][a-zA-Z'\-\.]+)+)",
                row_text,
            )
            if vs_match:
                raw_a = vs_match.group(1).strip()
                raw_b = vs_match.group(2).strip()
                pair = tuple(sorted([raw_a.lower(), raw_b.lower()]))
                if pair not in seen_pairs and len(raw_a) > 3 and len(raw_b) > 3:
                    seen_pairs.add(pair)
                    fights.append({"rawA": raw_a, "rawB": raw_b})

    print(f"[WIKI] Event: {event_name} | Date: {event_date} | Fights found: {len(fights)}")
    return event_name, event_date, fights


def scrape_canonical_card():
    """
    Step A: Scrape Wikipedia for the canonical fight card.
    Returns (event_name, event_date, fights) where fights = [{"rawA":..,"rawB":..}].
    """
    print("[WIKI] Finding next UFC event on Wikipedia...")
    event_url = find_next_ufc_event_url()
    if event_url:
        print(f"[WIKI] Found event URL: {event_url}")
        event_name, event_date, fights = parse_wikipedia_event(event_url)
        if fights:
            return event_name, event_date, fights
        print("[WIKI] No fights parsed from Wikipedia page.")
    else:
        print("[WIKI] Could not find event URL on Wikipedia index.")

    # Tapology fallback: not implemented in this version — return empty
    print("[WARN] Wikipedia scrape failed or returned no fights. Card will be built from TheRundown only.")
    return None, None, []


# ---------------------------------------------------------------------------
# Part D — TheRundown odds fetch
# ---------------------------------------------------------------------------

def format_american(price):
    if price is None:
        return None
    try:
        val = int(round(float(price)))
    except (TypeError, ValueError):
        return None
    return f"+{val}" if val > 0 else str(val)


def fetch_events_for_date(api_key, date_str):
    url = f"{THERUNDOWN_BASE}/{date_str}"
    headers = {"X-TheRundown-Key": api_key}
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    events = data.get("events", [])
    print(f"  {date_str}: {len(events)} event(s)")
    return events


def fetch_all_events(api_key):
    today = datetime.now(timezone.utc).date()
    dates = [today + timedelta(days=i) for i in range(21)]  # 21-day lookahead
    all_events, seen_ids = [], set()
    for d in dates:
        date_str = d.strftime("%Y-%m-%d")
        try:
            events = fetch_events_for_date(api_key, date_str)
        except requests.RequestException as exc:
            print(f"  [WARN] Failed to fetch {date_str}: {exc}")
            continue
        time.sleep(1.0)
        for ev in events:
            eid = ev.get("event_id")
            if eid and eid not in seen_ids:
                seen_ids.add(eid)
                all_events.append(ev)
    return all_events


def parse_event_date(event):
    raw = event.get("event_date", "")
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).astimezone(timezone.utc)
    except (AttributeError, ValueError):
        return None


def same_weekend_filter(events):
    dts = [parse_event_date(ev) for ev in events]
    valid = [(ev, dt) for ev, dt in zip(events, dts) if dt is not None]
    if not valid:
        return events
    earliest = min(dt for _, dt in valid)
    cutoff = earliest + timedelta(days=1)
    kept = [ev for ev, dt in valid if dt <= cutoff]
    removed = len(events) - len(kept)
    if removed:
        print(f"[FILTER] Dropped {removed} event(s) outside 1-day window of {earliest.strftime('%Y-%m-%d')}")
    return kept


def filter_ufc_only(events):
    kept = []
    for ev in events:
        league = ev.get("schedule", {}).get("league_name", "")
        if league == "Ultimate Fighting Championship":
            kept.append(ev)
        else:
            teams = ev.get("teams", [])
            names = [t.get("name", "") for t in teams]
            print(f"[SKIP] Non-UFC ({league!r}): {' vs '.join(names)}")
    return kept


def filter_duplicate_fighters(events):
    seen, kept = set(), []
    for ev in events:
        teams = ev.get("teams", [])
        names = [t.get("name", "").strip() for t in teams if t.get("name")]
        if any(n in seen for n in names):
            print(f"[SKIP] Duplicate fighter appearance: {' vs '.join(names)}")
            continue
        kept.append(ev)
        seen.update(names)
    return kept


def _pick_price_from_lines(lines):
    for line in lines:
        prices = line.get("prices", {})
        preferred = prices.get(str(PREFERRED_AFFILIATE))
        if preferred is not None:
            return preferred.get("price")
    for line in lines:
        prices = line.get("prices", {})
        for aff_data in prices.values():
            p = aff_data.get("price")
            if p is not None:
                return p
    return None


def extract_odds(event, team_a, team_b):
    markets = event.get("markets", [])
    moneyline = next((m for m in markets if m.get("market_id") == 1), None)
    if moneyline is None:
        return None, None
    odds = {}
    for participant in moneyline.get("participants", []):
        name = participant.get("name", "")
        price = _pick_price_from_lines(participant.get("lines", []))
        if name and price is not None:
            odds[name] = price
    return odds.get(team_a), odds.get(team_b)


def build_rundown_lookup(events):
    """Build a lookup: (raw_a_lower, raw_b_lower) -> event dict, for all orderings."""
    lookup = {}
    for ev in events:
        teams = ev.get("teams", [])
        if len(teams) < 2:
            continue
        n0 = teams[0].get("name", "").strip()
        n1 = teams[1].get("name", "").strip()
        if not n0 or not n1:
            continue
        lookup[(n0.lower(), n1.lower())] = (ev, n0, n1)
        lookup[(n1.lower(), n0.lower())] = (ev, n1, n0)
    return lookup


def fuzzy_find_rundown_match(raw_a, raw_b, rundown_events):
    """
    Find the best TheRundown event matching rawA and rawB using fuzzy matching.
    Returns (event, td_name_a, td_name_b) or (None, None, None).
    """
    best_score, best_result = 0.0, (None, None, None)

    for ev in rundown_events:
        teams = ev.get("teams", [])
        if len(teams) < 2:
            continue
        n0 = teams[0].get("name", "").strip()
        n1 = teams[1].get("name", "").strip()
        if not n0 or not n1:
            continue

        for (a_cand, b_cand) in [(n0, n1), (n1, n0)]:
            score_a = difflib.SequenceMatcher(None, raw_a.lower(), a_cand.lower()).ratio()
            score_b = difflib.SequenceMatcher(None, raw_b.lower(), b_cand.lower()).ratio()
            combined = (score_a + score_b) / 2
            if combined > best_score and score_a > 0.5 and score_b > 0.5:
                best_score = combined
                best_result = (ev, a_cand, b_cand)

    return best_result


# ---------------------------------------------------------------------------
# Part E — Write output
# ---------------------------------------------------------------------------

def js_value(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    return json.dumps(v)


def write_card_js(card, event_name, path=OUTPUT_JS):
    lines = ["export const UPCOMING_CARD = ["]
    for entry in card:
        lines.append(
            "  {{ fighterA: {fighterA}, fighterB: {fighterB}, "
            "oddsA: {oddsA}, oddsB: {oddsB}, date: {date}, "
            "eventName: {eventName}, debutFighter: {debutFighter} }},".format(
                fighterA=js_value(entry["fighterA"]),
                fighterB=js_value(entry["fighterB"]),
                oddsA=js_value(entry["oddsA"]),
                oddsB=js_value(entry["oddsB"]),
                date=js_value(entry["date"]),
                eventName=js_value(entry.get("eventName", event_name)),
                debutFighter=js_value(entry["debutFighter"]),
            )
        )
    lines.append("];")
    lines.append("")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    api_key = os.environ.get("THERUNDOWN_API_KEY")
    if not api_key:
        print("ERROR: THERUNDOWN_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    roster_data = load_roster()
    roster_names = build_roster_names(roster_data)
    roster_by_name = {entry["name"]: entry for entry in roster_data if entry.get("name")}
    print(f"Loaded {len(roster_names)} roster names")

    # --- Step A: Canonical card from Wikipedia ---
    event_name, event_date, canonical_fights = scrape_canonical_card()
    wiki_ok = bool(canonical_fights)

    # --- Step D: TheRundown events ---
    print("\nFetching events from TheRundown API (today + 2 days):")
    all_td_events = fetch_all_events(api_key)
    print(f"Total unique TheRundown events: {len(all_td_events)}")

    td_filtered = same_weekend_filter(all_td_events)
    td_filtered = filter_ufc_only(td_filtered)
    td_filtered = filter_duplicate_fighters(td_filtered)
    td_filtered = [
        ev for ev in td_filtered
        if not any(
            t.get("name", "").strip() in EXCLUDED_FIGHTERS
            for t in ev.get("teams", [])
        )
    ]
    print(f"{len(td_filtered)} TheRundown UFC event(s) after filters")

    # --- Build card ---
    card = []
    matched_odds_count = 0
    unmatched_odds = []
    debut_fighters = []

    if wiki_ok:
        # Two-source: canonical fights from Wikipedia, odds joined from TheRundown
        td_matched_ids = set()

        for fight in canonical_fights:
            raw_a, raw_b = fight["rawA"], fight["rawB"]

            # Step B: roster matching
            fighter_a, matched_a = match_name(raw_a, roster_names)
            fighter_b, matched_b = match_name(raw_b, roster_names)

            if not matched_a:
                print(f"[WARN] No roster match for '{raw_a}' — using raw name")
            if not matched_b:
                print(f"[WARN] No roster match for '{raw_b}' — using raw name")

            # Step C: debut detection
            debut_a = is_debut(fighter_a, matched_a, roster_by_name)
            debut_b = is_debut(fighter_b, matched_b, roster_by_name)
            debut = debut_a or debut_b
            if debut:
                debut_fighters.append(f"{fighter_a} vs {fighter_b}")

            # Step D: join odds from TheRundown
            td_ev, td_name_a, td_name_b = fuzzy_find_rundown_match(raw_a, raw_b, td_filtered)
            odds_a, odds_b = None, None
            if td_ev is not None:
                raw_odds_a, raw_odds_b = extract_odds(td_ev, td_name_a, td_name_b)
                odds_a = format_american(raw_odds_a)
                odds_b = format_american(raw_odds_b)
                matched_odds_count += 1
                td_matched_ids.add(td_ev.get("event_id"))
            else:
                unmatched_odds.append(f"{raw_a} vs {raw_b}")

            card.append({
                "fighterA": fighter_a,
                "fighterB": fighter_b,
                "oddsA": odds_a,
                "oddsB": odds_b,
                "date": event_date,
                "eventName": event_name,
                "debutFighter": debut,
            })
            status = f"odds={odds_a}/{odds_b}" if odds_a else "no odds"
            print(f"[OK] {fighter_a} vs {fighter_b} — {status}")

        # Report TheRundown fights that didn't match any canonical fight
        unmatched_td = []
        for ev in td_filtered:
            if ev.get("event_id") not in td_matched_ids:
                teams = ev.get("teams", [])
                names = [t.get("name", "") for t in teams]
                unmatched_td.append(" vs ".join(names))

    else:
        # Fallback: build card entirely from TheRundown (legacy behavior)
        print("[FALLBACK] Building card from TheRundown only (no Wikipedia canonical card)")
        event_name = event_name or "UFC Event"
        event_date_from_td = None

        for ev in td_filtered:
            teams = ev.get("teams", [])
            if len(teams) < 2:
                continue
            raw_a = teams[0].get("name", "").strip()
            raw_b = teams[1].get("name", "").strip()
            if not raw_a or not raw_b:
                continue

            fighter_a, matched_a = match_name(raw_a, roster_names)
            fighter_b, matched_b = match_name(raw_b, roster_names)

            if not matched_a:
                print(f"[WARN] No roster match for '{raw_a}'")
            if not matched_b:
                print(f"[WARN] No roster match for '{raw_b}'")

            debut_a = is_debut(fighter_a, matched_a, roster_by_name)
            debut_b = is_debut(fighter_b, matched_b, roster_by_name)
            debut = debut_a or debut_b
            if debut:
                debut_fighters.append(f"{fighter_a} vs {fighter_b}")

            raw_odds_a, raw_odds_b = extract_odds(ev, raw_a, raw_b)
            odds_a = format_american(raw_odds_a)
            odds_b = format_american(raw_odds_b)
            if odds_a or odds_b:
                matched_odds_count += 1

            dt = parse_event_date(ev)
            date_str = dt.strftime("%Y-%m-%d") if dt else None
            if event_date_from_td is None:
                event_date_from_td = date_str

            card.append({
                "fighterA": fighter_a,
                "fighterB": fighter_b,
                "oddsA": odds_a,
                "oddsB": odds_b,
                "date": date_str,
                "eventName": event_name,
                "debutFighter": debut,
            })
            print(f"[OK] {fighter_a} ({odds_a}) vs {fighter_b} ({odds_b}) — {date_str}")

        if event_date is None:
            event_date = event_date_from_td
        unmatched_td = []

    # Deduplicate on (fighterA, fighterB) pair
    seen_pairs, deduped = set(), []
    for entry in card:
        key = tuple(sorted([entry["fighterA"], entry["fighterB"]]))
        if key not in seen_pairs:
            seen_pairs.add(key)
            deduped.append(entry)

    write_card_js(deduped, event_name)

    # --- Verification report ---
    print("\n" + "=" * 60)
    print("VERIFICATION REPORT")
    print("=" * 60)
    print(f"Event:          {event_name}")
    print(f"Date:           {event_date}")
    print(f"Source:         {'Wikipedia + TheRundown' if wiki_ok else 'TheRundown only'}")
    print(f"Canonical fights: {len(canonical_fights) if wiki_ok else 'N/A'}")
    print(f"Card written:   {len(deduped)} fights")
    print(f"Odds matched:   {matched_odds_count}")
    if unmatched_odds:
        print(f"Missing odds ({len(unmatched_odds)}):")
        for f in unmatched_odds:
            print(f"  - {f}")
    if wiki_ok and unmatched_td:
        print(f"TheRundown fights NOT on canonical card ({len(unmatched_td)}) — dropped:")
        for f in unmatched_td:
            print(f"  - {f}")
    if debut_fighters:
        print(f"Debut fighters ({len(debut_fighters)}):")
        for f in debut_fighters:
            print(f"  - {f}")
    print(f"\nWrote {len(deduped)} fights to {OUTPUT_JS}")


if __name__ == "__main__":
    main()
