// === FAL.AI API CALL ===
async function callFalAPI(prompt, options = {}) {
    if (!FAL_API_KEY) {
        throw new Error("Bitte konfiguriere zuerst deinen Fal.ai API Key in den Einstellungen.");
    }

    const {
        timeoutMs = 120000, // Increased default timeout to 120s for slower models
        retries = 2,
        signal = null
    } = options;

    // Resolve endpoint path from mapping, with smart fallbacks
    const endpointFromMap = (typeof FAL_MODEL_ENDPOINTS !== 'undefined') ? FAL_MODEL_ENDPOINTS[FAL_MODEL] : null;
    const normalized = (v) => v.replace(/^\/+|\/+$/g, '');
    const base = endpointFromMap || FAL_MODEL;
    const candidates = [];
    const seen = new Set();
    const push = (x) => { const n = normalized(x); if (!seen.has(n)) { seen.add(n); candidates.push(n); } };
    push(base);
    if (!/^[-\w]+\//.test(base)) { push(`fal-ai/${base}`); push(`google/${base}`); }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    let lastErr = null;
    for (const endpoint of candidates) {
        const url = FAL_BASE_URL + endpoint;
        const buildPayloads = (ep) => {
            // Nano Banana Pro payload (Standard)
            const nanoBananaPayload = {
                prompt,
                num_images: 1,
                aspect_ratio: '16:9', // Defaulting to wide for better presentation
                output_format: 'png'
            };

            // Nano Banana 2 payload (4x faster, supports resolution & web search)
            const nanoBanana2Payload = {
                prompt,
                num_images: 1,
                aspect_ratio: '16:9',
                output_format: 'png',
                resolution: '1K'
            };

            // Recraft V3 payload
            const recraftPayload = {
                prompt,
                image_size: 'landscape_16_9',
                style: 'digital_illustration', // Default style
                colors: []
            };

            // FLUX Pro Context payload (image-to-image, requires image_url)
            const fluxKontextPayload = {
                prompt,
                guidance_scale: 3.5,
                safety_tolerance: "2",
                aspect_ratio: '16:9',
                num_images: 1,
                output_format: 'jpeg'
            };

            // FLUX Pro text-to-image payload
            const fluxProPayload = {
                prompt,
                image_size: 'landscape_16_9',
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
                safety_tolerance: "2",
                output_format: 'jpeg'
            };

            // GPT-Image 1.5 payload
            const gptImagePayload = {
                prompt,
                image_size: '1536x1024', // 3:2 landscape
                quality: 'high',
                num_images: 1,
                output_format: 'png'
            };

            // FLUX.1 [dev] specific payload format
            const fluxPayload = {
                prompt,
                image_size: { width: 1024, height: 1024 },
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
                enable_safety_checker: false
            };

            // Select payload based on model
            if (FAL_MODEL === 'fal-ai/nano-banana-pro') return [nanoBananaPayload];
            if (FAL_MODEL === 'fal-ai/nano-banana-2') return [nanoBanana2Payload];
            if (FAL_MODEL === 'fal-ai/recraft/v3/text-to-image') return [recraftPayload];
            if (FAL_MODEL === 'fal-ai/flux-pro') return [fluxProPayload];
            if (FAL_MODEL === 'fal-ai/flux-pro/kontext') return [fluxKontextPayload];
            if (FAL_MODEL === 'fal-ai/gpt-image-1.5') return [gptImagePayload];
            if (FAL_MODEL === 'fal-ai/flux/dev') return [fluxPayload];

            // Fallbacks for unknown models
            return [
                { prompt, num_images: 1 },
                { prompt }
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
        stream: false,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
    };

    // Timeout after 60 seconds to prevent infinite hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort(new Error('API Timeout: Die Anfrage hat zu lange gedauert (60s). Bitte versuche es erneut.'));
    }, 60000);

    console.log('[SSA] API Request:', { model: SELECTED_MODEL, url: API_URL, messageLength: userMessage.length });

    let response;
    try {
        response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Suno Style Architect'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
    } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError' || fetchErr.message?.includes('Timeout')) {
            throw new Error('API Timeout: Die Anfrage hat zu lange gedauert. Bitte prüfe deine Internetverbindung und versuche es erneut.');
        }
        throw new Error(`Netzwerkfehler: ${fetchErr.message}`);
    }

    clearTimeout(timeoutId);

    console.log('[SSA] API Response status:', response.status);

    if (!response.ok) {
        const errorData = await response.text();
        console.error('[SSA] API Error:', response.status, errorData);
        throw new Error(`API request failed (${response.status}): ${errorData}`);
    }

    // Read response as text first, then parse - avoids hanging on malformed/streamed responses
    const responseText = await response.text();
    console.log('[SSA] API Response length:', responseText.length);

    let result;
    try {
        result = JSON.parse(responseText);
    } catch (parseErr) {
        console.error('[SSA] Failed to parse API response:', responseText.substring(0, 500));
        throw new Error('API-Antwort konnte nicht verarbeitet werden. Möglicherweise ein Server-Problem.');
    }

    if (result.choices?.[0]?.message?.content) {
        return result.choices[0].message.content.trim();
    } else if (result.error) {
        throw new Error(`API Error: ${result.error.message || 'Unknown error'}`);
    } else {
        console.error('[SSA] Unexpected API response structure:', JSON.stringify(result).substring(0, 500));
        throw new Error('Invalid API response structure.');
    }
}

