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
9. [Design Validation Cases](#9-design-validation-cases)
10. [Further Reading](#10-further-reading)

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
    UPROPERTY(EditAnywhere) float ConversionPerCareDay = 0.f; // slave: most one real day of care can add toward becoming a trust bond (3.2); 0 = never converts
    UPROPERTY(EditAnywhere) float AttemptDecayPerDay = 0.f;   // trust: progress an abandoned attempt loses per real day (3.1)
    UPROPERTY(EditAnywhere) float AttemptIdleDays = 0.f;      // trust: days without a care act before an attempt counts as abandoned
};

USTRUCT()
struct FBreedingTuning   // read by the breeding and hatching rules (3.3); the durations are server-setting defaults per species
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) bool bLaysEggs = false;
    UPROPERTY(EditAnywhere) float GestationDays = 0.f;        // live-bearers: real days from conception to birth
    UPROPERTY(EditAnywhere) float IncubationDays = 0.f;       // egg-layers: real days of warmth an egg needs
    UPROPERTY(EditAnywhere) float EggWarmthCelsius = 20.f;    // the effective temperature (5.4) at or above which an egg incubates
    UPROPERTY(EditAnywhere) float ParentalWindowDays = 0.f;   // age at which the young are weaned or fledged; younger than this is "near birth"
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

USTRUCT()
struct FCreatureAttackShape   // a row names its action; see the note on rows below
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FGameplayTag Action;          // Creature.Action.Bite, .Lunge ...
    UPROPERTY(EditAnywhere) float RadiusCm = 60.f;        // sphere radius, in actor space
    UPROPERTY(EditAnywhere) float ReachCm = 90.f;         // how far in front of the body the sphere sits
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
    UPROPERTY(EditAnywhere) FBreedingTuning Breeding;
    UPROPERTY(EditAnywhere) TSoftObjectPtr<UStateTree> Brain;

    // The body, senses and attacks (7.3, 7.6) live in the same asset, so a new species is data and not code.
    UPROPERTY(EditAnywhere) TMap<FGameplayTag, TObjectPtr<UAnimMontage>> ActionMontages;   // Creature.Action.* -> the montage that plays it (7.1)
    UPROPERTY(EditAnywhere) TArray<FCreatureAttackShape> AttackShapes;                    // one row per striking action (7.6)
};
```

The values are illustrative; the specification fixes only their order. Parental bonding has the highest ceiling, trust is slow because its daily gain is capped, slave bonding starts strong and wears off fast, and the offline floor sits above the break threshold.

Taming data is only one group of the asset. The species asset also holds the groups that sections 7.3 and 7.6 call species data, each a struct beside `Needs` and `Bands`:

| Group | Holds |
|---|---|
| Body | the size class (7.5), the attack shapes, and the montage map |
| Leader | follower and leader health and the leader's size, for species that run in packs |
| Perception | sight radius and peripheral half-angle, hearing range, and each sense's memory (7.3) |
| Awareness | threat memory, in seconds |
| Fear | settle rate, sensitivity, and the hesitate, recover and flee thresholds (7.3), with how far a hesitating creature backs out past a fire's edge |
| Brain movement | how the brain asks for paths, including the back-off of section 7.5 |

The attack shapes are a list of rows that each name their action, not a map keyed by the action. The server's by-name tuning overrides, which let an operator change one number without a rebuild, cannot address the entries of a map in Unreal Engine 5.8, but they address an array row by index and name its action beside it.

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
    float ConversionProgress = 0.f;   // slave bonds only: 0..1 toward becoming a trust bond (3.2)
};

struct FTamingAttempt              // a would-be handler working on a creature that is wild or owned by someone else
{
    FGuid HandlerId;
    EBondMethod Method = EBondMethod::None;
    float Progress = 0.f;          // 0..1; completing it forms a new FBondRecord at the method's StartStrength
    double SettledAt = 0.0;
    double LastActAt = 0.0;        // the last care or coercive act, which starts the idle clock of 3.1
};

struct FTamedCreatureRecord
{
    FGuid CreatureId;              // stable across regions, restarts, and handoffs
    FPrimaryAssetId Species;
    uint8 Sex = 0;
    double BornAt = 0.0;           // raised and bred creatures; found adults and found young store their estimated birth time
    FBondRecord Bond;
    TOptional<FTamingAttempt> Attempt;   // at most one: an active attempt locks every other handler out (3.1)
    ECreatureActivity Activity = ECreatureActivity::Following;
    FVector RestPoint;             // where it was told to stay, and where its shelter is evaluated
    FPlacedObjectRef HomeShelterAnchor;   // the piece its last good shelter was evaluated against, for TravellingHome
    FShelterResult LastShelter;    // section 5
    bool bRestrained = false;      // chained to a tether post or shut in a barred pen at a base (3.2); set and cleared by the restraint placeable
    float Satiety = 1.f;           // the only food meter; the riding guide reads it. "Not hungry" for Tended means Satiety above zero
};
```

