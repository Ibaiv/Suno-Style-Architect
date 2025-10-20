# Suno Style Architect: Design System

**Version**: 1.0  
**Last Updated**: October 2025  
**Purpose**: Comprehensive design guidelines for maintaining visual consistency when extending the application

---

## 🎯 Overview

This design system ensures that **all new features maintain the sophisticated, glass-morphism aesthetic** while providing clear patterns for expansion beyond the current 2x2 tile grid without breaking the existing layout.

## 🎨 Core Visual Language

### Color Palette (IMMUTABLE)
```css
/* Base Colors - NEVER change these */
:root {
    --bg-primary: #0d0d0f;                    /* Main background */
    --glass-panel: rgba(23, 23, 23, 0.4);     /* Panel backgrounds */
    --glass-elevated: rgba(13, 13, 15, 0.95); /* Expanded panels */
    --border-subtle: rgba(115, 115, 115, 0.2); /* Panel borders */
    --border-active: rgba(115, 115, 115, 0.4); /* Active borders */
    
    /* Text Colors */
    --text-primary: #ffffff;      /* Headers */
    --text-secondary: #e5e7eb;    /* Body text */
    --text-tertiary: #9ca3af;     /* Supporting text */
    --text-quaternary: #6b7280;   /* Disabled/subtle */
}
```

### Typography Scale (STRICT HIERARCHY)
```css
/* Typography Hierarchy - Follow exactly */
.text-display {
    font-size: 3rem;     /* 48px - Main title only */
    font-weight: 700;
    line-height: 1.1;
}

.text-xl {
    font-size: 1.25rem;  /* 20px - Section headers */
    font-weight: 600;
    line-height: 1.4;
}

.text-base {
    font-size: 1rem;     /* 16px - Body text */
    font-weight: 400;
    line-height: 1.5;
}

.text-sm {
    font-size: 0.875rem; /* 14px - Secondary text */
    font-weight: 400;
    line-height: 1.4;
}

.text-xs {
    font-size: 0.75rem;  /* 12px - Labels, captions */
    font-weight: 400;
    line-height: 1.3;
}
```

### Border Radius System (CONSISTENT)
```css
/* Border Radius Progression */
.rounded-3xl { border-radius: 24px; }  /* Main containers */
.rounded-2xl { border-radius: 16px; }  /* Sub-containers */
.rounded-xl  { border-radius: 12px; }  /* Cards, panels */
.rounded-lg  { border-radius: 8px; }   /* Buttons, inputs */
.rounded-md  { border-radius: 6px; }   /* Small elements */
.rounded-sm  { border-radius: 4px; }   /* Micro elements */
```

### Glass Morphism Standards
```css
/* Glass Effect Templates */
.glass-primary {
    background: rgba(23, 23, 23, 0.4);
    border: 1px solid rgba(115, 115, 115, 0.2);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

.glass-elevated {
    background: rgba(13, 13, 15, 0.95);
    border: 1px solid rgba(115, 115, 115, 0.4);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
}

.glass-subtle {
    background: rgba(23, 23, 23, 0.2);
    border: 1px solid rgba(115, 115, 115, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}
```

## 🏗️ Layout Architecture

### Z-Index Management
```css
:root {
    /* Z-Index Scale - Use these exact values */
    --z-base: 1;         /* Main content tiles */
    --z-elevated: 10;    /* Dropdowns, tooltips */
    --z-sticky: 50;      /* Sticky headers */
    --z-modal: 100;      /* Current modals */
    --z-feature: 150;    /* Expanded feature panels */
    --z-overlay: 180;    /* Full-screen overlays */
    --z-system: 200;     /* System notifications */
}
```

### Grid Preservation Rules
```css
/* CRITICAL: Never break this grid structure */
.main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

@media (min-width: 1280px) {
    .main-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 3rem;
    }
}

/* New features must respect this constraint */
```

## 🚀 Feature Expansion Patterns

### Pattern 1: Expandable Panel
**Use Case**: Features that need occasional more space  
**Behavior**: Starts as tile, expands to overlay when triggered

