# Suno Style Architect — Native macOS Swift/SwiftUI Rewrite Plan

## Context

**What**: Complete rewrite of Suno Style Architect from a web app (HTML/CSS/Vanilla JS) to a native macOS application using Swift and SwiftUI.

**Why**: The current web app is a sophisticated AI-powered music prompt builder (~2MB codebase, 13 JS files, 35+ modal dialogs, 45 world content files). Moving to native macOS enables tighter OS integration, native performance, Keychain security for API keys, and a true macOS-native UX leveraging sidebars, toolbars, Inspector panels, and SF Symbols.

**Target**: macOS 26+ (Tahoe) only. Personal/internal use. Xcode + Swift Package Manager. Zero third-party dependencies.

**APIs preserved**: OpenRouter.ai (LLM text generation, 8 models) and fal.ai (image generation, 6 models).

---

## Current Web App — Feature Inventory

### Core Features
| Feature | Description | Web Source |
|---|---|---|
| **Prompt Generation** | Vision text + optional lyrics -> AI-generated Suno prompt (<=800 chars) | `app.js`, `prompts.js` |
| **Pro Refinement** | Expand/compress prompt to <=1000 chars for Suno Pro | `app.js` |
| **Custom Instruction** | Free-form rewriting with user-defined rules | `features.js` |
| **Character Compliance** | Live char count, standard (800) and Pro (1000) limits | `quickwins.js` |
| **Lint Hints** | 30 curated German-language hints selected via LLM + 5 rule-based checks | `quickwins.js` |
| **Copy/Export/Import** | Clipboard, JSON export, JSON import | `quickwins.js` |
| **Auto-Trim V3** | Aggressive trim to <=200 chars (removes filler words) | `quickwins.js` |
| **5 Presets** | Cinematic, Electronic, Indie, Hip-Hop, Ambient quick-start | `quickwins.js` |

### Expert Personas (8)
Each takes the current prompt + influence slider (0-100%) and refines through a specialized lens:
| Expert | Specialty | Prompt Constant |
|---|---|---|
| Producer | Sound design & mixing | `PRODUCER_REFINER_PROMPT` |
| Musician | Musicality & emotion | `MUSICIAN_REFINER_PROMPT` |
| Film Composer | Cinematic storytelling | `FILM_COMPOSER_REFINER_PROMPT` |
| DJ/Remixer | Club-ready groove | `DJ_REMIXER_REFINER_PROMPT` |
| Avantgarde | Experimental sound | `AVANTGARDE_REFINER_PROMPT` |
| Minimalist | Reduced to essence | `MINIMALIST_REFINER_PROMPT` |
| Vocal-Harmony | Complex vocal arrangements | `VOCAL_HARMONY_REFINER_PROMPT` |
| Ethno | World music integration | `ETHNO_REFINER_PROMPT` |

### KLUG Smart Tools (12)
| Tool | Pattern | What It Does |
|---|---|---|
| Genre Mixer | 3 pickers + fusion | Blends 2-3 genres into hybrid prompt |
| Mood Analyzer | Tagger | Suggests 5-7 mood-specific instruments |
| Title & Hook Generator | Display | Creates song titles + hook lines |
| Song Structure | Display | Suggests dynamic structure with [tags] |
| Vibe Enhancer | One-click | Adds atmospheric/emotional detail |
| Artist Compass | List | Recommends 3-4 similar artists |
| Tempo Finder | Display | Suggests tempo descriptor + BPM |
| Production Finish | Tagger | Suggests 5-7 mastering terms |
| Vocal Stylist | Tagger | Suggests 4-6 vocal characteristics |
| Groove Master | Tagger | Suggests 5-7 rhythmic feels |
| Performance Coach | Tagger | Suggests 5-7 performance nuances |
| Effect Chain | Tagger | Suggests 5-7 effect combinations |

> **Tagger pattern**: API call -> comma-separated suggestions -> selectable tag cloud -> apply selected to prompt. 6 tools share this exact pattern.

### Idea Starter (Kreativ-Bibliothek)
- 45 curated music world articles in JSON (~1.6MB total)
- Groups: Orchestra (12), Contemporary (15), Exotic Instruments (8), Ambient (3+), Electronic, World Music
- Wiki-style browsing with interactive terms (click to select)
- Selected terms + passages feed into prompt generation via `CREATIVE_SYSTEM_PROMPT`
- Idea Spark: keyword -> 3 AI-generated song concepts

