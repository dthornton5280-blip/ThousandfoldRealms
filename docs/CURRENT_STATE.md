# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.6.3-dev**
- Build name: **Haven Square + Starter Interiors**
- Development branch for this checkpoint: **feature/haven-composition-v163**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Production architecture

The live website is assembled directly from the editable `source/` directory. The historical `Thousandfold_Realms_Web_v1.4.4-dev.zip` is retained only as an archive and is not used by production.

Key authoritative files:

- `source/index.html` — canonical page shell and explicit runtime order
- `source/src/data/haven_art_content.js` — base Haven art metadata, interactions, searches, uses, and furnishings
- `source/src/data/tavern_composition.js` — coherent Black Lantern Tavern zoning and collision
- `source/src/data/haven_composition.js` — Haven square, Lantern Rest, upper rooms, provisions, forge, arcane shop, and chapel composition
- `source/src/data/haven_detail_content.js` — final clear-floor corrections, detailed descriptions, and portrait roles
- `source/src/systems/entity_geometry.js` — multi-tile collision and interaction geometry
- `source/src/systems/footprint_interactions.js` — footprint-aware movement, pathfinding, clicks, door behavior, searches, and uses
- `source/src/render/thousandfold_art.js` — project-owned base environment and furnishing renderer
- `source/src/render/haven_detail_art.js` — project-owned specialized Haven props and landmarks
- `source/src/render/thousandfold_renderer.js` — building, prop, NPC, and multi-cell highlight integration
- `source/src/ui/dialogue_portraits.js` — bounded head-and-shoulders dialogue portraits
- `source/src/main.js` — constructs the game after all canonical systems exist
- `source/src/core/boot.js` — releases the protected page only after a real screen is visible

`live-overrides/` still contains approved transitional systems, including the illustrated title presentation, unified interface, Living Atlas, physical road network, adaptive HUD, wildlife, reliable enemy patrols, and tactical battlefield presentation.

## Art direction

The rejected v1.5.9 Pixel Crawler tavern pilot remains feature-gated off.

Current production art uses a project-owned visual language derived from the approved Haven and tavern concepts without slicing the presentation sheets into runtime tiles. Art is built from deterministic pixel primitives so the project controls:

- Tile scale and detail density
- Material palettes and lighting
- Sprite anchors and visual dimensions
- Collision and interaction footprints
- Render order
- Door dimensions and destination IDs
- Searchable and usable object behavior

The style uses warm wood, weathered stone, muted greens, red and green roofs, amber windows, bronze-gold accents, moss, flowers, and lantern light.

Pixel Crawler remains available for carefully reviewed character, enemy, tree, station, and selected prop derivatives. Its complete downloaded pack and editable source files are not committed.

## Haven exterior

Haven contains six established storefronts with distinct but related treatments:

1. Lantern Rest
2. Selene’s Arcana
3. Black Lantern Tavern
4. Mara’s Provisions
5. Chapel of the Last Light
6. Borin’s Forge

The exterior composition now includes:

- A broad east-west market road
- A central north-south lantern walk
- Clear approaches to all six doors
- Clear access to Whisperwood Road
- Lantern Shrine and Old Market Well
- Nessa’s and Jory’s stalls beside their owners
- Benches, flower boxes, warded lamps, noticeboard, and delivery cart
- Eastern road signpost and paired gate lanterns
- Last Lantern street banners
- Courier and square-keeper routines that remain on open cobble

All original door IDs and destinations are preserved.

## Black Lantern Tavern

The tavern is the first completed interior composition benchmark. It has:

- Working tap bar and serving counter
- Back-bar shelves, casks, preparation table, and stew pot
- Festival stage and stage lighting
- Three dining clusters
- Hearth-side common table
- Clear central entrance aisle
- Clear cellar route
- Searchable storage and daily restorative interactions
- Safe named-NPC and ambient-patron positions
- Full visual-depth collision for the stage and common table

Dialogue uses dedicated 160×220 bust portraits rather than enlarged top-down world sprites.

## Lantern Rest

### Ground floor

The public lobby now has:

- Reception desk and guestbook shelves
- Common hearth and two guest-table clusters
- Breakfast sideboard
- Luggage rack and linen storage
- Clear route to the upper-floor stairs
- Elowen behind the desk
- Collision-safe guest and attendant routines

Beds were removed from the public lobby and remain in the upper guest rooms.

### Upper floor

The existing room doors and Room Seven quest remain intact. Beds, shelves, lamps, and a hall table are placed inside logical room or corridor zones without overlapping the restless guest, note, or doorways.

## Mara’s Provisions

The shop now has:

- West remedy shelves
- East road-supply shelves
- North service counter
- Living and drying herb wall
- Remedy display
- Road-supply baskets
- Clear central entrance aisle
- Mara behind the counter
- A collision-safe shopper routine

## Borin’s Forge

The forge now has recognizable work zones:

- Ward-stone forge
- Smithing workbench and wall tools
- Main and detail anvils
- Quenching trough
- Finished-weapon and repair racks
- Ore storage and scrap cart
- Clear customer aisle
- Borin and apprentice positions on open work floor

Duplicate additive forge furniture is hidden rather than stacked.

## Selene’s Arcana

The arcane shop now includes:

- Impossible View Orb on a dedicated relic pedestal
- Antiquities counter
- Four archive walls
- Focus crystals and bound relic displays
- Scholar’s reading table
- Sealed relic cupboard and separate treasure chest
- Clear entrance approach
- Selene behind the counter
- Scholar routine away from blocking objects

## Chapel of the Last Light

The chapel now has:

- A true central nave
- Paired pew rows
- North altar
- Two Lantern-Bearer statues
- Lectern, braziers, and warded lamps
- Traveler’s offering table
- Clear entrance aisle
- Brother Odo and pilgrim on open floor

The duplicate additive pew set is hidden so collision matches the visible room.

## Door model

- Exterior building door IDs and destinations remain unchanged.
- Integrated exterior doors remain anchored to their established building entities.
- Interior doors use a standard **32×48** visual size.
- The visible upper cell belongs to the interaction footprint.
- Door collision remains based on the logical doorway cell.
- Open and closed presentations remain separate.
- Automatic closing uses footprint distance.

## Multi-tile geometry

Large props use explicit collision footprints matching their visible bodies. Examples include stalls, counters, tables, benches, beds, fireplaces, shelves, weapon racks, carts, stages, statues, and workstations.

Every occupied collision cell blocks movement. Every declared interaction cell can select the same entity. Pathfinding chooses a reachable adjacent cell around the complete footprint.

## Persistent interactions

World objects may provide:

- Descriptions
- One-time deterministic searches
- Occasional loot or gold
- Once-per-day healing, mana, stamina, or experience effects
- Persistent searched and used state

Existing saves, characters, quests, shops, dialogue, Atlas exploration, fog, defeated enemies, wildlife, patrol state, tactical combat, and HUD settings remain compatible.

## Validation

The v1.6.3 validation checks:

- Clear storefront and road approaches
- Clear interior entrance and service aisles
- No overlapping visible blockers
- No blocking props placed on solid terrain
- NPC and ambient starting cells
- Complete ambient routes against full furniture footprints
- Hidden duplicate furniture
- Stable door identities and destinations
- Specialized detail-art coverage
- Canonical runtime loading order
- Continued success of tavern, Haven art, patrol, wildlife, Atlas, HUD, and canonical-source regressions