```html
<div class="feature-panel expandable" data-feature="advanced-editor">
    <div class="panel-compact">
        <!-- Compact view content -->
        <h3 class="text-xl font-semibold text-white">Advanced Editor</h3>
        <button class="expand-trigger">Expand</button>
    </div>
    <div class="panel-expanded hidden">
        <!-- Full interface content -->
    </div>
</div>
```

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
    z-index: var(--z-feature);
    background: rgba(13, 13, 15, 0.95);
    border-color: rgba(115, 115, 115, 0.4);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}
```

### Pattern 2: Slide-Out Workspace
**Use Case**: Complex tools that need dedicated space  
**Behavior**: Slides in from screen edge, main content adapts

```html
<div class="slide-workspace" data-workspace="audio-analysis">
    <div class="workspace-trigger">
        <button class="trigger-btn">Open Audio Analyzer</button>
    </div>
    <div class="workspace-panel">
        <!-- Complex workspace content -->
    </div>
</div>
```

```css
.workspace-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 60%;
    height: 100vh;
    background: rgba(13, 13, 15, 0.95);
    border-left: 1px solid rgba(115, 115, 115, 0.4);
    backdrop-filter: blur(24px);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: var(--z-feature);
}

.workspace-panel.active {
    transform: translateX(0);
}

