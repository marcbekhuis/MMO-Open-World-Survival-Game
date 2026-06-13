# Building a Cluster-Based Distributed Server Architecture in Unreal Engine 5

A detailed technical implementation guide based on the Server Architecture specification.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [UE5 Foundation: World Partition & Server Streaming](#2-ue5-foundation-world-partition--server-streaming)
3. [Master Server Implementation](#3-master-server-implementation)
4. [Cluster Unit Servers — UE5 Dedicated Server Setup](#4-cluster-unit-servers--ue5-dedicated-server-setup)
5. [Replication Graph: Visibility-Driven Sync](#5-replication-graph-visibility-driven-sync)
6. [Cross-Region Entity Synchronization](#6-cross-region-entity-synchronization)
7. [Seamless Player & AI Handoff](#7-seamless-player--ai-handoff)
8. [Persistence, Delta Backups & Crash Recovery](#8-persistence-delta-backups--crash-recovery)
9. [Infrastructure & Orchestration](#9-infrastructure--orchestration)
10. [Performance Considerations & Known Limitations](#10-performance-considerations--known-limitations)
11. [Recommended Tech Stack Summary](#11-recommended-tech-stack-summary)

---

## 1. Architecture Overview

The target architecture divides the game world into **1 km × 1 km simulation regions**. Each region is owned by a **Cluster Unit Server** (a headless UE5 dedicated server process). A **Master Server** (non-UE, purpose-built) sits above the cluster and manages routing, persistence, and load balancing.

```
┌─────────────────────────────────────────────────────────┐
│                    MASTER SERVER                        │
│  (Region Map | Player Router | Load Balancer | DB Auth) │
└────────────────────────┬────────────────────────────────┘
                         │ TCP/gRPC control plane
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │  Cluster    │ │  Cluster    │ │  Cluster    │
   │  Unit Srv A │ │  Unit Srv B │ │  Unit Srv C │
   │  (Regions   │ │  (Region    │ │  (Regions   │
   │   0,1,2)    │ │   3 — hot)  │ │   4,5,6,7)  │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
          │  Ghost Sync   │  Ghost Sync   │
          └───────────────┴───────────────┘
                  Inter-server UDP channel
```

This document explains how each layer is built using UE5-native tools, with a custom Master Server layer alongside.

---

## 2. UE5 Foundation: World Partition & Server Streaming

### 2.1 World Partition

World Partition is UE5's built-in system for streaming open-world content. Every new UE5 level has it enabled by default. It divides the world into a spatial grid of cells and streams them in/out based on proximity to streaming sources (usually `PlayerController`).

**Enabling World Partition:**

1. Create your map in UE5 (`File → New Level → Open World`).
2. In the **World Settings** panel, confirm `World Partition` is enabled.
3. Set your streaming cell size to match your 1 km region grid:

```ini
; WorldSettings (or DefaultEngine.ini)
[/Script/Engine.WorldSettings]
WorldPartitionGridSize=100000   ; 100,000 cm = 1 km
```

4. Place actors normally — World Partition automatically assigns them to cells.

### 2.2 Server Streaming (Critical for Dedicated Servers)

By default, dedicated servers load the **entire world** into memory. For a large open world this is unsustainable. UE5.1+ introduced a CVar specifically to fix this:

```ini
; DefaultEngine.ini on your dedicated server build
[ConsoleVariables]
wp.Runtime.EnableServerStreaming=1
```

This tells the server to stream world cells based on player positions — only zones where players are active are loaded. This is essential for keeping RAM use manageable across a large world.

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

The Master Server is **not** a UE5 process. It is a purpose-built backend service responsible for orchestration, not gameplay. Use a lightweight language and framework here — UE5 introduces unnecessary overhead for this layer.

### 3.1 Recommended Stack

| Concern | Tool |
|---|---|
| Master Server runtime | Go, Node.js, or Rust |
| Control-plane protocol | gRPC or WebSocket (persistent connections) |
| Region ownership map | In-memory hash map + replicated to Redis |
| Player session store | Redis (fast TTL-based session data) |
| World state DB | PostgreSQL or ScyllaDB (for persistence) |
| Cluster orchestration | Kubernetes or AWS GameLift FlexMatch |

### 3.2 Region Ownership Map

The Master Server maintains a map of every 1 km² cell to the server currently responsible for it:

```go
// Pseudocode: Master Server region table
type RegionID struct { X, Y int }

type RegionEntry struct {
    ServerID   string
    ServerAddr string  // IP:Port for client routing
    CPULoad    float32
    PlayerCount int
}

var regionMap = map[RegionID]*RegionEntry{}
```

Cluster Unit Servers report their load metrics every 1–5 seconds over the control-plane connection. The Master Server uses this to decide whether to migrate regions.

### 3.3 Player Routing

When a client connects or crosses a region boundary:

1. Client sends their world position to Master Server.
2. Master Server looks up the `RegionID` for that position.
3. Master Server returns the `ServerAddr` of the owning Cluster Unit Server.
4. Client connects to that address.

For the **Gateway Proxy** model (preferred), a stateless proxy layer (e.g., `Envoy`, `nginx stream`) sits in front of all Cluster Unit Servers. The Master Server instructs the proxy to reroute the player's connection, and the client's TCP/UDP session is transparently redirected — no disconnect occurs.

### 3.4 Dynamic Load Balancing

The Master Server monitors per-server metrics and can trigger a **region migration**:

```
Trigger conditions (example thresholds):
  - Server CPU sustained >80% for 30 seconds
  - Player count in region >120
  - AI entity count in region >500
```

When triggered:

1. Master Server selects a target standby server.
2. Instructs the current owner to serialize the region and send a **full handoff payload**.
3. Target server loads the payload and becomes the new authoritative owner.
4. Master Server updates the region map and reroutes players.

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
  -RegionX=3 -RegionY=5   # custom args parsed in GameMode
```

### 4.2 Region Assignment at Startup

Parse the launch arguments in your custom `GameMode` to configure which region(s) this server owns:

```cpp
void AYourGameMode::InitGame(const FString& MapName,
                              const FString& Options,
                              FString& ErrorMessage)
{
    Super::InitGame(MapName, Options, ErrorMessage);

    int32 RegX = FCString::Atoi(*UGameplayStatics::ParseOption(Options, TEXT("RegionX")));
    int32 RegY = FCString::Atoi(*UGameplayStatics::ParseOption(Options, TEXT("RegionY")));

    RegionManager = NewObject<URegionManagerComponent>(this);
    RegionManager->Initialize(RegX, RegY);

    // Register with Master Server via HTTP/gRPC
    MasterServerClient->RegisterServer(RegX, RegY, GetServerPort());
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

---

## 5. Replication Graph: Visibility-Driven Sync

UE5's default net relevancy checks every actor against every connection every tick — an O(actors × connections) problem. For an MMO this is unacceptable. The **Replication Graph** plugin solves this by pre-computing relevancy using spatial data structures.

### 5.1 Enable the Replication Graph Plugin

```
Edit → Plugins → Search "Replication Graph" → Enable → Restart
```

Add to `YourGame.Build.cs`:

```csharp
PrivateDependencyModuleNames.AddRange(new string[] {
    "ReplicationGraph"
});
```

### 5.2 Grid Spatialization Node

The key node for this architecture is `UReplicationGraphNode_GridSpatialization2D`. It divides the world into a 2D grid of cells and maintains per-cell actor lists. When determining what to replicate to a connection, the server only evaluates actors in the viewer's current grid cell and adjacent cells — collapsing the O(n²) problem to O(local actors × local connections).

```cpp
// YourReplicationGraph.h
UCLASS()
class UYourReplicationGraph : public UReplicationGraph
{
    GENERATED_BODY()
public:
    virtual void InitGlobalActorClassSettings() override;
    virtual void InitGlobalGraphNodes() override;
    virtual void InitConnectionGraphNodes(
        UNetReplicationGraphConnection* RepGraphConnection) override;
    virtual void RouteAddNetworkActorToNodes(
        const FNewReplicatedActorInfo& ActorInfo,
        FGlobalActorReplicationInfo& GlobalInfo) override;

private:
    UReplicationGraphNode_GridSpatialization2D* GridNode;
    UReplicationGraphNode_ActorList*            AlwaysRelevantNode;
};
```

```cpp
// YourReplicationGraph.cpp
void UYourReplicationGraph::InitGlobalGraphNodes()
{
    // Always-relevant: GameState, PlayerStates, etc.
    AlwaysRelevantNode = CreateNewNode<UReplicationGraphNode_ActorList>();
    AddGlobalGraphNode(AlwaysRelevantNode);

    // Spatial grid: cell size matches your 1 km region grid
    GridNode = CreateNewNode<UReplicationGraphNode_GridSpatialization2D>();
    GridNode->CellSize     = 100000.f;  // 100,000 cm = 1 km
    GridNode->SpatialBias  = FVector2D(-HALF_WORLD_MAX, -HALF_WORLD_MAX);
    AddGlobalGraphNode(GridNode);
}
```

### 5.3 Per-Entity Visibility Radius

This maps directly to the spec's "Entity Visibility Radius" concept. Each actor class defines its own `NetCullDistanceSquared` — the square of the maximum distance from a client's viewpoint at which the actor is relevant — which the Grid node respects. The values below are *resting* baselines for stationary or slow actors; the adaptive system in section 5.4 scales them upward at runtime as an entity accelerates:

```cpp
// In your actor constructor (C++)

// Small projectile — short radius
NetCullDistanceSquared = 40000.f * 40000.f;   // 400 m

// Player / humanoid NPC — medium radius
NetCullDistanceSquared = 150000.f * 150000.f; // 1.5 km

// World boss — large radius
NetCullDistanceSquared = 500000.f * 500000.f; // 5 km
```

Routing actors to the correct graph node:

```cpp
void UYourReplicationGraph::RouteAddNetworkActorToNodes(
    const FNewReplicatedActorInfo& ActorInfo,
    FGlobalActorReplicationInfo& GlobalInfo)
{
    if (ActorInfo.Actor->bAlwaysRelevant)
    {
        AlwaysRelevantNode->NotifyAddNetworkActor(ActorInfo);
    }
    else
    {
        GridNode->AddActor_Dormancy(ActorInfo, GlobalInfo);
    }
}
```

Register your custom graph in `DefaultEngine.ini`:

```ini
[/Script/OnlineSubsystemUtils.IpNetDriver]
ReplicationDriverClassName="/Script/YourGame.YourReplicationGraph"
```

### 5.4 Adaptive, Velocity-Aware Cull Distance

The baselines above are static per class, but the [Dynamic culling & adaptive render distance](Dynamic-culling-and-render-distance.md) design calls for a radius that grows and stretches forward as an entity speeds up. UE5 net relevancy is fundamentally **radial** — it tests the straight-line distance between the actor and the connection's view position — so there is no built-in directional cull. The architecture realizes the design in two layers: a speed-scaled radial cull that every entity uses, and an optional directional refinement for the cases that need it.

The speed-scaled layer runs on the authoritative server and rewrites the actor's `NetCullDistanceSquared` from its velocity each tick:

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

    const float NewCullSq = Radius * Radius;
    if (!FMath::IsNearlyEqual(NewCullSq, Owner->NetCullDistanceSquared, 1.0f))
    {
        Owner->NetCullDistanceSquared = NewCullSq;

        // A custom Replication Graph caches cull distance in the actor's global
        // info; push the new value so the grid re-buckets the actor next gather.
        if (UReplicationGraph* RepGraph = GetServerRepGraph())
        {
            FGlobalActorReplicationInfo& Info =
                RepGraph->GetGlobalActorReplicationInfoMap().Get(Owner);
            Info.Settings.SetCullDistanceSquared(NewCullSq);
        }
    }
}
```

**Runtime-change caveats.** With default replication (no Replication Graph), a relevancy change only takes effect once the actor's channel is closed and reopened, which makes per-tick updates impractical — so the Replication Graph path above is strongly preferred. The stock `UBasicReplicationGraph` deliberately does **not** support changing `NetCullDistanceSquared` per actor at runtime; treat it as an example only, and have your custom graph re-cache the cull distance (and re-bucket the actor in `UReplicationGraphNode_GridSpatialization2D`) whenever the value changes.

The speed-scaled radius grows symmetrically, which is robust but slightly wasteful behind a fast mover. For a true forward-elongated volume, add a directional relevancy check in your custom node that biases the effective radius by how closely the viewer lies along the entity's heading:

```cpp
// Approximate an elongated volume: full radius ahead, base radius to the sides/rear.
bool UYourGridNode::IsRelevantTo(const FVector& ViewLocation, const AActor* Entity) const
{
    const FVector ToViewer = ViewLocation - Entity->GetActorLocation();
    const float   Distance = ToViewer.Size();
    const FVector Velocity = Entity->GetVelocity();

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

Server relevancy decides what a client is *told about*; the client still applies its own draw-distance culling to what it already has. Mirror the same three categories on the client so the visual fade matches the network behavior, and always clamp the client's draw distance at or below the entity's server relevancy radius — a client can never draw an entity that was never replicated to it.

Per-primitive draw distance is set at runtime with `UPrimitiveComponent::SetMaxDrawDistance`, which updates the component's `CullDistance`:

```cpp
// On the owning client, scale a primitive's draw distance with its owner's speed.
const float Draw = FMath::Min(
    BaseDraw + OwnerSpeed * 1.5f * ModeFactor,  // mirror the server's look-ahead
    ServerRelevancyRadius);                      // never exceed what was replicated
PrimitiveComp->SetMaxDrawDistance(Draw);
```

For static, non-replicated set dressing — rocks, props, foliage — prefer **Cull Distance Volumes**, which assign size-based draw distances to actors in a level with no per-frame logic. Reserve the dynamic `SetMaxDrawDistance` path for the moving entities that actually benefit from it, such as a Flying Leviathan fading in early as it crosses open sky.

---

## 6. Cross-Region Entity Synchronization

This is the most custom part of the architecture — UE5 has no built-in mechanism for authoritative data to flow from one dedicated server process to another. You implement this as an **inter-server messaging layer**.

### 6.1 Ghost Entity Protocol

When a Cluster Unit Server detects that an entity's visibility radius overlaps a neighboring region, it sends a lightweight **ghost snapshot** to that neighbor over a direct UDP channel (or via a shared message broker like NATS or Redis Pub/Sub).

```
Ghost Snapshot Message (sent at entity's NetUpdateFrequency):
{
  EntityID:    uint64,
  OwnerServer: string,
  Region:      {X, Y},
  Position:    FVector,
  Rotation:    FRotator,
  Velocity:    FVector,
  StateFlags:  uint32,   // health, alive/dead, combat state
  Timestamp:   float64
}
```

### 6.2 Visibility Overlap Detection

Each Cluster Unit Server runs a per-tick pass to determine which of its entities could be visible to neighboring regions:

```cpp
void URegionManagerComponent::TickVisibilityBroadcast(float DeltaTime)
{
    for (AActor* Entity : GetSimulatedEntities())
    {
        // VisRadius already reflects the adaptive, velocity-scaled cull
        // distance maintained in section 5.4.
        const float   VisRadius = FMath::Sqrt(Entity->NetCullDistanceSquared);
        const FVector Location  = Entity->GetActorLocation();

        // Bias the test volume forward along velocity so a fast entity overlaps
        // the neighbouring region — and seeds its ghost there — earlier, which
        // is what gives the seamless handoff in section 7 its lead time.
        const FVector Velocity    = Entity->GetVelocity();
        const FVector ForwardBias = Velocity.IsNearlyZero()
            ? FVector::ZeroVector
            : Velocity.GetSafeNormal() * (VisRadius * 0.5f);

        const FVector Center = Location + ForwardBias;
        FBox EntityBounds(
            Center - FVector(VisRadius),
            Center + FVector(VisRadius));

        // Check which neighboring regions overlap this bounding box
        TArray<FRegionID> OverlapRegions = RegionGrid.GetOverlappingRegions(EntityBounds);
        OverlapRegions.Remove(OwnedRegion); // exclude self

        for (const FRegionID& NeighborRegion : OverlapRegions)
        {
            // Check if the neighbor has any potential viewers (optional optimization)
            if (MasterServerClient->RegionHasPlayers(NeighborRegion))
            {
                SendGhostSnapshot(Entity, NeighborRegion);
            }
        }
    }
}
```

### 6.3 Receiving Ghost Entities

The neighboring server receives ghost snapshots and maintains them as **non-authoritative proxy actors**:

```cpp
void URegionManagerComponent::OnGhostSnapshotReceived(
    const FGhostSnapshot& Snapshot)
{
    AGhostEntity* Ghost = GhostEntityMap.FindOrCreate(Snapshot.EntityID);
    Ghost->ApplySnapshot(Snapshot);  // Updates position/state
    Ghost->SetIsGhost(true);         // Marks it as non-authoritative
    // Ghost is visible to players in this region but cannot be
    // modified — it receives no gameplay authority.
}
```

Ghost actors still replicate to clients in the receiving region (using the standard UE5 replication pipeline) so players see and can interact with entities that technically live on another server.

---

## 7. Seamless Player & AI Handoff

When a player or AI crosses a region boundary, ownership transfers from the source server to the destination server.

### 7.1 Boundary Detection

Track when any entity is within a **handoff threshold** of a region boundary (e.g., 200 m):

```cpp
void URegionManagerComponent::CheckBoundaryProximity(ACharacter* Pawn)
{
    FVector Pos = Pawn->GetActorLocation();
    // RegionBounds is the FBox of this server's owned region(s)
    float DistToBoundary = RegionBounds.GetClosestPointTo(Pos) distance;

    if (DistToBoundary < HandoffThreshold)
    {
        // Pre-warm: the ghost is already on the destination server
        // Now, prepare a full authoritative snapshot
        InitiateHandoff(Pawn);
    }
}
```

### 7.2 Handoff Payload

At handoff time, the source server serializes a full authoritative snapshot — far more complete than a ghost snapshot:

```
Authoritative Handoff Payload:
{
  EntityID, Class, Position, Rotation, Velocity,
  PlayerState: { Inventory[], Stats{}, Affiliation, QuestFlags[] },
  MovementState: { Crouch, Sprint, MontageState },
  ActiveEffects: [ ... ],
  InputBuffer: last 300ms of inputs (for reconciliation)
}
```

The destination server receives this, **promotes its existing ghost** into a full simulation entity, and the source server destroys its copy after receiving an acknowledgment.

### 7.3 Client Connection Redirect

**Option A — Gateway Proxy (Recommended)**

Use a stateless L4 proxy (e.g., Envoy, HAProxy, or a custom proxy in Go). The proxy maintains the client's UDP/TCP session. When the Master Server updates the routing table, the proxy transparently forwards packets to the new Cluster Unit Server. From the client's perspective, the connection never breaks.

**Option B — Silent Redirect**

The source server instructs the client to reconnect via `APlayerController::ClientTravel`:

```cpp
// On source server, when handoff is confirmed
void AYourPlayerController::TriggerServerRedirect(FString NewServerAddr)
{
    // Hide the redirect visually on the client side
    ClientSetHUD(nullptr);   // optional: keep HUD up actually
    ClientTravel(NewServerAddr, TRAVEL_Absolute);
}
```

Mask the reconnect on the client with a "world streaming" animation — a fraction of a second is typically all the delay involved.

### 7.4 AI Handoff

AI handoff follows the same protocol but without the client connection step. The AI Controller serializes its behavioral state (patrol target, threat list, current action) into the handoff payload. The destination server reconstructs the AI from this state snapshot.

```cpp
void AYourAIController::SerializeForHandoff(FHandoffPayload& Payload)
{
    Payload.BehaviorTreeAsset  = BehaviorTreeAssetPath;
    Payload.BlackboardData     = BlackboardComp->Serialize();
    Payload.CurrentPatrolIndex = PatrolIndex;
    Payload.ThreatActorIDs     = ThreatPerception.GetThreatIDs();
}
```

---

## 8. Persistence, Delta Backups & Crash Recovery

### 8.1 Delta State Updates

Each Cluster Unit Server sends incremental delta updates to the Master Server's persistence service (e.g., PostgreSQL or ScyllaDB) on a regular interval:

```cpp
// YourPersistenceComponent.cpp
void UPersistenceComponent::TickDeltaSave(float DeltaTime)
{
    DeltaAccumulator += DeltaTime;
    if (DeltaAccumulator >= DeltaSaveInterval) // e.g., 10.0f seconds
    {
        DeltaAccumulator = 0.f;

        FWorldDeltaPayload Delta;
        Delta.RegionID      = OwnedRegionID;
        Delta.Timestamp     = FDateTime::UtcNow().ToUnixTimestamp();
        Delta.PlayerDeltas  = CollectModifiedPlayerStates();
        Delta.AIDeltas      = CollectModifiedAIStates();
        Delta.WorldDeltas   = CollectModifiedWorldActors();

        MasterServerClient->SendDeltaAsync(Delta);
    }
}
```

What to save:

- **Player**: inventory, stats, position, affiliation, quest flags
- **AI**: alive/dead, patrol state, any persistent behavioral changes
- **World actors**: doors, resource nodes, player-placed structures, environmental changes

### 8.2 Full Snapshots on Region Transfer

Whenever a region migrates between servers (load balancing or crash recovery), the owning server emits a **full region snapshot** rather than a delta. This is the ground truth for the receiving server:

```cpp
FRegionSnapshot URegionManagerComponent::SerializeFullSnapshot()
{
    FRegionSnapshot Snap;
    Snap.RegionID    = OwnedRegionID;
    Snap.Players     = SerializeAllPlayers();
    Snap.AIEntities  = SerializeAllAI();
    Snap.WorldState  = SerializeWorldActors();
    Snap.Timestamp   = FDateTime::UtcNow().ToUnixTimestamp();
    return Snap;
}
```

### 8.3 Crash Recovery Flow

If a Cluster Unit Server process dies:

1. The Master Server detects the heartbeat timeout (within ~5 seconds).
2. It selects a **standby server** (pre-warmed idle process in the cluster).
3. The standby fetches the last full snapshot + subsequent deltas for the failed region from the DB.
4. The standby applies the snapshot, reconstructs the region, and registers itself as the new owner.
5. The Master Server reroutes all affected players to the standby.
6. Players experience a brief reconnect (< 5 seconds total in a well-tuned system).

---

## 9. Infrastructure & Orchestration

### 9.1 Containerizing UE5 Dedicated Servers

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
     "-RegionX=${REGION_X}", "-RegionY=${REGION_Y}", \
     "-port=7777"]
```

### 9.2 Kubernetes Deployment

Use Kubernetes (or AWS GameLift) to manage server scaling. Each `Pod` runs one Cluster Unit Server:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-unit-server
spec:
  replicas: 8    # adjust to world size
  template:
    spec:
      containers:
      - name: ue5-server
        image: your-registry/ue5-game-server:latest
        env:
        - name: REGION_X
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['region-x']
        - name: REGION_Y
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['region-y']
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

### 9.3 Amazon GameLift Alternative

For teams using AWS, Amazon GameLift provides a managed fleet that integrates with UE5 via an official plugin (compatible with UE5). It handles:

- Fleet auto-scaling
- Session management
- Server health monitoring

Integrate by installing the `AmazonGameLift` plugin and calling `InitSDK()` at server startup, then `ProcessReady()` once the region is initialized.

### 9.4 Redis for Shared State

Use Redis as the shared in-memory store between the Master Server and Cluster Unit Servers for low-latency region ownership lookups and player session data:

```
# Example Redis key structure
region:3:5          → { serverID, addr, playerCount, cpuLoad }
session:player_uuid → { regionX, regionY, serverAddr, lastSeen }
```

---

## 10. Performance Considerations & Known Limitations

### 10.1 UE5 Networking Ceiling

UE5's default networking code is optimized for **64–100 concurrent players per server**, not MMO-scale. The Replication Graph significantly extends this ceiling, but a single UE5 dedicated server process should realistically be expected to handle **200–400 concurrent players** before CPU becomes the bottleneck. The cluster architecture in this document distributes load across many processes to work around this.

The `OmniMesh` solution (used in production on Mortal Online 2) has demonstrated **~500 players in a single seamless battle** — showing what is achievable with heavily customized networking on top of UE5.

### 10.2 Cross-Server Latency

Ghost snapshot propagation between servers adds latency. Budget for:

- ~16–33 ms for ghost state to propagate (at 30–60 Hz broadcast)
- Plus network RTT between server machines (~1–5 ms in same datacenter)

This is generally imperceptible in an open-world MMO context. Tight competitive gameplay (e.g., 1v1 duels) at region boundaries needs special handling — consider briefly migrating one combatant to the other's region for the duration of the fight.

### 10.3 World Partition & Save Compatibility

World Partition's save system has known complexity with cell loading/unloading on dedicated servers. Test thoroughly with `wp.Runtime.EnableServerStreaming=1` enabled. If you encounter actor serialization issues, consider using **Data Layers** to group actors by persistent state:

```cpp
// Assign world actors to Data Layers by type
// e.g., "PersistentStructures", "DynamicSpawns", "PlayerBuildings"
// Data Layers can be loaded/unloaded independently
```

### 10.4 Replication Graph World Bounds Warning

For very large worlds, the Replication Graph's `UReplicationGraphNode_GridSpatialization2D` may log:

```
GetCellInfoForActor: Actor is outside world bounds. Clamping grid location.
```

Fix this by setting your world bounds explicitly in `DefaultEngine.ini`:

```ini
[/Script/Engine.WorldSettings]
bEnableLargeWorldCoordinates=true
WorldBoundsMin=(X=-1000000,Y=-1000000,Z=-500000)
WorldBoundsMax=(X=1000000,Y=1000000,Z=500000)
```

### 10.5 Large World Coordinates (LWC)

UE5.1+ introduced **Large World Coordinates** (double-precision positions), essential for worlds larger than ~10 km to avoid floating-point precision artifacts. Enable it:

```ini
[/Script/Engine.WorldSettings]
bEnableLargeWorldCoordinates=true
```

This is enabled by default in UE5.1+ open world templates.

---

## 11. Recommended Tech Stack Summary

| Layer | UE5 Tool / External Tool | Notes |
|---|---|---|
| World authoring | World Partition + OFPA | Cell size = 100,000 cm |
| Server streaming | `wp.Runtime.EnableServerStreaming=1` | UE5.1+ required |
| Replication | Replication Graph plugin (`GridSpatialization2D`) | Replace default net driver |
| Dedicated server | UE5 headless server binary | Linux containers |
| Master server | Go or Node.js + gRPC | Not a UE process |
| Region state store | Redis | Sub-ms lookup for routing |
| Persistence DB | PostgreSQL or ScyllaDB | Delta + full snapshots |
| Inter-server messaging | NATS or Redis Pub/Sub | Ghost snapshot transport |
| Client proxy/routing | Envoy L4 proxy or custom Go proxy | Gateway proxy model |
| Orchestration | Kubernetes or AWS GameLift | Auto-scaling fleet |
| Physics replication | `UNetworkPhysicsComponent` (UE5.4+) | Input rewind/resimulation |

---

## Further Reading

- [UE5 Networking Overview — Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine)
- [World Partition Documentation — UE5.7](https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine)
- [World Partition Server Streaming — Epic Knowledge Base](https://dev.epicgames.com/community/learning/knowledge-base/Xdj9/unreal-engine-world-partition-server-streaming)
- [Replication Graph Documentation — UE5.7](https://dev.epicgames.com/documentation/en-us/unreal-engine/replication-graph-in-unreal-engine)
- [UReplicationGraphNode_GridSpatialization2D — API Reference](https://docs.unrealengine.com/5.3/en-US/API/Plugins/ReplicationGraph/UReplicationGraphNode_GridSpatia-/)
- [Actor Relevancy and Priority (NetCullDistanceSquared) — Multiplayer Compendium](https://cedric-neukirchen.net/docs/multiplayer-compendium/actor-relevancy-and-priority/)
- [SetMaxDrawDistance — UE5 Blueprint API](https://dev.epicgames.com/documentation/en-us/unreal-engine/BlueprintAPI/LOD/SetMaxDrawDistance)
- [Cull Distance Volumes in Unreal Engine — UE5.7](https://dev.epicgames.com/documentation/en-us/unreal-engine/cull-distance-volumes-in-unreal-engine)
- [Travelling in Multiplayer — UE5 Docs](https://dev.epicgames.com/documentation/en-us/unreal-engine/travelling-in-multiplayer-in-unreal-engine)
- [AWS GameLift + UE5 Dedicated Server Guide](https://aws.amazon.com/blogs/gametech/unreal-engine-5-dedicated-server-development-with-amazon-gamelift-anywhere/)
- [OmniMesh — Battle-tested MMO networking for UE5](https://starvault.se/omnimesh-mmo-networking-unreal-engine-5/)
