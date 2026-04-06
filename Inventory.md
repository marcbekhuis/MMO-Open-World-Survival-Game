# Inventory & Storage System

## Design Philosophy

Inventory is **gear-driven**: players start with no inventory slots and must equip items to expand storage. This creates meaningful equipment choices and prevents unlimited carrying capacity.

### Default Slots

- **Armor/Clothing Slots**: Various slots for protective gear
- **Bag Slot**: Primary storage container (equipped item)
- **Hand Slots (×2)**: Unrestricted slots for any item type

## Unified Inventory Grid

All inventory slots display in a **single unified grid** for easy management. Slots are color-coded and outlined to show which equipment provides each slot, maintaining clarity and organization.

---

## Storage Options

### 📦 Pouches
**Purpose**: Small storage containers for lightweight items

- Provide a few extra inventory slots
- Designed for quick-access essentials: food, coins, arrows
- Unlocked by equipping belts, pants, or similar gear
- Limited capacity by design

### 🎒 Bags & Backpacks
**Purpose**: Primary storage containers providing bulk inventory space

- Only one bag/backpack can be equipped at a time
- Early-game options offer minimal slots; late-game options scale significantly
- **Trade-offs matter**: More storage may reduce movement speed or increase weight
- High-progression backpacks may have special bonuses (weight reduction, damage resist, etc.)
- Craftable and purchasable at various progression tiers

### ✨ Magic Pouches & Magic Backpacks
**Purpose**: Rare, powerful storage upgrades for endgame players

- Offer significantly more slots than standard versions
- **Weight reduction bonus**: Items weigh less when stored
- Extremely expensive to craft or purchase
- Prized possessions for veterans
- May have other special properties (stat bonuses, durability, etc.)

### 🎁 Item Box Spell (Mage-Exclusive)
**Purpose**: Personal, magical storage—exclusive to mages

- Acts as a personal magical chest (similar to Minecraft's Ender Chest)
- Only the caster can access their Item Box
- **Death advantage**: Items are NOT lost on death
- **No weight penalty**: Stored items don't contribute to overall burden
- Invaluable for endgame mages managing rare loot

*See [Magic Spells](Magic/Spells/Misc/Item-box.md) for detailed spell mechanics.*

---

## Weight & Strength Mechanics

### How It Works

✓ All items have weight values that **stack**

✓ A visible weight stat displays your current burden

✓ Weight capacity scales with your **Strength stat**

### Strength Impact

| Strength Increase | Effect |
|---|---|
| +1 | Carry capacity increases |
| High | Minimal penalties for extra weight |
| Very High | Superhuman carrying potential |

### Weight Penalties

| Status | Effect |
|---|---|
| **Under Limit** | No penalties, full mobility |
| **Approaching Limit** | Slight movement speed reduction |
| **Over Limit** | Noticeable slowdown |
| **Severely Overweight** | Risk of becoming immobile |

### Strategic Depth

The weight system creates meaningful decisions:
- Prioritize what loot to keep vs. abandon during raids
- Choose between powerful but heavy gear or light mobility options
- Invest Strength points as a tank/carry-focused build
- Use storage items strategically to manage bulk
