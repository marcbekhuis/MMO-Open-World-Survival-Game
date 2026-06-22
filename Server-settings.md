# Server Settings

This file captures operational design targets for the persistent server cluster. It should stay aligned with the conceptual model in [Server Architecture](Server-architecture.md) and the Unreal implementation notes in [Server Architecture (Technical)](<Server-architecture (Technical).md>).

## Operating Goals

The server configuration should prioritize world continuity, predictable simulation, and recoverability. Players should be able to cross region boundaries without noticing backend handoff, and the world should preserve important state changes even when individual simulation nodes fail.

## Settings To Track

The operations model should track expected concurrency per world, per hotspot, and per 1 km x 1 km simulation region. It should also define the desired simulation cadence for gameplay ticks, AI updates, physics budgets, and throttling rules for low-priority entities.

Persistence settings need to state how often player state, placed structures, AI state, and regional deltas are written to durable storage. Recovery settings should cover backup retention, failure detection thresholds, standby capacity, and acceptable rollback windows. Each Cluster Unit Server also needs clear CPU, memory, bandwidth, entity count, and replication budgets.

Large events need their own scaling expectations. Raids, world bosses, capital gatherings, and other predictable spikes should have temporary capacity rules so the cluster can protect core simulation and persistence under pressure.

## Initial Baseline

Until production load testing produces real numbers, this document should use ranges and design intent rather than hard guarantees. A reasonable early baseline is to define normal, stressed, and emergency profiles for each region. Normal regions run full simulation. Stressed regions reduce low-priority AI and cosmetic replication. Emergency profiles protect player movement, combat authority, and persistence first, then degrade ambience and distant non-critical actors.

## Continue Reading

Continue with [Server Architecture](Server-architecture.md), [Server Architecture (Technical)](<Server-architecture (Technical).md>), and [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
