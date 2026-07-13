# Thousandfold Realms generated runtime art

The production art in this area is project-specific work created for Thousandfold Realms.

## Haven v1.6.1 visual language

The Haven exterior and starter interiors were designed from the approved Haven and Black Lantern Tavern concept sheets, then rebuilt as clean, deterministic pixel primitives in:

`source/src/render/thousandfold_art.js`

The runtime deliberately does not ship either large presentation concept sheet. Labels, borders, sample grids, and ambiguous sheet spacing are reference material rather than game assets.

The canonical renderer provides:

- Detailed 32-pixel terrain built with a 16-pixel source-art discipline
- Modular timber, stone, roof, door, window, sign, prop, and furniture drawing
- Distinct Haven storefront treatments
- Furnished tavern, inn, shop, forge, chapel, arcane shop, upper rooms, and cellar visuals
- Project-owned NPC samples for the tavern and inn cast
- Explicit anchors, visual sizes, collision footprints, interaction footprints, and render ordering

This runtime is not a redistributed copy of the Pixel Crawler pack. Pixel Crawler remains separately credited under `source/assets/third-party/pixel-crawler/NOTICE.txt` and is governed by `docs/PIXEL_CRAWLER_ART_DIRECTION.md`.
