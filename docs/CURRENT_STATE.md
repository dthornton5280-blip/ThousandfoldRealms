# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.6.6-dev**
- Build name: **Hybrid Props + Tavern Furnishings**
- Development branch for this checkpoint: **feature/hybrid-props-furniture-v166**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Production architecture

The live website is assembled directly from the editable `source/` directory. The historical `Thousandfold_Realms_Web_v1.4.4-dev.zip` is retained only as an archive and is not used by production.

Key authoritative files:

- `source/index.html` — canonical page shell and explicit runtime order
- `source/assets/thousandfold/generated/atlas-manifest.json` — v1.6.5 landmark, nature, and fireplace atlas metadata
- `source/assets/thousandfold/generated/generated-proof-atlas.part00.b64` through `part05.b64` — v1.6.5 compact transparent atlas payload
- `source/assets/thousandfold/generated/atlas-manifest-v166.json` — v1.6.6 prop and furniture atlas metadata
- `source/assets/thousandfold/generated/generated-props-atlas-v166.b64` — v1.6.6 compact transparent prop atlas payload
- `source/src/data/haven_art_content.js` — base Haven art metadata, interactions, searches, uses, and furnishings
- `source/src/data/tavern_composition.js` — coherent Black Lantern Tavern zoning, collision, and v1.6.6 prop-module bootstrap
- `source/src/data/haven_composition.js` — Haven square and starter-interior composition
- `source/src/data/haven_detail_content.js` — final Haven placement corrections, descriptions, and portrait roles
- `source/src/data/whisperwood_composition.js` — Whisperwood landmarks, object placement, searches, daily uses, art metadata, and protected routes
- `source/src/systems/entity_geometry.js` — multi-tile collision and interaction geometry
- `source/src/systems/footprint_interactions.js` — footprint-aware movement, pathfinding, clicks, door behavior, searches, and uses
- `source/src/render/thousandfold_art.js` — project-owned base environment and furnishing renderer
- `source/src/render/haven_detail_art.js` — specialized Haven props and landmarks
- `source/src/render/whisperwood_art.js` — project-owned Whisperwood terrain and wilderness-object renderer
- `source/src/render/thousandfold_renderer.js` — v1.6.5 generated atlas plus building, prop, NPC, fallback, and highlight integration
- `source/src/render/generated_props_v166.js` — v1.6.6 standalone prop and furniture atlas integration
- `source/src/ui/dialogue_portraits.js` — bounded head-and-shoulders dialogue portraits
- `source/src/main.js` — constructs the game after canonical systems exist
- `source/src/core/boot.js` — releases the protected page only after a real screen is visible

`live-overrides/` still contains approved transitional systems, including the illustrated title presentation, unified interface, Living Atlas, physical road network, adaptive HUD, wildlife, reliable enemy patrols, and tactical battlefield presentation.

## Art direction

The rejected v1.5.9 Pixel Crawler tavern pilot remains feature-gated off.

Production uses a hybrid project-owned art pipeline:

- Deterministic pixel primitives remain the complete fallback and continue to cover terrain, missing objects, and systems without approved sprites.
- Approved standalone objects are isolated, background-cleaned, normalized to gameplay scale, packed into compact transparent atlases, and registered with explicit metadata.
- Connected floors, roads, walls, roofs, doors, water, and modular architecture are reconstructed deliberately rather than sliced from presentation artwork.
- Presentation sheets and contact sheets are reference material only and are never loaded by the game.

The browser decodes repository-hosted Base64 PNG payloads, renders exact named crops with nearest-neighbor sampling, and falls through to the established renderer whenever an atlas fails or an asset is absent.

The pipeline directly controls:

- Tile scale and detail density
- Sprite anchors and visual dimensions
- Collision and interaction footprints
- Render order
- Door dimensions and destination IDs
- Searchable and usable object behavior
- Asset-loading failure and fallback behavior

Haven emphasizes warm wood, weathered stone, muted greens, red and green roofs, amber windows, bronze-gold accents, flowers, and lantern light. Whisperwood deepens the same world into cool forest greens, Mosswater blues, packed-earth roads, layered canopy, moss, roots, stone, and isolated amber ward-flames.

Pixel Crawler remains available for carefully reviewed character, enemy, tree, station, and selected prop derivatives. Its complete downloaded pack and editable source files are not committed.

## v1.6.5 generated sprite vertical slice

Nine sprites remain registered in the original 512×288 atlas:

- Green deciduous tree
- Evergreen tree
- Autumn tree
- Rounded green bush
- Hanging-lantern post
- Roofed stone well
- Green-awning market stall
- Black Lantern exterior
- Stone fireplace

They remain live on Haven’s warded lamp posts, Old Market Well, both market stalls, the Black Lantern exterior, the tavern hearth, and four route-safe Whisperwood scenery placements.

The Black Lantern exterior retains its established building footprint and stateful door. Whisperwood trees and foliage render beyond one 32px cell while collision remains attached to deliberate physical bases.

## v1.6.6 hybrid props and tavern furnishings

Ten individually authored, transparent sprites are packed into a separate 512×192 atlas:

- Wooden delivery cart with sacks
- Wooden bench with backrest
- Dual-arrow Haven signpost
- Oak barrel
- Reinforced wooden crate
- Square tavern table
- Wooden chair
- Wooden stool
- Hanging amber lantern
- Bottle-and-book shelf

### Live Haven placements

