# UI and HUD

The interface aims for a middle path: clean and immersive, but informative enough that players never fight the game to read it. The essentials of survival and combat stay on screen, and everything heavier sits a keystroke away. This document sets the philosophy for the heads-up display and the wider interface, which players then tune through the profile system in [Player Settings](Player-settings.md).

## Perspective

The game is played entirely in first person, and that view is fixed: there is no third-person camera and no option to pull back from the character's own eyes. The choice is deliberate on several fronts at once. Immersion is the obvious one, since the world's swings from beauty to horror in [Art Direction](Art-direction.md) land hardest when a player is inside them rather than watching an avatar move through them, and the visceral violence held to in [Content and Tone](Content-and-tone.md) reads as something happening to you rather than to a figure on screen. There is a fairness argument too: in a full-loot world where an ambush can cost everything, a third-person camera would let players see around corners and over cover that a first-person player cannot, so committing to one perspective keeps everyone's awareness honest. What players can still adjust, through [Player Settings](Player-settings.md), is field of view and the comfort options that make a fixed first-person view sit well over long sessions; the perspective itself does not change.

## Clean Core, Depth on Demand

A minimal persistent display shows only what moment-to-moment play truly needs: health, stamina, the survival meters that are currently pressing, and the active hotbar. Nothing on the screen tells a player which way they face or where home lies; orientation belongs to the map. The heavier surfaces, full inventory, map, character sheet, crafting, and quest log, open on demand rather than living on screen. Contextual elements fade in when they are relevant, such as an interaction prompt, a threat indicator, or a low-resource warning, and fade out again when they are not, so the screen stays calm during exploration and legible during a fight. The result deliberately falls between a stripped-back immersive HUD and a classic always-on MMO layout: more information at a glance than the former, far less clutter than the latter.

