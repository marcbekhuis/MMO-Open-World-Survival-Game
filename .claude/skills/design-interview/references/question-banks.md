# Question banks for design interviews

One bank per subject type. Each is a menu, not a checklist: pick only the areas the existing
material leaves open, and skip anything the repository already answers. Phrase every question with
two to four concrete options and a recommendation, per the skill's rules. Measurements in the
options follow house style — metric, with a comma as the decimal separator.

Contents: [Creature](#creature) · [Biome](#biome) · [Spell](#spell) · [System](#system) ·
[Race](#race) · [Structure or settlement](#structure-or-settlement)

## Creature

**Identity and role.** What encounter problem does it pose — ambush predator, territorial hazard,
pack hunter, siege-scale threat, prey animal, dungeon guardian? What is the one-line fantasy of
meeting it? What tier of player should it threaten, and does it stay dangerous at higher levels or
fade into background fauna?

**Appearance and silhouette.** How large is it, in metres and kilograms? Is its silhouette readable
at a distance, or is being hard to read the point (camouflage, mimicry, burrowing)? What colouration
and texture, and how do they tie to its biome? What visual or audio tell communicates its state —
idle, alerted, enraged, wounded? What does a player hear before they see it?

**Behaviour and temperament.** Aggressive on sight, territorial, defensive, or skittish? Day-active,
night-active, or driven by [weather and seasons](../../../Weather-time-and-seasons.md)? Solitary,
paired, or pack-living — and if a pack, what structure and what happens when the leader dies? How
does it react to fire, light, noise, and thrown food? How does it disengage — flee, burrow, climb,
call for help?

**Ecology.** Which biome or biomes does it inhabit (each needs the reciprocal biome↔creature link)?
What does it prey on and what preys on it, among creatures that already exist? What visible mark
does it leave on the land that a player can learn to read — tracks, kills, dens, cleared
vegetation? Does its behaviour shift with the seasons?

**Combat shape.** What is its opening move, and what loop does the fight settle into? Which player
skill does it actually test — awareness, positioning, timing, resource management? What mistake
does it punish hardest? How does the fight change between a solo player and a group? Does it have a
desperation or enrage behaviour near death?

**Rewards and economy.** What does it yield when harvested, and which [crafting](../../../Crafting.md)
recipes or [economy](../../../Economy.md) niches want those materials? Is there a rare drop or
trophy worth hunting it specifically for?

**Taming and control.** Is it tameable or mountable under [Taming and control](../../../Taming-and-control.md)?
If so, what does a tamed one offer that justifies the effort, and how is it captured?

**Story presence.** What rumour do NPCs tell about it? What scar has it left on its region? What is
the seed of its Story Hook — the required section of every creature file?

## Biome

**Identity and tone.** What feeling should the biome strike on arrival — dread, wonder, oppressive
heat, hush? What one image defines it? How does it differ from its nearest neighbour in tone, not
just terrain?

**Terrain and climate.** What is the ground actually like to cross — elevation, footing, sightlines,
water? What climate band, and how do [weather, time, and seasons](../../../Weather-time-and-seasons.md)
change it?

**The travel problem.** Every biome poses one: what slows, threatens, or disorients a traveller
here, and what preparation or knowledge overcomes it?

**Resources.** What does it offer a gatherer or crafter that other biomes do not, and at what risk?

**Fauna.** Which existing creatures live here (each linked both ways), and is there a niche that
wants a new creature with its own file?

**Hazards.** What kills the unprepared — and does the danger change between day and night, or by
season?

**Settlement patterns.** Do people settle here, and how — permanent towns, seasonal camps, none at
all? Follow the naming rule: archetypes, no proper nouns.

**Adjacency.** What biomes border it, and what does the transition look like on the ground?

## Spell

**Element and fantasy.** Which element's folder does it belong to, and what is the moment of casting
it supposed to feel like?

**Gameplay role.** When does a player reach for it — against what enemy, in what situation — and
what would they use instead if they lacked it?

**Counterplay.** What can an opponent, monster or player, do about it? A spell without counterplay
is a balance problem written in advance.

**Upgrade directions.** What shapes can it grow into as it levels — each a build choice with a
distinct identity, not a flat number increase?

**Trade-offs.** What does its power cost — mana, cast time, cooldown, noise that draws attention,
reliance on the environment?

**Acquisition.** How is it learned or found, and how rare should it be?

## System

**The player problem.** What does the player want that this system provides, and what happens in
its absence? A system that solves no felt problem is scope without payoff.

**Core loop.** What does the player actually do, minute to minute, when engaging with it?

**Touchpoints.** Which existing systems does it feed or draw from — name the files, because each
touchpoint is a pair of cross-links and a consistency obligation.

**Depth versus onboarding.** What is the simplest satisfying interaction a new player has with it,
and where is the ceiling for a veteran?

**Failure and recovery.** How does a player fail at it, what does failure cost, and how do they
climb back?

**Progression.** What changes about the system between the first hour and the five-hundredth?

**Multiplayer weight.** Does it run per-player, or does it touch the shared world and the
[server architecture](../../../Server-architecture.md)?

## Race

**Fantasy and silhouette.** What archetype does it deliver, and how is it recognisable at a
distance? Typical heights and builds, in metres.

**Physiology.** Lifespan, diet, senses, resilience — anything that turns into a mechanic or a
survival difference.

**Temperament and culture.** The archetypal disposition and way of living, kept generic per the
naming rules — no named nations or capitals.

**Mechanical identity.** What does playing this race change — starting biases, aptitudes,
[skill](../../../Skills.md) affinities — without becoming a strict best-choice?

**Relations.** How does it regard the other playable races, and where does friction show up in
play?

## Structure or settlement

**Role and archetype.** What is it for, described by role rather than proper noun — a forge-capital,
a river outpost, a ruin? Who builds or inhabits it?

**Layout logic.** What organising idea shapes it — defence, trade, faith, geology — and what does a
player notice first on approach?

**Player interaction.** What does a player do here — services, quests, shelter, conquest — and what
makes it worth returning to?

**Threats.** What endangers it, and does that danger create play — sieges, raids, creature
incursions per [Conflict and PvP](../../../Conflict-and-pvp.md)?
