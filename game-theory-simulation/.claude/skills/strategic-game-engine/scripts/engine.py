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

    @classmethod
    def from_spec(cls, d):
        return cls(
            id=d["id"], tier=d.get("tier", "T1"),
            state={k: float(d.get("state", {}).get(k, 0.5)) for k in DIMS},
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
    fired = []
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
            dur = s.get("duration_rounds", 1)
            if dur > 1:
                active.append({"shock": s, "left": dur - 1})
    for a in list(active):
        for aid, eff in a["shock"].get("effects", {}).items():
            if aid in state_idx:
                for k, v in eff.items():
                    state_idx[aid].state[k] += v * 0.5
        a["left"] -= 1
        if a["left"] <= 0:
            active.remove(a)
    return fired


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


def ledger_check(before, after, tol=1e-6):
    """Resources are conserved except for explicitly destroyed amounts."""
    b = sum(s["resources"] for s in before.values())
    a = sum(s["resources"] for s in after.values())
    return abs(a - b), abs(a - b) <= tol


def clamp(actors):
    for a in actors:
        for k in DIMS:
            v = a.state[k]
            if k in BOUNDED:
                a.state[k] = min(1.0, max(0.0, v))
            elif k == "rank":
                a.state[k] = min(1.0, max(-1.0, v))
            else:
                a.state[k] = max(0.0, v)


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
        fired = apply_shocks(spec, actors, idx, rng, r, active)

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
                for a in members:
                    pick = rng.choice(len(a.actions), p=probs[a.id])
                    act = a.actions[pick]
                    chosen[a.id] = act
                    d = kernel(a, act,
                               {m.id: chosen.get(m.id, "hold")
                                for m in members if m.id != a.id},
                               before, params, rng)
                    for k, v in d.items():
                        a.state[k] += v
                    a.last_action = act

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

        clamp(actors)
        drift, ok = ledger_check(before, {a.id: a.state for a in actors},
                                 tol=params.get("ledger_tolerance", 1e9))
        history.append({
            "round": r, "year": spec["meta"]["t0"] + r,
            "shocks": fired,
            "actions": dict(chosen),
            "ledger_drift": round(drift, 6), "ledger_ok": ok,
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
