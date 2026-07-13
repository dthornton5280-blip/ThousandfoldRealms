# Changelog

Canonical development checkpoints for Thousandfold Realms are recorded here. Detailed implementation notes and regression plans live under `docs/` and in the merged pull requests.

## 1.6.0-dev — Asset Catalog + Stable Tavern Rollback

### Fixed
- Disabled the visually incorrect v1.5.9 Pixel Crawler tavern drawing layer by default.
- Restored the previous stable Black Lantern Tavern rendering while preserving gameplay, collisions, doors, NPCs, dialogue, shops, quests, saves, and cellar access.
- Prevented third-party art from rendering unless an explicit `AO.PixelCrawlerArt.enabled` feature flag is approved.

### Added
- `docs/PIXEL_CRAWLER_ART_DIRECTION.md` with the reviewed hybrid art strategy, metadata schema, layering rules, generation rules, and tavern rebuild plan.
- `docs/pixel-crawler/asset_manifest.json` with the reviewed pack counts, source dimensions, category guidance, and redistribution rules.
- `tools/catalog_pixel_crawler.py`, which reads a locally owned ZIP and generates a full 181-file manifest plus labeled 16px-grid previews without unpacking or committing the complete pack.
- A focused v1.6.0 regression harness and updated GitHub Actions validation.

### Decided
- Pixel Crawler remains a strong source for player, NPC, enemy, tree, station, and selected prop art.
- The raw environment sheets will not be sliced as independent 32px tiles. They are 16px connected/autotile and irregular source sheets.
- Production environments will use purpose-built game atlases with named crops, anchors, visual footprints, collision footprints, interaction points, and render layers.
- Custom or generated art will supplement missing regions and landmarks, but generated sheets must be cleaned, validated, and packed by the project rather than trusted as exact production grids.

### Validation
- Confirms the bad tavern pilot is feature-gated off.
- Confirms the stable atlas/procedural fallback remains active.
- Confirms the reviewed pack contains 181 PNG files, including five environment autotiles, 42 player sheets, 19 NPC sheets, and 24 enemy sheets.
- Confirms licensing and public-repository boundaries remain documented.
- Confirms the local catalog tool never extracts the complete pack into the repository.

## 1.5.9-dev — Pixel Crawler Tavern Pilot

### Added
- The first third-party pixel-art runtime integrated directly into canonical source.
- A compact derived atlas made only from the Pixel Crawler - Free Pack assets used by the Black Lantern Tavern pilot.
- Pixel-art floor, wall, rug, raised-stage, counter, table, keg, fireplace, and tavern NPC rendering.
- New art for Bran Hollow and Lys of the Lantern inside the tavern.
- `source/assets/third-party/pixel-crawler/NOTICE.txt` with creator credit, supplied terms, and repository redistribution boundaries.
- A focused art-runtime harness and GitHub Actions workflow.

### Changed
- The renderer now asks the Pixel Crawler art layer for tavern tiles and entities before using the existing game atlas or procedural fallback.
- The pilot is restricted to `theme: tavern`; Haven, wilderness maps, other interiors, dungeons, tactical arenas, and the player sprite remain unchanged.
- The new runtime is embedded as a small PNG data URI so the public repository contains only the exact derived subset used by the game, not the complete downloaded asset pack.

### Preserved
- Tavern layout, collisions, doors, NPC identities, dialogue, shop behavior, quest markers, cellar access, saves, and Atlas behavior.
- Crisp nearest-neighbor canvas rendering and procedural fallbacks when the third-party runtime cannot load.

### Validation
- Confirms the embedded payload decodes to a valid PNG.
- Rejects truncated placeholders in the committed runtime.
- Confirms tavern-only tile and furniture rendering.
- Confirms Bran uses the pilot sprite while unrelated NPCs retain their existing rendering.
- Confirms creator notice and redistribution limits are present.

## 1.5.8-dev — Canonical Source Build

