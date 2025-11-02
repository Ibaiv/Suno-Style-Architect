// === DOM ELEMENTS ===
// API Setup elements
const apiSetupModal = document.getElementById('api-setup-modal');
const apiKeyInput = document.getElementById('api-key-input');
const modelSelect = document.getElementById('model-select');
const falApiKeyInput = document.getElementById('fal-api-key-input');
const falModelSelect = document.getElementById('fal-model-select');
const saveSettingsButton = document.getElementById('save-settings-button');
const settingsButton = document.getElementById('settings-button');
const changeSettingsButton = document.getElementById('change-settings-button');
const currentModelSpan = document.getElementById('current-model');
const mainApp = document.getElementById('main-app');

// Main app elements
const ideaInput = document.getElementById('idea-input');
const lyricInput = document.getElementById('lyric-input');
const generateButton = document.getElementById('generate-button');
const buttonText = document.getElementById('button-text');
const loader = document.getElementById('loader');
const generateIcon = document.getElementById('generate-icon');
const initialState = document.getElementById('initial-state');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const copyButton = document.getElementById('copy-button');
const copyIcon = document.getElementById('copy-icon');
const checkIcon = document.getElementById('check-icon');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');

// Refinement Elements
const refinementControls = document.getElementById('refinement-controls');
const sunoProButton = document.getElementById('suno-pro-button');
const sunoProText = document.getElementById('suno-pro-text');
const sunoProLoader = document.getElementById('suno-pro-loader');
const customInstructionButton = document.getElementById('custom-instruction-button');

// === API SETUP LOGIC ===
function loadSettings() {
    // Try multiple keys for compatibility
    const candidates = [
        localStorage.getItem('ssa_api_key'),
        localStorage.getItem('openrouter_api_key'),
        localStorage.getItem('OPENROUTER_API_KEY'),
        localStorage.getItem('api_key'),
    ];
    const savedKey = candidates.find(Boolean) || '';
    const savedModel = localStorage.getItem('selected_model') || 'openai/gpt-5-mini';

    // Load optional fal.ai settings
    const falCandidates = [
        localStorage.getItem('fal_api_key'),
        localStorage.getItem('FAL_API_KEY'),
    ];
    const savedFalKey = falCandidates.find(Boolean) || '';
    const savedFalModel = localStorage.getItem('fal_model') || 'fal-ai/fast-sdxl';
    FAL_API_KEY = savedFalKey;
    FAL_MODEL = savedFalModel;
    if (falApiKeyInput) falApiKeyInput.value = savedFalKey;
    if (falModelSelect) falModelSelect.value = savedFalModel;
    
    if (savedKey) {
        API_KEY = savedKey;
        SELECTED_MODEL = savedModel;
        // Normalize/persist preferred keys
        localStorage.setItem('openrouter_api_key', savedKey);
        localStorage.setItem('ssa_api_key', savedKey);
        apiKeyInput.value = savedKey;
        modelSelect.value = savedModel;
        currentModelSpan.textContent = MODEL_NAMES[savedModel] || savedModel;
        showMainApp();
    } else {
        // Show setup modal explicitly if not configured
        showSettings();
    }
}

function saveSettings() {
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    
    if (!apiKey) {
        alert('Bitte gib deinen OpenRouter API Key ein.');
        return;
    }
    
    if (!apiKey.startsWith('sk-or-v1-')) {
        alert('Der API Key sollte mit "sk-or-v1-" beginnen. Bitte überprüfe deinen Key.');
        return;
    }
    
    API_KEY = apiKey;
    SELECTED_MODEL = model;

    // Optional fal.ai settings
    const falKey = falApiKeyInput ? falApiKeyInput.value.trim() : '';
    const falModel = falModelSelect ? falModelSelect.value : FAL_MODEL;
    FAL_API_KEY = falKey;
    FAL_MODEL = falModel;
    
    localStorage.setItem('openrouter_api_key', apiKey);
    localStorage.setItem('ssa_api_key', apiKey);
    localStorage.setItem('selected_model', model);
    localStorage.setItem('fal_api_key', falKey);
    localStorage.setItem('fal_model', falModel);
    
    currentModelSpan.textContent = MODEL_NAMES[model] || model;
    showMainApp();
}

