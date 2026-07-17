# Shared Natural Water + Shore — v1.6.17 Asset Brief

## Goal

Create the first highly reusable natural-terrain family for Thousandfold Realms: calm woodland water and a grassy damp bank that can be deterministically assembled into explicit shoreline topology. The first live target is Whisperwood; the same family should later support Mosswater, roadside streams, ponds, ruins, and bridge approaches.

## Visual contract

- Match the approved Haven terrain and current Whisperwood grass/road material: crisp top-down pixel art, restrained contrast, earthy olive woodland palette, and readable texture at 32×32 gameplay scale.
- Water must be dark blue-green, quiet, and non-directional. Avoid large reflections, waves, foam, objects, or lighting baked into the material.
- Shore material must feel damp and transitional: dark soil, moss, sparse pebble detail, and subdued grass. It must sit naturally beside the Whisperwood grass rather than reading as a new biome.
- Material source panels are authored art inputs only. Connected edges, corners, channels, islands, and topology variants are built deterministically from the approved source panels.
- Nearest-neighbor rendering only. No smoothing, gradients, antialiasing, text, labels, perspective, or UI treatment.

## Source sheet contract

- Three separated square material panels on flat `#ff00ff`:
  1. deep woodland water;
  2. shallow woodland water;
  3. damp moss-and-soil bank.
- Wide, unambiguous magenta gutters and border.
- Each panel must provide enough uninterrupted material for repeatable 32×32 crops.

## Deterministic output contract

- Two seamless water base variants.
- Explicit cardinal shoreline masks covering all 16 N/E/S/W connectivity states.
- Inner and outer corner coverage, narrow channels, peninsulas, isolated pools, and broad water masses must be visually testable in one topology map.
- Collision remains tile-driven: water is blocked; bank/grass remains walkable. Art must never imply a traversable crossing where collision blocks it.

## Acceptance checks

- No magenta contamination in packed game tiles.
- No visible seams at 1× and 4× nearest-neighbor scale.
- Coastline direction is immediately readable without relying on neighboring props.
- Repeated water does not form an obvious directional stripe.
- Live Whisperwood topology test reads as one coherent region beside the existing grass/road candidate.
- Existing Haven terrain, IDs, collision rules, and fallbacks remain unchanged.
