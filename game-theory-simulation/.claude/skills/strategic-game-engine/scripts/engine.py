#!/usr/bin/env python3
"""
Strategic game engine: hierarchical, multi-round, Monte Carlo.

Solves each theatre by logit quantal response equilibrium, applies a transition
model with a conserved resource ledger, and sweeps many histories.

Usage
  engine.py --spec spec.json --runs 300 --rounds 20 --seed 42 --out runs.jsonl
  engine.py --analyse runs.jsonl --clusters 7
"""

from __future__ import annotations
import argparse, itertools, json, math, sys
from dataclasses import dataclass, field
import numpy as np

DIMS = ["resources", "security", "legitimacy", "autonomy", "rank", "liquidity"]
TIERS = ["T0", "T1", "T2", "T3", "T4"]
BOUNDED = {"security", "legitimacy", "autonomy", "liquidity"}


# ---------------------------------------------------------------- actors

@dataclass
class Actor:
    id: str
    tier: str
    state: dict
    weights: dict
    lam: float = 6.0
    discount: float = 0.10
    survival_threshold: float = 0.25
    credibility: float = 0.7
    deception_prior: float = 0.2
    monitoring: float = 0.5
    actions: list = field(default_factory=lambda: ["hold"])
    constraints: list = field(default_factory=list)
    private_type: dict = field(default_factory=dict)
    type_draw: dict = field(default_factory=dict)
    declared: str = "hold"
    last_action: str = "hold"
    security_baseline: float = 0.5

    @classmethod
    def from_spec(cls, d):
        return cls(
            id=d["id"], tier=d.get("tier", "T1"),
            state={k: float(d.get("state", {}).get(k, 0.5)) for k in DIMS},
            security_baseline=float(d.get("state", {}).get("security", 0.5)),
            weights=d.get("weights", {"survival": .3, "resources": .3,
                                      "autonomy": .2, "legitimacy": .15,
                                      "relative_rank": .05}),
            lam=float(d.get("lambda", 6.0)),
            discount=float(d.get("discount", 0.10)),
            survival_threshold=float(d.get("survival_threshold", 0.25)),
            credibility=float(d.get("credibility", 0.7)),
            deception_prior=float(d.get("deception_prior", 0.2)),
            monitoring=float(d.get("monitoring", 0.5)),
            actions=d.get("actions", ["hold"]),
            constraints=d.get("constraints", []),
            private_type=d.get("private_type", {}),
        )

    def draw_type(self, rng):
        self.type_draw = {
            k: float(rng.uniform(v[0], v[1])) if isinstance(v, (list, tuple)) else float(v)
            for k, v in self.private_type.items()
        }

    def under_stress(self):
        return (self.state["security"] < self.survival_threshold
                or self.state["liquidity"] < self.survival_threshold)


# ---------------------------------------------------------- payoff layer

def utility(actor: Actor, delta: dict, constraint_cost: float) -> float:
    """Weighted utility of a state delta, with a lexicographic survival term.

    Below the survival threshold, survival-relevant dimensions dominate
    everything else. This discontinuity is deliberate: it is what produces
    capitulations, lunges and wars. Do not smooth it.
    """
    w = actor.weights
    u = (w.get("resources", 0) * delta.get("resources", 0)
         + w.get("autonomy", 0) * delta.get("autonomy", 0)
         + w.get("legitimacy", 0) * delta.get("legitimacy", 0)
         + w.get("relative_rank", 0) * delta.get("rank", 0)
         + w.get("survival", 0) * 0.5 * (delta.get("security", 0)
                                         + delta.get("liquidity", 0)))
    if actor.under_stress():
        surv = delta.get("security", 0) + delta.get("liquidity", 0)
        u = 10.0 * surv + 0.1 * u
    return u - constraint_cost


def constraint_cost(actor: Actor, action: str) -> float:
    total = 0.0
    for c in actor.constraints:
        if c.get("action") != action:
            continue
        cond = c.get("breaks_if")
        if cond and _eval_cond(cond, actor):
            continue          # constraint has broken; action is now free
        total += float(c.get("cost", 0.3))
    return total


def _eval_cond(cond: str, actor: Actor) -> bool:
    """Evaluate a tiny condition language: '<dim><op><number>'."""
    for op in ("<=", ">=", "<", ">"):
        if op in cond:
            lhs, rhs = cond.split(op)
            v = actor.state.get(lhs.strip())
            if v is None:
                return False
            r = float(rhs)
            return {"<": v < r, ">": v > r, "<=": v <= r, ">=": v >= r}[op]
    return False


# Payoff-function registry. Theatres name one of these in the spec.
PAYOFFS = {}


def payoff_fn(name):
    def deco(f):
        PAYOFFS[name] = f
        return f
    return deco


@payoff_fn("generic_competition")
def _generic(actor, own, others, states, params, rng):
    """Default kernel: cooperation is jointly good, defection is privately good
    and imposes an externality. Replace per theatre with a researched kernel."""
    coop = {"hold", "cooperate", "ease", "open", "settle"}
    aggr = {"defect", "tariff", "devalue", "rearm", "sanction", "escalate",
            "capital_controls", "interdict"}
    n_ag = sum(1 for a in others.values() if a in aggr)
    d = {k: 0.0 for k in DIMS}
    if own in aggr:
        d["resources"] += 0.05 - 0.02 * n_ag
        d["rank"] += 0.04
        d["autonomy"] += 0.03
        d["legitimacy"] -= 0.02
        d["liquidity"] -= 0.03
    elif own in coop:
        d["resources"] += 0.03 - 0.05 * n_ag
        d["legitimacy"] += 0.02
        d["liquidity"] += 0.01
        d["rank"] -= 0.01 * n_ag
    else:
        d["resources"] += 0.01
    d["security"] -= 0.03 * n_ag
    return d


