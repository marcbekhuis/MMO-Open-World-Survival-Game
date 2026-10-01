# Server Architecture

The game requires a seamless, persistent, large-scale world that supports high player concurrency without traditional instancing barriers or loading screens. To achieve this it uses a cluster-based distributed server architecture, in which the world is divided into simulation regions handled collaboratively by multiple servers that scale dynamically with workload. This document is the conceptual specification; its concrete Unreal Engine 5 realisation lives in [Server-architecture (Technical)](<Server-architecture (Technical).md>), which is expected to track the concepts described here.
<!-- REVIEW(investor): The design only works at full population density (dead shared world = no one pays) and a bespoke UE5 distributed cluster is the most expensive way to run an MMO — add a stageability answer (smaller/denser launch, single-shard cap) and directional run-cost awareness. -->

## 1. System overview

The world is divided into a grid of 1 km × 1 km logical regions. These regions are not separate gameplay instances — players and AI can see and act beyond region boundaries — but they define which server is authoritative for what within the backend. The ecosystem has two layers. The **Master Server** is the control layer: it directs server assignment, routes players, and stores persistent world state, but it never simulates gameplay. The **Cluster Unit Servers** are the simulation layer: each is a headless Unreal dedicated server that runs the real-time gameplay — players, AI, physics, and combat — for one or more regions. Because regions can be reassigned between servers at runtime, the architecture scales horizontally as population rises and contracts again when it falls.

## 2. Master Server responsibilities

The Master Server is the authoritative coordinator of the cluster. It maintains the region ownership map that records which Cluster Unit Server controls each region, and it routes players to their recorded simulation owners on login and after committed handoffs. It performs dynamic load balancing by reassigning regions between servers in response to live metrics such as player count, CPU time, and AI load, and it owns persistence, storing the incremental world-state backups that simulation servers stream to it. Finally, it handles failure recovery: when a simulation node stops responding, the Master Server reassigns its regions to a standby and restores the last-known state. In short, it is orchestration, routing, and database authority — not a gameplay simulator.

## 3. Cluster Unit Servers — region simulation

A Cluster Unit Server is a dedicated Unreal simulation node responsible for one or more contiguous regions. Quiet stretches of the world can be consolidated onto a single server that owns many regions at once, while a crowded hotspot can be isolated so that one region runs on its own server for maximum performance. Each server simulates gameplay for the regions it owns, replicates that state to the clients connected to it, synchronises boundary-relevant entity data with neighbouring servers, and periodically sends state snapshots to the Master Server for persistence. Ownership of a region is not fixed: if load climbs past a threshold the Master Server can migrate a region to another server, which is what gives the system its elastic scalability.

## 4. Visibility-driven cross-region synchronisation

For the world to feel continuous, a server must know about gameplay happening just across its borders. That synchronisation is driven by visibility rather than by a fixed distance margin, so bandwidth is spent only where something could actually be perceived.

### 4.1 Entity visibility radius

Every network-relevant entity — a player, an AI, a boss, a projectile, even a persistent VFX object — is assigned a visibility radius: the furthest range at which it can be meaningfully seen or interacted with. As resting baselines, players and humanoid NPCs use a medium radius, large world bosses a long one, and small projectiles a short one.

Crucially, this radius is **not a fixed sphere**. It is velocity-aware and directional, following the adaptive model described in [Dynamic culling and render distance](Dynamic-culling-and-render-distance.md): as an entity speeds up, its radius grows and stretches forward along its direction of travel, so the entity becomes relevant earlier on its leading edge while its trailing edge stays near the baseline. Entities fall into the same three categories used for rendering. A stationary or slow entity keeps a symmetric sphere; a fast ground entity is given a forward-elongated volume scaled to its ground speed; and a fast aerial entity — a flying mount at full speed, or a [Flying leviathan](Creatures/Flying-leviathan.md) in one of its short bursts — receives the largest forward extension, because it travels fastest and is usually viewed against open sky. Size is a separate matter from speed: the leviathan drifts slowly most of the time, but its 80-metre body is visible from very far away, so it takes the long, world-boss baseline radius rather than depending on look-ahead. Using one shared radius for both client rendering and server relevancy keeps what a player sees and what a server simulates in agreement.

### 4.2 Sync algorithm

For each entity inside a region the owning server computes the entity's current visibility volume — its baseline radius, grown and extended forward according to its velocity — and tests whether that volume overlaps a neighbouring region. Because the volume reaches farther ahead for fast movers, an approaching entity registers an overlap well before it arrives at the border. As an optional optimisation the server can also check whether the neighbouring region actually contains potential viewers (players, or AI with perception) before sending anything. When an entity could be visible across the boundary, the server sends a lightweight snapshot of its state to the neighbouring region's server. That server holds the entity as a **non-authoritative ghost**, used only to display the entity to its own players and to let its AI react to nearby external threats and targets. Entities that are out of visibility range to every external actor are never synchronised, which is what keeps bandwidth and CPU proportional to what players can actually perceive.

## 5. Seamless player & AI handoff

Movable entities transfer between servers within a bounded simulation overlap around a region boundary. The region grid assigns responsibility for the world, while each entity has one recorded simulation owner. Inside the overlap that owner can differ from the server assigned to the entity's geographic region. The owner continues gameplay simulation and neighbours hold non-authoritative ghosts. Crossing between regions already owned by the same server requires no inter-server transfer.

