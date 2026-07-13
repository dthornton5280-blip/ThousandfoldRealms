# v1.6.4 — Whisperwood Living Wilderness

## Goal

Carry the project-owned Thousandfold Realms art direction beyond Haven and into the first wilderness vertical slice without changing the established map identity, portals, quests, gathering, enemy patrols, wildlife, camps, treasure, or saves.

## Visual direction

Whisperwood uses a darker lantern-forest palette than Haven while remaining part of the same world:

- Layered pine and broadleaf canopies
- Moss-rich forest floor
- Ferns, flowers, roots, stones, and undergrowth
- Weathered packed-earth road
- Timber bridges over Mosswater
- Deep, shallow, and lily-covered water
- Reeds and pond-edge vegetation
- Cliff faces, stone stairs, waterfall, and overlook
- Amber road wards contrasting against cool forest greens and water blues

All v1.6.4 graphics are project-owned deterministic pixel rendering. The concept sheets and third-party Pixel Crawler pack are not sliced into runtime tiles.

## Existing locations preserved

The original Whisperwood geography remains recognizable:

- Haven road at the western edge
- Mosswater Bridge
- Old Road Camp
- Eastern Overlook
- Lilymere Pond
- Lantern Mine trail
- Road to the Ashen Crypt

The three existing portals keep their IDs and destinations:

- `wilds_to_haven`
- `wilds_to_crypt`
- `wilds_to_mine`

## Living world details

### Existing objects upgraded

- Moon Herb and Dusk Bloom receive distinct gathering art.
- The camp becomes a visible lean-to, fire ring, and woodpile with two-cell collision.
- Road lanterns become tall ward posts with localized amber light.
- The fallen cart becomes the Axemark Wreck with matching collision and a persistent search.
- Both existing treasure chests receive forest-cache presentation while retaining their chest IDs and loot behavior.

### New discoveries

- **Mosswater Ward-Stone** — once-per-day magical and experience interaction.
- **Storm-Felled Cedar** — two-cell fallen log with a deterministic one-time search.
- **Lanterncap Ring** — searchable mushroom circle.
- **Foxroot Hollow** — searchable root chamber near the pond and river bank.
- **Eastern Overlook Cairn** — once-per-day stamina and experience interaction.
- **Mosswater Bridge Marker** — interactive road marker with an intentionally damaged eastern place-name.
- **Lilymere Offering Stone** — low-chance traveler offering search.

Searches and daily uses rely on the existing persistent world-state system, so reloading cannot repeatedly farm them.

## Collision and routes

- The main east-west road remains free of blocking props.
- All three portals remain reachable from the Haven entrance.
- The Old Road Camp, cart, and fallen log use two-cell collision footprints matching their visible bodies.
- Blocking discoveries are placed only on walkable terrain.
- Existing enemy starting positions remain clear.
- Authored mireling, bandit, and deer routine points remain free of added object collision.
- Gatherable herbs and flowers do not block movement.
- Existing patrol and wildlife runtimes remain responsible for movement, pausing during examination, hunting, persistence, and combat contact.

## Project-owned art module

`source/src/render/whisperwood_art.js` extends the canonical art system with:

### Terrain

- Grass
- Packed path
- Timber bridge
- Deep and shallow water
- Waterfall and pool
- Trees and canopy
- Shrubs
- Rocks and moss stone
- Flowers
- Reeds
- Lily water
- Cliff face
- Stone stairs

### Objects

- Road ward lantern
- Camp
- Wrecked cart
- Forest cache
- Ward-stone
- Fallen log
- Mushroom ring
- Root hollow
- Cairn
- Bridge marker
- Offering stone
- Moon Herb
- Dusk Bloom

The module wraps the existing `AO.ThousandfoldArt` interface and claims only the `wilds` theme and `whisper_*` object art IDs. Haven and interior rendering continue through their established modules.

## Regression coverage

The v1.6.4 harness checks:

- Version and composition registration
- Blocking-object overlap
- Placement on walkable terrain
- Main-road and portal clearance
- Reachability of every exit
- Enemy and wildlife route clearance from new props
- Stable camp, chest, and portal identities
- Descriptions, searches, and daily interactions
- Exact multi-cell collision
- Nonblocking gathering nodes
- Rendering coverage for every tile and object art ID
- No runtime presentation-sheet slicing
- Canonical script order before game startup
