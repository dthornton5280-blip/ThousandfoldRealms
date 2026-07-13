# Thousandfold Realms — Codex Implementation Handoff

## Purpose

Use **Codex for repository inspection, coding, extraction, testing, and GitHub implementation**.

Use the **ChatGPT TFR conversation as the creative director and visual approval source**. Codex should not improvise new art direction, generate replacement artwork, or reinterpret approved assets without explicit approval in that chat.

This handoff is implementation work, not a brainstorming request.

---

## Repository

- Repository: `dthornton5280-blip/ThousandfoldRealms`
- Production branch: `main`
- Live site: `https://dthornton5280-blip.github.io/ThousandfoldRealms/`
- Canonical editable app: `source/`
- Verified current production checkpoint at the time of this handoff:
  - Version: `1.6.13-dev`
  - Build: `Prop Collision and Ground Tile Atlas`
  - Latest verified main commit: `84337ff5b80b8d9c23372edf35bd03632d91fa40`
- There is **no verified v1.6.14 commit or merged PR yet**. Do not assume the previously discussed handcrafted Haven terrain was actually merged.

Create a branch:

```bash
git checkout main
git pull
git checkout -b feature/haven-handcrafted-terrain-v1614
```

Suggested PR title:

```text
v1.6.14: Implement approved handcrafted Haven terrain tiles
```

---

# Immediate Objective

Replace the visually weak v1.6.13 Haven grass, dirt-path, cobblestone, and transition art with **game-ready terrain derived from the exact approved handcrafted tileset supplied by the user**.

Do not generate new imagery.

Do not substitute procedural approximations.

Do not use the approved Haven set in unrelated maps or biomes.

The approved sheet is the one shown in the TFR ChatGPT conversation containing:

- detailed green grass variants
- flowered and rocky grass variants
- worn dirt variants
- gray cobblestone variants
- grass-to-dirt transitions
- grass-to-cobble transitions
- dirt-to-cobble transition compositions

The artwork has a handcrafted pixel-art look matching the approved cart, shelf, barrel, furniture, lantern, signpost, and other production assets.

---

# Required Source Asset

Codex cannot see images that exist only inside the ChatGPT conversation.

Before extraction, verify that the approved source sheet exists locally in the repository or working directory at a clear path such as:

```text
reference/approved/haven_ground_tileset_source.png
```

If it is absent:

1. Stop.
2. Tell the user exactly which file path is needed.
3. Do not create substitute art.
4. Do not proceed with the old v1.6.13 atlas and claim success.

Do not commit the large presentation/reference sheet to the deployed runtime unless the user explicitly requests it. It may be placed under a non-runtime `reference/` path or ignored after the final atlas is built.

---

# Important Scope Rule

## This tileset is for Haven exterior only

Apply it to:

- `map.id === "haven"`
- Haven grass
- Haven cobblestone/plaza/road tiles
- Haven dirt or worn path tiles
- Haven grass-to-path transitions
- Haven grass-to-cobble transitions
- Haven path-to-cobble transitions when supported by the approved source art

Do **not** apply it to:

- Whisperwood
- other forests
- swamps
- mountains
- snow
- desert
- water
- shoreline
- bridges
- cliffs
- waterfalls
- tavern interiors
- Lantern Rest interiors
- cellar floors
- forge floors
- chapel floors
- arcane-shop floors
- future biomes

A screenshot taken in **Whisperwood should remain unchanged** by this Haven-specific implementation.

Other biomes and interiors will receive their own approved art sets later.

---

# Existing Files to Inspect First

Inspect current `main` before changing anything:

```text
version.json
source/src/main.js
source/src/render/renderer.js
source/src/render/ground_tile_runtime_v1613.js
source/src/render/prop_geometry_runtime_v1613.js
source/assets/thousandfold/tiles/tfr-ground-tiles-v1613.png
source/assets/thousandfold/tiles/tfr-ground-tiles-v1613.json
source/assets/thousandfold/tiles/README.md
tests/prop-collision-ground-tiles-v1613-harness.js
.github/workflows/validate-prop-collision-ground-tiles-v1613.yml
```

