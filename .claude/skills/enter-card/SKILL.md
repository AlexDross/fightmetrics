---
name: enter-card
description: Research an upcoming UFC card and its current prediction-market odds, then enter every fight into the Upcoming tab through the Simulator's save path. Use when the user says enter the card, add the upcoming event, load this weekend's fights, or names an event to enter.
---

# Enter an upcoming card

Find the full card for an upcoming event, price every bout off a prediction
market, and save each fight into the Upcoming tab — the same move the
Simulator's **Save to Upcoming** button makes, written straight to the Supabase
document store that fightmetrics.app reads live.

This is the mirror image of `grade-card`: that skill moves fights out of
Upcoming into ROI, this one puts them in.

## The seam

`scripts/enter_upcoming.mjs` calls `buildRoiEntry()` and `addPendingEntry()` —
literally the two functions behind the Simulator's save button (`src/App.js`,
search `Save to Upcoming`). The model runs, the betting gate runs, bout context
applies, the entry shape is identical. **Never hand-write an entry**: each one
holds ~60 computed fields (v1/v2
probabilities, edge, EV, Kelly, fair line, projected finish, `_provenance`) and
none of them can be filled in by hand correctly.

## C6 is the live decision layer

Entries must be saved with **C6 on**. The script defaults it on and reports the
regime on every run (`12 entered (C6 ON, decision source c6)`) — check that line.

C6 is **not** a `modelToggle` option. `modelToggle` stays `'v2'`; C6 is a
separate market-anchored blend gated on `VITE_C6_USER_FACING_ENABLED`, which
`src/domain/shadow/config.js` reads through `import.meta.env`. Vite injects
that in the browser — the deployed bundle is built with
`VITE_C6_USER_FACING_ENABLED:"true"` — but **plain Node has no
`import.meta.env` at all**, so `readEnv()` returns `{}` and C6 fails closed.

That is a genuinely silent failure, and it already happened once: the first
UFC 331 entry (`d445106`) wrote 12 v2 entries into a corpus whose previous 38
records were all C6, and nothing in the diff showed it. Fixed in `816811d`.

Two guards now exist, and neither should be worked around casually:

- the script shims `import.meta.env` → `process.env` for that one module and
  defaults the flag on, so the CLI matches production by default;
- `checkRegime()` compares the `decisionProbabilitySource` it is about to write
  against the last 20 ROI entries and **refuses** on a mismatch.

`--no-c6` forces C6 off and `--allow-regime-change` overrides the guard. Use
either only when the user explicitly asks for that switch.

**Verifying the production regime**, if it is ever in doubt — read it off the
deployed bundle rather than guessing:

```bash
curl -sL https://www.fightmetrics.app/ | grep -o 'src="[^"]*\.js"'
curl -sL https://www.fightmetrics.app/assets/<bundle>.js | grep -o 'VITE_C6_USER_FACING_ENABLED[^,;)}]\{0,20\}'
```

Cross-check against the corpus itself: the recent `decisionProbabilitySource`
values in `src/roiData.js` are what the track record is actually built from.

## 1. Check where the data lives

Picks live in the **Supabase document store**, not in git. `enter_upcoming.mjs`
reads and writes it whenever `.env.local` sets `FM_SUPABASE_URL` +
`FM_SUPABASE_PUBLISHABLE_KEY`, as the signed-in owner:

```bash
node scripts/fm-store.mjs whoami
```

- **`workspace "fightmetrics": owner`** — continue.
- **`not signed in`** — run `node scripts/fm-store.mjs login <the user's email>`
  in the background and ask the user to click the magic link **on this
  computer** (it redirects to `http://localhost:54399/callback`).
- **No Supabase configured** — the script falls back to the bundled
  `src/upcomingData.js` (the pre-database workflow). Say so: that changes only
  the local snapshot, not the live site.

Then see what is already there, so you do not re-enter a card:

```bash
node scripts/enter_upcoming.mjs list
```

## 2. Pull the odds

The user prefers prediction markets. **Polymarket is the working default** —
verified live, full card coverage, and its prices are already no-vig.

```bash
node scripts/fetch_card_odds.mjs "UFC 331" --date 2026-09-19 --out /tmp/.../card_raw.json
```

What that script knows, so you do not have to rediscover it:

- The endpoint is `gamma-api.polymarket.com/public-search?q=...`. The plain
  `/events` listing does **not** surface UFC events — do not spend calls on it.
- Each fight is its own event titled `UFC 331: A vs. B (Division, Segment)`.
  The moneyline is the one market whose two outcomes are the **fighter names**;
  every other market on that event is a prop (method, rounds, per-round).
- `outcomePrices` are normalised to sum to 1, so they are no-vig probabilities.
  `enter_upcoming.mjs` converts them with the app's own `americanOdds()`, which
  produces a symmetric pair like `-292/+292`. That is correct, not a bug — there
  is no vig to strip.
- A market with `closed: true` / `acceptingOrders: false` is **not a live line**.
  Polymarket leaves the last prices (often 0.50/0.50) sitting on a market whose
  bout was pulled. The script nulls those out and flags them `MARKET CLOSED`.
  Treat that as "this fight is probably off the card" and confirm in step 3.

Fallbacks, in order:

- `--kalshi` reads series `KXUFCFIGHT`. Fighter names are clean and the pairings
  are right, but a card that has not traded yet returns **null prices** — that is
  the normal state for Kalshi on a UFC card, so expect to fall back.
- Novig has no public API. If the user wants Novig prices they read them off and
  give them to you.
- A sportsbook consensus (BestFightOdds, DraftKings) is acceptable last resort.
  Those lines carry vig; pass them as American odds in `oddsA`/`oddsB` and the
  app strips the vig itself.

## 3. Verify the card against two real sources

The market gives you prices and pairings. It does **not** give you scheduled
rounds, title status, or cancellations, and you must never guess those.

