# v1.4.7 Live Test Plan

## Title flow

1. Open the Pages site in an incognito window.
2. Confirm only **Start Game** and **Continue Game** appear.
3. Confirm Continue Game is disabled when no save exists.
4. Click Start Game and confirm character creation opens immediately.
5. Confirm the character creator does not show Continue Saved Game.
6. Use Back to Title.
7. Create a character, save, return to the title, and confirm Continue Game loads the save directly.

## Tactical arena

1. Start an encounter in the wilds or fen.
2. Confirm the scene is a clean temporary arena, not the exploration map.
3. Confirm no NPCs, tents, campfires, chests, buildings, or unrelated props appear.
4. Confirm the arena is centered with balanced framing and no large right-side black cutout.
5. Test click-to-move, arrow movement, WASD camera pan, wheel zoom, target selection, and F recenter.
6. Confirm melee and ranged targeting remain aligned with visible tiles.
7. Win one encounter and retreat from one encounter.
8. Confirm both return the player to the original exploration position.
9. Save during an encounter, reload, and confirm the encounter resumes in an isolated arena.

## Biome sample

Test at least one encounter in each available family:

- Haven
- Wilds
- Sunken Fen
- Mine
- Crypt
- Arcane

Record the arena name shown in the tactical header and any tile, spawn, pathfinding, or presentation issue.
