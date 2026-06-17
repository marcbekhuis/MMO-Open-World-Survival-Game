# Project Overview

This repository is a living game-design document for a large-scale, persistent open-world survival RPG built around exploration, settlement building, social conflict, and long-term character growth. The game takes place in a single seamless world where players can leave the safety of capital cities, cross dangerous biomes, build defensible homes, discover hidden ruins, trade with other players, and take part in factional conflict without feeling pushed through isolated levels or short-session arenas.

The intended experience is a survival game with MMO scale and RPG depth. Moment-to-moment play should feel grounded and physical: players gather resources, manage gear, navigate weather and terrain, fight creatures, and return to settlements with stories worth telling. Over weeks or months, those same actions feed into larger systems: reputations shift, guilds claim territory, settlements grow, trade routes become valuable, and the world remembers what players have changed.

## Design Pillars

**Seamless wilderness.** The world should feel continuous across forests, jungles, mountains, swamps, oceans, underground spaces, and floating islands. Travel is a major part of the game, so the world needs strong landmarks, dangerous routes, and reasons to revisit old regions with new tools or allies. The broader world structure is described in [World Design](World.md), with individual biomes linked from that page.

**Survival with purpose.** Survival pressure exists to create decisions, not chores. Food, resources, inventory space, shelter, and environmental hazards should shape routes and preparation while still leaving room for exploration, quests, and social play. Systems such as [Inventory](Inventory.md), [Building System](Building-system.md), and [Player Settings](Player-settings.md) support that pressure.

**Player-made footholds.** Bases, outposts, guild halls, and settlements should matter because they create safety, services, identity, and conflict. The same construction logic should support small camps and major fortified towns, while the surrounding biome affects what materials and strategies make sense. The built world is covered in [Structures](Structures.md) and [Building System](Building-system.md).

**RPG growth through action.** Characters improve by doing meaningful things: fighting, crafting, exploring, gathering, casting spells, completing quests, and contributing to group objectives. Progression should support specialists and hybrids rather than forcing one correct build. See [Player Progression](Player.md), [Skills](Skills.md), [Magic](Magic.md), and [Quest System](Quests.md).

**Shared-world consequence.** PvE, PvP, reputation, raids, and trade should connect rather than sit in separate modes. Helping a settlement, attacking a rival base, defeating a regional threat, or angering a faction should affect what opportunities and risks appear later. The main social-conflict systems are outlined in [Reputation System](Reputation-system.md) and [Raids](Raids.md).

## Core Player Loop

Players begin in a race-appropriate capital city where they can learn basic systems, meet vendors and trainers, accept early quests, and use costly portal travel between major hubs. From there, the loop expands outward:

1. Prepare gear, supplies, party roles, and route information.
2. Travel into the wilderness to gather resources, hunt creatures, explore landmarks, or pursue quests.
3. Survive biome-specific hazards, enemy encounters, inventory limits, and navigation challenges.
4. Return to a safe location to craft, trade, build, train, repair, and make social decisions.
5. Use improved skills, equipment, reputation, and map knowledge to push into more dangerous regions.

The loop should scale naturally from solo play to guild activity. A solo player might maintain a small hidden outpost and specialize in cartography or crafting. A small group might defend a frontier village and control a useful trade route. A large guild might build a fortress, organize raids, and contest world bosses or rare resource zones.

## World Structure

The game world is divided into visually and mechanically distinct biomes. Each biome should offer its own travel problems, local resources, creatures, settlement patterns, and encounter tone. A [Forest](Biomes/Forest.md) should not play like a [Swamp](Biomes/Swamp.md), and a [Mountain Range](Biomes/Mountain-range.md) should change how players think about stamina, visibility, shelter, and base placement.

Verticality is part of the identity of the world. Players should be able to descend into caves and ruins, cross surface wilderness, climb dangerous ridges, sail or dive through water spaces, and eventually reach aerial spaces such as the [Floating Islands](Biomes/Floating-islands.md). This supports long-term exploration without relying only on a larger flat map.

## Creatures And Encounters

Creatures are not only enemies; they are part of the ecology, economy, and story of each region. Smaller animals create ambience and hunting opportunities, while major creatures such as the [Royal Dragon](Creatures/Royal-dragon.md), [Kraken](Creatures/Kraken.md), [Treant](Creatures/Treant.md), and [Flying Leviathan](Creatures/Flying-leviathan.md) can anchor memorable regional events. The bestiary begins at [Creatures](Creatures.md).

Encounters should reward preparation and observation. A player who understands terrain, weather, creature behavior, and local resources should have more options than a player who treats every fight as a simple damage race.

## Settlements And Social Play

Capital cities act as safe hubs for early progression, trade, training, portals, and social gathering. Smaller settlements, camps, ruins, and dungeons create structure across the wilderness. Player-built settlements should eventually become part of that same landscape, giving groups reasons to defend places, negotiate access, or relocate when pressure becomes too great.

The design should support cooperation without making it mandatory for every activity. Solo players need meaningful progression paths, while groups gain efficiency, security, and access to larger ambitions such as raids, boss hunts, and settlement warfare.

## Technical Direction

The game targets Unreal Engine 5 and assumes a distributed server model designed for a seamless persistent world. The conceptual networking model lives in [Server Architecture](Server-architecture.md), while implementation-oriented notes live separately in [Server Architecture (Technical)](<Server-architecture (Technical).md>). Rendering and synchronization decisions should stay aligned with [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md), especially for fast-moving creatures, flying entities, and large outdoor spaces.

The monetization model is currently framed as a subscription-oriented approach, mainly to support ongoing development, live operations, and persistent infrastructure. The design should continue to avoid pay-to-win pressure, especially in systems tied to combat power, resource control, or territorial advantage.

## Documentation Index

- [World Design](World.md)
- [Biomes](Biomes/Ancient-forest.md)
- [Creatures](Creatures.md)
- [Player Progression](Player.md)
- [Player Settings](Player-settings.md)
- [Inventory System](Inventory.md)
- [Quest System](Quests.md)
- [Building System](Building-system.md)
- [Reputation System](Reputation-system.md)
- [Raids](Raids.md)
- [Magic](Magic.md)
- [Skills](Skills.md)
- [Structures](Structures.md)
- [Server Settings](Server-settings.md)
- [Server Architecture](Server-architecture.md)
- [Server Architecture (Technical)](<Server-architecture (Technical).md>)
- [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md)

## Contributing And Community

This documentation is intentionally iterative. New sections should clarify how a system feels in play, why it exists, and how it connects to the rest of the game before locking down exact names or exhaustive numbers. When a design idea grows large enough to deserve its own focused treatment, add a dedicated Markdown file and link it from the appropriate index.

Join the development discussion on Discord: https://discord.gg/PCP4quFVwE

## Continue Reading

For the high-level world structure, continue with [World Design](World.md). For character goals and progression, continue with [Player Progression](Player.md). For the large-scale backend model that makes the shared world possible, continue with [Server Architecture](Server-architecture.md).
