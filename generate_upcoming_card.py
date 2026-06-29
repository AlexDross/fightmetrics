#!/usr/bin/env python3
"""
generate_upcoming_card.py
Fetches upcoming UFC fights + odds from TheRundown API and writes src/upcomingCard.js.

Strategy:
  1. Query TheRundown API (sport 7 = MMA/UFC) for events on today + next 2 days.
  2. Deduplicate by event_id, then keep only events within 1 day of the earliest
     event_date (same-weekend filter).
  3. Fuzzy-match each fighter name to the roster so downstream lookups succeed.
  4. Extract moneyline odds (market_id=1), preferring DraftKings (affiliate_id=19).
  5. Write src/upcomingCard.js as `export const UPCOMING_CARD = [...]`.

Usage:
  THERUNDOWN_API_KEY=xxxx python generate_upcoming_card.py
"""

import os
import sys
import json
import difflib
from datetime import datetime, timedelta, timezone

import time

import requests

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


def load_roster(path=FIGHTERS_JSON):
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return [entry["name"] for entry in data if entry.get("name")]


def name_variants(raw_name):
    words = raw_name.split()
    variants = [raw_name]
    if len(words) > 1:
        variants.append(" ".join(reversed(words)))
    if len(words) > 2:
        variants.append(f"{words[0]} {words[-1]}")
    seen = set()
    unique = []
    for v in variants:
        if v not in seen:
            seen.add(v)
            unique.append(v)
    return unique


def match_name(raw_name, roster_names):
    best_match = None
    best_score = 0.0
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


def format_american(price):
    if price is None:
        return None
    try:
        val = int(round(float(price)))
    except (TypeError, ValueError):
        return None
    return f"+{val}" if val > 0 else str(val)


def fetch_events_for_date(api_key, date_str):
    """Fetch events from TheRundown for a single date (YYYY-MM-DD)."""
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
    dates = [today + timedelta(days=i) for i in range(3)]
    all_events = []
    seen_ids = set()
    for d in dates:
        date_str = d.strftime("%Y-%m-%d")
        try:
            events = fetch_events_for_date(api_key, date_str)
        except requests.RequestException as exc:
            print(f"  [WARN] Failed to fetch {date_str}: {exc}")
            continue
        time.sleep(1)
        for ev in events:
            eid = ev.get("event_id")
            if eid and eid not in seen_ids:
                seen_ids.add(eid)
                all_events.append(ev)
    return all_events


def parse_event_date(event):
    """Parse event_date from a TheRundown event into a UTC-aware datetime."""
    raw = event.get("event_date", "")
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).astimezone(timezone.utc)
    except (AttributeError, ValueError):
        return None


def same_weekend_filter(events):
    """Keep only events within 1 day of the earliest event_date."""
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


def _pick_price_from_lines(lines):
    """Given a participant's lines list, return price for preferred affiliate or any."""
    for line in lines:
        prices = line.get("prices", {})
        preferred = prices.get(str(PREFERRED_AFFILIATE))
        if preferred is not None:
            return preferred.get("price")
    # Fall back to first available affiliate across all lines
    for line in lines:
        prices = line.get("prices", {})
        for aff_data in prices.values():
            p = aff_data.get("price")
            if p is not None:
                return p
    return None


def extract_odds(event, team_a, team_b):
    """Extract moneyline odds for team_a and team_b.

    Structure: markets[].participants[].lines[].prices[affiliate_id_str].price
    Prefers affiliate_id=19 (DraftKings), falls back to any available affiliate.
    """
    markets = event.get("markets", [])
    moneyline = None
    for m in markets:
        if m.get("market_id") == 1:
            moneyline = m
            break

    if moneyline is None:
        return None, None

    odds = {}
    for participant in moneyline.get("participants", []):
        name = participant.get("name", "")
        price = _pick_price_from_lines(participant.get("lines", []))
        if name and price is not None:
            odds[name] = price

    return odds.get(team_a), odds.get(team_b)


def filter_ufc_only(events):
    """Keep only events whose league_name is 'Ultimate Fighting Championship'."""
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
    """Skip any event where either fighter already appeared in an earlier event."""
    seen = set()
    kept = []
    for ev in events:
        teams = ev.get("teams", [])
        names = [t.get("name", "").strip() for t in teams if t.get("name")]
        if any(n in seen for n in names):
            print(f"[SKIP] Duplicate fighter appearance: {' vs '.join(names)}")
            continue
        kept.append(ev)
        seen.update(names)
    return kept


