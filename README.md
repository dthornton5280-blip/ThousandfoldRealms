# Thousandfold Realms

Browser-playable development build of an original single-player pixel CRPG.

## Canonical state

- **Current checkpoint:** `v1.6.0-dev — Asset Catalog + Stable Tavern Rollback`
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

## Art integration

The visually incorrect v1.5.9 Black Lantern Tavern pilot is feature-gated off. The live tavern uses the previous stable rendering while the art pipeline is rebuilt correctly.

The approved graphics strategy is hybrid:

- Reuse properly licensed Pixel Crawler characters, NPCs, enemy families, trees, stations, and selected props where they fit.
- Reconstruct 16px connected/autotile environment sources into purpose-built project atlases rather than slicing them as 32px cells.
- Store crop, anchor, visual footprint, collision footprint, interaction point, layer, and animation metadata explicitly.
- Generate custom region-specific art as individual assets or small controlled families, then clean and pack it ourselves.

The complete downloaded pack and editable Aseprite files are not committed. Creator terms are recorded in `source/assets/third-party/pixel-crawler/NOTICE.txt`.

Run `tools/catalog_pixel_crawler.py` against a locally owned ZIP to generate the full asset manifest and labeled previews.

## Repository layout

- `source/index.html` — canonical page shell and baked title screen
- `source/styles.css` — core stylesheet
- `source/src/` — canonical game code
- `source/src/core/boot.js` — releases the page after successful startup
- `source/src/render/assets.js` — original atlases and approved derived runtime art
- `source/src/render/renderer.js` — exploration renderer and explicit art feature gates
- `live-overrides/` — transitional systems awaiting controlled source integration
- `tools/catalog_pixel_crawler.py` — local third-party asset catalog generator
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
