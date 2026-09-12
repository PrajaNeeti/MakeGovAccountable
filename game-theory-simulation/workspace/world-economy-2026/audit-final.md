# Adversarial audit — world-economy-2026, final sourced run (2026-2036)

Independent pass per `.claude/agents/adversarial-auditor.md`, on the run described as
current: `spec.json` (40 actors, 15 theatres, all researched kernels), `runs.jsonl`
(300×10), `analysis.txt`, `positioning-report.md`. Everything below was recomputed
directly from `runs.jsonl`/`spec.json`/`engine.py`, not taken on the report's word.
`audit.md` (the prior self-audit) was read but treated as a claim to verify, not a
fact — several of its findings turned out to describe an earlier, since-superseded
run, and it missed several things below entirely.

## Fatal

### F1 — The "AM_INDEX constraint arbitrage" claim is falsified by the report's own named test, and I ran it

`positioning-report.md` calls constraint arbitrage against `AM_INDEX` "the dominant,
most legitimate edge in this run" and itself proposes the falsifier: "worth a direct
audit check on AM_INDEX's actual chosen-action distribution." I ran it.

`AM_INDEX`'s dossier constraint (`deviate_materially_from_benchmark`, cost 0.9,
described as "closer to physics than policy") has an `action` string that never
matches an engine action id (`hold`/`settle`/`escalate` — confirmed in `spec.json`).
`constraint_cost()` therefore never charges it, exactly like 89 of the other 94
sourced-but-decorative constraints `audit.md` already flagged. Its action
distribution across all 3000 round-observations is statistically indistinguishable
from a random draw: **hold 33.4% / settle 34.2% / escalate 32.4%**. Re-run under a
±30% shock-magnitude perturbation (100/100 runs completed): 32.9% / 33.1% / 34.0% —
same story. The
only real "forced flow" in the system is one unconditional `d["resources"] += 0.02`
line hardcoded into the `compute_and_capex` kernel for `AM_INDEX` regardless of
action — real, but a flat drift term, not evidence of a binding mandate constraint.
**Strike or completely rewrite this claim before it goes to a reader who might act
on it.**

### F2 — The OBS positioning section is not computed by the model at all

`engine.py` never references `observer`, any `OBS_*` seat, or any of the fields
`payoff-spec.md` documents it should compute per seat (`real_return`,
`max_drawdown`, `leverage_index`, `liquidity_at_exit`) — confirmed by grep, zero
matches anywhere in the solver. `observer.json`'s five seats are pure unused
metadata sitting in `spec.json`.

That means the entire "OBS positioning, by seat" section of `positioning-report.md`
— five seats, specific position sizes, entry triggers, "what kills it," drawdown
character — is LLM narration written on top of *actor-level* winner/loser lists,
dressed in simulation language ("sized to the base rate above," "per HH_IN
dossier's own finding"), with no instrument-level return series, no simulated
entry/exit, and no computed liquidity-at-exit behind any of it. This is precisely
the failure attack #7 exists to catch, and it is the section of the report actually
addressed to the person who might trade on it.

### F3 — "One axis, not seven" is not supported by the run's own variance structure

Direct test of the claim's mechanism (energy-producer-favorable and tech/AI-favorable
as opposite poles of one axis): correlation between `ST_GULF` and `CORP_SEMI`/
`CORP_TECH` final-round resources across the 300 runs is **r = +0.10 / +0.07** —
near zero, and the wrong sign for "opposite poles." Re-run under a ±30% perturbation
of the shocks that drive each side (100/100 runs completed): **r = −0.06 /
+0.26** — essentially still zero / wrong-signed, not the large negative "opposite
poles" would require. What *is* real and strongly polarized (and equally robust
under the perturbation, r=+0.97/−0.81): `ST_GULF` vs
`ST_RU` (r=+0.94, same side) and `ST_GULF` vs `ST_JP_KR` (r=−0.86) — a genuine
energy-producer-vs-energy-importer axis. PCA on the full 240-feature (40 actors ×
6 state dims) final-state matrix — the same representation `engine.py --analyse`
clusters on — shows PC1 explains **8.1%** of cross-run variance and PC2 **5.6%**;
ten components together explain 42%. There is no dominant single axis in this data.

