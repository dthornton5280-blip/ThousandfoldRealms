# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.6.0-dev**
- Build name: **Asset Catalog + Stable Tavern Rollback**
- Working branch: **fix/pixel-art-catalog-v160**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Production architecture

The live website is assembled directly from the editable `source/` directory.

### Authoritative source

- `source/index.html` — canonical document shell and baked title screen
- `source/styles.css` — core stylesheet
- `source/src/` — canonical data, systems, rendering, UI, and bootstrap code
- `source/src/main.js` — creates and starts the game
- `source/src/core/boot.js` — removes the boot shield only after a real screen is visible
- `source/src/render/assets.js` — original game atlases plus the preserved v1.5.9 Pixel Crawler proof runtime
- `source/src/render/renderer.js` — canonical exploration renderer and explicit art-layer feature gate

### Transitional modules

`live-overrides/` still contains approved systems awaiting controlled integration into source, including the title presentation, unified UI, Living Atlas, physical road network, adaptive HUD, visible wildlife, reliable enemy patrols, and tactical battlefield presentation.

Pages copies `source/` directly, injects transitional CSS in the document head, and injects transitional JavaScript after source classes exist but before `src/main.js` creates the game.

The historical `Thousandfold_Realms_Web_v1.4.4-dev.zip` is not used by production.

## Pixel-art status

### Stable live rendering

The visually incorrect v1.5.9 Pixel Crawler tavern pilot is disabled by default.

The renderer only calls the preserved pilot when:

```js
AO.PixelCrawlerArt?.enabled === true
```

Because the runtime does not enable itself, the Black Lantern Tavern returns to the previous stable atlas/procedural visuals. Gameplay state, collisions, doors, NPCs, dialogue, shops, quests, cellar access, saves, and Atlas behavior remain unchanged.

The v1.5.9 embedded runtime remains in source only as:

- Proof that a compact derived PNG atlas can load in the browser
- A reference for the future asset loader
- A reversible historical experiment

It must not be re-enabled until a replacement atlas passes visual review.

### Reviewed Pixel Crawler pack

The supplied pack contains:

- **181 PNG files**
- **127 animation sheets**
- **5 environment/autotile source sheets**
- **42 player animation sheets**
- **19 NPC animation sheets**
- **24 enemy animation sheets**
- Large trees, furniture, structures, crafting stations, props, weapons, and a tavern mockup

The reviewed metadata is stored in:

- `docs/pixel-crawler/asset_manifest.json`
- `docs/PIXEL_CRAWLER_ART_DIRECTION.md`

A complete local catalog can be regenerated from a user-owned ZIP with:

```bash
python -m pip install pillow
python tools/catalog_pixel_crawler.py \
  "/path/to/Pixel Crawler - Free Pack 2.11.zip" \
  --output build/pixel-crawler-catalog
```

The tool produces a full manifest and labeled previews without extracting or committing the complete source pack.

## Approved art strategy

The project will use a **hybrid, purpose-built atlas pipeline**.

### Use Pixel Crawler where it is strongest

- Player animations
- Selected NPCs
- Skeleton and orc enemy families
- Trees and vegetation
- Crafting and cooking stations
- Selected furniture and props
- Weapons after anchor mapping

### Reconstruct rather than directly slice

The following sheets use a 16px source grid, connected/autotile layouts, modular pieces, or irregular packing:

- `Floors_Tiles.png`
- `Wall_Tiles.png`
- `Wall_Variations.png`
- `Dungeon_Tiles.png`
- `Water_tiles.png`
- `Interior_Walls_01.png`
- `Interior_Props_01.png`
- `Furniture.png`

They must not be treated as independent 32×32 tiles.

Production art will be repacked into project-specific atlases with explicit:

- Source rectangles
- Anchors
- Visual footprints
- Collision footprints
- Interaction points
- Render layers
- Animation frames and timing
- Direction metadata

### Custom and generated art

Custom or generated art is appropriate for:

- Unique buildings and landmarks
- Drowned Fen architecture and vegetation
- Region-specific wildlife and enemies
- Bosses
- Shrines, statues, signs, and quest objects
- Missing transition pieces after the visual language is established

Generated images should be created as individual objects or small controlled families. Large unlabeled sprite sheets and exact autotile matrices are not considered production-ready without manual cleanup, validation, and repacking.

## Next art milestone

