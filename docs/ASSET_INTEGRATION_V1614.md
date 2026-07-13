# Approved Asset Integration — v1.6.14

This is the source of truth for the art currently supplied, what the game actually uses, and what is still needed. It prevents later passes from silently substituting old procedural art or misreading a presentation sheet as a uniform tile grid.

## Approved project-owned sources

| Source | SHA-256 | Production use |
| --- | --- | --- |
| `reference/approved/haven_ground_tileset_source.png` | `b6b9cc27a0e783bc00a169c126fd48e1361cac21561dbdb17acbd61a5d1024cd` | Haven grass, dirt/path, cobble, transitions, accents |
| `reference/approved/haven_exterior_master_kit.png` | `1132bdf1530e7f3ba8a17d9811080429d24161aaf3ec2bfcad89afbacd5cd52f` | Five modular Haven storefront facades |
| `reference/approved/black_lantern_master_kit.png` | `c84747912ba39de7027c9697a09ea34c70a80fa20a2d1a97603e8d5f58368c59` | Starter-interior wood and coherent rug surfaces |

The build scripts abort if an approved source changes. Runtime atlases retain exact crop provenance in JSON manifests and render with nearest-neighbor sampling.

## Corrected production coverage

- Haven terrain preserves nine detailed 32px patches from every 176px authored card instead of crushing an entire card into one tile.
- The Black Lantern landmark remains intact.
- The inn, Arcana, provisions shop, chapel, and forge now use modular facades from the approved exterior kit.
- The delivery cart renders at 96x72 with its 4:3 aspect ratio intact; collision is limited to the two grounded body/wheel cells.
- Market stalls, benches, signpost, barrel, crate, tables, chairs, stools, shelf, and lantern use approved standalone derivatives where logically placed.
- The inn, upper inn, Black Lantern, cellar, provisions, forge, Arcana, and chapel use approved wood, continuous rug, and masonry surfaces.
- The noticeboard no longer overlaps or captures Selene's entrance.

## Deliberately not substituted

The Haven sheet does not contain connected water, riverbanks, cliffs, forest canopy transitions, mine walls, crypt architecture, or capital-city architecture. Reusing town grass/cobble for every biome would destroy regional readability. Existing biome-specific fallbacks remain until matching authored kits exist.

The locally owned Pixel Crawler pack was cataloged and reviewed again. Its environment graphics use a different, more saturated 16px visual language and connected/autotile structures. They are not a visual match for the supplied Thousandfold kits and are not being forced into these maps.

## Art still needed for full-world conversion

1. **Whisperwood and travel roads:** labeled connected grass/path transitions, dense forest edge/canopy pieces, shrubs/rocks/flowers, shallow/deep water, shore corners, bridge modules, and road clutter.
2. **Sunken Fen / Mosswater:** mud, reeds, marsh grass, black water, shore transitions, drowned-road stone, dead trees, and causeway props.
3. **Mine:** cave floor variants, wall tops/faces/inner and outer corners, ore seams, support beams, rails, pits, ladders, and entrance transitions.
4. **Crypt and Emberwatch:** crypt floors, masonry wall topology, broken variants, stairs, gates, tombs, rubble, ash/blood decals, and ruin exterior modules.
5. **Aurelia and connected settlements:** urban road/cobble set, sidewalks/curbs, walls/roofs/facades by district, gates, plazas, and civic/market clutter.
6. **Arcane observatory:** dedicated floor/rune set, walls, lens machinery, star-map props, and void-damage variants.

Each set should arrive without labels crossing the art, with transparent or consistently removable gutters, a stated base visual grid, and at least one assembled example showing intended connections. A labeled 3x3 topology card for each terrain family is safer than a contact sheet of unlabeled samples.
