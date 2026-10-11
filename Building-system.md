# Building System

Building is how a player stakes a claim on the world: a lean-to against the rain on the first night, a timber hall with a forge and a stable yard a season later, a stone keep that a whole guild bleeds to hold. The system works the way the genre's best piece-based builders do, in the tradition of [ARK: Survival Evolved](https://ark.wiki.gg/wiki/Building) and [Conan Exiles](https://www.conanexiles.com/): structures are made of crafted pieces that snap together, each piece has to be carried by something beneath it, and anything that stands can be burned, battered, or brought down. This document covers how pieces are made and placed, how structures stand and fall, how land is claimed and kept, and how the same pieces become a home for tamed creatures.

## One System for Everyone

All humanoid structures, player-built or NPC-built, use the same construction system. Architecture is part of the shared world language: players build in human, elven, or dwarven styles or mix them into hybrid settlements, they understand an NPC town through the rules that govern their own walls, and they attack or defend any building in a raid without a separate ruleset. The NPC settlements laid out by [Settlement Generation](Settlement-generation.md) are made of the same pieces, from the same materials, and fail in the same ways.

<!-- REVIEW(developer): This gives philosophy but nothing an engineer could scope — grid vs free placement, snapping, piece taxonomy, how support/durability is computed, how raids damage structures. Add one buildable pass (piece inventory, core formulas, a worked place-a-wall example) for this and equally for Magic, Skills, and Taming. -->

## Crafting and Carrying Pieces

Nothing is built straight from raw materials. Every piece is crafted first, at the station that works its material under [Crafting](Crafting.md): a carpenter's bench turns timber into wall panels and floor beams, a mason's yard dresses stone into blocks and foundation slabs, and a smithy forges the iron bands and fittings of reinforced work. The result is an item, a wall or a foundation or a door, which goes into the builder's inventory and is placed from there.

Crafted pieces keep their weight. A thatch panel is light, a timber wall is a load, and a dressed stone foundation is a burden one character can barely carry, under the same weight rules as everything else in [Inventory](Inventory.md). Where a base stands therefore decides how hard it is to build. Close to the forests and quarries, with workshops at hand, a stone hall goes up quickly. Out on the frontier every heavy piece has to come by pack beast, cart, or ship, or be made on the spot. A field bench set up on site makes simple timber and thatch pieces from local wood and grass, but stone and reinforced work need proper stations, so a frontier stronghold either hauls its walls in one piece at a time or builds its own workshops first. A caravan of building stone is a valuable and very slow target.

## Placing Pieces

Structural pieces snap together. Each piece has sockets along its edges and faces, and the placement preview locks a new piece into the nearest fitting socket of its neighbours: foundations join edge to edge, walls stand on foundation edges, ceilings rest on walls and pillars, roofs cap walls, and stairs and ramps hook onto floors. Square and triangular variants let a builder turn corners, ring a tower, or follow a cliff edge. Foundations settle onto uneven ground within limits, and on steeper slopes they rise on pillars to make a level floor. Pieces cannot be placed over resource nodes, on the roads that link settlements, or inside the protected ground around NPC settlements and the [great cities](Structures/Great-cities.md).

The core families of structural piece are these:

- **Foundations**, square and triangular, the only pieces that take their support from the ground, along with fence foundations for walls and palisades.
- **Pillars**, which carry floors and roofs up from a foundation or the ground.
- **Walls**, solid, windowed, half-height, and framed for doors, gates, and hatches, along with the doors and gates that fill those frames.
- **Floors and ceilings**, which are the same piece seen from either side.
- **Roofs**, sloped and flat, which also decide whether the space below counts as covered.
- **Stairs, ramps, and ladders**, which join one level to the next.

Everything that is not structure, such as crafting stations, storage chests, beds, hearths, feeding troughs, furniture, and decoration, is placed freely on any flat surface rather than snapped to a socket, so a builder can arrange an interior as they like once the shell stands.

## Materials

