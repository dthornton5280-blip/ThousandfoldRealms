# Changelog

All notable development checkpoints for Thousandfold Realms are recorded here.

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
- Legacy saved tactical encounters migrate into the new isolated arena format when resumed.

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

### Added
- Original complete browser-playable package used as the verified asset and game base.
