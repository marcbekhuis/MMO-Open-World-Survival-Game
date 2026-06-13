Project overview

This repository captures the design and systems for a large-scale, persistent open-world survival RPG. The project centers on a single seamless world that supports both survival-oriented play (resource gathering, base-building, and survival mechanics) and RPG-style progression (quests, trading, character growth).

Key goals
- Seamless exploration across diverse biomes and vertical layers (underground, surface, and floating islands)
- Scalable server architecture to support hundreds or thousands of concurrent players
- Meaningful PvE and PvP systems, including base raids and large-scale conflicts
- Deep player progression with craft, skills, magic, and social mechanics

Engine & monetization
- Primary engine: Unreal Engine 5 (chosen for its rendering and large-world tooling)
- Monetization model (design placeholder): subscription to support ongoing development and large-scale persistent infrastructure

Player experience
- Players begin in a capital city appropriate to their chosen race and may pursue survival, crafting, exploration, or story-driven gameplay.
- Capital cities include large portals that can transfer players between cities; using these portals has a deliberate gameplay cost to balance convenience (see Structures/Capital.md).

Documentation index
- [World Design](World.md)
- [Biomes](Biomes/Ancient-forest.md)
- [Creatures](Creatures.md)
- [Player Progression](Player.md)
- [Inventory System](Inventory.md)
- [Quest System](Quests.md)
- [Building System](Building-system.md)
- [Reputation System](Reputation-system.md)
- [Raids](Raids.md)
- [Magic](Magic.md)
- [Skills](Skills.md)
- [Structures](Structures.md)
- [Server Architecture](Server-architecture.md)
- [Server Architecture (Technical)](<Server-architecture (Technical).md>)
- [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md)

Contributing & community
- Join the development discussion on Discord: https://discord.gg/PCP4quFVwE

Notes
- This documentation is a living design document. Many sections are placeholders or sketches that will be expanded as the design matures. Files marked with TODO comments indicate places where your feedback or additional detail would be especially helpful.