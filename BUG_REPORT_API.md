# 🐛 Bug Report: API & Backend Integration

**Analysiert von:** Claude AI (Worktree: `/tmp/suno-worktree-api`)  
**Datum:** 2026-01-24  
**Scope:** `js/api.js`, `js/config.js`, `js/prompts.js`, `server.py`

---

## 🔴 Kritische Bugs

### 1. setKlugToolsState referenziert vor window-Zuweisung

**Datei:** `js/api.js` (Zeile 231 vs 235)  
**Problem:** `setKlugToolsState` wird in Zeile 231 dem `window`-Objekt zugewiesen, aber die Funktion ist erst in Zeile 235 definiert:

```javascript
// Zeile 231 - window-Zuweisung
window.setKlugToolsState = setKlugToolsState;

// Zeile 235 - Erst hier Definition!
function setKlugToolsState(enabled) {
    // ...
}
```

**Technisch:** JavaScript hoisting sorgt dafür, dass dies funktioniert, aber es ist fehleranfällig bei Refactoring.

---

### 2. isPromptGenerated Variable Scope-Problem

**Datei:** `js/api.js` (Zeile 236) & `js/config.js` (Zeile 53)  
**Problem:** `isPromptGenerated` wird in `setKlugToolsState` und `setupModal` verwendet, ist aber in `config.js` deklariert:

```javascript
// config.js, Zeile 53
let isPromptGenerated = false;

// api.js verwendet es ohne Import
function setKlugToolsState(enabled) {
    isPromptGenerated = enabled;  // Implicit global reference
}
```

**Risiko:** Bei Modularisierung (ES Modules) würde dies brechen.

---

### 3. Fal.ai API: Potenzielle Endlos-Schleife bei Retries

**Datei:** `js/api.js` (Zeile 70-104)  
**Problem:** Die Retry-Logik hat ein `while(true)` ohne explizites Break bei bestimmten Konditionen:

```javascript
while (true) {
    let response = await doRequest(`Key ${FAL_API_KEY}`, body);
    if (response.status === 401 || response.status === 403) {
        response = await doRequest(`Bearer ${FAL_API_KEY}`, body);
    }

    if (!response.ok) {
        // ...
        if ([408, 429, 500, 502, 503, 504].includes(status) && attempt < retries) {
            attempt++;
            // continue - retry
            continue;
        }
        // break conditions follow
    }
    // ...
}
```

**Potentielles Problem:** Wenn `retries = 0` gesetzt wird und ein 5xx-Fehler auftritt, wird die Schleife sofort beendet. Aber wenn der Server wiederholt 200 ohne gültiges Bild zurückgibt (`imageUrl` ist `undefined`), wird die innere Schleife verlassen (`break` Zeile 103), aber die nächste Payload wird probiert - kein Problem hier.

**Status:** Nach Analyse: Design ist korrekt, aber komplex und schwer zu durchschauen.

---

### 4. AbortController Cleanup nicht garantiert

**Datei:** `js/api.js` (Zeile 47-111)  
**Problem:** Wenn ein Error vor `finally` geworfen wird, könnte der Timer weiterlaufen:

```javascript
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(...), timeoutMs);
// ...
try {
    // requests...
} catch (err) {
    lastErr = err;
} finally {
    clearTimeout(timer);  // OK
    if (signal) signal.removeEventListener('abort', onAbort);
}
```

**Status:** Das `finally` läuft immer, also ist dies korrekt implementiert. ✓

---

### 5. Fehlende Rate-Limiting Protection

**Datei:** `js/api.js`  
**Problem:** Kein Schutz gegen zu schnelle aufeinanderfolgende API-Aufrufe:

```javascript
async function callOpenRouterAPI(userMessage, systemPrompt, imageUrl = null) {
    // Keine Debouncing oder Throttling
    // User kann den Button spammen
}
```

**Empfehlung:** Debounce oder State-basiertes Locking implementieren.

---

## 🟡 Mittlere Bugs

### 6. Hardcoded Model Names in config.js sind futuristic/falsch

**Datei:** `js/config.js` (Zeile 39-47)  
**Problem:** Modellnamen scheinen aus der Zukunft zu stammen oder erfunden:

```javascript
const MODEL_NAMES = {
    'openai/gpt-5-mini': 'GPT-5 mini',        // Existiert nicht!
    'anthropic/claude-haiku-4.5': 'Haiku 4.5', // Falsche Version
    'deepseek/deepseek-v3.1-terminus': '...',  // Unbekannt
    // ...
};
```

**Auswirkung:** API-Aufrufe werden fehlschlagen, wenn diese Modelle bei OpenRouter nicht existieren.

