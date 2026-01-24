# 🔧 LLM Bug-Fix Prompts

**Generiert:** 2026-01-24  
**Projekt:** Suno Style Architect

Jeder Prompt ist so formuliert, dass ein LLM den Bug vollständig und mit Best Practices fixen kann.

---

# 📁 FRONTEND BUGS

---

## BUG-F01: Race Condition bei Modal-Initialisierung

```
Du bist ein erfahrener JavaScript-Entwickler. Fixe folgenden Bug in einer Web-Anwendung:

**Problem:** In `js/app.js` Zeile 231 wird `setupCopyButton()` aufgerufen, aber diese Funktion ist in `js/api.js` definiert. Bei langsamen Netzwerken oder geänderter Script-Ladereihenfolge kann dies zu einem TypeError führen.

**Betroffene Datei:** `js/app.js`

**Aktueller Code (Zeile 228-232):**
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setKlugToolsState(false);
    setupCopyButton(copyButton, copyIcon, checkIcon, resultText);
});

**Aufgabe:**
1. Füge einen defensiven Check hinzu, ob `setupCopyButton` existiert bevor es aufgerufen wird
2. Optional: Logge eine Warnung in die Konsole wenn die Funktion nicht verfügbar ist
3. Behalte die bestehende Funktionalität bei

**Best Practices:**
- Verwende `typeof` für die Funktionsprüfung
- Keine Änderungen an anderen Dateien notwendig
- Halte den Code minimal und lesbar
```

---

## BUG-F02: SVG-Path Syntax-Fehler

```
Du bist ein Frontend-Entwickler. Fixe einen SVG-Rendering-Bug:

**Problem:** In `index.html` Zeile 162 ist der SVG-Path für den Suno Pro Loader fehlerhaft. Es fehlen Zeichen in der Path-Definition.

**Betroffene Datei:** `index.html`

**Fehlerhafter Code (Zeile 162):**
<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">

**Aufgabe:**
1. Korrigiere den SVG-Path-String. Der korrekte Path für einen Spinner ist:
   d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
2. Ändere NUR diese eine Zeile

**Hinweis:** Der Fehler ist `0 818-8` sollte `0 0 1 8-8` sein und `0 714 12` sollte `0 0 1 4 12` sein.
```

---

## BUG-F03: API Key Validierung zu restriktiv

```
Du bist ein JavaScript-Entwickler. Verbessere die API-Key-Validierung:

**Problem:** In `js/app.js` Zeile 86-89 werden nur Keys akzeptiert die mit `sk-or-v1-` beginnen. OpenRouter unterstützt aber auch andere Formate.

**Betroffene Datei:** `js/app.js`

**Aktueller Code:**
if (!apiKey.startsWith('sk-or-v1-')) {
    alert('Der API Key sollte mit "sk-or-v1-" beginnen. Bitte überprüfe deinen Key.');
    return;
}

**Aufgabe:**
1. Ändere die Validierung so, dass Keys akzeptiert werden die mit `sk-or-` ODER `sk-` beginnen
2. Mache die Warnung zu einer Console-Warnung statt einem blockierenden Alert
3. Lass den Speichervorgang trotzdem fortfahren (User-Entscheidung respektieren)

**Neuer Code sollte:**
- Eine console.warn() ausgeben wenn das Format ungewöhnlich ist
- NICHT den Speichervorgang blockieren
- Den User informieren aber nicht nerven
```

---

## BUG-F04: Typo in deutscher Beschreibung

```
Einfacher Textfix:

**Datei:** `index.html`, Zeile 45
**Problem:** Tippfehler "Standart" statt "Standard"

**Aktuell:**
<p class="text-xs text-neutral-500 mt-1">Standart ist gpt-5-mini (Preis-Leistungs-Verhältnis)</p>

**Korrigiert:**
<p class="text-xs text-neutral-500 mt-1">Standard ist gpt-5-mini (Preis-Leistungs-Verhältnis)</p>
```

