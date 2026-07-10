---
name: gdd-review
description: >-
  Critically review this game design document the way the real world would: a panel of stakeholder
  reviewers (investor/publisher, player/backer, prospective developer, producer, design peer,
  monetization & live-ops, art director, UX, narrative) each read the whole GDD and their findings
  land as inline review comments plus a consolidated GDD-REVIEW.md report. Use it whenever the user
  asks to review the design document, wants critical or honest feedback on the design, asks what an
  investor, publisher, player, developer, or any other stakeholder would think, asks whether the
  GDD is pitch-ready or greenlight-ready, names one or more of the review perspectives, or asks to
  clear, refresh, or re-run review comments. Reach for it even when the user only says "tear this
  apart", "poke holes in the design", or "is this document any good?".
---

# GDD Review

A game design document survives contact with the real world only if it survives the people around it: the publisher who spends two minutes on the pitch, the player deciding whether to care, the engineer deciding whether it can be built, the producer deciding whether it can be scheduled. This skill runs that panel. Each perspective is a `gdd-reviewer` subagent (Opus, effort high) that reads the entire document through one stakeholder's eyes; the main session merges their findings, places inline review comments where the problems live, and writes one consolidated report. The design behind the panel is Liz England's [Door Problem](https://lizengland.com/blog/the-door-problem/): every discipline extracts different requirements from the same spec, so the lenses are deliberately complementary — each brief tells its reviewer what *not* to cover because another lens owns it.

## The panel

| Slug | Perspective | Brief | Asks |
|---|---|---|---|
| `investor` | Investor / publisher | [references/investor.md](references/investor.md) | Would I greenlight further due diligence? |
| `player` | Player / backer | [references/player.md](references/player.md) | Would I wishlist it, back it, join the Discord? |
| `developer` | Prospective developer | [references/developer.md](references/developer.md) | Would I leave a stable job to build this? |
| `producer` | Producer | [references/producer.md](references/producer.md) | Could I build a production plan from this? |
| `design-peer` | Design peer | [references/design-peer.md](references/design-peer.md) | Do the systems reinforce the pillars? |
| `monetization` | Monetization & live-ops | [references/monetization-liveops.md](references/monetization-liveops.md) | Can this hold a live service for five years? |
| `art` | Art director | [references/art-director.md](references/art-director.md) | Could I brief a concept team tomorrow? |
| `ux` | UX designer | [references/ux.md](references/ux.md) | Does a new player survive two hours without a wiki? |
| `narrative` | Narrative designer | [references/narrative.md](references/narrative.md) | Is this one coherent world with stories in it? |

A plain invocation ("review the GDD") runs the full panel. When the user names perspectives ("review this as an investor and a player"), run only those — map their words onto the closest slugs and say which you picked. A full panel is roughly nine Opus-high agents each reading the whole repository, so it is a deliberate, somewhat expensive act; never silently expand a requested subset into the full panel. For a deeper pass on request, raise `effort: high` to `xhigh` in [.claude/agents/gdd-reviewer.md](../../agents/gdd-reviewer.md) for that run and set it back afterwards.

## Step 1 — Dispatch the reviewers

Launch all selected reviewers in parallel, in a single message, one `Agent` call per perspective with `subagent_type: gdd-reviewer`. Each delegation prompt is short — the agent body and brief carry the instructions:

```
Perspective: <slug> — <perspective name>.
Brief: .claude/skills/gdd-review/references/<brief file>.
Review the entire game design document from this perspective per your instructions and the brief.
Return the Verdict / Strengths / Findings report exactly as your output contract specifies.
```

Do not paraphrase the briefs into the prompt or add extra instructions; divergent prompts make the panel's reports incomparable.

## Step 2 — Merge the findings

The reports come back as structured findings (file, anchor, severity, finding, wants). Treat them as input to verify, not truth:

- Spot-check anchors: an anchor quote that no longer matches the file gets relocated to the right line or, failing that, demoted to a `(whole file)` finding.
- Merge duplicates across perspectives into one finding that credits every lens that raised it. Cross-perspective agreement is the strongest signal in the whole exercise — a gap flagged independently by three stakeholders outranks any single high.
- Drop findings that contradict the repository's deliberate conventions (archetypal naming, vision-not-production-bible scope) if the reviewer flagged them as per-file defects despite the brief; keep them only in their legitimate project-wide form.

## Step 3 — Place the inline comments

Findings anchored to a passage become HTML comments in the design files — invisible in rendered Markdown, visible to anyone editing:

```markdown
<!-- REVIEW(investor): The subscription case is asserted, not argued — name the comparable
subscription MMOs that sustained this model and what this design shares with them. -->
```

Placement rules:

- One comment per finding, on its own line directly **after** the paragraph or heading the anchor sits in. Multiple findings on the same passage stack as consecutive comment lines, one per perspective.
- The format is exactly `<!-- REVIEW(<slug>): <finding — wants, folded into one or two sentences> -->`. The fixed prefix is what makes comments findable and clearable later; don't vary it.
- Never alter the surrounding prose, never place comments inside `## Draft` appendices or fenced code blocks, and never comment `(project-wide)` findings into files — those live only in the report.
- Low-severity findings go in the report only, not inline; inline space is for comments the user should trip over while editing.

## Step 4 — Write the consolidated report

Write `GDD-REVIEW.md` at the repository root, overwriting any previous run (git history keeps old reviews). It is a working file like [Design-backlog.md](../../../Design-backlog.md): no `## Draft` appendix, not listed in the README index. Use exactly this structure:

```markdown
# GDD Review — <date>

Perspectives run: <list>. Comments placed: <N> across <M> files.

## Executive summary
<One paragraph: the state of the document as the panel sees it, leading with whatever multiple perspectives agree on.>

## Verdicts
| Perspective | Verdict |
|---|---|
<one row per perspective: the opening yes/no/conditional line of its verdict>

## Cross-cutting findings
<The merged findings raised by more than one perspective, most severe first, each crediting the lenses that raised it and linking the files concerned.>

## Per-perspective review
### <Perspective name>
<Verdict paragraph(s), strengths, then that perspective's remaining findings with severity, file links, and the "wants". Findings placed inline note the file they were placed in.>

## Resolving a finding
Fix the design, then delete the matching `<!-- REVIEW(...) -->` comment. Ask for "clear review comments" to strip all of them, or re-run the review to refresh.
```

## Step 5 — Report in chat

Close with the panel's headline: each perspective's one-line verdict, the top cross-cutting findings, and the counts (findings per severity, comments placed, files touched). Link [GDD-REVIEW.md](../../../GDD-REVIEW.md) and the most-commented files.

## Comment lifecycle

Review comments are meant to be short-lived. Resolving one means changing the design (that is ordinary design work under the [design-doc](../design-doc/SKILL.md) skill), then deleting the comment — never leave a resolved comment standing, and never "resolve" one by deleting it without addressing it unless the user rejects the finding. When the user asks to **clear review comments**, Grep for `<!-- REVIEW(` across the repository and remove every match (each sits on lines of its own, so removal never touches prose); report how many were cleared from which files. When asked to **re-run**, clear first, then dispatch fresh — stale comments beside new ones make it impossible to tell what the panel currently thinks.
