# Server Settings

This file captures operational design targets for the persistent server cluster. It should stay aligned with the conceptual model in [Server Architecture](Server-architecture.md) and the Unreal implementation notes in [Server Architecture (Technical)](<Server-architecture (Technical).md>).

## Operating Goals

The server configuration should prioritize world continuity, predictable simulation, and recoverability. Players should be able to cross region boundaries without noticing backend handoff, and the world should preserve important state changes even when individual simulation nodes fail.

## Settings To Track

The operations model should track expected concurrency per world, per hotspot, and per 1 km x 1 km simulation region. It should also define the desired simulation cadence for gameplay ticks, AI updates, physics budgets, and throttling rules for low-priority entities.

Persistence settings need to state how often player state, placed structures, AI state, and regional deltas are written to durable storage. Recovery settings should cover backup retention, failure detection thresholds, standby capacity, and acceptable rollback windows. Each Cluster Unit Server also needs clear CPU, memory, bandwidth, entity count, and replication budgets.

Large events need their own scaling expectations. Raids, world bosses, great-city gatherings, and other predictable spikes should have temporary capacity rules so the cluster can protect core simulation and persistence under pressure.

## Initial Baseline

Until production load testing produces real numbers, this document should use ranges and design intent rather than hard guarantees. A reasonable early baseline is to define normal, stressed, and emergency profiles for each region. Normal regions run full simulation. Stressed regions reduce low-priority AI and cosmetic replication. Emergency profiles protect player movement, combat authority, and persistence first, then degrade ambience and distant non-critical actors.

## Official and Community Servers

The game runs on official servers and on community servers hosted by others, and a community server can tune the game to how its players want to play. That makes one rule binding on the whole design: every number that balances the game is a default, not a constant. Rates, curves, multipliers, durations, and costs live in data that the game ships with, and a server's settings can override any of them by name when it starts, without changing the game itself. Official servers run the defaults; a community server might double experience, halve hunger, lengthen the night, or make heavy weapons easier to wield, and every system reads the overridden value in the same way.

Two practices keep that safe. First, nothing a character or a world saves stores a derived number. A character's record holds what was earned and chosen, such as experience, stat points spent per stat, and skill practice, as [Player Progression](Player.md#how-growth-is-recorded) sets out, and items, creatures, and structures are recorded the same way, so a change of settings applies to everything already in the world the next time it loads. Second, the settings are grouped and named the way a host thinks about them rather than the way the code is organised, with the most commonly changed values, such as the rates of experience, gathering, taming, hunger, thirst, and day and night, gathered together and documented for hosts, and everything finer still reachable by name for hosts who want it.

The design documents follow the same rule. Wherever they give a number, a speed in metres a second, a step cost, a duration, a rate, it is the official default and the starting point for tuning, not a fixed law of the game.

## World Rhythm

Some of the world's pacing is a server setting rather than a fixed rule, so that each world can suit its community and the design can be rebalanced without rewriting it. The lengths of day and of night are set separately, with eighty minutes of daylight and forty of night as the default under [Weather, Time, and Seasons](Weather-time-and-seasons.md). The session fatigue of [Survival](Survival.md#fatigue-and-rest) is set by how long a full bar lasts in play, eight hours by default, how long it takes to refill when the player logs out anywhere and in a bed, two hours and one by default, and how long play past empty runs before the body begins to tire.

## Handoff and Availability Budgets

Each movement class and coordinated transfer group has a preparation distance, separate forward and reverse ownership thresholds, a supported overlap extent, and an approaching-warning distance. The margin beyond the transfer threshold covers transfer completion or safe movement restriction before the simulation limit. Ownership does not expire merely because an entity remains idle in the overlap. Memory, AI, physics, persistence, and network budgets include residents retained by neighbouring-region owners.

Availability settings govern destination readiness, recovery qualification, transfer admission rate, and spare source capacity during an outage. The warning distance accounts for approach speed and group bounds across ground, water, and aerial movement. Validation measures warning lead time and movement corrections alongside transfer latency; a visible error wall must correspond to the actual enforced limit. These settings implement [Server Architecture](Server-architecture.md#5-seamless-player--ai-handoff).

## Continue Reading

Continue with [Server Architecture](Server-architecture.md), [Server Architecture (Technical)](<Server-architecture (Technical).md>), and [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
