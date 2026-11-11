# Design Backlog

This is a working file, not part of the design proper. It carries context between sessions so that ideas, questions, and deferred decisions survive even though AI assistants do not share memory. Everything recorded here is provisional: items move out of the backlog and into the design documents as they are written, answered, or decided. See [AGENTS.md](AGENTS.md) for how this file fits the wider workflow.

## Ideas awaiting writing

Proposals that have been approved, or are worth keeping, but have not yet been written into a document. Record enough detail to act on later and note the target file. Clear an entry once its content lands in the design.

The system-area gaps identified during the content-and-tone session have now been written and registered in the [README](README.md) index: [Survival](Survival.md), [Crafting](Crafting.md), [Guilds and Factions](Guilds-and-factions.md), [Weather, Time, and Seasons](Weather-time-and-seasons.md), and [Travel and Mounts](Travel-and-mounts.md).

- **Shelter needs for every tameable creature.** The [Building System](Building-system.md#shelter-for-creatures) says each creature's climate and space needs are recorded in its bestiary entry, and the creature template now asks for them, but no existing file states them yet. Add a sentence or two to the [Wolf](Creatures/Wolf.md), [Large Buffalo](Creatures/Large-buffalo.md), [Four-Armed Monkey](Creatures/Four-armed-monkey.md), [Royal Dragon](Creatures/Royal-dragon.md), and [Flying Leviathan](Creatures/Flying-leviathan.md) files (the leviathan's shelter is its leyline anchor and deck troughs).

- **Foundation technical guides still to write (18 October 2026).** The character foundation is now specified: [Movement](Movement.md), [Melee Combat](Melee-combat.md), [Ranged Combat](Ranged-combat.md), [Actions](Actions.md), [Health and Wounds](Health-and-wounds.md), [Armour](Armour.md), [Inventory](Inventory.md), [Survival](Survival.md), [Gathering](Gathering.md), [Player Progression](Player.md), and casting in [Magic](Magic.md#casting). Movement and melee, including projectiles and the action slot, have technical guides, and [Health and Wounds (Technical)](<Health-and-wounds (Technical).md>) now covers body regions, wounds, and armour layers on the body. Still without one: inventory, equipment, condition, and world items; the survival needs and body heat; gathering and resource renewal; the stat, levelling, and server-settings data model; and casting with world-drawn mana.

- **A live-load rule for bridges and spans.** [Saddles and Carriages](Saddles-and-carriages.md#roads-terrain-and-bridges) has a laden carriage count its weight against any bridge it crosses, so a thin player-built span can fail under it. The [Building System](Building-system.md#stability-and-support) has stability but no live load; add how a span's material and support set the weight it bears.

- **Approved reference images for the building materials (8 November 2026).** Every material brief under [Building Materials](Art-direction/Building-materials.md) and the [Surface Authoring](Art-direction/Surface-authoring.md) standard describe the reference set a material needs, but no approved set exists yet. Produce and approve, per material, the assembled example at first-person eye height, front and rear views of representative pieces, and close views of surface, edges, joints, and wear under neutral and in-game light, starting with planked timber, the material of the first modelled kit. A generated kit is a candidate for review, not an approved reference because it exists.

- **Validate the building asset budgets (8 November 2026).** The geometry, material-slot, texture-memory, collision, and frame-time allowances in [Building System (Technical)](<Building-system (Technical).md#10-rendering-replication-and-persistence>) are provisional. Measure them against a stated number of visible building pieces and the [Hotspot Workloads and Degradation](Server-settings.md#hotspot-workloads-and-degradation) scenarios before adopting them.

- **Confirm the provisional kit dimensions (8 November 2026).** The kit specification in [Building System (Technical)](<Building-system (Technical).md>) marks the doorway, double doorway, door clearance, window openings, stair, and roof dimensions provisional. The stair of fifteen 0,20-metre rises over a 3-metre run needs a movement and headroom test before the dimensions become canon.

## Open questions

Questions awaiting the user's direction before the design can commit. Phrase each as a concrete question, with the options or trade-offs noted where they are known.

## Deferred decisions

Choices intentionally left open for now, each with a short note on why, so a later session does not reopen them by accident or mistake them for settled.

- **Periodic wipes after release, and a brake on veterans (11 November 2026).** Levels, stats and skills stay uncapped, and nothing bounds the edge a veteran builds over a newcomer. Two answers were named and left open: a penalty or rebalance for late-game characters, and a periodic wipe of the persistent world, for example once a year. The second would change what [Launch Scope](Launch-scope.md#a-staged-release) now says, that wipes end when the persistent world begins, so it is a decision to take deliberately, not in passing.
- **Substances stay flavour-only.** Alcohol and narcotics are world texture, not a mechanical subsystem, per [Content and Tone](Content-and-tone.md). A future pass could give intoxication real buffs, debuffs, or an addiction loop, but that is a deliberate decision to revisit, not a gap to fill in passing.
- **The flying-mount roster waits for the bestiary.** [Flight](Flight.md) names only the [Flying Leviathan](Creatures/Flying-leviathan.md), the [Royal Dragon](Creatures/Royal-dragon.md), and the egg-raised [Highland Dragon](Creatures/Highland-dragon.md) as flyers, all apex-tier. Adding a mid-tier working flyer (a giant cliff bird, a lesser wyvern, or both) was proposed on 11 October 2026 and deferred by the user until the creature list is further along.
- **Disease is a hazard, not a standing meter.** [Survival](Survival.md) treats illness and wounds as conditions the world inflicts and the player treats (with the [Swamp](Biomes/Swamp.md) as the signature source) rather than as a fourth survival bar alongside food, fatigue, and exposure. Promoting disease to a full subsystem with its own progression, immunity, and cures is a deliberate future choice, left open rather than assumed.

## Continue Reading

See [AGENTS.md](AGENTS.md) for the working conventions, [README.md](README.md) for the project index, [Glossary.md](Glossary.md) for shared terminology, and [Prototype-findings.md](Prototype-findings.md) for what the Unreal prototype has learned.
