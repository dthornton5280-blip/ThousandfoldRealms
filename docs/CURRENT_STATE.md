# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.6.18-dev**
- Build name: **Mosswater and Wilderness Art Unification**
- Development branch: **feature/haven-handcrafted-terrain-v1614**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Runtime architecture

The live game is assembled from the editable `source/` directory. The historical packaged archive is not used by production.

Authoritative files for the current checkpoint:

- `source/src/systems/footprint_interactions.js` — facade-to-door click routing plus canonical building collision
- `source/src/systems/world.js` — single-activation destination-door transitions
- `source/src/render/haven_interior_door_runtime_v1616.js` — approved starter-interior door derivatives and fallback
- `source/src/render/renderer.js` — logical map-edge travel markers
- `source/src/ui/ui.js` — map-aware untracked exploration objectives
- `tests/gameplay-polish-v1616-harness.js` — entrance, collision, objective, portal, and door-art regression coverage
- `docs/GAME_AUDIT_V1616.md` — prioritized engineering, design, and art punch list
- `source/src/render/runtime_repairs_v167.js` — late collision safety that preserves integrated doorway openings
- `source/src/render/pixel_crawler_environment_runtime_v1618.js` — active wilderness-wide water, waterfall, and environment-prop conversion
- `scripts/build_pixel_crawler_environment_v1618.py` — checksum-locked user-owned-pack-to-compact-derivative pipeline
- `source/assets/third-party/pixel-crawler/tfr-environment-terrain-v1618.png` and `.json` — 260 active water/shore/waterfall derivatives
- `source/assets/third-party/pixel-crawler/tfr-environment-props-v1618.png` and `.json` — 15 active wilderness and fire-ring derivatives
- `tests/pixel-crawler-environment-v1618-harness.js` — topology, scope, manifest, atlas, and startup coverage
- `docs/PIXEL_CRAWLER_ENVIRONMENT_CONVERSION_V1618.md` — conversion contract, accepted families, and live-review rejections
- `source/src/render/shared_water_shore_runtime_v1617.js` — superseded water candidate retained for reproducible audit only

- `source/assets/thousandfold/tiles/haven-ground-handcrafted-v1614.png` and `.json` — approved Haven terrain atlas and explicit metadata
- `source/src/render/haven_ground_runtime_v1614.js` — deterministic Haven-only terrain selection and fallback
- `scripts/build_haven_terrain_v1614.py` — checksum-locked atlas regeneration pipeline
- `tests/haven-ground-v1614-harness.js` — terrain, scope, topology, and composition regression coverage
- `source/assets/thousandfold/generated/haven-facades-v1614.png` and `.json` — five approved modular Haven storefronts
- `source/src/render/haven_facade_runtime_v1614.js` — Haven facade binding, door-state overlay, and fallback
- `source/assets/thousandfold/tiles/haven-interiors-v1614.png` and `.json` — approved wood, coherent rug, and coherent stone interior surfaces
- `source/src/render/haven_interior_runtime_v1614.js` — starter-interior-only surface selection and fallback
- `docs/ASSET_INTEGRATION_V1614.md` — source-of-truth inventory, active coverage, and exact missing regional kits

- `source/assets/thousandfold/generated/generated-proof-atlas.part00.b64` through `part05.b64` — original v1.6.5 landmark/nature atlas
- `source/assets/thousandfold/generated/generated-props-atlas-v166.b64` — approved standalone prop and furniture atlas
- `source/assets/thousandfold/generated/atlas-manifest-v166.json` — prop crop, anchor, layer, collision, and interaction metadata
- `source/src/render/thousandfold_renderer.js` — canonical environment and original generated-art renderer chain
- `source/src/render/runtime_repairs_v167.js` — building collision, tactical input, and exhausted-turn completion repairs
- `source/src/render/prop_furniture_runtime_v169.js` — authoritative exterior, tavern, cellar, and inn prop/furniture binding and render priority
- `source/src/data/tavern_composition.js` — tavern layout plus cache-busted v1.6.7 and v1.6.9 runtime bootstraps

## Art policy

The project uses a hybrid project-owned art pipeline:

- Standalone approved objects are isolated, background-cleaned, normalized, packed into compact transparent atlases, and bound to real game entities.
- Connected terrain, roads, floors, walls, roofs, doors, water, and modular architecture are deliberately reconstructed into named runtime derivatives rather than interpreted as arbitrary grids.
- Approved project-owned master kits are checksum-locked build inputs; only compact labeled derivatives are loaded by the game.
- Nearest-neighbor rendering is mandatory for runtime sprites.
- Every approved asset retains procedural fallback art if its atlas cannot load.
- Visual size may exceed collision only where the physical base remains explicit and logical.

## v1.6.5 generated vertical slice

The original generated atlas contains:

- Green deciduous tree
- Evergreen tree
- Autumn tree
- Rounded green bush
- Hanging-lantern post
- Roofed stone well
- Green-awning market stall
- Black Lantern exterior
- Stone fireplace

The nature sprites remain available for wilderness use. They are **not** forcibly placed in Haven merely to prove that they exist.

The Haven well, market stalls, lamp posts, Black Lantern exterior, tavern fireplace, and route-safe Whisperwood scenery continue to use approved generated art where already established.

## v1.6.9 authoritative prop and furniture integration

The approved prop/furniture atlas contains:

- Wooden delivery cart with sacks
- Wooden bench with backrest
- Dual-arrow signpost
- Oak barrel
- Reinforced wooden crate
- Square tavern table
- Wooden chair
- Wooden stool
- Hanging amber lantern
- Bottle-and-book shelf

### Haven exterior

Only logical exterior replacements are used:

- `haven_delivery_cart` → `haven_cart_wood_sacks`
- `bench_1` and `bench_2` → `haven_bench_wood_backrest`
- `haven_east_sign` → `haven_signpost_wood_dual`

The mistaken v1.6.8 Haven showcase entities are removed from both map definitions and already-loaded saves:

- `haven_generated_oak_north`
- `haven_generated_evergreen_north`
- `haven_generated_autumn_south`
- `haven_generated_bush_south`

### Black Lantern Tavern

- `tavern_shelf_mugs` → `tavern_shelf_bottles`
- `tavern_keg_2` → `tavern_barrel_oak`
- `tavern_supply_crates` → `haven_crate_wood`
- `tavern_table_1`, `tavern_table_2`, and `tavern_table_3` → `tavern_table_square`
- `tavern_stage_lamp_1` and `tavern_stage_lamp_2` → `tavern_hanging_lantern`

The established multi-cask furniture `tavern_keg_1` remains on its existing renderer. A single barrel is never stretched across the multi-cask footprint.

Logical authored seating is added rather than scattered as showcase art:

- Two bar stools directly in front of the tap bar
- Two dining chairs beside the western and eastern dining tables

These placements avoid the central aisle, stage route, named NPC positions, and ambient patron routes.

### Black Lantern cellar

- `cellar_keg_1` and `cellar_keg_2` → `tavern_barrel_oak`
- `cellar_crates` → `haven_crate_wood`

These single-object assets use one-cell physical footprints rather than retaining the former oversized cupboard/cask geometry.

### Lantern Rest

- `inn_table_1` and `inn_table_2` → `tavern_table_square`
- `upper_hall_table` → `tavern_table_square`
- Two logical guest chairs are placed beside the ground-floor tables
- One logical stool is placed beside the upper hall table

No furniture is spawned merely to advertise an asset. Every new seat belongs to an existing table or service area.

## Runtime guarantees

The v1.6.9 runtime:

- Uses explicit map-and-entity bindings at draw time, so visibility does not depend on metadata-patching timing.
- Wraps the final icon renderer and draws approved prop art before every older generated or procedural fallback.
- Applies bindings to map definitions before new games construct their worlds.
- Patches already-loaded saves after atlas decoding.
- Patches every future map load idempotently.
- Removes the mistaken Haven nature entities from existing sessions.
- Preserves object IDs, descriptions, searches, uses, doors, quests, saves, and unrelated routes.
- Leaves the v1.6.7 building-collision, tactical movement, and automatic turn-completion repairs intact.

## Validation

The v1.6.9 workflow validates:

- Removal of the v1.6.8 nature showcase runtime, test, and workflow
- Exact Haven, tavern, cellar, and inn bindings
- No single-barrel replacement of the multi-cask stack
- Logical authored seating coordinates
- One-cell cellar barrel and crate geometry
- Cache-busted atlas loading
- Nearest-neighbor rendering
- Final-renderer priority over every fallback
- Existing-save synchronization and future-load patching
- Procedural fallback preservation
- Continued success of the v1.6.7 collision/tactical regression and v1.6.6 atlas regression
