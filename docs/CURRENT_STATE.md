# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.5.1-dev**
- Build name: **Living Atlas Runtime Hotfix**
- Working branch: **fix/atlas-runtime-v151**
- Canonical branch after merge: **main**
- Deployment: GitHub Pages

## Active architecture

The live game is assembled from the verified packaged base:

`Thousandfold_Realms_Web_v1.4.4-dev.zip`

The filename is legacy. Maintained corrections and additions are stored in `live-overrides/` and injected during deployment.

Key active overrides:

- `live-overrides/hud-interaction.css`
- `live-overrides/tactical-battlefields-v147.js`
- `live-overrides/tactical-presentation-v147.css`
- `live-overrides/title-screen-v146.css`
- `live-overrides/title-screen-v146.js`
- `live-overrides/title-screen-v148-art.css`
- `live-overrides/title-art-v148-0.js` through `title-art-v148-4.js`
- `live-overrides/title-art-v148-loader.js`
- `live-overrides/title-version-v148.js`
- `live-overrides/unified-realm-ui-v149.css`
- `live-overrides/world-atlas-v150.js`
- `live-overrides/world-atlas-v150.css`
- `live-overrides/zz-world-atlas-v150-fixes.js`

The package's editable text source remains under `source/` for inspection and future migration. Binary art, audio, and font assets from the original build remain in the verified package.

## Runtime injection order

The first v1.5.0 live deployment contained the Living Atlas files, but JavaScript overrides were injected into `<head>` before the packaged `AO` classes existed. The Atlas guard exited and the browser continued using the legacy local-only cartography screen.

The v1.5.1 deployment now separates presentation and runtime loading:

1. Build metadata and CSS overrides load in `<head>`.
2. Packaged data, systems, renderers, UI classes, and game classes load normally.
3. JavaScript overrides load immediately before `src/main.js`.
4. `src/main.js` creates the game only after the Atlas and other runtime patches are installed.

The Pages workflow rejects any assembly that places the Atlas runtime in `<head>` or outside the required packaged-cartography → Atlas → integration fixes → game-bootstrap order.

## Living Atlas hierarchy

The Map page has three connected scales:

1. **World** — establishes seven named biome regions.
2. **Region** — shows settlements, wilderness, dungeons, roads, travel time, danger, and current position.
3. **Local** — preserves the detailed terrain-and-landmark cartography for the currently loaded map.

The open region is **Last Lantern Vale**. The world layer also establishes:

- The Drowned Fen
- The Cinder Marches
- Frostmere Reach
- The Shattered Coast
- The Veiled Highlands
- The Sunken Crown

Those six regions are visually charted but their travel networks remain closed for later expansions.

## Last Lantern Vale network

Current regional locations:

- Haven of the Last Lantern
- Whisperwood
- Abandoned Lantern Mine
- The Ashen Crypt
- The Lantern Road
- Aurelia, City of a Thousand Lanterns

Regional routes store travel hours and danger. Known settlement and road destinations can be selected from the atlas. Dungeons remain local entrances and cannot be skipped through fast travel.

Atlas save data tracks:

- Discovered regions
- Known locations
- Visited locations
- Discovered routes
- Travel history
- Remaining travel hours toward the next in-game day
- Current parent location

Existing saves receive this structure through the normal migration path.

## Aurelia city architecture

Aurelia is not one oversized grid. It is a connected city made of district maps:

- **Golden Gate Ward** — the eastern entrance and road traffic.
- **Market Ward** — the central junction, merchants, and city navigation.
- **River Ward** — docks, warehouses, and the future route to the Shattered Coast.
- **Citadel Heights** — civic archive, High Atlas, and council district.

The districts connect through ordinary local portals, so Aurelia can expand with additional neighborhoods and interiors without replacing the city foundation.

Named residents currently present:

- Captain Vela Arden
- Tomas Bell
- Yona Marr
- Archivist Maelin

Their dialogue explains the city districts, regional roads, future coast access, and the seven-region world plan.

## Unified interface system

- The title scene remains the visual reference for the entire game.
- The non-title UI shares warm parchment text, bronze-gold accents, charcoal surfaces, engraved borders, deep shadows, subtle glow, and restrained motion.
- World and regional atlas views use the same visual system rather than a separate modern map style.
- The atlas includes responsive layouts, keyboard focus, mobile adjustments, and reduced-motion handling.
- Pressing **M** opens the atlas during exploration.

