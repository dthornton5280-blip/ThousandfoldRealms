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
- `source/styles.css` and `source/src/` are the authoritative game source.
- `source/src/main.js` creates the game.
- `source/src/core/boot.js` removes the boot shield only after a real screen is visible.
- `source/src/render/assets.js` contains the original atlases and approved derived runtime art subsets.
- `source/src/render/renderer.js` controls art-layer selection.
- `live-overrides/` contains transitional modules awaiting controlled source integration.
- `.github/workflows/deploy-pages.yml` copies `source/` into the Pages artifact and injects transitional overrides before `src/main.js`.

Do not restore ZIP-based deployment. `Thousandfold_Realms_Web_v1.4.4-dev.zip` is historical only and must never be used as the production source again.

## Runtime order

The required browser order is:

1. Canonical source data, systems, rendering, and UI classes
2. Transitional CSS in the document head
3. Transitional JavaScript overrides after the source classes exist
4. `source/src/main.js`
5. `source/src/core/boot.js`

Do not inject runtime overrides into `<head>`. Several overrides require `AO` classes before they execute.

## Third-party and generated art rules

The project may use properly licensed third-party art, but the public repository must not become a substitute download for an original asset pack.

- Confirm commercial use, modification, redistribution, and attribution terms before integration.
- Record the creator and supplied terms under `source/assets/third-party/<pack>/NOTICE.txt`.
- Commit only exact optimized runtime derivatives actually used by the game.
- Never commit a complete downloaded pack, unused original sheets, or editable `.aseprite` sources unless redistribution is explicitly permitted and operationally necessary.
- Preserve transparent PNG output and nearest-neighbor rendering.
- Keep rendering fallbacks until a converted area passes live visual and gameplay regression testing.
- Separate visual footprint, collision footprint, anchor, interaction point, and render layer.
- Convert areas in controlled vertical slices rather than mixing unrelated art styles across the game.
- Never assume that a source sheet is a regular tile atlas merely because its dimensions are divisible by 16 or 32.
- Never approve environment art solely because an automated harness proves that a PNG loads.

### Pixel Crawler decision

Read `docs/PIXEL_CRAWLER_ART_DIRECTION.md` before working with Pixel Crawler assets.

The approved strategy is a **hybrid, purpose-built atlas pipeline**:

- Use the pack for characters, selected NPCs, skeleton/orc enemies, trees, stations, and selected props.
- Treat environment tilesets as 16px connected/autotile source material, not standalone 32px tiles.
- Treat furniture and prop sheets as irregular packed source sheets requiring named crop rectangles.
- Repack approved pieces into project atlases with explicit metadata.
- Use `tools/catalog_pixel_crawler.py` against a locally owned ZIP to regenerate the catalog.
- Keep the v1.5.9 Pixel Crawler tavern pilot feature-gated off until a replacement passes live visual review.

### Generated assets

Generated artwork is best used for individual objects or small controlled families, such as unique buildings, landmarks, bosses, wildlife, shrines, signs, and region-specific props.

Do not trust one-shot generated sprite sheets, autotile matrices, transparent padding, or long multi-animation sheets without manual cleanup and validation. Pack approved generated assets into runtime atlases ourselves.

## Current game rules

- Haven remains the starting town.
- The physical route to Aurelia is Haven → Whisperwood → Southwood Trail → Mosswater Crossing → Ambermeadow → Eastwatch Approach → Lantern Road → Aurelia.
- World, regional, and local directions must agree with physical exits.
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
- Preserve characters, quests, inventory, exploration, fog, defeated enemies, wildlife state, and HUD preferences.
- Keep migrations silent unless the player must make a choice.
- Test both a new game and an older save whenever persistent state changes.

## Development rules

- Prefer editing the appropriate file under `source/` for new core work.
- Use a transitional override only when safe source integration would be too large for the current pass.
- Do not add another permanent patch layer without documenting why it exists and how it will be folded into source.
- Keep maps physically navigable and cardinally accurate.
- Do not expose unfinished regions as reachable content.
- Add focused automated validation for gameplay, art, licensing, and deployment regressions.
- Update `version.json`, `CHANGELOG.md`, and `docs/CURRENT_STATE.md` at canonical checkpoints.

## Deployment regression checklist

Before merging a production change, verify:

- The title appears without flashing legacy creator or HUD elements.
- The page title does not contain “Brand Migration.”
- Existing saves still continue.
- New games still reach the character creator.
- Source and override scripts load in the required order.
- Atlas, physical travel, HUD modes, patrols, wildlife, tactical combat, dialogue, inventory, quests, saving, and loading still work.
- Converted art remains scoped to intended maps and preserves collisions and interactions.
- Environment art has been visually reviewed at the actual browser scale.
- Third-party notices and redistribution boundaries remain present.
- GitHub Pages is assembled from `source/`, not a ZIP.

## New-chat handoff

A new chat or agent should be told:

> Work in `dthornton5280-blip/ThousandfoldRealms`. Treat `main` as production. Read `AGENTS.md`, `version.json`, `docs/CURRENT_STATE.md`, `CHANGELOG.md`, and `docs/PIXEL_CRAWLER_ART_DIRECTION.md` before changing graphics.
