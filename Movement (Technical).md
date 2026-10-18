# Movement in Unreal Engine 5

A technical design and implementation research guide based on the [Movement specification](Movement.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Server Architecture (Technical)](<Server-architecture (Technical).md>) and [Creature Riding (Technical)](<Creature-riding (Technical).md>). Engine facts were checked against the 5.8 engine headers on 18 October 2026: the movement hooks named below exist on `UCharacterMovementComponent` in 5.8 with the signatures this guide assumes, the custom move-data and move-response containers are registered through `SetNetworkMoveDataContainer` and `SetMoveResponseDataContainer`, and acceleration-driven path following is configured through `NavMovementProperties.bUseAccelerationForPaths`, the 5.5 replacement for the deprecated property of the same name. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every call needs validating against the engine version in use before it becomes production code.

The migration boundary is the one the riding guide sets out. Gaits, stamina, momentum, ground, and load are plain data and plain rules, specified independently of Unreal actors and evaluated by pure functions. Unreal is the integration layer that reads input or AI requests, moves the capsule, and replicates the result, and section 2 of the riding guide records why that layer is the [Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine) (CMC) today and Mover later.

This guide owns the body every walking character shares. [Creature Riding (Technical)](<Creature-riding (Technical).md>) builds the mount on top of it, adding the rider's intent, the steering solve, and the mount's rule state. [Taming and Control (Technical)](<Taming-and-control (Technical).md>) owns the creature AI that chooses a creature's gait. [Flight (Technical)](<Flight (Technical).md>) adds the custom flight modes, which charge the stamina pool defined here.

---

## Table of Contents

