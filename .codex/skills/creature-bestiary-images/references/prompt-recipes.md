# Prompt Recipes

Use this reference to build creature bestiary plates in the established style. The style lives here; the creature itself always comes from its Markdown file under `Creatures/`, which is the source of truth for anatomy, size, colour, and behaviour. Never reuse subject details from an older prompt or an older image: build them fresh from the current Markdown every time.

## Core Prompt Scaffold

Use this scaffold for each creature, filling in the subject from the creature file and the adventurer hand, mood, and palette from the style assignments below:

```text
Use case: stylized-concept
Asset type: creature bestiary concept plate for a Markdown game design document
Primary request: Create a colorful hand-drawn bestiary entry image for the creature "<Creature Title>" as an actual opened book spread, with pages visible on both sides of the central fold.
Scene/backdrop: an aged parchment field journal or bestiary lying open, with worn edges, stains or creature-appropriate debris, ink smudges, and a visible book gutter.
Subject: <built from the creature file, see "Building the subject" below>
Style/medium: hand drawn naturalist bestiary page, ink linework, watercolor washes, colored pencil or gouache accents; vary the hand as if a different adventurer drew this page.
Composition/framing: wide landscape image of an open book spread; the left page has the main full-body creature illustration large and unmistakable, the right page has secondary sketches, anatomy or behavior details, a small scale comparison with a human silhouette, and decorative field-note lines; central fold clearly visible.
Lighting/mood: <creature-specific mood and environment>
Color palette: parchment tans plus <creature-specific colors and accent glows>
Text: The only clearly legible title should be "<Creature Title>"; other handwriting may be decorative marks and short unreadable note strokes.
Constraints: creature must be clearly visible and not hidden by text, darkness, weather, water, or camouflage; make it look like an actual physical book opened to a two-page entry; no modern UI, no watermark, no logo.
```

## Building the Subject

Read the creature file's opening paragraph and `Appearance and Visual Design` section, plus any movement or encounter section that describes how it looks in action. Turn them into the Subject line in this order, because image generators weigh early details most:

1. Body plan first: the exact limb count and what each limb is, where limbs attach, and posture. State absent parts as body parts ("the wings are its only front limbs; no arms") rather than relying on "no X" alone.
2. Size from the file's metric numbers, expressed as a comparison the drawing can show ("about 6 metres tall, three times the height of the human silhouette beside it").
3. Silhouette, colour zones, and materials, in the file's own words.
4. Two to four secondary sketches for the right page, taken from what the file says players should notice: the tell before an attack, tracks, a weak point, a drop, a life stage.
5. Habitat cues from the creature's biome file.

Leave out lore, story, and gameplay numbers that have no visual form. If the file has an `## Inspiration` section, use it only to understand the intended look; never name the source work in the prompt.

## Species Hubs and Tiers

Some species are split into a hub file and tier files: [Treant](../../../../Creatures/Treant.md) (Sapling, Guardian, Elder), [Stone Giant](../../../../Creatures/Stone-giant.md) (Young, Adult, Elder), and [Slime](../../../../Creatures/Slime.md) (Passive, Neutral, Aggressive). The hub plate is stored under the hub's slug and embedded in the hub file. Its main portrait shows the middle tier (Treant Guardian, Adult Stone Giant, Neutral Slime), and the right page lines up all three tiers side by side at true relative scale with a human silhouette, built from each tier file. Each tier file also gets its own full plate, built from that tier file alone, with the tier as the main portrait and right-page sketches of what is specific to it. A tier plate is drawn in the same adventurer hand as its hub, as if the same researcher studied the whole family, so the four plates of a species read as one set.

## Style Contract

- Always render an opened physical book, not a flat parchment poster.
- Make the center fold/gutter visible and let the two pages feel dimensional.
- Use parchment, stains, edge wear, field debris, and marginal sketches to sell a real adventurer's book.
- Put the main readable creature portrait on the left or across the spread, with smaller study sketches on the other page.
- Preserve creature anatomy exactly from the source text. A wyvern-like creature has two hind legs and two wings whose wing bones serve as forelimbs, four limbs total, with no separate front legs. A wyvern may be shown in flight, landing, rearing on its hind legs, or grounded on its hind feet and folded wing wrists like a walking bat; in a grounded pose the folded membrane must be visible along each forelimb, with a wrist claw where a foot would be, so the image cannot read as four legs plus wings.
- Show scale honestly. Every plate carries a small human silhouette somewhere on the spread, drawn to the size the creature file states.
- Keep color interesting. Use watercolor, ink, colored pencil, gouache, pigment flecks, magic glows, or weather washes.
- Let different entries feel drawn by different adventurers while preserving the same bestiary family: hunter, druid, cartographer, miner, alchemist, delver, desert guide, noble illuminator, sailor, frontier scout, skywright, naturalist, bamboo-cutter, tundra wanderer.
- Avoid readable lore text inside the image except the creature title. The real lore belongs in Markdown.

## Creature Style Assignments

Only the adventurer hand, the mood, and the palette accents are fixed here, so the set keeps a consistent family of hands. Everything about the creature's body comes from its file.

