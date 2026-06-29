#!/usr/bin/env python3
"""
generate_card_intel.py
Fight-week intel pipeline: odds history, news, flags, injuries via Claude API.

Reads:  src/upcomingCard.js  (written by generate_upcoming_card.py)
Reads:  src/cardIntel.js     (existing intel, merged and updated)
Writes: src/cardIntel.js

Usage:
  ANTHROPIC_API_KEY=xxxx python generate_card_intel.py

Does NOT require THERUNDOWN_API_KEY.
"""

import os
import sys
import json
import re
import difflib
from datetime import datetime, timezone

import anthropic

UPCOMING_CARD_JS = "src/upcomingCard.js"
CARD_INTEL_JS = "src/cardIntel.js"


# ---------------------------------------------------------------------------
# Step A — Parse src/upcomingCard.js
# ---------------------------------------------------------------------------

def parse_upcoming_card(path=UPCOMING_CARD_JS):
    """Extract the UPCOMING_CARD array from the JS file using regex."""
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()

    # Extract the array literal
    m = re.search(r"export const UPCOMING_CARD\s*=\s*(\[.*?\]);", content, re.DOTALL)
    if not m:
        raise ValueError(f"Could not find UPCOMING_CARD array in {path}")

    # Convert JS object literals to JSON:
    # - unquoted keys -> quoted keys
    # - null remains null, true/false remain as-is
    js_arr = m.group(1)
    # Quote unquoted object keys
    js_arr = re.sub(r'(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1 "\2":', js_arr)
    # Remove trailing commas before } or ]
    js_arr = re.sub(r',\s*([}\]])', r'\1', js_arr)

    try:
        card = json.loads(js_arr)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Failed to parse UPCOMING_CARD JS as JSON: {exc}")

    return card


# ---------------------------------------------------------------------------
# Step A — Parse existing src/cardIntel.js
# ---------------------------------------------------------------------------

def parse_card_intel(path=CARD_INTEL_JS):
    """Read existing cardIntel.js and return the CARD_INTEL dict, or {} if missing."""
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()

    m = re.search(r"export const CARD_INTEL\s*=\s*(\{.*?\});", content, re.DOTALL)
    if not m:
        return {}

    js_obj = m.group(1)
    # Convert JS to JSON
    js_obj = re.sub(r'(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1 "\2":', js_obj)
    js_obj = re.sub(r',\s*([}\]])', r'\1', js_obj)

    try:
        return json.loads(js_obj)
    except json.JSONDecodeError:
        print("[WARN] Could not parse existing cardIntel.js — starting fresh")
        return {}


# ---------------------------------------------------------------------------
# Step B — Canonical fight key
# ---------------------------------------------------------------------------

def fight_key(fighter_a, fighter_b):
    """Alphabetically-sorted stable key: 'A vs. B'."""
    pair = sorted([fighter_a, fighter_b])
    return f"{pair[0]} vs. {pair[1]}"


# ---------------------------------------------------------------------------
# Step C — Odds history append
# ---------------------------------------------------------------------------

def update_odds_history(existing_history, odds_a, odds_b):
    """Append today's odds if not already present for today's date."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for entry in existing_history:
        if entry.get("date") == today:
            return existing_history  # already have today's entry
    new_entry = {"date": today, "oddsA": odds_a, "oddsB": odds_b}
    return existing_history + [new_entry]


# ---------------------------------------------------------------------------
# Step D — Claude API news/flag fetch
# ---------------------------------------------------------------------------

def fetch_fight_intel(client, fighter_a, fighter_b):
    """
    Call Claude with web search to get flags, injuries, and news for a fight.
    Returns dict with keys: flags, injuries, news.
    """
    prompt = f"""Search for recent news (last 30 days) about the upcoming UFC fight: {fighter_a} vs {fighter_b}.

Return ONLY a valid JSON object with NO markdown formatting, NO backticks, NO preamble:

{{
  "flags": [
    {{"type": "TRAVEL|INJURY|SHORT_NOTICE|WEIGHT|CAMP_CHANGE|SUSPENSION", "severity": "high|medium|low", "text": "one concrete sentence with source"}}
  ],
  "injuries": ["description if any"],
  "news": [
    {{"date": "YYYY-MM-DD", "text": "news item one sentence"}}
  ]
}}

Flag criteria — only flag if concrete news evidence exists:
- TRAVEL: fighter traveling more than 2 time zones, or US-based fighter going to international event
- INJURY: any reported injury or health issue, even "training through it"
- SHORT_NOTICE: fighter accepted the fight with less than 3 weeks notice
- WEIGHT: missed weight, difficult weight cut, or moving up/down more than one weight class
- CAMP_CHANGE: new head coach, gym switch, or notable training camp disruption
- SUSPENSION: USADA, VADA, or athletic commission issue

