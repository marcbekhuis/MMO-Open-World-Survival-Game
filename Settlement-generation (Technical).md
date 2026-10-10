# Settlement Generation in Unreal Engine 5

A technical design and implementation research guide based on the [Settlement Generation specification](Settlement-generation.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Server Architecture (Technical)](<Server-architecture (Technical).md>). Engine facts were checked against Epic's 5.8 documentation on 10 October 2026, and each is linked where it is used. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every API call needs validating against the engine version in use before it becomes production code.

The same migration boundary applies as in the server guide. Settlement state — which lot holds which function, style, and variant, how many residents a settlement has, and how far a rebuild has progressed — is plain data that is specified independently of Unreal actors. Unreal is responsible for loading the building content, assembling the buildings on screen, replicating lot state, and updating navigation, and that integration layer can be replaced without changing a stored world.

---

## Table of Contents

1. [Pipeline Overview](#1-pipeline-overview)
2. [Data Model](#2-data-model)
3. [Seeds and Weighted Rolls](#3-seeds-and-weighted-rolls)
4. [The Initial Settlement Roll](#4-the-initial-settlement-roll)
5. [Residents and Repopulation](#5-residents-and-repopulation)
6. [Damage, Collapse, and Rebuilding](#6-damage-collapse-and-rebuilding)
7. [Assembly, Replication, and Streaming](#7-assembly-replication-and-streaming)
8. [Content Updates and Authoring Validation](#8-content-updates-and-authoring-validation)
9. [Design Validation Cases](#9-design-validation-cases)
10. [Further Reading](#10-further-reading)

---

## 1. Pipeline Overview

Generation has four stages, and only the first two run on the server.

```
Authored content                 Server (authoritative)              Client
-----------------                ----------------------              ------
Settlement layout  ─┐
Settlement blueprint├─► Roll on world creation ─► FSettlementState ─► Replicated lot ids ─► Assemble buildings
Building library   ─┘        (seeded)              (persisted)        (a few bytes per lot)    from data assets
                                   ▲                    │
                                   └── Reroll a lot ◄───┘ on collapse (RebuildGeneration + 1)
```

The server rolls each settlement once, when the game world is created, and stores the result. From then on the stored state is the truth: the server never recomputes a standing building from the seed, and clients never roll at all. A client receives each lot's function, style, and variant as small identifiers and builds the matching geometry from the content it already has.

Keeping every roll on the server matters for correctness as well as security. Epic documents [`FRandomStream`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/FRandomStream) as a seeded generator but makes no promise that its sequence is identical across platforms and compilers, so a design that had clients reproduce rolls from a seed would rest on an undocumented guarantee. Rolling once and replicating the result removes the question.

## 2. Data Model

### 2.1 Authored Assets

Every authored definition is a [`UPrimaryDataAsset`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UPrimaryDataAsset), so the [Asset Manager](https://dev.epicgames.com/documentation/unreal-engine/asset-management-in-unreal-engine) can load and unload the building library by primary asset id and asset bundle rather than keeping every variant in memory. Functions and styles are identified with [Gameplay Tags](https://dev.epicgames.com/documentation/unreal-engine/using-gameplay-tags-in-unreal-engine), such as `Building.Function.Smithy` and `Building.Style.Dwarven.Forgehall`, whose hierarchy lets a quota or a lot affinity match a whole family of tags at once.

```cpp
// Lot pinning, matching the specification's three lot kinds.
UENUM()
enum class ELotPin : uint8
{
    Free,       // function, style, and variant all roll
    Function,   // function is fixed; style and variant roll
    Landmark    // nothing rolls; the authored building is used as is
};

USTRUCT()
struct FLotDefinition
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) uint16 LotId = 0;                       // unique within the layout, never reused
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UBuildingShape> Shape;    // fixed per lot
    UPROPERTY(EditAnywhere) FTransform Transform;
    UPROPERTY(EditAnywhere) FGameplayTagContainer PositionTags;      // Lot.Corner, Lot.MainStreet, Lot.Gate, Lot.Yard, Lot.BackLane
    UPROPERTY(EditAnywhere) uint8 District = 0;                      // used by the spread rule
    UPROPERTY(EditAnywhere) ELotPin Pin = ELotPin::Free;
    UPROPERTY(EditAnywhere) FGameplayTag PinnedFunction;             // Pin == Function
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UBuildingVariant> LandmarkBuilding; // Pin == Landmark
};

UCLASS()
class USettlementLayout : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) TArray<FLotDefinition> Lots;   // streets, walls, and squares live in the level itself
};
```

The building hierarchy is three asset types. A shape lists the functions it can hold; each function on that shape lists its styles; each style lists its variants. Weights are authoring values that bias the rolls.

```cpp
USTRUCT()
struct FShapeFunctionOption
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FGameplayTag Function;
    UPROPERTY(EditAnywhere) TArray<TSoftObjectPtr<UBuildingStyle>> Styles;
};

UCLASS()
class UBuildingShape : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) FBox Envelope;                        // no variant may build outside it, except declared openings
    UPROPERTY(EditAnywhere) TArray<FShapeFunctionOption> Functions;
    UPROPERTY(EditAnywhere) FGameplayTag DefaultFunction;          // used for lots left over after quotas, usually a dwelling
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UStaticMesh> FarShell;  // static silhouette baked into HLODs, see 7.3
};

UCLASS()
class UBuildingStyle : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) FGameplayTag Style;
    UPROPERTY(EditAnywhere) FGameplayTag People;                  // People.Human, People.Elf, People.Dwarf
    UPROPERTY(EditAnywhere) float Weight = 1.f;
    UPROPERTY(EditAnywhere) TArray<TSoftObjectPtr<UBuildingVariant>> Variants;
};

UCLASS()
class UBuildingVariant : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) float Weight = 1.f;
    UPROPERTY(EditAnywhere) TArray<FBuildingModule> Modules;       // meshes and transforms the client assembles
    UPROPERTY(EditAnywhere) TArray<FTransform> Doors;              // front, back, side; validated against street and alley edges
    UPROPERTY(EditAnywhere) bool bOpensAlley = false;              // a passage through the ground floor
    UPROPERTY(EditAnywhere) bool bOpensUnderpass = false;
    UPROPERTY(EditAnywhere) int32 HousingCapacity = 0;             // residents this building houses, if any
    UPROPERTY(EditAnywhere) int32 StaffRequired = 0;               // staff needed for its service to open
};
```

The settlement blueprint carries the quotas from the specification. A quota turns a target population into a building count for one function, and a tuning block holds the rates that sections 5 and 6 use.

```cpp
USTRUCT()
struct FRepopulationTuning
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float BaseRatePerDay = 0.1f;         // fraction of the deficit recovered per day at full food and safety
    UPROPERTY(EditAnywhere) float StaffRefillRatePerDay = 0.5f;   // service posts refill faster than general population
    UPROPERTY(EditAnywhere) float SafetyRecoveryDays = 3.f;       // how long fear lingers after a raid
    UPROPERTY(EditAnywhere) float SurplusFunctionWeight = 0.1f;   // floor weight for functions already at target on reroll
    UPROPERTY(EditAnywhere) float RubbleDays = 1.f;               // rebuild stage durations before player help
    UPROPERTY(EditAnywhere) float ClearingDays = 1.f;
    UPROPERTY(EditAnywhere) float ScaffoldingDays = 3.f;
    UPROPERTY(EditAnywhere) float RepairDays = 1.f;
};

USTRUCT()
struct FServiceQuota
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FGameplayTag Function;
    UPROPERTY(EditAnywhere) int32 ResidentsPerBuilding = 300;   // e.g. bakery 250, tavern 300, smithy 400, healer 600
    UPROPERTY(EditAnywhere) int32 Min = 0;
    UPROPERTY(EditAnywhere) int32 Max = 0;                      // 0 means no cap

    int32 TargetBuildings(int32 TargetResidents) const
    {
        const int32 ByPopulation = FMath::DivideAndRoundUp(TargetResidents, FMath::Max(1, ResidentsPerBuilding));
        return Max > 0 ? FMath::Clamp(ByPopulation, Min, Max) : FMath::Max(ByPopulation, Min);
    }
};

UCLASS()
class USettlementBlueprint : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) TSoftObjectPtr<USettlementLayout> Layout;
    UPROPERTY(EditAnywhere) FGameplayTag SettlementType;        // Settlement.Hamlet, .Village, .Town, .GreatCity
    UPROPERTY(EditAnywhere) FGameplayTag People;
    UPROPERTY(EditAnywhere) FGameplayTag Realm;                 // empty for an independent settlement
    UPROPERTY(EditAnywhere) int32 TargetResidents = 0;
    UPROPERTY(EditAnywhere) TArray<FServiceQuota> Quotas;       // required functions are quotas with Min >= 1
    UPROPERTY(EditAnywhere) TArray<FName> SupplyingSettlements; // the hamlets whose food this settlement relies on
    UPROPERTY(EditAnywhere) FRepopulationTuning Repopulation;   // see section 5
};
```

### 2.2 Runtime State

Runtime state is engine-independent and is what the world persists. It stores identifiers, never pointers or indices into a loaded table.

```cpp
enum class ELotBuildState : uint8
{
    Intact, Damaged, Repairing,                 // a standing building keeps its ids
    Collapsed, Rubble, Cleared, Scaffolding     // a collapsed lot rerolls; see section 6
};

struct FLotState
{
    uint16 LotId = 0;
    FName FunctionTag;                // Gameplay Tag name, stable across builds
    FPrimaryAssetId Style;            // e.g. BuildingStyle:Human_Smithy_Timber
    FPrimaryAssetId Variant;
    uint32 RebuildGeneration = 0;     // increments on every reroll; part of the seed
    ELotBuildState BuildState = ELotBuildState::Intact;
    float Health = 1.f;               // 0..1
    float StageProgress = 0.f;        // 0..1 within the current rebuild stage
};

struct FResidentState
{
    uint32 ResidentId = 0;            // unique within the settlement, never reused
    uint16 HomeLot = 0;
    uint16 WorkLot = 0;               // 0 when the resident holds no post
    FName Role;                       // Gameplay Tag name: Role.Baker, Role.Guard, Role.Farmer, Role.Labourer
    FName Schedule;                   // routine asset id: when the resident is at home, at work, or in the street
    uint32 AppearanceSeed = 0;        // drives the generated look, so the same person always looks the same
};

struct FSettlementState
{
    FName SettlementId;
    uint64 WorldSeed = 0;
    TArray<FResidentState> Residents; // sorted by ResidentId
    uint32 NextResidentId = 1;
    double ArrivalProgress = 0.0;     // fractional newcomers accumulated between updates
    double LastSimulatedTime = 0.0;   // settlement clock, in in-game days
    double LastRaidTime = -1.0e9;
    TArray<FLotState> Lots;           // sorted by LotId
};
```

A lot's staff is not stored on the lot; it is the set of residents whose `WorkLot` points at it, so a death or an arrival updates the service it affects without a second record to keep in step.

Gameplay Tags are registered by name rather than by a stable number, and primary asset ids are type-and-name pairs, so both are persisted in their text form. Only the replicated copy, described in [section 7.2](#72-replication), uses compact indices. In the [world state database](<Server-architecture (Technical).md#3-master-server-implementation>) each lot and each resident becomes one row keyed by world, settlement, and lot or resident id — around ten thousand resident rows for the largest great city — which keeps a raid's changes to a handful of small updates in the [delta stream](<Server-architecture (Technical).md#81-delta-state-updates>).

## 3. Seeds and Weighted Rolls

### 3.1 Deriving a Seed

Every roll draws from a seed derived from the world seed and the identity of what is being rolled. The derivation uses [`FXxHash64`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/FXxHash64), Unreal's 64-bit XXH3 hash, over integers packed explicitly in little-endian order, so the input bytes never depend on struct padding or the host platform. [`HashCombine`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/HashCombine) and `GetTypeHash` are avoided: they return 32 bits, and `GetTypeHash` of an `FName` is not something to persist.

Each level of the hierarchy rolls from its own stream. Because the variant roll never shares a stream with the function roll, adding variants to the library cannot change which function a lot rolls.

```cpp
#include "Hash/xxhash.h"
#include "Math/RandomStream.h"

enum class ERollLevel : uint32 { Assignment = 0, Function = 1, Style = 2, Variant = 3 };

struct FRollKey
{
    uint64 WorldSeed = 0;
    uint64 SettlementHash = 0;   // FXxHash64 of the settlement id's UTF-8 bytes, computed once
    uint32 LotId = 0;            // 0 for settlement-wide rolls
    uint32 RebuildGeneration = 0;
    ERollLevel Level = ERollLevel::Assignment;
};

static FRandomStream MakeRollStream(const FRollKey& Key)
{
    uint8 Bytes[28];
    auto Put = [&Bytes](int32 Offset, uint64 Value, int32 Size)
    {
        for (int32 Index = 0; Index < Size; ++Index)
        {
            Bytes[Offset + Index] = static_cast<uint8>(Value >> (8 * Index));
        }
    };
    Put(0,  Key.WorldSeed, 8);
    Put(8,  Key.SettlementHash, 8);
    Put(16, Key.LotId, 4);
    Put(20, Key.RebuildGeneration, 4);
    Put(24, static_cast<uint32>(Key.Level), 4);

    const uint64 Hash = FXxHash64::HashBuffer(Bytes, sizeof(Bytes)).Hash;
    return FRandomStream(static_cast<int32>(Hash ^ (Hash >> 32)));   // FRandomStream takes an int32 seed
}
```

### 3.2 Weighted Picks

Epic warns that `FRandomStream` has poor quality in its lower bits and that its output should not be reduced with the modulus operator, so every pick scales `GetFraction()` against a weight total instead.

```cpp
template <typename T>
int32 PickWeighted(const TArray<T>& Options, TFunctionRef<float(const T&)> WeightOf, FRandomStream& Stream)
{
    float Total = 0.f;
    for (const T& Option : Options)
    {
        Total += FMath::Max(0.f, WeightOf(Option));
    }
    if (Total <= 0.f)
    {
        return INDEX_NONE;
    }

    float Roll = Stream.GetFraction() * Total;
    for (int32 Index = 0; Index < Options.Num(); ++Index)
    {
        Roll -= FMath::Max(0.f, WeightOf(Options[Index]));
        if (Roll < 0.f)
        {
            return Index;
        }
    }
    return Options.Num() - 1;   // floating-point remainder lands on the last option
}
```

Candidate arrays are always built in a fixed order, sorted by lot id or by asset id, before a pick, so the same stream always meets the same list.

## 4. The Initial Settlement Roll

The first roll assigns functions to the whole settlement at once, because quotas couple the lots: one lot becoming a smithy is one fewer smithy for every other lot. It runs on the server when the world is created, or when a settlement is first activated, and its result is written to the database before any client sees it.

1. **Pins.** Landmark lots take their authored building and are skipped from then on. Function-pinned lots take their function and count against its quota.
2. **Targets.** Each quota converts the blueprint's target residents into a building count with `TargetBuildings`.
3. **Quota fill.** While any function still has buildings outstanding, take the function with the largest outstanding count, breaking ties by tag name, and place it on one free lot whose shape can hold it. The lot is a weighted pick over its position affinity and a spread penalty.
4. **Leftovers.** Every lot still free takes its shape's default function, normally a dwelling.
5. **Style and variant.** For every non-landmark lot, pick a style from those the shape lists for the lot's function, filtered to the settlement's people, then a variant from that style, each from its own stream.
6. **Residents.** Create the blueprint's target residents one by one through the same `AddNewcomer` routine that repopulation uses (section 5.1), so every post is staffed and every resident has a home before the settlement first opens.

```cpp
void FSettlementRoller::AssignFunctions(FSettlementState& State, const USettlementBlueprint& Blueprint,
                                        const USettlementLayout& Layout)
{
    FRandomStream Stream = MakeRollStream({State.WorldSeed, HashSettlement(State.SettlementId), 0, 0, ERollLevel::Assignment});

    TMap<FGameplayTag, int32> Outstanding;
    for (const FServiceQuota& Quota : Blueprint.Quotas)
    {
        Outstanding.Add(Quota.Function, Quota.TargetBuildings(Blueprint.TargetResidents));
    }

    TArray<uint16> FreeLots;
    for (const FLotDefinition& Lot : Layout.Lots)                    // Layout.Lots is sorted by LotId
    {
        FLotState& LotState = State.AddLot(Lot.LotId);
        if (Lot.Pin == ELotPin::Landmark)
        {
            LotState.ApplyLandmark(Lot);
        }
        else if (Lot.Pin == ELotPin::Function)
        {
            LotState.FunctionTag = Lot.PinnedFunction.GetTagName();
            if (int32* Count = Outstanding.Find(Lot.PinnedFunction)) { --*Count; }
        }
        else
        {
            FreeLots.Add(Lot.LotId);
        }
    }

    for (FGameplayTag Function = LargestOutstanding(Outstanding); Function.IsValid(); Function = LargestOutstanding(Outstanding))
    {
        const TArray<uint16> Candidates = FreeLots.FilterByPredicate(
            [&](uint16 LotId) { return Layout.ShapeOf(LotId).CanHold(Function); });

        const int32 Pick = PickWeighted<uint16>(Candidates,
            [&](uint16 LotId) { return Layout.Affinity(LotId, Function) * SpreadPenalty(State, Layout, LotId, Function); },
            Stream);

        if (Pick == INDEX_NONE)
        {
            Outstanding.Remove(Function);   // no compatible lot left; authoring validation (8.2) should prevent this
            continue;
        }

        State.FindLot(Candidates[Pick]).FunctionTag = Function.GetTagName();
        FreeLots.Remove(Candidates[Pick]);
        --Outstanding[Function];
    }

    for (const uint16 LotId : FreeLots)
    {
        State.FindLot(LotId).FunctionTag = Layout.ShapeOf(LotId).DefaultFunction.GetTagName();
    }
}
```

`LargestOutstanding` returns the function with the most buildings still to place, ignoring those at zero, and resolves ties by comparing tag names so the order never depends on map iteration. `Affinity` multiplies the authored weight of each of the lot's position tags for that function, so a corner lot by the gate can favour a tavern strongly while a back-lane lot all but rules one out. `SpreadPenalty` returns a value below 1 for each building of the same function already placed in the lot's district, which pushes the next bakery into a different quarter without forbidding two side by side.

Housing is checked after the roll rather than enforced during it: the sum of `HousingCapacity` over all standing lots must reach the blueprint's target residents. A layout that cannot house its own target is an authoring error, caught by the validation in [section 8.2](#82-authoring-validation), not something the roll should silently work around.

## 5. Residents and Repopulation

### 5.1 Recovery Toward the Target

The settlement's population recovers exponentially toward the target, so a settlement that has lost half its people regains most of them quickly and the last few slowly, which matches how the specification describes a city filling back up. The curve decides how many newcomers arrive; each newcomer is then created as an individual resident. The rate is the product of a base rate and three factors between 0 and 1.

- **Food** is the share of the blueprint's supplying settlements, its farming hamlets, that are standing and populated, blended with the settlement's own food stores. A city whose hamlets have been burnt recovers slowly.
- **Safety** rises from 0 back to 1 over the days since the settlement was last raided, so a settlement under repeated attack stays depleted.
- **Housing** caps the target itself: the settlement recovers toward the smaller of its target and the housing standing at the time.

Because the factors are held constant across a step, the step has a closed form. That lets a settlement that nobody has visited for a week catch up in a few cheap steps, which is the behaviour the open shared-clocks question in the [Design Backlog](Design-backlog.md) asks for. Steps longer than one in-game day are split so that the factors are re-evaluated daily.

```cpp
void FSettlementSimulator::Advance(FSettlementState& State, const USettlementBlueprint& Blueprint, double NowDays)
{
    while (State.LastSimulatedTime < NowDays)
    {
        const double Step = FMath::Min(1.0, NowDays - State.LastSimulatedTime);    // at most one in-game day

        const double Housing = StandingHousing(State);
        const double Target = FMath::Min<double>(Blueprint.TargetResidents, Housing);
        const double Food = FoodFactor(State, Blueprint);                                    // 0..1
        const double Safety = 1.0 - FMath::Exp(-(State.LastSimulatedTime - State.LastRaidTime)
                                               / Blueprint.Repopulation.SafetyRecoveryDays); // 0..1
        const double Rate = Blueprint.Repopulation.BaseRatePerDay * Food * Safety;
        const double Current = State.Residents.Num() + State.ArrivalProgress;

        if (Current < Target)
        {
            // Closed-form exponential approach: R(t) = Target - (Target - R0) * e^(-Rate * t)
            const double Next = Target - (Target - Current) * FMath::Exp(-Rate * Step);
            State.ArrivalProgress += Next - Current;

            FRandomStream Stream = MakeArrivalStream(State);   // keyed on settlement and NextResidentId
            while (State.ArrivalProgress >= 1.0)
            {
                AddNewcomer(State, Blueprint, Stream);         // takes a vacant post first, then a free home
                State.ArrivalProgress -= 1.0;
            }
        }
        else
        {
            DisplaceHomeless(State);   // housing lost to collapse sends residents away, newest first
            State.ArrivalProgress = 0.0;
        }

        State.LastSimulatedTime += Step;
    }
}
```

`AddNewcomer` creates one `FResidentState` with the next resident id. It first looks for the service post furthest below its staffing, in quota order, and assigns the newcomer that role and workplace; only when every post is filled does it create an ordinary resident with a labouring or farming role. It then houses them in the dwelling with the most free capacity nearest their workplace, and gives them the schedule for their role and a fresh appearance seed. Arrivals are random only through the arrival stream, so the same settlement state always produces the same newcomers.

### 5.2 Staff and Open Services

Service posts refill before the general population, because `AddNewcomer` fills vacant posts first, and a resident without a post can also be promoted into one at `StaffRefillRatePerDay`, which models an apprentice stepping up faster than strangers arrive. A settlement that has lost its only baker therefore gets a new one before it gets back its last few dwellers. A service is open only when its building is `Intact` and the residents working there meet the variant's `StaffRequired`. A damaged building is closed until it is repaired, as [Raids and Conquest](Raids.md) requires.

Deaths go the other way: when a raid kills a resident, the server removes that resident's record, which empties a post if they held one and frees a place in their home. NPC children are not part of the casualty model, in line with [Content and Tone](Content-and-tone.md).

### 5.3 Simulation Levels

Residents exist at two levels of detail. Away from players, a resident is only their record: their position is derived on demand from their schedule and the settlement clock — at home, at work, or on the street between the two — and nothing runs per resident between updates. Near a player, the server spawns the resident as an actor at the place their schedule puts them, and from then on they walk, work, and react as a full NPC, including fleeing or fighting during a raid. When no player is near any more, the actor is removed and only the facts that matter are written back: whether the resident is still alive, and anything that changed their home, post, or role. Only the server spawns these actors, and only within the visibility rules of the [Replication Graph](<Server-architecture (Technical).md#5-replication-graph-visibility-driven-sync>), so a great city of several thousand residents costs the servers the few dozen people actually in view while every one of them remains a specific person.

## 6. Damage, Collapse, and Rebuilding

### 6.1 Lot State Machine

Every lot moves through a small state machine. A standing building keeps its identifiers no matter how badly it is damaged; only collapse rerolls it.

```
Intact ──damage──► Damaged ──repair begins──► Repairing ──► Intact          (same function, style, variant)
                     │
                     └──health reaches 0──► Collapsed ──► Rubble ──► Cleared ──► Scaffolding ──► Intact
                                                                         ▲                  (new roll,
                                                                  reroll happens here     RebuildGeneration + 1)
```

The reroll happens when the lot is cleared, before scaffolding goes up, so players can see what is being built from the frame onward. Each stage has a duration in the blueprint's tuning, and player help shortens it: delivered materials, completed escort and defence quests, and builders protected from follow-up attacks all add to `StageProgress`.

### 6.2 Rerolling a Collapsed Lot

A reroll touches one lot, so it uses that lot's own streams rather than the settlement-wide assignment stream. The function is drawn from the shape's compatible functions, weighted by how far below its target each function currently stands, counting buildings that are standing or under construction. Functions at or above target keep a small floor weight, so a city can still end up with a fourth tavern now and then.

```cpp
void FSettlementRoller::RerollLot(FSettlementState& State, const USettlementBlueprint& Blueprint,
                                  const USettlementLayout& Layout, FLotState& Lot)
{
    ++Lot.RebuildGeneration;
    const uint64 SettlementHash = HashSettlement(State.SettlementId);

    FRandomStream FunctionStream = MakeRollStream({State.WorldSeed, SettlementHash, Lot.LotId,
                                                   Lot.RebuildGeneration, ERollLevel::Function});
    const UBuildingShape& Shape = Layout.ShapeOf(Lot.LotId);
    const TArray<FShapeFunctionOption>& Options = Shape.Functions;           // authored order, fixed

    const int32 FunctionPick = PickWeighted<FShapeFunctionOption>(Options,
        [&](const FShapeFunctionOption& Option)
        {
            const int32 Deficit = Blueprint.TargetBuildingsFor(Option.Function) - CountStandingOrBuilding(State, Option.Function);
            return FMath::Max(Blueprint.Repopulation.SurplusFunctionWeight, static_cast<float>(Deficit));
        },
        FunctionStream);

    Lot.FunctionTag = Options[FunctionPick].Function.GetTagName();
    RollStyleAndVariant(State, Blueprint, Shape, Lot);   // Style and Variant streams, same key with their own level
    Lot.BuildState = ELotBuildState::Scaffolding;
    Lot.StageProgress = 0.f;
    ReleaseWorkers(State, Lot.LotId);   // residents who worked here lose their post and become ordinary residents
}
```

A function-pinned lot that collapses keeps its function and rerolls only its style and variant. A landmark lot is rebuilt exactly as authored.

## 7. Assembly, Replication, and Streaming

### 7.1 Assembling Buildings

Buildings are assembled at runtime from the variant's module list: the client spawns one actor per lot and gives it instanced static mesh components for the repeated pieces, loading the variant's assets asynchronously through the Asset Manager first. Two engine features that look like a fit were ruled out after checking Epic's documentation. [Level Instances](https://dev.epicgames.com/documentation/unreal-engine/level-instancing-in-unreal-engine) in their default embedded mode exist only in the editor and are flattened into the World Partition grid at cook time, and Packed Level Actors are an authoring tool with no documented runtime assembly path. [`ULevelStreamingDynamic::LoadLevelInstance`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/ULevelStreamingDynamic/LoadLevelInstance) does stream a level at runtime, but one level per building would mean thousands of levels in a city, which Epic advises against.

### 7.2 Replication

The server replicates each settlement's lot states as a compact array. Each entry carries the lot id, three indices, the build state, and the stage progress, which is about ten bytes per lot. The indices refer to a registry of every building asset id, sorted, which server and client both build at startup from the same cooked content; the connection already requires both to run the same build, and the registry's hash is checked during login as a second guard. Only the changed entries are sent when a lot is damaged, collapses, or advances a rebuild stage. Whether that array uses Unreal's fast array serializer or a custom delta is an implementation decision for prototyping and has not been verified against 5.8 here.

### 7.3 Distant Views

World Partition [HLODs](https://dev.epicgames.com/documentation/unreal-engine/world-partition---hierarchical-level-of-detail-in-unreal-engine) are generated at build time from static, placed actors, and nothing in Epic's documentation covers runtime-spawned actors or runtime HLOD generation. Rolled buildings therefore never appear in a city's distant view on their own. The fixed lot shapes solve this cheaply: each lot carries its shape's `FarShell`, a static silhouette placed in the level and baked into the HLODs, and because the shape never changes between worlds or rebuilds, the baked distant view is always correct. Up close, the shell hides and the assembled building takes over. A collapsed lot hides its shell, so a burnt district shows its gaps on the skyline until it is rebuilt.

### 7.4 Navigation

Only the server needs navigation, for NPC movement through the streets. [World Partition's navigation mesh](https://dev.epicgames.com/documentation/unreal-engine/world-partitioned-navigation-mesh) supports a Dynamic runtime mode in which runtime-spawned, navigation-relevant actors mark the affected tiles dirty and rebuild them, which covers a building collapsing or a rebuilt variant opening an alley. Epic labels World Partition navigation as Experimental, the dynamic rebuild runs on the game thread, and the documentation does not discuss dedicated servers, so the rebuild cost of a district collapsing at once needs prototyping early. A fallback is to bake the navmesh with every lot's shape envelope blocked and its declared alleys and underpasses as separate, toggled modifiers.

### 7.5 Cell Streaming and Persistence

World Partition does not persist changes to runtime-spawned actors when a cell unloads; Epic's documentation only describes cells unloading as streaming sources move away. The settlement state in the world database is the source of truth: when a cell loads, the server reads the lot rows for the settlements in it and the buildings are assembled again from those identifiers. Nothing about a building's identity lives in an actor.

### 7.6 The Farm Belt

The farm belt around each city is scatter, which the [PCG framework](https://dev.epicgames.com/documentation/unreal-engine/procedural-content-generation-framework-in-unreal-engine) is built for. PCG can [generate at runtime](https://dev.epicgames.com/documentation/unreal-engine/using-pcg-generation-modes-in-unreal-engine), but Epic documents runtime generation for the editor, PIE, and standalone builds without mentioning dedicated servers. The farm belt is therefore generated with PCG at authoring time and saved into the level, and only the farming hamlets, which are settlements with their own blueprints, roll at runtime.

## 8. Content Updates and Authoring Validation

### 8.1 Content Updates

A content update never rerolls a standing building. New styles and variants become available to a world only as lots collapse and are rebuilt. Removing an asset that a stored world still references would break that world, so retired assets stay loadable, or a redirect table maps each retired id to its replacement, and the redirect is applied when a lot is loaded rather than written back until that lot is next rebuilt.

### 8.2 Authoring Validation

The design leans on authored content being consistent, so an editor validation pass checks every blueprint, layout, and building asset before it can be cooked:

- every variant stays inside its shape's envelope, apart from its declared alley or underpass openings;
- every door opens onto a street, square, alley, or yard that connects to the street network;
- a declared alley or underpass connects two navigable spaces and does not cut the only route between two parts of the city;
- each quota's target can be met by the free and function-pinned lots whose shapes can hold that function, at the settlement's full target population;
- the housing in the dwellings the layout can hold reaches the blueprint's target residents;
- every function a shape lists has at least one style for each people that uses the shape, and every style has at least one variant;
- every landmark lot names a building, and every function-pinned lot names a function its shape can hold.

## 9. Design Validation Cases

Prototyping should demonstrate each of the following before the system is considered sound:

- Two worlds created with different seeds produce different functions on most free lots of the same city, while their landmark lots, function-pinned lots, and skyline match exactly.
- Restarting a server, or unloading and reloading a cell, reproduces every building exactly from stored state.
- Adding a new variant to the library changes no standing building in an existing world, and appears only on lots rebuilt afterwards.
- A raid that collapses five buildings rebuilds them with functions weighted toward the services the raid destroyed, and never touches a landmark.
- A district collapsing at once rebuilds the server navmesh within an acceptable frame budget, or the fallback in 7.4 is adopted.
- A settlement left unvisited for an in-game week reaches the same population as one simulated continuously, within rounding.
- A city whose supplying hamlets have all been destroyed recovers measurably slower than one whose hamlets stand.

## 10. Further Reading

- [FRandomStream API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/FRandomStream)
- [FXxHash64 API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/FXxHash64)
- [HashCombine API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/HashCombine)
- [UPrimaryDataAsset API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UPrimaryDataAsset)
- [Asset Management in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/asset-management-in-unreal-engine)
- [Using Gameplay Tags in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/using-gameplay-tags-in-unreal-engine)
- [Level Instancing in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/level-instancing-in-unreal-engine)
- [ULevelStreamingDynamic::LoadLevelInstance](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/ULevelStreamingDynamic/LoadLevelInstance)
- [World Partition HLOD](https://dev.epicgames.com/documentation/unreal-engine/world-partition---hierarchical-level-of-detail-in-unreal-engine)
- [World Partitioned Navigation Mesh](https://dev.epicgames.com/documentation/unreal-engine/world-partitioned-navigation-mesh)
- [PCG Generation Modes](https://dev.epicgames.com/documentation/unreal-engine/using-pcg-generation-modes-in-unreal-engine)

## Continue Reading

Continue with the [Settlement Generation specification](Settlement-generation.md) this guide implements, [Server Architecture (Technical)](<Server-architecture (Technical).md>) for the persistence and replication it builds on, and [Structures](Structures.md) for the settlements it generates.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