What's actually happening: two nearly-independent high-magnitude mechanisms exist —
an energy-shock axis (`ST_GULF`/`ST_RU` vs `ST_JP_KR`/`ST_EU`) and a tech-capex-bubble
axis (`CORP_SEMI`/`CORP_TECH`, std ≈0.35, far the two highest-variance actors in the
system, driven almost entirely by the binary `ai_capex_correction`/
`robotics_capex_correction` shocks). Combined combinatorially, two roughly orthogonal
binary factors produce quadrant-like clusters that *look* like "one axis" once you
narrate the winner/loser list of each cluster in isolation. This is the textbook
narrative-gravity failure the audit process exists to catch, and it is the report's
single headline claim. **Rewrite as "two independent axes," not one, or drop the
framing.**

## Material

### M1 — Two of the five "operationalized" constraints are structurally unreachable, not just unstressed

Per attack #3 ("find constraints that never break across 300 runs... a constraint
that binds 100% of the time is usually mis-specified" — here, the inverse: never
*un*binds):

| Actor | breaks_if | True across all 3000 round-starts | Escalate-time breaks_if=True |
|---|---|---|---|
| ST_US | autonomy>0.85 | **0** (ST_US autonomy max observed: 0.82) | 0/240 |
| CB_US | resources<0 | **0** (CB_US resources min observed: 0.57) | 0/257 |
| ST_CN | legitimacy<0.3 | 424 (14.1%) | 119/598 (19.9%) |
| ST_TW | security<0.2 | 1251 (41.7%) | 137/163 (**84.0%**) |
| ST_JP_KR | resources<0.3 | 463 (15.4%) | 131/307 (42.7%) |

`ST_US`'s and `CB_US`'s constraints never break in 3000 round-observations — they
function as permanent flat costs on `escalate`, not tripwires. `CB_US`'s is
documented as *intentionally* near-unreachable in `kernel-constraints.json` (fair,
disclosed), but `ST_US`'s is not — its own rationale ("once autonomy is already
near-maximal...") implies the author expected it to occasionally bind, and the
run's actual autonomy ceiling (0.82) never gets there. Only 3 of the 5 — and thus
only 3 of the 95 sourced constraints in the whole dossier corpus — show genuine,
state-dependent tripwire behavior. `ST_TW`'s is the most interesting: it is broken
(free) in 84% of the rounds Taiwan actually escalates, i.e. Taiwan mostly only
escalates once it's already lost enough security to have nothing left to lose —
a real, defensible, non-decorative dynamic. Flag it as the one clean survival case.

### M2 — Global security decays monotonically in every run, mechanically inflating conflict-linked shock rates over time

mean(security) across all 40 actors, averaged over 300 runs, by round:

```
r0: 0.498  r1: 0.474  r2: 0.450  r3: 0.427  r4: 0.405
r5: 0.383  r6: 0.363  r7: 0.343  r8: 0.323  r9: 0.305
```

