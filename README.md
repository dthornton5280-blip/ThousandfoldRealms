# Thousandfold Realms

Browser-playable development build of the original single-player pixel CRPG.

- Current live checkpoint: **v1.4.6-dev — Biome Tactical + Animated Title Scene**
- GitHub Pages deploys the complete v1.4.5 biome-tactical package and layers the Git-managed v1.4.6 title-screen and HUD interaction overrides on top.
- Title options: **Start Game**, **Create New Character**, **Load Game**, and **Continue Game**.
- Existing saves from the former title migrate automatically to the Thousandfold Realms save key.
- Background music begins after a player click or keypress because browsers block audible autoplay.

## Live development workflow

Large binary assets remain in the packaged web build. Current CSS and JavaScript corrections live in `live-overrides/` and are injected automatically by `.github/workflows/deploy-pages.yml` during every Pages deployment. This keeps the deployed site current without discarding the verified game package.

The included music file is a user-supplied development asset. Confirm redistribution and attribution rights before a public commercial release.
