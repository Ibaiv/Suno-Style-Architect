// === FAL.AI API CALL ===
async function callFalAPI(prompt, options = {}) {
    if (!FAL_API_KEY) {
        throw new Error("Bitte konfiguriere zuerst deinen Fal.ai API Key in den Einstellungen.");
    }

    const {
        timeoutMs = 45000,
        retries = 2,
        signal = null
    } = options;

    // Resolve endpoint path from mapping, with smart fallbacks
    const endpointFromMap = (typeof FAL_MODEL_ENDPOINTS !== 'undefined') ? FAL_MODEL_ENDPOINTS[FAL_MODEL] : null;
    const normalized = (v)=> v.replace(/^\/+|\/+$/g,'');
    const base = endpointFromMap || FAL_MODEL;
    const candidates = [];
    const seen = new Set();
    const push = (x)=>{ const n=normalized(x); if(!seen.has(n)){ seen.add(n); candidates.push(n); }};
    push(base);
    if (!/^[-\w]+\//.test(base)) { push(`fal-ai/${base}`); push(`google/${base}`); }
    if (FAL_MODEL === 'imagen4/preview') push('google/imagen-4/preview');
    if (FAL_MODEL === 'flux-pro/kontext') push('fal-ai/flux-pro/kontext');
    if (FAL_MODEL === 'flux-krea-lora/stream') push('fal-ai/flux-krea-lora/stream');

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    let lastErr = null;
    for (const endpoint of candidates) {
        const url = FAL_BASE_URL + endpoint;
        const buildPayloads = (ep) => {
            const sizeA = '1024x1024';
            const sizeB = 'square_hd';
            return [
                { prompt },
                { input: prompt },
                { text: prompt },
                { prompt: { text: prompt } },
                { prompt, num_images: 1 },
                { prompt, image_size: sizeA },
                { prompt, size: sizeB }
            ];
        };
        const payloads = buildPayloads(endpoint);

        // Controller to support timeout and external cancellation per endpoint attempt
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(new Error('Fal.ai timeout')), timeoutMs);
        const onAbort = () => controller.abort(signal?.reason || new Error('Aborted'));
        if (signal) {
            if (signal.aborted) onAbort(); else signal.addEventListener('abort', onAbort, { once: true });
        }

        const doRequest = async (authHeader, body) => fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        let attempt = 0;
        try {
            for (let pIndex = 0; pIndex < payloads.length; pIndex++) {
                const body = payloads[pIndex];
                attempt = 0;
                while (true) {
                    // Try with 'Key' scheme first (fal.ai standard). Fallback to 'Bearer'.
                    let response = await doRequest(`Key ${FAL_API_KEY}`, body);
                    if (response.status === 401 || response.status === 403) {
                        response = await doRequest(`Bearer ${FAL_API_KEY}`, body);
                    }

                    if (!response.ok) {
                        const text = await response.text();
                        const status = response.status;
                        // Retry on transient errors
                        if ([408, 429, 500, 502, 503, 504].includes(status) && attempt < retries) {
                            attempt++;
                            const backoff = Math.min(2000 * attempt, 6000) + Math.random() * 500;
                            await sleep(backoff);
                            continue;
                        }
                        // Try next payload on schema/validation errors
                        if ([400, 422].includes(status) || /did not match|validation|schema/i.test(text)) {
                            // move to next payload shape
                            break;
                        }
                        if (status === 404) {
                            lastErr = new Error(`Fal.ai endpoint not found: ${url} -> ${text}`);
                            throw lastErr; // bubble to try next endpoint
                        }
                        throw new Error(`Fal.ai API request failed (${status}): ${text}`);
                    }

                    const result = await response.json();
                    const imageUrl = (result?.images?.[0]?.url) || (result?.images?.[0]?.image_url) || result?.image?.url || result?.url || result?.output?.[0]?.url;
                    if (imageUrl) return imageUrl;
                    // If no URL, try next payload
                    break;
                }
            }
            // if all payloads failed, fall through to next endpoint
        } catch (err) {
            lastErr = err;
        } finally {
            clearTimeout(timer);
            if (signal) signal.removeEventListener('abort', onAbort);
        }
        // move to next candidate on failure
    }

    throw lastErr || new Error('Fal.ai: Konnte kein Bild generieren.');
}

