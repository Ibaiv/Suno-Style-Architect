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
