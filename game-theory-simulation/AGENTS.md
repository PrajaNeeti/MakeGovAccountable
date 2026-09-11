# AGENTS.md — Strategic Outcome Simulation System

A four-agent pipeline that maps who holds power in a system, what they actually
want, how they would play against each other, and which positions an
unconstrained participant could take to gain capital or leverage.

Default domain: the world economy, 2026–2046, yearly rounds, war included as a
live strategy branch.

## Prime directive

**Model the world as it is, not as it should be.** Actors are modeled with their
real constraints — including moral, ideological, electoral, religious and
institutional ones. Those constraints are *modeled as facts about them*, not
endorsed. The analytical payload of this system is the gap between what a
constrained actor can do and what an unconstrained actor can do. That gap is
where returns and leverage live.

**Scope limit.** This system reasons at the level of strategy, capital flows,
policy and force posture — the level a fund manager, diplomat or economic
historian works at. It does not produce operational plans for violence, weapons
engineering, targeting, or anything a person could execute to hurt someone.
"War" here is a resource-transfer and risk-repricing event, not a manual. If a
run starts drifting toward operational harm, stop and re-scope to the strategic
level.

## The four agents

| Agent | File | Job |
|---|---|---|
| Cartographer | `.claude/agents/stakeholder-cartographer.md` | Derive who matters, from first principles. No canned lists. |
| Researcher | `.claude/agents/interest-researcher.md` | Live-source each actor: revealed preference, constraints, resource flows, credibility. |
| Orchestrator | `.claude/agents/simulation-orchestrator.md` | Run N Monte Carlo histories over 20 yearly rounds. Report the outcome distribution. |
| Auditor | `.claude/agents/adversarial-auditor.md` | Red-team the whole thing. Kill narrative-driven results. |

The game theory itself is a **skill**, not an agent:
`.claude/skills/strategic-game-engine/SKILL.md`. Any agent may invoke it. It is
the shared rulebook so the Cartographer, Researcher and Orchestrator all speak
one payoff language.

## Pipeline

```
  QUESTION
     │
     ▼
  [1] Cartographer ──▶ actors.json         (who, which tier, what they control)
     │
     ▼
  [2] Researcher   ──▶ dossiers/*.json     (utility weights, constraints, flows)
     │                  live web sources, cited
     ▼
  [3] Orchestrator ──▶ runs/*.jsonl        (N simulated 20-year histories)
     │                  uses strategic-game-engine skill
     ▼
  [4] Auditor      ──▶ audit.md            (what would falsify this?)
     │
     ▼
  POSITIONING REPORT
```

Steps 1→2 can loop: the Researcher often discovers an actor the Cartographer
missed (a clearing house, a sovereign fund, a single family office, a diaspora
remittance corridor). Re-run [1] when that happens.

## Hierarchy (tiers)

Games are nested. A tier's equilibrium becomes the next tier down's constraint
set — it does **not** become that tier's objective.

```
T0  SYSTEM      reserve-currency order, trade/energy routes, war & peace
T1  STATE       governments, militaries, treasuries, blocs
T2  MONETARY    central banks, sovereign funds, IMF/BIS-type institutions
T3  CAPITAL     banks, asset managers, exchanges, large corporates, cartels
T4  HOUSEHOLD   labour, savings, consumption, migration, political consent
```

Feedback runs upward too, but slowly and in a lagged, lumpy way: T4 consent
withdrawal constrains T1 two to four rounds later, not instantly. Encode that
lag explicitly; it is the most commonly fudged part of this kind of model.

## The unconstrained-observer seat

Every run carries one extra actor: `OBS`. It is the seat the user is asking
about. It has:

- no electoral cycle, no mandate, no constituency
- full mobility of capital and residence
- no ideological or moral penalty terms
- small size — its moves do not move the board (price-taker, not price-maker)

`OBS` never gets a vote in the equilibrium. It only observes the equilibrium and
positions against it. Its payoff is measured in two currencies, reported
separately and never summed:

- **capital** — real (inflation-adjusted, in a stated numeraire) return
- **leverage** — optionality and control: who must ask `OBS` for something

Report `OBS` outcomes conditional on **where it sits** — jurisdiction, passport
class, asset base — because the same strategy has wildly different payoffs in
Ahmedabad, Singapore, Dubai and Zurich. That conditioning is the actual product.

## Hard rules for every agent

1. **Resource flow is the lie detector.** Every actor emits `declared_intent`
   and takes `true_action`. Statements are cheap; flows are not. Reconcile
   stated policy against observable flows (reserves, energy imports, shipping,
   budget lines, procurement, capital account). Where they diverge, the flow
   wins and the actor's credibility score drops.
2. **No unsourced present-tense claims.** Anything about the current state of
   the world gets a live source. Priors are for structure, not for facts.
3. **Distributions, not stories.** "War in the Taiwan Strait by 2031" is
   worthless. "Strait interdiction ≥30 days occurs in 18% of runs, clustered in
   runs where Chinese CA deficit persists ≥3y" is the output format.
4. **Separate the model from the map.** Every number the engine produces is a
   consequence of assumptions the Researcher wrote down. Keep the assumption ID
   attached to the result so the Auditor can pull the thread.
5. **State uncertainty as structure.** Say which variable, if it moved, would
   flip the conclusion — not a generic hedge.

## Invocation

```
/simulate <question>            # full pipeline
/simulate --from=3 <scenario>   # reuse dossiers, re-run sim
/actors <system>                # cartographer only
/dossier <actor>                # researcher only
/audit runs/<id>                # auditor only
```

Artifacts live in `workspace/<run-id>/`. Never overwrite a prior run — the
value compounds only if old runs stay comparable.
