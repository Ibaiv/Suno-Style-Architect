# Bottom Kachel Systems: Temporary Deactivation Context

## Purpose
This note explains **why** the three bottom Kachel systems were replaced with a placeholder banner, what was changed technically, and how future LLMs should treat this state.

This is a **temporary stabilization decision**, not a feature removal.

## Decision Summary
- The bottom section (previously 3 interactive Kachel systems) is currently disabled in runtime UI.
- It is replaced by one lightweight banner with a rework message.
- The app now focuses on the top systems for stable, smooth interaction while bottom systems are redesigned.

## Why This Was Done
The previous bottom implementation introduced sustained UX and performance problems:
- High DOM and style complexity from many interactive tiles and nested controls.
- Expensive visual effects and transitions multiplied across many elements.
- Additional runtime work (paging setup + feature initialization + keyboard chord discovery) even when users did not actively use those systems.
- Compounding layout pressure on medium/smaller viewports, reducing visual quality and responsiveness.

Primary objective of this temporary state:
- Recover smooth core app performance immediately.
- Reduce runtime cost and interaction noise.
- Create a clean baseline for a future bottom-systems rebuild.

## Scope of Deactivation (Current State)
### 1) UI replacement
- File: `index.html`
- The entire old bottom 3-system block was replaced by:
  - `.app-bottom-row` containing a single `.systems-rework-banner`.

### 2) Paging script disabled
- File: `index.html`
- `<script src="js/tool_paging.js"></script>` was removed from page load.
- Result: no paging initialization, no per-tile emoji/pager setup at runtime.

### 3) Feature initialization guard
- File: `js/features.js`
- Added `hasBottomToolSystems` detection in `initializeAdvancedFeatures()`.
- Bottom-specific initializers now run **only if** `.tool-system-panel` exists.
- Top-system setup still runs.

### 4) Keyboard chord guard
- File: `js/chords.js`
- Added `hasChordTargets()` check.
- Chord starts (`E` / `K`) are ignored when bottom target buttons are absent.

### 5) Placeholder styles
- File: `css/styles.css`
- Added `.systems-rework-banner` styles and related typography classes.
- Banner is intentionally large and clear to communicate temporary implementation status.

## Important Constraints for Future LLMs
- Do **not** silently re-enable bottom systems by only restoring HTML.
- Re-enabling requires coordinated changes across:
  - markup (`index.html`)
  - initialization flow (`js/features.js`)
  - optional keyboard interactions (`js/chords.js`)
  - performance-sensitive UI behaviors (paging/transitions/effects).
- Keep top-system stability as the priority baseline.

## What This Change Does *Not* Mean
- It does not remove the long-term concept of expert/KLUG/future-lab tooling.
- It does not forbid rebuilding these systems.
- It does not change backend/API contracts.

## Re-enable Checklist (Mandatory)
Before reactivating bottom systems, complete all:
1. Reintroduce bottom markup with a reduced, performance-first DOM structure.
2. Re-enable bottom setup logic in `js/features.js` only after DOM is validated.
3. Reassess need for `js/tool_paging.js`; keep it disabled unless profiling justifies it.
4. Keep chord shortcuts guarded against missing targets.
5. Profile interactions on target laptop viewports and confirm no visible stutter.
6. Validate no regressions in top systems, history panel, and core generate/refine workflow.

## Acceptance Criteria for Future Rebuild
- App remains smooth during normal typing, generation, and navigation.
- Bottom area introduces no noticeable input lag or scroll jank.
- No redundant initializers run when bottom systems are hidden/disabled.
- Feature behavior degrades gracefully if a subset of bottom tools is unavailable.

## Current Product Messaging
The banner intentionally states that bottom systems are in re-implementation and the app is focused on top systems for now. Keep this messaging until a verified rebuild is ready.
