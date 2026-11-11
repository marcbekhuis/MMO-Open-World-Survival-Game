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

A material's roof at its three pitches (27, 45, and 60 degrees) and as a flat roof and its wall face combinations (for example plaster on one side and stone on the other, plaster on both, stone on both) go on a second plate in the same six-panel grid when the brief lists them: the assembled panel shows a building using several, and the other panels show one pitch or one face combination each.

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
| Several materials | The layout reference lends its adobe render or house silhouette to a different bare module | Check the studio tiles for the material and kit geometry independently of the assembled view. Use the accepted plate for the same material as a texture reference where available. |
| Several materials | A third macro tile is added to fit a separate close-up | Compose related fixing details in one photograph and keep two bottom tiles. |
| Stone materials (fieldstone, cobblestone, reinforced, warded) | A repeating embossed cross-hatch, woven, or fingerprint pattern stamped over every stone face, clearest in the close-ups | Natural stone surfaces only: grain, crystal speckle, tool marks, lichen; ask for "no repeating surface pattern, no embossed texture overlay" and inspect the macro tiles at full size before accepting |
| Roof and wall variant plates | The 60-degree study drawn as an A-frame whose eaves come down near the ground | Every pitch sits on the same full-height 3 m wall, with the eaves at the wall top; only the roof changes between studies |
| Living wood | Wall pieces with roots spreading far beyond the 3 m footprint; roof studies as rounded arches; an illustrated, fairy-tale finish | Roots and stems stay inside the piece's box on a flat base so it snaps to a foundation; roofs are planar 27-, 45-, and 60-degree pitches and flat; photographic, grounded finish |
| Fitted masonry | Variant plate in rough, pecked, squared blocks with open joints, unlike the main plate | Same ground, pillowed faces and hairline joints as the main plate, in either the squared or the polygonal style |
| Stone material revisions | A local fitting edit can reintroduce embossed swirls on other tiles, including close-ups | Recheck every tile after each edit. If the texture survives, redraw from a layout-only anchor and verify that the fittings still match the brief. |

## Worked examples

Append each accepted plate's final prompt here, with its material, the date, and a one-line note on the fixes it needed, so the next plate starts from what worked.

### Building material plates from 8 November 2026

The built-in image generator produced the main plates and the roof and wall studies. The main plates put the assembled example at left, the bare wall views at top right, the fittings below them and the two details at bottom right. The companion plates show the pitches and face combinations from each brief. Use the angles and dimensions in the briefs when modelling.

For the standard main-plate prompt, append the material block below to this shared opening. Clay and adobe uses its complete prompt directly.

```text
Produce a 1536×1024 landscape, six-panel photographic material plate for a grounded first-person pre-gunpowder game. The attached clay plate is a reference for GRID AND STUDIO LIGHTING ONLY, do not borrow its earth material or fittings. Exact grid of six tiles divided by thin dark grey gutters: LEFT HALF one large image of the finished structure at 1.7 m eye height in natural daylight, see corner and roof/wall top. RIGHT HALF TOP two tiles, the front and rear three-quarter views of the SAME bare 3 m wall module on mid-grey seamless studio backdrop. The window opening is a clean, empty reveal and you can see through it in both views. No attached fixtures or frame members in either studio module. RIGHT HALF MIDDLE one wide studio tile containing the specified fittings individually separated with air gaps. RIGHT HALF BOTTOM two equal detail tiles. No words, letters, labels, scale bars, modern objects, figures, glowing effects. Sound, hand-built, physically plausible, exact construction rather than a fantasy mood painting.
```

For the standard companion prompt, append its material block to the following opening. The living-wood companion used a full replacement prompt with its own material anchor.

```text
Create one 1536×1024 landscape photorealistic building-kit MODELLING VARIANT PLATE in a pre-gunpowder survival world. Borrow only the attached plate's six-panel grid, restrained exposure, grey backgrounds and thin grey gutters. This companion plate studies roof angles and wall finishes. Exactly SIX tiles: left half full height: one assembled multi-building scene at 1.7 m eye height in clear natural daylight, with straight-on gable ends readable and contrasting roof angles visible. Right half top row two isolated roof tiles, true end-on profile with a slight glimpse of roof depth: 27-degree shallow gable on left (rise/run 0.51), 45-degree even diagonal gable on right (rise/run 1). Right half middle row one wide studio tile: a single 60-degree steep gable (rise/run 1.73) and a separate flat 0-degree roof on the same unobstructed horizontal ground plane, both distinct and visibly separated. Right half bottom row two studio tiles: left tile pairs two small end-cut wall blocks offset on a grey plane, one for face combination A, one for B, no separator between objects; right tile one sample of C. Use return views with a square open reveal in each sample so front and inside finish can both be seen on the SAME wall block, one sample per finish combination. Show clean, finished, intact geometry and authentic surface textures. No text, dimensions, angle labels, figures, glow, modern materials, or extra gutters.
```

#### Clay and Adobe

The assembled doorway keeps the timber bearing and projecting beam ends. The studio pair shows the thick, empty splayed reveal. The parts strip separates the lintel, beam ends, door and shutter. The macros show the worn limewash, straw-flecked bricks, plinth and lintel bearing.

**Main plate prompt**

```text
Generate a 1536 × 1024 landscape photorealistic modelling reference plate, CLAY AND ADOBE, for a pre-gunpowder survival game. Attached previous adobe plate is a visual anchor for photographic texture, desert daylight and neutral grey studio; use this NEW EXACT SIX PANEL grid rather than its old grid. Thin dark grey separators. Left half full height: assembled adobe doorway with a recessed wooden door ajar, exposed 0.15 m deep split palm lintel and projecting timber beam ends, 0.30–0.50 m rough fieldstone plinth, flat clay roof edge with low parapet, corner at a slight angle, viewed at 1.7 m eye height under midday desert glare. Right half top row: two grey studio tiles showing front and reverse three-quarter views of exactly the same intact bare 3 m clay-rendered wall module with slight inward batter, at least 0.40 m thick with a clearly empty narrow splayed window reveal, rounded edges, and stone plinth. Absolutely no timber, lintel, projecting beam, shutter, or fitting on these studio wall views; clean clay reveal on all four sides. Right half middle row spanning both columns: separate detached split-palm lintel beam, short projecting beam ends, wooden door leaf and small shutter, individually visible against mid-grey with gaps between objects. Right half bottom row: two detail tiles, first thumb-smoothed pale ochre chalk-limewash and a small flake revealing straw flecks in hand-moulded 0.40 × 0.20 × 0.10 m sun-dried bricks above rough plinth; second exposed timber lintel bearing on earth brick in a deep splay. Earth is soft-edged and powdery matte with visible hand sweeps and drying hairlines; minor basal wear and splash stains, masonry mostly hidden under finish. Rounded, slightly irregular brick corners, 0.02–0.03 m near-flush mud mortar. Avoid identical bricks, ruler-straight edges, pristine white, uniform arches, repetitive tile textures, text, labels, people, glow, modern materials, extra panels.
```

**Companion plate prompt**