---

## BUG-F05: Z-Index System

```
Du bist ein CSS-Architekt. Implementiere ein z-index System:

**Problem:** Z-Index-Werte sind über `index.html` verteilt ohne klare Hierarchie (z-[90], z-[95], z-[100], z-[105], z-[110], z-[120]).

**Betroffene Datei:** `css/styles.css`

**Aufgabe:**
1. Füge am Anfang von `styles.css` CSS Custom Properties für z-index-Layers hinzu
2. Die Hierarchie sollte sein:
   - --z-base: 1
   - --z-dropdown: 50
   - --z-sticky: 60
   - --z-overlay: 90
   - --z-modal: 100
   - --z-popover: 110
   - --z-tooltip: 120

**Hinweis:** Die Tailwind-Klassen in `index.html` bleiben vorerst bestehen. Dies ist Vorbereitung für spätere Migration. Füge nur die CSS-Variablen und einen Kommentar hinzu.
```

---

# 📁 FEATURES BUGS

---

## BUG-FE01: Doppelte Initialisierung (KRITISCH)

```
Du bist ein erfahrener JavaScript-Entwickler. Fixe einen kritischen Bug:

**Problem:** In `js/features.js` werden Features ZWEIMAL initialisiert - bei `DOMContentLoaded` und bei `modals:ready`. Die meisten Setup-Funktionen haben keine Guard gegen doppelte Initialisierung, was zu doppelten Event-Listenern führt.

**Betroffene Datei:** `js/features.js`

**Aktueller Code (Zeile 1-19):**
document.addEventListener('DOMContentLoaded', () => {
    initializeAdvancedFeatures();
});

document.addEventListener('modals:ready', () => {
    initializeAdvancedFeatures();
});

function initializeAdvancedFeatures() {
    setupIdeaSpark();
    setupExpertRefinements();
    setupKlugTools();
    setupVisualEngine();
    setupFutureLabTools();
    setupCustomInstruction();
}

**Aufgabe:**
1. Füge eine globale Guard-Variable hinzu die doppelte Initialisierung verhindert
2. Implementiere es so:

let _featuresInitialized = false;

function initializeAdvancedFeatures() {
    if (_featuresInitialized) {
        console.debug('[Features] Already initialized, skipping.');
        return;
    }
    _featuresInitialized = true;
    
    // Rest des Codes...
}

**Best Practices:**
- Verwende einen Underscore-Prefix für die private Variable
- Füge Debug-Logging hinzu
- Ändere NUR die `initializeAdvancedFeatures` Funktion und füge die Variable hinzu
```

---

## BUG-FE02: Memory Leak durch Event Listener

```
Du bist ein JavaScript-Performance-Experte. Fixe Memory Leaks:

**Problem:** In `js/features.js` werden bei jeder Modal-Interaktion neue Event-Listener auf dynamisch erstellte Buttons registriert, ohne alte zu entfernen.

**Beispiel aus setupAdaptiveFlow (Zeile 533-558):**
output.innerHTML = `...
    <button id="apply-adaptive-flow-button">...</button>
...`;
const applyButton = output.querySelector('#apply-adaptive-flow-button');
applyButton?.addEventListener('click', () => { ... });

**Betroffene Funktionen in js/features.js:**
- setupAdaptiveFlow
- setupAiCollaboration  
- setupStoryArcDesigner
- setupImmersiveSpace
- setupHumanTouch
- setupReleaseForecast

**Aufgabe:**
Für JEDE betroffene Funktion, ändere das Pattern zu Event Delegation. Beispiel für setupAdaptiveFlow:

STATT:
const applyButton = output.querySelector('#apply-adaptive-flow-button');
applyButton?.addEventListener('click', () => { ... });

BESSER:
output.addEventListener('click', (e) => {
    if (e.target.matches('#apply-adaptive-flow-button')) {
        // Handler-Logic hier
    }
});

**Best Practices:**
- Event Delegation auf dem Container-Element
- Ein Listener pro Container statt pro Button
- Verwende `matches()` für Target-Prüfung
```