@payoff_fn("reserve_currency_order")
def _reserve_currency_order(actor, own, others, states, params, rng):
    """ST_US, ST_CN, CB_US, CB_CN, SWF. Grounded in sourced dossier facts:
    ST_US's dollar-clearing leverage degrades with use (each application
    accelerates counterparty exit); ST_CN's de-dollarization is real via a
    22-month gold-accumulation streak but its capital account is still only
    ~16% as open as the OECD average despite liberalization rhetoric --
    the impossible trinity binds; CB_US's independence was tested directly
    (2025 Cook removal attempt, blocked 5-4 on narrow due-process grounds
    only) and its swap-line discretion is a real crisis-survival lever;
    SWF's "longest horizon" framing broke for PIF specifically (2026-2030
    strategy cuts international allocation 30%->20%) while NBIM/Temasek/GIC
    are converging on a correlated AI mega-cap bet."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "ST_US":
        if own == "escalate":       # dollar-weaponization / unilateral tariff path
            d["autonomy"] += 0.04; d["rank"] += 0.03
            d["legitimacy"] -= 0.03
            d["liquidity"] -= 0.02 * n_esc   # counterparty exit accelerates with use
        elif own == "settle":
            d["legitimacy"] += 0.02; d["liquidity"] += 0.01
    elif actor.id == "ST_CN":
        if own == "escalate":       # accelerate gold/CIPS de-dollarization push
            d["autonomy"] += 0.05; d["rank"] += 0.03
            d["liquidity"] -= 0.03           # impossible-trinity capital-account tension
            d["security"] -= 0.01
        elif own == "settle":
            d["legitimacy"] += 0.01
    elif actor.id == "CB_US":
        if own == "escalate":       # defends independence, holds against political pressure
            d["legitimacy"] += 0.03; d["autonomy"] += 0.02
            d["liquidity"] -= 0.02           # tight policy strains funding conditions
        elif own == "settle":       # accommodates pressure to ease
            d["autonomy"] -= 0.03; d["liquidity"] += 0.02
    elif actor.id == "CB_CN":
        if own == "escalate":
            d["autonomy"] += 0.03; d["liquidity"] -= 0.02
        elif own == "settle":
            d["liquidity"] += 0.01
    elif actor.id == "SWF":
        if own == "escalate":       # concentrate domestic/strategic (PIF pattern)
            d["autonomy"] += 0.02
            d["resources"] -= 0.02 * n_esc   # correlated mega-cap bet risk when peers pile in too
        elif own == "settle":
            d["resources"] += 0.01

    d["security"] -= 0.01 * n_esc
    d["resources"] += 0.01
    return d


@payoff_fn("taiwan_semiconductor")
def _taiwan_semiconductor(actor, own, others, states, params, rng):
    """ST_US, ST_CN, ST_TW, ST_JP_KR, CORP_SEMI. Grounded in: Taiwan actively
    resists dilution (flat 2025 rejection of a 50-50 chip-split proposal) --
    a materially different object from a passive hostage, though its exit
    cost stays near 1.0; the US moved from hard bans toward negotiated
    revenue-share licensing (Nvidia H20/H200 at 15% then 25% to Treasury)
    after direct lobbying; Korea's chip exports to China surged 243% YoY
    even under nominal containment, a real, quiet divergence from Japan."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "ST_CN":
        if own == "escalate":       # military posturing / timeline pressure on Taiwan
            d["rank"] += 0.05; d["security"] -= 0.03
            d["legitimacy"] -= 0.02
        elif own == "settle":
            d["legitimacy"] += 0.01
    elif actor.id == "ST_TW":
        if own == "escalate":       # resist dilution (real 2025 chip-split rejection)
            d["autonomy"] += 0.04
            d["security"] -= 0.05 * n_esc    # exposure rises with regional tension
            d["liquidity"] -= 0.02
        elif own == "settle":       # accept a production-split-style arrangement
            d["autonomy"] -= 0.05; d["resources"] += 0.02
    elif actor.id == "ST_US":
        if own == "escalate":       # tighten export controls / demand more onshoring
            d["autonomy"] += 0.03; d["rank"] += 0.02
            d["legitimacy"] -= 0.02          # allied/industry friction (ASML-lobbying pattern)
        elif own == "settle":       # negotiate revenue-share licensing instead of hard bans
            d["resources"] += 0.03; d["legitimacy"] += 0.01
    elif actor.id == "ST_JP_KR":
        if own == "escalate":       # comply fully with the containment ask
            d["legitimacy"] += 0.01; d["resources"] -= 0.03
        elif own == "settle":       # keep exploiting license exemptions (243% YoY pattern)
            d["resources"] += 0.04; d["autonomy"] -= 0.01
    elif actor.id == "CORP_SEMI":
        if own == "escalate":       # comply/restrict fully
            d["legitimacy"] += 0.01; d["resources"] -= 0.02
        elif own == "settle":       # lobby to narrow scope, keep selling (H20/H200 pattern)
            d["resources"] += 0.05 - 0.02 * n_esc

    d["security"] -= 0.02 * n_esc
    return d


