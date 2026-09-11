# spec.json — schema

Built by `scripts/build_spec.py` from `actors.json` + `dossiers/*.json`. Never
hand-write payoff numbers that a dossier should have justified; every parameter
carries the dossier assumption ID it came from so the Auditor can perturb it.

## Top level

```json
{
  "meta": {"system":"...", "t0":2026, "rounds":20, "numeraire":"2026_USD"},
  "actors": [ ... ],
  "theatres": [ ... ],
  "shocks": [ ... ],
  "observer": { ... },
  "transition": { ... }
}
```

## Actor

```json
{
  "id": "ST_IN",
  "tier": "T1",
  "lambda": 6.0,
  "state": {"resources":1.0,"security":0.6,"legitimacy":0.7,
            "autonomy":0.55,"rank":0.1,"liquidity":0.75},
  "weights": {"survival":0.32,"resources":0.26,"autonomy":0.22,
              "legitimacy":0.15,"relative_rank":0.05},
  "discount": 0.10,
  "survival_threshold": 0.25,
  "credibility": 0.7,
  "deception_prior": 0.25,
  "private_type": {"risk_tolerance":[0.3,0.7], "revisionism":[0.1,0.4]},
  "monitoring": 0.6,
  "actions": ["hold","devalue","capital_controls","align_bloc_A",
              "align_bloc_B","rearm","subsidise_domestic"],
  "constraints": [
    {"action":"default","cost":0.5,"breaks_if":"liquidity<0.15"}
  ],
  "assumption_ids": ["D-ST_IN-003","D-ST_IN-011"]
}
```

`lambda` — QRE rationality. 10+ = near-optimal, well-advised, focused.
4–8 = normal institution. 1–3 = internally split, distracted, in crisis.
Lower λ under stress in the transition model rather than fixing it for all 20
rounds; a government handling three crises at once genuinely plays worse.

`private_type` — ranges, not points. One value is drawn per run at t=0 and held
fixed. Other actors do not observe it; they infer it. This is the engine of
persistent disagreement — actors keep misreading each other for years, which is
what actually happens.

`monitoring` — 0–1, how well this actor observes others' covert actions.
Intelligence capability, essentially. Asymmetric monitoring produces most of
the interesting information games.

## Theatre

A theatre is where interaction is dense enough that actions must be solved
jointly.

```json
{
  "id": "reserve_currency",
  "tier": "T0",
  "members": ["ST_US","ST_CN","CB_US","CB_EU"],
  "interaction_matrix": "payoff_fn:reserve_currency",
  "spillover_to": ["emerging_funding","energy_routes"],
  "spillover_strength": 0.4
}
```

Keep members ≤ 5. If a theatre needs more, it is two theatres plus a spillover
edge — every extra member multiplies the joint action space, and beyond five
you are computing noise at great expense.

## Payoff function

Payoffs are computed in code, not enumerated by hand. Each theatre names a
function in `engine.py`'s registry with signature:

```python
def payoff(actor, own_action, others_actions, state, params) -> dict
# returns deltas on the six state dimensions, pre-utility-weighting
```

Utility = weighted sum of state deltas, minus constraint costs, discounted
over the actor's horizon, with the **survival threshold applied
lexicographically**: below threshold, the survival term dominates all others
regardless of weights. That discontinuity is deliberate. It is what produces
capitulations, lunges and wars, and smoothing it out is the single most common
way this class of model becomes useless.

## Shock

```json
{
  "id": "energy_supply_disruption",
  "annual_prob": 0.08,
  "prob_modifier": {"if":"conflict_index>0.5","multiply":4.0},
  "effects": {"ST_JP":{"resources":-0.12},"ST_SA":{"resources":+0.2}},
  "duration_rounds": 2
}
```

Shocks must be **correlated**, not independent. Independent shocks produce
implausibly smooth histories; real systems cluster their crises because the
same stress causes several at once. Use `prob_modifier` to condition shock
probability on the current state, and define at least one shock whose
probability rises with the system's own instability. That single feedback loop
is what generates realistic fat tails.

## Observer

```json
{
  "seats": [
    {"id":"OBS_local","jurisdiction":"IN","currency":"INR",
     "mobility":0.2,"capital_base":"small","instruments":["equity_local",
     "gold","real_estate","fd","usd_cash"]},
    {"id":"OBS_mobile","jurisdiction":null,"currency":"USD",
     "mobility":1.0,"capital_base":"medium",
     "instruments":["equity_global","commodities","vol","credit","gold","fx"]}
  ],
  "rebalance":"annual",
  "report":["real_return","max_drawdown","leverage_index","liquidity_at_exit"]
}
```

`liquidity_at_exit` matters more than it looks. A position that pays off only in
a scenario where the market for it is shut is a losing position. Check the exit.

## Transition

```json
{
  "feedback_lags": {"T4_to_T1": 3, "T3_to_T2": 1, "T1_to_T0": 2},
  "lambda_stress_coupling": 0.5,
  "ledger_tolerance": 1e-6,
  "conflict_model": "costly_lottery_v2"
}
```