---

## BUG-FE03: Globale Variable selectedKlugItems

```
Du bist ein JavaScript-Entwickler. Verbessere die Code-Qualität:

**Problem:** In `js/features.js` Zeile 1180 wird `selectedKlugItems` verwendet, aber die Variable ist in `js/config.js` deklariert - eine implizite globale Abhängigkeit.

**Betroffene Dateien:** 
- `js/features.js` (verwendet die Variable)
- `js/config.js` (deklariert die Variable)

**Aktuell in config.js:**
let selectedKlugItems = [];

**Aufgabe:**
1. In `js/config.js`: Exportiere die Variable explizit auf window
2. In `js/features.js`: Greife explizit über window zu

**Änderung in config.js (nach Zeile 55):**
// Explicit global exports for cross-file access
window.selectedKlugItems = selectedKlugItems;

**Änderung in features.js (Zeile 1180):**
// Statt: selectedKlugItems = [];
window.selectedKlugItems = [];

**Best Practice:** Dies macht die Abhängigkeit explizit sichtbar bis zur ES-Module-Migration.
```

---

## BUG-FE04: Inkonsistente Button-ID Naming

```
Du bist ein Code-Reviewer. Dokumentiere und fixe inkonsistente Naming:

**Problem:** In `js/features.js` setupKlugTagger (Zeile 1148-1169) gibt es spezielle Ausnahmen für Button-IDs die das Muster brechen.

**Aktueller Code:**
switch (toolId) {
    case 'mood-analyzer':
        applyId = 'apply-mood-button';
        // Erwartet wäre: 'apply-mood-analyzer-button'
    case 'vocal-stylist':
        applyId = 'apply-vocal-style-button';
        // Erwartet wäre: 'apply-vocal-stylist-button'
}

**Aufgabe:**
Da dies auch HTML-Änderungen erfordern würde, erstelle stattdessen einen Kommentar der das Problem dokumentiert:

// TECH DEBT: Button IDs folgen keinem konsistenten Muster.
// 'mood-analyzer' -> 'apply-mood-button' (nicht 'apply-mood-analyzer-button')
// 'vocal-stylist' -> 'apply-vocal-style-button' (nicht 'apply-vocal-stylist-button')
// TODO: Bei nächstem Refactoring vereinheitlichen (erfordert HTML + JS Änderungen)

Füge diesen Kommentar VOR der switch-Anweisung ein (vor Zeile 1149).
```

---

## BUG-FE05: Fehlendes Error-Handling

```
Du bist ein JavaScript-Entwickler. Verbessere das Error-Handling:

**Problem:** Mehrere Funktionen in `js/features.js` haben nur `console.error` ohne User-Feedback.

**Beispiel setupSoundEngineer (Zeile 168-170):**
} catch (error) {
    console.error('Error with sound engineer instruction:', error);
}
// Kein User-Feedback!

**Aufgabe:**
Erstelle eine Helper-Funktion und nutze sie in den betroffenen catch-Blöcken:

1. Füge am Anfang von features.js hinzu:
function showFeatureError(featureName, error) {
    console.error(`[${featureName}] Error:`, error);
    const msg = error?.message || 'Ein unbekannter Fehler ist aufgetreten.';
    // Kurzes visuelles Feedback falls möglich
    const hud = document.getElementById('action-hud');
    if (hud) {
        hud.textContent = `❌ ${featureName}: ${msg}`;
        hud.classList.add('show');
        setTimeout(() => hud.classList.remove('show'), 3000);
    }
}

2. Ersetze leere catch-Blöcke mit:
} catch (error) {
    showFeatureError('Sound Engineer', error);
}
```

---

## BUG-FE06: XSS-Risiko durch innerHTML

