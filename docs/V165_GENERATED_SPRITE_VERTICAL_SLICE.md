# v1.6.5 — Generated Sprite Vertical Slice

## Goal

Move the first approved standalone generated objects into the real browser runtime without loading either presentation sheet, weakening collision, or removing the established project-owned procedural fallback.

## Runtime package

The game assembles one compact transparent 512 × 288 PNG from six ordered repository-hosted Base64 asset chunks:

- `source/assets/thousandfold/generated/generated-proof-atlas.part00.b64`
- `source/assets/thousandfold/generated/generated-proof-atlas.part01.b64`
- `source/assets/thousandfold/generated/generated-proof-atlas.part02.b64`
- `source/assets/thousandfold/generated/generated-proof-atlas.part03.b64`
- `source/assets/thousandfold/generated/generated-proof-atlas.part04.b64`
- `source/assets/thousandfold/generated/generated-proof-atlas.part05.b64`

This stores the actual transparent atlas data in the repository despite the connector’s text-only file-write limitation. The browser fetches the six static files, joins them, decodes the PNG, and then renders its nine named sprites with nearest-neighbor canvas drawing. Explicit source rectangles and render metadata live in `atlas-manifest.json`.

Existing procedural art remains active until the image is ready and whenever an asset is absent or fails to decode. The large concept sheets are not committed or loaded by the game.

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

- All six chunks exist and decode into a valid PNG
- Exact atlas dimensions and decoded byte count
- Every crop remains inside the atlas with safe boundary padding
- All nine sprites are registered and used
- Generated drawing runs before procedural fallback
- Large scenery replaces its former small terrain sprite while retaining one-cell collision
- The Black Lantern exterior and hearth are live
- Presentation-sheet filenames are absent from runtime code