// === OPENROUTER API CALL ===
async function callOpenRouterAPI(userMessage, systemPrompt, imageUrl = null) {
    if (!API_KEY) {
        throw new Error("Bitte konfiguriere zuerst deinen API Key in den Einstellungen.");
    }

    const userContent = imageUrl
        ? [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        : userMessage;

    const payload = {
        model: SELECTED_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Suno Style Architect'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed (${response.status}): ${errorData}`);
    }

    const result = await response.json();
    
    if (result.choices?.[0]?.message?.content) {
        return result.choices[0].message.content.trim();
    } else if (result.error) {
        throw new Error(`API Error: ${result.error.message || 'Unknown error'}`);
    } else {
        throw new Error('Invalid API response structure.');
    }
}

// === UTILITY FUNCTIONS ===
// Robust copy helper with fallback
async function safeCopyText(text){
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch(e) {
        console.warn('Clipboard API failed, falling back', e);
    }
    // Fallback: hidden textarea + execCommand
    try {
        const ta = document.createElement('textarea');
        ta.value = text || '';
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch(e) {
        console.error('Fallback copy failed', e);
        return false;
    }
}

window.copyResult = async function(){
    const text = (document.getElementById('result-text')?.textContent)||'';
    const ok = await safeCopyText(text);
    if(ok){
        document.dispatchEvent(new CustomEvent('keys:action', { detail: { id:'copy.result', label:'Kopiert', source:'program' }}));
    }
    return ok;
};

function setupCopyButton(button, icon, check, textElement) {
    if (!button || !icon || !check || !textElement) return;
    button.addEventListener('click', async () => {
        const textToCopy = textElement.textContent || '';
        const ok = await safeCopyText(textToCopy);
        if(ok){
            icon.classList.add('hidden');
            check.classList.remove('hidden');
            setTimeout(() => {
                icon.classList.remove('hidden');
                check.classList.add('hidden');
            }, 2000);
        }
    });
}

// Ensure globals are accessible across files regardless of scoping quirks
try {
    if (typeof window !== 'undefined') {
        window.callFalAPI = callFalAPI;
        window.callOpenRouterAPI = callOpenRouterAPI;
        window.safeCopyText = safeCopyText;
        window.setupCopyButton = setupCopyButton;
        window.setKlugToolsState = setKlugToolsState;
    }
} catch (_) {}

function setKlugToolsState(enabled) {
    isPromptGenerated = enabled;
    const allTools = document.querySelectorAll('.klug-btn');
    allTools.forEach(button => {
        button.disabled = !enabled;
        if (!enabled) {
            button.classList.add('opacity-50', 'cursor-not-allowed');
            button.classList.remove('hover:bg-neutral-700');
        } else {
            button.classList.remove('opacity-50', 'cursor-not-allowed');
            button.classList.add('hover:bg-neutral-700');
        }
    });
    
    // Show/hide notice messages
    const expertNotice = document.getElementById('expert-disabled-notice');
    const klugNotice = document.getElementById('klug-disabled-notice');
    const labNotice = document.getElementById('lab-disabled-notice');
    if (expertNotice) {
        expertNotice.style.display = enabled ? 'none' : 'block';
    }
    if (klugNotice) {
        klugNotice.style.display = enabled ? 'none' : 'block';
    }
    if (labNotice) {
        labNotice.style.display = enabled ? 'none' : 'block';
    }
}

// Modal setup function
function setupModal(modal, openButton) {
    if (!modal) return { open: () => {}, close: () => {} };
    const closeButtons = modal.querySelectorAll('.close-modal-button');
    const open = () => {
        if (!isPromptGenerated && modal.id !== 'idea-modal') {
            console.log('Tools are disabled - generate a prompt first!');
            return;
        }
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        modal.classList.remove('modal-leave-to');
        modal.classList.add('modal-enter-to');
        document.dispatchEvent(new CustomEvent('modal:open', { detail: { id: modal.id } }));
    };
    const close = () => {
        modal.classList.remove('modal-enter-to');
        modal.classList.add('modal-leave-to');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            document.dispatchEvent(new CustomEvent('modal:close', { detail: { id: modal.id } }));
        }, 200);
    };
    if(openButton) openButton.addEventListener('click', open);
    closeButtons.forEach(btn => btn.addEventListener('click', close));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    return { open, close };
}
