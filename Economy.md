# Economy and Trade

The world runs on a working economy from the very first hour, and players make it richer rather than making it from nothing. NPC vendors and craftsmen already buy, sell, and produce goods of their own, so trade has a floor and a pulse before any player lifts a finger, and what players add on top — their gathering, crafting, and trading — is the supply, specialization, and competition that move prices and give the whole system its depth. This document sets out both layers, how they interact, and how the design keeps wealth scarce enough to matter.

## The NPC Economy

Every settlement of any size has merchants who will buy from and sell to players and craftsmen who make goods of their own, from the tools a new character needs to the everyday gear of a working town. This baseline economy is real rather than a token gesture: a player can outfit themselves, sell what they recover, and stay supplied dealing with NPCs alone. Crucially, NPC prices are not fixed. They respond to supply and demand and to what players actually do, so a vendor flooded with iron pays less for the next bar, a town stripped of healing draughts charges more for what little remains, and a region's prices drift with its fortunes. The NPC economy is a living market in its own right, and it is the steady ground the player economy is built on.

### How NPC Prices Move

Every good has a base price in each region, set by what the land around it yields and lacks: iron is cheap under the mountains and dear on the plains, salt fish the reverse. These authored differences are deliberate, because the gap between two regions' base prices is what makes carrying goods worth the road. Trade then pushes each price away from its base, and time pulls it back, so a market disturbed by a week of heavy selling has largely recovered a few days after the selling stops.

A vendor always pays less for a good than it charges for the same good, and every sale of a kind it is already holding pays a little less than the one before. The price a vendor charges has a ceiling, so scarcity can make a good dear but never unobtainable. What a vendor pays has no floor. A player who sells the same thing to the same town again and again drives its price toward nothing, and a smith offered its fortieth wolf pelt of the week will take it for a few coppers, if it takes it at all.

Prices also read the whole of what a market is trading, not each good on its own. A vendor that buys one kind of item in bulk sees that item's price fall fast, while a market where many kinds of goods change hands in quantity stays steadier, each good dented by its own volume and every good nudged by the sheer weight of trade passing through. A caravan unloading a mixed cargo of hides, timber, and ore therefore gets better prices than one dumping a single commodity, and a town at the heart of a busy route is a calmer, deeper market than a frontier post where one hunter's haul can crash the price of meat for a week.

### Where the Market Lives

Each settlement's market is a ledger of its stock, its prices, and its recent trade, owned by the server that owns the settlement's region under [Server Architecture](Server-architecture.md) and persisted with the rest of that region's state. Nothing about a market needs a global simulator. Regions exchange only slow aggregate signals, a region's demand for a good summarised over hours rather than every sale, so neighbouring markets feel one another's gluts and shortages without ever waiting on each other. A server crash costs a market at most its record of the trades since its last snapshot, so its stock and prices can step back a little, but the coin and goods that changed hands in those trades are committed the moment each trade completes and never return, as [Server Architecture](Server-architecture.md#72-value-never-splits) requires. A region that migrates to another server takes its ledgers with it.

## The Player Layer

On top of that ground, players reshape the economy without replacing it. The gatherers, crafters, and artisans of the [Skills](Skills.md) and [Crafting](Crafting.md) systems can produce goods in quantities and qualities NPCs do not, undercut a vendor's price, flood a market to drive a good down, or corner a scarce material to drive it up. Player shops and stalls raised through the [Building System](Building-system.md), the markets that gather around great cities and trade hubs, and deals struck directly on the road or in a guild hall all sit alongside the NPC vendors as places to trade, usually offering the keener price precisely because players compete for it. The result is that NPCs anchor the baseline while players set the value of almost everything at the margin: it is the player layer that decides what a thing is really worth.

## Many Ways to Make a Living

Because the NPC economy stands on its own, trade is a complete way to play rather than a support activity bolted onto survival. A player can live entirely inside the cities and their markets, buying low and selling high between NPCs and other players, running goods between regions where prices differ, and never once building a base or crafting an item, and still have a full game in front of them. This is the economic face of the design's wider commitment to letting players choose how they live in the world, set out in [Player Progression](Player.md): the city merchant and the self-sufficient frontier crafter are equally first-class lives, not a real way to play and a lesser one.

A merchant who never leaves the city walls still profits from the road, because they take its risk with their coin rather than their body. They post haul and supply contracts at a city's exchange: so many bars of iron delivered to this warehouse by this date, paid on arrival. Other players take those contracts up, and so do NPC carters for a steeper fee and a slower journey. Merchants fund caravans outright for a share of what the cargo fetches, or insure another trader's load against a premium and pay out when it is taken on the road. Inside a single hub they make markets, holding stock through a glut to sell into the shortage that follows, and standing ready to buy what a returning expedition needs to unload in a hurry. A fulfilled contract and a realised margin are also how such a player earns experience, as [Player Progression](Player.md) sets out, so the counting-house is a path of advancement as well as of wealth. The road's dangers reach this merchant as a lost investment, a paid-out claim, or a contract that falls through, never as a stripped corpse in a ditch.

## Trade Routes and the Weight of Goods

Because every item carries real weight under the rules in [Inventory](Inventory.md), moving goods is itself an act with cost and risk, and regions specialize: ore from the mountains, reagents from the swamps, and food from the plains each command different prices in different places, and the gap between them is a merchant's living. Carrying that value across open country makes traders and their caravans natural prey, which ties the economy directly to [Conflict and PvP](Conflict-and-pvp.md) and to the raiding of supply lines in [Raids and Conquest](Raids.md).

## Currency and the Fight Against Inflation

A persistent world generates wealth without pause, and unless losses balance the gains, currency and goods inflate until neither means anything. The economy is therefore built around strong sinks. Equipment wears and must be repaired, crafting consumes materials, settlements demand upkeep and can be taxed through the [Building System](Building-system.md), fast travel and portals charge their toll, bounties cost coin to post, and death takes its share as set out in [Death and Loss](Death-and-loss.md): every death wears down what a character carries, and whatever lies unclaimed on a corpse when its recovery window closes is destroyed, while everything that is looted recirculates intact. These drains are not friction to be minimized away; they are the mechanism that keeps a hard-won blade worth winning and a merchant's coin worth earning.

The other side of the ledger is where coin enters the world, and the largest source is NPC vendors buying what players bring them. The pricing rules above are the guard on that tap. Because a vendor's price for a good falls with every sale of it and has no floor, farming one resource and selling it to one town pays less with every load, and soon pays almost nothing; the coin a gatherer mints is bounded by how many distinct goods and markets they can supply, not by how long they can repeat a single action. Because a vendor always buys below its selling price, buying from one vendor to sell back to another in the same market loses money, and arbitrage pays only across real distance, where the road's risk and tolls take their cut. The coin that does come in drains back out through the sinks, and the wider the economy grows, the more of it flows through player-to-player trade, which moves coin between hands without creating any.

None of this wealth is ever for sale from outside the game: in keeping with the model in [Monetization and Platforms](Monetization.md), the economy stays free of pay-to-win pressure, so that what a player is worth always traces back to what they gathered, made, traded, or took.

## Continue Reading

Continue with [Inventory](Inventory.md) for the weight and storage that shape trade, the [Building System](Building-system.md) for player shops and settlement taxes, and [Death and Loss](Death-and-loss.md) for how risk feeds the market.

## Draft

<!-- Raw notes land here. Add new content in any form; an AI assistant reworks it into the body above as finished prose, then clears what it has integrated. -->
