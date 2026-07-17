# Approved Haven art references

`haven_ground_tileset_source.png` is the exact user-approved 6-column by
4-row handcrafted Haven terrain presentation sheet supplied for the v1.6.14
implementation.

`haven_exterior_master_kit.png` is the exact approved modular exterior kit
used to compose the five non-landmark Haven storefront facades.

`black_lantern_master_kit.png` is the exact approved Black Lantern kit used
for starter-interior wood and coherent carpet derivatives.

- Use: Haven exterior terrain only.
- Runtime status: reference input; never load this presentation sheet in-game.
- Processing: build only named runtime derivatives with the three checksum-
  locked `scripts/build_haven_*_v1614.py` pipelines.
- Prohibited: replacement generation, repainting, blurred resampling, black
  gutter inclusion, or reuse in Whisperwood, interiors, or other biomes.

The implementation requirements are preserved in
`docs/Thousandfold_Realms_Codex_Handoff_Haven_Terrain_v1614.md`.
