// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeAdvancedFeatures();
});

// Re-initialize after modals are injected, if needed
document.addEventListener('modals:ready', () => {
    initializeAdvancedFeatures();
});

function initializeAdvancedFeatures() {
    // Setup all modals
    setupIdeaSpark();
    setupExpertRefinements();
    setupKlugTools();
    setupVisualEngine();
    setupFutureLabTools();
    setupCustomInstruction();
    setupGenreEvolution();
    setupStyleSync();
    setupKlangStudio();
}

// === IDEA SPARK LOGIC ===
function setupIdeaSpark() {
    const ideaModal = document.getElementById('idea-modal');
    const sparkIdeaButton = document.getElementById('spark-idea-button');
    const keywordInput = document.getElementById('keyword-input');
    const generateIdeasButton = document.getElementById('generate-ideas-button');
    const ideasOutput = document.getElementById('ideas-output');
    const ideaLoader = document.getElementById('idea-loader');
    const ideaButtonText = document.getElementById('idea-button-text');

    if (!ideaModal) return;

    const ideaModalLogic = setupModal(ideaModal, sparkIdeaButton);

    const setIdeaLoading = (isLoading) => {
        generateIdeasButton.disabled = isLoading;
        ideaButtonText.classList.toggle('hidden', isLoading);
        ideaLoader.classList.toggle('hidden', !isLoading);
    };

    const generateIdeas = async () => {
        const keyword = keywordInput.value.trim();
        if (!keyword) {
            ideasOutput.innerHTML = `<p class="text-red-400">Bitte gib ein Stichwort ein.</p>`;
            return;
        }
        setIdeaLoading(true);
        ideasOutput.innerHTML = '';
        try {
            const response = await callOpenRouterAPI(keyword, IDEA_SPARK_PROMPT);
            const ideas = response.split('---').filter(idea => idea.trim() !== '');
            ideasOutput.innerHTML = '';
            ideas.forEach(ideaText => {
                const ideaElement = document.createElement('div');
                ideaElement.className = 'p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors';
                ideaElement.textContent = ideaText.trim();
                ideaElement.onclick = () => {
                    document.getElementById('idea-input').value = ideaText.trim();
                    ideaModalLogic.close();
                };
                ideasOutput.appendChild(ideaElement);
            });
        } catch (error) {
            console.error("Error generating ideas:", error);
            ideasOutput.innerHTML = `<p class="text-red-400">Ein Fehler ist aufgetreten: ${error.message}</p>`;
        } finally {
            setIdeaLoading(false);
        }
    };

    generateIdeasButton.addEventListener('click', generateIdeas);
    keywordInput.addEventListener('keydown', (e) => e.key === 'Enter' && (e.preventDefault(), generateIdeas()));
}

// === EXPERT REFINEMENT LOGIC ===
function setupExpertRefinements() {
    const experts = [
        { type: 'producer', prompt: PRODUCER_REFINER_PROMPT },
        { type: 'musician', prompt: MUSICIAN_REFINER_PROMPT },
        { type: 'composer', prompt: FILM_COMPOSER_REFINER_PROMPT },
        { type: 'dj', prompt: DJ_REMIXER_REFINER_PROMPT },
        { type: 'avantgarde', prompt: AVANTGARDE_REFINER_PROMPT },
        { type: 'minimalist', prompt: MINIMALIST_REFINER_PROMPT },
        { type: 'vocal-harmony', prompt: VOCAL_HARMONY_REFINER_PROMPT },
        { type: 'ethno', prompt: ETHNO_REFINER_PROMPT }
    ];

    experts.forEach(expert => {
        setupExpertRefinement(expert.type, expert.prompt);
    });

    // Setup sound engineer separately as it has different UI
    setupSoundEngineer();
}

function setupExpertRefinement(type, systemPrompt) {
    const modal = document.getElementById(`${type}-modal`);
    const openButton = document.getElementById(`${type}-refine-button`);
    const slider = document.getElementById(`${type}-slider`);
    const applyButton = document.getElementById(`apply-${type}-button`);
    const buttonText = document.getElementById(`apply-${type}-text`);
    const loader = document.getElementById(`apply-${type}-loader`);

    if (!modal || !openButton || !applyButton) return;

    const modalLogic = setupModal(modal, openButton);

    applyButton.addEventListener('click', async () => {
        const influence = slider.value;
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) return;

        applyButton.disabled = true;
        buttonText.classList.add('hidden');
        loader.classList.remove('hidden');

        const userQuery = `Prompt: "${currentPrompt}"\nInfluence Level: ${influence}`;
        try {
            const refined = await callOpenRouterAPI(userQuery, systemPrompt);
            document.getElementById('result-text').textContent = refined;
            if (window.QW) { window.QW.onPromptUpdated({ source: `expert:${type}` }); }
            modalLogic.close();
        } catch (error) {
            console.error(`Error refining with ${type}:`, error);
            buttonText.textContent = "Fehler";
            setTimeout(() => { buttonText.textContent = "Anwenden"; }, 2000);
        } finally {
            applyButton.disabled = false;
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });
}

function setupSoundEngineer() {
    const modal = document.getElementById('sound-engineer-modal');
    const openButton = document.getElementById('sound-engineer-button');
    const applyButton = document.getElementById('apply-sound-engineer-button');
    const buttonText = document.getElementById('apply-sound-engineer-text');
    const loader = document.getElementById('apply-sound-engineer-loader');

    if (!modal || !openButton || !applyButton) return;

    const modalLogic = setupModal(modal, openButton);

    applyButton.addEventListener('click', async () => {
        const instructions = Array.from(modal.querySelectorAll('.sound-engineer-input'))
            .map(input => input.value.trim())
            .filter(Boolean);

        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (instructions.length === 0 || !currentPrompt) return;

        applyButton.disabled = true;
        buttonText.classList.add('hidden');
        loader.classList.remove('hidden');

        let userQuery = `Base prompt: "${currentPrompt}"\n\nIncorporate the following specific instructions:\n`;
        instructions.forEach((inst, index) => {
            userQuery += `${index + 1}. ${inst}\n`;
        });

        try {
            const refined = await callOpenRouterAPI(userQuery, SOUND_ENGINEER_PROMPT);
            document.getElementById('result-text').textContent = refined;
            if (window.QW) { window.QW.onPromptUpdated({ source: 'sound-engineer' }); }
            modalLogic.close();
        } catch (error) {
            console.error('Error with sound engineer instruction:', error);
        } finally {
            applyButton.disabled = false;
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });
}

// === KLUG TOOLS LOGIC ===
function setupKlugTools() {
    setupSynthDesignerLab();
    setupGenreMixer();
    setupHookGenerator();
    setupSongStructure();
    setupVibeEnhancer();
    setupArtistSuggester();
    setupTempoFinder();

    // Setup tagger tools
    const taggerTools = [
        { id: 'mood-analyzer', prompt: MOOD_ANALYZER_PROMPT },
        { id: 'production-finish', prompt: PRODUCTION_FINISH_PROMPT },
        { id: 'vocal-stylist', prompt: VOCAL_STYLIST_PROMPT },
        { id: 'groove-meister', prompt: GROOVE_MEISTER_PROMPT },
        { id: 'performance-coach', prompt: PERFORMANCE_COACH_PROMPT },
        { id: 'effect-chain', prompt: EFFECT_CHAIN_PROMPT }
    ];

    taggerTools.forEach(tool => {
        setupKlugTagger(tool.id, tool.prompt);
    });
}

function getSynthBrightnessInfo(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return { label: 'Ausgewogen & klar', phrase: 'balanced, clear brightness' };
    }
    if (numeric <= 20) {
        return { label: 'Sehr gedämpft', phrase: 'muted, subtle brightness' };
    }
    if (numeric <= 40) {
        return { label: 'Warm & weich', phrase: 'warm, rounded brightness' };
    }
    if (numeric <= 60) {
        return { label: 'Ausgewogen & klar', phrase: 'balanced, clear brightness' };
    }
    if (numeric <= 80) {
        return { label: 'Leuchtend', phrase: 'bright, lively brightness' };
    }
    return { label: 'Aggressiv & scharf', phrase: 'razor-bright, aggressive brightness' };
}

function appendPromptSentence(base, addition) {
    const trimmedAddition = (addition || '').trim();
    if (!trimmedAddition) {
        return (base || '').trim();
    }
    const trimmedBase = (base || '').trim();
    if (!trimmedBase) {
        return trimmedAddition;
    }
    const needsSpace = /[.!?…]$/.test(trimmedBase) || trimmedBase.endsWith(')');
    const separator = needsSpace ? ' ' : trimmedBase.endsWith(',') ? ' ' : ', ';
    return `${trimmedBase}${separator}${trimmedAddition}`;
}

function setupSynthDesignerLab() {
    const modal = document.getElementById('synth-designer-modal');
    const openButton = document.getElementById('synth-designer-button');
    const form = modal?.querySelector('#synth-designer-form');
    const slider = modal?.querySelector('#synth-filter-slider');
    const sliderValueEl = modal?.querySelector('#synth-filter-value');
    const applyButton = modal?.querySelector('#add-synth-button');
    const buttonText = modal?.querySelector('#add-synth-button-text');
    const loader = modal?.querySelector('#add-synth-loader');
    const errorEl = modal?.querySelector('#synth-designer-error');

    if (!modal || !openButton || !form || !applyButton) return;
    if (modal.dataset.synthDesignerInitialized === 'true') return;
    modal.dataset.synthDesignerInitialized = 'true';

    const modalLogic = setupModal(modal, openButton);

    const setSliderLabel = (value) => {
        const info = getSynthBrightnessInfo(value);
        if (sliderValueEl) {
            sliderValueEl.textContent = info.label;
        }
        // Update track background visualization
        if (slider) {
            const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.setProperty('--range-progress', `${percent}%`);
        }
        return info;
    };

    const resetForm = () => {
        form.reset();
        if (slider) {
            slider.value = '50';
            slider.style.setProperty('--range-progress', '50%');
        }
        setSliderLabel(slider ? slider.value : 50);
        if (errorEl) {
            errorEl.textContent = '';
        }
    };

    openButton.addEventListener('click', resetForm);
    document.addEventListener('modal:open', (event) => {
        if (event.detail?.id === 'synth-designer-modal') {
            resetForm();
        }
    });

    slider?.addEventListener('input', (event) => {
        setSliderLabel(event.target.value);
    });

    applyButton.addEventListener('click', async () => {
        if (errorEl) {
            errorEl.textContent = '';
        }

        const resultTextEl = document.getElementById('result-text');
        const basePrompt = resultTextEl?.textContent || '';
        const trimmedPrompt = basePrompt.trim();
        if (!trimmedPrompt) {
            if (errorEl) {
                errorEl.textContent = 'Bitte generiere zuerst einen Prompt oder füge Text in das Meisterstück ein.';
            }
            return;
        }

        const role = form.querySelector('input[name="synth-role"]:checked')?.value;
        const core = form.querySelector('input[name="synth-core"]:checked')?.value;
        const envelope = form.querySelector('input[name="synth-envelope"]:checked')?.value;
        const brightnessInfo = getSynthBrightnessInfo(slider ? slider.value : 50);
        const effects = Array.from(form.querySelectorAll('input[name="synth-effects"]:checked')).map(el => el.value);

        if (!role || !core || !envelope) {
            if (errorEl) {
                errorEl.textContent = 'Bitte triff in den Schritten 1, 2 und 4 jeweils eine Auswahl.';
            }
            return;
        }

        applyButton.disabled = true;
        buttonText?.classList.add('hidden');
        loader?.classList.remove('hidden');

        const userQuery = `Base Prompt: "${trimmedPrompt}"

Sound Design Choices:
- Instrument Role: ${role}
- Core Character: ${core}
- Filter Brightness: ${brightnessInfo.phrase} (value ${slider ? slider.value : 50}/100)
- Envelope Shape: ${envelope}
- Effects: ${effects.length ? effects.join(', ') : 'None'}`;

        try {
            const translated = await callOpenRouterAPI(userQuery, SYNTH_DESIGN_TRANSLATOR_PROMPT);
            const updatedPrompt = appendPromptSentence(trimmedPrompt, translated);
            if (resultTextEl) {
                resultTextEl.textContent = updatedPrompt;
            }
            if (window.QW) {
                window.QW.onPromptUpdated({ source: 'klug:synth-designer' });
            }
            modalLogic.close();
        } catch (error) {
            console.error('Synth Designer translation failed', error);
            if (errorEl) {
                errorEl.textContent = `Fehler: ${error.message || 'Die Übersetzung ist fehlgeschlagen.'}`;
            }
        } finally {
            applyButton.disabled = false;
            buttonText?.classList.remove('hidden');
            loader?.classList.add('hidden');
        }
    });
}