### Klang Studio (Sound Design)
Three modules:
1. **Synth Designer**: Waveform (4) + filter brightness slider + cutoff (4) + envelope (4) + effects (5 checkboxes) + blend (dropdown + ratio slider) -> translates to 35-word sentence via `SYNTH_DESIGN_TRANSLATOR_PROMPT`
2. **Orchestra Designer**: Visual stage layout + section sliders (Strings/Woodwinds/Brass/Percussion 0-100%) + articulation tags + room acoustics (4 presets) + effect sliders (Hall/Echo/Air/Warmth)
3. **Instrument Blender**: Primary + secondary sound dropdowns + mix ratio slider + blend mode (Harmonic/Contrast/Layered/Frequency-Split)

### Style Sync (Bidirectional)
- **Encoder** (Sound -> Image): Current prompt -> fal.ai image generation -> display with download/copy
- **Decoder** (Image -> Sound): Upload/drop image -> OpenRouter vision analysis -> music prompt

### Visual Engine
- Image prompt input -> fal.ai generation -> display image -> "Analyze" -> extract music prompt from image via OpenRouter

### Future Lab (7 tools)
| Tool | Input | Output |
|---|---|---|
| Adaptive Flow | Intensity slider (0-100) | Dynamic intensity rewrite |
| AI Collaboration | 2-3 persona selection | Multi-persona interplay prompt |
| Story Arc Designer | Base prompt | 3-act emotional journey |
| Narrative Chapters | Base prompt + chapter count | JSON: 3-5 chapters with music matrices |
| Immersive Space | Spatial preset (5 options) | 3D spatial/binaural prompt |
| Human Touch | Imperfection checkboxes (5) | Organic micro-timing additions |
| Release Forecast | Timeline + channel selection | Release strategy (German) |

### Genre Evolution
- Genre picker (9 genres) + decade slider (1950-2020)
- Hardcoded `GENRE_EVOLUTION_DATA[genre][decade]` aesthetic descriptions
- Transports current prompt to selected era via `GENRE_EVOLUTION_PROMPT`

### History
- Max 20 items, each: `{id, content, idea, favorite, createdAt, meta}`
- Stored in localStorage (`ssa_history_v1`)
- Duplicate prevention (no consecutive identical prompts)
- Export all / import all as JSON file
- Favorite toggle, delete, restore

### Keyboard Shortcuts
- Customizable registry (`ssa_keybindings_v1` in localStorage)
- Scopes: global (not typing), editing (in input), any
- Command palette (Cmd+K) with fuzzy search
- Default bindings: `/` focus input, `h` history, `g` generate, `p` pro, `c` copy

### API Integration Details

**OpenRouter.ai**:
```
POST https://openrouter.ai/api/v1/chat/completions
Headers: Authorization: Bearer {key}, HTTP-Referer, X-Title
Body: { model, messages: [{role, content}], temperature: 0.7, max_tokens: 1000, top_p: 0.9 }
Response: choices[0].message.content
Multimodal: supports image_url in content array for vision
8 models: GPT-5 mini, Haiku 4.5, Deepseek 3.1/3.2, Chimera, GLM 4.6, Grok 4, Ling 1T
```

**fal.ai**:
```
POST https://fal.run/{model-path}
Headers: Authorization: Key {key} (fallback: Bearer {key})
6 models with DIFFERENT payload shapes:
  - nano-banana-pro: { prompt, num_images, aspect_ratio, output_format }
  - recraft/v3: { prompt, image_size, style, colors }
  - flux-pro: { prompt, image_size, num_inference_steps, guidance_scale, safety_tolerance }
  - gpt-image-1.5: { prompt, image_size, quality, num_images, output_format }
  - flux/dev: similar to flux-pro
Retry: 2 retries on 408/429/5xx with backoff
```

---

## Architecture: @Observable Service Layer

### Why Not Traditional MVVM or TCA

All 35+ tool views operate on the **same central prompt**. With per-view ViewModels, you'd need:
- A shared ViewModel or coordinator to sync prompt state
- Published property forwarding chains
- Combine pipelines for state propagation

With a shared `@Observable` service, every view simply reads `promptEngine.currentPrompt` and calls `promptEngine.applyRefinement(...)`. No coordination layer needed.

TCA (The Composable Architecture) is powerful but brings ~30% boilerplate overhead (Actions, Reducers, Effects, Store) that's unjustified for a personal-use app with straightforward state.

### Service Layer Design

```
┌─────────────────────────────────────────────────────┐
│                    SwiftUI Views                     │
│  (read state, call methods, bind to @Observable)     │
└────────────┬────────────────────────┬────────────────┘
             │ @Environment           │
┌────────────▼────────────────────────▼────────────────┐
│                     AppState                          │
│  Coordinates service lifecycle, provides to env       │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬────────┘
   │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼
Prompt  OpenRouter  Fal    History  World   Lint  Prefs
Engine  Client     Client  Store   Content Engine Store
                                   Store
```

