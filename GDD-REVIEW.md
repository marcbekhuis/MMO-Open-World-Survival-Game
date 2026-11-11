# GDD Review — 2026-11-11

This review replaces the stakeholder-panel report of 10 July 2026, which stays in the git history. It was made in two passes: one reader went through the core system documents as a whole, and seven area reviewers then each read one part of the repository in full. It holds 108 open findings: 7 from the whole-document read and 101 from the area reviews (8 high, 59 medium, 34 low). Findings settled in the design session of 11 November 2026 have been removed and are listed at the end. No inline `REVIEW` comments were placed for this review.

Each area finding carries a status. **Confirmed** means the quoted text was checked in the file after the reviewer reported it. **Reported** means the finding is a reviewer's claim that has not been re-checked, including any arithmetic it contains; treat it as a lead, not a fact.

## Executive summary

The document is a coherent vision whose systems reinforce one another: full loot, wear and upkeep feed crafting and the economy, and risk growing with distance from safety shows up consistently in the world, in conflict, in survival and in quests. The gaps the July panel agreed on have been closed by [Launch Scope](Launch-scope.md), the offline-raid rule with outskirts plots, the stance on real-money trading, the cost model and the content rhythm. What remains falls into four groups. The launch promises more than its own lists and budget support. Several rules leak value out of full loot or leave an offline base open. The combat foundation is specified in ways that disagree with one another. And the technical guides have drifted from their specifications in places, most seriously around the single-server fallback the launch depends on.

## Cross-cutting findings

These are the themes that more than one read arrived at independently and that are still open. The codes point to the entries below.

1. **The first release still promises more than its lists support.** Launch biomes and launch creatures lack the measurable detail the Wolf file sets as the standard (BS11, CR8), the Royal Dragon has a route to a mount but no speeds, ranges or flee rule (CR5), launch biome files still feature the Highland Dragon, Titan Turtle and Pixie, which are not first-release species (BS3), and the scope as a whole is large for the stated revenue, with no team size or budget anywhere (W1).
2. **The single-server map has no crash and capacity plan.** Its cap and its lack of time dilation are now stated, but crash recovery for a whole world is unaddressed (SV8) and the per-player bandwidth budget the cost model cites does not exist (SV1).
3. **An offline base still has holes.** Unclaimed pieces have no ceiling or claim gap (BD3), fittings have no damage model of their own (BD7), and an outskirts plot's decay path does not exist in the technical guide (BD9).
4. **The combat foundation is not yet connected across servers.** The melee and wounds guides assume one server (MV2), stamina costs travel two incompatible ways (MV4), and the latency risk of directional melee is unproven (W6).
5. **Specifications and technical guides have drifted.** NPC buildings are one health value per lot although both building documents promise piece-level failure (BD1), settlement buildings are not shown to come from the player kit (BD10), and a hired horse's bolt rule is gated on a bond band it can never reach (TF6).
6. **Several files are still in the older tentative voice.** [Player Settings](Player-settings.md) (AR16), the three settlement files (BS12), the [Creatures](Creatures.md) hub (CR17), and the pillars in the [README](README.md).
7. **The art direction covers creatures and building materials only.** There is no brief for the first-person hands and held items, light and colour are given for four woodlands only, and settings that affect what a player can see have no fairness limits (AR5, AR12, AR13).

## Whole-document findings

These come from one reader going through the core system documents: scope, monetisation, economy, conflict, death, raids, guilds, progression, survival, magic, building, inventory, the server specification, and the new player experience.

**W1. Launch scope does not fit the stated business** (High)
- Files: [Launch-scope.md](Launch-scope.md), [Monetization.md](Monetization.md)
- Problem: Monetization plans for fifty thousand subscribers and close to eight million euros a year. The launch still holds seven biomes, three hand-built heartlands, about a dozen species with behaviour of their own, all three taming bonds, riding, carriages, dragon flight, the full building system with siege, and a custom server cluster. No team size, budget or timeline appears anywhere, and the cut removes breadth but no systems.
- Suggest: add a second-tier cut list (what goes first if the schedule slips) and state the team and budget the launch assumes.

**W6. Directional physics melee is the riskiest feel bet** (High)
- Files: [Melee-combat.md](Melee-combat.md), [Server-architecture.md](Server-architecture.md)
- Problem: strikes steered in mid-swing are among the most latency-sensitive combat designs, and here they run through cross-server hit claims and time dilation. The prototype has measured 150 milliseconds of lag for inventory only.
- Suggest: make melee between twenty or more combatants at 150 milliseconds the first proof the vertical slice has to pass.

**W7. Economy rules that invite collusion** (Medium)
- Files: [Economy.md](Economy.md), [Player.md](Player.md), [Quests.md](Quests.md)
- Problem: a merchant who insures another trader's load can be defrauded by a staged robbery; experience paid on realised margin can be farmed by two accounts trading at inflated prices; and the coin paid by endlessly refreshing contracts is missing from the account of where coin enters the world.
- Suggest: pay margin experience only against regional base prices, bound insurance payouts by recorded losses to third parties, and add quest coin to the faucet accounting.

**W9. Hidden storage is promised but undefined** (Low)
- Files: [Raids.md](Raids.md), [Inventory.md](Inventory.md)
- Problem: Raids lists storage hidden where nobody thinks to dig among a base's defences, but no file defines burying or digging; Inventory only lets items be dropped in undergrowth.
- Suggest: define a buried cache or remove the phrase.

**W10. Community servers sit awkwardly with the subscription** (Low)
- Files: [Server-settings.md](Server-settings.md), [Monetization.md](Monetization.md)
- Problem: community hosts run the full cluster software while their players still need the subscription, which raises who checks the subscription on a server the studio does not run, and splits an audience the plan already counts as small.
- Suggest: state how a community server authenticates subscribers and what the studio gains from allowing them.

**W11. The technical guides run ahead of the prototype** (Low)
- Files: the eight `(Technical)` companions
- Problem: together they are longer than the designs they implement and are pinned to one engine version, while the prototype has only begun to produce measured findings. Every specification change now costs a second edit.
- Suggest: let prototype findings drive the technical guides, and mark unmeasured sketches as such.

**W13. AGENTS.md is over its own size limit** (Low)
- Files: [AGENTS.md](AGENTS.md)
- Problem: the file asks to stay under 32 KiB and is about 33,7 KiB.
- Suggest: move the longest convention paragraphs into the skill references and keep a summary.

## Findings by area

Codes: CR creatures, BS biomes, spells, races and settlements, AR art, audio, interface and settings, SV server architecture, BD building and settlement generation, MV movement, melee and wounds, TF taming, riding and flight.

### Creatures

**CR5. Royal Dragon, the launch world boss, is thin and still hedged** (Medium, confirmed)
- File: [Creatures/Royal-dragon.md](Creatures/Royal-dragon.md), sections "Behaviour" and "Gameplay Role"
- Quote: "If harassed, a Royal Dragon might swat, tail-whip, or drive the offender away rather than commit to a full battle."
- Problem: Launch-scope names it the boss written "to the standard the Wolf sets". It has no speeds, flame range, fire cooldown, flee rule or drops, and "worthy" foes, "tolerance", "negotiate passage" and "player restraint" have no mechanism. "May ignore", "might swat" and "can become one of the rarest flying mounts" are proposals, not settled design. How a player gets one as a mount is undefined: Taming-and-control never mentions it, while the Highland Dragon at least has an egg route. Highland-dragon.md says the Royal Dragon "judges and ceremonially spares", which this file never describes.
- Conflicts with: Launch-scope.md, "Creatures at Launch" ("written to the standard the Wolf sets"); Flight.md (ships with the Royal Dragon as a mount).
- Suggest: Rewrite Behaviour as rules: what counts as worthy (for example, a party that stands its ground within a set distance), what it does to the unworthy, fire numbers and tells, and the exact route to a bonded dragon.

**CR7. Pixie swarm cannot be outrun, yet it breaks off when you leave** (Medium, confirmed)
- File: [Creatures/Pixie.md](Creatures/Pixie.md), sections "Provocation and the Swarm" and "Colony and Signalling"
- Quote: "it holds that over any distance a player can run, so outrunning a swarm across open ground is not possible" versus "Once the threat has left the colony's range by about fifty metres"
- Problem: Two exits are described and the first cancels the second. The alarm reaches about 250 m, so a player would have to run 300 m away from a swarm that outruns them. The only working exits (water, smoke, thorn cover, standing still) are listed separately.
- Suggest: Say plainly that the swarm ends by standing still, cover, smoke or water, and that distance matters only for pixies not yet engaged.

**CR8. Launch creatures miss the Wolf's measurable detail** (Medium, reported)
- File: [Creatures/Ancient-deer.md](Creatures/Ancient-deer.md), Large-buffalo.md, Minotaur.md, Mermaid.md, Green-goblin.md, Red-goblin.md, Swamp-spider.md, Skeleton-Knight.md
- Quote: "fast enough that no hunter on foot keeps pace" (Ancient-deer.md, "Movement")
- Problem: Wolf.md gives speeds, sprint durations, sight and hearing ranges, arcs and tell timings. Launch creatures give only adjectives ("fast", "slow, lumbering", "surprising speed"). A developer cannot tune chases or stealth against the Wolf/Red Deer baseline. Only Red-deer.md, Pixie.md and Golden-goblin.md come close.
- Conflicts with: Launch-scope.md, "Creatures at Launch" ("written to the standard the Wolf sets")
- Suggest: Give each launch creature walk and sprint speeds in metres per second, sight and hearing ranges, and one timed tell (Minotaur charge, Mermaid song range, goblin warning shout, spider pounce).

**CR11. Titan Turtle and dragon growth by years has no clock** (Low, reported)
- File: [Creatures/Titan-turtle.md](Creatures/Titan-turtle.md), opening
- Quote: "at fifty years it stands some 30 metres tall under a shell 55 metres long, at a century 50 metres tall"
- Problem: Populations-and-spawning has every creature age and die on a species span, while Highland-dragon.md says growth is "real months" with a server setting. The turtle gives no game-time scale, so a builder cannot tell when a turtle reaches a size or whether one ever dies of age.
- Conflicts with: Populations-and-spawning.md, "Age and Death"
- Suggest: State the turtle's growth in real time with the same overridable-default wording as the dragon.

**CR12. Aggressive Slime has no growth law** (Low, reported)
- File: [Creatures/Aggressive-slime.md](Creatures/Aggressive-slime.md), section "Size and Growth"
- Quote: "the food it needs rises steeply with every stage, so the largest specimens take more feed than any realistic supply delivers"
- Problem: There are no stages, sizes or feed amounts, yet it is a procedurally generated mesh that "can still overwhelm a dragon". Slime.md also promises a "siege-scale mass within days", while this file calls village-size "out of reach in practice".
- Conflicts with: Creatures/Slime.md, opening ("siege-scale mass within days")
- Suggest: Give three or four named growth stages with approximate diameters and the feed each takes, and soften or fix the "within days".

**CR15. Green goblin band has no defined leader** (Low, reported)
- File: [Creatures/Green-goblin.md](Creatures/Green-goblin.md), section "Behaviour and Encounter"
- Quote: "a band breaks and flees once its leader or its Tinkerer falls"
- Problem: A band has three variants (Raider, Tinkerer, Scout) and no leader variant, so the flee trigger is undefined.
- Suggest: Name the leader (an elder Raider with a distinct kit) or reword to Tinkerer and Scout.

**CR16. Red goblin charge horn is described two ways** (Low, reported)
- File: [Creatures/Red-goblin.md](Creatures/Red-goblin.md), section "Behaviour and Encounter"
- Quote: "a single long horn blast for the charge" versus "The charge horn is the Warboss's own, and when it sounds a second time"
- Problem: The first line makes the horn the signal that starts the charge for a column. The second makes it the Warboss's own signal that the boss has entered the fight.
- Suggest: Give the Warboss a distinct horn note or call, and keep the charge blast as the column's signal.

