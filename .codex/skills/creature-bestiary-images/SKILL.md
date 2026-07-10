---
name: creature-bestiary-images
description: "Generate, replace, store, and embed creature bestiary concept images for this MMO design document. Use when Codex needs to create hand-drawn open-book two-page creature plates for new creatures, regenerate plates after a creature description changes, update files under Assets/Creatures/Bestiary, or add Markdown image embeds to Creatures/*.md. The target style matches the existing colorful adventurer-drawn bestiary spreads: physical parchment book pages, visible center fold, one clear creature portrait, smaller anatomy or behavior sketches, decorative field notes, and only the creature title clearly legible."
---

# Creature Bestiary Images

## Required Reference

Read `references/prompt-recipes.md` before generating or replacing an image. It contains the exact prompt scaffold, style contract, and successful creature-specific prompt details from the original 15-image batch.

## Workflow

1. Gather the creature source text before prompting. For existing entries, read the relevant file under `Creatures/`, especially the title, opening paragraph, `Appearance and Visual Design`, behaviour, habitat, role, and story hook. For many creatures, use `Creatures.md` as the index.
2. Treat the Markdown as the lore source of truth. Existing images are style references, not canon overrides.
3. If existing bestiary assets are present, inspect `Assets/Creatures/Bestiary/` or make a contact sheet when useful so the new plate matches the established batch.
4. Use the built-in `image_gen` workflow through the normal image-generation skill. Generate one final image per creature with a creature-specific prompt; do not use the CLI fallback unless the user explicitly asks for CLI/API/model control.
5. Keep the style contract intact: an actual physical open book spread, aged parchment, visible central gutter, a clear full creature portrait, secondary study sketches, hand-drawn ink and watercolor treatment, varied adventurer-note personality, and no modern UI, watermark, or logo.
6. Quality-check every output. Confirm the creature is not hidden by text or atmosphere, the book spread reads as two pages, the creature title is the only intentionally legible text, and the image fits the creature description. For dragon-like or wyvern-like creatures, explicitly count the limbs before accepting the image; a wyvern-like creature must show two hind legs and two wing-forelimbs only, with no separate front legs.
7. Copy the selected generated file into the project; leave the original under `$CODEX_HOME/generated_images/...`.
8. Store project assets at `Assets/Creatures/Bestiary/<creature-slug>-bestiary.png`. Use lowercase hyphen-case from the creature title. Preserve intentional plural titles such as `goblins-bestiary.png`.
9. If the user explicitly asked for a replacement image, overwrite the old project asset. If the request is exploratory or a variant, save a sibling such as `<creature-slug>-bestiary-v2.png`.
10. Embed the image in the creature Markdown in its own `## Concept Drawing` section after the `See also:` backlink and before the `## Draft` appendix, matching the existing creature files.

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
