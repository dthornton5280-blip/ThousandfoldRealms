# v1.6.3 — Haven Square + Starter Interiors

## Goal

Continue the v1.6.1–v1.6.2 visual conversion without replacing stable gameplay. This pass treats every remaining Haven location as an intentionally composed space rather than a room containing unrelated props.

## Haven exterior

- Rebuilds the ground plan around a broad east-west market road and a north-south lantern walk.
- Keeps all six storefront door anchors and destinations unchanged.
- Preserves a clear route to Whisperwood Road.
- Places Nessa’s and Jory’s market stalls beside their owners rather than inside major travel lanes.
- Arranges benches, lamps, flower boxes, the Lantern Shrine, well, noticeboard, delivery cart, road sign, gate lanterns, and banners into readable town zones.
- Keeps the courier route on the open market street and the square keeper on the southern cobble lane.

## Lantern Rest

### Ground floor

- Removes beds from the public lobby and retains sleeping rooms upstairs.
- Creates a recognizable reception desk, guestbook wall, hearth lounge, breakfast sideboard, two guest-table clusters, luggage rack, linen storage, and clear route to the stairs.
- Keeps Elowen behind the desk and moves ambient residents onto clear floor.

### Upper floor

- Keeps the established room doors and Room Seven quest.
- Places beds, shelves, lamps, and the hall table inside appropriate room or corridor zones.
- Preserves the restless guest and note without overlapping the bed or doorway.

## Mara’s Provisions

- Builds two full wall-shelf runs with remedy stock on the west and travel supplies on the east.
- Establishes a north service counter, living herb wall, remedy display, supply baskets, and central entrance aisle.
- Keeps Mara behind the counter and gives the shopper a collision-safe browsing routine.

## Borin’s Forge

- Organizes the room into forge, workbench, anvil, quenching, weapon-rack, ore-storage, scrap, and customer zones.
- Removes duplicate furniture that made the work floor unreadable.
- Adds dedicated anvil, rack, and quenching-trough art with matching collision footprints.
- Keeps Borin and the apprentice on clear working positions.

## Selene’s Arcana

- Creates a central relic display, counter, four archive walls, focus crystals, bound relics, scholar’s table, sealed storage, and clear approach from the entrance.
- Keeps Selene behind the counter and moves the scholar’s loop away from blocking objects.
- Separates the treasure chest from the sealed relic cupboard.

## Chapel of the Last Light

- Establishes a true central nave with paired pew rows, a north altar, two lantern-bearer statues, lectern, braziers, offering table, and clear entrance aisle.
- Hides the duplicate additive pew set instead of allowing overlapping furniture.
- Keeps Brother Odo and the pilgrim on walkable positions.

## New project-owned art

`source/src/render/haven_detail_art.js` adds deterministic pixel primitives for:

- Eastern road signpost
- Gate lantern posts
- Last Lantern banners
- Luggage rack
- Breakfast sideboard
- Remedy display
- Road-supply baskets
- Quenching trough
- Anvils
- Weapon racks
- Relic pedestal
- Reading table
- Lantern-bearer statues
- Chapel lectern
- Offering table

These are not crops from the concept sheets or the third-party pack. Their sizes, anchors, collision footprints, interactions, palette, and rendering are controlled by the game.

## Gameplay preserved

- Save keys and existing characters
- Door IDs, destinations, open/close behavior, and return coordinates
- Shops, quests, dialogue, searchable-state persistence, once-per-day uses, Atlas discovery, patrols, wildlife, tactical combat, and HUD settings
- The v1.6.2 Black Lantern composition and dialogue portraits

## Validation target

The v1.6.3 harness must confirm:

- Every exterior and interior entrance has a clear approach.
- No visible blocking furniture overlaps another blocker.
- Named NPCs and ambient routes begin on clear cells.
- Main travel aisles remain walkable.
- Hidden duplicate objects do not block.
- New art IDs are handled by the detail renderer.
- Door IDs and destinations are unchanged.
- The new modules load in canonical order before game bootstrap.
