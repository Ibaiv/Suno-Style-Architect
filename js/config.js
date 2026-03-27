// === FAL.AI STATE ===
let FAL_API_KEY = '';
let FAL_MODEL = 'fal-ai/nano-banana-pro';  // Nano Banana Pro - newest 2025 model
const FAL_BASE_URL = 'https://fal.run/'; // fal.ai proxy URL

// Model display names for fal.ai
const FAL_MODEL_NAMES = {
    'fal-ai/flux-pro': 'Flux Pro',
    'fal-ai/flux-pro/kontext': 'Flux Pro Kontext (img2img)',
    'fal-ai/nano-banana-pro': 'Nano Banana Pro',
    'fal-ai/nano-banana-2': 'Nano Banana 2',
    'fal-ai/recraft/v3/text-to-image': 'Recraft V3',
    'fal-ai/gpt-image-1.5': 'GPT-Image 1.5',
    'fal-ai/flux/dev': 'FLUX.1 [dev]'
};

// FAL endpoint mapping (selection value -> API path)
const FAL_MODEL_ENDPOINTS = {
    'fal-ai/flux-pro': 'fal-ai/flux-pro',
    'fal-ai/flux-pro/kontext': 'fal-ai/flux-pro/kontext',
    'fal-ai/nano-banana-pro': 'fal-ai/nano-banana-pro',
    'fal-ai/nano-banana-2': 'fal-ai/nano-banana-2',
    'fal-ai/recraft/v3/text-to-image': 'fal-ai/recraft/v3/text-to-image',
    'fal-ai/gpt-image-1.5': 'fal-ai/gpt-image-1.5',
    'fal-ai/flux/dev': 'fal-ai/flux/dev'
};

// === APP STATE ===
let API_KEY = '';
let SELECTED_MODEL = 'openai/gpt-5-mini';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model display names
const MODEL_NAMES = {
    'openai/gpt-5-mini': 'GPT-5 mini',
    'anthropic/claude-haiku-4.5': 'Haiku 4.5',
    'deepseek/deepseek-v3.1-terminus': 'Deepseek 3.1 terminus',
    'deepseek/deepseek-v3.2-exp': 'Deepseek 3.2 Exp',
    'tngtech/deepseek-r1t2-chimera': 'Deepseek-r1t2-chimera',
    'z-ai/glm-4.6': 'GLM-4.6',
    'x-ai/grok-4-fast': 'Grok-4-fast',
    'inclusionai/ling-1t': 'Ling-1T'
};

// Music genres for genre mixer
const musicGenres = ["Acoustic", "Afrobeat", "Alternative", "Ambient", "Blues", "Bluegrass", "Breakcore", "Celtic", "City Pop", "Classical", "Country", "Dance", "Dancehall", "Disco", "Drum and Bass", "Dubstep", "Electronic", "Emo", "Folk", "Funk", "Glitchcore", "Gospel", "Goth", "Grunge", "Hard Rock", "Heavy Metal", "Hip Hop", "House", "Hyperpop", "Indie", "Industrial", "J-Pop", "J-Rock", "Jazz", "K-Pop", "Latin", "Lofi", "New Wave", "Orchestral", "Phonk", "Pop", "Post-Punk", "Progressive Rock", "Psychedelic Rock", "Punk", "R&B", "Reggae", "Reggaeton", "Rock", "Salsa", "Samba", "Shoegaze", "Ska", "Soul", "Synthwave", "Techno", "Trance", "Trap"];

// App state variables
let isPromptGenerated = false;
let selectedKlugItems = []; // Generic state for selected tags in modals

// === Global Toast Notification (replaces native alert()) ===
function showToast(message, type = 'error', duration = 4500, action) {
    const container = document.getElementById('ssa-toast-container');
    if (!container) { console.warn('Toast container not found:', message); return; }

    const iconSVGs = {
        error: '<svg class="ssa-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg class="ssa-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg class="ssa-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const actionHtml = (action && action.label) ? `<button class="ssa-toast-action">${action.label}</button>` : '';

    const toast = document.createElement('div');
    toast.className = `ssa-toast ssa-toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `${iconSVGs[type] || iconSVGs.error}<span class="ssa-toast-message">${message}</span>${actionHtml}<button class="ssa-toast-close" aria-label="Schlie\u00dfen">\u00d7</button>`;

    container.appendChild(toast);

    // Trigger reflow then animate in
    requestAnimationFrame(() => { toast.classList.add('show'); });

    const dismiss = () => {
        toast.classList.remove('show');
        toast.classList.add('hiding');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        // Fallback removal in case transitionend doesn't fire
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
    };

    // Wire action button if provided
    if (action && action.onClick) {
        const actionBtn = toast.querySelector('.ssa-toast-action');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => { action.onClick(); dismiss(); });
        }
    }

    toast.querySelector('.ssa-toast-close').addEventListener('click', dismiss);
    if (duration > 0) setTimeout(dismiss, duration);
}

// Show inline error inside a specific container element
function showInlineError(containerId, message) {
    const el = document.getElementById(containerId);
    if (!el) { showToast(message, 'error'); return; }
    el.innerHTML = `<svg class="ssa-inline-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>${message}</span>`;
    el.classList.remove('hidden');
}

function hideInlineError(containerId) {
    const el = document.getElementById(containerId);
    if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
}

// === Prompt overwrite with undo toast (#76) ===
// Central helper: captures undo state, sets prompt text, and shows a toast
// with a "Rückgängig" button so the user can revert the change.
function applyPromptWithUndo(newText, toolName) {
    const el = document.getElementById('result-text');
    if (!el) return;
    const hadContent = el.textContent.trim().length > 0;
    if (window.BdUndo && hadContent) {
        window.BdUndo.captureBeforeApply(toolName || 'Tool');
    }
    el.textContent = newText || '';
    // Show undo toast only when previous content was overwritten
    if (hadContent && window.BdUndo) {
        showToast(
            `Prompt überschrieben von „${toolName || 'Tool'}"`,
            'info',
            6000,
            {
                label: 'Rückgängig',
                onClick: function () { window.BdUndo.performUndo(); }
            }
        );
    }
}
