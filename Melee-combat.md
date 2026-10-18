# Melee Combat

Every blow in the world is a weight being moved by muscle. A dagger, a war hammer, a woodcutter's axe, a wolf's jaws, and a stone giant's fist all obey the same few physical facts: a heavy thing is slow to start, fast once it is moving, and hard to stop, while a light thing starts and stops almost at once and goes where it is pointed. Melee here is built on those facts rather than on fixed attack timings, so a fight reads the way a real one does. A greatsword's wind-up is the moment to step in, its full swing is the moment to be somewhere else, and a dagger never gives anyone either window. This document sets out that shared model of weighted strikes for players and creatures alike. It sits beside the shared body of [Movement](Movement.md), and its implementation in Unreal Engine 5 is set out in [Melee Combat (Technical)](<Melee-combat (Technical).md>). The skills that grow a fighter's technique are described in [Combat Skills](Skills/Combat.md).

## Weight in Motion

A strike moves a mass along an arc, and how it moves follows from three things: how much the weapon weighs, where that weight sits, and how much force the arms and body behind it can put in. A weapon whose weight sits far from the hands, the head of a hammer or the long blade of a greatsword, is far harder to set turning than its weight alone suggests, and just as hard to stop. A weapon whose weight sits close to the hands answers the wrist.

Every strike therefore has a shape. It begins slowly while the muscles work to get the weight moving, gathers speed through the arc, and keeps that speed through and past its target unless something takes it away. A light weapon reaches the fastest its wielder's arm can move almost as soon as the strike begins and holds that speed steadily, which gives it control and consistency but caps how hard it can land. A heavy weapon spends most of its arc gathering speed and may never reach the arm's limit, but once it is there it carries a weight of momentum no light weapon can match. A strike that meets its target early in its arc lands with a fraction of its force, which is why stepping into a heavy swing before it is moving is the oldest answer to it.

The table gives target values for a fighter of ordinary strength, two-handed where the weapon is.

| Weapon | Mass | Reaches full speed | Character in a fight |
|---|---|---|---|
| Dagger | 0,3 kilograms | Almost at once | Constant speed, free feints, light blows that rely on finding a gap |
| Arming sword | 1,1 kilograms | About a quarter of a second | Quick and controllable, the baseline other weapons are judged against |
| Spear | 2,0 kilograms | About a third of a second, as a thrust | Fast along its line, slow to bring round across it |
| Greatsword | 3,0 kilograms | About two thirds of a second | A slow, readable wind-up and a sweep that is very hard to stop |
| War hammer | 4,0 kilograms | About three quarters of a second | The slowest start and the heaviest arrival, crushing through blocks and armour |

## Directing a Strike

