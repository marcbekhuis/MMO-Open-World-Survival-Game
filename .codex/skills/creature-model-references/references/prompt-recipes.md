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


### Full creature reference set — October 2026

The Royal Dragon reference was retained as the studio-style anchor. Birds were skipped at the user's request. Treant, Stone Giant, and Slime hubs reuse their three form references. Each image below is one representative specimen; absolute size remains defined by the Markdown. Limbs were counted visually; locally hidden roots and thin surfaces remain the reconstruction limits noted below. Consolidated prompts include corrections, but have not been rerun as single prompts.

#### Wolf

Saved as `Assets/Creatures/Model-references/wolf-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Fur and the far upper leg attachments may need manual cleanup.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Wolf, real lean long-legged canine 0.85 m at shoulder, 1.6 m nose to rump plus 0.5 m tail. Exactly FOUR walking legs attached in fore and hind pairs; broad paws, deep chest, narrow waist, heavy neck ruff. Grey/brown/charcoal fur, pale belly and leg insides, dark saddle, subtle ear wear and pale scars, yellow eyes. Standing square with all four legs slightly staggered and clearly separated, head level, bushy tail relaxed to one side clear of legs. Use a higher camera to expose the far legs.
```

#### Ancient Deer

Saved as `Assets/Creatures/Model-references/ancient-deer-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Thin antler branches, fur, and blue markings require manual reconstruction.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Ancient Deer, majestic adult tundra deer, 3 m shoulder high and 4.5 m long, large branch-shaped 3 m antler span. Exactly FOUR long cloven-hooved legs, broad split hooves, deep chest, narrow high head. White silver thick coat, pale grey guard hairs, darker joint underfur, frost in mane. Faint blue mana veins along neck and flanks, subtle blue cracks in bone-grey wind-shaped antlers, faint calm blue eyes. Square stance, four legs slightly staggered all visible, tail clear. Entire antler crown visible.
```

#### Large Buffalo

Saved as `Assets/Creatures/Model-references/large-buffalo-model-reference.png`. Fix rounds: 1. Visually checked: 4 limbs/fin appendages. Fix: Forehead is only natural shaggy fur: no bone, scale, eye-like or ornamental growth between horns. Known weak spot: Long fur partly obscures upper legs; horn surface details are fine.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Large Buffalo, monumental yak/bison-shaped bovine, 4 m shoulder height, 6 m nose to rump; exactly FOUR columnar cloven-hooved legs, shoulder hump, low head, tufted tail. Broad horns 4 m tip to tip sweep outward then up and inward crescent, weathered ridges. Long river-damp wind-tangled shaggy fur over neck chest belly legs, muted brown black ochre cream, grey muzzle, mud to knees, gentle dark eyes and wet nose. Square stance, legs staggered far pair visible, shaggy fur not concealing feet, tail clear; entire horn span framed.

Final correction incorporated: Forehead is only natural shaggy fur: no bone, scale, eye-like or ornamental growth between horns.
```

#### Young Stone Giant

Saved as `Assets/Creatures/Model-references/young-stone-giant-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Small crystal seams and finger joints may fuse.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Young Stone Giant, humanoid of living stone 5–15 metres tall. Exactly TWO arms at shoulders and TWO legs at hips, open stone hands, broad torso, block head ridged brow. Coarse grey granite legs and lower body, darker basalt arms shoulders, pale quartz chest bands. Few small blue-white mana crystals along spine and knuckles, bright heart seam slightly above torso midpoint. Upright neutral A-pose, arms 45 degrees away from torso, hands open, legs apart, body stone throughout; no held rocks.
```

#### Adult Stone Giant

Saved as `Assets/Creatures/Model-references/adult-stone-giant-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Dense shoulder/knuckle crystals and layered rock may fuse.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Adult Stone Giant, humanoid of rock 20–50 metres tall. Exactly TWO arms at broad cliff-like shoulders and TWO legs at hips, stone hands. Knobs and ridges on forearms, rough shale and quartz growths on back and shoulders, dark basalt legs, lighter stratified torso, blunt weathered block head. Plentiful large violet and blue-white crystals: spine shoulder seams, knuckle clusters, bright heart band HIGH on upper chest. Upright neutral A-pose, arms 45 degrees out, open hands clear, legs apart; crystal growths clear of joints.
```

#### Elder Stone Giant

Saved as `Assets/Creatures/Model-references/elder-stone-giant-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Terraced shelves and vegetation are likely to become solid masses.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Elder Stone Giant, 60–100 metre mountain colossus retaining exactly TWO arms and TWO legs. Arms are stepped terraced stone buttresses, legs broad pillars and shelf-like feet. Terraced slope back, crag brow, worn hollow face. Layered granite basalt shale quartz, moss alpine grass lichen wind-bent shrubs across back shoulders, light snow on highest ledges. Deep subtle violet blue-white mana seams at spine and chest, buried heart without exposed crystal core. Upright neutral A-pose with arms spread from body and both legs separated. Geological silhouette, whole growths in frame; no separate landscape.
```

#### Treant Sapling

Saved as `Assets/Creatures/Model-references/treant-sapling-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Fine branch fingers, leaf clusters and root toes are fragile.

