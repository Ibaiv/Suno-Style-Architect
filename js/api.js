// === OPENROUTER API CALL ===
async function callOpenRouterAPI(userMessage, systemPrompt) {
    if (!API_KEY) {
        throw new Error("Bitte konfiguriere zuerst deinen API Key in den Einstellungen.");
    }

    const payload = {
        model: SELECTED_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
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

async function callOpenRouterVision({ systemPrompt, userPrompt, imageBase64, imageMime, responseFormat, temperature = 0.2, maxTokens = 900 }) {
    if (!API_KEY) {
        throw new Error("Bitte konfiguriere zuerst deinen API Key in den Einstellungen.");
    }
    if (!imageBase64) {
        throw new Error('Kein Bild verfügbar.');
    }

    const userContent = [];
    if (userPrompt) {
        userContent.push({ type: 'input_text', text: userPrompt });
    }
    userContent.push({ type: 'input_image', image_base64: imageBase64, mime_type: imageMime || 'image/png' });

    const payload = {
        model: SELECTED_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ],
        temperature,
        max_tokens: maxTokens
    };

    if (responseFormat) {
        payload.response_format = responseFormat;
    }

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
        throw new Error(`Vision request failed (${response.status}): ${errorData}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
        return content.trim();
    }
    if (Array.isArray(content)) {
        const textPart = content.find(part => part.type === 'output_text');
        if (textPart?.text) {
            return textPart.text.trim();
        }
    }
    if (result.error) {
        throw new Error(result.error.message || 'Unbekannter Vision-Fehler.');
    }
    throw new Error('Ungültige Vision-Antwort.');
}

function getMimeFromDataUrl(dataUrl) {
    if (!dataUrl?.startsWith('data:')) return null;
    return dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
}

async function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Konnte Datei nicht lesen.'));
        reader.readAsDataURL(file);
    });
}

async function downscaleImage(dataUrl, maxDimension = 1024) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            if (width <= maxDimension && height <= maxDimension) {
                return resolve(dataUrl);
            }
            const scale = Math.min(maxDimension / width, maxDimension / height);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL(getMimeFromDataUrl(dataUrl) || 'image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'));
        img.src = dataUrl;
    });
}

async function prepareImageForVision(file) {
    const dataUrl = await readFileAsDataURL(file);
    const optimized = await downscaleImage(dataUrl, MAX_IMAGE_DIMENSION || 1024);
    const base64 = optimized.split(',')[1];
    const mime = getMimeFromDataUrl(optimized) || file.type || 'image/jpeg';
    return { dataUrl: optimized, base64, mime };
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
    if (expertNotice) {
        expertNotice.style.display = enabled ? 'none' : 'block';
    }
    if (klugNotice) {
        klugNotice.style.display = enabled ? 'none' : 'block';
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
