# Glossary

This glossary defines the recurring archetype terms the design relies on, so the same vocabulary means the same thing across every document. It records roles and concepts rather than proper nouns: the world's canonical names for specific cities, regions, and factions are deliberately left open at this stage, in line with the naming guidance in [SHARED-INSTRUCTIONS.md](SHARED-INSTRUCTIONS.md). Extend this list whenever a new archetype term enters the design, keeping each definition generic and consistent with how the term is used elsewhere.

## World and geography

**Seamless world** — the single continuous space the game takes place in, with no loading walls between forests, mountains, swamps, underground spaces, water, and aerial regions. The overall structure is described in [World design](World.md).

**Biome** — a visually and mechanically distinct stretch of the world with its own resources, creatures, hazards, settlement patterns, and travel problems. Biomes live under `Biomes/`, beginning at [Ancient forest](Biomes/Ancient-forest.md).

**Region** — a one-square-kilometre unit of the world owned by a single server in the cluster model, and the unit across which entities are handed off as players move. See [Server architecture](Server-architecture.md).

**Landmark** — a dominant, recognizable feature that anchors navigation and memory within a place, letting players orient themselves and describe routes.

## Settlements and structures

**Capital / capital city** — a principal, race-appropriate hub where players spawn, train, trade, and organize, and the safe anchor for early progression. See [Capital cities](Structures/Capital.md).

**Settlement** — any inhabited place along the scale from a temporary camp to a fortified town, player-built or pre-placed. Settlements are gathered under [Structures](Structures.md).

**Outpost** — a small, often hidden foothold that provides safety and limited services away from the capitals, well suited to solo players and frontier groups.

**Guild hall** — a group's home structure and organizing point for shared activity, territory, and identity.

**Portal** — a costly fast-travel link between capitals, priced so that ordinary travel and trade remain the normal way to move goods and project power. See [Capital cities](Structures/Capital.md).

**Dungeon** — a contained, hazard-dense site that concentrates risk and reward away from the open world. See [Dungeons](Structures/Dungeons.md).

## Server and technical

**Master Server** — the coordinating server that oversees the cluster and the division of labour between the region servers. See [Server architecture](Server-architecture.md).

**Cluster Unit Server** — the authoritative server for a single region, responsible for the entities and simulation within it.

**Ghost entity** — a read-only stand-in for an entity owned by a neighbouring region, shown near a boundary so play stays seamless across the seam. See [Server architecture (Technical)](<Server-architecture (Technical).md>).

**Visibility-driven synchronization** — the rule that an entity is replicated to a client only when it is relevant to that client's view, keeping bandwidth and load manageable at world scale.

**Region handoff** — the seamless transfer of authority over an entity from one region server to the next as it crosses a boundary.

**World Partition** — the Unreal Engine 5 system for streaming a large world in cells, applied in [Server architecture (Technical)](<Server-architecture (Technical).md>).

**Replication Graph** — the Unreal Engine 5 system for scaling network replication by controlling which actors replicate to which connections.

## Continue Reading

See [SHARED-INSTRUCTIONS.md](SHARED-INSTRUCTIONS.md) for the naming and writing conventions, [README.md](README.md) for the project index, and [Server architecture](Server-architecture.md) for the systems several of these terms come from.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
