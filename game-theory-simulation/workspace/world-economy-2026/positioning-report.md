# Positioning report — world-economy-2026, final sourced run (v2)

> **This replaces the version an independent adversarial audit
> (`audit-final.md`) found two Fatal problems in.** That audit is worth
> reading in full: it falsified this report's own headline claim ("one
> axis") using the report's own named test, and found the OBS-seat section
> was narrated, not computed. Both are corrected below by actually running
> the tests before writing the claim, not after. The underlying run also
> changed: four engine bugs the audit found (security decay, a floored
> household actor, an unreachable constraint threshold, an incomplete
> shock) are fixed and this report is against the corrected sweep.

300 runs, 10-year horizon (2026–2036), 40 actors, 15 researched theatres,
ledger conservation independently re-verified exact (0/3000 flagged,
drift 0.0) after the fixes. Read `audit.md` and `audit-final.md` alongside
this for everything that still bounds how much weight any number here
should carry — several material limitations remain and are not repeated
in full below.

## The distribution

Seven regimes:

| Regime | Share | Branch pt | Winners | Losers |
|---|---|---|---|---|
| 0 | 17.0% | round 9 | CORP_SEMI, AM_ACTIVE, ST_JP_KR | CORP_TECH, CORP_DEFENSE, ST_CN |
| 1 | 17.7% | round 9 | ST_GULF, ST_RU, AM_INDEX | CORP_COMMOD, ST_EU, ST_JP_KR |
| 2 | 10.7% | **round 5** | CORP_SEMI, ST_JP_KR, CORP_TECH | AM_ACTIVE, NBFI_CREDIT, CORP_DEFENSE |
| 3 | 13.3% | round 9 | HH_EM_URBAN, CORP_COMMOD, SWF | ST_CN, CORP_SEMI, ST_JP_KR |
| 4 | 6.3% | **round 6** | ST_JP_KR, ST_EU, CORP_SEMI | ST_GULF, ST_RU, HH_EM_URBAN |
| 5 | 18.7% | round 9 | CORP_TECH, ST_CN, CORP_DEFENSE | CORP_SEMI, AM_ACTIVE, HH_EM_URBAN |
| 6 | 16.3% | round 7 | CORP_DEFENSE, AM_ACTIVE, CORP_COMMOD | CORP_SEMI, ST_JP_KR, CORP_TECH |

**I am not going to claim these seven reduce to one axis.** The previous
version of this report did exactly that, from exactly this kind of table,
and it was wrong — the audit checked the actual correlation structure and
it isn't there. Here is what the data actually supports, computed
directly rather than inferred from winner/loser lists:

## What's actually real, quantified

**One genuinely strong, robust relationship exists** — energy producers
against energy-import-exposed advanced economies, in final-round resources
across all 300 runs:

```
ST_GULF vs ST_RU:      r = +0.94   (same side — both producers)
ST_GULF vs ST_EU:      r = −0.95   (strong opposite)
ST_GULF vs ST_JP_KR:   r = −0.60   (moderate opposite)
```

This is the one number in this report worth taking seriously as a
tradeable pattern. It's mechanically obvious in retrospect (the
`energy_routes` kernel and `energy_supply_disruption` shock both move
these actors in exactly this pattern by construction) and it held up
under the audit's ±30% perturbation sweep, at full sample.

**Everything else does not form a second pole of the same axis.** The
tech/semiconductor complex — the actors the retracted "one axis" framing
treated as the energy axis's mirror image — barely correlates with the
energy axis *or with itself*:

```
ST_GULF vs CORP_SEMI:      r = +0.11
ST_GULF vs CORP_TECH:      r = +0.12
CORP_SEMI vs CORP_TECH:    r = +0.12   (near-zero, even to each other)
```

`CORP_SEMI`'s swings are driven almost entirely by the (now widened)
`taiwan_strait_flashpoint` shock; `CORP_TECH`'s by the separate AI-
progress/correction shocks. They move independently because they *are*
independent mechanisms in this model, not two views of one story.

**PCA on the full 40-actor final-state matrix confirms there is no
dominant axis at all**: the first principal component explains 10.3% of
cross-run variance, the second 9.2%, and it takes ten components to reach
69%. This is a genuinely multi-factor system. That's a real, useful
finding on its own — a model with 15 independently-researched theatres
*should* produce many semi-independent sources of variance rather than
collapsing to one story, and this run does. The honest headline is
"one strong pattern, embedded in a lot of real independent variation,"
not "one axis."

