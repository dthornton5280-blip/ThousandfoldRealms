# v1.5.7 — Reliable Enemy Patrols

## Live issue confirmed

The v1.5.6 wildlife entities appeared and moved, but visible enemies could remain stationary in the deployed browser even though the isolated harness passed.

The first patrol scheduler checked `document.hasFocus()` during every update. Some embedded browser and webview contexts can report false even while the game is visible and accepting input, which permanently paused the enemy scheduler. The original harness always mocked that method as true, so it did not reproduce the live condition.

The earlier layer also treated every quest-tagged enemy as stationary. Quest visibility and patrol behavior are separate concerns; an ordinary enemy unlocked by a quest should still patrol unless it is explicitly authored as a boss, guard, or stationary encounter.

## v1.5.7 correction

- Uses elapsed frame time for patrol cooldowns rather than absolute browser time.
- Tracks actual window blur and focus events instead of relying on `document.hasFocus()` every frame.
- Continues pausing during panels, dialogue, Atlas use, HUD controls, combat, hidden tabs, and genuinely blurred windows.
- Adds explicit patrol circuits for the current Whisperwood, road-network, Lantern Mine, and Ashen Crypt enemy IDs.
- Automatically shifts authored route points to nearby walkable tiles when scenery occupies the preferred tile.
- Creates a deterministic local patrol for ordinary enemies without an explicit route.
- Allows ordinary quest-tagged enemies to patrol.
- Keeps bosses, explicit guards, explicitly stationary entities, the Stone Troll, and Ember Warden stationary by default.
- Preserves the v1.5.6 wildlife movement and hunting systems.
- Preserves collision-triggered tactical encounters and persistent mover positions.

## Current authored enemy coverage

### Whisperwood

- Four mirelings
- Two bandits

### Wilderness road

- Southwood Trail bandit and mireling
- Two Mosswater mirelings
- Two Ambermeadow bandits
- Two Eastwatch bandits

### Lantern Mine

- Three mine stalkers
- Two crystal wisps
- Stone Troll remains a stationary quest encounter

### Ashen Crypt

- Three skeletons
- Ember Adept
- Ember Warden remains stationary

## Expected behavior

1. Stand still near an ordinary visible enemy.
2. The enemy begins moving within roughly one second.
3. It follows a short repeated local circuit rather than chasing the player.
4. Opening Inventory, Character, Journal, Atlas, dialogue, or HUD controls freezes the routine.
5. Closing the interface resumes the routine.
6. Leaving the browser window freezes the routine; returning resumes it.
7. The player can study the circuit and time a safe crossing.
8. Player contact or patrol contact starts the existing tactical battle.

## Regression coverage

The v1.5.7 harness deliberately reports `document.hasFocus()` as false at all times, reproducing the deployed failure condition. It verifies that:

- Whisperwood bandits and mirelings still patrol.
- Wildlife continues moving.
- Ordinary quest-tagged enemies are not automatically frozen.
- Bosses remain stationary.
- Panels and window blur pause enemies.
- Window focus resumes enemies.
- Patrol contact starts combat.
- The older v1.5.6 routine data is restored after the base world update.