```text
Material is thumb-smoothed pale ochre limewashed adobe over hand-moulded straw-flecked sun-dried bricks, rough stone plinth. Assembled scene is a desert compound under natural sun with 27°, 45° and 60° clay-tile roofs and a low flat clay roof. The pitched roof assemblies use timber truss and matte clay tile. The flat specimen is a flat packed clay over reed matting and projecting timber beams, with a low rounded clay parapet. Wall face combinations A: thumb-smoothed rendered clay on both faces; B: bare buff straw-flecked adobe brick outside, smooth clay render inside; C: bare sun-dried adobe brick on both faces. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Cobblestone

The revision replaced plaster contamination from the layout reference with coursed river cobbles on the bare module and a set-back timber upper storey in the assembled view. The lower courses and corners use larger stones within the cobble scale. Lime mortar and edge-set paving are visible in the macros.

**Main plate prompt**

```text
Mortared RIVER COBBLE foundation and lower storey. Only water-rounded or flattened egg-shaped stones 0.10–0.25 m across everywhere; biggest near base and interlocking rounded corner, never larger than 0.25 m; many units per course of the 3 m piece. Courses level but step subtly, pale grey lime joints 0.02–0.04 m, slightly recessed with rain-darkening; mix grey, brown, rust, cream, blue-black and sparse white quartz. A 0.40–0.60 m thick wall with a slightly proud face, no cut quoins. Assembled: lower storey with a slab-lintelled door under timber sill plate and set-back timber upper storey under 45-degree tile roof, rounded corner and a bumpy cobble paved path. Bare walls have clean simple square empty opening with through-cobbles, no oversized corner blocks and no timber or slab fitted. Middle separate horizontal lintel, timber sill plate, sloping stone sill slab, plank door, shutter. Detail tiles show mortar-and-cobble relief at arm's reach and close cobbles set edge-up in a sandy paved bed. Avoid identical pebble-dash, perfectly round pebbles, repeated tile, huge boulders and game-block aesthetic.
```

**Main plate revisions**

```text
Target image: preserve the existing six-panel grid, palette, daylight, set of separate fittings, macro photos, small rounded stones, framing, open window and assembled doorway. Correct the material in the upper right pair and the upper storey in the large left photo. In BOTH top-right studio views all surfaces of the entire 3 m bare module, from bottom to top around the window and inside its reveal, are coursed rounded river cobblestone in pale lime mortar, with the same small 0.10–0.25 m stones as the lower part. Remove all solid pale stucco from the module, do not add any parts. In the large left photo change only the plaster above the sill plate to a set-back weathered TIMBER BOARD upper storey, with wooden grain and board seams. Keep everything else identical. Keep same six-panel grid and 1536×1024 landscape canvas.
```

**Companion plate prompt**

```text
Material is coursed rounded river cobbles 0.10–0.25 m in pale grey lime mortar, grey and rust mineral variation, no cut blocks. Assembled scene is a temperate smallholding with cobble lower walls under timber and 45° tile. The pitched roof assemblies use timber-framed roof under staggered clay tile. The flat specimen is a flat roof with restrained historical timber-and-slab construction. Wall face combinations A: mortared river cobbles on both faces; B: cobbles outside, light lime plaster inside; C: lime plaster on both faces. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Dressed Stone

The assembled keep shows the coped wall and corner quoins. The bare studio opening retains its coursed arch. The fittings are separate and the close-ups show drafted margins, parallel chisel marks and wedge-shaped voussoirs.

**Main plate prompt**

```text
DRESSED STONE ashlar keep in warm honey and cream limestone with individual quarry variation. Squared units approx 0.60×0.30×0.30–0.40 m with crisp but mildly chipped arrises, half-overlapped running bond and pale, fine but subtly variable 0.005–0.01 m lime joints, regular horizontal courses, alternating long-short corner quoins. Straight parallel chisel grooves and punched dots, drafted smooth margins, NO glyphs or scratch writing on stone. Assembled keep with semicircular wedge-voussoir arch and keystone around a timber door, barred slit window and coped parapet. Bare intact ashlar wall module has its own coursed wedge-stone arch and chamfered reveal, no door or fittings; make arch visible from both sides. Show separately a lintel, drip-grooved slab sill, window frame, shutters, iron bars, door leaf and coping. Detail tiles show drafted margins and tooling, and the radiating arch voussoir lime joints. Slight joint recession, slight lichen and arris wear. Avoid glossy faces, perfectly identical blocks, uniformly hairline dry joints, repeated game tiles, all letterlike scribbles.
```

**Companion plate prompt**

```text
Material is honey limestone ashlar, alternating 0.60×0.30 m blocks with fine lime joints and straight chisel strokes. Assembled scene is a keep courtyard with slate over coped gables and a flat leaded tower roof. The pitched roof assemblies use slate over timber over an ashlar coped gable. The flat specimen is a flat leaded roof behind a coped ashlar parapet. Wall face combinations A: tooled ashlar on both faces; B: ashlar outside, lime plaster inside; C: lime plaster on both faces. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Fieldstone

The revision replaced a slab-like head on the bare piece with an integral dry-laid square reveal. The assembled cabin retains the slab lintel. The fittings strip separates the lintel, sill, timber plate, door and shutter. Lichen, wedges and shadow joints show in the close-ups.

**Main plate prompt**

```text
Dry-laid FIELDSTONE frontier cabin in grey upland granite and gneiss. Uncut split, lumpy and rounded stones from fist-sized wedges to one-metre slabs; largest low, small high, 0.50–0.80 m thick face with gentle batter, rounded corners, long through-stones across the thickness and turf/edge-stone cap. Dry shadow joints 0.01–0.05 m with little wedges pinning gaps, no mortar whatsoever, patchy lichen and moss native to the stone. Assembled cabin has single flat slab lintel and deep set plank door under a turf roof, corner in view. Bare wall with narrow SQUARE reveal and ordinary rough coursing around it; no separate jambs, no fitted lintel slab, no sill, no arch. Separate in middle strip slab lintel, rough sill slab, plank door, small shutter, and timber wall plate. Details show unequal rock faces and lichen, plus dark dry joint and small wedges. Avoid regular paving-size units, uniform stone tile, repeat textures and survival-game stacked-rock appearance.
```

**Main plate revisions**

```text
Target image: preserve the identical six-panel grid, macro photos, palette, patchy lichens, assembled cabin with its big slab lintel, and fittings strip with detached slab lintel and other fittings. Correct just the same bare module in the TWO TOP RIGHT tiles: replace the projecting or individually distinguishable lintel-like large horizontal slab over the empty window with a flush integral structural head made of two or three ordinary irregular rough fieldstones, indistinguishable from the neighbouring course and not an attached lintel. Use ordinary dry-laid stones at each jamb too, no separate jamb pieces; maintain the very square reveal, no arch, no new fittings. Keep everything else identical, same 1536×1024 landscape six-panel canvas.
```

**Companion plate prompt**

```text
Material is rough dry-laid irregular granite fieldstone, wedged chips and dark shadow joints, largest stones at base. Assembled scene is a upland frontier cabin with fieldstone gables and turf or stone-slate roofs. The pitched roof assemblies use timber-framed dark stone slate. The flat specimen is a flat turf over timber poles. Wall face combinations A: dry-laid fieldstone on both faces; B: bare fieldstone outside, uneven pale lime render inside; C: lime render on both faces. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Fired Brick

The assembled and bare views show a shallow segmental arch and a stone plinth. The fittings strip shows the lintel and coping separately. The macro shows pale lime joints, a gritty but sound surface, alternating headers and stretchers, and kiln colour variation.

