---
name: design-doc
description: >-
  Workflow and templates for working on this repository's game design document (the Markdown GDD).
  Use it whenever you add, expand, restructure, or improve design content — a new system, creature,
  biome, or spell; an improvement sweep across files; or a decision-driven design session with the
  user. Reach for it even when the user only says "improve the design", "add a creature/biome/system",
  "flesh out X", "do a design pass", or starts editing the design Markdown, because nearly all work in
  this repo is design-document work that has to follow the house style, hub-and-spoke structure, and
  cross-linking rules the repo depends on.
---

# Design Document Workflow

This skill is the *how to work* layer for this repository. The *how the writing should read* layer —
voice, file structure, naming, metric units, cross-linking, draft sections, single source of truth —
lives in [SHARED-INSTRUCTIONS.md](../../../SHARED-INSTRUCTIONS.md). Read that first; this skill does not
repeat it. What follows is the workflow that keeps changes consistent and the templates for new files.

## Orient before you touch anything

Never edit blind. A few minutes of reading prevents contradicting decisions that are already made or
re-opening ones deliberately left open.

- Read [README.md](../../../README.md) for the index and design pillars, [Design-backlog.md](../../../Design-backlog.md)
  for open questions, deferred decisions, and approved-but-unwritten ideas, and [Glossary.md](../../../Glossary.md)
  for the archetype terms the design reuses.
- Skim the file you will change and its neighbours, so new text matches the shape and voice already there.

## Match the weight of the step to the change

The repo expects two registers, and using the wrong one is the most common mistake.

- **Routine strengthening** — tightening prose, expanding a thin section, filling an obvious gap, adding
  a fitting vignette. Just do it, written as finished, publication-quality prose the user can react to.
- **Substantial moves** — a new system or mechanic, a change of direction, anything that commits the
  design to a notable choice. Propose first. Put it to the user as a concrete question with enough
  specifics to judge at a glance ("Should swamps get a disease mechanic tied to food and inventory?"),
  not a vague "want more on swamps?". Keep options, alternatives, and open questions in the chat, never
  in the files.

## Running a decision-driven design session

When the user wants to settle or add a lot at once (for example, "fill the gaps in the design doc"),
drive it deliberately rather than guessing:

1. **Research what a complete treatment needs.** For genre and structure questions a quick web check is
   enough. For anything technical — Unreal Engine 5 features, console variables, plugins, third-party
   tooling — verify against Epic's developer documentation or the vendor's own docs and cite the source;
   do not commit plausible-sounding specifics from memory.
2. **Gap analysis.** Compare the repo against that standard and against the backlog, and list what is
   genuinely missing rather than what merely could be expanded.
3. **Decide in batches.** Ask the user focused multiple-choice questions, grouping a handful of related
   decisions at a time. Lead with a recommended option and say why. Record each answer before moving on.
4. **Write each settled area immediately** as finished prose, then integrate it (see below). Park
   anything still undecided in [Design-backlog.md](../../../Design-backlog.md) so it survives; do not
   leave half-decided notes sitting in the body of a design file.
5. **Reconcile interactions.** A new decision usually touches existing docs — a loot rule reaches into
   inventory, reputation, and the economy. Update every affected file in the same pass so nothing drifts
   out of step.

### Large passes across many files

A pass that reviews or rewrites a whole domain (every creature, every biome) follows a fixed loop. It
worked well and the user expects it:

1. **Review before deciding.** Read the files in batches against one written brief with a fixed
   findings format (verdict, then issues ranked by importance with a concrete improvement each). Then
   compare across files yourself: sizes that do not fit together, overlapping roles, contradictions
   between a creature and its biome. Present one consolidated opinion with a suggested order of work.
2. **Decide in rounds.** Put genuine forks to the user as multiple-choice questions with a recommended
   option and the reason. Put numeric or descriptive values (sizes, body plans, encounter summaries) as
   one proposal table the user approves or edits, rather than one question per value. Follow what the
   user's answer actually says, including answers that reshape the question (a "which tier is right"
   question can turn into "split it into files").
3. **Keep a decisions log.** Record every answer in a decisions file in the session's scratch space as
   it comes in. That file is the binding brief for whoever writes the files.
4. **Write in non-overlapping groups.** When the work is split across parallel workers, give each worker
   a disjoint set of files so no two edit the same file. Shared files (indexes such as
   [Creatures.md](../../../Creatures.md), README, these instructions) stay with the coordinating session.
   Every worker gets the same writing brief, which points at SHARED-INSTRUCTIONS, the templates, and the
   decisions log rather than restating them.
5. **Verify twice, then fix.** Run the doc audit for structure, links, say-it-once, and style, and run a
   separate check of every changed file against the decisions log. Fix the findings in a second round,
   then read the most judgement-heavy files yourself.
6. **Never invent silently.** Any rule a writer added that the user did not decide is listed under
   "Open questions" in [Design-backlog.md](../../../Design-backlog.md) for the user to confirm or change,
   and is cleared once they answer.
7. **Leave the commit to the user.** Commit nothing; the user reviews the diff. End with a summary of
   what changed, what is still open, and where it is parked.

The project's `doc-auditor` agent is read-only and cannot write files, so ask it to return its findings
in its reply instead of saving a report; save the report yourself if it needs to survive.

## Adding a new document

1. Choose the matching template from [references/templates.md](references/templates.md) — system or hub,
   creature, biome, or spell — and follow the shape its neighbours already use.
2. Place it in the most fitting folder. Detail files live in subfolders (`Creatures/`, `Magic/Spells/<Element>/`);
   create a new folder only for a genuinely new category.
3. **Register it in the same change.** Add the file to [README.md](../../../README.md) and/or its hub
   document, so it is reachable from the repository's navigation rather than orphaned.
4. **Cross-link both ways.** Link out to every document you name, using relative paths (`../` from a
   subfolder), and add the reciprocal link back from each of those documents. Biome-to-creature and
   detail-to-index links are expected in both directions.
5. Update [Glossary.md](../../../Glossary.md) if you introduce a recurring archetype term, and update
   [Design-backlog.md](../../../Design-backlog.md): clear what you wrote, park what you deferred.
6. Close the readable content with a Continue Reading or related-links section, then end with the Draft
   appendix.

## Verify before handing it back

The repo has no linter, so the last pass is yours to do by hand.

- **Links resolve.** Every link points at a real file. If you renamed or moved a file, search the whole
  repo and update every inbound link — do not assume you found them all.
- **Structure is intact.** Title, opening paragraph, themed sections, Continue Reading, and the Draft
  appendix are all present; creature files carry a Story Hook before the backlink.
- **No contradictions.** Each fact is stated once and reached by a link, consistent with what other files
  already say.
- **House style holds.** Prose-first, metric units with comma decimals, no emojis, and writing that reads
  as though a person wrote it — varied rhythm, no machine tells.
- **Report structural changes.** End your response with a short note of any files created, renamed, moved,
  or merged, and the links you updated.

## Checklist for a new system document

- [ ] Oriented: read README, backlog, glossary, and neighbouring files
- [ ] Proposed first if the change was substantial; decisions recorded
- [ ] Technical claims verified against authoritative docs and cited
- [ ] Written as finished prose from the right template
- [ ] Placed in the correct folder and added to the index or hub
- [ ] Cross-linked in both directions
- [ ] Glossary and backlog updated
- [ ] Continue Reading and Draft appendix present
- [ ] Links and structure verified, and changes reported
