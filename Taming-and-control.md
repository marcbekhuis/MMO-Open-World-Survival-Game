# Taming and Control

In many games, taming a [creature](Creatures.md) grants permanent control. Here control is a bond that has to be kept, won through one of three methods and maintained for as long as the creature serves. The stronger the bond, the better a creature answers its handler, above all when it is ridden.

This document is the conceptual design. Its implementation in Unreal Engine 5 — the bond records and methods, shelter evaluation, elapsed-time catch-up, and the creature AI that riding and flight call into — is set out in [Taming and Control (Technical)](<Taming-and-control (Technical).md>).

## Slave Bonding

Slave bonding is the easiest and most dangerous way to control a creature. It forces obedience through harm and coercion, and it holds only as long as the handler keeps the pressure on. When that control slips, the creature flees or turns on its handler, and depending on its nature it may attack to kill.

A coerced creature does not stay coerced for life. A handler who stops the pressure and tends the animal, feeding it and keeping it out of needless danger, slowly turns the slave bond into a trust bond, one patient day of care at a time. Any new act of coercion undoes the progress, since the creature learns again what its handler is.

Pressure drains steadily and shelter does not slow it, as [Bonds While Away](#bonds-while-away) sets out. A handler who cannot keep the pressure up can restrain the creature at a base, chained to a tether post or shut in a barred pen, so that it cannot flee when the pressure is gone; it can still hurt anyone who comes within its reach.

## Parental Bonding

Parental bonding gives the strongest control of all and is the hardest to achieve, because the creature has to be raised from birth or near birth. A handler either breeds it from creatures already under their control, which needs a male and a female, or finds a wild egg or, for mammals, a young animal.

Breeding needs the pair to share a suitable shelter, one that meets all four of a creature's needs as set out under [Bonds While Away](#bonds-while-away). How long a pregnancy or an incubation lasts differs from species to species and is a [server setting](Server-settings.md#official-and-community-servers) with a default per species, so a wolf litter comes sooner than a dragon's egg. A wild egg hatches only while it is kept in the warmth its species needs, from a hearth or brazier in the same space, and it waits, neither hatching nor spoiling, while it is cold. A young animal counts as near birth until its species weans or fledges it: a found wolf pup can still be raised into a parental bond for as long as it suckles, a fledgling bird until its first flight, and past that age the creature can only be tamed by the other two methods.

A creature raised this way bonds deeply with its handler, but that trust still has to be kept. Neglected, it reverts to its wild instincts and breaks free.

## Trust Bonding

Trust bonding is the slowest method, and the one that tames a wild creature without harming it. The handler earns the creature's trust over time through consistent care, feeding it properly and keeping it out of needless danger, and goes on nurturing that trust once it is won, because a bond left untended fades.

Only one handler can win a given creature at a time. While one taming attempt is under way, nobody else can start another on the same animal, so a stranger cannot race the handler who has been feeding it for a week. An attempt that is abandoned fades: the creature's trust slips away day by day, and once nothing is left it drops the attempt and rejoins its herd, free for anyone to try again.

A creature that already has an owner cannot simply be taken. A stranger may begin an attempt on it only while its bond with its owner has fallen into open disobedience, the band below the point where a creature still answers its handler at all, which is the state of a mount left untended in a field or of a stable whose trough ran dry. A cared-for creature is out of reach of every method but the raid, and a bond that is held steady by a stocked shelter stays out of reach as long as the shelter holds. Winning a neglected creature takes two stages. First the stranger's care wears what remains of the bond with its owner down to nothing, and the owner can undo that work: their own renewed care pushes the bond back up, and once it stands above the disobedient band again the attempt ends and the stranger has to wait for the next lapse. Only when the old bond has reached nothing does the stranger's own bond begin, rising from zero by the ordinary rules of the method used. Raiders who find a creature in a base are a separate case, covered under [Bonds While Away](#bonds-while-away), and need no neglect to slave-bond it.

## Bonds While Away

A trust or parental bond only holds steady while its creature is sheltered; a slave bond is treated separately below. A stable is not a single building but any place whose pieces meet a creature's needs: a stocked feeding trough within reach, a roof overhead, the warmth or shade its kind requires, and room for its body, as set out under [Shelter for Creatures](Building-system.md#shelter-for-creatures) in the [Building System](Building-system.md). In the hottest country shade alone does not keep a heat-sensitive creature comfortable; it needs a cooling source, the counterpart of the hearth that warms creatures of cold country, which the building system supplies. A sheltered creature keeps its bond exactly as it was for as long as the trough stays stocked, so a player can leave for a week without losing a mount they spent months raising. Once the trough runs dry, or for any creature left without shelter, time away counts as neglect: the bond weakens slowly, first into hesitation and then into open disobedience, but a trust or parental bond never breaks entirely while the owner is offline. A returning player may find a creature that will no longer follow them into danger and has to earn its trust again, but they will not find it gone, unless they stayed away too long. An owner who has not entered the world for eight weeks, a [server setting](Server-settings.md#official-and-community-servers) with that default, is taken to have left the creature behind: their trust and parental bonds release, and the creature goes wild where it stands and counts toward the wild population again, free for anyone to tame. Keeping shelters stocked is one of the standing costs of keeping creatures at all.

A bond does not feed a creature, and a stocked trough is the only food some of them will ever see. A kept creature that cannot reach food for itself, because it is restrained, penned or shut inside walls, and whose trough stays empty, first weakens, then loses health, and at last dies. The span from the last meal to death is set per species and defaults to ten days, a server setting like the other durations here, and it runs whether the owner is online or away and whatever the strength of the bond. A creature free to range feeds itself poorly and suffers neglect instead, as above, so a loose mount is lost to its bond long before it is lost to hunger.

Shelter keeps a bond steady, not a creature safe. A shelter stands inside a base, and a base can be raided while its owner sleeps, as [Raids and Conquest](Raids.md) sets out. Raiders who break in find creatures that fight back according to their nature and their bond, and they can kill them or force them into a new bond on the spot through slave bonding, taking a frightened, resentful animal that is as dangerous to its new master as that method always is.

A slave bond gets no such protection. The pressure behind it keeps draining wherever the creature stands, in the best-stocked shelter or an open field, whether its handler is online or away, until none is left, and the rule that a bond never breaks entirely in its owner's absence belongs to trust and parental bonds alone. A coerced creature left loose when its pressure runs out flees or turns on whoever is near, as described under [Slave Bonding](#slave-bonding), with or without its handler in the world. A handler who must leave therefore restrains the animal first: chained to a tether post or shut in a barred pen, both [placeables of the shelter rules](Building-system.md#shelter-for-creatures). A restrained creature whose pressure has run out cannot flee and cannot reach anyone to attack. It stays where it is held, and it is dangerous to anyone who comes within its reach, so a base that keeps one needs its pens and posts set where no one walks by. When the handler returns they work the pressure back up by coercion, a step at a time, and nothing is restored for free. The road from a slave bond to a trust bond through patient care is unchanged.

Raiders who break into a base meet restrained creatures like any others. They can free one, kill it, or force it into a new bond on the spot, and a freed creature whose pressure has run out acts as any loose coerced creature does.

## The Bond in the Saddle

The bond built through the methods above matters at every moment a creature is ridden, not only at the point of taming, because a [mount](Travel-and-mounts.md) keeps its own instincts and its will to survive, and the bond decides how far it will follow its rider into danger. How that plays out in the saddle, from the controls and refusals to mounted combat, is set out in [Creature Riding](Creature-riding.md), and the rules flying mounts add are in [Flight](Flight.md).

## Continue Reading

Continue with [Creature Riding](Creature-riding.md) for life in the saddle, [Travel and Mounts](Travel-and-mounts.md) for what a controlled creature lets a player do, [Creatures](Creatures.md) for the beasts worth bonding with, and [Skills](Skills.md) for the taming and handling skills that strengthen the bond, and [Taming and Control (Technical)](<Taming-and-control (Technical).md>) for how it is built in Unreal Engine 5.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
