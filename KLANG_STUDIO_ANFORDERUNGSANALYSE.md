# Klang-Studio: Anforderungsanalyse

**Version**: 1.0  
**Datum**: Januar 2026  
**Autor**: Entwicklungsteam  
**Feature-Typ**: Major Feature  
**Ersetzt**: Storyboard-Platzhalter (Tile 3)

---

## 1. Executive Summary

### 1.1 Projektziel
Entwicklung eines textbasierten Klang-Design-Werkzeugs ("Klang-Studio"), das als großes Feature in der Suno Style Architect Anwendung integriert wird. Das Feature ersetzt den aktuellen "Storyboard"-Platzhalter und erscheint als drittes aktives Panel in der rechten Feature-Spalte.

### 1.2 Problem-Statement
Klassische digitale Synthesizer und Sound-Design-Tools arbeiten auf physikalischer/elektrotechnischer Ebene mit numerischen Parametern (Cutoff-Frequenz in Hz, Resonanz als Prozent, ADSR-Werte in Millisekunden). Diese Parameter sind:

1. **Nicht direkt auf Text übertragbar**: Werte wie "Cutoff bei 12.5kHz mit Resonance 0.73" ergeben keinen natürlichen Satz
2. **Nicht konsistent KI-interpretierbar**: Musik-KIs können numerische Synthesizer-Parameter nicht akkurat umsetzen
3. **Technisch anspruchsvoll**: Erfordern tiefes Verständnis von Klangsynthese

### 1.3 Lösungsansatz
Das Klang-Studio operiert auf einer **semantisch-deskriptiven Ebene**:
- Beschreibende Begriffe statt numerischer Werte
- Visualisierungen statt Parameterlisten
- Kreative Blend-Funktionen statt technischer Modulation
- Fokus auf KI-interpretierbare Ausdrücke

---

## 2. Stakeholder-Analyse

### 2.1 Primäre Nutzer
| Nutzergruppe | Bedürfnisse | Erwartungen |
|--------------|-------------|-------------|
| Anfänger | Einfacher Zugang zu Sound-Design | Intuitive visuelle Oberfläche |
| Fortgeschrittene | Präzise Kontrolle über Klangcharakteristik | Detaillierte Einstellungsmöglichkeiten |
| Produzenten | Schnelle Workflow-Integration | Nahtlose Prompt-Integration |

### 2.2 System-Stakeholder
| System | Interaktion | Anforderungen |
|--------|-------------|---------------|
| Suno Music AI | Empfängt generierte Tokens | Klare, interpretierbare Beschreibungen |
| OpenRouter API | Verarbeitet Prompts | Konsistenter Prompt-Aufbau |
| Bestehendes UI | Visualisiert Ergebnisse | Design-System-Konformität |

---

## 3. Funktionale Anforderungen

### 3.1 Kern-Features

#### FA-001: Panel-Integration
- **Beschreibung**: Das Klang-Studio erscheint als aktives Tile in Position 3 der rechten Spalte
- **Priorität**: MUSS
- **Akzeptanzkriterien**:
  - [ ] Tile ersetzt "Storyboard"-Platzhalter
  - [ ] Tile ist klickbar und öffnet Vollbild-Modal
  - [ ] Hover-Effekte und Animationen gemäß Design-System
  - [ ] Farbschema differenziert (Cyan/Teal)

#### FA-002: Vollbild-Modal
- **Beschreibung**: Bei Klick öffnet sich ein 95vw x 90vh großes Modal
- **Priorität**: MUSS
- **Akzeptanzkriterien**:
  - [ ] Modal erscheint mit Fade-In-Animation
  - [ ] Header mit Icon, Titel und Close-Button
  - [ ] Tab-Navigation für Module
  - [ ] Footer mit Token-Vorschau und Aktionsbuttons

#### FA-003: Modul-System
- **Beschreibung**: Multiple unabhängige Design-Module innerhalb des Studios
- **Priorität**: MUSS
- **Module**:
  1. Synth-Designer Pro (Erweiterung des bestehenden)
  2. Orchester-Designer
  3. Instrument-Blender
  4. Vocal-Designer
  5. Rhythmus-Labor
  6. Ambient-Architekt

