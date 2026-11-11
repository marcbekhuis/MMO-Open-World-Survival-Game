# Server Settings

This file sets the operational design targets for the persistent server cluster, in step with the conceptual model in [Server Architecture](Server-architecture.md) and the Unreal implementation notes in [Server Architecture (Technical)](<Server-architecture (Technical).md>).

## Operating Goals

The server configuration puts world continuity, predictable simulation, and recoverability first. Players cross region boundaries without noticing the handoff behind them, and the world keeps every important change even when a simulation node fails.

## Settings To Track

The operations model tracks concurrency per world, per hotspot, and per 1 km × 1 km simulation region and each of its split pieces, together with the simulation cadence for gameplay ticks, AI updates, physics budgets, and the throttling of low-priority entities. Every Cluster Unit Server has explicit CPU, memory, bandwidth, entity-count, and replication budgets.

Persistence settings state how often positions and other replayable state are written to durable storage; everything that moves value is written at once, as [Server Architecture](Server-architecture.md#72-value-never-splits) requires, so it has no interval to set. Recovery settings cover backup retention, failure-detection thresholds, standby capacity, and recovery qualification. Each world has a population cap, and a full world is answered by opening another, as [Server Architecture](Server-architecture.md#9-scale-and-running-cost) describes. During early access a world also carries its wipes: whether and when a wipe happens is a setting of the world, and what a wipe resets is fixed, everything, the world and every character with its levels and skills. The wipes end on a declared day, after which the world is persistent and nothing is lost.

## Hotspot Workloads and Degradation

Player counts alone do not describe a hotspot. Capacity is measured against representative workloads, each with its building pieces, affected targets, effect fan-out, AI, physics relationships, persistence throughput, and stacked vertical spaces alongside its players:

- a great-city market at its busiest hour, with traders, guards, residents, and auctions;
- a siege under [Raids and Conquest](Raids.md) against a base near its piece ceiling, with siege engines, fire, and a collapse cascade;
- a naval boss fight, with ships, a [Kraken](Creatures/Kraken.md) gripping one of them, and riders overhead;
- a mobile settlement on a [Flying Leviathan](Creatures/Flying-leviathan.md) crossing a busy border with its occupants and cargo;
- a battle fought at once on the ground and in the air above a cavern system with its own ecosystem;
- a world-boss fight with the boss's long-range presence across about a hundred regions.

Until load tests produce real numbers, these workloads are budgeted in ranges and design intent rather than guarantees. They set the thresholds of the cluster's response to a crowd, which runs in a fixed order. A seam fight that fits on one server is brought onto one server. A region one server cannot hold is split into quarters or height bands while servers are free and the split pays for its seams. Only then does the region degrade through three profiles. A normal region runs full simulation. A stressed region sheds cosmetic effects and ambient life, then the update rate of low-priority AI, then the replication rate of distant entities. An emergency region that is alone on its server, migrated there by the Master when a server is free, slows its clock by time dilation, to a floor of a quarter of normal speed by default, and at that floor holds new arrivals at its edge. Time dilation works on a whole server process, so a region that shares its server, and every region of a single-server map, has none: its emergency profile goes straight from shedding to holding new arrivals at the edge. City-guard protection, attack warnings, hostiles within weapon range, and persistence are never shed in any profile. The mechanism is set out in [Server Architecture](Server-architecture.md#63-hotspots-and-graceful-degradation).

## Official and Community Servers

The game runs on official servers and on community servers hosted by others, and a community server can tune the game to how its players want to play. That makes one rule binding on the whole design: every number that balances the game is a default, not a constant. Rates, curves, multipliers, durations, and costs live in data that the game ships with, and a server's settings can override any of them by name when it starts, without changing the game itself. Official servers lock their settings to the defaults and cannot be changed by anyone but the studio; a community server might double experience, halve hunger, lengthen the night, or make heavy weapons easier to wield, and every system reads the overridden value in the same way.

Two practices keep that safe. First, nothing a character or a world saves stores a derived number. A character's record holds what was earned and chosen, such as experience, stat points spent per stat, and skill practice, as [Player Progression](Player.md#how-growth-is-recorded) sets out, and items, creatures, and structures are recorded the same way, so a change of settings applies to everything already in the world the next time it loads. Second, the settings are grouped and named the way a host thinks about them rather than the way the code is organised, with the most commonly changed values, such as the rates of experience, gathering, taming, hunger, thirst, and day and night, gathered together and documented for hosts, and everything finer still reachable by name for hosts who want it.

The design documents follow the same rule. Wherever they give a number, a speed in metres a second, a step cost, a duration, a rate, it is the official default and the starting point for tuning, not a fixed law of the game.

A community host runs the same cluster software as the official servers, not a cut-down version of it. The [Master Server and Cluster Unit Servers](Server-architecture.md#3-cluster-unit-servers--region-simulation) are the same pieces, and a [Cluster Unit Server](Glossary.md) may own one region or many, so a single one can own every region and simulate the whole seamless world on its own, which is all a small private community needs. Adding more Cluster Unit Servers never changes what the world is; it only raises how many players the world can hold at once. Players need the same single subscription to join a community server as an official one, as [Monetization and Platforms](Monetization.md#a-single-subscription) sets out. A character belongs to the world it was made in: characters never move between official and community worlds, so a tuned server's rates cannot leak into the official economy.

## World Rhythm

Some of the world's pacing is a server setting rather than a fixed rule, so that each world can suit its community and the design can be rebalanced without rewriting it. The lengths of day and of night are set separately, with eighty minutes of daylight and forty of night as the default under [Weather, Time, and Seasons](Weather-time-and-seasons.md). The session fatigue of [Survival](Survival.md#fatigue-and-rest) is set by how long a full bar lasts in play, eight hours by default, how long it takes to refill when the player logs out anywhere and in a bed, two hours and one by default, and how long play past empty runs before the body begins to tire.

## Handoff and Availability Budgets

Each movement class and coordinated transfer group has a preparation distance, separate forward and reverse ownership thresholds, a supported overlap extent, and an approaching-warning distance. The margin beyond the transfer threshold covers transfer completion or safe movement restriction before the simulation limit. Ownership does not expire merely because an entity remains idle in the overlap. Memory, AI, physics, persistence, and network budgets include residents retained by neighbouring-region owners.

Availability settings govern destination readiness, recovery qualification, transfer admission rate, and spare source capacity during an outage. The warning distance accounts for approach speed and group bounds across ground, water, and aerial movement. Validation measures warning lead time and movement corrections alongside transfer latency; a visible error wall must correspond to the actual enforced limit. These settings implement [Server Architecture](Server-architecture.md#5-seamless-player--ai-handoff).

## Continue Reading

Continue with [Server Architecture](Server-architecture.md), [Server Architecture (Technical)](<Server-architecture (Technical).md>), and [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
