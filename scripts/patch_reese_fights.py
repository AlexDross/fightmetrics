"""
Patch: rename "Zach Reese" -> "Zachary Reese" across all source CSVs so
update_fighters.py correctly updates the canonical "Zachary Reese" entry
and drops the stale "Zach Reese" duplicate from fightersData.js.
"""

import os, re, sys
import pandas as pd

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OLD = "Zach Reese"
NEW = "Zachary Reese"

# ── 1. ufc_fight_results.csv ─ rename in BOUT column ────────────────────────
results_path = os.path.join(BASE, "ufc_fight_results.csv")
df = pd.read_csv(results_path, dtype=str)
before = df["BOUT"].str.contains(OLD, na=False).sum()
df["BOUT"] = df["BOUT"].str.replace(OLD, NEW, regex=False)
df.to_csv(results_path, index=False)
print(f"ufc_fight_results.csv : renamed {before} BOUT cells  ({OLD} → {NEW})")

# ── 2. ufc_fight_stats.csv ─ rename in FIGHTER and BOUT columns ─────────────
stats_path = os.path.join(BASE, "ufc_fight_stats.csv")
df = pd.read_csv(stats_path, dtype=str)
before_f = (df["FIGHTER"] == OLD).sum()
before_b = df["BOUT"].str.contains(OLD, na=False).sum()
df["FIGHTER"] = df["FIGHTER"].str.replace(OLD, NEW, regex=False)
df["BOUT"]    = df["BOUT"].str.replace(OLD, NEW, regex=False)
df.to_csv(stats_path, index=False)
print(f"ufc_fight_stats.csv   : renamed {before_f} FIGHTER cells, "
      f"{before_b} BOUT cells")

# ── 3. ufc_fight_details.csv ─ rename in BOUT column ───────────────────────
details_path = os.path.join(BASE, "ufc_fight_details.csv")
df = pd.read_csv(details_path, dtype=str)
before = df["BOUT"].str.contains(OLD, na=False).sum()
df["BOUT"] = df["BOUT"].str.replace(OLD, NEW, regex=False)
df.to_csv(details_path, index=False)
print(f"ufc_fight_details.csv : renamed {before} BOUT cells")

# ── 4. fightersData.js ─ remove stale "Zach Reese" entry ────────────────────
js_path = os.path.join(BASE, "src", "fightersData.js")
with open(js_path) as f:
    content = f.read()

# Find and remove the "Zach Reese" object (including trailing comma + newline)
pattern = r",?\n  \{n:'Zach Reese'[^}]+\}"
matches = re.findall(pattern, content)
if not matches:
    # Try without leading comma
    pattern = r"\n  \{n:'Zach Reese'[^}]+\},?"
    matches = re.findall(pattern, content)

if matches:
    new_content = re.sub(pattern, "", content, count=1)
    with open(js_path, "w") as f:
        f.write(new_content)
    print(f"fightersData.js       : removed stale 'Zach Reese' entry")
else:
    print("fightersData.js       : 'Zach Reese' entry not found (already clean?)")

print("\nDone. Run:  python3 update_fighters.py")