**Main plate prompt**

```text
FIRED BRICK English bond town house with stepped gable and stone plinth. Alternate clearly legible full rows of long stretchers and short header ends (never running bond only); 0.25×0.12×0.07 m hand-moulded bricks, lightly gritty matte and sound with occasional minor edge spalls, slight warp. Mixed kiln straw-yellow, salmon, red, and purple-brown, mostly warm brick-red. Very fine 0.01 m pale grey-cream mortar lines, flush or slightly recessed. Both kit views show the SAME naked brick module with intrinsic SHALLOW SEGMENTAL arch of wedge-laid bricks and a half-brick rebate; arch rises only about one fifth of its span, absolutely no semicircular arch. Assembled tile shows shallow arch over timber door, fitted shuttered window and 45-degree pantile gable. Individual parts shown on grey: squared lintel, projecting slab sill, wood window frame, shutters, wooden door, stone coping. Details show gritty non-pitted brick with fine mortar and corner of the segmental arch bond. Slight smoke under eaves. Avoid deep pitting, thick bright mortar, modern machine-pressed blocks, monochrome repeated texture and borrowed game-kit shapes.
```

**Companion plate prompt**

```text
Material is matt hand-moulded kiln-red English-bond brick, alternating headers and stretchers with narrow pale joints. Assembled scene is a brick town workshops, shallow segmental windows and stepped gables. The pitched roof assemblies use timber trusses and clay pantiles. The flat specimen is a flat behind brick parapet with stone caps. Wall face combinations A: fired brick on both faces; B: brick outside, lime plaster inside; C: lime plaster on both faces. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Fitted Masonry

The main plate shows pillowed polygonal work, dry joints, a clean battered edge and a bare trapezoidal reveal. The companion uses the squared dressing and the revision makes all three finish samples trapezoidal.

**Main plate prompt**

```text
Dwarven dry FITTED MASONRY, battered polygonal basalt gatehouse in mountain setting. Five- to seven-sided curved interlocking blocks 0.60–1.40 m across, 6–8 principal blocks on a 3 m module, no continuous courses, 0.001–0.003 m hairline dark joints and absolutely no mortar. Smooth ground cool slate-grey faces with very subtle pillowed bulge and faint directional tool grain; sound stone and only slight oil/soot wear, NO rough pecked face. The assembled entrance has a big detached-in-kit lintel stone over a trapezoidal doorway and a metal-strapped timber door; show slight inward wall batter. Both bare kit views show the same clean battered panel with top edge integral and free from cap blocks, and empty trapezoidal opening wider at sill with inward-leaning jambs. No merged fittings. Middle strip four distinct items: plain monolithic lintel stone, strapped door leaf, iron grille, stone sill. Details show smooth pillowing and faint grain at a dry seam and a multi-block puzzle junction. Avoid rectangular tiling, cartoon runes, bright seams or shiny magic.
```

**Companion plate prompt**

```text
Material is smooth, subtly pillowed blue-grey polygonal basalt blocks with mortarless hairline joints and a battered face. Assembled scene is a dwarven hold at the foot of a mountain, ground-smooth fitted work, no ornament or glow. The pitched roof assemblies use heavy slate and fitted stone gable. The flat specimen is a flat corbel-supported slabs with tightly fitted joints. Wall face combinations A: fitted stone on both faces; B: fitted stone outside, smooth pale plaster lining inside; C: smooth pale plaster lining on both faces. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

**Companion revision**

```text
Keep the six-panel layout and every roof angle, stone surface, lighting, and matching plaster and bare face combinations. Change only the window reveals in the two bottom tiles (the three little modules): all three openings should be the same characteristic trapezoid, the jambs sloping inward to a narrower head. These are genuine open holes with studio background visible and the lining glimpsed on the rear return, not closed niches. In the first module the return is bare stone, in the second the return is smooth pale plaster, in the third both faces are smooth pale plaster. Keep all upper panels identical. 1536×1024 landscape.
```

#### Living Wood

The main plate shows stems rooted in their own piece, foliage emerging from silver bark, separate door boughs and a free-standing wall in the clearing. The revision widened the gaps in the pale decking. The companion was regenerated using the accepted living-wood image as the material reference.

**Main plate prompt**

```text
e sample. Macro tiles show leaves visibly sprouting from woven silver stems and continuous raised bark graft collar with bast lashing. Muted greens, damp bark, restrained moss. No lights, glowing script, filigree, white marble, symmetrical machine curves, cartoon greens, no dead stick grid, no structure bolted onto trunk.
```

**Main plate revisions**

```text
Keep the composition, all six panels, palette, joined living stems, leaves, roots, detached parts, woodland, arch, separate standing wall, and macros identical. Correct only the foreground decking in the large left panel: use pale cream ash planks with conspicuous open 7–9 cm gaps (about the width of a hand) between the boards, seen from eye level, and wooden pegs. The openings should show shade underneath instead of looking like seams. Keep every other detail identical. 1536×1024 landscape.
```

**Companion plate prompt**

```text
Use the ATTACHED image as material anchor; all walls in this new sheet must match the pictured organically living self-rooted panels, with connected roots and undulating silver-grey living stems crossing over and under, their own attached beech leaves, no cut or sawn ends on any woven stem, and continuous raised graft collars. Never use straight dead stick wicker, post-and-rail grids, or ivy on separate branches. Generate a 1536×1024 LANDSCAPE photorealistic six-panel companion variants plate. Left full-height half: several living-wood bower roof forms among immense temperate tree trunks at eye height, including one free-standing rooted silver-bark bower in a clearing. Top right half two grey studio cells: front gable profiles showing 27° and 45° respectively, each a roof section made from living woven curved boughs with overlapping bark shingles, fresh attached leaves and patches of moss. Right middle wide grey studio cell: distinct separated 60° steep gable and flat horizontal 0° roof made in the same construction. Right bottom two grey studio cells: first cell two small separate wall modules, showing one with the living stems visible on both faces, second with a living-stem face and pale ash lining on reverse return. Last cell third wall module showing living stems outside with woven bast mats inside at the return. Let the openings show both finish materials and same structural weave. Keep all living wood very organic, visibly rooted, with no log ends or dead cut grid, no text, no figures, no magic lights. Exactly six tiles with thin dark grey gutters.
```

#### Planked Timber

The assembled wall and macro show tar-black lower boards, warm oiled boards, paired pegs and a square nail. The first revision stripped the two kit views down to boards. The next gave them opposed three-quarter angles so the empty reveal and board thickness are visible.

**Main plate prompt**

```text
 above pitch-black lowest boards, then paired pegs at mortise-and-tenon with square nail nearby. Avoid uniform plank widths, razor edges, perfectly butted seams, tiled grain, no end grain or fastenings, cartoon bevels or plastic shine.
```

**Main plate revisions**

```text
Keep everything identical except replace both top-right tiles with the front and rear of one bare wall skin only, a 3-metre wide flat rectangle of oiled vertical brown planks, tar-black at bottom, with one empty square window hole cut through the wood. The wall is thin, with plain exposed board edges all around and a natural same-board end grain at the opening. No house in these two tiles, no roof, foundation, beams, post, rails, frame, sill, brace, attached parts, or trim; just uninterrupted boards in a rectangle, on the same mid-grey background. Retain the existing left scene, middle fittings strip and two details pixel-for-pixel wherever possible. Same 1536×1024 six-panel canvas.
```

