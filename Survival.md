# Survival

Survival is the pressure that turns a walk through the wilderness into a series of decisions. The world wants players to prepare, to choose routes, and to weigh whether they can afford to push on, and it creates that pressure through food, water, cold and heat, and the hazards of the country itself rather than through busywork. The guiding rule, set out among the design pillars in [README](README.md), is that survival exists to create decisions, not chores: a player should feel the cost of a long expedition without spending the game tending bars. The rule that makes that work is that the body pays for what it does. A character who stands guard at a campfire barely eats or drinks; one who marches all day, fights, and heals from the fight burns through their supplies, so survival pressure follows effort and distance rather than the clock. This document covers what a character has to manage to stay alive, and how hard those pressures press depending on where they are and how hard they are working.

## Survival as Decisions, Not Chores

The intensity of survival scales with distance from safety. Inside the ring of a great city, where a new character begins as described in [New Player Experience](New-player-experience.md), food, water, and a bed are trivially available and the pressures fade into the background, which is part of why a city merchant who never leaves the markets of [Economy and Trade](Economy.md) can play a full game without ever fighting the wilderness. Walk into the frontier and the same needs sharpen into real constraints: every meal and every litre of water carried has weight under the rules in [Inventory](Inventory.md), every night away from shelter costs something, and every biome adds a hazard of its own. The further a player commits, the more survival shapes what they can attempt, which is exactly the trade the design wants a player to feel when they decide how deep to go.

## The Body's Fuel

Food and water are the body's fuel, and what the body does decides how fast it burns them. A small amount goes simply to staying alive. Everything beyond that is paid for by effort: every gait above a walk, every strike, every swing of a pick costs food and water in proportion to the work, refilling stamina after spending it draws on both, and healing draws on food, so a fight that ends in a long recovery costs more than the fight itself. Heat makes the body sweat away its water faster, and cold makes it burn food to keep warm.

The result is a pace a player can read from what they are doing. As targets for a body of ordinary build in temperate country:

| Activity | A full stomach lasts | A full water supply lasts |
|---|---|---|
| Resting, standing guard, or working at a station | About a day of play | About half a day of play |
| Walking the road | About eight hours | About five hours |
| Jogging steadily through the wilds | About four hours | About three hours |
| Hard fighting or heavy labour | About an hour | Under an hour |

Healing from close to death costs about a quarter of a full stomach. Carrying more weight, climbing, and the heat of the [Scorching Desert](Biomes/Scorching-desert.md) all shorten the road figures sharply. Creatures live under the same rule, as the section on them below describes.

## Food and Hunger

Every food has a weight and a satiety, how much of the stomach it fills, and the skill of provisioning is carrying the most satiety for the least weight. Raw meat and foraged plants are heavy for what they give, and raw meat and some wild plants may carry illness. Cooked meals, prepared through the survival and artisan skills of [Skills](Skills.md) and the recipes of [Crafting](Crafting.md), fill more for their weight, and the better ones grant a short-lived benefit worth packing for: warmth on a cold march, faster stamina recovery, or a slower thirst in the heat. Eating is an action like any other under [Actions](Actions.md), never something done between sword strokes.

Food spoils. Fresh raw meat turns in a couple of hours of play and a cooked meal in several; bread and fruit keep a little longer. Dried, salted, and smoked food keeps for days, which is why it is what travellers carry, and cold slows every kind of spoiling, so a winter larder or a cellar keeps food far longer than a summer pack. Spoiled food fills little and sickens often.

Hunger is felt in stages. A fed character works at full strength. A hungry one, below about a quarter of a full stomach, refills stamina and heals more slowly, because there is little left to pay for either. A starving one, with nothing left, cannot refill stamina beyond the slow trickle of the body's last reserves, cannot heal at all, and slowly loses health, enough to kill within a few hours of play. Food is therefore the resource that ultimately limits how long a player can stay in the field, and provisioning a journey is one of the first real decisions survival forces.

## Water and Thirst

Water runs down faster than food, and much faster in heat or under hard work. It is drunk at streams, springs, wells, and rain barrels, and carried in waterskins and canteens that weigh what the water in them weighs, a kilogram to the litre, so a desert crossing becomes a calculation of how much water a body can haul against how far the next well lies. Running water from a clear stream is safe; water from still pools and the [Swamp](Biomes/Swamp.md) can carry illness unless it is boiled first.

Thirst works in the same stages as hunger, and faster. A thirsty character refills stamina slowly; a parched one cannot refill it at all, sees the world dim and swim at the edges, and loses health quickly enough to die within an hour of play. Drinking is an action, and a long drink from a stream is a moment spent kneeling at the water's edge, which is where predators and ambushers wait.

## Temperature and Exposure

