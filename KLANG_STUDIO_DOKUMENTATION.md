# Klang-Studio: Technische Dokumentation

**Version**: 1.0  
**Datum**: Januar 2026  
**Autor**: Entwicklungsteam  
**Dokumenttyp**: Technische Spezifikation & Design-Dokumentation

---

## 1. Einleitung

### 1.1 Dokumentzweck
Diese Dokumentation beschreibt die technischen Grundlagen, Design-Entscheidungen und Implementierungsleitlinien für das Klang-Studio Feature in der Suno Style Architect Anwendung.

### 1.2 Leserkreis
- Entwickler des Suno Style Architect Projekts
- UI/UX Designer
- Technische Reviewer

### 1.3 Scope
- Architektur und Systemdesign
- UI/UX-Konzepte im Detail
- Token-Generierungslogik
- KI-Interpretierbarkeits-Analyse
- Implementierungsleitfaden

---

## 2. Systemarchitektur

### 2.1 High-Level-Architektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Klang-Studio │  │ Synth Pro    │  │ Orchester    │  │ Instrument  │ │
│  │   Tile       │  │   Module     │  │   Module     │  │   Blender   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │         │
│         ▼                 ▼                 ▼                 ▼         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    KLANG STUDIO MODAL CONTAINER                     ││
│  │  ┌───────────────────────────────────────────────────────────────┐  ││
│  │  │                      MODULE MANAGER                           │  ││
│  │  └───────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                   │                                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            LOGIC LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │ Token Generator │  │ Prompt Merger   │  │ State Manager           │ │
│  │ - Synth Tokens  │  │ - Append Logic  │  │ - Current Module        │ │
│  │ - Orch. Tokens  │  │ - Trim Logic    │  │ - Selections            │ │
│  │ - Blend Tokens  │  │ - Validation    │  │ - Generated Tokens      │ │
│  └────────┬────────┘  └────────┬────────┘  └───────────┬─────────────┘ │
│           │                    │                       │                │
│           └────────────────────┼───────────────────────┘                │
│                                │                                        │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │
│  │ Instrument      │  │ Orchester       │  │ Preset Configurations   │ │
│  │ Catalog         │  │ Presets         │  │ - Synth Presets         │ │
│  │ - Categories    │  │ - Sitzpläne     │  │ - Blend Presets         │ │
│  │ - Descriptions  │  │ - Besetzungen   │  │ - Effect Chains         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Modul-Komponentenstruktur

```
js/
├── features.js                    # Hauptlogik (erweitert)
│   ├── setupKlangStudio()         # Haupt-Setup
│   ├── setupSynthDesignerPro()    # Synth-Modul
│   ├── setupOrchestraDesigner()   # Orchester-Modul
│   ├── setupInstrumentBlender()   # Blender-Modul
│   ├── setupVocalDesigner()       # Vocal-Modul
│   ├── setupRhythmLab()           # Rhythmus-Modul
│   └── setupAmbientArchitect()    # Ambient-Modul
│
├── prompts.js                     # Prompt-Templates (erweitert)
│   ├── KLANG_STUDIO_SYNTH_PROMPT
│   ├── KLANG_STUDIO_ORCHESTRA_PROMPT
│   ├── KLANG_STUDIO_BLENDER_PROMPT
│   └── KLANG_STUDIO_TOKEN_OPTIMIZER_PROMPT
│
└── klang_studio_data.js           # Datenkatalog (NEU)
    ├── INSTRUMENT_CATALOG
    ├── ORCHESTRA_PRESETS
    ├── BLEND_MODE_DEFINITIONS
    └── EFFECT_DEFINITIONS
```

---

## 3. UI/UX Design-Spezifikation

### 3.1 Design-Tokens (Klang-Studio spezifisch)

