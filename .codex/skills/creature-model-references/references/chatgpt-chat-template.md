# ChatGPT Chat Template

Use this when generating a model reference in ChatGPT's chat mode, which cannot read the repository. Codex, Claude, or the user fills in the bracketed parts from the creature's file under `Creatures/` using the rules in [prompt-recipes.md](prompt-recipes.md), then pastes the message into a new chat.

## How to use it

1. Start a new chat. For a consistent look across creatures, attach an existing image from `Assets/Creatures/Model-references/` and keep the first line of the message below; otherwise delete that line.
2. Paste the filled-in message.
3. Check the result against the quality checklist in [prompt-recipes.md](prompt-recipes.md) and send fixes from its fix-prompt library, one per message, in the same chat.
4. Save the accepted image to `Assets/Creatures/Model-references/<creature-slug>-model-reference.png` (or `.webp`, whichever ChatGPT produced).

## Message

```text
The attached image is only a style reference for lighting, background and render quality. Do not copy its creature.

Create an image: a photorealistic 3D creature reference for a game model. It will be fed into an image-to-3D generator, so it must show one creature, full body, clearly readable, on a plain background.

Subject: the [Creature Title], [size class, body plan, overall feel].

Anatomy (most important, follow exactly):
- [Exact limb count and what each limb is.]
- [Where each limb attaches to the body.]
- [Body orientation and stance, with a real-animal anchor.]
- [Body parts that are absent, and "clear empty space under the chest" if relevant.]
- [Neck, head, tail and other major parts.]

Appearance:
- [Skin, scales, fur or shell: texture and colour zones.]
- [Head features.]
- [Membranes, fins, plates or growths.]
- [Age and wear.]
- Feeling: [two or three mood words].

Pose: [neutral pose from the body-plan table]. Mouth closed, limbs apart, nothing crossing in front of the body.

Image requirements:
- Three-quarter front view (about 45 degrees), camera slightly above the creature, the whole body including every tip in frame with a small margin.
- Every limb clearly visible and separated; no limb hidden behind the body or another limb.
- Plain light-grey background, soft even studio lighting, no cast shadows, no ground scenery, no text, no props.
- Photorealistic rendering, like a high-end game creature model.
```
