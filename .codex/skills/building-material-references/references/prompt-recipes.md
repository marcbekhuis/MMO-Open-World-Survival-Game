# Building Material Reference Recipes

These recipes come from the first set of thirteen building-material plates. The set was strong on photorealism and pre-gunpowder construction, and the materials whose briefs were followed closely (fieldstone, clay and adobe, dressed stone, warded stone) came out right first time. The plates that failed all failed the same way: the generator drew the generic version of the material's name, a raw weathered plank, a canvas sheet, a stick hut, a crumbling daub wall, and skipped the traits that make this game's version different. The rules below exist to stop that.

## Standard plate layout

Every plate is 1536 by 1024 pixels, landscape, divided by thin dark-grey gutters into six panels, so the set reads as one series.

| Panel | Position | Content |
| --- | --- | --- |
| Assembled | Left half, full height | The material built into a real structure in its home setting, seen from first-person eye height (about 1,7 metres) at a slight angle, with a doorway or window, a corner, and the roof or wall top in view, fully dressed with its frame members and fittings. Natural daylight. |
| Bare wall front | Right half, top row, left | One isolated 3-metre wall piece with a window opening, three-quarter front view, on a plain mid-grey studio background with soft even light. Nothing fitted: no frame, glass, shutters, sill, door, posts, braces, or trims; the opening is a clean, finished reveal. What makes the material what it is stays on the piece (reinforced stone's built-in iron bands, straps, and jambs; warded stone's inlaid veins). |
| Bare wall rear | Right half, top row, right | The same bare piece from the rear three-quarter view, same background and light. |
| Parts | Right half, middle row, full width | The material's own frame members and fittings, each separate, laid out side by side on the same grey background: for example a post, a crossbeam, a brace, a window frame, a pair of shutters, a door leaf, as the brief's `Construction and Joints` lists them. |
| Close-up 1 | Right half, bottom row, left | The surface at arm's length: unit size, texture, colour variation. |
| Close-up 2 | Right half, bottom row, right | The defining joint or fixing: a pegged joint, a lashing, a mortar bed, an iron cramp, a crystal collar. |

Every piece is one simple part, as the building system requires, so the bare wall must never carry a frame member or fitting merged into it; those appear only in the assembled view and in the parts panel. The bare wall piece is a plain module piece, not a ruin, unless the brief's default condition is damaged. Damage and failure states belong to a separate plate when one is asked for.

## Must-show extraction

Before writing the prompt, read the whole brief and write down six to ten traits that a reviewer could check against the image. Each trait is concrete: a size in metres, a named colour range, a joint, a finish, a count, a default condition. Put first the traits that tell the material apart from its neighbours in the family, because those are the ones a generator replaces with the generic version. Then take every sentence in the brief's `Reference Set` that says what to avoid and turn it into a negative in the prompt.

Pay particular attention to three things the first round missed:

- The finish and default condition. A brief that describes a treatment (tar, oil, limewash, render) means the default piece wears it. Raw or stripped surfaces appear only where the brief says wear or damage shows them.
- Unit sizes and counts. Panel widths, stud counts, stone sizes, and board widths in the brief are measurements, not flavour; state them in the prompt in metres and as counts per 3-metre wall.
- What the material is made of, literally. Hides are animal skins with the animal's outline and markings, not fabric. Living wood is living stems still attached and in their own leaf, not cut sticks.

## Prompt scaffold

```text
Create an image: a photorealistic building-material reference plate for a first-person survival game set in a pre-gunpowder world. 1536 x 1024 pixels, landscape, six panels separated by thin dark-grey gutters: left half an assembled, fully dressed structure in its setting at first-person eye height; right half top row the bare 3-metre wall piece with an empty window opening, front and rear three-quarter views, on a plain mid-grey studio background, with no frame, glass, shutters, sill, door, posts, braces, or trims attached, but with any part the brief says belongs to the material itself (such as reinforced stone's iron bands); right half middle row the material's separate frame members and fittings laid out side by side on the same background; right half bottom row two close-ups.

Material: <Material title>, <one-line identity from the brief's opening paragraph>.

Must show (follow exactly):
- <Trait 1, the one that tells it apart from its neighbours.>
- <Trait 2 ...>
- <... six to ten in all, each concrete, with sizes in metres and counts per 3-metre wall.>

Default condition: <the finish and age the brief gives the material in service, e.g. "a few seasons old, tarred lower boards and sills, oiled boards above">.

Assembled panel: <structure and setting from the brief, e.g. "a farmstead hall on a stone footing in temperate forest">.
Close-up 1: <surface detail>. Close-up 2: <defining joint or fixing>.

Avoid: <every avoid-sentence from the brief's Reference Set, as plain negatives>, no text, no labels, no people, no glowing effects, no modern tools or materials.

Photorealistic, natural materials, physically plausible construction, the same lighting and finish as the attached style-anchor plate if one is attached (layout and finish only, not its material).
```

