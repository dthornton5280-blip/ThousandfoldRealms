# Thousandfold Realms Ground Tile Atlas v1.6.13

This folder contains the first game-ready 32×32 tile atlas derived from the project-owned Thousandfold pixel-art palette and procedural tile definitions.

Included:
- 3 Haven grass variants
- 2 Haven cobblestone variants
- 2 Haven dirt/path variants
- 4 Black Lantern Tavern wood-floor variants
- 4 Lantern Rest / general interior wood-floor variants
- 4 cellar stone-floor variants
- 4 forge stone-floor variants
- 4 chapel floor variants
- 4 arcane floor variants

Runtime behavior:
- Every tile renders at exactly 32×32 pixels.
- Image smoothing is disabled.
- Variants are selected deterministically from map coordinates.
- The existing procedural renderer remains the fallback if the PNG cannot load.

Next logical asset batch:
- Floor/wall base transitions and door thresholds
- Grass-to-cobble and grass-to-path edge/corner autotiles
- Rugs, stage boards, rune and altar tiles
- Wet cobble, moss, cracks, wood knots, stains, and other transparent decals
- Water, shore, bridge, cliff, and waterfall transition sets
