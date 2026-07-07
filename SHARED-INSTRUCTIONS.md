# Shared instructions

This file provides shared repository guidance for any AI assistant working on this design document — Claude, ChatGPT/Codex, or similar. Tool-specific entrypoints such as [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md) reference this file instead of duplicating it, so a change here applies to every assistant at once.

## What this repository is

This repository is a living game-design document for a large-scale, persistent open-world survival RPG built on Unreal Engine 5. It contains only Markdown — there is no source code, build system, linter, or test suite, so working here means writing, expanding, restructuring, and cross-linking design notes rather than running commands. Start any orientation from [README.md](README.md), the canonical index that links out to every top-level system document; when you add a new system document, add it to that index.

## Work as a co-creator

Treat yourself as a co-creator of the design, not a transcriptionist waiting for dictation. You are expected to bring ideas to the table: propose new systems, extend half-formed ones, spot gaps and inconsistencies, and point out where the design could go deeper or play better. When the user asks to "improve this game design document," read the request as applying to the repository as a whole — make a coordinated pass that strengthens weak sections, deepens thin ones, improves cross-links, and keeps the documents consistent with one another.

Surface ideas as concrete proposals the user can approve, refine, or reject, phrased as a clear question with enough specifics to judge at a glance — "Should the swamp biome get a disease mechanic that ties into the [Inventory](Inventory.md) and food systems?" rather than a vague "want more on swamps?" Keep this back-and-forth — options, alternatives, open questions — in the conversation, never in the files.

Match the weight of the step to the weight of the change. Routine strengthening — tightening prose, expanding a thin paragraph, adding a fitting vignette, filling an obvious gap — you should simply do, writing it as finished text the user can read and edit. Reserve the propose-first question for substantial moves: a new system or mechanic, a shift in direction, or anything that commits the design to a notable choice.

## Write solid, finished text

Everything committed to a file is final, publication-quality prose in the document's voice. Write with conviction: state what a system is and how it works, as though the decision has been made. Do not hedge inside the document, do not leave "you could…" asides, bracketed fill-ins, or "suggested input" scaffolding in the prose, and do not write sentences about what has not been decided yet — describe a thing by its role rather than noting that its name or details are still open. The user reads what you wrote and adjusts anything they dislike, so give them solid text to react to, not a menu. Every tentative or exploratory remark belongs in the chat.

## Scope, level of detail, and naming

These documents are a vision and design guide for how the game should feel and why it works, not a production bible that pins down every name and number. At this stage the world's proper nouns are deliberately left open: do not invent or fix canonical names for capital cities, towns, regions, factions, or NPCs, and do not lock down specific town layouts or settlement designs. Describe such elements by role and archetype — "a dwarven forge-capital carved into a mountainside" rather than a christened city — and write that generic description as confident, finished prose. You do not need to ask which names to use; keeping these elements archetypal is the intended state for now.

The exception is self-contained subjects substantial enough to warrant their own focused treatment — most notably creatures and spells, but also any comparable system that needs to be worked out in depth. These may carry real names and be developed fully, the way the bestiary already names the [Wolf](Creatures/Wolf.md), [Kraken](Creatures/Kraken.md), and [Royal Dragon](Creatures/Royal-dragon.md) and the spell list names its entries. Concrete names that already exist elsewhere are fine to keep; the guidance is about not manufacturing new place and faction canon, not about stripping names already in place.

## Handling gaps and open items

When you reach something that genuinely cannot be finished without a decision from the user — a system that needs direction you should not invent, or content that depends on a choice only they can make — do not silently guess and do not bury a tentative note in the prose. Ask the user whether you should work it out yourself or leave a clearly labelled TODO mark in its place. The format of the mark does not matter as long as it states exactly what needs to be added or expanded, so any reader can tell what is missing and why. Prefer resolving the gap when you reasonably can; fall back to a TODO only when the user wants the decision left open.

## Document structure (hub-and-spoke)

Content follows a hub-and-spoke shape: a top-level index file introduces each domain and links out to the detail files that live in a matching subfolder. [Creatures.md](Creatures.md) fans out to individual bestiary entries under `Creatures/` such as [Wolf](Creatures/Wolf.md), [Kraken](Creatures/Kraken.md), and [Treant](Creatures/Treant.md); [Structures.md](Structures.md) gathers the settlements and dungeons under `Structures/`; [Magic.md](Magic.md) organizes spells by element under `Magic/Spells/<Element>/`; and [Skills.md](Skills.md) covers the files under `Skills/` and `Skills/Artisan/`. Biomes are the one departure from the pattern, living flat under `Biomes/` with [README.md](README.md) pointing at [Ancient-forest.md](Biomes/Ancient-forest.md) as the section's entry point.

