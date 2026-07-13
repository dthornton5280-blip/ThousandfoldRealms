# v1.6.7 — Live Asset, Collision, and Tactical Repair

## Live defects confirmed

The July 13 browser screenshots showed three separate runtime problems:

1. The v1.6.6 atlas existed in the repository but the visible game continued to draw the older procedural cart, benches, and related furniture.
2. The saved/player start position could occupy the south-center Haven building because the historical `(14,15)` Haven start lies inside that building footprint.
3. Tactical combat advertised arrow-key and click movement, but those inputs were still routed to exploration handlers. Player turns also required a manual End Turn even after both the action and all legal movement were exhausted.

## Asset repair

`source/src/render/runtime_repairs_v167.js` is loaded under a new cache-busted filename. It waits until the canonical game and renderer exist, then installs the generated-prop draw call as the final outer render wrapper. Entity art metadata is also resolved lazily at draw time, so a map constructed before the atlas finishes loading still receives the correct sprite.

The compact v1.6.6 atlas and all ten approved asset IDs remain unchanged. Existing procedural art remains the fallback if the atlas cannot load.

## Building collision and position repair

The runtime now treats every authored Haven building rectangle as solid except its real logical door cell. Exploration pathfinding and tactical pathfinding both enforce those footprints.

When a save or new-game position is already inside a building, the player is moved to the nearest safe walkable cell. This repairs the historical Haven start coordinate without deleting or resetting the save.

## Tactical input and turns

- Arrow keys now call tactical movement during the player phase.
- Clicking a blue reachable tile now calls the tactical map-click handler.
- WASD remains reserved for tactical camera panning.
- A turn ends automatically only after the action is spent and no legal movement tile remains.
- Move-after-attack and attack-after-move remain valid while either resource is still available.
- Manual End Turn remains available for intentionally ending early.

## Compatibility

The repair does not rename objects, alter quests, replace saves, change door destinations, or remove existing fallback rendering. It preserves the v1.6.5 and v1.6.6 atlases and adds focused regression coverage for the live failures reported in the browser.
