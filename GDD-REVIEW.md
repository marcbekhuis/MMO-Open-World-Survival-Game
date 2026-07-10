# GDD Review — 2026-07-10

Perspectives run: investor, player, developer, producer, design-peer, monetization, art, ux, narrative (full panel). Comments placed: 37 across 20 files.

## Executive summary

The panel is unusually unanimous on both the praise and the problem. Every reviewer independently noted that this is a genuinely coherent vision document — the world, the systems, and the tone cohere, the bestiary is written at bible quality, and the full-loot → economy → crafting → death loop is a real reinforcing engine, not systems coexisting. The problem is equally unanimous: **five of nine reviewers (investor, player, developer, producer, art) reported, without prompting, that there is no MVP, no scope boundary, and no sense of what ships first.** Every system is written at the same confident, load-bearing pitch, which is the textbook early-warning sign of scope death and the exact shape of every crowdfunded MMO that died in alpha. The second-strongest agreement is a specific hole: three reviewers (player, design-peer, monetization) found that the document never says **what happens to a player's base and banked goods while they are logged off** — the single question that decides retention in a full-loot survival MMO. After those two, the panel converges on a cluster of "the design has the right instincts but hasn't done the hard commercial/operational math": RMT is never acknowledged, the subscription-only model is asserted rather than argued, and no content cadence is committed. The document is a strong vision; it is not yet a plan, and the gap between those two is where the work now lives.

## Verdicts

| Perspective | Verdict |
|---|---|
| Investor / publisher | Conditional — no first meeting as it stands; would take one if a USP, an argued business model, and a risk/stageability section arrive. |
| Player / backer | Conditional — would wishlist today, but won't back until offline-raid rules, a first-slice, and the small-group promise are answered. |
| Prospective developer | Conditional, leaning no — the server tech is seriously thought through, but the expensive systems are vision prose and cross-server combat/economy authority is owned by no one. |
| Producer | No — a coherent vision, but nothing separates must-have from aspiration, so there is nothing to cut when the schedule demands it. |
| Design peer | Conditional — the strong two-thirds interlock well, but the merchant pillar and the footholds pillar each have an unaddressed hole at their centre. |
| Monetization & live-ops | Conditional — the sinks are excellent, but the faucet accounting, RMT, the lapsed-player return path, and content cadence are all missing. |
| Art director | Conditional — could brief a creature team today; could not brief the world, which is a mood board where the bestiary is a bible. |
| UX designer | Conditional — the safe ring is genuinely protective, but onboarding is a place to learn in, not a sequence, and the safety-gradient seam is left to chance. |
| Narrative designer | Conditional yes — a coherent world with a real spine, but the spine never reaches World.md or Quests.md, and Dungeons.md imports an unsanctioned cosmology. |

## Cross-cutting findings

Ordered by strength of agreement and severity. These are the findings the panel raised independently through more than one lens — the strongest signal in the exercise.

1. **No MVP, scope boundary, or phasing anywhere in the document set** — *investor, player, developer, producer, art (five lenses).* Eleven biomes, ~20 bespoke-AI creatures, a combinatorial magic tree, dynamic taming/breeding, a simulated economy, a full building system, raids, guild warfare, and a custom distributed server stack are all presented at identical levels of commitment, with no first-playable cut, no phasing, and no stated minimum form for any system. The producer has nothing to cut; the developer sees unbounded scope as a death-march predictor; the backer smells Star Citizen; the art director sees an un-scoped asset library; the investor has no MVP to fund. **Wants:** one planning artifact — even a page or a tag per system — that separates launch-critical from post-launch and states each major system's reduced launch form (e.g. "launch magic = fixed spell list, no combination"; "launch economy = static NPC pricing"). This is the single highest-leverage addition to the document.

2. **What happens to a base and its banked goods while the owner is offline is never stated** — *player, design-peer, monetization (three lenses).* [Death-and-loss.md](Death-and-loss.md) promises banked goods are "never at risk from a death in the field," [Raids.md](Raids.md) lets base raids steal loot and force relocation, and [Server-settings.md](Server-settings.md) persists structures — none says whether an absent owner's base can be raided into nothing. This is the make-or-break retention question of the genre and the load-bearing hole in the "Player-made footholds" pillar; monetization adds that it also has no designed lapsed-player return path. **Wants:** an explicit offline-base rule (raid windows, decay-only vulnerability, insured vs lootable storage) that the footholds, death-and-loss, and raids docs all agree on, plus a return experience for the resubscribing player. *(Placed inline in Raids.md.)*

