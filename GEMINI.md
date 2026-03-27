# Gemini Context: Suno Style Architect

This file documents the architectural context, conventions, and known state of the "Suno Style Architect" project to assist the Gemini agent in future interactions.

## 1. Project Overview
**Suno Style Architect** is a client-side Single Page Application (SPA) designed to help users generate and refine prompts for Suno AI music generation.

*   **Core Functionality**: Prompt generation via LLMs (OpenRouter), expert persona refinement, and specific musical tools (KLUG tools).
*   **Status**: Active development.
*   **Operating Environment**: Runs directly in the browser. Served locally via Python.

## 2. Tech Stack & Architecture
**Constraint: NO Build Step.** This project uses standard web technologies without bundlers (Webpack, Vite, etc.).

*   **Frontend**:
    *   **HTML**: `index.html` (Single entry point).
    *   **CSS**: Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`). Custom styles in `css/styles.css`.
    *   **JavaScript**: Vanilla ES6+. Files are loaded as standard scripts (non-module) but structured like modules.
*   **Backend (Local)**:
    *   `server.py`: A thin wrapper around `http.server` to provide CORS support. Does not handle business logic.
*   **Data Persistence**:
    *   `localStorage`: Used for API keys, settings, and history.
*   **External APIs**:
    *   **OpenRouter**: For LLM access (GPT, Claude, Deepseek).
    *   **Fal.ai**: For visual generation features.

### Architectural Patterns
*   **Service Layer**: `js/api.js` handles all external communication.
*   **Event-Driven**: `js/app.js` and `js/keys.js` manage DOM events and keyboard shortcuts.
*   **Separation of Concerns**:
    *   `prompts.js`: System prompts and static text data.
    *   `features.js`: Business logic for "Experts" and "KLUG" tools.
    *   `modals.js`: Dynamic HTML generation for UI overlays.

## 3. Development Conventions
*   **Styling**: Strictly adhere to **Tailwind CSS**. See `DESIGN_SYSTEM.md` for color palettes (Neutral/Dark) and component styles (Glassmorphism).
*   **JavaScript**:
    *   Use `async/await` for asynchronous operations.
    *   Global variables are defined in `config.js` or specific files and attached to `window` where necessary for cross-file access.
    *   **Do not** introduce `import/export` syntax unless the `index.html` script tags are updated to `type="module"` (currently they are not).
*   **Safety**:
    *   Always validate API keys before making requests.
    *   Handle errors gracefully and display them in the `#error-container`.

## 4. Key Files
*   `index.html`: Main layout and script includes.
*   `js/app.js`: Application entry point and main event listeners.
*   `js/api.js`: API wrappers for OpenRouter and Fal.ai.
*   `js/config.js`: Configuration, state variables, and constants.
*   `js/features.js`: Logic for specific tools (Genre Mixer, Mood Analyzer, etc.).

## 5. Known Issues & Tasks
*   **Deprecated API Usage**: `js/api.js` uses `document.execCommand('copy')` as a fallback. This is deprecated and should ideally be removed or strictly gated behind a `navigator.clipboard` check (which is already present as primary method).
*   **Global Scope**: The project relies on the global scope. Variable naming collisions must be avoided.

## 6. How to Run
1.  Run `python3 server.py`.
2.  Open `http://localhost:8000`.
3.  Configure API keys in the settings modal.
