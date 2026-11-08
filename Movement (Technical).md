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
    UPROPERTY(EditAnywhere) float NoiseRangeCm = 0.f;           // distance at which the gait is heard on neutral ground, section 9.3
    UPROPERTY(EditAnywhere) float StumbleRiskScale = 0.f;       // chance a second on roughness 1 level ground; section 9.1 scales it
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
    UPROPERTY(EditAnywhere) float BurstStartConeDeg = 45.f;      // a burst gait can be started only within this angle of the facing
    UPROPERTY(EditAnywhere) float BurstHoldConeDeg = 110.f;      // a burst gait already running holds within this angle, so a right-angle cut keeps the sprint
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
    UPROPERTY(EditAnywhere) FLocomotionTraversal Traversal;     // vault, mantle, and climb-over numbers, section 6.1
    UPROPERTY(EditAnywhere) float SafeFallCm = 400.f;           // falls below this only cost speed
    UPROPERTY(EditAnywhere) float LethalFallCm = 1300.f;
    UPROPERTY(EditAnywhere) float FallCrushJoulesPerMeter = 25.f; // crush to each leg per metre beyond SafeFallCm
};
```

The player profile carries the target values from the specification's table: walk 150, jog 350, and sprint 650 centimetres a second, a pool that the sprint empties in fifteen seconds and the walk refills in twenty, and the turning defaults shown above, which give a person a half-second about-face, a radius of about three quarters of a metre at a walk, and about five metres at full sprint. A heavy charger sets a large `SpeedRadiusFactor` and a low `TurnBrakingFraction`; a long-bodied creature sets `TurnInPlaceRateDegS` to zero; every four-legged profile sets `SideSpeedFraction` to zero. A wolf profile is four rows, walk, labouring trot, trot, and sprint, with a faster sprint and a shallower pool. The labouring trot is a `Recover` row at the trot's speed with a recovery rate well below the walk's; a winded wolf is capped to the recovering rows, and which of the two it uses is the brain's request, the walk when it is out of danger and the labouring trot while it is in danger, so the specification's rule that a winded body is held to its recovering gaits holds for the wolf without an exception (section 8). A horse profile is the riding guide's four, with the halt as a zero-speed recovering row at the front so the riding guide's `EGait` indexes the rows directly. Riding-only fields, such as which gait a mount grazes at, stay on the riding guide's `UMountDefinition`.

The specification gives no acceleration or braking figures, only that a walk or a jog reaches its pace in half a second and stops within a stride and that a sprint stops in roughly two and a half metres, so the player profile derives its rows from those sentences. They are starting values, computed from the wording and not yet tuned in play; whether a jog that stops in under a metre feels precise or abrupt belongs with the sprinting radius and the about-face in the first hand-played session.

| Gait | Speed (cm/s) | Acceleration (cm/s²) | Braking (cm/s²) | Noise range (cm) | Result |
|---|---|---|---|---|---|
| Crouch | 100 | 300 | 875 | 200 | Takes the walk's acceleration |
| Walk | 150 | 300 | 875 | 500 | Full pace in 0,5 s |
| Jog | 350 | 700 | 875 | 1500 | Full pace in 0,5 s, stops in 0,70 m |
| Sprint | 650 | 1100 | 845 | 3500 | Full pace in 0,59 s, stops in 2,5 m |

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

The conditions are what the server decides about the body from outside the move: the load fraction from the inventory, the stat modifiers from Speed, Handling, and Stamina, the recovery and ceiling dials that hunger and fatigue turn, and any extra role cap another system imposes, such as a mount's injury or the injury caps of a person's [wounds](Health-and-wounds.md#wounds). They change rarely and are never predicted. They replicate to the owning client as one struct stamped with the server move time at which they took effect, the same pattern section 12.1 of the riding guide uses for mount rule state, so a replayed move reads the conditions that were in force when it was first made.

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

Conditions that change in combat cost the owning client a burst of corrections. An injury cap, a serious leg cut that takes the sprint or a fracture that leaves only the walk, is written by the server while the body moves, and in networked tests at 150 milliseconds each such change cost two or three corrections and none while the body stood still. A fight that wounds a running player therefore snaps them back a little at each wound. Any condition that changes in combat, injury caps among them, is carried in the move instead of waiting on the replicated struct, as the knockdown is, so the client applies it at the same move as the server and the burst does not occur.

## 4. The Locomotion Solve

The solve is a pure function of the intent, the state, the conditions, the ground under the body, and the profile. It runs inside every move on the client and on the server, so it may read nothing else, and because it touches no actor it can be tested directly (section 11).

```cpp
FLocomotionStep SolveLocomotion(const FLocomotionIntent& Intent, const FLocomotionState& State,
                                const FLocomotionConditions& Cond, const FLocomotionGround& Ground,
                                const ULocomotionProfile& Profile, const ULocomotionRules& Rules)
{
    const FGroundRow& G    = Rules.Ground(Ground.Surface);          // section 9.1
    const FLoadTier&  Load = Rules.LoadTier(Cond.LoadFraction);     // section 9.2

    // Every cap acts on roles: winded, load tier, ground, and external caps.
    EGaitRole Cap = Cond.RoleCap;
    Cap = FMath::Min(Cap, State.bWinded ? EGaitRole::Recover : EGaitRole::Burst);
    Cap = FMath::Min(Cap, Load.RoleCap);
    Cap = FMath::Min(Cap, G.RoleCap);                           // deep snow and bog: no burst

    const bool  bCrouched = Intent.bCrouch && Profile.Crouch.SpeedCmS > 0.f;
    const uint8 GaitIndex = bCrouched ? INDEX_CROUCH : HighestAllowedAtOrBelow(Profile, Intent.RequestedGait, Cap);
    const FGaitRow& Row   = bCrouched ? Profile.Crouch : Profile.Gaits[GaitIndex];

    float Speed = Row.SpeedCmS * Cond.TopSpeedScale * G.SpeedFactor * Load.SpeedFactor;
    if (Row.Role == EGaitRole::Burst)                            // the sprint builds
    {
        const float Build = FMath::Clamp(State.BurstBuild / Profile.Momentum.BurstBuildSeconds, 0.f, 1.f);
        Speed *= FMath::Lerp(Profile.Momentum.BurstInitialFraction, 1.f, Build);
    }
    Speed *= SlopeSpeedFactor(Ground.SlopeAlongTravelDeg, Profile.Momentum);

    FLocomotionStep Step;
    Step.GaitIndex       = GaitIndex;
    Step.MaxSpeedCmS     = Speed;
    Step.AccelerationCmS2 = Row.AccelerationCmS2 * Cond.AccelerationScale * Load.HandlingFactor;
    Step.BrakingCmS2     = Row.BrakingCmS2 * Load.HandlingFactor;
    Step.TurnRateScale   = Load.HandlingFactor;                  // read by TurnRateNowDegS beside Cond.TurnRateScale
    Step.StaminaPerSecond = ScaleDrain(StaminaRate(Row, Cond, Ground, Profile), Load.StaminaCostFactor);   // section 5; scales drains, never recovery
    Step.bJumpAllowed    = Load.bJumpAllowed;
    Step.NoiseRangeCm    = Row.NoiseRangeCm * G.NoiseFactor;      // section 9.3
    Step.StumbleRisk     = StumbleRiskPerSecond(Row, G, Ground.SlopeAlongTravelDeg);   // section 9.1
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

float TurnRateNowDegS(const FLocomotionTurning& T, const FLocomotionConditions& Cond, const FLocomotionStep& Step,
                      float SpeedCmS, float TopSpeedCmS)
{
    const float Moving = FMath::RadiansToDegrees(SpeedCmS / TurnRadiusCm(T, SpeedCmS, TopSpeedCmS));
    const float Pivot  = T.TurnInPlaceRateDegS * FMath::Max(0.f, 1.f - SpeedCmS / T.PivotBlendSpeedCmS);
    return FMath::Min(FMath::Max(Moving, Pivot), T.MaxTurnRateDegS) * Cond.TurnRateScale * Step.TurnRateScale;
}
```

`TopSpeedCmS` is the profile's fastest gait, so `SpeedRadiusFactor` reads the same way on every body: zero means speed never widens the turn, and nine means the radius at full speed is ten times the radius at an easy pace. A body with `TurnInPlaceRateDegS` at zero has a turn rate of zero when it stands still, and turns only as fast as its speed and radius allow once it moves, so asking it to face behind makes it walk the arc.

The `PhysicsRotation` override turns the facing toward its target by at most that rate times the move's delta time. The `CalcVelocity` override applies the same bound to the horizontal velocity's heading, so the line of travel and the facing turn on the same circle. When the input asks for a sharper turn than the bound allows, the body brakes at `TurnBrakingFraction` of its braking deceleration for as long as the shortfall lasts; slowing shrinks the radius, which raises the rate, and the turn tightens. A person brakes fully and cuts the corner at a third less speed; a charger with a fraction near zero keeps its speed, overshoots, and comes round wide.

Speed also depends on direction relative to the facing. The step's top speed is multiplied by a direction factor: one inside the burst cone of the facing, falling to `SideSpeedFraction` of the travel gait at ninety degrees and `BackSpeedFraction` behind, and a burst gait is granted only inside the cone. The cone has two widths. Starting a burst gait uses the narrow `BurstStartConeDeg`; a burst gait counts as running when the previous move's granted gait, `State.ActiveGait`, was the burst row, and then the wide `BurstHoldConeDeg` applies. The running state is read from the granted gait and not from `BurstBuild`, because a cut sheds the build and must not also shed the sprint. With the narrow cone alone, a right-angle cut left the sprint at once and the body dropped to the jog before the turn braking began; with the wide one the sprint survives the whole cut, and the loss is the turn braking, the third the specification promises (section 12). With both side fractions at zero, the acceleration is projected onto the facing, and a body that is asked to go sideways first turns and then goes.

### 4.2 Head, Body, and View

Every body has a facing, the actor's yaw, and a head offset from it, limited to `HeadYawLimitDeg` either side. What sets the facing's target differs by who drives the body.

For a player, the control rotation is the requested view. Standing or moving, the facing's target is the nearest yaw that keeps the requested view within the head's reach, so the body turns only for the part of the view beyond the limit and stops as soon as the view is back inside. A moving body therefore keeps its facing through a glance: a 70-degree look to the side leaves the facing where it is, the line of travel stays inside the burst cone, and the sprint holds at 6,5 metres a second. The movement input, read in the view's frame, is weighed against the facing by the direction factor; a player who looks sixty degrees to the side and presses forward starts at the reduced off-facing speed and keeps it until the view moves past the head's reach, and the body comes round only by the excess. A flick to look directly behind from standing settles the facing at 100 degrees, the view less the head's 80, and not at 180; what arrives about a quarter of a second later is the camera, after a reference 0,28 seconds, as it follows the body's pivot. The control rotation is already sent with every saved move, so the server computes the same facing from the same inputs and the turn is predicted like the rest of the move. The saved move keeps its own copy of the view, as section 7 describes.

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
        if (Rate < 0.f)
        {
            Rate = 0.f;                                     // a move that spends does not also recover
        }
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

The clamp is explicit: in any move that spends or drains, the recovery rate is zero, so a walking body that swings a sword pays the swing's full cost and refills nothing in the same move. The unit tests pin it down.

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
| `ProcessLanded` | Converts the fall height into landing recovery on every machine and a fall-damage request on the server: 25 joules of crush to each leg per metre beyond `SafeFallCm`, so about 7 metres fractures both legs and leaves a limp and about 13 kills. |
| Move start | Runs the body's action slot sub-step of [Melee Combat (Technical)](<Melee-combat (Technical).md#4-running-inside-the-move>) before the locomotion solve, so an action's limits on turning and gait apply in the same move. |
| `GetPredictionData_Client` | Supplies the client prediction data that allocates the custom saved move of section 7. |

Crouching uses the CMC's own crouch, which resizes the capsule and replicates the crouched flag; the component only replaces its speed with the profile's crouch row. Fall damage is applied by the server alone through the vitals system, so the client predicts the stumble and never a wound that did not happen. Climbing, swimming, and the flight modes are later movement modes on the same component, and each spends stamina through the pool of section 5 inside its own physics.

### 6.1 Movement Modes

Vaulting, mantling, climbing, and swimming are movement modes of the same component, so they share its prediction, its stamina pool, and its conditions.

Swimming uses the CMC's own swimming mode inside water volumes, with the component's `PhysSwimming` override applying the specification's speeds and stamina drain. Whether the body floats is set each move through the CMC's `Buoyancy` from the load fraction: full buoyancy below a quarter of capacity, falling through the middle band, and below neutral beyond half, so an overloaded swimmer sinks under the same physics that floats a light one.

Climbing is a custom mode in `PhysCustom`. A short forward trace each move finds the surface in reach, and the surface's physical material names a row in the ground table of section 9.1 that now also carries a climb rating: none for smooth stone, ice, and every building piece, and a difficulty for rock, crags, and trees. Climbing gear changes what a surface accepts: a fixed rope, a ladder, or a grapnel line is an actor with its own climbable surface, and ice picks in the hands let ice count as hard rock. The climb mode moves the capsule across the surface plane at a speed and stamina cost from the profile, scaled by the rating and the load, and ends on a ledge, at the top, or in a fall when stamina runs out.

Vaults, hop-ups, mantles, and climb-overs are short, fixed traversals. When a jump begins, capsule sweeps ahead of the body measure the obstacle's height, the depth of its top, and the ground beyond it; the traversal is chosen from those, refused when the hands are full or the load is over the limit, and then played as a custom sub-mode that moves the capsule along a path fitted to the obstacle over a duration from the height. The numbers belong to the body's profile, so a creature with its own traversals brings its own.

```cpp
USTRUCT()
struct FLocomotionTraversal
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float StepMaxCm = 50.f;               // below this the obstacle is an ordinary jump
    UPROPERTY(EditAnywhere) float VaultMaxCm = 110.f;             // tops up to here can be vaulted
    UPROPERTY(EditAnywhere) float VaultMaxDepthCm = 120.f;        // a deeper top is hopped onto, not vaulted
    UPROPERTY(EditAnywhere) float MantleMinDepthCm = 50.f;        // a thinner top above the vault band is climbed over
    UPROPERTY(EditAnywhere) float OverheadReachCm = 218.f;        // measured from the body: shoulder joint plus arm to the middle fingertip, from the feet
    UPROPERTY(EditAnywhere) float JumpReachBonusCm = 0.f;         // tuning allowance for the jump on top of the reach; the rising shoulder
    UPROPERTY(EditAnywhere) float JumpWindowCm = 100.f;           // the jump must come within this distance of the face
    UPROPERTY(EditAnywhere) float VaultBaseSeconds = 0.35f;
    UPROPERTY(EditAnywhere) float VaultSecondsPerMeter = 0.5f;
    UPROPERTY(EditAnywhere) float VaultKeptSpeed = 0.8f;          // share of arrival speed kept on leaving the wall
    UPROPERTY(EditAnywhere) float BurdenedVaultKeptSpeed = 0.3f;  // over the carrying limit
    UPROPERTY(EditAnywhere) float MantleBaseSeconds = 0.6f;
    UPROPERTY(EditAnywhere) float MantleSecondsPerMeter = 0.5f;   // hop-up and climb-over use the mantle's time and cost
    UPROPERTY(EditAnywhere) float CostChestHeightCm = 120.f;      // cost line: a twentieth of the pool here...
    UPROPERTY(EditAnywhere) float CostChestFraction = 0.05f;
    UPROPERTY(EditAnywhere) float CostFullReachHeightCm = 200.f;  // ...rising straight to a seventh here, and on beyond it
    UPROPERTY(EditAnywhere) float CostFullReachFraction = 1.f / 7.f;
    UPROPERTY(EditAnywhere) float LandingRoomCm = 70.f;           // ground the whole footprint needs beyond the obstacle
    UPROPERTY(EditAnywhere) float ClimbOverMaxDropCm = 200.f;     // a climb-over refuses a landing lower than this; a vault does not
    UPROPERTY(EditAnywhere) float MaxApproachAngleDeg = 60.f;     // off square to the face; the path crosses the face, not the line of the run
};
```

The measured obstacle picks the traversal from the top's height, its depth, and the overhead reach, plus the jump allowance:

| Obstacle top | Traversal |
|---|---|
| Below `StepMaxCm` | Ordinary jump |
| Up to `VaultMaxCm`, no deeper than `VaultMaxDepthCm` | Vault; the landing room is checked |
| Up to `VaultMaxCm`, deeper than that | Hop-up onto the top, at the mantle's cost for chest height, `CostChestFraction` of the pool |
| Above `VaultMaxCm` up to `OverheadReachCm + JumpReachBonusCm`, at least `MantleMinDepthCm` deep | Mantle |
| The same heights, thinner than that | Climb-over; the landing room and the drop limit are checked |
| Above the reach | Not a traversal; the surface is a climb (above) or nothing |

The vault takes `VaultBaseSeconds` plus `VaultSecondsPerMeter` times the height, 0,65 seconds at 60 centimetres and 0,9 at 1,10 metres, and leaves the body at `VaultKeptSpeed` of its arrival speed, or `BurdenedVaultKeptSpeed` when the load is over the limit; the mantle and its two siblings take `MantleBaseSeconds` plus `MantleSecondsPerMeter` times the height, and cost the pool fraction on the straight line through the two cost points, 7,3 points at 1,40 metres and 12,0 at 1,80 for a pool of 100. A mantle, hop-up, or climb-over is refused outright when the hands are full or the load is over the limit. The reach is measured from the character model at the feet, never from the ground at the face, and for the 1,80-metre template body it comes to 2,18 metres, a little under what a standing person reaches, because the shoulder rises with the arm and the model's rest pose does not show it; `JumpReachBonusCm` is the tuning value for when play says the reach is short. The landing check demands the body's whole footprint on ground, `LandingRoomCm` beyond the top for the template body, so a second fence or an overhang closer than that refuses the move. The approach angle is measured between the facing and the obstacle's face normal, and inside `MaxApproachAngleDeg` the fitted path crosses the face by the short way.

A traversal that the body cannot pay for in stamina is refused before anything is spent. The check runs ahead of `CanAttemptJump`: when the sweep classifies the obstacle as a hop-up, mantle, or climb-over and the pool is short, the press is consumed as a failed grab, a short animation that shows why, and no jump cost is charged, so the body stays on its feet and the pool does not drain. Only a press with no climbable obstacle ahead falls through to the ordinary jump and its cost.

What the saved move carries for a traversal is the measured obstacle in whole centimetres (height and depth) and the traversal's clock in milliseconds, never the start transform. The server anchors the path at its own position for that move, measures the obstacle again, and accepts the client's figures only within four centimetres plus one rounding step, using its own measurement otherwise, so a client cannot place the start of a fixed path wherever it likes. Two machines measuring the same wall from positions a prediction error apart disagree by a few millimetres, well inside the tolerance. The jump input and the progress through the traversal also live in the saved move, so a mantle is predicted and replayed like any other movement.

## 7. Players: Prediction and Correction

The owning client predicts its own body through the CMC's saved moves, following Epic's [networked movement guide](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine). Three pieces carry the shared model through it.

The saved move, a subclass of `FSavedMove_Character`, records the intent, the pending stamina spend, and the player's view in `SetMoveFor` and restores them in `PrepMoveFor`, so a replayed move asks for the same gait, spends the same stamina, and turns toward the same view it did the first time. The view needs a copy of its own: in Unreal Engine 5.8 the control rotation stored in a saved move is overwritten with the live view after every replay, so from the second correction on, replayed moves would turn the body toward where the player is looking now, and a player sweeping the view while sprinting would draw a stream of small corrections. The saved move records the view once, when the move is made, and restores that copy. `CanCombineWith` refuses to merge two moves with different gaits or with a spend in either, so neither a gait change nor a spend is lost in a combined move.

The move data, a subclass of `FCharacterNetworkMoveData` registered with `SetNetworkMoveDataContainer`, sends the requested gait and the quantised pending spend to the server with each move through its `ClientFillNetworkMoveData` and `Serialize` overrides. The crouch flag already travels in the CMC's own compressed flags.

The move response, a subclass of `FCharacterMoveResponseDataContainer` registered with `SetMoveResponseDataContainer`, returns the server's `FLocomotionState` with every correction through `ServerFillResponseData`, and the client writes it back before replaying its pending moves. Stamina is therefore corrected along with position, and a client that drifted from the server, through a dropped spend or a stale condition, is pulled back in a single correction rather than diverging.

The conditions are the only input not carried in the move. They change on inventory, stat, and survival events, a few times a minute at most, and the time stamp of section 3 confines any misprediction to the moves between the server's change and its arrival.

## 8. Creatures: Server-Driven Bodies

An AI-controlled creature has no owning client, so its movement runs only on the server and nothing about it is predicted. Its brain writes the intent, choosing a gait from its own judgement, and reads the state back, so a wolf can see that it is winded and drop to a recovering gait without a separate stamina model of its own. Which recovering gait a winded wolf asks for is the brain's decision: the walk when it is out of danger, the labouring trot when it is in danger, with danger measured from the fight (a wolf holding a lunge or feint order, or mauling the target, within a few metres; its own order; or a pack of three or fewer) and not from the distance to the player. The decision lives in a plain function in the creature's code, as section 7 of [Taming and Control (Technical)](<Taming-and-control (Technical).md>) arranges for every species, and this guide supplies only the rows it chooses between. Path following reaches the body through the CMC's `RequestPathMove` and `RequestDirectMove`. With `NavMovementProperties.bUseAccelerationForPaths` set, the path request becomes acceleration rather than a direct velocity, so the creature passes through the same acceleration, braking, and turn model as a player and a charging creature genuinely cannot turn on a coin. A creature that needs a sharp turn its momentum will not give, such as a Minotaur that has overshot its target, has to slow and come round, which is the counter window [Movement](Movement.md#creatures-and-mounts) promises.

Other clients see creatures and other players as simulated proxies with the CMC's smoothing, which already carries the facing as the actor's rotation. A small view struct replicates with the actor, skipping the owner: the granted gait, a stamina band of four steps, the winded flag, the head's yaw offset from the facing, and, while a traversal plays, its clip and duration. The head's pitch needs nothing new, because the engine already replicates it to simulated proxies: since Unreal Engine 5.6 `APawn::RemoteViewPitch` is deprecated in favour of a 16-bit value read through `GetRemoteViewPitch()`, and the component reads the pitch through that accessor. Onlookers therefore see the body's facing, its turn, and where its head is looking exactly as its own player does, which is what makes a glance over the shoulder readable.

```cpp
USTRUCT()
struct FLocomotionView
{
    GENERATED_BODY()

