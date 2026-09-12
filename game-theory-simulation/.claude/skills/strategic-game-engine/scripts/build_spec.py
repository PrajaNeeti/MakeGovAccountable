#!/usr/bin/env python3
"""
Merge actors.json + dossiers/*.json into a spec.json the engine can run.

  build_spec.py --actors actors.json --dossiers dossiers/ \
                --theatres theatres.json --shocks shocks.json --out spec.json

Refuses to emit a spec with unresolved gaps unless --allow-defaults is set.
Silent defaults are how a sourced model quietly becomes a guessed one, so the
validator is loud on purpose.
"""
import argparse, glob, json, os, sys

DIMS = ["resources", "security", "legitimacy", "autonomy", "rank", "liquidity"]
REQUIRED = ["utility_weights", "discount_rate", "credibility"]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--actors", required=True)
    p.add_argument("--dossiers", required=True)
    p.add_argument("--theatres")
    p.add_argument("--shocks")
    p.add_argument("--observer")
    p.add_argument("--t0", type=int, default=2026)
    p.add_argument("--rounds", type=int, default=20)
    p.add_argument("--out", default="spec.json")
    p.add_argument("--allow-defaults", action="store_true")
    p.add_argument("--extra-constraints",
                    help="JSON file: {actor_id: [constraint, ...]} in dossier "
                         "format (action/cost/breaks_under), appended to that "
                         "actor's dossier constraints before building. Use this "
                         "to operationalize a specific sourced constraint onto "
                         "one of the engine's actual action ids (hold/settle/"
                         "escalate) when a theatre has a researched kernel that "
                         "gives that action a real, distinct payoff to weigh "
                         "the cost against — a constraint whose action string "
                         "never matches an actual action id is pure decoration.")
    a = p.parse_args()

    actors_doc = json.load(open(a.actors))
    dossiers = {}
    for f in glob.glob(os.path.join(a.dossiers, "*.json")):
        d = json.load(open(f))
        dossiers[d["id"]] = d

    if a.extra_constraints:
        extra = json.load(open(a.extra_constraints))
        for aid, cons in extra.items():
            if aid in dossiers:
                dossiers[aid] = dict(dossiers[aid])
                dossiers[aid]["constraints"] = list(
                    dossiers[aid].get("constraints", [])) + cons

    out, warn = [], []
    for ac in actors_doc["actors"]:
        aid = ac["id"]
        d = dossiers.get(aid)
        if d is None:
            warn.append(f"{aid}: NO DOSSIER — every parameter would be invented")
            if not a.allow_defaults:
                continue
            d = {}
        for r in REQUIRED:
            if r not in d:
                warn.append(f"{aid}: missing {r}")

        lam = d.get("lambda")
        if lam is None:
            # crude prior: shorter horizon and lower credibility -> worse play
            lam = 4.0 + 4.0 * d.get("credibility", {}).get("overall", 0.6)

        out.append({
            "id": aid,
            "tier": ac.get("tier", "T1"),
            "lambda": round(float(lam), 2),
            "state": {k: float(d.get("state", {}).get(k, 0.5)) for k in DIMS},
            "weights": d.get("utility_weights", {
                "survival": .3, "resources": .3, "autonomy": .2,
                "legitimacy": .15, "relative_rank": .05}),
            "discount": d.get("discount_rate", 0.10),
            "survival_threshold": d.get("survival_threshold", 0.25),
            "credibility": d.get("credibility", {}).get("overall", 0.7)
                           if isinstance(d.get("credibility"), dict)
                           else d.get("credibility", 0.7),
            "deception_prior": d.get("deception_prior", 0.2),
            "monitoring": d.get("monitoring", 0.5),
            "actions": [c["action"] for c in d.get("capabilities", [])] or ["hold"],
            "constraints": [
                {"action": c["action"], "cost": c.get("cost", 0.3),
                 "breaks_if": c.get("breaks_under", "")}
                for c in d.get("constraints", [])],
            "private_type": d.get("private_type", {}),
            "assumption_ids": d.get("assumption_ids", []),
        })
        if "hold" not in out[-1]["actions"]:
            out[-1]["actions"].insert(0, "hold")

    spec = {
        "meta": {"system": actors_doc.get("system", "unnamed"),
                 "t0": a.t0, "rounds": a.rounds, "numeraire": f"{a.t0}_USD"},
        "actors": out,
        "theatres": json.load(open(a.theatres)) if a.theatres else [],
        "shocks": json.load(open(a.shocks)) if a.shocks else [],
        "observer": json.load(open(a.observer)) if a.observer else {},
        "transition": {"feedback_lags": {"T4_to_T1": 3, "T3_to_T2": 1,
                                         "T1_to_T0": 2},
                       "lambda_stress_coupling": 0.5,
                       "ledger_tolerance": 0.02,
                       "conflict_model": "costly_lottery_v2"},
    }

    for w in warn:
        print("WARN " + w, file=sys.stderr)
    if warn and not a.allow_defaults:
        print("\nRefusing to write. Fix the dossiers, or pass --allow-defaults "
              "and treat every result as illustrative only.", file=sys.stderr)
        sys.exit(1)

    json.dump(spec, open(a.out, "w"), indent=2)
    print(f"wrote {a.out}: {len(out)} actors, "
          f"{len(spec['theatres'])} theatres", file=sys.stderr)


if __name__ == "__main__":
    main()
