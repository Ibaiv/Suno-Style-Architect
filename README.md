# Suno Style Architect

A powerful AI-powered web application for creating optimized music prompts for Suno AI. Transform your musical ideas into professional-grade prompts with expert refinement tools and intelligent suggestions.

![Suno Style Architect](https://img.shields.io/badge/Status-Ready-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🎵 Features

### Core Functionality
- **Smart Prompt Generation**: Transform basic ideas into detailed, optimized Suno prompts
- **Expert Refinement**: AI personas with specialized knowledge (Producer, Musician, Composer, DJ, etc.)
- **KLUG Tools**: Intelligent features for mood analysis, genre mixing, tempo finding, and more
- **Idea Spark**: Generate creative song concepts from simple keywords
- **Multi-Model Support**: Works with various AI models through OpenRouter

### Expert Personas
- 🎛️ **Weltklasse Produzent**: Focus on sound design & mixing
- 🎼 **Weltklasse Musiker**: Emphasis on musicality & emotion
- 🎬 **Filmkomponist**: Cinematic storytelling & atmosphere
- 🎧 **DJ/Remixer**: Club-ready groove & energy
- 🔬 **Avantgarde-Klangkünstler**: Experimental & unconventional
- 🎯 **Minimalist-Komponist**: Reduced to essence
- 🎤 **Vocal-Harmony Arrangeur**: Complex vocal arrangements
- 🌍 **Ethno-Musiker**: World music integration
- 🔧 **Sound-Ingenieur**: Technical specifications

### KLUG (Smart) Tools
- **Genre-Mixer**: Combine multiple genres for unique sounds
- **Stimmungs-Analysator**: Find matching instruments for your mood
- **Titel- & Hook-Generator**: Creative title and hook suggestions
- **Song-Struktur-Assistent**: Dynamic song structure planning
- **Vibe-Veredler**: Enhance atmospheric elements
- **Künstler-Kompass**: Find similar artists for reference
- **Tempo & BPM-Finder**: Optimal tempo suggestions
- **Produktions-Finish**: Final polish with production techniques
- **Gesangs-Stilist**: Define vocal performance styles
- **Groove-Meister**: Rhythmic concept definition
- **Performance-Coach**: Instrument playing nuances
- **Effektketten-Designer**: Audio effect combinations

## 🚀 Quick Start

### Prerequisites
- Python 3.6+ (pre-installed on macOS)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls

### Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd /Users/felix/Documents/WebProjects/suno-style-architect
   ```

2. **Start the development server:**
   ```bash
   python3 server.py
   ```
   
   You should see:
   ```
   🎵 Suno Style Architect Development Server
   📡 Server running at: http://localhost:8000
   🌐 Open your browser and navigate to: http://localhost:8000
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:8000
   ```

4. **Configure your API settings:**
   - On first visit, you'll see a setup modal
   - Get your free API key from [OpenRouter.ai](https://openrouter.ai)
   - Choose your preferred AI model (GPT OSS 120B recommended)
   - Click "Einstellungen speichern"

## 🔧 Configuration

### API Setup
1. **Get OpenRouter API Key**: Visit [OpenRouter.ai](https://openrouter.ai) and create a free account
2. **Choose AI Model**: The app supports multiple models:
   - **GPT OSS 120B** (Recommended - best price/performance)
   - **LLama 4 Scout**
   - **Claude Sonnet 4**
   - **Deepseek 3.1 Terminus**
   - **Deepseek R1 Distill Llama 70B**

### Settings Management
- Settings are saved locally in your browser
- Click the ⚙️ button in the header to change settings
- API key is stored securely in browser localStorage

## 🎯 How to Use

### Basic Workflow
1. **Enter Your Vision**: Describe your musical idea in the text area
2. **Generate Prompt**: Click "Prompt Architektieren" 
3. **Refine with Experts**: Use expert personas to enhance your prompt
4. **Apply KLUG Tools**: Use intelligent tools for specific refinements
5. **Copy & Use**: Copy the final prompt to use in Suno AI

### Advanced Features

#### Expert Refinement
- Click any expert persona button
- Adjust the influence level (0-100%)
- Apply the refinement to your prompt

#### KLUG Tools
- Available only after generating an initial prompt
- Each tool provides specific enhancements
- Multiple tools can be applied in sequence

#### Version Optimization
- **"Für v3 (kurz)"**: Optimizes for Suno v3 (under 200 characters)
- **"Für Pro (detailliert)"**: Detailed version for Suno Pro (up to 800 characters)
- **"Eigene Anweisung"**: Custom refinement instructions

## 📁 Project Structure

```
suno-style-architect/
├── index.html              # Main application HTML
├── server.py                # Development server with CORS support
├── README.md                # This documentation
├── css/
│   └── styles.css          # Application styles and animations
├── js/
│   ├── config.js           # Configuration and constants
│   ├── prompts.js          # AI system prompts
│   ├── api.js              # API communication and utilities
│   ├── app.js              # Main application logic
│   ├── features.js         # Advanced features (KLUG tools, experts)
│   └── modals.js           # Modal HTML and management
└── assets/                 # Static assets (currently empty)
```

### File Descriptions

#### Core Files
- **`index.html`**: Main application interface with clean, modular structure
- **`server.py`**: Local development server that handles CORS for API calls
- **`css/styles.css`**: Modern styling with animations and responsive design

#### JavaScript Modules
- **`config.js`**: App configuration, model definitions, and state management
- **`prompts.js`**: All AI system prompts for different features and personas
- **`api.js`**: OpenRouter API integration and utility functions
- **`app.js`**: Main application logic, event handling, and core functionality
- **`features.js`**: Advanced features including expert refinements and KLUG tools
- **`modals.js`**: Modal window HTML content and management

## 🔧 Development

### Running in Development Mode
The included Python server provides:
- ✅ CORS headers for API calls
- ✅ Static file serving
- ✅ Hot reload (manual browser refresh)
- ✅ Error handling and logging

### Customization
- **Add new AI models**: Update `MODEL_NAMES` in `config.js`
- **Modify prompts**: Edit system prompts in `prompts.js`
- **Add new features**: Extend functionality in `features.js`
- **Style changes**: Modify `styles.css`

### Architecture Notes
- **Modular Design**: Clean separation of concerns across files
- **Event-Driven**: Uses DOM events for inter-component communication
- **State Management**: Simple global state with localStorage persistence
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🎨 Design System

### Core Design Language
The app follows a **sophisticated, modern design language** with these foundational elements:

#### Visual Foundation
- **Dark Theme**: `#0d0d0f` base with subtle radial gradients
- **Glass Morphism**: `backdrop-blur-md` with semi-transparent panels
- **Neutral Palette**: `neutral-800/20` backgrounds, `neutral-700/60` borders
- **Rounded Corners**: Consistent `rounded-3xl` for containers, `rounded-xl` for elements
- **Typography**: Inter font family with clear hierarchy
- **Generous Spacing**: Using `gap-8 lg:gap-12` for breathing room

#### Visual Hierarchy
1. **Primary Containers**: Large glass cards with deep shadows (`shadow-2xl shadow-black/20`)
2. **Secondary Elements**: Smaller tiles within containers (KLUG tools, expert personas)
3. **Tertiary Controls**: Buttons, inputs, and micro-interactions

### Design Rules for New Features

#### **CRITICAL**: Existing Layout Preservation
- ✅ **Never break the main grid**: Respect the existing `xl:grid-cols-2` structure
- ✅ **Expand, don't replace**: Features should enhance, not replace core tiles
- ✅ **Maintain visual weight**: New elements must balance with existing containers
- ✅ **Preserve breathing room**: Keep generous spacing consistent

#### Layout Strategies for Extended Features

##### 1. **Expandable Panel System**
For features needing more space without disrupting the main grid:

```css
.feature-panel {
    position: relative;
    background: rgba(23, 23, 23, 0.4);
    border: 1px solid rgba(115, 115, 115, 0.2);
    border-radius: 24px;
    backdrop-filter: blur(16px);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.feature-panel.expanded {
    position: fixed;
    inset: 20px;
    z-index: 150;
    background: rgba(13, 13, 15, 0.95);
    border-color: rgba(115, 115, 115, 0.4);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}
```

##### 2. **Slide-Out Workspace**
For complex features like advanced editing:
- Triggers from existing tile
- Slides from right edge (60% screen width)
- Main content shifts left responsively
- Glass panel with deeper blur

##### 3. **Floating Action Zones**
For contextually-sensitive advanced features:
- Fixed to screen edges with hover triggers
- Subtle glow with smooth slide-out animation
- Semi-circular design language

##### 4. **Contextual Overlay Grid**
For features needing spatial relationship to main tiles:
- Semi-transparent overlay maintaining visual connection
- Animated entrance from source tile position
- Same border radius and glass effects

#### Strict Visual Standards

##### **Color Consistency**
- ✅ Use ONLY colors from existing neutral palette
- ✅ `text-white` for headers, `text-neutral-200` for primary, `text-neutral-400` for secondary
- ❌ Never introduce new color schemes

##### **Border Radius Harmony**
- ✅ Stick to `rounded-3xl`, `rounded-xl`, `rounded-lg` progression
- ❌ Never use sharp corners or inconsistent radii

##### **Glass Effect Standards**
- ✅ Always use `backdrop-blur-md` with appropriate opacity
- ✅ Match existing `shadow-2xl shadow-black/20` patterns
- ❌ Never use solid backgrounds for panels

##### **Animation Standards**
- ✅ **Micro-interactions**: `0.2s` duration with `cubic-bezier(0.4, 0, 0.2, 1)`
- ✅ **Major transitions**: `0.4s` duration with `cubic-bezier(0.23, 1, 0.32, 1)`
- ✅ **Performance**: Use only `transform` and `opacity` properties
- ❌ Never use jarring or inconsistent timing

##### **Typography Hierarchy**
- ✅ Follow `text-xl` → `text-base` → `text-sm` → `text-xs` progression
- ✅ `font-semibold` for headings, `font-medium` for emphasis
- ❌ Never break established hierarchy

#### Z-Index Management
Clear depth system for feature layering:

```css
:root {
    --depth-base: 1;          /* Main tiles */
    --depth-elevated: 10;     /* Dropdowns, tooltips */
    --depth-modal: 100;       /* Current modals */
    --depth-feature: 150;     /* Expanded features */
    --depth-system: 200;      /* System-level UI */
}
```

### Implementation Guidelines

#### **Human-Centered Design**
1. **Progressive Disclosure**: Advanced features hidden until needed
2. **Contextual Appearance**: Features appear when relevant
3. **Clear Escape Routes**: Always provide obvious return to main interface
4. **Visual Continuity**: Maintain connection to source elements

#### **Accessibility Requirements**
1. **Focus Management**: Proper tab order in expanded states
2. **Screen Reader Support**: Announce state changes clearly
3. **Color Independence**: Never rely solely on color for meaning
4. **Touch Targets**: Minimum 44px for interactive elements

#### **Performance Standards**
1. **Lazy Loading**: Load feature code only when triggered
2. **60fps Animations**: All transitions must maintain frame rate
3. **Memory Efficiency**: Clean up expanded features when closed
4. **Network Awareness**: Minimize API calls for UI-only features

### Feature Integration Examples

#### Example: Advanced Audio Analyzer
```html
<div class="feature-panel audio-analyzer" data-feature="audio-analysis">
    <div class="panel-header">
        <h3 class="text-xl font-semibold text-white">Audio Analysis</h3>
        <button class="expand-trigger btn-transition btn-press">Expand</button>
    </div>
    <!-- Expandable content with waveform visualization -->
</div>
```

#### Example: Collaborative Workspace
```html
<div class="floating-zone floating-zone-left" data-feature="collaboration">
    <!-- Slides in from left with user avatars and real-time editing -->
</div>
```

This design system ensures new features feel **native and integrated** while maintaining the app's **sophisticated, professional aesthetic**. Always respect the existing visual language while providing clear patterns for growth.

## 🛠️ Troubleshooting

### Common Issues

**"API Key Error"**
- Ensure your OpenRouter API key starts with `sk-or-v1-`
- Check that you have credits in your OpenRouter account
- Verify internet connection

**"CORS Error"**
- Make sure you're using the Python server (`python3 server.py`)
- Don't open the HTML file directly in browser
- Check that server is running on http://localhost:8000

**"Tools Not Working"**
- KLUG tools are only available after generating an initial prompt
- Make sure you've completed the API setup
- Check browser console for JavaScript errors

**"Server Won't Start"**
- Port 8000 might be in use: `lsof -ti:8000 | xargs kill -9`
- Try a different port by modifying `PORT = 8000` in `server.py`
- Ensure Python 3 is installed: `python3 --version`

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔐 Privacy & Security

- **Local Storage Only**: API keys stored locally in your browser
- **No Data Collection**: No analytics or tracking
- **Secure API Calls**: All API communication over HTTPS
- **Open Source**: Full transparency of code and functionality

## 📝 License

MIT License - feel free to modify and distribute as needed.

## 🤝 Contributing

This is a standalone project extracted from a larger system. Feel free to:
- Report issues
- Suggest improvements
- Fork and modify for your needs
- Share your enhancements

## 🎵 Credits

- **Original Concept**: Based on Suno Style Architect web application
- **AI Integration**: OpenRouter API for model access
- **UI Framework**: Tailwind CSS for styling
- **Icons**: Lucide React icon set

---

**Ready to create amazing music prompts? Start your server and let your creativity flow! 🎶**