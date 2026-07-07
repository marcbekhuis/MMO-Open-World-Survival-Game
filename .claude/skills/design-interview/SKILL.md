---
name: design-interview
description: >-
  Interview-driven design sessions for this repository's game design document. Use it whenever the
  user's vision needs drawing out before writing: creating a new creature, biome, spell, race,
  structure, or system together; fleshing out a thin file where the missing substance is the user's
  call rather than yours; or any request like "ask me questions about X", "let's design X together",
  "help me work out the wolf's appearance/behaviour", or "I have an idea for a creature". Reach for
  it even when the user merely names a subject and says "add it", if the subject is substantial
  enough that its identity, behaviour, or role should be decided by them — the interview turns
  their answers into finished prose in the house style.
---

# Design Interview

This skill runs a structured question-and-answer session that pulls the user's vision for a design
subject out of their head, then commits it to the repository as finished prose. It is the
operational form of the "propose first" rule in [SHARED-INSTRUCTIONS.md](../../../SHARED-INSTRUCTIONS.md):
instead of inventing a substantial creature or system and hoping it matches what the user imagined,
you ask a small number of sharp questions, record the answers as decisions, and write only what has
been settled. House style, file structure, and templates are governed by the
[design-doc](../design-doc/SKILL.md) skill; this skill covers only the interview itself.

## Orient before asking anything

An interview that asks about things the repository already answers wastes the user's time and
signals you did not read. Before the first question:

- Follow the orientation step of the [design-doc](../design-doc/SKILL.md) skill — README, backlog,
  glossary, and the subject's file and neighbours.
- If the subject already has a file, read it closely. Everything written there is decided; only the
  gaps are interview material. Open the session by playing back, in a sentence or two, what is
  already established, so the user can correct you before questions begin.
- Check [Design-backlog.md](../../../Design-backlog.md) for deferred decisions touching the
  subject. A deliberately deferred choice is only fair game if the user brings it up or the subject
  cannot be finished without it — and then name it as previously deferred when you ask.

## Decide what deserves a question

Not every blank is worth the user's attention. The interview should feel like a design meeting
between collaborators, not a form to fill in. Apply the same weight rule the repository uses for
writing:

- **Ask** about identity and commitments: what the thing fundamentally is, the fantasy it delivers,
  its role in the wider game, and anything that would be expensive to reverse — a creature's core
  behaviour, a biome's tone, a system's central loop.
- **Decide yourself** the routine texture that follows from those answers: exact phrasing, minor
  ecological details, the shape of a vignette. Write these as finished prose the user can react to,
  per the house rule that routine strengthening is simply done.

A good session usually needs two or three batches of questions, not ten.

## How to ask

Ask in batches of three to five related questions, so the user makes one pass per theme rather
than answering a drip-feed. For every question:

- Offer two to four concrete options, each specific enough to judge at a glance.
- Lead with a recommended option and say briefly why you recommend it.
- Accept freeform answers gladly — the options are there to make deciding fast, not to constrain.

In Claude Code, use the AskUserQuestion tool with multiple questions per call. In an assistant
without such a tool, number the questions in chat, present the options inline, and wait for the
reply before continuing. Either way, record each answer as a decision before moving to the next
batch, and restate any answer that surprised you to confirm you understood it.

Pick the questions from [references/question-banks.md](references/question-banks.md), which holds a
bank per subject type — creature, biome, spell, system, race, structure. Treat each bank as a menu,
not a checklist: choose only the areas the existing material leaves open.

## Write as you go

After each settled batch — or at the end, for a short session — convert the decisions into
finished, publication-quality prose in the correct file, following the matching template from the
[design-doc](../design-doc/SKILL.md) skill. The rules from SHARED-INSTRUCTIONS apply in full:
nothing tentative in the files, no "the user chose…" narration, no options left in the prose. The
document reads as though the design was always this way.

Anything the user declines to decide goes to [Design-backlog.md](../../../Design-backlog.md) as an
open question, phrased concretely enough to act on later. Then cross-link both ways, register the
file in its index, and verify per the design-doc skill's final checklist.

## Close the session

End with a short play-back in chat: the decisions made, the file(s) written or updated, and
anything parked in the backlog. This gives the user one place to spot a misunderstanding while the
session is still warm.