The next graphics pass is a controlled **Black Lantern Tavern rebuild**, not a direct reactivation of the v1.5.9 pilot.

Required order:

1. Use the pack mockup only as a composition reference.
2. Redesign the tavern around a real bar, dining area, hearth, small performance area, entrance, and cellar access.
3. Build a compact Haven-interiors atlas from explicitly approved crops.
4. Support a 16px visual subgrid over the existing 32px gameplay grid.
5. Store collision separately from visual dimensions.
6. Render ground, walls, furniture, actors, foreground pieces, lighting, and UI in distinct layers.
7. Review live screenshots before merging the replacement.

After the tavern is successful, the same pipeline can expand to Haven exterior, Whisperwood, road maps, Lantern Mine, Ashen Crypt, Aurelia, and future regions.

## Third-party redistribution boundary

The public repository must not contain:

- The complete downloaded Pixel Crawler pack
- Editable Aseprite sources
- Unused original sheets
- A repackaged asset download

It may contain only approved runtime derivatives actually used by the game, along with:

- Creator attribution
- Supplied license terms
- Source provenance
- Crop and transformation records

The current notice remains at:

`source/assets/third-party/pixel-crawler/NOTICE.txt`

## Save compatibility

Existing saves continue using the same local-storage keys and migration-safe defaults.

Art changes must not clear or reset:

- Characters
- Inventory and equipment
- Quests
- Defeated enemies
- Atlas discoveries and fog
- Visited locations and roads
- Enemy and animal positions
- Hunting and respawn state
- HUD preferences

## Current playable geography

The complete physical route remains:

1. Haven of the Last Lantern
2. Whisperwood
3. Southwood Trail
4. Mosswater Crossing
5. Ambermeadow
6. Eastwatch Approach
7. The Lantern Road
8. Aurelia — Golden Gate Ward

Eastbound exits advance toward Aurelia; westbound exits return toward Haven. Lantern Mine and Ashen Crypt remain physical side branches from Whisperwood.

The six additional world regions remain charted future regions until full physical routes and playable content are authored.

## Current gameplay rules

- Fast travel requires physically visiting destinations and discovering connecting routes.
- Fog-of-war persists.
- Ordinary enemies are visible and follow readable real-time routines.
- Ordinary enemies do not chase or randomly wander by default.
- Enemy and animal movement pauses while the player examines interfaces or leaves the active browser context.
- Routine step-count random battles remain disabled.
- Town animals remain sparse flavor; wilderness wildlife is occasional and can support hunting and resources.
- Adaptive HUD Full, Compact, and Hidden modes remain available.
- Tactical combat uses isolated biome battlefields.

## Automated validation

Current validation covers:

- Canonical source deployment and boot ordering
- Absence of ZIP deployment and legacy branding
- Atlas progression, fog, physical roads, and cardinal consistency
- Visited-only fast travel
- Wildlife and hunting
- Reliable enemy patrols and examination pauses
- Tactical combat on patrol contact
- JavaScript and Python syntax
- CSS balance
- Pixel Crawler feature gating
- Stable tavern fallback restoration
- Reviewed pack counts and source-grid interpretation
- Third-party creator notice and redistribution boundaries
- Catalog-tool behavior without complete-pack extraction

## Live regression checklist

After the v1.6.0 Pages deployment:

1. Hard-refresh and confirm the current title appears without legacy UI flashes.
2. Continue an existing save.
3. Enter the Black Lantern Tavern and confirm the distorted v1.5.9 floor, wall border, red block grid, and oversized furniture are gone.
4. Confirm the stable previous tavern visuals are restored.
5. Confirm doors, Bran, Lys, shop interactions, quest markers, cellar access, collisions, and movement still work.
6. Leave the tavern and confirm Haven and other maps are unchanged.
7. Confirm Atlas, HUD modes, patrols, wildlife, hunting, tactical combat, inventory, quests, saving, and loading still function.

## Repository rules

- `main` is production.
- Read `AGENTS.md` before modifying the repository.
- Build from `source/`; never restore ZIP-based deployment.
- Use branches and pull requests for meaningful changes.
- Preserve existing saves.
- Keep third-party source packs out of the public repository.
- Use purpose-built runtime atlases with explicit metadata.
- Never ship a graphics change solely because an image-loading harness passes.
- Require live visual review for environment conversions.
- Update `version.json`, `CHANGELOG.md`, and this file at canonical checkpoints.
