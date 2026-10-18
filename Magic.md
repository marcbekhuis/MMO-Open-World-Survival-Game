# Magic

Magic is divided into distinct elements such as water, fire, earth, wind, light, lightning, and other specialised schools. Players begin with a small set of basic spells so every caster has something useful to practise immediately, but long-term strength comes from repeated use, upgrade choices, and unlocking advanced spell relationships. Where this power comes from is a question of [Setting and Lore](Setting-and-lore.md): magic wells from the living world itself rather than from the distant gods, which is why it runs strongest in wild, leyline-rich places.

## Foundation Spell Set

The foundation spells are the common language of practical magic. Trainers, field manuals, and early discoveries make them broadly accessible, but a new caster learns only a small selection rather than receiving the whole set at once. Each element covers two clear jobs and teaches its own rhythm: fire creates pressure, water controls space, earth holds ground, wind changes position, light preserves and reveals, and lightning exploits brief openings.

Foundation spells remain useful after their introductory role. Their upgrades change delivery, area, reliability, or interaction with the world rather than merely inflating damage, allowing a familiar spell to become part of a specialised end-game build. Advanced spells such as [Thunder](Magic/Spells/Lightning/Thunder.md), [Nature Growth](Magic/Spells/Earth/Nature-growth.md), and [Fireball](Magic/Spells/Fire/Fireball.md) build on this vocabulary with greater power or narrower purposes.

## Spell Progression

Casting a spell earns experience for that spell. As it levels, players gain upgrade points that can improve attributes such as size, speed, damage, duration, mana efficiency, cooldown, stability, or secondary effects. Upgrades should involve trade-offs: increasing a spell's size and power might also raise its mana cost, casting time, noise, or cooldown.

This makes spellcraft a build choice rather than a simple linear climb. Two players using the same base spell can shape it differently, with one favouring fast low-cost casts and another investing in slower area control.

## Unlocks And Combination

Advanced spells can unlock when a player reaches thresholds in one or more prerequisite spells. Some unlocks remain within a single element, while others combine schools: earth and water might support growth magic, lightning and wind might support storm spells, and light magic might interact with healing, wards, or visibility tools.
<!-- REVIEW(producer): This describes a combinatorial spell tree with no stated ceiling while fifteen spells are authored — give a rough content-count target (spells, and by extension creatures/biomes/structures at launch) and mark which lists are closed vs open-ended so the pipeline has a bounded number to staff against. -->

