# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.5.4-dev**
- Build name: **Directional Atlas + Cardinal Roads**
- Working branch: **feature/directional-atlas-v154**
- Canonical branch after merge: **main**
- Deployment: GitHub Pages

## Active architecture

The live game is assembled from the verified packaged base:

`Thousandfold_Realms_Web_v1.4.4-dev.zip`

Maintained corrections and additions are stored in `live-overrides/` and injected before `src/main.js` creates the game.

Key Atlas and travel overrides:

- `live-overrides/world-atlas-v150.js`
- `live-overrides/world-atlas-v150.css`
- `live-overrides/world-atlas-v152-exploration.js`
- `live-overrides/world-atlas-v152-exploration.css`
- `live-overrides/world-atlas-v152-travel-copy.js`
- `live-overrides/world-travel-network-v153.js`
- `live-overrides/world-travel-network-v153a-tiles.js`
- `live-overrides/world-travel-network-v154-directional.js`
- `live-overrides/world-atlas-v154-directional.css`
- `live-overrides/zz-world-atlas-v150-fixes.js`
- `live-overrides/zzz-world-directional-v154.js`

## Runtime order

The required runtime sequence is:

1. Packaged map data, systems, renderers, cartography UI, and game classes.
2. Base Living Atlas v1.5.0.
3. Persistent exploration and fog v1.5.2.
4. Explicit visited-only travel feedback.
5. Physical wilderness road network v1.5.3.
6. Supported-tile compatibility.
7. Directional Atlas and cardinal-road corrections v1.5.4.
8. Atlas integration fixes.
9. Final directional Whisperwood correction.
10. `src/main.js` game bootstrap.

Pull-request and Pages workflows reject missing files, invalid JavaScript, runtime scripts in `<head>`, incorrect ordering, broken directional routes, or malformed Atlas CSS.

## Living Atlas hierarchy

The Map page has three connected scales:

1. **World** — major regions, broad geography, charted frontiers, and persistent world fog.
2. **Region** — settlements, roads, wilderness, dungeons, travel information, and persistent regional fog.
3. **Local** — the exact 30×18 playable map, local landmarks, people, threats, discoveries, and tile visibility.

## Persistent exploration rules

Atlas save data tracks discovered regions, known locations, physically visited locations, discovered route segments, world and regional reveal points, travel history, elapsed time, and current parent location.

Fast travel requires:

- The destination has been physically visited.
- Every route segment between the current and destination locations has been personally discovered.
- The destination permits fast travel.

Dungeons still require entry through their connected local maps.

## Cardinally accurate Haven-to-Aurelia journey

The primary journey now progresses west to east on both the regional Atlas and the playable local maps:

1. **Haven of the Last Lantern**
2. **Whisperwood**
3. **Southwood Trail**
4. **Mosswater Crossing**
5. **Ambermeadow**
6. **Eastwatch Approach**
7. **The Lantern Road**
8. **Aurelia — Golden Gate Ward**

Directional rules:

- Eastbound exits advance toward Aurelia.
- Westbound exits return toward Haven.
- Whisperwood’s mine remains a northern branch.
- The Ashen Crypt remains a separate eastern branch.
- Whisperwood’s Aurelia route now exits east-southeast rather than from the bottom edge.
- The obsolete southbound trail tail from the older compatibility layer is removed.

The complete Haven-to-Aurelia route remains **30 in-game hours**.

## Regional Atlas coordinates

The open region is arranged in the same order as physical travel:

- Haven at the western edge of the explored vale.
- Whisperwood east of Haven.
- Southwood, Mosswater, Ambermeadow, Eastwatch, and the Lantern Road moving progressively east.
- Aurelia at the eastern end of the route.
- Lantern Mine north of Whisperwood.
- Ashen Crypt east-northeast of Whisperwood.

Route lines therefore match the actual entrance and exit directions used in local play.

## Map presentation

World and regional maps use:

- 30×18 pixel-tile terrain fields.
- Persistent fog of war.
- Soft reveal areas around visited locations.
- Revealed route corridors after both endpoints are explored.
- Current, visited, known-only, and uncharted markers.
- Legends for terrain and marker states.
- North, west, and east compass markings.
- The established parchment, charcoal, bronze, serif, and engraved-border UI theme.

The desktop Atlas now fits within the usable browser viewport more cleanly. The map and detail card share a fixed responsive height, while the detail card scrolls internally when its legend or city information is longer than the available space.

## Automated validation

The original Living Atlas harness verifies:

- Map definitions and dimensions.
- Visited-only fast travel.
- Persistent fog and reveal points.
- The complete physical journey.
- World and regional legends and pixel terrain.

The v1.5.4 directional harness additionally verifies:

- Haven through Aurelia increase monotonically eastward on the regional Atlas.
- Every forward portal uses the east edge.
- Every return portal uses the west edge.
- Southwood, Mosswater, Ambermeadow, Eastwatch, and Lantern Road have continuous west-to-east roads.
- Whisperwood connects Haven to its east-southeast Southwood exit.
- The fitted Atlas layout and cardinal compass CSS remain present.

## Required live regression checklist

### Physical route

- Leave Haven through the east road into Whisperwood.
- Follow the east-southeast Southwood branch rather than the mine or crypt branches.
- Cross each wilderness map from west to east.
- Enter Aurelia through the Golden Gate.
- Walk the entire route backward and confirm west exits return toward Haven.
- Confirm no portal or blocking object prevents reaching the next exit.

### Atlas

- Confirm Haven appears west of Whisperwood.
- Confirm every intermediate road location progresses east toward Aurelia.
- Confirm Mine and Crypt remain side branches rather than part of the main road.
- Confirm route lines connect the same locations and directions seen in local play.
- Confirm the World and Region pages fit without awkward page-length overflow at common desktop sizes.
- Confirm the detail sidebar scrolls internally when necessary.
- Confirm fog, legends, labels, and save persistence remain intact.

### Existing systems

- Haven remains the new-game start.
- Whisperwood, Lantern Mine, and Ashen Crypt still work.
- Existing saves migrate without losing Atlas progress.
- Exploration, combat, camps, signs, resources, chests, saving, and local maps remain functional.
- Title screen and unified UI remain unchanged.

## Known risks and unfinished work

1. The directional route and fitted Atlas layout still require live browser visual QA after deployment.
2. Labels may need minor spacing adjustments after all intermediate locations become revealed simultaneously.
3. Enemy density and camp placement may need tuning after a complete walk.
4. Road encounters, supplies, weather consequences, secrets, side paths, dungeons, and quest content remain intentionally deferred until route stability is confirmed.
5. Aurelia still needs substantial city content.
6. Future world regions remain foundations only.

## Next development pass

1. Confirm the complete eastbound and westbound Haven-to-Aurelia walk in the deployed game.
2. Correct any remaining portal, sign, label, fog, or collision issue.
3. Add simple road events and ambient travelers after route stability is confirmed.
4. Add optional side paths, hidden locations, dungeons, and secrets afterward.
5. Expand Aurelia district content.

## Repository rules

- `main` is the authoritative production state.
- Use branches and pull requests for meaningful changes.
- Do not create a new numbered ZIP for routine JavaScript or CSS updates.
- Do not commit temporary transport files.
- Update `version.json`, `CHANGELOG.md`, and this file at each canonical checkpoint.
- Keep gameplay changes small, reversible, and validated.
