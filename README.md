# Project Overview

This repository is a living game-design document for a large-scale, persistent open-world survival RPG built around exploration, settlement building, social conflict, and long-term character growth. The game takes place in a single seamless world where players can leave the safety of capital cities, cross dangerous biomes, build defensible homes, discover hidden ruins, trade with other players, and take part in factional conflict without feeling pushed through isolated levels or short-session arenas.

The intended experience is a survival game with MMO scale and RPG depth, played entirely in first person. Moment-to-moment play should feel grounded and physical, seen through the character's own eyes: players gather resources, manage gear, navigate weather and terrain, fight creatures, and return to settlements with stories worth telling. Over weeks or months, those same actions feed into larger systems: reputations shift, guilds claim territory, settlements grow, trade routes become valuable, and the world remembers what players have changed.

## Design Pillars

**Seamless wilderness.** The world should feel continuous across forests, jungles, mountains, swamps, oceans, underground spaces, and floating islands. Travel is a major part of the game, so the world needs strong landmarks, dangerous routes, and reasons to revisit old regions with new tools or allies. The broader world structure is described in [World Design](World.md), with individual biomes linked from that page.

**Survival with purpose.** Survival pressure exists to create decisions, not chores. Food, resources, inventory space, shelter, and environmental hazards should shape routes and preparation while still leaving room for exploration, quests, and social play. Systems such as [Inventory](Inventory.md), [Building System](Building-system.md), and [Player Settings](Player-settings.md) support that pressure.

**Player-made footholds.** Bases, outposts, guild halls, and settlements should matter because they create safety, services, identity, and conflict. The same construction logic should support small camps and major fortified towns, while the surrounding biome affects what materials and strategies make sense. The built world is covered in [Structures](Structures.md) and [Building System](Building-system.md).

**RPG growth through action.** Characters improve by doing meaningful things: fighting, crafting, exploring, gathering, casting spells, completing quests, and contributing to group objectives. Progression should support specialists and hybrids rather than forcing one correct build. See [Player Progression](Player.md), [Skills](Skills.md), [Magic](Magic.md), and [Quest System](Quests.md).

**Play your way.** The world should make many different lives in it fully viable, not merely many character builds. One player lives as a frontier survivalist who builds, crafts, and fights for everything they own; another as a guild soldier who exists for territory and war; another as a city merchant who never raises a wall or forges a blade and earns their place by buying and selling alone. Building and crafting remain central for those who want them, but no playstyle is mandatory, and where a way of living is worth supporting the systems are built so it stands on its own rather than as a thinner version of someone else's game. See [Player Progression](Player.md) and [Economy and Trade](Economy.md).

**Shared-world consequence.** PvE, PvP, reputation, raids, and trade should connect rather than sit in separate modes. Helping a settlement, attacking a rival base, defeating a regional threat, or angering a faction should affect what opportunities and risks appear later. The main social-conflict systems are outlined in [Reputation System](Reputation-system.md) and [Raids](Raids.md).

## Core Player Loop

