# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.5.2-dev**
- Build name: **Explored Atlas + Persistent Fog**
- Working branch: **feature/atlas-exploration-v152**
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
- `live-overrides/world-atlas-v152-exploration.js`
- `live-overrides/world-atlas-v152-exploration.css`
- `live-overrides/zz-world-atlas-v150-fixes.js`

The package's editable text source remains under `source/` for inspection and future migration. Binary art, audio, and font assets from the original build remain in the verified package.

## Runtime injection order

Build metadata and CSS load in `<head>`. Packaged data, systems, renderers, UI classes, and game classes load next. Repository-managed JavaScript overrides then load immediately before `src/main.js` creates the game.

The required Atlas order is:

1. Packaged cartography UI.
2. Base Living Atlas v1.5.0.
3. Explored Atlas v1.5.2.
4. Atlas integration fixes.
5. Game bootstrap.

The Pages workflow rejects missing files, invalid JavaScript, unbalanced CSS, runtime scripts placed in `<head>`, or an incorrect order.

## Living Atlas hierarchy

The Map page has three connected scales:

1. **World** — major regions, world geography, charted frontiers, and persistent world fog.
2. **Region** — settlements, roads, dungeons, wilderness, terrain, travel time, danger, and persistent regional fog.
3. **Local** — the existing exact tile map with local exploration percentages, landmarks, people, threats, discoveries, and its own persisted tile visibility.

The open region is **Last Lantern Vale**. The world foundation also includes:

- The Drowned Fen
- The Cinder Marches
- Frostmere Reach
- The Shattered Coast
- The Veiled Highlands
- The Sunken Crown

Those six regions remain future expansions. Their names may become charted through lore, but terrain remains fogged until the player physically reaches them.

## Persistent exploration and fog

Atlas save data now tracks:

- Discovered regions
- Known locations
- Visited locations
- Discovered routes
- Travel history
- Persistent world reveal points
- Persistent regional reveal points
- Current parent location
- Remaining travel hours toward the next in-game day

Visibility rules:

- Physically entering a location adds a persistent reveal area around it on the regional map.
- Fully explored route segments reveal corridors between visited locations.
- Physically entering a region adds a persistent reveal area on the world map.
- A charted or rumored destination can be labeled without revealing surrounding terrain.
- Existing visited-location data migrates into reveal points when an older save is loaded.

## Fast-travel rules

- A destination must be **physically visited** before fast travel unlocks.
- A known but unvisited location is informational only.
- The route between the current location and destination must be personally discovered.
- Dungeons remain local entrances and cannot be fast-traveled into.
- Fast travel advances time, records the journey, saves the game, and loads the destination entry point.
- New characters begin with Haven charted. Whisperwood becomes known from Haven's connected road, and later destinations are learned through continued exploration.

## World and regional cartography style

World and regional views now use the same visual logic as the local map:

- A 30×18 pixel-tile terrain field.
- Grid-visible land, water, road, forest, mountain, wetland, coast, ruin, desert, city, bridge, and cobble terrain.
- Named geographic features such as the Frostmere Spine, Shattered Sea, Blackwater Basin, Lantern Ridge, Mosswater, and Whisperwood.
- Route and river overlays.
- Current, visited, known-only, and uncharted marker states.
- A dedicated World Map Key and Regional Map Key.
- Persistent dark fog with soft reveal edges.

## Last Lantern Vale network

Current regional locations:

- Haven of the Last Lantern
- Whisperwood
- Abandoned Lantern Mine
- The Ashen Crypt
- The Lantern Road
- Aurelia, City of a Thousand Lanterns

Current routes:

- Haven ↔ Whisperwood
- Whisperwood ↔ Lantern Mine
- Whisperwood ↔ Ashen Crypt
- Whisperwood ↔ Lantern Road
- Lantern Road ↔ Aurelia

## Aurelia city architecture

Aurelia is a connected city made of district maps:

- **Golden Gate Ward** — eastern entrance and road traffic.
- **Market Ward** — central junction, merchants, and city navigation.
- **River Ward** — docks, warehouses, and the future coast route.
- **Citadel Heights** — civic archive, High Atlas, and council district.

Named residents currently present:

- Captain Vela Arden
- Tomas Bell
- Yona Marr
- Archivist Maelin

Aurelia still needs interiors, shops, guilds, ambient crowds, factions, and a first city quest line.

