# v1.5.5 Adaptive Field HUD

## Goal

Keep the exploration interface useful without allowing permanent UI panels to cover important parts of the playable map.

## HUD modes

The HUD now has three persistent display modes:

- **Full** — complete vitals, minimap, objective, and nearby interaction information.
- **Compact** — smaller status and map panels, a narrow objective card, and nearby text only when something is actually close enough to matter.
- **Hidden** — removes all informational panels while leaving a small HUD control tab available.

Press **H** during normal exploration to cycle through Full, Compact, and Hidden.

## Selective visibility

Open the small **HUD** tab in the lower-right corner to independently show or hide:

- Vitals
- Local minimap
- Current objective and nearby prompt
- Control hints beneath the game canvas

Turning on a section while the HUD is hidden restores Compact mode so the requested information becomes visible.

## Persistence

The selected layout is stored locally in the browser under `tf-hud-layout-v155`. It remains selected after refreshing, loading a save, or beginning another character in the same browser. HUD layout is intentionally a device preference rather than part of the character save.

## Field-of-view improvements

- The objective strip no longer stretches across the entire battlefield.
- Compact mode reduces portrait, meter, minimap, label, and objective sizes.
- The default mode adapts to available screen width and height.
- Small screens begin without the minimap unless the player explicitly enables it.
- The generic nearby prompt is suppressed in Compact mode until an actual nearby interaction is available.
- HUD controls remain interactive while all informational panels continue allowing movement clicks and world interaction through them.

## Live regression checklist

- Click movement tiles beneath every HUD panel.
- Open doors and interact with entities underneath panel areas.
- Cycle Full → Compact → Hidden with H.
- Open the HUD menu and toggle every section independently.
- Refresh the page and confirm the selected layout persists.
- Confirm the nearby prompt appears when standing beside an interactable object.
- Confirm tactical combat still hides the exploration HUD.
- Test at 1920×1080, 1366×768, and a narrow phone-sized viewport.
