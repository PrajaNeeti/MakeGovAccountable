# Positioning report — world-economy-2026, final sourced run

300 runs, 10-year horizon (2026–2036), 40 actors, 15 researched theatres,
real ledger conservation verified (0/3000 round-observations flagged, drift
0.0). This is the Orchestrator-level interpretation of `runs.jsonl` /
`analysis.txt`. Read `audit.md` alongside this — several caveats there
(household kernels still simplified, the "escalate" action a compressed
proxy for a much richer real action space) bound how much weight any single
number here should carry.

## The distribution

Seven regimes, not three hundred stories:

| Regime | Share | Branch pt | Winners | Losers |
|---|---|---|---|---|
| **A — Late Tech Drift** (cl. 0) | 20.3% | round 9 | CORP_SEMI, ST_JP_KR, ST_EU | ST_GULF, ST_RU, ST_CN |
| **B — Energy Shock** (cl. 1) | 15.0% | round 7 | ST_GULF, ST_RU, AM_ACTIVE | ST_JP_KR, ST_EU, CORP_TECH |
| **C — AI Complex Ascendant** (cl. 2) | 11.7% | round 9 | CORP_SEMI, HF_MACRO, CORP_TECH | AM_ACTIVE, NBFI_CREDIT, ST_EU |
| **D — Consumption Rebalancing** (cl. 3) | 12.0% | round 9 | HH_EM_URBAN, AM_ACTIVE, CORP_SEMI | ST_CN, ST_JP_KR, CORP_TECH |
| **E — Late Energy Drift** (cl. 4) | 20.7% | round 9 | ST_JP_KR, ST_EU, CORP_COMMOD | CORP_SEMI, ST_GULF, ST_RU |
| **F — Early Tech Break** (cl. 5) | 11.7% | **round 4** | ST_JP_KR, CORP_TECH, ST_EU | ST_GULF, ST_RU, HH_EM_URBAN |
| **G — Early Energy Break** (cl. 6) | 8.7% | **round 5** | ST_GULF, ST_RU, NBFI_CREDIT | ST_JP_KR, ST_EU, AM_ACTIVE |

**The real structure here is one axis, not seven independent stories.**
Regimes A/C/D/F cluster on one side (tech/semiconductor complex up, energy
producers down); B/E/G cluster on the other (energy producers up, tech
down). E and A are close to mirror images of B and C respectively. What
actually varies across the 300 histories is less "which of seven futures"
and more "which side of one recurring tension wins, and how early." That's
a more honest and more useful finding than seven distinct plots would be.

## Branch points and leading indicators

Five of seven regimes only separate by round 9 — the second-to-last round
of a 10-year run. That is a **low-confidence signal about the model, not
about the world**: `game-forms.md`'s own guidance says treat late-run
separation as lower-confidence, since real systems rarely have a visible
terminal round and end-game effects are an artifact of the horizon being
finite. Don't read "most branches resolve in year 9" as a forecast that the
late 2030s are when things clarify — read it as five regimes that are
genuinely close together for most of the run and only tip apart late.

The two regimes worth real attention are the **early breaks** (F, round 4;
G, round 5), because something in the first several years, not the last,
decisively locks in the trajectory:

- **Regime F (Early Tech Break, 11.7%)** — Publicly observable leading
  indicator: an early, sustained run of `ai_progress_acceleration` /
  `manufacturing_automation_wave` shocks pushing `CORP_TECH`'s rank past
  the 0.85 threshold before round 4, without an intervening correction.
  Watch: hyperscaler capex guidance revisions and AI-driven memory/logic
  demand data in the first 2–3 years — if capex keeps beating guidance
  *and* no capex-correction event has occurred by then, this is the branch.
- **Regime G (Early Energy Break, 8.7%, smallest cluster)** — Leading
  indicator: an early `energy_supply_disruption` or `taiwan_strait_
  flashpoint` compounding before round 5, with Gulf spare capacity and
  Russian shadow-fleet volumes both holding up (i.e., producers can
  actually deliver into the price spike rather than being supply-
  constrained themselves). Watch: Hormuz/Red Sea war-risk insurance premia
  (already sourced as "pricing war at Hormuz, peace at Taiwan" — a live,
  dated signal) and Russian shadow-fleet interception rates in the first
  two to three years.

