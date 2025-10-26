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
    setupImageStylePanel();
    setupExpertRefinements();
    setupKlugTools();
    setupCustomInstruction();
}

function injectPromptResultFromFeature(text, source = 'feature') {
    if (!text) return;
    const resultTextEl = document.getElementById('result-text');
    const resultContainer = document.getElementById('result-container');
    const initialState = document.getElementById('initial-state');
    const refinementControls = document.getElementById('refinement-controls');
    const errorContainer = document.getElementById('error-container');

    if (resultTextEl) {
        resultTextEl.textContent = text;
    }
    initialState?.classList.add('hidden');
    resultContainer?.classList.remove('hidden');
    resultContainer?.classList.add('fade-in');
    refinementControls?.classList.remove('hidden');
    errorContainer?.classList.add('hidden');
    setKlugToolsState(true);
    if (window.QW) {
        window.QW.onPromptUpdated({ source });
    }
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

// === IMAGE STYLE PANEL ===
function setupImageStylePanel() {
    const panel = document.getElementById('image-style-panel');
    if (!panel) return;

    if (panel.dataset.initialized === 'true') {
        if (typeof window.updateVisionAvailability === 'function') {
            window.updateVisionAvailability();
        }
        return;
    }
    panel.dataset.initialized = 'true';

    const dropzone = panel.querySelector('[data-role="image-dropzone"]');
    const fileInput = panel.querySelector('#image-upload-input');
    const triggerButton = panel.querySelector('#image-upload-trigger');
    const placeholder = panel.querySelector('#image-upload-placeholder');
    const preview = panel.querySelector('#image-upload-preview');
    const previewImg = panel.querySelector('#image-preview-img');
    const fileNameLabel = panel.querySelector('#image-file-name');
    const removeButton = panel.querySelector('#image-remove-button');
    const statusEl = panel.querySelector('#image-status');
    const summaryDetails = panel.querySelector('#image-summary-details');
    const summaryPre = panel.querySelector('#image-summary-debug');
    const disabledOverlay = panel.querySelector('#image-dropzone-disabled');
    const warningBadge = panel.querySelector('#image-vision-warning');

    const generateButton = panel.querySelector('#image-generate-button');
    const generateText = panel.querySelector('#image-generate-text');
    const generateLoader = panel.querySelector('#image-generate-loader');
    const adaptButton = panel.querySelector('#image-adapt-button');
    const adaptText = panel.querySelector('#image-adapt-text');
    const adaptLoader = panel.querySelector('#image-adapt-loader');

    let currentImage = null; // { dataUrl, base64, mime, name }
    let cachedSummary = null;
    let visionAvailable = false;

    const setStatus = (message = '', variant = 'info') => {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.remove('image-status-error', 'image-status-success');
        if (variant === 'error') {
            statusEl.classList.add('image-status-error');
        } else if (variant === 'success') {
            statusEl.classList.add('image-status-success');
        }
    };

    const updateSummaryUI = (summary) => {
        if (!summaryDetails || !summaryPre) return;
        if (!summary) {
            summaryDetails.classList.add('hidden');
            summaryPre.textContent = '';
        } else {
            summaryDetails.classList.remove('hidden');
            summaryPre.textContent = JSON.stringify(summary, null, 2);
        }
    };

    const toggleButtonDisabled = (button, disabled) => {
        if (!button) return;
        button.disabled = disabled;
        button.classList.toggle('opacity-50', disabled);
        button.classList.toggle('cursor-not-allowed', disabled);
    };

    const setButtonLoading = (button, textEl, loaderEl, isLoading) => {
        if (!button) return;
        button.disabled = isLoading;
        if (textEl) textEl.classList.toggle('hidden', isLoading);
        if (loaderEl) loaderEl.classList.toggle('hidden', !isLoading);
    };

    const updateActionStates = () => {
        const hasImage = !!currentImage;
        const hasPrompt = (document.getElementById('result-text')?.textContent.trim().length || 0) > 0;
        const disableGenerate = !visionAvailable || !hasImage;
        const disableAdapt = disableGenerate || !hasPrompt;
        toggleButtonDisabled(generateButton, disableGenerate);
        toggleButtonDisabled(adaptButton, disableAdapt);
    };

    const resetImage = () => {
        currentImage = null;
        cachedSummary = null;
        preview?.classList.add('hidden');
        placeholder?.classList.remove('hidden');
        if (previewImg) previewImg.src = '';
        if (fileNameLabel) fileNameLabel.textContent = '';
        updateSummaryUI(null);
        setStatus('Bild entfernt.', 'info');
        updateActionStates();
    };

    const parseVisionSummary = (text) => {
        if (!text) return null;
        let normalized = text.trim();
        if (normalized.startsWith('```')) {
            normalized = normalized.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        }
        try {
            return JSON.parse(normalized);
        } catch (err) {
            try {
                return JSON.parse(normalized.replace(/\n/g, ''));
            } catch (error) {
                console.warn('Konnte Vision-JSON nicht parsen:', text);
                return null;
            }
        }
    };

    const ensureVisionSummary = async () => {
        if (!currentImage) {
            throw new Error('Bitte lade zuerst ein Bild hoch.');
        }
        if (cachedSummary) {
            return cachedSummary;
        }
        setStatus('Analysiere Bild…');
        const response = await callOpenRouterVision({
            systemPrompt: IMAGE_SUMMARY_PROMPT,
            userPrompt: 'Respond with the requested JSON object describing the image for music prompt design.',
            imageBase64: currentImage.base64,
            imageMime: currentImage.mime,
            responseFormat: { type: 'json_object' },
            temperature: 0.1,
            maxTokens: 700
        });
        const summary = parseVisionSummary(response);
        if (!summary) {
            throw new Error('Die Bildanalyse konnte nicht interpretiert werden.');
        }
        cachedSummary = summary;
        updateSummaryUI(summary);
        return summary;
    };

    const handleFile = async (file) => {
        if (!file) return;
        if (!visionAvailable) {
            setStatus('Das aktuelle Modell kann keine Bilder interpretieren.', 'error');
            return;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            setStatus(`Datei ist zu groß (max. ${MAX_IMAGE_SIZE_MB} MB).`, 'error');
            return;
        }
        try {
            setStatus('Bereite Bild auf…');
            const prepared = await prepareImageForVision(file);
            currentImage = { ...prepared, name: file.name };
            cachedSummary = null;
            if (previewImg) previewImg.src = prepared.dataUrl;
            if (fileNameLabel) fileNameLabel.textContent = file.name || 'Bild';
            placeholder?.classList.add('hidden');
            preview?.classList.remove('hidden');
            updateSummaryUI(null);
            setStatus('Bild geladen. Starte die Analyse, um Stilhinweise zu erhalten.', 'success');
        } catch (error) {
            console.error('Fehler beim Vorbereiten des Bildes:', error);
            setStatus('Bild konnte nicht verarbeitet werden.', 'error');
            currentImage = null;
        }
        updateActionStates();
    };

    const handleGenerate = async () => {
        if (!visionAvailable) return;
        if (!currentImage) {
            setStatus('Bitte lade zuerst ein Bild hoch.', 'error');
            return;
        }
        try {
            setButtonLoading(generateButton, generateText, generateLoader, true);
            toggleButtonDisabled(adaptButton, true);
            const summary = await ensureVisionSummary();
            setStatus('Erzeuge neuen Suno-Stilprompt…');
            const payload = `IMAGE_ANALYSIS:\n${JSON.stringify(summary, null, 2)}`;
            const prompt = await callOpenRouterAPI(payload, IMAGE_TO_PROMPT_PROMPT);
            injectPromptResultFromFeature(prompt, 'image:new');
            setStatus('Neuer Prompt erfolgreich erstellt.', 'success');
        } catch (error) {
            console.error('Fehler beim Generieren aus Bild:', error);
            setStatus(error.message || 'Erstellung des Prompts fehlgeschlagen.', 'error');
        } finally {
            setButtonLoading(generateButton, generateText, generateLoader, false);
            updateActionStates();
        }
    };

    const handleAdapt = async () => {
        if (!visionAvailable) return;
        const currentPrompt = document.getElementById('result-text')?.textContent.trim();
        if (!currentImage) {
            setStatus('Bitte lade zuerst ein Bild hoch.', 'error');
            return;
        }
        if (!currentPrompt) {
            setStatus('Generiere zuerst einen Prompt, den du adaptieren kannst.', 'error');
            return;
        }
        try {
            setButtonLoading(adaptButton, adaptText, adaptLoader, true);
            toggleButtonDisabled(generateButton, true);
            const summary = await ensureVisionSummary();
            setStatus('Mappe Bildstimmung auf vorhandenen Prompt…');
            const payload = `EXISTING_PROMPT:\n${currentPrompt}\n\nIMAGE_ANALYSIS:\n${JSON.stringify(summary, null, 2)}`;
            const prompt = await callOpenRouterAPI(payload, IMAGE_PROMPT_ADAPTER_PROMPT);
            injectPromptResultFromFeature(prompt, 'image:adapt');
            setStatus('Prompt an das Bild angepasst.', 'success');
        } catch (error) {
            console.error('Fehler beim Adaptieren des Prompts:', error);
            setStatus(error.message || 'Adaptieren fehlgeschlagen.', 'error');
        } finally {
            setButtonLoading(adaptButton, adaptText, adaptLoader, false);
            updateActionStates();
        }
    };

    const applyVisionAvailability = () => {
        visionAvailable = !!(MODEL_CAPABILITIES?.[SELECTED_MODEL]?.vision);
        dropzone?.classList.toggle('dropzone-disabled', !visionAvailable);
        disabledOverlay?.classList.toggle('hidden', visionAvailable);
        warningBadge?.classList.toggle('hidden', visionAvailable);
        if (!visionAvailable) {
            setStatus('Das ausgewählte Modell unterstützt derzeit keine Bildverarbeitung.', 'error');
        } else if (currentImage) {
            setStatus('Bereit für Bildanalyse und Prompt-Erstellung.', 'success');
        } else {
            setStatus('Lade ein Bild hoch, um Bild → Stil zu starten.');
        }
        updateActionStates();
    };

    // File interactions
    triggerButton?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
        event.target.value = '';
    });

    dropzone?.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (!visionAvailable) return;
        dropzone.classList.add('ring-2', 'ring-blue-500/40');
    });

    dropzone?.addEventListener('dragleave', () => {
        dropzone.classList.remove('ring-2', 'ring-blue-500/40');
    });

    dropzone?.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('ring-2', 'ring-blue-500/40');
        if (!visionAvailable) return;
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            handleFile(file);
        }
    });

    removeButton?.addEventListener('click', resetImage);
    generateButton?.addEventListener('click', handleGenerate);
    adaptButton?.addEventListener('click', handleAdapt);

    // Observe prompt changes to update adapt button availability
    const resultTextEl = document.getElementById('result-text');
    if (resultTextEl) {
        const observer = new MutationObserver(() => updateActionStates());
        observer.observe(resultTextEl, { childList: true, subtree: true, characterData: true });
    }

    window.updateVisionAvailability = () => {
        applyVisionAvailability();
    };

    applyVisionAvailability();
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
            if(window.QW){ window.QW.onPromptUpdated({source:`expert:${type}`}); }
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
            if(window.QW){ window.QW.onPromptUpdated({source:'sound-engineer'}); }
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
            const defaultOption = new Option(i === 0 ? "Wähle Genre 1" : `Genre ${i+1} (optional)`, "");
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
                if(window.QW){ window.QW.onPromptUpdated({source:'genre-mixer'}); }
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
                tag.className = 'bg-neutral-700/50 hover:bg-neutral-700 text-neutral-200 py-1 px-3 rounded-full transition-colors duration-200';
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
        } catch(error) {
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
            if(window.QW){ window.QW.onPromptUpdated({source:`klug:${toolId}`}); }
            modalLogic.close();
        } catch(error) {
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
                div.className = 'p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors';
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
        } catch(error) {
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
                    if(window.QW){ window.QW.onPromptUpdated({source:'song-structure'}); }
                    modalLogic.close();
                } catch (error) {
                    btn.textContent = 'Fehler!';
                }
            };
        } catch(error) {
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
                if(window.QW){ window.QW.onPromptUpdated({source:'vibe-enhancer'}); }
                modalLogic.close();
            };
        } catch(error) {
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
                el.className = 'p-3 bg-neutral-700/50 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors';
                el.innerHTML = `<strong class="text-blue-400">${artist}</strong><p class="text-xs text-neutral-400">${justification}</p>`;
                el.onclick = () => {
                    document.getElementById('result-text').textContent += `, in the style of ${artist}`;
                    if(window.QW){ window.QW.onPromptUpdated({source:'artist-suggester'}); }
                    modalLogic.close();
                };
                output.appendChild(el);
            });
        } catch(error) {
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
                if(window.QW){ window.QW.onPromptUpdated({source:'tempo-finder'}); }
                modalLogic.close();
            };
        } catch(error) {
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
            if(window.QW){ window.QW.onPromptUpdated({source:'custom-instruction'}); }
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