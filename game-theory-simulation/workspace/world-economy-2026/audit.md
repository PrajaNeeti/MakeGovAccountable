# Audit — world-economy-2026, sourced run (2026-2036)

> **SUPERSEDED, 2026-09.** This file documents an earlier build (38 actors,
> before the ledger-conservation fix, before all 15 theatres had researched
> kernels, before the BANK_GSIB/ST_ENTREPOT splits). Its Fatal #1 and #2
> (ledger not conserved, 0/95 constraints bind) describe problems that have
> since been fixed and independently re-verified — see
> [`audit-final.md`](./audit-final.md) for the current, independent
> adversarial-auditor pass against the actual current run, including a
> fresh set of Fatal findings of its own (the OBS section isn't computed by
> the model at all, and two of `positioning-report.md`'s headline claims
> are directly falsified by the data). **Read `audit-final.md` first.** This
> file is kept only as a record of what the build looked like at this
> earlier stage.

Self-audit following the `adversarial-auditor` attack order, on the sourced
300-run x 10-round sweep (all 38 actors real dossiers, 13 shocks including
AI-trajectory and robotics branches). Not a separate subagent pass — done
directly, using the actual run data, because the findings below required
computing things (constraint-action overlap, threshold engagement rates)
that are cheaper to check directly than to hand off.

## Fatal

### 1. The constraint/tripwire layer has zero mechanical effect

**This is the most important finding in this audit.** All 38 dossiers
contain real, sourced constraints (95 total) with genuine tripwires — e.g.
CB_US's "reserves falling into the $2.5-2.7tn band forces balance-sheet
expansion," Taiwan's "cede majority of leading-edge capacity offshore"
priced at cost 0.6. `interest-researcher.md` calls tripwires "the
highest-value field... what makes a run auditable a year later."

None of them ever apply. Checked directly:

```
0/95 constraint action-strings match an actual engine action id
```

The engine's bundled `generic_competition` kernel only gives every actor
three possible actions: `hold`, `settle`, `escalate`. `constraint_cost()`
only charges a cost when `constraint["action"] == the action actually
chosen` — and no dossier constraint is phrased as "hold", "settle", or
"escalate", because real constraints are about real things
(`sovereign_default_or_missed_debt_service`, `abandon_Russian_defense_
relationship`, `cede_majority_of_leading-edge_capacity_offshore`, etc.).

**This is not a quick remapping fix.** Even relabeling each constraint's
`action` field to the nearest of `{hold, settle, escalate}` wouldn't make it
bind in a way that means anything: the generic kernel gives no actor a
genuine payoff reason to prefer a costly action over `hold` in the first
place, so a QRE-rational actor with a real payoff differential would almost
never choose the constrained action regardless of whether a cost is
attached. Making constraints actually matter requires **researched,
theatre-specific payoff kernels** where the constrained action has a real,
distinct payoff to trade off against its cost — exactly what
`SKILL.md` and the original `actors.json`'s own `next_steps` already flagged
as required, not-yet-done work: *"Write researched payoff kernels for
reserve_currency_order, taiwan_semiconductor and energy_routes —
generic_competition will not produce meaningful results for these."*

**What this means for every result below:** the simulation currently
reflects real starting states, real credibility/discount-rate/deception
parameters, real exogenous shocks, and generic cooperate/defect payoff
dynamics — but it does **not** yet reflect any actor's specific strategic
constraints, moral/ideological limits, or tripwire-triggered behavior,
despite having fully sourced all of them. Every actor in this run is
freer than the research says it actually is.

### 2. Ledger conservation is not implemented, only checked

Tightening `ledger_tolerance` from 1e9 (a prior bug) to 0.02 didn't fix
conservation — it correctly revealed that the transition model was never
conservative to begin with: 2974/3000 rounds (99.1%) now flag `ledger_ok:
false`, drift averaging 0.65 and peaking at 1.86. `generic_competition`
computes each actor's deltas independently (not as paired transfers between
a winner and a loser), and shocks add/subtract resources with no `destroyed`
accounting. `deception-and-resource-flow.md` is explicit that unexplained
destruction means "a transition function is leaking" and that a leaking
model should halt, not be patched — engine.py records the flag but never
halts on it, which is itself a gap between the documented design and the
bundled code. Read the `resources` dimension in this run as ordinal
(who gained/lost more) rather than as strictly accounted.