    uint8 Gait = 0;
    uint8 StaminaBand = 3;    // 0 empty .. 3 full
    int8  HeadYaw = 0;        // quantised offset from the facing, within the head's reach
    bool  bWinded = false;
    uint8 TraversalClip = 0;  // entry in the body's traversal clip list, 0 for none
    uint16 TraversalMs = 0;   // the traversal's duration in milliseconds
};
```

The two traversal fields exist because a traversal reaches onlookers otherwise only as a movement mode, and the clip is chosen by kind and height and timed to a duration that an onlooker cannot work out without the measured obstacle. The clip index costs one byte and the duration two. In networked tests at 150 milliseconds an onlooking client played the same clip, duration and rates as the owner and the server.

A hunting creature's brain reads that view on other bodies, which is how predators press winded prey. Exhaustion is not hidden state: the server holds every body's `FLocomotionState`, and the brain reads the winded flag and the stamina band of any body its [AI Perception](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine) currently senses, through a read-only query on that body's movement component. The query makes no distinction between players, wild prey, mounts, and other creatures, so the same rule that sends a pack at a player who has sprinted empty sends it at the deer that falls behind its herd. Perception is the gate: a body the creature neither sees nor hears returns nothing, so a player who recovers out of sight behind cover is not marked. How the brain weighs a winded target against everything else it wants is owned by the creature AI in [Taming and Control (Technical)](<Taming-and-control (Technical).md>); this guide supplies only the signal.

Near a region edge the same struct rides in the ghost state flags of the [ghost entity protocol](<Server-architecture (Technical).md#61-ghost-entity-protocol>), extending what the riding guide already adds for mounts, so a body seen across a boundary still reads correctly.

## 9. Ground, Load, and Noise

### 9.1 Ground

What every body shares lives in one rules asset, `ULocomotionRules`, and not in functions inside the solve: the ground table of this section and the load tiers of section 9.2. Every balancing number in it is data that a server can override by name, in line with the rule that every balancing value is a server default. The solve receives the asset and reads its rows.

The CMC's floor result says what the body stands on. Each surface carries a physical material whose [surface type](https://dev.epicgames.com/documentation/unreal-engine/physical-materials-user-guide-for-unreal-engine) maps, through the asset's ground table with one row per surface type, to a speed factor, a roughness for stumble risk, a noise factor, and a role cap. The table is the one section 5.3 of the riding guide reads; its rows follow the specification, with roads and firm grass at full speed, forest floor and scrub slightly slower, sand, mud, and shallow snow about a fifth slower, and deep snow and bog nearly half as fast with no burst gait. `FLocomotionGround` also carries the slope along the line of travel, measured from the floor normal and the horizontal velocity, signed so that the solve can tell a climb from a descent.

Stumbles are server-decided. While a body runs above its comfortable pace on rough ground, the server rolls each second from the step's stumble risk and, on a hit, sends a stagger that costs momentum; for a mount the riding guide turns the same roll into a thrown rider or an injured leg. A stumble is never predicted, so a player never sees a fall that did not happen, and every correction that follows one arrives within half a second of it, at 150 milliseconds of latency as well.

The risk is the gait's base risk, multiplied by the ground's roughness and by the steepness of the descent, and held at one:

```cpp
float StumbleRiskPerSecond(const FGaitRow& Row, const FGroundRow& G, float SlopeAlongTravelDeg)
{
    const float Downhill = FMath::Max(0.f, -SlopeAlongTravelDeg);            // positive slope is uphill
    return FMath::Min(1.f, Row.StumbleRiskScale * G.Roughness * (1.f + Downhill / 10.f));
}
```

The profile's `StumbleRiskScale` is 0,2 a second for the sprint, 0,02 for the jog, and zero for the walk and crouch; roughness is 1 on scree and ice. A hit takes 40 per cent off the body's speed and holds it to a walk for 0,6 seconds. The downhill term is deliberately harsh. On a 25-degree scree slope the sprint's risk is 0,2 × 1 × 3,5 = 0,7 a roll, and a slope near 40 degrees saturates it, so a sprint there stumbles at every roll. On the 25-degree slope a sprint averages about 4,0 metres a second over the last 5,5 seconds of a descent, against 6,4 for a clean sprint and 3,5 for a jog on the same ground, at a cost of 6,67 stamina a second: it still wins by roughly 15 per cent, which is all it buys. Steep loose ground is for careful jogs, which fits how [Creature Riding](Creature-riding.md) describes scree.

### 9.2 Load

The inventory reports the carried mass as `LoadFraction` in the conditions. The solve maps it through the [Inventory](Inventory.md#weight-and-strength-mechanics) tiers, which the rules asset of section 9.1 holds as an ordered list and not as functions in the solve:

```cpp
USTRUCT()
struct FLoadTier
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) float     UpperLimit = 0.75f;          // share of capacity; the last tier covers everything above the others
    UPROPERTY(EditAnywhere) float     SpeedFactor = 1.f;           // 0 stands the body still
    UPROPERTY(EditAnywhere) float     HandlingFactor = 1.f;        // acceleration, braking, and turn rate
    UPROPERTY(EditAnywhere) float     StaminaCostFactor = 1.f;     // drains only
    UPROPERTY(EditAnywhere) EGaitRole RoleCap = EGaitRole::Burst;
    UPROPERTY(EditAnywhere) bool      bJumpAllowed = true;
};
```

`ULocomotionRules::LoadTier` returns the first tier whose limit is not below the load. The tiers follow the specification's bands and these starting values, where a tier the design gives no figure for keeps the one before it:

| Tier | Upper limit | Speed | Handling | Stamina cost | Role cap | Jump |
|---|---|---|---|---|---|---|
| Free | 0,75 | 1,0 | 1,0 | 1,0 | Burst | Yes |
| Approaching the limit | 1,0 | 0,95 | 0,85 | 1,1 | Burst | Yes |
| Over the limit | 1,25 | 0,9 | 0,85 | 1,5 | Travel | Yes |
| Severely overweight | 1,5 | 0,9 | 0,85 | 1,5 | Recover | No |
| Immovable | very large | 0 | 0,85 | 1,5 | Recover | No |

The last row stands an overloaded body still without a special case. For a mount the load is the riding guide's carried mass against the mount's strength, read through the same field.

### 9.3 Noise

A gait's noise is a distance, not a loudness: the specification states it in metres, so each gait row stores `NoiseRangeCm`, the distance at which that gait is heard on neutral ground, and no conversion stands between the design's figure and the sense. The player's gaits are heard at 2, 5, 15, and 35 metres for the crouch, walk, jog, and sprint. The server reports each body's gait through the AI Hearing sense with [`UAISense_Hearing::ReportNoiseEvent`](https://dev.epicgames.com/documentation/unreal-engine/ai-perception-in-unreal-engine), at the body's stride rate, with the footstep's range set to the step's `NoiseRangeCm` (the gait's range already multiplied by the ground's noise factor), times an equipment noise value the inventory supplies. The ground factors are 1,2 on forest floor, 1,5 on scree, and 0,5 on moss, so a sprint on scree carries 52,5 metres. Heavy gaits also post to the server-side tremor register the riding guide defines for burrowing listeners. A winded body reports its breathing as a noise of its own, quiet and tagged `Winded` through the event's tag parameter, with a range of 8 metres once a second until it recovers, so a predator that hears it without seeing it still learns that the body is spent; 8 metres is further than the 5 of the walk the body is held to, which keeps the specification's promise that a winded player carries further than their footsteps. Footstep and breathing sounds on clients are driven by animation, not by these events, so what a player hears and what a creature hears come from the same gait without one waiting on the other.

## 10. Animation and First-Person Presentation

Every body's animation reads the same values from its movement component: ground speed, the granted gait and its role, the movement direction relative to the facing for sidesteps and backpedalling, the facing's yaw rate for turn-in-place steps and for leaning into turns, the head's yaw and pitch for the head and spine, the slope, the stamina band, and landing. A two-legged and a four-legged body need different animation blueprints, but the inputs are identical, which is what lets the riding guide's quadruped locomotion and a creature's own locomotion share code. Gait changes driven by the turn model and the burst build-up are predictable from the trajectory, which suits [Motion Matching](https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine) as the riding guide also notes.

Traversal animation is authored or cut to the traversal times of section 6.1, never stretched to fit them. A vault clip runs from the hand plant on the obstacle to the landing, without the run-in before the hand reaches the top, since a clip that includes the run-in plays at several times its authored speed to fit a 0,65-second vault. Mantle clips are authored in height steps of about half a metre, and the clip is chosen by kind and height from the body's list of traversal clips, the entry replicated as the clip index of section 8. The mantle plays at two rates, a climb phase timed so that it ends when the capsule reaches the top of its rise, then the push over the edge. The hands land on the edge by IK or by [Motion Warping](https://dev.epicgames.com/documentation/unreal-engine/motion-warping-in-unreal-engine) toward the measured edge, never by the clip's own placement, so an edge half a metre higher than the clip's climb is still gripped. The duration comes from section 6.1 and is the second replicated field, so an onlooker plays the same clip over the same time.

The local player sees their own full body from the camera at its head, the same skeleton and animation other players see rather than a separate pair of camera-only arms, with Epic's [First Person Rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering) keeping held items and the near arms from clipping into the world. The first-person presentation reads the same values for the local player: a head bob scaled by gait, a small field-of-view widening that follows the burst build-up, a sway and rising breath as the pool empties, and a landing dip that grows with fall height. All of it lives in the camera and audio layers, never in the movement, so the comfort options of [Accessibility](Accessibility.md) can soften or remove it without changing how the body moves.

## 11. Open Implementation Questions

How wide the sprinting radius and how slow the in-place pivot can be before first-person movement feels slippery or sluggish is the first thing the prototype must answer, since the head moves instantly within its reach and the body does not; the specification's figures of a half-second about-face and a five-metre sprinting circle are the starting point, not settled values, and so are the acceleration and braking rows of section 2, which are computed from the specification's wording and untried by hand. Whether the requested view should run ahead of the facing by a full half-turn, or by less, is the second. Path following assumes a body can take the corners of its navigation path, so a creature with a wide radius or no turn in place may need its path smoothed to its radius, or a navigation agent sized for it, before it stops scraping round corners. Acceleration-driven path following can overshoot tight navigation corridors at a burst gait, and creature brains may need to request a slower gait before sharp corners rather than rely on the turn model alone. The stamina value in a move response is a full float in this sketch and can probably be quantised to a byte without visible error. The solve and the state advance are pure functions and are tested directly with Unreal's automation framework, and the networked behaviour is tested with the editor's network emulation at the 150 millisecond latency the riding guide's validation cases use.

## 12. Design Validation Cases

| Case | Expected result |
|---|---|
| A player sprints from full stamina on level road with no load. | Most of the sprint speed at once, full speed after about three seconds, empty after about fifteen, then held to a walk until a quarter of the pool returns. |
| A player on 150 ms latency sprints, swings a weapon, and jumps in quick succession. | No visible corrections; client and server agree on stamina after every move. |
| A player sprinting at full speed cuts a right angle. | The sprint stays granted through the cut, since the running cone is wide; the line of travel bends over a short arc, about a third of the speed is lost to the turn braking, and the burst build-up starts again. |
| A standing player flicks the mouse to look directly behind. | The view turns instantly to the head's limit and the body pivots until the facing is 100 degrees round, the view less the head's reach; the camera arrives about a quarter of a second later, and another client sees the head turn first and the body step round. |
| A player looks sixty degrees to the side and presses forward. | They step off at the reduced off-facing speed with the head still turned; the body does not turn for a view inside the head's reach, and comes round only by the excess beyond it. |
| A sprinting player glances 70 degrees to one side and back. | The view turns within the head's reach, the facing does not change, the sprint holds at full speed, and other clients see the head turn. |
| A player sprinting at 6,5 metres a second vaults a 60-centimetre wall, then a 1,10-metre one. | The vaults take 0,65 and 0,90 seconds and the body leaves each at 5,2 metres a second; over the network at 150 ms, no correction. |
| A player jumps at a 1,80-metre wall with a little over five points of stamina, four times in a row. | Each press is refused as a failed grab with no jump spent and no stamina lost; the pool recovers normally, and the player can stand back, wait, and then climb it for 12 points. |
| A player jumps at a 2,00-metre ledge, then a 2,20-metre one, with the template body. | The first is caught and mantled; the second is out of reach and the surface is a climb or nothing. |
| A player runs at a fence diagonally at 50 degrees off square, then at a fence with a second fence 0,50 metres behind it. | The first is crossed by the short way over its face; the second crossing is refused for lack of landing room. |
| A player climbs over a thin wall above a drop of 2,50 metres, then vaults a waist-high railing at the same drop. | The climb-over is refused; the vault goes on over the railing and the fall is judged by the ordinary landing rules. |
| A creature with no turn in place is asked to face a target behind it. | It walks a forward arc of its base radius rather than pivoting. |
| A player stands behind a grazing animal, beyond the reach of its head. | The animal does not see them until it turns its head or body toward them. |
| A player over their carrying limit holds sprint. | They jog at a reduced pace and cannot sprint; dropping below the limit restores the sprint on the next move. |
| A wolf chases a jogging player who never sprints. | The wolf closes at a trot, sprints when it commits, tires, and drops back to a trot to recover. |
| A winded wolf at the back of a hunting circle, and one at its front. | The back wolf is out of danger and walks to recover; the front wolf, with a lunge-holding wolf within a few metres, labours on at the trot. When the pack loses its prey both walk. |
| A wolf pack circles a player who then sprints until winded; a second player recovers out of sight behind a rock. | The pack closes on the winded player in the open; the hidden player is not marked until the pack perceives them. |
| A wolf pack chases a herd of deer. | The first deer to run itself winded becomes the pack's target, by the same query a winded player triggers. |
| A Minotaur charges a player who sidesteps late. | The charge passes the player; the Minotaur slows and comes round rather than turning on the spot. |
| A horse is galloped to exhaustion, then a correction is forced. | It drops to a walk and cannot be pushed faster until stamina recovers, identically on client and server. |
| A player sprints down a 25-degree scree slope. | The server rolls stumbles at a risk of 0,7 a roll; a stumble costs momentum and reaches the client as an event, never as a predicted fall, and every correction follows a stumble within half a second. The sprint averages about 4,0 metres a second against 3,5 for a jog. |
| A player swings a weapon while walking. | The swing's cost is paid and the walk's recovery is zero in that move. |
| A player carries 1,10 times capacity, then 1,40 times, then 1,60 times. | The first jogs at 0,9 of normal speed, cannot sprint, and pays 1,5 times for every gait; the second can only walk and cannot jump; the third cannot move. |

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
