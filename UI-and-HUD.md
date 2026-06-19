# UI and HUD

The interface aims for a middle path: clean and immersive, but informative enough that players never fight the game to read it. The essentials of survival and combat stay on screen, and everything heavier sits a keystroke away. This document sets the philosophy for the heads-up display and the wider interface, which players then tune through the profile system in [Player Settings](Player-settings.md).

## Perspective

The game is played entirely in first person, and that view is fixed: there is no third-person camera and no option to pull back from the character's own eyes. The choice is deliberate on several fronts at once. Immersion is the obvious one, since the world's swings from beauty to horror in [Art Direction](Art-direction.md) land hardest when a player is inside them rather than watching an avatar move through them, and the visceral violence held to in [Content and Tone](Content-and-tone.md) reads as something happening to you rather than to a figure on screen. There is a fairness argument too: in a full-loot world where an ambush can cost everything, a third-person camera would let players see around corners and over cover that a first-person player cannot, so committing to one perspective keeps everyone's awareness honest. What players can still adjust, through [Player Settings](Player-settings.md), is field of view and the comfort options that make a fixed first-person view sit well over long sessions; the perspective itself does not change.

## Clean Core, Depth on Demand

A minimal persistent display shows only what moment-to-moment play truly needs: health, stamina, the survival meters that are currently pressing, the active hotbar, and a light orientation strip. The heavier surfaces, full inventory, map, character sheet, crafting, and quest log, open on demand rather than living on screen. Contextual elements fade in when they are relevant, such as an interaction prompt, a threat indicator, or a low-resource warning, and fade out again when they are not, so the screen stays calm during exploration and legible during a fight. The result deliberately falls between a stripped-back immersive HUD and a classic always-on MMO layout: more information at a glance than the former, far less clutter than the latter.

## Diegetic Where It Fits

The interface leans on in-world presentation wherever that deepens immersion without adding friction. A physical map and compass are the default tools of orientation rather than an omniscient minimap, and the quality and coverage of that map are tied to progression through [Cartography](Skills/Artisan/Cartography.md), so a well-travelled cartographer literally sees more of the world than a newcomer. A player gauges their condition by looking at their character and surroundings as much as by reading a number, and settlements communicate through readable signage and the behaviour of their inhabitants. The design stops short of pure diegetic purism, though: where an in-world solution would add friction without adding meaning, a clear conventional element wins.

## Readability Against the Contrast

Because the world swings between brilliant, colourful regions and dark, oppressive ones as described in [Art Direction](Art-direction.md), the HUD has to stay legible against every background. Interface elements carry adaptive contrast and subtle outlining so they read on snow, in fog, and against blood-dark interiors alike. Critically, danger and status information never depend on the maturity controls: the gore-intensity setting in [Player Settings](Player-settings.md) changes spectacle, never the cues a player relies on to understand a threat, in keeping with the rule in [Content and Tone](Content-and-tone.md) that comfort options never alter fairness.

## Customization and Profiles

Players shape the HUD through the named profiles in [Player Settings](Player-settings.md), switching between a clutter-reduced combat layout, a hidden-interface cinematic mode for screenshots, and a comfortable default for exploration and settlement life. Individual elements can be toggled, scaled, and faded. As with every setting, these adjustments serve readability and comfort and never confer a competitive advantage, so what a player hides for cleanliness can never be something the game relied on them seeing.

## Accessibility

A readable interface is the foundation of an accessible one, so the HUD is built for scalable text and elements, colourblind-safe cues, and audio or haptic alternatives to purely visual signals, with full input remapping. These commitments are developed in their own right in [Accessibility](Accessibility.md), alongside the comfort options in [Player Settings](Player-settings.md).

## Continue Reading

Continue with [Player Settings](Player-settings.md) for the profiles and controls that drive the interface, [Content and Tone](Content-and-tone.md) for the comfort rules it honours, and [Cartography](Skills/Artisan/Cartography.md) for the progression behind the in-world map.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
