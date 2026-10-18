# Player Progression

## Playable Races

Players choose from three playable races, each with a clear playstyle identity without locking the character into a single role: the adaptable human, the agile and magically gifted elf, and the resilient, forge-bred dwarf. Race shapes the opening feel of a character and their cultural starting point, but it sets a lean rather than a ceiling, so a dwarven mage, an elven smith, or a human master of any one craft all remain viable with the right investment. The full treatment of each race, its strengths, its homeland, and how it plays against type, lives in [Races](Races.md); the stats and skills below are where a character grows beyond what their race gave them at birth. How a character is first created and brought into the world is covered in [New Player Experience](New-player-experience.md).

## Progression System

### Experience And Levelling

Players earn experience through the major activities the game wants to support: defeating creatures and bosses, crafting equipment and structures, completing quests, defending settlements, leading raids, exploring new locations, and discovering secrets. This keeps advancement connected to the full survival RPG loop rather than only to combat.
<!-- REVIEW(design-peer): The XP list omits trading entirely, yet the pure city merchant is sold as first-class — a trade-only player never levels and falls behind in Strength/carry capacity. Add an economic XP source (sales, arbitrage margin, fulfilled contracts) or state how a non-combat trader progresses. -->

There is no highest level. Each level asks for about eight per cent more experience than the one before, so the climb never stops but slows steadily. At the pace the first levels take, a character reaches level 50 after about a hundred hours of play, level 75 after several hundred, and level 100 only after thousands, so the levels of dedicated characters spread out through the seventies and eighties, and every level beyond that is a long, deliberate investment.

### Stat Point Allocation

Each level grants one stat point. Stats measure a character one capacity at a time, and every point has a single, clear effect, set out in the system that uses it:

| Stat | What it raises |
|---|---|
| **Health** | The health pool of [Health and Wounds](Health-and-wounds.md) |
| **Stamina** | The size of the stamina pool and how quickly it refills, in [Movement](Movement.md#stamina) |
| **Carry Weight** | Carrying capacity, against the burden tiers of [Inventory](Inventory.md#weight-and-strength-mechanics) |
| **Melee Force** | The muscle behind every strike, how quickly a weapon starts and stops, in [Melee Combat](Melee-combat.md#strength-stamina-and-technique) |
| **Speed** | The top speed of every gait, with each point giving less than the one before |
| **Handling** | Acceleration, turning at speed, the cost of a sprint, and how fast the arms can move a light weapon |
| **Mana** | The size of the mana pool and how quickly it refills, in [Magic](Magic.md) |
| **Spell Power** | The force of every spell a character casts, and which spells they can cast at all |
| **Fortitude** | Resistance to cold, heat, illness, poison, and the daze of a blow to the head |
| **Perception** | How far a character hears faint sounds and how readily they pick out tracks, blood trails, and hidden things |

Points are spent one step at a time, and a stat's next step costs more the higher it already stands. The first twenty steps in any stat cost one point each, the next twenty cost two, the twenty after that three, and so on, one point more for every twenty steps. No stat has a highest value, but every step is dearer than the last, so spreading points is efficient and specialising is a deliberate, expensive choice. A character of level 80 who puts every point into Melee Force reaches 46 steps in it; the same 80 points spread as 40 steps of Melee Force and 20 of Stamina buy 60 steps in all. Speed is the one stat whose effect also thins out: each point raises top speed by less than the one before, so no amount of investment takes a character much beyond a fifth faster than they began.

Race enters as a starting tendency, a handful of free steps in the stats its people lean toward, as [Races](Races.md) describes: a dwarf begins with steps in Health, Carry Weight, and Melee Force, an elf in Handling, Mana, and Perception, and a human with the same number to place wherever they choose.

### How Growth Is Recorded

A character's record holds what they earned and what they chose, never the numbers that follow from them. It stores the total experience the character has earned, the stat points they have spent in each stat, and the practice they have earned in each skill. Everything else is worked out from those whenever it is needed: the level from the experience and the levelling curve, the steps in each stat from the points spent and the cost of each step, the value of each stat from its steps and what a step is worth, and each skill's rank from its practice and the rank curve.

Because only the earned and chosen amounts are kept, every curve and every multiplier in this document can change without breaking a single character. If a step of Health is made worth more, or the cost of steps beyond twenty is lowered, or a server doubles the value of Carry Weight, every character lands exactly where the new rules put them the next time they are loaded, as if they had grown under those rules from the start. The one case that needs a rule of its own is a change that leaves a character with more points spent than their level now grants; that character's stat points are returned to them to spend again, free of the usual cost of a respec.

Every number in this section, the levelling curve's eight per cent, the cost of a step in each band of twenty, what a step of each stat is worth, and how quickly Speed's gains thin out, is a default. Official servers use the defaults, and the host of any other server can change them, as [Server Settings](Server-settings.md#official-and-community-servers) sets out.

### Customisation And Respec

Progression should support combat specialists, crafters, mages, survivalists, traders, explorers, and hybrids. It should equally support players who opt out of whole survival activities: a city-dwelling merchant or adventurer who never builds a base or crafts an item, living entirely by trade and combat, is a first-class way to play rather than a handicap, in line with the play-your-way principle reflected in [Economy and Trade](Economy.md). Respec options can exist through dedicated NPCs or costly services, but changing a build should feel like a meaningful decision rather than a frictionless menu action. Over time, a character's build should reflect both mechanical choices and the story of what that player has spent time doing.

### Requirements And Commitment

The best things in the game ask for a character who has built toward them. A weapon, a spell, or a specialist tool can carry requirements, and a requirement is a plain value: a stat a character must have reached and a skill rank they must have earned. A great war hammer of a rare metal might ask for Melee Force 45 and a rank of 60 in heavy hammers; an advanced fire spell might ask for Spell Power 40 and a rank of 50 in the spells it grows from. A character at or above every value can use the item; a character below any of them cannot. Simple things ask for little or nothing, so a stone maul, a plain sword, and the foundation spells are open to anyone on the first day, and the values climb with how demanding a thing is to use, not along a fixed ladder of tiers. Armour carries no requirements; its weight is its own limit, as [Armour](Armour.md) sets out.

The requirements are what make a build mean something. A character built as a mage cannot pick up a war hammer that asks for Melee Force 45 and start swinging it, and a heavy-weapon fighter cannot cast a spell that asks for Spell Power 40 because they found the book and wanted to try it. Nothing in the game is capped, so in time any character could meet any requirement, but the rising cost of each stat step and the slowing climb of every level make that time very long, and the time it would take is exactly the commitment the requirement measures. A dwarf who chooses to become a mage reaches the great spells by the same road as anyone else; what no character can do is have everything at once, which is why two characters deep into the game are rarely alike.

## Character Growth

Growth is not just mechanical; it is narrative. Race, stats, skills, [reputation](Reputation-system.md), and player choices shape how the world responds and what challenges a character can confidently face.

## Continue Reading

Continue with [Movement](Movement.md) for how Speed, Handling, and Stamina shape a character's pace, [Skills](Skills.md), [Magic](Magic.md), and [Reputation System](Reputation-system.md).

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