When a concept grows large enough to deserve its own focused treatment, create a new Markdown file for it instead of burying it inside a broader document. A creature, spell, biome, or system mentioned in passing but not yet given its own file is a standing invitation to create one. Place new files in the most fitting existing folder, or create a new folder when the concept introduces a coherent new category, and add the new file to the appropriate index or hub document in the same change so it is discoverable from the repository's navigation.

## Consistent file structure

Every file should read as part of one document written by one hand, not a patchwork of mismatched styles. Follow the same build-up throughout: an `#` title, then a short opening paragraph that says what the subject is and why it matters, then themed `##` sections that develop it in prose from the general to the specific. Each file closes its readable content with a related-links or `Continue Reading` section and ends with the `Draft` appendix described below. Some domains layer a recognizable specialization on top of this shape — creature files carry a `Story Hook` section before their backlink, for instance — and new files in a domain should mirror the pattern their neighbours already use. When you touch a file that has drifted from this structure, bring it back into line as part of the edit, aligning its headings, ordering, and voice with the rest of the repository.

## Workflow and templates

The standards in this file describe how the writing should read; for the *process* of doing the work — orienting before you edit, running a decision-driven design session, adding a new document, and verifying links and structure before handing back — follow the workflow and copy the file templates kept in `.claude/skills/design-doc/`. In Claude Code that directory is a skill that loads on demand; for any other assistant, its [`SKILL.md`](.claude/skills/design-doc/SKILL.md) and [`references/templates.md`](.claude/skills/design-doc/references/templates.md) read as a plain process reference and a set of starting templates. That skill operationalizes these instructions and does not replace them: this file remains the authority on house style.

Three companion skills live alongside it under `.claude/skills/` and follow the same convention — on-demand skills in Claude Code, plain process references for any other assistant. [design-interview](.claude/skills/design-interview/SKILL.md) runs a question-driven session that draws the user's vision for a creature, biome, spell, or system out of them in batched, recommended-option questions before anything is written; its [question banks](.claude/skills/design-interview/references/question-banks.md) hold the per-type interview material. [design-research](.claude/skills/design-research/SKILL.md) grounds a topic in sourced online research — genre precedent from comparable games, real-world grounding, verified engine facts — and folds the findings back into the documents with authoritative external links. [doc-audit](.claude/skills/doc-audit/SKILL.md) is the repository's stand-in for a linter, pairing the script at [`check_docs.mjs`](.claude/skills/doc-audit/scripts/check_docs.mjs) (run `node .claude/skills/doc-audit/scripts/check_docs.mjs` from the repository root) with a judgment pass over reciprocal links, file anatomy, and style. Use whichever fits the work at hand; they all defer to this file on house style.

## Draft sections

Every design document ends with a `## Draft` section as its final appendix, placed below the related-links section, in this form:

```markdown
## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
```

The Draft section is the user's landing zone for rough, unpolished input. Treat anything placed there — along with any stray snippets you find scattered elsewhere in a file — as raw material to fold into the appropriate body sections as solid, finished prose, then remove what you have integrated so the section returns to empty. Never leave raw notes sitting in the finished body, and never discard their meaning; rework them. Whenever you create or edit a file that is missing the Draft appendix, add it. The repository's plumbing is the exception and carries no Draft section: the instruction files ([CLAUDE.md](CLAUDE.md), [AGENTS.md](AGENTS.md), and this file), the [README.md](README.md) index, and the [Design-backlog.md](Design-backlog.md) working file.

## Reorganizing for clarity

You may reorganize the file and folder structure whenever it improves clarity — rename, move, split, merge, or recategorize files, and add or restructure folders — without asking first. The user reverts anything they dislike. Two responsibilities come with that freedom. First, keep cross-links intact: filenames and their inbound links must stay in lockstep, so whenever you rename or move a file, update every inbound link in the same change, and search the whole repository for references rather than assuming you have found them all. The same applies when you correct a misspelled filename — find every index, biome, and creature cross-link that points at it first. Because the repository has no linter to catch a broken path, finish any restructuring by scanning for inbound links that now lead nowhere and repairing them before you hand the work back. Second, report what you changed: end any response that touched the structure with a short summary of the files created, renamed, moved, or merged, and the links updated, so the reorganization is easy to follow at a glance.

## Project working files: backlog and glossary

Two working files carry context between sessions, since assistants do not share memory. [Design-backlog.md](Design-backlog.md) holds ideas that have been approved or proposed but not yet written, open questions still awaiting the user's direction, and decisions deliberately deferred; park such items there so they survive, and clear them as they are written, answered, or decided. It is the natural home for anything raised under *Work as a co-creator* or *Handling gaps and open items* that the user does not want resolved on the spot. [Glossary.md](Glossary.md) is the home for the recurring archetype terms the design leans on — capital, outpost, region, cluster unit server, and the like — so the same vocabulary means the same thing across every file. Consult it when a term's precise sense matters, extend it when you introduce or rely on a new archetype term, and keep its definitions generic in line with the naming guidance above.