1. **UFC.com's official weigh-in results** —
   `ufc.com/news/official-weigh-results-<event-slug>`. This is the best source
   and the one to cite: it lists every bout with its official division label in
   card order, marks the championship bouts, and states the round structure in
   one sentence ("Main event and co-main event scheduled for five rounds each.
   All other bouts scheduled for three rounds each."). It also tends to use the
   same name spellings as the roster.
2. **Wikipedia's event page** (`UFC 331`) — good cross-check, and it carries a
   "cancelled/changed" note the weigh-in page will not have.

Find the weigh-in article with `WebSearch` restricted to `ufc.com`; the slug is
not guessable (UFC 331's was `official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2`,
title sponsor and all).

Resolve specifically:

- **Scheduled rounds.** Only the main event is five rounds by default. A
  co-main can also be five (Tsarukyan vs. Ruffy at UFC 331 was), and that is a
  fact to verify, not to assume. Everything else is three.
- **Title bouts.** `isTitleBout: true` requires `scheduledRounds: 5`;
  `buildRoiEntry` throws on the contradiction rather than persisting it.
- **Cancellations.** Cross-check every `MARKET CLOSED` flag. At UFC 331 the
  closed Moicano/Ortega market was exactly right — Ortega withdrew injured.
  A pulled bout is simply left out of the card file.
- **Division.** Use the canonical name (`Women's Flyweight`, not `W-Flyweight`).
  Anything non-canonical, including a catchweight, should be `null` — the entry
  then falls back to roster normalisation instead of carrying a made-up
  division. A catchweight bout is still enterable; it just warns.

### Provenance is mandatory

Any entry carrying a `boutContext` must carry the citation it came from.
`src/data/__tests__/gradingHandoffIntegrity.test.mjs` asserts it over the whole
committed corpus ("no record loses its official bout-context provenance"), so
skipping it does not fail quietly — it fails the suite on the next run, for
every entry at once.

Put it once at the card level and `enter_upcoming.mjs` applies it to every
fight; a per-fight `provenance` overrides it.

```json
"provenance": {
  "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
  "retrievedAt": "2026-09-18",
  "authority": "official"
}
```

`authority` is `official` for UFC or athletic-commission pages and `secondary`
for reputable press — Wikipedia is `secondary`. Cite the page you actually read
the rounds and title status off, and the script refuses to write without it.

This is the one place the script does **more** than the Simulator rather than
the same thing. The UI collects no citation, so saving bout context there
produces `provenance: null` by design (`src/App.js`: "inventing one would be
worse than the honest null"). This path has a real source, so it records it.
If you genuinely have no citation, leave division, title and rounds all `null`
rather than inventing one — no context is honest, unsourced context is not.

## 4. Resolve every name against the roster

Market name spellings are **not** roster spellings.

```bash
node scripts/enter_upcoming.mjs resolve /tmp/.../card.json
```

This checks both corners of every fight against the 2,300-fighter roster and
refuses to continue on an unresolved name, printing suggestions. It matches
exact spellings outright, accepts an accent/case-only difference with a warning,
and never silently picks between two fighters with the same folded name.

- **A suggestion is a lead, not an answer.** "Michael Aswell" → the roster's
  `Michael Aswell Jr.` is a safe fix. Two different Silvas is not — confirm.
- **A fighter with no match is usually a UFC debutant**, and the user's standing
  instruction is to enter non-debuting fighters only. Drop that fight from the
  card file and tell them which one and why. Check before assuming: Aswell
  looked missing but was 1-2 in the UFC under a suffixed name.
- Never edit a roster name to match a source.

## 5. Show the user, then apply

Present the resolved card as one table — fight, division, rounds/title, the
market line, the model's pick and probability, and the bet action — and call out
anything dropped (cancelled bouts, debutants, unpriced fights). Wait for the
go-ahead unless they already said to enter it without asking.

This is the review gate, and it is the **only** one — step 6 ships straight to
production without asking again. So show the card before writing it, not after.

```bash
node scripts/enter_upcoming.mjs add /tmp/.../card.json --dry-run
node scripts/enter_upcoming.mjs add /tmp/.../card.json
```

`add` re-runs every check from `resolve` and refuses to write if any fight
fails, so a bad card fails whole rather than half-entering. It skips a matchup
already pending in Upcoming or already graded in ROI (warning, not an error),
so re-running after a partial entry is safe.

## 6. Confirm it is live

When `add` prints `Saved to Supabase …` the card is **already live** on
fightmetrics.app — there is no commit, push or deploy. Load
`https://fightmetrics.app/upcoming` and confirm the fights render before telling
the user it is done.

The whole card is written as one atomic batch, and every entry carries the
revision it was read at, so a card changed elsewhere in the meantime is refused
whole ("stale revision") rather than partially overwritten — re-run.

The bundled `src/upcomingData.js` is now only the offline fallback and rollback
snapshot. Refresh it (`node scripts/fm-store.mjs export --write-files`) and
commit only if the user asks.

### Correcting a card that is already entered

Saved entries are **immutable** — every field is frozen at save time and
nothing downstream recomputes them — so a correction is a delete plus a fresh
add, never an in-place edit. Ids and `createdAt` are reissued, which is correct
and expected.

```bash
node scripts/enter_upcoming.mjs remove --event "UFC 331" --dry-run
node scripts/enter_upcoming.mjs remove --event "UFC 331"
node scripts/enter_upcoming.mjs add /tmp/.../card.json
```

`remove` refuses to touch an entry that already has an `actualWinner` — a
graded fight belongs to `grade-card` and the ROI ledger, not here.

This is safe while a card is pending. Once fights start resolving it is not:
re-entering would silently reprice a prediction against a result that already
exists. Correct a card before the event, or not at all.

### When to stop and ask anyway

Writing a clean card needs no extra confirmation. Stop and ask instead if:

- the write is refused (stale revision twice in a row, not signed in, not owner),
- the regime guard fires, or the run reports anything other than `C6 ON` /
  `decision source c6`, or
- the run had anything unresolved — a name you had to guess at, a bout you could
  not confirm was still on, a fight entered with no odds.

Then report the count, the event, anything dropped, and the v3 tiers the gate
produced (see "The v3 bet gate" below), with the live URL.

## The v3 bet gate (frozen since 2026-10-05)

Every C6-driven entry is graded by the v3 gate (`src/domain/betting/gateV3.js`).
It is a frozen experiment: never change its thresholds, and never re-enter
or regrade earlier cards to apply it.

- **BET**: C6 picks the market underdog (lower no-vig %), EV >= 2%, price +200
  or shorter. This is the only tier that can become a real bet.
- **LEAN**: C6 picks the favourite with EV >= 2%, price -400 or longer. LEANs
  are common (often half a card): when v2 agrees with the favourite, C6 rates
  it above the market.
- **NO BET**: everything else; each entry stores the reason in `gateReason`.
  There is no STRONG BET tier under v3.

Report tiers directly, as the app shows them: BET, LEAN, NO BET, with the
fighter and price. No qualifiers such as "paper", "tracked" or "hypothetical".
List the BET(s) on their own line. A BET near +100 can flip to NO BET at a
slightly worse sportsbook price; say so in one line and point to the
fight-day check.

After saving, verify every entry counts in the experiment -- this must print
`0`:

```bash
node scripts/fm-store.mjs export | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const u=JSON.parse(s).upcoming.filter(e=>e.eventName===process.argv[1]);console.log(u.filter(e=>e.gateVersion!=="c6_dog_v3"||e._provenance?.captureMode!=="live"||e.decisionProbabilitySource!=="c6").length)})' "<eventName>"
```

A non-zero count means C6 was off, odds were missing, or the event date was in
the past (saved as reconstructed). Fix it before reporting.

## Card file format

```json
{
  "eventName": "UFC 331",
  "eventDate": "2026-09-19",
  "fights": [
    {
      "fighterA": "Alexandre Pantoja",
      "fighterB": "Joshua Van",
      "probA": 0.435, "probB": 0.565,
      "division": "Flyweight",
      "isTitleBout": true,
      "scheduledRounds": 5
    }
  ]
}
```

- `probA`/`probB` are prediction-market prices; `oddsA`/`oddsB` are American
  odds and win if both are given. Supplying one side only is an error.
- Write American odds as **signed strings**: `"oddsA": "+117", "oddsB": "-127"`.
  An underdog always carries the `+`. A bare JSON number (`117`) once saved as
  `"117"` and read like a favourite's line; `resolveOdds` in
  `enter_upcoming.mjs` now adds the `+` to any unsigned positive line, but pass
  it signed anyway. After saving, this must print nothing:

  ```bash
  node scripts/fm-store.mjs export | grep -nE '"(oddsA|oddsB|marketOdds|betRecommendedOdds)": "[0-9]'
  ```

  (With no Supabase configured, grep `src/upcomingData.js` instead.) Any hit is
  an underdog missing its `+`: remove the event and re-add it with the line
  signed, before reporting.
- `division` / `isTitleBout` / `scheduledRounds` are all nullable, and **null
  means unverified, not "no"** — the app distinguishes the two deliberately. Fill
  in what you verified and leave the rest null.
- `provenance` is required as soon as any of those three is set. See above.
- `unitsWagered` is optional, but v3 entries always save it as 1 for the
  app's internal record. Real bets are recorded per BET on fight day with the
  Upcoming card's **Fight-day check** (current odds -> the gate reruns ->
  record the accepted price and stake, or a skip). Never tell the user to set
  stakes in the Upcoming tab.
- Odds may be omitted entirely; the entry saves with no market, which means no
  bet signal and no EV/Kelly. Warn rather than silently doing this.

## Notes

- Both scripts are tracked in the repo (`scripts/enter_upcoming.mjs`,
  `scripts/fm-store.mjs`). If either is ever missing, say so rather than
  hand-editing the data file.
- **Cancellations and replacements after entry.** If a bout is cancelled before
  the event, delete that entry in the app (never grade it). If a replacement
  opponent is announced, enter the new pairing before the fight starts, so its
  price is captured before the result: a fight entered after it happens saves
  as `reconstructed` and does not count in the v3 experiment.
- The bundled `src/upcomingData.js` does not need refreshing or committing after
  a card is entered: the nightly snapshot job does it.
- `enter_upcoming.mjs` saves with `modelToggle: 'v2'`, the Simulator's default.
  That is correct even though C6 drives the decision: `modelUsed` records the
  base model ('v2') and `decisionProbabilitySource` records what actually drove
  the bet fields ('c6'). Both should be present on every entry, along with
  `c6ProbA`/`c6ProbB`/`c6Version`.
- `addPendingEntry` prepends, so the last fight in the card file ends up first in
  the array — the same order you would get saving them one at a time in the UI.
- The scripts import `src/` through a loader hook that retries a failed
  specifier with `.js` and `/index.js`, because `src/` uses Vite's extensionless
  imports. Same hook `scripts/regen_simulator_bar_anchors.mjs` registers.
