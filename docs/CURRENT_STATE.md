# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.5.3-dev**
- Build name: **Physical Wilderness Road Network**
- Working branch: **feature/physical-road-network-v153**
- Canonical branch after merge: **main**
- Deployment: GitHub Pages

## Active architecture

The live game is assembled from the verified packaged base:

`Thousandfold_Realms_Web_v1.4.4-dev.zip`

Maintained corrections and additions are stored in `live-overrides/` and injected before `src/main.js` creates the game.

Key Atlas and road-network overrides:

- `live-overrides/world-atlas-v150.js`
- `live-overrides/world-atlas-v150.css`
- `live-overrides/world-atlas-v152-exploration.js`
- `live-overrides/world-atlas-v152-exploration.css`
- `live-overrides/world-atlas-v152-travel-copy.js`
- `live-overrides/world-travel-network-v153.js`
- `live-overrides/world-travel-network-v153a-tiles.js`
- `live-overrides/zz-world-atlas-v150-fixes.js`

## Runtime order

The required runtime sequence is:

1. Packaged map data, systems, renderers, cartography UI, and game classes.
2. Base Living Atlas v1.5.0.
3. Persistent exploration and fog v1.5.2.
4. Explicit visited-only travel feedback.
5. Physical wilderness road network v1.5.3.
6. Supported-tile compatibility for the new wilderness maps.
7. Atlas integration fixes.
8. `src/main.js` game bootstrap.

Pull-request and Pages workflows reject missing files, invalid JavaScript, runtime scripts in `<head>`, or incorrect ordering.

## Living Atlas hierarchy

The Map page has three connected scales:

1. **World** — major regions, broad geography, charted frontiers, and persistent world fog.
2. **Region** — settlements, roads, wilderness, dungeons, travel information, and persistent regional fog.
3. **Local** — the exact 30×18 playable map, local landmarks, people, threats, discoveries, and tile visibility.

## Persistent exploration rules

Atlas save data tracks:

- Discovered regions
- Known locations
- Physically visited locations
- Discovered route segments
- Persistent world reveal points
- Persistent regional reveal points
- Travel history and elapsed time
- Current parent location

A destination may be known or rumored without being available for fast travel. Fast travel requires:

- The destination has been physically visited.
- Every route segment between the current and destination locations has been personally discovered.
- The destination permits fast travel.

Dungeons still require entry through their connected local maps.

## Physical Haven-to-Aurelia journey

The road to Aurelia is now a continuous playable chain:

1. **Haven of the Last Lantern**
2. **Whisperwood**
3. **Southwood Trail**
4. **Mosswater Crossing**
5. **Ambermeadow**
6. **Eastwatch Approach**
7. **The Lantern Road**
8. **Aurelia — Golden Gate Ward**

The trip remains approximately thirty in-game hours from Haven to Aurelia, but that distance is now represented by authored wilderness maps rather than one hidden abstract jump.

### Southwood Trail

- Dense forest road descending from Whisperwood.
- Travelers’ camp, lantern mile marker, herbs, flowers, bandits, and mirelings.
- Two-way connection between Whisperwood and Mosswater Crossing.

### Mosswater Crossing

- Wide river map with an actual bridge and wet banks.
- Raised camp platform, stranded merchant cart, resources, and mirelings.
- Two-way connection between Southwood Trail and Ambermeadow.

### Ambermeadow

- Open grain country and abandoned farm roads.
- Fields, fences, camp, cart, road lanterns, resources, and bandits.
- Two-way connection between Mosswater Crossing and Eastwatch Approach.

### Eastwatch Approach

- Rocky patrol country beneath a ruined watch post.
- Ruined guardian, patrol camp, cache, signs, and bandits.
- Two-way connection between Ambermeadow and the Lantern Road.

### Lantern Road

- Existing final approach to Aurelia.
- Western exit now returns to Eastwatch Approach rather than jumping directly to Whisperwood.
- Eastern exit reaches Aurelia’s Golden Gate.