// === VISUAL INSPIRATION ENGINE ===
function setupVisualEngine() {
    const modal = document.getElementById('visual-engine-modal');
    const openButton = document.getElementById('visual-engine-button');
    const input = document.getElementById('image-prompt-input');
    const generateButton = document.getElementById('generate-image-button');
    const generateText = document.getElementById('generate-image-text');
    const generateLoader = document.getElementById('generate-image-loader');
    const output = document.getElementById('visual-engine-output');
    const analyzeButton = document.getElementById('analyze-image-button');
    const analyzeText = document.getElementById('analyze-image-text');
    const analyzeLoader = document.getElementById('analyze-image-loader');

    if (!modal || !openButton || !input || !generateButton || !output || !analyzeButton) return;

    // Prevent double initialization
    if (modal.dataset.initialized === 'true') return;
    modal.dataset.initialized = 'true';

    // Block opening when Fal key is missing
    openButton.addEventListener('click', (e) => {
        if (!FAL_API_KEY) {
            e.preventDefault(); e.stopPropagation();
            alert('Bitte hinterlege zuerst einen gültigen Fal.ai API Key unter Einstellungen.');
            if (typeof showSettings === 'function') showSettings();
        }
    }, { capture: true });

    const modalLogic = setupModal(modal, openButton);
    let generatedImageUrl = null;
    let genReqId = 0;
    let anaReqId = 0;

    const resetUI = () => {
        generatedImageUrl = null;
        analyzeButton.classList.add('hidden');
        output.innerHTML = `<p class="text-neutral-500 text-sm">Bild wird hier angezeigt...</p>`;
        input.value = input.value || '';
    };

    // Reset UI whenever modal opens
    document.addEventListener('modal:open', (ev) => {
        if (ev.detail?.id === 'visual-engine-modal') resetUI();
    });

    const setGenLoading = (isLoading) => {
        generateButton.disabled = isLoading;
        generateText?.classList.toggle('hidden', isLoading);
        generateLoader?.classList.toggle('hidden', !isLoading);
    };
    const setAnalyzeLoading = (isLoading) => {
        analyzeButton.disabled = isLoading;
        analyzeText?.classList.toggle('hidden', isLoading);
        analyzeLoader?.classList.toggle('hidden', !isLoading);
    };

    const withTimeout = (p, ms, label = 'Request') => Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout nach ${ms}ms`)), ms))
    ]);

    generateButton.addEventListener('click', async () => {
        const prompt = input.value.trim();
        if (!prompt) {
            output.innerHTML = `<p class="text-amber-300 text-sm">Bitte gib eine Beschreibung ein.</p>`;
            return;
        }
        setGenLoading(true);
        const myId = ++genReqId;
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400"></div>`;
        analyzeButton.classList.add('hidden');
        try {
            // Use default timeout (120s) from api.js to support slower models like Nano Banana Pro
            const url = await callFalAPI(prompt, { retries: 2 });
            if (myId !== genReqId) return; // stale
            // Preload image
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
            });
            generatedImageUrl = url;
            output.innerHTML = `<img src="${url}" alt="Generiertes Bild" class="rounded-lg w-full h-auto">`;
            analyzeButton.classList.remove('hidden');
        } catch (error) {
            console.error('Fal.ai error', error);
            output.innerHTML = `<p class="text-red-400 text-sm">Fehler beim Generieren des Bildes: ${error.message}</p>`;
        } finally {
            setGenLoading(false);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateButton.click(); }
    });

    analyzeButton.addEventListener('click', async () => {
        if (!generatedImageUrl) return;
        if (!API_KEY) {
            alert('Bitte konfiguriere zuerst deinen OpenRouter API Key in den Einstellungen.');
            if (typeof showSettings === 'function') showSettings();
            return;
        }
        const prompt = input.value.trim();
        setAnalyzeLoading(true);
        const myId = ++anaReqId;
        try {
            const userMessage = `Image prompt used to generate the picture:\n${prompt}`;
            const generatedText = await withTimeout(
                callOpenRouterAPI(userMessage, VISUAL_ANALYZER_PROMPT, generatedImageUrl),
                60000,
                'Analyse'
            );
            if (myId !== anaReqId) return; // stale
            const resultText = document.getElementById('result-text');
            const initialState = document.getElementById('initial-state');
            const resultContainer = document.getElementById('result-container');
            if (resultText) resultText.textContent = generatedText;
            if (initialState) initialState.classList.add('hidden');
            if (resultContainer) {
                resultContainer.classList.remove('hidden');
                resultContainer.classList.add('fade-in');
            }
            setKlugToolsState(true);
            if (window.QW) { window.QW.onPromptUpdated({ source: 'klug:visual-engine' }); }
            modalLogic.close();
        } catch (error) {
            console.error('Visual analysis failed', error);
            output.innerHTML = `<p class="text-red-400 text-sm">Fehler bei der Bildanalyse: ${error.message}</p>` + output.innerHTML;
        } finally {
            setAnalyzeLoading(false);
        }
    });
}

// === FUTURE LAB LOGIC ===
function setupFutureLabTools() {
    setupAdaptiveFlow();
    setupAiCollaboration();
    setupStoryArcDesigner();
    setupImmersiveSpace();
    setupHumanTouch();
    setupReleaseForecast();
}

function setupAdaptiveFlow() {
    const modal = document.getElementById('adaptive-flow-modal');
    const openButton = document.getElementById('adaptive-flow-button');
    const slider = modal?.querySelector('#adaptive-flow-slider');
    const levelBadge = modal?.querySelector('#adaptive-flow-level');
    const runButton = modal?.querySelector('#run-adaptive-flow-button');
    const buttonText = modal?.querySelector('#run-adaptive-flow-text');
    const loader = modal?.querySelector('#adaptive-flow-loader');
    const output = modal?.querySelector('#adaptive-flow-output');

    if (!modal || !openButton || !runButton || !slider || !levelBadge || !output) return;

    const modalLogic = setupModal(modal, openButton);

    slider.addEventListener('input', () => {
        levelBadge.textContent = slider.value;
    });

    openButton.addEventListener('click', () => {
        slider.value = '65';
        levelBadge.textContent = '65';
        output.innerHTML = `<p class="text-neutral-500 text-sm">Passe die Intensität an und forme den Flow deines Prompts neu.</p>`;
    });

    runButton.addEventListener('click', async () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) {
            output.innerHTML = `<p class="text-red-400">Bitte generiere zuerst einen Prompt.</p>`;
            return;
        }

        runButton.disabled = true;
        buttonText.classList.add('hidden');
        loader.classList.remove('hidden');
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;

        const userQuery = `Base prompt: "${currentPrompt}"\nDynamic intensity (0-100): ${slider.value}`;

        try {
            const response = await callOpenRouterAPI(userQuery, ADAPTIVE_FLOW_PROMPT);
            const [promptBlock, notesBlock] = response.split('---').map(section => section.trim());
            const cleanPrompt = promptBlock.replace(/^PROMPT:\s*/i, '').trim();
            const notes = (notesBlock || '').replace(/^FLOW NOTES:\s*/i, '').split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

            output.innerHTML = `
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 class="text-sm font-semibold text-neutral-300 mb-2">Aktueller Prompt</h3>
                        <pre class="whitespace-pre-wrap text-xs md:text-sm text-neutral-400 bg-neutral-900/70 border border-neutral-700 rounded-xl p-3">${currentPrompt}</pre>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-neutral-300 mb-2">Neuer Flow</h3>
                        <pre class="whitespace-pre-wrap text-xs md:text-sm text-neutral-200 bg-neutral-900/70 border border-blue-500/40 rounded-xl p-3" id="adaptive-flow-result">${cleanPrompt}</pre>
                        <button id="apply-adaptive-flow-button" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Flow übernehmen</button>
                    </div>
                </div>
                <div class="mt-4">
                    <h4 class="text-sm font-semibold text-neutral-300 mb-2">Flow-Notizen</h4>
                    <ul class="text-xs md:text-sm text-neutral-400 space-y-1">
                        ${notes.map(note => `<li class="flex gap-2"><span class="text-blue-400">•</span><span>${note}</span></li>`).join('')}
                    </ul>
                </div>
            `;

            const applyButton = output.querySelector('#apply-adaptive-flow-button');
            applyButton?.addEventListener('click', () => {
                document.getElementById('result-text').textContent = cleanPrompt;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'future-lab:adaptive-flow' }); }
                modalLogic.close();
            });
        } catch (error) {
            console.error('Adaptive Flow failed', error);
            output.innerHTML = `<p class="text-red-400">Fehler beim Berechnen des Flows: ${error.message}</p>`;
        } finally {
            runButton.disabled = false;
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });
}

function setupAiCollaboration() {
    const modal = document.getElementById('ai-collab-modal');
    const openButton = document.getElementById('ai-collab-button');
    const personasContainer = modal?.querySelector('#ai-collab-personas');
    const generateButton = modal?.querySelector('#generate-ai-collab-button');
    const buttonText = modal?.querySelector('#generate-ai-collab-text');
    const loader = modal?.querySelector('#ai-collab-loader');
    const output = modal?.querySelector('#ai-collab-output');

    if (!modal || !openButton || !personasContainer || !generateButton || !output) return;

    const modalLogic = setupModal(modal, openButton);
    const personas = [
        { id: 'visionary', label: 'Visionärer Komponist', detail: 'erzählerische Themen & modulare Harmonien' },
        { id: 'beat-architect', label: 'Beat-Architekt', detail: 'rhythmische Layer & Sidechain-Drive' },
        { id: 'texturalist', label: 'Textur-Alchemist', detail: 'granulare Atmosphären & Motion FX' },
        { id: 'vocal-director', label: 'Vocal Director', detail: 'Toplines, Harmonien & Call/Response' },
        { id: 'mix-navigator', label: 'Mix Navigator', detail: 'Automation, Panorama & Stem-Balance' }
    ];
    let selected = new Set();

    const renderPersonas = () => {
        personasContainer.innerHTML = '';
        personas.forEach(persona => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'text-left bg-neutral-900/60 border border-neutral-700 rounded-xl p-3 hover:border-blue-500/60 transition-colors';
            button.innerHTML = `<div class="text-sm font-semibold text-neutral-200">${persona.label}</div><div class="text-xs text-neutral-400 mt-1">${persona.detail}</div>`;
            button.addEventListener('click', () => {
                if (selected.has(persona.id)) {
                    selected.delete(persona.id);
                    button.classList.remove('border-blue-500/60', 'bg-blue-600/20');
                } else {
                    selected.add(persona.id);
                    button.classList.add('border-blue-500/60', 'bg-blue-600/20');
                }
            });
            personasContainer.appendChild(button);
        });
    };

    openButton.addEventListener('click', () => {
        selected = new Set();
        renderPersonas();
        output.innerHTML = `<p class="text-neutral-500 text-sm">Wähle 2-3 Personas aus, um einen kooperativen Prompt zu formen.</p>`;
    });

    generateButton.addEventListener('click', async () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) {
            output.innerHTML = `<p class="text-red-400">Bitte generiere zuerst einen Prompt.</p>`;
            return;
        }

        const picks = personas.filter(p => selected.has(p.id));
        if (picks.length === 0) {
            output.innerHTML = `<p class="text-amber-300">Wähle mindestens eine Persona aus.</p>`;
            return;
        }

        generateButton.disabled = true;
        buttonText?.classList.add('hidden');
        loader?.classList.remove('hidden');
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;

        const personaSummary = picks.map(p => `${p.label} (${p.detail})`).join('; ');
        const userQuery = `Base prompt: "${currentPrompt}"\nPersonas: ${personaSummary}`;

        try {
            const response = await callOpenRouterAPI(userQuery, AI_COLLAB_PROMPT);
            const [promptBlock, notesBlock] = response.split('---').map(section => section.trim());
            const cleanPrompt = promptBlock.replace(/^PROMPT:\s*/i, '').trim();
            const notes = (notesBlock || '').replace(/^INTERPLAY NOTES:\s*/i, '').split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

            output.innerHTML = `
                <div class="space-y-4">
                    <div class="bg-neutral-900/70 border border-blue-500/30 rounded-xl p-4">
                        <h3 class="text-sm font-semibold text-neutral-200 mb-2">Kooperativer Prompt</h3>
                        <pre class="whitespace-pre-wrap text-xs md:text-sm text-neutral-100" id="ai-collab-result">${cleanPrompt}</pre>
                        <button id="apply-ai-collab-button" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Prompt übernehmen</button>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-neutral-300 mb-2">Interplay-Ideen</h4>
                        <ul class="text-xs md:text-sm text-neutral-400 space-y-1">
                            ${notes.map(note => `<li class="flex gap-2"><span class="text-blue-400">•</span><span>${note}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

            const applyButton = output.querySelector('#apply-ai-collab-button');
            applyButton?.addEventListener('click', () => {
                document.getElementById('result-text').textContent = cleanPrompt;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'future-lab:ai-collab' }); }
                modalLogic.close();
            });
        } catch (error) {
            console.error('AI Collaboration failed', error);
            output.innerHTML = `<p class="text-red-400">Fehler bei der Kollaboration: ${error.message}</p>`;
        } finally {
            generateButton.disabled = false;
            buttonText?.classList.remove('hidden');
            loader?.classList.add('hidden');
        }
    });
}

function setupStoryArcDesigner() {
    const modal = document.getElementById('story-arc-modal');
    const openButton = document.getElementById('story-arc-button');
    const regenerateButton = modal?.querySelector('#story-arc-generate-button');
    const buttonText = modal?.querySelector('#story-arc-generate-text');
    const loader = modal?.querySelector('#story-arc-loader');
    const output = modal?.querySelector('#story-arc-output');

    if (!modal || !openButton || !regenerateButton || !output) return;

    const modalLogic = setupModal(modal, openButton);

    const generateArc = async () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) {
            output.innerHTML = `<p class="text-red-400">Bitte generiere zuerst einen Prompt.</p>`;
            return;
        }

        regenerateButton.disabled = true;
        buttonText?.classList.add('hidden');
        loader?.classList.remove('hidden');
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;

        try {
            const response = await callOpenRouterAPI(currentPrompt, STORY_ARC_DESIGNER_PROMPT);
            const [promptBlock, notesBlock] = response.split('---').map(section => section.trim());
            const cleanPrompt = promptBlock.replace(/^PROMPT:\s*/i, '').trim();
            const notes = (notesBlock || '').replace(/^ARC OUTLINE:\s*/i, '').split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

            output.innerHTML = `
                <div class="space-y-4">
                    <div class="bg-neutral-900/70 border border-blue-500/30 rounded-xl p-4">
                        <h3 class="text-sm font-semibold text-neutral-200 mb-2">Dramaturgischer Prompt</h3>
                        <pre class="whitespace-pre-wrap text-xs md:text-sm text-neutral-100" id="story-arc-result">${cleanPrompt}</pre>
                        <button id="apply-story-arc-button" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Prompt übernehmen</button>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-neutral-300 mb-2">Arc-Gliederung</h4>
                        <ul class="text-xs md:text-sm text-neutral-400 space-y-1">
                            ${notes.map(note => `<li class="flex gap-2"><span class="text-blue-400">•</span><span>${note}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

            const applyButton = output.querySelector('#apply-story-arc-button');
            applyButton?.addEventListener('click', () => {
                document.getElementById('result-text').textContent = cleanPrompt;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'future-lab:story-arc' }); }
                modalLogic.close();
            });
        } catch (error) {
            console.error('Story Arc Designer failed', error);
            output.innerHTML = `<p class="text-red-400">Fehler beim Erstellen des Story-Arcs: ${error.message}</p>`;
        } finally {
            regenerateButton.disabled = false;
            buttonText?.classList.remove('hidden');
            loader?.classList.add('hidden');
        }
    };

    openButton.addEventListener('click', generateArc);
    regenerateButton.addEventListener('click', generateArc);
}

