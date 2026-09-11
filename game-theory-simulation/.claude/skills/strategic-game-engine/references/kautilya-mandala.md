# Kautilyan structure in the engine

The *Arthashastra* is the oldest surviving systematic treatment of exactly this
problem: how a self-interested actor with no moral obligation to rivals should
behave among other self-interested actors. Kautilya wrote a positive theory, not
a normative one — he describes what works, and says so plainly. That makes it
directly usable as engine structure rather than as decoration.

Use this file when specifying action sets, forming theatres, or setting the
observer's strategy space.

## Saptanga → the state vector

Kautilya's seven limbs of the state map almost one-to-one onto our six
dimensions, which is a decent sign the basis is not arbitrary.

| Anga | Engine dimension |
|---|---|
| *kosha* (treasury) | `resources` + `liquidity` |
| *danda* (coercive force) | `security` |
| *janapada* (populace, territory) | `legitimacy` (T4 consent) |
| *durga* (fortification) | `security`, defensive component |
| *mitra* (ally) | coalition edges |
| *swamin* / *amatya* (ruler, ministers) | the actor's selectorate and λ |

Kautilya ranks **kosha as foundational** — all other limbs are sustained from
the treasury, and a ruler who lets it drain loses the rest in sequence. Our
model agrees: `liquidity` collapse cascades into `security` and `legitimacy`,
never the reverse. That ordering is a Kautilyan inheritance and it is the right
one.

*Yogakshema* — the ruler's welfare lies in the subjects' welfare — is the
sharpest part of the text for our purposes, because it treats legitimacy as
**instrumental, not moral**. A ruler maintains prosperity because a ruined
populace cannot be taxed or conscripted. That is precisely how the T4 consent
constraint works here: a hard budget constraint on the upper tiers, not a value.

## Shadgunya → the canonical action basis

Replace vague action lists with Kautilya's six-fold policy. It is the
best-tested strategic basis available and it covers the space cleanly:

| Policy | Engine action | When chosen |
|---|---|---|
| *sandhi* (treaty, peace) | `settle` | weaker, or gains from trade exceed gains from conflict |
| *vigraha* (hostility) | `escalate` | stronger, or declining and facing a commitment problem |
| *asana* (staying quiet) | `hold` | equal strength, waiting for the distribution to move |
| *yana* (marching, posture) | `posture` | preparing; a costly signal, reversible at a price |
| *samshraya* (seeking shelter) | `align` | far weaker; trade autonomy for security |
| *dvaidhibhava* (dual policy) | `hedge` | peace with one, hostility with another, simultaneously |

`hedge` is the one modern analysis routinely omits and Kautilya treats as
standard. Most middle powers today are running *dvaidhibhava* explicitly —
security alignment with one bloc, commercial alignment with the other. Any
model without it will mis-score every swing state on the board.

Kautilya's selection rule is comparative power plus trajectory, not absolute
power. Encode it that way: `rank` is positional, and its *derivative* matters
more than its level.

## Chaturupaya → the escalation ladder

*Sama* (conciliation) → *dana* (gifts, payment) → *bheda* (dissension) →
*danda* (force). Ascending cost, and the ordering is the lesson.

**Bheda comes before danda.** Split your opponent's coalition before fighting
it — it is cheaper, more reversible, and often sufficient. This is the single
most underweighted move in contemporary strategic modelling and it is
everywhere in practice: financing an opposition faction, offering a separate
deal to one coalition member, sanctions carve-outs that peel off a partner,
courting one wing of a ruling party.

Implement `bheda` as a first-class action against **coalitions**, not actors:
it raises the coordination cost of a target alliance and can empty its core.
An actor good at *bheda* rarely needs *danda*, which is exactly why the states
that look least aggressive are often the most effective.

## Rajamandala → theatre formation

The mandala gives a principled rule for what our engine calls theatres. Kautilya
builds concentric circles around the *vijigishu*: the immediate neighbour is
*ari* (adversary), the neighbour beyond is *mitra* (natural ally), alternating
outward. The logic is not cultural, it is structural — adjacency creates
friction, and your adversary's adversary shares your interest.

**This is where the theory breaks against a modern economy, and it matters.**

Mandala adjacency is territorial. Modern adjacency is not. Financial, energy and
supply-chain adjacency cut across geography: a state's largest trade partner is
often its principal strategic rival, and two states with no border can be more
tightly coupled than neighbours. Deep interdependence also creates something
Kautilya had no reason to model — mutual hostage-taking, where the adversary's
collapse damages you directly.

So build the mandala on **exposure, not borders**:

```
adjacency(i,j) = w1·trade_share + w2·funding_dependence
               + w3·shared_chokepoint + w4·territorial_contiguity
```

with `w4` the smallest term. Then Kautilya's alternation still holds and still
predicts well — the enemy-of-my-enemy logic is about structural position, not
about maps, and it survives the translation intact.

Two further limits worth stating: the text assumes a single *vijigishu* seeking
paramountcy, while the current system has several simultaneously, so run the
mandala from each major actor's seat and look at where the circles conflict. And
Kautilya has no credit creation, no central banks and no capital markets — our
whole T2 and T3 tiers are outside his frame. *Kosha* is a stock of treasure; a
modern treasury is a flow of borrowing capacity that can be conjured and
destroyed by belief. That difference is genuinely new, not a translation issue.

## Gudhapurusha → the monitoring parameter

The *Arthashastra* devotes extraordinary attention to *gudhapurusha* — agents,
informants, and the systematic collection of intelligence on both rivals and
one's own officials. Kautilya treats information asymmetry as a primary
strategic asset, on par with the treasury.

This is our `monitoring` parameter, and Kautilya's emphasis is a good argument
for weighting it higher than most models do. He also insists on **verification
through independent channels** — cross-check each agent against another. That
is exactly our flow-ledger discipline: never trust a single reported channel;
reconcile claims against physically observable movement.

*Kutayuddha* (concealed war) maps to our `covert` and `deniable` visibility
classes.

## The vijigishu → the OBS seat

The text is written from the standpoint of an actor seeking advantage, unbound
by obligation to rivals, in a world of *matsya nyaya* — the law of the fishes,
where in the absence of ordering power the big consume the small. That is our
unconstrained observer, and the correspondence is close enough that Kautilya's
prescriptions are usable as a checklist for OBS strategy:

- act on comparative trajectory, not on absolute position
- prefer *bheda* and *dana* to *danda* — cheaper, reversible, less legible
- treat the treasury as the master constraint; never let liquidity go
- buy information before you buy anything else
- *dvaidhibhava* is the default posture for a small actor between large ones
- never take a position you cannot exit

One important divergence: Kautilya's *vijigishu* is a **price-maker** who
reshapes the mandala. Our OBS is a **price-taker** who reads it. The
prescriptions about coalition manipulation and coercion belong to states in our
model, not to the observer. What survives the translation for an individual is
the epistemics — read trajectory, buy information, watch the treasury, keep your
exit — and not the statecraft.

## Suggested spec fields

```json
"mandala_position": {"vijigishu_frame": "ST_IN", "role": "ari|mitra|udasina|madhyama"},
"shadgunya_default": "dvaidhibhava",
"upaya_capability": {"sama":0.7,"dana":0.9,"bheda":0.4,"danda":0.3}
```

`udasina` (the indifferent, distant power) and `madhyama` (the middle power able
to tip either side) are useful categories with no standard modern equivalent.
The *madhyama* in particular is where swing-state leverage lives, and naming it
makes the model notice actors it would otherwise treat as minor.
