# API-Spezifikation OpenRouter & fal.ai (Mac V1)

Asset zu Ticket [Ticket: API-Spezifikation OpenRouter & fal.ai](https://github.com/Ibaiv/Suno-Style-Architect/issues/132)
auf der Karte [Wayfinder-Karte: Native macOS-App (V1-Spezifikation)](https://github.com/Ibaiv/Suno-Style-Architect/issues/130).

Quelle: `js/api.js`, `js/config.js`, `js/app.js` (Settings-Persistenz), `js/features.js` (Aufrufstellen), Stand `main` @ 2026-07-21.

Diese Spezifikation beschreibt **was die Web-App tatsächlich tut** und **was der Swift-Client davon übernehmen soll**. Wo beides auseinandergeht, steht es unter „V1-Abweichung".

---

## 1. Umfang

In V1 gibt es genau **zwei** Netzwerk-Gegenstellen — keine weiteren Backends, kein eigener Server:

| Dienst | Zweck | V1 |
|---|---|---|
| OpenRouter Chat Completions | Alle Text-Features (Prompt-Generierung und sämtliche Tools) | ja |
| OpenRouter Chat Completions mit Bild | Visual Engine → „Bild analysieren" | ja |
| fal.ai Sync-Inference | Visual Engine → Bildgenerierung | ja |

**Nicht in V1** (Features gestrichen, damit auch ihre Aufrufe): Style Sync (`js/features.js:1993`, `:1998`, `:2179` — inkl. des einzigen Base64-Bild-Pfads), Klang Studio, Kreativbibliothek (`js/creative_cosmos.js:11658`). Der Swift-Client braucht daher **keinen Base64-Upload-Pfad** — nur Bild-URLs.

Alle 30+ Text-Features unterscheiden sich ausschließlich im System-Prompt und im User-Text; sie teilen sich **einen einzigen** Call. Der Swift-Client braucht also genau **eine** Chat-Methode, nicht eine pro Feature.

---

## 2. Konfiguration & Zustand

### 2.1 OpenRouter

| Wert | Inhalt |
|---|---|
| Endpunkt | `https://openrouter.ai/api/v1/chat/completions` (fix, `js/config.js:38`) |
| API-Key | Vom Nutzer eingegeben; Format-Prüfung: muss mit `sk-or-v1-` beginnen (`js/app.js`) |
| Default-Modell | `openai/gpt-5-mini` |

Auswählbare Textmodelle (`MODEL_NAMES`, `js/config.js:41-50`) — Modell-ID → Anzeigename:

| ID | Anzeige |
|---|---|
| `openai/gpt-5-mini` | GPT-5 mini |
| `anthropic/claude-haiku-4.5` | Haiku 4.5 |
| `deepseek/deepseek-v3.1-terminus` | Deepseek 3.1 terminus |
| `deepseek/deepseek-v3.2-exp` | Deepseek 3.2 Exp |
| `tngtech/deepseek-r1t2-chimera` | Deepseek-r1t2-chimera |
| `z-ai/glm-4.6` | GLM-4.6 |
| `x-ai/grok-4-fast` | Grok-4-fast |
| `inclusionai/ling-1t` | Ling-1T |

Die Liste ist **statisch einkompiliert**, nicht von OpenRouter abgefragt. V1 übernimmt das 1:1.

### 2.2 fal.ai

| Wert | Inhalt |
|---|---|
| Basis-URL | `https://fal.run/` (`js/config.js:11`) |
| Voller Endpunkt | `https://fal.run/<modell-pfad>`, z. B. `https://fal.run/fal-ai/nano-banana-pro` |
| API-Key | Vom Nutzer eingegeben; **keine** Formatprüfung |
| Default-Modell | `fal-ai/nano-banana-pro` |
| Optional? | Ja — ohne fal-Key ist nur die Bildgenerierung tot, die App läuft |

Auswählbare Bildmodelle (`FAL_MODEL_NAMES` / `FAL_MODEL_ENDPOINTS`, `js/config.js:14-33`). Modell-ID und Endpunkt-Pfad sind bei allen sieben **identisch** — die Mapping-Tabelle ist im Web-Code eine reine Identitätsabbildung.

| ID = Pfad | Anzeige |
|---|---|
| `fal-ai/nano-banana-pro` | Nano Banana Pro |
| `fal-ai/nano-banana-2` | Nano Banana 2 |
| `fal-ai/flux-pro` | Flux Pro |
| `fal-ai/flux-pro/kontext` | Flux Pro Kontext (img2img) |
| `fal-ai/recraft/v3/text-to-image` | Recraft V3 |
| `fal-ai/gpt-image-1.5` | GPT-Image 1.5 |
| `fal-ai/flux/dev` | FLUX.1 [dev] |

### 2.3 Persistenz (Web)

`localStorage`, geschrieben in `saveSettings()` (`js/app.js:111-115`), gelesen in `loadSettings()`:

| Schlüssel | Inhalt |
|---|---|
| `openrouter_api_key` + `ssa_api_key` | OpenRouter-Key, **doppelt** geschrieben |
| `selected_model` | Textmodell-ID |
| `fal_api_key` | fal-Key |
| `fal_model` | Bildmodell-ID |

Beim Laden werden zusätzlich Alt-Schlüssel (`OPENROUTER_API_KEY`, `api_key`, `FAL_API_KEY`) als Fallback gelesen — reine Migrations-Altlast.

**V1-Abweichung:** Ein Schlüssel pro Wert, keine Alt-Namen, keine Doppelschreibung — die Mac-App hat keine Migrationslast. **Wo** die Keys liegen (Keychain vs. `UserDefaults`) ist eine Architekturfrage und gehört nicht hierher → siehe §8.

### 2.4 Startverhalten

Ist beim Start kein OpenRouter-Key vorhanden, zeigt die Web-App **direkt den Settings-Dialog** statt der App (`loadSettings()`). Der fal-Key wird dabei nicht erzwungen. V1 übernimmt diese Regel; die native Ausprägung (Sheet, Onboarding-Fenster) entscheidet das UI-Mapping.

---

## 3. OpenRouter: Chat Completions

Eine Funktion deckt alles ab (`callOpenRouterAPI`, `js/api.js:243`):
`(userMessage, systemPrompt, imageUrl?) -> String`.

### 3.1 Request

```
POST https://openrouter.ai/api/v1/chat/completions
Content-Type:  application/json
Authorization: Bearer <OPENROUTER_API_KEY>
HTTP-Referer:  <window.location.origin>
X-Title:       Suno Style Architect
```

Body:

```json
{
  "model": "<SELECTED_MODEL>",
  "stream": false,
  "messages": [
    { "role": "system", "content": "<systemPrompt>" },
    { "role": "user",   "content": "<userMessage>" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "top_p": 0.9
}
```

Die Sampling-Parameter sind **für alle Features gleich** — es gibt keine Feature-spezifischen Overrides.

**`HTTP-Referer`:** Im Web `window.location.origin`. Eine native App hat keinen Origin. OpenRouter nutzt den Header nur für Attribution/Ranking, er ist nicht auth-relevant. **V1-Entscheidung:** feste Kennung senden, z. B. `https://github.com/Ibaiv/Suno-Style-Architect`, und `X-Title: Suno Style Architect` unverändert lassen.

### 3.2 Vision-Variante

Ist `imageUrl` gesetzt, wird `content` der User-Message von einem String zu einem Array (`js/api.js:248-253`):

```json
"content": [
  { "type": "text", "text": "<userMessage>" },
  { "type": "image_url", "image_url": { "url": "<imageUrl>" } }
]
```

Alles andere bleibt gleich — **gleiches Modell**, gleiche Parameter. Der Nutzer muss also ein vision-fähiges Textmodell gewählt haben; die App prüft das **nicht** und warnt auch nicht. In V1 ist der einzige Vision-Aufruf „Bild analysieren" in der Visual Engine (`js/features.js:826`) mit `VISUAL_ANALYZER_PROMPT` und dem User-Text `"Image prompt used to generate the picture:\n<prompt>"`; als `imageUrl` dient die fal.ai-Ergebnis-URL.

**Offene V1-Frage:** ob die Mac-App vision-fähige Modelle markiert oder vorwarnt → §8.

### 3.3 Response

Erwartet wird OpenAI-kompatibles JSON. Auswertung in dieser Reihenfolge (`js/api.js:318-325`):

1. `choices[0].message.content` vorhanden → **trimmen und zurückgeben**. Das ist der Erfolgsfall.
2. `error` vorhanden → Fehler mit `error.message` (HTTP 200 mit Fehlerobjekt kommt bei OpenRouter vor).
3. sonst → generischer Fehler.

Der Body wird bewusst erst als **Text** gelesen und dann geparst; misslingt das Parsen, lautet die Meldung `"API-Antwort konnte nicht verarbeitet werden. Möglicherweise ein Server-Problem."`

Der Rückgabewert ist **immer roher Text**. Wo Features JSON erwarten, parsen sie selbst — und bei Parse-Fehlern schickt `js/features.js:1276` die kaputte Antwort mit `JSON_REPAIR_PROMPT` erneut durch dieselbe Chat-Methode. Der API-Layer weiß davon nichts; er kennt nur Strings.

### 3.4 Fehler & Timeout

- `!response.ok` → Fehlertext `API request failed (<status>)`, danach durch die Mapping-Tabelle (§6).
- Timeout: **60 s** über `AbortController` (`js/api.js:268-271`).
- **Kein Retry.** Die Chat-Methode versucht es genau einmal.
- Vision-Aufrufe liegen zusätzlich in einem `withTimeout(…, 60000)`-Wrapper (`js/features.js:734`, `:825`) — ein redundanter zweiter Timeout über demselben Zeitraum.

**V1-Abweichung:** Ein Timeout-Mechanismus genügt (Swift: `URLRequest.timeoutInterval` bzw. `Task`-Cancellation). Den doppelten Wrapper nicht portieren. Die 60 s bleiben.

---

## 4. fal.ai: Bildgenerierung

`callFalAPI(prompt, { timeoutMs = 120000, retries = 2, signal })` → Bild-URL als String (`js/api.js:60`).

### 4.1 Request

```
POST https://fal.run/<endpoint>
Content-Type:  application/json
Accept:        application/json
Authorization: Key <FAL_API_KEY>
```

Der Aufruf ist **synchron**: fal.run liefert das fertige Ergebnis im Response-Body. Es gibt **keine** Queue-, Polling- oder Webhook-Logik (`fal.ai/queue`-API wird nicht verwendet).

**Auth-Fallback im Web:** Bei `401`/`403` wird derselbe Request mit `Authorization: Bearer <key>` wiederholt (`js/api.js:196-198`). `Key <token>` ist das dokumentierte fal.ai-Schema.
**V1-Abweichung:** nur `Key <token>`. Ein 401 ist ein echter Auth-Fehler und soll als solcher gemeldet werden, nicht mit einem zweiten Schema übertüncht.

### 4.2 Payloads je Modell

Der Payload wird pro Modell fest gewählt (`buildPayloads`, `js/api.js:86-166`). `prompt` ist überall der einzige dynamische Wert; alle übrigen Felder sind Konstanten.

**`fal-ai/nano-banana-pro`** (Default)
```json
{ "prompt": "…", "num_images": 1, "aspect_ratio": "16:9", "output_format": "png" }
```

**`fal-ai/nano-banana-2`**
```json
{ "prompt": "…", "num_images": 1, "aspect_ratio": "16:9", "output_format": "png", "resolution": "1K" }
```

**`fal-ai/recraft/v3/text-to-image`**
```json
{ "prompt": "…", "image_size": "landscape_16_9", "style": "digital_illustration", "colors": [] }
```

**`fal-ai/flux-pro`**
```json
{ "prompt": "…", "image_size": "landscape_16_9", "num_inference_steps": 28,
  "guidance_scale": 3.5, "num_images": 1, "safety_tolerance": "2", "output_format": "jpeg" }
```

**`fal-ai/flux-pro/kontext`**
```json
{ "prompt": "…", "guidance_scale": 3.5, "safety_tolerance": "2",
  "aspect_ratio": "16:9", "num_images": 1, "output_format": "jpeg" }
```

**`fal-ai/gpt-image-1.5`**
```json
{ "prompt": "…", "image_size": "1536x1024", "quality": "high", "num_images": 1, "output_format": "png" }
```

**`fal-ai/flux/dev`**
```json
{ "prompt": "…", "image_size": { "width": 1024, "height": 1024 }, "num_inference_steps": 28,
  "guidance_scale": 3.5, "num_images": 1, "enable_safety_checker": false }
```

Zu beachten:

- `image_size` ist **mal String, mal Objekt** — in Swift ein Enum mit zwei Fällen, das entsprechend kodiert (`.preset(String)` / `.dimensions(w,h)`), kein `String`.
- `safety_tolerance` ist ein **String** `"2"`, keine Zahl.
- `fal-ai/flux-pro/kontext` ist laut Anzeigename img2img und erwartet eigentlich ein `image_url` — der Web-Code sendet **keines** und ruft es nur mit Text auf. Als *auswählbares* Modell ist es damit faktisch defekt.
  **V1-Empfehlung:** Kontext aus der Modellliste **streichen** (die anderen sechs sind alle text-to-image und funktionieren). Das ist eine Produktentscheidung → §8.

### 4.3 Endpunkt- und Payload-Suche (Web-Heuristik)

`js/api.js:71-79` und `:190-228` bauen eine Kandidatenliste: der gemappte Pfad, und falls dieser keinen `/` enthält, zusätzlich `fal-ai/<x>` und `google/<x>`. Bei `404` wird der nächste Endpunkt probiert; bei `400`/`422` oder Validierungstext der nächste Payload; für unbekannte Modelle gibt es zwei generische Payloads (`{prompt, num_images:1}`, `{prompt}`).

**V1-Abweichung:** komplett streichen. Alle sieben Modelle sind bekannt, ihr Pfad ist ihre ID, und die Payloads stehen fest. Die gesamte Kandidatenlogik ist toter Suchraum, der nur Fehler verschleiert: In Swift bildet ein `enum FalModel` mit `path` und `payload` das Ganze exakt und total ab. Ein `404` oder `422` ist dann ein Bug oder eine API-Änderung — und soll auch so gemeldet werden.

### 4.4 Retry

Nur fal.ai kennt Retry (`js/api.js:204-209`):

- **Retry-Status:** `408`, `429`, `500`, `502`, `503`, `504`
- **Versuche:** `retries = 2` zusätzlich zum ersten
- **Backoff:** `min(2000 ms × versuch, 6000 ms) + random(0…500 ms)` → ca. 2 s, dann ca. 4 s
- Alle anderen Status brechen sofort ab

V1 übernimmt das unverändert (Jitter inklusive — er ist Absicht, nicht Zufall).

### 4.5 Response

Die Bild-URL wird aus dem **ersten Treffer** dieser Kette gezogen (`js/api.js:223`):

```
images[0].url  →  images[0].image_url  →  image.url  →  url  →  output[0].url
```

Findet sich keine URL, gilt der Aufruf als fehlgeschlagen. In der Praxis liefern alle sieben Modelle `images[0].url`; die übrigen Zweige sind Absicherung gegen Schemaunterschiede.

**V1-Empfehlung:** Alle fünf Formen dekodierbar lassen (billig, robust gegen fal-Schemaänderungen), aber wenn eine der hinteren greift, im Log vermerken.

### 4.6 Timeout & Abbruch

- **Timeout:** 120 s pro Endpunkt-Versuch (langsame Bildmodelle).
- **Abbruch:** Die Visual Engine reicht ein `AbortController.signal` durch (`js/features.js:767`); der Nutzer kann eine laufende Generierung abbrechen. Ein Abbruch trägt `user-cancel` in der Reason und wird von einem Timeout unterschieden.
- **Stale-Guard:** Die Visual Engine zählt Request-IDs hoch (`genReqId`/`anaReqId`) und verwirft Antworten überholter Anfragen.

**V1:** Swift-Concurrency-`Task`-Cancellation deckt Abbruch *und* Stale-Guard ab — eine abgebrochene `Task` liefert kein Ergebnis mehr, der ID-Zähler entfällt. Der Unterschied „vom Nutzer abgebrochen" vs. „Timeout" muss aber erhalten bleiben, weil er unterschiedliche Meldungen erzeugt (§6). Konkrete Umsetzung → `swift-concurrency-pro` im Architektur-Ticket.

### 4.7 Nachgelagertes Bild-Preloading

Nach Erhalt der URL lädt die Web-App das Bild einmal vor und **hängt einen Cache-Buster an** (`?t=<timestamp>`, `js/features.js:782`), bevor es angezeigt wird. Erst danach gilt die Generierung als fertig. Für die Mac-App relevant, weil dieselbe URL anschließend an OpenRouter Vision geht — dort wird die **URL ohne** Cache-Buster verwendet (`generatedImageUrl`).

---

## 5. Vollständige Aufrufmatrix V1

Alle Aufrufstellen, die in V1 überleben. Alle nutzen dieselbe Chat-Methode; die Spalte nennt den System-Prompt.

| Ort | System-Prompt | Art |
|---|---|---|
| `js/app.js:209` | `BASE_SYSTEM_PROMPT` | Haupt-Prompt-Generierung |
| `js/app.js:241` | `SUNO_PRO_REFINER_PROMPT` | Text |
| `js/features.js:64` | `IDEA_SPARK_PROMPT` | Idea Spark (bleibt in V1) |
| `js/features.js:143`, `:295` | dynamisch / `PROMPT_REFINER_PROMPT` | Text |
| `js/features.js:189` | `SOUND_ENGINEER_PROMPT` | Text |
| `js/features.js:274` | dynamisch | Text |
| `js/features.js:584` | `SYNTH_DESIGN_TRANSLATOR_PROMPT` | Text |
| `js/features.js:767` | — | **fal.ai** Bildgenerierung |
| `js/features.js:826` | `VISUAL_ANALYZER_PROMPT` | **Vision** (Bild-URL) |
| `js/features.js:906` | `ADAPTIVE_FLOW_PROMPT` | Text |
| `js/features.js:1017` | `AI_COLLAB_PROMPT` | Text |
| `js/features.js:1080` | `STORY_ARC_DESIGNER_PROMPT` | Text |
| `js/features.js:1276` | `JSON_REPAIR_PROMPT` | Text (Reparatur-Retry) |
| `js/features.js:1406` | `NARRATIVE_CHAPTERS_PROMPT` | Text |
| `js/features.js:1496` | `IMMERSIVE_SPACE_PROMPT` | Text |
| `js/features.js:1605` | `HUMAN_TOUCH_PROMPT` | Text |
| `js/features.js:1717` | `RELEASE_FORECAST_PROMPT` | Text |
| `js/features.js:1797` | `CUSTOM_INSTRUCTION_PROMPT` | Text |
| `js/features.js:1902` | `GENRE_EVOLUTION_PROMPT` | Text |
| `js/features.js:3276` | `ORCHESTRA_REFINER_PROMPT` | Text |
| `js/kachel_system.js:655`, `:1517` | pro Kachel dynamisch | Text |

Die Prompt-Texte selbst liegen in `js/prompts.js` und sind **nicht** Gegenstand dieses Tickets — sie werden bei der Feature-Inventur bzw. der Implementierung übernommen.

---

## 6. Fehlermeldungs-Mapping

`getUserFriendlyErrorMessage` (`js/api.js:4-57`) ist der **einzige** Ort, an dem Nutzer-Fehlertexte entstehen; rohe API-Fehler erreichen die Oberfläche nie. Die Regeln werden **in dieser Reihenfolge** geprüft, erste Übereinstimmung gewinnt:

| # | Bedingung | Meldung |
|---|---|---|
| 1 | Netzwerk-/Verbindungsfehler | „Verbindungsfehler. Bitte prüfe deine Internetverbindung." |
| 2 | Nutzer-Abbruch (`user-cancel`) | „Bildgenerierung wurde abgebrochen." |
| 3 | Timeout / Abort | „Die Anfrage hat zu lange gedauert. Bitte prüfe deine Internetverbindung und versuche es erneut." |
| 4 | `429` / Rate Limit | „Zu viele Anfragen. Bitte warte einen Moment." |
| 5 | `401` / `403` / ungültiger Key | „Ungültiger API-Schlüssel. Bitte überprüfe deine Einstellungen." |
| 6 | `>= 500` | „Der Server ist momentan nicht erreichbar. Bitte versuche es später." |
| 7 | `404` | „Der angeforderte Dienst wurde nicht gefunden. Bitte überprüfe deine Einstellungen." |
| 8 | bereits deutsche Eigenmeldung | unverändert durchreichen |
| 9 | sonst | „Ein Fehler ist aufgetreten. Bitte versuche es erneut." |

Dazu zwei Meldungen, die vor dem Request entstehen:

- kein OpenRouter-Key → „Bitte konfiguriere zuerst deinen API Key in den Einstellungen."
- kein fal-Key → „Bitte konfiguriere zuerst deinen Fal.ai API Key in den Einstellungen."

**Reihenfolge ist bedeutungstragend:** Abbruch steht vor Timeout, weil eine abgebrochene Anfrage ebenfalls „abort" im Text trägt — bei umgekehrter Reihenfolge bekäme jeder Nutzer-Abbruch fälschlich die Timeout-Meldung.

**V1-Abweichung:** Der Web-Code rekonstruiert Statuscodes per Regex **aus dem Fehlertext** (`/\b(4\d{2}|5\d{2})\b/`) — er hat die Response an dieser Stelle nicht mehr. Das ist fragil: eine Fehlermeldung, die zufällig „503" enthält, wird als Serverfehler gedeutet. In Swift wird stattdessen ein `enum APIError { case network, cancelled, timeout, rateLimited, unauthorized, server(Int), notFound, decoding, unknown }` **direkt an der Fehlerquelle** erzeugt; die Tabelle oben wird zur exhaustiven `switch`-Abbildung auf denselben deutschen Text. Die Texte bleiben wortgleich.

---

## 7. Was der Swift-Client konkret braucht

Als Auftragsumriss für die Implementierungsphase — die endgültige Modul-Aufteilung entscheidet das Architektur-Ticket:

1. **Eine Chat-Methode** `chat(userMessage:systemPrompt:imageURL:) async throws -> String` — deckt alle 20+ Textfeatures und den Vision-Fall ab.
2. **Eine Bild-Methode** `generateImage(prompt:) async throws -> URL` — mit Retry-Regel aus §4.4.
3. **`enum ChatModel`** und **`enum FalModel`** mit ID, Anzeigename und (bei fal) Payload — beide statisch, beide total.
4. **`enum APIError`** nach §6, plus eine Abbildung auf die deutschen Texte.
5. **Ein Settings-Store** für zwei Keys und zwei Modell-IDs.

Kein Streaming, kein Tool-Calling, keine Funktionsaufrufe, keine Queue-API, kein Datei-Upload. Der gesamte Netzwerk-Layer ist zwei Requests breit.

---

## 8. Für andere Tickets aufgeworfen

Bewusst **nicht** hier entschieden — jeweils fremdes Zuständigkeitsgebiet:

- **Key-Ablage: Keychain oder `UserDefaults`?** Persönliche App ohne Signierung — die Antwort ist nicht selbstverständlich. → Architektur-Ticket.
- **`fal-ai/flux-pro/kontext` streichen?** Es ist im Web als img2img gelistet, wird aber ohne `image_url` aufgerufen und ist damit defekt. Produkt-/Feature-Entscheidung. → Feature-Inventur.
- **Vision-fähige Modelle kennzeichnen?** Heute kann der Nutzer ein Textmodell wählen, mit dem „Bild analysieren" stumm scheitert. → Feature-Inventur bzw. UI-Mapping.
- **Fehlermeldungen als Toast/Inline/Alert?** Die *Texte* stehen hier fest, ihre native Darstellung nicht. → Hybrid-UI-Mapping.
