# Art Direction

The game's look is photorealistic, and its defining creative choice is contrast. The world is built to swing, region by region, from the most beautiful and peaceful places a player has seen in a game to scenes out of the worst horror they have played, and the journey between those extremes is meant to be felt. This document sets the visual target and the rules that hold that contrast together as one coherent world rather than a patchwork.

## Photorealistic Foundation

Fidelity targets photorealism on Unreal Engine 5. [Nanite](https://dev.epicgames.com/documentation/en-us/unreal-engine/nanite-virtualized-geometry-in-unreal-engine) virtualized geometry carries film-quality detail without hand-built levels of detail, [Lumen](https://dev.epicgames.com/documentation/en-us/unreal-engine/lumen-global-illumination-and-reflections-in-unreal-engine) provides dynamic global illumination and reflections so light behaves believably as the day and weather change, and [Virtual Shadow Maps](https://dev.epicgames.com/documentation/en-us/unreal-engine/virtual-shadow-maps-in-unreal-engine) deliver high-resolution shadows that hold up across a large, dynamically lit world. Materials obey real-world scale and physically based standards, characters are built to a high human fidelity, and surfaces wear the dirt, damage, and age that a survival world demands.

Photorealism across a seamless persistent world is expensive, and the art is authored with that cost in mind rather than against it. Assets are built for streaming and for the budgets defined in [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md) and realized through the World Partition and rendering pipeline in [Server Architecture (Technical)](<Server-architecture (Technical).md>). Fidelity and performance are balanced there, so the look described here always reads against what the engine can sustain at scale.

## Contrast as the Signature

The core direction is deliberate, dramatic swings in mood between regions. A sunlit plain or a field in flower can be among the most beautiful, colourful, and peaceful spaces in any game, while a [Swamp](Biomes/Swamp.md) or a mythic-dangerous region can feel genuinely wrong, gloomy, and oppressive, the kind of place a player does not want to enter alone at night. The power lives in the whiplash between them: leaving warmth and light behind to push into dread, and the relief of breaking back out into open beauty, turns travel itself into an emotional arc. Each region commits hard to its register instead of blending toward a safe middle, so the [Plains](Biomes/Plains.md) and the swamp read as opposite poles of the same world.

## Light, Colour, and Atmosphere per Region

Every biome carries its own palette, key lighting, atmosphere, and colour grade chosen to commit to one emotion. Peaceful regions run warm and saturated under soft, golden light, lush and inviting and open. Horror regions desaturate toward sickly or cold casts, sink into heavy fog and deep shadow, and lean on unsettling colour, the bruised greens and bone-and-blood notes that tell a player something here is hostile to them. Lumen, Virtual Shadow Maps, and volumetric atmosphere do most of this work, tuned per region through post-process volumes. The contrast is not only mood; it is information, because the look of a place telegraphs its danger before a single creature appears.

## Violence Made Real

Because rendering is photoreal and the game holds to the standard set in [Content and Tone](Content-and-tone.md), violence carries real visual weight. Wounds, blood, and dismemberment are rendered convincingly, and the darkest regions lean into body horror as a deliberate aesthetic rather than a constant one. The aim is dread and consequence, not gratuitous spectacle, and the gore-intensity control in [Player Settings](Player-settings.md) lets each player scale how much of it reaches their own screen without changing what is happening in the world.

## Characters and Creatures

The three playable races described in [Player Progression](Player.md) are rendered to a high human fidelity, with believable skin, hair, armour, cloth, and the grime and wear of a hard life, and character creation is supported visually so players can see themselves in the world. Creatures share that fidelity, from the small wildlife that gives a biome life to the great mythic beasts of the [bestiary](Creatures.md). The elder powers in particular are meant to look awe-inspiring or terrifying as their role demands, so that meeting a [Royal Dragon](Creatures/Royal-dragon.md) or a [Kraken](Creatures/Kraken.md) lands as an event the moment it comes into view.

## Coherence at Scale

A shared style guide keeps photorealism and extreme regional contrast from pulling the world apart. Common material and physically based rendering standards, consistent lighting rules, controlled per-biome palettes, and shared conventions for scale and asset construction mean that however far apart two regions sit in mood, they still feel built by the same hand. Transitions between neighbouring biomes are blended with care so the contrast stays dramatic without jarring pop as a player crosses the seam between one register and the next.

## Continue Reading

Continue with [Content and Tone](Content-and-tone.md) for the maturity standard this fidelity serves, [World Design](World.md) and the [Biomes](Biomes/Ancient-forest.md) for the regions the palette brings to life, and [Dynamic Culling & Render Distance](Dynamic-culling-and-render-distance.md) for how the look is sustained at scale.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