def build_card(events, roster_names):
    card = []
    for event in events:
        teams = event.get("teams", [])
        if len(teams) < 2:
            print(f"[WARN] Skipping event {event.get('event_id')} — fewer than 2 teams")
            continue

        raw_a = teams[0].get("name", "").strip()  # away
        raw_b = teams[1].get("name", "").strip()  # home
        if not raw_a or not raw_b:
            print(f"[WARN] Missing team name in event {event.get('event_id')}")
            continue

        fighter_a, matched_a = match_name(raw_a, roster_names)
        fighter_b, matched_b = match_name(raw_b, roster_names)

        if not matched_a:
            print(f"[WARN] No roster match for '{raw_a}' — using raw name")
        if not matched_b:
            print(f"[WARN] No roster match for '{raw_b}' — using raw name")

        raw_odds_a, raw_odds_b = extract_odds(event, raw_a, raw_b)
        odds_a = format_american(raw_odds_a)
        odds_b = format_american(raw_odds_b)

        dt = parse_event_date(event)
        date_str = dt.strftime("%Y-%m-%d") if dt else None

        card.append(
            {
                "fighterA": fighter_a,
                "fighterB": fighter_b,
                "oddsA": odds_a,
                "oddsB": odds_b,
                "date": date_str,
                "debutFighter": False,
            }
        )
        print(f"[OK] {fighter_a} ({odds_a}) vs {fighter_b} ({odds_b}) — {date_str}")

    return card


def dedupe_card(card):
    """Deduplicate on the (fighterA, fighterB) pair, keeping the entry with
    the most complete odds (both oddsA and oddsB non-null preferred)."""

    def completeness(entry):
        return (entry["oddsA"] is not None) + (entry["oddsB"] is not None)

    best = {}
    order = []
    for entry in card:
        key = (entry["fighterA"], entry["fighterB"])
        if key not in best:
            best[key] = entry
            order.append(key)
        elif completeness(entry) > completeness(best[key]):
            best[key] = entry
    return [best[key] for key in order]


def js_value(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    return json.dumps(v)


def write_card_js(card, path=OUTPUT_JS):
    lines = ["export const UPCOMING_CARD = ["]
    for entry in card:
        lines.append(
            "  {{ fighterA: {fighterA}, fighterB: {fighterB}, "
            "oddsA: {oddsA}, oddsB: {oddsB}, date: {date}, "
            "debutFighter: {debutFighter} }},".format(
                fighterA=js_value(entry["fighterA"]),
                fighterB=js_value(entry["fighterB"]),
                oddsA=js_value(entry["oddsA"]),
                oddsB=js_value(entry["oddsB"]),
                date=js_value(entry["date"]),
                debutFighter=js_value(entry["debutFighter"]),
            )
        )
    lines.append("];")
    lines.append("")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))


def main():
    api_key = os.environ.get("THERUNDOWN_API_KEY")
    if not api_key:
        print("ERROR: THERUNDOWN_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    roster_names = load_roster()
    print(f"Loaded {len(roster_names)} roster names")

    print("Fetching events from TheRundown API (today + 2 days):")
    all_events = fetch_all_events(api_key)
    print(f"Total unique events fetched: {len(all_events)}")

    filtered = same_weekend_filter(all_events)
    print(f"{len(filtered)} event(s) after same-weekend filter")

    filtered = filter_ufc_only(filtered)
    print(f"{len(filtered)} event(s) after UFC-only filter")

    filtered = filter_duplicate_fighters(filtered)
    print(f"{len(filtered)} event(s) after duplicate-fighter filter")

    filtered = [
        ev for ev in filtered
        if not any(
            t.get("name", "").strip() in EXCLUDED_FIGHTERS
            for t in ev.get("teams", [])
        )
    ]
    excluded_removed = len(filtered)
    print(f"{len(filtered)} event(s) after exclusion-list filter")

    card = build_card(filtered, roster_names)
    deduped = dedupe_card(card)
    removed = len(card) - len(deduped)
    if removed:
        print(f"\nDeduplicated {removed} duplicate matchup(s)")
    write_card_js(deduped)
    print(f"\nWrote {len(deduped)} fights to {OUTPUT_JS}")


if __name__ == "__main__":
    main()