## Winners and losers by tier

- **T1 states**: `ST_GULF` and `ST_RU` are the most volatile — their
  standing swings by ±0.10 to ±0.25 resources depending on which side of
  the axis a run lands on, more than any other T1 actor. `ST_JP_KR` is
  nearly as volatile in the opposite direction. `ST_EU` moves with
  `ST_JP_KR` in five of seven regimes — the model is picking up a real
  shared exposure (both are energy-import-dependent, chip-and-materials-
  exposed advanced economies) rather than a coincidence.
- **T3 capital**: `CORP_SEMI` and `CORP_TECH` are the tech-side counter-
  weight to `ST_GULF`/`ST_RU` in almost every regime — consistent with the
  `ai_progress_acceleration` and `manufacturing_automation_wave` shocks
  funding the AI/robotics complex partly out of `AM_ACTIVE`'s and
  `HH_DM_LABOR`'s reallocated capital (see `shocks.json`'s conservation
  notes) and partly independent of the energy axis.
- **T4 households**: `HH_EM_URBAN` shows up as a winner in Regime D and a
  loser in Regime F — the only household actor with a real bidirectional
  swing in this run, worth a closer look in a future pass since T4 actors
  are otherwise mostly passengers here (their kernels are the least
  differentiated of the three tiers — noted in `audit.md`).

## OBS positioning, by seat

The single most decision-relevant fact for every seat: **you are being
asked to position on one axis (energy-producer-favorable vs. tech/AI-
favorable), not seven**. Every seat's strategy below is a way of holding
that axis, sized and instrumented differently by what each seat can
actually access.

### Local, no capital mobility (most people)
Cannot hold either side of the axis directly with local instruments in
most of the actors' home jurisdictions. The honest answer for this seat is
defensive, not tactical: hold what's least exposed to *either* branch —
domestic real assets and a currency-hedge instrument if one exists
locally (gold, where culturally and legally accessible, tracks this
almost exactly per the HH_IN dossier's own finding on investment-grade
gold demand). **Entry**: immediately, as insurance, not as a trade. **What
kills it**: nothing — this is the position that has no edge, only a floor.
**Drawdown**: bounded by definition, but so is the upside. This seat's
real leverage is political, not financial (see `consent_em`/`consent_dm`
kernels) — the leading indicators above matter to this seat as *migration
and cost-of-living* signals, not portfolio ones.

### Local + offshore access
Can now actually take a side. **Position**: a modest, hedged tilt toward
the tech/AI complex (Regimes A/C/D/F cover 55.7% of runs vs. 44.3% for the
energy side — a real, if not overwhelming, base-rate edge) via offshore
index exposure, sized small given `AM_INDEX`'s own dossier-documented
mandate rigidity means index flows are forced, not informed — you are
riding a mechanical buyer, not a smart one. **Entry**: after confirming no
early break has already resolved the axis (check the Regime F/G leading
indicators above first). **What kills it**: a `ai_capex_correction` or
`robotics_capex_correction` firing after you've entered — both are real,
sourced, and not small (−0.18 to −0.22 resources to the exact names you'd
be long). **Drawdown**: material and correlated with the tech names
specifically, which is the whole risk of this trade.

### Hard-currency earner, EM-based
Structurally long the energy-producer side already (most such seats sit in
economies where a `ST_GULF`/`ST_RU`-favorable regime is also good for the
local economy and currency). **Position**: don't double up — this seat's
edge is recognizing it's *already* exposed to Regimes B/E/G, so the
marginal trade is a small tech-side hedge, not more energy exposure.
**Entry**: as soon as local hydrocarbon-linked income is confirmed (i.e.,
immediately, structurally). **What kills it**: an early tech break (Regime
F) while carrying no hedge — the scenario this seat is least prepared for
by default. **Drawdown**: currency-correlated, which is the actual risk —
a local-currency devaluation compounds a resources loss rather than
offsetting it, unlike the mobile-capital seat below.