Return empty arrays if no concrete evidence. Do not speculate."""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 3}],
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIError as exc:
        print(f"  [WARN] Claude API error for {fighter_a} vs {fighter_b}: {exc}")
        return {"flags": [], "injuries": [], "news": []}

    # Extract text content from response
    text_content = ""
    for block in response.content:
        if hasattr(block, "text"):
            text_content += block.text

    # Parse JSON from the response
    # Strip any accidental markdown fences
    text_content = re.sub(r"```(?:json)?", "", text_content).strip()

    try:
        result = json.loads(text_content)
    except json.JSONDecodeError:
        # Try to find a JSON object within the text
        json_match = re.search(r"\{.*\}", text_content, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group(0))
            except json.JSONDecodeError:
                print(f"  [WARN] Could not parse JSON for {fighter_a} vs {fighter_b}")
                return {"flags": [], "injuries": [], "news": []}
        else:
            print(f"  [WARN] No JSON found in response for {fighter_a} vs {fighter_b}")
            return {"flags": [], "injuries": [], "news": []}

    return {
        "flags": result.get("flags", []),
        "injuries": result.get("injuries", []),
        "news": result.get("news", []),
    }


def merge_news(existing_news, fresh_news):
    """Append fresh news items that don't already exist (deduplicate by text similarity)."""
    merged = list(existing_news)
    for item in fresh_news:
        new_text = item.get("text", "")
        already_exists = any(
            difflib.SequenceMatcher(None, new_text.lower(), ex.get("text", "").lower()).ratio() > 0.8
            for ex in merged
        )
        if not already_exists:
            merged.append(item)
    # Sort by date descending
    merged.sort(key=lambda x: x.get("date", ""), reverse=True)
    return merged


# ---------------------------------------------------------------------------
# Step E — Write src/cardIntel.js
# ---------------------------------------------------------------------------

def write_card_intel(intel, path=CARD_INTEL_JS):
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    lines = [
        "// Auto-generated by generate_card_intel.py — do not edit manually",
        f"// Last updated: {now_iso}",
        "",
        "export const CARD_INTEL = {",
    ]

    for key, data in intel.items():
        lines.append(f"  {json.dumps(key)}: {{")
        for field, value in data.items():
            lines.append(f"    {field}: {json.dumps(value, default=str)},")
        lines.append("  },")

    lines.append("};")
    lines.append("")

    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    # Step A — Read inputs
    print(f"Reading {UPCOMING_CARD_JS}...")
    try:
        upcoming = parse_upcoming_card()
    except (FileNotFoundError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
    print(f"Found {len(upcoming)} fights in upcoming card")

    print(f"Reading {CARD_INTEL_JS}...")
    intel = parse_card_intel()
    print(f"Loaded {len(intel)} existing intel entries")

    client = anthropic.Anthropic(api_key=api_key)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    for fight in upcoming:
        fighter_a = fight.get("fighterA", "")
        fighter_b = fight.get("fighterB", "")
        odds_a = fight.get("oddsA")
        odds_b = fight.get("oddsB")
        event_name = fight.get("eventName", "")
        event_date = fight.get("date", "")
        debut = fight.get("debutFighter", False)

        key = fight_key(fighter_a, fighter_b)
        print(f"\n[{key}]")

        existing = intel.get(key, {})

        # Step C — Odds history
        history = existing.get("oddsHistory", [])
        history = update_odds_history(history, odds_a, odds_b)

        # Step D — Claude intel
        print(f"  Fetching intel from Claude for {fighter_a} vs {fighter_b}...")
        fresh_intel = fetch_fight_intel(client, fighter_a, fighter_b)
        print(f"  Flags: {len(fresh_intel['flags'])} | Injuries: {len(fresh_intel['injuries'])} | News: {len(fresh_intel['news'])}")

        # Merge: flags and injuries replace; news deduplicates
        merged_news = merge_news(existing.get("news", []), fresh_intel["news"])

        intel[key] = {
            "eventName": event_name,
            "eventDate": event_date,
            "flags": fresh_intel["flags"],         # always replace
            "injuries": fresh_intel["injuries"],   # always replace
            "news": merged_news,
            "oddsHistory": history,
            "debutFighter": debut,
            "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }

    # Step E — Write output
    write_card_intel(intel)
    print(f"\nWrote intel for {len(intel)} fights to {CARD_INTEL_JS}")


if __name__ == "__main__":
    main()