```text

Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Wiry wooden biped 1–2 m tall, exactly TWO long flexible green-wood bough arms from top of narrow split trunk and TWO long root legs from base. Pale green-brown bark, lighter yellow split joints, leaves at head/shoulders, narrow oval knot-and-crack face with subtle sap glow; thin branch fingers and splayed root toes. Neutral A-pose upright, four limbs separated, fingers open, canopy growth distinct from arms. No held branches.
```

#### Treant Guardian

Saved as `Assets/Creatures/Model-references/treant-guardian-model-reference.png`. Fix rounds: 1. Visually checked: 4 limbs/fin appendages. Fix: Bark nearly black at roots/lower body, fading through dark charcoal brown to grey shoulders. Known weak spot: Branch fingers, root clusters and shelf fungus can fuse.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Heavy wooden biped 3–5 m tall. Exactly TWO heavy shoulder bough arms with long branch fingers and TWO root-column legs ending gripping root feet. Thick twisted split trunk resembles ribcage, low knotted-wood crown head embedded at shoulders with NO neck. Dark furrowed bark near-black roots to grey shoulders, moss shelf fungus old empty nests, subtly glowing sap in face cracks and plate seams. Neutral A-pose, long arms away from torso, legs separated, branch fingers readable.

Final correction incorporated: Bark nearly black at roots/lower body, fading through dark charcoal brown to grey shoulders.
```

#### Treant Elder

Saved as `Assets/Creatures/Model-references/treant-elder-model-reference.png`. Fix rounds: 1. Visually checked: 4 limbs/fin appendages. Fix: Zoom out enough to show the entire leafy branch crown and every twig tip with grey margin. Known weak spot: Leaf crown, hanging moss and hollow wood are difficult to reconstruct.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Ancient wooden giant 8–12 m tall, exactly TWO trunk-thick bough arms reaching knees and TWO flared root-pillar legs. Grey-brown deeply cracked bark, hollows and shelf fungi, hanging shoulder moss, crown of live branches bearing leafy canopy, deep dark facial knots with restrained sap glow. No separate animals. Neutral A-pose with limbs separated, branch crown kept clear of arms, hands open.

Final correction incorporated: Zoom out enough to show the entire leafy branch crown and every twig tip with grey margin.
```

#### Passive Slime

Saved as `Assets/Creatures/Model-references/passive-slime-model-reference.png`. Fix rounds: 0. Visually checked: 0 permanent limbs. Known weak spot: Single-image geometry cannot reproduce transparency or suspended inclusions reliably.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Small resting limbless low rounded gel dome 0.3–0.8 m wide, transparent cool blue-green gel with swallowed pebbles leaves seeds visibly SUSPENDED INSIDE. No face, no eyes, no bones, no permanent limbs, no tentacles. One simple asymmetric dome silhouette, tiny temporary gel lobes at base. Three-quarter slightly above, clear internal inclusions, empty backdrop.
```

#### Neutral Slime

Saved as `Assets/Creatures/Model-references/neutral-slime-model-reference.png`. Fix rounds: 0. Visually checked: 0 permanent limbs. Known weak spot: Transparency and swallowed debris need separate material/interior work.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Resting dense amber gel dome 2 m wide 1.5 m high, orange yellow tones, thick semi-translucent layers with slow bubbles. Swallowed bones hide scraps half-dissolved small gear suspended entirely inside, do not protrude. No face no eyes no permanent limbs. Single heavy connected silhouette, a few SHORT thick gel pseudopod lobes around base separated clearly; no arms/hands.
```

#### Aggressive Slime

