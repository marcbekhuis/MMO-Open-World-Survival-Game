# Health and Wounds in Unreal Engine 5

A technical design and implementation research guide based on the [Health and Wounds specification](Health-and-wounds.md).

## Research Baseline

This guide follows the same Unreal Engine 5.8 baseline as [Movement (Technical)](<Movement (Technical).md>), whose body model it extends. Epic publishes no wound, bleeding, or body-region damage model: the Gameplay Ability System offers attributes and effects for a single health value, but a per-region wound record with escalation, bleeding, and attribution is this project's own design, built from documented parts. The engine facts used below are the physical materials that name an armour row, which [Melee Combat (Technical)](<Melee-combat (Technical).md#7-impact-resolution>) already relies on, and the character movement component's networked-move behaviour, which the condition merge of section 6 respects. The code is an implementation sketch: it shows the shape of the data and the order of the logic, and every call needs validating against the engine version in use before it becomes production code.

The migration boundary is the one the movement and server guides set. Body plans, wounds, bleeds, and the rules that turn energy into injury are plain data and pure functions, specified independently of Unreal actors. Unreal supplies the contact point, reads the conditions the wounds produce, and replicates what players see. Who commits a hit when attacker and target sit on different region servers is an open question of the [Design Backlog](Design-backlog.md); everything below assumes both bodies are simulated by one server.

---

## Table of Contents