@payoff_fn("energy_routes")
def _energy_routes(actor, own, others, states, params, rng):
    """ST_GULF, ST_RU, ST_CN, INS_RE, CORP_COMMOD. Grounded in: 2026 war-risk
    insurance is priced asymmetrically -- insurers price real risk at
    Hormuz/Red Sea (premia to 3% of hull value, Black Sea +250%) but show
    almost no repricing for comparable Taiwan Strait tension ("pricing war
    at Hormuz and peace at Taiwan"); Gulf fiscal breakeven pressure is
    already binding (NEOM scope cuts, ~$44bn 2026 deficit) regardless of
    posture; Russia's shadow fleet carries ~70% of exports but revenue is
    falling under interception pressure; commodity traders are confirmed
    variance-preferring (Vitol profit ~$15bn in the 2022 crisis vs $4.5bn
    in calm 2025)."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "ST_GULF":
        if own == "escalate":       # supply discipline / price defense
            d["resources"] += 0.03; d["liquidity"] -= 0.02   # fiscal strain persists regardless
        elif own == "settle":       # maintain spare capacity as stabilizer
            d["legitimacy"] += 0.01; d["resources"] += 0.01
    elif actor.id == "ST_RU":
        if own == "escalate":       # push exports further via shadow fleet
            d["resources"] += 0.04 - 0.02 * n_esc
            d["security"] -= 0.03; d["liquidity"] -= 0.02    # revenue already falling under interception
        elif own == "settle":
            d["liquidity"] += 0.01
    elif actor.id == "ST_CN":
        if own == "escalate":       # aggressive discounted-crude buying / route pressure
            d["resources"] += 0.03; d["autonomy"] += 0.01
        elif own == "settle":
            d["legitimacy"] += 0.01
    elif actor.id == "INS_RE":
        # variance-preferring: profits from repricing risk, not from stability
        if n_esc >= 2:               # real tension triggers repricing (Hormuz/Red Sea pattern)
            d["resources"] += 0.05
        else:                        # underpriced when tension is low ("peace at Taiwan" pattern)
            d["resources"] += 0.01
        d["security"] -= 0.01 * n_esc
    elif actor.id == "CORP_COMMOD":
        d["resources"] += 0.02 + 0.03 * n_esc      # variance-preferring regardless of side
        d["legitimacy"] -= 0.01 * n_esc            # sanctions-arbitrage reputational cost

    d["security"] -= 0.02 * n_esc
    return d


@payoff_fn("global_dollar_funding")
def _global_dollar_funding(actor, own, others, states, params, rng):
    """CB_US, CB_EM, BANK_GSIB, ST_FRAGILE. Grounded in: CB_US swap-line
    allocation is a discretionary, near-instant survival lever; BANK_GSIB's
    merged treatment is CONFIRMED wrong under stress (2023: US ring-fenced
    its deposit guarantee, Switzerland unilaterally inverted the AT1/equity
    waterfall, EU/BoE repudiated the Swiss approach within days, still
    litigated in 2026) -- modeled here as a self-protective ring-fencing
    bias, not solidarity; CB_EM's "de-dollarization" is mostly overstated
    (COFER dollar share barely moved, ~92% of a comparable prior decline
    was FX valuation not reallocation) except real outliers like Turkey;
    ST_FRAGILE's tax-to-GDP has stayed flat at 8-10% through 20+ IMF
    programs (structural commitments reliably unmet) while quantitative
    program targets are reliably met once a program is actually in force."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "CB_US":
        if own == "escalate":       # discretionary swap-line tightening
            d["autonomy"] += 0.03; d["rank"] += 0.02
            d["legitimacy"] -= 0.02          # allied/EM resentment at gatekeeping
        elif own == "settle":       # extend swap lines generously
            d["legitimacy"] += 0.02; d["liquidity"] -= 0.01
    elif actor.id == "BANK_GSIB":
        if own == "escalate":       # national ring-fencing under stress (2023-confirmed pattern)
            d["security"] += 0.03; d["legitimacy"] -= 0.02
        elif own == "settle":       # maintain cross-border support (rare, costly, litigated when it fails)
            d["liquidity"] -= 0.03; d["legitimacy"] += 0.02
    elif actor.id == "CB_EM":
        if own == "escalate":       # real diversification (Turkey-style gold accumulation)
            d["autonomy"] += 0.02; d["liquidity"] -= 0.01
        elif own == "settle":       # stay conservative (Brazil/Indonesia pattern)
            d["liquidity"] += 0.01
    elif actor.id == "ST_FRAGILE":
        if own == "escalate":       # resist structural reform (40-year unmet tax-base pattern)
            d["autonomy"] += 0.01
            d["liquidity"] -= 0.03 * n_esc   # funding access tightens if reformers defect together
            d["legitimacy"] -= 0.01
        elif own == "settle":       # meet IMF numeric criteria (reliably kept once in-program)
            d["liquidity"] += 0.03; d["legitimacy"] -= 0.01   # domestic austerity cost

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("trade_bloc_alignment")
def _trade_bloc_alignment(actor, own, others, states, params, rng):
    """ST_US, ST_CN, ST_IN, ST_SWING, ST_EU. Grounded in: India's Russian
    crude imports tracked US tariff pressure almost exactly (1.71->1.16mbd
    after the Aug 2025 tariff, partial recovery after a Feb 2026 rollback)
    -- hedging (settle) is revealed-preference, not rhetoric; Mexico's
    imports from Vietnam doubled (+103% YoY) immediately after Mexico's own
    China tariffs, a transshipment signal, not pure nearshoring; Italy's
    spread converged toward Germany in 2026, inverting the expected north-
    south EU split -- France alone, not a bloc division, is the real 2026
    fault line."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id in ("ST_US", "ST_CN"):
        if own == "escalate":       # push allies/partners to pick a side
            d["rank"] += 0.03; d["autonomy"] += 0.02
            d["legitimacy"] -= 0.02
        elif own == "settle":       # tolerate hedging behavior from swing/madhyama actors
            d["legitimacy"] += 0.01
    elif actor.id in ("ST_IN", "ST_SWING"):
        if own == "escalate":       # forced to pick a side (costly, against revealed preference)
            d["autonomy"] -= 0.04; d["resources"] -= 0.02 * n_esc
        elif own == "settle":       # hedge / dvaidhibhava (the revealed, low-cost default)
            d["resources"] += 0.03; d["autonomy"] += 0.02
    elif actor.id == "ST_EU":
        if own == "escalate":       # push bloc discipline over a France-type fiscal outlier
            d["legitimacy"] -= 0.02; d["autonomy"] += 0.01
        elif own == "settle":       # tolerate internal divergence (the actually-observed pattern)
            d["legitimacy"] += 0.02

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("entrepot_and_frontier")
def _entrepot_and_frontier(actor, own, others, states, params, rng):
    """ST_ENTREPOT_ATLANTIC, ST_ENTREPOT_NEUTRAL, ST_FRAGILE. Grounded in:
    the UK committed GBP2.26bn to the G7 reparations-loan structure fastest
    and most eagerly of any entrepot; Switzerland's 2026 parliamentary
    endorsement of confiscation measures shows the neutrality franchise
    eroding, not holding; ST_FRAGILE's tax-to-GDP has stayed flat at 8-10%
    through 20+ IMF programs -- the most reliably unmet structural
    commitment in the whole system."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "ST_ENTREPOT_ATLANTIC":
        if own == "escalate":       # commit further to the weaponization/reparations track
            d["legitimacy"] += 0.02; d["autonomy"] -= 0.01   # alliance-aligned but less neutral optionality
        elif own == "settle":
            d["resources"] += 0.02
    elif actor.id == "ST_ENTREPOT_NEUTRAL":
        if own == "escalate":       # erode further toward confiscation (2026 Swiss pattern)
            d["autonomy"] -= 0.02; d["resources"] -= 0.02    # custody clients start hedging away
        elif own == "settle":       # defend neutral-custody franchise
            d["resources"] += 0.03; d["legitimacy"] += 0.01
    elif actor.id == "ST_FRAGILE":
        if own == "escalate":       # resist reform / drift toward default timing pressure
            d["liquidity"] -= 0.03 * n_esc
        elif own == "settle":       # engage entrepot/offshore channels for remittance and transit rents
            d["resources"] += 0.02; d["liquidity"] += 0.01

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("sovereign_debt_workout")
def _sovereign_debt_workout(actor, own, others, states, params, rng):
    """IFI, ST_CN, ST_FRAGILE, AM_ACTIVE. Grounded in: Argentina's IMF
    program kept disbursing in 2026 even as the Fund's own inflation
    forecast for the program nearly doubled (16.4%->30.4%), consistent with
    a geopolitically-proxied conditionality rather than evenhanded
    technocracy; China as a non-Paris-Club bilateral creditor structurally
    strains comparable-treatment guarantees; AM_ACTIVE's 2026 funding
    surplus (112.1%) means duration demand is no longer the mechanically
    forced flow it once was -- funds are chasing private credit instead."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "IFI":
        if own == "escalate":       # enforce strict conditionality
            d["legitimacy"] += 0.01; d["resources"] -= 0.01
        elif own == "settle":       # keep disbursing despite missed targets (revealed pattern)
            d["autonomy"] -= 0.02; d["legitimacy"] -= 0.01
    elif actor.id == "ST_CN":
        if own == "escalate":       # withhold comparable-treatment cooperation as bilateral leverage
            d["autonomy"] += 0.02; d["rank"] += 0.01
        elif own == "settle":
            d["legitimacy"] += 0.01
    elif actor.id == "ST_FRAGILE":
        if own == "escalate":       # miss structural targets (40-year pattern)
            d["liquidity"] -= 0.02 * n_esc; d["legitimacy"] -= 0.01
        elif own == "settle":       # meet quantitative program targets (reliably kept once in-program)
            d["liquidity"] += 0.02
    elif actor.id == "AM_ACTIVE":
        if own == "escalate":       # chase private-credit yield instead of traditional duration
            d["resources"] += 0.03 - 0.02 * n_esc
        elif own == "settle":       # maintain conservative duration/liability-matching posture
            d["liquidity"] += 0.01

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("monetary_policy_core")
def _monetary_policy_core(actor, own, others, states, params, rng):
    """CB_US, CB_EU, CB_JP, CB_IN. Grounded in: CB_JP ran the fastest
    normalization cycle since the 1990s (0.5%->1% in 18 months) driven by
    imported/FX inflation, not its stated wage-led domestic story; CB_EU's
    fragmentation backstop (TPI) has never actually been activated despite
    real stress episodes -- its credibility rests on presumption, not a
    tested record; CB_IN shows classic 'fear of floating' (large reserve
    buffer, new capital-inflow tools) despite an explicit no-target claim."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "CB_US":
        if own == "escalate":       # hold tight against inflation
            d["legitimacy"] += 0.02; d["liquidity"] -= 0.02
        elif own == "settle":
            d["liquidity"] += 0.01
    elif actor.id == "CB_EU":
        if own == "escalate":       # actually activate the fragmentation backstop
            d["legitimacy"] += 0.02; d["autonomy"] -= 0.02   # untested tool, real credibility risk if it disappoints
        elif own == "settle":       # rely on ordinary channels instead (the actually-observed pattern)
            d["liquidity"] += 0.01
    elif actor.id == "CB_JP":
        if own == "escalate":       # continue fast normalization
            d["autonomy"] += 0.02; d["liquidity"] -= 0.03    # carry-trade unwind stress
        elif own == "settle":
            d["legitimacy"] += 0.01
    elif actor.id == "CB_IN":
        if own == "escalate":       # defend the currency actively (fear-of-floating, despite the no-target claim)
            d["autonomy"] += 0.01; d["liquidity"] -= 0.02
        elif own == "settle":
            d["liquidity"] += 0.02

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("capital_allocation")
def _capital_allocation(actor, own, others, states, params, rng):
    """AM_INDEX, AM_ACTIVE, HF_MACRO, SWF. Grounded in: AM_INDEX's E&S
    proxy-proposal support collapsed from >40% (2021) to under 2% (2025),
    tracking political mood mechanically, not analysis; SWF's PIF reversed
    to an 80%-domestic target (was ~30% international), directly
    contradicting the 'longest-horizon global investor' framing, while
    NBIM/Temasek/GIC converge on a correlated AI mega-cap bet (NBIM's own
    stress test shows a hypothetical 35% fund-value hit); HF_MACRO
    genuinely withdrew liquidity in the April-May 2025 tariff shock ($60bn
    then $40bn of swap-spread unwinds)."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "AM_INDEX":
        if own == "escalate":       # deviate from mandate/benchmark (rare, high cost -- see constraints)
            d["autonomy"] += 0.02; d["resources"] -= 0.02
        elif own == "settle":       # mechanical rule-following (the actual, revealed behavior)
            d["resources"] += 0.02
    elif actor.id == "AM_ACTIVE":
        if own == "escalate":       # chase private-credit/illiquid yield beyond stated policy
            d["resources"] += 0.03 - 0.02 * n_esc
        elif own == "settle":
            d["liquidity"] += 0.01
    elif actor.id == "HF_MACRO":
        # variance-preferring: withdraws liquidity precisely when it's needed most
        if n_esc >= 2:
            d["resources"] += 0.05; d["liquidity"] -= 0.02
        else:
            d["resources"] += 0.01
    elif actor.id == "SWF":
        if own == "escalate":       # concentrate domestically / chase the correlated AI mega-cap bet
            d["autonomy"] += 0.02
            d["resources"] -= 0.03 * n_esc   # correlated-bet risk realizes when peers pile in together
        elif own == "settle":
            d["resources"] += 0.01

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("credit_and_plumbing")
def _credit_and_plumbing(actor, own, others, states, params, rng):
    """BANK_GSIB_US, BANK_GSIB_INTL, NBFI_CREDIT, EXCH_CLEAR, HF_MACRO.
    Grounded in: US private credit hit a record 6.0% default rate (Fitch,
    Apr 2026) amid a ~$265bn 2026 stress episode, with mark-discretion
    flagged by the IMF as an incentive to delay loss recognition; Euroclear
    remains an active party to the Russian-reserve dispute (Russia's
    central bank won a ~$250bn Moscow-court judgment against it, May 2026);
    CME hiked precious-metals margins repeatedly amid a 2025-26 silver run,
    echoing the 2022 LME nickel episode."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id in ("BANK_GSIB_US", "BANK_GSIB_INTL"):
        if own == "escalate":       # ring-fence / self-protect
            d["security"] += 0.02; d["legitimacy"] -= 0.01
        elif own == "settle":       # extend credit lines despite stress
            d["liquidity"] -= 0.02
    elif actor.id == "NBFI_CREDIT":
        if own == "escalate":       # extend further into stressed credit (chase yield)
            d["resources"] += 0.03 - 0.03 * n_esc   # default risk rises with system-wide escalation
        elif own == "settle":       # mark conservatively, delay recognition (the actual revealed pattern)
            d["resources"] += 0.01; d["legitimacy"] -= 0.01
    elif actor.id == "EXCH_CLEAR":
        if own == "escalate":       # discretionary margin hikes / custody actions
            d["security"] += 0.02; d["legitimacy"] -= 0.02
        elif own == "settle":
            d["liquidity"] -= 0.01
    elif actor.id == "HF_MACRO":
        if n_esc >= 2:               # variance-preferring: profits from the dislocation
            d["resources"] += 0.04
        else:
            d["resources"] += 0.01

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("compute_and_capex")
def _compute_and_capex(actor, own, others, states, params, rng):
    """CORP_TECH, CORP_SEMI, AM_INDEX, CB_US. Grounded in: 2026 hyperscaler
    capex is ~$725bn (up 77% YoY, ~1.8-5% of US GDP), partly sustained by
    circular Nvidia-OpenAI-Oracle financing; CORP_SEMI's revenue-share
    licensing model (15% then 25% to US Treasury on H20/H200 sales) makes
    compliance profitable, not just costly; AM_INDEX's passive mandate
    forces it to buy the mega-caps mechanically regardless of price -- a
    forced flow, not a judgment."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "CORP_TECH":
        if own == "escalate":       # push capex further, lean on circular financing
            d["resources"] += 0.06 - 0.02 * n_esc; d["rank"] += 0.03
            d["liquidity"] -= 0.03
        elif own == "settle":       # moderate capex pace
            d["liquidity"] += 0.01
    elif actor.id == "CORP_SEMI":
        if own == "escalate":       # restrict/comply fully with export controls
            d["legitimacy"] += 0.01; d["resources"] -= 0.02
        elif own == "settle":       # revenue-share licensing model (profitable compliance)
            d["resources"] += 0.04
    elif actor.id == "AM_INDEX":
        # mandate-bound: buys the mega-caps regardless of price, a forced flow
        d["resources"] += 0.02
    elif actor.id == "CB_US":
        if own == "escalate":       # treat AI capex boom as inflationary, tighten
            d["legitimacy"] += 0.01; d["liquidity"] -= 0.01
        elif own == "settle":       # accommodate the capex-driven growth boost
            d["resources"] += 0.01

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("physical_flows")
def _physical_flows(actor, own, others, states, params, rng):
    """CORP_COMMOD, CORP_ENERGY, INS_RE, CORP_DEFENSE. Grounded in: energy
    majors scrapped 2030/2035 emissions pledges in 2025-26, reallocating
    capex back to oil & gas ("too far, too fast"); Aramco cut its variable
    dividend 98% ($43bn->$880m) while holding upstream capex -- a state
    fiscal instrument first, shareholder vehicle second; commodity traders
    are confirmed variance-preferring (Vitol profit ~$15bn in the 2022
    crisis vs $4.5bn in calm 2025); defense backlogs (Lockheed 3.2:1
    book-to-bill) show production capacity, not orders, is now the binding
    constraint."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "CORP_ENERGY":
        if own == "escalate":       # reallocate capex back to oil & gas, away from transition pledges
            d["resources"] += 0.03; d["legitimacy"] -= 0.02
        elif own == "settle":
            d["legitimacy"] += 0.01
    elif actor.id == "CORP_COMMOD":
        d["resources"] += 0.02 + 0.03 * n_esc      # variance-preferring regardless of side
        d["legitimacy"] -= 0.01 * n_esc
    elif actor.id == "INS_RE":
        if n_esc >= 2:
            d["resources"] += 0.04
        else:
            d["resources"] += 0.01
    elif actor.id == "CORP_DEFENSE":
        if own == "escalate":       # expand production capacity (the real binding constraint)
            d["resources"] += 0.02; d["liquidity"] -= 0.02
        elif own == "settle":       # work through existing backlog
            d["resources"] += 0.03

    d["security"] -= 0.02 * n_esc
    return d


