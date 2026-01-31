# Feature Request: One-Click Apply Decoded Prompt

## Summary

Add a streamlined "Apply to Main Prompt" functionality that instantly transfers the decoded music prompt from the Stil-Synchronisator Decoder directly into the main prompt editor, replacing or appending to existing content.

---

## Problem Statement

Currently, when the Decoder generates a music prompt from an image:
1. User must manually select all text in the decoder output
2. Copy the text
3. Close the modal
4. Navigate to the main prompt area
5. Paste (replacing or adding manually)

This multi-step process is tedious and error-prone. The existing "APPLY TO PROMPT" button exists but its behavior needs clarification and enhancement.

---

## Proposed Solution

### Enhanced Apply Button Behavior

Transform the existing "APPLY TO PROMPT" button into a more powerful action with options:

#### Option A: Simple Replace (Current likely behavior)
- Single click replaces main prompt entirely
- Quick confirmation toast

#### Option B: Smart Menu (Proposed Enhancement)

```
┌──────────────────────────────────────────┐
│  SONIC_INTERPRETATION_OUTPUT             │
├──────────────────────────────────────────┤
│  "Neo-noir synthwave, 88 BPM, pulsing    │
│   Juno-106 bass with slow filter         │
│   movement, detuned saw-wave arpeggios   │
│   panned wide..."                        │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │        APPLY TO PROMPT ▼          │ │
│  └────────────────────────────────────┘ │
│      │                                   │
│      ├─▶ Ersetzen (Replace)             │
│      ├─▶ Anhängen (Append)              │
│      ├─▶ Als Inspiration einfügen        │
│      │   (Insert as inspiration)        │
│      └─▶ In Zwischenablage kopieren      │
│          (Copy to clipboard)            │
│                                          │
└──────────────────────────────────────────┘
```

### Action Descriptions

| Action | Behavior |
|--------|----------|
| **Ersetzen** | Replace entire main prompt with decoded text |
| **Anhängen** | Add decoded text after existing prompt (with separator) |
| **Als Inspiration** | Open refinement modal with decoded text as starting point |
| **Kopieren** | Copy to clipboard (existing functionality) |

### UI Flow

1. User generates decoded prompt from image
2. Clicks "APPLY TO PROMPT" button
3. Dropdown menu appears with options
4. User selects action
5. Action executes with visual feedback
6. Modal can optionally auto-close after apply

### Technical Implementation

#### Updated Button HTML

```html
<div class="relative" id="apply-dropdown-container">
    <button id="studio-apply-btn" class="...">
        <span>APPLY TO PROMPT</span>
        <svg><!-- Dropdown arrow --></svg>
    </button>
    
    <div id="apply-dropdown-menu" class="hidden absolute bottom-full mb-2 ...">
        <button data-action="replace" class="dropdown-item">
            <svg><!-- Replace icon --></svg>
            Ersetzen
        </button>
        <button data-action="append" class="dropdown-item">
            <svg><!-- Append icon --></svg>
            Anhängen
        </button>
        <button data-action="inspire" class="dropdown-item">
            <svg><!-- Lightbulb icon --></svg>
            Als Inspiration
        </button>
        <div class="border-t border-white/10 my-1"></div>
        <button data-action="copy" class="dropdown-item">
            <svg><!-- Copy icon --></svg>
            Kopieren
        </button>
    </div>
</div>
```

#### JavaScript Logic

```javascript
// Apply dropdown handling
const applyBtn = document.getElementById('studio-apply-btn');
const dropdown = document.getElementById('apply-dropdown-menu');
const mainPromptArea = document.getElementById('result-text');

applyBtn.addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
});

dropdown.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const decodedText = decodeResult.value;
        
        switch(action) {
            case 'replace':
                mainPromptArea.textContent = decodedText;
                showToast('Prompt ersetzt!');
                closeStudio();
                break;
            case 'append':
                mainPromptArea.textContent += '\n\n---\n\n' + decodedText;
                showToast('Prompt erweitert!');
                break;
            case 'inspire':
                // Open refinement modal with decoded text
                openRefinementWithText(decodedText);
                break;
            case 'copy':
                navigator.clipboard.writeText(decodedText);
                showToast('In Zwischenablage kopiert!');
                break;
        }
        
        dropdown.classList.add('hidden');
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!applyBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});
```

---

## Acceptance Criteria

- [ ] "APPLY TO PROMPT" shows dropdown menu on click
- [ ] "Ersetzen" replaces main prompt and shows confirmation
- [ ] "Anhängen" adds to main prompt with visual separator
- [ ] "Als Inspiration" opens refinement flow (if available)
- [ ] "Kopieren" copies to clipboard with feedback
- [ ] Dropdown closes when clicking outside
- [ ] Keyboard accessible (Enter to open, arrows to navigate)
- [ ] Visual feedback (toast notifications) for all actions
- [ ] Modal optionally closes after "Ersetzen" action
- [ ] German UI text

---

## Labels

- `enhancement`
- `feature-request`
- `stil-synchronisator`
- `ux`

---

## Priority

**Medium** - Improves existing workflow efficiency.

---

## Estimated Effort

**Small** - Primarily UI enhancement with straightforward logic.
