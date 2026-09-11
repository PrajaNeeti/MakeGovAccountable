---
name: strategic-game-engine
description: Hybrid game-theoretic engine for modelling how self-interested actors — states, central banks, banks, corporations, households, factions — behave over a dated multi-round timeline, including deception, coalitions, hierarchy and conflict. Use this whenever a question involves multiple parties with conflicting interests and you need to work out what each would actually do, who ends up ahead, or how a situation could evolve. Use it for geopolitics, macroeconomics, market structure, negotiations, competitive strategy, regulation, and any "how will this play out" or "what's everyone's real incentive here" question — even when the user doesn't mention game theory at all.
compatibility: Requires Python 3.10+ with numpy. Optional scipy for faster equilibrium solving.
---

# Strategic Game Engine

The shared rulebook. LLM reasoning extracts structure and interprets results;
Python solves the equilibria and moves the resources. Neither does the other's
job — the LLM never guesses what the solver should compute, and the solver
never invents structure the research didn't establish.

## Division of labour

| Step | Who | Why |
|---|---|---|
| Identify actors, actions, constraints | LLM | Requires world knowledge and judgement |
| Estimate payoff parameters | LLM, from sourced evidence | Requires interpretation |
| Solve equilibrium | Python (`scripts/engine.py`) | LLMs cannot reliably solve games; they narrate plausible outcomes and call it a solution |
| Apply transitions, keep ledger | Python | Arithmetic must be exact and conserved |
| Sample shocks, run Monte Carlo | Python | Needs real pseudo-randomness, not "imagine a different outcome" |
| Cluster, name regimes, interpret | LLM | Requires meaning-making |

**The one rule that matters:** if the LLM ever produces a specific number that
should have come from the solver, the run is invalid. Narrated equilibria are
the failure mode this whole design exists to prevent.

## Quick start

```bash
python scripts/engine.py --spec workspace/<run>/spec.json \
                         --runs 300 --rounds 20 --seed 42 \
                         --out workspace/<run>/runs.jsonl

python scripts/engine.py --analyse workspace/<run>/runs.jsonl --clusters 7
```

`spec.json` schema, field by field: `references/payoff-spec.md`.

## Core objects

**Actor** — id, tier, state vector, utility weights, discount rate, constraint
list, credibility, private type.

**State vector** — every actor carries the same 6 dimensions so payoffs compare
across tiers:

```
resources    real economic capacity / reserves / capital       [0, ∞)
security     ability to resist coercion                        [0, 1]
legitimacy   consent of the selectorate                        [0, 1]
autonomy     freedom from others' control over your choices    [0, 1]
rank         positional standing vs a named rival              [-1, 1]
liquidity    ability to act *now* — the constraint that binds
             in crises and is omitted from most models         [0, 1]
```

Include `liquidity`. Solvency problems are slow and negotiable; liquidity
problems are fast and are what actually forces capitulation. Most models that
fail to predict crises fail here.

**Action** — id, cost vector, effect vector, reversibility, visibility
(`overt` / `covert` / `deniable`), and which constraints it violates.

**Theatre** — a subset of 2–5 actors whose actions interact strongly this round.
Decompose each tier into theatres; solve each separately; then check cross-
theatre spillovers and re-solve any theatre whose payoffs moved more than the
tolerance. This is what makes 40 actors tractable. Details:
`references/game-forms.md`.

## Solution concept

**Logit quantal response equilibrium (QRE)**, not pure Nash. Reasons:

- real actors make mistakes proportional to how costly the mistake is
- QRE always exists and is unique along the λ path, so no arbitrary equilibrium
  selection at every round
- it degrades gracefully with bad parameter estimates, while Nash can flip
  discontinuously — which matters when your payoffs are LLM estimates with real
  error bars
- λ (rationality) is itself a modelling lever: λ→∞ is Nash, λ→0 is random.
  Stressed, distracted or internally-split actors get lower λ. This is how you
  model a government in the middle of a scandal.

Where a theatre has multiple stable equilibria, sample by risk dominance, not
payoff dominance. Actors coordinate on the safe equilibrium far more often than
on the best one.

## Deception and the flow ledger

Read `references/deception-and-resource-flow.md` before implementing signalling.
The short version:

- Each actor emits `declared_intent` (cheap talk, optionally false) and takes
  `true_action` (costly, partially observable).
- Observability depends on the action's visibility class and the observer's
  monitoring capability.
- **Resource flows are always partially observable and cannot be faked** —
  goods move or they don't, reserves change or they don't, ships sail or they
  don't. This is the ground truth channel.
- Beliefs update Bayesian-ish, weighting flow evidence ~3x signal evidence.
- Caught lying → credibility decays; credibility gates how much your future
  signals move others' beliefs. A cheap lie today is a priced loss of
  future influence, which is exactly why credible actors stay credible.

This is the mechanism that lets the model detect strategic misrepresentation
without anyone hand-labelling it.

## Hierarchy

Solve T0 → T4 within each round. Upper-tier equilibrium modifies lower tiers by:

1. **Action availability** — some actions get removed (sanctioned, banned,
   blockaded)
2. **Action cost** — a T2 rate decision changes every T3 actor's cost of capital
3. **Payoff scaling** — a T0 regime change rescales everyone's resource term

Upper-tier outcomes never become lower-tier *objectives*. A bank does not
maximise national interest; it maximises its own payoff inside the constraints
the state and central bank created. Collapsing that distinction destroys the
model's ability to find the interesting cases — where lower tiers' rational
behaviour undermines the upper tier's intent. Those cases are most of the
value.

## Conflict

War is modelled as a **costly lottery over resource and rank transfer**, with:

- large negative expected value for both sides in most parameterisations
- variance that some actors want — those below their survival threshold, those
  losing on trend, those whose selectorate rewards fighting over conceding
- commitment and reputation effects that persist beyond the conflict
- third parties whose payoffs are dominated by the *variance* (arms, energy,
  shipping, insurance, restructuring)

Model it at the level of force posture, resource transfer, alliance shift, and
risk repricing. Never at the level of operations, targeting or weapons. If a
run needs tactical detail to produce its answer, the question was mis-scoped —
strategic outcomes should not depend on it.

## Bundled files

- `references/payoff-spec.md` — full `spec.json` schema with worked example
- `references/game-forms.md` — theatre decomposition, coalitions, repeated-game
  folk theorem, commitment, signalling
- `references/deception-and-resource-flow.md` — belief update, ledger
  reconciliation, credibility dynamics
- `references/kautilya-mandala.md` — Arthashastra structure: shadgunya as the
  canonical action basis, chaturupaya escalation ladder, exposure-based mandala
  for theatre formation, the OBS seat as vijigishu
- `scripts/engine.py` — solver, Monte Carlo, transitions, ledger checks
- `scripts/build_spec.py` — merges `actors.json` + dossiers into `spec.json`

## Failure modes to watch

- **Narrated equilibrium** — the LLM decides the answer and the solver confirms
  it. Prevent by fixing seeds and checking that the solver output surprises you
  at least sometimes. If it never surprises you, it isn't computing anything.
- **Payoff overfitting** — tuning weights until the output matches your prior.
  Prevent by writing down the expected result *before* the first run.
- **Actor omission** — the biggest single source of wrong answers.
- **Liquidity blindness** — modelling solvency and forgetting funding.
- **Hindsight in dossiers** — 2026 knowledge applied to round-15 actors.
- **Mean-only reporting** — hiding a fat left tail behind an expected value.
