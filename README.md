# Thousandfold Realms

Browser-playable development build of an original single-player pixel CRPG.

## Canonical state

- **Current checkpoint:** `v1.6.1-dev — Haven Art + Living Interiors`
- **Production branch:** `main`
- **Production source:** `source/`
- **Deployment:** GitHub Pages from this repository
- **Live architecture:** canonical source plus temporary Git-managed overrides

The website is built directly from the editable `source/` directory. The historical `Thousandfold_Realms_Web_v1.4.4-dev.zip` is no longer used by production deployment.

Read `AGENTS.md`, `version.json`, `docs/CURRENT_STATE.md`, and `CHANGELOG.md` before modifying the project. Read `docs/PIXEL_CRAWLER_ART_DIRECTION.md` before changing graphics.

## Current features

- Illustrated title presentation and protected boot sequence
- Character creation with races, classes, backgrounds, appearance, and attributes
- Exploration across Haven, Whisperwood, four wilderness-road maps, Lantern Road, Aurelia, Lantern Mine, and Ashen Crypt
- World, Region, and Local Atlas views
- Persistent fog-of-war and visited-only fast travel
- Directionally accurate physical map connections
- Full, Compact, Hidden, and selectively configurable HUD modes
- Visible deterministic enemy patrols rather than ordinary step-count random battles
- Sparse town animals and occasional interactive wilderness wildlife
- Survival-based hunting and persistent wildlife resources
- Isolated biome tactical battlefields
- Dialogue, quests, inventory, equipment, shops, crafting, resources, camps, saves, and migration-safe persistent state

## Haven art vertical slice

Haven and its starter interiors now use the first canonical Thousandfold visual language rather than the rejected v1.5.9 sheet slicing experiment.

- Project-owned pixel terrain for Haven grass, paths, cobble, trees, flowers, shrubs, rocks, interior floors, rugs, stages, and walls
- Distinct timber-and-stone exterior treatments for the inn, arcane shop, tavern, provisions shop, chapel, and forge
- Standard 32×48 doors with larger interaction footprints and preserved destination IDs
- Furnished Black Lantern Tavern, tavern cellar, Lantern Rest, upper guest rooms, provisions shop, forge, arcane shop, and chapel
- Multi-tile collision and selection for counters, long tables, stalls, benches, beds, fireplaces, shelves, and other large props
- Descriptions, once-per-day uses, and deterministic one-time searchable finds on appropriate world objects
- Project-owned tavernkeeper, server, bard, and patron sprite samples

The art is drawn from deterministic pixel primitives under `source/src/render/thousandfold_art.js`, so anchors, scale, materials, and styling remain editable without re-slicing a presentation sheet. The two large concept sheets remain reference material and are not deployed as runtime assets.

The Pixel Crawler pack remains available only for carefully reviewed future character, enemy, tree, station, and prop derivatives. The complete downloaded pack and editable Aseprite files are not committed. Creator terms are recorded in `source/assets/third-party/pixel-crawler/NOTICE.txt`.

## Repository layout

- `source/index.html` — canonical page shell, script ordering, and baked title screen
- `source/styles.css` — core stylesheet
- `source/src/data/haven_art_content.js` — Haven and starter-interior art placement and interactions
- `source/src/systems/entity_geometry.js` — multi-tile collision and interaction geometry
- `source/src/systems/footprint_interactions.js` — footprint-aware movement, searches, and object use
- `source/src/render/thousandfold_art.js` — canonical project-owned pixel renderer
- `source/src/render/thousandfold_renderer.js` — art integration and multi-tile highlights
- `live-overrides/` — transitional systems awaiting controlled source integration
- `tests/` — focused runtime and architecture harnesses
- `docs/` — current state, art direction, regression plans, and implementation notes
- `.github/workflows/` — pull-request validation and Pages deployment

## Development workflow

1. Create a branch from `main`.
2. Make the smallest coherent change.
3. Add or update focused validation.
4. Update `version.json`, `CHANGELOG.md`, and `docs/CURRENT_STATE.md` at canonical checkpoints.
5. Open a pull request.
6. Merge only after checks pass.

Do not restore ZIP-based deployment. Do not clear player saves casually. Do not expose unfinished regions as reachable content. Do not commit complete third-party asset packs. Do not ship environment art without live visual review.

## Project handoff

A new chat or agent should be told:

> Work in `dthornton5280-blip/ThousandfoldRealms`. Treat `main` as production. Read `AGENTS.md`, `version.json`, `docs/CURRENT_STATE.md`, `CHANGELOG.md`, and `docs/PIXEL_CRAWLER_ART_DIRECTION.md` before changing graphics.

## Release note

The included music file is a user-supplied development asset. Confirm redistribution and attribution rights before a public commercial release.