```text
Change ONLY the camera angle in the two top-right kit tiles: show the same bare thin plank rectangle from 25 degrees off-axis in the first tile and the true opposite rear side 25 degrees off-axis in the second tile. Angle them visibly so you can see the thin wood end-grain edge and an empty window reveal, and can tell that one view is the back. Preserve the already-correct bare design exactly: only oiled boards, black tar on the bottom strip, absolutely no timbers, beams, roof, battens or fittings attached. Same studio background. Keep the entire remaining plate identical, six tiles 1536×1024.
```

**Companion plate prompt**

```text
Material is varied warm-brown oil-finished hand-split boards with tar-black lowest boards and separate oak frame. Assembled scene is a forest-edge farmstead of tarred and oiled boards under shingle roofs. The pitched roof assemblies use timber rafters and riven oak shakes. The flat specimen is a flat boarded timber roof over joists. Wall face combinations A: boards on both faces; B: oiled boards outside, smooth hand-planed boards inside; C: oiled boards outside, pale lime plaster inside. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Reinforced Stone

The bare piece retains its built-in edge straps, band and jambs. The parts strip separates the plated lintel, studded gate, long-hinged door and bars. The revision brought the cramp and angle strap into one close-up, leaving the rivet and rust detail beside it.

**Main plate prompt**

```text
lle. Macro tiles: band rivets and rust run; single cramp across joint at top edge of course, no other decorative metal. Avoid clean uniform iron, decorative random bolts and fantasy fortress styling.
```

**Main plate revisions**

```text
Change only the layout of the bottom-right row. Preserve every other pixel in the plate. Merge the current bottom-middle cramp close-up and bottom-right corner close-up into one single wider photographic detail tile of an iron cramp spanning a vertical block joint at the top edge of a course, with the corner angle strap visible nearby in the SAME uninterrupted shot. Keep the rivet-and-rust detail in the bottom left of the right half. The bottom row must have exactly two tiles and one vertical gutter, six tiles total. Preserve the 1536×1024 canvas and all other content.
```

**Companion plate prompt**

```text
Material is pale tooled ashlar with dark built-in horizontal iron bands, edge straps and iron jambs on exposed stone faces. Assembled scene is a iron-banded keep with riveted reinforcement and rust streaks. The pitched roof assemblies use slate over timber with iron-bound stone gable edges. The flat specimen is a flat roof recessed behind iron-bound battlements. Wall face combinations A: banded and strapped ashlar on both faces; B: banded ashlar outside, pale lime plaster inside; C: lime plaster on both faces covering the stone surfaces, iron belonging to the stone beneath. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Rough Timber

The assembled and studio views show the projecting, axe-faceted log ends. The studio opening stays bare. The close-ups show moss chinking, adze-like axe facets, resin, a wooden peg and the saddle-notched corner.

**Main plate prompt**

```text
tch showing projecting axe-faceted ends. Avoid machine cylinders, repeated bark, clean-cut end grain, flat brown, uniform sawn log ends, fresh all-pale exterior.
```

**Companion plate prompt**

```text
Material is partly stripped spruce logs, moss chinking, axe-faceted projecting saddle-notched ends, lightly silvered. Assembled scene is a rough frontier log cabins, including a low sod roof and a 45-degree shake roof. The pitched roof assemblies use split shakes over log rafters, turf on the 27° sample. The flat specimen is a flat sod over log joists. Wall face combinations A: rough logs on both faces; B: rough logs outside, split planks inside; C: rough logs outside, clay plaster inside. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Thatch and Hide

The assembled shelter shows irregular dark-backed hides, stitched seams, bent poles, sway pins and ridge capping. The first revision removed the roof-like silhouette from the studio piece, separated its corner pole bundle and consolidated the macros. The next showed the front and back in opposed three-quarter views. The companion edit replaced long reed screens with swayed, overlapping thatch courses.

**Main plate prompt**

```text
corner pole, jamb, lintel, hide flap, hurdle. Middle row separated bundled corner pair, bent jamb pole, lintel pole, stitched hide flap with leg lobes, woven withy hurdle. Macros pinned reeds and lashing; stitches and distinct skin tone. No square cream canvas, straight poles, heritage cottage grooming, matching cut skins, teepee, bright saturated yellow, bones, feather trim or repeated textures.
```

**Main plate revisions**

```text
Correct the six-panel kit layout without changing the large left image or the hide, lashings, pins or reed appearance. Both top right tiles must show the same upright FLAT single rectangular thatched wall panel, just one 3 m wide panel, slightly uneven and only a few degrees off true, with the SAME visible empty square window hole from opposite sides. There must be NO roof, triangle, peaked ridge or second perpendicular wall on this kit panel. In the fittings strip replace the two bound bundles of reeds with two bark-on sapling poles lashed together, the corner pole bundle; leave the separate jamb, lintel, irregular hide flap and hurdle. Bottom row should be exactly TWO tiles, one macro of the lashed hazel sway pin and thatch, one macro of dark dorsal hide fading to pale belly with two hides sewn together. Remove the third bottom tile. Preserve every other detail and canvas size 1536×1024.
```

```text
Change ONLY the camera angles in the two top-right kit tiles. Show the same single flat lashed reed panel from 25 degrees off-axis in the first tile, and from its actual REVERSE side in rear three-quarter view in the second. The reverse shows more of the horizontal rails and rear lashing of the intrinsic panel. In both views clearly show the empty rectangular gap and depth of the reed skin on the edge. The object is one upright flat wall only, no roof, no gable, no corner return or separate frame members. Retain all other panels unchanged and keep six tiles on 1536×1024 landscape.
```

**Companion plate prompt**

```text
Material is bent hazel poles, figure-eight lashings, grey-gold pinned reed yelms, irregular overlapping stitched animal skins with dark backs and pale bellies. Assembled scene is a small herder shelters in a grassy clearing, rough thatch and animal skins. The pitched roof assemblies use thatch over lashed saplings with split-hazel sway pins and thick ridge capping. The flat specimen is a flat turf over lashed poles. Wall face combinations A: pinned reed thatch on both faces; B: overlapping stitched animal hides on both faces; C: reed thatch outside, stitched animal hides inside. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

**Companion revision**

```text
Edit only the exposed reed wall surfaces in the attached six-panel variants plate. Preserve the intact roof specimens, roofs on the buildings, grass and animals, and all irregular stitched hide surfaces. Every reed wall currently looks like one vertical screen of full-length sticks. Replace those wall surfaces, including the two reed-faced bottom specimens and the reed-faced walls below the roof shapes, with OVERLAPPING HORIZONTAL COURSES of reed yelm bundles about 0.20 m deep. Each course has an irregular loose fringe at its lower edge, a slight dark horizontal shadow line where it overlaps the course below, and a clearly visible split-hazel sway pinned across the course with bast lashings. Keep the same irregular posts and apertures, face treatments, exact six-panel grid, scene and 1536×1024 landscape framing.
```

#### Timber and Plaster

The assembled wall shows close oak studding, limewash, leaded glass, a plinth and the curved jetty brackets. The revision removed the thick footing and gave the bare infill a thin edge. The fittings and the limewash and pegged bracket details are separate.

