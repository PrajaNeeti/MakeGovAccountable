# Game forms

## Why theatres

A 40-actor game with 6 actions each has 6^40 profiles. Unsolvable, and also
wrong — most actors' choices are independent of most others'. Decompose into
overlapping 2–5 actor theatres where interaction is dense, solve each, then
propagate spillovers and re-solve anything that moved.

**Forming theatres:** two actors belong in one if either can change the other's
payoff by more than the noise floor in a single round. Build the interaction
graph, then cut it at its weakest edges. Cut edges become spillovers with
strength equal to the edge weight.

**Convergence:** iterate solve → spillover → re-solve until no theatre's payoffs
move more than tolerance, cap 8 iterations. Non-convergence is informative — it
usually means two theatres are actually one, or the system is genuinely
unstable in that round. Log it rather than forcing a result.

## Repeated play

Twenty rounds with observable history means the folk theorem applies: much more
cooperation is sustainable than one-shot analysis suggests, sustained by the
threat of future punishment. Implement:

- **Grim-ish triggers** with forgiveness. Pure grim is unrealistic; actors
  forgive when re-cooperating is cheaper than continued punishment.
- **Discount rates decide everything.** An actor with a 6-month horizon defects
  almost always. This is why electoral cycles and bond maturity walls are the
  most load-bearing parameters in the whole model — get those dates right and a
  lot of behaviour falls out for free.
- **End-game effects.** Rounds 18–20 should show defection creeping in. Don't
  suppress it, but don't over-read it either; real systems rarely have a
  visible terminal round, so treat late-run results as lower-confidence and say
  so in the report.

## Coalitions

Model coalitions as **endogenous, not fixed**. Each round an actor may:

- join (pay coordination cost, gain shared capability, lose some autonomy)
- defect (gain short-term, lose credibility and future access)
- free-ride (the default, and the reason most alliances underperform)

Check the **core**: is the proposed coalition stable against any subgroup doing
better by leaving? Empty cores are common and important — they mean no stable
arrangement exists and the system will keep churning. An empty core is a real
finding, not a solver failure.

Coalitions need a side-payment mechanism. Security guarantees, market access,
technology transfer, currency swaps and debt forgiveness are the usual
currencies. Without side payments, most useful coalitions never form.

## Commitment

Commitment is power. An actor who can credibly bind itself gets better outcomes
than one who cannot — this is Schelling's core insight and it is the least
intuitive part of strategic behaviour. Model commitment devices:

- constitutional / treaty lock-in (slow to make, slow to break)
- irreversible investment (a built pipeline is an argument)
- public position-taking (creates audience costs)
- delegation to an actor with different preferences (an "independent" central
  bank *is* a commitment device)
- burning bridges (removing your own option)

Each has a cost and a break condition. The break condition is what makes a
commitment tradeable: a commitment everyone believes will hold has no
information value, while one that is about to break is the most valuable thing
on the board.

## Signalling

- **Cheap talk** — free, only credible where interests align. Most official
  statements. Moves beliefs in proportion to credibility only.
- **Costly signals** — expensive and therefore informative. Mobilisation,
  capital commitment, accepting real economic pain. The cost must be *higher
  for a liar* than for a truth-teller or it separates nothing.
- **Screening** — offering a menu so the other actor's choice reveals its type.
  Deeply underused in analysis of real negotiations; look for it in tiered
  sanctions, graduated tariffs, and conditional aid packages.

## Conflict as a game form

Model war as a bargaining failure, which is what it is. Rational actors should
prefer the negotiated settlement to the lottery, since fighting burns
resources. So war requires one of three failures, and you should always be able
to name which one a simulated conflict came from:

1. **Private information + incentive to misrepresent** — both sides think they
   will win, and neither can credibly prove strength without fighting.
2. **Commitment problem** — a settlement today cannot bind tomorrow, especially
   where power is shifting. The declining side fights now rather than
   negotiating later from weakness.
3. **Indivisibility** — the thing at stake genuinely cannot be split, or a
   selectorate treats splitting it as disqualifying.

If a simulated war doesn't trace to one of these, the model is producing
conflict for the wrong reason — probably a payoff sign error. Check before
reporting it.

Keep all of this at the level of posture, cost and settlement terms. The model
answers *whether, when and at what price*, never *how*.
