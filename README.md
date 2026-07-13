# Thousandfold Realms

Browser-playable development build of an original single-player pixel CRPG.

## Canonical state

- **Current checkpoint:** `v1.5.8-dev — Canonical Source Build`
- **Production branch:** `main`
- **Production source:** `source/`
- **Deployment:** GitHub Pages from this repository
- **Live architecture:** canonical source plus temporary Git-managed overrides

The website is built directly from the editable `source/` directory. The historical `Thousandfold_Realms_Web_v1.4.4-dev.zip` is no longer used by production deployment.

Read `AGENTS.md`, `version.json`, `docs/CURRENT_STATE.md`, and `CHANGELOG.md` before modifying the project.

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

## Repository layout

- `source/index.html` — canonical page shell and baked title screen
- `source/styles.css` — core stylesheet
- `source/src/` — canonical game code
- `source/src/core/boot.js` — releases the page after successful startup
- `live-overrides/` — transitional systems awaiting controlled integration into source
- `tests/` — focused runtime and architecture harnesses
- `docs/` — current state, regression plans, and implementation notes
- `.github/workflows/` — pull-request validation and Pages deployment

## Development workflow

1. Create a branch from `main`.
2. Make the smallest coherent change.
3. Add or update focused validation.
4. Update `version.json`, `CHANGELOG.md`, and `docs/CURRENT_STATE.md` at canonical checkpoints.
5. Open a pull request.
6. Merge only after checks pass.

Do not restore ZIP-based deployment. Do not clear player saves casually. Do not expose unfinished regions as reachable content.

## Project handoff

A new chat or agent should be told:

> Work in `dthornton5280-blip/ThousandfoldRealms`. Treat `main` as production. Read `AGENTS.md`, `version.json`, `docs/CURRENT_STATE.md`, and `CHANGELOG.md` before making changes.

## Release note

The included music file is a user-supplied development asset. Confirm redistribution and attribution rights before a public commercial release.
