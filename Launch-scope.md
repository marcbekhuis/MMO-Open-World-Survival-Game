# Launch Scope

The design documents describe the whole game the world is meant to become. This document says which part of it ships first. Every system keeps its full description in its own file; what follows names the form each one takes at launch, what waits for the years after, and which piece of technology everything else depends on. It exists so that production always knows what to build next and what it can safely cut, and so that a slipping schedule shortens the list of post-launch work rather than hollowing out the launch.

## The Principle of the Cut

The launch game has to deliver every one of the design's [pillars](README.md) in a smaller world, not a few of them across a large one. A player at launch must be able to live in a city or on the frontier, tame and ride, build and lose a base, die and walk back to their body, and trade their way to wealth. What the launch gives up is breadth: fewer biomes, a closed list of creatures and spells, hand-made rather than generated places, and the most expensive late-game systems held back until the foundation is proven in live play.

## The Vertical Slice

The first playable build is a forest frontier. One starting city and its farm belt sit at the edge of a [Forest](Biomes/Forest.md) frontier where a [Wolf](Creatures/Wolf.md) pack hunts. The slice holds the core loop and nothing else: [Movement](Movement.md), [Melee Combat](Melee-combat.md), [Gathering](Gathering.md), [Crafting](Crafting.md), [Survival](Survival.md), a claim and a base from the [Building System](Building-system.md), full-loot death and the corpse run from [Death and Loss](Death-and-loss.md), all on a single server. Every later system is judged by whether it makes that evening in the forest better.

## The World at Launch

Seven of the fourteen biomes ship at launch: the [Forest](Biomes/Forest.md), [Plains](Biomes/Plains.md), [Mountain Range](Biomes/Mountain-range.md), [Tundra](Biomes/Tundra.md), [Swamp](Biomes/Swamp.md), [Coast](Biomes/Coast.md), and [Mesa](Biomes/Mesa.md). Between them they cover temperate, cold, wet, coastal, and arid ground, and every survival pressure in [Survival](Survival.md) has somewhere to bite. The [Ancient Forest](Biomes/Ancient-forest.md), [Jungle](Biomes/Jungle.md), [Bamboo Jungle](Biomes/Bamboo-jungle.md), [Scorching Desert](Biomes/Scorching-desert.md), [Deep Caverns](Biomes/Deep-caverns.md), [Deep Ocean](Biomes/Deep-ocean.md), and [Floating Islands](Biomes/Floating-islands.md) open afterwards as frontier expansions, which suits the setting: the frontier is only now being reopened, and its far reaches opening over time is that story told in play.

All three peoples of [Races](Races.md) are playable from the first day, each with a realm's heartland and a starting city, because the rivalry between realms is the political ground the world stands on. Those heartlands, their great cities, towns, and hamlets are built by hand at launch; [Settlement Generation](Settlement-generation.md) follows once the hand-made settlements have shown what the generator must reproduce.

## Creatures at Launch

About a dozen species ship with behaviour of their own, written to the standard the [Wolf](Creatures/Wolf.md) sets: the Wolf, the [Large Buffalo](Creatures/Large-buffalo.md), the [Ancient Deer](Creatures/Ancient-deer.md), the goblins, the [Swamp Spider](Creatures/Swamp-spider.md), the [Slime](Creatures/Slime.md), the [Stone Giant](Creatures/Stone-giant.md), the skeleton garrisons, the [Minotaur](Creatures/Minotaur.md), the [Mermaid](Creatures/Mermaid.md), and the [Royal Dragon](Creatures/Royal-dragon.md) as the launch's world boss. A species with several forms shares one brain across them: the [Green Goblin](Creatures/Green-goblin.md) and [Red Goblin](Creatures/Red-goblin.md) are one behaviour in two roles, as are the [Skeleton Knight](Creatures/Skeleton-Knight.md) and [Skeleton Archer](Creatures/Skeleton-Archer.md) and the sizes of the Stone Giant and the Slime. Ambient life such as [Birds](Creatures/Birds.md) fills the world without bespoke behaviour. The rest of the bestiary arrives with the biomes it belongs to.

## Systems at Launch

[Magic](Magic.md) ships as a closed list: the authored foundation and advanced spells, each with its upgrade directions, and nothing that combines elements into effects nobody wrote. New spells arrive as content, each written and balanced like the ones before it.

[Taming and Control](Taming-and-control.md) ships with all three bonds, slave, trust, and parental bonding of found young, together with shelter and the upkeep of a bond. Breeding waits for the years after launch. [Creature Riding](Creature-riding.md) and [Saddles and Carriages](Saddles-and-carriages.md) ship with every saddle, from the riding saddle to steel plate, and with storage and passenger carriages; the weaponised carriage comes later. [Flight](Flight.md) ships with the wing-rig and the Royal Dragon, while the [Flying Leviathan](Creatures/Flying-leviathan.md) and the mobile base on its back wait for vehicle groups that cross servers.

The [Building System](Building-system.md), claims, upkeep, outskirts plots, offline raids and siege from [Raids and Conquest](Raids.md) all ship, along with hired guards from [Non-Player Characters](NPCs.md). Enslaved NPC labour and guards come later, and so do the conquest of contested ground and the diplomacy of [Guilds and Factions](Guilds-and-factions.md); at launch guilds build, raid, and defend, but do not yet hold territory. The [Economy](Economy.md) ships as written, with per-settlement ledgers and prices that drift around authored regional bases.

[Quests](Quests.md) at launch are systemic, settlement contracts, bounties, and the situations of the bestiary's story hooks, with a short authored arc for each starting city. [Dungeons](Structures/Dungeons.md) are hand-built: a few great dungeons, made with the care that only authored spaces receive, while generated dungeons follow later.

## Production Discipline

First-person play at eye level removes the distance that hides cheap art, so every asset is seen close up and asset volume is the largest cost the launch carries. The building kit, its three racial styles, and the settlements built from it share one modular kit and one material library, so a dwarven wall and a human one differ in their trim and stone rather than in being separate models from the ground up, and the [Art Direction](Art-direction.md) is applied as a shared rulebook rather than asset by asset.

## The Technology Everything Depends On

The seamless multi-server cluster of [Server Architecture](Server-architecture.md) is the longest-lead and riskiest work in the project, and no content waits for it. One Cluster Unit Server can own every region of a world, so the launch's fallback is already part of the design: if handoff between servers is not proven in time, each world runs on a single server with its population capped, and the game opens several worlds instead of one. Multi-server handoff is switched on once it holds up under load, with no change to any content, map, or rule. In order, the gating dependencies are the single-server world, the character foundation of movement, actions, and combat, persistence of bases and sleeping characters, and only then handoff across servers and the systems that need it, such as the leviathan's mobile base.

## Continue Reading

Start from the [README](README.md) for the full system index, read [Server Architecture](Server-architecture.md) for the technology the launch depends on, and see the [Design Backlog](Design-backlog.md) for what is still being decided.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
