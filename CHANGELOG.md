# Changelog

All notable development checkpoints for Thousandfold Realms are recorded here.

## 1.5.6-dev — Visible Patrols + Living Wildlife

### Added
- Real-time visible enemy routines on exploration maps. Ordinary enemies follow deterministic patrol or guard routes rather than wandering randomly or automatically hunting the player.
- Persistent mover state for enemy and animal positions, route progress, and hunted-animal respawn timing.
- Minimal contextual town wildlife: one cat in Haven, one market dog in Aurelia, and one river gull near Aurelia’s docks.
- Occasional day-seeded wilderness wildlife including deer, hares, foxes, and marsh birds.
- Wildlife interactions for observing routines and making Survival hunting checks.
- Hunting resources: Wild Game Meat, Animal Hide, and Wild Feathers.
- Custom pixel sprites for the initial wildlife set.

### Changed
- Enemy routines advance independently in real time rather than taking a turn whenever the player moves.
- Patrols pause whenever the player opens panels, dialogue, combat, level-up or defeat screens, the HUD control menu, changes browser tabs, or moves focus away from the game.
- Standard step-count random encounters are disabled. Routine combat now begins from a visible hostile entity through player contact, player interaction, or patrol collision.
- Town animals are flavor-only and cannot be hunted.
- Wilderness animals appear only on some in-game days and return after a region-appropriate respawn delay when hunted.

### Preserved
- Scripted ambushes, bosses, quest encounters, and stationary guards remain available where authored.
- Existing tactical arenas, defeat persistence, exploration movement, save migration, fog, Atlas routes, and HUD controls remain intact.

### Validation
- A dedicated harness verifies random encounters are disabled, patrols advance in real time, movement pauses during examination screens, patrol collision starts tactical combat, town animals remain non-huntable, and wilderness hunting grants persistent resources.
- Pull-request and main-branch workflows validate JavaScript syntax, runtime ordering, and the complete visible-entity harness.

## 1.5.5-dev — Adaptive Field HUD

### Added
- Full, Compact, and Hidden exploration HUD modes.
- Independent visibility controls for vitals, minimap, objective, and control hints.
- The `H` shortcut for cycling HUD modes during exploration.
- Persistent HUD preferences stored between sessions.

### Changed
- Compact mode reduces HUD coverage and suppresses the nearby prompt until an interaction is actually available.
- Hidden mode clears the playing field while retaining a small HUD control tab.
- The objective display no longer stretches unnecessarily across the bottom of the viewport.

### Validation
- A dedicated HUD harness checks persistent modes, selective sections, keyboard cycling, unobstructed input, nearby-prompt behavior, responsive styling, and reduced-motion handling.

## 1.5.4-dev — Directional Atlas + Cardinal Roads

### Changed
- Repositioned Last Lantern Vale locations so the regional atlas follows the same west-to-east journey used in local exploration.
- Reoriented Southwood Trail, Mosswater Crossing, Ambermeadow, and Eastwatch Approach into continuous west-to-east maps.
- Moved Whisperwood’s Southwood exit to the east-southeast edge while preserving its separate northern mine and eastern crypt branches.
- Added west and east markings to Atlas compasses.
- Tightened the desktop Atlas height, sidebar scrolling, labels, legend spacing, and route-line presentation so the page fits normal browser viewports more cleanly.

### Fixed
- Aurelia, the Lantern Road, Eastwatch, Ambermeadow, Mosswater, Southwood, Whisperwood, and Haven now appear in the same cardinal order in both Atlas and playable maps.
- Eastbound exits now advance toward Aurelia; westbound exits return toward Haven.
- Removed the obsolete southbound Whisperwood trail tail left behind by the earlier compatibility layer.

### Validation
- A dedicated directional harness verifies monotonic eastward Atlas coordinates, east-edge forward portals, west-edge return portals, 30×18 dimensions, and continuous west-to-east roads.
- Pull-request and Pages workflows validate the fitted layout stylesheet and final runtime ordering.

## 1.5.3-dev — Physical Wilderness Road Network

### Added
- Four fully explorable wilderness maps between Whisperwood and the existing Lantern Road:
  - Southwood Trail
  - Mosswater Crossing
  - Ambermeadow
  - Eastwatch Approach
- Continuous two-way portals from Haven through Whisperwood and every road map to Aurelia’s Golden Gate.
- Distinct forest, river-crossing, meadow, and rocky approach terrain with camps, road signs, resources, enemies, landmarks, and small environmental details.
- Regional Atlas locations and route segments for every intermediate travel map.
- A clear east-road sign in Haven and a south-road sign in Whisperwood.

### Changed
- Whisperwood no longer jumps directly to the Lantern Road; the player must physically traverse the wilderness journey first.
- The original thirty-hour Haven-to-Aurelia travel distance is now represented by multiple authored map segments rather than a hidden abstract route.
- The Lantern Road’s western exit now connects to Eastwatch Approach.
- Fast travel still unlocks only after a destination and its connecting route have been physically explored.

