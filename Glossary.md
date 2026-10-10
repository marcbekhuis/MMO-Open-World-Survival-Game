# Glossary

This glossary defines the recurring archetype terms the design relies on, so the same vocabulary means the same thing across every document. It records roles and concepts rather than proper nouns: the world's canonical names for specific cities, regions, and factions are deliberately left open at this stage, in line with the naming guidance in [AGENTS.md](AGENTS.md). Extend this list whenever a new archetype term enters the design, keeping each definition generic and consistent with how the term is used elsewhere.

## World and geography

**Seamless world** — the single continuous space the game takes place in, with no loading walls between forests, mountains, swamps, underground spaces, water, and aerial regions. The overall structure is described in [World design](World.md).

**Biome** — a visually and mechanically distinct stretch of the world with its own resources, creatures, hazards, settlement patterns, and travel problems. Biomes live under `Biomes/`, beginning at [Ancient forest](Biomes/Ancient-forest.md).

**Region** — a one-square-kilometre geographic unit assigned to a single server in the cluster model. Inside a boundary overlap, an entity's simulation owner can differ from the server assigned to its geographic region. In gameplay prose, "region" also means a broad stretch of one biome, as in "one Kraken per region"; that sense is unrelated to server boundaries, and the server sense applies in the server documents. See [Server architecture](Server-architecture.md).

**Landmark** — a dominant, recognizable feature that anchors navigation and memory within a place, letting players orient themselves and describe routes.

**Frontier** — the vast wilderness beyond the realms' farmland and road towns, always reachable but too dangerous to settle until adventurers arrived in large numbers. NPC settlement there is sparse, leaving its ground to whoever can build on it and hold it, and it is the stage on which the central conflict plays out. See [Setting and lore](Setting-and-lore.md) and [Conflict and PvP](Conflict-and-pvp.md).

