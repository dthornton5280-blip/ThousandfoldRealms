# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.5.6-dev**
- Build name: **Visible Patrols + Living Wildlife**
- Working branch: **feature/visible-patrols-wildlife-v156**
- Canonical branch after merge: **main**
- Deployment: GitHub Pages

## Active architecture

The live game is assembled from the verified packaged base:

`Thousandfold_Realms_Web_v1.4.4-dev.zip`

Maintained systems and presentation changes live in `live-overrides/` and load after the packaged classes exist but before `src/main.js` creates the game.

Key current overrides include:

- Illustrated title and unified realm UI
- Isolated tactical battlefields
- Living Atlas, persistent fog, and visited-only fast travel
- Physical and directionally accurate Haven-to-Aurelia wilderness roads
- Adaptive Full, Compact, and Hidden exploration HUD modes
- `live-overrides/zzzz-visible-patrols-wildlife-v156.js` for visible patrols and wildlife

The `zzzz-` prefix intentionally places the visible-entity layer after the Atlas and final directional corrections while still loading before game bootstrap.

## Encounter model

Standard combat is now world-represented rather than triggered by invisible step-count rolls.

### Visible hostile rules

- Ordinary enemies exist as visible blocking entities on local maps.
- They move independently in real time; they do not receive a movement turn when the player moves.
- Their default behavior is a deterministic patrol or guard routine.
- They do not randomly wander, automatically seek the player, or dynamically chase by default.
- Existing road enemies use explicit short patrol circuits.
- Enemies without an authored patrol receive a deterministic short back-and-forth route derived from their map and spawn.
- Bosses, quest enemies, and entities marked as guards remain stationary unless explicitly authored otherwise.
- Contact caused by the player or by a patrol starts the existing tactical encounter system.
- Scripted ambushes and authored story encounters remain available, but routine step-based random battles are disabled.

### Examination pause rules

Enemy and animal routines pause when:

- The game is not in exploration mode.
- A panel, dialogue, combat, level-up, or defeat screen is open.
- The adaptive HUD control menu is open.
- The broader RPG menu state is active.
- The browser tab is hidden.
- The browser window loses focus.

This lets the player safely read, inspect, compare equipment, use the Atlas, or manage the HUD without the world advancing behind the interface.

## Wildlife model

### Town wildlife

Town animals are intentionally sparse and contextual:

- One cat near Haven’s inn area.
- One dog in Aurelia’s market district.
- One gull near Aurelia’s river district.

Town animals are flavor-only, follow small routines, and cannot be hunted.

### Wilderness wildlife

The initial wilderness set includes:

- Deer in Whisperwood, Southwood Trail, and the Lantern Road.
- A marsh bird at Mosswater Crossing.
- A hare in Ambermeadow.
- A fox at Eastwatch Approach.

Wildlife appears deterministically on some in-game days rather than occupying every map at all times. Each animal follows a small repeated route that can be watched and timed.

The player can:

- Observe an animal’s routine and record the first observation.
- Attempt a Survival hunt where appropriate.
- Gain Wild Game Meat, Animal Hide, or Wild Feathers from a successful hunt.
- See the animal flee after a failed attempt.

Hunted animals remain absent for several in-game days before they may return. Animal position, routine progress, observations, hunt state, and respawn timing persist in the save.

## Adaptive HUD

Exploration HUD modes remain:

- **Full** — all selected HUD sections visible.
- **Compact** — reduced vitals, map, objective, and prompt coverage.
- **Hidden** — clear field view with a small HUD control tab.

Vitals, minimap, objective, and hints can be toggled independently. Pressing `H` cycles the display modes, and preferences persist between sessions.

## Living Atlas and physical geography

The Atlas retains three levels:

1. **World** — major regions, terrain, charted frontiers, and persistent fog.
2. **Region** — settlements, wilderness maps, roads, dungeons, legends, and route information.
3. **Local** — the exact playable 30×18 map with local visibility and markers.

Fast travel requires a physically visited destination and personally discovered connecting route segments.

The current complete physical journey remains:

1. Haven of the Last Lantern
2. Whisperwood
3. Southwood Trail
4. Mosswater Crossing
5. Ambermeadow
6. Eastwatch Approach
7. The Lantern Road
8. Aurelia — Golden Gate Ward

