# Templates for new design documents

Copy the relevant block and keep its headings, then replace the bracketed guidance with finished prose
in the repository's voice. The house style these templates assume — systems-design voice, prose over
bullets, metric units with comma decimals, no emojis, relative cross-links — is defined in
[AGENTS.md](../../../../AGENTS.md). Every design file closes with a Continue
Reading or related-links section and then the Draft appendix; adjust the section headings to match the
files that already live alongside the one you are creating.

Contents:

- [System or hub document](#system-or-hub-document) — top-level files such as a new mechanic or domain
- [Creature](#creature) — a bestiary entry under `Creatures/`
- [Biome](#biome) — a region file under `Biomes/`
- [Spell](#spell) — an entry under `Magic/Spells/<Element>/`
- [Race](#race) — a playable race under `Races/`
- [Structure or settlement](#structure-or-settlement) — a settlement or structure file under `Structures/`
- [Skill](#skill) — a skill file under `Skills/<Family>/`

## System or hub document

A top-level file at the repository root (for example a new system, or a hub that fans out to detail
files). Add it to the index in `README.md` in the same change.

```markdown
# <Title>

<Opening paragraph: what this system is and why it matters, and how it connects to the rest of the game.>

## <Themed section>

<Develop the idea in prose, from the general to the specific.>

## <Themed section>

<Continue. A hub document can carry a short linked list of the detail files it owns.>

## Continue Reading

Continue with [<Doc>](<path>.md), [<Doc>](<path>.md), and [<Doc>](<path>.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```

## Creature

A bestiary entry living under `Creatures/`. Reach top-level files with `../`. Creature files carry a
`Story Hook` section before the backlink. Add the reciprocal link from each biome this creature inhabits
back to this file, and list the creature on the [Creatures](../../../../Creatures.md) index. When concept
art exists, place it in its own `## Concept Drawing` section after the `See also:` backlink and before
the `## Draft` appendix, matching the existing creature files. When the creature was inspired by a
creature from another work, add a short `## Inspiration` section after `## Concept Drawing`: the source
with a link, which traits were borrowed, and what differs here. It exists so artists and image
generators can find the reference; keep it when restructuring the file.

State the physical facts concretely, because artists, 3D modellers, animators, and image generators
work from them: metric size (comma decimals), limb count and where limbs attach, posture and how it
moves, and colour zones. For a flying creature, also state its launch type — standing, run-up, or
drop, as defined in [Flight](../../../../Flight.md#taking-off-and-landing) — or that it is mana-borne. For a
tameable creature, state its shelter needs: the climate it requires and the space its body takes, as
used by [Shelter for Creatures](../../../../Building-system.md#shelter-for-creatures). Describe encounters by what the creature does, the tell before its attacks,
how players counter it, and what it drops, without stat numbers. When a species has several distinct
sizes or forms (such as Treant Sapling, Guardian, and Elder), keep the species file as a hub for what
they share and give each form its own file.

```markdown
# <Creature Name>

<Opening: what the creature is, its size and body plan, how it behaves, and the role it plays in its region's ecology and encounters.>

## Appearance and Visual Design

<Silhouette, limbs and posture, how it moves, colour zones, materials, and distinguishing details.>

## <Behaviour, ecology, or combat section as fits>

<Develop its behaviour and how it reads in play: attacks and their tells, counterplay, and rewards, framed in terms of gameplay rationale.>

## Story Hook

<A short encounter or player-facing vignette showing the creature in play.>

See also: [Creatures index](../Creatures.md), and the biome it inhabits, [<Biome>](../Biomes/<Biome>.md).

## Concept Drawing

![<Creature Name> bestiary entry](../Assets/Creatures/Bestiary/<creature-slug>-bestiary.png)

## Inspiration

<Only when a source exists: name it with a link, say which traits were borrowed and what differs in this game.>

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```

## Biome

A region file living flat under `Biomes/`. Reach top-level files and other subfolders with `../`. List
the biome's fauna and link each creature, and ensure each of those creatures links back to this biome.

```markdown
# <Biome Name>

<Opening: what the biome is, the tone it strikes, and the travel problem it poses to a player.>

## Terrain and Atmosphere

<The look and feel of the place, and how it differs from neighbouring biomes.>

## Resources

<What the biome offers a gatherer or crafter.>

## Creatures

<The fauna, each linked, e.g. [<Creature>](../Creatures/<Creature>.md), with the reciprocal link back.>

## Hazards and Travel

<What threatens or slows a traveller here, and how players adapt.>

## Settlement Patterns

<How and where settlements take hold, if at all.>

## Continue Reading

Continue with [<Doc>](../<path>.md) and [<Doc>](../<path>.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```

## Spell

An entry living under `Magic/Spells/<Element>/`. Reach the top-level [Magic](../../../../Magic.md) index with
`../../../`, and other elements' spells with `../<Element>/<Spell>.md`. Add the new spell to the spell
index in `Magic.md`.

```markdown
# <Spell Name>

<Opening: what the spell does and its place within its element, and the feel it should have in play.>

## Gameplay Role

<When and against what the spell is used, and the counterplay it should allow.>

## Upgrade Directions

<The shapes the spell can grow into as it levels, each a build choice rather than a flat increase.>

## Trade-Offs

<What greater power costs — mana, cast time, cooldown, noise, or environmental reliability.>

## Continue Reading

See also: [Magic](../../../Magic.md) and [<Related Spell>](../<Element>/<Spell>.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```

## Race

A playable race living flat under `Races/`, modelled on [Human](../../../../Races/Human.md),
[Elf](../../../../Races/Elf.md), and [Dwarf](../../../../Races/Dwarf.md). Reach top-level files and other
subfolders with `../`. Add the race to the [Races](../../../../Races.md) index, and give it a settlement file
under `Structures/` (see the next template) that links back. Races are defined by how they are played and
by their culture; creatures and systems never treat a player differently because of the race chosen.

```markdown
# <Race Name>

<Opening: who the people are, what they begin with and what sets them apart, and the frontier role they play in the world.>

## Strengths and Playstyle

<Natural attribute and skill leanings, linked to [Player Progression](../Player.md) and [Skills](../Skills.md); the weakness that is the other side of the same coin; the kind of player the race suits.>

## <Themed cultural section>

<One section that develops what the race is known for, named for its theme (for example "Closeness to Magic", "Masters of the Forge", "A Culture of Adaptation"). Show how the culture shapes the settlements and ties into a wider system such as the economy or magic.>

## Homeland and Start

<Where a new character begins, the early tasks that teach the race's strengths, the biome the race calls home, and how a player can still play against type.>

## Continue Reading

See also: [Races](../Races.md), [Player Progression](../Player.md), [<Race> Settlements](../Structures/<Race>-settlements.md), and the [<Home Biome>](../Biomes/<Biome>.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```

## Structure or settlement

A settlement or structure file living under `Structures/`, modelled on
[Dwarven Settlements](../../../../Structures/Dwarven-settlements.md),
[Elven Settlements](../../../../Structures/Elven-settlements.md), and
[Human Settlements](../../../../Structures/Human-settlements.md). Reach top-level files with `../` and
sibling structure files directly. Add the file to the [Structures](../../../../Structures.md) index. Keep the
settlement archetypal, described by role and form, with no invented place names and no fixed layouts,
as the naming guidance in [AGENTS.md](../../../../AGENTS.md) requires.

The sibling files above still carry some drafting voice, with sentences such as "should communicate" and
"can teach". New and revised files do not copy that: write finished prose that states what the
settlement is and how it plays, as the other templates do. The role section is named for what the
settlement does (a forge economy, a quest and trade role, a scale) and the `Starting Experience` section
belongs only to race settlements.

```markdown
# <Name> Settlements

<Opening: what the settlements look like and where they stand, and the culture and values their form expresses.>

## Architecture

<Entrances, materials, interiors, and silhouette; how the place reads on approach and from inside. Use "Settlement Scale" instead when the story is the difference between a great city and a small village.>

## <Role section>

<What the settlement does for the world: its economy, quests, crafting opportunities, or travel function, and the reasons other players come to visit.>

## Starting Experience

<Race settlements only. Where a new character of this race begins, what the surroundings look like, and the early tasks that teach the race's playstyle.>

## Continue Reading

See also: [<Race>](../Races/<Race>.md), [Structures index](../Structures.md), [<Home Biome>](../Biomes/<Biome>.md), and [Building System](../Building-system.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```

## Skill

A skill file living under `Skills/<Family>/`, modelled on
[Cartography](../../../../Skills/Artisan/Cartography.md). Files sit two levels below the root, so reach
top-level documents with `../../` and the [Skills](../../../../Skills.md) overview with `../../Skills.md`.
List the skill on the Skills overview in the same change.

```markdown
# <Skill Name>

<Opening: what the skill is, how this world treats it differently from the usual game version, and the place it gives the player who invests in it.>

## How <the Skill> Grows

<What each rank adds, from the lowest level to the highest, in terms of what the player can now do or produce.>

## Levelling the Skill

<What earns experience and what does not, and why the loop rewards the activity the skill is about rather than grinding in place.>

## <The Skill> and the Player Economy

<What the skill produces, how it is traded through [Economy and Trade](../../Economy.md), and how it ties into other skills and systems.>

## The <Practitioner's> Role

<The social and economic niche of the player who commits to the skill, with a short vignette of it in play.>

## Continue Reading

See also: [Skills overview](../../Skills.md), [<Related system>](../../<Doc>.md), and [<Related system>](../../<Doc>.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```
