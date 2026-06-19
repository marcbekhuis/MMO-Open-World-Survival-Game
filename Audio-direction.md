# Audio Direction

Sound carries the same contrast as the picture. The audio swings from the warmth of a peaceful meadow to the dread of a horror-swamp, and the score is built to know when to disappear and when to soar. This document sets the direction for music, sound design, and voice, and it sits above the player-facing mix controls already described under the audio layers in [Player Settings](Player-settings.md).

## Music: Ambient Underscore, Orchestral Set-Pieces

The score works in two registers that depend on each other. Through normal exploration and survival it stays adaptive and largely ambient, sparse and responsive to place, time, and rising tension, written to underscore long sessions without ever wearing out its welcome. At landmark moments it opens into full thematic orchestral music: the first time a player wakes into the world, a major boss battle against one of the great creatures of the [bestiary](Creatures.md), or a large event or siege drawn from the [Raids](Raids.md) system. The restraint of the ambient layer is what gives the orchestral swells their force, so that music arriving at full strength signals that this moment matters.

## Regional Identity and Emotional Contrast

Music mirrors the visual contrast set out in [Art Direction](Art-direction.md). Peaceful regions are scored warm and melodic, beautiful enough that a player lingers; horror regions turn to dissonance, drones, and near-silence broken by sounds that feel wrong, so a place can frighten through the ears before the eyes confirm it. Each realm and culture carries its own instrumentation, so that crossing from human lands into elven or dwarven territory is something a player can hear as well as see.

## Sound Design: Visceral and Diegetic

Combat audio matches the photoreal violence held to in [Content and Tone](Content-and-tone.md): weighty impacts, the crunch of bone, the wet sound of a killing blow, all of it brutal and physical so a fight feels as dangerous as it looks. Creatures are given distinct vocal identities that run from the chatter of small wildlife to the world-shaking calls of the elder beasts. Weather, ambience, and environmental layers build each biome's register underneath.

Sound is also gameplay, not only atmosphere. Directional danger cues, the tells a creature gives before it strikes, and the shift in weather a careful player learns to read all let preparation pay off through the ears. This is why the audio layers and accessibility alternatives in [Player Settings](Player-settings.md) treat important danger cues as information that must survive at low volume, never as decoration.

## Voice

Voice acting is selective by design. Key quest-givers, faction figures, and cinematic moments are fully voiced, creatures and combat are fully vocalized, and ambient barks keep settlements and camps feeling lived-in, while the bulk of branching and systemic dialogue is delivered as well-written text. This balances the immersion of a voiced world against the cost and localization load that full voicing would impose at MMO content volume, and it leaves room to expand voiced coverage where it earns its place.

## Technical Approach

The adaptive layering, interactive transitions, and procedural detail described above are realized through Unreal Engine 5's [MetaSounds](https://dev.epicgames.com/documentation/en-us/unreal-engine/metasounds-in-unreal-engine) system, whose node-based, sample-accurate graphs suit a score and a soundscape that must respond continuously to the state of the world, sitting within the wider [audio engine](https://dev.epicgames.com/documentation/unreal-engine/audio-in-unreal-engine-5) that drives the layered mix players tune in their settings.

## Continue Reading

Continue with [Content and Tone](Content-and-tone.md) for the standard the sound design serves, [Player Settings](Player-settings.md) for the player-facing mix and accessibility controls, and [Art Direction](Art-direction.md) for the visual contrast the music shadows.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
