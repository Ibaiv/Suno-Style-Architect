# Klang-Studio: Feature-Liste & Übersicht

**Version**: 1.0  
**Feature-Typ**: Großes Feature (Ersatz für Storyboard-Platzhalter)  
**Status**: Konzept- & Design-Phase

---

## 📋 Übersicht

Das **Klang-Studio** ist ein neues Hauptfeature, das als dritter Panel-Eintrag (unterhalb von "Stil-Synchronisator") in der rechten Spalte der Hauptansicht erscheint. Es ersetzt den aktuellen "Storyboard"-Platzhalter.

Das zentrale Konzept: **Ein textbasierter, KI-interpretierbarer Sound-Designer**, der die Lücke zwischen klassischen Synthesizer-UIs und textbasierter Musik-KI-Prompterstellung schließt.

---

## 🎯 Kernkonzept

### Das Problem
Traditionelle Synthesizer (Serum, Massive X, Vital) arbeiten auf:
- **Physikalischer/Elektrotechnischer Ebene**: Echtzeit-Klangbeeinflussung durch Knöpfe, Regler, LFOs
- **Numerischen Parametern**: Cutoff bei 12kHz, Resonance 0.7, etc.
- **Komplexen Wellenformen**: Wavetables mit tausenden Positionen, FM-Algorithmen

### Die Lösung
Das Klang-Studio operiert auf:
- **Textlicher/Semantischer Ebene**: Beschreibende Begriffe statt numerische Werte
- **KI-Interpretierbaren Konzepten**: Beschreibungen, die Musik-KIs verstehen und umsetzen können
- **Kreativen Blending-Möglichkeiten**: Kombination von Klangquellen auf beschreibender Ebene

---

## 🗂️ Feature-Module (Presets/Fenster)

### 1. Synth-Designer Pro
**Erweiterung des bestehenden Synth-Designers als Vollbild-Modul**

| Funktion | Beschreibung | KI-Interpretierbar |
|----------|--------------|-------------------|
| Wellenform-Auswahl | Sägezahn, Sinus, Dreieck, Rechteck, Pulse | ✅ Ja |
| Helligkeit/Filter | "Dunkel-Warm" bis "Hell-Schneidend" | ✅ Ja (über Textbezeichner) |
| Cutoff-Bereich | Textlich: "Tiefpass ab 8000 Hz" | ✅ Ja |
| Attack/Release | "Sanft einsetzend", "Perkussiv", "Schwebend" | ✅ Ja |
| Effekte | Reverb, Delay, Chorus (textlich beschrieben) | ✅ Ja |
| **Blend-Funktion** | "70% Synth + 30% Indigene Flöte" | ✅ Ja (Neu!) |

**Nicht unterstützt:**
- ❌ Phasenverschiebung (mathematisch, nicht KI-interpretierbar)
- ❌ Komplexe Wavetables (nicht textlich darstellbar)
- ❌ FM-Algorithmen (zu technisch)

---

### 2. Orchester-Designer
**Visuelle Orchestrierung auf Textbasis**

| Funktion | Beschreibung | KI-Interpretierbar |
|----------|--------------|-------------------|
| Orchester-Presets | Kammerorchester, Sinfonieorchester, Streichquartett, Bläserensemble | ✅ Ja |
| Sitzplan-Visualisierung | Schematische Darstellung der Orchestersektionen | 🎨 Visuell |
| Instrumenten-Toggle | Aktivieren/Deaktivieren einzelner Instrumente | ✅ Ja |
| Sektions-Lautstärke | "Dominante Streicher", "Dezente Bläser" | ✅ Ja |
| Raumakustik | "Konzertsaal-akustik", "Intime Kammermusik" | ✅ Ja |
| Hall-Charakteristik | "Großer Raum", "Trockener Sound" | ✅ Ja |

**Preset-Typen:**
- Großes Sinfonieorchester (100+ Musiker)
- Kammerorchester (15-30 Musiker)
- Streichquartett (4 Musiker)
- Bläserensemble (8-12 Musiker)
- Holzbläser-Solo
- Blechbläser-Sektion