#### FA-004: Token-Generierung
- **Beschreibung**: Jede Nutzerauswahl generiert textliche Tokens
- **Priorität**: MUSS
- **Akzeptanzkriterien**:
  - [ ] Live-Vorschau der generierten Tokens
  - [ ] Zeichenzähler für Prompt-Länge
  - [ ] "Zum Prompt hinzufügen"-Button
  - [ ] "In Zwischenablage kopieren"-Button

---

### 3.2 Feature-spezifische Anforderungen

#### 3.2.1 Synth-Designer Pro (FA-100)

| ID | Anforderung | Priorität | Status |
|----|-------------|-----------|--------|
| FA-101 | Wellenform-Auswahl (4 Grundformen) | MUSS | Offen |
| FA-102 | Filter-Charakteristik (Dunkel → Hell) | MUSS | Offen |
| FA-103 | Cutoff-Bereich als Text ("ab 8000 Hz") | MUSS | Offen |
| FA-104 | Hüllkurven-Beschreibung (semantisch) | MUSS | Offen |
| FA-105 | Effekt-Auswahl (Checkboxen) | MUSS | Offen |
| FA-106 | **Blend-Funktion** mit sekundärem Klang | MUSS | Offen |
| FA-107 | Mix-Verhältnis Slider (0-100%) | MUSS | Offen |

**Blend-Funktion Spezifikation:**

```
Input:
- Primary Sound: [Synthesizer-Konfiguration]
- Secondary Sound: [Instrument/Sound aus Katalog]
- Blend Ratio: 0-100% Slider

Output Token (Beispiel):
"synthesizer sound with sawtooth character, blended 
with 30% native american flute textures, warm 
low-pass filtered character"
```

#### 3.2.2 Orchester-Designer (FA-200)

| ID | Anforderung | Priorität | Status |
|----|-------------|-----------|--------|
| FA-201 | Preset-Auswahl (Sinfonieorchester, Kammer, etc.) | MUSS | Offen |
| FA-202 | Schematische Sitzplan-Visualisierung | SOLL | Offen |
| FA-203 | Instrumenten-Toggle (An/Aus) | MUSS | Offen |
| FA-204 | Sektions-Dominanz-Slider | SOLL | Offen |
| FA-205 | Raumakustik-Auswahl | MUSS | Offen |
| FA-206 | Hall-Charakteristik | SOLL | Offen |

**Visualisierung Spezifikation:**

```
┌─────────────────────────────────────────────┐
│                 [Dirigent]                   │
│                                             │
│     🎻🎻🎻🎻        🎻🎻🎻🎻                │ ← Erste Violinen
│        🎻🎻🎻🎻   🎻🎻🎻🎻                 │ ← Zweite Violinen
│           🎻🎻🎻🎻🎻🎻                     │ ← Bratschen
│              🎻🎻🎻🎻                       │ ← Celli
│                 🎻🎻                         │ ← Kontrabässe
│                                             │
│  🎺🎺🎺    🎺🎺🎺    🥁🥁    🎵🎵          │ ← Bläser, Percussion
│                                             │
│          [Klickbare Bereiche]               │
└─────────────────────────────────────────────┘
```

#### 3.2.3 Instrument-Blender (FA-300)

| ID | Anforderung | Priorität | Status |
|----|-------------|-----------|--------|
| FA-301 | Primärklang-Auswahl | MUSS | Offen |
| FA-302 | Sekundärklang-Auswahl | MUSS | Offen |
| FA-303 | Mix-Verhältnis Slider | MUSS | Offen |
| FA-304 | Blend-Modus Auswahl | SOLL | Offen |
| FA-305 | Frequenzaufteilung "Tiefen/Höhen" | KANN | Offen |

**Instrumenten-Katalog:**

| Kategorie | Instrumente |
|-----------|-------------|
| Synthesizer | Pad, Lead, Bass, Pluck, Keys |
| Streicher | Violine, Cello, Kontrabass, Viola |
| Bläser | Trompete, Posaune, Saxophon, Flöte, Klarinette |
| Ethnisch | Sitar, Shakuhachi, Duduk, Pan-Flöte, Didgeridoo |
| Percussion | Drums, Congas, Tabla, Taiko |
| Akkord | Piano, Gitarre, Harfe, Orgel |

#### 3.2.4 Vocal-Designer (FA-400)