function showMainApp() {
    apiSetupModal.style.display = 'none';
    mainApp.style.display = 'block';
    // settingsButton may not exist in the DOM; guard access to avoid runtime errors
    if (settingsButton) settingsButton.classList.remove('hidden');
}

function showSettings() {
    apiSetupModal.style.display = 'flex';
    mainApp.style.display = 'none';
}

// === MAIN APP LOGIC ===
const setLoading = (isLoading) => {
    generateButton.disabled = isLoading;
    buttonText.textContent = isLoading ? 'Architektiere...' : 'Prompt Architektieren';
    loader.classList.toggle('hidden', !isLoading);
    generateIcon.classList.toggle('hidden', isLoading);
};

const showError = (message) => {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    initialState.classList.remove('hidden');
    resultContainer.classList.add('hidden');
};

const generatePrompt = async () => {
    const userInput = ideaInput.value.trim();
    const lyrics = (lyricInput && lyricInput.value) ? lyricInput.value.trim() : '';

    if (!userInput && !lyrics) {
        showError('Bitte gib eine Idee oder Lyrics ein.');
        return;
    }
    if (!API_KEY) {
        showError('Bitte konfiguriere zuerst deinen API Key in den Einstellungen.');
        showSettings();
        return;
    }

    let userMessage;
    if (userInput && lyrics) {
        userMessage = `${userInput}\n\n--- LYRICS ---\n${lyrics}`;
    } else if (lyrics) {
        userMessage = `--- LYRICS ---\n${lyrics}`;
    } else {
        userMessage = userInput;
    }

    setLoading(true);
    initialState.classList.add('hidden');
    resultContainer.classList.add('hidden');
    refinementControls.classList.add('hidden');
    errorContainer.classList.add('hidden');

    try {
        const generatedText = await callOpenRouterAPI(userMessage, BASE_SYSTEM_PROMPT);
        resultText.textContent = generatedText;
        resultContainer.classList.remove('hidden');
        resultContainer.classList.add('fade-in');
        refinementControls.classList.remove('hidden');
        setKlugToolsState(true);
        if(window.QW){ window.QW.onPromptUpdated({source:'generate'}); }
    } catch (error) {
        console.error("Error calling API:", error);
        showError(`Ein Fehler ist aufgetreten: ${error.message}.`);
        setKlugToolsState(false);
    } finally {
        setLoading(false);
    }
};

const setProLoading = (isLoading) => {
    const btn = sunoProButton;
    const text = sunoProText;
    const loader = sunoProLoader;
    btn.disabled = isLoading;
    text.classList.toggle('hidden', isLoading);
    loader.classList.toggle('hidden', !isLoading);
};

const refinePro = async () => {
    const currentPrompt = resultText.textContent.trim();
    if (!currentPrompt) return;
    setProLoading(true);
    sunoProButton.disabled = true;
    customInstructionButton.disabled = true;
    try {
        const refined = await callOpenRouterAPI(currentPrompt, SUNO_PRO_REFINER_PROMPT);
        // Hard clip to 1000 as an extra safeguard
        resultText.textContent = refined.slice(0, 1000);
    } catch (error) {
        console.error('Error refining for pro:', error);
        const originalText = sunoProText.textContent;
        sunoProText.textContent = 'Fehler';
        setTimeout(() => { sunoProText.textContent = originalText; }, 2000);
    } finally {
        setProLoading(false);
        sunoProButton.disabled = false;
        customInstructionButton.disabled = false;
    }
};

// === EVENT LISTENERS ===
// Setup listeners
saveSettingsButton.addEventListener('click', saveSettings);
changeSettingsButton.addEventListener('click', showSettings);
apiKeyInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter'){ e.preventDefault(); saveSettings(); }});

// Main app listeners
sunoProButton.addEventListener('click', refinePro);
generateButton.addEventListener('click', generatePrompt);
ideaInput.addEventListener('keydown', (e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), generatePrompt()));
ideaInput.addEventListener('input', () => errorContainer.classList.add('hidden'));
if (lyricInput) lyricInput.addEventListener('input', () => errorContainer.classList.add('hidden'));

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setKlugToolsState(false);
    setupCopyButton(copyButton, copyIcon, checkIcon, resultText);
});

