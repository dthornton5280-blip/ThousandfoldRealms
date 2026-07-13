# Pixel Crawler Art Direction and Integration Rules

## Decision

Thousandfold Realms will use a **hybrid, purpose-built art pipeline**.

The Pixel Crawler pack remains valuable, but it must not be treated as a ready-made 32px tileset. The game will reuse the pack where it is strongest—characters, NPCs, enemies, trees, selected props, and stations—while environment art is repacked into project-specific atlases with exact crop, anchor, footprint, and layering metadata.

Custom or generated artwork will fill gaps and create region-specific landmarks, but generated sheets will not be trusted as production-ready grids without manual cleanup and validation.

## Why the v1.5.9 tavern pilot failed visually

The pilot proved that the images load and render, but the source sheets were interpreted incorrectly.

- `Floors_Tiles.png`, `Wall_Tiles.png`, `Wall_Variations.png`, and `Dungeon_Tiles.png` are built around a **16px source grid** and contain connected/autotile shapes.
- They are not rows of independent 32×32 tiles.
- `Furniture.png` and the static prop sheets are irregularly packed source sheets rather than uniform atlases.
- Large objects have different visual and collision footprints.
- Walls require tops, faces, corners, shadows, and foreground pieces to be assembled together.
- The included tavern mockup is a composition reference, not a sprite sheet.

The old pilot sampled arbitrary 32px cells and stretched some crops into gameplay tiles. That created the oversized repeating floor, incorrect wall border, red block grid, mismatched object scale, and inconsistent baselines visible in the live screenshot.

## Immediate production state

The experimental Pixel Crawler drawing layer is disabled by default in v1.6.0. The Black Lantern Tavern therefore returns to the previous stable visuals while the new art atlas is developed.

The v1.5.9 runtime code remains available as a reference and proof that the browser can load a derived PNG atlas. It may only be re-enabled after a replacement atlas passes visual review.

## What the pack is good for

### Strong candidates

- Player movement and action animations
- Tavern residents and selected townspeople
- Skeleton and orc enemy families
- Large trees and vegetation
- Furnaces, anvils, cooking stations, bonfires, and workbenches
- Selected furniture and environmental props
- Weapons after character-anchor mapping

### Use only after deliberate reconstruction

- Floors
- Roads and terrain edges
- Interior walls
- Building walls and roofs
- Water and dungeon terrain
- Doors and connected architectural pieces

### Reference only

- `MockUps/Tavern.png`

The mockup should guide scale, density, wall construction, shadows, and object placement. It should never be cropped directly into the game.

## Runtime asset specification

Every production sprite or tile must have metadata like:

```json
{
  "id": "tavern_table_long",
  "atlas": "haven-interiors",
  "source": {"x": 0, "y": 0, "w": 64, "h": 48},
  "anchor": {"x": 32, "y": 44},
  "visualFootprint": {"w": 64, "h": 48},
  "collisionFootprint": [{"x": 0, "y": 0}, {"x": 1, "y": 0}],
  "layer": "entity",
  "interactionOffset": {"x": 0, "y": 1}
}
```

Required concepts:

- **Source rectangle:** exact crop in the runtime atlas
- **Anchor:** the pixel point aligned to the entity's gameplay position
- **Visual footprint:** rendered size
- **Collision footprint:** blocked gameplay cells
- **Layer:** ground, wall-back, entity, wall-front, canopy, effect, or UI
- **Interaction point:** where the player stands to use the object
- **Animation:** frame size, frame count, direction, duration, and looping behavior

## Environment atlas strategy

The game uses a 32px movement grid. The art pack uses many 16px source components. Production environments will therefore support a 16px visual subgrid while retaining the existing 32px gameplay grid.

A single gameplay tile may contain four 16px visual cells. This allows:

- Correct wall corners and faces
- Narrow borders and trim
- Furniture aligned between gameplay cells
- Better room composition
- Large objects with small collision bases
- Foreground wall and canopy overlays

The renderer must not infer these relationships from filenames. They will be authored explicitly in a map-art definition.

## Custom and generated artwork

Custom-generated art should supplement the pack rather than immediately replace it.

### Good generation targets

- Unique buildings and landmarks
- Drowned Fen architecture and vegetation
- Region-specific animals and enemies
- Bosses
- Signage, statues, shrines, and quest objects
- Missing transition tiles after the base visual language is established

### Poor generation targets

- Huge unlabeled sprite sheets
- Full autotile matrices in one prompt
- Long multi-animation character sheets expected to align perfectly
- Assets requiring exact transparent padding without cleanup

The reliable generation process is:

1. Define exact dimensions, palette, perspective, and anchor.
2. Generate one object or a small related family.
3. Remove background and correct pixels manually if required.
4. Validate silhouette and scale beside approved pack assets.
5. Pack approved objects into a runtime atlas ourselves.
6. Record source, license, crop, anchor, footprint, and layer metadata.

## Rebuild order

### Stage 1 — Catalog and rollback

- Disable the incorrect tavern pilot.
- Preserve the license notice and runtime proof.
- Generate a complete local manifest and labeled previews from the user's ZIP.
- Establish the metadata schema and art rules.

### Stage 2 — Tavern graybox composition

- Redesign the room around a real bar, dining area, hearth, small performance area, entrance, and cellar access.
- Keep gameplay entrances, NPC identities, shop behavior, and quest flow.
- Define collision independently from visual size.

### Stage 3 — Purpose-built Haven interior atlas

Extract only approved pieces into a compact atlas:

- Two or three wood floor variants
- Correct wall top, face, inner corner, outer corner, and doorway pieces
- Bar modules
- One long table, one small table, chairs, stools, kegs, hearth, shelves, and clutter
- Bran and Lys idle/walk frames

### Stage 4 — Layered implementation

Render in this order:

1. Ground
2. Floor transitions and decals
3. Back walls
4. Furniture behind actors
5. Actors and interactive objects
6. Front walls, tall furniture, and overhead pieces
7. Lighting and effects
8. Quest markers and UI

### Stage 5 — Visual review before release

The replacement tavern must be tested at full browser scale and compared against:

- The stable pre-pilot tavern
- The pack's tavern mockup
- The intended gameplay routes

No replacement becomes production merely because a harness confirms that a PNG loads.

## Local catalog generation

Run:

```bash
python -m pip install pillow
python tools/catalog_pixel_crawler.py \
  "/path/to/Pixel Crawler - Free Pack 2.11.zip" \
  --output build/pixel-crawler-catalog
```

The generated output includes:

- `asset_manifest.json`
- Category counts and interpretation rules
- Labeled 16px-grid previews for the main tilesets, interior sheets, furniture, and tavern mockup

The generated catalog is local working material and should not be committed with the original source graphics.