## Branch points

Two regimes separate meaningfully earlier than the rest (round 5 and 6,
against a round 7–9 pattern elsewhere) — regimes 2 and 4, an early tech
break and its approximate mirror. The other five separating mostly by
round 9 should still be read as **lower-confidence and partly a modeling
artifact**: security now mean-reverts (fixed this pass) rather than
decaying without limit, but conflict-linked shock rates still run above
their nominal base rate throughout a run (`taiwan_strait_flashpoint` at
3.9× nominal, `cascading_systemic_crisis` at 1.5×, both improved from the
prior build but not at parity) — some of the late-round separation is
still cumulative shock exposure compounding over a fixed ten-round window,
not a real feature of years 8–10 specifically.

## The AM_INDEX claim is retracted

The prior version of this report called constraint arbitrage against
`AM_INDEX` "the dominant, most legitimate edge in this run." The audit
ran the report's own proposed test: `AM_INDEX`'s dossier constraint never
matches an actual engine action, so it never binds, and its action choices
across all 3000 round-observations are statistically indistinguishable
from random (33/34/32%). The only real, non-decorative thing happening to
`AM_INDEX` is a flat +0.02/round drift hardcoded into the
`compute_and_capex` kernel — a real structural detail, but a drift term,
not evidence of a tradeable mandate constraint. There is no forced-flow
edge to report here until `observer.json`'s seats or a real index-
methodology constraint are actually wired into the solver.

## OBS positioning — now actually computed

**This closes Fatal finding F2.** `engine.py` now runs `observer.json`'s
five seats through a real instrument-return registry (13 instruments —
equity, gold, offshore fund, real estate, FD, USD cash, commodities,
local bonds, vol, credit, rates, FX, private credit) built from the same
per-round state deltas that drive everything else in this model, and
tracks a compounded value, running peak, and drawdown series for each
seat across all 300 runs. Every number below is `--analyse-obs` output
against the corrected sweep, not narration.

Two structural bugs were caught before trusting the mechanism, both via
the same discipline used throughout this project — check the computed
numbers for plausibility before believing the formula, don't just check
for crashes. A first pilot showed `OBS_mobile_global` with the highest
mean return of all five seats and essentially **zero** drawdown
(mean=0.000) — a statistically implausible free lunch. Root causes: (1)
gold and USD cash's conflict-sensitivity term was floored at
`max(0, d_conflict)`, making it structurally unable to lose money on a
de-escalation; (2) the "vol" instrument paid off on `0.15 × number of
shocks fired`, which is unconditionally non-negative and dominant since
roughly a third of the 13 shocks fire in a typical round — "vol" was
almost always profitable regardless of outcome. Both fixed to signed/
magnitude-based terms (gold and cash now genuinely sell off on
de-escalation; vol now pays on realized destructive magnitude,
`abs(shock_resources_net)`, not event count, with a real carry cost).
Re-verified at both 20-run pilot and full 300-run scale — see below, no
seat shows zero-risk behavior anymore.

The OBS computation is provably read-only: it consumes a post-clamp copy
of actor state and writes only to its own seat-value/drawdown structure,
never back into actor state. Confirmed directly — every actor-level
correlation in this report (ST_GULF vs ST_RU/ST_EU/ST_JP_KR, the
near-zero tech-complex correlations, the cluster/regime table above) is
byte-identical between the pre-OBS-wiring run and this one at the same
seed. Wiring OBS in did not, and structurally cannot, change the
underlying game.

### Per-seat results (300 runs, terminal value normalized to 1.0 at t=0)

| Seat | Mobility | Terminal value (mean / p10 / p90) | % runs positive | Max drawdown (mean / p90) | Peak near a liquidity-crisis shock |
|---|---|---|---|---|---|
| OBS_local_IN | 0.2 | 1.19 / 1.15 / 1.22 | 100.0% | 0.001 / 0.004 | 69.7% |
| OBS_offshore_IN | 0.5 | 1.20 / 1.05 / 1.34 | 96.0% | 0.050 / 0.109 | 64.0% |
| OBS_hardcurrency_EM | 0.6 | 1.21 / 1.10 / 1.33 | 99.7% | 0.030 / 0.062 | 66.7% |
| OBS_mobile_global | 1.0 | 2.60 / 1.54 / 3.96 | 100.0% | 0.011 / 0.028 | 66.3% |
| OBS_institutional | 0.8 | 2.00 / 1.14 / 3.03 | 96.0% | 0.060 / 0.111 | 59.7% |

