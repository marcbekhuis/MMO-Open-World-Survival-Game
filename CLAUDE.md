# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This repository is a living game-design document for a large-scale, persistent open-world survival RPG built on Unreal Engine 5. It contains only Markdown — there is no source code, build system, linter, or test suite, so working here means writing, expanding, and cross-linking design notes rather than running commands. The starting point for any orientation is [README.md](README.md), the canonical index that links out to every top-level system document; when you add a new system doc, add it to that index.

## Document structure (hub-and-spoke)

Content follows a hub-and-spoke shape: a top-level index file introduces each domain and links out to the detail files that live in a matching subfolder. [Creatures.md](Creatures.md) fans out to individual bestiary entries under `Creatures/` such as [Wolf](Creatures/Wolf.md), [Kraken](Creatures/Kraken.md), and [Treant](Creatures/Treant.md); [Structures.md](Structures.md) gathers the settlements and dungeons under `Structures/`; [Magic.md](Magic.md) organizes spells by element under `Magic/Spells/<Element>/`; and [Skills.md](Skills.md) covers the files under `Skills/` and `Skills/Artisan/`. Biomes are the one departure from the pattern, living flat under `Biomes/` with [README.md](README.md) pointing at [Ancient-forest.md](Biomes/Ancient-forest.md) as the section's entry point.

## Two server-architecture documents (keep distinct)

The server design is split across two documents that must not be conflated. [Server-architecture.md](Server-architecture.md) is the conceptual design spec — prose describing the cluster model of 1 km² regions, the division of labour between the Master Server and the Cluster Unit Servers, visibility-driven synchronization, and seamless region handoff, with no code. Its companion, [Server-architecture (Technical).md](<Server-architecture (Technical).md>), is the Unreal Engine 5 implementation guide that realizes the spec in concrete C++, INI, YAML, and Dockerfile snippets covering World Partition, the Replication Graph, the ghost-entity protocol, and orchestration through GameLift or Kubernetes. The technical document is meant to track the spec, so whenever a concept in the spec changes — region size or synchronization rules, for instance — update the corresponding section of the technical guide to keep the two consistent.

## Cross-linking conventions

The link structure between files is load-bearing and should be preserved whenever you add or move content. Every detail file links back to its index with a closing line such as `See also: [Creatures index](../Creatures.md)`, and every index links outward to each detail file it owns. Cross-references between domains are bidirectional: a biome lists its fauna and links to each creature file (for example `[Treant](../Creatures/Treant.md)`), and the reciprocal link from creature back to biome is expected in turn. Always use relative paths, with detail files in subfolders reaching top-level docs through `../`.

## Placeholder / TODO convention

Incomplete sections are marked with HTML comments that usually include a concrete example of the input being requested:

```html
<!-- TODO: Add list of canonical capital city names... Suggested input: provide 3 capital names and one unique landmark each. -->
```

When you fill one in, replace the entire TODO comment with the finished content. When you add a new stub, follow the same format — state what is needed and give a "Suggested input:" example — rather than leaving a bare `TODO`.

## Writing style

Prose is the default. Write in a professional, systems-design voice with complete sentences and connected paragraphs, the same register found throughout [Server-architecture.md](Server-architecture.md) and the creature and biome files. Reserve bullet points for genuine enumerations — discrete lists of features, hazards, or fauna — and prefer a sentence or short paragraph anywhere a bullet would merely restate a single idea. When a section starts to read as a stack of one-line bullets, fold it back into prose.

Whenever the text names another document in the repository, render that reference as a clickable relative link rather than plain text. A mention of the building system should read as [Building system](Building-system.md), a reference to a creature as [Treant](Creatures/Treant.md), and so on, so the web of documents stays navigable from any page.

When writing or confirming technical content — particularly anything in [Server-architecture (Technical).md](<Server-architecture (Technical).md>), such as Unreal Engine 5 APIs, console variables, plugin names, or third-party tooling — run a web search to verify the detail against current documentation before committing it. Cite authoritative sources such as Epic's developer documentation or the relevant vendor docs in the Further Reading list where appropriate, and prefer confirmed specifics over plausible-sounding placeholders.

## Conventions & gotchas

Several existing filenames carry typos or quirks that other files already link to, among them [Biomes/Bambo-jungle.md](Biomes/Bambo-jungle.md), [Structures/Elfen-settlements.md](Structures/Elfen-settlements.md), and [Dynamic-culling-and-render-cistance.md](Dynamic-culling-and-render-cistance.md). Match the existing spelling when you link to one of these, and never rename a file without updating every inbound link at the same time. Creature detail files follow a recognizable shape — opening behavior and role prose, then a `Story Hook` section, and finally the `See also:` backlink — which new creatures should mirror. In all cases, keep the prose in the systems-design voice of the surrounding document, framing decisions in terms of gameplay rationale.
