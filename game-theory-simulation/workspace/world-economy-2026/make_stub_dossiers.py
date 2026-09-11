#!/usr/bin/env python3
"""
One-off bridge for this run only: turns the BOOTSTRAP actors.json into stub
dossiers so build_spec.py + engine.py can be exercised end to end.

These are NOT interest-researcher dossiers. No live sourcing was done. Every
value here is either (a) a direct, labelled transform of a field the
Cartographer already derived (time_horizon_years -> discount_rate), or (b) a
flat, uniform placeholder applied identically to all 36 actors. Flat and
uniform on purpose: inventing per-actor variation without evidence would be
worse than an honest placeholder, because it would look researched when it
isn't. confidence is "low" on every file for the same reason.

Actions: the generic_competition kernel only distinguishes settle (coop) and
escalate (aggr) — posture/align/hedge from the full Kautilyan shadgunya six
(see references/kautilya-mandala.md) fall into its neutral branch until a
researched per-theatre kernel is written, so for this bootstrap run every
actor gets only {hold, settle, escalate}: the three that actually produce
different behaviour. This also keeps the 5-member theatres computationally
tractable for a 300-run/20-round sweep (QRE cost is exponential in the action
count). Re-run with the full six once researched kernels exist.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
actors_doc = json.load(open(os.path.join(HERE, "actors.json")))

SHADGUNYA_ACTIONS = ["hold", "settle", "escalate"]

CANONICAL_WEIGHTS = {"survival": 0.30, "resources": 0.30, "autonomy": 0.20,
                     "legitimacy": 0.15, "relative_rank": 0.05}


def discount_from_horizon(years: float) -> float:
    # short horizon -> high discount rate (steep preference for the present)
    return round(min(0.5, max(0.03, 1.0 / max(years, 1))), 3)


os.makedirs(os.path.join(HERE, "dossiers"), exist_ok=True)
count = 0
for ac in actors_doc["actors"]:
    aid = ac["id"]
    horizon = ac.get("time_horizon_years", 5)
    dossier = {
        "id": aid,
        "as_of": "2026-09-12",
        "confidence": "low",
        "quality_note": "STUB — no interest-researcher pass. Uniform canonical "
                         "weights and flat placeholders throughout except "
                         "discount_rate, which is derived from the Cartographer's "
                         "time_horizon_years. Illustrative of the machinery only.",
        "utility_weights": CANONICAL_WEIGHTS,
        "discount_rate": discount_from_horizon(horizon),
        "survival_threshold": 0.25,
        "state": {k: 0.5 for k in
                  ["resources", "security", "legitimacy", "autonomy", "rank", "liquidity"]},
        "capabilities": [{"action": a, "cost": 0.1, "reversible": True}
                         for a in SHADGUNYA_ACTIONS],
        "constraints": [],
        "credibility": {"overall": 0.6},
        "deception_prior": 0.2,
        "monitoring": 0.5,
        "private_type": {},
        "stated_vs_revealed": [],
        "dependencies": [],
        "tripwires": [],
        "assumption_ids": [f"STUB-{aid}-bootstrap"],
        "what_would_change_my_mind": "a real interest-researcher pass with sourced flows",
    }
    with open(os.path.join(HERE, "dossiers", f"{aid}.json"), "w") as f:
        json.dump(dossier, f, indent=2)
    count += 1

print(f"wrote {count} stub dossiers -> {os.path.join(HERE, 'dossiers')}")
