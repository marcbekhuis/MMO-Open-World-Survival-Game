Purpose
The game requires a seamless, persistent, large-scale world that supports high player concurrency without traditional instancing barriers or loading screens. To achieve this, the game uses a cluster-based distributed server architecture, where the world is divided into simulation regions and handled collaboratively by multiple servers that dynamically scale to workload.
1. System Overview
The world is divided into a grid of 1 km × 1 km logical regions. These regions are not separate gameplay instances—players and AI can see and act beyond region boundaries—but they define who simulates what within the backend.
The server ecosystem consists of two primary layers:
Component
Function
Master Server (Control Layer)
Directs server assignment, manages player routing, and stores persistent world state.
Cluster Unit Servers (Simulation Layer)
Perform real-time gameplay simulation (players, AI, physics, combat logic) for one or more world regions.

This architecture allows the game to scale horizontally as the player population increases.
2. Master Server Responsibilities
The Master Server coordinates the cluster and acts as authoritative control over:
Region ownership map — which Cluster Unit Server controls each region.


Player routing — determining which server a player connects to upon login or region crossover.


Dynamic load balancing — reassigning regions between servers based on metrics (player count, CPU time, AI load).


Persistence — storing incremental world-state backups from simulation servers.


Failure recovery — reassigning regions and restoring last-known state if a simulation server crashes.


The Master Server does not simulate gameplay; instead, it serves as orchestration, routing, and database authority.
3. Cluster Unit Servers – Region Simulation
A Cluster Unit Server is a dedicated Unreal simulation node. Each one controls one or more contiguous world regions depending on demand:
Low-activity areas → 1 server may handle multiple regions simultaneously.


High-population hotspots → a single region may be isolated and run by its own server for performance.


Cluster Unit Servers are responsible for:
Simulating gameplay: AI behavior, physics, projectiles, player actions.


Replicating gameplay state to connected clients.


Synchronizing relevant entity data with neighboring servers (details below).


Sending periodic state snapshots to the Master Server for persistence.


Region ownership can change at runtime: if load increases, the Master Server may migrate a region to a new server, providing elastic scalability.
4. Visibility-Driven Cross-Region Synchronization
To maintain a seamless world, servers must know about gameplay occurring near region boundaries. Synchronization is visibility-based, not distance-fixed.
4.1 Entity Visibility Radius
Every network-relevant entity (player, AI, boss unit, projectile, VFX object) is assigned a maximum render/visibility distance—the furthest point it can be seen or meaningfully interacted with.
Examples:
Players & humanoid NPCs → medium radius


Large world bosses → large radius


Small projectiles → short radius


4.2 Sync Algorithm (When Data Is Shared)
For each entity inside a region:
Compute its visibility sphere based on render distance.
Test whether that sphere overlaps a neighboring region.
Optionally check if there are potential viewers in that region (players or AI with perception).
If the entity could be visible → send a lightweight snapshot of its state to that neighboring region’s server.
The neighboring server maintains this entity as a non-authoritative ghost, used only to:
Display the entity to players in that region


Allow AI to make decisions based on nearby external threats or targets


Entities fully outside visibility range to all external actors are not synchronized, conserving bandwidth and CPU.
5. Seamless Player & AI Handoff Between Regions
When a player or AI moves across a region boundary:
Before crossing, the entity’s visibility radius causes both regions to track it, meaning the new server already has a ghost copy.


Upon crossing the boundary:


The current server sends a final authoritative snapshot.


The receiving server promotes its ghost copy into a full simulation entity.


The original server destroys its version.


The client continues receiving updates without interruption.


Two connection models exist:
Model
Description
Gateway Proxy (ideal)
Client maintains one connection; routing is swapped internally by a proxy layer → completely seamless.
Silent Redirect (simpler)
Client disconnect/reconnect is masked client-side → minor background complexity, still seamless visually.

Either approach ensures there are no loading screens or invisible walls.
6. Persistence, Backups, and Recovery
World state is backed up continuously:
Cluster Unit Servers send periodic delta updates (changes only) to the Master Server.


Region transfers trigger full serialization and handoff payloads.


Persistent data saved includes:


Player inventories, stats, affiliation


AI persistent states (dead/alive, patrol changes)


Player-placed objects or environmental changes


If a simulation node fails:
The Master Server assigns its regions to a standby server


Last saved state is loaded


Players are seamlessly re-routed
7. Why This System Works
This architecture pulls from proven large-scale MMO concepts while layering a custom visibility-driven simulation model that keeps Unreal Engine performance feasible.
Benefits:
Scales dynamically — supports both quiet worlds and sudden mass-player events.


Seamless continuity — players never see transitions between regions.


Efficient bandwidth use — sync is based on visibility rather than arbitrary margins.


Supports truly massive open world gameplay — AI, combat, and world events can span many kilometers without server strain.
8. One-Paragraph Summary (for top-level section intro)
The game uses a distributed cluster server architecture where the world is divided into 1 km² simulation regions. A Master Server manages routing, persistence, and dynamic load balancing, while multiple Cluster Unit Servers simulate gameplay across regions in parallel. Servers exchange only visibility-relevant data using per-entity render distance, enabling players and AI in different regions to perceive and interact with each other. Region handoffs occur seamlessly, making the world feel unified and continuous.
