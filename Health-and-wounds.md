# Health and Wounds

A body in this world is hurt where it is hit. Every character and every creature carries one measure of how close it is to death, its health, and a record of what has been done to it, its wounds. Health decides whether a body lives; wounds decide how well it can move, fight, and recover while it does. A cut across the thigh does not simply take a slice off a bar: it slows the leg it opened, it bleeds until someone binds it, and it is still there tomorrow if nobody treats it. The same rules hold for a player, a wolf, and a horse, so a hunter who wounds a deer's leg can run it down, and a wolf pack that has opened a traveller's arm knows the fight has turned. This document sets out how damage becomes injury, how injury heals, and what ends a life. What a blow delivers in the first place is set out in [Melee Combat](Melee-combat.md#when-a-strike-lands), and what stands between the blow and the body in [Armour](Armour.md). The implementation of the model is in [Health and Wounds (Technical)](<Health-and-wounds (Technical).md>).

## Health

Health is the body's reserve against death, and its size comes from the Health stat of [Player Progression](Player.md#stat-point-allocation), and for a creature from its species and its size. When health reaches zero the body dies at once. There is no downed-and-revived state between alive and dead, and no second chance from an ally standing over a body; the blow, the fall, or the last of the blood that took the health away is the death, and what follows is the corpse and the recovery set out in [Death and Loss](Death-and-loss.md). Being thrown to the ground by a heavy blow is a different thing: a knocked-down character is still alive and on their own, and is back on their feet within seconds, as [Stagger and Knockdown](Melee-combat.md#stagger-and-knockdown) sets out.

Death keeps track of whose doing it was. A character who bleeds out from a wound another player gave them, or dies of a fall while staggering from a blow, has died to that player exactly as if the blow had killed them outright, with everything that means for loot and bounties under [Conflict and PvP](Conflict-and-pvp.md). A wound remembers who dealt it until it has been treated, so fleeing with a deep cut and dying a minute later is not an escape from the full-loot rules, and binding the wound is what ends the attacker's claim.

## Where a Blow Lands

Every blow lands somewhere. A person's body is divided into the head, the torso, each arm, and each leg; a creature's into whatever its body is, a wolf's head, body, forelegs, and hindlegs, or a serpent's head and the length behind it. The place a weapon or a claw meets the body is the place it strikes, decided by where the strike actually connects rather than by chance, so an overhead blow lands on the head and shoulders of a target who did not get a guard up, and a low cut takes the legs.

A blow arrives as energy of a kind, cut from an edge, pierce from a point or a fang, crush from a hammer, a fist, or a fall, as [Melee Combat](Melee-combat.md#when-a-strike-lands) describes. Armour meets it first and takes what it can. What passes through costs health in proportion to the energy that reached the body, and a blow heavy enough for the region it struck also leaves a wound there.

## Wounds

A wound is an injury to one region, and its kind follows from what caused it. Cuts open the flesh and bleed. Deep pierces bleed and can strike deeper than they look. Crushing blows bruise, and heavy ones fracture bone. Fire and the burning spells of [Magic](Magic.md) leave burns that weaken the region and sting every time it is used. Each wound has a severity, from a scratch that does nothing but mark the body, through light and serious wounds, to a grave one that takes the region out of use. A body keeps at most one wound of each kind in each region, and a further blow of that kind does not add a second wound but raises the first: a second light cut on the same arm makes it a serious cut. Falls wound the same way, as crushing force delivered to the legs, at the heights [Movement](Movement.md#jumping-crouching-and-falling) sets out: a fracture of both legs at around seven metres, death at around thirteen.

What a wound does depends on where it is, and every effect is felt through the systems the body already runs on.

- A wounded leg slows the body through the gait roles of [Movement](Movement.md): a deep cut takes away the sprint, a fracture leaves only a limping walk, and either one makes a jump a gamble.
- A wounded arm weakens the force behind every strike that arm drives, as [Melee Combat](Melee-combat.md#strength-stamina-and-technique) measures it, and a fractured arm cannot hold a two-handed weapon or bring a shield up against a heavy blow.
- A wounded torso shortens the breath: the stamina pool refills more slowly and, with a serious wound, cannot fill completely.
- A wounded head dazes, as the next section describes.

Wounds are visible. A limping stride, an arm held close, a hand pressed to the ribs, and blood on the clothes are all on the body other players and creatures see, so a wound is information as much as an injury, and a careful opponent reads it the way they read a winded breath.

## The Head

The head is the most dangerous place to be hit. As server defaults, a joule of energy that reaches the head costs 1,5 health against 0,5 on the torso, so a blow to the head costs three times as much as the same blow to the chest. It also dazes: the view blurs and darkens at the edges, the ears ring and the world's sounds dull, and the body staggers, for 0,05 seconds per joule that reaches the head, up to a longest daze of 6 seconds. A dazed fighter cannot begin an action until their head clears. A blow that delivers 150 joules to the head kills outright, whatever health the body had left, which a heavy weapon brought down on an unprotected head can do and the same weapon on a helmet cannot.

This is why a helmet is the single most valuable piece of armour a fighter owns, and why the choice of helmet in [Armour](Armour.md#helmets-sight-and-hearing) weighs protection against how much of the world the wearer can still see and hear. The presentation of a daze can be softened through the comfort options of [Accessibility](Accessibility.md); its length and its effect on what the dazed character can do cannot.

## Bleeding

Deep cuts and pierces bleed. A bleeding body loses health steadily, faster the more severe the wound, until the bleeding is stopped by a bandage, by cauterising the wound with fire, or by healing magic such as [Mending Light](Magic/Spells/Light/Mending-light.md). As server defaults, a serious bleed costs 1,2 health a second, which empties a person's 100 health in about 80 seconds, and a light bleed costs 0,4 a second, which does the same in about four minutes. A scratch, and in a creature a light bleed, clots after about 20 seconds and stops on its own; a light bleed in a person, a serious bleed, and a grave one run until they are treated.

Bleeding leaves a trail. Drops of blood mark the ground behind a wounded body and stay there for a while, and creatures with a nose for it can follow it, so a wounded traveller who flees through the forest is followed, not lost. Predators treat a bleeding body as they treat a winded one, as the weakest prey in reach, in the same way set out in [Movement](Movement.md#creatures-and-mounts). The rule works for players as well: a hunter who opens a deer and loses sight of it can follow the blood.

This is where light weapons find their purpose against armour. A dagger that slips through the gap at an armpit does little damage in the moment, but the bleed it opens keeps working after the fight has moved on, while a hammer does its harm in the moment of the blow.

## Recovery and Treatment

Health returns slowly on its own, and only while the body has the fuel for it. Healing draws on food, as [Survival](Survival.md#the-bodys-fuel) sets out, so a fed character recovers health gradually as they go about their business, and much faster while resting in a bed or a proper shelter, while a starving one recovers nothing.

Wounds do not heal past a point by themselves. A scratch closes, a bruise fades, but a bleeding wound needs binding, a fracture needs a splint and then rest, and a wound left dirty in the wrong country, above all the [Swamp](Biomes/Swamp.md), turns to infection and worsens until it is treated with the remedies of [Crafting](Crafting.md). Treating a wound is an action under [Actions](Actions.md): binding a cut takes both hands and a few seconds, setting a bone takes longer, and none of it can be done mid-fight without giving the fight away. Treatment stops the wound from getting worse; healing it back to nothing takes time and rest, or magic.

## Killing Blows

A living body never loses a limb. Severed limbs and taken heads, the brutality set out in [Content and Tone](Content-and-tone.md), happen only as the blow that kills: a two-handed cleave that ends a fight can take an arm with it, and a heavy blow to the neck can take the head. Because death is instant at zero health, the finishers of [Combat Skills](Skills/Combat.md#brutality-and-finishers) are the killing blow itself, resolved from the weapon, the region struck, and the energy of the blow. Everything short of death leaves a body broken, cut, or bruised, and every one of those can be healed.

## Creatures

Creatures are hurt and heal by the same rules. A wolf with a cut foreleg limps and cannot keep up with its pack; a buffalo with a fractured leg cannot run with the herd and becomes the herd's weakest animal; a creature bleeding from a deep wound leaves a trail and weakens until it dies or the bleeding stops. A creature's light bleed clots on its own after about 20 seconds, as a scratch does in a person, but a serious or grave bleed runs until the creature is treated or dies. This is what lets a pack bleed prey down: one bite leaves a bleed that closes by itself, repeated bites on the same place raise the wound to serious, and the deer that outran the first rush is dying by the time it stops. Wild creatures recover by resting in their dens and lairs, so a creature driven off wounded returns later, slower to heal than a player under a healer's care but healing nonetheless. The injuries of a tamed mount, its wounds and its lame legs, are this same model, as [Creature Riding](Creature-riding.md#care-and-tack) treats them.

## Continue Reading

Continue with [Health and Wounds (Technical)](<Health-and-wounds (Technical).md>) for the implementation of this model, [Armour](Armour.md) for what stands between a blow and the body, [Melee Combat](Melee-combat.md) for the blows themselves, [Death and Loss](Death-and-loss.md) for what follows when health runs out, and [Survival](Survival.md) for the care that lets a body recover.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
