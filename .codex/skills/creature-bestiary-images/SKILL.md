---
name: creature-bestiary-images
description: "Generate, replace, store, and embed creature bestiary concept images for this MMO design document. Use when Codex needs to create hand-drawn open-book two-page creature plates for new creatures, regenerate plates after a creature description changes, update files under Assets/Creatures/Bestiary, or add Markdown image embeds to Creatures/*.md. The target style matches the existing colorful adventurer-drawn bestiary spreads: physical parchment book pages, visible center fold, one clear creature portrait, smaller anatomy or behavior sketches, decorative field notes, and only the creature title clearly legible."
---

# Creature Bestiary Images

## Required Reference

Read `references/prompt-recipes.md` before generating or replacing an image. It contains the prompt scaffold, how to build the subject from a creature file, the rules for species split into hub and tier files, the style contract, and the fixed adventurer hand, mood, and palette for every creature.

## Workflow

1. Gather the creature source text before prompting. For existing entries, read the relevant file under `Creatures/`, especially the title, opening paragraph, `Appearance and Visual Design`, behaviour, habitat, role, and story hook. For many creatures, use `Creatures.md` as the index.
2. Treat the Markdown as the source of truth for the creature. Existing images are style references only: never copy a creature's anatomy, colours, or proportions from an older plate, because many older plates predate the current descriptions.
3. If existing bestiary assets are present, inspect `Assets/Creatures/Bestiary/` or make a contact sheet when useful so the new plate matches the established style.
4. Use the built-in `image_gen` workflow through the normal image-generation skill. Generate one final image per creature with a creature-specific prompt; do not use the CLI fallback unless the user explicitly asks for CLI/API/model control.
5. Keep the style contract intact: an actual physical open book spread, aged parchment, visible central gutter, a clear full creature portrait, secondary study sketches, hand-drawn ink and watercolor treatment, varied adventurer-note personality, and no modern UI, watermark, or logo.
6. Quality-check every output. Confirm the creature is not hidden by text or atmosphere, the book spread reads as two pages, the creature title is the only intentionally legible text, and the image fits the creature description. Count the limbs of every creature against its file before accepting the image (generators add, merge, and drop limbs), and check the human silhouette matches the file's stated size. For dragon-like or wyvern-like creatures, a wyvern must show two hind legs and two wing-forelimbs only, with no separate front legs.
7. Copy the selected generated file into the project; leave the original under `$CODEX_HOME/generated_images/...`.
8. Store project assets at `Assets/Creatures/Bestiary/<creature-slug>-bestiary.png`, using the image file name listed for the creature in the style assignments table (it keeps existing names such as `goblins-bestiary.png` so embeds stay valid). For a new creature, use lowercase hyphen-case from the creature title.
9. If the user explicitly asked for a replacement image, overwrite the old project asset. If the request is exploratory or a variant, save a sibling such as `<creature-slug>-bestiary-v2.png`.
10. Embed the image in the creature Markdown in its own `## Concept Drawing` section after the `See also:` backlink and before any `## Inspiration` section and the `## Draft` appendix, matching the existing creature files. For a species split into a hub and tier files, embed the hub plate in the hub file and each tier plate in its own tier file, adding the `## Concept Drawing` section to tier files that do not have one yet. Keep any model reference image already in the section below the bestiary plate.

## Regenerating the Whole Set

When the user asks to regenerate all plates, work through every row of the style assignments table in `references/prompt-recipes.md`, one creature at a time, and overwrite each existing asset (this counts as an explicit replacement request). Build every subject fresh from the current creature file as the recipes describe; do not start from the previous plate's prompt. After each image, run the quality check in step 6 before moving on, and regenerate on a failure rather than accepting a near miss. Image file names stay the same, so existing embeds keep working and no Markdown edits are needed except for a creature that has no `## Concept Drawing` section yet. Finish with a contact sheet of the full set so the user can compare the plates side by side, and report any creature whose plate still fails a check. Contact sheets, prompt logs, and other working files stay outside the repository (next to the generated originals under `$CODEX_HOME/generated_images/...`); only the plates themselves go into `Assets/Creatures/Bestiary/`.

For creature files under `Creatures/`, use this Markdown shape:

```markdown
## Concept Drawing

![Creature Title bestiary entry](../Assets/Creatures/Bestiary/creature-slug-bestiary.png)
```

Adjust the relative path only if the Markdown file is somewhere other than `Creatures/`.

## Verification

After editing the project:

- Run the repository doc audit when available: `node .claude/skills/doc-audit/scripts/check_docs.mjs`.
- Search for the image references with `rg "Assets/Creatures/Bestiary|## Concept Drawing" Creatures`.
- Report the saved image paths, the Markdown files updated, and whether generation used the built-in image tool or an explicitly requested fallback.