| Creature (file) | Image file | Adventurer hand | Mood and palette accents |
| --- | --- | --- | --- |
| Ancient Deer (`Ancient-deer.md`) | `ancient-deer-bestiary.png` | Reverent tundra scout | Quiet living legend; snow white, silver grey, icy blue mana, muted tundra browns |
| Bamboo Spider (`Bamboo-spider.md`) | `bamboo-spider-bestiary.png` | Tense local bamboo-cutter | Eerie grove stillness; bamboo green, straw yellow, dark lacquer brown, red warning cloth |
| Birds (`Birds.md`) | `birds-bestiary.png` | Observational naturalist | Alive, watchful, informational; one study per biome archetype the file names, flock breaking upward as a warning |
| Flying Leviathan (`Flying-leviathan.md`) | `flying-leviathan-bestiary.png` | Peaceful skywright | Serene high-altitude wonder; pale blue, pearl grey, cloud white, soft gold, cyan mana, island greens |
| Four-Armed Monkey (`Four-armed-monkey.md`) | `four-armed-monkey-bestiary.png` | Cheerful jungle guide | Bright canopy life; jungle greens, the file's display colours, dappled light |
| Golden Goblin (`Golden-goblin.md`) | `golden-goblin-bestiary.png` | Nervous mine foreman | Furtive greed and crawling cave dread; sickly pale white, dull flaking pyrite gold, cave black, blue-green fungus glow; Gleaner, Hoard-warden and Gilded King to scale on the right page |
| Green Goblin (`Green-goblin.md`) | `green-goblin-bestiary.png` | Practical frontier scout | Scrappy, cunning, unpleasant up close; rust metal, stolen cloth, forest-edge greens; all three variants on the right page |
| Kraken (`Kraken.md`) | `kraken-bestiary.png` | Sailor | World-event ocean terror; blue-black, storm grey, sea green, foam white; a ship for scale |
| Large Buffalo (`Large-buffalo.md`) | `large-buffalo-bestiary.png` | Plains drover | Gentle giant at a river ford; mud browns, reed greens, cream and ochre fur; the elder bull beside an adult |
| Mermaid (`Mermaid.md`) | `mermaid-bestiary.png` | Wary coastal salvager | Moonlit wreck-field danger; both forms side by side, iridescent charmed tail against the dull true form |
| Minotaur (`Minotaur.md`) | `minotaur-bestiary.png` | Veteran ravine delver | Torchlit menace in ruins and mazes; dark hide, ivory horn, stone and root |
| Paralyzing Dragon (`paralyzing-dragon.md`) | `paralyzing-dragon-bestiary.png` | Jungle hunter who survived one | Close, humid dread; leaf-mottled greens, damp blacks, a faint green gas haze |
| Red Goblin (`Red-goblin.md`) | `red-goblin-bestiary.png` | Battle-worn palisade sergeant | Iron, drums and smoke on the march; brick and rust red, forge-blackened iron, palisade timber, smoke grey; Grunt, Ironback and Warboss to scale on the right page |
| Royal Dragon (`Royal-dragon.md`) | `royal-dragon-bestiary.png` | Noble illuminator | Ceremonial mesa power; crimson, ochre-gold scale colour, warm amber, mesa stone; never coins, treasure, or hoards |
| Sandworm (`Sandworm.md`) | `sandworm-bestiary.png` | Desert guide | Harsh survival hazard; ochre sand, burnt sienna, pale raw flesh; a caravan for scale |
| Skeleton Archer (`Skeleton-Archer.md`) | `skeleton-archer-bestiary.png` | Brisk dungeon scout | High-ground dungeon threat; bone yellow, dark half-congealed blood red, blackened wood, rust iron, pale blue magic |
| Skeleton Knight (`Skeleton-Knight.md`) | `skeleton-knight-bestiary.png` | Veteran dungeon delver | Torchlit discipline and binding; bone yellow, dark half-congealed blood red, rust brown, iron grey, cold blue magic |
| Slime (`Slime.md` hub) | `slime-bestiary.png` | Eccentric alchemist | Curious, strange, hazardous; the three forms' colours from their tier files, acid highlights |
| Stone Giant (`Stone-giant.md` hub) | `stone-giant-bestiary.png` | Miner-surveyor | High mountain force; slate grey, granite brown, moss green, vivid crystal glow |
| Swamp Spider (`Swamp-spider.md`) | `swamp-spider-bestiary.png` | Grim swamp-cave delver | Brood-cave horror; bone white, damp cave greys, sickly swamp greens; hatchling, juvenile, and adult to scale |
| Titan Turtle (`Titan-turtle.md`) | `titan-turtle-bestiary.png` | Cartographer | Mythic patience and living landscape; moss green, earth brown, pond blue; a settlement on the shell for scale |
| Treant (`Treant.md` hub) | `treant-bestiary.png` | Patient druid | Old forest watcher; bark browns, moss greens, green-gold magic |
| Wolf (`Wolf.md`) | `wolf-bestiary.png` | Rugged hunter | Grounded forest danger; charcoal grey, pine green, muted brown, yellow eye glints |
| Treant Sapling (`Treant-sapling.md`) | `treant-sapling-bestiary.png` | Patient druid (as Treant) | Quick, watchful canopy shadow; young bark greens, leaf light |
| Treant Guardian (`Treant-guardian.md`) | `treant-guardian-bestiary.png` | Patient druid (as Treant) | Roused protector on the forest floor; dark furrowed bark, moss, glowing sap |
| Treant Elder (`Treant-elder.md`) | `treant-elder-bestiary.png` | Patient druid (as Treant) | Ancient presence among giant trunks; deep shadow, moving roots, green-gold magic |
| Young Stone Giant (`Young-stone-giant.md`) | `young-stone-giant-bestiary.png` | Miner-surveyor (as Stone Giant) | Restless young force near a mining camp; fresh-cut stone, bright crystals |
| Adult Stone Giant (`Adult-stone-giant.md`) | `adult-stone-giant-bestiary.png` | Miner-surveyor (as Stone Giant) | High mountain force; slate grey, granite brown, crystal glow |
| Elder Stone Giant (`Elder-stone-giant.md`) | `elder-stone-giant-bestiary.png` | Miner-surveyor (as Stone Giant) | A ridge that stands up; weathered strata, alpine moss, deep crystal light |
| Passive Slime (`Passive-slime.md`) | `passive-slime-bestiary.png` | Eccentric alchemist (as Slime) | Harmless curiosity in the grass; cool translucent blue and green |
| Neutral Slime (`Neutral-slime.md`) | `neutral-slime-bestiary.png` | Eccentric alchemist (as Slime) | Wary, provoked defender; warm amber layers, slow bubbles |
| Aggressive Slime (`Aggressive-slime.md`) | `aggressive-slime-bestiary.png` | Eccentric alchemist (as Slime) | Siege-scale hazard; opaque red, black core, corrosion fumes |

