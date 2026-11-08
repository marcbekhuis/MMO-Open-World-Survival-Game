---
name: building-material-references
description: "Generate photorealistic reference plates for the building materials of this MMO design document, one plate per brief under Art-direction/Building-materials/. Use when Codex or ChatGPT needs to turn a material brief (thatch and hide, rough or planked timber, timber and plaster, living wood, clay and adobe, fired brick, fieldstone, cobblestone, dressed stone, fitted masonry, reinforced stone, warded stone, or a later addition) into a model reference for building-kit modelling, regenerate a plate after its brief changes, act on an `<!-- REVIEW(art-reference) ... -->` comment beside a plate, or store results under Assets/Building-materials/Model-references. Not for creatures; those use creature-model-references and creature-bestiary-images."
---

# Building Material References

A building-material reference plate is one photorealistic image that shows a material the way a modeller and texture artist must reproduce it: assembled in the world at first-person eye height, as an isolated kit piece from front and rear, and in close-up. It is the visual hand-off for the building kit, so it is judged on fidelity to its brief first and beauty second. The brief is canon over the plate: when they disagree, the plate is regenerated, never the brief edited to match.

## Required Reading

Read all of these before writing a prompt. The first plates of this set missed defining traits because the generator was briefed from the material's name and a skim of its brief.

1. `references/prompt-recipes.md` in this folder: the plate layout, the prompt scaffold, the must-show extraction rule, the quality checklist, and the list of traits generators have already got wrong.
2. The whole material brief under `Art-direction/Building-materials/<Material>.md`, every section, not only `Look at Eye Level`. `Construction and Joints` fixes the unit sizes and joints, `Wear, Weathering, and Damage` fixes the default condition, and `Reference Set` says what the plate must avoid.
3. `Art-direction/Building-materials.md` (the hub), `Art-direction.md` (the global art rules, especially photorealism, contrast, and `Mana in the Frame` for anything magical), and `Art-direction/Surface-authoring.md` (texel density, scale, and how much wear belongs to the base material).
4. Any `<!-- REVIEW(art-reference): ... -->` comment beside the existing plate in the brief. It names what the previous plate got wrong; the new plate must fix every point in it.

## Workflow

1. Write the must-show list for the material as the recipes describe: six to ten traits from the brief, each concrete and checkable (a size in metres, a colour, a joint, a finish, a default condition), with the traits that tell this material apart from its neighbours in the family first.
2. Fill in the prompt scaffold. The must-show list goes near the top, before mood or setting, and the brief's "avoid" sentences go in as explicit negatives.
3. Generate one plate at 1536 by 1024 pixels in the standard layout. When plates already exist in `Assets/Building-materials/Model-references/`, attach one as a style anchor for lighting, background, and panel layout, and say in the prompt that only the layout and finish are borrowed, not the material.
4. Check every must-show trait and every checklist item against the plate. Fix one problem per edit with "keep everything else identical"; when the material starts to drift, start a new conversation with the best plate attached and give only the remaining fixes.
5. Save the accepted plate as `Assets/Building-materials/Model-references/<material-slug>-model-reference.png`, where the slug is the brief's file name in lower case (`planked-timber`, `thatch-and-hide`). It replaces the previous plate at the same path, so the embed keeps working.
6. The plate is embedded at the top of the brief's `## Reference Set` section as `![<one-line description of what the plate shows>](../../Assets/Building-materials/Model-references/<material-slug>-model-reference.png)`. Update the alt text when the plate's content changes.
7. Delete the `<!-- REVIEW(art-reference): ... -->` comment once every point in it is fixed in the new plate; leave any point that is not fixed in the comment.
8. Append the final prompt and the fixes it needed to the worked examples in `references/prompt-recipes.md`, and add any newly observed generator mistake to its known-misses table.

## Verification

- Tick each must-show trait off against the plate yourself, naming where in the plate it is visible.
- Confirm the plate is 1536 by 1024 pixels and follows the standard layout, so the set stays consistent.
- Run `node .claude/skills/doc-audit/scripts/check_docs.mjs` from the repository root and confirm it reports no broken links.
- Report the saved path, the must-show list, any trait the plate still misses, and whether a REVIEW comment remains.
