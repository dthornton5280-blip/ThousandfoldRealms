# Haven handcrafted ground v1.6.14

This atlas is a runtime derivative of the exact approved Haven terrain sheet
stored at `reference/approved/haven_ground_tileset_source.png`.

- Scope: Haven exterior only.
- Production tiles: 32x32 pixels.
- Runtime atlas: 512x384 pixels with 162 native-detail base patches and 24 transitions.
- Base swatches: preserved as coherent 3x3 gameplay macro textures instead of being crushed into one tile.
- Resampling: nearest-neighbor only.
- Base cards: grass, worn dirt/path, and cobblestone.
- Transition cards: grass/path, grass/cobble, and path/cobble compositions.
- Directional variants: rotations of approved source compositions only.
- Fallback: the v1.6.13 ground runtime and canonical procedural renderer.

Regenerate with:

```text
python scripts/build_haven_terrain_v1614.py
```

The source presentation sheet is never loaded by the game.