@payoff_fn("consent_dm")
def _consent_dm(actor, own, others, states, params, rng):
    """HH_DM_LABOR, HH_DM_ASSET, LABOR_ORG. Grounded in: a documented ~15pt
    swing toward Trump among sub-$50k earners (2024), the first GOP
    majority in that bracket since the 1960s, tracking negative real wages
    against high asset prices; $3bn from 300 billionaire families in 2024
    skewed ~5:1 toward one party; the ILA's 2024 strike settled wages in 3
    days but pushed ratification to January 2025 over the real sticking
    point -- an automation ban -- confirming a few thousand port workers
    can move more trade (~$5bn/day) than most sanctions regimes."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "HH_DM_LABOR":
        # audit finding M3: this branch previously had no positive resources
        # lever under either action, so external shocks debiting it
        # (ai_progress_acceleration, manufacturing_automation_wave) floored
        # it for most of a run with no way to recover -- a real transfer
        # can't keep being paid by an actor with nothing left to give.
        # Real lever: populist pressure extracts wage/policy concessions
        # (the dossier's own sourced 15pt swing toward redistribution-
        # adjacent politics among sub-$50k earners is exactly this).
        if own == "escalate":       # populist political realignment / withdraw consent
            d["resources"] += 0.03; d["legitimacy"] -= 0.02; d["autonomy"] += 0.01
        elif own == "settle":       # ordinary wage bargaining, smaller and steadier
            d["resources"] += 0.01; d["legitimacy"] += 0.01
    elif actor.id == "HH_DM_ASSET":
        if own == "escalate":       # push for a policy 'put' defending asset prices
            d["resources"] += 0.02; d["legitimacy"] -= 0.01
        elif own == "settle":
            d["resources"] += 0.01
    elif actor.id == "LABOR_ORG":
        if own == "escalate":       # strike over automation protection (real 2024 pattern)
            d["autonomy"] += 0.03; d["resources"] -= 0.02
        elif own == "settle":       # accept wage gains, defer the automation fight
            d["resources"] += 0.02

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("consent_em")
def _consent_em(actor, own, others, states, params, rng):
    """HH_EM_SUBSIST, HH_EM_URBAN. Grounded in: fuel-subsidy removals
    (Nigeria 2023, Angola 2025, Ecuador 2025, Kenya 2024) consistently
    outrun any compensating transfer -- Kenya's Finance Bill was withdrawn
    within ~10 days of peak protest; Argentina's 2025 tax amnesty pulled
    ~$20bn of household 'mattress dollars' back into the system, proving
    the underlying dollarization was real and large despite the abandoned
    formal-dollarization plan."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "HH_EM_SUBSIST":
        if own == "escalate":       # riot / organized unrest over subsidy or price shocks
            d["security"] -= 0.03; d["autonomy"] += 0.02
        elif own == "settle":
            d["security"] += 0.01
    elif actor.id == "HH_EM_URBAN":
        if own == "escalate":       # dollarize / exit local currency (fast, reliable early-warning behavior)
            d["autonomy"] += 0.02; d["legitimacy"] -= 0.01
        elif own == "settle":       # hold local currency
            d["legitimacy"] += 0.01

    d["security"] -= 0.01 * n_esc
    return d