```css
/* Klang-Studio Farbschema */
:root {
    --ks-primary: #06b6d4;           /* Cyan 500 */
    --ks-primary-light: #22d3ee;     /* Cyan 400 */
    --ks-primary-dark: #0891b2;      /* Cyan 600 */
    --ks-accent: #14b8a6;            /* Teal 500 */
    
    /* Glow-Effekte */
    --ks-glow: rgba(6, 182, 212, 0.3);
    --ks-glow-intense: rgba(6, 182, 212, 0.5);
    
    /* Modul-spezifische Farben */
    --ks-synth: #8b5cf6;             /* Violet (Synth Pro) */
    --ks-orchestra: #f59e0b;         /* Amber (Orchester) */
    --ks-blender: #ec4899;           /* Pink (Blender) */
    --ks-vocal: #10b981;             /* Emerald (Vocal) */
    --ks-rhythm: #ef4444;            /* Red (Rhythmus) */
    --ks-ambient: #6366f1;           /* Indigo (Ambient) */
}
```

### 3.2 Tile-Design (Rechte Spalte)

```html
<!-- Klang-Studio Tile (ersetzt Storyboard) -->
<button id="klang-studio-tile"
    class="kreativ-panel active group relative flex-1 
           bg-neutral-800/20 backdrop-blur-md 
           border border-neutral-700/60 rounded-3xl p-6 
           shadow-2xl overflow-hidden text-left 
           transition-all duration-300 
           hover:scale-[1.02] hover:shadow-cyan-900/20 
           hover:border-cyan-500/30">
    <div class="absolute inset-0 bg-gradient-to-br 
                from-cyan-600/10 to-transparent 
                opacity-0 group-hover:opacity-100 
                transition-opacity duration-300"></div>
    <div class="relative z-10 h-full flex flex-col justify-between">
        <div>
            <div class="w-10 h-10 bg-cyan-500/20 rounded-xl 
                        flex items-center justify-center mb-3 
                        text-cyan-400 group-hover:text-cyan-300 
                        group-hover:scale-110 transition-all duration-300">
                <!-- Mixer/Sliders Icon -->
                <svg>...</svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-1 
                       group-hover:text-cyan-200 transition-colors">
                Klang-Studio
            </h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
                Textbasiertes Sound-Design. Synths, Orchester & mehr.
            </p>
        </div>
        <div class="flex items-center text-xs font-medium 
                    text-cyan-400 opacity-60 
                    group-hover:opacity-100 transition-all 
                    transform translate-y-2 group-hover:translate-y-0">
            Designen <span class="ml-1">🎛️</span>
        </div>
    </div>
</button>
```

### 3.3 Modal-Struktur