Read this ranking with real caution about what's driving it, not as a
recommendation:

- **OBS_local_IN's near-zero drawdown (0.001) is a basket-composition
  artifact, not evidence the seat is genuinely low-risk.** Its five
  instruments are entirely India-domestic (`equity_local`, `real_estate`,
  `fd`) or dampened averages (`gold`, `usd_cash` at 1/5 weight each) —
  the IN jurisdiction basket (`ST_IN`, `CB_IN`, `HH_IN`) simply has low
  resources-dimension variance in this model relative to the shock-heavy
  global instruments. A locally-constrained investor being modeled as
  "safe" here reflects a narrow basket, not real insulation from
  jurisdiction risk this model doesn't otherwise capture (currency
  controls, capital-flow reversals — see `audit-final.md` on T4/household
  kernel richness).
- **OBS_mobile_global and OBS_institutional show the highest returns
  (2.60x, 2.00x mean) driven mechanically by their exposure to `vol`,
  `credit`, `fx`, and `private_credit`** — instruments with wider swings
  because they key off `shock_resources_net` magnitude and cross-basket
  liquidity deltas directly, not because full mobility is "better" in any
  general sense this run can support.
- **59.7%–69.7% of seats' peak values land within two rounds of a
  liquidity-crisis shock** (`cascading_systemic_crisis`, `financial_accident`,
  `sovereign_debt_crisis`) firing — consistent with these seats holding
  instruments (gold, USD cash, vol) that are specifically constructed to
  respond to conflict/liquidity swings, not an independent finding about
  real-world crisis timing.
- This is one seeded 300-run sweep of a model with the limitations
  `audit-final.md` documents in full (equal-weight rebalancing only, no
  optimization step; only 3 of 95 sourced constraints operationalized;
  T4/household kernels the least mechanically rich part of the model).
  Treat the ranking as "these are the mechanical consequences of this
  model's instrument definitions," not as investment advice or a
  validated real-world edge.

## Where a real edge might come from

- **Flow foreknowledge** on the one verified relationship: Hormuz/Red Sea
  war-risk insurance pricing and Russian shadow-fleet interception rates
  are real, public, dated series that move ahead of the resource outcomes
  this model produces — a legitimate, checkable leading indicator for the
  energy-axis relationship specifically.
- **Constraint arbitrage** is not currently demonstrated by this run for
  any actor at meaningful scale — only 3 of 95 sourced constraints show
  real tripwire behavior (`ST_CN`, `ST_JP_KR`, `ST_TW` — see
  `audit-final.md` M1), and none of the three is a capital-markets mandate
  rule an outside actor could straightforwardly arbitrage the way the
  retracted `AM_INDEX` claim implied.
- **Variance ownership** belongs to `HF_MACRO`/`CORP_COMMOD`/`INS_RE` in
  this model, per the skill's own design intent — not to OBS.
- **Horizon arbitrage** is not demonstrated here; T4/household kernels are
  the least mechanically rich part of the model (see `audit-final.md` on
  `HH_DM_LABOR` specifically) and this is the edge source most likely to
  strengthen once that's addressed.

## Falsifiability

- **"The energy-producer-vs-importer correlation is real"** — falsified if
  a further ±30%+ perturbation of `energy_supply_disruption`'s magnitude,
  or a corrected/rebalanced version of the shock, drives the ST_GULF/
  ST_EU correlation toward zero. Held under the audit's own perturbation
  to date.
- **"There is no dominant single axis"** — falsified if a future run
  (richer T4 kernels, more theatres wired together via genuine cross-
  theatre spillover, which `engine.py` does not currently implement)
  produces a PC1 explaining a large majority of variance instead of 10%.
- **"AM_INDEX shows no tradeable constraint behavior"** — falsified the
  moment `AM_INDEX`'s mandate constraint is actually wired to a matching
  engine action and shown to bind in a meaningful share of rounds.

## What this still is not

Not a forecast, and — per the two corrections above — no longer a report
that oversold what the model computes. It is one real, quantified,
audit-surviving relationship (energy producers vs. import-exposed
advanced economies) embedded in a genuinely multi-factor system that a
single "axis" or a single "edge" claim does not do justice to. The
honest use of this run is: it demonstrates the pipeline can produce a
verifiable signal and survive an adversarial pass that catches its own
overreach — not that it has found the trade.
