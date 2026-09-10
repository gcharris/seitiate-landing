# Connected rooms in the Seitiate walkthrough

## Scope and delivery

The Director requested continued expansion from the Scriptorium into the laboratory, makers’ studio and marketplace. The same existing website passcode gate remains in use, as explicitly chosen in the preceding integration. This change expands `/scriptorium/` in the independent seitiate-landing repository and updates its index entry.

## What changed

- Four connected first-person viewpoints, neighbouring-room exits, a room chooser and an expanded guided tour.
- Existing approved laboratory, makers’ studio and market artwork reused as room views. Room-specific framing and constrained camera positions keep approach controls reachable on narrow screens.
- Separate, locally persisted writing and research notebooks. Research includes synthetic curves, selectable runs and a table of the fictional values.
- A makers’ storyboard with frame selection, captions, duration, ordering, removal, still-frame playback and Markdown export.
- A browsable market collection with filters and local collection of studies that appear in studio materials.
- Gate-aware navigation, reduced-motion support, room image-load recovery, cancellation checks and stopped playback when leaving the work surface or hiding the page.
- Versioned stylesheet/script URLs to avoid mixing an older cached app with the new room interface.

## Validation

JavaScript syntax and diff whitespace checks passed. DOM integration checks using the existing Node 22 and jsdom installation passed: all four rooms, gate lock/unlock, distinct writing and research persistence, chart selection, evidence table, storyboard editing/reordering/playback controls, market collection/filtering, return navigation, full guided tour, tour cancellation, image-load failure recovery, phone-width hotspot bounds and optional agent-tool input validation. Local index and asset references were checked. No package or lockfile changes.

During checks, a broad data-place selector was found to attach a room-switch listener to the body. It was narrowed to room-chooser buttons; the full interaction checks passed after repair. Browser rendering has not been independently inspected.

## Limits

Motion uses animated still viewpoints, not a continuous 3D model. The makers’ preview is a still-frame animatic with no audio, not rendered video. Research values and text are explicitly fictional. The market collection is local and performs no purchase, messaging or shared transaction. No live agents or multiplayer service are connected. The existing browser passcode is unchanged and does not make public source/assets private.

## Publication

Land the branch by PR, then verify GitHub Pages has built the merge revision and the live route serves the new files. Main publishes the repository root. The earlier standalone ChatGPT Sites prototype is not the destination of this website update. No unresolved product decisions.
