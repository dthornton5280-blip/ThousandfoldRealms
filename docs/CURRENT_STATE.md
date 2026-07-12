# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.4.9-dev**
- Build name: **Unified Realm Interface**
- Working branch: **feature/unified-realm-ui-v149**
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
- `live-overrides/unified-realm-ui-v149.css`

The five generated-art modules are compiled production data for the approved title image. The loader joins and validates them before exposing the image to CSS.

The package's editable text source remains under `source/` for inspection and future migration. Binary art, audio, and font assets from the original build remain in the verified package.

## Unified interface system

- The title scene remains the visual reference for the entire game.
- The non-title UI now shares warm parchment text, bronze-gold accents, charcoal surfaces, engraved borders, deep shadows, subtle glow, and restrained motion.
- The unified stylesheet is scoped to `body:not(.tf-title-mode)` so the approved title artwork and floating title menu are not altered.
- Shared button, input, dropdown, focus, disabled, selected, scrollbar, meter, and reduced-motion treatments are applied globally.
- Character creation uses stronger fantasy hierarchy, bronze section dividers, deeper portrait framing, and selected-card glow.
- Exploration HUD panels are darker and more transparent so the world remains visually dominant.
- Inventory, equipment, quests, journal, shops, maps, codex, character pages, and settings inherit the same panel and typography language.
- Dialogue uses cinematic framing, parchment body text, bronze speaker treatment, and integrated choices.
- Combat and tactical overlays use the same charcoal-bronze hierarchy with clearer ability, meter, status, and action states.
- Toasts, level-up, defeat, and system feedback are now visually consistent with the rest of the interface.

## Title and save flow

- The approved Thousandfold Realms panorama is the full-screen title artwork.
- Start Game and Continue Game float directly over the landscape without a boxed menu panel.
- Start Game resets the creator defaults and opens character creation directly.
- Continue Game loads the latest save directly and disables itself when no save exists.
- The legacy Continue Saved Game button inside character creation remains hidden.
- Back to Title remains available from character creation.
- The title art uses subtle drift, lighting, vignette, and ember animation.
- Reduced-motion settings disable title movement.

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
- Unified non-title interface theme loaded through the live override pipeline.
- Isolated seeded biome arena generation.
- Tactical movement, cover, terrain cost, hazards, elevation, range, and line of sight.
- Victory and retreat restore the exploration position.
- Exploration HUD interaction hotfix remains active.
- Deployment validates every Git-managed JavaScript override with `node --check`.

## Required live regression checklist

### Character creation

- The approved title remains unchanged when returning to the title screen.
- Creator header, panels, choices, stats, inputs, and Begin the Oath button use the unified theme.
- Selected race, class, and background cards remain clearly distinguishable.
- All creator controls remain readable and clickable at desktop and phone widths.

### Exploration and RPG pages

- HUD panels remain readable without blocking world interaction.
- Mouse, touch, doors, drag, wheel, and HUD collapse controls continue to work.
- Inventory, journal, character, skills, map, crafting, codex, settings, shops, and dialogue pages remain usable.
- Focus-visible and hover states remain clear without excessive glow.
- Scrollbars and long content areas remain usable.

### Tactical combat

- Encounter opens on an isolated biome battlefield.
- No exploration entities leak into combat.
- Arena remains centered with no large right-side black cutout.
- Tactical HUD, action dock, meters, statuses, and ability controls remain legible.
- Movement, cover, elevation, hazards, line of sight, victory, retreat, save, and load behavior remain unchanged.

## Known risks and unfinished work

1. The v1.4.9 stylesheet needs live visual QA across the creator, HUD, dialogue, RPG pages, and combat.
2. Some dynamically generated content may use rare one-off classes that need a second styling pass after live screenshots.
3. Procedural arenas still need sampling and balance tuning across every biome.
4. The extracted `source/` tree is reference source; deployment still uses the verified package plus live overrides.
5. Music redistribution and attribution rights must be confirmed before a commercial release.

## Next development pass

1. Merge v1.4.9 after review.
2. Confirm the Pages deployment succeeds.
3. Capture screenshots of character creation, exploration HUD, one dialogue, inventory, and one battle.
4. Correct any spacing, contrast, or dynamic-class gaps found in live QA.
5. Continue biome combat testing after the interface pass is stable.

## Repository rules

- `main` is the only authoritative production state.
- Use branches and pull requests for meaningful gameplay or presentation changes.
- Do not create a new numbered ZIP for routine CSS or JavaScript changes.
- Do not commit temporary payload fragments or transport files.
- Generated production asset modules must be clearly named, validated, documented, and loaded only by their owning feature.
- Update `version.json`, `CHANGELOG.md`, and this file whenever the canonical checkpoint changes.
- Make gameplay changes in small, reversible commits.