---

### 3. Instrument-Blender
**Kreatives Mischen von Klangquellen**

| Funktion | Beschreibung |
|----------|--------------|
| Primärklang | Hauptinstrument/Sound auswählen |
| Blend-Partner | Sekundärinstrument/Sound auswählen |
| Mix-Verhältnis | Slider: 0% Primary ↔ 100% Secondary |
| Blend-Modus | "Harmonisch", "Kontrastierend", "Layered" |
| Frequenzaufteilung | "Tiefen vom Synth, Höhen von Flöte" |

**Beispiel-Kombinationen:**
- 70% Synthesizer + 30% Indigene Amerikanische Flöte
- 50% E-Piano + 50% Pad-Sound
- 80% Orchestrale Streicher + 20% Elektronische Textur

---

### 4. Vocal-Designer
**Gesangsstil und -charakteristik definieren**

| Funktion | Beschreibung |
|----------|--------------|
| Stimmtyp | Sopran, Alt, Tenor, Bass, Neutral |
| Gesangsstil | Operatisch, Pop, Jazz, Soul, Indie, Rap |
| Emotionaler Ausdruck | Emotional, Neutral, Kraftvoll, Verletzlich |
| Harmonien | Solo, Duett, Chor, A-cappella |
| Effekte | Vibrato-Intensität, Breathiness, Doubled |

---

### 5. Rhythmus-Labor
**Groove und rhythmische Strukturen**

| Funktion | Beschreibung |
|----------|--------------|
| Beat-Foundation | Elektronisch, Akustisch, Hybrid |
| Groove-Typ | Straight, Swing, Shuffle, Broken |
| Percussion-Set | Preset-basierte Percussion-Gruppen |
| Dynamik-Verlauf | "Buildup", "Consistent", "Drops" |
| Tempo-Character | "Treibend", "Laid-back", "Mechanisch" |

---

### 6. Ambient-Architekt
**Atmosphärische Klanglandschaften**

| Funktion | Beschreibung |
|----------|--------------|
| Umgebungstyp | Natur, Urban, Abstract, Cosmic |
| Textur-Dichte | Sparse ↔ Dense |
| Bewegung | Statisch ↔ Evolutiv |
| Tiefe | "Vordergrund" bis "Fern/Ethereal" |
| Field Recordings | "Regen", "Stadt", "Wald" (beschreibend) |

---

## 🎨 Design & UI/UX

### Haupt-Panel Erscheinung
Das Klang-Studio erscheint als Tile in der rechten Panel-Spalte:

```
┌──────────────────────────┐
│  🚀 Ideen-Starter        │  ← Aktiv
├──────────────────────────┤
│  ↔️ Stil-Synchronisator   │  ← Aktiv
├──────────────────────────┤
│  🎛️ Klang-Studio         │  ← NEU (ersetzt Storyboard)
├──────────────────────────┤
│  🌌 Universum             │  ← Platzhalter
└──────────────────────────┘
```

### Vollbild-Interface
Bei Klick öffnet sich ein Vollbild-Modal (wie Ideen-Starter):

```
┌─────────────────────────────────────────────────────────────────────┐
│ [🎛️ Klang-Studio]                                            [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Synth Pro   │ │ Orchester   │ │ Blender     │ │ Vocal       │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐                                   │
│  │ Rhythmus    │ │ Ambient     │                                   │
│  └─────────────┘ └─────────────┘                                   │
│                                                                     │
│                    [HAUPT-CONTENT-BEREICH]                          │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │     Modul-spezifische Visualisierung und Interaktion          │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ [Token-Vorschau]                            [Zum Prompt hinzufügen] │
└─────────────────────────────────────────────────────────────────────┘
```

### Farbschema
- **Primärfarbe**: Cyan/Türkis (`#06b6d4`) - differenziert von Blau (Ideen-Starter) und Lila (Stil-Synchronisator)
- **Akzentfarbe**: Teal (`#14b8a6`)
- **Hintergrund-Glow**: Cyan-Gradient

