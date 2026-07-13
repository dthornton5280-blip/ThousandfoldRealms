# v1.6.2-dev — Tavern Composition + Dialogue Portraits

This checkpoint is the first live composition correction after reviewing the v1.6.1 Black Lantern Tavern in the browser.

## Problems observed

- The new art direction reads correctly, but several furniture groups were arranged as independent props rather than as a believable room.
- The common table partially obstructed the entrance route.
- One ambient patron began inside a table footprint.
- Some large objects had collision that covered only one row even though the art occupied two rows.
- The stage visual extended beyond its collision footprint.
- Ambient movement checked only object anchor coordinates, allowing routes to enter the visible body of multi-tile furniture.
- Dialogue used a heavily enlarged top-down world sprite, producing fragmented limbs, oversized instruments, and a poor portrait crop.

## Tavern composition

The Black Lantern is now divided into readable zones:

1. North-west working bar and storage
2. North-east festival stage
3. Three dining clusters
4. South-west hearth and common table
5. Northern preparation area
6. Eastern cellar service passage
7. Clear central entrance aisle

The entrance route from the southern door remains open through the centre of the room. The bar, stage, dining groups, hearth, kitchen props, cache, supply crate, and cellar door have been repositioned around that route.

## Collision corrections

- The stage uses a full 3×2 collision footprint.
- The long common table uses a full 6×2 collision footprint.
- Dining tables and benches use top-left grid anchors aligned with their declared footprints.
- Kegs, service counters, preparation furniture, fireplace, and storage props use explicit grid-aligned collision.
- The wall-mounted job board is non-blocking but retains a broad interaction area.
- Ambient movement now checks `AO.EntityGeometry.contains`, not only object anchor coordinates.
- Tavern ambient routes are authored entirely on clear floor.

## Dialogue portraits

`source/src/ui/dialogue_portraits.js` provides dedicated 160×220 bust portraits instead of enlarging the 32-pixel world character.

Portraits include:

- Head-and-shoulders framing
- Proper face, hair, ears, beard, clothing, and lighting scale
- Bounded role props that remain inside the portrait panel
- Explicit roles for tavernkeeper, bard, innkeeper, apothecary, smith, mage, cleric, warden, tailor, jeweler, patron, and related ambient residents
- Preservation of the existing dialogue flow and choices

The portrait renderer is intentionally procedural and editable. It does not use the world-sprite scaling path.

## Save compatibility

No existing IDs, destinations, quest data, shop data, inventory data, or persistent save keys were removed. Tavern prop locations are reconstructed whenever the map loads, so existing saves receive the corrected composition automatically.

## Validation

`tests/tavern-composition-v162-harness.js` confirms:

- The build metadata is v1.6.2-dev.
- The entrance aisle remains free of blocking furniture.
- Blocking furniture footprints do not overlap.
- Bran, Lys, and both ambient tavern routes begin and remain on clear floor.
- Stage and common-table collision match their visible size.
- Solid legacy bar terrain does not return.
- Dialogue bust geometry remains bounded to portrait scale.
- The base dialogue method remains active.
- New modules load in the required order.
- Ambient movement uses full footprint geometry.