```html
<div id="klang-studio-modal" class="fixed inset-0 z-[130] hidden">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/95 backdrop-blur-xl"></div>
    
    <!-- Modal Container -->
    <div class="relative w-full h-full flex items-center 
                justify-center p-4">
        <div class="bg-[#0b0b14] border border-neutral-700/50 
                    shadow-2xl rounded-3xl 
                    w-[95vw] h-[90vh] 
                    flex flex-col overflow-hidden relative">
            
            <!-- Header mit Tabs -->
            <div class="border-b border-white/5 bg-black/40 
                        p-6 flex flex-col gap-6 z-20">
                <!-- Titel-Zeile -->
                <div class="flex justify-between items-center">
                    <h2 class="text-3xl font-bold text-white 
                               tracking-tight flex items-center gap-3">
                        <span class="w-10 h-10 rounded-xl 
                                     bg-gradient-to-br from-cyan-500 
                                     to-teal-600 flex items-center 
                                     justify-center text-lg 
                                     shadow-lg shadow-cyan-900/30">
                            🎛️
                        </span>
                        Klang-Studio
                    </h2>
                    <button id="close-klang-studio">✕</button>
                </div>
                
                <!-- Modul-Tabs -->
                <div id="ks-module-tabs" class="flex gap-3 
                     overflow-x-auto pb-2 scrollbar-hide">
                    <button class="ks-tab active" data-module="synth">
                        <span class="icon">🎹</span> Synth Pro
                    </button>
                    <button class="ks-tab" data-module="orchestra">
                        <span class="icon">🎻</span> Orchester
                    </button>
                    <button class="ks-tab" data-module="blender">
                        <span class="icon">🔀</span> Blender
                    </button>
                    <button class="ks-tab" data-module="vocal">
                        <span class="icon">🎤</span> Vocal
                    </button>
                    <button class="ks-tab" data-module="rhythm">
                        <span class="icon">🥁</span> Rhythmus
                    </button>
                    <button class="ks-tab" data-module="ambient">
                        <span class="icon">🌌</span> Ambient
                    </button>
                </div>
            </div>
            
            <!-- Content-Bereich -->
            <div id="ks-content-area" class="flex-1 overflow-y-auto 
                 custom-scrollbar relative bg-[#11111a] 
                 flex flex-col items-center">
                <!-- Dynamisch geladen basierend auf aktivem Tab -->
            </div>
            
            <!-- Footer mit Token-Vorschau -->
            <div class="border-t border-white/5 bg-black/40 
                        p-6 flex justify-between items-center z-20">
                <!-- Token-Vorschau -->
                <div class="flex-1 mr-4">
                    <div class="terminal-display bg-[#0a0a10] 
                                rounded-xl p-3 font-mono text-xs 
                                border border-white/5">
                        <div class="flex items-center gap-2 
                                    text-neutral-500 mb-1">
                            <span>></span> TOKEN_PREVIEW
                        </div>
                        <p id="ks-token-preview" class="text-cyan-400/90 
                           truncate"></p>
                    </div>
                    <div class="flex items-center gap-4 mt-2 text-xs">
                        <span id="ks-char-count" 
                              class="text-neutral-500">0 Zeichen</span>
                        <span class="text-neutral-600">|</span>
                        <span id="ks-token-health" 
                              class="text-green-400">Optimal</span>
                    </div>
                </div>
                
                <!-- Aktions-Buttons -->
                <div class="flex gap-3">
                    <button id="ks-copy-btn" 
                            class="btn-secondary">Kopieren</button>
                    <button id="ks-apply-btn" 
                            class="btn-primary bg-gradient-to-r 
                                   from-cyan-600 to-teal-600">
                        Zum Prompt hinzufügen
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## 4. Modul-Detailspezifikationen

### 4.1 Synth-Designer Pro

**UI-Komponenten:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ SYNTH-DESIGNER PRO                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─── 1. WELLENFORM ────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │   ○ Sägezahn     ◉ Sinus     ○ Dreieck     ○ Rechteck       │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── 2. FILTER-CHARAKTER ──────────────────────────────────────┐   │
│  │                                                               │   │
│  │   Dunkel                                             Hell    │   │
│  │   [████████████████░░░░░░░░░░░░░░░░░░░░]                     │   │
│  │              Aktuell: "Warm-Mittig"                          │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── 3. CUTOFF-REFERENZ ───────────────────────────────────────┐   │
│  │                                                               │   │
│  │   ○ Unter 2000 Hz (Sehr dunkel)                              │   │
│  │   ◉ Unter 8000 Hz (Warm)                                     │   │
│  │   ○ Unter 15000 Hz (Offen)                                   │   │
│  │   ○ Kein Cutoff (Volle Helligkeit)                           │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── 4. HÜLLKURVE (ENVELOPE) ──────────────────────────────────┐   │
│  │                                                               │   │
│  │   ○ Perkussiv (kurzer Attack, kurzes Release)                │   │
│  │   ◉ Pad-artig (langsamer Attack, langes Release)            │   │
│  │   ○ Plucky (schneller Attack, mittleres Release)            │   │
│  │   ○ Sustained (langes Halten)                                 │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── 5. EFFEKTE ───────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │   [✓] Reverb    [✓] Delay    [ ] Chorus    [ ] Distortion   │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── 6. BLEND-FUNKTION (NEU) ──────────────────────────────────┐   │
│  │                                                               │   │
│  │   Sekundärer Sound: [▼ Indigene Amerikanische Flöte    ]     │   │
│  │                                                               │   │
│  │   Mix-Verhältnis:                                             │   │
│  │   Synth [████████████████░░░░░░░░░░] Blend-Partner            │   │
│  │                70% Synth / 30% Blend                          │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Token-Generierungslogik:**

```javascript
function generateSynthToken(config) {
    const parts = [];
    
    // Wellenform
    const waveforms = {
        'sawtooth': 'sawtooth waveform synthesizer',
        'sine': 'smooth sine wave synthesizer',
        'triangle': 'soft triangle wave synthesizer',
        'square': 'bold square wave synthesizer'
    };
    parts.push(waveforms[config.waveform]);
    
    // Filter-Charakter
    const filterDescriptions = {
        0: 'dark and muffled',
        25: 'warm and subdued',
        50: 'balanced warmth',
        75: 'bright and present',
        100: 'cutting and aggressive'
    };
    parts.push(filterDescriptions[config.filterValue]);
    
    // Cutoff
    if (config.cutoff !== 'none') {
        parts.push(`low-pass filtered below ${config.cutoff}`);
    }
    
    // Envelope
    const envelopes = {
        'percussive': 'with punchy attack and quick decay',
        'pad': 'with slow attack and long sustained release',
        'plucky': 'with snappy attack and moderate decay',
        'sustained': 'with sustained notes'
    };
    parts.push(envelopes[config.envelope]);
    
    // Effekte
    if (config.effects.length > 0) {
        const effectMap = {
            'reverb': 'drenched in reverb',
            'delay': 'with spacious delay',
            'chorus': 'with subtle chorus movement',
            'distortion': 'with gritty distortion'
        };
        const effectStrings = config.effects.map(e => effectMap[e]);
        parts.push(effectStrings.join(', '));
    }
    
    // Blend-Funktion
    if (config.blendSound && config.blendRatio > 0) {
        parts.push(`blended with ${config.blendRatio}% ${config.blendSound} textures`);
    }
    
    return parts.join(', ');
}
```

---

### 4.2 Orchester-Designer

**UI-Komponenten:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ ORCHESTER-DESIGNER                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─── PRESET-AUSWAHL ───────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │   │
│  │  │ Sinfonieork.│ │ Kammer-     │ │ Streich-    │            │   │
│  │  │             │ │ orchester   │ │ quartett    │            │   │
│  │  │   [100+]    │ │   [~25]     │ │    [4]      │            │   │
│  │  │  ○ Aktiv    │ │  ◉ Aktiv    │ │  ○ Aktiv    │            │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘            │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │   │
│  │  │ Bläser-     │ │ Holzbläser- │ │ Solo-       │            │   │
│  │  │ ensemble    │ │ chor        │ │ instrumente │            │   │
│  │  │   [~12]     │ │   [~8]      │ │    [1]      │            │   │
│  │  │  ○ Aktiv    │ │  ○ Aktiv    │ │  ○ Aktiv    │            │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘            │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── SITZPLAN-VISUALISIERUNG ──────────────────────────────────┐   │
│  │                                                               │   │
│  │                      🎼 [Dirigent]                            │   │
│  │                                                               │   │
│  │        ┌─────┐       ┌─────┐       ┌─────┐                   │   │
│  │        │ 1.V │       │ 2.V │       │ Vla │                   │   │
│  │        │ [✓] │       │ [✓] │       │ [✓] │                   │   │
│  │        └─────┘       └─────┘       └─────┘                   │   │
│  │                                                               │   │
│  │        ┌─────┐       ┌─────┐                                  │   │
│  │        │ Vc  │       │ Kb  │                                  │   │
│  │        │ [✓] │       │ [ ] │ ← Deaktiviert                   │   │
│  │        └─────┘       └─────┘                                  │   │
│  │                                                               │   │
│  │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │   │
│  │   │ Fl  │ │ Ob  │ │ Kl  │ │ Fg  │ │ Hr  │                   │   │
│  │   │ [✓] │ │ [✓] │ │ [ ] │ │ [ ] │ │ [✓] │                   │   │
│  │   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │   │
│  │                                                               │   │
│  │   Legende: 1.V=Erste Violine, 2.V=Zweite Violine,            │   │
│  │            Vla=Viola, Vc=Cello, Kb=Kontrabass                │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── SEKTIONS-DOMINANZ ────────────────────────────────────────┐   │
│  │                                                               │   │
│  │   Streicher:   [████████████████████░░░░░] Dominant          │   │
│  │   Holzbläser:  [████████████░░░░░░░░░░░░░] Unterstützend     │   │
│  │   Blechbläser: [██████░░░░░░░░░░░░░░░░░░░] Dezent            │   │
│  │   Percussion:  [████░░░░░░░░░░░░░░░░░░░░░] Minimal           │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─── RAUMAKUSTIK ──────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │   ○ Intimer Kammersaal                                        │   │
│  │   ◉ Großer Konzertsaal                                        │   │
│  │   ○ Kathedrale / Kirche                                       │   │
│  │   ○ Studio-trocken                                            │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Token-Generierungslogik:**

```javascript
function generateOrchestraToken(config) {
    const parts = [];
    
    // Preset-Basis
    const presets = {
        'symphony': 'full symphony orchestra',
        'chamber': 'intimate chamber orchestra',
        'string_quartet': 'delicate string quartet',
        'brass_ensemble': 'powerful brass ensemble',
        'woodwind_choir': 'expressive woodwind choir',
        'solo': `solo ${config.soloInstrument}`
    };
    parts.push(presets[config.preset]);
    
    // Aktive Instrumente (wenn nicht alle)
    if (config.customInstruments) {
        const activeInstruments = config.instruments
            .filter(i => i.active)
            .map(i => i.name);
        parts.push(`featuring ${activeInstruments.join(', ')}`);
    }
    
    // Sektions-Dominanz
    const dominant = Object.entries(config.sectionBalance)
        .filter(([_, value]) => value > 70)
        .map(([section]) => section);
    
    if (dominant.length > 0) {
        parts.push(`with prominent ${dominant.join(' and ')}`);
    }
    
    // Raumakustik
    const acoustics = {
        'intimate': 'intimate chamber room acoustics',
        'concert_hall': 'lush concert hall reverberation',
        'cathedral': 'vast cathedral ambiance',
        'dry': 'dry studio recording'
    };
    parts.push(acoustics[config.acoustics]);
    
    return parts.join(', ');
}
```

---

### 4.3 Instrument-Blender

**Instrumenten-Katalog Datenstruktur:**

```javascript
const INSTRUMENT_CATALOG = {
    synthesizers: {
        name: 'Synthesizer',
        items: [
            { id: 'synth_pad', name: 'Synth Pad', description: 'lush synthesizer pad' },
            { id: 'synth_lead', name: 'Synth Lead', description: 'cutting synthesizer lead' },
            { id: 'synth_bass', name: 'Synth Bass', description: 'deep synthesizer bass' },
            { id: 'synth_pluck', name: 'Synth Pluck', description: 'plucky synthesizer stabs' },
            { id: 'synth_keys', name: 'Synth Keys', description: 'vintage synth keys' }
        ]
    },
    strings: {
        name: 'Streicher',
        items: [
            { id: 'violin', name: 'Violine', description: 'expressive violin' },
            { id: 'cello', name: 'Cello', description: 'warm cello' },
            { id: 'viola', name: 'Viola', description: 'rich viola' },
            { id: 'double_bass', name: 'Kontrabass', description: 'deep double bass' },
            { id: 'string_section', name: 'Streicher-Sektion', description: 'lush string section' }
        ]
    },
    winds: {
        name: 'Bläser',
        items: [
            { id: 'trumpet', name: 'Trompete', description: 'bright trumpet' },
            { id: 'trombone', name: 'Posaune', description: 'rich trombone' },
            { id: 'saxophone', name: 'Saxophon', description: 'expressive saxophone' },
            { id: 'flute', name: 'Flöte', description: 'airy flute' },
            { id: 'clarinet', name: 'Klarinette', description: 'warm clarinet' }
        ]
    },
    ethnic: {
        name: 'Ethnische Instrumente',
        items: [
            { id: 'sitar', name: 'Sitar', description: 'meditative sitar' },
            { id: 'shakuhachi', name: 'Shakuhachi', description: 'breathy shakuhachi flute' },
            { id: 'duduk', name: 'Duduk', description: 'haunting duduk' },
            { id: 'pan_flute', name: 'Panflöte', description: 'ethereal pan flute' },
            { id: 'native_flute', name: 'Indigene Flöte', description: 'native american flute' },
            { id: 'didgeridoo', name: 'Didgeridoo', description: 'droning didgeridoo' },
            { id: 'erhu', name: 'Erhu', description: 'emotional erhu' },
            { id: 'koto', name: 'Koto', description: 'delicate koto' }
        ]
    },
    percussion: {
        name: 'Percussion',
        items: [
            { id: 'drums', name: 'Drum Kit', description: 'acoustic drums' },
            { id: 'congas', name: 'Congas', description: 'latin congas' },
            { id: 'tabla', name: 'Tabla', description: 'intricate tabla' },
            { id: 'taiko', name: 'Taiko', description: 'thunderous taiko drums' },
            { id: 'hand_percussion', name: 'Handpercussion', description: 'organic hand percussion' }
        ]
    },
    keyboards: {
        name: 'Tasteninstrumente',
        items: [
            { id: 'piano', name: 'Klavier', description: 'grand piano' },
            { id: 'electric_piano', name: 'E-Piano', description: 'vintage electric piano' },
            { id: 'organ', name: 'Orgel', description: 'warm organ' },
            { id: 'harpsichord', name: 'Cembalo', description: 'baroque harpsichord' },
            { id: 'harp', name: 'Harfe', description: 'celestial harp' }
        ]
    }
};
```

**Blend-Token-Generierung:**

```javascript
function generateBlendToken(primary, secondary, ratio, mode) {
    // Primary und Secondary als Instrument-IDs
    const primaryInstr = findInstrument(primary);
    const secondaryInstr = findInstrument(secondary);
    
    const blendModes = {
        'harmonic': 'harmoniously layered with',
        'contrasting': 'juxtaposed against',
        'layered': 'textured with',
        'frequency_split': 'frequency-split with'
    };
    
    const secondaryRatio = 100 - ratio;
    
    if (mode === 'frequency_split') {
        return `${primaryInstr.description} handling the low frequencies, ${blendModes[mode]} ${secondaryInstr.description} in the highs`;
    }
    
    return `${ratio}% ${primaryInstr.description} ${blendModes[mode]} ${secondaryRatio}% ${secondaryInstr.description} textures`;
}
```

---

## 5. KI-Interpretierbarkeits-Analyse

### 5.1 Validierte Token-Muster

Die folgenden Token-Muster wurden empirisch als konsistent interpretierbar identifiziert:

| Kategorie | Token-Muster | Beispiel | Konfidenz |
|-----------|--------------|----------|-----------|
| Wellenform | `[adj] [waveform] synthesizer` | "warm sawtooth synthesizer" | ⭐⭐⭐⭐⭐ |
| Filter | `[adj] filtered` / `filtered below [freq]` | "low-pass filtered below 8kHz" | ⭐⭐⭐⭐ |
| Envelope | `with [adj] attack and [adj] release` | "with slow attack and long release" | ⭐⭐⭐⭐⭐ |
| Effekte | `drenched in [effect]` / `with [adj] [effect]` | "drenched in reverb" | ⭐⭐⭐⭐⭐ |
| Blend | `blended with [ratio]% [instrument] textures` | "blended with 30% flute textures" | ⭐⭐⭐⭐ |
| Orchester | `[size] orchestra with [instruments]` | "chamber orchestra with strings" | ⭐⭐⭐⭐⭐ |
| Raum | `[size] [venue] acoustics` | "vast concert hall acoustics" | ⭐⭐⭐⭐ |
| Emotion | `[emotion] feel/atmosphere` | "melancholic atmosphere" | ⭐⭐⭐⭐⭐ |

### 5.2 Problematische Konzepte (ausgeschlossen)

| Konzept | Problem | Status |
|---------|---------|--------|
| Phasenverschiebung | Mathematisch, erfordert Grad-Werte | ❌ Ausgeschlossen |
| Komplexe Wavetables | Nicht textlich darstellbar | ❌ Ausgeschlossen |
| FM-Algorithmen | Zu technisch (Operator-Verhältnisse) | ❌ Ausgeschlossen |
| Präzise ADSR (ms) | KI kann ms-Werte nicht umsetzen | ❌ Ausgeschlossen |
| LFO-Frequenzen | Numerisch, inkonsistente Interpretation | ❌ Ausgeschlossen |
| Modulations-Matrizen | Zu komplex für Text | ❌ Ausgeschlossen |

### 5.3 Grenzfälle (mit Vorsicht verwenden)

| Konzept | Empfohlene Umsetzung | Warnung |
|---------|---------------------|---------|
| Resonanz | "resonant" vs "no resonance" | Graduelle Werte vermeiden |
| Cutoff-Frequenz | Beschreibend ("below 8kHz") | Exakte Hz nur als Orientierung |
| Stereo-Breite | "wide" / "mono" / "centered" | Keine Prozent-Werte |
| Lautstärke-Verhältnisse | "dominant" / "subtle" / "balanced" | Keine dB-Werte |

---

## 6. Implementierungs-Roadmap

### Phase 1: Grundstruktur (1-2 Tage)
- [ ] Tile-Integration (Storyboard ersetzen)
- [ ] Modal-Grundstruktur
- [ ] Tab-Navigation
- [ ] Basis-CSS mit Farbschema

### Phase 2: Synth-Designer Pro (2-3 Tage)
- [ ] UI-Komponenten
- [ ] Token-Generierung
- [ ] Blend-Funktion
- [ ] Integration mit Hauptprompt

### Phase 3: Orchester-Designer (2-3 Tage)
- [ ] Preset-System
- [ ] Sitzplan-Visualisierung (SVG/CSS)
- [ ] Instrumenten-Toggles
- [ ] Token-Generierung

### Phase 4: Weitere Module (pro Modul 1-2 Tage)
- [ ] Instrument-Blender
- [ ] Vocal-Designer
- [ ] Rhythmus-Labor
- [ ] Ambient-Architekt

### Phase 5: Polishing (2-3 Tage)
- [ ] Responsive Design
- [ ] Keyboard-Navigation
- [ ] Performance-Optimierung
- [ ] Dokumentation

---

## 7. Testplan

### 7.1 Unit-Tests

```javascript
describe('Token Generation', () => {
    test('generateSynthToken creates valid output', () => {
        const config = {
            waveform: 'sawtooth',
            filterValue: 50,
            cutoff: '8000Hz',
            envelope: 'pad',
            effects: ['reverb'],
            blendSound: 'native_flute',
            blendRatio: 30
        };
        
        const token = generateSynthToken(config);
        
        expect(token).toContain('sawtooth');
        expect(token).toContain('balanced');
        expect(token).toContain('8000');
        expect(token).toContain('pad');
        expect(token).toContain('reverb');
        expect(token).toContain('30%');
        expect(token).toContain('native');
    });
});
```

### 7.2 KI-Validierung

Generierte Tokens sollten mit verschiedenen Musik-KIs getestet werden:
1. Suno AI (primäres Ziel)
2. Udio
3. Andere Text-zu-Musik-Systeme

**Validierungskriterien:**
- [ ] Token wird erkannt und interpretiert
- [ ] Ergebnis entspricht der Intention
- [ ] Keine unerwarteten Nebeneffekte
- [ ] Konsistente Ergebnisse bei Wiederholung

---

## 8. Referenzen

- [KLANG_STUDIO_FEATURE_LISTE.md](./KLANG_STUDIO_FEATURE_LISTE.md) - Feature-Übersicht
- [KLANG_STUDIO_ANFORDERUNGSANALYSE.md](./KLANG_STUDIO_ANFORDERUNGSANALYSE.md) - Anforderungen
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Projekt-Design-System
- [js/features.js](./js/features.js) - Bestehende Feature-Logik
- [js/modals.js](./js/modals.js) - Modal-Templates
