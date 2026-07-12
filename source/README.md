# Thousandfold Realms v1.4.4-dev — Brand Migration

# Thousandfold Realms — Tactical Usability & Opening Balance Foundation

Thousandfold Realms is an original single-player browser RPG. This development checkpoint builds on the stable v1.3.0 World & Interface release and the v1.4.0 tactical foundation without replacing the stable release.

## Play this checkpoint

Open `PLAY_Thousandfold_Realms_v1.4.4.html` in Chrome, Edge, Firefox, or Safari. On Windows, `START_GAME.bat` opens the standalone file in the default browser.

The stable v1.3.0 release remains the distribution baseline until the full v1.4.0 milestone clears broader progression, class, and region balance testing.

## What changed

### Buildings, doors, signs, and labels

- Exterior door interaction anchors now align with the authored storefront façades.
- Integrated storefront doors no longer draw the old floating door sprite.
- Doors open at the visible doorway, enter through that doorway, return to the correct exterior tile, and close automatically after entry, exit, or walking away.
- Temporary open/closed animation state is not treated as a permanent world change.
- Physical storefront signs remain visible while permanent building-name captions are removed.
- Full establishment names and services appear contextually near the doorway.
- NPC and enemy names appear only when nearby, hovered, or tactically selected.
- Label collision handling reduces overlapping names, signs, and quest markers.

### Tactical combat usability

- Combat occupies a single no-scroll viewport at desktop, tablet, and phone widths.
- A fixed bottom action dock exposes prepared abilities, consumables, Brace, End Turn, Retreat, and the combat log.
- A compact top strip shows battlefield, threat, initiative, turn, and camera controls.
- The exploration HUD collapses during combat instead of forcing the player to scroll through unrelated panels.
- Keyboard controls: `1–6` abilities, `Q` consumables, `Enter` end turn, `Tab` target cycle, `F`/`Home` recenter, `WASD` camera pan, arrows unit movement, `+/-` zoom.
- Right- or middle-button drag pans the battlefield; mouse wheel zooms.
- Camera position and zoom persist in active encounter saves.

### Area-based tactical battlefields

- Encounters use a temporary seeded battlefield derived from the active region.
- Whisperwood includes trail, clearing, stream-crossing, and ridge templates.
- Mine, crypt, fen, ruins, and observatory regions each have their own terrain-template catalog.
- Seeds vary terrain, cover, hazards, lanes, and elevation while retaining the area's visual identity.
- Temporary encounter terrain never rewrites the authored exploration map.

### Opening balance and progression

- Level-one ambient Whisperwood encounters use only opening-tier Mireling Scouts.
- Opening-road enemy offense and durability are reduced at the enemy level—not by inflating player health.
- Stronger ambient enemies cannot bypass the regional threat budget simply because they were chosen first.
- Level-one random groups are restricted to one opening-tier enemy; later group sizes and rosters expand with player level and regional budget.
- Advanced predators keep their stable IDs but have been repositioned farther east, away from Haven's opening road.
- Bandits, Dire Wolves, Thornbacks, elites, and deeper-region enemies enter the difficulty curve through player level, distance, landmarks, and story progression.
- Threat is presented as Favorable, Even, Dangerous, or Deadly before the player commits deeply to a fight.

### Music

- Added a self-contained procedural score with town, wilderness, interior, depths, and combat themes.
- Music begins only after a user gesture to comply with browser autoplay restrictions.
- Region and combat transitions crossfade automatically.
- Music enable/mute and volume settings persist with the save.
- No external audio stream or third-party asset dependency is required.

## Compatibility contract

- The save key remains `thousandfold_realms_modular_save_v2`.
- Existing v1.2.0 and v1.3.0 saves continue through the existing migration path.
- No existing race, class, ability, item, quest, map, enemy, or NPC ID was removed or renamed.
- The positions of three advanced Whisperwood enemies changed, but their IDs and persistent defeated-state references remain unchanged.
- Active encounters store serializable actors, positions, turn order, resources, battlefield template/seed, and camera state in `state.encounter`.

## Validation status

- All JavaScript syntax checks: passing
- Original 15 content/reference/regression suites: passing
- Door alignment, transitions, and auto-close tests: passing
- Fixed action dock and tactical camera tests: passing
- No-scroll combat layouts at 1280, 820, and 520 pixels: passing
- Regional battlefield variation and world-grid immutability tests: passing
- 250 level-one encounter-selection samples: all within the opening threat budget
- 64 representative level-one class simulations: 96.9% overall wins; lowest class sample 75%; no hangs
- Encounter save/reload identity, movement, targeting, hazards, line of sight, victory, and compatibility tests: passing
- Stable v1.3.0 ID-set comparison across races, classes, abilities, items, quests, maps, enemies, and NPCs: passing

See `TACTICAL_USABILITY_CHANGELOG_v1.4.1-dev.md` and `TEST_RESULTS_v1.4.1-dev.txt`.

## Remaining before stable v1.4.0

Broader manual playtesting is still required across all race/class combinations, levels 2–20, authored bosses, quest-specific encounters, difficulty settings, consumable economies, and long-form equipment progression. Music currently uses an original procedural synthesizer; authored recorded tracks can replace or supplement it later without changing the audio-control interface.
