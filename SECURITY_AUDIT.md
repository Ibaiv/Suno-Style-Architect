# Security Audit Report

**Date:** 2026-03-29
**Scope:** Full project audit before changing repository visibility to public
**Status:** Repo is now public with GitHub Pages enabled

---

## Resolved Issues

These were found and fixed before making the repo public.

### 1. Personal File Paths Exposed Username
- `warp.md` (line 5) — contained `/Users/felix/Documents/WebProjects/suno-style-architect`
- `README.md` (line 52) — contained `cd /Users/felix/Documents/WebProjects/suno-style-architect`
- `visual_style_sync_concept.md.resolved` (lines 28, 32, 44) — contained `file:///Users/felix/...` URLs

**Fix:** Replaced all with relative paths.

### 2. No LICENSE File
README claimed MIT License but no actual LICENSE file existed. Without one, the code defaults to "all rights reserved."

**Fix:** Created `LICENSE` with MIT license text.

### 3. No .gitignore
OS metadata, temp files, and local tool config were being tracked in git.

**Fix:** Created `.gitignore` excluding `.DS_Store`, `.claude/`, `tmp/`, `temp`, `output/`, `.env`, `node_modules/`, and log files.

### 4. Junk Files in Repository
- `.DS_Store` files (macOS metadata)
- `tmp/` directory (build artifacts)
- `temp` file (empty)
- `output/` directory (generated PDFs)
- `.claude/` directory (local tool config with full username in paths)

**Fix:** Removed all from git tracking via `git rm --cached`.

### 5. XSS Vulnerability via innerHTML
Multiple locations inserted data into the DOM using `innerHTML` without sanitization. If an API response (OpenRouter, Fal.ai) ever contained malicious HTML, it could execute arbitrary scripts in the user's browser and steal their API keys from localStorage.

**Fix:** Added global `escapeHTML()` helper in `js/config.js` that converts HTML special characters (`<`, `>`, `&`, `"`, `'`) to safe entities. Applied it to all dynamic content rendered via innerHTML:

- `js/config.js` — `showToast()` and `showInlineError()` message parameters
- `js/features.js` — All error messages from `getUserFriendlyErrorMessage()`, API-generated content (`cleanPrompt`, `notes`, `planLines`, `tacticsLines`), category names from parsed JSON, image URLs, and user prompt text displayed in comparison views
- `js/features.js` (Narrative Chapters) — Already had its own local `escapeHtml()` function and was correctly using it

**Not changed (safe — hardcoded source data only):**
- `js/creative_cosmos.js` — `wikiContent`, world names, and icons are all hardcoded in source
- `js/modals.js` — HTML template is a static string defined in the same file
- `js/features.js` — Persona/preset/option/lever labels from hardcoded arrays
- `js/quickwins.js` — Character count (number) with hardcoded color values
- `js/shortcuts_settings.js` — Conflict count (number)

---

## Remaining Risks

### Critical Severity

#### API Keys Stored Unencrypted in localStorage
API keys are stored in plain text in browser localStorage. If a future XSS vulnerability were introduced, it could steal them.

**Affected files:**
- `js/app.js` (lines 51-54, 61-62, 75-76, 111-115)
- `js/config.js` (lines 2, 29)

**localStorage keys:** `openrouter_api_key`, `ssa_api_key`, `fal_api_key`

**Note:** This is standard practice for client-side apps without a backend. Each user stores their own key in their own browser. The XSS vector has been mitigated (see resolved issue #5), so the practical risk is low. A backend proxy would be the full solution but is out of scope for a static site.

### High Severity

#### Console Logging of API Details
Debug `console.log` statements expose API request metadata in the browser console.

**Affected file:** `js/api.js` (lines 273, 298, 308, 314, 323)

**Logged data:**
- Model name and API URL
- Response status codes
- Response content length
- Partial response text on errors (first 500 chars)

**Recommendation:** Remove or gate behind a `DEBUG` flag that defaults to `false`.

#### Permissive CORS Policy
`server.py` sets `Access-Control-Allow-Origin: *` which allows any website to make requests to the dev server.

**Affected file:** `server.py` (lines 18-20)

**Note:** This only applies when running the Python dev server locally. GitHub Pages does not use `server.py`. No action needed unless the server is deployed publicly.

#### Development Debug Shortcuts in Production Code
Localhost-gated debug features exist in the codebase.

**Affected file:** `js/scope_stack.js` (lines 95-96, 102-107)
- A `setInterval` leak checker runs every 60 seconds on localhost
- `Ctrl+Shift+Escape` triggers an emergency reset on localhost

**Note:** These are gated by `location.hostname === 'localhost'` so they don't execute on GitHub Pages. Low practical risk.

### Medium Severity

#### No HTTPS Enforcement in Dev Server
`server.py` runs on plain HTTP. API keys sent over HTTP would be visible to network observers.

**Note:** Only relevant for local development. GitHub Pages enforces HTTPS by default.

#### No Rate Limiting or CSRF Protection
`server.py` has no rate limiting, CSRF tokens, or request validation.

**Note:** Only relevant if `server.py` is deployed publicly, which it shouldn't be. GitHub Pages serves static files only.

### Low Severity

#### API Key Format Validation
`js/app.js` (lines 96-98) validates that OpenRouter keys start with `sk-or-v1-`. If OpenRouter changes their key format, users won't be able to use the app.

#### Git History Contains Old File Paths
Previous commits still contain `/Users/felix/...` paths. This is just a first name and directory structure — very low risk. A full history rewrite with `git filter-repo` would remove them but is not worth the effort.

---

## Clean Findings (No Issues)

### Hardcoded Credentials
- No API keys, passwords, secrets, or tokens hardcoded anywhere
- No `.env` files present or ever committed
- No private keys, certificates, or database connection strings
- Full git history scanned across all 150 commits and 22 branches — clean

### Personal Data
- No email addresses, phone numbers, or physical addresses
- No user IDs or account identifiers
- No IP addresses beyond standard `localhost` references

### Licensing
- All external CDN dependencies are properly licensed:
  - Tailwind CSS — MIT License
  - Google Fonts (Inter) — Open Font License
  - Lucide Icons — MIT License
- No third-party code copied without attribution
- No copyrighted content in data files (`data/worlds/*.json` contains only original musical genre descriptions)

### Data Files
- `data/` directory contains only application content (musical genre metadata) — no user data
- No database files (`.db`, `.sqlite`)
- No log files committed

### Architecture
- API keys are correctly handled: user-entered via UI, stored client-side, never server-side
- Authorization headers use variables, not hardcoded values
- Input validation exists for key format