@payoff_fn("household_savings")
def _household_savings(actor, own, others, states, params, rng):
    """HH_CN, HH_IN. Grounded in: Chinese household deposits nearly doubled
    in 5 years while consumption stayed under 40% of GDP despite a ~1.6%-
    of-GDP 2025 stimulus push; Indian household investment-grade gold
    demand (bars/coins) rose 54% YoY in Q1 2026 while jewellery volume fell
    19% -- gold behaving as a private, decentralised FX reserve, not a
    cultural purchase."""
    d = {k: 0.0 for k in DIMS}
    n_esc = sum(1 for a in others.values() if a == "escalate") + (1 if own == "escalate" else 0)

    if actor.id == "HH_CN":
        if own == "escalate":       # keep savings rate structurally elevated (property-downturn caution)
            d["autonomy"] += 0.01; d["resources"] -= 0.01
        elif own == "settle":       # respond to stimulus, spend more
            d["resources"] += 0.02
    elif actor.id == "HH_IN":
        if own == "escalate":       # shift further into investment gold (private FX reserve behavior)
            d["autonomy"] += 0.02
        elif own == "settle":       # stay in formal financial assets (SIP flows)
            d["resources"] += 0.02

    d["security"] -= 0.01 * n_esc
    return d


# ------------------------------------------------------------ QRE solver

