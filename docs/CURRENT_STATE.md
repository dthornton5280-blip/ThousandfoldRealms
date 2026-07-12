# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.4.8-dev**
- Build name: **Illustrated Title + Floating Menu**
- Working branch: **feature/title-art-v148**
- Canonical branch after merge: **main**
- Deployment: GitHub Pages

## Active architecture

The live game is assembled from the verified packaged base:

`Thousandfold_Realms_Web_v1.4.4-dev.zip`

The filename is legacy. Maintained corrections and additions are stored in `live-overrides/` and injected during deployment.

Key active overrides:

- `live-overrides/hud-interaction.css`
- `live-overrides/tactical-battlefields-v147.js`
- `live-overrides/tactical-presentation-v147.css`
- `live-overrides/title-screen-v146.css`
- `live-overrides/title-screen-v146.js`
- `live-overrides/title-screen-v148-art.css`
- `live-overrides/title-art-v148-0.js` through `title-art-v148-4.js`
- `live-overrides/title-art-v148-loader.js`
- `live-overrides/title-version-v148.js`

The five generated-art modules are compiled production data for the approved title image. The loader joins and validates them before exposing the image to CSS. They are not temporary transport files.

The package's editable text source remains under `source/` for inspection and future migration. Binary art, audio, and font assets from the original build remain in the verified package.

## Title and save flow

- The approved Thousandfold Realms panorama is the full-screen title artwork.
- The image includes the final title wordmark, so the old HTML title and CSS-built gate scene are hidden.
- Start Game and Continue Game float directly over the landscape without a boxed menu panel.
- Start Game resets the creator defaults and opens character creation directly.
- Continue Game loads the latest save directly and disables itself when no save exists.
- The legacy Continue Saved Game button inside character creation remains hidden.
- Back to Title remains available from character creation.
- The title art uses subtle drift, lighting, vignette, and ember animation.
- Reduced-motion settings disable title movement.
- Portrait layouts preserve the complete 16:9 illustration at the top and move the menu below it.

## Tactical combat architecture

- Tactical encounters build a temporary full-size arena from a clean biome palette instead of copying the exploration grid.
- Supported biome families are Haven, wilds, fen, mine, crypt, and arcane.
- Each biome family has five arena templates selected from the encounter seed.
- Combatants receive temporary arena spawn positions.
- The player's exploration map and coordinates are stored in `returnState` and remain unchanged during combat.
- Exploration NPCs, buildings, camps, chests, resources, and decorative entities are removed from the tactical render pass.
- Line of sight and cover use tactical terrain only in isolated arenas.
- Legacy saved encounters migrate to the isolated arena format when resumed.
- The combat canvas centers the arena and fills unused space with biome ambience rather than a one-sided black panel.

## What currently works in code

- Browser-playable deployment through GitHub Pages.
- Direct Start Game and Continue Game behavior.
- Save detection and disabled-state messaging.
- Generated title-art integrity and completeness checks.
- Isolated seeded biome arena generation.
- Tactical movement, cover, terrain cost, hazards, elevation, range, and line of sight.
- Victory and retreat restore the exploration position.
- Exploration HUD interaction hotfix remains active.
- Deployment validates every Git-managed JavaScript override with `node --check`.

## Required live regression checklist

### Illustrated title

- The approved title artwork fills a 1920×1080 or 1648×928 desktop browser without distortion.
- The integrated title remains visible and is not duplicated by HTML text.
- Start Game and Continue Game appear as floating text, not inside a card.
- Hover and keyboard-focus states remain readable without obscuring the artwork.
- A fresh browser disables Continue Game.
- Start Game opens character creation immediately.
- Character creation does not show a redundant Continue Saved Game button.
- Existing saves enable Continue Game and load correctly.
- Back to Title returns cleanly.
- Portrait and phone widths show the full artwork at the top with reachable menu controls.

### Exploration

- Mouse and touch movement work beneath the HUD.
- Doors and interactive entities remain clickable.
- Drag and wheel input work.
- HUD collapse control remains clickable.

### Tactical combat

- Encounter opens on an isolated biome battlefield.
- No exploration NPCs, camps, chests, buildings, or decorative entities leak into combat.
- Arena is centered with no large right-side black cutout.
- Player and enemies spawn on walkable, unoccupied tiles.
- Movement, cover, elevation, hazards, and line of sight behave correctly.
- Camera zoom, pan, recenter, and click-to-tile coordinates remain aligned.
- Victory and retreat return the player to the stored world position.
- Saving and loading during an encounter restore an isolated battlefield.

## Known risks and unfinished work

1. The v1.4.8 title implementation needs live browser visual QA after Pages deployment.
2. The optimized title image is currently compiled into repository-managed JavaScript data modules because the connected GitHub writer accepts UTF-8 text but not direct binary file uploads.
3. Procedural arenas still need live sampling and balance tuning across every biome.
4. The extracted `source/` tree is reference source; deployment still uses the verified package plus live overrides.
5. Music redistribution and attribution rights must be confirmed before a commercial release.

## Next development pass

1. Merge v1.4.8 after validation.
2. Confirm the Pages deployment succeeds.
3. Run title-screen QA at desktop and phone sizes.
4. Test at least one combat encounter in every biome family.
5. Correct live visual issues before expanding content.

## Repository rules

- `main` is the only authoritative production state.
- Use branches and pull requests for meaningful gameplay or presentation changes.
- Do not create a new numbered ZIP for routine CSS or JavaScript changes.
- Do not commit temporary payload fragments or transport files.
- Generated production asset modules must be clearly named, validated, documented, and loaded only by their owning feature.
- Update `version.json`, `CHANGELOG.md`, and this file whenever the canonical checkpoint changes.
- Make gameplay changes in small, reversible commits.
