# Building a Cluster-Based Distributed Server Architecture in Unreal Engine 5

A technical design and implementation research guide based on the [Server Architecture specification](Server-architecture.md).

## Research Baseline and Engine Evolution

Unreal Engine **5.8.4** is the current research baseline for this architecture, confirmed by [Epic's hotfix announcement](https://forums.unrealengine.com/t/5-8-4-hotfix-released/2842775) of 20 October 2026. The work remains at the design stage. Existing code and configuration examples serve as implementation sketches; each requires validation against this baseline before development, and their presence does not establish build compatibility or measured performance. The replication, multi-server, and time-dilation facts in sections 5, 7.3, and 11 were checked on 30 October 2026 against Epic's 5.8 documentation and against the engine source and plugin descriptors of the installed [5.8.3 hotfix](https://forums.unrealengine.com/t/5-8-3-hotfix-released/2833315); where the two disagree, the installed engine's behaviour is what this guide follows, and the disagreement is stated where it matters. The 5.8.4 hotfix lists no networking, replication, or dedicated-server changes, so those checks carry over to the baseline.

The design also prepares for migration to Unreal Engine 6. [Epic's published roadmap](https://www.unrealengine.com/news/the-road-to-ue-6), checked on 5 September 2026, targets Early Access at the end of 2027 and a full release 12–18 months later. It describes a Verse-based Scene Graph framework and research into automatically distributing gameplay and persistent state across servers. These are evolving capabilities whose suitability for this game's standalone server architecture must be evaluated when available.

The migration boundary separates gameplay rules and durable data from their engine integration. Entity identity, ownership rules, combat outcomes, inventory transactions, and saved-state formats are specified independently of Unreal object instances and replication channels. Engine-specific integration handles actor representation, replication, world streaming, and client connections through replaceable interfaces. Saved data and inter-server messages carry explicit schema versions so migration can transform and validate state. A UE6 implementation is assessed against the same requirements for continuity, combat fairness, persistence, and recovery as the UE5 implementation; engine migration requires compatibility and load testing before adoption.

---

## Table of Contents

- [Research Baseline and Engine Evolution](#research-baseline-and-engine-evolution)

1. [Architecture Overview](#1-architecture-overview)
2. [UE5 Foundation: World Partition & Server Streaming](#2-ue5-foundation-world-partition--server-streaming)
3. [Master Server Implementation](#3-master-server-implementation)
4. [Cluster Unit Servers — UE5 Dedicated Server Setup](#4-cluster-unit-servers--ue5-dedicated-server-setup)
5. [Replication: Visibility-Driven Sync](#5-replication-visibility-driven-sync)
6. [Cross-Region Entity Synchronization](#6-cross-region-entity-synchronization)
7. [Seamless Player & AI Handoff](#7-seamless-player--ai-handoff)
8. [Persistence, Delta Backups & Crash Recovery](#8-persistence-delta-backups--crash-recovery)
9. [Cross-Server Combat and Timed Effects](#9-cross-server-combat-and-timed-effects)
10. [Shared World State and Backend Services](#10-shared-world-state-and-backend-services)
11. [Hotspots: Splitting, Joining, and Degradation](#11-hotspots-splitting-joining-and-degradation)
12. [Infrastructure & Orchestration](#12-infrastructure--orchestration)
13. [Performance Considerations & Known Limitations](#13-performance-considerations--known-limitations)
14. [Recommended Tech Stack Summary](#14-recommended-tech-stack-summary)

---

## 1. Architecture Overview

The target architecture divides the game world, one seamless map of about 80 × 80 km per cluster (6 400 regions), into **1 km × 1 km simulation regions**, each a full vertical column, with every dungeon a separate domain. Each region is owned by a **Cluster Unit Server** (a headless UE5 dedicated server process), which may own one region, many, or every region in the world, and a busy region can be split into quarters or height bands owned by different servers. A **Master Server** (non-UE, purpose-built) sits above the cluster and manages routing, the cluster clock, and load balancing over a transactional **world database**. Clients reach the cluster through a **gateway** that holds one connection per player for the whole session.

```
   Clients ── one connection each ──▶ ┌───────────────────────────────┐
                                      │  GATEWAY  (proxy net drivers) │
                                      └──────┬──────────────┬─────────┘
                                   primary   │              │  neighbour routes
          ┌──────────────────────────────────┼──────────────┼───────────┐
          ▼                                  ▼              ▼           │
   ┌─────────────┐                    ┌─────────────┐ ┌─────────────┐   │
   │  Cluster    │   Ghost sync,      │  Cluster    │ │  Cluster    │   │
   │  Unit Srv A │◀── hit claims, ──▶ │  Unit Srv B │ │  Unit Srv C │   │
   │  (Regions   │   perception       │  (Region 3  │ │  (Regions   │   │
   │   0,1,2)    │   events           │   — hot)    │ │   4,5,6,7)  │   │
   └──────┬──────┘                    └──────┬──────┘ └──────┬──────┘   │
          │        Inter-server messaging (NATS)             │          │
          └──────────────────────────┬───────────────────────┘          │
                                     ▼                                  │
┌─────────────────────────────────────────────────────────────────────┐ │
│ MASTER SERVER: region map | routing | cluster clock | load balancer │◀┘
└───────────────┬────────────────────────────────────┬────────────────┘
                ▼                                    ▼
     ┌─────────────────────┐            ┌─────────────────────────────┐
     │ WORLD DATABASE      │            │ SOCIAL SERVICE              │
     │ (PostgreSQL: commits│            │ (parties, guilds,           │
     │  ownership, value)  │            │  permissions, ownership)    │
     └─────────────────────┘            └─────────────────────────────┘
```

This document explains how each layer is built using UE5-native tools, with the custom Master Server, gateway, and social service alongside.

---

## 2. UE5 Foundation: World Partition & Server Streaming

### 2.1 World Partition

World Partition is UE5's built-in system for streaming open-world content. Every new UE5 level has it enabled by default. It divides the world into a spatial grid of cells and streams them in/out based on proximity to streaming sources (usually `PlayerController`).

**Enabling World Partition:**

1. Create your map in UE5 (`File → New Level → Open World`).
2. In the **World Settings** panel, confirm `World Partition` is enabled.
3. Set a streaming cell size suited to the content. A 1 km cell is a reasonable starting point, but streaming cells, ownership regions, and replication cells are three independent grids (see the [spec](Server-architecture.md#32-domains-and-dungeons)), and nothing in the ownership code may assume they align:

```ini
; WorldSettings (or DefaultEngine.ini)
[/Script/Engine.WorldSettings]
WorldPartitionGridSize=100000   ; 100,000 cm = 1 km
```

4. Place actors normally — World Partition automatically assigns them to cells.

Each dungeon domain is its own World Partition map with its own coordinate space, loaded alongside the overworld on the server that owns it; the threshold link between them is a handoff edge (section 7.1), not a level transition.

### 2.2 Server Streaming (Critical for Dedicated Servers)

By default, dedicated servers load the **entire world** into memory. For a large open world this is unsustainable. UE5.1+ introduced a CVar specifically to fix this:

```ini
; DefaultEngine.ini on your dedicated server build
[ConsoleVariables]
wp.Runtime.EnableServerStreaming=1
```

This tells the server to stream world cells based on player positions — only zones where players are active are loaded. This is essential for keeping RAM use manageable across a large world, and it is why a single Cluster Unit Server can own every region of a quiet world.

**Server-side streaming sources must be explicitly registered.** The `PlayerController` registers itself automatically as a streaming source, but if you want AI, vehicles, or other entities to force cell loading, you must add `UWorldPartitionStreamingSourceComponent` to them:

```cpp
// In your AI Controller or Pawn constructor
UWorldPartitionStreamingSourceComponent* StreamingSource =
    CreateDefaultSubobject<UWorldPartitionStreamingSourceComponent>(
        TEXT("StreamingSourceComponent"));
StreamingSource->TargetBehavior = EStreamingSourceTargetBehavior::Include;
StreamingSource->Radius = 150000.0f; // 1.5 km load radius
```

### 2.3 One File Per Actor (OFPA)

Enable OFPA in your project settings for collaborative workflows and to prevent map-file merge conflicts:

```
Project Settings → World Partition → Use External Actors → ON
```

Each actor is stored as its own asset, making source control tractable on large worlds with multiple developers.

---

## 3. Master Server Implementation

The Master Server is **not** a UE5 process. It is a purpose-built backend service responsible for orchestration, not gameplay. Use a lightweight language and framework here — UE5 introduces unnecessary overhead for this layer. It holds no commit state in memory: every ownership change and every exchange of value is decided by a transaction in the world database (section 8.4), so a Master restart loses nothing but in-flight routing decisions, which are re-derived from the database.

### 3.1 Recommended Stack

| Concern | Tool |
|---|---|
| Master Server runtime | Go, Node.js, or Rust |
| Control-plane protocol | gRPC or WebSocket (persistent connections) |
| Region ownership map | World database table, cached in memory and in Redis |
| Player session leases | World database row with fencing generation, cached in Redis |
| World state DB | PostgreSQL (multi-row ACID transactions for ownership and value) |
| Social service | Separate stateless service over the same PostgreSQL cluster |
| Client gateway | Fork of Unreal's `UProxyNetDriver` (section 7.3) |
| Cluster orchestration | Kubernetes or Amazon GameLift |

PostgreSQL is the world database because value-moving commits touch several rows at once (a corpse, its items, two inventories) and must succeed or fail together. A wide-column store can take the high-volume position deltas if write volume demands it, but never the ownership or value transactions.

### 3.2 Region Ownership Map

The Master Server maintains a map of every region, and every split piece of a region, to the server currently responsible for it. A region key carries the domain, the 1 km cell, and the split path: a list of quadrant choices for horizontal splits and an optional height band for a vertical split.

```go
// Pseudocode: Master Server region table
type DomainID uint32 // 0 = overworld; one ID per dungeon

type RegionKey struct {
    Domain    DomainID
    X, Y      int32
    Quadrants []uint8 // 0..3 per horizontal split level; empty = whole region
    Band      int8    // -1 = whole column; otherwise height-band index
    BandMinZ, BandMaxZ float64
}

type RegionEntry struct {
    ServerID    string
    Generation  uint64  // ownership generation, bumped on every reassignment
    CPULoad     float32
    PlayerCount int
    Available   bool
    AvailabilityRevision uint64
}

var regionMap = map[RegionKey]*RegionEntry{}
```

The authoritative copy is a table in the world database; the Master's in-memory map and the Redis copy are caches rebuilt from it. Cluster Unit Servers report their load metrics every 1–5 seconds over the control-plane connection. The Master Server uses this to decide whether to migrate, split, join, or consolidate regions (section 11).

### 3.3 Player Routing

Login routing uses authenticated saved state and the authoritative entity-owner record. The region map supplies the default destination for a new entity; an existing overlap resident remains routed to its recorded simulation owner even when its position lies in a neighbour's geographic region, and a sleeping character is routed to the owner of the region it sleeps in (section 7.6). Client-reported position does not establish ownership. Movement handoffs update routing only after a committed ownership change, and retries resolve the same entity and transfer identity.

Routing is carried out by the gateway: the Master tells it which server is primary for a player and which neighbour servers it should hold routes to, and the gateway changes them without the client reconnecting. The continuity requirements are in [section 7.3](#73-client-connection-continuity).

### 3.4 Dynamic Load Balancing

The Master Server monitors per-server metrics and acts on them in a fixed order: consolidate quiet regions onto fewer servers, bring a seam fight onto one server where it fits, migrate a whole region to a less loaded server, split a region that one server cannot hold, and only then degrade (section 11). Example migration triggers:

```
Trigger conditions (example thresholds):
  - Server CPU sustained >80% for 30 seconds
  - Player count in region >120
  - AI entity count in region >500
```

When a region migrates:

1. Master Server selects a target standby server.
2. Instructs the current owner to serialize the region and send a **full handoff payload**.
3. Target server loads the payload; the ownership change commits in the world database with a new generation (section 8.4).
4. Master Server updates the region map and tells the gateway to move affected players' primary routes.

---

## 4. Cluster Unit Servers — UE5 Dedicated Server Setup

### 4.1 Building a Dedicated Server

UE5 dedicated servers run headlessly — no renderer, no audio. Build a dedicated server binary from your project:

```bash
# From your UE5 source/engine install
./Engine/Build/BatchFiles/RunUAT.sh BuildCookRun \
  -project="/path/to/YourGame.uproject" \
  -noP4 -platform=Linux \
  -serverconfig=Development \
  -server -serverplatform=Linux \
  -cook -build -stage -pak -archive \
  -archivedirectory="/output/path"
```

Launch with:

```bash
./YourGameServer \
  -server \
  -log \
  -port=7777 \
  -MasterAddr=master.internal:9000   # custom arg parsed in GameMode
```

### 4.2 Region Assignment at Startup

A Cluster Unit Server starts empty, registers with the Master Server, and receives its region assignments over the control plane; assignments change at runtime as regions migrate, split, and join, so they are never fixed by launch arguments.

```cpp
void AYourGameMode::InitGame(const FString& MapName,
                              const FString& Options,
                              FString& ErrorMessage)
{
    Super::InitGame(MapName, Options, ErrorMessage);

    const FString MasterAddr =
        UGameplayStatics::ParseOption(Options, TEXT("MasterAddr"));

    RegionManager = NewObject<URegionManagerComponent>(this);

    // Register with the Master Server; it answers with an initial set of
    // RegionKeys and their ownership generations, and later pushes changes.
    MasterServerClient->RegisterServer(MasterAddr, GetServerPort(),
        FOnRegionsAssigned::CreateUObject(RegionManager,
            &URegionManagerComponent::ApplyAssignments));
}
```

### 4.3 Tick Rate & Net Update Frequency

For an MMO-scale server, the default UE5 tick rate (30 Hz) is usually acceptable. Tune per-actor `NetUpdateFrequency` based on importance:

```cpp
// In your character constructor
NetUpdateFrequency      = 30.0f;  // Players: 30/s
MinNetUpdateFrequency   = 10.0f;  // Floor to prevent stalls

// In AI pawn constructor
NetUpdateFrequency      = 10.0f;  // AI: 10/s is fine
MinNetUpdateFrequency   = 2.0f;

// For large bosses visible at distance
NetUpdateFrequency      = 5.0f;   // Low freq, high priority
```

Under Iris, objects that do not use push-model dirtiness are polled at their `NetUpdateFrequency`, so these values keep their meaning ([Migrate to Iris](https://dev.epicgames.com/documentation/en-us/unreal-engine/migrate-to-iris-in-unreal-engine)).

---

## 5. Replication: Visibility-Driven Sync

UE5's default net relevancy checks every actor against every connection every tick — an O(actors × connections) problem. For an MMO this is unacceptable. The architecture builds on **Iris**, Epic's replication system, whose spatial filters and prioritisers replace that per-connection scan, with the **Replication Graph** kept as a documented fallback. The two cannot be combined: a net driver uses one or the other, and Epic's migration page states that Iris has no equivalent of graph nodes and that its filters and prioritisers are intended to replace the Replication Graph's functionality.

The choice rests on three facts. Epic's [5.8 release notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes) call Iris production-ready for licensees and pair it with Scene Graph integration, which is the road to UE6. Its 5.8 documentation pages still label it Experimental, and the installed 5.8.3 plugin descriptor marks it Beta, the same status as the Replication Graph plugin. Epic staff stated in [January 2026](https://forums.unrealengine.com/t/replicationgraph-future/2697160) that the Replication Graph is not being deprecated, so the fallback stays supported. Iris is therefore adopted behind a prototype gate: the gate passes when the adaptive cull of section 5.4, the Building System's fast-array base replication, the Character Movement Component's moves under 150 milliseconds of latency, and the gateway of section 7.3 all run correctly on Iris at the population targets in [Server Settings](Server-settings.md). If it fails, section 5.7 is the path, and nothing outside this section changes.

### 5.1 Enabling Iris

Iris is compiled into a module through its build rules and switched on at runtime. The 5.8 documentation also describes a `bUseIris` switch in the target rules; the 5.8.3 UnrealBuildTool no longer has it, and `SetupIrisSupport` defines `UE_WITH_IRIS` itself.

```json
// YourGame.uproject
"Plugins": [ { "Name": "Iris", "Enabled": true } ]
```

```csharp
// YourGame.Build.cs
SetupIrisSupport(Target);
```

```ini
; DefaultEngine.ini
[SystemSettings]
net.Iris.UseIrisReplication=1
net.SubObjects.DefaultUseSubObjectReplicationList=1   ; required by Iris
net.IsPushModelEnabled=1
net.Iris.PushModelMode=1
```

`BaseEngine.ini` already allows Iris on the game net driver (`IrisNetDriverConfigs=(NetDriverDefinition=GameNetDriver, bCanUseIris=true)`) and excludes the demo driver. Iris supports existing `FFastArraySerializer` definitions, such as the Building System's base pieces, and offers the native `FIrisFastArraySerializer`; dormancy behaves as in the generic system ([Migrate to Iris](https://dev.epicgames.com/documentation/en-us/unreal-engine/migrate-to-iris-in-unreal-engine)).

### 5.2 Spatial Filtering

Spatially filtered objects use the default `Spatial` filter, which `BaseEngine.ini` defines as `UNetObjectGridWorldLocFilter` with `UNetObjectGridFilterConfig`. The grid filter honours each actor's `NetCullDistanceSquared`, and with `bUseExactCullDistance` (on by default) it tests the true distance rather than treating a whole cell as relevant ([Iris Filtering](https://dev.epicgames.com/documentation/en-us/unreal-engine/iris-filtering-in-unreal-engine)).

Two engine defaults must be raised for this world. `UWorldLocationsConfig` clamps all replicated positions to about ±10,5 km around the origin and warns about any cull distance above 1,5 km, which the 5 km world-boss radius exceeds.

```ini
[/Script/IrisCore.NetObjectGridFilterConfig]
CellSizeX=50000.0            ; 500 m filter cells: a replication grid, not the ownership grid
CellSizeY=50000.0
DefaultCullDistance=150000.0 ; 1.5 km for actors without their own value
bUseExactCullDistance=true

[/Script/IrisCore.WorldLocationsConfig]
MinPos=(X=-2000000.0,Y=-2000000.0,Z=-500000.0)   ; size to the world, ±20 km here
MaxPos=(X=2000000.0,Y=2000000.0,Z=500000.0)
MaxNetCullDistance=600000.0  ; 6 km: world-boss radius plus forward extension
```

### 5.3 Per-Entity Visibility Radius

This maps directly to the spec's "Entity Visibility Radius" concept. Each actor class defines its own `NetCullDistanceSquared` — the square of the maximum distance from a client's viewpoint at which the actor is relevant — which the grid filter respects. The values below are *resting* baselines for stationary or slow actors; the adaptive system in section 5.4 scales them upward at runtime as an entity accelerates:

```cpp
// In your actor constructor (C++)

// Small projectile — short radius
NetCullDistanceSquared = 40000.f * 40000.f;   // 400 m

// Player / humanoid NPC — medium radius
NetCullDistanceSquared = 150000.f * 150000.f; // 1.5 km

// World boss — large radius (presence tier beyond 1.5 km, section 6.4)
NetCullDistanceSquared = 500000.f * 500000.f; // 5 km
```

### 5.4 Adaptive, Velocity-Aware Cull Distance

The baselines above are static per class, but the [Dynamic culling & adaptive render distance](Dynamic-culling-and-render-distance.md) design calls for a radius that grows and stretches forward as an entity speeds up. Net relevancy is fundamentally **radial** — it tests the straight-line distance between the actor and the connection's view position — so there is no built-in directional cull. The architecture realises the design in two layers: a speed-scaled radial cull that every entity uses, and an optional directional refinement for the cases that need it.

Iris provides a per-object override for exactly this: `UReplicationSystem::SetCullDistanceOverride` sets an object's cull distance temporarily in place of its `NetCullDistanceSquared`, and `ClearCullDistanceOverride` returns it to the class value. The speed-scaled layer runs on the authoritative server:

```cpp
// UAdaptiveNetCullComponent — ticks on the server (authority) only.
void UAdaptiveNetCullComponent::TickComponent(float DeltaTime, /*...*/)
{
    AActor* Owner = GetOwner();
    const float Speed = Owner->GetVelocity().Size(); // cm/s

    // BaseRadius is the resting value from 5.3. ModeFactor encodes the three
    // categories: 0 = stationary, ~1 = ground movement, ~3 = flying movement.
    const float LookAheadSeconds = 1.5f;
    float Radius = BaseRadius + Speed * LookAheadSeconds * ModeFactor;
    Radius = FMath::Clamp(Radius, BaseRadius, MaxRadius);

    if (FMath::IsNearlyEqual(Radius, LastRadius, 100.0f)) // 1 m hysteresis
    {
        return;
    }
    LastRadius = Radius;

    UReplicationSystem* RepSystem =
        UE::Net::FReplicationSystemUtil::GetReplicationSystem(Owner);
    UEngineReplicationBridge* Bridge =
        UE::Net::FReplicationSystemUtil::GetActorReplicationBridge(Owner);
    const UE::Net::FNetRefHandle Handle = Bridge->GetReplicatedRefHandle(Owner);

    if (Radius <= BaseRadius + 1.0f)
    {
        RepSystem->ClearCullDistanceOverride(Handle);
    }
    else
    {
        RepSystem->SetCullDistanceOverride(Handle, Radius);
    }
}
```

The speed-scaled radius grows symmetrically, which is robust but slightly wasteful behind a fast mover. For a true forward-elongated volume, a custom `UNetObjectFilter` biases the effective radius by how closely the viewer lies along the entity's heading. Epic's filtering page recommends dynamic filters only as a last resort because of their CPU cost, so this filter is assigned by class only to fast flyers, where the waste of a symmetric radius is largest:

```cpp
// Approximate an elongated volume: full radius ahead, base radius to the sides/rear.
bool UForwardBiasedFilter::IsRelevantTo(const FVector& ViewLocation,
                                        const FVector& EntityLocation,
                                        const FVector& Velocity) const
{
    const FVector ToViewer = ViewLocation - EntityLocation;
    const float   Distance = ToViewer.Size();

    if (Velocity.IsNearlyZero())
        return Distance <= BaseRadius;

    // 1.0 when the viewer is directly ahead of the entity, 0.0 to the sides/behind.
    const float Ahead = FMath::Clamp(
        FVector::DotProduct(ToViewer.GetSafeNormal(), Velocity.GetSafeNormal()),
        0.0f, 1.0f);

    const float EffectiveRadius = FMath::Lerp(BaseRadius, ForwardRadius, Ahead);
    return Distance <= EffectiveRadius;
}
```

### 5.5 Client-Side Render Distance

Server relevancy decides what a client is *told about*; the client still applies its own draw-distance culling to what it already has. Mirror the same three categories on the client so the visual fade matches the network behaviour, and always clamp the client's draw distance at or below the entity's server relevancy radius — a client can never draw an entity that was never replicated to it.

Per-primitive draw distance is set at runtime with `UPrimitiveComponent::SetMaxDrawDistance`, which updates the component's `CullDistance`:

```cpp
// On the owning client, scale a primitive's draw distance with its owner's speed.
const float Draw = FMath::Min(
    BaseDraw + OwnerSpeed * 1.5f * ModeFactor,  // mirror the server's look-ahead
    ServerRelevancyRadius);                      // never exceed what was replicated
PrimitiveComp->SetMaxDrawDistance(Draw);
```

For static, non-replicated set dressing — rocks, props, foliage — prefer **Cull Distance Volumes**, which assign size-based draw distances to actors in a level with no per-frame logic. Reserve the dynamic `SetMaxDrawDistance` path for the moving entities that actually benefit from it, such as a flying mount at speed, or a [Flying Leviathan](Creatures/Flying-leviathan.md), whose 80-metre body stays visible from far away across open sky and so takes the long, world-boss radius class of section 5.3 as its baseline instead of relying on speed look-ahead.

### 5.6 Prioritisation

When bandwidth to a connection runs short, Iris prioritisers decide what goes first. `BaseEngine.ini` makes `USphereNetObjectPrioritizer` the default, which ranks objects by distance between an inner and an outer radius; `USphereWithOwnerBoostNetObjectPrioritizer` raises a connection's own objects, and `UNetObjectCountLimiter` caps how many objects of a class replicate per frame ([Iris Prioritization](https://dev.epicgames.com/documentation/en-us/unreal-engine/iris-prioritization-in-unreal-engine)). The player's own pawn and mount use the owner boost; presence-tier ghosts (section 6.4) use a low static priority, so under pressure a distant silhouette updates less often while nearby threats never do. Entities that carry an attack warning, such as the strike marker of [Thunder](Magic/Spells/Lightning/Thunder.md), are prioritised above everything except the player's own pawn, because the degradation rules never shed a warning (section 11.3).

### 5.7 Replication Graph Fallback

If the Iris gate fails, the same design runs on the [Replication Graph](https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine). Enable the `ReplicationGraph` plugin, add `"ReplicationGraph"` to the module's dependencies, and register a custom graph:

```ini
[/Script/OnlineSubsystemUtils.IpNetDriver]
ReplicationDriverClassName="/Script/YourGame.YourReplicationGraph"
```

The custom graph adds an always-relevant actor list and a `UReplicationGraphNode_GridSpatialization2D` (still present in the 5.8.3 headers) with its `CellSize` set to the replication grid and its `SpatialBias` set to the world's minimum corner, routing every non-always-relevant actor to the grid in `RouteAddNetworkActorToNodes`. The adaptive cull of section 5.4 then writes `Info.Settings.SetCullDistanceSquared` on the actor's `FGlobalActorReplicationInfo` and re-buckets the actor in the grid node; the stock `UBasicReplicationGraph` does not support changing cull distance per actor at runtime and is an example only. Without either Iris or a Replication Graph, a relevancy change takes effect only when the actor's channel closes and reopens, which makes per-tick updates impractical. For very large worlds, set world bounds explicitly so the grid does not log `GetCellInfoForActor: Actor is outside world bounds. Clamping grid location.`

---

## 6. Cross-Region Entity Synchronization

This is the most custom part of the architecture — UE5 has no built-in mechanism for authoritative data to flow from one dedicated server process to another. You implement this as an **inter-server messaging layer**. Epic's experimental [Multi-server Replication](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/MultiServerReplication) plugin connects server processes to one another through online beacons (`UMultiServerNode`), and its proxy driver is the basis of the gateway in section 7.3, but its server-to-server path carries custom RPCs rather than ghosts, so the ghost, claim, and event protocols below are the game's own.

### 6.1 Ghost Entity Protocol

When a Cluster Unit Server detects that an entity's visibility radius overlaps a neighbouring region, it sends a lightweight **ghost snapshot** to that neighbour over the messaging layer (NATS, or a direct UDP channel between servers in the same data centre). Snapshots carry only public state, the state anyone nearby could perceive; section 6.6 lists what never leaves the owner.

```
Ghost Snapshot Message (full tier at the entity's NetUpdateFrequency,
presence tier at about 2 Hz):
{
  EntityID:        uint64,
  OwnerServer:     string,
  OwnerGeneration: uint64,   // rejects snapshots from a superseded owner
  Region:          RegionKey,
  Tier:            uint8,    // 0 = full, 1 = presence
  Position:        FVector,
  Rotation:        FRotator,
  Velocity:        FVector,
  PoseID:          uint16,   // animation state for remote presentation
  StateFlags:      uint32,   // alive/dead, combat state, visible condition
  ClusterTime:     float64
}
```

### 6.2 Visibility Overlap Detection

Each Cluster Unit Server runs a per-tick pass to determine which of its entities could be perceived in neighbouring regions. The receivers are deduplicated by server, so an entity whose radius covers six regions owned by two servers sends two snapshots, not six.

```cpp
void URegionManagerComponent::TickVisibilityBroadcast(float DeltaTime)
{
    for (AActor* Entity : GetSimulatedEntities())
    {
        // VisRadius reflects the adaptive, velocity-scaled cull distance of 5.4.
        const float   VisRadius = GetEffectiveCullDistance(Entity);
        const FVector Location  = Entity->GetActorLocation();

        // Bias the test volume forward along velocity so a fast entity overlaps
        // the neighbouring region — and seeds its ghost there — earlier, which
        // is what gives the seamless handoff in section 7 its lead time.
        const FVector Velocity    = Entity->GetVelocity();
        const FVector ForwardBias = Velocity.IsNearlyZero()
            ? FVector::ZeroVector
            : Velocity.GetSafeNormal() * (VisRadius * 0.5f);

        const FVector Center = Location + ForwardBias;
        const FBox EntityBounds(Center - FVector(VisRadius),
                                Center + FVector(VisRadius));

        TSet<FServerID> Receivers;
        for (const FRegionKey& Neighbor : RegionGrid.GetOverlappingRegions(EntityBounds))
        {
            if (IsOwnedLocally(Neighbor)) continue;

            // Players or AI with a sense that could perceive this entity.
            if (PerceiverIndex->RegionHasPerceivers(Neighbor, Entity))
            {
                Receivers.Add(RegionMap->GetOwner(Neighbor));
            }
        }

        for (const FServerID& Server : Receivers)
        {
            const float Distance = DistanceToNearestPerceiver(Entity, Server);
            const EGhostTier Tier = Distance <= InteractionBand
                ? EGhostTier::Full : EGhostTier::Presence;
            if (ShouldSendThisTick(Entity, Tier))
            {
                SendGhostSnapshot(Entity, Server, Tier);
            }
        }
    }
}
```

`RegionHasPerceivers` is answered from a perceiver index the owning servers publish once a second: per region, whether it holds players and which AI senses are active there, so an AI-only region still receives the ghost of a wolf pack it could smell. Only awake creatures count as perceivers: a dormant group publishes no senses, so a sleeping herd or pack never keeps another group awake or draws a ghost snapshot toward itself.

Waking is resolved in two passes on the same once-a-second cadence. The first wakes every group within its wake distance of a player (its senses plus a margin, 30 metres by default). The second wakes every group within its wake distance of a hostile group the first pass woke, and stops there, so waking is one step deep and cannot spread from group to group across a dense region. In networked tests at 150 milliseconds of latency, a player jogging at 3,5 metres a second woke two herds at about 88 and 90 metres and their pack one step later, and the region slept again once the player was 300 metres away.

### 6.3 Receiving Ghost Entities

The neighbouring server receives ghost snapshots and maintains them as **non-authoritative proxy actors**:

```cpp
void URegionManagerComponent::OnGhostSnapshotReceived(
    const FGhostSnapshot& Snapshot)
{
    if (!RegionMap->IsCurrentOwner(Snapshot.OwnerServer, Snapshot.OwnerGeneration))
    {
        return; // late snapshot from a superseded owner
    }

    AGhostEntity* Ghost = GhostEntityMap.FindOrCreate(Snapshot.EntityID);
    Ghost->ApplySnapshot(Snapshot);  // Updates position/state
    Ghost->SetIsGhost(true);         // Marks it as non-authoritative
    Ghost->SetTargetable(Snapshot.Tier == EGhostTier::Full);
    // Ghost is visible to players in this region but cannot be
    // modified — it receives no gameplay authority.
}
```

Ghost actors still replicate to clients in the receiving region through the ordinary replication pipeline, so players see and can attack entities that technically live on another server; the attack itself becomes a hit claim (section 9.1). When the owner's heartbeat lapses, every ghost it owns is marked stale: it freezes, is drawn greyed, stops being targetable, and is hidden after a few seconds (section 7.5).

### 6.4 Long-Range Presence and the World-Boss Budget

The presence tier exists for entities with long radii. A world boss's 5 km radius covers about 78,5 km², so its disc touches about a hundred 1 km regions once partial cells are counted. Beyond the interaction band, 1,5 km by default, those regions' servers receive a presence snapshot of about 64 bytes on the wire twice a second; inside the band they receive the full snapshot at the boss's `NetUpdateFrequency` of 5 Hz.

The worst case is every touched region on a different server. That costs the boss's owner about 100 × 2 × 64 bytes, roughly 13 KB/s, for the presence tier, and about 12 regions inside the band × 5 Hz × 160 bytes, roughly 10 KB/s, for the full tier: trivial beside a single crowded region's replication. Client bandwidth is unaffected by how many servers hold the ghost, since each client receives the boss once, from its own server. The cost that matters at a boss fight is the crowd fighting it, and that is handled by bringing the fight onto one server where it fits and splitting it where it does not (sections 9.2 and 11). These figures are the design budget; the load tests in [Server Settings](Server-settings.md#hotspot-workloads-and-degradation) replace them with measurements.

### 6.5 Perception Events and Bonds

Sound and other sensed happenings travel as one-shot events rather than ghosts, because a howl matters to listeners far beyond where its maker can be seen.

```
Perception Event Message:
{
  EventID:      uint64,     // dedupes retries
  SourceEntity: uint64,
  Kind:         uint16,     // howl, horn, collapse, song, ...
  Origin:       FVector,
  Domain:       DomainID,
  Reach:        float,      // audible or sensed radius, cm
  ClusterTime:  float64
}
```

The owner sends the event to every server whose regions inside `Reach` hold a perceiver of that sense, which applies it to its own listeners: players hear it through [Audio Direction](Audio-direction.md)'s spatial pipeline, and AI receive it as a perception stimulus. Bonds use addressed messages instead: `{TargetEntity, BondKind, Payload, ClusterTime}` is sent to the Master's ownership record for `TargetEntity` and forwarded to its current owner at any distance, which is how a [Royal Dragon](Creatures/Royal-dragon.md) learns its mate is under attack a hundred regions away. Per-viewer presentation, such as the [Mermaid](Creatures/Mermaid.md)'s glamour, is computed by the Mermaid's owner per perceiving player and sent as an addressed message to that player's owner, which replicates it only to that player's connection.

### 6.6 What Never Leaves the Owner

Inventory contents, bank and Item Box contents, skills and progression, quest state, and [Cartography](Skills/Artisan/Cartography.md) map knowledge are never in a ghost, an event, or a neighbour's memory. They live on the owning server and replicate only to the owning player's connection with an owner-only condition; the gateway forwards owner-only state from the primary route alone. Equipment worn on the body and items held in the hands are public, because anyone nearby can see them.

---

## 7. Seamless Player & AI Handoff

The [conceptual handoff rules](Server-architecture.md#5-seamless-player--ai-handoff) apply to every movable entity. The following describes the custom protocol requirements for the UE 5.8.4 research baseline; it is a design contract for implementation and validation.

### 7.1 Overlap Geometry and Hysteresis

For a shared edge, measure signed distance from its region line, positive toward region B and negative toward region A. Let H denote a transfer threshold offset and O the outer limit of safely supported overlap, with O greater than H. An A-owned entity becomes eligible for transfer to B beyond +H; a B-owned entity becomes eligible for transfer to A beyond -H. Between those thresholds, the recorded owner remains unchanged. These are separate from ghost visibility distances and prefetch triggers. The same geometry applies along the vertical axis at the boundary between height bands of a split column, and at a dungeon threshold, where the signed distance is measured through the threshold link rather than across a map line.

Choose H, O, and warning lead distance from movement speed, entity or group extent, streaming readiness, transfer latency, and available simulation capacity. Freeze the relevant geometry for an active handoff so velocity changes or small position corrections cannot move the thresholds beneath an entity. Remaining inside the deadband never causes a timer-driven transfer. Pending preparation is cancelled or revalidated if the entity turns away before commitment; a committed transfer is never undone by replaying an old acknowledgement.

Transfer selection uses the group's movement root while safety checks cover its full occupied and swept bounds. At corners, select a single reachable destination using validated movement and retain that candidate while its preparation remains valid. Each entity or group has at most one active transfer. If multiple regions belong to one process, update geographic bookkeeping without transferring between servers.

### 7.2 Preparation, Cutover, and Group State

The source maintains the current authoritative state while the destination prepares loaded content, entity representations, and client readiness. The transfer record identifies the entity or group, source and destination, unique transfer attempt, ownership generation, state schema version, and final simulation/input sequence. The handoff payload preserves transform, velocity, health, inventory, active effects, movement state, and relevant AI state, with stable entity IDs for references.

A mount and rider or vehicle, passengers, and attached cargo form a coordinated transfer group. The payload includes a versioned membership list and attachment relationships; a base built on a carrier adds its base ID, pieces, and stored contents, and everyone standing on the deck is a member. Boarding, leaving, death, or detachment changes that version; commitment requires a matching, revalidated membership snapshot. The group changes authority together, and incomplete preparation leaves it with the source. A surrounding crowd is not a transfer group, and neither is a hostile grip (section 9.2).

Cutover is one transaction in the world database:

```sql
-- Commit a transfer: succeeds only if the source still owns the group
-- at the generation it prepared with. Idempotent by transfer_id.
BEGIN;
INSERT INTO transfer_commits (transfer_id, group_id, from_server, to_server,
                              new_generation, final_sequence, payload_ref)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (transfer_id) DO NOTHING;

UPDATE entity_owner
   SET server_id = $4, generation = $5
 WHERE group_id = $2 AND server_id = $3 AND generation = $5 - 1;
-- zero rows updated → abort: another change won; the source keeps nothing new
COMMIT;
```

The payload is written to durable storage before the commit, and the commit references it. That settles every failure case. A crash of the source or destination before the commit leaves the source as owner, and recovery restores the source's state; a crash after it leaves the destination as owner, and recovery loads the committed payload. An uncertain acknowledgement is resolved by reading `transfer_commits` for the attempt rather than by retrying the transfer, and a retry with the same `transfer_id` changes nothing. A Master Server failure loses no decision, because the decision is the row. A source that has been superseded is fenced: every later write it attempts carries the old generation and is rejected by the database, and its ghosts are ignored by neighbours (section 6.3), so source cleanup never depends on an acknowledgement arriving exactly once.

### 7.3 Client Connection Continuity

Gameplay-state migration and network-connection continuity require separate handling. Unreal's [connection API](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/UNetConnection) exposes connection-specific actor channels, package mappings, and transport state, and Unreal offers no way to move a `UNetConnection` from one server process to another. Its [seamless travel](https://dev.epicgames.com/documentation/en-us/unreal-engine/travelling-in-multiplayer-in-unreal-engine) is a non-blocking map change on one server, and non-seamless travel disconnects and reconnects; neither moves a client between servers.

The gateway therefore keeps the client's connection still and moves everything behind it. It is built on `UProxyNetDriver` from Epic's experimental [Multi-server Replication](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/MultiServerReplication/UProxyNetDriver) plugin. A client sees the proxy as an ordinary server and each game server sees it as an ordinary client. For each client the proxy holds connections to game servers, one of which is the primary: it spawns the player's controller and pawn and handles their RPCs, while the others spawn a pawnless controller and replicate only what is relevant to that connection. The proxy merges what the game servers send into one world and replicates that to the client. The 5.8.3 source already contains the step this design needs: a `PendingReassign` connection state and `ReassignPlayerController`, documented in the header as handling a player controller "switching on the remote game server (i.e. during migration)".

The game forks the plugin into a project plugin and owns it, because it is Experimental and two of its defaults do not fit a cluster. As shipped, a proxy connects each client to every registered game server; the fork connects each client only to its primary and to the neighbour servers whose ghosts that player can see, as the Master directs. And the fork ties reassignment to the transfer commit of section 7.2: the primary switches only after the ownership row has changed, and the new primary's first replication of the player's pawn carries the final simulation and input sequence, so the client's saved moves are acknowledged or replayed against the new server without a gap. Owner-only state is forwarded from the primary route alone.

The acceptance criterion is continuity of movement and gameplay during ordinary handoffs, with no duplicated actor presentation and no lost inputs, measured at 150 milliseconds of latency on foot, mounted, swimming, and flying. Whether the proxy runs under Iris is not stated by Epic; its headers include Iris types, and verifying it is part of the Iris gate in section 5. The gateway is also the UE6 migration seam: if UE6 distributes simulation across servers itself, the gateway's interface is what gets replaced.

### 7.4 AI and Persistent Overlap Residents

AI transfers use the same ownership protocol and coordinated group rules, without a player connection step. Gameplay-defined state captures behaviour progress, targets, timers, and stable references; destination representations restore that state before simulation begins. Transfer does not reset aggro or grant a fresh action cycle.

An idle entity can remain in the overlap under its current owner indefinitely while that owner remains healthy and assigned to serve that overlap. Ownership records, persistence, visibility fan-out, and load accounting must represent this case explicitly instead of deriving the owner solely from position. A deliberate region reassignment inventories such residents and their transfer groups; an idle timeout is not a substitute for that migration protocol.

### 7.5 Unavailable Destinations

A failed or unready destination cannot accept a transfer. While the source remains healthy and authoritative, it continues within its loaded safe overlap and rejects movement beyond the supported travel limit. Ghost visibility alone never proves that the source has collision, navigation, world state, or capacity to simulate additional space. Entities already owned by the failed server use crash recovery rather than automatic ghost promotion.

Admission checks account for the swept bounds of fast entities, attached groups, flight, swimming, and forced displacement so they cannot skip the limit between updates. The source communicates the unavailable area, actual movement limit, and availability revision to affected clients. [UI and HUD](UI-and-HUD.md#unavailable-region-feedback) presents these as the approaching holographic error wall; the authoritative movement restriction operates independently of its rendering, consistent with Unreal's [server-authoritative networking model](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine).

Combat at the limit follows from ownership. When the failed server's heartbeat lapses, its ghosts become stale (section 6.3): untargetable, excluded from hit traces and area queries, and never the recipient of a hit claim. A projectile owned by a live server is destroyed when its next movement step would cross the travel limit, and an area effect's shape is clipped to it. Forced displacement, knockback included, is swept against the limit and stops at the contact point with no impact damage, because the limit is not a collision object in the world. Nothing about the restriction changes how live entities on the healthy side take damage.

Reopening requires loaded content, current authoritative world state, valid ownership, and admission capacity. A heartbeat alone is insufficient. Availability revisions reject stale reopen messages, and recovery qualification prevents repeated wall flicker during an unstable restart. Reopening restores eligibility for ordinary handoffs; it does not force idle residents to migrate or commit every waiting transfer simultaneously.

### 7.6 Long-Distance Transfers, Login, and Sleeping Characters

Portals, respawns, and logins are reserved transfers. They reuse the commit of section 7.2 with a reservation step in place of the overlap:

1. The source validates what the jump forbids: cooldown, cargo that may not pass, a body still in combat where the jump requires otherwise.
2. The destination's owner reserves the arrival for the transfer ID, confirming that the point exists, is reachable, and has admission capacity. A refused reservation ends the attempt with its reason and charges nothing.
3. One transaction charges the toll, if any, and commits the ownership change.
4. The source retires the traveller; the gateway switches the primary route.

A death commits its corpse and loot (section 9.1) before the respawn transfer begins. A respawn point that fails reservation, a destroyed bed or a claimed point whose claim has fallen, is skipped for the next point the player holds, ending at the bound city.

A sleeping character is a persisted entity in its region's records like any creature, owned by the region's server, carried in region snapshots and transfers, and restored by crash recovery. Each character has one row in `session_leases` with a lease generation. A login takes the lease with a new generation, revoking any older session; the old session's messages carry the old generation and are refused. The login is routed to the owner of the sleeping body, or to the respawn point if the body died. The subscription is checked when the lease is taken and each time it renews, never during a handoff, so a region move reuses the session and never becomes a new login.

### 7.7 Design Validation Cases

Validation covers idle overlap residents, boundary jitter, deliberate back-and-forth movement, reversal during preparation, corner crossings, high-speed movement, and same-process region crossings, on horizontal seams, height-band seams, and dungeon thresholds. Group cases cover boarding and dismounting during preparation, large vehicle bounds, a carrier base with occupants and stored contents, and incomplete destination readiness. Failure cases cover lost or duplicate acknowledgements, process failure before and after the commit row, a Master Server restart mid-transfer, a stale reopen message, and an unavailable destination encountered on foot, mounted, swimming, flying, or under knockback. Combat cases cover a killing blow across a seam, a death racing an Item Box deposit, a hit claim arriving after the target transferred, and a projectile fired at a stale ghost. Every case checks unique ownership, preserved state, bounded movement, and feedback matching the actual restriction. Widths, timing budgets, and population claims become operational values through the measurements recorded in [Server Settings](Server-settings.md).

---

## 8. Persistence, Delta Backups & Crash Recovery

### 8.1 Delta State Updates

Each Cluster Unit Server sends incremental delta updates to the world database on a regular interval. Deltas carry only state that can be replayed without harm: positions, survival needs, AI patrol progress, a creature's mood. Anything that moves value never waits for a delta; it commits immediately as a transaction (section 8.4).

```cpp
// YourPersistenceComponent.cpp
void UPersistenceComponent::TickDeltaSave(float DeltaTime)
{
    DeltaAccumulator += DeltaTime;
    if (DeltaAccumulator >= DeltaSaveInterval) // e.g., 10.0f seconds
    {
        DeltaAccumulator = 0.f;

        FWorldDeltaPayload Delta;
        Delta.RegionKey     = OwnedRegionKey;
        Delta.Generation    = OwnershipGeneration; // fenced like every write
        Delta.ClusterTime   = ClusterClock->Now();
        Delta.PlayerDeltas  = CollectModifiedPlayerStates();
        Delta.AIDeltas      = CollectModifiedAIStates();
        Delta.WorldDeltas   = CollectModifiedWorldActors();

        PersistenceClient->SendDeltaAsync(Delta);
    }
}
```

What to save:

- **Player**: position, survival needs, stats, affiliation, quest flags
- **AI**: alive/dead, patrol state, any persistent behavioural changes, last-updated time
- **World actors**: doors, resource nodes, environmental changes; player-built structures follow section 8.5

### 8.2 Full Snapshots on Region Transfer

Whenever a region migrates between servers (load balancing, splitting, joining, or crash recovery), the owning server emits a **full region snapshot** rather than a delta. This is the ground truth for the receiving server:

```cpp
FRegionSnapshot URegionManagerComponent::SerializeFullSnapshot()
{
    FRegionSnapshot Snap;
    Snap.RegionKey   = OwnedRegionKey;
    Snap.Players     = SerializeAllPlayers();     // sleeping characters included
    Snap.AIEntities  = SerializeAllAI();
    Snap.WorldState  = SerializeWorldActors();
    Snap.Effects     = SerializePlacedEffects();  // section 9.3
    Snap.ClusterTime = ClusterClock->Now();
    return Snap;
}
```

A split writes one snapshot per new piece, partitioned by the piece's bounds; a join merges the pieces' snapshots. Entities and bases are assigned by their owner record (section 8.5), never re-derived from position alone.

### 8.3 Crash Recovery Flow

If a Cluster Unit Server process dies:

1. The Master Server detects the heartbeat timeout (within ~5 seconds) and marks the server's regions unavailable; neighbours mark its ghosts stale.
2. It selects a **standby server** (pre-warmed idle process in the cluster).
3. The standby fetches the last full snapshot, subsequent deltas, and every committed transaction for the failed region from the database.
4. The standby applies them, reconstructs the region, and takes ownership with a new generation, which fences the dead process should it come back.
5. The gateway moves affected players' primary routes to the standby.
6. Players experience a brief pause (< 5 seconds total in a well-tuned system); their connection to the gateway never drops.

### 8.4 Value-Moving Transactions

Every event that moves value commits as one transaction before the result is shown to anyone. Each item has a stable ID and exactly one location row, so an item can only be in one place, and every transaction carries a unique ID that makes a retry harmless:

```sql
-- Loot on death: the target's owner commits the corpse and moves every
-- carried item onto it in one transaction.
BEGIN;
INSERT INTO value_events (event_id, kind, decided_by, generation, cluster_time)
VALUES ($event, 'death', $server, $gen, $t)
ON CONFLICT (event_id) DO NOTHING;            -- retry → nothing happens twice

INSERT INTO containers (container_id, kind, region_key, expires_at)
VALUES ($corpse, 'corpse', $region, $t + $recovery_window);

UPDATE item_locations
   SET container_id = $corpse
 WHERE container_id = $victim_inventory
   AND $gen = (SELECT generation FROM entity_owner WHERE entity_id = $victim);
COMMIT;
```

The same pattern covers trades, market and auction sales (section 10.2), bank deposits, crafting (consumed materials, station charge, created item, and skill practice in one transaction), gathering (node depletion and skill practice), and [Item Box](Magic/Spells/Misc/Item-box.md) deposits. Each transaction re-checks what it depends on as it commits, such as the destination's free capacity, the station's existence, and the source container's current contents, under `SERIALIZABLE` isolation or explicit row locks ([PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)), and fails whole if anything has changed. An Item Box deposit and a death therefore race on the same item rows, and whichever commits first wins; the other finds the items gone and moves nothing.

### 8.5 Structure Persistence

Player-built structures are their own persistence subsystem, specified in detail by [Building System (Technical)](<Building-system (Technical).md#10-rendering-replication-and-persistence>), which this section frames for the cluster. The records are the truth: base, piece, and placeable rows keyed by base ID, and an actor per base spawned from them when its ground streams in, never trusted to survive a cell unloading on its own. Every base row names its owning region, the region that holds its claim marker, and that region's server is the only writer for the whole base even where pieces cross the line; the neighbour forwards edits and damage as requests. A collapse cascade commits as one batch.

Migration carries bases by owner record: a region snapshot includes every base whose marker it holds, and a split assigns each base to the piece containing its marker. A carrier base travels in its carrier's transfer group instead (section 7.2) and has no fixed owning region. After a crash, the region's load reconciles its rows: pieces whose base row was never committed, and bases whose marker row is missing, fall under the [unclaimed-piece rules](<Building-system (Technical).md#75-unclaimed-pieces-and-ceilings>) and decay from there.

Storage growth is bounded by the game's own rules. Upkeep and weathering remove abandoned bases from the world and so from the database, the piece ceiling of each claim caps any one base, and destroyed piece rows are deleted rather than archived. Base and piece tables are partitioned by domain and region, so a region's load reads one partition and old worlds can be measured partition by partition. Row count per region and total piece count per world are tracked metrics in [Server Settings](Server-settings.md#hotspot-workloads-and-degradation).

### 8.6 Outage Timers

Timers are stored as absolute deadlines on the cluster clock: corpse expiry, raid and siege objectives, upkeep and decay steps, bond weakening. When a region recovers from an outage, the recovering server reads the region's recorded downtime interval and extends every deadline in the region by its length before simulation resumes, so each timer continues exactly where it stopped. While a region is unavailable it admits no one, so a sleeping base inside it can be neither raided nor reinforced.

---

## 9. Cross-Server Combat and Timed Effects

### 9.1 Hit Claims

The target's owner decides every hit. When an attacker's server detects a hit on a ghost, it sends a claim instead of applying damage:

```
Hit Claim Message:
{
  ClaimID:        uint64,   // idempotency key
  AttackerEntity: uint64,
  AttackerGroupVersion: uint64,
  TargetEntity:   uint64,
  TargetGeneration: uint64, // the owner generation the attacker saw
  AttackKind:     uint32,   // weapon, spell, or effect ID
  ImpactPoint:    FVector,
  ClusterTime:    float64,  // when the hit landed on the attacker's server
  AttackerSequence: uint32  // input sequence that produced it
}
```

The target's owner keeps a short history of each entity's positions and hit volumes, half a second at the server tick rate, because Epic documents no rewind facility for hit validation in 5.8. It rewinds the target to `ClusterTime`, accepts the claim if the impact lies within the hit volume plus a small tolerance, and applies the outcome through the same code path as a local hit. A claim whose target has since transferred is forwarded once to the new owner by generation; a claim for a stale ghost is dropped. A lethal outcome commits the death transaction of section 8.4 before anything is shown, and its `value_events` row is the single outcome event from which rewards derive (section 10.3). The attacker's own costs, such as stamina, ammunition, and mana, are committed by the attacker's owner when the attack is made, whatever the claim's fate.

### 9.2 Seam Consolidation

The Master Server counts accepted cross-server claims per pair of neighbouring regions. When a pair exceeds its threshold, by default 20 claims in 10 seconds, and one server has the capacity for both, the Master migrates one region to the other's server through the ordinary region migration of section 3.4, so the fight continues with no seam inside it. Consolidated pairs release after a quiet period, by default 60 seconds without cross-region claims, and only if load allows; a release is never forced mid-fight. Where the combined load exceeds one server, consolidation is skipped and section 11 applies.

A hostile physical link, such as a [Kraken](Creatures/Kraken.md) gripping a ship, is not a transfer group. It registers with the Master as a link between two entities, which requests consolidation of their regions immediately rather than waiting for the claim threshold. If the two cannot share a server, the link breaks when either one's handoff commits: the grip releases, and both continue under their own owners.

### 9.3 Effect Timelines

A timed effect is an entity with an owner and a timeline:

```cpp
USTRUCT()
struct FEffectTimeline
{
    GENERATED_BODY()

    UPROPERTY() double BeginTime   = 0.0; // cluster clock, seconds
    UPROPERTY() double WarningTime = 0.0; // when the warning becomes visible
    UPROPERTY() double ImpactTime  = 0.0; // when the effect resolves
    UPROPERTY() double EndTime     = 0.0;
    UPROPERTY() uint64 CasterEntity = 0;
    UPROPERTY() uint64 CasterGroupVersion = 0; // allies as of the cast
};
```

Clients and neighbour servers present the effect from these timestamps, never from the arrival time of a message, so a warning is equally long everywhere. Caster-bound channels are owned with the caster and are cancelled if the caster's owner fails, with no refund of mana already committed. Placed effects are owned by the server of the ground they are anchored to, saved in region snapshots, and keep running when their caster leaves or fails. Effects on targets go to the target's owner as claims of kind `effect`, and per-target tallies, such as the healing [Mending Light](Magic/Spells/Light/Mending-light.md) has delivered and charged for, live on the effect's owner. Ally tests, such as which players [Frostbind](Magic/Spells/Water/Frostbind.md) spares, read the group membership at `CasterGroupVersion` from the social service (section 10.2).

---

## 10. Shared World State and Backend Services

### 10.1 Cluster Clock and Weather

The Master Server keeps the cluster clock, and every server synchronises to it continuously; all timelines, deadlines, and outcome events use it. Weather is a deterministic function of the world seed and the cluster clock, so every server computes the same front over the same ground without messages, and a split never shows two weathers across a seam. Player-made local changes, such as spreading fire, are region state owned by the region's server. Each dungeon domain derives its own clock from the cluster clock with its own offset and rate, stored as domain state.

### 10.2 Markets and the Social Service

There is no global economy simulator. Each settlement's market ledger (stock, prices, and a rolling record of recent trade, per [Economy and Trade](Economy.md#where-the-market-lives)) is region state owned by the server of the settlement's region: saved in its deltas and snapshots, carried by region migration and splits with the piece that holds the settlement's market square, and restored by crash recovery from the last snapshot. Every few minutes each region publishes its demand per good, summarised over the past hours, to its neighbours over the messaging layer, and each market folds the signals it receives into its price drift; no market ever blocks on another. Bank accounts and auction listings are world-database rows. A deposit, a withdrawal, a listing (the item moves into an escrow container), and a sale or winning bid are value transactions of section 8.4 committed by the server that owns the bank or auction house, and an NPC sale commits the buyer's coin and goods the same way before the ledger records it. Parties, guilds, alliances, permissions, and the ownership of claims and tames are versioned records in the social service. Changes are pushed to every Cluster Unit Server with the new version; a server evaluates an action against the version it holds, and any access to another's property, such as a guild chest, is re-checked by the property's owner against the service's current version before it commits.

### 10.3 Outcome Events and Rewards

A death, a completed quest objective, or a boss kill is recorded once as a `value_events` row by the owner that decided it. Experience, quest credit, and bounty payments are derived from that row by consumers that track the last event ID they processed, so a retried or duplicated message can never grant a reward twice. A bounty, whether a faction or a player posted it ([Conflict and PvP](Conflict-and-pvp.md#the-price-on-a-head)), is paid as a value transaction of section 8.4 keyed to the wanted character's death event. Credit for a tame's kill goes to its keeper as recorded in the social service at the event's time, whichever server owned the tame.

Standing is derived from the same rows, but later, because the [Reputation System](Reputation-system.md#witnesses) counts an act only when one of the wronged faction's own people perceived it and is alive and free when the encounter ends. An event whose target belongs to an NPC faction therefore carries the IDs of that faction's NPCs who perceived it, by sight on the deciding server or by a perception event (section 6.5) on a neighbour, and opens a pending standing record. The record closes when no listed witness has perceived further hostility from the actor for a set time, 60 seconds by default, or when every listed witness is dead; each witness's state is read from its own owner. A record that closes with a living, free witness yields the change in standing exactly once, through the same event-ID consumer, and one that closes with none is discarded. An event whose target is a player, or an NPC in a player's service, opens no record.

### 10.4 Unobserved Activity

Nothing is simulated where no one is. Records that change with time carry `last_updated` on the cluster clock, and loading a region applies the elapsed time through each system's own rule: bond decay and stabled upkeep from [Taming and Control](Taming-and-control.md), repopulation from [Settlement Generation](Settlement-generation.md), resource renewal from [Gathering](Gathering.md). NPC convoys crossing unloaded ground are records in a convoy table with a route and a departure time, owned by the server that owns the region the convoy is crossing; that server's scheduled pass advances them, hands them to the next region's owner as they cross, rolls any loss when a leg is due from the danger of the ground it crosses, and applies the consequences to the settlements at both ends. A convoy whose route enters loaded ground is spawned there as actors and simulated normally. Boss-trigger history is domain state in the world database.

---

## 11. Hotspots: Splitting, Joining, and Degradation

### 11.1 Splitting and Joining

A region that one server cannot hold is split if a server is free and the split pays. A horizontal split divides the region into four quadrants keyed by the split path of section 3.2, recursively, down to a minimum piece no smaller than twice the overlap outer limit O plus the largest supported group extent, so every piece keeps a full overlap on each side. A vertical split divides the column into height bands at boundaries chosen from where the load sits, a cavern ecosystem, a floating island, an air battle above a ground one.

The Master decides from measurement, not from population alone. A split is made only when the projected per-server load after the split, plus the cross-server cost the new seams would add (handoffs per second and hit claims per second across them, taken from the last minute's traffic), is lower than the load now. Pieces are joined when their combined load falls below the single-server threshold for a sustained period. Splits and joins are region migrations with full snapshots (section 8.2) and the ordinary ownership commit.

### 11.2 Time Dilation

Unreal's `AWorldSettings::TimeDilation` is a replicated property that scales the passage of time for a whole world. It is per process, so before it dilates a region the Master migrates that region onto a server of its own; dilating a server that owns other regions would slow them too. Under dilation every timer in the region runs at the dilated rate, and the region's deadlines (section 8.6) are scaled with it. Neighbours receive the dilation factor with each ghost snapshot and present those ghosts at the matching pace, and hit claims across the seam carry cluster time, which the target's owner converts. The floor is a server setting, 0,25 by default. The technique follows the [time dilation CCP introduced to EVE Online in 2011](https://www.eveonline.com/news/view/introducing-time-dilation-tidi), which slows an overloaded node's game clock so it can keep processing a fleet battle and restores normal speed as the load eases.

### 11.3 Degradation Order and Admission

The stressed and emergency profiles of [Server Settings](Server-settings.md#hotspot-workloads-and-degradation) shed work in this order: cosmetic effects and ambient life, then the update rate of low-priority AI, then the replication rate of distant entities, then time dilation down to its floor. A single-server map has no time dilation, because dilation is per process and its one process owns every region; its order ends at shedding and then at admission control, and the same holds for any region that cannot be given a free server. Only at the floor (or, without dilation, once shedding is exhausted) does the region stop admitting arrivals, which uses the same travel-limit enforcement and holographic wall as an unavailable region (section 7.5), with its own message. City-guard AI, attack warnings, the presence of every hostile within weapon range, and persistence are exempt from shedding at every stage.

---

## 12. Infrastructure & Orchestration

### 12.1 Containerizing UE5 Dedicated Servers

Package each Cluster Unit Server as a Docker container:

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    libssl3 libvulkan1 libasound2

WORKDIR /game
COPY ./ServerBuild/ .

EXPOSE 7777/udp
EXPOSE 7778/tcp

CMD ["./YourGameServer", "-server", "-log", \
     "-MasterAddr=${MASTER_ADDR}", "-port=7777"]
```

The gateway is packaged the same way from the same build, launched with the proxy net driver as its game driver.

### 12.2 Kubernetes Deployment

Use Kubernetes (or Amazon GameLift) to manage server scaling. Each `Pod` runs one Cluster Unit Server, which receives its regions from the Master at runtime:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-unit-server
spec:
  replicas: 8    # capacity, not world size: one replica can run every region
  template:
    spec:
      containers:
      - name: ue5-server
        image: your-registry/ue5-game-server:latest
        env:
        - name: MASTER_ADDR
          value: "master.internal:9000"
        ports:
        - containerPort: 7777
          protocol: UDP
        resources:
          requests:
            cpu: "4"
            memory: "8Gi"
          limits:
            cpu: "8"
            memory: "16Gi"
```

### 12.3 Amazon GameLift Alternative

For teams using AWS, Amazon GameLift provides a managed fleet that integrates with UE5 via an official plugin (compatible with UE5). It handles:

- Fleet auto-scaling
- Session management
- Server health monitoring

Integrate by installing the `AmazonGameLift` plugin and calling `InitSDK()` at server startup, then `ProcessReady()` once the region is initialized.

### 12.4 Redis for Shared State

Use Redis as a cache in front of the world database for low-latency region ownership lookups and session data. It is never the authority: a Redis entry that disagrees with the database is rebuilt from the database.

```
# Example Redis key structure
region:0:3:5         → { serverID, generation, playerCount, cpuLoad }
session:player_uuid  → { leaseGeneration, primaryServer, gatewayID, lastSeen }
```

---

## 13. Performance Considerations & Known Limitations

### 13.1 UE5 Networking Ceiling

UE5's default networking code is optimized for **64–100 concurrent players per server**, not MMO-scale. Iris and the Replication Graph both significantly extend this ceiling, but a single UE5 dedicated server process should realistically be expected to handle **200–400 concurrent players** before CPU becomes the bottleneck. The cluster architecture in this document distributes load across many processes, and section 11 splits a region that exceeds one process.

The `OmniMesh` solution (used in production on Mortal Online 2) has demonstrated **~500 players in a single seamless battle** — showing what is achievable with heavily customized networking on top of UE5.

### 13.2 Cross-Server Latency

Ghost snapshot propagation between servers adds latency. Budget for:

- ~16–33 ms for ghost state to propagate (at 30–60 Hz broadcast)
- Plus network RTT between server machines (~1–5 ms in same datacenter)

This is generally imperceptible in an open-world MMO context. A hit claim adds one server-to-server round trip before the target's owner commits, which is why sustained seam fights are consolidated onto one server (section 9.2) and why no rule ever depends on which side of a seam a combatant stands.

### 13.3 World Partition & Save Compatibility

World Partition's save system has known complexity with cell loading/unloading on dedicated servers. Test thoroughly with `wp.Runtime.EnableServerStreaming=1` enabled. Runtime-spawned state, player bases above all, is never persisted through World Partition; it is spawned from database records when its cell loads (section 8.5). **Data Layers** remain useful for grouping editor-placed actors by persistent state:

```cpp
// Assign editor-placed world actors to Data Layers by type
// e.g., "PersistentStructures", "DynamicSpawns"
// Data Layers can be loaded/unloaded independently
```

### 13.4 Replicated World Bounds

Iris clamps replicated positions to the bounds in `UWorldLocationsConfig` (section 5.2), about ±10,5 km by default, and the Replication Graph fallback logs `GetCellInfoForActor: Actor is outside world bounds. Clamping grid location.` for actors outside its grid. Size both to the world explicitly, and remember that each dungeon domain has its own coordinate space and needs its own bounds.

### 13.5 Large World Coordinates (LWC)

UE5.1+ introduced **Large World Coordinates** (double-precision positions), essential for worlds larger than ~10 km to avoid floating-point precision artifacts. Enable it:

```ini
[/Script/Engine.WorldSettings]
bEnableLargeWorldCoordinates=true
```

This is enabled by default in UE5.1+ open world templates.

### 13.6 Single-Server Maps

Until multi-server handoff holds under load, each map runs on one Cluster Unit Server that owns every region of it. The 200–400 concurrent players that one process holds (section 13.1) are therefore the population cap of a single-server map, and when a map fills, another map is opened rather than the crowd spread across one map too large for its server. Such a map has no time dilation (section 11.2), so its overload order ends at shedding and admission control. During early access a wipe resets the world database for that map, characters included, and the wipes end on the declared day when the persistent world begins.

---

## 14. Recommended Tech Stack Summary

| Layer | UE5 Tool / External Tool | Notes |
|---|---|---|
| World authoring | World Partition + OFPA | Streaming grid independent of ownership grid |
| Server streaming | `wp.Runtime.EnableServerStreaming=1` | UE5.1+ required |
| Replication | Iris (`UNetObjectGridWorldLocFilter`, sphere prioritiser) | Prototype gate; Replication Graph as fallback |
| Dedicated server | UE5 headless server binary | Linux containers |
| Client connection | Forked `UProxyNetDriver` gateway | Experimental in 5.8.3; owned by the project |
| Master server | Go or Node.js + gRPC | Not a UE process; holds no commit state |
| World database | PostgreSQL | Ownership, value transactions, structures |
| Region state cache | Redis | Cache only, rebuilt from the database |
| Social service | Stateless service over PostgreSQL | Parties, guilds, permissions, ownership |
| Inter-server messaging | NATS | Ghosts, hit claims, perception events, bonds |
| Orchestration | Kubernetes or Amazon GameLift | Replicas set capacity, not world size |
| Physics replication | `UNetworkPhysicsComponent` (UE5.4+) | Input rewind/resimulation |

---

## Further Reading

- [UE5 Networking Overview — Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine)
- [Unreal Engine 5.8 Release Notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes)
- [Introduction to Iris](https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-iris-in-unreal-engine)
- [Migrate to Iris](https://dev.epicgames.com/documentation/en-us/unreal-engine/migrate-to-iris-in-unreal-engine)
- [Iris Filtering](https://dev.epicgames.com/documentation/en-us/unreal-engine/iris-filtering-in-unreal-engine)
- [Iris Prioritization](https://dev.epicgames.com/documentation/en-us/unreal-engine/iris-prioritization-in-unreal-engine)
- [Replication Graph Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine)
- [ReplicationGraph future — Epic staff answer, January 2026](https://forums.unrealengine.com/t/replicationgraph-future/2697160)
- [Multi-server Replication plugin — API Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/MultiServerReplication)
- [UProxyNetDriver — API Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/MultiServerReplication/UProxyNetDriver)
- [World Partition Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine)
- [World Partition Server Streaming — Epic Knowledge Base](https://dev.epicgames.com/community/learning/knowledge-base/Xdj9/unreal-engine-world-partition-server-streaming)
- [Actor Relevancy and Priority (NetCullDistanceSquared) — Multiplayer Compendium](https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/)
- [SetMaxDrawDistance — UE5 Blueprint API](https://dev.epicgames.com/documentation/en-us/unreal-engine/BlueprintAPI/LOD/SetMaxDrawDistance)
- [Cull Distance Volumes in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/cull-distance-volumes-in-unreal-engine)
- [Travelling in Multiplayer — UE5 Docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/travelling-in-multiplayer-in-unreal-engine)
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Introducing Time Dilation — EVE Online](https://www.eveonline.com/news/view/introducing-time-dilation-tidi)
- [AWS GameLift + UE5 Dedicated Server Guide](https://aws.amazon.com/blogs/gametech/unreal-engine-5-dedicated-server-development-with-amazon-gamelift-anywhere/)
- [OmniMesh — Battle-tested MMO networking for UE5](https://starvault.se/omnimesh-mmo-networking-unreal-engine-5/)

## Continue Reading

Continue with [Server Architecture](Server-architecture.md), [Server Settings](Server-settings.md), [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md), [UI and HUD](UI-and-HUD.md), [Building System (Technical)](<Building-system (Technical).md>), and the [Design Backlog](Design-backlog.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