3. **A full-loot player economy is an RMT/gold-farming magnet, and it is never acknowledged** — *player, monetization (two lenses).* Full loot makes farmed gold trivially launderable (stage a death, buyer loots the corpse, no trade record), and RMT competes directly with the subscription economy. A "no pay-to-win" promise that never names the black market reads as naive. **Wants:** name RMT and botting as known threats and state the design/live-ops posture (node and vendor throttles, subscription-tied detection, how sinks blunt farmed-gold value). *(Placed inline in Monetization.md.)*

4. **Subscription-only is asserted, not argued, and no one has checked it against server run-cost** — *investor, monetization (two lenses).* No box price means zero upfront recoupment and total dependence on retention, on a bespoke, server-heavy architecture (per-entity sync, region migration, standby failover) that is the most expensive way to run an MMO. No comparable, price point, paying-population estimate, or run-cost-per-player sanity check exists. **Wants:** a business-model argument naming 2-3 live subscription comparables with real numbers, an assumed price and target population, and a back-of-envelope showing run-cost per concurrent player sits below the sub with margin for content. *(Placed inline in Monetization.md and Server-architecture.md.)*

5. **The subscription promises "a steady stream of new content" but no cadence is committed** — *producer, monetization (two lenses).* The document effectively ends where the hardest production problem begins: sustaining content for years. No season/event/expansion rhythm, no sense of how much authored content a beat needs, no split of systemic vs hand-made living world. **Wants:** a short live-ops section committing to a post-launch content heartbeat and acknowledging its standing cost. *(Placed inline in Monetization.md and Quests.md.)*

6. **Onboarding is a place to learn in, not a sequence, and lacks a concrete first hour** — *player, ux (two lenses).* [New-player-experience.md](New-player-experience.md) asserts the game "teaches itself in the open" against one of the heaviest complexity budgets in the genre (hunger, fatigue, temperature, zero-slot encumbrance, skills, magic, reputation, factions, full loot) but sequences none of it, and the evocative writing lives in the bestiary, not the first evening. **Wants:** an ordered tuition sequence mapping each core system to the moment it is first taught, plus a concrete first-evening walkthrough. *(Placed inline in New-player-experience.md.)*

## Per-perspective review

### Investor / publisher
**Conditional — no first meeting as it stands.** One of the most polished vision documents in the genre, but it picks two of the hardest commercial positions in existence (subscription-only, full-loot hardcore PvP) on top of a bespoke distributed world and argues none of the three. **Strengths:** unusual internal coherence; a credible no-pay-to-win stance as a real market signal; onboarding thinking that shows awareness of the retention cliff.
Remaining findings beyond the cross-cutting set:
- **No risk section anywhere** *(project-wide, high)* — no acknowledgment of server-tech execution risk, the graveyard of subscription/full-loot MMOs, or acquisition against entrenched giants. Confidence stands in for risk management. **Wants:** a short risks-and-mitigations section naming the top three existential threats.
- **No budget, team, or timeline artifacts** *(project-wide, high)* — no cost band, no team pedigree (this genre lives or dies on it), no milestone/MVP timeline. **Wants:** a one-page commercial appendix. *(Overlaps cross-cutting #1.)*
- **Audience defined by temperament with no size** *(medium)* — full-loot plus subscription compounds the narrowing; no TAM. *(Placed inline in Monetization.md.)*
- **No one-line USP** *(medium, placed inline in README.md)* — two minutes yields a stack of genre attributes, not one reason this exists that Rust/ARK/Valheim/Albion don't.

### Player / backer
**Conditional — would wishlist, won't back yet.** The differentiated fantasy genuinely lands (dynamic taming with a self-preserving mount, the flight-to-floating-islands arc, tribute cairns at a dragon's range), and the fairness posture is exactly right. **Strengths:** death-and-loss is confronted honestly; the marquee fantasy is daydream-worthy; the one-subscription/no-P2W headline earns the click. Beyond the cross-cutting set:
- **Small-group "fully viable" vs zerg conquest** *(medium, placed inline in Guilds-and-factions.md)* — the reassurance and the conquest machinery point in opposite directions; state the real ceiling for three friends.
- **Grind/recovery for limited-time players** *(medium, placed inline in Monetization.md)* — weeks-to-months progression plus full loot; say whether re-gearing is an evening or a weekend.

