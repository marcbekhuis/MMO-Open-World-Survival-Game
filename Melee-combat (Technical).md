# Melee Combat in Unreal Engine 5

A technical design and implementation research guide based on the [Melee Combat specification](Melee-combat.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Movement (Technical)](<Movement (Technical).md>), whose body model it extends. Engine facts were checked against the 5.8 engine headers on 18 October 2026: shape sweeps through `UWorld::SweepMultiByChannel`, and explicit-time pose evaluation through the animation graph's sequence evaluator node, `FAnimNode_SequenceEvaluator`. Epic publishes no melee combat framework, weighted-swing model, or lag compensation for melee hits, so the strike simulation, its prediction, and the server's target rewind below are this project's own design built from documented parts. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every call needs validating against the engine version in use before it becomes production code.

The migration boundary is the one the movement and server guides set. Strike definitions, the strike simulation, and impact resolution are plain data and pure functions, specified independently of Unreal actors. Unreal reads input, animates the result, sweeps the weapon through the world, and replicates what happened. Who validates hits and commits their outcome when attacker and target sit on different region servers is still an open question in the [Design Backlog](Design-backlog.md), and this guide does not settle it; everything below assumes both bodies are simulated by one server.

---

## Table of Contents

1. [One Strike Model](#1-one-strike-model)
2. [Strike Definitions](#2-strike-definitions)
3. [The Strike Simulation](#3-the-strike-simulation)
4. [Running Inside the Move](#4-running-inside-the-move)
5. [Animation and Replication](#5-animation-and-replication)
6. [Hit Detection](#6-hit-detection)
7. [Impact Resolution](#7-impact-resolution)
8. [Blocking and Parrying](#8-blocking-and-parrying)
9. [Strength, Stamina, and Technique](#9-strength-stamina-and-technique)
10. [Creatures and Tools](#10-creatures-and-tools)
11. [Open Implementation Questions](#11-open-implementation-questions)
12. [Design Validation Cases](#12-design-validation-cases)
13. [Further Reading](#13-further-reading)

---

## 1. One Strike Model

Every strike, a sword cut, a hammer blow, a wolf's bite, a giant's fist, or a felling axe, is one simulation of a mass turning about a pivot along an authored arc. The arc says where the strike goes; the simulation says how fast it goes at every point along it. The animation is then sampled at the simulated position rather than played against the clock, so weight is felt because the pose genuinely moves as the physics says, not because a timing table was tuned to look heavy.

```text
 Player mouse gesture ─► FStrikeInput ─┐
 Creature AI brain ────► FStrikeInput ─┤
                                       ▼
   UStrikeDefinition ──► SimulateStrike(input, state, drive) ──► FStrikeState
                         (inside the movement component's move)      │
        ├── FStrikeBodyEffect ──► locomotion solve (turn rate, no burst, over-rotation)
        ├── stamina work ───────► shared stamina pool
        └── arc angle ──────────► animation pose (sequence evaluator)
                                       │
   Server: sweep the weapon's hit volumes from last pose to this pose
                                       ▼
   ResolveImpact(contact speed, effective mass, region, target material, guard)
        ├── damage to vitals or building pieces
        ├── recoil and stagger to attacker and target
        └── strike continues, deflects, sticks, or stops
```

`UStrikeComponent` hosts the strike on any body that strikes: the player character, every creature character, and a character holding a tool. A strike is one kind of action, and it begins only when the body's single action slot of section 4.1 is free. It owns no movement of its own; it runs as a sub-step of the body's `ULocomotionMovementComponent` move (section 4), because a strike changes how the body turns and runs and spends the same stamina, and both must be predicted together.

## 2. Strike Definitions

A strike definition describes the weight being moved and the arcs it can move along. A weapon item points at one; a creature species carries one per attacking part, its jaws, a forelimb, its tail, or its whole body for a charge.

```cpp
UENUM()
enum class EStrikeRegionKind : uint8 { Edge, Point, Blunt, Haft, Teeth, Claw };

USTRUCT()
struct FStrikeRegion
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) EStrikeRegionKind Kind = EStrikeRegionKind::Edge;
    UPROPERTY(EditAnywhere) float FromCm = 0.f;      // distance from the pivot along the weapon or limb
    UPROPERTY(EditAnywhere) float ToCm = 0.f;
    UPROPERTY(EditAnywhere) float RadiusCm = 2.f;    // hit volume radius along this stretch
};

UCLASS()
class UStrikeArc : public UDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) TObjectPtr<UAnimSequence> Pose;     // authored from wind-up to follow-through
    UPROPERTY(EditAnywhere) float WindUpDeg = 60.f;             // arc before the release point
    UPROPERTY(EditAnywhere) float SwingDeg = 160.f;             // arc from release to the end of follow-through
    UPROPERTY(EditAnywhere) bool  bThrust = false;              // a linear arc: angle reads as extension
    UPROPERTY(EditAnywhere) float MaxDragDegS = 90.f;           // plane deflection at low momentum
};

UCLASS()
class UStrikeDefinition : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) float MassKg = 1.1f;
    UPROPERTY(EditAnywhere) float BalanceCm = 15.f;             // centre of mass from the pivot (the hands)
    UPROPERTY(EditAnywhere) float LengthCm = 90.f;
    UPROPERTY(EditAnywhere) float LimbInertiaKgM2 = 0.15f;      // the arm or limb that moves with it
    UPROPERTY(EditAnywhere) bool  bTwoHanded = false;
    UPROPERTY(EditAnywhere) FGameplayTag Family;                // Weapon.Family.HeavyHammer, .Greatsword, .Dagger; Creature.* for bodies
    UPROPERTY(EditAnywhere) TArray<FRequirement> Requirements;  // section 9: plain values, e.g. Stat.MeleeForce >= 45, Skill.HeavyHammer >= 60
    UPROPERTY(EditAnywhere) TArray<FStrikeRegion> Regions;
    UPROPERTY(EditAnywhere) TMap<FGameplayTag, TObjectPtr<UStrikeArc>> Arcs; // Strike.Arc.Overhead, .Left, .Right, .Rising, .Thrust
    UPROPERTY(EditAnywhere) TObjectPtr<UPhysicalMaterial> Material; // for impact resolution, section 7
};
```

The moment of inertia about the hands follows from the definition: the limb's own inertia plus the weapon's mass at its balance point plus the spread of that mass along its length, `I = LimbInertia + m·d² + m·L²/12`. That single number is why a war hammer, with its mass at the end of a long haft, is far slower to start than a sword of half its length and the same mass held close. The target values in the specification's weapon table are what each definition is tuned against.

## 3. The Strike Simulation

The strike's state is a position along the arc, a speed, and a phase; the drag of the arc's plane is two small angles.

```cpp
UENUM()
enum class EStrikePhase : uint8 { Idle, WindUp, Swing, FollowThrough, Stopping, Recoil, Recover };

USTRUCT()
struct FStrikeState
{
    GENERATED_BODY()

    EStrikePhase Phase = EStrikePhase::Idle;
    uint8 ArcId = 0;
    float AngleDeg = 0.f;        // along the arc, 0 at the start of the wind-up
    float SpeedDegS = 0.f;       // angular speed (linear speed for a thrust)
    float DragYawDeg = 0.f;      // plane deflection from the mouse
    float DragPitchDeg = 0.f;
};

USTRUCT()
struct FStrikeInput
{
    GENERATED_BODY()

    uint8 StartArc = 0;          // non-zero on the move a strike is begun; chosen from the mouse gesture
    int8  DragYaw = 0;           // quantised mouse drag this move
    int8  DragPitch = 0;
    bool  bStop = false;         // the primary button was let go: check the strike (feint)
};
```

Each move integrates the strike with the torque the body can put behind it. Torque accelerates the weapon until it reaches the limb's speed limit; the same torque, reversed, is all that can stop it.

```cpp
void SimulateStrike(FStrikeState& S, const FStrikeInput& In, const UStrikeDefinition& Def,
                    const FStrikeDrive& Drive, float Dt, FStrikeWork& OutWork)
{
    const UStrikeArc& Arc = *Def.ArcById(S.ArcId);
    const float Inertia = Def.InertiaKgM2();
    const float Accel = FMath::RadiansToDegrees(Drive.TorqueNm / Inertia);   // deg/s²

    if (S.Phase == EStrikePhase::Stopping)
    {
        const float NewSpeed = FMath::Max(0.f, S.SpeedDegS - Accel * Drive.BrakeFraction * Dt);
        OutWork.StopJoules += KineticJoules(Inertia, S.SpeedDegS) - KineticJoules(Inertia, NewSpeed);
        S.SpeedDegS = NewSpeed;
        if (NewSpeed <= 0.f) { S.Phase = EStrikePhase::Recover; }
    }
    else if (S.Phase == EStrikePhase::WindUp || S.Phase == EStrikePhase::Swing)
    {
        const float NewSpeed = FMath::Min(S.SpeedDegS + Accel * Dt, Drive.LimbSpeedCapDegS);
        OutWork.DriveJoules += KineticJoules(Inertia, NewSpeed) - KineticJoules(Inertia, S.SpeedDegS);
        S.SpeedDegS = NewSpeed;
    }
    else if (S.Phase == EStrikePhase::FollowThrough)
    {
        S.SpeedDegS = FMath::Max(0.f, S.SpeedDegS - Accel * Drive.BrakeFraction * Dt);   // the arm slows it as it can
    }

    // The plane bends only as fast as the momentum allows: the turning rule of the movement guide, applied to the weapon.
    const float DragCap = Arc.MaxDragDegS / (1.f + AngularMomentum(Inertia, S.SpeedDegS) / Drive.DragMomentumScale);
    S.DragYawDeg   += FMath::Clamp(In.DragYaw * DragUnit, -DragCap * Dt, DragCap * Dt);
    S.DragPitchDeg += FMath::Clamp(In.DragPitch * DragUnit, -DragCap * Dt, DragCap * Dt);

    S.AngleDeg += S.SpeedDegS * Dt;
    AdvancePhase(S, Arc);   // WindUp -> Swing at the release point, Swing -> FollowThrough at the arc's target zone, then Recover
    if (In.bStop && S.Phase != EStrikePhase::Recover) { S.Phase = EStrikePhase::Stopping; }
}
```

A light weapon's small inertia lets the torque reach the limb's speed cap within a few degrees of arc, so its speed is constant and its stop is nearly free. A heavy weapon's large inertia means it is still gathering speed through most of the swing and, once fast, needs most of the arc to stop: the stop is allowed at any moment, and costs exactly the kinetic energy removed. A strike checked during the wind-up returns to guard; a strike that has stopped in the swing recovers from where it stopped.

## 4. Running Inside the Move

A strike changes the body: a heavy weapon in motion slows the body's turn and forbids the sprint, a heavy miss carries the body round, and the strike's work is paid from the same stamina pool that the movement guide predicts. Two predicted systems coupled that tightly would correct each other constantly, so the strike runs inside the movement component's move. `ULocomotionMovementComponent` calls the strike component's sub-step at the start of each move, before the locomotion solve, and the strike's input and state travel exactly as the movement guide's do: `FStrikeInput` in the move data alongside the locomotion intent, `FStrikeState` in the saved move, and both returned with every correction in the move response.

The sub-step hands the locomotion solve one small record for that move.

```cpp
USTRUCT()
struct FStrikeBodyEffect
{
    GENERATED_BODY()

    float TurnRateScale = 1.f;     // falls with the strike's angular momentum
    bool  bNoBurst = false;        // a heavy strike in motion forbids the burst gait
    float FacingYawDegS = 0.f;     // a missed heavy strike carries the facing round with it
    float StanceFactor = 1.f;      // read back next move: planted, moving, or backpedalling
};
```

The strike's drive and braking work become the move's stamina spend, so a swing never needs the movement guide's `RequestStaminaSpend` path, which remains for costs decided outside the move, such as the energy a block absorbs (section 8). The body's velocity along the swing direction is added to the contact speed at impact (section 7), which is how a running blow lands harder and how a mounted charge in [Creature Riding (Technical)](<Creature-riding (Technical).md>) turns the mount's speed into force.

AI-controlled creatures run the same sub-step on the server only, as their movement does.

A stamina cost decided by the server, such as the energy a block absorbs, is the exception that costs something. The owning client cannot know the energy of a blow it has not yet seen resolved, so each caught blow reaches it as a correction, and in networked tests at 150 milliseconds a caught blow cost the owner 2,4 corrections on average, the burst any server-decided stamina change produces, while unguarded hits cost none. Such a cost stays acceptable only while it is predictable, so the guard of section 8 is a held action in the slot with a defined stamina rule rather than a facing test.

### 4.1 The Action Slot

[Actions](Actions.md) allows a body one action at a time, and a strike is only one kind. Every body therefore has a single action slot, `UActionSlotComponent`, and every action, a strike, a guard, a spell, eating or drinking, drawing or swapping an item, a tool's swing, a creature's roar, runs through it. The slot is predicted in the move for the same reason the strike is: actions limit movement and spend stamina, and an action refused on the server but begun on the client would correct the body. The strike sub-step above is the strike action's tick inside the slot.

```cpp
UENUM()
enum class EActionKind : uint8 { None, Strike, Guard, Cast, Consume, Ready, Tool, Creature };

UENUM()
enum class EActionEnd : uint8 { Running, Completed, Cancelled, Broken };

USTRUCT()
struct FActionState
{
    GENERATED_BODY()

    EActionKind Kind = EActionKind::None;
    uint16 DefinitionId = 0;      // the strike, spell, item, or creature action being performed
    float  Elapsed = 0.f;
    float  Progress = 0.f;        // 0..1, owned by the action: arc fraction, mana gathered, portion eaten
    uint8  ReturnToGuard = 0;     // set on cancel: moves until the hands are free
};

USTRUCT()
struct FActionInput
{
    GENERATED_BODY()

    bool   bPrimaryHeld = false;     // left mouse button: use what is in the hands
    bool   bSecondaryHeld = false;   // right mouse button: guard
    uint8  HotbarSeq = 0;            // changes once per hotbar press, so a lost or merged move cannot repeat or drop it
    uint8  HotbarSlot = 0;           // slot index of the press that last changed HotbarSeq
};

USTRUCT()
struct FActionSummary                // sent with every move: the slot as the client holds it after the move
{
    GENERATED_BODY()

    EActionKind Kind = EActionKind::None;
    uint8  Phase = 0;                // the running action's phase
    uint16 HeldItemId = 0;           // the item in hand
    uint8  HeldCharges = 0;          // its charges, such as rations left or bandage uses
};

UENUM()
enum class EReleaseRule : uint8 { Cancel, CompleteIfPast };   // a bow looses on release once past its threshold

USTRUCT()
struct FActionRules                  // authored per action definition
{
    GENERATED_BODY()

    EReleaseRule Release = EReleaseRule::Cancel;
    float ReleaseThreshold = 0.f;    // progress past which a release completes instead of cancelling
    bool  bRepeatsWhileHeld = true;  // false for a bow: the release is the shot
    float HoldCostPerSecond = 0.f;   // stamina while held at the end of progress, such as a bow at full draw
};
```

The input is button state, not button presses: whether each button is held travels in every move, so a dropped packet can never lose a release, and the client and server read the same held state for the same move. The slot turns that state into actions with a handful of rules, applied in the same order on both machines.

When the slot is idle and the hands are in guard, a held primary button begins the action of whatever is in the hands, if its conditions are met: stamina above the action's cost, mana for a spell, food left to eat and hunger to eat it, a weapon whose requirements the character meets (section 9). Otherwise a held secondary button raises the guard. A button that is held while another action runs does nothing until the slot is idle again; nothing is queued, so a change of mind is simply a change of which button is held at that moment.

Letting go of the button that began the action ends it through the action's release rule. Most actions cancel: a strike enters its stopping phase and pays the physical cost of section 3, a cast forfeits the mana gathered, a consume grants the share of the item already eaten, a guard lowers, and a ready leaves the hands as they were. A bow completes instead once its draw has passed `ReleaseThreshold`, loosing the arrow with the draw reached; below the threshold it cancels and lowers the bow. Charged spells use the same release rule; quick spells repeat while held. A crossbow's span is a held action that cancels on release, and its shot is a separate action that completes on the press that begins it. A selected spell is readied into the main hand, or both hands, by a ready action like any weapon, from one of the caster's two spell slots or straight from the spell tree.

When an action completes with its button still held and it repeats while held, the slot begins the next one in the same move if the conditions are still met. A repeated strike takes its arc from the mouse gesture at that moment, or, with no gesture, from the arc that flows out of where the last one ended, which the strike definition names for each arc. An action held at the end of its progress without completing, a bow at full draw, charges `HoldCostPerSecond` to stamina each move and, for the bow, feeds a sway into the aim that grows as stamina falls. AI-controlled creatures write the same input from their brains, holding the primary for as long as they mean to press an attack. A stagger, a fall, or a knockdown decided by the server ends the action as broken, with the same cost as a cancel; it reaches the owning client in a correction, and the client replays from there. Every cancelled or broken action sets `ReturnToGuard` for a short time that grows with what was held, so no cancellation chains straight into a new action.

A hotbar press travels as a sequence number and a slot index, and the sequence changes once per press. The server acts on a press only when it sees a sequence it has not yet handled, so a lost or merged move can neither repeat a ready nor drop it. A press made while the slot is busy is dropped rather than queued, in line with the rule above, and the slot index is read only on the move where the sequence changed.

Many actions neither move the body nor spend stamina: eating, binding a wound, readying an item, holding a guard. A wrong slot would then show as no position or stamina error at all, and a client whose ration the server refused would eat on its screen without a correction. Every move therefore carries, besides the held buttons and the hotbar request, an `FActionSummary` of the slot after the move: the running action, its phase, the item in hand and its charges. The server compares it with its own slot and, on any mismatch, corrects the owning client with the whole slot state, which the client replays from. In networked tests at 150 milliseconds, readying a bandage from the belt pouch took 0,39 seconds against a planned 0,42 and binding the wound took 3,98 seconds against 4, with client and server logging both at the same move times and no correction beyond the seven the run cost before the bandage became an action.

Each action kind also supplies the body effect of the move, extending `FStrikeBodyEffect` to every action: a consume caps the gait at the travelling role, a ready of a heavy item slows the turn while it comes round, and a cast reads its limits from the spell. The effect applies to the move that carries the action and to no other: the highest gait, the turn rate and the stamina an action spends come from its own `FActionState` inside that move, never through the replicated movement conditions, which the server decides and which reach the client late. Readying an item takes a time computed from its mass and the container it comes from, a hand slot, a belt pouch, a back sling, or the inside of a pack, so the inventory's layout is what makes an item quick or slow to reach.

The slot replicates its kind, definition, and progress band to other clients alongside the strike view, so an onlooker sees a fighter lower their guard to drink, and a creature's own actions run through the same slot on the server.

## 5. Animation and Replication

Each arc's animation is authored from the start of the wind-up to the end of the follow-through, evenly paced, and the animation graph samples it through a sequence evaluator at the time that corresponds to the simulated angle. The pose is therefore exactly where the physics says the weapon is, slow where it is slow and fast where it is fast, without authoring a separate heavy and light version of each swing. The plane drag is applied on top as an additive rotation of the shoulders and arms, with two-bone IK keeping both hands on a two-handed grip. The player sees their own full body and weapon from the head camera, the same pose other players see, as the movement guide sets out.

Other clients receive a compact view of the strike, the arc, a quantised angle, a speed band, and the drag, replicated with the actor and interpolated between updates. Because the angle comes from the simulation, a remote heavy swing shows its slow wind-up and its fast sweep at the moments they really happen, and a player reading an opponent's wind-up is reading the same state the server will resolve hits from.

## 6. Hit Detection

Hits are detected on the server. Each strike region is a chain of spheres along the weapon or limb, and every server move sweeps each sphere from its position at the previous move's angle to its position at this move's angle with `UWorld::SweepMultiByChannel`, sub-stepping fast arcs so that no sweep covers more than a few degrees and a dagger flick never passes through a target between samples. The first blocking hit along a region is resolved (section 7), and resolution decides whether the strike continues and the sweep goes on to find further targets.

Targets are rewound. The attacker swung at what their client showed them, which on a 150 millisecond connection is where other bodies were a moment ago, so the server keeps a short history of every character's hit volumes and, for a player's strike, tests against the volumes as they stood at the attacker's view time, bounded to 250 milliseconds so a poor connection cannot reach far into the past. Static geometry needs no rewind and agrees on both machines, so the attacker's client predicts world contacts itself, the glance off a stone wall or the bite into a door, and plays them at once; hits on characters and creatures appear when the server confirms them.

The rewind decides one question only: whether the strike connects. Whether the blow was guarded is judged by when the defender raised the guard on their own screen, stamped by the defender's client and checked by the server, with a short grace equal to the tolerated latency. A guard raised in time on the defender's side therefore counts even if the attacker's view had not yet shown it, and a parry's window is judged the same way (section 8). The consequence is accepted: a blow sometimes turns out blocked or parried a moment after it seemed to land on the attacker's screen, because the confirmation arrives with the defender's timing already applied.

Armour pieces carry hit volumes of their own, and once swept hit volumes exist they are finer than a body region. The body regions are the boxes defined in [Health and Wounds (Technical)](<Health-and-wounds (Technical).md>), and a region on its own is either covered or not, which cannot express the gaps that [Armour](Armour.md#coverage-and-gaps) describes. Each piece therefore adds gap volumes where its cover stops, the armpit and the back of the knee among them, and a sweep that meets a gap volume resolves against the layers beneath the piece instead of against the piece. Flanking attackers show why this matters: a wolf pack's lunges meet a standing body on its side, so they land on the arms and the armpit gap far more often than on the torso.

### 6.1 Projectiles

Arrows, bolts, thrown weapons, and spell projectiles are simulated on the server as ballistic bodies: each tick integrates gravity, drag, and the wind of the weather system, and sweeps the projectile's point from its last position to its new one. A hit is resolved by `ResolveImpact` exactly as a strike is, with the projectile's mass and speed at contact in place of the swing's effective mass and contact speed and its head as the strike region. The shot leaves from where the shooter's client saw it leave, at the attacker's view time under the rewind of section 6, so a shot that was fair on the shooter's screen is fair on the server.

The shooter's client spawns its own cosmetic projectile the moment the action completes, so a loosed arrow never waits on the network, and the server's authoritative flight replaces it as soon as it arrives; other clients see only the server's. Large numbers of arrows are simulated as lightweight records stepped and swept by one manager rather than as one actor each, and Epic's `UProjectileMovementComponent` serves for the few projectiles that need full actor behaviour, such as a spell that steers. A projectile that comes to rest unbroken becomes an item in the world, with a break chance rising with its impact energy.

## 7. Impact Resolution

Impact is a pure function of the strike at the moment of contact and of what it struck.

```cpp
FImpactResult ResolveImpact(const FStrikeState& S, const UStrikeDefinition& Def, const FStrikeRegion& Region,
                            float ContactRadiusCm, float BodySpeedAlongStrikeCmS, const FImpactTarget& Target)
{
    const float SpeedMs = FMath::DegreesToRadians(S.SpeedDegS) * ContactRadiusCm / 100.f
                        + BodySpeedAlongStrikeCmS / 100.f;
    const float EffectiveMassKg = Def.InertiaKgM2() / FMath::Square(ContactRadiusCm / 100.f);
    const float EnergyJ = 0.5f * EffectiveMassKg * SpeedMs * SpeedMs;
    const float MomentumKgMs = EffectiveMassKg * SpeedMs;

    const FMaterialResponse& M = ImpactTable().Row(Region.Kind, Target.Material);
    FImpactResult R;
    if (Target.AlignmentCos < M.GlanceAlignmentCos && EnergyJ < M.GlanceBreakJoules)
    {
        R.Outcome = EImpactOutcome::Glance;                  // light blows skid off hard surfaces
        R.DeliveredJ = EnergyJ * M.GlanceShare;
    }
    else if (EnergyJ <= M.StopJoules)
    {
        R.Outcome = M.bCanBite ? EImpactOutcome::Bite : EImpactOutcome::Stop;   // stuck in wood, or stopped dead
        R.DeliveredJ = EnergyJ * M.Absorption;
        R.RecoilMomentum = MomentumKgMs * M.Rigidity;       // what comes back up the haft
    }
    else
    {
        R.Outcome = EImpactOutcome::CarryThrough;           // through, keeping what is left
        R.DeliveredJ = M.StopJoules;
        R.RemainingSpeedFraction = FMath::Sqrt(1.f - M.StopJoules / EnergyJ);
    }
    R.TargetPushMomentum = MomentumKgMs - R.RecoilMomentum;  // stagger and knockback against the target's mass and brace
    R.DamageKind = DamageKindFor(Region.Kind);               // cut, pierce, or crush
    return R;
}
```

The impact table is project data, one row per strike region kind and target material: flesh, hide, mail, plate, wooden shield, metal shield, wood, earth, and stone. Each row holds the alignment below which a blow glances, the energy that breaks through a glance anyway, the energy the material stops, how much of a stopped blow it absorbs, how rigid it is, and whether an edge can bite and stick. Physical materials on character hit volumes, armour pieces, shields, building pieces, and world geometry name the row. An item's condition, as [Inventory](Inventory.md#wear-and-repair) defines it, scales the lookup: a dull edge lowers the glance threshold it beats and the energy it delivers, and a worn armour piece lowers the energy it stops.

Armour is the first column of this table, and its outcome must be continuous in the blow's energy. A layer is not a threshold that either stops a blow or lets it through. Per material it keeps three things: the energy of each damage kind it stops, the blunt share of a stopped blow that it passes on as crush, and the wear it takes per joule absorbed. The rows are padded cloth, leather, mail, plate, and the hides of creatures.

```cpp
struct FDeliveredEnergy
{
    float ByKind[3] = {};      // cut, pierce, crush still travelling inward, in joules
    float Crush = 0.f;         // bruising passed on by the layers above, in joules; reaches the body as crush
};

struct FArmourLayerRow
{
    float StopJoules[3];       // cut, pierce, crush: the energy of each kind this layer stops
    float BluntShare = 0.f;    // the share of what it stopped that still arrives as crush (mail: 0.4)
    float WearPerJoule = 0.f;  // condition lost per joule absorbed
};

// Each layer takes up to its stop energy of each kind, passes its blunt share of what it took as crush,
// and lets the rest through to the next layer.
void ApplyLayer(const FArmourLayerRow& L, FDeliveredEnergy& InOut, float& WearOut)
{
    float Crush = InOut.Crush;
    for (int32 Kind = 0; Kind < 3; ++Kind)
    {
        const float Taken = FMath::Min(InOut.ByKind[Kind], L.StopJoules[Kind]);
        InOut.ByKind[Kind] -= Taken;                 // the rest goes on through
        Crush += Taken * L.BluntShare;               // what was stopped still bruises
        WearOut += Taken * L.WearPerJoule;
    }
    InOut.Crush = Crush;
}
```

The reason is a bug class, not a style choice. A first draft that followed the table's shape, with a blow either stopped or carried through, made it hurt less to be hit harder: on mail a cut of 120 joules passed 72 joules of crush, while one of 121 joules passed 1, because the larger blow crossed the stop threshold and was handled by the carry-through branch. Taking up to the stop energy and letting the remainder through removes the cliff. Every material therefore needs a test that sweeps blow energy upward in small steps for each damage kind and fails if the total delivered energy ever falls as the blow grows. In networked tests a wolf's lunge of 40 joules cost a person 14 health on a bare arm and 6,7 in a mail hauberk, and the mail took a little less each lunge as it wore.

The result goes three ways. The delivered energy and damage kind go to the target's vitals, where [Armour](Armour.md) and [Health and Wounds](Health-and-wounds.md) turn them into injury, or to the [Building System (Technical)](<Building-system (Technical).md>) damage path for a building piece, where crushing is what stone fears. The recoil momentum goes back to the attacker's strike and body: a stop sets the strike into its recoil phase, and a large recoil staggers the attacker through the movement component. The target push goes to the target's body against its mass and its brace, as a stagger or a knockback. A bite holds the strike in place until the wielder's next input works it free, at a stamina cost, and a carry-through continues the sweep with the strike's speed reduced.

## 8. Blocking and Parrying

A guard is a pose with its own volume: a shield, or a weapon held across the body, swept like any other region as it moves into place, at a speed limited by its own weight. A strike that meets a guard is resolved against the guard's material like any other contact. When it is stopped, the energy the guard absorbs is charged to the defender's stamina through the movement guide's `RequestStaminaSpend`, scaled by the shield's efficiency, and the push goes to the defender's body as a stagger whose size grows with the blow's momentum against the defender's brace. A defender whose stamina cannot pay the whole cost has their guard broken, and the rest of the energy passes through.

The flat values below are the prototype's interim values for creature attacks. They stand in until the blocking simulation described above exists and are not the design, which is the physical model of [Melee Combat](Melee-combat.md#when-a-strike-lands): the cost of a block is the energy of the blow, a shield's weight and size decide what it takes and how quickly it arrives, and a guard that cannot pay breaks. Until then a brace is decided by the guard's state and not by facing alone.

| Rule | Interim value | Status |
|---|---|---|
| Guard raised | the guard action is in its held phase | Provisional |
| Attacker within | 60 degrees of the defender's view | Provisional |
| Energy delivered by a braced blow | a quarter of the blow's energy | Provisional |
| Knockdown | none while braced | Provisional |
| Stamina cost | 0,2 stamina per joule caught | Provisional |
| Exhausted guard | the blow that empties stamina is still braced; with none left the guard breaks at once and cannot be raised until stamina returns | Provisional |

The same guard applies to bites and to a deer's antler strike. Facing the attacker without a raised guard braces nothing: in networked tests at 150 milliseconds every lunge that landed on an unguarded player knocked it down (five of five). With the guard held towards the front of a wolf pack and the player never turning, four of seven landed lunges came from within the 60 degrees and were braced, and three came from outside it and knocked the player down and broke the guard, because the pack lunges from 50 to 110 degrees off the view by design. Turning the guard to the tell stays the player's part.

A parry is a guard met within a short window of its own motion, angled across the incoming blow. It does not absorb the blow; it changes its direction, at a cost proportional to the momentum component it turns aside, and hands the attacker's strike a plane deflection through the same drag channel the mouse uses. A parried heavy strike therefore keeps most of its speed and carries on past the defender, and a light sword can turn a hammer, but a parry made too early or too late is simply a guard in the hammer's path. The parry window is measured against the defender's own timeline in the same way as the guard: the moment the defender's client began the parry motion, with the grace of section 6, decides whether it met the blow in time, so a parry that was on time on the defender's screen counts even when the attacker's view had not yet shown it.

### 8.1 Knockdown

Knockdown is a state of the character's body, entered when the target push of an impact (section 7) beats what the stance can take. The push is weighed against the brace, the defender's stance, stamina and current action, and a guard that can pay for the blow keeps the push below the threshold; a broken guard, an unbraced stance, exhaustion, or an action in progress lower the threshold, and a stagger is the result when the push is large enough to break the action but not to throw the body. The same comparison runs for creatures with their own mass, so weight alone decides which bodies are thrown by which blows.

A knocked-down character stays down for about two seconds, a default a server may override. While down they cannot start a strike, cast, or ready an item; the action slot of section 4.1 refuses those, and any strike or cast in progress is already broken by the fall. They can raise a guard and roll aside, which the same slot accepts. Getting up is an action of its own with a short duration and is broken like any other action by a stagger or a further knockdown, which returns the character to the ground for a fresh span.

## 9. Strength, Stamina, and Technique

The drive behind a strike is computed once per move from the body's stats and situation.

```cpp
FStrikeDrive ComputeDrive(const UStrikeDefinition& Def, const FCharacterStats& Stats, const FLocomotionState& Body,
                          float StanceFactor, float TechniqueEfficiency)
{
    FStrikeDrive D;
    D.TorqueNm = BaseTorqueNm(Stats.MeleeForce) * (Def.bTwoHanded ? TwoHandFactor : 1.f) * StanceFactor;
    if (Body.bWinded) { D.TorqueNm *= WindedTorqueFactor; }    // a winded fighter's strikes start slowly
    D.BrakeFraction = 0.8f;                                      // arms stop a weapon a little less well than they start it
    D.LimbSpeedCapDegS = LimbSpeedCap(Stats.Handling);
    D.StaminaPerJoule = BaseStaminaPerJoule * TechniqueEfficiency;
    return D;
}
```

A weapon's requirements are enforced when it is readied, as a ready action of section 4.1. Each requirement is a plain value, a stat or a skill rank and the minimum it must reach, and the server refuses the ready when any one of them is not met. A weapon that fails the check can be carried, traded, and stored like any item, but it never enters the strike simulation. There are no tiers: each item's values are authored for that item. Above its requirements the torque curve rises smoothly with Melee Force, and Handling raises the limb's speed cap, which is what light weapons are limited by, so Melee Force rewards heavy weapons and Handling rewards light ones without either stat touching the other's weapons directly. Spells carry requirements in the same form, Spell Power and the ranks of their prerequisite spells, checked when a cast action begins, which is the rule [Player Progression](Player.md#requirements-and-commitment) sets for both. Technique from the [Combat Skills](Skills/Combat.md) enters as three bounded factors: stamina efficiency, a tighter glance alignment threshold in the impact table lookup, and a shorter recover phase. None of them touches inertia.

## 10. Creatures and Tools

A creature's attacks are strike definitions on its own body parts, with the creature's mass and muscle in place of a weapon's: a wolf's jaws are a short, light region with a fast cap, a Minotaur's forelimb a heavy one with a long wind-up, and a charge is a body region whose speed comes entirely from the movement guide's gaits. The creature's brain chooses an arc and a target and begins the strike; it has no attack timings of its own, so a creature's tell is the wind-up of its own simulated strike, replicated like any other, and needs no separate cue. Creature strikes resolve against the same impact table, so a great creature that strikes stone is stopped and recoils unless its energy exceeds the stone's, and then the wall takes the blow through the building guide's damage path.

Tools are strike definitions on items. A felling axe, a pick, and a builder's hammer sweep and resolve exactly as weapons do, against trees, rock nodes, and building pieces whose physical materials name their impact rows, and the gathering system reads the delivered energy of each impact to decide how much a blow takes from a trunk or a seam.

## 11. Open Implementation Questions

The first question for the prototype is how much drag a light weapon can allow before directional swings become flailing, and how little a heavy one can allow before they feel unresponsive; `MaxDragDegS` and the momentum scale are tuning, and the weapon table in the specification is the target to tune against. Mouse gesture recognition at the start of a strike needs a dead zone and a short sampling window, and whether that window adds noticeable delay to a light weapon is the second. The server's hit-volume history costs memory per character; 250 milliseconds at the server tick rate of [Server Architecture (Technical)](<Server-architecture (Technical).md>) is the starting budget. Whether creature strikes on large bodies need more spheres per region than the sweep budget allows in a crowded fight is the third. How armour coverage and wounds are represented on the body, and how they consume delivered energy and damage kind, is specified in [Armour](Armour.md) and [Health and Wounds](Health-and-wounds.md) and still needs its own technical guide. Holding through the end of an action replaces the input buffer most combat systems need, because a held button begins the next strike in the same move the last one completes. Whether a bow's `ReleaseThreshold` near half the draw reads clearly to players, and whether a tap on a heavy weapon, which wastes a wind-up by design, feels like a deliberate cost or a misfire, are questions for play; any change should be proposed as a change to [Actions](Actions.md) rather than added quietly.

## 12. Design Validation Cases

| Case | Expected result |
|---|---|
| A fighter who just meets a war hammer's Melee Force requirement swings it, then a fighter with far more Melee Force swings the same hammer. | The weaker fighter's wind-up is visibly slower and the hammer reaches its peak later in the arc; the stronger fighter's blow lands with more energy at the same point. |
| A dagger strike is begun, feinted, and redirected twice. | Each stop and turn is near-instant and costs almost no stamina. |
| A greatsword strike is checked early in its wind-up, and another near the end of its swing. | The early check is cheap and quick; the late one costs most of a stamina pool and the blade still travels a long way before it stops. |
| A sword cut lands on a plate breastplate at a poor angle. | The blow glances, delivers little energy, and the sword recovers quickly. |
| A war hammer is brought down on a raised wooden shield. | The block holds, the defender is staggered and charged stamina for the energy absorbed, and the hammer's momentum is not reflected back as recoil. |
| A war hammer misses and strikes a stone wall. | It stops dead; the attacker recoils and staggers, and the client shows the impact at once. |
| A felling axe bites into a door. | It sticks and must be worked free with a further input and a stamina cost. |
| A player on 150 ms latency lands a sword cut on a sidestepping opponent who was in the blade's path on the attacker's screen. | The server, rewinding the target to the attacker's view time, confirms the hit. |
| A player holds the primary button with a sword. | Strikes follow one another as each completes, each taking its direction from the mouse or flowing from the last, until stamina no longer covers a strike. |
| A player lets go of the primary button halfway through a greatsword swing. | The strike enters its stopping phase, pays the physical cost, and nothing new begins. |
| A player taps the primary button with a war hammer. | The wind-up begins and stops almost at once; the stamina spent getting the head moving is lost. |
| A player holds the secondary button with a shield, then lets go. | The shield rises and stays up, charging stamina for each blow it catches, and lowers on release. |
| A player holds a bow at full draw, then lets go; then lets go early in a second draw. | The first draw holds at anchor with a growing stamina cost and aim sway, and looses on release; the second lowers the bow with no shot. Neither draw is followed by another. |
| A player selects a potion on the hotbar while a sword cut is under way. | Nothing happens and nothing is queued; selecting it again once the cut has ended begins readying the potion. |
| A player is staggered by a hammer blow halfway through eating. | The meal ends as broken, the share already eaten takes effect, and nothing new can begin until the hands return to guard. |
| A player readies a bandage from a belt pouch, then the same bandage from inside their pack. | The pouch takes a moment; the pack takes several seconds with both hands busy. |
| A Minotaur's swipe begins while a player watches. | The slow wind-up is visible on every client at the same arc position the server simulates; stepping in before the swing gathers speed meets a weak blow. |
| A winded fighter swings a greatsword. | The wind-up is slower than when fresh and the strike lands with less energy at the same point in its arc. |

## 13. Further Reading

- [Understanding Networked Movement in the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine)
- [Physical Materials User Guide](https://dev.epicgames.com/documentation/unreal-engine/physical-materials-user-guide-for-unreal-engine)
- [Motion Matching](https://dev.epicgames.com/documentation/unreal-engine/motion-matching-in-unreal-engine)
- [First Person Rendering](https://dev.epicgames.com/documentation/unreal-engine/first-person-rendering)

## Continue Reading

Continue with the [Melee Combat specification](Melee-combat.md) this guide implements, [Movement (Technical)](<Movement (Technical).md>) for the body and move it runs inside, [Creature Riding (Technical)](<Creature-riding (Technical).md>) for mounted strikes and charges, and [Building System (Technical)](<Building-system (Technical).md>) for the damage path of building pieces.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
