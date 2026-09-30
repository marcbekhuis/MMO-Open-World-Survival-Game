---
name: creature-model-references
description: "Generate photorealistic single-image creature references for image-to-3D model generators (Tripo and similar) for this MMO design document. Use when Codex or ChatGPT needs to turn a creature under Creatures/ into a clean model-reference render, regenerate one after a creature description changes, fix an anatomy problem in a generated reference, prepare a ready-to-paste ChatGPT chat prompt for a creature, or store results under Assets/Creatures/Model-references. Not for the hand-drawn open-book bestiary plates; that is the creature-bestiary-images skill."
---

# Creature Model References

A model reference is one photorealistic render of a creature in a neutral, rig-friendly pose on a plain background. It is the input image for a single-image image-to-3D generator. Everything the image hides, the 3D generator invents, so the image is judged on readability of anatomy first and beauty second.

## Required Reference

Read `references/prompt-recipes.md` before generating anything. It holds the prompt scaffold, the pose rules per body plan, the anatomy-wording rules that stop drift toward humanoid shapes, the fix-prompt library, the quality checklist, and the worked Royal Dragon example.

When the user works in ChatGPT's chat mode (no repository access), produce a filled-in copy of `references/chatgpt-chat-template.md` for them to paste instead of generating the image yourself.

## Workflow

1. Read the creature's file under `Creatures/`: the opening paragraph and `Appearance and Visual Design` are the source of truth for anatomy, scale, colours, and materials. Behaviour, lore, gameplay, and story sections do not go into the prompt.
2. Classify the body plan using the table in the recipes and pick the matching pose and camera. Decide the real-animal anchors that describe the anatomy (for example bat or pterosaur for a wyvern, Tyrannosaurus for a level biped stance, crocodile for a low horizontal body).
3. Fill in the scaffold. State the limb count, where each limb attaches, and what is under the chest. Use animal terms, not human-body terms, for non-humanoid creatures.
4. Generate one image with the built-in image generation. If `Assets/Creatures/Model-references/` already holds references, attach one as a style anchor so lighting, background, and finish match across creatures.
5. Run the quality checklist. Fix one problem per edit using the fix-prompt library, always with "keep everything else identical". Continue in the same conversation so the design stays consistent; if the head, colours, or proportions start drifting, start a new conversation with the best image attached and give only the remaining fix.
6. Stop when the checklist passes. Perfection is not the goal; a clean silhouette with every limb visible is.
7. Save the accepted image as `Assets/Creatures/Model-references/<creature-slug>-model-reference.<ext>`, keeping the format the image generator produced (`.png` or `.webp`) and using the same slug as the bestiary plate (lowercase hyphen-case of the creature title). Save variants as `<creature-slug>-model-reference-v2.<ext>`. Embed the accepted reference in the creature file's `## Concept Drawing` section, below the bestiary plate: `![<Creature Title> model reference](../Assets/Creatures/Model-references/<creature-slug>-model-reference.<ext>)`. When the creature has no `## Concept Drawing` section yet, add one after the `See also:` backlink and before the `## Draft` appendix.
8. Append the final consolidated prompt to the "Worked examples" section of `references/prompt-recipes.md`, with a one-line note on which fixes were needed, so the next creature starts from what worked.

## Verification

- Count the limbs in the saved image yourself and compare with the creature file.
- Confirm the file exists at the documented path and that the embed in the creature file resolves; run `node .claude/skills/doc-audit/scripts/check_docs.mjs` and check it reports no broken links.
- Report the saved path, the number of fix rounds, and any known weak spot the 3D generator is likely to struggle with (overlaps, thin membranes, hidden parts).