Saved as `Assets/Creatures/Model-references/aggressive-slime-model-reference.png`. Fix rounds: 1. Visually checked: 0 permanent limbs. Fix: Every swallowed fragment is entirely submerged beneath continuous smooth red gel, no debris protrudes. Known weak spot: Representative temporary pseudopod shape; internal core and debris need material work.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Resting siege-scale opaque dense red gel mass, at least 3 m wide, black around darker pulsing nucleus visible only as internal shadow. Rusted metal/rib fragments embedded entirely within gel, faint localized corrosion surface haze not obscuring contour. No face eyes bones as skeleton or permanent limbs. Single connected low heavy amorphous silhouette with TWO temporary broad tree-trunk-thick gel pseudopod projections to sides, separated clear; representative resting shape.

Final correction incorporated: Every swallowed fragment is entirely submerged beneath continuous smooth red gel, no debris protrudes.
```

#### Goblin

Saved as `Assets/Creatures/Model-references/goblins-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Tattered leather, finger gaps and oversized boot openings may fuse.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Single Raider goblin humanoid, 1.4 m tall 35–45 kg. Exactly TWO wiry arms from shoulders and TWO legs from hips, long fingers, sharp shoulders, oversized ears, narrow expressive face, hunched upright silhouette. Mossy grey-brown olive skin; patched leather rope belt mismatched stolen oversized boots, worn small buckles. No held weapons shield packs or props. Neutral A-pose arms 45 degrees away open hands, legs apart; mouth closed, bare head.
```

#### Minotaur


Saved as `Assets/Creatures/Model-references/minotaur-model-reference.png`. Fix rounds: 1. Visually checked: 4 limbs/fin appendages. Fix: Both bull horns sweep outward and distinctly forward; no coiled ram-horn loops. Known weak spot: Near arm-to-torso space is narrow; claws and fur need cleanup.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Bull-headed humanoid beast 2.8 m tall 500–600 kg, exactly TWO long massive shoulder arms ending clawed hands reaching knees and TWO legs ending split impact hooves. Enormous humanoid torso, bull neck head, horns sweeping FORWARD and OUT 1.5 m span. Bare dark brown-grey scarred hide on torso/limbs; short dark fur head neck shoulders; pale ivory horns darkening tips; black claws hooves. No clothes weapons armor equipment. Closed powerful jaw, old horn chips trap scars minor mud. Neutral A-pose hands open, feet apart, usual slight hunch, avoid graphic anatomy.

Final correction incorporated: Both bull horns sweep outward and distinctly forward; no coiled ram-horn loops.
```

#### Skeleton Archer

Saved as `Assets/Creatures/Model-references/skeleton-archer-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Hollow ribcage, individual bones, armour straps and finger bones may fuse.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Humanoid skeleton 1.8 m tall slender build, exactly TWO arms TWO legs, long finger bones, exposed ribs, cracked helm small breastplate forearm guards leather scraps. Cold blue threads through spine and arms, blue glowing eye sockets. Pale long bones of fingers/shins, dark red half-congealed marrow blood staining exposed ribs spine pelvis skull, restrained static residue no spraying. Neutral A-pose open skeletal hands arms angled 45 degrees away, legs apart. OMIT bow arrows quiver and all held props to show anatomy.
```

#### Skeleton Knight

Saved as `Assets/Creatures/Model-references/skeleton-knight-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Armour hides much of the internal skeleton; chainmail and tattered tabard are fine.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Broad armored humanoid skeleton 1.8 m tall, exactly TWO arms TWO legs, yellowed bones bound by thin cold-blue magic cords glowing faintly at joints. Heavy rusted pitted scratched plate over chain and leather, faded blue tabard under breastplate, skull behind visor with faint blue socket glow. Dark red half-congealed marrow residue at skull/rib/spine/pelvis and armor gaps; long arm/leg bones paler. Neutral A-pose open hands arms 45 degrees away, legs apart. OMIT sword shield and all held props.
```

#### Paralyzing Dragon

