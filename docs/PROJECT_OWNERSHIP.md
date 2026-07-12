# Project Maintenance Model

Thousandfold Realms is maintained through small, reviewable Git branches and pull requests.

## Canonical production state

- `main` is the live production branch.
- GitHub Pages deploys only from `main`.
- The verified packaged base supplies large binary assets.
- Readable corrections and active systems are maintained in `live-overrides/`.
- Extracted reference source is available under `source/`.

## Change workflow

1. Create a focused branch from `main`.
2. Make readable, reversible commits.
3. Validate JavaScript and deployment assembly.
4. Open a pull request with a clear test plan.
5. Review and merge to `main`.
6. Confirm the Pages deployment and run live regression checks.

## Current priority

The current priority is a stable playable vertical slice: reliable title/save flow, clean exploration, isolated tactical battles, readable UI, and safe return to the persistent world.