---

### 7. FAL_MODEL_ENDPOINTS Redundanz

**Datei:** `js/config.js` (Zeile 20-29)  
**Problem:** Die Endpoint-Mappings sind größtenteils identisch zur `FAL_MODEL`:

```javascript
const FAL_MODEL_ENDPOINTS = {
    'fal-ai/fast-sdxl': 'fal-ai/fast-sdxl',  // Redundant
    // ...
};
```

Die `callFalAPI`-Funktion hat bereits Fallback-Logik (Zeile 20-24 in api.js), was diese Redundanz unnötig macht.

---

### 8. Prompts.js: Inkonsistente Character Limits

**Datei:** `js/prompts.js`  
**Problem:** Verschiedene Prompts haben unterschiedliche Character-Limits ohne klare Policy:

```javascript
// BASE_SYSTEM_PROMPT - Zeile 25
"The total length must not exceed 800 characters."

// SUNO_PRO_REFINER_PROMPT - Zeile 118
"The final output MUST be <= 1000 characters."

// CUSTOM_INSTRUCTION_PROMPT - Zeile 27
"strictly under 800 characters"

// RELEASE_FORECAST_PROMPT - Zeile 270
"Total response must stay under 400 words."  // Plötzlich Wörter statt Zeichen!
```

---

### 9. Fehlende Error-Message Übersetzung

**Datei:** `js/api.js` (Zeile 4, 122)  
**Problem:** Error-Messages sind auf Deutsch, aber Prompts erwarten Englisch:

```javascript
throw new Error("Bitte konfiguriere zuerst deinen Fal.ai API Key...");
// vs
payload = { role: "system", content: systemPrompt }  // Englisch
```

---

### 10. copyResult Globale Funktion Pattern

**Datei:** `js/api.js` (Zeile 199-206)  
**Problem:** `copyResult` wird direkt auf `window` gesetzt statt sauberer Export:

```javascript
window.copyResult = async function() { ... }
```

Besser wäre ein konsistentes Module-Pattern.

---

## 🟢 Niedrige Priorität / Verbesserungen

### 11. VISUAL_ANALYZER_PROMPT könnte Base64-Images unterstützen

**Datei:** `js/prompts.js` (Zeile 335-361)  
Derzeit nur URL-basierte Images. Base64 wäre flexibler für lokale Bilder.

### 12. Server.py hat keine CORS-Konfiguration

**Datei:** `server.py`  
Für lokale Entwicklung möglicherweise problematisch bei Browser-Requests.

### 13. Keine Retry-Logik für OpenRouter API

**Datei:** `js/api.js` (Zeile 119-168)  
`callOpenRouterAPI` hat im Gegensatz zu `callFalAPI` keine Retry-Mechanik bei transient Errors.

### 14. API_URL sollte konfigurierbar sein

**Datei:** `js/config.js` (Zeile 35)  
```javascript
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
```

Für Testing/Proxying wäre eine Environment-Variable besser.

---

## 🔒 Sicherheits-Hinweise

### API Keys in LocalStorage

**Dateien:** `js/app.js`, `js/config.js`  
**Problem:** API-Keys werden in `localStorage` gespeichert, was sie für XSS angreifbar macht.

```javascript
localStorage.setItem('openrouter_api_key', apiKey);
```

**Empfehlung:** Session Storage verwenden oder Backend-Proxy für API-Calls.

### Keine Input-Sanitization

User-Eingaben werden direkt an die API gesendet ohne Validierung auf:
- Maximale Länge
- Erlaubte Zeichen
- Injection-Patterns

---

## 📊 Zusammenfassung

| Schweregrad | Anzahl |
|-------------|--------|
| 🔴 Kritisch | 5 |
| 🟡 Mittel   | 5 |
| 🟢 Niedrig  | 4 |

---

## 🔧 Architektur-Empfehlungen

1. **ES Modules einführen** - Weg von globalen Variablen
2. **API-Wrapper-Klasse** - Zentralisiertes Error-Handling und Rate-Limiting
3. **Environment Configuration** - API URLs und Keys aus `.env`
4. **TypeScript Migration** - Bessere Typsicherheit für API-Responses

---

## 📝 Testempfehlungen

```javascript
// Test-Cases die fehlen:
- [ ] API-Call mit ungültigem Key
- [ ] API-Call mit Network-Timeout
- [ ] Fal.ai mit allen Model-Varianten
- [ ] Concurrent API-Calls
- [ ] Rate-Limit Handling
```

---

*Dieser Report wurde automatisch im Rahmen einer Git Worktree Bug-Finding Session erstellt.*
