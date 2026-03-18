# Drei-Kachel-System Rework: Workflow Pipeline + Command Palette

## Implementation Plan

### Context
The bottom row (33vh) currently shows a rework banner. Goal: bring back all 25+ tools in a new interaction model — a 5-stage workflow pipeline with compact chip buttons + a Cmd+K command palette for instant keyboard access.

---

## Architecture

### Two complementary systems

```
┌──────────────────────────────────────────────────┐
│  TOP ROW (unchanged, 67vh)                       │
│  [Input]    [Result]    [Kreativ Kosmos]         │
├──────────────────────────────────────────────────┤
│  PIPELINE (33vh) - 5 workflow stages              │
│                                                  │
│  Charakter → Struktur → Sound → Mix → Finish    │
│  ┌──────┐  ┌──────┐  ┌─────┐ ┌────┐ ┌─────┐   │
│  │chip  │  │chip  │  │chip │ │chip│ │chip │   │
│  │chip  │  │chip  │  │chip │ │chip│ │chip │   │
│  │chip  │  │chip  │  │chip │ │chip│ │chip │   │
│  └──────┘  └──────┘  └─────┘ └────┘ └─────┘   │
│  ───●────────○────────○───────○──────○──  [⚡]  │
└──────────────────────────────────────────────────┘
  ● active  ○ pending  ⚡ Quick Chain

  + Cmd+K overlay (command palette) for instant search
```

### 1. Pipeline Strip (bottom 33vh)
- Five horizontal stage columns replace the 3 old category panels
- Each stage: header (icon + name + progress dot) + scrollable chip list
- Clicking a chip opens a **compact popover** (NOT a full-screen modal) or fires immediately for one-click tools
- Signal flow line at bottom: thin connector with dots showing completed stages
- Quick Chain button: pre-select one tool per stage, fire all 5 in sequence

### 2. Command Palette (Cmd+K overlay)
- Extend existing `js/palette.js` to also search pipeline tools
- Fuzzy search across all 28 tools by name, keywords (DE + EN), and stage
- Results show: colored stage badge + emoji + tool name + type icon
- Enter executes, Esc dismisses

---

## Tool Taxonomy: 5 Workflow Stages (28 tools total)

### Stage 1: Charakter (Identity & Style) — 8 tools
| Tool | Type | Prompt Constant |
|------|------|----------------|
| Produzent 🎧 | expert-slider | PRODUCER_REFINER_PROMPT |
| Musiker 🎻 | expert-slider | MUSICIAN_REFINER_PROMPT |
| Komponist 🎬 | expert-slider | FILM_COMPOSER_REFINER_PROMPT |
| DJ/Remixer 💿 | expert-slider | DJ_REMIXER_REFINER_PROMPT |
| Avantgarde 🧪 | expert-slider | AVANTGARDE_REFINER_PROMPT |
| Minimalist ⚪ | expert-slider | MINIMALIST_REFINER_PROMPT |
| Ethno 🌍 | expert-slider | ETHNO_REFINER_PROMPT |
| Künstler-Finder 🧑‍🎤 | auto-generate | ARTIST_SUGGESTER_PROMPT |

### Stage 2: Struktur (Arrangement & Form) — 4 tools
| Tool | Type | Prompt Constant |
|------|------|----------------|
| Song-Struktur 🏗️ | auto-generate | SONG_STRUCTURE_PROMPT |
| Story Arc 📚 | auto-generate | STORY_ARC_DESIGNER_PROMPT |
| Hook Generator 🪝 | auto-generate | HOOK_GENERATOR_PROMPT |
| Narrative Chapters 🧱 | config | NARRATIVE_CHAPTERS_PROMPT |

### Stage 3: Sound (Sonic Design) — 5 tools
| Tool | Type | Prompt Constant |
|------|------|----------------|
| Synth Designer 🎛️ | config-complex | SYNTH_DESIGN_TRANSLATOR_PROMPT |
| Vibe Enhancer ✨ | auto-generate | VIBE_ENHANCER_PROMPT |
| Groove Meister 🥁 | tagger | GROOVE_MEISTER_PROMPT |
| Vocal Stylist 🗣️ | tagger | VOCAL_STYLIST_PROMPT |
| Vocal-Harmony 🎙️ | expert-slider | VOCAL_HARMONY_REFINER_PROMPT |

### Stage 4: Mix (Production & Balance) — 5 tools
| Tool | Type | Prompt Constant |
|------|------|----------------|
| Sound Engineer 🛠️ | config-text | SOUND_ENGINEER_PROMPT |
| Production Finish 💎 | tagger | PRODUCTION_FINISH_PROMPT |
| Effect Chain 🔗 | tagger | EFFECT_CHAIN_PROMPT |
| Tempo Finder ⏱️ | auto-generate | TEMPO_FINDER_PROMPT |
| Mood Analyzer 🧭 | tagger | MOOD_ANALYZER_PROMPT |

### Stage 5: Finish (Final Polish & Evolution) — 6 tools
| Tool | Type | Prompt Constant |
|------|------|----------------|
| Adaptive Flow 🌊 | config-slider | ADAPTIVE_FLOW_PROMPT |
| AI Collaboration 🤝 | config-personas | AI_COLLAB_PROMPT |
| Performance Coach 🏋️ | tagger | PERFORMANCE_COACH_PROMPT |
| Genre Mixer 🧬 | config-dropdowns | GENRE_MIXER_PROMPT |
| Genre Evolution 🕰️ | config-slider-select | GENRE_EVOLUTION_PROMPT |
| Immersive Space 🛰️ | config-presets | IMMERSIVE_SPACE_PROMPT |

---

## Tool Interaction Types