Saved as `Assets/Creatures/Model-references/paralyzing-dragon-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Far wing root overlaps neck; thin wing membranes need cleanup.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Slim jungle WYVERN 4 m nose-to-tail, tail nearly half length, hip height 1.2 m; exactly FOUR limbs: TWO hind legs at rear hips where tail starts, TWO wing-forelimbs from shoulders, wings are ONLY front limbs like bat/pterosaur. No separate front legs arms hands; clear empty space under narrow chest. Horizontal torso like standing raptor, two feet fully visible, wings spread straight sideways 5.5 m span, whip tail extended back clear, neck forward. Layered greens yellow-brown damp black leaf mottling, thin spear-like long head slit nostrils small jaw vent pores, glassy focused eyes, no invented horn crown. Mouth closed, no gas cloud. Frame entire wings and tail.
```

#### Four-Armed Monkey

Saved as `Assets/Creatures/Model-references/four-armed-monkey-model-reference.png`. Fix rounds: 2. Visually checked: 6 limbs/fin appendages. Fix: Tail descends to floor and runs to one side at toe/ankle level, well below hands with visible background gap. Known weak spot: Tail root is partly obscured at the rump; all four hands are separate.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Small jungle primate 1 m tall, exactly SIX limbs plus prehensile 1 m tail: FOUR equal-length slim arms in TWO stacked pairs (upper pair shoulders, lower pair middle torso just below ribs) and TWO short hind legs at hips. All four arms longer than body. Dark grey-brown short fur on back limbs tail, upright cyan crown crest, magenta cheeks, yellow forearm patches and yellow V chest. Large curious eyes. Upright neutral specimen stance: upper arms angled outward/up 25 degrees, lower arms outward/down 35 degrees, all FOUR open hands distinct, TWO feet planted apart. Tail arcs to side no crossing. Higher camera.

Final correction incorporated: Tail descends to floor and runs to one side at toe/ankle level, well below hands with visible background gap.
```

#### Bamboo Spider

Saved as `Assets/Creatures/Model-references/bamboo-spider-model-reference.png`. Fix rounds: 0. Visually checked: 8 limbs/fin appendages. Known weak spot: Far leg roots overlap locally; fibrous underside and thin leg joints need cleanup.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Eight-legged spider 6 m tall, exactly EIGHT extremely long 7 m slender segmented legs, ALL attach to small forepart cephalothorax, rise steeply outward then bend down to ground; body perched HIGH at top of cage. Raised bamboo-node ring joints muted green-yellow with dark scars and fine leaf-fibre bristles. Two-part compact body forepart 1.5 m long and round abdomen slightly longer; dark lacquered green brown pale straw mottled carapace. Small low eyes under ridge, compact mouthparts NO extra pincer arms. Fringe of PALE fibrous short coiled tendrils under abdomen, soft fibres distinct from eight rigid legs. Radial spread specimen pose with 4 legs left and 4 right, every leg visible separately, camera high 30 degrees, entire tall leg tips framed.
```

#### Swamp Spider

Saved as `Assets/Creatures/Model-references/swamp-spider-model-reference.png`. Fix rounds: 1. Visually checked: 8 limbs/fin appendages. Fix: Use high oblique camera about 55 degrees and fan four legs on each side; show every root-to-tip path with gaps. Known weak spot: Small mouthparts, sensory hairs and underside organ shadows are difficult.

```text

Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Mature pale cave spider, 1.8 m high at swollen abdomen, 4 m leg span 150 kg. Exactly EIGHT ivory long segmented legs ALL attached to SMALL front cephalothorax, swollen abdomen behind, dark small gripping claws at feet. Chalk-pale bite-scarred shell sparse irregular black wet needle sensory hairs at joints back and mouthparts. Glassy mismatched eye cluster over pale mouthplates, thin underside with bruised organ/egg shadows. No hatchlings external prey or egg props. Spread all eight legs radially, FOUR left FOUR right, higher 30-degree camera, clearly separate and countable.

Final correction incorporated: Use high oblique camera about 55 degrees and fan four legs on each side; show every root-to-tip path with gaps.
```

#### Kraken

