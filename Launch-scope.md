# Launch Scope

The design documents describe the whole game the world is meant to become. This document says which part of it ships first: the first early-access release, which this document calls the launch. Every system keeps its full description in its own file; what follows names the form each one takes at launch, what waits for the years after, and which piece of technology everything else depends on. It exists so that production always knows what to build next and what it can safely cut, and so that a slipping schedule shortens the list of post-launch work rather than hollowing out the launch.

## A Staged Release

The game has no single hard launch. It reaches players in stages. Closed tests by invitation come first. Early access follows, admitting players in waves under a population cap, so that the number of people in the world never outruns what the world and its servers can hold. During early access a server is wiped whenever the work demands it, and a wipe resets everything: the world and the characters, with their levels and skills. On a declared day the wipes end and the persistent world begins. From that day levels and skills are never lost, and every promise of [Death and Loss](Death-and-loss.md) holds without exception.

The reason is that a large rush into an unfinished world loses the players it attracts. People who arrive to find thin content, missing places and a world that is still being reshaped rarely return for the finished game. Staging lets the audience grow only as fast as the world can hold it, and gives each wave a world that is a little more complete than the one before.

## The Principle of the Cut

The launch game has to deliver every one of the design's [pillars](README.md) in a smaller world, not a few of them across a large one. A player at launch must be able to live in a city or on the frontier, tame and ride, build and lose a base, die and walk back to their body, and trade their way to wealth. What the launch gives up is breadth: fewer biomes, a closed list of creatures and spells, hand-made rather than generated places, and the most expensive late-game systems held back until the foundation is proven in live play.

## The Vertical Slice

The first playable build is a forest frontier. One starting city and its farm belt sit at the edge of a [Forest](Biomes/Forest.md) frontier where a [Wolf](Creatures/Wolf.md) pack hunts. The slice holds the core loop and nothing else: [Movement](Movement.md), [Melee Combat](Melee-combat.md), [Gathering](Gathering.md), [Crafting](Crafting.md), [Survival](Survival.md), a claim and a base from the [Building System](Building-system.md), full-loot death and the corpse run from [Death and Loss](Death-and-loss.md), all on a single server. Every later system is judged by whether it makes that evening in the forest better.

## The World at Launch

The world is one seamless map of about 80 by 80 kilometres for each server cluster, which is 6 400 regions of one square kilometre, and that size is the destination. The landscape of the whole map exists from the first build, shaped to broad guidelines, while the level design is finished area by area and opened in stages. Ground that is not finished is closed. Where possible the land draws the edge of the open area, with sea, cliffs and mountain walls; elsewhere it is drawn by the same in-world barrier that marks an unavailable region in [Server Architecture](Server-architecture.md). Nothing can be built or claimed on closed ground.

Seven of the fourteen biomes ship at launch: the [Forest](Biomes/Forest.md), [Plains](Biomes/Plains.md), [Mountain Range](Biomes/Mountain-range.md), [Swamp](Biomes/Swamp.md), [Coast](Biomes/Coast.md), [Mesa](Biomes/Mesa.md), and [Ancient Forest](Biomes/Ancient-forest.md). Between them they cover temperate, wet, coastal, and arid ground, and every survival pressure in [Survival](Survival.md) has somewhere to bite. The elven heartland and its starting city stand in the Ancient Forest, which is why it belongs to the first release, and cold is met in the passes of the Mountain Range until the [Tundra](Biomes/Tundra.md) opens. The Tundra, [Jungle](Biomes/Jungle.md), [Bamboo Jungle](Biomes/Bamboo-jungle.md), [Scorching Desert](Biomes/Scorching-desert.md), [Deep Caverns](Biomes/Deep-caverns.md), [Deep Ocean](Biomes/Deep-ocean.md), and [Floating Islands](Biomes/Floating-islands.md) open afterwards as frontier expansions, which suits the setting: the frontier is only now being reopened, and its far reaches opening over time is that story told in play.

All three peoples of [Races](Races.md) are playable from the first day, each with a realm's heartland and a starting city, because the rivalry between realms is the political ground the world stands on. Those heartlands, their great cities, towns, and hamlets are built by hand at launch; [Settlement Generation](Settlement-generation.md) follows once the hand-made settlements have shown what the generator must reproduce.

## Creatures at Launch