### Added
- A baked current title screen in `source/index.html`.
- A critical inline boot shield that prevents incomplete legacy UI from becoming visible during refresh.
- `source/src/core/boot.js`, which releases the page only after the title, character creator, or game screen is genuinely visible.
- A canonical Pages fallback generated as `404.html`.
- Root `AGENTS.md` with architecture, save-compatibility, gameplay, deployment, and new-chat handoff rules.
- A focused canonical-source regression harness.
- Build metadata identifying the transitional source-plus-overrides architecture.

### Changed
- GitHub Pages now copies the editable `source/` directory directly into the deployment artifact.
- The current title markup exists before JavaScript initialization instead of being inserted after the legacy creator is briefly visible.
- The browser title is now `Thousandfold Realms` rather than `Thousandfold Realms: Brand Migration v1.4.4`.
- The character creator and game screen begin hidden behind the boot shield.
- The title screen version is injected from `version.json` during deployment.
- `docs/CURRENT_STATE.md` now describes the real v1.5.8 architecture and current gameplay.

### Removed from production
- ZIP extraction during deployment.
- Runtime dependence on `Thousandfold_Realms_Web_v1.4.4-dev.zip`.
- Legacy “Brand Migration” presentation in the canonical page.

### Preserved
- Existing local-storage save keys and saved characters.
- Transitional `live-overrides/` behavior while those systems are gradually folded into source.
- Title artwork, unified UI, Living Atlas, fog, physical roads, adaptive HUD, visible wildlife, enemy patrols, and tactical battlefields.

### Validation
- Confirms Pages is assembled with `cp -a source/. _site/`.
- Rejects legacy ZIP references and `unzip` deployment.
- Confirms the title and boot shield are baked into canonical HTML.
- Confirms boot release loads after `src/main.js`.
- Confirms runtime overrides still load after source classes and before game bootstrap.
- Runs Atlas, directional-world, wildlife, enemy-patrol, and canonical-source harnesses.
- Checks JavaScript syntax and CSS brace balance.

## 1.5.7-dev — Reliable Enemy Patrols

### Fixed
- Replaced the unreliable per-frame `document.hasFocus()` gate that could permanently freeze enemies in embedded browser contexts.
- Enemy scheduling now uses elapsed frame time plus real blur, focus, and tab-visibility state.
- Ordinary quest-tagged enemies can patrol unless explicitly designated as a guard, boss, or stationary encounter.

### Added
- Explicit patrol circuits for Whisperwood, the wilderness road network, Lantern Mine, and Ashen Crypt.
- Deterministic local routes for ordinary enemies without authored circuits.
- Route correction to nearby walkable tiles when scenery blocks an authored point.

### Preserved
- Pause behavior during menus and overlays.
- Wildlife movement and hunting.
- Persistent mover positions.
- Tactical combat when a patrol reaches the player.

## 1.5.6-dev — Visible Patrols + Living Wildlife

### Added
- Real-time visible enemy routines.
- Persistent mover positions and route progress.
- Sparse contextual town animals.
- Occasional wilderness deer, hares, foxes, and marsh birds.
- Wildlife observation and Survival-based hunting.
- Wild Game Meat, Animal Hide, and Wild Feathers.
- Initial wildlife pixel sprites.

### Changed
- Ordinary enemies follow deterministic routines rather than moving when the player moves.
- Standard step-count random encounters are disabled.
- Routine combat begins through visible world contact.
- Enemy and animal movement pauses while the player examines interfaces or leaves the active browser context.

## 1.5.5-dev — Adaptive Field HUD

### Added
- Full, Compact, and Hidden HUD modes.
- Independent controls for Vitals, Map, Objective, and Hints.
- `H` shortcut for cycling HUD modes.
- Persistent local HUD preferences.

### Changed
- Compact mode reduces field obstruction.
- Hidden mode clears the playing field while retaining a small HUD control.
- The objective panel no longer stretches unnecessarily across the viewport.

## 1.5.4-dev — Directional Atlas + Cardinal Roads

