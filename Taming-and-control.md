# Taming and Control

In many games, taming a [creature](Creatures.md) grants permanent control. Here control is a bond that has to be kept, won through one of three methods and maintained for as long as the creature serves. The stronger the bond, the better a creature answers its handler, above all when it is ridden.

This document is the conceptual design. Its implementation in Unreal Engine 5 — the bond records and methods, shelter evaluation, elapsed-time catch-up, and the creature AI that riding and flight call into — is set out in [Taming and Control (Technical)](<Taming-and-control (Technical).md>).

## Slave Bonding

Slave bonding is the easiest and most dangerous way to control a creature. It forces obedience through harm and coercion, and it holds only as long as the handler keeps the pressure on. When that control slips, the creature flees or turns on its handler, and depending on its nature it may attack to kill.

A coerced creature does not stay coerced for life. A handler who stops the pressure and tends the animal, feeding it and keeping it out of needless danger, slowly turns the slave bond into a trust bond, one patient day of care at a time. Any new act of coercion undoes the progress, since the creature learns again what its handler is.

## Parental Bonding

Parental bonding gives the strongest control of all and is the hardest to achieve, because the creature has to be raised from birth or near birth. A handler either breeds it from creatures already under their control, which needs a male and a female, or finds a wild egg or, for mammals, a young animal.

Breeding needs the pair to share a suitable shelter, one that meets all four of a creature's needs as set out under [Bonds While Away](#bonds-while-away). How long a pregnancy or an incubation lasts differs from species to species and is a [server setting](Server-settings.md#official-and-community-servers) with a default per species, so a wolf litter comes sooner than a dragon's egg. A wild egg hatches only while it is kept in the warmth its species needs, from a hearth or brazier in the same space, and it waits, neither hatching nor spoiling, while it is cold. A young animal counts as near birth until its species weans or fledges it: a found wolf pup can still be raised into a parental bond for as long as it suckles, a fledgling bird until its first flight, and past that age the creature can only be tamed by the other two methods.

A creature raised this way bonds deeply with its handler, but that trust still has to be kept. Neglected, it reverts to its wild instincts and breaks free.

## Trust Bonding

Trust bonding is the slowest method, and the one that tames a wild creature without harming it. The handler earns the creature's trust over time through consistent care, feeding it properly and keeping it out of needless danger, and goes on nurturing that trust once it is won, because a bond left untended fades.

Only one handler can win a given creature at a time. While one taming attempt is under way, nobody else can start another on the same animal, so a stranger cannot race the handler who has been feeding it for a week. An attempt that is abandoned fades: the creature's trust slips away day by day, and once nothing is left it drops the attempt and rejoins its herd, free for anyone to try again.

## Bonds While Away

A creature's bond only holds steady while it is sheltered. A stable is not a single building but any place whose pieces meet a creature's needs: a stocked feeding trough within reach, a roof overhead, the warmth or shade its kind requires, and room for its body, as set out under [Shelter for Creatures](Building-system.md#shelter-for-creatures) in the [Building System](Building-system.md). In the hottest country shade alone does not keep a heat-sensitive creature comfortable; it needs a cooling source, the counterpart of the hearth that warms creatures of cold country, which the building system supplies. A sheltered creature keeps its bond exactly as it was for as long as the trough stays stocked, so a player can leave for a week without losing a mount they spent months raising. Once the trough runs dry, or for any creature left without shelter, time away counts as neglect: the bond weakens slowly, first into hesitation and then into open disobedience, but it never breaks entirely while the owner is offline. A returning player may find a creature that will no longer follow them into danger and has to earn its trust again, but they will not find it gone. Keeping shelters stocked is one of the standing costs of keeping creatures at all.

Shelter keeps a bond steady, not a creature safe. A shelter stands inside a base, and a base can be raided while its owner sleeps, as [Raids and Conquest](Raids.md) sets out. Raiders who break in find creatures that fight back according to their nature and their bond, and they can kill them or force them into a new bond on the spot through slave bonding, taking a frightened, resentful animal that is as dangerous to its new master as that method always is.

## The Bond in the Saddle

The bond built through the methods above matters at every moment a creature is ridden, not only at the point of taming, because a [mount](Travel-and-mounts.md) keeps its own instincts and its will to survive, and the bond decides how far it will follow its rider into danger. How that plays out in the saddle, from the controls and refusals to mounted combat, is set out in [Creature Riding](Creature-riding.md), and the rules flying mounts add are in [Flight](Flight.md).

## Continue Reading

Continue with [Creature Riding](Creature-riding.md) for life in the saddle, [Travel and Mounts](Travel-and-mounts.md) for what a controlled creature lets a player do, [Creatures](Creatures.md) for the beasts worth bonding with, and [Skills](Skills.md) for the taming and handling skills that strengthen the bond, and [Taming and Control (Technical)](<Taming-and-control (Technical).md>) for how it is built in Unreal Engine 5.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
