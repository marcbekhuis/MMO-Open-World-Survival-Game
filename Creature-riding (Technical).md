# Creature Riding in Unreal Engine 5

A technical design and implementation research guide based on the [Creature Riding specification](Creature-riding.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Server Architecture (Technical)](<Server-architecture (Technical).md>). Engine facts were checked against Epic's 5.8 documentation on 11 October 2026, and each is linked where it is first used. Epic publishes no sample, guide, or API for mounts and riders, so the mount-and-rider arrangement below is this project's own design built from documented parts. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every API call needs validating against the engine version in use before it becomes production code.

The same migration boundary applies as in the server guide. Everything the specification decides — a mount's bond-gated willingness, its fear, its gaits and stamina, what its tack lets it carry, what it does when its rider dies, and the terms of a hired horse — is plain data and plain rules, specified independently of Unreal actors. Unreal is the integration layer: it reads the rider's input, moves the creature's body, animates it, and replicates the result. That layer can be replaced, including the movement component itself as section 2 describes, without changing a stored mount or a single rule.

Four companion guides share this architecture. [Movement (Technical)](<Movement (Technical).md>) owns the walking body every mount is built on: its gaits, stamina, momentum, ground, and noise. [Taming and Control (Technical)](<Taming-and-control (Technical).md>) owns the bond, the creature's needs, and the creature's AI, which this guide calls whenever the mount has to judge or act for itself. [Flight (Technical)](<Flight (Technical).md>) builds flying on the movement baseline and intent layer set out here. [Building System (Technical)](<Building-system (Technical).md>) owns the saddle structures and decks of colossal mounts and the shelters a mount returns to.

---

## Table of Contents

