# Templates for new design documents

Copy the relevant block and keep its headings, then replace the bracketed guidance with finished prose
in the repository's voice. The house style these templates assume — systems-design voice, prose over
bullets, metric units with comma decimals, no emojis, relative cross-links — is defined in
[SHARED-INSTRUCTIONS.md](../../../../SHARED-INSTRUCTIONS.md). Every design file closes with a Continue
Reading or related-links section and then the Draft appendix; adjust the section headings to match the
files that already live alongside the one you are creating.

Contents:

- [System or hub document](#system-or-hub-document) — top-level files such as a new mechanic or domain
- [Creature](#creature) — a bestiary entry under `Creatures/`
- [Biome](#biome) — a region file under `Biomes/`
- [Spell](#spell) — an entry under `Magic/Spells/<Element>/`

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
back to this file, and list the creature on the [Creatures](../../../../Creatures.md) index.

```markdown
# <Creature Name>

<Opening: what the creature is, how it behaves, the role it plays in its region's ecology and encounters.>

## <Behaviour, ecology, or combat section as fits>

<Develop its behaviour and how it reads in play, framed in terms of gameplay rationale.>

## Story Hook

<A short encounter or player-facing vignette showing the creature in play.>

See also: [Creatures index](../Creatures.md), and the biome it inhabits, [<Biome>](../Biomes/<Biome>.md).

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
