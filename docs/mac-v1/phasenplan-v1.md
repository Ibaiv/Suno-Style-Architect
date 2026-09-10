# Phasenplan V1 — Cue (native macOS-App)

**Status:** Abschluss-Artefakt der Wayfinder-Karte [Native macOS-App (V1-Spezifikation)](https://github.com/Ibaiv/Suno-Style-Architect/issues/130).
**Entstanden:** 2026-07-24, aus [Ticket: Phasenplan V1 mit Einzeltickets](https://github.com/Ibaiv/Suno-Style-Architect/issues/137).

Dieses Dokument ist der Bauplan für die Implementierung. Es entscheidet nichts neu — es ordnet die elf Entscheidungen der Karte in eine Reihenfolge und schneidet sie in Tickets.

---

## Wie dieser Plan zu lesen ist

**Sechs Phasen, ein Durchstich zuerst.** Phase 1 baut einen dünnen, aber vollständigen Weg von der Eingabe bis zum committeten Ergebnis. Jede weitere Phase ist eine vertikale Scheibe: sie endet mit einer App, die man benutzen kann, nicht mit einer Schicht, die auf ihre Oberfläche wartet.

**Tickets sind grobe Brocken.** Jedes Ticket nennt **Ziel** und **Abnahme** — nicht seine Schritte. Wie ein Ticket in Sessions zerfällt, entscheidet die implementierende Session; der Plan schreibt es nicht vor. 17 Tickets über sechs Phasen.

**Tests sind Abnahme, keine Phase.** Nach [Teststrategie für V1](https://github.com/Ibaiv/Suno-Style-Architect/issues/145) §8 gibt es keine Testphase am Ende. Jedes Ticket, das getestete Mechanik berührt, trägt seine Tests in der Abnahme; UI-nahe Tickets tragen stattdessen konkrete Rauchtest-Schritte.

**Zwei Dinge wachsen quer durch alle Phasen mit:**

- der **ActionCatalog** — jede Phase trägt ihre Aktionen dort ein, statt Buttons direkt zu verdrahten (siehe [Shortcut- & Aktions-Architektur](https://github.com/Ibaiv/Suno-Style-Architect/issues/143));
- die **Testsuite** — sie ist ab Phase 1 vorhanden und muss am Ende jeder Phase grün sein.

**Quellen.** Jedes Ticket verweist auf die Entscheidung, aus der es stammt. Die Karte und ihre elf geschlossenen Tickets sind die Spezifikation; dieser Plan wiederholt sie nicht.

| Kürzel | Ticket |
|---|---|
| **Inventur** | [Feature-Inventur der Web-App für V1](https://github.com/Ibaiv/Suno-Style-Architect/issues/131) |
| **API** | [API-Spezifikation OpenRouter & fal.ai](https://github.com/Ibaiv/Suno-Style-Architect/issues/132) |
| **Token** | [Design-Token-Extraktion aus styles.css](https://github.com/Ibaiv/Suno-Style-Architect/issues/133) |
| **UI** | [Hybrid-UI-Mapping Web → SwiftUI](https://github.com/Ibaiv/Suno-Style-Architect/issues/134) |
| **Arch** | [Architektur & Persistenz der Mac App](https://github.com/Ibaiv/Suno-Style-Architect/issues/135) |
| **Setup** | [Projekt-Setup-Spezifikation neues Repo](https://github.com/Ibaiv/Suno-Style-Architect/issues/136) |
| **Name** | [App- und Repo-Name für die Mac App](https://github.com/Ibaiv/Suno-Style-Architect/issues/140) |
| **Bereinigung** | [Web-Inkonsistenzen — 1:1 übernehmen oder bereinigen?](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) |
| **Aktionen** | [Shortcut- & Aktions-Architektur](https://github.com/Ibaiv/Suno-Style-Architect/issues/143) |
| **Verlauf** | [Verlaufseinträge um Eingaben anreichern?](https://github.com/Ibaiv/Suno-Style-Architect/issues/144) |
| **Tests** | [Teststrategie für V1](https://github.com/Ibaiv/Suno-Style-Architect/issues/145) |

---

## Überblick

| Phase | Ziel | Tickets |
|---|---|---|
| **1 — Durchstich & Fundament** | Die App generiert einmal wirklich etwas, im richtigen Layout und im richtigen Look. | 4 |
| **2 — Werkzeug-Maschinerie & Dashboard** | Die Dashboard-Werkzeuge laufen über eine generische Pipeline. | 3 |
| **3 — Abläufe mit eigener Logik** | Alles, was mehr ist als „Prompt anwenden" — inklusive Bild-Spur. | 3 |
| **4 — Verlauf & Herkunft** | Der Verlauf wird zum Reproduktionsprotokoll. | 2 |
| **5 — Aktions-Oberflächen** | Palette, Chords und Cheat-Sheet aus dem vollen Katalog. | 2 |
| **6 — Feinschliff & V1-Abnahme** | Cue ist funktional das, was die Web-App ist — minus der drei ausgeschlossenen Module. | 3 |

---

# Phase 1 — Durchstich & Fundament

**Ziel:** Ein leeres, aber vollständig aufgebautes Cue-Fenster, in dem Vision und Lyrics zu einem echten OpenRouter-Aufruf führen und das Ergebnis atomar im Meisterstück landet. Look, Layout, Persistenz, Fehlermodell und Testgerüst stehen ab hier — jede spätere Phase füllt nur noch Flächen.

**Warum zuerst:** Der Durchstich beweist die riskanteste Annahme der Karte in einem Zug — dass Workbench, Spuren-Modell, atomares Commit und der Netz-Layer so zusammenspielen, wie [Arch](https://github.com/Ibaiv/Suno-Style-Architect/issues/135) es beschreibt. Alles danach ist Wiederholung eines bewiesenen Musters.

**Verifikation der Phase:**

1. App startet aus Xcode auf macOS 27, Fenster mindestens 1280×800.
2. Ohne hinterlegten Key: freundlicher Leerzustand, „Generieren" deaktiviert — kein Blocker-Modal ([UI](https://github.com/Ibaiv/Suno-Style-Architect/issues/134)).
3. Key in den Einstellungen (⌘,) hinterlegen → Vision eintippen → Generieren → echter Text erscheint **in einem Schritt**, ohne Zwischenzustand im Ergebnisfeld.
4. ⌘Z macht die Übernahme rückgängig, ⇧⌘Z stellt sie wieder her.
5. App beenden und neu starten → Ergebnistext, Vision und Lyrics sind wieder da.
6. Suite grün.

### T1.1 — Repo, Xcode-Projekt und Doku-Gerüst

**Ziel:** Das private Repo `Cue` unter `github.com/Ibaiv` existiert mit klassischem Xcode-Projekt (ein App-Target, Deployment-Target macOS 27, Bundle-ID `com.ibaiv.Cue`), der Ordnerstruktur `App/` · `Features/` · `Core/`, dem Test-Target `CueTests` und dem Doku-Layout aus [Setup](https://github.com/Ibaiv/Suno-Style-Architect/issues/136): im Root nur `README.md`, `CLAUDE.md`, `AGENTS.md`, alles andere in `docs/`. Die fünf Artefakte dieser Karte (Feature-Inventur, API-Spezifikation, Design-Token, UI-Mapping, dieser Phasenplan) wandern nach `docs/`. `CLAUDE.md`/`AGENTS.md` halten die Regel fest, dass neue Markdown-Dateien nie im Root entstehen, und nennen den lokalen Pfad des Web-Repos zum Nachschlagen im Original-JS.

**Abnahme:**
- Leeres Fenster mit Titel „Cue" startet aus Xcode.
- Keine Third-Party-Dependency im Projekt.
- `docs/` enthält die fünf Artefakte; Root enthält genau die drei erlaubten Markdown-Dateien.
- Swift-6-Sprachmodus mit strikter Concurrency und Default-MainActor-Isolation ist aktiv ([Arch](https://github.com/Ibaiv/Suno-Style-Architect/issues/135) §3).

### T1.2 — Theme, Glas-Container und die App-Shell

**Ziel:** Die sichtbare Hülle, web-getreu nach [UI](https://github.com/Ibaiv/Suno-Style-Architect/issues/134) und mit den Werten aus dem [Token-Katalog](https://github.com/Ibaiv/Suno-Style-Architect/issues/133): eine Theme-Schicht (Farben, Radienskala 4/8/12/16/18/24/pill, Spacing, SF-Pro-Stufen, Cue-blauer Fokusring), ein wiederverwendbarer Glas-Container und der Hintergrund (#050510 plus drei Radial-Gradients, fest dunkel, keine System-Materials). Darauf das Drei-Spalten-Layout (Vision / Meisterstück / Kreativ-Stack) mit dem 67/33-Splitter (25–85 %, Doppelklick-Reset), dem Bottom-Dashboard-Collapse (Default eingeklappt) und dem Vision-Fokus-Modus — alle drei Zustände persistiert. Der Kreativ-Stack besteht in V1 vollständig aus vier deaktivierten Kacheln (Kreativbibliothek, Stil-Synchronisator, Klang-Studio, Universum) im „Coming Soon"-Look. Ein `Window` plus `Settings`-Szene, keine `WindowGroup`; keine responsiven Breakpoints.

**Abnahme (Rauchtest):**
- Fenster zeigt drei Spalten im Neon-Glass-Look; Screenshot-Vergleich mit der laufenden Web-App zeigt dieselbe Anmutung.
- Splitter ziehen → Verhältnis ändert sich, Doppelklick setzt zurück; Dashboard auf-/zuklappen; ⌥A schaltet den Vision-Fokus.
- App neu starten → alle drei Zustände sind wie zuvor.
- Alle vier Kreativ-Kacheln sind grau, ohne Hover, nicht klickbar.

### T1.3 — Netz-Layer, Keychain und Einstellungen

**Ziel:** Der Chat-Call gegen OpenRouter nach [API](https://github.com/Ibaiv/Suno-Style-Architect/issues/132), als **eine** `nonisolated async`-Methode für alle späteren Textfeatures (Sampling-Parameter global identisch, `max_tokens` auf ~4000 angehoben nach [Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 8a, 60-s-Timeout, kein automatischer Retry, feste `HTTP-Referer`-Kennung). Ein `enum APIError` klassifiziert **an der Fehlerquelle** statt per Regex aus dem Fehlertext, mit den wortgleichen deutschen Meldungen. Beide Keys im Keychain hinter einem eigenen Mini-Wrapper um die Security-API. Native Settings-Scene (⌘,) mit Key-Eingabe und Modellauswahl. Protokoll-Naht am Netzwerk, damit der Fake der Suite andocken kann.

**Abnahme:**
- Parametrisierter Test über alle elf deutschen Fehlertexte (neun aus [API](https://github.com/Ibaiv/Suno-Style-Architect/issues/132) §6 plus die zwei Vorab-Meldungen für fehlende Keys) — wortgleich.
- Test je Fehlerquelle: 401 / 403 / 404 / 429 / ≥500, URLError, Timeout, Cancellation → erwarteter `APIError`-Fall.
- Rauchtest: Key eingeben, App neu starten, Key ist noch da; falschen Key eingeben → die richtige deutsche Meldung erscheint.

### T1.4 — Workbench, Text-Spur, Stores und Testgerüst

**Ziel:** Das Herz nach [Arch](https://github.com/Ibaiv/Suno-Style-Architect/issues/135): ein `@MainActor @Observable`-Kernmodell **Workbench** als **einziger Schreibpfad** auf das Ergebnisfeld, mit atomarem Commit (Undo-Eintrag über den nativen `UndoManager`, Verlaufs-Hook, UI-Update in einem Schritt) — das Ergebnisfeld wird erst berührt, wenn die Antwort vollständig geparst und bereinigt ist ([Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 10). Die **Text-Spur** als Single-Flight-Bahn mit Schnappschuss-Eingabe und Abbruch per Task-Cancellation; die Spur ist generisch angelegt, die Bild-Spur kommt in Phase 3 als zweite Instanz dazu. Store-Schicht: skalare Präferenzen in UserDefaults (ein Schlüssel pro Wert, keine Legacy-Aliase), strukturierte Sammlungen als versionierte, atomar geschriebene Codable-JSON-Dateien in Application Support; der Arbeitszustand (Ergebnistext, Vision, Lyrics, Sperr-Flag) überlebt den Neustart. Kompositionswurzel in `CueApp`, Durchreichen per `.environment(...)`, keine Singletons. ActionCatalog-Gerüst mit den ersten Aktionen (Generieren, Kopieren, Rückgängig) und die daraus erzeugte Menüleiste. Dazu das Testgerüst: Test-Target, Netz-Fake **mit steuerbaren Gattern** (keine zeitbasierte Steuerung) und der temp-Verzeichnis-Helfer für echte Dateisystem-Tests.

**Abnahme:**
- Spuren-Regeln 1, 3 und 4 aus [Tests](https://github.com/Ibaiv/Suno-Style-Architect/issues/145) §3 gattergesteuert getestet: Single-Flight, Abbruch (kein Commit, Status sauber, Nutzer-Abbruch bleibt vom Timeout unterscheidbar), Schnappschuss. Regel 2 (Parallelität) folgt mit der Bild-Spur in Phase 3.
- Store-Tests: Codable-Roundtrip, Versionsfeld wird geschrieben und gelesen, fehlende Datei → definierter Leerzustand, korrupte Datei → definierter Umgang statt Absturz, unbekannte Version → definierter Umgang, atomares Schreiben hinterlässt nie einen Teilzustand, Arbeitszustand überlebt einen simulierten Neustart.
- Unit-Test auf Doppelbelegungen im ActionCatalog (läuft ab hier dauerhaft mit).
- Rauchtest: Generieren → Text erscheint in einem Schritt → ⌘Z → ⇧⌘Z; während des Laufs ist Abbrechen sichtbar und funktioniert.

---

# Phase 2 — Werkzeug-Maschinerie & Dashboard

**Ziel:** Die Dashboard-Werkzeuge, die reine Prompt-Anwendungen sind, laufen alle über **eine** generische Pipeline. Damit ist der Großteil der App funktional da.

**Warum hier:** Die Pipeline ist die zweite Hälfte der Architektur-Wette aus [Arch](https://github.com/Ibaiv/Suno-Style-Architect/issues/135) §2 — dass ein Werkzeug fast nur sein System-Prompt ist. Sie muss stehen, bevor die Sonderabläufe in Phase 3 sich darüber legen können.

**Verifikation der Phase:**

1. Dashboard aufklappen → drei Spalten (Experten purpur, KLUG cyan, Future Lab smaragd) mit allen Kacheln.
2. Ein Experten-Werkzeug öffnen → Detail erscheint **inline in seiner Spalte**, Slider bedienen, anwenden → Ergebnis erscheint, ⌘Z macht es rückgängig.
3. Ein KLUG-Werkzeug öffnen → Vorschlagsliste lädt automatisch, mehrere auswählen, anwenden → Ergebnis erscheint.
4. Vor der ersten Generierung sind alle Werkzeuge deaktiviert (nicht stumm) — außer denen, die es laut Inventur nicht sein dürfen.
5. Suite grün.

### T2.1 — ToolCatalog: die Prompts wörtlich portieren

**Ziel:** Der statische `ToolCatalog` aus `Tool`-Werttypen (stabile Identität, Emoji, Name, Beschreibung, Spalte, System-Prompt, `ResponseContract`) und die **wörtliche** Portierung der Prompt-Konstanten samt der zwei Datentabellen für Genre-Evolution. Die Wörtlichkeit wird **einmalig beim Portieren per Diff gegen die Feature-Inventur** geprüft; danach ist der Swift-Code die Quelle der Wahrheit ([Tests](https://github.com/Ibaiv/Suno-Style-Architect/issues/145) §7). Der als faktisch defekt markierte Eintrag `fal-ai/flux-pro/kontext` wird nicht übernommen ([API](https://github.com/Ibaiv/Suno-Style-Architect/issues/132)).

> **Zu klären in diesem Ticket:** Die Inventur nennt in ihrem Kern-Satz 4 „44 anwendbare Werkzeuge", ihre eigene Aufschlüsselung ergibt aber 36 (9 Experten + 13 KLUG + 7 Future Lab = 29 Dashboard-Werkzeuge, plus Ideen-Funke, Sound-Ingenieur, Eigene Anweisung, Suno Pro, Auto-Kürzen, Visueller Funke, Genre-Evolution). Die tatsächliche Zahl wird beim Portieren aus `features.js` und `prompts.js` festgestellt und **im Invariantentest festgeschrieben** — sie ist danach nicht mehr strittig.

**Abnahme:**
- Katalog-Invarianten getestet: eindeutige IDs, nicht-leerer System-Prompt, gültiger `ResponseContract`, Spalte gesetzt, **erwartete Anzahl** (die im Ticket festgestellte).
- Diff-Protokoll der Prompt-Wörtlichkeit liegt der PR bei.

### T2.2 — ResponseContracts und die generische Pipeline

**Ziel:** Das `ResponseContract`-Enum mit den drei Vertragsformaten — Freitext ≤800 Zeichen, JSON-Ideenliste, `PROMPT:---NOTES:` — jeweils mit vollständiger Fallback-Parsing-Kette inklusive des JSON-Reparatur-Zweitcalls. Darüber die generische Ausführungs-Pipeline: Nutzertext bauen → Chat-Call auf der Text-Spur → Vertrag parsen → atomar committen. Erfundene Bewertungen entfallen: scheitert das Parsing einer Ideenliste, werden extrahierbare Vorschläge **ohne** Bewertung gezeigt (Score-Spalte „–"), sonst greift das Fehlermodell ([Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 3).

**Abnahme:**
- Pro Vertrag synthetische Fixtures: Happy Path, je eine Antwort, die **genau eine Stufe** der Fallback-Kette auslöst, und die unrettbare Antwort.
- Für die Ideenliste zusätzlich der Reparatur-Zweitcall in allen drei Ausgängen: wird ausgelöst / gelingt / scheitert — über den Netz-Fake beobachtbar.
- Test: eine unparsbare Ideenliste erzeugt **nie** einen erfundenen Score.

### T2.3 — Dashboard, Inline-Detail und die Prompt-Werkzeuge

**Ziel:** Das Bottom-Dashboard mit den drei farbakzentuierten Spalten und den Kacheln; das Tool-Detail öffnet **inline in der jeweiligen Spalte** — das funktionale Äquivalent der Web-Portal-Mechanik — aus jedem Einstiegsweg. Die Werkzeuge, die reine Prompt-Anwendungen sind (Experten-Slider, Sound-Ingenieur, die KLUG-Listen, die Future-Lab-Tools ohne Sonderlogik), laufen über die Pipeline. Die `ToolLibrary` mit Favoriten, Reihenfolge und Ketten. Alle Werkzeug-Aktionen werden im ActionCatalog registriert. Vorbedingungen **deaktivieren** den auslösenden Knopf statt still abzubrechen ([Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 2); Fehler erscheinen dort, wo die Aktion ausgelöst wurde.

**Abnahme (Rauchtest):**
- Werkzeug per Kachel öffnen → Detail inline in der Spalte → anwenden → Ergebnis → ⌘Z.
- Leeres Ergebnisfeld → die Werkzeug-Knöpfe sind sichtbar deaktiviert, nicht stumm.
- Netz aus → beim Anwenden erscheint die Fehlermeldung im geöffneten Detail, nicht in der Konsole.
- Favorit setzen, Reihenfolge ändern, App neu starten → beides ist erhalten (`toolLibrary.json`-Roundtrip getestet).

---

# Phase 3 — Abläufe mit eigener Logik

**Ziel:** Alles, was mehr ist als „Prompt anwenden": die Bild-Spur mit fal.ai und dem Vision-Call, dazu die sieben textlichen Sonderabläufe.

**Warum hier:** Die Trennlinie ist generisch gegen speziell. Diese Abläufe legen sich **über** die Pipeline aus Phase 2 — sie brauchen sie, und sie sind der Beweis, dass sie trägt.

**Verifikation der Phase:**

1. Bild generieren (fal.ai) → Bild erscheint; während es läuft, funktioniert ein Textwerkzeug parallel weiter.
2. Bild analysieren (Vision) → Beschreibung landet über den Schreibpfad im Ergebnisfeld.
3. Ideen-Funke ohne erzeugten Prompt → drei Konzepte erscheinen.
4. Narrative Chapters durchspielen; Modal schließen und wieder öffnen → Eingaben und letztes Ergebnis sind noch da.
5. Suite grün.

### T3.1 — Bild-Spur: fal.ai, Bildmodelle und der Visuelle Funke

**Ziel:** Der synchrone fal.ai-Call nach [API](https://github.com/Ibaiv/Suno-Style-Architect/issues/132) mit den exakten Payload-Formen je Bildmodell, dem Retry (408/429/5xx, zwei Versuche, 2 s/4 s plus Jitter) und 120-s-Timeout — **ohne** die drei Web-Heuristiken (Endpunkt-Kandidatensuche, Payload-Durchprobieren bei 400/422, `Key`→`Bearer`-Fallback), die nur echte Fehler verschleiern. Die **Bild-Spur** als zweite Instanz des Spuren-Modells: parallel zur Text-Spur, in sich Single-Flight, abbrechbar, mit Schnappschuss-Eingabe. Der Visuelle Funke als Sheet: Bild generieren, Bild analysieren (der einzige Vision-Aufruf in V1, über dasselbe Modell wie Text), Ergebnis zurück ins Meisterstück über den Schreibpfad. Keine Medien-Persistenz in V1 — die fal-URL verfällt wie im Web; die Spur liefert ihr Ergebnis als sauberen Artefakt-Wert ([Arch](https://github.com/Ibaiv/Suno-Style-Architect/issues/135) §5).

**Abnahme:**
- Spuren-Regel 2 aus [Tests](https://github.com/Ibaiv/Suno-Style-Architect/issues/145) §3 getestet: Bild-Spur läuft neben der Text-Spur, ohne sie zu blockieren.
- Test: Abbruch eines laufenden Bild-Laufs committet nichts und hinterlässt sauberen Status.
- Rauchtest gegen den **echten** Endpunkt aus der laufenden App: ein Bild generieren, ein Bild analysieren.

### T3.2 — Textliche Sonderabläufe

**Ziel:** Ideen-Funke (JSON-Ideenliste, läuft ohne erzeugten Prompt), Synth-Designer Lab (fünfschrittige geführte Auswahl, hängt ihr Ergebnis **an** statt zu ersetzen), Narrative Chapters (der aufwändigste Ablauf), Eigene Anweisung, Suno Pro, Auto-Kürzen und Genre-Evolution — jeweils als eigener Ablauf-Typ **über** der Pipeline aus Phase 2. Auto-Kürzen wird ein normaler Undo-Schritt statt eines Ein-Ebenen-Sonderfalls ([Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 9). Ihre Aktionen kommen in den ActionCatalog.

**Abnahme:**
- Test je Ablauf, dass er den richtigen `ResponseContract` verwendet und über den Schreibpfad committet.
- Rauchtest: Ideen-Funke bei leerem Ergebnisfeld liefert drei Konzepte; Synth-Designer hängt an, ersetzt nicht; Auto-Kürzen ist mit einem ⌘Z rückgängig.

### T3.3 — Einheitliche Sheet-Mechanik und Modal-Politik

**Ziel:** Der gemeinsame Cue-Glas-Sheet-Container für alle Sheet-Präsentationen, mit der einheitlichen Modal-Politik aus [Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 4: alle Sheets behalten Eingaben **und** letztes Ergebnis für die App-Session, kein Reset beim Wiederöffnen, ein expliziter „Zurücksetzen"-Knopf pro Sheet, keine Persistenz über Neustarts. Das Caching der Narrative Chapters wird damit Normalfall statt Sonderfall. Tastenverhalten in Sheets bleibt rein nativ: fokussierter Slider reagiert auf Pfeiltasten, Anwenden-Knopf ist `.defaultAction`, Escape und ⌘W schließen immer — unabhängig vom Öffnungsweg ([Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 7). Kein Ziffern-Sprung, kein Close-Stack, kein Focus-Trap.

**Abnahme (Rauchtest):**
- Sheet öffnen, Eingaben machen, schließen, wieder öffnen → alles noch da; „Zurücksetzen" leert es.
- Escape schließt jedes Sheet aus jedem Öffnungsweg; verschachtelte Sheets schließen LIFO.
- Slider fokussieren → Pfeiltasten ändern den Wert; Enter löst Anwenden aus.

---

# Phase 4 — Verlauf & Herkunft

**Ziel:** Der Verlauf ist ein Reproduktionsprotokoll: jeder Eintrag hält fest, was ihn tatsächlich erzeugt hat.

**Warum hier:** Die Herkunftserfassung hängt am Workbench-Commit und an der Schnappschuss-Regel der Spuren ([Verlauf](https://github.com/Ibaiv/Suno-Style-Architect/issues/144)) — sie braucht alle committenden Läufe aus den Phasen 2 und 3, um vollständig zu sein.

**Verifikation der Phase:**

1. Mehrere Werkzeuge nacheinander anwenden → jeder Lauf erzeugt genau einen Eintrag, mit Werkzeug-Badge und Vorgängerverweis.
2. Eine Generierung erzeugt einen Eintrag mit Vision und Lyrics; Ausklappen zeigt beides plus Modell-ID.
3. Wiederherstellen setzt Text und Eingaben — **ein** ⌘Z macht die komplette Wiederherstellung rückgängig; es entsteht **kein** neuer Eintrag.
4. Exportieren, Verlauf leeren, importieren → alles zurück; ein zweiter Import verdoppelt nichts.
5. Suite grün.

### T4.1 — HistoryStore, Herkunftsmodell und Export/Import

**Ziel:** Die Modelltypen aus [Verlauf](https://github.com/Ibaiv/Suno-Style-Architect/issues/144) §2 (`HistoryEntry` mit `modelID` und `Origin`-Enum aus `.generation(vision:lyrics:)` und `.transformation(toolID:predecessor:)`), die Erfassung **beim Laufstart** statt beim Commit, die Ehrlichkeitsregel für den Vorgänger (`nil`, wenn der Ergebnistext beim Laufstart nicht mehr dem obersten Eintrag entspricht), der Duplikat-Schutz, die Kappung bei **200** mit unbeschnittenen Favoriten, und der versionierte, zusammenführende Export/Import-Codec (Deduplizierung über die UUID, unauflösbare Vorgängerverweise werden auf `nil` normalisiert, alte Web-Exporte werden mit klarer Meldung abgelehnt). Einträge entstehen ausschließlich bei echten KI-Commits — nicht beim Wiederherstellen, nicht bei manuellen Bearbeitungen; Duplizieren entfällt als Aktion.

**Abnahme:**
- Tests: Kappung bei 200, Favoriten werden nie beschnitten, Duplikat-Schutz greift, `predecessor` wird bei manueller Bearbeitung korrekt `nil`, Import führt zusammen statt zu ersetzen, unauflösbare Verweise werden normalisiert, alter Web-Export wird abgelehnt, Codable-Roundtrip verlustfrei.

### T4.2 — Verlaufs-Slide-over

**Ziel:** Das Verlaufs-Panel als Slide-over von rechts mit Backdrop (Klick außerhalb schließt) — bewusst **kein** nativer Inspector ([UI](https://github.com/Ibaiv/Suno-Style-Architect/issues/134)). Die Zeile bleibt web-getreu (Ergebnis-Anriss, Datum, Vision-Anriss) plus Herkunfts-Badge; Ausklappen zeigt vollständige Vision, Lyrics, Modell-ID und den Sprung zum Vorgänger. Favoriten-Stern, Wiederherstellen als **eine** UndoManager-Gruppe (bei `.generation` samt Vision und Lyrics, bei `.transformation` nur der Text), Export/Import-Aktionen. Alles im ActionCatalog registriert.

**Abnahme (Rauchtest):**
- Verlauf öffnen → Zeilen sind gleich hoch und überfliegbar; eine Zeile ausklappen → Details erscheinen.
- Vorgänger-Sprung führt zum richtigen Eintrag.
- Wiederherstellen einer Generierung setzt Text, Vision und Lyrics; ein ⌘Z nimmt alles zurück.

---

# Phase 5 — Aktions-Oberflächen

**Ziel:** Palette, Chords und Cheat-Sheet — drei Oberflächen auf den inzwischen vollständigen ActionCatalog.

**Warum hier:** Der Katalog ist seit Phase 1 mitgewachsen und erst jetzt vollständig. Diese Phase baut nur noch Sichten darauf; sie verdrahtet nichts neu.

**Verifikation der Phase:**

1. ⌘K → Palette öffnet, Fuzzy-Suche über fünf Gruppen, Enter löst aus.
2. ⌥E → Keycaps erscheinen über den Experten-Kacheln, Ziffer öffnet das Werkzeug; Escape verlässt den Modus.
3. Chord mit mehr als neun Zielen → `0` blättert weiter.
4. Cheat-Sheet zeigt jede Belegung, die es tatsächlich gibt.
5. Menüleiste ist vollständig; die ausgeschlossenen Module erscheinen sichtbar, aber deaktiviert.
6. Suite grün.

### T5.1 — Befehlspalette und Chord-Modus

**Ziel:** Das ⌘K-Palette-Overlay (web-getreu, Fuzzy-Suche, fünf Gruppen) und die Chords **⌥E / ⌥K / ⌥F** nach [Aktionen](https://github.com/Ibaiv/Suno-Style-Architect/issues/143): innerhalb des Modus nackte Ziffern `1`–`9` plus `0` zum Blättern, Keycap-Overlay, **kein Timer** — der Modus endet durch Ziffernwahl, Escape, eine andere Taste oder Fensterfokus-Verlust. Genau ein Chord-Modus-Flag im Modell, kein Scope-Stack, keine Prioritäten, kein Scope-Indikator. Ziffern über `.onKeyPress` an der Fenster-Wurzel, wodurch der Tipp-Schutz nativ anfällt. **Implementierungs-Randbedingung:** Auf deutschem Layout erzeugt ⌥+Buchstabe Sonderzeichen (⌥e ist ein Dead Key) — es muss auf den physischen Key beziehungsweise `charactersIgnoringModifiers` gematcht werden, nicht auf das erzeugte Zeichen. Der Navigations-Chord `v` wird nicht gebaut.

**Abnahme:**
- Test: Chord-Modus-Flag wird durch jeden der vier Ausstiegswege zurückgesetzt.
- Rauchtest: In ein Textfeld tippen → Ziffern landen im Text, lösen keinen Chord aus. ⌥E auf deutschem Layout startet den Chord, ohne ein Sonderzeichen einzufügen. ⌥K mit mehr als neun Zielen → `0` blättert.
- Palette und Menüleiste zeigen dieselbe Aktion mit derselben Belegung (beide aus dem Katalog erzeugt).

### T5.2 — Vollständige Menüleiste, Cheat-Sheet und Coming-Soon-Einträge

**Ziel:** Die Menüleiste aus [UI](https://github.com/Ibaiv/Suno-Style-Architect/issues/134) (Datei / Bearbeiten / Darstellung / Werkzeuge / Hilfe) vollständig aus dem ActionCatalog erzeugt, dazu die Fenster-Toolbar mit den Modell-Popups, dem Verlauf-Umschalter und dem Einstellungen-Zugang. Das Cheat-Sheet als Sheet, **aus der Registry generiert** statt statisch gepflegt. Die ausgeschlossenen Module erscheinen in Palette und Menü sichtbar, aber deaktiviert („kommt später"); ihre Shortcuts (⌘Y, ⌘L) und Nav-Chords werden nicht registriert. Der Palette-Eintrag „Ideen-Funke" führt zum Ideen-Funke-Sheet, nicht zur Kreativbibliothek ([Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 6); ⌘D schaltet denselben einen Sichtbarkeitszustand wie der Collapse-Knopf (Punkt 5).

**Abnahme:**
- Test: Das Cheat-Sheet listet exakt die Aktionen des Katalogs — kein Eintrag mehr, keiner weniger.
- Test: Für die drei ausgeschlossenen Module ist keine Tastenbelegung registriert.
- Rauchtest: ⌘D und der Collapse-Knopf schalten denselben Zustand; jeder Menüeintrag löst aus, was sein Name sagt.

---

# Phase 6 — Feinschliff & V1-Abnahme

**Ziel:** Cue ist funktional das, was die Web-App ist — minus Kreativbibliothek, Stilsynchronisator und Klang Studio. Was erst im Gesamtbild auffällt, wird hier behoben.

**Warum am Ende:** Fehlermodell, Leerzustände und Optik lassen sich nur beurteilen, wenn alle Flächen existieren. Und der Vergleich mit der laufenden Web-App braucht eine vollständige App auf der anderen Seite.

**Verifikation der Phase:** die Abnahme-Checkliste aus T6.3.

### T6.1 — Fehlermodell, Leerzustände und Deaktiviert-Logik durchgängig

**Ziel:** Ein Durchgang durch jede Aktion der App gegen die Linie aus [Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142): Fehler erscheinen **immer** dort, wo die Aktion ausgelöst wurde — Inline-Fehlerzeile im Sheet, Toast oder Banner bei sheetlosen Aktionen; nie stumm, nie nur in der Konsole, nie eine Nutzereingabe überschreibend. Vorbedingungen deaktivieren konsequent den auslösenden Knopf. Leerzustände: kein Key hinterlegt, leeres Ergebnisfeld, leerer Verlauf, leeres Bildergebnis. Das eigene Toast-System und die Inline-Fehlerbox nahe dem Ergebnisfeld; keine `NSAlert`-Dialoge für Routinefehler.

**Abnahme:**
- Checkliste: jede Aktion einmal in den Fehler getrieben (Netz aus, falscher Key, Timeout) → die Meldung erscheint an der richtigen Stelle.
- Kein Codepfad mehr, der einen Fehler nur in die Konsole schreibt.

### T6.2 — Optik-Politur gegen den Token-Katalog

**Ziel:** Abstände, Radien, Zustände (Hover, Fokus, Deaktiviert) und Animationen der ganzen App gegen den [Token-Katalog](https://github.com/Ibaiv/Suno-Style-Architect/issues/133) und die laufende Web-App abgeglichen. Der Cue-blaue Fokusring sitzt überall statt der System-Akzentfarbe; die Radienskala ist eingehalten; die Spalten-Akzente (purpur / cyan / smaragd) stimmen.

**Abnahme (Rauchtest):**
- Screenshot-Vergleich Web ↔ Cue für Hauptfenster, aufgeklapptes Dashboard, Verlaufs-Slide-over und zwei Sheets.
- Tab-Durchlauf durch das Hauptfenster: jedes fokussierbare Element zeigt den Cue-Fokusring.

### T6.3 — V1-Abnahme

**Ziel:** Der Durchgang, der V1 für fertig erklärt. Cue und die laufende Web-App nebeneinander, Feature für Feature.

**Abnahme:**
- Jedes Werkzeug des Katalogs mindestens einmal ausgelöst; Ergebnis plausibel, Undo funktioniert.
- Die Rauchtest-Schritte aller Phasen einmal am Stück durchlaufen.
- Suite grün, inklusive der mit `withKnownIssue` markierten Beta-Macken (markiert, nicht gelöscht, nicht auskommentiert).
- Neustart-Probe: App beenden und starten → Arbeitszustand, Layout-Zustände, Favoriten, Verlauf und Keys sind da.
- Ein echter Aufruf gegen beide Dienste aus der laufenden App.
- Abweichungen gegenüber der Web-App sind entweder in der Karte als bewusste Entscheidung belegt — oder sie sind ein Fehler.

---

## Was dieser Plan bewusst nicht enthält

- **Kreativbibliothek, Stilsynchronisator, Klang Studio** — aus V1 ausgeschlossen; sie erscheinen nur als deaktivierte Einstiegspunkte.
- **Tips und Onboarding** — in V1 gestrichen ([UI](https://github.com/Ibaiv/Suno-Style-Architect/issues/134)); Cheat-Sheet und Menüleiste decken die Auffindbarkeit.
- **Shortcut-Editor und Shortcut-Persistenz** — nicht portiert, Belegungen stehen im Code ([Aktionen](https://github.com/Ibaiv/Suno-Style-Architect/issues/143)).
- **Medien-Persistenz und SwiftData** — der Medien-Store ist ein Folge-Effort ([Arch](https://github.com/Ibaiv/Suno-Style-Architect/issues/135) §5).
- **UI-Tests, Integrations-Target, Coverage-Quote** — bewusste Nicht-Ziele ([Tests](https://github.com/Ibaiv/Suno-Style-Architect/issues/145) §10).
- **Signierung, Notarisierung, Distribution** — außerhalb des Karten-Umfangs.
- **Live-Streaming der Antwort** — bewusstes Nach-V1-Feature ([Bereinigung](https://github.com/Ibaiv/Suno-Style-Architect/issues/142) Punkt 10).