- `haven_delivery_cart` uses the new cart while retaining its established ID, description, interactions, and two-cell collision.
- `bench_1` and `bench_2` use the new bench while preserving their existing gameplay behavior.
- `haven_east_sign` uses the new tall signpost while remaining nonblocking and inspectable.

### Live Black Lantern placements

- `tavern_table_1`, `tavern_table_2`, and `tavern_table_3` use the new square table.
- `tavern_keg_2` uses the new standalone oak barrel.
- `tavern_shelf_mugs` uses the new bottle-and-book shelf.
- `tavern_supply_crates` uses the new crate.
- `tavern_stage_lamp_1` and `tavern_stage_lamp_2` use the new hanging lantern and remain nonblocking.

The established multi-barrel stack `tavern_keg_1` intentionally retains its existing renderer rather than stretching one barrel across a three-cell furniture footprint.

### Cellar and inn placements

- Both Black Lantern cellar kegs use the new oak barrel.
- Cellar storage uses the new crate.
- Both Lantern Rest guest tables and the upper hall table use the new square table.
- Chair and stool assets are production-registered and bind only to authored entities with matching furniture kinds.

Already-constructed world entities receive the new generated-art metadata after atlas decoding, so the player does not need to reload a save merely because the image completed loading after map construction.

## Haven exterior

Haven contains six established storefronts:

1. Lantern Rest
2. Selene’s Arcana
3. Black Lantern Tavern
4. Mara’s Provisions
5. Chapel of the Last Light
6. Borin’s Forge

The exterior composition includes a broad market road, central lantern walk, clear storefront approaches, Whisperwood access, Lantern Shrine, Old Market Well, merchant stalls, benches, flowers, warded lamps, noticeboard, delivery cart, road sign, gate lanterns, banners, and collision-safe town routines.

All original door IDs and destinations remain preserved.

## Black Lantern Tavern

The tavern remains the primary interior-composition benchmark. It includes a working bar, serving counter, back-bar shelves, casks, preparation table, stew pot, festival stage, three dining clusters, hearth-side common table, clear entrance and cellar routes, searchable storage, daily restorative interactions, safe NPC routines, and full visual-depth collision.

Dialogue continues to use dedicated 160×220 bust portraits rather than enlarged top-down world sprites.

## Other starter interiors

- **Lantern Rest:** reception, guestbook shelves, hearth lounge, breakfast sideboard, guest tables, luggage, linen storage, upper guest rooms, and preserved Room Seven content.
- **Mara’s Provisions:** remedy shelves, road-supply shelves, service counter, herb wall, remedy display, supply baskets, clear entry, and safe shopper routine.
- **Borin’s Forge:** forge, workbench, anvils, quenching, weapon racks, ore, scrap, clear customer zones, and safe worker positions.
- **Selene’s Arcana:** Impossible View Orb, relic pedestal, counter, archive walls, crystals, relics, reading table, sealed storage, and clear approach.
- **Chapel of the Last Light:** central nave, paired pews, altar, Lantern-Bearer statues, lectern, braziers, warded lamps, offering table, and safe resident positions.

## Whisperwood

Whisperwood remains the completed wilderness-art vertical slice with project-owned rendering for moss ground, Lantern Road, bridges, Mosswater, waterfall, Lilymere Pond, reeds, trees, shrubs, flowers, ferns, rocks, cliff faces, and stone stairs.

Existing camp, chests, Moon Herb, Dusk Bloom, road wards, Axemark Wreck, discoveries, searches, daily uses, portals, enemy starts, patrol routes, wildlife routes, and gathering behavior remain intact.

The main road stays clear, all three exits remain reachable, and generated scenery remains outside protected routes.

## Door and geometry model

- Exterior door IDs and destinations remain unchanged.
- Integrated exterior doors remain anchored to established building entities.
- Ordinary interior doors use a standard 32×48 visual size.
- Visible upper door cells belong to interaction geometry while collision remains on the logical doorway cell.
- Open and closed states remain separate and automatic closing uses footprint distance.

Large props use explicit collision footprints matching their physical bodies. Visual dimensions may exceed collision for trees, roofs, lighting, and overhanging scenery. Every occupied collision cell blocks movement, every interaction cell resolves the same entity, and pathfinding approaches a reachable adjacent cell around the complete footprint.

## Persistent interactions and compatibility

World objects may provide descriptions, deterministic one-time searches, occasional loot or gold, once-per-day restoration or experience, and persistent searched/used state.

Existing saves, characters, quests, shops, dialogue, Atlas exploration, fog, defeated enemies, wildlife, patrol state, tactical combat, and HUD settings remain compatible. The v1.6.6 batch changes art bindings only; established object IDs, geometry, interactions, descriptions, and routes remain authoritative.

## Validation

The v1.6.6 validation checks:

- Valid 512×192 PNG payload and exact 11,383-byte decoded size
- Ten named crops within padded atlas bounds
- Complete render dimensions, anchors, layers, collision, interaction, tags, and fallback metadata
- True two-cell cart and bench geometry
- Nonblocking signpost and hanging lantern geometry
- Three-cell shelf geometry
- Correct Haven, tavern, cellar, and inn object mappings
- No single-barrel stretching across the established multi-barrel stack
- Nearest-neighbor rendering
- Current-world metadata patching after asynchronous image load
- Complete fallback through the v1.6.5 and deterministic renderers
- No presentation-sheet or contact-sheet runtime dependency
- Continued success of the v1.6.5 generated-atlas regression and the existing Haven, tavern, Whisperwood, patrol, wildlife, Atlas, HUD, and canonical-source workflows