Saved as `Assets/Creatures/Model-references/kraken-model-reference.png`. Fix rounds: 0. Visually checked: 10 limbs/fin appendages (eight arms and two feeding tentacles). Known weak spot: Some radial arm roots overlap locally; sucker cavities and feeding-pad hooks need cleanup.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Colossal plated cephalopod, 20 m long mantle; exactly TEN appendages attach in a ring BELOW head/eyes: EIGHT thick 35 m sucker-and-hook arms AND TWO slimmer longer 50 m feeding tentacles tipped broad hooked pads. Two large dark eyes; central hooked beak under head. Blue-black oil-slick skin pale scars shell mineral crust plated barnacled ridges, subtle bioluminescent lines. Omit external ropes wreckage harpoons for clean anatomy. Upright mantle, all TEN appendages spread RADIAL around base like specimen star, tails curling outward without crossings, distinct two longer thin clubbed tentacles. Camera high enough to count ten attachments, entire tips framed.
```

#### Flying Leviathan

Saved as `Assets/Creatures/Model-references/flying-leviathan-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Far small fin root is partly obscured; thin wing-fin edges need cleanup.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Air-adapted whale 80 m long, 110 m wing-fin span, broad back relatively flat. Exactly FOUR separate fin appendages: TWO immense broad shoulder WING-FINS and TWO much SMALLER pectoral steering fins farther FORWARD near head, PLUS a tail ending HORIZONTAL fluke. NO legs arms horns reptilian scales. Broad blunt whale head wide mouth line, tapering whale body. Pearl grey/pale blue cloud-white back upper wing-fins, faint luminous constellation mana markings belly, embedded crystals at throat spine fin roots, subtle wind scars. Floating horizontal neutral pose, wing-fins fully extended sideways, two small forward steering fins separately spread clearly forward of wing roots, tail extended rear at slight side angle so fluke readable. Slightly elevated three-quarter front camera.
```

#### Sandworm

Saved as `Assets/Creatures/Model-references/sandworm-model-reference.png`. Fix rounds: 0. Visually checked: 0 permanent limbs. Known weak spot: Long body is foreshortened; inter-ring recesses and mouth interior need cleanup.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Colossal limbless segmented tube 150 m long and 12 m diameter, 10 m blunt head/mouth, tapering narrow tail. ZERO limbs, ZERO eyes, no horns. Overlapping sun-baked sandy tan scarred ridged armor rings, pale raw skin in inter-ring gaps. Circular mouth lined with broad grinding plates NOT needle teeth. FULL body lying in loose elongated S curve with no crossing coils, head slightly raised mouth relaxed partly open JUST enough to show grinding plates (override closed mouth). Entire extreme length and tail in frame, elevated camera, no dunes sand effects or scenery.
```

#### Mermaid

Saved as `Assets/Creatures/Model-references/mermaid-model-reference.png`. Fix rounds: 1. Visually checked: 2 limbs/fin appendages. Fix: True upper body and face humanlike, slick grey amphibious skin, pale lidless eyes, wide closed fine-toothed mouth; no reptilian facial muzzle or full-body scale covering. Known weak spot: Thin head/arm/tail fins and gill slits may fuse or thicken.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: TRUE physical form of adult Mermaid sea predator 2.5 m head to tail. Humanoid lean upper torso with exactly TWO arms, no legs no wings, joined to ONE long muscular fish tail with spread tail fin. Slick GREY skin, wide CLOSED fine-toothed mouth, pale lidless eyes, gill slits at chest sides, long curved finger claws, thin fin frills on both head sides, dull cold scales on tail. No glamour rainbow colours jewelry or shells. Nonsexual creature anatomy with smooth neutral chest plates/scales, no human sexual detail. Upright hovering neutral A-pose arms 45 degrees away, clawed hands open, tail extends down gentle single curve no coils, all fins separated.

Final correction incorporated: True upper body and face humanlike, slick grey amphibious skin, pale lidless eyes, wide closed fine-toothed mouth; no reptilian facial muzzle or full-body scale covering.
```

#### Titan Turtle

Saved as `Assets/Creatures/Model-references/titan-turtle-model-reference.png`. Fix rounds: 0. Visually checked: 4 limbs/fin appendages. Known weak spot: Far rear leg upper attachment is hidden by shell; shell vegetation is unlikely to remain distinct.

```text
Create a photorealistic high-end game-creature 3D model reference: ONE creature, full body, neutral rig-friendly pose. Use the attached Royal Dragon ONLY as an anchor for photographic rendering, plain light-grey studio background and soft even lighting; do not copy dragon anatomy or colours. Every appendage fully inside frame with 5% margin, every limb visible separately with negative space, three-quarter front view from slightly above (adjust higher for many limbs). No scenery, no people, no scale markers, no text, no weapons or external props, no hard cast shadows. Mouth closed unless mouth anatomy otherwise cannot be shown.