### PromptEngine — Central Service

```swift
@Observable
final class PromptEngine {
    // State
    var visionText = ""
    var lyricsText = ""
    var currentPrompt = ""
    var isGenerating = false
    var error: AppError?

    // Derived
    var characterCount: Int { currentPrompt.count }
    var isWithinStandardLimit: Bool { characterCount <= 800 }
    var isWithinProLimit: Bool { characterCount <= 1000 }
    var toolsEnabled: Bool { !currentPrompt.isEmpty }

    // Dependencies (injected)
    private let openRouter: OpenRouterClient
    private let historyStore: HistoryStore
    private let lintEngine: LintEngine

    // Core Actions
    func generate() async { ... }
    func refinePro() async { ... }
    func applyExpertRefinement(expert: ExpertPersona, influence: Int) async { ... }
    func applyCustomInstruction(_ instruction: String) async { ... }
    func applyToolResult(_ result: String, source: String) { ... }
    func appendSentence(_ sentence: String) { ... }
    func autoTrimV3() { ... }

    // Every currentPrompt mutation triggers:
    private func onPromptChanged(source: String) {
        historyStore.addItem(content: currentPrompt, idea: visionText, source: source)
        lintEngine.analyze(currentPrompt)
    }
}
```

### OpenRouterClient

```swift
@Observable
final class OpenRouterClient {
    private let httpClient = HTTPClient()

    enum Model: String, CaseIterable, Identifiable {
        case gpt5Mini = "openai/gpt-5-mini"
        case haiku45 = "anthropic/claude-haiku-4.5"
        case deepseek31 = "deepseek/deepseek-v3.1-terminus"
        case deepseek32 = "deepseek/deepseek-v3.2-exp"
        case chimera = "tngtech/deepseek-r1t2-chimera"
        case glm46 = "z-ai/glm-4.6"
        case grok4 = "x-ai/grok-4-fast"
        case ling1t = "inclusionai/ling-1t"

        var displayName: String { ... }
    }

    func complete(
        userMessage: String,
        systemPrompt: String,
        model: Model,
        apiKey: String,
        imageURL: String? = nil,
        temperature: Double = 0.7,
        maxTokens: Int = 1000
    ) async throws -> String { ... }
}
```

### FalClient

```swift
@Observable
final class FalClient {
    private let httpClient = HTTPClient()

    enum ImageModel: String, CaseIterable, Identifiable {
        case nanoBananaPro = "fal-ai/nano-banana-pro"
        case fluxPro = "fal-ai/flux-pro"
        case fluxProKontext = "fal-ai/flux-pro/kontext"
        case recraftV3 = "fal-ai/recraft/v3/text-to-image"
        case gptImage15 = "fal-ai/gpt-image-1.5"
        case fluxDev = "fal-ai/flux/dev"

        var displayName: String { ... }
        /// Each model builds its own payload shape
        func buildPayload(prompt: String) -> [String: Any] { ... }
    }

    func generateImage(
        prompt: String,
        model: ImageModel,
        apiKey: String
    ) async throws -> URL { ... }
}
```

### HTTPClient (Actor)

```swift
actor HTTPClient {
    func request<T: Decodable>(
        _ request: URLRequest,
        responseType: T.Type,
        retries: Int = 2,
        retryableStatusCodes: Set<Int> = [408, 429, 500, 502, 503, 504]
    ) async throws -> T {
        // Retry loop with exponential backoff + jitter
        // Parse response, throw typed APIError on failure
    }
}
```

---

## Data Persistence Strategy

| Data | Storage | Why |
|---|---|---|
| Prompt history (max 20) | SwiftData `@Model` | Structured, queryable, auto-migration |
| API keys | Keychain (Security framework) | Secure storage, no plaintext |
| Preferences (models, limits) | `@AppStorage` (UserDefaults) | Simple key-value |
| World content (45 JSON) | Bundled Resources, lazy-loaded | Read-only, ~1.6MB |
| System prompts (80+) | Static Swift strings | Compile-time safety |
| Custom shortcuts | UserDefaults (JSON) | Simple map |

### SwiftData History Model

```swift
@Model
final class HistoryItem {
    @Attribute(.unique) var id: String
    var content: String
    var idea: String
    var isFavorite: Bool
    var createdAt: Date
    var source: String  // "generate", "expert:producer", "klug:genre-mixer", etc.
}
```

### Keychain for API Keys

```swift
enum KeychainService {
    private static let service = "com.sunostylearchitect"
    static func save(key: String, value: String) throws { ... }
    static func load(key: String) -> String? { ... }
    static func delete(key: String) throws { ... }
}
```

