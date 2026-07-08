# Prompt Recipes

Use this reference to reproduce the current creature bestiary image style.

## Core Prompt Scaffold

Use this scaffold for each creature, filling in the subject, adventurer style, mood, and palette from the creature entry:

```text
Use case: stylized-concept
Asset type: creature bestiary concept plate for a Markdown game design document
Primary request: Create a colorful hand-drawn bestiary entry image for the creature "<Creature Title>" as an actual opened book spread, with pages visible on both sides of the central fold.
Scene/backdrop: an aged parchment field journal or bestiary lying open, with worn edges, stains or creature-appropriate debris, ink smudges, and a visible book gutter.
Subject: <clear visual description from the creature's Appearance and Visual Design section, including scale, silhouette, colors, materials, magical effects, habitat cues, and 2-4 secondary details to sketch in the margins>
Style/medium: hand drawn naturalist bestiary page, ink linework, watercolor washes, colored pencil or gouache accents; vary the hand as if a different adventurer drew this page.
Composition/framing: wide landscape image of an open book spread; the left page has the main full-body creature illustration large and unmistakable, the right page has secondary sketches, anatomy or behavior details, and decorative field-note lines; central fold clearly visible.
Lighting/mood: <creature-specific mood and environment>
Color palette: parchment tans plus <creature-specific colors and accent glows>
Text: The only clearly legible title should be "<Creature Title>"; other handwriting may be decorative marks and short unreadable note strokes.
Constraints: creature must be clearly visible and not hidden by text, darkness, weather, water, or camouflage; make it look like an actual physical book opened to a two-page entry; no modern UI, no watermark, no logo.
```

## Style Contract

- Always render an opened physical book, not a flat parchment poster.
- Make the center fold/gutter visible and let the two pages feel dimensional.
- Use parchment, stains, edge wear, field debris, and marginal sketches to sell a real adventurer's book.
- Put the main readable creature portrait on the left or across the spread, with smaller study sketches on the other page.
- Preserve creature anatomy exactly from the source text. A wyvern-like creature has two hind legs and two wings whose wing bones serve as forelimbs, four limbs total, with no separate front legs. For wyvern-like creatures, avoid a four-footed quadruped stance in the main portrait; use flight, landing, or an upright hind-leg perch so the image cannot read as four legs plus wings.
- Keep color interesting. Use watercolor, ink, colored pencil, gouache, pigment flecks, magic glows, or weather washes.
- Let different entries feel drawn by different adventurers while preserving the same bestiary family: hunter, druid, cartographer, miner, alchemist, delver, desert guide, noble illuminator, sailor, frontier scout, skywright, naturalist, bamboo-cutter, tundra wanderer.
- Avoid readable lore text inside the image except the creature title. The real lore belongs in Markdown.

## Successful Batch Details

Use these as subject and tone references for matching or replacing the original set.

### Wolf

Adventurer hand: rugged hunter-adventurer. Subject details: lean long-legged wolf, heavy neck ruff, narrow waist, broad paws, grey-brown-charcoal coat, scarred ears, old bite marks, yellow torchlit eyes, paw tracks, pack silhouettes around trees. Mood and palette: grounded forest danger; parchment tan, charcoal grey, pine green, muted brown, yellow eye glints.

### Treant

Adventurer hand: patient druid-adventurer. Subject details: humanoid living tree, split trunk ribcage torso, heavy bough arms, branch fingers, root-mass feet, subtle face from bark cracks and amber sap knots, shelf fungus, moss, nests, leaf crown, green-gold mana under bark. Mood and palette: old forest watcher; bark browns, moss greens, amber sap, green-gold magic.

### Titan Turtle

Adventurer hand: cartographer-adventurer. Subject details: colossal turtle as living terrain, grey-green stone-textured body, calm dark eye, massive shell with soil, grass, shrubs, trees, ponds, footpaths, retaining walls, tiny settlement, deep footprints, tiny human silhouettes for scale. Mood and palette: mythic patience and living landscape; moss green, earth brown, pond blue.

### Stone Giant

Adventurer hand: miner-surveyor. Subject details: colossal humanoid of granite, basalt, shale, and quartz strata; broad cliff shoulders, uneven arms, terraced back, ridge brow, grinding joints, blue-white and violet mana crystals along spine, shoulders, knuckles, and chest, moss and alpine shrubs. Mood and palette: high mountain force; slate grey, granite brown, moss green, vivid crystal glow.

### Slime

Adventurer hand: eccentric alchemist-adventurer. Subject details: shifting transparent gel with stones, leaves, bones, and scraps suspended inside; show passive blue-green, neutral amber-orange, and aggressive dense red forms with dark pulsing core, corrosive fumes, pseudopods, bubbles, and corrosion sketch. Mood and palette: curious, strange, hazardous; blue, green, amber, orange, red, smoky core, acid highlights.

### Skeleton Knight

