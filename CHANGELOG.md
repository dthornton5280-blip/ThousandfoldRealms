# Changelog

All notable development checkpoints for Thousandfold Realms are recorded here.

## 1.4.6-dev — Biome Tactical + Animated Title Scene

### Added
- Animated title scene with atmospheric background effects.
- Start Game, Create New Character, Load Game, and Continue Game controls.
- Back-to-title navigation from character creation.
- Build metadata injected during deployment from `version.json`.

### Changed
- Combat uses dedicated biome battlefields instead of a cropped section of the exploration map.
- GitHub Pages now assembles one canonical deployed build from a single verified package and Git-managed overrides.
- Deployment validation rejects temporary payload and JavaScript chunk files.

### Fixed
- Exploration HUD no longer blocks movement, doors, drag gestures, or wheel input.
- Existing saves remain available through the current title flow.

### Known issues
- Battlefield presentation still needs broad visual QA across every biome and arena type.
- The verified packaged base retains its legacy v1.4.4 filename while active code is maintained in Git overrides.
- The title scene needs final desktop and mobile composition testing before a public release.

## 1.4.5-dev — Biome Tactical

### Added
- Dedicated tactical battlefield generation.
- Biome-specific arena catalogs, terrain, cover, hazards, elevation, movement, range, and line-of-sight rules.
- Encounter budgeting and multi-enemy group scaling.

## 1.4.4-dev — Verified packaged base

### Added
- Original complete browser-playable package used as the verified asset and game base.