### World Content Store

```swift
@Observable
final class WorldContentStore {
    private(set) var worldIndex: [MusicWorldEntry] = []
    private var loadedWorlds: [String: MusicWorld] = [:]  // lazy cache

    func loadIndex() { /* Bundle.main.url(forResource:...) */ }
    func world(for id: String) -> MusicWorld? { /* load + cache */ }
    func attributedContent(for world: MusicWorld) -> AttributedString { /* HTML -> styled text */ }
}
```

---

## View Architecture: Web-to-macOS Mapping

### Root Layout

```swift
struct ContentView: View {
    @State private var selectedSection: SidebarSection?
    @State private var selectedTool: ToolIdentifier?

    var body: some View {
        NavigationSplitView {
            SidebarView(selection: $selectedSection)
        } content: {
            ToolListView(section: selectedSection, selection: $selectedTool)
        } detail: {
            if let tool = selectedTool {
                ToolDetailView(tool: tool)
            } else {
                WorkspaceView()  // default: prompt input + result
            }
        }
        .toolbar { ... }
        .inspector(isPresented: $showHistory) {
            HistoryListView()
        }
    }
}
```

### Sidebar Sections

```swift
enum SidebarSection: String, CaseIterable, Identifiable {
    case workspace = "Workspace"
    case experts = "Experten"
    case klugTools = "KLUG-Tools"
    case ideaStarter = "Ideen-Starter"
    case klangStudio = "Klang-Studio"
    case styleSync = "Style Sync"
    case visualEngine = "Visual Engine"
    case futureLab = "Future Lab"
    case genreEvolution = "Genre Evolution"
}
```

### Presentation Mapping

| Web Pattern | macOS Native | Used For |
|---|---|---|
| 3-column grid | `NavigationSplitView` | Main layout |
| Full-page modal | Separate `Window` (via `openWindow`) | Klang Studio, Style Sync |
| Medium modal | `.sheet()` | Expert refinements, most KLUG tools |
| Small modal | `.popover()` | Tempo Finder, Artist Compass |
| History sidebar | `.inspector()` | History panel |
| Command palette | Custom overlay (Cmd+K) | Action search |
| Settings modal | `Settings {}` scene | API keys, shortcuts |

### SF Symbol Mapping

| Feature | SF Symbol |
|---|---|
| Producer | `slider.horizontal.3` |
| Musician | `music.note.list` |
| Composer | `film` |
| DJ | `opticaldisc` |
| Avantgarde | `flask` |
| Minimalist | `circle` |
| Vocal | `mic` |
| Ethno | `globe` |
| Genre Mixer | `arrow.triangle.merge` |
| Mood | `safari` |
| Hook | `text.quote` |
| Structure | `building.columns` |
| Vibe | `sparkles` |
| Tempo | `metronome` |
| Production | `diamond` |
| Groove | `drum` |
| Effects | `link` |
| Visual Engine | `photo.artframe` |
| Klang Studio | `slider.vertical.3` |
| Blender | `arrow.triangle.swap` |
| Future Lab | `waveform.path` |

### Reusable KlugTaggerView

```swift
/// Reusable view for 6 KLUG tools that share the tagger pattern:
/// analyze prompt -> show tag suggestions -> select -> apply
struct KlugTaggerView: View {
    let toolName: String
    let systemPrompt: String
    @Binding var isPresented: Bool

    @Environment(PromptEngine.self) private var promptEngine
    @Environment(OpenRouterClient.self) private var api

    @State private var suggestions: [String] = []
    @State private var selected: Set<String> = []
    @State private var isLoading = false

    var body: some View {
        // 1. Analyze button -> API call -> parse comma-separated tags
        // 2. FlowLayout of Toggle-styled tag buttons
        // 3. Apply button -> appendSentence(selected.joined(", "))
    }
}
```

Covers: Mood Analyzer, Production Finish, Vocal Stylist, Groove Master, Performance Coach, Effect Chain.

---

## Project Structure