### Changed
- Repositioned Last Lantern Vale locations into the same west-to-east order used by playable maps.
- Reoriented Southwood Trail, Mosswater Crossing, Ambermeadow, and Eastwatch Approach.
- Added west/east Atlas compass markings.
- Tightened Atlas height, scrolling, labels, legends, and route presentation.

### Fixed
- Eastbound exits advance toward Aurelia.
- Westbound exits return toward Haven.
- Atlas geography now matches playable geography.

## 1.5.3-dev — Physical Wilderness Road Network

### Added
- Southwood Trail.
- Mosswater Crossing.
- Ambermeadow.
- Eastwatch Approach.
- Continuous two-way physical travel between Haven and Aurelia.
- Regional Atlas nodes and route segments for each intermediate map.
- Wilderness camps, enemies, resources, signs, landmarks, and decorations.

### Changed
- Whisperwood no longer skips directly to Lantern Road.
- The Haven-to-Aurelia journey is represented through authored playable maps.
- Fast travel remains locked until physical discovery.

## 1.5.2-dev — Explored Atlas + Persistent Fog

### Added
- Pixel-tile World and Region maps.
- Persistent fog-of-war reveal data.
- Reveal areas around visited destinations and explored routes.
- World and regional legends.
- Named geographic features.

### Changed
- Fast travel requires physically reaching the destination and discovering the connecting route.
- Charted but unvisited locations remain visible but locked.
- Existing visited data migrates into persistent reveal layers.

## 1.5.1-dev — Living Atlas Runtime Hotfix

### Fixed
- JavaScript overrides now load after packaged `AO` classes exist and before `src/main.js` creates the game.
- The World, Region, and Local Atlas tabs now initialize in the live browser.
- Aurelia, regional routes, travel logic, and Atlas migration now install correctly.

## 1.5.0-dev — The Living Atlas

### Added
- World, Region, and Local Atlas levels.
- Seven major world regions for expansion.
- Regional route and travel state.
- Lantern Road.
- Four Aurelia districts.
- Aurelia residents, landmarks, markets, docks, civic spaces, camps, and enemies.

### Changed
- The former local-only map became the Local level of the Living Atlas.
- Regional travel advances in-game time and records journeys.

## 1.4.9-dev — Unified Realm Interface

### Added
- Shared parchment, bronze, charcoal, border, shadow, spacing, focus, and motion language.
- Unified styling across character creation, exploration, dialogue, combat, inventory, equipment, quests, shops, maps, notifications, and level-up screens.

## 1.4.8-dev — Illustrated Title + Floating Menu

### Added
- Approved panoramic title artwork.
- Subtle cinematic drift, mist, light breathing, vignette, and ember motion.
- Responsive title treatment.

### Changed
- Replaced the CSS-built gate scene with the illustrated title.
- Start and Continue became floating fantasy menu controls.

## 1.4.7-dev — Direct Title Flow + Isolated Biome Arenas

### Added
- Dedicated tactical arena layouts by biome family.
- Full-screen tactical renderer and corrected camera framing.
- Editable source under `source/`.

### Changed
- Start opens a reset character creator.
- Continue loads the latest save directly.
- Tactical combat uses isolated temporary arenas rather than copying exploration maps.

### Fixed
- Exploration entities no longer appear inside tactical combat.
- Tactical movement no longer changes exploration positions.
- Legacy saved encounters migrate into isolated arenas.

## 1.4.6-dev — Animated Title Scene

### Added
- First-pass animated title scene.
- Initial title navigation.
- Deployment build metadata.

### Fixed
- Exploration HUD no longer blocks movement and interaction input.

## 1.4.5-dev — Biome Tactical Prototype

### Added
- Biome-specific terrain, cover, hazards, elevation, movement, range, and line-of-sight rules.
- Encounter budgeting and multi-enemy scaling.

## 1.4.4-dev — Historical Packaged Base

The original verified packaged website retained for historical reference. It is no longer used by production deployment as of v1.5.8.