function setupImmersiveSpace() {
    const modal = document.getElementById('immersive-space-modal');
    const openButton = document.getElementById('immersive-space-button');
    const presetsContainer = modal?.querySelector('#immersive-space-presets');
    const generateButton = modal?.querySelector('#run-immersive-space-button');
    const buttonText = modal?.querySelector('#run-immersive-space-text');
    const loader = modal?.querySelector('#immersive-space-loader');
    const output = modal?.querySelector('#immersive-space-output');

    if (!modal || !openButton || !presetsContainer || !generateButton || !output) return;

    const modalLogic = setupModal(modal, openButton);
    const presets = [
        { id: 'cathedral', label: 'Kathedralen-Halo', detail: 'riesige Hallfahnen & schwebende Chorhöhen' },
        { id: 'neon-club', label: 'Neon-Club', detail: 'eng umschließende Bässe & wandernde Laser-FX' },
        { id: 'skyline', label: 'Skyline Rooftop', detail: 'offene Höhenluft & Delay-Echos aus der Ferne' },
        { id: 'ocean-dome', label: 'Ocean Dome', detail: 'unterseeische Pulsationen & 360°-Waves' },
        { id: 'void-orbit', label: 'Void Orbit', detail: 'schwerelose Ambisonics & kreisende Synth-Orbits' }
    ];
    let selected = new Set();

    const renderPresets = () => {
        presetsContainer.innerHTML = '';
        presets.forEach(preset => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'text-left bg-neutral-900/60 border border-neutral-700 rounded-xl p-3 hover:border-blue-500/60 transition-colors';
            button.innerHTML = `<div class="text-sm font-semibold text-neutral-200">${preset.label}</div><div class="text-xs text-neutral-400 mt-1">${preset.detail}</div>`;
            button.addEventListener('click', () => {
                if (selected.has(preset.id)) {
                    selected.delete(preset.id);
                    button.classList.remove('border-blue-500/60', 'bg-blue-600/20');
                } else {
                    selected.add(preset.id);
                    button.classList.add('border-blue-500/60', 'bg-blue-600/20');
                }
            });
            presetsContainer.appendChild(button);
        });
    };

    openButton.addEventListener('click', () => {
        selected = new Set(['neon-club']);
        renderPresets();
        // Highlight default selection after render
        Array.from(presetsContainer.children).forEach((el, idx) => {
            const preset = presets[idx];
            if (selected.has(preset.id)) {
                el.classList.add('border-blue-500/60', 'bg-blue-600/20');
            }
        });
        output.innerHTML = `<p class="text-neutral-500 text-sm">Wähle eine oder mehrere Umgebungen, um ein immersives Klangfeld zu modellieren.</p>`;
    });

    generateButton.addEventListener('click', async () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) {
            output.innerHTML = `<p class="text-red-400">Bitte generiere zuerst einen Prompt.</p>`;
            return;
        }

        if (selected.size === 0) {
            output.innerHTML = `<p class="text-amber-300">Wähle mindestens eine Umgebung aus.</p>`;
            return;
        }

        generateButton.disabled = true;
        buttonText?.classList.add('hidden');
        loader?.classList.remove('hidden');
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;

        const selectedPresets = presets.filter(p => selected.has(p.id)).map(p => `${p.label}: ${p.detail}`).join('; ');
        const userQuery = `Base prompt: "${currentPrompt}"\nSpatial inspirations: ${selectedPresets}`;

        try {
            const response = await callOpenRouterAPI(userQuery, IMMERSIVE_SPACE_PROMPT);
            const [promptBlock, notesBlock] = response.split('---').map(section => section.trim());
            const cleanPrompt = promptBlock.replace(/^PROMPT:\s*/i, '').trim();
            const notes = (notesBlock || '').replace(/^SPACE DESIGN NOTES:\s*/i, '').split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

            output.innerHTML = `
                <div class="space-y-4">
                    <div class="bg-neutral-900/70 border border-blue-500/30 rounded-xl p-4">
                        <h3 class="text-sm font-semibold text-neutral-200 mb-2">Immersiver Prompt</h3>
                        <pre class="whitespace-pre-wrap text-xs md:text-sm text-neutral-100" id="immersive-space-result">${cleanPrompt}</pre>
                        <button id="apply-immersive-space-button" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Prompt übernehmen</button>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-neutral-300 mb-2">Raum-Notizen</h4>
                        <ul class="text-xs md:text-sm text-neutral-400 space-y-1">
                            ${notes.map(note => `<li class="flex gap-2"><span class="text-blue-400">•</span><span>${note}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

            const applyButton = output.querySelector('#apply-immersive-space-button');
            applyButton?.addEventListener('click', () => {
                document.getElementById('result-text').textContent = cleanPrompt;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'future-lab:immersive-space' }); }
                modalLogic.close();
            });
        } catch (error) {
            console.error('Immersive Space failed', error);
            output.innerHTML = `<p class="text-red-400">Fehler beim Gestalten des Klangraums: ${error.message}</p>`;
        } finally {
            generateButton.disabled = false;
            buttonText?.classList.remove('hidden');
            loader?.classList.add('hidden');
        }
    });
}

function setupHumanTouch() {
    const modal = document.getElementById('human-touch-modal');
    const openButton = document.getElementById('human-touch-button');
    const optionsContainer = modal?.querySelector('#human-touch-options');
    const generateButton = modal?.querySelector('#apply-human-touch-button');
    const buttonText = modal?.querySelector('#apply-human-touch-text');
    const loader = modal?.querySelector('#human-touch-loader');
    const output = modal?.querySelector('#human-touch-output');

    if (!modal || !openButton || !optionsContainer || !generateButton || !output) return;

    const modalLogic = setupModal(modal, openButton);
    const options = [
        { id: 'micro-swing', label: 'Micro-Swing', detail: 'leicht hinter der Beat-Mikrotiming' },
        { id: 'analog-dust', label: 'Analog-Dust', detail: 'Bandrauschen & leichte Saturation' },
        { id: 'human-vocals', label: 'Human Vox', detail: 'atmen, Ad-Libs & intime Layer' },
        { id: 'instrument-noise', label: 'Instrument Noise', detail: 'Fingergeräusche & Fret-Slides' },
        { id: 'dynamic-swell', label: 'Dynamic Swell', detail: 'manuelle Lautstärke-Wellen' }
    ];
    let selected = new Set(['micro-swing', 'analog-dust']);

    const renderOptions = () => {
        optionsContainer.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'text-left bg-neutral-900/60 border border-neutral-700 rounded-xl p-3 hover:border-blue-500/60 transition-colors';
            button.innerHTML = `<div class="text-sm font-semibold text-neutral-200">${option.label}</div><div class="text-xs text-neutral-400 mt-1">${option.detail}</div>`;
            if (selected.has(option.id)) {
                button.classList.add('border-blue-500/60', 'bg-blue-600/20');
            }
            button.addEventListener('click', () => {
                if (selected.has(option.id)) {
                    selected.delete(option.id);
                    button.classList.remove('border-blue-500/60', 'bg-blue-600/20');
                } else {
                    selected.add(option.id);
                    button.classList.add('border-blue-500/60', 'bg-blue-600/20');
                }
            });
            optionsContainer.appendChild(button);
        });
    };

    openButton.addEventListener('click', () => {
        selected = new Set(['micro-swing', 'analog-dust']);
        renderOptions();
        output.innerHTML = `<p class="text-neutral-500 text-sm">Markiere, welche organischen Nuancen du betonen möchtest.</p>`;
    });

    generateButton.addEventListener('click', async () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) {
            output.innerHTML = `<p class="text-red-400">Bitte generiere zuerst einen Prompt.</p>`;
            return;
        }

        if (selected.size === 0) {
            output.innerHTML = `<p class="text-amber-300">Wähle mindestens eine Nuance aus.</p>`;
            return;
        }

        generateButton.disabled = true;
        buttonText?.classList.add('hidden');
        loader?.classList.remove('hidden');
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;

        const selectedOptions = options.filter(o => selected.has(o.id)).map(o => `${o.label}: ${o.detail}`).join('; ');
        const userQuery = `Base prompt: "${currentPrompt}"\nHumanising cues: ${selectedOptions}`;

        try {
            const response = await callOpenRouterAPI(userQuery, HUMAN_TOUCH_PROMPT);
            const [promptBlock, notesBlock] = response.split('---').map(section => section.trim());
            const cleanPrompt = promptBlock.replace(/^PROMPT:\s*/i, '').trim();
            const notes = (notesBlock || '').replace(/^HUMAN TOUCH NOTES:\s*/i, '').split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

            output.innerHTML = `
                <div class="space-y-4">
                    <div class="bg-neutral-900/70 border border-blue-500/30 rounded-xl p-4">
                        <h3 class="text-sm font-semibold text-neutral-200 mb-2">Humanisierter Prompt</h3>
                        <pre class="whitespace-pre-wrap text-xs md:text-sm text-neutral-100" id="human-touch-result">${cleanPrompt}</pre>
                        <button id="apply-human-touch-result" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Prompt übernehmen</button>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-neutral-300 mb-2">Nuancen</h4>
                        <ul class="text-xs md:text-sm text-neutral-400 space-y-1">
                            ${notes.map(note => `<li class="flex gap-2"><span class="text-blue-400">•</span><span>${note}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

            const applyButton = output.querySelector('#apply-human-touch-result');
            applyButton?.addEventListener('click', () => {
                document.getElementById('result-text').textContent = cleanPrompt;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'future-lab:human-touch' }); }
                modalLogic.close();
            });
        } catch (error) {
            console.error('Human Touch failed', error);
            output.innerHTML = `<p class="text-red-400">Fehler beim Humanisieren: ${error.message}</p>`;
        } finally {
            generateButton.disabled = false;
            buttonText?.classList.remove('hidden');
            loader?.classList.add('hidden');
        }
    });
}

function setupReleaseForecast() {
    const modal = document.getElementById('release-forecast-modal');
    const openButton = document.getElementById('release-forecast-button');
    const timelineSelect = modal?.querySelector('#release-forecast-timeline');
    const leversContainer = modal?.querySelector('#release-forecast-levers');
    const generateButton = modal?.querySelector('#generate-release-forecast-button');
    const buttonText = modal?.querySelector('#generate-release-forecast-text');
    const loader = modal?.querySelector('#release-forecast-loader');
    const output = modal?.querySelector('#release-forecast-output');

    if (!modal || !openButton || !timelineSelect || !leversContainer || !generateButton || !output) return;

    const modalLogic = setupModal(modal, openButton);
    const levers = [
        { id: 'tiktok', label: 'TikTok / Shorts', detail: 'Kurzform-Teaser & Challenges' },
        { id: 'livestream', label: 'Livestream', detail: 'Premiere & Q&A mit Fans' },
        { id: 'playlist', label: 'Playlist Pitch', detail: 'Kuratoren & Editorial Pitch' },
        { id: 'press', label: 'Presse & Blogs', detail: 'Storytelling & Artist Statements' },
        { id: 'live', label: 'Live Drop', detail: 'Secret Gig oder Listening Session' }
    ];
    let selected = new Set(['tiktok', 'playlist']);

    const renderLevers = () => {
        leversContainer.innerHTML = '';
        levers.forEach(lever => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'text-left bg-neutral-900/60 border border-neutral-700 rounded-xl p-3 hover:border-blue-500/60 transition-colors';
            button.innerHTML = `<div class="text-sm font-semibold text-neutral-200">${lever.label}</div><div class="text-xs text-neutral-400 mt-1">${lever.detail}</div>`;
            if (selected.has(lever.id)) {
                button.classList.add('border-blue-500/60', 'bg-blue-600/20');
            }
            button.addEventListener('click', () => {
                if (selected.has(lever.id)) {
                    selected.delete(lever.id);
                    button.classList.remove('border-blue-500/60', 'bg-blue-600/20');
                } else {
                    selected.add(lever.id);
                    button.classList.add('border-blue-500/60', 'bg-blue-600/20');
                }
            });
            leversContainer.appendChild(button);
        });
    };

    openButton.addEventListener('click', () => {
        selected = new Set(['tiktok', 'playlist']);
        timelineSelect.value = '6';
        renderLevers();
        output.innerHTML = `<p class="text-neutral-500 text-sm">Lege deinen Zeitplan und die wichtigsten Kanäle für den Release fest.</p>`;
    });

    generateButton.addEventListener('click', async () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) {
            output.innerHTML = `<p class="text-red-400">Bitte generiere zuerst einen Prompt.</p>`;
            return;
        }

        if (selected.size === 0) {
            output.innerHTML = `<p class="text-amber-300">Wähle mindestens einen Kanal aus.</p>`;
            return;
        }

        generateButton.disabled = true;
        buttonText?.classList.add('hidden');
        loader?.classList.remove('hidden');
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;

        const timeline = timelineSelect.value;
        const focusLevers = levers.filter(l => selected.has(l.id)).map(l => `${l.label}: ${l.detail}`).join('; ');
        const userQuery = `Song Prompt: "${currentPrompt}"\nLaunch timeline (weeks): ${timeline}\nFocus channels: ${focusLevers}`;

        try {
            const response = await callOpenRouterAPI(userQuery, RELEASE_FORECAST_PROMPT);
            const [planBlock, tacticsBlock] = response.split('---').map(section => section.trim());
            const planLines = (planBlock || '').replace(/^PLAN:\s*/i, '').split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
            const tacticsLines = (tacticsBlock || '').replace(/^TACTICS:\s*/i, '').split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
            const planText = planLines.join('\n');
            const tacticsText = tacticsLines.join('\n');

            output.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <h3 class="text-sm font-semibold text-neutral-200 mb-2">Release-Plan</h3>
                        <ul class="text-xs md:text-sm text-neutral-300 space-y-1">
                            ${planLines.map(line => `<li class="flex gap-2"><span class="text-blue-400">•</span><span>${line}</span></li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-neutral-300 mb-2">Taktiken</h4>
                        <ul class="text-xs md:text-sm text-neutral-400 space-y-1">
                            ${tacticsLines.map(line => `<li class="flex gap-2"><span class="text-blue-400">•</span><span>${line}</span></li>`).join('')}
                        </ul>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <button id="copy-release-forecast-button" class="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Plan kopieren</button>
                        <button id="close-release-forecast-button" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Fertig</button>
                    </div>
                </div>
            `;

            const copyButton = output.querySelector('#copy-release-forecast-button');
            const closeButton = output.querySelector('#close-release-forecast-button');
            copyButton?.addEventListener('click', async () => {
                const payload = `Plan:\n${planText}\n\nTaktiken:\n${tacticsText}`;
                await safeCopyText(payload);
                copyButton.textContent = 'Kopiert!';
                setTimeout(() => { copyButton.textContent = 'Plan kopieren'; }, 2000);
            });
            closeButton?.addEventListener('click', () => {
                modalLogic.close();
            });
        } catch (error) {
            console.error('Release Forecast failed', error);
            output.innerHTML = `<p class="text-red-400">Fehler bei der Release-Planung: ${error.message}</p>`;
        } finally {
            generateButton.disabled = false;
            buttonText?.classList.remove('hidden');
            loader?.classList.add('hidden');
        }
    });
}