1. [One Body Model](#1-one-body-model)
2. [The Locomotion Profile](#2-the-locomotion-profile)
3. [Intent, State, and Conditions](#3-intent-state-and-conditions)
4. [The Locomotion Solve](#4-the-locomotion-solve)
5. [Stamina](#5-stamina)
6. [The Movement Component](#6-the-movement-component)
7. [Players: Prediction and Correction](#7-players-prediction-and-correction)
8. [Creatures: Server-Driven Bodies](#8-creatures-server-driven-bodies)
9. [Ground, Load, and Noise](#9-ground-load-and-noise)
10. [Animation and First-Person Presentation](#10-animation-and-first-person-presentation)
11. [Open Implementation Questions](#11-open-implementation-questions)
12. [Design Validation Cases](#12-design-validation-cases)
13. [Further Reading](#13-further-reading)

---

## 1. One Body Model

The specification gives every walking body the same rules and a profile of its own, and the code mirrors that exactly. There is one movement component class for every walking body, one data asset type that describes a species or a playable body, and one pure solve that turns a request and a state into the limits the movement component moves by. Players, creatures, and mounts differ only in who fills the request and whether the move is predicted.

```text
 Player input ─────► FLocomotionIntent ─┐
 Creature AI brain ─► FLocomotionIntent ─┤
 Rider (riding guide) ► mount rules ─────┤
                                         ▼
      ULocomotionProfile ──► SolveLocomotion(intent, state, conditions, ground)
                                         │
                       FLocomotionStep: max speed, acceleration, braking,
                       stamina rate, noise, resolved gait
      SolveTurn(...) ── facing and line-of-travel turn rate, head offset
                                         │
                                         ▼
      ULocomotionMovementComponent (CMC subclass) ── moves the capsule
           ├── owning client: predicted through saved moves (section 7)
           ├── server: authoritative, sends corrections with the state
           └── AI creature: server only, no prediction (section 8)
                                         │
      AdvanceLocomotionState(...) ── stamina, winded, burst build-up
```

The class layout follows from it. `ULocomotionMovementComponent` derives from `UCharacterMovementComponent` and is the only class that calls into the CMC. The player character, every creature character, and every mount use it; the riding guide's `UMountMovementComponent` derives from it and adds the steering solve and the mount's rule state, so the gaits, stamina, ground, and noise in section 5 of the riding guide are this guide's model and not a second copy. A creature that is not a walking character, such as a colossal swimmer or a creature carried by the flight modes, is outside this guide.

## 2. The Locomotion Profile

A profile is a data asset that describes one kind of body. A playable body has one profile per race; each creature species has one; a mount uses its species profile. Gaits are an ordered list from slowest to fastest, and each row names its role from the specification, so rules that remove roles never need to know what the gaits are called.

```cpp
UENUM()
enum class EGaitRole : uint8 { Recover, Travel, Burst };

USTRUCT()
struct FGaitRow
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FName     Name;                     // Walk, Jog, Sprint / Walk, Trot, Canter, Gallop
    UPROPERTY(EditAnywhere) EGaitRole Role = EGaitRole::Travel;
    UPROPERTY(EditAnywhere) float SpeedCmS = 0.f;
    UPROPERTY(EditAnywhere) float AccelerationCmS2 = 0.f;
    UPROPERTY(EditAnywhere) float BrakingCmS2 = 0.f;
    UPROPERTY(EditAnywhere) float StaminaPerSecond = 0.f;       // negative recovers
    UPROPERTY(EditAnywhere) float FatiguePerSecond = 0.f;       // long-day weariness, read by the riding layer (mounts only)
    UPROPERTY(EditAnywhere) float NoiseLoudness = 0.f;          // AI hearing, section 9.3
    UPROPERTY(EditAnywhere) float StumbleRiskScale = 0.f;       // multiplied by ground roughness
};

USTRUCT()
struct FLocomotionMomentum
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float BurstBuildSeconds = 3.f;      // time to reach a burst gait's full speed
    UPROPERTY(EditAnywhere) float BurstInitialFraction = 0.85f; // share of burst speed reached at once
    UPROPERTY(EditAnywhere) float UphillSpeedLossPer10Deg = 0.1f;
    UPROPERTY(EditAnywhere) float UphillStaminaCostPer10Deg = 0.25f;
    UPROPERTY(EditAnywhere) float DownhillSpeedGainMax = 0.05f;
};

USTRUCT()
struct FLocomotionTurning
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float TurnInPlaceRateDegS = 360.f;   // 0: cannot turn in place, must move to turn
    UPROPERTY(EditAnywhere) float PivotBlendSpeedCmS = 150.f;    // below this the in-place pivot blends into the moving turn
    UPROPERTY(EditAnywhere) float MaxTurnRateDegS = 360.f;       // the fastest the body ever turns while moving
    UPROPERTY(EditAnywhere) float BaseTurnRadiusCm = 50.f;       // turning radius at an easy pace
    UPROPERTY(EditAnywhere) float SpeedRadiusFactor = 9.f;       // how strongly speed widens the radius; 0 = not at all
    UPROPERTY(EditAnywhere) TObjectPtr<UCurveFloat> SpeedRadiusCurve; // optional: radius multiplier by speed fraction, replaces the factor
    UPROPERTY(EditAnywhere) float TurnBrakingFraction = 1.f;     // share of braking spent to tighten a turn; low for chargers
    UPROPERTY(EditAnywhere) float SideSpeedFraction = 0.66f;     // of the travel gait; 0 for bodies that cannot sidestep
    UPROPERTY(EditAnywhere) float BackSpeedFraction = 0.5f;      // of the travel gait; 0 for bodies that cannot back up
    UPROPERTY(EditAnywhere) float BurstConeDeg = 45.f;           // burst gaits only within this angle of the facing
    UPROPERTY(EditAnywhere) float HeadYawLimitDeg = 80.f;        // the head's reach either side of the facing; 0 = fixed head
    UPROPERTY(EditAnywhere) float HeadTurnRateDegS = 600.f;      // creatures and animation; a player's own view moves instantly
    UPROPERTY(EditAnywhere) float MaxViewLeadDeg = 180.f;        // how far a player's requested view may run ahead of the facing
};

USTRUCT()
struct FLocomotionStaminaRules
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float PoolBase = 100.f;
    UPROPERTY(EditAnywhere) float RecoveryDelaySeconds = 1.5f;
    UPROPERTY(EditAnywhere) float WindedRecoverFraction = 0.25f;
    UPROPERTY(EditAnywhere) float JumpCost = 5.f;
};

UCLASS()
class ULocomotionProfile : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) TArray<FGaitRow> Gaits;             // ordered slowest to fastest
    UPROPERTY(EditAnywhere) FGaitRow Crouch;                    // Role = Recover; ignored by bodies that cannot crouch
    UPROPERTY(EditAnywhere) uint8 DefaultGait = 1;              // the jog for a person
    UPROPERTY(EditAnywhere) FLocomotionMomentum Momentum;
    UPROPERTY(EditAnywhere) FLocomotionTurning Turning;
    UPROPERTY(EditAnywhere) FLocomotionStaminaRules Stamina;
    UPROPERTY(EditAnywhere) float SafeFallCm = 400.f;           // falls below this only cost speed
    UPROPERTY(EditAnywhere) float LethalFallCm = 1200.f;
};
```

The player profile carries the target values from the specification's table: walk 150, jog 350, and sprint 650 centimetres a second, a pool that the sprint empties in fifteen seconds and the walk refills in twenty, and the turning defaults shown above, which give a person a half-second about-face, a radius of about three quarters of a metre at a walk, and about five metres at full sprint. A heavy charger sets a large `SpeedRadiusFactor` and a low `TurnBrakingFraction`; a long-bodied creature sets `TurnInPlaceRateDegS` to zero; every four-legged profile sets `SideSpeedFraction` to zero. A wolf profile is three rows, walk, trot, and sprint, with a faster sprint and a shallower pool; a horse profile is the riding guide's four, with the halt as a zero-speed recovering row at the front so the riding guide's `EGait` indexes the rows directly. Riding-only fields, such as which gait a mount grazes at, stay on the riding guide's `UMountDefinition`.

## 3. Intent, State, and Conditions

Three small records feed the solve. They are kept apart because each comes from a different source and travels differently over the network.

The intent is what the body is asked to do. Direction is not part of it: for a player it is the CMC's own acceleration input, already sent in every saved move, for a creature it is the path-following request, and for a mount it is the riding guide's steering result. The intent carries only what the CMC does not already know.

```cpp
USTRUCT()
struct FLocomotionIntent
{
    GENERATED_BODY()

    uint8 RequestedGait = 1;     // index into ULocomotionProfile::Gaits
    bool  bCrouch = false;       // drives the CMC's own crouch, which resizes the capsule
};
```

The state is what the body carries from one move to the next. Everything in it shapes the next move's speed, so for a player it is predicted state, saved and replayed with each move and returned by the server with every correction.

```cpp
USTRUCT()
struct FLocomotionState
{
    GENERATED_BODY()

    float Stamina = 100.f;
    float RecoveryDelay = 0.f;   // seconds until recovery resumes
    float BurstBuild = 0.f;      // seconds of unbroken burst running
    uint8 ActiveGait = 1;        // the gait the solve actually granted
    bool  bWinded = false;
};
```

The conditions are what the server decides about the body from outside the move: the load fraction from the inventory, the stat modifiers from Speed, Handling, and Stamina, the recovery and ceiling dials that hunger and fatigue turn, and any extra role cap another system imposes, such as a mount's injury. They change rarely and are never predicted. They replicate to the owning client as one struct stamped with the server move time at which they took effect, the same pattern section 12.1 of the riding guide uses for mount rule state, so a replayed move reads the conditions that were in force when it was first made.

```cpp
USTRUCT()
struct FLocomotionConditions
{
    GENERATED_BODY()

    float     LoadFraction = 0.f;         // carried mass / capacity
    float     AccelerationScale = 1.f;    // Handling
    float     TurnRateScale = 1.f;        // Handling; scales the in-place and moving turn rates
    float     BurstCostScale = 1.f;       // Handling
    float     TopSpeedScale = 1.f;        // Speed, with diminishing returns toward about 1.2
    float     PoolScale = 1.f;            // Stamina stat
    float     RecoveryScale = 1.f;        // Stamina stat, hunger, fatigue
    float     CeilingFraction = 1.f;      // fatigue on mounts
    EGaitRole RoleCap = EGaitRole::Burst; // external caps: injury, the riding layer
    float     EffectiveFromServerTime = 0.f;
};
```

## 4. The Locomotion Solve

The solve is a pure function of the intent, the state, the conditions, the ground under the body, and the profile. It runs inside every move on the client and on the server, so it may read nothing else, and because it touches no actor it can be tested directly (section 11).

```cpp
FLocomotionStep SolveLocomotion(const FLocomotionIntent& Intent, const FLocomotionState& State,
                                const FLocomotionConditions& Cond, const FLocomotionGround& Ground,
                                const ULocomotionProfile& Profile, const UGroundTable& GroundTable)
{
    const FGroundRow& G = GroundTable.Row(Ground.Surface);

    // Every cap acts on roles: winded, load tier, ground, and external caps.
    EGaitRole Cap = Cond.RoleCap;
    Cap = FMath::Min(Cap, State.bWinded ? EGaitRole::Recover : EGaitRole::Burst);
    Cap = FMath::Min(Cap, LoadRoleCap(Cond.LoadFraction));      // section 9.2
    Cap = FMath::Min(Cap, G.RoleCap);                           // deep snow and bog: no burst

    const bool  bCrouched = Intent.bCrouch && Profile.Crouch.SpeedCmS > 0.f;
    const uint8 GaitIndex = bCrouched ? INDEX_CROUCH : HighestAllowedAtOrBelow(Profile, Intent.RequestedGait, Cap);
    const FGaitRow& Row   = bCrouched ? Profile.Crouch : Profile.Gaits[GaitIndex];

    float Speed = Row.SpeedCmS * Cond.TopSpeedScale * G.SpeedFactor * LoadSpeedFactor(Cond.LoadFraction);
    if (Row.Role == EGaitRole::Burst)                            // the sprint builds
    {
        const float Build = FMath::Clamp(State.BurstBuild / Profile.Momentum.BurstBuildSeconds, 0.f, 1.f);
        Speed *= FMath::Lerp(Profile.Momentum.BurstInitialFraction, 1.f, Build);
    }
    Speed *= SlopeSpeedFactor(Ground.SlopeAlongTravelDeg, Profile.Momentum);

    FLocomotionStep Step;
    Step.GaitIndex       = GaitIndex;
    Step.MaxSpeedCmS     = Speed;
    Step.AccelerationCmS2 = Row.AccelerationCmS2 * Cond.AccelerationScale * LoadHandlingFactor(Cond.LoadFraction);
    Step.BrakingCmS2     = Row.BrakingCmS2 * LoadHandlingFactor(Cond.LoadFraction);
    Step.StaminaPerSecond = StaminaRate(Row, Cond, Ground, Profile);   // section 5
    Step.Noise           = Row.NoiseLoudness * G.NoiseFactor;
    Step.StumbleRisk     = Row.StumbleRiskScale * G.Roughness;
    return Step;
}
```

Starting and stopping need no custom code. The step's acceleration and braking reach the CMC through `GetMaxAcceleration` and `GetMaxBrakingDeceleration`, and its speed through `GetMaxSpeed`, so the engine's own walking physics produces the ramp and the stopping distance. The burst build-up is a state variable rather than a physics effect: `BurstBuild` grows while the body holds a burst gait above most of its speed with little turning, and drops to zero the moment either breaks.

### 4.1 Turning

Turning is the part of momentum the CMC has no setting for. Its walking physics accelerates the velocity toward the input direction at whatever rate the acceleration allows, and its rotation options either snap the actor to the controller's yaw or rotate it toward the movement at one fixed rate, so a sprinting body would turn on the spot. The component therefore owns rotation itself, with `bUseControllerRotationYaw`, `bOrientRotationToMovement`, and `bUseControllerDesiredRotation` all off, and one pure function gives the rate at which a body's facing, and its line of travel with it, may turn at the current speed.

```cpp
float TurnRadiusCm(const FLocomotionTurning& T, float SpeedCmS, float TopSpeedCmS)
{
    const float Fraction = FMath::Clamp(SpeedCmS / TopSpeedCmS, 0.f, 1.f);
    const float Widen = T.SpeedRadiusCurve
        ? T.SpeedRadiusCurve->GetFloatValue(Fraction)               // a hand-shaped curve for unusual bodies
        : 1.f + T.SpeedRadiusFactor * Fraction * Fraction;          // grip runs out with the square of speed
    return T.BaseTurnRadiusCm * Widen;
}

float TurnRateNowDegS(const FLocomotionTurning& T, const FLocomotionConditions& Cond,
                      float SpeedCmS, float TopSpeedCmS)
{
    const float Moving = FMath::RadiansToDegrees(SpeedCmS / TurnRadiusCm(T, SpeedCmS, TopSpeedCmS));
    const float Pivot  = T.TurnInPlaceRateDegS * FMath::Max(0.f, 1.f - SpeedCmS / T.PivotBlendSpeedCmS);
    return FMath::Min(FMath::Max(Moving, Pivot), T.MaxTurnRateDegS) * Cond.TurnRateScale;
}
```

`TopSpeedCmS` is the profile's fastest gait, so `SpeedRadiusFactor` reads the same way on every body: zero means speed never widens the turn, and nine means the radius at full speed is ten times the radius at an easy pace. A body with `TurnInPlaceRateDegS` at zero has a turn rate of zero when it stands still, and turns only as fast as its speed and radius allow once it moves, so asking it to face behind makes it walk the arc.

The `PhysicsRotation` override turns the facing toward its target by at most that rate times the move's delta time. The `CalcVelocity` override applies the same bound to the horizontal velocity's heading, so the line of travel and the facing turn on the same circle. When the input asks for a sharper turn than the bound allows, the body brakes at `TurnBrakingFraction` of its braking deceleration for as long as the shortfall lasts; slowing shrinks the radius, which raises the rate, and the turn tightens. A person brakes fully and cuts the corner at a third less speed; a charger with a fraction near zero keeps its speed, overshoots, and comes round wide.

Speed also depends on direction relative to the facing. The step's top speed is multiplied by a direction factor: one inside `BurstConeDeg` of the facing, falling to `SideSpeedFraction` of the travel gait at ninety degrees and `BackSpeedFraction` behind, and a burst gait is granted only inside the cone. With both fractions at zero, the acceleration is projected onto the facing, and a body that is asked to go sideways first turns and then goes.

### 4.2 Head, Body, and View

Every body has a facing, the actor's yaw, and a head offset from it, limited to `HeadYawLimitDeg` either side. What sets the facing's target differs by who drives the body.

For a player, the control rotation is the requested view. While the body stands still, the facing's target is the nearest yaw that keeps the requested view within the head's reach, so the body turns only when the view is pushed past the limit and stops as soon as it is back inside. While the body moves, the target is the requested view's yaw, so the body turns toward where the player looks at the rate of section 4.1, and the movement input, read in the view's frame, is weighed against the facing by the direction factor; a player who looks sixty degrees to the side and presses forward therefore starts at the reduced off-facing speed and gains pace as the body comes round. The control rotation is already sent with every saved move, so the server computes the same facing from the same inputs and the turn is predicted like the rest of the move.

The camera shows the view the body can actually give: the facing plus the head offset, clamped to the head's reach, with the control pitch. The player's camera manager applies the clamp in `UpdateViewTarget`, so mouse movement within the head's reach is instant and movement past it arrives as fast as the body turns. Its `ProcessViewRotation` override keeps the requested view no more than `MaxViewLeadDeg` ahead of the facing, so excess input queues one turn and never winds the body round twice.

For a creature, the brain sets a look target and a move target. The head turns toward the look target at `HeadTurnRateDegS` within its reach, the facing turns toward the movement under section 4.1, and the body turns to bring the look target back within reach when it falls outside. The creature's `GetActorEyesViewPoint` override returns the head's direction rather than the facing, so the sight sense of its [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine) looks where its head looks.

## 5. Stamina

### 5.1 One Pool, Advanced in the Move

The pool is advanced once per move, after the movement, by a second pure function:

```cpp
void AdvanceLocomotionState(FLocomotionState& State, const FLocomotionStep& Step, const FLocomotionConditions& Cond,
                            const ULocomotionProfile& Profile, float DeltaSeconds, float SpentThisMove, bool bMovingAtPace)
{
    const float Pool = Profile.Stamina.PoolBase * Cond.PoolScale * Cond.CeilingFraction;
    float Rate = Step.StaminaPerSecond;                     // positive drains
    if (Rate > 0.f && !bMovingAtPace)
    {
        Rate = 0.f;                                         // holding sprint against a wall costs nothing
    }
    if (SpentThisMove > 0.f || Rate > 0.f)
    {
        State.RecoveryDelay = Profile.Stamina.RecoveryDelaySeconds;
    }
    else if (State.RecoveryDelay > 0.f)
    {
        State.RecoveryDelay = FMath::Max(0.f, State.RecoveryDelay - DeltaSeconds);
        Rate = 0.f;
    }
    else
    {
        Rate *= Cond.RecoveryScale;                         // hunger, fatigue, the Stamina stat
    }

    State.Stamina = FMath::Clamp(State.Stamina - Rate * DeltaSeconds - SpentThisMove, 0.f, Pool);
    if (State.Stamina <= 0.f)
    {
        State.bWinded = true;
    }
    else if (State.bWinded && State.Stamina >= Pool * Profile.Stamina.WindedRecoverFraction)
    {
        State.bWinded = false;
    }
}
```

### 5.2 Spending From Outside the Move

A sword swing, a shield block, a jump, and a climbing hold spend from the same pool, and for a player the pool is predicted. A spend made outside the move would put the client and the server out of step and cause a correction, so every spend goes through the move. Actions such as strikes run inside the move through the action slot of [Melee Combat (Technical)](<Melee-combat (Technical).md#41-the-action-slot>) and spend directly as part of it. Costs decided outside the move, such as the energy a block absorbs, use the request path: systems call `ULocomotionMovementComponent::RequestStaminaSpend(Amount, ReasonTag)`. On the owning client the amount is added to the pending saved move and travels in its move data (section 7); the server applies it while performing that same move, after checking that the reason is one the server also accepted, such as an attack its combat code validated. A jump is the same spend made by the component itself when `CanAttemptJump` succeeds, and `CanAttemptJump` refuses while winded or without the stamina to pay. On a server-driven creature the spend simply applies to the next move.

### 5.3 Survival and Riding Read the Pool

Survival never owns a second pool. It charges food and water for the work each move reports, the gait's effort and the stamina actually refilled, and writes `RecoveryScale` from how much fuel is left: full rate while fed and watered, slower when hungry or thirsty, and only a trickle when either store is empty, as [Survival](Survival.md#the-bodys-fuel) describes. Body heat outside the comfort band lowers `RecoveryScale` and, in heat, `CeilingFraction`. A character's session fatigue touches the pool only in its last stage, when it lowers `CeilingFraction` and `RecoveryScale` together. For a mount, the riding layer writes `CeilingFraction` from the mount's long-day weariness, built from each gait's `FatiguePerSecond`, which is how a mount ridden all day starts the next morning short of its best. The HUD's stamina indicator, the [UI and HUD](UI-and-HUD.md) element that appears only while it presses, reads the locally predicted value for the possessed body, whether that is the player or the mount under them.

## 6. The Movement Component

`ULocomotionMovementComponent` holds the profile, the ground table, the current intent, state, and conditions, and the step computed for the current move. Its overrides are the whole of its contact with the engine.

| Override | What it does |
|---|---|
| `GetMaxSpeed`, `GetMaxAcceleration`, `GetMaxBrakingDeceleration` | Return the current step's values while walking; defer to the base class in other modes. |
| `PhysicsRotation` | Turns the facing toward its target at the rate of section 4.1, and updates the head offset of section 4.2. |
| `CalcVelocity` | Bounds the velocity's heading change by the same rate, applies turn braking and the direction factor, then lets the base class integrate acceleration and friction. |
| `PhysWalking` | Reads the floor result into `FLocomotionGround`, solves the step, then runs the base walking physics. |
| `OnMovementUpdated` | Advances the state with the move's spends and decides whether the body was moving at pace. |
| `CanAttemptJump` | Refuses while winded, without the jump cost, or when the load tier forbids jumping. |
| `ProcessLanded` | Converts the fall height into landing recovery on every machine and a fall-damage request on the server. |
| Move start | Runs the body's action slot sub-step of [Melee Combat (Technical)](<Melee-combat (Technical).md#4-running-inside-the-move>) before the locomotion solve, so an action's limits on turning and gait apply in the same move. |
| `GetPredictionData_Client` | Supplies the client prediction data that allocates the custom saved move of section 7. |

Crouching uses the CMC's own crouch, which resizes the capsule and replicates the crouched flag; the component only replaces its speed with the profile's crouch row. Fall damage is applied by the server alone through the vitals system, so the client predicts the stumble and never a wound that did not happen. Climbing, swimming, and the flight modes are later movement modes on the same component, and each spends stamina through the pool of section 5 inside its own physics.

### 6.1 Movement Modes

Vaulting, mantling, climbing, and swimming are movement modes of the same component, so they share its prediction, its stamina pool, and its conditions.

Swimming uses the CMC's own swimming mode inside water volumes, with the component's `PhysSwimming` override applying the specification's speeds and stamina drain. Whether the body floats is set each move through the CMC's `Buoyancy` from the load fraction: full buoyancy below a quarter of capacity, falling through the middle band, and below neutral beyond half, so an overloaded swimmer sinks under the same physics that floats a light one.

Climbing is a custom mode in `PhysCustom`. A short forward trace each move finds the surface in reach, and the surface's physical material names a row in the ground table of section 9.1 that now also carries a climb rating: none for smooth stone, ice, and every building piece, and a difficulty for rock, crags, and trees. Climbing gear changes what a surface accepts: a fixed rope, a ladder, or a grapnel line is an actor with its own climbable surface, and ice picks in the hands let ice count as hard rock. The climb mode moves the capsule across the surface plane at a speed and stamina cost from the profile, scaled by the rating and the load, and ends on a ledge, at the top, or in a fall when stamina runs out.

Vaults and mantles are short, fixed traversals. When a jump begins, capsule sweeps ahead of the body measure the obstacle's height and the space on top of it; a vault or a mantle is chosen from the height, refused when the hands are full or the load is over the limit, and then played as a custom sub-mode that moves the capsule along a path fitted to the obstacle over a duration from the height. The jump input, the measured obstacle, and the progress through the traversal all live in the saved move, so a mantle is predicted and replayed like any other movement.

## 7. Players: Prediction and Correction

The owning client predicts its own body through the CMC's saved moves, following Epic's [networked movement guide](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine). Three pieces carry the shared model through it.

The saved move, a subclass of `FSavedMove_Character`, records the intent and the pending stamina spend in `SetMoveFor` and restores them in `PrepMoveFor`, so a replayed move asks for the same gait and spends the same stamina it did the first time. `CanCombineWith` refuses to merge two moves with different gaits or with a spend in either, so neither a gait change nor a spend is lost in a combined move.

The move data, a subclass of `FCharacterNetworkMoveData` registered with `SetNetworkMoveDataContainer`, sends the requested gait and the quantised pending spend to the server with each move through its `ClientFillNetworkMoveData` and `Serialize` overrides. The crouch flag already travels in the CMC's own compressed flags.

The move response, a subclass of `FCharacterMoveResponseDataContainer` registered with `SetMoveResponseDataContainer`, returns the server's `FLocomotionState` with every correction through `ServerFillResponseData`, and the client writes it back before replaying its pending moves. Stamina is therefore corrected along with position, and a client that drifted from the server, through a dropped spend or a stale condition, is pulled back in a single correction rather than diverging.

The conditions are the only input not carried in the move. They change on inventory, stat, and survival events, a few times a minute at most, and the time stamp of section 3 confines any misprediction to the moves between the server's change and its arrival.

## 8. Creatures: Server-Driven Bodies

An AI-controlled creature has no owning client, so its movement runs only on the server and nothing about it is predicted. Its brain writes the intent, choosing a gait from its own judgement, and reads the state back, so a wolf can see that it is winded and drop to a trot without a separate stamina model of its own. Path following reaches the body through the CMC's `RequestPathMove` and `RequestDirectMove`. With `NavMovementProperties.bUseAccelerationForPaths` set, the path request becomes acceleration rather than a direct velocity, so the creature passes through the same acceleration, braking, and turn model as a player and a charging creature genuinely cannot turn on a coin. A creature that needs a sharp turn its momentum will not give, such as a Minotaur that has overshot its target, has to slow and come round, which is the counter window [Movement](Movement.md#creatures-and-mounts) promises.

Other clients see creatures and other players as simulated proxies with the CMC's smoothing, which already carries the facing as the actor's rotation. A small view struct replicates with the actor, skipping the owner: the granted gait, a stamina band of four steps, the winded flag, and the head's yaw offset from the facing. The head's pitch needs nothing new, because the engine already replicates `APawn::RemoteViewPitch` to simulated proxies. Onlookers therefore see the body's facing, its turn, and where its head is looking exactly as its own player does, which is what makes a glance over the shoulder readable.

```cpp
USTRUCT()
struct FLocomotionView
{
    GENERATED_BODY()

    uint8 Gait = 0;
    uint8 StaminaBand = 3;    // 0 empty .. 3 full
    int8  HeadYaw = 0;        // quantised offset from the facing, within the head's reach
    bool  bWinded = false;
};
```

A hunting creature's brain reads that view on other bodies, which is how predators press winded prey. Exhaustion is not hidden state: the server holds every body's `FLocomotionState`, and the brain reads the winded flag and the stamina band of any body its [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine) currently senses, through a read-only query on that body's movement component. The query makes no distinction between players, wild prey, mounts, and other creatures, so the same rule that sends a pack at a player who has sprinted empty sends it at the deer that falls behind its herd. Perception is the gate: a body the creature neither sees nor hears returns nothing, so a player who recovers out of sight behind cover is not marked. How the brain weighs a winded target against everything else it wants is owned by the creature AI in [Taming and Control (Technical)](<Taming-and-control (Technical).md>); this guide supplies only the signal.

Near a region edge the same struct rides in the ghost state flags of the [ghost entity protocol](<Server-architecture (Technical).md#61-ghost-entity-protocol>), extending what the riding guide already adds for mounts, so a body seen across a boundary still reads correctly.

## 9. Ground, Load, and Noise

### 9.1 Ground

The CMC's floor result says what the body stands on. Each surface carries a physical material whose [surface type](https://dev.epicgames.com/documentation/unreal-engine/physical-materials-user-guide-for-unreal-engine) maps, through one project-wide ground table, to a speed factor, a roughness for stumble risk, a noise factor, and a role cap. The table is the one section 5.3 of the riding guide reads; its rows follow the specification, with roads and firm grass at full speed, forest floor and scrub slightly slower, sand, mud, and shallow snow about a fifth slower, and deep snow and bog nearly half as fast with no burst gait. `FLocomotionGround` also carries the slope along the line of travel, measured from the floor normal and the horizontal velocity, signed so that the solve can tell a climb from a descent.

Stumbles are server-decided. While a body runs above its comfortable pace on rough ground, the server rolls each second from the step's stumble risk and, on a hit, sends a stagger that costs momentum; for a mount the riding guide turns the same roll into a thrown rider or an injured leg. A stumble is never predicted, so a player never sees a fall that did not happen.

### 9.2 Load

The inventory reports the carried mass as `LoadFraction` in the conditions. The solve maps it through the [Inventory](Inventory.md#weight-and-strength-mechanics) tiers as the specification sets them: below three quarters of capacity nothing changes; up to full capacity speed falls by a few per cent and `LoadHandlingFactor` lengthens starts, stops, and turns; up to a quarter over capacity the role cap drops to travel and gait costs rise by half; beyond that the cap drops to recovery and jumping is refused; at half again the capacity the speed is zero. For a mount the load is the riding guide's carried mass against the mount's strength, read through the same field.

### 9.3 Noise

The server reports each body's gait through the AI Hearing sense with [`UAISense_Hearing::ReportNoiseEvent`](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine), at the body's stride rate, with the step's noise multiplied by the ground's noise factor and by an equipment noise value the inventory supplies. Heavy gaits also post to the server-side tremor register the riding guide defines for burrowing listeners. A winded body reports its breathing as a noise of its own, quiet and tagged `Winded` through the event's tag parameter, at a fixed interval until it recovers, so a predator that hears it without seeing it still learns that the body is spent. Footstep and breathing sounds on clients are driven by animation, not by these events, so what a player hears and what a creature hears come from the same gait without one waiting on the other.

## 10. Animation and First-Person Presentation

Every body's animation reads the same values from its movement component: ground speed, the granted gait and its role, the movement direction relative to the facing for sidesteps and backpedalling, the facing's yaw rate for turn-in-place steps and for leaning into turns, the head's yaw and pitch for the head and spine, the slope, the stamina band, and landing. A two-legged and a four-legged body need different animation blueprints, but the inputs are identical, which is what lets the riding guide's quadruped locomotion and a creature's own locomotion share code. Gait changes driven by the turn model and the burst build-up are predictable from the trajectory, which suits [Motion Matching](https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine) as the riding guide also notes.

The local player sees their own full body from the camera at its head, the same skeleton and animation other players see rather than a separate pair of camera-only arms, with Epic's [First Person Rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering) keeping held items and the near arms from clipping into the world. The first-person presentation reads the same values for the local player: a head bob scaled by gait, a small field-of-view widening that follows the burst build-up, a sway and rising breath as the pool empties, and a landing dip that grows with fall height. All of it lives in the camera and audio layers, never in the movement, so the comfort options of [Accessibility](Accessibility.md) can soften or remove it without changing how the body moves.

## 11. Open Implementation Questions

How wide the sprinting radius and how slow the in-place pivot can be before first-person movement feels slippery or sluggish is the first thing the prototype must answer, since the head moves instantly within its reach and the body does not; the specification's figures of a half-second about-face and a five-metre sprinting circle are the starting point, not settled values. Whether the requested view should run ahead of the facing by a full half-turn, or by less, is the second. Path following assumes a body can take the corners of its navigation path, so a creature with a wide radius or no turn in place may need its path smoothed to its radius, or a navigation agent sized for it, before it stops scraping round corners. Acceleration-driven path following can overshoot tight navigation corridors at a burst gait, and creature brains may need to request a slower gait before sharp corners rather than rely on the turn model alone. The stamina value in a move response is a full float in this sketch and can probably be quantised to a byte without visible error. The solve and the state advance are pure functions and are tested directly with Unreal's automation framework, and the networked behaviour is tested with the editor's network emulation at the 150 millisecond latency the riding guide's validation cases use.

## 12. Design Validation Cases

| Case | Expected result |
|---|---|
| A player sprints from full stamina on level road with no load. | Most of the sprint speed at once, full speed after about three seconds, empty after about fifteen, then held to a walk until a quarter of the pool returns. |
| A player on 150 ms latency sprints, swings a weapon, and jumps in quick succession. | No visible corrections; client and server agree on stamina after every move. |
| A player sprinting at full speed cuts a right angle. | The line of travel bends over a short arc, about a third of the speed is lost, and the burst build-up starts again. |
| A standing player flicks the mouse to look directly behind. | The view turns instantly to the head's limit, then follows the body's pivot and arrives about a quarter of a second later; another client sees the head turn first and the body step round. |
| A player looks sixty degrees to the side and presses forward. | They step off at the reduced off-facing speed while the body turns, and reach full pace once it faces the view. |
| A sprinting player glances back at a pursuer. | The view turns within the head's reach without changing the line of travel; other clients see the head turn. |
| A creature with no turn in place is asked to face a target behind it. | It walks a forward arc of its base radius rather than pivoting. |
| A player stands behind a grazing animal, beyond the reach of its head. | The animal does not see them until it turns its head or body toward them. |
| A player over their carrying limit holds sprint. | They jog at a reduced pace and cannot sprint; dropping below the limit restores the sprint on the next move. |
| A wolf chases a jogging player who never sprints. | The wolf closes at a trot, sprints when it commits, tires, and drops back to a trot to recover. |
| A wolf pack circles a player who then sprints until winded; a second player recovers out of sight behind a rock. | The pack closes on the winded player in the open; the hidden player is not marked until the pack perceives them. |
| A wolf pack chases a herd of deer. | The first deer to run itself winded becomes the pack's target, by the same query a winded player triggers. |
| A Minotaur charges a player who sidesteps late. | The charge passes the player; the Minotaur slows and comes round rather than turning on the spot. |
| A horse is galloped to exhaustion, then a correction is forced. | It drops to a walk and cannot be pushed faster until stamina recovers, identically on client and server. |
| A player sprints down a scree slope. | The server rolls stumbles; a stumble costs momentum and reaches the client as an event, never as a predicted fall. |

## 13. Further Reading

- [Understanding Networked Movement in the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine)
- [Comparing Mover and the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/comparing-mover-and-character-movement-component-in-unreal-engine)
- [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine)
- [Physical Materials User Guide](https://dev.epicgames.com/documentation/unreal-engine/physical-materials-user-guide-for-unreal-engine)
- [Enhanced Input](https://dev.epicgames.com/documentation/unreal-engine/enhanced-input-in-unreal-engine)
- [Motion Matching](https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine)

## Continue Reading

Continue with the [Movement specification](Movement.md) this guide implements, [Creature Riding (Technical)](<Creature-riding (Technical).md>) for the mount built on this body, [Taming and Control (Technical)](<Taming-and-control (Technical).md>) for the creature AI that chooses a creature's gait, and [Server Architecture (Technical)](<Server-architecture (Technical).md>) for the replication and ghosts it relies on.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
