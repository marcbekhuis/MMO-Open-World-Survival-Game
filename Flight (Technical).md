# Flight in Unreal Engine 5

A technical design and implementation research guide based on the [Flight specification](Flight.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Server Architecture (Technical)](<Server-architecture (Technical).md>). Engine facts were checked against Epic's 5.8 documentation on 11 October 2026, and each is linked where it is first used. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every API call needs validating against the engine version in use before it becomes production code.

Flight is built on top of the riding architecture in [Creature Riding (Technical)](<Creature-riding (Technical).md>), which owns the mount and rider model, the `FRiderIntent` input, the refusal check, stamina, mount inventory, and the movement baseline: the [Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine) now, with flight as `MOVE_Custom` sub-modes, and [Mover](https://dev.epicgames.com/documentation/unreal-engine/mover-in-unreal-engine) (Experimental in 5.8) as the documented migration path behind an intent layer. This guide does not repeat that decision; it describes what the air adds.

The same migration boundary applies as in the server guide. The flight rules in this guide — launch feasibility, the energy and pull-out model, the wind field, breath, the mana reserve, and the harness — are plain functions over plain data, specified independently of Unreal actors. Unreal is the integration layer that moves the capsule, replicates the result, and draws the sky, and that layer can be replaced without changing a rule or a stored record.

Three engine gaps shape the design. Epic's 5.8 documentation describes no built-in flying navigation and no breath or oxygen system, and it states that the [Wind Directional Source](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UWindDirectionalSourceComponent) affects SpeedTree assets only. The game therefore builds its own server-side wind field, breath stat, and air steering, and drives the visual wind from the same field.

---

## Table of Contents

1. [Pipeline Overview](#1-pipeline-overview)
2. [Data Model](#2-data-model)
3. [Flight Movement on the Riding Architecture](#3-flight-movement-on-the-riding-architecture)
4. [Launching and Landing](#4-launching-and-landing)
5. [The Energy Model](#5-the-energy-model)
6. [The Wind Field](#6-the-wind-field)
7. [Load, Weather, and Altitude](#7-load-weather-and-altitude)
8. [Breath](#8-breath)
9. [The Wing-Rig](#9-the-wing-rig)
10. [The Harness and Falling](#10-the-harness-and-falling)
11. [Mana-Borne Flight](#11-mana-borne-flight)
12. [Air Conflict Hooks](#12-air-conflict-hooks)
13. [Relevance, Handoff, and the View](#13-relevance-handoff-and-the-view)
14. [Persistence](#14-persistence)
15. [Open Implementation Questions](#15-open-implementation-questions)
16. [Design Validation Cases](#16-design-validation-cases)
17. [Further Reading](#17-further-reading)

---

## 1. Pipeline Overview

A flight tick runs the same path as a ridden step on the ground, with one extra stage. The rider's intent passes through the riding layer, which may refuse it, and the flight component turns what survives into forces in the air.

```
Client (owning)                         Server (authoritative)
---------------                         ----------------------
Rider input ─► FRiderIntent ──saved move──► UMountComponent ──refusal check (bond)──┐
     │                                         (riding doc)                          │
     │ predicts the same step                                                        ▼
     └──► UFlightComponent ◄── wind sample ── UWindFieldSubsystem ◄── weather state, terrain grids
            │   (energy model, launch,         ULeylineFieldSubsystem (mana-borne only)
            │    landing, pull-out instinct)
            ├──► stamina / mana charge ───────► mount stamina (riding) / FManaReserve (this guide)
            ├──► UBreathComponent ────────────► blackout ─► harness release ─► falling
            └──► CMC MOVE_Custom sub-mode ─────► replicated movement, corrections to client
                                                 creature's AI may override: pull-out, storm landing,
                                                 breath turn-down, raid climb (taming doc)
```

Everything that decides an outcome runs on the server. The owning client predicts its own mount's movement through the saved-move path, using the same wind field and the same energy model, and accepts corrections when the server's creature AI or a refusal changes what happened. Every other client sees a simulated proxy.

## 2. Data Model

### 2.1 Authored Assets

Each flying species carries a `UFlightDefinition`, referenced from the `Flight` field of its mount definition in the riding guide and sitting beside the creature data that [Taming and Control (Technical)](<Taming-and-control (Technical).md>) owns. Values are authored in SI units — metres, seconds, kilograms — and converted to Unreal's centimetres at the movement boundary, so designers and the rules never see engine units.

```cpp
UENUM()
enum class EFlightKind : uint8 { Winged, ManaBorne };

UENUM()
enum class ELaunchType : uint8 { Standing, RunUp };   // a drop launch is open to every winged flyer

USTRUCT()
struct FBreathProfile
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float CapacitySeconds = 60.f;      // at the base drain rate
    UPROPERTY(EditAnywhere) float ThinAirTolerance = 1.f;       // divides the thin-air drain; flyers far above 1
    UPROPERTY(EditAnywhere) float RefillPerSecond = 0.25f;      // fraction of capacity per second in good air
};

UCLASS()
class UFlightDefinition : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) EFlightKind Kind = EFlightKind::Winged;
    UPROPERTY(EditAnywhere) ELaunchType NativeLaunch = ELaunchType::RunUp;
    UPROPERTY(EditAnywhere) float EmptyMassKg = 400.f;
    UPROPERTY(EditAnywhere) float MaxTakeoffMassKg = 520.f;       // above this it refuses to launch
    UPROPERTY(EditAnywhere) float ThrustToWeightEmpty = 1.2f;     // >= 1 lifts from a standstill
    UPROPERTY(EditAnywhere) float TakeoffAirspeedEmpty = 14.f;    // m/s; scales with sqrt(mass ratio)
    UPROPERTY(EditAnywhere) float GroundAcceleration = 4.f;       // m/s^2 during a run-up
    UPROPERTY(EditAnywhere) float WingspanM = 12.f;
    UPROPERTY(EditAnywhere) float BestGlideRatio = 12.f;
    UPROPERTY(EditAnywhere) float StallSpeed = 9.f;
    UPROPERTY(EditAnywhere) float DiveTerminalSpeed = 60.f;
    UPROPERTY(EditAnywhere) float ComfortLoadFactor = 2.5f;       // pull-out g the wings take cleanly
    UPROPERTY(EditAnywhere) float MaxLoadFactor = 4.f;            // the instinctive, braking pull-out
    UPROPERTY(EditAnywhere) float ClimbCostPerMetre = 0.2f;       // costs go to the riding layer's stamina pool
    UPROPERTY(EditAnywhere) float StandingLaunchCost = 25.f;
    UPROPERTY(EditAnywhere) float CeilingAltitudeM = 4500.f;      // above the world datum
    UPROPERTY(EditAnywhere) uint8 StormTolerance = 0;             // highest weather severity band it flies in
    UPROPERTY(EditAnywhere) FBreathProfile Breath;
};
```

The wing-rig is an item definition with the same aerodynamic block and none of the body fields, described in [section 9](#9-the-wing-rig). Mana-borne species add the reserve parameters of [section 11](#11-mana-borne-flight).

### 2.2 Runtime State

Flight state is short-lived and is not written to the world database; only the leviathan's reserve and anchor are, as [section 14](#14-persistence) sets out.

```cpp
enum class EFlightSubMode : uint8
{
    None,            // not flying: walking (including a run-up and a roll-out) or falling
    StandingLaunch,  // scripted vertical climb out of a standstill
    Powered,         // wingbeats: level, climb, cruise, sprint
    Glide,           // wings locked, height and speed traded for distance
    Dive,            // wings folded
    PullOut,         // curving out of a dive at a commanded load factor
    Settle,          // final approach; hands back to walking on touchdown
    ManaDrift,       // mana-borne cruise and hover
    ManaSurge,       // mana-borne burst
    RigGlide         // a character on a wing-rig
};

struct FFlightState
{
    EFlightSubMode SubMode = EFlightSubMode::None;
    float PullOutLoadFactor = 0.f;    // commanded g during PullOut
    float DiveEntrySpeed = 0.f;       // for grading the transition
    float RigLaunchAltitude = 0.f;    // wing-rig only; the ceiling of that flight
    float WingStrain = 0.f;           // accumulated by over-sharp pull-outs; feeds the injury hook
};
```

## 3. Flight Movement on the Riding Architecture

### 3.1 Sub-Modes and Transitions

The player's controller possesses the mount, as the riding guide decides, and `UFlightComponent` sits on the mount beside `UMountComponent`. A run-up and a landing roll-out happen in the Character Movement Component's walking mode, as a gallop does, so the engine's floor finding and step-up keep working on the ground. Only once the flyer leaves the ground does the flight component switch the movement component to `MOVE_Custom` with one of the sub-modes above. Epic documents that [`MOVE_Custom`](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine) suspends the built-in movement physics and that `PhysCustom` calls `UpdateCustomMovement`, so each sub-mode is a branch of one custom physics function.

Flight reads the same `FRiderIntent` the ground does and defines no input record of its own. The heading is the heading. The gait field becomes the pace in the air: a walk asks for a slow glide with the wings locked, a trot or canter for a steady cruise, and a gallop for a hard sprint. The `Climb` field asks to climb, hold, or descend, and `bDive` tips the flyer into a dive and holds it there.

```cpp
// On the riding guide's CMC subclass, UMountMovementComponent; the flight branch delegates to UFlightComponent's rules.
void UMountMovementComponent::PhysCustom(float DeltaTime, int32 Iterations)
{
    const FRiderIntent& Intent = GetCurrentRiderIntent();                    // from the current saved move
    const FWindSample Wind = WindField->Sample(GetActorLocationSI(), GetWorld()->GetTimeSeconds());

    FFlightStep Step = FlightRules::Advance(Species, Flight, Intent, Wind, GetFlightContext(), DeltaTime);
    Step = Instinct::Apply(Species, Flight, Step, GetInstinctInputs());     // pull-out, terrain avoidance

    FHitResult Hit;
    SafeMoveUpdatedComponent(Step.DeltaSI * 100.0, Step.Rotation, /*bSweep*/ true, Hit);
    if (Hit.IsValidBlockingHit())
    {
        OnFlightImpact(Hit, Step);    // grazing contact slides; a hard hit injures and may end the flight
    }
    Flight = Step.NextState;
    ChargeCosts(Step.StaminaCost, Step.ManaCost);   // stamina pool owned by the riding layer
}
```

The riding guide fixes the movement contract in its section on [the intent layer](<Creature-riding (Technical).md#22-the-intent-layer-and-the-migration-path>): on the ground its rules produce an `FMountSteeringResult`, in the air `UFlightComponent` produces the `FFlightStep` above, and `UMountMovementComponent` consumes both. Game rules never call the movement component directly.

`FlightRules::Advance` is the engine-independent rule set of [section 5](#5-the-energy-model); the Unreal function only gathers inputs, applies the step with [`SafeMoveUpdatedComponent`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UMovementComponent/SafeMoveUpdatedComponent), and reports impacts. A Mover implementation later replaces this function and the saved-move plumbing and calls the same `Advance`.

### 3.2 Prediction

The riding guide sends `FRiderIntent` through an extended saved move. Flight adds the predicted state that changes how the next step integrates: the sub-mode, the commanded pull-out load factor, the dive entry speed, and the wing-rig's launch altitude. These travel in a subclass of [`FCharacterNetworkMoveData`](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine), filled in `ClientFillNetworkMoveData` and written in `Serialize`, with a matching `FSavedMove_Character` subclass so replays after a correction reproduce them, as Epic's networked-movement page describes.

The mount's instincts are the hard part, because the creature's AI runs on the server. The design therefore keeps the most frequent instincts inside the movement rules. The instinctive pull-out and terrain avoidance in `Instinct::Apply` read only the flyer's state, a terrain-clearance trace, and a pull-out safety margin derived from the bond and replicated to the owning client as a quantised value, so the client predicts the mount taking the dive from its rider at the same height the server does. Decisions that need perception or memory — a storm landing, a fear-driven bolt, the breath turn-down, the leviathan's raid climb — stay in the creature's AI and arrive as a server override that the client accepts as a correction. They are rare and telegraphed by tells first, so a correction lands where the rider already expects the animal to take over.

### 3.3 Steering Through the Air

The engine offers no volumetric navigation, so the creature's AI steers through the air with direct steering rather than pathfinding. Three inputs are enough for every flight the design calls for: a coarse altitude grid holding the highest terrain and static structure per tile, baked with the level, which gives a safe cruising height along a straight line; forward terrain-clearance traces using a swept shape the width of the wingspan, from the engine's [collision traces](https://dev.epicgames.com/documentation/unreal-engine/traces-in-unreal-engine---overview); and the ground [navigation mesh](https://dev.epicgames.com/documentation/unreal-engine/navigation-system-in-unreal-engine) at the destination, used only for the final approach and for walking out of a clearing after landing. A mount heading home without its rider, or a leviathan following its migration, flies the same way. Third-party volumetric navigation plugins exist but are not required.

## 4. Launching and Landing

### 4.1 Launch Feasibility

All three launch types come from one calculation. Lift grows with the square of airspeed, so the airspeed a flyer needs to leave the ground grows with the square root of its total mass, and the same load reduces its ratio of thrust to weight.

```cpp
struct FLaunchAssessment
{
    bool bFeasible = false;
    ELaunchFailure Failure = ELaunchFailure::None;   // Overloaded, Exhausted, NoStrip, NoDrop, Weather (the last two are set by the ground checks)
    float RequiredRunM = 0.f;                         // 0 for a standing launch
    float RequiredDropM = 0.f;
};

FLaunchAssessment FlightRules::AssessLaunch(const UFlightDefinition& S, float MassKg, float HeadwindMs, float Stamina,
                                            uint8 WeatherSeverity)   // severity band at the flyer's position, section 7.2
{
    FLaunchAssessment Out;
    if (WeatherSeverity > S.StormTolerance) { Out.Failure = ELaunchFailure::Weather; return Out; }
    if (MassKg > S.MaxTakeoffMassKg) { Out.Failure = ELaunchFailure::Overloaded; return Out; }

    const float MassRatio = MassKg / S.EmptyMassKg;
    const float TakeoffAirspeed = S.TakeoffAirspeedEmpty * FMath::Sqrt(MassRatio);
    const float ThrustToWeight = S.ThrustToWeightEmpty / MassRatio;
    const float GroundSpeedNeeded = FMath::Max(0.f, TakeoffAirspeed - HeadwindMs);   // wind over the wings counts
    Out.RequiredDropM = FMath::Square(GroundSpeedNeeded) / (2.f * 9.81f) * 1.3f;    // fall plus recovery margin

    // A standing flyer with the thrust for it springs straight up; a native run-up flyer always runs.
    if (S.NativeLaunch == ELaunchType::Standing && ThrustToWeight >= 1.f)
    {
        Out.bFeasible = Stamina >= S.StandingLaunchCost * MassRatio;
        Out.Failure = Out.bFeasible ? ELaunchFailure::None : ELaunchFailure::Exhausted;
        return Out;
    }
    // A run-up flyer runs at any load. A standing flyer too heavy for its thrust falls back to a short run:
    // some excess thrust shortens it, so a laden standing flyer needs only a few strides.
    const float Accel = S.GroundAcceleration * FMath::Max(0.2f, ThrustToWeight);
    Out.RequiredRunM = FMath::Square(GroundSpeedNeeded) / (2.f * Accel);
    Out.bFeasible = true;                                                            // provisional; the ground decides
    return Out;
}
```

A standing launcher with the thrust for it springs straight up, paying a cost that scales with load, so a tired flyer cannot manage it. A laden standing launcher drops below a thrust ratio of 1 and falls back to a short run, as the specification requires, and a native run-up flyer always runs, whatever its load. The severity band of the weather at the flyer's position is an input too: above the species' `StormTolerance` the assessment fails as weather before any other test ([section 7.2](#72-weather)). A tailwind counts as negative headwind and lengthens the run, which is why a run-up flyer's AI turns into the wind before it starts. A drop launch is feasible wherever the ground falls away ahead by `RequiredDropM` within a short distance, which an edge probe finds with a few downward traces.

When an assessment fails, flight does not refuse on its own. It hands the failure reason to the refusal evaluation in [Creature Riding (Technical)](<Creature-riding (Technical).md>), which plays the tell and the balk the same way it does for a cliff edge on the ground. An overloaded flyer therefore refuses with the same body language as an overloaded horse.

### 4.2 Strip Validation

A run-up needs a strip of length `RequiredRunM` plus a margin along the chosen heading, a wingspan wide, and the server validates it before the flyer commits. The corridor is sampled every few metres:

- a downward trace finds firm ground within a step height of the last sample, and the slope stays under the species' limit;
- the ground's physical material carries a [surface type](https://dev.epicgames.com/documentation/unreal-engine/add-a-surface-type-in-unreal-engine), and bog, deep snow, scree, and broken rock disqualify the sample;
- a box sweep the width of the wingspan and the height of a raised wing finds no trees, rocks, or structures;
- `UBuildingQuerySubsystem` from [Building System (Technical)](<Building-system (Technical).md>) reports no placed pieces in the corridor, and an overlap test finds no crowd of pawns, which is what rules out a crowded camp.

Once the run begins the flyer is committed: the movement rules stop accepting a halt for the next few seconds of the run, which gives the rider and onlookers the exposed window the specification describes.

### 4.3 Landing

The rider chooses where to come down by aiming at an area and asking to land; the mount chooses the exact spot. The creature's AI samples candidates within a few wingspans of the aim point, using the [Environment Query System](https://dev.epicgames.com/documentation/unreal-engine/environment-query-system-in-unreal-engine) or the same hand-written probes as the strip check, and scores each one:

| Test | Rejects |
|---|---|
| Ground firmness and slope | bog, deep snow, broken rock, a slope too steep to stand |
| Space for the body | anything narrower than the wingspan, overhanging branches, a crowded camp |
| Fear | a spot the creature's perception links to something it fears, through the fear evaluation the taming guide owns |
| Can it leave | for a run-up flyer, a spot from which no strip validates in any direction and no drop is in reach |
| Wind | nothing; candidates that allow an into-wind approach score higher |

A standing flyer settles nearly vertically. A run-up flyer approaches into the wind where it can and hands back to walking mode on touchdown, running off its speed over a roll-out of the same form as its take-off run. When no candidate passes, the mount gives its refusal tell and keeps flying. A forced landing — exhaustion past the tells, or a storm beyond the flyer's tolerance — drops the "can it leave" test and takes the nearest acceptable ground, which is how a careless rider ends up somewhere they did not choose. Shelter at home is the ordinary creature shelter of the building and taming guides.

## 5. The Energy Model

### 5.1 Airspeed, Height, and Energy

The rules track each flyer's height above the world datum `h` and its velocity relative to the moving air, the airspeed `v`. Ground velocity is airspeed plus the wind sample. A flyer's total energy per unit weight is `e = h + v² / 2g`, and every sub-mode is a statement about how `e` changes:

| Sub-mode | Energy | Stamina |
|---|---|---|
| Powered, level | held by wingbeats against drag | steady cost, rising with headwind and load |
| Powered, climbing | rises | the highest cost, per metre climbed, scaled by load |
| Glide | falls slowly; sink rate is airspeed divided by glide ratio | almost none |
| Dive | nearly conserved; height becomes speed up to the dive terminal speed | none |
| PullOut | falls by the drag of the turn | none, unless over-sharp |
| Any, in rising air | the wind sample's vertical component adds height | none; the flyer recovers while it circles |

Exhaustion aloft means the riding layer's stamina pool is empty: an exhausted flyer cannot climb or hold level flight, and it begins the forced landing of [section 4.3](#43-landing), trading height for distance in a glide to the nearest acceptable ground.

Headwind costs more because a flyer holds its airspeed: at the same wingbeat it covers less ground, so the cost per kilometre over the ground rises even though the cost per second barely changes. That falls out of the model without a special case. The riding layer's stamina pool takes the charges, and the cosmetic tells — the rhythm of the wingbeats, laboured breathing, sinking between strokes — are driven on clients from the replicated stamina fraction.

### 5.2 The Dive-to-Glide Curve

A pull-out is a turn in the vertical plane. At airspeed `v` and load factor `n`, the turn radius is `r = v² / (g (n − 1))`, and pulling out of a dive at angle `γ` below the horizon costs `r (1 − cos γ)` of height. Faster dives and heavier loads — a higher `v` and, for a heavy flyer, a lower usable `n` — therefore need more room, exactly as the specification says.

The rider shapes the curve with two inputs that already exist. Releasing the dive starts a pull-out at the species' `ComfortLoadFactor`; releasing it while asking to climb hauls the flyer round at `MaxLoadFactor`. The skill lies in when to release and whether to haul, and the movement rules grade the result:

- **Clean.** At or below the comfort factor, the turn costs only ordinary drag, and the flyer comes out level with most of its dive speed, entering `Glide` above best glide speed. The glide then spends that surplus speed before it starts spending height.
- **Too sharp.** Above the comfort factor, drag rises with the square of the excess, bleeding speed, and `WingStrain` accumulates; strain past a species threshold calls the injury hook in the riding layer. The flyer comes out slow and has to beat back up to a glide.
- **Too late.** The curve reaches level flight with too little height left to glide, and the flyer has to beat or land.
- **Too early.** The physics turns the speed back into height the flyer already had, which costs nothing but gains nothing.

Crosswind and gust samples apply sideways during the dive, so a dive near cliffs drifts off its line, and turbulence widens the pull-out the instinct check demands.

### 5.3 The Instinctive Pull-Out

On every dive step `Instinct::Apply` projects the flyer's path forward and measures clearance to terrain, trees, and water with a trace along the velocity. It computes the height a pull-out at `MaxLoadFactor` would need and multiplies it by the bond-derived safety margin: a weak bond gives a large margin and an early, high pull-out, a strong bond a margin close to 1 and a low, late one. When clearance falls to that height the flyer pulls out on its own at `MaxLoadFactor`, which is always the over-sharp kind, so it lives and loses its glide. The margin never reaches 1, so no flyer flies a dive into the ground whatever its rider asks. A turbulence term from the wind sample adds to the required height near cliffs.

## 6. The Wind Field

### 6.1 Composition

`UWindFieldSubsystem` answers one question: what is the air doing at this point at this time. It is a deterministic function of replicated weather state and cooked terrain data, so the server and the owning client get the same answer for prediction, and every client can drive its visual wind from it.

```cpp
struct FWindSample
{
    FVector3f Horizontal;   // m/s, prevailing wind adjusted for height and terrain
    float Vertical;         // m/s; positive is lift (ridge, thermal), negative is sink
    float Turbulence;       // 0..1, gust amplitude used for drift and pull-out margin
};
```

The sample sums four layers:

1. **Prevailing wind.** Each region's direction and strength for the current season and weather, from the weather state that [Weather, Time, and Seasons](Weather-time-and-seasons.md) defines, replicated as a few numbers per region and blended across region edges.
2. **Height profile.** Wind speed grows with height above ground by a power law whose exponent depends on surface roughness, so it is weak and broken near the ground and strong and steady higher up. Roughness — forest, open water, built-up ground — comes from a land-cover grid baked with the level, and the same grid sets the near-ground turbulence that decays with height.
3. **Ridge lift.** Where the wind blows against rising terrain, the air is pushed upward in proportion to the wind speed and the slope facing it, decaying with height above the slope. The terrain gradient is precomputed per tile, so the term costs a lookup.
4. **Thermals and sink.** By day, thermals rise over surfaces with a heat factor from their biome, strongest over the [Mesa](Biomes/Mesa.md) and the [Scorching Desert](Biomes/Scorching-desert.md), scaled by sun elevation. Cold water gives gentle sink, and night removes thermals entirely.

Thermals are discrete columns with a position, radius, strength, and lifetime. The server rolls them for each region and time window and replicates the short list, rather than having clients reproduce them from a seed, for the same reason the [Settlement Generation guide](<Settlement-generation (Technical).md>) gives: Epic makes no promise that a seeded random stream matches across platforms.

### 6.2 Uses

Every flight step samples the field once at the flyer's position; the wing-rig does the same. Crosswind drift follows from airspeed-plus-wind integration without extra rules. While the rider is steering, the mount's heading-hold crabs into the wind to keep its track, at the small cost of flying partly sideways; when the rider stops correcting, the mount holds its heading rather than its track and drifts. A leviathan treats the horizontal wind as force on a sail, as [section 11](#11-mana-borne-flight) describes.

Clients drive what a rider reads the wind from with the same field: foliage through the Wind Directional Source, and smoke, banners, grass, cloud drift, and whitecaps through material and effect parameters. Epic exposes the scene's wind parameters only in C++, through [`FSceneInterface`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/FSceneInterface) on the rendering side, and their availability on a headless dedicated server is unverified, so the game's field is the source and the rendering wind its consumer.

## 7. Load, Weather, and Altitude

### 7.1 Load

A flyer's mass is its body plus everything the riding layer's tack-based inventory says it carries, rider included. Flight reads the total and uses it in four places: launch feasibility and run length ([section 4.1](#41-launch-feasibility)), the climb cost, the usable pull-out load factor, and stall speed, which also scales with the square root of the mass ratio. No separate cargo limit exists for flyers; light saddlebags are simply all a winged flyer can carry and still launch, and an overloaded flyer refuses through the launch check. A mana-borne flyer reads the mass of its deck instead, as [section 11.2](#112-the-mana-reserve) describes.

### 7.2 Weather

The weather state at the flyer's position carries a severity band. A winged flyer will not launch into weather above its `StormTolerance`, and the launch assessment reports the failure as weather for the refusal tell. Aloft, when severity crosses the flyer's tolerance, the creature's AI takes over and makes a forced landing at the nearest acceptable ground. Lightning, hail, and turbulence are not modelled separately for flight; they are what the severity band means, and the turbulence term in the wind field makes flying in rising weather visibly harder before it becomes impossible. Fog is a rendering and audio condition with no flight rule.

### 7.3 Altitude and Cold

Altitude feeds the exposure rules of [Survival](Survival.md#temperature-and-exposure). The flight component supplies two inputs to the survival temperature calculation: an altitude lapse that cools the air as height above the world datum grows, and the wind chill of the flyer's airspeed acting on a rider who is sitting still. Clothing and preparation then work as they do on a high pass. The species' `CeilingAltitudeM` is a hard limit in the movement rules: climb authority fades to nothing as the flyer nears it, and the ceiling of a flyer that cannot reach the [Floating Islands](Biomes/Floating-islands.md) sits below them.

## 8. Breath

### 8.1 One Stat, Two Media

Breath is shared with [Survival](Survival.md#breath), and `UBreathComponent` implements it for every character and creature, underwater and in thin air alike. It is a server stat, replicated to the owning connection only, because the HUD shows it only to the player whose breath is draining.

```cpp
struct FBreathState
{
    float Fraction = 1.f;           // 1 = full
    bool bUnconscious = false;
};

float BreathRules::DrainPerSecond(const FBreathProfile& P, const FAirContext& Air)
{
    if (Air.bSubmerged)
    {
        return 1.f / P.CapacitySeconds;
    }
    const float Above = Air.AltitudeM - Air.ThinAirAltitudeM;     // world-level threshold above the highest peaks
    if (Above <= 0.f)
    {
        return -P.RefillPerSecond;                                 // good air: refills
    }
    const float Severity = 1.f + Above / Air.ThinAirScaleM;        // faster the higher the climb
    return Severity / (P.CapacitySeconds * P.ThinAirTolerance);
}
```

Submersion comes from the swimming state the movement component already tracks in water. Thin air begins at one world-level altitude above the highest peaks and the floating islands, and drains faster with height. Flying species carry a `ThinAirTolerance` far above a character's, which makes the rider fail first without any special rule. The warnings in the Survival specification — loud breathing, heartbeat, dulled sound, draining colour, closing vision — are staged client effects driven from the replicated fraction. The thin air that only shortens a climber's stamina on the high passes is a stamina modifier in the survival layer, not breath. Nothing extends breath in thin air; whether anything should is an open question in the [Design Backlog](Design-backlog.md), and the stat has no modifier slot for it until that is decided.

### 8.2 Blackout and Waking

At zero the character or creature becomes unconscious. A rider who blacks out triggers the harness release of [section 10](#10-the-harness-and-falling) and falls. While falling, the drain function returns a refill once the body drops below the thin-air altitude, and consciousness returns when breath passes a wake threshold, so a rider who fell from high enough comes to with a few seconds of fall left. The same rules apply to a creature.

The mount's own breath decides when it turns down. The creature's AI reads its breath fraction against a turn-down threshold derived from the bond: a strong bond lowers the threshold toward a floor, but the floor is fixed above zero, so a bond delays the turn and never prevents it. The one exception is a mount in panic fleeing upward, whose fear state in the creature's AI suppresses the turn-down; that mount can black out, and an unconscious flyer leaves `MOVE_Custom` for ordinary falling and falls like any heavy body.

## 9. The Wing-Rig

A wing-rig is flown by the player character's own movement component, not a mount, in the `RigGlide` sub-mode. Opening it requires the rig equipped, both hands free, height above ground above a minimum, and a carried mass under the rig's limit. While it is open the character's weapon and spell abilities are blocked by a state tag, which is how the specification's "no weapon or spell aloft" is enforced.

The rig uses the glide branch of the energy model with three differences. It has no powered mode at all. Rising air can slow or reverse its sink, but the rules clamp its height to just below `RigLaunchAltitude`, recorded when it opens, so rising air stretches a flight without ever lifting it above its start and every flight ends lower than it began. And load raises its sink rate steeply, so a heavily laden character sinks fast. Pulling up below stall speed stalls the rig into a steep drop; the landing impact speed, horizontal and vertical together, sets the injury on touchdown, with trees and water resolved by the ordinary collision and swimming rules. Rain reduces the glide ratio and turn rate while the skin is wet, storm turbulence amplifies gusts beyond what a rig can hold, and the rig takes wear per minute aloft and per hard landing through the durability rules of [Crafting](Crafting.md). A rider unbuckling from a flyer with a rig on their back enters `RigGlide` with the flyer's airspeed and their current height as the launch altitude.

## 10. The Harness and Falling

The flight saddle's harness is a small state machine on the rider's seat in the mount component.

| State | Entered by | Effect |
|---|---|---|
| Buckled | mounting a flyer | no manoeuvre unseats a conscious rider |
| Unbuckled | a deliberate, held input aloft | the rider leaves the seat and falls, or opens a rig |
| Released | the rider blacks out, the flyer dies, or the harness fails | the rider leaves the seat unconscious or unprepared and falls |

Harness failure is tack failure: the harness is part of the flight saddle and wears under the riding layer's tack rules. On release the server detaches the rider from the seat socket, re-enables the rider's own movement in falling mode with the flyer's velocity, and bumps the membership version of the mount-and-rider transfer group as [Server Architecture (Technical)](<Server-architecture (Technical).md#72-preparation-cutover-and-group-state>) requires. A conscious rider with a rig can open it while height remains. Impact damage follows the ordinary fall rules, and a rider who dies leaves a corpse where they land under [Death and Loss](Death-and-loss.md). A flyer that dies aloft falls with its packs, which stay on the carcass for looting at the crash site. A flyer that has lost its rider hands over to the riding guide's rider-lost behaviour, which decides by bond whether it stays near the body or heads home.

## 11. Mana-Borne Flight

### 11.1 Movement

The [Flying Leviathan](Creatures/Flying-leviathan.md) uses only `ManaDrift` and `ManaSurge`. Neither has launch, landing, stall, or dive branches; lift is not a function of airspeed, so the leviathan can hover at zero airspeed. Its turn rate and acceleration are low and its momentum large, so a pilot's heading intent produces a wide, ship-like turn. The surge is the bestiary entry's short burst, available while the reserve allows. The pilot steers from the steering station that the riding guide defines for [colossal mounts](<Creature-riding (Technical).md#33-colossal-mounts>), so the station's intent feeds the same drift and surge branches. Players walk on the deck as on any moving base: the Character Movement Component's based movement keeps a character standing on a moving actor and carries the base in its replicated movement. How deck occupants and built pieces join the leviathan's transfer group across a region handoff is pending the backlog item [Connected structures and mobile bases](Design-backlog.md), and until it is decided the deck's membership in the group is not specified.

### 11.2 The Mana Reserve

```cpp
struct FManaReserve
{
    float Current = 0.f;
    float Capacity = 0.f;            // grows with the creature; see the bestiary entry
};

float ManaRules::DrainPerSecond(const UManaFlyerData& S, const FManaFlightInputs& In)
{
    return In.ClimbRateMs * S.CostPerClimbMetre
         + (In.bSurging ? S.SurgeCostPerSecond : 0.f)
         + In.HeldCrosswindMs * S.HoldLineCostPerMs           // only while holding a line against the wind
         + In.DeckMassTonnes * S.CostPerTonneSecond;          // every tonne aboard, every second it flies
}

float ManaRules::RefillPerSecond(const UManaFlyerData& S, float LeylineIntensity)
{
    return S.BaseRefill + LeylineIntensity * S.LeylineRefill;     // mana-poor country refills only slowly
}
```

The unhurried drift itself costs nothing; everything beyond it draws on the reserve. The deck's mass is the carried weight of the creature-borne base, which [Building System (Technical)](<Building-system (Technical).md>) keeps as `FBaseRecord::CarriedWeightKg` — every piece plus the contents of its containers. Flight reads it through `UBuildingQuerySubsystem::GetCarriedWeightKg(BaseId)` and refreshes its cached value whenever `OnCarriedWeightChanged(BaseId, NewWeightKg)` fires. The building system counts kilograms; the drain term takes tonnes, so `DeckMassTonnes = GetCarriedWeightKg(BaseId) / 1000.f`, the only place the conversion happens. Every wall built changes the drain without the flight layer knowing about pieces. `ULeylineFieldSubsystem` samples leyline intensity at a position from the world's leyline network, a set of splines whose strength falls off with distance and which shift over time; the same sampler drives the leviathan's migration steering, which follows the strongest flows.

The reserve sets what the leviathan can do. Its ceiling is a function of the reserve fraction, highest when full and above any winged flyer's. A drained leviathan cannot climb or surge and sinks to a low drift height above terrain set in its species data; an adult's lift has a floor and never fails. A calf's lift depends on the floating islands' mana field instead of its own crystals, so outside the islands' biome volume it has no lift and dies, as the bestiary entry describes; its AI keeps it inside. The reserve is replicated as a quantised fraction that drives the crystals' emissive brightness, the pulse rate, and the pitch of the song, which is how a pilot reads it without a gauge.

### 11.3 Wind, Weather, and Thin Air

The horizontal wind acts on the leviathan as force on a large sail area, so a strong headwind can hold it nearly still over the ground. Holding a line against a crosswind is an active choice that spends mana through the hold-line term; otherwise it drifts. In severe weather it either climbs above the storm band, at the climb cost, or rides it out, which applies a storm drain and sends rolling motion through the deck that its occupants feel as unsteady footing. Its breath profile carries a very large `ThinAirTolerance`, so everyone aboard blacks out long before it does. A passenger who blacks out stays based on the deck and collapses there. A pilot who blacks out stops supplying intent, and the creature's AI resumes its own drift.

### 11.4 Anchoring While the Keeper Is Away

Before logging out, the keeper anchors the leviathan at a point on a leyline. The anchor is a persisted record — leviathan id, anchor point, keeper, and anchor time — and the leviathan circles the point while its reserve refills. Away from players it is not simulated: like a settlement resident in the [Settlement Generation guide](<Settlement-generation (Technical).md>), its position is derived on demand from the anchor and the clock, and it becomes a full actor when a player comes into relevance range. Flight reports the anchored state to `UBondComponent`, and whether the bond holds is the taming layer's elapsed-time catch-up over the deck troughs. Once the troughs run dry and the bond frays far enough, the taming layer writes the slip time onto the anchor record, and from then on the derived position follows the leviathan's migration from that moment, carrying its base.

### 11.5 The Raid Climb

The bestiary entry sets the rule that when the threat is on its own back, running cannot shake it and the leviathan climbs ([Flying Leviathan](Creatures/Flying-leviathan.md)). The deck condition is therefore the trigger: when the leviathan is harmed by someone standing on its own deck, the creature's AI enters a defensive climb: flight climbs at the best rate the reserve allows toward its current ceiling and holds there while the threat lasts. Anyone aboard runs out of breath and collapses on the deck. Looting the deck does not trigger the climb; only harming the creature does. Killing a leviathan carries the reputation cost the bestiary entry sets out, applied through the [Reputation System](Reputation-system.md).

### 11.6 Boarding and Leaving

A leviathan drifts at heights no ladder reaches, and the design adds no boarding mechanism of its own. Each way aboard is ordinary movement onto the deck, handled by systems that already exist:

- **Climbing across.** From high ground that the leviathan drifts past, a character climbs or jumps across the gap. Landing on the deck's collision, the Character Movement Component finds the floor and its based movement takes over, exactly as for any character stepping onto a moving platform.
- **Flying over.** A rider on their own mount lands on the deck under the landing validation of [section 4.3](#43-landing), which accepts the deck's building surfaces as in [section 12](#12-air-conflict-hooks), and the mount then stands on the deck as a based actor.
- **Gliding down.** A character on a wing-rig ([section 9](#9-the-wing-rig)) steers onto the deck and touches down as it would on any ground, with the landing speed setting the injury as usual.

Leaving mirrors this. A character walks off the deck edge and falls, opens a wing-rig while height remains, or mounts a flyer waiting on the deck and takes off from it. The only flight-specific rule is that the leviathan's own velocity carries over to anyone who leaves, as it does for a rider unbuckling from a winged flyer. Whether leaving and joining the deck changes a character's transfer-group membership is part of the pending backlog item named in [section 11.1](#111-movement).

## 12. Air Conflict Hooks

Flight supplies data to combat systems rather than resolving fights itself.

- **Dive strike.** At impact the flight component passes the flyer's speed, mass, and dive state to the riding guide's mounted-combat hook, which resolves it as a charge. The flyer leaves the strike in whatever sub-mode the pull-out produced, usually slow and low.
- **Dive tells.** The replicated `Dive` sub-mode drives the roar of air over folded wings, loudest ahead of the flyer, so a target hears it coming. The growing shadow is ordinary lighting.
- **Dropped objects.** An item released from the saddle or the deck becomes a projectile with the flyer's velocity. No throw counter exists: items carry mass, and a winged flyer's launch limit already holds it to a few heavy objects per flight.
- **Air assault.** Landing validation accepts building surfaces — wall tops, yards — when a ground trace lands on the structure and `HasClearance` on `UBuildingQuerySubsystem` confirms room for the body, so a flyer can set riders down inside a base. Defences against flyers are ordinary building pieces in the building guide.
- **Safe cities.** The guarded area of a safe city in [Conflict and PvP](Conflict-and-pvp.md#safe-cities-and-the-reach-of-the-guard) is tested as a vertical column over its ground footprint, so its law reaches the sky.
- **Dragon's breath.** A [Royal Dragon](Creatures/Royal-dragon.md)'s fire is a creature ability owned by the creature's AI and combat, aimed by its rider's attack intent like any mount's attack.

## 13. Relevance, Handoff, and the View

**Relevance.** Flyers use the flying-movement factor of the adaptive cull distance in [Server Architecture (Technical)](<Server-architecture (Technical).md#54-adaptive-velocity-aware-cull-distance>), which implements [Dynamic Culling and Render Distance](Dynamic-culling-and-render-distance.md). The leviathan takes the world-boss baseline radius; a gliding character takes the flying factor while its rig is open. A flyer also carries an [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine) stimulus source, so the [Birds](Creatures/Birds.md) below register it and lift, marking its track.

**Handoff.** Rider and mount cross a region boundary as one transfer group, and a fast dive or a fall is admitted under the swept-bounds rules for flight and forced displacement in the server guide's section on unavailable destinations. A rider who unbuckles leaves the group before the next handoff check.

**The view.** Nothing in the flight layer adds a marker, label, or map to the HUD. Flight uses the engine's [first-person rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering) like the rest of the game. The motion comfort options of [Accessibility](Accessibility.md) are implemented once, as a client-side filter on the seat's transform, in [Creature Riding (Technical)](<Creature-riding (Technical).md#13-presentation-in-first-person>), and they apply to a flyer's seat without change.

## 14. Persistence

Only three flight-related facts are written to the world database. The leviathan's mana reserve and its anchor record are persisted with the creature, so a restart reproduces an anchored leviathan in its circle with its reserve. Wing-rig and harness wear are item durability, stored with the item. Everything else — sub-mode, airspeed, pull-out progress, breath — is transient and travels only in the movement state of a region handoff or a crash-recovery snapshot, as the server guide's payload already covers.

## 15. Open Implementation Questions

- **Logging out aloft.** The specification covers a mount left unsheltered at logout, but not a rider who disconnects or logs out in the air. The options are that the mount makes a forced landing under its AI and becomes an ordinary unsheltered mount with the sleeping rider beside it; that rider and mount hold position aloft for a short grace period before that landing; or that logout in the air is refused while a disconnect falls back to the forced landing.
- **Ending the raid climb.** The specification says the leviathan does not come down until the threat is over, but leaves open what ends it once raiders lie senseless on the deck. The options are to hold the climb while any hostile body remains aboard, conscious or not; to treat an unconscious raider as no threat, so the leviathan descends after a hold time and the raiders wake; or to have prolonged blackout in thin air kill, which Survival does not currently state.
- **Thin-air altitude.** A single world-level threshold is the simplest reading of "above the highest peaks and the floating islands". If the islands' heights vary widely across the world, a regional threshold may read better and needs a ruling.

## 16. Design Validation Cases

Prototyping should demonstrate each of the following before the system is considered sound:

| Scenario | Expected outcome |
|---|---|
| A Royal Dragon with an empty saddle, then loaded to near its take-off limit | It springs from a standstill when empty; laden, it takes a few running strides; past its limit it refuses with its refusal tell |
| A run-up flyer launching in a forest clearing, then on an open meadow into and with the wind | The clearing fails strip validation and the mount balks; on the meadow the run is measurably shorter into the wind |
| A run-up flyer asked to land in a clearing it could not leave | The mount refuses the spot; exhausted, it lands there anyway |
| The same dive pulled out cleanly, too sharply, and left to instinct | The clean pull-out enters a long glide; the other two come out slow and add wing strain |
| A weakly and a strongly bonded flyer in an identical dive | The weak bond pulls out higher, neither reaches the ground, and the owning client predicts both without a correction |
| A round trip under a steady prevailing wind; a sunlit Mesa ridge by day and by night | The downwind leg costs clearly less stamina; the ridge holds a flyer up by day and lets it sink at night |
| A rider who climbs past their breath tells on a strongly bonded mount | The rider blacks out, falls, and wakes in thicker air in time to open a rig if the fall is long enough; the mount turns down before its own breath runs out |
| A wing-rig in strong ridge lift | It holds height for a long stretch but never rises above its launch point |
| A leviathan with a light deck and with a heavy fortress | The heavy one drains its reserve at cruise, surges for less time, and reaches a lower ceiling |
| An anchored leviathan whose troughs run dry during a week away, and one across a server restart | The first is found along its migration path from the slip time with its base aboard; the second reappears circling its anchor with the same reserve |

## 17. Further Reading

- [Understanding Networked Movement in the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine)
- [Comparing Mover and the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/comparing-mover-and-character-movement-component-in-unreal-engine)
- [Mover in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/mover-in-unreal-engine)
- [UMovementComponent::SafeMoveUpdatedComponent](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UMovementComponent/SafeMoveUpdatedComponent)
- [Traces in Unreal Engine — Overview](https://dev.epicgames.com/documentation/unreal-engine/traces-in-unreal-engine---overview)
- [Physical Materials in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/physical-materials-in-unreal-engine)
- [Environment Query System](https://dev.epicgames.com/documentation/unreal-engine/environment-query-system-in-unreal-engine)
- [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine)
- [Navigation System](https://dev.epicgames.com/documentation/unreal-engine/navigation-system-in-unreal-engine)
- [UWindDirectionalSourceComponent API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UWindDirectionalSourceComponent)
- [FSceneInterface API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/FSceneInterface)
- [First Person Rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering)
- [Unreal Engine 5.8 Release Notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes)

## Continue Reading

Continue with the [Flight specification](Flight.md) this guide implements and [Creature Riding (Technical)](<Creature-riding (Technical).md>) for the mount architecture it builds on. [Taming and Control (Technical)](<Taming-and-control (Technical).md>) owns the bond and the creature's AI that flight defers to, [Building System (Technical)](<Building-system (Technical).md>) owns the leviathan's deck and the spatial queries landing uses, and [Server Architecture (Technical)](<Server-architecture (Technical).md>) owns relevance, transfer groups, and persistence.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
