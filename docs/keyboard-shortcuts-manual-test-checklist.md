# Keyboard Shortcuts — Manual Validation Checklist

> Quick smoke-test for the shortcut system after changes. Run through in order; each step should take < 10 s.

## 1. Core Registry & Dispatch
- [ ] Press `/` (QWERTY) or `Mod+F` (QWERTZ) — focus moves to the Idea input.
- [ ] Press `g` — Generate button triggers (if prompt present and button enabled).
- [ ] Press `Mod+Enter` — same as above.
- [ ] Press `c` — copies current result text.
- [ ] Press `h` — History panel opens; press `Esc` or click overlay to close.

## 2. Cheat Sheet & Help Button
- [ ] Press `Shift+/` (QWERTY) or `F1` (QWERTZ) — Shortcut cheat-sheet modal opens.
- [ ] Click the **⌘K** top-bar button (`#help-shortcuts-button`) — same modal opens.
- [ ] In the modal, verify no "Vorherige Seite" / "Nächste Seite" entries are listed.
- [ ] Close the modal via `Esc`, backdrop click, or × button.

## 3. Dashboard Toggle (Mod+D)
- [ ] Press `Mod+D` — bottom dashboard collapses/expands.
- [ ] Verify the collapse state matches clicking the **▾ Tools** bar button (`#bd-collapse-toggle`).
- [ ] Refresh page — collapse state persists (localStorage `ssa_bd_collapsed`).

## 4. Command Palette
- [ ] Press `Mod+K` — Command Palette opens.
- [ ] Type "export" — filter works; `Enter` runs the action.
- [ ] Press `Esc` — palette closes and scope returns to global.

## 5. Scope-Aware Blocking
- [ ] Open Command Palette (`Mod+K`), then press `g` — HUD shows "Generieren – nur in Global" (or similar blocked feedback).
- [ ] Close palette; press `g` again — Generate fires normally.

## 6. Shortcut Settings & Binding Capture
- [ ] Click **⚡ Shortcuts** top-bar button — Settings modal opens.
- [ ] Click **Hinzufügen** next to any action, then press `Shift+x` — chip shows `Shift+x` (not `Shift+KeyX`).
- [ ] Capture `Mod+d` — chip shows `Mod+d` (not `Mod+KeyD`).
- [ ] Capture `ArrowLeft` — chip shows `ArrowLeft` (code-based preserved).
- [ ] Remove a binding via × on its chip — binding disappears and conflict count updates.
- [ ] Click **Zurücksetzen** — confirm; all bindings revert to defaults.

## 7. Chords (Optional)
- [ ] Press `e` then `1` within ~1.2 s — Producer refine modal opens.
- [ ] Press `v` then `d` — focus moves to Dashboard (if nav chord is active).

## 8. QWERTZ Layout (when applicable)
- [ ] On a German keyboard, verify `/` shows `⌘F` and `Shift+/` shows `F1` in the cheat sheet.

---

**Done?** If all checked boxes pass, the shortcut system is ready for merge.