function setupGenreMixer() {
    const modal = document.getElementById('genre-mixer-modal');
    const openButton = document.getElementById('genre-mixer-button');
    const container = modal?.querySelector('#genre-selectors');
    const mixButton = modal?.querySelector('#mix-genres-button');
    const buttonText = modal?.querySelector('#mix-genres-button-text');
    const loader = modal?.querySelector('#mix-genres-loader');
    const output = modal?.querySelector('#genre-mixer-output');

    if (!modal || !openButton) return;

    const modalLogic = setupModal(modal, openButton);

    // Populate genre selectors
    if (container) {
        container.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const select = document.createElement('select');
            select.className = "genre-select w-full bg-neutral-900/70 border border-neutral-600 rounded-lg p-2 text-neutral-200 focus:ring-2 focus:ring-blue-500";
            const defaultOption = new Option(i === 0 ? "Wähle Genre 1" : `Genre ${i + 1} (optional)`, "");
            select.add(defaultOption);
            musicGenres.forEach(genre => select.add(new Option(genre, genre)));
            container.appendChild(select);
        }
    }

    if (mixButton) {
        mixButton.addEventListener('click', async () => {
            const selectedGenres = Array.from(modal.querySelectorAll('.genre-select')).map(s => s.value).filter(Boolean);
            if (selectedGenres.length === 0) {
                output.innerHTML = `<p class="text-red-400">Bitte wähle mindestens ein Genre aus.</p>`;
                return;
            }
            mixButton.disabled = true;
            buttonText.classList.add('hidden');
            loader.classList.remove('hidden');
            const prompt = `Rewrite this prompt: "${document.getElementById('result-text').textContent}" to also incorporate a mix of the following genres: ${selectedGenres.join(', ')}`;
            try {
                const response = await callOpenRouterAPI(prompt, GENRE_MIXER_PROMPT);
                document.getElementById('result-text').textContent = response;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'genre-mixer' }); }
                modalLogic.close();
            } catch (error) {
                output.innerHTML = `<p class="text-red-400">Fehler beim Mischen der Genres.</p>`;
            } finally {
                mixButton.disabled = false;
                buttonText.classList.remove('hidden');
                loader.classList.add('hidden');
            }
        });
    }
}

function setupKlugTagger(toolId, systemPrompt) {
    const modal = document.getElementById(`${toolId}-modal`);
    const openButton = document.getElementById(`${toolId}-button`);
    const suggestions = modal?.querySelector(`#${toolId}-suggestions`);

    // Handle special apply button id cases
    let applyId, applyTextId, applyLoaderId;
    switch (toolId) {
        case 'mood-analyzer':
            applyId = 'apply-mood-button';
            applyTextId = 'apply-mood-button-text';
            applyLoaderId = 'apply-mood-loader';
            break;
        case 'production-finish':
            applyId = 'apply-production-button';
            applyTextId = 'apply-production-text';
            applyLoaderId = 'apply-production-loader';
            break;
        case 'vocal-stylist':
            applyId = 'apply-vocal-style-button';
            applyTextId = 'apply-vocal-style-text';
            applyLoaderId = 'apply-vocal-style-loader';
            break;
        default:
            applyId = `apply-${toolId}-button`;
            applyTextId = `apply-${toolId}-text`;
            applyLoaderId = `apply-${toolId}-loader`;
    }

    const applyButton = modal?.querySelector(`#${applyId}`);
    const buttonText = modal?.querySelector(`#${applyTextId}`);
    const loader = modal?.querySelector(`#${applyLoaderId}`);

    if (!modal || !openButton || !suggestions || !applyButton) return;

    const modalLogic = setupModal(modal, openButton);

    openButton.addEventListener('click', async () => {
        selectedKlugItems = [];
        suggestions.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;
        try {
            const response = await callOpenRouterAPI(document.getElementById('result-text').textContent, systemPrompt);
            const items = response.split(',').map(item => item.trim()).filter(Boolean);
            suggestions.innerHTML = '';
            items.forEach(item => {
                const tag = document.createElement('button');
                tag.className = 'bg-neutral-800/20 hover:bg-white/10 text-neutral-200 py-2 px-4 rounded-full transition-colors duration-200 border border-white/5';
                tag.textContent = item;
                tag.onclick = () => {
                    const index = selectedKlugItems.indexOf(item);
                    if (index > -1) {
                        selectedKlugItems.splice(index, 1);
                        tag.classList.remove('bg-blue-600', 'text-white');
                    } else {
                        selectedKlugItems.push(item);
                        tag.classList.add('bg-blue-600', 'text-white');
                    }
                };
                suggestions.appendChild(tag);
            });
        } catch (error) {
            suggestions.innerHTML = `<p class="text-red-400">Fehler bei der Analyse: ${error.message}</p>`;
        }
    });

    applyButton.onclick = async () => {
        if (selectedKlugItems.length === 0) {
            modalLogic.close();
            return;
        }
        applyButton.disabled = true;
        buttonText.classList.add('hidden');
        loader.classList.remove('hidden');
        const prompt = `Original prompt: "${document.getElementById('result-text').textContent}". Integrate these elements: "${selectedKlugItems.join(', ')}".`;
        try {
            const refinedPrompt = await callOpenRouterAPI(prompt, PROMPT_REFINER_PROMPT);
            document.getElementById('result-text').textContent = refinedPrompt;
            if (window.QW) { window.QW.onPromptUpdated({ source: `klug:${toolId}` }); }
            modalLogic.close();
        } catch (error) {
            console.error("Failed to refine prompt", error);
        } finally {
            applyButton.disabled = false;
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    };
}

function setupHookGenerator() {
    const modal = document.getElementById('hook-generator-modal');
    const openButton = document.getElementById('hook-generator-button');
    const output = modal?.querySelector('#hook-generator-output');

    if (!modal || !openButton || !output) return;

    const modalLogic = setupModal(modal, openButton);

    openButton.addEventListener('click', async () => {
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;
        try {
            const response = await callOpenRouterAPI(document.getElementById('result-text').textContent, HOOK_GENERATOR_PROMPT);
            const [titlesPart, hooksPart] = response.split('---').map(s => s.trim());

            const createSuggestionElement = (text, type) => {
                const div = document.createElement('div');
                div.className = 'p-3 bg-neutral-800/20 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors';
                div.textContent = text.replace(/^- /, '');
                div.onclick = () => {
                    const resultText = document.getElementById('result-text');
                    resultText.textContent += (type === 'title' ? ` with the title "${div.textContent}"` : `, ${div.textContent}`);
                    modalLogic.close();
                };
                return div;
            };

            output.innerHTML = '';
            if (titlesPart) {
                const header = document.createElement('h3');
                header.className = 'text-base font-semibold text-neutral-300 mb-2';
                header.textContent = 'Titel-Ideen';
                output.appendChild(header);
                titlesPart.replace('TITLES:', '').trim().split('\n').forEach(title => output.appendChild(createSuggestionElement(title, 'title')));
            }
            if (hooksPart) {
                const header = document.createElement('h3');
                header.className = 'text-base font-semibold text-neutral-300 mt-4 mb-2';
                header.textContent = 'Hook-Ideen';
                output.appendChild(header);
                hooksPart.replace('HOOKS:', '').trim().split('\n').forEach(hook => output.appendChild(createSuggestionElement(hook, 'hook')));
            }
        } catch (error) {
            output.innerHTML = `<p class="text-red-400">Fehler beim Erstellen der Vorschläge: ${error.message}</p>`;
        }
    });
}

// Additional KLUG tool setup functions would continue here...
// (setupSongStructure, setupVibeEnhancer, setupArtistSuggester, setupTempoFinder)

function setupSongStructure() {
    const modal = document.getElementById('song-structure-modal');
    const openButton = document.getElementById('song-structure-button');
    const output = modal?.querySelector('#song-structure-output');

    if (!modal || !openButton || !output) return;

    const modalLogic = setupModal(modal, openButton);

    openButton.addEventListener('click', async () => {
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;
        try {
            const response = await callOpenRouterAPI(document.getElementById('result-text').textContent, SONG_STRUCTURE_PROMPT);
            const [structure, explanation] = response.split('---').map(s => s.trim());
            output.innerHTML = `
                <p class="font-mono text-blue-300 p-3 bg-neutral-900/70 rounded-lg">${structure}</p>
                <p class="text-neutral-400 pt-2">${explanation}</p>
                <div class="mt-4 border-t border-neutral-700/60 pt-4 flex justify-end">
                    <button id="integrate-structure-button" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press">In Prompt integrieren</button>
                </div>
            `;
            output.querySelector('#integrate-structure-button').onclick = async () => {
                const btn = output.querySelector('#integrate-structure-button');
                btn.textContent = '...'; btn.disabled = true;
                try {
                    const integratedPrompt = await callOpenRouterAPI(`Original prompt: "${document.getElementById('result-text').textContent}". Integrate this structure: "${structure}".`, STRUCTURE_INTEGRATOR_PROMPT);
                    document.getElementById('result-text').textContent = integratedPrompt;
                    if (window.QW) { window.QW.onPromptUpdated({ source: 'song-structure' }); }
                    modalLogic.close();
                } catch (error) {
                    btn.textContent = 'Fehler!';
                }
            };
        } catch (error) {
            output.innerHTML = `<p class="text-red-400">Fehler beim Erstellen des Struktur-Vorschlags: ${error.message}</p>`;
        }
    });
}

function setupVibeEnhancer() {
    const modal = document.getElementById('vibe-enhancer-modal');
    const openButton = document.getElementById('vibe-enhancer-button');
    const output = modal?.querySelector('#vibe-enhancer-output');

    if (!modal || !openButton || !output) return;

    const modalLogic = setupModal(modal, openButton);

    openButton.addEventListener('click', async () => {
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto col-span-2"></div>`;
        try {
            const originalPrompt = document.getElementById('result-text').textContent;
            const enhancedText = await callOpenRouterAPI(originalPrompt, VIBE_ENHANCER_PROMPT);
            output.innerHTML = `
                <div>
                    <h3 class="font-semibold text-neutral-300 mb-2">Original</h3>
                    <pre class="whitespace-pre-wrap text-sm text-neutral-400 p-3 bg-neutral-900/70 rounded-lg h-full">${originalPrompt}</pre>
                </div>
                <div>
                     <h3 class="font-semibold text-neutral-300 mb-2">Veredelt ✨</h3>
                    <pre class="whitespace-pre-wrap text-sm text-neutral-200 p-3 bg-neutral-900/70 rounded-lg border border-blue-500/30 h-full">${enhancedText}</pre>
                    <button id="apply-vibe-button" class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">Vorschlag übernehmen</button>
                </div>
            `;
            output.querySelector('#apply-vibe-button').onclick = () => {
                document.getElementById('result-text').textContent = enhancedText;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'vibe-enhancer' }); }
                modalLogic.close();
            };
        } catch (error) {
            output.innerHTML = `<p class="text-red-400 text-center col-span-2">Fehler beim Veredeln des Vibes: ${error.message}</p>`;
        }
    });
}

function setupArtistSuggester() {
    const modal = document.getElementById('artist-suggester-modal');
    const openButton = document.getElementById('artist-suggester-button');
    const output = modal?.querySelector('#artist-suggester-output');

    if (!modal || !openButton || !output) return;

    const modalLogic = setupModal(modal, openButton);

    openButton.addEventListener('click', async () => {
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;
        try {
            const response = await callOpenRouterAPI(document.getElementById('result-text').textContent, ARTIST_SUGGESTER_PROMPT);
            const suggestions = response.split('\n').filter(line => line.trim() !== '');
            output.innerHTML = '';
            suggestions.forEach(line => {
                const [artist, justification] = line.split(':').map(s => s.trim());
                if (!artist || !justification) return;
                const el = document.createElement('div');
                el.className = 'p-3 bg-neutral-800/20 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors';
                el.innerHTML = `<strong class="text-blue-400">${artist}</strong><p class="text-xs text-neutral-400">${justification}</p>`;
                el.onclick = () => {
                    document.getElementById('result-text').textContent += `, in the style of ${artist}`;
                    if (window.QW) { window.QW.onPromptUpdated({ source: 'artist-suggester' }); }
                    modalLogic.close();
                };
                output.appendChild(el);
            });
        } catch (error) {
            output.innerHTML = `<p class="text-red-400">Fehler bei der Künstlersuche: ${error.message}</p>`;
        }
    });
}

function setupTempoFinder() {
    const modal = document.getElementById('tempo-finder-modal');
    const openButton = document.getElementById('tempo-finder-button');
    const output = modal?.querySelector('#tempo-finder-output');

    if (!modal || !openButton || !output) return;

    const modalLogic = setupModal(modal, openButton);

    openButton.addEventListener('click', async () => {
        output.innerHTML = `<div class="animate-spin h-6 w-6 text-blue-400 mx-auto"></div>`;
        try {
            const response = await callOpenRouterAPI(document.getElementById('result-text').textContent, TEMPO_FINDER_PROMPT);
            const [tempo, bpm, _, explanation] = response.split(/---\n|\n/).map(s => s.trim());
            const bpmValue = bpm.split(': ')[1];
            output.innerHTML = `
                <p class="p-3 bg-neutral-900/70 rounded-lg"><span class="text-neutral-400">${tempo}</span> <strong class="text-blue-400 float-right">${bpm}</strong></p>
                <p class="text-neutral-400 pt-2">${explanation}</p>
                <div class="mt-4 border-t border-neutral-700/60 pt-4 flex justify-end">
                    <button class="add-bpm-button bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press">BPM hinzufügen</button>
                </div>
            `;
            output.querySelector('.add-bpm-button').onclick = () => {
                document.getElementById('result-text').textContent += `, ${bpmValue} bpm`;
                if (window.QW) { window.QW.onPromptUpdated({ source: 'tempo-finder' }); }
                modalLogic.close();
            };
        } catch (error) {
            output.innerHTML = `<p class="text-red-400">Fehler bei der Tempo-Suche: ${error.message}</p>`;
        }
    });
}

