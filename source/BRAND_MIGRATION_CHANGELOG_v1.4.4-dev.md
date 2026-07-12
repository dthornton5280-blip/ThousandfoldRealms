# Thousandfold Realms v1.4.4-dev — Brand Migration

## Scope
The project, player-facing game, filenames, packages, documentation, accessibility labels, test labels, and build tooling were renamed from the former working title to **Thousandfold Realms**.

## Save compatibility
- Primary save key: `thousandfold_realms_modular_save_v2`.
- Saves created under the pre-rename key are detected, loaded, migrated to the new key, and removed from the legacy key after a successful load/save.
- Stable race, class, ability, item, quest, map, enemy, NPC, and door IDs are unchanged.
- The internal `AO` JavaScript namespace remains as a non-player-facing compatibility alias; changing it would create unnecessary regression risk and does not expose the former title in the game UI.

## Branding updates
- Browser title, title screen, top-bar logo, canvas accessibility label, warnings, readmes, changelogs, tests, filenames, web package, source package, and standalone builder now use Thousandfold Realms.
- Current standalone filename: `PLAY_Thousandfold_Realms_v1.4.4.html`.
- Current version label: `1.4.4-thousandfold-realms-brand-migration`.

## Distribution note
The user-supplied development music remains provisional until redistribution rights and attribution requirements are confirmed.