### Fully mobile capital
The seat with the real structural edge, because it can hold the axis as a
*relative-value* position (long one side, short or underweight the other)
rather than a directional bet, and can reposition the instant a leading
indicator fires. **Position**: a relative-value pair — long the AI/
semiconductor complex, short/underweight energy-producer-linked exposure —
sized to the base rate above, with an explicit stop tied to the two named
leading indicators (Hormuz/Red Sea war-risk premia for the energy break;
capex-guidance-vs-correction-shock timing for the tech break). **Entry**:
as soon as one leading indicator moves and the other doesn't. **What
kills it**: both breaks firing in the same window (not mutually exclusive
in the model — check for it), or a `cascading_systemic_crisis` that hits
`HF_MACRO`/`BANK_GSIB` liquidity broadly enough to force deleveraging
regardless of which side of the trade is "right." **Drawdown**: this is
the seat variance-preferring actors (`HF_MACRO`, `CORP_COMMOD`) already
occupy in the model — the edge is real but crowded with sophisticated
counterparties.

### Inside a T2/T3 institution (information-advantage seat)
The only seat that can plausibly see a leading indicator before it's
public — e.g., an index-methodology committee member seeing an inclusion/
exclusion decision before `AM_INDEX`'s forced flow executes, or a swap-
line allocation decision at `CB_US` before it's announced. **Position**:
this seat's edge isn't which side of the axis to hold, it's timing entry
into whichever seat-4 trade above *ahead* of the forced-flow or
policy-announcement move that will move the price. **What kills it**: this
is also the seat with the least ability to be a documented, replicable
finding — everything here depends on a specific desk's specific access,
which is exactly why the model can name the mechanism (constraint
arbitrage against a rule-bound actor) but not the trade.

## Where the edge actually comes from

- **Constraint arbitrage** is the dominant, most legitimate edge in this
  run: `AM_INDEX` is mechanically forced to buy/sell on index rules
  regardless of price (sourced, not modeled speculation), and that forced
  flow is a big enough share of the tech-side capital allocation in this
  run to be tradeable by anyone who isn't bound by the same mandate.
- **Flow foreknowledge** is the mobile-capital seat's edge specifically —
  the two leading indicators named above are both real, public, dated data
  series (war-risk insurance pricing; hyperscaler capex guidance), not
  privileged information. That's a feature: the edge is reading data
  everyone can see, before most people bother to.
- **Variance ownership** belongs to `HF_MACRO`, `CORP_COMMOD`, and `INS_RE`
  in this model, not to OBS — OBS is explicitly a price-taker, and trying
  to occupy the variance-owner role directly (as opposed to riding beside
  it) is a liability, not a strategy, per the skill's own OBS design.
- **Horizon arbitrage** shows up weakly in this run because the household
  and pension-fund kernels are the least differentiated of the three
  tiers (see `audit.md`) — this is the edge source most likely to
  strengthen once T4 kernels get the same treatment T0–T3 got here.

## Falsifiability

- **"One axis, not seven regimes"** — falsified if a future run with
  refined T4 kernels produces a household-driven regime with a magnitude
  and frequency comparable to the energy/tech axis, independent of it.
- **"Early breaks (F, G) are the decision-relevant regimes"** — falsified
  if perturbing the two named leading indicators ±30% doesn't measurably
  change which runs land in F/G vs. the round-9 regimes (an audit check
  not yet run — flagged as a next step, not done here).
- **"Constraint arbitrage against AM_INDEX is the dominant edge"** —
  falsified if AM_INDEX's mandate-rigidity constraint (cost 0.9,
  effectively hard per its dossier) turns out not to bind in this run the
  way `credit_and_plumbing`/`capital_allocation`'s kernels assume — worth
  a direct audit check on AM_INDEX's actual chosen-action distribution.

## What this is not

Not a forecast of the 2026–2036 world economy. It is the output of a
model built from real, dated, sourced research, run through a solver that
computes actual equilibria rather than narrating plausible ones, with a
verified-exact resource ledger — but still carrying the limitations in
`audit.md`: T4 kernels are thin, only one axis of tension has emerged
because only two theatres (`energy_routes`, `compute_and_capex`/`taiwan_
semiconductor`) currently drive most of the shock-linked variance, and no
adversarial audit has yet stress-tested this specific positioning report
the way `adversarial-auditor.md` requires before anything here should be
treated as a conclusion.
