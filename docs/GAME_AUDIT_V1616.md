# Gameplay, Collision, and Visual-Coherence Audit — v1.6.16

## Scope

This pass reviewed Haven storefront access, starter-interior doors, footprint collision, click pathing, keyboard interaction priority, travel-door flow, wilderness exits, HUD objectives, deployment-shaped startup, and the visible legacy-art mix shown in Whisperwood.

## Corrected in this pass

1. **Facade clicks now resolve to the real door.** Clicking any painted Haven building body routes toward its stable door entity instead of attempting to walk into a solid roof tile.
2. **Building collision is canonical.** Painted building walls remain unwalkable even when a renderer substitutes grass beneath a facade; only the declared door threshold is exempt.
3. **Travel doors use one activation.** Destination doors open, transition, and close behind the player in one click or key interaction. Non-destination room doors retain open/close behavior.
4. **Door input wins nearby conflicts.** E-key selection and the nearby prompt prioritize doors over NPCs, enemies, and decoration at equal interaction distance.
5. **Starter interiors use approved door pixels.** A new runtime derives correctly scaled 36×48 doors from the approved Haven facade atlas for the inn, upper inn, tavern, cellar, provisions, Arcana, chapel, and forge. Procedural doors remain only as a load-failure fallback.
6. **Wilderness exits no longer look like blue freestanding doors.** Edge portals render as small cardinal road chevrons; non-edge portals preserve their fallback.
7. **The objective follows the current map.** Whisperwood, the physical road chain, mine, crypt, Haven, and starter interiors no longer all display the Haven exploration sentence.
8. **Local art QA can open any map.** The deployment-shaped developer build can now target a requested map and coordinate without changing saves or production behavior.

## Verified existing strengths

- Haven’s six facade door IDs and destinations remain stable.
- Haven storefront approaches and starter-interior central aisles are unobstructed in authored geometry tests.
- Whisperwood’s Haven, mine, crypt, and eastbound exits remain reachable.
- The Haven-to-Aurelia physical road chain remains connected and cardinally consistent.
- Large furniture collision, persistent searches/uses, visible patrol scheduling, tactical input repairs, and existing-save synchronization retain regression coverage.
- The approved door runtime, facade runtime, interior surface runtime, and Whisperwood ground runtime report ready in the deployment-shaped browser build.

## Punch list

### P0 — gameplay correctness

- **Perform a full quest playthrough audit.** Verify every quest can start, progress, turn in, and survive save/reload; current coverage checks systems more than complete player journeys.
- **Perform full tactical-combat scenario coverage.** Exercise melee, ranged, self abilities, items, fleeing, defeat/load, status expiry, blocked movement, enemy turns, and automatic turn completion in every biome arena.
- **Consolidate remaining live overrides.** Tactical input, travel-network, patrol, wildlife, and HUD behavior still depend on transitional injected scripts. Move proven behavior into canonical source to reduce load-order and stale-cache failure modes.
- **Old-save matrix.** Test at least one save from pre-v1.5, v1.5.8, v1.6.1, and the current build without clearing storage.
- **Interaction conflict sweep.** Programmatically check every door/NPC/service counter/sign combination for overlapping interaction cells and assert door/service priority deliberately.

### P1 — visual coherence

- **Finish the Whisperwood regional kit.** The new grass and road are coherent, but water, banks, waterfalls, cliffs, stairs, bridges, reeds, rocks, border canopy, and many props still come from older procedural layers.
- **Replace wilderness object and actor families.** Camps, chests, resources, signs, bandits, mirelings, wildlife, and some trees currently mix several pixel densities and silhouette languages.
- **Complete starter-interior architecture.** The approved floors and new doors are active, but connected walls, wall faces, thresholds, windows, counters, stairs, and several furnishings remain procedural. Each interior also needs a more purposeful room silhouette than a nearly full 30×18 rectangle.
- **Build regional kits for the road chain.** Southwood, Mosswater, Ambermeadow, Eastwatch, and Lantern Road currently share legacy wilderness rendering and need distinct but compatible terrain, landmarks, and clutter.
- **Convert mine and crypt.** Both need connected floors/walls, entrances, hazards, supports/tombs, props, and enemies in the Thousandfold visual language.
- **Convert Aurelia by district.** Gates, streets, curbs, facades, roofs, plazas, civic props, residents, and docks remain a separate major vertical slice.
- **Unify characters and creatures.** Player, NPC, enemy, patrol, and wildlife sprites should be reviewed beside a 32px character standard; several current actors are visibly simpler than the environment.

### P2 — design and presentation

- Add a short threshold step/door sound and optional two- to four-frame transition without restoring the old two-click interaction.
- Replace generic map-edge chevrons with region-specific roadside transition markers when each biome kit exists.
- Give untracked exploration a small sequence of discoverable goals rather than only static map copy.
- Recompose oversized interiors into readable service, social, private, and circulation zones with stronger sightlines.
- Review encounter density, rest economy, shop pricing, loot pacing, and travel time as one progression curve after the world art conversion stabilizes.
- Add settings for text scale, key rebinding, screen shake, flash reduction, and color-independent tactical indicators.

## Asset families needed next

1. Whisperwood water/shore/bridge/cliff/canopy topology kit.
2. Whisperwood props, resources, camps, signs, wildlife, bandits, and mirelings.
3. Starter-interior wall/window/stair/threshold kit plus coherent furniture expansions.
4. Mine and crypt architecture kits.
5. Road-network regional terrain and landmark kits.
6. Aurelia district architecture and street kit.
7. Unified player/NPC/enemy animation families.