Subject: Colossal ancient LAND TORTOISE, 50 m tall shell 90 m long. Exactly FOUR thick columnar legs with broad feet heavy blunt toes, short tail at rear, fixed nonretractile head thick neck. NOT sea turtle no flippers. Grey-green fissured stone-like skin moss mud barnacle growths joints, dark weathered brown-green dome shell plates with earth trapped between scutes, grass shrubs tree roots and small trees covering upper shell, small rainwater basin. NO settlements buildings people props waterfall scenery. Square quadruped stance, all four legs visible with gaps beneath shell, head forward level, short tail visible off-side, elevated camera shows shell-top vegetation and both far legs.
```

### Mermaid — charmed appearance revision

Saved as `Assets/Creatures/Model-references/mermaid-model-reference-v2.png` and now embedded in the Mermaid entry. This supersedes the earlier accepted reference for the displayed model image: the user requested the beautiful feminine glamour appearance, not the grey predatory true form. Generation used the Wolf only as a neutral studio-render anchor to avoid reptilian surface drift. Fix rounds after regeneration: 0. Visually checked: two arms, one fish tail, no legs or wings, every tip in frame. Known weak spots: long hair overlaps the far shoulder/upper arm; thin tail fins and attached pearl strands may fuse in image-to-3D reconstruction.

```text
Create a photorealistic high-end game model reference of ONE Mermaid in her CHARMED / GLAMOUR appearance, as seen by an enchanted observer. This appearance is an idealized BEAUTIFUL ADULT WOMAN with a fish tail. Use the attached Wolf reference ONLY for plain light-grey studio backdrop, soft even lighting and realistic surface quality; do not borrow its subject or anatomy.

Anatomy: ordinary human-sized FEMALE upper body with a clearly feminine human face, graceful natural proportions, soft shoulders and slender arms. Exactly TWO human arms at shoulders, open human hands. One long muscular fish tail replaces the entire lower body, ending in a broad elegant spread fish fin. NO legs, no wings, no masculine bodybuilder torso, no reptile head, no monstrous claws or facial spines. Total head-to-tail-fin length approximately 2.5 metres.

Appearance from the document: beautiful adult woman's face, long DARK hair, luminous healthy human skin, rainbow-bright iridescent fish scales catching light beautifully. Small pearl strings and a small crown of natural shells sit in the hair; pearls at the throat. Keep attached adornments delicate. Hair flows behind shoulders leaving both arms and the torso silhouette clear. A modest seamless covering of iridescent scales over the chest, tasteful nonsexual fantasy concept art; exposed arms and shoulders are smooth luminous human skin. Tail scales shimmer across the rainbow naturally, rich aquatic iridescence rather than metal armour. Gentle inviting expression, mouth closed, elegant feminine beauty. She should look entirely beautiful and human above the tail to an enchanted viewer, with no hint of the grey predatory true form.

Pose: upright hovering neutral A-pose, both arms angled down about 40 degrees away from body, open hands fully visible and separate. Tail extends down into a single gentle side curve, no coils, fin fully spread. Entire body, hair, fingers and every fin tip inside frame with 5% plain margin. Three-quarter front view about 35–45 degrees, camera just slightly above. ONE standalone subject, no water, rock, scenery, other characters, text, border or harsh cast shadow. Photorealistic human skin, individual dark hairs, nacre pearls and detailed rainbow fish scales; high-end realistic game creature render.
```

### Mermaid — feminine uncharmed form

Saved as `Assets/Creatures/Model-references/mermaid-model-reference-v3.png`, embedded alongside the approved charmed version. The approved charmed image anchored the feminine face and proportions; the old rejected true-form design was not reused. One visual correction widened the fine-toothed mouth. An initial generation was rejected by the image safety system, then regenerated with an opaque grey torso wrap; the wrap is presentation coverage, not a change to the canonical physical description. Visually checked: two arms, one fish tail, no legs or wings, separated hands, all tips in frame. Known weak spots: far head-frill root and shoulder overlap dark hair; fine claws and thin fins may fuse, and the wrap hides part of the chest-side gills.

Consolidated prompt (includes the mouth correction; not rerun as one prompt):

```text
Generate one full-body photorealistic game-creature reference of an ADULT FEMALE MERMAID in her uncharmed true form. Use the attached Mermaid ONLY as a reference for the feminine face proportions, slim shoulders, silhouette, neutral arm pose, long fish-tail shape, plain grey backdrop and studio lighting. Change the appearance to an eerie aquatic predator. The character is fully clothed across the torso: an opaque, plain matte-grey sleeveless fitted wrap covers from the collarbones continuously through the waist, without cutouts, sheer fabric, cleavage or bare abdomen. This is a practical neutral creature modelling reference.

