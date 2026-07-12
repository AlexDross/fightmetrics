# Three-event fight prediction review

Events reviewed:

- UFC Vegas 118 — June 6, 2026
- Freedom 250 — June 14, 2026
- UFC Vegas 119 — June 20, 2026

The saved predictions were reproduced against the historical `App.js` and
fighter-data snapshots that existed when each card was entered.

## Verdict

The model did a respectable but not excellent job.

- UFC Vegas 118: 7/11, 63.6%
- Freedom 250: 4/7, 57.1%
- UFC Vegas 119: 6/9, 66.7%
- Combined: **17/27, 63.0%**

That is better than random and slightly better than the reproducible historical
transparent-composite baseline. It is not strong enough to claim that the
current hand-weighted algorithm is near its ceiling.

The no-vig market favorite went 19/27 (70.4%). The model produced a Brier score
of 0.2343 and log loss of 0.6669; the market produced 0.2152 and 0.6257.
Therefore the market was better both at choosing winners and assigning
probabilities across these cards.

## Where the model worked

Confidence was useful in the middle:

| Stored pick probability | Correct | Accuracy |
|---|---:|---:|
| 50–55% | 1/4 | 25.0% |
| 55–60% | 7/11 | 63.6% |
| 60–65% | 3/4 | 75.0% |
| 65–70% | 4/4 | 100.0% |
| 70%+ | 2/4 | 50.0% |

The 60–70% predictions went 7/8. The two high-confidence failures were Ilia
Topuria and Andre Lima, both of whom were also enormous market favorites. Those
are not persuasive evidence of an algorithm defect; they were major upsets.

When model and market agreed, the shared pick went 14/19 (73.7%). The model was
far weaker when disagreeing with the market: 3/8 (37.5%).

## Miss-by-miss assessment

### Defensible algorithm failures

**Priscila Cachoeira over Chelsea Chandler**

This was a 51.3% coin-flip pick. Noisy contextual inputs pushed Cachoeira over
the line:

- Cardio contribution: +0.0896
- Layoff contribution: +0.0592
- KO-win contribution: +0.0589
- UFC-fight-count contribution: +0.0538

Those signals overcame younger age, better physical profile, and Cachoeira's
record/form penalties. Removing either cardio or layoff flips the pick to
Chandler. Removing KO-win count also flips it.

**John Yannis over Marcus McGhee**

The model ignored a very large quality signal:

- ELO strongly favored McGhee: +0.1106
- Takedown defense favored McGhee: +0.0587

But Yannis won the composite through cardio, recency, age, and streak terms.
Yannis had only two recorded UFC rounds and a 1–1 record. The current
small-sample treatment regresses rate statistics, but does not adequately
shrink every contextual input for inexperienced fighters.

**Alex Pereira over Ciryl Gane**

This exposed two design problems:

1. The model has no explicit weight-class or body-weight adjustment for a
   light-heavyweight-versus-heavyweight matchup.
2. It rewards percentages without enough regard for opportunity volume.

Pereira received +0.0715 from 50% takedown accuracy despite averaging only
0.11 takedowns. KO wins contributed +0.0785. Removing KO-win count flips the
pick to Gane.

### Plausibly improvable

**Santiago Luna over Bryce Mitchell**

The model heavily rewarded Luna's nine-year age advantage and young statistical
profile despite a tiny four-round sample. Mitchell's experience and ELO were
not sufficient to overcome those inputs. This needs a general low-sample
reliability model for all inexperienced UFC fighters—not only pre-debut
prospects.

**Steve Garcia over Diego Lopes**

This was statistically defensible: Garcia had a seven-fight streak, more KO
wins, slightly higher ELO, and better takedown defense. The market preferred
Lopes and was right. A market-plus-statistics hybrid flips this pick, but the
original model's reasoning was not absurd.

### Mostly reasonable misses or major upsets

- Fares Ziam over Tom Nolan
- Ilia Topuria over Justin Gaethje
- Michael Aswell Jr. over Gaston Bolanos
- Allan Nascimento over Mitch Raposo
- Andre Lima over Kevin Borjas

The market agreed with the model on all five. Topuria and Lima were priced at
-520 and -650. Rewriting the model to predict those two upsets would be
hindsight overfitting.

Nascimento's missing age, height, and reach were incorrectly converted to
zero-value physical inputs. That is a real data-handling bug, although fixing
it would have made the model more confident in Nascimento and therefore would
not have repaired this particular miss.

## Counterfactual changes

These are evaluated on the same 27 fights.

| Prediction method | Correct | Accuracy |
|---|---:|---:|
| Historical live `App.js` model | 17/27 | 63.0% |
| Always choose market favorite | 19/27 | 70.4% |
| Remove KO-win count from the composite | 19/27 | 70.4% |
| Learned six-signal logistic model | 20/27 | 74.1% |
| Market + learned-statistics hybrid | **21/27** | **77.8%** |

The learned model uses only six stable signals:

- Age differential
- Point-in-time ELO differential
- Significant strikes landed differential
- Significant-strike accuracy differential
- Takedowns landed differential
- Takedown accuracy differential

It was trained on fights ending before these three cards. It flipped Cachoeira,
Yannis, and Pereira to the correct winners without breaking an originally
correct pick.

The hybrid additionally flipped Garcia to Lopes.

Removing KO wins is also independently defensible: the 3,380-fight historical
audit found the KO-count feature had an inverted conditional relationship with
outcomes. Unfortunately, that June 23 adjustment was made only in
`src/modelModule.js`, which the app does not import. It never changed live
predictions.

## Recommended changes

1. Replace the hand-weighted winner probability with the orientation-symmetric,
   regularized logistic model as the transparent primary challenger.
2. Show two forecasts:
   - Independent statistics forecast for betting-value comparison.
   - Market-plus-statistics forecast for best outright winner prediction.
3. Remove raw KO-win count from the live composite. Finish counts, wins, streak,
   and ELO currently double-count related evidence.
4. Shrink every feature according to sample reliability. Rate percentages should
   use attempt-weighted Bayesian shrinkage, not only a rounds-based blend.
5. Treat missing pairwise measurements as neutral/unknown, never as physical
   zero.
6. Add an explicit weight-class/expected-fight-weight adjustment for
   cross-division simulations.
7. Centralize the model. `App.js` currently runs its own implementation while
   `modelModule.js` contains disconnected weight updates.
8. Do not increase confidence merely because several correlated features agree.
   Wins, streak, KO count, experience, and ELO overlap substantially.

## Bottom line

Seventeen correct picks out of 27 is respectable. The app was not embarrassing,
and several misses were genuine upsets that a sane model should also miss.

But the model was clearly leaving accuracy available. Its hand-built composite
overweights noisy contextual inputs, double-counts career success, mishandles
some missing data, and cannot model cross-weight-class matchups cleanly. A
small learned model plus a separate market blend produced materially better
results without needing exotic features.
