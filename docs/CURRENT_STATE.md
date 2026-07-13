# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.6.1-dev**
- Build name: **Haven Art + Living Interiors**
- Working branch: **feature/thousandfold-haven-art-v161**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Production architecture

The live website is assembled directly from the editable `source/` directory. The historical `Thousandfold_Realms_Web_v1.4.4-dev.zip` is not used by production.

Key authoritative files for this checkpoint:

- `source/index.html` — canonical page shell and explicit runtime order
- `source/src/data/haven_art_content.js` — art placement, furnishing, descriptions, searches, uses, and door presentation
- `source/src/systems/entity_geometry.js` — multi-tile visual, collision, and interaction geometry
- `source/src/systems/footprint_interactions.js` — footprint-aware movement, pathfinding, clicks, door behavior, searches, and use actions
- `source/src/render/thousandfold_art.js` — project-owned Haven and starter-interior pixel renderer
- `source/src/render/thousandfold_renderer.js` — building, prop, NPC, and multi-cell highlight integration
- `source/src/main.js` — constructs and starts the game after the art and geometry layers exist
- `source/src/core/boot.js` — removes the boot shield only after a real screen is visible

`live-overrides/` still contains approved transitional systems, including the illustrated title presentation, unified UI, Living Atlas, physical road network, adaptive HUD, wildlife, reliable enemy patrols, and tactical battlefield presentation.

## Canonical art direction

The rejected v1.5.9 Pixel Crawler tavern pilot remains feature-gated off.

The v1.6.1 vertical slice uses a project-owned visual language reconstructed from the approved Haven exterior and Black Lantern Tavern concept sheets. The large presentation sheets themselves are not runtime atlases. Production art is drawn from deterministic pixel primitives so the project controls:

- Tile scale and detail density
- Material palettes
- Sprite anchors
- Visual dimensions
- Collision footprints
- Interaction footprints
- Lighting
- Render order
- Door dimensions and destination IDs

The initial style uses warm wood, weathered stone, muted greens, red and green roofs, amber windows, bronze-gold accents, moss, flowers, and lantern light.

Pixel Crawler remains available for future carefully reviewed character, enemy, tree, station, and prop derivatives. Its complete downloaded pack and editable source files are not committed.

## Haven exterior

Haven now has canonical project art for:

- Grass, dirt paths, cobble, trees, flowers, shrubs, and rocks
- Timber-framed walls
- Weathered stone bases
- Red and green shingle roofs
- Lit windows
- Integrated storefront doors
- Hanging building signs
- Warded lamp posts
- Market stalls
- Benches and flower boxes
- Lantern Shrine
- Old Market Well
- Delivery cart
- Noticeboard

The six established buildings remain in the same locations and retain their original logical doors:

1. Lantern Rest
2. Selene’s Arcana
3. Black Lantern Tavern
4. Mara’s Provisions
5. Chapel of the Last Light
6. Borin’s Forge

Each storefront has a distinct treatment while remaining part of one visual family.

## Door model

Exterior building door IDs and destinations are preserved for save and quest compatibility.

- Integrated exterior doors remain anchored to the existing building-door entities.
- Non-integrated interior doors use a standard **32×48** visual size.
- The visible upper portion of a door belongs to its interaction footprint, so clicking or pressing against either visible cell resolves the same door.
- Door collision remains based on the logical doorway tile.
- Open and closed states use separate presentation.
- Automatic closing uses footprint distance so a tall door does not close while the player still occupies its visible interaction area.

## Multi-tile geometry

Large props are no longer treated as one-cell objects merely because their anchor occupies one tile.

The geometry layer supports explicit footprints for:

- Market stalls
- Long tables
- Counters and bars
- Benches
- Beds
- Fireplaces and ovens
- Shelves and cupboards
- Kegs and casks
- Carts
- Stage structures
- Workbenches

Every occupied collision cell blocks movement. Every declared interaction cell can select the same entity. Pathfinding chooses a reachable adjacent position around the full footprint rather than only around the anchor.

## Living interiors

### Black Lantern Tavern

The tavern now contains:

- Multi-section tap bar
- Serving counter
- Back-bar shelves
- Common long table
- Three smaller tables
- Benches
- House casks and small beer barrel
- Stone hearth
- Kitchen prep table
- Stew pot
- Festival stage
- Hanging stage lanterns
- Job board
- Black Lantern wall sign
- Table candles
- Kitchen herbs
- Supply storage
- Working cellar route

The old solid `bar` terrain block is removed. Real furniture entities provide collision and interaction.

### Tavern cellar

The cellar retains its quest enemies and now has readable cask and storage art, descriptions, and one persistent supply search.

### Lantern Rest and upper rooms

The inn and upper floor now include:

- Reception desk
- Common-room hearth
- Guest tables
- Hearth benches
- Guestbook shelves
- Linen storage
- Working lamps
- Beds with proper two-cell collision and a once-per-day short-rest interaction

### Mara’s Provisions

The shop includes a serving counter, remedy shelves, supply shelves, herb displays, road-supply storage, descriptions, and occasional exchange-tray finds.

### Borin’s Forge

The forge includes a ward-stone furnace, ore crates, scrap cart, workbench, hanging tools, cooling lanterns, descriptions, and occasional usable scrap or supplies.

### Selene’s Arcana

The arcane shop includes an antiquities counter, bookcases, candles, relic storage, descriptions, occasional safe duplicate finds, and a once-per-day viewing-orb interaction.