def solve_theatre(members, states, kernel, params, rng,
                  tol=1e-6, max_iter=500):
    """Logit quantal response equilibrium by damped fixed-point iteration.

    Returns {actor_id: probability vector over that actor's actions}.
    QRE rather than Nash: it always exists, is well-behaved under noisy
    payoff estimates, and models bounded rationality through lambda.
    """
    ids = [a.id for a in members]
    acts = {a.id: a.actions for a in members}
    probs = {i: np.ones(len(acts[i])) / len(acts[i]) for i in ids}

    for _ in range(max_iter):
        new = {}
        for a in members:
            eu = np.zeros(len(acts[a.id]))
            other_ids = [i for i in ids if i != a.id]
            # expected utility by enumerating opponents' joint profiles
            for profile in itertools.product(*[acts[i] for i in other_ids]):
                w = 1.0
                for i, act in zip(other_ids, profile):
                    w *= probs[i][acts[i].index(act)]
                if w < 1e-9:
                    continue
                others = dict(zip(other_ids, profile))
                for k, own in enumerate(acts[a.id]):
                    d = kernel(a, own, others, states, params, rng)
                    eu[k] += w * utility(a, d, constraint_cost(a, own))
            z = a.lam * eu
            z -= z.max()
            e = np.exp(z)
            new[a.id] = e / e.sum()
        shift = max(np.abs(new[i] - probs[i]).max() for i in ids)
        for i in ids:                       # damping aids convergence
            probs[i] = 0.5 * probs[i] + 0.5 * new[i]
        if shift < tol:
            break
    return probs


# ------------------------------------------------------------- mechanics