## Two server-architecture documents (keep distinct)

The server design is split across two documents that must not be conflated. [Server-architecture.md](Server-architecture.md) is the conceptual design spec — prose describing the cluster model of 1 km² regions, the division of labour between the Master Server and the Cluster Unit Servers, visibility-driven synchronization, and seamless region handoff, with no code. Its companion, [Server-architecture (Technical).md](<Server-architecture (Technical).md>), is the Unreal Engine 5 implementation guide that realizes the spec in concrete C++, INI, YAML, and Dockerfile snippets covering World Partition, the Replication Graph, the ghost-entity protocol, and orchestration through GameLift or Kubernetes. The technical document is meant to track the spec, so whenever a concept in the spec changes — region size or synchronization rules, for instance — update the corresponding section of the technical guide to keep the two consistent.

## Cross-linking conventions

The link structure between files is load-bearing and should be preserved whenever you add or move content. Every Markdown file in the game-design document should close its readable content with a short related-links or continue-reading section that points to one or more different files the reader could open next, with the `Draft` appendix following as the file's final section. Detail files still link back to their index with a closing line such as `See also: [Creatures index](../Creatures.md)`, and every index links outward to each detail file it owns. Cross-references between domains are bidirectional: a biome lists its fauna and links to each creature file (for example `[Treant](../Creatures/Treant.md)`), and the reciprocal link from creature back to biome is expected in turn. Always use relative paths, with detail files in subfolders reaching top-level docs through `../`.

## Avoid repeating information

Say each thing once. When the same fact or piece of context would fit in several sections, decide where it truly belongs and state it there. Where two passages must each touch the same point, keep them consistent so they never drift into contradiction, and update both in the same edit when the underlying detail changes. When the shared topic is large enough to stand on its own, move it into its own file, give it the focused treatment it deserves, and replace the scattered mentions with a short reference and a link to that file. The aim is a single source of truth for every idea, reached through links rather than restated from memory, so the documents never fall out of step with one another.

## Writing style

The document should be easy to read and professional. Prose is the default: write in a systems-design voice with complete sentences and connected paragraphs, the same register found throughout [Server-architecture.md](Server-architecture.md) and the creature and biome files. Reserve bullet points for genuine enumerations — discrete lists of features, hazards, or fauna — and prefer a sentence or short paragraph anywhere a bullet would merely restate a single idea. When a section starts to read as a stack of one-line bullets, fold it back into prose. During improvement passes, refactor unnecessary bullet lists into prose so the design reads like a cohesive document rather than notes. Do not use emojis, and remove any existing emojis encountered while improving files.

Above all, the prose should read as though a person wrote it. Vary sentence rhythm and length, let paragraphs breathe, and avoid the tells of machine writing — formulaic openers, mechanical signposting, hedging filler, and the same few connective phrases repeated throughout. A reader should never be able to point at a passage and tell that a tool produced it.

When improving an existing file, you may expand on the ideas already present so long as the additions stay aligned with the document's purpose, tone, and established level of specificity. Add a small story, encounter, or player-facing vignette wherever it fits the subject naturally, especially in creature files and other documents that benefit from showing how the idea appears in play.

Whenever the text names another document in the repository, render that reference as a clickable relative link rather than plain text. A mention of the building system should read as [Building system](Building-system.md), a reference to a creature as [Treant](Creatures/Treant.md), and so on, so the web of documents stays navigable from any page.

Anything the text points to outside the repository should carry a clickable link too. When you reference an external source — an engine feature, tool, vendor, article, standard, or video — put the link behind the words rather than naming the source in bare text, and prefer the authoritative origin, such as official documentation or the vendor's own page, over a second-hand mention.

Measurements follow European and metric conventions. Use a comma as the decimal separator in prose (a goblin stands `1,40 meters` tall, not `1.40`), express distance in metric units (metres and kilometres), and give weight in kilograms. The one exception is fenced code: snippets in [Server-architecture (Technical).md](<Server-architecture (Technical).md>) keep their language-native formatting, so C++ float literals such as `150000.0f` and the comments beside them stay as written.

When writing or confirming technical content — particularly anything in [Server-architecture (Technical).md](<Server-architecture (Technical).md>), such as Unreal Engine 5 APIs, console variables, plugin names, or third-party tooling — verify the detail against current documentation before committing it, running a web search where the tool allows. Cite authoritative sources such as Epic's developer documentation or the relevant vendor docs in the Further Reading list where appropriate, and prefer confirmed specifics over plausible-sounding placeholders.

## Conventions & gotchas

Creature detail files follow a recognizable shape — opening behaviour and role prose, then a `Story Hook` section, the `See also:` backlink, and finally the `Draft` appendix — which new creatures should mirror. Keep the prose in the systems-design voice of the surrounding document throughout, framing decisions in terms of gameplay rationale, and link any file you name as you write so the web of documents stays navigable.