1. [One Vitals Model](#1-one-vitals-model)
2. [Body Plans and Regions](#2-body-plans-and-regions)
3. [From Hit to Injury](#3-from-hit-to-injury)
4. [Wound Records](#4-wound-records)
5. [Bleeding and Attribution](#5-bleeding-and-attribution)
6. [Injury Reaches Movement](#6-injury-reaches-movement)
7. [Server Defaults](#7-server-defaults)
8. [Design Validation Cases](#8-design-validation-cases)
9. [Further Reading](#9-further-reading)

---

## 1. One Vitals Model

Players, wild creatures, and tamed mounts share one component and one set of rules, as the specification requires. `UVitalsComponent` lives on every body, runs on the server only, and owns three things: the current health, the list of wounds, and the list of active bleeds. Armour, melee, falls, fire, and hunger all end by calling it; none of them reduces health directly.

```
Strike / fall / burn ──► FDamageEvent (energy, kind, contact point, instigator)
                              │
                              ▼
                  UVitalsComponent::ApplyDamage      ──► health, wounds, bleeds (server only)
                     │ find region by contact point        │
                     │ armour layers, outside in           ▼
                     │ cost health, raise wound      Conditions (named sources)
                     ▼                                       │
               Death (health <= 0)                            ▼
               carries the instigator            ULocomotionMovementComponent merges them
```

Clients never run any of it. They receive the health a player may see, the visible wound state of every nearby body (a limp, a held arm, blood on the clothes), and the events that drive the daze and the camera.

## 2. Body Plans and Regions

Each species and each player body carries a body plan: a list of regions, every one a box in the body's own space.

```cpp
UENUM()
enum class EBodyRole : uint8 { Head, Torso, Arm, Leg };

UENUM()
enum class EDamageKind : uint8 { Cut, Pierce, Crush, Burn };

USTRUCT()
struct FBodyRegion
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere) FName      Name;                  // "Head", "ForelegLeft"
    UPROPERTY(EditAnywhere) EBodyRole  Role = EBodyRole::Torso;
    UPROPERTY(EditAnywhere) FBox       BoxCm;                 // in body space, centimetres
    UPROPERTY(EditAnywhere) float      HealthPerJoule = 0.5f;
    UPROPERTY(EditAnywhere) FName      NaturalArmourMaterial; // names a row of the impact table
    UPROPERTY(EditAnywhere) float      WoundJoules[4][3] = {};  // per damage kind: light, serious, grave thresholds
};

UCLASS()
class UBodyPlan : public UPrimaryDataAsset
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere) TArray<FBodyRegion> Regions;
    UPROPERTY(EditAnywhere) float MaxHealth = 100.f;          // players: from the Health stat; creatures: species and size
};
```

The regions are boxes, not bones, for the reason the creature attack shapes already follow (see the [Taming and Control (Technical)](<Taming-and-control (Technical).md#21-species-data>) body group): a dedicated server does not animate the skeleton of a body nobody renders, so a bone's position on the server is the reference pose and not where the head is on the client. A box in body space moves rigidly with the actor and is the same on the server and on every client, so a hit resolved on the server lands where the victim's body was. The region a head box belongs to is also what the specification's helmet and gap rules key on.

A region carries its own health cost per joule, which is how the head costs three times the torso; its own natural armour, a material row name that stands for hide, scale, shell, or bare skin; and the energy at which each damage kind first leaves a light, serious, or grave wound there.

## 3. From Hit to Injury

A hit arrives as energy of a kind at a contact point, produced by the impact resolution of [Melee Combat (Technical)](<Melee-combat (Technical).md#7-impact-resolution>) or by a fall, a fire, or a creature's attack shape.

```cpp
USTRUCT()
struct FDamageEvent
{
    GENERATED_BODY()

    float        EnergyJ = 0.f;           // as delivered by the impact, before this body's armour
    EDamageKind  Kind = EDamageKind::Cut;
    FVector      ContactPointBody;        // in body space
    TWeakObjectPtr<AActor> Instigator;
};
```

The component finds the region whose box contains the contact point, and the nearest box when the point lies on a seam. The energy then meets the armour layers from the outside in: each worn piece covering the region, then the region's natural armour. Each layer is a row of the same impact table that Melee Combat defines, so this guide does not restate how a layer stops or passes energy; what leaves the innermost layer is the energy that reached the body.

```cpp
void UVitalsComponent::ApplyDamage(const FDamageEvent& E)
{
    const FBodyRegion* R = Plan->FindRegion(E.ContactPointBody);
    float J = E.EnergyJ;
    for (const FArmourLayer& L : LayersCovering(*R))          // outside in
        J = L.Pass(E.Kind, J);                                 // glance, stop, or carry through
    J = R->NaturalArmour().Pass(E.Kind, J);

    Health -= J * R->HealthPerJoule;
    RaiseWound(*R, E.Kind, J, E.Instigator);                   // section 4
    if (R->Role == EBodyRole::Head) ApplyDaze(J);              // 0.05 s per joule, capped
    if (Health <= 0.f || (R->Role == EBodyRole::Head && J >= HeadKillJoules)) Die(E.Instigator);
}
```

Death is immediate at zero health. There is no downed state to model, and the killing blow is resolved by the finisher rules of [Combat Skills](Skills/Combat.md#brutality-and-finishers) from the same region and energy. The instigator is stored with the death so full-loot and reputation rules see who caused it.

## 4. Wound Records

A body holds at most one wound per region and kind. A second blow of a kind that already wounds the region raises the existing record's severity instead of adding another, so the record stays small and every effect of the specification reads from at most one wound per region and kind.

```cpp
UENUM()
enum class EWoundSeverity : uint8 { None, Scratch, Light, Serious, Grave };

USTRUCT()
struct FWound
{
    GENERATED_BODY()

    UPROPERTY() uint8           RegionIndex = 0;
    UPROPERTY() EDamageKind     Kind = EDamageKind::Cut;
    UPROPERTY() EWoundSeverity  Severity = EWoundSeverity::Scratch;
    UPROPERTY() double          DealtAtServerTime = 0.0;
    UPROPERTY() TWeakObjectPtr<AActor> DealtBy;     // kept until treated
    UPROPERTY() bool            bTreated = false;
};
```

`RaiseWound` picks the severity the delivered energy earns from the region's thresholds for that kind. If a wound of that region and kind exists, the result is the higher of its severity and the earned one, and one step higher when the earned severity equals the existing severity: a light cut met by a second light cut becomes serious. A grave wound stays grave. This is how repeated bites make a serious bleed on a creature that one bite would only have scratched.

Treatment sets `bTreated` and stops escalation and bleeding; it does not remove the wound. Time and rest, or healing magic, step the severity down. Infection is a later step-up that the [Swamp](Biomes/Swamp.md) ground and the remedies of [Crafting](Crafting.md) drive through the same record.

## 5. Bleeding and Attribution

A cut or a pierce at light severity or above opens a bleed. The bleed is not a second record: it is a rate the wound's severity maps to, summed over all untreated wounds, and the component applies it as a single health drain per second.

A scratch, and for a creature a light bleed, clots on its own after a clotting time of about 20 seconds from the moment the wound was dealt or last raised. Serious and grave bleeds, and a light bleed on a person, run until the wound is treated. The server holds the clot as a timestamp compared against server time, never a ticking timer, so a body in an unloaded cell settles correctly when it is next touched.

```cpp
float UVitalsComponent::BleedPerSecond(double Now) const
{
    float Rate = 0.f;
    for (const FWound& W : Wounds)
    {
        if (W.bTreated || !OpensBleed(W.Kind)) continue;
        if (ClotsByItself(W.Severity, Species) && Now - W.DealtAtServerTime >= ClotSeconds) continue;
        Rate += Rules->BleedPerSecond[(int32)W.Severity];
    }
    return Rate;
}
```

A body that dies from a bleed dies to whoever dealt the wounds still untreated: `DealtBy` of the highest-severity open bleeding wound is the instigator of that death, so fleeing with a deep cut and dying later does not escape the full-loot rules, and binding the wound ends the claim. A death from a fall during a stagger caused by a blow is attributed to the blow's instigator the same way, through the stagger's recorded cause.

The server drops a blood decal or marker at an interval proportional to the bleed rate, as light replicated data that creatures with a nose read through the perception layer of [Taming and Control (Technical)](<Taming-and-control (Technical).md#73-perception-and-fear>); the visual stain is a client cosmetic of the same event.

## 6. Injury Reaches Movement

Injury is one named condition source among several. The movement component does not read wounds; it reads a list of sources, each a small struct that states its own effects and its own name, and merges them into the single `FLocomotionConditions` of [Movement (Technical)](<Movement (Technical).md#3-intent-state-and-conditions>).

```cpp
USTRUCT()
struct FConditionSource
{
    GENERATED_BODY()

    UPROPERTY() FName     Name;                       // "Injury", "Load", "Survival", "Stats"
    UPROPERTY() float     TopSpeedScale = 1.f;
    UPROPERTY() float     AccelerationScale = 1.f;
    UPROPERTY() float     RecoveryScale = 1.f;
    UPROPERTY() float     PoolScale = 1.f;
    UPROPERTY() EGaitRole RoleCap = EGaitRole::Burst;
};
```

The merge is fixed: scales multiply, and the role cap takes the lowest. A deep leg cut that caps the body at a jog and a heavy load that caps it at a walk produce a walk, and neither source overwrites the other, because each owns only its own named entry and the movement component owns the result. The injury source is rebuilt whenever a wound is raised, treated, or stepped down, and from the leg wounds alone: a serious cut takes the sprint, a fracture leaves a limping walk, a wounded torso lowers `RecoveryScale` and, at serious, `PoolScale`, and a wounded arm is read by the strike's force rather than by the gait. Movement owns what a change in a condition costs a running player and how the change is carried in the move to avoid a correction burst; this guide only writes the source, and does not restate that mechanism.

## 7. Server Defaults

Every number is an overridable default, in line with [Server Settings](Server-settings.md#official-and-community-servers). The thresholds that make a wound light, serious, or grave per region and kind are species and body plan data, not one global table.

| Setting | Default | Notes |
|---|---|---|
| Health per joule, head | 1,5 | Three times the torso |
| Health per joule, torso | 0,5 | Arms and legs are set per body plan |
| Daze per joule to the head | 0,05 s | Capped at 6 s |
| Outright kill, head | 150 J delivered | After armour |
| Serious bleed | 1,2 health/s | About 80 s to empty 100 health |
| Light bleed | 0,4 health/s | About four minutes to empty 100 health |
| Clotting time | about 20 s | Scratches, and light bleeds on creatures |
| Fall crush | 25 J per leg per metre beyond 4 m | Defined in [Movement](Movement.md#jumping-crouching-and-falling); about 7 m fractures both legs, about 13 m kills |

Falls enter through `ApplyDamage` as crush at each leg's contact point, produced by the landing step of the movement component, which Movement (Technical) specifies. In networked tests at 150 milliseconds of latency, drops of 7,1 to 7,4 metres fractured both legs and left the body limping at 0,9 metres a second, and drops of 13,1 to 13,5 metres killed.

## 8. Design Validation Cases

| Case | Expected result |
|---|---|
| The same 40 joules reach a person's head and torso with no armour. | The head takes 60 health and a 2 s daze; the torso takes 20 and no daze. |
| A blow delivers 150 joules to an unhelmed head, then to a helmed one whose layers stop most of it. | The first kills at once; the second does not. |
| A person takes a light cut on the right arm, then a second light cut on the same arm. | One wound record on the arm, now serious; the bleed rate rises from 0,4 to 1,2 a second. |
| A wolf takes one bite to the foreleg, then none. | The light bleed clots after about 20 seconds and the foreleg's effect lapses with it. |
| A pack bites the same hindleg of a deer three times in a chase. | The wound is serious, the bleed does not clot, and the deer dies of it unless it escapes and is treated. |
| A person flees with a serious cut dealt by another player and dies 70 seconds later. | The death is credited to that player; had the wound been bound first, it is not. |
| A body with a serious leg cut and a load that caps it at a walk. | The movement component grants a walk; removing the load leaves the injury's cap, not the load's. |
| A drop of 7 metres, then 13 metres. | The first fractures both legs and leaves a limp; the second kills. |

## 9. Further Reading

- [Physical Materials User Guide](https://dev.epicgames.com/documentation/unreal-engine/physical-materials-user-guide-for-unreal-engine)
- [Understanding Networked Movement in the Character Movement Component](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine)
- [Gameplay Ability System](https://dev.epicgames.com/documentation/unreal-engine/gameplay-ability-system-for-unreal-engine)
- [Using Gameplay Tags in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/using-gameplay-tags-in-unreal-engine)

## Continue Reading

Continue with the [Health and Wounds specification](Health-and-wounds.md) this guide implements, [Melee Combat (Technical)](<Melee-combat (Technical).md>) for the impact that produces a damage event, [Movement (Technical)](<Movement (Technical).md>) for the conditions injury feeds and the falls that wound, and [Taming and Control (Technical)](<Taming-and-control (Technical).md>) for the creature attack shapes and perception that share its reasoning.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