def apply_shocks(spec, actors, state_idx, rng, round_i, active):
    """Returns (fired_shock_ids, net_resources_effect).

    net_resources_effect is the signed sum of every 'resources' delta this
    round's shocks applied, whether newly fired or an ongoing multi-round
    carryover. It is a *known, named* change to the system total: some
    shocks are zero-sum transfers (e.g. energy_supply_disruption moves value
    from consumers to producers), others are net destruction (e.g. a chip
    supply-chain disruption or a bubble correction actually destroys value).
    Either way it is accounted for explicitly, which is what lets the ledger
    check validate real conservation instead of just a loose tolerance.
    """
    fired = []
    net_resources = 0.0
    for s in spec.get("shocks", []):
        p = s.get("annual_prob", 0.05)
        mod = s.get("prob_modifier")
        if mod:
            if _system_metric(actors, mod.get("if", "")) :
                p *= mod.get("multiply", 1.0)
        if rng.random() < p:
            fired.append(s["id"])
            for aid, eff in s.get("effects", {}).items():
                if aid in state_idx:
                    for k, v in eff.items():
                        state_idx[aid].state[k] += v
                        if k == "resources":
                            net_resources += v
            dur = s.get("duration_rounds", 1)
            if dur > 1:
                active.append({"shock": s, "left": dur - 1})
    for a in list(active):
        for aid, eff in a["shock"].get("effects", {}).items():
            if aid in state_idx:
                for k, v in eff.items():
                    state_idx[aid].state[k] += v * 0.5
                    if k == "resources":
                        net_resources += v * 0.5
        a["left"] -= 1
        if a["left"] <= 0:
            active.remove(a)
    return fired, net_resources


def _system_metric(actors, cond):
    if "conflict_index" in cond:
        ci = 1.0 - np.mean([a.state["security"] for a in actors])
        return _cmp(cond, ci)
    if ":" in cond:
        # generic per-actor gate: "<actor_id>:<dim><op><value>", e.g.
        # "CORP_TECH:rank>0.25" — lets a shock's probability correlate with
        # a specific actor's state instead of only the system-wide conflict
        # index. Needed for shocks like a capex correction whose odds should
        # rise once the thing it's correcting (sustained AI-driven gains)
        # has actually happened.
        aid, rest = cond.split(":", 1)
        idx = {a.id: a for a in actors}
        target = idx.get(aid)
        if target is None:
            return False
        for dim in DIMS:
            if rest.startswith(dim):
                return _cmp(rest[len(dim):], target.state[dim])
    return False


def _cmp(cond, val):
    for op in (">=", "<=", ">", "<"):
        if op in cond:
            r = float(cond.split(op)[1])
            return {">": val > r, "<": val < r,
                    ">=": val >= r, "<=": val <= r}[op]
    return False


def ledger_check(before, after, expected_delta=0.0, tol=1e-6):
    """Resources are conserved except for expected_delta, the sum of every
    *named, accounted* change this round: shock transfers/destruction plus
    clamp-floor destruction. Kernel-driven theatre deltas are zero-summed at
    the point of application (see simulate()), so they contribute nothing
    here by construction. Any residual beyond expected_delta is a real,
    unaccounted leak -- with the fixes in place this should be at floating-
    point precision, not masked by a loose tolerance."""
    b = sum(s["resources"] for s in before.values())
    a = sum(s["resources"] for s in after.values())
    drift = abs((a - b) - expected_delta)
    return drift, drift <= tol


def clamp(actors):
    """Returns the total 'resources' floor-protected this round: when an
    actor's raw (unclamped) resources would go negative, clamping it to 0
    means the system total ends up HIGHER than the raw arithmetic gives --
    the actor couldn't fully deliver a loss it didn't have the resources to
    absorb (a real-world default/counterparty-shortfall pattern), so the
    matching gain booked elsewhere by a zero-sum kernel transfer isn't fully
    backed. This is tracked explicitly (added back into expected_delta) so
    the ledger check validates the actual arithmetic instead of reporting a
    false leak."""
    floor_protected = 0.0
    for a in actors:
        for k in DIMS:
            v = a.state[k]
            if k in BOUNDED:
                a.state[k] = min(1.0, max(0.0, v))
            elif k == "rank":
                a.state[k] = min(1.0, max(-1.0, v))
            else:
                if k == "resources" and v < 0:
                    floor_protected += -v
                a.state[k] = max(0.0, v)
    return floor_protected


def update_credibility(a: Actor, detected: bool, decay=0.25, recovery=0.05):
    if detected:
        a.credibility *= (1 - decay)
    else:
        a.credibility = min(1.0, a.credibility + recovery)


# ------------------------------------------------------------------ run