| ID | Anforderung | Priorität | Status |
|----|-------------|-----------|--------|
| FA-401 | Stimmlagen-Auswahl | MUSS | Offen |
| FA-402 | Gesangsstil-Auswahl | MUSS | Offen |
| FA-403 | Emotionaler Ausdruck | MUSS | Offen |
| FA-404 | Harmonien/Arrangement | SOLL | Offen |
| FA-405 | Vocal-Effekte | SOLL | Offen |

#### 3.2.5 Rhythmus-Labor (FA-500)

| ID | Anforderung | Priorität | Status |
|----|-------------|-----------|--------|
| FA-501 | Beat-Foundation Auswahl | MUSS | Offen |
| FA-502 | Groove-Typ Auswahl | MUSS | Offen |
| FA-503 | Percussion-Set Auswahl | SOLL | Offen |
| FA-504 | Dynamik-Verlauf | SOLL | Offen |
| FA-505 | Tempo-Charakter | KANN | Offen |

#### 3.2.6 Ambient-Architekt (FA-600)

| ID | Anforderung | Priorität | Status |
|----|-------------|-----------|--------|
| FA-601 | Umgebungstyp Auswahl | MUSS | Offen |
| FA-602 | Textur-Dichte Slider | MUSS | Offen |
| FA-603 | Bewegungs-Charakter | SOLL | Offen |
| FA-604 | Räumliche Tiefe | SOLL | Offen |
| FA-605 | Field Recording Beschreibung | KANN | Offen |

---

## 4. Nicht-funktionale Anforderungen

### 4.1 Performance

| ID | Anforderung | Zielwert |
|----|-------------|----------|
| NFA-001 | Modal-Öffnung | < 300ms |
| NFA-002 | Tab-Wechsel | < 100ms |
| NFA-003 | Token-Update | < 50ms (Echtzeit) |
| NFA-004 | Animations-FPS | 60 FPS |

### 4.2 Usability

| ID | Anforderung | Zielwert |
|----|-------------|----------|
| NFA-010 | Touch-Target Größe | ≥ 44px |
| NFA-011 | Keyboard-Navigation | Vollständig |
| NFA-012 | Screen Reader Support | Alle Elemente labeled |
| NFA-013 | Lernkurve | < 5 Minuten für Basis-Flow |

### 4.3 Kompatibilität

| ID | Anforderung | Zielwert |
|----|-------------|----------|
| NFA-020 | Desktop Browser | Chrome, Firefox, Safari, Edge (2 letzte Versionen) |
| NFA-021 | Mobile Browser | Chrome Mobile, Safari iOS |
| NFA-022 | Viewport | ≥ 320px Breite |

### 4.4 Design-System-Konformität

| ID | Anforderung | Referenz |
|----|-------------|----------|
| NFA-030 | Farbpalette | DESIGN_SYSTEM.md: Core Visual Language |
| NFA-031 | Typografie | DESIGN_SYSTEM.md: Typography Scale |
| NFA-032 | Border-Radius | DESIGN_SYSTEM.md: Border Radius System |
| NFA-033 | Glass-Morphism | DESIGN_SYSTEM.md: Glass Morphism Standards |
| NFA-034 | Animationen | DESIGN_SYSTEM.md: Animation Standards |
| NFA-035 | Z-Index | DESIGN_SYSTEM.md: Z-Index Management |

---

## 5. Technische Constraints

### 5.1 Was textlich funktioniert (KI-interpretierbar)

| Konzept | Textliche Darstellung | Beispiel |
|---------|----------------------|----------|
| Wellenformen | Beschreibende Namen | "sawtooth waveform", "sine wave" |
| Filter-Charakter | Adjektive | "warm low-pass", "bright and present" |
| Cutoff | Frequenz-Referenz | "filtered below 8000 Hz" |
| Hüllkurven | Beschreibungen | "soft attack", "long sustained" |
| Effekte | Qualitative Begriffe | "drenched in reverb", "subtle delay" |
| Blending | Verhältnisbeschreibung | "blended with 30% flute textures" |
| Räumlichkeit | Größenbeschreibung | "intimate room", "vast concert hall" |
| Emotion | Stimmung | "melancholic", "uplifting", "aggressive" |

