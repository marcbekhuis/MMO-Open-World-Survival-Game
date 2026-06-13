# Dynamic Culling & Adaptive Render Distance

## The problem with a fixed radius

Unreal Engine culls both rendering and network relevancy using a sphere of constant radius centred on the viewer: an object inside the radius is drawn and replicated, an object outside it is not. This is cheap and predictable, but it behaves poorly for anything that moves quickly. Because the radius is the same in every direction, a fast object only enters the sphere when it is already close, so it appears to blink into existence directly in front of the player instead of resolving smoothly on the horizon. The same abruptness happens in reverse as the object leaves, and it is most jarring for exactly the entities players are most likely to be watching — mounts at a gallop, projectiles, and the large aerial creatures that drift across the [Floating Islands](Biomes/Floating-islands.md).

## An adaptive, velocity-aware model

To remove that pop-in, the game replaces the fixed sphere with a volume that adapts to how an entity is moving. The radius grows with speed and stretches along the direction of travel, so a fast entity is considered visible from farther away on its leading edge — the side a viewer is most likely to be looking toward — while the trailing edge stays close to the baseline. A useful way to size the forward extension is to express it as look-ahead time: roughly 1,5 seconds of travel at the entity's current speed, clamped to a sensible maximum, so the visible distance scales naturally from a walk to a full sprint without manual tuning per creature.

The model groups entities into three categories rather than treating every actor individually:

- **Stationary render distance** keeps the standard symmetric sphere. Resource nodes, buildings, and idle creatures gain nothing from a directional volume, so they use the engine baseline and cost the least to evaluate.
- **Ground movement render distance** elongates the volume forward in proportion to ground speed. A charging mount or a fleeing [Wolf](Creatures/Wolf.md) pack resolves earlier along its path while the volume stays modest to the sides and rear.
- **Flying movement render distance** applies the most aggressive forward extension. Airborne entities cover ground fastest and are usually seen against open sky with nothing to occlude them, so a creature such as the [Flying leviathan](Creatures/Flying-leviathan.md) needs to be visible kilometres ahead of its position to read as a distant, approaching silhouette rather than something that materialises overhead.

As rough baselines, a small projectile uses a short radius of around 400 m, a player or humanoid NPC a medium radius of about 1,5 km, and a large world boss a long radius of roughly 5 km. These are the *resting* values for a stationary or slow entity; the adaptive system scales them upward and forward as speed increases.

## One radius, two consumers

The adaptive radius is not only a rendering concern. The same per-entity value feeds two systems that must agree, and keeping them unified is what makes the world feel seamless:

The **client** uses it as a draw-distance budget, deciding how far away a mesh is rendered before it is culled from view. The **server** uses the very same radius as its network *relevancy* distance — the maximum range at which an entity is replicated to a connection — which in this architecture also governs cross-region synchronisation. When a fast entity's forward-extended radius crosses into a neighbouring region, that region's server is told to maintain a lightweight ghost of the entity before the entity itself arrives. Velocity-aware relevancy therefore does more than smooth a visual transition: it gives the [seamless handoff](Server-architecture.md) between simulation servers additional lead time, because the destination region already has a current ghost by the time the entity reaches the boundary. A client must never be allowed to draw farther than the server has replicated, so the client render distance is always clamped to be no greater than the server relevancy radius for the same entity.

## Where this is specified and implemented

This behaviour is part of the world's server design rather than a standalone rendering tweak. The conceptual rules live alongside the visibility model in [Server-architecture.md](Server-architecture.md) under *Entity Visibility Radius*, and the concrete Unreal Engine 5 implementation — adaptive `NetCullDistanceSquared`, directional relevancy, velocity-extended cross-region broadcast, and the matching client-side `SetMaxDrawDistance` — is documented in [Server-architecture (Technical)](<Server-architecture (Technical).md>).

See also: [Server architecture (spec)](Server-architecture.md) · [Server architecture (technical)](<Server-architecture (Technical).md>)
