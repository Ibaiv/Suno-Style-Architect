# Keyboard Shortcuts System — Phases 2, 3 & 4

> Issue #111 | Implemented: 2026-03-23

## Overview

This document covers the three post-foundation phases of the keyboard shortcuts system. Phase 1 established the core infrastructure (CloseStack, Keys registry, 8 base shortcuts, chords, command palette). Phases 2–4 build on that foundation with registry consolidation, a scope system, and progressive disclosure.

---

## Phase 2: Registry Consolidation

**Goal:** Migrate all remaining global `keydown` listeners into the central Keys registry. Integrate the chord system. Add layout detection and new chord prefixes.

### Changes

#### Removed Global Listeners

| File | Removed Handler | Replacement |
|------|----------------|-------------|
| `chords.js` | `document.addEventListener('keydown', onKeydown)` | `Keys.register()` for chord initiation (e/k/f/v) + `Chords.handleChordKey()` routing in keys.js |
| `creative_cosmos.js` | `document.addEventListener('keydown', handleKeyboardShortcuts)` | 4 shortcuts registered via `Keys.register()` |
| `palette.js` | `document.addEventListener('keydown', onOverlayKey)` | 3 shortcuts registered via `Keys.register()` with `priority: 50` |
| `kachel_system.js` | Undo/redo keydown listener (lines 537–552) | `Keys.register('undo'/'redo')` with `Mod+z` / `Mod+Shift+z` |

**Kept as-is:** `kachel_system.js` handleKeyDown (Shift modifier state tracking), `shortcuts_settings.js` captureOnce (one-shot meta-feature), element-scoped listeners (dashboard nav, app.js inputs).

#### Keys Registry Enhancements

- **Priority field**: `register({ ..., priority: 0 })` — higher-priority actions fire first when multiple actions match. Palette actions use `priority: 50` to beat global ones.
- **Chord-mode routing**: Before action dispatch, checks `Chords.isActive()` and routes to `Chords.handleChordKey(e)`. The `_redispatch` flag allows unrecognized nav-chord keys to fall through to normal dispatch.
- **Modal-key routing**: After chord check, routes to `Chords.handleModalKey(e)` for slider digits/arrows/Enter.
- **`matchEvent` exposed**: Now accessible on `window.Keys.matchEvent` for external use.
- **`debug()` method**: Console-groups all registered actions with bindings.
- **Extended binding parser**: Now supports `Backspace`, `Delete`, `ArrowUp/Down/Left/Right`, `BracketLeft/Right`, `Comma`, `F1`–`F12`.

#### Chords System Refactor

The chord system was rewritten from a standalone keydown listener to an API-driven module:

```
window.Chords = {
  isActive()        → boolean (chord in progress)
  handleChordKey(e) → void   (process second key of chord)
  handleModalKey(e) → boolean (process slider/apply keys)
  activeModal       → Element|null (currently open modal)
  _redispatch       → boolean (nav chord re-dispatch flag)
}
```

**New chord prefixes:**