### 5.1 Stable ownership inside the overlap

Separate forward and reverse transfer thresholds create a deadband, also called hysteresis. An entity arriving from one region keeps its current owner while it remains inside that band, including when it stands still, circles, or repeatedly crosses the map's region line. A transfer becomes eligible only when it moves beyond the threshold toward the destination and that destination is ready. After transfer, returning ownership requires movement beyond the opposite threshold, back toward the previous region. There is no idle timeout that forces a stationary entity to alternate between servers.

The overlap is distinct from the visibility volume. Visibility prepares ghosts at a distance; the simulation overlap defines where an existing owner can safely continue movement and gameplay using loaded world content. Transfer thresholds sit inside that safe area, leaving room to finish a transfer or stop further travel. Fast movers receive earlier preparation and warning. Their speed does not continually move the ownership thresholds beneath them. Region corners select one destination at a time, and an entity has at most one active handoff. Deliberate load balancing and failure recovery use explicit ownership changes rather than repeatedly reclassifying an entity from its position.

### 5.2 Coordinated transfers

The source retains authority while the destination loads the required content and prepares the complete gameplay state. Authority changes at a coordinated cutover; preparation and ghost creation alone never grant ownership. The source retires its authoritative copy after the committed transfer, retaining a ghost where its players still need to see the entity. Movement, health, inventory, active effects, and AI state survive the transfer.

A mount and rider, or a vehicle with its passengers and attached cargo, transfer as one coordinated group. The destination prepares the whole group and its relationships before cutover. Group membership is checked again before commitment so boarding, dismounting, death, or detachment during preparation cannot duplicate or strand a member. Nearby players and enemies remain independent entities; proximity alone does not join them into a transfer group.

The client connection must preserve gameplay continuity through the ownership change. The [technical guide](<Server-architecture (Technical).md#73-client-connection-continuity>) treats connection migration as a dedicated networking responsibility alongside gameplay-state transfer.

### 5.3 Unavailable destinations and visible feedback

If the destination is unavailable, the source keeps simulating entities it still owns within its loaded, bounded overlap. It admits no movement beyond the space it can safely simulate. A player approaching that travel limit sees a translucent holographic error wall with a short message explaining that the region is temporarily unavailable. The warning appears early enough to turn or slow down and becomes more pronounced on approach. The wall marks the actual travel limit, which can lie beyond the nominal region line, and follows the unavailable edge across ground, water, and aerial routes.

The server enforces the limit for movement, including vehicles, AI, and forced displacement. Players can move along the limit or retreat into available space; the display does not grant invulnerability, clear combat, or make the visible wall a climbable world object. Existing combat and effects continue wherever authoritative simulation remains available. Entities already owned by a failed destination follow crash recovery; the neighbouring source does not acquire them merely because it has ghosts.

The restriction clears only when the destination can accept gameplay and handoffs again. Recovery leaves idle overlap residents with their current owners until an ordinary transfer is warranted. Presentation and accessibility details live in [UI and HUD](UI-and-HUD.md#unavailable-region-feedback).

## 6. Persistence, backups, and recovery

World state is backed up continuously. Cluster Unit Servers send periodic delta updates — changes only — to the Master Server, and a region transfer triggers a full serialisation as its handoff payload. The persisted data includes player inventories, stats, and affiliation; AI persistent state such as whether a creature is alive and any lasting changes to its behaviour; and player-placed objects or other environmental changes. If a simulation node fails, the Master Server assigns its regions to a standby server, the last saved state is loaded, and affected players are rerouted with only a brief reconnect.

## 7. Why this system works

The architecture borrows proven large-scale MMO ideas and layers on a custom visibility-driven simulation model that keeps Unreal Engine performance feasible. It scales dynamically, absorbing both quiet worlds and sudden mass-player events; it preserves seamless continuity, so players never see the seams between regions; and it uses bandwidth efficiently, because synchronisation follows per-entity visibility rather than an arbitrary fixed margin. The velocity-aware visibility radius is central to all three: it prevents pop-in for fast entities, it gives cross-region handoff the lead time it needs to stay invisible, and it ensures the cluster only ever spends resources on entities that some player or AI could genuinely perceive. The result supports genuinely massive open-world gameplay, with AI, combat, and world events spanning many kilometres without overwhelming any single server.

## 8. One-paragraph summary

The game uses a distributed cluster server architecture in which the world is divided into 1 km² simulation regions. A Master Server manages routing, persistence, and dynamic load balancing, while multiple Cluster Unit Servers simulate gameplay across regions in parallel. Servers exchange only visibility-relevant data, using a per-entity render distance that is velocity-aware and directional, so that players and AI in different regions perceive and interact with one another and so that fast-moving entities are synchronised early enough for region handoffs to stay seamless.

## Continue Reading

Continue with [Server Architecture (Technical)](<Server-architecture (Technical).md>), [Server Settings](Server-settings.md), [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md), [UI and HUD](UI-and-HUD.md), and the [Design Backlog](Design-backlog.md) for the remaining boundary and recovery decisions.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