Anatomy: lean humanlike upper body with a feminine face and narrow natural shoulders, exactly TWO arms with open hands and long curved dark finger claws, ONE muscular fish tail ending in a spread fin. No legs or wings. No bodybuilder musculature or masculine jaw, no reptilian muzzle.

True appearance: smooth slick cold GREY skin on face and arms. Humanlike feminine facial structure, subtly wide mouth with rows of fine sharp teeth just visible at slightly parted lips, pale lidless grey-white eyes, cold watchful expression. A thin translucent grey fin frill spreads from each side of the head. Damp long dark hair swept back clear of both frills and shoulders. Small gill slits visible on either flank just below the arms at the edge of the wrap. The tail has dull cold grey-blue scales, a pale underside and strong swimming mass. No rainbow sheen or gold. Remove the pearls, shell crown and jewelry.

Maintain the upright neutral hovering A-pose, arms down/out at about 40 degrees with fingers separate, tail extended down and then a gentle side curve, all fins and claws fully visible within frame. Entire subject with small margin, three-quarter front view slightly above. Plain light-grey seamless studio background, even soft light, realistic wet skin and dull fish scales, high-end game render. No scenery, water, props, text, other characters, harsh shadows.

Mouth refinement: widen the mouth horizontally to about one and a half times its ordinary human width, extending its corners subtly toward the cheeks. A cold predatory slit just parted to show many tiny fine pointed teeth; retain feminine cheeks, chin and nose. No large fangs or smile.
```

### Mermaid — frightening uncharmed revision

Saved as `Assets/Creatures/Model-references/mermaid-model-reference-v4.png`. Replaces v3 in the Mermaid entry; the approved charmed v2 stays alongside it. The user found v3 too beautiful and human, so one redesign transformed the head and upper-body surfaces into an inhuman aquatic predator while retaining lean feminine proportions: large pale lidless eyes, reduced nose, broad fine-toothed jaw, mottled slick grey skin, prominent chest-side gills, head frills and long curved claws. Fix rounds: one upper-body redesign; no further corrections. Visually checked: two arms, one fish tail, no legs or wings, separated hands and all tips inside frame. Known weak spots: the far head-frill root partly overlaps the head; hair, thin fins, teeth and claws may fuse. The opaque torso wrap remains presentation coverage rather than a change to the creature's canonical description.

Final prompt:

```text
Redesign the UPPER BODY AND HEAD of this uncharmed Mermaid into a frightening, unmistakably INHUMAN deep-sea predator. The current image still looks like a beautiful woman in grey makeup; completely replace that pretty human face and healthy-looking skin. Keep the lower fish tail, overall full-body framing, neutral separated-arm reference pose, studio lighting and grey background identical. This species is female, so retain a SLENDER narrow-shouldered female skeletal silhouette, but beauty is gone. No masculine bodybuilder anatomy.

Upper form: gaunt, forward-reaching neck; lean sinewy arms and narrow torso; slippery cold grey amphibious skin with mottled slate undertones, pallid marbling and visible fine dark veins. Angular sunken cheek hollows and an eerie almost-fish skull. Humanlike underlying upper-body skeleton, visibly alien surfaces and proportions. The torso remains fully covered by a plain opaque dark-grey practical wrap from collarbones to waist, with no cleavage, bare abdomen or transparent material. No elegant dress styling or jewellery.

Face is the key: TWO large milky PALE LIDLESS fishlike eyes set in raw-looking but intact socket rims, absolutely no eyelashes, eyelids, makeup or attractive eyebrows. A flattened reduced nose with small breathing slits rather than a lovely human nose. An unnaturally WIDE horizontal jaw opening across almost the entire lower face, corners extending toward ears; thin barely-there lips, dense rows of very fine needlelike teeth clearly visible in the slightly OPEN mouth. Hungry animal expression, no smile, no large vampire fangs. A small narrow chin beneath the terrifying wide mouth, sunken facial planes; not a male humanoid, not a glamorous vampire or elf, not a reptile snout. No blood, open wounds or gore.