Adventurer hand: veteran dungeon delver. Subject details: armoured skeleton with dry yellowed incomplete bones, cold blue dungeon-magic cords at joints, heavy pitted plate over chain and leather, low helm, shield forward, old weapon, scraps of tabard, wax, roots, rust, blue socket light. Mood and palette: torchlit discipline and binding; bone yellow, rust brown, iron grey, cold blue magic.

### Skeleton Archer

Adventurer hand: brisk dungeon scout. Subject details: narrow skeleton archer, exposed ribs, long finger bones, eternally drawn bow posture, cracked helm, small breastplate, forearm guards, leather scraps, pale dungeon-magic through spine and bow arm, blackened wood and bone-laminated bow, rusted or bone-tipped arrows. Mood and palette: high-ground dungeon threat; bone yellow, blackened wood, rust iron, pale blue magic.

### Sandworm

Adventurer hand: desert guide. Subject details: colossal worm breaching dunes, segmented body with overlapping sun-baked armour plates, ridged scarred shell, no eyes, blunt head, circular grinding mouth, pale raw skin between rings, subsurface ripples, collapsing sand bowls, dorsal ridge, tiny caravan scale. Mood and palette: harsh survival hazard; ochre sand, burnt sienna, pale raw flesh.

### Royal Dragon

Adventurer hand: noble illuminator. Subject details: regal wyvern-like royal dragon with exactly two powerful hind legs and two broad wings growing from the shoulder line, no separate front legs, no front feet, no quadruped stance, deep crimson back, warm gold-coloured throat and chest as scale pigmentation rather than actual metal, broad wings, amber wing membranes, crown-like swept-back branching horns, gold-coloured jaw and brow ridges, high neck, intelligent judging eyes, smoke-darkened horn tips, pale scars, fine mesa dust. The main portrait should show the dragon in flight, landing, or upright on its two hind legs so it cannot read as four legs plus wings. It should stand or perch on canyon stone or open mesa ground, never on coins, gold objects, treasure piles, or hoard imagery. Mood and palette: ceremonial mesa intelligence; crimson, ochre-gold scale colour, warm amber, mesa stone, scorch marks.

### Kraken

Adventurer hand: sailor-adventurer. Subject details: immense kraken rising from stormy sea, blue-black oil-slick hide, pale scars, shell growths, mineral crust, vast eye under dark water, mast-thick tentacles with suckers, hooks, harpoons, rope, wreckage, plated central ridges, cracked shell masses, ink folds, beak through foam. Mood and palette: world-event ocean terror; blue-black, storm grey, sea green, foam white, cyan bioluminescence.

### Goblins

Adventurer hand: practical frontier scout. Subject details: small wiry humanoids around 1,40 metres, long fingers, sharp shoulders, oversized ears, expressive narrow faces, mossy green, grey-brown, and dusty ochre skin, patched leather, rope belts, stolen boots, broken-tool blades, tinkerer packs, traps, cooking-pot armour. Mood and palette: scrappy, cunning, unpleasant up close; moss green, grey brown, dusty ochre, rust metal, stolen cloth.

### Flying Leviathan

Adventurer hand: peaceful skywright-adventurer. Subject details: enormous sky-whale near floating islands, broad head, long tapering body, immense fin-wings, pale blue pearl-grey and cloud-white back, luminous underside with mana constellation patterns, crystals near throat, spine, and fins, trailing fins, wind scars, crystal growths, birds drafting, small structures for scale. Mood and palette: serene high-altitude wonder; pale blue, pearl grey, cloud white, soft gold, cyan mana, island greens.

### Birds

Adventurer hand: observational naturalist. Subject details: varied bird family, small colorful forest birds, long-winged plains birds, saturated jungle birds with long tails, pale moss-tinted ancient forest birds, dark scavengers, flock breaking upward as warning, crows circling death, feather and silhouette studies. Mood and palette: alive, watchful, informational; forest green, sky blue, jungle reds/yellows, pale ancient-forest white, crow black.

### Bamboo Spider

Adventurer hand: tense local bamboo guide. Subject details: large ambush spider, very long slender legs mimicking bamboo stalks, ringed joints like bamboo nodes, muted green-yellow surface, darker scars, compact dark lacquered carapace, small low eyes, precise mouthparts, fine bristles, sparse silk strands, wrapped prey, red cloth markers. Mood and palette: eerie grove stillness; bamboo green, straw yellow, dark lacquer brown, red warning cloth, pale silk.

### Ancient Deer

Adventurer hand: reverent tundra scout. Subject details: majestic deer nearly 3 metres at shoulder, deep chest, long legs, high narrow head, thick white-silver winter coat, pale grey guard hairs, darker underfur at joints, enormous wind-shaped antlers with subtle blue cracks, faint blue mana veins, calm intelligent eyes, herd silhouettes in snow haze. Mood and palette: quiet living legend; snow white, silver grey, icy blue mana, muted tundra browns.
