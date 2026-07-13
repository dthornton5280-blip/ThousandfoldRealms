# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.6.5-dev**
- Build name: **Generated Sprite Vertical Slice**
- Development branch for this checkpoint: **feature/generated-proof-assets-v165**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Production architecture

The live website is assembled directly from the editable `source/` directory. The historical `Thousandfold_Realms_Web_v1.4.4-dev.zip` is retained only as an archive and is not used by production.

Key authoritative files:

- `source/index.html` — canonical page shell and explicit runtime order
- `source/assets/thousandfold/generated/atlas-manifest.json` — generated atlas dimensions, source rectangles, anchors, layers, and footprints
- `source/assets/thousandfold/generated/generated-proof-atlas.part00.b64` through `part05.b64` — ordered repository-hosted chunks for the compact transparent PNG atlas
- `source/src/data/haven_art_content.js` — base Haven art metadata, interactions, searches, uses, and furnishings
- `source/src/data/tavern_composition.js` — coherent Black Lantern Tavern zoning and collision
- `source/src/data/haven_composition.js` — Haven square and starter-interior composition
- `source/src/data/haven_detail_content.js` — final Haven placement corrections, descriptions, and portrait roles
- `source/src/data/whisperwood_composition.js` — Whisperwood landmarks, object placement, searches, daily uses, art metadata, and protected routes
- `source/src/systems/entity_geometry.js` — multi-tile collision and interaction geometry
- `source/src/systems/footprint_interactions.js` — footprint-aware movement, pathfinding, clicks, door behavior, searches, and uses
- `source/src/render/thousandfold_art.js` — project-owned base environment and furnishing renderer
- `source/src/render/haven_detail_art.js` — specialized Haven props and landmarks
- `source/src/render/whisperwood_art.js` — project-owned Whisperwood terrain and wilderness-object renderer
- `source/src/render/thousandfold_renderer.js` — generated atlas loading plus building, prop, NPC, fallback, and multi-cell highlight integration
- `source/src/ui/dialogue_portraits.js` — bounded head-and-shoulders dialogue portraits
- `source/src/main.js` — constructs the game after all canonical systems exist
- `source/src/core/boot.js` — releases the protected page only after a real screen is visible

`live-overrides/` still contains approved transitional systems, including the illustrated title presentation, unified interface, Living Atlas, physical road network, adaptive HUD, wildlife, reliable enemy patrols, and tactical battlefield presentation.

## Art direction

The rejected v1.5.9 Pixel Crawler tavern pilot remains feature-gated off.

Production now uses a hybrid project-owned art pipeline. Deterministic pixel primitives remain the complete fallback and continue to control terrain, missing objects, and systems that have not yet received approved sprites. The first reviewed standalone generated objects are packed into a compact transparent runtime atlas with explicit crops and metadata instead of loading either presentation sheet.

The browser fetches six static Base64 chunks, joins them in order, decodes one 512×288 PNG, and renders named crops with nearest-neighbor sampling. A failed request or decode leaves the established procedural renderer active.

The pipeline directly controls:

- Tile scale and detail density
- Sprite anchors and visual dimensions
- Collision and interaction footprints
- Render order
- Door dimensions and destination IDs
- Searchable and usable object behavior
- Asset loading failure and fallback behavior

Haven emphasizes warm wood, weathered stone, muted greens, red and green roofs, amber windows, bronze-gold accents, flowers, and lantern light. Whisperwood deepens the same world into cool forest greens, Mosswater blues, packed-earth roads, layered canopy, moss, roots, stone, and isolated amber ward-flames.

Pixel Crawler remains available for carefully reviewed character, enemy, tree, station, and selected prop derivatives. Its complete downloaded pack and editable source files are not committed.

## Generated sprite vertical slice

Nine sprites are registered in the v1.6.5 atlas:

- Green deciduous tree
- Evergreen tree
- Autumn tree
- Rounded green bush
- Hanging-lantern post
- Roofed stone well
- Green-awning market stall
- Black Lantern exterior
- Stone fireplace

The generated assets are live in these initial locations:

- Haven’s four warded lamp posts
- Old Market Well
- Both market stalls
- The Black Lantern exterior landmark
- The Black Lantern Tavern’s main hearth
- Four route-safe scenery placements in Whisperwood

The Black Lantern exterior retains its established building footprint and overlays a stateful functional door. The Whisperwood trees and bush render beyond a single 32px cell while collision remains attached to a deliberate one-cell physical base. Existing object IDs are preserved wherever generated art replaces an established prop.

## Haven exterior

Haven contains six established storefronts with distinct but related treatments:

1. Lantern Rest
2. Selene’s Arcana
3. Black Lantern Tavern
4. Mara’s Provisions
5. Chapel of the Last Light
6. Borin’s Forge

The exterior composition includes a broad market road, central lantern walk, clear approaches to all six doors, access to Whisperwood Road, the Lantern Shrine, Old Market Well, merchant stalls, benches, flowers, warded lamps, noticeboard, delivery cart, road sign, gate lanterns, banners, and collision-safe town routines.

All original door IDs and destinations are preserved.

## Black Lantern Tavern

The tavern is the first completed interior composition benchmark. It has a working tap bar, serving counter, back-bar shelves, casks, preparation table, stew pot, festival stage, three dining clusters, hearth-side common table, clear entrance and cellar routes, searchable storage, daily restorative interactions, safe NPC routines, and full visual-depth collision.

