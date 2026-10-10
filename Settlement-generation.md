# Settlement Generation

Every NPC settlement in the game, from a farming hamlet to a [great city](Structures/Great-cities.md), is assembled from data rather than placed by hand building by building. Its streets, squares, and the outline of every building are authored once and stay the same in every game world, but what each building is, how it looks, and how it is laid out inside are rolled when the world is created and rolled again when a building is destroyed and rebuilt. The result is a world whose cities are recognisable from a distance and unfamiliar up close: a player always knows the shape of the city around the portal plaza, but has to walk its streets to learn where the smithy is in this world, and has to learn it again after a raid has burnt a district down. No guide can give exact directions to a blacksmith, because there is no single answer.

This document is the conceptual design. Its implementation in Unreal Engine 5 — the data assets, the seeded rolls, the quota solver, and the replication of lot state — is set out in [Settlement Generation (Technical)](<Settlement-generation (Technical).md>).

## Fixed Layout, Rolled Buildings

Each settlement starts from an authored layout: its street network, its walls and gates, its squares, and a set of lots, the building plots that line those streets. Every lot carries a fixed building shape, so the corner where two streets meet is always occupied by the same corner building, with the same footprint, height, and silhouette, in every world. Because the shapes never move, a city's skyline, its distant outline, and the routes through it stay constant, and a player who has walked one world's version of a city can find their way around another's.

A small number of lots are pinned, and they are what keeps the city navigable. A landmark lot never rolls at all: the portal plaza, the guard barracks, the great temple, a realm's palace, and the dominant landmark every great city is built around stay exactly as authored, so a player always has fixed points to orient by. A function-pinned lot keeps its purpose but still rolls its look, which is how the starting districts of a great city keep the trainers, militia yard, and workshops a new player is sent to on their first evening, as described in [New Player Experience](New-player-experience.md), while still looking different from one world to the next. Every other lot is free.

## The Building Blueprint Hierarchy

What stands on a lot is chosen in four levels, each narrowing the one above it and each forbidden from changing what the level above has fixed.

The **shape** is the building's massing: its footprint, its storey count, its roofline, and the way it meets the street. Corner Building 1 meets the street corner with a sharp edge; Corner Building 2 rounds it off. The layout decides the shape, and nothing below it may change it.

The **function** is what the building is for: a blacksmith, a bakery, a tavern, a dwelling, a warehouse. Each shape lists the functions it can hold, because not every outline suits every trade. A narrow two-storey terrace makes a fine bakery or a home but a poor forge, while a deep ground-floor shape with a yard behind it suits a smithy or a stable.

The **style** is how the function is dressed: the facade, materials, signage, and the interior program of the trade. A blacksmith on Corner Building 1 has several styles, and every style belongs to a people, so the same corner in a human great city and a dwarven one carries a human or a dwarven smithy. Style is also where a function becomes readable from the street, as the [Structures](Structures.md) design role requires: whatever style a smithy rolls, it shows a chimney, a forge glow, and the ring of a hammer, and whatever style a tavern rolls, it hangs a sign and spills light and noise onto the street.

The **variant** is the last level of detail, everything that does not touch the shape: where the door sits, whether there is a back door, how the rooms are arranged inside, whether a small tower rises from the roof or a balcony overhangs the lane. A variant may also open the ground floor into an alleyway or an underpass through the building, which changes how a player can move through a block without changing the building's outline from the street. Variants are where the small shortcuts and dead ends of a city come from, and they are a large part of why a district has to be rediscovered rather than remembered.

## The Settlement Blueprint

