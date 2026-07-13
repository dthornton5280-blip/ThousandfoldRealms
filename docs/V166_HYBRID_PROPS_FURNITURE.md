# v1.6.6 — Hybrid Props + Tavern Furnishings

## Goal

Move the next approved standalone object family into the playable game as real transparent runtime assets, without committing or loading presentation sheets, changing established interactions, or stretching one object into incompatible multi-object furniture.

## Runtime package

The game loads one additional compact transparent atlas:

- `source/assets/thousandfold/generated/generated-props-atlas-v166.b64`
- Decoded size: **512 × 192 pixels**
- Decoded payload: **11,383 bytes**
- Ten individually named sprites
- Explicit source rectangles, dimensions, anchors, layers, collision footprints, interaction footprints, tags, and fallback metadata in `atlas-manifest-v166.json`

The repository stores the PNG as Base64 because the connected file writer is text-oriented. The browser decodes the payload into a single image, renders exact named crops with nearest-neighbor sampling, and retains the complete existing renderer whenever loading fails or an object has not been converted.

The generated contact sheet and the large concept sheets are not committed or loaded by the runtime.

## Production assets

### Haven exterior

- `haven_cart_wood_sacks`
- `haven_bench_wood_backrest`
- `haven_signpost_wood_dual`

### Tavern and shared storage

- `tavern_barrel_oak`
- `haven_crate_wood`
- `tavern_table_square`
- `tavern_chair_wood`
- `tavern_stool_wood`
- `tavern_hanging_lantern`
- `tavern_shelf_bottles`

Each sprite was isolated, background-cleaned into true transparency, resized for the 32px gameplay grid, given deterministic padding and anchors, and packed into the atlas by the project rather than generated as an unlabeled sheet.

## Live placements

### Haven

- The established delivery cart uses the new loaded cart while retaining its existing ID and two-cell collision.
- Both Lantern Square benches use the new bench while retaining their existing descriptions, uses, interaction areas, and collision.
- The eastern road sign uses the new tall signpost while remaining nonblocking and inspectable.

### Black Lantern Tavern

- All three dining tables use the new square table.
- The standalone service-area keg uses the new oak barrel.
- The north service shelf uses the new bottle-and-book shelf.
- The eastern supply crate uses the new crate.
- Both stage lanterns use the new hanging lantern and keep their nonblocking lighting role.

The existing three-cell keg stack is intentionally left on its established renderer. A single barrel sprite is not stretched across a multi-barrel furniture footprint.

### Black Lantern Cellar

- Both cellar kegs use the new oak barrel.
- Cellar storage uses the new crate.

### Lantern Rest

- Both guest tables and the upper hall table use the new square table.

The chair and stool are registered as production assets and bind only to authored entities with matching furniture kinds. They do not create new blockers or alter room composition simply to force an asset into use.

## Compatibility

- Existing object IDs remain unchanged.
- Existing collision and interaction footprints remain authoritative.
- Existing descriptions, searchable state, daily uses, loot, NPC positions, routes, doors, and saves require no migration.
- Generated prop drawing occurs before the established v1.6.5 atlas and procedural renderers.
- Missing sprites and atlas failures immediately fall through to the prior complete renderer chain.
- Already-constructed world entities receive the approved generated-art metadata when the new atlas finishes loading.

## Validation

`tests/generated-props-v166-harness.js` confirms:

- Valid PNG signature, exact dimensions, and exact decoded byte count
- Compact payload size
- All ten crops within padded atlas bounds
- Complete anchor, layer, collision, interaction, tag, and fallback metadata
- Two-cell cart and bench geometry
- Nonblocking signpost and hanging lantern geometry
- Three-cell service-shelf geometry
- Correct live object mappings across Haven, the tavern, the cellar, and Lantern Rest
- Preservation of the multi-barrel stack rather than stretching one barrel
- Nearest-neighbor rendering and the complete procedural fallback chain
- Current-world patching for sessions that constructed a map before image decoding completed
- No presentation-sheet or contact-sheet runtime dependency

The dedicated GitHub Actions workflow also reruns the v1.6.5 generated-atlas regression so the original nine assets remain protected.