### Visuelle Element-Typen
1. **Radiobutton-Gruppen**: Für exklusive Auswahlen (Wellenform, Preset)
2. **Slider**: Für graduelle Werte (Mix-Verhältnis, Intensität)
3. **Toggle-Chips**: Für Mehrfachauswahl (Effekte, Instrumente)
4. **Visuelle Karten**: Für Preset-Auswahl (Orchester-Konfigurationen)
5. **Schematische Visualisierungen**: Orchestersitzplan, Frequenz-Ansicht

---

## 📝 KI-Prompt-Integration

### Token-Generierung
Jede Auswahl im Klang-Studio generiert textliche Tokens:

**Beispiel Synth-Designer Pro:**
```
synthesizer sound, sawtooth waveform, warm low-pass filtered below 8000Hz, 
soft attack with long release, drenched in large hall reverb, blended 
with subtle native american flute textures (30% blend)
```

**Beispiel Orchester-Designer:**
```
full symphony orchestra arrangement, focus on lush strings with 
prominent violins and cellos, subtle brass accents, warm concert 
hall acoustics, majestic and cinematic feel
```

### Live-Vorschau
Eine Terminal-Style Vorschau zeigt die generierten Tokens in Echtzeit:
```
┌─────────────────────────────────────────────────┐
│ > TOKEN_PREVIEW                                 │
├─────────────────────────────────────────────────┤
│ synthesizer sound, sawtooth waveform, warm...   │
│ Character Count: 156 / 200                      │
│ [OPTIMIZE] [COPY] [INSERT]                     │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Technische Hinweise

### Was funktioniert textlich/ist KI-interpretierbar:
- ✅ Wellenform-Beschreibungen (Sägezahn, Sinus, etc.)
- ✅ Instrumenten-Namen und -Familien
- ✅ Cutoff/Filter als Frequenzangabe ("low-pass filtered below 8kHz")
- ✅ Hüllkurven als Beschreibung ("soft attack", "long sustained notes")
- ✅ Effekte als Charakteristik ("reverb-drenched", "dry and punchy")
- ✅ Blend-Anweisungen ("layered with", "combined with")
- ✅ Räumliche Beschreibungen ("intimate", "vast", "ethereal")
- ✅ Emotionale Adjektive ("warm", "cold", "aggressive", "gentle")

### Was NICHT funktioniert / ausgeschlossen ist:
- ❌ Numerische Hz/dB-Werte (außer als beschreibende Orientierung)
- ❌ Phasenverschiebung oder Phasen-Modulationen
- ❌ Komplexe Wavetable-Positionen
- ❌ FM-Algorithmen und Operatoren
- ❌ Präzise Hüllkurven-Zeiten (ADSR in ms)
- ❌ LFO-Frequenzen und Sync-Raten
- ❌ Modulationsmatrizen

---

## 📐 Responsive Design

| Breakpoint | Verhalten |
|------------|-----------|
| `< 768px` (Mobile) | Vollbild-Modal, vertikale Tab-Anordnung |
| `768px - 1280px` (Tablet) | 2-spaltiges Grid für Module |
| `> 1280px` (Desktop) | 3-spaltiges Grid, volle Visualisierungen |

---

## 🚀 Nächste Schritte

1. **Design-Phase**: UI/UX-Mockups für jedes Modul
2. **Prototyp**: HTML/CSS-Struktur des Haupt-Modals
3. **Logik**: JavaScript für Token-Generierung
4. **Integration**: Anbindung an den Hauptprompt
5. **Testing**: KI-Interpretation der generierten Tokens validieren

---

## 📚 Verwandte Dokumente

- [KLANG_STUDIO_ANFORDERUNGSANALYSE.md](./KLANG_STUDIO_ANFORDERUNGSANALYSE.md) - Detaillierte Anforderungen
- [KLANG_STUDIO_DOKUMENTATION.md](./KLANG_STUDIO_DOKUMENTATION.md) - Technische Dokumentation
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Projekt-Design-System
