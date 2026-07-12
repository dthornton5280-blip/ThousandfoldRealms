# v1.4.7 Implementation Notes

## Why this pass was necessary

The prior deployment described tactical battles as dedicated arenas, but the verified packaged code still copied the exploration grid inside a local boundary. That caused unrelated world entities to appear in combat and produced the large blank area visible beside the rendered map.

## Title flow

The title override now exposes two unambiguous actions:

- **Start Game** resets and opens character creation.
- **Continue Game** loads the latest save and disables itself when no save exists.

The legacy creator-level Continue Saved Game control is hidden so the user is not asked to make the same choice twice.

## Tactical isolation

The tactical override replaces the copied-grid battlefield builder with a seeded blank-arena builder. Each arena:

- starts from a biome palette,
- applies one of five authored layout templates,
- reserves opposing spawn zones,
- assigns temporary actor positions,
- stores the exploration return position,
- renders without exploration entities,
- restores the persistent world after victory or retreat.

## Renderer correction

The tactical renderer now uses a fixed world-size offscreen surface and a viewport-size visible canvas. It centers the arena using a uniform scale, fills unused space with biome ambience, and reverses the same transform for click targeting. The exploration canvas dimensions are restored when combat ends.