## Unified interface system

- The title scene remains the visual reference for the game.
- Non-title UI shares warm parchment text, bronze-gold accents, charcoal surfaces, engraved borders, deep shadows, subtle glow, and restrained motion.
- World, Region, and Local map scales use the same interface language.
- Atlas layouts include keyboard focus, responsive behavior, and reduced-motion handling.
- Pressing **M** opens the Atlas during exploration.

## Tactical combat architecture

- Tactical encounters use temporary isolated biome arenas rather than copied exploration grids.
- Supported biome families are Haven, wilds, fen, mine, crypt, and arcane.
- Exploration entities do not leak into tactical rendering.
- Combat movement does not change persistent exploration coordinates.
- Victory and retreat restore the exploration position.

## Automated validation

The Pages workflow requires:

- `node --check` for every JavaScript override.
- Runtime execution of `tests/world-atlas-v150-harness.js`.
- Balanced CSS braces and required selectors for unified UI, base Atlas, and explored Atlas styles.
- Presence of all Atlas runtime and stylesheet files in the assembled site.
- Correct packaged-cartography → base Atlas → explored Atlas → fixes → bootstrap ordering.
- No Atlas runtime inside `<head>`.

The Atlas harness verifies:

- Five new local maps have valid 30×18 dimensions.
- Haven is registered as visited.
- Whisperwood is known but not initially visited.
- Fast travel to a known-but-unvisited destination is rejected.
- Physical travel through Whisperwood, Lantern Road, and Aurelia records persistent reveal areas.
- Return fast travel to a visited destination succeeds and advances time.
- World and regional markup contain pixel terrain, fog layers, and legends.
- Unvisited dungeons expose no fast-travel action.

## Required live regression checklist

### Atlas progression

- Start a new character and confirm Haven is revealed.
- Confirm Whisperwood is known but cannot be fast-traveled to before visiting.
- Enter Whisperwood physically and confirm its terrain reveal persists after saving and reloading.
- Continue through Lantern Road and confirm road/corridor fog reveal.
- Enter Aurelia physically and confirm fast travel to previously visited settlements becomes available.
- Confirm Aurelia cannot be reached from a fresh save through the Atlas.

### Cartography presentation

- World and Region maps display pixel terrain rather than only colored gradients.
- World, Region, and Local each display a legend or map key.
- Fog hides unseen terrain without hiding usable current/known markers.
- Uncharted world regions do not leak names, biomes, or descriptions.
- Labels remain readable without major overlap at 1920×1080, 1366×768, tablet, and phone widths.

### Existing systems

- Local cartography still renders exact terrain, landmarks, people, enemies, discoveries, and percentages.
- Existing saves load and migrate without losing visited locations.
- Haven remains the new-game start.
- Exploration input, doors, dialogue, inventory, combat, victory, retreat, and saving remain functional.
- Title and unified interface remain unchanged outside Atlas additions.

## Known risks and unfinished work

1. The v1.5.2 Atlas requires live browser visual QA after deployment.
2. The persistent reveal radius may need tuning after testing actual route progression.
3. Existing v1.5.0 saves may contain overly broad `knownLocations`; this no longer grants travel, but labels may remain known.
4. Regional travel records time and danger but does not yet generate route encounters or consume supplies.
5. Future regions have terrain foundations only; their local networks and content are not built.
6. Aurelia needs full city content and interiors.
7. Procedural tactical arenas still need balance sampling.
8. Music redistribution and attribution rights must be confirmed before commercial release.

## Next development pass

1. Merge v1.5.2 after workflow validation.
2. Confirm Pages deployment succeeds.
3. Run the Atlas progression and presentation checklist.
4. Tune fog radii, map labels, terrain patterns, and legend placement from screenshots.
5. Expand Aurelia with interiors, services, ambient residents, factions, and the first city quest line.
6. Add travel encounters and supply use after map progression is stable.

## Repository rules

- `main` is the only authoritative production state.
- Use branches and pull requests for meaningful gameplay or presentation changes.
- Do not create a new numbered ZIP for routine CSS or JavaScript changes.
- Do not commit temporary payload fragments or transport files.
- Update `version.json`, `CHANGELOG.md`, and this file whenever the canonical checkpoint changes.
- Make gameplay changes in small, reversible commits.