```
SunoStyleArchitect/
  Package.swift

  Sources/
    App/
      SunoStyleArchitectApp.swift
      AppState.swift
      ContentView.swift

    Core/
      Services/
        PromptEngine.swift
        OpenRouterClient.swift
        FalClient.swift
        HistoryStore.swift
        WorldContentStore.swift
        LintEngine.swift
        KeyboardShortcutManager.swift
        PreferencesStore.swift

      Models/
        Prompt.swift
        HistoryItem.swift
        MusicWorld.swift
        ExpertPersona.swift
        KlugTool.swift
        FutureLabTool.swift
        APIConfiguration.swift
        SynthDesign.swift
        OrchestraLayout.swift
        InstrumentBlend.swift
        NarrativeChapter.swift
        GenreEvolutionData.swift
        ImageGenerationResult.swift

      Prompts/
        SystemPrompts.swift
        PromptBuilder.swift

      Networking/
        HTTPClient.swift
        OpenRouterAPI.swift
        FalAPI.swift
        APIError.swift

      Extensions/
        String+CharCount.swift
        String+HTMLStripping.swift
        AttributedString+InteractiveTerms.swift

    Features/
      Workspace/
        WorkspaceView.swift
        PromptInputView.swift
        PromptResultView.swift
        RefinementBar.swift

      Sidebar/
        SidebarView.swift

      Experts/
        ExpertListView.swift
        ExpertRefinementSheet.swift

      KlugTools/
        KlugToolGridView.swift
        KlugTaggerView.swift             # Reusable (6 tools)
        GenreMixerView.swift
        HookGeneratorView.swift
        SongStructureView.swift
        VibeEnhancerView.swift
        ArtistCompassView.swift
        TempoFinderView.swift

      IdeaStarter/
        IdeaStarterView.swift
        WorldBrowserView.swift
        WorldArticleView.swift
        WorldTermSelectionView.swift

      KlangStudio/
        KlangStudioView.swift            # Separate window
        SynthDesignerView.swift
        OrchestraDesignerView.swift
        InstrumentBlenderView.swift

      StyleSync/
        StyleSyncView.swift              # Separate window
        SoundToImageView.swift
        ImageToSoundView.swift

      VisualEngine/
        VisualEngineView.swift

      FutureLab/
        FutureLabGridView.swift
        AdaptiveFlowView.swift
        AICollaborationView.swift
        StoryArcView.swift
        NarrativeChaptersView.swift
        ImmersiveSpaceView.swift
        HumanTouchView.swift
        ReleaseForecastView.swift

      GenreEvolution/
        GenreEvolutionView.swift

      History/
        HistoryListView.swift
        HistoryImportExportView.swift

      Settings/
        SettingsView.swift
        APISettingsView.swift
        ModelPickerView.swift
        ShortcutSettingsView.swift

      CommandPalette/
        CommandPaletteView.swift

  Resources/
    Worlds/                              # 45 bundled JSON files
    Assets.xcassets/

  Tests/
    CoreTests/
      PromptEngineTests.swift
      OpenRouterClientTests.swift
      FalClientTests.swift
      HistoryStoreTests.swift
      LintEngineTests.swift
      PromptBuilderTests.swift
    FeatureTests/
      GenreMixerTests.swift
      NarrativeChaptersTests.swift
    UITests/
      WorkspaceUITests.swift
      NavigationUITests.swift

  Documentation/
    ARCHITECTURE.md
    ONBOARDING.md
    MIGRATION-MAP.md
    ADR/
      001-architecture-pattern.md
      002-data-persistence-strategy.md
      003-networking-design.md
      004-view-hierarchy.md
      005-keyboard-shortcuts.md
```

---

## Phased Implementation Milestones

### Phase 1: Foundation Shell

**Goal**: App compiles, launches, navigates, saves API keys.

**Deliverables**:
- SPM project scaffolding with all folders
- `SunoStyleArchitectApp.swift` with `WindowGroup` + `Settings` scene
- `AppState` and `PreferencesStore` (shell implementations)
- `ContentView` with `NavigationSplitView` skeleton
- `SidebarView` with all 9 section labels + SF Symbols (non-functional)
- `WorkspaceView` with vision + lyrics `TextEditor` (UI only, no generation)
- `PromptResultView` with placeholder state + character counter
- `SettingsView` with API key fields saved to Keychain
- All model type definitions (enums, structs) — `ExpertPersona`, `KlugTool`, `FutureLabTool`, etc.
- `SystemPrompts.swift` — verbatim port of all 80+ prompts from `js/prompts.js`
- ADR 001 (architecture), ADR 002 (persistence), ADR 004 (view hierarchy)

**Verification**: App launches -> sidebar shows all sections -> click section highlights it -> Settings saves API key to Keychain -> relaunch -> key persists.

---

### Phase 2: Core Prompt Generation

**Goal**: End-to-end: enter vision -> generate -> see prompt -> refine -> copy.

**Deliverables**:
- `HTTPClient` actor with retry logic (2 retries, exponential backoff)
- `OpenRouterClient.complete(...)` fully implemented
- `PromptEngine.generate()` wired to WorkspaceView generate button
- `PromptEngine.refinePro()` wired to Pro button
- Custom instruction modal (`.sheet` with TextEditor)
- `LintEngine` with 5 rule-based checks (BPM, vocals, drums, commas, word count)
- `LintEngine` LLM-based hint selection (debounced, 30 curated hints)
- Character stats display: `count/800` + `count/1000` compliance indicators
- Copy-to-clipboard via `NSPasteboard.general`
- Error handling with `.alert()` modifier
- ADR 003 (networking)
- Unit tests: `OpenRouterClient`, `PromptEngine`, `LintEngine`