Every settlement is driven by a settlement blueprint, the dataset that describes what kind of place it is and what it needs to function. The blueprint names the layout it uses, the people and realm it belongs to, or that it belongs to none, as an [independent settlement](Structures.md#independent-settlements) does, and the settlement type, from farming hamlet to great city. It sets a target number of residents and the housing capacity that target needs. It holds the service quotas: for each function, how many residents one building of that kind serves, the minimum the settlement must always have, and the maximum it may hold. And it lists the functions the settlement must have regardless of size, such as a guard post in any walled town.

Every resident is a person the settlement remembers. Each has a home on one of its lots, a workplace or none, a role, and a daily routine that carries them between the two, so the baker who opens the bakery at dawn is the same baker every morning until something happens to them. A resident only becomes a character on screen when a player is near enough to see them; everywhere else the settlement follows their routine as data, moving them from home to work and back without simulating a single step of the walk. When a raid kills the baker, it is that baker who is gone: the bakery stays shut until someone takes up the trade, and the house they lived in stands empty until a newcomer moves in. A great city of several thousand people stays coherent this way, the same faces in the same places, without the servers animating thousands of individuals nobody is near.

The starting values below give each settlement type its scale. They are tuning values to be balanced in play, not fixed rules.

| Settlement type | Target residents | Typical services |
|---|---|---|
| Farming hamlet | 10 to 40 | Dwellings and farms; a chance of a chapel or a smithy |
| Village | 50 to 300 | A tavern, a smithy, a general trader, a chapel |
| Fortified town | 300 to 2 000 | Bakeries, butchers, smithies, taverns and inns, traders, a healer, a guard post |
| Great city | 3 000 to 10 000 | Every common service in quantity, specialist crafts, trainers, banking, a portal |

Quotas scale those services with population. A bakery serves around 250 residents, a tavern around 300, a blacksmith around 400, and a healer around 600, so a town of 1 200 holds roughly five bakeries, four taverns, three smithies, and two healers, while a village of 150 needs its single tavern and smithy only because the blueprint's minimums say it does.

## Rolling a Settlement

When a game world is created it receives a world seed, and every roll in every settlement follows from that seed, the settlement, the lot, and how many times that lot has been rebuilt. Two worlds created with different seeds get different cities; the same world always agrees with itself. Once a roll is made it is stored with the world's state rather than recomputed, so a later content update that adds new styles and variants never silently rebuilds a city that is already standing. New content enters a world the same way change always does, through rebuilding.

Lots are filled in order of need. Required functions are placed first, then the quotas are filled up to their targets, and every lot left over becomes a dwelling or a minor trade. The roll is weighted by where a lot sits: corner lots and lots near the gates favour taverns and inns, lots on the main streets favour shops, deep lots with yards favour smithies, stables, and warehouses, and back lanes favour homes. A spread rule keeps any one district from collecting every bakery in the city, so each quarter has the services its residents would walk to.

## Residents and Repopulation

A settlement's target population is a goal, not a guarantee. Raids, sieges, monster attacks, and disease kill residents, and every service building needs its staff: when the baker dies, the bakery closes until someone takes over, the rule [Raids and Conquest](Raids.md) already sets for damaged services. Children appear only in safe routines, per [Content and Tone](Content-and-tone.md), and are never among the casualties.

A settlement below its target slowly fills back up, one newcomer at a time, each taking an empty house and, where one is waiting, an empty post. It fills its service posts first, as an apprentice steps up or a journeyman moves in, before ordinary residents return. How fast it recovers depends on what the settlement can offer. Food is the first condition, which ties a city's recovery to the farm belt and farming hamlets of [Structures](Structures.md#how-settlements-spread): a city whose hamlets have been burnt recovers slowly, because there is no bread for newcomers. Safety is the second, so a settlement that is still being raided stays half empty. Housing is the third, since a settlement cannot grow past the homes it has standing. Players can speed recovery as Raids and Conquest describes, by escorting settlers, clearing the threats on the roads, and bringing in supplies.

Repopulation runs on the settlement's own clock whether or not a player is nearby, so a city left alone for a week has recovered by the time anyone returns. How that elapsed time is simulated and caught up belongs to the shared-clocks question already open in the [Design Backlog](Design-backlog.md).

## Damage and Rebuilding

A building takes damage, and what happens after depends on how much. A building that is damaged but still standing is repaired as it was, keeping its function, style, and variant, so a smithy with a burnt roof is still the same smithy once the roof is mended. A building that collapses is gone, and the lot it stood on is rolled again. Its shape stays, because the layout fixes it, but its function, style, and variant are rerolled, and the new function is drawn from what the settlement now lacks most. A city that lost three bakeries in the same fire tends to rebuild bakeries, though not necessarily on the lots where the old ones stood.

Rebuilding takes time and shows it. A collapsed lot passes through rubble, cleared ground, and scaffolding before the new building stands, and the settlement's builders work through its ruins in order of need. The players who help a city rebuild therefore also shape it, and a district rebuilt after a goblin war-host has passed through is, quite literally, new ground.

## What This Means for Players

Rediscovery is the point. A player who knows a city learns its streets, gates, and landmarks once, but learns its shops again in every world and after every disaster, by walking and looking rather than by following a list. That makes the readable street signals of each function important, and it gives local knowledge real value: a map drawn with [Cartography](Skills/Artisan/Cartography.md) records the city as its maker saw it, and after a fire it is out of date in exactly the places that burnt. A city that has been raided carries its history in its architecture, in the newer buildings standing between the older ones and the trades that moved across town, so the [regional history](Raids.md) a raid leaves behind is visible on the street itself.

## Continue Reading

Continue with [Settlement Generation (Technical)](<Settlement-generation (Technical).md>) for the implementation, [Structures](Structures.md) for how settlements spread across the land, [Great Cities](Structures/Great-cities.md) for the hubs players start in, [Raids and Conquest](Raids.md) for what destroys buildings, and [Non-Player Characters](NPCs.md) for the people who live in them.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