## Regional route graph

Current primary route hours:

- Haven ↔ Whisperwood: 6 hours
- Whisperwood ↔ Southwood Trail: 4 hours
- Southwood Trail ↔ Mosswater Crossing: 5 hours
- Mosswater Crossing ↔ Ambermeadow: 5 hours
- Ambermeadow ↔ Eastwatch Approach: 4 hours
- Eastwatch Approach ↔ Lantern Road: 3 hours
- Lantern Road ↔ Aurelia: 3 hours

Total Haven ↔ Aurelia: **30 hours**.

The Lantern Mine and Ashen Crypt remain side destinations branching from Whisperwood.

## Aurelia city architecture

Aurelia remains a connected city composed of district maps:

- Golden Gate Ward
- Market Ward
- River Ward
- Citadel Heights

The physical wilderness chain enters at the Golden Gate. Additional city interiors, services, guilds, residents, factions, quests, and districts remain future content work.

## Map presentation

World and regional maps use:

- 30×18 pixel-tile terrain fields
- Persistent fog of war
- Soft reveal areas around visited locations
- Revealed route corridors after both endpoints are explored
- Current, visited, known-only, and uncharted markers
- Legends for terrain and marker states
- The established parchment, charcoal, bronze, serif, and engraved-border UI theme

Each new wilderness location also has local landmarks so the existing Local map remains useful throughout the road journey.

## Automated validation

The Atlas harness verifies:

- All existing city maps and four new wilderness maps exist and have valid 30×18 dimensions.
- Every portal is placed on walkable terrain.
- Whisperwood no longer bypasses directly to the Lantern Road.
- Every wilderness map contains a continuous walkable path between its entrances.
- Every portal in the Haven-to-Aurelia chain targets the expected next map.
- A new game cannot fast-travel to unvisited Whisperwood.
- Physical travel records every intermediate location as visited.
- Regional and world fog reveal data persists across the journey.
- Fast travel back to Haven works only after the route is physically completed.
- The complete return journey remains thirty hours.
- World and regional maps still contain pixel terrain, fog, legends, and the new location labels.

## Required live regression checklist

### Physical route

- Leave Haven through the east road into Whisperwood.
- Follow the clearly marked southern trail in Whisperwood.
- Enter Southwood Trail at the southern map edge.
- Continue through Mosswater Crossing, Ambermeadow, Eastwatch Approach, and the Lantern Road.
- Enter Aurelia through the Golden Gate.
- Confirm every map can be traversed in both directions.
- Confirm no portal or blocking object prevents reaching the next exit.

### Atlas progression

- Before visiting, intermediate destinations may be known but must not provide fast travel.
- Entering each map should reveal its regional area and mark it visited.
- Completed road segments should reveal fog corridors.
- After reaching Aurelia, fast travel back to Haven should become available.
- Saving and loading should preserve all visited locations and fog reveals.

### Existing systems

- Haven remains the new-game start.
- Whisperwood, Lantern Mine, and Ashen Crypt still work.
- Existing saves migrate without losing Atlas progress.
- Exploration, combat, camps, signs, resources, chests, saving, and local maps remain functional.
- Title screen and unified UI remain unchanged.

## Known risks and unfinished work

1. The new wilderness maps require live browser visual and collision QA after deployment.
2. Enemy density and camp placement may need tuning after the first complete walk.
3. Regional labels may need spacing adjustments now that four additional locations are present.
4. Road encounters, supplies, weather consequences, secrets, side paths, dungeons, and quest content are intentionally deferred until the physical network is stable.
5. Aurelia still needs substantial city content.
6. Future world regions remain foundations only.

## Next development pass

1. Confirm the complete physical Haven-to-Aurelia walk in the deployed game.
2. Correct any blocked portal, unreadable sign, terrain issue, or Atlas label overlap.
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