**Verification**: Type "dark ambient with deep bass" -> click Generate -> prompt appears with char count -> click "Refine Pro" -> expanded version -> click Copy -> paste works.

**Key source files to reference**:
- `js/app.js:generatePrompt()` — generation flow
- `js/api.js:callOpenRouterAPI()` — request/response patterns
- `js/prompts.js:BASE_SYSTEM_PROMPT` — main system prompt
- `js/prompts.js:SUNO_PRO_REFINER_PROMPT` — pro refinement

---

### Phase 3: Expert Refinements + History

**Goal**: All 8 experts work. History persists across launches.

**Deliverables**:
- `ExpertRefinementSheet` — reusable `.sheet` with `Slider` (0-100 influence) + Apply button
- `ExpertListView` — 2x4 grid of expert cards in content column
- All 8 expert system prompts wired via `ExpertPersona` enum dispatch
- SwiftData container setup with `HistoryItem` `@Model`
- `HistoryStore`: add (with duplicate prevention), delete, favorite toggle, max-20 enforcement
- `HistoryListView` in `.inspector()` panel with restore/favorite/delete per item
- Export all history / import history via `fileExporter`/`fileImporter` (JSON)
- Sound Engineer tool: 3 TextEditor inputs for custom instructions
- Unit tests: `HistoryStore` (max enforcement, duplicate prevention, CRUD)

**Verification**: Generate prompt -> refine with Producer (60% influence) -> history shows 2 entries -> quit -> relaunch -> history persists -> click restore on first entry -> prompt updates.

**Key source files to reference**:
- `js/features.js:setupExpertRefinement()` — expert flow
- `js/features.js:setupSoundEngineer()` — sound engineer flow
- `js/quickwins.js:loadHistory(), saveHistory(), addHistoryItem()` — history logic
- `js/prompts.js:*_REFINER_PROMPT` — all 8 expert prompts

---

### Phase 4: KLUG Tools

**Goal**: All 12 smart tools functional.

**Deliverables**:
- `KlugTaggerView` reusable component (serves Mood Analyzer, Production Finish, Vocal Stylist, Groove Master, Performance Coach, Effect Chain)
- `GenreMixerView` — 3 genre `Picker`s + fusion result
- `HookGeneratorView` — parsed titles + hooks, click to insert
- `SongStructureView` — structure tags + explanation display
- `VibeEnhancerView` — one-click atmospheric enhancement
- `ArtistCompassView` — clickable artist suggestion list
- `TempoFinderView` — descriptive tempo + BPM display
- `GenreEvolutionView` — genre `Picker` + decade `Slider` (1950-2020)
- 5 preset chips in WorkspaceView for quick start
- Auto-trim V3 button (aggressive 200-char trim)
- `PromptBuilder` — constructs user messages for each tool
- Unit tests: `PromptBuilder` message construction

**Verification**: Click KLUG Tools -> Genre Mixer -> select Hip Hop + Jazz + Electronic -> Generate -> hybrid prompt. Mood Analyzer -> tags appear -> select 3 -> Apply -> appended to prompt. Genre Evolution -> set "Rock" + 1970 -> prompt transformed.

**Key source files to reference**:
- `js/features.js` — all `setup*()` functions for individual tools
- `js/prompts.js` — `GENRE_MIXER_PROMPT`, `MOOD_ANALYZER_PROMPT`, `HOOK_GENERATOR_PROMPT`, etc.
- `js/config.js` — `MUSIC_GENRES` array, `GENRE_EVOLUTION_DATA`

---

### Phase 5: Idea Starter + World Content

**Goal**: 45 music worlds browsable with interactive term selection.

**Deliverables**:
- Bundle all 45 JSON world files into `Resources/Worlds/`
- `WorldContentStore`: load `index.json` at launch, lazy-load individual world files with in-memory cache
- `WorldBrowserView` — grouped list (Orchestra, Contemporary, Exotic, Ambient, Electronic, World) with search
- `WorldArticleView` — HTML content rendered as styled `AttributedString` with tappable interactive terms
- Term selection UX: tap terms -> blue highlight -> collected in tag bar at bottom
- Passage selection: text selection -> yellow highlight -> added to selection
- Selection counter showing terms + passages
- "Synthesize Vision" button -> `CREATIVE_SYSTEM_PROMPT` + selected terms -> generate prompt
- Idea Spark: keyword TextEditor -> "Spark" button -> 3 AI-generated ideas displayed as cards -> click to populate vision input
- `String+HTMLStripping.swift` — strip HTML for plain text
- `AttributedString+InteractiveTerms.swift` — parse `data-term` spans