// === UTILITY FUNCTIONS ===
// Robust copy helper with fallback
async function safeCopyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (e) {
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
    } catch (e) {
        console.error('Fallback copy failed', e);
        return false;
    }
}

window.copyResult = async function () {
    const text = (document.getElementById('result-text')?.textContent) || '';
    const ok = await safeCopyText(text);
    if (ok) {
        document.dispatchEvent(new CustomEvent('keys:action', { detail: { id: 'copy.result', label: 'Kopiert', source: 'program' } }));
    }
    return ok;
};

function setupCopyButton(button, icon, check, textElement) {
    if (!button || !icon || !check || !textElement) return;
    button.addEventListener('click', async () => {
        const textToCopy = textElement.textContent || '';
        const ok = await safeCopyText(textToCopy);
        if (ok) {
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
} catch (_) { }

function setKlugToolsState(enabled) {
    isPromptGenerated = enabled;
    const allTools = document.querySelectorAll('.klug-btn');

    // Toggle button states
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

    // Toggle container visual states
    const containers = [
        document.getElementById('expert-container'),
        document.getElementById('klug-container'),
        document.getElementById('lab-container')
    ];

    containers.forEach(container => {
        if (container) {
            if (enabled) {
                container.classList.remove('inactive-box');
                container.classList.add('active-box');
            } else {
                container.classList.remove('active-box');
                container.classList.add('inactive-box');
            }
        }
    });

    // Toggle bottom dashboard visual state
    var bd = document.querySelector('.bottom-dashboard');
    if (bd) {
        bd.classList.toggle('bd-tools-inactive', !enabled);
    }
}

// Modal setup function (Phase 3: scope integration via openWithScope)
function setupModal(modal, openButton) {
    if (!modal) return { open: () => { }, close: () => { } };
    const closeButtons = modal.querySelectorAll('.close-modal-button');
    const open = () => {
        // Allow idea-modal and style-sync-modal to open without a generated prompt
        if (!isPromptGenerated && modal.id !== 'idea-modal' && modal.id !== 'style-sync-modal') {
            console.log('Tools are disabled - generate a prompt first!');
            return;
        }
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        modal.classList.remove('modal-leave-to');
        modal.classList.add('modal-enter-to');
        // Phase 3 (P3-3): Linked push — CloseStack + ScopeStack together
        if(window.ScopeStack && window.ScopeStack.openWithScope){
            modal._scopeBinding = ScopeStack.openWithScope(close, 'modal', 'modal-' + modal.id);
        } else {
            if(window.CloseStack) CloseStack.push(close, { id: 'modal-' + modal.id });
        }
        document.dispatchEvent(new CustomEvent('modal:open', { detail: { id: modal.id } }));
    };
    const close = () => {
        // Clean up scope + CloseStack when called directly (not via Escape)
        if(modal._scopeBinding){
            // Pop the CloseStack ghost entry (removes without calling linked closeFn)
            if(window.CloseStack) CloseStack.pop(modal._scopeBinding.closeId);
            // Pop the ScopeStack token
            if(window.ScopeStack) ScopeStack.pop(modal._scopeBinding.scopeToken);
            modal._scopeBinding = null;
        } else {
            if(window.CloseStack) CloseStack.pop('modal-' + modal.id);
        }
        modal.classList.remove('modal-enter-to');
        modal.classList.add('modal-leave-to');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            document.dispatchEvent(new CustomEvent('modal:close', { detail: { id: modal.id } }));
        }, 200);
    };
    if (openButton) openButton.addEventListener('click', open);
    closeButtons.forEach(btn => btn.addEventListener('click', close));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    return { open, close };
}