### expert-slider (8 tools)
Popover with range slider (0-100, default 50) + "Anwenden" button.
API call: `Prompt: "${currentPrompt}"\nInfluence Level: ${value}` with expert prompt.

### tagger (6 tools)
One-click: fires API immediately, shows loading on chip. Result = comma-separated suggestions shown as clickable tags in popover. Apply integrates selected tags via PROMPT_REFINER_PROMPT.

### auto-generate (6 tools)
One-click: fires API immediately. Each has unique result rendering (artist suggestions, structure display, comparison view, etc.).

### config (8 tools)
Popover with tool-specific form (sliders, dropdowns, text inputs, multi-selects). Submit button calls API with form values.

---

## Implementation Phases

### Phase 1: Create `js/pipeline.js`
Core pipeline system in a single new file:

1. **Tool Registry** — Data array of all 28 tools with id, name, stage, type, prompt, emoji, keywords
2. **Stage Renderer** — Builds 5-column flex layout in `#pipeline-container`, each column with header + chip list
3. **Popover System** — Single reusable popover, positioned above clicked chip, lazy rendered, only 1 open at a time, Escape/click-outside closes
4. **Tool Executors** — `executeTool(toolId)` dispatches to the right handler based on tool type. Reuses prompt constants from `js/prompts.js` and `callOpenRouterAPI()` from `js/api.js`
5. **Quick Chain** — Pre-select one tool per stage (localStorage), fire in sequence Stage 1→5, progress on signal flow dots
6. **Exposed API** — `window.Pipeline = { tools, stages, executeTool, closePopover }` for palette/chord integration

### Phase 2: Extend `js/palette.js`
Modify existing command palette to also include pipeline tools:
- `refreshItems()` loads both keyboard actions AND pipeline tools from `window.Pipeline.tools`
- Enhanced rendering: stage badges (colored by stage), tool type icons
- `selectIndex()` dispatches to `Pipeline.executeTool()` for tools, `Keys.run()` for actions
- Graceful degradation: works with actions only if Pipeline not loaded yet

### Phase 3: Update existing files

**`index.html`**
- Replace rework banner (lines 414-423) with `<section id="pipeline-container" class="pipeline-strip">`
- Add `<script src="js/pipeline.js">` after features.js in load order
- Update palette placeholder: "Tool oder Aktion suchen… (⌘K)"

**`css/styles.css`**
- Replace `.systems-rework-banner` styles (lines 50-92) with pipeline styles
- Keep `.app-bottom-row { height: 100%; }` and all grid layout rules intact!
- Add: `.pipeline-strip`, `.pipeline-stage`, `.pipeline-chip`, `.pipeline-popover`, `.pipeline-flow`, `.quick-chain-panel`
- Add: `.cmdk-stage-badge`, `.cmdk-tool-type`, `.cmdk-empty`
- No `backdrop-filter` on chips (performance)

**`js/features.js`**
- Remove `hasBottomToolSystems` guard (line 12-21)
- Stop calling `setupExpertRefinements()`, `setupKlugTools()`, `setupFutureLabTools()`, `setupGenreEvolution()`
- Keep all old functions in file as reference (not deleted, just not called)
- Top-row setups unchanged: setupIdeaSpark, setupCustomInstruction, setupStyleSync, setupKlangStudio

**`js/chords.js`**
- Replace static button selector arrays with dynamic queries on pipeline chips
- `hasChordTargets()` checks for `#pipeline-container`
- E key = charakter stage chips, K key = all other stage chips

---

## Performance Budget
- DOM at rest: ~100 nodes (5 stages + 28 chips + flow line)
- No `backdrop-filter` on chips — solid dark backgrounds only
- Glass effect only on the single active popover
- Lazy popover rendering: created on demand, destroyed on close
- Command palette: DOM rebuilt when opened, search runs on in-memory array
- No paging/carousel — simple CSS flex columns with overflow-y: auto

---

## Critical Rules
- All tools must call `window.QW.onPromptUpdated({ source: 'pipeline:{toolId}' })` after modifying `#result-text`
- Check `isPromptGenerated` before executing any tool
- Top row (Idea Spark, Style Sync, Klang Studio) must remain completely untouched
- Keep `.app-main-layout` grid (67%/33%), `#main-app` flex layout, `.app-bottom-row { height: 100% }` intact
- Prompt constants from `js/prompts.js` are global — access via `window[constantName]`
- `musicGenres` array (for genre-mixer) is in `js/config.js`
- `GENRE_EVOLUTION_DATA`, `GENRE_KEYWORDS` (for genre-evolution) are in `js/prompts.js`

---

## Parallel Agent Strategy
Split into 2 implementation agents (worktree isolation), then 2 review agents:

**Agent A — Pipeline Core**: pipeline.js, index.html, css/styles.css, features.js, chords.js
**Agent B — Command Palette**: palette.js extension, css/styles.css additions, index.html placeholder

**Review A**: Verify all 28 tools, popover system, Quick Chain, performance, integration
**Review B**: Verify fuzzy search, keyboard nav, execution dispatch, graceful degradation

**Integration**: Merge worktrees, resolve shared-file conflicts (index.html, styles.css), final check

---

## Known Pitfalls (from first attempt)
1. **CSS layout rules must not be removed** — `#main-app`, `.app-main-layout`, `.app-top-row/.app-bottom-row { min-height: 0 }`, `.app-top-card` etc. are critical for the 67/33 grid. Only replace `.systems-rework-banner` styles.
2. **narrative-chapters must use NARRATIVE_CHAPTERS_PROMPT** (not SONG_STRUCTURE_PROMPT)
3. **Pipeline strip needs `height: 100%; min-height: 0; overflow: hidden`** to fill the 33vh grid cell
4. The stages row inside pipeline-strip needs inline `display:flex; flex:1; min-height:0` to be horizontal
