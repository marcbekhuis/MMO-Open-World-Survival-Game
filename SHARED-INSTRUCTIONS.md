# Shared instructions

This file provides shared repository guidance for AI coding assistants working in this repository. Tool-specific entrypoints such as [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md) should reference this file instead of duplicating these instructions.

## What this repository is

This repository is a living game-design document for a large-scale, persistent open-world survival RPG built on Unreal Engine 5. It contains only Markdown — there is no source code, build system, linter, or test suite, so working here means writing, expanding, and cross-linking design notes rather than running commands. The starting point for any orientation is [README.md](README.md), the canonical index that links out to every top-level system document; when you add a new system doc, add it to that index.

## Scope and level of detail

These documents are a vision and design guide for a compelling large-scale game, not a production bible that pins down every name and number. The aim is to convey how a system should feel and why it works, so the writing can and should stay relatively generic: it does not need canonical proper names, and capital cities, NPCs, regions, factions, and items can be described by role and archetype rather than christened. Prefer an illustrative example such as "a dwarven forge-capital carved into a mountainside" over committing to a fixed roster like "the city of Khar-Drun." Existing concrete names are fine to keep, but new content should avoid manufacturing a rigid, named, step-by-step specification of exactly what the game must contain — favour the guiding idea over the exhaustive checklist.

## Document structure (hub-and-spoke)

Content follows a hub-and-spoke shape: a top-level index file introduces each domain and links out to the detail files that live in a matching subfolder. [Creatures.md](Creatures.md) fans out to individual bestiary entries under `Creatures/` such as [Wolf](Creatures/Wolf.md), [Kraken](Creatures/Kraken.md), and [Treant](Creatures/Treant.md); [Structures.md](Structures.md) gathers the settlements and dungeons under `Structures/`; [Magic.md](Magic.md) organizes spells by element under `Magic/Spells/<Element>/`; and [Skills.md](Skills.md) covers the files under `Skills/` and `Skills/Artisan/`. Biomes are the one departure from the pattern, living flat under `Biomes/` with [README.md](README.md) pointing at [Ancient-forest.md](Biomes/Ancient-forest.md) as the section's entry point.

When a concept grows large enough to deserve its own focused treatment, create a new Markdown file for it instead of burying it inside a broader document. Place new files in the most fitting existing folder, or create a new folder when the concept introduces a coherent new category. Add the new file to the appropriate index or hub document at the same time so it is discoverable from the repository's navigation structure.

## Two server-architecture documents (keep distinct)

The server design is split across two documents that must not be conflated. [Server-architecture.md](Server-architecture.md) is the conceptual design spec — prose describing the cluster model of 1 km² regions, the division of labour between the Master Server and the Cluster Unit Servers, visibility-driven synchronization, and seamless region handoff, with no code. Its companion, [Server-architecture (Technical).md](<Server-architecture (Technical).md>), is the Unreal Engine 5 implementation guide that realizes the spec in concrete C++, INI, YAML, and Dockerfile snippets covering World Partition, the Replication Graph, the ghost-entity protocol, and orchestration through GameLift or Kubernetes. The technical document is meant to track the spec, so whenever a concept in the spec changes — region size or synchronization rules, for instance — update the corresponding section of the technical guide to keep the two consistent.

## Cross-linking conventions

The link structure between files is load-bearing and should be preserved whenever you add or move content. Every Markdown file in the game-design document should end with a short related-links or continue-reading section that points to one or more different files the reader could open next. Detail files still link back to their index with a closing line such as `See also: [Creatures index](../Creatures.md)`, and every index links outward to each detail file it owns. Cross-references between domains are bidirectional: a biome lists its fauna and links to each creature file (for example `[Treant](../Creatures/Treant.md)`), and the reciprocal link from creature back to biome is expected in turn. Always use relative paths, with detail files in subfolders reaching top-level docs through `../`.

## Placeholder / TODO convention

Incomplete sections are marked with HTML comments that usually include a concrete example of the input being requested:

```html
<!-- TODO: Add list of canonical capital city names... Suggested input: provide 3 capital names and one unique landmark each. -->
```

When you fill one in, replace the entire TODO comment with the finished content. When you add a new stub, follow the same format — state what is needed and give a "Suggested input:" example — rather than leaving a bare `TODO`. Many TODOs solicit canonical names or counts; per *Scope and level of detail* above, treat those as invitations rather than requirements. A vivid, generic description that captures the intent is a complete answer, and inventing a binding canon of proper names is not expected.

## Writing style

Prose is the default. Write in a professional, systems-design voice with complete sentences and connected paragraphs, the same register found throughout [Server-architecture.md](Server-architecture.md) and the creature and biome files. Reserve bullet points for genuine enumerations — discrete lists of features, hazards, or fauna — and prefer a sentence or short paragraph anywhere a bullet would merely restate a single idea. When a section starts to read as a stack of one-line bullets, fold it back into prose.

When improving an existing file, you may expand on the ideas already present so long as the additions stay aligned with the document's purpose, tone, and established level of specificity. Add a small story, encounter, or player-facing vignette section wherever it fits the subject naturally, especially in creature files and other documents that benefit from showing how the idea appears in play.

Whenever the text names another document in the repository, render that reference as a clickable relative link rather than plain text. A mention of the building system should read as [Building system](Building-system.md), a reference to a creature as [Treant](Creatures/Treant.md), and so on, so the web of documents stays navigable from any page.

Measurements follow European and metric conventions. Use a comma as the decimal separator in prose (a goblin stands `1,40 meters` tall, not `1.40`), express distance in metric units (metres and kilometres), and give weight in kilograms. The one exception is fenced code: snippets in [Server-architecture (Technical).md](<Server-architecture (Technical).md>) keep their language-native formatting, so C++ float literals such as `150000.0f` and the comments beside them stay as written.

When writing or confirming technical content — particularly anything in [Server-architecture (Technical).md](<Server-architecture (Technical).md>), such as Unreal Engine 5 APIs, console variables, plugin names, or third-party tooling — run a web search to verify the detail against current documentation before committing it. Cite authoritative sources such as Epic's developer documentation or the relevant vendor docs in the Further Reading list where appropriate, and prefer confirmed specifics over plausible-sounding placeholders.

## Conventions & gotchas

Filenames and their inbound links must stay in lockstep: never rename a file without updating every inbound link in the same change, and always link to a file by its exact existing name rather than the name you expect it to have. When you do correct a misspelled filename, search the whole repository for references first — index files, biome and creature cross-links, and this document all point at each other by relative path. Creature detail files follow a recognizable shape — opening behavior and role prose, then a `Story Hook` section, and finally the `See also:` backlink — which new creatures should mirror. In all cases, keep the prose in the systems-design voice of the surrounding document, framing decisions in terms of gameplay rationale.
