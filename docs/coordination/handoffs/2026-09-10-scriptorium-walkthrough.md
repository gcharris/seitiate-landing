# Scriptorium walkthrough website integration

The Director requested the interactive concept on seitiate.com and explicitly selected the existing client-side passcode gate after its public-file limitation was explained.

## Changes

- Added the standalone room → desk → editable manuscript concept at `/scriptorium/`, with its generated artwork and fictional demo content.
- Reused `/assets/gate.js` unchanged and added `noindex, nofollow`.
- Added an index entry and made the in-room Seitiate wordmark return to `/`.
- Prevented room keyboard shortcuts from activating while the gate is displayed.

## Validation

JavaScript syntax and whitespace checks passed. DOM integration checks passed for gate locking/unlocking, keyboard isolation, desk navigation, index and return links, robots metadata and referenced asset existence. Used the existing local Node 22 runtime and jsdom installation; no project dependencies were added. The initial test invocation used Node 18 and failed before running tests due to jsdom runtime incompatibility; the Node 22 run passed. Browser rendering was not independently tested.

## Limits and deployment

This is an animated-viewpoint concept with prepared suggestions, not continuous 3D or a live agent/multiplayer service. Drafts save in local browser storage. The passcode gate is the site's existing casual access screen, not server-enforced privacy; public source and assets are intentional under the Director's instruction. No credential or gate implementation was changed.

The site's existing GitHub Pages configuration publishes the root of `main`. This branch is intended to land by pull request, then verify the Pages build and the `/scriptorium/` route. No unresolved product decisions.