A little over a dozen species ship with behaviour of their own, written to the standard the [Wolf](Creatures/Wolf.md) sets: the Wolf, the [Red Deer](Creatures/Red-deer.md) that is its ordinary prey, the [Horse](Creatures/Horse.md), the [Large Buffalo](Creatures/Large-buffalo.md), the goblins, the [Swamp Spider](Creatures/Swamp-spider.md), the [Slime](Creatures/Slime.md), the [Stone Giant](Creatures/Stone-giant.md), the [Treant](Creatures/Treant.md), the skeleton garrisons, the [Minotaur](Creatures/Minotaur.md), the [Mermaid](Creatures/Mermaid.md), and the [Royal Dragon](Creatures/Royal-dragon.md) as the launch's world boss. A species with several forms shares one brain across them: the [Green Goblin](Creatures/Green-goblin.md) and [Red Goblin](Creatures/Red-goblin.md) are one behaviour in two roles, as are the [Skeleton Knight](Creatures/Skeleton-Knight.md) and [Skeleton Archer](Creatures/Skeleton-Archer.md), the sizes of the Stone Giant and the Slime, and the [Treant Sapling](Creatures/Treant-sapling.md), [Treant Guardian](Creatures/Treant-guardian.md) and [Treant Elder](Creatures/Treant-elder.md), which the Ancient Forest brings to the first release. Ambient life such as [Birds](Creatures/Birds.md) fills the world with simple flock behaviour rather than bespoke behaviour of its own. The rest of the bestiary arrives with the biomes it belongs to.

## Systems at Launch

[Magic](Magic.md) ships as a closed list: the authored foundation and advanced spells, each with its upgrade directions, and nothing that combines elements into effects nobody wrote. New spells arrive as content, each written and balanced like the ones before it.

[Taming and Control](Taming-and-control.md) ships with all three bonds, slave, trust, and parental bonding of found young, together with shelter and the upkeep of a bond. Breeding waits for the years after launch. [Creature Riding](Creature-riding.md) and [Saddles and Carriages](Saddles-and-carriages.md) ship with every saddle, from the riding saddle to steel plate, and with storage and passenger carriages; the weaponised carriage comes later. [Flight](Flight.md) ships with the wing-rig and the Royal Dragon, while the [Flying Leviathan](Creatures/Flying-leviathan.md) and the mobile base on its back wait for vehicle groups that cross servers.

The [Building System](Building-system.md), claims, upkeep, outskirts plots, offline raids and siege from [Raids and Conquest](Raids.md) all ship, along with hired guards from [Non-Player Characters](NPCs.md). Enslaved NPC labour and guards come later, and so do the conquest of contested ground and the diplomacy of [Guilds and Factions](Guilds-and-factions.md); at launch guilds build, raid, and defend, but do not yet hold territory. The [Economy](Economy.md) ships as written, with per-settlement ledgers and prices that drift around authored regional bases.

[Quests](Quests.md) at launch are systemic, settlement contracts, bounties, and the situations of the bestiary's story hooks, with a short authored arc for each starting city. [Dungeons](Structures/Dungeons.md) are hand-built: a few great dungeons, made with the care that only authored spaces receive, while generated dungeons follow later.

## Production Discipline

First-person play at eye level removes the distance that hides cheap art, so every asset is seen close up and asset volume is the largest cost the launch carries. The building kit, its three racial styles, and the settlements built from it share one modular kit and one material library, so a dwarven wall and a human one differ in their trim and stone rather than in being separate models from the ground up, and the [Art Direction](Art-direction.md) is applied as a shared rulebook rather than asset by asset.

## The Technology Everything Depends On

The seamless multi-server cluster of [Server Architecture](Server-architecture.md) is the longest-lead and riskiest work in the project, and no content waits for it. One world per cluster is the design, and one Cluster Unit Server can own every region of it, so the launch's fallback is already part of the design: until handoff between servers holds under load, each map runs on a single server under a population cap, and more maps are opened as they fill. Early-access wipes make that fallback cheap to live with. The open area of the first stages is sized to that cap, so the world a wave of players meets is never larger than the one server that carries it can serve. Multi-server handoff is switched on once it holds up under load, with no change to any content, map, or rule. In order, the gating dependencies are the single-server world, the character foundation of movement, actions, and combat, persistence of bases and sleeping characters, and only then handoff across servers and the systems that need it, such as the leviathan's mobile base.

## Continue Reading

Start from the [README](README.md) for the full system index, read [Server Architecture](Server-architecture.md) for the technology the launch depends on, and see the [Design Backlog](Design-backlog.md) for what is still being decided.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
