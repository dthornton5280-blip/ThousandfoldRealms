# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.5.8-dev**
- Build name: **Canonical Source Build**
- Working branch: **refactor/canonical-source-v158**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Production architecture

The live website is now assembled directly from the editable `source/` directory.

### Authoritative source

- `source/index.html` — canonical document shell and baked current title screen
- `source/styles.css` — original core stylesheet
- `source/src/` — canonical game data, systems, rendering, UI, and bootstrap files
- `source/src/main.js` — constructs and starts the game
- `source/src/core/boot.js` — removes the boot shield only after the title, creator, or game screen is genuinely visible

### Transitional modules

`live-overrides/` still contains newer systems that have not yet been folded into their final files under `source/`.

They remain supported temporarily because they currently contain the approved title presentation, tactical battlefields, unified UI, Living Atlas, physical road network, adaptive HUD, visible wildlife, and reliable enemy patrol behavior.

The Pages workflow copies `source/` directly, then injects transitional CSS in the document head and transitional JavaScript after the source classes exist but before `src/main.js` creates the game.

### Historical package

`Thousandfold_Realms_Web_v1.4.4-dev.zip` is no longer part of production deployment.

It may remain in the repository as a historical backup, but the workflow must never unzip or deploy it again.

## Startup behavior

The current title screen is baked into `source/index.html` rather than being created after the old page becomes visible.

The page begins with:

- A critical inline boot shield
- `tf-title-mode`
- `tf-booting`
- The legacy creator hidden
- The game screen hidden
- The current title screen already present in the DOM

After all game and transitional modules initialize, `source/src/core/boot.js` waits until a real game screen is visible, removes `tf-booting`, publishes `data-tf-ready="true"`, and hides the boot shield.

This prevents the old creator, old HUD, or partial interface from flashing during refresh.

The browser title is now simply **Thousandfold Realms** rather than **Brand Migration v1.4.4**.

## Save compatibility

Existing saves continue to use the same local-storage save keys and migration-safe state defaults.

The canonical-source conversion does not clear saves and does not intentionally reset:

- Characters
- Inventory and equipment
- Quests
- Defeated enemies
- Atlas discoveries
- Persistent fog
- Visited locations and discovered roads
- Enemy and animal positions
- Hunting and respawn state
- HUD preferences

Save migrations should remain silent unless player input is required.

## Current playable geography

The complete physical route remains:

1. Haven of the Last Lantern
2. Whisperwood
3. Southwood Trail
4. Mosswater Crossing
5. Ambermeadow
6. Eastwatch Approach
7. The Lantern Road
8. Aurelia — Golden Gate Ward

Eastbound exits advance toward Aurelia, and westbound exits return toward Haven.

Lantern Mine and Ashen Crypt remain physical side branches from Whisperwood.

The six additional world regions remain charted future regions until complete physical routes and playable content are authored.

## Living Atlas

The Atlas includes:

1. **World** — major regions, persistent fog, and charted frontiers
2. **Region** — settlements, wilderness maps, roads, dungeons, and route information
3. **Local** — the exact playable 30×18 map with local visibility and markers

Fast travel requires:

- A physically visited destination
- A personally discovered connecting route

World, regional, and local directions must agree with the actual playable exits.

## Encounter model

### Ordinary enemies

- Exist visibly on local maps
- Follow short deterministic patrol or guard routines
- Move independently in real time
- Do not receive a movement turn when the player moves
- Do not randomly wander or chase by default
- Can be watched and avoided by timing movement
- Start tactical combat through player contact or patrol contact

### Stationary encounters

Bosses, explicit guards, authored story encounters, the Stone Troll, and the Ember Warden may remain stationary.

### Pause behavior

Enemy and animal movement pauses while:

- The game is not in exploration mode
- Inventory, Character, Journal, Atlas, dialogue, combat, level-up, or defeat screens are open
- HUD controls are open
- The browser tab is hidden
- The browser window is genuinely blurred

### Random encounters

Routine step-count random battles are disabled.

Scripted ambushes and authored contextual events remain allowed.

## Wildlife

### Town flavor

Town animals remain sparse and contextual:

- One cat around Haven
- One dog in Aurelia’s market
- One gull around Aurelia’s river district

Town animals cannot be hunted.

### Wilderness wildlife

Current wildlife includes deer, hares, foxes, and marsh birds.

Wildlife:

- Appears occasionally according to deterministic in-game-day rules
- Follows a small repeated routine
- Can be observed
- Can be hunted through a Survival interaction where appropriate
- Can provide Wild Game Meat, Animal Hide, or Wild Feathers
- Persists observations, movement, hunting state, and respawn timing

## Adaptive HUD

The exploration HUD retains:

- **Full** mode
- **Compact** mode
- **Hidden** mode
- Independent Vitals, Map, Objective, and Hints controls
- `H` keyboard cycling
- Persistent browser preferences

## Validation

The current automated checks cover:

- Canonical source deployment
- Removal of ZIP deployment dependency
- Baked title markup
- Boot-shield behavior and ordering
- Absence of legacy “Brand Migration” branding
- Atlas progression and fog persistence
- Physical route connectivity
- Cardinal direction consistency
- Visited-only fast travel
- Visible wildlife and hunting
- Reliable enemy patrols
- Examination and browser-focus pause behavior
- Tactical combat on patrol contact
- JavaScript syntax across source, overrides, and tests
- CSS brace balance

## Live regression checklist

After the v1.5.8 Pages deployment:

1. Refresh the game and confirm only the boot shield and current title appear.
2. Confirm no old character creator, old HUD, or “Brand Migration” page flashes.
3. Confirm Continue loads the existing save.
4. Confirm Start Game opens the current character creator.
5. Confirm the title version displays `1.5.8-dev`.
6. Confirm Atlas, fog, physical travel, HUD modes, patrols, wildlife, hunting, tactical combat, dialogue, inventory, quests, saving, and loading still work.
7. Confirm unknown Pages routes return the same canonical game shell through `404.html`.

## Known transitional work

The game is now deployed from canonical editable source, but many newer systems still live in `live-overrides/`.

Future cleanup should fold them into source in controlled groups:

1. Title presentation and unified UI
2. Living Atlas and directional geography
3. Physical wilderness-road content
4. Adaptive HUD
5. Visible wildlife and enemy patrols
6. Tactical battlefield presentation

Each group should be integrated into source only after focused tests prove identical behavior.

## Next content pass

After live confirmation of v1.5.8:

1. Fix any remaining startup or save-loading regression.
2. Tune enemy patrol routes that block narrow passages.
3. Begin the Drowned Fen as the first complete additional region.
4. Build the region as a full vertical slice: physical border route, wilderness maps, settlement, NPCs, shops, quests, dungeons, enemies, wildlife, resources, landmarks, fog, and regional Atlas data.

## Repository rules

- `main` is production.
- Read `AGENTS.md` before modifying the repository.
- Build from `source/`; never restore ZIP-based deployment.
- Use branches and pull requests for meaningful changes.
- Preserve existing saves.
- Add focused validation for regressions.
- Update `version.json`, `CHANGELOG.md`, and this file at canonical checkpoints.