Clocks are server UTC seconds rather than in-game time, because the specification measures absence in real days. Those seconds are the cluster clock of the [server guide](<Server-architecture (Technical).md#101-cluster-clock-and-weather>), from which in-game time is derived, and this guide applies the guide's elapsed-time [catch-up](<Server-architecture (Technical).md#104-unobserved-activity>) to bonds.

In the [world state database](<Server-architecture (Technical).md#3-master-server-implementation>) each tamed creature is one row keyed by world and creature id, and each settle writes one small update into the [delta stream](<Server-architecture (Technical).md#81-delta-state-updates>). A ridden species also has the riding guide's mount record under the same id, holding tack, packs, and standing commands; ownership is always the bond's. A hired horse carries a `Stable` bond, owned by the stabling settlement's `FGuid`, whose strength is the species' `StableBondStrength` and which never decays. `Stable` is therefore a data case for the hired horses of [Hired Horses](Creature-riding.md#hired-horses), not a fourth taming method: no attempt forms it, the [riding guide's](<Creature-riding (Technical).md>) hire record creates it, and the timid stable horse needs no second bond model.

### 2.3 The Bond Component

`UBondComponent` lives on every tamed creature's actor on the server, holds its `FTamedCreatureRecord` while the actor exists, and is the only code that writes the bond. Other systems read a narrow interface, whose method names the riding and flight guides rely on: `GetNormalisedStrength()` and `GetBand()` for the refusal check and the whistle, `GetOwner()` for the character or settlement that holds the bond, and `SetAnchored(bool)`, which the flight guide calls to report a leviathan's anchor (5.5). Beside them sit the care state for healing and a band-changed delegate for the brain. No client reads the strength; players learn a bond through the animal's behaviour. If the interface ever shows the bond, it is replicated to the owning connection only.

The [Gameplay Ability System](https://dev.epicgames.com/documentation/unreal-engine/gameplay-ability-system-for-unreal-engine) is deliberately not the bond's home: a GAS attribute is a live, replicated value, while a bond has to be computed across periods when no actor exists at all. Health and stamina can use GAS like any other combatant's.

## 3. The Three Bonding Methods

### 3.1 Trust Bonding

Trust bonding begins with a wild creature and a `FTamingAttempt`. Each care act — feeding it from its diet, treating a wound, keeping it company while it eats — adds progress, and `GainPerCareDayCap` limits each day's total, so trust cannot be won in one long sitting however much food a player brings. Danger subtracts: damage taken and fear spikes suffered in the handler's company (7.3) cost progress, which is how keeping it out of needless danger becomes a rule. The taming and handling skills of [Skills](Skills.md) strengthen the bond through one hook: a skill multiplier on the progress and strength a care act adds, and on the pressure a coercive act adds (3.2), read from the handler's skill when the act is recorded and never stored on the bond. At full progress the attempt becomes a `FBondRecord` with method `Trust`, and the same care events go on raising strength toward the ceiling under the same cap while neglect lowers it.

A creature carries at most one `FTamingAttempt`, and starting an attempt on a creature that already holds an active one is refused whoever asks, which is how one handler's weeks of care cannot be raced. An attempt is abandoned once `AttemptIdleDays` pass without a care or coercive act, and from then its progress falls by `AttemptDecayPerDay`; the decay is a closed-form step applied at the next settle, like the bond's. When progress reaches zero the attempt is dropped. If the creature had no bond, its record is deleted and it rejoins its herd as a Mass entity (8.1), free to be tamed by anyone; if it was owned, only the attempt is dropped and the old bond stays in force (6.4). An attempt on an owned creature is accepted only while its bond strength is below the `Disobedient` band threshold (4.2) and is ended the moment the owner's care lifts the strength back above it (6.4). Slave attempts complete or lapse within their short window and are dropped the same way. Reference values: two idle days, a decay of 0,1 a day.

### 3.2 Slave Bonding

Slave bonding replaces care with pressure. A coercive act raises `Pressure`, which wears off at `PressureDecayPerHour` unless refreshed, and for a slave bond the strength everything else reads is the pressure itself, capped by the ceiling. The attempt completes in a short window rather than over days, which makes the method the easiest. When pressure falls below the break threshold, whether the owner is online or away, control slips, the record is cleared, and the creature's nature decides what follows: a skittish creature flees, a defiant one turns on its handler, a predatory one attacks to kill. Neither shelter nor the offline floor applies to pressure: it decays in every care state, sheltered or not, until none is left.

A coerced creature can be restrained at a base, chained to a tether post or shut in a barred pen, both placeables of the [shelter rules](Building-system.md#shelter-for-creatures). Restraining sets `bRestrained` on the creature's record. A restrained creature whose pressure has run out keeps its record at zero pressure instead of slipping: it cannot flee and cannot reach anyone to attack, stays where it is held, and attacks anyone who comes within its reach. The handler works the pressure back up by coercive acts, a step at a time, and nothing is restored for free. Raiders can free, kill or re-coerce a restrained creature (6.1, 6.2); freeing it clears `bRestrained`, and if its pressure is already spent it slips at once.

A slave bond can become a trust bond. While the bond is Tended and the owner applies no coercion, each care act adds to `ConversionProgress`, scaled by the same skill multiplier as other care and limited to `ConversionPerCareDay` a day; any coercive act resets it to zero. At full progress the record's method becomes `Trust`: `Pressure` is cleared, strength becomes the greater of its current value and the trust method's `StartStrength`, and from then on the bond follows the trust rules, including neglect decay and the daily care cap. The reference value of 0,05 a day makes the change take twenty days of care. A species whose slave tuning leaves `ConversionPerCareDay` at zero cannot be converted.

### 3.3 Parental Bonding and Breeding

A parental bond forms at birth or hatching and starts near the method's ceiling, the strongest any bond can be. A handler who owns a male and a female of a species with `bHasSexes` set can breed them, and the offspring's record is created with a parental bond to that handler. A handler can also find a wild egg or, for mammals, a young animal. The egg is an item that becomes a creature bonded to whoever hatches it, and the young animal taken in gets a parental bond if it is young enough to count as near birth.

Breeding starts only when both parents are sheltered (`IsSheltered()`, 5.1) and their rest points share one enclosed space, the grouping `SampleShelter` already reports for heat sources. It records a pregnancy on the mother, `{ SireId, DueAt }` with `DueAt` set to the start plus the species' `GestationDays`, and that moment is a settle event: the offspring record is created at the mother's rest point, at login or cell load if the interval passed unobserved, with `BornAt` set to `DueAt`. An egg-layer's pregnancy produces an egg item instead, carrying `IncubationDays`. A pregnancy needs no further shelter, and the duration defaults per species are server settings ([Server Settings](Server-settings.md#official-and-community-servers)), so a server can shorten them.

An egg incubates only while its effective temperature (5.4) at the place it lies is at or above the species' `EggWarmthCelsius`, so a wild egg needs a hearth or brazier in its space just as a creature does. It carries `{ IncubationDone, KeeperId, SettledAt }`; incubation progress advances in closed form over the intervals the egg was warm and holds still over the cold ones, so a chilled egg is never lost, only delayed. `KeeperId` is the character who last placed or tended it, and it receives the parental bond when the egg completes. A found young animal gets a parental bond when its age, `Now - BornAt`, is under the species' `ParentalWindowDays`, and otherwise can be bonded only by the trust and slave methods. A wild young animal's `BornAt` is stored on its own creature record, as every wild creature is a persistent individual under [Populations and Spawning](Populations-and-spawning.md), so the window is the same for every finder.

Once formed, a parental bond follows the same care rules as the others. A raised creature neglected while its owner is online can fall below the break threshold, and then it reverts to its wild instincts and breaks free: its record is cleared and its brain returns to wild behaviour.

## 4. Bond Change over Time

### 4.1 Care States

At every moment a bond is in one of three care states. **Tended**: the owner is online, the creature is in their company — following, ridden, or resting within a short companion radius — and it is fed, meaning its `Satiety` is above zero, which is how the specification's proper feeding is implemented; the bond does not decay, and care raises it. **Held**: the creature rests in a shelter that meets all four needs with a trough stocked for its diet (section 5), or it is an anchored leviathan with stocked deck troughs (5.5); the trust or parental bond is frozen exactly, online or not; a slave bond is never frozen, as the next paragraph says. **Neglected**: everything else, including a creature left in a field while its owner rides elsewhere and a sheltered one whose trough has run dry; the bond decays at the method's neglect rate. Slave bonds are the exception to all three: pressure decays in every care state, since neither company nor shelter stops it wearing off, and the care state of a slave bond only gates conversion (3.2).

### 4.2 Bands

Above `Hesitant` a creature is willing; below it, it answers late and refuses sooner; below `Disobedient` it openly disobeys; below `Break` the bond breaks, which for trust and parental bonds is reachable only while the owner is online and for a slave bond happens whether the owner is online or away, unless the creature is restrained. The riding guide's refusal check reads the strength itself, while the brain reacts to band changes, which `UBondComponent` broadcasts when a settle crosses one.

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

        if (Bond.Method == EBondMethod::Slave)
        {
            // Pressure decays in every care state and online or not: no held freeze, no offline floor.
            Bond.Pressure = FMath::Max(0.f, Bond.Pressure - Tuning.PressureDecayPerHour * float(Days * 24.0));
            Bond.Strength = FMath::Min(Bond.Pressure, Tuning.Ceiling);
        }
        else
        {
            if (Bond.CareState == ECareState::Neglected)
            {
                Bond.Strength -= Tuning.NeglectPerDay * float(Days);
            }
            if (!Bond.bOwnerOnline)
            {
                Bond.Strength = FMath::Max(Bond.Strength, Floor);   // trust and parental bonds never break while the owner is away
            }
        }

        Bond.SettledAt = StepEnd;
        if (StepEnd < Now)
        {
            Bond.CareState = ECareState::Neglected;   // the trough ran dry inside the interval
        }
    }

    // Trust and parental bonds break only while the owner is online; a slave bond breaks whenever its pressure is spent,
    // unless the creature is restrained, in which case the record stays at zero pressure and the creature stays held.
    const bool bCanBreak = Bond.Method == EBondMethod::Slave ? !Creature.bRestrained : Bond.bOwnerOnline;
    if (bCanBreak && Bond.Strength < Bands.Break)
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
// threshold is never reached, for instance because it lies below the offline floor of an owner who is away (a slave bond has no floor).
double FBondRules::TimeToReachBand(const FTamedCreatureRecord& Creature, const UCreatureSpeciesData& Species,
                                   float Threshold, const FTroughLedger* Trough);
```

The settle is deterministic, so a creature unloaded for a week and one simulated continuously end with the same strength, which [section 9](#9-design-validation-cases) requires.

### 4.4 Owners Offline

The offline floor is the specification's promise that a returning player finds their trust or parental creature disobedient but not gone. It excludes slave bonds, whose pressure keeps draining while the owner is away and ends in a slip unless the creature is restrained. It lives in the settle rather than a timer, so it holds alike for a lapsed shelter, a hillside, and a loose mount. Login and logout each settle every creature the owner holds, so no interval mixes online and offline rules, and login settles run against the persisted records without loading the creatures' cells.

Absence has a limit. When a character's `LastSeenAt` lies further back than the server's absence release, eight weeks by default and a server setting, the next settle releases every trust and parental bond they hold: each record is cleared and the creature's brain returns to wild behaviour where it stands, counting toward the wild population again (8.4). Slave bonds need no release, since their pressure has long since drained.

Starvation is independent of bonds and of the owner's presence. A creature that cannot reach food for itself, because it is restrained, penned or enclosed, and whose trough ledger (5.3) shows no food, accrues hunger from the moment `Satiety` reaches zero: it weakens, then loses health, then dies after the species' `StarvationDays`, ten by default, a per-species server setting. The span is applied in closed form at the settle like every other interval, so it gives the same result whether the cell was loaded or not, and a restrained slave-bonded creature starves on the same clock. A creature free to range is not starved by the clock; it feeds itself poorly and is neglected instead.

## 5. Shelter Evaluation

### 5.1 The Four Needs

A creature is sheltered when its rest point meets the four conditions of [Shelter for Creatures](Building-system.md#shelter-for-creatures). Each is answered by a spatial query on the building guide's server subsystem, `UBuildingQuerySubsystem`; this guide owns only what counts as passing.

| Need | Query on the building subsystem | Passes when |
|---|---|---|
| Food in reach | troughs whose reach covers the rest point | at least one returned trough holds food matching the creature's diet |
| A roof overhead | whether the rest point is roofed | the point is covered from above; walls are not required |
| The right climate | `SampleShelter` at the rest point: heat and cooling sources sharing its enclosed space and the enclosure's insulation | the effective temperature (5.4) lies inside the creature's comfort band |
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

An unobserved shelter may stay unloaded for a week of days and nights, so the climate test does not simulate hourly weather. It uses the daily extremes that the weather system gives for the place and the current season. A cold-sensitive creature passes when the season's coldest value plus the `Warmth` of the hearths and braziers that `SampleShelter` reports for its space reaches its comfort minimum; a heat-sensitive one passes when it is roofed, giving shade, and the season's hottest value less a fixed shade allowance, reduced further in proportion to the enclosure's `SampleShelter().Insulation` and by the `Cooling` of the cooling sources it reports for the space, stays under its maximum. Shade and insulation alone are not guaranteed to bring the hottest biomes' summer peaks under a heat-sensitive creature's maximum; the cooling term is what lets a shelter there pass, mirroring the hearth's `Warmth` on the cold side, and the building guide owns the cooling source that supplies it. A desert shelter therefore needs a hearth for a creature that suffers in the cold and a cooling source for one that suffers in the heat, and the result changes only with the season, which keeps the catch-up deterministic. If the building guide gives heat or cooling sources fuel that runs out, the burn-out time is one more catch-up event.

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

Its owner reclaims a loose creature by tending it: care raises the existing record's strength from wherever neglect left it, and the creature follows again as soon as its band allows. Anyone else may start a new `FTamingAttempt` by any method the species allows, provided no attempt on the creature is active (3.1) and the owner's bond strength is below the `Disobedient` threshold (4.2); a cared-for creature, including one held steady in a stocked shelter, refuses every attempt except the coercion of a raid (6.2). The contest runs in two stages. In the first, the stranger's care acts lower the owner's bond strength, by the rate the care states of 4.1 give a neglected bond plus the stranger's own care, and the owner's care raises it as ever; if the strength climbs back above `Disobedient`, the attempt is dropped. Only once the owner's strength has reached zero is the old record cleared and the stranger's attempt begins, with progress rising from zero by the rules of the method used (3.1, 3.2). A completed attempt replaces the old record, so trust is a slow way to steal a mount and coercion the quick but unreliable one. A mount left unsheltered when its owner logs out falls under the same rules: it can be killed, or contested by a stranger once its bond has sunk below `Disobedient`, which the offline floor lies beneath.

## 7. Creature AI Architecture

### 7.1 Server-Only Brains

Every creature that exists as an actor is driven by a [StateTree](https://dev.epicgames.com/documentation/unreal-engine/state-tree-in-unreal-engine), which Epic describes as a hierarchical state machine combining behaviour-tree selectors with states and transitions. The obvious host, [`UStateTreeAIComponent`](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponent), runs on an AI controller and its [schema](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeAIComponentSchema) reaches the creature through the controlled pawn. That does not survive riding, because the player's controller possesses the mount for the length of a ride, as [Creature Riding (Technical)](<Creature-riding (Technical).md#3-mount-and-rider-architecture>) section 3 explains. The brain is therefore hosted on the creature pawn itself with the general [`UStateTreeComponent`](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/GameplayStateTreeModule/UStateTreeComponent), so it keeps running whoever possesses the body. The AI controller supplies path following while it possesses the pawn; for a ride the brain switches to its Ridden state and takes its orders from the mount component, and on dismount the server re-possesses the pawn with the AI controller. Perception and the awareness component (7.3) live on the pawn for the same reason. The AI Perception component works on a pawn as on a controller: it casts sight from the owning pawn's eyes and registers its senses whatever the owner is, leaving only the binding of its update to the owner, which the pawn's own code makes.

The brain runs only on the server; clients receive the creature's movement and a small replicated behaviour state — calm, alert, afraid, angry, exhausted — that drives the riding guide's animation tells. A tell is the one animation a player must never miss, so it travels as replicated state and never as an event. A creature replicates its current action together with a sequence counter, and a client starts the animation when the value arrives:

```cpp
USTRUCT()
struct FCreatureActionState
{
    GENERATED_BODY()

    UPROPERTY() FGameplayTag Action;  // under Creature.Action: .Tell, .Lunge, .Bite, .Howl, .Hit.Front ...
    UPROPERTY() uint8 Sequence = 0;   // incremented on every new action, so a repeated action still reads as a change
};

UPROPERTY(ReplicatedUsing = OnRep_CurrentAction) FCreatureActionState CurrentAction;
```

The action is a gameplay tag and not an enum value, and each species maps the tags it uses to montages in its data (2.1). A new species then adds actions in data instead of growing one enum shared by every creature. The counter matters because a wolf that gives the same tell twice running would otherwise replicate an unchanged value. An unreliable multicast would lose the tell with every dropped packet, whereas replicated state converges on its latest value after a drop; at a tenth of packets dropped and 150 milliseconds of latency, clients still saw the tell before every lunge, and on a dedicated server every tell, lunge, bite and howl of the wolf encounter arrived by tag.

A creature's attack is an action of the body's shared [action slot](<Melee-combat (Technical).md#41-the-action-slot>), the same slot that holds a player's swings, and its phases carry what the encounter needs to read. The wolf's lunge has four: a tell of 0,7 seconds, an open run-up at the sprint that ends when the wolf reaches leap distance (3,5 metres) or gives up after 2,5 seconds, a leap of 0,35 seconds that ends in the hit, and 0,5 seconds of recovery. The brain commits the run-up phase when it starts the action, so a wolf in its run-up cannot also bite, and a bite, which repeats every 1,2 seconds, is pressed again only while the brain keeps asking for it. The brain keeps the tactics only: which wolf attacks, when, and the pack's turn-taking (7.7). In networked tests every lunge leapt 1,1 to 1,3 seconds after its tell began and hit 0,31 seconds after the leap.

Behaviours every creature shares are authored once as linked StateTree assets, supported since 5.4, and linked into each species' tree. Behaviour Trees are not deprecated; StateTree is chosen because a creature's top level genuinely is a set of states with bond-driven transitions. The tree stays a thin layer over plain functions. Every decision a species makes, which state wins, which pack slot a wolf takes, which attacker a pack sends, is a pure function of its inputs that the tree's conditions and tasks call, so that unit tests drive it without a running world; the wolf's stress rule (7.7) is the model. Where a StateTree asset cannot yet be authored with the available tooling, a plain C++ state machine whose states map one to one onto the tree's can stand in, because the decisions beneath it are the same functions.

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

Perception feeds a fear value and a threat list on the creature's awareness component, which owns fear for the whole game: the brain reads it for its transitions, and the riding and flight guides read it from the same component, the riding guide's refusal check alongside the bond, and own only what fear does to steering, tells, and bolting. The stimuli, custom senses, and the fear value itself are defined here and nowhere else. Other systems read it through `GetFear()`, normalised from calm to panic. Fear rises with each frightening stimulus, scaled by its intensity and the species' sensitivity, and falls once the stimulus ages out. The riding guide supplies two modifiers to that fall and rise, and the component applies them without knowing their source: a settle-rate boost while a rider calms the mount, scaled by horsemanship, and a per-creature familiarity that dulls the fright of spells the mount has often heard from its own rider; fear spikes in the handler's company are the danger events that cost trust (3.1). Each sense's maximum age keeps a creature's memory of threats bounded. Epic publishes no cost guidance for sight across many creatures, so that cost is a profiling item for the budget in section 8.2, where team affiliation keeps it down.

Sight and hearing are tuned per species in its perception configuration. The sight sense casts from the pawn's eye viewpoint, which a creature pawn overrides to return its head's direction rather than its body's, so the sight cone follows where the head points. A wolf is configured with a sight radius of 30 metres (`3000`) and a peripheral half-angle of 110 degrees, a hearing range of 50 metres (`5000`), and a head that turns toward the thing it watches by at most 80 degrees and only while it has something to watch; at rest the head lies along the body, which leaves the 140-degree blind arc behind it that [Wolf](Creatures/Wolf.md) describes. The post-leap blind spot of that page needs no rule of its own: the landing wolf's head still points along its leap, so a target under a metre beside or behind it lies outside the sight cone until the head turns, and the threat list's memory, eight seconds for a wolf, carries the pack through the gap.

Fire is a stimulus source with two radii, the light it throws and a felt margin beyond it. A torch lights 6 metres (`LightRadiusCm = 600`) and a campfire 8 metres (`800`), each with a felt margin of 2 metres (`200`). A creature that stands inside either radius takes the fire's stimulus on each perception update, so fear grows for as long as it stays and settles by the usual fall once it leaves. Two thresholds on the fear value, set per species, give a frightened creature hysteresis instead of flicker:

```cpp
UPROPERTY(EditAnywhere) float HesitateFearAt = 0.35f;     // at or above this fear a hunting creature backs out of the light and will not attack
UPROPERTY(EditAnywhere) float RecoverFearBelow = 0.25f;   // it attacks again only once fear has fallen below this
```

A creature above `HesitateFearAt` leaves the fire's zone and holds its attack orders until its fear is under `RecoverFearBelow`; a species also carries a flee threshold above both, past which it runs rather than backs away. The circle that results paces at the edge of the light and attacks far less often, without the fire making the player immune.

### 7.4 Troughs and Rest Spots as Smart Objects

[Smart Objects](https://dev.epicgames.com/documentation/unreal-engine/smart-objects-in-unreal-engine) are, in Epic's words, activities in the level used through a reservation system, which fits troughs and rest spots. When a trough piece is placed, the server registers it through the [Smart Object subsystem's](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/SmartObjectsModule/USmartObjectSubsystem) `CreateSmartObject`, meant for externally created objects, and destroys it with the piece; slot invalidation callbacks tell a creature mid-meal that its trough is gone. Slots decide only where creatures stand to eat, not who is fed: the ledger (5.3) counts every assigned creature, and a crowded trough sees them take turns at the rail. Epic notes that the subsystem is not thread-safe and gives no replication guidance, so it is used on the server's game thread only, and smart objects are recreated from piece records when a cell loads.

### 7.5 Navigation by Body Size

Ground creatures use the [navigation system](https://dev.epicgames.com/documentation/unreal-engine/navigation-system-in-unreal-engine). This section owns the navmesh decision for every ground creature, and the riding guide's whistle query reuses it. Each navmesh is built for one agent size, so each `EBodySizeClass` from Small to Huge maps to one agent entry and no more, since every agent is another navmesh in server memory. A colossal creature such as the [Titan Turtle](Creatures/Titan-turtle.md) is too large for a sensible agent and follows coarse routes with local avoidance.

A brain backs off its path requests after a failure. A dedicated server builds or loads its navigation data after it starts, which took between 20 and 112 seconds in a sandbox test, and every request made before the data is ready fails at once. A brain that asks again on its next tick turns that wait into a flood: nine resting wolves made 1500 to 1850 failed requests in two minutes. The rule is a wait of 0,25 seconds after a failure, doubling with each failure in a row up to 2 seconds and cleared by the first success, which cut the failures to 50 to 90 and roughly halved all requests without changing how the pack hunted. A distance-scaled re-goal with a cooldown between requests saved nothing on top, even against a jogging target, so the back-off is the whole rule. A region server's creatures therefore expect failed requests until its navigation data is built or loaded, and treat them as waiting, not as an unreachable target. In 5.8, pawns without preferred navigation data use only data whose fly setting matches their own. Unreal has no built-in flying navigation, so an unridden flyer's route is planned by the [flight guide's](<Flight (Technical).md>) routing, which the brain calls like a ground path query. [Environment queries](https://dev.epicgames.com/documentation/unreal-engine/environment-query-system-in-unreal-engine) pick flee destinations, guard positions, and grazing spots on the server.

### 7.6 What Riding and Flight Call

While a rider is seated, the riding guide's `UMountComponent` turns each `FRiderIntent` into an accepted or refused order after its refusal check, and passes accepted orders to the brain's Ridden state, whose tasks carry them out in the creature's body: choosing footing, stepping around obstacles, slowing on a descent, and executing attack intents with the species' own attacks. Movement follows the riding guide's baseline, and airborne movement the flight guide's. The brain keeps perceiving while ridden, so fear and tells work in the saddle as on the ground, and a bolt is the brain leaving the Ridden state on its own.

The brain's interface is small: its behaviour state, fear and threats, an order from the mount component, and a request to enter Following, Resting, Guarding, or Travelling home with a target. The riding guide's stand, wait, and follow commands map onto Resting and Following, and how a mount decides to refuse lives entirely in the riding guide.

A creature's attack is a hit test the server runs, and it is never placed on an animated bone. A dedicated server does not refresh the bone transforms of a mesh nobody renders, so a test at the head bone hits wherever the reference pose left the head. Server-side hit tests for creature attacks use the actor's own transform: a sphere or box in front of the creature's body, sized and offset by the attack's data, in actor space. Animation may still show the bite at the jaw, as the client sees it, but the server decides it from the body.

### 7.7 Species Decisions as Plain Functions

A species' decisions live in functions with no world access, called by its StateTree's conditions and tasks and driven directly by unit tests. The wolf pack is the model, and its decisions are these.

```cpp
// Pure: inputs in, decision out. The distances are in centimetres.
struct FWolfStressInput
{
    bool bHoldsAttackOrder = false;                    // this wolf holds a lunge or feint order
    int32 PackSizeFighting = 0;                        // wolves fighting beside it
    float NearestAttackerDistanceCm = TNumericLimits<float>::Max();  // nearest other wolf holding such an order or mauling the target
};

constexpr float WolfStressRadiusCm = 400.f;            // "a few metres": the fight, not the player, sets stress

bool WolfPackTactics::IsUnderStress(const FWolfStressInput& In)
{
    return In.bHoldsAttackOrder
        || In.PackSizeFighting <= 3
        || In.NearestAttackerDistanceCm <= WolfStressRadiusCm;
}
```

Stress is measured from the fight and not from the player, because every wolf in a closing circle has the player inside 15 metres; a rule keyed to the player marks the whole pack stressed for the whole hunt. A winded wolf then moves at the recovering gait its stress selects, a walk when calm and a trot when stressed, and the wolves at the back of a large pack, far from the lunging and mauling, are the ones that walk to recover. The same module holds the other pure functions: `ChooseLunger`, which picks the wolf in the 50 to 110 degree band off the player's view direction and falls back outside it only when the band is empty; `ClassifyBrace`, which reports a brace when the lunge direction is within 45 degrees of the view; `PlanWave`, which gives the feinters, the side lunger, the second lunger at six wolves or more, and the wolf that holds back, on the wave interval of the wolf entry; and `LeaderStandoff`, which places the leader at 1,3 times the circle radius. Each takes plain structs of positions and counts, which is what makes them testable without a running world.

## 8. Wild Herds, Scale, and Unobserved Creatures

### 8.1 Mass for Wild Herds

Wild herds and ambient wildlife are many and mostly unobserved, which is what [Mass](https://dev.epicgames.com/documentation/unreal-engine/overview-of-mass-gameplay-in-unreal-engine) is for: entities with LOD levels from High to Off, a per-entity StateTree woken by Mass signals, and representation that steps from a full actor near a viewer down to instanced meshes and nothing. A herd of plains horses lives as Mass entities on the server, and a member is promoted to a full actor when a player comes near enough to interact with it. Epic labels Mass replication and Mass instanced-mesh animation Experimental, so Mass stays server-side: clients see only promoted actors, through ordinary replication under the [server's spatial filtering](<Server-architecture (Technical).md#5-replication-visibility-driven-sync>). If Mass proves unready, actor-based herds with a few simulated leaders and followers at reduced tick rates replace it without touching this guide's data.

Every tamed creature is an actor, never a Mass entity, because it carries a persistent record and behaves as an individual. The boundary is the first care or coercive act: a wild creature that receives one is promoted, gets a creature id and a record holding the `FTamingAttempt`, and is persisted from then on, so a trust taming spread over several days finds the same animal waiting.

### 8.2 Server Budgets

The [Significance Manager](https://dev.epicgames.com/documentation/unreal-engine/significance-manager-in-unreal-engine) scores objects against viewpoints, and on a dedicated server it is fed every connected player's viewpoint. Creatures far from any player run their brains and perception at reduced rates, and those in cells without players are not ticked at all. Creatures resting in a stocked shelter are the cheapest case: nothing about them changes until an event arrives, so their brains idle in the Resting state with perception at its lowest rate until the building subsystem or an intruder wakes them.

Perception has its own budget, and it grows with the square of the creatures in range unless it is filtered. Pawns register as sight targets by default and make footsteps and breath that hearing reports, so every wolf's senses track every other wolf nearby only to discard them: in a 70-second run, five wolves received 1182 footstep and 314 winded-breath stimuli, all from one another. Players and creatures therefore implement `IGenericTeamAgentInterface` with a team id, and each creature's perception configuration sets its sense's `DetectionByAffiliation` so that sight and hearing detect only what the creature treats as a threat, which for a wolf is characters and the species it hunts, never its own kind or neutral wildlife. The stimuli that remain are the ones the brain acts on.

Teams are gameplay tags, and a one-way table of hostile pairs in configuration says who detects whom: the wolf is hostile to players without players needing an attitude towards wolves, and a body with no team is neutral to everyone. On a dedicated server with fourteen wolves, a pack spawned 20 metres from a standing player noticed it 0,2 to 0,3 seconds after spawning in seven runs, against 1,3 to 3,0 seconds when every wolf's sight also tracked every other wolf. That is a first, indirect measure of the saving, since the time-sliced sight checks reach the prey sooner once they stop spending themselves on packmates; profiling it directly on a full region remains part of the budget work. The engine caches a creature's team when its senses register, so a taming bond that changes a creature's side at runtime must refresh both its perception configuration and its registration as a seen stimulus source. Path requests are budgeted too: the back-off of section 7.5 keeps a region server's creatures from flooding the navigation system while its data loads.

### 8.3 Unobserved Travel Home

A mount heading home may have kilometres to cover with no player near. Once it leaves every player's relevance, its actor is removed and it becomes a record with a route, a departure time, and a pace, from which its position is derived on demand, as [settlement residents'](<Settlement-generation (Technical).md>) positions are. A player coming near the derived position spawns the actor there to resume the journey; once the arrival time passes, the creature is placed at its rest point with its packs and evaluated for shelter. A record crossing a region boundary moves under the protocol for [AI and persistent overlap residents](<Server-architecture (Technical).md#74-ai-and-persistent-overlap-residents>), carrying bond and route in the payload. A hired horse returning to its stable takes the same path.

### 8.4 Region Transfer and Persistence

A creature's record travels with it whenever its actor changes region, as part of the AI handoff state the server guide defines. A ridden creature crosses with its rider as one [transfer group](<Server-architecture (Technical).md#72-preparation-cutover-and-group-state>), which the riding guide registers; this guide contributes only the bond, the activity, and the brain's current state to the payload, so a transfer never resets fear or grants a fresh decision. Brain state that matters across a handoff — the active state, its target, and timers such as a guard's remaining patience — is captured as plain data rather than as StateTree internals, so the destination restores behaviour rather than restarting it.

## 9. Design Validation Cases

Prototyping should demonstrate each of the following before the system is considered sound:

- A creature in a stocked shelter whose owner logs off for a real week has exactly the strength it had at logout when the owner returns, and the trough holds what a week of drawing leaves.
- A shelter whose trough runs dry on the third day of a week's absence yields a creature that held for three days and decayed for four, reaching the same strength whether its cell stayed loaded or was unloaded throughout.
- No trust or parental creature whose owner is offline ever falls below the offline floor, whatever its shelter or activity, and a returning owner finds each of them still bonded to them.
- A slave-bonded creature in a stocked shelter loses pressure at the same rate as one in an open field, online or offline. Unrestrained, it slips when the pressure is spent, with its owner away or not; restrained, it holds still at zero pressure, cannot flee or reach anyone, attacks whoever enters its reach, and only coercive acts by the returning handler raise its pressure again.
- A raider breaking a barn's roof starts the bonds of the creatures inside decaying from that moment, and a raider who coerces a sheltered creature leaves with a slave bond while the old owner's record is gone.
- A loose mount whose rider died is reclaimed by its owner from its frayed strength, while a stranger starting a trust taming on the same animal can only begin once its bond has sunk below `Disobedient`, wears the old bond to zero before their own begins from zero, and loses the attempt if the owner's care lifts the bond back above `Disobedient` in time. A cared-for creature refuses the attempt outright.
- A trust or parental bond whose owner has been absent past the release period is cleared, and the creature stands wild and counted in the wild population; a penned creature with an empty trough weakens, loses health and dies on the species' span, with its owner online or away.
- A trust taming cannot be completed in a single sitting with unlimited food, because the daily cap holds.
- A second handler's attempt on a creature that already has an active one is refused, an attempt left idle past `AttemptIdleDays` decays to nothing, and the creature it leaves behind rejoins its herd.
- A slave bond tended for the conversion period becomes a trust bond, and a single coercive act during that period sends the conversion back to zero.
- A wild egg held below its species' warmth for a week hatches a week later than one kept warm throughout, and is never lost.
- On a dedicated server, a wolf's bite lands where its body is and not where the reference pose left the head bone, and a pack's tell reaches a client with a tenth of its packets dropped.
- Two creatures of different owners sharing one trough empty it at the summed rate, and both bonds begin to decay at the moment it runs dry.
- A leviathan anchored with stocked deck troughs holds its bond; once they run dry it decays to the offline floor, slips its anchor through the flight guide, and is still its keeper's when found.
- A mount heading home across two region boundaries with no player near arrives at its shelter at the expected time with its packs, and an observer meeting it on the way sees it where its route says it should be.
- A server holding a few thousand sheltered creatures in unloaded cells spends nothing on them until an owner logs in or a cell loads.

## 10. Further Reading

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
