# Feature-Inventur der Web-App für die native macOS-V1

**Erstellt:** 2026-07-21 · **Ticket:** [Feature-Inventur der Web-App für V1](https://github.com/Ibaiv/Suno-Style-Architect/issues/131) · **Karte:** [Wayfinder-Karte: Native macOS-App (V1-Spezifikation)](https://github.com/Ibaiv/Suno-Style-Architect/issues/130)

## Zweck und Geltungsbereich

Vollständige Bestandsaufnahme der Web-App **Suno Style Architect** (Vanilla HTML/CSS/JS), gelesen **direkt aus dem Code** — nicht aus vorhandener Dokumentation. Sie ist die Referenz dafür, was die native macOS-V1 1:1 funktional können muss. Der alte `SWIFT_REWRITE_PLAN.md` ist veraltet und wurde nicht als Quelle verwendet.

**Ausgangsstand:** Branch `main`, Commit `4b37cde`. Gelesene Dateien: `index.html` (1849 Z.), `js/*.js` (22 geladene Module, ~5.000 Z. ohne `creative_cosmos.js`), `css/styles.css` (6777 Z., nur überblicksartig), `data/`, `scripts/`.

### Im Umfang

Alle Features, Abläufe, System-Prompts, Zustände, Limits und Edge-Verhalten der App — inklusive **Idea Spark** („Ideen-Funke"), das ausdrücklich **nicht** zur Kreativbibliothek zählt und in V1 bleibt.

### ⛔ Nicht im Umfang (nur Einstiegspunkte dokumentiert)

**Kreativbibliothek** (`creative_cosmos.js`, „Ideen-Starter"/Spectrum Navigator), **Stilsynchronisator** (Style Sync) und **Klang Studio**. Diese drei erscheinen in V1 **sichtbar, aber deaktiviert**. Wo sie im UI sitzen, wie sie aussehen und über welche Wege sie erreichbar sind, steht in Teil 1, Abschnitt 5.3 — inklusive der bereits im Markup vorhandenen Vorlage für den Deaktiviert-Look („Universum – Coming Soon"). Ihre Funktion ist bewusst nicht dokumentiert.

### Abgrenzung zu Nachbar-Tickets

- **API-Details** (Endpunkte, Auth, Retry, Fehlermapping) sind hier auf Inventurtiefe erfasst; die belastbare Spezifikation entsteht in [Ticket: API-Spezifikation OpenRouter & fal.ai](https://github.com/Ibaiv/Suno-Style-Architect/issues/132).
- **Design-Tokens / CSS** sind hier nur im Überblick (Teil 1, Abschnitt 7); die Extraktion erfolgt in [Ticket: Design-Token-Extraktion aus styles.css](https://github.com/Ibaiv/Suno-Style-Architect/issues/133).

---

## Der Kern in zehn Sätzen

1. Die App hat **einen zentralen Zustand**: den Text im Ergebnisfeld `#result-text` („Dein Meisterstück"). Fast jedes Feature liest ihn, transformiert ihn per LLM und schreibt ihn zurück.
2. Ein einziges globales Flag `isPromptGenerated` **sperrt alle Werkzeuge**, bis erstmals ein Prompt erzeugt wurde — Ausnahmen sind nur Ideen-Funke und Style Sync.
3. Der einzige Schreibpfad auf das Ergebnisfeld ist `applyPromptWithUndo(text, toolName)`; er erzeugt Undo-Eintrag, Rückgängig-Toast und Verlaufseintrag.
4. Es gibt **44 anwendbare Werkzeuge**: 9 Experten, 13 KLUG (12 Listen-Tools + Synth-Designer Lab), 7 Future Lab, plus Ideen-Funke, Sound-Ingenieur, Custom Instruction, Suno Pro, Auto-Trim, Visueller Funke und Genre-Evolution.
5. Alle Werkzeuge sprechen dasselbe API: **OpenRouter** mit global identischen Parametern (`temperature 0.7`, `max_tokens 1000`, `top_p 0.9`, kein Streaming, 60 s Timeout, kein Retry). Nur die Bildgenerierung nutzt **fal.ai**.
6. Was ein Werkzeug ausmacht, ist fast ausschließlich sein **System-Prompt** — 45 Prompt-Konstanten plus 2 Datentabellen in `prompts.js`, alle hier erfasst (die aktiven wörtlich). Sie sind das eigentliche Produkt und müssen unverändert portiert werden.
7. Die Modell-Antworten folgen **drei Vertragsformaten** (Freitext ≤800 Zeichen / JSON-Ideenliste / `PROMPT:---NOTES:`), jeweils mit eigener, teils mehrstufiger Fallback-Parsing-Kette bis hin zu einem zweiten LLM-Call zur JSON-Reparatur.
8. Die Web-App investiert stark in **Tastatur-Bedienung**: Keybinding-Registry mit Scopes und Prioritäten, Zwei-Tasten-Chords (E/K/F/V + Ziffer), ⌘K-Command-Palette, Escape-LIFO-Stack, Focus-Trap, konfigurierbare Shortcuts mit Konfliktprüfung.
9. Persistiert wird ausschließlich in **localStorage** (22 Keys) — API-Keys im Klartext, dazu Verlauf (max 20), Layout-Zustände, Favoriten, Sortierung und Tool-Ketten. Kein sessionStorage, kein Backend.
10. Es gibt **toten Code und Inkonsistenzen**, die nicht mitportiert werden sollten — sie sind an Ort und Stelle markiert und am Ende gesammelt.

---

## Aufbau dieses Dokuments

| Teil | Inhalt | Quelldateien |
|---|---|---|
| **1** | App-Shell, Layout, Interaktions-Infrastruktur, localStorage, Einstiegspunkte (inkl. ⛔-Features), Timings, CSS-Überblick | `index.html`, `app.js`, `config.js`, `keys.js`, `shortcuts_settings.js`, `layout_*.js`, `topbar_collapse.js`, `close_stack.js`, `scope_stack.js`, `focus_trap.js`, `tips.js`, `vision_focus.js`, `tool_paging.js` |
| **2** | Kern-Features im Detail — Idea Spark, Experten, KLUG, Synth-Designer, Visual Engine, Future Lab, Custom Instruction, Genre Evolution; Verlauf/Export/Shortcuts | `features.js`, `quickwins.js`, `tips.js` |
| **3** | Alle Modals (Felder, Validierung, Aktionen) und **alle System-Prompts wörtlich** | `modals.js`, `prompts.js` |
| **4** | API-Schicht (OpenRouter, fal.ai) und untere Werkzeuge (Bottom-Dashboard, Kachelsystem, Chords, Palette), Daten/Skripte | `api.js`, `kachel_system.js`, `bottom_tools.js`, `chords.js`, `palette.js`, `data/`, `scripts/` |

Zeilennummern beziehen sich auf den oben genannten Ausgangsstand.

---

# Teil 1 — App-Shell, Layout, Interaktions-Infrastruktur

## 0. Datei-/Ladeordnung (index.html:1825–1846)

Skripte werden am Body-Ende **in dieser Reihenfolge** geladen (klassische Scripts, kein Modulsystem, alles global):

1. `js/config.js` – globaler Zustand + Toast/Inline-Error + `applyPromptWithUndo`
2. `js/prompts.js` – System-Prompt-Texte
3. `js/close_stack.js` – Escape/LIFO + `BodyScrollLock`
4. `js/scope_stack.js` – Scope-Kontext
5. `js/focus_trap.js` – Tab-Trapping
6. `js/api.js` – OpenRouter/fal-Calls, `setupModal()`, `setKlugToolsState()`
7. `js/modals.js` – injiziert alle Tool-Modals als HTML-String in `#modals-container`
8. `js/features.js` – Verdrahtung aller Tools, Style-Sync, Klang-Studio
9. `js/creative_cosmos.js` – Kreativbibliothek („Spectrum Navigator") ⛔
10. `js/keys.js` – Keybinding-Registry
11. `js/layout_detect.js` – QWERTZ-Erkennung
12. `js/palette.js` – Befehlspalette + HUD
13. `js/chords.js` – 2-Tasten-Chords
14. `js/shortcuts_settings.js` – Shortcut-Editor
15. `js/topbar_collapse.js`
16. `js/tips.js`
17. `js/quickwins.js` – Verlauf, Zeichenzähler, Auto-Trim, Export/Import, Shortcut-Registrierung
18. `js/bottom_tools.js` – Bottom-Dashboard (3 Spalten)
19. `js/kachel_system.js` – Favoriten/Drag-Order/Chains/Undo
20. `js/layout_resize.js` – vertikaler Splitter
21. `js/vision_focus.js` – Fokusmodus
22. `js/app.js` – DOM-Refs, Settings, Generate/Refine, `DOMContentLoaded`-Init

**Wichtig:** `js/tool_paging.js` (202 Zeilen) ist **nicht eingebunden** und referenziert Selektoren (`.tool-system-panel`, `.tool-grid-source`), die in `index.html` nicht existieren → **toter Code**. Die dazu passenden Shortcuts `page.prev`/`page.next` (quickwins.js:336–344) rufen `window.ToolPaging` auf, das nirgends gesetzt wird → **funktionslos**. Für den Port: nicht portieren.

**Init-Reihenfolge (alles auf `DOMContentLoaded`, Reihenfolge = Skriptreihenfolge):**
- modals.js: `#modals-container.innerHTML = getModalsHTML()` → Event `modals:ready`
- creative_cosmos: `initCreativeCosmos()`
- layout_detect: `KeyboardLayout.detect()`
- palette: `wire()` + `registerPaletteKeys()`
- chords: `registerChordKeys()`
- shortcuts_settings: `wire()`
- topbar_collapse: `init()` (Zustand wiederherstellen)
- tips: `initOnboarding()`
- quickwins: `init()` → `cleanupOldTemplateData, renderPresets, updateCharStats, runLint, observeResult, registerKeybindings, wireUI, addButtonHints`
- bottom_tools: `initCollapseToggle()`, `initBottomDashboard()` → Event `bottomtools:ready`
- layout_resize: `init()` (Split wiederherstellen)
- vision_focus: `init()` (Button injizieren, Shortcut registrieren, Zustand wiederherstellen)
- app.js: `loadSettings()`, `setKlugToolsState(false)`, `setupCopyButton(...)`

---

## 1. UI-Struktur

### 1.1 Globale Hülle
- `<body class="text-neutral-200">`, Hintergrund: `#050510` + drei radiale Gradienten, `background-attachment: fixed` (css/styles.css:24–36).
- **Skip-Link** „Zum Hauptinhalt springen" (index.html:16, CSS 1–21) – nur bei Fokus sichtbar.
- `body.app-no-scroll { overflow:hidden }` wird gesetzt, sobald die Haupt-App sichtbar ist (app.js:124).
- `#main-app` = `height: 100dvh; overflow:hidden; display:flex; column` (CSS:42–48). Unter 768px: `height:auto; min-height:100dvh; overflow:auto` (CSS:51–57).
- Maximalbreite `max-w-[1900px]`, ab 2xl `2100px`; Padding `p-3 / md:p-5 / lg:p-6` (index.html:108).

### 1.2 API-Setup-Modal (index.html:18–106)
Vollflächiges Blocker-Modal, `z-[100]`, wird per `display:flex/none` (nicht `hidden`-Klasse) gesteuert.
Inhalt: OpenRouter-API-Key (password, Placeholder `sk-or-v1-...`), KI-Modell-Select (8 Modelle), Fal.ai-Key (optional), Bild-Modell-Select (7 Modelle), Inline-Fehlerbereich `#api-setup-error`, Button „Einstellungen speichern".
Verhalten: Ohne gespeicherten Key erscheint es beim Start statt der App (app.js:81–84). `Enter` im Key-Feld = Speichern (app.js:261).

### 1.3 Topbar / Menüleiste (index.html:111–144)
`<header id="app-menu-bar" class="app-menu-bar">` mit:
- **Brand**: Icon (Musiknoten-SVG) + `<h1>Suno Style Architect</h1>`
- **Controls** (`.app-menu-controls`), alle als „Chips":
  - `#current-image-model` – Anzeige Bildmodell (Default „Nano Banana Pro")
  - `#current-model` – Anzeige Textmodell (Default „GPT-5 mini")
  - `#help-shortcuts-button` – Beschriftung „⌘K", Titel „Tastenkürzel anzeigen"
  - `#shortcuts-settings-button` – „⚡ Shortcuts"
  - `#history-toggle-button` – „🕘 Verlauf"
  - `#change-settings-button` – „⚙️ Ändern"
- **Collapse-Toggle** `#topbar-collapse-toggle` mit Chevron, `aria-expanded`.

Responsiv: <1100px werden die Controls horizontal scrollbar mit Fade-Maske (CSS:1126–1150); <900px werden `#help-shortcuts-button` und `#shortcuts-settings-button` **ausgeblendet** (CSS:1166–1172); <600px kleinere Chips/Titel.

**Achtung Portierungsfalle:** `#help-shortcuts-button` hat in keiner JS-Datei einen Click-Handler (nur `Shift+/`, `F1` und die Palette öffnen die Hilfe) → der Button ist derzeit **wirkungslos**.

### 1.4 Haupt-Layout `.app-main-layout` (index.html:147)
CSS-Grid mit zwei Zeilen (CSS:59–65):
```
grid-template-rows: minmax(0, calc(67% - 4px)) minmax(0, calc(33% - 4px));
gap: 8px;
```
Bei `@media (max-height: 800px)`: 68 % / 32 % (CSS:1215–1219).

**Zeile 1 `.app-top-row`** = `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4` (index.html:148) — also 1 Spalte mobil, 2 Spalten ab 1024px, 3 Spalten ab 1280px.

**Spalte 1 — „Deine Vision" (`.app-idea-card`, index.html:150–194)**
- Label „Deine Vision" + Button `#spark-idea-button` „Ideen-Funke"
- `#idea-input` (textarea, 4 Zeilen, Placeholder „Beschreibe deine Musik-Vision…")
- `#lyric-input` (textarea, 3 Zeilen, „Lyrics (Optional)…")
- `#generate-button` mit `#generate-icon` (Zauberstab), `#button-text` („Prompt Architektieren" / „Architektiere…") und `#loader` (Spinner)
- quickwins hängt an `#button-text` den Hinweis-Span „ (g)" an (quickwins.js:362–371)

**Spalte 2 — „Dein Meisterstück" (`.app-result-card`, index.html:197–297)**
- Kopfzeile: `<h2>Dein Meisterstück</h2>` + `.meister-header-actions`:
  - `#auto-trim-v3-button` („Auto-Kürzen 200")
  - `#export-prompt-button` („JSON exportieren")
  - `#import-prompt-button` + verstecktes `#import-prompt-file` (`accept=application/json`)
  - `.meister-header-divider`
  - `.bd-undo-controls` mit `#bd-undo-btn` / `#bd-redo-btn` (initial `disabled`)
  - **zur Laufzeit injiziert:** `#vision-focus-toggle` (vision_focus.js:86–127), eingefügt **vor** dem Divider
- `#result-wrapper` enthält zwei sich ausschließende Zustände:
  - **Leerzustand** `#initial-state`: Plus-Icon + „Dein optimierter Prompt für Suno erscheint hier."
  - **Ergebnis** `#result-container` (initial `hidden`): `#copy-button` (Copy-/Check-Icon-Wechsel), `<pre id="result-text" tabindex="0">`, Zeichenzähler-Overlay `#char-stats-overlay > #char-stats`
- `#refinement-controls` (initial `hidden`, Grid 1/3 Spalten): `#suno-pro-button` („Für Pro (detailliert)" + `#suno-pro-loader`) und `#custom-instruction-button` („Eigene Anweisung")

**Spalte 3 — „Kreativ-Kosmos"-Stack (`.app-kreativ-stack`, index.html:300–426)** — vier gleich hohe vertikale Kacheln (`flex-1`):
1. `#idea-starter-tile` — **„Ideen-Starter"** (blau) → öffnet die **Kreativbibliothek** ⛔
2. `#style-sync-tile` — **„Stil-Synchronisator"** (violett) ⛔
3. `#klang-studio-tile` — **„Klang-Studio"** (cyan) ⛔
4. Platzhalter „Universum – Coming Soon", Klasse `kreativ-panel inactive`, `grayscale opacity-50 cursor-not-allowed`, kein `id`, kein Handler

(Details zu 1–3 siehe Abschnitt 5.3.)

**Zeile 2 `.app-bottom-row` (index.html:429–520)**
- `.bd-resize-bar`: links + rechts je ein `.bd-resize-grip[data-side]` (je 2 `.bd-grip-line`), dazwischen mittig `#bd-collapse-toggle` mit `.bd-collapse-icon` („▾"), `.bd-collapse-label` („Tools") und `.bd-collapse-count` (**hartcodiert „29"** — die tatsächliche Toolzahl ist 9+13+7 = **29**, stimmt also, ist aber statisch)
- `.bottom-dashboard[tabindex="0"]` mit drei Spalten:

  | Spalte | id | Icon | Name | Chord-Hinweis | Count |
  |---|---|---|---|---|---|
  | 1 | `#bd-col-1` (`bd-col-purple`) | 🎯 | Experten-Tools | „E + 1-9" | 9 |
  | 2 | `#bd-col-2` (`bd-col-cyan`) | 🧠 | Klug-Tools | „K + 1-9" | 13 |
  | 3 | `#bd-col-3` (`bd-col-emerald`) | 🔮 | Futures Lab | „F + 1-7" | 7 |

  Jede Spalte: Header (Icon, Name, Chord-Hint, Count, `.bd-search-toggle`, `.bd-chain-toggle`), leere Liste `#bd-list-N` (zur Laufzeit von bottom_tools.js gefüllt), Detail-Overlay `#bd-detail-N` mit Close-X, Emoji, Name, Beschreibung und „Anwenden"-Button.

  **Inkonsistenz:** Header sagt „13" für Klug-Tools, `CHORD_SHORTCUTS` (bottom_tools.js:55–60) kennt aber nur 12 Klug-Chords — der Synth-Designer hat kein Chord-Badge.

### 1.5 Fehlerbereich (index.html:524–532)
`#error-container` (`hidden`, `mt-8 max-w-4xl mx-auto`), rot, `role="alert"`, mit `#error-message` und `#error-dismiss-btn` (×).

### 1.6 Overlays / Panels außerhalb `<main>`
| Element | id | z-index | Zweck |
|---|---|---|---|
| Verlauf-Backdrop | `#history-overlay` | `z-[90]` | Klick schließt |
| Verlauf-Sidebar | `#history-panel` | `z-[95]` | rechts, `w-[720px] max-w-[92vw]`, `translate-x-full` → Klasse `open` schiebt ein |
| Chord-Hinweis | `#chord-hint` | `z-[105]` | fixiert `bottom-24`, zentriert; Text „Ziffer drücken, 0 = mehr, Esc = abbrechen" |
| Befehlspalette | `#cmdk-overlay` | `z-[110]` | `mt-20`, `max-w-2xl`; `#cmdk-input`, `#cmdk-list` (`max-h-[50vh]`), `#cmdk-close` |
| Shortcut-Editor | `#shortcut-settings-modal` | `z-[120]` | `max-w-3xl`, Liste `#shortcut-settings-list` (`max-h-[60vh]`), Buttons `#shortcut-reset` („Standard"), `#shortcut-settings-close` |
| Shortcut-Hilfe | `#shortcut-modal` | `z-[100]` | statische Cheat-Sheet-Karten, wird beim Öffnen dynamisch überschrieben |
| Tool-Modals | `#modals-container` | `z-50` | von modals.js injiziert |
| Kreativbibliothek | `#idea-starter-modal` | `z-[130]` | ⛔ |
| Klang-Studio | `#klang-studio-modal` | `z-[130]` | ⛔ |
| Style-Sync | `#style-sync-studio` | `z-[140]` | ⛔ |
| Scope-Indikator | `#scope-indicator` | 200 (CSS:5683) | fixiert unten rechts, „⌨ <Scope>" |
| Action-HUD | `#action-hud` | 210 (CSS:2124) | fixiert unten mittig, zeigt ausgeführte/blockierte Aktion |
| Toasts | `#ssa-toast-container` | – | `aria-live="polite"` |

Verlauf-Panel-Inhalt (index.html:537–560): Kopf „Verlauf" + `#history-export-all`, `#history-import` (+ `#history-import-file`), `#history-clear`, `#history-close`; Liste `#history-list`; Leerzustand `#history-empty-state` („📋 / Noch keine Einträge / Generiere einen Prompt, um den Verlauf zu starten.").

---

## 2. Layout-Verhalten

### 2.1 Breakpoints
| Breite | Wirkung |
|---|---|
| ≤600px | Menüleiste kompakter, Chips kleiner (CSS:1183) |
| ≤768px | `#main-app` scrollbar statt fixiert (CSS:51); Vollbild-Modals randlos (CSS:6234) |
| ≤900px | `#help-shortcuts-button` + `#shortcuts-settings-button` ausgeblendet (CSS:1166) |
| ≤1100px | Menü-Controls horizontal scrollbar + Fade-Maske (CSS:1126) |
| ≥1024px (`lg`) | Top-Row 2 Spalten; größerer Menütitel (CSS:1120) |
| ≥1280px (`xl`) | Top-Row 3 Spalten; **Vision-Fokus nur hier aktiv** (CSS:6421/6443) |
| Höhe ≤800px | Split 68/32, kompaktere Paddings/Radii (CSS:1215) |
| `prefers-reduced-motion` | Animationen deaktiviert (CSS:1306, 1403, 3532) |

### 2.2 Vertikaler Splitter (js/layout_resize.js)
- Storage-Key `ssa_layout_split_v1` (Zahl = Top-Prozent, gerundet)
- Grenzen `MIN_TOP_PCT = 25`, `MAX_TOP_PCT = 85`
- Ziehen an einem der beiden `.bd-resize-grip` (nur linke Maustaste, Zeile 59); nicht möglich, wenn `.bd-collapsed` gesetzt ist (Zeile 60)
- DOM-Schreibvorgänge per `requestAnimationFrame` gedrosselt; setzt inline `gridTemplateRows: minmax(0,X fr) minmax(0,100-X fr)`
- Beim Loslassen wird der tatsächlich gerenderte Wert neu berechnet, geklemmt, gerundet und persistiert; Fallback 67 bei Höhe 0
- Während des Ziehens: `.bd-resize-active` am Layout + `.bd-body-resizing` am Body
- **Doppelklick** auf einen Grip → Inline-Stil entfernen + Storage-Key löschen (Rückkehr auf CSS-Default)
- Beim Laden nur wiederhergestellt, wenn Wert innerhalb 25–85 liegt

### 2.3 Bottom-Dashboard-Collapse (js/bottom_tools.js:222–250)
- Storage-Key `ssa_bd_collapsed` („1"/„0")
- **Default bei fehlendem Key = eingeklappt** (Zeile 236, bewusst wegen Issue #80)
- Toggle über `#bd-collapse-toggle`; setzt `.bd-collapsed` auf `.app-main-layout`
- CSS-Wirkung (CSS:187–198): `grid-template-rows: 1fr auto !important`, `.bottom-dashboard{display:none}`, Icon um −90° gedreht, Resize-Grips ausgeblendet
- Event `bottomdashboard:toggle` mit `{collapsed}`
- **Achtung:** Der Shortcut `Mod+D` („Dashboard ein/aus", quickwins.js:348) toggelt eine **andere** Sache — `.bottom-dashboard.classList.toggle('hidden')` — also nicht denselben Mechanismus und ohne Persistenz. Zwei konkurrierende Verstecken-Wege für dasselbe Element.

### 2.4 Topbar-Collapse (js/topbar_collapse.js)
- Storage-Key `ssa_topbar_collapsed` („1"/„0"), Klasse `top-bar-collapsed`
- Beim Laden im kollabierten Zustand wird `transition:'none'` gesetzt und nach zwei `requestAnimationFrame` wieder entfernt (kein Flackern)
- Kollabiert: `max-height:20px`, Inhalt `opacity:0; visibility:hidden; pointer-events:none`, Toggle-Button füllt die ganze Leiste, Chevron um 180° gedreht (CSS:1365–1394)
- Toggle-Click ruft `e.stopPropagation()`
- Shortcut `Mod+Shift+T`; Event `topbar:toggle` mit `{collapsed}`
- API: `window.TopBar.{toggle,isCollapsed,setCollapsed}`

### 2.5 Vision-Fokus-Modus (js/vision_focus.js)
- Storage-Key `ssa_vision_focus_v1` („1"/„0"), Klassen `vision-focus-active` / `vision-focus-transitioning`, `ANIM_MS = 420` (muss zur CSS-Transition passen)
- **Nur ab 1280px aktiv** (`isXL()`); beim Unterschreiten wird animationslos deaktiviert, beim Überschreiten der persistierte Zustand wiederhergestellt (`matchMedia`-`change`-Listener, Zeile 225–232)
- Blendet `.app-idea-card` aus, „Dein Meisterstück" nimmt den Platz ein, der rechte Kreativ-Stack bleibt sichtbar
- Barrierefreiheit: versteckte Karte bekommt `aria-hidden="true"` und `inert` (Fallback: alle fokussierbaren Elemente auf `tabindex=-1`, alter Wert in `data-vf-tabindex` gesichert)
- Sichtbarer Trigger: injizierter Button `#vision-focus-toggle` mit `aria-pressed`, Icon-Wechsel Split↔Expand, Titel „Fokus-Modus: Vision ausblenden (⌥A)" bzw. „Vision einblenden (⌥A)"
- Shortcut `Alt+A`; API `window.VisionFocus.{toggle,activate,deactivate}`

### 2.6 Tool-Paging
Zwei getrennte Konzepte:
- **Chord-Paging** (chords.js): pro Chord max. 9 Ziffern; Taste `0` blättert zyklisch zur nächsten Seite und verlängert die Deadline. Badge-Beschriftung auf den Kacheln für Position >9 lautet `0→N` (bottom_tools.js:95–98).
- **tool_paging.js** (nicht geladen, toter Code): `PAGE_SIZE = 9`, `TRANSITION_MS = 210` (+90 ms Sicherheits-Timeout), horizontaler `translate3d`-Track mit Punkt-Pager, Emoji-Zuordnung für 31 Tool-Buttons, respektiert `prefers-reduced-motion`. **Nicht portieren.**

---

## 3. Interaktions-Infrastruktur

### 3.1 Keybinding-Registry (js/keys.js)
- Storage-Key `ssa_keybindings_v1` (JSON: `{actionId: [bindingStrings]}`), enthält nur **Überschreibungen**; `getBindings()` = custom ?? default ?? []
- Bindings-Syntax: `Mod` (⌘ oder Ctrl), `Shift`, `Alt`/`Option`; Tastenteil entweder Einzelzeichen (zeichenbasiert, QWERTZ-sicher, Vergleich gegen `e.key`) oder Code-Name (`KeyG`, `Enter`, `Slash`, `Space`, `BracketLeft/Right`, `Backspace`, `Delete`, `ArrowUp/Down/Left/Right`, `Tab`, `F1`–`F99`, `Comma`→`,`)
- macOS-Sonderfall: bei `Alt+<Buchstabe>` liefert `e.key` ein Sonderzeichen — Fallback auf `e.code` (keys.js:109–113)
- **Scopes**: `'any'` (immer), `'editing'` (nur beim Tippen), `'global'` (nur wenn NICHT getippt wird), sowie benannte Scopes gegen den ScopeStack. Unbekannte Scopes passieren (Rückwärtskompatibilität).
- „Tippen" = aktives Element ist `INPUT`/`TEXTAREA`/`SELECT`/`contentEditable`/`role=textbox`
- **Typing-Guard**: Einzelzeichen-Bindings ohne Modifier feuern nie beim Tippen (keys.js:178)
- **Priorität**: alle Treffer werden gesammelt, absteigend nach `priority` sortiert (Default 0, Palette nutzt 50), der erste zulässige gewinnt und ruft `e.preventDefault()`
- **Events**: `keys:action` `{id,label,source:'key'|'program'}` bei Ausführung; `keys:blocked` `{id,label,reason:'typing-guard'|'scope'|'guard', requiredScope, currentScope}` bei Ablehnung (nur der erste Blockgrund)
- Chord-Routing vor der normalen Dispatch: aktiver Chord fängt modifikatorfreie Tasten ab; aktives Modal fängt Ziffern/Pfeile/Enter ab
- API: `Keys.{register,getBindings,setBinding,parseBinding,matchEvent,listActions,listDetailed,run,resetCustom,isTyping,debug}`

### 3.2 Vollständige Shortcut-Liste

**Global (nur außerhalb von Textfeldern)**
| Taste | Aktion-ID | Label | Bedingung | Quelle |
|---|---|---|---|---|
| `/` , `⌘F` | `focus.idea` | Fokus: Vision | – | quickwins.js:291 |
| `g` , `⌘Enter` | `generate` | Generieren | Generate-Button nicht disabled | quickwins.js:293 |
| `p` | `refine.pro` | Für Pro | Ergebnis vorhanden | quickwins.js:299 |
| `c` | `copy.result` | Ergebnis kopieren | Ergebnis vorhanden | quickwins.js:301 |
| `h` | `history.toggle` | Verlauf | – | quickwins.js:303 |
| `b` | `auto.trim` | Auto-Kürzen 200 | Ergebnis vorhanden | quickwins.js:305 |
| `⌘D` | `dashboard.toggle` | Dashboard ein/aus | – | quickwins.js:313 |
| `⌘,` | `settings.open` | Einstellungen | – | quickwins.js:316 |
| `⌘⇧E` | `export.prompt` | Prompt exportieren | Ergebnis vorhanden | quickwins.js:319 |
| `⌘S` | `save.export` | Schnell-Export | Ergebnis vorhanden | quickwins.js:322 |
| `⌘I` | `open.idea-spark` | Idea Spark | – (klickt `#spark-idea-button`) | quickwins.js:326 |
| `⌘Y` | `open.style-sync` | Style Sync ⛔ | – | quickwins.js:329 |
| `⌘L` | `open.klang-studio` | Klang Studio ⛔ | – | quickwins.js:332 |
| `⌘Z` | `undo` | Rückgängig | – | kachel_system.js:534 |
| `⌘⇧Z` | `redo` | Wiederholen | – | kachel_system.js:536 |
| `⌘⇧T` | `topbar.toggle` | Menüleiste ein/aus | – | topbar_collapse.js:61 |
| `⌥A` | `vision.focus` | Fokus-Modus: Vision | – | vision_focus.js:194 |
| `e` | `chord.expert` | Experten-Chord | Ziel-Buttons existieren | chords.js:263 |
| `k` | `chord.klug` | KLUG-Chord | s. o. | chords.js:266 |
| `f` | `chord.future` | Future-Lab-Chord | s. o. | chords.js:270 |
| `v` | `chord.nav` | Navigation-Chord | – | chords.js:274 |

**Scope `any` (auch beim Tippen)**
| `⇧/` , `F1` | `help.shortcuts` | Tastenkürzel-Cheat-Sheet | quickwins.js:308 |
| `⌘K` | `palette.open` | Befehlspalette | quickwins.js:310 |

**Scope `command-palette` (priority 50, nur wenn Palette offen und `#cmdk-input` fokussiert)**
`↓` `palette.down` · `↑` `palette.up` · `Enter` `palette.select` (palette.js:266–284)

**Scope `dashboard`** — `[` / `⌘←` = `page.prev`, `]` / `⌘→` = `page.next`; Guard: `document.activeElement` liegt in `.bottom-dashboard` (quickwins.js:336–344). **Funktionslos** (siehe Abschnitt 0).

**Scope `creative-cosmos`** ⛔ (creative_cosmos.js:10698–10735): `m` Schnell-Markierung, `n` Markierung mit Notiz, `Backspace`/`Delete` letzte Markierung rückgängig, `⇧R` alle Markierungen zurücksetzen.

**Nicht über die Registry**
- `Escape` → CloseStack (capture phase, close_stack.js:72)
- `Tab` / `⇧Tab` → FocusTrap (capture phase, focus_trap.js:122)
- `Ctrl+Shift+Escape` → Notfall-Reset von ScopeStack + CloseStack, **nur auf `localhost`** (scope_stack.js:100–108)
- `⌘Enter` im `#idea-input` → generiert (app.js:266) — zusätzlich zur Registry
- `Enter` im `#api-key-input` → speichert (app.js:261)

**Chord-Semantik (js/chords.js)**
- `CHORD_TTL = 1200 ms`, Nav-Chord `NAV_TTL = 800 ms`, `MAX_KEYS = 9`
- Chord-Start: Scope `chord-builder` wird gepusht, Keycap-Badges (`.keycap-badge-lg`) werden auf die Ziel-Buttons gelegt, `#chord-hint` erscheint; ein `setTimeout(ttl+50)` bricht ab
- Ziffern 1–9 → `clickIndex()` (Ziel bekommt 400 ms `.pulse`, dann Klick, dann Chord-Ende)
- `0` → nächste Seite (zyklisch, nur wenn >1 Seite), Deadline wird auf `CHORD_TTL` zurückgesetzt
- Jede andere Taste bricht ab; im Nav-Chord wird sie zusätzlich per `Chords._redispatch = true` neu verarbeitet
- Nav-Ziele: `d` Dashboard (`scrollIntoView` + `focus`), `c` Creative Cosmos (klickt `#idea-starter-tile`) ⛔, `s` Style Sync (klickt `#style-sync-tile`) ⛔, `t` Kachel-System (fokussiert `.bottom-dashboard`)
- **Modal-Slider-Tasten** (chords.js:221–257), aktiv solange ein Modal via `modal:open` registriert ist und kein Modifier gedrückt wird: `Enter` klickt den ersten `button[id^="apply-"]`/`button[id^="run-"]`; `↑`/`→` = +5, `↓`/`←` = −5 auf den ersten `input[type=range]`; Ziffern `1`–`9` setzen 10–90, `0` setzt 100. Es wird jeweils ein `input`-Event ausgelöst.

### 3.3 CloseStack (js/close_stack.js)
- LIFO-Stapel `[{id, close}]`, `id`-Duplikate werden ignoriert, jede `close`-Funktion ist per `once()` idempotent
- Auto-ID-Format: `_cs_<timestamp>_<4 Zufallszeichen>`
- **Ein einziger** globaler `keydown`-Listener in der **Capture-Phase**: bei `Escape` wird das oberste Element gepoppt und geschlossen; danach `preventDefault()` + `stopImmediatePropagation()`. Ist der Stapel leer, passiert nichts (Event läuft normal weiter).
- `pop(id)` entfernt ohne zu schließen (für „regulär geschlossen"-Fälle); `pop()` ohne Argument entfernt das oberste
- API: `push, pop, handleEscape, peek, clear, debug, size` — als **nicht überschreibbare, nicht konfigurierbare** Property auf `window` definiert
- **BodyScrollLock**: `lock()` setzt immer `body.style.overflow='hidden'`; `unlock()` räumt **nur** auf, wenn der CloseStack leer ist → korrektes Verhalten bei verschachtelten Modals

Registrierte CloseStack-IDs (für Portierung der Escape-Semantik):
`api-setup` · `shortcut-modal` · `shortcut-settings` · `palette` · `history-panel` · `bd-detail-1/2/3` · `modal-<modalId>` (alle Tool-Modals) · `klang-studio` ⛔ · `style-sync-studio` ⛔ · Kreativbibliothek ⛔

### 3.4 ScopeStack (js/scope_stack.js)
- Stapel startet mit `['global']`; `push(name)` gibt ein **Token** (`scope-<n>`) zurück, `pop(token)` entfernt gezielt
- Out-of-order-Pop: wird per `lastIndexOf` herausgeschnitten und mit `console.warn` gemeldet
- Bekannte Scopes + Anzeigelabels (Zeile 10–20): `global`(kein Label), `dashboard`→„Dashboard", `chord-builder`→„Chord-Modus", `creative-cosmos`→„Creative Cosmos", `style-sync`→„Style Sync", `klang-studio`→„Klang Studio", `modal`→„Modal", `modal-slider`→„Slider", `command-palette`→„Befehlspalette"
- `isActive(scope)`: `global`/`any` immer wahr, sonst muss der Scope **oberstes** Stapelelement sein
- `openWithScope(closeFn, scopeName, closeId)`: pusht Scope + CloseStack-Eintrag zusammen und gibt `{scopeToken, closeId}` zurück (von `setupModal` genutzt)
- Leak-Erkennung: `checkLeaks(maxAge = 900000 ms = 15 min)`, **nur auf `localhost`** alle 60 s (Zeile 95–97), gibt Warnungen aus
- Visueller Indikator `#scope-indicator`: Text `⌨ <Label>`, Klasse `show`, bei jedem Wechsel 300 ms `pulse-scope`-Animation

### 3.5 FocusTrap (js/focus_trap.js)
- Fokussierbare Selektoren: `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]`, `[contenteditable=true]` — jeweils ohne `[disabled]`/`[tabindex="-1"]`, `input` zusätzlich ohne `type=hidden`
- Sichtbarkeitsfilter: `offsetParent !== null || offsetWidth > 0 || offsetHeight > 0`
- Stapel für verschachtelte Modals; `activate()` fokussiert per `requestAnimationFrame` das erste Element (oder das Modal selbst nach Setzen von `tabindex=-1`)
- `deactivate()` stellt den Fokus auf das auslösende Element zurück (in `try/catch`, falls entfernt); `deactivateByModal(modal)` als Lookup-Variante
- Globaler `Tab`-Handler in der **Capture-Phase**: umbrechen am ersten/letzten Element, `preventDefault` auch wenn der Fokus außerhalb des Modals liegt; ohne fokussierbare Kinder wird `Tab` komplett unterdrückt

### 3.6 Tips / Onboarding (js/tips.js)
- Storage-Key `ssa_tips_v1` — Objekt `{shortcutId: number | 'learned'}`
- `Tips.show(id, anchorEl)` zeigt nichts mehr, sobald der Wert `'learned'` oder ≥ 3 ist; jeder Aufruf erhöht den Zähler, ab 3 → `'learned'`
- Bubble-Text: `💡 Tipp: <kbd>⌘/⇧/⌥…</kbd> für <Label>`, das erste registrierte Binding wird angezeigt
- Position: `top = max(8, ankerTop − 40)px`, `left = ankerMitte` (Fallback `top:20px; left:50%`)
- Auto-Ausblendung nach **3000 ms**; jeder Tastendruck oder Klick blendet aus
- Aufrufstellen: `Tips.show('generate', generateButton)` beim Klick auf Generieren (app.js:265); `Tips.markLearned('generate')` bei Shortcut-Nutzung (quickwins.js:296); `Tips.show('chord.future', …)` beim Öffnen des Style-Sync ⛔
- **Onboarding-Banner** `#onboarding-banner`: erscheint einmalig, Text „Power User? Drücke `Shift+?` für alle Tastenkürzel."; Klick oder **10 000 ms** blenden aus (Fade 500 ms), danach `ssa_onboarding_seen = '1'`

### 3.7 Shortcut-Editor (js/shortcuts_settings.js)
- Öffnen über `#shortcuts-settings-button`, schließen über `#shortcut-settings-close`, Klick auf Backdrop (`.absolute`) oder Escape (CloseStack-ID `shortcut-settings`)
- Liste: pro Aktion eine Zeile mit Label, `id · scope`, Binding-Chips (mit „×" zum Entfernen) und Button „Hinzufügen"
- **Konfliktprüfung**: kanonisierte Bindings werden gruppiert; Kopfzeile zeigt „Konflikte: N" (rot) oder „Keine Konflikte"; kollidierende Chips bekommen `.conflict`
- Kanonische Form: `Mod+Shift+Alt+<key>` in genau dieser Reihenfolge
- Aufnahme: `#shortcut-settings-modal` bekommt `.recording`, der **nächste** Tastendruck (`{once:true}`) wird erfasst; Kombinationen werden auf `KeyX`/`Enter`/`Slash`/`Space` abgebildet und dedupliziert
- „Standard"-Button: `confirm('Alle Shortcuts zurücksetzen?')` → `Keys.resetCustom()`
- Neu gerendert bei jedem `keys:updated`-Event

### 3.8 Cheat-Sheet-Modal (quickwins.js:396–443)
Beim Öffnen wird der Inhalt aus der Registry neu generiert: Gruppierung nach Scope (`Global`, `Creative Cosmos`, `Befehlspalette`, `Dashboard`, `Chord-Modus`, `Sonstige`); im aktuellen Scope nicht aktive Zeilen erscheinen mit `opacity-40`; mehrere Bindings mit „ / " getrennt.
**Layout-abhängige Beschriftung** (`formatBinding`, quickwins.js:378–394): bei QWERTZ wird `Slash` als „⌘F" und `Shift+Slash` als „F1" dargestellt; sonst Ersetzungen `Mod+`→⌘, `Shift+`→⇧, `Alt+`→⌥, `BracketLeft/Right`→`[`/`]`, `Comma`→`,`, Pfeile→↑↓←→, `Backspace`→⌫, `Delete`→⌦.

### 3.9 QWERTZ-Erkennung (js/layout_detect.js)
1. Primär `navigator.keyboard.getLayoutMap()`: liefert `KeyY` den Buchstaben „z", ist es QWERTZ
2. Fallback: `navigator.languages` enthält `de` oder `de-*` → QWERTZ, sonst QWERTY
3. Auto-Erkennung bei `DOMContentLoaded`; API `KeyboardLayout.{detect,getLayout,isQWERTZ}`
Für macOS-Port: die Systemtastaturbelegung ist nativ direkt abfragbar; nur die Cheat-Sheet-Beschriftung hängt davon ab.

### 3.10 Befehlspalette (js/palette.js)
- 5 Gruppen: Experten-Tools (9), KLUG-Tools (12), Future Lab (7), Features (3), Aktionen (aus der Keys-Registry)
- Fuzzy-Filter über Label + ID + Binding + Beschreibung; Kategorie-Header werden für Gruppen mit Treffern neu eingefügt
- Auswahl: bei `type='tool'` wird der Ziel-Button geklickt, bei `type='action'` `Keys.run(id)`; die Palette schließt **vor** der Ausführung
- Öffnen pusht Scope `command-palette` + CloseStack-ID `palette`; Input wird nach **10 ms** fokussiert und geleert
- **Action-HUD**: `keys:action` zeigt das Label 900 ms lang; zusätzlich 400 ms `.pulse` auf einem zugeordneten Element (Mapping palette.js:311–322 — enthält noch `refine.v3`→`#suno-v3-button`, das es nicht mehr gibt)
- `keys:blocked` zeigt kontextsensitive Meldungen: „<Label> – nicht verfügbar" (guard), „<Label> – nur in <Scope-Label>" (scope), sonst „<Label> – hier nicht aktiv"
- Die Palette-Einträge listen Chord-Bindings als Text („E 1", „K 0→1") — diese sind **hartkodiert** und müssen mit chords.js synchron gehalten werden

### 3.11 Generische Modal-Mechanik (`setupModal`, api.js:437–503)
Gilt für alle Tool-Modals aus `js/modals.js`:
- **Öffnen** ist gesperrt, solange `isPromptGenerated === false` — Ausnahmen: `idea-modal` und `style-sync-modal`. Bei Sperre: Warn-Toast „Bitte generiere zuerst einen Prompt, um dieses Tool zu nutzen." + 500 ms `.bd-shake` auf dem Auslöser
- Öffnen: `hidden` entfernen, `BodyScrollLock.lock()`, Klassenwechsel `modal-leave-to`→`modal-enter-to`, `ScopeStack.openWithScope(close,'modal','modal-'+id)`, `FocusTrap.activate`, Event `modal:open {id}`
- Schließen: FocusTrap deaktivieren, Scope + CloseStack-Ghost-Eintrag aufräumen, `modal-leave-to` setzen, nach **200 ms** `hidden` + `BodyScrollLock.unlock()` + Event `modal:close {id}`
- Schließen zusätzlich per `.close-modal-button` und Klick auf den Modal-Hintergrund (`e.target === modal`)

### 3.12 Portal-Mechanik des Bottom-Dashboards (bottom_tools.js:145–220)
Klick auf eine Tool-Kachel **verschiebt das echte Modal-DOM-Element** in das Spalten-Overlay `#bd-detail-N` (Klasse `bd-inline` überschreibt `position:fixed`), klickt dann den versteckten Proxy-Button (damit alle On-Open-Handler feuern) und setzt anschließend `body.style.overflow = ''` zurück, weil das Modal inline dargestellt wird. Beim Schließen wandert das Modal zurück nach `#modals-container` und wird wieder `hidden`. Ein globaler `modal:close`-Listener schließt das Overlay, wenn das portierte Modal sich selbst schließt.
Ohne generierten Prompt zeigt das Overlay stattdessen den Hinweistext „Erst einen Prompt generieren, dann kannst du dieses Tool nutzen." und der Button wird zu „Erst Prompt generieren" (`.bd-btn-disabled`).
Für SwiftUI: **nicht** als DOM-Portal portieren — funktional ist es „Tool-Detail wird inline in der Spalte statt als Overlay dargestellt".

---

## 4. Konfiguration & Zustand

### 4.1 localStorage — vollständige Liste
| Key | Typ / Format | Zweck | Default / Verhalten ohne Wert | Quelle |
|---|---|---|---|---|
| `ssa_api_key` | String | OpenRouter-Key (bevorzugt) | leer → Setup-Modal | app.js:51 |
| `openrouter_api_key` | String | OpenRouter-Key (Spiegel; beide werden immer parallel geschrieben) | leer | app.js:75/111 |
| `OPENROUTER_API_KEY` | String | Legacy, nur **gelesen** | – | app.js:53 |
| `api_key` | String | Legacy, nur **gelesen** | – | app.js:54 |
| `selected_model` | String | Textmodell | `openai/gpt-5-mini` | app.js:57 |
| `fal_api_key` | String | fal.ai-Key (optional) | leer | app.js:61 |
| `FAL_API_KEY` | String | Legacy, nur **gelesen** | – | app.js:62 |
| `fal_model` | String | Bildmodell | `fal-ai/nano-banana-pro` | app.js:65 |
| `ssa_keybindings_v1` | JSON `{id:[bindings]}` | Shortcut-Überschreibungen | `{}` | keys.js:5 |
| `ssa_layout_split_v1` | Zahl-String (25–85) | Top/Bottom-Split in % | CSS-Default 67 (bzw. 68 bei Höhe ≤800) | layout_resize.js:10 |
| `ssa_topbar_collapsed` | `'1'`/`'0'` | Menüleiste eingeklappt | ausgeklappt | topbar_collapse.js:6 |
| `ssa_bd_collapsed` | `'1'`/`'0'` | Bottom-Dashboard eingeklappt | **eingeklappt** (Key fehlt → true) | bottom_tools.js:222 |
| `ssa_vision_focus_v1` | `'1'`/`'0'` | Vision-Fokus | aus | vision_focus.js:15 |
| `ssa_tips_v1` | JSON `{id: n\|'learned'}` | Tipp-Zähler | `{}` | tips.js:5 |
| `ssa_onboarding_seen` | `'1'` | Onboarding-Banner gesehen | fehlt → Banner zeigen | tips.js:80 |
| `ssa_history_v1` | JSON-Array | Prompt-Verlauf, max. 20 | `[]` | quickwins.js:6 |
| `ssa_bd_favorites_v1` | JSON | angepinnte Tools | – | kachel_system.js:291 |
| `ssa_bd_order_v1` | JSON | Drag-&-Drop-Reihenfolge | – | kachel_system.js:921 |
| `ssa_bd_chains_v1` | JSON | Tool-Ketten | – | kachel_system.js:1367 |
| `ssa_user_templates_v1` | – | **wird beim Start gelöscht** (Migration) | – | quickwins.js:209 |
| `suno_templates_v1` | – | **wird beim Start gelöscht** (Migration) | – | quickwins.js:209 |
| `sn-zoom`, `sn-pan-x`, `sn-pan-y`, `sn-spread-factor`, `sn-text-size`, `sn-labels-visible`, `sn-panel-split` | – | Kreativbibliothek-Ansichtszustand ⛔ | – | creative_cosmos.js |

**sessionStorage wird nirgends verwendet.**
Fehlerbehandlung: `layout_resize`, `vision_focus` und `bottom_tools` kapseln jeden Storage-Zugriff in `try/catch` (Private-Mode/Quota); `keys.js`, `tips.js`, `topbar_collapse.js` und `quickwins.js` **nicht** — dort kann ein voller Storage werfen.

### 4.2 Globale Laufzeit-Variablen (js/config.js)
| Variable | Default | Bedeutung |
|---|---|---|
| `API_KEY` | `''` | OpenRouter-Key |
| `SELECTED_MODEL` | `'openai/gpt-5-mini'` | Textmodell |
| `API_URL` | `https://openrouter.ai/api/v1/chat/completions` | konstant |
| `FAL_API_KEY` | `''` | Bild-Key |
| `FAL_MODEL` | `'fal-ai/nano-banana-pro'` | Bildmodell |
| `FAL_BASE_URL` | `https://fal.run/` | konstant |
| `isPromptGenerated` | `false` | **zentrales Gate** für alle Tools |
| `selectedKlugItems` | `[]` | generischer Auswahl-Zustand in Modals |
| `MODEL_NAMES` | 8 Einträge | Anzeigenamen Textmodelle |
| `FAL_MODEL_NAMES` / `FAL_MODEL_ENDPOINTS` | 7 Einträge | Anzeigenamen / Endpunkte Bildmodelle |
| `musicGenres` | 58 Genres | für den Genre-Mixer |

`js/app.js` hält zusätzlich ~30 zwischengespeicherte DOM-Referenzen (Zeile 3–36) und `_errorAutoDismissTimer`.

### 4.3 Settings-Fluss (app.js:48–135)
- `loadSettings()`: erster nicht-leerer Key aus vier Kandidaten gewinnt; bei Erfolg werden `ssa_api_key` und `openrouter_api_key` **normalisiert zurückgeschrieben**, Formularfelder befüllt, Header-Chips aktualisiert, Haupt-App gezeigt. Ohne Key → Setup-Modal.
- `saveSettings()` validiert: leer → „Bitte gib deinen OpenRouter API Key ein."; Präfix ≠ `sk-or-v1-` → „Der API Key sollte mit „sk-or-v1-" beginnen. Bitte überprüfe deinen Key." Der fal-Key wird **nicht** validiert.
- `showMainApp()` setzt `main-app` auf `display:flex`, fügt `app-no-scroll` hinzu und poppt vorsorglich den CloseStack-Eintrag `api-setup`.
- Achtung: `showSettings()` (über „⚙️ Ändern") pusht **keinen** CloseStack-Eintrag — nur der `⌘,`-Weg (quickwins.js:352) tut das. Escape schließt das Setup-Modal also nur, wenn es per Shortcut geöffnet wurde.

---

## 5. Einstiegspunkte zu Features

### 5.1 Aus dem Haupt-Layout
| Element | id | Ziel |
|---|---|---|
| „Ideen-Funke" (Textlink oben in der Vision-Karte) | `#spark-idea-button` | `#idea-modal` (Ideen-Funke, features.js:38–47) |
| „Prompt Architektieren" | `#generate-button` | löst Generierung aus |
| „Für Pro (detailliert)" | `#suno-pro-button` | Verfeinerung, kein Modal |
| „Eigene Anweisung" | `#custom-instruction-button` | Custom-Instruction-Modal (features.js:1776) |
| Auto-Kürzen / Export / Import / Undo / Redo | `#auto-trim-v3-button`, `#export-prompt-button`, `#import-prompt-button`, `#bd-undo-btn`, `#bd-redo-btn` | Inline-Aktionen |
| Vision-Fokus (injiziert) | `#vision-focus-toggle` | Layout-Toggle |
| 29 Tool-Kacheln im Bottom-Dashboard | `#bd-list-1/2/3` | jeweiliges Tool-Modal (Portal in `#bd-detail-N`) |

### 5.2 Aus der Topbar
`#help-shortcuts-button` (aktuell ohne Handler) · `#shortcuts-settings-button` → `#shortcut-settings-modal` · `#history-toggle-button` → `#history-panel` · `#change-settings-button` → `#api-setup-modal`

### 5.3 ⛔ AUSGESCHLOSSENE FEATURES — Einstiegspunkte für „sichtbar, aber deaktiviert"

**⛔ Kreativbibliothek („Ideen-Starter" / Spectrum Navigator)**
- **Kachel:** `#idea-starter-tile`, index.html:302–333 — Position 1 im rechten Kreativ-Stack (`.app-kreativ-stack`), `flex-1`
- **Aussehen:** `<button class="kreativ-panel active group …">`, `rounded-3xl p-6`, Glas-Look `bg-neutral-800/20 backdrop-blur-md border border-neutral-700/60`, Hover: `scale-[1.02]` + blauer Rand/Schatten. Inhalt: 40×40 Icon-Kachel `bg-blue-500/20` mit Glühbirnen-SVG in `text-blue-400`; Titel **„Ideen-Starter"** (`text-xl font-bold text-white`); Untertitel „Starte mit einem Funken. Wähle eine Welt und lass dich inspirieren." (`text-xs text-neutral-400`); Fußzeile „Starten →" in `text-blue-400`, `opacity-60` → 100 bei Hover
- **Weitere Einstiege:** Nav-Chord `V` dann `C`; Befehlspalette „Ideen-Funke" (Gruppe Features, Binding-Anzeige ⌘I); Shortcut `⌘I` klickt allerdings `#spark-idea-button` (also das kleine Ideen-Funke-Modal), während die Palette `#idea-starter-tile` klickt — **die beiden Wege führen zu unterschiedlichen Zielen**
- Öffnet `#idea-starter-modal` (Vollbild, `z-[130]`, `.sn-shell`, Titel „Spectrum Navigator", Untertitel „Kreativbibliothek"), Scope `creative-cosmos`

**⛔ Stil-Synchronisator (Style Sync)**
- **Kachel:** `#style-sync-tile`, index.html:336–367 — Position 2 im Kreativ-Stack
- **Aussehen:** identische Kachelstruktur, aber violett: Icon-Kachel `bg-purple-500/20` mit „Sync/Verbindungs"-SVG in `text-purple-400`, Hover-Rand `purple-500/30`; Titel **„Stil-Synchronisator"**; Untertitel „Übersetze zwischen Sound und Bild. Bidirektionale Inspiration."; Fußzeile „Synchronisieren ↔" in `text-purple-400`
- **Weitere Einstiege:** Shortcut `⌘Y`; Nav-Chord `V` dann `S`; Befehlspalette „Stil-Synchronisator" (⌘Y)
- Öffnet `#style-sync-studio` (Vollbild, `z-[140]`, index.html:1601), Scope `style-sync`; ist eines der zwei Modals, die **ohne** generierten Prompt geöffnet werden dürfen

**⛔ Klang-Studio**
- **Kachel:** `#klang-studio-tile`, index.html:370–403 — Position 3 im Kreativ-Stack
- **Aussehen:** identische Struktur in Cyan: Icon-Kachel `bg-cyan-500/20` mit 4-Rechtecke/Modul-SVG in `text-cyan-400`, Hover-Rand `cyan-500/30`; Titel **„Klang-Studio"**; Untertitel „Textbasiertes Sound-Design. Synths, Orchester & mehr."; Fußzeile „Designen 🎛️" in `text-cyan-400`
- **Weitere Einstiege:** Shortcut `⌘L`; Befehlspalette „Klang-Studio" (⌘L)
- Öffnet `#klang-studio-modal` (Vollbild, `z-[130]`, `95vw × 90vh`, Tabs `#ks-module-tabs`), Scope `klang-studio`

**Referenz für den „deaktiviert"-Look:** Die vierte Kachel „Universum – Coming Soon" (index.html:406–425) zeigt exakt den gewünschten Stil: `kreativ-panel inactive`, `bg-neutral-800/10 border-neutral-800`, `grayscale opacity-50 cursor-not-allowed`, neutraler Icon-Container, Titel in `text-neutral-500`, Zusatz „Coming Soon" in `text-[10px] text-neutral-600`, kein Hover-Effekt.
Für V1 also: die drei Kacheln in genau diesem Zustand rendern, Klick/Shortcut/Chord/Palette-Eintrag deaktivieren (Palette-Einträge idealerweise ausgegraut statt entfernt).

---

## 6. Edge-Verhalten, Timings und Grenzwerte

**Zeitkonstanten (alle Werte, die ein Portierer treffen muss)**
| Wert | Bedeutung | Quelle |
|---|---|---|
| 8000 ms | Auto-Ausblendung der Fehlerbox | app.js:171 |
| 4500 ms | Toast-Standarddauer | config.js:60 |
| 6000 ms | Toast „Prompt überschrieben von …" mit Rückgängig | config.js:131 |
| 10000 ms | Toast „Auto-Trim: N Zeichen entfernt" mit Rückgängig | quickwins.js:186 |
| 8000 ms | Toast „Verlauf geleert" mit Rückgängig | quickwins.js:493 |
| 300 ms | Fallback-Entfernen eines Toasts, falls `transitionend` ausbleibt | config.js:87 |
| 2000 ms | „Fehler"-Text im Pro-Button, danach Rücksetzung | app.js:248 |
| 200 ms | Verzögerung bis `hidden` beim Modal-Schließen | api.js:491 |
| 500 ms | `.bd-shake` auf blockiertem Auslöser | api.js:452 |
| 420 ms | Vision-Fokus-Transition (`ANIM_MS` **und** CSS) | vision_focus.js:18 / CSS:6449 |
| 1200 ms / 800 ms | Chord-TTL / Nav-Chord-TTL (+50 ms Timer-Puffer) | chords.js:5–6, 84 |
| 400 ms | `.pulse` auf Chord-/HUD-Ziel | chords.js:158, palette.js:309 |
| 900 ms | HUD-Anzeigedauer | palette.js:303 |
| 3000 ms | Tip-Bubble | tips.js:66 |
| 10000 ms / 500 ms | Onboarding-Banner-Dauer / Ausblendung | tips.js:88–92 |
| 10 ms | Verzögerung bis Palette-Input-Fokus | palette.js:231 |
| 60 s / 15 min | ScopeStack-Leak-Check-Intervall / Schwelle (nur localhost) | scope_stack.js:96, 84 |

**Grenzwerte**
- Verlauf: max. **20** Einträge (`MAX_HISTORY`), beim Speichern hart abgeschnitten
- Zeichenzähler: Anzeige „N / 1000"; grün ≤800, gelb ≤1000, rot darüber (quickwins.js:154–158)
- Pro-Verfeinerung: harte Kürzung auf **1000** Zeichen (`refined.slice(0,1000)`, app.js:243)
- Auto-Trim: Ziel **200** Zeichen; entfernt Füllwörter (`very|really|extremely|highly|super|quite|some|kind of|sort of`), komprimiert Whitespace/Kommas, schneidet auf Wortgrenze; bei ≤200 Zeichen nur Info-Toast (quickwins.js:164–199)
- Chords: max. 9 Ziel-Tasten pro Seite; Split-Grenzen 25–85 %
- Presets: max. 10 gerendert (`renderPresets`, quickwins.js:223) — das Ziel `#preset-chips` existiert in index.html allerdings **nicht** mehr → wirkungslos

**Debounces / Throttles**
- Nur ein echter Throttle: der Splitter drosselt auf `requestAnimationFrame` (layout_resize.js:94)
- **Kein** Debounce auf dem Palette-Filter (`input`-Event filtert sofort über alle ~35 Einträge)
- `MutationObserver` auf `#result-text` (`childList`, `characterData`, `subtree`) aktualisiert bei **jeder** Änderung Zeichenzähler und Lint — ungedrosselt (quickwins.js:469–473)

**Fehler- und Leerzustände**
- Fehlerbox: Tippen in `#idea-input` oder `#lyric-input` blendet sie sofort aus und stoppt den Auto-Dismiss-Timer (app.js:267–268)
- Generieren ohne Eingabe: „Bitte gib eine Idee oder Lyrics ein."
- Generieren ohne API-Key: „Bitte konfiguriere zuerst deinen API Key in den Einstellungen." + Setup-Modal öffnet sich
- Generieren-Fehler: `setKlugToolsState(false)` — die Tools werden wieder gesperrt
- Verlauf leer: `#history-empty-state` bekommt `.visible`, `#history-list` wird `display:none`
- Verlauf leeren bei leerem Verlauf: nur Info-Toast, kein Löschvorgang
- Import ungültiger JSON: Toast „Ungültige Datei."
- Export ohne Prompt: Toast „Kein Prompt vorhanden." (Warnung)
- Toast-Typen: `error` (X-Kreis), `warning` (Dreieck), `info` (i-Kreis); optionaler Aktionsbutton; `duration <= 0` = kein Auto-Dismiss
- Alle Toast-Nachrichten laufen durch `escapeHTML()` (config.js:2–6); `showInlineError` ebenfalls

**Undo-Semantik**
`applyPromptWithUndo(text, toolName)` (config.js:118–138) ist der **zentrale** Schreibpfad auf `#result-text`: nur wenn vorher Inhalt vorhanden war, wird `BdUndo.captureBeforeApply(toolName)` aufgerufen **und** ein 6-Sekunden-Toast „Prompt überschrieben von „<Tool>"" mit „Rückgängig"-Button gezeigt. Aufrufer: Generierung („Prompt generiert"), Pro-Verfeinerung („Suno Pro"), Auto-Trim, Import, Verlaufs-Wiederherstellung.

**Sonstige Fallstricke**
- Das Eingabefeld für Lyrics wird beim Generieren als `\n\n--- LYRICS ---\n` an die Idee angehängt; nur Lyrics ohne Idee ist erlaubt (app.js:191–198)
- `#result-text` ist ein `<pre tabindex="0">` (kein Eingabefeld) — es wird immer über `textContent` geschrieben und über `.textContent.trim()` gelesen
- Die Prüfung „gibt es ein Ergebnis?" ist überall `!!getCurrentPrompt()`, also textbasiert, nicht zustandsbasiert
- Verlauf: identischer Inhalt wie der neueste Eintrag wird nicht erneut gespeichert (quickwins.js:79)
- Verlaufs-Import mischt zusammen und sortiert nach `createdAt` absteigend; kein Dubletten-Check
- Das Setup-Modal wird über `style.display` gesteuert, alle anderen Overlays über die Klasse `hidden` — zwei verschiedene Sichtbarkeitsmechanismen
- Toter/nicht verdrahteter Code, den man nicht portieren sollte: `js/tool_paging.js`, `page.prev`/`page.next`, `#help-shortcuts-button`, `#preset-chips`/`renderPresets`, `refine.v3`→`#suno-v3-button` im HUD-Mapping, die auskommentierten 30 Lint-Hinweise (H01–H30, quickwins.js:13–46)

---

## 7. Design-System / CSS-Überblick

> Vertiefung erfolgt im Ticket **Design-Token-Extraktion aus styles.css** (#133) — hier nur der Überblick.

Eine einzige Datei `css/styles.css` (6777 Zeilen) plus **Tailwind über CDN** (index.html:8) — der Großteil des Layouts steckt in Tailwind-Utility-Klassen im Markup, nicht in der CSS-Datei. Schriften: **Inter** (300–700) für Fließtext, **Space Grotesk** (400–700) als Display-Font, beide von Google Fonts.

Es gibt **kein Light/Dark-Umschalten** — die App ist ausschließlich dunkel. Drei getrennte Token-Sets (Custom Properties):

1. **`--bd-*`** (CSS:202–221) — Bottom-Dashboard / App-Shell: `--bd-glass rgba(15,23,42,.25)`, `--bd-glass-border rgba(148,163,184,.18)`, `--bd-glass-elevated rgba(10,15,30,.90)`, Texte `--bd-text-primary #fff`, `--bd-text-body #e5e7eb`, `--bd-text-secondary #94a3b8`, `--bd-text-disabled #64748b`; Spaltenakzente `--bd-purple #a78bfa`, `--bd-cyan #67e8f9`, `--bd-emerald #6ee7b7` (je mit `-glow` und `-border`-Variante); Easings `--bd-ease-major cubic-bezier(.23,1,.32,1)`, `--bd-ease-ui cubic-bezier(.4,0,.2,1)`
2. **`--sn-*`** (CSS:2275–2304) ⛔ — Kreativbibliothek: eigene Hintergrund-/Rahmen-/Text-Skala, 6 Akzentfarben, 6 Gruppenfarben, Radien `sm 6 / md 10 / lg 16 / xl 24`, eigene Schriftvariablen, `--sn-reader-font-size 13.5px`
3. **`--ks-*`** (CSS:3643 ff.) ⛔ — Klang-Studio: `--ks-primary #06b6d4` (+ light/dark), `--ks-accent #14b8a6`, Glow-Werte, Modulfarben `--ks-synth #8b5cf6`, `--ks-orchestra #f59e0b`, `--ks-blender #ec4899`

Durchgängige Stilmerkmale: „Neon-Glass" — halbtransparente Flächen mit `backdrop-blur`, `rounded-3xl` (24px) auf Karten, `rounded-xl`/`lg` auf Feldern und Buttons, Primärfarbe Blau (`bg-blue-600`), Sekundärfarbe Indigo, neutrale Grautöne aus der Tailwind-`neutral`-Skala. Wiederverwendete Interaktionsklassen: `btn-transition`, `btn-press`, `fade-in`, `animate-zoom-in`, `modal-enter-from/-to`, `modal-leave-to`, `pulse`, `bd-shake`, `keycap-badge`, `chord-highlight`.
Alle Bewegungen sind hinter `@media (prefers-reduced-motion: reduce)` abgesichert (CSS:1306, 1403, 3532) — für den Port bedeutet das: „Bewegung reduzieren" respektieren.

---

# Teil 2 — Kern-Features (`js/features.js`, `js/quickwins.js`, `js/tips.js`)

## 0. Rahmenwerk / geteilte Infrastruktur

### 0.1 Initialisierung
`features.js:1-33` — `initializeAdvancedFeatures()` wird bei **drei** Events ausgeführt: `DOMContentLoaded`, `modals:ready` (Modal-HTML wird von `modals.js:1-9` per `innerHTML` injiziert), `bottomtools:ready`. Mehrfachaufrufe sind Absicht → **Doppel-Listener-Gefahr**; nur einige Setups schützen sich (`modal.dataset.initialized`, `.synthDesignerInitialized`, `.ksInitialized`, `dataset.listenerAttached`). Alle anderen (Experten, Klug-Tools, Future-Lab) registrieren Listener potenziell mehrfach — beim Port als **einmalige** Bindung modellieren.

Reihenfolge: `setupIdeaSpark()`, `setupCustomInstruction()`, `setupStyleSync()`, `setupKlangStudio()`; danach nur wenn `.bottom-dashboard` im DOM: `setupExpertRefinements()`, `setupKlugTools()`, `setupVisualEngine()`, `setupFutureLabTools()`, `setupGenreEvolution()`.

### 0.2 `setupModal(modal, openButton)` — `api.js:437-503`
Gemeinsames Modal-Verhalten aller Features:
- **Gate**: Öffnen wird blockiert, wenn `isPromptGenerated === false` — **Ausnahme**: `idea-modal` und `style-sync-modal`. Bei Blockade: Toast „Bitte generiere zuerst einen Prompt, um dieses Tool zu nutzen." (warning) + CSS-Klasse `bd-shake` auf dem Trigger für 500 ms.
- Öffnen: `hidden` entfernen, `BodyScrollLock.lock()`, `CloseStack`/`ScopeStack` Push (Scope `'modal'`, id `'modal-<modalId>'`), `FocusTrap.activate(modal)`, Event `modal:open` mit `detail.id`.
- Schließen: FocusTrap deaktivieren (Fokus zurück auf Trigger), Stacks poppen, Klasse `modal-leave-to`, nach **200 ms** `hidden` + `BodyScrollLock.unlock()` + Event `modal:close`.
- Schließen auch per Klick auf `.close-modal-button` und Klick auf Backdrop (`e.target === modal`). ESC über CloseStack.

### 0.3 `applyPromptWithUndo(newText, toolName)` — `config.js:118-138`
Zentrale Schreiboperation auf `#result-text`. Wenn vorher Inhalt vorhanden war: `window.BdUndo.captureBeforeApply(toolName)` + Toast `Prompt überschrieben von „<toolName>"` (Typ `info`, 6000 ms) mit Aktionsbutton **„Rückgängig"** → `BdUndo.performUndo()`. Ohne Vorinhalt kein Toast.

### 0.4 `callOpenRouterAPI(userMessage, systemPrompt, imageUrl=null)` — `api.js:243-325`
- Wirft sofort, wenn `API_KEY` leer: „Bitte konfiguriere zuerst deinen API Key in den Einstellungen."
- Payload: `model: SELECTED_MODEL` (Default `openai/gpt-5-mini`, `config.js:37`), `stream:false`, `temperature:0.7`, **`max_tokens: 1000`**, `top_p:0.9`. Bei `imageUrl` wird der User-Content zum Array `[{type:'text'},{type:'image_url'}]` (Vision).
- **Timeout 60 000 ms** via AbortController. **Kein Retry.**
- Header: `Authorization: Bearer`, `HTTP-Referer: window.location.origin`, `X-Title: Suno Style Architect`.
- Antwort wird erst als Text gelesen, dann `JSON.parse`; Rückgabe `choices[0].message.content.trim()`.
- Fehlerpfade: Timeout/Abort → generischer Timeout-Text; `!response.ok` → `API request failed (<status>)`; Parse-Fehler → „API-Antwort konnte nicht verarbeitet werden…"; unerwartete Struktur → „Ein Fehler ist aufgetreten. Bitte versuche es erneut."

### 0.5 `callFalAPI(prompt, {retries=2, timeoutMs=120000, signal})` — `api.js:60-240`
Bildgenerierung, Default-Modell `fal-ai/nano-banana-pro`. Retry bei HTTP 408/429/500/502/503/504. Details siehe Teil 4.

### 0.6 `setKlugToolsState(enabled)` — `api.js:394-425`
Setzt globales `isPromptGenerated` und aktiviert/deaktiviert alle `.klug-btn` (Klassen `opacity-50 cursor-not-allowed`) sowie die Container `#expert-container`, `#klug-container`, `#lab-container` (Klasse `inactive-box`).

### 0.7 Storage-Keys (features-nah)
| Key | Quelle | Inhalt |
|---|---|---|
| `ssa_history_v1` | `quickwins.js:7` | Prompt-Verlauf, max 20 Einträge |
| `ssa_tips_v1` | `tips.js:5` | Tipp-Zähler pro Shortcut-ID |
| `ssa_onboarding_seen` | `tips.js:80,89` | `'1'` nach erstem Banner |
| `ssa_api_key`, `openrouter_api_key`, `OPENROUTER_API_KEY`, `api_key` | `app.js:51-54,75-76,111-112` | OpenRouter-Key (4 Legacy-Aliase!) |
| `selected_model` | `app.js:57,113` | Default `openai/gpt-5-mini` |
| `fal_api_key`, `FAL_API_KEY` | `app.js:61-62,114` | Fal.ai-Key |
| `fal_model` | `app.js:65,115` | Default `fal-ai/nano-banana-pro` |
| `suno_templates_v1`, `ssa_user_templates_v1` | `quickwins.js:208-213` | **Legacy — wird beim Start gelöscht** |

---

## 1. Idea Spark / „✨ Ideen-Funke"

**Code:** `features.js:35-87` · **Modal-HTML:** `modals.js:14-31` · **Trigger:** `index.html:154` (`#spark-idea-button`) · **Prompt:** `prompts.js:60-67` (`IDEA_SPARK_PROMPT`) · **Shortcut:** `Mod+I` (Action `open.idea-spark`)

### 1.1 Name & Zweck
UI-Titel: **„✨ Ideen-Funke"**. Untertitel: *„Gib ein Stichwort ein und erhalte 3 kreative Song-Ideen als Starthilfe."* Zweck: aus einem einzelnen Stichwort drei fundamental unterschiedliche Song-Konzepte erzeugen, von denen der Nutzer eines per Klick in das Hauptfeld **Vision** (`#idea-input`) übernimmt.

### 1.2 Eingaben
| Feld | ID | Typ | Pflicht | Default | Validierung |
|---|---|---|---|---|---|
| Stichwort | `keyword-input` | `<input type="text">` | **ja** | leer | `.trim()`; leer ⇒ Abbruch mit Inline-Fehler |

- Placeholder: `z.B. Ozean, Mitternacht, Nostalgie...`
- **Kein `maxlength`**, keine Zeichenzählung, keine Längenbegrenzung im UI.
- **Kein Reset beim Öffnen** — das Feld behält den letzten Wert über Modal-Schließungen hinweg (`ideasOutput` ebenfalls: alte Ergebnisse bleiben sichtbar bis zum nächsten Generieren).
- Auslöser: Klick auf `#generate-ideas-button` **oder** `Enter` im Textfeld (`features.js:85`, `e.preventDefault()` + `generateIdeas()`).

### 1.3 Ablauf (Schritt für Schritt)
1. Modal öffnen über `#spark-idea-button`. **Sonderfall:** `setupModal` lässt `idea-modal` auch **ohne** generierten Prompt zu (`api.js:441`) — es ist neben Style Sync das einzige Tool ohne Prompt-Gate.
2. `generateIdeas()` (`features.js:53`): `keyword = keywordInput.value.trim()`.
3. Ist `keyword` leer → `ideasOutput.innerHTML = '<p class="text-red-400">Bitte gib ein Stichwort ein.</p>'`, **kein** API-Call, **kein** Ladezustand. Ende.
4. `setIdeaLoading(true)` (`features.js:47-51`): `#generate-ideas-button.disabled = true`, Label `#idea-button-text` ausgeblendet, Spinner `#idea-loader` eingeblendet. Der Button hat feste Breite `w-36`, damit er nicht springt.
5. `ideasOutput.innerHTML = ''` — bisherige Ergebnisse werden gelöscht. **Kein Skeleton-Loader und kein Platzhaltertext im Ausgabebereich während des Ladens** (einziger Ladeindikator ist der Button-Spinner).
6. **Ein einziger API-Call:** `callOpenRouterAPI(keyword, IDEA_SPARK_PROMPT)` — der rohe Keyword-Text ist die User-Message, ohne jede Umrahmung. Kein Timeout jenseits der globalen 60 s, **kein Retry**.
7. Antwort-Parsing (`features.js:63`): `response.split('---')` und `.filter(idea => idea.trim() !== '')`. Es wird **nicht** auf genau 3 Elemente geprüft — liefert das Modell 2 oder 5 Blöcke, werden 2 bzw. 5 Karten gerendert. Leere Blöcke fallen weg.
8. Rendering pro Idee: `<div>` mit Klassen `p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors`, Inhalt via **`textContent`** (XSS-sicher, aber **ohne** Markdown-/Zeilenumbruch-Formatierung).
9. Klick auf eine Karte (`features.js:69-72`): schreibt `ideaText.trim()` in `document.getElementById('idea-input').value` und schließt das Modal via `ideaModalLogic.close()`.
   - **Wichtig:** Es wird **direkt `.value` gesetzt, ohne `input`-Event** — anders als `quickwins.setCurrentIdea()` (`quickwins.js:158`), das ein `Event('input')` dispatched. Folge: abhängige Zähler/Autosize auf `#idea-input` aktualisieren sich nach Idea-Spark-Übernahme **nicht**.
   - Es wird **kein** `QW.onPromptUpdated()` gerufen, **kein** History-Eintrag erzeugt, **kein** Undo-Snapshot — Idea Spark füllt nur das Eingabefeld, nicht das Ergebnis.
10. `finally`: `setIdeaLoading(false)`.

### 1.4 Ausgaben
- Liste anklickbarer Ideen-Karten in `#ideas-output` (`space-y-3 text-sm max-h-[50vh] overflow-auto` — scrollbar, max 50 % Viewporthöhe).
- Endresultat: Text in `#idea-input`. Keine Kopier-, Export- oder Speicherfunktion im Modal.

### 1.5 Zustand
- Lokal: nur `ideaModalLogic` (Modal-Handles). **Kein** persistenter Zustand, **kein** localStorage-Key.
- Ergebnisse überleben das Schließen des Modals im DOM (kein Reset-Hook auf `modal:open`), gehen aber beim Reload verloren.

### 1.6 Limits & Edge-Verhalten
- Keine Zeichenlimits/Counter am Eingabefeld; Ausgabe implizit durch `max_tokens: 1000` begrenzt.
- **Kein Schutz gegen Doppelklick nach Ende** — während des Laufs ist der Button disabled, aber es gibt **keine Request-ID/Stale-Prüfung** (anders als Visual Engine `genReqId`/`anaReqId`).
- Fehlerpfad (`features.js:75-78`): `console.error` + `ideasOutput.innerHTML = '<p class="text-red-400">' + escapeHTML(getUserFriendlyErrorMessage(error)) + '</p>'`. **Kein Toast**, kein Retry-Button.
- Fehlender API-Key: Fehler landet im Ausgabebereich. Es wird **nicht** automatisch der Einstellungsdialog geöffnet (anders als bei Visual Engine).
- `Enter` funktioniert auch wenn der Button disabled ist → theoretisch Parallel-Requests per Tastatur.

### 1.7 Systemprompt (Vertrag mit dem Modell) — `prompts.js:60-67`
Deutschsprachig. Regeln: (1) maximale Vielfalt — drei drastisch unterschiedliche Genres/Erzählperspektiven/Emotionalitäten; (2) tiefgründige, metaphorische Interpretation des Stichworts; (3) Klischees vermeiden; (4) jede Idee = ein kurzer, fesselnder Absatz; (5) **Ausgabeformat: exakt drei Ideen, getrennt durch eine einzelne Zeile mit `---`, keine Nummerierung, keine Titel, keine Erklärungen.** Volltext siehe Teil 3, B.3. Für den Port: das Trennzeichen-Protokoll `---` ist der einzige Parsing-Vertrag und muss identisch erhalten bleiben.

---

## 2. Experten-Veredelung (8 Slider-Experten) — `features.js:89-157`

**Name/Zweck:** „Veredelung: <Rolle>" — verfeinert den bestehenden Prompt aus einer Fachperspektive mit regelbarer Einflussstärke.

**8 Instanzen** (`features.js:91-100`), je `type` → Modal `#<type>-modal`, Trigger `#<type>-refine-button`:
`producer` (🎤 Produzent, `PRODUCER_REFINER_PROMPT`), `musician` (🎹 Musiker), `composer` (🎬 Filmkomponist), `dj` (🎧 DJ/Remixer), `avantgarde` (🎨), `minimalist` (🔲), `vocal-harmony` (🎵), `ethno` (🌍).

**Eingaben:** ein Slider `#<type>-slider` — `min=0 max=100 value=50 step=10` (`modals.js:42`). Anzeige `#<type>-slider-value` zeigt live `value + '%'`. Kein Reset beim Öffnen ⇒ Wert bleibt über Sessions im DOM erhalten.

**Ablauf:** Klick auf Trigger → `Tips.show('chord.expert', openButton)` (`features.js:118`). Klick auf `#apply-<type>-button`:
1. `currentPrompt = #result-text.textContent.trim()`; leer ⇒ **stiller Abbruch** (kein Feedback).
2. Button disabled, `#apply-<type>-text` hidden, `#apply-<type>-loader` sichtbar.
3. `callOpenRouterAPI(userQuery, systemPrompt)` mit `userQuery = 'Prompt: "<currentPrompt>"\nInfluence Level: <influence>'`.
4. Erfolg: `applyPromptWithUndo(refined, type)` → `QW.onPromptUpdated({source:'expert:<type>'})` → Modal schließen.

**Fehlerpfad:** Buttontext wird auf **„Fehler"** gesetzt, nach **2000 ms** zurück auf **„Anwenden"**; zusätzlich `showToast(getUserFriendlyErrorMessage(error), 'error')`.

**Prompt-Vertrag** (Beispiel `prompts.js:92-100`): Einfluss-Stufen 0–30 / 40–70 / 80–100 mit unterschiedlichen Terminologie-Tiefen; Ausgabe **nur** der neue Prompt, **strikt unter 800 Zeichen**, englisch.

---

## 3. Sound-Ingenieur — `features.js:160-201`

**Zweck:** bis zu drei freie Anweisungen in den Prompt einweben (nicht anhängen).
**Eingaben:** drei `<textarea class="sound-engineer-input" rows="2">` (`modals.js:219-221`), Placeholder „Anweisung 1…", „Anweisung 2 (optional)…", „Anweisung 3 (optional)…". Alle werden getrimmt und leere gefiltert.
**Ablauf:** Abbruch **still**, wenn `instructions.length === 0` **oder** Prompt leer. Sonst Loader an, userQuery = `Base prompt: "<p>"\n\nIncorporate the following specific instructions:\n1. …\n2. …`, Call mit `SOUND_ENGINEER_PROMPT` (`prompts.js:87`), dann `applyPromptWithUndo(refined,'Sound Engineer')`, `QW.onPromptUpdated({source:'sound-engineer'})`, schließen.
**Fehlerpfad:** nur `console.error` — **kein sichtbares Feedback für den Nutzer** (Bug-Kandidat, im Port als Fehlerbanner umsetzen).
**Zustand:** Textareas werden nie geleert ⇒ Anweisungen bleiben beim erneuten Öffnen stehen.

---

## 4. Klug-Tools (12 einheitliche Auswahl-Listen) — `features.js:203-306`

**Zweck:** KI schlägt kategorisierte Ideen mit zwei Bewertungsbalken vor; Nutzer wählt mehrere aus, diese werden in den Prompt integriert.

**12 Tools** (`features.js:219-232`):
`genre-mixer` (🧬), `hook-generator` (🪝), `song-structure` (🏗️), `mood-analyzer` (🧭), `vibe-enhancer` (✨), `artist-suggester` (🧑‍🎤), `tempo-finder` (⏱️), `production-finish` (💎), `vocal-stylist` (🗣️), `groove-meister` (🥁), `performance-coach` (🏋️), `effect-chain` (🔗). Jeweils eigener Systemprompt aus `prompts.js`.

**DOM-Konvention:** `#<id>-modal`, `#<id>-button`, `#<id>-list-container`, `#<id>-apply-button`, `#<id>-apply-text`, `#<id>-apply-loader`, `#<id>-selection-count`.

**Ablauf beim Öffnen** (`features.js:262-280`) — der API-Call startet **automatisch beim Öffnen**, ohne separaten „Generieren"-Button:
1. `selectedItems = []`, Zähler aktualisieren.
2. `renderKlugSkeleton(listContainer)` — **5** Skeleton-Zeilen, `animation-delay: i*120ms`, zufällige Titelbreite `130 + rand(0..79)` px (`features.js:310-324`).
3. `callOpenRouterAPI(#result-text.textContent, systemPrompt)`.
4. `parseKlugResponse(response)` (`features.js:327-362`): a) Markdown-Fence extrahieren; b) Fallback erste `{` bis letzte `}`; c) `JSON.parse`, akzeptiert nur wenn `parsed.categories` ein Array ist; d) **Fallback bei Parse-Fehler**: Antwort an Kommas splitten, max **8** Items, Kategorie „Vorschläge", Titel auf **40 Zeichen** gekürzt, `relevance = 40 + rand(0..49)`, `creativity = 30 + rand(0..59)` (also erfundene Werte!).
5. `revealKlugRows()` (`features.js:365-451`): Typewriter-Reveal, `REVEAL_DELAY = 80 ms` pro Zeile (Kategorie-Header zählt mit). Kategoriefarbe aus `KLUG_CATEGORY_COLORS` (8 Hex-Werte, `features.js:206-215`: `#3b82f6, #8b5cf6, #ec4899, #f97316, #22c55e, #06b6d4, #eab308, #ef4444`), zyklisch per `catIdx % 8`. Pro Idee: Checkbox, Titel, zwei Balken (Relevanz/Kreativität, jeweils auf `0..100` geklemmt, Default 50 wenn fehlend), farbiger Randstreifen. Balken animieren von 0 % auf Zielbreite nach `delayIndex*80 + 250 ms`. Klick auf die **gesamte Zeile** togglet die Checkbox.

**Auswahlzähler:** `#<id>-selection-count` zeigt `"<n> ausgewählt"`, Klasse `has-selection` bei n > 0.

**Anwenden** (`features.js:283-305`): Bei `selectedItems.length === 0` wird das Modal **kommentarlos geschlossen** (kein API-Call). Sonst Loader an, Query = `Original prompt: "<result-text>". Integrate these elements: "<titel1, titel2, …>".` an `PROMPT_REFINER_PROMPT` (`prompts.js:199`), dann `applyPromptWithUndo(refined, 'Klug: ' + toolId)`, `QW.onPromptUpdated({source:'klug:<toolId>'})`, schließen.

**Fehlerpfade:** Ladefehler → roter Text im Listencontainer. Fehler beim Anwenden → nur `console.error`, Modal bleibt offen, keine Nutzermeldung.

**JSON-Schema-Vertrag** (`prompts.js:190-197`): `{"categories":[{"name":string,"ideas":[{"title":string(max 5 Wörter),"relevance":0-100,"creativity":0-100}]}]}`, 2–3 Kategorien à 2–3 Ideen (5–8 gesamt), englisch, kein Markdown.

**Zustand:** `selectedItems` nur im Closure; **nichts persistiert**, Ergebnisse werden bei jedem Öffnen neu geholt (kein Caching).

---

## 5. Synth-Designer Lab — `features.js:455-602`

**Zweck (🎛️):** geführte Sound-Design-Auswahl in 5 Schritten → ein englisches Satzfragment wird **an den bestehenden Prompt angehängt** (nicht ersetzt).

**Eingaben** (`modals.js:660-800`), Formular `#synth-designer-form`:
| Schritt | Feldname | Typ | Pflicht | Werte (die exakt an die KI gehen) |
|---|---|---|---|---|
| 1. Rolle | `synth-role` | Radio | **ja** | `Lead melody`, `Bass foundation`, `Atmospheric pad`, `Arpeggiated pattern` |
| 2. Waveform | `synth-core` | Radio | **ja** | `soft, warm waveform`, `hollow, woody timbre`, `bright, harmonically rich waveform`, `noisy, digital texture` |
| 3. Timbre | `synth-filter-slider` | Range 0–100, Default **50** | nein | siehe Mapping unten |
| 4. Envelope | `synth-envelope` | Radio | **ja** | `short, plucky articulation`, `slow, swelling rise`, `long, sustained hold` |
| 5. Effekte | `synth-effects` | Checkboxen (mehrfach) | nein | `lush reverb for spaciousness`, `tempo-synced echo`, `stereo chorus for width`, `gentle saturation and distortion` |

**Filter-Mapping `getSynthBrightnessInfo(value)`** (`features.js:455-473`) — Label (UI, deutsch) / Phrase (an KI, englisch):
- `≤20` „Sehr gedämpft" / `muted, subtle brightness`
- `≤40` „Warm & weich" / `warm, rounded brightness`
- `≤60` „Ausgewogen & klar" / `balanced, clear brightness`
- `≤80` „Leuchtend" / `bright, lively brightness`
- `>80` „Aggressiv & scharf" / `razor-bright, aggressive brightness`
- `NaN` → wie „Ausgewogen & klar". Slider setzt zusätzlich CSS-Var `--range-progress` für den Trackfill.

**Ablauf:** Reset bei Klick auf Trigger **und** bei Event `modal:open` mit `detail.id === 'synth-designer-modal'` (`form.reset()`, Slider auf 50, Fehlertext leeren). Beim Anwenden (`#add-synth-button`):
1. Leerer Prompt ⇒ Inline-Fehler `#synth-designer-error`: **„Bitte generiere zuerst einen Prompt oder füge Text in das Meisterstück ein."**
2. Fehlende Pflichtauswahl ⇒ **„Bitte triff in den Schritten 1, 2 und 4 jeweils eine Auswahl."**
3. Query (mehrzeilig): `Base Prompt: "…"` + `Sound Design Choices:` mit `- Instrument Role:`, `- Core Character:`, `- Filter Brightness: <phrase> (value <n>/100)`, `- Envelope Shape:`, `- Effects: <join ', '>` bzw. `None`.
4. `callOpenRouterAPI(..., SYNTH_DESIGN_TRANSLATOR_PROMPT)` (`prompts.js:89`: **max 35 Wörter**, ein Satzfragment, das nach einem Komma angehängt werden kann).
5. `appendPromptSentence(basis, zusatz)` (`features.js:475-487`): Trennzeichen-Logik — endet die Basis auf `.!?…` oder `)` ⇒ **Leerzeichen**; endet sie auf `,` ⇒ **Leerzeichen**; sonst ⇒ **`, `**. Leerer Zusatz ⇒ Basis unverändert.
6. `applyPromptWithUndo(updatedPrompt, 'Synth Designer')`, `QW.onPromptUpdated({source:'klug:synth-designer'})`, schließen.

**Fehler:** Meldung in `#synth-designer-error` (rot, `text-xs`). Doppel-Init-Schutz über `modal.dataset.synthDesignerInitialized`.

---

## 6. Visual Inspiration Engine — `features.js:604-852`

**Zweck:** Bild aus Textbeschreibung generieren (Fal.ai), dann das Bild per Vision-Modell in einen Musik-Prompt zurückübersetzen.

**Gating:** Vor dem Öffnen prüft ein **capture-phase**-Listener `FAL_API_KEY`; fehlt er → `preventDefault/stopPropagation`, Toast „Bitte hinterlege zuerst einen gültigen Fal.ai API Key unter Einstellungen." (warning) + `showSettings()` (`features.js:630-637`).

**Eingaben:** `#image-prompt-input` (`<textarea rows="3">`, `modals.js:816`), Pflicht. `Cmd/Ctrl+Enter` löst Generieren aus.

**Ablauf Bildgenerierung** (`features.js:733-800`):
1. Leerer Text ⇒ `<p class="text-amber-300">Bitte gib eine Beschreibung ein.</p>`.
2. Vorherigen Request abbrechen (`cancelGeneration()`), neuer `AbortController`, `genReqId++` als Stale-Guard.
3. Fortschrittsanzeige einblenden (`#ve-progress-area.active`, Output ausgeblendet), Status: „Bild wird generiert... Dies kann bis zu 2 Minuten dauern."
4. `startElapsedTimer()` (`features.js:660-687`): Tick **jede Sekunde**; Anzeige `#ve-progress-elapsed` als `"<s>s vergangen"` bzw. `"m:ss vergangen"`; Balken `#ve-progress-bar` = `min(elapsed/120*95, 95)` %; ab **30 s** Warnstatus **„Dauert länger als erwartet – bitte Geduld..."** (+ Klasse `ve-status-warning`).
5. `callFalAPI(prompt, {retries: 2, signal})` (Timeout 120 s, Retry bei 408/429/5xx).
6. Status „Bild wird geladen...", Balken auf **98 %**; Bild wird per `new Image()` vorgeladen, URL mit Cache-Buster `?t=<Date.now()>`.
7. Erfolg: Fortschritt aus, `<img>` in `#visual-engine-output`, „Analysieren"-Button (`#analyze-image-button`) einblenden.
8. Abbruch durch Nutzer (`#ve-cancel-btn`): Erkennung über `error.message.includes('user-cancel')` bzw. `signal.reason` → Meldung **„Bildgenerierung wurde abgebrochen."** (neutral, nicht rot).

**Ablauf Analyse** (`features.js:806-851`):
1. Ohne `generatedImageUrl` ⇒ Abbruch. Ohne `API_KEY` ⇒ Toast + `showSettings()`.
2. `withTimeout(callOpenRouterAPI(userMessage, VISUAL_ANALYZER_PROMPT, generatedImageUrl), 60000, 'Analyse')` — **zusätzlicher** 60-s-Race-Timeout über dem internen (`features.js:727-730`). userMessage = `Image prompt used to generate the picture:\n<prompt>`.
3. Stale-Guard `anaReqId`.
4. Erfolg: `applyPromptWithUndo(generatedText, 'Visual Engine')`, `#initial-state` ausblenden, `#result-container` einblenden + `fade-in`, `setKlugToolsState(true)` (**schaltet alle Tools frei**), `QW.onPromptUpdated({source:'klug:visual-engine'})`, Modal schließen.
5. Fehler: rote Meldung wird **vor** den bestehenden Output geprependet (Bild bleibt sichtbar).

**Reset:** bei jedem `modal:open` (`resetUI()`), Abbruch laufender Requests bei `modal:close`. Doppel-Init-Schutz `modal.dataset.initialized`.

---

## 7. Future Lab (7 Tools) — `features.js:854-1771`

Gemeinsames Muster: Modal öffnet ohne API-Call, Auswahl per Kachel-Buttons (Toggle-Klassen `border-blue-500/60 bg-blue-600/20`), dann ein Call, Antwort wird an **`---`** in zwei Blöcke gesplittet, Präfixe (`PROMPT:` etc.) per Regex entfernt, Notizen zeilenweise mit `^[-•]` gestrippt und gefiltert. Ladeanzeige im Output: `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto">`. Leerer Prompt ⇒ rote Meldung „Bitte generiere zuerst einen Prompt." Ergebnisse werden **nicht automatisch übernommen** — es gibt jeweils einen expliziten „übernehmen"-Button im Ergebnis.

### 7.1 Adaptive Flow (🌊) — `features.js:865-946`
- Eingabe: `#adaptive-flow-slider` 0–100, **beim Öffnen hart auf 65 zurückgesetzt** (`features.js:876-880`), Anzeige `#adaptive-flow-level`. Default im HTML ebenfalls 65 (`modals.js:486`).
- Query: `Base prompt: "…"\nDynamic intensity (0-100): <v>` an `ADAPTIVE_FLOW_PROMPT`.
- Ausgabe: Zweispalten-Vergleich **„Aktueller Prompt"** vs. **„Neuer Flow"** + Liste **„Flow-Notizen"** (Split-Marker `FLOW NOTES:`). Button „Flow übernehmen" → `applyPromptWithUndo(cleanPrompt, 'Adaptive Flow')`, Quelle `future-lab:adaptive-flow`.
- Tip: `Tips.show('chord.future', openButton)`.

### 7.2 AI Collaboration (🤖) — `features.js:948-1053`
- **5 Personas** (id/Label/Detail): `visionary`/„Visionärer Komponist"/„erzählerische Themen & modulare Harmonien"; `beat-architect`/„Beat-Architekt"/„rhythmische Layer & Sidechain-Drive"; `texturalist`/„Textur-Alchemist"/„granulare Atmosphären & Motion FX"; `vocal-director`/„Vocal Director"/„Toplines, Harmonien & Call/Response"; `mix-navigator`/„Mix Navigator"/„Automation, Panorama & Stem-Balance".
- Auswahl beim Öffnen **geleert** (`new Set()`); Hinweistext „Wähle 2-3 Personas aus…", technisch aber **mindestens 1** erforderlich, sonst „Wähle mindestens eine Persona aus." (amber). Kein Maximum erzwungen.
- Query: `Base prompt: "…"\nPersonas: <Label (Detail); …>` an `AI_COLLAB_PROMPT`. Notizen-Marker `INTERPLAY NOTES:`.
- Ausgabe: „Kooperativer Prompt" + „Interplay-Ideen"; Button „Prompt übernehmen", Quelle `future-lab:ai-collab`.

### 7.3 Story Arc Designer (📖) — `features.js:1055-1119`
- **Keine Eingaben.** Der Call startet **automatisch beim Öffnen** und kann über `#story-arc-generate-button` wiederholt werden.
- Query = der aktuelle Prompt pur, System `STORY_ARC_DESIGNER_PROMPT`; Notizen-Marker `ARC OUTLINE:`.
- Ausgabe: „Dramaturgischer Prompt" + „Arc-Gliederung"; Button „Prompt übernehmen", Quelle `future-lab:story-arc`.

### 7.4 Narrative Chapters (📚) — `features.js:1121-1419` (aufwändigstes Tool)
- Eingabe: `#narrative-chapter-count` Select mit **3 / 4 / 5 Kapitel**, Default **4** (`modals.js:546-550`).
- **Ergebnis-Caching:** `lastNarrativeResult` und `lastRequestedCount` im Closure. Beim erneuten Öffnen wird ein vorhandenes Ergebnis **sofort neu gerendert** statt der Leeransicht (`features.js:1351-1362`); sonst Leertext „Wähle 3-5 Kapitel und generiere eine zusammenhängende Prompt-Reise."
- Query: `Base prompt: "…"\nRequested chapter count: <n>\nContinuity mode: Balanced evolution` an `NARRATIVE_CHAPTERS_PROMPT`.
- **Robuste JSON-Pipeline** (portierungsrelevant, `features.js:1150-1265`):
  - `unwrapJsonCandidate`: Fence-Extraktion, auch unvollständige Fences abstreifen, Präfix `json ` vor `{`/`[` entfernen.
  - `normalizeJsonText`: typografische Anführungszeichen → ASCII, NBSP → Space, **trailing commas** entfernen, BOM entfernen.
  - `extractBalancedRoot`: zeichenweiser Klammer-Scan mit String-/Escape-Zustand; Fallback erste Öffnung bis letzte Schließung.
  - `parseJsonLoose`: **4 Versuche** in Reihenfolge candidate → balanced → normalized → normalized(balanced).
  - `extractJsonPayload`: schlägt alles fehl → **zweiter API-Call** mit `JSON_REPAIR_PROMPT` (`Fix this malformed JSON and return ONLY valid JSON:\n\n<raw>`) und erneutes Parsen. Scheitert auch das: Fehler `"<primär> (Auto-Repair fehlgeschlagen: <sekundär>)"`.
- **Validierung `normalizePayload`** (`features.js:1267-1313`): `safeCount = clamp(3..5, parsedCount ?? 4)`; **harte Prüfung** `rawChapters.length !== safeCount` ⇒ Fehler `Erwartet <n> Kapitel, erhalten: <m>.`; leerer `prompt` ⇒ `Kapitel <i> enthält keinen Prompt.`
  - `tempo_bpm`: aus `music_matrix.tempo_bpm`, sonst aus dem Prompt via Regex `\b(\d{2,3})\s?BPM\b`, sonst **90**; geklemmt auf **40–240**.
  - Fehlende Matrixfelder → String `'unspecified'`; `transition_from_previous` bei Kapitel 1 → `'N/A'`, sonst Default `'evolution from prior chapter'`.
  - Top-Level-Defaults: `global_style_anchor` → `'No explicit anchor provided.'`, `continuity_strategy` → `'Balanced evolution across chapters.'`
- Ausgabe: Kopfkarte mit **Global Style Anchor** und **Continuity Strategy**, darunter Kapitel-Karten (Titel, Prompt als `<pre>`, Matrix-Grid **Mood / Key / Rhythm / Tempo (BPM) / Energy / Anchor / Transition**), je Karte Button **„Kapitel übernehmen"** → `applyPromptWithUndo(chapter.prompt, 'Narrative Chapters')`, Quelle `future-lab:narrative-chapters:chapter-<index>`.
- Eigene lokale `escapeHtml`-Funktion (auch `'` → `&#39;`), abweichend von der globalen `escapeHTML`.

### 7.5 Immersive Space (🌌) — `features.js:1421-1532`
- **5 Presets:** `cathedral`/„Kathedralen-Halo"/„riesige Hallfahnen & schwebende Chorhöhen"; `neon-club`/„Neon-Club"/„eng umschließende Bässe & wandernde Laser-FX"; `skyline`/„Skyline Rooftop"/„offene Höhenluft & Delay-Echos aus der Ferne"; `ocean-dome`/„Ocean Dome"/„unterseeische Pulsationen & 360°-Waves"; `void-orbit`/„Void Orbit"/„schwerelose Ambisonics & kreisende Synth-Orbits".
- **Default-Auswahl beim Öffnen: `neon-club`** (wird nach dem Rendern nachträglich hervorgehoben).
- Query: `Base prompt: "…"\nSpatial inspirations: <Label: Detail; …>` an `IMMERSIVE_SPACE_PROMPT`; Notizen-Marker `SPACE DESIGN NOTES:`; leere Auswahl ⇒ „Wähle mindestens eine Umgebung aus."
- Ausgabe: „Immersiver Prompt" + „Raum-Notizen", Button „Prompt übernehmen", Quelle `future-lab:immersive-space`.

### 7.6 Human Touch (🫀) — `features.js:1534-1641`
- **5 Optionen:** `micro-swing`/„Micro-Swing"/„leicht hinter der Beat-Mikrotiming"; `analog-dust`/„Analog-Dust"/„Bandrauschen & leichte Saturation"; `human-vocals`/„Human Vox"/„atmen, Ad-Libs & intime Layer"; `instrument-noise`/„Instrument Noise"/„Fingergeräusche & Fret-Slides"; `dynamic-swell`/„Dynamic Swell"/„manuelle Lautstärke-Wellen".
- **Default beim Öffnen: `micro-swing` + `analog-dust`.**
- Query: `Base prompt: "…"\nHumanising cues: <…>` an `HUMAN_TOUCH_PROMPT`; Marker `HUMAN TOUCH NOTES:`; Ausgabe „Humanisierter Prompt" + „Nuancen"; Button-ID `#apply-human-touch-result`, Quelle `future-lab:human-touch`.

### 7.7 Release Forecast (📊) — `features.js:1643-1771`
- **Einziges Future-Lab-Tool, das den Prompt NICHT ändert** — es erzeugt einen Marketingplan.
- Eingaben: `#release-forecast-timeline` Select **4 Wochen Sprint / 6 Wochen Kampagne (Default) / 8 Wochen Deep Dive / 12 Wochen Roll-out** (`modals.js:609-614`); wird beim Öffnen auf **`'6'`** zurückgesetzt.
- **5 Kanal-Hebel:** `tiktok`/„TikTok / Shorts"/„Kurzform-Teaser & Challenges"; `livestream`/„Livestream"/„Premiere & Q&A mit Fans"; `playlist`/„Playlist Pitch"/„Kuratoren & Editorial Pitch"; `press`/„Presse & Blogs"/„Storytelling & Artist Statements"; `live`/„Live Drop"/„Secret Gig oder Listening Session". **Default: `tiktok` + `playlist`.** Leere Auswahl ⇒ „Wähle mindestens einen Kanal aus."
- Query: `Song Prompt: "…"\nLaunch timeline (weeks): <n>\nFocus channels: <…>` an `RELEASE_FORECAST_PROMPT`; Split an `---` in `PLAN:` und `TACTICS:`.
- Ausgabe: zwei Listen „Release-Plan" und „Taktiken" + zwei Buttons: **„Plan kopieren"** (`safeCopyText("Plan:\n…\n\nTaktiken:\n…")`, Label wechselt für **2000 ms** auf „Kopiert!") und **„Fertig"** (schließt).

---

## 8. Custom Instruction — `features.js:1774-1811`

**Zweck:** freie Nutzeranweisung auf den bestehenden Prompt anwenden.
**Eingabe:** `#custom-instruction-input` (`<textarea rows="4">`, Placeholder „z.B. Mache es düsterer und füge einen Kinderchor hinzu…", `modals.js:467`). Pflicht.
**Ablauf:** leere Anweisung **oder** leerer Prompt ⇒ stiller Abbruch. Query `Base prompt: "…"\nInstruction: "…"` an `CUSTOM_INSTRUCTION_PROMPT` (`prompts.js:85`). Erfolg → `applyPromptWithUndo(refined,'Custom Instruction')`, Quelle `custom-instruction`, schließen.
**Fehlerpfad (auffällig):** `input.value = "Ein Fehler ist aufgetreten."` — die **Nutzereingabe wird überschrieben**. Beim Port unbedingt durch eine separate Fehlermeldung ersetzen.
**Hinweis:** Dieses Setup läuft auch ohne Bottom-Dashboard (`features.js:22`).

---

## 9. Genre Evolution Timeline (GET) — `features.js:1813-1920`

**Zweck:** Prompt in die Ästhetik eines Jahrzehnts überführen.
**Elemente:** Modal `#get-modal`, Trigger `#get-button`, Slider `#get-slider` (**min 1950, max 2020, step 10**, Default 2020, `modals.js:877`), Select `#get-genre-select` (11 Optionen: General, Electronic, Rock, Hip Hop, Jazz, Pop, R&B/Soul, Classical/Orchestral, Metal, Country/Folk, Reggae/Dub — `modals.js:856-866`), Anzeigen `#get-decade-display` (`"<Jahr>s"`) und `#get-decade-description`.

**Auto-Detect `detectGenre(prompt)`** (`features.js:1813-1825`): Kleinschreibung, erste Übereinstimmung in `GENRE_KEYWORDS` (`prompts.js:594-605`) gewinnt — **Reihenfolge der Objekt-Keys ist entscheidend** (Electronic → Rock → Hip Hop → Jazz → R&B/Soul → Classical/Orchestral → Pop → Metal → Country/Folk → Reggae/Dub). Fallback `"General"`. Achtung: mehrdeutige Keywords (`bass`, `guitar`, `piano`, `groove`, `smooth`) tauchen in mehreren Genres auf.

**Beim Öffnen:** Genre aus dem aktuellen Prompt erkennen und im Select setzen, Slider auf **2020**, Beschreibung aktualisieren.

**Beschreibungsdaten:** `GENRE_EVOLUTION_DATA` (`prompts.js:608 ff.`) — pro Genre acht Dekaden-Schlüssel `1950…2020` mit englischen Charakteristik-Strings; Fallback-Kette: Genre-Dekade → `General`-Dekade → `"Beschreibung nicht verfügbar."`

**Ablauf beim Anwenden:** Leerer Prompt ⇒ stiller Abbruch. `#get-loading-overlay` einblenden; `#get-loading-text` rotiert **alle 800 ms** durch die Phasen `"Analysiere Vibe..."`, `"Lade Zeitmaschine..."`, `"Destilliere Ästhetik..."`, `"Veredle Prompt..."`. Query: `Base prompt: "…"\nTarget Decade: <n>s\nGenre Context: <genre>\nEra Characteristics: <angezeigte Beschreibung>` an `GENRE_EVOLUTION_PROMPT`. Erfolg → `applyPromptWithUndo(refined, 'Genre Evolution')`, Quelle `get:timeline`, schließen. Fehler → Ladetext auf **„Fehler!"**, Farbwechsel `text-blue-300` → `text-red-400`; im `finally` wird das Overlay allerdings **sofort ausgeblendet und der Text zurückgesetzt** ⇒ die Fehlermeldung ist praktisch **nicht sichtbar** (Bug-Kandidat).

---

## 10. Ausgeschlossene Bereiche — nur Berührungspunkte

### 10.1 Style Sync Studio V2 — `features.js:1922-2213` (NICHT portieren)
Berührungspunkte zum Kern: liest `#result-text` beim Öffnen in `#studio-master-prompt-display` (Fallback-Text `// Warten auf Input...`); Encoder-Kette `callOpenRouterAPI(prompt, STYLE_SYNC_ENCODER_PROMPT)` → `callFalAPI(visualPrompt)` (`features.js:1998`); Decoder `callOpenRouterAPI("Analysiere dieses Bild.", STYLE_SYNC_DECODER_PROMPT, base64Image)`; nutzt `CloseStack`, `ScopeStack('style-sync')`, `BodyScrollLock`, `Tips.show('chord.future', …)`. Öffnet **ohne** Prompt-Gate (Sonderfall in `setupModal`, `api.js:441`). Shortcut `Mod+Y`.

### 10.2 Klang Studio — `features.js:2215-3331` (NICHT portieren)
Berührungspunkte: `applyPromptWithUndo(updatedPrompt, 'Klang Studio')` (`features.js:3175`) + `QW.onPromptUpdated({source:'klang-studio'})`; Orchestra-Zweig `applyPromptWithUndo(finalPrompt, 'Klang Studio Orchestra')` (`:3284`) bzw. Fallback-Token (`:3310`), jeweils gefolgt von `setKlugToolsState(true)` (`:3297`, `:3323`) und Quelle `klang-studio-orchestra`; nutzt `ORCHESTRA_REFINER_PROMPT`. Eigene Modal-Steuerung mit `FocusTrap`, `ScopeStack('klang-studio')`, Doppel-Init-Guard `dataset.ksInitialized`. Shortcut `Mod+L`.

### 10.3 Kreativbibliothek / `creative_cosmos.js` (NICHT portieren)
In `features.js` **kein** direkter Bezug. Berührung nur über den geteilten `ScopeStack`-Scope `creative-cosmos` in der Shortcut-Übersicht (`quickwins.js`, Gruppenname „Creative Cosmos").

---

## 11. `js/quickwins.js` — Verlauf, Zähler, Presets, Shortcuts, Import/Export

Selbstausführende IIFE, `init()` bei `DOMContentLoaded`. Öffentliche API: `window.QW = { onPromptUpdated, addHistoryItem }`.

### 11.1 Prompt-Verlauf (History)
- **Storage-Key `ssa_history_v1`**, **MAX_HISTORY = 20** (`quickwins.js:5-7`), beim Speichern hart auf `slice(0,20)` gekürzt.
- Item-Schema (`:76`): `{ id: "<timestamp>_<6 Zeichen base36>", content, idea, favorite: false, createdAt: <ms>, meta: {} }`.
- `addHistoryItem` (`:73-84`): leerer `content` ⇒ nichts; **Deduplizierung nur gegen den unmittelbar vorherigen Eintrag** (`list[0].content === content` ⇒ kein neuer Eintrag). Neue Einträge per `unshift` vorn.
- Aufrufer: `onPromptUpdated(meta)` (`:391`) → `updateCharStats()` + `runLint()` + `addHistoryItem({content: #result-text, idea: #idea-input, meta})`. Wird von **jedem** Tool nach dem Anwenden gerufen.
- UI `renderHistory()` (`:229-283`): Container `#history-list`, Leerzustand `#history-empty-state`. Pro Eintrag: Inhalt, `new Date(createdAt).toLocaleString()`, optional `· <idea>`, Favoriten-Stern `★` (gelb `text-yellow-400` / grau `text-neutral-400`) und drei Aktionen:
  - **Wiederherstellen**: `applyPromptWithUndo(item.content, 'Verlauf wiederherstellen')`, `setCurrentIdea(item.idea)` (mit `input`-Event!), `#initial-state` verstecken, `#result-container` + `#refinement-controls` einblenden, `setKlugToolsState(true)`, Panel schließen, `onPromptUpdated({source:'restore'})` — **erzeugt dadurch einen neuen History-Eintrag**.
  - **Duplizieren**: neuer Eintrag mit `meta.source = 'duplicate'`, Favoritenstatus wird übernommen.
  - **Löschen**: sofort, **ohne Rückfrage und ohne Undo**.
- Panel: `#history-panel` (Klasse `open`), Overlay `#history-overlay`, Toggle `#history-toggle-button`, Close `#history-close`, Overlay-Klick schließt; `CloseStack` id `history-panel`.
- **Verlauf leeren** `#history-clear` (`:373-383`): leer ⇒ Toast „Verlauf ist bereits leer." (info). Sonst leeren + Toast „Verlauf geleert." (warning, **8000 ms**) mit Aktion **„Rückgängig"** → Backup zurückschreiben + Toast „Verlauf wiederhergestellt."

### 11.2 Import/Export
- **Prompt exportieren** `#export-prompt-button` (`:88-95`): kein Prompt ⇒ Toast „Kein Prompt vorhanden." (warning). Sonst Download **`prompt.json`** mit `{content, idea, exportedAt}` (2-Space-Pretty-Print).
- **Prompt importieren** `#import-prompt-button` → `#import-prompt-file`: `FileReader.readAsText`, erwartet `data.content`; setzt Prompt via `setCurrentPrompt(data.content, 'Import JSON')` und optional `idea`, dann `onPromptUpdated({source:'import'})`. Ungültig ⇒ Toast „Ungültige Datei." (error).
- **Verlauf exportieren** `#history-export-all`: Download **`history.json`** mit `{items, exportedAt}`.
- **Verlauf importieren** `#history-import` → `#history-import-file`: erwartet `data.items` als Array; **Merge** mit vorhandenem Verlauf, absteigend nach `createdAt` sortiert, dann auf 20 gekürzt. **Keine Duplikatprüfung, keine ID-Kollisionsprüfung.**

### 11.3 Zeichenzähler & Compliance
`updateCharStats()` (`:163-173`): Ziel `#char-stats`, Anzeige `<n> / 1000`. **Ampel nach Prompt-Länge:** `≤800` grün `#86efac`, `≤1000` gelb `#fde047`, `>1000` rot `#fca5a5`. Der Zähler ist rein informativ — es gibt **keine harte Sperre**. (Die Systemprompts fordern durchgängig „unter 800 Zeichen".)

### 11.4 Auto-Trim auf 200 Zeichen
`autoTrimV3()` (`:178-204`), Button `#auto-trim-v3-button`, Shortcut `b`:
1. Leerer Prompt ⇒ nichts. `length ≤ 200` ⇒ Toast „Prompt ist bereits ≤ 200 Zeichen." (info), keine Änderung.
2. Heuristik: Regex `/(very|really|extremely|highly|super|quite|some|kind of|sort of)/gi` entfernen, Mehrfach-Leerzeichen zu einem, `, ,+` zu `,`, trimmen.
3. Wenn immer noch `> 200`: harter `slice(0,200)`, dann `replace(/\s+\S*$/,'')` (letztes angeschnittenes Wort entfernen) + trim.
4. `setCurrentPrompt(t,'Auto-Trim')`, `updateCharStats()`, `runLint()`.
5. Toast `Auto-Trim: <n> Zeichen entfernt (<alt> → <neu>)` (info, **10 000 ms**) mit **„Rückgängig"** → stellt `autoTrimOriginal` wieder her (Toolname „Auto-Trim Rückgängig") + Toast „Auto-Trim rückgängig gemacht.". `autoTrimOriginal` ist eine einzelne Variable ⇒ **nur eine Ebene Undo**.

### 11.5 Presets
`PRESETS` (`:52-58`), gerendert in `#preset-chips` (Klasse `chip`, `title` = Volltext), Limit **10** Chips (aktuell 5). Klick schreibt den Text in `#idea-input` (mit `input`-Event). Exakte Texte:
- `cinematic` „Cinematic": *Cinematic score about an ocean journey; strings, brass, deep percussion; evolving arcs; emotional climax.*
- `electronic` „Electronic": *Atmospheric electronic track with warm analog synths, rolling bassline, crisp drums; nocturnal city vibe.*
- `indie` „Indie": *Indie pop/rock with jangly guitars, melodic bass, tight drums; bittersweet summer nostalgia.*
- `hiphop` „Hip-Hop": *Moody hip-hop beat; dusty samples, punchy drums, layered 808s; reflective late-night mood.*
- `ambient` „Ambient": *Deep ambient soundscape; shimmering pads, granular textures, distant chimes; slow evolving movement.*

### 11.6 Lint-Hints — deaktiviert
`CURATED_HINTS` H01–H30 sind **auskommentiert** (`quickwins.js:12-47`), `runLint()` ruft nur noch `updateCharStats()`. Für den Port: **nicht implementieren**, aber die 30 Hinweistexte existieren als Datenbestand für später.

### 11.7 Beobachtung des Ergebnisfelds
`observeResult()` (`:394-398`): `MutationObserver` auf `#result-text` (`childList`, `characterData`, `subtree`) → aktualisiert Zeichenzähler bei jeder Textänderung. In SwiftUI entspricht das schlicht einem beobachteten `@Published`-String.

### 11.8 Tastenkürzel (`registerKeybindings`, `:288-360`)
| ID | Label | Scope | Bindings | Bedingung |
|---|---|---|---|---|
| `focus.idea` | Fokus: Vision | global | `Slash`, `Mod+f` | – |
| `generate` | Generieren | global | `g`, `Mod+Enter` | `#generate-button` nicht disabled |
| `refine.pro` | Für Pro | global | `p` | Prompt vorhanden |
| `copy.result` | Ergebnis kopieren | global | `c` | Prompt vorhanden |
| `history.toggle` | Verlauf | global | `h` | – |
| `auto.trim` | Auto-Kürzen 200 | global | `b` | Prompt vorhanden |
| `help.shortcuts` | Tastenkürzel | any | `Shift+Slash`, `F1` | – |
| `palette.open` | Befehlspalette | any | `Mod+K` | – |
| `dashboard.toggle` | Dashboard ein/aus | global | `Mod+d` | – |
| `settings.open` | Einstellungen | global | `Mod+Comma` | – |
| `export.prompt` | Prompt exportieren | global | `Mod+Shift+e` | Prompt vorhanden |
| `save.export` | Schnell-Export | global | `Mod+s` | Prompt vorhanden |
| `open.idea-spark` | Idea Spark | global | `Mod+i` | – |
| `open.style-sync` | Style Sync | global | `Mod+y` | – |
| `open.klang-studio` | Klang Studio | global | `Mod+l` | – |
| `page.prev` | Vorherige Seite | dashboard | `BracketLeft`, `Mod+ArrowLeft` | Fokus im Dashboard |
| `page.next` | Nächste Seite | dashboard | `BracketRight`, `Mod+ArrowRight` | Fokus im Dashboard |

QWERTZ-Sonderfall (`formatBinding`, `:265-281`): bei deutschem Layout wird `Slash` als **⌘F** und `Shift+Slash` als **F1** angezeigt. Cheat-Sheet `openShortcutModal()` gruppiert nach Scope („Global", „Creative Cosmos", „Befehlspalette", „Dashboard", „Chord-Modus", „Sonstige") und dimmt inaktive Scopes mit `opacity-40`.
`addButtonHints()` hängt ` (g)` an `#button-text` im Generate-Button und setzt den Titel „Befehlspalette (⌘K)".

### 11.9 Legacy-Cleanup
`cleanupOldTemplateData()` (`:207-216`) löscht beim Start `suno_templates_v1` und `ssa_user_templates_v1`. Beim Port ersatzlos streichen.

---

## 12. `js/tips.js` — Progressive Disclosure

`features.js` referenziert `window.Tips` an drei Stellen: `Tips.show('chord.expert', openButton)` bei jedem Experten-Modal (`:118`), `Tips.show('chord.future', openButton)` bei Adaptive Flow (`:866`) und im Style Sync Studio (`:1959`). `quickwins.js` ruft `Tips.markLearned('generate')`.

- **Storage-Key `ssa_tips_v1`**: Map `shortcutId → number | 'learned'`.
- `isLearned`: `=== 'learned'` **oder** Zähler `>= 3`.
- `show(shortcutId, anchorEl)`: bricht ab wenn gelernt, wenn `window.Keys` fehlt oder wenn zur ID keine Action/Bindung existiert. Erzeugt eine Blase `💡 Tipp: <kbd>⌘X</kbd> für <Label>`; Position: `top = max(8, anchorRect.top - 40)px`, `left = anchorRect.left + width/2`; ohne Anker `top:20px; left:50%`. Zähler +1, ab **3** auf `'learned'`. **Auto-Dismiss nach 3000 ms**; zusätzlich Dismiss bei erstem `keydown` (once) oder Klick auf die Blase.
- **Onboarding-Banner** (`:78-93`): einmalig, wenn `ssa_onboarding_seen` fehlt. Text: *„Power User? Drücke `Shift+?` für alle Tastenkürzel."* Element `#onboarding-banner`; Dismiss per Klick oder automatisch nach **10 000 ms** (Opacity-Fade, Entfernen nach 500 ms), setzt den Key auf `'1'`.
- **Achtung:** Die IDs `chord.expert` und `chord.future` werden in `quickwins.js` **nicht** registriert (sie stammen aus `chords.js`) — existieren sie dort nicht, ist `show()` ein No-op.

---

## 13. Portierungs-Fallstricke (Detailliste)

1. **Doppel-Initialisierung**: drei Init-Events, nur 4 Setups haben Guards → in SwiftUI eine einmalige Feature-Registrierung.
2. **Zwei Parsing-Protokolle**: `---`-Split mit Präfix-Regex (Idea Spark, alle Future-Lab-Tools) vs. JSON (Klug-Tools, Narrative Chapters). Beide Fallback-Ketten sind Verhalten, nicht Zufall.
3. **Kein Retry, 60 s Timeout, `max_tokens: 1000`** bei jedem Text-Call — Antworten können abgeschnitten werden (deshalb der JSON-Reparatur-Call bei Narrative Chapters).
4. **Stille Abbrüche** ohne Nutzerfeedback: Experten, Sound-Ingenieur, Custom Instruction, Genre Evolution bei leerem Prompt; Klug-Tool „Anwenden" ohne Auswahl schließt kommentarlos.
5. **Inkonsistente Fehlerdarstellung**: Toast (Experten) vs. Inline rot (Idea Spark, Future Lab, Synth) vs. nur Konsole (Sound-Ingenieur, Klug-Apply) vs. Überschreiben der Eingabe (Custom Instruction) vs. unsichtbar (Genre Evolution).
6. **Kein Zustands-Reset** bei Idea Spark, Sound-Ingenieur und Experten-Slidern — Werte überleben das Schließen; bei Adaptive Flow, Immersive Space, Human Touch, Release Forecast, Synth Designer und GET dagegen **harter Reset** beim Öffnen. Narrative Chapters cached sein letztes Ergebnis.
7. **`#idea-input` ohne `input`-Event** bei Idea-Spark-Übernahme (`features.js:70`) vs. mit Event in `quickwins.setCurrentIdea` — im Port immer über das Model laufen lassen.
8. **Prompt-Gate**: `isPromptGenerated` sperrt alle Modals außer `idea-modal` und `style-sync-modal`; visuelles Feedback = Toast + Shake 500 ms.
9. **History-Rückkopplung**: „Wiederherstellen" ruft `onPromptUpdated` und erzeugt dadurch sofort einen neuen Eintrag; Dedupe greift nur gegen den direkten Vorgänger.
10. **Zeichenlimits**: UI-Ampel bei 800/1000, Systemprompts fordern <800, Auto-Trim zielt auf 200, Synth-Übersetzung max 35 Wörter, Klug-Titel max 5 Wörter (Fallback kürzt auf 40 Zeichen), Narrative BPM 40–240.
11. **Zufallswerte im Klug-Fallback** (`relevance`/`creativity`) sind nicht reproduzierbar — bewusste Entscheidung nötig, ob im Port beibehalten.
12. **Timer-Verhalten** exakt übernehmen: 80 ms Reveal, 120 ms Skeleton, 250 ms Balken-Delay, 200 ms Modal-Close, 800 ms GET-Phasen, 1 s Fal-Tick, 30 s Warnschwelle, 120 s Balkenbasis, 2 s „Kopiert!"/„Fehler", 3 s Tip, 6 s/8 s/10 s Toasts.
13. **Vier Legacy-Aliase für den API-Key** im localStorage — im Port auf **einen** Keychain-Eintrag konsolidieren.

---

# Teil 3 — Modals und System-Prompts

Dateien: `js/modals.js` (919 Z.), `js/prompts.js` (818 Z.). Ergänzende Referenzen: `js/api.js` (setupModal), `js/features.js` (Logik/Platzhalter), `js/kachel_system.js`, `js/app.js`, `js/bottom_tools.js`.

## TEIL A — Modals

### A.0 Generisches Modal-Verhalten (`js/api.js:437-500`, `js/modals.js:1-11`)

`modals.js` enthält **ausschließlich** das HTML-Template (`getModalsHTML()`), das beim `DOMContentLoaded` in `#modals-container` injiziert wird; danach wird das Event `modals:ready` gefeuert (`js/modals.js:2-9`). Sämtliche Logik liegt in `features.js`/`app.js`.

Alle Modals folgen demselben Muster über `setupModal(modal, openButton)` (`js/api.js:437`):
- **Öffnen-Gate:** wenn `isPromptGenerated === false` und `modal.id` weder `idea-modal` noch `style-sync-modal` ist → Toast „Bitte generiere zuerst einen Prompt, um dieses Tool zu nutzen." + Shake-Animation (`bd-shake`, 500 ms) am Trigger-Button; Modal öffnet nicht (`api.js:440-457`).
- **Öffnen:** `hidden` entfernen → `BodyScrollLock.lock()` → Klassenwechsel `modal-leave-to` → `modal-enter-to`; Push auf `ScopeStack.openWithScope(close,'modal','modal-'+id)` (Fallback `CloseStack.push`); `FocusTrap.activate(modal)` (Tab-Falle + Autofokus erstes Element); Event `modal:open` mit `{id}`.
- **Schließen:** `FocusTrap.deactivate()` (Fokus zurück auf Trigger), ScopeStack/CloseStack-Pop, `modal-enter-to`→`modal-leave-to`, nach **200 ms** `hidden` + `BodyScrollLock.unlock()` + Event `modal:close`.
- **Schließ-Auslöser:** jeder `.close-modal-button` (× oben rechts, teils zusätzlich „Abbrechen"), Klick auf Backdrop (`e.target === modal`), Escape via CloseStack/ScopeStack, sowie programmatisch `modalLogic.close()` nach erfolgreicher Aktion.
- **Portal-Modus (Bottom Dashboard):** `bottom_tools.js:150-196` verschiebt das gesamte Modal-Element in ein Spalten-Overlay, setzt Klasse `bd-inline`, entfernt `hidden/modal-leave-to/modal-enter-from`, klickt den Proxy-Button (löst On-Open-Handler aus) und hebt den Body-Scroll-Lock wieder auf. Gleiche Prompt-Gate-Prüfung mit anderem Text: „Erst einen Prompt generieren, dann kannst du dieses Tool nutzen." / Button „Erst Prompt generieren".
- Basis-Styling aller Modals: `fixed inset-0 bg-black/70 backdrop-blur-sm`, zentriert, `z-50`, Panel `bg-neutral-800/50`, `rounded-3xl`, Breiten `max-w-md` … `max-w-5xl`.

---

### A.1 Ideen-Funke — `#idea-modal` (`modals.js:15-31`, Logik `features.js:37-80`)
- **Titel:** „✨ Ideen-Funke". Trigger: `#spark-idea-button`. **Ausnahme:** öffnet auch ohne generierten Prompt.
- **Felder:** `#keyword-input` (Text, Placeholder „z.B. Ozean, Mitternacht, Nostalgie…"); Button `#generate-ideas-button` („Generieren", Loader `#idea-loader`); Ausgabe `#ideas-output` (`max-h-[50vh] overflow-auto`).
- **Validierung:** leeres Stichwort → roter Text „Bitte gib ein Stichwort ein." (`features.js:57`).
- **Aktion:** `callOpenRouterAPI(keyword, IDEA_SPARK_PROMPT)`; Antwort per `split('---')` in Ideen zerlegt; jede Idee als klickbare Karte. **Klick auf Idee:** schreibt Text in `#idea-input` (Haupteingabe) und schließt das Modal.
- **Fehler:** roter Text mit `getUserFriendlyErrorMessage`.

### A.2 Experten-Veredelung (8 identisch aufgebaute Slider-Modals) — `modals.js:34-209`
| Modal-ID | Titel | Slider-ID | Trigger-Button |
|---|---|---|---|
| `producer-modal` (34) | Veredelung: Produzent | `producer-slider` | `producer-refine-button` |
| `musician-modal` (56) | Veredelung: Musiker | `musician-slider` | `musician-refine-button` |
| `composer-modal` (78) | Veredelung: Filmkomponist | `composer-slider` | `composer-refine-button` |
| `dj-modal` (100) | Veredelung: DJ / Remixer | `dj-slider` | `dj-refine-button` |
| `avantgarde-modal` (123) | Veredelung: Avantgarde-Klangkünstler | `avantgarde-slider` | `avantgarde-refine-button` |
| `minimalist-modal` (145) | Veredelung: Minimalist-Komponist | `minimalist-slider` | `minimalist-refine-button` |
| `vocal-harmony-modal` (167) | Veredelung: Vocal-Harmony Arrangeur | `vocal-harmony-slider` | `vocal-harmony-refine-button` |
| `ethno-modal` (189) | Veredelung: Ethno-Musiker | `ethno-slider` | `ethno-refine-button` |

- **Bedienelemente:** ein Range-Slider `min=0 max=100 value=50 step=10`, Labels „Wenig / <Wert>% / Stark" (`…-slider-value`), Button „Anwenden" (`apply-…-button` mit Text-Span + Loader).
- **Validierung:** leerer aktueller Prompt (`#result-text`) → Aktion bricht still ab (`features.js:133`).
- **Aktion** (`features.js:130-160`): `callOpenRouterAPI(userQuery, <EXPERTE>_REFINER_PROMPT)` mit `userQuery = 'Prompt: "<currentPrompt>"\nInfluence Level: <slider.value>'`; Ergebnis via `applyPromptWithUndo(refined, type)`; `QW.onPromptUpdated({source:'expert:'+type})`; Modal schließt.
- **Fehler:** Buttontext wird 2 s auf „Fehler" gesetzt + Toast.

### A.3 Sound-Ingenieur — `#sound-engineer-modal` (`modals.js:211-228`, Logik `features.js:161-205`)
- **Titel:** „Experte: Sound-Ingenieur"; Trigger `#sound-engineer-button`; Breite `max-w-lg`.
- **Felder:** drei Textareas `.sound-engineer-input` (rows=2; Placeholders „Anweisung 1…", „Anweisung 2 (optional)…", „Anweisung 3 (optional)…"); Button „Anwenden" `#apply-sound-engineer-button`.
- **Validierung:** keine nicht-leere Anweisung **oder** leerer Prompt → Abbruch ohne Meldung.
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\n\nIncorporate the following specific instructions:\n1. …\n2. …'` → `SOUND_ENGINEER_PROMPT`; `applyPromptWithUndo(refined,'Sound Engineer')`; Modal schließt.

### A.4 „Klug"-Tools — 12 Listen-Modals mit identischem Layout (`modals.js:230-457`, Logik `features.js:206-320`)
IDs/Titel: `genre-mixer-modal` „🧬 Genre-Mixer" (231), `hook-generator-modal` „🪝 Hook-Generator" (250), `song-structure-modal` „🏗️ Song-Struktur-Assistent" (269), `mood-analyzer-modal` „🧭 Mood-Analyzer" (288), `vibe-enhancer-modal` „✨ Vibe-Veredler" (307), `artist-suggester-modal` „🧑‍🎤 Künstler-Kompass" (326), `tempo-finder-modal` „⏱️ Tempo-Finder" (345), `production-finish-modal` „💎 Produktions-Finish" (364), `vocal-stylist-modal` „🗣️ Vocal-Stylist" (383), `groove-meister-modal` „🥁 Groove-Meister" (402), `performance-coach-modal` „🏋️ Performance-Coach" (421), `effect-chain-modal` „🔗 Effektketten-Designer" (440).

- **Trigger:** `<toolId>-button` (`features.js:244`).
- **Aufbau je Modal:** Untertitel-Text; Legende mit zwei Farb-Swatches (Grün-Gradient = „Relevanz", Orange-Gradient = „Kreativität"); Liste `#<toolId>-list-container` (`klug-list-container`); Fußzeile mit `#<toolId>-selection-count` („0 ausgewählt") und Button „Übernehmen" `#<toolId>-apply-button` (+Loader).
- **Beim Öffnen** (`features.js:257-280`): Auswahl zurücksetzen, Skeleton-Loader mit 5 Zeilen rendern, sofort `callOpenRouterAPI(currentPrompt, <TOOL>_PROMPT)`, Antwort via `parseKlugResponse` (JSON), dann Typewriter-Reveal der Zeilen (Mehrfachauswahl, Zähler aktualisiert sich).
- **Übernehmen:** bei 0 Auswahl → Modal schließt einfach. Sonst zweiter API-Call: `'Original prompt: "<prompt>". Integrate these elements: "<sel1, sel2, …>".'` mit `PROMPT_REFINER_PROMPT`; `applyPromptWithUndo(refined, 'Klug: '+toolId)`; `QW.onPromptUpdated({source:'klug:'+toolId})`; Modal schließt.
- **Fehler:** roter Text im Listen-Container.

### A.5 Eigene Anweisung — `#custom-instruction-modal` (`modals.js:460-473`, Logik `features.js:1775-1815`)
- Titel „Eigene Anweisung", Trigger `#custom-instruction-button`, `max-w-lg`.
- **Feld:** `#custom-instruction-input` (Textarea, rows=4, Placeholder „z.B. Mache es düsterer und füge einen Kinderchor hinzu…"), Button „Anwenden".
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\nInstruction: "<instruction>"'` → `CUSTOM_INSTRUCTION_PROMPT`; `applyPromptWithUndo`; Modal schließt.

### A.6 Adaptiver Flow — `#adaptive-flow-modal` (`modals.js:476-499`, Logik `features.js:866-940`)
- Titel „🌀 Adaptiver Flow", `max-w-4xl`, Trigger `#adaptive-flow-button`.
- **Bedienelemente:** Slider `#adaptive-flow-slider` (0–100, **Default 65**), Level-Anzeige `#adaptive-flow-level` (Kreis), Button „Flow formen" `#run-adaptive-flow-button` (+Loader), Ausgabe `#adaptive-flow-output`.
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\nDynamic intensity (0-100): <value>'` → `ADAPTIVE_FLOW_PROMPT`; Antwort mit `split('---')`, Prefix `PROMPT:` entfernt, Notizen als Bulletliste gerendert.

### A.7 KI-Kollaboration — `#ai-collab-modal` (`modals.js:501-517`, Logik `features.js:949-1050`)
- Titel „🤝 KI-Kollaboration", `max-w-4xl`, Trigger `#ai-collab-button`.
- **Bedienelemente:** dynamisch gerenderte Persona-Kacheln in `#ai-collab-personas` (Mehrfach-Toggle). Personas siehe Teil 2, 7.2.
- **Beim Öffnen:** Auswahl leeren, Personas neu rendern, Hinweistext „Wähle 2-3 Personas aus, um einen kooperativen Prompt zu formen."
- **Validierung:** leerer Prompt → „Bitte generiere zuerst einen Prompt."
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\nPersonas: <personaSummary>'` → `AI_COLLAB_PROMPT`.

### A.8 Story-Arc Designer — `#story-arc-modal` (`modals.js:519-534`, Logik `features.js:1056-1110`)
- Titel „📚 Story-Arc Designer", `max-w-4xl`, Trigger `#story-arc-button`; Button „Arc neu berechnen" `#story-arc-generate-button`, Ausgabe `#story-arc-output`.
- **Aktion:** `callOpenRouterAPI(currentPrompt, STORY_ARC_DESIGNER_PROMPT)`; Parsing `---` + `PROMPT:`; Arc-Outline als Bullets.

### A.9 Narrative Chapters — `#narrative-chapters-modal` (`modals.js:536-561`, Logik `features.js:1122-1420`)
- Titel „📖 Narrative Chapters", `max-w-5xl`, Trigger `#narrative-chapters-button`.
- **Felder:** Select `#narrative-chapter-count` (3/4/5 Kapitel, **Default 4**), Button „Kapitel generieren" `#run-narrative-chapters-button`, Ausgabe `#narrative-chapters-output`.
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\nRequested chapter count: <n>\nContinuity mode: Balanced evolution'` → `NARRATIVE_CHAPTERS_PROMPT`; Antwort → `extractJsonPayload` (tolerantes JSON-Parsing; bei Fehlschlag Auto-Repair via `JSON_REPAIR_PROMPT`) → `normalizePayload` (erzwingt 3–5 Kapitel; Abweichung wirft „Erwartet N Kapitel, erhalten: M.").

### A.10 Immersive Space — `#immersive-space-modal` (`modals.js:563-579`, Logik `features.js:1422-1520`)
- Titel „🌌 Immersive Space", `max-w-4xl`, Trigger `#immersive-space-button`; Presets-Grid `#immersive-space-presets`, Button „Raum modellieren", Ausgabe `#immersive-space-output`.
- Presets siehe Teil 2, 7.5.
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\nSpatial inspirations: <selectedPresets>'` → `IMMERSIVE_SPACE_PROMPT`.

### A.11 Human Touch — `#human-touch-modal` (`modals.js:581-597`, Logik `features.js:1535-1630`)
- Titel „🎛️ Human Touch", `max-w-4xl`, Trigger `#human-touch-button`; Options-Grid `#human-touch-options`, Button „Humanisieren", Ausgabe `#human-touch-output`.
- Optionen siehe Teil 2, 7.6. **Vorausgewählt: `micro-swing`, `analog-dust`.**
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\nHumanising cues: <selectedOptions>'` → `HUMAN_TOUCH_PROMPT`.

### A.12 Release Forecast — `#release-forecast-modal` (`modals.js:599-629`, Logik `features.js:1644-1740`)
- Titel „🚀 Release Forecast", `max-w-4xl`, Trigger `#release-forecast-button`.
- **Felder:** Select `#release-forecast-timeline` („4 Wochen Sprint", „6 Wochen Kampagne" (**Default**), „8 Wochen Deep Dive", „12 Wochen Roll-out"); Kanal-Toggles `#release-forecast-levers`; Button „Plan generieren"; Ausgabe `#release-forecast-output`.
- Levers siehe Teil 2, 7.7. **Vorausgewählt: `tiktok`, `playlist`.**
- **Aktion:** `userQuery = 'Song Prompt: "<prompt>"\nLaunch timeline (weeks): <timeline>\nFocus channels: <focusLevers>'` → `RELEASE_FORECAST_PROMPT`.

### A.13 Synth-Designer Lab — `#synth-designer-modal` (`modals.js:631-807`, Logik `features.js:489-604`)
- Titel „Synth-Designer Lab", eigenes Dark-Theme (`bg-[#0f111a]`, `max-w-3xl`, Glow-Ellipse), Trigger `#synth-designer-button`. Doppelinitialisierung verhindert via `dataset.synthDesignerInitialized`.
- **Formular `#synth-designer-form`, 5 Schritte** — Feldwerte und Filter-Mapping siehe Teil 2, Abschnitt 5.
- **Fehlerzeile:** `#synth-designer-error`. Buttons: „Abbrechen" (close) und „Add Sound to Prompt" `#add-synth-button` (+Loader).
- **Reset beim Öffnen:** `form.reset()`, Slider auf 50, Fehlertext leeren — sowohl beim Trigger-Klick als auch bei `modal:open` mit dieser ID.
- **Aktion:** mehrzeiliger `userQuery` (`features.js:574-581`):
  ```
  Base Prompt: "<trimmedPrompt>"

  Sound Design Choices:
  - Instrument Role: <role>
  - Core Character: <core>
  - Filter Brightness: <brightnessInfo.phrase> (value <slider.value>/100)
  - Envelope Shape: <envelope>
  - Effects: <effects.join(', ') | 'None'>
  ```
  → `SYNTH_DESIGN_TRANSLATOR_PROMPT`; Ergebnis wird per `appendPromptSentence()` **angehängt**, nicht ersetzt.

### A.14 Visueller Funke — `#visual-engine-modal` (`modals.js:809-842`, Logik `features.js:606-860`)
- Titel „🖼️ Visueller Funke", `max-w-lg`, Trigger `#visual-engine-button`. **Zweistufig.**
- **Schritt 1:** Textarea `#image-prompt-input` (rows=3, Placeholder „z.B. Eine Cyberpunk-Stadt im Neon-Regen, eine ruhige Waldlichtung im Morgennebel…"), Button „Bild generieren" `#generate-image-button`.
- **Fortschritts-Panel `#ve-progress-area`:** Dreifach-Spinner-Ringe, Fortschrittsbalken `#ve-progress-bar`, Status `#ve-progress-status`, Elapsed-Timer `#ve-progress-elapsed`, Abbrechen-Button `#ve-cancel-btn`.
- **Ausgabe `#visual-engine-output`:** Platzhaltertext „Bild wird hier angezeigt…", danach das Bild.
- **Schritt 2:** Button `#analyze-image-button` („Schritt 2: Bild für Prompt analysieren"), initial `hidden`, erscheint nach erfolgreicher Bildgenerierung. Aktion: `callOpenRouterAPI(userMessage, VISUAL_ANALYZER_PROMPT, generatedImageUrl)` mit `userMessage = 'Image prompt used to generate the picture:\n<prompt>'`.

### A.15 Genre-Evolution Timeline — `#get-modal` (`modals.js:844-914`, Logik `features.js:1829-1920`)
- Titel „⏳ Genre-Evolution Timeline", `max-w-3xl`, Trigger `#get-button`.
- **Felder:** Select `#get-genre-select` „Basis-Genre (Auto-Detect)" mit 11 Optionen; Slider `#get-slider` (1950–2020, step 10, Default 2020) mit Dekaden-Beschriftung; Info-Karte `#get-decade-display` + `#get-decade-description`; Button „Ära anwenden" `#apply-get-button` mit Lade-Overlay `#get-loading-overlay` (Text `#get-loading-text`).
- **Auto-Detect:** Genre wird beim Öffnen aus dem aktuellen Prompt über `GENRE_KEYWORDS` bestimmt.
- **Aktion:** `userQuery = 'Base prompt: "<prompt>"\nTarget Decade: <decade>s\nGenre Context: <genre>\nEra Characteristics: <eraDescription>'` → `GENRE_EVOLUTION_PROMPT`.

### A.16 Nicht in `modals.js` enthaltene / ausgeschlossene Modals
- `#style-sync-modal` — **entfernt**, Kommentar `modals.js:916`: „STYLE SYNC MODAL REMOVED (Replaced by Full-Screen Studio V2 in index.html)". **Ausgeschlossen.**
- `#klang-studio-modal` (`features.js:2216 ff.`, eigener `closeModal`, CloseStack-ID `klang-studio`) — **ausgeschlossen.**
- Kreativbibliothek (`js/creative_cosmos.js`) — **ausgeschlossen.**

---

## TEIL B — System-Prompts (`js/prompts.js`)

Alle werden als `system`-Message an `callOpenRouterAPI(userMessage, systemPrompt[, imageUrl])` übergeben; der jeweils zusammengebaute `userQuery` ist die `user`-Message.

### B.1 `ORCHESTRA_REFINER_PROMPT` — `prompts.js:4-32`
Verwendung: `features.js:3275-3276` (Klang Studio → Orchester). **Gehört zum ausgeschlossenen Klang Studio**, wegen Zweifelsfall vollständig dokumentiert.

```
You are a world-class film composer and orchestrator, with the sensibility of Hans Zimmer, John Williams, and Thomas Newman combined. You specialize in translating technical orchestral configurations into evocative, production-ready music prompts.

The user provides a structured orchestral configuration with rich, producer-quality descriptions for each element. Your task is to synthesize these into a single, cohesive prompt that:

1. **Maintains Richness**: Preserve the evocative, producer-language quality of the input descriptions
2. **Creates Harmony**: Ensure all elements work together musically—balance strings against brass, articulations against dynamics
3. **Tells a Story**: Weave the elements into a narrative arc that suggests emotional development
4. **Sounds Professional**: The output should read like liner notes from an award-winning film score

**RULES:**
- Output ONLY the refined orchestral prompt, no explanations
- Keep the poetic, producer-language quality
- Maximum 800 characters
- Always output in English
- Balance detail with coherence—don't just concatenate, synthesize

**EXAMPLE INPUT:**
Preset: full symphony orchestra
Strings: sweeping orchestral strings with cinematic depth, emotionally charged swells
Woodwinds: expressive woodwind choir with distinct character
Brass: warm french horn pads, golden and noble but restrained  
Percussion: propulsive percussion patterns with impact
Articulations: seamlessly connected phrases, bow never leaving the string
Solo: expressive cello solo weaving through the orchestral fabric
Dynamics: forte, bold and assertive
Space: spacious concert hall decay, orchestral warmth enveloping

**EXAMPLE OUTPUT:**
Full symphony orchestra in majestic concert hall, sweeping strings with cinematic depth breathing through seamlessly connected phrases, expressive woodwind choir dancing above a foundation of warm, noble french horn pads, propulsive percussion patterns driving forward momentum, with an expressive cello solo weaving intimately through the orchestral fabric, bold assertive dynamics building to emotionally charged string swells, spacious hall reverb enveloping every phrase in warmth
```

### B.2 `ORCHESTRA_MIXER_PROMPT` — `prompts.js:35-58`
**Aktuell in keinem JS referenziert** (tote Konstante). Bezug: Klang Studio (ausgeschlossen).

```
You are an expert music producer who specializes in blending orchestral arrangements with contemporary music styles. Your task is to intelligently merge an orchestral style configuration with an existing music prompt.

The user provides:
1. **EXISTING PROMPT**: The current music style description in "Dein Meisterstück"
2. **ORCHESTRAL ADDITION**: A rich orchestral configuration to integrate

Your goal is to create a SINGLE, COHESIVE prompt that:
- Preserves the core identity of the existing prompt (genre, tempo, vocal style, mood)
- Weaves the orchestral elements naturally into the existing sound
- Avoids redundancy—don't repeat similar concepts
- Creates a believable hybrid production that a real producer might envision

**RULES:**
- Output ONLY the merged prompt, no explanations
- Maximum 900 characters
- Always output in English
- The result should flow as one cohesive description, not two parts glued together

**EXAMPLE:**
EXISTING: "Dark synthwave, 95 BPM, pulsing analog bass, ethereal female vocals, neon-drenched atmosphere, heavy sidechain compression"

ORCHESTRAL: "Full symphony orchestra with sweeping strings, warm brass pads, driving percussion, spacious concert hall reverb"

OUTPUT: "Cinematic synthwave, 95 BPM, pulsing analog bass layered with sweeping orchestral strings providing cinematic depth, warm brass pads swelling beneath ethereal female vocals, driving percussion blending modern sidechain compression with orchestral impact hits, neon-drenched atmosphere enhanced by spacious hall reverb, a hybrid of retro synth nostalgia and classical grandeur"
```

### B.3 `IDEA_SPARK_PROMPT` — `prompts.js:60-67`
Verwendung: `features.js:64` (Ideen-Funke, A.1). User-Message = reines Stichwort aus `#keyword-input`.
Ausgabe: **genau drei Absätze, getrennt durch `---`**, ohne Nummerierung; Parsing `response.split('---')`.

```
Du bist ein hochkreativer Konzeptionist für Songs, ein Meister darin, aus einem einzigen Wort ganze Welten zu erschaffen. Deine Aufgabe ist es, aus dem Stichwort des Nutzers **drei fundamental unterschiedliche und unkonventionelle Song-Visionen** zu entwickeln.

**Deine Regeln:**
1.  **Maximale Vielfalt:** Jede der drei Ideen MUSS sich drastisch von den anderen unterscheiden. Erkunde verschiedene Genres (von Mainstream bis Nische), erzählerische Perspektiven (z.B. Ich-Erzähler, Beobachter, eine metaphorische Stimme) und emotionale Tonalitäten (von euphorisch bis zutiefst melancholisch).
2.  **Tiefgründige Interpretation:** Gehe über die offensichtliche Bedeutung des Stichworts hinaus. Denke an Metaphern, symbolische Assoziationen und unerwartete Kontexte. Wenn das Wort 'Fluss' ist, denke nicht nur an Wasser, sondern auch an den Fluss der Zeit, einen Tränenfluss oder den Datenfluss im Internet.
3.  **Vermeide Klischees:** Erschaffe originelle Szenarien. Anstatt 'ein Liebeslied über einen Sonnenuntergang', denke an 'ein Lo-Fi-Track aus der Perspektive einer alten Straßenlaterne, die seit Jahrzehnten zusieht, wie sich Paare bei Sonnenuntergang treffen und trennen'.
4.  **Struktur jeder Idee:** Formuliere jede Idee als einen kurzen, aber fesselnden Absatz, der ein klares Bild im Kopf des Lesers erzeugt.
5.  **Ausgabeformat:** Gib exakt drei Ideen aus, getrennt durch eine einzelne Zeile mit '---'. Füge keine Nummerierungen, Titel wie 'Idee 1:' oder sonstige Erklärungen hinzu.
```

### B.4 `BASE_SYSTEM_PROMPT` — `prompts.js:69-83`
Verwendung: `app.js:209` — **Haupt-Generierung** des Meisterstücks. User-Message: die Nutzeridee (`#idea-input`), bei vorhandenen Lyrics zusätzlich `--- LYRICS ---\n<lyrics>`. Ausgabe: reiner Stiltext, Englisch, ≤800 Zeichen → `applyPromptWithUndo(text,'Prompt generiert')`, schaltet Tools frei.

```
You are a world-class music producer and an expert in Suno AI's V5 architecture. Your task is to translate a user's vision into a highly effective, structured, and technically precise style prompt. The V5 model is 'unopinionated' and requires explicit instructions.

**Your Core Principles:**
1.  **Genre Fusion & Specificity:** Start with a core genre, but always aim to create unique hybrids (e.g., 'Cinematic Trap Soul', 'Jazztronica'). Use specific subgenres over broad terms.
2.  **Instrumentation as a Command:** Detail the key instruments and their sonic character (e.g., 'rolling bassline', 'metallic 90s synth stabs', 'warm electric guitar').
3.  **Production Terminology:** Integrate professional production terms to guide the final sound (e.g., 'analog warmth', 'gated reverb', 'crisp snare', 'modern mastering').
4.  **Vocal Precision:** Define the vocal style clearly (e.g., 'ethereal female vocals', 'powerful baritone with a slight rasp').
5.  **Structure & Dynamics:** Include terms for tempo (BPM) and dynamic evolution (e.g., 'extended build', 'euphoric peak', 'sudden drop').
6.  **Lyric-Awareness:** If the user's message contains a section starting with --- LYRICS ---, you MUST first analyze the mood, theme, and emotional arc of those lyrics. The style prompt you generate must be musically aligned with and emotionally enhance those lyrics. For example, a sad lyric requires a style prompt that reflects melancholy, regardless of the initial idea. All other principles (Genre, Instrumentation, etc.) must serve this primary goal of matching the lyrics.

**Output Rules:**
- The output must be ONLY the style description.
- No explanations, no introductory phrases.
- The output must always be in English.
- The total length must not exceed 800 characters.
```

### B.5 `CUSTOM_INSTRUCTION_PROMPT` — `prompts.js:85`
Verwendung: `features.js:1797` (A.5). User: `Base prompt: "<prompt>"\nInstruction: "<instruction>"`.

```
You are a prompt editor. The user provides a base prompt and a specific instruction. Your task is to rewrite the base prompt according to the instruction. The output must be ONLY the new, refined prompt. The final output must be strictly under 800 characters and in English.
```

### B.6 `SOUND_ENGINEER_PROMPT` — `prompts.js:87`
Verwendung: `features.js:189` (A.3), `kachel_system.js:571` (Quick-Apply).

```
You are a creative sound engineer and music producer. Your task is to intelligently rewrite a base prompt by integrating up to three specific, creative, or technical instructions from the user. Do not simply append the instructions. Instead, weave them seamlessly into the existing prompt text, maintaining its core style while adding the new details in a natural and musically coherent way. The output must be ONLY the new, refined prompt. The final output must be strictly under 800 characters and in English.
```

### B.7 `SYNTH_DESIGN_TRANSLATOR_PROMPT` — `prompts.js:89`
Verwendung: `features.js:584` (A.13). Ausgabe: **ein Satzfragment (max. 35 Wörter, Englisch)**.

```
You are the "Sound Design Translator" for Suno V5 prompts. The user will give you the base prompt and a list of synth design choices. Craft one concise sentence fragment (max 35 words) in English that can be appended to the base prompt after a comma. Describe the synth's role, the waveform character, the perceived filter brightness, its envelope behaviour, and explicitly mention any selected effects (or note that it stays dry if none were chosen). Use vivid but professional production language and do not restate the base prompt.
```

### B.8 Experten-Refiner (8 Stück)
User-Message für alle: `Prompt: "<currentPrompt>"\nInfluence Level: <0-100>` (`features.js:141`; Quick-Apply nutzt Default 50). Ausgabe: reiner Prompt, <800 Zeichen, Englisch.

**`PRODUCER_REFINER_PROMPT`** — `prompts.js:92-100`:
```
You are a world-class music producer with a meticulous ear for sound. Your task is to refine the given music prompt with a focus on **studio production, mixing, and sound design**. Based on the user's 'influence level' (0-100), inject technical terminology that Suno V5 understands.

- **Low Influence (0-30):** Add subtle but impactful mixing terms like 'no harsh highs', 'warmth', or 'crisp snare'.
- **Medium Influence (40-70):** Introduce more specific techniques like 'heavy sidechain compression', 'gated reverb on drums', or 'wide stereo image'.
- **High Influence (80-100):** Reimagine the prompt with a strong production concept, detailing the sonic environment, e.g., 'polished for radio', 'lo-fi tape hiss', 'vintage analog feel', 'mastered for vinyl'.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

**`MUSICIAN_REFINER_PROMPT`** — `prompts.js:102-110`:
```
You are a world-class musician and virtuoso composer. Your task is to refine the given music prompt with a focus on **performance, musicality, and emotional expression**. Based on the user's 'influence level' (0-100), add details about how the instruments are played and how the song feels.

- **Low Influence (0-30):** Add specific performance details like 'gentle fingerpicking', 'powerful vibrato', or 'staccato synth hits'.
- **Medium Influence (40-70):** Introduce concepts of harmony and rhythm, e.g., 'dissonant chords', 'polyrhythmic percussion', 'a walking bassline'.
- **High Influence (80-100):** Reimagine the prompt with a focus on the emotional arc and performance dynamics, e.g., 'starts sparse and builds to a powerful crescendo', 'intimate, breathy vocal delivery in the verse, belted with passion in the chorus'.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

**`FILM_COMPOSER_REFINER_PROMPT`** — `prompts.js:112-120`:
```
You are a world-class film composer like Hans Zimmer or John Williams. Your task is to refine the given music prompt to make it intensely **cinematic and narrative**. Based on the user's 'influence level' (0-100), transform the prompt into a movie score cue.

- **Low Influence (0-30):** Add foundational cinematic elements like 'ambient pads' or 'subtle string underscore'.
- **Medium Influence (40-70):** Introduce more specific orchestral textures and storytelling elements, e.g., 'soaring brass melody', 'tense, pulsing strings', 'a triumphant orchestral swell'.
- **High Influence (80-100):** Rewrite the prompt as a scene description, focusing on the emotional journey, e.g., 'an emotional journey from despair to victory', 'builds from a calm, introspective mood to a chaotic, climactic finale'.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

**`DJ_REMIXER_REFINER_PROMPT`** — `prompts.js:122-130`:
```
You are a world-class DJ and Remixer. Your task is to refine the given music prompt to make it **energetic, rhythmic, and perfect for the dancefloor**. Based on the user's 'influence level' (0-100), inject elements of electronic dance music production.

- **Low Influence (0-30):** Add foundational rhythmic drivers like 'four-on-the-floor kick drum' or 'driving bassline'.
- **Medium Influence (40-70):** Introduce classic DJ techniques and sounds, e.g., 'hypnotic trance pads', 'euphoric filter sweep', 'extended build-up before the drop'.
- **High Influence (80-100):** Reimagine the prompt with a strong focus on club structure and energy flow, e.g., 'energetic intro with a riser, leading to a powerful bass drop', 'a hypnotic groove with automated filter movement'.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

**`AVANTGARDE_REFINER_PROMPT`** — `prompts.js:132-140`:
```
You are an avant-garde sound artist. Your task is to deconstruct and rebuild the given music prompt, injecting experimental and unconventional elements. Based on the user's 'influence level' (0-100), push the boundaries of the original idea.

- **Low Influence (0-30):** Add subtle dissonant harmonies, unusual rhythmic elements, or a touch of glitch.
- **Medium Influence (40-70):** Introduce more prominent experimental techniques like atonal melodies, industrial textures, or field recordings.
- **High Influence (80-100):** Radically transform the prompt into an experimental piece, challenging traditional song structure and harmony.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

**`MINIMALIST_REFINER_PROMPT`** — `prompts.js:142-150`:
```
You are a minimalist composer. Your task is to refine the given music prompt by applying the principle of "less is more." Based on the user's 'influence level' (0-100), strip the prompt down to its essential components.

- **Low Influence (0-30):** Simplify the arrangement slightly, suggesting more space between notes.
- **Medium Influence (40-70):** Significantly reduce the instrumentation, focusing on one or two core instruments and a simple motif.
- **High Influence (80-100):** Rewrite the prompt to describe an extremely sparse and atmospheric piece, focusing on silence, repetition, and subtle sonic textures.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

**`VOCAL_HARMONY_REFINER_PROMPT`** — `prompts.js:152-160`:
```
You are a master vocal harmony arranger. Your task is to enhance the given music prompt with rich and complex vocal arrangements. Based on the user's 'influence level' (0-100), add layers of vocal texture.

- **Low Influence (0-30):** Add simple background harmonies or a backing vocal line.
- **Medium Influence (40-70):** Introduce more complex arrangements like call-and-response vocals, multi-layered harmonies, or a gospel choir.
- **High Influence (80-100):** Rewrite the prompt to be centered around an intricate, a cappella-style vocal performance with complex counter-melodies and harmonies.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

**`ETHNO_REFINER_PROMPT`** — `prompts.js:162-170`:
```
You are an ethnomusicologist and world musician. Your task is to refine the given music prompt by infusing it with authentic instruments and rhythms from global music traditions. Based on the user's 'influence level' (0-100), add specific cultural elements.

- **Low Influence (0-30):** Add a single, subtle world instrument like a djembe or a sitar drone.
- **Medium Influence (40-70):** Introduce a more prominent fusion, blending Western structures with specific regional rhythms or scales (e.g., West African polyrhythms, Indian ragas).
- **High Influence (80-100):** Reimagine the prompt as a piece of authentic world music, centered around the chosen culture's instrumentation, rhythms, and melodic style.

**Output Rules:**
- Output ONLY the new, refined prompt.
- The final output must be strictly under 800 characters and in English.
```

### B.9 `SUNO_PRO_REFINER_PROMPT` — `prompts.js:174-185`
Verwendung: `app.js:241` (Button „Suno Pro"). User-Message: der aktuelle Prompt pur. Ausgabe wird zusätzlich hart auf 1000 Zeichen beschnitten (`refined.slice(0,1000)`).

```
You are a prompt editor for the music AI Suno (Pro). Take the user's prompt and produce a detailed, vivid, and technically useful style description.

HARD LIMIT:
- The final output MUST be <= 1000 characters. If your draft would exceed 1000 characters, intelligently trim low‑value adjectives, redundancies, and peripheral details while preserving the main genre(s), key instrumentation, production terms, vocal style, dynamics, and BPM/tempo (if present).
- Never break words in the middle, never end with an incomplete phrase, and keep clean punctuation.

RULES:
- Output only the refined prompt (no explanations).
- Always in English.
- Prefer concise, information‑dense phrasing with professional music terminology.
- Keep a coherent flow from core style to instrumentation, production, vocals, dynamics, and tempo.
```

### B.10 Die 12 „Klug"-Vorschlags-Prompts (JSON-Ideen-Listen)
Gemeinsames Verhalten: User-Message = **nur der aktuelle Prompt-Text** (`#result-text`); Antwort → `parseKlugResponse` (`features.js:327-360`). Gemeinsames Schema: `{"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}`

**`GENRE_MIXER_PROMPT`** — `prompts.js:187-197`:
```
You are a creative music expert and Suno V5 specialist. Analyze the user's current prompt and suggest creative genre fusion ideas that would enhance it. Think about innovative genre combinations, hybrid sounds, and unexpected musical crossovers.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories with 2-3 ideas each (5-8 total ideas)
- Category names: descriptive (2-3 words), e.g. "Hybrid Genres", "Fusion Styles", "Crossover Sounds"
- Idea titles: max 5 words, e.g. "Dark Orchestral Trap Fusion"
- "relevance" = how well it fits the current prompt (0-100)
- "creativity" = how original/unexpected the suggestion is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`HOOK_GENERATOR_PROMPT`** — `prompts.js:201-210`:
```
You are a creative concept artist and hit songwriter. Analyze the user's prompt to understand its core theme and generate catchy title ideas and hook line concepts.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Title Ideas", "Hook Lines", "Conceptual Seeds") with 2-3 ideas each
- Idea titles: max 5 words, catchy and memorable
- "relevance" = how well it fits the prompt's theme (0-100)
- "creativity" = how original the idea is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`SONG_STRUCTURE_PROMPT`** — `prompts.js:212-221`:
```
You are a song structure expert. Analyze the user's prompt and suggest dynamic, effective song structure ideas using Suno tags and arrangement concepts.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Classic Structures", "Dynamic Transitions", "Experimental Formats") with 2-3 ideas each
- Idea titles: max 5 words, e.g. "Verse-Chorus-Bridge-Outro Flow"
- "relevance" = how well the structure fits the prompt (0-100)
- "creativity" = how innovative the arrangement is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`VIBE_ENHANCER_PROMPT`** — `prompts.js:225-234`:
```
You are a creative writer and expert in musical storytelling. Analyze the user's prompt and suggest atmospheric and mood-enhancing ideas that would enrich the sonic experience.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Emotional Arc", "Atmosphere Layers", "Sonic Imagery") with 2-3 ideas each
- Idea titles: max 5 words, evocative and atmospheric
- "relevance" = how well it enhances the existing mood (0-100)
- "creativity" = how unique/unexpected the idea is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`ARTIST_SUGGESTER_PROMPT`** — `prompts.js:236-245`:
```
You are a musicologist with encyclopedic knowledge of artists. Analyze the user's prompt and suggest artists and stylistic influences that could inspire the sound.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Direct Influences", "Unexpected Parallels", "Era References") with 2-3 ideas each
- Idea titles: max 5 words, include artist name or era, e.g. "Bowie Berlin Era Sound"
- "relevance" = how closely the artist matches the prompt (0-100)
- "creativity" = how unexpected/surprising the suggestion is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`TEMPO_FINDER_PROMPT`** — `prompts.js:247-256`:
```
You are a music tempo and rhythm expert. Analyze the user's prompt's mood and genre and suggest tempo, BPM, and rhythmic feel ideas.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Tempo Suggestions", "Rhythmic Feel", "BPM Variations") with 2-3 ideas each
- Idea titles: max 5 words, include BPM or tempo terms, e.g. "Slow 72 BPM Groove"
- "relevance" = how well the tempo fits the prompt (0-100)
- "creativity" = how interesting the rhythmic approach is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`PRODUCTION_FINISH_PROMPT`** — `prompts.js:437-446`:
```
You are a mixing and mastering engineer with deep understanding of Suno V5. Analyze the user's prompt and suggest professional production and mastering techniques for a polished, finished quality.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Mix Techniques", "Mastering Polish", "Sonic Texture") with 2-3 ideas each
- Idea titles: max 5 words, use professional terms, e.g. "Heavy Sidechain Compression"
- "relevance" = how well the technique fits the prompt (0-100)
- "creativity" = how distinctive the production choice is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`VOCAL_STYLIST_PROMPT`** — `prompts.js:448-457`:
```
You are a professional vocal coach and stylist. Analyze the user's prompt and suggest specific, nuanced vocal performance characteristics including delivery, emotion, and vocal texture.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Delivery Style", "Vocal Texture", "Backing Vocals") with 2-3 ideas each
- Idea titles: max 5 words, descriptive, e.g. "Breathy Intimate Female Vocals"
- "relevance" = how well the vocal style fits the prompt (0-100)
- "creativity" = how unique the vocal suggestion is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`MOOD_ANALYZER_PROMPT`** — `prompts.js:459-468`:
```
You are an expert music psychologist and sound designer. Analyze the user's prompt and suggest instruments, textures, and sonic elements that would enhance and deepen the mood.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Tonal Color", "Ambient Textures", "Percussion Feel") with 2-3 ideas each
- Idea titles: max 5 words, instrument/texture names, e.g. "Warm Rhodes Piano Chords"
- "relevance" = how well the element fits the mood (0-100)
- "creativity" = how unique/unexpected the choice is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`GROOVE_MEISTER_PROMPT`** — `prompts.js:470-479`:
```
You are a world-class rhythm section specialist. Analyze the user's prompt and suggest specific rhythmic feels, grooves, and percussion patterns that go beyond simple BPM.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Rhythmic Feel", "Percussion Patterns", "Bassline Groove") with 2-3 ideas each
- Idea titles: max 5 words, rhythmic terms, e.g. "Syncopated Sixteenth Note Hi-Hats"
- "relevance" = how well the groove fits the prompt (0-100)
- "creativity" = how inventive the rhythmic idea is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`PERFORMANCE_COACH_PROMPT`** — `prompts.js:481-490`:
```
You are a master performance coach and instrumentalist. Analyze the user's prompt and suggest specific playing nuances for instruments to make them sound more human, expressive, and alive.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "String Techniques", "Keyboard Nuances", "Rhythmic Expression") with 2-3 ideas each
- Idea titles: max 5 words, playing techniques, e.g. "Aggressive Down-Stroked Guitar Riff"
- "relevance" = how well the technique fits the prompt (0-100)
- "creativity" = how unique the performance idea is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

**`EFFECT_CHAIN_PROMPT`** — `prompts.js:492-501`:
```
You are a creative audio engineer and effects specialist. Analyze the user's prompt and suggest specific effect chains and signal processing ideas that create a unique sonic character.

**Output Rules:**
- Respond with ONLY valid JSON matching this schema: {"categories":[{"name":"string","ideas":[{"title":"string (max 5 words)","relevance":number 0-100,"creativity":number 0-100}]}]}
- Generate 2-3 categories (e.g. "Reverb & Delay", "Distortion & Saturation", "Modulation Effects") with 2-3 ideas each
- Idea titles: max 5 words, effect names, e.g. "Tape Saturated Slapback Delay"
- "relevance" = how well the effect fits the prompt (0-100)
- "creativity" = how innovative the effect chain is (0-100)
- All text in English
- No markdown, no code blocks, ONLY raw JSON
```

### B.11 `PROMPT_REFINER_PROMPT` — `prompts.js:199`
Verwendung: `features.js:295` — **Integrationsschritt aller Klug-Tools** („Übernehmen"). User-Message: `Original prompt: "<prompt>". Integrate these elements: "<ausgewählte Titel, komma-getrennt>".`

```
You are a prompt refiner. The user provides an original prompt and a list of musical elements. Your task is to seamlessly integrate these elements into the original prompt to create a richer, more detailed prompt for a music AI. The result should only be the new, refined prompt. Maintain the core of the original idea and expand it with the given elements. The output must always be in English.
```

### B.12 `STRUCTURE_INTEGRATOR_PROMPT` — `prompts.js:223`
**Aktuell nicht referenziert** — vermutlich Altbestand des Song-Struktur-Tools, das heute `PROMPT_REFINER_PROMPT` nutzt.
```
You are a prompt assistant. Your task is to integrate a given song structure into an existing music style prompt. Rewrite the original prompt to include the song structure naturally. The output must only be the newly combined prompt. The output must always be in English.
```

### B.13 `ADAPTIVE_FLOW_PROMPT` — `prompts.js:258-273`
Verwendung: `features.js:906` (A.6), `kachel_system.js:583`. User: `Base prompt: "<prompt>"\nDynamic intensity (0-100): <slider>`.
Parsing (`features.js:907-908`): `response.split('---')` → Block 1 mit Regex `/^PROMPT:\s*/i` bereinigt = neuer Prompt; Block 2 = „FLOW NOTES"-Bullets.
```
You are a master of dynamic arrangement for Suno V5. The user provides a base prompt and a target intensity between 0 and 100. Rewrite the prompt so that it emphasises evolving dynamics, sectional energy, and transitions tailored to that intensity level. Translate the intensity into how bold the contrasts between sections should feel, from subtle swells (low values) to dramatic peaks (high values).

**Guidelines:**
- Keep the musical identity intact while describing a clear build, peak, and resolution.
- Reference concrete production moves (automation, layering, drops) that convey motion.
- Mention tempo or rhythmic momentum shifts if helpful.
- Output must stay under 800 characters and in English.

**Output Format:**
PROMPT:
[rewritten prompt]
---
FLOW NOTES:
- [bullet 1]
- [bullet 2]
- [bullet 3]
```

### B.14 `AI_COLLAB_PROMPT` — `prompts.js:275-289`
Verwendung: `features.js:1017` (A.7), `kachel_system.js:584`. User: `Base prompt: "<prompt>"\nPersonas: <personaSummary>`.
```
You are a collaborative session director for Suno V5. The user provides a base prompt and a list of specialist personas with their focus areas. Rewrite the prompt so it includes interplay cues that highlight how these personas trade ideas, layering moments for each contributor without bloating the text.

**Guidelines:**
- Keep the output under 800 characters and in English.
- Weave call-and-response phrasing, arrangement cues, and mix directives that let each persona shine.
- Mention how stems or sections hand off energy between the personas.

**Output Format:**
PROMPT:
[rewritten prompt]
---
INTERPLAY NOTES:
- [bullet 1]
- [bullet 2]
- [bullet 3]
```

### B.15 `STORY_ARC_DESIGNER_PROMPT` — `prompts.js:291-305`
Verwendung: `features.js:1080` (A.8), `kachel_system.js:585`. User: der aktuelle Prompt pur.
```
You are a narrative architect for Suno V5 prompts. The user provides a base prompt. Rewrite it so that it clearly expresses a three-act musical journey (setup, escalation, payoff) while staying concise and evocative.

**Guidelines:**
- Stay under 800 characters and in English.
- Highlight how instrumentation, harmony, and dynamics evolve through the arc.
- Reference timestamps or section markers only if they clarify the arc.

**Output Format:**
PROMPT:
[rewritten prompt]
---
ARC OUTLINE:
- [Act I focus]
- [Act II focus]
- [Act III focus]
```

### B.16 `NARRATIVE_CHAPTERS_PROMPT` — `prompts.js:307-373`
Verwendung: `features.js:1406` (A.9). Platzhalter im User-Query: `Base prompt`, `Requested chapter count` (3–5, Default 4), `Continuity mode: Balanced evolution`.
Ausgabe: **reines JSON**; Parsing über `parseJsonLoose` mit LLM-Auto-Repair und Validierung (`normalizePayload`).
```
You are a narrative composer and prompt architect for Suno V5. The user provides a base music prompt and a desired chapter count (3-5). Your task is to generate a coherent chapter sequence where every chapter is a standalone, production-ready Suno prompt, while the full set forms one continuous musical story.

PROCESS:
1. EXTRACT the base prompt's sonic DNA:
   - Core genre/subgenre identity
   - Signature instrumentation and production traits
   - Vocal concept (or instrumental identity)
   - Emotional center and energy profile

2. DESIGN a continuity blueprint:
   - Define one stable "global style anchor" that persists across all chapters
   - Plan chapter-to-chapter evolution with BALANCED progression (not static, not chaotic)
   - Evolve four primary dimensions across chapters:
     - mood
     - key/tonal center
     - rhythm/groove
     - tempo/energy

3. WRITE chapters as a connected arc:
   - Chapter 1 establishes world and motif
   - Middle chapters deepen tension, variation, and contrast
   - Final chapter resolves or transforms the narrative
   - Each chapter prompt must remain individually usable in Suno

4. SELF-CHECK before output:
   - Continuity is audible from chapter to chapter
   - Changes are intentional and musically believable
   - No chapter repeats wording or structure verbatim
   - All prompts are concise, technical, and evocative

**Guidelines:**
- Keep all chapter prompts in English with professional music terminology.
- Preserve the global style anchor in every chapter, but vary arrangement, harmony feel, groove behavior, and dynamic contour.
- "Key" can be tonal key, mode, or tonal center (e.g., "A minor", "C Dorian", "ambiguous modal center").
- "Rhythm" should describe feel and movement (e.g., "syncopated 16th groove", "half-time pulse with ghost notes").
- "Energy" should be descriptive and progressive (e.g., "low simmer", "rising urgency", "controlled climax", "afterglow release").
- Chapter prompts should typically stay under 800 characters each.

**Output Rules:**
- Output ONLY valid JSON. No markdown. No commentary.
- Use exactly the requested chapter count. If missing, default to 4.
- JSON must match this structure exactly.
- Use integer tempo_bpm values.
- For chapter 1, set transition_from_previous to "N/A".
- Ensure chapters are indexed sequentially from 1.

**Output Format:**
{
  "global_style_anchor": "string",
  "continuity_strategy": "string",
  "chapters": [
    {
      "index": 1,
      "title": "string",
      "prompt": "string",
      "music_matrix": {
        "mood": "string",
        "key": "string",
        "rhythm": "string",
        "tempo_bpm": 0,
        "energy": "string",
        "instrumentation_anchor": "string",
        "transition_from_previous": "string"
      }
    }
  ]
}
```

### B.17 `JSON_REPAIR_PROMPT` — `prompts.js:375-386`
Verwendung: `features.js:1276` (Auto-Repair). User: `Fix this malformed JSON and return ONLY valid JSON:\n\n<rohe Antwort>`.
```
You are a strict JSON repair engine.

The user provides malformed JSON text. Your task is to return a syntactically valid JSON object while preserving meaning and structure as closely as possible.

**Rules:**
- Output ONLY valid JSON.
- Do not wrap in markdown fences.
- Do not add explanations.
- Keep all existing keys and values whenever possible.
- Remove trailing commas, fix missing commas/brackets/quotes, and normalize smart quotes.
- If uncertainty exists, prefer conservative fixes over inventing new content.
```

### B.18 `IMMERSIVE_SPACE_PROMPT` — `prompts.js:388-402`
Verwendung: `features.js:1496` (A.10), `kachel_system.js:586`. User: `Base prompt: "<prompt>"\nSpatial inspirations: <gewählte Presets>`.
```
You are a spatial mixing visionary for Suno V5. The user gives a base prompt and a set of desired environments or spatial sensations. Rewrite the prompt so it captures immersive, three-dimensional placement with believable acoustics.

**Guidelines:**
- Keep the musical core intact while layering spatial cues (front/back, height, movement).
- Reference spatial tools such as binaural panning, convolution reverbs, or surround swells.
- Stay under 800 characters and in English.

**Output Format:**
PROMPT:
[rewritten prompt]
---
SPACE DESIGN NOTES:
- [bullet 1]
- [bullet 2]
- [bullet 3]
```

### B.19 `HUMAN_TOUCH_PROMPT` — `prompts.js:404-418`
Verwendung: `features.js:1605` (A.11), `kachel_system.js:587`. User: `Base prompt: "<prompt>"\nHumanising cues: <gewählte Optionen>`.
```
You are a feel-first producer for Suno V5. The user provides a base prompt and optional nuances that should make the piece feel handcrafted. Rewrite the prompt to introduce subtle imperfections, expressive performance gestures, and organic textures without derailing the concept.

**Guidelines:**
- Highlight micro-timing swings, expressive dynamics, and tactile noises.
- Blend the new humanised traits into the existing instrumentation.
- Stay under 800 characters and in English.

**Output Format:**
PROMPT:
[rewritten prompt]
---
HUMAN TOUCH NOTES:
- [bullet 1]
- [bullet 2]
- [bullet 3]
```

### B.20 `RELEASE_FORECAST_PROMPT` — `prompts.js:420-435`
Verwendung: `features.js:1717` (A.12). User: `Song Prompt: "<prompt>"\nLaunch timeline (weeks): <4|6|8|12>\nFocus channels: <gewählte Levers>`. **Antwort auf Deutsch**, <400 Wörter. Ändert den Prompt **nicht**.
```
You are a release strategist for independent artists. The user shares a base prompt, a preferred timeline, and focus channels. Provide a concise launch blueprint in German that aligns with the song's vibe.

**Guidelines:**
- Offer a realistic release window, pre-save cadence, and highlight actions per channel.
- Keep it actionable with short bullet points.
- Total response must stay under 400 words.

**Output Format:**
PLAN:
- [timeline insight]
- [pre-save / teaser steps]
---
TACTICS:
- [channel-specific action]
- [channel-specific action]
- [channel-specific action]
```

### B.21 `HINT_SELECTOR_PROMPT` — `prompts.js:503-521` — **auskommentiert/entfernt**
TODO-Kommentar: „HINT_SELECTOR_PROMPT removed — lint hint UI disabled. See quickwins.js for CURATED_HINTS data". Für den Port irrelevant.

### B.22 `VISUAL_ANALYZER_PROMPT` — `prompts.js:523-549`
Verwendung: `features.js:826` (A.14, Schritt 2). Aufruf **multimodal**: `callOpenRouterAPI(userMessage, VISUAL_ANALYZER_PROMPT, generatedImageUrl)`; User-Message: `Image prompt used to generate the picture:\n<Textprompt>` + Bild-URL als `image_url`.
```
You are a multimodal AI with a deep understanding of music and visual art. Your task is to act as a creative translator, turning visual information into a music style prompt for Suno AI.

The user will provide two things:

A text prompt they used to generate an image.

The resulting image (via URL).

Your task is to analyze the provided image in the context of the user's text prompt. Deconstruct the image's mood, atmosphere, colors, textures, and implied energy. Then, write a detailed, professional Suno style prompt that musically captures that visual essence.

Example:

User Prompt: "Cyberpunk city in neon rain"

Image: (Shows a dark, blue/pink-lit street with reflections)

Your Output: "Dark, cinematic synthwave, 100 BPM, driving retro synth bassline, crisp digital snare, lush 80s pads, neon-drenched atmosphere, heavy sidechain compression, male android vocals with vocoder, a feeling of urban isolation and digital rain."

Output Rules:

The output must be ONLY the new, refined style prompt.

No explanations, no introductory phrases.

The output must always be in English.

The total length must not exceed 800 characters.
```

### B.23 `GENRE_EVOLUTION_PROMPT` — `prompts.js:587-592`
Verwendung: `features.js:1902` (A.15). User: `Base prompt: "<prompt>"\nTarget Decade: <1950…2020>s\nGenre Context: <Genre>\nEra Characteristics: <Text aus GENRE_EVOLUTION_DATA>`.
```
You are a music historian and producer specialist. Your task is to rewrite the user's prompt to reflect the specific aesthetic, production techniques, and instrumentation of a chosen decade. Keep the core musical idea (melody, mood) but transport it in time. Use specific keywords from that era (e.g., 'gated reverb' for 80s, 'tape saturation' for 60s).

**Output Rules:**
- The output must be ONLY the refined prompt.
- The output must be in English.
- The total length must not exceed 800 characters.
```

### B.24 Datenkonstanten für Genre-Evolution
- **`GENRE_KEYWORDS`** — `prompts.js:594-605`, benutzt in `features.js:1818` zur Genre-Auto-Erkennung. Kategorien mit Stichwortlisten: Electronic (synth, techno, electronic, beat, bass, digital, dance, edm, house, trance, ambient, dubstep), Rock (guitar, rock, band, drums, distortion, metal, punk, indie, alternative, riff, solo), Hip Hop (rap, hip hop, beats, flow, 808, rhyme, trap, urban, groove, sample), Jazz (jazz, saxophone, piano, swing, improvisation, smooth, fusion, blues, trumpet, ensemble), R&B/Soul (soul, r&b, vocals, groove, smooth, emotion, funk, motown, gospel), Classical/Orchestral (orchestra, symphony, classical, piano, violin, cello, conductor, score, cinematic), Pop (pop, chorus, melody, hit, radio, catchy, vocal, mainstream, ballad), Metal (metal, heavy, growl, blast beat, shredding, doom, thrash, double kick), Country/Folk (acoustic, guitar, folk, country, storytelling, banjo, americana, roots), Reggae/Dub (reggae, dub, roots, jamaican, offbeat, rhythm, bass, echo, ska).
- **`GENRE_EVOLUTION_DATA`** — `prompts.js:608-719`: 11 Genres (die 10 obigen + `General`) × 8 Dekaden (1950–2020) mit je einem Charakteristik-String. Wird 1:1 als Datenkonstante gebraucht (Anzeige `#get-decade-description` + Prompt-Variable „Era Characteristics"). **Beim Port wörtlich aus `prompts.js:608-719` übernehmen.**

### B.25 Style-Sync-Prompts (**ausgeschlossen**, nur namentlich)
- `IMAGE_ARCHETYPE_PROMPT` — `prompts.js:552-568` — aktuell nicht referenziert. **Ausgeschlossen.**
- `SOUND_DECODER_PROMPT` — `prompts.js:570-585` — aktuell nicht referenziert. **Ausgeschlossen.**
- `STYLE_SYNC_ENCODER_PROMPT` — `prompts.js:723-771`, verwendet in `features.js:1993`. **Ausgeschlossen.**
- `STYLE_SYNC_DECODER_PROMPT` — `prompts.js:774-818`, verwendet in `features.js:2179`. **Ausgeschlossen.**
- `CREATIVE_SYSTEM_PROMPT` (`js/creative_cosmos.js:1`) — Kreativbibliothek. **Ausgeschlossen.**

---

## Übersicht der Ausgabeformate

Drei Vertragsformate, die der Port exakt nachbilden muss:
1. **Reiner Text**, ≤800 Zeichen, Englisch (Generierung, alle Experten, Custom Instruction, Sound-Ingenieur, Genre Evolution, Visual Analyzer, Orchestra Refiner); Suno Pro ≤1000 Zeichen; Synth-Translator = ein Satzfragment ≤35 Wörter.
2. **JSON** `{categories:[{name,ideas:[{title,relevance,creativity}]}]}` — die 12 Klug-Tools.
3. **`PROMPT:\n…\n---\n<NOTES>:` mit Bullets** — Adaptive Flow (`FLOW NOTES`), AI Collab (`INTERPLAY NOTES`), Story Arc (`ARC OUTLINE`), Immersive Space (`SPACE DESIGN NOTES`), Human Touch (`HUMAN TOUCH NOTES`), Release Forecast (`PLAN`/`TACTICS`). Idea Spark nutzt nur `---` ohne Präfixe.
4. Sonderfall **Narrative Chapters**: eigenes JSON-Schema mit LLM-Auto-Repair.

**Tot / nicht referenziert:** `ORCHESTRA_MIXER_PROMPT`, `STRUCTURE_INTEGRATOR_PROMPT`, `HINT_SELECTOR_PROMPT` (auskommentiert), `IMAGE_ARCHETYPE_PROMPT`, `SOUND_DECODER_PROMPT`.

---

# Teil 4 — API-Schicht und untere Werkzeuge

## TEIL A — API-Schicht

### A1. Provider-Landschaft

Genau zwei externe Provider, beide direkt aus dem Browser (kein Backend-Proxy).

| Provider | Zweck | Basis-URL | Definiert in |
|---|---|---|---|
| OpenRouter | Alle Text-/LLM-Aufrufe (Prompt-Generierung, alle Tools, Bildanalyse via Vision) | `https://openrouter.ai/api/v1/chat/completions` (Konstante `API_URL`) | `js/config.js:38` |
| fal.ai | Bildgenerierung (Text→Bild) | `https://fal.run/` (Konstante `FAL_BASE_URL`) + Modell-Endpunktpfad | `js/config.js:11` |

`server.py` / `start.sh` sind nur ein statischer lokaler Dev-Webserver, keine API-Schicht.

### A2. OpenRouter — `callOpenRouterAPI(userMessage, systemPrompt, imageUrl = null)`
`js/api.js:243-326`

- Methode: `POST` auf `API_URL`.
- Header (`js/api.js:279-284`):
  - `Content-Type: application/json`
  - `Authorization: Bearer ${API_KEY}`
  - `HTTP-Referer: window.location.origin`
  - `X-Title: Suno Style Architect`
- Body (`js/api.js:255-265`):
  ```json
  { "model": "SELECTED_MODEL", "stream": false,
    "messages": [{"role":"system","content":"systemPrompt"},{"role":"user","content":"userContent"}],
    "temperature": 0.7, "max_tokens": 1000, "top_p": 0.9 }
  ```
  Diese Parameter sind **fest verdrahtet und identisch für ALLE Aufruftypen** — es gibt keine pro-Tool-Variation von temperature/max_tokens. Kein `response_format`, kein JSON-Mode, keine Tools/Function-Calling.
- Multimodal: Ist `imageUrl` gesetzt, wird `content` zum Array `[{type:'text',text:...},{type:'image_url',image_url:{url}}]` (`js/api.js:248-253`). Genutzt für die Bildanalyse (`js/features.js:826`) und Style-Sync-Decoder mit Base64-Data-URL (`js/features.js:2179`).
- **Streaming: NEIN** (`stream: false`). Antwort wird erst komplett als Text gelesen (`response.text()`), dann `JSON.parse` — bewusst, um bei fehlerhaften/gestreamten Antworten nicht zu hängen (`js/api.js:306-316`).
- Timeout: **60 000 ms**, via `AbortController` + `setTimeout` (`js/api.js:268-271`).
- **Keine Retries**, keine explizite Rate-Limit-Behandlung außer Fehlermapping (429 → Text). Kein externer `signal`-Parameter, d. h. kein Nutzer-Abbruch möglich.
- Antwort-Extraktion: `result.choices[0].message.content.trim()` (`js/api.js:318-319`); sonst `result.error.message`; sonst generischer Fehler.
- Logging: `console.log('[SSA] API Request', …)` mit Modell/URL/Nachrichtenlänge, Statuscode und Antwortlänge (`js/api.js:273, 298, 308`).

### A3. fal.ai — `callFalAPI(prompt, options)`
`js/api.js:60-240`

- Optionen mit Defaults: `timeoutMs = 120000`, `retries = 2`, `signal = null` (`js/api.js:65-69`).
- Endpunkt-Auflösung (`js/api.js:72-79`): `FAL_MODEL_ENDPOINTS[FAL_MODEL]`, sonst `FAL_MODEL` selbst. Enthält der Wert keinen `/`-Präfix, werden zusätzlich `fal-ai/<x>` und `google/<x>` als Kandidaten probiert. URL = `FAL_BASE_URL + endpoint`.
- Methode `POST`, Header (`js/api.js:177-186`): `Content-Type: application/json`, `Accept: application/json`, `Authorization: Key ${FAL_API_KEY}`. **Auth-Fallback:** bei 401/403 wird derselbe Request mit `Authorization: Bearer ${FAL_API_KEY}` wiederholt (`js/api.js:195-198`).
- Pro Modell ein eigener Payload (`js/api.js:86-166`):
  - `fal-ai/nano-banana-pro`: `{prompt, num_images:1, aspect_ratio:'16:9', output_format:'png'}`
  - `fal-ai/nano-banana-2`: wie oben + `resolution:'1K'`
  - `fal-ai/recraft/v3/text-to-image`: `{prompt, image_size:'landscape_16_9', style:'digital_illustration', colors:[]}`
  - `fal-ai/flux-pro`: `{prompt, image_size:'landscape_16_9', num_inference_steps:28, guidance_scale:3.5, num_images:1, safety_tolerance:"2", output_format:'jpeg'}`
  - `fal-ai/flux-pro/kontext`: `{prompt, guidance_scale:3.5, safety_tolerance:"2", aspect_ratio:'16:9', num_images:1, output_format:'jpeg'}`
  - `fal-ai/gpt-image-1.5`: `{prompt, image_size:'1536x1024', quality:'high', num_images:1, output_format:'png'}`
  - `fal-ai/flux/dev`: `{prompt, image_size:{width:1024,height:1024}, num_inference_steps:28, guidance_scale:3.5, num_images:1, enable_safety_checker:false}`
  - Unbekanntes Modell → Fallback-Kette `[{prompt,num_images:1}, {prompt}]`
- Retry-/Fehlerstrategie (`js/api.js:200-228`):
  - Transient (408, 429, 500, 502, 503, 504) → Retry bis `retries`, Backoff `min(2000*attempt, 6000) + random()*500` ms.
  - 400/422 oder Text mit `did not match|validation|schema` → nächste Payload-Form probieren.
  - 404 → Fehler werfen, nächster Endpunkt-Kandidat.
  - Sonst `API request failed (status)`.
- Abbruch: eigener `AbortController` pro Endpunkt-Versuch; externes `signal` wird verkettet (`js/api.js:170-175`). Genutzt in `js/features.js:750-767` (Bildgenerierung abbrechbar, `user-cancel`-Reason).
- Ergebnis-Parsing (`js/api.js:223`): erste gefundene URL aus `images[0].url` → `images[0].image_url` → `image.url` → `url` → `output[0].url`. Keine URL → nächste Payload.
- Streaming/Queue-API: nicht verwendet, nur der synchrone `fal.run`-Aufruf.

### A4. API-Keys — Verwaltung, Storage, Validierung

Zustandsvariablen (`js/config.js:9-38`): `FAL_API_KEY`, `FAL_MODEL`, `API_KEY`, `SELECTED_MODEL` — reine In-Memory-Globals, aus localStorage geladen.

localStorage-Keys (`js/app.js:48-119`) — **Klartext, unverschlüsselt**:

| Key | Inhalt |
|---|---|
| `ssa_api_key` | OpenRouter-Key (primär, wird beim Speichern gesetzt) |
| `openrouter_api_key` | OpenRouter-Key (Duplikat, wird beim Speichern gesetzt) |
| `OPENROUTER_API_KEY` | nur beim Laden gelesen (Legacy-Kompatibilität) |
| `api_key` | nur beim Laden gelesen (Legacy) |
| `selected_model` | OpenRouter-Modell-ID |
| `fal_api_key` | fal.ai-Key |
| `FAL_API_KEY` | nur beim Laden gelesen (Legacy) |
| `fal_model` | fal.ai-Modell-ID |

- Laden (`loadSettings`, `js/app.js:48-85`): erster nicht-leerer Kandidat gewinnt; Defaults `openai/gpt-5-mini` bzw. `fal-ai/nano-banana-pro`. Kein Key → Setup-Modal wird angezeigt, Hauptapp bleibt verborgen (`showSettings`, `js/app.js:131-135`).
- Speichern (`saveSettings`, `js/app.js:87-119`): Validierung nur für OpenRouter — leer → „Bitte gib deinen OpenRouter API Key ein."; muss mit **`sk-or-v1-`** beginnen, sonst Inline-Fehler (`js/app.js:91-99`). **Für den fal.ai-Key gibt es keinerlei Formatvalidierung**, er ist optional.
- Fehlender Key zur Laufzeit:
  - OpenRouter: `callOpenRouterAPI` wirft „Bitte konfiguriere zuerst deinen API Key in den Einstellungen." (`js/api.js:245`); zusätzlich Vorabprüfung in `generatePrompt` mit `showError` + Öffnen der Einstellungen (`js/app.js:185-189`).
  - fal.ai: `callFalAPI` wirft „Bitte konfiguriere zuerst deinen Fal.ai API Key in den Einstellungen." (`js/api.js:62`); zusätzlich blockiert ein Capture-Listener das Öffnen des Bild-Modals mit Toast + Einstellungen (`js/features.js:630-636`).
- Header-Chips zeigen die aktiven Modellnamen (`updateHeaderModelChips`, `js/app.js:39-46`).

### A5. Modelle (exakte IDs) und Konfigurierbarkeit

OpenRouter — `MODEL_NAMES` (`js/config.js:41-50`) / `<select id="model-select">` (`index.html:52-59`):
`openai/gpt-5-mini` (Default), `anthropic/claude-haiku-4.5`, `deepseek/deepseek-v3.1-terminus`, `deepseek/deepseek-v3.2-exp`, `tngtech/deepseek-r1t2-chimera`, `z-ai/glm-4.6`, `x-ai/grok-4-fast`, `inclusionai/ling-1t`.

fal.ai — `FAL_MODEL_NAMES` / `FAL_MODEL_ENDPOINTS` (`js/config.js:14-33`) / `<select id="fal-model-select">` (`index.html:80-86`):
`fal-ai/nano-banana-pro` (Default), `fal-ai/nano-banana-2`, `fal-ai/recraft/v3/text-to-image`, `fal-ai/flux-pro`, `fal-ai/flux-pro/kontext`, `fal-ai/gpt-image-1.5`, `fal-ai/flux/dev`.

Konfiguriert wird ausschließlich im Einstellungs-Modal `#api-setup-modal`; ein Modellwechsel gilt global für alle Tools.

### A6. Fehlerbehandlung und UI-Meldung

Zentrale Übersetzung `getUserFriendlyErrorMessage(error)` (`js/api.js:4-57`) — deutsche Meldungen, Statuscode wird per Regex `\b(4\d{2}|5\d{2})\b` aus der Message gezogen:

| Bedingung | Meldung |
|---|---|
| `TypeError` mit fetch/network, oder `netzwerkfehler/failed to fetch/net::ERR_/DNS` | „Verbindungsfehler. Bitte prüfe deine Internetverbindung." |
| `user-cancel` | „Bildgenerierung wurde abgebrochen." |
| `timeout/abort` | „Die Anfrage hat zu lange gedauert. …" |
| 429 / rate limit | „Zu viele Anfragen. Bitte warte einen Moment." |
| 401 / 403 / unauthorized / invalid key | „Ungültiger API-Schlüssel. Bitte überprüfe deine Einstellungen." |
| ≥ 500 / 502 / 503 / 504 | „Der Server ist momentan nicht erreichbar. Bitte versuche es später." |
| 404 | „Der angeforderte Dienst wurde nicht gefunden. …" |
| eigene deutsche Meldungen (`^Bitte konfiguriere`, `^API-Antwort konnte nicht`) | unverändert durchgereicht |
| sonst | „Ein Fehler ist aufgetreten. Bitte versuche es erneut." |

Anzeigekanäle: Inline-Fehlerbox `#error-container` mit Auto-Dismiss nach **8000 ms** (`js/app.js:145-175`), Toasts `showToast(message, type, duration=4500, action)` mit Typen `error|warning|info` (`js/config.js:60-100`), Inline-Fehler im Container `showInlineError/hideInlineError` (`js/config.js:103-113`).

### A7. Antwort-Parsing, JSON-Reparatur, Fallbacks

- Basis: `JSON.parse(responseText)` in `callOpenRouterAPI`; scheitert das → „API-Antwort konnte nicht verarbeitet werden. Möglicherweise ein Server-Problem." (`js/api.js:310-316`).
- Tool-Antworten sind Freitext. Strukturierte Tools liefern `PROMPT:\n…\n---\nNOTES:` — es wird an `---` gesplittet und `^PROMPT:\s*` entfernt (`js/kachel_system.js:659-664` und `1521-1526`).
- Tagger-Antworten (Komma-Listen) werden an den bestehenden Prompt angehängt; Trennzeichen `', '`, bzw. `' '` wenn der Text auf `.!?…`/`)`/`,` endet (`js/kachel_system.js:667-675`).
- KLUG-Kategorien: `parseKlugResponse` (`js/features.js:327-355`) — Markdown-Fences ```json entfernen, sonst erstes `{` bis letztes `}` ausschneiden, `JSON.parse`; Fallback auf Komma-Split.
- Mehrstufiger Loose-Parser `parseJsonLoose` (`js/features.js:1244-1268`): Kandidaten in Reihenfolge roh → balancierte Wurzel → normalisierter Text → normalisierte balancierte Wurzel.
- **LLM-basierte Auto-Reparatur** `extractJsonPayload` (`js/features.js:1269-1281`): schlägt lokales Parsen fehl, wird ein zweiter OpenRouter-Call mit `JSON_REPAIR_PROMPT` (`js/prompts.js:375-386`, „strict JSON repair engine", nur JSON, keine Fences) und der Query `Fix this malformed JSON and return ONLY valid JSON:\n\n<raw>` abgesetzt; scheitert auch das → Fehler „… (Auto-Repair fehlgeschlagen: …)".

### A8. Sonstiges in `api.js`

- `safeCopyText(text)` (`js/api.js:330-355`): `navigator.clipboard` in Secure Context, Fallback verstecktes `<textarea>` + `document.execCommand('copy')`. `window.copyResult()` kopiert `#result-text` und feuert `keys:action` mit `id: 'copy.result'`.
- `setupCopyButton(button, icon, check, textElement)` (`js/api.js:366-380`): Icon-Wechsel für 2000 ms.
- `setKlugToolsState(enabled)` (`js/api.js:394-434`): globaler Gate-Schalter. Setzt `isPromptGenerated`, deaktiviert alle `.klug-btn`, schaltet `#expert-container`/`#klug-container`/`#lab-container` zwischen `active-box`/`inactive-box` und setzt `.bd-tools-inactive` auf der Bottom-Dashboard. **Alle Werkzeuge sind gesperrt, bis ein Prompt generiert wurde.**
- `setupModal(modal, openButton)` (`js/api.js:437-503`): generischer Modal-Lifecycle mit Gate (Ausnahmen `idea-modal`, `style-sync-modal`), Shake-Feedback `bd-shake` 500 ms, BodyScrollLock, ScopeStack/CloseStack-Kopplung, FocusTrap, Events `modal:open` / `modal:close`, Schließ-Animation 200 ms.

---

## TEIL B — Werkzeuge

### B1. `js/bottom_tools.js` — Bottom-Dashboard (3 Spalten, 29 Werkzeuge)

Registry `BD_TOOLS` (`js/bottom_tools.js:7-43`), jedes Tool: `{emoji, name, desc, buttonId, modalId}`.

- **Spalte 1 „Experten" (9):** Produzent 🎤, Musiker 🎹, Filmkomponist 🎬, DJ/Remixer 🎧, Avantgarde 🎨, Minimalist 🔲, Vocal-Harmony 🎵, Ethno 🌍, Sound-Ingenieur 🔧.
- **Spalte 2 „KLUG" (13):** Synth-Designer Lab 🎛️, Genre-Mixer 🧬, Hook-Generator 🪝, Song-Struktur 🏗️, Vibe-Veredler ✨, Künstler-Kompass 🧑‍🎤, Tempo-Finder ⏱️, Mood-Analyzer 🧭, Production-Finish 💎, Vocal-Stylist 🗣️, Groove-Meister 🥁, Performance-Coach 🏋️, Effect-Chain 🔗.
- **Spalte 3 „Future Lab" (7):** Adaptive Flow 🌊, AI Collaboration 🤖, Story Arc Designer 📖, Narrative Chapters 📚, Immersive Space 🌌, Human Touch 🫀, Release Forecast 📊.

Verhalten:
- Rendert pro Tool eine `.bd-tool-card` mit Drag-Handle `⠿`, Quick-Apply `▶`, Pin `☆`, Emoji, Name und Shortcut-Badge; Staffel-Animation `((col-1)*80 + i*35) ms` (`js/bottom_tools.js:81-106`).
- Erzeugt pro Tool einen **versteckten Proxy-Button** mit der `buttonId`, damit `features.js` unverändert `setupModal()` binden kann (`js/bottom_tools.js:114-119`). Danach Event `bottomtools:ready`.
- **Portal-Mechanik** `openBdDetail` (`js/bottom_tools.js:145-197`): das echte Modal-Element wird per `appendChild` physisch in das Spalten-Overlay `#bd-detail-<col>` verschoben, erhält Klasse `bd-inline`, der Proxy-Button wird geklickt (löst alle On-Open-Handler aus), Body-Scroll-Lock wird wieder aufgehoben. `closeBdDetail` schiebt das Modal zurück nach `#modals-container` (`js/bottom_tools.js:199-220`).
- Gate: ohne generierten Prompt Toast-Warnung + Hinweistext „Erst Prompt generieren".
- **Kollaps-Toggle** `#bd-collapse-toggle`, Klasse `bd-collapsed` auf `.app-main-layout`, persistiert unter localStorage-Key **`ssa_bd_collapsed`**, **Default = eingeklappt** (`js/bottom_tools.js:222-250`); Event `bottomdashboard:toggle`.
- `CHORD_SHORTCUTS` (`js/bottom_tools.js:48-70`) spiegelt `chords.js` für die Badge-Nummern; >9 wird als `0→n` dargestellt.

### B2. `js/kachel_system.js` — Kachelsystem (Erweiterungen des Dashboards)

Eine IIFE mit sieben Feature-Blöcken, gebootstrappt auf `bottomtools:ready` in dieser Reihenfolge: `initTooltips, initSearch, initDragDrop, initPinning, initQuickApply, initChainBuilder, initKeyboardNav, initUndo` (`js/kachel_system.js:1919-1933`). Reihenfolge ist relevant: Drag-Order muss vor dem Pinning wiederhergestellt werden.

**1. Tooltips (`:11-168`)** — Nur bei gehaltener **Shift**-Taste und Hover, Verzögerung **300 ms**. Ein einziges `#bd-tooltip`-Element, zentriert über der Kachel, geklemmt auf die Dashboard-Breite (4 px Rand), oberhalb wenn `spaceAbove >= tipH + 8`, sonst unterhalb; Spalten-Akzentklasse `bd-tooltip-col-1|2|3`; `aria-describedby`-Verknüpfung.

**2. Spalten-Suche (`:174-285`)** — Pro Spalte eine dynamisch eingefügte `.bd-search-bar` zwischen Header und Liste, Toggle über `.bd-search-toggle`. Filtert live über Tool-Name und `data-desc` (case-insensitive substring), blendet Karten via `bd-card-hidden` aus, Empty-State „Keine Tools gefunden". Fokus nach 210 ms, Escape über CloseStack.

**3. Favoriten/Pinning (`:291-449`)** — Storage-Key **`ssa_bd_favorites_v1`**, Struktur `{ "1": [buttonId,…], "2": […], "3": […] }`. Sortierung: gepinnt zuerst in Pin-Reihenfolge, danach ungepinnt in ursprünglicher Reihenfolge (`originalOrder` wird vor jeder Umsortierung erfasst). Trenner-Element `.bd-pin-separator`, Pin-Symbol `★`/`☆`, Spalten-Zähler zeigt `★<n> / <gesamt>`. API: `window.BdPinning {reorderColumn, isPinned, getFavorites}`.

**4. Undo/Redo (`:455-547`)** — Zwei Stacks über dem Text von `#result-text`, Einträge `{text, toolName, ts}`, **Maximum 20** (`UNDO_MAX`), Redo wird bei jeder neuen Aktion geleert. Buttons `#bd-undo-btn`/`#bd-redo-btn` mit dynamischen Titeln („Rückgängig: <Tool>"). Shortcuts über Keys-Registry: **Mod+Z** / **Mod+Shift+Z**. API `window.BdUndo {captureBeforeApply, performUndo}`; wird von `applyPromptWithUndo` (`js/config.js:118-138`) und vom Kettenlauf genutzt. **Nicht persistiert** — nur In-Memory.

**5. Quick-Apply (`:561-759`)** — `▶`-Button auf der Kachel führt das Tool ohne Modal aus.
- `TOOL_PROMPT_MAP` (`:561-588`) mappt 21 buttonIds auf System-Prompts aus `js/prompts.js`. Tools mit komplexer Modal-Eingabe (Synth-Designer, Genre-Mixer, Hook-Generator, Song-Struktur, Künstler-Kompass, Tempo-Finder, Narrative Chapters, Release Forecast) sind bewusst **nicht** enthalten → `console.warn`, kein Aufruf.
- User-Message-Aufbau (`:641-653`): Experten-Tools → `Prompt: "<text>"\nInfluence Level: 50`; `sound-engineer-button` → `Base prompt: "<text>"\n\nIncorporate the following specific instructions:\n1. Enhance overall sound quality and polish`; strukturierte Tools → `Base prompt: "<text>"`, Adaptive Flow zusätzlich `\nDynamic intensity (0-100): 65`; sonst der reine Prompttext.
- Kategorien: `STRUCTURED_RESPONSE_TOOLS` (5), `EXPERT_TOOLS` (8, ohne sound-engineer), `TAGGER_TOOLS` (6 — Ergebnis wird angehängt statt ersetzt).
- **Serielle Warteschlange** `qaQueue` / `qaRunning`: immer nur ein Aufruf gleichzeitig; Kartenzustände `bd-qa-queued` → `bd-qa-running` → `bd-qa-done` (1500 ms).
- API `window.BdQuickApply {enqueue, getPromptMap}`.

**6. Tastaturnavigation (`:765-915`)** — Aktiviert beim Fokussieren des Dashboards (ScopeStack-Scope `dashboard`). ↑/↓ zyklisch innerhalb der Spalte, ←/→ zyklisch zwischen Spalten (1↔3), **Enter** = Karte öffnen, **Leertaste** = Quick-Apply, **Escape** = Navigation beenden (nur wenn CloseStack leer und kein Overlay offen), **Tab** = deaktivieren. Fokusklasse `bd-kb-focused`, `tabindex="-1"` auf allen Karten, Fokuswiederherstellung 50 ms nach `modal:close`.

**7. Drag & Drop (`:921-1359`)** — Storage-Key **`ssa_bd_order_v1`**, Struktur `{ "1": [buttonId,…], … }`, beim Init wiederhergestellt; neue, unbekannte Tools werden hinten angehängt.
- Pointer-Events (kein HTML5-DnD). Start entweder sofort über `.bd-drag-handle` oder per **Long-Press 200 ms** auf den Kartenkörper; Abbruch des Long-Press bei Bewegung > **5 px**.
- Ghost-Element (Klon, absolut positioniert, an der Zeigermitte), Platzhalter `.bd-drag-placeholder` mit Originalhöhe, Einfügepunkt über Mittelpunkt-Y der Geschwister.
- **Zonen-Regel:** verschoben wird nur innerhalb derselben Zone (gepinnt bzw. ungepinnt) und derselben Spalte — kein Verschieben zwischen Spalten.
- Auto-Scroll der Liste bei ±30 px Randnähe (5 px/Event).
- **Drag-out:** Verlässt der Zeiger die Spalte (Toleranz 50 px horizontal / 30 px vertikal), erscheint das Ketten-Popup als Drop-Ziel (`bd-chain-drop-active`); Drop dort fügt das Tool der Kette hinzu und macht die Umsortierung rückgängig, Popup schließt nach 800 ms (bzw. 400 ms wenn nicht gedroppt).
- Nach `pointerup` wird der synthetische Click einmalig im Capture abgefangen, damit sich kein Portal öffnet.

**8. Chain-Builder / visuelle Pipeline (`:1365-1911`)** — Storage-Key **`ssa_bd_chains_v1`** (Array von `{name, items:[{buttonId,toolName,emoji}]}`, beim Laden validiert).
- Zwei **Standard-Presets** (`:1369-1386`): „Studio Polish" = Produzent → Production-Finish → Vocal-Stylist; „Full Mix" = Vibe-Veredler → Groove-Meister → Sound-Ingenieur. Standard-Presets sind nicht löschbar und mit „(Standard)" markiert.
- Popup `#bd-chain-popup` wird zur Laufzeit erzeugt (`role=dialog`, `aria-modal`), mit Buttons Ausführen ▶ / Speichern 💾 / Laden 📂 / Leeren ✕, Slot-Chips mit `→`-Pfeilen, Fortschrittsbalken, Backdrop, Badge mit Anzahl auf allen `.bd-chain-toggle`.
- `runChain` (`:1450-1585`): **sequentielle Promise-Kette**, jedes Tool bekommt das Ergebnis des vorherigen als Eingabe (dieselbe Message-Logik wie Quick-Apply). **Ein einziger Undo-Eintrag** für die gesamte Kette mit Namen `Kette: A → B → C`; Fortschrittsbalken `((i+1)/n)*100 %`; Chip-Zustände `bd-chain-item-active`/`-done`; Aufräumen nach 1500 ms; danach Undo-Toast (6000 ms) mit Button „Rückgängig".
- Speichern über `window.prompt('Name für die Tool-Kette:')`, gleichnamige Presets werden überschrieben.
- API `window.BdChain {add, remove, clear, run, getItems, show, hide, toggle}`.

Zusammengefasst: „Kacheln" sind keine eigene Datenentität, sondern DOM-Karten über der statischen `BD_TOOLS`-Registry. Persistiert werden nur drei Dinge: Reihenfolge (`ssa_bd_order_v1`), Favoriten (`ssa_bd_favorites_v1`), Ketten-Presets (`ssa_bd_chains_v1`) — plus der Kollaps-Zustand (`ssa_bd_collapsed`).

### B3. `js/chords.js` — Zwei-Tasten-Akkorde (KEINE Musiktheorie)

Wichtig für die Portierung: „Chords" sind **Tastatur-Akkorde im Sinne von Emacs/Vim-Prefix-Keys**, keine Musikakkorde. Es ist keinerlei Musiktheorie verdrahtet.

- Modi: `expert` (Taste **E**), `klug` (**K**), `future` (**F**), `nav` (**V**) — registriert über `Keys.register` (`js/chords.js:260-276`).
- Zeitfenster: `CHORD_TTL = 1200 ms`, für Navigation `NAV_TTL = 800 ms`; `MAX_KEYS = 9` pro Seite.
- Nach dem Präfix erscheinen Keycap-Badges `1…9` auf den Zielbuttons; **0** blättert zur nächsten Seite (relevant für KLUG mit 12 Einträgen), jede beliebige andere Taste bricht ab. Der Klick löst `pulse`-Animation (400 ms) aus.
- Zielreihenfolgen: `expertButtons` (9), `klugButtons` (12, andere Reihenfolge als `BD_TOOLS`: Genre-Mixer, Mood-Analyzer, Hook-Generator, …), `futureLabButtons` (7) — `js/chords.js:9-45`.
- Nav-Ziele (`js/chords.js:48-53`): **D** Dashboard (scrollIntoView + focus), **C** Creative Cosmos (`#idea-starter-tile`), **S** Style Sync (`#style-sync-tile`), **T** Kachel-System (Dashboard fokussieren).
- ScopeStack-Scope `chord-builder` während eines aktiven Akkords.
- Zusätzlich **Modal-Tastenhandling** `handleModalKey` (`js/chords.js:221-257`): im aktiven Modal steuert **Enter** den ersten `button[id^="apply-"]`/`[id^="run-"]`; ist ein `input[type=range]` vorhanden: ↑/→ +5, ↓/← −5, Ziffern **1–9** setzen 10–90, **0** setzt 100.
- Öffentliche API `window.Chords {isActive, handleChordKey, handleModalKey, activeModal, _redispatch}`.

### B4. `js/palette.js` — Command-Palette (keine Farbpalette)

Es ist eine **Command-Palette** im Stil von ⌘K, kein Farbwerkzeug.

- Fünf Gruppen `TOOL_GROUPS` (`js/palette.js:19-25`): Experten-Tools 🎯, KLUG-Tools 🧠, Future Lab 🔮, Features ⚡, Aktionen ⌨️.
- Statische Einträge `TOOLS` (`js/palette.js:27-67`): 9 Experten (Bindings `E 1`…`E 9`), 12 KLUG (`K 1`…`K 9`, `K 0→1`…`K 0→3`; Synth-Designer Lab ohne Binding), 7 Future Lab (`F 1`…`F 7`), 3 Features: Ideen-Funke `⌘I` (`idea-starter-tile`), Stil-Synchronisator `⌘Y` (`style-sync-tile`), Klang-Studio `⌘L` (`klang-studio-tile`).
- Die Gruppe „Aktionen" wird dynamisch aus `Keys.listActions()` gefüllt; ausgeschlossen sind Palette-interne, Chord- und Cosmos-Actions sowie `open.idea-spark`/`open.style-sync`/`open.klang-studio` (`js/palette.js:83-89`).
- Suche: einfaches Fuzzy per Wort-Substring (`fuzzy`, `:121-124`) über Label, ID, Binding, `searchText` (Name + Beschreibung + Gruppe) und Beschreibung; Kategorie-Header werden für Gruppen mit Treffern neu eingefügt.
- Navigation über Keys-Registry im Scope `command-palette`, Priorität 50: ↑/↓/Enter, nur aktiv solange `#cmdk-input` den Fokus hat (`:263-285`). Auswahl: Tools → Klick auf `buttonId`; Aktionen → `Keys.run(id)`.
- ScopeStack-Scope `command-palette` und CloseStack-Eintrag `palette`.
- Zusätzlich im selben Modul das **HUD** `#action-hud`: zeigt Labels von `keys:action` für 900 ms und pulst das Zielelement 400 ms (`targetFor`-Mapping für generate, refine.v3, refine.pro, copy.result, history.toggle, auto.trim, focus.idea). `keys:blocked` erzeugt Meldungen „<Label> – nicht verfügbar" / „– nur in <Scope>" / „– hier nicht aktiv" (`:328-343`).
- API `window.Palette {open, close}`.

---

## Daten und Skripte (Überblick)

- **`data/worlds/`** — 49 Dateien, ca. 1,4 MB. Format je Welt: `{ id, name, icon, content }`, wobei `content` ein **kompletter deutschsprachiger HTML-Artikel** ist (`<h1>`, `<h2>`, `<p>`) mit eingebetteten `<span class="interactive-term" data-term="…">`-Markierungen für anklickbare Fachbegriffe.
- **`data/worlds/index.json`** — Verzeichnis: `{ "worlds": [{ id, name, icon, group }] }`; `group` bündelt Welten (z. B. `orchestra_group`, `ambient_group`). Themen: Orchester/Klassik, Ambient, Jazz, Hip-Hop, Elektronik, Weltmusik.
- Diese Daten gehören zur **Kreativbibliothek / `creative_cosmos.js` — vom Port ausgeschlossen**. Berührungspunkt: nur der Nav-Chord **V→C** und der Palette-Eintrag „Ideen-Funke" (`idea-starter-tile`); der eigentliche Cosmos-Aufruf liegt in `js/creative_cosmos.js:11658` (`callOpenRouterAPI` mit `CREATIVE_SYSTEM_PROMPT`).
- **`scripts/pdf_world_article.swift`** — einzige Datei in `scripts/`, ausführbares Swift-CLI (`#!/usr/bin/env swift`, PDFKit). Extrahiert Text aus einer PDF und schreibt ihn als Weltartikel. Optionen: `--pdf <absoluter Pfad>` (Pflicht), `--world-id <id>` (Pflicht), `--apply` (ohne = Dry-Run), `--keywords "k1,k2"`, `--json-path` (Default `data/worlds/<id>.json`), `--js-path` (Default `js/creative_cosmos.js`), `--help`. Enthält eine deutsche/englische Stopword-Liste für die Keyword-Extraktion. Exit-Codes: 0 success, 2 validation, 3 extraction, 4 writeFailure. Reines Autorenwerkzeug, nicht Teil der Laufzeit.
- Weitere ausgeschlossene Berührungspunkte: Stilsynchronisator (`style-sync-tile`, `#style-sync-modal`, Nav-Chord V→S, Palette `⌘Y`, `callFalAPI` in `js/features.js:1998`) und Klang Studio (`klang-studio-tile`, Palette `⌘L`).

---

# Teil 5 — Gesammelte Portierungs-Entscheidungen

Aus den vier Teilen ergeben sich Punkte, die beim Port **nicht** mechanisch übernommen werden sollten, sondern eine bewusste Entscheidung brauchen. Sie sind hier gesammelt, damit sie in den Folge-Tickets (Architektur, Hybrid-UI-Mapping, Phasenplan) auftauchen und nicht untergehen.

## 5.1 Nicht portieren — toter oder wirkungsloser Code

| Sache | Warum | Fundort |
|---|---|---|
| `js/tool_paging.js` | Nicht in `index.html` eingebunden; referenziert nicht existierende Selektoren | Teil 1, §0 |
| Shortcuts `page.prev` / `page.next` (`[` / `]`) | Rufen `window.ToolPaging` auf, das nie definiert wird | Teil 1, §3.2 |
| `#help-shortcuts-button` („⌘K"-Chip in der Topbar) | Hat in keiner JS-Datei einen Click-Handler | Teil 1, §1.3 |
| `renderPresets()` / die 5 Preset-Chips | Zielcontainer `#preset-chips` existiert nicht mehr im Markup | Teil 2, §11.5 |
| `refine.v3` → `#suno-v3-button` im HUD-Mapping | Button existiert nicht mehr | Teil 1, §3.10 |
| Lint-Hints H01–H30 | Auskommentiert; UI deaktiviert. Texte als Datenbestand aufheben, Feature nicht bauen | Teil 2, §11.6 |
| `ORCHESTRA_MIXER_PROMPT`, `STRUCTURE_INTEGRATOR_PROMPT`, `HINT_SELECTOR_PROMPT`, `IMAGE_ARCHETYPE_PROMPT`, `SOUND_DECODER_PROMPT` | Nicht referenziert bzw. auskommentiert | Teil 3, §B.25 |
| Legacy-Cleanup `suno_templates_v1` / `ssa_user_templates_v1` | Migrationsrest ohne Bedeutung für eine Neuimplementierung | Teil 2, §11.9 |

## 5.2 Inkonsistenzen, die eine Entscheidung brauchen

1. **Zwei Wege, das Dashboard zu verstecken.** `⌘D` toggelt `.hidden` ohne Persistenz, `#bd-collapse-toggle` setzt `.bd-collapsed` mit Persistenz. Im Port: ein Mechanismus, ein Zustand.
2. **`⌘I` und der Palette-Eintrag „Ideen-Funke" führen zu unterschiedlichen Zielen** — der Shortcut zum kleinen Ideen-Funke-Modal, die Palette zur Kreativbibliothek. Da letztere in V1 deaktiviert ist, muss der Palette-Eintrag umgehängt oder ausgegraut werden.
3. **Escape schließt das API-Setup-Modal nur, wenn es via `⌘,` geöffnet wurde** — der Topbar-Weg registriert keinen Close-Eintrag.
4. **Zwei Sichtbarkeitsmechanismen**: Setup-Modal über `style.display`, alles andere über die Klasse `hidden`.
5. **Spaltenkopf sagt „13" Klug-Tools, die Chord-Tabelle kennt nur 12** — der Synth-Designer hat kein Chord-Badge. Entweder Chord ergänzen oder Zählung angleichen.
6. **Vier localStorage-Aliase für den OpenRouter-Key.** Im Port auf **einen** Keychain-Eintrag konsolidieren — die Klartext-Speicherung ist ohnehin nicht nach macOS zu übernehmen.
7. **Der fal.ai-Key wird gar nicht validiert**, der OpenRouter-Key nur auf das Präfix `sk-or-v1-`.

## 5.3 Verhalten, das bewusst bestätigt oder verworfen werden muss

- **Fünf verschiedene Arten, Fehler zu zeigen** (Toast / roter Inline-Text / nur Konsole / Überschreiben der Nutzereingabe / faktisch unsichtbar). Der Port sollte auf **eine** Fehlerdarstellung vereinheitlichen; die betroffenen Stellen sind in Teil 2, §13.4–5 gelistet.
- **Stille Abbrüche ohne jedes Feedback** bei leerem Prompt (Experten, Sound-Ingenieur, Custom Instruction, Genre Evolution) und beim Übernehmen ohne Auswahl (KLUG).
- **Erfundene Zahlenwerte** im KLUG-Fallback: schlägt das JSON-Parsing fehl, werden `relevance`/`creativity` zufällig erzeugt und dem Nutzer als Bewertung präsentiert.
- **Uneinheitliches Reset-Verhalten**: manche Modals setzen sich beim Öffnen zurück, andere behalten den letzten Zustand, Narrative Chapters cached sogar sein Ergebnis.
- **Kein Retry und kein Nutzer-Abbruch** bei Textaufrufen, dafür 60 s Timeout und `max_tokens: 1000` — abgeschnittene Antworten sind der Grund für die JSON-Reparatur-Kaskade.
- **Undo ist nicht persistent** (nur im Speicher, max. 20 Schritte) und Auto-Trim hat nur eine einzige Undo-Ebene.
- **Ungedrosselter `MutationObserver`** auf dem Ergebnisfeld — in SwiftUI schlicht ein beobachteter String, das Problem entfällt.

## 5.4 Was 1:1 erhalten bleiben muss

- **Alle System-Prompt-Texte** (Teil 3, Teil B) — wörtlich, inklusive Formatierung und Zeichenlimits.
- **Die drei Antwort-Vertragsformate** und ihre Parsing-Ketten, inklusive der mehrstufigen JSON-Normalisierung und des LLM-Auto-Repairs.
- **Die Werkzeug-Registry**: 29 Dashboard-Tools mit Emoji, Name, Beschreibung und Spaltenzugehörigkeit (Teil 4, §B1).
- **Die Datenkonstanten** `GENRE_KEYWORDS` und `GENRE_EVOLUTION_DATA` (11 Genres × 8 Dekaden) sowie die 58 `musicGenres`.
- **Die Zeichenlimits** als Kette: 800 (Systemprompts) / 1000 (Suno Pro, Zähler-Obergrenze) / 200 (Auto-Trim) / 35 Wörter (Synth-Translator) / 5 Wörter (KLUG-Titel).
- **Die Tastatur-Semantik**: Scopes, Prioritäten, Typing-Guard, Escape-LIFO, Chord-TTLs (1200 ms / 800 ms). Was davon nach macOS gehört und was durch native Menüs ersetzt wird, entscheidet das Hybrid-UI-Mapping.

## 5.5 Rein webseitige Mechanik ohne native Entsprechung

- **Die Portal-Mechanik** des Bottom-Dashboards (Modal-DOM wird physisch in die Spalte verschoben) ist ein reines DOM-Artefakt. Funktional bedeutet sie nur: *Tool-Detail erscheint inline in der Spalte statt als Overlay.*
- **Focus-Trap, Body-Scroll-Lock, Close-Stack** lösen Probleme, die SwiftUI-Sheets von sich aus lösen.
- **QWERTZ-Erkennung** per `navigator.keyboard` — macOS kennt die Belegung nativ.
- **`z-index`-Schichtung** der Overlays entfällt zugunsten von Sheet-/Window-Hierarchien.