Thin translucent grey fin FRILLS flare from BOTH SIDES of the head, ragged weathered edges and visible cartilage spokes. Replace the styled lush hair with only sparse stringy wet DARK strands swept backwards, exposing the head and fin roots. Multiple pronounced dark GILL SLITS along each side of the ribcage beneath the arms, very clearly readable beside the opaque wrap. Hands: long slender segmented-looking fingers tipped in long curved BLACK CLAWS, all fingers separated, two hands only. The grey scaled tail stays dull and strong, no rainbow colour.

ONE complete adult creature, exactly TWO arms and ONE fish tail, no legs or wings. Photorealistic horror game creature reference, neutral A-pose with every claw and fin tip inside frame and margin. Keep the tail shape, fin spread, background, camera and full-body composition from the input. The result should feel like an alien aquatic hunter whose beautiful appearance was an illusion, rather than a human actress with accessories.
```

### Mermaid — gill anatomy correction

Saved as `Assets/Creatures/Model-references/mermaid-model-reference-v5.png`, replacing v4 in the Mermaid entry beside charmed v2. Fix rounds for this revision: two. The first soft-flap edit still looked like stacked ribs; restoring continuous flank skin and using a compact bank of four narrow near-vertical curved shark-like slits removed the exposed-rib reading. Visually checked: two arms, one fish tail, no legs or wings, all tips in frame, visible gills set into intact grey skin. Known weak spots: the far-side gills and head-frill root are partly occluded; gill recesses, fine claws and fin membranes may need manual reconstruction.

Consolidated prompt, preserving the v4 design with the final gill correction (not rerun as a single prompt):

```text
Redesign the UPPER BODY AND HEAD of this uncharmed Mermaid into a frightening, unmistakably INHUMAN deep-sea predator. The current image still looks like a beautiful woman in grey makeup; completely replace that pretty human face and healthy-looking skin. Keep the lower fish tail, overall full-body framing, neutral separated-arm reference pose, studio lighting and grey background identical. This species is female, so retain a SLENDER narrow-shouldered female skeletal silhouette, but beauty is gone. No masculine bodybuilder anatomy.

Upper form: gaunt, forward-reaching neck; lean sinewy arms and narrow torso; slippery cold grey amphibious skin with mottled slate undertones, pallid marbling and visible fine dark veins. Angular sunken cheek hollows and an eerie almost-fish skull. Humanlike underlying upper-body skeleton, visibly alien surfaces and proportions. The torso remains fully covered by a plain opaque dark-grey practical wrap from collarbones to waist, with no cleavage, bare abdomen or transparent material. No elegant dress styling or jewellery.

Face is the key: TWO large milky PALE LIDLESS fishlike eyes set in raw-looking but intact socket rims, absolutely no eyelashes, eyelids, makeup or attractive eyebrows. A flattened reduced nose with small breathing slits rather than a lovely human nose. An unnaturally WIDE horizontal jaw opening across almost the entire lower face, corners extending toward ears; thin barely-there lips, dense rows of very fine needlelike teeth clearly visible in the slightly OPEN mouth. Hungry animal expression, no smile, no large vampire fangs. A small narrow chin beneath the terrifying wide mouth, sunken facial planes; not a male humanoid, not a glamorous vampire or elf, not a reptile snout. No blood, open wounds or gore.

Thin translucent grey fin FRILLS flare from BOTH SIDES of the head, ragged weathered edges and visible cartilage spokes. Replace the styled lush hair with only sparse stringy wet DARK strands swept backwards, exposing the head and fin roots. Multiple pronounced dark GILL SLITS along each side of the ribcage beneath the arms, very clearly readable beside the opaque wrap. Hands: long slender segmented-looking fingers tipped in long curved BLACK CLAWS, all fingers separated, two hands only. The grey scaled tail stays dull and strong, no rainbow colour.

ONE complete adult creature, exactly TWO arms and ONE fish tail, no legs or wings. Photorealistic horror game creature reference, neutral A-pose with every claw and fin tip inside frame and margin. Keep the tail shape, fin spread, background, camera and full-body composition from the input. The result should feel like an alien aquatic hunter whose beautiful appearance was an illusion, rather than a human actress with accessories.

Final gill anatomy: override any rib-like treatment with SOLID smooth grey flanks and a compact bank of four slender near-vertical crescent-shaped gill slits on each upper flank below the arm, arranged side by side rather than stacked down the torso. Narrow supple skin lips, flat continuous skin between slits, no white bars, raised ribs, exposed skeleton or large holes. Keep the lower flank intact. Keep every other part identical.
```