### Validation
- The Atlas harness checks every portal in the Haven-to-Aurelia chain.
- Every intermediate map must be 30×18, use walkable portal tiles, and contain a continuous route between its entrances.
- The harness physically visits all intermediate locations before validating the thirty-hour return fast-travel journey.
- Pull-request and Pages workflows verify the new runtime files and their load order before game bootstrap.

## 1.5.2-dev — Explored Atlas + Persistent Fog

### Added
- Pixel-tile terrain on the World and Region maps so both scales visually relate to the existing local cartography.
- Persistent world and regional fog-of-war reveal data stored in the save state.
- Soft reveal areas around every physically visited destination and along completely explored routes.
- World and regional legends covering terrain, current position, visited destinations, charted destinations, and unseen territory.
- Named geographic features including mountain chains, forests, rivers, basins, roads, coasts, ruins, and city terrain.

### Changed
- Fast travel now unlocks only after the player physically reaches a destination.
- A known or rumored location may appear on the atlas, but it cannot be used as a teleport destination.
- New characters begin with Haven charted; neighboring destinations are learned through normal exploration rather than being pre-unlocked.
- Regional route calculations for fast travel use only personally discovered road segments.
- World details no longer reveal names, biomes, or descriptions for truly uncharted regions.

### Preserved
- Local-map fog, exploration percentages, landmarks, people, threats, discoveries, and legends remain intact.
- Existing visited-location data migrates into the new persistent world and regional visibility layers.
- Previously visited locations remain available for fast travel when a fully explored route connects them.

### Validation
- The Living Atlas harness rejects fast travel to known-but-unvisited destinations.
- The harness verifies persistent reveal points, pixel terrain, fog layers, both legends, and a valid return journey after physical exploration.
- Pages deployment validates the new runtime ordering and required fog/legend stylesheet sections.

## 1.5.1-dev — Living Atlas Runtime Hotfix

### Fixed
- JavaScript overrides now load after the packaged `AO` classes exist and before `src/main.js` creates the game instance.
- The Living Atlas no longer exits during page startup, so the World, Region, and Local tabs can replace the legacy local-only map screen.
- Aurelia, the Lantern Road, regional routes, travel logic, and atlas save migration now install in the live browser build.

### Deployment validation
- The assembled page must place packaged cartography code before `world-atlas-v150.js`.
- `world-atlas-v150.js` and its integration fixes must appear before `src/main.js`.
- Runtime JavaScript is rejected if it is accidentally injected into `<head>` again.

## 1.5.0-dev — The Living Atlas

### Added
- A three-level atlas with **World**, **Region**, and **Local** map scales.
- A stylized world map establishing seven major biome regions for future expansion.
- A fully connected regional map for Last Lantern Vale with travel routes, times, danger ratings, discoveries, and current-position tracking.
- Persistent atlas data for known locations, visited locations, discovered routes, travel history, and elapsed travel time.
- Regional fast travel between known settlements and roads while preserving local dungeon entrances.
- The `M` keyboard shortcut for opening the atlas during exploration.
- The Lantern Road as a new explorable wilderness map connecting Whisperwood to Aurelia.
- Aurelia, City of a Thousand Lanterns, built as four connected district maps:
  - Golden Gate Ward
  - Market Ward
  - River Ward
  - Citadel Heights
- Four named Aurelia residents with city, route, district, coast, and world-atlas dialogue.
- New city landmarks, signs, lanterns, markets, docks, civic spaces, road enemies, camp, and treasure.
- A runtime harness validating map dimensions, atlas migration, regional travel, arrival, and travel-time advancement.

### Changed
- The existing detailed cartography screen now serves as the **Local** level of the Living Atlas rather than the only map view.
- Whisperwood now includes a southern route to the Lantern Road.
- Existing and new maps automatically register their parent location and region when visited.
- Regional travel advances in-game time and records the journey in the save file.
- The atlas uses the established parchment, charcoal, bronze, serif, engraved-border, and restrained-motion interface theme.

### Preserved
- Haven remains the starting town.
- Existing Haven interiors, Whisperwood, Lantern Mine, Ashen Crypt, quests, combat, saves, title flow, and unified UI remain intact.
- Dungeons cannot be bypassed through fast travel; they must still be entered from their connected local map.

### Validation
- Every new JavaScript override passes `node --check` before deployment.
- The Living Atlas runtime harness verifies five new maps and the complete Haven-to-Aurelia route.
- The Pages workflow validates the world and regional atlas stylesheet before deployment.
- The assembled site must contain both Living Atlas override files.

## 1.4.9-dev — Unified Realm Interface

