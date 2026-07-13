# Changelog

Canonical development checkpoints for Thousandfold Realms are recorded here. Detailed implementation notes and regression plans live under `docs/` and in the merged pull requests.

## 1.6.1-dev — Haven Art + Living Interiors

### Added
- A project-owned canonical pixel renderer for Haven terrain, interior surfaces, architecture, props, furniture, lighting, and selected residents.
- Distinct timber, stone, roof, window, door, sign, and specialty details for all six Haven storefronts.
- `source/src/data/haven_art_content.js`, which furnishes the Black Lantern Tavern, tavern cellar, Lantern Rest, upper guest rooms, provisions shop, forge, arcane shop, and chapel.
- `source/src/systems/entity_geometry.js` for multi-tile visual, collision, and interaction footprints.
- `source/src/systems/footprint_interactions.js` for footprint-aware movement, clicks, pathfinding, safe enemy placement, automatic door closing, world-object descriptions, once-per-day uses, and deterministic searchable finds.
- Searchable stalls, shelves, crates, casks, tables, cupboards, workbenches, and supply storage with persistent one-time results.
- Useful world interactions including benches, beds, hearths, the market well, the Lantern Shrine, chapel pews, the forge, and the arcane viewing orb.
- Canonical tavernkeeper, server, bard, and patron sprite samples for Bran, Lys, Elowen, Mara, Borin, and ambient interior residents.
- A focused v1.6.1 harness and GitHub Actions workflow covering rendering, interiors, collision, doors, searches, uses, and script order.

### Changed
- Haven grass, cobble, paths, trees, flowers, shrubs, and rocks now use the first Thousandfold-specific visual language.
- Starter interiors use richer wood, stone, rug, stage, forge, chapel, cellar, and arcane treatments.
- The Black Lantern’s former solid `bar` terrain block is replaced with real counter entities and explicit collision footprints.
- Large props such as stalls, counters, beds, fireplaces, shelves, benches, carts, and long tables block and respond across every occupied gameplay cell.
- Non-integrated doors use a consistent 32×48 visual size and an upper interaction cell, while exterior building doors retain their original IDs and destinations.
- The large generated concept sheets remain visual references only; production art is reconstructed as deterministic, editable pixel primitives instead of being sliced from presentation layouts.

### Preserved
- Existing characters, saves, quests, NPC identities, shops, dialogue, Atlas progress, fog, travel, defeated enemies, wildlife, patrol state, and HUD preferences.
- Every established exterior and interior door destination.
- The disabled v1.5.9 Pixel Crawler proof and its creator notice for future carefully reviewed derivatives.

### Validation
- Confirms the canonical art runtime draws Haven tiles, a complete storefront, a large tavern counter, and a project-owned NPC sprite.
- Confirms all starter interiors contain canonical art-tagged furnishings.
- Confirms tavern counter collision comes from entities rather than solid terrain.
- Confirms large props block and select every footprint cell.
- Confirms doors retain standard visual size and enlarged interaction footprints.
- Confirms searchable props award at most once and persistent use state is stored.
- Confirms the new data, system, art, and renderer modules load before game bootstrap in the required order.

## 1.6.0-dev — Asset Catalog + Stable Tavern Rollback

- Disabled the visually incorrect v1.5.9 tavern pilot and restored stable rendering.
- Cataloged the Pixel Crawler pack correctly as 16px connected environment source material plus irregular character, enemy, tree, station, and prop sheets.
- Established the hybrid, purpose-built atlas strategy and generated-art cleanup rules.
- Added `docs/PIXEL_CRAWLER_ART_DIRECTION.md`, reviewed metadata, a local catalog tool, and focused validation.

## 1.5.9-dev — Pixel Crawler Tavern Pilot

- Proved that a small licensed third-party runtime subset could load in canonical source.
- Added an experimental tavern-only atlas, furnishings, Bran, Lys, creator notice, and validation.
- Later rejected visually because connected and irregular source sheets were sampled as independent 32px cells.

## 1.5.8-dev — Canonical Source Build

- Moved production deployment from the historical ZIP to editable `source/`.
- Baked the current title into HTML and added the protected boot screen.
- Added canonical Pages fallback, repository instructions, current-state documentation, and source-deployment validation.

## 1.5.7-dev — Reliable Enemy Patrols

- Replaced the unreliable per-frame focus gate with elapsed-time scheduling and real blur/focus state.
- Added explicit patrol circuits and deterministic fallback routes while keeping bosses and authored guards stationary.

## 1.5.6-dev — Visible Patrols + Living Wildlife

- Replaced ordinary step-count random battles with visible real-time routines.
- Added sparse town animals, occasional wilderness wildlife, observation, hunting, resources, persistence, and examination pauses.

## 1.5.5-dev — Adaptive Field HUD

- Added Full, Compact, and Hidden exploration HUD modes, selective sections, the `H` shortcut, and persistent preferences.

## 1.5.4-dev — Directional Atlas + Cardinal Roads

- Aligned Atlas geography and playable exits into one consistent west-to-east Haven-to-Aurelia journey.

## 1.5.3-dev — Physical Wilderness Road Network

- Added Southwood Trail, Mosswater Crossing, Ambermeadow, and Eastwatch Approach with continuous two-way physical travel.

## 1.5.2-dev — Explored Atlas + Persistent Fog

- Added persistent world and regional fog, legends, route reveals, and physically visited-only fast travel.

## 1.5.1-dev — Living Atlas Runtime Hotfix

- Corrected override ordering so the Living Atlas and Aurelia systems initialize before game bootstrap.

## 1.5.0-dev — The Living Atlas

- Added World, Region, and Local Atlas levels, Lantern Road, Aurelia’s four districts, regional travel, and route state.

## 1.4.9-dev — Unified Realm Interface

- Unified the visual language for character creation, exploration, dialogue, combat, inventories, quests, shops, maps, and overlays.

## 1.4.8-dev — Illustrated Title + Floating Menu

- Added the approved panoramic title artwork, floating title controls, ambience, and responsive presentation.

## 1.4.7-dev — Direct Title Flow + Isolated Biome Arenas

- Added isolated tactical arenas, direct Start/Continue flow, editable source, and corrected battlefield framing.

## 1.4.6-dev — Animated Title Scene

- Added the first animated title presentation and initial title navigation.

## 1.4.5-dev — Biome Tactical Prototype

- Added biome terrain, cover, hazards, elevation, movement, range, line of sight, and encounter scaling.

## 1.4.4-dev — Historical Packaged Base

The original verified packaged website is retained for historical reference only. It is not used by production deployment.