**Main plate prompt**

```text
, broad infill panels, two-stud grid, repeating timber patterns, razor edges, cartoon beams and pristine flat plaster.
```

**Main plate revisions**

```text
Preserve every tile, every fitting, and the overall 1536×1024 six-panel composition. Correct ONLY the two TOP-RIGHT studio tiles. Replace the chunky stone-footed adobe-like blocks with front and reverse three-quarter views of exactly the same THIN flat rectangular wattle-and-daub INFILL panel, approximately 0.08–0.10 m thick across its entire width and clearly thin at its exposed side and window reveal. Chalky warm off-white matte limewash on both faces, subtle brush marks, shallow hand-shaped bulge, window hole clean and empty. It is a single plastered timber-frame infill piece shown before the frame is placed. No stone footing, plinth, thick base, battered edges, earth blocks, outer wood frame, studs, bars, sill or fittings. Plain mid-grey studio background. Keep the assembled house, the fittings strip and bottom two detail tiles identical.
```

**Companion plate prompt**

```text
Material is chalky off-white hand-brushed limewash over slightly bulging plaster, dark hand-hewn oak framing separate. Assembled scene is a two-storey jettied town houses with five to seven studs per 3 m bay and clay tile roofs. The pitched roof assemblies use timber rafters, red clay tiles with thick ridge and shallow eaves. The flat specimen is a flat boarded timber assembly. Wall face combinations A: lime plaster on both faces; B: lime plaster outside, hand-planed oak boards inside; C: lime plaster outside, exposed woven hazel wattle or herringbone nogging inside. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

#### Warded Stone

The assembled view shows flush mineral veins and collared studs at the quoins, keystone, panel centre, gate hinges and lock. The revisions removed background masonry and all fitted parts from the studio wall, separated the gate hardware in the parts strip and restored the courtyard view behind the assembled gate.

**Main plate prompt**

```text
flush inlay across actual stone seams, and single mineral stud collar (cold cloudy quartz colour, dull waxy highlights and inclusions). Avoid glowing runes, neon seams, floating particles, uniform bright crystals and borrowed magic-game wall aesthetics.
```

**Main plate revisions**

```text
Preserve the six-panel composition, assembled citadel gate with studs at hinges and lock, non-glowing minerals, the central wall stud, separate crystal studs, lintel, and close-ups. Correct the two studio top views so they show a single detached 3 m wall slab, with the empty opening visibly opening onto a uniform mid-grey studio background. Remove all secondary walls or interior masonry visible through either opening. The wall slab itself keeps its own branching flush-ground quartz-like veins, now a narrow vein also follows both jambs and the head as a continuous frame line, but has no crystal studs. In the middle parts tile, take the attached crystal hardware off the detached gate leaf so the separate hinge studs and lock stud can be studied beside it; keep the studs in place on the assembled gate at left. Keep everything else identical. 1536×1024 landscape.
```

```text
Change only the flat grey void visible through the open gate in the large LEFT ASSEMBLED PHOTO. Replace that void with a dark, believable depth of passage through the fortress, with a stone floor, timber beams in shadow under the lintel, and a distant sunlit courtyard through it. Keep the same current gate leaf and all crystal studs in their places, the existing castle wall and setting, and every other pixel and tile. The TWO TOP RIGHT STUDIO openings must still open to the plain grey studio, completely bare. Preserve the separate fitting objects and non-emissive quartz material and 1536×1024 six-panel layout.
```

**Companion plate prompt**

```text
Material is dark grey ashlar with branching flush milky blue-white quartz-like veins, dull and unlit in daylight. Assembled scene is a dark stone citadel with flush mineral veins and collared crystal studs visible on the gate, no glow. The pitched roof assemblies use stone slab roof on a plausible heavy substructure. The flat specimen is a flat stone slab roof. Wall face combinations A: non-emissive veined ashlar on both faces; B: veined ashlar outside, plain lining inside; C: plain lining on both faces covering the stone surfaces, veins belonging to the stone beneath. Keep the module structure identical between the three wall specimens; the two finishes meet at the return where they differ. Each single-material specimen has matching finish on both sides.
```

**Companion revisions**

The first edit replaced bare crystal points with bronze-collared studs. The second moved the studs to the hinges and lock plates while retaining the roof and wall samples.

```text
Edit image 1, the six-panel roof and wall-finish variants plate. Image 2 is a reference for the warded gate stud design only. Change only the ornament on the gate in the large left photo of image 1. Replace the pointed bare gems on the wooden leaves with small dull cloudy grey-blue faceted quartz-like studs fitted into round aged bronze collars. Place each stud purposefully at a gate hinge or the lock, and show one on the keystone stone above the entrance and one at the centre of the neighbouring wall bay. Use the same construction and mineral appearance as the reference, no light emission. Retain all roof variants, the existing stonework and flush inlays, and all five right-side studio panels identical. Preserve six tiles and 1536×1024 landscape.
```

```text
A very small local edit to the wooden double gate in the large LEFT photo. Its bronze collars are correct. On the wooden doors keep the four outermost crystal studs, one at each end-hinge of the two gates on the second and third bars. Remove the remaining stud collars from the horizontal bars, leaving small plain dark nailheads. Place two of the removed crystal collars on the two square lock plates directly above the round pull rings at the central meeting seam. The ring handles stay. This corrects the functional locations of the crystals on the wood. Keep the two collared crystals mounted on the masonry, the exact architecture, light, materials and every one of the five right-side panels unchanged. The same six-panel 1536×1024 plate.
```

### Building material plate revisions from 9 November 2026

#### Cobblestone main

A redraw with the adobe plate as a layout-only anchor removed the surface weave while preserving the river cobbles and separate fittings.

```text
Generate a NEW 1536 × 1024 landscape architectural material reference plate. Use the attached images ONLY as a placement sketch; redraw all imagery from scratch, don't paint over or transfer the old texture. Strictly six panels with fine dark grey gutters. Left half one large on-location eye-height photo. Right half two upper grey studio views of the same bare 3 m wall, front and reverse, a wide middle strip of detached pieces, two close-ups below. Real pre-gunpowder architectural and geology photographs, no text, labels or people. Avoid exaggerated micro-relief. All stone faces must look like actual natural stone photographed under soft natural light.