Advanced spells also ask for the mind to hold them. Every spell above the foundation set carries a minimum Spell Power that rises with how demanding it is, alongside the ranks it asks for in its prerequisite spells, so the great spells of each school belong to characters who have built toward magic. A heavy-weapon fighter who finds an end-game spell in a ruin can read it, sell it, or give it to a caster, but cannot cast it until they have put in the same years of study a mage has; the principle is the same one that keeps a mage from swinging a great war hammer, set out in [Player Progression](Player.md#requirements-and-commitment).

The system should reward experimentation without requiring players to memorise opaque recipes. Hints can come from trainers, ruins, quests, rare books, creature drops, or repeated use of related spells in the world.

## Casting

A spell is cast through the caster's hands, and casting it obeys the same rules as every other action under [Actions](Actions.md). A caster has two spell slots, each selected with its own key, and fills them from their spell tree, the map of every spell they have learned and the unlocks that connect them. A spell can also be chosen straight from the tree and cast at once, which is how a caster reaches for something they rarely need. Selecting a spell readies it into the hands. A one-handed spell takes the main hand, so whatever the main hand held is put away in its place on the body, and the primary button now casts the spell; the off hand keeps its shield or its light item, and the secondary button still guards with it. A two-handed spell, such as [Fireball](Magic/Spells/Fire/Fireball.md), takes both hands, and the caster has nothing else ready while it is selected.

Casting is gathering. Holding the primary button draws mana from the caster's pool into the spell, and what happens next is part of each spell's nature. A quick spell, such as [Ember Bolt](Magic/Spells/Fire/Ember-bolt.md) or [Arc Spark](Magic/Spells/Lightning/Arc-spark.md), casts the moment it is full and, with the button still held, begins gathering again while the mana lasts, the way a sword keeps striking. A charged spell, such as Fireball or [Water Lance](Magic/Spells/Water/Water-lance.md), holds what it has gathered and is cast by letting go, like a bow: past its threshold it is released with the power gathered so far, and below it the gathered mana is lost. Letting go of a quick spell before it is full loses its mana too. A caster aims along the casting hand, with no crosshair, under the same rules as an archer in [Ranged Combat](Ranged-combat.md#aiming-without-a-crosshair), and a spell's projectile, where it has one, flies by the same physics as an arrow's.

A gathering spell can be broken. Any stagger, knockdown, or daze breaks it, as it breaks every action, and the mana gathered is lost. Plain damage breaks only the spells whose own entries demand concentration, such as Fireball and [Mending Light](Magic/Spells/Light/Mending-light.md), so a caster can work quick spells while taking blows but needs protection for the great ones. A caster can walk while gathering but not sprint, and some spells forbid moving at all.

Mana comes from the world, as [Setting and Lore](Setting-and-lore.md) teaches, and a caster's pool refills from the place they stand. In ordinary country a full pool comes back in about five minutes; on a leyline, in about one; in mana-poor places, in the better part of half an hour; and resting makes every rate faster. The Mana stat of [Player Progression](Player.md#stat-point-allocation) sets the size of the pool and how quickly mana can be gathered into a spell, and the Spell Power stat sets the force of what is cast. Because the land decides how fast a caster recovers, where a mage chooses to fight is a tactical decision, and a leyline is ground worth holding. The refill rates are server settings, like every balancing value, under [Server Settings](Server-settings.md#official-and-community-servers).

## Spell Index

### Fire

- [Ember Bolt](Magic/Spells/Fire/Ember-bolt.md) — a quick projectile that applies steady pressure and ignites vulnerable materials.
- [Flame Wall](Magic/Spells/Fire/Flame-wall.md) — a visible barrier that divides a fight and punishes pursuit.
- [Fireball](Magic/Spells/Fire/Fireball.md) — an advanced siege blast, channelled in plain sight and hurled to detonate with enough force to break stone.

### Water

- [Water Lance](Magic/Spells/Water/Water-lance.md) — a precise impact spell that pushes targets and douses flames.
- [Frostbind](Magic/Spells/Water/Frostbind.md) — a slowing snare that turns wet ground into temporary control.

### Earth

- [Stoneguard](Magic/Spells/Earth/Stoneguard.md) — a short-lived layer of stone armour for holding a dangerous position.
- [Seismic Pulse](Magic/Spells/Earth/Seismic-pulse.md) — a ground shock that interrupts nearby foes and exposes unstable terrain.
- [Nature Growth](Magic/Spells/Earth/Nature-growth.md) — an advanced utility spell that restores natural resources.

### Wind

- [Gust](Magic/Spells/Wind/Gust.md) — a directional blast used to create space, redirect hazards, and break falls.
- [Windstep](Magic/Spells/Wind/Windstep.md) — a brief surge of movement for crossing gaps or escaping pressure.

### Light

- [Mending Light](Magic/Spells/Light/Mending-light.md) — a committed heal that stabilises wounds without erasing attrition.
- [Revealing Light](Magic/Spells/Light/Revealing-light.md) — a floating light that uncovers hidden threats and magical traces.

### Lightning

- [Arc Spark](Magic/Spells/Lightning/Arc-spark.md) — a fast close-range strike that rewards conductive conditions.
- [Static Field](Magic/Spells/Lightning/Static-field.md) — a charged zone that disrupts repeated movement through it.
- [Thunder](Magic/Spells/Lightning/Thunder.md) — an advanced storm strike built for setup and heavy impact.

### Miscellaneous

- [Item Box](Magic/Spells/Misc/Item-box.md) — a late-game pocket store that protects a limited personal reserve.

## Continue Reading

Continue with [Skills](Skills.md), [Player Progression](Player.md), [Inventory](Inventory.md), [Actions](Actions.md) for the one-action rule every cast obeys, and [Ranged Combat](Ranged-combat.md) for the aiming and projectiles spells share with bows.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