**CR17. Hub is thin and in a proposal voice** (Low, reported)
- File: [Creatures.md](Creatures.md), section "Design Role"
- Quote: "Creature design should connect behaviour, biome, and reward."
- Problem: The hub lists files with no sizes, tiers or launch status. "Should" and "whenever possible" are guidance rather than settled design. It links only one biome and mixes lowercase paralyzing-dragon.md in with the capitalised names (fine as a file name, but worth a note).
- Conflicts with: AGENTS.md, "Write solid, finished text"
- Suggest: Rewrite Design Role in the present tense, group the index by biome or family with a one-line size and role, and mark launch species.

**CR19. Colony sizes may exceed what a region server holds** (Low, reported)
- File: [Creatures/Golden-goblin.md](Creatures/Golden-goblin.md), opening and "Behaviour and Encounter"
- Quote: "a colony can number a thousand" and "Hundreds pour out of side passages and down from the ceilings"
- Problem: Not checked against Server-architecture limits. Together with Red-goblin war-hosts (100 to 200) and Swamp Spider overflows, no entity cap or dormancy rule for a colony fight is stated.
- Suggest: State that colony members beyond a cap are handled as a single swarm entity, or lower the numbers.

Strong work in this area:

- Creatures/Wolf.md: speeds, senses, tell timings and counter windows are concrete, and the first-person rule for lunges is explained.
- Creatures/Red-deer.md: its sprint and sight numbers meet the Wolf's, so the chase is fully computable.
- Creatures/Pixie.md: a hazard whose counterplay (smoke, cover, standing still, sleeping under a roof) falls straight out of the creature's biology.

### Biomes, spells, races and settlements

**BS3. Launch creature list omits species the launch biomes depend on** (Medium, confirmed)
- File: [Biomes/Plains.md](Biomes/Plains.md), "Creatures" and "Hazards and Travel" (also Forest, Mountain Range, Swamp, Coast)
- Quote: "The danger that comes from above is the Highland Dragon, which drops out of the mountains every few weeks"
- Problem: Launch-scope.md lists about a dozen species and does not name the Highland Dragon, Titan Turtle, Red Deer or Pixie. Plains, Forest, Mountain Range, Swamp and Coast feature them as central. Either the launch list is incomplete or the launch biomes cannot ship as written. Plains also loses its main hazard.
- Conflicts with: Launch-scope.md, "Creatures at Launch": "About a dozen species ship ... The rest of the bestiary arrives with the biomes it belongs to."
- Suggest: Add the four to the launch list, or mark them as ambient or post-launch in the biome text and cut them from launch biome prose.

**BS10. Ancient Forest breaks the biome section order and has no hazards or settlement** (Medium, reported)
- File: [Biomes/Ancient-forest.md](Biomes/Ancient-forest.md), section headings
- Quote: "## Guardians" and "## Resources and Exploration"
- Problem: AGENTS.md requires Terrain and Atmosphere, Resources, Creatures, Hazards and Travel, Settlement Patterns. This file has Terrain, Guardians, Resources and Exploration. Travel hazards (treant warning escalation, pathing, canopy) and elven canopy settlement patterns are folded into prose or missing. Jungle swaps Settlement Patterns for "Signature Landmark" (no settlement at all). Floating Islands uses "Terrain and Mana Crystals" and "Access and Travel", with no Hazards or Settlement section even though it pitches aerial bases.
- Conflicts with: AGENTS.md, "Consistent file structure"
- Suggest: Restructure the three files to the standard order and add short Hazards and Settlement sections (Jungle: stilt villages or none; Floating Islands: wind, falls, aerial claims).

**BS11. Launch biomes are too thin to build from** (Medium, reported)
- File: [Biomes/Tundra.md](Biomes/Tundra.md), "Resources" and "Creatures"; [Biomes/Swamp.md](Biomes/Swamp.md), "Creatures"; [Biomes/Mesa.md](Biomes/Mesa.md), "Creatures"
- Quote: "Cold-hardy predators range the treeline alongside the deer"
- Problem: Tundra is a launch biome whose only creature file is the Ancient Deer, plus unnamed "cold-hardy predators" and "thick-furred game". No resource has a name, no hazard has numbers or tells (thin ice, whiteout rules). Swamp names "alligators and large water snakes" and Mesa "lesser cliff predators" and Desert "large insects", none with files or behaviour. Artists and designers cannot tell what to make, and Tundra's cold hunt has no ordinary prey (Red Deer lives in Forest and Plains).
- Conflicts with: Launch-scope.md, "The World at Launch": Tundra, Swamp and Mesa ship at launch
- Suggest: Name the launch ambient creatures and the three or four signature resources per launch biome, or give each a stub creature file at the Wolf standard.

**BS12. Settlement files are still in a "should" voice and thin** (Medium, reported)
- File: [Structures/Human-settlements.md](Structures/Human-settlements.md), Elven-settlements.md, Dwarven-settlements.md
- Quote: "They should feel adaptable, practical, and socially busy"
- Problem: Opening paragraphs and most sections are proposals ("should offer quests", "should also create strong reasons"). Human Settlements has no layout, service list per tier, or defence pattern; Elven Settlements has no raid or safe-zone rule; Dwarven Settlements has no entrance defence or guard behaviour beyond the goblin paragraph (which is good). They are the hand-built launch settlements, so builders need more. (Dungeons.md is already known.)
- Conflicts with: AGENTS.md, "Write solid, finished text"
- Suggest: Rewrite as settled prose, add service tiers, guard presence and what a player may build near each.

**BS15. Seasons are not reflected in biomes, and map rules leave gaps** (Low, reported)
- File: [Weather-time-and-seasons.md](Weather-time-and-seasons.md) "Seasons"; [Skills/Artisan/Cartography.md](Skills/Artisan/Cartography.md) "Map Items and the Player Economy"
- Quote: "winter ... freezes routes that ran open in summer" / "a form that can be handed to another player"
- Problem: Only Tundra and Desert mention weather; no biome says what winter does (Swamp, Coast, Mountain Range passes). Cartography does not say whether a map item can be copied, whether it goes stale when resource nodes move (Nature Growth, depletion), or whether a looted map is usable by the killer.
- Suggest: Add a seasonal line to each launch biome; state that map items are single-copy, show node positions as of the survey date, and are lootable.

Strong work in this area:

- Magic/Spells/Earth/Fissure.md: a worked, sensory cast with readable tells, real counterplay and upgrades that change delivery rather than damage.
- Biomes/Coast.md: tide, fog, wrecks and Mermaid form one connected hazard loop with settlement patterns that follow from it.
- Structures/Dwarven-settlements.md: the golden goblin grudge is tied to a rule (bounty open to all, no race treatment).

### Art, audio, interface and settings

**AR1. Fired brick bond: English bond versus running bond** (High, confirmed)
- File: [Art-direction/Building-materials/Fired-brick.md](Art-direction/Building-materials/Fired-brick.md), section "Look at Eye Level"
- Quote: "The bricks are laid in English bond, alternating courses of long faces (stretchers) and short ends (headers)"
- Problem: The brief, the hub and the surface standard disagree on the one visual fact that defines the material. An artist following the standard builds a different wall from one following the brief.
- Conflicts with: Art-direction/Building-materials.md "small regular units in a running bond"; Art-direction/Surface-authoring.md "fired brick follows the real proportions of a brick laid in a running bond".
- Suggest: Pick one bond (English bond is the richer brief) and change the hub and Surface Authoring to match.

**AR2. Course counts do not add up to the 3-metre module** (High, confirmed)
- File: [Art-direction/Building-materials/Dressed-stone.md](Art-direction/Building-materials/Dressed-stone.md), section "Construction and Joints"
- Quote: "a panel of about five courses of 0,60 metres"
- Problem: The same brief gives blocks "0,30 metres high" (and Reinforced and Warded use 0,60 by 0,30), so five courses is 1,5 m, not 3 m. Fitted-masonry.md says "typically three courses of the squared style" with blocks 0,40 to 0,50 m high (1,2 to 1,5 m). Rough-timber.md gives "six to nine courses" of logs "twenty to forty centimetres across" (1,2 to 3,6 m). No lane file states the wall height, so none of this can be checked.
- Conflicts with: Art-direction/Surface-authoring.md "dressed courses run 25 to 40 centimetres" (ten courses make 3 m).
- Suggest: State the full wall height once in Building-materials.md (and thickness, see 5), then correct each course count (dressed ten, fitted six to seven, rough timber to fit).

**AR3. Holographic region wall breaks the art rules** (High, reported)
- File: [UI-and-HUD.md](UI-and-HUD.md), section "Unavailable Region Feedback"
- Quote: "An approaching player sees a translucent holographic error wall at the actual limit of permitted travel"
- Problem: A glowing, floating wall carrying a UI sentence is the "clean, glowing, floating script" the art canon bans, in a pre-gunpowder world with no technology of that kind, and it is drawn in the frame as a physical object.
- Conflicts with: Art-direction.md "never a place where magic is drawn as clean, glowing, floating script"; same file "It is never industrial".
- Suggest: Redesign the cue in-world (a bank of mist or storm front, a leyline haze, a wall of fog that thickens) with the text only as a HUD prompt near the edge.

**AR4. The wall pins a fleeing player in a full-loot fight** (Medium, reported)
- File: [UI-and-HUD.md](UI-and-HUD.md), section "Unavailable Region Feedback"
- Quote: "Reaching the wall grants no invulnerability and does not reset combat."
- Problem: A hard travel limit that cannot be crossed, with combat continuing on the same server, is a cage. Attackers can drive a victim into it (or a raider can time a raid with a region down), and mounts or flyers meet it at speed. The text names no failure case.
- Suggest: Say what the wall does to movement (stop, push back, slow), whether it can be used as an escape-block, and what rule frees a player trapped against it (for example a timed pull back from the edge).

**AR5. Settings that create a competitive edge are not constrained** (High, confirmed)
- File: [Player-settings.md](Player-settings.md), sections "Setting Profiles" and "Audio Layers"; [UI-and-HUD.md](UI-and-HUD.md) section "Perspective"
- Quote: "Profiles should not create competitive advantages beyond letting players choose readable, accessible settings."
- Problem: The rule is stated but the settings the docs themselves list break it. UI-and-HUD.md says players adjust "field of view", with no cap, in a game justified by "a third-person camera would let players see around corners"; a wide FOV does the same. A combat profile that "reduces visual clutter" and "prioritizes performance" can drop foliage, fog and shadows, and gamma can lift the dark regions Art-direction.md sinks "into heavy fog and deep shadow"; Weather-time-and-seasons.md says "Rain and fog cut visibility". Boosting "creature cues" and "combat impacts" over the mix gives audio advantage.
- Conflicts with: UI-and-HUD.md "what a player hides for cleanliness can never be something the game relied on them seeing".
- Suggest: Add a settings-fairness paragraph: FOV range capped (or server-clamped), no setting may reduce fog, darkness or foliage below an enforced floor, gamma anchored by a calibration, and say which audio layers may exceed their default.

**AR6. Wall thickness and batter are undefined, but snapping depends on them** (Medium, reported)
- File: [Art-direction/Building-materials/Fieldstone.md](Art-direction/Building-materials/Fieldstone.md) (and Cobblestone, Clay-and-adobe, Fitted-masonry), sections "Look at Eye Level" and "Construction and Joints"
- Quote: "Walls are thick, 0,50 to 0,80 metres, with a sloping face"
- Problem: Cobblestone is 0,40 to 0,60 m, adobe "a full 0,40 metres at the least", fitted masonry is "battered, its face leaning back a few degrees", adobe and fieldstone lean or slope too. The kit has one set of snap points, and walls meet pillars "flush with either of its outer corners", sit on wall foundations "only as thick as a wall", and stack under ceilings and upper walls. A battered face over 3 m shifts the top by about 10 cm or more. No file says how thickness and batter reconcile with one snap grid.
- Conflicts with: Building-system.md "wall foundations, ground-supported like any foundation but only as thick as a wall"
- Suggest: Fix one structural wall thickness for the kit and say that batter, thickness and splay are visual-only on the outer face, or list the thickness per material and the matching foundation.