Players begin in a race-appropriate capital city where they can [learn the game's basic systems](New-player-experience.md), meet vendors and trainers, accept early quests, and use costly portal travel between major hubs. From there, the loop expands outward:

1. Prepare gear, supplies, party roles, and route information.
2. Travel into the wilderness to gather resources, hunt creatures, explore landmarks, or pursue quests.
3. Survive biome-specific hazards, enemy encounters, inventory limits, and navigation challenges.
4. Return to a safe location to craft, trade, build, train, repair, and make social decisions.
5. Use improved skills, equipment, reputation, and map knowledge to push into more dangerous regions.

The loop should scale naturally from solo play to guild activity. A solo player might maintain a small hidden outpost and specialize in cartography or crafting. A small group might defend a frontier village and control a useful trade route. A large guild might build a fortress, organize raids, and contest world bosses or rare resource zones. A player with no taste for any of that might never build or craft at all, living as a city merchant who profits on the goods everyone else hauls back.

## World Structure

The game world is divided into visually and mechanically distinct biomes. Each biome should offer its own travel problems, local resources, creatures, settlement patterns, and encounter tone. A [Forest](Biomes/Forest.md) should not play like a [Swamp](Biomes/Swamp.md), and a [Mountain Range](Biomes/Mountain-range.md) should change how players think about stamina, visibility, shelter, and base placement.

Verticality is part of the identity of the world. Players should be able to descend into caves and ruins, cross surface wilderness, climb dangerous ridges, sail or dive through water spaces, and eventually reach aerial spaces such as the [Floating Islands](Biomes/Floating-islands.md). This supports long-term exploration without relying only on a larger flat map.

## Creatures And Encounters

Creatures are not only enemies; they are part of the ecology, economy, and story of each region. Smaller animals create ambience and hunting opportunities, while major creatures such as the [Royal Dragon](Creatures/Royal-dragon.md), [Kraken](Creatures/Kraken.md), [Treant](Creatures/Treant.md), and [Flying Leviathan](Creatures/Flying-leviathan.md) can anchor memorable regional events. The bestiary begins at [Creatures](Creatures.md).

Encounters should reward preparation and observation. A player who understands terrain, weather, creature behavior, and local resources should have more options than a player who treats every fight as a simple damage race.

## Settlements And Social Play

Capital cities act as safe hubs for early progression, trade, training, portals, and social gathering. [Non-Player Characters](NPCs.md) give those places their daily motion, from merchants and guards to trainers, crafters, and travelling convoys. Smaller settlements, camps, ruins, and dungeons create structure across the wilderness. Player-built settlements should eventually become part of that same landscape, giving groups reasons to defend places, negotiate access, or relocate when pressure becomes too great.

The design should support cooperation without making it mandatory for every activity. Solo players need meaningful progression paths, while groups gain efficiency, security, and access to larger ambitions such as raids, boss hunts, and settlement warfare.

## Technical Direction

The game targets Unreal Engine 5 and assumes a distributed server model designed for a seamless persistent world. The conceptual networking model lives in [Server Architecture](Server-architecture.md), while implementation-oriented notes live separately in [Server Architecture (Technical)](<Server-architecture (Technical).md>). Rendering and synchronization decisions should stay aligned with [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md), especially for fast-moving creatures, flying entities, and large outdoor spaces.

The game is funded by a single subscription, with no box price and nothing that affects power ever offered for sale, and it is built for PC first with consoles kept within reach for later. The full reasoning, including the strict no-pay-to-win stance, is set out in [Monetization and Platforms](Monetization.md).

## Documentation Index

- [World Design](World.md)
- [Setting and Lore](Setting-and-lore.md)
- [Content and Tone](Content-and-tone.md)
- [Art Direction](Art-direction.md)
- [Audio Direction](Audio-direction.md)
- [UI and HUD](UI-and-HUD.md)
- [Biomes](Biomes/Ancient-forest.md)
- [Weather, Time, and Seasons](Weather-time-and-seasons.md)
- [Creatures](Creatures.md)
- [Races](Races.md)
- [Player Progression](Player.md)
- [New Player Experience](New-player-experience.md)
- [Player Settings](Player-settings.md)
- [Accessibility](Accessibility.md)
- [Survival](Survival.md)
- [Inventory System](Inventory.md)
- [Economy and Trade](Economy.md)
- [Crafting](Crafting.md)
- [Death and Loss](Death-and-loss.md)
- [Quest System](Quests.md)
- [Non-Player Characters](NPCs.md)
- [Building System](Building-system.md)
- [Reputation System](Reputation-system.md)
- [Guilds and Factions](Guilds-and-factions.md)
- [Raids](Raids.md)
- [Conflict and PvP](Conflict-and-pvp.md)
- [Magic](Magic.md)
- [Skills](Skills.md)
- [Taming and Control](Taming-and-control.md)
- [Travel and Mounts](Travel-and-mounts.md)
- [Structures](Structures.md)
- [Server Settings](Server-settings.md)
- [Server Architecture](Server-architecture.md)
- [Server Architecture (Technical)](<Server-architecture (Technical).md>)
- [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md)
- [Monetization and Platforms](Monetization.md)
- [Glossary](Glossary.md)

## Contributing And Community

This documentation is intentionally iterative. New sections should clarify how a system feels in play, why it exists, and how it connects to the rest of the game before locking down exact names or exhaustive numbers. When a design idea grows large enough to deserve its own focused treatment, add a dedicated Markdown file and link it from the appropriate index.

Join the development discussion on Discord: https://discord.gg/PCP4quFVwE

## Continue Reading

For the high-level world structure, continue with [World Design](World.md). For character goals and progression, continue with [Player Progression](Player.md). For the large-scale backend model that makes the shared world possible, continue with [Server Architecture](Server-architecture.md).
