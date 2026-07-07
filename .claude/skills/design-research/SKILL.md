---
name: design-research
description: >-
  Deep, sourced online research that strengthens a topic in this game design document and backs it
  with authoritative external references. Use it whenever a document would improve by knowing how
  comparable games solve the same problem, by real-world grounding (animal behaviour, ecology,
  climate, metallurgy, historical trade and economies), or by verified Unreal Engine 5 facts — and
  whenever the user says "research X", "find sources or references for X", "how do other games
  handle X", "improve X with research", or asks for external links to add to a document. Reach for
  it during any improvement pass where a claim in a file is plausible-sounding but unverified.
---

# Design Research

Research here serves the document. The deliverable is never a research report — it is better design
prose, decisions the user can judge, and authoritative links placed behind the words per the house
style in [SHARED-INSTRUCTIONS.md](../../../SHARED-INSTRUCTIONS.md). The most valuable single output
of a research pass is a well-sourced contradiction of something the design currently assumes,
surfaced before it spreads to more files.

## 1. Frame the questions

Read the target document and its neighbours first, then write down three to six concrete questions
whose answers would visibly improve the text. "Research taming" is not a question;
"do successful MMO taming systems make capture a skill test or a grind, and what do players
praise or resent about each?" is. Sort each question into one of three lanes, because the lanes
have different sources and different standards of proof.

**The genre lane** — how shipped games solved this problem. Look for developer postmortems, GDC
talks, design retrospectives, and patch histories rather than feature lists: the interesting
material is why a system worked or failed, not that it existed. Extract patterns and pitfalls the
design can learn from, and note which games players cite as the best and worst version of the idea.

**The grounding lane** — real-world facts that make the fiction credible. Predator hunting
behaviour for a creature file, the ecology and climate of a real analogue for a biome, bloomery
smelting for the crafting chain, medieval market towns for the economy. The design does not need to
be realistic, but it reads better when its departures from reality are chosen rather than
accidental.

**The technical lane** — Unreal Engine 5 features, console variables, plugins, and tooling. House
style already requires these to be verified against Epic's developer documentation or the vendor's
own pages before being committed; this lane is that rule in action. Never commit a
plausible-sounding API or CVar from memory.

## 2. Search

In Claude Code, delegate the lanes to agents in parallel and keep the synthesis in the main thread:
the project's `design-researcher` agent handles the genre and grounding lanes, and either it or the
global `researcher` agent handles the technical lane. In an assistant without subagents, run the
searches directly with whatever web tools it has.

Whoever searches, the source hierarchy is the same. Official documentation and vendor pages decide
technical questions. Developer talks and postmortems outrank fan wikis; fan wikis outrank forum
threads; forums are leads to verify, not sources to cite. Track the URL for every fact you intend
to keep, and note the confidence — a claim resting only on a forum post must be labelled as such
when you report it, and should not become a link in the document.

## 3. Fold the findings into the design

Apply the repository's weight rule to what you learned:

- **Contradictions come first.** If research undercuts something the design already states, raise
  it in chat before touching the files, with the source attached.
- **Substantial moves** — research suggesting a new mechanic or a change of direction — are
  proposed as concrete questions the user can judge at a glance, never written straight in.
- **Routine strengthening** — sharper detail, a more credible behaviour, a corrected technical
  claim — is simply written, as finished prose in the document's voice.

External references go behind the words, at the authoritative origin, following the linking rules
in SHARED-INSTRUCTIONS: an engine feature links to Epic's page for it, a real-world inspiration
links to a substantive treatment of it, and technical documents extend their Further Reading lists.
The prose itself keeps the systems-design voice throughout — the document states the design with
conviction, and the justification stays in chat. Grounding may surface as texture ("it hunts the
way a pack of wolves drives prey") but never as citation-speak; no "according to", no "research
shows", no pasted summaries.

## 4. Close out

Park anything the research raised but the user has not decided in
[Design-backlog.md](../../../Design-backlog.md). Update every file the new material touches in the
same pass so nothing drifts, then verify links and structure per the
[design-doc](../design-doc/SKILL.md) skill. In chat, report what changed, what was proposed, and
which claims you could not verify — unverified is a finding too.
