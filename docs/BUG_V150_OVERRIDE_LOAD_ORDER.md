# v1.5.0 Atlas Load-Order Bug

The first v1.5.0 deployment injected JavaScript overrides inside `<head>` before the packaged game source was loaded. `world-atlas-v150.js` correctly guarded against missing `AO` classes, but that meant it exited permanently and never installed the World / Region / Local atlas or Aurelia content.

The screenshots from the live build therefore showed the pre-existing local cartography page even though the new files were present in the deployed site.

The permanent fix is to inject CSS and build metadata into `<head>`, but inject JavaScript overrides immediately before `src/main.js`. At that point all packaged data, systems, renderers, UI classes, and game classes exist, while the game instance has not yet been created.