**Verification**: Sidebar -> Idea Starter -> click "Dark Ambient Ecologies" -> article loads -> click 5 terms -> counter shows "5 Terms" -> click "Synthesize" -> prompt generated from terms. Idea Spark: type "melancholy piano" -> 3 ideas appear -> click one -> vision input populated.

**Key source files to reference**:
- `js/creative_cosmos.js` — `CREATIVE_SYSTEM_PROMPT`, `CREATIVE_WORLDS` data structure
- `data/worlds/index.json` — world registry
- `data/worlds/*.json` — all 45 world content files
- `js/features.js:setupIdeaSpark()` — idea spark flow

---

### Phase 6: Klang Studio + Style Sync + Visual Engine

**Goal**: Complex creative tools in separate macOS windows.

**Deliverables**:

**Klang Studio** (separate `Window` via `@Environment(\.openWindow)`):
- Tab navigation: Synth | Orchestra | Blender | (Vocal, Rhythm, Ambient as placeholders)
- **SynthDesignerView**: Waveform radio group (4) + filter brightness `Slider` + cutoff radio (4) + envelope radio (4) + effects `Toggle` group (5) + blend `Picker` + ratio `Slider` -> translates to 35-word sentence via API
- **OrchestraDesignerView**: Section `Slider`s (4 sections, 0-100%) + articulation tag `Toggle`s + room `Picker` (4 presets) + effect `Slider`s (Hall/Echo/Air/Warmth)
- **InstrumentBlenderView**: Primary + secondary `Picker` + mix `Slider` + blend mode segmented control
- Footer: Revert / Decline / Accept buttons

**FalClient** fully implemented:
- All 6 image model payload builders (different shapes per model)
- Auth: Key header with Bearer fallback
- Retry logic matching web implementation

**Style Sync** (separate `Window`):
- Split view (HSplitView)
- Left (Encoder): current prompt display -> "Transcode" -> fal.ai image -> display with Save/Copy
- Right (Decoder): drop zone (`onDrop`) / file picker -> "Decode" -> OpenRouter vision -> text output -> "Apply to Prompt"

**Visual Engine** (sheet):
- Image prompt TextEditor -> "Generate" -> fal.ai -> image display -> "Analyze" -> OpenRouter vision -> music prompt

- Image display with native zoom/pan (magnification gesture)
- Unit tests: `FalClient` payload construction for all 6 models

**Verification**: Klang Studio -> Synth tab -> select Sawtooth + filter 70% + Pad envelope + Reverb + Delay -> Accept -> 35-word sentence appended. Style Sync -> Transcode -> image appears -> drop different image in Decoder -> Decode -> music prompt appears -> Apply.

**Key source files to reference**:
- `js/api.js:callFalAPI()` — per-model payload shapes, retry logic, auth strategies
- `js/features.js:setupSynthDesignerLab()` — synth designer logic
- `js/features.js:setupKlangStudio()` — klang studio orchestration
- `js/features.js:setupStyleSync()` — style sync encoder/decoder
- `js/features.js:setupVisualEngine()` — visual engine flow
- `js/prompts.js:SYNTH_DESIGN_TRANSLATOR_PROMPT, STYLE_SYNC_ENCODER_PROMPT, STYLE_SYNC_DECODER_PROMPT, VISUAL_ANALYZER_PROMPT`
- `clean_klang_modal.html`, `clean_sync_modal.html` — UI structure reference

---

### Phase 7: Future Lab + Command Palette + Polish

**Goal**: Full feature parity. Production-ready. Documentation complete.

**Deliverables**:

**Future Lab** (7 tools as sheets):
- Adaptive Flow: intensity `Slider` (0-100) + rewrite
- AI Collaboration: multi-`Picker` for 2-3 personas + generate
- Story Arc Designer: one-click 3-act rewrite
- Narrative Chapters: chapter count stepper -> JSON generation -> chapter cards with music matrices -> click to apply (includes JSON repair fallback via `JSON_REPAIR_PROMPT`)
- Immersive Space: spatial preset `Picker` (5 options)
- Human Touch: 5 imperfection `Toggle`s
- Release Forecast: timeline + channels -> German strategy text

**Command Palette** (Cmd+K):
- Full-screen overlay with `TextField` for fuzzy search
- Registered actions from all features
- Arrow key navigation + Enter to execute
- Dismiss on Escape

