# Actions

A character does one thing at a time with their hands and their attention. Swinging a sword, raising a shield, casting a spell, eating, drinking, drawing a weapon, or reaching into a pack are all actions, and a character performing one cannot begin another until it is finished or they have cancelled it. There is no swinging a sword while a spell leaves the other hand, no biting into a ration between parries, and no swapping a bow for an axe in the middle of a draw. The rule is what makes every action a decision: the moment spent eating is a moment not spent guarding, and a fighter who reaches for a potion mid-fight has chosen to be open while they drink it. Creatures live under the same rule, which is why a wolf that has bitten has to recover before it can bite again. This document sets out how actions begin, end, and give way to one another. The weighted strikes it governs are described in [Melee Combat](Melee-combat.md), and the body that carries every action in [Movement](Movement.md).

## One Action at a Time

Every action has a beginning, a body, and an end, and only one runs at once. A new action can begin only when the current one has completed or been cancelled and the hands are back in guard; reaching for another before then does nothing. The rhythm of a fight is therefore set by the weight of what each fighter holds rather than by how quickly they can press a button.

Movement is not an action. A character can walk, turn, crouch, and jump while performing one, within the limits the action sets: a heavy strike forbids the sprint and slows the body's turn as [Melee Combat](Melee-combat.md#directing-a-strike) describes, eating or drinking allows no more than a jog, and casting allows whatever its spell allows. Looking around is never limited by an action.

## Holding to Act

Actions are held, not pressed. The primary button, the left mouse button, performs whatever is in the character's hands for as long as it is held: a sword strikes, a readied spell gathers, food is eaten, a pick swings. The secondary button, the right mouse button, raises the guard: with a shield it blocks, with a weapon alone it holds the weapon across the body. Letting go of the button is how an action is cancelled, so a strike lasts exactly as long as its button is held. A quick tap begins a strike and stops it at once, which costs a dagger almost nothing and wastes a war hammer's whole wind-up, so a heavy weapon is swung by committing to the hold.

An action that completes while its button is still held begins again at once, as long as the conditions for it still hold. A fighter holding the primary button with a sword strikes, recovers, and strikes again for as long as their stamina lasts, choosing each new strike's direction with the mouse as it begins; with no new direction given, the next strike flows from where the last one ended, the way a cut from the right returns from the left. A character holding the button while eating takes bite after bite until the food is gone or they are full, and a caster holding a quick spell casts it again while their mana allows, while a charged spell is cast by letting go, like a bow, as [Magic](Magic.md#casting) sets out. Letting go during any of them stops the one under way and starts nothing new. If the primary button is let go and the secondary is held when the hands come back to guard, the guard goes up; nothing else waits to begin.

A guard is held the same way. Holding the secondary button raises the shield or blade and keeps it up, at the stamina cost of each blow it catches, and letting go lowers it. A guard that is still rising when a blow arrives turns it aside rather than catching it, which is the parry of [Melee Combat](Melee-combat.md#when-a-strike-lands), so a well-timed press is worth more than a guard held up all fight.

A bow is drawn by holding the primary button and loosed by letting go. Holding draws the string back to the anchor and keeps it there while the archer aims, and holding at full draw costs stamina for every moment it lasts, with the aim beginning to waver as the archer tires, so a shot is held only as long as it needs to be. Letting go looses the arrow with whatever draw it has reached, a full draw giving the full shot. Letting go in the first part of the draw, before the arrow is near enough to loosing to fly true, lowers the bow and wastes nothing but the time. A loosed arrow ends the action: the archer does not nock and draw again until the button is pressed anew, because the release is the shot.

Creatures act by the same rules. A creature that keeps pressing an attack strikes again as each strike completes, for as long as its stamina and its intent last, and its intent ending is its letting go.

## Ending an Action

An action ends in one of three ways. It completes, and its effect takes hold: the strike runs its arc, the spell is released, the food is eaten, the arrow is loosed. It is cancelled by the player letting go of its button, and what that costs depends on what was under way. Or it is broken from outside, by a blow that staggers the character, a fall, or a knockdown, which cancels it exactly as if the player had, with the same cost.

The cost of cancelling follows from what the action is. A strike is stopped by the physics of its weapon, cheaply and at once for a dagger and dearly late in a greatsword's arc, as [Melee Combat](Melee-combat.md#stopping-and-feinting) sets out. A spell cancelled before release spends the mana already gathered and has no effect, which is part of the counterplay every spell in [Magic](Magic.md) carries. Eating or drinking cancelled partway leaves the item partly consumed, with the matching share of its benefit. Drawing, sheathing, or swapping an item, cancelled partway, leaves the hands as they were. No cancellation is free of time: the hands still have to come back to the character's guard before anything new can begin.

## Hands, Items, and Readiness

What a character holds is part of what they can do. Changing it is an action of its own, and how long it takes follows from where the item is and how heavy it is. Drawing a sword from a belt is quick; unslinging a war hammer from the back takes longer; fetching anything from inside a backpack means opening the pack and searching it, which is slow and leaves both hands busy. A ration, a bandage, or a potion carried in a belt pouch can be brought to hand in a moment, while the same item readied straight from the pack costs a long, exposed action. Rearranging what is carried takes no time at all, as [Inventory](Inventory.md#reach-and-the-hotbar) sets out, so the cost of reach falls only on bringing an item to hand.

The hotbar of [UI and HUD](UI-and-HUD.md) shows what is within quick reach and chooses what to ready next; it does not skip the action of readying it. Selecting a different weapon while a strike is under way does nothing until the strike ends, and selecting it while idle begins the swap, which can itself be interrupted.

## Interacting with the World

Everything a character does to the world with their hands is an action too, begun with the interact key and held like any other. Quick interactions, opening a door, pulling a lever, picking up a sword from the grass, finish almost as soon as they begin. Timed ones last as long as the key is held: searching a corpse, opening a strange chest, harvesting a plant, working a lock, binding another character's wound. Letting go cancels them, and a blow that staggers the character breaks them, exactly as with a strike.

Searching is how a container is opened. A short held search crouches the character over a corpse or kneels them at a chest or a bundle on the ground, and once it completes the contents open in a window and move as freely and instantly as anything in the character's own inventory. The search is the exposed moment; while the window stays open the hands are busy and nothing else can begin, and stepping away or closing it ends the action. Stripping a body after a fight therefore costs the few seconds of the search and the attention it takes, in country where someone else may have heard the fight too.

Large things are picked up into both hands, and a character carrying a log or a stone block in their arms has no hand free for anything else until they put it down, which is itself a quick interaction. What becomes of items left lying in the world is set out in [Inventory](Inventory.md#items-in-the-world).

## Creatures

Creatures follow the same rule with their own actions: a bite, a swipe, a charge, a roar, feeding, or a spell of their own. A creature in the middle of one cannot begin another, so a pack wolf that has committed to a lunge cannot also snap at the player stepping round it, and a creature that has stopped to feed has lowered its guard in exactly the way a player who stops to eat has. The tells that warn of a creature's attacks are the beginnings of its actions, and the window after an attack is the end of one, which is why reading a creature is the same skill as reading another player.

## Continue Reading

Continue with [Melee Combat](Melee-combat.md) for the strikes this rule governs, [Magic](Magic.md) for the spells it governs, [Inventory](Inventory.md) for where items are carried and how quickly they can be reached, and [Movement](Movement.md) for what a body can do while an action runs.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
