# Self-audit notes — world-economy-2026 bootstrap run

This is a lightweight self-check done alongside the run, not a full
`adversarial-auditor` pass (that agent hasn't been invoked on this run yet).
Treat it as a first filter, not a clearance.

## Status of the underlying data

**This run is illustrative of the machinery, not of the world**, per
`actors.json`'s own `BOOTSTRAP` status line. All 38 dossiers are stub
placeholders (`workspace/world-economy-2026/make_stub_dossiers.py`): uniform
canonical utility weights, flat 0.6 credibility, flat 0.2 deception prior, and
a `discount_rate` mechanically derived from the Cartographer's
`time_horizon_years` — nothing sourced. No headline number below should be
treated as a claim about the actual world economy until `interest-researcher`
produces real dossiers.

## Findings

**1. Ledger check (Fatal, as configured — cosmetic pass).**
`build_spec.py`'s default `transition.ledger_tolerance` is `1e9`. Every round
in all 300 runs reports `ledger_ok: true`, but the *actual* ledger drift
(`ledger_drift` field, which the engine still computes correctly) averages
0.75 and peaks at 1.8 system-wide resource units per round. The pass/fail flag
in this run's output is meaningless — conservation was never actually
enforced or checked at a real tolerance. Fix before trusting any resource
transfer number: re-run with `ledger_tolerance` around `1e-3`–`1e-2` (matching
the scale of per-round deltas in `generic_competition`, ~0.01–0.05) and see
whether it halts.

**2. Silent destruction at the resources floor (Material).**
`engine.py`'s `clamp()` floors `resources` at 0 with no named destruction
mechanism (contrast `security`/`legitimacy`/`autonomy`/`liquidity`, which are
bounded both sides for structural reasons). In this run:
- `ST_EU` hit `resources ≈ 0` in 138/300 runs (46%) by round 19
- `CORP_SEMI` in 121/300 (40%)
- `ST_JP_KR` in 103/300 (34%)

Once an actor is pinned at the floor, further negative deltas are simply
absorbed — value evaporates rather than transferring to whoever's action
caused the loss. Per `deception-and-resource-flow.md`: *"unexplained
destruction means a transition function is leaking, and a leaking ledger
always flatters somebody."* Here it doesn't flatter a winner (no offsetting
gain is recorded anywhere) — it just makes these three actors look more
depleted than the model's own accounting can support. Their "loser" status in
several clusters below should be read with this in mind.

**3. Reduced action set (Noted, not hidden).**
Every actor was restricted to `{hold, settle, escalate}` rather than the full
six-fold Kautilyan basis, because the bundled `generic_competition` kernel
only behaviourally distinguishes those two against hold — `posture`/`align`/
`hedge` would have added 5x+ compute cost for zero behavioural difference
without a researched per-theatre kernel. `dvaidhibhava` (hedge), which the
Cartographer flagged as decisive for `ST_IN` and `ST_SWING`'s madhyama
positioning, is therefore **not actually represented** in this run's dynamics
despite appearing as `shadgunya_default` in `actors.json`. Any claim below
about India or the swing powers "hedging" is not something this run tested.

**4. Not yet checked (would need a full auditor pass).**
Missing-actor defenders, constraint realism (dossiers have zero constraints,
so nothing was ever tested against a breakable trigger), hindsight leakage,
narrative gravity / parameter perturbation on the two headline claims below,
historical base-rate comparison, OBS seat reachability, and falsifiability of
each cluster claim. None of this has been done. Recommend a real
`adversarial-auditor` pass before using this run for anything beyond "does
the pipeline run."

## What actually ran cleanly

- All 300 runs completed, seeds 42–341, 20 rounds each (2026–2045).
- 8 shocks fired at plausible relative rates (energy disruption most common at
  23.6% of round-draws; the instability-coupled `cascading_systemic_crisis`
  rarest at 8.2%, as designed).
- All three available actions (`hold` 34.9%, `settle` 35.5%, `escalate`
  29.6%) were actually chosen across runs — the QRE solver is doing real
  work, not defaulting to a corner solution.
- Credibility dynamics moved (several actors drifted below 0.5 by round 19),
  showing the deception/detection loop is live, not inert.
