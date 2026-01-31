# Feature Request: Cancel Generation

## Summary

Add the ability to cancel an in-progress image or prompt generation in the Stil-Synchronisator, providing users control over long-running operations and preventing wasted API credits.

---

## Problem Statement

Currently, once a user clicks "Transcode" (Encoder) or "Decode" (Decoder):
- There's no way to stop the process
- Must wait until completion or error
- If they accidentally triggered it, API credits are consumed
- Modal cannot be closed during generation without losing the result

Image generation can take 10-30+ seconds depending on the model and server load. Users need an escape hatch.

---

## Proposed Solution

### User Flow

1. User initiates generation
2. Loading UI shows with a "Cancel" button
3. Clicking "Cancel":
   - Aborts the API request
   - Returns UI to pre-generation state
   - Shows confirmation message
4. ESC key also triggers cancel during generation

### UI Design

#### During Generation

```
┌─────────────────────────────────────────┐
│  ENCODER - Sound Transformation         │
├─────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │     ⟳ Analysiere Klangspektrum │    │
│  │                                 │    │
│  │     Step 2/3: Rendering...     │    │
│  │                                 │    │
│  │     ┌─────────────────────┐    │    │
│  │     │   ✕ Abbrechen       │    │    │
│  │     └─────────────────────┘    │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

### Technical Implementation

#### AbortController Integration

```javascript
// In setupStyleSync()
let currentAbortController = null;

transcodeBtn.addEventListener('click', async () => {
    // Create new abort controller for this generation
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;
    
    // Show cancel button
    showCancelButton(true);
    
    try {
        // Pass signal to API calls
        const visualPrompt = await callOpenRouterAPI(
            promptText, 
            STYLE_SYNC_ENCODER_PROMPT,
            null,
            { signal }
        );
        
        if (signal.aborted) return;
        
        const imageUrl = await callFalAPI(visualPrompt, { signal });
        
        if (signal.aborted) return;
        
        // Show result
        visualResult.src = imageUrl;
        visualResult.classList.remove('hidden');
        
    } catch (error) {
        if (error.name === 'AbortError') {
            showToast('Generation abgebrochen');
            resetGenerationUI();
        } else {
            showError(error.message);
        }
    } finally {
        showCancelButton(false);
        currentAbortController = null;
    }
});

function cancelGeneration() {
    if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
    }
}

// Cancel button handler
cancelBtn.addEventListener('click', cancelGeneration);

// ESC also cancels during generation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentAbortController) {
        cancelGeneration();
    }
});
```

#### API Function Updates

Update `callFalAPI` and `callOpenRouterAPI` to accept and use AbortSignal:

```javascript
// api.js
async function callFalAPI(prompt, options = {}) {
    const { signal, ...otherOptions } = options;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { ... },
        body: JSON.stringify(payload),
        signal: signal  // Pass abort signal to fetch
    });
    
    // ... rest of function
}
```

#### Cancel Button HTML

```html
<button id="studio-cancel-btn" 
        class="hidden absolute bottom-4 left-1/2 -translate-x-1/2 
               bg-red-500/20 border border-red-500/50 text-red-300 
               hover:bg-red-500/30 px-4 py-2 rounded-lg 
               flex items-center gap-2 transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
         viewBox="0 0 24 24" fill="none" stroke="currentColor" 
         stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <span>Abbrechen</span>
</button>
```

#### CSS for Cancel Button

```css
#studio-cancel-btn {
    animation: fadeIn 0.2s ease-out;
}

#studio-cancel-btn:hover {
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

@keyframes pulse-cancel {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.cancelling #studio-cancel-btn {
    animation: pulse-cancel 0.5s infinite;
    pointer-events: none;
}
```

---

## Acceptance Criteria

- [ ] Cancel button appears during generation
- [ ] Clicking cancel aborts API requests
- [ ] UI resets to pre-generation state after cancel
- [ ] Toast confirms cancellation
- [ ] ESC key triggers cancel during generation
- [ ] ESC closes modal when NOT generating (existing behavior)
- [ ] Cancel button hidden when not generating
- [ ] Works for both Encoder and Decoder
- [ ] No memory leaks from abandoned operations
- [ ] Graceful handling if cancel fails

---

## Edge Cases

- User cancels right after starting (race condition)
- Network request already completed when cancel clicked
- Multiple rapid cancel clicks
- Cancel during "analyzing" vs "rendering" phase

---

## Labels

- `enhancement`
- `feature-request`
- `stil-synchronisator`
- `ux`
- `api`

---

## Priority

**Medium** - Important for user control and preventing frustration.

---

## Estimated Effort

**Small-Medium** - Requires AbortController integration across API functions.

---

## Technical Notes

- AbortController is supported in all modern browsers
- fetch() natively supports AbortSignal
- Consider timeout fallback if abort doesn't work