def simulate(spec, rounds, rng):
    actors = [Actor.from_spec(d) for d in spec["actors"]]
    idx = {a.id: a for a in actors}
    for a in actors:
        a.draw_type(rng)
    theatres = spec.get("theatres", [])
    params = spec.get("transition", {})
    coupling = params.get("lambda_stress_coupling", 0.5)
    history, active, pending = [], [], []

    for r in range(rounds):
        before = {a.id: dict(a.state) for a in actors}
        fired, shock_resources_net = apply_shocks(spec, actors, idx, rng, r, active)

        # stressed actors play worse
        for a in actors:
            if a.under_stress():
                a.lam = max(1.0, a.lam * (1 - coupling))

        # signalling: lie when stressed, weighted by deception prior
        for a in actors:
            lie = rng.random() < a.deception_prior * (1.5 if a.under_stress() else 1.0)
            a.declared = rng.choice(a.actions) if lie else "hold"

        chosen = {}
        for tier in TIERS:                              # hierarchy: top down
            for th in [t for t in theatres if t.get("tier") == tier]:
                members = [idx[m] for m in th["members"] if m in idx]
                if len(members) < 2:
                    continue
                kernel = PAYOFFS.get(
                    th.get("interaction_matrix", "").replace("payoff_fn:", ""),
                    PAYOFFS["generic_competition"])
                probs = solve_theatre(members, before, kernel, params, rng)
                # draw every member's realized action first, so each actor's
                # delta is computed against the true realized profile (not a
                # partially-filled one that defaults absent members to "hold")
                picks = {}
                for a in members:
                    pick = rng.choice(len(a.actions), p=probs[a.id])
                    picks[a.id] = a.actions[pick]
                chosen.update(picks)
                deltas = {}
                for a in members:
                    others = {m.id: picks[m.id] for m in members if m.id != a.id}
                    deltas[a.id] = kernel(a, picks[a.id], others, before, params, rng)
                # Zero-sum the 'resources' component across this theatre's
                # members: a payoff kernel reallocates value among the
                # participants, it is never a source of new value. Shocks are
                # the only sanctioned source of net resource change, and they
                # are tracked explicitly (apply_shocks / clamp destruction).
                res_mean = (sum(d.get("resources", 0.0) for d in deltas.values())
                            / len(deltas))
                for a in members:
                    d = dict(deltas[a.id])
                    d["resources"] = d.get("resources", 0.0) - res_mean
                    for k, v in d.items():
                        a.state[k] += v
                    a.last_action = picks[a.id]

        # security mean-reverts toward each actor's own structural baseline
        # absent continued escalation -- without this, kernels debiting
        # security on every escalation with no offsetting term produce a
        # near-universal, un-mean-reverting decay (audit finding M2: mean
        # security fell 0.50->0.30 over 10 rounds in effectively every run,
        # mechanically inflating every conflict-linked shock's fire rate as
        # a run progresses regardless of what actually happened in it).
        recovery_rate = params.get("security_recovery_rate", 0.12)
        for a in actors:
            a.state["security"] += recovery_rate * (a.security_baseline - a.state["security"])

        # deception detection via the flow channel
        for a in actors:
            if a.declared != "hold" and a.declared != a.last_action:
                seen = rng.random() < np.mean([o.monitoring for o in actors
                                               if o.id != a.id])
                update_credibility(a, detected=seen)

        # lagged upward feedback
        for p in list(pending):
            p["left"] -= 1
            if p["left"] <= 0:
                tgt = idx.get(p["target"])
                if tgt:
                    tgt.state["legitimacy"] += p["mag"]
                pending.remove(p)
        for a in actors:
            if a.tier == "T4" and a.state["legitimacy"] < 0.3:
                for t in actors:
                    if t.tier == "T1":
                        pending.append({"target": t.id, "mag": -0.05,
                                        "left": params.get("feedback_lags", {})
                                        .get("T4_to_T1", 3)})

        floor_protected = clamp(actors)
        expected_delta = shock_resources_net + floor_protected
        drift, ok = ledger_check(before, {a.id: a.state for a in actors},
                                 expected_delta=expected_delta,
                                 tol=params.get("ledger_tolerance", 1e-6))
        history.append({
            "round": r, "year": spec["meta"]["t0"] + r,
            "shocks": fired,
            "actions": dict(chosen),
            "ledger_drift": round(drift, 6), "ledger_ok": ok,
            "shock_resources_net": round(shock_resources_net, 6),
            "floor_protected": round(floor_protected, 6),
            "state": {a.id: {k: round(v, 4) for k, v in a.state.items()}
                      for a in actors},
            "credibility": {a.id: round(a.credibility, 3) for a in actors},
        })
    return history


def sweep(spec, runs, rounds, seed, out):
    with open(out, "w") as f:
        for i in range(runs):
            rng = np.random.default_rng(seed + i)
            h = simulate(spec, rounds, rng)
            f.write(json.dumps({"run": i, "seed": seed + i, "history": h}) + "\n")
            if (i + 1) % 25 == 0:
                print(f"  {i+1}/{runs}", file=sys.stderr)
    print(f"wrote {runs} runs -> {out}", file=sys.stderr)


# -------------------------------------------------------------- analysis

def analyse(path, k):
    runs = [json.loads(l) for l in open(path)]
    ids = sorted(runs[0]["history"][-1]["state"].keys())
    X = np.array([[runs[i]["history"][-1]["state"][a][d]
                   for a in ids for d in DIMS] for i in range(len(runs))])
    Xn = (X - X.mean(0)) / (X.std(0) + 1e-9)
    lab = _kmeans(Xn, k, seed=0)

    print(f"\n{len(runs)} runs, {len(ids)} actors, {k} regime clusters\n")
    for c in range(k):
        m = lab == c
        if m.sum() == 0:
            continue
        print(f"--- cluster {c}: {m.sum()} runs ({100*m.sum()/len(runs):.1f}%)")
        cen = X[m].mean(0).reshape(len(ids), len(DIMS))
        glob = X.mean(0).reshape(len(ids), len(DIMS))
        dev = (cen - glob)[:, 0]
        order = np.argsort(dev)
        print("    winners: " + ", ".join(
            f"{ids[i]} {dev[i]:+.2f}" for i in order[::-1][:3]))
        print("    losers:  " + ", ".join(
            f"{ids[i]} {dev[i]:+.2f}" for i in order[:3]))
        br = _branch_round(runs, m, ids)
        print(f"    branch point: round {br}\n")


def _branch_round(runs, mask, ids):
    """Earliest round where this cluster's mean path separates from the rest."""
    R = len(runs[0]["history"])
    for r in range(R):
        a = np.array([[runs[i]["history"][r]["state"][x]["resources"]
                       for x in ids] for i in np.where(mask)[0]])
        b = np.array([[runs[i]["history"][r]["state"][x]["resources"]
                       for x in ids] for i in np.where(~mask)[0]])
        if len(b) == 0:
            return r
        sd = np.sqrt(a.var(0) + b.var(0)) + 1e-9
        if np.max(np.abs(a.mean(0) - b.mean(0)) / sd) > 1.0:
            return r
    return R - 1


def _kmeans(X, k, seed=0, iters=100):
    rng = np.random.default_rng(seed)
    C = X[rng.choice(len(X), k, replace=False)]
    lab = np.zeros(len(X), dtype=int)
    for _ in range(iters):
        d = ((X[:, None, :] - C[None]) ** 2).sum(-1)
        new = d.argmin(1)
        if (new == lab).all():
            break
        lab = new
        for c in range(k):
            if (lab == c).sum():
                C[c] = X[lab == c].mean(0)
    return lab


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--spec")
    p.add_argument("--runs", type=int, default=300)
    p.add_argument("--rounds", type=int, default=20)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--out", default="runs.jsonl")
    p.add_argument("--analyse")
    p.add_argument("--clusters", type=int, default=7)
    a = p.parse_args()
    if a.analyse:
        analyse(a.analyse, a.clusters)
    else:
        sweep(json.load(open(a.spec)), a.runs, a.rounds, a.seed, a.out)


if __name__ == "__main__":
    main()