/* Main content adaptation */
.main-content.workspace-active {
    transform: translateX(-30%);
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
```

### Pattern 3: Floating Action Zone
**Use Case**: Contextual tools that appear on hover/focus  
**Behavior**: Fixed to screen edges, reveals on trigger

```html
<div class="floating-zone floating-zone-right" data-zone="quick-actions">
    <div class="zone-trigger">
        <div class="trigger-icon">⚡</div>
    </div>
    <div class="zone-content">
        <!-- Quick action buttons -->
    </div>
</div>
```

```css
.floating-zone {
    position: fixed;
    top: 50%;
    right: -200px;
    transform: translateY(-50%);
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: var(--z-elevated);
}

.floating-zone:hover,
.floating-zone.active {
    right: 0;
}

.zone-trigger {
    position: absolute;
    left: -40px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 80px;
    background: rgba(23, 23, 23, 0.4);
    border: 1px solid rgba(115, 115, 115, 0.2);
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### Pattern 4: Contextual Overlay
**Use Case**: Features that need spatial relationship to source  
**Behavior**: Overlay that maintains visual connection to trigger

```html
<div class="contextual-overlay" data-source="result-container">
    <div class="overlay-backdrop"></div>
    <div class="overlay-content">
        <!-- Feature content with visual connection line -->
    </div>
</div>
```

```css
.contextual-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-feature);
    display: none;
}

.contextual-overlay.active {
    display: block;
}

.overlay-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
}

.overlay-content {
    position: absolute;
    /* Position calculated relative to source element */
    background: rgba(13, 13, 15, 0.95);
    border: 1px solid rgba(115, 115, 115, 0.4);
    border-radius: 24px;
    backdrop-filter: blur(24px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}
```

## ⚡ Animation Standards

### Timing Functions
```css
:root {
    /* Easing Functions - Use these exact curves */
    --ease-ui: cubic-bezier(0.4, 0, 0.2, 1);        /* UI interactions */
    --ease-dramatic: cubic-bezier(0.23, 1, 0.32, 1); /* Major transitions */
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Playful */
}
```

### Duration Scale
```css
:root {
    /* Duration Scale - Match interaction complexity */
    --duration-instant: 100ms;   /* Hover states */
    --duration-fast: 200ms;      /* Button presses, micro-interactions */
    --duration-normal: 300ms;    /* Modal open/close */
    --duration-slow: 400ms;      /* Panel expansions */
    --duration-dramatic: 600ms;  /* Major layout changes */
}
```

### Animation Templates
```css
/* Button Interaction */
.btn-interaction {
    transition: all var(--duration-fast) var(--ease-ui);
    transform: scale(1);
}

.btn-interaction:hover {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
}

.btn-interaction:active {
    transform: scale(0.98);
}

/* Panel Expansion */
.panel-expand {
    transition: all var(--duration-slow) var(--ease-dramatic);
}

/* Floating Entry */
.float-in {
    animation: floatIn var(--duration-normal) var(--ease-ui);
}

@keyframes floatIn {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
```

## 🎛️ Component Standards

### Button Hierarchy
```css
/* Primary Action Button */
.btn-primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #ffffff;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 12px;
    transition: all var(--duration-fast) var(--ease-ui);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    transform: translateY(-2px);
}

/* Secondary Action Button */
.btn-secondary {
    background: rgba(23, 23, 23, 0.4);
    border: 1px solid rgba(115, 115, 115, 0.3);
    color: #e5e7eb;
    font-weight: 500;
    padding: 12px 24px;
    border-radius: 12px;
    backdrop-filter: blur(16px);
    transition: all var(--duration-fast) var(--ease-ui);
}

.btn-secondary:hover {
    background: rgba(64, 64, 64, 0.4);
    border-color: rgba(115, 115, 115, 0.5);
    transform: translateY(-1px);
}

/* Subtle Action Button */
.btn-subtle {
    background: transparent;
    border: 1px solid rgba(115, 115, 115, 0.2);
    color: #9ca3af;
    font-weight: 400;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all var(--duration-fast) var(--ease-ui);
}

.btn-subtle:hover {
    background: rgba(23, 23, 23, 0.2);
    color: #e5e7eb;
    border-color: rgba(115, 115, 115, 0.4);
}
```

### Input Field Standards
```css
.input-primary {
    background: rgba(23, 23, 23, 0.4);
    border: 1px solid rgba(115, 115, 115, 0.3);
    color: #e5e7eb;
    padding: 12px 16px;
    border-radius: 12px;
    backdrop-filter: blur(16px);
    transition: all var(--duration-fast) var(--ease-ui);
    font-size: 1rem;
}

.input-primary:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(23, 23, 23, 0.6);
}

.input-primary::placeholder {
    color: #6b7280;
}
```

## 🚫 Critical Don'ts

### Layout Violations
- ❌ **Never break the main grid structure**
- ❌ **Never use position: absolute on main containers**
- ❌ **Never override the xl:grid-cols-2 behavior**
- ❌ **Never remove generous spacing (gap-8 lg:gap-12)**

### Visual Violations
- ❌ **Never introduce new color schemes**
- ❌ **Never use solid backgrounds for panels**
- ❌ **Never use sharp corners (border-radius: 0)**
- ❌ **Never use jarring animations or transitions**
- ❌ **Never break the typography hierarchy**

### Accessibility Violations
- ❌ **Never rely solely on color for meaning**
- ❌ **Never create touch targets smaller than 44px**
- ❌ **Never skip focus management in expanded states**
- ❌ **Never use auto-playing animations without controls**

## ✅ Implementation Checklist

When implementing a new feature:

### Design Phase
- [ ] Feature respects main grid layout
- [ ] Uses established color palette only
- [ ] Follows border-radius progression
- [ ] Maintains glass morphism aesthetic
- [ ] Uses correct z-index layer

### Development Phase
- [ ] Animations use approved easing functions
- [ ] Transitions respect duration scale
- [ ] Focus management is implemented
- [ ] Touch targets meet 44px minimum
- [ ] Performance uses only transform/opacity

### Testing Phase
- [ ] Works across all supported browsers
- [ ] Maintains 60fps during animations
- [ ] Responsive behavior matches expectations
- [ ] Keyboard navigation functions correctly
- [ ] Screen reader announces state changes

## 🔄 Future Evolution

This design system is designed to grow with the application while maintaining consistency:

1. **Pattern Library**: New interaction patterns should be documented here
2. **Component Registry**: Reusable components should follow these standards
3. **Token Evolution**: CSS custom properties enable systematic updates
4. **Accessibility Enhancement**: Standards will evolve with web accessibility guidelines

---

**Remember**: The goal is to create features that feel **native and integrated** while maintaining the app's **sophisticated, professional aesthetic**. When in doubt, favor the existing patterns over innovation.