// === CUSTOM INSTRUCTION LOGIC ===
function setupCustomInstruction() {
    const modal = document.getElementById('custom-instruction-modal');
    const openButton = document.getElementById('custom-instruction-button');
    const input = document.getElementById('custom-instruction-input');
    const applyButton = document.getElementById('apply-custom-instruction-button');
    const buttonText = document.getElementById('apply-custom-instruction-text');
    const loader = document.getElementById('apply-custom-instruction-loader');

    if (!modal || !openButton || !applyButton) return;

    const modalLogic = setupModal(modal, openButton);

    applyButton.addEventListener('click', async () => {
        const instruction = input.value.trim();
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!instruction || !currentPrompt) return;

        applyButton.disabled = true;
        buttonText.classList.add('hidden');
        loader.classList.remove('hidden');

        const userQuery = `Base prompt: "${currentPrompt}"\nInstruction: "${instruction}"`;
        try {
            const refined = await callOpenRouterAPI(userQuery, CUSTOM_INSTRUCTION_PROMPT);
            document.getElementById('result-text').textContent = refined;
            if (window.QW) { window.QW.onPromptUpdated({ source: 'custom-instruction' }); }
            modalLogic.close();
        } catch (error) {
            console.error('Error with custom instruction:', error);
            input.value = "Ein Fehler ist aufgetreten.";
        } finally {
            applyButton.disabled = false;
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });
}

// Helper to detect genre based on keywords
function detectGenre(prompt) {
    if (!prompt) return "General";

    const lowerPrompt = prompt.toLowerCase();

    for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
        if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
            return genre;
        }
    }

    return "General";
}

// === GENRE EVOLUTION TIMELINE ===
function setupGenreEvolution() {
    const modal = document.getElementById('get-modal');
    const openButton = document.getElementById('get-button');
    const slider = document.getElementById('get-slider');
    const genreSelect = document.getElementById('get-genre-select');
    const decadeDisplay = document.getElementById('get-decade-display');
    const decadeDescription = document.getElementById('get-decade-description');
    const applyButton = document.getElementById('apply-get-button');
    const loadingOverlay = document.getElementById('get-loading-overlay');
    const loadingText = document.getElementById('get-loading-text');

    if (!modal || !openButton || !slider || !applyButton || !genreSelect) return;

    const modalLogic = setupModal(modal, openButton);

    const updateDecadeInfo = (decade, genre) => {
        decadeDisplay.textContent = `${decade}s`;

        let genreData = GENRE_EVOLUTION_DATA[genre];
        if (!genreData) genreData = GENRE_EVOLUTION_DATA["General"];

        const description = genreData[decade] || GENRE_EVOLUTION_DATA["General"][decade] || "Beschreibung nicht verfügbar.";
        decadeDescription.textContent = description;
    };

    // Update on slider change
    slider.addEventListener('input', (e) => {
        updateDecadeInfo(e.target.value, genreSelect.value);
    });

    // Update on genre change
    genreSelect.addEventListener('change', (e) => {
        updateDecadeInfo(slider.value, e.target.value);
    });

    // On open: detect genre and reset
    openButton.addEventListener('click', () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        const detectedGenre = detectGenre(currentPrompt);

        genreSelect.value = detectedGenre;
        slider.value = 2020;
        updateDecadeInfo(2020, detectedGenre);
    });

    applyButton.addEventListener('click', async () => {
        const currentPrompt = document.getElementById('result-text').textContent.trim();
        if (!currentPrompt) return;

        // Start Loading State
        applyButton.disabled = true;
        // applyButton.classList.add('opacity-0'); // Hide button content visually if needed, or just overlay
        loadingOverlay.classList.remove('hidden');

        const phases = [
            "Analysiere Vibe...",
            "Lade Zeitmaschine...",
            "Destilliere Ästhetik...",
            "Veredle Prompt..."
        ];

        let phaseIndex = 0;
        const phaseInterval = setInterval(() => {
            phaseIndex = (phaseIndex + 1) % phases.length;
            loadingText.textContent = phases[phaseIndex];
        }, 800);

        const selectedDecade = slider.value;
        const selectedGenre = genreSelect.value;
        const eraDescription = decadeDescription.textContent; // Use the text we are already showing

        const userQuery = `Base prompt: "${currentPrompt}"\nTarget Decade: ${selectedDecade}s\nGenre Context: ${selectedGenre}\nEra Characteristics: ${eraDescription}`;

        try {
            const refined = await callOpenRouterAPI(userQuery, GENRE_EVOLUTION_PROMPT);
            document.getElementById('result-text').textContent = refined;
            if (window.QW) { window.QW.onPromptUpdated({ source: 'get:timeline' }); }
            modalLogic.close();
        } catch (error) {
            console.error('Genre Evolution failed:', error);
            loadingText.textContent = "Fehler!";
            loadingText.classList.remove('text-blue-300');
            loadingText.classList.add('text-red-400');
        } finally {
            clearInterval(phaseInterval);
            applyButton.disabled = false;
            loadingOverlay.classList.add('hidden');
            loadingText.textContent = "Analysiere Vibe...";
            loadingText.classList.add('text-blue-300');
            loadingText.classList.remove('text-red-400');
        }
    });
}