## Material

### 3. Silent resource destruction at the zero floor (persists, reduced)

Same mechanism flagged in the bootstrap-run audit, still present with real
data, at lower but non-trivial rates: `ST_EU` hit `resources≈0` in 67/300
runs (22.3%), `CORP_SEMI` in 53/300 (17.7%), `ST_JP_KR` in 33/300 (11.0%).
`clamp()` floors resources at 0 with no named destruction mechanism.

### 4. Research surfaced actor-structure recommendations not yet acted on

The interest-researcher pass repeatedly found that the Cartographer's
merge/split calls should change, and this run still uses the original
structure:
- **BANK_GSIB should split** — confirmed with hard evidence (2023: US
  ring-fenced its deposit guarantee to US-chartered deposits; Switzerland
  unilaterally inverted the AT1/equity creditor waterfall; EU/BoE publicly
  repudiated the Swiss approach within days; still in active litigation in
  2026). The merged treatment is confirmed wrong under stress, not merely
  untested.
- **ST_ENTREPOT should split** — UK/Ireland/Luxembourg (reparations-loan
  willing) vs. Switzerland/Singapore (neutrality-preserving, though
  Singapore/HK weren't directly sourced this pass — a gap, not a finding).
- **ST_EU should NOT split** — the researched north/south fault line
  inverted (Italy's spread converged toward Germany); France alone is the
  real 2026 risk, not a bloc division. This is the cartographer's own open
  question resolved in the opposite direction from what was expected.
- **ST_FRAGILE's merge mostly holds** (Pakistan/Egypt share the
  liquidity/IMF-cycle mechanism) **but Argentina diverges**: no
  strategic-geography-rent asset, and a bespoke election-timed US Treasury
  swap line unavailable to the other two cases.

None of these are implemented in this run's `actors.json`/`theatres.json` —
doing so is a real Cartographer-level restructuring, not something to
patch silently mid-audit.

### 5. Narrative-gravity check on a headline finding

Cluster 4 (4.0% of runs, earliest branch point at round 5) shows CORP_TECH
+0.23 as the standout winner with BANK_GSIB -0.27 as the standout loser —
the most dramatic single-cluster swing in the run. Traced back: this cluster
correlates with early `ai_progress_acceleration` firings compounding before
round 5, consistent with the shock's own design (duration_rounds 2,
resources+rank effects). This is explainable by a known, documented
assumption (not a hidden parameter), so it survives — but note the base
rate: only 12/300 runs (4%) land here, and the branch point at round 5 is
earlier than the round-9 branch point of every other cluster, meaning this
is a genuine early-diverging tail scenario, not the modal case. Don't read
it as the expected outcome.

### 6. Correlated-shock bug found and fixed mid-session

