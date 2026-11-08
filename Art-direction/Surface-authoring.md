# Surface Authoring

This document is the shared standard for how surfaces are made: the maps a material carries, the density and size it is authored at, how much repetition the eye will forgive, and the check every building piece passes before it is accepted. It exists so that a plank wall from one artist and a stone foundation from another read as the work of one hand when a player stands a metre from them, which is the only distance the first-person game ever gives anyone to judge. It serves the rules in [Art Direction](../Art-direction.md#coherence-at-scale), and the per-material looks it delivers are set in [Building Materials](Building-materials.md).

## Required Maps

Every surface carries a base colour map, a tangent-space normal map, and a roughness map. Ambient occlusion and a height map are added where the material needs them: occlusion for deep joints, gaps, and crevices in stone, brick, and plank seams, height for materials whose silhouette at grazing angles depends on relief, such as cobblestone, thatch, and fieldstone. Metalness is authored only for exposed iron, bronze, and steel, and is otherwise absent.

Base colour holds albedo alone, with no baked light, shadow, or occlusion, so that [Lumen](https://dev.epicgames.com/documentation/en-us/unreal-engine/lumen-global-illumination-and-reflections-in-unreal-engine) lights it as it lights everything else. Its values stay inside physically plausible albedo ranges: nothing reads as pure black or pure white, and fresh timber, whitewash, and pale stone sit well below the top of the range. Colour data is authored in sRGB; normal, roughness, occlusion, and height are authored as linear data. Normals follow the Unreal convention of a green channel pointing down the surface, and every normal map in the library is checked against that one rule, since a flipped channel makes relief read inside out under raking light. Roughness carries most of a material's realism, so it is never a flat value: it varies across the surface with wear, handling, dampness, and the grain of the material itself.

## Texel Density and Resolution

Building pieces are authored at 512 texels per metre, nominal, so that a 3-metre module face carries 1 536 texels across and the surface holds up when a player stands at arm's length. Small hand-held props and furniture may run denser, and large terrain-scale rock may run sparser, but a piece is never set to a different density from its neighbours in the same wall. Texture sets are authored at 2 048 or 4 096 texels square and shared across many pieces; a unique 4 096 set is reserved for hero pieces such as a door or a carved lintel, and no building piece takes an 8 192 set. Texture memory is budgeted per material family, as the [asset budgets](<../Building-system (Technical).md#106-asset-budgets-and-surface-standard>) of the building guide set out, and a material whose maps would exceed that is split into a shared tiling set plus a small unique detail layer rather than enlarged.

## Atlas and Tiling Policy

Surfaces that repeat across a wall, such as planking, brick, thatch, and coursed stone, use tiling textures authored on the metre grid so that one tile always covers a whole number of boards, courses, or bundles. Pieces that are unique by nature, such as doors, shutters, carved trims, and ironwork, use a trim sheet or a small atlas shared across the whole family, so a hundred doors cost one set. Seams between tiles are never visible at the density above: a tile that shows its edge, or a pattern that reads as a grid from the far end of a street, is returned. Tiling is broken up by a second, large-scale variation layer (stain, patch, dirt, damp) that does not repeat at the same interval as the base.

## Repetition and Reuse

Reuse is how a settlement is affordable, and the standard sets how far it may go. The same wall panel may stand many times in a settlement, but it is never seen twice in a row: each module carries at least three visual variants with different board, stone, or brick placement, and the placement system rotates, mirrors, and offsets them so that neighbouring pieces differ. A reader should never be able to point at two walls in the same view and name them the same wall. Distinctive marks, such as a knot, a burn, a patched hole, or a chipped corner, appear on one variant only and never on all of them, since a mark that repeats is read at once as a stamp.

## Wood

Grain runs along the length of a board, post, or beam and nowhere else, and it is authored at the true scale of the timber: the growth rings of a plank are a few millimetres apart, a knot is a handful of centimetres across, and a board of 20 centimetres shows its own grain instead of the pattern of a log. Board ends show end grain, with rings, checking, and a darker, rougher surface than the face, wherever a cut board meets the eye, including beam ends, tenons, and the cut tops of a palisade. Neighbouring boards vary from one another in tone, grain direction, knot placement, and wear, so that a wall reads as many boards and not one stretched image. Lashings, pegs, and nails are placed where a joint needs them and sit in the material rather than on it.

## Stone and Brick

Stone is authored with its coursing at true scale, which is what lets a player judge the size of a wall from a glance. Fieldstone units run from a fist to a bread loaf in the dry-laid work and larger in the foundations; cobbles run fist- to head-sized in courses roughly 15 to 25 centimetres high; dressed courses run 25 to 40 centimetres; fired brick follows the real proportions of a brick laid in a running bond. Stone-to-stone variation is real: neighbouring units differ in tone, grain, and edge wear, and mortar joints vary in depth and width. Mortarless fitted masonry shows hairline joints and no mortar at all, and its variation lives in the faces of the blocks. A course that is perfectly level, or a joint of perfectly constant width, is a tell of machine work and is broken by hand.

## Base Wear and Later Weathering

A surface carries two layers of age, and they are authored separately. Base wear belongs to the material and its working life: tool marks, handling polish at a latch or a threshold, scuffs, chipped edges, and soot. It is part of the base maps. Weathering belongs to the place and the years: moss, lichen, salt, rain streaking, sun bleaching, and rot, which differ by biome and are added as a layer on top so that one piece serves every climate. The layer is driven by the material's [weathering rules](../Building-system.md#weather-and-environment) and never baked into the base maps, which keeps a new piece looking new and an old one looking old without a second asset.

## Acceptance Check

A surface is accepted when it holds up at arm's length, about 60 centimetres from the surface, at first-person eye height, and not only in a lit studio view. It is judged twice: under neutral, even lighting that shows the maps honestly, and in the game's own lighting at dawn, noon, and dusk and in shade, where Lumen, the key light of its region, and the fog of the [biome](../Art-direction.md#light-colour-and-atmosphere-per-region) change what the same maps read as. The reviewer looks for stretched or blurry texels, visible tile edges, grain or coursing at the wrong scale, relief that reads inside out, albedo too bright or too dark, a roughness that never varies, and any pattern that gives away its repeat. A piece also passes only when three of its variants sit side by side and a corner, an opening, and a floor junction are checked in the same view. The reference set each brief in [Building Materials](Building-materials.md) calls for is the standard this check compares against.

## Continue Reading

Continue with [Building Materials](Building-materials.md) for the look each material must reach, [Art Direction](../Art-direction.md) for the rules above it, [Building System](../Building-system.md) for the pieces being made, and [Building System (Technical)](<../Building-system (Technical).md#106-asset-budgets-and-surface-standard>) for the budgets they live within.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
