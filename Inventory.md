# Inventory And Storage System

What a character carries is what they wear, what they hold, and what fits in the containers on their body, and nothing more. There is no bottomless bag: every slot comes from a piece of gear, every item weighs something, and everything carried into danger can be lost there. This document sets out how characters carry things, how quickly they can reach them, what happens to things left in the world, and how gear wears out. How weight slows the body is set out in [Movement](Movement.md#carrying-weight), and what a death costs in [Death and Loss](Death-and-loss.md).

## Design Philosophy

Inventory is gear-driven: a character starts with no general-purpose inventory slots and gains storage only by wearing things that provide it. A belt brings pouches, a pack brings bulk, a quiver brings arrows within reach. This makes equipment a choice about capacity as much as protection, prevents unlimited carrying, and ties every loot decision to a character's build, their route, and the risk they are taking.

## Equipment

A character wears equipment in a set of places on the body, each holding one item.

- **Head** for a hood, cap, or helmet.
- **Body**, in three layers worn one over another: an under layer such as a shirt or a padded gambeson, a middle layer such as a mail hauberk, and an outer layer such as a breastplate or a coat. The layers stack as [Armour](Armour.md#coverage-and-gaps) describes.
- **Arms**, **hands**, **legs**, and **feet**, for sleeves and vambraces, gloves and gauntlets, trousers and greaves, and boots.
- **Cloak**, worn over everything, for weather rather than war.
- **Belt**, which carries the pouches and the sheaths at the hips.
- **Back**, which takes one pack, with a sling over it for one long weapon, shield, or tool.
- **Quiver**, worn at the hip or on the back, for arrows or bolts.

Every character also has two hands, and each hand holds one thing. A sword and a shield take one hand each; a greatsword, a bow, or a heavy log takes both. The hands are a character's only storage before they own any gear, and they are where anything too large for a container is carried.

## Containers and Capacity

Capacity is counted two ways at once: slots and weight. Each container provides a number of slots, and each slot holds one stack of one kind of item, up to that item's stack size. Small, uniform things stack deeply, so a pouch slot holds a fistful of coins, a bundle of arrows, or several strips of dried meat, while an item with its own condition, such as a knife, a helmet, or a hammer, takes a slot to itself. Weight is counted across everything, slots or not, and it is weight that decides how burdened a character is.

Pouches are the small containers on the belt, the trousers, or a bandolier: two to four slots each, for the essentials a character needs within reach, such as food, bandages, coins, arrows, reagents, or a small tool. A pack is the one large container, worn on the back. An early pack holds around ten slots and a large late one several times that, and the bigger the pack, the heavier it is empty and the more it pulls at its wearer when full. Things too large for any container, a shield, a log, a dressed stone block for a wall, are carried in the hands or on the back sling, which is why hauling building material is slow, two-handed work.

Magic pouches and magic packs are rare late-game containers made through the enchanting of [Crafting](Crafting.md). They hold more slots than their size suggests or lighten what they carry, and their cost and rarity keep them a prize rather than a standard. The [Item Box](Magic/Spells/Misc/Item-box.md) spell gives a mage a private store outside the body altogether: what it holds weighs nothing, cannot be reached by anyone else, and is not lost on death, at a mana cost that keeps it powerful without making ordinary storage pointless.

## Weight And Strength Mechanics

Every item has a weight in kilograms, and a stack weighs what its parts weigh. The interface always shows the current burden against the character's capacity, which grows with the Carry Weight stat of [Player Progression](Player.md#stat-point-allocation), so characters built for heavy armour, hauling, mining, or group logistics can carry more before the burden bites. Each step of Carry Weight adds the same amount of capacity, and the step's rising point cost is what makes a great hauler a real investment.

The burden falls into four tiers, and each one changes how the body moves, as [Movement](Movement.md#carrying-weight) sets out.

| Burden | Effect |
|---|---|
| **Under three quarters of capacity** | No penalty |
| **Approaching the limit** | Slightly slower, slightly heavier to start, stop, and turn |
| **Over the limit** | No sprint, a slower jog, and every gait costs more stamina |
| **Severely overweight** | Walking only, no jumping, and stumbles on slopes; unable to move at half again the capacity |

## Reach and the Hotbar

Where an item sits decides how quickly it can be brought to hand. An item already in a hand is ready. A blade at the hip or a potion in a belt pouch comes to hand in a moment. A war hammer or a shield on the back sling takes longer, more the heavier it is. Anything in the pack takes a long fetch with both hands busy, as [Actions](Actions.md#hands-items-and-readiness) describes, so readying straight from the pack in a fight is a real risk.

The hotbar of [UI and HUD](UI-and-HUD.md) shows only what is within quick reach: the hands, the sheaths, the back sling, the belt pouches, and the quiver. An item in the pack cannot sit on the hotbar until it has been moved somewhere within reach. Managing the inventory itself is immediate: the inventory view opens at any time without stopping the world, and items move between hands, pouches, sling, and pack the moment they are placed. What takes time is bringing an item to hand, and the hotbar shows exactly which items can be brought to hand quickly.

## Items in the World

Items put down in the world stay in the world as things. A dropped stack of arrows lies where it fell, and stacks of the same item lying together merge into one. Small items of different kinds lying together gather into a bundle, a single object on the ground that is opened like a container, so the scattered contents of a spilled pouch become one small heap rather than a dozen glinting pickups. Large items and items with their own condition always stay separate and whole: a sword lies on the grass as a sword, a shield as a shield, a log as a log, and an arrow that missed sticks where it struck. Because items are physical, they can be hidden by dropping them in undergrowth or a hollow, and found by anyone who looks there.

Picking things up, opening bundles and containers, and searching the dead are interactions under [Actions](Actions.md#interacting-with-the-world). A corpse, a chest, or a bundle is searched first, a short held action that keeps the searcher crouched over it and exposed, and once it is open its contents move as freely as anything in the inventory.

## Wear and Repair

Every weapon, tool, piece of armour, and container has a condition and a maximum condition. Use wears both. Each blow struck, each blow taken, and each swing of a pick lowers the item's condition, and a small share of the same wear comes off its maximum, so the maximum records how hard an item has been used over its whole life. A death wears everything the character carried in the same way, as heavy use would.

Repair at the stations of [Crafting](Crafting.md) restores condition up to the item's current maximum, for materials in proportion to the condition restored, and repair itself never lowers the maximum. It makes no difference whether an item is repaired often or seldom: a hammer repaired at half condition and one repaired at a fifth have lost exactly the maximum their use has cost them, and nothing more. A finely made item begins with a higher maximum, which is part of what a master craftsman's work is worth.

Condition matters in use. A dull or chipped edge glances more often and cuts less, a dented plate or a split run of mail stops less, and a worn tool takes less from each blow. At zero condition an item is broken and cannot be used until it is repaired. Once its maximum has worn away entirely it can no longer be repaired at all, and its last value is the material it can be broken down for. This is the steady retirement of gear that [Economy and Trade](Economy.md) relies on as one of its sinks.

## Strategic Depth

Weight and slots make every outing a decision about what to keep, abandon, hide, sell, or come back for. Heavy armour, rare ore, siege supplies, food, treasure, and spare weapons all compete for the same capacity, which gives Carry Weight investment, storage gear, pack planning, and settlement logistics real value, especially during raids and long expeditions. Because everything carried is also everything at risk under [Death and Loss](Death-and-loss.md), and because most of it eventually moves through the markets of [Economy and Trade](Economy.md), packing for a journey is as much an economic decision as a logistical one. Mounts extend what a traveller can move under the same gear-driven rule, carrying only what their tack holds, as [Creature Riding](Creature-riding.md#care-and-tack) sets out.

## Continue Reading

Continue with [Actions](Actions.md) for how items are brought to hand and how the world is searched, [Armour](Armour.md) for the equipment worn for protection, [Player Progression](Player.md) for the Carry Weight stat, [Building System](Building-system.md) for the chests and stores of a base, and [Item Box](Magic/Spells/Misc/Item-box.md) for the mage's private store.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