### Prospective developer
**Conditional, leaning no.** The two server documents are real thinking (Replication Graph, the `NetCullDistanceSquared` re-bucketing caveat, the honest 200-400-per-process ceiling) — but the over-specified layer is the cheap-to-outsource one, while the engineer-year sinks are pure prose. **Strengths:** the server pair treats the hard part seriously; the doc knows its own load-bearing bet; coupling is at least described. Beyond cross-cutting #1:
- **Cross-seam combat authority is the fatal unnamed assumption** *(high, placed inline in Server-architecture (Technical).md)* — a full-loot fight straddling a mutable region boundary has no authoritative owner; seam-camping is inevitable; "briefly migrating one combatant" is a per-duel hack that ignores 20v20.
- **The live economy simulation has no home in the server model** *(high, placed inline in Economy.md)* — the Master Server "never simulates gameplay" and Cluster Units are region-only, yet region-wide supply/demand needs a shared simulator.
- **Building/Magic/Skills/Taming are unbuildable as written** *(high, placed inline in Building-system.md)* — philosophy, not requirements; no engineer, animator, or QA could scope them.
- **World-boss cull radius fights the scaling story** *(medium, placed inline in Dynamic-culling-and-render-distance.md)* — a 5 km radius over 1 km² regions fans ghost-sync across ~5 regions exactly at peak load.
- **Player-structure persistence flagged as a footnote** *(medium, placed inline in Server-architecture (Technical).md)* — a genre killer treated as a one-line World Partition limitation.

### Producer
**No — not plannable as it stands.** A vertical slice is extractable (Forest + capital + core loop + Wolf pack), but nothing distinguishes must-have from aspiration. Beyond cross-cutting #1 and #5:
- **Content-volume math never done** *(high, placed inline in Magic.md)* — a combinatorial spell tree with three spells authored; 20 creatures each with bespoke AI; open-ended lists with no ceiling.
- **Seamless-world tech silently gates everything with no fallback** *(high, placed inline in README.md)* — the highest-risk longest-lead item, with no dependency sketch and no Plan B if it slips.
- **Taming is a major system on one page** *(medium, placed inline in Taming-and-control.md)* — three bonding methods, breeding/genetics, self-preserving mount AI, no minimum form.
- **Dynamic economy has no reduced launch version** *(medium, placed inline in Economy.md)* — one of the hardest MMO systems, presented as a baseline assumption.

### Design peer
**Conditional.** The survival/crafting/economy/death/travel/conflict chain genuinely interlocks, and travel-and-mounts' "every faster method must expand the value of distance" is exactly the right self-imposed discipline. **Strengths:** loss→demand→economy→value is a real loop; travel speed-ups held against one test; survival scales pressure with distance, not as a flat tax. Beyond cross-cutting #2:
- **The merchant pillar is unsupported by progression and income** *(medium ×2)* — the XP list omits trading so a pure trader never levels *(placed inline in Player.md)*, and the only lucrative merchant play (regional arbitrage) requires the full-loot travel the merchant is told is optional *(placed inline in Economy.md)*.
- **The Item Box breaks cross-class fairness** *(medium, placed inline in Magic\Spells\Misc\Item-box.md)* — exempts a mage's carried goods from full loot, weight, and spoilage; a mage-merchant is strictly safer than a non-mage.
- **Taming bond maintenance across offline time is undefined** *(medium, placed inline in Taming-and-control.md)* — a player could lose their hardest-won flying mount just by not logging in.

