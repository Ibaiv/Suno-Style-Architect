# Design-Token-Katalog — Web-App → macOS V1

**Quelle**: `css/styles.css` (6.777 Zeilen), `index.html`, `DESIGN_SYSTEM.md`
**Erstellt**: 2026-07-21 · Ticket: *Design-Token-Extraktion aus styles.css* (#133)
**Zweck**: Grundlage für die Hybrid-Optik der nativen macOS-App (Karte #130)

---

## 0. Vorbemerkung: `DESIGN_SYSTEM.md` ist veraltet

`DESIGN_SYSTEM.md` (Version 1.0, Oktober 2025) beschreibt ein **anderes, neutral-graues
Farbsystem**, das im Code so nicht mehr existiert:

| `DESIGN_SYSTEM.md` sagt | Tatsächlich in `styles.css` |
|---|---|
| `--bg-primary: #0d0d0f` (Neutralgrau-Schwarz) | `#050510` + violette/indigo Radial-Gradients |
| Panels `rgba(23,23,23,0.4)`, Ränder `rgba(115,115,115,0.2)` (Neutral-Palette) | Panels `rgba(15,23,42,…)`, Ränder `rgba(148,163,184,…)` (**Slate**-Palette) |
| Textfarben `#e5e7eb / #9ca3af / #6b7280` (Gray) | `#e2e8f0 / #94a3b8 / #64748b` (**Slate**) |
| Keine benannten CSS-Variablen im Code | 355 `--`-Deklarationen in drei Namespaces |
| Kein Akzentsystem außer Blau | Blau + **Purple/Cyan/Emerald** Spalten-Akzente |

Die Tailwind-Neutral-Klassen (`bg-neutral-900/70` etc.) stehen zwar noch im HTML, werden
aber in `styles.css:1413–1422` global auf Glas-Weiß überschrieben — das erklärt die
Diskrepanz. **Für die Mac-App gilt dieser Katalog, nicht `DESIGN_SYSTEM.md`.**

Erhalten geblieben und weiterhin gültig sind aus `DESIGN_SYSTEM.md` nur die
*strukturellen* Regeln: Z-Index-Skala, Easing-Kurven, Dauer-Skala, 44px-Touch-Targets.

---

## 1. Drei Token-Namespaces — nur einer ist V1-relevant

| Namespace | Zeilen | Gehört zu | V1? |
|---|---|---|---|
| `--bd-*` (21 Tokens) | 202–221 | Bottom Dashboard / Haupt-Shell | ✅ **ja** |
| `--sn-*` (30 Tokens) | 2275–2304 | Spectrum Navigator / Kreativbibliothek | ❌ ausgeschlossen |
| `--ks-*` (~20 Tokens) | 3644–3666 | Klang Studio | ❌ ausgeschlossen |

Die `--sn-*`- und `--ks-*`-Systeme sind eigenständige Sub-Design-Systeme mit eigenen
Radien-, Font- und Akzentskalen. Da Kreativbibliothek und Klang Studio laut Karte in V1
ausgeschlossen sind, werden sie hier **nicht** übernommen — sie sind unten nur der
Vollständigkeit halber archiviert (Abschnitt 10), falls die Features später neu gedacht werden.

> **Wichtig für das Hybrid-UI-Mapping**: Der Rest der App (Modals, Buttons, Inputs, Top-Bar)
> nutzt **gar keine** Variablen, sondern hartkodierte Werte. Der Katalog unten normalisiert
> diese zu einem konsistenten Token-Set.

---

## 2. Farben

### 2.1 Hintergrund & Oberfläche

| Token | Wert | Verwendung |
|---|---|---|
| `bgDeep` | `#050510` | App-Hintergrund (`body`) |
| `bgGradient1` | `rgba(76, 29, 149, 0.25)` @ 20%/30%, radial, 50% Stop | Violetter Schein oben links |
| `bgGradient2` | `rgba(25, 25, 112, 0.30)` @ 80%/70%, radial, 50% Stop | Indigo-Schein unten rechts |
| `bgGradient3` | `rgba(15, 23, 42, 0.80)` @ 50%/50%, radial, 100% Stop | Slate-Vignette |
| `glassPanel` | `rgba(15, 23, 42, 0.25)` | Standard-Glaspanel (`--bd-glass`) |
| `glassSurface` | `rgba(255, 255, 255, 0.03)` | Karten, Option-Cards, Tool-Cards |
| `glassElevated` | `rgba(10, 15, 30, 0.90)` | Overlays im Panel (`--bd-glass-elevated`) |
| `modalSurface` | `rgba(10, 10, 15, 0.95)` | Modal-Fenster (`.modal-content`) |
| `modalBackdrop` | `rgba(0, 0, 0, 0.85)` – `0.90` | Modal-Overlay-Hintergrund |
| `menuBarSurface` | `rgba(255, 255, 255, 0.035)` | Top-Menüleiste |
| `inputSurface` | `rgba(0, 0, 0, 0.30)` global / `0.40` in Modals | Text-Eingaben |

Der Hintergrund ist `background-attachment: fixed` — die Gradients scrollen nicht mit.

### 2.2 Ränder

| Token | Wert |
|---|---|
| `borderSubtle` | `rgba(148, 163, 184, 0.18)` (`--bd-glass-border`) |
| `borderElevated` | `rgba(148, 163, 184, 0.25)` (`--bd-glass-elevated-border`) |
| `borderColumn` | `rgba(148, 163, 184, 0.15)` |
| `borderDivider` | `rgba(148, 163, 184, 0.12)` (Header-Trennlinien) |
| `borderCard` | `rgba(148, 163, 184, 0.08)` (Tool-Cards) |
| `borderGlassWhite` | `rgba(255, 255, 255, 0.08)` (Modals, Option-Cards) |
| `borderInput` | `rgba(255, 255, 255, 0.10)` |
| `borderMenuChip` | `rgba(255, 255, 255, 0.12)` |

Randstärke ist durchgehend **1px**.

### 2.3 Text (Slate-Skala)

| Token | Wert | Verwendung |
|---|---|---|
| `textPrimary` | `#ffffff` | Überschriften (`--bd-text-primary`) |
| `textTitle` | `#f8fafc` | App-Titel |
| `textBody` | `#e5e7eb` | Fließtext (`--bd-text-body`) |
| `textDefault` | `#e2e8f0` | Body-Standardfarbe, Modal-Text |
| `textInput` | `#f1f5f9` | Eingabefeldtext |
| `textMuted` | `#cbd5e1` | Sekundär-Buttons, Chips |
| `textSecondary` | `#94a3b8` | Hilfstext (`--bd-text-secondary`) |
| `textDisabled` | `#64748b` | Deaktiviert (`--bd-text-disabled`) |

### 2.4 Akzent Blau (primäre Aktion)

| Token | Wert | Tailwind-Äquivalent |
|---|---|---|
| `accentBlue` | `#3b82f6` | blue-500 |
| `accentBlueStrong` | `#2563eb` | blue-600 — Gradient-Start, aktive Tags |
| `accentBlueDeep` | `#1d4ed8` | blue-700 — Gradient-Ende |
| `accentBlueLight` | `#60a5fa` | blue-400 — Fokusring, Hover-Slider |
| `accentBlueSoft` | `#93c5fd` | blue-300 — Beschreibungstext im Aktivzustand |
| `accentBlueNavy` | `#172554` | blue-950 — Effect-Pill-Aktivzustand |

Primärer Button-Gradient: `linear-gradient(135deg, #2563eb, #1d4ed8)`.

### 2.5 Spalten-Akzente (Bottom Dashboard, 3 Spalten)

| Spalte | Basis | Glow (Hintergrund) | Rand |
|---|---|---|---|
| Purple | `#a78bfa` | `rgba(167,139,250,0.15)` | `rgba(167,139,250,0.30)` |
| Cyan | `#67e8f9` | `rgba(103,232,249,0.15)` | `rgba(103,232,249,0.30)` |
| Emerald | `#6ee7b7` | `rgba(110,231,183,0.15)` | `rgba(110,231,183,0.30)` |

Muster: Basisfarbe für Icon-Rahmen, Spaltentitel und Hover-Textfarbe; `-glow` als
Hover-/Icon-Hintergrund; `-border` als Rand. Hover-Schatten ist die Basisfarbe mit
Alpha `0.08` und 16px Radius.

### 2.6 Status

| Token | Wert | Verwendung |
|---|---|---|
| `statusError` | `#f87171` / `#fca5a5` | Fehlermeldungen |
| `statusWarn` | `#f59e0b` | Warnung |
| `statusSuccess` | `#22c55e` | Erfolg |
| `scrollbarThumb` | `rgba(148,163,184,0.25)`, Hover `0.40` | Scrollbalken (`--bd-scrollbar-thumb`) |

---

## 3. Typografie

**Familien**

| Rolle | Stack | Gewichte (geladen) |
|---|---|---|
| Body | `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …` | 300/400/500/600/700 |
| Display | `'Space Grotesk', 'Inter', sans-serif` | 400/500/600/700 — **nur** im `--sn-*`-System (Kreativbibliothek) → in V1 nicht nötig |
| Mono | `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace` | Shortcut-Hints, Terminal-Ansichten |

> **Hybrid-Entscheidung offen**: Inter wird per Google-Fonts-CDN geladen. Nativ liegt
> `-apple-system` (SF Pro) ohnehin an erster Fallback-Stelle. Ob Inter mitgebündelt wird
> oder SF Pro genügt, entscheidet das Hybrid-UI-Mapping (#134).

**Größenskala** (aus den tatsächlich verwendeten Werten)

| Token | Wert | px @16 | Verwendung |
|---|---|---|---|
| `fontXXS` | `0.55rem` | 8,8 | Shortcut-Nummern-Badge |
| `fontXS` | `0.65rem` | 10,4 | Chord-Hints |
| `fontChip` | `0.70–0.74rem` | 11–12 | Menü-Chips |
| `fontCaption` | `0.75rem` | 12 | Zähler-Badges |
| `fontSM` | `0.875rem` | 14 | Tool-Namen, Sekundärtext |
| `fontColumnTitle` | `0.95rem` | 15,2 | Spaltenüberschriften |
| `fontBase` | `1rem` | 16 | Fließtext, Inputs |
| `fontTitle` | `1.2rem` → `1.5rem` ab 1024px | 19,2 → 24 | App-Titel |
| `fontToolEmoji` | `1.35rem` | 21,6 | Tool-Icons |

**Gewichte**: 400 (Body) · 500 (Tool-Namen, Buttons) · 600 (Badges, Modal-H2) · 700 (Titel, Spaltentitel)

**Laufweite**: `-0.01em` (Spaltentitel, Modal-H2) · `-0.015em` (App-Titel) · `0.03em` (Chord-Hints) · `0.15em` (`.tracking-widest`)

**Zeilenhöhe**: 1.1 (Titel) · 1.2 (Tool-Namen) · 1.4–1.5 (Fließtext) · 1 (Badges)

---

## 4. Radien

Es gibt **keine** durchgehende Skala im Hauptsystem — die faktisch genutzten Werte:

| Token | Wert | Verwendung |
|---|---|---|
| `radiusXS` | `4px` | Chord-Hints, Mikroelemente |
| `radiusSM` | `6px` | kleine Badges |
| `radiusMD` | `8px` | Spalten-Icons |
| `radiusLG` | `10px` | — |
| `radiusXL` | `12px` (18× — häufigster Wert) | Tool-Cards, Inputs, Buttons |
| `radius2XL` | `16px` | Action-HUD, kompakte Menüleiste |
| `radiusColumn` | `18px` | Dashboard-Spalten, Detail-Overlays |
| `radiusMenuBar` | `20px` | Top-Menüleiste |
| `radius3XL` | `24px` | Haupt-Panels (`.bottom-dashboard`), Modals |
| `radiusPill` | `9999px` | Chips, Slider-Tracks |
| `radiusCircle` | `50%` | Slider-Thumbs |

**Empfehlung für V1**: auf die Skala **4 / 8 / 12 / 16 / 18 / 24 / pill** normalisieren
(6px, 10px und 20px sind Ausreißer mit je <15 Vorkommen).

---

## 5. Abstände

Das Layout arbeitet mit einem **8px-Raster** (Tailwind-Erbe), im Bottom Dashboard sehr eng:

| Token | Wert | Verwendung |
|---|---|---|
| `space1` | `4px` | Tool-Listen-Gap |
| `space2` | `8px` | Panel-Padding, Grid-Gaps, Spalten-Gap, Header-Gap |
| `space3` | `12px` | Header-Padding horizontal, Card-Padding horizontal |
| `space4` | `16px` | Overlay-Padding vertikal |
| `space5` | `20px` | Overlay-Padding horizontal |
| `space6` | `24px` | Button-Padding horizontal |

Typische Kombinationen: Tool-Card `8px 12px` · Spalten-Header `8px 12px` ·
Menüleiste `8px 12px` (mobil `8px 10px`) · Menü-Chip `7px 11px` · Action-HUD `10px 16px`.

**Mindest-Touch-Target**: `44px` (WCAG 2.5.8), auf schmalen Screens auf 36px reduziert.

---

## 6. Glas-Effekte (Blur)

| Stufe | Blur | Hintergrund | Rand | Schatten |
|---|---|---|---|---|
| `glassSubtle` | `blur(10px)` | `rgba(15,23,42,0.90)` | `rgba(255,255,255,0.15)` | `0 10px 30px rgba(0,0,0,0.4)` |
| `glassStandard` | `blur(12px)` | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.08)` | `0 8px 32px rgba(0,0,0,0.3)` |
| `glassPanel` | `blur(16px)` | `rgba(15,23,42,0.25)` | `rgba(148,163,184,0.18)` | — |
| `glassMenuBar` | `blur(16px)` | `rgba(255,255,255,0.035)` | `rgba(255,255,255,0.10)` | `0 10px 26px rgba(0,0,0,0.32)` |
| `glassElevated` | `blur(24px)` | `rgba(10,15,30,0.90)` | `rgba(148,163,184,0.25)` | — |
| `glassModal` | `blur(24px)` | `rgba(10,10,15,0.95)` | `rgba(255,255,255,0.08)` | `0 25px 50px -12px rgba(0,0,0,0.7)` |

> **SwiftUI-Hinweis**: Diese sechs Stufen sind der stärkste Kandidat für natives
> `.background(.ultraThinMaterial / .thinMaterial / .regularMaterial)` — der genaue
> Zuschnitt gehört ins Hybrid-UI-Mapping (#134), nicht hierher.

---

## 7. Schatten & Glows

| Token | Wert | Verwendung |
|---|---|---|
| `shadowPanel` | `0 8px 32px rgba(0,0,0,0.30)` | Glaspanels |
| `shadowMenuBar` | `0 10px 26px rgba(0,0,0,0.32)` | Top-Bar |
| `shadowHUD` | `0 10px 30px rgba(0,0,0,0.40)` | Action-HUD |
| `shadowModal` | `0 25px 50px -12px rgba(0,0,0,0.70)` | Modals |
| `glowPrimary` | `0 0 20px rgba(37,99,235,0.50)` → Hover `0 0 30px …0.70` | Generate-Button |
| `glowPrimarySoft` | `0 4px 12px rgba(37,99,235,0.30)` → Hover `0 6px 20px …0.50` | Aktions-Buttons |
| `glowActive` | `0 0 40px rgba(59,130,246,0.15)` | aktiver Bereich |
| `glowSelected` | `0 0 15px rgba(59,130,246,0.15)` | ausgewählte Option-Card |
| `glowColumnHover` | `0 0 16px <Akzent> / 0.08` | Tool-Card-Hover |
| `focusRing` | `2px solid rgba(96,165,250,0.60)`, Offset `2px` | Tastaturfokus (global) |
| `focusRingInput` | zusätzlich `0 0 0 2px rgba(59,130,246,0.20)` | Eingabefelder |

---

## 8. Bewegung

**Easing**

| Token | Kurve | Verwendung |
|---|---|---|
| `easeUI` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard-Interaktionen (`--bd-ease-ui`) |
| `easeMajor` | `cubic-bezier(0.23, 1, 0.32, 1)` | Panel-Übergänge (`--bd-ease-major`) |
| `easeBounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Modal-Eintritt |

**Dauern**

| Token | Wert | Verwendung |
|---|---|---|
| `durationInstant` | `100–120ms` | Slider-Thumb, HUD |
| `durationFast` | `200ms` | Hover, Buttons, Tool-Cards |
| `durationNormal` | `300ms` | Modal-Öffnen, Detail-Overlay, Card-Stagger |
| `durationSlow` | `400ms` | Panel-Einblendung, Fade-In, Spaltenanimation |
| `durationDramatic` | `600ms` | Aktiv-/Inaktiv-Umschaltung von Bereichen |

**Stagger**: Dashboard-Spalten blenden mit 80ms / 160ms / 240ms Verzögerung ein.

**Interaktions-Transforms**

| Zustand | Transform |
|---|---|
| Card-Hover | `scale(1.02)` |
| Card-Active | `scale(0.98)` |
| Button-Press | `scale(0.97)` |
| Button-Hover | `translateY(-1px)`, KLUG-Button `translateY(-2px)` |
| Modal-Eintritt | `scale(0.95)` → `scale(1)` + Backdrop-Blur `0` → `12px` |
| Detail-Overlay | `translateY(8px) scale(0.97)` → `translateY(0) scale(1)` |
| Fade-In | `translateY(20px) + blur(5px)` → `translateY(0) + blur(0)` |

---

## 9. Zustände

| Zustand | Behandlung |
|---|---|
| **Hover** (Card) | Akzent-Glow-Hintergrund + Akzent-Rand + `scale(1.02)` + Textfarbe → Akzent |
| **Aktiv/Gedrückt** | `scale(0.97–0.98)` |
| **Ausgewählt** (Option-Card) | Hintergrund `rgba(37,99,235,0.15)`, Rand `#3b82f6`, Glow, Text `#ffffff`, Beschreibung `#93c5fd` |
| **Fokus (Tastatur)** | `outline: 2px solid rgba(96,165,250,0.6)`, Offset 2px — konsequent über `:focus-visible`, nie bei Maus |
| **Deaktiviert** (Button) | `opacity: 0.6`, kein Transform, kein Schatten, `cursor: not-allowed` |
| **Inaktiver Bereich** | `opacity: 0.4` + `grayscale(100%)`, Übergang 600ms |
| **Aktiver Bereich** | `opacity: 1`, `grayscale(0)`, Glow + blauer Rand |

> Der **inaktive** Zustand (`opacity 0.4` + Graustufe) ist direkt relevant für die in
> V1 geforderten „sichtbar, aber deaktiviert"-Einstiegspunkte von Kreativbibliothek,
> Stilsynchronisator und Klang Studio.

---

## 10. Z-Index-Skala

Aus `DESIGN_SYSTEM.md` (weiterhin gültig) plus tatsächliche Werte im Code:

| Ebene | Wert |
|---|---|
| Basis | `1` |
| Erhöht (Dropdowns, Overlays in Spalten) | `10` |
| Sticky | `50` |
| Modal | `100` |
| Feature-Panel | `150` |
| Overlay | `180` |
| System | `200` |
| Action-HUD | `210` |
| Skip-Link | `9999` |

In SwiftUI wird das größtenteils durch `.sheet`, `.zIndex` und Overlay-Hierarchie ersetzt —
die Skala dient nur als Ordnungsnachweis, welche Ebenen es gibt.

---

## 11. Archiv: ausgeschlossene Sub-Systeme

Nur zur Referenz, **nicht** für V1.

**Spectrum Navigator (`--sn-*`, Kreativbibliothek)** — eigenes Blau-Violett-System:
Hintergründe `#0a0a18` / `rgba(14,14,30,0.85)` / `rgba(18,18,40,0.72)`; Text
`#e8e8f0 / #9898b0 / #5e5e78`; Akzente Blau `#4a7cff`, Cyan `#22d3ee`, Violett `#a855f7`,
Amber `#f59e0b`, Grün `#22c55e`, Rose `#f43f5e`; sechs Gruppenfarben (Orchestra `#d4a04a`,
Ambient `#4a8cd4`, Urban `#22d3ee`, HipHop `#a855f7`, World `#5cb85c`, Sound `#e87040`);
**eigene Radienskala** 6/10/16/24px; Display-Font Space Grotesk; Reader-Schriftgröße
`13.5px` (persistiert in localStorage).

**Klang Studio (`--ks-*`)** — Cyan-System: Primär `#06b6d4` (hell `#22d3ee`, dunkel `#0891b2`),
Akzent Teal `#14b8a6`, Glow `rgba(6,182,212,0.3/0.5)`; Modulfarben Synth `#8b5cf6`,
Orchestra `#f59e0b`, Blender `#ec4899`, Vocal `#10b981`, Rhythm `#ef4444`, Ambient `#6366f1`.

---

## 12. Offene Punkte fürs Hybrid-UI-Mapping (#134)

Dieser Katalog beschreibt, **was da ist** — nicht, was davon nativ wird. Explizit
weitergereicht:

1. **Materials vs. exakte Glaswerte**: Sechs Blur-Stufen vs. SwiftUI-`Material` — 1:1
   nachbauen oder auf native Materials abbilden?
2. **Hintergrund-Gradients**: Die drei fixierten Radial-Gradients sind stark
   wiedererkennbar. Übernehmen oder gegen `NSVisualEffectView`/Fenstermaterial tauschen?
3. **Inter vs. SF Pro**: Font mitbündeln oder Systemschrift?
4. **Fokusringe**: eigener blauer Ring vs. macOS-Systemakzentfarbe (Nutzer kann diese
   in den Systemeinstellungen ändern).
5. **Radien-Normalisierung**: Vorschlag 4/8/12/16/18/24/pill — muss bestätigt werden.
6. **Spalten-Akzente Purple/Cyan/Emerald**: identitätsstiftend, hängen aber am
   3-Spalten-Dashboard-Layout — überlebt das Layout die Portierung?
