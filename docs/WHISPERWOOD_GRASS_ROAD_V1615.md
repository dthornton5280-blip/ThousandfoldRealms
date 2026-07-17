# Whisperwood Grass and Road — Controlled Topology Trial

## Asset brief

- **Asset family:** `whisperwood_ground_v1615`
- **Map scope:** `wilds` / Whisperwood only
- **Purpose:** replace the flat procedural grass and dirt path with a connected forest-floor road family matching approved Thousandfold detail, scale, and restraint
- **Style reference:** `reference/approved/haven_ground_tileset_source.png`; use its material rendering and pixel density, but shift toward cooler woodland greens, damp brown earth, moss, leaf litter, and rare pale stones
- **Source format:** one generated two-material board used only as texture source; topology is assembled deterministically in code, never inferred from the generated layout
- **Runtime grid:** 32px gameplay tiles arranged as coherent 3x3 macros
- **Perspective:** top-down/oblique RPG ground consistent with Haven
- **Lighting:** diffuse forest daylight from upper left; no baked cast shadows
- **Topology:** grass base, dirt-road base, and explicit road masks for isolated, end N/E/S/W, straight NS/EW, corners NE/SE/SW/NW, T junctions, and four-way intersection
- **Layer:** ground
- **Collision/interaction:** none; map walkability remains authoritative
- **Acceptance:** crisp nearest-neighbor pixels, seamless road continuity across cardinal neighbors, no labels/gutters in runtime atlas, restrained contrast beside existing Whisperwood objects, and legible 32px character scale

## Production constraint

The generated source supplies only material texture. A deterministic builder creates every connected edge and junction, preventing the one-shot-autotile failure documented in the art skill.