### Added
- A shared visual system for parchment text, bronze-gold accents, charcoal panels, borders, shadows, controls, spacing, and motion.
- Unified fantasy styling for the character creator, exploration HUD, RPG pages, dialogue, combat, inventory, equipment, quests, shops, maps, notifications, and level-up screens.
- Consistent hover, focus-visible, disabled, selected, and reduced-motion states across the interface.
- Themed scrollbars, inputs, dropdowns, keyboard hints, meters, tabs, dialogue choices, and combat abilities.

### Changed
- Browser-like boxes and flat gray controls now use the same illustrated fantasy language established by the title screen.
- Character creation now reads as an oath-forging screen with parchment headings, bronze dividers, deeper portrait framing, and selected-card glow.
- Exploration HUD panels are darker, more transparent, and less visually intrusive over the world.
- Full-screen RPG pages use a consistent charcoal, parchment, and bronze hierarchy instead of separate one-off styles.
- Dialogue and combat overlays now use cinematic framing and stronger information hierarchy.

### Preserved
- Title artwork and floating title menu remain unchanged.
- Save behavior, character creation logic, exploration controls, tactical rules, combat behavior, and content data are untouched.

### Validation
- The unified stylesheet is loaded last through the existing sorted live-override pipeline.
- All selectors are scoped away from `body.tf-title-mode` so the approved title scene is not restyled.
- Responsive and reduced-motion rules are included in the same theme layer.

## 1.4.8-dev — Illustrated Title + Floating Menu

### Added
- The approved panoramic Thousandfold Realms artwork is now the production title-screen asset.
- Subtle cinematic drift, light breathing, vignette, and ember motion bring the still illustration to life without changing the artwork.
- Responsive title treatment preserves the full illustration on narrow portrait screens.

### Changed
- The old CSS-built gate scene and duplicate HTML title are hidden in favor of the finished illustrated title asset.
- Start Game and Continue Game now appear as floating fantasy menu words over the landscape rather than inside a boxed website-style panel.
- Hover, keyboard-focus, disabled-save, and reduced-motion states were restyled to match the illustrated title.

### Fixed
- Removed the visual card around the title menu.
- Prevented the menu from covering or clipping the integrated Thousandfold Realms wordmark at common desktop sizes.

### Validation
- The optimized title art is integrity-checked by the browser loader before it is displayed.
- All generated artwork data modules and title scripts are validated with `node --check` by the Pages deployment workflow.

## 1.4.7-dev — Direct Title Flow + Isolated Biome Arenas

### Added
- Five dedicated arena layouts for each supported biome family: Haven, wilds, fen, mine, crypt, and arcane.
- A full-screen tactical renderer with centered arena framing, biome-colored ambience, responsive canvas sizing, and corrected camera coordinates.
- Extracted editable text source under `source/` for normal repository review and maintenance.
- Scenic title composition with moonlit ruins, a gate, road, hero silhouette, lantern light, mist, and responsive framing.

### Changed
- Start Game now opens a freshly reset character creator directly.
- Continue Game now loads the latest save directly and disables itself when no save exists.
- The title menu now contains only Start Game and Continue Game.
- Tactical combat now builds a clean temporary arena rather than copying the exploration grid.
- Combatants receive arena-specific spawn positions while their exploration positions remain unchanged.
- The battlefield fills the tactical viewport with balanced framing instead of leaving a large one-sided black area.

### Fixed
- Removed the redundant Create New Character and Load Game buttons from the title menu.
- Removed the redundant Continue Saved Game button from character creation.
- Prevented exploration NPCs, tents, campfires, chests, buildings, and other world entities from rendering inside tactical combat.
- Prevented combat movement from permanently moving the player or enemies on the exploration map.
- Line of sight and cover in isolated arenas now use arena terrain only.
- Legacy saved encounters migrate into the new isolated arena format when resumed.

### Validation
- All Git-managed JavaScript overrides pass `node --check` before deployment.
- The deployment workflow verifies the title and tactical override files are present in the assembled Pages build.

## 1.4.6-dev — Animated Title Scene

### Added
- First-pass animated title scene with atmospheric background effects.
- Initial title-menu and back-to-title wiring.
- Build metadata injected during deployment from `version.json`.

### Changed
- GitHub Pages assembles one canonical deployed build from a single verified package and Git-managed overrides.
- Deployment validation rejects temporary payload and JavaScript chunk files.

### Fixed
- Exploration HUD no longer blocks movement, doors, drag gestures, or wheel input.

### Known issues at that checkpoint
- The first title scene read like a split website landing page and had clipping at common desktop sizes.
- The active tactical build still copied the exploration grid and could display exploration entities in combat.
- The verified packaged base retained its legacy v1.4.4 filename while active code was maintained in Git overrides.

## 1.4.5-dev — Biome Tactical Prototype

### Added
- Initial tactical battlefield-generation prototype.
- Biome-specific terrain, cover, hazards, elevation, movement, range, and line-of-sight rules.
- Encounter budgeting and multi-enemy group scaling.

## 1.4.4-dev — Verified packaged base