conflict_index (`1 − mean security`, the variable every shock's `prob_modifier`
keys off) climbs from 0.50 to 0.70 over ten rounds, in effectively every run — not
a tail scenario, the *average* path. Cause: almost every kernel decrements
security whenever anyone in a theatre escalates (`security -= 0.01..0.02 * n_esc`)
with no comparably-sized recovery term for settling, and ~30% of actors escalate in
any theatre-round essentially by construction (see M3/attack on action entropy —
most actors are near QRE-indifferent between the three actions). The result:
empirical shock-firing rates run 2-4× their nominal `annual_prob` — `taiwan_
strait_flashpoint` fires in 11.8% of rounds against a stated 3% base rate;
`cascading_systemic_crisis` at 6.3% against a stated 2%. This is not "the system
gets stressed sometimes" — it is a near-universal, un-mean-reverting decay baked
into the kernel asymmetry, which means the round-9-heavy branch timing that
`positioning-report.md` treats as a finding ("five of seven regimes only separate
by round 9") is at least partly a mechanical artifact of this drift, not solely
economics playing out. `audit.md`'s own "Noted" caveat that shock rates were never
checked against historical base rates is still true, and this makes that check more
urgent, not less.

### M3 — HH_DM_LABOR is pinned at zero resources for most of a typical run

`HH_DM_LABOR` (wage-dependent DM households) sits at `resources ≤ 0` in **38.5%**
of all 3000 round-observations and hits zero at least once in **86.7%** of the 300
runs — far beyond any other actor (next highest: `AM_ACTIVE` 33.7% of runs,
`HH_EM_URBAN` 24.0%). Cause, traced to the kernel: `consent_dm`'s `HH_DM_LABOR`
branch never gives it a positive resources delta under *either* action (escalate:
legitimacy/autonomy only; settle: legitimacy only) — its only resource inputs are
negative shocks (`ai_progress_acceleration`, `manufacturing_automation_wave`, −0.10
each, ~15-18% annual probability, with no positive shock ever targeting it) and
theatre-mean-subtraction. Once floored, the "labor funds the AI/robotics complex"
transfer that `shocks.json`'s own `_conservation_note`s describe as real can no
longer actually be paid by an actor with nothing left to give — `clamp()`'s
`floor_protected` accounting keeps the ledger formally balanced (confirmed in the
Survived section below) but the economics are now capital receiving credited gains
that were never actually taken from anyone. System-wide `floor_protected` grows
from ~0 (round 0) to ~0.09/round (round 9) — an increasing, silent
manufactured-value stream. `audit.md`'s "T4 kernels are the least differentiated"
self-assessment understates this badly for this specific actor: it isn't
under-differentiated, it's functionally insolvent for most of the run by
construction.

### M4 — The shock responsible for the three largest single-round swings in the whole dataset omits directly relevant, already-modeled actors

The three single largest actor-round resource swings across all 300 runs are all
`CORP_SEMI` losses of ≈−0.43 to −0.44 (more than 10× a typical kernel-driven move),
all driven by `taiwan_strait_flashpoint`. That shock's effects touch only `ST_TW`,
`CORP_SEMI`, `ST_CN`, `ST_US`. It omits: `ST_JP_KR` (called "chip-and-materials-
exposed" by the positioning report itself), `CORP_DEFENSE` (whose entire modeled
purpose per `actors.json` is tracking order-book response to exactly this kind of
event), and `INS_RE` (whose own dossier explicitly states war-risk pricing does
*not yet* cover Taiwan risk — precisely the repricing this shock should force).
This is attack #2 (missing actors / missing linkages) landing on the single most
consequential shock in the dataset.

## Noted

- `audit.md`'s Fatal #2 ("ledger conservation not implemented, 99.1-99.6% flagged")
  describes an earlier, pre-fix run and does not apply to the final run being
  audited here (see Survived, below) — but nothing in the repo marks that finding
  as superseded, so a future reader of `audit.md` alone would wrongly distrust a
  run that has since been fixed.
- The escalate-rate suppression credited to "the constraint mechanism" (5.4-16.5%
  vs. ~30%+ baseline) is real, but unconstrained actors like `ST_RU` (24.4%),
  `ST_FRAGILE` (23.7%) and `HH_EM_SUBSIST` (21.6%) are also suppressed with no
  constraint at all — some of the effect is ordinary kernel/QRE asymmetry, not
  proof the constraint layer alone explains the gap.
- T4's "least differentiated" self-diagnosis is right on resource-outcome variance
  (mean std 0.044, second-lowest tier after T2's 0.026) but not on action-choice
  entropy — T3's own unconstrained actors are equally indifferent (normalized
  entropy 0.999 vs T4's 0.995); only the tier holding the constrained actors (T1,
  0.949) shows real differentiation. The "T4 problem" is really a "5 of 40 actors
  have a working constraint" problem that happens to miss T4 entirely.
- Base rates: never checked against real historical frequencies (audit.md admits
  this) — now compounded by M2's structural drift, which will bias any such
  comparison until the drift itself is addressed.
- Hindsight leakage: no dynamic contamination mechanism found. Dossiers freeze
  2026-dated facts as t0 initial conditions and fixed kernel logic applied
  identically every round — a legitimate design choice, not literal hindsight
  leakage into later rounds, but it does mean round-9 (2035) behavior is
  mechanically "2026 incentives, replayed with more compounding," which neither
  `audit.md` nor `positioning-report.md` flags as a limitation with the weight it
  deserves.
- Perturbation check (±30% on `energy_supply_disruption`, `ai_progress_
  acceleration`, `manufacturing_automation_wave` up, `ai_capex_correction`/
  `robotics_capex_correction` down) was completed as a full 100-run sweep
  (`/tmp/audit_perturb/`, seed 42) — see F1 and F3, both of which cite the
  completed numbers directly. Both findings are structural (a near-zero
  correlation, a string-mismatch in code) rather than magnitude-sensitive, and
  the full sweep confirms neither reverses under a real parameter perturbation.

## Survived

- **Ledger conservation is real, independently re-derived.** Recomputed total
  system resources round-by-round directly from raw `state` dicts (not the
  recorded `ledger_drift` field) across all 3000 round-observations and compared
  against `shock_resources_net + floor_protected`. Max independent drift found:
  4×10⁻⁴, fully attributable to the 4-decimal rounding applied to stored state
  values (40 actors × 5×10⁻⁵ rounding each ≈ that scale) — not a leak. The
  `positioning-report.md` claim (0/3000 flagged, drift 0.0) holds up under an
  independent recomputation, not just a re-check of the same recorded field.
  Spot-checked several rounds' `shock_resources_net` against `shocks.json`'s
  stated per-shock effects plus the engine's documented 0.5× multi-round carryover
  — matches exactly.
- **All 15 theatres genuinely run distinct, actor-specific kernels** — confirmed
  every `interaction_matrix` value in `theatres.json` resolves to a real,
  non-`generic_competition` function in `engine.py`'s `PAYOFFS` registry.
  `audit.md`'s own "Update" section (11 of 15 theatres still generic) describes a
  state prior to this final build and no longer applies.
- Where a constraint *is* wired to a matching action (`ST_CN`, `ST_TW`,
  `ST_JP_KR`), it produces real, differentiated, explainable behavior — `ST_TW`'s
  is the cleanest case (see M1).
- Credibility/deception mechanism produces differentiated, sourced-consistent
  outcomes: lowest final credibility clusters on `CORP_COMMOD` (mean 0.30),
  `ST_FRAGILE` (0.33), `ST_RU` (0.33) — matching their dossier-stated baselines,
  not uniform decay.
- No scope drift into tactical/operational military detail anywhere checked
  (`shocks.json`, all 15 kernels in `engine.py`, `theatres.json`,
  `positioning-report.md`). The one place real-world citations get specific about
  weapons (`CORP_DEFENSE`'s dossier, e.g. Lockheed's Precision Strike Missile
  production quadrupling) is used strictly as an economic capacity/backlog
  indicator, consistent with `actors.json`'s own "track order books, not white
  papers" instruction — not modeled at the operational level anywhere.

## Calibration

Very little of this specific run should be bet on. The two claims a reader would
most want to act on — "one axis, energy vs. tech" and "constraint arbitrage against
AM_INDEX is the edge" — are both directly falsified by the data already in
`runs.jsonl`, using the report's own named falsifiability tests. The OBS-seat
section, the part actually addressed to a person with money, is unmodeled
narration wearing the vocabulary of a simulation.

The one thing here I would put real weight on: **the energy-producer-vs-energy-
importer correlation itself** — `ST_GULF`/`ST_RU` moving opposite `ST_JP_KR`/`ST_EU`
(r ≈ 0.86-0.95, robust to a ±30% shock-magnitude perturbation) is a genuine,
sourced, mechanically real pattern in this model, and probably in the world it's
modeling. Everything built on top of it in `positioning-report.md` — the "one
axis" framing that welds a second, unrelated tech-bubble factor onto it, the
specific cluster percentages, the OBS seat strategies, the "constraint arbitrage"
edge — is not something I'd stake anything on. Treat this run as confirming the
pipeline can produce a real signal (the energy axis) buried inside a lot of
narrative and mechanical debt, not as a forecast.
