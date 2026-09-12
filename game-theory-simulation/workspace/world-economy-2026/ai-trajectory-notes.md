# AI/tech trajectory — what's modeled and why

Asked directly: is there a consensus on how fast AI capability advances over
the next decade? **No.** This is a live, well-documented expert split, not
a settled input — so it's modeled as branching structural uncertainty
(three independent shocks), not a single assumed trajectory line. That
matches the skill's own rule: variance must come from structure, and picking
one number here would be exactly the "narrated equilibrium" failure mode the
whole design exists to prevent.

## What the evidence actually shows (2026, dated, sourced)

**Timeline disagreement is large and documented, not anecdotal.** The LEAP
(Longitudinal Expert AI Panel) Wave 8 survey, run April 20–May 11 2026 across
205 experts (economists, computer scientists, industry professionals, policy
researchers), 52 superforecasters, and 601 public respondents, found the
median expert gives 50% probability of an AI model hitting 80% success on
8-hour-expert-effort software tasks by 2030. Superforecasters were more
aggressive (median ~2028); the public was far more conservative (median
~2037) — a 9-year gap between groups looking at the same evidence.
[Longitudinal Expert AI Panel](https://leap.forecastingresearch.org/reports/wave8) ·
[Experts and Superforecasters Update Their AI Timelines](https://forecastingresearch.substack.com/p/leap-wave-8-ai-timelines)

Separately, broader AGI-timeline surveys have shown estimates swinging by
over a decade year-to-year, and a HackerNoon analysis of the compiled data
put it starkly: when experts publishing in the same journals disagree by
tens of years, the survey median is a statistical artifact of averaging
incompatible worldviews, not a forecast.
[AGI Timeline Collapsed by 27 Years in Six Years](https://hackernoon.com/the-agi-timeline-collapsed-by-27-years-in-six-years-nobody-agrees-on-why)

**The economics are real but unresolved.** AI-related capex is running above
$700B in 2026, with US hyperscaler capex intensity near 23% of revenue, and
is estimated to add roughly 140–150 basis points to US GDP growth in
2026–2027 — a genuinely large, currently-positive contribution.
[The Macro Implications of the AI Capex Boom (Bridgewater)](https://www.bridgewater.com/research-and-insights/the-macro-implications-of-the-ai-capex-boom) ·
[Why the AI Capex Cycle May Just Be Beginning (CoBank)](https://www.cobank.com/knowledge-exchange/why-the-ai-capex-cycle-may-just-be-beginning)

But the payoff side is thin: an NBER survey found 90% of firms report zero
measurable AI productivity impact despite the spend, even as executives keep
projecting a median future gain around 1.4%. That capex-vs-payoff gap is
exactly what's fueling live "AI bubble" commentary, including Fed-adjacent
warnings, while analysts also note today's buildout differs structurally
from the 2000 dot-com excess-capacity pattern.
[The AI Bubble and the US Economy (Forbes)](https://www.forbes.com/sites/paulocarvao/2026/08/19/the-ai-bubble-and-the-us-economy/) ·
[AI Bubble 2026: Capex, Fed Warnings & GPU Lifespans](https://medium.com/@svnkrmkr/ai-bubble-2026-is-it-real-capex-fed-warnings-gpu-lifespans-b5db2178d350)

**No major labor shakeup yet.** Computer and mathematical occupations grew
5.7% since 2023 — the disruption narrative around AI and jobs is not yet
showing up in the aggregate data, whatever it may do later.
[AI is driving economic growth and productivity gains without impacting jobs, yet (Deloitte)](https://www.deloitte.com/us/en/insights/topics/economy/spotlight/tech-investment-boom.html)

## What's actually wired into the engine

Three shocks in `shocks.json`, each representing one branch of the
disagreement above rather than a forecast:

- **`ai_progress_acceleration`** (annual_prob 0.15) — the superforecaster-fast
  branch: `CORP_TECH` gains resources and rank, `CORP_SEMI` gains from
  compute demand, `CORP_ENERGY` strains on power buildout, and both DM and EM
  urban labor take a legitimacy hit from automation anxiety (an expectation
  effect — note the current data shows no actual job-loss shakeup yet, so
  this is deliberately about *anticipation*, not measured displacement).
- **`ai_capex_correction`** (annual_prob 0.06, but ×3 once `CORP_TECH:rank >
  0.25` — a genuine correlated-shock link, not independent): the
  bubble-correction branch. Hits `CORP_TECH`, `AM_INDEX` (heavy tech-mega-cap
  weighting), gives `HF_MACRO` a volatility-driven gain, and strains `CB_US`
  liquidity via financial-stability response pressure. This needed a small
  engine change — `_system_metric` in `engine.py` only recognized one
  hardcoded metric (`conflict_index`); it now also accepts a generic
  `"<actor_id>:<dim><op><value>"` condition so a shock's odds can depend on
  a specific actor's state, not just system-wide instability.
- **`ai_productivity_plateau`** (annual_prob 0.20 — the highest of the three,
  because it's closest to what the NBER data currently shows) — the
  modal, low-drama branch: mild `CORP_TECH`/`AM_INDEX` disappointment, and a
  small legitimacy *relief* for `HH_DM_LABOR` since feared displacement
  hasn't materialized as fast as some expected.

## What's still not modeled, honestly

- No dedicated researched payoff kernel for the `compute_and_capex` theatre
  — it still runs on `generic_competition`, so `CORP_TECH`'s own strategic
  choices (`hold`/`settle`/`escalate`) don't yet encode anything
  AI-specific; only the exogenous shocks above do.
- `Actor.private_type` / `type_draw` is drawn per run in `engine.py` but is
  **not read anywhere** in the current kernel or utility function — so even
  if a dossier sets a `private_type` range for, say, CORP_TECH's capability
  growth rate, it currently has zero effect on outcomes. Wiring that in
  would let capability trajectory vary continuously per run instead of only
  through discrete shocks. Flagging this as a known gap rather than a hidden
  one.
- These probabilities and magnitudes are my own translation of the sourced
  facts above into engine parameters — reasonable, not researched-and-cited
  the way a real `interest-researcher` dossier entry would be. Treat them as
  a structured first pass, not a calibrated estimate.
