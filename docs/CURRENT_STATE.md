# Thousandfold Realms — Current Development State

## Canonical checkpoint

- Version: **1.4.6-dev**
- Build name: **Biome Tactical + Animated Title Scene**
- Canonical branch after merge: **main**
- Deployment: GitHub Pages

## Active architecture

The game currently deploys from one verified packaged base:

`Thousandfold_Realms_Web_v1.4.4-dev.zip`

The filename is legacy. It is not a competing active version. Current corrections and additions are stored as readable repository-managed files in `live-overrides/` and injected into the package during deployment.

Active overrides:

- `live-overrides/hud-interaction.css`
- `live-overrides/title-screen-v146.css`
- `live-overrides/title-screen-v146.js`

The v1.4.5 tactical battlefield system is part of the current deployed game state. Temporary payload and split JavaScript transport files are not canonical source and should not exist on `main`.

## What currently works

- Browser-playable game loads through GitHub Pages.
- Animated title screen appears before character creation or gameplay.
- Start, new character, load, and continue controls are wired.
- Existing save detection controls the availability of load and continue.
- Combat transitions to a dedicated biome battlefield.
- Combat records the original world location for return after battle.
- Exploration HUD remains visible without blocking world interaction.

## Known risks and unfinished work

1. The complete editable game source is still partly encapsulated inside the verified package.
2. Battlefield layouts are procedurally distinct but still require visual QA to ensure they feel intentionally authored rather than like rectangular generated maps.
3. Title-screen spacing and hierarchy need testing at common desktop, tablet, and phone dimensions.
4. Combat must be regression-tested for movement, pathfinding, line of sight, ranged targeting, hazards, victory, retreat, saving, loading, and return-to-world behavior.
5. Music redistribution and attribution rights must be confirmed before public commercial release.

## Required regression checklist

### Title and save flow

- Fresh browser with no save disables Load and Continue.
- Start Game opens character creation without unexpectedly resetting selections.
- Create New Character resets creator defaults.
- Back to Title returns cleanly.
- Existing save enables Load and Continue.
- Continue loads the latest save and hides the title screen.

### Exploration

- Mouse and touch movement work beneath the HUD.
- Doors and interactive entities remain clickable.
- Drag and wheel input work.
- HUD collapse control remains clickable.

### Tactical combat

- Encounter opens on an isolated biome battlefield.
- No exploration NPCs or decorative entities leak into combat.
- Player and enemies spawn on walkable, unoccupied tiles.
- Movement cost, cover, elevation, hazards, and line of sight behave correctly.
- Melee and ranged ranges are enforced.
- Multi-enemy encounters remain fair at early levels.
- Victory and retreat return the player to the stored world position.
- Saving and loading during an encounter restore the dedicated battlefield.

### Responsive presentation

- Title screen at 1920×1080, 1366×768, 1024×768, and narrow phone widths.
- Combat HUD does not obscure the tactical field.
- Buttons remain reachable without horizontal scrolling.

## Next recommended development pass

1. Merge this repository cleanup after review.
2. Perform live visual QA of the title scene.
3. Test at least one battle in each major biome family.
4. Improve arena edge treatments and hand-authored template variety.
5. Gradually extract the remaining editable game source from the package into normal repository folders without breaking the verified live deployment.

## Repository rules

- `main` is the only authoritative development state.
- Do not create a new numbered ZIP for routine CSS or JavaScript changes.
- Do not commit payload fragments, base64 transport files, or split one-line JavaScript chunks.
- Update `version.json`, `CHANGELOG.md`, and this file whenever the canonical checkpoint changes.
- Make gameplay changes in small, reversible commits.