```
Du bist ein Security-Experte. Fixe potenzielle XSS-Schwachstellen:

**Problem:** In `js/features.js` wird User-Content direkt in innerHTML eingefügt.

**Beispiel (Zeile 537):**
<pre class="...">${currentPrompt}</pre>

**Aufgabe:**
Erstelle eine Sanitize-Funktion und wende sie an:

1. Füge am Anfang von features.js hinzu:
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

2. Wende sie an wo User-Content in HTML eingefügt wird:
// Statt:
`<pre class="...">${currentPrompt}</pre>`

// Besser:
`<pre class="...">${escapeHtml(currentPrompt)}</pre>`

**Betroffene Stellen suchen mit:** Suche nach `${currentPrompt}` und `${cleanPrompt}` in Template-Literals die innerHTML zugewiesen werden.
```

---

# 📁 API BUGS

---

## BUG-A01: Fehlende Rate-Limiting Protection

```
Du bist ein API-Entwickler. Implementiere Rate-Limiting:

**Problem:** In `js/api.js` gibt es keinen Schutz gegen zu schnelle API-Aufrufe.

**Betroffene Datei:** `js/api.js`

**Aufgabe:**
Füge ein einfaches Debounce/Lock-System für API-Calls hinzu:

1. Füge am Anfang von api.js hinzu:
// Simple API call locking to prevent spam
const _apiLocks = {
    openrouter: false,
    fal: false
};

function withApiLock(lockName, asyncFn) {
    return async function(...args) {
        if (_apiLocks[lockName]) {
            console.warn(`[API] ${lockName} call already in progress, skipping.`);
            throw new Error('Ein API-Aufruf läuft bereits. Bitte warten.');
        }
        _apiLocks[lockName] = true;
        try {
            return await asyncFn.apply(this, args);
        } finally {
            _apiLocks[lockName] = false;
        }
    };
}

2. Wrape die API-Funktionen:
// Am Ende der callOpenRouterAPI Definition:
const _originalCallOpenRouterAPI = callOpenRouterAPI;
callOpenRouterAPI = withApiLock('openrouter', _originalCallOpenRouterAPI);

// Analog für callFalAPI
```

---

## BUG-A02: Futuristische Model-Namen

```
Du bist ein Entwickler. Korrigiere die Model-Konfiguration:

**Problem:** In `js/config.js` sind Model-Namen wie "gpt-5-mini" oder "claude-haiku-4.5" die (noch) nicht existieren.

**Betroffene Datei:** `js/config.js`

**Aufgabe:**
Ersetze die Model-Namen durch aktuell existierende OpenRouter-Modelle:

const MODEL_NAMES = {
    'openai/gpt-4o-mini': 'GPT-4o mini',
    'anthropic/claude-3-haiku': 'Claude 3 Haiku',
    'deepseek/deepseek-chat': 'Deepseek Chat',
    'google/gemini-pro': 'Gemini Pro',
    'meta-llama/llama-3-8b-instruct': 'Llama 3 8B'
};

**Wichtig:** Ändere auch:
1. Den Default-Wert in SELECTED_MODEL (Zeile 34)
2. Die <option> Elemente in index.html im model-select Dropdown

Halte die Liste kurz (5-6 bewährte Modelle).
```

---

## BUG-A03: Inkonsistente Character Limits in Prompts

```
Du bist ein Prompt-Engineer. Vereinheitliche die Limits:

**Problem:** In `js/prompts.js` haben verschiedene Prompts unterschiedliche Limits (800 chars, 1000 chars, 400 words).

**Betroffene Datei:** `js/prompts.js`

**Aufgabe:**
1. Definiere am Anfang der Datei Standard-Limits:
// Standard output limits for Suno prompts
const PROMPT_LIMITS = {
    STANDARD: 800,      // Standard style prompts
    PRO: 1000,          // Detailed pro prompts
    SHORT: 400          // Brief responses (characters, not words)
};

2. Füge einen Kommentar hinzu der die Regel erklärt:
// CONVENTION: All prompts should specify character limits, not word limits.
// - Standard prompts: 800 characters
// - Pro/detailed prompts: 1000 characters  
// - Short responses: 400 characters

3. In RELEASE_FORECAST_PROMPT (Zeile 270): Ändere "400 words" zu einer character-basierten Angabe oder belasse es als dokumentierte Ausnahme.
```