Use mixed dull grey, brown, rust, cream and blue-black river cobbles with a few white quartz ones. They are smooth round or flattened water-worn stones (0.10–0.25 m), with authentic rock mineral speckles, with no visible scratches. Pick out subtle stone colour against 0.02–0.04 m recessed grey-white lime joints. Left: slab-lintelled door in lower storey, above it a set-back plank storey supported on a timber sill plate and a tiled roof, bumpy edge-set cobble paving. Top right: one bare 0.4–0.6 m thick module with simple square window reveal, front and back, rounded through-cobbles, largest at base, small near top, no fitted parts. Middle right: detached lintel, timber sill plate, slope-sided stone sill slab, plank door, shutter. Lower right macros: smooth river cobbles in mortar and equally smooth cobble paving in sand. The close-ups must show smooth, minimally textured river pebbles of varied colour and irregular oval form; absolutely no embossing, hatching, looping or repeating surface. Macro stone can be relatively featureless aside from scattered speckles.
```

#### Fieldstone main

A fresh render produced natural mineral grain and lichen. The lower-right panel shows a dry wedge and slab bearing.

```text
Create an entirely new 1536 × 1024 landscape photographic reference sheet of a traditional dry-stone fieldstone hut and its wall kit. The fieldstone in EVERY frame consists of plain grey weathered granite boulders, naturally irregular, mineral surface made of randomly distributed salt-and-pepper crystalline dots and nearly flat cleaved planes with occasional pale lichen islands and edge moss. Do not draw engraved marks, relief, etching, parallel comb marks, abstract high-frequency texture, procedural noise or any texture laid over the image. Ordinary granite under an overcast sky, with a few very plain unmarked stones as in real vernacular Scottish upland architecture. Grey-brown light, distinctly documentary photography, natural soft colours. Six panels divided by thin dark grey gutters. Left half full height: a first-person eye-height documentary photograph of a low turf-roofed dry-laid upland hut with thick battered corner, a slab lintel and narrow open plank door. Use uneven natural stones ranging from thumb-sized wedges to slabs 1 m across. Stacked with no mortar and narrow dark irregular joints. Top right two separate tiles: front and rear three-quarter views of the same bare 3 m wide wall module, 0.50–0.80 m thick and battered, narrow square empty window hole with upright stone jambs and no fittings; neutral mid-grey studio. Right middle one wide tile: detached timber wall plate, broad stone slab lintel, rough sill, plank door and shutter, spaced apart on grey. Right bottom two close photographs: salt-and-pepper natural granular grey granite and lichen, and two big flat stones with a small chock wedged in the dry gap beneath the slab lintel. Close-up surfaces have naturally irregular plain mineral facets and very fine flecks, no patterns of lines. Avoid regular cut ashlar, regular cobbles, mortar, matching stones, repeating texture, raised swirls, generic game kit, labels, people and text.
```

#### Fitted Masonry variants

The finish correction tightened the joints and smoothed the faces while keeping the battered walls and lining samples.

```text
Edit this photographic fitted masonry roof and wall variant plate. Change only the finish and joints of the squared masonry blocks throughout. In all stone walls use cool grey, fine-grained, ground-smooth matte granite with subtly pillowed faces, near-invisible 1–3 mm dry-fit joints and tiny mineral flecks. Remove pecked craters, chips and open cracks. No mortar, no graphic repetitive texture, no decorative runes, no glow. Preserve the few-degree wall batter, trapezoidal openings with broad sills and narrower heads, same front views of roof pitches and flat slab supported on corbels, and bottom wall samples (bare stone both faces, stone exterior with pale plaster lining, lining on both faces). Keep the mountain gatehouse composition and studio lighting. Do not change any wall or roof geometry or render the plaster as stone. Keep exactly six photographic panels on a 1536 × 1024 landscape canvas with thin grey gutters: large eye-height scene on the left, two tiles top right, one wide middle right tile, two bottom right tiles. No text or measurements printed.
```

#### Living Wood main

The roots fit inside the flat-bottomed wall piece. The large photograph shows the gapped deck and the macros show bark and bast lashing.

```text
Regenerate this living wood image as documentary architectural photography with the same 1536 × 1024 six-panel reference layout. The attached image anchors the kit inventory and layout only. PRIORITY: the two top-right bare panels are the SAME freestanding snap-ready 3 m square wall panel in front and reverse three-quarter views. Its footprint is a thin rectangle. Place the module on a perfectly flat unobtrusive studio floor. All roots remain within the wall thickness and sit in a shallow rectangular recessed root bed flush to the bottom edge, no visible external roots, flare or tendrils on floor, no host tree required. The module has tightly controlled flat bottom, square sides, and a clean empty roughly rectangular unwoven window gap, no external frame, posts, bough arch, sill or doors. Thin rooted tapered hazel and ash stems 0.04–0.10 m at base, 0.02–0.03 m at tip, woven loosely at 0.15–0.30 m spacing. Living stems bear their OWN leaves in muted spring green, continuous bark across swollen grafts and tiny healed pruning scars, matte silvery-grey ash bark. Keep the left large first-person photograph at 1.7 m on a gapped pale ash or birch pegged deck with hand-width open rain gaps. The wall feet meet a floor frame, a separate asymmetrical trained door arch of living boughs sits between panels, and stairs and bark-shingled roof are glimpsed. A second panel stands on open ground in the distance. Ancient forest of massive wet trunks, cool natural ambient, leaves with age variation, candid believable architectural photography. Middle right separate curved post, arch boughs, woven bast-hinged door, mat and lashing on grey. Lower macros of a live graft collar and a bark-strip bast lashing. Grounded irregular wood, no fantasy gloss, glowing elements, art-nouveau symmetry, host-root spill, ivy on dead sticks, bright yellow-green, metal nails, text or extra panels.
```

#### Living Wood variants

The roof planes are straight and the walls have contained roots. The final edit reinstated the sixth panel.

```text
Regenerate the attached living wood roof/wall study as restrained architectural photography. Retain its layout and kit finish combinations. The four studio roof studies must clearly show the same full-height rectangular 3 m wall footprint, same width and height, all with visible upright sidewalls rising to the eaves from a flat floor. Roofs sit entirely ABOVE these upright walls. The gable silhouette is a pentagon (a triangle on a square), never an A-frame triangle whose edges run to the ground. Show 27° top left, 45° top right, 60° middle left, and flat middle right. Use straight uncurved roof planes and visible horizontal eave lines. Make the roof profiles clearly distinct: rise to half-span ratios approximately 0.51, 1, and 1.73. Framing may zoom out to fit the tallest profile. Every studio roof sits on a complete full-height 3 m rectangular woven living-stem wall, with identical sidewall proportions. The straight bark-shingled planes of the gable roof have irregular overlapping bark scales, faint patches of moss and a few living leaves, but the main outline is straight from ridge to eave. Do not round the slope into an arch. Bottom right show all three wall specimens: woven silver-barked live hazel/ash stems on both sides, woven outside with pale ash boards inside, woven outside with a close-woven bast mat inside. Show each pairing through its empty window opening and a slight return. The woven stems bear their own muted green leaves. All roots are contained INSIDE the same flat-bottomed rectangular wall box, not protruding at all, not reaching onto the ground, for a snap-ready wall. The assembled left scene is a physically plausible beech-and-ash woodland hamlet at first-person eye height, with a gapped pale board walkway and clean planar bark roof pitches on woven rectangular walls. Real unsaturated silver bark, cool daylight, photographic grain and believable joins, no fairy-tale architecture, smooth CGI, glowing light, round roof, floor roots, neon foliage or text. Keep exactly six photographic panels on a 1536 × 1024 landscape canvas with thin grey gutters: large eye-height scene on the left, two tiles top right, one wide middle right tile, two bottom right tiles. No text or measurements printed.
```

```text
Make one very small layout edit to this exact 1536 × 1024 building-material reference plate. Add one thin dark-grey vertical divider matching the thickness of the existing other gutters, ONLY in the bottom-right row, in the clean gap between the SECOND wall sample (pale boards lining) and THIRD wall sample (woven bast lining). It runs from the existing horizontal divider immediately above the wall samples to the bottom edge. This gives two wall samples in one tile at bottom-left of right half and the single bast-lined sample in its own tile at bottom-right. The canvas then has exactly six panels. Preserve all existing photos, crop, objects, wood, contained root beds, straight roof pitches, natural tones, lighting, and every other gutter exactly. Do not put any other dividers or borders inside any panel. No labels.
```

#### Planked Timber main

The board colour shifts to warm mid-brown with a tarred base, separate frame members and visible pegs.

```text
Edit the attached 1536 × 1024 six-panel photoreal modelling plate. Change ONLY the treatment of the oiled wooden boards on the hall walls and door, the two bare wall views, the wood fittings and the two macros. Replace the saturated amber-orange with warm mid-brown, like a mix of medium walnut, chestnut and muted oak, 3–4 close natural shades, subdued oil sheen and clear lengthwise grain and adze/saw traces. Keep the treatment distinctly brown under neutral daylight, with no strong amber cast and no varnish sheen. Keep the black tar on the sill and lower course, the dark load-bearing timber posts, exposed pale paired pegs and forged square-headed nail, board widths and seams, footing, grey studio background and all six panels. The studio wall stays free of added frame, with its clean square window reveal, and the fitting strip remains separate. Keep the original scene and all object outlines and lighting. No plastic, oversaturated amber, repeated grain, smooth uniform boards or text.
```

#### Planked Timber variants

The steep gable sits above a clear head rail, with a full wall and a window below it.

```text
Correct the roof study geometry of this attached planked-timber photographic plate. The four studio roof studies must clearly show the same full-height rectangular 3 m wall footprint, same width and height, all with visible upright sidewalls rising to the eaves from a flat floor. Roofs sit entirely ABOVE these upright walls. The gable silhouette is a pentagon (a triangle on a square), never an A-frame triangle whose edges run to the ground. Show 27° top left, 45° top right, 60° middle left, and flat middle right. Use straight uncurved roof planes and visible horizontal eave lines. Make the roof profiles clearly distinct: rise to half-span ratios approximately 0.51, 1, and 1.73. Framing may zoom out to fit the tallest profile. In the middle-left 60° study add the missing full height rectangular wall under the gable (3 metres tall), so eaves meet the wall top above the top of a normal-size wall window. Show sawn warm mid-brown oiled boards, tar-black lower courses and overlapping riven oak shakes. Keep all bottom wall samples with their original face combinations (boards both faces, planed interior, lime plaster interior), the assembled forest farmstead scene with tar-black lower courses, neutral grey studio and restrained natural light. No A-frame shelter, no eaves hanging down to the floor, no cartoon shapes, no orange varnish, no repeated plastic grain. Keep exactly six photographic panels on a 1536 × 1024 landscape canvas with thin grey gutters: large eye-height scene on the left, two tiles top right, one wide middle right tile, two bottom right tiles. No text or measurements printed.
```

#### Reinforced Stone main

Each studio wall has one band and built-in iron jambs. Fine swirls and studio cramp placement remain under review.

```text
Generate a NEW 1536 × 1024 landscape architectural material reference plate. Use the attached images ONLY as a placement sketch; redraw all imagery from scratch, don't paint over or transfer the old texture. Strictly six panels with fine dark grey gutters. Left half one large on-location eye-height photo. Right half two upper grey studio views of the same bare 3 m wall, front and reverse, a wide middle strip of detached pieces, two close-ups below. Real pre-gunpowder architectural and geology photographs, no text, labels or people. Avoid exaggerated micro-relief. All stone faces must look like actual natural stone photographed under soft natural light.