### Monetization & live-ops
**Conditional.** Full-loot as a continuous, deliberate gear sink is the single best economic decision in the document, and the sink list (repair, upkeep, taxes, tolls, bounties) is genuinely strong. **Strengths:** full-loot sink ties risk fantasy to gear value; the two-layer economy model is internally consistent; the no-P2W stance is reasoned, not asserted. Beyond cross-cutting #3, #4, #5:
- **Faucet side is unexamined** *(medium, placed inline in Economy.md)* — coin-paying NPC vendors mint currency from nothing and dynamic pricing without guardrails is an arbitrage exploit; nothing checks whether sinks outpace coin creation.
- **Long-horizon land/wealth concentration** *(medium, placed inline in Guilds-and-factions.md)* — finite land plus compounding guilds risks a year-three closed shop that punishes new and returning subscribers.

### Art director
**Conditional — could brief a creature team today, not the world.** The bestiary is briefable at a professional level (silhouette-first, palette/material calls, readability tells, an enforced wyvern body-plan canon). Beyond cross-cutting #1:
- **The world-level direction briefs nobody** *(high, placed inline in Art-direction.md)* — "photoreal + contrast" is a mood tool, not an identity; no palette poles, shape language, material discipline, or "what this world is never." Raise it to the bestiary's standard using the mana-suffused living-mythic-age identity already in the setting.
- **The grounded/fantastical tension has no visual rule** *(project-wide, high)* — mud-and-rope survival plus floating islands and spellfire, with [Magic.md](Magic.md) containing zero visual direction. Where is the line that keeps mana belonging to the same frame as grime? *(Report-only per convention; a spell-VFX stub in Magic.md is the natural home.)*
- **Four green-woodland biomes separated only by mood** *(medium, placed inline in Art-direction.md)* — give each a screenshot-distinct signature.
- **Distinct-asset volume unacknowledged** *(medium, placed inline in Art-direction.md)* — first-person eye-level viewing raises the bar on every asset; commit to a modular kit and an MVP cut.

### UX designer
**Conditional.** The safe ring is genuinely protective and Accessibility.md is substance, not intentions. **Strengths:** accessibility ties each promise to a real system; the HUD commits to "clean core, depth on demand"; survival framed as decisions, not chore-bars. Beyond cross-cutting #6:
- **The safety gradient has no readable signal** *(high, placed inline in Conflict-and-pvp.md)* — a newcomer can't make an informed choice about a line with no location; the first sign they left safety is a stripped corpse. Add an in-world signal and a low-cost first encounter teaching the full-loot stake.
- **Anti-minimap navigation is hostile to new players** *(medium, placed inline in UI-and-HUD.md)* — getting lost is a survival failure and the corpse run depends on finding your body; give first-week players a baseline compass/marker/starting map.
- **Social UX is undescribed** *(project-wide, medium)* — no LFG, grouping, or secure-trade interface; "deals struck on the road" in a full-loot world resolves to "whoever attacks first wins." *(Report-only.)*
- **Zero-slot inventory is expectation-breaking and untaught** *(low)* — flag the gear-driven model as an explicit early lesson. *(Report-only.)*

### Narrative designer
**Conditional yes — a coherent world with a real spine.** [Setting-and-lore.md](Setting-and-lore.md) commits to a load-bearing premise (a living mythic age, distant gods, world-sourced magic, a newly-reopened frontier three realms race to claim), and the bestiary's Story Hooks are actual playable situations. **Strengths:** the bestiary is the real narrative engine; race and setting are fused; [Content-and-tone.md](Content-and-tone.md) is a contract that holds across samples. Findings:
- **Dungeons.md imports an unsanctioned cosmology** *(medium, placed inline in Structures\Dungeons.md)* — angels/demons and a heaven/hell axis the setting never establishes and arguably contradicts; root it in the primordial cosmology.
- **Quests.md ignores the frontier premise and the persistent world** *(medium, placed inline in Quests.md)* — named as the authored-layer delivery vehicle, yet a generic MMO taxonomy with no position on repeatability, shared state, or avoiding "the chosen one."
- **World.md tells no frontier story** *(medium, placed inline in World.md)* — the terrain, which should carry the spine without a lore page, reads as a generic seamless open world.

## Resolving a finding

Fix the design, then delete the matching `<!-- REVIEW(...) -->` comment. Ask for "clear review comments" to strip all of them, or re-run the review to refresh.
