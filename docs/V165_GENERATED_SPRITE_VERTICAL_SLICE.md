# v1.6.5 — Generated Sprite Vertical Slice

## Goal

Move the first approved standalone generated objects into the real browser runtime without loading either presentation sheet, weakening collision, or removing the established project-owned procedural fallback.

## Runtime package

The game now loads one compact transparent PNG:

- `source/assets/thousandfold/generated/generated-proof-atlas.png`
- 512 × 288 pixels
- Nine named sprites
- Explicit source rectangles and render metadata in `atlas-manifest.json`
- Nearest-neighbor canvas rendering
- Existing procedural art remains active until the image loads and whenever a sprite is absent

The large concept sheets are not committed or loaded by the game.

## Live assets

### Haven

- Four warded lamp posts
- Old Market Well
- Both market stalls
- The Black Lantern exterior landmark

### Black Lantern Tavern

- Main stone hearth

### Whisperwood

- Green deciduous tree
- Evergreen tree
- Autumn tree
- Rounded green bush

The four Whisperwood scenery pieces replace existing small procedural tree or shrub cells. Their visual silhouettes extend beyond one 32px cell while their collision remains a deliberate one-cell physical base. Their placements remain outside the protected road, portals, enemy starts, patrol circuits, wildlife route, and gathering nodes.

## Compatibility

- Original object IDs remain unchanged.
- Original exterior door IDs and destinations remain unchanged.
- The generated Black Lantern exterior overlays a stateful functional door so open and closed door behavior remains visible.
- Market stall, well, fireplace, and lamp collision and interactions remain defined by their established entities.
- Existing saves require no migration.
- A failed atlas request logs a warning and immediately leaves the procedural renderer active.

## Validation

`tests/generated-sprite-assets-v165-harness.js` confirms:

- PNG signature, exact atlas dimensions, and compact file size
- Every crop remains inside the atlas with safe boundary padding
- All nine sprites are registered and used
- Generated drawing runs before procedural fallback
- Large scenery replaces its former small terrain sprite while retaining one-cell collision
- The Black Lantern exterior and hearth are live
- Presentation-sheet filenames are absent from runtime code
