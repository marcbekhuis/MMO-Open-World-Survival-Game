# Server Architecture

## Purpose

The game requires a seamless, persistent, large-scale world that supports high player concurrency without traditional instancing barriers or loading screens. To achieve this it uses a cluster-based distributed server architecture, in which the world is divided into simulation regions handled collaboratively by multiple servers that scale dynamically with workload. This document is the conceptual specification; its concrete Unreal Engine 5 realisation lives in [Server-architecture (Technical)](<Server-architecture (Technical).md>), which is expected to track the concepts described here.

## 1. System overview

The world is divided into a grid of 1 km × 1 km logical regions. These regions are not separate gameplay instances — players and AI can see and act beyond region boundaries — but they define which server is authoritative for what within the backend. The ecosystem has two layers. The **Master Server** is the control layer: it directs server assignment, routes players, and stores persistent world state, but it never simulates gameplay. The **Cluster Unit Servers** are the simulation layer: each is a headless Unreal dedicated server that runs the real-time gameplay — players, AI, physics, and combat — for one or more regions. Because regions can be reassigned between servers at runtime, the architecture scales horizontally as population rises and contracts again when it falls.

## 2. Master Server responsibilities

The Master Server is the authoritative coordinator of the cluster. It maintains the region ownership map that records which Cluster Unit Server controls each region, and it routes players, deciding which server a client connects to on login and whenever it crosses into a new region. It performs dynamic load balancing by reassigning regions between servers in response to live metrics such as player count, CPU time, and AI load, and it owns persistence, storing the incremental world-state backups that simulation servers stream to it. Finally, it handles failure recovery: when a simulation node stops responding, the Master Server reassigns its regions to a standby and restores the last-known state. In short, it is orchestration, routing, and database authority — not a gameplay simulator.

## 3. Cluster Unit Servers — region simulation

A Cluster Unit Server is a dedicated Unreal simulation node responsible for one or more contiguous regions. Quiet stretches of the world can be consolidated onto a single server that owns many regions at once, while a crowded hotspot can be isolated so that one region runs on its own server for maximum performance. Each server simulates gameplay for the regions it owns, replicates that state to the clients connected to it, synchronises boundary-relevant entity data with neighbouring servers, and periodically sends state snapshots to the Master Server for persistence. Ownership of a region is not fixed: if load climbs past a threshold the Master Server can migrate a region to another server, which is what gives the system its elastic scalability.

## 4. Visibility-driven cross-region synchronisation

For the world to feel continuous, a server must know about gameplay happening just across its borders. That synchronisation is driven by visibility rather than by a fixed distance margin, so bandwidth is spent only where something could actually be perceived.

### 4.1 Entity visibility radius

Every network-relevant entity — a player, an AI, a boss, a projectile, even a persistent VFX object — is assigned a visibility radius: the furthest range at which it can be meaningfully seen or interacted with. As resting baselines, players and humanoid NPCs use a medium radius, large world bosses a long one, and small projectiles a short one.

Crucially, this radius is **not a fixed sphere**. It is velocity-aware and directional, following the adaptive model described in [Dynamic culling and render distance](Dynamic-culling-and-render-distance.md): as an entity speeds up, its radius grows and stretches forward along its direction of travel, so the entity becomes relevant earlier on its leading edge while its trailing edge stays near the baseline. Entities fall into the same three categories used for rendering. A stationary or slow entity keeps a symmetric sphere; a fast ground entity is given a forward-elongated volume scaled to its ground speed; and a fast aerial entity — the [Flying leviathan](Creatures/Flying-leviathan.md) above the [Floating Islands](Biomes/Floating-islands.md) being the clearest case — receives the largest forward extension, because it travels fastest and is usually viewed against open sky. Using one shared radius for both client rendering and server relevancy keeps what a player sees and what a server simulates in agreement.

### 4.2 Sync algorithm

For each entity inside a region the owning server computes the entity's current visibility volume — its baseline radius, grown and extended forward according to its velocity — and tests whether that volume overlaps a neighbouring region. Because the volume reaches farther ahead for fast movers, an approaching entity registers an overlap well before it arrives at the border. As an optional optimisation the server can also check whether the neighbouring region actually contains potential viewers (players, or AI with perception) before sending anything. When an entity could be visible across the boundary, the server sends a lightweight snapshot of its state to the neighbouring region's server. That server holds the entity as a **non-authoritative ghost**, used only to display the entity to its own players and to let its AI react to nearby external threats and targets. Entities that are out of visibility range to every external actor are never synchronised, which is what keeps bandwidth and CPU proportional to what players can actually perceive.

## 5. Seamless player & AI handoff

When a player or AI crosses a region boundary, authority transfers from the source server to the destination. The transfer is almost invisible precisely because of the velocity-aware radius: a fast entity's forward-extended volume causes the destination region to begin tracking it as a ghost well ahead of the crossing, so the new server already holds a current copy. At the moment of crossing, the source server sends one final authoritative snapshot, the destination server promotes its ghost into a full simulation entity, and the original server destroys its version once the handoff is acknowledged. Throughout, the client keeps receiving updates without interruption.

Two connection models support this. In the ideal **gateway proxy** model the client maintains a single connection and a proxy layer swaps the backend routing internally, so the transition is completely seamless. The simpler **silent redirect** model disconnects and reconnects the client behind a brief masking effect; it carries a little more background complexity but is still visually seamless. Either way there are no loading screens and no invisible walls.

## 6. Persistence, backups, and recovery

World state is backed up continuously. Cluster Unit Servers send periodic delta updates — changes only — to the Master Server, and a region transfer triggers a full serialisation as its handoff payload. The persisted data includes player inventories, stats, and affiliation; AI persistent state such as whether a creature is alive and any lasting changes to its behaviour; and player-placed objects or other environmental changes. If a simulation node fails, the Master Server assigns its regions to a standby server, the last saved state is loaded, and affected players are rerouted with only a brief reconnect.

## 7. Why this system works

The architecture borrows proven large-scale MMO ideas and layers on a custom visibility-driven simulation model that keeps Unreal Engine performance feasible. It scales dynamically, absorbing both quiet worlds and sudden mass-player events; it preserves seamless continuity, so players never see the seams between regions; and it uses bandwidth efficiently, because synchronisation follows per-entity visibility rather than an arbitrary fixed margin. The velocity-aware visibility radius is central to all three: it prevents pop-in for fast entities, it gives cross-region handoff the lead time it needs to stay invisible, and it ensures the cluster only ever spends resources on entities that some player or AI could genuinely perceive. The result supports genuinely massive open-world gameplay, with AI, combat, and world events spanning many kilometres without overwhelming any single server.

## 8. One-paragraph summary

The game uses a distributed cluster server architecture in which the world is divided into 1 km² simulation regions. A Master Server manages routing, persistence, and dynamic load balancing, while multiple Cluster Unit Servers simulate gameplay across regions in parallel. Servers exchange only visibility-relevant data, using a per-entity render distance that is velocity-aware and directional, so that players and AI in different regions perceive and interact with one another and so that fast-moving entities are synchronised early enough for region handoffs to stay seamless.

## Continue Reading

Continue with [Server Architecture (Technical)](<Server-architecture (Technical).md>), [Server Settings](Server-settings.md), and [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