When a new creature file is added, add a row here with an adventurer hand not yet used by its neighbours.

## Pending Corrections

Plates that were reviewed against their creature file and need regenerating. Rebuild the subject from the current Markdown as usual and fold in the correction; the notes only say what went wrong last time. Remove an entry once its corrected plate is saved.

### Green Goblin — build (reviewed 10 October 2026)

Every goblin on the plate is drawn emaciated, with sticklike limbs and the ribs and spine showing. The file now gives a lean but solid body of 40 to 50 kilograms at 1,40 metres: compact and firm, ropy muscle over the arms and legs, a little flesh over the ribs and a solid trunk. Draw the Raider, Tinkerer and Scout tough and wiry rather than starved, so they cannot be mistaken for the bony Golden Goblin. Keep the skin colour, kit, trap sketch and scale, which were correct.

### Red Goblin — scale and build (reviewed 10 October 2026)

The goblins tower over the human silhouette and are drawn as hulking, bodybuilder-heavy brutes. Measured against the silhouette, the Grunt reads at about 2,05 metres and the Warboss at about 2,3 metres, and the silhouette itself is drawn small and slight. The file gives a Grunt 1,75 to 1,85 metres and 70 to 85 kilograms, the build of a fit human soldier, and the Warboss close to 2 metres, tall and hard rather than massive. Draw every red goblin, the Ironback included, with the muscle of a trained human man-at-arms: square shoulders, a solid chest and strong forearms, but no swollen neck, bulging arms or barrel torso. Their menace on the page should come from the armour and the massed ranks, not from size. Put the human silhouette, drawn as an ordinary adult man of about 1,80 metres, on the same ground line as the right-page line-up so the Grunt stands eye to eye with it, the Ironback barely taller, and the Warboss no more than a head above it. Keep the main portrait, the Ironback's tower shield and hammer, the Warboss's horn and trophy standard, the drum platform and the war-camp palisade.

Two smaller deviations to fix in the same pass. Arm the marching shield wall with cleavers, notched swords, axes, mauls and spiked clubs instead of spears, since the file lists only those weapons. Draw the war camp as hide tents and lean-tos around fighting pits and a central scrap forge, with no stone tower.

### Golden Goblin — scale and title (reviewed 10 October 2026)

The Gleaner stands nearly as tall as the human silhouette, about 1,7 metres by comparison, where the file gives 1,40 metres: roughly three-quarters of an adult human's height, the same height as a Green Goblin. Redraw the right-page line-up on one ground line with the silhouette at about 1,80 metres, the Gleaner's head level with the silhouette's chest, the stooped Hoard-warden only slightly taller, and the Gilded King at about 2,20 metres.

The title's final "n" in "Golden" carries a long descending tail, so the lettering reads "Goldeŋ Goblin". Letter the title "Golden Goblin" with no flourish below the baseline on any letter.

Two smaller deviations to fix in the same pass. Render the body paint as dull, gritty, flaking paint that glints only where light catches it, not as bright metallic gold leaf. Build the Gilded King's throne from heaped hoard junk (coins, plate, armour fittings, glass and brass) rather than an ornate carved gold throne with drapery; keep the real gold chains and rings on the King himself.