### Chapel of the Last Light

The chapel includes the Last Light altar, multi-cell pews, lanterns, descriptions, and once-per-day quiet-rest interactions.

## World-object interactions

Appropriate props can now offer one or more of:

- A descriptive inspection
- A persistent one-time search
- A once-per-day use
- Small healing, mana, or stamina restoration
- Experience
- Items
- Gold

Search results are deterministic for a character, map, and object. Repeated searches cannot repeatedly award loot. Use actions record their last in-game day when configured as daily.

Examples include:

- Drawing water from the market well
- Resting at the Lantern Shrine
- Sitting on town benches or chapel pews
- Warming at inn, tavern, or forge fires
- Resting briefly in a guest bed
- Inspecting performance marks on the tavern stage
- Searching returned supplies, damaged parcels, cupboards, casks, tables, shelves, crates, and workbenches

## Characters

The first project-owned interior character samples are applied to:

- Bran Hollow — tavernkeeper
- Lys of the Lantern — bard/wayfarer
- Elowen Reed — innkeeper/server
- Mara Vale — shopkeeper/server treatment
- Borin Flint — smith/tavernkeeper-derived treatment
- Tavern patrons
- Traveling musician
- Inn guest
- Inn attendant

Unconverted characters retain the existing stable renderer.

## Save compatibility

Existing saves continue using the same local-storage keys.

New migration-safe state:

- `world.searchedDecor`
- `world.usedDecor`

Existing characters, inventory, equipment, quests, Atlas discoveries, fog, visited roads, defeated enemies, patrol positions, wildlife state, hunting state, and HUD preferences are preserved.

## Existing gameplay systems preserved

- Illustrated title and protected boot
- Character creation
- World, Region, and Local Atlas
- Persistent fog
- Physical Haven-to-Aurelia travel
- Visited-only fast travel
- Adaptive HUD
- Visible deterministic enemy patrols
- Sparse town animals and occasional wilderness wildlife
- Hunting and wildlife resources
- Isolated tactical battlefields
- Dialogue, quests, shops, crafting, inventory, equipment, camps, saving, and loading

## Automated validation

The v1.6.1 harness verifies:

- Project-owned Haven terrain rendering
- Complete storefront rendering
- Large tavern counter rendering
- Project-owned NPC rendering
- Art placement in every starter interior
- Removal of solid tavern bar terrain
- Multi-cell collision
- Multi-cell selection
- Door size and enlarged door interaction footprint
- Persistent one-time searches
- Required runtime order before `src/main.js`
- Generated-art provenance and third-party separation

Existing architecture, Atlas, HUD, wildlife, patrol, and source-build workflows remain active.

## Required live regression checklist

### Haven exterior

1. Hard-refresh and confirm the current title and boot screen still appear without legacy flashes.
2. Continue an existing save into Haven.
3. Confirm terrain, buildings, windows, roofs, signs, stalls, lights, well, shrine, benches, flowers, and cart are visually coherent.
4. Walk around every building and confirm scenery does not block unintended road or doorway cells.
5. Open and enter all six storefront doors.
6. Exit each interior and confirm the player returns to the correct exterior doorway.

### Interiors

1. Visit the tavern, cellar, inn, upper rooms, provisions shop, forge, arcane shop, and chapel.
2. Confirm large props occupy the correct visual and collision area.
3. Click different visible portions of a large prop and confirm they resolve to the same object.
4. Confirm Bran, Lys, Elowen, Mara, Borin, and ambient interior residents use the intended style.
5. Confirm NPCs remain reachable and shops/dialogue still open.
6. Confirm the tavern cellar remains reachable and its quest encounters remain functional.

### Interactions and persistence

1. Inspect objects with descriptions.
2. Use a well, bench, bed, hearth, pew, shrine, or orb.
3. Search several eligible objects.
4. Confirm the same object cannot award a second find.
5. Save, reload, and confirm search/use state persists.
6. Advance an in-game day and confirm daily uses become available again.

### Systems

1. Confirm HUD modes, Atlas, fog, roads, patrols, wildlife, tactical combat, inventory, quests, saving, and loading still work.
2. Confirm ordinary enemy and animal routines still pause while menus or dialogue are open.

## Known risks

1. Browser screenshots are still required to tune object scale, overlap, and density; automated tests cannot judge composition quality.
2. The project-owned NPC samples are compact two-state idle treatments rather than complete four-direction walk/action sheets.
3. Haven’s exterior map geometry remains the original six-building layout; future town-layout work may create more varied streets and building footprints.
4. Some interiors still use their original logical room geometry even though furnishings are substantially improved.
5. The new pixel renderer is the first canonical style pass and will need palette and detail tuning after live review.

## Next art pass

1. Live-tune Haven and all starter interiors from screenshots.
2. Correct any doorway, collision, scale, or visual-overlap issue found in browser testing.
3. Expand the player and NPC animation system into directional idle/walk frames.
4. Build a canonical Whisperwood outdoor kit using the same palette and metadata rules.
5. Convert Lantern Mine and Ashen Crypt after the outdoor vertical slice is stable.

## Repository rules

- `main` is production.
- Build from `source/`; never restore ZIP deployment.
- Use branches and pull requests for meaningful work.
- Preserve save compatibility.
- Keep visual, collision, and interaction footprints explicit and separate.
- Do not deploy large concept sheets as runtime atlases.
- Do not ship third-party packs or editable source files wholesale.
- Require focused validation and actual browser review for graphics changes.