Dialogue uses dedicated 160×220 bust portraits rather than enlarged top-down world sprites.

## Lantern Rest

The ground floor is a public inn lobby with reception, guestbook shelves, hearth lounge, breakfast sideboard, guest tables, luggage rack, linen storage, and a clear route upstairs. Beds remain in the upper guest rooms. Room Seven, its note, and the restless guest remain intact.

## Mara’s Provisions

The shop has west remedy shelves, east road-supply shelves, a north service counter, living and drying herbs, remedy display, supply baskets, a clear entrance aisle, Mara behind the counter, and a collision-safe shopper routine.

## Borin’s Forge

The forge has distinct forge, workbench, anvil, quenching, weapon-rack, ore, scrap, and customer zones. Duplicate furniture is hidden rather than stacked, and Borin and the apprentice remain on open work floor.

## Selene’s Arcana

The arcane shop includes the Impossible View Orb on a relic pedestal, a service counter, four archive walls, focus crystals, bound relics, reading table, sealed storage, a separate treasure chest, clear entry, Selene behind the counter, and a safe scholar routine.

## Chapel of the Last Light

The chapel has a central nave, paired pew rows, north altar, two Lantern-Bearer statues, lectern, braziers, warded lamps, offering table, clear entrance aisle, and safe positions for Brother Odo and the pilgrim.

## Whisperwood

Whisperwood is the first completed wilderness-art vertical slice.

### Terrain presentation

The map has project-owned pixel rendering for:

- Moss-rich forest ground
- Packed-earth Lantern Road
- Timber bridges
- Deep and shallow Mosswater
- Waterfall and pool
- Lilymere Pond and reeds
- Layered tree canopies and trunks
- Shrubs, ferns, flowers, rocks, and moss stone
- Eastern cliff face and stone stair

The v1.6.5 generated green deciduous tree, evergreen, autumn tree, and bush are placed on selected former tree or shrub cells after those cells are restored to grass. This avoids double-rendering a small procedural tree beneath a large sprite.

### Existing gameplay objects

- Moon Herb and Dusk Bloom retain their established resource IDs and gathering behavior while receiving distinct art.
- Old Road Camp retains its camp type and gains a lean-to, fire ring, woodpile, description, and matching two-cell collision.
- Road lanterns become tall ward posts with amber glow.
- The fallen cart becomes the searchable Axemark Wreck.
- Existing shipment and wilderness chests retain their IDs, loot, persistence, and chest behavior.

### New wilderness discoveries

- Mosswater Ward-Stone
- Storm-Felled Cedar
- Lanterncap Ring
- Foxroot Hollow
- Eastern Overlook Cairn
- Mosswater Bridge Marker
- Lilymere Offering Stone

These details provide descriptions, deterministic one-time searches, or once-per-day uses through the existing persistent interaction system.

### Route and travel safety

- The main east-west road remains free of blocking props.
- Haven, Ashen Crypt, and Lantern Mine portals keep their IDs and destinations and remain mutually reachable.
- Blocking discoveries occupy walkable terrain.
- Existing enemy starts remain clear.
- Mireling, bandit, and deer routine points are free of newly added object collision.
- The four generated scenery placements are outside protected routes and use explicit physical-base collision.
- Gathering nodes remain nonblocking.
- Visible-enemy patrols, examination pause, wildlife routines, hunting, and movement persistence remain handled by the established v1.5.6–v1.5.7 systems.

## Door model

- Exterior building door IDs and destinations remain unchanged.
- Integrated exterior doors remain anchored to established building entities.
- Interior doors use a standard **32×48** visual size.
- The visible upper cell belongs to the interaction footprint.
- Door collision remains based on the logical doorway cell.
- Open and closed presentations remain separate.
- Automatic closing uses footprint distance.

## Multi-tile geometry

Large props use explicit collision footprints matching their physical bodies. Examples include stalls, counters, tables, benches, beds, fireplaces, shelves, weapon racks, carts, stages, statues, workstations, camps, and fallen logs. Visual dimensions may exceed the collision footprint for trees, foliage, roofs, and other overhanging art.

Every occupied collision cell blocks movement. Every declared interaction cell can select the same entity. Pathfinding chooses a reachable adjacent cell around the complete footprint.

## Persistent interactions

World objects may provide descriptions, deterministic one-time searches, occasional loot or gold, once-per-day restorative or experience effects, and persistent searched/used state.

Existing saves, characters, quests, shops, dialogue, Atlas exploration, fog, defeated enemies, wildlife, patrol state, tactical combat, and HUD settings remain compatible.

## Validation

The v1.6.5 validation checks:

- All six encoded atlas chunks exist and assemble in order
- The decoded payload is a valid 512×288 PNG with the expected byte count
- Every named crop remains within atlas bounds with safe edge padding
- All nine generated sprites are registered in the runtime
- Generated sprites draw before procedural fallback
- Failure to fetch or decode the atlas preserves procedural rendering
- The Black Lantern exterior keeps its functional stateful doorway
- The tavern hearth, Haven well, stalls, and lamps retain established interactions and collision
- Large Whisperwood scenery uses one-cell physical-base collision on walkable terrain
- Main-road, portal, enemy, patrol, wildlife, and gathering routes remain valid
- No full presentation sheet is loaded by the runtime
- Canonical source, Haven, tavern, Whisperwood, patrol, wildlife, Atlas, HUD, and generated-atlas workflows continue to pass
