# Taming and Control in Unreal Engine 5

A technical design and implementation research guide based on the [Taming and Control specification](Taming-and-control.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Server Architecture (Technical)](<Server-architecture (Technical).md>). Engine facts were checked against Epic's 5.8 documentation on 11 October 2026, and each is linked where it is first used. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every API call needs validating against the engine version in use before it becomes production code. Epic's 5.8 pages give no maturity label for StateTree, Smart Objects, AI Perception, or the Environment Query System, so this guide does not call them production-ready; where Epic does label a feature, such as Mass, the label is given.

The same migration boundary applies as in the server guide. A bond — who holds it, by which method, how strong it is, and since when it has been held, neglected, or tended — is plain data specified independently of Unreal actors, and so are a species' needs and the rules that move a bond over time. Unreal is the integration layer: it runs each creature's behaviour, senses the world around it, finds troughs and roofs, and replicates what players see. That layer can be replaced without changing a stored world, and a creature's bond survives any number of server restarts, region transfers, and cell unloads because no part of it lives in an actor.

This guide owns the bond, creature needs, shelter evaluation, and the behaviour of every tamed and wild creature. [Creature Riding (Technical)](<Creature-riding (Technical).md>) owns mount and rider, the refusal check, and the movement baseline; [Flight (Technical)](<Flight (Technical).md>) owns airborne movement and the leviathan's anchor; [Building System (Technical)](<Building-system (Technical).md>) owns pieces, troughs, and the spatial queries shelter evaluation calls.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Model](#2-data-model)
3. [The Three Bonding Methods](#3-the-three-bonding-methods)
4. [Bond Change over Time](#4-bond-change-over-time)
5. [Shelter Evaluation](#5-shelter-evaluation)
6. [Raids, Loose Mounts, and Changes of Hands](#6-raids-loose-mounts-and-changes-of-hands)
7. [Creature AI Architecture](#7-creature-ai-architecture)
8. [Wild Herds, Scale, and Unobserved Creatures](#8-wild-herds-scale-and-unobserved-creatures)
9. [Open Implementation Questions](#9-open-implementation-questions)
10. [Design Validation Cases](#10-design-validation-cases)
11. [Further Reading](#11-further-reading)

---

## 1. Architecture Overview

Taming splits into a rules layer that never touches the engine and a behaviour layer that does. Everything runs on the server; clients see only the creature's body and what it does.

```
Authored content            Server (authoritative)                                   Client
----------------            ----------------------                                   ------
Species data      ─┐                       ┌──────────────────────────┐
 FCreatureNeeds    ├──► UBondComponent ───►│ FBondRecord (persisted)  │
 Bond tuning       │     settle on events  │ care state, timestamps   │
 Nature           ─┘        ▲     │        └──────────────────────────┘
                            │     │ band changes
          care, coercion,   │     ▼
          danger events     │   Creature brain (AIController + StateTree) ──► Movement ──► Replicated body,
                            │     ▲          ▲                │                            animation state
    Shelter evaluator ──────┘     │          │                │                            (ears, gait, tells)
     │  roof / trough reach /     │   AI Perception     Smart Objects
     │  heat / clearance          │   (fear, threats)   (troughs, rest spots)
     ▼                            │
    UBuildingQuerySubsystem   UMountComponent (riding) and UFlightComponent (flight)
    (building guide)          submit accepted rider intent to the brain
```

The bond moves only at defined events — a care act, a coercive act, an hour of danger, a change in shelter, the owner logging in or out, a trough running dry — and between events it follows a closed-form rule, so the server never ticks a bond. Shelter evaluation answers one question, whether a creature's resting place meets its needs, by calling the building system's spatial queries; its answer decides which rule the bond follows until the next event. The creature's brain reads the bond's band and the creature's fear to decide what the animal does, and riding and flight call into that brain rather than replacing it, so a ridden horse is the same animal with the same instincts as one grazing in a paddock.

## 2. Data Model

### 2.1 Species Data

Every creature species is a [`UPrimaryDataAsset`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UPrimaryDataAsset) carrying three things this guide owns: what the creature needs, how its bonds behave under each method, and its nature, which decides what it does when control slips. Diets, climates, and natures are [Gameplay Tags](https://dev.epicgames.com/documentation/unreal-engine/using-gameplay-tags-in-unreal-engine), so a trough's contents or a creature's food can match a whole family at once.

```cpp
// Body size classes pick the navigation agent (7.5). The room a shelter must offer is RestClearance, tested separately (5.1).
UENUM()
enum class EBodySizeClass : uint8 { Small, Medium, Large, Huge, Colossal };

USTRUCT()
struct FCreatureNeeds
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FGameplayTagContainer Diet;           // Diet.Grain, Diet.Hay, Diet.Meat, Diet.Fish ...
    UPROPERTY(EditAnywhere) float FoodPerDay = 1.f;               // food value drawn per real day, from a trough or stores
    UPROPERTY(EditAnywhere) float ComfortMinCelsius = -10.f;      // climate band; below it the creature needs warmth
    UPROPERTY(EditAnywhere) float ComfortMaxCelsius = 30.f;       // above it the creature needs shade and cool air
    UPROPERTY(EditAnywhere) EBodySizeClass BodySize = EBodySizeClass::Medium;
    UPROPERTY(EditAnywhere) FVector RestClearance = FVector(300.f, 120.f, 180.f); // cm, full extents: room to stand, turn, and lie down (5.1)
};

UENUM()
enum class EBondMethod : uint8 { None, Slave, Parental, Trust, Stable };   // Stable: a hired horse's fixed bond, not a taming method

USTRUCT()
struct FBondMethodTuning
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float Ceiling = 1.f;              // parental highest
    UPROPERTY(EditAnywhere) float StartStrength = 0.f;
    UPROPERTY(EditAnywhere) float GainPerCareDayCap = 0.f;    // trust: most one real day of care can add
    UPROPERTY(EditAnywhere) float NeglectPerDay = 0.02f;
    UPROPERTY(EditAnywhere) float PressureDecayPerHour = 0.f; // slave: how fast coercion wears off
};

USTRUCT()
struct FBondBands   // thresholds on strength; the bands the riding guide's refusal check reads
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float Hesitant = 0.55f;
    UPROPERTY(EditAnywhere) float Disobedient = 0.30f;
    UPROPERTY(EditAnywhere) float Break = 0.10f;          // reachable only while the owner is online
    UPROPERTY(EditAnywhere) float OfflineFloor = 0.15f;   // always above Break
};

UCLASS()
class UCreatureSpeciesData : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) FCreatureNeeds Needs;
    UPROPERTY(EditAnywhere) TMap<EBondMethod, FBondMethodTuning> Methods;   // no entry: method cannot bond this species
    UPROPERTY(EditAnywhere) FBondBands Bands;
    UPROPERTY(EditAnywhere) float StableBondStrength = 0.6f;   // 0..1: the fixed strength of a Stable bond; only species that can be hired set it
    UPROPERTY(EditAnywhere) FGameplayTag Nature;   // Nature.Skittish flees, .Defiant turns, .Predatory attacks to kill
    UPROPERTY(EditAnywhere) bool bHasSexes = true;
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UStateTree> Brain;
};
```

The values are illustrative; the specification fixes only their order. Parental bonding has the highest ceiling, trust is slow because its daily gain is capped, slave bonding starts strong and wears off fast, and the offline floor sits above the break threshold.

### 2.2 Runtime Records

A tamed creature is an individual with a persistent record. Wild creatures are not, until a handler starts taming one (section 8.1).

```cpp
enum class ECareState : uint8 { Tended, Held, Neglected };   // section 4.1
enum class ECreatureActivity : uint8 { Following, Ridden, Resting, Guarding, TravellingHome, Loose, Anchored };

struct FBondRecord
{
    FGuid OwnerId;                 // character id, or a stable's settlement id when Method == Stable
    EBondMethod Method = EBondMethod::None;
    float Strength = 0.f;          // 0..1, as of SettledAt
    float Pressure = 0.f;          // slave bonds only: the coercion holding the bond, as of SettledAt
    double SettledAt = 0.0;        // server UTC seconds of the last settle
    ECareState CareState = ECareState::Neglected;
    bool bOwnerOnline = false;
    double CareDayStart = 0.0;     // start of the current care day, for the trust gain cap
    float CareGainToday = 0.f;
};

struct FTamingAttempt              // a would-be handler working on a creature that is wild or owned by someone else
{
    FGuid HandlerId;
    EBondMethod Method = EBondMethod::None;
    float Progress = 0.f;          // 0..1; completing it forms a new FBondRecord at the method's StartStrength
    double SettledAt = 0.0;
};

struct FTamedCreatureRecord
{
    FGuid CreatureId;              // stable across regions, restarts, and handoffs
    FPrimaryAssetId Species;
    uint8 Sex = 0;
    double BornAt = 0.0;           // raised and bred creatures; found adults store their estimated age
    FBondRecord Bond;
    TArray<FTamingAttempt> Attempts;
    ECreatureActivity Activity = ECreatureActivity::Following;
    FVector RestPoint;             // where it was told to stay, and where its shelter is evaluated
    FPlacedObjectRef HomeShelterAnchor;   // the piece its last good shelter was evaluated against, for TravellingHome
    FShelterResult LastShelter;    // section 5
    float Satiety = 1.f;           // the only food meter; the riding guide reads it. "Not hungry" for Tended means Satiety above zero
};
```

Clocks are server UTC seconds rather than in-game time, because the specification measures absence in real days. Reconciling this with the in-game clock other systems use is part of the shared-clocks item in the [Design Backlog](Design-backlog.md); this guide applies its catch-up principle to bonds.

In the [world state database](<Server-architecture (Technical).md#3-master-server-implementation>) each tamed creature is one row keyed by world and creature id, and each settle writes one small update into the [delta stream](<Server-architecture (Technical).md#81-delta-state-updates>). A ridden species also has the riding guide's mount record under the same id, holding tack, packs, and standing commands; ownership is always the bond's. A hired horse carries a `Stable` bond, owned by the stabling settlement's `FGuid`, whose strength is the species' `StableBondStrength` and which never decays. `Stable` is therefore a data case for the hired horses of [Hired Horses](Creature-riding.md#hired-horses), not a fourth taming method: no attempt forms it, the [riding guide's](<Creature-riding (Technical).md>) hire record creates it, and the timid stable horse needs no second bond model.

### 2.3 The Bond Component

`UBondComponent` lives on every tamed creature's actor on the server, holds its `FTamedCreatureRecord` while the actor exists, and is the only code that writes the bond. Other systems read a narrow interface, whose method names the riding and flight guides rely on: `GetNormalisedStrength()` and `GetBand()` for the refusal check and the whistle, `GetOwner()` for the character or settlement that holds the bond, and `SetAnchored(bool)`, which the flight guide calls to report a leviathan's anchor (5.5). Beside them sit the care state for healing and a band-changed delegate for the brain. No client reads the strength; players learn a bond through the animal's behaviour. If the interface ever shows the bond, it is replicated to the owning connection only.

The [Gameplay Ability System](https://dev.epicgames.com/documentation/unreal-engine/gameplay-ability-system-for-unreal-engine) is deliberately not the bond's home: a GAS attribute is a live, replicated value, while a bond has to be computed across periods when no actor exists at all. Health and stamina can use GAS like any other combatant's.

## 3. The Three Bonding Methods

### 3.1 Trust Bonding

Trust bonding begins with a wild creature and a `FTamingAttempt`. Each care act — feeding it from its diet, treating a wound, keeping it company while it eats — adds progress, and `GainPerCareDayCap` limits each day's total, so trust cannot be won in one long sitting however much food a player brings. Danger subtracts: damage taken and fear spikes suffered in the handler's company (7.3) cost progress, which is how keeping it out of needless danger becomes a rule. The taming and handling skills of [Skills](Skills.md) strengthen the bond through one hook: a skill multiplier on the progress and strength a care act adds, and on the pressure a coercive act adds (3.2), read from the handler's skill when the act is recorded and never stored on the bond. At full progress the attempt becomes a `FBondRecord` with method `Trust`, and the same care events go on raising strength toward the ceiling under the same cap while neglect lowers it.

### 3.2 Slave Bonding

Slave bonding replaces care with pressure. A coercive act raises `Pressure`, which wears off at `PressureDecayPerHour` unless refreshed, and for a slave bond the strength everything else reads is the pressure itself, capped by the ceiling. The attempt completes in a short window rather than over days, which makes the method the easiest. When pressure falls below the break threshold while the owner is online, control slips, the record is cleared, and the creature's nature decides what follows: a skittish creature flees, a defiant one turns on its handler, a predatory one attacks to kill. Shelter and the offline floor apply to pressure as to any bond.

### 3.3 Parental Bonding and Breeding

A parental bond forms at birth or hatching and starts near the method's ceiling, the strongest any bond can be. A handler who owns a male and a female of a species with `bHasSexes` set can breed them, and the offspring's record is created with a parental bond to that handler. A handler can also find a wild egg or, for mammals, a young animal. The egg is an item that becomes a creature bonded to whoever hatches it, and the young animal taken in gets a parental bond if it is young enough to count as near birth; the conditions for breeding and hatching, and where "near birth" ends, are listed in [section 9](#9-open-implementation-questions).

Once formed, a parental bond follows the same care rules as the others. A raised creature neglected while its owner is online can fall below the break threshold, and then it reverts to its wild instincts and breaks free: its record is cleared and its brain returns to wild behaviour.

## 4. Bond Change over Time

### 4.1 Care States

At every moment a bond is in one of three care states. **Tended**: the owner is online, the creature is in their company — following, ridden, or resting within a short companion radius — and it is fed, meaning its `Satiety` is above zero, which is how the specification's proper feeding is implemented; the bond does not decay, and care raises it. **Held**: the creature rests in a shelter that meets all four needs with a trough stocked for its diet (section 5), or it is an anchored leviathan with stocked deck troughs (5.5); the bond is frozen exactly, online or not. **Neglected**: everything else, including a creature left in a field while its owner rides elsewhere and a sheltered one whose trough has run dry; the bond decays at the method's neglect rate. Slave bonds are the one exception inside Tended, since company alone does not stop pressure wearing off.

### 4.2 Bands

Above `Hesitant` a creature is willing; below it, it answers late and refuses sooner; below `Disobedient` it openly disobeys; below `Break`, reachable only while the owner is online, the bond breaks. The riding guide's refusal check reads the strength itself, while the brain reacts to band changes, which `UBondComponent` broadcasts when a settle crosses one.

### 4.3 Settling

A bond is settled — brought up to the present — at every event that can change which rule applies: a care or coercive act, a danger event, the creature entering or leaving its owner's company, the owner logging in or out, a shelter re-evaluation (section 5.2), and a trough running dry. Between events the rule is constant, so each settle is a closed-form step from `SettledAt` to now. An unloaded creature is never settled until its cell loads or its owner logs in, and then the whole interval is applied at once, together with any trough run-dry events that fell inside it, in time order.

```cpp
void FBondRules::Settle(FTamedCreatureRecord& Creature, const UCreatureSpeciesData& Species, double Now,
                        const FTroughLedger* Trough)
{
    FBondRecord& Bond = Creature.Bond;
    if (Bond.Method == EBondMethod::None)
    {
        Bond.SettledAt = Now;
        return;
    }
    if (Bond.Method == EBondMethod::Stable)
    {
        Bond.Strength = Species.StableBondStrength;   // fixed, never decays
        Bond.SettledAt = Now;
        return;
    }

    const FBondMethodTuning& Tuning = Species.Methods.FindChecked(Bond.Method);
    const FBondBands& Bands = Species.Bands;

    while (Bond.SettledAt < Now)
    {
        // A held bond stays held only until its trough runs dry; that moment is an event inside the interval.
        double StepEnd = Now;
        if (Bond.CareState == ECareState::Held && Trough)
        {
            // Clamped below by SettledAt, so a trough that ran dry before this interval cannot give a negative step.
            StepEnd = FMath::Max(Bond.SettledAt, FMath::Min(Now, Trough->RunDryTime(Species.Needs.Diet)));
        }
        const double Days = (StepEnd - Bond.SettledAt) / 86400.0;
        const float Floor = FMath::Min(Bond.Strength, Bands.OfflineFloor);   // the floor stops decay; it never raises a bond

        if (Bond.Method == EBondMethod::Slave && Bond.CareState != ECareState::Held)
        {
            Bond.Pressure = FMath::Max(0.f, Bond.Pressure - Tuning.PressureDecayPerHour * float(Days * 24.0));
            Bond.Strength = FMath::Min(Bond.Pressure, Tuning.Ceiling);
        }
        else if (Bond.CareState == ECareState::Neglected)
        {
            Bond.Strength -= Tuning.NeglectPerDay * float(Days);
        }

        if (!Bond.bOwnerOnline)
        {
            Bond.Strength = FMath::Max(Bond.Strength, Floor);   // never breaks while the owner is away
            if (Bond.Method == EBondMethod::Slave)
            {
                Bond.Pressure = Bond.Strength;
            }
        }

        Bond.SettledAt = StepEnd;
        if (StepEnd < Now)
        {
            Bond.CareState = ECareState::Neglected;   // the trough ran dry inside the interval
        }
    }

    if (Bond.bOwnerOnline && Bond.Strength < Bands.Break)
    {
        BreakBond(Creature, Species);   // clears the record and hands the creature to its wild behaviour, see 7.2
    }
}
```

Decay is linear because the specification describes a slow, steady slide from hesitation into disobedience; a curve can replace it without changing the record. The same closed form answers the opposite question, when a bond will cross a threshold if nothing else happens:

```cpp
// The server UTC time at which Creature's strength first falls below Threshold, assuming no further events and
// using the care state, trough ledger, and neglect or pressure-decay rate that apply now. A held bond with a
// stocked trough counts from the trough's run-dry time. Returns TNumericLimits<double>::Max() when the
// threshold is never reached, for instance because it lies below the offline floor of an owner who is away.
double FBondRules::TimeToReachBand(const FTamedCreatureRecord& Creature, const UCreatureSpeciesData& Species,
                                   float Threshold, const FTroughLedger* Trough);
```

The settle is deterministic, so a creature unloaded for a week and one simulated continuously end with the same strength, which [section 10](#10-design-validation-cases) requires.

### 4.4 Owners Offline

The offline floor is the specification's promise that a returning player finds their creature disobedient but not gone. It lives in the settle rather than a timer, so it holds alike for a lapsed shelter, a hillside, and a loose mount. Login and logout each settle every creature the owner holds, so no interval mixes online and offline rules, and login settles run against the persisted records without loading the creatures' cells.

## 5. Shelter Evaluation

### 5.1 The Four Needs

A creature is sheltered when its rest point meets the four conditions of [Shelter for Creatures](Building-system.md#shelter-for-creatures). Each is answered by a spatial query on the building guide's server subsystem, `UBuildingQuerySubsystem`; this guide owns only what counts as passing.

| Need | Query on the building subsystem | Passes when |
|---|---|---|
| Food in reach | troughs whose reach covers the rest point | at least one returned trough holds food matching the creature's diet |
| A roof overhead | whether the rest point is roofed | the point is covered from above; walls are not required |
| The right climate | `SampleShelter` at the rest point: heat sources sharing its enclosed space and the enclosure's insulation | the effective temperature (5.4) lies inside the creature's comfort band |
| Room for its body | `HasClearance` at the rest point | `RestClearance` fits, rotated through a full turn, without overlapping a piece |

```cpp
struct FShelterResult
{
    bool bFoodInReach = false, bRoofed = false, bClimateMet = false, bRoomForBody = false;
    FPlacedObjectRef Trough;  // the trough this creature draws from, as the building guide identifies it
    int32 ClimateSeason = 0;  // the season the climate test was run for, see 5.4

    bool IsSheltered() const { return bFoodInReach && bRoofed && bClimateMet && bRoomForBody; }
};
```

The exact signatures of the roof, trough-reach, shelter-sampling, and clearance queries belong to [Building System (Technical)](<Building-system (Technical).md>). The clearance query takes half extents and a turn radius, which the evaluator derives from the species' `RestClearance`: the half extents are `RestClearance / 2`, and the turn radius is half the diagonal of the footprint, `0,5 * sqrt(X² + Y²)` of the full extents, so the creature can turn on the spot. `EBodySizeClass` does not enter this test; it only picks the navigation agent the creature walks with (7.5), while `RestClearance` alone decides whether a shelter has room. Where several stocked troughs are in reach, the creature draws from the one with the most stock for its diet, ties broken by the trough's reference. Flyers are evaluated like any other creature; nothing asks how a flyer would leave.

### 5.2 When Evaluation Runs

Shelter is evaluated at events, never per frame: when a creature comes to rest at its rest point, when its owner logs out, at a season change (5.4), and when the building subsystem reports a piece placed, broken, or destroyed whose bounds touch a registered rest point. A raider tearing the roof off a barn therefore re-evaluates the creatures inside at once, and their bonds decay from that moment. An evaluation that changes `IsSheltered()` settles the bond first and then switches its care state. The health system reads the same result for the faster healing a sheltered creature gets.

### 5.3 Troughs and the Feeding Ledger

A trough is a placed object, and its contents live in the container its record names, which the building guide persists. What this guide adds is the rate at which those contents are eaten. Every trough with at least one creature drawing from it carries a small feeding ledger: its stock per diet tag as of a timestamp, and the summed `FoodPerDay` of the creatures assigned to it. Because the draw is constant between events, the stock at any later time and the moment it runs dry are closed-form, and a trough serving more mouths empties faster without any per-creature ticking.

```cpp
struct FTroughLedger
{
    FPlacedObjectRef Trough;
    TMap<FName, float> StockByDiet;   // diet tag name -> food value, as of SettledAt
    TMap<FName, float> DrawByDiet;    // summed FoodPerDay of the assigned creatures, per diet
    double SettledAt = 0.0;

    // Per diet tag the creature eats: SettledAt + Stock / Draw days; the latest of them, since it eats whichever it finds.
    double RunDryTime(const FGameplayTagContainer& Diet) const;
};
```

Refilling a trough, a creature joining or leaving it, and a run-dry moment each settle the ledger and the bonds of everyone drawing from it, and a creature whose trough runs dry with another stocked trough in reach is reassigned at that moment, one more event in the catch-up of section 4.3. Settling writes the reduced stock back into the trough's container. A trough feeds any creature in its reach, whoever owns it.

### 5.4 Climate without Simulating Weather

An unobserved shelter may stay unloaded for a week of days and nights, so the climate test does not simulate hourly weather. It uses the daily extremes that the weather system gives for the place and the current season. A cold-sensitive creature passes when the season's coldest value plus the `Warmth` of the hearths and braziers that `SampleShelter` reports for its space reaches its comfort minimum; a heat-sensitive one passes when it is roofed, giving shade, and the season's hottest value less a fixed shade allowance, reduced further in proportion to the enclosure's `SampleShelter().Insulation`, stays under its maximum. A desert shelter therefore needs a hearth for a creature that suffers in the cold, and the result changes only with the season, which keeps the catch-up deterministic. If the building guide gives heat sources fuel that runs out, the burn-out time is one more catch-up event.

### 5.5 The Anchored Leviathan

A [Flying Leviathan](Creatures/Flying-leviathan.md) cannot be stabled, so its Held state comes from a different test, as [Mana-Borne Flight](Flight.md#mana-borne-flight) describes. [Flight (Technical)](<Flight (Technical).md>) owns the anchor itself — circling over a chosen leyline and drawing from it — and reports to `UBondComponent` whether the leviathan is anchored. The leviathan counts as Held while it is anchored and a trough on its deck holds food for its diet; deck troughs are ordinary trough pieces on its deck and use the same feeding ledger. Roof, climate, and room are not tested.

When the deck troughs run dry, the bond decays under the same offline floor as every other creature, so the leviathan never stops being its keeper's. Slipping its anchor is behaviour, not a broken bond. The catch-up asks `FBondRules::TimeToReachBand` (4.3) for the moment the bond crosses into the disobedient band, passing `Bands.Disobedient` and the deck troughs' ledger, and records it on the anchor as the slip time, and the flight guide derives the leviathan's drift back into its migration from that moment; the keeper who searches the sky finds a creature still bonded to them, waiting to be won back.

## 6. Raids, Loose Mounts, and Changes of Hands

### 6.1 Creatures in a Raided Base

A shelter keeps a bond steady, not a creature safe. When raiders enter a base, the sheltered creatures' brains leave their resting state for a defending one (7.2) on perception of hostile characters, and how they defend follows their nature and their band: a strong bond and a predatory or defiant nature fight, a skittish nature or a weak bond flees within the space it has. A harmed leviathan's Defending state is the raid climb that [Flight (Technical)](<Flight (Technical).md>) flies. Damage to a shelter's pieces re-evaluates it at once (5.2), so a raid that breaks the roof or empties the trough starts every surviving creature's bond decaying.

Creatures also break buildings. A wild or loose creature that attacks a piece, or a defending one that tramples a gate, calls the same damage entry point as any other attacker (section 6 of [Building System (Technical)](<Building-system (Technical).md#6-damage-fire-and-repair>)): the brain sends the species' attack as the crushing damage kind, and a dragon's breath as fire. Pieces answer through their normal resistances, so a creature needs no special rules of its own, and the shelter re-evaluation above follows from the damage it does.

### 6.2 Coercion on the Spot

Raiders who do not kill a creature can force it into a new bond through slave bonding. Coercing an owned creature is the same attempt a wild creature receives, and when it completes, a slave bond to the raider replaces the old `FBondRecord` and the old owner's claim ends. Because the attempt is fast, a raid can carry off animals in the time a raid lasts; because the new bond holds only under pressure, the raider leaves with a creature as dangerous to them as the method always is.

### 6.3 Loose Mounts after a Rider's Death

When a rider dies, the [riding guide](<Creature-riding (Technical).md>) decides from the bond whether the mount guards the body, makes for home, or panics, following [When the Rider Falls](Creature-riding.md#when-the-rider-falls); this guide supplies the behaviours. A guarding mount protects the body and attacks looters. A homing mount travels to the shelter it was last evaluated in (8.3). A panicked mount goes loose: its brain runs its species' wild behaviour, but its record keeps the old bond, which is neglected from that moment.

### 6.4 Reclaiming versus Taming Anew

Its owner reclaims a loose creature by tending it: care raises the existing record's strength from wherever neglect left it, and the creature follows again as soon as its band allows. Anyone else starts a new `FTamingAttempt` from zero by any method the species allows. The old bond stays in force while the stranger works, and only a completed attempt replaces it, so trust is a slow way to steal a mount and coercion the quick but unreliable one. A mount left unsheltered when its owner logs out falls under the same rules: it can be killed, or tamed by a stranger while its bond sits at the offline floor.

## 7. Creature AI Architecture

### 7.1 Server-Only Brains

Every creature that exists as an actor is driven by a [StateTree](https://dev.epicgames.com/documentation/unreal-engine/state-tree-in-unreal-engine), which Epic describes as a hierarchical state machine combining behaviour-tree selectors with states and transitions. The obvious host, [`UStateTreeAIComponent`](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponent), runs on an AI controller and its [schema](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponentSchema) reaches the creature through the controlled pawn. That does not survive riding, because the player's controller possesses the mount for the length of a ride, as [Creature Riding (Technical)](<Creature-riding (Technical).md#3-mount-and-rider-architecture>) section 3 explains. The brain is therefore hosted on the creature pawn itself with the general [`UStateTreeComponent`](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeComponent), so it keeps running whoever possesses the body. The AI controller supplies path following while it possesses the pawn; for a ride the brain switches to its Ridden state and takes its orders from the mount component, and on dismount the server re-possesses the pawn with the AI controller. Perception and the awareness component (7.3) live on the pawn for the same reason; that the AI Perception component behaves identically on a pawn as on a controller is a prototyping item.

The brain runs only on the server; clients receive the creature's movement and a small replicated behaviour state — calm, alert, afraid, angry, exhausted — that drives the riding guide's animation tells. Behaviours every creature shares are authored once as linked StateTree assets, supported since 5.4, and linked into each species' tree. Behaviour Trees are not deprecated; StateTree is chosen because a creature's top level genuinely is a set of states with bond-driven transitions.

### 7.2 State Layout

A tamed creature's root selects on its activity and band; a wild creature's on its needs and perceived threats.

| State | Entered when | Behaviour |
|---|---|---|
| Wild | no bond, or a bond broke | grazing, hunting, herding; flees or attacks by nature |
| Following | called, or the owner walks off with it | keeps near the owner, eats on the way |
| Ridden | the riding guide seats a rider | carries out accepted intent (7.6) |
| Resting | told to stay, or at its shelter | uses trough and rest smart objects (7.4) |
| Guarding | rider died, strong bond | holds by the body, attacks looters |
| Defending | intruders perceived at its shelter | fights or flees by nature and band (6.1) |
| Travelling home | rider died and it heads home; a hired horse returning | travels to shelter or stable (8.3) |
| Loose | rider died and it panicked | wild behaviour, old bond kept (6.3) |
| Slipped | slave pressure fell below the break threshold | flees, turns, or attacks to kill, by nature |

The hesitant and disobedient bands bias transitions rather than adding states: a disobedient creature may not come when called, drifts toward food and away from danger when following, and may wander off its rest point, which the next shelter evaluation then sees.

### 7.3 Perception and Fear

Each creature carries an [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine) component configured from species data with sight, hearing, and damage senses. Characters, creatures, fires, and spell effects register as stimuli sources, and loud events — a gallop, a thunderclap, a crack of spellcraft — report noise events. What the riding specification lists as frightening that no built-in sense covers, above all the scent of a large predator or of blood, becomes a custom sense, which Epic supports by subclassing the engine's sense class.

Perception feeds a fear value and a threat list on the creature's awareness component, which owns fear for the whole game: the brain reads it for its transitions, and the riding and flight guides read it from the same component, the riding guide's refusal check alongside the bond, and own only what fear does to steering, tells, and bolting. The stimuli, custom senses, and the fear value itself are defined here and nowhere else. Other systems read it through `GetFear()`, normalised from calm to panic. Fear rises with each frightening stimulus, scaled by its intensity and the species' sensitivity, and falls once the stimulus ages out. The riding guide supplies two modifiers to that fall and rise, and the component applies them without knowing their source: a settle-rate boost while a rider calms the mount, scaled by horsemanship, and a per-creature familiarity that dulls the fright of spells the mount has often heard from its own rider; fear spikes in the handler's company are the danger events that cost trust (3.1). Each sense's maximum age keeps a creature's memory of threats bounded. Epic publishes no cost guidance for sight across many creatures, so that cost is a prototyping item for the budget in section 8.2.

### 7.4 Troughs and Rest Spots as Smart Objects

[Smart Objects](https://dev.epicgames.com/documentation/unreal-engine/smart-objects-in-unreal-engine) are, in Epic's words, activities in the level used through a reservation system, which fits troughs and rest spots. When a trough piece is placed, the server registers it through the [Smart Object subsystem's](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/SmartObjectsModule/USmartObjectSubsystem) `CreateSmartObject`, meant for externally created objects, and destroys it with the piece; slot invalidation callbacks tell a creature mid-meal that its trough is gone. Slots decide only where creatures stand to eat, not who is fed: the ledger (5.3) counts every assigned creature, and a crowded trough sees them take turns at the rail. Epic notes that the subsystem is not thread-safe and gives no replication guidance, so it is used on the server's game thread only, and smart objects are recreated from piece records when a cell loads.

### 7.5 Navigation by Body Size

Ground creatures use the [navigation system](https://dev.epicgames.com/documentation/unreal-engine/navigation-system-in-unreal-engine). This section owns the navmesh decision for every ground creature, and the riding guide's whistle query reuses it. Each navmesh is built for one agent size, so each `EBodySizeClass` from Small to Huge maps to one agent entry and no more, since every agent is another navmesh in server memory. A colossal creature such as the [Titan Turtle](Creatures/Titan-turtle.md) is too large for a sensible agent and follows coarse routes with local avoidance. In 5.8, pawns without preferred navigation data use only data whose fly setting matches their own. Unreal has no built-in flying navigation, so an unridden flyer's route is planned by the [flight guide's](<Flight (Technical).md>) routing, which the brain calls like a ground path query. [Environment queries](https://dev.epicgames.com/documentation/unreal-engine/environment-query-system-in-unreal-engine) pick flee destinations, guard positions, and grazing spots on the server.

### 7.6 What Riding and Flight Call

While a rider is seated, the riding guide's `UMountComponent` turns each `FRiderIntent` into an accepted or refused order after its refusal check, and passes accepted orders to the brain's Ridden state, whose tasks carry them out in the creature's body: choosing footing, stepping around obstacles, slowing on a descent, and executing attack intents with the species' own attacks. Movement follows the riding guide's baseline, and airborne movement the flight guide's. The brain keeps perceiving while ridden, so fear and tells work in the saddle as on the ground, and a bolt is the brain leaving the Ridden state on its own.

The brain's interface is small: its behaviour state, fear and threats, an order from the mount component, and a request to enter Following, Resting, Guarding, or Travelling home with a target. The riding guide's stand, wait, and follow commands map onto Resting and Following, and how a mount decides to refuse lives entirely in the riding guide.

## 8. Wild Herds, Scale, and Unobserved Creatures

### 8.1 Mass for Wild Herds

Wild herds and ambient wildlife are many and mostly unobserved, which is what [Mass](https://dev.epicgames.com/documentation/unreal-engine/overview-of-mass-gameplay-in-unreal-engine) is for: entities with LOD levels from High to Off, a per-entity StateTree woken by Mass signals, and representation that steps from a full actor near a viewer down to instanced meshes and nothing. A herd of plains horses lives as Mass entities on the server, and a member is promoted to a full actor when a player comes near enough to interact with it. Epic labels Mass replication and Mass instanced-mesh animation Experimental, so Mass stays server-side: clients see only promoted actors, through ordinary replication under the [Replication Graph](<Server-architecture (Technical).md#5-replication-graph-visibility-driven-sync>). If Mass proves unready, actor-based herds with a few simulated leaders and followers at reduced tick rates replace it without touching this guide's data.

Every tamed creature is an actor, never a Mass entity, because it carries a persistent record and behaves as an individual. The boundary is the first care or coercive act: a wild creature that receives one is promoted, gets a creature id and a record holding the `FTamingAttempt`, and is persisted from then on, so a trust taming spread over several days finds the same animal waiting.

### 8.2 Server Budgets

The [Significance Manager](https://dev.epicgames.com/documentation/unreal-engine/significance-manager-in-unreal-engine) scores objects against viewpoints, and on a dedicated server it is fed every connected player's viewpoint. Creatures far from any player run their brains and perception at reduced rates, and those in cells without players are not ticked at all. Creatures resting in a stocked shelter are the cheapest case: nothing about them changes until an event arrives, so their brains idle in the Resting state with perception at its lowest rate until the building subsystem or an intruder wakes them.

### 8.3 Unobserved Travel Home

A mount heading home may have kilometres to cover with no player near. Once it leaves every player's relevance, its actor is removed and it becomes a record with a route, a departure time, and a pace, from which its position is derived on demand, as [settlement residents'](<Settlement-generation (Technical).md>) positions are. A player coming near the derived position spawns the actor there to resume the journey; once the arrival time passes, the creature is placed at its rest point with its packs and evaluated for shelter. A record crossing a region boundary moves under the protocol for [AI and persistent overlap residents](<Server-architecture (Technical).md#74-ai-and-persistent-overlap-residents>), carrying bond and route in the payload. A hired horse returning to its stable takes the same path.

### 8.4 Region Transfer and Persistence

A creature's record travels with it whenever its actor changes region, as part of the AI handoff state the server guide defines. A ridden creature crosses with its rider as one [transfer group](<Server-architecture (Technical).md#72-preparation-cutover-and-group-state>), which the riding guide registers; this guide contributes only the bond, the activity, and the brain's current state to the payload, so a transfer never resets fear or grants a fresh decision. Brain state that matters across a handoff — the active state, its target, and timers such as a guard's remaining patience — is captured as plain data rather than as StateTree internals, so the destination restores behaviour rather than restarting it.

## 9. Open Implementation Questions

The specification leaves a few decisions that an implementation cannot avoid.

- **Breeding and hatching conditions.** Whether breeding needs the pair to be sheltered or in a particular place, how long gestation or incubation takes, and what a found wild egg needs to hatch.
- **Where "near birth" ends.** The age up to which a found young animal can still be raised into a parental bond, and whether that window differs by species.
- **Competing and abandoned attempts.** Whether several strangers may work on the same creature at once, with the first to finish winning, or one active attempt locks others out; and whether an untouched trust attempt loses progress or is eventually dropped, returning the creature to its herd.
- **From coercion to trust.** Whether sustained care can convert a slave bond into a trust bond, or whether a coerced creature stays coerced for life.
- **Cooling in hot country.** Whether shade alone can ever meet a heat-sensitive creature's need in the hottest biomes, or whether the building system needs a cooling source to match the hearth.

## 10. Design Validation Cases

Prototyping should demonstrate each of the following before the system is considered sound:

- A creature in a stocked shelter whose owner logs off for a real week has exactly the strength it had at logout when the owner returns, and the trough holds what a week of drawing leaves.
- A shelter whose trough runs dry on the third day of a week's absence yields a creature that held for three days and decayed for four, reaching the same strength whether its cell stayed loaded or was unloaded throughout.
- No creature whose owner is offline ever falls below the offline floor, whatever its method, shelter, or activity, and a returning owner finds every creature still bonded to them.
- A raider breaking a barn's roof starts the bonds of the creatures inside decaying from that moment, and a raider who coerces a sheltered creature leaves with a slave bond while the old owner's record is gone.
- A loose mount whose rider died is reclaimed by its owner from its frayed strength, while a stranger starting a trust taming on the same animal begins from zero and is overtaken by the owner's care.
- A trust taming cannot be completed in a single sitting with unlimited food, because the daily cap holds.
- Two creatures of different owners sharing one trough empty it at the summed rate, and both bonds begin to decay at the moment it runs dry.
- A leviathan anchored with stocked deck troughs holds its bond; once they run dry it decays to the offline floor, slips its anchor through the flight guide, and is still its keeper's when found.
- A mount heading home across two region boundaries with no player near arrives at its shelter at the expected time with its packs, and an observer meeting it on the way sees it where its route says it should be.
- A server holding a few thousand sheltered creatures in unloaded cells spends nothing on them until an owner logs in or a cell loads.

## 11. Further Reading

- [StateTree in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/state-tree-in-unreal-engine)
- [UStateTreeAIComponent API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponent)
- [UStateTreeAIComponentSchema API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponentSchema)
- [Smart Objects in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/smart-objects-in-unreal-engine)
- [USmartObjectSubsystem API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/SmartObjectsModule/USmartObjectSubsystem)
- [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine)
- [Environment Query System](https://dev.epicgames.com/documentation/unreal-engine/environment-query-system-in-unreal-engine)
- [Overview of Mass Gameplay](https://dev.epicgames.com/documentation/unreal-engine/overview-of-mass-gameplay-in-unreal-engine)
- [Significance Manager](https://dev.epicgames.com/documentation/unreal-engine/significance-manager-in-unreal-engine)
- [Navigation System](https://dev.epicgames.com/documentation/unreal-engine/navigation-system-in-unreal-engine)
- [Gameplay Ability System](https://dev.epicgames.com/documentation/unreal-engine/gameplay-ability-system-for-unreal-engine)
- [Using Gameplay Tags in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/using-gameplay-tags-in-unreal-engine)
- [Unreal Engine 5.8 release notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes)

## Continue Reading

Continue with the [Taming and Control specification](Taming-and-control.md) this guide implements, [Creature Riding (Technical)](<Creature-riding (Technical).md>) and [Flight (Technical)](<Flight (Technical).md>) for the systems that call into the creature's brain and read its bond, [Building System (Technical)](<Building-system (Technical).md>) for the pieces and queries that make a shelter, and [Server Architecture (Technical)](<Server-architecture (Technical).md>) for the persistence and handoff it builds on.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