**AR7. Plinth variants bake a second material into the wall piece** (Medium, reported)
- File: [Art-direction/Building-materials/Clay-and-adobe.md](Art-direction/Building-materials/Clay-and-adobe.md), section "Construction and Joints"
- Quote: "A plinth variant of the wall piece, a low course of fieldstone or cobble 0,30 to 0,50 metres tall"
- Problem: Fired-brick.md does the same ("the low stone course the walls stand on"). A wall with a different material in its foot is exactly what the building rules forbid, and the Timber-and-plaster brief correctly treats its plinth as a separate footing.
- Conflicts with: Building-system.md "Nothing is baked into anything else, except what makes a material what it is"
- Suggest: Make these plinths wall foundations or separate pieces of the stone material, as the Timber-and-plaster brief does.

**AR8. Briefs cover only walls and roofs, not the rest of the kit** (Medium, reported)
- File: [Art-direction/Building-materials.md](Art-direction/Building-materials.md), opening paragraph
- Quote: "the bare wall piece, the frame members that dress it, and the fittings that fill its openings, each its own piece"
- Problem: Building-system.md lists foundations (square and triangular, full and half), wall foundations, pillars, half-width and half-height walls, floors, ceilings, stairs, ramps and ladders. The briefs describe a full wall, a corner and a roof; foundations, pillars, triangular and half pieces, ceilings and stairs have no dimensions or look per material (stairs appear only in Living-wood and Dressed-stone). The briefs also never name the opening types (window, large window, pair, door, double door, gate, hatch) or their left/centre/right positions.
- Conflicts with: Building-system.md "Foundations, square and triangular, in full and half widths"
- Suggest: Add a piece-list table to the hub (piece, size, which brief section describes it) and a per-material line for foundation, pillar and stairs.

**AR9. Roof coverings have no owner** (Medium, reported)
- File: [Art-direction/Building-materials/Fired-brick.md](Art-direction/Building-materials/Fired-brick.md), section "Construction and Joints"
- Quote: "a 45-degree pitch of timber trusses under clay pantiles or slate"
- Problem: Building-system.md speaks of "every roof material" and "a slate tower", yet slate, clay tile and shingle are not materials in the family. Tile and slate recur in five briefs, shakes and thatch in three. A roof is also described as rafters plus sheathing plus covering, which is several parts, against "every piece is one simple part".
- Conflicts with: Building-system.md "Every roof material comes in three pitches"
- Suggest: Decide whether a roof piece takes its wall material's look or a covering chosen as a finish, say so in the hub, and give tile, slate and shingle one shared description.

**AR10. Warded stone's "charged" state is undefined** (Medium, reported)
- File: [Art-direction/Building-materials/Warded-stone.md](Art-direction/Building-materials/Warded-stone.md), section "Wear, Weathering, and Damage"
- Quote: "At night, and only when the ward is charged, the crystal takes on a faint inner light"
- Problem: Nothing in the lane or in Building-system.md says what a ward is, what charges it, from where, or what happens when it is empty. The brief points to Materials for gameplay properties, but that section gives warded stone one clause. The art cannot specify a driven emissive state without a driver.
- Conflicts with: Building-system.md "stone laced with mana crystal for warded walls"
- Suggest: Add the ward mechanic (or a TODO) to Building-system.md, then state in the brief which parameter the glow follows.

**AR11. Surface standard lacks maps for translucent and glowing materials** (Medium, reported)
- File: [Art-direction/Surface-authoring.md](Art-direction/Surface-authoring.md), section "Required Maps"
- Quote: "Every surface carries a base colour map, a tangent-space normal map, and a roughness map."
- Problem: Thatch-and-hide demands hide "translucent when the sun is behind them", Living-wood needs leaves and bark shingles, Warded-stone needs a driven night glow, and Timber-and-plaster needs leaded glass. The standard names no opacity, transmission or subsurface, two-sided foliage, wind or emissive handling.
- Conflicts with: Art-direction/Building-materials/Thatch-and-hide.md "translucent when the sun is behind them"
- Suggest: Add a short section on translucent, foliage and emissive surfaces with the maps and the in-game driver for each.

**AR12. Art-direction gives biome light and colour for four woodlands only** (Medium, reported)
- File: [Art-direction.md](Art-direction.md), section "Light, Colour, and Atmosphere per Region"
- Quote: "Every biome carries its own palette, key light, atmosphere, and colour grade"
- Problem: Only Forest, Ancient Forest, Jungle and Bamboo Jungle get a signature. Plains, Swamp, Tundra, Desert, Mountains, Coast, Deep Caverns and Floating Islands get none here, and the Plains file has no art register either. Night, storm and winter looks per region, which the weather system drives, are not given.
- Suggest: Add a one-paragraph signature (palette, key light, silhouette, survival read) for each remaining biome, and a rule for night and weather per register.

**AR13. No direction for the first-person view, characters, or effects** (Medium, reported)
- File: [Art-direction.md](Art-direction.md), section "Characters and Creatures"
- Quote: "rendered to a high human fidelity, with believable skin, hair, armour, cloth, and the grime and wear of a hard life"
- Problem: The game is first person only, so the player's own hands, arms, held tools and weapons are the most-seen assets, and there is no brief for them. Nothing says how races read at a distance, how armour tiers or guild colours show, or what clothing looks like. Combat VFX (hit sparks, blood, fire, water, weather) get one clause in "Violence Made Real" with no rules for decal persistence or cost. The UI has no visual style (type, icons, frame); UI-and-HUD.md gives only "a dark translucent backdrop with outlined text".
- Suggest: Add sections for the viewmodel, race and armour silhouette, effects, and interface style, each with its own reference list.

**AR14. "Source-art contract" does not exist** (Medium, confirmed)
- File: [Art-direction.md](Art-direction.md), section "Authoring an Asset"
- Quote: "the source-art contract that the asset generators work to"
- Problem: The reading order names a document that is not in the repository (the phrase appears nowhere else) and is not linked. The three delivery levels it names are likewise defined nowhere else.
- Suggest: Link the real document, write it, or drop the step.

**AR15. Launch scope promises shared models; the briefs specify separate geometry** (Medium, reported)
- File: [Art-direction/Building-materials/Fitted-masonry.md](Art-direction/Building-materials/Fitted-masonry.md), section "Construction and Joints"
- Quote: "battered, its face leaning back a few degrees from base to top"
- Problem: Launch-scope.md says "a dwarven wall and a human one differ in their trim and stone rather than in being separate models from the ground up". The fitted wall is battered with a trapezoidal reveal and polygonal coursing, so it cannot share a model or a course-based tiling texture with dressed stone. Surface-authoring.md also requires tiles that cover "a whole number of boards, courses", which the polygonal style has none of.
- Conflicts with: Launch-scope.md "differ in their trim and stone rather than in being separate models"
- Suggest: Say which materials are distinct geometry sets, and state the tiling rule for the polygonal style (trim-sheet or unique sets).

**AR16. Player-settings is still written as a proposal and is thin** (Medium, reported)
- File: [Player-settings.md](Player-settings.md), section "Setting Profiles" (whole file)
- Quote: "Player settings should support both comfort and situational play."
- Problem: "should", "might", "useful layers include" run through the file. It lists no setting a builder could implement beyond gore, nudity, FOV and view-bob, and the audio layers read as a menu of suggestions.
- Suggest: Rewrite as settled design: the profile contents, the layer list, ranges, defaults, and which settings are server-enforced.

**AR17. Accessibility features are promised but live nowhere** (Medium, reported)
- File: [Accessibility.md](Accessibility.md), section "Seeing the Game"
- Quote: "options to temper flashing and harsh effects"
- Problem: Accessibility.md hands the options to Player-settings ("where they live"), but that file has no text scaling, colourblind mode, subtitles, flash reduction, horizon stabilisation, crosshair dot or remapping. The two files describe different games' option menus.
- Conflicts with: Player-settings.md (sections "Content and Comfort", "Audio Layers" list none of these)
- Suggest: Move one concrete option list into Player-settings and have Accessibility reference it.

**AR18. Accessibility parity claim conflicts with its own options** (Medium, reported)
- File: [Accessibility.md](Accessibility.md), sections "Hearing the Game" and "Operating the Game"
- Quote: "an accessible setup is never a disadvantaged one and never an unfair edge either"
- Problem: Visual mirrors of "directional danger cues" can give exact bearing and distance that hearing players get only approximately and attenuated by walls (a radar the HUD otherwise refuses: "Nothing on the screen tells a player which way they face"). "Options that ease timing-heavy or simultaneous inputs" could widen parry or dodge windows in PvP.
- Conflicts with: UI-and-HUD.md "no minimap"
- Suggest: Define the mirror's precision (coarse direction, same occlusion and range as the sound) and state that timing assists change input, never the window the server judges.

**AR19. Hiding the HUD can hide critical status** (Low, reported)
- File: [UI-and-HUD.md](UI-and-HUD.md), section "Customization and Profiles"
- Quote: "what a player hides for cleanliness can never be something the game relied on them seeing"
- Problem: The same section allows "a hidden-interface cinematic mode" and per-element toggles, yet the prompt budget relies on bleed, knocked down and winded prompts, and health carries no number. Only the corpse outline and region wall are said to stay visible when the HUD is hidden.
- Conflicts with: UI-and-HUD.md "The health and stamina bars carry no numbers"
- Suggest: List the cues that survive HUD hiding (a screen-edge damage and bleed treatment) or state that cinematic mode ends on damage.

**AR21. Warded glow colour contradicts the current-colour rule** (Low, reported)
- File: [Art-direction/Building-materials/Warded-stone.md](Art-direction/Building-materials/Warded-stone.md), section "Wear, Weathering, and Damage"
- Quote: "a cold blue-white or violet no brighter than embers, the deep-current colour"
- Problem: Art-direction.md describes the deep currents as "blue-black and slow", and gives bright, pale colours to the high currents.
- Conflicts with: Art-direction.md "cold, dark, and sinking, blue-black and slow"
- Suggest: Name a dim blue-violet for the deep current, and keep blue-white for the high-current floating-island variant.

**AR22. Audio direction gives no content a sound team could start from** (Low, reported)
- File: [Audio-direction.md](Audio-direction.md), sections "Sound Design" and "Voice"
- Quote: "Each realm and culture carries its own instrumentation"
- Problem: There is no instrument family per people, no footstep and armour noise by material and weight (stealth and ambush are core in a full-loot world), no building sounds (hits per material, creaks, collapse), no voice chat or proximity rule although Player-settings lists a voice-chat layer, and no language count for "localization load".
- Conflicts with: Player-settings.md "voice chat" layer
- Suggest: Add a footstep and impact table by material, an instrument palette per people, and a voice-chat paragraph.

**AR23. Racial palette claim points to files that hold no palettes** (Low, reported)
- File: [Art-direction.md](Art-direction.md), section "Shape Language and Material Discipline"
- Quote: "These palettes are drawn from the architecture in Races and the settlement files it links"
- Problem: Races/Human.md and Structures/Human-settlements.md mention no building materials; Elf and Dwarf files barely do. The palette lives only here and in the briefs, so the link is circular. The palette also omits cut stone and brick for humans and fitted masonry for dwarves.
- Conflicts with: Art-direction/Building-materials/Fired-brick.md ("Human towns build with it")
- Suggest: Reword so the briefs are the source, and add human stone and brick and dwarven fitted masonry to the palette sentence.

**AR24. Hub describes a different reference set than the briefs deliver** (Low, reported)
- File: [Art-direction/Building-materials.md](Art-direction/Building-materials.md), opening paragraph
- Quote: "a reference plate in one shared layout ... and two close-ups"
- Problem: Each brief embeds two plates and lists four to seven close views plus a weathering pass.
- Conflicts with: any brief's "Reference Set" section
- Suggest: Reword the hub to say one plate and one variants sheet with the listed close views.

**AR25. Units and number style drift between briefs** (Low, reported)
- File: [Art-direction/Building-materials/Thatch-and-hide.md](Art-direction/Building-materials/Thatch-and-hide.md), section "Look at Eye Level"
- Quote: "four to ten centimetres across at the thick end"
- Problem: Clay, brick, fieldstone, cobble, dressed, fitted and warded use "0,40 metres" form; thatch, timber, planked, living wood and plaster use spelled-out centimetres. Fitted masonry joints of "0,001 to 0,003 metres" are sub-texel at the 512 texels per metre the standard sets, so they must be geometry or normal detail; this is not said.
- Conflicts with: Art-direction/Surface-authoring.md "512 texels per metre"
- Suggest: Use one form (metres with commas) in all briefs and note how sub-texel joints are carried.