Also inspect the Haven map builder and tile naming:

```text
source/src/data/haven_composition.js
source/src/systems/world.js
source/src/render/thousandfold_art.js
source/src/render/assets.js
```

Do not guess tile names. Confirm whether Haven uses `grass`, `cobble`, `path`, `dirt`, or another canonical tile ID.

---

# Preserve Existing Working Systems

Do not regress:

- exact uploaded prop atlas from v1.6.12
- cart, bench, signpost, shelf, barrel, crate, table, chair, stool, and lantern rendering
- cart and prop collision fixes
- building collision
- doorway passability
- save compatibility
- NPC routes
- world interactions
- tactical combat movement
- automatic turn completion
- existing procedural fallback chain
- deterministic rendering
- nearest-neighbor pixel rendering

The current prop work is now visibly functioning. Terrain work must not disturb it.

---

# Art Processing Requirements

## Do not naively slice the presentation sheet

The supplied sheet contains black gutters, rounded presentation edges, and shadowed tile cards. Those presentation elements are not game terrain.

Build a reproducible extraction pipeline, preferably:

```text
scripts/build_haven_terrain_v1614.py
```

Use Pillow or equivalent local image processing.

The script should:

1. Load the exact approved source image.
2. Identify the 6-column × 4-row tile card layout.
3. Crop each semantic tile card.
4. Remove:
   - black gutters
   - outer card shadow
   - rounded presentation border
   - empty padding
5. Preserve only the actual painted ground surface.
6. Normalize each production tile to exactly `32 × 32`.
7. Use nearest-neighbor scaling only.
8. Preserve crisp pixel edges.
9. Avoid blur, antialiasing, or painterly resampling.
10. Produce a deterministic atlas and manifest.
11. Fail loudly when the source image is missing or dimensions/layout are unexpected.

Do not globally remove dark colors from the tile art. Dark pixels inside stones, soil, grass, and cracks are legitimate.

---

# Recommended Production Asset Structure

```text
source/assets/thousandfold/tiles/
  haven-ground-handcrafted-v1614.png
  haven-ground-handcrafted-v1614.json
  HAVEN_GROUND_V1614.md

source/src/render/
  haven_ground_runtime_v1614.js

scripts/
  build_haven_terrain_v1614.py

tests/
  haven-ground-v1614-harness.js

.github/workflows/
  validate-haven-ground-v1614.yml
```

Keep filenames clear and versioned.

---

# Recommended Tile Families

Use semantic names. The exact count may change after inspection, but the manifest should cover these families.

## Grass bases

```text
haven_grass_clean_01
haven_grass_clean_02
haven_grass_clean_03
haven_grass_flowers_01
haven_grass_flowers_02
haven_grass_rocks_01
haven_grass_rocks_02
haven_grass_worn_01
haven_grass_worn_02
haven_grass_dense_01
```

Do not overuse flowers and rocks. They are accents, not the default on every tile.

## Dirt/path bases

```text
haven_path_dirt_01
haven_path_dirt_02
haven_path_dirt_03
haven_path_dirt_rocks_01
haven_path_dirt_worn_01
```

## Cobblestone bases

```text
haven_cobble_01
haven_cobble_moss_01
haven_cobble_cracked_01
```

Use regular cobble most often. Moss and cracks should be controlled variants.

## Transition tiles or overlays

At minimum:

```text
haven_edge_grass_path_n
haven_edge_grass_path_e
haven_edge_grass_path_s
haven_edge_grass_path_w

haven_corner_grass_path_ne
haven_corner_grass_path_se
haven_corner_grass_path_sw
haven_corner_grass_path_nw

haven_edge_grass_cobble_n
haven_edge_grass_cobble_e
haven_edge_grass_cobble_s
haven_edge_grass_cobble_w

haven_corner_grass_cobble_ne
haven_corner_grass_cobble_se
haven_corner_grass_cobble_sw
haven_corner_grass_cobble_nw
```

