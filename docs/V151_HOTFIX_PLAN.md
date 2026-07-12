# v1.5.1 Atlas Load-Order Hotfix

## Problem

The Living Atlas JavaScript was present in the deployed site but executed before the packaged `AO` classes existed. Its defensive guard returned, leaving the old local cartography screen active.

## Fix

- Keep CSS overrides and build metadata in `<head>`.
- Inject JavaScript overrides immediately before `src/main.js`.
- Validate that the packaged main-script marker exists before deployment.
- Verify the assembled site places `world-atlas-v150.js` before `src/main.js` and not in `<head>`.

## Regression targets

- Title screen still initializes before the game begins.
- Tactical override still registers before the game instance is created.
- Living Atlas patches `AO.UI`, `AO.Game`, and `AO.WorldSystem` before `new AO.Game()` runs.
- World / Region / Local tabs appear when Map is opened.
- Existing local cartography remains available under Local.
