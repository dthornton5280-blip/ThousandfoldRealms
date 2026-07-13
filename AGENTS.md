# Thousandfold Realms — Agent Instructions

## Start here

Before changing this repository, read these files in order:

1. `AGENTS.md`
2. `version.json`
3. `docs/CURRENT_STATE.md`
4. `CHANGELOG.md`
5. The most recent relevant file under `docs/`

Treat `main` as the production branch. Meaningful work must be completed on a branch, validated, opened as a pull request, and merged only after checks pass.

## Canonical source

The production website is built directly from `source/`.

- `source/index.html` is the authoritative document shell.
- `source/styles.css` and `source/src/` are the authoritative packaged game source.
- `source/src/main.js` creates the game.
- `source/src/core/boot.js` removes the boot shield only after a real screen is visible.
- `live-overrides/` contains transitional modules that have not yet been folded into their final source files.
- `.github/workflows/deploy-pages.yml` copies `source/` directly into the Pages artifact and injects transitional overrides before `src/main.js`.

Do not restore ZIP-based deployment. `Thousandfold_Realms_Web_v1.4.4-dev.zip` is historical only and must never be used as the production source again.

## Runtime order

The required browser order is:

1. Canonical source data, systems, rendering, and UI classes
2. Transitional CSS in the document head
3. Transitional JavaScript overrides after the packaged classes exist
4. `source/src/main.js`
5. `source/src/core/boot.js`

Do not inject runtime overrides into `<head>`. Several overrides require `AO` classes to exist before they execute.

## Current game rules

- Haven remains the starting town.
- The physical route to Aurelia is Haven → Whisperwood → Southwood Trail → Mosswater Crossing → Ambermeadow → Eastwatch Approach → Lantern Road → Aurelia.
- World, regional, and local map directions must agree with physical exits.
- Fast travel requires physical discovery of both destination and connecting route.
- Fog-of-war persists in saves.
- Ordinary encounters use visible enemies rather than step-count random battles.
- Ordinary enemies follow readable routines and do not chase by default.
- Enemy and animal movement pauses while the player examines interfaces or the browser is not active.
- Town animals are sparse flavor; wilderness wildlife is occasional and can support hunting and resources.
- Bosses, authored guards, and explicit story encounters may remain stationary.

## Save compatibility

Never clear local storage or invalidate saves casually.

- Add state through migration-safe defaults.
- Preserve existing characters, quests, inventory, exploration, fog, defeated enemies, wildlife state, and HUD preferences.
- Keep migrations silent unless the player must make a choice.
- Test both a new game and an older save whenever persistent state changes.

## Development rules

- Prefer editing the appropriate file under `source/` for new core work.
- Use a transitional override only when a safe source integration would be too large for the current pass.
- Do not add another permanent patch layer without documenting why it exists and how it will later be folded into source.
- Keep maps physically navigable and cardinally accurate.
- Do not expose unfinished regions as though they are already reachable.
- Add focused automated validation for every gameplay or deployment regression.
- Update `version.json`, `CHANGELOG.md`, and `docs/CURRENT_STATE.md` at canonical checkpoints.

## Deployment regression checklist

Before merging a production change, verify:

- The title screen appears without flashing the legacy creator or HUD.
- The page title does not contain “Brand Migration.”
- Existing saves still continue.
- New games still reach the character creator.
- Source and override scripts load in the required order.
- Atlas, physical travel, HUD modes, visible patrols, wildlife, tactical combat, dialogue, inventory, quests, saving, and loading still work.
- GitHub Pages is assembled from `source/`, not a ZIP.

## New-chat handoff

A new chat or agent should be given this repository and told:

> Work in `dthornton5280-blip/ThousandfoldRealms`. Treat `main` as production. Read `AGENTS.md`, `version.json`, `docs/CURRENT_STATE.md`, and `CHANGELOG.md` before making changes.
