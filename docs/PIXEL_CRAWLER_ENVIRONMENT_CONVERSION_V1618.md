# Pixel Crawler Environment Conversion — v1.6.18 Asset Brief

## Goal

Replace visibly weak procedural/generated environment layers with compact, game-specific derivatives from the locally owned Pixel Crawler Free Pack. The conversion must create coherent scenes rather than scatter showcase sprites, and it must never commit the complete source pack.

## Licensed source

- Pack: `Pixel Crawler - Free Pack 2.11.zip`
- Creator: Anokolisa
- Local source SHA-256: `b7b228ca232da9958f191b01db87764dddb67610116151e06e8dd8ade6de94b8`
- Supplied terms: commercial and project use permitted; alteration permitted; assets may not be resold or marketed as an asset pack or standalone final product.
- Repository policy: commit only optimized runtime derivatives that are actively bound to game content. Preserve `source/assets/third-party/pixel-crawler/NOTICE.txt`.

## Shared visual contract

- Native source grid: 16px visual subgrid; gameplay grid: 32px.
- Camera: top-down/oblique RPG perspective already used by Haven and the pack.
- Sampling: nearest-neighbor only; never stretch irregular crops.
- Palette adaptation: reduce raw cyan/green saturation; shift water to dark teal, foliage to olive/moss, stone toward charcoal and warm gray, and flame toward Haven amber.
- Lighting: neutral source sprites with runtime lantern/fire effects; no baked global light direction.
- Transparent sources remain transparent. Terrain outputs are opaque 32×32 tiles.

## Family A — Mosswater topology

- Runtime IDs: `pc_water_*`, `pc_shallow_*`, `pc_lily_*`, `pc_reeds_*`.
- Source: `Environment/Tilesets/Water_tiles.png` plus selected vegetation overlays.
- Output: explicit 16-state N/E/S/W topology on 32px gameplay tiles, including deep, shallow, lily, and reed variants.
- Gameplay: existing `water`, `shallow_water`, `waterfall_pool`, `lilywater`, and `reeds` collision semantics remain unchanged.
- Acceptance: no synthetic circular ponds, cyan water, hard magenta, blurred pixels, or implied crossings where collision blocks movement.

## Family B — Wilderness structure and vegetation

- Runtime IDs: `pc_tree_*`, `pc_shrub_*`, `pc_rocks_*`, `pc_flowers_*`, `pc_dead_tree_*`.
- Sources: selected crops from `Vegetation.png`, tree sheets, and `Rocks.png`.
- Anchors: trees bottom-center with trunk-only one-cell collision; shrubs/rocks bottom-center; flowers and ground plants nonblocking.
- Layering: grass base, grounded trunk/prop, canopy foreground where needed.
- Placement: deterministic regional variation on existing tree/shrub/rock/flower cells; no new blockers on roads, doors, portals, NPC routes, or bridge approaches.

## Family C — Mine and crypt surfaces — rejected

- Runtime IDs: `pc_mine_floor_*`, `pc_crypt_floor_*`, `pc_dungeon_wall_*`, `pc_gate_*`, `pc_rubble_*`.
- Sources: selected named 16px modules from `Dungeon_Tiles.png`, `Floors_Tiles.png`, and `Dungeon_Props.png`.
- Live review found industrial pipe walls, gridded floors, and modern/sci-fi detailing that conflict with the medieval mine and crypt.
- No derivatives from this family are shipped or loaded. Existing biome fallbacks remain until a purpose-built mine/crypt kit exists.

## Family D — Functional stations and scene props — selectively accepted

- Runtime IDs: `pc_furnace_*`, `pc_anvil_*`, `pc_bonfire_*`, `pc_workbench_*`, `pc_alchemy_*`, `pc_furniture_*`.
- Sources: selected station and furniture crops only.
- Anchors and footprints are recorded per asset. Visual footprint may exceed collision, but physical bases must remain explicit.
- Placement: fire-ring derivatives are bound to existing camp/brazier roles. The furnace, anvil, workbench, and larger station sheets were rejected because their machinery and cyan accents read as sci-fi; approved existing forge/furniture art remains active.

## Scene targets

1. Whisperwood and Mosswater Crossing: coherent mosswater, real banks, reeds/lilies, trees, undergrowth, rocks, and bridge approaches.
2. Abandoned Lantern Mine: reviewed in the deployment-shaped build; mismatched dungeon surfaces were removed and existing fallback art preserved.
3. Ashen Crypt: existing surfaces remain; only compact fire-ring treatment is eligible where it improves a real brazier role.
4. Haven working interiors: Pixel Crawler stations/props only when they improve an existing forge, shop, tavern, or camp role and match the established facade/interior scale.

## Validation

- Binary: source checksum, exact crop provenance, atlas bounds, alpha, nearest-neighbor output.
- Gameplay: unchanged IDs, saves, doors, collision, portals, NPC/enemy routes, object interactions, and fallbacks.
- Visual: deployment-shaped browser review at actual scale in every converted scene. A family that loads but looks imported, repetitive, or illogical is rejected.

## Live review outcome

- Accepted: wilderness ground scope, deep/shallow/lily/reed water, waterfalls, trees, dead trees, shrubs, flowers, marsh plants, gray rocks, and fire rings.
- Corrected: broad-water transparency leaks, overly narrow one-cell streams, autumn-colored water plants, and cyan legacy waterfalls.
- Rejected: industrial dungeon tiles, machinery-heavy stations, and arbitrary furniture replacement.
- Preserved: all collision, pathfinding, bridge approaches, map IDs, portals, encounters, object roles, and procedural/approved fallbacks.