The body keeps itself warm, and the world tries to change that. Every character has a body heat that the world pulls toward its own temperature, and how fast it pulls depends on everything around them: the air, which follows the biome, the season, the hour, and the weather of [Weather, Time, and Seasons](Weather-time-and-seasons.md); the wind, which carries heat away; wetness from rain, a river crossing, or the sweat of hard work, which carries it away far faster; shelter, which blocks wind and rain; and fire, which warms anyone close enough to feel it. Clothing and [Armour](Armour.md#weight-breath-and-sound) slow the exchange both ways, wool and fur against the cold and light, loose cloth against the sun, while bare metal draws heat out in the cold and bakes in the sun.

Between the extremes is a comfort band where nothing happens, and the Fortitude stat of [Player Progression](Player.md#stat-point-allocation) widens it. Outside the band, cold and heat each press harder the further the body is pushed. A chilled body burns food faster to keep warm and refills stamina more slowly; a cold one shivers, so the hands shake, aim wavers, and strikes lose their edge; a freezing one loses health, and a soaked traveller in a [Tundra](Biomes/Tundra.md) night wind without fire can be in danger within ten minutes, while one who is dry, dressed for the cold, and moving can walk through the same night. A warm body sweats away its water; a hot one tires quickly and loses stamina ceiling; an overheated one suffers heatstroke, sways, sees the world swim, and loses health, which can happen within half an hour on open sand at noon without cover or water. The danger shows on the body and in the view long before it kills, and the HUD of [UI and HUD](UI-and-HUD.md) shows body heat only while it is pressing.

Exposure is not a bar to be topped up so much as a condition to be managed by preparation and timing, which is why packing for the climate matters as much as packing food, and why the cold of the [Mountain Range](Biomes/Mountain-range.md) passes and the desert's bitter nights are planned around as carefully as its days.

## Fatigue and Rest

Fatigue is not the body tiring; that is what stamina and fuel are for. Fatigue measures the length of a play session, and it exists to look after the person playing as much as the character. A full bar runs down over about eight hours of play, whatever the character is doing, and refills while the player is away: in about two hours when they log out anywhere, in about one when they log out in a bed or a proper shelter, and slowly while the character simply idles in the world, so a player who steps away from the keyboard without logging out still gets some back.

The bar costs nothing until it is nearly empty. As it runs low the character visibly tires, yawning and moving heavily, and the experience and skill gains of [Player Progression](Player.md) fall away, down to a small fraction once the bar is empty, so a long session stops advancing a character long before it harms them. Only after a further stretch of play past empty does the body tire for real: the stamina ceiling drops and stamina refills slowly, a plain signal that it is time to stop. The durations are server settings, as [Server Settings](Server-settings.md#world-rhythm) describes, so a server can be gentler or stricter. Beds and shelters keep a real value in all this: they are the fastest way to come back rested and, outside the safe cities, the safest place to leave a body while the player is away.

## The Logged-Out Body

A character whose player logs out stays in the world, asleep, as [Death and Loss](Death-and-loss.md#logging-out) sets out, and its needs stop with it. A sleeping body uses no food or water, takes no harm from heat or cold, and its carried food does not spoil, so nobody starves or freezes by being away. The body itself is still in the world, and outside the safe areas of NPC cities it can still be killed and looted, which is the risk that makes where a player logs out a decision.

## Breath

Breath is the shortest clock in the game, and it runs only where there is no good air to be had. It is not a standing meter: a character breathing normally never sees it, and the HUD shows it only while it is draining. Underwater it starts to fall the moment a swimmer goes under, whether they are diving on a wreck off the [Coast](Biomes/Coast.md) or pushing through a flooded sump in the [Deep Caverns](Biomes/Deep-caverns.md), and it refills as soon as their head clears the surface. High in the open sky, above the highest peaks and the floating islands, the air grows too thin to live on and drains breath in the same way, faster the higher a flyer climbs, as [Flight](Flight.md#weather-and-altitude) describes. On the high passes of the [Mountain Range](Biomes/Mountain-range.md) thin air only shortens a climber's stamina. The air that suffocates lies above them, where only flyers go.

The body warns before it fails. Breathing turns loud and ragged, the heartbeat thuds in the ears, sound dulls, colour drains from the view, and the edges of sight close in. When breath runs out, the character passes out. Underwater that means drowning unless someone hauls them clear; in the air it means falling. Creatures have breath of their own, and how long each one can hold it is part of its nature.

## Wounds, Illness, and Recovery

Beyond the standing needs, the hazards of the world act on a character directly. Serious wounds from the brutal combat described in [Content and Tone](Content-and-tone.md) linger until they are treated, so a hard fight survived can still leave a player limping home, and the bandages, salves, and remedies that mend them come from the survival and crafting trades. How blows become wounds, how wounds bleed and hamper the body, and how they heal is set out in [Health and Wounds](Health-and-wounds.md). Particular biomes carry particular afflictions: the [Swamp](Biomes/Swamp.md), above all, breeds fevers and rot that punish the unprepared, and spoiled food and foul water carry sickness anywhere, turning illness into a hazard a careful traveller plans around. These are pressures the world applies rather than bars the player maintains, and surviving them is a matter of treatment and avoidance rather than constant upkeep.

## Creatures

Creatures eat and drink by the same rule: effort burns their fuel, and a hungry or thirsty creature goes looking for more. Grazers move with the grass and the seasons, predators hunt when they are hungry and rest when they are fed, and every creature comes to water, most often at dawn and dusk, so a watering place is where the wilderness gathers and where a hunter waits. A predator that has fed well is less likely to press an attack than one that has not eaten in days, which makes the state of a creature's belly part of the information [Creatures](Creatures.md) are written to give. The food and water of a tamed creature are part of its keeping, under [Taming and Control](Taming-and-control.md).

## The Survival Skillset

Everything above rewards investment in the survival disciplines of [Skills](Skills.md): navigation that keeps a traveller from getting lost, campcraft that makes a night in the open safe, cooking that turns raw food into something worth carrying, weather resistance that blunts exposure, and tracking that turns the wilderness into a readable place. A character who has practised these skills can go further on less and weather conditions that would turn back the unprepared, so survival is not only a tax on play but a specialisation a player can lean into, the foundation of the self-sufficient frontier life set against the city merchant in [Player Progression](Player.md).

## Continue Reading

Continue with [Weather, Time, and Seasons](Weather-time-and-seasons.md) for the conditions that drive exposure, [Crafting](Crafting.md) for the food and remedies that answer it, [Inventory](Inventory.md) for the weight that makes provisioning a decision, and [Movement](Movement.md#stamina) for the stamina that food and water pay for.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