## Quality checklist

- Every must-show trait is visible, and you can name the panel that shows it.
- The default finish is present on the assembled view and on the kit piece; wear shows the base material only where the brief says it should.
- Unit sizes look right against the doorway (about 2,3 metres tall) and the 3-metre module; count studs, courses, or boards where the brief gives a count.
- Joints and fixings are of the kind the brief names, in the places it names, and nowhere else (no iron marks scattered over block faces, no nails in nail-free work).
- Openings use the arch or lintel form the brief names (segmental, semicircular, pointed, trapezoidal, slab).
- Nothing magical glows unless the brief says it does, and then only as it describes.
- The bare wall piece carries nothing fitted: no frame, glass, shutter, sill, door, post, brace, or trim is merged into it, and its opening reads as a finished reveal; parts the brief makes intrinsic to the material, such as reinforced stone's iron, are present.
- The parts panel shows each frame member and fitting the brief lists, separately, in the same material and finish as the assembled view.
- The bare wall is intact and is a plausible module piece; the plate follows the standard layout and size.

## Known misses

What generators have already got wrong, per material. Read the row for your material before prompting and check it first after generating. The right-hand column summarises the brief at the time the miss was seen; the brief stays authoritative, so where they differ, follow the brief and correct the row.

| Material | Generator tendency observed | What the brief requires |
| --- | --- | --- |
| Every material | The isolated kit piece shown with frames, shutters, doors, posts, or braces built into it | A bare wall piece with a clean opening, and every frame member and fitting shown separately in the parts panel; intrinsic parts such as reinforced stone's iron stay on the wall |
| Planked timber | Every board raw and weathered orange-brown, no finish | Tar-black lower boards and sills, oiled boards above with a faint sheen, three or four tones per wall |
| Thatch and hide | Hides drawn as even cream canvas cut to rectangles; poles ruler-straight; thatch courses as tiered skirts | Hides with irregular animal outlines, darker back and paler belly, stitched seams between hides; bent poles leaning a few degrees; each course pinned by visible hazel sways |
| Living wood | Walls of cut sticks in a grid with ivy over them; tight grey decking | Living stems still attached to the host, no cut ends, in their own leaf, grafted collars at joins; floor of pale ash or birch with a hand's width between boards |
| Timber and plaster | Raw crumbling daub panels; panels over a metre wide with two studs per wall | Limewashed panels, chalky white or pale earth tints with brush marks; panels 0,30 to 0,60 metres wide, five to seven studs per 3-metre wall |
| Rough timber | Log ends sawn flat with crisp rings | Axe-cut ends with a slightly pointed or chiselled profile |
| Fired brick | Full semicircular arch on the kit piece; heavily pitted bricks; mortar too wide | Shallow segmental arch; gritty but sound faces; fine pale joints about 0,01 metres |
| Cobblestone | Corner stones up to half a metre | Cobbles 0,10 to 0,25 metres, largest at the base and corners but still cobble-sized |
| Reinforced stone | Small iron crosses scattered over block faces; short strap hinges | Dovetail cramps only across joints at the top of a course; strap hinges running most of the way across the leaf |
| Fitted masonry | Rough pecked faces; loose cap blocks on the kit piece | Faces ground smooth with a slight pillowed bulge; a clean battered module piece |
| Warded stone | No stud at the panel centre; plain gate | Studs at quoins, keystones, and each panel centre; gates with a stud at each hinge and at the lock |
| Dressed stone | Plate at a different size from the set; faint scribble marks on block faces | Standard 1536 by 1024 layout; tool marks only (chiselled lines, punched dots, drafted margins) |

## Worked examples

Append each accepted plate's final prompt here, with its material, the date, and a one-line note on the fixes it needed, so the next plate starts from what worked.