`ai_capex_correction`/`robotics_capex_correction` were gated on
`CORP_TECH:rank>0.25/0.3` — a threshold that was always true given
CORP_TECH's real sourced starting rank of 0.75, making the "correlated"
shock fire at a flat 3x rate for the entire run regardless of what actually
happened. Fixed to `>0.85` (rank ranges 0.66-1.0 in this run's data) and
re-run; verified the fix engages correctly (12.0% correction rate below
threshold vs 25.8% above, threshold true in 56% of round-states rather than
100%). The run analyzed below is the corrected one.

## Noted

- Shock firing rates look plausible relative to design (`energy_supply_
  disruption` most common at 21.5%, `succession_or_leadership_shock`
  rarest at 4.4%) but haven't been checked against real historical base
  rates for each category — that check hasn't been done.
- Credibility dynamics are live and differentiated: lowest final
  credibility clusters around actors whose dossiers themselves reported low
  overall credibility (`CORP_COMMOD` 0.31, `ST_FRAGILE` 0.33, `ST_RU` 0.34),
  consistent with sourced baselines rather than an artifact of the sim.
- Several dossiers flagged their own low-confidence areas honestly (CB_EM's
  merged-actor heterogeneity, IFI's unconfirmed-not-disproven US-proxy
  divergence claim, ST_ENTREPOT's unsourced SG/HK positioning) — these
  remain open, not resolved by this run.

## Survived

- The deception/credibility mechanism is genuinely live, not decorative:
  credibility floors track sourced baselines, and the belief-update loop
  produces differentiated outcomes across actors rather than uniform decay.
- Real dossier data materially changed the outcome distribution shape
  relative to the flat-stub bootstrap run (compare cluster winner/loser
  lists between the two committed `analysis.txt` versions in git history) —
  the sourcing pass wasn't inert.
- All 300 runs completed with the same seed producing the same result on
  re-run (checked implicitly: re-running after the threshold fix changed
  only the intended mechanism, not unrelated outputs) — no evidence of
  non-determinism bugs.

## Update — researched kernels + operationalized constraints (post-fix)

Fatal finding #1 has been partially addressed, not fully closed. Wrote 4
actor-differentiated payoff kernels (`reserve_currency_order`,
`taiwan_semiconductor`, `energy_routes`, `global_dollar_funding`, covering
15 actors) replacing `generic_competition`, and operationalized 5 of the 95
sourced constraints onto the `escalate` action for actors in those kernels
(`ST_US`, `ST_CN`, `ST_JP_KR`, `ST_TW`, `CB_US`) — see
`kernel-constraints.json` for exactly which 5 and the documented reasoning
for each, including the numeric `breaks_if` proxies used since the engine
can't parse natural-language tripwires.

**Verified this actually changed behavior, not just cosmetically:**
escalate rates for the 5 constrained actors are sharply suppressed relative
to unconstrained actors in the same kernels — `ST_TW` 5.1%, `ST_US` 8.7%,
`CB_US` 9.5%, `ST_JP_KR` 9.8%, `ST_CN` 16.5%, versus `CORP_SEMI` 34.0%,
`CB_CN` 34.5%, `ST_GULF` 32.0% (no constraint, same kernels). The ordering
is explainable, not arbitrary: Taiwan escalates least given its extreme
exit cost stacked with the new constraint; China's relatively higher rate
among the five tracks its much lower constraint cost (0.15 vs 0.3-0.5 for
the others). This is real signal from a QRE solver genuinely weighing a
sourced cost against a sourced payoff, not decoration.

**Still open — this was a targeted fix, not a general one:** 33 of 38
actors and 11 of 15 theatres still run on `generic_competition` with no
actor-specific constraints binding. The remaining constraints (90 of 95)
are still descriptive-only. Extending researched kernels to more theatres
would be the natural next increment, in the same priority order the
Orchestrator's own guidance implies (T0 theatres first, since upper-tier
outcomes constrain lower tiers, not the reverse).

**Ledger conservation is unchanged and still fails at the 0.02 tolerance**
(99.6% of rounds) — the new kernels are still independent per-actor deltas,
not paired transfers, so this fix didn't touch that issue. It remains the
single largest unresolved mechanical gap: `resources` figures in this run
should still be read as ordinal, not accounted.

## Calibration

How much of this would I bet on: **the qualitative structure (which actors
are chronically fragile, which shocks matter, the direction of credibility
effects) is worth taking seriously — it's built from real, dated, sourced
research.** The specific cluster percentages and magnitudes are not worth
betting on at all, for one overriding reason: Fatal finding #1. A
simulation whose entire researched constraint layer cannot bind is missing
the mechanism most likely to produce the interesting, non-obvious outcomes
(capitulations, tripwire cascades, actors trading real resources against
real limits) that this whole pipeline exists to find. Treat this run as
validating the pipeline's plumbing and the research quality, not as a
forecast.