Building materials are not a short ladder of tiers. They form an open family that grows with the world, and every material is defined by the same handful of properties: how much punishment a piece can take, how far it carries support, how it resists each kind of damage, how well it keeps out cold and heat, how it weathers, and how much it weighs and costs. Thatch and hide go up fast and burn faster. Rough timber is the frontier's backbone, and planked and treated timber resist rot and weather better. Clay, adobe, and fired brick keep a building cool in the [Scorching Desert](Biomes/Scorching-desert.md). Fieldstone and dressed stone shrug off axes and fire, and iron-banded reinforced stone is the material of keeps. Each people brings its own variations, such as elven work in living, shaped wood, dwarven masonry cut to fit without mortar, and the timber-and-plaster of human towns, and rare materials join late in a character's career, including stone laced with [mana crystal](Glossary.md#creatures-and-magic) for warded walls.

Upgrading means replacing. A builder who wants stone where timber stood crafts the stone piece, removes the timber one, recovering part of its materials, and sets the new piece in the empty socket. Upgrading a wall is therefore a moment of weakness. For as long as the gap stands open, the base has a hole in it, and the support that piece gave its neighbours is gone, so a careful builder upgrades from the inside out and never with raiders in sight.

## Stability and Support

Every piece has a stability value, and nothing stands without it. A foundation resting on the ground has full stability, and so does a pillar that reaches down to the ground or to a foundation. Every piece joined to them takes a share of that stability, losing a little with each connection away from the nearest support. A wall on a foundation is almost as stable as the foundation itself, a ceiling one span out from the wall is less so, and a balcony three spans beyond is weaker still. When a piece would fall to zero, it cannot be placed. Stacking straight up costs little stability and reaching out sideways costs a great deal, so tall towers are cheap to raise and long overhangs need pillars beneath them.

Each material carries support in its own way. Stone stands tall but spans poorly without support beneath it, while timber spans further but cannot rise as high, and reinforced stone does both well. A builder sees all of this as they work. The placement preview colours each piece by its stability, shading from blue through green and yellow to red as support thins out, and a builder's hammer shows the same colours on anything already built. A structure's weak points are therefore visible to its owner and, at a glance, to anyone planning to bring it down.

Stability is recalculated only around a piece that is placed, removed, or destroyed, never across a whole base at once, which keeps large settlements cheap for the servers to hold. When a piece is destroyed, every piece that depended on it loses support. Anything that drops to zero collapses, and the falling rubble damages whatever lies beneath it. Raiders who understand this go for the pillars rather than the walls.

### A Wall Raised Step by Step

A builder on a gentle slope sets a dressed-stone foundation into the hillside. The preview settles into the ground, glowing blue: it is touching earth and has full stability. A second foundation snaps to its downhill edge but the ground falls away, so the builder drops a stone pillar beneath it, and the foundation locks level and blue as well. A stone wall snaps onto the shared edge, standing upright and still blue. When the builder lays a timber ceiling across from the wall, the preview turns green, then yellow as they reach a second span out over open air. Adding a pillar at the yellow edge turns it green again. The builder has learned in a minute where the structure is strong and where a raider will strike.

## Weather and Environment

Buildings must suit their biome or suffer for it. A design that works in the dry [Plains](Biomes/Plains.md) may rot in the rain-heavy [Jungle](Biomes/Jungle.md), sag under mountain snow, or flood in a swamp, so material and location are part of settlement strategy rather than decoration. Weathered pieces lose strength over time until they are repaired, and a material that suits its country ages slowly.

| Biome | Challenge | Adaptive Solution |
|---|---|---|
| [Tundra](Biomes/Tundra.md) | Cold, ice, snow loads | Insulated structures, heated foundations |
| [Scorching Desert](Biomes/Scorching-desert.md) | Heat, sandstorms | Clay and brick, reflective surfaces, hardened walls |
| [Jungle](Biomes/Jungle.md) | Rain, rot, dense foliage | Elevated platforms, treated timber |
| [Mountain Range](Biomes/Mountain-range.md) | Avalanches, exposed cliffs | Reinforced anchoring, wind-resistant design |
| [Swamp](Biomes/Swamp.md) | Flooding, decay | Raised floor systems, waterproof materials |

## Damage and Siege

Anything that stands can be brought down, and almost anything can do it, at very different speeds. Damage comes in kinds, and each material resists them differently:

- **Cutting** from axes and blades bites quickly into thatch and timber and barely scratches stone.
- **Crushing** from picks, hammers, battering rams, catapults, and the weight of great creatures is what stone fears, and it is the steady work of any siege.
- **Fire** from torches, burning oil, fire magic, and the breath of a [Royal Dragon](Creatures/Royal-dragon.md) devours thatch and timber and only scorches stone. Burning pieces keep losing strength until the fire is put out or rain douses it, and flames spread from one timber piece to the next.
- **Explosive** force from the largest fire spells, such as [Fireball](Magic/Spells/Fire/Fireball.md), damages every material, and it is the closest thing this world has to a breaching charge.
- **Earth** magic shakes and cracks stone and the ground under foundations, turning a mage into a sapper.

A lone raider with a pickaxe can start hacking at a stone wall, and given enough uninterrupted hours they will get through it, but every swing is loud and every hour is an hour for defenders to arrive. The better answers cost more to bring and are harder to hide: rams and siege engines must be built on site or hauled in, war beasts must be raised and fed, and a mage who can breach stone has spent years learning to. Walls do not have to be broken at all if they can be climbed. Siege ladders and grappling lines go over a wall, and flyers come down inside it if nothing stops them.

Every wall has a strong face and a weak one. The outer face takes far more punishment than the inner, so a wall set the wrong way round gives an attacker the easy side. Defence is a matter of design more than thickness, and the strongest bases are hard to reach, hard to read, and slow to break into. Roofs over courtyards deny flyers a landing, spiked wall-tops slow climbers, stone cladding keeps fire off a timber core, archer posts with a clear view of the sky cover the approaches from above, and a winding entrance turns a battering ram into a slow problem. A damaged piece is repaired with a hammer and its materials, but not while it is under attack: a piece that has just taken damage cannot be mended until the assault on it pauses, so a raid cannot be held off by repairing faster than the attackers can strike.

How raids unfold, who may raid whom, and what happens to a base whose owners are asleep are set out in [Raids and Conquest](Raids.md).

## Claims, Upkeep, and Decay

Land is claimed with a claim marker, a crafted piece placed on a base's foundations. It projects building rights outward from every foundation connected to it, so the claimed ground grows and shrinks with the base itself. Inside a claim only its owner, and those they or their guild grant access under [Guilds and Factions](Guilds-and-factions.md), can build. Outsiders can place only temporary siege pieces, such as ladders, grappling lines, rams, and siege engines, which decay quickly. Claims cannot overlap and must keep a gap between them, so no one can wall in a rival's base with their own foundations.

A claim is kept by upkeep, not by attendance. The claim marker holds a store of the materials the base is built from, and it draws on that store each day to keep every connected piece in repair. The daily cost grows with the number of pieces, and grows faster for very large bases, so a sprawling fortress is a standing expense that only an organised group can feed. While the store lasts, no one has to log in. A group can leave for a long campaign, or a solo player can step away for a week, and the walls stand. When the store runs out, decay sets in from the outside inward: exposed outer pieces weaken first, weathering faster the weaker their material, and in time the claim lapses. A lapsed base is abandoned. Anyone may demolish it and salvage its materials, and the land returns to the world for someone else to build on.

The marker is also a target. Destroying it ends the claim's protection at once, which lets attackers build inside the walls and starts the base decaying, so the marker is usually hidden at the heart of a base behind its strongest walls. Foundations and pillars that are not connected to any claim decay within days, which keeps the land from being fenced off with scattered pieces. Every claim also has a ceiling on the number of pieces it can hold, so that no single base can overwhelm the server running its region.

## Shelter for Creatures

There is no single stable building. A tamed creature counts as sheltered wherever the pieces around it meet its needs, and the same rules hold for a wolf in a lean-to and a dragon in a stone hall. Four conditions decide it:

- **Food in reach**: a stocked feeding trough close enough for the creature to eat from without wandering. A trough feeds every creature within its short reach and empties faster the more mouths it serves.
- **A roof overhead**: the creature stands under cover, judged from the roofs above it rather than from walls around it.
- **The right climate**: warmth for creatures that suffer in the cold, from a hearth or brazier in the same space, and shade and cool air for creatures that suffer in heat. Which a creature needs is part of its nature.
- **Room for its body**: enough space to stand, turn, and lie down. A wolf fits a lean-to, a buffalo needs a barn, and a dragon needs a hall.

A sheltered creature holds its bond exactly as it was for as long as its trough stays stocked, which is what lets a player leave for a week without losing a mount, as set out in [Taming and Control](Taming-and-control.md#bonds-while-away). A shelter keeps a creature in good condition, and wounds heal fastest there. A flyer's shelter also has to open onto the launch its body needs, as [Flight](Flight.md#taking-off-and-landing) describes, so where a base stands decides which flyers it can keep. A shelter inside a claim falls with the base, and what raiders can do to the creatures inside is set out in [Taming and Control](Taming-and-control.md#bonds-while-away).

## Bases on Creatures

Two creatures carry bases on their backs. A [Titan Turtle](Creatures/Titan-turtle.md) bears a saddle structure strapped to its shell, and a [Flying Leviathan](Creatures/Flying-leviathan.md) carries a deck built on foundations fixed along its back. Both use the same pieces and the same snapping as building on land, starting from a special foundation that can be fixed only to the creature, and both have a piece budget that keeps the base readable and the creature able to move. Everything built on them counts against what they can carry: a laden turtle grows slower and harder to steer, and every tonne on a leviathan's deck draws on its mana, as described in [Flight](Flight.md#mana-borne-flight). A base on a creature needs no claim marker. Its keeper holds the building rights, and the creature's own care takes the place of upkeep.

## Building in Practice

The system scales with the people using it. A solo player keeps a compact outpost, a hidden cabin, or a crafting shelter cheap enough to stock for weeks. A small group raises a fortified camp, a resource depot, or a frontier workshop. A guild builds halls, fortified towns, marketplaces, and layered keeps that become landmarks, conflict targets, and a standing commitment of upkeep. At every scale the same questions apply: what the walls are made of, what holds them up, how the materials got there, and who keeps the marker fed.

## Continue Reading

Continue with [Raids and Conquest](Raids.md) for how bases are attacked and defended, [Structures](Structures.md) for the settlements and dungeons built from the same pieces, [Crafting](Crafting.md) for the stations that make them, and [Taming and Control](Taming-and-control.md) for the creatures a shelter keeps.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