## Title and save flow

- The approved Thousandfold Realms panorama is the full-screen title artwork.
- Start Game and Continue Game float directly over the landscape without a boxed menu panel.
- Start Game opens character creation directly.
- Continue Game loads the latest save directly and disables itself when no save exists.
- The redundant saved-game control inside character creation remains hidden.

## Tactical combat architecture

- Tactical encounters use temporary isolated biome arenas rather than copied exploration grids.
- Supported biome families are Haven, wilds, fen, mine, crypt, and arcane.
- Exploration entities do not leak into tactical rendering.
- Combat movement does not change persistent exploration coordinates.
- Victory and retreat restore the exploration position.

## Automated validation

The Pages workflow currently requires:

- Syntax validation for every Git-managed JavaScript override.
- Balanced-brace and required-selector validation for the unified UI and Living Atlas stylesheets.
- `tests/world-atlas-v150-harness.js` runtime validation.
- Presence of all Living Atlas runtime and stylesheet files in the assembled Pages site.
- Packaged cartography code before `world-atlas-v150.js`.
- Atlas integration fixes after the main Atlas file.
- All runtime overrides before `src/main.js`.
- No runtime Atlas script inside `<head>`.

The Living Atlas harness verifies:

- Five new local maps have valid 30×18 dimensions.
- Atlas state initializes and migrates.
- Haven is recorded as visited.
- Aurelia is a known destination.
- The Haven-to-Aurelia regional route resolves to 30 hours.
- Arrival occurs at the Golden Gate.
- In-game day and remaining travel hours advance correctly.

## Required live regression checklist

### Atlas

- Pressing M opens the atlas during exploration.
- World, Region, and Local tabs switch without closing the page.
- Current location is marked correctly from interiors, wilderness, dungeons, road, and city districts.
- Haven-to-Aurelia travel advances time and arrives at the Golden Gate.
- Dungeon travel buttons remain unavailable.
- Existing local cartography still renders terrain, landmarks, people, enemies, and discoveries.
- Atlas layout remains usable at desktop and narrow phone widths.

### New local maps

- Whisperwood southern trail reaches the Lantern Road.
- Lantern Road reaches both Whisperwood and Aurelia.
- Golden Gate reaches Market Ward and returns to the road.
- Market Ward reaches Gate, River, and Citadel districts.
- River Ward and Citadel Heights return to Market Ward.
- New NPCs, signs, decoration, camp, enemies, chest, and landmarks render and interact.
- No portal or NPC spawns on blocked terrain.

### Existing systems

- Haven remains the new-game start.
- Existing quests and save files still load.
- Exploration input, doors, dialogue, inventory, combat, victory, retreat, and saving remain functional.
- The title screen and unified interface remain visually unchanged outside the atlas additions.

## Known risks and unfinished work

1. The v1.5.1 runtime-order fix still needs confirmation in the deployed browser build.
2. Aurelia currently establishes four exterior districts; shops, inns, guild interiors, district quests, guards, and ambient citizens are the next city-content pass.
3. Regional travel records time and danger but does not yet generate route encounters or consume supplies.
4. The six future regions are world-map foundations only; their regional networks and local content are not built yet.
5. Procedural tactical arenas still need sampling and balance tuning across every biome.
6. The extracted `source/` tree is reference source; deployment still uses the verified package plus live overrides.
7. Music redistribution and attribution rights must be confirmed before a commercial release.

## Next development pass

1. Merge v1.5.1 after workflow validation.
2. Confirm the Pages deployment succeeds.
3. Verify that the World, Region, and Local tabs appear in the live game.
4. Travel to Aurelia and run the new-map regression checklist.
5. Correct live atlas spacing, label overlap, map readability, or portal placement issues.
6. Expand Aurelia with interiors, services, ambient citizens, factions, and the first city quest line.

## Repository rules

- `main` is the only authoritative production state.
- Use branches and pull requests for meaningful gameplay or presentation changes.
- Do not create a new numbered ZIP for routine CSS or JavaScript changes.
- Do not commit temporary payload fragments or transport files.
- Generated production asset modules must be clearly named, validated, documented, and loaded only by their owning feature.
- Update `version.json`, `CHANGELOG.md`, and this file whenever the canonical checkpoint changes.
- Make gameplay changes in small, reversible commits.
