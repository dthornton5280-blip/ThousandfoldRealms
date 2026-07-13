# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.5.9-dev**
- Build name: **Pixel Crawler Tavern Pilot**
- Working branch: **feature/pixel-crawler-tavern-v159**
- Canonical production branch after merge: **main**
- Deployment: **GitHub Pages**

## Production architecture

The live website is assembled directly from the editable `source/` directory.

### Authoritative source

- `source/index.html` — canonical document shell and baked current title screen
- `source/styles.css` — core stylesheet
- `source/src/` — canonical data, systems, rendering, UI, and bootstrap code
- `source/src/main.js` — constructs and starts the game
- `source/src/core/boot.js` — removes the boot shield only after a real screen is visible
- `source/src/render/assets.js` — original atlases plus the first Pixel Crawler pilot runtime
- `source/src/render/renderer.js` — canonical exploration renderer and art-layer selection

### Transitional modules

`live-overrides/` still contains approved systems that have not yet been folded into their final files under `source/`, including the title presentation, unified UI, Living Atlas, physical road network, adaptive HUD, visible wildlife, reliable enemy patrol behavior, and tactical battlefield presentation.

Pages copies `source/` directly, then injects transitional CSS in the document head and transitional JavaScript after source classes exist but before `src/main.js` creates the game.

### Historical package

`Thousandfold_Realms_Web_v1.4.4-dev.zip` is historical only. Production must never unzip or deploy it again.

## Pixel-art integration

### Current pilot

The Black Lantern Tavern is the first playable area using selected Pixel Crawler - Free Pack art by Anokolisa.

The pilot currently replaces tavern-specific rendering for:

- Wood floor variants
- Stone border tiles
- Rug tiles
- Raised-stage tiles
- Bar counter
- Dining tables
- Kegs
- Fireplace / furnace art
- Bran Hollow
- Lys of the Lantern

The renderer checks `AO.PixelCrawlerArt` before the existing atlas and procedural fallback, but only when the active map uses `theme: tavern`.

### Repository redistribution boundary

The repository does not contain the complete downloaded pack or any editable Aseprite source files.

`source/src/render/assets.js` contains one compact derived PNG data URI with only the pieces used by the tavern pilot. The creator notice and supplied terms are recorded in:

`source/assets/third-party/pixel-crawler/NOTICE.txt`

### Preserved gameplay

The visual pilot does not change:

- Tavern map geometry
- Collision tiles
- Doors or cellar access
- NPC IDs, dialogue, shops, quests, or quest markers
- Player position or save structure
- Atlas and fast-travel state
- Other maps, NPCs, enemies, or tactical arenas

If the third-party art fails to load, the existing atlas and procedural rendering remain available.

### Next art milestones

1. Live-tune tavern object scale, anchoring, and visual overlap.
2. Add directional player animation and a reusable character-sprite definition system.
3. Convert Haven exterior buildings, paths, trees, props, and contextual NPCs.
4. Convert Whisperwood and road maps with coherent outdoor tiles and trees.
5. Convert Lantern Mine and Ashen Crypt with dungeon walls, floors, props, and matching enemies.
6. Add region-specific art packs as Drowned Fen and later regions are built.

## Startup behavior

The page begins with the current title screen already present and all unfinished screens hidden behind the critical boot shield.

`source/src/core/boot.js` waits until the title, creator, or game screen is genuinely visible, removes `tf-booting`, publishes `data-tf-ready="true"`, and hides the boot shield.

The browser title is **Thousandfold Realms**. Legacy “Brand Migration” presentation is not part of the canonical page.

## Save compatibility

Existing saves continue to use the same local-storage keys and migration-safe defaults.

The current art integration does not clear or intentionally reset:

- Characters
- Inventory and equipment
- Quests
- Defeated enemies
- Atlas discoveries and fog
- Visited locations and roads
- Enemy and animal positions
- Hunting and respawn state
- HUD preferences

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

Eastbound exits advance toward Aurelia; westbound exits return toward Haven. Lantern Mine and Ashen Crypt remain physical side branches from Whisperwood.

The six additional world regions remain charted future regions until complete routes and playable content are authored.

## Living Atlas

The Atlas includes:

1. **World** — major regions, persistent fog, and charted frontiers
2. **Region** — settlements, wilderness maps, roads, dungeons, and route information
3. **Local** — the exact playable 30×18 map with local visibility and markers

Fast travel requires a physically visited destination and a personally discovered connecting route. World, regional, and local directions must agree with physical exits.

## Encounter model

### Ordinary enemies

- Exist visibly on local maps
- Follow short deterministic patrol or guard routines
- Move independently in real time
- Do not move because the player moved
- Do not randomly wander or chase by default
- Can be watched and avoided by timing movement
- Start tactical combat through player contact or patrol contact

Bosses, explicit guards, and authored story encounters may remain stationary.

Enemy and animal movement pauses while menus, Atlas, dialogue, combat, HUD controls, or other examination screens are open, and while the browser tab is hidden or the window is blurred.

Routine step-count random battles remain disabled. Scripted contextual encounters remain allowed.

## Wildlife

Town animals remain sparse and non-huntable. Wilderness deer, hares, foxes, and marsh birds appear occasionally, follow small routines, can be observed, and may support Survival-based hunting and resources.

## Adaptive HUD

The exploration HUD retains Full, Compact, and Hidden modes; independent Vitals, Map, Objective, and Hints controls; `H` keyboard cycling; and persistent browser preferences.

## Automated validation

Current checks cover:

- Canonical source deployment and boot ordering
- Absence of ZIP deployment and legacy branding
- Atlas progression, fog, roads, and cardinal consistency
- Visited-only fast travel
- Wildlife and hunting
- Reliable enemy patrols and examination pauses
- Tactical combat on patrol contact
- JavaScript syntax and CSS balance
- Pixel Crawler atlas PNG validity
- Tavern-only art scoping
- Pixel-art furniture and Bran rendering
- Fallback preservation for unrelated maps and NPCs
- Third-party creator notice and redistribution boundaries

## Required live regression checklist

After the v1.5.9 Pages deployment:

1. Hard-refresh and confirm the boot shield and current title appear without legacy UI flashes.
2. Continue an existing save and enter the Black Lantern Tavern.
3. Confirm floor, wall, rug, stage, bar, tables, kegs, fireplace, Bran, and Lys use the new art.
4. Confirm the player, doors, chest, signs, quest markers, dialogue, shop, and cellar access still work.
5. Confirm furniture visuals align closely enough with their collision tiles to remain readable.
6. Leave the tavern and confirm Haven and all other maps retain their existing visuals.
7. Save, reload, and re-enter the tavern.
8. Confirm Atlas, fog, HUD modes, patrols, wildlife, tactical combat, inventory, quests, and travel still function.

## Known risks

1. This is a visual pilot, so some furniture may need scale or anchor adjustments after live inspection.
2. Bran and Lys currently use single-frame sprites with a subtle idle bob rather than full directional animation.
3. The player remains procedural, so the tavern temporarily mixes the new NPC style with the existing player style.
4. The complete third-party pack is intentionally not committed; new pieces must be extracted into small derived runtime subsets as they are approved.
5. Other maps remain on the existing atlas until converted deliberately.

## Repository rules

- `main` is production.
- Read `AGENTS.md` before modifying the repository.
- Build from `source/`; never restore ZIP-based deployment.
- Use branches and pull requests for meaningful changes.
- Preserve existing saves.
- Include only approved runtime subsets of third-party art and retain license notices.
- Add focused validation for regressions.
- Update `version.json`, `CHANGELOG.md`, and this file at canonical checkpoints.
