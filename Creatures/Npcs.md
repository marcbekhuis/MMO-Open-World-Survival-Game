
# Non-Player Characters (NPCs)

NPCs are humanoid characters that reuse the player 3D models (dwarves, elves, and humans). They populate settlements and travel the world to create the illusion of living civilizations.

## Roles & Behavior

- Merchants: travel between cities and settlements, transporting goods (items, livestock, or even other NPCs). Merchants may request escort missions from players to ensure their cargo arrives safely.
- Guards: knights and archers defend settlements. Their equipment and combat strength scale with a city's size and overall power.
- City Mages: responsible for protective and maintenance magic. They may cast the spell [Nature growth](../Magic/Spells/Earth/Nature-growth.md) to replenish local resources when player activity over-harvests an area, ensuring fair resource availability.
- Civilians: farmers, bartenders, musicians/bards, blacksmiths, traders, weavers, butchers, builders and similar occupations perform visible, purposeful tasks that make settlements feel alive.
- Children: child NPCs run, play, and interact with other NPCs and players, adding life to urban areas.

## Interaction and Gameplay

- NPCs can offer quests (escort, protection, delivery, trading) and services (vendors, crafting stations, trainers).
- Merchant NPCs are a primary source of escort missions and trade routes; their itineraries can create dynamic world events (convoys, ambushes, trade hubs).
- Guard and mage NPCs establish safe zones and influence player behavior around settlements.

## Design & Implementation Notes

- Use player-compatible 3D models to reduce art overhead while allowing visual variety through armor, clothing, and accessories.
- Give NPCs schedules and visible task animations (e.g., farming, smithing, tending livestock) to increase immersion.
- City population and NPC behavior should scale with city size — more guards, tougher defenses, and additional services in larger settlements.
- Ensure resource-restoration mechanics (like `Nature growth`) are balanced and have cooldowns to prevent abuse.

## Example Content Sources

- See the `Nature growth` spell for resource-restoration behaviour: [Nature growth](../Magic/Spells/Earth/Nature-growth.md)

