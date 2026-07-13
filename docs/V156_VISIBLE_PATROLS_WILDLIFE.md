# v1.5.6 — Visible Patrols + Living Wildlife

## Design rules

- Standard combat begins from visible world entities.
- Ordinary enemies follow authored or deterministic routines.
- Ordinary enemies do not randomly wander or automatically hunt the player.
- Enemy movement is real-time and independent of player movement.
- All routines pause while the player examines menus, dialogue, overlays, another browser tab, or an unfocused window.
- Players can study and time patrols to avoid combat.
- Town animals are sparse, contextual, and non-huntable.
- Wilderness wildlife is occasional, interactive, and useful for hunting resources.

## Existing route population

### Town flavor

- Haven: one inn-area cat.
- Aurelia Market: one market dog.
- Aurelia River: one gull.

### Wilderness wildlife

- Whisperwood: deer.
- Southwood Trail: deer.
- Mosswater Crossing: heron.
- Ambermeadow: hare.
- Eastwatch Approach: fox.
- Lantern Road: deer.

Wildlife appearance is seeded by animal identity and in-game day. It should therefore be repeatable within the same day but not guaranteed on every map visit across all days.

## Hunting

Wilderness animals offer:

- **Observe its routine** — records the first observation and grants a small XP reward.
- **Track and hunt it** — makes a Survival check.
- **Leave it undisturbed** — closes the interaction.

Successful hunts can award Wild Game Meat, Animal Hide, or Wild Feathers. Failed hunts move the animal away. Hunted animals remain absent until their saved respawn day.

## Live QA

### Predictable movement

1. Enter a wilderness map containing a visible enemy.
2. Stand still for several seconds.
3. Confirm the enemy moves without waiting for a player step.
4. Watch long enough to identify its repeated route.
5. Confirm it does not leave that route to chase the player.
6. Time a crossing and avoid the enemy.

### Examination pause

Open each of these while an enemy is visible:

- Inventory
- Character
- Journal
- Living Atlas
- Dialogue
- HUD controls
- Another browser tab

Confirm the enemy and any animal remain in the same tile until normal exploration resumes.

### Contact

- Move the player into an enemy.
- Let an enemy patrol enter the player tile.

Both cases must open the existing tactical encounter. Defeating the hostile must preserve the existing defeated-enemy state.

### Wildlife

- Confirm town animals are sparse and cannot be hunted.
- Visit wilderness maps over several in-game days.
- Confirm animals appear occasionally rather than everywhere at all times.
- Observe an animal and verify its repeated route.
- Complete successful and failed hunts.
- Save and reload after each state change.
- Advance enough days for a hunted animal’s respawn window and revisit the map.

### Regression

- Walking repeated steps must not produce a routine invisible random battle.
- Bosses, quest hostiles, guards, and scripted encounters must remain functional.
- Local maps, portals, fog, Atlas travel, HUD modes, camps, resources, dialogue, inventory, and save/load must remain functional.