When the approved sheet does not contain every orientation, derive rotated versions from the approved source tile in code or in the build script. Rotation is allowed; generation or repainting is not.

Complex bottom-row compositions may be used for:

- inner corners
- outer corners
- path bends
- small plaza transitions
- cobble/path intersections

Only use a complex tile where the neighboring map topology actually matches it.

---

# Rendering Architecture

Create a dedicated Haven-only renderer, loaded after the v1.6.13 ground runtime so it wins specifically for Haven:

```text
source/src/render/haven_ground_runtime_v1614.js
```

The runtime should:

- load `haven-ground-handcrafted-v1614.png`
- expose a clear object such as `AO.HavenGroundArtV1614`
- return `false` for every non-Haven map
- return `false` for unsupported tile types
- render before the weaker Haven portion of v1.6.13
- preserve v1.6.13 or procedural fallback when the new atlas fails
- set `ctx.imageSmoothingEnabled = false`
- draw exact integer-coordinate `32 × 32` destinations
- select base variants deterministically from `mapId + x + y`
- never change variant every frame
- avoid obvious checkerboard repetition
- use rare-detail weighting:
  - common clean grass
  - occasional flowers
  - occasional rocks
  - rare heavily worn or dense variants

Do not replace the entire global tile renderer.

Do not change Whisperwood’s current art.

---

# Transition Selection

Do not randomly place transition tiles.

For a tile at `(x, y)`:

1. Inspect north, east, south, and west neighboring canonical tile types.
2. Classify the center as grass, path, or cobble.
3. Select a transition only when a neighboring type differs.
4. Prefer a single edge when one neighbor differs.
5. Prefer an outer/inner corner when two adjacent neighbors differ.
6. Use the base tile when transitions are ambiguous.
7. Never create a visual transition that contradicts collision or map topology.

If the current renderer API lacks access to the grid, extend the Haven-specific call carefully rather than mutating global behavior recklessly.

---

# Haven Placement Guidance

## Grass

Use detailed grass in:

- town perimeter
- lawns around buildings
- non-road open areas
- quiet side spaces

Use clean grass most frequently.

Use flowered or rocky variants away from:

- door approaches
- central walking lanes
- NPC gathering points
- important interactables

## Cobble

Use cobble for:

- primary town plaza
- main road between storefronts
- market circulation
- formal building approaches

## Dirt path

Use dirt for:

- secondary access routes
- side lanes
- worn connectors
- less formal edges of town

Do not replace every Haven road with dirt.

## Transitions

Use transitions only at real boundaries:

- grass beside cobble
- grass beside dirt
- dirt beside cobble
- building-side path shoulders where appropriate

---

# Current Visual Problem to Correct

The current v1.6.13 ground atlas is technically functional but visually weak and does not match the detailed handcrafted style of the approved props.

The replacement must visibly resemble the approved sheet:

- dense grass texture
- varied blades and small plant clusters
- readable stones
- hand-placed flowers
- layered dirt wear
- dimensional cobblestone
- moss and cracks used carefully
- warm, earthy, handcrafted palette
- crisp pixel-art edges

Do not claim visual parity merely because a PNG loads.

---

# Runtime Loading

Update `source/src/main.js` so the new Haven terrain runtime is loaded in a deterministic order.

Suggested order:

1. exact prop runtime
2. prop geometry runtime
3. existing v1.6.13 general ground/floor runtime if retained
4. new Haven handcrafted terrain runtime
5. wait for required runtimes to reach `ready` or `failed`
6. construct `AO.Game`

The Haven-specific runtime must take priority for Haven only.

Use a cache-busted request such as:

```text
src/render/haven_ground_runtime_v1614.js?v=1614
```

And:

```text
assets/thousandfold/tiles/haven-ground-handcrafted-v1614.png?v=1614
```

Expose status:

```text
document.documentElement.dataset.tfrHavenGround = "loading"
document.documentElement.dataset.tfrHavenGround = "ready"
document.documentElement.dataset.tfrHavenGround = "failed"
```

If loading fails, log the actual error and continue with fallback art.

---

# Versioning

After implementation:

```json
{
  "version": "1.6.14-dev",
  "buildName": "Handcrafted Haven Terrain",
  "canonicalBranch": "main",
  "deploymentModel": "canonical source plus transitional Git-managed overrides"
}
```

Do not bump the version until the runtime, assets, and tests are actually committed.

---

# Automated Validation

Create a real test, not just string matching.

The test should verify:

- source output PNG exists
- PNG signature is valid
- atlas dimensions match manifest
- every source rectangle is within bounds
- all production tiles are exactly `32 × 32`
- no production crop includes black presentation gutters
- nearest-neighbor draw path is used
- deterministic selection returns the same tile for the same coordinates
- different coordinates produce controlled variation
- rare accent variants are not selected at excessive frequency
- transitions respond to actual neighbors
- runtime returns `false` outside `map.id === "haven"`
- Whisperwood remains untouched
- interiors remain untouched
- fallback activates when atlas load fails
- v1.6.12 exact prop tests still pass
- v1.6.13 prop collision tests still pass
- v1.6.7 gameplay repair tests still pass

Add a GitHub Actions workflow that runs:

```bash
node --check source/src/render/haven_ground_runtime_v1614.js
node tests/haven-ground-v1614-harness.js
node tests/exact-prop-assets-v1612-harness.js
node tests/prop-collision-ground-tiles-v1613-harness.js
node tests/live-runtime-v167-harness.js
```

Also run the full existing test set when feasible.

---

# Visual QA Requirement

Automated tests are not enough.

Before merging, run the site locally and capture screenshots of:

1. Haven full map
2. central cobblestone plaza
3. grass/cobble boundary
4. grass/dirt boundary
5. dirt/cobble boundary
6. storefront approach
7. cart area showing terrain plus corrected collision context
8. Whisperwood proving it did not change
9. one interior proving it did not change

Compare Haven directly against the approved source sheet and the existing detailed prop style.

Do not report “implemented” until the new tiles are visibly present in Haven.

Do not use a Whisperwood screenshot to judge a Haven-only set.

---

# Collision and Gameplay

Ground tiles are visual and should not alter walkability by themselves.

Do not:

- modify map collision because grass looks rocky
- make decorative flowers block movement
- make visual cracks affect navigation
- change road collision
- move buildings
- move doors
- move NPCs
- alter quests
- alter combat

Retest the cart collision separately. The visible cart body and wheels should match the physical footprint without blocking unrelated road space.

---

# Git and PR Rules

- Work only on the feature branch.
- Commit logical units.
- Do not directly modify `main`.
- Open a PR.
- Include:
  - exact files changed
  - extraction/build method
  - atlas dimensions
  - number of base and transition tiles
  - scope statement: Haven only
  - tests run
  - screenshots
  - confirmation that Whisperwood and interiors are unchanged
- Merge only after CI passes and the user visually approves screenshots.

---

# Non-Negotiable Rules

1. Do not generate new art.
2. Do not use the old weak v1.6.13 Haven ground as the final result.
3. Do not invent v1.6.14 completion before a commit and PR exist.
4. Do not apply Haven terrain to Whisperwood or other biomes.
5. Do not naively render the black presentation gutters.
6. Do not blur or antialias the pixel art.
7. Do not break the working prop integration.
8. Do not claim deployment is visually confirmed without opening the published site.
9. Do not place random showcase tiles simply to prove they exist.
10. Use the TFR ChatGPT conversation for visual decisions and Codex for implementation.

---

# Completion Report Format

When finished, report:

```markdown
## Implemented
- ...

## Files Added
- ...

## Files Modified
- ...

## Tile Inventory
- Base grass:
- Accent grass:
- Dirt:
- Cobble:
- Transitions:

## Scope
- Haven:
- Whisperwood:
- Interiors:
- Other biomes:

## Tests
- ...

## Visual QA
- Local Haven:
- Live Pages:
- Whisperwood unchanged:
- Interiors unchanged:

## Git
- Branch:
- PR:
- Head commit:
- Merge commit:
```

Be explicit about anything not verified.
