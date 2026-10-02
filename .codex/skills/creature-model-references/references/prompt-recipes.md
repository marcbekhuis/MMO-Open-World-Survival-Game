# Model Reference Prompt Recipes

These recipes come from generating the Royal Dragon reference, where a text-to-3D generator failed repeatedly and a generated reference image followed by image-to-3D succeeded. The rules below record what caused each failure and what fixed it.

## Why an image, not a text prompt

Text-to-3D generators drift toward the shapes they have seen most, which for any creature described with muscles and two legs means a humanoid demon: chest, abs, arms with hands, tiny wings. Long prompts make this worse, because many text-to-3D pipelines read only the first few dozen words. An image generator follows anatomy instructions far better, the result can be checked and corrected before a single 3D credit is spent, and image-to-3D copies what it sees.

The free Tripo plan accepts one input image (no multi-view) and only exports models from its H2.5 model, so the reference has to work as a single view.

## Prompt scaffold

Fill in the angle-bracket parts from the creature file. Keep the section order: the image generator weighs early text most, so anatomy comes before appearance.

```text
Create an image: a photorealistic 3D creature reference for a game model. It will be fed into an image-to-3D generator, so it must show one creature, full body, clearly readable, on a plain background.

Subject: the <Creature Title>, <one-line identity: size class, body plan, overall feel>.

Anatomy (most important, follow exactly):
- <Exact limb count and what each limb is.>
- <Where each limb attaches to the body, e.g. "hind legs at the hips where the tail begins".>
- <Body orientation and stance, using a real-animal anchor, e.g. "body level and horizontal like a crocodile".>
- <What is NOT there, stated as body parts: "no arms, no separate front legs"; plus "clear empty space under the chest" when relevant.>
- <Neck, head, tail, or other major parts and their shape.>

Appearance:
- <Skin, scales, fur, or shell: texture and colour zones.>
- <Head features: horns, crest, ridges, eyes.>
- <Secondary surfaces: membranes, fins, plates.>
- <Age and wear: scars, chips, dust, moss.>
- Feeling: <two or three mood words>.

Pose: <neutral rig pose from the body-plan table below>. Mouth closed, limbs apart, nothing crossing in front of the body.

Image requirements:
- Three-quarter front view (about 45 degrees), camera slightly above the creature, the whole body including every tip (wings, tail, horns, tentacles) in frame with a small margin.
- Every limb clearly visible and separated; no limb hidden behind the body or another limb.
- Plain light-grey background, soft even studio lighting, no cast shadows, no ground scenery, no text, no props, no rider, no saddle.
- Photorealistic rendering, like a high-end game creature model.
```

## Pose and camera per body plan

Riggers want limbs apart and nothing overlapping, which is the same thing a single-view 3D generator needs. Never write "T-pose" for a non-humanoid: the word is bound to human characters and pulls the creature upright into a humanoid stance. Describe the pose instead.

| Body plan | Neutral reference pose |
| --- | --- |
| Humanoid (goblin, minotaur, skeletons, giant) | A-pose: standing straight, arms angled down about 45 degrees away from the body, legs slightly apart, hands open, weapons and shields left out |
| Wyvern (two legs, wings as forelimbs) | Standing on both hind legs, body level like a Tyrannosaurus or a bird with spread wings, both wings fully spread straight out to the sides, neck forward in a gentle curve, tail straight back off the ground |
| Quadruped (wolf, deer, buffalo) | Standing square on all four legs, legs slightly apart, head level, tail relaxed away from the legs; a slightly higher camera so the far legs show |
| Multi-limbed (four-armed primate, spiders) | All limbs spread outward and evenly spaced like a specimen on display, no two limbs touching; camera higher, about 30 degrees above, so every limb is readable |
| Serpentine or worm (sandworm) | Body in a loose S-curve laid out along the ground, head raised slightly, no coils crossing over each other |
| Tentacled (kraken) | Body upright, tentacles spread radially and evenly around it like a star, tips curling outward, none crossing |
| Aquatic with tail (mermaid) | Upright torso in A-pose, fish tail extended straight down and slightly curved, fins spread |
| Amorphous (slime) | Resting shape on the ground, one clear silhouette, any internal objects visible but inside the body |
| Plant or giant (treant, stone giant, titan turtle) | The humanoid or quadruped row that matches, with branches, rocks, or shell growths kept away from the limbs |

## Anatomy wording rules

- State anatomy positively and concretely: the count, the attachment points, and the empty space. "The wings are its only front limbs; clear empty space under the chest" works; "no front legs" alone does not.
- Anchor unusual anatomy on real animals the image generator knows well: bat or pterosaur for wing-forelimbs, Tyrannosaurus or a bird for a level two-legged stance, crocodile for a low horizontal body, octopus for tentacles, gorilla for a heavy primate.
- For non-humanoid creatures avoid human-body vocabulary: chest muscles, abs, broad shoulders, arms, hands, brutish, muscular, standing upright. These words were the trigger that turned the dragon into a humanoid demon.
- Place legs explicitly. Without it, a two-legged creature tends to get its legs under the chest, where front legs would be, which reads as half a quadruped.

## Quality checklist

Check every generated image before accepting it or spending 3D credits on it:

1. Count the limbs and compare with the creature file.
2. Check each limb attaches where it should (hind legs at the hips, wings at the shoulders).
3. Look for merged or leftover limbs: a stump hanging from a shoulder, a limb blending into another. Generators leave these behind after pose changes.
4. Look for hidden limbs. Anything hidden will be invented by the 3D generator.
5. Check that every tip (wingtips, tail, horns, tentacles) is inside the frame.
6. Note overlaps, such as a far wing behind the head. They are the most likely places for the 3D model to fuse parts; if they cannot be avoided, report them.
7. Background plain, no props, no text.

## Fix-prompt library

Send one fix per message and always end with keeping the rest unchanged.

```text
Legs in the wrong place: The legs are placed under the chest, like front legs. Move them back to the hips, where the tail begins, like a Tyrannosaurus or a bird: the torso balances over the hips, with the neck forward and the tail back as counterweight. Leave clear empty space under the chest. Keep everything else identical.
```

```text
Leftover limb: There is an extra limb hanging from the shoulder and merging into the leg. Remove it. Each wing's arm bones must run clearly from the shoulder along the front edge of the wing to the clawed wrist; nothing else hangs down from the shoulder. Keep everything else identical.
```

```text
Humanoid drift: The creature has become humanoid: <arms on the chest / upright stance / human torso>. Remove that. <Restate the anatomy line with the real-animal anchor.> Keep the head, colours and scales identical.
```

```text
Parts too small: The <wings / tail / horns> are too small for this body. Make them <much larger / a wingspan about three times the body length>, realistic enough to <lift its weight>. Change only the <part>; keep everything else identical.
```

```text
Hidden limb: The <near hind leg> is hidden behind the <wing>. Raise the camera slightly and keep both <hind legs> fully visible. Keep everything else identical.
```

```text
Cropped tips: Zoom out so both <wingtips / the whole tail> are fully visible, with a small margin. Keep everything else identical.
```

```text
New pose in the same conversation: Keep this exact creature design from the conversation: same head, horns, scales, colours and proportions. This is a new pose, not an edit of the previous image: <pose from the table>.
```

## Handing the image to the 3D generator

Crop the accepted image so the creature fills the frame with a small margin. If the first 3D result fuses two overlapping parts, try a different seed before editing the image, since results vary a lot between runs. Thin surfaces such as wing membranes and fins often come out as thick slabs or with holes from a single view; that is cheaper to repair in Blender afterwards than to fight in the image.

Check the 3D service's licence terms before a generated model goes into the shipped game; free-plan outputs may be public or restricted to non-commercial use.

## Worked examples

### Royal Dragon

Saved as `Assets/Creatures/Model-references/royal-dragon-model-reference.webp`. Fix rounds needed: wings enlarged, pose changed from wing-knuckle walking (which hid the hind legs behind the folded wings) to spread wings, legs moved from under the chest to the hips, and a leftover shoulder limb removed. Known weak spot: the far wing root overlaps the neck and horns.

Consolidated prompt. The accepted image came from several rounds in one conversation; this merges the original prompt with every fix, and has not yet been run as a single message:

```text
Create an image: a photorealistic 3D creature reference for a game model. It will be fed into an image-to-3D generator, so it must show one creature, full body, clearly readable, on a plain background.

Subject: the Royal Dragon, a massive, heavily muscled wyvern built like a predator, never fat.

Anatomy (most important, follow exactly):
- Exactly four limbs: two thick hind legs and two wings. The wings are its only front limbs, like a bat or a pterosaur; no arms and no separate front legs.
- The hind legs attach at the hips, where the tail begins, like a Tyrannosaurus or a bird: the torso balances over the hips, with the neck forward and the tail back as counterweight. Clear empty space under the chest and shoulders.
- Each wing's arm bones run clearly from the shoulder along the front edge of the wing to the clawed wrist; nothing else hangs down from the shoulder.
- Long thick neck, heavy reptilian head with a deep jaw, long heavy tail.

Appearance:
- Thick, rough, overlapping scales: deep dark crimson on the back, neck, tail and legs, blending to a dull warm gold on the throat, chest and belly. The gold is scale colour, not metal.
- A crown of thick, branching, swept-back horns, ivory at the base and darkening to smoke-black tips. Gold-coloured ridges along the brow and jaw, like a battered war helmet.
- Bright amber, intelligent eyes.
- Wing membranes warm amber near the bones, darkening to deep crimson at the edges, with visible veins.
- Chipped scales and a few pale scars.
- Feeling: ancient, heavy, powerful and proud.

Pose: stands on its two hind legs only, legs slightly apart, both feet flat and fully visible under the hips. Body level and horizontal, like a bird standing with its wings spread. Both wings fully spread straight out to the sides, membranes open, huge, with a total wingspan about two and a half times the body length, realistic enough to lift its weight. Neck extended forward in a gentle curve, head level, mouth closed. Tail extended straight back, off the ground.

Image requirements:
- Three-quarter front view from slightly above, the entire creature including both wingtips and the tail in frame.
- Plain light-grey background, soft even studio lighting, no shadows, no text, no props.
- Photorealistic, like a high-end game creature model.
```