A strike is held, not clicked: it begins when the primary button goes down and lasts as long as the button stays down, and holding it through the end of one strike begins the next, as [Actions](Actions.md#holding-to-act) sets out. A player chooses where each strike comes from by how they move the mouse as it begins: a downward motion gives an overhead blow, a sideways one a cut from that side, an upward one a rising strike, and a separate input gives a thrust. Once a strike is under way the mouse can still bend it, dragging the arc down onto a crouching target or round to follow one who sidesteps, but only as fast as the weapon's weight allows. A dagger follows the hand almost freely. A war hammer in mid-swing can be leaned a little, and no more, which is exactly the turning rule of [Movement](Movement.md#turning-and-facing) applied to the weapon: the more momentum it has, the wider its arc must be.

The body takes part in every strike. Feet planted and hips turning put more force behind a blow than a strike thrown off-balance or while backpedalling, and a strike made while running adds the body's own speed to the weapon's, so a running overhead blow lands harder than a standing one at a price in control. A heavy weapon pulls its wielder with it in turn. While a heavy strike is in motion the body turns more slowly and cannot sprint, and a heavy swing that meets nothing carries the body round with it, leaving a fighter facing away from where they meant to be for a moment that a watching opponent can use.

A strike is an action, and a character performs one action at a time, as [Actions](Actions.md) sets out. Nothing else begins, no second strike, no spell, no reach for a potion, until the strike has run its course or been stopped and the hands are back in guard. Raising a shield or a parrying blade is an action of its own, so a fighter mid-swing cannot also block, and the choice between striking and guarding is made one moment at a time.

## Stopping and Feinting

Any strike can be stopped by letting go of its button, and stopping costs exactly what physics says it should. Taking a weapon's speed away takes force and time in proportion to the momentum it carries, and every bit of that work is paid in stamina. A dagger can be stopped and turned at any point of its arc for almost nothing, so a light weapon feints as freely as its wielder likes. A greatsword can be checked cheaply early in its wind-up, at a real cost halfway through, and hardly at all near the end of its arc, where trying to stop it costs most of a stamina pool and still lets it carry a long way. There is no rule that a strike is committed after some fixed moment; the weight decides, and a skilled fighter learns where along the arc each weapon stops being theirs to recall.

Feints therefore belong to light weapons, and commitment to heavy ones. Both are readable: an opponent who watches a hammer begin to move knows how much of that swing can still be taken back, and an opponent facing a dagger knows that nothing it does is final.

## When a Strike Lands

What happens when a weapon meets something is decided by the weapon's mass and speed at the moment of contact, the part of the weapon that strikes, and what it strikes. Damage comes from that impact, not from a figure attached to the weapon, so a blow that lands late in a full arc is devastating and one that lands early or glancing is weak. What armour stops and what reaches the body as injury are set out in [Armour](Armour.md) and [Health and Wounds](Health-and-wounds.md).

Light weapons meet hard things and lose. A sword cut against plate glances, a dagger turned on a shield skids off, and in both cases the weapon loses little of its speed sideways and recovers quickly; its power lies in finding the gap, the throat, the joint, the unarmoured back, rather than in going through. Heavy weapons meet hard things and win, or break themselves against them. A war hammer brought down on a raised shield does not glance: the block holds the hammer out, and the full weight of the blow goes into the shield-bearer, who is staggered, driven back, and charged stamina in proportion to what they absorbed. The same hammer swung into a stone wall stops dead, and the momentum that went into nothing comes back up the haft as a jarring recoil that staggers its wielder. An edge driven hard into wood bites and holds, so an axe buried in a door or a shield has to be wrenched free, and a heavy blade that cuts through something soft carries on through with what speed it has left and can strike again behind it.

Blocking and parrying follow from the same rule. The guard is held on the secondary button and lowered by letting go. A block absorbs a blow, and the cost of a block is the energy of the blow it catches, so blocking a dagger is cheap and blocking a war hammer is expensive however good the shield. A parry turns a blow aside instead of absorbing it, and costs only the small part of the blow's momentum needed to change its direction, which is why a well-timed parry with a light sword can turn even a heavy strike, and why a mistimed one leaves the parrying blade in the heavy weapon's path. A shield's own weight and size decide how much it can absorb and how quickly it can be brought to where the blow is coming from.

## Strength, Stamina, and Technique

Strength is the muscle behind every strike, and the stat that measures it is Melee Force, among the stats of [Player Progression](Player.md#stat-point-allocation). Melee Force is the force that accelerates and stops a weapon, so a fighter with more of it swings a war hammer far faster than one with less, and a weapon held in two hands has more force behind it than the same weapon in one. Handling raises how fast the arms themselves can move, which is what limits a light weapon, so Melee Force rewards heavy weapons and Handling rewards light ones.

A weapon can also ask for a minimum before it can be fought with at all. Each weapon belongs to a family, such as heavy hammers, greatswords, or daggers, and its requirements are plain values: a Melee Force and a rank in that family's [Combat Skills](Skills/Combat.md). A crude stone maul or a plain iron war hammer asks for little or nothing, so a new character who wants to try the heavy weapon life can start there on the first day. A great war hammer forged from the rarest metals of the deep places asks for a great deal, because it is larger, heavier in the head, and only wielded well by someone who has trained for it. Below a weapon's requirements it can be carried, sold, traded, or hung on a wall, but not fought with, so a character built as a mage who finds such a hammer in a ruin owns a valuable thing to sell or to give to a friend, not a weapon they can swing. The principle is the same for spells, as [Player Progression](Player.md#requirements-and-commitment) sets out.

Stamina pays for the work. Each strike costs stamina in proportion to the effort of starting it and, if it is checked, of stopping it, from the shared pool of [Movement](Movement.md#stamina), so a long fight with a heavy weapon drains a fighter far faster than one with a sword. A winded fighter's strikes start slowly whatever they hold, and a winded fighter with a war hammer is a fighter waiting to be killed.

Technique is what the [Combat Skills](Skills/Combat.md) grow. A practised fighter wastes less effort, so the same swing costs less stamina; aligns the edge better, so fewer blows glance; and recovers sooner after a heavy swing has run its course. Technique never makes a war hammer light. It makes a fighter better at living with its weight.

## Creatures

Creatures strike by the same rules, with their own limbs, jaws, tails, and bodies as the weight. A wolf's bite is a light strike: fast, controllable, and repeated, snapping at a leg and gone before a counter lands. A [Minotaur](Creatures/Minotaur.md)'s swipe is a heavy one, and its wind-up is the shoulders drawing back before the arm comes round, a tell that exists because the weight has to be got moving rather than because a designer placed it there. A [Stone Giant](Creatures/Stone-giant.md)'s fist starts so slowly that a player can see it coming from the far side of a clearing, and once it is moving nothing a player can raise will stop it; the only answer is not to be where it lands. A charge is the whole body used as the weight, built by the gaits and momentum of [Movement](Movement.md), which is why it hits hardest and turns least.

The impact rules apply to creatures in full. A creature that sinks its teeth into a shield is held off by it; a great creature that strikes a stone wall stops against it and is staggered by its own blow, or, if it is heavy enough, breaks the wall, which is the crushing force the [Building System](Building-system.md) fears from the weight of great creatures. A creature's strikes also cost it stamina, so a beast that has been made to swing and miss tires, and the shared signs of a winded body tell a player when it has.

## Tools and Labour

The same model covers every swing that is not a fight. A woodcutter's axe, a miner's pick, and a builder's hammer are weights moved along an arc, and they bite, glance, and recoil by the same rules: a heavy felling axe takes a deep bite from a trunk at a high stamina cost, a light hatchet takes many shallow ones, and a pick driven into hard rock with too little behind it jars back up the arm. Gathering therefore rewards the right tool and the strength to use it, and the raider with a pickaxe working at a stone wall in the [Building System](Building-system.md) is spending real effort on every blow. How resources are worked, run out, and come back is set out in [Gathering](Gathering.md).

## Continue Reading

Continue with [Melee Combat (Technical)](<Melee-combat (Technical).md>) for how weighted strikes are built in Unreal Engine 5, [Combat Skills](Skills/Combat.md) for the techniques fighters learn, [Movement](Movement.md) for the body behind every strike, and [Conflict and PvP](Conflict-and-pvp.md) for the fights these weapons settle.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
