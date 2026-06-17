# Non-Player Characters (NPCs)

NPCs are humanoid characters that reuse the player 3D models for dwarves, elves, and humans. They populate settlements and travel the world to create the impression of living civilizations with routines, services, needs, and conflicts.

## Roles And Behavior

Merchants travel between cities and settlements while transporting goods, livestock, or even other NPCs. Their routes naturally create escort quests, ambush events, trade opportunities, and rumours about regional danger. Guards, including knights and archers, defend settlements, with equipment and combat strength scaling alongside a city's size and power. City mages handle protective and maintenance magic; they may cast [Nature Growth](../Magic/Spells/Earth/Nature-growth.md) to restore over-harvested local resources around crowded starting areas. Civilians such as farmers, bartenders, musicians, blacksmiths, traders, weavers, butchers, and builders perform visible tasks that make settlements feel lived in. Child NPCs can add life to urban areas through safe, non-combat routines and interactions.

## Interaction And Gameplay

NPCs provide quests, escort requests, protection work, delivery jobs, trading tasks, vendors, crafting stations, trainers, and settlement services. Merchant itineraries can generate dynamic world events such as convoys, trade hubs, and ambushes, while guards and mages define safe zones and influence player behaviour around settlements.

## Design And Implementation Notes

Using player-compatible 3D models reduces art overhead while still allowing visual variety through armour, clothing, accessories, posture, and animation sets. NPC schedules and visible task animations should scale with settlement size, so larger towns feel busier, better defended, and more service-rich. Resource-restoration mechanics such as Nature Growth need cooldowns and limits so they support crowded areas without being exploitable.

## Example Content Sources

The [Nature Growth](../Magic/Spells/Earth/Nature-growth.md) spell describes the resource-restoration behaviour city mages can use around starting areas.

## Continue Reading

See also: [Creatures index](../Creatures.md), [Structures](../Structures.md), and [Quests](../Quests.md).
