# Inventory And Storage System

## Design Philosophy

Inventory is gear-driven: players start with no general-purpose inventory slots and must equip items to expand storage. This creates meaningful equipment choices, prevents unlimited carrying capacity, and ties loot decisions to character build, travel plans, and risk.

## Default Capacity

Every character has equipment slots for armour and clothing, one primary bag slot, and two unrestricted hand slots. The bag slot is the main source of portable storage, while hand slots allow a player to carry or manipulate items even before they have proper containers.

All inventory slots appear in a single unified grid for easy management. Slot colour, outline, or grouping should show which equipped item provides each slot, so players can understand what will happen if they remove a bag, belt, or piece of clothing.

## Storage Options

Pouches are small storage containers for lightweight essentials such as food, coins, arrows, reagents, or tools. They provide limited convenience rather than bulk capacity and usually come from belts, pants, bandoliers, or similar gear.

Bags and backpacks are the primary storage containers. Only one main bag or backpack can be equipped at a time, with early versions offering modest capacity and late-game versions scaling significantly. Larger backpacks should create trade-offs through weight, movement penalties, durability concerns, or reduced combat convenience.

Magic pouches and magic backpacks are rare endgame storage upgrades. They can offer more slots, reduced effective item weight, special durability, or minor stat properties, but their crafting cost and rarity should keep them valuable rather than ordinary.

The [Item Box](Magic/Spells/Misc/Item-box.md) spell is mage-exclusive personal storage. It acts like a magical private chest that only the caster can access, protects stored items from death loss, and removes those items from normal carry weight. Its mana cost, drain, slot limits, and upgrade requirements keep it powerful without making physical storage irrelevant.

## Weight And Strength Mechanics

All items have weight measured in kilograms, and stacked items combine their weight. The interface should show current burden and maximum carrying capacity clearly. Capacity scales with the Strength stat, so characters built for heavy armour, hauling, mining, or group logistics can carry more without becoming immobile.

| Strength Increase | Effect |
|---|---|
| +1 | Carry capacity increases |
| High | Minimal penalties for extra weight |
| Very High | Superhuman carrying potential |

| Status | Effect |
|---|---|
| **Under Limit** | No penalties, full mobility |
| **Approaching Limit** | Slight movement speed reduction |
| **Over Limit** | Noticeable slowdown |
| **Severely Overweight** | Risk of becoming immobile |

## Strategic Depth

The weight system should make players choose what to keep, abandon, hide, sell, or transport later. Heavy armour, rare ore, siege supplies, food, treasure, and spare weapons all compete for capacity. This gives Strength investment, storage gear, pack planning, and settlement logistics real value, especially during raids and long expeditions. Because everything carried is also everything at risk under [Death and Loss](Death-and-loss.md), and because most of it eventually moves through the player markets of [Economy and Trade](Economy.md), packing for a journey is as much an economic decision as a logistical one.

## Continue Reading

Continue with [Player Progression](Player.md), [Building System](Building-system.md), and [Item Box](Magic/Spells/Misc/Item-box.md).
