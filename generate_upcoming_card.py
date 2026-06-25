#!/usr/bin/env python3
"""
generate_upcoming_card.py
Fetches upcoming UFC fights + odds from The Odds API and writes src/upcomingCard.js.

Strategy:
  1. Query The Odds API for upcoming MMA events (h2h, US books, American odds).
  2. Keep only UFC events (heuristic: event looks like UFC, or both fighters
     fuzzy-match our roster from fighters.json).
  3. Fuzzy-match each fighter name to the roster so downstream lookups in
     App.js (FIGHTERS.find(...)) succeed on exact names.
  4. Write src/upcomingCard.js as `export const UPCOMING_CARD = [...]`.

Usage:
  ODDS_API_KEY=xxxx python generate_upcoming_card.py
"""

import os
import sys
import json
import difflib
from datetime import datetime, timedelta, timezone

import requests

ODDS_API_URL = "https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds/"
SPORT_KEY = "mma_mixed_martial_arts"
FIGHTERS_JSON = "fighters.json"
OUTPUT_JS = "src/upcomingCard.js"
MATCH_CUTOFF = 0.75


def load_roster(path=FIGHTERS_JSON):
    """Return the list of roster fighter names (the `name` field)."""
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return [entry["name"] for entry in data if entry.get("name")]


def name_variants(raw_name):
    """Generate name variants to try against the roster.

    (a) original, (b) reversed word order, (c) first + last word only
    (drops any middle names). Order-preserving, de-duplicated.
    """
    words = raw_name.split()
    variants = [raw_name]
    if len(words) > 1:
        variants.append(" ".join(reversed(words)))
    if len(words) > 2:
        variants.append(f"{words[0]} {words[-1]}")
    # de-dup while preserving order
    seen = set()
    unique = []
    for v in variants:
        if v not in seen:
            seen.add(v)
            unique.append(v)
    return unique


def match_name(raw_name, roster_names):
    """Fuzzy-match a raw Odds API name to the roster.

    Tries several name variants (original, reversed, first+last) and keeps the
    best-scoring roster hit across all of them.

    Returns (matched_name, was_matched). On no match, returns the raw name
    unchanged so the entry is still written (and a warning is logged).
    """
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
    """Format an American odds integer as a string with explicit sign.

    Returns None if price is missing/unparseable.
    """
    if price is None:
        return None
    try:
        val = int(round(float(price)))
    except (TypeError, ValueError):
        return None
    return f"+{val}" if val > 0 else str(val)


def extract_h2h_prices(event):
    """Return {team_name: american_price_int} from the first bookmaker that has h2h."""
    for bookmaker in event.get("bookmakers", []):
        for market in bookmaker.get("markets", []):
            if market.get("key") != "h2h":
                continue
            prices = {}
            for outcome in market.get("outcomes", []):
                name = outcome.get("name")
                if name is not None:
                    prices[name] = outcome.get("price")
            if prices:
                return prices
    return {}


def looks_like_ufc(event, a_matched, b_matched):
    """Heuristic: event is UFC if its description mentions UFC, or both
    fighters are on our (UFC) roster."""
    haystack = " ".join(
        str(event.get(k, "")) for k in ("sport_title", "home_team", "away_team")
    ).upper()
    if "UFC" in haystack:
        return True
    return a_matched and b_matched


def fetch_events(api_key):
    params = {
        "apiKey": api_key,
        "regions": "us",
        "markets": "h2h",
        "oddsFormat": "american",
        "daysFrom": 14,
    }
    resp = requests.get(ODDS_API_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def parse_commence(commence):
    """Parse an Odds API commence_time into a UTC-aware datetime, or None."""
    try:
        return datetime.fromisoformat(commence.replace("Z", "+00:00")).astimezone(
            timezone.utc
        )
    except (AttributeError, ValueError):
        return None


def filter_by_date(events, days=14):
    """Keep only events whose commence_time is within `days` from now (UTC)."""
    cutoff = datetime.now(timezone.utc) + timedelta(days=days)
    kept = []
    for event in events:
        dt = parse_commence(event.get("commence_time"))
        if dt is None:
            print(f"[WARN] Unparseable commence_time, dropping event {event.get('id')}")
            continue
        if dt <= cutoff:
            kept.append(event)
        else:
            print(
                f"[FILTER] Beyond {days}d window: "
                f"{event.get('home_team')} vs {event.get('away_team')} "
                f"({dt.strftime('%Y-%m-%d')})"
            )
    return kept


def earliest_event_only(events):
    """Keep only events within 2 days of the earliest commence date."""
    dts = [parse_commence(e.get("commence_time")) for e in events]
    dts = [dt for dt in dts if dt is not None]
    if not dts:
        return events
    min_dt = min(dts)
    cutoff = min_dt + timedelta(days=2)
    return [
        e for e in events
        if (dt := parse_commence(e.get("commence_time"))) is not None and dt <= cutoff
    ]


def build_card(events, roster_names):
    card = []
    for event in events:
        if event.get("sport_key") != SPORT_KEY:
            continue

        raw_a = event.get("home_team")
        raw_b = event.get("away_team")
        if not raw_a or not raw_b:
            print(f"[WARN] Skipping event with missing teams: {event.get('id')}")
            continue

        prices = extract_h2h_prices(event)

        fighter_a, matched_a = match_name(raw_a, roster_names)
        fighter_b, matched_b = match_name(raw_b, roster_names)

        if not looks_like_ufc(event, matched_a, matched_b):
            print(f"[SKIP] Non-UFC event: {raw_a} vs {raw_b}")
            continue

        if not matched_a:
            print(f"[WARN] No roster match for '{raw_a}' — using raw name")
        if not matched_b:
            print(f"[WARN] No roster match for '{raw_b}' — using raw name")

        # Odds keyed by the raw API names.
        odds_a = format_american(prices.get(raw_a))
        odds_b = format_american(prices.get(raw_b))

        dt = parse_commence(event.get("commence_time"))
        if dt is None:
            print(f"[WARN] Bad commence_time for {raw_a} vs {raw_b}")
            date_str = None
        else:
            date_str = dt.strftime("%Y-%m-%d")

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
    """Render a Python value as a JS literal for the output file."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    # strings
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
    api_key = os.environ.get("ODDS_API_KEY")
    if not api_key:
        print("ERROR: ODDS_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    roster_names = load_roster()
    print(f"Loaded {len(roster_names)} roster names")

    try:
        events = fetch_events(api_key)
    except requests.RequestException as exc:
        print(f"ERROR: Odds API request failed: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Fetched {len(events)} MMA events from The Odds API")

    events = filter_by_date(events, days=14)
    print(f"{len(events)} events within the 14-day window")

    events = earliest_event_only(events)
    print(f"{len(events)} events on the earliest weekend card")

    card = build_card(events, roster_names)
    deduped = dedupe_card(card)
    removed = len(card) - len(deduped)
    if removed:
        print(f"\nDeduplicated {removed} duplicate matchup(s)")
    write_card_js(deduped)
    print(f"\nWrote {len(deduped)} fights to {OUTPUT_JS}")


if __name__ == "__main__":
    main()
