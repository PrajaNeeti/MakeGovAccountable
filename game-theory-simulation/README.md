# Game Theory Simulation

Strategic outcome simulation system: a four-agent Claude Code pipeline
(Cartographer → Researcher → Orchestrator → Auditor) backed by a Python
game-theoretic engine (logit QRE, hierarchical tiers, deception/flow ledger,
Monte Carlo). Full design in [`AGENTS.md`](./AGENTS.md).

This folder is standalone — it has its own `.claude/` (agents + skill) and can
be copied into or pointed at any repo/question.

## Layout

```
AGENTS.md                                   pipeline design & invocation
.claude/agents/
  stakeholder-cartographer.md               who matters (actors.json)
  interest-researcher.md                    dossiers/*.json (utility, constraints, flows)
  simulation-orchestrator.md                runs/*.jsonl (Monte Carlo sweep + report)
  adversarial-auditor.md                    audit.md (red-team the run)
.claude/skills/strategic-game-engine/
  SKILL.md                                  shared rulebook, engine usage
  references/
    payoff-spec.md                          spec.json schema
    game-forms.md                           theatres, coalitions, commitment, conflict
    deception-and-resource-flow.md          belief update, ledger, credibility
  scripts/
    engine.py                               QRE solver, Monte Carlo, transitions
    build_spec.py                           merges actors.json + dossiers -> spec.json
workspace/                                  run artifacts land in workspace/<run-id>/
requirements.txt
```

## Setup

```bash
cd game-theory-simulation
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running

1. Use the agents (Cartographer → Researcher) to produce `actors.json` and
   `dossiers/*.json` for your question.
2. Build the spec:
   ```bash
   python .claude/skills/strategic-game-engine/scripts/build_spec.py \
     --actors workspace/<run>/actors.json \
     --dossiers workspace/<run>/dossiers/ \
     --theatres workspace/<run>/theatres.json \
     --shocks workspace/<run>/shocks.json \
     --out workspace/<run>/spec.json
   ```
3. Run the sweep:
   ```bash
   python .claude/skills/strategic-game-engine/scripts/engine.py \
     --spec workspace/<run>/spec.json \
     --runs 300 --rounds 20 --seed 42 \
     --out workspace/<run>/runs.jsonl
   ```
4. Analyse into regime clusters:
   ```bash
   python .claude/skills/strategic-game-engine/scripts/engine.py \
     --analyse workspace/<run>/runs.jsonl --clusters 7
   ```
5. Hand the result to the Orchestrator for the positioning report, then to the
   Auditor before treating anything as a conclusion.

`build_spec.py` refuses to write a spec with missing dossier data unless you
pass `--allow-defaults` — that's intentional; a silently-defaulted parameter
is how a sourced model quietly becomes a guessed one.
