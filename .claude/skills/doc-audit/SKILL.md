---
name: doc-audit
description: >-
  Audit this game design document repository the way a linter would, since no real linter exists
  for it. Use it whenever the user asks to check links, verify structure, audit or validate the
  docs, find inconsistencies, or run a quality pass; after any restructuring, rename, move, or
  merge of files; before wrapping up a session that touched many documents; and when asked to
  sweep or integrate leftover Draft-section notes across the repository. Reach for it even when
  the user only says "is everything still consistent?" or "clean up the docs".
---

# Documentation Audit

The repository's conventions — relative links that must resolve, reciprocal cross-links, a fixed
file anatomy, a Draft appendix on every design file — are load-bearing, and nothing enforces them
automatically. This skill is the stand-in for that missing linter: a deterministic script for what
a machine can check, plus a judgment pass for what it cannot. The conventions themselves are
defined in [SHARED-INSTRUCTIONS.md](../../../SHARED-INSTRUCTIONS.md); this skill only verifies
them.

## 1. Run the deterministic checks

From the repository root, run:

```
node .claude/skills/doc-audit/scripts/check_docs.mjs
```

The script scans every design Markdown file (it skips `.claude/` and `.git/`) and reports:

- **Broken links** — relative links whose target file does not exist.
- **Orphaned files** — design files no other file links to, invisible to navigation.
- **Missing Draft appendix** — design files without the required `## Draft` section
  (the plumbing files are exempt: README, CLAUDE.md, AGENTS.md, SHARED-INSTRUCTIONS.md,
  Design-backlog.md).
- **Unintegrated Draft notes** — Draft sections holding raw content that should be reworked into
  the body and cleared.
- **Missing related-links closer** — files without a Continue Reading or See also section.
- **Emojis** — forbidden by house style.

It exits non-zero when broken links or missing Draft sections are found, so it doubles as a
pass/fail gate. If Node.js is unavailable, do the same sweep by hand with content search: extract
every `[text](relative-path)` target and test that each file exists, then grep for files lacking
`## Draft`.

## 2. Run the judgment checks

The script cannot see meaning. After it passes, check what it cannot:

- **Reciprocal links.** A biome that lists a creature expects the creature to link back; every
  detail file links its index and every index links its detail files. Spot-check the files touched
  recently rather than re-proving the whole repository each time.
- **Registration.** New files appear in [README.md](../../../README.md) and their hub document.
- **File anatomy.** Title, opening paragraph, themed `##` sections, related links, then Draft —
  and creature files carry a `Story Hook` before the backlink.
- **Single source of truth.** Each fact stated once and linked to; passages that share a point
  agree with each other. When you find the same information in two files, decide where it belongs
  and turn the other mention into a link.
- **Style.** Prose-first with bullets reserved for genuine enumerations, metric units with comma
  decimals in prose, no hedging or scaffolding left in files, and writing free of machine tells.

## 3. Report, then fix

Present findings grouped by severity: broken navigation (broken links, orphans, missing
registration) first, then structure (anatomy, missing sections, unintegrated drafts), then style.
Give each finding its file, what is wrong, and the concrete fix.

Mechanical repairs — a broken path, a missing Draft appendix, a missing backlink — apply directly
in the same pass; they have one correct answer. Judgment repairs — integrating Draft notes into
finished prose, merging duplicated content, rewriting bullet stacks — do only when the user asked
for a fixing pass, since they change the design text itself. When any fix renames or moves a file,
search the whole repository for inbound links and update them in the same change, then rerun the
script to prove the repair. End with the structural-change summary SHARED-INSTRUCTIONS requires.