1. [Pipeline Overview](#1-pipeline-overview)
2. [Movement Baseline: Character Movement Now, Mover Later](#2-movement-baseline-character-movement-now-mover-later)
3. [Mount and Rider Architecture](#3-mount-and-rider-architecture)
4. [Rider Intent and Creature Execution](#4-rider-intent-and-creature-execution)
5. [Gaits, Stamina, and Ground](#5-gaits-stamina-and-ground)
6. [Fear, Refusal, and Tells](#6-fear-refusal-and-tells)
7. [Tack, Load, and Care](#7-tack-load-and-care)
8. [Mounted Combat Hooks](#8-mounted-combat-hooks)
9. [When the Rider Falls or Leaves](#9-when-the-rider-falls-or-leaves)
10. [Hired Horses](#10-hired-horses)
11. [Calling and Leaving a Mount](#11-calling-and-leaving-a-mount)
12. [Networking, Prediction, and Persistence](#12-networking-prediction-and-persistence)
13. [Presentation in First Person](#13-presentation-in-first-person)
14. [Open Implementation Questions](#14-open-implementation-questions)
15. [Design Validation Cases](#15-design-validation-cases)
16. [Further Reading](#16-further-reading)

---

## 1. Pipeline Overview

Riding splits into what the rider asks for and what the creature does about it. The rider's client turns input into a small intent record, the server decides whether the creature is willing, and the creature's own movement logic turns a willing intent into footsteps.

```
Rider's client                        Server (authoritative)                        Everyone
--------------                        ----------------------                        --------
Enhanced Input ─► FRiderIntent ──┬──► UMountComponent
 (Riding context)  (heading, gait, │      bond band ◄── UBondComponent
                    actions)       │      fear      ◄── awareness component (Taming 7.3)
                                   │      refusal check ── unwilling ─► tell, then refuse or bolt
                                   │           │
                                   │      mount rule state (gait cap, drift, override) ── replicated
                                   ▼           ▼
          Predicted move: steering solve + UMountMovementComponent (walking) ─► simulated proxies,
          (the same function runs on client and server)                          ghosts in neighbour regions
```

One division of authority carries the design. What the creature decides from its own judgement — fear, refusal, bolting, the want it drifts toward — is decided only on the server and reaches the rider's client as replicated state. What follows deterministically from the intent and the ground — heading, gait speed, footing around a rock — runs inside the predicted move on both machines, so the reins answer at once, and the tells of section 6 give the server's decisions the lead time they need.

## 2. Movement Baseline: Character Movement Now, Mover Later

This section is the project's movement decision. [Flight (Technical)](<Flight (Technical).md>) builds on it rather than restating it.

### 2.1 The Decision

Creatures and riders move with the [Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine) (CMC). Mounted gaits run in the ordinary walking mode, with speed, acceleration, and turn rate set from the mount's state on each move. Flight runs as `MOVE_Custom` sub-modes, whose physics the CMC hands entirely to the game through `PhysCustom`, with any extra predicted state carried in custom saved-move data.

Epic's [comparison of Mover and the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/comparing-mover-and-character-movement-component-in-unreal-engine) calls the CMC battle-hardened and [Mover](https://dev.epicgames.com/documentation/unreal-engine/mover-in-unreal-engine) yet untested, and Mover remains Experimental in 5.8, with Epic advising caution when shipping it. The CMC is the documented, proven path for client prediction, server correction, and replay, and the rest of the server design already assumes it. For a game whose first promise in the saddle is responsive control of a living animal over a network, that decides the baseline.

### 2.2 The Intent Layer and the Migration Path

Mover suits this game in the long run. Its movement modes are modular and can be added from plugins at runtime, its layered moves persist across mode changes, and its plugin already ships walking, falling, swimming, and several flying modes, with navigation-driven movement through `UNavMoverComponent` ([Mover features and concepts](https://dev.epicgames.com/documentation/unreal-engine/mover-features-and-concepts-in-unreal-engine), [Mover API](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/Mover)). Mover is therefore the documented migration path, and the code is arranged so that switching touches only the integration layer.

The boundary is the intent layer. Game rules never call the CMC. They read and write the rider's `FRiderIntent`, the mount's rule state held by `UMountComponent`, and a steering solve that turns the two into a desired velocity and facing for the step. A thin adapter, `UMountMovementComponent` today, consumes that result and moves the body. It derives from the shared `ULocomotionMovementComponent` of [Movement (Technical)](<Movement (Technical).md>), the CMC subclass every walking body uses, so a mount's gaits, stamina, momentum, ground, and noise are the same model a player's and a wild creature's are. The component exposes the rider's current intent through `GetCurrentRiderIntent()`, which is how the flight component reads the vertical fields. On the ground the rules produce an `FMountSteeringResult`; in the air `UFlightComponent` produces the [flight guide's](<Flight (Technical).md>) `FFlightStep`. `UMountMovementComponent` consumes both, and no game rule calls the CMC directly. Under Mover the same solve would feed a Mover input producer instead, and because Mover has no built-in input handling and no directly writable velocity, the adapter is exactly the part that changes.

```cpp
// The only contract between riding rules and the movement backend.
struct FMountSteeringResult
{
    FVector DesiredVelocity = FVector::ZeroVector;   // cm/s, world space
    float   DesiredYaw = 0.f;                        // degrees
    float   MaxAcceleration = 0.f;                   // from gait, load, and bond response
    uint8   CustomSubMode = 0;                       // 0 = ground; flight sub-modes owned by UFlightComponent
};
```

The switch is worth revisiting once Mover leaves Experimental and its networked rollback is proven at this game's entity counts. Flight is the likeliest trigger, because Mover's modular modes map naturally onto launch types and glide states.

## 3. Mount and Rider Architecture

### 3.1 Two Pawns, One Controller

A mount is a character in its own right: an `ACharacter` subclass with its own skeleton, capsule, and `UMountMovementComponent` (section 2.2), carrying a `UMountComponent` for riding rules and a `UBondComponent` for its bond. The rider is the player's ordinary character. While riding, the player's controller possesses the mount through [`AController::Possess`](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/AController/Possess), which runs only on the server, so one controller drives one predicted movement component. The rider is attached to the mount's seat socket with its own movement disabled, and it keeps its health, inventory, equipment, hit detection, and animation: it is still the body that fights, aims, and dies.

Possessing the mount rather than relaying input through the rider is a judgement, not a documented engine pattern. It keeps prediction on a single movement component instead of reconciling two predicted bodies locked together. Its cost is that the creature's AI controller is unpossessed for the ride, so the creature's behaviour must keep running without owning the pawn: while mounted it runs in a ridden mode that takes the rider's intent as its goal, and on dismount the server re-possesses the pawn with the creature's AI controller. How that AI is hosted so it survives the change of controller is owned by [Taming and Control (Technical)](<Taming-and-control (Technical).md>).

```cpp
UCLASS()
class UMountDefinition : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) bool bRideable = true;                     // false for companions
    UPROPERTY(EditAnywhere) FName SeatSocket = "Seat";
    UPROPERTY(EditAnywhere) FGameplayTag TackFit;                       // Tack.Fit.Horse, Tack.Fit.Wolf, ...
    UPROPERTY(EditAnywhere) float StrengthKg = 400.f;                   // load it bears before overload; see below for flyers
    UPROPERTY(EditAnywhere) float WadingDepthCm = 120.f;                // deeper water triggers the refusal check
    UPROPERTY(EditAnywhere) TObjectPtr<ULocomotionProfile> Locomotion;  // section 5; the shared body model
    UPROPERTY(EditAnywhere) uint8 GrazeGait = 1;                        // the gait at which it can graze: the walk
    UPROPERTY(EditAnywhere) TObjectPtr<UMountTemperament> Temperament;  // section 6
    UPROPERTY(EditAnywhere) TObjectPtr<UFlightDefinition> Flight;       // null on the ground; see the flight guide
};
```

For flyers, `StrengthKg` governs what the mount carries on the ground, while the flight guide's `MaxTakeoffMassKg` governs what it can lift.

### 3.2 Mounting and Dismounting

Mounting is a server-validated transaction. The server checks that the creature is rideable — companions such as the [Four-Armed Monkey](Creatures/Four-armed-monkey.md) are not — that it wears a bridle, that the rider is within reach, and that the bond accepts this rider: the owner, or the current hirer of a hired horse. It then attaches the rider at the seat socket using [skeletal mesh sockets](https://dev.epicgames.com/documentation/unreal-engine/skeletal-mesh-sockets-in-unreal-engine), disables the rider's movement, switches possession, and registers the pair as a transfer group (section 12.4).

Dismounting reverses the order. The server finds a clear standing spot beside the mount, detaches the rider, restores its movement in walking or falling mode, re-possesses it, and hands the mount back to its AI under the last command it was given (section 11). Unhorsing (section 8.3) uses the same path without the search for a calm spot: the rider leaves with the mount's velocity plus an outward impulse and takes the fall.

### 3.3 Colossal Mounts

A [Titan Turtle](Creatures/Titan-turtle.md) or a [Flying Leviathan](Creatures/Flying-leviathan.md) is steered rather than ridden. A steering station in its saddle structure or deck, such as the chains that haul a turtle's head round, is an interactable that, while held, makes the holder's controller possess the creature exactly as in 3.1. Everyone else aboard walks on the structure as an ordinary character on a moving base, which the CMC already replicates through `ReplicatedBasedMovement`; Epic notes that replicated root motion bypasses the base, which matters for crew animations that use it. The structure, its piece budget, and its weight are owned by [Building System (Technical)](<Building-system (Technical).md>); riding reads that weight only as load, through `UBuildingQuerySubsystem::GetCarriedWeightKg(BaseId)` and the `OnCarriedWeightChanged(BaseId, NewWeightKg)` delegate that refreshes it.

## 4. Rider Intent and Creature Execution

### 4.1 The Intent Record

`FRiderIntent` is everything a rider can ask. It is small enough to travel in every saved move, and flight reads its vertical fields rather than defining its own record.

```cpp
UENUM()
enum class EGait : uint8 { Halt, Walk, Trot, Canter, Gallop };

UENUM(meta = (Bitflags))
enum class ERiderAction : uint8
{
    None   = 0,
    Attack = 1 << 0,   // the mount attacks with its own body (section 8.2)
    Charge = 1 << 1,   // couched weapon, commit to a run at the target
    Calm   = 1 << 2,   // settle a frightened or uneasy mount
};

USTRUCT()
struct FRiderIntent
{
    GENERATED_BODY()

    uint16 DesiredYaw = 0;        // quantised heading, 65536 steps per turn
    EGait  Gait = EGait::Walk;    // requested pace; the mount may cap it
    int8   Climb = 0;             // -1 descend, 0 hold, +1 climb; read by UFlightComponent
    bool   bDive = false;         // read by UFlightComponent
    uint8  Actions = 0;           // ERiderAction bits, edge-triggered per move
};
```

[Enhanced Input](https://dev.epicgames.com/documentation/unreal-engine/enhanced-input-in-unreal-engine) handles the change of controls. On mounting, the client adds a Riding mapping context through `UEnhancedInputLocalPlayerSubsystem::AddMappingContext` and removes the on-foot movement context; dismounting reverses it, and a flyer adds its flight context on top. Epic documents that when several contexts map the same Input Action, the context with the highest priority is used and the others are ignored; the riding and flight contexts are still authored not to overlap, and the exact rules for input consumed by more than one action are a prototyping item. Combat input stays on the rider's own context, because the rider holds the weapon.

### 4.2 The Steering Solve

The steering solve is where the creature decides how to put its feet down. It runs inside every predicted move on both client and server, so it must be a pure function of the intent, the mount's replicated rule state, and world geometry both machines share.

```cpp
FMountSteeringResult SolveSteering(const FRiderIntent& Intent, const FMountRuleState& Rules,
                                   const FLocomotionState& BodyState, const FMountFloorInfo& Floor,
                                   const FMountProbe& Probe, const UMountDefinition& Def)
{
    if (Rules.Override != EMountOverride::None)            // bolt, refusal stop, wheel away
    {
        return SolveOverride(Rules, Floor, Probe, Def);    // the rider's intent is ignored outright
    }

    // Gait, load, ground, slope, and stamina limits come from the shared body model.
    const FLocomotionIntent Body{ static_cast<uint8>(FMath::Min(Intent.Gait, Rules.GaitCap)), false };
    const FLocomotionStep Step = SolveLocomotion(Body, BodyState, Rules.Conditions, Floor.Ground,
                                                 *Def.Locomotion, GroundTable());

    float Yaw = DequantiseYaw(Intent.DesiredYaw);
    Yaw = BlendYaw(Yaw, Rules.DriftYaw, Rules.DriftWeight);  // a fraying bond drifts toward its own wants
    Yaw = AvoidSmallObstacles(Yaw, Probe);                   // stumps, sleeping dogs, rocks

    float Speed = KeepToFirmGround(Step.MaxSpeedCmS, Probe); // checks at bog edges and soft ground

    FMountSteeringResult Out;
    Out.DesiredYaw = Yaw;
    Out.DesiredVelocity = FRotator(0.f, Yaw, 0.f).Vector() * Speed;
    Out.MaxAcceleration = Step.AccelerationCmS2 * Rules.ResponseFactor;   // a weak bond answers late
    return Out;
}
```

Bond strength reaches the solve through values the server sets from the bond band. `ResponseFactor` scales acceleration and turn rate, so a fraying bond answers the reins late without adding any network delay. The mount turns toward `DesiredYaw` under the shared turn model of [section 4.1 of the movement guide](<Movement (Technical).md#41-turning>), with its species' turn-in-place rate, radius, and speed factor, so a galloping horse runs wide and a rider cannot haul it round on the spot. `DriftYaw` and `DriftWeight` bend the heading toward what the creature wants at that moment — pasture, home, or away from what it fears — so a mount drifts before it ever disobeys. The probe is a short forward sweep against static geometry and nearby blocking actors. Static geometry agrees on both machines; a moving obstacle may cause a small correction, which is acceptable.

The steering solve never refuses. A cliff edge, water too deep, or a charge into something stronger is caught by the server's refusal check in section 6, which then sets an override that the following moves on both machines obey.

## 5. Gaits, Stamina, and Ground

### 5.1 The Gait Table

A mount's gaits are the rows of its species' `ULocomotionProfile`, the shared body model of [Movement (Technical)](<Movement (Technical).md#2-the-locomotion-profile>): a halt as a zero-speed recovering row, then walk, trot, and canter as travelling rows and the gallop as the burst row, so `EGait` indexes the rows directly. The values are tuning; what the specification fixes is their relationship — the walk quiet and recovering, the trot cheap, the canter a day's travelling pace, the gallop fast, loud, and expensive. The one riding-only gait property, the gait at which a mount can graze, lives on `UMountDefinition` as `GrazeGait`.

### 5.2 Stamina and the Long Day

A mount's stamina is the shared pool of [section 5 of the movement guide](<Movement (Technical).md#5-stamina>): it drains and recovers by the second with the gait, and at zero the mount is winded, held to its recovering gaits until the pool passes the recovery threshold. Because the pool is predicted state, it is simulated in the client's saved moves and corrected by the server through the shared component (section 12.1). Fatigue is the riding layer's own second pool. It builds slowly across a day in the saddle from each gait's `FatiguePerSecond`, a physical weariness of the mount's own that has no counterpart in a character's session fatigue under [Survival](Survival.md#fatigue-and-rest), and the riding layer writes it into the body model's `CeilingFraction`, which lowers the stamina ceiling until the mount has rested; that is why a mount ridden from dawn to dusk starts the next day short of its best. The mount stamina indicator in [UI and HUD](UI-and-HUD.md) reads the same local value and appears only below a pressing threshold.

### 5.3 Ground

Ground is read through the shared ground table of [section 9.1 of the movement guide](<Movement (Technical).md#91-ground>), which maps each surface type to a speed factor, a roughness, a noise factor, and a role cap for every walking body. Riding adds two things. Water depth comes from the [water body](https://dev.epicgames.com/documentation/unreal-engine/water-system-in-unreal-engine) under the mount and is compared against its wading depth. And on ground beyond its comfortable gait the mount slows itself unless pressed; if pressed, the shared server-side stumble roll applies, and for a mount a stumble can also throw the rider (section 8.3) or injure a leg (section 7.3). The roll is server-only and the stagger reaches the owning client as a replicated event, so a fall is never predicted that did not happen.

### 5.4 Noise

Each gait reports its loudness through the shared noise reporting of [section 9.3 of the movement guide](<Movement (Technical).md#93-noise>), which the AI Hearing sense of creatures and NPCs picks up, so a column at the canter is heard well before it is seen. Ground tremor is separate from airborne sound: a gallop also posts a vibration event to a server-side tremor register that burrowing listeners such as the [Sandworm](Creatures/Sandworm.md) query. How that creature responds belongs to its AI in the taming guide; riding only reports the rhythm.

## 6. Fear, Refusal, and Tells

### 6.1 Temperament and Fear

Each species has a temperament asset: its baseline courage and the fear level at which a weakly bonded mount bolts. A hired horse uses a timid profile (section 10).

Fear itself is not owned here. It is a value between 0 and 1 on the creature's awareness component, which [Taming and Control (Technical) section 7.3](<Taming-and-control (Technical).md#73-perception-and-fear>) defines together with its stimuli (the scent of a large predator, fire, blood, lightning, loud or bright spells) and the custom senses that detect them. A creature is frightened by the same things whether it is ridden, grazing, or flying, so the awareness component keeps running in the saddle and riding only reads its fear value. Riding contributes two modifiers to it: the rider's `Calm` action and horsemanship, which make fear settle faster, and the mount's familiarity with a kind of spell, a small per-mount counter that rises with exposure and is saved with the mount, which reduces how much a spell's loudness frightens it, so a war mount that has stood beside battle-mages for a season barely flinches.

What riding owns is what fear does to the ride. As fear rises, the server lowers `ResponseFactor` and turns `DriftYaw` away from the source, so a frightened mount grows harder to steer, and the tells of section 6.3 give the rider warning. Above the bolt threshold, a mount whose bond band is weak takes the bolt override.

### 6.2 The Refusal Check

The server runs the refusal check whenever the intent or the situation changes, and periodically otherwise. It turns the danger of what is being asked — a drop ahead deeper than the species will step down, water past its wading depth, a charge at something whose strength rating far exceeds its own, a line of braced spears — into a required courage, and compares it with the courage available, which is the temperament's baseline scaled by the bond and reduced by fear. The bond's representation is owned by the taming guide; riding reads only the normalised strength and the band through the [bond component's interface](<Taming-and-control (Technical).md#23-the-bond-component>), and this holds for a hired horse as for any creature.

```cpp
EMountWillingness UMountComponent::EvaluateWillingness(const FDangerAssessment& Danger) const
{
    const float Bond      = Bonds->GetNormalisedStrength();   // FBondRecord via UBondComponent, 0..1
    const float Fear      = Awareness->GetFear();             // owned by the awareness component, 0..1
    const float Available = Temperament->BaseCourage * BondCourageCurve.Eval(Bond) * (1.f - Fear);
    const float Margin    = Available - Danger.RequiredCourage;

    if (Margin >= TellBand) { return EMountWillingness::Willing; }
    if (Margin >= 0.f)      { return EMountWillingness::Uneasy; }    // tells, still obeys
    return EMountWillingness::Refusing;                              // tells first, refuses if pressed
}
```

Horsemanship has no term in this calculation, because the specification is explicit that skill never overrides the animal. It acts in five other places: seat depth when a throw is tested (8.3), the rate at which `Calm` lowers fear, how early the tell begins (a practised rider widens `TellBand`, so the first ear flick comes sooner while the refusal point stays where the bond puts it), aim spread at speed (8.1), and the consistency of a charge (8.2).

### 6.3 From Tell to Refusal

A refusal is a small state machine whose first state is the tell. When the check returns `Uneasy` or `Refusing`, the server replicates a tell cue — ears back, head up, a sidestep, a self-imposed slowing — and opens a tell window. Within it the rider can ease off, which withdraws the dangerous intent; calm the mount, which lowers fear and may restore willingness; or press on. If the rider presses on and the check still says `Refusing` when the window closes, the server applies a refusal override chosen by species and situation: stop dead, rear, or wheel away. A rear tests the rider's seat.

```
Willing ──danger rises──► Tell (window open) ──eased off or calmed──► Willing
                               │
                               └──pressed on, still Refusing──► Refuse override ──► Willing once the danger is gone
Fear past the bolt threshold on a weak band ───────────────────► Bolt override ──► settles, or flees
```

The tell window does double duty. It is the rider's moment to choose, and it is the network's lead time: the cue reaches the owning client before any override does, so the client is never surprised by a refusal it could not predict. Bolting replaces the rider's intent with the creature's flight from the source of its fear; whether the rider stays aboard is a seat test, and a mount that throws its rider runs on alone.

## 7. Tack, Load, and Care

### 7.1 Tack

A mount's equipment is a fixed set of tack slots: bridle, saddle, pack, and barding. Each tack item carries a fit tag that must match the mount's `TackFit`, so a horse's saddle does not go on a wolf. The bridle is required to ride at all. A riding saddle adds seat and comfort over a long day; a war saddle gives the deeper seat that charges and mounted fighting require; a flight saddle with harness takes the saddle slot on a flyer and keeps a conscious, braced rider aboard in the air, as the [flight guide](<Flight (Technical).md>) specifies; a pack saddle supplies the frames for bags, the mount's only carrying capacity; and barding adds protection with a speed and stamina penalty. Colossal mounts take a saddle structure instead, owned by the building guide. Tack, the flight saddle included, has durability and wears with use and weather like any gear from [Crafting](Crafting.md), and a broken bridle, harness, or pack frame takes away what it provided until it is mended.

### 7.2 Load

Carried mass is the sum of the tack, the contents of the pack containers, and the rider with everything the rider carries; for a colossal mount it includes the carried weight of its structure, read with `GetCarriedWeightKg` and kept current by `OnCarriedWeightChanged` (section 3.3). The load ratio against `StrengthKg` is the `LoadFraction` of the shared body model, which turns it into a slower pace, a heavier stamina drain, and, once overloaded, a gait cap that forbids running, as [section 9.2 of the movement guide](<Movement (Technical).md#92-load>) sets out. This is the gear-driven rule of [Inventory](Inventory.md) applied to animals. Pack containers are ordinary inventory containers attached to the mount rather than the rider, so the packs go wherever the mount goes, which section 9 depends on.

### 7.3 Food, Injury, and Healing

A mount's diet and its food meter, `Satiety` on the taming guide's `FTamedCreatureRecord`, are owned by the taming guide, which makes it the only food meter. Riding adds the two ways it eats on the move: at the walk over ground tagged as grazing it refills `Satiety`, and elsewhere the rider feeds it from their stores or its packs.

Injuries are records on the mount — a wound with a severity, or a lame leg — that come from fights, falls, and stumbles. Lameness caps the gait below the gallop, an untreated wound worsens on a timer, crafted remedies treat it, and rest heals it, fastest while the creature is sheltered as the taming guide's shelter evaluation reports. A mount whose health reaches zero is dead for good.

## 8. Mounted Combat Hooks

Weapons, hit resolution, and damage belong to [Combat](Skills/Combat.md). Riding supplies what combat needs from the saddle and handles what combat does to a rider.

### 8.1 Weapons from the Saddle

The attached rider attacks with their own weapon, and combat receives the seat's facing and the mount's velocity as the attack's frame. Bows and crossbows receive an aim spread from the current gait, smallest at a halt or a walk and growing with speed, reduced by horsemanship. A spell cast from the saddle reports its loudness to the mount's fear.

### 8.2 The Charge and the Mount's Own Attack

A charge is an explicit state. When the rider sets `Charge` with a couched weapon in a war saddle, the server runs the refusal check against the target, and a willing mount arms the charge. It resolves on the first contact at speed, giving combat an impact derived from the combined mass of mount and rider and their closing velocity, then disarms; it re-arms only after the mount has wheeled away and reached charging speed again. Horsemanship narrows the spread of that impact, which is what a cleaner charge means.

`Attack` asks the creature to fight with its own body. Riding passes the intent and the target under the rider's aim to the creature's AI, which chooses and performs the species' attack — a wolf's lunge, a buffalo's trample, a dragon fighting as itself — as the taming guide defines it, behind the same refusal check.

### 8.3 Unhorsing

Every event that can throw a rider runs one seat test: a heavy blow to the rider, a hit to the mount, a rear, a bad stumble, a bolt. The event supplies a throw force, and the seat resists with the saddle's seat value plus horsemanship. If the throw wins, the server dismounts the rider through the unhorsing path in 3.2 and the fall is resolved by the normal falling rules. The riderless mount reverts to its AI, still carrying its fear.

## 9. When the Rider Falls or Leaves

### 9.1 Rider Death

When a mounted rider dies, the server detaches the corpse, which follows [Death and Loss](Death-and-loss.md), and resolves the mount's response from its bond band. A strong bond chooses, by the creature's nature as its AI defines it, between guarding the body, treating anyone who comes to loot it as a threat, and making its own way home to its shelter. A weak band panics: the mount takes the bolt override and is then released to wild behaviour. Because the packs are attached to the mount, a guarding mount keeps its cargo beside the body and a homing or bolting one carries it away. When a mount dies, the server spawns a carcass container holding its tack and packs under the same full-loot rule as a player corpse.

### 9.2 Ownership After Loss

A rider's death never transfers ownership. The mount's `FBondRecord` keeps its original owner and decays as neglect would, so the owner can find the animal and win it back, while anyone else must start a new bond from nothing. Both paths are owned by [Taming and Control (Technical)](<Taming-and-control (Technical).md>).

### 9.3 A Mount Left in the World

A mount left unsheltered at logout stays in the world as a persistent entity that must survive restarts and region transfers while its owner is away, the same kind of entity as the sleeping character of [Death and Loss](Death-and-loss.md#logging-out). The ownership and recovery contract for such entities is tracked in the [Design Backlog](Design-backlog.md) under portals, respawn, login, and disconnects, and mounts follow whatever it settles. The elapsed-time bond decay of an unsheltered mount is applied by the taming guide; riding saves only the mount's position, and its last standing command persists as the taming guide's `ECreatureActivity`.

## 10. Hired Horses

A hired horse is a real tamed creature whose bond belongs to its stable's settlement. The bond is a `Stable` bond of the taming guide, a data case rather than a fourth taming method, and its strength is the species' `StableBondStrength`, fixed and never decaying. The hire record therefore carries no strength field. Its hire is a plain record, saved with the horse and indexed by hirer, so the stable network can tell which horses are out and with whom without loading an actor.

```cpp
struct FMountHireRecord
{
    FGuid  MountId;
    FGuid  HomeSettlementId;       // the settlement whose stable trained it; the Stable bond's owner id
    FName  Realm;                  // returns are accepted at any stable of this realm
    FGuid  HirerCharacterId;
    int64  Deposit = 0;            // in the economy's smallest currency unit
    int64  Fee = 0;
    double HiredAtWorldTime = 0.0;
    float  ConditionAtHire = 1.f;  // wear is charged against this on return
    bool   bReportedStolen = false;
};
```

The mounting check accepts the current hirer against the stable's bond, and the willingness check reads the bond's strength through the bond interface as for any creature. The horse's timid temperament lowers its courage and its bolt threshold, which is all that "timid in a crisis" needs: no special rule, only data in the refusal check of section 6.

A return is a server transaction at a stable's hand-in point. The server confirms that the stable belongs to the horse's realm — an independent frontier settlement, outlaw town, or bandit camp has no realm stable and turns the horse away — compares the horse's condition with `ConditionAtHire`, refunds the deposit less the wear charge, closes the record, and adds the horse to that stable's roster. A horse kept past its hire is flagged as stolen and a theft event against the hirer goes to the stable's settlement through the [Reputation System](Reputation-system.md). If the hirer dies, the horse takes the homing outcome whatever its bond, walks to its home stable, and the stable closes the record keeping its share of the deposit.

## 11. Calling and Leaving a Mount

A dismounted mount runs its AI under the rider's last command — stand, wait, or follow at a distance — which persists as the taming guide's `ECreatureActivity` (Resting or Following). The whistle is a server request with the specification's three gates: the mount must be within earshot, a tuning radius around the whistler; its bond band must be high enough to answer; and a path must exist, tested with a navigation query from the mount to the whistler. Only a found path brings the mount, so an animal penned behind stable walls or a kilometre away stays where it is.

The whistle's path query runs against the navigation mesh for the mount's body size class. Which classes exist, how each maps to a navmesh agent, and the decision for colossal creatures are owned by [Taming and Control (Technical) section 7.5](<Taming-and-control (Technical).md#75-navigation-by-body-size>). Flyers' pathing belongs to the flight guide.

## 12. Networking, Prediction, and Persistence

### 12.1 Predicting the Ridden Creature

The owning client predicts the mount through the saved moves of `UMountMovementComponent`, following Epic's [networked movement guide](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine). Each move carries the `FRiderIntent` in a subclass of `FCharacterNetworkMoveData`, filled and serialised through its overrides and registered with `SetNetworkMoveDataContainer`. The predicted state that must agree — stamina, fatigue, the winded flag, the current gait — lives in a subclass of `FSavedMove_Character` so it is saved and replayed with each move, and an extended move response returns it with every correction. The body-model part of that state, and the move data and response that carry it, are the shared ones of [section 7 of the movement guide](<Movement (Technical).md#7-players-prediction-and-correction>); the riding subclasses extend them with the rider's intent and the mount's fatigue.

Server-decided rule state — gait caps from injury, load, and ground, `ResponseFactor`, drift, fear, the tell cue, and any override — is not predicted. It replicates to the owning client as a compact struct stamped with the server move time at which it took effect, and the steering solve reads the value in force for each move it replays. Because the client replays saved moves after a correction, every value the solve reads must be in the saved move or stamped to a move time; a value read from "now" would replay wrongly. Mispredictions are confined to the moves between a server decision and its arrival, and the tell window makes the first of those decisions a cue rather than a change of course.

### 12.2 Other Players and Relevance

Other clients see the mount as a simulated proxy with the CMC's smoothing and the rider as an attached actor whose attachment replicates with it. The tell cue, gait, fear, and stamina band replicate to everyone in range, because onlookers read a mount's ears and breathing as its rider does. Update rates follow [section 4.3 of the server guide](<Server-architecture (Technical).md#43-tick-rate--net-update-frequency>), with a ridden mount treated as player-driven. The mount is the relevance root for the pair, and a galloping mount is the standard ground case of [Dynamic Culling and Render Distance](Dynamic-culling-and-render-distance.md), implemented by the speed-scaled cull distance of [section 5.4 of the server guide](<Server-architecture (Technical).md#54-adaptive-velocity-aware-cull-distance>).

### 12.3 Ghosts

Near a region edge the mount and rider appear in the neighbouring region as ghosts under the [ghost entity protocol](<Server-architecture (Technical).md#61-ghost-entity-protocol>). The tell cue and gait flags extend the server guide's ghost `StateFlags`, so a mount seen across the boundary still reads correctly.

### 12.4 The Transfer Group

The mount, its rider, its tack, and its pack contents form one transfer group under [section 7.2 of the server guide](<Server-architecture (Technical).md#72-preparation-cutover-and-group-state>), with the mount as the movement root and the seat attachment recorded in the membership list. Riding supplies the group; it does not implement transfer. Mounting, dismounting, unhorsing, and rider death each change the membership version, so a handoff prepared before such an event is revalidated before it commits. Whether a colossal mount's group also includes its structure and everyone standing on it is pending the backlog item "Connected structures and mobile bases" in the [Design Backlog](Design-backlog.md); until that is settled, only the mount, its rider, and its tack and packs are specified as members.

### 12.5 Persistence

A mount's durable state is a plain record keyed by a stable id, never an actor reference, stored in the [world state database](<Server-architecture (Technical).md#3-master-server-implementation>) and updated through the [delta stream](<Server-architecture (Technical).md#81-delta-state-updates>).

```cpp
struct FMountRecord
{
    FGuid  MountId;
    FPrimaryAssetId Species;                  // UMountDefinition and the creature's data
    TArray<FGuid> TackItemIds;                // by tack slot
    TArray<FGuid> PackContainerIds;
    float  Stamina = 1.f;
    float  Fatigue = 0.f;
    TArray<FMountInjury> Injuries;
    TArray<float> SpellFamiliarity;           // by spell category
    FVector3d Location;                       // large-world coordinates
    // Ownership is the bond's (FBondRecord), food is Satiety and the standing command is
    // ECreatureActivity, all on the taming guide's FTamedCreatureRecord under the same id.
    TOptional<FMountHireRecord> Hire;
};
```

Fear, the tell state, and overrides are left out on purpose: they are momentary, and a mount loaded from storage starts calm.

## 13. Presentation in First Person

The rider learns about the mount from what sits in front of them, so the head, ears, and neck are driven by replicated rule state as additive animation layers: the tell cue pins or flicks the ears and lifts the head, fear tightens the neck, and the stamina band sets the breathing loop and its loudness. A stumble, a rear, or a gait change reaches the view as a camera impulse scaled by the event, always within the motion comfort options of [Accessibility](Accessibility.md); Epic documents no camera-comfort settings, so those options are the game's own.

The rider uses Unreal's [first-person rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering): the rider's arms and weapon use the First Person primitive type with the camera's First Person Field of View and First Person Scale, and the World Space Representation is the body others see in the saddle. Its advanced features, such as self-shadowing and the shadows of the world-space body, need first-person pixels marked in the GBuffer and do not work with the mobile or forward renderers, which makes a deferred PC renderer a requirement of the riding view.

Quadruped locomotion has no Epic reference. [Motion Matching](https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine) supports trajectory prediction, which suits gait changes driven by the steering solve, but parts of it remain Experimental and it says nothing about quadrupeds, so gait animation and quadruped foot placement are prototyping items.

## 14. Open Implementation Questions

- **The risk in pressing on.** The specification says a rider who presses past the tell risks the refusal. The sketch in 6.2 makes the outcome certain once the window closes; the alternative is a chance band near the threshold, so the same press sometimes succeeds.
- **The length of a hire.** A horse "kept past its hire" is stolen, but the specification does not say what ends a hire: a fixed duration, a destination named at the stable, or a fee that runs out. The record's start time supports any of them.
- **Home without a shelter.** A strongly bonded mount whose rider dies may head home to its shelter. If its owner has no shelter that meets its needs, it has nowhere to go; the options are to guard instead, or to stand where it is.

## 15. Design Validation Cases

| Scenario | Expected outcome |
|---|---|
| A rider on 150 ms latency canters a well-bonded horse through forest. | Turns and gait changes answer immediately, with no visible corrections on static terrain. |
| The same rider gallops at a cliff edge and presses on. | The tell plays first; the stop or wheel away follows without a rubber-band snap. |
| A horse is galloped to exhaustion, then a correction is forced. | It drops to a walk and cannot be pushed faster until stamina recovers, identically on client and server. |
| A well-bonded and a weakly bonded wolf are each sent at a shield wall. | The first charges; the second tells and, if pressed, refuses. |
| Lightning strikes beside a weakly bonded mount. | It bolts, rider input is ignored on both machines, and a thrown rider lands in falling mode. |
| A rider dies while a region handoff is being prepared. | The membership version changes, the transfer revalidates, and mount and corpse each end with exactly one owner and the packs intact. |
| A player whistles for a mount penned in a walled stable 200 metres away. | No path is found and the mount stays; with the gate open, it comes. |
| A hired horse is handed in at another stable of its realm, then one is offered at an outlaw town. | The first refunds the deposit less wear; the second is refused. |
| A crew walks the deck of a turning Titan Turtle while one player holds the chains. | Crew movement stays smooth relative to the deck; only the steering player possesses the turtle. |

## 16. Further Reading

- [Understanding Networked Movement in the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine)
- [Comparing Mover and the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/comparing-mover-and-character-movement-component-in-unreal-engine)
- [Mover in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/mover-in-unreal-engine)
- [Mover Features and Concepts](https://dev.epicgames.com/documentation/unreal-engine/mover-features-and-concepts-in-unreal-engine)
- [AController::Possess API reference](https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/AController/Possess)
- [Skeletal Mesh Sockets](https://dev.epicgames.com/documentation/unreal-engine/skeletal-mesh-sockets-in-unreal-engine)
- [Enhanced Input](https://dev.epicgames.com/documentation/unreal-engine/enhanced-input-in-unreal-engine)
- [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine)
- [Physical Materials](https://dev.epicgames.com/documentation/unreal-engine/physical-materials-in-unreal-engine)
- [Water System](https://dev.epicgames.com/documentation/unreal-engine/water-system-in-unreal-engine)
- [Navigation System](https://dev.epicgames.com/documentation/unreal-engine/navigation-system-in-unreal-engine)
- [First Person Rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering)
- [Motion Matching](https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine)
- [Unreal Engine 5.8 Release Notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes)

## Continue Reading

Continue with the [Creature Riding specification](Creature-riding.md) this guide implements, [Movement (Technical)](<Movement (Technical).md>) for the shared walking body a mount is built on, [Flight (Technical)](<Flight (Technical).md>) for the flight modes built on this movement baseline, [Taming and Control (Technical)](<Taming-and-control (Technical).md>) for the bond, needs, and AI that riding calls into, [Building System (Technical)](<Building-system (Technical).md>) for saddle structures, decks, and shelters, and [Server Architecture (Technical)](<Server-architecture (Technical).md>) for the replication, ghosts, and transfer groups it relies on.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