---

## BUG-A04: API Keys in LocalStorage (Security)

```
Du bist ein Security-Experte. Dokumentiere das Risiko:

**Problem:** API-Keys werden in localStorage gespeichert, was sie für XSS angreifbar macht.

**Betroffene Dateien:** `js/app.js`

**Aufgabe (Dokumentation - kein Code-Fix weil architektonische Änderung nötig):**

Füge einen Kommentar in app.js vor der saveSettings Funktion ein:

// SECURITY NOTE: API keys are stored in localStorage which is vulnerable to XSS attacks.
// For production deployment, consider:
// 1. Using a backend proxy that holds the API keys
// 2. Using sessionStorage instead (cleared on tab close)
// 3. Implementing CSP headers to mitigate XSS
// 4. Using HttpOnly cookies with a backend relay
//
// Current approach is acceptable for local/personal use but not for public deployment.

Dieser Fix dokumentiert das Problem für zukünftige Entwickler.
```

---

## BUG-A05: Fehlende Retry-Logik für OpenRouter

```
Du bist ein API-Entwickler. Füge Retry-Logik hinzu:

**Problem:** `callFalAPI` hat Retry-Logik aber `callOpenRouterAPI` nicht.

**Betroffene Datei:** `js/api.js`

**Aufgabe:**
Füge Retry-Logik zu callOpenRouterAPI hinzu:

async function callOpenRouterAPI(userMessage, systemPrompt, imageUrl = null, options = {}) {
    const { retries = 2, retryDelayMs = 1000 } = options;
    
    if (!API_KEY) {
        throw new Error("Bitte konfiguriere zuerst deinen API Key in den Einstellungen.");
    }

    let lastError = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // ... bestehende Fetch-Logik ...
            
            const response = await fetch(API_URL, { ... });
            
            if (!response.ok) {
                const status = response.status;
                // Retry on transient errors
                if ([429, 500, 502, 503, 504].includes(status) && attempt < retries) {
                    const delay = retryDelayMs * (attempt + 1);
                    console.warn(`[API] Retry ${attempt + 1}/${retries} after ${delay}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw new Error(`API request failed (${status})`);
            }
            
            // ... bestehende Response-Verarbeitung ...
            
        } catch (error) {
            lastError = error;
            if (attempt < retries) continue;
        }
    }
    
    throw lastError || new Error('API call failed after retries');
}
```

---

# 📋 ZUSAMMENFASSUNG

| Bug-ID | Datei | Schweregrad | Geschätzter Aufwand |
|--------|-------|-------------|---------------------|
| F01 | app.js | 🔴 Kritisch | 5 min |
| F02 | index.html | 🔴 Kritisch | 2 min |
| F03 | app.js | 🟡 Mittel | 5 min |
| F04 | index.html | 🟢 Niedrig | 1 min |
| F05 | styles.css | 🟢 Niedrig | 5 min |
| FE01 | features.js | 🔴 Kritisch | 10 min |
| FE02 | features.js | 🔴 Kritisch | 30 min |
| FE03 | config.js, features.js | 🟡 Mittel | 10 min |
| FE04 | features.js | 🟢 Niedrig | 5 min |
| FE05 | features.js | 🟡 Mittel | 15 min |
| FE06 | features.js | 🟡 Mittel | 20 min |
| A01 | api.js | 🔴 Kritisch | 15 min |
| A02 | config.js, index.html | 🟡 Mittel | 10 min |
| A03 | prompts.js | 🟢 Niedrig | 10 min |
| A04 | app.js | 🟢 Dokumentation | 5 min |
| A05 | api.js | 🟡 Mittel | 20 min |

---

*Generiert für Suno Style Architect Bug-Fixing Session*
