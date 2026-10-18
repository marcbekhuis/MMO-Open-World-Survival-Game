# Movement

Every body in the world that walks, runs, and tires moves by the same rules. A player crossing a moor, a wolf closing on them, and the horse they ride away on all share one model of gaits, stamina, and momentum, and differ only in the numbers each body brings to it. That is what makes a chase readable: a player who has learned how their own legs behave has also learned how a wolf's do, and every decision about pace, from jogging the long road home to spending the last of a sprint on a ditch, carries over to every creature that might be on the other end of it. This document sets out that shared model, with the player's own body as its main example. The ways a player travels further and faster are gathered in [Travel and Mounts](Travel-and-mounts.md), and how the model is built in Unreal Engine 5 is set out in [Movement (Technical)](<Movement (Technical).md>).

## One Model for Every Body

A body moves through a short ladder of gaits, from a slow pace that rests it to a fast one that spends it. Each gait has a speed, a cost or a recovery in stamina, a weight of momentum, and a loudness. What a body is decides how many rungs its ladder has and what they are called: a person walks, jogs, and sprints, while a horse walks, trots, canters, and gallops, as [Creature Riding](Creature-riding.md#gaits-stamina-and-ground) describes. Whatever their names, every gait belongs to one of three roles. A recovering gait is the pace a body can hold while it gets its breath back. A travelling gait is the pace it holds for hours. A burst gait is the pace it can only afford for moments.

The roles are what the rest of the game reads. Exhaustion, overloading, and hard ground all act by taking away the higher roles, so the same rule that leaves a winded player able only to walk leaves a blown horse able only to walk, without either needing a rule of its own. Creatures choose their gaits from their own judgement, players choose theirs with the controls, and a mount takes its gait from its rider's request as far as its own state allows, but the body underneath answers to the same model in every case.

## Gaits on Foot

A person has three gaits. Holding forward breaks into a jog, the travelling pace that most of the world is crossed at, because walking everywhere by default would make long journeys a test of patience rather than of preparation. Walking is a deliberate choice: it is quiet, it rests the body faster than any other pace, and it is how a careful player moves through a thicket that may be hiding something. Sprinting is held rather than toggled, so that it is always a decision in the moment and never a state a player forgets they are in.

Crouching is a fourth way of moving rather than a fourth gait. It is slower than a walk and nearly silent, it rests the body as walking does, and it is the pace of stalking, of creeping up to a camp, and of slipping past a creature that has not yet noticed anyone.

The table gives the target values for an unencumbered character on good, level ground, the baseline every other number in this document adjusts.

| Pace | Role | Speed | Stamina | Noise |
|---|---|---|---|---|
| Crouch | Recovering | 1,0 metres a second | Recovers a full pool in about 20 seconds | Barely audible beyond a few metres |
| Walk | Recovering | 1,5 metres a second | Recovers a full pool in about 20 seconds | Heard at around 5 metres |
| Jog | Travelling | 3,5 metres a second | Recovers a full pool in about 90 seconds | Heard at around 15 metres |
| Sprint | Burst | 6,5 metres a second | Empties a full pool in about 15 seconds | Heard at around 35 metres |

Standing still recovers as fast as walking. A sprint is a little under twice a jog, which is enough to break contact with a pursuer of the same build or to close on one, and nowhere near enough to make travel on foot quick: a kilometre at the jog takes nearly five minutes, and that is the scale against which [Travel and Mounts](Travel-and-mounts.md) measures every faster way of moving.

## Stamina

Stamina is the short-term budget of effort, and every body has one pool of it. The same pool pays for sprinting, for jumping, for swinging a weapon and raising a shield as described in [Combat](Skills/Combat.md), and for climbing as described in [Travel and Mounts](Travel-and-mounts.md#climbing-and-verticality), so a player who sprints into a fight has already spent part of what the fight will ask of them. The gaits mirror the mount gaits of [Creature Riding](Creature-riding.md#gaits-stamina-and-ground). The recovering gaits refill the pool quickly, the travelling gait refills it slowly enough that a jogging player arrives with a full pool after a long road, and the burst gait drains it. Recovery begins after a short pause, about one and a half seconds after the last thing that spent stamina, so that a player cannot keep a pool topped up by alternating a step of sprint with a step of jog.

A body that empties its pool is winded. It is held to its recovering gaits, unable to jog or sprint, until the pool has refilled past a quarter, and then it is free again. The rule is the same for an exhausted mount and a tired wolf, and it is meant to bite: a player who runs themselves empty to escape and then finds the thing behind them still coming has made a real mistake, and the slow walk that follows is the cost of it. The body shows it first. Breathing grows loud and ragged as the pool runs low, the view sways with each stride, and the sound of a winded player carries further than their footsteps, so neither the player nor anyone hunting them needs a bar to know.

Refilling the pool is paid for with food and water, as [Survival](Survival.md#the-bodys-fuel) sets out, so a hungry or thirsty body refills slowly and a starving or parched one barely at all, and the cold and heat of the world press on the pool the same way. A mount ridden from dawn to dusk also builds a long-day weariness that lowers how full its pool can get until it has rested, as [Creature Riding](Creature-riding.md#gaits-stamina-and-ground) describes. The pool itself never becomes a second meter to tend; it is how those needs are felt in the legs.

## Momentum

Bodies carry their speed. Nothing in the world starts, stops, or turns instantly, and the faster and heavier a body is moving, the more of its momentum it has to spend to change what it is doing. Momentum is felt in four ways.

Starting and stopping take time. A walk or a jog reaches its pace in half a second and stops in a stride, so careful movement stays precise, but a sprint takes a couple of metres to stop, roughly two and a half metres from full speed, and a body cannot reverse out of a sprint on the spot. Load makes all of this heavier, as the section on carrying weight describes.

Turning costs speed at pace. The faster a body moves, the wider it has to turn, and a turn sharper than its speed allows has to be paid for by slowing down, as the section on turning below sets out. Chases are therefore decided by lines rather than reflexes. A pursuer with a faster sprint but a heavier body can be shaken by a player who knows to break across broken ground, and a player who sprints in a straight line keeps every bit of speed they have built.

A sprint builds. Breaking into a sprint gives most of its speed at once, and the last part comes only after about three seconds of straight running, so a long run-up is worth more than a stutter of short bursts and a turn that sheds speed also sheds the build. This is where the burst role earns its cost: a full-speed sprint is something a body commits to.

Slopes and ground shape every pace. Uphill slows a body and makes every gait cost more, about a tenth of the speed and a quarter more stamina for each ten degrees of climb, while a gentle downhill adds a little speed to the jog and the sprint. Past about forty degrees a slope is no longer walked at all; it is climbed or slid down. Ground works as it does for mounts in [Creature Riding](Creature-riding.md#gaits-stamina-and-ground). Roads and firm grass are fastest. Forest floor and scrub slow every pace slightly, and sand, mud, and shallow snow slow it by about a fifth. Deep snow and bog slow it by nearly half and allow no sprint at all. Scree and ice keep most of their speed but punish a sprint, and a body that sprints down a steep slope of loose stone or across ice risks a stumble that throws away its momentum at the worst moment. The biomes of [World Design](World.md#biome-variety) are where this is felt: a chase through the [Swamp](Biomes/Swamp.md) is not the same chase as one across the open [Plains](Biomes/Plains.md).

## Turning and Facing

Every body has a facing, the way its chest or its muzzle points, and that facing turns at a finite rate. Nothing in the world spins on the spot. How a body turns comes down to five qualities of its own, set separately for every kind of body: how quickly it can turn in place, or whether it can at all; the fastest it can ever turn while moving; its turning radius at an easy pace; how strongly speed widens that radius; and how readily it gives up speed to turn tighter than its pace allows.

Turning in place is a pivot, not a spin. A person standing still turns a full about-face in about half a second, stepping round as they do it. A wolf pivots on its forelegs in much the same time. A horse turns in place more slowly, swinging its quarters round, and a long-bodied creature that cannot pivot its own length has no turn in place at all: to face what is behind it, it has to walk a circle, which is the moment a hunter of such things waits for.

Once a body is moving, its turning radius takes over. At an easy pace a body turns on a tight circle, a person in well under a metre. As it speeds up the circle widens, and it widens with the square of the speed, as grip on the ground runs out. How strongly speed widens the radius is the quality that most separates one body from another. A person sprinting needs a circle of about five metres where they needed less than a metre at a walk. A wolf keeps a tight line at a trot but runs wide at full sprint. A heavy charger such as the [Minotaur](Creatures/Minotaur.md) turns almost as tightly as a person when it walks and hardly at all once its charge is built. A body asked to turn sharper than its radius allows has to brake to tighten the circle, so a right-angle cut at full sprint costs a person about a third of their pace. A charger is the opposite: it barely brakes, so it overshoots its target and comes round in a long arc.

A body moves best the way it faces. A person can sidestep at up to two thirds of a jog and backpedal at up to half of one, and can sprint only within about forty-five degrees of where they face, so running from something while watching it is slow and costly. Four-legged creatures cannot step sideways at speed at all; to change direction they turn and go. This is the other half of why sidestepping a charge works, because the person stepping aside moves at once while the charger has to turn its whole body to follow.

## Head, Body, and View

A player looks through their character's eyes, and those eyes sit in a head on a neck on a body. Moving the mouse turns the head, and within the head's reach, about eighty degrees to either side of the body's facing and freely up and down, looking around is instant. Turn the view further and the body has to follow: it pivots at its own turn-in-place rate to bring the head back within reach, so a quick look over the shoulder is instant, while a full look behind arrives a moment later, after the body has turned. Moving the mouse past the limit is never lost; the body keeps turning until the view arrives where the player asked.

Moving starts from the body's facing, not from the view. A player who looks off to one side and moves forward turns their body toward the view while the head comes back to the centre, and the pace builds along the new facing over that short turn, so they step off toward where they were looking instead of sliding there. While moving, the body keeps turning toward the view at the rate its pace allows. A sprinting player can glance back at a pursuer without breaking stride, because the head turns freely within its reach, but cannot swing their run round faster than their sprinting radius lets them.

What a player sees of themselves is what everyone else sees. Their own body is rendered fully in first person, legs, arms, and all, from the same body other players see, and its facing, its turning, the way it leans into a curve, and where its head is looking are part of the shared world rather than the player's private camera. Another player sees the head turn before the body follows, which makes a glance a readable tell: a traveller who keeps looking back over their shoulder is someone who knows they are being followed.

Creatures obey the same split. A creature's head turns within its own reach ahead of its body, and its eyes look where its head points, so a player directly behind a grazing animal beyond the reach of its head is outside its sight until it turns, while one at the edge of its view is seen the moment it glances round.

## Carrying Weight

The burden tiers of [Inventory](Inventory.md#weight-and-strength-mechanics) act on movement through the gait roles and through momentum, so weight is felt in the body rather than only seen as a slower number. Up to three quarters of a character's capacity, load costs nothing. Approaching the limit, from three quarters to the full capacity, every pace is slightly slower and every start, stop, and turn slightly heavier, and stamina drains a little faster. Over the limit, up to a quarter beyond capacity, the burst role is lost: the character can jog but not sprint, the jog itself is slower, and every gait costs half again as much stamina. Severely overweight, beyond that, the character can only walk, cannot jump, and risks a stumble on any real slope; at half again their capacity they cannot move at all until they drop something.

Because each tier takes away a role rather than shaving a percentage, the decision about what to carry is a decision about what a player will be able to do if something goes wrong. A trapper hauling pelts home at the limit can still jog, but the first sprint they reach for will not be there.

## The Character Behind the Numbers

The stats of [Player Progression](Player.md#stat-point-allocation) shape how a body moves. Stamina sets the size of the stamina pool and how quickly it refills. Handling sets how quickly a body reaches its pace, how hard it can turn at speed, and how much a sprint costs. Speed raises the top speed of every gait, but each point gives less than the one before, so a character who invests heavily is noticeably faster, and no investment takes them much beyond a fifth faster than they began. A fast character has a real edge in a chase on open ground; a chase through broken country is still decided mostly by stamina, turning, and the ground underfoot. Race enters only through the starting tendency it gives those stats, as [Races](Races.md) describes. Skills such as the climbing and survival disciplines of [Skills](Skills.md) can trim the stamina cost of particular movements, in the same spirit.

## Jumping, Crouching, and Falling

A jump is a short burst of effort. It costs a small part of the stamina pool, and a winded body cannot jump, which matters most when the thing it needs to clear is the last obstacle between it and safety. A jump clears a fence rail or a fallen trunk, not a wall. Jumping carries the body's momentum with it, so a running jump goes further than a standing one, and landing takes a moment of recovery that grows with the height of the fall.

Falls hurt. A drop of a few metres is taken in a stumble that costs speed; from about four metres a fall starts to wound, and from about twelve metres it can kill outright. The same rule applies to creatures, which is why a wolf pack will not follow a player down a cliff path that a careful climber can take, and why a rider thrown at the gallop, as [Creature Riding](Creature-riding.md) describes, takes the fall with all of the mount's speed behind it.

Crouching lowers the body, quietens it, and slows it to the crouched pace. It fits under low branches and through crawlspaces, and it is the stance from which a stalking player watches the ground ahead.

## Noise

Every gait has a loudness, and the creatures and NPCs of the world hear it. Crouching is close to silent, walking is quiet, a jog carries to around fifteen metres, and a sprint to twice that, with dry leaves, gravel, and shallow water making every pace louder and moss, sand, and fresh snow making it quieter. What a character wears and carries adds its own noise, the clank of plate and the rattle of a laden pack carrying well beyond the footsteps beneath them. This is how pace connects to the encounters described in [Creatures](Creatures.md): a player who jogs into a valley announces themselves to everything in it, while one who walks the last stretch may see a [Wolf](Creatures/Wolf.md) pack before it hears them. Heavy bodies also carry through the ground as well as the air, which is what the [Sandworm](Creatures/Sandworm.md) listens for.

## Creatures and Mounts

Creatures move by exactly these rules, with a profile of their own. A species decides its gaits and their numbers, its stamina pool, its weight of momentum, how it turns, and how it handles ground and slopes, and its behaviour decides which gait it uses when. A [Wolf](Creatures/Wolf.md) trots faster than a player jogs and sprints much faster than a player sprints, but its pool is shallow, so it outruns a running player over a short distance and then has to drop back to a trot to recover; a player who keeps their head, holds a jog, and saves their sprint for the moment a wolf commits can outlast a pack that a panicked sprint would have fed. A heavy charger such as the [Minotaur](Creatures/Minotaur.md) builds a sprint that is terrifying in a straight line and barely turns, so the counter to its charge is the same momentum rule a player lives under: step aside late, put a pillar or a tree in its line, and let the weight carry it past.

Predators read the same signs, and they read them on anything they hunt. A winded body cannot run, and every hunter in the world knows it: a predator that hears ragged breathing or sees a stride falter marks its owner as the weakest animal in reach, whether that is a player, a deer run to the end of its strength, a horse blown under its rider, or another creature limping away from a fight. A pack working a herd presses it into a run and waits for one animal to fall behind its breath, and a pack that has been circling a careful player at a distance closes in the moment that player sprints themselves empty. Predators know only what they perceive. A winded body's breathing carries further than its footsteps, but a player who goes still behind a rock to recover is far harder to read than one who staggers on across open ground. The sign cuts both ways, too: a wolf that has spent its sprint is winded like anything else, and the player who sees it drop back to a trot has a moment to press it or to slip away.

A mount is a creature whose gait is chosen by its rider. Everything the rider asks for passes through the mount's own judgement first, as [Creature Riding](Creature-riding.md) sets out, and the body that carries the request out is the same body described here, with the mount's own gaits, pool, and momentum. When a rider dismounts, they take their own body back with exactly the same rules.

## Continue Reading

Continue with [Movement (Technical)](<Movement (Technical).md>) for how the shared model is built in Unreal Engine 5, [Melee Combat](Melee-combat.md) for the weighted strikes the same bodies make, [Creature Riding](Creature-riding.md) for the mounts that use it, [Survival](Survival.md) for the needs that act on stamina, [Inventory](Inventory.md) for the weight that shapes it, and [Travel and Mounts](Travel-and-mounts.md) for the journeys it measures.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