**Keyboard Shortcuts**:
- `KeyboardShortcutManager` with customizable bindings
- `.keyboardShortcut()` modifiers on key actions
- Settings UI for rebinding (capture next keypress)
- Default: Cmd+G generate, Cmd+Shift+C copy, Cmd+H history, Cmd+K palette

**macOS Integration**:
- Toolbar: Generate, Copy, History toggle
- Menu bar: File (Export/Import), Edit (Copy Prompt), View (History, Inspector), Tools (all tool shortcuts)
- `.commands {}` modifier for menu items

**Polish**:
- Sheet/window transition animations
- Empty states for all sections
- Loading states with `ProgressView` + cancel support
- Accessibility: VoiceOver labels, full keyboard navigation
- Dark appearance throughout (respect system, default dark)

**Testing**:
- UI tests: navigation flow, generation flow, history flow
- Integration test: Narrative Chapters JSON parsing with malformed input

**Documentation**:
- `ARCHITECTURE.md` — service dependency graph, data flow diagram, view hierarchy
- `ONBOARDING.md` — build instructions, how to add a new tool, how to add a new expert
- `MIGRATION-MAP.md` — table mapping every web JS function to Swift counterpart
- ADR 005 (keyboard shortcuts)
- All public types/methods have `///` doc-comments
- Complex logic has `// MARK:` sections

**Verification**: Cmd+K -> type "genre" -> "Genre Mixer" highlighted -> Enter -> sheet opens. All Future Lab tools produce results. Full documentation reviewable. All tests pass.

**Key source files to reference**:
- `js/features.js` — all Future Lab `setup*()` functions
- `js/palette.js` — command palette logic + HUD
- `js/keys.js` — keybinding registry + dispatch
- `js/chords.js` — chord shortcut handling
- `js/prompts.js` — all Future Lab prompts + `JSON_REPAIR_PROMPT`

---

## Dependencies

**Zero third-party packages.** Apple frameworks only:

| Framework | Used For |
|---|---|
| SwiftUI 7 | All UI |
| SwiftData | History persistence |
| Foundation | URLSession networking, JSON, file I/O |
| Security | Keychain for API keys |
| UniformTypeIdentifiers | File import/export types |
| AppKit (NSViewRepresentable) | Image handling, pasteboard, drag-drop |

---

## Documentation Plan

| Document | Covers | Created In |
|---|---|---|
| `ARCHITECTURE.md` | Service graph, data flow, view hierarchy, conventions | Phase 7 |
| `ONBOARDING.md` | Build, run, add tool, add expert, add world | Phase 7 |
| `MIGRATION-MAP.md` | Every web function -> Swift counterpart | Phase 7 |
| `ADR/001-architecture-pattern.md` | Why @Observable, not MVVM/TCA | Phase 1 |
| `ADR/002-data-persistence.md` | SwiftData + Keychain + AppStorage + bundled JSON | Phase 1 |
| `ADR/003-networking-design.md` | Actor HTTPClient, retry, auth strategies | Phase 2 |
| `ADR/004-view-hierarchy.md` | NavigationSplitView, sheet vs window vs popover | Phase 1 |
| `ADR/005-keyboard-shortcuts.md` | Custom registry design, macOS integration | Phase 7 |
| Inline `///` doc-comments | Every public type, method, property | All phases |
| `// MARK:` sections | Complex logic blocks | All phases |

---

## Key Source Files Reference

These files in the current web codebase should be referenced during each phase:

| Web File | Size | Contains |
|---|---|---|
| `js/prompts.js` | 770 lines | All 80+ system prompts -> `SystemPrompts.swift` |
| `js/features.js` | 1600+ lines | All tool logic -> individual Feature views |
| `js/api.js` | 358 lines | Both API clients -> `OpenRouterClient` + `FalClient` |
| `js/app.js` | 245 lines | Core generation flow -> `PromptEngine` |
| `js/quickwins.js` | 1000+ lines | History, lint, presets, char counting |
| `js/modals.js` | 844 lines | Modal UI structure -> SwiftUI views |
| `js/creative_cosmos.js` | 1.2MB | World content + `CREATIVE_SYSTEM_PROMPT` |
| `js/config.js` | 49 lines | Models, genres, URLs -> config types |
| `js/keys.js` | 138 lines | Keybinding system -> `KeyboardShortcutManager` |
| `js/palette.js` | 136 lines | Command palette -> `CommandPaletteView` |
| `data/worlds/*.json` | 45 files | Bundle as Resources |
| `css/styles.css` | 2700 lines | Design tokens -> SwiftUI ViewModifiers |
| `clean_klang_modal.html` | - | Klang Studio UI structure |
| `clean_sync_modal.html` | - | Style Sync UI structure |
