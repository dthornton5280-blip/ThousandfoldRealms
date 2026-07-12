# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.4.7-dev**
- Build name: **Direct Title Flow + Isolated Biome Arenas**
- Working branch: **fix/title-combat-v147**
- Canonical branch after merge: **main**
- Deployment: GitHub Pages

## Active architecture

The live game is assembled from one verified packaged base:

`Thousandfold_Realms_Web_v1.4.4-dev.zip`

The filename is legacy. Current corrections and additions are stored as readable repository-managed files in `live-overrides/` and injected during deployment.

Active overrides:

- `live-overrides/hud-interaction.css`
- `live-overrides/tactical-battlefields-v147.js`
- `live-overrides/tactical-presentation-v147.css`
- `live-overrides/title-screen-v146.css`
- `live-overrides/title-screen-v146.js`

The package's editable text source has also been extracted to `source/` for inspection and future migration. Binary art, audio, and font assets remain in the verified package.

## Title and save flow

- The title screen appears before character creation or gameplay.
- The title menu contains only **Start Game** and **Continue Game**.
- Start Game resets the creator defaults and opens character creation directly.
- Continue Game loads the latest save directly.
- Continue Game disables itself when no save exists.
- The legacy Continue Saved Game button inside character creation is forcibly hidden.
- Back to Title remains available from character creation.
- The title composition uses a moonlit gate, ruins, road, hero silhouette, lantern glow, mist, and responsive sizing rather than a split website-style layout.

## Tactical combat architecture

- Tactical encounters build a temporary full-size arena from a clean biome palette instead of copying the exploration grid.
- Supported biome families are Haven, wilds, fen, mine, crypt, and arcane.
- Each biome family has five arena templates selected from the encounter seed.
- Combatants receive temporary arena spawn positions.
- The player's exploration map and coordinates are stored in `returnState` and remain unchanged during combat.
- Exploration NPCs, buildings, camps, chests, resources, and decorative entities are removed from the tactical render pass.
- Line of sight and cover use tactical terrain only in isolated arenas.
- Legacy saved encounters migrate to the isolated arena format when resumed.
- The combat canvas sizes itself to the available viewport, centers the arena, and fills unused space with biome ambience rather than a one-sided black panel.

## What currently works in code

- Browser-playable deployment through GitHub Pages.
- Direct Start Game and Continue Game behavior.
- Save detection and disabled-state messaging.
- Isolated seeded biome arena generation.
- Tactical movement, cover, terrain cost, hazards, elevation, target range, and line of sight remain connected to the existing combat rules.
- Victory and retreat restore the exploration position.
- Exploration HUD interaction hotfix remains active.
- Deployment validates every Git-managed JavaScript override with `node --check`.

## Required live regression checklist

### Title and save flow

- Fresh browser with no save disables Continue Game.
- Start Game opens character creation immediately.
- Character creation does not show a redundant Continue Saved Game button.
- Back to Title returns cleanly.
- Existing save enables Continue Game.
- Continue Game loads the latest save and hides the title screen.

### Exploration

- Mouse and touch movement work beneath the HUD.
- Doors and interactive entities remain clickable.
- Drag and wheel input work.
- HUD collapse control remains clickable.

### Tactical combat

- Encounter opens on an isolated biome battlefield.
- No exploration NPCs, camps, chests, buildings, or decorative entities leak into combat.
- Arena is centered with balanced side framing and no large right-side black cutout.
- Player and enemies spawn on walkable, unoccupied tiles.
- Movement cost, cover, elevation, hazards, and line of sight behave correctly.
- Melee and ranged ranges are enforced.
- Camera zoom, pan, recenter, and click-to-tile coordinates remain aligned.
- Multi-enemy encounters remain fair at early levels.
- Victory and retreat return the player to the stored world position.
- Saving and loading during an encounter restore an isolated battlefield.

### Biome sampling

- Haven: test at least one square or lane encounter.
- Wilds: test trail, clearing, crossing, ridge, or hollow.
- Fen: test channels, causeway, islands, clearing, or hollow.
- Mine: test gallery, crystal cut, cart lane, chamber, or flooded adit.
- Crypt: test nave, crossing, court, rows, or hollow.
- Arcane: test orbit, chamber, axis, ring, or islands.

### Responsive presentation

- Title screen at 1920×1080, 1648×928, 1366×768, 1024×768, and narrow phone widths.
- Combat HUD does not obscure the tactical field.
- Buttons remain reachable without horizontal scrolling.
- Entering and leaving combat restores the exploration canvas dimensions.

## Known risks and unfinished work

1. The v1.4.7 implementation has passed syntax validation but still needs live browser gameplay QA after Pages deployment.
2. Procedural arenas use authored templates and seeded decoration, but individual tile combinations may need balance or visual tuning after biome testing.
3. The extracted `source/` tree is currently reference source; deployment still uses the verified package plus live overrides.
4. Music redistribution and attribution rights must be confirmed before public commercial release.

## Next recommended development pass

1. Merge the v1.4.7 branch after code review.
2. Confirm the GitHub Pages deployment succeeds.
3. Run the title-flow checklist in a fresh browser and with an existing save.
4. Test at least one combat encounter in every biome family.
5. Fix any runtime or visual issues found during that live pass before expanding content.
6. Continue moving maintained systems from package-only source into normal repository files over time.

## Repository rules

- `main` is the only authoritative production state.
- Use branches and pull requests for meaningful gameplay or presentation changes.
- Do not create a new numbered ZIP for routine CSS or JavaScript changes.
- Do not commit payload fragments, base64 transport files, or split one-line JavaScript chunks.
- Update `version.json`, `CHANGELOG.md`, and this file whenever the canonical checkpoint changes.
- Make gameplay changes in small, reversible commits.