The prompts follow a budget. At most three prompt lines show above the hotbar at once, highest priority first: a bleed that will not clot by itself, then knocked down, dazed, winded, and last low stamina, which appears when stamina falls to a fifth of the pool and gives way to winded rather than showing beside it. A bleed that clots by itself earns a status tag beside the bars and no prompt, because a prompt always names something the player can do. A prompt fades in over 0,15 seconds and out over 0,6 seconds, and it keeps its place in the stack while it fades, so the lines below it do not jump. The health and stamina bars carry no numbers, and the health bar changes colour at three tenths of the pool. The hotbar always shows its eight slots, the fixed count set by [Inventory](Inventory.md#reach-and-the-hotbar), whatever the player carries, with each slot's bound key and the uses it has left, and a frame marks the item in hand. All of it sits on a dark translucent backdrop with outlined text, which keeps it readable over bright scenes. These figures are starting values.

## Diegetic Where It Fits

The interface leans on in-world presentation wherever that deepens immersion without adding friction. A physical map and compass are the default tools of orientation rather than an omniscient minimap, and the quality and coverage of that map are tied to progression through [Cartography](Skills/Artisan/Cartography.md), so a well-travelled cartographer literally sees more of the world than a newcomer. A player gauges their condition by looking at their character and surroundings as much as by reading a number, and settlements communicate through readable signage and the behaviour of their inhabitants. The design stops short of pure diegetic purism, though: where an in-world solution would add friction without adding meaning, a clear conventional element wins.

## A Baseline for Everyone

Tying the map to a skill has a cost, and the design accepts it knowingly: a newcomer with the plainest chart is the player least able to find their way, and in a world where getting lost is a survival failure, that falls hardest on the first week. So the floor is set deliberately high. Every character carries the rudimentary map that [Cartography](Skills/Artisan/Cartography.md#how-maps-grow) gives to all, which shows the coast, the rivers, the roads, and the settlements, so the patrolled ring around the home city and the roads running out of it are on it from the first minute, What keeps a player alive on that map is never gated either: it always marks the bearer's own position and the way they face, the character's bound respawn point with its distance, and the markers a player places on it. A newcomer who opens the map can always find the road home. What skill buys is detail beyond the road: biome colour, caves, ruins, resource nodes, and names, as Cartography describes, and the cost of lacking it is the cost the design wants, which is not knowing where the good ground and the danger lie, never not knowing how to get back to safety.

## The Corpse Marker

A death far from home is only recoverable if the body can be found, so a player who dies sees their corpse marked until the recovery window of [Death and Loss](Death-and-loss.md#dying-to-the-world) closes. The marker is a pin on the player's map, which gives its distance from where they stand, and, once they are within a few hundred metres, a faint pale outline of the fallen body that shows through foliage and fog. There is no minimap and no beam of light, so the marker guides the corpse run without making it trivial: it points to the place and says nothing of what is waiting there. Only the owner sees it, so it cannot lead a stranger to the body. The marker fades as the window runs down, and it dims at once if the corpse has been emptied or has gone, which spares a player a dangerous run for nothing and tells them to turn to the quest log or the nearest guard instead. The marker is drawn in a shape and a motion as well as a colour, in keeping with [Accessibility](Accessibility.md), and the outline remains visible when the rest of the HUD is hidden.

## Building and Snap Markers

With a piece in hand the interface shows where it can go. Every valid snap point near the aim lights up as a small marker, drawn just outside the surface of the piece it belongs to as an arrow pointing along the joint it would form, so that a point on a post or inside a thick wall never disappears into the geometry. The three positions on each face of a pillar, centred and flush to either side, are drawn in three different colours, and the point the preview will lock to is highlighted and named on screen, such as a wall meeting a pillar flush left, so the builder knows exactly what they are about to place. The colours are paired with the arrow's direction and the printed name, never relied on alone, in keeping with the colourblind-safe cues of [Accessibility](Accessibility.md). The joints themselves are described in the [Building System](Building-system.md#snap-points).

## Readability Against the Contrast

Because the world swings between brilliant, colourful regions and dark, oppressive ones as described in [Art Direction](Art-direction.md), the HUD has to stay legible against every background. Interface elements carry adaptive contrast and subtle outlining so they read on snow, in fog, and against blood-dark interiors alike. Critically, danger and status information never depend on the maturity controls: the gore-intensity setting in [Player Settings](Player-settings.md) changes spectacle, never the cues a player relies on to understand a threat, in keeping with the rule in [Content and Tone](Content-and-tone.md) that comfort options never alter fairness.

## Unavailable Region Feedback

When a destination region is temporarily unavailable, the current server continues simulation within the bounded, loaded safe overlap described in [Server Architecture](Server-architecture.md). An approaching player sees a translucent holographic error wall at the actual limit of permitted travel, giving the restriction a visible position before they reach it. The wall becomes more prominent as the player approaches and carries the simple message "Region temporarily unavailable". Its shape and text communicate the restriction without relying on colour alone; server identifiers and debugging information stay out of the player-facing message.

The wall is an in-world availability cue and remains visible when the HUD is hidden. The server enforces the travel restriction independently of its presentation. Reaching the wall grants no invulnerability and does not reset combat.

## Customization and Profiles

Players shape the HUD through the named profiles in [Player Settings](Player-settings.md), switching between a clutter-reduced combat layout, a hidden-interface cinematic mode for screenshots, and a comfortable default for exploration and settlement life. Individual elements can be toggled, scaled, and faded. As with every setting, these adjustments serve readability and comfort and never confer a competitive advantage, so what a player hides for cleanliness can never be something the game relied on them seeing.

## Accessibility

A readable interface is the foundation of an accessible one, so the HUD is built for scalable text and elements, colourblind-safe cues, and audio or haptic alternatives to purely visual signals, with full input remapping. These commitments are developed in their own right in [Accessibility](Accessibility.md), alongside the comfort options in [Player Settings](Player-settings.md).

## Continue Reading

Continue with [Player Settings](Player-settings.md) for the profiles and controls that drive the interface, [Content and Tone](Content-and-tone.md) for the comfort rules it honours, [Cartography](Skills/Artisan/Cartography.md) for the progression behind the in-world map, and [Server Architecture](Server-architecture.md) for region availability and handoff behaviour.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