**Heartland** — the settled interior of a realm, where great cities, their farm belts, farming hamlets, villages, and towns lie close together and the countryside thins out toward the frontier. See [Structures](Structures.md#how-settlements-spread).

## Settlements and structures

**Great city** — a city of capital scale where players begin, train, trade, and organise: a safe city with trainers, banking, markets, and a portal. Each playable people has several. Some are the seat of a realm, but most are not. See [Great cities](Structures/Great-cities.md).

**Capital** — the seat of a realm's ruler. A capital is usually also a great city, but the two terms are not interchangeable: "capital" names a political role, "great city" names a size and a set of services.

**Farm belt** — the ring of farmland around a great city, worked by farmers who walk out to their fields each day. See [Structures](Structures.md#how-settlements-spread).

**Farming hamlet** — a cluster of a few houses, perhaps with a chapel or a smithy, founded by farmers whose fields lie too far from a city for a daily walk, and feeding that city along the roads. See [Structures](Structures.md#how-settlements-spread).

**Independent settlement** — a settlement that answers to no realm, such as an outlaw town, a bandit camp, a trapper camp, or a hermit hold. Most of the frontier's few NPC settlements are independent. See [Structures](Structures.md#independent-settlements).

**Settlement** — any inhabited place along the scale from a temporary camp to a fortified town, player-built or pre-placed. Settlements are gathered under [Structures](Structures.md).

**Settlement blueprint** — the dataset behind an NPC settlement: its layout, people and realm, settlement type, target residents, housing capacity, and service quotas. See [Settlement generation](Settlement-generation.md).

**Lot** — a building plot in a settlement layout, carrying a fixed building shape. A landmark lot never changes; a function-pinned lot keeps its purpose but rolls its look; every other lot rolls freely. See [Settlement generation](Settlement-generation.md#fixed-layout-rolled-buildings).

**Shape, function, style, variant** — the four levels a building on a lot is chosen in: the fixed massing, then what the building is for, then how its people dress it, then the small details such as doors, interior layout, roof additions, alleys, and underpasses. Each level may not change what the level above has fixed. See [Settlement generation](Settlement-generation.md#the-building-blueprint-hierarchy).

**Service quota** — the share of residents one building of a function serves, with the minimum and maximum a settlement holds. See [Settlement generation](Settlement-generation.md#the-settlement-blueprint).

**World seed** — the value a game world receives at creation, from which every settlement roll in that world follows. See [Settlement generation](Settlement-generation.md#rolling-a-settlement).

**Outpost** — a small, often hidden foothold that provides safety and limited services away from the great cities, well suited to solo players and frontier groups.

**Guild hall** — a group's home structure and organizing point for shared activity, territory, and identity.

**Base** — the general word for a player-built holding of any size, from a hidden cabin to a fortified keep, where a player or group stores goods, crafts, and defends against raids. An outpost, a guild hall, and a settlement are particular kinds or scales of what a base can be: the outpost is a small, often hidden foothold, the guild hall is a group's home structure, and a settlement is an inhabited place on the scale from camp to town, whether player-built or pre-placed. Goods banked in a base are safe from a death in the field but not from a raid. See [Building system](Building-system.md) and [Raids and Conquest](Raids.md).

**Station / workshop** — a station is a piece of crafting infrastructure, such as a forge, tannery, alchemy bench, or cooking fire, that enables its own kind of work, and the better the station the better the goods it supports. A workshop is a structure built around one or more stations, and settlements provide stations of their own for players who have none. See [Crafting](Crafting.md) and [Building system](Building-system.md).

**Portal** — a costly fast-travel link between great cities, priced so that ordinary travel and trade remain the normal way to move goods and project power. Its toll and limits are set out in [Travel and mounts](Travel-and-mounts.md#portals-and-express-routes); see also [Great cities](Structures/Great-cities.md).

**Dungeon** — a contained, hazard-dense site that concentrates risk and reward away from the open world. See [Dungeons](Structures/Dungeons.md).

## Organisations and society

**Faction** — an NPC-run power in the world, whether a realm, a settlement, a sworn order, or a wild dominion, whose attitude toward a player is tracked as standing. See [Guilds and factions](Guilds-and-factions.md) and the [Reputation system](Reputation-system.md).

**Guild** — a player-run organisation with a shared name, membership, and home structure, ranging from a small band to a territory-holding power. See [Guilds and factions](Guilds-and-factions.md).

**Realm** — a kingdom or comparable power belonging to one of the three playable peoples. Each people is divided among several realms, which expand into the frontier and contest it with one another as readily as with other peoples. See [Races](Races.md) and [Setting and lore](Setting-and-lore.md).

**Adventurer** — one who works the frontier for a living: scouting, clearing lairs, guarding, and bringing back what no farmer can grow. Once the dangerous trade of a few NPCs, it is now the calling of the players, whose numbers are what make the frontier settleable. See [Setting and lore](Setting-and-lore.md#the-age-of-adventurers).

**Territory** — a stretch of frontier that a guild holds and defends, along with the resource nodes, trade routes, and defensible building sites on it. Territory is never wholly secure: it is kept only as long as the holder can answer a raid. See [Guilds and factions](Guilds-and-factions.md) and [Conflict and PvP](Conflict-and-pvp.md).

**Standing** — how a single faction, settlement, or region regards a player, built up by helping, trading, and keeping agreements and worn down by theft, killing, raiding, and betrayal. Standing is tracked separately for each party, so a player can be a hero in one place and a villain in another. See [Reputation system](Reputation-system.md).

**Local reputation / global reputation** — local reputation is the standing a player holds with an individual faction, settlement, or region. Global reputation is the broader pattern of their behaviour, which reaches places that have never met them through rumour, faction reports, visible titles, bounties, and public achievements. See [Reputation system](Reputation-system.md).

**Bounty** — a reward posted for the death of a player whose notoriety has made them a wanted name. Bounties are one of the penalties of bad reputation and give rise to bounty hunters. See [Reputation system](Reputation-system.md) and [Conflict and PvP](Conflict-and-pvp.md).

## Conflict, loss, and economy

**Safe city** — a great city held by NPC guards strong enough to suppress player aggression within its bounds, serving as a haven for respawn, trade, crafting, and training. See [Conflict and PvP](Conflict-and-pvp.md).

**Full loot** — the rule that a player killed by another player leaves a corpse the victor may strip entirely, equipped gear included. See [Death and loss](Death-and-loss.md).

**Corpse run** — the trip a player makes back to their corpse to recover what they dropped on death, before the recovery window closes or another player reaches it first. See [Death and loss](Death-and-loss.md).

**Recovery window** — the period for which a fallen player's corpse persists in the world so that it can be reclaimed. The corpse run is the race to reach the corpse within this window, against the wear on equipment, the perishables the world claims meanwhile, and any player who finds the body first. See [Death and loss](Death-and-loss.md).

**Sink** — any mechanism that permanently removes currency or goods from the economy, such as repair, upkeep, taxes, tolls, and loss on death, used to counter the inflation a persistent world would otherwise suffer. See [Economy and trade](Economy.md).

## Character and survival

**Starting tendency** — the opening lean a race gives a character, in early attributes, affinities, and the city they first wake in. It is a head start rather than a ceiling, because stats and skills earned in play matter far more over a character's life than race does. See [Races](Races.md).

**Gear-driven inventory** — the storage rule that a character begins with no general-purpose inventory slots and must equip items to gain them, so that carrying capacity depends on the gear worn and chosen. See [Inventory](Inventory.md).

**Bag slot** — the single equipment slot for a main bag or backpack, the primary source of portable storage. Only one can be equipped at a time. See [Inventory](Inventory.md).

**Hand slots** — the two unrestricted slots in which a character can carry or manipulate items even without a proper container. See [Inventory](Inventory.md).

**Pouch** — a small storage container for lightweight essentials such as food, coins, arrows, reagents, or tools, usually supplied by a belt, pants, bandolier, or similar gear. A pouch adds convenience rather than bulk capacity. See [Inventory](Inventory.md).

## Creatures and magic

**Elder beast / mythic creature** — one of the primordial creatures older than any realm, born with the world rather than salvaged from its collapse, such as the Stone Giant, the Titan Turtle, and the Royal Dragon. They are treated as pieces of the world's own myth rather than monsters to be farmed, and the great mythic creatures such as the Kraken and the Flying Leviathan are counted among the wild's own powers. See [Setting and lore](Setting-and-lore.md), [Stone Giant](Creatures/Stone-giant.md), and [Titan Turtle](Creatures/Titan-turtle.md).

**Apex creature** — the top predator of a biome, which hunts and is not hunted there, such as the Kraken in the deep ocean. The term describes a creature's place in its habitat, not its size, so a gentle elder beast is not an apex creature. See [Kraken](Creatures/Kraken.md).

**World boss** — a very large, singular creature whose encounter is of world-event scale rather than a routine fight. The server documents give it a long visibility radius, around 5 km against roughly 1,5 km for a player, so that it can be seen from afar. See [Server architecture](Server-architecture.md) and [Dynamic culling and render distance](Dynamic-culling-and-render-distance.md).

**Tell** — the readable cue a creature gives just before an attack, which a watchful player can answer. A wolf drops its tail and rolls its shoulders low before a lunge, and the Kraken slaps a wet arm across the deck before it closes. See [Wolf](Creatures/Wolf.md) and [Kraken](Creatures/Kraken.md).

**Strike window** — the opening in a fight when a dangerous creature exposes a vulnerable point and attacks against it count for the most. The Kraken's window comes when it raises an eye to watch its prey, and fire into the eye stuns and wounds it in ways no blade on the arms can. See [Kraken](Creatures/Kraken.md).

**Bonding** — the control a player keeps over a tamed creature, which must be actively maintained rather than granted permanently by taming. There are three methods: slave bonding forces obedience through coercion and is the easiest and most dangerous, parental bonding raises a creature from birth or near birth and gives the strongest control, and trust bonding earns a wild creature's trust through consistent care and is the slowest. See [Taming and control](Taming-and-control.md).

**Bond strength** — how firmly a creature is under its handler's control. The stronger the bond, the better the creature answers commands and the more readily it follows guidance into danger it would otherwise refuse, while a fraying bond leaves its own instincts in charge. See [Taming and control](Taming-and-control.md).

**Mana** — the magical force that casters spend and that quickens the world's elder creatures. It wells from the living world itself rather than from the gods, and it is the resource that gates spellcasting and spells such as the Item Box. See [Setting and lore](Setting-and-lore.md) and [Magic](Magic.md).

**Mana crystal** — a mineral that holds concentrated mana. The indestructible foundation crystals keep the floating islands aloft and cannot be mined, while smaller, less stable crystals can be harvested for enchanting and high-tier crafting. Stone Giants draw their lifeblood from crystals in the mountains. See [Floating islands](Biomes/Floating-islands.md) and [Stone Giant](Creatures/Stone-giant.md).

**Leyline** — one of the currents of the world's own force from which magic wells. Magic runs strongest in leyline-rich places, which elves are drawn to and where much of the frontier's wealth lies. See [Setting and lore](Setting-and-lore.md) and [Elf](Races/Elf.md).

**Foundation spell** — one of the common spells that trainers, field manuals, and early discoveries make broadly accessible, of which a new caster learns only a small selection. Foundation spells stay useful through upgrades that change delivery, area, reliability, or interaction with the world. See [Magic](Magic.md).

**Advanced spell** — a spell that unlocks when a player reaches thresholds in one or more prerequisite spells, within one element or across several, and that builds on the foundation vocabulary with greater power or a narrower purpose. See [Magic](Magic.md).

**Upgrade point** — the reward a spell earns as casting levels it, spent on upgrades to attributes such as size, speed, damage, duration, mana efficiency, cooldown, stability, or secondary effects. See [Magic](Magic.md).

**Upgrade direction** — a build choice an upgrade point is spent on, such as more slots, lower mana drain, or preservation for the Item Box. Each direction trades depth in one spell against everything else the points could buy. See [Magic](Magic.md) and [Item Box](Magic/Spells/Misc/Item-box.md).

**Item Box** — a late-game mage spell that gives the caster a private pocket of magical space reachable by the caster alone. Its contents sit outside carry weight and never appear on the corpse after death, and the cost is mana: a significant sum to open it, a continuous drain while items are stored, and a finite number of slots. See [Item Box](Magic/Spells/Misc/Item-box.md) and [Death and loss](Death-and-loss.md).

## Server and technical

**Master Server** — the coordinating server that oversees the cluster and the division of labour between the region servers. See [Server architecture](Server-architecture.md).

**Cluster Unit Server** — a simulation server assigned one or more regions, responsible for their world simulation and the entities it authoritatively owns. See [Server architecture](Server-architecture.md).

**Ghost entity** — a read-only stand-in for an entity whose simulation owner is another server, shown where relevant so play stays seamless across region boundaries. See [Server architecture (Technical)](<Server-architecture (Technical).md>).

**Visibility-driven synchronization** — the rule that an entity is replicated to a client only when it is relevant to that client's view, keeping bandwidth and load manageable at world scale.

**Simulation owner** — the single server authorised to advance an entity's gameplay state. A movable entity keeps its current owner while it remains between the overlap's directional transfer thresholds. See [Server architecture](Server-architecture.md).

**Overlap band** — the bounded area around a region boundary in which neighbouring servers maintain the loaded world state needed to support continued simulation and prepare a handoff. Presence in the overlap does not give an entity multiple simulation owners. See [Server architecture](Server-architecture.md).

**Handoff hysteresis** — the use of separate forward and reverse transfer thresholds inside an overlap band, so standing still or moving slightly around a boundary does not repeatedly change an entity's owner. See [Server architecture](Server-architecture.md).

**Region handoff** — the coordinated transfer of simulation ownership to the server assigned to the destination region once the directional threshold is crossed and the destination is ready. Mounts and riders, and vehicles and their passengers, transfer together as coordinated groups. See [Server architecture](Server-architecture.md).

**World Partition** — the Unreal Engine 5 system for streaming a large world in cells, applied in [Server architecture (Technical)](<Server-architecture (Technical).md>).

**Replication Graph** — the Unreal Engine 5 system for scaling network replication by controlling which actors replicate to which connections.

## Continue Reading

See [AGENTS.md](AGENTS.md) for the naming and writing conventions, [README.md](README.md) for the project index, and [Server architecture](Server-architecture.md) for the systems several of these terms come from.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