// === STYLE SYNC STUDIO V2 LOGIC ===
function setupStyleSync() {
    const studioModal = document.getElementById('style-sync-studio');
    // We use the tile button from the main grid (id="style-sync-tile") to open it
    const openButton = document.getElementById('style-sync-tile');

    // Header & Actions
    const closeButton = document.getElementById('close-style-studio');

    // ### LEFT PANEL: ENCODER (Sound -> Image) ###
    const masterPromptDisplay = document.getElementById('studio-master-prompt-display');
    const transcodeBtn = document.getElementById('studio-transcode-btn');
    const visualPlaceholder = document.getElementById('studio-visual-placeholder');
    const visualResult = document.getElementById('studio-visual-result');

    // ### RIGHT PANEL: DECODER (Image -> Sound) ###
    const dropZone = document.getElementById('studio-drop-zone');
    const fileInput = document.getElementById('studio-file-input');
    const dropContent = document.getElementById('studio-drop-content');
    const dropPreview = document.getElementById('studio-drop-preview');
    const decodeBtn = document.getElementById('studio-decode-btn');
    const decodeResult = document.getElementById('studio-decode-result');
    const applyBtn = document.getElementById('studio-apply-btn');

    if (!studioModal || !openButton) return;

    // --- Modal Control ---
    const openStudio = () => {
        // Feed current prompt into the "Master Prompt" display
        const currentText = document.getElementById('result-text')?.textContent || '';
        if (masterPromptDisplay) masterPromptDisplay.textContent = currentText || '// Warten auf Input...';

        studioModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closeStudio = () => {
        studioModal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    openButton.addEventListener('click', openStudio);
    if (closeButton) closeButton.addEventListener('click', closeStudio);

    // ESC key closes the modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !studioModal.classList.contains('hidden')) {
            closeStudio();
        }
    });

    // --- ENCODER LOGIC (Text -> Image) ---
    // Guard against multiple event listener attachments
    if (transcodeBtn && !transcodeBtn.dataset.listenerAttached) {
        transcodeBtn.dataset.listenerAttached = 'true';
        transcodeBtn.addEventListener('click', async () => {
            const promptText = masterPromptDisplay.textContent;
            if (!promptText || promptText.startsWith('//')) {
                alert('Bitte erstelle zuerst einen Musik-Prompt im Hauptfenster.');
                return;
            }

            // Visual feedback
            transcodeBtn.classList.add('animate-pulse');
            visualPlaceholder.innerHTML = '<div class="animate-spin h-8 w-8 text-purple-400"></div><p class="text-xs text-purple-300 mt-2">Analysiere Klangspektrum...</p>';

            try {
                // 1. Translate Music Prompt -> Visual Description
                const visualPrompt = await callOpenRouterAPI(promptText, STYLE_SYNC_ENCODER_PROMPT);
                console.log('Visual Prompt:', visualPrompt);

                // 2. Generate Image via Fal.ai
                visualPlaceholder.innerHTML = '<div class="animate-spin h-8 w-8 text-indigo-400"></div><p class="text-xs text-indigo-300 mt-2">Rendere Archetyp...</p>';
                const imageUrl = await callFalAPI(visualPrompt);

                // 3. Show Result
                visualResult.src = imageUrl;
                visualResult.classList.remove('hidden');
                visualPlaceholder.classList.add('hidden');

            } catch (error) {
                console.error('Encoder Error:', error);
                visualPlaceholder.innerHTML = `<p class="text-red-400 text-xs text-center px-4">Fehler: ${error.message}</p>`;
            } finally {
                transcodeBtn.classList.remove('animate-pulse');
            }
        });
    }

    // --- DOWNLOAD & COPY BUTTONS ---
    const downloadBtn = document.getElementById('studio-download-btn');
    const copyBtn = document.getElementById('studio-copy-btn');

    if (downloadBtn && !downloadBtn.dataset.listenerAttached) {
        downloadBtn.dataset.listenerAttached = 'true';
        downloadBtn.addEventListener('click', async () => {
            if (!visualResult || visualResult.classList.contains('hidden') || !visualResult.src) {
                return;
            }
            try {
                const response = await fetch(visualResult.src);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `style-sync-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Download Error:', error);
                alert('Fehler beim Herunterladen des Bildes.');
            }
        });
    }

    if (copyBtn && !copyBtn.dataset.listenerAttached) {
        copyBtn.dataset.listenerAttached = 'true';
        copyBtn.addEventListener('click', async () => {
            if (!visualResult || visualResult.classList.contains('hidden') || !visualResult.src) {
                return;
            }
            try {
                const response = await fetch(visualResult.src);
                const blob = await response.blob();
                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob })
                ]);
                // Visual feedback
                copyBtn.classList.add('bg-green-500/50');
                setTimeout(() => copyBtn.classList.remove('bg-green-500/50'), 1000);
            } catch (error) {
                console.error('Copy Error:', error);
                alert('Fehler beim Kopieren. Bitte versuche es erneut.');
            }
        });
    }

    // --- DECODER LOGIC (Image -> Sound) ---

    // Drag & Drop Handling
    // Drag & Drop Handling
    if (dropZone && fileInput && !dropZone.dataset.listenerAttached) {
        dropZone.dataset.listenerAttached = 'true';

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('border-indigo-500', 'bg-indigo-500/10'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('border-indigo-500', 'bg-indigo-500/10'), false);
        });

        dropZone.addEventListener('drop', handleDrop, false);
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }

    function handleDrop(e) {
        // Prevent default behavior (prevent file from being opened)
        e.preventDefault();
        e.stopPropagation();

        const dt = e.dataTransfer;
        const files = dt.files;

        if (files && files.length > 0) {
            handleFiles(files);
        } else {
            // Try to extract image URL from dragged element (for internal drag & drop)
            const html = dt.getData('text/html');
            const dataUrl = dt.getData('text/uri-list');
            let imageUrl = null;

            if (html) {
                const match = html.match(/src="?([^"\s]+)"?/);
                if (match && match[1]) {
                    imageUrl = match[1];
                }
            } else if (dataUrl) {
                imageUrl = dataUrl;
            }

            if (imageUrl) {
                // Decode HTML entities if necessary (basic check)
                imageUrl = imageUrl.replace(/&amp;/g, '&');

                dropPreview.src = imageUrl;
                dropPreview.classList.remove('hidden');
                dropContent.classList.add('opacity-0');
                decodeBtn.disabled = false;

                // Store URL for API call (reusing dataset.base64 property for simplicity)
                dropZone.dataset.base64 = imageUrl;
            }
        }
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (!file.type.startsWith('image/')) return;

            // Check file size (max 5MB for fal.ai)
            const maxSizeMB = 5;
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                alert(`Die Datei ist zu groß (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximale Größe: ${maxSizeMB} MB.`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = function () {
                dropPreview.src = reader.result;
                dropPreview.classList.remove('hidden');
                dropContent.classList.add('opacity-0'); // Hide text but keep layout
                decodeBtn.disabled = false; // Enable decode button

                // Store base64 for API call
                dropZone.dataset.base64 = reader.result;
            }
            reader.readAsDataURL(file);
        }
    }

    // Decode Action
    if (decodeBtn) {
        decodeBtn.addEventListener('click', async () => {
            const base64Image = dropZone.dataset.base64;
            if (!base64Image) return;

            // UI Feedback
            decodeBtn.classList.add('animate-pulse');
            decodeResult.value = 'Höre mir das Bild an... analysiere Farben, Licht und Texturen...';

            try {
                // 1. Analyze Image -> Music Prompt
                // Use undefined handling for imageUrl in callOpenRouterAPI if it handles base64, 
                // BUT callOpenRouterAPI helper expects a URL. 
                // NOTE: OpenRouter vision models typically support URL. Sending Base64 data:image... 
                // directly as URL usually works for many providers or needs specific handling.
                // Re-reading api.js check: it sends { type: 'image_url', image_url: { url: imageUrl } }.
                // Data-URIs work with OpenAI-compatible Vision endpoints.

                const musicPrompt = await callOpenRouterAPI("Analysiere dieses Bild.", STYLE_SYNC_DECODER_PROMPT, base64Image);

                decodeResult.value = musicPrompt;

            } catch (error) {
                console.error('Decoder Error:', error);
                decodeResult.value = `Fehler bei der Analyse: ${error.message}`;
            } finally {
                decodeBtn.classList.remove('animate-pulse');
            }
        });
    }

    // Apply Action
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const generatedText = decodeResult.value;
            if (!generatedText || generatedText.startsWith('Fehler') || generatedText.startsWith('Höre')) return;

            // Insert into main app
            const mainInput = document.getElementById('idea-input');
            if (mainInput) {
                mainInput.value = generatedText;
                // Visual feedback
                applyBtn.innerHTML = '<span>Kopiert!</span> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" title="Check"><polyline points="20 6 9 17 4 12"/></svg>';
                setTimeout(() => {
                    applyBtn.innerHTML = '<span>APPLY TO PROMPT</span> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
                    // Close studio to show result
                    closeStudio();
                }, 1000);
            }
        });
    }
}

// === KLANG-STUDIO LOGIC ===
function setupKlangStudio() {
    const modal = document.getElementById('klang-studio-modal');
    const openTile = document.getElementById('klang-studio-tile');
    const closeBtn = document.getElementById('close-klang-studio');
    const tabs = document.querySelectorAll('#ks-module-tabs .ks-tab');
    const contentArea = document.getElementById('ks-content-area');
    const filterSlider = document.getElementById('ks-filter-slider');
    const filterLabel = document.getElementById('ks-filter-label');
    const blendRatioSlider = document.getElementById('ks-blend-ratio');
    const blendDisplay = document.getElementById('ks-blend-display');
    const blenderRatioSlider = document.getElementById('ks-blender-ratio');
    const blenderDisplay = document.getElementById('ks-blender-display');
    const instrumentSeats = document.querySelectorAll('.ks-instrument-seat');
    const dominanceSliders = document.querySelectorAll('.ks-dominance-slider');
    const copyBtn = document.getElementById('ks-copy-btn');
    const applyBtn = document.getElementById('ks-apply-btn');
    const tokenPreview = document.getElementById('ks-token-preview');
    const charCount = document.getElementById('ks-char-count');

    if (!modal || !openTile) return;

    // Prevent double initialization
    if (modal.dataset.ksInitialized === 'true') return;
    modal.dataset.ksInitialized = 'true';

    // Open Modal
    openTile.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        updateTokenPreview();
    });

    // Close Modal
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('bg-black/95')) {
            closeModal();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const module = tab.dataset.module;

            // Update tab active states
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding content
            const contents = contentArea.querySelectorAll('.ks-module-content');
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `ks-module-${module}`) {
                    content.classList.add('active');
                }
            });

            // Update token preview for new module
            updateTokenPreview();
        });
    });

    // Filter Slider Labels
    const filterLabels = {
        0: 'Sehr Dunkel',
        20: 'Dunkel',
        40: 'Warm-Dunkel',
        50: 'Warm-Mittig',
        60: 'Neutral-Offen',
        80: 'Hell-Offen',
        100: 'Sehr Hell'
    };

    const updateFilterLabel = () => {
        if (!filterSlider || !filterLabel) return;
        const value = parseInt(filterSlider.value);
        const thresholds = Object.keys(filterLabels).map(Number).sort((a, b) => a - b);
        let label = filterLabels[0];
        for (const threshold of thresholds) {
            if (value >= threshold) label = filterLabels[threshold];
        }
        filterLabel.textContent = label;
    };

    filterSlider?.addEventListener('input', () => {
        updateFilterLabel();
        updateTokenPreview();
    });

    // Blend Ratio Display
    const updateBlendDisplay = () => {
        if (!blendRatioSlider || !blendDisplay) return;
        const value = parseInt(blendRatioSlider.value);
        blendDisplay.textContent = `${value}% Synth / ${100 - value}% Blend`;
    };

    blendRatioSlider?.addEventListener('input', () => {
        updateBlendDisplay();
        updateTokenPreview();
    });

    // Blender Module Ratio Display
    const updateBlenderDisplay = () => {
        if (!blenderRatioSlider || !blenderDisplay) return;
        const value = parseInt(blenderRatioSlider.value);
        blenderDisplay.textContent = `${value}% Primär / ${100 - value}% Sekundär`;
    };

    blenderRatioSlider?.addEventListener('input', () => {
        updateBlenderDisplay();
        updateTokenPreview();
    });

    // Orchestra Instrument Seat Toggle
    instrumentSeats.forEach(seat => {
        seat.addEventListener('click', () => {
            seat.classList.toggle('active');
            updateTokenPreview();
        });
    });

    // Section Dominance Sliders
    dominanceSliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const valueDisplay = slider.parentElement.querySelector('.ks-dominance-value');
            if (valueDisplay) {
                valueDisplay.textContent = `${slider.value}%`;
            }
            updateTokenPreview();
        });
    });

    // Radio/checkbox changes trigger token preview update
    modal.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', updateTokenPreview);
    });

    // Select changes trigger token preview update
    modal.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', updateTokenPreview);
    });

    // Token Preview Generation
    function updateTokenPreview() {
        const activeTab = document.querySelector('#ks-module-tabs .ks-tab.active');
        const currentModule = activeTab?.dataset.module || 'synth';

        let token = '';

        if (currentModule === 'synth') {
            token = generateSynthToken();
        } else if (currentModule === 'orchestra') {
            token = generateOrchestraToken();
        } else if (currentModule === 'blender') {
            token = generateBlenderToken();
        } else {
            token = 'Module kommt in Phase 2...';
        }

        if (tokenPreview) tokenPreview.textContent = token;
        if (charCount) charCount.textContent = `${token.length} Zeichen`;

        // Update health indicator
        const healthEl = document.getElementById('ks-token-health');
        if (healthEl) {
            if (token.length < 50) {
                healthEl.textContent = 'Kurz';
                healthEl.className = 'text-yellow-400';
            } else if (token.length < 150) {
                healthEl.textContent = 'Optimal';
                healthEl.className = 'text-green-400';
            } else if (token.length < 250) {
                healthEl.textContent = 'Gut';
                healthEl.className = 'text-green-300';
            } else {
                healthEl.textContent = 'Ausführlich';
                healthEl.className = 'text-amber-400';
            }
        }
    }

    function generateSynthToken() {
        const waveform = modal.querySelector('input[name="ks-waveform"]:checked')?.value || 'sawtooth';
        const cutoff = modal.querySelector('input[name="ks-cutoff"]:checked')?.value || '8000';
        const envelope = modal.querySelector('input[name="ks-envelope"]:checked')?.value || 'pad';
        const effects = Array.from(modal.querySelectorAll('input[name="ks-effects"]:checked')).map(el => el.value);
        const blendSound = document.getElementById('ks-blend-sound')?.value || '';
        const blendRatio = parseInt(document.getElementById('ks-blend-ratio')?.value || 70);

        const waveformMap = {
            'sawtooth': 'sawtooth waveform synthesizer',
            'sine': 'smooth sine wave synthesizer',
            'triangle': 'mellow triangle wave synth',
            'square': 'punchy square wave synth'
        };

        const cutoffMap = {
            '2000': 'dark and muffled with low-pass filter below 2000Hz',
            '8000': 'warm low-pass filtered below 8000Hz',
            '15000': 'open filtered below 15000Hz',
            'none': 'full brightness with no filter'
        };

        const envelopeMap = {
            'percussive': 'short percussive attack',
            'pad': 'soft attack with long release',
            'plucky': 'plucky articulation with quick decay',
            'sustained': 'sustained hold with gradual release'
        };

        const effectsMap = {
            'reverb': 'drenched in reverb',
            'delay': 'with spacious delay',
            'chorus': 'with chorus modulation',
            'distortion': 'with subtle saturation',
            'phaser': 'with swirling phaser'
        };

        const parts = [];
        parts.push(waveformMap[waveform]);
        parts.push(cutoffMap[cutoff]);
        parts.push(envelopeMap[envelope]);
        effects.forEach(fx => parts.push(effectsMap[fx]));

        if (blendSound && blendRatio < 100) {
            const blendMap = {
                'native_flute': 'native American flute textures',
                'shakuhachi': 'shakuhachi flute tones',
                'duduk': 'duduk woodwind character',
                'sitar': 'sitar resonance',
                'erhu': 'erhu string overtones',
                'violin': 'violin streaks',
                'cello': 'cello warmth',
                'strings': 'string ensemble layers',
                'piano': 'piano tones',
                'organ': 'organ textures',
                'harp': 'harp glissando elements'
            };
            parts.push(`blended with ${100 - blendRatio}% ${blendMap[blendSound] || blendSound}`);
        }

        return parts.join(', ');
    }

    // === PRODUCER-QUALITY DESCRIPTOR LIBRARY ===
    const PRODUCER_DESCRIPTORS = {
        strings: [
            { max: 15, text: 'barely there, like distant memories of strings, subliminal warmth beneath the mix' },
            { max: 30, text: 'gossamer string textures weaving through silence, intimate and exposed' },
            { max: 50, text: 'warm string bed providing harmonic foundation, supportive yet unobtrusive' },
            { max: 70, text: 'lush string section with full body, legato phrases breathing naturally' },
            { max: 85, text: 'sweeping orchestral strings with cinematic depth, emotionally charged swells' },
            { max: 100, text: 'wall-of-sound string orchestra, dramatic and overwhelming, Zimmer-esque intensity' }
        ],
        woodwinds: [
            { max: 15, text: 'spectral woodwind whispers, atmospheric color barely perceptible' },
            { max: 30, text: 'soft flute motifs and oboe sighs, pastoral and dreamlike' },
            { max: 50, text: 'clarinet warmth and bassoon depth adding orchestral color' },
            { max: 70, text: 'expressive woodwind choir with distinct character, dance of reeds and air' },
            { max: 85, text: 'virtuosic woodwind passages cutting through the texture, melodically assertive' },
            { max: 100, text: 'blazing woodwind ensemble commanding attention, brilliant and urgent' }
        ],
        brass: [
            { max: 15, text: 'distant muted brass, like city sounds through fog' },
            { max: 30, text: 'warm french horn pads, golden and noble but restrained' },
            { max: 50, text: 'dignified brass chorale, rich low-end foundation with controlled power' },
            { max: 70, text: 'triumphant brass fanfares, majestic without overwhelming' },
            { max: 85, text: 'powerful brass section punching through the mix, bold and fearless' },
            { max: 100, text: 'thundering brass wall, apocalyptic power, unstoppable force of sound' }
        ],
        percussion: [
            { max: 15, text: 'barely audible percussion dust, felt more than heard' },
            { max: 30, text: 'soft timpani rolls and suspended cymbal shimmers, atmospheric bed' },
            { max: 50, text: 'steady rhythmic heartbeat, grounding the orchestral movement' },
            { max: 70, text: 'propulsive percussion patterns with impact, forward momentum' },
            { max: 85, text: 'explosive percussion hits and rhythmic fury, adrenaline-inducing' },
            { max: 100, text: 'earth-shaking percussion assault, primal and devastating' }
        ],
        hall: [
            { max: 15, text: 'completely dry, clinical clarity, every note surgically exposed' },
            { max: 35, text: 'controlled early reflections, professional studio ambience' },
            { max: 55, text: 'natural room sound, musicians breathing together in shared space' },
            { max: 75, text: 'spacious concert hall decay, orchestral warmth enveloping the listener' },
            { max: 90, text: 'vast reverberant space, notes dissolving into ethereal echoes' },
            { max: 100, text: 'endless reverb tail, sounds floating in cosmic space' }
        ],
        echo: [
            { max: 10, text: 'no delay, pure direct signal' },
            { max: 30, text: 'micro-delay adding thickness and dimension without obvious repeats' },
            { max: 50, text: 'musical delay patterns dancing with the arrangement' },
            { max: 70, text: 'layered echoes building atmospheric complexity' },
            { max: 90, text: 'deep trailing echoes, sounds ricocheting through vast spaces' },
            { max: 100, text: 'self-oscillating delay creating walls of repeated sound' }
        ],
        air: [
            { max: 20, text: 'dense and compact, instruments fighting for space' },
            { max: 40, text: 'controlled stereo field, intimate and direct' },
            { max: 60, text: 'natural spatial separation, each section with its place' },
            { max: 80, text: 'expansive stereo image, cinematic width and depth' },
            { max: 95, text: 'immersive soundscape stretching beyond the speakers' },
            { max: 100, text: 'overwhelming spatial experience, sounds arriving from everywhere' }
        ],
        warmth: [
            { max: 15, text: 'pristine and cold, digital clarity without color' },
            { max: 35, text: 'balanced tonal character, transparent and honest' },
            { max: 55, text: 'subtle analog coloration, slightly rounded transients' },
            { max: 75, text: 'tape-saturated warmth, rich harmonic overtones' },
            { max: 90, text: 'creamy analog saturation, musical compression' },
            { max: 100, text: 'heavily colored, thick and syrupy, dripping with character' }
        ],
        dynamics: [
            { max: 20, text: 'pianissimo whispers, fragile and delicate, on the edge of silence' },
            { max: 40, text: 'piano, gentle and introspective, restrained emotional weight' },
            { max: 60, text: 'mezzo-forte, balanced and natural, conversational dynamics' },
            { max: 80, text: 'forte, bold and assertive, confident musical statements' },
            { max: 100, text: 'fortissimo, powerful and intense, overwhelming emotional climax' }
        ]
    };

    const ARTICULATION_DESCRIPTORS = {
        'legato': 'seamlessly connected phrases, bow never leaving the string, breath never breaking',
        'staccato': 'precise rhythmic punctuation, notes like controlled bursts of energy',
        'pizzicato': 'plucked textures adding percussive sparkle and playful character',
        'weich': 'soft-focused tone, edges smoothed, intimate and vulnerable',
        'brilliant': 'crystalline clarity cutting through, present and articulate',
        'muted': 'veiled and mysterious, brass speaking in hushed tones',
        'open': 'full resonant brass speaking with authority and projection',
        'dezent': 'restrained percussion, subtle textural support',
        'dramatisch': 'dramatic percussion hits, impactful and theatrical'
    };

    const SOLO_DESCRIPTORS = {
        'violin': 'expressive solo violin singing above the orchestra, emotionally exposed',
        'flute': 'ethereal flute solo passages floating through the texture',
        'trumpet': 'heroic trumpet solo cutting through with brilliant clarity',
        'cello': 'rich cello solo weaving through the orchestral fabric, deeply resonant'
    };

    const PRESET_DESCRIPTORS = {
        'symphony': 'full symphony orchestra in traditional concert formation',
        'chamber': 'intimate chamber orchestra with crystalline transparency',
        'quartet': 'string quartet with intimate conversation between voices',
        'brass': 'brass ensemble with noble power and ceremonial grandeur',
        'woodwind': 'woodwind ensemble with pastoral charm and expressive color'
    };

    // === INSTRUMENTATION ANALYSIS SYSTEM ===
    const INSTRUMENT_CONFIG = {
        strings: {
            instruments: {
                'erste-violine': { name: 'first violins', role: 'melodic lead', register: 'high' },
                'zweite-violine': { name: 'second violins', role: 'harmonic support', register: 'high' },
                'viola': { name: 'violas', role: 'inner voice', register: 'mid' },
                'violoncello': { name: 'cellos', role: 'tenor line and bass', register: 'mid-low' },
                'kontrabass': { name: 'double basses', role: 'foundation', register: 'low' }
            },
            patterns: {
                full: 'complete string section from soaring first violins through rumbling double basses',
                upper: 'crystalline upper strings with shimmering high register focus',
                lower: 'rich lower strings providing warm, grounded foundation',
                violinsOnly: 'violin section in dual-voice harmony without lower strings',
                chamberCore: 'violin-viola-cello trio with chamber intimacy'
            }
        },
        woodwinds: {
            instruments: {
                'floete': { name: 'flutes', role: 'aerial melody', register: 'high' },
                'oboe': { name: 'oboes', role: 'expressive color', register: 'mid-high' },
                'klarinette': { name: 'clarinets', role: 'warm body', register: 'mid' },
                'fagott': { name: 'bassoons', role: 'bass foundation', register: 'low' }
            },
            patterns: {
                full: 'complete woodwind choir in classic double-wind formation',
                upper: 'airy high woodwinds with flute and oboe color',
                lower: 'dark woodwind voices with clarinet depth and bassoon foundation',
                solo: 'single woodwind voice with exposed, intimate character'
            }
        },
        brass: {
            instruments: {
                'horn': { name: 'french horns', role: 'noble warmth', register: 'mid' },
                'trompete': { name: 'trumpets', role: 'brilliant fanfare', register: 'high' },
                'posaune': { name: 'trombones', role: 'power and weight', register: 'mid-low' },
                'tuba': { name: 'tuba', role: 'bass anchor', register: 'low' }
            },
            patterns: {
                full: 'complete brass section with noble power from horn warmth to tuba depth',
                fanfare: 'brilliant brass fanfare with trumpets and horns',
                lowBrass: 'dark brass voices with trombone weight and tuba foundation',
                hornsOnly: 'warm french horn choir, golden and pastoral'
            }
        },
        percussion: {
            instruments: {
                'pauke': { name: 'timpani', role: 'rhythmic foundation', register: 'low' },
                'becken': { name: 'cymbals', role: 'dramatic color', register: 'high' }
            },
            patterns: {
                full: 'full percussion battery with timpani thunder and cymbal shimmer',
                timpaniOnly: 'timpani rolls providing rhythmic heartbeat and dramatic punctuation',
                sparse: 'minimal percussion adding subtle textural emphasis'
            }
        }
    };

    // Analyze which instruments are active in each section
    function getInstrumentationContext() {
        const sections = {};

        for (const [sectionName, sectionConfig] of Object.entries(INSTRUMENT_CONFIG)) {
            const activeInstruments = [];
            const totalInstruments = Object.keys(sectionConfig.instruments).length;
            let totalSeats = 0;
            let activeSeats = 0;

            for (const [instId, instInfo] of Object.entries(sectionConfig.instruments)) {
                // Count all seats for this instrument (there can be multiple)
                const seats = modal.querySelectorAll(`[data-instrument="${instId}"]`);
                const activeSeatsForInst = modal.querySelectorAll(`[data-instrument="${instId}"].active`);

                totalSeats += seats.length;
                activeSeats += activeSeatsForInst.length;

                if (activeSeatsForInst.length > 0) {
                    activeInstruments.push({
                        id: instId,
                        ...instInfo,
                        count: activeSeatsForInst.length,
                        total: seats.length
                    });
                }
            }

            sections[sectionName] = {
                active: activeInstruments,
                totalInstruments: totalInstruments,
                activeInstrumentTypes: activeInstruments.length,
                density: totalSeats > 0 ? activeSeats / totalSeats : 0,
                seatCount: { active: activeSeats, total: totalSeats }
            };
        }

        return sections;
    }

    // Generate intelligent descriptor based on instrumentation
    function getInstrumentationDescriptor(sectionName, sectionData) {
        const config = INSTRUMENT_CONFIG[sectionName];
        const active = sectionData.active;
        const density = sectionData.density;

        // No instruments active
        if (active.length === 0) {
            return null;
        }

        // All instruments active with high density
        if (sectionData.activeInstrumentTypes === sectionData.totalInstruments && density > 0.7) {
            return config.patterns.full;
        }

        // Section-specific pattern detection
        if (sectionName === 'strings') {
            const hasViolins = active.some(i => i.id.includes('violine'));
            const hasViolas = active.some(i => i.id === 'viola');
            const hasCellos = active.some(i => i.id === 'violoncello');
            const hasBasses = active.some(i => i.id === 'kontrabass');

            if (hasViolins && !hasCellos && !hasBasses) return config.patterns.upper;
            if ((hasCellos || hasBasses) && !hasViolins) return config.patterns.lower;
            if (hasViolins && !hasBasses && active.length <= 3) return config.patterns.chamberCore;
        }

        if (sectionName === 'woodwinds') {
            const hasFlutes = active.some(i => i.id === 'floete');
            const hasOboes = active.some(i => i.id === 'oboe');
            const hasClarinets = active.some(i => i.id === 'klarinette');
            const hasBassoons = active.some(i => i.id === 'fagott');

            if ((hasFlutes || hasOboes) && !hasClarinets && !hasBassoons) return config.patterns.upper;
            if ((hasClarinets || hasBassoons) && !hasFlutes && !hasOboes) return config.patterns.lower;
            if (active.length === 1) return `solo ${active[0].name} with exposed, intimate character`;
        }

        if (sectionName === 'brass') {
            const hasHorns = active.some(i => i.id === 'horn');
            const hasTrumpets = active.some(i => i.id === 'trompete');
            const hasTrombones = active.some(i => i.id === 'posaune');
            const hasTuba = active.some(i => i.id === 'tuba');

            if (hasHorns && hasTrumpets && !hasTrombones && !hasTuba) return config.patterns.fanfare;
            if ((hasTrombones || hasTuba) && !hasTrumpets) return config.patterns.lowBrass;
            if (hasHorns && active.length === 1) return config.patterns.hornsOnly;
        }

        if (sectionName === 'percussion') {
            const hasTimpani = active.some(i => i.id === 'pauke');
            const hasCymbals = active.some(i => i.id === 'becken');

            if (hasTimpani && !hasCymbals) return config.patterns.timpaniOnly;
            if (density < 0.5) return config.patterns.sparse;
        }

        // Fallback: generate from active instruments
        const names = active.map(i => i.name).join(', ');
        return `${names} providing ${density > 0.6 ? 'substantial' : 'selective'} ${sectionName} presence`;
    }

    // Get orchestra balance profile
    function getOrchestraBalanceProfile(instrumentation) {
        const sections = Object.entries(instrumentation);
        const activeSections = sections.filter(([_, data]) => data.active.length > 0);
        const densities = sections.map(([name, data]) => ({ name, density: data.density }));

        // Sort by density
        densities.sort((a, b) => b.density - a.density);

        if (activeSections.length === 0) return 'silent, no instruments active';
        if (activeSections.length === 4 && densities[0].density > 0.7) return 'grand full orchestral forces';

        const dominant = densities[0];
        if (dominant.density > 0.7 && densities[1].density < 0.4) {
            return `${dominant.name}-dominated texture`;
        }

        if (activeSections.length <= 2) {
            return `chamber texture with ${activeSections.map(([n]) => n).join(' and ')}`;
        }

        return 'balanced orchestral blend';
    }

    // Helper to get descriptor from value
    function getDescriptor(descriptorArray, value) {
        for (const desc of descriptorArray) {
            if (value <= desc.max) return desc.text;
        }
        return descriptorArray[descriptorArray.length - 1].text;
    }

    // Build rich orchestra context for AI refinement
    function getOrchestraContext() {
        const stringsVal = parseInt(document.getElementById('ks-strings-slider')?.value || 50);
        const woodwindsVal = parseInt(document.getElementById('ks-woodwinds-slider')?.value || 50);
        const brassVal = parseInt(document.getElementById('ks-brass-slider')?.value || 50);
        const percussionVal = parseInt(document.getElementById('ks-percussion-slider')?.value || 50);
        const hallVal = parseInt(document.getElementById('ks-hall-slider')?.value || 60);
        const echoVal = parseInt(document.getElementById('ks-echo-slider')?.value || 35);
        const airVal = parseInt(document.getElementById('ks-air-slider')?.value || 65);
        const warmthVal = parseInt(document.getElementById('ks-warmth-slider')?.value || 55);
        const dynamicsVal = parseInt(document.getElementById('ks-dynamics-slider')?.value || 60);

        const activePreset = modal.querySelector('.ks-orch-preset-btn.active');
        const preset = activePreset?.dataset.preset || 'symphony';

        const activeRoom = modal.querySelector('.ks-orch-room-btn.active');
        const roomName = activeRoom?.querySelector('.room-name')?.textContent || 'Konzert';

        // Gather articulations
        const articulations = [];
        modal.querySelectorAll('.ks-orch-tags .ks-orch-tag.active').forEach(tag => {
            const key = tag.dataset.tag?.toLowerCase();
            if (ARTICULATION_DESCRIPTORS[key]) {
                articulations.push(ARTICULATION_DESCRIPTORS[key]);
            }
        });

        // Solo instrument
        const soloInstrument = document.getElementById('ks-solo-instrument')?.value;
        const soloDesc = (soloInstrument && soloInstrument !== 'none') ? SOLO_DESCRIPTORS[soloInstrument] : null;

        // Get instrumentation analysis
        const instrumentation = getInstrumentationContext();
        const balanceProfile = getOrchestraBalanceProfile(instrumentation);

        // Generate intelligent section descriptors based on actual instrument seats
        const stringsInst = getInstrumentationDescriptor('strings', instrumentation.strings);
        const woodwindsInst = getInstrumentationDescriptor('woodwinds', instrumentation.woodwinds);
        const brassInst = getInstrumentationDescriptor('brass', instrumentation.brass);
        const percussionInst = getInstrumentationDescriptor('percussion', instrumentation.percussion);

        return {
            setup: {
                preset: PRESET_DESCRIPTORS[preset] || preset,
                room: roomName,
                balanceProfile: balanceProfile
            },
            sections: {
                // Use instrumentation descriptors if section has active instruments, otherwise use slider intensity
                strings: stringsInst || getDescriptor(PRODUCER_DESCRIPTORS.strings, stringsVal),
                woodwinds: woodwindsInst || getDescriptor(PRODUCER_DESCRIPTORS.woodwinds, woodwindsVal),
                brass: brassInst || getDescriptor(PRODUCER_DESCRIPTORS.brass, brassVal),
                percussion: percussionInst || getDescriptor(PRODUCER_DESCRIPTORS.percussion, percussionVal)
            },
            intensity: {
                // Keep slider values for intensity context
                strings: stringsVal,
                woodwinds: woodwindsVal,
                brass: brassVal,
                percussion: percussionVal
            },
            instrumentation: {
                // Raw instrumentation data for AI
                strings: instrumentation.strings,
                woodwinds: instrumentation.woodwinds,
                brass: instrumentation.brass,
                percussion: instrumentation.percussion
            },
            articulations: articulations,
            effects: {
                space: getDescriptor(PRODUCER_DESCRIPTORS.hall, hallVal),
                delay: getDescriptor(PRODUCER_DESCRIPTORS.echo, echoVal),
                width: getDescriptor(PRODUCER_DESCRIPTORS.air, airVal),
                character: getDescriptor(PRODUCER_DESCRIPTORS.warmth, warmthVal)
            },
            dynamics: getDescriptor(PRODUCER_DESCRIPTORS.dynamics, dynamicsVal),
            solo: soloDesc
        };
    }

    function generateOrchestraToken() {
        const context = getOrchestraContext();
        const parts = [];

        // Preset base
        parts.push(context.setup.preset);

        // Section descriptors
        parts.push(context.sections.strings);
        parts.push(context.sections.woodwinds);
        parts.push(context.sections.brass);
        parts.push(context.sections.percussion);

        // Articulations
        context.articulations.forEach(art => parts.push(art));

        // Solo
        if (context.solo) parts.push(context.solo);

        // Dynamics
        parts.push(context.dynamics);

        // Effects (only add distinctive ones)
        if (context.effects.space.includes('vast') || context.effects.space.includes('endless')) {
            parts.push(context.effects.space);
        }
        if (context.effects.character.includes('tape') || context.effects.character.includes('creamy')) {
            parts.push(context.effects.character);
        }

        return parts.join(', ');
    }

    // === NEW ORCHESTRA UI HANDLERS ===

    // Orchestra Preset Buttons
    const orchPresetBtns = modal.querySelectorAll('.ks-orch-preset-btn');
    orchPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            orchPresetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update seats based on preset
            updateOrchestraSeatsFromPreset(btn.dataset.preset);
            updateOrchestraTokenPreview();
            updateTokenPreview();
        });
    });

    // Orchestra Seat Toggle
    const orchSeats = modal.querySelectorAll('.ks-orch-seat-wide');
    orchSeats.forEach(seat => {
        seat.addEventListener('click', () => {
            seat.classList.toggle('active');
            updateOrchestraTokenPreview();
            updateTokenPreview();
        });
    });

    // Orchestra Section Sliders
    const orchSectionSliders = modal.querySelectorAll('.ks-orch-slider[data-section]');
    orchSectionSliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const section = slider.dataset.section;
            const valueDisplay = document.getElementById(`ks-${section}-value`);
            if (valueDisplay) {
                valueDisplay.textContent = `${slider.value}%`;
            }
            updateOrchestraTokenPreview();
            updateTokenPreview();
        });
    });

    // Orchestra Tags Toggle
    const orchTags = modal.querySelectorAll('.ks-orch-tag');
    orchTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Toggle within same group (find parent .ks-orch-tags)
            const tagGroup = tag.closest('.ks-orch-tags');
            if (tagGroup) {
                tagGroup.querySelectorAll('.ks-orch-tag').forEach(t => t.classList.remove('active'));
            }
            tag.classList.add('active');
            updateOrchestraTokenPreview();
            updateTokenPreview();
        });
    });

    // Room Acoustics Preset Buttons (with effect slider auto-update)
    const roomPresets = {
        'intimate': { hall: 20, echo: 10, air: 30, warmth: 70 },
        'concert': { hall: 60, echo: 35, air: 65, warmth: 55 },
        'cathedral': { hall: 90, echo: 70, air: 85, warmth: 40 },
        'studio': { hall: 10, echo: 5, air: 50, warmth: 50 }
    };

    const effectLabels = {
        hall: { 0: 'Trocken', 30: 'Dezent', 50: 'Warmer Saal', 70: 'Großer Raum', 90: 'Kathedrale' },
        echo: { 0: 'Kein Echo', 20: 'Subtiles Echo', 50: 'Moderates Echo', 70: 'Tiefes Echo' },
        air: { 0: 'Dicht', 30: 'Kompakt', 50: 'Neutral', 70: 'Offen-Transparent', 90: 'Luftig-Weit' },
        warmth: { 0: 'Kalt-Klar', 30: 'Neutral', 50: 'Warm-Mittig', 70: 'Warm-Analog', 90: 'Sehr Warm' }
    };

    function getEffectLabel(effect, value) {
        const labels = effectLabels[effect];
        const thresholds = Object.keys(labels).map(Number).sort((a, b) => a - b);
        let label = labels[0];
        for (const threshold of thresholds) {
            if (value >= threshold) label = labels[threshold];
        }
        return label;
    }

    const roomBtns = modal.querySelectorAll('.ks-orch-room-btn');
    roomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roomBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const room = btn.dataset.room;
            const preset = roomPresets[room];
            if (preset) {
                // Animate sliders to preset values
                animateSlider('ks-hall-slider', preset.hall);
                animateSlider('ks-echo-slider', preset.echo);
                animateSlider('ks-air-slider', preset.air);
                animateSlider('ks-warmth-slider', preset.warmth);
            }
            updateOrchestraTokenPreview();
            updateTokenPreview();
        });
    });

    function animateSlider(sliderId, targetValue) {
        const slider = document.getElementById(sliderId);
        const valueEl = document.getElementById(sliderId.replace('slider', 'value'));
        const labelEl = document.getElementById(sliderId.replace('slider', 'label'));

        if (!slider) return;

        const currentValue = parseInt(slider.value);
        const diff = targetValue - currentValue;
        const steps = 10;
        const stepValue = diff / steps;
        let step = 0;

        const animate = () => {
            step++;
            const newValue = Math.round(currentValue + (stepValue * step));
            slider.value = newValue;
            if (valueEl) valueEl.textContent = `${newValue}%`;

            // Update semantic label
            const effect = sliderId.replace('ks-', '').replace('-slider', '');
            if (labelEl) labelEl.textContent = getEffectLabel(effect, newValue);

            if (step < steps) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    // Effect Sliders Manual Update
    const effectSliders = modal.querySelectorAll('.ks-orch-slider.effect-slider');
    effectSliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const effect = slider.dataset.effect;
            const valueEl = document.getElementById(`ks-${effect}-value`);
            const labelEl = document.getElementById(`ks-${effect}-label`);

            if (valueEl) valueEl.textContent = `${slider.value}%`;
            if (labelEl) labelEl.textContent = getEffectLabel(effect, parseInt(slider.value));

            updateOrchestraTokenPreview();
            updateTokenPreview();
        });
    });

    // Update Orchestra Token Preview (terminal style)
    function updateOrchestraTokenPreview() {
        const tokenOutput = document.getElementById('ks-orch-token-output');
        if (!tokenOutput) return;

        const activePreset = modal.querySelector('.ks-orch-preset-btn.active');
        const preset = activePreset?.querySelector('.preset-name')?.textContent || 'Sinfonieorchester';

        const stringsVal = document.getElementById('ks-strings-slider')?.value || 80;
        const woodwindsVal = document.getElementById('ks-woodwinds-slider')?.value || 55;
        const brassVal = document.getElementById('ks-brass-slider')?.value || 40;
        const percussionVal = document.getElementById('ks-percussion-slider')?.value || 25;

        const activeRoom = modal.querySelector('.ks-orch-room-btn.active');
        const room = activeRoom?.querySelector('.room-name')?.textContent || 'Konzert';

        const activeTags = [];
        modal.querySelectorAll('.ks-orch-tags .ks-orch-tag.active').forEach(t => activeTags.push(t.textContent));

        const activeSeats = modal.querySelectorAll('.ks-orch-seat-wide.active').length;
        const totalSeats = modal.querySelectorAll('.ks-orch-seat-wide').length;

        tokenOutput.textContent = `> initializing_orchestration_engine...
> loading_preset: ${preset}
> adjusting_section_dynamics:
  strings(${stringsVal}%), woodwinds(${woodwindsVal}%)
  brass(${brassVal}%), percussion(${percussionVal}%)
> applying_articulations: ${activeTags.join(', ') || 'Standard'}
> room_acoustics: ${room}
> active_instruments: ${activeSeats}/${totalSeats}
> ready_for_prompt_generation...
> token_count: ${generateOrchestraToken().length}`;
    }

    // Preset to Seat Mapping
    function updateOrchestraSeatsFromPreset(preset) {
        const allSeats = modal.querySelectorAll('.ks-orch-seat-wide');

        const presetConfigs = {
            'symphony': () => allSeats.forEach(s => s.classList.add('active')),
            'chamber': () => {
                allSeats.forEach(s => s.classList.remove('active'));
                // Activate chamber orchestra instruments (full German names)
                const chamberIds = ['erste-violine', 'zweite-violine', 'viola', 'violoncello', 'floete', 'oboe', 'horn'];
                allSeats.forEach(s => {
                    if (chamberIds.includes(s.dataset.instrument)) s.classList.add('active');
                });
            },
            'quartet': () => {
                allSeats.forEach(s => s.classList.remove('active'));
                // Activate string quartet (full German names)
                const quartetIds = ['erste-violine', 'zweite-violine', 'viola', 'violoncello'];
                allSeats.forEach(s => {
                    if (quartetIds.includes(s.dataset.instrument)) s.classList.add('active');
                });
            },
            'brass': () => {
                allSeats.forEach(s => s.classList.remove('active'));
                // Activate brass section
                allSeats.forEach(s => {
                    if (s.dataset.section === 'brass') s.classList.add('active');
                });
            },
            'woodwind': () => {
                allSeats.forEach(s => s.classList.remove('active'));
                // Activate woodwind section
                allSeats.forEach(s => {
                    if (s.dataset.section === 'woodwinds') s.classList.add('active');
                });
            }
        };

        if (presetConfigs[preset]) {
            presetConfigs[preset]();
        }
    }

    // Initialize orchestra token preview on load
    setTimeout(() => {
        updateOrchestraTokenPreview();
    }, 100);

    function generateBlenderToken() {
        const primary = document.getElementById('ks-primary-sound')?.value || 'synth_lead';
        const secondary = document.getElementById('ks-secondary-sound')?.value || 'shakuhachi';
        const ratio = parseInt(document.getElementById('ks-blender-ratio')?.value || 60);
        const mode = modal.querySelector('input[name="ks-blend-mode"]:checked')?.value || 'harmonic';

        const soundNames = {
            'synth_pad': 'synth pad',
            'synth_lead': 'synth lead',
            'synth_bass': 'synth bass',
            'synth_pluck': 'synth pluck',
            'violin': 'violin',
            'cello': 'cello',
            'string_section': 'string section',
            'piano': 'piano',
            'organ': 'organ',
            'electric_piano': 'electric piano',
            'sitar': 'sitar',
            'shakuhachi': 'shakuhachi',
            'duduk': 'duduk',
            'pan_flute': 'pan flute',
            'native_flute': 'native flute',
            'erhu': 'erhu',
            'koto': 'koto',
            'flute': 'flute',
            'clarinet': 'clarinet',
            'saxophone': 'saxophone',
            'harp': 'harp',
            'guitar': 'guitar'
        };

        const modeMap = {
            'harmonic': 'harmonically blended',
            'contrast': 'contrasting textures',
            'layered': 'layered together',
            'freq_split': 'frequency-split fusion'
        };

        return `${soundNames[primary] || primary} and ${soundNames[secondary] || secondary} ${modeMap[mode]}, ${ratio}% primary ${100 - ratio}% secondary blend`;
    }

    // Copy Button
    copyBtn?.addEventListener('click', () => {
        const text = tokenPreview?.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Kopiert!';
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 1500);
        });
    });

    // Apply Button
    applyBtn?.addEventListener('click', () => {
        const token = tokenPreview?.textContent || '';
        const resultText = document.getElementById('result-text');

        if (resultText && token) {
            const currentPrompt = resultText.textContent.trim();
            const updatedPrompt = currentPrompt
                ? `${currentPrompt}, ${token}`
                : token;
            resultText.textContent = updatedPrompt;

            if (window.QW) {
                window.QW.onPromptUpdated({ source: 'klang-studio' });
            }
        }

        closeModal();
    });

    // Initialize labels on load
    updateFilterLabel();
    updateBlendDisplay();
    updateBlenderDisplay();

    // === NEW LAYOUT HANDLERS ===

    // Effect Buttons Toggle (triggers only, logic in Phase 2)
    const effectBtns = modal.querySelectorAll('.ks-effect-btn');
    effectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            updateTokenPreview();
        });
    });

    // Revert Button - reset all settings
    const revertBtn = document.getElementById('ks-revert-btn');
    revertBtn?.addEventListener('click', () => {
        // Reset waveform
        const sawtoothRadio = modal.querySelector('input[name="ks-waveform"][value="sawtooth"]');
        if (sawtoothRadio) sawtoothRadio.checked = true;

        // Reset cutoff
        const cutoff8k = modal.querySelector('input[name="ks-cutoff"][value="8000"]');
        if (cutoff8k) cutoff8k.checked = true;

        // Reset filter slider
        if (filterSlider) {
            filterSlider.value = 50;
            updateFilterLabel();
        }

        // Reset envelope
        const padEnvelope = modal.querySelector('input[name="ks-envelope"][value="pad"]');
        if (padEnvelope) padEnvelope.checked = true;

        // Reset blend
        const blendSelect = document.getElementById('ks-blend-sound');
        if (blendSelect) blendSelect.value = '';
        if (blendRatioSlider) {
            blendRatioSlider.value = 70;
            updateBlendDisplay();
        }

        // Reset effects
        effectBtns.forEach((btn, i) => {
            if (i < 2) btn.classList.add('active'); // Reverb & Echo on
            else btn.classList.remove('active');
        });

        updateTokenPreview();
    });

    // Decline Button - close without applying
    const declineBtn = document.getElementById('ks-decline-btn');
    declineBtn?.addEventListener('click', closeModal);

    // Accept Button - generate orchestral prompt and replace Meisterstück content
    const acceptBtn = document.getElementById('ks-accept-btn');
    acceptBtn?.addEventListener('click', async () => {
        const resultText = document.getElementById('result-text');

        // Show loading state
        const originalBtnText = acceptBtn.textContent;
        acceptBtn.textContent = '⏳ Generating...';
        acceptBtn.disabled = true;

        try {
            // Get rich orchestra context
            const context = getOrchestraContext();

            // Build structured input for AI refinement
            const orchestraInput = `Preset: ${context.setup.preset}
Room: ${context.setup.room}
Orchestra Balance: ${context.setup.balanceProfile}
Strings: ${context.sections.strings}
Woodwinds: ${context.sections.woodwinds}
Brass: ${context.sections.brass}
Percussion: ${context.sections.percussion}
Articulations: ${context.articulations.join(', ') || 'none specified'}
Solo: ${context.solo || 'none'}
Dynamics: ${context.dynamics}
Space: ${context.effects.space}
Delay: ${context.effects.delay}
Width: ${context.effects.width}
Character: ${context.effects.character}`;

            // Generate AI-refined orchestral prompt
            let finalPrompt;
            if (typeof callOpenRouterAPI === 'function' && typeof ORCHESTRA_REFINER_PROMPT !== 'undefined') {
                finalPrompt = await callOpenRouterAPI(orchestraInput, ORCHESTRA_REFINER_PROMPT);
            } else {
                // Fallback to live preview token if AI not available
                finalPrompt = generateOrchestraToken();
            }

            // ALWAYS replace Meisterstück content entirely
            if (resultText && finalPrompt) {
                resultText.textContent = finalPrompt;

                // Show the result container properly (same as generatePrompt)
                const initialState = document.getElementById('initial-state');
                const resultContainer = document.getElementById('result-container');
                const refinementControls = document.getElementById('refinement-controls');

                if (initialState) initialState.classList.add('hidden');
                if (resultContainer) {
                    resultContainer.classList.remove('hidden');
                    resultContainer.classList.add('fade-in');
                }
                if (refinementControls) refinementControls.classList.remove('hidden');
                if (typeof setKlugToolsState === 'function') setKlugToolsState(true);

                if (window.QW) {
                    window.QW.onPromptUpdated({ source: 'klang-studio-orchestra' });
                }
            }

            closeModal();
        } catch (error) {
            console.error('Orchestra AI processing failed:', error);
            // Fallback to non-AI token
            const fallbackToken = generateOrchestraToken();
            if (resultText && fallbackToken) {
                resultText.textContent = fallbackToken;

                // Show the result container properly
                const initialState = document.getElementById('initial-state');
                const resultContainer = document.getElementById('result-container');
                const refinementControls = document.getElementById('refinement-controls');

                if (initialState) initialState.classList.add('hidden');
                if (resultContainer) {
                    resultContainer.classList.remove('hidden');
                    resultContainer.classList.add('fade-in');
                }
                if (refinementControls) refinementControls.classList.remove('hidden');
                if (typeof setKlugToolsState === 'function') setKlugToolsState(true);
            }
            closeModal();
        } finally {
            acceptBtn.textContent = originalBtnText;
            acceptBtn.disabled = false;
        }
    });
}