### 5.2 Was NICHT funktioniert (von UI ausgeschlossen)

| Konzept | Grund | Alternative |
|---------|-------|-------------|
| Phasenverschiebung | Mathematisch, nicht semantisch | Ausschließen |
| Komplexe Wavetables | Nicht textlich darstellbar | Basis-Wellenformen |
| FM-Algorithmen | Zu technisch | "FM-like metallic texture" |
| Präzise ADSR (ms) | Numerisch | Beschreibende Begriffe |
| LFO-Frequenzen | Numerisch | "Slow wobble", "fast tremolo" |
| Modulationsmatrizen | Zu komplex | Vordefinierte Presets |
| dB-Werte | Numerisch | "Quiet", "pronounced", "dominant" |

### 5.3 Architektur-Integration

```
┌─────────────────────────────────────────────────────────────┐
│                     index.html                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Klang-Studio Tile (Position 3, rechte Spalte)         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Klang-Studio Modal (id="klang-studio-modal")          │  │
│  │  - Header mit Tabs                                    │  │
│  │  - Content-Bereich (dynamisch)                        │  │
│  │  - Footer mit Token-Vorschau                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    js/features.js                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ setupKlangStudio()                                    │  │
│  │  - initializeModules()                                │  │
│  │  - setupSynthDesignerPro()                            │  │
│  │  - setupOrchestraDesigner()                           │  │
│  │  - setupInstrumentBlender()                           │  │
│  │  - setupTokenPreview()                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    js/prompts.js                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ KLANG_STUDIO_SYNTH_PROMPT                             │  │
│  │ KLANG_STUDIO_ORCHESTRA_PROMPT                         │  │
│  │ KLANG_STUDIO_BLENDER_PROMPT                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Akzeptanzkriterien

### 6.1 Minimum Viable Product (MVP)

Für das MVP müssen mindestens implementiert sein:
- [ ] Panel-Tile-Integration (ersetzt Storyboard)
- [ ] Vollbild-Modal mit Tab-Navigation
- [ ] Synth-Designer Pro mit Blend-Funktion
- [ ] Orchester-Designer mit Preset-Auswahl
- [ ] Token-Generierung und Vorschau
- [ ] "Zum Prompt hinzufügen"-Funktionalität

### 6.2 Definition of Done

Ein Feature gilt als abgeschlossen, wenn:
- [ ] Alle MUSS-Anforderungen implementiert
- [ ] Design-System-Konformität geprüft
- [ ] Keyboard-Navigation funktioniert
- [ ] Mobile Responsive getestet
- [ ] Token-Generierung validiert
- [ ] Integration mit Hauptprompt funktioniert
- [ ] Keine Console-Errors

---

## 7. Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------------|------------|------------|
| KI interpretiert Tokens inkonsistent | Mittel | Hoch | Umfangreiche Token-Tests mit verschiedenen Musik-KIs |
| UI zu komplex für Anfänger | Mittel | Mittel | Presets und "Quick Start"-Mode |
| Performance-Probleme durch Visualisierungen | Niedrig | Mittel | Lazy-Loading, CSS statt Canvas |
| Konflikte mit bestehendem Synth-Designer | Niedrig | Niedrig | Konfigurierbarer Upgrade-Pfad |

---

## 8. Glossar

| Begriff | Definition |
|---------|------------|
| Token | Einzelner textueller Baustein für den Musik-KI-Prompt |
| Blend | Mischung zweier Klangquellen |
| Cutoff | Frequenz, ab der ein Filter dämpft |
| Envelope/Hüllkurve | Zeitlicher Verlauf eines Klangs (Attack, Decay, Sustain, Release) |
| Wavetable | Sammlung von Wellenformen in einem Synthesizer |
| FM-Synthese | Klangerzeugung durch Frequenzmodulation |

---

## 9. Anhänge

### A. Verwandte Dokumente
- [KLANG_STUDIO_FEATURE_LISTE.md](./KLANG_STUDIO_FEATURE_LISTE.md)
- [KLANG_STUDIO_DOKUMENTATION.md](./KLANG_STUDIO_DOKUMENTATION.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

### B. Change Log
| Version | Datum | Änderung | Autor |
|---------|-------|----------|-------|
| 1.0 | 2026-01 | Initiale Erstellung | Entwicklungsteam |