Eastbound exits advance toward Aurelia; westbound exits return toward Haven. Lantern Mine and Ashen Crypt remain side branches from Whisperwood.

## Persistent state

Current save migration and state include:

- Defeated enemies
- Enemy and animal current positions
- Patrol or routine index
- Observed animals
- Hunted animals and respawn day
- Atlas discoveries and fog reveal points
- Visited destinations and discovered roads
- HUD preferences in local storage
- Existing quests, inventory, equipment, resources, doors, chests, and discoveries

## Automated validation

Existing validation covers:

- Atlas progression, persistent fog, legends, and visited-only fast travel
- Physical Haven-to-Aurelia roads and portal continuity
- Cardinally accurate eastbound and westbound geography
- Adaptive HUD persistence and unobstructed input

The v1.5.6 visible-entity harness additionally verifies:

- Ordinary random encounters are disabled.
- Town wildlife appears contextually and remains non-huntable.
- Wilderness wildlife can appear on deterministic in-game days.
- Enemies receive predictable routines.
- Patrols pause while the player examines a panel.
- Patrols advance independently during normal exploration.
- Patrol collision starts tactical combat.
- Hunting grants resources and records persistent respawn state.
- New wildlife resource items are registered.

## Required live regression checklist

### Patrols

- Watch an enemy for several seconds without moving and confirm it follows a short repeatable route.
- Open Inventory, Character, Journal, Atlas, dialogue, and HUD controls; confirm patrols stop.
- Change browser tabs and confirm patrols do not advance while unfocused.
- Return to exploration and confirm movement resumes.
- Time movement around a patrol and confirm it can be avoided.
- Walk into an enemy and confirm tactical combat starts.
- Allow an enemy patrol to enter the player’s tile and confirm tactical combat starts.
- Confirm defeated enemies remain removed according to existing defeat persistence.

### Wildlife

- Confirm Haven contains only the intended small flavor animal rather than a crowded population.
- Visit the wilderness maps over multiple in-game days and confirm wildlife is occasional.
- Observe an animal and confirm its routine is understandable.
- Attempt a hunt and confirm success grants resources while failure causes the animal to flee.
- Save and reload after moving, observing, or hunting an animal and confirm state persists.
- Advance several in-game days and confirm hunted wildlife can return after its respawn delay.

### Existing systems

- Confirm no invisible encounter triggers occur merely from walking a fixed number of steps.
- Confirm scripted, boss, quest, and stationary guard encounters still function.
- Confirm Atlas, fog, physical travel, adaptive HUD, tactical arenas, camps, resources, quests, saving, and loading still work.

## Known risks and unfinished work

1. The new patrol speeds, routes, and wildlife appearance rates require live visual and gameplay tuning.
2. Only the current Haven-to-Aurelia maps have an initial wildlife population; future regions need their own contextual species and routines.
3. Hunting currently uses a compact interaction and Survival check rather than a dedicated hunting minigame.
4. Wildlife resources are registered and collectible but are not yet deeply integrated into cooking, crafting, merchants, or quests.
5. Existing enemy spawn layouts were not originally authored for moving patrols, so some routes may need map-specific adjustment after live testing.
6. Aurelia and the six future world regions still require substantial settlement, quest, dungeon, and content expansion.

## Next development pass

1. Live-test patrol timing, collision, pause behavior, and animal interaction throughout the existing route.
2. Correct any patrol that blocks a narrow road or uses an awkward route.
3. Tune wildlife frequency so animals remain occasional.
4. Begin the Drowned Fen as the first complete additional region, using visible patrols and contextual wildlife from the start.
5. Add cooking, leatherwork, fletching, hunting quests, and regional wildlife rewards during region content expansion.

## Repository rules

- `main` is the authoritative production state.
- Use branches and pull requests for meaningful changes.
- Do not create numbered ZIPs for routine JavaScript or CSS updates.
- Do not commit temporary transport files.
- Update `version.json`, `CHANGELOG.md`, and this file at each canonical checkpoint.
- Keep gameplay changes small, reversible, and covered by focused validation.
