# Warp Quickstart: Suno Style Architect

A concise, action-oriented cheat sheet for working on this project in Warp.

Repository: ./suno-style-architect
OS: macOS • Shell: zsh

TL;DR
- Start server (preferred):
  - Make script executable once: chmod +x ./start.sh
  - Run: ./start.sh
- Or run directly: python3 server.py
- Open app: open http://localhost:8000
- Stop server: Ctrl+C in the running terminal
- Free port 8000 if busy: lsof -ti:8000 | xargs kill -9

Prerequisites
- Python 3.6+ (macOS ships with python3, but verify):
  - python3 --version
- Modern browser (Chrome, Firefox, Safari, Edge)

Start and iterate
1) From the repo root:
   - ./start.sh
   - or: python3 server.py

2) Open the app:
   - open http://localhost:8000

3) Logs:
   - Server prints requests and errors to the terminal.

4) Change port (if needed):
   - Edit server.py and change PORT = 8000
   - If 8000 is taken, free it: lsof -ti:8000 | xargs kill -9

Common maintenance commands (macOS)
- Check Python: python3 --version
- Ensure start.sh is executable: chmod +x ./start.sh
- Open in browser: open http://localhost:8000
- Kill whatever runs on port 8000: lsof -ti:8000 | xargs kill -9

Where to make changes
- UI/HTML: index.html
- Styles: css/styles.css
- App logic: js/app.js
- API helpers & utilities: js/api.js
- Configuration (models, constants, state): js/config.js
- Prompts (personas, tools): js/prompts.js
- Advanced features (KLUG tools, experts): js/features.js
- Template system: js/templates.js, js/template-ui.js
- Modals: js/modals.js
- Local dev server with CORS: server.py

Handy references for Agent Mode
- "OpenRouter models are defined in js/config.js (MODEL_NAMES). Update there."
- "All system prompts live in js/prompts.js."
- "Template system: Press 'T' to open/close templates, Cmd+Shift+S to save current prompt as template."
- "Template data is stored in localStorage under 'suno_templates_v1' key."
- "If the browser complains about CORS, make sure you're using python3 server.py (not opening index.html directly)."

Troubleshooting (quick)
- API key issues
  - Use an OpenRouter key that starts with sk-or-v1-
  - Confirm credits and connectivity
  - The key is stored in browser localStorage (not the server)
- CORS errors
  - Only serve via server.py or ./start.sh
  - Confirm http://localhost:8000
- Server won’t start
  - Free the port: lsof -ti:8000 | xargs kill -9
  - Change PORT in server.py
  - Verify Python: python3 --version

Notes on secrets
- Do not paste secrets directly in commands. If you must use a secret in the terminal, store it in an env var first (example placeholder):
  - export OPENROUTER_API_KEY={{OPENROUTER_API_KEY}}
- This app stores API keys in browser localStorage via the UI; no terminal setup is required for normal use.

Project structure (short)
- index.html — main UI
- server.py — simple static server with CORS
- css/ — styles
- js/ — modules: config.js, prompts.js, api.js, app.js, features.js, modals.js
- assets/ — static assets

Tips
- Keep the terminal running server.py open to watch logs while you test.
- Make incremental edits and refresh the browser to see changes.
- If you clone/move the project, re-run chmod +x ./start.sh before using the script.

## Design System for New Features

**CRITICAL**: When adding new features outside the existing tile system:

### Core Design Principles (STRICT)
- **Never break main grid**: Respect `xl:grid-cols-2` structure
- **Glass morphism**: `backdrop-blur-md` + semi-transparent backgrounds
- **Rounded corners**: `rounded-3xl` (containers) → `rounded-xl` (elements) → `rounded-lg` (small)
- **Dark theme**: `#0d0d0f` base with `neutral-800/20` backgrounds
- **Typography**: Inter font, `text-xl` → `text-base` → `text-sm` → `text-xs` hierarchy

### Feature Expansion Strategies
1. **Expandable Panels**: Start small, expand to `position: fixed` overlay
2. **Slide-Out Workspace**: 60% width from right edge, main content shifts left
3. **Floating Action Zones**: Edge-mounted with hover triggers
4. **Contextual Overlays**: Maintain visual connection to source tile

### Visual Standards (NON-NEGOTIABLE)
- Colors: ONLY neutral palette (`text-white`, `text-neutral-200`, `text-neutral-400`)
- Shadows: `shadow-2xl shadow-black/20` for depth
- Animations: `0.2s` micro, `0.4s` major, `cubic-bezier(0.4, 0, 0.2, 1)` easing
- Z-index: base(1) → elevated(10) → modal(100) → feature(150) → system(200)

### Quick Implementation
```css
/* New feature panel template */
.feature-panel {
    background: rgba(23, 23, 23, 0.4);
    border: 1px solid rgba(115, 115, 115, 0.2);
    border-radius: 24px;
    backdrop-filter: blur(16px);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
```

### Human-Centered Rules
- Progressive disclosure (hide complexity until needed)
- Contextual appearance (show when relevant)
- Clear escape routes (obvious way back to main UI)
- 44px minimum touch targets
- Proper focus management

**Remember**: Expand, don't replace. Enhance, don't break. Always maintain the sophisticated glass aesthetic.

Attribution
- See README.md for full documentation and feature list.
- See README.md → Design System section for complete implementation details.
