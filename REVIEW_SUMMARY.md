# Pipeline Review Summary

| # | Severity | Datei | Status | Commit | Beschreibung |
|---|----------|-------|--------|--------|-------------|
| 1 | high | `js/kachel_system.js` | ✅ accepted | `6d7d838` | Stored XSS: Chain-Preset-Name (aus window.prompt(), gespe... |
| 2 | high | `server.py` | ✅ accepted | `b23bec1` | Der Dev-Server bindet auf 0.0.0.0 (alle Interfaces) statt... |
| 3 | medium | `js/app.js` | ❌ failed (API-Keys (OpenRouter, fal.ai) werden im Klartext in localStorage gespeichert. Jedes Script auf derselben Origin kann sie auslesen — in Kombination mit den XSS-Vektoren in kachel_system.js können die Keys exfiltriert werden. tries) | `3` |  |

---

- **Branch:** `pipeline/fix-20260403-063324`
- **Rollback:** `git checkout main`
- **Merge:** `git checkout main && git merge pipeline/fix-20260403-063324`
- **Datum:** 2026-04-03T04:42:07Z