Strong work in this area:

- Art-direction.md: "The Four Woodlands" gives five dials per biome with a "name it from the trees alone" test; this is directly usable by an artist.
- Art-direction/Building-materials/*.md: every brief separates wall, frame members and fittings and closes with an explicit "avoids" list against other games' kits, which makes the kit buildable and the review checkable.
- Art-direction/Surface-authoring.md: the acceptance check (arm's length, neutral and in-game light, three variants side by side) is concrete and testable.

### Server architecture

**SV1. Per-player bandwidth budget is cited as a commercial limit but does not exist** (High, confirmed)
- File: [Monetization.md](Monetization.md), section "What the Subscription Must Carry" (cited by this lane)
- Quote: "the per-player bandwidth budget in [Dynamic Culling & Render Distance] is treated as a commercial limit as much as a technical one"
- Problem: Dynamic-culling-and-render-distance.md, Server-architecture.md, the technical guide and Server-settings.md contain no per-player bandwidth figure (only the boss presence budgets of about 13 KB/s and 10 KB/s). The cost model ("bandwidth one to three dollars per concurrent player") rests on a number nobody has stated. A player with a 1,5 km relevance radius and a 30 Hz player update rate in a city can see hundreds of entities. The gateway adds a second hop (server to gateway to client) plus routes to neighbour servers, and none of that traffic is costed.
- Conflicts with: Server-settings.md "Every Cluster Unit Server has explicit CPU, memory, bandwidth, entity-count, and replication budgets" (no values anywhere)
- Suggest: add a "Bandwidth per player" section to the culling doc or Server-settings.md: KB/s per player in open country, in a city and in a 200-player battle, including gateway fan-out and neighbour-route traffic. Reconcile it with the 1 to 3 dollar claim.

**SV4. Two mechanisms show neighbour entities to a player, with no stated division** (Medium, reported)
- File: [Server-architecture (Technical).md](<Server-architecture (Technical).md>), sections "6.3 Receiving Ghost Entities" and "7.3 Client Connection Continuity"
- Quote: "Ghost actors still replicate to clients in the receiving region through the ordinary replication pipeline" versus "the fork connects each client only to its primary and to the neighbour servers whose ghosts that player can see"
- Problem: if the gateway holds a route to the neighbour server, that server's real actors reach the player through the proxy, and the ghost on the primary server would show the same entity twice. The acceptance criterion forbids "duplicated actor presentation". Which route renders what, and whether ghosts replicate to gateway-connected clients at all, is undefined. Spec 4.2 says ghosts are "used only to display the entity to its own players", which suggests ghosts only, leaving neighbour routes unexplained.
- Conflicts with: Server-architecture.md section 5.2, "talks to ... the neighbouring servers whose ghosts the player can see"
- Suggest: pick one. Either ghosts serve AI and hit detection only and the neighbour route serves player display (clients never receive ghost actors), or the reverse and drop neighbour routes. Write the choice into both files.

**SV5. Hit claims rewind to the wrong time for what the attacker saw** (Medium, reported)
- File: [Server-architecture (Technical).md](<Server-architecture (Technical).md>), section "9.1 Hit Claims"
- Quote: "ClusterTime: float64, // when the hit landed on the attacker's server" and "rewinds the target to `ClusterTime`"
- Problem: the attacker aimed at a ghost that lags the target by ghost propagation, interpolation delay and client latency. Rewinding the true target to the landing time puts it ahead of the picture the shooter saw, so moving targets across a seam are systematically harder to hit than on one server. That breaks "standing on [the line] gains a player nothing". Half a second of history may also not cover 150 ms client plus ghost delay under jitter.
- Conflicts with: Server-architecture.md section 6.1, "No gameplay rule refers to the region line"
- Suggest: the claim carries the ghost snapshot time the attacker saw, with a stated maximum rewind in Server-settings.md.

**SV6. Consolidation trigger is cheap, the action expensive, no cooldown** (Medium, reported)
- File: [Server-architecture (Technical).md](<Server-architecture (Technical).md>), section "9.2 Seam Consolidation"
- Quote: "by default 20 claims in 10 seconds" ... "60 seconds without cross-region claims"
- Problem: two players trading hits across a seam (2 claims a second) force a whole-region migration with a full snapshot and gateway re-routing for everyone in both regions, which releases after 60 s and can repeat. Two accounts can force this on a city seam at will, a cheap load and griefing attack. There is no rate limit, minimum dwell or per-region migration budget, and the threshold ignores how many entities live in the regions. Spec 6.2 also says the Master "can always do" it, then "bounded by that server's capacity".
- Suggest: weight the trigger by the cost of migrating the regions, add a minimum hold time and a migration budget per region per hour, and fix the "can always do" wording in the spec.

**SV8. Crash-recovery number disagrees with itself, and whole-world crash is unaddressed** (Medium, confirmed)
- File: [Server-architecture (Technical).md](<Server-architecture (Technical).md>), section "8.3 Crash Recovery Flow"
- Quote: "heartbeat timeout (within ~5 seconds)" versus "Players experience a brief pause (< 5 seconds total in a well-tuned system)"
- Problem: detection alone takes about 5 s, before the standby fetches a snapshot, replays deltas and transactions and streams World Partition cells. "< 5 seconds total" cannot hold. In the single-server fallback the crashed process is the whole world, so the standby must restore every region and sleeping character at once; neither the time nor the standby sizing is stated.
- Conflicts with: Server-architecture.md section 7.4 "only a brief pause"
- Suggest: restate as detection time plus restore time per region, give a realistic target (tens of seconds) and size the standby for a whole fallback world.

**SV9. Code sketch contradicts prose: ground entities and forward bias** (Medium, reported)
- File: [Server-architecture (Technical).md](<Server-architecture (Technical).md>), sections "5.4" and "6.2"; [Server-architecture.md](Server-architecture.md) section "4.1"
- Quote: spec: "a fast ground entity is given a forward-elongated volume scaled to its ground speed". Code: "Velocity.GetSafeNormal() * (VisRadius * 0.5f)"
- Problem: the tech default for every entity is a symmetric speed-scaled radius, directional only for fast flyers (5.4 says so), while the spec promises elongation for ground entities. In 6.2 the bias is applied for any non-zero velocity, so a walking player's test box is shifted 0,5 R forward (750 m) and reaches only 0,5 R behind. That contradicts "a stationary or slow entity keeps a symmetric sphere". The box is also a cube of half-side R, so corners overshoot the sphere by up to 1,7 times. The forward shift is added on top of a radius already inflated by Speed x 1,5 s x ModeFactor, so look-ahead counts twice.
- Suggest: scale the bias with speed (zero below a walk threshold), use a sphere or capsule test, remove the double count, and either add the ground-entity directional filter to the tech guide or relax the spec sentence.

**SV10. Value commits versus periodic deltas: inventory and quest state unclear** (Medium, reported)
- File: [Server-architecture.md](Server-architecture.md) section "7.1 Continuous state"; [Server-architecture (Technical).md](<Server-architecture (Technical).md>) sections "8.1" and "8.4"
- Quote: spec: "The persisted data includes player inventories, stats, and affiliation". Tech: "Player: position, survival needs, stats, affiliation, quest flags"
- Problem: spec 7.1 lists inventories among delta-saved data, yet deltas may carry only replayable state. The death transaction moves rows from `victim_inventory`, so the database must hold the true inventory at the instant of death, meaning every pickup, drop, container move, ammo use and equip must commit synchronously, but 7.2 lists only trades, deaths, markets, banks, crafting, gathering and Item Box. "Quest flags" are in the replayable delta while a quest completion is a value event with rewards: a rewound flag re-run gives the reward again unless the event ID is deterministic. Experience is derived once from events (10.3) yet "stats" ride in the delta, so two writers own it.
- Suggest: list every inventory mutation class and mark it synchronous or delta; make outcome event IDs deterministic (character plus quest plus step); name a single writer for experience.

**SV11. Spec and tech disagree on boss region count and the interaction-band count** (Low, confirmed)
- File: [Server-architecture.md](Server-architecture.md) section "4.3"; [Server-architecture (Technical).md](<Server-architecture (Technical).md>) section "6.4"
- Quote: spec: "radius of roughly 5 km covers some eighty regions". Tech: "its disc touches about a hundred 1 km regions"
- Problem: "eighty" is the disc area (78,5 km²); the guide, the culling doc and Server-settings.md all say about a hundred. The tech's "about 12 regions inside the band" for a 1,5 km radius is low (area 7,1 km² plus partial cells gives about 16 to 20), and the culling doc says "a dozen servers".
- Suggest: use "about a hundred" and "about twenty" everywhere and recompute the 10 KB/s full-tier figure.

**SV12. Snapshot sizes do not match the message definition** (Low, reported)
- File: [Server-architecture (Technical).md](<Server-architecture (Technical).md>), sections "6.1" and "6.4"
- Quote: "a presence snapshot of about 64 bytes on the wire" and "160 bytes" for the full tier
- Problem: the listed message has a string `OwnerServer`, a `RegionKey` with a split path, and three double-precision FVectors/rotators (about 72 bytes for transform and velocity alone) plus ids and time. Neither 64 nor 160 bytes is reachable without a defined compact encoding, and the presence tier is described as only "position, pose, and the few states".
- Suggest: define a separate compact presence message (id, quantised position, pose, flags, generation index) and state sizes for each tier.

**SV13. Group handoff can be stalled by membership churn** (Low, reported)
- File: [Server-architecture.md](Server-architecture.md) "5.2 Coordinated transfers"; [Server-architecture (Technical).md](<Server-architecture (Technical).md>) "7.2"
- Quote: "Boarding, leaving, death, or detachment changes that version; commitment requires a matching, revalidated membership snapshot."
- Problem: anyone who steps on and off the deck of a carrier near a border invalidates the snapshot each time, so a mobile base can be pinned at its travel limit by one griefer. No retry limit, lock-out of boarding during preparation or tie-break is defined.
- Suggest: freeze boarding for the carrier during the prepare phase of a transfer, with a short ejected-or-excluded rule for late arrivals.

**SV14. Admission stop at the dilation floor has no priority rule** (Low, reported)
- File: [Server-architecture.md](Server-architecture.md) section "6.3"
- Quote: "the region stops admitting new arrivals, holding them at its edge behind the same holographic wall"
- Problem: attackers or a crowd that deliberately drive a city or siege region to its floor lock everyone else out, with no stated queue order and no priority for residents, defenders, guards, or sleeping characters returning. The exemption list also omits "hostiles within weapon range", which Server-settings.md and tech 11.3 include.
- Suggest: add an admission order (residents and defenders first, then first come) and make the three lists of never-shed items identical.

**SV15. Master and clock single point of failure; unverified engine claims** (Low, reported)
- File: [Server-architecture.md](Server-architecture.md) section "2"; [Server-architecture (Technical).md](<Server-architecture (Technical).md>) sections "2.1", "2.2", "5.4", "5.5"
- Problem: the cluster clock, which drives weather, every timer and every timeline, lives on the Master, but only node failure is covered. Master and clock failover and clock monotonicity across a Master restart are not stated (7.7 tests a restart mid-transfer, not clock continuity). Unverified claims: `WorldPartitionGridSize` as a key under `[/Script/Engine.WorldSettings]`; `StreamingSource->Radius` on `UWorldPartitionStreamingSourceComponent`; the `UForwardBiasedFilter::IsRelevantTo(ViewLocation, EntityLocation, Velocity)` signature (looks unlike Iris's filter interface); `SetCullDistanceOverride` on the replication system; a dungeon map "loaded alongside the overworld" in one dedicated-server process with its own gravity and clock; a replicated `TimeDilation` applied sensibly on a proxy client that merges several servers' worlds; the "OmniMesh ~500 players in a single seamless battle" figure and the "64–100 players per server" default.
- Suggest: add Master failover and clock persistence to section 3 of the guide; mark the sketches above as pseudocode or verify them at the prototype gate.

Strong work in this area:

- Server-architecture.md section 7.2 "Value never splits": one atomic transaction per value event with idempotency IDs and generation fencing, plus concrete race outcomes (Item Box versus death).
- Server-architecture (Technical).md section 7.2: the cutover is one database row with a fenced generation, and every crash case is settled by reading the row.
- Server-architecture.md section 5.3: combat at an unavailable region follows one clear principle (live owners fight, stale ghosts never target), so the wall is never a shelter.

### Building and settlement generation

**BD1. NPC buildings "fail the same way" but the settlement guide has no piece-level state** (High, confirmed)
- File: [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), sections "2.2 Runtime State", "6.1 Lot State Machine"; [Building-system (Technical).md](<Building-system (Technical).md>), section "6.1 Damage Kinds and Resistance"
- Quote: "float Health = 1.f;               // 0..1" (FLotState); Building guide: "how damage to an NPC building is tracked and rebuilt stays with Settlement Generation (Technical)"
- Problem: Building tech defers NPC damage tracking to the settlement guide. The settlement guide holds one scalar Health per lot and replicates "about ten bytes per lot": no pieces, links, stability or per-piece health. Raiders cannot go for the pillars of an NPC house, a wall cannot be breached, and collapse is just Health reaching 0. The hand-off is circular and the promise below is unbuilt.
- Conflicts with: Settlement-generation.md, "a raided town burns, breaks, and collapses the way a player's base does"; Building-system.md, "fail in the same ways"
- Suggest: Decide whether a standing NPC building is an FBaseRecord (pieces, stability, per-piece damage, persisted) assembled from its variant's pattern, or an abstract lot with a scripted breach. Rewrite both hand-offs to match, and add the cost to the 2 000-visible-piece scene budget (a great city has thousands of lots).

**BD3. Unclaimed bases have no ceiling and no claim gap** (Medium, reported)
- File: [Building-system (Technical).md](<Building-system (Technical).md>), sections "3.4 Server Validation", "7.5 Unclaimed Pieces and Ceilings"
- Quote: "outside any claim, anyone may build (section 7.1)"; "The base has room under its claim's piece ceiling"
- Problem: Step 9 needs a claim, so an unclaimed base has no ceiling, and the claim gap is checked only for "a foundation placed by a rights holder". Anyone can raise unlimited pieces on unclaimed ground right at a rival claim's edge for the few days before expiry (siege forts, boxing in a neighbour). Only foundations and pillars carry ExpiresAt, so wall foundations (fences, palisades) never expire.
- Conflicts with: Building-system.md, "Every claim also has a ceiling on the number of pieces"; "Foundations and pillars that are not connected to any claim decay within days"
- Suggest: Give unclaimed bases a small ceiling, apply the claim gap to every foundation, and add wall foundations to the expiry rule.

**BD4. Claim radius and claim gap have no value; palisades can project a claim** (Medium, reported)
- File: [Building-system (Technical).md](<Building-system (Technical).md>), section "7.1 The Claim Area and Building Rights"
- Quote: "horizontal discs of a fixed claim radius centred on every foundation and wall foundation"
- Problem: Neither file gives the radius or the gap, and the backlog entry covers kit dimensions, not these. Wall foundations are thin and cheap and carry fences, so a line of them stretches a claim far for little upkeep. Nothing can be judged or built without the two numbers.
- Suggest: Give default radius and gap in metres, and decide whether wall foundations extend a claim (or only at a reduced radius).

**BD5. Double doorway cannot take an offset; half-width walls cannot hold openings** (Medium, reported)
- File: [Building-system (Technical).md](<Building-system (Technical).md>), section "2.4 Kit Specification"
- Quote: "the offset leaving at least 0,30 m of wall to the nearer edge"; "Double doorway | 2,40 m wide ... on a full-width wall"
- Problem: A 2,40 m opening in a 3,00 m wall leaves exactly 0,30 m each side when centred, so left and right offsets are impossible. The large window (2,10 m) offsets by 0,60 m at most. Half-width (1,50 m) walls with a 1,20 m doorway leave 0,15 m a side, under the minimum, and the spec does not say whether half walls take openings.
- Conflicts with: Building-system.md, "sits to the left, in the centre, or to the right of its wall"
- Suggest: State that the double doorway (and large window) are centred only, and that half-width walls are solid or take only a narrow opening.

**BD6. Raised foundation exceeds its 1 m skirt** (Medium, reported)
- File: [Building-system (Technical).md](<Building-system (Technical).md>), sections "2.4 Kit Specification", "3.3 Ground Contact"
- Quote: "3,00 x 3,00 x 1,00 m ... the lower metre a skirt"; "The raise sits inside the skirt, which extends down by the raised height"
- Problem: The approved box is 1,00 m including the skirt, and 3.3 says the raise "does not count against GroundSkirtCm". A 100 cm raise on ground needing slope hiding calls for a skirt of up to 2 m plus the allowance, so the approved box cannot be the model. Wall foundations are in no kit row.
- Conflicts with: Building-system.md, "its skirt reaching down to the earth" (silent on depth)
- Suggest: Make the skirt a variable-depth mesh and say so in the kit table; add a wall foundation row.

**BD7. Fittings have no separate damage or ranged-block model** (Medium, reported)
- File: [Building-system (Technical).md](<Building-system (Technical).md>), sections "2.2 Piece Definitions", "3.5", "5.3"
- Quote: "bool bBlocksPassage = true;        // fittings: whether a body can pass ... (glass and bars block, an open shutter does not)"
- Problem: The spec makes openings the weak point: glass "breaks at the first blow", shutters stop arrows, bars stop "a body but not a spear thrust or an arrow". The guide has one boolean and does not say whether a fitting takes damage on its own, how a broken pane changes passage, or how projectiles and spears pass bars. A raider "reading the openings" has nothing to attack.
- Conflicts with: Building-system.md, "Glass ... breaks at the first blow ... iron bars stop a body but not a spear thrust or an arrow"
- Suggest: Give fittings their own health and a per-kind block table (body, projectile, melee reach), routed through the damage function in 6.1.

**BD8. Spec defence items with no piece or rule** (Medium, reported)
- File: [Building-system.md](Building-system.md), section "Damage and Siege"
- Quote: "spiked wall-tops slow climbers ... stone cladding keeps fire off a timber core"
- Problem: Neither exists in the piece families, fittings or finishes (a finish "never adds a part") nor in the guide. Fire spreads along links only, so hosted fittings never ignite and cladding has no mechanism. "Earth magic ... the ground under foundations" has no counterpart either, only an area call into the damage function.
- Conflicts with: Building-system (Technical).md, "6.2 Fire" (links only)
- Suggest: Add a cladding piece family (fire-blocking layer on a timber wall) and a spiked-top fitting, or cut the sentences. Add a foundation-undermining rule or reword Earth damage.

**BD9. Outskirts plot is an invulnerable stash, and its decay path does not exist in the guide** (Medium, reported)
- File: [Building-system.md](Building-system.md), "Outskirts Plots"; [Building-system (Technical).md](<Building-system (Technical).md>), "11. Outskirts Plots"
- Quote: "everything on it is beyond any raider's reach"; guide: "it enters Starving and decays and lapses as in section 7.3"
- Problem: Design: chests on a plot can never be looted or burned and the owner logs out there safely, so a plot is a raid-proof, death-proof vault in a full-loot game, cheap in tax, with no limit on what is stored. Technical: 7.3 triggers on an upkeep line's PaidUntilDay, but a plot has "a deed instead of a marker and a store" and no lines, so Starving never fires. Whether a plot counts toward the owner's holding factor is unstated.
- Suggest: Limit stored value or let container contents be lootable after lapse; give the plot one synthetic tax line; state the holding-factor rule.

**BD10. Settlement "same parts a player can build" versus the guide and the shapes** (Medium, reported)
- File: [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), "2.1 Authored Assets" and "7.1"; [Settlement-generation.md](Settlement-generation.md), "The Building Blueprint Hierarchy"
- Quote: "TArray<FBuildingModule> Modules;       // meshes and transforms the client assembles"
- Problem: Section 2.1 makes variants raw meshes; section 7.1 says the module list is "the building system's own piece and fitting definitions and patterns". FBuildingModule is undefined. The spec's "Corner Building 2 rounds it off", towers and overhanging balconies cannot come from a kit of square and triangular pieces, so "nothing on an NPC facade is a part a player cannot make" fails for the authored shapes.
- Conflicts with: Building-system.md, "[Settlement Generation] builds every NPC house from the same parts"
- Suggest: Define FBuildingModule as a pattern or piece reference, and either add curved or corner-cut pieces to the kit or drop the rounded-corner example.

**BD11. Repopulation tuning contradicts "recovered in a week"** (Medium, confirmed)
- File: [Settlement-generation.md](Settlement-generation.md), "Residents and Repopulation"; [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), "2.1" (FRepopulationTuning)
- Quote: "a city left alone for a week has recovered by the time anyone returns"; "BaseRatePerDay = 0.1f"
- Problem: At 0,1 of the deficit per day with full food and safety, a week recovers about half (e^-0,7 leaves 50 percent). After a raid Safety starts near 0 and at half food roughly a third recovers.
- Conflicts with: same pair
- Suggest: Reword to "partly recovered" or raise the base rate to about 0,4 per day and state the intended half-life.

**BD12. Required functions are not placed first in the roll** (Medium, reported)
- File: [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), "4. The Initial Settlement Roll"
- Quote: "take the function with the largest outstanding count"
- Problem: The spec places required functions first. The guide treats them as quotas with Min of at least 1 ordered by outstanding count, so a guard post (count 1) is placed last, after taverns and bakeries have taken gate and corner lots, and may find no compatible lot; the code then silently drops it ("Outstanding.Remove").
- Conflicts with: Settlement-generation.md, "Required functions are placed first, then the quotas are filled"
- Suggest: Add a required-functions pass before the loop, and make the no-candidate case an authoring error, not a silent drop.

**BD13. Quota rounding contradicts the village example; no "chance" mechanism** (Medium, reported)
- File: [Settlement-generation.md](Settlement-generation.md), "The Settlement Blueprint"; [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), "FServiceQuota"
- Quote: "a village of 150 needs its single tavern and smithy only because the blueprint's minimums say it does"
- Problem: TargetBuildings uses DivideAndRoundUp, so 150 residents give one tavern (150/300) and one smithy (150/400) with no minimum at all; any listed quota yields at least one building. The hamlet row's "a chance of a chapel or a smithy" cannot be expressed: quotas are deterministic counts.
- Conflicts with: same pair
- Suggest: Fix the sentence, or round down with Min doing the work; add a per-quota chance field for hamlets.

**BD14. Distant shell hiding contradicts baked HLODs** (Medium, reported)
- File: [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), "7.3 Distant Views"
- Quote: "A collapsed lot hides its shell, so a burnt district shows its gaps on the skyline"
- Problem: The shell is "baked into the HLODs" yet must be hidden per lot at runtime; a merged HLOD proxy generally cannot drop one member. Unverified claim: whether World Partition HLOD supports per-actor hiding in a baked cluster.
- Conflicts with: same section, "static silhouette placed in the level and baked into the HLODs"
- Suggest: Prototype it, or keep shells as unmerged per-lot actors on an HLOD layer, or accept the skyline not changing.

**BD15. Reroll sketch ignores lot pins and counts** (Low, reported)
- File: [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), "6.2 Rerolling a Collapsed Lot"
- Quote: "A function-pinned lot that collapses keeps its function and rerolls only its style and variant."
- Problem: RerollLot always draws a new function and never reads ELotPin; a landmark would be rerolled too. `Blueprint.TargetBuildingsFor` is undefined (only `FServiceQuota::TargetBuildings` exists). Section 5.1 says catch-up takes "a few cheap steps" while the loop runs one step per in-game day.
- Conflicts with: same section's prose
- Suggest: Branch on Pin in the sketch, name the helper, fix the sentence.

**BD16. Joint validation of housing and quotas** (Low, reported)
- File: [Settlement-generation (Technical).md](<Settlement-generation (Technical).md>), "8.2 Authoring Validation"
- Quote: "the housing in the dwellings the layout can hold reaches the blueprint's target residents"
- Problem: Quota fill and housing are validated separately, but one lot cannot be both a smithy and a dwelling, so a layout can pass both checks and fail jointly after the roll. Section 5.1 also calls the rate "a base rate and three factors" while housing is a cap and the code uses two factors.
- Suggest: Validate that quota lots plus required dwelling capacity fit the free lots together; say "two factors and a housing cap".

**BD17. Spec snap list omits upper-storey walls; ground-source wording inconsistent** (Low, reported)
- File: [Building-system.md](Building-system.md), "Placing Pieces" and "Stability and Support"
- Quote: "the only pieces besides pillars that can" (foundations taking support from the ground)
- Problem: Wall foundations are ground-supported two bullets later, so the sentence is wrong. The spec never says what an upper-storey wall stands on (guide: wall on wall top, vertical joint), which also decides that stone towers are cheap while floors are lateral.
- Conflicts with: Building-system.md, "ground-supported like any foundation"
- Suggest: Fix the sentence; add "walls stack on wall tops and on ceiling edges" to the snap description.

**BD18. Fitting weight "0,33" is not a third** (Low, reported)
- File: [Building-system (Technical).md](<Building-system (Technical).md>), "2.2" and "3.4"
- Quote: "fittings default to the server's fitting weight (0.33)"
- Problem: Spec says "a third of a piece". Three fittings sum to 0,99 so the validation case passes, but 0,33 drifts from a third in floats. 
- Conflicts with: Building-system.md, "A fitting counts as a third of a piece"
- Suggest: Store ceiling in thirds as integers (piece = 3, fitting = 1).

**BD19. Leviathan deck falls under "outside any claim, anyone may build"** (Low, reported)
- File: [Building-system (Technical).md](<Building-system (Technical).md>), "3.4 Server Validation" versus "9. Bases on Creatures"
- Quote: "outside any claim, anyone may build"
- Problem: A deck has no claim, so by 3.4 any player could place pieces on it; the keeper-rights rule lives only in section 9 and `HasBuildRights` is not described as reading it.
- Conflicts with: Building-system.md, "its keeper holds the building rights"
- Suggest: Add the carrier rule to step 3 of 3.4.

**BD20. Beam-to-beam chaining unspecified** (Low, reported)
- File: [Building-system.md](Building-system.md) / (Technical).md, "Frames and beams" and "LossScale"
- Quote: "frames and beams start at 0.2"
- Problem: Beams lose a fifth of a ceiling's lateral loss. If a beam may snap to another beam, a chain of cheap beams carries support far beyond ceiling spans; the pair rules do not say.
- Suggest: State that beams snap only to wall, floor and ceiling faces, or give a per-chain cap.

Strong work in this area:

- Building-system (Technical).md: the worked example is reproduced exactly in numbers and the two-phase removal pass is clear and correct for integer losses.
- Building-system.md: "Every piece is one simple part" with fittings, finishes and patterns gives a coherent kit logic that the validation table tests.
- Settlement-generation (Technical).md: roll keys per level, server-only rolls and persisted results make rebuilds deterministic and update-safe.

### Movement, melee and wounds

**MV2. Cross-server hits cannot work as written** (High, confirmed)
- File: [Melee-combat (Technical).md](<Melee-combat (Technical).md>), "Research Baseline" and sections 4, 6, 8; [Health-and-wounds (Technical).md](<Health-and-wounds (Technical).md>), section 1
- Quote: "everything below assumes both bodies are simulated by one server."
- Problem: Regions are 1 km², so a fifth of the map lies within about 50 m of an edge, and fights routinely straddle one. The strike runs inside the attacker's move on server A, the rewind history is "of every character" on that server, and `UVitalsComponent` is "server only". A ghost on server A has no hit-volume history, no guard state, no stamina and no vitals, and the block cost goes through `RequestStaminaSpend`, which the defender's own server must apply inside the defender's move. Recoil, stagger and push also have to travel back across the boundary within the same tick budget. Stating "one server" in two guides leaves the central PvP and creature-pack case unspecified.
- Conflicts with: Server-architecture (Technical).md ghost entity protocol (the only cross-boundary state named in Movement (Technical) section 8 is the `FLocomotionView` flags).
- Suggest: Add a section to Melee (Technical) and Health (Technical) fixing who is authoritative for a hit across a boundary (target's server resolves, attacker's server sends a hit claim with view time), what a ghost carries (hit volumes with a short history, guard phase), and what happens to a claim that arrives after a handoff.

**MV3. A running sprint can be held at full speed while looking straight behind** (High, confirmed)
- File: [Movement.md](Movement.md), section "Turning and Facing"; [Movement (Technical).md](<Movement (Technical).md>), section 4.1
- Quote: "it holds through an arc of about a hundred and ten degrees either side of the facing"
- Problem: Spec says running from something while watching it "is slow and costly", but a sprint already running keeps full speed to 110 degrees off the facing, and the head can turn 80 degrees more. A sprinter whose facing is 100 to 110 degrees off the line of travel, with the head turned, looks directly at a pursuer behind them at full sprint after one slow body turn (about 1,4 s at the 74 degrees a second the sprint radius allows). The tech guide also contradicts itself: the direction factor is "one inside the burst cone" (now 110 degrees) yet "falling to SideSpeedFraction ... at ninety degrees", so which applies between 45 and 110 degrees is undefined.
- Conflicts with: Movement.md "can break into a sprint only within about forty-five degrees of where they face, so running from something while watching it is slow and costly"
- Suggest: Keep the 110 degree hold only for the turn-braking calculation, and apply the side and back speed fractions to the actual line of travel off the facing at all times, so a sprint above 45 degrees off the facing drops to the sidestep or backpedal speed.

**MV4. Stamina spend path contradicts itself between the two tech guides** (Medium, reported)
- File: [Movement (Technical).md](<Movement (Technical).md>), section 5.2; [Melee-combat (Technical).md](<Melee-combat (Technical).md>), sections 4 and 8
- Quote: "On the owning client the amount is added to the pending saved move and travels in its move data"
- Problem: Movement (Technical) says costs decided outside the move, "such as the energy a block absorbs", ride in the client's saved move, so a client-chosen amount is trusted (a modified client sends 0). Melee (Technical) section 4 says the opposite: the client "cannot know the energy of a blow it has not yet seen resolved", so the cost arrives as a correction (2,4 per caught blow). Section 8 then routes the block cost through `RequestStaminaSpend` anyway. Both cannot be the mechanism.
- Conflicts with: Melee-combat (Technical).md section 4 "each caught blow reaches it as a correction"
- Suggest: Split the API in Movement (Technical): a client-declared spend (jump, own strike) and a server-imposed spend (block, bleed-through) that is applied by the server and sent as a correction. State that the client never supplies the amount for the second kind.

**MV5. Injury caps "carried in the move" cannot be client-originated** (Medium, reported)
- File: [Movement (Technical).md](<Movement (Technical).md>), section 3
- Quote: "Any condition that changes in combat, injury caps among them, is carried in the move instead of waiting on the replicated struct"
- Problem: Moves flow client to server. A wound is decided by the server from a hit the client may not yet have seen, so the client cannot put the new cap in the move it makes at the same index. The only workable form is a server-stamped move index sent in a correction, which is what the replicated struct already does. The claim that this removes the correction burst is not supported by the mechanism described.
- Conflicts with: Health-and-wounds (Technical).md section 6 ("how the change is carried in the move to avoid a correction burst")
- Suggest: Say the server stamps the cap with the move index it applies from and sends it with the next response; accept one correction per wound, or let the client apply it predictively from a confirmed-hit event.

**MV8. Head and limb damage numbers do not compose** (Medium, reported)
- File: [Health-and-wounds.md](Health-and-wounds.md) "The Head"; [Health-and-wounds (Technical).md](<Health-and-wounds (Technical).md>) section 7
- Quote: "A blow that delivers 150 joules to the head kills outright, whatever health the body had left"
- Problem: At 1,5 health per joule, a person with the default 100 health dies at about 67 J to the head, so the 150 J rule and the 6 s daze cap (reached at 120 J, a delivered 180 health) never matter below roughly 150 base health, and a 60 J head hit gives a 3 s daze before death. Arm and leg health per joule appear nowhere ("set per body plan"), yet falls and the wolf example depend on them: the 40 J lunge costing 14 health implies 0,35 per joule on the arm, and "13 m kills" only works for legs near 0,22 per joule ((13-4) x 25 x 2 x 0,22 = 100). With 0,35 the kill height would be about 9,7 m.
- Conflicts with: Movement.md "from about thirteen metres it can kill outright"
- Suggest: State health per joule for arms and legs in the table, and either lower the head kill rule to a number above the real lethal threshold of the default pool or define it as a share of maximum health.

**MV9. Wound severity thresholds, scratch bleed and grave bleed are missing or contradictory** (Medium, reported)
- File: [Health-and-wounds.md](Health-and-wounds.md) "Wounds" and "Bleeding"; [Health-and-wounds (Technical).md](<Health-and-wounds (Technical).md>) sections 2, 5, 7
- Quote: "from a scratch that does nothing but mark the body"
- Problem: The spec says a scratch does nothing, then says a scratch "clots after about 20 seconds", which implies it bleeds. The tech guide opens a bleed only "at light severity or above" yet tests clotting on scratches and indexes `BleedPerSecond` by all five severities. No grave bleed rate exists (only 0,4 and 1,2). The spec says "deep pierces bleed", the tech guide lets any light pierce bleed. The thresholds (`WoundJoules[4][3]`) that decide light, serious or grave are never given for a person or a wolf, so "a second light cut raises it to serious" and "one bite leaves a light bleed" cannot be built or tested.
- Conflicts with: Health-and-wounds (Technical).md section 5 "A cut or a pierce at light severity or above opens a bleed"
- Suggest: Give the person's wound thresholds per kind, the grave bleed rate, and say whether a scratch bleeds (and at what rate) or only marks.

**MV10. Escalating a wound can steal kill credit** (Medium, reported)
- File: [Health-and-wounds (Technical).md](<Health-and-wounds (Technical).md>), sections 4 and 5
- Quote: "`DealtBy` of the highest-severity open bleeding wound is the instigator of that death"
- Problem: A wound holds one `DealtBy`. A second blow of the same kind raises severity ("a light cut met by a second light cut becomes serious"), but the guide does not say whether `DealtBy` is overwritten. If it is, the player who lands the finishing escalation takes loot and the victim's bounty from the player who did the damage; if it is not, a third party gains nothing. Either needs a rule, especially with bounties on killers.
- Conflicts with: Health-and-wounds.md "A wound remembers who dealt it until it has been treated"
- Suggest: Keep the first dealer on the record, store each contributor with their share of delivered joules, and credit the kill to the largest contributor still untreated.

**MV11. Several spec wound effects have no hook in the technical guides** (Medium, reported)
- File: [Health-and-wounds.md](Health-and-wounds.md) "Wounds"; [Melee-combat (Technical).md](<Melee-combat (Technical).md>) section 9; [Movement (Technical).md](<Movement (Technical).md>) section 9.1
- Quote: "a fractured arm cannot hold a two-handed weapon or bring a shield up against a heavy blow"
- Problem: `ComputeDrive` takes stats and body state but no wound input, and the action slot has no rule that refuses a two-handed ready or a guard on a fractured arm. Health (Technical) section 6 says only "a wounded arm is read by the strike's force". No jump rule exists for the "a jump a gamble" leg wound, no sting rule for burns, and the spec's severely overweight body "risks a stumble on any real slope" while the walk row's `StumbleRiskScale` is zero, so it never stumbles.
- Conflicts with: Movement.md "Severely overweight ... risks a stumble on any real slope"
- Suggest: Add an arm-wound input to `ComputeDrive` and the ready check, a leg-wound jump failure chance, a burn sting cost, and a non-zero stumble scale on the walk row for the over-limit tiers.

**MV12. Falls pass through armour and ignore mass** (Medium, reported)
- File: [Health-and-wounds (Technical).md](<Health-and-wounds (Technical).md>) sections 3 and 7; [Movement.md](Movement.md) "Jumping, Crouching, and Falling"
- Quote: "Falls enter through `ApplyDamage` as crush at each leg's contact point"
- Problem: `ApplyDamage` runs every worn layer, so greaves, mail leggings and boots stop crush before the fall wounds. The 7 m and 13 m figures hold only for bare legs, and a plate-greaved climber survives drops the spec says kill. The spec does not say armour applies. A flat 25 J per metre per leg also ignores mass: a laden 150 kg character, a wolf and a horse take the same energy, while all strikes elsewhere use mass times speed.
- Conflicts with: Movement.md "a fall delivers 25 joules of crush to each leg for every metre beyond four"
- Suggest: Decide in the spec whether armour protects against falls, and scale fall energy by carried mass or body mass relative to a reference.

**MV13. Wolf hears winded breathing across its whole range; the technical guide gives 8 metres** (Medium, reported)
- File: [Movement (Technical).md](<Movement (Technical).md>) section 9.3; [Creatures/Wolf.md](Creatures/Wolf.md) "Pack Tactics"
- Quote: "the pack hears the ragged breathing from across its range and closes"
- Problem: Wolf.md gives a hearing range of 50 m and says a sprinter is "heard across the whole of the wolf's range", but sprint noise is 35 m and breathing is 8 m in Movement (Technical). A winded player 12 m from a circling pack is therefore not marked by breathing, contradicting both Wolf.md and Movement.md's "closes in the moment that player sprints themselves empty". Movement.md also says breathing grows "loud and ragged as the pool runs low", but the tech guide emits it only once winded.
- Conflicts with: Movement (Technical).md "with a range of 8 metres once a second until it recovers"
- Suggest: Either raise the breathing range to 25 to 30 m and start it below a stamina threshold, or change Wolf.md and the stealth text to the 8 m figure.

**MV14. The melee tables cannot be reproduced; Actions fixes timings the model says are emergent** (Medium, reported)
- File: [Melee-combat (Technical).md](<Melee-combat (Technical).md>) sections 3, 9; [Actions.md](Actions.md) "Holding to Act"; [Melee-combat.md](Melee-combat.md) "Weight in Motion"
- Quote: "It takes 0,35 seconds of wind-up, during which it draws 17 stamina a second, then 0,10 seconds active and 0,30 seconds of recovery"
- Problem: `BaseTorqueNm`, `TwoHandFactor`, `LimbSpeedCap`, `WindedTorqueFactor`, `BaseStaminaPerJoule` and `TechniqueEfficiency` have no values, so the spec's times to full speed (0,25 s to 0,75 s) and Actions' 0,35 s spear wind-up cannot be checked. Actions gives fixed phase times and a stamina rate per second, while Melee says there are no fixed timings and stamina is "in proportion to the effort", which the tech guide implements per joule. The 0,25 s cancel lockout in Actions is also fixed, but Melee (Technical) section 4.1 says `ReturnToGuard` grows "with what was held".
- Conflicts with: Melee-combat.md "Melee here is built on those facts rather than on fixed attack timings"
- Suggest: Give the baseline torque, limb cap and per-joule stamina in a table that reproduces the spec's weapon times, and restate Actions' spear figures as outputs of that model (with the lockout rule matching the tech guide).

**MV15. Ranged combat has no numbers and no technical companion** (Medium, reported)
- File: [Ranged-combat.md](Ranged-combat.md), all sections; [Melee-combat (Technical).md](<Melee-combat (Technical).md>) section 6.1
- Quote: "A shot at twenty metres flies almost flat; a shot at a hundred is lobbed"
- Problem: No draw weights, arrow masses, launch speeds, drag, ranges, reload times or stamina per second held exist, so a bow cannot be tuned or compared with melee energy. Bow draw requirements are in "Melee Force", a stat Player.md defines as strike muscle. The tech guide covers projectiles in one subsection and has no body effect for drawing (walk allowed, no sprint) or the crossbow span. Section 6.1 says the shot is rewound to "the attacker's view time" without saying whether targets are also rewound over the flight, which would let a long arrow hit a body that already left on the server.
- Conflicts with: Player.md "The muscle behind every strike, how quickly a weapon starts and stops"
- Suggest: Add a starting table for one light and one war bow and one crossbow (draw weight, arrow mass, speed, energy at 20 and 100 m), rename or extend the stat's description to cover draw, and state that rewind applies at launch only.

**MV16. Armour has no stop energies, weights or noise values and the body model lacks regions its gaps need** (Medium, reported)
- File: [Armour.md](Armour.md), "Materials Against Blows" and "Coverage and Gaps"; [Health-and-wounds (Technical).md](<Health-and-wounds (Technical).md>) section 2
- Quote: "the armpits, the inside of the elbow, the back of the knee, the neck below the helm"
- Problem: Armour names materials and gaps but gives no stop energies per kind, no weights (so "a full harness of plate leaves little room" cannot be checked against the 40 kg base in Prototype-findings), and no armour noise values. The wolf example (14 versus 6,7 health through mail) cannot be reproduced from stated data. The body plan has only head, torso, arms and legs, while Inventory equips gloves, gauntlets and boots and Armour names a neck gap; the region the neck or a hand belongs to is undefined.
- Conflicts with: Inventory.md "Arms, hands, legs, and feet, for sleeves and vambraces, gloves and gauntlets, trousers and greaves, and boots."
- Suggest: Add a starting table (weight, per-kind stop joules, blunt share, noise addition) for the five materials, and say hands, feet and neck map to arm, leg and head or torso.

**MV17. Player.md stats with no hook in these systems** (Low, reported)
- File: [Player.md](Player.md) "Stat Point Allocation"; [Health-and-wounds.md](Health-and-wounds.md); [Movement.md](Movement.md) "Noise"
- Quote: "Resistance to cold, heat, illness, poison, and the daze of a blow to the head"
- Problem: Fortitude is said to resist head daze, but the daze rule and `ApplyDaze` use only joules. Perception is said to govern hearing faint sounds and blood trails, but Movement.md gives player hearing of other bodies no range, the tech guide drives footstep sound from animation, and the player's blood tracking has no stat rule.
- Conflicts with: Player.md "How far a character hears faint sounds and how readily they pick out tracks, blood trails, and hidden things"
- Suggest: Add Fortitude as a daze-duration scale in Health-and-wounds, and give Perception a hearing-range multiplier for gait noise and a blood-trail visibility range.

**MV18. Climb cost and reach disagree with the spec by a little** (Low, reported)
- File: [Movement (Technical).md](<Movement (Technical).md>) section 6.1; [Movement.md](Movement.md) "Vaulting and Mantling"
- Quote: "a seventh for one at the full standing reach of the arms"
- Problem: The spec puts a seventh at the full reach, about 2,2 m for a 1,80 m person. The tech cost line puts a seventh at 200 cm, rising beyond it to about 16 per cent at the 218 cm reach. The spec says "about two metres and a fifth" and a ledge "a little above two metres can still be caught on the jump"; the tech guide uses 2,18 m with no jump bonus and its validation case treats 2,20 m as out of reach.
- Conflicts with: Movement (Technical).md `CostFullReachHeightCm = 200.f` and validation case "2,20-metre one ... out of reach"
- Suggest: Set the full-reach cost point at the reach height, and give the jump a bonus that makes the 2,20 m case match the spec's wording.

**MV19. Parry angle and thrust have no input** (Low, reported)
- File: [Melee-combat (Technical).md](<Melee-combat (Technical).md>) sections 4.1 and 8; [Melee-combat.md](Melee-combat.md) "Directing a Strike"
- Quote: "a separate input gives a thrust"
- Problem: `FActionInput` carries only the two buttons and the hotbar, so the thrust has no input path (the arc is picked from the mouse gesture). A parry is "angled across the incoming blow", but the guard has no direction input beyond the held secondary button.
- Conflicts with: Actions.md "The secondary button, the right mouse button, raises the guard"
- Suggest: Add a thrust input (a modifier or third button) to `FActionInput` and say the guard's angle comes from the view direction at the moment of contact.

**MV21. Unverified Unreal Engine claims** (Low, reported)
- File: [Movement (Technical).md](<Movement (Technical).md>) "Research Baseline", sections 4.2, 8
- Quote: "in Unreal Engine 5.8 the control rotation stored in a saved move is overwritten with the live view after every replay"
- Problem: Not checked, marked as unverified claim: that behaviour of the saved move's control rotation; that `APawn::RemoteViewPitch` is deprecated in 5.6 for a 16-bit `GetRemoteViewPitch()`; that `NavMovementProperties.bUseAccelerationForPaths` is the "5.5 replacement" of the deprecated property; and the guides' statement that all hooks were "checked against the 5.8 engine headers on 18 October 2026". The reported test figures (2,4 corrections per caught blow, 0,39 s ready) are given without a visible method.
- Suggest: Cite the header or release note beside each, or mark the figures as prototype observations.

Strong work in this area:

- Movement (Technical).md: every validation case is checkable, and the stated arithmetic (vault 0,65 and 0,90 s, mantle 7,3 and 12,0 points, sprint radius 5 m, stopping distances) all comes out.
- Melee-combat (Technical).md: the layered-armour "no cliff" rule with the 120 versus 121 joule example and a monotonicity test is a sharp, buildable fix.
- Health-and-wounds.md: attribution of bleed and fall deaths to the last untreated wounder closes the "flee and die" full-loot escape cleanly and ties to the bounty rule.

### Taming, riding and flight

**TF5. An anchored leviathan with a heavy deck can drain its reserve while the keeper is away** (Medium, reported)
- File: [Flight (Technical).md](<Flight (Technical).md>), sections 11.2 and 11.4; [Flight.md](Flight.md), "Mana-Borne Flight"
- Quote: "every tonne aboard, every second it flies" (drain term) versus "circles the point while its reserve refills"
- Problem: Deck mass drains continuously and the anchor refill is `BaseRefill + LeylineIntensity * LeylineRefill`. Nothing states that refill exceeds a laden deck's drain. If it does not, the reserve empties during a week away, the leviathan "sinks to a low drift height above terrain", and a base meant to be reachable only from the air can be walked into. The away-time catch-up for the reserve is also not given (only the bond's catch-up is).
- Conflicts with: Flight.md: "A drained leviathan cannot surge or climb and sinks to a low, labouring drift".
- Suggest: set an anchored leviathan's drift height floor (it holds its altitude while anchored, paid from a separate anchor upkeep), or make deck mass above a threshold cause a slip. Add the closed-form reserve catch-up.

**TF6. A hired horse can never bolt, though the spec says it bolts at the first serious fright** (Medium, confirmed)
- File: [Creature-riding (Technical).md](<Creature-riding (Technical).md>), sections 6.1 and 10; [Taming-and-control (Technical).md](<Taming-and-control (Technical).md>), section 2.1
- Quote: "Above the bolt threshold, a mount whose bond band is weak takes the bolt override."
- Problem: A Stable bond has fixed strength `StableBondStrength = 0.6f`, above `Hesitant = 0.55f`, so the band is never weak. Section 10 says the timid temperament lowers "its bolt threshold", but the bolt rule is gated on the band, so it never fires.
- Conflicts with: Creature-riding.md, "Hired Horses": "balking sooner than a well-bonded mount and bolting at the first serious fright".
- Suggest: gate bolting on temperament as well as band, or set the default stable strength below `Hesitant`.

**TF7. Dive strikes cannot reach a ground target and need a saddle flyers cannot wear** (Medium, reported)
- File: [Flight (Technical).md](<Flight (Technical).md>), sections 5.3 and 12; [Creature-riding (Technical).md](<Creature-riding (Technical).md>), sections 7.1 and 8.2
- Quote: "The margin never reaches 1, so no flyer flies a dive into the ground whatever its rider asks."
- Problem: The instinctive pull-out begins at the height a pull-out needs times a margin above 1 (about 120 m at the default 60 m/s and 2,5 g, from the guide's own formula), so the flight bottoms out above the ground and a strike "at impact" on a ground target cannot occur. Separately, a dive strike "resolves as a charge", and a charge needs `bAllowsCharge`, "which means an armour saddle", yet a flyer's one saddle slot holds the flight saddle.
- Conflicts with: Flight.md, "Diving": "hits a target on the ground or in the air with the force of a lance charge".
- Suggest: define a strike reach and let a target-locked dive hold the margin lower; give the flight saddle `bAllowsCharge` for the dive hook only, or say strikes do not use the charge path.

**TF8. A weaponised carriage's armoured team cannot exist under the one-saddle-slot rule** (Medium, reported)
- File: [Saddles-and-carriages.md](Saddles-and-carriages.md), "Carriages"; [Creature-riding (Technical).md](<Creature-riding (Technical).md>), sections 7.1 and 7.4
- Quote: "drawn by a team wearing armour of its own" (spec); "so a mount wears one kind of saddle at a time" (guide)
- Problem: A harnessed animal has the draught harness in its saddle slot, so it cannot also wear armour-saddle barding. `UCarriageDefinition` only has `BodyArmour` for the body. Launch defers this carriage, but both documents describe it as finished.
- Suggest: give the draught harness its own `Tier` and protection profile, or move team barding to a third slot.

**TF9. Growth stages are missing from the data model for raised dragons and leviathan calves** (Medium, reported)
- File: [Flight (Technical).md](<Flight (Technical).md>), section 2.1; [Taming-and-control (Technical).md](<Taming-and-control (Technical).md>), section 2.1; [Creatures/Highland-dragon.md](Creatures/Highland-dragon.md), "Eggs and Raising"
- Quote: "while it stays near that size it can still make a standing launch from a courtyard" (Highland Dragon)
- Problem: `NativeLaunch`, `EmptyMassKg`, `MaxTakeoffMassKg`, `RestClearance`, comfort band and `StrengthKg` are single per-species values. The Highland Dragon changes from standing to run-up launch, grows from 15 m to 40 m, and its shelter and climate need change after fledging. A leviathan calf cannot leave the islands and cannot be "anchored" or stabled as written, so its bond during months of raising is undefined.
- Conflicts with: Creatures/Flying-leviathan.md, "Young and Adult"; Flight (Technical).md section 5.5 (Held only for an anchored adult).
- Suggest: a growth-stage table on the species asset (size, mass, launch type, needs per stage) and a rule for how a calf is kept while its keeper is offline.

**TF11. The guide contradicts itself on whether wild creatures are persistent individuals** (Medium, reported)
- File: [Taming-and-control (Technical).md](<Taming-and-control (Technical).md>), sections 2.2, 3.3 and 8.1
- Quote: "as every wild creature is a persistent individual under Populations and Spawning" versus "Wild creatures are not, until a handler starts taming one"
- Problem: Section 3.3 relies on a stored `BornAt` for the parental window "the same for every finder", while 8.1 keeps herds as Mass entities with no record until the first care act, and the record comment says found young store "their estimated birth time". If birth time is estimated at promotion, the window is not fixed and can be gamed or re-rolled.
- Suggest: store a deterministic `BornAt` in the Mass entity (or derive it from spawn time), and say so in both sections.

**TF14. Carriage terrain rules differ between spec and guide, and "several times" is unquantified** (Medium, reported)
- File: [Saddles-and-carriages.md](Saddles-and-carriages.md), "Roads, Terrain, and Bridges"; [Creature-riding (Technical).md](<Creature-riding (Technical).md>), section 7.4
- Quote: "mud, deep snow, and bog bring it to a stop" and "Scree, rock, and broken ground are closed to it" (spec); "movement is forbidden on bog, deep snow, scree" (guide)
- Problem: Mud, rock and broken ground are closed in the spec and absent from the guide's forbidden list; fords and "deep water refused" have no carriage rule in the guide. The load multiplier is "several times 1 on road and firm grass" with no value, so the carriage's capacity advantage cannot be judged or tested.
- Suggest: list the forbidden surface types identically in both, add fords, and give a reference road factor.

**TF15. A buffalo's goods saddle outcarries a carriage and ignores the road restriction** (Medium, reported)
- File: [Saddles-and-carriages.md](Saddles-and-carriages.md), "Goods Saddles" and "Carriages"
- Quote: "the goods saddle of a Large Buffalo holds a cartload and more"
- Problem: The storage carriage is said to carry "far more than any saddle", and its confinement to roads is what keeps it from erasing distance. If a pack buffalo already carries more than a cartload anywhere, the carriage's advantage and its road cost both disappear.
- Conflicts with: Saddles-and-carriages.md: "It carries far more than any saddle".
- Suggest: cap the buffalo's load below a one-horse cart, or restate the carriage's edge as per-team volume.

**TF17. Egg ownership is described two ways and a bystander can take a hatchling** (Medium, reported)
- File: [Taming-and-control (Technical).md](<Taming-and-control (Technical).md>), section 3.3
- Quote: "`KeeperId` is the character who last placed or tended it, and it receives the parental bond"
- Problem: The same section says the egg "becomes a creature bonded to whoever hatches it". Under the KeeperId rule, anyone who tends the egg shortly before hatching takes the bond from the player who raised it, at no cost.
- Suggest: bond to the tender with the most accumulated care, or the holder at hatching, and say which.

**TF19. Hire timing uses world time while bonds use real time** (Low, reported)
- File: [Creature-riding (Technical).md](<Creature-riding (Technical).md>), section 10; [Taming-and-control (Technical).md](<Taming-and-control (Technical).md>), section 2.2
- Quote: "A reference grace period of 24 hours of world time" versus "Clocks are server UTC seconds rather than in-game time"
- Problem: Hire fees and the grace period run on world time, derived from the cluster clock at an unstated in-game day length, so "24 hours" may be a few real hours.
- Suggest: state the clock, preferably real seconds as in the taming guide.

**TF20. Breeding and egg-warmth rules are stricter or looser in the guide than the spec** (Low, reported)
- File: [Taming-and-control.md](Taming-and-control.md), "Parental Bonding"; [Taming-and-control (Technical).md](<Taming-and-control (Technical).md>), section 3.3
- Quote: "their rest points share one enclosed space"
- Problem: The spec requires only a shelter meeting four needs (a lean-to counts); the guide requires an enclosed space. For eggs the spec requires "a hearth or brazier in the same space", while the guide accepts any effective temperature at or above `EggWarmthCelsius`, so a warm climate incubates without one.
- Suggest: align both on one wording.

**TF21. No rule for selling, gifting, lending or sharing a creature** (Low, reported)
- File: [Taming-and-control.md](Taming-and-control.md); [Creature-riding (Technical).md](<Creature-riding (Technical).md>), section 3.2
- Quote: "the owner, or the current hirer of a hired horse"
- Problem: Only the owner can ride. Teams of mixed owners, a friend riding double, a guild mount and trading a tamed beast are undefined, yet a caravan economy needs at least a transfer rule and a mixed-team rule.
- Suggest: state whether bonds are non-transferable, what a guild may share, and how a mixed-owner team works.

**TF22. Settings called server-overridable are not in Server-settings.md** (Low, reported)
- File: [Flight (Technical).md](<Flight (Technical).md>), section 8.1; [Taming-and-control.md](Taming-and-control.md), "Parental Bonding"
- Quote: "an override per server through [Server Settings]"
- Problem: Server-settings.md has no entry for the thin-air altitude, the gestation, incubation and weaning defaults, the offline floor or the tame budget.
- Suggest: add a short creatures and flight settings list.

**TF23. Unreal Engine claims to verify (not researched)** (Low, reported)
- File: [Taming-and-control (Technical).md](<Taming-and-control (Technical).md>) sections 2.1, 7.1, 7.5, 7.6; [Creature-riding (Technical).md](<Creature-riding (Technical).md>) section 4.1; [Flight (Technical).md](<Flight (Technical).md>) section 3
- Quote: "The AI Perception component works on a pawn as on a controller"
- Problem: Unverified claim: AI Perception on a pawn; by-name overrides cannot address map entries in 5.8; pawns without preferred navigation data use only matching fly-setting data; a dedicated server does not refresh bone transforms of unrendered meshes; Enhanced Input priority behaviour; `PhysCustom` and `SetNetworkMoveDataContainer` usage. The measured figures (nav build 20 to 112 s, 1182 stimuli, 0,2 to 0,3 s notice time) carry no source.
- Suggest: check each against the 5.8 docs and tag the measurements as prototype results.

**TF24. Carriage body wear and repair are missing from the guide** (Low, reported)
- File: [Saddles-and-carriages.md](Saddles-and-carriages.md), "Making and Mending"; [Creature-riding (Technical).md](<Creature-riding (Technical).md>), section 7.4
- Quote: "a carriage left standing in the open weathers faster than one kept under a roof"
- Problem: `UCarriageDefinition` has no durability, weathering or repair fields; the guide lists durability only for tack.
- Suggest: add `MaxDurability` and an exposure factor.

Strong work in this area:

- Taming-and-control (Technical).md: the closed-form settle with elapsed-time catch-up and its validation cases make absence deterministic and testable.
- Flight.md: the dive-to-glide section turns flight cost into a readable skill with the pull-out failure modes spelled out.
- Saddles-and-carriages.md: the price-of-cargo accounting and "A Wagon at the Ford" vignette make every haul a risk against a reward.

## Resolved or rejected since the reviews ran

- The whole-document read found that reputation was named as the restraint on player killing while being the least specified system. This was settled on 11 November 2026: reputation is standing with NPC factions only, moved by witnessed acts toward their people, and players answer one another with bounties.
- SV3, CR2 and TF18 reported passages that still described the old reputation model in the server documents, the Flying Leviathan entry and the hired-horse rule. They were rewritten on 11 November 2026.
- CR3 reported "one Kraken per region" as a contradiction with the one-square-kilometre server region. It is rejected: the [Glossary](Glossary.md) defines that second, gameplay sense of "region". What remains open is the size of a singleton creature's territory and how a killed one is replaced.

## Settled in the design session of 11 November 2026

These findings were decided with the design's author and written into the documents the same day. Each line gives the decision.

- **Release and world (W2, SV2, SV7, BS1, BS3 in part, CR9, TF10).** There is no hard launch: closed tests, then early access in waves, with wipes that reset world and characters until a declared day begins the persistent world. The world is one map of about 80 by 80 kilometres per cluster, opened area by area, with unfinished ground closed. Until multi-server handoff holds, each map runs on one server under a cap, with no time dilation. The Ancient Forest joins the first release in place of the Tundra, and the Red Deer, the Horse and the Treant join the first-release species.
- **Money (decided alongside).** The subscription is the only thing ever sold. There is no store of any kind, and early access costs a reduced price.
- **Offline raids (W3).** They stay fully open with no timers. A piece has health, repair restores a set amount per action, and only the piece being struck cannot be repaired.
- **Veteran edge (W4) and Item Box (W5).** Both stay as written by decision. A later brake on veterans, or periodic wipes, is parked in the design backlog.
- **Dungeons (W8).** Great dungeons have several thresholds, and a dungeon sends the creatures of the surrounding country at anyone who lingers at its doors.
- **Doors (BD2).** Inside a claim, doors, gates, hatches, shutters and containers open only for those with access. There are no locks or keys.
- **Lured creatures (CR6) and siege magic (BS6).** Luring a creature at a base is intended siege play with stated rules. Casting draws down the mana level of the ground, and the two siege spells consume a charged mana crystal per cast.
- **Magic (BS4, BS5, BS7, BS8, BS9).** A new Mana Recovery stat; every spell file states how it is cast; foundation spells have no cooldown and an advanced spell may carry a recovery period; advanced spells state what unlocks them.
- **Combat (MV1, MV6, MV7, MV20, CR1).** Blocking follows the physical model. A knockdown lasts about two seconds and still allows a guard. Under lag the attacker's view decides the hit and the defender's own screen decides the guard. Perception resists charm and glamour.
- **Taming and mounts (TF1, TF2, TF3, TF4, TF12, TF13, TF16, CR4).** Shelter does not hold a slave bond, and a coerced creature can be chained or penned. An owned creature can be won away only when neglected, in two stages. A Royal Dragon mount comes only from an egg. A panicking mount sheds its packs along its flight, by its kind and its steadiness. There is no count on tamed creatures, bonds of an owner absent for eight weeks release, and a confined creature can starve. A wing-rig descends at a constant angle and costs stamina. A Sandworm casts up a swallowed player's corpse.
- **Voice and consistency (W12 in part, BS2, BS13, BS14, CR10, CR13, CR14, CR18, AR20).** Combat Skills, Thunder, Nature Growth, Dungeons, the race files, eleven creature story hooks and several single sentences were rewritten. The README pillars are still in the older voice.

## Resolving a finding

Fix the design, then delete the finding from this file; the git history is the record. Check a finding marked "reported" against the file before acting on it. Re-run the review to refresh the list.
