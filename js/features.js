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
    setupFutureLabTools();
    setupCustomInstruction();
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
