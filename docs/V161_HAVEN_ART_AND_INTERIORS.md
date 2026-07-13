# v1.6.1 — Haven Art + Living Interiors

## Purpose

This checkpoint turns the approved Haven exterior and Black Lantern Tavern concept direction into a real playable vertical slice without treating either large presentation sheet as a literal sprite atlas.

The production implementation is intentionally deterministic and editable. Pixel materials, architecture, furniture, lights, doors, and characters are reconstructed in `source/src/render/thousandfold_art.js`. Gameplay geometry remains explicit in data rather than being inferred from image dimensions.

## Runtime order

The canonical page loads the new modules in this order:

1. Existing data definitions
2. `source/src/data/haven_art_content.js`
3. Existing system classes
4. `source/src/systems/entity_geometry.js`
5. `source/src/systems/footprint_interactions.js`
6. Existing asset and renderer classes
7. `source/src/render/thousandfold_art.js`
8. Existing renderer polish
9. `source/src/render/thousandfold_renderer.js`
10. Existing UI and game classes
11. `source/src/main.js`
12. `source/src/core/boot.js`

This guarantees that maps are patched before a world is constructed, final movement classes are wrapped before live overrides run, and the art renderer is installed before the game instance is created.

## Visual grid

- Gameplay grid: **32×32 pixels**
- Source-art discipline: **16-pixel subdivisions**
- Standard interior door visual: **32×48 pixels**
- Large objects may visually exceed their collision footprint, but both values are declared deliberately.

## Geometry metadata

### Collision footprint

```js
collisionFootprint: [
  {x:0,y:0},
  {x:1,y:0}
]
```

Every listed cell blocks movement when the entity is blocking.

### Interaction footprint

```js
interactionFootprint: {
  left:0,
  right:0,
  up:1,
  down:0
}
```

This example lets the visible upper half of a tall door resolve to the same logical door entity without turning that upper cell into an extra doorway.

### Visual metadata

```js
{
  artId:'counter_tap',
  artW:128,
  artH:64,
  artAnchor:'topLeft'
}
```

Visual size never silently changes collision.

## Door contract

- Exterior building door IDs are unchanged.
- Exterior destinations are unchanged.
- Interior door destinations are unchanged.
- Integrated storefront doors are drawn inside the building façade.
- Non-integrated doors use the standard visual size and upper interaction cell.
- Open state remains readable.
- Automatic closing uses footprint distance.

Any future art pass must preserve this contract unless it includes an explicit save and map migration.

## Interaction contract

### Descriptions

Appropriate world objects use `description` and open a world-detail dialogue.

### Searchable objects

```js
searchable: {
  chance: 0.35,
  loot: ['travel_ration'],
  gold: [0, 3],
  foundText: '...',
  emptyText: '...'
}
```

Searches are deterministic by character, map, and object. State is stored in `world.searchedDecor`, so rewards cannot be farmed by repeatedly clicking or reloading.

### Use actions

```js
useAction: {
  label: 'Sit for a moment.',
  oncePerDay: true,
  stamina: 2,
  text: '...'
}
```

Daily state is stored in `world.usedDecor` using the in-game day.

## Interior coverage

### Black Lantern Tavern

- Tap bar and serving counter
- Back-bar storage
- Tables and benches
- Common long table
- Hearth and kitchen corner
- Stage and hanging lights
- Job board and wall sign
- Cellar entrance
- Searchable food, storage, table, cask, and supply details

### Tavern cellar

- Casks
- Supply storage
- Persistent search
- Existing enemies and quests preserved

### Lantern Rest

- Desk
- Hearth
- Tables
- Guestbook shelves
- Benches
- Lamps
- Linen storage

### Upper guest floor

- Beds
- Lamps
- Existing Room Seven content preserved

### Provisions shop

- Counter
- Remedy and supply shelves
- Herbs
- Searchable road supplies

### Forge

- Ward-stone furnace
- Ore storage
- Scrap cart
- Workbench
- Tool wall
- Cooling lamps

### Arcane shop

- Antiquities counter
- Bookcases
- Candles
- Relic cupboard
- Viewing orb

### Chapel

- Last Light altar
- Multi-cell pews
- Lanterns
- Quiet-rest uses

## Live review priorities

1. Door alignment between façade and logical doorway
2. Road clearance around the delivery cart and market stalls
3. Tavern bar access to Bran
4. Stage and cellar route clearance
5. Long-table visual/collision agreement
6. Bed placement and upper-floor room access
7. Shopkeeper reachability
8. Forge work-floor clearance
9. NPC scale beside the player
10. Day/night light readability

## Rollback safety

- Existing atlas and procedural fallbacks remain in source.
- The rejected Pixel Crawler pilot remains disabled.
- Save keys are preserved.
- New persistent fields are additive.
- The complete change is isolated in named source modules and can be reverted without restoring the historical ZIP.