Use buff limestone ashlar in 0.60 × 0.30 m courses, with sand-fine randomly distributed grain, the occasional faint short straight chisel mark, and clean flat-dressed faces. Dark hand-forged iron bands, vertical straps, jambs, washers and lead-bedded dovetail cramps only where they bridge stone joints. Left: inhabited fortified keep with an iron-plated timber gate, rows of domed rivets, battlements, moderate rust run-off beneath rivets, on-location eye-level photograph. Upper right: bare front/rear views of the same square 3 m wall, only ONE horizontal 0.1 m wide band high on each wall at storey height, intrinsic vertical edge straps and iron jambs, and empty window reveal. Middle right: separate iron-plated lintel, studded gate leaf, oak door with two long strap hinges, and square window bars. Lower right: macro of one hammered band and rusty rivets; macro of dark dovetail iron cramp spanning an actual joint at top of course. Buff ashlar almost visually featureless at mid-range, never covered in worm tracks or fingerprint relief. No decorative bolts, random crosses, fancy game trim, additional bands on the studio wall.
```

```text
A local edit to this exact existing plate. Edit ONLY both of the grey top-right studio tiles. Show the same studio wall module at two opposed three-quarter views rather than head on. Include its original ONE horizontal band, its two outer vertical edge straps and clean, natural buff ashlar texture. ADD one flush vertical dark iron jamb strip with small functional rivets down the full height of each side of the interior window reveal, two strips on each wall image. Add a few small dark anchor plate washers at functional course joints beside the window and two small dovetail cramps bridging real joints at the top of a course. Keep the square opening empty and keep all other panels completely identical, especially the eye-height keep, four detached fittings, and two macros with natural buff limestone and actual forged iron. Do not add any horizontal band or decorative bolts. Preserve the neutral grey floor and the exact 1536 × 1024 six-panel layout.
```

```text
Edit only the stone surfaces and loose extra clamps of this 1536 × 1024, six-panel plate. All pale ashlar should look like plain unembossed architectural limestone with tiny fine randomly spaced granular mineral dots, no large visual features at all on each stone face. Remove all noticeable swirl relief from every pale stone face, including the foreground wall and the macro tiles. Keep the existing block shapes, spacing, rust beneath rivets, colours and lighting. On each grey studio wall remove the two top bow-tie clamps and the two bottom bow-tie clamps; keep at most two actual dovetail cramps at real joints. Preserve both iron jambs, both edge straps, the single horizontal iron band, empty opening, and camera angles. Keep the separate fittings, the iron band macro and the dovetail cramp macro, gate and surroundings. No decorative embossing, textured overlays or swirls anywhere; natural limestone with a restrained sand-fine grain, and subdued documentary lighting.
```

#### Thatch and Hide variants

The steep gable sits on a lashed wall and the face samples retain pinned reeds and stitched hides.

```text
Edit the roof study geometry on the attached thatch and hide reference plate. The four studio roof studies must clearly show the same full-height rectangular 3 m wall footprint, same width and height, all with visible upright sidewalls rising to the eaves from a flat floor. Roofs sit entirely ABOVE these upright walls. The gable silhouette is a pentagon (a triangle on a square), never an A-frame triangle whose edges run to the ground. Show 27° top left, 45° top right, 60° middle left, and flat middle right. Use straight uncurved roof planes and visible horizontal eave lines. Make the roof profiles clearly distinct: rise to half-span ratios approximately 0.51, 1, and 1.73. Framing may zoom out to fit the tallest profile. In the middle-left 60° study, move the entire steep thatch roof up and set it atop a full-height 3 m rectangular wall with vertical sides, visible horizontal reed courses, and lashings. Keep the pinned, overlapping 0.20 m reed yelm courses on all reed walls and the roofs' split hazel sway pins and thick ridge cap. Flat turf roof stays as turf laid over lashed poles on the same wall height. Keep the bottom wall comparisons of grey-gold pinned reed on both faces, stitched irregular tan animal skins with brown backs and pale bellies on both faces, and reed outside with hide inside. Keep the eye-level pastoral scene and thin gutters. Roofs and wall studies must feel like actual uneven pre-gunpowder construction. No fabric canvases, bright yellow, straight trimmed luxury thatch, triangle huts, modern materials or text. Keep exactly six photographic panels on a 1536 × 1024 landscape canvas with thin grey gutters: large eye-height scene on the left, two tiles top right, one wide middle right tile, two bottom right tiles. No text or measurements printed.
```

#### Timber and Plaster main

The bare wall and close-up show thin limewash with subtler surface relief.

```text
Edit ONLY the limewash and plaster surface in this attached 1536 × 1024 six-panel photographic plate. Everywhere including in the bottom-left macro, replace the heavy frosting-like swirl relief with a hand-applied warm off-white chalk matte wash only a fraction of a millimetre thick over subtly and broadly hand-bulged plaster. In the macro show nearly smooth real old lime plaster with faint flat brush marks, occasional dull grey thin patches and tiny hairline drying cracks at the oak boundary. No raised ridges, daub lumps, swirl, stippled stucco, meringue, or smooth modern white paint. Preserve the left eye-height 2-storey jettied townhouse, grey-brown oak studs, stone plinth, clay roof tiles, leaded window and all lighting. Preserve the two top-right studio views of the same 3 m wide thin 0.08–0.10 m flat infill piece with empty square reveal and no fittings. Keep all detached fittings and frame parts in the middle and the pegged bracket in the second detail. Preserve every panel and the existing geometry, no new fittings or labels.
```

#### Timber and Plaster variants

The limewash is thinner and the steep gable now stands on a full-height studded wall.

```text
Edit this attached photographic roof and wall variant plate. The primary correction is to replace the heavy frosting-like relief on all pale limewashed faces with an extremely thin, warm off-white chalk matte coat over only slightly broadly bulging plaster, with faint brush drag, tiny hairline interface cracks and subtle hand-finished variation. No raised swirls, whipped peaks, modern paint or theme-park white. Maintain the dark oak posts, close studs, curved jetty brackets, reddish hand-fired clay tile and stone plinth in the eye-height scene. Preserve the bottom 3 comparison samples (limewashed on both faces, with planed wood inside, with bare woven hazel wattle inside). Correct the studio roof support geometry where necessary. The four studio roof studies must clearly show the same full-height rectangular 3 m wall footprint, same width and height, all with visible upright sidewalls rising to the eaves from a flat floor. Roofs sit entirely ABOVE these upright walls. The gable silhouette is a pentagon (a triangle on a square), never an A-frame triangle whose edges run to the ground. Show 27° top left, 45° top right, 60° middle left, and flat middle right. Use straight uncurved roof planes and visible horizontal eave lines. Make the roof profiles clearly distinct: rise to half-span ratios approximately 0.51, 1, and 1.73. Framing may zoom out to fit the tallest profile. Keep the flat specimen boarded and the other three roof samples in overlapping clay tiles. Keep exactly six photographic panels on a 1536 × 1024 landscape canvas with thin grey gutters: large eye-height scene on the left, two tiles top right, one wide middle right tile, two bottom right tiles. No text or measurements printed.
```

```text
Edit IMAGE ONE only, the timber and plaster variants plate. IMAGE TWO (planked timber) is a reference for roof silhouette only. Edit ONLY the four little roof specimens in the top and middle rows on the grey background. In each specimen put a full-height rectangular timber-studded wall BELOW the roof and put a continuous horizontal head rail at the top of the wall. Each wall section below the eaves has the same height, including the one under the very steep gable. Add the steep triangle ABOVE the head rail, with the sides ending at that rail rather than running down to the base. Match the steep 60-degree specimen in image two, with a tall rectangle clearly visible below its eaves. Three different profiles: 27°, 45°, 60° clay tiled roofs and a flat timber-boarded roof, with wall tops at the same height. Preserve the exact materials of image one, natural thin limewash, dark oak studs, and aged clay roof tiles. Preserve the exact large scene and the three lower wall comparisons. Six panels, no text, 1536 × 1024.
```

#### Warded Stone main

Dull collared crystals appear on the wall, hinges and lock. Fine swirls in the ashlar remain under review.

```text
Generate a NEW 1536 × 1024 landscape architectural material reference plate. Use the attached images ONLY as a placement sketch; redraw all imagery from scratch, don't paint over or transfer the old texture. Strictly six panels with fine dark grey gutters. Left half one large on-location eye-height photo. Right half two upper grey studio views of the same bare 3 m wall, front and reverse, a wide middle strip of detached pieces, two close-ups below. Real pre-gunpowder architectural and geology photographs, no text, labels or people. Avoid exaggerated micro-relief. All stone faces must look like actual natural stone photographed under soft natural light.

