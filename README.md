# Thousandfold Realms

Browser-playable development build of the original single-player pixel CRPG.

## Canonical state

- **Current checkpoint:** `v1.4.6-dev — Biome Tactical + Animated Title Scene`
- **Canonical branch:** `main`
- **Current deployment model:** one verified packaged game base plus repository-managed source overrides
- **Live site:** GitHub Pages deployment from this repository

The packaged base is currently `Thousandfold_Realms_Web_v1.4.4-dev.zip`. Despite the legacy filename, it is treated only as the single verified base package for large assets and the original playable build. The active title-screen, HUD-interaction, and tactical changes are maintained in Git and injected during deployment.

There is no v1.4.5 package fallback and no competing active build package. The repository state and `CHANGELOG.md` define what is current.

## Current features

- Dedicated biome battlefields instead of cropped exploration-map combat
- Animated title scene
- Start Game, Create New Character, Load Game, and Continue Game options
- Automatic save-key migration from the former title
- Exploration HUD interaction fix
- Browser-safe audio start after player interaction

## Repository workflow

- Keep large binary assets in the single verified package.
- Keep all current editable CSS and JavaScript changes in `live-overrides/`.
- Do not add numbered ZIP builds for ordinary code changes.
- Do not commit temporary payload chunks or assembly fragments.
- Every push to `main` validates the package and overrides, assembles one `_site`, and deploys it to GitHub Pages.

## Project handoff

Read `docs/CURRENT_STATE.md` before beginning a new development session. It records the active architecture, known issues, testing checklist, and next recommended work.

## Release note

The included music file is a user-supplied development asset. Confirm redistribution and attribution rights before a public commercial release.
