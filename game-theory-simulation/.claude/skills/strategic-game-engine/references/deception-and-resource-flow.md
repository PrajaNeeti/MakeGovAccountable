# Deception and the resource-flow ledger

The problem: actors can lie, and a model that takes statements at face value is
useless for exactly the situations worth modelling. The solution is not to
guess who is lying. It is to build a channel that **cannot be lied through**,
and let inconsistency between the two channels do the work.

## Two channels

**Channel 1 — signals.** `declared_intent`, emitted each round. Free to send,
free to falsify. Moves other actors' beliefs in proportion to the sender's
credibility in that domain.

**Channel 2 — flows.** Resources physically move. Ships sail, reserves change,
budgets are spent, people are hired, factories are built. An actor can hide
*some* of a flow but cannot make a flow it did not make, and cannot un-spend
what it spent. Flows are the ground truth.

Deception is detected as **divergence between what channel 1 claimed and what
channel 2 shows** — never by an oracle telling the model who lied.

## Belief update

For actor *i*'s belief about actor *j*'s private type θ:

```
prior       b_i(θ_j)
signal      likelihood weighted by credibility c_j  →  weight w_s = c_j
flow        likelihood from observed flows          →  weight w_f = 3 · m_i

posterior ∝ prior · L_signal^w_s · L_flow^w_f
```

where `m_i` is *i*'s monitoring capability. Flow evidence carries roughly 3x
signal evidence. Tune, but keep the ratio well above 1 — this single constant
is what stops the model being talked into things.

Actors with high monitoring see more of the flow channel and so are less
deceivable. Monitoring asymmetry is itself a strategic asset, and it should
show up in the OBS analysis: an information-advantaged seat is one of the few
reliable sources of edge.

## Credibility dynamics

```
if |declared_intent − true_action| > tolerance and detected:
    c_j ← c_j · (1 − decay)          # decay ≈ 0.25, domain-specific
else if commitment kept at real cost:
    c_j ← min(1, c_j + recovery)     # recovery ≈ 0.05, slower than decay
```

Asymmetry is the point: credibility falls fast and rebuilds slowly, which is
why it is treated as an asset by actors who have it.

Consequences that must be in the model:
- Low-credibility actors' signals stop moving beliefs. They lose the ability to
  deter, reassure or coordinate — which is expensive, and is why a rational
  liar lies rarely and only for large stakes.
- Therefore **lying should be rare and high-stakes in equilibrium**. If your
  runs produce constant lying, the credibility cost is set too low.
- High-credibility actors have a valuable, spendable asset. Watch for actors who
  spend it all at once — that is usually a survival-threshold event and a
  leading indicator of a regime break.

## Ledger reconciliation

Every round, after resolution:

```
for each resource R:
    Σ(inflows) − Σ(outflows) − destroyed(R) == 0   ± tolerance
```

`destroyed` must have a named mechanism: war damage, default write-off,
depreciation, consumption. Unexplained destruction means a transition function
is leaking, and a leaking ledger always flatters somebody.

**Do not patch imbalances.** Halt the run and fix the transition. A model that
silently creates resources will show everyone getting richer and will hide
exactly the distributional conflict you built it to study.

## The reachability test

Before believing any claimed capability, ask what flow would have to exist for
it to be true. A state claiming it can sustain a blockade must have the hulls,
the fuel, the munitions replacement rate and the fiscal space. A bank claiming
solvency must have the funding profile. A company claiming a technology lead
must have the headcount and the capex.

**No flow, no capability — regardless of the claim.** Cheapest and most
reliable correction available, and it is the core of what the Interest
Researcher does.

## Where this cashes out

Most of the exploitable edge in real systems comes from one of:

1. an actor's claims diverging from its flows before others notice
2. a constraint approaching its break condition before it is priced
3. a forced flow that is mechanically certain but not yet in the price (index
   rebalancing, maturity walls, regulatory deadlines, reserve rebuilds)
4. an actor spending its credibility, indicating it is near a threshold

All four are observable from public data by anyone who is actually looking.
That is the honest answer to "how does an unconstrained observer profit": not
secret knowledge, but reading the public flow data against the public claims,
without a mandate that stops you acting on what you find.