Use dark blue-grey slate ashlar in 0.60 × 0.30 m courses. The stone has a matte nearly smooth fine dark natural grain and sparse fine linear chisel marks, no raised or repeating texture. Narrow branching 0.02–0.05 m cloudy quartz inlays flush-ground across actual joints, subtly reflective and non-emissive. The quartz is muted milky blue-grey, not white paint or neon. Left: daylit citadel gate on rock, door open onto a shady passage and distant courtyard; plain aged bronze collared cloudy faceted studs positioned at quoins, keystone, panel centre and gate hinges and lock. Upper right: same 3 m bare module viewed from opposite sides against grey, clean open rectangular reveal, vein along the jambs and head, no gate or studs. Middle right: detached veined lintel, cloudy collared studs, gate leaf, hinges and lock. Lower right: one macro of flush inlay crossing a joint in unpatterned slate, one macro of the aged bronze collar and waxy translucent facets. No swirls, embossed stamps, repeating rock relief, glow, runes, particles or ornate hardware.
```

```text
Make one small local edit ONLY to the existing open wooden gate in the LEFT photograph. Keep the wooden gate, all masonry and studs on stone, slate texture, inlays, passage, and every other panel identical. On the gate leaf, mount three small cloudy quartz studs in round aged-bronze collars, using the design in the lower-right macro. One stud attaches visibly ON the upper strap hinge plate, one ON the lower strap hinge plate, and one ON the existing lock plate just above its iron pull ring. The hardware and studs are fixed into the wood and the crystals do not emit light. Do not add any studs elsewhere. Preserve all six panels on the 1536 × 1024 landscape canvas.
```

```text
Change ONLY two details in the large left daylight photograph of the supplied six-panel plate. Place a thumb-sized cloudy quartz stud in a small round aged-bronze collar on the upper RIGHT outer corner of the wall, ON the actual corner stone (quoin), near the visible vertical corner edge. Place one matching stud near the middle of the broad ashlar bay to the right of the gate (centred between the door jamb and the outer corner, about halfway up that portion of the wall). End a pair of existing fine flush quartz inlays at that centred stud. Both studs are dull, non-emissive and sit slightly proud. Keep the existing three small hinge and lock studs on the door and the stud above the lintel. Keep natural dark grey slate finish, pale flush inlays, warm wood, same open gate, viewpoint, shaded passage, and all five right-hand tiles unchanged, no lights or neon. Same 1536 × 1024.
```
