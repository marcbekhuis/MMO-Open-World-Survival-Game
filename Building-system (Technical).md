# Building System in Unreal Engine 5

A technical design and implementation research guide based on the [Building System specification](Building-system.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Server Architecture (Technical)](<Server-architecture (Technical).md>). Engine facts were checked against Epic's 5.8 documentation on 11 October 2026, and each is linked where it is first used. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every API call needs validating against the engine version in use before it becomes production code.

The same migration boundary applies as in the server guide. A base — its pieces, their joints, health, and stability, its claim, and its upkeep — is plain data specified independently of Unreal actors, and the rules that act on it never ask an actor for the truth. Unreal is the integration layer that renders the pieces, provides their collision, replicates the records, and rebuilds navigation, and it can be replaced without changing a stored world.

Unreal has no structural-integrity system to build on. [Chaos Geometry Collections](https://dev.epicgames.com/documentation/unreal-engine/physics-in-unreal-engine) carry a cluster connection graph and damage thresholds, but they model fracture physics, not load carried from the ground through a structure, so the stability graph in [section 5](#5-stability-and-collapse) is the game's own.

---

## Table of Contents

1. [Pipeline Overview](#1-pipeline-overview)
2. [Data Model](#2-data-model)
3. [Snap Points and Placement](#3-snap-points-and-placement)
4. [Clean Joints](#4-clean-joints)
5. [Stability and Collapse](#5-stability-and-collapse)
6. [Damage, Fire, and Repair](#6-damage-fire-and-repair)
7. [Claims, Upkeep, and Decay](#7-claims-upkeep-and-decay)
8. [Spatial Queries for Other Systems](#8-spatial-queries-for-other-systems)
9. [Bases on Creatures](#9-bases-on-creatures)
10. [Rendering, Replication, and Persistence](#10-rendering-replication-and-persistence)
11. [Open Implementation Questions](#11-open-implementation-questions)
12. [Design Validation Cases](#12-design-validation-cases)
13. [Further Reading](#13-further-reading)

---

## 1. Pipeline Overview

Every change to a base follows one path. The client only ever proposes; the server decides, records, and tells everyone what changed.

```
Client (builder)                   Server (authoritative)                        Clients in range
----------------                   ----------------------                        ----------------
Piece item in hand
Snap candidates lit  ─► Placement ─► Validate: rights, exclusion, snap,  ─► FPieceRecord ─► FBuildingPiece ─► Rebuild ISM instances,
Preview stability       request      overlap, stability > 0, ceiling,     (persisted       (fast array      resolve joint variants,
(predicted)             (ids, not    item consumed                         delta row)       entry)           recolour hammer view
                        transforms)        │
                                           ├─► Stability: local recalculation (section 5)
                                           ├─► Claim area and upkeep ledger (section 7)
                                           ├─► Navigation: mark base bounds dirty (section 10.4)
                                           ├─► OnBuildingChanged(base, bounds) ─► Taming shelter re-check
                                           └─► OnCarriedWeightChanged(base, kg) ─► riding gait and flight mana draw (section 9)
```

Damage, repair, removal, style changes, upkeep decay, and collapse enter the same pipeline at the server column. Nothing about a piece's identity or condition lives only in an actor: if every building actor in a region were destroyed, the base would be assembled again from its records exactly as it stood.

## 2. Data Model

### 2.1 Materials

A material is a [`UPrimaryDataAsset`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UPrimaryDataAsset) loaded through the [Asset Manager](https://dev.epicgames.com/documentation/unreal-engine/asset-management-in-unreal-engine), and every property the specification lists for materials is a field on it. The family is open: adding fired brick or mana-laced stone is a new asset, not a code change. Materials, biomes, and snap types are [Gameplay Tags](https://dev.epicgames.com/documentation/unreal-engine/using-gameplay-tags-in-unreal-engine), whose hierarchy lets one entry name a whole family at once.

```cpp
UENUM()
enum class EStructureDamage : uint8 { Cutting, Crushing, Fire, Explosive, Earth, Count };

UCLASS()
class UBuildingMaterial : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) FGameplayTag Material;                 // Material.Timber.Rough, Material.Stone.Dressed
    UPROPERTY(EditAnywhere) float HealthScale = 1.f;               // multiplies a piece's base health
    UPROPERTY(EditAnywhere) uint16 VerticalLoss = 20;              // stability units lost per stacked joint (of 1000)
    UPROPERTY(EditAnywhere) uint16 LateralLoss = 250;              // stability units lost per sideways joint
    UPROPERTY(EditAnywhere) float Resistance[(uint8)EStructureDamage::Count] = {1, 1, 1, 1, 1}; // damage multipliers
    UPROPERTY(EditAnywhere) float Insulation = 0.f;                // 0..1, used by shelter and exposure queries
    UPROPERTY(EditAnywhere) bool bFlammable = false;               // burns and passes fire to flammable neighbours
    UPROPERTY(EditAnywhere) float WeatherRate = 1.f;               // health lost per day when unprotected
    UPROPERTY(EditAnywhere) TMap<FGameplayTag, float> BiomeExposure; // Biome.Jungle -> 3.0 for untreated timber
    UPROPERTY(EditAnywhere) TArray<FItemQuantity> UpkeepPerPiece;  // daily materials per piece, before the size factor
};
```

The two loss values are what make stone and timber behave differently. Dressed stone has a small vertical loss and a large lateral one, so it rises tall and spans poorly; timber has a larger vertical loss and a smaller lateral one, so it spans further but cannot rise as high; reinforced stone is low on both. Losses are integers on a scale of 1000 so that the stability arithmetic in [section 5](#5-stability-and-collapse) is exact and identical on every machine.

### 2.2 Piece Definitions

A piece definition describes one placeable thing, structural or not. Its snap points are authored in the editor as [`UStaticMeshSocket`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UStaticMeshSocket)s on the piece's mesh, whose `Tag` field names the snap type, and an editor step bakes them into the definition so the rules never have to load a mesh to know where a piece can join.

```cpp
UENUM()
enum class EPieceFamily : uint8
{
    Foundation, WallFoundation, Pillar, Wall, Door, FloorCeiling, Roof, Stairs, FrameBeam,
    Placeable,      // stations, chests, beds, hearths, troughs, furniture, decoration: free placement
    ClaimMarker,
    Siege,          // ladders, grappling lines, rams, siege engines placed by outsiders
    CreatureFoundation
};

UENUM()
enum class EJointKind : uint8 { Vertical, Lateral };

USTRUCT()
struct FSnapPoint
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FTransform Local;                 // baked from the mesh socket
    UPROPERTY(EditAnywhere) FGameplayTag Type;                // Snap.Wall.Bottom, Snap.Pillar.Face.FlushLeft
    UPROPERTY(EditAnywhere) FGameplayTagContainer Accepts;    // snap types this point can meet
    UPROPERTY(EditAnywhere) EJointKind Joint = EJointKind::Lateral;
    UPROPERTY(EditAnywhere) uint8 JointSlot = 0;              // which side of the piece, for joint variants (section 4)
};

UCLASS()
class UBuildingPieceDefinition : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) EPieceFamily Family = EPieceFamily::Wall;
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UBuildingMaterial> Material;
    UPROPERTY(EditAnywhere) FPrimaryAssetId Item;              // the inventory item this piece is placed from
    UPROPERTY(EditAnywhere) float BaseHealth = 1000.f;
    UPROPERTY(EditAnywhere) float WeightKg = 0.f;              // the carried weight, also counted on creature bases
    UPROPERTY(EditAnywhere) TArray<FSnapPoint> SnapPoints;
    UPROPERTY(EditAnywhere) FBox CoreBounds;                   // shrunk volume used for overlap tests (section 3.4)
    UPROPERTY(EditAnywhere) float GroundSkirtCm = 0.f;         // how far a foundation may sink to settle (section 3.3)
    UPROPERTY(EditAnywhere) bool bProvidesCover = false;       // roofs: the space below counts as covered
    UPROPERTY(EditAnywhere) uint8 OverlapPriority = 0;         // section 4.2
    UPROPERTY(EditAnywhere) TArray<FPieceStyle> Styles;        // rough, planked, carved: each with its joint variants
    UPROPERTY(EditAnywhere) float ReachRadiusCm = 0.f;         // troughs, hearths, braziers: effect radius
    UPROPERTY(EditAnywhere) float HeatOutput = 0.f;            // hearths and braziers
};
```

Square and triangular shapes are separate definitions with their own snap points. Frames and beams carry snap points and joint slots like any structural piece but give and take no stability, pending the backlog item on [whether frames and beams carry load](Design-backlog.md).

### 2.3 Runtime Records

Runtime state is engine-independent and is what the world persists. Like the settlement records, it stores identifiers rather than pointers.

```cpp
enum class EPieceFlags : uint8
{
    None = 0, Burning = 1 << 0, Siege = 1 << 1, GroundSupported = 1 << 2, Decaying = 1 << 3
};

struct FPieceLink
{
    uint32 OtherPiece = 0;
    uint8 MySnap = 0;
    uint8 OtherSnap = 0;
    EJointKind Joint = EJointKind::Lateral;
};

struct FPieceRecord
{
    uint32 PieceId = 0;                  // unique within the base, never reused
    FPrimaryAssetId Definition;          // e.g. BuildingPiece:Wall_Stone_Dressed_Square
    FName Style;
    FTransform Local;                    // relative to the base origin
    float Health = 0.f;
    uint16 Stability = 0;                // 0..1000, persisted so a load needs no full pass
    uint8 Flags = 0;                     // EPieceFlags
    double LastDamageTime = -1.0e9;      // repair lockout, section 6.3
    double ExpiresAt = 0.0;              // siege pieces and unclaimed foundations, section 7.5
    uint32 HostPiece = 0;                // placeables: the piece they stand on or hang from
    FGuid ContainerId;                   // chests and troughs: inventory lives in the inventory system
    TArray<FPieceLink> Links;            // the snap joints this piece shares, both directions stored
};

struct FClaimRecord
{
    uint64 ClaimId = 0;
    uint32 MarkerPiece = 0;
    FGuid Owner;                         // character or guild; access grants come from the guild system
    FGuid MarkerStore;                   // container holding the upkeep materials
    double PaidUntilDay = 0.0;           // section 7.2
    double StarvingSinceDay = -1.0;      // -1 while upkeep is paid
    enum class EState : uint8 { Active, Starving, Unprotected, Lapsed } State = EState::Active;
};

struct FBaseRecord
{
    uint64 BaseId = 0;                   // world-unique
    FVector Origin;                      // world position, large world coordinates
    FQuat Rotation;
    FGameplayTag Biome;                  // sampled once at the base origin
    FGuid CarrierCreature;               // valid for a base on a creature, section 9
    float CarriedWeightKg = 0.f;         // every piece's WeightKg plus container contents, kept current by the server (section 9)
    TOptional<FClaimRecord> Claim;
    uint32 NextPieceId = 1;
    uint32 ContentVersion = 0;           // stability is recomputed once if the piece library changed
    TArray<FPieceRecord> Pieces;         // sorted by PieceId
};
```

A base is any connected set of pieces. Pieces placed with no connection to an existing base start a new one, and a removal that splits a base's piece graph in two splits the record (section 7.1). In the [world state database](<Server-architecture (Technical).md#3-master-server-implementation>) each piece is one row keyed by world, base, and piece id, so a raid that breaks a dozen walls is a dozen small updates in the [delta stream](<Server-architecture (Technical).md#81-delta-state-updates>).

## 3. Snap Points and Placement

### 3.1 Snap Compatibility

Two snap points can meet when each one's `Accepts` contains the other's `Type`. The tag hierarchy keeps the tables short: a wall bottom accepts `Snap.Foundation.Edge` and `Snap.WallFoundation.Top`, a ceiling edge accepts `Snap.Wall.Top` and `Snap.Pillar.Top`, and a stair foot accepts `Snap.Floor.Edge`. Pillars carry three points on every face at every height step — centred, flush left, and flush right — which gives the specification's choice of a wall meeting a post in its middle or at either outer corner, from any of four sides. Walls carry frame points along their edges, middle, and quarter lines on both faces for frames, crossbeams, braces, and trims.

### 3.2 Candidate Selection on the Client

While a piece is in hand, the client gathers every snap point on pieces within reach whose type the held piece can meet, transforms each into world space, and lights them all as markers. The candidate nearest the builder's aim ray becomes the highlighted one, and a cycle input steps through the others at the same spot in order of distance, breaking ties by piece id and snap index so the order never flickers. The preview is placed by aligning one of the held piece's snap points to the chosen candidate, then rotated by the piece's allowed rotation steps.

The client never sends that transform. A placement request names the target base, target piece, target snap index, the held definition, its own snap index, the rotation step, and the style, and the server recomputes the transform from the same baked data. A forged position cannot be placed, and the server's transform is the one recorded and replicated, so a client's preview never drifts from what stands.

Free-standing pieces — the first foundation of a base, wall foundations on open ground, pillars, and placeables — have no target snap, so their requests carry a transform, which the server clamps to reach and validates on its own terms.

### 3.3 Ground Contact

A foundation settles onto uneven ground by sinking into it. The server samples the terrain under the foundation's corners and centre with [`UWorld::LineTraceSingleByChannel`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UWorld) against the landscape channel. When the highest and lowest samples differ by no more than the definition's `GroundSkirtCm`, the foundation is level with its highest sample, its skirt hides the gap below, and it is flagged `GroundSupported`. When the ground falls away further, the foundation can still be placed if a joint gives it stability, but it is not a ground source: it is held by its neighbour, as in the specification's worked example, until a pillar beneath it reaches the ground. A pillar is a ground source when its foot rests on terrain within the same tolerance or on a foundation.

### 3.4 Server Validation

The server accepts a placement only when every check passes, in an order that puts the cheap checks first:

1. **Item.** The builder holds the piece item, which is consumed only when the placement commits.
2. **Reach.** The computed transform lies within the builder's reach.
3. **Rights.** Inside a claim, the builder holds building rights there or the piece is a siege piece; outside any claim, anyone may build (section 7.1). A foundation placed by a rights holder must keep its claim radius clear of every other claim by the claim gap.
4. **Exclusion.** The piece does not overlap a resource node, a road, or the protected ground of an NPC settlement or great city. Roads and protected ground are authored exclusion volumes in the level; resource nodes are found with [`UWorld::OverlapMultiByChannel`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UWorld) against their collision channel.
5. **Snap.** The two snap points are compatible and the target snap is not already occupied.
6. **Overlap.** The piece's `CoreBounds` does not intersect another piece's core, a character, or a creature, tested with `OverlapBlockingTestByChannel`. Core bounds are shrunk so that pieces meeting at a joint, which are expected to overlap at their edges, never fail this test.
7. **Stability.** The stability the piece would receive (section 5.1) is above zero.
8. **Ceiling.** The base has room under its claim's piece ceiling or its creature's piece budget.

A rejected request returns a reason code so the preview can show why, such as an exclusion zone, a rival claim, or a piece that would not stand.

### 3.5 Placeables

Stations, chests, beds, hearths, troughs, furniture, and decoration are placed freely. The client offers fine rotation steps, small nudges, alignment to the surface normal under the aim point, and an optional light grid in the host piece's local frame; the request carries the final transform and the id of the host piece it rests on or hangs from. The server checks reach, rights, and overlap, and that the placeable's footprint actually touches its host. Placeables take no part in the stability graph.

### 3.6 Replacing, Restyling, and Removing

Upgrading is removal followed by placement, exactly as the specification describes, so there is no upgrade code path. Removal by a rights holder deletes the record, returns a fraction of the piece's materials to the remover's inventory, and runs the stability removal pass, which is what opens the moment of weakness the specification describes. A style change rewrites the record's `Style` and nothing else: health, stability, links, and piece id are untouched, and clients swap the instance into the component for the new style's mesh.

## 4. Clean Joints

### 4.1 Neighbour-Aware Variants

Each style of a piece carries a table of mesh variants keyed by what occupies each of its joint slots. A wall has slots for its two ends, its top, and its bottom; each slot reads as empty or as the joint class of the piece snapped there, such as straight wall, corner wall, pillar centred, pillar flush, or beam. A wall whose right end meets another wall at ninety degrees resolves to its corner variant, a wall with a third wall arriving resolves to its T-junction, a run that stops resolves to its end cap, and a beam crossing a post resolves to its notched form.

```cpp
USTRUCT()
struct FJointVariant
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) TArray<FGameplayTag> SlotPattern;   // one entry per joint slot; empty tag = wildcard
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UStaticMesh> Mesh;
};

USTRUCT()
struct FPieceStyle
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FName Style;
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UStaticMesh> DefaultMesh;
    UPROPERTY(EditAnywhere) TArray<FJointVariant> Variants;     // first full match wins; authored most specific first
};
```

Variant resolution is a pure function of a piece's record and its linked neighbours' records, so it runs only on clients, only for the changed piece and the pieces linked to it, and never needs replicating. Every client holding the same records shows the same joints. Collision always uses the piece's default shape, so a visual variant can never change where a character can walk.

### 4.2 Overlap Priority

Where two surfaces still overlap after variants are resolved, the piece with the higher `OverlapPriority` keeps its surface and the other hides the overlapped part; equal priorities resolve to the lower piece id, so the outcome is deterministic. Pillars outrank walls, walls outrank frames and trims, and wall foundations outrank floors, which is what keeps a floor tucked under a wall foundation from showing through it.

The hiding is done in the material. Each instance carries [per-instance custom data](https://dev.epicgames.com/documentation/unreal-engine/instanced-static-mesh-component-in-unreal-engine) set through `SetCustomDataValue`, and the piece's masked material discards pixels inside the winning neighbour's core box, passed in the instance's local space. [Nanite](https://dev.epicgames.com/documentation/unreal-engine/nanite-virtualized-geometry-in-unreal-engine) supports masked materials on instanced meshes, but their cost on a large base has not been measured and needs prototyping. A [pixel depth offset](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/EPixelDepthOffsetMode) on the losing surface is the fallback to test; Epic gives no guidance on using it against overlapping geometry, and community reports of its limits, such as shadows ignoring it, are unverified.

## 5. Stability and Collapse

### 5.1 The Rule

Stability is an integer from 0 to 1000. A piece flagged `GroundSupported` and a creature foundation are sources at 1000. Every other structural piece takes the best value any linked neighbour offers it, where a neighbour offers its own stability minus the receiving piece's material loss for that joint's kind:

```
Stability(P) = 1000                                                    if P is a source
Stability(P) = max over links L of  Stability(L.Other) - Loss(Material(P), L.Joint)   otherwise, floored at 0
```

Because the loss belongs to the receiving piece's material, a timber balcony on a stone wall spans like timber, and a stone tower on timber pillars loses height like stone. Frames, beams, placeables, and siege pieces are outside the graph.

### 5.2 Local Recalculation

Placing a piece only ever raises values. The server computes the new piece's stability from its links, then pushes it onto a queue and relaxes outward: any neighbour that would receive more than it holds is raised and queued in turn. The pass stops where nothing changes, which in practice is within a few joints.

Removing a piece is the harder case, because a piece that drew its value from the removed one may have another path to the ground. The server uses the two-phase method common in voxel lighting. The first phase walks outward from the removed piece and marks a piece dirty when its stored value is exactly what a dirty or removed neighbour offered it; integer losses make that equality test exact. The second phase reseeds every dirty piece from its clean neighbours and relaxes the dirty set with a max-priority queue, so each piece ends with its best surviving path. Dirty pieces left at zero collapse.

```cpp
void FStabilityGraph::Remove(FBaseRecord& Base, TConstArrayView<uint32> Removed, TArray<uint32>& OutCollapsed)
{
    TSet<uint32> Dirty;
    TArray<uint32> Walk;
    for (const uint32 Id : Removed)
    {
        Dirty.Add(Id);
        Walk.Add(Id);
    }

    // Phase 1: find every piece whose value came through a removed or dirty piece.
    while (Walk.Num() > 0)
    {
        const FPieceRecord& From = Base.Piece(Walk.Pop());
        for (const FPieceLink& Link : From.Links)
        {
            FPieceRecord& To = Base.Piece(Link.OtherPiece);
            if (!Dirty.Contains(To.PieceId) && !IsSource(To) && InGraph(To)
                && To.Stability > 0 && To.Stability == Offer(From, To, Link.Joint))
            {
                Dirty.Add(To.PieceId);
                Walk.Add(To.PieceId);
            }
        }
    }
    for (const uint32 Id : Removed)
    {
        Dirty.Remove(Id);
        Base.Piece(Id).Stability = 0;   // removed pieces offer nothing; the caller deletes their records after the pass
    }

    // Phase 2: reseed dirty pieces from clean neighbours, then relax inside the dirty set.
    TArray<TPair<uint16, uint32>> Heap;   // (stability, piece), max-heap
    for (const uint32 Id : Dirty)
    {
        FPieceRecord& Piece = Base.Piece(Id);
        Piece.Stability = BestOfferFromClean(Base, Piece, Dirty);
        Heap.HeapPush({Piece.Stability, Id}, TGreater<>());
    }
    while (Heap.Num() > 0)
    {
        TPair<uint16, uint32> Top;
        Heap.HeapPop(Top, TGreater<>());
        const FPieceRecord& From = Base.Piece(Top.Value);
        if (Top.Key != From.Stability) { continue; }        // stale entry
        for (const FPieceLink& Link : From.Links)
        {
            if (!Dirty.Contains(Link.OtherPiece)) { continue; }
            FPieceRecord& To = Base.Piece(Link.OtherPiece);
            const uint16 Offered = Offer(From, To, Link.Joint);
            if (Offered > To.Stability)
            {
                To.Stability = Offered;
                Heap.HeapPush({Offered, To.PieceId}, TGreater<>());
            }
        }
    }

    for (const uint32 Id : Dirty)
    {
        if (Base.Piece(Id).Stability == 0) { OutCollapsed.Add(Id); }
    }
}
```

Both passes touch only the pieces whose values actually change, which is the property the specification asks for. A piece removed at the edge of a large hall visits a handful of records; a pillar under a three-span balcony visits the balcony. The worst case, a key pillar under a whole wing, is bounded by the wing and by the claim's piece ceiling. Stability is persisted with each record, so a base loaded from storage needs no pass at all unless the piece library has changed since it was saved, in which case `ContentVersion` triggers one full recomputation at load.

### 5.3 Collapse and Falling Rubble

Collapsed pieces are removed in the same commit that destroyed their support. Removing a piece at zero changes nobody else's value, because a piece at zero offers nothing, so collapse needs no second stability pass. Each collapsed piece then drops rubble: the server finds the pieces beneath its footprint with an overlap test against the building channel and applies crushing damage scaled by the collapsed piece's weight. That damage can destroy further pieces, which run their own removal pass in turn. Cascades are processed in waves with a per-tick budget, continuing on the next tick when the budget is spent, so the collapse of a keep plays out over a few frames rather than stalling the region.

Placeables whose host piece collapses are handled as [section 11](#11-open-implementation-questions) records.

### 5.4 What the Builder Sees

The placement preview colours itself from the stability its target joint would give it, predicted on the client from the replicated stability of the neighbour, and the server's result replaces it on commit. The builder's hammer view colours every built piece from its replicated value. Both use the same banding: blue near 1000, then green, yellow, and red as the value falls, with the band edges set in one shared curve asset so the preview and the hammer can never disagree.

## 6. Damage, Fire, and Repair

### 6.1 Damage Kinds and Resistance

All damage to pieces enters through one server function, whatever the source: a raider's axe, a ram, a catapult stone, a [Fireball](Magic/Spells/Fire/Fireball.md), a great creature's weight, or falling rubble. The caller names the kind and amount; the function multiplies the amount by the material's `Resistance` for that kind, subtracts it from health, stamps `LastDamageTime`, sets `Burning` when fire meets a flammable material, and sends a piece at zero health through the removal pass of section 5.

Cutting, crushing, fire, explosive, and earth damage come from the systems that own their sources: weapons and tools under combat, spells under [Magic](Magic.md), siege engines as siege pieces, and creatures under their AI. A creature's brain calls this same entry point with the crushing kind (and the fire kind for a dragon's breath), as [Taming and Control (Technical)](<Taming-and-control (Technical).md#7-creature-ai-architecture>) describes. Explosive and earth effects are area effects; the caller gathers the pieces in its radius through the query subsystem and applies its own falloff before calling in. NPC buildings use the same material assets, so a raider's axe meets the same resistance on an NPC wall, while how damage to an NPC building is tracked and rebuilt stays with [Settlement Generation (Technical)](<Settlement-generation (Technical).md#6-damage-collapse-and-rebuilding>).

### 6.2 Fire

A burning piece loses health on a fixed tick, scaled by its fire resistance, until its health reaches zero, a player puts it out, or rain reaches it. On each tick it may ignite each flammable piece it is linked to, so fire moves along the joint graph from timber to timber and stops at stone. Rain is read from the weather system's precipitation state at the piece and applies only to pieces with no cover above them, found with the same roof query that shelter uses (section 8), so a fire inside a roofed timber hall keeps burning through a downpour. Burning is a flag on the record, replicated like any other change, and clients drive the flames from it.

### 6.3 Repair and the Lockout

Repair with a hammer restores health in exchange for materials in proportion to the health restored. It is refused while `Now - LastDamageTime` is shorter than the repair lockout, a single tuning value, so every hit restarts the piece's lockout and a wall under steady attack cannot be mended. The lockout is per piece, which means defenders can still repair the far side of the base during a raid on the gate.

### 6.4 Siege Pieces

Siege pieces are the only pieces an outsider can place inside a claim. They snap to their own points, such as a ladder's foot to the ground and its head to a wall top, and every one is placed with an `ExpiresAt` a short time ahead, after which it is removed. They do not extend a claim, do not count against the piece ceiling, and sit outside the stability graph. A ram or a siege engine is a placed piece that its operators then use; its operation belongs to combat, and only its placement, health, and expiry belong here.

## 7. Claims, Upkeep, and Decay

### 7.1 The Claim Area and Building Rights

A claim's area is the union of horizontal discs of a fixed claim radius centred on every foundation and wall foundation in the claim marker's connected component of the piece graph. The query subsystem keeps a world-level two-dimensional grid of claim discs, so `ClaimAt(Location)` is a cell lookup and a few distance tests. Building rights inside the area belong to the claim's owner and to whoever the [Guilds and Factions](Guilds-and-factions.md) system grants access; this guide reads those grants and stores none of its own. A new foundation that would extend a claim must keep its disc at least the claim gap away from every other claim's discs, which is what stops one base from walling in another.

Connectivity is checked whenever a removal could split the graph. The server walks from the marker's foundation, bounded by the base, and any pieces it cannot reach split off into a new, unclaimed base record whose foundations and pillars start the unclaimed timer in section 7.5.

### 7.2 The Upkeep Ledger

Upkeep is not simulated per day. The claim stores the day on which its marker's stock will run out, and that day is recomputed only when the stock or the set of pieces changes.

```
DailyNeed(item) = SizeFactor(structural piece count) × Σ over structural pieces  UpkeepPerPiece(material, item) × BiomeExposure(material, base biome)
PaidUntilDay    = Now + min over items  Stock(item) / DailyNeed(item)            -- see section 11 on mixed stores
```

`SizeFactor` is a curve that rises with the piece count and rises faster for very large bases.

The stock is drawn down lazily: whenever the store is opened, a piece changes, or a daily housekeeping pass visits the base, the elapsed days' worth of materials is removed and `PaidUntilDay` recomputed. Weathering is folded into this ledger rather than simulated alongside it. While upkeep is paid, the marker is keeping every connected piece in repair, so weathering appears as cost — scaled by the material's exposure to the base's biome, which is how untreated timber in the [Jungle](Biomes/Jungle.md) becomes an expensive habit — and never as lost health. The specification's other biome challenges find their homes in the same data: rot and flooding in the [Jungle](Biomes/Jungle.md) and [Swamp](Biomes/Swamp.md) are high `BiomeExposure` entries for untreated materials, while treated timber and waterproof materials carry low ones; snow loads and avalanches in the [Tundra](Biomes/Tundra.md) and [Mountain Range](Biomes/Mountain-range.md) are likewise a heavier weathering cost on weak materials, answered by reinforced materials; and the cold itself is answered by `Insulation` and by `HeatOutput` from hearths and braziers, the specification's heated foundations being a foundation definition with a `HeatOutput` of its own. The same catch-up arithmetic serves a base whose region nobody has visited for a week, which is what the shared-clocks item in the [Design Backlog](Design-backlog.md) asks of every absent system.

### 7.3 Decay from the Outside In

When `PaidUntilDay` passes, the claim enters `Starving` and weathering turns into lost health. Decay is processed in daily steps, caught up on load in the same way as upkeep. Each step finds the base's exposed pieces with a coarse flood fill of open air from the edge of the base's bounds: a piece is exposed when it borders a cell the outside air reaches. Only exposed pieces decay, each losing its material's `WeatherRate` scaled by its biome exposure, so weak materials go first. A piece that decays to nothing is destroyed through the ordinary removal pass and may expose the pieces behind it to the next step, which is what carries decay inward. The flood fill is a whole-base operation, but it runs only on bases that are already starving, once per in-game day, so it stays off the path that live building and raiding use.

After a fixed number of days in `Starving`, the claim becomes `Lapsed`: its discs leave the claim grid, the land is open to anyone, and any player may demolish its pieces and salvage their materials as if they held rights. Refilling the store before the lapse returns the claim to `Active` and stops decay.

### 7.4 Destroying the Marker

The claim marker is a piece with health like any other. When it is destroyed, the claim enters `Unprotected` at once: its discs stop granting exclusive rights, so attackers can place any piece inside the walls, and decay starts as in a starving claim without waiting for the store to run out.

### 7.5 Unclaimed Pieces and Ceilings

A foundation or pillar placed outside any claim's connected component carries an `ExpiresAt` a few days ahead and is destroyed when it passes, together with whatever its loss brings down. Linking it to a claimed base clears the timer; splitting it off sets it again. Every claim also has a ceiling on its piece count. Placeables count toward the ceiling, because its purpose is to bound what a region server must hold and replicate; whether they also pay upkeep is an open question in [section 11](#11-open-implementation-questions).

## 8. Spatial Queries for Other Systems

Other systems never read piece records directly. They call `UBuildingQuerySubsystem`, a server-side [`UWorldSubsystem`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UWorldSubsystem), which keeps a world-level index of base bounds and, inside each base, a spatial hash of pieces in base-local cells. Because queries run in base-local space, they work unchanged on a base riding a creature.

```cpp
struct FPlacedObjectRef
{
    uint64 BaseId = 0;             // the base the piece belongs to
    uint32 PieceId = 0;            // unique within that base
};

struct FShelterFacts
{
    bool bRoofed = false;          // a cover-providing piece lies straight above
    float Warmth = 0.f;            // summed heat from sources that reach this point in the same space
    float Insulation = 0.f;        // mean insulation of the enclosing pieces, 0 in the open
};

UCLASS()
class UBuildingQuerySubsystem : public UWorldSubsystem
{
    GENERATED_BODY()
public:
    bool IsRoofed(const FVector& Point) const;
    FShelterFacts SampleShelter(const FVector& Point) const;
    void TroughsInReach(const FVector& Point, TArray<FPlacedObjectRef>& OutTroughs) const;
    bool HasClearance(const FVector& Point, const FVector& StandHalfExtents, float TurnRadius) const;
    bool AnyPieceInBox(const FBox& WorldBox) const;
    const FClaimRecord* ClaimAt(const FVector& Point) const;
    bool HasBuildRights(const FVector& Point, const FGuid& Character) const;

    DECLARE_MULTICAST_DELEGATE_TwoParams(FOnBuildingChanged, uint64 /*BaseId*/, const FBox& /*WorldBounds*/);
    FOnBuildingChanged OnBuildingChanged;

    float GetCarriedWeightKg(uint64 BaseId) const;             // FBaseRecord::CarriedWeightKg; 0 for an unknown base

    DECLARE_MULTICAST_DELEGATE_TwoParams(FOnCarriedWeightChanged, uint64 /*BaseId*/, float /*NewWeightKg*/);
    FOnCarriedWeightChanged OnCarriedWeightChanged;
};
```

Each query returns a building fact and leaves the judgement to the caller; the first four answer the specification's shelter conditions.

- **`IsRoofed`** walks the cells straight above the point within the base's bounds for a piece with `bProvidesCover`. Only roofs carry the flag, so cover is judged from the roofs above, as the specification says, and walls around a point never count.
- **`TroughsInReach`** returns every trough whose `ReachRadiusCm` contains the point. The trough's stock is held in the container its piece record names; how fast creatures eat from it is taming's concern.
- **`SampleShelter`** sums the heat of every hearth and brazier whose reach contains the point and whose line to it, traced with `LineTraceSingleByChannel` on the building channel, crosses no wall. That unbroken line is how "the same space" is decided without computing rooms. It also returns whether the point is roofed, which is the shade, and the mean insulation of the pieces found by short horizontal traces around the point, which is what lets clay and brick keep a space cool. [Survival](Survival.md#temperature-and-exposure) can call the same query for a player's exposure.
- **`HasClearance`** tests a standing box and a turning cylinder against the building channel with `OverlapBlockingTestByChannel`, using extents the caller derives from the creature's body size. On top of a wall or in a yard, the same test tells flight whether a flyer has room to land.
- **`AnyPieceInBox`** answers whether any placed piece lies in a volume, which flight uses to keep a take-off run clear of structures.

Taming's shelter evaluation, described in [Taming and Control (Technical)](<Taming-and-control (Technical).md>), combines these with the creature's `FCreatureNeeds`. It does not poll: it re-evaluates the shelters inside the bounds passed to `OnBuildingChanged`, which the server broadcasts after every committed change, and reacts to trough stock changes through the inventory system.

## 9. Bases on Creatures

A base on a creature is an ordinary `FBaseRecord` whose `CarrierCreature` (the creature's `FGuid`) is set. It begins with a creature foundation, a piece family that can only be placed against the attachment socket authored on that species' skeleton — along the [Flying Leviathan](Creatures/Flying-leviathan.md)'s back for a deck, on the [Titan Turtle](Creatures/Titan-turtle.md)'s shell for a saddle structure. A creature foundation is a stability source, so everything above it follows the rules of section 5 unchanged. Each carrying species has a small `UCreatureBaseProfile` data asset naming its attachment socket and its piece budget, which takes the place of a claim's piece ceiling.

The base actor is attached to the creature's mesh at that socket, so its pieces' collision moves with the creature. Characters walking the deck ride it through the [Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UCharacterMovementComponent)'s movement-base support, which keeps a character standing on a moving object based on it and can impart the base's velocity when they step or fall off.

Building rights on a creature base come from the creature's keeper, read from its `FBondRecord`, rather than from a claim; there is no claim marker and no upkeep ledger, because the creature's care takes the place of upkeep. The building system keeps the base's carried weight in `FBaseRecord::CarriedWeightKg` — the sum of every piece's `WeightKg` and the weight of the containers' contents as the inventory system reports it — and exposes it through `UBuildingQuerySubsystem::GetCarriedWeightKg`, broadcasting `OnCarriedWeightChanged` whenever it changes. The turtle's burden on its gait and steering is applied by the `UMountComponent` described in [Creature Riding (Technical)](<Creature-riding (Technical).md>), and the leviathan's mana draw by the `UFlightComponent` described in [Flight (Technical)](<Flight (Technical).md>); this guide owns only the number.

The base record travels with its creature as part of the creature's transfer group under the [group rules](<Server-architecture (Technical).md#72-preparation-cutover-and-group-state>) of the server guide. Its exact membership rules — placed pieces, stored contents, and occupants walking the deck — are pending the backlog item on [connected structures and mobile bases](Design-backlog.md), and this guide treats the record as one unit until that item is settled.

## 10. Rendering, Replication, and Persistence

### 10.1 One Actor per Base

A piece is never an actor. Each base is one actor holding one [`UInstancedStaticMeshComponent`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UInstancedStaticMeshComponent) per distinct mesh it uses, with pieces as instances added, moved, and removed through `AddInstance`, `UpdateInstanceTransform`, and `RemoveInstance`. Epic's guidance is that a Nanite-only project should always use instanced static meshes rather than the hierarchical variant, and the piece kit is built for [Nanite](https://dev.epicgames.com/documentation/unreal-engine/nanite-virtualized-geometry-in-unreal-engine), whose hard cap of 16 million streamed-in instances sits far above any region's piece count. A joint variant or style change moves an instance from one component to another; Epic documents no dedicated way to swap an instance's mesh, so this is the expected method rather than a confirmed one. Per-instance custom data carries the hammer-view stability colour, the burning state, the damage state that drives cracked materials, and the overlap clip box from section 4.2.

The server spawns the same actor with the same components for collision, which characters, creatures, and placement tests all rely on, and never renders it. Instance collision is shared per component, which suits pieces of one mesh; the cost of collision on bases of several thousand instances on a dedicated server needs measuring. Epic's Instanced Actors plugin was considered and set aside: it is built for instances populated offline and spawned near players, not for pieces players place and break.

### 10.2 Replication

The base actor replicates its pieces as a [`FFastArraySerializer`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/NetCore/FFastArraySerializer) of `FBuildingPiece` entries, each a compact copy of a record: piece id, an index into a registry of piece definitions and styles built identically on server and client from cooked content, a quantised local transform, health and stability as single bytes, flags, and host piece. Links are not replicated; clients rebuild them from the snap data, which is all variant resolution needs. The server calls `MarkItemDirty` after adding or changing an entry and `MarkArrayDirty` after a removal, and clients react in `PostReplicatedAdd`, `PostReplicatedChange`, and `PreReplicatedRemove` by updating the affected instances and re-resolving joints around them.

A base at rest changes rarely, so its actor uses [network dormancy](https://dev.epicgames.com/documentation/unreal-engine/actor-network-dormancy-in-unreal-engine), set to `DORM_DormantAll` in its constructor, since Epic reserves `DORM_Initial` for actors placed in the map, and returned to dormancy after a quiet period, with `FlushNetDormancy` called before any change to the array. Which clients receive a base is decided by the [Replication Graph](https://dev.epicgames.com/documentation/unreal-engine/replication-graph-in-unreal-engine) setup in the [server guide](<Server-architecture (Technical).md#5-replication-graph-visibility-driven-sync>), and bases use the stationary radius described in [Dynamic Culling and Render Distance](Dynamic-culling-and-render-distance.md), except that a creature-borne base takes the relevancy radius of its carrier creature, so a deck is relevant to exactly the clients that can see the leviathan beneath it. Epic's 5.8 [release notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes) call the Iris replication system production-ready while its 5.8 documentation pages still label it Experimental; Iris cannot be combined with the Replication Graph and has its own fast array type, so whether to move to it is an open question recorded in the [Design backlog](Design-backlog.md), and nothing here depends on the answer. The size and time of a client's first replication of a base near the piece ceiling must be measured early, because that is the moment a large base costs the most.

### 10.3 Persistence and Streaming

The records are the truth. [World Partition](https://dev.epicgames.com/documentation/unreal-engine/world-partition-in-unreal-engine) documents the streaming of editor-placed actors and says nothing about persisting runtime-spawned ones, so a base actor is never trusted to survive a cell unloading. When a cell loads, the server reads the base rows inside it and spawns each base actor from its records, as [Settlement Generation (Technical)](<Settlement-generation (Technical).md#75-cell-streaming-and-persistence>) does for lots. Piece changes go to the delta stream as row upserts and deletes, a collapse cascade is written as one batch, and region transfers and crash recovery use the full snapshots of the [server guide](<Server-architecture (Technical).md#8-persistence-delta-backups--crash-recovery>). Retired piece definitions follow the same redirect rule as retired building assets in the settlement guide.

Runtime-spawned bases are not part of the baked World Partition HLODs, so they have no prebuilt distant view. Nanite's own level of detail keeps distant pieces cheap to draw; whether a very large base also needs a generated far proxy is a measurement item for the [hotspot workloads](Design-backlog.md) the backlog already lists.

### 10.4 Navigation

Only the server needs navigation around bases, for creatures, NPC raiders, and tamed animals reaching their troughs. Floors, stairs, and ramps add new walkable surfaces, which Epic's [Dynamic Modifiers Only mode](https://dev.epicgames.com/documentation/unreal-engine/overview-of-how-to-modify-the-navigation-mesh-in-unreal-engine) cannot create, so regions use the full Dynamic runtime mode, which regenerates the tiles a change touches. Changes to a base are gathered for a tick and the union of the changed pieces' bounds is marked dirty once, so a collapse rebuilds its tiles once rather than once per piece. [Navigation invokers](https://dev.epicgames.com/documentation/unreal-engine/using-navigation-invokers-in-unreal-engine) keep generation to the areas around active agents. As in the settlement guide, the rebuild cost of a large collapse on a dedicated server needs prototyping early.

### 10.5 Collapse on Screen

Destruction is cosmetic on the client and authoritative only as record removal. When a client sees a piece removed with its collapse flag, it hides the instance and plays a pre-fractured debris effect for that piece family locally. Debris is never replicated and never decides anything: rubble damage was already computed by the server from the collapsed piece's footprint (section 5.3), so two clients may see different fragments fall while the same pieces break beneath them.

## 11. Open Implementation Questions

Each of these needs a design decision before the code in this guide can be finished:

- **Mixed upkeep stores.** The marker holds several materials. Does a shortage of one material starve the whole claim, or only the pieces made of it? The sketch in 7.2 starves the whole claim on the first material to run out.
- **Upkeep and combat damage.** This guide reads "keep every connected piece in repair" as offsetting weathering only, leaving raid damage to the hammer. Should upkeep also mend combat damage slowly once the repair lockout has passed?
- **Placeables when their host falls.** When the wall or floor under a chest, bed, or trough is destroyed, is the placeable destroyed, dropped as an item, or does it spill its contents?
- **Reclaiming an unprotected base.** After its marker is destroyed, can the owner restore the claim by placing a new marker, and can anyone else claim the base first?
- **Bases across region boundaries.** A base can span two regions' servers. Either the region holding the claim marker owns the whole base, with edits from the other side forwarded to it, or each region owns its own pieces and joints across the line are reconciled. This is part of the connected-structures item in the [Design Backlog](Design-backlog.md).
- **Placeable upkeep.** Placeables count toward the piece ceiling. Do they also pay upkeep, or is it charged on structural pieces alone, as the sketch in 7.2 assumes?
- **Frames and beams.** They sit outside the stability graph for now. If the backlog decides that braces and crossbeams extend stability, they join the graph as ordinary pieces with their own losses.
- **Turtle-borne bases without a keeper.** The rights and fate of a base on a wild or abandoned turtle wait on the turtle item in the [Design Backlog](Design-backlog.md). The data model above already allows either answer, since rights are read from the carrier's bond rather than stored on the base.

## 12. Design Validation Cases

Prototyping should demonstrate each of the following before the system is considered sound:

| Scenario | Expected outcome |
|---|---|
| The specification's worked example: a stone foundation on a slope, a second foundation over falling ground, a pillar beneath it, a wall, then two timber ceiling spans and a pillar at the far edge | Blue foundation; the second foundation turns blue when the pillar lands; the wall stays blue; the ceilings read green then yellow; the far pillar returns the outer span to green |
| A placement request carrying a forged transform, a stolen target snap, or a piece the builder does not hold | Rejected with a reason code; nothing changes and no item is consumed |
| Removing one pillar under a three-span timber balcony | The balcony and only the balcony is visited and collapses; rubble damages the pieces below it; the rest of the base is untouched |
| Removing one of two pillars under the same floor | The floor stays standing at the stability of its surviving path |
| Collapsing the main pillars of a stone keep near the piece ceiling | The cascade completes within the per-tick budget over several frames, navigation rebuilds once per tick, and the region holds its tick rate |
| A wall meeting a pillar centred and flush, three walls meeting at a T, and a beam across a post, viewed from every angle | Correct variant on each piece; no surface flickers through another |
| A burning timber wall in a stone base during rain | Fire spreads to linked timber, never crosses stone, and goes out on uncovered pieces when rain arrives while covered timber keeps burning |
| Repairing a wall during an assault, then after the attackers stop | Refused while hits keep landing; accepted once the lockout passes without a hit |
| A claim stocked for seven days, left alone for eight | No piece loses health for seven days; on day eight only the outermost pieces decay, the weakest material first |
| Destroying a claim marker | An outsider can place a full wall inside the walls on the next request |
| Removing the only foundation joining a base's annex to the marker | The annex becomes an unclaimed base and its foundations expire within days unless relinked |
| A wolf in a lean-to, a buffalo under walls with no roof, a dragon in a stone hall with a hearth | Roofed and clear for the wolf; not roofed for the buffalo; roofed, warm, and clear for the dragon |
| Adding a wall to a leviathan's deck, then one piece past its budget | Carried weight rises and the flight guide's mana draw follows; the extra piece is rejected |
| Restarting the server, or unloading and reloading the cell | Every base reassembles exactly, with no stability pass unless the piece library changed |
| A client arriving beside a base at the piece ceiling | First replication size and time are measured and within the budget set in [Server Settings](Server-settings.md) |

## 13. Further Reading

- [UStaticMeshSocket API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UStaticMeshSocket)
- [Instanced Static Mesh Component](https://dev.epicgames.com/documentation/unreal-engine/instanced-static-mesh-component-in-unreal-engine)
- [UInstancedStaticMeshComponent API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UInstancedStaticMeshComponent)
- [Nanite Virtualized Geometry](https://dev.epicgames.com/documentation/unreal-engine/nanite-virtualized-geometry-in-unreal-engine)
- [EPixelDepthOffsetMode API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/EPixelDepthOffsetMode)
- [UWorld API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UWorld) (collision traces and overlap queries)
- [UWorldSubsystem API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UWorldSubsystem)
- [UCharacterMovementComponent API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UCharacterMovementComponent)
- [FFastArraySerializer API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/NetCore/FFastArraySerializer)
- [Actor Network Dormancy](https://dev.epicgames.com/documentation/unreal-engine/actor-network-dormancy-in-unreal-engine)
- [Replication Graph](https://dev.epicgames.com/documentation/unreal-engine/replication-graph-in-unreal-engine)
- [Unreal Engine 5.8 Release Notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes)
- [World Partition](https://dev.epicgames.com/documentation/unreal-engine/world-partition-in-unreal-engine)
- [Modifying the Navigation Mesh](https://dev.epicgames.com/documentation/unreal-engine/overview-of-how-to-modify-the-navigation-mesh-in-unreal-engine)
- [Navigation Invokers](https://dev.epicgames.com/documentation/unreal-engine/using-navigation-invokers-in-unreal-engine)
- [Physics in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/physics-in-unreal-engine) (Chaos Geometry Collections)
- [Structural Integrity in 7 Days to Die](https://7daystodie.wiki.gg/wiki/Structural_Integrity), a block game's support model with local recalculation and a coloured preview
- [Rust Devblog 189](https://rust.facepunch.com/news/devblog-189), on upkeep that scales with base size and decays from the outside in
- [The Tool Cupboard in Rust](https://wiki.facepunch.com/rust/the_tool_cupboard), a building-privilege radius projected from connected foundations
- [Building in ARK: Survival Evolved](https://ark.wiki.gg/wiki/Building), on snap cycling, pillar support, and anti-spam decay of unconnected pieces

## Continue Reading

Continue with the [Building System specification](Building-system.md) this guide implements, [Server Architecture (Technical)](<Server-architecture (Technical).md>) for the replication and persistence it builds on, and [Settlement Generation (Technical)](<Settlement-generation (Technical).md>) for the NPC buildings made from the same materials. The creature-facing hand-offs continue in [Taming and Control (Technical)](<Taming-and-control (Technical).md>) for shelter evaluation, [Creature Riding (Technical)](<Creature-riding (Technical).md>) for a turtle's burden, and [Flight (Technical)](<Flight (Technical).md>) for the leviathan's mana and the deck it carries.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