| Key | Mode | Targets |
|-----|------|---------|
| `e` | Expert | 9 expert refinement tools |
| `k` | KLUG | 12 KLUG tools (paginated) |
| `f` | Future Lab | 7 Future Lab tools (#adaptive-flow-button, #ai-collab-button, etc.) |
| `v` | Navigation | d=Dashboard, c=Creative Cosmos, s=Style Sync, t=Kachel focus |

The navigation chord uses a shorter 800ms timeout (vs 1200ms for tool chords). Unrecognized second keys cancel the chord and re-dispatch through normal key handling — pressing `v` then `g` fires Generate.

#### QWERTZ Layout Detection

`js/layout_detect.js` detects QWERTZ keyboards via:
1. **Primary**: `navigator.keyboard.getLayoutMap()` — checks if KeyY maps to 'z'
2. **Fallback**: `navigator.languages` heuristic for `de-*` locales

Dual bindings added for QWERTZ users:

| Action | QWERTY | QWERTZ Alternative |
|--------|--------|--------------------|
| Focus Vision | `/` (Slash) | `Mod+F` |
| Help/Shortcuts | `Shift+/` | `F1` |

The cheat sheet renders layout-appropriate labels using `KeyboardLayout.isQWERTZ()`.

---

## Phase 3: Scope System

**Goal:** Context-aware shortcut activation. Shortcuts fire only in the correct UI context, with corruption-resistant scope tracking and visual feedback.

### Scope Hierarchy

```
"global"                     <- always active (base layer)
  "dashboard"                <- bottom dashboard focused
    "chord-builder"          <- chord keycaps visible
  "creative-cosmos"          <- cosmos modal open
  "style-sync"               <- Style Sync Studio open
  "klang-studio"             <- Klang Studio open
"modal"                      <- any setupModal() modal open
"command-palette"            <- palette open (highest priority)
```

**Rule:** A shortcut with `scope: 'creative-cosmos'` fires only when that scope is active. `scope: 'global'` fires in any scope unless the user is typing. Only the innermost scope + global are active at any time.

### ScopeStack API

```javascript
window.ScopeStack = {
  push(scopeName)          -> token (string)    // returns unique token
  pop(token)               -> boolean           // validates token, handles out-of-order
  current                  -> string            // top scope name (getter)
  isActive(scope)          -> boolean           // scope === 'global' || current === scope
  reset()                  -> void              // emergency: stack -> ['global']
  checkLeaks(maxAge)       -> void              // warns about stale scopes
  debug()                  -> string[]          // full stack for debugging
  openWithScope(fn, scope, id) -> {scopeToken, closeId}
  onchange                 -> callback          // fires on every scope change
  SCOPE_LABELS             -> object            // German labels for UI display
}
```

### Corruption Prevention (4 Guards)

1. **Token-based push/pop**: Every `push()` returns a unique token. `pop(token)` validates the token. Out-of-order pops scan the stack and log warnings.

2. **CloseStack-Scope binding** (`openWithScope`): Links a CloseStack entry with a ScopeStack push. When Escape fires, both are cleaned up atomically. When a modal's close button is clicked directly, the `close()` function handles both CloseStack and ScopeStack cleanup.

3. **Inactivity timeout** (dev mode): Every 60s, checks for scopes active > 15 minutes. Logs warnings on `localhost`.

4. **Emergency reset** (dev mode): `Ctrl+Shift+Escape` resets scope to `['global']` and clears CloseStack. Only on `localhost`.

### Integration Points

| Context | Push Location | Pop Location |
|---------|--------------|-------------|
| 21 setupModal() modals | `api.js setupModal.open()` via `openWithScope()` | `setupModal.close()` — handles both Escape and direct close paths |
| Creative Cosmos | `openIdeaStarter()` | `closeIdeaStarter()` |
| Style Sync Studio | `features.js openStudio()` | `closeStudio()` |
| Klang Studio | `features.js openTile click` | `closeModal()` |
| Chord-builder | `chords.js startChord()` | `cancelChord()` |
| Command Palette | `palette.js openPalette()` | `closePalette()` |
| Dashboard focus | `kachel_system.js dashboard focus event` | `deactivateNav()` |

### Scope-Aware Dispatch (keys.js)

The `scopeAllowed()` function was enhanced:

```javascript
function scopeAllowed(scope){
  if(scope === 'any') return true;
  if(scope === 'editing') return isTyping();
  if(scope === 'global') return !isTyping();
  // Phase 3: check against ScopeStack
  if(window.ScopeStack) return ScopeStack.isActive(scope);
  return true; // fallback for unknown scopes
}
```

The `keys:blocked` event now includes `requiredScope` and `currentScope` for scope-aware feedback: "Generieren — nur in Global".

### Visual Scope Indicator

A fixed element at bottom-right shows the current scope name with a 300ms pulse animation on change. Hidden when in global scope. Styled with glassmorphism to match the app's design language.

---

## Phase 4: New Shortcuts & Progressive Disclosure

**Goal:** Introduce power-user shortcuts progressively with contextual tips and onboarding.

### Progressive Tip System (`js/tips.js`)

Contextual "did you know?" tooltips appear when users perform mouse actions that have keyboard shortcuts.

```javascript
window.Tips = {
  show(shortcutId, anchorEl)  // show tip near element
  markLearned(shortcutId)     // never show again
  isLearned(shortcutId)       // check status
}
```

- **Storage**: `localStorage.ssa_tips_v1` — JSON object tracking show counts per shortcut
- **Auto-learning**: Tip shown max 3 times, then auto-learned (never shown again)
- **Dismiss**: Auto-fades after 3s, or on any keypress/click
- **Design**: Glass-effect bubble with `kbd` styling, positioned above the clicked element

**Integration points:**

| Mouse Action | Tip Shown |
|-------------|-----------|
| Click Generate button | "Tipp: g fur Generieren" |
| Click expert refine button | "Tipp: e fur Experten-Chord" |
| Click Future Lab button | "Tipp: f fur Future-Lab-Chord" |

### First-Visit Onboarding Banner

On the very first app visit, a centered banner appears:

> Power User? Drucke `Shift+?` fur alle Tastenkurzel.

Auto-fades after 10 seconds. Click to dismiss. Stored in `localStorage.ssa_onboarding_seen`. Never shows again after first dismissal.

### Shortcut Batches

#### Batch 1 — High-Impact

| Shortcut | ID | Action |
|----------|----|--------|
| `Mod+D` | dashboard.toggle | Toggle bottom dashboard visibility |
| `Mod+,` | settings.open | Open settings/API modal |
| `Mod+Shift+E` | export.prompt | Export current prompt |
| `Mod+S` | save.export | Quick save/export (suppresses browser Save dialog) |

#### Batch 2 — Tool Access

| Shortcut | ID | Action |
|----------|----|--------|
| `Mod+I` | open.idea-spark | Open Idea Spark |
| `Mod+Y` | open.style-sync | Open Style Sync |
| `Mod+L` | open.klang-studio | Open Klang Studio |

#### Batch 3 — Navigation & Paging

| Shortcut | ID | Action | QWERTZ Alt |
|----------|----|---------|----|
| `[` | page.prev | Previous tool page | `Mod+Left` |
| `]` | page.next | Next tool page | `Mod+Right` |

### Button Hints (Layer 1 UI)

Shortcut hints added to the most important UI elements:
- Generate button text appended with `(g)`
- Palette icon tooltip set to `Befehlspalette (Cmd+K)`

### Cheat Sheet Upgrade

The `Shift+?` shortcut modal was enhanced with:
- **Grouping by scope**: Global, Creative Cosmos, Befehlspalette, Dashboard, Chord-Modus, Sonstige
- **Scope dimming**: Shortcuts outside the current scope appear at 40% opacity
- **Layout-aware labels**: QWERTZ users see `Cmd+F` instead of `/`, `F1` instead of `Shift+?`
- **Pretty key symbols**: `Mod+` -> `Cmd`, `Shift+` -> Shift-arrow, arrows -> arrow symbols

---

## Complete Shortcut Registry (32 Actions)

| ID | Label | Bindings | Scope |
|----|-------|----------|-------|
| focus.idea | Fokus: Vision | `/`, `Mod+F` | global |
| generate | Generieren | `g`, `Mod+Enter` | global |
| refine.pro | Fur Pro | `p` | global |
| copy.result | Ergebnis kopieren | `c` | global |
| history.toggle | Verlauf | `h` | global |
| auto.trim | Auto-Trim 200 | `b` | global |
| undo | Ruckgangig | `Mod+Z` | global |
| redo | Wiederholen | `Mod+Shift+Z` | global |
| chord.expert | Experten-Chord | `e` | global |
| chord.klug | KLUG-Chord | `k` | global |
| chord.future | Future-Lab-Chord | `f` | global |
| chord.nav | Navigation-Chord | `v` | global |
| dashboard.toggle | Dashboard ein/aus | `Mod+D` | global |
| settings.open | Einstellungen | `Mod+,` | global |
| export.prompt | Prompt exportieren | `Mod+Shift+E` | global |
| save.export | Schnell-Export | `Mod+S` | global |
| open.idea-spark | Idea Spark | `Mod+I` | global |
| open.style-sync | Style Sync | `Mod+Y` | global |
| open.klang-studio | Klang Studio | `Mod+L` | global |
| help.shortcuts | Tastenkurzel | `Shift+/`, `F1` | any |
| palette.open | Befehlspalette | `Mod+K` | any |
| palette.down | Palette: Nachster | `ArrowDown` | command-palette |
| palette.up | Palette: Vorheriger | `ArrowUp` | command-palette |
| palette.select | Palette: Auswahlen | `Enter` | command-palette |
| cosmos.mark | Schnell-Markierung | `m` | creative-cosmos |
| cosmos.mark-note | Markierung mit Notiz | `n` | creative-cosmos |
| cosmos.undo-mark | Markierung ruckgangig | `Backspace`, `Delete` | creative-cosmos |
| cosmos.reset | Alle zurucksetzen | `Shift+R` | creative-cosmos |
| page.prev | Vorherige Seite | `[`, `Mod+Left` | dashboard |
| page.next | Nachste Seite | `]`, `Mod+Right` | dashboard |

Plus modal slider keys (1–0 for 10%–100%, arrows for +/-5, Enter to apply) routed via `Chords.handleModalKey()`.

---

## Files Changed

### New Files (4)

| File | Lines | Purpose |
|------|-------|---------|
| `js/close_stack.js` | 95 | Phase 1: Unified LIFO Escape handling |
| `js/layout_detect.js` | 48 | Phase 2: QWERTZ keyboard detection |
| `js/scope_stack.js` | 141 | Phase 3: Context-aware scope system |
| `js/tips.js` | 94 | Phase 4: Progressive disclosure tips + onboarding |

### Modified Files (11)

| File | Phase(s) | Key Changes |
|------|----------|-------------|
| `js/keys.js` | 2, 3 | Priority, chord/modal routing, scope-aware dispatch, debug |
| `js/chords.js` | 2, 3 | Full rewrite: Keys API, f/v chords, scope integration |
| `js/kachel_system.js` | 2, 3 | Undo/redo via Keys, dashboard scope push/pop |
| `js/creative_cosmos.js` | 2, 3 | 4 shortcuts via Keys, scope + CloseStack integration |
| `js/palette.js` | 2, 3 | 3 shortcuts via Keys, scope, enhanced blocked feedback |
| `js/api.js` | 3 | setupModal uses openWithScope (covers 21 modals) |
| `js/features.js` | 3, 4 | Style Sync + Klang scope, tip integration |
| `js/quickwins.js` | 2, 4 | QWERTZ bindings, Batch 1/2/3 shortcuts, cheat sheet upgrade |
| `js/app.js` | 4 | Tip on generate button click |
| `js/bottom_tools.js` | 1 | CloseStack integration for overlay panels |
| `css/styles.css` | 3, 4 | Scope indicator, tip bubble, onboarding banner, shortcut hints |
| `index.html` | 2, 3, 4 | Script tags (3 new), scope indicator HTML |

### Script Load Order (Final)

```
config.js -> prompts.js -> close_stack.js -> scope_stack.js -> api.js ->
modals.js -> features.js -> creative_cosmos.js -> keys.js -> layout_detect.js ->
palette.js -> chords.js -> shortcuts_settings.js -> tips.js -> quickwins.js ->
bottom_tools.js -> kachel_system.js -> layout_resize.js -> app.js
```

---

## Architecture Decisions

1. **Scope system is opt-in**: Unknown scope names pass through (`return true`), so Phase 2 shortcuts work without ScopeStack being loaded. No hard dependency.

2. **Token-based scope stack vs. name-based**: Tokens prevent mismatched push/pop. Out-of-order pops are recovered gracefully with console warnings rather than crashing.

3. **openWithScope links CloseStack + ScopeStack**: A single call handles both, eliminating the common bug of popping one but not the other. Direct close paths (button/backdrop) also clean up both.

4. **Priority system for overlay shortcuts**: Palette shortcuts at priority 50 beat global shortcuts, preventing ArrowDown from triggering dashboard navigation while the palette is open.

5. **Re-dispatch for nav chords**: Pressing `v` then `g` cancels the nav chord and fires Generate. This prevents the `v` prefix from swallowing useful shortcuts. Only the nav chord supports re-dispatch (tool chords cancel silently).

6. **Tips auto-learn after 3 shows**: Balances discoverability with annoyance. No settings UI needed — the system self-calibrates.
